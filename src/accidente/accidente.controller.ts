import { Controller, Query, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { AccidenteService } from './accidente.service';
import { CreateAccidenteDto } from './dto/create-accidente.dto';
import { UpdateAccidenteDto } from './dto/update-accidente.dto';
import { FiscalAccidenteDto } from './dto/update-fiscal-accidente.dto';

import { UsersRolService } from '../users_rol/users_rol.service';

@Controller('accidente')
export class AccidenteController {
  constructor(
    private readonly accidenteService: AccidenteService,
    private readonly usersRolService: UsersRolService,
  ) {}

  @Get('estados-no-favorable')
  async getEstadosNoFavorable() {
    try {
      return await this.accidenteService.getEstadosNoFavorable();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al obtener los estados no favorables',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analistas-accidentes')
  async getAnalistasAccidentes() {
    try {
      return await this.usersRolService.getAnalistasAccidentes();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al obtener los analistas de accidentes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createAccidenteDto: CreateAccidenteDto) {
    try {
      return await this.accidenteService.createAccidente(createAccidenteDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error interno del servidor al crear el accidente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

   @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('tramite') tramite?: string,
  ) {
    try {
      return await this.accidenteService.findAll(page, limit, tramite);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al obtener los accidentes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('id_accidente/:id_accidente')
  async findOneByTramite(@Param('id_accidente') id_accidente: number) {
    try {
      return await this.accidenteService.findOneByTramite(id_accidente);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al buscar el accidente por trámite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('buscar/:id_accidente')
  async updateByTramiteOrOficio(
    @Param('id_accidente') id_accidente: number,
    @Body() updateAccidenteDto: UpdateAccidenteDto,
  ) {
    try {
      return await this.accidenteService.updateByTramiteOrOficio(
        id_accidente,
        updateAccidenteDto,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al actualizar el accidente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id_accidente')
  async remove(@Param('tramite') id_accidente: number) {
    try {
      return await this.accidenteService.remove(id_accidente);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al eliminar el accidente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('fiscalizacion/:id_accidente')
  async updateFiscalizacion(@Param('id_accidente') id_accidente: number, @Body() fiscalAccidenteDto: FiscalAccidenteDto,
  ) {
    return this.accidenteService.updateFiscalizacion(id_accidente, fiscalAccidenteDto);
  }
}
