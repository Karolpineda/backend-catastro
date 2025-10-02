import { IsOptional, IsString, IsNumber, IsDate, IsBase64, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUsuarioIncidenteDto } from 'src/usuario_incidente/dto/create-usuario_incidente.dto';

export class CreateIncidenteDto {
  @IsOptional()
  @IsNumber()
  id_analista?: number;

  @IsOptional()
  @IsNumber()
  id_tecnico?: number;
  
  @IsOptional()
  @IsNumber()
  id_zona?: number;

  @IsOptional()
  @IsDateString()
  fechaingresoerror?: Date;

  @IsOptional()
  @IsString()
  descripcionerror?: string;

  @IsOptional()
  @IsNumber()
  aniosirecq: number;

  @IsOptional()
  @IsString()
  no_incidente?: string;

  @IsOptional()
  @IsString()
  tipologia?: string;

  @IsOptional()
  @IsBase64()
  error_img?: string; 

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUsuarioIncidenteDto)
  asignaciones?: CreateUsuarioIncidenteDto[];

  // 👇 NUEVO
  @IsOptional()
  @IsString()
  mensajeerror?: string;

  // 👇 NUEVO
  @IsOptional()
  @IsString()
  obs_incidente?: string;

  // 👇 NUEVO
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fech_solucion?: Date;
}
