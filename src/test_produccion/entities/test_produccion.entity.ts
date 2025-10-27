import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TestVersion } from 'src/test-version/entities/test-version.entity';
import { Rol_Usuario } from 'src/users_rol/entities/users_rol.entity';

@Entity('test_produccion')
export class TestProduccion {
    @PrimaryGeneratedColumn()
    id_test_produccion: number ; 

    @Column({ type: 'int', nullable: true})
    id_rol_usuario: number | null;

    @Column({ type: 'varchar', length: 100, nullable: true})
    etapa_implementation: string ;

    @Column({ type: 'varchar', length: 2000, nullable: true})
    respuesta_tics: string | null;

    @Column({ type: 'varchar', length: 2000, nullable: true})
    descripcion: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true})
    no_requerimiento: string;

    @Column({type: 'varchar', nullable: true})
    ofi_env_pt:string | null

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Rol_Usuario, (rolUsuario) => rolUsuario.testProducciones, {
        onDelete: 'SET NULL',
        nullable: true // ← AÑADE ESTO
    })
    @JoinColumn({ name: 'id_rol_usuario' })
    rolUsuario: Rol_Usuario | null;

    @OneToMany(() => TestVersion, testVersion => testVersion.test_produccion, {
        cascade: true, 
        onDelete: 'CASCADE' 
    })
    test_versions: TestVersion[];
}