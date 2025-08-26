import { Module } from '@nestjs/common';
import { ZonaModule } from './zona/zona.module';
import { UsuarioModule } from './usuario/usuario.module';
import { EstadoAccIncModule } from './estado_acc_inc/estado_acc_inc.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolModule } from './rol/rol.module';
import { SistemaModule } from './sistema/sistema.module';
import { DependenciaModule } from './dependencia/dependencia.module';
import { ClasifCatastralModule } from './clasif_catastral/clasif_catastral.module';
import { CategoriaModule } from './categoria/categoria.module';


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
      
    ZonaModule, UsuarioModule, EstadoAccIncModule, RolModule, SistemaModule, DependenciaModule, ClasifCatastralModule, CategoriaModule],
  controllers: [],

})
export class AppModule {}