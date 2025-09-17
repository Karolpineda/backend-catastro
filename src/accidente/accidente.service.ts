import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateAccidenteDto } from './dto/create-accidente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Accidente } from './entities/accidente.entity';
import { UpdateAccidenteDto } from './dto/update-accidente.dto';
import { Estado_acc_inc } from 'src/estado_acc_inc/estado_acc_inc.entity';
import { Rol_Usuario } from 'src/users_rol/entities/users_rol.entity';
import { UsersRolService} from 'src/users_rol/users_rol.service'

@Injectable()
export class AccidenteService {
  constructor(
    @InjectRepository(Accidente)
    private readonly accidenteRepository: Repository<Accidente>,
    @InjectRepository(Estado_acc_inc)
    private readonly estadoAccIncRepository: Repository<Estado_acc_inc>,
    @InjectRepository(Rol_Usuario) // Añadir esto
    private readonly rolUsuarioRepository: Repository<Rol_Usuario>,
    private readonly usersRolService: UsersRolService,
  ) {}

  async createAccidente(createAccidenteDto: CreateAccidenteDto) {
  try {
    const estadoIngresado = await this.estadoAccIncRepository.findOne({
      where: { nombre_estado_acc_inc: 'INGRESADO' }
    });

    if (!estadoIngresado) {
      throw new HttpException('Estado "Ingresado" no encontrado en el sistema', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const rolUsuario = await this.rolUsuarioRepository.findOne({
      where: { id_rol_usuario: createAccidenteDto.id_rol_usuario }
    });

    if (!rolUsuario) {
      throw new HttpException('El técnico especificado no existe', HttpStatus.BAD_REQUEST);
    }

    const accidente = this.accidenteRepository.create({
      tramite_accidente: createAccidenteDto.tramite_accidente,
      oficio_memorando_mail: createAccidenteDto.oficio_memorando_mail,
      fech_ingr_tramite: createAccidenteDto.fech_ingr_tramite || new Date(),
      fecha_asignacion: createAccidenteDto.fecha_asignacion,
      tipologia: createAccidenteDto.tipologia,
      rolUsuario: rolUsuario, 
      estadoAccInc: estadoIngresado, 
    });

    const savedAccidente = await this.accidenteRepository.save(accidente);

    return {
      message: 'Accidente creado exitosamente',
      data: savedAccidente,
    };

  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    
    throw new HttpException(
      `Error al crear el accidente: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
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

  async findOneByTramite(tramite: string) {
    try {
      const accidente = await this.accidenteRepository.findOne({
        where: { tramite_accidente: ILike(tramite) },
        relations: ['estadoAccInc', 'rolUsuario', 'zona'],
      });

      if (!accidente) {
        throw new HttpException(
          `Accidente con trámite ${tramite} no encontrado`,
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

  update(id: number, updateAccidenteDto: UpdateAccidenteDto) {
    return `This action updates a #${id} accidente`;
  }

  async remove(tramite: string) {
    try {

      const accidente = await this.accidenteRepository.findOne({
        where: {tramite_accidente: tramite }
      });

      if (!accidente) {
        throw new HttpException(
          `Accidente con ID ${tramite} no encontrado`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Eliminar el accidente
      const result = await this.accidenteRepository.delete(tramite);

      if (result.affected === 0) {
        throw new HttpException(
          'No se pudo eliminar el accidente',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        message: 'Accidente eliminado exitosamente',
        tramite_accidente: tramite,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      // Manejar errores de restricciones de clave foránea
      if (error.code === '23503') { // Código de error de PostgreSQL para violación de clave foránea
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
