import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import { RegisterInput } from "../schemas/authSchemas";
import { sanitizeOwnUser } from "../utils/sanitizeUser";
import bcrypt from 'bcrypt'
import { ConflictError, UnauthorizedError } from "../utils/errors";

export class AuthService {
    private repo = AppDataSource.getRepository(User)

    async register(data: RegisterInput) {
        const exists = await this.repo.findOne({where: {email: data.email}})
        if(exists) throw new ConflictError('E-mail já cadastrado')
        const cpfExists = await this.repo.findOne({where: {cpf: data.cpf}})
        if(cpfExists) throw new ConflictError('CPF já cadastrado')
        if(data.handle) {
            const handleExists = await this.repo.findOne({where: {handle: data.handle}})
            if(handleExists) throw new ConflictError('@usuário já está em uso')
        }

        const password = await bcrypt.hash(data.password, 10)
        const user = this.repo.create({...data, password: password})
        return this.repo.save(user)
    }

    async login(email: string, password: string) {
        const user = await this.repo.findOneBy({ email })
        if (!user) throw new UnauthorizedError('Credenciais inválidas')
        const validate = await bcrypt.compare(password, user.password)
        if (!validate) throw new UnauthorizedError('Credenciais inválidas')
    
        return sanitizeOwnUser(user)
    }
}