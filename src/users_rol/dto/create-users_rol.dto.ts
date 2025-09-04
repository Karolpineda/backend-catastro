import { IsUUID } from 'class-validator';

export class CreateUsersRolDto {
  @IsUUID()
  id_usuario: number;

  @IsUUID()
  id_rol: number;
}
