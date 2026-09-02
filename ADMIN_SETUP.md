# Setup de Administrador - PetCare

## 🔑 Código de Acesso ADM (Protótipo)

Para efeitos de prototipagem, foi implementado um sistema bem simples de login para ADM.

### Credenciais:
- **Código ADM**: `1234`

## ✅ Como usar o Acesso de ADM

1. Na página de **LOGIN** (`/login`), clique no botão **"🔑 Acessar como Administrador"** na parte inferior
2. Digite o código: `1234`
3. Clique em **"Entrar como ADM"**
4. Você será redirecionado para a página de **Administração** (`/admin`)

## 📋 O que o ADM pode fazer

### 1. **Gerenciar Serviços**
- ✏️ **Editar** nome, descrição e valor (diária) de serviços existentes
- ✨ **Criar** novos serviços para o catálogo
- 🗑️ **Remover** serviços do catálogo

### 2. **Valores de Serviços**
- Todos os preços são em **reais (R$)**
- Use `0,01` como valor mínimo se desejar

## 🔐 Alterando o Código de ADM

Se quiser mudar o código de acesso, edite o arquivo:
```
frontend/src/services/auth.ts
```

Procure por:
```typescript
const ADMIN_CODE = '1234' // ← Altere aqui
```

Mudança simples:
```typescript
const ADMIN_CODE = '9999' // Novo código
```

## 📝 Validações Simplificadas

O sistema foi simplificado para uso em prototipagem:

### ✅ CPF
- Apenas verifica se tem **11 dígitos**
- Não valida dígitos verificadores

### ✅ Senha
- Apenas precisa **não estar vazia**
- Sem requisito de caracteres especiais ou tamanho mínimo

## 🎯 Resumo Técnico

| Item | Descrição |
|------|-----------|
| Login ADM | Código pré-setado em `auth.ts` |
| Validação CPF | 11 dígitos apenas |
| Validação Senha | Não vazia |
| Modelo User | Campo `role` pode ser 'cliente' ou 'admin' |
| Armazenamento | LocalStorage do navegador |

---

**Nota**: Este é um protótipo! Em produção, implemente autenticação segura com JWT, bcrypt, e validações rigorosas.
