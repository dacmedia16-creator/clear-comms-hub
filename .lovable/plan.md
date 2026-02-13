

# Corrigir formato do buttonParams no template WhatsApp

## Problema

Apos adicionar `buttonParams[0]`, a API Zion Talk aceita a requisicao (201) mas as mensagens nao sao entregues aos moradores. Antes da alteracao, as mensagens chegavam normalmente.

A variavel do botao CTA no template `aviso_informativo` e `{{1}}` (nao `{{0}}`). Seguindo o padrao da documentacao da Zion Talk, o indice dentro dos colchetes deve corresponder ao numero da variavel no template.

## Alteracoes

### 1. `supabase/functions/send-whatsapp/index.ts`

Trocar:
```
formData.append('buttonParams[0]', condominium.slug);
```
Por:
```
formData.append('buttonParams[1]', condominium.slug);
```

### 2. `supabase/functions/test-whatsapp/index.ts`

Trocar:
```
formData.append('buttonParams[0]', 'demo');
```
Por:
```
formData.append('buttonParams[1]', 'demo');
```

## Validacao

Enviar um teste para o numero 15981788214 e confirmar que a mensagem chega com o botao funcional apontando para `https://avisopro.com.br/c/demo`.
