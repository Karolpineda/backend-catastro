import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Clasif_catastral{
    @PrimaryGeneratedColumn("uuid")
    id_clasif_catastral: number

    @Column({unique: true})
    nombre_clasif_catastral:string

    @Column({nullable: true})
    descrip_clasif_catastral: string

    @Column({unique: true})
    sigla_clasif_catastral: string

}