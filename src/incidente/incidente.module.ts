import { Module } from '@nestjs/common';
import { IncidenteService } from './incidente.service';
import { IncidenteController } from './incidente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incidente } from './entities/incidente.entity';
import { Zona } from 'src/zona/zona.entity';
import { Estado_acc_inc } from 'src/estado_acc_inc/estado_acc_inc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Incidente, Zona, Estado_acc_inc])],
  controllers: [IncidenteController],
  providers: [IncidenteService],
})
export class IncidenteModule {}
