import { User } from "../models/User";

// Remove campos sensíveis do usuário antes de enviar na resposta
export function sanitizeUser(user: User) {
    const { password, cpf, ...safeUser } = user
    return safeUser
}
