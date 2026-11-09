import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./User";

// Conversa entre duas pessoas. userA guarda sempre o menor id, para o par ser único.
@Entity('conversations')
@Unique(['userA', 'userB'])
export class Conversation {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    userA: User

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    userB: User

    // Ordena a lista de conversas pela mais recente
    @Column({ type: 'datetime', precision: 6, nullable: true })
    lastMessageAt: Date | null

    @CreateDateColumn()
    createdAt: Date
}
