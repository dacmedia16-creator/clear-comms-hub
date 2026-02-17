
## Landing Page Exclusiva para Condominios - `/condominios`

Criar uma pagina dedicada ao segmento de condominios, otimizada para conversao de sindicos e administradoras, reutilizando a identidade visual e componentes existentes.

---

### Novo arquivo

**`src/pages/CondominiosLandingPage.tsx`** - Pagina completa com todas as 8 secoes inline (sem criar componentes separados, pois sao especificos desta pagina):

#### Secao 1 - Hero
- Badge: "Teste gratuito"
- Headline: "Comunicacao oficial do condominio, sem confusao."
- Subtitulo: "Centralize todos os avisos importantes em uma unica linha do tempo. WhatsApp e e-mail apenas avisam -- a informacao oficial fica registrada."
- CTA: "Criar canal oficial do condominio" (link para `/auth/signup/condominium`)
- Micro texto: "Configuracao rapida. Sem complicacao. Teste gratuito."
- Mockup estatico de celular mostrando "Condominio Jardins" com 3 avisos tipicos (Manutencao Elevadores, Boleto Disponivel, Assembleia Geral) -- mesmo estilo visual do Hero da home

#### Secao 2 - Dor Real do Sindico
- Headline: "O sindico conhece bem esses problemas"
- 5 cards com icones (MessageSquareOff, EyeOff, Search, RefreshCw, FileX):
  1. Avisos importantes se perdem em grupos de WhatsApp
  2. Moradores dizem que nao foram avisados
  3. Informacoes antigas sao dificeis de encontrar
  4. Duvidas repetidas geram retrabalho
  5. Falta de registro formal de comunicacao
- Frase de fechamento: "O condominio precisa de uma fonte oficial de informacao."

#### Secao 3 - Como Funciona (3 passos)
- Headline: "Como funciona?"
- 3 passos com icones (Edit3, Send, Eye):
  1. "Crie o aviso" -- "Escreva o comunicado e escolha a categoria."
  2. "Publique com um clique" -- "WhatsApp e e-mail avisam automaticamente."
  3. "Moradores acessam a linha do tempo" -- "A informacao fica disponivel para consulta a qualquer momento."
- Frase de reforco: "Sem grupo. Sem discussao. Sem ruido."

#### Secao 4 - Beneficios
- Headline: "O que muda na pratica?"
- 4 cards com icone de check:
  1. "Tudo fica registrado" -- "Cada aviso com data e hora. Historico completo e acessivel."
  2. "Reduz conflitos e mal-entendidos" -- "A informacao oficial esta sempre disponivel. Sem espaco para 'eu nao vi'."
  3. "Organizacao por categoria" -- "Financeiro, manutencao, urgente, assembleia... Cada aviso no seu lugar."
  4. "Comprovacao de envio" -- "Historico de comunicados enviados. Protecao para o sindico e a administradora."

#### Secao 5 - Exemplos Reais de Avisos
- Headline: "Exemplos de avisos publicados"
- Subtitulo: "Veja como ficam os comunicados na linha do tempo do condominio."
- 5 cards simulando avisos reais no estilo da timeline:
  1. Urgente - "Interrupcao de agua" (Hoje, 08:30)
  2. Manutencao - "Manutencao dos elevadores" (Ontem, 14:00)
  3. Financeiro - "Boleto de condominio disponivel" (12/02)
  4. Informativo - "Assembleia geral ordinaria" (10/02)
  5. Regras - "Normas para reformas e obras" (05/02)
- Layout de cards empilhados com badge de categoria colorido, simulando a timeline real

#### Secao 6 - Por que nao apenas WhatsApp?
- Layout de comparacao visual (2 colunas):
  - Coluna esquerda (WhatsApp): "E conversa. Conversa se perde." com lista: mensagens se misturam, sem registro, sem organizacao, dificil de encontrar
  - Coluna direita (AVISO PRO): "E registro oficial. O aviso fica organizado, consultavel e permanente." com lista: linha do tempo, categorizado, historico completo, acesso sem login

#### Secao 7 - Privacidade e LGPD
- Reutilizar o mesmo layout visual da TrustSection da home
- Copy adaptada para condominios:
  - "Contatos usados apenas para avisos oficiais do condominio"
  - "Sem propaganda. Sem compartilhamento."
  - "Descadastro a qualquer momento."

#### Secao 8 - CTA Final
- Headline: "Pronto para organizar a comunicacao do seu condominio?"
- Botao: "Criar canal oficial agora"
- Micro texto: "Comece gratuitamente e organize seus avisos hoje mesmo."

---

### Arquivos a alterar

| Arquivo | Mudanca |
|---|---|
| `src/pages/CondominiosLandingPage.tsx` | **Novo** - Pagina completa com todas as secoes |
| `src/App.tsx` | Adicionar rota `/condominios` apontando para `CondominiosLandingPage` |

### Componentes reutilizados
- `Header` e `Footer` da landing (manter navegacao consistente)
- `Button` do shadcn/ui
- Icones do lucide-react
- Classes Tailwind existentes (font-display, bg-muted, etc.)
- Screenshots existentes (timeline, dashboard) na secao de beneficios, se aplicavel

### Nenhum arquivo existente sera modificado alem do App.tsx (nova rota)
