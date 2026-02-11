

# Adaptar Templates WhatsApp para o Modelo Aprovado pela Meta

## Contexto

O template "Aviso informativo" foi aprovado pela Meta com a categoria **Utilidade**. O formato aprovado usa 3 variaveis e um texto fixo padrao:

```
Ola {{nome}}, este e um aviso informativo importante.

{{aviso}}

Para mais informacoes, utilize o acesso indicado.
{{lembrete}}

Este e um comunicado padrao.
```

Com botao CTA dinamico: `Ver detalhes` -> `https://avisopro.com.br/c/{{1}}`

## O que muda

Atualmente existem **16 templates diferentes** (um por categoria), cada um com texto e variaveis diferentes. A ideia e **unificar todos em um unico template aprovado**, ja que a Meta aprovou esse modelo generico que funciona para qualquer categoria.

## Mapeamento de variaveis

| Variavel Meta | Conteudo no sistema |
|---|---|
| `{{nome}}` | Nome do morador/membro (full_name) |
| `{{aviso}}` | Titulo do comunicado (announcement.title) |
| `{{lembrete}}` | Resumo do comunicado (announcement.summary) |
| `{{1}}` (botao) | Slug do condominio (condominium.slug) |

## Arquivos a alterar

### 1. `src/lib/whatsapp-templates.ts` (Frontend)
- Substituir os 16 templates individuais por um unico template universal
- Atualizar a funcao `generateWhatsAppMessage` para aceitar o nome do destinatario como parametro
- Remover o `{link}` do corpo da mensagem (agora fica no botao CTA)
- O template fica:
```
Ola {nome}, este e um aviso informativo importante.

{aviso}

Para mais informacoes, utilize o acesso indicado.
{lembrete}

Este e um comunicado padrao.
```

### 2. `supabase/functions/send-whatsapp/index.ts` (Edge Function)
- Substituir os 6 templates duplicados pelo template unico
- Atualizar a funcao `generateMessage` para incluir o nome do destinatario
- Personalizar cada mensagem com o nome do membro (`member.full_name`)
- Remover o link do corpo (vai no botao CTA da API Meta)

### 3. `src/components/SendWhatsAppButton.tsx`
- Verificar se precisa passar o nome do destinatario na preview da mensagem

## Detalhes tecnicos

- O template unico elimina a necessidade de manter templates sincronizados entre frontend e edge function
- A personalizacao com `{{nome}}` melhora a taxa de abertura
- O link sai do corpo da mensagem e vai para o botao CTA dinamico (quando migrar para API Meta)
- Por enquanto, enquanto ainda usa Zion Talk, o link continua no corpo como fallback
- A estrutura fica preparada para a futura migracao para a API oficial da Meta

