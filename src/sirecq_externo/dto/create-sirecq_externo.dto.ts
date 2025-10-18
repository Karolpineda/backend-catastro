import { IsString, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import {Type} from 'class-transformer';
import { CreateRequerimientoDto } from 'src/requerimiento/dto/create-requerimiento.dto';

export class CreateSirecqExternoDto {

  @ValidateNested()
  @Type(() => CreateRequerimientoDto)
  requerimiento: CreateRequerimientoDto;
 
  @IsOptional()
  @IsString()
  tramitepr?: string;

  @IsOptional()
  @IsString()
  seguimientoinst?: string;

  @IsOptional()
  @IsString()
  tramitecat?: string;

  @IsOptional()
  @IsString()
  responext?: string;

  @IsOptional()
  @IsString()
  observacionesgen?: string;

  @IsOptional()
  @IsNumber()
  id_dependencia?: number;

}