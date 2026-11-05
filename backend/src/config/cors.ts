// Porta padrão do Expo Web. Apps nativos não enviam Origin, então não dependem desta lista.
const DEFAULT_ORIGINS = ['http://localhost:8081']

export function allowedOrigins() {
    const origins = (process.env.CORS_ORIGINS ?? '')
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean)

    return origins.length > 0 ? origins : DEFAULT_ORIGINS
}
