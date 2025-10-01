import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, HttpCode } from '@nestjs/common';
import { SirecqExternoService } from './sirecq_externo.service';
import { CreateSirecqExternoDto } from './dto/create-sirecq_externo.dto';
import { UpdateSirecqExternoDto } from './dto/update-sirecq_externo.dto';

@Controller('sirecq-externo')
export class SirecqExternoController {
  constructor(private readonly sirecqExternoService: SirecqExternoService) {}

  // sirecq-externo.controller.ts
@Post('completo')
@HttpCode(HttpStatus.CREATED)
async createCompleto(
  @Body() createSirecqExternoCompletoDto: CreateSirecqExternoDto
) {
  try {
    const sirecqExterno = await this.sirecqExternoService.createSirecqExternoCompleto(
      createSirecqExternoCompletoDto
    );
    
    return {
      success: true,
      message: 'SirecqExterno y Requerimiento creados exitosamente',
      data: sirecqExterno
    };
  } catch (error) {
    throw new HttpException(
      {
        success: false,
        message: error.message,
        data: null
      },
      error.status || HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
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
