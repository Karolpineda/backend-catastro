import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../usuario/usuario.entity';
import { Rol } from '../../rol/rol.entity';
import { UsuarioIncidente } from 'src/usuario_incidente/entities/usuario_incidente.entity';
import { Accidente } from 'src/accidente/entities/accidente.entity'


@Entity()
export class Rol_Usuario {
  @PrimaryGeneratedColumn()
  id_rol_usuario: number;

  @ManyToOne(() => Usuario, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Rol, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_rol' })
  rol: Rol;

  @OneToMany(() => UsuarioIncidente, usuarioIncidente => usuarioIncidente.rolUsuario)
  usuariosIncidente: UsuarioIncidente[];

  @OneToMany(() => Accidente, (accidente) => accidente.rolUsuario)
  accidentes: Accidente[];
}
