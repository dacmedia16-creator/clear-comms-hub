

# Mover Link "Indique para seu síndico" para Cima

## Objetivo

Reposicionar o link "Indique para seu síndico" no componente Hero para ficar mais visível, movendo-o para logo após os botões "Começar agora" e "Ver demonstração".

---

## Mudança Proposta

### Arquivo: `src/components/landing/Hero.tsx`

**Posição Atual (linhas 63-72):**
O link está no final, após a lista de benefícios (Configuração em 2 minutos, 3 meses grátis, Sem cartão de crédito).

**Nova Posição:**
Mover o link para logo após os botões de CTA (linha 46), antes da lista de benefícios.

---

## Layout Atualizado

```text
[Badge: 3 meses grátis para testar]

Quando é importante,
vira AVISO.

Descrição do produto...

[Começar agora]  [Ver demonstração]

[Indique para seu síndico]  <-- MOVIDO PARA AQUI

✓ Configuração em 2 minutos
✓ 3 meses grátis  
✓ Sem cartão de crédito
```

---

## Código a Modificar

Reorganizar a estrutura do JSX movendo o bloco do link de indicação (linhas 63-72) para após o bloco de botões (linha 46).

O link manterá o mesmo estilo visual atual.

