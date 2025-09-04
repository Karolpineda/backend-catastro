import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Clasif_catastral{
    @PrimaryGeneratedColumn()
    id_clasif_catastral: number

    @Column({ nullable: false, default: ''})
    nombre_clasif_catastral:string

    @Column({nullable: true})
    descrip_clasif_catastral: string

    @Column({nullable: true})
    sigla_clasif_catastral: string

}