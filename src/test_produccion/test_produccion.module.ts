import { Module } from '@nestjs/common';
import { TestProduccionService } from './test_produccion.service';
import { TestProduccionController } from './test_produccion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestProduccion } from 'src/test_produccion/entities/test_produccion.entity';
import { TestVersion } from 'src/test-version/entities/test-version.entity';
import { Versionamiento } from 'src/versionamiento/entities/versionamiento.entity';
import { Rol_Usuario } from 'src/users_rol/entities/users_rol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TestProduccion,
      TestVersion,
      Versionamiento,
      Rol_Usuario,
    ]),
  ],
  controllers: [TestProduccionController],
  providers: [TestProduccionService],
})
export class TestProduccionModule {}
