// update-sirecq-externo-completo.dto.ts
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSirecqExternoDto } from 'src/sirecq_externo/dto/update-sirecq_externo.dto';
import { UpdateRequerimientoDto } from '../../requerimiento/dto/update-requerimiento.dto';

export class UpdateSirecqExternoCompletoDto {
  @ValidateNested()
  @Type(() => UpdateSirecqExternoDto)
  @IsOptional()
  sirecqExterno?: UpdateSirecqExternoDto;

  @ValidateNested()
  @Type(() => UpdateRequerimientoDto)
  @IsOptional()
  requerimiento?: UpdateRequerimientoDto;

  @IsOptional()
  versionamiento?: any;
}