import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Categoria } from './categoria.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {

    constructor(@InjectRepository(Categoria)private categoriaRepository: Repository<Categoria>){}

    async createCategoria (categoria:CreateCategoriaDto){
        const categoriaFound =await this.categoriaRepository.findOne({ where: { siglas_categoria: categoria.siglas_categoria } });
        if(categoriaFound){
            return new HttpException('Categoría ya existe', HttpStatus.CONFLICT)
        } else {
            const newCategoria = this.categoriaRepository.create(categoria);
            return this.categoriaRepository.save(newCategoria);
        }
    }
    async getAllCategory (){
        return this.categoriaRepository.find();
    }

    async getSiglaCategoria (siglas_categoria:string){
        const categoriaFound = await this.categoriaRepository.findOne({ where: { siglas_categoria: siglas_categoria } });

        if(!categoriaFound){
            return new HttpException('Categoría no encontrada', HttpStatus.NOT_FOUND);
        } else {
            return categoriaFound;
        }
    }
    async deleteCategoria (siglas_categoria:string){
        const categoriaFound = await this.categoriaRepository.findOne({ where: { siglas_categoria: siglas_categoria } });

        if(!categoriaFound){
            return new HttpException('Categoría no encontrada', HttpStatus.NOT_FOUND);
        } else {
            return this.categoriaRepository.delete({ siglas_categoria: siglas_categoria });
        }
    }
    async updateCategoria (siglas_categoria:string, categoria:UpdateCategoriaDto){
        const categoriaFound = await this.categoriaRepository.findOne({ where: { siglas_categoria: siglas_categoria } });

        if(!categoriaFound){
            return new HttpException('Categoría no encontrada', HttpStatus.NOT_FOUND);
        } else {
            const updateCategoria = Object.assign(categoriaFound, categoria);
            return this.categoriaRepository.save(updateCategoria);
        }
    }

}
