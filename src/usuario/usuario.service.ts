import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Usuario } from './usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto'
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsuarioService {

    constructor(@InjectRepository(Usuario) private usuarioRepository: Repository<Usuario>){}

    async createUsuario(usuario: CreateUsuarioDto){
        const usuarioFound = await this.usuarioRepository.findOne({ 
            where: [
                { cedula_usuario: usuario.cedula_usuario },
                { correo_usuario: usuario.correo_usuario }
            ] 
        });
        
        if (usuarioFound) {
            if (usuarioFound.cedula_usuario === usuario.cedula_usuario) {
                throw new HttpException('La cédula ya está registrada', HttpStatus.CONFLICT);
            }
            if (usuarioFound.correo_usuario === usuario.correo_usuario) {
                throw new HttpException('El correo ya está registrado', HttpStatus.CONFLICT);
            }
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(usuario.contrasenia_usuario, 10);
        
        const newUsuario = this.usuarioRepository.create({
            ...usuario,
            contrasenia_usuario: hashedPassword
        });
        
        return this.usuarioRepository.save(newUsuario);
    }

    async getAllUsuario() {
        return this.usuarioRepository.createQueryBuilder('usuario')
        .leftJoinAndSelect('usuario.roles_usuario', 'roles_usuario')
        .leftJoinAndSelect('roles_usuario.rol', 'rol')
        .select([
            'usuario.id_usuario',
            'usuario.cedula_usuario',
            'usuario.apellidos_usuario',
            'usuario.nombre_usuario',
            'usuario.correo_usuario',
            'roles_usuario.id_rol_usuario',
            'rol.id_rol',
            'rol.nombre_rol',
            'rol.descrip_rol'
        ])
        .getMany();
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
        const usuarioFound = await this.usuarioRepository.findOne({ where: { cedula_usuario } });
        if(!usuarioFound) {
            return new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        // Si se está actualizando la contraseña, encriptarla
        if (usuario.contrasenia_usuario) {
            usuario.contrasenia_usuario = await bcrypt.hash(usuario.contrasenia_usuario, 10);
        }

        const updateUsuario = Object.assign(usuarioFound, usuario);
        return this.usuarioRepository.save(updateUsuario);
    }

    async deleteUsuario (cedula_usuario:string){
        const usuarioFound =await this.usuarioRepository.findOne({ where: { cedula_usuario} });
        if(!usuarioFound) {
            return new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
        } else {

            return this.usuarioRepository.delete({ cedula_usuario: cedula_usuario });
        }
    }

    async getUsuarioById(id_usuario: number) {
    const usuario = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .leftJoinAndSelect('usuario.roles_usuario', 'roles_usuario')
        .leftJoinAndSelect('roles_usuario.rol', 'rol')
        .select([
        'usuario.id_usuario',
        'usuario.cedula_usuario',
        'usuario.apellidos_usuario',
        'usuario.nombre_usuario',
        'usuario.correo_usuario',
        'roles_usuario.id_rol_usuario',
        'rol.id_rol',
        'rol.nombre_rol',
        'rol.descrip_rol',
        ])
        .where('usuario.id_usuario = :id_usuario', { id_usuario })
        .getOne();

    if (!usuario) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    return usuario;
    }

}