// accidente.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Estado_acc_inc } from 'src/estado_acc_inc/estado_acc_inc.entity';
import { Zona } from 'src/zona/zona.entity';
import { Rol_Usuario } from 'src/users_rol/entities/users_rol.entity';

@Entity('accidente')
export class Accidente {
  @PrimaryGeneratedColumn()
  id_accidente: number;

  @Column({ type: 'varchar', length: 1, nullable: true })
  tramite_accidente: string;

  @Column({ type: 'date', nullable: true })
  fech_ingr_tramite: Date;

  @Column({ type: 'boolean', default: false })
  inspeccion: boolean;

  @Column({ type: 'varchar', nullable: true })
  predio: string;

  @Column({ type: 'varchar', nullable: true })
  clave_catastral: string;

  @Column({ type: 'varchar', nullable: true })
  documento: string;

  @Column({ type: 'varchar', nullable: true })
  cod_consulta: string;

  @Column({ type: 'varchar', nullable: true })
  oficio_memorando_mail: string;

  @Column({ type: 'date', nullable: true })
  fecha_asignacion: Date;

  @Column({ type: 'date', nullable: true })
  fecha_estado: Date;

  @Column({ type: 'varchar', nullable: true })
  control_calidad: string;

  @Column({ type: 'varchar', nullable: true })
  numero_interno: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'int', nullable: true })
  tipologia: number;

  @Column({ type: 'varchar', nullable: true })
  nom_propietario: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Estado_acc_inc, (estadoAccInc) => estadoAccInc.accidentes)
  @JoinColumn({ name: 'id_estado_acc_inc' })
  estadoAccInc: Estado_acc_inc;

  @ManyToOne(() => Zona, (zona) => zona.accidentes)
  @JoinColumn({ name: 'id_zona' })
  zona: Zona;

  @ManyToOne(() => Rol_Usuario, (rolUsuario) => rolUsuario.accidentes)
  @JoinColumn({ name: 'id_rol_usuario' })
  rolUsuario: Rol_Usuario;
}