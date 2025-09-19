import { Module } from '@nestjs/common';
import { RequerimientoVersionService } from './requerimiento-version.service';
import { RequerimientoVersionController } from './requerimiento-version.controller';

@Module({
  controllers: [RequerimientoVersionController],
  providers: [RequerimientoVersionService],
})
export class RequerimientoVersionModule {}
