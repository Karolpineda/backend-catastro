import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class Estado_requerimiento {

    @PrimaryGeneratedColumn()
    id_estado_requerimiento: number

    @Column({nullable: false, default: 'Sin nombre' })
    nombre_estado_requerimiento:string

    @Column({nullable: true})
    descrip_estado_requerimiento: string
}
