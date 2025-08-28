import { Injectable,HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEstadoRequerimientoDto } from './dto/create-estado_requerimiento.dto';
import { UpdateEstadoRequerimientoDto } from './dto/update-estado_requerimiento.dto';
import { Estado_requerimiento } from './entities/estado_requerimiento.entity';

@Injectable()
export class EstadoRequerimientoService {

    constructor (@InjectRepository(Estado_requerimiento) private estadoReqRepository: Repository<Estado_requerimiento>){}

    async createEstadoReq(EstadoReq: CreateEstadoRequerimientoDto) {
      const newEstadoAccInc = await this.estadoReqRepository.create(EstadoReq)
      return await this.estadoReqRepository.save(newEstadoAccInc)
    }

    async findAllEstadoReq() {
      return this.estadoReqRepository.find();
    }


    async updateEstadoReq(id_estado_requerimiento: number, estadoreq: UpdateEstadoRequerimientoDto) {
      return this.estadoReqRepository.update(id_estado_requerimiento, estadoreq)
    }

    async removeEstadoReq(id_estado_requerimiento: number) {
      return this.estadoReqRepository.delete([id_estado_requerimiento])
    }
}
