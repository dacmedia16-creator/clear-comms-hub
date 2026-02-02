

# Adicionar Informações de Contato no Footer

## Objetivo

Incluir as informações de contato da empresa no rodapé do site para que visitantes possam entrar em contato facilmente.

---

## Dados a Adicionar

| Campo | Valor |
|-------|-------|
| **Endereço** | Rua Horacio Cenci, 9 - Parque Campolim, Sorocaba - SP, 18047-800 |
| **Telefone** | (15) 98178-8214 |

---

## Mudanças Planejadas

### Arquivo: `src/components/landing/Footer.tsx`

Adicionar uma nova coluna "Contato" ao grid do footer com:

1. **Ícone de localização** com o endereço completo
2. **Ícone de WhatsApp/telefone** com o número clicável

---

## Layout Atualizado

```text
+------------------------------------------------------------------+
|  [Logo] AVISO PRO        Produto       Legal        Contato      |
|                                                                  |
|  O canal oficial de      Demonstração  Termos       Endereço:    |
|  comunicação do seu      Features      Privacidade  Rua Horacio  |
|  condomínio...           Indique                    Cenci, 9...  |
|                                                                  |
|                                                     WhatsApp:    |
|                                                     (15) 98178.. |
+------------------------------------------------------------------+
|              © 2026 AVISO PRO. Todos os direitos reservados.     |
+------------------------------------------------------------------+
```

---

## Seção Tecnica

### Estrutura do Grid

Ajustar o grid de `md:grid-cols-4` para acomodar a nova coluna:
- Brand: `md:col-span-1` (reduzir de 2 para 1)
- Produto: 1 coluna
- Legal: 1 coluna
- Contato: 1 coluna (nova)

### Ícones a Importar

Do `lucide-react`:
- `MapPin` - para o endereço
- `Phone` ou `MessageCircle` - para o WhatsApp

### Link Clicável do Telefone

```tsx
<a href="tel:+5515981788214" className="...">
  (15) 98178-8214
</a>

// Ou link direto para WhatsApp:
<a href="https://wa.me/5515981788214" target="_blank" className="...">
  (15) 98178-8214
</a>
```

