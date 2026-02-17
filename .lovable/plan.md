

## Scroll automatico ao topo ao clicar nos cards de segmento

Quando o usuario clica em um card de segmento (ex: Condominios, Empresas), o React Router navega para a nova pagina mas nao rola para o topo automaticamente. O usuario acaba vendo a pagina de destino no meio, em vez do comeco.

### Solucao

Adicionar `onClick={() => window.scrollTo(0, 0)}` nos `<Link>` dos cards no `SegmentGrid.tsx`.

### Detalhe tecnico

| Arquivo | Mudanca |
|---|---|
| `src/components/landing/SegmentGrid.tsx` | Adicionar handler `onClick` no componente `<Link>` (linha 117) para chamar `window.scrollTo(0, 0)` ao clicar |

Apenas 1 linha alterada. Nenhum arquivo novo.
