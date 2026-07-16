import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post";
import { Like } from "./Like";
import { CommentLike } from "./CommentLike";
import { Comment } from "./Comment";
import { SavedPost } from "./SavedPost";
import { Follow } from "./Follow";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, length: 255 })
    name: string

    @Column({ nullable: false, unique: true, length: 255 })
    email: string

    @Column({ nullable: false, length: 255 })
    password: string

    @Column({ nullable: false, unique: true, length: 14 })
    cpf: string

    @Column({ nullable: true, unique: true, length: 50 })
    handle: string

    @Column({ nullable: true, length: 255 })
    bio: string

    @Column({ nullable: true, length: 100 })
    goal: string

    @OneToMany(() => Post, (p) => p.user)
    posts: Post[]

    @OneToMany(() => Like, (l) => l.user)
    likes: Like[]

    @OneToMany(() => CommentLike, (cl) => cl.user)
    commentLikes: CommentLike[]

    @OneToMany(() => Comment, (c) => c.user)
    comments: Comment[]

    @OneToMany(() => SavedPost, (s) => s.user)
    savedPosts: SavedPost[]

    @OneToMany(() => Follow, (f) => f.follower)
    following: Follow[]

    @OneToMany(() => Follow, (f) => f.following)
    followers: Follow[]
}
