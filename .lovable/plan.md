
## Situação atual

O número `+5515981788214` (Denis) ainda consta com opt-out ativo na tabela `whatsapp_optouts` (opted_out_at = 18/02/2026 20:30). A atualização anterior não foi executada.

## O que precisa ser feito (em ordem)

### Passo 1 — Limpar o opt-out no banco de dados

Executar o UPDATE na tabela `whatsapp_optouts`:

```sql
UPDATE whatsapp_optouts
SET opted_out_at = NULL
WHERE phone = '+5515981788214';
```

Isso remove o bloqueio e o número volta a ser elegível para receber disparos.

### Passo 2 — Realizar o disparo de teste

Após a limpeza do opt-out, acionar um disparo real via painel para um aviso direcionado ao número `+5515981788214`, confirmando que:

- O filtro de opt-out não bloqueia mais o número
- O template `visita_prova_envio` é selecionado corretamente pelo sender "Visita Prova"
- A mensagem chega no WhatsApp

## Arquivos/recursos modificados

- Tabela `whatsapp_optouts` — UPDATE (opted_out_at → NULL) para o número `+5515981788214`
- Nenhum arquivo de código precisa ser alterado
