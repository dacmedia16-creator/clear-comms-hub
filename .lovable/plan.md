

User just typed "a" — likely accidental or means "continue with option A" from my previous diagnostic message (submit `remax_corretor` for approval in the Aviso Pro WABA).

Since 201 from Zion Talk = aceito mas não entregue, e o template padrão `aviso_pro_confirma_3` chega normal pelo mesmo canal, o problema é Meta-side: `remax_corretor` não está aprovado no WABA do número 15998312112.

Não há mudança de código a fazer. É ação externa (Meta/Zion Talk).

## Plano: destravar entrega do `remax_corretor`

### Causa raiz confirmada
- Zion Talk retorna `status=201` (request aceito)
- Mensagem nunca chega no WhatsApp do destino
- Template padrão `aviso_pro_confirma_3` chega normal pelo mesmo canal/api_key
- Conclusão: `remax_corretor` **não existe / não está aprovado no WABA do canal Aviso Pro (15998312112)**. Templates Meta são vinculados ao WABA — não dá para usar um template aprovado em outro WABA.

### Ação (fora do código)

1. **Verificar no painel Zion Talk** o log da mensagem para `+5515981788214` enviada às 02:36 com template `remax_corretor` — confirmar se aparece como `failed/rejected` (provável motivo: template not found).

2. **Verificar no Meta Business Manager** → WhatsApp Manager → Templates: o `remax_corretor` aparece aprovado em qual WABA?
   - Se está em outro WABA: precisa **submeter o mesmo template para aprovação no WABA do Aviso Pro** (mesmo nome, mesma estrutura, mesma categoria). Aprovação leva ~minutos a horas.
   - Se não existe em lugar nenhum: criar e submeter pela primeira vez.

3. Após aprovação Meta, **nenhuma mudança no código é necessária** — o sender Aviso Pro com o template `remax_corretor` já está cadastrado corretamente no banco. O envio passa a funcionar automaticamente.

### Alternativa imediata (se não quiser esperar aprovação Meta)
Cadastrar um sender separado **Re/Max** no Super Admin com:
- api_key + número do canal Zion Talk que **realmente tem** `remax_corretor` aprovado no seu WABA
- Vincular o template `remax_corretor` a esse novo sender
- No envio, escolher sender "Re/Max"

### Mudanças de código no projeto
**Nenhuma.** Sistema está correto. Falha está 100% na camada Meta/WABA.

### O que preciso de você para destravar
- Print do painel Zion Talk com o status real (delivered/failed/rejected) da mensagem de teste, **ou**
- Confirmação de em qual WABA o `remax_corretor` foi aprovado, **ou**
- api_key + número do canal Zion Talk que tem o template aprovado (para cadastrar sender separado)

