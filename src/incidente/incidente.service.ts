import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,Not } from 'typeorm';
import { Incidente } from './entities/incidente.entity';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { UpdateIncidenteEstadoDto} from './dto/update-incidente-estado.dto';
import { Zona } from 'src/zona/zona.entity';
import { Estado_acc_inc } from 'src/estado_acc_inc/estado_acc_inc.entity';
import { UsersRolService} from 'src/users_rol/users_rol.service'
import { UsuarioIncidente } from 'src/usuario_incidente/entities/usuario_incidente.entity'

@Injectable()
export class IncidenteService {
  
  constructor (
    @InjectRepository(Incidente) 
    private incidenteRepository: Repository<Incidente>,
    @InjectRepository(Zona) 
    private zonaRepository: Repository<Zona>,
    @InjectRepository(Estado_acc_inc) 
    private estadoAccIncRepository: Repository<Estado_acc_inc>,
    @InjectRepository(UsuarioIncidente)
    private usuarioIncidenteRepository: Repository<UsuarioIncidente>,

    private usersRolService: UsersRolService,
  ){}

  private esBase64Valido(str: string): boolean {
    try {
      if (!str || typeof str !== 'string') {
        return false;
      }
      const base64WithoutPrefix = str.includes('base64,') 
        ? str.split('base64,')[1] 
        : str;

      const buffer = Buffer.from(base64WithoutPrefix, 'base64');
      const base64Converted = buffer.toString('base64');
      return base64Converted === base64WithoutPrefix;
    } catch {
      return false;
    }
  }

  async getTecnicoIncidentes() {
    return this.usersRolService.getTecnicoIncidentes();
  }

  async getAnalistasIncidentes() {
    return this.usersRolService.getAnalistasIncidentes();
  }

  async createIncidente(createIncidenteDto: CreateIncidenteDto): Promise<Incidente> {
    const queryRunner = this.incidenteRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. VALIDACIONES
      const incidenteFound = await this.incidenteRepository.findOne({ 
        where: { no_incidente: createIncidenteDto.no_incidente} 
      });
      if (incidenteFound) throw new HttpException('Número de incidente ya existe', HttpStatus.CONFLICT);

      const zonaFound = await this.zonaRepository.findOne({ where: { id_zona: createIncidenteDto.id_zona } });
      if (!zonaFound) throw new HttpException('Zona no existe', HttpStatus.NOT_FOUND);

      const estadoPendiente = await this.estadoAccIncRepository.findOne({ where: { id_estado_acc_inc: 6 } });
      if (!estadoPendiente) throw new HttpException('Estado Pendiente no configurado', HttpStatus.INTERNAL_SERVER_ERROR);

      if (!createIncidenteDto.no_incidente) throw new HttpException('Número de incidente obligatorio', HttpStatus.BAD_REQUEST);
      if (createIncidenteDto.aniosirecq > new Date().getFullYear() + 1) throw new HttpException('Año no puede ser futuro', HttpStatus.BAD_REQUEST);

      // 2. VALIDAR ASIGNACIONES
      if (createIncidenteDto.asignaciones && createIncidenteDto.asignaciones.length > 0) {
        for (const asignacion of createIncidenteDto.asignaciones) {
          const rolUsuarioValido = await this.usersRolService.findOne(asignacion.idRolUsuario);
          if (!rolUsuarioValido) throw new HttpException(`RolUsuario ${asignacion.idRolUsuario} no existe`, HttpStatus.BAD_REQUEST);
          if (rolUsuarioValido.rol.id_rol !== 2 && rolUsuarioValido.rol.id_rol !== 7) {
            throw new HttpException(`RolUsuario ${asignacion.idRolUsuario} no tiene rol válido`, HttpStatus.BAD_REQUEST);
          }
        }
      }

      function fixDateToNoTimezone(date: string | Date | undefined): Date | undefined {
        if (!date) return undefined;
        const d = new Date(date);
        d.setHours(12, 0, 0, 0); // Fuerza a mediodía
        return d;
      }


      // 3. CREAR INCIDENTE
      const incidenteData: Partial<Incidente> = {
        no_incidente: createIncidenteDto.no_incidente.trim().toUpperCase(),
        fechaingresoerror: fixDateToNoTimezone(createIncidenteDto.fechaingresoerror) || new Date(),
        tipologia: createIncidenteDto.tipologia,
        descripcionerror: createIncidenteDto.descripcionerror,
        aniosirecq: createIncidenteDto.aniosirecq,
        zona: zonaFound,                    
        estado_acc_inc: estadoPendiente,
        createdAt: new Date(),
        updatedAt: new Date(),
        // ===== NEW =====
        mensajeerror: createIncidenteDto.mensajeerror ?? null,
        obs_incidente: createIncidenteDto.obs_incidente ?? null,
        fech_solucion: fixDateToNoTimezone(createIncidenteDto.fech_solucion) ?? null,
      };

      if (createIncidenteDto.error_img) {
        if (!this.esBase64Valido(createIncidenteDto.error_img)) throw new HttpException('Formato de imagen no válido', HttpStatus.BAD_REQUEST);
        incidenteData.error_img = Buffer.from(createIncidenteDto.error_img, 'base64');
      }

      const incidente = this.incidenteRepository.create(incidenteData);
      const incidenteGuardado = await queryRunner.manager.save(incidente);

      // === ASIGNAR ANALISTA (buscando id_rol_usuario por id_usuario y rol 2) ===
      if (createIncidenteDto.id_analista) {
        const analistaRolUsuario = await this.usersRolService.findByUsuarioAndRol(createIncidenteDto.id_analista, 2);
        if (!analistaRolUsuario) throw new HttpException('No se encontró un Rol_Usuario para el analista con ese usuario y rol', HttpStatus.BAD_REQUEST);
        const usuarioIncidenteAnalista = this.usuarioIncidenteRepository.create({
          incidente: { id_incidente: incidenteGuardado.id_incidente },
          rolUsuario: { id_rol_usuario: analistaRolUsuario.id_rol_usuario }
        });
        await queryRunner.manager.save(usuarioIncidenteAnalista);
      }

      // === ASIGNAR TÉCNICO (buscando id_rol_usuario por id_usuario y rol 7) ===
      if (createIncidenteDto.id_tecnico) {
        const tecnicoRolUsuario = await this.usersRolService.findByUsuarioAndRol(createIncidenteDto.id_tecnico, 7);
        if (!tecnicoRolUsuario) throw new HttpException('No se encontró un Rol_Usuario para el técnico con ese usuario y rol', HttpStatus.BAD_REQUEST);
        const usuarioIncidenteTecnico = this.usuarioIncidenteRepository.create({
          incidente: { id_incidente: incidenteGuardado.id_incidente },
          rolUsuario: { id_rol_usuario: tecnicoRolUsuario.id_rol_usuario }
        });
        await queryRunner.manager.save(usuarioIncidenteTecnico);
      }
      // 4. ASIGNACIONES
      if (createIncidenteDto.asignaciones && createIncidenteDto.asignaciones.length > 0) {
        for (const asignacion of createIncidenteDto.asignaciones) {
          const rolUsuarioValido = await this.usersRolService.findOne(asignacion.idRolUsuario);
          if (!rolUsuarioValido) throw new HttpException(`RolUsuario ${asignacion.idRolUsuario} no existe`, HttpStatus.BAD_REQUEST);
          
          const usuarioIncidenteData = {
            incidente: { id_incidente: incidenteGuardado.id_incidente },
            rolUsuario: { id_rol_usuario: asignacion.idRolUsuario }
          };
          const usuarioIncidente = this.usuarioIncidenteRepository.create(usuarioIncidenteData);
          await queryRunner.manager.save(usuarioIncidente);
        }
      }

      await queryRunner.commitTransaction();

      // 5. RETORNAR COMPLETO
      const incidenteCompleto = await this.incidenteRepository.findOne({
        where: { id_incidente: incidenteGuardado.id_incidente },
        relations: [
          'zona', 
          'estado_acc_inc',
          'usuariosIncidente',
          'usuariosIncidente.rolUsuario',
          'usuariosIncidente.rolUsuario.usuario',
          'usuariosIncidente.rolUsuario.rol'
        ],
      });

      if (!incidenteCompleto) throw new NotFoundException('Incidente no encontrado después de guardar');

      type UsuarioRolInfo = {
        id_usuario_incidente: number;
        id_rol_usuario: number;
        id_usuario: number;
        nombre_usuario: string;
        apellidos_usuario: string;
        correo_usuario: string;
        id_rol: number;
        nombre_rol: string;
      } | null;

      const response: typeof incidenteCompleto & {
        tecnico: UsuarioRolInfo;
        analista: UsuarioRolInfo;
      } = {
        ...incidenteCompleto,
        tecnico: null,
        analista: null,
      };

      if (incidenteCompleto.usuariosIncidente && incidenteCompleto.usuariosIncidente.length > 0) {
        const tecnico = incidenteCompleto.usuariosIncidente.find(ui => ui.rolUsuario.rol.id_rol === 7);
        const analista = incidenteCompleto.usuariosIncidente.find(ui => ui.rolUsuario.rol.id_rol === 2);

        if (tecnico) {
          response.tecnico = {
            id_usuario_incidente: tecnico.id_usuario_incidente,
            id_rol_usuario: tecnico.rolUsuario.id_rol_usuario,
            id_usuario: tecnico.rolUsuario.usuario.id_usuario,
            nombre_usuario: tecnico.rolUsuario.usuario.nombre_usuario,
            apellidos_usuario: tecnico.rolUsuario.usuario.apellidos_usuario,
            correo_usuario: tecnico.rolUsuario.usuario.correo_usuario,
            id_rol: tecnico.rolUsuario.rol.id_rol,
            nombre_rol: tecnico.rolUsuario.rol.nombre_rol
          };
        }

        if (analista) {
          response.analista = {
            id_usuario_incidente: analista.id_usuario_incidente,
            id_rol_usuario: analista.rolUsuario.id_rol_usuario,
            id_usuario: analista.rolUsuario.usuario.id_usuario,
            nombre_usuario: analista.rolUsuario.usuario.nombre_usuario,
            apellidos_usuario: analista.rolUsuario.usuario.apellidos_usuario,
            correo_usuario: analista.rolUsuario.usuario.correo_usuario,
            id_rol: analista.rolUsuario.rol.id_rol,
            nombre_rol: analista.rolUsuario.rol.nombre_rol
          };
        }
      }

      return response;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error al crear incidente: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllIncidente(): Promise<any[]> {
    try {
      const incidentes = await this.incidenteRepository.find({
        select: [
          'id_incidente',
          'no_incidente',
          'fechaingresoerror',
          'descripcionerror',
          'aniosirecq',
          'tipologia',
          'createdAt',
        ],
        relations: ['zona', 'estado_acc_inc'],
        order: { createdAt: 'DESC' },
      });

      return incidentes.map((i) => ({
        id_incidente: i.id_incidente,
        no_incidente: i.no_incidente,
        fechaingresoerror: i.fechaingresoerror,
        descripcionerror: i.descripcionerror,
        aniosirecq: i.aniosirecq,
        tipologia: i.tipologia,
        zona: i.zona
          ? { id_zona: i.zona.id_zona, nombre_zona: i.zona.nombre_zona }
          : null,
        estado_acc_inc: i.estado_acc_inc
          ? {
              id_estado_acc_inc: i.estado_acc_inc.id_estado_acc_inc,
              nombre_estado_acc_inc: i.estado_acc_inc.nombre_estado_acc_inc,
            }
          : null,
      }));
    } catch (error) {
      console.error('❌ Error en findAllIncidente:', error);
      throw new HttpException(
        'Error al obtener los incidentes: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findNoIncidente(id_incidente: number): Promise<any> {
    try {
      const incidente = await this.incidenteRepository.findOne({
        where: { id_incidente },
        relations: [
          'zona',
          'estado_acc_inc',
          'usuariosIncidente',
          'usuariosIncidente.rolUsuario',
          'usuariosIncidente.rolUsuario.usuario',
          'usuariosIncidente.rolUsuario.rol',
        ],
      });

      if (!incidente) {
        throw new HttpException(`Incidente ${id_incidente} no encontrado`, HttpStatus.NOT_FOUND);
      }

      const asignaciones = (incidente.usuariosIncidente || []).map((ui) => {
        const rolUsuario = ui.rolUsuario || null;
        const usuario = rolUsuario?.usuario || null;
        const rol = rolUsuario?.rol || null;

        return {
          id_usuario_incidente: (ui as any).id_usuario_incidente ?? null,
          id_rol_usuario: rolUsuario?.id_rol_usuario ?? null,
          id_usuario: usuario?.id_usuario ?? null,
          nombre_usuario: usuario?.nombre_usuario ?? null,
          apellidos_usuario: usuario?.apellidos_usuario ?? null,
          correo_usuario: usuario?.correo_usuario ?? null,
          id_rol: rol?.id_rol ?? null,
          nombre_rol: rol?.nombre_rol ?? null,
        };
      });

      const matchRole = (roleName?: string, rx?: RegExp) =>
        !!(roleName && rx && rx.test(roleName));

      const tecnico = asignaciones.find((a) =>
        matchRole(a.nombre_rol, /\bT[EÉ]CNICO\b/i) || matchRole(a.nombre_rol, /\bTECNICO\b/i)
      ) || null;

      const analista = asignaciones.find((a) =>
        matchRole(a.nombre_rol, /\bANALISTA\b/i)
      ) || null;

      const payload = {
        id_incidente: incidente.id_incidente,
        no_incidente: incidente.no_incidente,
        fechaingresoerror: incidente.fechaingresoerror,
        fech_solucion: incidente.fech_solucion,
        descripcionerror: incidente.descripcionerror,
        aniosirecq: incidente.aniosirecq,
        mensajeerror: incidente.mensajeerror,
        tipologia: incidente.tipologia,
        obs_incidente: incidente.obs_incidente,
        zona: incidente.zona
          ? {
              id_zona: incidente.zona.id_zona,
              nombre_zona: incidente.zona.nombre_zona,
              ubi_zona: incidente.zona.ubi_zona,
            }
          : null,
        estado_acc_inc: incidente.estado_acc_inc
          ? {
              id_estado_acc_inc: incidente.estado_acc_inc.id_estado_acc_inc,
              nombre_estado_acc_inc: incidente.estado_acc_inc.nombre_estado_acc_inc,
              descrip_estado_acc_inc: incidente.estado_acc_inc.descrip_estado_acc_inc,
            }
          : null,
        id_tecnico: tecnico ? tecnico.id_usuario : null,
        id_analista: analista ? analista.id_usuario : null,
        tecnico,
        analista,
        error_img: incidente.error_img ?? null,
        _rawIncidente: incidente,
      };

      return payload;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Error al obtener el incidente con usuarios',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getViewIncidente(): Promise<any[]> {
    const incidentes = await this.incidenteRepository.find({
      relations: ['estado_acc_inc'], 
      order: { createdAt: 'DESC' },
    });

    return incidentes.map(i => ({
      no_incidente: i.no_incidente,
      fecha: i.fechaingresoerror,
      estado: i.estado_acc_inc?.nombre_estado_acc_inc, 
    }));
  }

  async updateIncidente(id_incidente: number, updateIncidenteDto: UpdateIncidenteDto): Promise<Incidente> {
    const queryRunner = this.incidenteRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. EXISTE
      const incidente = await this.incidenteRepository.findOne({
        where: { id_incidente },
        relations: ['zona', 'estado_acc_inc', 'usuariosIncidente'],
      });
      if (!incidente) throw new NotFoundException(`Incidente ${id_incidente} no encontrado`);
      if (!incidente.id_incidente) {
        throw new HttpException('No se pudo obtener el ID del incidente', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // 2. ZONA
      if (updateIncidenteDto.id_zona) {
        const zonaFound = await this.zonaRepository.findOne({ where: { id_zona: updateIncidenteDto.id_zona } });
        if (!zonaFound) throw new HttpException('Zona no existe', HttpStatus.NOT_FOUND);
        incidente.zona = zonaFound;
      }

      // 3. VALIDACIONES
      if (updateIncidenteDto.no_incidente) {
        const incidenteConNuevoNumero = await this.incidenteRepository.findOne({ 
          where: { 
            no_incidente: updateIncidenteDto.no_incidente.trim().toUpperCase(),
            id_incidente: Not(incidente.id_incidente)
          } 
        });
        if (incidenteConNuevoNumero) {
          throw new HttpException('Número de incidente ya existe', HttpStatus.CONFLICT);
        }
        incidente.no_incidente = updateIncidenteDto.no_incidente.trim().toUpperCase();
      }

      if (updateIncidenteDto.aniosirecq && updateIncidenteDto.aniosirecq > new Date().getFullYear() + 1) {
        throw new HttpException('Año no puede ser futuro', HttpStatus.BAD_REQUEST);
      }

      // 4. CAMPOS PRINCIPALES
      incidente.tipologia = updateIncidenteDto.tipologia ?? incidente.tipologia;
      incidente.descripcionerror = updateIncidenteDto.descripcionerror ?? incidente.descripcionerror;
      incidente.aniosirecq = updateIncidenteDto.aniosirecq ?? incidente.aniosirecq;

      // ===== NEW =====
      if (updateIncidenteDto.fechaingresoerror !== undefined) {
        incidente.fechaingresoerror = updateIncidenteDto.fechaingresoerror;
      }
      if (updateIncidenteDto.mensajeerror !== undefined) {
        incidente.mensajeerror = updateIncidenteDto.mensajeerror;
      }
      if (updateIncidenteDto.obs_incidente !== undefined) {
        incidente.obs_incidente = updateIncidenteDto.obs_incidente;
      }
      if (updateIncidenteDto.fech_solucion !== undefined) {
        incidente.fech_solucion = updateIncidenteDto.fech_solucion;
      }

      incidente.updatedAt = new Date();

      if (updateIncidenteDto.error_img) {
        if (!this.esBase64Valido(updateIncidenteDto.error_img)) {
          throw new HttpException('Formato de imagen no válido', HttpStatus.BAD_REQUEST);
        }
        incidente.error_img = Buffer.from(updateIncidenteDto.error_img, 'base64');
      }

      // 5. ASIGNACIONES
      if (updateIncidenteDto.asignaciones !== undefined) {
        if (updateIncidenteDto.asignaciones.length > 0) {
          for (const asignacion of updateIncidenteDto.asignaciones) {
            const rolUsuarioValido = await this.usersRolService.findOne(asignacion.idRolUsuario);
            if (!rolUsuarioValido) {
              throw new HttpException(`RolUsuario ${asignacion.idRolUsuario} no existe`, HttpStatus.BAD_REQUEST);
            }
            if (rolUsuarioValido.rol.id_rol !== 2 && rolUsuarioValido.rol.id_rol !== 7) {
              throw new HttpException(`RolUsuario ${asignacion.idRolUsuario} no tiene rol válido`, HttpStatus.BAD_REQUEST);
            }
          }
        }

        const asignacionesActuales = await this.usuarioIncidenteRepository.find({
          where: { incidente: { id_incidente: incidente.id_incidente } },
          relations: ['rolUsuario']
        });

        const connection = this.incidenteRepository.manager.connection;

        const minLength = Math.min(asignacionesActuales.length, updateIncidenteDto.asignaciones.length);
        for (let i = 0; i < minLength; i++) {
          await connection.query(
            `UPDATE usuario_incidente SET id_rol_usuario = $1 WHERE id_usuario_incidente = $2`,
            [updateIncidenteDto.asignaciones[i].idRolUsuario, asignacionesActuales[i].id_usuario_incidente]
          );
        }

        for (let i = minLength; i < updateIncidenteDto.asignaciones.length; i++) {
          await connection.query(
            `INSERT INTO usuario_incidente (id_incidente, id_rol_usuario) VALUES ($1, $2)`,
            [incidente.id_incidente, updateIncidenteDto.asignaciones[i].idRolUsuario]
          );
        }

        for (let i = minLength; i < asignacionesActuales.length; i++) {
          await connection.query(
            `DELETE FROM usuario_incidente WHERE id_usuario_incidente = $1`,
            [asignacionesActuales[i].id_usuario_incidente]
          );
        }
      }

      // 6. GUARDAR
      const incidenteActualizado = await queryRunner.manager.save(incidente);
      await queryRunner.commitTransaction();

      // 7. RETORNAR COMPLETO
      const incidenteActualizadoCompleto = await this.incidenteRepository.findOne({
        where: { id_incidente: incidenteActualizado.id_incidente },
        relations: [
          'zona', 
          'estado_acc_inc',
          'usuariosIncidente',
          'usuariosIncidente.rolUsuario',
          'usuariosIncidente.rolUsuario.usuario',
          'usuariosIncidente.rolUsuario.rol'
        ],
      });

      if (!incidenteActualizadoCompleto) {
        throw new NotFoundException('Incidente no encontrado después de actualizar');
      }
      return incidenteActualizadoCompleto;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error detallado:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error al actualizar incidente: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id_incidente: number): Promise<void> {
    try {
      const incidente = await this.findNoIncidente(id_incidente);
      await this.incidenteRepository.remove(incidente);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Error al eliminar el incidente: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByZona(nombre_zona: string): Promise<Incidente[]> {
    try {
      const zona = await this.zonaRepository.findOne({ where: { nombre_zona } });
      if (!zona) throw new HttpException('Zona no encontrada', HttpStatus.NOT_FOUND);

      return await this.incidenteRepository.find({
        where: { zona: { nombre_zona } },
        relations: ['zona', 'estado_acc_inc'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al obtener incidentes por zona: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByEstado(nombre_estado_acc_inc: string): Promise<Incidente[]> {
    try {
      const estado = await this.estadoAccIncRepository.findOne({ where: { nombre_estado_acc_inc } });
      if (!estado) throw new HttpException('Estado no encontrado', HttpStatus.NOT_FOUND);

      return await this.incidenteRepository.find({
        where: { estado_acc_inc: { nombre_estado_acc_inc } },
        relations: ['zona', 'estado_acc_inc'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al obtener incidentes por estado: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getEstadisticas() {
    try {
      const total = await this.incidenteRepository.count();
      const porEstado = await this.incidenteRepository
        .createQueryBuilder('incidente')
        .select('estado.nombre_estado', 'estado')
        .addSelect('COUNT(incidente.id_incidente)', 'cantidad')
        .leftJoin('incidente.estado_acc_inc', 'estado')
        .groupBy('estado.nombre_estado')
        .getRawMany();
      return { total, porEstado };
    } catch (error) {
      throw new HttpException(
        'Error al obtener estadísticas: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateEstado(no_incidente: string, updateIncidenteEstadoDto: UpdateIncidenteEstadoDto): Promise<Incidente> {
    try {  
      const incidente = await this.incidenteRepository.findOne({
        where: { no_incidente },
        relations: ['zona', 'estado_acc_inc'],
      });
      if (!incidente) throw new HttpException('Incidente no encontrado', HttpStatus.NOT_FOUND);

      const estadoFavorable = await this.estadoAccIncRepository.findOne({ where: { id_estado_acc_inc: 4 } });
      if (!estadoFavorable) throw new NotFoundException('Estado "Favorable" no encontrado');

      if (incidente.estado_acc_inc.id_estado_acc_inc !== 6) {
        throw new HttpException('Solo los incidentes con estado "Pendiente" pueden ser actualizados', HttpStatus.BAD_REQUEST );
      }

      if (updateIncidenteEstadoDto.fech_solucion !== undefined) {
        incidente.fech_solucion = updateIncidenteEstadoDto.fech_solucion;
      }
      if (updateIncidenteEstadoDto.obs_incidente !== undefined) {
        incidente.obs_incidente = updateIncidenteEstadoDto.obs_incidente;
      }
      if (updateIncidenteEstadoDto.mensajeerror !== undefined) {
        incidente.mensajeerror = updateIncidenteEstadoDto.mensajeerror;
      }

      incidente.estado_acc_inc = estadoFavorable;
      incidente.updatedAt = new Date();
      const incidenteActualizado = await this.incidenteRepository.save(incidente);

      const incidenteCompleto = await this.incidenteRepository.findOne({
        where: { id_incidente: incidenteActualizado.id_incidente },
        relations: ['zona', 'estado_acc_inc'],
      });

      if (!incidenteCompleto) {
        throw new HttpException('Error al recuperar el incidente actualizado', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return incidenteCompleto;
            
    } catch (error) {
      if (error instanceof HttpException || error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Error al actualizar el estado del incidente: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
