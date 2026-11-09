import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { AppDataSource } from "../src/config/data-source";
import { api, clearDb, createPost, createUser, startDb, stopDb } from "./helpers";

const repost = (auth: string, postId: number) => api().post(`/post/${postId}/repost`).set('Authorization', auth)

describe('reposts', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    it('alterna o repost, conta e marca para quem repostou', async () => {
        const author = await createUser()
        const fan = await createUser()
        const postId = await createPost(author.auth)

        assert.equal((await repost(fan.auth, postId)).body.reposted, true)

        const seen = await api().get(`/post/${postId}`).set('Authorization', fan.auth)
        assert.equal(seen.body.repostsCount, 1)
        assert.equal(seen.body.repostedByMe, true)

        assert.equal((await repost(fan.auth, postId)).body.reposted, false)
        assert.equal((await api().get(`/post/${postId}`)).body.repostsCount, 0)
    })

    it('avisa o autor e retira o aviso ao desfazer', async () => {
        const author = await createUser()
        const fan = await createUser()
        const postId = await createPost(author.auth)
        const unread = async () => (await api().get('/notifications/unread-count').set('Authorization', author.auth)).body.count

        await repost(fan.auth, postId)
        const list = await api().get('/notifications').set('Authorization', author.auth)
        assert.equal(list.body[0].type, 'repost')

        await repost(fan.auth, postId)
        assert.equal(await unread(), 0)
    })

    it('leva o post repostado para o feed de quem segue quem repostou', async () => {
        const me = await createUser()
        const friend = await createUser()
        const stranger = await createUser()
        const postId = await createPost(stranger.auth)
        await api().post(`/follow/${friend.id}`).set('Authorization', me.auth)

        assert.deepEqual((await api().get('/post/feed').set('Authorization', me.auth)).body, [])

        await repost(friend.auth, postId)

        const feed = await api().get('/post/feed').set('Authorization', me.auth)
        assert.deepEqual(feed.body.map((p: any) => p.id), [postId])
    })
})

describe('para você por relevância', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    it('coloca post com interação acima de um mais novo sem interação', async () => {
        const author = await createUser()
        const fans = await Promise.all([createUser(), createUser(), createUser()])
        const popular = await createPost(author.auth, 'popular')
        const recente = await createPost(author.auth, 'recente')

        // O popular foi publicado há um dia
        await AppDataSource.query('UPDATE posts SET createdAt = NOW() - INTERVAL 1 DAY WHERE id = ?', [popular])
        for(const fan of fans) {
            await api().post(`/like/post/${popular}`).set('Authorization', fan.auth)
        }
        await api().post(`/comment/${popular}`).set('Authorization', fans[0].auth).send({text: 'top'})

        const res = await api().get('/post/explore').set('Authorization', fans[0].auth)
        assert.deepEqual(res.body.map((p: any) => p.id), [popular, recente])
    })

    it('sem interação, mostra os mais novos primeiro e pagina', async () => {
        const author = await createUser()
        const ids = []
        for(let i = 0; i < 3; i++) ids.push(await createPost(author.auth, `post ${i}`))

        const first = await api().get('/post/explore?limit=2').set('Authorization', author.auth)
        const second = await api().get('/post/explore?limit=2&page=2').set('Authorization', author.auth)

        assert.deepEqual(first.body.map((p: any) => p.id), [ids[2], ids[1]])
        assert.deepEqual(second.body.map((p: any) => p.id), [ids[0]])
    })
})
