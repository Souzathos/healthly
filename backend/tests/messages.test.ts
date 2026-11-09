import assert from "node:assert/strict";
import { createServer, Server } from "node:http";
import { AddressInfo } from "node:net";
import { after, before, beforeEach, describe, it } from "node:test";
import { io as connect, Socket } from "socket.io-client";
import app from "../src/app";
import { closeSocket, initSocket } from "../src/realtime/socket";
import { api, clearDb, createUser, startDb, stopDb } from "./helpers";

const open = (auth: string, userId: number) =>
    api().post(`/conversations/with/${userId}`).set('Authorization', auth)
const send = (auth: string, id: number, text: string) =>
    api().post(`/conversations/${id}/messages`).set('Authorization', auth).send({text})
const unread = async (auth: string) =>
    (await api().get('/conversations/unread-count').set('Authorization', auth)).body.count

describe('mensagens', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    it('abre sempre a mesma conversa entre duas pessoas', async () => {
        const ana = await createUser('Ana Teste')
        const bruno = await createUser('Bruno Teste')

        const first = await open(ana.auth, bruno.id)
        const second = await open(bruno.auth, ana.id)

        assert.equal(first.status, 200)
        assert.equal(first.body.id, second.body.id)
        assert.equal(first.body.user.name, 'Bruno Teste')
        assert.equal(second.body.user.name, 'Ana Teste')
    })

    it('recusa conversa consigo mesmo e com usuário inexistente', async () => {
        const ana = await createUser()

        assert.equal((await open(ana.auth, ana.id)).status, 400)
        assert.equal((await open(ana.auth, 999)).status, 404)
    })

    it('envia, lista e conta não lidas', async () => {
        const ana = await createUser('Ana Teste')
        const bruno = await createUser('Bruno Teste')
        const {body: conversation} = await open(ana.auth, bruno.id)

        await send(ana.auth, conversation.id, 'oi')
        await send(ana.auth, conversation.id, 'tudo bem?')

        const messages = await api().get(`/conversations/${conversation.id}/messages`).set('Authorization', bruno.auth)
        assert.deepEqual(messages.body.map((m: any) => m.text), ['tudo bem?', 'oi'])

        const list = await api().get('/conversations').set('Authorization', bruno.auth)
        assert.equal(list.body[0].user.name, 'Ana Teste')
        assert.equal(list.body[0].lastMessage.text, 'tudo bem?')
        assert.equal(list.body[0].lastMessage.fromMe, false)
        assert.equal(list.body[0].unreadCount, 2)
        assert.equal(await unread(bruno.auth), 2)
        assert.equal(await unread(ana.auth), 0)

        await api().patch(`/conversations/${conversation.id}/read`).set('Authorization', bruno.auth)
        assert.equal(await unread(bruno.auth), 0)
    })

    it('não lista conversa sem mensagens e ordena pela mais recente', async () => {
        const ana = await createUser()
        const bruno = await createUser()
        const carla = await createUser('Carla Teste')
        const withBruno = (await open(ana.auth, bruno.id)).body
        await open(ana.auth, carla.id)
        const withCarla = (await open(ana.auth, carla.id)).body

        assert.deepEqual((await api().get('/conversations').set('Authorization', ana.auth)).body, [])

        await send(ana.auth, withBruno.id, 'primeira')
        await send(carla.auth, withCarla.id, 'mais recente')

        const list = await api().get('/conversations').set('Authorization', ana.auth)
        assert.deepEqual(list.body.map((c: any) => c.id), [withCarla.id, withBruno.id])
    })

    it('esconde conversa de quem não participa', async () => {
        const ana = await createUser()
        const bruno = await createUser()
        const intruso = await createUser()
        const {body: conversation} = await open(ana.auth, bruno.id)

        const read = await api().get(`/conversations/${conversation.id}/messages`).set('Authorization', intruso.auth)
        const write = await send(intruso.auth, conversation.id, 'oi')

        assert.equal(read.status, 404)
        assert.equal(write.status, 404)
    })

    it('recusa mensagem vazia', async () => {
        const ana = await createUser()
        const bruno = await createUser()
        const {body: conversation} = await open(ana.auth, bruno.id)

        const res = await send(ana.auth, conversation.id, '   ')

        assert.equal(res.status, 400)
    })
})

describe('mensagens ao vivo', () => {
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

    it('entrega a mensagem para quem recebe', async () => {
        const ana = await createUser()
        const bruno = await createUser()
        const {body: conversation} = await open(ana.auth, bruno.id)

        const socket = connect(url, {auth: {token: bruno.auth.replace('Bearer ', '')}, transports: ['websocket'], reconnection: false})
        sockets.push(socket)
        await new Promise<void>(resolve => socket.on('connect', () => resolve()))

        const received = new Promise<any>(resolve => socket.on('message:new', resolve))
        await send(ana.auth, conversation.id, 'chegou ao vivo')

        const message = await received
        assert.equal(message.text, 'chegou ao vivo')
        assert.equal(message.conversationId, conversation.id)
        assert.equal(message.senderId, ana.id)
    })
})
