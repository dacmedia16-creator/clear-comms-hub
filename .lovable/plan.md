
## Transformar botao "Novo Condominio" em seletor de tipo de organizacao

### O que muda
O botao "+ Novo Condominio" no Dashboard vai abrir primeiro um dialog com as 6 opcoes de segmento (Condominio, Clinicas, Empresas, Comunidades, Igrejas, Franquias). Ao clicar em um segmento, abre o formulario de criacao ja com o tipo pre-selecionado e a terminologia adaptada.

### Detalhes tecnicos

**Arquivo: `src/pages/DashboardPage.tsx`**

1. Adicionar estado `selectedOrgType` para controlar o tipo selecionado
2. Adicionar estado `typePickerOpen` para um dialog de selecao de tipo
3. O botao "Novo Condominio" passa a ser "Nova Organizacao" e abre o dialog de selecao de tipo
4. O dialog de selecao mostra os 6 cards com icone, label e descricao (reutilizando `ORGANIZATION_TYPE_OPTIONS` de `organization-types.ts`)
5. Ao selecionar um tipo, fecha o picker e abre o dialog de criacao existente, agora com:
   - Titulo dinamico: "Criar novo {terms.organization}" (ex: "Criar nova Igreja")
   - Campo `organization_type` enviado no insert
   - Placeholder do nome adaptado ao tipo
6. Importar `ORGANIZATION_TYPE_OPTIONS` e `ORGANIZATION_TYPES`

### Fluxo do usuario
1. Clica em "+ Nova Organizacao"
2. Ve 6 cards (Condominio, Clinicas, Empresas, Comunidades, Igrejas, Franquias)
3. Clica em um tipo
4. Formulario abre com terminologia correta
5. Preenche nome e descricao, cria a organizacao com o tipo correto
