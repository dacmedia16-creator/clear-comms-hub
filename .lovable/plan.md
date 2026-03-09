

## Excluir todos os contatos da lista "Corretores - SP"

A lista **"Corretores - SP"** (ID: `643e6e70-b3b1-4486-bf87-6791e2f8e8f0`) possui **4.028 membros** no condomínio `8a02e332-706a-4129-93be-0794b4a17786`.

### Operações necessárias

1. **Criar edge function temporária** `delete-list-members` que:
   - Recebe `list_id` no body
   - Usa service role para buscar todos `member_id` da `user_roles` com esse `list_id`
   - Deleta os registros de `user_roles` (vínculos)
   - Deleta os registros de `condo_members` correspondentes (dados dos contatos)
   - Processa em lotes de 500 para evitar timeouts

2. **Executar** a function com o `list_id` da lista "Corretores - SP"

3. **Opcionalmente excluir a lista** (`member_lists`) se desejado

4. **Remover a edge function temporária** após conclusão

### Detalhes técnicos

- A exclusão segue a ordem: primeiro `user_roles` (que referencia `member_id`), depois `condo_members`
- Membros que existam em outras listas **não** serão excluídos da `condo_members` (verificação antes de deletar)
- Total estimado: ~4.028 registros em `user_roles` + correspondentes em `condo_members`

