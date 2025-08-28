import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class Estado_requerimiento {

    @PrimaryGeneratedColumn("uuid")
    id_estado_requerimiento: number

    @Column({unique: true})
    nombre_estado_requerimiento:string

    @Column({nullable: true})
    descrip_estado_requerimiento: string
}
