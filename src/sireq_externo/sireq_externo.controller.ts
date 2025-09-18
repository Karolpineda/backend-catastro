import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SireqExternoService } from './sireq_externo.service';
import { CreateSireqExternoDto } from './dto/create-sireq_externo.dto';
import { UpdateSireqExternoDto } from './dto/update-sireq_externo.dto';

@Controller('sireq-externo')
export class SireqExternoController {
  constructor(private readonly sireqExternoService: SireqExternoService) {}

  @Post()
  create(@Body() createSireqExternoDto: CreateSireqExternoDto) {
    return this.sireqExternoService.create(createSireqExternoDto);
  }

  @Get()
  findAll() {
    return this.sireqExternoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sireqExternoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSireqExternoDto: UpdateSireqExternoDto) {
    return this.sireqExternoService.update(+id, updateSireqExternoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sireqExternoService.remove(+id);
  }
}
