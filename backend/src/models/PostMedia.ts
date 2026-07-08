import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post";

@Entity('post_medias')
export class PostMedia {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'longblob' })
    data: Buffer

    @Column({ nullable: false })
    position: number

    @Column({ nullable: false, length: 100 })
    mimeType: string

    @ManyToOne(() => Post, (p) => p.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post: Post

    @CreateDateColumn()
    createdAt: Date
}