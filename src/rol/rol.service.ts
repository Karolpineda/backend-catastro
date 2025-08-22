import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Rol } from './rol.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolService {
    constructor(@InjectRepository(Rol) private rolRepository: Repository<Rol>) {}

    async createRol(rol: CreateRolDto){
    const rolFound =await this.rolRepository.findOne({ where: { nombre_rol :rol.nombre_rol }});
        if( rolFound){
            return new HttpException('Rol ya Existe', HttpStatus.CONFLICT);
        } else {
            const newRol =this.rolRepository.create(rol);
            return this.rolRepository.save(newRol);
        }
    }

    async getAllRol(){
        return this.rolRepository.find();
    }

    async getNombreRol(nombre_rol:string){
        const rolFound =await this.rolRepository.findOne({ where: { nombre_rol }});
        if(!rolFound){
            return new HttpException('Rol no existe', HttpStatus.NOT_FOUND);
        } else {
            return rolFound
        }

    }

    async deleteRol(nombre_rol:string){
        const rolFound =await this.rolRepository.findOne({ where: { nombre_rol }});
        if(!rolFound){
            return new HttpException('Rol no existe', HttpStatus.NOT_FOUND);
        } else {
            return this.rolRepository.delete({ nombre_rol });
            
        }
    }

    async updateRol(nombre_rol:string, rol: UpdateRolDto){
        const rolFound =await this.rolRepository.findOne({ where: { nombre_rol }});
         if (!rolFound){
            return new HttpException('Rol no existe', HttpStatus.NOT_FOUND);
         } else {
            const updateRol = Object.assign(rolFound, rol);
            return this.rolRepository.save(updateRol);
         }

    }


}
