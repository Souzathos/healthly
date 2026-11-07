import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { AppDataSource } from "../src/config/data-source";
import { startDb, stopDb } from "./helpers";

describe('migrations', () => {
    before(startDb)
    after(stopDb)

    it('deixa o banco igual aos modelos', async () => {
        const diff = await AppDataSource.driver.createSchemaBuilder().log()

        assert.deepEqual(diff.upQueries.map(q => q.query), [])
    })
})
