import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Clasif_catastral } from './clasif_catastral.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClasifCatastralDto } from './dto/create-clasifCatastral.dto';
import { UpdateClasifCatastralDto } from './dto/update-clasifCatastral.dto';



@Injectable()
export class ClasifCatastralService {
    constructor(@InjectRepository(Clasif_catastral) private clasifCatastralRepository: Repository<Clasif_catastral>){}
    
        async createClasificacion(clasif_catastral:CreateClasifCatastralDto){
            const clasifound = await this.clasifCatastralRepository.findOne({ where: { sigla_clasif_catastral: clasif_catastral.sigla_clasif_catastral } });
            if(clasifound){
                return new HttpException('Clasificación ya existe', HttpStatus.CONFLICT)
            } else {
                const newClasificacion = this.clasifCatastralRepository.create(clasif_catastral);
                return this.clasifCatastralRepository.save(newClasificacion);
            }
        }
    
        async getAllClasificacion(){
            return this.clasifCatastralRepository.find();
        }
    
        async getSiglaCatastral(sigla_clasif_catastral: string){
            const clasifound = await this.clasifCatastralRepository.findOne({ where: { sigla_clasif_catastral: sigla_clasif_catastral } });
    
            if(!clasifound){
                return new HttpException('Clasificación catastral no encontrada', HttpStatus.NOT_FOUND);
            } else {
                return clasifound;
            }
        }
        async deleteCatastral(sigla_clasif_catastral: string){
            const clasifound = await this.clasifCatastralRepository.findOne({ where: { sigla_clasif_catastral: sigla_clasif_catastral } });
    
            if(!clasifound){
                return new HttpException('Clasificación catastral no encontrada', HttpStatus.NOT_FOUND);
            } else {
                return this.clasifCatastralRepository.delete({ sigla_clasif_catastral: sigla_clasif_catastral });
            }
        }
        async updateCatastral(sigla_clasif_catastral: string, clasif_catastral:UpdateClasifCatastralDto){
            const clasifound = await this.clasifCatastralRepository.findOne({ where: { sigla_clasif_catastral: sigla_clasif_catastral } });
    
            if(!clasifound){
                return new HttpException('Clasificación catastral no encontrada', HttpStatus.NOT_FOUND);
            } else {
                const updateCatastro = Object.assign(clasifound, clasif_catastral);
                return this.clasifCatastralRepository.save(updateCatastro);
            }
        }
}
