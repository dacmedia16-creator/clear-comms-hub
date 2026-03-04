

## Adicionar template `visita_prova_envio4`

O screenshot mostra o template `visita_prova_envio4` na Meta Business Suite. Ele tem a mesma estrutura do `visita_prova_envio3`: variáveis `{{nome}}`, `{{aviso}}`, `{{lembrete}}` e dois botões ("Confira os detalhes" no índice [0] e "Bloquear Contato" no índice [1]). Segue o comportamento padrão.

### Alterações

#### 1. `src/lib/whatsapp-templates.ts`
Adicionar constante:
```typescript
export const VISITA4_TEMPLATE_IDENTIFIER = 'visita_prova_envio4';
```

#### 2. `supabase/functions/test-whatsapp/index.ts`
Adicionar constante para referência em testes:
```typescript
const VISITA4_TEMPLATE_IDENTIFIER = 'visita_prova_envio4';
```

#### 3. Edge Functions (`send-whatsapp`, `test-whatsapp`)
Nenhuma alteração de lógica necessária — o template usa o comportamento padrão (bloco `else`): inclui `{{nome}}` e dois botões dinâmicos `[0]`/`[1]`.

#### 4. Configuração
O remetente que usar este template deve ter `template_identifier = 'visita_prova_envio4'` na tabela `whatsapp_senders`.

