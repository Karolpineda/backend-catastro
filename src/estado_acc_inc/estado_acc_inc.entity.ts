import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class Estado_acc_inc {

    @PrimaryGeneratedColumn()
    id_estado_acc_inc: number

    @Column({nullable: true, default: '' })
    nombre_estado_acc_inc:string

    @Column({nullable: true})
    descrip_estado_acc_inc: string

}