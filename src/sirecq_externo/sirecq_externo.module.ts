import { Module } from '@nestjs/common';
import { SirecqExternoService } from './sirecq_externo.service';
import { SirecqExternoController } from './sirecq_externo.controller';

@Module({
  controllers: [SirecqExternoController],
  providers: [SirecqExternoService],
})
export class SirecqExternoModule {}
