

## Adicionar template `visita_prova_envio3`

### Alterações

#### 1. `supabase/functions/send-whatsapp/index.ts`
Nenhuma alteração necessária. O template `visita_prova_envio3` tem `{{nome}}` e usa dois botões (`[0]` timeline + `[1]` opt-out), que é exatamente o comportamento padrão (bloco `else` nas linhas 286-289). Ele não precisa ser adicionado a nenhuma lista especial.

#### 2. `src/lib/whatsapp-templates.ts`
Adicionar a constante:
```typescript
export const VISITA3_TEMPLATE_IDENTIFIER = 'visita_prova_envio3';
```

#### 3. `supabase/functions/test-whatsapp/index.ts`
Adicionar a constante para uso em testes manuais:
```typescript
const VISITA3_TEMPLATE_IDENTIFIER = 'visita_prova_envio3';
```

### Resumo
O template se comporta como o `aviso_pro_confirma_3` (template padrão): inclui `{{nome}}`, `{{aviso}}`, `{{lembrete}}`, e dois botões dinâmicos. Basta registrar a constante nos arquivos de referência. O remetente que usar este template deve ter `template_identifier = 'visita_prova_envio3'` configurado na tabela `whatsapp_senders`.

