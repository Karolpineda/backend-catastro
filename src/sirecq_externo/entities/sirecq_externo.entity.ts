// sirecq-externo.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Requerimiento } from 'src/requerimiento/entities/requerimiento.entity';
import { SirecqInterno } from 'src/sirecq_interno/entities/sirecq_interno.entity';
import { Dependencia } from 'src/dependencia/dependecia.entity';

@Entity('sirecq_externo')
export class SirecqExterno {
  @PrimaryGeneratedColumn()
  id_sirecq_externo: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tramitepr: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  seguimientoinst: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tramitecat: string;

  @Column({ type: 'text', nullable: true })
  observacionesgen: string;

  @Column({ type: 'int', name: 'id_requerimiento', nullable: true, unique: true })
  id_requerimiento: number;

  @CreateDateColumn({ name: 'createdAt' })
createdAt: Date;

@UpdateDateColumn({ name: 'updatedAt' })
updatedAt: Date;


  // Relación One-to-One con Requerimiento (inversa)
  @OneToOne(() => Requerimiento, (requerimiento) => requerimiento.sirecqExterno, {
    nullable: true,
    onDelete: 'CASCADE' // Si se elimina el requerimiento, se elimina SirecqExterno
  })
  @JoinColumn({ name: 'id_requerimiento' }) // La foreign key está aquí
  requerimiento: Requerimiento;

  // Relación One-to-One con SirecqInterno
  @OneToOne(() => SirecqInterno, (sirecqInterno) => sirecqInterno.sirecqExterno, {
    nullable: true,
  })
  sirecqInterno: SirecqInterno;

  // NUEVA: Relación Many-to-One con Dependencia
  @ManyToOne(() => Dependencia, (dependencia) => dependencia.sirecqExternos, {
    nullable: true,
    onDelete: 'SET NULL'
  })
  @JoinColumn({ name: 'id_dependencia' })
  dependencia: Dependencia | null;;
}