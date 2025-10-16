import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TestVersion } from 'src/test-version/entities/test-version.entity';

@Entity('test_produccion')
export class TestProduccion {
    @PrimaryGeneratedColumn()
    id_test_produccion: number;

    @Column({ type: 'int', nullable: true})
    id_rol_usuario: number;

    @Column({ type: 'varchar', length: 100, nullable: true})
    etapa_implementation: string;

    @Column({ type: 'varchar', length: 455, nullable: true})
    respuesta_tics: string;

    @Column({ type: 'varchar', length: 455, nullable: true})
    descripcion: string;

    @Column({ type: 'varchar', length: 50, nullable: true})
    no_requerimiento: string;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

  @OneToMany(() => TestVersion, testVersion => testVersion.test_production)
  test_versions: TestVersion[];
}