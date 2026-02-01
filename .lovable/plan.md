
# Exibir Numero Atual do WhatsApp (ENV) no Card de Gerenciamento

## Objetivo
Mostrar o numero de WhatsApp configurado via variavel de ambiente (`ZIONTALK_API_KEY`) na lista de numeros do card de gerenciamento, permitindo que o Super Admin possa visualizar e entender que existe um numero "fallback" configurado no sistema.

---

## Arquitetura da Solucao

### Abordagem
Como a API Key do ambiente nao pode ser gerenciada diretamente pelo frontend (nao podemos habilitar/desabilitar uma variavel de ambiente via interface), a solucao sera:

1. **Exibir indicador visual** mostrando que existe uma API configurada via ambiente
2. **Permitir "migrar"** essa configuracao para o banco de dados para gestao completa

---

## Alteracoes Propostas

### 1. Atualizar Edge Function `test-whatsapp/index.ts`
Retornar informacao sobre a existencia da API Key do ambiente no GET request:

```typescript
if (req.method === 'GET') {
  return new Response(
    JSON.stringify({ 
      apiConfigured: true,
      hasEnvKey: true  // Nova informacao
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### 2. Atualizar `WhatsAppSendersCard.tsx`
Adicionar uma secao mostrando o status da API Key do ambiente:

- Mostrar um card/alerta informativo quando existe uma API Key configurada via ambiente
- Indicar que essa e a "configuracao legada" e sugerir migrar para o banco de dados
- Mostrar status: "Ativo (Fallback)" quando nao houver numeros no banco

### 3. Logica de Fallback Visual
```text
+----------------------------------+
| Configuracao via Ambiente        |
| Status: Ativo como Fallback      |
| [Adicionar ao Banco de Dados]    |
+----------------------------------+
|                                  |
| Numeros Cadastrados              |
| (lista da tabela whatsapp_senders)|
+----------------------------------+
```

---

## Resumo das Alteracoes

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/test-whatsapp/index.ts` | Retornar `hasEnvKey` no GET |
| `src/components/super-admin/WhatsAppSendersCard.tsx` | Adicionar secao de status do ENV |
| `src/hooks/useWhatsAppSenders.ts` | Adicionar funcao para verificar API do ENV |

---

## Secao Tecnica

### Fluxo de Verificacao
1. Ao carregar o card, fazer GET para `test-whatsapp` 
2. Verificar se `hasEnvKey === true`
3. Se sim, mostrar banner informativo sobre a API Key do ambiente
4. Se nao houver numeros no banco E existir ENV key, mostrar como "Fallback Ativo"

### Interface Visual Proposta

```text
+------------------------------------------+
| Numeros de WhatsApp                      |
+------------------------------------------+
| [!] API Key do Ambiente Detectada        |
|     Esta configuracao sera usada como    |
|     fallback se nenhum numero estiver    |
|     cadastrado ou ativo.                 |
|     Status: Ativo (Fallback)             |
+------------------------------------------+
| Nome     | Telefone   | Status | Padrao  |
|----------|------------|--------|---------|
| Numero 1 | (11)99999  |   ON   |   *     |
+------------------------------------------+
```

### Consideracoes de Seguranca
- Nao exibir a API Key do ambiente na interface
- Apenas indicar que ela existe e esta configurada
- O valor da API permanece protegido como secret
