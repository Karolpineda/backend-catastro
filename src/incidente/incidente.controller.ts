import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator} from '@nestjs/common';
import { IncidenteService } from './incidente.service';
import { CreateIncidenteDto } from './dto/create-incidente.dto';
import { UpdateIncidenteDto } from './dto/update-incidente.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Incidente } from './entities/incidente.entity';

@Controller('incidente')
export class IncidenteController {
  constructor(private readonly incidenteService: IncidenteService) {}

   @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('imagen'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear incidente con upload de imagen' })
  @ApiBody({
    description: 'Crear incidente con imagen',
    type: CreateIncidenteDto,
  })
  async createWithUpload(
    @Body() createIncidenteDto: CreateIncidenteDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    imagen?: Express.Multer.File,
  ): Promise<Incidente> {
    if (imagen) {
      
      createIncidenteDto.error_img = imagen.buffer.toString('base64');
    }
    return this.incidenteService.create(createIncidenteDto);
  }

  // @Get()
  // findAll() {
  //   return this.incidenteService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.incidenteService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateIncidenteDto: UpdateIncidenteDto) {
  //   return this.incidenteService.update(+id, updateIncidenteDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.incidenteService.remove(+id);
  // }
}
