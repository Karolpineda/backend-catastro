import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Rol_Usuario } from '../users_rol/entities/users_rol.entity'; // Asegúrate de tener esta entidad

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ type: 'varchar', length: 20 })
  cedula_usuario: string;

  @Column({ type: 'varchar', length: 100 })
  apellidos_usuario: string;

  @Column({ type: 'varchar', length: 100 })
  nombre_usuario: string;

  @Column({ type: 'varchar', length: 100 })
  correo_usuario: string;

  @Column({ type: 'text' })
  contrasenia_usuario: string;

  // Relación con RolUsuario
  @OneToMany(() => Rol_Usuario, rolUsuario => rolUsuario.usuario)
  roles_usuario: Rol_Usuario[]; // ← Esta propiedad debe existir
}