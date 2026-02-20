
## Alteração: bodyParams posicionais → buttonUrlDynamicParams no test-whatsapp

### Contexto

No `test-whatsapp/index.ts`, quando o template usado não é o padrão (`aviso_pro_confirma_3`), o código envia os parâmetros posicionais assim:

```
bodyParams[1] = 'Teste'
bodyParams[2] = 'Mensagem de teste do sistema'
bodyParams[3] = 'Se você recebeu esta mensagem...'
```

A alteração solicitada é renomear essas chaves para `buttonUrlDynamicParams`:

```
buttonUrlDynamicParams[1] = 'Teste'
buttonUrlDynamicParams[2] = 'Mensagem de teste do sistema'
buttonUrlDynamicParams[3] = 'Se você recebeu esta mensagem...'
```

### Arquivo alterado

**`supabase/functions/test-whatsapp/index.ts`** — linhas 114-116:

```typescript
// ANTES
formData.append('bodyParams[1]', 'Teste');
formData.append('bodyParams[2]', 'Mensagem de teste do sistema');
formData.append('bodyParams[3]', 'Se você recebeu esta mensagem, a integração está funcionando corretamente!');

// DEPOIS
formData.append('buttonUrlDynamicParams[1]', 'Teste');
formData.append('buttonUrlDynamicParams[2]', 'Mensagem de teste do sistema');
formData.append('buttonUrlDynamicParams[3]', 'Se você recebeu esta mensagem, a integração está funcionando corretamente!');
```

### O que NÃO muda

- A lógica de seleção de template (`templateToUse`) permanece igual.
- O bloco `else` (template padrão com `bodyParams[nome]`, `bodyParams[aviso]`, `bodyParams[lembrete]` + `buttonUrlDynamicParams[0]` e `[1]`) não é tocado.
- O `send-whatsapp/index.ts` não é alterado nesta mudança.

### Resultado

O payload enviado para a Zion Talk no disparo de teste com o template `visita_prova_envio` passará a usar `buttonUrlDynamicParams` no lugar de `bodyParams` para os parâmetros posicionais.
