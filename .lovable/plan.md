

## Landing Pages por Segmento + Links na Home

Criar 6 novas landing pages dedicadas (Empresas, Clinicas, Associacoes, Igrejas, Franquias, Escolas) seguindo a mesma estrutura da `/condominios` existente, e atualizar a Home para linkar todos os cards.

---

### Paginas novas (6 arquivos)

Todas seguem a mesma estrutura de 8 secoes da `CondominiosLandingPage.tsx`: Hero, Dores, Como Funciona, Beneficios, Exemplos de Avisos, WhatsApp vs AVISO PRO, LGPD, CTA Final. Cada uma com Header e Footer reutilizados.

#### 1. `src/pages/EmpresasLandingPage.tsx` -- `/empresas`

| Campo | Conteudo |
|---|---|
| Headline | "Quadro de avisos oficial para sua equipe." |
| Subtitulo | "Tudo que e importante fica registrado. WhatsApp e e-mail so alertam." |
| Mockup | "Equipe Operacional" com avisos: Mudanca de Turno, Procedimento de Seguranca, Politica Interna |
| Dores | Time operacional nao le e-mail; informacoes se perdem; mudanca de turno confunde; comunicados sem registro |
| Exemplos | Mudanca de turno (Urgente), Procedimento de seguranca (Seguranca), Atualizacao de politica (Informativo) |
| CTA | "Centralizar avisos da empresa" |
| Signup link | `/auth/signup/company` |

#### 2. `src/pages/ClinicasLandingPage.tsx` -- `/clinicas`

| Campo | Conteudo |
|---|---|
| Headline | "Comunicados oficiais para clinica, equipe e pacientes." |
| Subtitulo | "Avisos organizados e consultaveis. WhatsApp e e-mail so avisam." |
| Mockup | "Clinica Saude Integral" com avisos: Mudanca de Horario, Novo Protocolo, Manutencao do Sistema |
| Dores | Alteracoes de agenda; orientacoes importantes perdidas; mudancas de protocolo; ruido com pacientes |
| Exemplos | Mudanca de horario (Urgente), Novo protocolo (Protocolo), Manutencao do sistema (Informativo) |
| CTA | "Criar canal oficial da clinica" |
| Signup link | `/auth/signup/healthcare` |

#### 3. `src/pages/AssociacoesLandingPage.tsx` -- `/associacoes`

| Campo | Conteudo |
|---|---|
| Headline | "Avisos importantes para associados, em um so lugar." |
| Subtitulo | "Timeline oficial + lembretes por WhatsApp e e-mail." |
| Mockup | "Clube Atlantico" com avisos: Evento do Fim de Semana, Mudanca de Regulamento, Pagamento |
| Dores | Avisos de eventos se perdem; regras nao ficam claras; associados reclamam "nao vi" |
| Exemplos | Evento do fim de semana (Evento), Mudanca de regulamento (Regras), Taxa/pagamento (Financeiro) |
| CTA | "Criar canal oficial do clube" |
| Signup link | `/auth/signup/community` |

#### 4. `src/pages/IgrejasLandingPage.tsx` -- `/igrejas`

| Campo | Conteudo |
|---|---|
| Headline | "Comunicacao oficial da igreja, clara e organizada." |
| Subtitulo | "Avisos em timeline unica. WhatsApp e e-mail so lembram." |
| Mockup | "Igreja Nova Alianca" com avisos: Agenda Semanal, Evento Especial, Comunicado Importante |
| Dores | Avisos de cultos e eventos perdidos; mudancas de agenda; comunicacao espalhada |
| Exemplos | Agenda semanal (Informativo), Evento especial (Evento), Comunicado importante (Urgente) |
| CTA | "Criar canal oficial da igreja" |
| Signup link | `/auth/signup/church` |

#### 5. `src/pages/FranquiasLandingPage.tsx` -- `/franquias`

| Campo | Conteudo |
|---|---|
| Headline | "Comunicacao oficial da franqueadora para toda a rede." |
| Subtitulo | "Avisos padronizados e registrados, com lembretes por WhatsApp e e-mail." |
| Mockup | "Rede FastFood Brasil" com avisos: Campanha do Mes, Atualizacao de Padrao, Mudanca de Fornecedor |
| Dores | Comunicacao inconsistente; franqueado perde comunicado; mudanca de padrao sem registro |
| Exemplos | Campanha do mes (Marketing), Atualizacao de padrao (Padrao), Mudanca de fornecedor (Operacional) |
| CTA | "Centralizar avisos da rede" |
| Signup link | `/auth/signup/franchise` |

#### 6. `src/pages/EscolasLandingPage.tsx` -- `/escolas`

| Campo | Conteudo |
|---|---|
| Headline | "Avisos oficiais para pais e alunos, sem ruido." |
| Subtitulo | "WhatsApp avisa. A informacao oficial fica registrada em uma timeline consultavel." |
| Mockup | "Colegio Nova Geracao" com avisos: Reuniao de Pais, Calendario de Provas, Mudanca de Horario |
| Dores | Pais dizem que nao viram; grupos viram caos; avisos antigos somem |
| Exemplos | Reuniao de pais (Pedagogico), Calendario de provas (Academico), Mudanca de horario (Urgente) |
| CTA | "Criar canal oficial da escola" |
| Signup link | `/auth/signup/school` |

---

### Arquivos a alterar

#### `src/App.tsx`
Adicionar 6 novas rotas:
- `/empresas` -> `EmpresasLandingPage`
- `/clinicas` -> `ClinicasLandingPage`
- `/associacoes` -> `AssociacoesLandingPage`
- `/igrejas` -> `IgrejasLandingPage`
- `/franquias` -> `FranquiasLandingPage`
- `/escolas` -> `EscolasLandingPage`

#### `src/components/landing/SegmentGrid.tsx`
Adicionar `link` a todos os segmentos:

| Segmento | Link |
|---|---|
| Condominios | `/condominios` (ja existe) |
| Clinicas e Saude | `/clinicas` |
| Empresas | `/empresas` |
| Associacoes e Clubes | `/associacoes` |
| Igrejas | `/igrejas` |
| Franquias | `/franquias` |
| Escolas e Cursos | `/escolas` |

#### `src/components/landing/Header.tsx`
Remover o link individual "Condominios" do header (agora todos os segmentos estao acessiveis pelo grid; manter nav limpa com apenas "Como funciona", "Beneficios", "Para quem e").

---

### Resumo de entregas

- 6 novos arquivos de pagina
- 6 novas rotas no App.tsx
- SegmentGrid atualizado com links para todas as landings
- Header simplificado (sem link avulso de Condominios)
- Copy, exemplos e CTAs especificos por segmento
- Estrutura identica a da landing de Condominios ja existente

