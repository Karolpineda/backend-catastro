import { PartialType } from '@nestjs/swagger';
import { CreateSirecqInternoDto } from './create-sirecq_interno.dto';

export class UpdateSirecqInternoDto extends PartialType(CreateSirecqInternoDto) {}
