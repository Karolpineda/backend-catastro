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

    @Get(':id_dependencia')
    getNombreDependencia(@Param('id_dependencia') id_dependencia: number) {
        return this.dependenciaService.getNombreDependencia(id_dependencia);
    }

    @Delete(':id_dependencia')
    deleteDependencia(@Param('id_dependencia') id_dependencia: number) {
        return this.dependenciaService.deleteDependencia(id_dependencia);
    }

    @Patch(':id_dependencia')
    updateDependencia(@Param('id_dependencia') id_dependencia: number, @Body() updateDependencia: UpdateDependenciaDto) {
        return this.dependenciaService.updateDependencia(id_dependencia, updateDependencia);
    }
}
