import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('auth')
export class Auth {
    // id为主键并且自动递增
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;
}
