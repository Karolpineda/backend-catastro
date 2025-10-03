import { Controller, UsePipes,ValidationPipe ,Get, Post, Patch, Delete, Body, Param, Query,  HttpException, HttpStatus,UseGuards, NotFoundException,  } from '@nestjs/common';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteEstadoDto } from './dto/update-incidente-estado.dto';
import { IncidenteService } from './incidente.service';
import { Incidente } from './entities/incidente.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';

@Controller('incidentes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidenteController {
  constructor(private incidenteService: IncidenteService) {}

      @Post()
      @UsePipes(new ValidationPipe({ transform: true }))
      async create(@Body() createIncidenteDto: CreateIncidenteDto) {
        return this.incidenteService.createIncidente(createIncidenteDto);
      }

      @Get('tecnicos')
      async getTecnicos() {
        return this.incidenteService.getTecnicoIncidentes();
      }

      @Get('analistas')
      async getAnalistas() {
        return this.incidenteService.getAnalistasIncidentes();
      }

      @Get('usuarios-disponibles')
      async getUsuariosDisponibles() {
        const [tecnicos, analistas] = await Promise.all([
          this.incidenteService.getTecnicoIncidentes(),
          this.incidenteService.getAnalistasIncidentes()
        ]);
        return { tecnicos, analistas };
      }
    
      @Get()
      @Roles('Administrador')
      async findAll(): Promise<Incidente[]> {
        try {
          console.log('Llamada a findAllIncidente');
          
          const result = await this.incidenteService.findAllIncidente();
          console.log('Resultado del servicio:', result); // ✅ Ahora sí verás los datos
          console.log('Cantidad de incidentes:', result.length);
          
          return result;
        } catch (error) {
          console.error('Error en findAll:', error);
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

      @Get(':id_incidente')
        async findOne(@Param('id_incidente') id_incidente: number): Promise<Incidente> {
          try {
            const incidente = await this.incidenteService.findNoIncidente(id_incidente);
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

              @Patch(':id_incidente')
        @UsePipes(new ValidationPipe({ transform: true }))
        async update(
          @Param('id_incidente') id_incidente: number,
          @Body() updateIncidenteDto: UpdateIncidenteDto
        ): Promise<Incidente> {
          return this.incidenteService.updateIncidente(id_incidente, updateIncidenteDto);
        }




      @Delete(':id_incidente')
      async remove(@Param('id_incidente') id_incidente: number): Promise<{ message: string }> {
        try {
          return await this.incidenteService.remove(id_incidente);
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


       @Patch('estado/:no_incidente')
  async updateEstado(
    @Param('no_incidente') no_incidente: string,
    @Body() updateIncidenteEstadoDto: UpdateIncidenteEstadoDto,
  ) {
    try {
      const incidenteActualizado = await this.incidenteService.updateEstado(
        no_incidente,
        updateIncidenteEstadoDto,
      );
      
      return {
        message: 'Estado del incidente actualizado exitosamente',
        data: incidenteActualizado,
      };
      
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new HttpException(
        'Error interno del servidor al actualizar el estado del incidente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}