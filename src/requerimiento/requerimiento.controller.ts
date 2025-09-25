import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, HttpException, ParseIntPipe } from '@nestjs/common';
import { RequerimientoService } from './requerimiento.service';
import { CreateRequerimientoDto } from './dto/create-requerimiento.dto';
import { UpdateRequerimientoDto } from './dto/update-requerimiento.dto';

@Controller('requerimiento')
export class RequerimientoController {
  constructor(private readonly requerimientoService: RequerimientoService) {}

  @Get('dropdown-data')
  @HttpCode(HttpStatus.OK)
  async getDropdownData() {
    try {
      const dropdownData = await this.requerimientoService.getDropdownData();
      return {
        success: true,
        message: 'Datos para formulario obtenidos correctamente',
        data: dropdownData
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

 
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRequerimiento(@Body() createRequerimientoDto: CreateRequerimientoDto) {
    try {
      const requerimiento = await this.requerimientoService.createRequerimientoCompleto(createRequerimientoDto);
      
      return {
        success: true,
        message: 'Requerimiento creado exitosamente',
        data: requerimiento
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
   @Get()
  @HttpCode(HttpStatus.OK)
  async getAllRequerimientos() {
    try {
      const requerimientos = await this.requerimientoService.findAllRequerimientos();
      
      return {
        success: true,
        message: 'Requerimientos obtenidos correctamente',
        data: requerimientos,
        count: requerimientos.length
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          data: null,
          count: 0
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener un requerimiento específico por ID
   */
  @Get(':id_requerimiento')
  @HttpCode(HttpStatus.OK)
  async getRequerimientoById(@Param('id_requerimiento', ParseIntPipe) id_requerimiento: number) {
    try {
      const requerimiento = await this.requerimientoService.findById(id_requerimiento);
      
      if (!requerimiento) {
        throw new HttpException(
          `Requerimiento con ID ${id_requerimiento} no encontrado`,
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        message: 'Requerimiento obtenido correctamente',
        data: requerimiento
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          data: null
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id_requerimiento')
  @HttpCode(HttpStatus.OK)
  async deleteRequerimiento(@Param('id_requerimiento', ParseIntPipe) id_requerimiento: number) {
    try {
      const result = await this.requerimientoService.deleteRequerimiento(id_requerimiento);
      
      return {
        success: true,
        message: result.message,
        data: { id: result.id_requerimiento }
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          data: null
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
