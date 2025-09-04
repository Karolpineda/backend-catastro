import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Dependencia{
     @PrimaryGeneratedColumn()
    id_dependencia: number

    @Column({nullable: false, default: ''})
    nombre_dependencia:string

    @Column({nullable: true})
    descrip_dependencia: string

    @Column({nullable: false, default: ''})
    sigla_dependencia: string


}