import { PartialType } from '@nestjs/swagger'; 
import { CreateAccidenteDto } from './create-accidente.dto';

export class UpdateAccidenteDto extends PartialType(CreateAccidenteDto) {}
