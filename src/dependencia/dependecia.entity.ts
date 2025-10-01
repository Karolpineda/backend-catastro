import { Column, CreateDateColumn, UpdateDateColumn, Entity,PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { SirecqExterno } from "src/sirecq_externo/entities/sirecq_externo.entity";

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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

  // Relación One-to-Many con SirecqExterno
  @OneToMany(() => SirecqExterno, (sirecqExterno) => sirecqExterno.dependencia)
  sirecqExternos: SirecqExterno[];
}
