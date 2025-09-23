// create-accidente.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsBoolean, IsInt } from 'class-validator';


export class CreateAccidenteDto {
  @IsOptional()
  @IsString()
  tramite_accidente?: string;

  @IsOptional()
  @IsString()
  oficio_memorando_mail?: string;

  @IsNotEmpty()
  @IsDateString()
  fech_ingr_tramite: Date;

  @IsNotEmpty()
  @IsDateString()
  fecha_asignacion: Date;

  @IsNotEmpty()
  @IsInt()
  tipologia: number;

  @IsNotEmpty()
  @IsBoolean()
  inspeccion: boolean;

  @IsNotEmpty()
  @IsString()
  predio: string;

  @IsNotEmpty()
  @IsString()
  clave_catastral: string;

  @IsNotEmpty()
  @IsString()
  nom_propietario: string;

  @IsNotEmpty()
  @IsInt()
  id_estado_acc_inc: number;

  // Otros campos opcionales
  @IsOptional()
  @IsString()
  documento?: string;

  @IsOptional()
  @IsString()
  cod_consulta?: string;

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
  id_zona?: number;

  @IsOptional()
  @IsInt()
  id_rol_usuario?: number;
}