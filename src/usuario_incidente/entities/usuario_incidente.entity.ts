// usuario-incidente.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Incidente } from '../../incidente/entities/incidente.entity';
import { Rol_Usuario } from '../../users_rol/entities/users_rol.entity';

@Entity('usuario_incidente')
export class UsuarioIncidente {
  @PrimaryGeneratedColumn()
  id_usuario_incidente: number;

  @ManyToOne(() => Incidente, (incidente) => incidente.usuariosIncidente, {
    onDelete: 'CASCADE',
    nullable: false // ESTO ES IMPORTANTE
  })
  @JoinColumn({ name: 'id_incidente' })
  incidente: Incidente;

  @ManyToOne(() => Rol_Usuario, (rolUsuario) => rolUsuario.usuariosIncidente, {
    nullable: false
  })
  @JoinColumn({ name: 'id_rol_usuario' })
  rolUsuario: Rol_Usuario;
}