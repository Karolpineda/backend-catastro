import { Injectable } from '@nestjs/common';
import { CreateSireqExternoDto } from './dto/create-sireq_externo.dto';
import { UpdateSireqExternoDto } from './dto/update-sireq_externo.dto';

@Injectable()
export class SireqExternoService {
  create(createSireqExternoDto: CreateSireqExternoDto) {
    return 'This action adds a new sireqExterno';
  }

  findAll() {
    return `This action returns all sireqExterno`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sireqExterno`;
  }

  update(id: number, updateSireqExternoDto: UpdateSireqExternoDto) {
    return `This action updates a #${id} sireqExterno`;
  }

  remove(id: number) {
    return `This action removes a #${id} sireqExterno`;
  }
}
