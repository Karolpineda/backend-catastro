import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
              if (createIncidenteDto.añosirecq > new Date().getFullYear() + 1) throw new HttpException('Año no puede ser futuro', HttpStatus.BAD_REQUEST);

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
                añosirecq: createIncidenteDto.añosirecq,
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
      async findNoIncidente(no_incidente: string): Promise<Incidente> {
        const incidente = await this.incidenteRepository.findOne({
            where: { no_incidente: no_incidente },
            relations: ['zona', 'estado_acc_inc'],
          });

          if (!incidente) {
            throw new HttpException('Incidente ${no_incidente} no encontrado', HttpStatus.NOT_FOUND);
          }
          return incidente;
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
      async update(no_incidente: string, updateIncidenteDto: UpdateIncidenteDto): Promise<Incidente> {
        try {
          const incidente = await this.findNoIncidente(no_incidente);
          if (!incidente) {
            throw new HttpException('Incidente no encontrado', HttpStatus.NOT_FOUND);
          }
          if (updateIncidenteDto.id_zona) {
            const zonaFound = await this.zonaRepository.findOne({ 
              where: { id_zona: updateIncidenteDto.id_zona } 
            });
            
            if (!zonaFound) {
              throw new HttpException('Zona no existe', HttpStatus.NOT_FOUND);
            }
            incidente.zona = zonaFound;
          }

          Object.assign(incidente, updateIncidenteDto);

          if (updateIncidenteDto.error_img !== undefined) {
            if (updateIncidenteDto.error_img === null) {
              incidente.error_img = null;
            } else if (updateIncidenteDto.error_img) {
              if (!this.esBase64Valido(updateIncidenteDto.error_img)) {
                throw new HttpException('El formato de la imagen no es válido', HttpStatus.BAD_REQUEST);
              }
              incidente.error_img = Buffer.from(updateIncidenteDto.error_img, 'base64');
            }
          }
          incidente.updatedAt = new Date();
          return await this.incidenteRepository.save(incidente);
          
        } catch (error) {
          if (error instanceof HttpException || error instanceof NotFoundException) {
            throw error;
          }
          
          throw new HttpException(
            'Error al actualizar el incidente: ' + error.message,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }
      async remove(no_incidente: string): Promise<void> {
        try {
          const incidente = await this.findNoIncidente(no_incidente);
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