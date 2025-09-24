import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
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

  /**
   * Crear un nuevo requerimiento completo con versión inicial
   */
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

  // @Get()
  // findAll() {
  //   return this.requerimientoService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.requerimientoService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRequerimientoDto: UpdateRequerimientoDto) {
  //   return this.requerimientoService.update(+id, updateRequerimientoDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.requerimientoService.remove(+id);
  // }
}
