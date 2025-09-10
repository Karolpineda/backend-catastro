import { Injectable } from '@nestjs/common';
import { CreateUsuarioIncidenteDto } from './dto/create-usuario_incidente.dto';
import { UpdateUsuarioIncidenteDto } from './dto/update-usuario_incidente.dto';

@Injectable()
export class UsuarioIncidenteService {
  create(createUsuarioIncidenteDto: CreateUsuarioIncidenteDto) {
    return 'This action adds a new usuarioIncidente';
  }

  findAll() {
    return `This action returns all usuarioIncidente`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuarioIncidente`;
  }

  update(id: number, updateUsuarioIncidenteDto: UpdateUsuarioIncidenteDto) {
    return `This action updates a #${id} usuarioIncidente`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuarioIncidente`;
  }
}
