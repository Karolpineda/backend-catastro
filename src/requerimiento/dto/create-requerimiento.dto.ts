// create-requerimiento.dto.ts
import { IsString, IsInt, IsDateString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVersionamientoDto } from 'src/versionamiento/dto/create-versionamiento.dto';

export class CreateRequerimientoDto {
  @IsInt()
  id_estado_requerimiento: number;

  @IsInt()
  id_rol_usuario: number;

  @IsInt()
  id_categoria: number;

  @IsInt()
  id_sistema: number;

  @IsString()
  no_requerimiento: string;

  @IsOptional()
  @IsDateString()
  fecha_registro?: string;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsString()
  tema: string;

  @IsString()
  descripcion: string;

  @IsOptional()  
  @IsString()
  origen?: string;

  @IsString()
  fase: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVersionamientoDto)
  versiones?: CreateVersionamientoDto[];
}