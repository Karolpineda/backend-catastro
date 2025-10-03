import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, HttpCode, ParseIntPipe } from '@nestjs/common';
import { SirecqExternoService } from './sirecq_externo.service';
import { CreateSirecqExternoDto } from './dto/create-sirecq_externo.dto';
import { UpdateSirecqExternoDto } from './dto/update-sirecq_externo.dto';
import { UpdateSirecqExternoCompletoDto } from './dto/update-sireq_externo-completo.dto';

@Controller('sirecq-externo')
export class SirecqExternoController {
  constructor(private readonly sirecqExternoService: SirecqExternoService) {}

  // sirecq-externo.controller.ts
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createCompleto(
      @Body() createSirecqExternoCompletoDto: CreateSirecqExternoDto
    ) {
      try {
        const sirecqExterno = await this.sirecqExternoService.createSirecqExternoCompleto(
          createSirecqExternoCompletoDto
        );
        
        return {
          success: true,
          message: 'SirecqExterno y Requerimiento creados exitosamente',
          data: sirecqExterno
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

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll() {
      try {
        const sirecqExternos = await this.sirecqExternoService.findAll();
        
        return {
          success: true,
          message: 'SirecqExternos obtenidos exitosamente',
          data: sirecqExternos,
          count: sirecqExternos.length
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

    @Get(':id_sirecq_externo')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id_sirecq_externo', ParseIntPipe) id_sirecq_externo: number) {
      try {
        const sirecqExterno = await this.sirecqExternoService.findOne(id_sirecq_externo);
        
        return {
          success: true,
          message: 'SirecqExterno obtenido exitosamente',
          data: sirecqExterno
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          data: null
        };
      }
    }

    @Patch(':id_sirecq_externo')
    @HttpCode(HttpStatus.OK)
        async updateCompleto(
          @Param('id_sirecq_externo', ParseIntPipe) id_sirecq_externo: number,
          @Body() updateCompletoDto: UpdateSirecqExternoCompletoDto
        ) {
          try {
            const sirecqExterno = await this.sirecqExternoService.updateCompleto(id_sirecq_externo, updateCompletoDto);
            
            return {
              success: true,
              message: 'SirecqExterno y Requerimiento actualizados exitosamente',
              data: sirecqExterno
            };
          } catch (error) {
            return {
              success: false,
              message: error.message,
              data: null
            };
          }
        }

      @Delete(':id_sirecq_externo')
      async delete(
        @Param('id_sirecq_externo', ParseIntPipe) id_sirecq_externo: number
      ): Promise<{ 
        success: boolean; 
        message: string; 
        data: { ids_eliminados: any } 
      }> {
        try {
          const result = await this.sirecqExternoService.deleteSirecqExterno(id_sirecq_externo);
          
          return {
            success: true,
            message: result.message,
            data: { ids_eliminados: result.ids_eliminados }
          };
        } catch (error) {
          throw error;
        }
      }
}
