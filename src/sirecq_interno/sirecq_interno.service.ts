import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SirecqInterno } from './entities/sirecq_interno.entity';
import { SirecqExterno } from '../sirecq_externo/entities/sirecq_externo.entity';
import { Requerimiento } from '../requerimiento/entities/requerimiento.entity';
import { Versionamiento } from '../versionamiento/entities/versionamiento.entity';
import { RequerimientoVersion } from '../requerimiento-version/entities/requerimiento-version.entity';
import { Clasif_catastral } from '../clasif_catastral/clasif_catastral.entity';
import { Dependencia } from '../dependencia/dependecia.entity';
import { Estado_requerimiento } from '../estado_requerimiento/entities/estado_requerimiento.entity';
import { Categoria } from '../categoria/categoria.entity';
import { Sistema } from '../sistema/sistema.entity';
import { Rol_Usuario } from '../users_rol/entities/users_rol.entity';
import { UsuarioSirecq } from '../usuario_sirecq/entities/usuario_sirecq.entity';
import { CreateSirecqInternoDto } from 'src/sirecq_interno/dto/create-sirecq_interno.dto';
import { UpdateSirecqInternoDto } from 'src/sirecq_interno/dto/update-sirecq_interno.dto';
import { UsersRolService } from '../users_rol/users_rol.service';
import { RequerimientoService } from '../requerimiento/requerimiento.service';
import { UpdateSirecqExternoDto } from 'src/sirecq_externo/dto/update-sirecq_externo.dto';


@Injectable()
export class SirecqInternoService {
  [x: string]: any;
  constructor(
    @InjectRepository(SirecqInterno)
    private readonly sirecqInternoRepository: Repository<SirecqInterno>,

    @InjectRepository(SirecqExterno)
    private readonly sirecqExternoRepository: Repository<SirecqExterno>,

    @InjectRepository(Requerimiento)
    private readonly requerimientoRepository: Repository<Requerimiento>,

    @InjectRepository(Versionamiento)
    private readonly versionamientoRepository: Repository<Versionamiento>,

    @InjectRepository(RequerimientoVersion)
    private readonly requerimientoVersionRepository: Repository<RequerimientoVersion>,

    @InjectRepository(Clasif_catastral)
    private readonly clasifCatastralRepository: Repository<Clasif_catastral>,

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

    @InjectRepository(UsuarioSirecq)
    private readonly usuarioSirecqRepository: Repository<UsuarioSirecq>,

    private readonly usersRolService: UsersRolService,
    private readonly requerimientoService: RequerimientoService,
    private readonly dataSource: DataSource
    ) {}

    async getAnalistas() {
        return this.usersRolService.getAnalistasIncidentes();
      }
    async createSirecqInterno(createSirecqInternoDto: CreateSirecqInternoDto): Promise<SirecqInterno> {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        console.log('🔄 Creando SirecqInterno completo...');

        // 1. VALIDACIONES BÁSICAS
        const requerimientoFound = await this.requerimientoRepository.findOne({ 
          where: { no_requerimiento: createSirecqInternoDto.requerimiento.no_requerimiento } 
        });
        if (requerimientoFound) {
          throw new HttpException('Número de requerimiento ya existe', HttpStatus.CONFLICT);
        }

        // Validar clasificación catastral
        if (createSirecqInternoDto.id_clasif_catastral) {
          const clasifCatastralFound = await this.clasifCatastralRepository.findOne({ 
            where: { id_clasif_catastral: createSirecqInternoDto.id_clasif_catastral } 
          });
          if (!clasifCatastralFound) {
            throw new HttpException('Clasificación catastral no existe', HttpStatus.NOT_FOUND);
          }
        }

        // Validar dependencia
        if (createSirecqInternoDto.sirecqExterno.id_dependencia) {
          const dependenciaFound = await this.dependenciaRepository.findOne({ 
            where: { id_dependencia: createSirecqInternoDto.sirecqExterno.id_dependencia } 
          });
          if (!dependenciaFound) {
            throw new HttpException('Dependencia no existe', HttpStatus.NOT_FOUND);
          }
        }

        // 2. VALIDAR ESTADO, CATEGORÍA, SISTEMA Y ROL USUARIO
        const estadoRequerimiento = await this.estadoReqRepository.findOne({
          where: { id_estado_requerimiento: createSirecqInternoDto.requerimiento.id_estado_requerimiento }
        });
        if (!estadoRequerimiento) {
          throw new HttpException('Estado de requerimiento no existe', HttpStatus.NOT_FOUND);
        }

        const categoria = await this.categoriaRepository.findOne({
          where: { id_categoria: createSirecqInternoDto.requerimiento.id_categoria }
        });
        if (!categoria) {
          throw new HttpException('Categoría no existe', HttpStatus.NOT_FOUND);
        }

        const sistema = await this.sistemaRepository.findOne({
          where: { id_sistema: createSirecqInternoDto.requerimiento.id_sistema }
        });
        if (!sistema) {
          throw new HttpException('Sistema no existe', HttpStatus.NOT_FOUND);
        }

        const rolUsuario = await this.rolUsuarioRepository.findOne({
          where: { id_rol_usuario: createSirecqInternoDto.requerimiento.id_rol_usuario },
          relations: ['usuario', 'rol']
        });
        if (!rolUsuario) {
          throw new HttpException('Rol de usuario no existe', HttpStatus.NOT_FOUND);
        }

        // 3. VALIDAR USUARIOS SI SE PROPORCIONAN
        const usuariosAAsignar:number[] = [];

        if (createSirecqInternoDto.id_analista) {
          const analistaValido = await this.usersRolService.findOne(createSirecqInternoDto.id_analista);
          if (!analistaValido) throw new HttpException('Analista no válido', HttpStatus.BAD_REQUEST);
          usuariosAAsignar.push(createSirecqInternoDto.id_analista);
        }

        if (createSirecqInternoDto.id_tecnico) {
          const tecnicoValido = await this.usersRolService.findOne(createSirecqInternoDto.id_tecnico);
          if (!tecnicoValido) throw new HttpException('Técnico no válido', HttpStatus.BAD_REQUEST);
          usuariosAAsignar.push(createSirecqInternoDto.id_tecnico);
        }


        // Función auxiliar para fechas
        const fixDateToNoTimezone = (date: string | Date | undefined): Date | undefined => {
          if (!date) return undefined;
          const d = new Date(date);
          d.setHours(12, 0, 0, 0);
          return d;
        };

        // 4. CREAR REQUERIMIENTO
        const requerimientoData: Partial<Requerimiento> = {
          no_requerimiento: createSirecqInternoDto.requerimiento.no_requerimiento.trim().toUpperCase(),
          tema: createSirecqInternoDto.requerimiento.tema,
          descripcion: createSirecqInternoDto.requerimiento.descripcion,
          origen: 'interno',
          fase: createSirecqInternoDto.requerimiento.fase,
          fecha_registro: fixDateToNoTimezone(createSirecqInternoDto.requerimiento.fecha_registro) || new Date(),
          estadoRequerimiento: estadoRequerimiento,
          categoria: categoria,
          sistema: sistema,
          rolUsuario: rolUsuario,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const requerimiento = this.requerimientoRepository.create(requerimientoData);
        const requerimientoGuardado = await queryRunner.manager.save(requerimiento);
        console.log('✅ Requerimiento creado:', requerimientoGuardado.id_requerimiento);

        // 5. CREAR VERSIONAMIENTO SI EXISTE (con numeración automática)
        if (createSirecqInternoDto.requerimiento.versiones && createSirecqInternoDto.requerimiento.versiones.length > 0) {
          console.log('📝 Creando versiones para el requerimiento...');
          
          // Ordenar versiones por num_version si vienen en el DTO (por si acaso)
          const versionesOrdenadas = createSirecqInternoDto.requerimiento.versiones.sort((a, b) => {
            const numA = a.num_version || 0;
            const numB = b.num_version || 0;
            return numA - numB;
          });

          let numVersionActual = 1; // Siempre empieza en 1 para CREATE

          for (const versionData of versionesOrdenadas) {
            console.log(`🔢 Creando versión ${numVersionActual}...`);
            
            const versionamiento = new Versionamiento();
            versionamiento.num_version = numVersionActual; // ✅ Numeración automática
            versionamiento.ofi_desp_pt = versionData.ofi_desp_pt ?? ''; 
            versionamiento.oficioenviodmi = versionData.oficioenviodmi ?? '';
            versionamiento.fechaenvioreq = (versionData.fechaenvioreq as any) || null;
            versionamiento.obs_version = versionData.obs_version ?? '';
            versionamiento.fech_desp_pt = (versionData.fech_desp_pt as any) || null;
            versionamiento.createdAt = new Date();
            versionamiento.updatedAt = new Date();
            
            const versionGuardada = await queryRunner.manager.save(versionamiento);
            console.log(`✅ Versión ${numVersionActual} creada con ID: ${versionGuardada.id_version}`);
            
            // Crear relación Requerimiento-Versionamiento
            const requerimientoVersion = new RequerimientoVersion();
            requerimientoVersion.requerimiento = requerimientoGuardado;
            requerimientoVersion.versionamiento = versionGuardada;
            requerimientoVersion.createdAt = new Date();
            requerimientoVersion.updatedAt = new Date();
            
            await queryRunner.manager.save(requerimientoVersion);
            console.log(`✅ Relación creada para versión ${numVersionActual}`);
            
            numVersionActual++; // Incrementar para la siguiente versión
          }
          
          console.log(`✅ Total de versiones creadas: ${versionesOrdenadas.length}`);
        }

        // 6. CREAR SIREQ EXTERNO
        const sirecqExternoData: Partial<SirecqExterno> = {
          tramitepr: createSirecqInternoDto.sirecqExterno.tramitepr,
          seguimientoinst: createSirecqInternoDto.sirecqExterno.seguimientoinst,
          tramitecat: createSirecqInternoDto.sirecqExterno.tramitecat,
          observacionesgen: createSirecqInternoDto.sirecqExterno.observacionesgen,
          requerimiento: requerimientoGuardado,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Asignar dependencia si existe
        if (createSirecqInternoDto.sirecqExterno.id_dependencia) {
          const dependencia = await this.dependenciaRepository.findOne({
            where: { id_dependencia: createSirecqInternoDto.sirecqExterno.id_dependencia }
          });
          sirecqExternoData.dependencia = dependencia;
        }

        const sirecqExterno = this.sirecqExternoRepository.create(sirecqExternoData);
        const sirecqExternoGuardado = await queryRunner.manager.save(sirecqExterno);
        console.log('✅ SirecqExterno creado:', sirecqExternoGuardado.id_sirecq_externo);

        // 7. CREAR SIREQ INTERNO
        const sirecqInternoData: Partial<SirecqInterno> = {
          fecha_env_dmc: (createSirecqInternoDto.fecha_env_dmc as any) || null,
          obsv_tecnica: createSirecqInternoDto.obsv_tecnica,
          prioridad: createSirecqInternoDto.prioridad,
          tecnico: createSirecqInternoDto.tecnico,
          sirecqExterno: sirecqExternoGuardado,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Asignar clasificación catastral si existe
        if (createSirecqInternoDto.id_clasif_catastral) {
          const clasifCatastral = await this.clasifCatastralRepository.findOne({
            where: { id_clasif_catastral: createSirecqInternoDto.id_clasif_catastral }
          });
          
          // ✅ VERIFICAR QUE NO SEA NULL ANTES DE ASIGNAR
          if (clasifCatastral) {
            sirecqInternoData.clasifCatastral = clasifCatastral;
          }
        }

        const sirecqInterno = this.sirecqInternoRepository.create(sirecqInternoData);
        const sirecqInternoGuardado = await queryRunner.manager.save(sirecqInterno);
        console.log('✅ SirecqInterno creado:', sirecqInternoGuardado.id_sirecq_interno);

        // 8. ASIGNAR USUARIOS EN TABLA ROMPIMIENTO
        for (const idRolUsuario of usuariosAAsignar) {
          const usuarioSirecq = this.usuarioSirecqRepository.create({
            sirecqInterno: { id_sirecq_interno: sirecqInternoGuardado.id_sirecq_interno },
            rolUsuario: { id_rol_usuario: idRolUsuario }
          });
          await queryRunner.manager.save(usuarioSirecq);
        }

        console.log(`✅ ${usuariosAAsignar.length} usuarios asignados en tabla rompimiento`);

        await queryRunner.commitTransaction();

        // 9. RETORNAR CON RELACIONES
        const sirecqInternoCompleto = await this.sirecqInternoRepository.findOne({
          where: { id_sirecq_interno: sirecqInternoGuardado.id_sirecq_interno },
          relations: [
            'sirecqExterno',
            'sirecqExterno.requerimiento',
            'sirecqExterno.requerimiento.estadoRequerimiento',
            'sirecqExterno.requerimiento.categoria',
            'sirecqExterno.requerimiento.sistema',
            'sirecqExterno.requerimiento.rolUsuario',
            'sirecqExterno.requerimiento.rolUsuario.usuario',
            'sirecqExterno.requerimiento.rolUsuario.rol',
            'sirecqExterno.requerimiento.requerimientoVersiones',
            'sirecqExterno.requerimiento.requerimientoVersiones.versionamiento',
            'sirecqExterno.dependencia',
            'clasifCatastral',
            'usuariosSirecq',
            'usuariosSirecq.rolUsuario',
            'usuariosSirecq.rolUsuario.usuario',
            'usuariosSirecq.rolUsuario.rol'
          ],
        });

        if (!sirecqInternoCompleto) {
          throw new HttpException('SirecqInterno no encontrado después de guardar', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        console.log('✅ SirecqInterno creado exitosamente');
        return sirecqInternoCompleto;

      } catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof HttpException) throw error;
        throw new HttpException(`Error al crear SirecqInterno: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      } finally {
        await queryRunner.release();
      }
    }

   async findAll(query: any): Promise<any> {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      status = "",
      categoria = "", // Este será el id_categoria
    } = query;

    const qb = this.sirecqInternoRepository
      .createQueryBuilder("sirecq")
      .leftJoinAndSelect("sirecq.sirecqExterno", "sirecqExterno")
      .leftJoinAndSelect("sirecqExterno.requerimiento", "requerimiento")
      .leftJoinAndSelect("requerimiento.estadoRequerimiento", "estadoRequerimiento")
      .leftJoinAndSelect("requerimiento.categoria", "categoria")
      .leftJoinAndSelect("requerimiento.sistema", "sistema")
      .leftJoinAndSelect("requerimiento.rolUsuario", "rolUsuario")
      .leftJoinAndSelect("rolUsuario.usuario", "usuarioRol")
      .leftJoinAndSelect("requerimiento.requerimientoVersiones", "requerimientoVersiones")
      .leftJoinAndSelect("requerimientoVersiones.versionamiento", "versionamiento")
      .leftJoinAndSelect("sirecqExterno.dependencia", "dependencia")
      .leftJoinAndSelect("sirecq.clasifCatastral", "clasifCatastral")
      .leftJoinAndSelect("sirecq.usuariosSirecq", "usuariosSirecq")
      .leftJoinAndSelect("usuariosSirecq.rolUsuario", "rolUsuarioUsuario")
      .leftJoinAndSelect("rolUsuarioUsuario.usuario", "usuarioSirecq")
      .leftJoinAndSelect("rolUsuarioUsuario.rol", "rolUsuarioRol")
      .orderBy("sirecq.id_sirecq_interno", "DESC");

    // 🔍 Filtrar por ID_CATEGORÍA (1=RSW, 2=RD, 3=RPM)
    if (categoria && categoria !== "TODOS" && categoria !== "") {
      qb.andWhere("categoria.id_categoria = :categoria", { 
        categoria: Number(categoria) 
      });
    }

    // 🔍 Búsqueda general por número de requerimiento
    if (search) {
      qb.andWhere(
        "(LOWER(requerimiento.no_requerimiento) LIKE LOWER(:search))",
        { search: `%${search}%` }
      );
    }

    // ✅ Filtro por estado
    if (status && status.toUpperCase() !== "TODOS") {
      qb.andWhere(
        "UPPER(estadoRequerimiento.nombre_estado_requerimiento) = :status",
        { status: status.toUpperCase() }
      );
    }

    // 🔹 Paginación
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    throw new HttpException(
      `Error al obtener SirecqInternos: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

    async findOne(id_sirecq_interno: number): Promise<SirecqInterno> {
      try {
        const sirecqInterno = await this.sirecqInternoRepository.findOne({
          where: { id_sirecq_interno },
          relations: [
            'sirecqExterno',
            'sirecqExterno.requerimiento',
            'sirecqExterno.requerimiento.estadoRequerimiento',
            'sirecqExterno.requerimiento.categoria',
            'sirecqExterno.requerimiento.sistema',
            'sirecqExterno.requerimiento.rolUsuario',
            'sirecqExterno.requerimiento.rolUsuario.usuario',
            'sirecqExterno.requerimiento.requerimientoVersiones',
            'sirecqExterno.requerimiento.requerimientoVersiones.versionamiento',
            'sirecqExterno.dependencia',
            'clasifCatastral',
            'usuariosSirecq',
            'usuariosSirecq.rolUsuario',
            'usuariosSirecq.rolUsuario.usuario',
            'usuariosSirecq.rolUsuario.rol'
          ]
        });

        if (!sirecqInterno) {
          throw new HttpException('SirecqInterno no encontrado', HttpStatus.NOT_FOUND);
        }

        return sirecqInterno;
      } catch (error) {
        if (error instanceof HttpException) throw error;
        throw new HttpException(
          `Error al obtener SirecqInterno: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }


// sirecq-interno.service.ts - DELETE CON DEPURACIÓN
async deleteSirecqInterno(id_sirecq_interno: number): Promise<{ message: string; ids_eliminados: any }> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('🗑️ ===== INICIANDO ELIMINACIÓN SIREQ INTERNO =====');
    console.log('🆔 ID a eliminar:', id_sirecq_interno);

    // 1. BUSCAR SIREQ INTERNO CON RELACIONES DE USUARIOS
    console.log('🔍 Buscando SirecqInterno con relaciones...');
    const sirecqInterno = await this.sirecqInternoRepository.findOne({
      where: { id_sirecq_interno },
      relations: [
        'usuariosSirecq', // ✅ Asegurar que cargue las relaciones de usuarios
        'sirecqExterno',
        'sirecqExterno.requerimiento'
      ]
    });

    if (!sirecqInterno) {
      console.log('❌ SirecqInterno no encontrado');
      throw new HttpException('SirecqInterno no encontrado', HttpStatus.NOT_FOUND);
    }

    console.log('✅ SirecqInterno encontrado');
    console.log('👥 Usuarios relacionados:', sirecqInterno.usuariosSirecq?.length || 0);

    const idsEliminados = {
      sirecq_interno: id_sirecq_interno,
      sirecq_externo: sirecqInterno.sirecqExterno?.id_sirecq_externo || null,
      requerimiento: sirecqInterno.sirecqExterno?.requerimiento?.id_requerimiento || null,
      usuarios_sirecq: sirecqInterno.usuariosSirecq?.length || 0
    };

    // 2. 🗑️ ELIMINAR RELACIONES EN USUARIO_SIRECQ (CRÍTICO)
    if (sirecqInterno.usuariosSirecq && sirecqInterno.usuariosSirecq.length > 0) {
      console.log(`🗑️ Eliminando ${sirecqInterno.usuariosSirecq.length} registros en usuario_sirecq...`);
      
      // VERIFICAR QUERY ANTES DE EJECUTAR
      const deleteQuery = `DELETE FROM usuario_sirecq WHERE id_sirecq_interno = ${id_sirecq_interno}`;
      console.log('📝 Query a ejecutar:', deleteQuery);
      
      const deleteResult = await queryRunner.manager.delete(UsuarioSirecq, {
        sirecqInterno: { id_sirecq_interno: id_sirecq_interno }
      });
      
      console.log('✅ Resultado eliminación usuario_sirecq:', deleteResult);
      
      // VERIFICAR QUE SE ELIMINARON
      const usuariosRestantes = await queryRunner.manager.count(UsuarioSirecq, {
        where: { sirecqInterno: { id_sirecq_interno: id_sirecq_interno } }
      });
      console.log('🔍 Usuarios restantes después de eliminar:', usuariosRestantes);
      
    } else {
      console.log('ℹ️ No hay relaciones en usuario_sirecq para eliminar');
    }

    // 3. 🗑️ ELIMINAR SIREQ INTERNO
    console.log('🗑️ Eliminando SirecqInterno...');
    const deleteResult = await queryRunner.manager.delete(SirecqInterno, id_sirecq_interno);

    if (deleteResult.affected === 0) {
      console.log('❌ No se pudo eliminar el SirecqInterno');
      throw new HttpException('No se pudo eliminar el SirecqInterno', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    console.log('✅ SirecqInterno eliminado correctamente');

    await queryRunner.commitTransaction();
    console.log('✅ Transacción commitada exitosamente');

    return {
      message: 'SirecqInterno y todas sus relaciones eliminados exitosamente',
      ids_eliminados: idsEliminados
    };

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('💥 ERROR CRÍTICO eliminando SirecqInterno:', error);
    
    // Depuración adicional del error
    if (error.code === '23503') {
      console.error('🔍 ERROR DE INTEGRIDAD REFERENCIAL DETECTADO');
      console.error('📋 Detalles:', error.detail);
      console.error('🗃️ Tabla:', error.table);
      console.error('🔗 Constraint:', error.constraint);
    }
    
    throw error;
  } finally {
    await queryRunner.release();
    console.log('🔚 QueryRunner liberado');
  }
}

async updateSirecqInterno(
  id_sirecq_interno: number,
  updateSirecqInternoDto: UpdateSirecqInternoDto
): Promise<SirecqInterno> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('🔄 Actualizando SirecqInterno ID:', id_sirecq_interno);

    // 1. BUSCAR SIREQ INTERNO EXISTENTE
    const sirecqInterno = await this.sirecqInternoRepository.findOne({
      where: { id_sirecq_interno },
      relations: [
        'sirecqExterno',
        'sirecqExterno.requerimiento',
        'sirecqExterno.dependencia',
        'clasifCatastral',
        'usuariosSirecq'
      ]
    });

    if (!sirecqInterno) {
      throw new HttpException('SirecqInterno no encontrado', HttpStatus.NOT_FOUND);
    }

    // 2. ACTUALIZAR CAMPOS DIRECTOS DE SIREQ INTERNO
    if (updateSirecqInternoDto.fecha_env_dmc !== undefined) {
      sirecqInterno.fecha_env_dmc = updateSirecqInternoDto.fecha_env_dmc
        ? new Date(updateSirecqInternoDto.fecha_env_dmc)
        : null;
    }

    if (updateSirecqInternoDto.obsv_tecnica !== undefined) {
      sirecqInterno.obsv_tecnica = updateSirecqInternoDto.obsv_tecnica;
    }
    if (updateSirecqInternoDto.prioridad !== undefined) {
      sirecqInterno.prioridad = updateSirecqInternoDto.prioridad;
    }
    if (updateSirecqInternoDto.tecnico !== undefined) {
      sirecqInterno.tecnico = updateSirecqInternoDto.tecnico;
    }

    // 3. ACTUALIZAR CLASIFICACIÓN CATASTRAL
    if (updateSirecqInternoDto.id_clasif_catastral !== undefined) {
      if (updateSirecqInternoDto.id_clasif_catastral) {
        const clasifCatastral = await this.clasifCatastralRepository.findOne({
          where: { id_clasif_catastral: updateSirecqInternoDto.id_clasif_catastral },
        });

        if (!clasifCatastral) {
          throw new HttpException('Clasificación catastral no existe', HttpStatus.NOT_FOUND);
        }
        sirecqInterno.clasifCatastral = clasifCatastral;
      } else {
        sirecqInterno.clasifCatastral = null;
      }
    }

    // 4. ACTUALIZAR SIREQ EXTERNO SI VIENE EN DTO
    if (updateSirecqInternoDto.sirecqExterno && sirecqInterno.sirecqExterno) {
      await this.actualizarSirecqExterno(
        sirecqInterno.sirecqExterno.id_sirecq_externo,
        updateSirecqInternoDto.sirecqExterno,
        queryRunner
      );

      // ✅ Refrescar relación después de guardar
      const refreshedExterno = await queryRunner.manager.findOne(SirecqExterno, {
        where: { id_sirecq_externo: sirecqInterno.sirecqExterno.id_sirecq_externo },
        relations: ['dependencia'],
      });
      sirecqInterno.sirecqExterno = refreshedExterno;
    }

    // 5. ACTUALIZAR REQUERIMIENTO SI VIENE EN DTO (💪 Versión robusta dentro del queryRunner)
if (updateSirecqInternoDto.requerimiento && sirecqInterno.sirecqExterno) {
  console.log('📝 Actualizando requerimiento dentro de la transacción...');
  console.log('📦 Datos del requerimiento recibidos:', updateSirecqInternoDto.requerimiento);

  // Buscar el requerimiento directamente dentro del queryRunner
  const reqAsociado = await queryRunner.manager.findOne(Requerimiento, {
    where: { id_requerimiento: sirecqInterno.sirecqExterno.id_requerimiento },
  });

  if (!reqAsociado) {
    throw new HttpException(
      'No se encontró el requerimiento asociado dentro de la transacción',
      HttpStatus.BAD_REQUEST
    );
  }

  const datosRequerimiento = updateSirecqInternoDto.requerimiento;
  const updateData: any = {
    tema: datosRequerimiento.tema,
    descripcion: datosRequerimiento.descripcion,
    fase: datosRequerimiento.fase,
    updatedAt: new Date(),
  };

  if (datosRequerimiento.id_estado_requerimiento)
    updateData.id_estado_requerimiento = datosRequerimiento.id_estado_requerimiento;

  if (datosRequerimiento.id_categoria)
    updateData.id_categoria = datosRequerimiento.id_categoria;

  if (datosRequerimiento.id_sistema) {
    const sistema = await queryRunner.manager.findOne(Sistema, {
      where: { id_sistema: datosRequerimiento.id_sistema },
    });
    if (!sistema) throw new HttpException('Sistema no encontrado', HttpStatus.NOT_FOUND);
    updateData.id_sistema = sistema.id_sistema;
    console.log('✅ Sistema actualizado directamente a ID:', sistema.id_sistema);
  }

  // ✅ NUEVO: actualizar rol_usuario (responsable)
  if (datosRequerimiento.id_rol_usuario) {
    const rolUsuario = await queryRunner.manager.findOne(Rol_Usuario, {
      where: { id_rol_usuario: datosRequerimiento.id_rol_usuario },
      relations: ['usuario', 'rol'],
    });

    if (!rolUsuario) {
      throw new HttpException('Rol de usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    updateData.id_rol_usuario = rolUsuario.id_rol_usuario;
    console.log('✅ RolUsuario actualizado a ID:', rolUsuario.id_rol_usuario);
  }


  await queryRunner.manager
    .createQueryBuilder()
    .update(Requerimiento)
    .set(updateData)
    .where('id_requerimiento = :id', { id: reqAsociado.id_requerimiento })
    .execute();

  console.log('✅ Requerimiento actualizado correctamente dentro del queryRunner');
}


    
    // 6. CREAR NUEVA VERSIÓN SI VIENE EN EL DTO (ROBUSTO)
if (updateSirecqInternoDto.versionamiento) {
  const versionData = updateSirecqInternoDto.versionamiento;
  console.log('🆕 Creando nueva versión asociada...');

  // 🔍 Buscar el requerimiento asociado de forma segura
  const reqAsociado =
    sirecqInterno.sirecqExterno?.requerimiento ||
    (await queryRunner.manager.findOne(Requerimiento, {
      where: { id_requerimiento: sirecqInterno.sirecqExterno?.id_requerimiento },
    }));

  if (!reqAsociado) {
    console.error('❌ No se encontró requerimiento asociado para crear versión');
  } else {
    // 🧾 Buscar número de última versión registrada
    const versionesExistentes = await queryRunner.manager
      .createQueryBuilder(RequerimientoVersion, 'rv')
      .innerJoinAndSelect('rv.versionamiento', 'v')
      .where('rv.requerimiento.id_requerimiento = :idReq', {
        idReq: reqAsociado.id_requerimiento,
      })
      .orderBy('v.num_version', 'DESC')
      .getMany();

    const ultimaVersion = versionesExistentes.length > 0
      ? versionesExistentes[0].versionamiento.num_version
      : 0;
    const nuevoNumVersion = ultimaVersion + 1;

    console.log(`📊 Última versión existente: ${ultimaVersion}`);
    console.log(`🆕 Nueva versión será: ${nuevoNumVersion}`);

    // ⚙️ Crear y guardar nueva versión
    const nuevaVersion = queryRunner.manager.create(Versionamiento, {
      num_version: nuevoNumVersion,
      ofi_desp_pt: versionData.ofi_desp_pt || '',
      fech_desp_pt: (versionData.fech_desp_pt as any) || null,
      oficioenviodmi: versionData.oficioenviodmi || '',
      fechaenvioreq: (versionData.fechaenvioreq as any) || null,
      obs_version: versionData.obs_version || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const versionGuardada = await queryRunner.manager.save(Versionamiento, nuevaVersion);
    console.log('✅ Versionamiento creado con ID:', versionGuardada.id_version);

    // Crear relación Requerimiento-Versionamiento
    const reqVersion = queryRunner.manager.create(RequerimientoVersion, {
      requerimiento: { id_requerimiento: reqAsociado.id_requerimiento },
      versionamiento: versionGuardada,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await queryRunner.manager.save(RequerimientoVersion, reqVersion);
    console.log('✅ Relación Requerimiento-Versionamiento creada exitosamente');
  }
}


    // 7. ACTUALIZAR ASIGNACIONES DE USUARIOS
    if (
      updateSirecqInternoDto.id_analista !== undefined ||
      updateSirecqInternoDto.id_tecnico !== undefined
    ) {
      await this.actualizarAsignacionesUsuarios(
        id_sirecq_interno,
        {
          id_analista: updateSirecqInternoDto.id_analista,
          id_tecnico: updateSirecqInternoDto.id_tecnico,
        },
        queryRunner
      );
    }

    // 8. GUARDAR CAMBIOS DE SIREQ INTERNO
    sirecqInterno.updatedAt = new Date();
    await queryRunner.manager.save(sirecqInterno);

    // 9. COMMIT TRANSACCIÓN
    await queryRunner.commitTransaction();
    console.log('✅ Transacción commitada exitosamente');

    // 10. RETORNAR RESULTADO COMPLETO CON RELACIONES
    const sirecqInternoCompleto = await this.sirecqInternoRepository.findOne({
      where: { id_sirecq_interno },
      relations: [
        'sirecqExterno',
        'sirecqExterno.requerimiento',
        'sirecqExterno.requerimiento.estadoRequerimiento',
        'sirecqExterno.requerimiento.categoria',
        'sirecqExterno.requerimiento.sistema',
        'sirecqExterno.requerimiento.rolUsuario',
        'sirecqExterno.requerimiento.rolUsuario.usuario',
        'sirecqExterno.requerimiento.requerimientoVersiones',
        'sirecqExterno.requerimiento.requerimientoVersiones.versionamiento',
        'sirecqExterno.dependencia',
        'clasifCatastral',
        'usuariosSirecq',
        'usuariosSirecq.rolUsuario',
        'usuariosSirecq.rolUsuario.usuario',
        'usuariosSirecq.rolUsuario.rol',
      ],
    });

    if (!sirecqInternoCompleto) {
      throw new HttpException('SirecqInterno no encontrado después de actualizar', HttpStatus.NOT_FOUND);
    }

    console.log('✅ SirecqInterno actualizado exitosamente con nuevo sistema');
    return sirecqInternoCompleto;

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('💥 Error actualizando SirecqInterno:', error);
    if (error instanceof HttpException) throw error;
    throw new HttpException(
      `Error al actualizar SirecqInterno: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  } finally {
    await queryRunner.release();
    console.log('🔚 QueryRunner liberado');
  }
}



// 🛠️ MÉTODO AUXILIAR PARA ACTUALIZAR SIREQ EXTERNO (CORREGIDO)
private async actualizarSirecqExterno(
  id_sirecq_externo: number,
  updateSirecqExternoDto: UpdateSirecqExternoDto,
  queryRunner: any
): Promise<void> {
  // ✅ Usamos el queryRunner para mantener la transacción
  const sirecqExterno = await queryRunner.manager.findOne(SirecqExterno, {
    where: { id_sirecq_externo },
    relations: ['dependencia'],
  });

  if (!sirecqExterno) {
    throw new HttpException('SirecqExterno no encontrado', HttpStatus.NOT_FOUND);
  }

  // 🔹 Actualizar campos base
  if (updateSirecqExternoDto.tramitepr !== undefined)
    sirecqExterno.tramitepr = updateSirecqExternoDto.tramitepr;

  if (updateSirecqExternoDto.seguimientoinst !== undefined)
    sirecqExterno.seguimientoinst = updateSirecqExternoDto.seguimientoinst;

  if (updateSirecqExternoDto.tramitecat !== undefined)
    sirecqExterno.tramitecat = updateSirecqExternoDto.tramitecat;

  if (updateSirecqExternoDto.observacionesgen !== undefined)
    sirecqExterno.observacionesgen = updateSirecqExternoDto.observacionesgen;

  // 🔹 Actualizar dependencia dentro de la misma transacción
  if (updateSirecqExternoDto.id_dependencia !== undefined) {
    if (updateSirecqExternoDto.id_dependencia) {
      const dependencia = await queryRunner.manager.findOne(Dependencia, {
        where: { id_dependencia: updateSirecqExternoDto.id_dependencia },
      });

      if (!dependencia) {
        throw new HttpException('Dependencia no existe', HttpStatus.NOT_FOUND);
      }

      sirecqExterno.dependencia = dependencia;
      console.log('✅ Dependencia actualizada a:', dependencia.id_dependencia);
    } else {
      sirecqExterno.dependencia = null;
      console.log('⚙️ Dependencia eliminada');
    }
  }

  sirecqExterno.updatedAt = new Date();
  await queryRunner.manager.save(SirecqExterno, sirecqExterno);
  console.log('✅ SirecqExterno actualizado correctamente (misma transacción)');
}


    // 🛠️ MÉTODO AUXILIAR PARA ACTUALIZAR ASIGNACIONES DE USUARIOS
    private async actualizarAsignacionesUsuarios(
      id_sirecq_interno: number,
      usuariosDto: {
        id_analista?: number;
        id_tecnico?: number;
      },
      queryRunner: any
    ): Promise<void> {
      // 1. VALIDAR USUARIOS
      const usuariosAAsignar: number[] = [];

      if (usuariosDto.id_analista !== undefined) {
        if (usuariosDto.id_analista) {
          const analistaValido = await this.usersRolService.findOne(usuariosDto.id_analista);
          if (!analistaValido) throw new HttpException('Analista no válido', HttpStatus.BAD_REQUEST);
          usuariosAAsignar.push(usuariosDto.id_analista);
        }
        // Si es 0 o null, no se asigna (se eliminarán las asignaciones existentes)
      }

      if (usuariosDto.id_tecnico !== undefined) {
        if (usuariosDto.id_tecnico) {
          const tecnicoValido = await this.usersRolService.findOne(usuariosDto.id_tecnico);
          if (!tecnicoValido) throw new HttpException('Técnico no válido', HttpStatus.BAD_REQUEST);
          usuariosAAsignar.push(usuariosDto.id_tecnico);
        }
        // Si es 0 o null, no se asigna
      }

      // 2. ELIMINAR ASIGNACIONES EXISTENTES
      await queryRunner.manager.delete(UsuarioSirecq, {
        sirecqInterno: { id_sirecq_interno }
      });

      // 3. CREAR NUEVAS ASIGNACIONES (solo si hay usuarios válidos)
      for (const idRolUsuario of usuariosAAsignar) {
        const usuarioSirecq = this.usuarioSirecqRepository.create({
          sirecqInterno: { id_sirecq_interno },
          rolUsuario: { id_rol_usuario: idRolUsuario }
        });
        await queryRunner.manager.save(usuarioSirecq);
      }

      console.log(`✅ ${usuariosAAsignar.length} asignaciones de usuarios actualizadas`);
    }
}