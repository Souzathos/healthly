// Guarda só os números: "529.982.247-25" e "52998224725" contam como o mesmo CPF
export function normalizeCpf(value: string) {
    return value.replace(/\D/g, '')
}
