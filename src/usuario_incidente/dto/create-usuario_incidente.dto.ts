// dto/create-usuario-incidente.dto.ts
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateUsuarioIncidenteDto {
  @IsInt()
  @IsNotEmpty()
  idRolUsuario: number;
}