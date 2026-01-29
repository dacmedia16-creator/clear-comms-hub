

# AVISO CD - Plano de Implementação

## Visão Geral
Um SaaS de comunicação oficial para condomínios com design amigável e acessível, onde síndicos publicam avisos em uma linha do tempo e moradores acessam via link privado (não listado publicamente).

---

## Estrutura de Páginas

### Páginas Públicas (Marketing)
- **Landing Page** - Apresentação do produto, benefícios, como funciona, planos e preços
- **Página de Login/Cadastro** - Para síndicos e administradores

### Área do Síndico/Admin
- **Dashboard** - Visão geral dos avisos, estatísticas básicas
- **Criar Aviso** - Formulário completo com todas as opções
- **Lista de Avisos** - Gerenciar avisos existentes, editar, fixar, excluir
- **Configurações do Condomínio** - Nome, logo, preferências de notificação

### Página do Condomínio (Acesso via Link Privado)
- **Timeline de Avisos** - URL única por condomínio (ex: aviso.cd/c/abc123)
- Sem necessidade de login para moradores
- Design otimizado para mobile

---

## Funcionalidades Principais

### Sistema de Avisos
- Criar aviso com: título, categoria (com ícones coloridos), data/hora, resumo, conteúdo completo
- **6 Categorias**: Informativo (azul), Financeiro (verde), Manutenção (laranja), Convivência (roxo), Segurança (vermelho), Urgente (vermelho vibrante com destaque)
- Opção de fixar aviso no topo
- Upload de anexos (PDF, imagens) - até 5MB por arquivo
- Publicação com 1 clique

### Timeline (Moradores)
- Lista cronológica, mais recentes primeiro
- Cards de aviso com: ícone da categoria, título, data, resumo
- Expandir para ver conteúdo completo
- Filtros por categoria (chips coloridos)
- Busca por palavra-chave
- Avisos fixados sempre no topo
- Avisos urgentes com destaque visual especial

### Sistema de Notificações
- **Email**: Ao publicar, envia email com resumo + link direto para o aviso
- **WhatsApp** (via API do Twilio ou similar): Mensagem curta com título + link
- Configurável: síndico pode escolher enviar só email, só WhatsApp, ou ambos

---

## Design Visual (Amigável/Acessível)

- **Cores quentes e acolhedoras**: tons de laranja suave, azul calmo, com backgrounds claros
- **Tipografia**: fontes legíveis, tamanhos generosos (acessível para idosos)
- **Espaçamentos**: cards com bastante respiro, botões grandes e fáceis de clicar
- **Ícones**: simples e intuitivos para cada categoria
- **Mobile-first**: prioridade absoluta para visualização em celular

---

## Arquitetura Técnica

### Frontend
- React com Tailwind CSS (já configurado)
- Componentes shadcn/ui para consistência
- Design responsivo mobile-first

### Backend (Lovable Cloud / Supabase)
- **Tabelas**:
  - `condominiums` (id, nome, slug único, logo_url, configurações)
  - `users` (síndicos/admins vinculados a condomínios)
  - `user_roles` (controle de permissões)
  - `announcements` (avisos com todos os campos)
  - `attachments` (arquivos anexados)
- **Storage**: Bucket para logos e anexos
- **Edge Functions**: Envio de emails e WhatsApp

### Autenticação
- Login para síndicos/admins via email
- Moradores acessam via link privado (sem login)

---

## Estrutura para Planos Pagos (Preparação)
- Limites por plano: quantidade de avisos/mês, tamanho de anexos
- Campo `plan` na tabela de condomínios
- Estrutura pronta para Stripe futuramente

---

## Fluxo de Uso

1. Síndico se cadastra → cria seu condomínio → recebe link privado único
2. Síndico cria aviso → seleciona notificações → publica
3. Sistema envia WhatsApp/Email aos moradores com link
4. Moradores clicam no link → visualizam timeline → leem o aviso completo
5. Todas as informações oficiais ficam registradas na timeline

---

## Entregáveis do MVP

1. Landing page institucional
2. Sistema de cadastro/login para síndicos
3. Dashboard de gestão de avisos
4. Formulário completo de criação de aviso
5. Página pública do condomínio (timeline) com link privado
6. Sistema de filtros e busca
7. Notificações por email (WhatsApp em fase 2 se preferir simplificar)
8. Design mobile-first amigável

