
import { Entity, PrimaryGeneratedColumn, OneToOne, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Clasif_catastral } from 'src/clasif_catastral/clasif_catastral.entity';
import { UsuarioSirecq } from 'src/usuario_sirecq/entities/usuario_sirecq.entity';
import { SirecqExterno } from 'src/sirecq_externo/entities/sirecq_externo.entity';

// sirecq_interno.entity.ts
@Entity('sirecq_interno')
export class SirecqInterno {
  @PrimaryGeneratedColumn()
  id_sirecq_interno: number;

  @Column({ type: 'date', nullable: true })
  fecha_env_dmc: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  obsv_tecnica: string;

  // 🆕 FK hacia SirecqExterno
  @Column({ type: 'int', name: 'id_sirecq_externo', nullable: true, unique: true })
  id_sirecq_externo: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relación con Clasif_catastral
  @ManyToOne(() => Clasif_catastral, (clasifCatastral) => clasifCatastral.sirecqInternos, {
    nullable: true,
    onDelete: 'SET NULL'
  })
  @JoinColumn({ name: 'id_clasif_catastral' })
  clasifCatastral: Clasif_catastral | null;

  // Relación con UsuarioSirecq
  @OneToMany(() => UsuarioSirecq, (usuarioSirecq) => usuarioSirecq.sirecqInterno, {
    cascade: true
  })
  usuariosSirecq: UsuarioSirecq[];

  // ✅ SOLO AQUÍ: Relación One-to-One con SirecqExterno (con JoinColumn)
  @OneToOne(() => SirecqExterno, (sirecqExterno) => sirecqExterno.sirecqInterno, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'id_sirecq_externo' }) // La FK está en esta tabla
  sirecqExterno: SirecqExterno | null;
}