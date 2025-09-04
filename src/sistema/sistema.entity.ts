import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Sistema {

    @PrimaryGeneratedColumn()
    id_sistema: number

    @Column({nullable: true, default: '' })
    nom_sistema: string

    @Column({nullable: false, default:''})
    siglas_sistema: string

    @Column({nullable: true})
    descrip_sistema: string
}