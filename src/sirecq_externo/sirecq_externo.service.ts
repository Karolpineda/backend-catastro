import { Injectable } from '@nestjs/common';
import { CreateSirecqExternoDto } from './dto/create-sirecq_externo.dto';
import { UpdateSirecqExternoDto } from './dto/update-sirecq_externo.dto';

@Injectable()
export class SirecqExternoService {
  create(createSirecqExternoDto: CreateSirecqExternoDto) {
    return 'This action adds a new sirecqExterno';
  }

  findAll() {
    return `This action returns all sirecqExterno`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sirecqExterno`;
  }

  update(id: number, updateSirecqExternoDto: UpdateSirecqExternoDto) {
    return `This action updates a #${id} sirecqExterno`;
  }

  remove(id: number) {
    return `This action removes a #${id} sirecqExterno`;
  }
}
