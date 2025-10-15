import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TestVersion } from 'src/test-version/entities/test-version.entity';

@Entity('test_produccion')
export class TestProduccion {
    @PrimaryGeneratedColumn()
    id_test_produccion: number;

    @Column()
    id_rol_usuario: number;

    @Column('varchar')
    etapa_implementation: string;

    @Column('varchar')
    respuesta_tics: string;

    @Column('varchar')
    descripcion: string;

    @Column('varchar')
    no_requerimiento: string;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

  @OneToMany(() => TestVersion, testVersion => testVersion.test_production)
  test_versions: TestVersion[];
}