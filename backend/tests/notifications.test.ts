import assert from "node:assert/strict";
import { createServer, Server } from "node:http";
import { AddressInfo } from "node:net";
import { after, before, beforeEach, describe, it } from "node:test";
import { io as connect, Socket } from "socket.io-client";
import app from "../src/app";
import { closeSocket, initSocket } from "../src/realtime/socket";
import { api, clearDb, createPost, createUser, startDb, stopDb } from "./helpers";

const list = (auth: string) => api().get('/notifications').set('Authorization', auth)
const unread = async (auth: string) =>
    (await api().get('/notifications/unread-count').set('Authorization', auth)).body.count

describe('notificações', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    it('avisa o autor sobre curtida, comentário e novo seguidor', async () => {
        const author = await createUser('Autora Teste')
        const fan = await createUser('Fã Teste')
        const postId = await createPost(author.auth)

        await api().post(`/like/post/${postId}`).set('Authorization', fan.auth)
        await api().post(`/comment/${postId}`).set('Authorization', fan.auth).send({text: 'boa!'})
        await api().post(`/follow/${author.id}`).set('Authorization', fan.auth)

        const res = await list(author.auth)
        assert.deepEqual(res.body.map((n: any) => n.type), ['follow', 'comment', 'like'])
        assert.equal(res.body[1].comment.text, 'boa!')
        assert.equal(res.body[2].post.id, postId)
        assert.equal(res.body[0].actor.name, 'Fã Teste')
        assert.doesNotMatch(JSON.stringify(res.body), /email|cpf|password/)
        assert.equal(await unread(author.auth), 3)
    })

    it('não avisa ações na própria conta', async () => {
        const author = await createUser()
        const postId = await createPost(author.auth)

        await api().post(`/like/post/${postId}`).set('Authorization', author.auth)
        await api().post(`/comment/${postId}`).set('Authorization', author.auth).send({text: 'eu'})

        assert.equal(await unread(author.auth), 0)
    })

    it('remove o aviso ao descurtir ou deixar de seguir', async () => {
        const author = await createUser()
        const fan = await createUser()
        const postId = await createPost(author.auth)

        await api().post(`/like/post/${postId}`).set('Authorization', fan.auth)
        await api().post(`/follow/${author.id}`).set('Authorization', fan.auth)
        assert.equal(await unread(author.auth), 2)

        await api().post(`/like/post/${postId}`).set('Authorization', fan.auth)
        await api().post(`/follow/${author.id}`).set('Authorization', fan.auth)
        assert.equal(await unread(author.auth), 0)
    })

    it('marca uma ou todas como lidas, só do próprio usuário', async () => {
        const author = await createUser()
        const fan = await createUser()
        const postId = await createPost(author.auth)
        await api().post(`/like/post/${postId}`).set('Authorization', fan.auth)
        await api().post(`/follow/${author.id}`).set('Authorization', fan.auth)
        const [first] = (await list(author.auth)).body

        const other = await api().patch(`/notifications/${first.id}/read`).set('Authorization', fan.auth)
        assert.equal(other.status, 404)

        await api().patch(`/notifications/${first.id}/read`).set('Authorization', author.auth)
        assert.equal(await unread(author.auth), 1)
        assert.equal((await list(author.auth)).body[0].read, true)

        await api().patch('/notifications/read-all').set('Authorization', author.auth)
        assert.equal(await unread(author.auth), 0)
    })

    it('apaga o aviso junto com o post', async () => {
        const author = await createUser()
        const fan = await createUser()
        const postId = await createPost(author.auth)
        await api().post(`/comment/${postId}`).set('Authorization', fan.auth).send({text: 'oi'})

        await api().delete(`/post/delete/${postId}`).set('Authorization', author.auth)

        assert.deepEqual((await list(author.auth)).body, [])
    })
})

describe('notificações ao vivo', () => {
    let server: Server
    let url: string
    const sockets: Socket[] = []

    before(async () => {
        await startDb()
        server = createServer(app)
        initSocket(server)
        await new Promise<void>(resolve => server.listen(0, resolve))
        url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    })
    beforeEach(clearDb)
    after(async () => {
        sockets.forEach(s => s.close())
        closeSocket()
        await new Promise(resolve => server.close(resolve))
        await stopDb()
    })

    const open = (token?: string) => {
        const socket = connect(url, {auth: {token}, transports: ['websocket'], reconnection: false})
        sockets.push(socket)
        return socket
    }

    it('entrega a notificação no socket de quem recebe', async () => {
        const author = await createUser()
        const fan = await createUser('Fã Ao Vivo')
        const postId = await createPost(author.auth)

        const socket = open(author.auth.replace('Bearer ', ''))
        await new Promise<void>(resolve => socket.on("connect", () => resolve()))

        const received = new Promise<any>(resolve => socket.on('notification:new', resolve))
        await api().post(`/like/post/${postId}`).set('Authorization', fan.auth)

        const notification = await received
        assert.equal(notification.type, 'like')
        assert.equal(notification.actor.name, 'Fã Ao Vivo')
        assert.equal(notification.read, false)
    })

    it('avisa quando uma notificação some', async () => {
        const author = await createUser()
        const fan = await createUser()
        const postId = await createPost(author.auth)
        await api().post(`/like/post/${postId}`).set('Authorization', fan.auth)

        const socket = open(author.auth.replace('Bearer ', ''))
        await new Promise<void>(resolve => socket.on("connect", () => resolve()))

        const removed = new Promise<void>(resolve => socket.on('notification:removed', () => resolve()))
        await api().post(`/like/post/${postId}`).set('Authorization', fan.auth)

        await removed
    })

    it('recusa conexão sem token válido', async () => {
        const socket = open('token-falso')

        const error = await new Promise<Error>(resolve => socket.on('connect_error', resolve))
        assert.equal(error.message, 'Não autenticado')
    })
})
