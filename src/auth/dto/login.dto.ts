import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  correo_usuario: string;

  @IsString()
  @IsNotEmpty()
  contrasenia_usuario: string;
}
