

# Plano: Reformular Templates WhatsApp para API Oficial Meta (Categoria Utilidade)

## Problema Atual

Os templates atuais usam linguagem de "AVISO" com emojis excessivos e tom promocional, o que os classifica como **Marketing** na API oficial da Meta (US$ 0,0625/msg). Reformulando para **Utilidade** (US$ 0,008/msg), o custo cai **7,8x**.

## Framework PACTO Aplicado

Cada template seguira:
- **P** - Palavra de Status: "confirmada", "atualizada", "registrada"
- **A** - Apresentacao contextual: identificar a organizacao de forma neutra
- **C** - Clareza e tom informativo: direto, sem hype
- **T** - Acao com tom de servico: "Deseja receber os detalhes?"
- **O** - Omissao de apelos promocionais: zero gatilhos de venda

## Templates Antes vs Depois

### Informativo (template padrao/fallback)

**ANTES:**
```
ℹ️ *AVISO - {nome_condo}*
📋 *{titulo}*
{resumo}
🔗 Acesse o aviso completo:
{link}
```

**DEPOIS:**
```
Atualização confirmada - {nome_condo}

{titulo}

{resumo}

Deseja acessar os detalhes completos?
{link}
```

### Financeiro

**DEPOIS:**
```
Informação financeira atualizada - {nome_condo}

{titulo}

{resumo}

Deseja receber mais detalhes?
{link}
```

### Manutencao

**DEPOIS:**
```
Registro de manutenção confirmado - {nome_condo}

{titulo}

{resumo}

Precisa de mais informações?
{link}
```

### Convivencia

**DEPOIS:**
```
Comunicado registrado - {nome_condo}

{titulo}

{resumo}

Deseja acessar o comunicado completo?
{link}
```

### Seguranca

**DEPOIS:**
```
Atualização de segurança confirmada - {nome_condo}

{titulo}

{resumo}

Deseja ver os detalhes?
{link}
```

### Urgente

**DEPOIS:**
```
Atualização urgente confirmada - {nome_condo}

{titulo}

{resumo}

Acesse agora para mais informações:
{link}
```

### Pedagogico

**DEPOIS:**
```
Informação pedagógica atualizada - {nome_condo}

{titulo}

{resumo}

Deseja receber os detalhes?
{link}
```

### Calendario

**DEPOIS:**
```
Agenda confirmada - {nome_condo}

{titulo}

{resumo}

Deseja acessar o calendário completo?
{link}
```

### RH

**DEPOIS:**
```
Comunicado de RH confirmado - {nome_condo}

{titulo}

{resumo}

Precisa de mais informações?
{link}
```

### Compliance

**DEPOIS:**
```
Atualização de compliance registrada - {nome_condo}

{titulo}

{resumo}

Deseja acessar o documento completo?
{link}
```

### Atendimento

**DEPOIS:**
```
Informação de atendimento confirmada - {nome_condo}

{titulo}

{resumo}

Deseja receber mais detalhes?
{link}
```

### Horarios

**DEPOIS:**
```
Horário atualizado - {nome_condo}

{titulo}

{resumo}

Deseja confirmar os horários?
{link}
```

### Treinos

**DEPOIS:**
```
Informação de treino atualizada - {nome_condo}

{titulo}

{resumo}

Deseja acessar os detalhes?
{link}
```

### Cultos

**DEPOIS:**
```
Programação confirmada - {nome_condo}

{titulo}

{resumo}

Deseja ver a programação completa?
{link}
```

### Pastoral

**DEPOIS:**
```
Comunicado pastoral registrado - {nome_condo}

{titulo}

{resumo}

Precisa de mais informações?
{link}
```

### Eventos

**DEPOIS:**
```
Evento confirmado - {nome_condo}

{titulo}

{resumo}

Deseja receber mais informações?
{link}
```

## Principios Aplicados em Todos os Templates

| Regra | Como foi aplicado |
|-------|-------------------|
| Palavra de status | Cada template usa "confirmada", "atualizada" ou "registrada" |
| Sem emojis excessivos | Removidos todos os emojis (a Meta interpreta emojis como marketing) |
| Tom de servico | Perguntas como "Deseja receber...?", "Precisa de...?" |
| Sem linguagem promocional | Removidos "Confira", "Leia agora", "Veja o comunicado" |
| Apresentacao neutra | Nome da organizacao sem "AVISO" em caixa alta |
| Variaveis coerentes | {titulo}, {resumo}, {link} sao dados objetivos |

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/lib/whatsapp-templates.ts` | Reescrever todos os 16 templates + remover emojis |
| `supabase/functions/send-whatsapp/index.ts` | Reescrever os 6 templates duplicados na edge function |

## Secao Tecnica

### Duplicacao de Templates

Os templates existem em **dois lugares**: no frontend (`whatsapp-templates.ts`) e na edge function (`send-whatsapp/index.ts`). A edge function tem apenas 6 templates (universais), enquanto o frontend tem 16 (universais + segmentos). Ambos serao atualizados.

### Compatibilidade

- As variaveis `{nome_condo}`, `{titulo}`, `{resumo}` e `{link}` permanecem identicas
- A funcao `generateWhatsAppMessage()` nao muda sua assinatura
- Nenhuma alteracao no banco de dados necessaria
- O componente `SendWhatsAppButton` e o hook `useSendWhatsApp` continuam funcionando sem alteracao

