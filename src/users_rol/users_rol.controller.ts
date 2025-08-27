import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersRolService } from './users_rol.service';
import { CreateUsersRolDto } from './dto/create-users_rol.dto';
import { UpdateUsersRolDto } from './dto/update-users_rol.dto';

@Controller('users-rol')
export class UsersRolController {
  constructor(private readonly usersRolService: UsersRolService) {}

  @Post()
  create(@Body() createUsersRolDto: CreateUsersRolDto) {
    return this.usersRolService.create(createUsersRolDto);
  }

  @Get()
  findAll() {
    return this.usersRolService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersRolService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUsersRolDto: UpdateUsersRolDto,
  ) {
    return this.usersRolService.update(+id, updateUsersRolDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersRolService.remove(+id);
  }
}
