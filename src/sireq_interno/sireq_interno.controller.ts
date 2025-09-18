import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SireqInternoService } from './sireq_interno.service';
import { CreateSireqInternoDto } from './dto/create-sireq_interno.dto';
import { UpdateSireqInternoDto } from './dto/update-sireq_interno.dto';

@Controller('sireq-interno')
export class SireqInternoController {
  constructor(private readonly sireqInternoService: SireqInternoService) {}

  @Post()
  create(@Body() createSireqInternoDto: CreateSireqInternoDto) {
    return this.sireqInternoService.create(createSireqInternoDto);
  }

  @Get()
  findAll() {
    return this.sireqInternoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sireqInternoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSireqInternoDto: UpdateSireqInternoDto) {
    return this.sireqInternoService.update(+id, updateSireqInternoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sireqInternoService.remove(+id);
  }
}
