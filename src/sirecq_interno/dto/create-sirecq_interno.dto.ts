// create-sirecq-interno-completo.dto.ts
import { IsOptional, IsString, IsInt, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRequerimientoDto } from 'src/requerimiento/dto/create-requerimiento.dto';
import { CreateSirecqExternoDto } from 'src/sirecq_externo/dto/create-sirecq_externo.dto';

export class CreateSirecqInternoDto {
  @IsOptional()
  @IsDateString()
  fecha_env_dmc?: string;

  @IsOptional()
  @IsString()
  obsv_tecnica?: string;

  @IsOptional()
  @IsInt()
  id_clasif_catastral?: number;

  // 🆕 IDs directos de usuario_rol (como en Incidente)
  @IsOptional()
  @IsInt()
  id_analista?: number;

  @IsOptional()
  @IsInt()
  id_tecnico?: number;


  // Requerimiento (con versionamiento)
  @ValidateNested()
  @Type(() => CreateRequerimientoDto)
  requerimiento: CreateRequerimientoDto;

  // SirecqExterno
  @ValidateNested()
  @Type(() => CreateSirecqExternoDto)
  sirecqExterno: CreateSirecqExternoDto;
}