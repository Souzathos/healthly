import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./User";

@Entity('follows')
@Unique(['follower', 'following'])
export class Follow {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (u) => u.following, {onDelete: 'CASCADE'})
    follower: User

    @ManyToOne(() => User, (u) => u.followers, {onDelete: 'CASCADE'})
    following: User

    @CreateDateColumn()
    createdAt: Date
}
