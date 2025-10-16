import { Injectable } from '@nestjs/common';
import { CreateTestProduccionDto } from './dto/create-test_produccion.dto';
import { UpdateTestProduccionDto } from './dto/update-test_produccion.dto';

@Injectable()
export class TestProduccionService {
  create(createTestProduccionDto: CreateTestProduccionDto) {
    return 'This action adds a new testProduccion';
  }

  findAll() {
    return `This action returns all testProduccion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} testProduccion`;
  }

  update(id: number, updateTestProduccionDto: UpdateTestProduccionDto) {
    return `This action updates a #${id} testProduccion`;
  }

  remove(id: number) {
    return `This action removes a #${id} testProduccion`;
  }
}
