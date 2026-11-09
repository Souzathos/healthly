import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post";

// Guardada sem o # e em minúsculas, para #Treino e #treino serem a mesma
@Entity('hashtags')
export class Hashtag {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 50, unique: true })
    name: string

    @ManyToMany(() => Post, (p) => p.hashtags)
    posts: Post[]

    @CreateDateColumn()
    createdAt: Date
}
