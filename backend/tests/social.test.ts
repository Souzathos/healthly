import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { AuthService } from "../src/services/AuthService";
import { generateToken } from "../src/utils/jwt";
import { api, clearDb, createPost, createUser, PASSWORD, PNG, startDb, stopDb, validCpf } from "./helpers";

const png = (name: string) => ({filename: name, contentType: 'image/png'})

async function namedUser(name: string, handle: string) {
    const email = `${handle}@test.com`
    const user = await new AuthService().register({name, email, handle, password: PASSWORD, cpf: validCpf()})
    return {id: user.id, auth: `Bearer ${generateToken({id: user.id, email})}`}
}

describe('busca e seguir', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    it('busca por nome e por @usuário, sem incluir quem busca', async () => {
        const me = await namedUser('Ana Souza', 'ana')
        await namedUser('Anabela Lima', 'bela')
        await namedUser('Bruno Dias', 'brunofit')

        const byName = await api().get('/user/search?q=ana').set('Authorization', me.auth)
        assert.deepEqual(byName.body.map((u: any) => u.handle), ['bela'])

        const byHandle = await api().get('/user/search?q=@brunof').set('Authorization', me.auth)
        assert.deepEqual(byHandle.body.map((u: any) => u.name), ['Bruno Dias'])
    })

    it('trata % e _ como texto na busca', async () => {
        await namedUser('Ana Souza', 'ana')

        const res = await api().get('/user/search?q=%25')

        assert.deepEqual(res.body, [])
    })

    it('recusa busca vazia', async () => {
        const res = await api().get('/user/search?q=%20')

        assert.equal(res.status, 400)
        assert.equal(res.body.message, 'Digite algo para buscar')
    })

    it('informa se já segue cada resultado e o perfil', async () => {
        const me = await namedUser('Ana Souza', 'ana')
        const bruno = await namedUser('Bruno Dias', 'bruno')
        await api().post(`/follow/${bruno.id}`).set('Authorization', me.auth)

        const search = await api().get('/user/search?q=bruno').set('Authorization', me.auth)
        assert.equal(search.body[0].isFollowing, true)
        assert.doesNotMatch(JSON.stringify(search.body), /email|cpf|password/)

        const profile = await api().get(`/user/${bruno.id}`).set('Authorization', me.auth)
        assert.equal(profile.body.isFollowing, true)

        const anonymous = await api().get(`/user/${bruno.id}`)
        assert.equal(anonymous.body.isFollowing, false)
    })
})

describe('feed para você', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    it('mostra posts de quem não sigo', async () => {
        const me = await createUser()
        const stranger = await createUser()
        const postId = await createPost(stranger.auth)

        const explore = await api().get('/post/explore').set('Authorization', me.auth)
        assert.deepEqual(explore.body.map((p: any) => p.id), [postId])

        const feed = await api().get('/post/feed').set('Authorization', me.auth)
        assert.deepEqual(feed.body, [])
    })
})

describe('criação e edição de posts', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    it('recusa post sem texto e sem imagem', async () => {
        const user = await createUser()

        const res = await api().post('/post/create').set('Authorization', user.auth).field('description', '   ')

        assert.equal(res.status, 400)
        assert.equal(res.body.message, 'O post precisa de texto ou imagem')
    })

    it('aceita post só com imagem e mantém a ordem de envio', async () => {
        const user = await createUser()

        const res = await api().post('/post/create').set('Authorization', user.auth)
            .attach('images', PNG, png('a.png'))
            .attach('images', PNG, png('b.png'))
            .attach('images', PNG, png('c.png'))

        assert.equal(res.status, 201)
        assert.deepEqual(res.body.images.map((i: any) => i.position), [0, 1, 2])
    })

    it('troca só as imagens sem apagar o texto', async () => {
        const user = await createUser()
        const created = await api().post('/post/create').set('Authorization', user.auth)
            .field('description', 'texto original')
            .attach('images', PNG, png('a.png'))

        const res = await api().put(`/post/update/${created.body.id}`).set('Authorization', user.auth)
            .attach('images', PNG, png('b.png'))
            .attach('images', PNG, png('c.png'))

        assert.equal(res.status, 200)
        assert.equal(res.body.description, 'texto original')
        assert.equal(res.body.images.length, 2)
        assert.ok(!res.body.images.some((i: any) => i.id === created.body.images[0].id))
    })

    it('edita só o texto sem apagar as imagens', async () => {
        const user = await createUser()
        const created = await api().post('/post/create').set('Authorization', user.auth)
            .field('description', 'antes')
            .attach('images', PNG, png('a.png'))

        const res = await api().put(`/post/update/${created.body.id}`).set('Authorization', user.auth)
            .field('description', 'depois')

        assert.equal(res.body.description, 'depois')
        assert.equal(res.body.images.length, 1)
    })

    it('recusa edição sem nada para mudar', async () => {
        const user = await createUser()
        const postId = await createPost(user.auth)

        const res = await api().put(`/post/update/${postId}`).set('Authorization', user.auth).send({})

        assert.equal(res.status, 400)
    })
})

describe('curtidas em comentários', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    it('informa se quem vê curtiu o comentário', async () => {
        const author = await createUser()
        const fan = await createUser()
        const postId = await createPost(author.auth)
        const comment = await api().post(`/comment/${postId}`).set('Authorization', author.auth).send({text: 'oi'})
        await api().post(`/like/comment/${comment.body.id}`).set('Authorization', fan.auth)

        const asFan = await api().get(`/comment/post/${postId}`).set('Authorization', fan.auth)
        assert.equal(asFan.body[0].likesCount, 1)
        assert.equal(asFan.body[0].likedByMe, true)

        const asAuthor = await api().get(`/comment/post/${postId}`).set('Authorization', author.auth)
        assert.equal(asAuthor.body[0].likedByMe, false)
    })
})
