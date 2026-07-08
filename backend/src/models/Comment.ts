import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post";
import { CommentLike } from "./CommentLike";

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, length: 500 })
    text: string

    @ManyToOne(() => Post, (p) => p.comments)
    post: Post

    @OneToMany(() => CommentLike, (cl) => cl.comment)
    likes: CommentLike[]
}