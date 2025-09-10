// update-incidente-estado.dto.ts
import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';

export class UpdateIncidenteEstadoDto {
  @IsOptional()
  @IsDateString()
  fech_solucion?: Date;

  @IsOptional()
  @IsString()
  obs_incidente?: string;

  @IsOptional()
  @IsString()
  mensajeerror?: string;

  @IsOptional()
  @IsNumber()
  id_estado_acc_inc?: number;
}