import { Injectable } from '@nestjs/common';
import { CreateSirecqInternoDto } from './dto/create-sirecq_interno.dto';
import { UpdateSirecqInternoDto } from './dto/update-sirecq_interno.dto';

@Injectable()
export class SirecqInternoService {
  create(createSirecqInternoDto: CreateSirecqInternoDto) {
    return 'This action adds a new sirecqInterno';
  }

  findAll() {
    return `This action returns all sirecqInterno`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sirecqInterno`;
  }

  update(id: number, updateSirecqInternoDto: UpdateSirecqInternoDto) {
    return `This action updates a #${id} sirecqInterno`;
  }

  remove(id: number) {
    return `This action removes a #${id} sirecqInterno`;
  }
}
