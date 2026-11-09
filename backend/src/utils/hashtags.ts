// Extrai as hashtags de um texto, sem repetir: "Treino #Força e #força" -> ["força"]
export function extractHashtags(text?: string | null) {
    if(!text) return []

    const matches = text.match(/#[\p{L}\p{N}_]+/gu) ?? []
    const names = matches.map(tag => tag.slice(1).toLowerCase()).filter(tag => tag.length <= 50)

    return [...new Set(names)]
}
