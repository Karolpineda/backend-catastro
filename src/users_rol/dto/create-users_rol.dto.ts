import { IsNumber } from 'class-validator';

export class CreateUsersRolDto {
  @IsNumber()
  id_usuario: number;

  @IsNumber()
  id_rol: number;
}
