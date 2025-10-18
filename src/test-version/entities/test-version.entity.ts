import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TestProduccion } from 'src/test_produccion/entities/test_produccion.entity';
import { Versionamiento } from 'src/versionamiento/entities/versionamiento.entity';

@Entity('test_version')
export class TestVersion {
  @PrimaryGeneratedColumn()
  id_test_version: number;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => TestProduccion, (testProduccion) => testProduccion.test_versions, {
        onDelete: 'CASCADE' 
    })
    @JoinColumn({ name: 'id_test_produccion' })
    test_produccion: TestProduccion;

    @ManyToOne(() => Versionamiento, (versionamiento) => versionamiento.test_versions, {
        onDelete: 'CASCADE' 
    })
    @JoinColumn({ name: 'id_version' })
    versionamiento: Versionamiento;
}
