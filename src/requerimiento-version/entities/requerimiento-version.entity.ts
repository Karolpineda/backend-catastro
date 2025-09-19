import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Requerimiento } from 'src/requerimiento/entities/requerimiento.entity';
import { Versionamiento } from 'src/versionamiento/entities/versionamiento.entity';

@Entity('requerimiento_version')
export class RequerimientoVersion {
  @PrimaryGeneratedColumn()
  id_req_version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Requerimiento, (requerimiento) => requerimiento.requerimientoVersiones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_requerimiento' })
  requerimiento: Requerimiento;

  @ManyToOne(() => Versionamiento, (versionamiento) => versionamiento.requerimientoVersiones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_version' })
  versionamiento: Versionamiento;
}