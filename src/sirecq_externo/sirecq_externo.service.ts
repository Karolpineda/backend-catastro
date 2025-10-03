import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateSirecqExternoDto } from './dto/create-sirecq_externo.dto';
import { UpdateSirecqExternoDto } from './dto/update-sirecq_externo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SirecqExterno } from './entities/sirecq_externo.entity';
import { Requerimiento } from 'src/requerimiento/entities/requerimiento.entity';
import { Dependencia } from 'src/dependencia/dependecia.entity';
import { Estado_requerimiento } from 'src/estado_requerimiento/entities/estado_requerimiento.entity';
import { Categoria } from 'src/categoria/categoria.entity';
import { Sistema } from 'src/sistema/sistema.entity';
import { Rol_Usuario } from '../users_rol/entities/users_rol.entity';
import { Versionamiento } from 'src/versionamiento/entities/versionamiento.entity';
import { RequerimientoVersion } from 'src/requerimiento-version/entities/requerimiento-version.entity';
import { UpdateSirecqExternoCompletoDto } from './dto/update-sireq_externo-completo.dto';
import { RequerimientoService } from 'src/requerimiento/requerimiento.service';

@Injectable()
export class SirecqExternoService {

  constructor(
    // Inyectar los repositorios necesarios
    @InjectRepository(SirecqExterno)
    private readonly sirecqExternoRepository: Repository<SirecqExterno>,
    @InjectRepository(Requerimiento)
    private readonly requerimientoRepository: Repository<Requerimiento>,
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<Dependencia>,
    @InjectRepository(Estado_requerimiento)
    private readonly estadoReqRepository: Repository<Estado_requerimiento>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Sistema)
    private readonly sistemaRepository: Repository<Sistema>,
    @InjectRepository(Rol_Usuario)
    private readonly rolUsuarioRepository: Repository<Rol_Usuario>,
    @InjectRepository(Versionamiento)
    private readonly versionamientoRepository: Repository<Versionamiento>,
    @InjectRepository(RequerimientoVersion)
    private readonly reqVersionRepository: Repository<RequerimientoVersion>,
    private readonly requerimientoService: RequerimientoService,

    private dataSource: DataSource

  ) {}

    async createSirecqExternoCompleto(
      createSirecqExternoDto: CreateSirecqExternoDto
    ): Promise<SirecqExterno> {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 1. VALIDAR QUE EL NÚMERO DE REQUERIMIENTO NO EXISTA
        const requerimientoExiste = await this.requerimientoRepository.findOne({
          where: { no_requerimiento: createSirecqExternoDto.requerimiento.no_requerimiento },
        });

        if (requerimientoExiste) {
          throw new HttpException(
            `El número de requerimiento ${createSirecqExternoDto.requerimiento.no_requerimiento} ya existe.`,
            HttpStatus.BAD_REQUEST,
          );
        }

        // 2. VALIDAR ENTIDADES RELACIONADAS DEL REQUERIMIENTO
        const [estado, categoria, sistema, rolUsuario] = await Promise.all([
          this.estadoReqRepository.findOne({ 
            where: { id_estado_requerimiento: createSirecqExternoDto.requerimiento.id_estado_requerimiento } 
          }),
          this.categoriaRepository.findOne({ 
            where: { id_categoria: createSirecqExternoDto.requerimiento.id_categoria } 
          }),
          this.sistemaRepository.findOne({ 
            where: { id_sistema: createSirecqExternoDto.requerimiento.id_sistema } 
          }),
          this.rolUsuarioRepository.findOne({ 
            where: { id_rol_usuario: createSirecqExternoDto.requerimiento.id_rol_usuario },
            relations: ['usuario'] 
          }),
        ]);

        if (!estado) throw new HttpException('Estado no encontrado', HttpStatus.NOT_FOUND);
        if (!categoria) throw new HttpException('Categoría no encontrada', HttpStatus.NOT_FOUND);
        if (!sistema) throw new HttpException('Sistema no encontrado', HttpStatus.NOT_FOUND);
        if (!rolUsuario) throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);

        // 3. VALIDAR DEPENDENCIA SI SE PROPORCIONA
        let dependencia: Dependencia | null = null;
        if (createSirecqExternoDto.id_dependencia) {
          dependencia = await this.dependenciaRepository.findOne({
            where: { id_dependencia: createSirecqExternoDto.id_dependencia }
          });

          if (!dependencia) {
            throw new HttpException(
              `Dependencia con ID ${createSirecqExternoDto.id_dependencia} no encontrada`,
              HttpStatus.NOT_FOUND
            );
          }
        }

        // 4. CREAR EL REQUERIMIENTO
        const requerimiento = this.requerimientoRepository.create({
          no_requerimiento: createSirecqExternoDto.requerimiento.no_requerimiento,
          documento: createSirecqExternoDto.requerimiento.documento,
          tema: createSirecqExternoDto.requerimiento.tema,
          descripcion: createSirecqExternoDto.requerimiento.descripcion,
          fase: createSirecqExternoDto.requerimiento.fase,
          fecha_registro: new Date(),
          estadoRequerimiento: estado,
          categoria: categoria,
          sistema: sistema,
          rolUsuario: rolUsuario,
        });

        const savedRequerimiento = await queryRunner.manager.save(requerimiento);

        // 5. CREAR VERSIÓN SI SE PROPORCIONA EN EL REQUERIMIENTO
        if (createSirecqExternoDto.requerimiento.versiones && 
            createSirecqExternoDto.requerimiento.versiones.length > 0) {
          
          const versionDto = createSirecqExternoDto.requerimiento.versiones[0];
          const versionData = {
            ...versionDto,
            num_version: versionDto.num_version || 1,
          };

          const versionInicial = this.versionamientoRepository.create(versionData);
          const savedVersion = await queryRunner.manager.save(versionInicial);

          const reqVersion = this.reqVersionRepository.create({
            requerimiento: savedRequerimiento,
            versionamiento: savedVersion,
          });

          await queryRunner.manager.save(reqVersion);
        }

        // 6. CREAR SIREQ_EXTERNO CON EL REQUERIMIENTO RECIÉN CREADO
        const sirecqExterno = this.sirecqExternoRepository.create({
          tramitepr: createSirecqExternoDto.tramitepr,
          seguimientoinst: createSirecqExternoDto.seguimientoinst,
          tramitecat: createSirecqExternoDto.tramitecat,
          observacionesgen: createSirecqExternoDto.observacionesgen,
          id_requerimiento: savedRequerimiento.id_requerimiento,
          requerimiento: savedRequerimiento,
          dependencia: dependencia?? undefined, // see next point
        });

        const savedSirecqExterno = await queryRunner.manager.save(sirecqExterno);

        await queryRunner.commitTransaction();

        // 7. RETORNAR SIREQ_EXTERNO COMPLETO CON TODAS LAS RELACIONES
        const sirecqExternoCompleto = await this.sirecqExternoRepository.findOne({
          where: { id_sirecq_externo: savedSirecqExterno.id_sirecq_externo },
          relations: [
            'requerimiento',
            'requerimiento.estadoRequerimiento',
            'requerimiento.categoria',
            'requerimiento.sistema',
            'requerimiento.rolUsuario',
            'requerimiento.rolUsuario.usuario',
            'requerimiento.requerimientoVersiones',
            'requerimiento.requerimientoVersiones.versionamiento',
            'dependencia'
          ],
        });
        if (!sirecqExternoCompleto) {
          throw new HttpException(
            `SirecqExterno con ID ${savedSirecqExterno.id_sirecq_externo} no encontrado`, HttpStatus.NOT_FOUND
          );
        }

        return sirecqExternoCompleto;

      } catch (error) {
        await queryRunner.rollbackTransaction();
        
        if (error instanceof HttpException) {
          throw error;
        }

        // Manejar errores de base de datos
        if (error.code === '23503') {
          throw new HttpException(
            'Error de integridad referencial. Verifique los IDs de las entidades relacionadas.',
            HttpStatus.BAD_REQUEST
          );
        }

        if (error.code === '23505') {
          throw new HttpException(
            'El número de requerimiento ya existe',
            HttpStatus.CONFLICT
          );
        }

        throw new HttpException(
          `Error al crear SirecqExterno completo: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      } finally {
        await queryRunner.release();
      }
    }

    async findAll(): Promise<SirecqExterno[]> {
      try {
        return await this.sirecqExternoRepository.find({
          relations: [
            'requerimiento',
            'requerimiento.estadoRequerimiento',
            'requerimiento.categoria',
            'requerimiento.sistema',
            'requerimiento.rolUsuario',
            'requerimiento.rolUsuario.usuario',
            'requerimiento.requerimientoVersiones',
            'requerimiento.requerimientoVersiones.versionamiento',
            'dependencia',
            'sirecqInterno'
          ],
          order: {
            createdAt: 'DESC'
          }
        });

      } catch (error) {
        throw new HttpException(
          `Error al obtener SirecqExternos: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

    async findOne(id_sirecq_externo: number): Promise<SirecqExterno> {
      try {
        const sirecqExterno = await this.sirecqExternoRepository.findOne({
          where: { id_sirecq_externo },
          relations: [
            'requerimiento',
            'requerimiento.estadoRequerimiento',
            'requerimiento.categoria',
            'requerimiento.sistema',
            'requerimiento.rolUsuario',
            'requerimiento.rolUsuario.usuario',
            'requerimiento.requerimientoVersiones',
            'requerimiento.requerimientoVersiones.versionamiento',
            'dependencia',
            'sirecqInterno'
          ],
        });

        if (!sirecqExterno) {
          throw new HttpException(
            `SirecqExterno con ID ${id_sirecq_externo} no encontrado`,
            HttpStatus.NOT_FOUND
          );
        }

        return sirecqExterno;

      } catch (error) {
        if (error instanceof HttpException) throw error;
        throw new HttpException(
          `Error al obtener SirecqExterno: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

      async findByRequerimiento(id_requerimiento: number): Promise<SirecqExterno | null> {
        try {
          return await this.sirecqExternoRepository.findOne({
            where: { id_requerimiento },
            relations: [
              'requerimiento',
              'dependencia',
              'sirecqInterno'
            ],
          });
        } catch (error) {
          throw new HttpException(
            `Error al buscar SirecqExterno por requerimiento: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }

     async updateCompleto(
  id_sirecq_externo: number,
  updateCompletoDto: UpdateSirecqExternoCompletoDto & { versionamiento?: any } // 🆕 Agregar versionamiento aquí
): Promise<SirecqExterno> {
  try {
    // 1. Obtener SirecqExterno con su requerimiento
    const sirecqExterno = await this.sirecqExternoRepository.findOne({
      where: { id_sirecq_externo },
      relations: ['requerimiento', 'dependencia']
    });

    if (!sirecqExterno) {
      throw new HttpException('SirecqExterno no encontrado', HttpStatus.NOT_FOUND);
    }

    if (!sirecqExterno.requerimiento) {
      throw new HttpException('Requerimiento asociado no encontrado', HttpStatus.BAD_REQUEST);
    }

    // 2. Actualizar SirecqExterno si viene en el DTO
    if (updateCompletoDto.sirecqExterno) {
      await this.actualizarSirecqExterno(
        sirecqExterno, 
        updateCompletoDto.sirecqExterno
      );
    }

    // 3. 🆕 PREPARAR DATOS PARA REQUERIMIENTO INCLUYENDO VERSIONAMIENTO
    const datosRequerimiento: any = { ...updateCompletoDto.requerimiento };
    
    // Si hay versionamiento en el nivel principal, agregarlo al requerimiento
    if (updateCompletoDto.versionamiento) {
      datosRequerimiento.versionamiento = updateCompletoDto.versionamiento;
    }

    // 4. ✅ ACTUALIZAR REQUERIMIENTO USANDO EL SERVICIO EXISTENTE
    if (updateCompletoDto.requerimiento || updateCompletoDto.versionamiento) {
      await this.requerimientoService.updateRequerimiento(
        sirecqExterno.requerimiento.id_requerimiento,
        datosRequerimiento
      );
    }

    // 5. Retornar SirecqExterno actualizado
    const sirecqExternoActualizado = await this.sirecqExternoRepository.findOne({
      where: { id_sirecq_externo },
      relations: [
        'requerimiento',
        'requerimiento.estadoRequerimiento',
        'requerimiento.categoria',
        'requerimiento.sistema',
        'requerimiento.rolUsuario',
        'requerimiento.rolUsuario.usuario',
        'requerimiento.requerimientoVersiones',
        'requerimiento.requerimientoVersiones.versionamiento',
        'dependencia',
        'sirecqInterno'
      ],
    });

    if (!sirecqExternoActualizado) {
      throw new HttpException(`SirecqExterno con ID ${id_sirecq_externo} no encontrado`, HttpStatus.NOT_FOUND);
    }

    return sirecqExternoActualizado;
  } catch (error) {
    throw new HttpException(
      `Error al actualizar completo: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

      private async actualizarSirecqExterno(
        sirecqExterno: SirecqExterno,
        updateDto: UpdateSirecqExternoDto
      ): Promise<void> {
        
        // Validar dependencia si se proporciona
        if (updateDto.id_dependencia !== undefined) {
          let dependencia: Dependencia | null = null;
          
          if (updateDto.id_dependencia !== null) {
            dependencia = await this.dependenciaRepository.findOne({
              where: { id_dependencia: updateDto.id_dependencia }
            });
            
            if (!dependencia) {
              throw new HttpException('Dependencia no encontrada', HttpStatus.NOT_FOUND);
            }
          }
          sirecqExterno.dependencia = dependencia;
        }

        // Actualizar campos de SirecqExterno
        const camposSirecq = ['tramitepr', 'seguimientoinst', 'tramitecat', 'observacionesgen'];
        
        camposSirecq.forEach(campo => {
          if (updateDto[campo] !== undefined) {
            sirecqExterno[campo] = updateDto[campo];
          }
        });

        sirecqExterno.updatedAt = new Date();
        await this.sirecqExternoRepository.save(sirecqExterno);
      }


  remove(id: number) {
    return `This action removes a #${id} sirecqExterno`;
  }
}
