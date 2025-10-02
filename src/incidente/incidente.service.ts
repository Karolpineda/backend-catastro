import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Incidente } from './entities/incidente.entity';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { UpdateIncidenteEstadoDto } from './dto/update-incidente-estado.dto';
import { Zona } from 'src/zona/zona.entity';
import { Estado_acc_inc } from 'src/estado_acc_inc/estado_acc_inc.entity';
import { UsersRolService } from 'src/users_rol/users_rol.service';
import { UsuarioIncidente } from 'src/usuario_incidente/entities/usuario_incidente.entity';

@Injectable()
export class IncidenteService {

  constructor(
    @InjectRepository(Incidente)
    private incidenteRepository: Repository<Incidente>,
    @InjectRepository(Zona)
    private zonaRepository: Repository<Zona>,
    @InjectRepository(Estado_acc_inc)
    private estadoAccIncRepository: Repository<Estado_acc_inc>,
    @InjectRepository(UsuarioIncidente)
    private usuarioIncidenteRepository: Repository<UsuarioIncidente>,
    private usersRolService: UsersRolService,
  ) {}

  /** =========================
   *  Utilidades
   *  ========================= */
  private esBase64Valido(str: string): boolean {
    try {
      if (!str || typeof str !== 'string') return false;
      const base64WithoutPrefix = str.includes('base64,') ? str.split('base64,')[1] : str;
      const buffer = Buffer.from(base64WithoutPrefix, 'base64');
      return buffer.toString('base64') === base64WithoutPrefix;
    } catch {
      return false;
    }
  }

  /** Normaliza fechas para evitar que “bajen un día” por TZ */
  private normalizeDateNoTZ(input?: string | Date | null): Date | null {
    if (!input) return null;
    // Si llega 'YYYY-MM-DD', fuerzo mediodía local para evitar corrimientos
    if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const [y, m, d] = input.split('-').map(Number);
      const dt = new Date(y, m - 1, d, 12, 0, 0, 0); // 12:00 local
      return dt;
    }
    const d = new Date(input);
    if (isNaN(d.getTime())) return null;
    d.setHours(12, 0, 0, 0);
    return d;
    // Nota: si tus columnas en DB son DATE (no timestamptz), esto es suficiente.
    // Si son timestamptz, igualmente mitigamos el “day off” al fijar 12:00.
  }

  /** Upsert por rol (2 = Analista, 7 = Técnico) */
  private async upsertUsuarioIncidentePorRol(
    idIncidente: number,
    idUsuario: number | null | undefined,
    roleId: 2 | 7,
  ): Promise<void> {
    // Obtengo asignaciones actuales del incidente
    const asignacionesActuales = await this.usuarioIncidenteRepository.find({
      where: { incidente: { id_incidente: idIncidente } },
      relations: ['rolUsuario', 'rolUsuario.rol'],
    });

    const existente = asignacionesActuales.find(a => a.rolUsuario?.rol?.id_rol === roleId);

    // Si no enviaron usuario, elimino la asignación existente (si hay)
    if (!idUsuario) {
      if (existente) {
        await this.usuarioIncidenteRepository.delete(existente.id_usuario_incidente);
      }
      return;
    }

    // Busco el rol_usuario correcto para ese usuario y rol
    const rolUsuario = await this.usersRolService.findByUsuarioAndRol(idUsuario, roleId);
    if (!rolUsuario) {
      throw new HttpException(
        `No se encontró Rol_Usuario para usuario=${idUsuario} y rol=${roleId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (existente) {
      // Si ya existe y es el mismo, no hago nada
      if (existente.rolUsuario?.id_rol_usuario === rolUsuario.id_rol_usuario) return;
      // Si cambia, actualizo
      await this.usuarioIncidenteRepository.update(
        { id_usuario_incidente: existente.id_usuario_incidente },
        { rolUsuario: { id_rol_usuario: rolUsuario.id_rol_usuario } as any },
      );
      return;
    }

    // No existía asignación para ese rol → creo una nueva
    const nuevo = this.usuarioIncidenteRepository.create({
      incidente: { id_incidente: idIncidente } as any,
      rolUsuario: { id_rol_usuario: rolUsuario.id_rol_usuario } as any,
    });
    await this.usuarioIncidenteRepository.save(nuevo);
  }

  /** =========================
   *  Queries auxiliares
   *  ========================= */
  async getTecnicoIncidentes() {
    return this.usersRolService.getTecnicoIncidentes();
  }

  async getAnalistasIncidentes() {
    return this.usersRolService.getAnalistasIncidentes();
  }

  /** =========================
   *  Create
   *  ========================= */
  async createIncidente(createIncidenteDto: CreateIncidenteDto): Promise<Incidente> {
    const queryRunner = this.incidenteRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1) Validaciones
      const incidenteFound = await this.incidenteRepository.findOne({ where: { no_incidente: createIncidenteDto.no_incidente } });
      if (incidenteFound) throw new HttpException('Número de incidente ya existe', HttpStatus.CONFLICT);

      const zonaFound = await this.zonaRepository.findOne({ where: { id_zona: createIncidenteDto.id_zona } });
      if (!zonaFound) throw new HttpException('Zona no existe', HttpStatus.NOT_FOUND);

      const estadoPendiente = await this.estadoAccIncRepository.findOne({ where: { id_estado_acc_inc: 6 } });
      if (!estadoPendiente) throw new HttpException('Estado Pendiente no configurado', HttpStatus.INTERNAL_SERVER_ERROR);

      if (!createIncidenteDto.no_incidente) throw new HttpException('Número de incidente obligatorio', HttpStatus.BAD_REQUEST);
      if (createIncidenteDto.aniosirecq > new Date().getFullYear() + 1) throw new HttpException('Año no puede ser futuro', HttpStatus.BAD_REQUEST);

      // 2) Construcción
      const incidenteData: Partial<Incidente> = {
        no_incidente: createIncidenteDto.no_incidente.trim().toUpperCase(),
        fechaingresoerror: this.normalizeDateNoTZ(createIncidenteDto.fechaingresoerror) || new Date(),
        tipologia: createIncidenteDto.tipologia,
        descripcionerror: createIncidenteDto.descripcionerror,
        aniosirecq: createIncidenteDto.aniosirecq,
        zona: zonaFound,
        estado_acc_inc: estadoPendiente,
        createdAt: new Date(),
        updatedAt: new Date(),
        mensajeerror: createIncidenteDto.mensajeerror ?? null,
        obs_incidente: createIncidenteDto.obs_incidente ?? null,
        fech_solucion: this.normalizeDateNoTZ(createIncidenteDto.fech_solucion),
      };

      if (createIncidenteDto.error_img) {
        if (!this.esBase64Valido(createIncidenteDto.error_img)) throw new HttpException('Formato de imagen no válido', HttpStatus.BAD_REQUEST);
        incidenteData.error_img = Buffer.from(createIncidenteDto.error_img, 'base64');
      }

      const incidente = this.incidenteRepository.create(incidenteData);
      const incidenteGuardado = await queryRunner.manager.save(incidente);

      // 3) Asignaciones directas por rol (analista / técnico)
      if (createIncidenteDto.id_analista) {
        await this.upsertUsuarioIncidentePorRol(incidenteGuardado.id_incidente, createIncidenteDto.id_analista, 2);
      }
      if (createIncidenteDto.id_tecnico) {
        await this.upsertUsuarioIncidentePorRol(incidenteGuardado.id_incidente, createIncidenteDto.id_tecnico, 7);
      }

      // 4) Asignaciones libres (si las sigues usando)
      if (createIncidenteDto.asignaciones?.length) {
        for (const asignacion of createIncidenteDto.asignaciones) {
          const rolUsuarioValido = await this.usersRolService.findOne(asignacion.idRolUsuario);
          if (!rolUsuarioValido) throw new HttpException(`RolUsuario ${asignacion.idRolUsuario} no existe`, HttpStatus.BAD_REQUEST);
          const usuarioIncidente = this.usuarioIncidenteRepository.create({
            incidente: { id_incidente: incidenteGuardado.id_incidente } as any,
            rolUsuario: { id_rol_usuario: asignacion.idRolUsuario } as any,
          });
          await queryRunner.manager.save(usuarioIncidente);
        }
      }

      await queryRunner.commitTransaction();

      // 5) Retornar completo
      const incidenteCompleto = await this.incidenteRepository.findOne({
        where: { id_incidente: incidenteGuardado.id_incidente },
        relations: [
          'zona',
          'estado_acc_inc',
          'usuariosIncidente',
          'usuariosIncidente.rolUsuario',
          'usuariosIncidente.rolUsuario.usuario',
          'usuariosIncidente.rolUsuario.rol',
        ],
      });
      if (!incidenteCompleto) throw new NotFoundException('Incidente no encontrado después de guardar');
      return incidenteCompleto;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error al crear incidente: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  /** =========================
   *  List / Get
   *  ========================= */
  async findAllIncidente(): Promise<any[]> {
    try {
      const incidentes = await this.incidenteRepository.find({
        select: ['id_incidente','no_incidente','fechaingresoerror','descripcionerror','aniosirecq','tipologia','createdAt'],
        relations: ['zona', 'estado_acc_inc'],
        order: { createdAt: 'DESC' },
      });

      return incidentes.map(i => ({
        id_incidente: i.id_incidente,
        no_incidente: i.no_incidente,
        fechaingresoerror: i.fechaingresoerror,
        descripcionerror: i.descripcionerror,
        aniosirecq: i.aniosirecq,
        tipologia: i.tipologia,
        zona: i.zona ? { id_zona: i.zona.id_zona, nombre_zona: i.zona.nombre_zona } : null,
        estado_acc_inc: i.estado_acc_inc ? {
          id_estado_acc_inc: i.estado_acc_inc.id_estado_acc_inc,
          nombre_estado_acc_inc: i.estado_acc_inc.nombre_estado_acc_inc,
        } : null,
      }));
    } catch (error) {
      console.error('❌ Error en findAllIncidente:', error);
      throw new HttpException('Error al obtener los incidentes: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      if (!incidente) throw new HttpException(`Incidente ${id_incidente} no encontrado`, HttpStatus.NOT_FOUND);

      const asignaciones = (incidente.usuariosIncidente || []).map(ui => {
        const ru = ui.rolUsuario || null;
        const usuario = ru?.usuario || null;
        const rol = ru?.rol || null;
        return {
          id_usuario_incidente: (ui as any).id_usuario_incidente ?? null,
          id_rol_usuario: ru?.id_rol_usuario ?? null,
          id_usuario: usuario?.id_usuario ?? null,
          nombre_usuario: usuario?.nombre_usuario ?? null,
          apellidos_usuario: usuario?.apellidos_usuario ?? null,
          correo_usuario: usuario?.correo_usuario ?? null,
          id_rol: rol?.id_rol ?? null,
          nombre_rol: rol?.nombre_rol ?? null,
        };
      });

      const tecnico = asignaciones.find(a => /\bT[EÉ]?CNICO\b/i.test(a?.nombre_rol || '')) || null;
      const analista = asignaciones.find(a => /\bANALISTA\b/i.test(a?.nombre_rol || '')) || null;

      return {
        id_incidente: incidente.id_incidente,
        no_incidente: incidente.no_incidente,
        fechaingresoerror: incidente.fechaingresoerror,
        fech_solucion: incidente.fech_solucion,
        descripcionerror: incidente.descripcionerror,
        aniosirecq: incidente.aniosirecq,
        mensajeerror: incidente.mensajeerror,
        tipologia: incidente.tipologia,
        obs_incidente: incidente.obs_incidente,
        zona: incidente.zona ? {
          id_zona: incidente.zona.id_zona,
          nombre_zona: incidente.zona.nombre_zona,
          ubi_zona: incidente.zona.ubi_zona,
        } : null,
        estado_acc_inc: incidente.estado_acc_inc ? {
          id_estado_acc_inc: incidente.estado_acc_inc.id_estado_acc_inc,
          nombre_estado_acc_inc: incidente.estado_acc_inc.nombre_estado_acc_inc,
          descrip_estado_acc_inc: incidente.estado_acc_inc.descrip_estado_acc_inc,
        } : null,
        id_tecnico: tecnico ? tecnico.id_usuario : null,
        id_analista: analista ? analista.id_usuario : null,
        tecnico,
        analista,
        error_img: incidente.error_img ?? null,
        _rawIncidente: incidente,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message || 'Error al obtener el incidente con usuarios', HttpStatus.INTERNAL_SERVER_ERROR);
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

  /** =========================
   *  Update
   *  ========================= */
  async updateIncidente(id_incidente: number, updateIncidenteDto: UpdateIncidenteDto): Promise<Incidente> {
    const queryRunner = this.incidenteRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const incidente = await this.incidenteRepository.findOne({
        where: { id_incidente },
        relations: ['zona', 'estado_acc_inc', 'usuariosIncidente'],
      });
      if (!incidente) throw new NotFoundException(`Incidente ${id_incidente} no encontrado`);

      // Zona
      if (updateIncidenteDto.id_zona) {
        const zonaFound = await this.zonaRepository.findOne({ where: { id_zona: updateIncidenteDto.id_zona } });
        if (!zonaFound) throw new HttpException('Zona no existe', HttpStatus.NOT_FOUND);
        incidente.zona = zonaFound;
      }

      // Número (único)
      if (updateIncidenteDto.no_incidente) {
        const repetido = await this.incidenteRepository.findOne({
          where: {
            no_incidente: updateIncidenteDto.no_incidente.trim().toUpperCase(),
            id_incidente: Not(incidente.id_incidente),
          },
        });
        if (repetido) throw new HttpException('Número de incidente ya existe', HttpStatus.CONFLICT);
        incidente.no_incidente = updateIncidenteDto.no_incidente.trim().toUpperCase();
      }

      if (updateIncidenteDto.aniosirecq && updateIncidenteDto.aniosirecq > new Date().getFullYear() + 1) {
        throw new HttpException('Año no puede ser futuro', HttpStatus.BAD_REQUEST);
      }

      // Campos principales
      incidente.tipologia = updateIncidenteDto.tipologia ?? incidente.tipologia;
      incidente.descripcionerror = updateIncidenteDto.descripcionerror ?? incidente.descripcionerror;
      incidente.aniosirecq = updateIncidenteDto.aniosirecq ?? incidente.aniosirecq;

      // Fechas y campos de texto
      if (updateIncidenteDto.fechaingresoerror !== undefined) {
        incidente.fechaingresoerror = this.normalizeDateNoTZ(updateIncidenteDto.fechaingresoerror) ?? incidente.fechaingresoerror;
      }
      if (updateIncidenteDto.fech_solucion !== undefined) {
        incidente.fech_solucion = this.normalizeDateNoTZ(updateIncidenteDto.fech_solucion);
      }
      if (updateIncidenteDto.mensajeerror !== undefined) {
        incidente.mensajeerror = updateIncidenteDto.mensajeerror;
      }
      if (updateIncidenteDto.obs_incidente !== undefined) {
        incidente.obs_incidente = updateIncidenteDto.obs_incidente;
      }

      incidente.updatedAt = new Date();

      if (updateIncidenteDto.error_img) {
        if (!this.esBase64Valido(updateIncidenteDto.error_img)) {
          throw new HttpException('Formato de imagen no válido', HttpStatus.BAD_REQUEST);
        }
        incidente.error_img = Buffer.from(updateIncidenteDto.error_img, 'base64');
      }

      // Upsert por rol para técnico/analista (si vienen en el DTO)
      if ('id_tecnico' in updateIncidenteDto) {
        await this.upsertUsuarioIncidentePorRol(incidente.id_incidente, updateIncidenteDto.id_tecnico as any, 7);
      }
      if ('id_analista' in updateIncidenteDto) {
        await this.upsertUsuarioIncidentePorRol(incidente.id_incidente, updateIncidenteDto.id_analista as any, 2);
      }

      // Asignaciones libres (si sigues usando este arreglo)
      if (updateIncidenteDto.asignaciones !== undefined) {
        const asignacionesActuales = await this.usuarioIncidenteRepository.find({
          where: { incidente: { id_incidente: incidente.id_incidente } },
          relations: ['rolUsuario'],
        });

        const connection = this.incidenteRepository.manager.connection;

        // Valida cada idRolUsuario
        for (const a of updateIncidenteDto.asignaciones) {
          const ru = await this.usersRolService.findOne(a.idRolUsuario);
          if (!ru) throw new HttpException(`RolUsuario ${a.idRolUsuario} no existe`, HttpStatus.BAD_REQUEST);
          if (ru.rol.id_rol !== 2 && ru.rol.id_rol !== 7) {
            throw new HttpException(`RolUsuario ${a.idRolUsuario} no tiene rol válido`, HttpStatus.BAD_REQUEST);
          }
        }

        // Sincroniza (posicional como lo tenías)
        const minLength = Math.min(asignacionesActuales.length, updateIncidenteDto.asignaciones.length);
        for (let i = 0; i < minLength; i++) {
          await connection.query(
            `UPDATE usuario_incidente SET id_rol_usuario = $1 WHERE id_usuario_incidente = $2`,
            [updateIncidenteDto.asignaciones[i].idRolUsuario, asignacionesActuales[i].id_usuario_incidente],
          );
        }
        for (let i = minLength; i < updateIncidenteDto.asignaciones.length; i++) {
          await connection.query(
            `INSERT INTO usuario_incidente (id_incidente, id_rol_usuario) VALUES ($1, $2)`,
            [incidente.id_incidente, updateIncidenteDto.asignaciones[i].idRolUsuario],
          );
        }
        for (let i = minLength; i < asignacionesActuales.length; i++) {
          await connection.query(
            `DELETE FROM usuario_incidente WHERE id_usuario_incidente = $1`,
            [asignacionesActuales[i].id_usuario_incidente],
          );
        }
      }

      const incidenteActualizado = await queryRunner.manager.save(incidente);
      await queryRunner.commitTransaction();

      const completo = await this.incidenteRepository.findOne({
        where: { id_incidente: incidenteActualizado.id_incidente },
        relations: [
          'zona',
          'estado_acc_inc',
          'usuariosIncidente',
          'usuariosIncidente.rolUsuario',
          'usuariosIncidente.rolUsuario.usuario',
          'usuariosIncidente.rolUsuario.rol',
        ],
      });
      if (!completo) throw new NotFoundException('Incidente no encontrado después de actualizar');
      return completo;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error detallado:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error al actualizar incidente: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  /** =========================
   *  Remove / Filtros / Estado
   *  ========================= */
  async remove(id_incidente: number): Promise<void> {
    try {
      const incidente = await this.findNoIncidente(id_incidente);
      await this.incidenteRepository.remove(incidente);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException('Error al eliminar el incidente: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error al obtener incidentes por zona: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error al obtener incidentes por estado: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      throw new HttpException('Error al obtener estadísticas: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
        throw new HttpException('Solo los incidentes con estado "Pendiente" pueden ser actualizados', HttpStatus.BAD_REQUEST);
      }

      if (updateIncidenteEstadoDto.fech_solucion !== undefined) {
        incidente.fech_solucion = this.normalizeDateNoTZ(updateIncidenteEstadoDto.fech_solucion);
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
      if (error instanceof HttpException || error instanceof NotFoundException) throw error;
      throw new HttpException('Error al actualizar el estado del incidente: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
      