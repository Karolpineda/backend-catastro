import { Controller,Get,Post,Body,Param,Delete,UseGuards, ParseIntPipe, Patch} from '@nestjs/common';
import { UsersRolService } from './users_rol.service';
import { CreateUsersRolDto } from './dto/create-users_rol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users-rol')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersRolController {
  constructor(private readonly usersRolService: UsersRolService) {}

  @Post('create')
  async crearUsuarioConRol(@Body() createDto: {
    cedula_usuario?: string;
    apellidos_usuario?: string;
    nombre_usuario?: string;
    correo_usuario?: string;
    contrasenia_usuario: string;
    roles_ids: number[];
  }) {
    return await this.usersRolService.crearUsuarioConRol(createDto);
  }

    @Patch('update/:id_usuario')
  async actualizarUsuarioConRoles(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Body() updateDto: {
      cedula_usuario?: string;
      apellidos_usuario?: string;
      nombre_usuario?: string;
      correo_usuario?: string;
      contrasenia_usuario?: string;
      roles_ids?: number[];
    }
  ) {
    return await this.usersRolService.actualizarUsuarioConRoles(id_usuario, updateDto);
  }

  @Post('asignar-rol/:id_usuario/:id_rol')
  async asignarRol(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_rol', ParseIntPipe) id_rol: number
  ) {
    return await this.usersRolService.asignarRolAUsuario(id_usuario, id_rol);
  }

  @Get('roles-usuario/:id_usuario')
  async obtenerRoles(@Param('id_usuario', ParseIntPipe) id_usuario: number) {
    return await this.usersRolService.obtenerRolesDeUsuario(id_usuario);
  }

  @Delete('remover-rol/:id_usuario/:id_rol')
  async removerRol(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_rol', ParseIntPipe) id_rol: number
  ) {
    return await this.usersRolService.removerRolDeUsuario(id_usuario, id_rol);
  }

  // ✅ RUTAS ESPECÍFICAS PRIMERO - antes que @Get(':id')
  @Get('tecIncidente')
  @Roles('Administrador')
  async getResponsable() {
    return await this.usersRolService.getTecnicoIncidentes();
  }

  @Get('analistas')
  //@Roles('Administrador')
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

  
}