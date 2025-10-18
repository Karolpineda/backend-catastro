// update-sirecq-externo.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSirecqExternoDto } from 'src/sirecq_externo/dto/create-sirecq_externo.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSirecqExternoDto extends PartialType(CreateSirecqExternoDto) {
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