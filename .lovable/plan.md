

## Adicionar template `remax_corretor` como novo WhatsApp Sender

Já temos toda a infra: a tabela `whatsapp_senders` aceita `template_identifier`, `button_config`, `has_nome_param` por sender, e as edge functions `send-whatsapp` / `test-whatsapp` já leem esses campos. Não precisa criar nada novo — basta cadastrar o sender.

### Decisões confirmadas
- Novo sender Re/Max (independente)
- Template Meta: `remax_corretor` (mesmo padrão: `nome` + `aviso` + `lembrete` + 2 botões dinâmicos `[0]=link slug, [1]=optout token`)
- Disponível para todas as organizações (aparece como opção no Super Admin)

### Passos

**1. Abrir o dialog "Adicionar WhatsApp Sender" no Super Admin** (`/super-admin` → WhatsApp Senders → Adicionar)

Preencher:
- **Nome**: `Re/Max`
- **Telefone**: número do canal Re/Max na Zion Talk (formato `15XXXXXXXXX`, sem `+`)
- **API Key**: api_key da Zion Talk para esse canal
- **Template Identifier**: `remax_corretor`
- **Button Config**: `2 Botões (link + optout)`
- **Has Nome Param**: ✅ ativo
- **Is Active**: ✅ ativo
- **Is Default**: ❌ (deixar `Aviso Pro` como default)

**2. Validar com edge function `test-whatsapp`** enviando para um número de teste seu, escolhendo o sender Re/Max — confirma que a Zion Talk aceita (`status=201`) com o template aprovado.

**3. (Opcional) Atualizar `src/lib/whatsapp-templates.ts`** adicionando uma constante de referência para preview local:
```ts
export const REMAX_TEMPLATE_IDENTIFIER = 'remax_corretor';
```
Isso é só documental — o envio real já usa o `template_identifier` do banco.

### O que NÃO precisa mudar
- Schema da tabela (já tem todas as colunas)
- Edge functions `send-whatsapp` / `test-whatsapp` (já são genéricas)
- RLS (Super Admin já gerencia senders)

### Pré-requisitos do usuário
Para eu cadastrar via SQL (ou você cadastrar pela UI), preciso:
- **Telefone Re/Max** (do canal Zion Talk)
- **API Key Re/Max** (do painel Zion Talk)

### Pergunta antes de implementar
Quer que eu:
- **(a)** Cadastre o sender Re/Max diretamente via INSERT no banco assim que você passar telefone + api_key, **ou**
- **(b)** Apenas adicione a constante `REMAX_TEMPLATE_IDENTIFIER` no código e você mesmo cadastra pela UI do Super Admin?

