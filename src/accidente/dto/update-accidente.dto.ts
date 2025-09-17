import { IsBoolean, IsDate, IsInt, IsOptional, IsString, MaxLength,  } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAccidenteDto {
  @IsOptional()
  @IsString()
  @MaxLength(1)
 tramite_accidente?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fech_ingr_tramite?: Date;

  @IsOptional()
  @IsBoolean()
  inspeccion?: boolean;

  @IsOptional()
  @IsString()
  predio?: string;

  @IsOptional()
  @IsString()
  clave_catastral?: string;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsOptional()
  @IsString()
  cod_consulta?: string;

  @IsOptional()
  @IsString()
  oficio_memorando_mail?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha_asignacion?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha_estado?: Date;

  @IsOptional()
  @IsString()
  control_calidad?: string;

  @IsOptional()
  @IsString()
  numero_interno?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsInt()
  tipologia?: number;

  @IsOptional()
  @IsString()
  nom_propietario?: string;

  @IsOptional()
  @IsInt()
  id_estado_acc_inc?: number;

  @IsOptional()
  @IsInt()
  id_zona?: number;

  @IsOptional()
  @IsInt()
  id_rol_usuario?: number;
}