import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn, OneToMany, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Estado_requerimiento} from 'src/estado_requerimiento/entities/estado_requerimiento.entity';
import { Rol_Usuario } from 'src/users_rol/entities/users_rol.entity';
import { Categoria} from 'src/categoria/categoria.entity';
import { Sistema } from 'src/sistema/sistema.entity';
import { RequerimientoVersion } from 'src/requerimiento-version/entities/requerimiento-version.entity';
import { SirecqExterno } from 'src/sirecq_externo/entities/sirecq_externo.entity';

@Entity('requerimiento')
export class Requerimiento {
  @PrimaryGeneratedColumn()
  id_requerimiento: number;

  @Column({ type: 'varchar', length: 100, name: 'no_requerimiento', nullable: true  })
  no_requerimiento: string;

 @Column({ type: 'date', default: () => 'CURRENT_DATE', nullable: true  })
  fecha_registro: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'documento' })
  documento: string;

  @Column({ type: 'varchar', length: 255, name: 'tema', nullable: true  })
  tema: string;

  @Column({ type: 'text', name: 'descripcion' })
  descripcion: string;

  @Column({ type: 'varchar', length: 100, name: 'fase', nullable: true })
  fase: string;

  @Column({ type: 'int', name: 'prioridad', nullable: true })
  prioridad: number;

  // Columnas para las claves foráneas
  @Column({ type: 'int', name: 'id_estado_requerimiento', nullable: true  })
  id_estado_requerimiento: number;

  @Column({ type: 'int', name: 'id_categoria',nullable: true  })
  id_categoria: number;

  @Column({ type: 'int', name: 'id_sistema', nullable: true  })
  id_sistema: number;

  @Column({ type: 'int', name: 'id_rol_usuario', nullable: true  })
  id_rol_usuario: number;

  // Relaciones
  @ManyToOne(() => Estado_requerimiento, (estado) => estado.requerimientos)
  @JoinColumn({ name: 'id_estado_requerimiento' })
  estadoRequerimiento: Estado_requerimiento;

  @ManyToOne(() => Categoria, (categoria) => categoria.requerimientos)
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;

  @ManyToOne(() => Sistema, (sistema) => sistema.requerimientos)
  @JoinColumn({ name: 'id_sistema' })
  sistema: Sistema;

  @ManyToOne(() => Rol_Usuario, (rolUsuario) => rolUsuario.requerimiento)
  @JoinColumn({ name: 'id_rol_usuario' })
  rolUsuario: Rol_Usuario;

  @OneToMany(() => RequerimientoVersion, (reqVersion) => reqVersion.requerimiento)
    requerimientoVersiones: RequerimientoVersion[];


  @OneToOne(() => SirecqExterno, (sirecqExterno) => sirecqExterno.requerimiento, {
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL'
  })
  @JoinColumn({ name: 'id_sirecq_externo' })
  sirecqExterno: SirecqExterno;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;



}