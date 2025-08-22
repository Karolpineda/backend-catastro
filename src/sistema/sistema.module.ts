import { Module } from '@nestjs/common';
import { SistemaController } from './sistema.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SistemaService } from './sistema.service';
import { Sistema } from './sistema.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sistema])],
  controllers: [SistemaController],
  providers: [SistemaService]
})
export class SistemaModule {}
