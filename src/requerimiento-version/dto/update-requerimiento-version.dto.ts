import { PartialType } from '@nestjs/swagger';
import { CreateRequerimientoVersionDto } from './create-requerimiento-version.dto';

export class UpdateRequerimientoVersionDto extends PartialType(CreateRequerimientoVersionDto) {}
