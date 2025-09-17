import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsersRolDto } from './dto/create-users_rol.dto';
import { UpdateUsersRolDto } from './dto/update-users_rol.dto';
import { Rol_Usuario } from './entities/users_rol.entity';
import { Usuario } from '../usuario/usuario.entity';
import { Rol } from '../rol/rol.entity';
import { Equal } from 'typeorm';

@Injectable()
export class UsersRolService {
  constructor(
    @InjectRepository(Rol_Usuario)
    private readonly userRolRepository: Repository<Rol_Usuario>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createUsersRolDto: CreateUsersRolDto) {
    // Verificar si el usuario existe
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario: Equal(createUsersRolDto.id_usuario) },
    });

    if (!usuario) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    // Verificar si el rol existe
    const rol = await this.rolRepository.findOne({
      where: { id_rol: Equal(createUsersRolDto.id_rol) },
    });

    if (!rol) {
      throw new HttpException('Rol no encontrado', HttpStatus.NOT_FOUND);
    }

    // Verificar si ya existe la asignación
    const existingUserRol = await this.userRolRepository
      .createQueryBuilder('userRol')
      .innerJoinAndSelect('userRol.usuario', 'usuario')
      .innerJoinAndSelect('userRol.rol', 'rol')
      .where('usuario.id_usuario = :userId', { userId: createUsersRolDto.id_usuario })
      .andWhere('rol.id_rol = :rolId', { rolId: createUsersRolDto.id_rol })
      .getOne();

    if (existingUserRol) {
      throw new HttpException(
        'El usuario ya tiene asignado este rol',
        HttpStatus.CONFLICT,
      );
    }

    // Crear la nueva asignación
    const newUserRol = this.userRolRepository.create({
      usuario: usuario,
      rol: rol,
    });

    return await this.userRolRepository.save(newUserRol);
  }

  async findAll() {
    return await this.userRolRepository.find({
      relations: ['usuario', 'rol'],
    });
  }

  async findOne(id: number) {
    const userRol = await this.userRolRepository.findOne({
      where: { id_rol_usuario: id },
      relations: ['usuario', 'rol'],
    });

    if (!userRol) {
      throw new HttpException('Asignación no encontrada', HttpStatus.NOT_FOUND);
    }

    return userRol;
  }

  async findByUser(userId: number) {
    return await this.userRolRepository
      .createQueryBuilder('userRol')
      .innerJoinAndSelect('userRol.usuario', 'usuario')
      .innerJoinAndSelect('userRol.rol', 'rol')
      .where('usuario.id_usuario = :userId', { userId })
      .getMany();
  }

  async findByRol(rolId: number) {
    return await this.userRolRepository
      .createQueryBuilder('userRol')
      .innerJoinAndSelect('userRol.usuario', 'usuario')
      .innerJoinAndSelect('userRol.rol', 'rol')
      .where('rol.id_rol = :rolId', { rolId })
      .getMany();
  }

  async remove(id: number) {
    const userRol = await this.userRolRepository.findOne({
      where: { id_rol_usuario: id },
    });

    if (!userRol) {
      throw new HttpException('Asignación no encontrada', HttpStatus.NOT_FOUND);
    }

    await this.userRolRepository.remove(userRol);
    return { message: 'Asignación eliminada correctamente' };
  }
  // Método para traer al responsable
async getTecnicoIncidentes(): Promise<{ nombre_completo: string }[]> {
  const usuarios = await this.userRolRepository.find({
    where: { rol: { id_rol: 7 } }, 
    relations: ['usuario'],
    select: {
      usuario: {
        nombre_usuario: true,
        apellidos_usuario: true,
      },
    },
  });

  return usuarios.map(ru => ({
    nombre_completo: `${ru.usuario.nombre_usuario} ${ru.usuario.apellidos_usuario}`,
  }));
}

// Método para traer a los analistas
async getAnalistasIncidentes(): Promise<{ nombre_completo: string }[]> {
  const usuarios = await this.userRolRepository.find({
    where: { rol: { id_rol: 2 } }, 
    relations: ['usuario'],
    select: {
      usuario: {
        nombre_usuario: true,
        apellidos_usuario: true,
      },
    },
  });

  return usuarios.map(ru => ({
    nombre_completo: `${ru.usuario.nombre_usuario} ${ru.usuario.apellidos_usuario}`,
  }));
}
async getAnalistasAccidentes(): Promise<{ nombre_completo: string }[]> {
  const usuarios = await this.userRolRepository.find({
    where: { rol: { id_rol: 6 } }, 
    relations: ['usuario'],
    select: {
      usuario: {
        nombre_usuario: true,
        apellidos_usuario: true,
      },
    },
  });

  return usuarios.map(ru => ({
    nombre_completo: `${ru.usuario.nombre_usuario} ${ru.usuario.apellidos_usuario}`,
  }));
}

}