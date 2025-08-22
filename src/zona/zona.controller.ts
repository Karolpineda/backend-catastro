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

    @Get(':nombre_zona')
    getZona(@Param('nombre_zona') nombre_zona:string): Promise<Zona |null> {
        return this.zonaService.getZona(nombre_zona);
    }

    @Delete(':id_zona')
    deleteZona(@Param('id_zona', ParseIntPipe) id_zona:number) {
        return this.zonaService.deleteZona(id_zona)
    }

    @Patch(':id_zona')
    updateZona(@Param('id_zona', ParseIntPipe) id_zona:number, @Body() updateZona: UpdateZonaDto){
        return this.zonaService.updateZona(id_zona, updateZona);
    }
    

}