import { Injectable,HttpException, HttpStatus,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TestProduccion } from 'src/test_produccion/entities/test_produccion.entity';
import { TestVersion } from '../test-version/entities/test-version.entity';
import { Versionamiento } from '../versionamiento/entities/versionamiento.entity';
import { Rol_Usuario } from '../users_rol/entities/users_rol.entity';
import { CreateTestProduccionDto } from 'src/test_produccion/dto/create-test_produccion.dto';
import { UpdateTestProduccionDto } from 'src/test_produccion/dto/update-test_produccion.dto';
import { CreateVersionamientoDto } from 'src/versionamiento/dto/create-versionamiento.dto';
import { UsersRolService } from '../users_rol/users_rol.service';


@Injectable()
export class TestProduccionService {
  constructor(
    @InjectRepository(TestProduccion)
    private testProduccionRepository: Repository<TestProduccion>,
    @InjectRepository(TestVersion)
    private testVersionRepository: Repository<TestVersion>,
    @InjectRepository(Versionamiento)
    private versionamientoRepository: Repository<Versionamiento>,
    @InjectRepository(Rol_Usuario)
    private rolUsuarioRepository: Repository<Rol_Usuario>,
    private dataSource: DataSource,
    private readonly usersRolService: UsersRolService,
  ) {}

  async ejecutor(){
    return await this.usersRolService.ejecutor();
  }
  async create(createDto: CreateTestProduccionDto,versionDto?: CreateVersionamientoDto,): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const testExistente = await this.testProduccionRepository.findOne({
        where: { no_requerimiento: createDto.no_requerimiento },
      });
      if (testExistente) {
        throw new HttpException(`El no_requerimiento ${createDto.no_requerimiento} ya existe`, HttpStatus.BAD_REQUEST);
      }

      // 1. Verificar que existe el rol_usuario
      const rolUsuario = await this.rolUsuarioRepository.findOne({
        where: { id_rol_usuario: createDto.id_rol_usuario },
      });

      if (!rolUsuario) {
        throw new HttpException(`El rol_usuario con id ${createDto.id_rol_usuario} no existe`, HttpStatus.NOT_FOUND);
      }

      // 2. Crear el test_produccion
      const testProduccion = this.testProduccionRepository.create(createDto);
      const testGuardado = await queryRunner.manager.save(TestProduccion,testProduccion,
      );

      // 3. Crear la primera versión automáticamente (versión 1)
      const primeraVersion = this.versionamientoRepository.create({
        ...versionDto,
        num_version: 1, // Primera versión siempre es 1
      });
      const versionGuardada = await queryRunner.manager.save(
        Versionamiento,
        primeraVersion,
      );

      // 4. Crear la relación en test_version
      const testVersion = this.testVersionRepository.create();
      testVersion.test_produccion = testGuardado;
      testVersion.versionamiento = versionGuardada;
      await queryRunner.manager.save(TestVersion, testVersion);

      await queryRunner.commitTransaction();

      // 5. Retornar el resultado completo
      return {
        message: 'Test producción creado exitosamente con versión 1',
        testProduccion: testGuardado,
        versionActual: versionGuardada,
        totalVersiones: 1,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(`Error al crear test_produccion: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }


  async findAll(): Promise<TestProduccion[]> {
    return await this.testProduccionRepository.find({
      relations: [
        'test_versions', 
        'test_versions.versionamiento',
        'rolUsuario',
        'rolUsuario.usuario',
        'rolUsuario.rol'
      ],
      order: {
        createdAt: 'DESC',
        test_versions: {
          createdAt: 'DESC'
        }
      }
    });
  }


    async findOne(id: number): Promise<TestProduccion> {
      const testProduccion = await this.testProduccionRepository.findOne({
        where: { id_test_produccion: id },
        relations: [
          'test_versions', 
          'test_versions.versionamiento',
          'rolUsuario',
          'rolUsuario.usuario',
          'rolUsuario.rol'
        ],
        order: {
          test_versions: {
            createdAt: 'DESC'
          }
        }
      });

      if (!testProduccion) {
        throw new NotFoundException(`TestProduccion con ID ${id} no encontrado`);
      }

      return testProduccion;
    }

    async agregarVersionAutomatica(
      idTestProduccion: number, 
      versionData: Partial<Versionamiento>
    ): Promise<{ version: Versionamiento, testVersion: TestVersion }> {
      
      // 1. Verificar que el test_produccion existe
      const testProduccion = await this.testProduccionRepository.findOne({
        where: { id_test_produccion: idTestProduccion }
      });

      if (!testProduccion) {
        throw new NotFoundException(`TestProduccion con ID ${idTestProduccion} no encontrado`);
      }

      // 2. CORRECCIÓN: Obtener el último número de versión para este test_produccion
      const ultimoTestVersion = await this.testVersionRepository
        .createQueryBuilder('tv')
        .leftJoinAndSelect('tv.versionamiento', 'v') // 'v' es el alias para versionamiento
        .where('tv.id_test_produccion = :idTestProduccion', { idTestProduccion })
        .orderBy('v.num_version', 'DESC')
        .getOne();

      // 3. CORRECCIÓN: Acceder correctamente al num_version
      const siguienteNumVersion = ultimoTestVersion && ultimoTestVersion.versionamiento 
        ? ultimoTestVersion.versionamiento.num_version + 1 
        : 1;

      // 4. Crear la nueva versión con el número automático
      const nuevaVersion = this.versionamientoRepository.create({
        ...versionData,
        num_version: siguienteNumVersion,
      });

      const versionGuardada = await this.versionamientoRepository.save(nuevaVersion);

      // 5. Crear la relación en la tabla intermedia
      const testVersion = this.testVersionRepository.create({
        test_produccion: testProduccion,
        versionamiento: versionGuardada,
      });

      const testVersionGuardado = await this.testVersionRepository.save(testVersion);

      return {
        version: versionGuardada,
        testVersion: testVersionGuardado
      };
    }

    async eliminarTestProduccion(idTestProduccion: number): Promise<{ message: string }> {
      // Verificar si existe
        const testProduccion = await this.testProduccionRepository.findOne({
          where: { id_test_produccion: idTestProduccion },
          relations: ['test_versions'] // Cargar relaciones para ver qué se va a eliminar
        });

        if (!testProduccion) {
          throw new NotFoundException(`TestProduccion con ID ${idTestProduccion} no encontrado`);
        }

        // Eliminar (esto borrará en cascada las test_versions relacionadas)
        await this.testProduccionRepository.remove(testProduccion);

        return {
          message: `TestProduccion con ID ${idTestProduccion} y todas sus versiones relacionadas fueron eliminados correctamente`
        };
      }
    async update(id: number, updateDto: UpdateTestProduccionDto,): Promise<TestProduccion> {
    // Verificar que existe el test_produccion
    const testProduccion = await this.testProduccionRepository.findOne({
      where: { id_test_produccion: id },
    });

    if (!testProduccion) {
      throw new NotFoundException(`TestProduccion con ID ${id} no encontrado`);
    }

    // Si se está actualizando el no_requerimiento, validar que no exista
    if (
      updateDto.no_requerimiento &&
      updateDto.no_requerimiento !== testProduccion.no_requerimiento
    ) {
      const duplicado = await this.testProduccionRepository.findOne({
        where: { no_requerimiento: updateDto.no_requerimiento },
      });

      if (duplicado) {
        throw new BadRequestException(
          `El no_requerimiento ${updateDto.no_requerimiento} ya existe`,
        );
      }
    }

    // Si se está actualizando el rol_usuario, validar que existe
    if (updateDto.id_rol_usuario) {
      const rolUsuario = await this.rolUsuarioRepository.findOne({
        where: { id_rol_usuario: updateDto.id_rol_usuario },
      });

      if (!rolUsuario) {
        throw new NotFoundException(
          `El rol_usuario con id ${updateDto.id_rol_usuario} no existe`,
        );
      }
    }

    // Actualizar el test_produccion
    Object.assign(testProduccion, updateDto);
    const testActualizado = await this.testProduccionRepository.save(
      testProduccion,
    );

    // Retornar con relaciones cargadas
    return await this.findOne(testActualizado.id_test_produccion);
  }

  async updateTestProduccion(
  id_test_produccion: number,
  updateTestProduccionDto: UpdateTestProduccionDto
): Promise<TestProduccion> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('🔄 Actualizando TestProduccion ID:', id_test_produccion);
    console.log('📥 DTO completo recibido:', JSON.stringify(updateTestProduccionDto, null, 2));

    // 1. BUSCAR TEST PRODUCCIÓN EXISTENTE
    const testProduccion = await this.testProduccionRepository.findOne({
      where: { id_test_produccion },
      relations: [
        'rolUsuario',
        'rolUsuario.usuario',
        'rolUsuario.rol',
        'test_versions',
        'test_versions.versionamiento'
      ]
    });

    if (!testProduccion) {
      throw new NotFoundException(`TestProduccion con ID ${id_test_produccion} no encontrado`);
    }

    // 2. ACTUALIZAR CAMPOS DIRECTOS DE TEST PRODUCCIÓN
    if (updateTestProduccionDto.etapa_implementation !== undefined) {
      testProduccion.etapa_implementation = updateTestProduccionDto.etapa_implementation;
    }

    if (updateTestProduccionDto.respuesta_tics !== undefined) {
      testProduccion.respuesta_tics = updateTestProduccionDto.respuesta_tics;
    }

    if (updateTestProduccionDto.descripcion !== undefined) {
      testProduccion.descripcion = updateTestProduccionDto.descripcion;
    }

    if (updateTestProduccionDto.no_requerimiento !== undefined) {
      testProduccion.no_requerimiento = updateTestProduccionDto.no_requerimiento;
    }

    if (updateTestProduccionDto.fecha_env !== undefined) {
      testProduccion.fecha_env = new Date(updateTestProduccionDto.fecha_env);
    }

    // 3. ACTUALIZAR ROL USUARIO SI VIENE EN DTO
    if (updateTestProduccionDto.id_rol_usuario !== undefined) {
      if (updateTestProduccionDto.id_rol_usuario) {
        const rolUsuario = await queryRunner.manager.findOne(Rol_Usuario, {
          where: { id_rol_usuario: updateTestProduccionDto.id_rol_usuario },
          relations: ['usuario', 'rol']
        });

        if (!rolUsuario) {
          throw new NotFoundException(`Rol de usuario con ID ${updateTestProduccionDto.id_rol_usuario} no encontrado`);
        }
        testProduccion.id_rol_usuario = updateTestProduccionDto.id_rol_usuario;
        console.log('✅ RolUsuario actualizado a ID:', updateTestProduccionDto.id_rol_usuario);
      } else {
        testProduccion.id_rol_usuario = null;
        console.log('✅ RolUsuario eliminado (set NULL)');
      }
    }

    // 4. CREAR NUEVA VERSIÓN SI VIENE EN EL DTO
    if (updateTestProduccionDto.versionamiento) {
      console.log('🆕 Creando nueva versión durante actualización...');
      console.log('📦 Datos de versionamiento recibidos:', JSON.stringify(updateTestProduccionDto.versionamiento, null, 2));
      
      // PRIMERO GUARDAR LOS CAMBIOS DE TEST_PRODUCCION
      await queryRunner.manager.save(TestProduccion, testProduccion);
      console.log('✅ TestProduccion guardado antes de crear versión');
      
      const versionesExistentes = await queryRunner.manager
        .createQueryBuilder(TestVersion, 'tv')
        .innerJoinAndSelect('tv.versionamiento', 'v')
        .where('tv.test_produccion.id_test_produccion = :id', { id: id_test_produccion })
        .orderBy('v.num_version', 'DESC')
        .getMany();

      const ultimaVersion = versionesExistentes.length > 0
        ? versionesExistentes[0].versionamiento.num_version
        : 0;
      const nuevoNumVersion = ultimaVersion + 1;

      const nuevaVersion = new Versionamiento();
      nuevaVersion.num_version = nuevoNumVersion;
      nuevaVersion.ofi_desp_pt = updateTestProduccionDto.versionamiento.ofi_desp_pt || null;
      nuevaVersion.fech_desp_pt = updateTestProduccionDto.versionamiento.fech_desp_pt 
        ? new Date(updateTestProduccionDto.versionamiento.fech_desp_pt) 
        : null;
      nuevaVersion.oficioenviodmi = updateTestProduccionDto.versionamiento.oficioenviodmi || null;
      nuevaVersion.fechaenvioreq = updateTestProduccionDto.versionamiento.fechaenvioreq 
        ? new Date(updateTestProduccionDto.versionamiento.fechaenvioreq) 
        : null;
      nuevaVersion.obs_version = updateTestProduccionDto.versionamiento.obs_version || null;

      console.log('💾 Versionamiento a guardar:', {
        num_version: nuevaVersion.num_version,
        ofi_desp_pt: nuevaVersion.ofi_desp_pt,
        fech_desp_pt: nuevaVersion.fech_desp_pt,
        oficioenviodmi: nuevaVersion.oficioenviodmi,
        fechaenvioreq: nuevaVersion.fechaenvioreq,
        obs_version: nuevaVersion.obs_version
      });

      const versionGuardada = await queryRunner.manager.save(Versionamiento, nuevaVersion);
      console.log('✅ Versión guardada con ID:', versionGuardada.id_version);

      const testVersion = new TestVersion();
      testVersion.test_produccion = testProduccion;
      testVersion.versionamiento = versionGuardada;

      const testVersionGuardado = await queryRunner.manager.save(TestVersion, testVersion);
      console.log('✅ TestVersion guardado:', {
        id_test_version: testVersionGuardado.id_test_version,
        id_test_produccion: testProduccion.id_test_produccion,
        id_version: versionGuardada.id_version
      });
      console.log(`✅ Nueva versión ${nuevoNumVersion} creada durante actualización`);
    }

    // 5. ACTUALIZAR VERSIONES EXISTENTES SI VIENEN EN DTO
    if (updateTestProduccionDto.versionesActualizadas && updateTestProduccionDto.versionesActualizadas.length > 0) {
      console.log('📝 Actualizando versiones existentes...');
      
      for (const versionUpdate of updateTestProduccionDto.versionesActualizadas) {
        if (versionUpdate.id_version) {
          await queryRunner.manager.update(
            Versionamiento,
            { id_version: versionUpdate.id_version },
            {
              ofi_desp_pt: versionUpdate.ofi_desp_pt,
              fech_desp_pt: versionUpdate.fech_desp_pt ? new Date(versionUpdate.fech_desp_pt) : null,
              oficioenviodmi: versionUpdate.oficioenviodmi,
              fechaenvioreq: versionUpdate.fechaenvioreq ? new Date(versionUpdate.fechaenvioreq) : null,
              obs_version: versionUpdate.obs_version,
              updatedAt: new Date(),
            }
          );
          console.log(`✅ Versión ${versionUpdate.id_version} actualizada`);
        }
      }
    }

    // 6. ELIMINAR VERSIONES SI VIENEN EN DTO
    if (updateTestProduccionDto.versionesAEliminar && updateTestProduccionDto.versionesAEliminar.length > 0) {
      console.log('🗑️ Eliminando versiones...');
      
      for (const idVersion of updateTestProduccionDto.versionesAEliminar) {
        // Primero eliminar la relación en TestVersion
        await queryRunner.manager.delete(TestVersion, {
          versionamiento: { id_version: idVersion },
          test_produccion: { id_test_produccion: testProduccion.id_test_produccion }
        });

        // Luego eliminar la versión
        await queryRunner.manager.delete(Versionamiento, { id_version: idVersion });
        console.log(`✅ Versión ${idVersion} eliminada`);
      }
    }

    // 7. GUARDAR CAMBIOS FINALES DE TEST PRODUCCIÓN (si no se guardó en sección 4)
    if (!updateTestProduccionDto.versionamiento) {
      testProduccion.updatedAt = new Date();
      await queryRunner.manager.save(testProduccion);
    }

    // 8. COMMIT TRANSACCIÓN
    await queryRunner.commitTransaction();
    console.log('✅ Transacción commitada exitosamente');

    // 9. RETORNAR RESULTADO COMPLETO CON RELACIONES ACTUALIZADAS
    const testProduccionCompleto = await this.testProduccionRepository.findOne({
      where: { id_test_produccion },
      relations: [
        'rolUsuario',
        'rolUsuario.usuario',
        'rolUsuario.rol',
        'test_versions',
        'test_versions.versionamiento'
      ],
      order: {
        test_versions: {
          versionamiento: {
            num_version: 'ASC'
          }
        }
      }
    });

    if (!testProduccionCompleto) {
      throw new NotFoundException('TestProduccion no encontrado después de actualizar');
    }

    console.log('✅ TestProduccion actualizado exitosamente');
    return testProduccionCompleto;

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('💥 Error actualizando TestProduccion:', error);
    
    if (error instanceof NotFoundException) throw error;
    throw new BadRequestException(`Error al actualizar TestProduccion: ${error.message}`);
  } finally {
    await queryRunner.release();
    console.log('🔚 QueryRunner liberado');
  }
}

}
