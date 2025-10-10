// usuario-sirecq.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Rol_Usuario } from '../../users_rol/entities/users_rol.entity';
import { SirecqInterno } from '../../sirecq_interno/entities/sirecq_interno.entity';

@Entity('usuario_sirecq')
export class UsuarioSirecq {
  @PrimaryGeneratedColumn()
  id_usuario_sirecq: number;

  @ManyToOne(() => Rol_Usuario, (rolUsuario) => rolUsuario.usuariosSirecq)
  @JoinColumn({ name: 'id_rol_usuario' })
  rolUsuario: Rol_Usuario;

  @ManyToOne(() => SirecqInterno, (sirecqInterno) => sirecqInterno.usuariosSirecq, {
  onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'id_sirecq_interno' })
  sirecqInterno: SirecqInterno;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}