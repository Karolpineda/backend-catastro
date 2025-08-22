import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estado_acc_inc } from './estado_acc_inc.entity';
import { CreateEstadoAccIncDto } from './dto/create-estado_acc_inc.dto';
import { UpdateEstadoAccIncDto } from './dto/update-estado_acc_inc.dto';

@Injectable()
export class EstadoAccIncService {

    constructor(@InjectRepository(Estado_acc_inc) private estadoAccIncRepository: Repository<Estado_acc_inc>){}

    createEstadoAccInc(estadoAccInc: CreateEstadoAccIncDto){
        const newEstadoAccInc = this.estadoAccIncRepository.create(estadoAccInc)
        return this.estadoAccIncRepository.save(newEstadoAccInc)

    }
    getAllEstadoAccInc(){
        return this.estadoAccIncRepository.find();
    }

    getEstadoAccInc(nombre_estado_acc_inc: string){
        return this.estadoAccIncRepository.findOne({ where: { nombre_estado_acc_inc } });
    }

    deleteEstadoAccInc(id_estado_acc_inc:number){
        return this.estadoAccIncRepository.delete([id_estado_acc_inc]);
    }
    updateEstadoAccInc(id_estado_acc_inc:number,estadoAccInc: UpdateEstadoAccIncDto){
        return this.estadoAccIncRepository.update(id_estado_acc_inc, estadoAccInc);
    }
}
