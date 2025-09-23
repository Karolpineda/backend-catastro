import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
    private readonly accidenteRepository: Repository<Accidente>,
    @InjectRepository(Estado_acc_inc)
    private readonly estadoAccIncRepository: Repository<Estado_acc_inc>,
    @InjectRepository(Rol_Usuario) // Añadir esto
    private readonly rolUsuarioRepository: Repository<Rol_Usuario>,
    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,
    private readonly usersRolService: UsersRolService,
  ) {}

  async createAccidente(createAccidenteDto: CreateAccidenteDto): Promise<Accidente> {
    // Validar que trámite o oficio esté presente
    if (!createAccidenteDto.tramite_accidente && !createAccidenteDto.oficio_memorando_mail) {
      throw new HttpException(
        'Debe ingresar trámite o número de oficio/memorando/mail',
        HttpStatus.BAD_REQUEST,
      );
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
        'El estado seleccionado no es válido o es "Favorable"',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Crear el accidente
    const accidente = this.accidenteRepository.create({
      ...createAccidenteDto,
      estadoAccInc: estado,
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
        where: { id_accidente: ILike(id_accidente) },
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
  identificador: string,
  updateAccidenteDto: UpdateAccidenteDto,
) {
  try {
    const accidente = await this.accidenteRepository.findOne({
      where: [
        { tramite_accidente: ILike(identificador) },
        { oficio_memorando_mail: ILike(identificador) }
      ],
      relations: ['estadoAccInc', 'zona', 'rolUsuario'],
    });

    if (!accidente) {
      throw new HttpException(
        `Accidente con trámite/oficio "${identificador}" no encontrado`,
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
}
