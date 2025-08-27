import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuario/usuario.entity';
import { Rol } from '../../rol/rol.entity';

@Entity()
export class Rol_Usuario {
  @PrimaryGeneratedColumn('uuid')
  id_rol_usuario: string;

  @ManyToOne(() => Usuario, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Rol, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_rol' })
  rol: Rol;
}
