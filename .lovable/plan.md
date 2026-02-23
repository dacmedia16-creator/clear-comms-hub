

## Listas de Membros para Organizacoes Genericas

Funcionalidade exclusiva para organizacoes do tipo `generic` que permite criar multiplas listas independentes de membros, cada uma funcionando como um grupo separado com seus proprios membros.

### Modelo de Dados

Nova tabela `member_lists` para armazenar as listas:

```text
member_lists
-----------
id           uuid (PK)
condominium_id uuid (FK -> condominiums)
name         text (nome da lista, ex: "Equipe A", "Leads Quentes")
description  text (opcional)
created_at   timestamptz
updated_at   timestamptz
```

Nova coluna na tabela `user_roles`:
- `list_id` uuid (FK -> member_lists, nullable) - vincula o membro a uma lista especifica

### RLS (Seguranca)

- SELECT/INSERT/UPDATE/DELETE em `member_lists`: permitido para quem pode gerenciar o condominio (`can_manage_condominium`) ou super admins.

### Interface (CondoMembersPage)

Somente quando `organizationType === 'generic'`:

1. **Seletor de listas** no topo da pagina (acima da busca):
   - Dropdown ou abas horizontais com as listas criadas
   - Botao "Nova Lista" para criar uma lista
   - Opcao "Todos" para ver todos os membros (sem filtro)

2. **Dialog de criar/editar lista**: campos Nome e Descricao (opcional)

3. **Filtro automatico**: ao selecionar uma lista, a tabela mostra apenas os membros vinculados aquela lista

4. **Ao adicionar membro**: se uma lista esta selecionada, o membro e automaticamente vinculado a ela

5. **Opcao de mover membro**: no menu de acoes, permitir mover um membro entre listas

### Arquivos a criar/modificar

**Novos:**
- `src/hooks/useMemberLists.ts` - hook para CRUD de listas (fetch, create, update, delete)
- `src/components/MemberListSelector.tsx` - componente de selecao de lista com botao de criar
- `src/components/CreateMemberListDialog.tsx` - dialog para criar/editar lista

**Modificados:**
- Migracao SQL: criar tabela `member_lists` + adicionar coluna `list_id` em `user_roles`
- `src/pages/CondoMembersPage.tsx`: adicionar seletor de listas (apenas para `generic`), filtrar membros por `list_id`
- `src/hooks/useCondoMembers.ts`: aceitar `listId` como parametro opcional para filtrar membros; ao criar membro, passar `list_id`
- `src/components/super-admin/AddMemberDialog.tsx`: receber `listId` opcional para vincular ao criar

### Fluxo do usuario

1. Gestor acessa a pagina de membros de uma organizacao generica
2. Ve um seletor de listas no topo (inicialmente vazio, mostra "Todos")
3. Clica em "Nova Lista" -> preenche nome -> lista criada
4. Seleciona a lista -> ve apenas os membros daquela lista
5. Ao adicionar membro com uma lista selecionada, o membro e vinculado automaticamente
6. Pode alternar entre listas ou ver "Todos" para visao completa
