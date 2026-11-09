import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./Conversation";
import { User } from "./User";

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
    conversation: Conversation

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    sender: User

    @Column({ length: 1000 })
    text: string

    // Preenchido quando quem recebeu abre a conversa
    @Column({ type: 'datetime', precision: 6, nullable: true })
    readAt: Date | null

    @CreateDateColumn()
    createdAt: Date
}
