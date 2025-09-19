
import { Entity, PrimaryGeneratedColumn, OneToOne, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Clasif_catastral } from 'src/clasif_catastral/clasif_catastral.entity';
import { UsuarioSirecq } from 'src/usuario_sirecq/entities/usuario_sirecq.entity';
import { SirecqExterno } from 'src/sirecq_externo/entities/sirecq_externo.entity';

@Entity('sirecq_interno')
export class SirecqInterno {
  @PrimaryGeneratedColumn()
  id_sirecq_interno: number;

  @Column({ type: 'date', nullable: true })
  fecha_env_dmc: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  obsv_tecnica: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Clasif_catastral, (clasifCatastral) => clasifCatastral.sirecqInternos)
  @JoinColumn({ name: 'id_clasif_catastral' })
  clasifCatastral: Clasif_catastral;

  @OneToMany(() => UsuarioSirecq, (usuarioSirecq) => usuarioSirecq.sirecqInterno)
  usuariosSirecq: UsuarioSirecq[];

  @OneToOne(() => SirecqExterno, (sirecqExterno) => sirecqExterno.sirecqInterno)
  @JoinColumn({ name: 'id_sirecq_externo' })
  sirecqExterno: SirecqExterno;
}