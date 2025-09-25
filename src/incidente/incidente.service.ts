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
        } catch (error) {
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
              // 1. VALIDACIONES del incidente
              const incidenteFound = await this.incidenteRepository.findOne({ 
                where: { no_incidente: createIncidenteDto.no_incidente} 
              });
              if (incidenteFound) throw new HttpException('Número de incidente ya existe', HttpStatus.CONFLICT);

              const zonaFound = await this.zonaRepository.findOne({ where: { id_zona: createIncidenteDto.id_zona } });
              if (!zonaFound) throw new HttpException('Zona no existe', HttpStatus.NOT_FOUND);

              const estadoPendiente = await this.estadoAccIncRepository.findOne({ where: { id_estado_acc_inc: 6 } });
              if (!estadoPendiente) throw new HttpException('Estado Pendiente no configurado', HttpStatus.INTERNAL_SERVER_ERROR);

              // Validaciones básicas
              if (!createIncidenteDto.no_incidente) throw new HttpException('Número de incidente obligatorio', HttpStatus.BAD_REQUEST);
              if (createIncidenteDto.aniosirecq > new Date().getFullYear() + 1) throw new HttpException('Año no puede ser futuro', HttpStatus.BAD_REQUEST);

              // 2. VALIDAR ASIGNACIONES de usuarios
              if (createIncidenteDto.asignaciones && createIncidenteDto.asignaciones.length > 0) {
                for (const asignacion of createIncidenteDto.asignaciones) {
                  const rolUsuarioValido = await this.usersRolService.findOne(asignacion.idRolUsuario);
                  if (!rolUsuarioValido) throw new HttpException(`RolUsuario ${asignacion.idRolUsuario} no existe`, HttpStatus.BAD_REQUEST);
                  
                  // Validar que sea rol de técnico (7) o analista (2)
                  if (rolUsuarioValido.rol.id_rol !== 2 && rolUsuarioValido.rol.id_rol !== 7) {
                    throw new HttpException(`RolUsuario ${asignacion.idRolUsuario} no tiene rol válido`, HttpStatus.BAD_REQUEST);
                  }
                }
              }

              // 3. CREAR INCIDENTE
              const incidenteData: Partial<Incidente> = {
                no_incidente: createIncidenteDto.no_incidente.trim().toUpperCase(),
                fechaingresoerror: createIncidenteDto.fechaingresoerror || new Date(),
                tipologia: createIncidenteDto.tipologia,
                descripcionerror: createIncidenteDto.descripcionerror,
                aniosirecq: createIncidenteDto.aniosirecq,
                zona: zonaFound,                    
                estado_acc_inc: estadoPendiente,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              if (createIncidenteDto.error_img) {
                if (!this.esBase64Valido(createIncidenteDto.error_img)) throw new HttpException('Formato de imagen no válido', HttpStatus.BAD_REQUEST);
                incidenteData.error_img = Buffer.from(createIncidenteDto.error_img, 'base64');
              }

              const incidente = this.incidenteRepository.create(incidenteData);
              const incidenteGuardado = await queryRunner.manager.save(incidente);

              // 4. CREAR ASIGNACIONES EN TABLA DE ROMPIMIENTO
              if (createIncidenteDto.asignaciones && createIncidenteDto.asignaciones.length > 0) {
                for (const asignacion of createIncidenteDto.asignaciones) {
                  const usuarioIncidenteData = {
                    incidente: { id_incidente: incidenteGuardado.id_incidente },
                    rolUsuario: { id_rol_usuario: asignacion.idRolUsuario }
                  };
                  const usuarioIncidente = this.usuarioIncidenteRepository.create(usuarioIncidenteData);
                  await queryRunner.manager.save(usuarioIncidente);
                }
              }

              await queryRunner.commitTransaction();

              // 5. RETORNAR INCIDENTE COMPLETO
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
              return incidenteCompleto;

            } catch (error) {
              await queryRunner.rollbackTransaction();
              if (error instanceof HttpException) throw error;
              throw new HttpException(`Error al crear incidente: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
            } finally {
              await queryRunner.release();
            }
          }

      async findAllIncidente(): Promise<Incidente[]> {
        try {
          return await this.incidenteRepository.find({
            relations: ['zona', 'estado_acc_inc'],
            order: { createdAt: 'DESC' },
          });
        } catch (error) {
          throw new HttpException(
            'Error al obtener los incidentes: ' + error.message,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }
     


// Método para obtener incidente con usuario responsable (técnico) y analista
        async findNoIncidente(id_incidente: number): Promise<any> {
          try {
            const incidente = await this.incidenteRepository.findOne({
              where: { id_incidente },
              relations: [
                'zona',
                'estado_acc_inc',
                // relaciones necesarias para traer los usuarios asociados y sus roles
                'usuariosIncidente',
                'usuariosIncidente.rolUsuario',
                'usuariosIncidente.rolUsuario.usuario',
                'usuariosIncidente.rolUsuario.rol',
              ],
            });

            if (!incidente) {
              throw new HttpException(`Incidente ${id_incidente} no encontrado`, HttpStatus.NOT_FOUND);
            }

            // Normalizar y mapear las asignaciones / usuarios relacionados
            const asignaciones = (incidente.usuariosIncidente || []).map((ui) => {
              const rolUsuario = ui.rolUsuario || null;
              const usuario = rolUsuario?.usuario || null;
              const rol = rolUsuario?.rol || null;

              return {
                // id del registro usuario_incidente (si existe en tu entidad)
                id_usuario_incidente: (ui as any).id_usuario_incidente ?? null,
                // id del rol_usuario (tabla rol_usuario)
                id_rol_usuario: rolUsuario?.id_rol_usuario ?? null,
                // datos del usuario
                id_usuario: usuario?.id_usuario ?? null,
                nombre_usuario: usuario?.nombre_usuario ?? null,
                apellidos_usuario: usuario?.apellidos_usuario ?? null,
                correo_usuario: usuario?.correo_usuario ?? null,
                // datos del rol
                id_rol: rol?.id_rol ?? null,
                nombre_rol: rol?.nombre_rol ?? null,
              };
            });

            // Heurística para identificar técnico / analista por nombre de rol
            const matchRole = (roleName?: string, rx?: RegExp) =>
              !!(roleName && rx && rx.test(roleName));

            const tecnico = asignaciones.find((a) =>
              matchRole(a.nombre_rol, /\bT[EÉ]CNICO\b/i) || matchRole(a.nombre_rol, /\bTECNICO\b/i)
            ) || null;

            const analista = asignaciones.find((a) =>
              matchRole(a.nombre_rol, /\bANALISTA\b/i)
            ) || null;

            // Construir payload limpio que el frontend puede mapear fácilmente
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
              // zona y estado (estructura plana)
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
              tecnico: tecnico,   // objeto null o datos del tecnico (id_usuario, nombre_usuario, id_rol, nombre_rol, etc.)
              analista: analista, // objeto null o datos del analista
              // si quieres incluir la imagen (buffer) en bruto, puede venir aquí:
              error_img: incidente.error_img ?? null,
              // mantengo el raw del incidente por si necesitas más campos en front
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
          // 1. VALIDAR QUE EL INCIDENTE EXISTA Y OBTENER EL ID
          const incidente = await this.incidenteRepository.findOne({
            where: { id_incidente },
            relations: ['zona', 'estado_acc_inc', 'usuariosIncidente'],
          });
          if (!incidente) throw new NotFoundException(`Incidente ${id_incidente} no encontrado`);

          // VERIFICACIÓN CRÍTICA: Asegurar que tenemos el ID del incidente
          if (!incidente.id_incidente) {
            throw new HttpException('No se pudo obtener el ID del incidente', HttpStatus.INTERNAL_SERVER_ERROR);
          }

          console.log('Incidente encontrado - ID:', incidente.id_incidente, 'No:', incidente.no_incidente);

          // 2. VALIDAR ZONA SI VIENE
          if (updateIncidenteDto.id_zona) {
            const zonaFound = await this.zonaRepository.findOne({ where: { id_zona: updateIncidenteDto.id_zona } });
            if (!zonaFound) throw new HttpException('Zona no existe', HttpStatus.NOT_FOUND);
            incidente.zona = zonaFound;
          }

          // 3. VALIDACIONES BÁSICAS
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

          // 4. ACTUALIZAR CAMPOS PRINCIPALES
          incidente.tipologia = updateIncidenteDto.tipologia ?? incidente.tipologia;
          incidente.descripcionerror = updateIncidenteDto.descripcionerror ?? incidente.descripcionerror;
          incidente.aniosirecq = updateIncidenteDto.aniosirecq ?? incidente.aniosirecq;
          incidente.updatedAt = new Date();

          if (updateIncidenteDto.error_img) {
            if (!this.esBase64Valido(updateIncidenteDto.error_img)) {
              throw new HttpException('Formato de imagen no válido', HttpStatus.BAD_REQUEST);
            }
            incidente.error_img = Buffer.from(updateIncidenteDto.error_img, 'base64');
          }

          // 5. ACTUALIZAR ASIGNACIONES - ACTUALIZAR EXISTENTES
      if (updateIncidenteDto.asignaciones !== undefined) {
        // Validar asignaciones primero
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

        // Obtener las asignaciones actuales del incidente
        const asignacionesActuales = await this.usuarioIncidenteRepository.find({
          where: { incidente: { id_incidente: incidente.id_incidente } },
          relations: ['rolUsuario']
        });

        console.log('Asignaciones actuales:', asignacionesActuales);
        console.log('Nuevas asignaciones:', updateIncidenteDto.asignaciones);

        // SOLUCIÓN: ACTUALIZAR las existentes en lugar de eliminar y crear
        const connection = this.incidenteRepository.manager.connection;

        // Caso 1: Actualizar asignaciones existentes
        const minLength = Math.min(asignacionesActuales.length, updateIncidenteDto.asignaciones.length);
        
        for (let i = 0; i < minLength; i++) {
          await connection.query(
            `UPDATE usuario_incidente SET id_rol_usuario = $1 WHERE id_usuario_incidente = $2`,
            [updateIncidenteDto.asignaciones[i].idRolUsuario, asignacionesActuales[i].id_usuario_incidente]
          );
        }

        // Caso 2: Crear nuevas asignaciones si el DTO tiene más
        for (let i = minLength; i < updateIncidenteDto.asignaciones.length; i++) {
          await connection.query(
            `INSERT INTO usuario_incidente (id_incidente, id_rol_usuario) VALUES ($1, $2)`,
            [incidente.id_incidente, updateIncidenteDto.asignaciones[i].idRolUsuario]
          );
        }

        // Caso 3: Eliminar asignaciones sobrantes si hay más existentes
        for (let i = minLength; i < asignacionesActuales.length; i++) {
          await connection.query(
            `DELETE FROM usuario_incidente WHERE id_usuario_incidente = $1`,
            [asignacionesActuales[i].id_usuario_incidente]
          );
        }
      }

          // 6. GUARDAR INCIDENTE ACTUALIZADO
          const incidenteActualizado = await queryRunner.manager.save(incidente);
          await queryRunner.commitTransaction();

          // 7. RETORNAR INCIDENTE COMPLETO CON RELACIONES
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

          if (!incidenteActualizadoCompleto) throw new NotFoundException('Incidente no encontrado después de actualizar');
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
          const zona = await this.zonaRepository.findOne({ 
            where: { nombre_zona: nombre_zona } 
          });
          
          if (!zona) {
            throw new HttpException('Zona no encontrada', HttpStatus.NOT_FOUND);
          }
          return await this.incidenteRepository.find({
            where: { zona: { nombre_zona: nombre_zona } },
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
          const estado = await this.estadoAccIncRepository.findOne({ 
            where: { nombre_estado_acc_inc: nombre_estado_acc_inc } 
          });
          if (!estado) {
            throw new HttpException('Estado no encontrado', HttpStatus.NOT_FOUND);
          }
          return await this.incidenteRepository.find({
            where: { estado_acc_inc: { nombre_estado_acc_inc: nombre_estado_acc_inc } },
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
      async updateEstado( no_incidente: string, updateIncidenteEstadoDto: UpdateIncidenteEstadoDto): Promise<Incidente> {
        try {  
          const incidente = await this.incidenteRepository.findOne({
            where: { no_incidente: no_incidente },
            relations: ['zona', 'estado_acc_inc'],
          });
          if (!incidente) {
            throw new HttpException('Incidente no encontrado', HttpStatus.NOT_FOUND);
          }
          const estadoFavorable = await this.estadoAccIncRepository.findOne({ 
            where: { id_estado_acc_inc: 4 } 
          });
          
          if (!estadoFavorable) {
            throw new NotFoundException('Estado "Favorable" no encontrado');
          } 
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