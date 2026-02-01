

# Corrigir test-whatsapp para Buscar API Key do Banco de Dados

## Problema Identificado
A funcao `test-whatsapp` usa **apenas** a variavel de ambiente `ZIONTALK_API_KEY` (linha 32), enquanto a funcao `send-whatsapp` corretamente busca primeiro a API Key do banco de dados `whatsapp_senders` (linhas 230-246) e so usa o ENV como fallback.

Isso significa que o teste de disparo esta usando uma API Key diferente da que sera usada no envio real!

## Comparacao do Codigo Atual

**test-whatsapp (INCORRETO):**
```typescript
const ZIONTALK_API_KEY = Deno.env.get('ZIONTALK_API_KEY');
const authHeader = 'Basic ' + encode(`${ZIONTALK_API_KEY}:`);
```

**send-whatsapp (CORRETO):**
```typescript
let apiKey = Deno.env.get('ZIONTALK_API_KEY');
const { data: senders } = await supabase
  .from('whatsapp_senders')
  .select('*')
  .eq('is_active', true)
  .order('is_default', { ascending: false })
  .limit(1);

if (senders && senders.length > 0) {
  apiKey = senders[0].api_key;
}
```

---

## Solucao Proposta

Atualizar `test-whatsapp/index.ts` para usar a mesma logica de selecao de remetente que `send-whatsapp`:

1. Criar cliente Supabase no inicio
2. Buscar o sender ativo e padrao da tabela `whatsapp_senders`
3. Usar a API Key do banco se disponivel
4. Usar ENV como fallback
5. Logar qual fonte de API Key esta sendo usada

---

## Alteracao no Arquivo

**Arquivo:** `supabase/functions/test-whatsapp/index.ts`

**Alteracao:** Modificar a logica de obtencao da API Key (linhas 31-54) para:

```typescript
// Create Supabase client with service role
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Fetch the sender to use (default first, then first active, then fallback to env)
let apiKey = Deno.env.get('ZIONTALK_API_KEY');
let apiSource = 'ENV_FALLBACK';

const { data: senders, error: sendersError } = await supabase
  .from('whatsapp_senders')
  .select('*')
  .eq('is_active', true)
  .order('is_default', { ascending: false })
  .limit(1);

if (sendersError) {
  console.error("Error fetching whatsapp_senders:", sendersError);
} else if (senders && senders.length > 0) {
  const sender = senders[0];
  apiKey = sender.api_key;
  apiSource = `DB: ${sender.name} (${sender.phone})`;
  console.log(`Using sender from database: ${sender.name} (${sender.phone})`);
} else {
  console.log("No active senders found, using ENV fallback");
}

// Check if API key is configured (GET request)
if (req.method === 'GET') {
  return new Response(
    JSON.stringify({ 
      apiConfigured: !!apiKey,
      hasEnvKey: !!Deno.env.get('ZIONTALK_API_KEY'),
      hasDbSenders: senders && senders.length > 0
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

if (!apiKey) {
  console.error("No API key available");
  return new Response(
    JSON.stringify({ success: false, error: "API key não configurada", apiConfigured: false }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

console.log(`API Key source: ${apiSource}`);
const authHeader = 'Basic ' + encode(`${apiKey}:`);
```

---

## Beneficios

1. **Consistencia**: Teste usara a mesma API Key que o envio real
2. **Diagnostico**: Logs mostrarao de onde veio a API Key usada
3. **Validacao Real**: O teste realmente validara o numero que sera usado em producao

---

## Resumo das Alteracoes

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/test-whatsapp/index.ts` | Adicionar busca de sender do banco de dados antes de usar ENV fallback |

