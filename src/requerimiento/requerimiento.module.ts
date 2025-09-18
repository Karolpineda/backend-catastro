import { Module } from '@nestjs/common';
import { RequerimientoService } from './requerimiento.service';
import { RequerimientoController } from './requerimiento.controller';

@Module({
  controllers: [RequerimientoController],
  providers: [RequerimientoService],
})
export class RequerimientoModule {}
