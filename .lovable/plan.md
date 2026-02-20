
## Correção: buttonUrlDynamicParams[0] → buttonUrlDynamicParams[1]

### O que o suporte da Zion confirmou

A imagem mostra que o payload correto para `visita_prova_envio` usa **índice 1**, não 0:

```
buttonUrlDynamicParams[1] = test-demo   ✓  (correto)
buttonUrlDynamicParams[0] = test-demo   ✗  (como está agora)
```

### Arquivos a corrigir

**`supabase/functions/test-whatsapp/index.ts`**

Linha com:
```typescript
formData.append('buttonUrlDynamicParams[0]', 'test-demo');
```
Passar para:
```typescript
formData.append('buttonUrlDynamicParams[1]', 'test-demo');
```

**`supabase/functions/send-whatsapp/index.ts`**

Linha com:
```typescript
formData.append('buttonUrlDynamicParams[0]', `${optoutToken}`);
```
Passar para:
```typescript
formData.append('buttonUrlDynamicParams[1]', `${optoutToken}`);
```

### Payload final após a correção

```
mobile_phone               = +55XXXXXXXXXX
template_identifier        = visita_prova_envio
language                   = pt_BR
bodyParams[nome]           = Teste
bodyParams[aviso]          = Mensagem de teste do sistema
bodyParams[lembrete]       = Se você recebeu esta mensagem...
buttonUrlDynamicParams[1]  = test-demo
```

Apenas 2 linhas alteradas — uma em cada Edge Function. Após o deploy, faça um novo disparo de teste para confirmar a entrega.
