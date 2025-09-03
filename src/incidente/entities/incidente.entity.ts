import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Zona } from '../../zona/zona.entity'; 
import { Estado_acc_inc } from '../../estado_acc_inc/estado_acc_inc.entity'; 


@Entity() 
export class Incidente {
  @PrimaryGeneratedColumn()
  id_incidente: number;

  // Relación ManyToOne con Zona
  @ManyToOne(() => Zona, { eager: true })
  @JoinColumn({ name: 'id_zona' })
  zona: Zona;

  // Relación ManyToOne con EstadoAccInc
  @ManyToOne(() => Estado_acc_inc, { eager: true, nullable: true }) // ✅ nullable: true
  @JoinColumn({ name: 'id_estado_acc_inc' })
  estado_acc_inc: Estado_acc_inc;

  @Column({ type: 'timestamp', nullable: true })
  fechaingresoerror: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descripcionerror: string;

  @Column({ type: 'int', nullable: true })
  añosirecq: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  mensajeerror: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  no_incidente: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  tipologia: string;

  @Column({ type: 'text', nullable: true })
  obs_incidente: string;

  @Column({ type: 'timestamp', nullable: true })
  fech_solucion: Date;

  @Column({ type: 'bytea', nullable: true })
  error_img: Buffer

  // Timestamps automáticos
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
