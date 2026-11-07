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
    {name: 'Carla Dias', email: 'carla@healthly.dev', cpf: '12345678909', handle: 'carla', goal: 'Comer melhor', bio: 'Receitas simples para a semana'}
]

const POSTS = [
    'Primeira semana de treino concluída! #treino',
    'Marmitas da semana prontas em uma hora #dieta',
    'Trocar o refrigerante por água já fez diferença #saude'
]

async function seed() {
    if(env.NODE_ENV === 'production') throw new Error('O seed não roda em produção')

    await AppDataSource.initialize()

    const repo = AppDataSource.getRepository(User)
    if(await repo.existsBy({email: USERS[0].email})) {
        console.log('Seed já aplicado')
        return
    }

    const auth = new AuthService()
    const users = []
    for(const data of USERS) {
        users.push(await auth.register({...data, password: PASSWORD}))
    }

    const postService = new PostService()
    const posts = []
    for(const [index, description] of POSTS.entries()) {
        posts.push(await postService.create({description}, users[index].id))
    }

    const follow = new FollowService()
    await follow.toggle(users[1].id, users[0].id)
    await follow.toggle(users[0].id, users[1].id)
    await follow.toggle(users[0].id, users[2].id)

    await new LikeService().togglePost(posts[0].id, users[1].id)
    await new CommentService().create('Mandou bem!', posts[0].id, users[2].id)

    console.log(`Seed aplicado. Entre com ${USERS[0].email} e a senha ${PASSWORD}`)
}

seed()
    .catch((error) => {
        console.error('Falha no seed:', error)
        process.exitCode = 1
    })
    .finally(() => AppDataSource.isInitialized && AppDataSource.destroy())
