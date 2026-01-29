

# Plano: Templates de WhatsApp por Categoria

## Resumo

Criar templates padrao de mensagem WhatsApp para cada categoria de aviso, com texto formatado e link direto para a timeline publica (sem necessidade de login).

---

## Analise do Contexto

### Categorias Existentes

| Categoria | Emoji Sugerido | Tom da Mensagem |
|-----------|----------------|-----------------|
| Informativo | ℹ️ | Neutro, informativo |
| Financeiro | 💰 | Formal, importante |
| Manutencao | 🔧 | Pratico, objetivo |
| Convivencia | 🤝 | Amigavel, comunitario |
| Seguranca | 🔒 | Serio, atencao |
| Urgente | ⚠️ | Alerta, acao imediata |

### URL da Timeline

A timeline e acessada via: `https://clear-comms-hub.lovable.app/c/{slug}`

- Nao requer login
- Qualquer pessoa com o link pode visualizar
- URL unica por condominio

---

## Implementacao

### 1. Criar Constantes de Templates

Adicionar ao arquivo `src/lib/constants.ts` os templates de mensagem para cada categoria.

### 2. Criar Componente de Compartilhamento

Novo componente `WhatsAppShareButton` que:
- Recebe o aviso e dados do condominio
- Gera a mensagem formatada baseada na categoria
- Abre o WhatsApp com a mensagem pre-preenchida

### 3. Integrar ao Fluxo de Criacao

Apos publicar um aviso, exibir opcao de compartilhar via WhatsApp com o template ja preenchido.

### 4. Adicionar Botao de Compartilhar na Lista

Na lista de avisos do admin, adicionar botao para compartilhar cada aviso individual.

---

## Templates de Mensagem

```text
## INFORMATIVO
ℹ️ *AVISO - {nome_condo}*

📋 *{titulo}*

{resumo}

🔗 Acesse o aviso completo:
{link}

---

## FINANCEIRO
💰 *AVISO FINANCEIRO - {nome_condo}*

📋 *{titulo}*

{resumo}

💵 Confira os detalhes:
{link}

---

## MANUTENCAO
🔧 *AVISO DE MANUTENCAO - {nome_condo}*

📋 *{titulo}*

{resumo}

📍 Mais informacoes:
{link}

---

## CONVIVENCIA
🤝 *AVISO DE CONVIVENCIA - {nome_condo}*

📋 *{titulo}*

{resumo}

🏠 Leia mais:
{link}

---

## SEGURANCA
🔒 *AVISO DE SEGURANCA - {nome_condo}*

📋 *{titulo}*

{resumo}

⚡ Veja o comunicado:
{link}

---

## URGENTE
⚠️ *AVISO URGENTE - {nome_condo}*

📋 *{titulo}*

{resumo}

🚨 LEIA AGORA:
{link}
```

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/lib/whatsapp-templates.ts` | Templates de mensagem por categoria |
| `src/components/WhatsAppShareButton.tsx` | Componente de botao para compartilhar |

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/AdminCondominiumPage.tsx` | Adicionar botao de compartilhar em cada aviso e apos criar |

---

## Fluxo do Usuario

```text
1. Admin cria novo aviso
          |
          v
2. Aviso e publicado com sucesso
          |
          v
3. Dialog exibe opcao "Compartilhar via WhatsApp"
          |
          v
4. Admin clica no botao
          |
          v
5. WhatsApp abre com mensagem pre-formatada
   incluindo link para a timeline publica
          |
          v
6. Admin seleciona contato/grupo e envia
```

---

## Secao Tecnica

### Funcao de Geracao de Template

```typescript
export function generateWhatsAppMessage(
  announcement: { title: string; summary: string | null; category: string },
  condominium: { name: string; slug: string },
  baseUrl: string
): string {
  const template = WHATSAPP_TEMPLATES[announcement.category];
  const timelineUrl = `${baseUrl}/c/${condominium.slug}`;
  
  return template
    .replace("{nome_condo}", condominium.name)
    .replace("{titulo}", announcement.title)
    .replace("{resumo}", announcement.summary || "Acesse o link para mais detalhes.")
    .replace("{link}", timelineUrl);
}
```

### Componente WhatsAppShareButton

```typescript
export function WhatsAppShareButton({ 
  announcement, 
  condominium 
}: WhatsAppShareButtonProps) {
  const handleShare = () => {
    const message = generateWhatsAppMessage(
      announcement, 
      condominium, 
      window.location.origin
    );
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      <MessageCircle className="w-4 h-4 mr-1" />
      Compartilhar
    </Button>
  );
}
```

### Integracao na Lista de Avisos

O botao sera adicionado ao lado dos botoes de fixar e excluir na lista de avisos do admin.

### Comportamento apos Criar Aviso

Apos publicar um aviso com sucesso, exibir um dialog de confirmacao com:
- Mensagem de sucesso
- Botao "Compartilhar via WhatsApp" 
- Botao "Fechar"

---

## Resultado Final

Apos implementacao:
- Templates padrao de WhatsApp para cada categoria
- Botao de compartilhar em cada aviso na lista
- Opcao de compartilhar imediatamente apos criar aviso
- Link direto para timeline publica (sem login)
- Mensagens formatadas com emojis e destaque

