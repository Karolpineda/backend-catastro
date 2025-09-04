import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuario/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { correo_usuario, contrasenia_usuario } = loginDto;
    
    const usuario = await this.usuarioRepository.findOne({
      where: { correo_usuario },
      relations: ['roles_usuario', 'roles_usuario.rol']
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isPasswordValid = await bcrypt.compare(
      contrasenia_usuario,
      usuario.contrasenia_usuario,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Obtener todos los roles del usuario
    const roles = usuario.roles_usuario?.map(ru => ru.rol.nombre_rol) || ['usuario'];

    const payload: JwtPayload = {
      correo_usuario: usuario.correo_usuario,
      nombre_usuario: usuario.nombre_usuario,
      apellido_usuario: usuario.apellidos_usuario,
      roles,
    };

    return {
      usuario: {
        correo_usuario: usuario.correo_usuario,
        nombre_usuario: usuario.nombre_usuario,
        apellidos_usuario: usuario.apellidos_usuario,
        roles,
      },
      token: this.jwtService.sign(payload),
    };
  }
}
