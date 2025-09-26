// create-accidente.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsBoolean, IsInt } from 'class-validator';

export class CreateAccidenteDto {
  @IsOptional()
  @IsString({ message: 'tramite_accidente debe ser una cadena de texto' })
  tramite_accidente?: string;

  @IsOptional()
  @IsString({ message: 'oficio_memorando_mail debe ser una cadena de texto' })
  oficio_memorando_mail?: string;

  @IsNotEmpty({ message: 'fech_ingr_tramite es obligatorio' })
  @IsDateString({}, { message: 'fech_ingr_tramite debe ser una fecha válida' })
  fech_ingr_tramite: Date;

  @IsNotEmpty({ message: 'fecha_asignacion es obligatoria' })
  @IsDateString({}, { message: 'fecha_asignacion debe ser una fecha válida' })
  fecha_asignacion: Date;

  @IsNotEmpty({ message: 'tipologia es obligatoria' })
  @IsInt({ message: 'tipologia debe ser un número entero' })
  tipologia: number;

  @IsNotEmpty({ message: 'inspeccion es obligatoria' })
  @IsBoolean({ message: 'inspeccion debe ser true o false' })
  inspeccion: boolean;

  @IsNotEmpty({ message: 'predio es obligatorio' })
  @IsString({ message: 'predio debe ser una cadena de texto' })
  predio: string;

  @IsNotEmpty({ message: 'clave_catastral es obligatoria' })
  @IsString({ message: 'clave_catastral debe ser una cadena de texto' })
  clave_catastral: string;

  @IsNotEmpty({ message: 'nom_propietario es obligatorio' })
  @IsString({ message: 'nom_propietario debe ser una cadena de texto' })
  nom_propietario: string;

  @IsNotEmpty({ message: 'id_estado_acc_inc es obligatorio' })
  @IsInt({ message: 'id_estado_acc_inc debe ser un número entero' })
  id_estado_acc_inc: number;

  @IsOptional()
  @IsString({ message: 'documento debe ser una cadena de texto' })
  documento?: string;

  @IsOptional()
  @IsString({ message: 'cod_consulta debe ser una cadena de texto' })
  cod_consulta?: string;

  @IsOptional()
  @IsString({ message: 'control_calidad debe ser una cadena de texto' })
  control_calidad?: string;

  @IsOptional()
  @IsString({ message: 'numero_interno debe ser una cadena de texto' })
  numero_interno?: string;

  @IsOptional()
  @IsString({ message: 'observaciones debe ser una cadena de texto' })
  observaciones?: string;

  @IsNotEmpty({ message: 'id_zona es obligatorio' })
  @IsInt({ message: 'id_zona debe ser un número entero' })
  id_zona: number;

  @IsNotEmpty({ message: 'id_rol_usuario es obligatorio' })
  @IsInt({ message: 'id_rol_usuario debe ser un número entero' })
  id_rol_usuario: number;
}