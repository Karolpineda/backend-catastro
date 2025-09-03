import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsNumber, IsDate, IsBase64 } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIncidenteDto {
  @IsOptional()
  @IsNumber()
  id_zona?: number;

  @IsNumber()
  id_estado_acc_inc: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaingresoerror?: Date;

  @IsOptional()
  @IsString()
  descripcionerror?: string;

  @IsOptional()
  @IsNumber()
  añosirecq: number;

  @IsOptional()
  @IsString()
  no_incidente?: string;

  @IsOptional()
  @IsString()
  tipologia?: string;

  @IsOptional()
  @IsBase64()
  error_img?: string; 
}