

# Corrigir Formato de Telefone no Envio em Massa de WhatsApp

## Problema

O numero `15981788214` nao recebeu a mensagem porque a Edge Function `send-whatsapp` envia o telefone exatamente como esta no banco de dados, sem normalizar para o formato internacional `+55XXXXXXXXXXX` exigido pela API da Zion Talk.

Os telefones estao armazenados em formatos variados:
- `15981788214` (sem prefixo +55)
- `+5515981788214` (ja correto)
- `15 98100-8180` (com espacos e traco)
- `83 8837-9904` (DDD sem o 9 inicial)

Enquanto isso, o `test-whatsapp` ja faz a normalizacao corretamente e por isso o teste manual funciona.

## Solucao

Adicionar uma funcao de normalizacao de telefone na Edge Function `send-whatsapp` que:

1. Remove todos os caracteres nao-numericos (espacos, tracos, parenteses, +)
2. Adiciona o prefixo `55` caso o numero nao comece com `55`
3. Adiciona o `+` no inicio

### Logica de normalizacao

```text
Entrada             -> Limpo        -> Com prefixo    -> Final
15981788214         -> 15981788214  -> 5515981788214  -> +5515981788214
+5515981788214      -> 5515981788214-> 5515981788214  -> +5515981788214
15 98100-8180       -> 15981008180  -> 5515981008180  -> +5515981008180
83 8837-9904        -> 8388379904   -> 55838837990    -> +5583988379904
```

## Arquivo alterado

### `supabase/functions/send-whatsapp/index.ts`

- Adicionar funcao `normalizePhone(phone: string): string` que limpa e formata o telefone
- Aplicar a normalizacao no mapeamento de membros, antes de incluir na lista de envio
- Isso garante que todos os telefones cheguem a API no formato `+55XXXXXXXXXXX`

## O que NAO muda

- Logica de background processing, delays, logs
- Template `aviso_informativo` e bodyParams
- Priorizacao de senders (DB/ENV)
- Filtragem por blocos/unidades
- Edge Function `test-whatsapp` (ja normaliza corretamente)

