import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Patch } from '@nestjs/common';
import { DependenciaService } from './dependencia.service';
import { CreateDependenciaDto } from './dto/create-dependecia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
import { Dependencia } from './dependecia.entity';

@Controller('dependencia')
export class DependenciaController {
    constructor(private dependenciaService: DependenciaService) {}

    @Post()
    createDependencia(@Body() newDependencia: CreateDependenciaDto) {
        return this.dependenciaService.createDependencia(newDependencia);
    }

    @Get()
    getAllDependencias(): Promise<Dependencia[]> {
        return this.dependenciaService.getAllDependencia();
    }

    @Get(':nom_dependencia')
    getNombreDependencia(@Param('nom_dependencia') nom_dependencia: string) {
        return this.dependenciaService.getNombreDependencia(nom_dependencia);
    }

    @Delete(':nom_dependencia')
    deleteDependencia(@Param('nom_dependencia') nom_dependencia: string) {
        return this.dependenciaService.deleteDependencia(nom_dependencia);
    }

    @Patch(':nom_dependencia')
    updateDependencia(@Param('nom_dependencia') nom_dependencia: string, @Body() updateDependencia: UpdateDependenciaDto) {
        return this.dependenciaService.updateDependencia(nom_dependencia, updateDependencia);
    }
}
