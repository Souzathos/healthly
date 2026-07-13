import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";
import { Like } from "./Like";
import { PostMedia } from "./PostMedia";
import { SavedPost } from "./SavedPost";

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id: number
    
    @Column({ nullable: true, length: 1000 })
    description: string

    @OneToMany(() => PostMedia, (img) => img.post)
    images: PostMedia[]
    
    @ManyToOne(() => User, (u) => u.posts)
    user: User

    @OneToMany(() => Comment, (c) => c.post)
    comments: Comment[]

    @OneToMany(() => Like, (l) => l.post)
    likes: Like[]

    @OneToMany(() => SavedPost, (s) => s.post)
    savedBy: SavedPost[]

    @CreateDateColumn()
    createdAt: Date
}