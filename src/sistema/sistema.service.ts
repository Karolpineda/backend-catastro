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

    async getNombreSistema(nom_sistema: string){
        const sistemaFound = await this.sistemaRepository.findOne({ where: { nom_sistema: nom_sistema } });

        if(!sistemaFound){
            return new HttpException('Sistema no encontrado', HttpStatus.NOT_FOUND);    
        } else {
            return sistemaFound
        }
    }

    async deleteSistema(nom_sistema: string){
        const sistemaFound = await this.sistemaRepository.findOne({ where: { nom_sistema: nom_sistema } });

        if(!sistemaFound){
            return new HttpException('Sistema no enconntrado', HttpStatus.NOT_FOUND);
        } else {
            return this.sistemaRepository.delete({ nom_sistema: nom_sistema });
        }
    }

    async updateSistema(nom_sistema: string, sistema:UpdateSistemaDto){
        const sistemaFound = await this.sistemaRepository.findOne({ where: { nom_sistema: nom_sistema } });

        if(!sistemaFound){
            return new HttpException('Sistema no enconntrado', HttpStatus.NOT_FOUND);
        } else {
            const updateSistema = Object.assign(sistemaFound, sistema);
            return this.sistemaRepository.save(updateSistema);
        }
    }



}
