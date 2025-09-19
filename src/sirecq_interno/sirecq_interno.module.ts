import { Module } from '@nestjs/common';
import { SirecqInternoService } from './sirecq_interno.service';
import { SirecqInternoController } from './sirecq_interno.controller';

@Module({
  controllers: [SirecqInternoController],
  providers: [SirecqInternoService],
})
export class SirecqInternoModule {}
