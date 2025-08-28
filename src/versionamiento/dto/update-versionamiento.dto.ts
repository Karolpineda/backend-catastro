import { PartialType } from '@nestjs/mapped-types';
import { CreateVersionamientoDto } from './create-versionamiento.dto';

export class UpdateVersionamientoDto extends PartialType(CreateVersionamientoDto) {}
