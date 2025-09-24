import { Column, Entity,PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Requerimiento } from "src/requerimiento/entities/requerimiento.entity";

@Entity()

export class Estado_requerimiento {

    @PrimaryGeneratedColumn()
    id_estado_requerimiento: number

    @Column({nullable: false, default: 'Sin nombre' })
    nombre_estado_requerimiento:string

    @Column({nullable: true})
    descrip_estado_requerimiento: string

    @OneToMany(() => Requerimiento, (requerimiento) => requerimiento.estadoRequerimiento)
  requerimientos: Requerimiento[];
}
