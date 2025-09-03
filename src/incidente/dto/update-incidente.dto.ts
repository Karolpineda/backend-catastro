import { PartialType } from '@nestjs/mapped-types';
import { CreateIncidenteDto } from './create-incidente.dto';
import { IsOptional, IsString, IsNumber, IsDate, IsBase64 } from 'class-validator'; // ✅ Agregar esto
import { Type } from 'class-transformer'; // ✅ Agregar esto

export class UpdateIncidenteDto extends PartialType(CreateIncidenteDto) {
  // Si necesitas agregar validaciones adicionales al update:
  
  @IsOptional()
  @IsString()
  no_incidente?: string;

  @IsOptional()
  @IsNumber()
  id_zona?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaingresoerror?: Date;

  @IsOptional()
  @IsString()
  tipologia?: string;

  @IsOptional()
  @IsString()
  descripcionerror?: string;

  @IsOptional()
  @IsNumber()
  añosirecq?: number;

  @IsOptional()
  @IsString()
  mensajeerror?: string;

  @IsOptional()
  @IsBase64()
  error_img?: string;
}