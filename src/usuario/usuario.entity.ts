import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Rol_Usuario } from '../users_rol/entities/users_rol.entity'; // Asegúrate de tener esta entidad

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cedula_usuario: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apellidos_usuario: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre_usuario: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  correo_usuario: string;

  @Column({ type: 'text', nullable: true })
  contrasenia_usuario: string;

  // Relación con RolUsuario
  @OneToMany(() => Rol_Usuario, rolUsuario => rolUsuario.usuario)
  roles_usuario: Rol_Usuario[]; // ← Esta propiedad debe existir
}
