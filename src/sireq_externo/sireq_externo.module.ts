import { Module } from '@nestjs/common';
import { SireqExternoService } from './sireq_externo.service';
import { SireqExternoController } from './sireq_externo.controller';

@Module({
  controllers: [SireqExternoController],
  providers: [SireqExternoService],
})
export class SireqExternoModule {}
