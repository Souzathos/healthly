import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it, mock } from "node:test";
import { PostService } from "../src/services/PostService";
import { api, clearDb, createUser, startDb, stopDb } from "./helpers";

describe('erros', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    it('responde JSON em rota inexistente', async () => {
        const res = await api().get('/nao-existe')

        assert.equal(res.status, 404)
        assert.equal(res.body.message, 'Rota não encontrada')
    })

    it('responde JSON em corpo malformado', async () => {
        const res = await api().post('/user/login').set('Content-Type', 'application/json').send('{oi')

        assert.equal(res.status, 400)
        assert.equal(res.body.message, 'JSON inválido')
    })

    it('usa 404 para recurso inexistente', async () => {
        const user = await createUser()

        for(const path of ['/post/999', '/user/999', '/post/media/999']) {
            assert.equal((await api().get(path)).status, 404, path)
        }
        const like = await api().post('/like/post/999').set('Authorization', user.auth)
        assert.equal(like.status, 404)
    })

    it('recusa ids inválidos', async () => {
        for(const path of ['/post/abc', '/user/0', '/post/-1', '/comment/post/1.5', '/follow/abc/followers']) {
            const res = await api().get(path)
            assert.equal(res.status, 400, path)
            assert.equal(res.body.message, 'Identificador inválido')
        }
    })

    it('recusa paginação inválida', async () => {
        const user = await createUser()

        for(const query of ['page=-1', 'page=abc', 'limit=0', 'limit=1000']) {
            const res = await api().get(`/post/feed?${query}`).set('Authorization', user.auth)
            assert.equal(res.status, 400, query)
        }
    })

    it('não vaza detalhes de erros inesperados', async () => {
        const failure = mock.method(PostService.prototype, 'getById', async () => {
            throw new Error('ER_ACCESS_DENIED: senha do banco')
        })
        const log = mock.method(console, 'error', () => {})

        const res = await api().get('/post/1')

        assert.equal(res.status, 500)
        assert.equal(res.body.message, 'Erro interno do servidor')
        assert.equal(log.mock.callCount(), 1)

        failure.mock.restore()
        log.mock.restore()
    })

    it('aplica CORS só às origens permitidas', async () => {
        const allowed = await api().get('/user/999').set('Origin', 'http://localhost:8081')
        assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:8081')

        const blocked = await api().get('/user/999').set('Origin', 'http://evil.test')
        assert.equal(blocked.headers['access-control-allow-origin'], undefined)
    })
})
