import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Patch } from '@nestjs/common';
import { EstadoAccIncService } from './estado_acc_inc.service';
import { CreateEstadoAccIncDto } from './dto/create-estado_acc_inc.dto';
import { Estado_acc_inc } from './estado_acc_inc.entity';

@Controller('estado-acc-inc')
export class EstadoAccIncController {

    constructor(private estadoAccIncService:EstadoAccIncService){}

    @Post()
    createEstadoAccInc(@Body() newEstadoAccInc: CreateEstadoAccIncDto){
        return this.estadoAccIncService.createEstadoAccInc(newEstadoAccInc)
    }

    @Get()
    getAllEstadoAccInc(): Promise<Estado_acc_inc[]> {
        return this.estadoAccIncService.getAllEstadoAccInc();
    }

    @Get(':nombre_estado_acc_inc')
    getEstadoAccInc(@Param('nombre_estado_acc_inc') nombre_estado_acc_inc:string): Promise<Estado_acc_inc |null> {
        return this.estadoAccIncService.getEstadoAccInc(nombre_estado_acc_inc);
    }

    @Delete(':id_estado_acc_inc')
    deleteEstadoAccInc(@Param('id_estado_acc_inc', ParseIntPipe) id_estado_acc_inc:number) {
        return this.estadoAccIncService.deleteEstadoAccInc(id_estado_acc_inc)
    }

    @Patch(':id_estado_acc_inc')
    updateEstadoAccInc(@Param('id_estado_acc_inc', ParseIntPipe) id_estado_acc_inc:number, @Body() updateEstadoAccInc: CreateEstadoAccIncDto){
        return this.estadoAccIncService.updateEstadoAccInc(id_estado_acc_inc, updateEstadoAccInc);
    }
}
