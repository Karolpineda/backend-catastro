import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Dependencia{
     @PrimaryGeneratedColumn("uuid")
    id_dependencia: number

    @Column({unique: true})
    nombre_dependencia:string

    @Column({nullable: true})
    descrip_dependencia: string

    @Column({unique: true})
    sigla_dependencia: string


}