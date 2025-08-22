import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Usuario } from './usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto'
import { UpdateUsuarioDto } from './dto/update-usuario.dto';


@Injectable()
export class UsuarioService {

    constructor(@InjectRepository(Usuario) private usuarioRepository: Repository<Usuario>){}

    async createUsuario(usuario: CreateUsuarioDto){
        const usuarioFound =await this.usuarioRepository.findOne({ where: { cedula_usuario: usuario.cedula_usuario } });
        if (usuarioFound) {
            return new HttpException('Usuario ya existe', HttpStatus.CONFLICT);
        }
            else {
            const newUsuario = this.usuarioRepository.create(usuario);
            return this.usuarioRepository.save(newUsuario);
        }
    }

    async getAllUsuario(){
        return this.usuarioRepository.find();
    }

    async getCedulaUsuario(cedula_usuario:string){
        const usuarioFound =await this.usuarioRepository.findOne({ where: { cedula_usuario: cedula_usuario } });
        if(!usuarioFound) {
            return new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
        } else {
            return usuarioFound;
        }
    }

    async updateUsuario(cedula_usuario:string, usuario: UpdateUsuarioDto){
        const usuarioFound =await this.usuarioRepository.findOne({ where: { cedula_usuario} });
        if(!usuarioFound) {
            return new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
        } else {

            const updateUsuario = Object.assign(usuarioFound, usuario);
            return this.usuarioRepository.save(updateUsuario);
        }
    }

    async deleteUsuario (cedula_usuario:string){
        const usuarioFound =await this.usuarioRepository.findOne({ where: { cedula_usuario} });
        if(!usuarioFound) {
            return new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
        } else {

            return this.usuarioRepository.delete({ cedula_usuario: cedula_usuario });
        }
    }
}