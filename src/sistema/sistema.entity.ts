import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Sistema {

    @PrimaryGeneratedColumn("uuid")
    id_sistema: number

    @Column({unique: true})
    nom_sistema: string

    @Column({unique: true})
    siglas_sistema: string

    @Column({nullable: true})
    descrip_sistema: string
}