import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Patch } from '@nestjs/common';
import { SistemaService } from './sistema.service';
import { CreateSistemaDto } from './dto/create-sistema.dto';
import { UpdateSistemaDto } from './dto/update-sistema.dto';
import { Sistema } from './sistema.entity';

@Controller('sistema')
export class SistemaController {

    constructor (private sistemaService: SistemaService) {}

    @Post()
    createSistema(@Body() newSsitema: CreateSistemaDto){
        return this.sistemaService.createSistema(newSsitema)
    }

    @Get()
    getAllSsistema(): Promise<Sistema[]> {
        return this.sistemaService.getAllSistema();
    }

    @Get(':nom_sistema')
    getNombreSistema(@Param('nom_sistema') nom_sistema: string){
        return this.sistemaService.getNombreSistema(nom_sistema);
    }

    @Delete(':nom_sistema')
    deleteSistema(@Param('nom_sistema') nom_sistema: string) {
        return this.sistemaService.deleteSistema(nom_sistema);
    }

    @Patch(':nom_sistema')
    updateSistema(@Param('nom_sistema') nom_sistema: string, @Body() updateSistema: UpdateSistemaDto) {
        return this.sistemaService.updateSistema(nom_sistema, updateSistema);
    }
}
