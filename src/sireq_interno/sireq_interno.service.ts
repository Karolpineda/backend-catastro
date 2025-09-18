import { Injectable } from '@nestjs/common';
import { CreateSireqInternoDto } from './dto/create-sireq_interno.dto';
import { UpdateSireqInternoDto } from './dto/update-sireq_interno.dto';

@Injectable()
export class SireqInternoService {
  create(createSireqInternoDto: CreateSireqInternoDto) {
    return 'This action adds a new sireqInterno';
  }

  findAll() {
    return `This action returns all sireqInterno`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sireqInterno`;
  }

  update(id: number, updateSireqInternoDto: UpdateSireqInternoDto) {
    return `This action updates a #${id} sireqInterno`;
  }

  remove(id: number) {
    return `This action removes a #${id} sireqInterno`;
  }
}
