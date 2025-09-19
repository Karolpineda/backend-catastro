import { Injectable } from '@nestjs/common';
import { CreateUsuarioSirecqDto } from './dto/create-usuario_sirecq.dto';
import { UpdateUsuarioSirecqDto } from './dto/update-usuario_sirecq.dto';

@Injectable()
export class UsuarioSirecqService {
  create(createUsuarioSirecqDto: CreateUsuarioSirecqDto) {
    return 'This action adds a new usuarioSirecq';
  }

  findAll() {
    return `This action returns all usuarioSirecq`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuarioSirecq`;
  }

  update(id: number, updateUsuarioSirecqDto: UpdateUsuarioSirecqDto) {
    return `This action updates a #${id} usuarioSirecq`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuarioSirecq`;
  }
}
