import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";
import { Like } from "./Like";
import { PostMedia } from "./PostMedia";
import { SavedPost } from "./SavedPost";
import { Hashtag } from "./Hashtag";
import type { Diet } from "../utils/diets";

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id: number
    
    @Column({ nullable: true, length: 1000 })
    description: string

    @OneToMany(() => PostMedia, (img) => img.post)
    images: PostMedia[]
    
    @ManyToOne(() => User, (u) => u.posts, { onDelete: 'CASCADE' })
    user: User

    @OneToMany(() => Comment, (c) => c.post)
    comments: Comment[]

    @OneToMany(() => Like, (l) => l.post)
    likes: Like[]

    @OneToMany(() => SavedPost, (s) => s.post)
    savedBy: SavedPost[]

    @Column({ type: 'varchar', length: 20, nullable: true })
    diet: Diet | null

    @ManyToMany(() => Hashtag, (h) => h.posts)
    @JoinTable({ name: 'post_hashtags' })
    hashtags: Hashtag[]

    @CreateDateColumn()
    createdAt: Date
}