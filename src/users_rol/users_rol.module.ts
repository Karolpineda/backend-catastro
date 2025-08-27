import { Module } from '@nestjs/common';
import { UsersRolService } from './users_rol.service';
import { UsersRolController } from './users_rol.controller';

@Module({
  controllers: [UsersRolController],
  providers: [UsersRolService],
})
export class UsersRolModule {}
