import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioIncidenteDto } from './create-usuario_incidente.dto';

export class UpdateUsuarioIncidenteDto extends PartialType(CreateUsuarioIncidenteDto) {}
