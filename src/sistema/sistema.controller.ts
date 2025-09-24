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

    @Get(':id_sistema')
    getNombreSistema(@Param('id_sistema') id_sistema: number){
        return this.sistemaService.getNombreSistema(id_sistema);
    }

    @Delete(':id_sistema')
    deleteSistema(@Param('id_sistema') id_sistema: number) {
        return this.sistemaService.deleteSistema(id_sistema);
    }

    @Patch(':id_sistema')
    updateSistema(@Param('id_sistema') id_sistema: number, @Body() updateSistema: UpdateSistemaDto) {
        return this.sistemaService.updateSistema(id_sistema, updateSistema);
    }
}
