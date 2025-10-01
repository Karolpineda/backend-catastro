// requerimiento.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Requerimiento } from './entities/requerimiento.entity';
import { Versionamiento } from 'src/versionamiento/entities/versionamiento.entity';
import { RequerimientoVersion } from 'src/requerimiento-version/entities/requerimiento-version.entity';
import { Estado_requerimiento } from 'src/estado_requerimiento/entities/estado_requerimiento.entity';
import { Categoria } from 'src/categoria/categoria.entity';
import { Sistema } from 'src/sistema/sistema.entity';
import { Rol_Usuario } from '../users_rol/entities/users_rol.entity';
import { CreateRequerimientoDto } from './dto/create-requerimiento.dto';
import { UpdateRequerimientoDto } from './dto/update-requerimiento.dto';
import { AddVersionDto } from 'src/versionamiento/dto/add-version.dto';

@Injectable()
export class RequerimientoService {
  constructor(
    @InjectRepository(Requerimiento)
    private readonly requerimientoRepository: Repository<Requerimiento>,
    @InjectRepository(Versionamiento)
    private readonly versionamientoRepository: Repository<Versionamiento>,
    @InjectRepository(RequerimientoVersion)
    private readonly reqVersionRepository: Repository<RequerimientoVersion>,
    @InjectRepository(Estado_requerimiento)
    private readonly estadoReqRepository: Repository<Estado_requerimiento>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Sistema)
    private readonly sistemaRepository: Repository<Sistema>,
    @InjectRepository(Rol_Usuario)
    private readonly rolUsuarioRepository: Repository<Rol_Usuario>,
    private dataSource: DataSource,
  ) {}

  // Obtener todos los datos para los dropdowns
 async getDropdownData() {
    try {
      const [estados, categorias, sistemas, analistas] = await Promise.all([
        this.estadoReqRepository.find({ order: { nombre_estado_requerimiento: 'ASC' } }),
        this.categoriaRepository.find({ order: { nom_categoria: 'ASC' } }),
        this.sistemaRepository.find({ order: { nom_sistema: 'ASC' } }),
        this.getAnalistasCatastrales(), // Usuarios con rol id = 2
      ]);

      return {
        estados,
        categorias,
        sistemas,
        analistas,
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener datos para formulario: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Obtener analistas catastrales (rol id = 2)
  private async getAnalistasCatastrales() {
  return this.rolUsuarioRepository
    .createQueryBuilder('rolUsuario')
    .innerJoinAndSelect('rolUsuario.usuario', 'usuario')
    .where('rolUsuario.id_rol = :idRol', { idRol: 2 })
    .select([
      'rolUsuario.id_rol_usuario',
      'rolUsuario.id_usuario',
      'rolUsuario.id_rol',
      'usuario.id_usuario',
      'usuario.nombre_usuario',
      'usuario.apellidos_usuario',

    ])
    .getMany();
}

  // Crear requerimiento completo con versión inicial automática
  async createRequerimientoCompleto(createDto: CreateRequerimientoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar que existan todas las entidades relacionadas
      const [estado, categoria, sistema, rolUsuario] = await Promise.all([
        this.estadoReqRepository.findOne({ 
          where: { id_estado_requerimiento: createDto.id_estado_requerimiento } 
        }),
        this.categoriaRepository.findOne({ 
          where: { id_categoria: createDto.id_categoria } 
        }),
        this.sistemaRepository.findOne({ 
          where: { id_sistema: createDto.id_sistema } 
        }),
        this.rolUsuarioRepository.findOne({ 
          where: { id_rol_usuario: createDto.id_rol_usuario },
          relations: ['usuario'] 
        }),
      ]);

      if (!estado) throw new HttpException('Estado no encontrado', HttpStatus.NOT_FOUND);
      if (!categoria) throw new HttpException('Categoría no encontrada', HttpStatus.NOT_FOUND);
      if (!sistema) throw new HttpException('Sistema no encontrado', HttpStatus.NOT_FOUND);
      if (!rolUsuario) throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);

      // 2. Crear el requerimiento

      const requerimientoExiste = await this.requerimientoRepository.findOne({
        where: { no_requerimiento: createDto.no_requerimiento },
      });
      if (requerimientoExiste) {
        throw new HttpException(
          `El número de requerimiento ${createDto.no_requerimiento} ya existe.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const requerimiento = this.requerimientoRepository.create({
        no_requerimiento: createDto.no_requerimiento,
        documento: createDto.documento,
        tema: createDto.tema,
        descripcion: createDto.descripcion,
        fase: createDto.fase,
        prioridad: createDto.prioridad,
        fecha_registro: new Date(),
        estadoRequerimiento: estado,
        categoria: categoria,
        sistema: sistema,
        rolUsuario: rolUsuario,
      });
      const savedRequerimiento = await queryRunner.manager.save(requerimiento);

      // 3. Crear versión inicial automática v1
      if (createDto.versiones && createDto.versiones.length > 0) {
      const versionDto = createDto.versiones[0]; // Tomar la primera versión
      
      // En tu servicio, usa esto:
      const versionData = {
        ...versionDto,
        num_version: versionDto.num_version || 1,
      };

      const versionInicial = this.versionamientoRepository.create(versionData);
      const savedVersion = await queryRunner.manager.save(versionInicial);

      // Crear relación en tabla de rompimiento
      const reqVersion = this.reqVersionRepository.create({
        requerimiento: savedRequerimiento,
        versionamiento: savedVersion,
      });

      await queryRunner.manager.save(reqVersion);
    }

      await queryRunner.commitTransaction();

      // 5. Retornar el requerimiento completo con todas las relaciones
      return await this.requerimientoRepository.findOne({
        where: { id_requerimiento: savedRequerimiento.id_requerimiento },
        relations: [
          'estadoRequerimiento',
          'categoria',
          'sistema',
          'rolUsuario',
          'rolUsuario.usuario',
          'requerimientoVersiones',
          'requerimientoVersiones.versionamiento'
        ],
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      
      throw new HttpException(
        `Error al crear requerimiento: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
  async findAllRequerimientos() {
    try {
      return await this.requerimientoRepository.find({
        relations: [
          'estadoRequerimiento',
          'categoria',
          'sistema',
          'rolUsuario',
          'rolUsuario.usuario',
          'requerimientoVersiones',
          'requerimientoVersiones.versionamiento'
        ],
        order: { fecha_registro: 'DESC' },
      });
    } catch (error) {
      throw new HttpException(
        `Error al obtener requerimientos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

      async findById(id_requerimiento: number): Promise<Requerimiento> {
        try {
          const requerimiento = await this.requerimientoRepository.findOne({
            where: { id_requerimiento: id_requerimiento },
            relations: [
              'estadoRequerimiento',
              'categoria',
              'sistema',
              'rolUsuario',
              'rolUsuario.usuario',
              'requerimientoVersiones',
              'requerimientoVersiones.versionamiento',
              'sirecqExterno'
            ],
          });

          if (!requerimiento) {
            throw new HttpException(`Requerimiento con ID ${id_requerimiento} no encontrado`, HttpStatus.NOT_FOUND);
          }

          return requerimiento;
        } catch (error) {
          throw new HttpException(
            `Error al obtener requerimiento: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

      }

    async deleteRequerimiento(id_requerimiento: number): Promise<{ message: string; id_requerimiento: number }> {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 1. Verificar que el requerimiento existe
        const requerimiento = await this.requerimientoRepository.findOne({
          where: { id_requerimiento: id_requerimiento },
          relations: ['requerimientoVersiones', 'requerimientoVersiones.versionamiento']
        });

        if (!requerimiento) {
          throw new HttpException(
            `Requerimiento con ID ${id_requerimiento} no encontrado`,
            HttpStatus.NOT_FOUND
          );
        }

        // 2. Verificar si tiene SirecqExterno relacionado
        if (requerimiento.sirecqExterno) {
          throw new HttpException(
            'No se puede eliminar el requerimiento porque tiene un SirecqExterno relacionado. Elimine primero el SirecqExterno.',
            HttpStatus.CONFLICT
          );
        }
        // 3. Eliminar en orden: primero las relaciones, luego el requerimiento
        const versionesIds: number[] = [];
        if (requerimiento.requerimientoVersiones && requerimiento.requerimientoVersiones.length > 0) {
          requerimiento.requerimientoVersiones.forEach(relacion => {
            if (relacion.versionamiento) {
              versionesIds.push(relacion.versionamiento.id_version);
            }
          });
        }
        // Eliminar relaciones de versionamiento si existen
        if (requerimiento.requerimientoVersiones && requerimiento.requerimientoVersiones.length > 0) {
          await queryRunner.manager.delete(RequerimientoVersion, {
            requerimiento: { id_requerimiento: id_requerimiento }
          });
        }

        if (versionesIds.length > 0) {
          for (const idVersion of versionesIds) {
            await queryRunner.manager.delete(Versionamiento, idVersion);
          }
        }
        // 4. Eliminar el requerimiento
        const result = await queryRunner.manager.delete(Requerimiento, id_requerimiento);

        if (result.affected === 0) {
          throw new HttpException(
            'No se pudo eliminar el requerimiento',
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
        await queryRunner.commitTransaction();
        return {
          message: 'Requerimiento eliminado exitosamente con todas sus versiones',
          id_requerimiento: id_requerimiento
        };

      } catch (error) {
        await queryRunner.rollbackTransaction();
        
        if (error instanceof HttpException) {
          throw error;
        }
        // Manejar error de integridad referencial
        if (error.code === '23503') {
          throw new HttpException(
            'No se puede eliminar el requerimiento porque tiene registros relacionados en otras tablas',
            HttpStatus.CONFLICT
          );
        }
        throw new HttpException(
          `Error al eliminar el requerimiento: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      } finally {
        await queryRunner.release();
      }
    }

      // requerimiento.service.ts
     async updateRequerimiento(
        id_requerimiento: number,
        updateData: UpdateRequerimientoDto
      ): Promise<Requerimiento> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          // 1. Verificar que el requerimiento existe
          const requerimiento = await this.requerimientoRepository.findOne({
            where: { id_requerimiento },
            relations: ['estadoRequerimiento', 'categoria', 'sistema', 'rolUsuario']
          });

          if (!requerimiento) {
            throw new HttpException(
              `Requerimiento con ID ${id_requerimiento} no encontrado`,
              HttpStatus.NOT_FOUND
            );
          }

          // 2. Definir configuración de relaciones con tipado fuerte
          interface RelacionConfig {
            repository: any;
            field: keyof Requerimiento;
            nombre: string;
            relations?: string[];
            whereField?: string;
          }

          const relacionesConfig: { [key: string]: RelacionConfig } = {
            id_estado_requerimiento: {
              repository: this.estadoReqRepository,
              field: 'estadoRequerimiento',
              nombre: 'Estado requerimiento',
              whereField: 'id_estado_requerimiento'
            },
            id_categoria: {
              repository: this.categoriaRepository,
              field: 'categoria',
              nombre: 'Categoría',
              whereField: 'id_categoria'
            },
            id_sistema: {
              repository: this.sistemaRepository,
              field: 'sistema',
              nombre: 'Sistema',
              whereField: 'id_sistema'
            },
            id_rol_usuario: {
              repository: this.rolUsuarioRepository,
              field: 'rolUsuario',
              nombre: 'Rol usuario',
              whereField: 'id_rol_usuario',
              relations: ['usuario']
            }
          };

          // 3. Validar y actualizar relaciones dinámicamente
          for (const [campo, config] of Object.entries(relacionesConfig)) {
            const valorCampo = updateData[campo as keyof UpdateRequerimientoDto];
            
            if (valorCampo !== undefined && valorCampo !== null) {
              const whereCondition: any = {};
              whereCondition[config.whereField || campo] = valorCampo;

              const entidadRelacionada = await config.repository.findOne({
                where: whereCondition,
                relations: config.relations || []
              });
              
              if (!entidadRelacionada) {
                throw new HttpException(
                  `${config.nombre} con ID ${valorCampo} no encontrado`,
                  HttpStatus.NOT_FOUND
                );
              }
              
              // Asignar la entidad relacionada al campo correspondiente
              (requerimiento as any)[config.field] = entidadRelacionada;
            }
          }

          // 4. Actualizar campos simples
          const camposSimples: (keyof UpdateRequerimientoDto)[] = [
            'no_requerimiento', 'documento', 'tema', 'descripcion', 'fase', 'prioridad'
          ];

          camposSimples.forEach(campo => {
            if (updateData[campo] !== undefined && updateData[campo] !== null) {
              (requerimiento as any)[campo] = updateData[campo];
            }
          });

          // 5. Guardar cambios
          requerimiento.updatedAt = new Date();
          await queryRunner.manager.save(requerimiento);
          await queryRunner.commitTransaction();

          // 6. Retornar requerimiento actualizado
          const requerimientoActualizado = await this.obtenerRequerimientoCompleto(id_requerimiento);
          
          if (!requerimientoActualizado) {
            throw new HttpException(
              'Error al recuperar el requerimiento actualizado',
              HttpStatus.INTERNAL_SERVER_ERROR
            );
          }

          return requerimientoActualizado;

        } catch (error) {
          await queryRunner.rollbackTransaction();
          
          // Manejar errores específicos de base de datos
          if (error instanceof HttpException) {
            throw error;
          }

          if ((error as any).code === '23503') {
            throw new HttpException(
              'Error de integridad referencial. Verifique los IDs de las entidades relacionadas.',
              HttpStatus.BAD_REQUEST
            );
          }

          if ((error as any).code === '23505') {
            throw new HttpException(
              'El número de requerimiento ya existe',
              HttpStatus.CONFLICT
            );
          }

          throw new HttpException(
            `Error al actualizar el requerimiento: ${(error as Error).message}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        } finally {
          await queryRunner.release();
        }
      }

      private async obtenerRequerimientoCompleto(id_requerimiento: number): Promise<Requerimiento | null> {
        return await this.requerimientoRepository.findOne({
          where: { id_requerimiento },
          relations: [
            'estadoRequerimiento',
            'categoria',
            'sistema',
            'rolUsuario',
            'rolUsuario.usuario',
            'requerimientoVersiones',
            'requerimientoVersiones.versionamiento',
            'sirecqExterno'
          ],
        });
      }
      
      async addVersionToRequerimiento(
        id_requerimiento: number,
        addVersionDto: AddVersionDto
      ): Promise<Requerimiento> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          // 1. Verificar que el requerimiento existe
          const requerimiento = await this.requerimientoRepository.findOne({
            where: { id_requerimiento },
            relations: ['requerimientoVersiones', 'requerimientoVersiones.versionamiento']
          });

          if (!requerimiento) {
            throw new HttpException(
              `Requerimiento con ID ${id_requerimiento} no encontrado`,
              HttpStatus.NOT_FOUND
            );
          }

          // 2. Obtener el último número de versión
          let ultimoNumVersion = 0;
          if (requerimiento.requerimientoVersiones && requerimiento.requerimientoVersiones.length > 0) {
            const versiones = requerimiento.requerimientoVersiones
              .map(rv => rv.versionamiento.num_version)
              .filter(num => num !== null) as number[];
            
            ultimoNumVersion = Math.max(...versiones);
          }

          // 3. Crear la nueva versión
          const nuevaVersionData = {
            ...addVersionDto,
            num_version: addVersionDto.num_version || ultimoNumVersion + 1,
          };

          const nuevaVersion = this.versionamientoRepository.create(nuevaVersionData);
          const savedVersion = await queryRunner.manager.save(nuevaVersion);

          // 4. Crear relación en tabla de rompimiento
          const reqVersion = this.reqVersionRepository.create({
            requerimiento: requerimiento,
            versionamiento: savedVersion,
          });

          await queryRunner.manager.save(reqVersion);

          await queryRunner.commitTransaction();

          // 5. Retornar el requerimiento actualizado con todas las versiones
          const requermientoAddVersion = await this.requerimientoRepository.findOne({
            where: { id_requerimiento },
            relations: [
              'estadoRequerimiento',
              'categoria',
              'sistema',
              'rolUsuario',
              'rolUsuario.usuario',
              'requerimientoVersiones',
              'requerimientoVersiones.versionamiento'
            ],
          });

          if (!requermientoAddVersion) {
            throw new HttpException(`Requerimiento con ID ${id_requerimiento} no encontrado`, HttpStatus.NOT_FOUND);
          }

          return requermientoAddVersion;
        } catch (error) {
          await queryRunner.rollbackTransaction();
          if (error instanceof HttpException) throw error;
          
          throw new HttpException(
            `Error al agregar versión: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        } finally {
          await queryRunner.release();
        }
      }

      // requerimiento.service.ts
async getVersionesByRequerimiento(id_requerimiento: number): Promise<Versionamiento[]> {
  try {
    const requerimiento = await this.requerimientoRepository.findOne({
      where: { id_requerimiento },
      relations: [
        'requerimientoVersiones',
        'requerimientoVersiones.versionamiento'
      ],
      order: {
        requerimientoVersiones: {
          versionamiento: {
            num_version: 'ASC'
          }
        }
      }
    });

    if (!requerimiento) {
      throw new HttpException('Requerimiento no encontrado', HttpStatus.NOT_FOUND);
    }

    // Extraer solo las versiones
    const versiones = requerimiento.requerimientoVersiones
      .map(rv => rv.versionamiento)
      .filter(version => version !== null);

    return versiones;

  } catch (error) {
    if (error instanceof HttpException) throw error;
    throw new HttpException(
      `Error al obtener versiones: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

    }