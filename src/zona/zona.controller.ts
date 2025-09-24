import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Patch } from '@nestjs/common';
import { ZonaService } from './zona.service';
import { CreateZonaDto } from './dto/create-zona.dto';
import { Zona } from './zona.entity';
import { UpdateZonaDto } from './dto/update-zona.dto';

@Controller('zonas')
export class ZonaController {

    constructor(private zonaService:ZonaService){}

    @Post()
    createZona(@Body() newZona: CreateZonaDto){
        return this.zonaService.createZona(newZona)
    }

    @Get()
    getAllZona(): Promise<Zona[]> {
        return this.zonaService.getAllZona();
    }

    @Get(':id_zona')
    getZona(@Param('id_zona') id_zona:number): Promise<Zona |null> {
        return this.zonaService.getZona(id_zona);
    }

    @Delete(':id_zona')
    deleteZona(@Param('id_zona', ParseIntPipe) id_zona:number) {
        return this.zonaService.deleteZona(id_zona)
    }

    @Patch(':id_zona')
    updateZona(@Param('id_zona', ParseIntPipe) id_zona:number, @Body() updateZona: UpdateZonaDto){
        return this.zonaService.updateZona(id_zona, updateZona);
    }

    @Get('direccion/exclude')
    getZonaDireccion(){
        return this.zonaService.getZonaNotDireccion();    
    }

    @Get('direccion/include')
    getDirección(){
        return this.zonaService.getDirección();    
    }
    

}