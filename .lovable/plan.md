

# Corrigir Erro de Indicação - Permitir Email NULL no Banco

## Problema Identificado

O erro está nos logs da edge function:

```
Database insert error: {
  code: "23502",
  message: 'null value in column "syndic_email" violates not-null constraint'
}
```

A tabela `syndic_referrals` foi criada com a coluna `syndic_email` como NOT NULL, mas o código foi atualizado para permitir email opcional sem atualizar o banco.

---

## Solução

Executar uma migração SQL para alterar a coluna `syndic_email` e permitir valores NULL.

---

## Mudança Necessária

### Migração SQL

```sql
ALTER TABLE public.syndic_referrals 
ALTER COLUMN syndic_email DROP NOT NULL;
```

---

## Por que isso aconteceu

| Componente | Status | Permite NULL? |
|------------|--------|---------------|
| Frontend (Zod schema) | Atualizado | Sim |
| Edge Function (validação) | Atualizado | Sim |
| Edge Function (insert) | Atualizado | Sim (passa null) |
| Banco de Dados | **Não atualizado** | **Não** |

---

## Após a Correção

O fluxo funcionará assim:

1. Usuário preenche formulário sem email
2. Frontend valida e envia `syndicEmail: ""`
3. Edge function converte para `null`
4. Banco aceita o `null` (após migração)
5. Indicação salva com sucesso
6. WhatsApp e SMS são enviados (email ignorado)

