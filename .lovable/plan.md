

# Painel de Indicacoes de Sindicos no Super Admin

## Objetivo

Criar uma nova pagina no Super Admin para visualizar e gerenciar todas as indicacoes de sindicos recebidas atraves do formulario /indicar-sindico, com capacidade de reenviar notificacoes manualmente.

---

## Arquivos a Criar

### 1. Hook: `src/hooks/useSyndicReferrals.ts`

Novo hook para buscar e gerenciar indicacoes:

```typescript
interface SyndicReferral {
  id: string;
  syndic_name: string;
  syndic_phone: string;
  syndic_email: string;
  condominium_name: string;
  referrer_name: string | null;
  status: string | null;
  notes: string | null;
  whatsapp_sent: boolean | null;
  email_sent: boolean | null;
  created_at: string;
}
```

**Funcionalidades:**
- Buscar todas as indicacoes ordenadas por data
- Atualizar status (pending/contacted/converted/rejected)
- Adicionar notas
- Deletar indicacoes

### 2. Pagina: `src/pages/super-admin/SuperAdminReferrals.tsx`

Nova pagina completa com:

**Header:**
- Link de volta para dashboard
- Icone e titulo "Indicacoes"
- Botao de refresh

**Estatisticas:**
- Total de indicacoes
- Pendentes (WhatsApp ou Email nao enviados)
- Status: pending/contacted/converted/rejected

**Filtros:**
- Busca por nome do sindico, email ou condominio
- Filtro por status (todos/pending/contacted/converted/rejected)
- Filtro por problemas de envio (WhatsApp/Email falhos)

**Tabela (Desktop) / Cards (Mobile):**
- Nome do sindico
- Telefone
- Email
- Condominio
- Quem indicou
- Status do envio (WhatsApp/Email com icones)
- Status geral
- Data de criacao
- Acoes: Reenviar WhatsApp, Reenviar Email, Editar notas, Excluir

**Dialogs:**
- Modal para reenvio manual de WhatsApp/Email
- Modal para editar notas/status
- Confirmacao de exclusao

---

## Arquivos a Modificar

### 3. App.tsx

Adicionar nova rota:

```typescript
<Route path="/super-admin/referrals" element={<SuperAdminReferrals />} />
```

### 4. SuperAdminDashboard.tsx

Adicionar card de acesso rapido para Indicacoes:

```typescript
<Card>
  <CardHeader>
    <UserPlus className="..." />
    <CardTitle>Indicacoes de Sindicos</CardTitle>
    <CardDescription>
      Visualize e gerencie indicacoes recebidas
    </CardDescription>
  </CardHeader>
  <CardContent>
    <span>Total: {stats.totalReferrals}</span>
    <span>Pendentes: {stats.pendingReferrals}</span>
    <Button>Ver Indicacoes</Button>
  </CardContent>
</Card>
```

### 5. Navegacao Mobile (superAdminNavItems)

Como a barra de navegacao ja tem 5 itens (limite visual), a pagina de indicacoes sera acessada pelo Dashboard ou por link direto, sem adicionar ao bottom nav.

---

## Edge Function: Reenvio Manual

### 6. Nova Edge Function: `supabase/functions/resend-referral/index.ts`

Funcao para reenviar notificacoes de indicacoes existentes:

**Request:**
```json
{
  "referralId": "uuid",
  "channel": "whatsapp" | "email" | "both"
}
```

**Logica:**
1. Buscar indicacao pelo ID
2. Validar que existe
3. Reenviar WhatsApp e/ou Email conforme solicitado
4. Atualizar status no banco
5. Retornar resultado

---

## Estrutura da Interface

```text
/super-admin/referrals
+--------------------------------------------------+
|  [<-]  Indicacoes                     [Refresh]  |
+--------------------------------------------------+
|                                                  |
|  +--------+  +--------+  +--------+  +--------+  |
|  | Total  |  |Pendente|  |Contato |  |Convert.|  |
|  |   12   |  |   3    |  |   5    |  |   4    |  |
|  +--------+  +--------+  +--------+  +--------+  |
|                                                  |
|  [Buscar...              ] [Status v] [Envios v] |
|                                                  |
|  +----------------------------------------------+|
|  | Nome        | Telefone | Email    | Status   ||
|  |-------------|----------|----------|----------||
|  | Joao Silva  | 11999..  | j@e.com  | Pending  ||
|  |   WA: [X]   Email: [OK]           [Acoes]   ||
|  +----------------------------------------------+|
|                                                  |
+--------------------------------------------------+
```

---

## Badges de Status de Envio

| Situacao | Badge |
|----------|-------|
| WhatsApp enviado | Icone verde com check |
| WhatsApp falhou | Icone vermelho com X |
| Email enviado | Icone verde com check |
| Email falhou | Icone vermelho com X |

---

## Status de Indicacao

| Status | Cor | Descricao |
|--------|-----|-----------|
| pending | Amarelo | Aguardando contato |
| contacted | Azul | Contato realizado |
| converted | Verde | Converteu em cliente |
| rejected | Vermelho | Nao tem interesse |

---

## Secao Tecnica

### Estrutura de Arquivos

```text
src/
  hooks/
    useSyndicReferrals.ts        [NOVO]
  pages/
    super-admin/
      SuperAdminReferrals.tsx    [NOVO]
  App.tsx                        [MODIFICAR]
  
supabase/
  functions/
    resend-referral/
      index.ts                   [NOVO]
  config.toml                    [MODIFICAR - adicionar funcao]
```

### Hook useSyndicReferrals

```typescript
// Seguindo padrao de useAllCondominiums
export function useSyndicReferrals() {
  const [referrals, setReferrals] = useState<SyndicReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = async () => { /* ... */ };
  const updateStatus = async (id, status) => { /* ... */ };
  const updateNotes = async (id, notes) => { /* ... */ };
  const deleteReferral = async (id) => { /* ... */ };

  return { referrals, loading, error, refetch, updateStatus, updateNotes, deleteReferral };
}
```

### Edge Function resend-referral

```typescript
// Reutiliza logica de send-referral
// - Recebe referralId e channel
// - Busca dados da indicacao no banco
// - Reenvia WhatsApp/Email usando mesmas funcoes
// - Atualiza whatsapp_sent/email_sent
// - Retorna resultado
```

### Componentes da Pagina

1. **Estatisticas** - Cards com contadores
2. **Filtros** - Busca + Select de status + Select de problemas
3. **Tabela/Cards** - Listagem responsiva
4. **Dialogs:**
   - ResendDialog - Para reenviar notificacoes
   - EditNotesDialog - Para editar notas e status
   - DeleteConfirmDialog - Para confirmar exclusao

---

## Resultado Esperado

Apos implementacao:

1. Super Admin acessa /super-admin/referrals
2. Ve todas as indicacoes com status de envio
3. Pode filtrar por status ou problemas de envio
4. Pode reenviar WhatsApp/Email manualmente
5. Pode atualizar status e adicionar notas
6. Pode excluir indicacoes antigas
7. Acesso rapido pelo card no Dashboard

