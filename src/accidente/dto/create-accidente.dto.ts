// create-accidente.dto.ts
import { IsOptional, IsString, IsDate, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAccidenteDto {
  @IsOptional()
  @IsString()
  tramite_accidente?: string;

  @IsOptional()
  @IsNumber()
  id_rol_usuario: number;

  @IsOptional()
  @IsString()
  oficio_memorando_mail?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fech_ingr_tramite?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha_asignacion?: Date;

  @IsOptional()
  @IsNumber()
  tipologia?: number;

  @IsOptional()
  @IsBoolean()
  inspection?: boolean;
}