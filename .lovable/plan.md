
## Sistema de Opt-Out (Descadastro) via WhatsApp

### O que sera feito

Quando um morador receber uma mensagem no WhatsApp, havera um segundo botao "Parar de receber". Ao clicar, ele sera redirecionado para uma pagina publica no AvisoPro que confirma o descadastro. O sistema automaticamente para de enviar mensagens para esse telefone nos proximos disparos.

### Pre-requisito externo (sua parte)

Voce precisara atualizar o template `avisopro_confirma_2` na Meta Business Suite adicionando um segundo botao CTA:
- **Tipo**: URL dinamica  
- **Texto do botao**: "Parar de receber" (ou similar)  
- **URL do site**: `https://avisopro.com.br/optout?t={{1}}`  
- **Exemplo**: `https://avisopro.com.br/optout?t=abc123`

### Detalhes tecnicos

**1. Migracao SQL - Criar tabela `whatsapp_optouts`**

Colunas: `id` (uuid PK), `phone` (text, telefone normalizado), `token` (text unique, token de identificacao), `condominium_id` (uuid nullable), `member_name` (text nullable), `opted_out_at` (timestamp default now()), `created_at` (timestamp default now()).

RLS:
- SELECT: `is_super_admin()` e `can_manage_condominium(condominium_id)`
- INSERT: via service role (edge function), sem policy publica
- DELETE: `is_super_admin()` (para reativar manualmente)

**2. Nova Edge Function `whatsapp-optout`**

- Arquivo: `supabase/functions/whatsapp-optout/index.ts`
- Config: `verify_jwt = false` (acesso publico)
- Recebe POST com `{ token }` 
- Busca o token na tabela, marca `opted_out_at`
- Retorna JSON de sucesso/erro
- Usa `SUPABASE_SERVICE_ROLE_KEY` para inserir (bypassa RLS)

**3. Nova pagina React `/optout`**

- Arquivo: `src/pages/OptOutPage.tsx`
- Pagina publica, sem autenticacao
- Le `?t=TOKEN` da URL
- Chama a edge function `whatsapp-optout`
- Mostra mensagem: "Pronto! Voce nao recebera mais mensagens deste numero. Obrigado!"
- Design limpo com logo AvisoPro

**4. Rota no App.tsx**

- Adicionar `<Route path="/optout" element={<OptOutPage />} />` antes do catch-all

**5. Modificar `send-whatsapp` Edge Function**

Duas mudancas:
- **Gerar token**: Para cada membro, gerar UUID curto, salvar na `whatsapp_optouts` com `opted_out_at = null` (pendente), e enviar como `buttonUrlDynamicParams[1]` com valor `optout?t=TOKEN`
- **Filtrar opt-outs**: Antes de enviar, consultar `whatsapp_optouts WHERE opted_out_at IS NOT NULL` e excluir esses telefones da lista

**6. Modificar `test-whatsapp` Edge Function**

- Adicionar `buttonUrlDynamicParams[1]` com token de teste (ex: `optout?t=test-demo`)

**7. Secao "Descadastros" no SuperAdminNotifications**

- Adicionar nova aba "Descadastros" no painel de logs
- Lista quem fez opt-out: telefone, nome, condominio, data
- Botao para reativar (deletar registro da tabela)

### Arquivos envolvidos

| Arquivo | Acao |
|---------|------|
| Migracao SQL | Criar tabela `whatsapp_optouts` com RLS |
| `supabase/functions/whatsapp-optout/index.ts` | Criar |
| `supabase/config.toml` | Adicionar `[functions.whatsapp-optout]` |
| `src/pages/OptOutPage.tsx` | Criar |
| `src/App.tsx` | Adicionar rota `/optout` |
| `supabase/functions/send-whatsapp/index.ts` | Modificar (token + filtro) |
| `supabase/functions/test-whatsapp/index.ts` | Modificar (segundo botao) |
| `src/pages/super-admin/SuperAdminNotifications.tsx` | Modificar (aba descadastros) |
