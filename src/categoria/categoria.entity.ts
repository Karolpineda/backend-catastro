import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Categoria{
     @PrimaryGeneratedColumn()
    id_categoria: number

    @Column({nullable: true})
    nom_categoria:string

    @Column({nullable: true})
    siglas_categoria: string
}