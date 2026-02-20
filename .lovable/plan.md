
## Diagnóstico: Número de teste está na blacklist de opt-out

O número `+5515981788214` (Denis) realizou opt-out em 18/02/2026 às 20:30. A função `send-whatsapp` filtra corretamente todos os números com `opted_out_at IS NOT NULL`, por isso o disparo não chegou — não é bug, é o comportamento esperado da proteção de opt-out.

O `test-whatsapp` usa uma rota diferente (envia direto para a API Zion Talk sem passar pelo filtro de opt-out), por isso os testes chegaram normalmente.

## Solução

Remover o opt-out do número `+5515981788214` diretamente no banco de dados, limpando o campo `opted_out_at` para NULL.

Essa operação é um UPDATE na tabela `whatsapp_optouts`:

```sql
UPDATE whatsapp_optouts
SET opted_out_at = NULL
WHERE phone = '+5515981788214';
```

Após essa correção, o número voltará a receber disparos normais.

## O que NÃO precisa mudar

- A lógica de filtro de opt-out está correta e não deve ser alterada
- A função `send-whatsapp` está funcionando como esperado
- O template `visita_prova_envio` está sendo selecionado corretamente

## Arquivo/recurso modificado

- Tabela `whatsapp_optouts` — UPDATE via migration SQL (uma linha)
