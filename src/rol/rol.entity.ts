import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class Rol {

    @PrimaryGeneratedColumn("uuid")
    id_rol: number

    @Column({unique: true})
    nombre_rol:string

    @Column({nullable: true})
    descrip_rol: string

}