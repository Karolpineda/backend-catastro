import { Module } from '@nestjs/common';
import { EstadoAccIncService } from './estado_acc_inc.service';
import { EstadoAccIncController } from './estado_acc_inc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estado_acc_inc } from './estado_acc_inc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Estado_acc_inc])],
  providers: [EstadoAccIncService],
  controllers: [EstadoAccIncController]
})
export class EstadoAccIncModule {}
