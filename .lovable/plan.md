

## Reestruturar a Home do AVISO PRO -- Novo Posicionamento Estrategico

Reescrita completa do conteudo e estrutura da landing page para refletir o posicionamento de **Canal Oficial de Comunicacao**, com foco em clareza, confianca e conversao.

---

### Nova Estrutura da Home (7 secoes)

A pagina seguira esta ordem:

```text
1. Header (manter, ajustar nav links)
2. Hero Section (reescrever)
3. Secao Problema (nova)
4. Secao Solucao / Como Funciona (reescrever HowItWorks)
5. Secao Beneficios (reescrever FeatureShowcase)
6. Secao Para Quem E (simplificar SegmentGrid)
7. Secao Confianca e Privacidade (reescrever TrustSection)
8. CTA Final (reescrever)
9. Footer (manter)
10. SalesChatbot (manter)
```

### Secoes Removidas

| Componente | Motivo |
|---|---|
| `HighlightsBar` | Foco em "novidades" tecnicas, nao no posicionamento |
| `UseCaseTabs` | Muito detalhado, dispersa atencao. A secao "Para Quem E" ja cobre os segmentos |
| `TerminologyShowcase` | Detalhe tecnico que nao contribui para a decisao de compra |

---

### Copywriting por secao

#### 1. Hero Section

- **Badge**: "3 meses gratis para testar"
- **Headline**: "O canal oficial de avisos da sua organizacao."
- **Subtitulo**: "Uma linha do tempo com tudo registrado. WhatsApp e e-mail apenas lembram. A informacao oficial fica aqui."
- **CTA principal**: "Criar meu canal oficial" (link para /auth/signup)
- **CTA secundario**: "Ver demonstracao" (link para /demo)
- **Micro-beneficios abaixo do CTA**:
  - "Sem grupo de WhatsApp"
  - "Tudo registrado com data e hora"
  - "3 meses gratis, sem cartao"
- **Manter**: mockup do celular rotativo (ja funciona bem como prova visual)
- **Manter**: link "Indique para seu sindico"
- **Remover**: lista de segmentos no rodape do hero (ja tera secao propria)

#### 2. Secao Problema (nova -- `ProblemSection`)

- **Headline**: "A comunicacao da sua organizacao esta espalhada?"
- **4 cards de dor** com icones:
  1. **Avisos perdidos em grupos** -- "Mensagens importantes somem entre memes, audios e conversas paralelas."
  2. **'Eu nao vi'** -- "Moradores e membros dizem que nao foram avisados. Sem registro, nao ha como comprovar."
  3. **Informacao dificil de encontrar** -- "Precisa de um aviso antigo? Boa sorte rolando o historico do grupo."
  4. **Desgaste para quem comunica** -- "Repetir a mesma informacao varias vezes gera retrabalho e frustracao."
- **Frase de fechamento**: "Isso gera ruido, retrabalho e desgaste. Existe uma forma melhor."

#### 3. Secao Solucao / Como Funciona (reescrever `HowItWorks`)

- **Headline**: "Como funciona?"
- **Subtitulo**: "Sem grupo. Sem discussao. Sem confusao."
- **4 passos** (manter layout visual atual com icones e numeracao):
  1. "Crie o aviso" -- "Escreva o comunicado e escolha a categoria."
  2. "Publique na linha do tempo" -- "O aviso fica registrado com data e hora."
  3. "WhatsApp e e-mail lembram" -- "Todos recebem um lembrete com o link. So isso."
  4. "Consulta sempre disponivel" -- "A informacao fica acessivel a qualquer momento."

(A copy ja esta muito proxima do ideal -- ajustes minimos.)

#### 4. Secao Beneficios (reescrever `FeatureShowcase`)

- **Headline**: "Por que usar um canal oficial?"
- **Subtitulo**: "Clareza, registro e menos ruido na comunicacao."
- **4 beneficios** (manter layout alternado com screenshots):
  1. "Tudo fica registrado" -- "Cada aviso tem data, hora e fica disponivel para consulta. Fim do 'eu nao vi'."
  2. "Encontre rapido o que importa" -- "Urgente, financeiro, manutencao... Cada tipo de aviso no seu lugar."
  3. "Voce comprova que comunicou" -- "Historico completo de avisos enviados. Documentacao que protege o gestor."
  4. "Ninguem pode dizer que nao viu" -- "WhatsApp e e-mail lembram sobre o novo comunicado. A informacao oficial esta na linha do tempo."

(Esta secao ja esta excelente -- manter copy e screenshots.)

#### 5. Secao Para Quem E (simplificar `SegmentGrid`)

- **Headline**: "Para todo tipo de organizacao"
- **Subtitulo**: "O AVISO PRO se adapta a linguagem e necessidades do seu segmento."
- **Grid com 7 cards** (manter visual atual):
  - Condominios (destaque principal)
  - Escolas e Cursos
  - Clinicas e Saude
  - Empresas
  - Associacoes e Clubes
  - Igrejas
  - Franquias
- **Remover**: texto "Passe o mouse para ver a terminologia" (hover nao funciona em mobile)
- **Simplificar**: mostrar apenas icone + nome + descricao curta. Sem hover effect de terminologia

#### 6. Secao Confianca e Privacidade (reescrever `TrustSection`)

- **Headline**: "Seus contatos protegidos"
- **Subtitulo**: "Privacidade e transparencia em cada comunicacao."
- **3 itens** (manter layout atual):
  1. "Apenas avisos oficiais" -- "Os contatos sao usados exclusivamente para enviar comunicados importantes."
  2. "Sem propaganda, sem spam" -- "Nenhum dado e compartilhado com terceiros. Sem publicidade."
  3. "Descadastro a qualquer momento" -- "Qualquer pessoa pode optar por nao receber mais notificacoes."

(Copy ja esta alinhada -- manter.)

#### 7. CTA Final

- **Headline**: "Centralize a comunicacao oficial da sua organizacao"
- **Subtitulo**: "Teste gratis por 3 meses. Sem cartao, sem compromisso."
- **Botao**: "Criar meu canal oficial"

---

### Detalhes tecnicos

#### Arquivos a alterar

| Arquivo | Acao |
|---|---|
| `src/pages/Index.tsx` | Remover imports de HighlightsBar, UseCaseTabs, TerminologyShowcase. Reordenar secoes: Hero, ProblemSection, HowItWorks, FeatureShowcase, SegmentGrid, TrustSection, CTA |
| `src/components/landing/Hero.tsx` | Reescrever headline, subtitulo e micro-beneficios. Manter mockup rotativo e badges |
| `src/components/landing/SegmentGrid.tsx` | Simplificar: remover hover de terminologia e texto instrucional. Mudar titulo. Manter grid de cards |
| `src/components/landing/HowItWorks.tsx` | Ajustes minimos de copy (ja esta alinhado) |
| `src/components/landing/FeatureShowcase.tsx` | Manter como esta (copy ja excelente) |
| `src/components/landing/TrustSection.tsx` | Manter como esta (copy ja alinhada) |
| `src/components/landing/Header.tsx` | Atualizar links de navegacao para novas secoes (Problema, Como funciona, Beneficios) |

#### Arquivo novo

| Arquivo | Descricao |
|---|---|
| `src/components/landing/ProblemSection.tsx` | Nova secao com 4 cards de dores + frase de fechamento |

#### Arquivos nao deletados (permanecem no projeto, apenas nao importados na Index)

- `HighlightsBar.tsx`
- `UseCaseTabs.tsx`
- `TerminologyShowcase.tsx`

#### CTA final

O bloco de CTA final continua inline no `Index.tsx`, com headline e subtitulo atualizados.

