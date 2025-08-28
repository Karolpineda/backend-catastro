import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { EstadoRequerimientoService } from './estado_requerimiento.service';
import { CreateEstadoRequerimientoDto } from './dto/create-estado_requerimiento.dto';
import { UpdateEstadoRequerimientoDto } from './dto/update-estado_requerimiento.dto';
import { Estado_requerimiento } from './entities/estado_requerimiento.entity';

@Controller('estado-requerimiento')
export class EstadoRequerimientoController {
  constructor(private readonly estadoRequerimientoService: EstadoRequerimientoService) {}

  @Post()
  create(@Body() newEstadoReq: CreateEstadoRequerimientoDto) {
    return this.estadoRequerimientoService.createEstadoReq(newEstadoReq);
  }

  @Get()
  findAll(): Promise<Estado_requerimiento[]> {
    return this.estadoRequerimientoService.findAllEstadoReq();
  }



  @Patch(':id_estado_requerimiento')
  update(@Param('id_estado_requerimiento', ParseIntPipe) id_estado_requerimiento: number, @Body() estadoReq: UpdateEstadoRequerimientoDto) {
    return this.estadoRequerimientoService.updateEstadoReq(+id_estado_requerimiento, estadoReq);
  }

  @Delete(':id')
  remove(@Param('id_estado_requerimiento', ParseIntPipe) id_estado_requerimiento: number) {
    return this.estadoRequerimientoService.removeEstadoReq(id_estado_requerimiento);
  }
}
