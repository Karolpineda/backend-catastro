import { PartialType } from '@nestjs/swagger';
import { CreateSirecqExternoDto } from './create-sirecq_externo.dto';

export class UpdateSirecqExternoDto extends PartialType(CreateSirecqExternoDto) {}
