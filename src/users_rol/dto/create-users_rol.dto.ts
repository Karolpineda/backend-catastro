import { IsUUID } from 'class-validator';

export class CreateUsersRolDto {
  @IsUUID()
  id_usuario: string;

  @IsUUID()
  id_rol: string;
}
