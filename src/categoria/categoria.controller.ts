import { Body, Controller, Delete, Get, Param, Post, Patch } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { Categoria } from './categoria.entity';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

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
    @Get('/:siglas_categoria')
    getSiglaCategoria(@Param('siglas_categoria') siglas_categoria:string){  
        return this.categoriaService.getSiglaCategoria(siglas_categoria);
    }   
    @Delete('/:siglas_categoria')
    deleteCategoria(@Param('siglas_categoria') siglas_categoria:string){  
        return this.categoriaService.deleteCategoria(siglas_categoria);
    }
    @Patch('/:siglas_categoria')
    updateCategoria(@Param('siglas_categoria') siglas_categoria:string, @Body() updateCategoria:UpdateCategoriaDto){  
        return this.categoriaService.updateCategoria(siglas_categoria, updateCategoria);
    }



}

