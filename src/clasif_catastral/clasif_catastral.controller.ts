import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Patch } from '@nestjs/common';
import { ClasifCatastralService } from './clasif_catastral.service';
import { CreateClasifCatastralDto } from './dto/create-clasifCatastral.dto';
import { UpdateClasifCatastralDto } from './dto/update-clasifCatastral.dto';
import { Clasif_catastral } from './clasif_catastral.entity';

@Controller('clasif-catastral')
export class ClasifCatastralController {
    constructor(private clasifCatastralService: ClasifCatastralService) {}
    
        @Post()
        createCatastro(@Body() newCatastro: CreateClasifCatastralDto) {
            return this.clasifCatastralService.createClasificacion(newCatastro);
        }
    
        @Get()
        getAllCatastro(): Promise<Clasif_catastral[]> {
            return this.clasifCatastralService.getAllClasificacion();
        }
    
        @Get(':sigla_clasif_catastral')
        getSiglaCatastro(@Param('sigla_clasif_catastral') sigla_clasif_catastral: string) {
            return this.clasifCatastralService.getSiglaCatastral(sigla_clasif_catastral);
        }
    
        @Delete(':sigla_clasif_catastral')
        deleteCatastro(@Param('sigla_clasif_catastral') sigla_clasif_catastral: string) {
            return this.clasifCatastralService.deleteCatastral(sigla_clasif_catastral);
        }
    
        @Patch(':sigla_clasif_catastral')
        updateCatastro(@Param('sigla_clasif_catastral') sigla_clasif_catastral: string, @Body() updateClasifCatastralDto: UpdateClasifCatastralDto) {
            return this.clasifCatastralService.updateCatastral(sigla_clasif_catastral, updateClasifCatastralDto);
        }
}
