

User está dizendo que o template `remax_corretor` aprovado tem **Botão 1 estático** (URL fixa, sem variável) e **Botão 2 dinâmico** (com `{{1}}` recebendo o token de optout).

Hoje o código suporta `button_config`:
- `two_buttons` → manda dynamic param em `[0]` e `[1]` (não serve, pois botão 1 é estático)
- `single_button_idx0` → só `[0]`
- `single_button_idx1` → só `[1]` ✓ **é exatamente isso que precisamos**
- `no_buttons`

Solução: atualizar o registro do template `remax_corretor` em `whatsapp_sender_templates` para `button_config = 'single_button_idx1'`. Edge function já trata esse caso corretamente (linhas 296-298 de send-whatsapp/index.ts).

Nenhuma mudança de código. Só uma migração SQL de UPDATE.

## Plano

### Mudança única
UPDATE em `whatsapp_sender_templates` setando `button_config = 'single_button_idx1'` para o template com `identifier = 'remax_corretor'` vinculado ao sender Aviso Pro (15 99831-2112).

### Por que funciona
A edge function `send-whatsapp` já tem o branch:
```ts
} else if (buttonConfig === 'single_button_idx1') {
  formData.append('buttonUrlDynamicParams[1]', `${optoutToken}`);
}
```
Isso envia apenas o parâmetro dinâmico do botão 2 (token de optout), e o botão 1 fica com a URL estática que você definiu na Meta.

### Pré-requisito
Confirmar que o template `remax_corretor` realmente já está aprovado no WABA do canal Aviso Pro (você sinalizou que sim ao descrever a estrutura dos botões).

### Após o update
Testar novamente o envio pelo Super Admin escolhendo template `remax_corretor`. Deve chegar.

### Ações
1. Migração SQL: UPDATE `whatsapp_sender_templates` SET `button_config = 'single_button_idx1'` WHERE `identifier = 'remax_corretor'`.
2. Testar envio.

Nenhum arquivo de código alterado.

