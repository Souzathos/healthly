import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { AppDataSource } from "../src/config/data-source";
import { api, clearDb, createPost, createUser, PNG, startDb, stopDb } from "./helpers";

const png = {filename: 'a.png', contentType: 'image/png'}

describe('posts', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    const upload = (auth: string) => api().post('/post/create').set('Authorization', auth).field('description', 'oi')

    it('aceita imagem e serve com o tipo certo', async () => {
        const user = await createUser()
        const created = await upload(user.auth).attach('images', PNG, png)
        assert.equal(created.status, 201)
        assert.equal(created.body.images.length, 1)
        assert.equal(created.body.likesCount, 0)

        const post = await api().get(`/post/${created.body.id}`)
        const media = await api().get(`/post/media/${post.body.images[0].id}`)

        assert.equal(media.status, 200)
        assert.equal(media.headers['content-type'], 'image/png')
        assert.equal(media.headers['x-content-type-options'], 'nosniff')
        assert.equal(media.headers['cross-origin-resource-policy'], 'cross-origin')
    })

    it('recusa arquivos que não são imagem, SVG e excesso de imagens', async () => {
        const user = await createUser()
        const html = Buffer.from('<script>alert(1)</script>')

        const asHtml = await upload(user.auth).attach('images', html, {filename: 'a.html', contentType: 'text/html'})
        assert.equal(asHtml.status, 415)

        const asSvg = await upload(user.auth).attach('images', html, {filename: 'a.svg', contentType: 'image/svg+xml'})
        assert.equal(asSvg.status, 415)

        let request = upload(user.auth)
        for(let i = 0; i < 5; i++) request = request.attach('images', PNG, png)
        assert.equal((await request).status, 400)
    })

    it('recusa imagem acima de 5 MB', async () => {
        const user = await createUser()

        const res = await upload(user.auth).attach('images', Buffer.alloc(11 * 1024 * 1024), png)

        assert.equal(res.status, 413)
    })

    it('serve mídia antiga de tipo perigoso como download', async () => {
        const user = await createUser()
        const created = await upload(user.auth).attach('images', PNG, png)
        const post = await api().get(`/post/${created.body.id}`)
        const mediaId = post.body.images[0].id
        await AppDataSource.query(`UPDATE post_medias SET mimeType = 'text/html' WHERE id = ?`, [mediaId])

        const res = await api().get(`/post/media/${mediaId}`)

        assert.equal(res.headers['content-type'], 'application/octet-stream')
    })

    it('conta curtidas e comentários e marca o que é do visitante', async () => {
        const author = await createUser()
        const fan = await createUser()
        const postId = await createPost(author.auth)
        await api().post(`/like/post/${postId}`).set('Authorization', fan.auth)
        await api().post(`/saved/${postId}`).set('Authorization', fan.auth)
        await api().post(`/comment/${postId}`).set('Authorization', author.auth).send({text: 'um'})
        await api().post(`/comment/${postId}`).set('Authorization', fan.auth).send({text: 'dois'})

        const res = await api().get(`/post/${postId}`).set('Authorization', fan.auth)

        assert.equal(res.body.likesCount, 1)
        assert.equal(res.body.commentsCount, 2)
        assert.equal(res.body.likedByMe, true)
        assert.equal(res.body.savedByMe, true)

        const anonymous = await api().get(`/post/${postId}`)
        assert.equal(anonymous.body.likedByMe, false)
    })

    it('alterna curtida, salvo e seguir', async () => {
        const author = await createUser()
        const fan = await createUser()
        const postId = await createPost(author.auth)
        const toggle = (path: string) => api().post(path).set('Authorization', fan.auth)

        assert.equal((await toggle(`/like/post/${postId}`)).body.liked, true)
        assert.equal((await toggle(`/like/post/${postId}`)).body.liked, false)
        assert.equal((await toggle(`/saved/${postId}`)).body.saved, true)
        assert.equal((await toggle(`/saved/${postId}`)).body.saved, false)
        assert.equal((await toggle(`/follow/${author.id}`)).body.following, true)
        assert.equal((await toggle(`/follow/${author.id}`)).body.following, false)
    })

    it('mostra no feed só os próprios posts e os de quem segue', async () => {
        const me = await createUser()
        const followed = await createUser()
        const stranger = await createUser()
        const mine = await createPost(me.auth)
        const theirs = await createPost(followed.auth)
        await createPost(stranger.auth)
        await api().post(`/follow/${followed.id}`).set('Authorization', me.auth)

        const res = await api().get('/post/feed').set('Authorization', me.auth)

        assert.deepEqual(res.body.map((p: any) => p.id).sort(), [mine, theirs].sort())
    })

    it('pagina feed, curtidas, salvos, comentários e seguidores', async () => {
        const user = await createUser()
        const fan = await createUser()
        const ids = []
        for(let i = 0; i < 3; i++) ids.push(await createPost(user.auth))
        for(const id of ids) {
            await api().post(`/like/post/${id}`).set('Authorization', user.auth)
            await api().post(`/saved/${id}`).set('Authorization', user.auth)
            await api().post(`/comment/${ids[0]}`).set('Authorization', fan.auth).send({text: 'oi'})
        }
        await api().post(`/follow/${user.id}`).set('Authorization', fan.auth)

        const paths = ['/post/feed', '/post/liked', '/saved', `/post/user/${user.id}`, `/comment/post/${ids[0]}`]
        for(const path of paths) {
            const first = await api().get(`${path}?limit=2`).set('Authorization', user.auth)
            const second = await api().get(`${path}?limit=2&page=2`).set('Authorization', user.auth)

            assert.equal(first.status, 200, path)
            assert.equal(first.body.length, 2, path)
            assert.equal(second.body.length, 1, path)
            assert.ok(!first.body.some((a: any) => a.id === second.body[0].id), path)
        }

        const followers = await api().get(`/follow/${user.id}/followers?limit=1&page=2`)
        assert.deepEqual(followers.body, [])
    })

    it('só o dono edita ou apaga o post', async () => {
        const author = await createUser()
        const other = await createUser()
        const postId = await createPost(author.auth)

        const forbidden = await api().delete(`/post/delete/${postId}`).set('Authorization', other.auth)
        assert.equal(forbidden.status, 403)

        const deleted = await api().delete(`/post/delete/${postId}`).set('Authorization', author.auth)
        assert.equal(deleted.status, 200)

        const missing = await api().delete(`/post/delete/${postId}`).set('Authorization', author.auth)
        assert.equal(missing.status, 404)
    })

    it('só o autor apaga o comentário', async () => {
        const author = await createUser()
        const other = await createUser()
        const postId = await createPost(author.auth)
        const comment = await api().post(`/comment/${postId}`).set('Authorization', author.auth).send({text: 'oi'})

        const forbidden = await api().delete(`/comment/${comment.body.id}`).set('Authorization', other.auth)
        assert.equal(forbidden.status, 403)

        const deleted = await api().delete(`/comment/${comment.body.id}`).set('Authorization', author.auth)
        assert.equal(deleted.status, 200)
    })
})
