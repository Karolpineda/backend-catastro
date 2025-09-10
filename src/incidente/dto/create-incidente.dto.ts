import { IsOptional, IsString, IsNumber, IsDate, IsBase64, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUsuarioIncidenteDto } from 'src/usuario_incidente/dto/create-usuario_incidente.dto';

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUsuarioIncidenteDto)
  asignaciones?: CreateUsuarioIncidenteDto[];
}