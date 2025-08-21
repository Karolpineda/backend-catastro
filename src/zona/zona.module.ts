import { Module } from '@nestjs/common';
import { ZonaController } from './zona.controller';
import { ZonaService } from './zona.service';

@Module({
  controllers: [ZonaController],
  providers: [ZonaService]
})
export class ZonaModule {}
