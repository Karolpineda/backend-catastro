import { Module } from '@nestjs/common';
import { TestVersionService } from './test-version.service';
import { TestVersionController } from './test-version.controller';

@Module({
  controllers: [TestVersionController],
  providers: [TestVersionService],
})
export class TestVersionModule {}
