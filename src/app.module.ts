import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ZonaModule } from './zona/zona.module';
import { UsuarioModule } from './usuario/usuario.module';
import { EstadoAccIncModule } from './estado_acc_inc/estado_acc_inc.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolModule } from './rol/rol.module';
import { SistemaModule } from './sistema/sistema.module';
import { DependenciaModule } from './dependencia/dependencia.module';
import { ClasifCatastralModule } from './clasif_catastral/clasif_catastral.module';
import { CategoriaModule } from './categoria/categoria.module';
import { UsersRolModule } from './users_rol/users_rol.module';
import { VersionamientoModule } from './versionamiento/versionamiento.module';
import { EstadoRequerimientoModule } from './estado_requerimiento/estado_requerimiento.module';
import { IncidenteModule } from './incidente/incidente.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
      }),
    }),
    ZonaModule,
    UsuarioModule,
    EstadoAccIncModule,
    RolModule,
    SistemaModule,
    DependenciaModule,
    ClasifCatastralModule,
    CategoriaModule,
    UsersRolModule,
    VersionamientoModule,
    EstadoRequerimientoModule,
    IncidenteModule,
  ],
  controllers: [],
})
export class AppModule {}
