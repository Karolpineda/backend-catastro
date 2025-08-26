import { Module } from '@nestjs/common';
import { ClasifCatastralController } from './clasif_catastral.controller';
import { ClasifCatastralService } from './clasif_catastral.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clasif_catastral } from './clasif_catastral.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clasif_catastral])],
  controllers: [ClasifCatastralController],
  providers: [ClasifCatastralService]
})
export class ClasifCatastralModule {}
