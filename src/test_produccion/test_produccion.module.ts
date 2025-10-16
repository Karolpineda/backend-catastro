import { Module } from '@nestjs/common';
import { TestProduccionService } from './test_produccion.service';
import { TestProduccionController } from './test_produccion.controller';

@Module({
  controllers: [TestProduccionController],
  providers: [TestProduccionService],
})
export class TestProduccionModule {}
