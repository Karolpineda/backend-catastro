import { Injectable } from '@nestjs/common';
import { Zona } from './zona.entity'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';

@Injectable()
export class ZonaService {

    constructor(@InjectRepository(Zona) private zonaRepository: Repository<Zona>){}

    createZona(zona: CreateZonaDto){
        const newZona = this.zonaRepository.create(zona)
        return this.zonaRepository.save(newZona)

        }
    getAllZona(){
        return this.zonaRepository.find();
    }
    
    getZona(nombre_zona: string){
        return this.zonaRepository.findOne({ where: { nombre_zona } });
    }
   
    deleteZona(id_zona:number){
        return this.zonaRepository.delete([id_zona]);
    }

    updateZona(id_zona:number,zona: UpdateZonaDto){
        return this.zonaRepository.update(id_zona, zona);
    }
 }




