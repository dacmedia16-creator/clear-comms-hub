

## Flexibilizar validação de importação de planilha

Atualmente a importação exige Nome, Telefone e Email como obrigatórios para todos os tipos de organização. A mudança tornará apenas o **Telefone** obrigatório, com Nome e Email opcionais -- especialmente útil para o segmento genérico.

---

### Mudanças

**Arquivo: `src/components/ImportMembersDialog.tsx`**

1. Ajustar a função `validateMember` (linhas 120-122):
   - **Nome**: Validar apenas se preenchido (se vazio, aceitar sem erro)
   - **Telefone**: Continua obrigatório (único campo obrigatório)
   - **Email**: Validar formato apenas se preenchido (se vazio, aceitar sem erro)

2. Ajustar o template de download para indicar que Nome e Email são opcionais:
   - Cabeçalhos: `Nome (opcional)`, `Email (opcional)` -- Telefone sem "(opcional)"

**Arquivo: `supabase/functions/create-member/index.ts`**

3. Ajustar validação no backend (linha 70):
   - Trocar exigência de `fullName` para `phone` como campo obrigatório
   - Permitir `fullName` vazio (usar telefone como fallback de identificação)

**Arquivo: `src/hooks/useCondoMembers.ts`**

4. Ajustar helper `getMemberDisplayName`:
   - Se nome vazio, retornar o telefone como fallback de exibição

---

### Regras de validação após a mudança

| Campo | Regra |
|---|---|
| Nome | Opcional. Se preenchido, minimo 2 caracteres |
| Telefone | **Obrigatório** |
| Email | Opcional. Se preenchido, deve conter "@" |
| Bloco/Unidade | Depende do tipo de organização (sem mudança) |
| Função | Default "resident" se vazio (sem mudança) |

