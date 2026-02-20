
## Diagnóstico

A API Zion Talk retorna `201` mesmo quando as variáveis do body não correspondem ao template. A hipótese principal agora é que o template `visita_prova_envio` usa **nomes de variáveis diferentes** de `bodyParams[nome]`, `bodyParams[aviso]`, `bodyParams[lembrete]`.

O template que funcionou diretamente no Zion Talk era "Aviso informativo para Corretor" — provavelmente diferente do `visita_prova_envio`. O que confirma que o número e a API Key funcionam, mas algo no payload do `visita_prova_envio` está incorreto.

## O que será feito

### Estratégia: logar payload completo + testar com parâmetros numéricos

Muitos templates da Meta usam variáveis posicionais (`{{1}}`, `{{2}}`, `{{3}}`), que na Zion Talk são enviadas como `bodyParams[1]`, `bodyParams[2]`, `bodyParams[3]` — e não como chaves nomeadas.

Vamos alterar o `test-whatsapp` para:

1. **Logar o payload exato** antes do fetch (para comparar com o que funciona)
2. **Usar parâmetros numéricos** para o `visita_prova_envio`:
   - `bodyParams[1]` → nome
   - `bodyParams[2]` → aviso
   - `bodyParams[3]` → lembrete

### Arquivo: `supabase/functions/test-whatsapp/index.ts`

Alterar a montagem do FormData para distinguir entre os dois templates:

```typescript
// Para visita_prova_envio: usar índices numéricos ({{1}}, {{2}}, {{3}})
if (templateToUse === VISITA_TEMPLATE_IDENTIFIER) {
  formData.append('bodyParams[1]', 'Teste');
  formData.append('bodyParams[2]', 'Mensagem de teste do sistema');
  formData.append('bodyParams[3]', 'Se você recebeu esta mensagem, a integração está funcionando corretamente!');
} else {
  formData.append('bodyParams[nome]', 'Teste');
  formData.append('bodyParams[aviso]', 'Mensagem de teste do sistema');
  formData.append('bodyParams[lembrete]', 'Se você recebeu esta mensagem, a integração está funcionando corretamente!');
  formData.append('buttonUrlDynamicParams[0]', 'c/demo');
  formData.append('buttonUrlDynamicParams[1]', 'test-demo');
}
```

E adicionar log do payload:

```typescript
const formDataLog: Record<string, string> = {};
for (const [key, value] of formData.entries()) {
  formDataLog[key] = value as string;
}
console.log(`[Test] Payload enviado para Zion Talk:`, JSON.stringify(formDataLog));
```

## Por que isso pode resolver

Templates na Meta Business Suite podem ter variáveis nomeadas (`{{nome}}`) ou posicionais (`{{1}}`). Se o `visita_prova_envio` foi criado com variáveis posicionais e a gente envia `bodyParams[nome]`, a Zion Talk provavelmente ignora os valores — entregando o template com as variáveis em branco ou rejeitando na Meta silenciosamente.

## Próximo passo após o teste

- Se chegar com os parâmetros numéricos: atualizar o `send-whatsapp` para usar a mesma lógica em produção
- Se não chegar: o log exato do payload vai revelar o que está diferente em relação ao envio que funcionou diretamente no Zion Talk

## Arquivos modificados

- `supabase/functions/test-whatsapp/index.ts` — usar parâmetros numéricos para `visita_prova_envio` e logar payload completo
