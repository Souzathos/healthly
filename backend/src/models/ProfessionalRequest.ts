import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProfessionalType, User } from "./User";

export type RequestStatus = 'pending' | 'approved' | 'rejected'

// Pedido de selo de verificado, com a foto do registro profissional
@Entity('professional_requests')
export class ProfessionalRequest {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User

    @Column({ type: 'varchar', length: 30 })
    type: ProfessionalType

    // Número do CRN ou CREF
    @Column({ length: 30 })
    registryNumber: string

    @Column({ type: 'longblob', select: false })
    document: Buffer

    @Column({ length: 100 })
    documentMimeType: string

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    status: RequestStatus

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    reviewedBy: User | null

    @Column({ type: 'datetime', precision: 6, nullable: true })
    reviewedAt: Date | null

    @CreateDateColumn()
    createdAt: Date
}
