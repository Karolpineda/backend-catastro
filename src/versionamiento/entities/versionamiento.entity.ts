import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Versionamiento {

     @PrimaryGeneratedColumn("uuid")
    id_version: number

    @Column({ unique: true})
    oficioenviodmi:string

    @Column({type:'date', nullable: true})
    fechaenvioreq: Date

     @Column({unique: true})
    ofi_desp_pt:string

    @Column({type:'date', nullable: true})
    fech_desp_pt: Date

    @Column({nullable: true})
    num_version: number
    
    @Column({nullable: true})
    observacion: string 

}
