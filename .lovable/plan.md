

## Adicionar opcao de selecionar Lista de Membros como destinatario

### Problema
Na tela de criacao de avisos para organizacoes sem segmentacao por localizacao (tipo Generico), nao existe a opcao de selecionar uma Lista de Membros como destinatario. Atualmente so e possivel escolher "Todos os membros" ou "Membros especificos".

### Solucao
Adicionar uma terceira opcao "Lista de membros" no RadioGroup de Destinatarios, que ao ser selecionada exibe um dropdown com as listas disponiveis da organizacao. Ao publicar o aviso, os IDs dos membros vinculados a lista selecionada serao carregados e enviados como `target_member_ids`, reutilizando toda a logica de filtragem ja existente nas Edge Functions.

### Alteracoes

#### 1. `src/pages/AdminCondominiumPage.tsx`
- Importar `useMemberLists` e o componente `Select`
- Adicionar estado `selectedListId` para a lista selecionada
- Expandir o tipo de `recipientType` para incluir `"list"`
- No RadioGroup de organizacoes sem localizacao, adicionar opcao "Lista de membros" entre "Todos os membros" e "Membros especificos"
- Quando `recipientType === "list"`, exibir um Select com as listas disponiveis
- Na funcao `handleCreateAnnouncement`, quando `recipientType === "list"`, buscar os member_ids vinculados a lista selecionada (query em `user_roles` filtrando por `list_id`) e usar como `targetMemberIdsArray`
- Resetar `selectedListId` ao limpar o formulario

#### 2. Nenhuma alteracao nas Edge Functions
A filtragem por `target_member_ids` ja funciona corretamente. Ao enviar os IDs dos membros da lista selecionada, as Edge Functions de WhatsApp, SMS e Email ja filtram automaticamente.

### Fluxo do usuario
1. Ao criar um aviso, na secao Destinatarios, o usuario ve 3 opcoes: "Todos os membros", "Lista de membros", "Membros especificos"
2. Ao selecionar "Lista de membros", aparece um dropdown com as listas cadastradas
3. Ao publicar, o sistema busca os IDs dos membros da lista e envia como `target_member_ids`
