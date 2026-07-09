import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";

@Entity('comment_likes')
@Unique(['user', 'comment'])
export class CommentLike {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (u) => u.commentLikes)
    user: User

    @ManyToOne(() => Comment, (c) => c.likes, {onDelete: 'CASCADE'})
    comment: Comment

    @CreateDateColumn()
    createdAt: Date
}