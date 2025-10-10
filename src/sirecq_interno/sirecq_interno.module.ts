import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SirecqInternoService } from 'src/sirecq_interno/sirecq_interno.service';
import { SirecqInternoController } from 'src/sirecq_interno/sirecq_interno.controller';
import { SirecqInterno } from './entities/sirecq_interno.entity';
import { SirecqExterno } from '../sirecq_externo/entities/sirecq_externo.entity';
import { Requerimiento } from '../requerimiento/entities/requerimiento.entity';
import { Versionamiento } from '../versionamiento/entities/versionamiento.entity';
import { RequerimientoVersion } from '../requerimiento-version/entities/requerimiento-version.entity';
import { Clasif_catastral } from '../clasif_catastral/clasif_catastral.entity';
import { Dependencia } from '../dependencia/dependecia.entity';
import { Estado_requerimiento } from '../estado_requerimiento/entities/estado_requerimiento.entity';
import { Categoria } from '../categoria/categoria.entity';
import { Sistema } from '../sistema/sistema.entity';
import { Rol_Usuario } from '../users_rol/entities/users_rol.entity';
import { UsuarioSirecq } from '../usuario_sirecq/entities/usuario_sirecq.entity';
import { UsersRolModule } from '../users_rol/users_rol.module';
import { RequerimientoModule } from '../requerimiento/requerimiento.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SirecqInterno,
      SirecqExterno,
      Requerimiento,
      Versionamiento,
      RequerimientoVersion,
      Clasif_catastral,
      Dependencia,
      Estado_requerimiento,
      Categoria,
      Sistema,
      Rol_Usuario,
      UsuarioSirecq
    ]),
    UsersRolModule,
    RequerimientoModule
  ],
  controllers: [SirecqInternoController],
  providers: [SirecqInternoService],
  exports: [SirecqInternoService]
})
export class SirecqInternoModule {}