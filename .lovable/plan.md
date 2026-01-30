
## Diagnóstico (o que aconteceu)
- A rota nova **já existe**: `/super-admin/notifications` está configurada no `src/App.tsx` e o arquivo `src/pages/super-admin/SuperAdminNotifications.tsx` está presente.
- Porém, o menu e os botões do Super Admin **ainda apontam para a rota antiga** `/super-admin/whatsapp`:
  - Em `src/pages/super-admin/SuperAdminDashboard.tsx` o card “API WhatsApp” (e o botão “Gerenciar API”) navega para `/super-admin/whatsapp`.
  - O mesmo link antigo aparece nos itens do menu inferior (mobile) em outras telas do super-admin (`SuperAdminUsers`, `SuperAdminTimelines`, `SuperAdminCondominiums`, `SuperAdminCondoMembers`).
- Como a rota antiga `/super-admin/whatsapp` **não existe mais**, ao clicar você cai em “nada”/NotFound, então “a API do whats não abre mais” e “não apareceu nada”.

## Objetivo
- Centralizar tudo em **um único local**: `/super-admin/notifications`
- Garantir que links antigos não quebrem (compatibilidade): `/super-admin/whatsapp` redireciona para `/super-admin/notifications`

## Mudanças que vou implementar
### 1) Corrigir navegação no Super Admin (telas + menu)
Atualizar todos os locais que hoje usam `/super-admin/whatsapp` para `/super-admin/notifications`, incluindo:
- `src/pages/super-admin/SuperAdminDashboard.tsx`
  - Trocar o card “API WhatsApp” para “Notificações” (ou “Central de Notificações”)
  - Trocar o botão “Gerenciar API” para apontar para `/super-admin/notifications`
  - Atualizar `superAdminNavItems` (mobile) para “Notificações”
- `src/pages/super-admin/SuperAdminUsers.tsx`
- `src/pages/super-admin/SuperAdminTimelines.tsx`
- `src/pages/super-admin/SuperAdminCondominiums.tsx`
- `src/pages/super-admin/SuperAdminCondoMembers.tsx`
  - Atualizar `superAdminNavItems` para remover “WhatsApp” e substituir por “Notificações”

### 2) Adicionar rota de compatibilidade (redirect)
No `src/App.tsx`, adicionar uma rota extra:
- `/super-admin/whatsapp` → redireciona automaticamente para `/super-admin/notifications`

Isso garante que qualquer link antigo (inclusive se alguém salvou nos favoritos) continue funcionando.

### 3) Checagens rápidas pós-ajuste (para garantir que “apareceu”)
Depois das mudanças:
- Acessar `/super-admin` e clicar no card de Notificações (deve abrir a Central).
- Acessar diretamente `/super-admin/whatsapp` (deve redirecionar para `/super-admin/notifications`).
- Validar navegação no mobile (menu inferior) em todas as telas do Super Admin.

## Observação importante
A tela `SuperAdminNotifications.tsx` já está criada e parece correta; o problema principal agora é **somente roteamento/navegação ainda apontando para o caminho antigo**.

## Arquivos que serão alterados
- `src/App.tsx` (adicionar redirect `/super-admin/whatsapp`)
- `src/pages/super-admin/SuperAdminDashboard.tsx` (botão/card + nav items)
- `src/pages/super-admin/SuperAdminUsers.tsx` (nav items)
- `src/pages/super-admin/SuperAdminTimelines.tsx` (nav items)
- `src/pages/super-admin/SuperAdminCondominiums.tsx` (nav items)
- `src/pages/super-admin/SuperAdminCondoMembers.tsx` (nav items)

## Resultado esperado
- O botão “Gerenciar API” que você mostrou no print vai abrir a **Central de Notificações** corretamente.
- O WhatsApp “não some”: ele passa a ser um dos cards/abas dentro da Central.
- Links antigos continuam funcionando via redirecionamento.
