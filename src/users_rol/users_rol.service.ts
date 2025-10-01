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

  async findOne(id: number | string) {
    // Debug: log para ver qué está llegando
    console.log('findOne recibió:', id, 'tipo:', typeof id);
    
    // Validar que el ID sea un número válido
    const parsedId = Number(id);
    
    if (isNaN(parsedId) || parsedId <= 0 || !Number.isInteger(parsedId)) {
      throw new HttpException(
        `ID inválido: '${id}' no es un número entero válido`, 
        HttpStatus.BAD_REQUEST
      );
    }

    const userRol = await this.userRolRepository.findOne({
      where: { id_rol_usuario: parsedId },
      relations: ['usuario', 'rol'],
    });

    if (!userRol) {
      throw new HttpException('Asignación no encontrada', HttpStatus.NOT_FOUND);
    }

    return userRol;
  }

  async findByUser(userId: number) {
    // Validar que el ID sea un número válido
    const parsedUserId = Number(userId);
    
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      throw new HttpException('ID de usuario inválido', HttpStatus.BAD_REQUEST);
    }

    return await this.userRolRepository
      .createQueryBuilder('userRol')
      .innerJoinAndSelect('userRol.usuario', 'usuario')
      .innerJoinAndSelect('userRol.rol', 'rol')
      .where('usuario.id_usuario = :userId', { userId: parsedUserId })
      .getMany();
  }

  async findByRol(rolId: number) {
    // Validar que el ID sea un número válido
    const parsedRolId = Number(rolId);
    
    if (isNaN(parsedRolId) || parsedRolId <= 0) {
      throw new HttpException('ID de rol inválido', HttpStatus.BAD_REQUEST);
    }

    return await this.userRolRepository
      .createQueryBuilder('userRol')
      .innerJoinAndSelect('userRol.usuario', 'usuario')
      .innerJoinAndSelect('userRol.rol', 'rol')
      .where('rol.id_rol = :rolId', { rolId: parsedRolId })
      .getMany();
  }

  async remove(id: number) {
    // Validar que el ID sea un número válido
    const parsedId = Number(id);
    
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
    }

    const userRol = await this.userRolRepository.findOne({
      where: { id_rol_usuario: parsedId },
    });

    if (!userRol) {
      throw new HttpException('Asignación no encontrada', HttpStatus.NOT_FOUND);
    }

    await this.userRolRepository.remove(userRol);
    return { message: 'Asignación eliminada correctamente' };
  }

  // Método para traer al técnico de incidentes (responsable)
  async getTecnicoIncidentes(): Promise<{ id_usuario: number; nombre_completo: string }[]> {
    try {
      const usuarios = await this.userRolRepository.find({
        where: { rol: { id_rol: 7 } }, 
        relations: ['usuario'],
        select: {
          id_rol_usuario: true,
          usuario: {
            id_usuario: true,
            nombre_usuario: true,
            apellidos_usuario: true,
          },
        },
      });

      return usuarios.map(ru => ({
        id_usuario: ru.usuario.id_usuario,
        nombre_completo: `${ru.usuario.nombre_usuario} ${ru.usuario.apellidos_usuario}`,
      }));
    } catch (error) {
      throw new HttpException(
        'Error al obtener técnicos de incidentes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para traer a los analistas de incidentes
  async getAnalistasIncidentes(): Promise<{ id_usuario: number; nombre_completo: string }[]> {
    try {
      const usuarios = await this.userRolRepository.find({
        where: { rol: { id_rol: 2 } }, 
        relations: ['usuario'],
        select: {
          id_rol_usuario: true,
          usuario: {
            id_usuario: true,
            nombre_usuario: true,
            apellidos_usuario: true,
          },
        },
      });

      return usuarios.map(ru => ({
        id_usuario: ru.usuario.id_usuario,
        nombre_completo: `${ru.usuario.nombre_usuario} ${ru.usuario.apellidos_usuario}`,
      }));
    } catch (error) {
      throw new HttpException(
        'Error al obtener analistas de incidentes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para traer a los analistas de accidentes
  async getAnalistasAccidentes(): Promise<{ id_usuario: number; nombre_completo: string }[]> {
    try {
      const usuarios = await this.userRolRepository.find({
        where: { rol: { id_rol: 6 } },
        relations: ['usuario'],
        select: {
          id_rol_usuario: true,
          usuario: {
            id_usuario: true,
            nombre_usuario: true,
            apellidos_usuario: true,
          },
        },
      });

      return usuarios.map(ru => ({
        id_usuario: ru.usuario.id_usuario,
        nombre_completo: `${ru.usuario.nombre_usuario} ${ru.usuario.apellidos_usuario}`,
      }));
    } catch (error) {
      throw new HttpException(
        'Error al obtener analistas de accidentes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

/// MÉTODO PARA TRAER AL TÉCNICO DE REQUERIMIENTOS PENDIENTE SABER QUIENES SON
  //  async getTecnicoReque(): Promise<{ id_usuario: number; nombre_completo: string }[]> {
  //   try {
  //     const usuarios = await this.userRolRepository.find({
  //       where: { rol: { id_rol: 3 } },
  //       relations: ['usuario'],
  //       select: {
  //         id_rol_usuario: true,
  //         usuario: {
  //           id_usuario: true,
  //           nombre_usuario: true,
  //           apellidos_usuario: true,
  //         },
  //       },
  //     });

  //     return usuarios.map(ru => ({
  //       id_usuario: ru.usuario.id_usuario,
  //       nombre_completo: `${ru.usuario.nombre_usuario} ${ru.usuario.apellidos_usuario}`,
  //     }));
  //   } catch (error) {
  //     throw new HttpException(
  //       'Error al obtener analistas de accidentes',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // Método para obtener el rol del usuario por id_usuario
  async getRolByUsuarioId(id_usuario: number): Promise<{ id_rol: number; nombre_rol: string }> {
    try {
      const userRol = await this.userRolRepository.findOne({
        where: { usuario: { id_usuario: id_usuario } },
        relations: ['rol'],
        select: {
          rol: {
            id_rol: true,
            nombre_rol: true,
          },
        },
      });

      if (!userRol) {
        throw new HttpException('Usuario no encontrado o sin rol asignado', HttpStatus.NOT_FOUND);
      }

      return {
        id_rol: userRol.rol.id_rol,
        nombre_rol: userRol.rol.nombre_rol,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al obtener el rol del usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}