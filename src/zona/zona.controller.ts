import { Controller, Get } from '@nestjs/common';
import { ZonaService } from './zona.service';

@Controller({})
export class ZonaController {
    constructor (private zonaService: ZonaService) {}

    @Get ('/zona')
    getZonas(){
        return this.zonaService.getZonas();
    }
    

}
