import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class Zona {

    @PrimaryGeneratedColumn("uuid")

    id_zona: number

    @Column({unique: true})
    nombre_zona:string

    @Column({nullable: true})
    ubi_zona: string

}