

## Fix: super-admin bloqueado no CRM Imobiliário

### Causa
`RealEstateLayout.tsx` ignora o `loading` do hook `useSuperAdmin`. Roda a checagem com `isSuperAdmin=false` (estado inicial), entra no branch de `user_roles`, não acha role e bloqueia. Mesmo quando `isSuperAdmin` vira `true` depois, o estado `authorized` já foi setado como `false`.

### Correção (1 arquivo)
`src/components/real-estate/RealEstateLayout.tsx`:

1. Importar `loading: saLoading` do `useSuperAdmin()`.
2. No `useEffect`, **aguardar** `saLoading === false` antes de decidir (early return enquanto carrega).
3. Adicionar `saLoading` ao array de dependências do `useEffect`.
4. Manter o spinner enquanto `loading || saLoading`.

Lógica final:
```text
if (saLoading) return            // espera resolver
fetch condominium
if (isSuperAdmin) authorize
else if (user) check user_roles
```

Sem mudanças de banco, sem novas rotas. Apenas ordem de checagem.

