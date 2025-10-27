import { IsString, IsInt, IsOptional, IsDateString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTestProduccionDto {
  @IsInt()
  @IsNotEmpty()
  id_rol_usuario: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  etapa_implementation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(455)
  respuesta_tics?: string;

  @IsString()
  @IsOptional()
  @MaxLength(455)
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  no_requerimiento?: string;

  @IsOptional()
  @IsString()
  ofi_env_pt?: string;

  @IsOptional()
  @IsDateString()
  fech_env_pt?: Date;
}