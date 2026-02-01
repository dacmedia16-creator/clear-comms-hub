
# Teste Gratis para Condominio - 3 Meses

## Objetivo
Adicionar sistema de periodo de teste gratuito de 3 meses para condominios, permitindo que novos condominios experimentem o sistema antes de precisar contratar um plano pago.

---

## Arquitetura da Solucao

### Novo Campo no Banco de Dados
Adicionar coluna `trial_ends_at` na tabela `condominiums` para controlar quando o periodo de teste termina.

### Logica de Trial
- Quando um condominio e criado, `trial_ends_at` sera definido como `created_at + 3 meses`
- O sistema verificara se o trial ainda esta ativo comparando `trial_ends_at` com a data atual
- Super Admin podera editar a data de termino do trial manualmente

---

## Alteracoes Propostas

### 1. Migracao do Banco de Dados

```sql
-- Adicionar coluna trial_ends_at
ALTER TABLE public.condominiums 
ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Atualizar condominios existentes: trial_ends_at = created_at + 3 meses
UPDATE public.condominiums 
SET trial_ends_at = created_at + INTERVAL '3 months'
WHERE trial_ends_at IS NULL;

-- Definir valor padrao para novos condominios
ALTER TABLE public.condominiums 
ALTER COLUMN trial_ends_at SET DEFAULT (now() + INTERVAL '3 months');
```

### 2. Atualizar `src/lib/constants.ts`
Adicionar configuracao do periodo de trial:

```typescript
export const TRIAL_CONFIG = {
  durationMonths: 3,
  label: "Teste Gratis",
  features: [
    "Acesso completo por 3 meses",
    "Todas as funcionalidades do plano Pro",
    "Sem necessidade de cartao de credito",
  ],
};
```

### 3. Atualizar Hook `useAllCondominiums.ts`
Incluir o campo `trial_ends_at` na interface e busca:

```typescript
interface Condominium {
  // ... campos existentes
  trial_ends_at: string | null;
}
```

### 4. Atualizar `SuperAdminCondominiums.tsx`
- Mostrar status do trial na tabela (badge "Trial Ativo" ou "Trial Expirado")
- Adicionar campo de data de fim do trial no dialog de edicao
- Calcular e exibir dias restantes do trial

### 5. Atualizar `CondominiumSettingsPage.tsx`
- Mostrar informacoes do trial no card "Informacoes do Sistema"
- Exibir data de expiracao e dias restantes
- Mostrar alerta quando trial estiver proximo de expirar

### 6. Criar Funcao Helper `getTrialStatus`
```typescript
export function getTrialStatus(trialEndsAt: string | null) {
  if (!trialEndsAt) return { isActive: false, daysRemaining: 0 };
  
  const endDate = new Date(trialEndsAt);
  const now = new Date();
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    isActive: daysRemaining > 0,
    daysRemaining: Math.max(0, daysRemaining),
    endDate,
  };
}
```

---

## Interface Visual

### Na Tabela de Condominios (Super Admin)

| Codigo | Nome | Proprietario | Plano | Trial | Criado em |
|--------|------|--------------|-------|-------|-----------|
| 1234 | Residencial X | Joao | Free | 45 dias restantes | 01/02/2026 |
| 5678 | Condo Y | Maria | Pro | Expirado | 15/01/2026 |

### No Dialog de Edicao

```text
+-----------------------------+
| Editar Condominio           |
+-----------------------------+
| Nome: [____________]        |
| Proprietario: [v Selecione] |
| Plano: [v Free]             |
| Data Fim Trial: [01/05/2026]|
| Descricao: [____________]   |
+-----------------------------+
```

### Na Pagina de Configuracoes

```text
+------------------------------------------+
| Informacoes do Sistema                   |
+------------------------------------------+
| Codigo: 1234                             |
| Link: /c/residencial-x                   |
| Plano: Free                              |
| Trial: Ativo - 45 dias restantes         |
| Expira em: 01/05/2026                    |
+------------------------------------------+
```

---

## Resumo das Alteracoes

| Arquivo/Componente | Alteracao |
|--------------------|-----------|
| Banco de Dados | Adicionar coluna `trial_ends_at` com default de +3 meses |
| `src/lib/constants.ts` | Adicionar `TRIAL_CONFIG` |
| `src/lib/utils.ts` | Adicionar funcao `getTrialStatus()` |
| `src/hooks/useAllCondominiums.ts` | Incluir `trial_ends_at` na interface |
| `SuperAdminCondominiums.tsx` | Mostrar status do trial + campo de edicao |
| `CondominiumSettingsPage.tsx` | Exibir informacoes do trial |

---

## Secao Tecnica

### Migracao SQL Completa
```sql
-- Adicionar coluna trial_ends_at
ALTER TABLE public.condominiums 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Definir valor padrao para novos registros
ALTER TABLE public.condominiums 
ALTER COLUMN trial_ends_at SET DEFAULT (now() + INTERVAL '3 months');

-- Atualizar registros existentes (trial de 3 meses a partir da criacao)
UPDATE public.condominiums 
SET trial_ends_at = created_at + INTERVAL '3 months'
WHERE trial_ends_at IS NULL;
```

### Fluxo de Verificacao
1. Sistema busca `trial_ends_at` do condominio
2. Compara com data atual
3. Se `trial_ends_at > now()`: Trial ativo
4. Se `trial_ends_at <= now()`: Trial expirado
5. Exibe status visual apropriado

### Extensao de Trial
O Super Admin pode alterar manualmente a data de `trial_ends_at` para estender ou encurtar o periodo de trial de qualquer condominio.
