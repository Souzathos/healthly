import { User } from "../models/User";

// Dados visíveis para qualquer pessoa: sem credenciais nem dados pessoais
export function sanitizeUser(user: User) {
    const { password, cpf, email, ...safeUser } = user
    return safeUser
}

// Dados da própria conta: usar só em respostas para o usuário autenticado
export function sanitizeOwnUser(user: User) {
    const { password, cpf, ...safeUser } = user
    return safeUser
}
