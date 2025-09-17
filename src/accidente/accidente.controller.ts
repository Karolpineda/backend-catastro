import { Controller, Query, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { AccidenteService } from './accidente.service';
import { CreateAccidenteDto } from './dto/create-accidente.dto';
import { UpdateAccidenteDto } from './dto/update-accidente.dto';

@Controller('accidente')
export class AccidenteController {
  constructor(private readonly accidenteService: AccidenteService) {}

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

  @Get('tramite/:tramite')
  async findOneByTramite(@Param('tramite') tramite: string) {
    try {
      return await this.accidenteService.findOneByTramite(tramite);
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

  @Patch('buscar/:identificador')
  async updateByTramiteOrOficio(
    @Param('identificador') identificador: string,
    @Body() updateAccidenteDto: UpdateAccidenteDto,
  ) {
    try {
      return await this.accidenteService.updateByTramiteOrOficio(
        identificador,
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

  @Delete(':tramite')
  async remove(@Param('tramite') tramite: string) {
    try {
      return await this.accidenteService.remove(tramite);
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
}
