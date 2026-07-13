import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity('saved_posts')
@Unique(['user', 'post'])
export class SavedPost {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (u) => u.savedPosts, {onDelete: 'CASCADE'})
    user: User

    @ManyToOne(() => Post, (p) => p.savedBy, {onDelete: 'CASCADE'})
    post: Post

    @CreateDateColumn()
    createdAt: Date
}
