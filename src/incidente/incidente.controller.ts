import { Controller, Get, Post, Patch, Delete, Body, Param, Query,  HttpException, HttpStatus } from '@nestjs/common';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { IncidenteService } from './incidente.service';
import { Incidente } from './entities/incidente.entity';

@Controller('incidentes')
export class IncidenteController {
  constructor(private incidenteService: IncidenteService) {}

      @Post()
        async create(@Body() createIncidenteDto: CreateIncidenteDto): Promise<Incidente> {
          try {
            return await this.incidenteService.createIncidente(createIncidenteDto);
          } catch (error) {
            throw new HttpException(
              error.message || 'Error al crear el incidente',
              HttpStatus.BAD_REQUEST
            );
          }
        }

      @Get()
        async findAll(): Promise<Incidente[]> {
          try {
            return await this.incidenteService.findAllIncidente();
          } catch (error) {
            throw new HttpException(
              error.message || 'Error al obtener los incidentes',
              HttpStatus.INTERNAL_SERVER_ERROR
            );
          }
        }

      @Get('view')
        async getViewIncidente(): Promise<any[]> {
          try {
            return await this.incidenteService.getViewIncidente();
          } catch (error) {
            throw new HttpException(
              error.message || 'Error al obtener la vista de incidentes',
              HttpStatus.INTERNAL_SERVER_ERROR
            );
          }
        }

      @Get(':no_incidente')
        async findOne(@Param('no_incidente') no_incidente: string): Promise<Incidente> {
          try {
            const incidente = await this.incidenteService.findNoIncidente(no_incidente);
            if (!incidente) {
              throw new HttpException('Incidente no encontrado', HttpStatus.NOT_FOUND);
            }
            return incidente;
          } catch (error) {
            if (error instanceof HttpException) {
              throw error;
            }
            throw new HttpException(
              error.message || 'Error al obtener el incidente',
              HttpStatus.INTERNAL_SERVER_ERROR
            );
          }
        }

      @Patch(':no_incidente')
        async update(
          @Param('no_incidente') no_incidente: string,
          @Body() updateIncidenteDto: UpdateIncidenteDto
        ): Promise<Incidente> {
          try {
            const incidente = await this.incidenteService.update(no_incidente, updateIncidenteDto);
            if (!incidente) {
              throw new HttpException('Incidente no encontrado', HttpStatus.NOT_FOUND);
            }
            return incidente;
          } catch (error) {
            if (error instanceof HttpException) {
              throw error;
            }
            throw new HttpException(
              error.message || 'Error al actualizar el incidente',
              HttpStatus.BAD_REQUEST
            );
          }
        }

      @Delete(':no_incidente')
      async remove(@Param('no_incidente') no_incidente: string): Promise<void> {
        try {
          await this.incidenteService.remove(no_incidente);
        } catch (error) {
          if (error instanceof HttpException) {
            throw error;
          }
          throw new HttpException(
            error.message || 'Error al eliminar el incidente',
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }

      @Get('zona/:nombre_zona')
      async findByZona(@Param('nombre_zona') nombre_zona: string): Promise<Incidente[]> {
        try {
          const incidentes = await this.incidenteService.findByZona(nombre_zona);
          if (!incidentes || incidentes.length === 0) {
            throw new HttpException('No se encontraron incidentes para esta zona', HttpStatus.NOT_FOUND);
          }
          return incidentes;
        } catch (error) {
          if (error instanceof HttpException) {
            throw error;
          }
          throw new HttpException(
            error.message || 'Error al obtener incidentes por zona',
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }

      @Get('estado/:nombre_estado_acc_inc')
      async findByEstado(@Param('nombre_estado_acc_inc') nombre_estado_acc_inc: string): Promise<Incidente[]> {
        try {
          const incidentes = await this.incidenteService.findByEstado(nombre_estado_acc_inc);
          if (!incidentes || incidentes.length === 0) {
            throw new HttpException('No se encontraron incidentes para este estado', HttpStatus.NOT_FOUND);
          }
          return incidentes;
        } catch (error) {
          if (error instanceof HttpException) {
            throw error;
          }
          throw new HttpException(
            error.message || 'Error al obtener incidentes por estado',
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }

      @Get('filtros/buscar')
      async findByFilters(
        @Query('zona') zona?: string,
        @Query('estado') estado?: string
      ): Promise<Incidente[]> {
        try {
          // Si ambos parámetros están presentes
          if (zona && estado) {
            // Puedes implementar lógica combinada o devolver error
            throw new HttpException('Use endpoints específicos por zona o estado', HttpStatus.BAD_REQUEST);
          }
          
          // Si solo zona está presente
          if (zona) {
            return await this.findByZona(zona);
          }
          
          // Si solo estado está presente
          if (estado) {
            return await this.findByEstado(estado);
          }
          
          // Si no hay filtros, devolver todos
          return await this.findAll();
          
        } catch (error) {
          if (error instanceof HttpException) {
            throw error;
          }
          throw new HttpException(
            error.message || 'Error en la búsqueda por filtros',
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }

      @Get('estadisticas/estadistics')
      async getEstadistics(): Promise<any> {
        try {
          return await this.incidenteService.getEstadisticas();
        } catch (error) {
          throw new HttpException(
            error.message || 'Error al obtener estadísticas',
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }
}