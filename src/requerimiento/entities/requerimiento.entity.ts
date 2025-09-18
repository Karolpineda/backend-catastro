import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, Column } from 'typeorm';
import { Estado_requerimiento} from 'src/estado_requerimiento/entities/estado_requerimiento.entity';
import { Rol_Usuario } from 'src/users_rol/entities/users_rol.entity';
import { Categoria} from 'src/categoria/categoria.entity';
import { Sistema } from 'src/sistema/sistema.entity';

@Entity('requerimiento')
export class Requerimiento {
  @PrimaryGeneratedColumn()
  id_requerimiento: number;

  @ManyToOne(() => Estado_requerimiento)
  @JoinColumn({ name: 'id_estado_requerimiento' })
  id_estado_requerimiento: Estado_requerimiento;

  @ManyToOne(() => Rol_Usuario)
  @JoinColumn({ name: 'id_rol_usuario' })
  id_rol_usuario: Rol_Usuario;

  @ManyToOne(() => Categoria)
  @JoinColumn({ name: 'id_categoria' })
  id_categoria: Categoria;

  @ManyToOne(() => Sistema)
  @JoinColumn({ name: 'id_sistema' })
  id_sistema: Sistema;

  @Column({ unique: true })
  no_requerimiento: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @Column({ nullable: true })
  documento: string;

  @Column({ nullable: true })
  tema: string;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  fase: string;

  @Column({ nullable: true })
  prioridad: string;

   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;


//   @OneToOne(() => SirecqExterno, sirecqExterno => sirecqExterno.requerimiento)
//   sirecq_externo: SirecqExterno;
}