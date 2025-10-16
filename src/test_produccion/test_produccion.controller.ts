import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TestProduccionService } from './test_produccion.service';
import { CreateTestProduccionDto } from './dto/create-test_produccion.dto';
import { UpdateTestProduccionDto } from './dto/update-test_produccion.dto';

@Controller('test-produccion')
export class TestProduccionController {
  constructor(private readonly testProduccionService: TestProduccionService) {}

  @Post()
  create(@Body() createTestProduccionDto: CreateTestProduccionDto) {
    return this.testProduccionService.create(createTestProduccionDto);
  }

  @Get()
  findAll() {
    return this.testProduccionService.findAll();
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
  remove(@Param('id') id: string) {
    return this.testProduccionService.remove(+id);
  }
}
