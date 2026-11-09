import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { extractHashtags } from "../src/utils/hashtags";
import { api, clearDb, createUser, startDb, stopDb } from "./helpers";

const post = (auth: string, fields: Record<string, string>) => {
    let req = api().post('/post/create').set('Authorization', auth)
    for(const [key, value] of Object.entries(fields)) req = req.field(key, value)
    return req
}
const ids = (res: any) => res.body.map((p: any) => p.id).sort()

describe('hashtags', () => {
    it('extrai sem repetir, em minúsculas, com acentos', () => {
        assert.deepEqual(extractHashtags('Treino de #Força hoje! #força #pós_treino #2024'), ['força', 'pós_treino', '2024'])
        assert.deepEqual(extractHashtags('sem tags'), [])
        assert.deepEqual(extractHashtags(null), [])
    })
})

describe('descoberta de posts', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    it('lista os posts de uma hashtag, sem confundir com parecidas', async () => {
        const user = await createUser()
        const treino = (await post(user.auth, {description: 'Dia de #Treino pesado'})).body.id
        const outro = (await post(user.auth, {description: 'mais um #treino'})).body.id
        await post(user.auth, {description: 'semana de #treinos'})

        const res = await api().get('/post/hashtag/treino')
        assert.deepEqual(ids(res), [treino, outro].sort())

        const comHash = await api().get(`/post/hashtag/${encodeURIComponent('#TREINO')}`)
        assert.equal(comHash.body.length, 2)
    })

    it('refaz as hashtags ao editar o texto', async () => {
        const user = await createUser()
        const id = (await post(user.auth, {description: '#antes'})).body.id

        await api().put(`/post/update/${id}`).set('Authorization', user.auth).field('description', 'agora #depois')

        assert.deepEqual((await api().get('/post/hashtag/antes')).body, [])
        assert.deepEqual(ids(await api().get('/post/hashtag/depois')), [id])
    })

    it('guarda a dieta e busca por texto e por dieta', async () => {
        const user = await createUser()
        const vegana = (await post(user.auth, {description: 'Bowl de grão de bico', diet: 'vegan'})).body
        const keto = (await post(user.auth, {description: 'Omelete com abacate', diet: 'keto'})).body.id
        const semDieta = (await post(user.auth, {description: 'Bowl de frango', diet: ''})).body

        assert.equal(vegana.diet, 'vegan')
        assert.equal(semDieta.diet, null)

        assert.deepEqual(ids(await api().get('/post/search?q=bowl')), [vegana.id, semDieta.id].sort())
        assert.deepEqual(ids(await api().get('/post/search?diet=keto')), [keto])
        assert.deepEqual(ids(await api().get('/post/search?q=bowl&diet=vegan')), [vegana.id])
        assert.deepEqual(ids(await api().get('/post/search?q=%25')), [])
    })

    it('recusa dieta inválida', async () => {
        const user = await createUser()

        assert.equal((await post(user.auth, {description: 'oi', diet: 'pizza'})).status, 400)
        assert.equal((await api().get('/post/search?diet=pizza')).status, 400)
    })

    it('ordena as hashtags em alta pela quantidade de posts', async () => {
        const user = await createUser()
        await post(user.auth, {description: '#dieta #treino'})
        await post(user.auth, {description: '#dieta'})
        await post(user.auth, {description: '#dieta #receita'})
        await post(user.auth, {description: '#treino'})

        const res = await api().get('/post/trending-hashtags')

        assert.deepEqual(res.body, [
            {name: 'dieta', postsCount: 3},
            {name: 'treino', postsCount: 2},
            {name: 'receita', postsCount: 1}
        ])
    })
})
