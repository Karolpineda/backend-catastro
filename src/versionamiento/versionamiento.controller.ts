import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VersionamientoService } from './versionamiento.service';
import { CreateVersionamientoDto } from './dto/create-versionamiento.dto';
import { UpdateVersionamientoDto } from './dto/update-versionamiento.dto';

@Controller('version')
export class VersionamientoController {
  constructor(private  versionamientoService: VersionamientoService) {}

  @Post()
  create(@Body() createVersionamientoDto: CreateVersionamientoDto) {
    return this.versionamientoService.createVersion(createVersionamientoDto);
  }

  @Get()
  findAll() {
    return this.versionamientoService.findAllVersion();
  }

  @Patch(':id_version')
  update(@Param('id_version') id_version: string, @Body() updateVersionamientoDto: UpdateVersionamientoDto) {
    return this.versionamientoService.updateVersion(+id_version, updateVersionamientoDto);
  }

  @Delete(':id_version')
  remove(@Param('id_version') id_version: string) {
    return this.versionamientoService.removeVersion(+id_version);
  }
}
