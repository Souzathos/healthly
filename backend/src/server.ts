import { createServer } from "http";
import { env } from "./config/env";
import { AppDataSource } from "./config/data-source";
import app from "./app";
import { initSocket } from "./realtime/socket";

AppDataSource.initialize()
    .then(() => {
        console.log('Banco conectado')

        // API e WebSocket na mesma porta
        const server = createServer(app)
        initSocket(server)

        server.listen(env.PORT, () => {
            console.log('Servidor rodando na porta: ', env.PORT)
        })
    })
    .catch((error) => {
        console.error('Falha ao iniciar o servidor:', error)
        process.exit(1)
    })
