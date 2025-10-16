import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TestVersionService } from './test-version.service';
import { CreateTestVersionDto } from './dto/create-test-version.dto';
import { UpdateTestVersionDto } from './dto/update-test-version.dto';

@Controller('test-version')
export class TestVersionController {
  constructor(private readonly testVersionService: TestVersionService) {}

  @Post()
  create(@Body() createTestVersionDto: CreateTestVersionDto) {
    return this.testVersionService.create(createTestVersionDto);
  }

  @Get()
  findAll() {
    return this.testVersionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testVersionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestVersionDto: UpdateTestVersionDto) {
    return this.testVersionService.update(+id, updateTestVersionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testVersionService.remove(+id);
  }
}
