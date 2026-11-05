export function normalizeCpf(value: string) {
    return value.replace(/\D/g, '')
}

function checkDigit(digits: string, length: number) {
    let sum = 0
    for (let i = 0; i < length; i++) {
        sum += Number(digits[i]) * (length + 1 - i)
    }
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
}

// Recebe o CPF só com dígitos e confere os dois dígitos verificadores
export function isValidCpf(cpf: string) {
    if (!/^\d{11}$/.test(cpf)) return false
    if (/^(\d)\1{10}$/.test(cpf)) return false

    return checkDigit(cpf, 9) === Number(cpf[9])
        && checkDigit(cpf, 10) === Number(cpf[10])
}
