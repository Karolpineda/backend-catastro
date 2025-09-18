// accidente.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccidenteService } from './accidente.service';
import { AccidenteController } from './accidente.controller';
import { Accidente } from './entities/accidente.entity';
import { Estado_acc_inc } from '../estado_acc_inc/estado_acc_inc.entity';
import { Rol_Usuario } from '../users_rol/entities/users_rol.entity';
import { UsersRolModule } from '../users_rol/users_rol.module'; // Importar el módulo
import { Zona } from 'src/zona/zona.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Accidente, Estado_acc_inc, Rol_Usuario, Zona]),
    UsersRolModule, 
  ],
  controllers: [AccidenteController],
  providers: [AccidenteService],
  exports: [AccidenteService],
})
export class AccidenteModule {}