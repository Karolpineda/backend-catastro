// update-requerimiento.dto.ts
import { IsString, IsInt, IsOptional } from 'class-validator';

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
  tema?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  fase?: string;

  // 🆕 Versionamiento como objeto simple - SIN VALIDACIÓN COMPLEJA
  @IsOptional()
  versionamiento?: any;
  
}