import supertest from "supertest";
import app from "../src/app";
import { AppDataSource } from "../src/config/data-source";
import { AuthService } from "../src/services/AuthService";
import { generateToken } from "../src/utils/jwt";

export const api = () => supertest(app)

export const PASSWORD = 'senha123'
export const PNG = Buffer.from('89504e470d0a1a0a', 'hex')

let sequence = 0

// CPF de 11 números diferente a cada chamada
export function validCpf() {
    sequence += 1
    return String(10000000000 + sequence)
}

export async function startDb() {
    // Confere a conexão real: os testes apagam todas as tabelas
    if(!String(AppDataSource.options.database).endsWith('_test')) {
        throw new Error('Os testes só rodam em bancos com nome terminado em _test')
    }

    if(!AppDataSource.isInitialized) await AppDataSource.initialize()
}

export async function clearDb() {
    const tables = AppDataSource.entityMetadatas.map(entity => entity.tableName)

    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0')
    for(const table of tables) {
        await AppDataSource.query(`TRUNCATE TABLE \`${table}\``)
    }
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1')
}

export async function stopDb() {
    await AppDataSource.destroy()
}

// Cria direto pelo service para não consumir o limite de cadastros da rota
export async function createUser(name = 'Pessoa Teste') {
    sequence += 1
    const email = `user${sequence}@test.com`
    const user = await new AuthService().register({name, email, password: PASSWORD, cpf: validCpf()})
    const token = generateToken({id: user.id, email})

    return {id: user.id as number, email, auth: `Bearer ${token}`}
}

export async function createPost(auth: string, description = 'post') {
    const res = await api().post('/post/create').set('Authorization', auth).field('description', description)
    return res.body.id as number
}
