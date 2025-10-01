import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, HttpException, ParseIntPipe } from '@nestjs/common';
import { RequerimientoService } from './requerimiento.service';
import { CreateRequerimientoDto } from './dto/create-requerimiento.dto';
import { UpdateRequerimientoDto } from './dto/update-requerimiento.dto';
import { AddVersionDto } from 'src/versionamiento/dto/add-version.dto';

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

    @Patch(':id_requerimiento')
    @HttpCode(HttpStatus.OK)
    async UpdateRequerimiento(
      @Param('id_requerimiento', ParseIntPipe) id_requerimiento: number,
      @Body() updateRequerimientoDto: UpdateRequerimientoDto
    ) {
      try {
        const requerimiento = await this.requerimientoService.updateRequerimiento(id_requerimiento, updateRequerimientoDto);
        
        return {
          success: true,
          message: 'Requerimiento actualizado exitosamente',
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

    // requerimiento.controller.ts
    @Post(':id_requerimiento/versiones')
    @HttpCode(HttpStatus.CREATED)
    async addVersion(
      @Param('id_requerimiento', ParseIntPipe) id_requerimiento: number,
      @Body() addVersionDto: AddVersionDto
    ) {
      try {
        const requerimiento = await this.requerimientoService.addVersionToRequerimiento(id_requerimiento, addVersionDto);
        
        return {
          success: true,
          message: 'Versión agregada exitosamente al requerimiento',
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


      @Get(':id_requerimiento/versiones')
      @HttpCode(HttpStatus.OK)
      async getVersiones(@Param('id_requerimiento', ParseIntPipe) id: number) {
        try {
          const versiones = await this.requerimientoService.getVersionesByRequerimiento(id);
          
          return {
            success: true,
            message: 'Versiones obtenidas exitosamente',
            data: versiones,
            count: versiones.length
          };
        } catch (error) {
          return {
            success: false,
            message: error.message,
            data: null,
            count: 0
          };
        }
      }

}
