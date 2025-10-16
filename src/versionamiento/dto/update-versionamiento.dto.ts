import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateVersionamientoDto {
  @IsOptional()
  @IsString()
  ofi_desp_pt?: string;

  @IsOptional()
  @IsDateString()
  fech_desp_pt?: Date;

  @IsOptional()
  @IsString()
  oficioenviodmi?: string;

  @IsOptional()
  @IsDateString()
  fechaenvioreq?: Date;

  @IsOptional()
  @IsString()
  obs_version?: string;
}
