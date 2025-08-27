import { PartialType } from '@nestjs/mapped-types';
import { CreateUsersRolDto } from './create-users_rol.dto';

export class UpdateUsersRolDto extends PartialType(CreateUsersRolDto) {}
