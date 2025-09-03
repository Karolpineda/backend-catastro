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

  // ✅ MÉTODO PARA VALIDAR BASE64
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

  async create(createIncidenteDto: CreateIncidenteDto): Promise<Incidente> {
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

 
}