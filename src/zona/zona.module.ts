import { Module } from '@nestjs/common';
import { ZonaController } from './zona.controller';
import { ZonaService } from './zona.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zona } from './zona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Zona])],
  controllers: [ZonaController],
  providers: [ZonaService]
})
export class ZonaModule {}
