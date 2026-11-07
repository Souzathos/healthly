import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { UserMapper } from "../src/mappers/UserMapper";
import { User } from "../src/models/User";

describe('mappers', () => {
    // Simula uma coluna adicionada ao modelo no futuro
    const user = Object.assign(new User(), {
        id: 1,
        name: 'Ana',
        email: 'ana@test.com',
        password: 'hash',
        cpf: '52998224725',
        handle: 'ana',
        bio: null,
        goal: null,
        resetToken: 'segredo'
    })

    it('expõe só os campos públicos', () => {
        assert.deepEqual(Object.keys(UserMapper.toPublic(user)).sort(), ['bio', 'goal', 'handle', 'id', 'name'])
    })

    it('acrescenta só o e-mail para o próprio usuário', () => {
        assert.deepEqual(Object.keys(UserMapper.toPrivate(user)).sort(), ['bio', 'email', 'goal', 'handle', 'id', 'name'])
    })
})
