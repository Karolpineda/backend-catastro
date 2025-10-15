import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpException, HttpStatus  } from '@nestjs/common';
import { VersionamientoService } from './versionamiento.service';
import { CreateVersionamientoDto } from './dto/create-versionamiento.dto';
import { UpdateVersionamientoDto } from './dto/update-versionamiento.dto';

@Controller('versionamiento')
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

  @Put(':id')
  async updateVersionamiento(
    @Param('id') id: number,
    @Body() dto: UpdateVersionamientoDto
  ) {
    try {
      const updated = await this.versionamientoService.updateVersion(id, dto);
      if (updated instanceof HttpException) throw updated;
      return updated;
    } catch (error) {
      throw new HttpException(
        `Error al actualizar versión: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}
