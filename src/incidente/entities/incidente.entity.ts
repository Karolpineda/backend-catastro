import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Zona } from '../../zona/zona.entity'; 
import { Estado_acc_inc } from '../../estado_acc_inc/estado_acc_inc.entity'; 
import { UsuarioIncidente } from 'src/usuario_incidente/entities/usuario_incidente.entity';

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
  fechaingresoerror?: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descripcionerror?: string | null;

  @Column({ type: 'int', nullable: true, name: 'aniosirecq' })
  aniosirecq?: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  mensajeerror?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  no_incidente?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  tipologia?: string | null;

  @Column({ type: 'text', nullable: true })
  obs_incidente?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  fech_solucion?: Date | null;

  @Column({ type: 'bytea', nullable: true })
  error_img?: Buffer | null;

  // Timestamps automáticos
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

   @OneToMany(
    () => UsuarioIncidente, 
    usuarioIncidente => usuarioIncidente.incidente,
    { 
      cascade: true, // Esto permite eliminar en cascada
      onDelete: 'CASCADE' // Esto configura el DELETE CASCADE a nivel de BD
    }
  )
  usuariosIncidente: UsuarioIncidente[];

}
