import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, DataSource, ILike } from 'typeorm';
import { Accidente } from './entities/accidente.entity';
import { CreateAccidenteDto } from './dto/create-accidente.dto';
import { UpdateAccidenteDto } from './dto/update-accidente.dto';
import { Estado_acc_inc } from 'src/estado_acc_inc/estado_acc_inc.entity';
import { Rol_Usuario } from 'src/users_rol/entities/users_rol.entity';
import { UsersRolService} from 'src/users_rol/users_rol.service'
import { Zona } from 'src/zona/zona.entity'


@Injectable()
export class AccidenteService {
  constructor(
    @InjectRepository(Accidente)
    private accidenteRepository: Repository<Accidente>,
    @InjectRepository(Estado_acc_inc)
    private estadoAccIncRepository: Repository<Estado_acc_inc>,
    @InjectRepository(Rol_Usuario) // Añadir esto
    private rolUsuarioRepository: Repository<Rol_Usuario>,
    @InjectRepository(Zona)
    private zonaRepository: Repository<Zona>,
    private usersRolService: UsersRolService,
    // private DIAS_LIMITE_DEVUELTO = 10,
    // private logger = new Logger(AccidenteService.name),
  ) {}

  async createAccidente(createAccidenteDto: CreateAccidenteDto): Promise<Accidente> {
  // Validar que trámite o oficio esté presente
  if (createAccidenteDto.tramite_accidente && createAccidenteDto.oficio_memorando_mail) {
        throw new HttpException(
          'Solo debe ingresar trámite O número de oficio/memorando/mail, no ambos',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!createAccidenteDto.tramite_accidente && !createAccidenteDto.oficio_memorando_mail) {
        throw new HttpException(
          'Debe ingresar trámite O número de oficio/memorando/mail',
          HttpStatus.BAD_REQUEST,
        );
      }

    // ✅ NUEVO: Validar que no se repitan trámite u oficio
      if (createAccidenteDto.tramite_accidente) {
        const tramiteExistente = await this.accidenteRepository.findOne({
          where: { tramite_accidente: createAccidenteDto.tramite_accidente }
        });

        if (tramiteExistente) {
          throw new HttpException(
            `Ya existe un accidente con el trámite: ${createAccidenteDto.tramite_accidente}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (createAccidenteDto.oficio_memorando_mail) {
        const oficioExistente = await this.accidenteRepository.findOne({
          where: { oficio_memorando_mail: createAccidenteDto.oficio_memorando_mail }
        });

        if (oficioExistente) {
          throw new HttpException(
            `Ya existe un accidente con el oficio/memorando/mail: ${createAccidenteDto.oficio_memorando_mail}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

  const camposObligatorios = [
    { campo: 'fech_ingr_tramite', nombre: 'fecha de ingreso del trámite' },
    { campo: 'fecha_asignacion', nombre: 'fecha de asignación' },
    { campo: 'tipologia', nombre: 'tipología' },
    { campo: 'inspeccion', nombre: 'inspección' },
    { campo: 'predio', nombre: 'predio' },
    { campo: 'clave_catastral', nombre: 'clave catastral' },
    { campo: 'nom_propietario', nombre: 'nombre del propietario' },
    { campo: 'id_zona', nombre: 'zona' },
    { campo: 'id_rol_usuario', nombre: 'rol de usuario' }
  ];

  for (const { campo, nombre } of camposObligatorios) {
    if (createAccidenteDto[campo] === null || createAccidenteDto[campo] === undefined || createAccidenteDto[campo] === '') {
      throw new HttpException(
        `El campo ${nombre} es obligatorio`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // Validar estado (no debe ser "Favorable")
  const estado = await this.estadoAccIncRepository.findOne({
    where: {
      id_estado_acc_inc: createAccidenteDto.id_estado_acc_inc,
      nombre_estado_acc_inc: Not('Favorable'),
    },
  });
  if (!estado) {
    throw new HttpException(
      'El estado seleccionado no es válido o es "Favorable"', HttpStatus.BAD_REQUEST,
    );
  }

  // Validar zona
  const zona = await this.zonaRepository.findOne({
    where: { id_zona: createAccidenteDto.id_zona },
  });
  if (!zona) {
    throw new HttpException('La zona seleccionada no existe', HttpStatus.BAD_REQUEST);
  }

  // Validar rol de usuario
  const rolUsuario = await this.rolUsuarioRepository.findOne({
    where: { id_rol_usuario: createAccidenteDto.id_rol_usuario },
  });
  if (!rolUsuario) {
    throw new HttpException('El rol de usuario seleccionado no existe', HttpStatus.BAD_REQUEST);
  }

  // Crear accidente con las relaciones
  const accidente = this.accidenteRepository.create({
    ...createAccidenteDto,
    estadoAccInc: estado,
    zona: zona,
    rolUsuario: rolUsuario,
  });

  return this.accidenteRepository.save(accidente);
}


  // Obtener todos los estados menos el "Favorable"
  async getEstadosNoFavorable(): Promise<Estado_acc_inc[]> {
    return this.estadoAccIncRepository.find({
      where: { nombre_estado_acc_inc: Not('FAVORABLE') },
    });
  }

  async getAnalistasAccidentes() {
    return await this.usersRolService.getAnalistasAccidentes();
  }


  async findAll(
    page: number = 1,
    limit: number = 10,
    tramite?: string,
  ) {
    try {
      const skip = (page - 1) * limit;
      
      const whereCondition: any = {};
      
      if (tramite) {
        whereCondition.tramite_accidente = ILike(`%${tramite}%`);
      }

      const [accidentes, total] = await this.accidenteRepository.findAndCount({
        where: whereCondition,
        relations: ['estadoAccInc', 'rolUsuario', 'zona'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return {
        data: accidentes,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener los accidentes: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneByTramite(id_accidente: number) {
    try {
      const accidente = await this.accidenteRepository.findOne({
        where: { id_accidente: id_accidente },
        relations: ['estadoAccInc', 'rolUsuario', 'zona'],
      });

      if (!accidente) {
        throw new HttpException(
          `Accidente con trámite ${id_accidente} no encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }

      return accidente;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al buscar el accidente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateByTramiteOrOficio(
  id_accidente: number,
  updateAccidenteDto: UpdateAccidenteDto,
) {
  try {
    const accidente = await this.accidenteRepository.findOne({
      where: [
        { id_accidente:id_accidente }
      ],
      relations: ['estadoAccInc', 'zona', 'rolUsuario'],
    });

    if (!accidente) {
      throw new HttpException(
        `Accidente con trámite/oficio "${id_accidente}" no encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Validación: No permitir actualización si el estado es CANCELADO
    if (
      accidente.estadoAccInc &&
      accidente.estadoAccInc.nombre_estado_acc_inc &&
      accidente.estadoAccInc.nombre_estado_acc_inc.toUpperCase() === 'CANCELADO'
    ) {
      throw new HttpException(
        'No se puede actualizar un accidente con estado CANCELADO',
        HttpStatus.FORBIDDEN,
      );
    }

    // Actualizar solo los campos que vienen en el DTO
    Object.keys(updateAccidenteDto).forEach(key => {
      if (updateAccidenteDto[key] !== undefined) {
        accidente[key] = updateAccidenteDto[key];
      }
    });

    // Si se actualizan relaciones, buscar las entidades correspondientes
    if (updateAccidenteDto.id_estado_acc_inc !== undefined) {
      const estado = await this.estadoAccIncRepository.findOne({
        where: { id_estado_acc_inc: updateAccidenteDto.id_estado_acc_inc }
      });
      if (estado) {
        accidente.estadoAccInc = estado;
      }
    }

    if (updateAccidenteDto.id_zona !== undefined) {
      const zona = await this.zonaRepository.findOne({
        where: { id_zona: updateAccidenteDto.id_zona }
      });
      if (zona) {
        accidente.zona = zona;
      }
    }

    if (updateAccidenteDto.id_rol_usuario !== undefined) {
      const rolUsuario = await this.rolUsuarioRepository.findOne({
        where: { id_rol_usuario: updateAccidenteDto.id_rol_usuario }
      });
      if (rolUsuario) {
        accidente.rolUsuario = rolUsuario;
      }
    }

    const accidenteActualizado = await this.accidenteRepository.save(accidente);

    return {
      message: 'Accidente actualizado exitosamente',
      data: accidenteActualizado,
    };

  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      `Error al actualizar el accidente: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

  async remove(id_accidente: number) {
    try {

      const accidente = await this.accidenteRepository.findOne({
        where: {id_accidente: id_accidente }
      });

      if (!accidente) {
        throw new HttpException(
          `Accidente con ID ${id_accidente} no encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }

      const result = await this.accidenteRepository.delete(id_accidente);

      if (result.affected === 0) {
        throw new HttpException(
          'No se pudo eliminar el accidente',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        message: 'Accidente eliminado exitosamente',
        id_accidente: id_accidente,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.code === '23503') { 
        throw new HttpException(
          'No se puede eliminar el accidente porque tiene registros relacionados',
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        `Error al eliminar el accidente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

//  async inicializarEstadosNecesarios(): Promise<void> {
//     const estadosRequeridos = ['Devuelto', 'Cancelado'];
    
//     for (const nombreEstado of estadosRequeridos) {
//       let estado = await this.estadoAccIncRepository.findOne({ 
//         where: { nombre_estado_acc_inc: nombreEstado } 
//       });
      
//       if (!estado) {
//         this.logger.warn(`Estado "${nombreEstado}" no encontrado. Considera crearlo.`);
//       }
//     }
//   }

//   async verificarAccidenteDevuelto(accidenteId: number): Promise<boolean> {
//     const accidente = await this.accidenteRepository.findOne({
//       where: { id_accidente: accidenteId },
//       relations: ['estadoAccInc'],
//     });

//     if (!accidente || accidente.estadoAccInc.nombre_estado_acc_inc !== 'Devuelto') {
//       return false;
//     }

//     const fechaLimite = new Date();
//     fechaLimite.setDate(fechaLimite.getDate() - this.DIAS_LIMITE_DEVUELTO);

//     return accidente.updatedAt <= fechaLimite;
//   }

//   async cancelarAccidenteSiExpirado(accidenteId: number): Promise<boolean> {
//     const debeCancelar = await this.verificarAccidenteDevuelto(accidenteId);
    
//     if (debeCancelar) {
//       const estadoCancelado = await this.estadoAccIncRepository.findOne({
//         where: { nombre_estado_acc_inc: 'Cancelado' }
//       });

//       await this.accidenteRepository.update(accidenteId, {
//   estadoAccInc: { id_estado_acc_inc: estadoCancelado.id_estado_acc_inc } as Estado_acc_inc,
// });

//       return true;
//     }

//     return false;
//   }


}
