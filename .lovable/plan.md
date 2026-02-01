

# Atualizar IA de Vendas com Planos Corretos

## Objetivo

Atualizar o sistema prompt do chatbot de vendas para refletir os planos e preços reais configurados no banco de dados.

---

## Problema Atual

O prompt do chatbot tem informações desatualizadas:

| O que diz | O que deveria ser |
|-----------|-------------------|
| Starter R$ 29/mês | Inicial R$ 199/mês |
| Pro R$ 79/mês | Profissional R$ 299/mês |
| Não menciona plano Gratuito | Incluir plano Gratuito |
| Features desatualizadas | Atualizar conforme banco |

---

## Mudanças no Arquivo

**Arquivo:** `supabase/functions/sales-chat/index.ts`

### Atualizar Seção de Planos e Preços

```markdown
## Planos e Preços

| Plano | Preço | Recursos |
|-------|-------|----------|
| **Gratuito** | R$ 0/mês | Até 10 avisos/mês, anexos até 2MB, timeline pública |
| **Inicial** | R$ 199/mês | Até 50 avisos/mês, anexos até 5MB, suporte prioritário, API de integração, Email + WhatsApp |
| **Profissional** | R$ 299/mês | Avisos ilimitados, anexos até 10MB, Email + WhatsApp, relatórios, API de integração |
```

### Adicionar Menção ao Plano Gratuito

Na seção de diferenciais, destacar que existe um plano gratuito para testar:
- **Plano Gratuito disponível** - Comece sem custo com até 10 avisos/mês

### Atualizar Diretrizes

Adicionar instrução para:
- Destacar o plano gratuito como forma de começar sem compromisso
- Sugerir upgrade quando o condomínio crescer

---

## Layout do Prompt Atualizado

O prompt completo terá:

1. **Sobre o AVISO PRO** - Mantém igual
2. **Funcionalidades Principais** - Mantém igual  
3. **Planos e Preços** - Atualizado com 3 planos corretos
4. **Diferenciais** - Adiciona menção ao plano gratuito
5. **Como Funciona** - Mantém igual
6. **Diretrizes de Resposta** - Pequeno ajuste para mencionar gratuito

---

## Seção Técnica

### Código a Alterar

Linhas 23-29 do `supabase/functions/sales-chat/index.ts`:

**De:**
```
## Planos e Preços

| Plano | Preço | Recursos |
|-------|-------|----------|
| **Starter** | R$ 29/mês | 50 avisos/mês, notificações por email, até 100 moradores |
| **Pro** | R$ 79/mês | Avisos ilimitados, WhatsApp + Email, moradores ilimitados, suporte prioritário |
```

**Para:**
```
## Planos e Preços

| Plano | Preço | Recursos |
|-------|-------|----------|
| **Gratuito** | R$ 0/mês | Até 10 avisos/mês, anexos até 2MB, timeline pública |
| **Inicial** | R$ 199/mês | Até 50 avisos/mês, anexos até 5MB, suporte prioritário, API de integração, Email + WhatsApp |
| **Profissional** | R$ 299/mês | Avisos ilimitados, anexos até 10MB, Email + WhatsApp, relatórios, API de integração |

**Teste grátis!** Comece com o plano Gratuito e faça upgrade quando precisar.
```

### Deploy

Após a alteração, a edge function será automaticamente deployada.

