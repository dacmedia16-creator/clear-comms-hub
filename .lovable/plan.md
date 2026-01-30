
# Criar Página de Demonstração

## Problema Identificado

O botão "Ver demonstração" na landing page está linkando para `/demo`, porém:
1. Não existe uma página `DemoPage.tsx`
2. Não existe uma rota `/demo` no `App.tsx`

Por isso, ao clicar no botão, o usuário é redirecionado para a página NotFound.

## Solução Proposta

Criar uma página de demonstração que mostre o sistema em ação, permitindo que visitantes vejam como funciona sem precisar criar uma conta.

## O que a Página de Demonstração Terá

### Opção A: Timeline de Exemplo
Mostrar uma timeline fictícia de um condomínio de exemplo ("Condomínio Jardins Demo") com avisos de amostra para que o visitante veja exatamente como os moradores visualizam os comunicados.

### Conteúdo da Demo
- Header com navegação de volta para a landing page
- Timeline com 4-5 avisos de exemplo (diferentes categorias)
- Filtros de categoria funcionando
- Banner convidando a criar conta própria

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/DemoPage.tsx` | Criar |
| `src/App.tsx` | Adicionar rota /demo |

## Dados de Exemplo

A página mostrará avisos fictícios como:
- Urgente: Manutenção dos elevadores
- Financeiro: Boleto disponível
- Informativo: Assembleia geral
- Obras: Reforma da piscina
- Segurança: Novo sistema de portaria

## Resultado Esperado

Visitantes poderão ver uma demonstração real do sistema antes de criar uma conta, aumentando a confiança e a taxa de conversão.
