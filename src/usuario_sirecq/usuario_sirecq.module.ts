import { Module } from '@nestjs/common';
import { UsuarioSirecqService } from './usuario_sirecq.service';
import { UsuarioSirecqController } from './usuario_sirecq.controller';

@Module({
  controllers: [UsuarioSirecqController],
  providers: [UsuarioSirecqService],
})
export class UsuarioSirecqModule {}
