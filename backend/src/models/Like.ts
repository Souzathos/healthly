import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity('likes')
@Unique(['user', 'post'])
export class Like {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (u) => u.likes)
    user: User

    @ManyToOne(() => Post, (p) => p.likes, {onDelete: 'CASCADE'})
    post: Post

    @CreateDateColumn()
    createdAt: Date
}