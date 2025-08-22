import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Patch } from '@nestjs/common';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { Rol } from './rol.entity';

@Controller('rol')
export class RolController {
    constructor(private rolService: RolService) {}

    @Post()
    createRol(@Body() newRol: CreateRolDto){
        return this.rolService.createRol(newRol);
    }
    @Get()
    getAllRol(): Promise<Rol[]> {
            return this.rolService.getAllRol();
        }
    
        @Get(':nombre_rol')
            getCedulaUsuario(@Param('nombre_rol') nombre_rol: string){
            return this.rolService.getNombreRol(nombre_rol);
        }
        @Delete(':nombre_rol')
            deleteZona(@Param('nombre_rol') nombre_rol:string) {
            return this.rolService.deleteRol(nombre_rol)
        }
        
            @Patch(':nombre_rol')
            updateZona(@Param('id_zona') nombre_rol:string, @Body() updateRol: UpdateRolDto){
            return this.rolService.updateRol(nombre_rol, updateRol);
        }
}
