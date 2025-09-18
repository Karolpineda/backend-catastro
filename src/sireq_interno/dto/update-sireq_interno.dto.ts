import { PartialType } from '@nestjs/swagger';
import { CreateSireqInternoDto } from './create-sireq_interno.dto';

export class UpdateSireqInternoDto extends PartialType(CreateSireqInternoDto) {}
