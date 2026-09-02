# 🚀 Guia Rápido - Login e Admin

## 👤 Login Normal (Cliente)

```
┌─────────────────────────────┐
│   PÁGINA DE LOGIN           │
│                             │
│ E-mail: user@email.com      │
│ Senha: qualquer coisa       │ ← Agora aceita qualquer coisa!
│                             │
│ [Entrar na Conta]           │
│                             │
│ ------- OU -------          │
│                             │
│ [🔑 Acessar como Adm]       │
└─────────────────────────────┘
         ↓
    ✅ Entra em HOME
```

---

## 🔑 Login de Administrador

```
┌─────────────────────────────┐
│ ACESSO DE ADMINISTRADOR     │
│                             │
│ Código: [____]              │
│                             │
│ [Entrar como ADM]           │
│ [Voltar para Login Normal]  │
└─────────────────────────────┘
         ↓
      Código: 1234
         ↓
    ✅ Entra em ADMIN
```

---

## ⚙️ Página de Administrador

```
┌──────────────────────────────────────────┐
│ ADMINISTRAÇÃO                            │
│                                          │
│ ┌─ CRIAR/EDITAR SERVIÇO ────────────┐  │
│ │                                    │  │
│ │ Nome: Hotel                        │  │
│ │ Descrição: Hospedagem completa   │  │
│ │ Preço (R$): 150,00               │  │
│ │ ✓ Serviço ativo                  │  │
│ │                                    │  │
│ │ [Criar Serviço]                  │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌─ CATÁLOGO ATUAL ──────────────────┐  │
│ │                                    │  │
│ │ Hotel           [✓ Ativo]         │  │
│ │ R$ 150,00                         │  │
│ │ [Editar] [Remover]               │  │
│ │                                    │  │
│ │ Creche          [✗ Inativo]       │  │
│ │ R$ 80,00                          │  │
│ │ [Editar] [Remover]               │  │
│ └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## ✏️ Operações do Admin

### Criar novo serviço:
1. Preenche nome, descrição, preço
2. Marca ✓ "Serviço ativo"
3. Clica [Criar Serviço]

### Editar existente:
1. Clica [Editar] no serviço
2. Altera nome, descrição, preço ou status
3. Clica [Salvar alterações]

### Desativar serviço:
1. Clica [Editar]
2. Desmarcar ☐ "Serviço ativo"
3. Clica [Salvar alterações]
4. Badge muda para "✗ Inativo"

### Remover serviço:
1. Clica [Remover]
2. Confirma exclusão
3. Serviço sai do catálogo

---

## 📱 Fluxo Completo

```
   INÍCIO
     │
     ├─→ [Cadastro] → CPF (11 números) 
     │               Senha (não vazio)
     │               → Vai para LOGIN
     │
     ├─→ [Login Normal]
     │   Email + Senha
     │   → HOME
     │
     └─→ [Login ADM]
         Código: 1234
         → ADMIN (gerencia serviços)
```

---

## 🎯 Diferenças: Antes vs Depois

### CPF
| Antes | Depois |
|-------|--------|
| Validação rigorosa (dígitos verificadores) | Apenas 11 dígitos |
| Erro se incorreto | Aceita qualquer 11 números |

### Senha
| Antes | Depois |
|-------|--------|
| Mínimo 6 caracteres | Qualquer coisa (não vazio) |
| Validação complexa | Validação simples |

### Admin
| Antes | Depois |
|-------|--------|
| Não existia | Código: `1234` |
| - | Pode editar preços |
| - | Pode ativar/desativar |

---

## ⚡ Dica Rápida

Se esqueceu o que fazer:
1. **Sou cliente?** → Vai em `/login` normalmente
2. **Sou admin?** → Vai em `/login` + clica em "🔑 Acessar como Adm" + digita `1234`

Pronto! É isso! 🎉
