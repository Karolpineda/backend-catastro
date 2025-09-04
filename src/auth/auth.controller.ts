import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { Usuario } from '../usuario/usuario.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('check-status')
  @UseGuards(JwtAuthGuard)
  checkAuthStatus(@GetUser() usuario: Usuario) {
    return {
      usuario: {
        correo_usuario: usuario.correo_usuario,
        nombre_usuario: usuario.nombre_usuario,
        apellidos_usuario: usuario.apellidos_usuario,
      },
    };
  }
}
