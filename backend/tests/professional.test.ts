import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { AppDataSource } from "../src/config/data-source";
import { api, clearDb, createUser, PNG, startDb, stopDb } from "./helpers";

const png = {filename: 'crn.png', contentType: 'image/png'}

const requestSeal = (auth: string, fields = {type: 'nutritionist', registryNumber: 'CRN-3 12345'}) => {
    let req = api().post('/professional/requests').set('Authorization', auth)
    for(const [key, value] of Object.entries(fields)) req = req.field(key, value)
    return req
}

async function createAdmin() {
    const admin = await createUser('Admin Teste')
    await AppDataSource.query(`UPDATE users SET role = 'admin' WHERE id = ?`, [admin.id])
    return admin
}

describe('profissionais verificados', () => {
    before(startDb)
    beforeEach(clearDb)
    after(stopDb)

    it('pede o selo com documento e acompanha o status', async () => {
        const pro = await createUser()

        const created = await requestSeal(pro.auth).attach('document', PNG, png)
        assert.equal(created.status, 201)
        assert.equal(created.body.status, 'pending')
        assert.equal(created.body.document, undefined)

        const mine = await api().get('/professional/requests/me').set('Authorization', pro.auth)
        assert.equal(mine.body.request.status, 'pending')
    })

    it('exige documento, tipo válido e um pedido por vez', async () => {
        const pro = await createUser()

        assert.equal((await requestSeal(pro.auth)).status, 400)
        assert.equal((await requestSeal(pro.auth, {type: 'medico', registryNumber: 'X 123'}).attach('document', PNG, png)).status, 400)

        await requestSeal(pro.auth).attach('document', PNG, png)
        const second = await requestSeal(pro.auth).attach('document', PNG, png)
        assert.equal(second.status, 409)
    })

    it('só admin vê e analisa os pedidos', async () => {
        const pro = await createUser()
        const curioso = await createUser()
        const {body: request} = await requestSeal(pro.auth).attach('document', PNG, png)

        const list = await api().get('/professional/requests/pending').set('Authorization', curioso.auth)
        assert.equal(list.status, 403)

        const review = await api().patch(`/professional/requests/${request.id}`).set('Authorization', curioso.auth).send({approve: true})
        assert.equal(review.status, 403)
    })

    it('aprovar dá o selo e o tipo profissional ao perfil', async () => {
        const pro = await createUser('Nutri Teste')
        const admin = await createAdmin()
        const {body: request} = await requestSeal(pro.auth).attach('document', PNG, png)

        const pending = await api().get('/professional/requests/pending').set('Authorization', admin.auth)
        assert.equal(pending.body.length, 1)
        assert.equal(pending.body[0].user.name, 'Nutri Teste')
        assert.match(pending.body[0].document, /^data:image\/png;base64,/)

        const review = await api().patch(`/professional/requests/${request.id}`).set('Authorization', admin.auth).send({approve: true})
        assert.equal(review.body.status, 'approved')

        const profile = await api().get(`/user/${pro.id}`)
        assert.equal(profile.body.isVerified, true)
        assert.equal(profile.body.professionalType, 'nutritionist')

        const again = await api().patch(`/professional/requests/${request.id}`).set('Authorization', admin.auth).send({approve: false})
        assert.equal(again.status, 409)

        const newRequest = await requestSeal(pro.auth).attach('document', PNG, png)
        assert.equal(newRequest.status, 409)
    })

    it('recusar não dá o selo e permite pedir de novo', async () => {
        const pro = await createUser()
        const admin = await createAdmin()
        const {body: request} = await requestSeal(pro.auth, {type: 'physical_educator', registryNumber: 'CREF 999'}).attach('document', PNG, png)

        await api().patch(`/professional/requests/${request.id}`).set('Authorization', admin.auth).send({approve: false})

        const profile = await api().get(`/user/${pro.id}`)
        assert.equal(profile.body.isVerified, false)

        const mine = await api().get('/professional/requests/me').set('Authorization', pro.auth)
        assert.equal(mine.body.request.status, 'rejected')

        const retry = await requestSeal(pro.auth).attach('document', PNG, png)
        assert.equal(retry.status, 201)
    })

    it('mostra o papel só para a própria conta', async () => {
        const admin = await createAdmin()

        const me = await api().get('/user/me').set('Authorization', admin.auth)
        assert.equal(me.body.role, 'admin')

        const publicProfile = await api().get(`/user/${admin.id}`)
        assert.equal(publicProfile.body.role, undefined)
    })
})
