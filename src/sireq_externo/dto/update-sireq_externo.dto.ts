import { PartialType } from '@nestjs/swagger';
import { CreateSireqExternoDto } from './create-sireq_externo.dto';

export class UpdateSireqExternoDto extends PartialType(CreateSireqExternoDto) {}
