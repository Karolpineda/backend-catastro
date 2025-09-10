import { Controller,Get,Post,Body,Param,Delete,UseGuards, ParseIntPipe} from '@nestjs/common';
import { UsersRolService } from './users_rol.service';
import { CreateUsersRolDto } from './dto/create-users_rol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users-rol')
@UseGuards(JwtAuthGuard)
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
  return this.usersRolService.findOne(Number(id));
  }

  @Get('usuario/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersRolService.findByUser(userId);
  }

  @Get('rol/:rolId')
  findByRol(@Param('rolId') rolId: number) {
    return this.usersRolService.findByRol(rolId);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersRolService.remove(id);
  }

  @Get('tecIncidente')
  async getResponsable() {
    return await this.usersRolService.getTecnicoIncidentes();
  }

  // Endpoint para obtener analistas
  @Get('analistas')
  async getAnalistas() {
    return await this.usersRolService.getTecnicoIncidentes();
  }
}