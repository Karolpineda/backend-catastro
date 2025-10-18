import { RequerimientoVersion } from "src/requerimiento-version/entities/requerimiento-version.entity";
import { Column, CreateDateColumn, Entity,OneToMany,PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TestVersion } from "src/test-version/entities/test-version.entity";


@Entity()
export class Versionamiento {

     @PrimaryGeneratedColumn()
    id_version: number

    @Column({ type: 'varchar', nullable: true})
    oficioenviodmi:string | null

    @Column({ type: 'date', nullable: true })
    fechaenvioreq: Date | null;

     @Column({type: 'varchar', nullable: true})
    ofi_desp_pt:string | null

    @Column({ type: 'date', nullable: true })
    fech_desp_pt: Date | null;

    @Column({type: 'int', nullable: true})
    num_version: number

    @Column({ type: 'text', nullable: true })
    obs_version: string | null;
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => RequerimientoVersion, (reqVersion) => reqVersion.versionamiento)
    requerimientoVersiones: RequerimientoVersion[];

    @OneToMany(() => TestVersion, (testVersion) => testVersion.versionamiento)
    test_versions: TestVersion[];
}
