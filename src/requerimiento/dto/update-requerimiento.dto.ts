// update-requerimiento.dto.ts
import { IsString, IsInt, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// 🆕 DTO para actualizar versiones existentes
class VersionamientoUpdateDto {
  @IsOptional()
  @IsNumber()
  id_version?: number;

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

export class UpdateRequerimientoDto {
  @IsOptional()
  @IsInt()
  id_estado_requerimiento?: number;

  @IsOptional()
  @IsInt()
  id_rol_usuario?: number;

  @IsOptional()
  @IsInt()
  id_categoria?: number;

  @IsOptional()
  @IsInt()
  id_sistema?: number;

  @IsOptional()
  @IsString()
  no_requerimiento?: string;

  @IsOptional()
  @IsString()
  documento?: string;

   @IsOptional()  
  @IsString()
  origen?: string;

  @IsOptional()
  @IsString()
  tema?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  fase?: string;

  // 🔄 Versionamiento como objeto simple (para actualizar versión única)
  @IsOptional()
  versionamiento?: any;

  // 🆕 Array de versiones para actualizar múltiples versiones existentes
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VersionamientoUpdateDto)
  versionesActualizadas?: VersionamientoUpdateDto[];
}