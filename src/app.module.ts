import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ZonaModule } from './zona/zona.module';
import { UsuarioModule } from './usuario/usuario.module';
import { EstadoAccIncModule } from './estado_acc_inc/estado_acc_inc.module';
import { RolModule } from './rol/rol.module';
import { SistemaModule } from './sistema/sistema.module';
import { DependenciaModule } from './dependencia/dependencia.module';
import { ClasifCatastralModule } from './clasif_catastral/clasif_catastral.module';
import { CategoriaModule } from './categoria/categoria.module';
import { UsersRolModule } from './users_rol/users_rol.module';
import { VersionamientoModule } from './versionamiento/versionamiento.module';
import { EstadoRequerimientoModule } from './estado_requerimiento/estado_requerimiento.module';
import { IncidenteModule } from './incidente/incidente.module';
import { UsuarioIncidenteModule } from './usuario_incidente/usuario_incidente.module';
import { AccidenteModule } from './accidente/accidente.module';
import { RequerimientoModule } from './requerimiento/requerimiento.module';
import { UsuarioSirecqModule } from './usuario_sirecq/usuario_sirecq.module';
import { SirecqInternoModule } from './sirecq_interno/sirecq_interno.module';
import { SirecqExternoModule } from './sirecq_externo/sirecq_externo.module';
import { RequerimientoVersionModule } from './requerimiento-version/requerimiento-version.module';
import { TestVersionModule } from './test-version/test-version.module';
import { TestProduccionModule } from './test_produccion/test_produccion.module';

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
    UsuarioIncidenteModule,
    AccidenteModule,
    RequerimientoModule,
    UsuarioSirecqModule,
    SirecqInternoModule,
    SirecqExternoModule,
    RequerimientoVersionModule,
    TestVersionModule,
    TestProduccionModule,
  ],
  controllers: [],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    // Solo ejecutar en desarrollo, comentar o usar variable de entorno para producción
    if (process.env.SYNC_SEQUENCES_ON_START === 'true') {
      await this.syncSequences();
    }
  }

  private async syncSequences() {
    try {
      console.log('🔄 Sincronizando secuencias de PostgreSQL...');
      
      const query = `
        DO $$
        DECLARE
          r RECORD;
          max_val BIGINT;
          seq_name TEXT;
        BEGIN
          FOR r IN 
            SELECT 
              table_name,
              column_name,
              pg_get_serial_sequence(quote_ident(table_schema) || '.' || quote_ident(table_name), column_name) as sequence_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND column_default LIKE 'nextval%'
          LOOP
            IF r.sequence_name IS NOT NULL THEN
              EXECUTE format('SELECT COALESCE(MAX(%I), 0) FROM %I', r.column_name, r.table_name) INTO max_val;
              
              IF max_val > 0 THEN
                EXECUTE format('SELECT setval(%L, %s, true)', r.sequence_name, max_val);
                RAISE NOTICE 'Secuencia % ajustada a %', r.sequence_name, max_val;
              END IF;
            END IF;
          END LOOP;
        END $$;
      `;

      await this.dataSource.query(query);
      console.log('✅ Secuencias sincronizadas correctamente');
    } catch (error) {
      console.error('❌ Error al sincronizar secuencias:', error.message);
    }
  }
}