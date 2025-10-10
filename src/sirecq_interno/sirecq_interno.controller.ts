import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus,ParseIntPipe 
} from '@nestjs/common';
import { SirecqInternoService } from 'src/sirecq_interno/sirecq_interno.service';
import { CreateSirecqInternoDto } from 'src/sirecq_interno/dto/create-sirecq_interno.dto';
import { UpdateSirecqInternoDto } from 'src/sirecq_interno/dto/update-sirecq_interno.dto';
import { SirecqInterno } from './entities/sirecq_interno.entity';

@Controller('sirecq-interno')
export class SirecqInternoController {
  constructor(private readonly sirecqInternoService: SirecqInternoService) {}

  // ✅ CREATE - Crear nuevo SirecqInterno completo
  @Post()
  async create(
    @Body() createSirecqInternoDto: CreateSirecqInternoDto
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data: SirecqInterno 
  }> {
    try {
      const sirecqInterno = await this.sirecqInternoService.createSirecqInterno(createSirecqInternoDto);
      
      return {
        success: true,
        message: 'SirecqInterno creado exitosamente',
        data: sirecqInterno
      };
    } catch (error) {
      throw error;
    }
  }

  // ✅ GET ALL - Obtener todos los SirecqInterno
  @Get()
  async findAll(): Promise<{ 
    success: boolean; 
    message: string; 
    data: SirecqInterno[] 
  }> {
    try {
      const sirecqInternos = await this.sirecqInternoService.findAll();
      
      return {
        success: true,
        message: 'SirecqInternos obtenidos exitosamente',
        data: sirecqInternos
      };
    } catch (error) {
      throw error;
    }
  }

  // ✅ GET BY ID - Obtener SirecqInterno por ID
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id_sirecq_interno: number
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data: SirecqInterno 
  }> {
    try {
      const sirecqInterno = await this.sirecqInternoService.findOne(id_sirecq_interno);
      
      return {
        success: true,
        message: 'SirecqInterno obtenido exitosamente',
        data: sirecqInterno
      };
    } catch (error) {
      throw error;
    }
  }

  // ✅ UPDATE - Actualizar SirecqInterno completo
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id_sirecq_interno: number,
    @Body() updateSirecqInternoDto: UpdateSirecqInternoDto
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data: SirecqInterno 
  }> {
    try {
      const sirecqInterno = await this.sirecqInternoService.updateSirecqInterno(
        id_sirecq_interno, 
        updateSirecqInternoDto
      );
      
      return {
        success: true,
        message: 'SirecqInterno actualizado exitosamente',
        data: sirecqInterno
      };
    } catch (error) {
      throw error;
    }
  }

  // ✅ DELETE - Eliminar SirecqInterno y todo lo relacionado
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id_sirecq_interno: number
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data: { ids_eliminados: any } 
  }> {
    try {
      const result = await this.sirecqInternoService.deleteSirecqInterno(id_sirecq_interno);
      
      return {
        success: true,
        message: result.message,
        data: { ids_eliminados: result.ids_eliminados }
      };
    } catch (error) {
      throw error;
    }
  }

  // ✅ BÚSQUEDA AVANZADA - Buscar SirecqInterno con filtros
  @Get('buscar/avanzada')
  async buscarAvanzada(
    @Query('fecha_desde') fecha_desde?: string,
    @Query('fecha_hasta') fecha_hasta?: string,
    @Query('id_clasif_catastral') id_clasif_catastral?: number,
    @Query('id_analista') id_analista?: number,
    @Query('id_tecnico') id_tecnico?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ 
    success: boolean; 
    message: string; 
    data: SirecqInterno[];
    meta: any 
  }> {
    try {
      const result = await this.sirecqInternoService.buscarAvanzada({
        fecha_desde,
        fecha_hasta,
        id_clasif_catastral,
        id_analista,
        id_tecnico,
        page,
        limit
      });
      
      return {
        success: true,
        message: 'Búsqueda completada exitosamente',
        data: result.data,
        meta: result.meta
      };
    } catch (error) {
      throw error;
    }
  }
}