export type LoggedUser = {
  _id?: string
  id?: string
  nome?: string
  email?: string
  cpf?: string
  numero?: string
  nascimento?: string
  [key: string]: unknown
}

const STORAGE_KEY = 'petcare_user'

export function getStoredUser(): LoggedUser | null {
  const storedUser = localStorage.getItem(STORAGE_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as LoggedUser
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function setStoredUser(user: LoggedUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredUser(): void {
  localStorage.removeItem(STORAGE_KEY)
}