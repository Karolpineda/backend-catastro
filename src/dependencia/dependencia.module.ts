import { Module } from '@nestjs/common';
import { DependenciaController } from './dependencia.controller';
import { DependenciaService } from './dependencia.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dependencia } from './dependecia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dependencia])],
  controllers: [DependenciaController],
  providers: [DependenciaService]
})
export class DependenciaModule {}
