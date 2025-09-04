import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRolService } from './users_rol.service';
import { UsersRolController } from './users_rol.controller';
import { Rol_Usuario } from './entities/users_rol.entity';
import { Usuario } from '../usuario/usuario.entity';
import { Rol } from '../rol/rol.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rol_Usuario, Usuario, Rol]),
    AuthModule
  ],
  controllers: [UsersRolController],
  providers: [UsersRolService],
  exports: [UsersRolService]
})
export class UsersRolModule {}