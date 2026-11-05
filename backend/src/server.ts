import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import { AppDataSource } from './config/data-source'
import { allowedOrigins } from './config/cors'
import routes from './routes'

dotenv.config()

const app = express()
// As imagens são carregadas por outra origem no Expo Web
app.use(helmet({crossOriginResourcePolicy: {policy: 'cross-origin'}}))
app.use(cors({origin: allowedOrigins()}))
app.use(express.json())
app.use(routes)

const port = Number(process.env.PORT)

AppDataSource.initialize().then(() => {
    console.log('Banco conectado')

    app.listen(port, () => {
        console.log('Servidor rodando na porta: ', port)
    })
})
