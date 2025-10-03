import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SirecqExternoService } from 'src/sirecq_externo/sirecq_externo.service';
import { SirecqExternoController } from 'src/sirecq_externo/sirecq_externo.controller';
import { SirecqExterno } from 'src/sirecq_externo/entities/sirecq_externo.entity';
import { Requerimiento } from '../requerimiento/entities/requerimiento.entity';
import { Dependencia } from 'src/dependencia/dependecia.entity';
import { Estado_requerimiento } from '../estado_requerimiento/entities/estado_requerimiento.entity';
import { Categoria } from 'src/categoria/categoria.entity';
import { Sistema } from 'src/sistema/sistema.entity';
import { Rol_Usuario } from '../users_rol/entities/users_rol.entity';
import { Versionamiento } from '../versionamiento/entities/versionamiento.entity';
import { RequerimientoVersion } from '../requerimiento-version/entities/requerimiento-version.entity';
import { RequerimientoModule } from 'src/requerimiento/requerimiento.module';

  @Module({
    imports: [
      TypeOrmModule.forFeature([
        SirecqExterno,
      Requerimiento,
      Dependencia,
      Estado_requerimiento,
      Categoria,
      Sistema,
      Rol_Usuario,
      Versionamiento,
      RequerimientoVersion
      ]),
      // ✅ IMPORTAR EL MÓDULO PARA USAR EL SERVICIO
      RequerimientoModule
    ],
    controllers: [SirecqExternoController],
    providers: [SirecqExternoService],
    exports: [SirecqExternoService]
  })
  export class SirecqExternoModule {}