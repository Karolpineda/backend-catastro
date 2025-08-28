import { Module } from '@nestjs/common';
import { VersionamientoService } from './versionamiento.service';
import { VersionamientoController } from './versionamiento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Versionamiento } from './entities/versionamiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Versionamiento])],  
  controllers: [VersionamientoController],
  providers: [VersionamientoService],
})
export class VersionamientoModule {}
