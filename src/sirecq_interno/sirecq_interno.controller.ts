import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SirecqInternoService } from './sirecq_interno.service';
import { CreateSirecqInternoDto } from './dto/create-sirecq_interno.dto';
import { UpdateSirecqInternoDto } from './dto/update-sirecq_interno.dto';

@Controller('sirecq-interno')
export class SirecqInternoController {
  constructor(private readonly sirecqInternoService: SirecqInternoService) {}

  @Post()
  create(@Body() createSirecqInternoDto: CreateSirecqInternoDto) {
    return this.sirecqInternoService.create(createSirecqInternoDto);
  }

  @Get()
  findAll() {
    return this.sirecqInternoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sirecqInternoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSirecqInternoDto: UpdateSirecqInternoDto) {
    return this.sirecqInternoService.update(+id, updateSirecqInternoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sirecqInternoService.remove(+id);
  }
}
