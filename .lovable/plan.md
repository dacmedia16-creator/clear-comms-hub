
# Página de Gerenciamento da API WhatsApp

## Visão Geral

Criar uma página administrativa para gerenciar a integração WhatsApp (Zion Talk) com funcionalidades:
1. **Listar todos os condomínios** com status de WhatsApp (ativo/inativo)
2. **Ativar/desativar** WhatsApp para cada condomínio
3. **Enviar mensagem de teste** para validar a configuração
4. **Visualizar logs** de envios recentes

---

## Nova Rota: `/super-admin/whatsapp`

### Acesso
- Somente Super Admins (protegido pelo `SuperAdminGuard`)
- Link adicionado no menu do `SuperAdminDashboard`

---

## Layout da Página

```text
┌─────────────────────────────────────────────────────────────────┐
│  🔔 Super Admin                            [ Atualizar ] [Sair] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  API WhatsApp (Zion Talk)                                       │
│  Gerencie a integração de notificações via WhatsApp             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Status da API: 🟢 Configurada    [ Enviar Teste Global ] │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Condomínios                                                    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Nome              │ Plano  │ WhatsApp │ Ações              │ │
│  ├───────────────────┼────────┼──────────┼────────────────────┤ │
│  │ Vitrine Esplanada │ Free   │ 🟢 Ativo │ [Toggle] [Testar]  │ │
│  │ Residencial Jardim│ Pro    │ ⚪ Inativo│ [Toggle] [Testar]  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Logs de Envio Recentes                                         │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Data/Hora   │ Condomínio  │ Telefone      │ Status         │ │
│  ├─────────────┼─────────────┼───────────────┼────────────────┤ │
│  │ 29/01 14:30 │ Vitrine     │ (11) 9999-999 │ ✅ Enviado     │ │
│  │ 29/01 14:28 │ Vitrine     │ (11) 8888-888 │ ❌ Falhou      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Funcionalidades Detalhadas

### 1. Status da API
- Verifica se a `ZIONTALK_API_KEY` está configurada (via edge function de teste)
- Mostra indicador visual: 🟢 Configurada / 🔴 Não configurada

### 2. Tabela de Condomínios
- Lista todos os condomínios com:
  - Nome e plano
  - Status atual do WhatsApp (`notification_whatsapp`)
  - Toggle para ativar/desativar
  - Botão "Testar" para envio de mensagem de teste

### 3. Ação de Toggle
- Atualiza `notification_whatsapp` na tabela `condominiums`
- Feedback visual imediato com toast

### 4. Envio de Teste
- Cria uma edge function `test-whatsapp` que:
  - Recebe um telefone de destino (input do super admin)
  - Envia uma mensagem padrão de teste
  - Retorna sucesso ou erro
- Modal para inserir número de telefone antes de enviar

### 5. Logs de Envio
- Tabela mostrando registros da `whatsapp_logs`:
  - Data/hora do envio
  - Nome do condomínio
  - Telefone do destinatário
  - Status (enviado/falhou)
  - Mensagem de erro (se houver)

---

## Arquivos a Criar/Modificar

### Novos Arquivos:
1. `src/pages/super-admin/SuperAdminWhatsApp.tsx` - Página principal
2. `supabase/functions/test-whatsapp/index.ts` - Edge function para teste

### Arquivos Modificados:
1. `src/App.tsx` - Adicionar rota `/super-admin/whatsapp`
2. `src/pages/super-admin/SuperAdminDashboard.tsx` - Adicionar card de acesso

---

## Detalhes Técnicos

### Hook para Carregar Dados

```typescript
// Buscar condomínios com status WhatsApp
const { data: condominiums } = await supabase
  .from("condominiums")
  .select("id, name, slug, plan, notification_whatsapp")
  .order("name");

// Buscar logs recentes
const { data: logs } = await supabase
  .from("whatsapp_logs")
  .select(`
    *,
    condominiums:condominium_id (name)
  `)
  .order("sent_at", { ascending: false })
  .limit(50);
```

### Toggle WhatsApp

```typescript
const toggleWhatsApp = async (condoId: string, enabled: boolean) => {
  await supabase
    .from("condominiums")
    .update({ notification_whatsapp: enabled })
    .eq("id", condoId);
};
```

### Edge Function: test-whatsapp

```typescript
// Recebe: { phone: string, condominiumId?: string }
// Envia mensagem de teste via Zion Talk
// Registra na whatsapp_logs com announcement_id = null
```

---

## Fluxo de Teste

1. Super Admin clica em "Testar" em um condomínio
2. Abre modal pedindo número de telefone
3. Ao confirmar, chama edge function `test-whatsapp`
4. Exibe resultado (sucesso ou erro)
5. Registra tentativa na tabela `whatsapp_logs`

---

## Resumo das Mudanças

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/pages/super-admin/SuperAdminWhatsApp.tsx` | Criar | Página completa de gerenciamento |
| `supabase/functions/test-whatsapp/index.ts` | Criar | Edge function para teste de envio |
| `src/App.tsx` | Modificar | Adicionar rota `/super-admin/whatsapp` |
| `src/pages/super-admin/SuperAdminDashboard.tsx` | Modificar | Adicionar card "API WhatsApp" |
