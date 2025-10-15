import { PartialType } from '@nestjs/swagger';
import { CreateTestProduccionDto } from './create-test_produccion.dto';

export class UpdateTestProduccionDto extends PartialType(CreateTestProduccionDto) {}
