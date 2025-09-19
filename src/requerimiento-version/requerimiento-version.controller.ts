import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequerimientoVersionService } from './requerimiento-version.service';
import { CreateRequerimientoVersionDto } from './dto/create-requerimiento-version.dto';
import { UpdateRequerimientoVersionDto } from './dto/update-requerimiento-version.dto';

@Controller('requerimiento-version')
export class RequerimientoVersionController {
  constructor(private readonly requerimientoVersionService: RequerimientoVersionService) {}

  @Post()
  create(@Body() createRequerimientoVersionDto: CreateRequerimientoVersionDto) {
    return this.requerimientoVersionService.create(createRequerimientoVersionDto);
  }

  @Get()
  findAll() {
    return this.requerimientoVersionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requerimientoVersionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequerimientoVersionDto: UpdateRequerimientoVersionDto) {
    return this.requerimientoVersionService.update(+id, updateRequerimientoVersionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requerimientoVersionService.remove(+id);
  }
}
