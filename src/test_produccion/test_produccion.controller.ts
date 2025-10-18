import { Controller, HttpException, HttpCode, ParseIntPipe, HttpStatus,  Post, Put, Body, Patch, Param, Delete, Get, BadRequestException, NotFoundException } from '@nestjs/common';
import { TestProduccionService } from './test_produccion.service';
import { CreateTestProduccionDto } from './dto/create-test_produccion.dto';
import { UpdateTestProduccionDto } from './dto/update-test_produccion.dto';
import { CreateVersionamientoDto } from 'src/versionamiento/dto/create-versionamiento.dto';
import { Versionamiento } from 'src/versionamiento/entities/versionamiento.entity';

@Controller('test-produccion')
export class TestProduccionController {

  constructor(private readonly testProduccionService: TestProduccionService) {}


  @Post()
  async create(
    @Body() body: any
  ) {
    // Extraer los datos del body según la estructura que envíes
    const testProduccionDto = body.testProduccion || body;
    const versionamientoDto = body.versionamiento || body.versionDto;

    const result = await this.testProduccionService.create(
      testProduccionDto,
      versionamientoDto
    );

    return {
      statusCode: HttpStatus.CREATED,
      ...result
    };
  }

  @Get()
  async findAll() {
    try {
      const result = await this.testProduccionService.findAll();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Tests de producción obtenidos exitosamente',
        data: result,
        total: result.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al obtener los tests de producción',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testProduccionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestProduccionDto: UpdateTestProduccionDto) {
    return this.testProduccionService.update(+id, updateTestProduccionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminar(
    @Param('id', ParseIntPipe) id: number
  ): Promise<{ message: string }> {
    return await this.testProduccionService.eliminarTestProduccion(id);
  }

  @Post('versiones/:id')
  async agregarVersion(
    @Param('id') idTestProduccion: number,
    @Body() versionData: Partial<Versionamiento>
  ) {
    return await this.testProduccionService.agregarVersionAutomatica(
      idTestProduccion, 
      versionData
    );
  }

  @Patch('test-version/:id')
  async updateCompleto(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTestProduccionDto: UpdateTestProduccionDto
  ) {
    try {
      const testProduccion = await this.testProduccionService.updateTestProduccion(
        id,
        updateTestProduccionDto
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'TestProduccion actualizado exitosamente',
        data: testProduccion
      };

    } catch (error) {
      // Manejo de NotFoundException
      if (error instanceof NotFoundException) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: error.message,
            error: 'Not Found'
          },
          HttpStatus.NOT_FOUND
        );
      }

      // Manejo de BadRequestException
      if (error instanceof BadRequestException) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message,
            error: 'Bad Request'
          },
          HttpStatus.BAD_REQUEST
        );
      }

      // Manejo de errores de validación
      if (error.message?.includes('violates') || error.message?.includes('constraint')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'Error de integridad de datos',
            error: 'Conflict',
            details: error.message
          },
          HttpStatus.CONFLICT
        );
      }

      // Manejo de errores de base de datos
      if (error.code === '23503') { // Foreign key violation
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Referencia a datos inexistentes',
            error: 'Foreign Key Violation'
          },
          HttpStatus.BAD_REQUEST
        );
      }

      if (error.code === '23505') { // Unique violation
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'El registro ya existe',
            error: 'Duplicate Entry'
          },
          HttpStatus.CONFLICT
        );
      }

      // Error genérico del servidor
      console.error('Error en updateTestProduccion:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno del servidor al actualizar TestProduccion',
          error: 'Internal Server Error'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


}
