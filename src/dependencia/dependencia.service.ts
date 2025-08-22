import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Dependencia } from './dependecia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDependenciaDto } from './dto/create-dependecia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';

@Injectable()
export class DependenciaService {
    constructor(@InjectRepository(Dependencia) private dependenciaRepository: Repository<Dependencia>){}

    async createDependencia(dependencia:CreateDependenciaDto){
        const depedenciaFound = await this.dependenciaRepository.findOne({ where: { nombre_dependencia: dependencia.nom_dependencia } });
        if(depedenciaFound){
            return new HttpException('Depencia ya existe', HttpStatus.CONFLICT)
        } else {
            const newDependencia = this.dependenciaRepository.create(dependencia);
            return this.dependenciaRepository.save(newDependencia);
        }
    }

    async getAllDependencia(){
        return this.dependenciaRepository.find();
    }

    async getNombreDependencia(nom_dependencia: string){
        const dependenciaFound = await this.dependenciaRepository.findOne({ where: { nombre_dependencia: nom_dependencia } });

        if(!dependenciaFound){
            return new HttpException('Dependencia no encontrada', HttpStatus.NOT_FOUND);
        } else {
            return dependenciaFound;
        }
    }
    async deleteDependencia(nom_dependencia: string){
        const dependenciaFound = await this.dependenciaRepository.findOne({ where: { nombre_dependencia: nom_dependencia } });

        if(!dependenciaFound){
            return new HttpException('Dependencia no encontrada', HttpStatus.NOT_FOUND);
        } else {
            return this.dependenciaRepository.delete({ nombre_dependencia: nom_dependencia });
        }
    }
    async updateDependencia(nom_dependencia: string, dependencia: UpdateDependenciaDto){
        const dependenciaFound = await this.dependenciaRepository.findOne({ where: { nombre_dependencia: nom_dependencia } });

        if(!dependenciaFound){
            return new HttpException('Dependencia no encontrada', HttpStatus.NOT_FOUND);
        } else {
            const updateDependencia = Object.assign(dependenciaFound, dependencia);
            return this.dependenciaRepository.save(updateDependencia);
        }
    }
}
