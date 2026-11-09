import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

// Compartilhar um post com os próprios seguidores (RF15)
@Entity('reposts')
@Unique(['user', 'post'])
export class Repost {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User

    @ManyToOne(() => Post, { onDelete: 'CASCADE' })
    post: Post

    @CreateDateColumn()
    createdAt: Date
}
