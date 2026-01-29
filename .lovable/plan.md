
# Adicionar Intervalo entre Envios de WhatsApp

## Problema
O envio atual de mensagens WhatsApp é feito de forma sequencial sem nenhum intervalo entre os destinatários. Isso pode causar:
- Bloqueio temporário pela API do ZionTalk/WhatsApp
- Rate limiting por excesso de requisições
- Falha em envios em massa

## Solução
Adicionar um delay aleatório entre 15 e 30 segundos entre cada envio de mensagem para evitar detecção como spam/bot.

## Alteração Necessária

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `supabase/functions/send-whatsapp/index.ts` | Modificar | Adicionar delay entre envios |

## Detalhes Técnicos

### Função de delay com intervalo aleatório

```typescript
// Gera delay aleatório entre min e max segundos
function randomDelay(minSeconds: number, maxSeconds: number): Promise<void> {
  const ms = Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds) * 1000;
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Modificação no loop de envio (linha 176-242)

```typescript
for (let i = 0; i < members.length; i++) {
  const member = members[i];
  const profile = member.profiles;
  
  // Aguardar intervalo ANTES do envio (exceto no primeiro)
  if (i > 0) {
    const delaySeconds = Math.floor(Math.random() * 16) + 15; // 15-30 segundos
    console.log(`Aguardando ${delaySeconds}s antes do próximo envio...`);
    await randomDelay(15, 30);
  }
  
  // ... resto do código de envio ...
}
```

## Fluxo de Envio

```text
┌─────────────────────────────────────────────────────────┐
│ Membro 1: João Silva                                    │
│ └─> Enviar mensagem ✓                                   │
│     └─> Aguardar 15-30 segundos...                      │
├─────────────────────────────────────────────────────────┤
│ Membro 2: Maria Lima                                    │
│ └─> Enviar mensagem ✓                                   │
│     └─> Aguardar 15-30 segundos...                      │
├─────────────────────────────────────────────────────────┤
│ Membro 3: Pedro Santos                                  │
│ └─> Enviar mensagem ✓                                   │
│     └─> (último - sem delay)                            │
└─────────────────────────────────────────────────────────┘
```

## Logs Adicionais

O sistema irá registrar no console:
- Tempo de delay antes de cada envio
- Progresso: "Enviando para membro 2 de 10..."

## Considerações Importantes

### Tempo Total de Execução
- Para 10 moradores: ~3-5 minutos
- Para 50 moradores: ~15-25 minutos
- Para 100 moradores: ~30-50 minutos

### Edge Function Timeout
Edge Functions têm timeout padrão de 60 segundos. Para condomínios com muitos moradores, será necessário:
1. Usar background tasks com `EdgeRuntime.waitUntil()`
2. Retornar resposta imediata ao frontend
3. Processar envios em segundo plano

## Implementação Proposta

A função será modificada para:
1. Retornar resposta imediata ao frontend com status "processando"
2. Executar os envios em background usando `EdgeRuntime.waitUntil()`
3. Usar delay de 15-30 segundos entre cada envio

Isso garante que:
- O frontend não fica travado esperando todos os envios
- Os envios são processados de forma segura sem bloqueio
- O usuário recebe feedback imediato de que o processo iniciou

## Resultado Esperado
- Mensagens enviadas de forma espaçada (15-30s entre cada)
- Menor risco de bloqueio pela API do WhatsApp
- Logs detalhados do progresso de envio
- Frontend recebe resposta imediata sem timeout
