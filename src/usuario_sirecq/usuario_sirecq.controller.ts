import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuarioSirecqService } from './usuario_sirecq.service';
import { CreateUsuarioSirecqDto } from './dto/create-usuario_sirecq.dto';
import { UpdateUsuarioSirecqDto } from './dto/update-usuario_sirecq.dto';

@Controller('usuario-sirecq')
export class UsuarioSirecqController {
  constructor(private readonly usuarioSirecqService: UsuarioSirecqService) {}

  @Post()
  create(@Body() createUsuarioSirecqDto: CreateUsuarioSirecqDto) {
    return this.usuarioSirecqService.create(createUsuarioSirecqDto);
  }

  @Get()
  findAll() {
    return this.usuarioSirecqService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioSirecqService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioSirecqDto: UpdateUsuarioSirecqDto) {
    return this.usuarioSirecqService.update(+id, updateUsuarioSirecqDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioSirecqService.remove(+id);
  }
}
