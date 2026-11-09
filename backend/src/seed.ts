import { env } from "./config/env";
import { AppDataSource } from "./config/data-source";
import { User } from "./models/User";
import { AuthService } from "./services/AuthService";
import { CommentService } from "./services/CommentService";
import { FollowService } from "./services/FollowService";
import { LikeService } from "./services/LikeService";
import { PostService } from "./services/PostService";

const PASSWORD = 'senha123'

const USERS = [
    {name: 'Ana Souza', email: 'ana@healthly.dev', cpf: '52998224725', handle: 'ana', goal: 'Ganhar músculo', bio: 'Treino de força e comida de verdade'},
    {name: 'Bruno Lima', email: 'bruno@healthly.dev', cpf: '11144477735', handle: 'bruno', goal: 'Perder peso', bio: 'Um dia de cada vez'},
    {name: 'Carla Dias', email: 'carla@healthly.dev', cpf: '12345678909', handle: 'carla', goal: 'Comer melhor', bio: 'Nutricionista. Receitas simples para a semana'}
]

// Aprova os pedidos de verificação de profissionais
const ADMIN = {name: 'Admin Healthly', email: 'admin@healthly.dev', cpf: '98765432100', handle: 'admin'}

const POSTS: {description: string, diet?: 'high_protein' | 'low_carb'}[] = [
    {description: 'Primeira semana de treino concluída! #treino'},
    {description: 'Marmitas da semana prontas em uma hora #dieta #marmita', diet: 'high_protein'},
    {description: 'Trocar o refrigerante por água já fez diferença #saude #dieta', diet: 'low_carb'}
]

async function seed() {
    if(env.NODE_ENV === 'production') throw new Error('O seed não roda em produção')

    await AppDataSource.initialize()

    const repo = AppDataSource.getRepository(User)
    const auth = new AuthService()

    // Bancos que receberam o seed antes da verificação profissional ganham só o admin e o selo
    if(await repo.existsBy({email: USERS[0].email})) {
        if(!await repo.existsBy({email: ADMIN.email})) {
            const admin = await auth.register({...ADMIN, password: PASSWORD})
            await repo.update({id: admin.id}, {role: 'admin'})
            await repo.update({email: USERS[2].email}, {isVerified: true, professionalType: 'nutritionist'})
            console.log(`Admin criado: ${ADMIN.email} / ${PASSWORD}`)
        } else {
            console.log('Seed já aplicado')
        }
        return
    }

    const users = []
    for(const data of USERS) {
        users.push(await auth.register({...data, password: PASSWORD}))
    }

    const admin = await auth.register({...ADMIN, password: PASSWORD})
    await repo.update({id: admin.id}, {role: 'admin'})

    // Carla já aparece como nutricionista verificada na demonstração
    await repo.update({id: users[2].id}, {isVerified: true, professionalType: 'nutritionist'})

    const postService = new PostService()
    const posts = []
    for(const [index, data] of POSTS.entries()) {
        posts.push(await postService.create(data, users[index].id))
    }

    const follow = new FollowService()
    await follow.toggle(users[1].id, users[0].id)
    await follow.toggle(users[0].id, users[1].id)
    await follow.toggle(users[0].id, users[2].id)

    await new LikeService().togglePost(posts[0].id, users[1].id)
    await new CommentService().create('Mandou bem!', posts[0].id, users[2].id)

    console.log(`Seed aplicado. Entre com ${USERS[0].email} (ou ${ADMIN.email}, admin) e a senha ${PASSWORD}`)
}

seed()
    .catch((error) => {
        console.error('Falha no seed:', error)
        process.exitCode = 1
    })
    .finally(() => AppDataSource.isInitialized && AppDataSource.destroy())
