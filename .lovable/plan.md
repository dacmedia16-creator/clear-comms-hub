

## Reposicionar "Telefone 2" no importador de membros

### Problema
O campo "Telefone 2" está na posição 7 (última coluna) do modelo de importação, mas muitos usuários colocam o segundo telefone logo após o primeiro. Isso causa erros de validação em massa (como visto na screenshot: 2832 erros) porque números de telefone são interpretados como emails.

### Alterações

#### `src/components/ImportMembersDialog.tsx`

1. **Reordenar colunas do parser** — mover `phoneSecondary` para logo após `phone` (índice 2):
   - Ordem nova: Nome(0), Telefone(1), **Telefone 2(2)**, Email(3), Bloco(4), Unidade(5), Função(6)

2. **Atualizar template de download** — mesma ordem nova nos headers e dados de exemplo

3. **Atualizar tabela de preview** — reordenar colunas para refletir a nova ordem (Tel 2 logo após Telefone)

Nenhuma alteração em outros arquivos.

