// versionamiento/dto/add-version.dto.ts
import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class AddVersionDto {
  @IsOptional()
  @IsString()
  oficioenviodmi?: string;

  @IsOptional()
  @IsDateString()
  fechaenvioreq?: Date;

  @IsOptional()
  @IsString()
  ofi_desp_pt?: string;

  @IsOptional()
  @IsDateString()
  fech_desp_pt?: Date;

  @IsNumber()
  num_version: number;

  @IsOptional()
  @IsString()
  obs_version?: string;
}