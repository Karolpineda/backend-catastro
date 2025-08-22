import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Patch } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './usuario.entity';

@Controller('usuario')
export class UsuarioController {
    constructor(private usuarioService: UsuarioService) {}
    
    @Post()
    createUsuario(@Body()newUsuario: CreateUsuarioDto){
        return this.usuarioService.createUsuario(newUsuario);
    }

    @Get()
    getAllUsuario(): Promise<Usuario[]> {
        return this.usuarioService.getAllUsuario();
    }

    @Get(':cedula_usuario')
        getCedulaUsuario(@Param('cedula_usuario') cedula_usuario: string){
        return this.usuarioService.getCedulaUsuario(cedula_usuario);
    }
    @Delete(':cedula_usuario')
        deleteZona(@Param('cedula_usuario') cedula_usuario:string) {
        return this.usuarioService.deleteUsuario(cedula_usuario)
    }
    
        @Patch(':cedula_usuario')
        updateZona(@Param('id_zona') cedula_usuario:string, @Body() updateUsuario: UpdateUsuarioDto){
        return this.usuarioService.updateUsuario(cedula_usuario, updateUsuario);
    }
}
