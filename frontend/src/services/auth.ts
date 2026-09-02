export type LoggedUser = {
  _id?: string
  id?: string
  nome?: string
  email?: string
  cpf?: string
  numero?: string
  nascimento?: string
  role?: 'cliente' | 'admin'
  [key: string]: unknown
}

const STORAGE_KEY = 'petcare_user'
const ADMIN_CODE = '1234' // Código pré-setado para ADM

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

// Função simples para validar código de ADM
export function isValidAdminCode(code: string): boolean {
  return code.trim() === ADMIN_CODE
}

// Função para logar como ADM
export function loginAsAdmin(): void {
  const adminUser: LoggedUser = {
    id: 'admin-001',
    nome: 'Administrador',
    email: 'admin@petcare.com',
    role: 'admin',
  }
  setStoredUser(adminUser)
}