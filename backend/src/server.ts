import { env } from "./config/env";
import { AppDataSource } from "./config/data-source";
import app from "./app";

AppDataSource.initialize()
    .then(() => {
        console.log('Banco conectado')

        app.listen(env.PORT, () => {
            console.log('Servidor rodando na porta: ', env.PORT)
        })
    })
    .catch((error) => {
        console.error('Falha ao iniciar o servidor:', error)
        process.exit(1)
    })
