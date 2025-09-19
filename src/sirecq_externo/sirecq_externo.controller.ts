import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SirecqExternoService } from './sirecq_externo.service';
import { CreateSirecqExternoDto } from './dto/create-sirecq_externo.dto';
import { UpdateSirecqExternoDto } from './dto/update-sirecq_externo.dto';

@Controller('sirecq-externo')
export class SirecqExternoController {
  constructor(private readonly sirecqExternoService: SirecqExternoService) {}

  @Post()
  create(@Body() createSirecqExternoDto: CreateSirecqExternoDto) {
    return this.sirecqExternoService.create(createSirecqExternoDto);
  }

  @Get()
  findAll() {
    return this.sirecqExternoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sirecqExternoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSirecqExternoDto: UpdateSirecqExternoDto) {
    return this.sirecqExternoService.update(+id, updateSirecqExternoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sirecqExternoService.remove(+id);
  }
}
