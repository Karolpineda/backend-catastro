import { Injectable } from '@nestjs/common';
import { CreateTestVersionDto } from './dto/create-test-version.dto';
import { UpdateTestVersionDto } from './dto/update-test-version.dto';

@Injectable()
export class TestVersionService {
  create(createTestVersionDto: CreateTestVersionDto) {
    return 'This action adds a new testVersion';
  }

  findAll() {
    return `This action returns all testVersion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} testVersion`;
  }

  update(id: number, updateTestVersionDto: UpdateTestVersionDto) {
    return `This action updates a #${id} testVersion`;
  }

  remove(id: number) {
    return `This action removes a #${id} testVersion`;
  }
}
