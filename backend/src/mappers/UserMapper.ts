import { User } from "../models/User";

// Lista o que pode sair: uma coluna nova no User só aparece na API se for incluída aqui
export class UserMapper {
    static toPublic(user: User) {
        return {
            id: user.id,
            name: user.name,
            handle: user.handle,
            bio: user.bio,
            goal: user.goal,
            isVerified: user.isVerified ?? false,
            professionalType: user.professionalType ?? null
        }
    }

    // Só para respostas ao próprio usuário autenticado
    static toPrivate(user: User) {
        return {
            ...UserMapper.toPublic(user),
            email: user.email,
            role: user.role
        }
    }

    // Usuário em listas onde quem está vendo pode seguir direto, como a busca
    static toListItem(user: User, isFollowing: boolean) {
        return {
            ...UserMapper.toPublic(user),
            isFollowing
        }
    }
}

export type PublicUser = ReturnType<typeof UserMapper.toPublic>
