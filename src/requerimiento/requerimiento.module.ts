import { Module } from '@nestjs/common';
import { RequerimientoService } from './requerimiento.service';
import { RequerimientoController } from './requerimiento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requerimiento } from './entities/requerimiento.entity';
import { Versionamiento } from 'src/versionamiento/entities/versionamiento.entity';
import { RequerimientoVersion } from 'src/requerimiento-version/entities/requerimiento-version.entity';
import { Estado_requerimiento } from 'src/estado_requerimiento/entities/estado_requerimiento.entity';
import { Categoria } from 'src/categoria/categoria.entity';
import { Sistema } from 'src/sistema/sistema.entity';
import { Rol_Usuario } from '../users_rol/entities/users_rol.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([Requerimiento, Versionamiento, RequerimientoVersion, Estado_requerimiento, Categoria, Sistema, Rol_Usuario
])
  ],
  controllers: [RequerimientoController],
  providers: [RequerimientoService],
})
export class RequerimientoModule {}
