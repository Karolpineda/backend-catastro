import { Body, Controller, Delete, Get, Param, Post, Patch } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { Categoria } from './categoria.entity';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { identity } from 'rxjs';

@Controller('categoria')
export class CategoriaController {

    constructor(private categoriaService: CategoriaService){}

    @Post()
    createCategoria(@Body()newCategoria: CreateCategoriaDto){
        return this.categoriaService.createCategoria(newCategoria);
    }   
    @Get()

    getAllCategory(): Promise<Categoria[]>{
        return this.categoriaService.getAllCategory();
    }
    @Get('/:id_categoria')
    getSiglaCategoria(@Param('id_categoria') id_categoria:number){  
        return this.categoriaService.getSiglaCategoria(id_categoria);
    }   
    @Delete('/:id_categoria')
    deleteCategoria(@Param('id_categoria') id_categoria:number){  
        return this.categoriaService.deleteCategoria(id_categoria);
    }
    @Patch('/:id_categoria')
    updateCategoria(@Param('id_categoria') id_categoria:number, @Body() updateCategoria:UpdateCategoriaDto){  
        return this.categoriaService.updateCategoria(id_categoria, updateCategoria);
    }



}

