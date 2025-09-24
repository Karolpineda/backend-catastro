import { Column, Entity,PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Requerimiento } from "src/requerimiento/entities/requerimiento.entity";

@Entity()
export class Categoria{
     @PrimaryGeneratedColumn()
    id_categoria: number

    @Column({nullable: true})
    nom_categoria:string

    @Column({nullable: true})
    siglas_categoria: string

    @OneToMany(() => Requerimiento, (requerimiento) => requerimiento.categoria)
  requerimientos: Requerimiento[];
}