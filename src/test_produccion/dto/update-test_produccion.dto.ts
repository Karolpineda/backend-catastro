import { PartialType } from '@nestjs/mapped-types';
import { CreateTestProduccionDto } from './create-test_produccion.dto';
import { IsOptional, IsNumber, IsString, IsDateString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class VersionamientoUpdateDto {
  @IsOptional()
  @IsNumber()
  id_version?: number;

  @IsOptional()
  @IsString()
  ofi_desp_pt?: string;

  @IsOptional()
  @IsDateString()
  fecha_env?: Date;

  @IsOptional()
  @IsString()
  fech_desp_pt?: string;

  @IsOptional()
  @IsString()
  oficioenviodmi?: string;

  @IsOptional()
  @IsString()
  fechaenvioreq?: string;

  @IsOptional()
  @IsString()
  obs_version?: string;
}

class NuevaVersionDto {
  @IsOptional()
  @IsString()
  ofi_desp_pt?: string;

  @IsOptional()
  @IsString()
  fech_desp_pt?: string;

  @IsOptional()
  @IsString()
  oficioenviodmi?: string;

  @IsOptional()
  @IsString()
  fechaenvioreq?: string;

  @IsOptional()
  @IsString()
  obs_version?: string;
}

export class UpdateTestProduccionDto extends PartialType(CreateTestProduccionDto) {
  @IsOptional()
  @IsNumber()
  id_rol_usuario?: number;

  @IsOptional()
  @IsString()
  etapa_implementation?: string;

  @IsOptional()
  @IsString()
  respuesta_tics?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  no_requerimiento?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NuevaVersionDto)
  versionamiento?: NuevaVersionDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VersionamientoUpdateDto)
  versionesActualizadas?: VersionamientoUpdateDto[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  versionesAEliminar?: number[];
}