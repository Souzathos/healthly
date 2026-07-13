import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import { sanitizeUser } from "../utils/sanitizeUser";
import bcrypt from 'bcrypt'

export class AuthService {
    private repo = AppDataSource.getRepository(User)

    async register(data: any) {
        const exists = await this.repo.findOne({where: {email: data.email}})
        if(exists) throw new Error('E-mail já cadastrado')
        const cpfExists = await this.repo.findOne({where: {cpf: data.cpf}})
        if(cpfExists) throw new Error('CPF já cadastrado')

        const password = await bcrypt.hash(data.password, 10)
        const user = this.repo.create({...data, password: password})
        return this.repo.save(user)
    }

    async login(email: string, password: string) {
        const user = await this.repo.findOneBy({ email })
        if (!user) throw new Error('Credenciais inválidas')
        const validate = await bcrypt.compare(password, user.password)
        if (!validate) throw new Error('Credenciais inválidas')
    
        return sanitizeUser(user)
    }
}