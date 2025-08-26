import { Injectable } from '@nestjs/common';
import { Zona } from './zona.entity'
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Not, And, Repository, Or } from 'typeorm';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { not } from 'rxjs/internal/util/not';

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

    getZonaNotDireccion(){
        return this.zonaRepository.find({ 
            where: { 
            nombre_zona: And(
                Not(Like('UNIDAD%')),
                Not(Like('DIRECCIÓN%')),
                Not(Like('ALCALDÍA%'))
            )
         } });    
    }
    getDirección(){
        return this.zonaRepository.find({ 
            where: { 
            nombre_zona: Or(
                (Like('UNIDAD%')),
                (Like('DIRECCIÓN%')),
                (Like('ALCALDÍA%'))
            )
         } });    
    }
 }




