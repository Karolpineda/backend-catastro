import { Controller,Get,Post,Body,Param,Delete,UseGuards, ParseIntPipe} from '@nestjs/common';
import { UsersRolService } from './users_rol.service';
import { CreateUsersRolDto } from './dto/create-users_rol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users-rol')
//@UseGuards(JwtAuthGuard, RolesGuard)
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

  // ✅ RUTAS ESPECÍFICAS PRIMERO - antes que @Get(':id')
  @Get('tecIncidente')
  @Roles('Administrador')
  async getResponsable() {
    return await this.usersRolService.getTecnicoIncidentes();
  }

  @Get('analistas')
  @Roles('Administrador')
  async getAnalistas() {
    return await this.usersRolService.getAnalistasIncidentes();
  }

  @Get('tecnico')
  @Roles('Administrador')
  async gettecnico () {
    return await this.usersRolService.ejecutor();
  }


  @Get('analistasAccidentes')
  async getAnalistasAccidentes() {
    return await this.usersRolService.getAnalistasAccidentes();
  }
  // PENDIENTE POR SABER REQUERIMIENTO SIRECQ_EXTERNO
  // @Get('tecnicoReque')
  // async getTecnicoReque() {
  //   return await this.usersRolService.getTecnicoReque();
  // }

  // ✅ Rutas con parámetros en el medio de la URL
  @Get('usuario/:userId')

  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersRolService.findByUser(userId);
  }

  @Get('rol/:rolId')
  @Roles('Administrador')
  findByRol(@Param('rolId', ParseIntPipe) rolId: number) {
    return this.usersRolService.findByRol(rolId);
  }

  // ✅ RUTAS PARAMETRIZADAS AL FINAL - después de las rutas específicas
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersRolService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersRolService.remove(id);
  }
}