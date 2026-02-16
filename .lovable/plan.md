
## Melhorar experiencia mobile para Admin e Super Admin

### Problemas identificados

1. **Header do AdminCondominiumPage**: Os botoes "Moradores" e "Ver timeline" ficam apertados no mobile, sem responsividade -- ficam comprimidos ou cortados
2. **Header do CondoMembersPage**: Botoes "Importar" e "Adicionar" ocupam espaco demais no mobile
3. **Header do SuperAdminDashboard**: Botao "Sair" e icone de refresh sem adaptacao mobile
4. **DashboardPage**: Botao "Super Admin" fica escondido no mobile (`hidden sm:flex`), sem alternativa de acesso
5. **AdminCondominiumPage - lista de avisos**: No mobile, os botoes de acao (WhatsApp, fixar, excluir) dos cards de avisos ficam apertados e dificeis de tocar
6. **Dialogs no mobile**: O dialog de criacao de aviso usa `max-w-2xl` que pode nao aproveitar bem a tela cheia no mobile
7. **Bottom Nav inconsistente**: O SuperAdminDashboard usa nav items diferentes dos sub-pages (SuperAdminUsers, SuperAdminCondominiums)
8. **DashboardPage sem bottom nav**: Nao tem navegacao inferior no mobile

### Melhorias propostas

**1. Header responsivo no AdminCondominiumPage**
- Esconder os botoes de texto no mobile, ja que o Bottom Nav cobre essas navegacoes
- Manter apenas o RefreshButton no header mobile

**2. Header responsivo no CondoMembersPage**
- Transformar botoes "Importar" e "Adicionar" em icones no mobile (sem texto)
- Manter labels no desktop

**3. Acesso Super Admin no mobile (DashboardPage)**
- Adicionar um bottom nav no DashboardPage para usuarios admin/super admin com acesso rapido as funcoes principais
- Incluir item "Super Admin" no bottom nav quando o usuario e super admin

**4. Cards de avisos no mobile (AdminCondominiumPage)**
- Usar layout mobile-first para os botoes de acao: empilhar ou usar menu dropdown no mobile
- Usar Drawer (bottom sheet) para acoes de cada aviso no mobile em vez de botoes inline

**5. Unificar Bottom Nav do Super Admin**
- Padronizar os items do bottom nav entre SuperAdminDashboard e as sub-paginas (Users, Condominiums, etc.)

**6. Dialog fullscreen no mobile**
- Para o dialog de criacao de aviso, usar `max-h-[100dvh]` e fullscreen no mobile para melhor experiencia de digitacao

**7. Ajustes de spacing e touch targets**
- Garantir que todos os botoes de acao tenham `min-h-[44px]` e `min-w-[44px]` (padrao Apple de acessibilidade)
- Melhorar padding nos cards no mobile

### Detalhes tecnicos

**Arquivos a modificar:**

1. **`src/pages/DashboardPage.tsx`**
   - Importar MobileBottomNav
   - Adicionar bottom nav com items contextuais (Home, Perfil, Super Admin se aplicavel)
   - Adicionar classe `has-bottom-nav` ao container quando mobile

2. **`src/pages/AdminCondominiumPage.tsx`**
   - Esconder botoes de texto no header no mobile (ja cobertos pelo bottom nav)
   - Adicionar acoes de aviso via Drawer no mobile (swipe up com opcoes Fixar, WhatsApp, Excluir)
   - Dialog de criacao full-width no mobile

3. **`src/pages/CondoMembersPage.tsx`**
   - Botoes do header como icones no mobile (sem label)

4. **`src/pages/super-admin/SuperAdminDashboard.tsx`**
   - Unificar `superAdminNavItems` com as sub-paginas

5. **`src/pages/super-admin/SuperAdminCondominiums.tsx`** e **`SuperAdminUsers.tsx`**
   - Garantir que os nav items sejam identicos ao dashboard

6. **`src/components/mobile/MobileAnnouncementActions.tsx`** (novo)
   - Componente Drawer com acoes de aviso (Fixar/Desafixar, Enviar WhatsApp, Excluir)
   - Acionado por long-press ou tap no card de aviso no mobile

7. **`src/index.css`**
   - Adicionar utilitario para dialogs fullscreen mobile se necessario
