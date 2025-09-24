import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Sistema } from './sistema.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSistemaDto } from './dto/create-sistema.dto';
import { UpdateSistemaDto } from './dto/update-sistema.dto';

@Injectable()
export class SistemaService {

    constructor(@InjectRepository(Sistema) private sistemaRepository: Repository<Sistema>){}

    async createSistema(sistema: CreateSistemaDto){
        const sistemaFound =await this.sistemaRepository.findOne({ where: { siglas_sistema: sistema.siglas_sistema } });
         if(sistemaFound){
            return new HttpException('Sistema ya existe',HttpStatus.CONFLICT);
         } else {
            const newSistema = this.sistemaRepository.create(sistema);
            return this.sistemaRepository.save(newSistema);
         }
    }
    
    async getAllSistema(){
        return this.sistemaRepository.find();
    }

    async getNombreSistema(id_sistema: number){
        const sistemaFound = await this.sistemaRepository.findOne({ where: { id_sistema: id_sistema } });

        if(!sistemaFound){
            return new HttpException('Sistema no encontrado', HttpStatus.NOT_FOUND);    
        } else {
            return sistemaFound
        }
    }

    async deleteSistema(id_sistema: number){
        const sistemaFound = await this.sistemaRepository.findOne({ where: { id_sistema: id_sistema } });

        if(!sistemaFound){
            return new HttpException('Sistema no enconntrado', HttpStatus.NOT_FOUND);
        } else {
            return this.sistemaRepository.delete({ id_sistema: id_sistema });
        }
    }

    async updateSistema(id_sistema: number, sistema:UpdateSistemaDto){
        const sistemaFound = await this.sistemaRepository.findOne({ where: { id_sistema: id_sistema } });

        if(!sistemaFound){
            return new HttpException('Sistema no enconntrado', HttpStatus.NOT_FOUND);
        } else {
            const updateSistema = Object.assign(sistemaFound, sistema);
            return this.sistemaRepository.save(updateSistema);
        }
    }



}
