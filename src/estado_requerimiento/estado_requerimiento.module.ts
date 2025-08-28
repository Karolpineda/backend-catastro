import { Module } from '@nestjs/common';
import { EstadoRequerimientoService } from './estado_requerimiento.service';
import { EstadoRequerimientoController } from './estado_requerimiento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estado_requerimiento } from './entities/estado_requerimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Estado_requerimiento])],
  controllers: [EstadoRequerimientoController],
  providers: [EstadoRequerimientoService],
})
export class EstadoRequerimientoModule {}
