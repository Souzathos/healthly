import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { api, clearDb, createUser, PASSWORD, startDb, stopDb, validCpf } from "./helpers";

const payload = (overrides = {}) => ({
    name: 'Ana Teste',
    email: 'ana@test.com',
    password: PASSWORD,
    cpf: validCpf(),
    ...overrides
})

describe('auth', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    it('cadastra com CPF formatado e guarda só os dígitos', async () => {
        const cpf = validCpf()
        const masked = `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`

        const first = await api().post('/user/register').send(payload({cpf: masked}))
        assert.equal(first.status, 201)

        const second = await api().post('/user/register').send(payload({email: 'b@test.com', cpf}))
        assert.equal(second.status, 409)
        assert.equal(second.body.message, 'CPF já cadastrado')
    })

    it('aceita qualquer CPF com 11 números e recusa os incompletos', async () => {
        const ok = await api().post('/user/register').send(payload({cpf: '123.456.789-00'}))
        assert.equal(ok.status, 201)

        const short = await api().post('/user/register').send(payload({email: 'b@test.com', cpf: '123.456'}))
        assert.equal(short.status, 400)
        assert.equal(short.body.errors[0].mensagem, 'O CPF deve ter 11 números')
    })

    it('recusa e-mail e @usuário repetidos com 409', async () => {
        await api().post('/user/register').send(payload({handle: 'ana'}))

        const email = await api().post('/user/register').send(payload())
        assert.equal(email.status, 409)

        const handle = await api().post('/user/register').send(payload({email: 'b@test.com', handle: 'ana'}))
        assert.equal(handle.status, 409)
        assert.equal(handle.body.message, '@usuário já está em uso')
    })

    it('recusa senha acima de 72 bytes', async () => {
        const res = await api().post('/user/register').send(payload({password: 'a'.repeat(73)}))

        assert.equal(res.status, 400)
    })

    it('faz login e devolve token e dados da conta', async () => {
        const user = await createUser()

        const res = await api().post('/user/login').send({email: user.email, password: PASSWORD})

        assert.equal(res.status, 200)
        assert.ok(res.body.token)
        assert.equal(res.body.data.email, user.email)
        assert.equal(res.body.data.password, undefined)
        assert.equal(res.body.data.cpf, undefined)
    })

    it('bloqueia depois de 10 falhas de login', async () => {
        const user = await createUser()
        const statuses = []

        for(let attempt = 0; attempt < 11; attempt++) {
            const res = await api().post('/user/login').send({email: user.email, password: 'errada'})
            statuses.push(res.status)
        }

        assert.deepEqual(statuses, [...Array(10).fill(401), 429])
    })
})
