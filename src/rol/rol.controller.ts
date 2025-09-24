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
    
        @Get(':id_rol')
            getCedulaUsuario(@Param('id_rol') id_rol: number){
            return this.rolService.getNombreRol(id_rol);
        }

        @Get('id/:id_rol')
        getRolById(@Param('id_rol', ParseIntPipe) id_rol: number) {
            return this.rolService.getRolById(id_rol);
        }
        @Delete(':id_rol')
            deleteRol(@Param('nombre_rol') id_rol) {
            return this.rolService.deleteRol(id_rol)
        }
        
            @Patch(':id_rol')
            updateRol(@Param('id_zona') id_rol: number, @Body() updateRol: UpdateRolDto){
            return this.rolService.updateRol(id_rol, updateRol);
        }
}
