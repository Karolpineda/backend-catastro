import { Injectable } from '@nestjs/common';
import { CreateRequerimientoDto } from './dto/create-requerimiento.dto';
import { UpdateRequerimientoDto } from './dto/update-requerimiento.dto';

@Injectable()
export class RequerimientoService {
  create(createRequerimientoDto: CreateRequerimientoDto) {
    return 'This action adds a new requerimiento';
  }

  findAll() {
    return `This action returns all requerimiento`;
  }

  findOne(id: number) {
    return `This action returns a #${id} requerimiento`;
  }

  update(id: number, updateRequerimientoDto: UpdateRequerimientoDto) {
    return `This action updates a #${id} requerimiento`;
  }

  remove(id: number) {
    return `This action removes a #${id} requerimiento`;
  }
}
