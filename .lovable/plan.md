
## Trocar template WhatsApp para `avisopro_confirma_2`

### Resumo
Substituir o template `aviso_informativo` pelo novo template `avisopro_confirma_2` em todos os pontos do sistema. As variaveis do template sao as mesmas (`nome`, `aviso`, `lembrete`) e o botao CTA dinamico continua igual, entao a unica mudanca e o nome do identificador.

### Arquivos a modificar

**1. `src/lib/whatsapp-templates.ts` (linha 5)**
- Alterar `TEMPLATE_IDENTIFIER` de `'aviso_informativo'` para `'avisopro_confirma_2'`
- Atualizar o texto de preview local para refletir o novo corpo do template ("Confirmado")

**2. `supabase/functions/send-whatsapp/index.ts` (linha 14)**
- Alterar `TEMPLATE_IDENTIFIER` de `'aviso_informativo'` para `'avisopro_confirma_2'`

**3. `supabase/functions/test-whatsapp/index.ts` (linha 10)**
- Alterar `TEMPLATE_IDENTIFIER` de `'aviso_informativo'` para `'avisopro_confirma_2'`
- Atualizar comentario na linha 97

### O que NAO muda
- Variaveis `bodyParams[nome]`, `bodyParams[aviso]`, `bodyParams[lembrete]` permanecem iguais
- `buttonUrlDynamicParams[0]` com prefixo `c/slug` permanece igual
- Idioma `pt_BR` permanece igual
- Logica de envio, delays e fallback de remetente nao mudam
