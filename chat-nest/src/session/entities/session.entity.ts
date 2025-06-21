import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('session')
export class Session {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    user: string
 
    @Column('longtext')
    chat: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    create_time: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    update_time: Date;
}
