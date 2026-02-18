

## Tornar links clicaveis no conteudo dos avisos

### Problema
O conteudo dos avisos e renderizado como texto puro (`whitespace-pre-wrap`), entao URLs como `https://ozonioterapiavip.com.br/` aparecem como texto simples, sem ser clicavel.

### Solucao
Criar uma funcao utilitaria que detecta URLs no texto e substitui por elementos `<a>` clicaveis. A renderizacao no `TimelinePage.tsx` usara essa funcao em vez de exibir o texto diretamente.

### Detalhes Tecnicos

**1. Nova funcao `linkifyText` em `src/lib/utils.ts`**
- Usa regex para detectar URLs (http/https)
- Retorna array de fragmentos React (strings e elementos `<a>`)
- Links abrem em nova aba com `target="_blank"` e `rel="noopener noreferrer"`
- Estilizados com `text-primary underline`

**2. Alteracao em `src/pages/TimelinePage.tsx`**
- Na linha 390, trocar `{announcement.content}` por `{linkifyText(announcement.content)}`
- Importar a funcao `linkifyText`

### Escopo
- Alteracao em 2 arquivos
- Sem mudancas no banco de dados
- Funciona para qualquer URL no conteudo, incluindo o summary tambem

