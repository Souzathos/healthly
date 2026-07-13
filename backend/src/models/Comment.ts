import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";
import { CommentLike } from "./CommentLike";

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, length: 500 })
    text: string

    @ManyToOne(() => User, (u) => u.comments, {onDelete: 'CASCADE'})
    user: User

    @ManyToOne(() => Post, (p) => p.comments, {onDelete: 'CASCADE'})
    post: Post

    @OneToMany(() => CommentLike, (cl) => cl.comment)
    likes: CommentLike[]

    @CreateDateColumn()
    createdAt: Date
}
