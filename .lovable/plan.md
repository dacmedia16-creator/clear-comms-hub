

## Exibir conteudo completo dos avisos na pagina de admin

### Problema
Na pagina de administracao, o card de cada aviso mostra apenas o resumo (summary). O conteudo completo (content) nao e exibido, apesar de existir no banco de dados.

### Solucao
Adicionar um botao "Ver conteudo completo" em cada card de aviso na pagina de admin, usando o mesmo padrao de Collapsible ja utilizado na timeline publica.

### Alteracoes

**Arquivo: `src/pages/AdminCondominiumPage.tsx`**

1. Importar `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` do radix
2. Importar `ChevronDown`, `ChevronUp` do lucide-react
3. Importar `linkifyText` de `@/lib/utils`
4. No card de cada aviso, apos o summary, adicionar:
   - Um botao collapsible "Ver conteudo completo" / "Recolher"
   - Dentro do collapsible, renderizar `announcement.content` com `linkifyText()` e `whitespace-pre-wrap`
5. Adicionar estado `expandedAnnouncementId` para controlar qual aviso esta expandido

### Resultado
O admin podera clicar para ver o conteudo completo de cada aviso diretamente na pagina de gerenciamento, com links clicaveis.
