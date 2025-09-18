import { Module } from '@nestjs/common';
import { SireqInternoService } from './sireq_interno.service';
import { SireqInternoController } from './sireq_interno.controller';

@Module({
  controllers: [SireqInternoController],
  providers: [SireqInternoService],
})
export class SireqInternoModule {}
