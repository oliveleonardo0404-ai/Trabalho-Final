export type LoggedUser = {
  _id?: string
  id?: string
  nome?: string
  email?: string
  cpf?: string
  numero?: string
  nascimento?: string
}

const STORAGE_KEY = 'petcare_user'

export const getStoredUser = (): LoggedUser | null => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as LoggedUser
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const setStoredUser = (user: LoggedUser) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export const clearStoredUser = () => {
  localStorage.removeItem(STORAGE_KEY)
}

export const isLoggedIn = () => Boolean(getStoredUser())
