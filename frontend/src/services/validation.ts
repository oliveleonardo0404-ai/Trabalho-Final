export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function parseDateInput(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null
  }

  return date
}

export function dateInputToIso(value: string): string {
  return parseDateInput(value)?.toISOString() ?? ''
}

export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '')

  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false

  const calculateDigit = (length: number): number => {
    let sum = 0

    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * (length + 1 - index)
    }

    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  return calculateDigit(9) === Number(digits[9]) && calculateDigit(10) === Number(digits[10])
}
