import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequerimientoService } from './requerimiento.service';
import { CreateRequerimientoDto } from './dto/create-requerimiento.dto';
import { UpdateRequerimientoDto } from './dto/update-requerimiento.dto';

@Controller('requerimiento')
export class RequerimientoController {
  constructor(private readonly requerimientoService: RequerimientoService) {}

  @Post()
  create(@Body() createRequerimientoDto: CreateRequerimientoDto) {
    return this.requerimientoService.create(createRequerimientoDto);
  }

  @Get()
  findAll() {
    return this.requerimientoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requerimientoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequerimientoDto: UpdateRequerimientoDto) {
    return this.requerimientoService.update(+id, updateRequerimientoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requerimientoService.remove(+id);
  }
}
