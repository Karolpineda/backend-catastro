import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadoRequerimientoDto } from './create-estado_requerimiento.dto';

export class UpdateEstadoRequerimientoDto extends PartialType(CreateEstadoRequerimientoDto) {}
