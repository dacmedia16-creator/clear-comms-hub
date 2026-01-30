

# Atualizar Valores dos Planos

## Resumo

Atualizar os preços dos planos de assinatura para os novos valores solicitados.

## Alterações

| Plano | Valor Atual | Novo Valor |
|-------|-------------|------------|
| Starter (Inicial) | R$ 29 | R$ 199 |
| Pro (Profissional) | R$ 79 | R$ 299 |

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/constants.ts` | Atualizar `price` do plano starter para 199 e do plano pro para 299 |

## Resultado

A landing page e todas as outras áreas que utilizam os valores de `PLANS` exibirão automaticamente os novos preços, pois os componentes já importam os valores de `constants.ts`.

