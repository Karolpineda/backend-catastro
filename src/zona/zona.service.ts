import { Injectable } from '@nestjs/common';

@Injectable()
export class ZonaService {

    getZonas(){
    return ['Zona 1', 'Zona 2', 'Zona 3']
}


}
