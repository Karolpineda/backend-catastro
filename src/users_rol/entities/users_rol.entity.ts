import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../usuario/usuario.entity';
import { Rol } from '../../rol/rol.entity';
import { UsuarioIncidente } from 'src/usuario_incidente/entities/usuario_incidente.entity';
import { Accidente } from 'src/accidente/entities/accidente.entity'
import { UsuarioSirecq } from 'src/usuario_sirecq/entities/usuario_sirecq.entity';
import { Requerimiento } from 'src/requerimiento/entities/requerimiento.entity';
import { TestProduccion } from 'src/test_produccion/entities/test_produccion.entity';


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

  @OneToMany(() => UsuarioSirecq, (usuarioSirecq) => usuarioSirecq.rolUsuario)
  usuariosSirecq: UsuarioSirecq[];

  @OneToMany(() => Requerimiento, (requerimiento) => requerimiento.rolUsuario)
  requerimiento: Requerimiento[];

  @OneToMany(() => TestProduccion, (testProduccion) => testProduccion.rolUsuario)
  testProducciones: TestProduccion[];

}
