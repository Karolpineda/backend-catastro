import { Injectable } from '@nestjs/common';
import { CreateUsersRolDto } from './dto/create-users_rol.dto';
import { UpdateUsersRolDto } from './dto/update-users_rol.dto';

@Injectable()
export class UsersRolService {
  create(createUsersRolDto: CreateUsersRolDto) {
    return 'This action adds a new usersRol';
  }

  findAll() {
    return `This action returns all usersRol`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usersRol`;
  }

  update(id: number, updateUsersRolDto: UpdateUsersRolDto) {
    return `This action updates a #${id} usersRol`;
  }

  remove(id: number) {
    return `This action removes a #${id} usersRol`;
  }
}
