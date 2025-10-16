// update-sirecq-interno-completo.dto.ts
import { IsOptional, IsString, IsInt, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateRequerimientoDto } from 'src/requerimiento/dto/update-requerimiento.dto';
import { UpdateSirecqExternoDto } from 'src/sirecq_externo/dto/update-sirecq_externo.dto';

export class UpdateSirecqInternoDto {
  @IsOptional()
  @IsDateString()
  fecha_env_dmc?: string;

  @IsOptional()
  @IsString()
  obsv_tecnica?: string;

  @IsOptional()
  @IsInt()
  id_clasif_catastral?: number;

  // IDs directos de usuario_rol
  @IsOptional()
  @IsInt()
  id_analista?: number;

  @IsOptional()
  @IsInt()
  id_tecnico?: number;


  @IsOptional()
  @IsInt()
  prioridad?: number;

  @IsOptional()
  @IsString()
  tecnico?: string;

  // Requerimiento
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateRequerimientoDto)
  requerimiento?: UpdateRequerimientoDto;

  // SirecqExterno
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSirecqExternoDto)
  sirecqExterno?: UpdateSirecqExternoDto;

  // Versionamiento
  @IsOptional()
  versionamiento?: any;
}