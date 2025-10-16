import { PartialType } from '@nestjs/swagger';
import { CreateTestVersionDto } from './create-test-version.dto';

export class UpdateTestVersionDto extends PartialType(CreateTestVersionDto) {}
