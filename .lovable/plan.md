

## Transformar Links em Botoes no Conteudo dos Avisos

### O que sera feito
Atualizar a funcao `linkifyText` para renderizar URLs detectadas no conteudo dos avisos como **botoes estilizados** (com icone de link externo) em vez de links de texto simples sublinhados.

### Como vai ficar
- URLs no conteudo aparecerao como botoes com fundo primario, icone de link externo e texto do dominio
- Links curtos mostrarao a URL limpa (sem http/https)
- Botoes abrirao em nova aba ao clicar
- O resumo (summary) continuara com links inline simples para nao poluir visualmente

### Detalhes Tecnicos

**1. Atualizar `src/lib/utils.ts`**
- Criar nova funcao `linkifyTextWithButtons` que renderiza URLs como botoes usando o componente Button do shadcn (ou estilo equivalente via classes Tailwind)
- Manter a funcao `linkifyText` original para uso no summary
- O botao tera: icone `ExternalLink` do Lucide, texto com dominio limpo (ex: "forms.google.com/...")

**2. Atualizar `src/pages/TimelinePage.tsx`**
- Substituir `linkifyText(announcement.content)` por `linkifyTextWithButtons(announcement.content)` na area de conteudo expandido

**3. Atualizar `src/pages/AdminCondominiumPage.tsx`**
- Mesma substituicao na area de conteudo completo do painel admin
