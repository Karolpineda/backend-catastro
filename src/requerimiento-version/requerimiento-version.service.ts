import { Injectable } from '@nestjs/common';
import { CreateRequerimientoVersionDto } from './dto/create-requerimiento-version.dto';
import { UpdateRequerimientoVersionDto } from './dto/update-requerimiento-version.dto';

@Injectable()
export class RequerimientoVersionService {
  create(createRequerimientoVersionDto: CreateRequerimientoVersionDto) {
    return 'This action adds a new requerimientoVersion';
  }

  findAll() {
    return `This action returns all requerimientoVersion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} requerimientoVersion`;
  }

  update(id: number, updateRequerimientoVersionDto: UpdateRequerimientoVersionDto) {
    return `This action updates a #${id} requerimientoVersion`;
  }

  remove(id: number) {
    return `This action removes a #${id} requerimientoVersion`;
  }
}
