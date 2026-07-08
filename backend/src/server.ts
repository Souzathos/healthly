import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { AppDataSource } from './config/data-source'
import routes from './routes'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(routes)

const port = Number(process.env.PORT)

AppDataSource.initialize().then(() => {
    console.log('Banco conectado')

    app.listen(port, () => {
        console.log('Servidor rodando na porta: ', port)
    })
})
