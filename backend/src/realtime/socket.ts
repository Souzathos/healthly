import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { allowedOrigins } from "../config/cors";
import { verifyToken } from "../utils/jwt";

let io: Server | null = null

export function initSocket(server: HttpServer) {
    io = new Server(server, {cors: {origin: allowedOrigins()}})

    // Só aceita conexões com o mesmo JWT usado na API
    io.use((socket, next) => {
        const decoded = verifyToken(String(socket.handshake.auth?.token ?? '')) as {id: number} | null
        if(!decoded) return next(new Error('Não autenticado'))

        socket.data.userId = decoded.id
        next()
    })

    // Cada usuário tem uma sala própria: avisos para ele chegam em todos os aparelhos conectados
    io.on('connection', (socket) => {
        socket.join(userRoom(socket.data.userId))
    })

    return io
}

function userRoom(userId: number) {
    return `user:${userId}`
}

// Sem servidor de socket (como nos testes da API), o aviso é só ignorado
export function emitToUser(userId: number, event: string, payload: unknown) {
    io?.to(userRoom(userId)).emit(event, payload)
}

export function closeSocket() {
    io?.close()
    io = null
}
