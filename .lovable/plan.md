

User wants the `remax_corretor` template to be a selectable option for the existing "Aviso Pro" sender (15 99831-2112), instead of (or in addition to) creating a separate Re/Max sender.

Currently the schema is **1 template per sender** (`whatsapp_senders.template_identifier` is a single column). The send flow picks ONE sender (default or first active) and uses ITS template. There's no way today to choose a template at send time.

To make `remax_corretor` an "option" for the Aviso Pro sender, I need to:
1. Allow a sender to have multiple templates
2. Let the user pick which template to use when sending an announcement

## Plan: Multi-template support per sender

### Schema change
New table `whatsapp_sender_templates`:
- `id`, `sender_id` (FK whatsapp_senders), `identifier` (ex: `aviso_pro_confirma_3`, `remax_corretor`), `label` (ex: "Padrão Aviso Pro", "Re/Max Corretor"), `button_config`, `has_nome_param`, `is_default` (per sender)

Migrate existing `whatsapp_senders.template_identifier` / `button_config` / `has_nome_param` into this table as the default template per sender. Keep old columns for backwards compat (read fallback).

Seed: insert `remax_corretor` template linked to "Aviso Pro" sender, `button_config=two_buttons`, `has_nome_param=true`.

### UI — Super Admin
In `WhatsAppSendersCard`: expand row to list templates of that sender, with "Adicionar template" / edit / delete / set default.

### UI — Send announcement
In `SendWhatsAppButton` (and the announcement send dialog): add a template dropdown showing templates of the chosen sender. Defaults to the sender's default template.

### Edge function `send-whatsapp`
Accept optional `template_id` in the request body. Resolve `(template_identifier, button_config, has_nome_param)` from `whatsapp_sender_templates` if provided, else fall back to sender defaults.

### Backwards compatibility
Old calls without `template_id` keep working (use sender's default template, which is the migrated row).

### Files touched
- migration: new table + seed
- `supabase/functions/send-whatsapp/index.ts`: read template by id
- `src/hooks/useWhatsAppSenders.ts`: expose templates
- new `src/hooks/useWhatsAppSenderTemplates.ts`
- `src/components/super-admin/WhatsAppSendersCard.tsx`: render templates sub-list
- new `src/components/super-admin/AddSenderTemplateDialog.tsx` + edit
- `src/components/SendWhatsAppButton.tsx`: template selector

### Pré-requisito
Confirmar `button_config` real do template `remax_corretor` aprovado na Meta (assumindo `two_buttons` + `nome` igual ao Aviso Pro padrão).

