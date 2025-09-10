import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuarioIncidenteService } from './usuario_incidente.service';
import { CreateUsuarioIncidenteDto } from './dto/create-usuario_incidente.dto';
import { UpdateUsuarioIncidenteDto } from './dto/update-usuario_incidente.dto';

@Controller('usuario-incidente')
export class UsuarioIncidenteController {
  constructor(private readonly usuarioIncidenteService: UsuarioIncidenteService) {}

  @Post()
  create(@Body() createUsuarioIncidenteDto: CreateUsuarioIncidenteDto) {
    return this.usuarioIncidenteService.create(createUsuarioIncidenteDto);
  }

  @Get()
  findAll() {
    return this.usuarioIncidenteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioIncidenteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioIncidenteDto: UpdateUsuarioIncidenteDto) {
    return this.usuarioIncidenteService.update(+id, updateUsuarioIncidenteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioIncidenteService.remove(+id);
  }
}
