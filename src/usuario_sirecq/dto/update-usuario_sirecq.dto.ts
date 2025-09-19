import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioSirecqDto } from './create-usuario_sirecq.dto';

export class UpdateUsuarioSirecqDto extends PartialType(CreateUsuarioSirecqDto) {}
