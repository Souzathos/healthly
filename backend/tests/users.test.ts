import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { api, clearDb, createPost, createUser, PASSWORD, startDb, stopDb } from "./helpers";

describe('usuários', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    it('não expõe e-mail nem CPF em respostas públicas', async () => {
        const user = await createUser()
        const other = await createUser()
        const postId = await createPost(user.auth)
        await api().post(`/follow/${user.id}`).set('Authorization', other.auth)
        await api().post(`/comment/${postId}`).set('Authorization', other.auth).send({text: 'oi'})

        const responses = await Promise.all([
            api().get(`/user/${user.id}`),
            api().get(`/post/${postId}`),
            api().get(`/comment/post/${postId}`),
            api().get(`/follow/${user.id}/followers`)
        ])

        for(const res of responses) {
            assert.equal(res.status, 200)
            assert.doesNotMatch(JSON.stringify(res.body), /"(email|cpf|password)"/)
        }
    })

    it('mostra o e-mail só para a própria conta', async () => {
        const user = await createUser()

        const res = await api().get('/user/me').set('Authorization', user.auth)

        assert.equal(res.body.email, user.email)
        assert.equal(res.body.cpf, undefined)
    })

    it('exige a senha atual para trocar a senha', async () => {
        const user = await createUser()
        const update = (body: object) => api().put('/user/update').set('Authorization', user.auth).send(body)

        assert.equal((await update({password: 'nova1234'})).status, 400)
        assert.equal((await update({password: 'nova1234', currentPassword: 'errada'})).status, 400)
        assert.equal((await update({password: 'nova1234', currentPassword: PASSWORD})).status, 200)

        const login = await api().post('/user/login').send({email: user.email, password: 'nova1234'})
        assert.equal(login.status, 200)
    })

    it('edita o perfil sem pedir senha', async () => {
        const user = await createUser()

        const res = await api().put('/user/update').set('Authorization', user.auth).send({bio: 'nova bio'})

        assert.equal(res.status, 200)
        assert.equal(res.body.bio, 'nova bio')
    })

    it('conta posts e seguidores no perfil', async () => {
        const user = await createUser()
        const other = await createUser()
        const postId = await createPost(user.auth)
        await createPost(user.auth)
        await api().post(`/follow/${user.id}`).set('Authorization', other.auth)
        await api().post(`/like/post/${postId}`).set('Authorization', other.auth)

        const res = await api().get(`/user/${user.id}`)

        assert.equal(res.body.postsCount, 2)
        assert.equal(res.body.followersCount, 1)
        assert.equal(res.body.posts.find((p: any) => p.id === postId).likesCount, 1)
    })
})
