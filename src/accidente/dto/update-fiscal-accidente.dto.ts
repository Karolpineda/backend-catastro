import {  IsBoolean } from 'class-validator';

export class FiscalAccidenteDto {

  @IsBoolean({ message: 'inspeccion debe ser true o false' })
  fiscalizacion: boolean;

}