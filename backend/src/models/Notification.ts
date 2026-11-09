import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Post } from "./Post";
import { Comment } from "./Comment";

export type NotificationType = 'like' | 'comment' | 'follow' | 'repost'

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 20 })
    type: NotificationType

    // Quem recebe
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    recipient: User

    // Quem fez a ação
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    actor: User

    @ManyToOne(() => Post, { onDelete: 'CASCADE', nullable: true })
    post: Post | null

    @ManyToOne(() => Comment, { onDelete: 'CASCADE', nullable: true })
    comment: Comment | null

    @Column({ type: 'datetime', nullable: true })
    readAt: Date | null

    @CreateDateColumn()
    createdAt: Date
}
