import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Categoria{
     @PrimaryGeneratedColumn("uuid")
    id_categoria: number

    @Column({nullable: true})
    nom_categoria:string

    @Column({unique: true})
    siglas_categoria: string
}