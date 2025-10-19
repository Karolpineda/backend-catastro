import { IsString, IsInt, IsOptional, IsDateString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTestProduccionDto {
  @IsInt()
  @IsNotEmpty()
  id_rol_usuario: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  etapa_implementation?: string;

  @IsOptional()
  @IsDateString()
  fecha_env?: Date;

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
}