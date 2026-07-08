import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post";
import { Like } from "./Like";
import { CommentLike } from "./CommentLike";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, length: 255 })
    name: string

    @Column({ nullable: false, unique: true })
    email: string

    @Column({ nullable: false, length: 255 })
    password: string

    @Column({ nullable: false, unique: true })
    cpf: string

    @OneToMany(() => Post, (p) => p.user)
    posts: Post[]

    @OneToMany(() => Like, (l) => l.user)
    likes: Like[]

    @OneToMany(() => CommentLike, (cl) => cl.user)
    commentLikes: CommentLike[]
}