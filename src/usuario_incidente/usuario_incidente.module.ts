import { Module } from '@nestjs/common';
import { UsuarioIncidenteService } from './usuario_incidente.service';
import { UsuarioIncidenteController } from './usuario_incidente.controller';

@Module({
  controllers: [UsuarioIncidenteController],
  providers: [UsuarioIncidenteService],
})
export class UsuarioIncidenteModule {}
