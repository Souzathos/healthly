import { AppDataSource } from "../config/data-source";
import { CreateProfessionalRequestDTO } from "../dtos/professional";
import { BadRequestError, ConflictError, NotFoundError } from "../errors";
import { ProfessionalRequestMapper } from "../mappers/ProfessionalRequestMapper";
import { ProfessionalRequest } from "../models/ProfessionalRequest";
import { User } from "../models/User";

export class ProfessionalService {
    private repo = AppDataSource.getRepository(ProfessionalRequest)
    private userRepo = AppDataSource.getRepository(User)

    async create(userId: number, data: CreateProfessionalRequestDTO, file?: Express.Multer.File) {
        if(!file) throw new BadRequestError('Envie a foto do seu registro profissional')

        const user = await this.userRepo.findOneBy({id: userId})
        if(!user) throw new NotFoundError('Usuário não encontrado')
        if(user.isVerified) throw new ConflictError('Seu perfil já é verificado')

        const pending = await this.repo.existsBy({user: {id: userId}, status: 'pending'})
        if(pending) throw new ConflictError('Você já tem um pedido em análise')

        const saved = await this.repo.save(this.repo.create({
            user,
            type: data.type,
            registryNumber: data.registryNumber,
            document: file.buffer,
            documentMimeType: file.mimetype
        }))
        return ProfessionalRequestMapper.toResponse(saved)
    }

    // Pedido mais recente de quem está logado, ou null se nunca pediu
    async mine(userId: number) {
        const request = await this.repo.findOne({
            where: {user: {id: userId}},
            order: {createdAt: 'DESC', id: 'DESC'}
        })
        return request ? ProfessionalRequestMapper.toResponse(request) : null
    }

    async listPending() {
        // O documento fica fora das consultas comuns (select: false): aqui ele é pedido de propósito
        const requests = await this.repo.createQueryBuilder('request')
            .addSelect('request.document')
            .leftJoinAndSelect('request.user', 'user')
            .where('request.status = :status', {status: 'pending'})
            .orderBy('request.createdAt', 'ASC')
            .getMany()

        return requests.map(ProfessionalRequestMapper.toAdminResponse)
    }

    async review(requestId: number, adminId: number, approve: boolean) {
        const request = await this.repo.findOne({where: {id: requestId}, relations: {user: true}})
        if(!request) throw new NotFoundError('Pedido não encontrado')
        if(request.status !== 'pending') throw new ConflictError('Este pedido já foi analisado')

        await AppDataSource.transaction(async manager => {
            await manager.update(ProfessionalRequest, {id: requestId}, {
                status: approve ? 'approved' : 'rejected',
                reviewedBy: {id: adminId},
                reviewedAt: new Date()
            })
            if(approve) {
                await manager.update(User, {id: request.user.id}, {
                    isVerified: true,
                    professionalType: request.type
                })
            }
        })

        return {status: approve ? 'approved' : 'rejected'}
    }
}
