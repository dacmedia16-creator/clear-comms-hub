

# Plano: Reposicionamento Completo do Site AVISO PRO

## Visão Geral

Atualização completa do site para comunicar claramente que o AVISO PRO é um **canal oficial de comunicação**, não uma ferramenta de conversa ou rede social. A frase central "Quando é importante, vira AVISO" será reforçada em todos os pontos de contato.

---

## 1. Hero Section (Hero.tsx)

### Mudanças no Texto

| Elemento | Atual | Novo |
|----------|-------|------|
| **Headline** | "Quando é importante, vira AVISO." | **Mantém** (já está perfeita) |
| **Subtítulo** | "Centralize toda a comunicação oficial do seu condomínio em uma única timeline. WhatsApp e e-mail apenas avisam – a verdade oficial está aqui." | "O canal oficial de avisos da sua organização. Uma linha do tempo. Tudo registrado. WhatsApp e e-mail apenas lembram." |
| **CTA Principal** | "Começar agora" | "Criar meu canal oficial" |
| **Badges de benefícios** | "Configuração em 2 minutos" | "Sem grupo de WhatsApp" |

### Nova Seção de Segmentos

Adicionar após os badges uma linha sutil:

"Para condomínios, escolas, empresas, clínicas, associações e igrejas."

### Mockup Visual

Atualizar texto interno do mockup:
- Header: "Canal Oficial" (ao invés de apenas "Avisos Oficiais")

---

## 2. Seção "Como Funciona" (HowItWorks.tsx)

### Reestruturar em 4 Passos Claros

| Passo | Título Atual | Novo Título | Nova Descrição |
|-------|--------------|-------------|----------------|
| 01 | "Cadastre seu Condomínio" | "Crie o aviso" | "Escreva o comunicado importante e escolha a categoria." |
| 02 | "Crie seus Avisos" | "Publique na linha do tempo" | "O aviso fica registrado oficialmente, com data e hora." |
| 03 | "Publique e Notifique" | "WhatsApp e e-mail avisam" | "Todos recebem um lembrete com o link. Só isso." |
| 04 | "Moradores Visualizam" | "Consulta sempre disponível" | "A informação fica acessível a qualquer momento. Sem login." |

### Novo Subtítulo da Seção

**Atual:** "Em 4 passos simples, sua comunicação com os moradores será transformada."

**Novo:** "Sem grupo. Sem confusão. Sem perda de informação."

---

## 3. Seção de Funcionalidades (FeatureShowcase.tsx)

### Reescrever Focando em Benefícios

| Funcionalidade | Título Atual | Novo Título | Nova Descrição |
|----------------|--------------|-------------|----------------|
| Timeline | "Timeline Cronológica" | "Tudo fica registrado" | "Cada aviso tem data, hora e fica disponível para consulta. Fim do 'eu não vi'." |
| Filtros | "Filtros por Categoria" | "Encontre rápido o que importa" | "Urgente, financeiro, manutenção... Cada tipo de aviso no seu lugar." |
| Dashboard | "Dashboard do Síndico" | "Você comprova que comunicou" | "Histórico completo de avisos enviados. Documentação que protege o gestor." |
| Notificações | "Notificações Instantâneas" | "Ninguém pode dizer que não viu" | "WhatsApp e e-mail avisam sobre o novo comunicado. A informação oficial está na linha do tempo." |

### Atualizar Header da Seção

**Atual:** "Conheça o sistema por dentro" / "Veja como o Mural Digital facilita..."

**Novo:** "Por que usar um canal oficial?" / "Clareza, registro e menos ruído na comunicação."

---

## 4. Nova Seção: Confiança e LGPD

Adicionar nova seção entre FeatureShowcase e HowItWorks ou antes do CTA final.

### Conteúdo

**Título:** "Seus contatos protegidos"

**Texto:**
- Os dados são usados apenas para enviar avisos oficiais
- Sem propaganda, sem spam, sem compartilhamento
- Opção de descadastro a qualquer momento

**Ícones sugeridos:** Shield, Lock, UserX (para descadastro)

---

## 5. CTA Final (Index.tsx)

### Atualizar Texto

**Título Atual:** "Pronto para transformar a comunicação do seu condomínio?"

**Novo:** "Crie o canal oficial da sua organização"

**Subtítulo Atual:** "Comece com 3 meses grátis. Sem compromisso, sem cartão de crédito."

**Novo:** "Teste grátis por 3 meses. Sem cartão, sem compromisso."

**Botão Atual:** "Começar teste grátis"

**Novo:** "Criar meu canal oficial"

---

## 6. Footer (Footer.tsx)

### Atualizar Tagline

**Atual:** "O canal oficial de comunicação do seu condomínio."

**Novo:** "O canal oficial de avisos importantes." (mais genérico para outros segmentos)

---

## 7. Header (Header.tsx)

### Pequeno Ajuste no CTA

**Atual:** "Criar conta"

**Novo:** "Criar canal" (mais alinhado com o posicionamento)

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/components/landing/Hero.tsx` | Subtítulo, CTAs, badges, menção a segmentos |
| `src/components/landing/HowItWorks.tsx` | Títulos, descrições, subtítulo da seção |
| `src/components/landing/FeatureShowcase.tsx` | Títulos, descrições, header da seção |
| `src/components/landing/Footer.tsx` | Tagline |
| `src/components/landing/Header.tsx` | CTA "Criar canal" |
| `src/pages/Index.tsx` | Seção CTA final + nova seção LGPD |

---

## Novo Componente a Criar

| Arquivo | Propósito |
|---------|-----------|
| `src/components/landing/TrustSection.tsx` | Seção sobre privacidade e LGPD |

---

## Palavras a Evitar vs Preferir

| Evitar | Preferir |
|--------|----------|
| mural digital | canal oficial |
| plataforma | linha do tempo |
| sistema | avisos importantes |
| ferramenta | registro |
| aplicativo | fonte oficial |

---

## Resultado Esperado

Visitante entende em 10 segundos:
1. AVISO PRO é a **fonte oficial** da informação
2. WhatsApp **só avisa**, não é o canal
3. O aviso **fica registrado**
4. Isso **evita confusão** e protege quem comunica

