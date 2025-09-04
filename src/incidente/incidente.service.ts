import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incidente } from './entities/incidente.entity';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { Zona } from 'src/zona/zona.entity';
import { Estado_acc_inc } from 'src/estado_acc_inc/estado_acc_inc.entity';

@Injectable()
export class IncidenteService {
  
  constructor (
    @InjectRepository(Incidente) 
    private incidenteRepository: Repository<Incidente>,
    @InjectRepository(Zona) 
    private zonaRepository: Repository<Zona>,
    @InjectRepository(Estado_acc_inc) 
    private estadoAccIncRepository: Repository<Estado_acc_inc>
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
      async createIncidente(createIncidenteDto: CreateIncidenteDto): Promise<Incidente> {
        try {
          const incidenteFound = await this.incidenteRepository.findOne({ 
            where: { no_incidente: createIncidenteDto.no_incidente} 
          });
          if (incidenteFound) {
            throw new HttpException('El número de incidente ya existe', HttpStatus.CONFLICT);
          }
          const zonaFound = await this.zonaRepository.findOne({ 
            where: { id_zona: createIncidenteDto.id_zona } 
          });
          
          if (!zonaFound) {
            throw new HttpException('Zona no existe', HttpStatus.NOT_FOUND);
          }

          const estadoPendiente = await this.estadoAccIncRepository.findOne({ 
            where: { id_estado_acc_inc: 6 } 
          });
          
          if (!estadoPendiente) {
            throw new HttpException(
              'Estado "Pendiente" no configurado en el sistema',
              HttpStatus.INTERNAL_SERVER_ERROR
            );
          }

          if (!createIncidenteDto.no_incidente) {
            throw new HttpException('El número de incidente es obligatorio', HttpStatus.BAD_REQUEST);
          }

          if (createIncidenteDto.añosirecq > new Date().getFullYear() + 1) {
            throw new HttpException('El año no puede ser futuro', HttpStatus.BAD_REQUEST);
          }

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
            if (!this.esBase64Valido(createIncidenteDto.error_img)) {
              throw new HttpException('El formato de la imagen no es válido', HttpStatus.BAD_REQUEST);
            }
            incidenteData.error_img = Buffer.from(createIncidenteDto.error_img, 'base64');
          }
          const incidente = this.incidenteRepository.create(incidenteData);
          const incidenteGuardado = await this.incidenteRepository.save(incidente);

          // RETORNAR INCIDENTE COMPLETO
          const incidenteCompleto = await this.incidenteRepository.findOne({
            where: { id_incidente: incidenteGuardado.id_incidente },
            relations: ['zona', 'estado_acc_inc'],
          });

          if (!incidenteCompleto) {
            throw new NotFoundException('Incidente no encontrado después de guardar');
          }

          return incidenteCompleto;

        } catch (error) {
          // Si ya es una HttpException, relanzarla
          if (error instanceof HttpException) {
            throw error;
          }
          throw new HttpException(
            `Error al crear incidente: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
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
}