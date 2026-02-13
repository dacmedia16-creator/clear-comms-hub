

# Corrigir parametro do botao CTA no template WhatsApp

## Problema

O template `aviso_informativo` possui um botao CTA com URL dinamica `https://avisopro.com.br/c/{{1}}`. As Edge Functions enviam apenas `bodyParams`, sem incluir o parametro do botao. Os moradores recebem o texto mas o botao nao funciona.

A imagem da documentacao da Zion Talk confirma o formato correto: parametros sao enviados via FormData com `-F 'chave=valor'`.

## Alteracoes

### 1. `supabase/functions/send-whatsapp/index.ts`

Na funcao `sendMessagesInBackground`, adicionar apos os `bodyParams`:

```
formData.append('buttonParams[0]', condominium.slug);
```

### 2. `supabase/functions/test-whatsapp/index.ts`

Na secao de envio de teste, adicionar apos os `bodyParams`:

```
formData.append('buttonParams[0]', 'demo');
```

## Validacao

Apos o deploy, enviar um teste para confirmar que o botao aparece com a URL `https://avisopro.com.br/c/demo`.

