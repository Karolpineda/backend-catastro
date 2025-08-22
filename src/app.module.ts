import { Module } from '@nestjs/common';
import { ZonaModule } from './zona/zona.module';
import { TypeOrmModule } from '@nestjs/typeorm';



@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: 5432,
      host: 'localhost',
      username: 'postgres',
      password: 'postgres',
      database: 'catastro_tp',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
    }),
      
    ZonaModule, ],
  controllers: [],

})
export class AppModule {}