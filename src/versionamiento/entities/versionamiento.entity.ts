import { RequerimientoVersion } from "src/requerimiento-version/entities/requerimiento-version.entity";
import { Column, CreateDateColumn, Entity,OneToMany,PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Versionamiento {

     @PrimaryGeneratedColumn()
    id_version: number

    @Column({ nullable: true})
    oficioenviodmi:string

    @Column({ type: 'date', nullable: true })
    fechaenvioreq: Date | null;

     @Column({nullable: true})
    ofi_desp_pt:string

    @Column({ type: 'date', nullable: true })
    fech_desp_pt: Date | null;

    @Column({nullable: true})
    num_version: number

    @Column({ type: 'text', nullable: true })
    obs_version: string;
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => RequerimientoVersion, (reqVersion) => reqVersion.versionamiento)
    requerimientoVersiones: RequerimientoVersion[];
}
