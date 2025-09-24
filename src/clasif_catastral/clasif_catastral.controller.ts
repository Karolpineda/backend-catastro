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
    
        @Get(':id_clasif_catastral')
        getSiglaCatastro(@Param('id_clasif_catastral') id_clasif_catastral: number) {
            return this.clasifCatastralService.getSiglaCatastral(id_clasif_catastral);
        }
    
        @Delete(':id_clasif_catastral')
        deleteCatastro(@Param('id_clasif_catastral') id_clasif_catastral: number) {
            return this.clasifCatastralService.deleteCatastral(id_clasif_catastral);
        }
    
        @Patch(':id_clasif_catastral')
        updateCatastro(@Param('id_clasif_catastral') id_clasif_catastral: number, @Body() updateClasifCatastralDto: UpdateClasifCatastralDto) {
            return this.clasifCatastralService.updateCatastral(id_clasif_catastral, updateClasifCatastralDto);
        }
}
