import { Column, Entity,PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class Rol {

    @PrimaryGeneratedColumn()
  id_rol: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    default: 'Rol sin nombre' // Valor por defecto
  })
  nombre_rol: string;

  @Column({
    type: 'text',
    nullable: false,
    default: 'Sin descripción' // Valor por defecto
  })
  descrip_rol: string;

}