import { Column, Entity,PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Accidente } from 'src/accidente/entities/accidente.entity'

@Entity()

export class Zona {

    @PrimaryGeneratedColumn()

    id_zona: number

    @Column({unique: true, nullable: true })
    nombre_zona:string

    @Column({nullable: true})
    ubi_zona: string

    @OneToMany(() => Accidente, (accidente) => accidente.zona)
    accidentes: Accidente[];

}