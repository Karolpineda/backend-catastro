import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsersRolDto } from './dto/create-users_rol.dto';
import { UpdateUsersRolDto } from './dto/update-users_rol.dto';
import { Rol_Usuario } from './entities/users_rol.entity';
import { Usuario } from '../usuario/usuario.entity';
import { Rol } from '../rol/rol.entity';
import * as bcrypt from 'bcryptjs';

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

    /**
   * Busca el Rol_Usuario por id_usuario y id_rol
   */
  async findByUsuarioAndRol(id_usuario: number, id_rol: number): Promise<Rol_Usuario | null> {
    return this.userRolRepository.findOne({
      where: { usuario: { id_usuario }, rol: { id_rol } },
      relations: ['usuario', 'rol'],
    });
  }

    async crearUsuarioConRol(createDto: {
    cedula_usuario?: string;
    apellidos_usuario?: string;
    nombre_usuario?: string;
    correo_usuario?: string;
    contrasenia_usuario: string;
    roles_ids: number[]; // Array de IDs de roles a asignar
  }) {
    // Validar que se envíen roles
    if (!createDto.roles_ids || createDto.roles_ids.length === 0) {
      throw new HttpException('Debe asignar al menos un rol al usuario', HttpStatus.BAD_REQUEST);
    }

    // Verificar si el correo ya existe
    if (createDto.correo_usuario) {
      const usuarioExistente = await this.usuarioRepository.findOne({
        where: { correo_usuario: createDto.correo_usuario }
      });

      if (usuarioExistente) {
        throw new HttpException('El correo electrónico ya está registrado', HttpStatus.CONFLICT);
      }
    }

    // Verificar si la cédula ya existe
    if (createDto.cedula_usuario) {
      const cedulaExistente = await this.usuarioRepository.findOne({
        where: { cedula_usuario: createDto.cedula_usuario }
      });

      if (cedulaExistente) {
        throw new HttpException('La cédula ya está registrada', HttpStatus.CONFLICT);
      }
    }

    // Verificar que todos los roles existan
    const roles = await this.rolRepository.findByIds(createDto.roles_ids);
    
    if (roles.length !== createDto.roles_ids.length) {
      throw new HttpException('Uno o más roles no existen', HttpStatus.NOT_FOUND);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createDto.contrasenia_usuario, salt);

    // Crear el usuario
    const nuevoUsuario = this.usuarioRepository.create({
      cedula_usuario: createDto.cedula_usuario,
      apellidos_usuario: createDto.apellidos_usuario,
      nombre_usuario: createDto.nombre_usuario,
      correo_usuario: createDto.correo_usuario,
      contrasenia_usuario: hashedPassword,
    });

    const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);

    // Asignar los roles al usuario
    // Declarar el tipo explícitamente
    const rolesUsuario: Rol_Usuario[] = [];
    for (const rol of roles) {
      const rolUsuario = this.userRolRepository.create({
        usuario: usuarioGuardado,
        rol: rol,
      });
      const rolGuardado = await this.userRolRepository.save(rolUsuario);
      rolesUsuario.push(rolGuardado);
    }

    // Retornar el usuario con sus roles
    return {
      usuario: {
        id_usuario: usuarioGuardado.id_usuario,
        cedula_usuario: usuarioGuardado.cedula_usuario,
        apellidos_usuario: usuarioGuardado.apellidos_usuario,
        nombre_usuario: usuarioGuardado.nombre_usuario,
        correo_usuario: usuarioGuardado.correo_usuario,
      },
      roles: rolesUsuario.map(ru => ({
        id_rol_usuario: ru.id_rol_usuario,
        rol: {
          id_rol: ru.rol.id_rol,
          nombre_rol: ru.rol.nombre_rol,
          descrip_rol: ru.rol.descrip_rol,
        }
      }))
    };
  }

  /**
   * Asigna un rol adicional a un usuario existente
   */
  async asignarRolAUsuario(id_usuario: number, id_rol: number) {
    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario }
    });

    if (!usuario) {
      throw new HttpException(`Usuario con ID ${id_usuario} no encontrado`, HttpStatus.NOT_FOUND);
    }

    // Verificar que el rol existe
    const rol = await this.rolRepository.findOne({
      where: { id_rol }
    });

    if (!rol) {
      throw new HttpException(`Rol con ID ${id_rol} no encontrado`, HttpStatus.NOT_FOUND);
    }

    // Verificar si ya tiene ese rol asignado
    const rolExistente = await this.userRolRepository.findOne({
      where: {
        usuario: { id_usuario },
        rol: { id_rol }
      }
    });

    if (rolExistente) {
      throw new HttpException('El usuario ya tiene ese rol asignado', HttpStatus.CONFLICT);
    }

    // Crear la relación
    const rolUsuario = this.userRolRepository.create({
      usuario,
      rol,
    });

    return await this.userRolRepository.save(rolUsuario);
  }

  /**
   * Obtiene todos los roles de un usuario
   */
  async obtenerRolesDeUsuario(id_usuario: number) {
    const rolesUsuario = await this.userRolRepository.find({
      where: { usuario: { id_usuario } },
      relations: ['rol', 'usuario']
    });

    if (!rolesUsuario || rolesUsuario.length === 0) {
      throw new HttpException(`No se encontraron roles para el usuario con ID ${id_usuario}`,HttpStatus.NOT_FOUND);
    }

    return rolesUsuario;
  }

  async actualizarUsuarioConRoles(
    id_usuario: number,
    updateDto: {
      cedula_usuario?: string;
      apellidos_usuario?: string;
      nombre_usuario?: string;
      correo_usuario?: string;
      contrasenia_usuario?: string;
      roles_ids?: number[];
    }
  ) {
    // Buscar usuario existente
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario }
    });

    if (!usuario) {
      throw new HttpException(
        `Usuario con ID ${id_usuario} no encontrado`,
        HttpStatus.NOT_FOUND
      );
    }

    // Validar correo único si se está actualizando
    if (updateDto.correo_usuario && updateDto.correo_usuario !== usuario.correo_usuario) {
      const existeCorreo = await this.usuarioRepository.findOne({
        where: { correo_usuario: updateDto.correo_usuario }
      });
      if (existeCorreo) {
        throw new HttpException(
          'El correo electrónico ya está registrado',
          HttpStatus.CONFLICT
        );
      }
    }

    // Validar cédula única si se está actualizando
    if (updateDto.cedula_usuario && updateDto.cedula_usuario !== usuario.cedula_usuario) {
      const existeCedula = await this.usuarioRepository.findOne({
        where: { cedula_usuario: updateDto.cedula_usuario }
      });
      if (existeCedula) {
        throw new HttpException(
          'La cédula ya está registrada',
          HttpStatus.CONFLICT
        );
      }
    }

    // Actualizar datos básicos del usuario
    if (updateDto.cedula_usuario) usuario.cedula_usuario = updateDto.cedula_usuario;
    if (updateDto.apellidos_usuario) usuario.apellidos_usuario = updateDto.apellidos_usuario;
    if (updateDto.nombre_usuario) usuario.nombre_usuario = updateDto.nombre_usuario;
    if (updateDto.correo_usuario) usuario.correo_usuario = updateDto.correo_usuario;
    
    // Actualizar contraseña si se proporciona
    if (updateDto.contrasenia_usuario) {
      const salt = await bcrypt.genSalt(10);
      usuario.contrasenia_usuario = await bcrypt.hash(updateDto.contrasenia_usuario, salt);
    }

    // Si se proporcionan roles, actualizar roles
    if (updateDto.roles_ids && updateDto.roles_ids.length > 0) {
      // Verificar que todos los roles existan
      const roles = await this.rolRepository.findByIds(updateDto.roles_ids);
      if (roles.length !== updateDto.roles_ids.length) {
        throw new HttpException(
          'Uno o más roles no existen',
          HttpStatus.NOT_FOUND
        );
      }

      // Eliminar roles anteriores
      await this.userRolRepository.delete({ usuario: { id_usuario } });

      // Crear nuevas relaciones de roles
      const rolesUsuario: Rol_Usuario[] = [];
      for (const rol of roles) {
        const rolUsuario = this.userRolRepository.create({
          usuario: usuario,
          rol: rol,
        });
        const rolGuardado = await this.userRolRepository.save(rolUsuario);
        rolesUsuario.push(rolGuardado);
      }
    }

    // Guardar cambios del usuario
    await this.usuarioRepository.save(usuario);

    // Retornar usuario actualizado con sus roles
    const usuarioActualizado = await this.usuarioRepository.findOne({
      where: { id_usuario },
      relations: ['roles_usuario', 'roles_usuario.rol']
    });

    return {
      usuario: {
        id_usuario: usuarioActualizado?.id_usuario,
        cedula_usuario: usuarioActualizado?.cedula_usuario,
        apellidos_usuario: usuarioActualizado?.apellidos_usuario,
        nombre_usuario: usuarioActualizado?.nombre_usuario,
        correo_usuario: usuarioActualizado?.correo_usuario,
      },
      roles: usuarioActualizado?.roles_usuario.map(ru => ({
        id_rol_usuario: ru.id_rol_usuario,
        rol: {
          id_rol: ru.rol.id_rol,
          nombre_rol: ru.rol.nombre_rol,
          descrip_rol: ru.rol.descrip_rol,
        }
      }))
    };
  }

// ...existing code...

  /**
   * Elimina un rol de un usuario
   */
  async removerRolDeUsuario(id_usuario: number, id_rol: number) {
    const rolUsuario = await this.userRolRepository.findOne({
      where: {
        usuario: { id_usuario },
        rol: { id_rol }
      }
    });

    if (!rolUsuario) {
      throw new HttpException('Relación usuario-rol no encontrada', HttpStatus.NOT_FOUND);
    }

    await this.userRolRepository.remove(rolUsuario);

    return { mensaje: 'Rol removido exitosamente del usuario' };
  }

async removerRolesDeUsuario(id_usuario: number, roles: number[]) {
  const rolesUsuario = await this.userRolRepository.find({
    where: roles.map(id_rol => ({
      usuario: { id_usuario },
      rol: { id_rol }
    })),
    relations: ['usuario', 'rol']
  });

  if (!rolesUsuario || rolesUsuario.length === 0) {
    throw new HttpException('No se encontraron relaciones usuario-rol para eliminar', HttpStatus.NOT_FOUND);
  }

  await this.userRolRepository.remove(rolesUsuario);

  return { mensaje: `Se removieron ${rolesUsuario.length} roles del usuario ${id_usuario} exitosamente` };
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
  async getAnalistasIncidentes(): Promise<{ id_rol_usuario: number; nombre_completo: string }[]> {
    try {
      const usuarios = await this.userRolRepository.find({
        where: { rol: { id_rol: 2 } }, 
        relations: ['usuario'],
        select: {
          id_rol_usuario: true,
          usuario: {
            nombre_usuario: true,
            apellidos_usuario: true,
          },
        },
      });

      return usuarios.map(ru => ({
        id_rol_usuario: ru.id_rol_usuario, // Este se guardará en tu BD
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

  async ejecutor(): Promise<{ id_rol_usuario: number; nombre_completo: string }[]> {
    try {
      const usuarios = await this.userRolRepository.find({
        where: { rol: { id_rol: 8 } }, 
        relations: ['usuario'],
        select: {
          id_rol_usuario: true,
          usuario: {
            nombre_usuario: true,
            apellidos_usuario: true,
          },
        },
      });

      return usuarios.map(ru => ({
        id_rol_usuario: ru.id_rol_usuario, // Este se guardará en tu BD
        nombre_completo: `${ru.usuario.nombre_usuario} ${ru.usuario.apellidos_usuario}`,
      }));
    } catch (error) {
      throw new HttpException(
        'Error al obtener tecnico producción de incidentes',
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