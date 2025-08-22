import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class Usuario{
    
    @PrimaryGeneratedColumn("uuid")
    id_usuario: number

    @Column({unique: true})
    cedula_usuario: string

    @Column()
    apellidos_usuario: string

    @Column()
    nombre_usuario: string

    @Column ({unique: true})
    correo_usuario: string

    @Column()
    contraseña_usuario: string
}