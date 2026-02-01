
# Adicionar Propaganda de 3 Meses Gratis na Landing Page

## Objetivo
Destacar visualmente a oferta de 3 meses de teste gratuito para condominios na pagina inicial, incentivando novos cadastros.

---

## Estrategia de Implementacao

Vou adicionar o destaque do trial gratuito em **tres pontos estrategicos** da landing page:

### 1. Badge no Hero (Destaque Principal)
Substituir o badge atual "Comunicacao oficial para condominios" por um badge mais chamativo destacando o trial:

```text
+------------------------------------------+
|  (Gift icon) 3 MESES GRATIS para testar  |
+------------------------------------------+
```

### 2. Bullet Points Abaixo do CTA
Adicionar os beneficios do trial logo abaixo do botao "Comecar agora":

```text
[Comecar agora ->]

(check) Configuracao em 2 minutos
(check) 3 meses gratis para testar
(check) Sem cartao de credito
```

### 3. Secao CTA Final
Atualizar a secao de call-to-action no final da pagina para reforcar a oferta:

```text
+--------------------------------------------------+
| Pronto para transformar a comunicacao?           |
| Comece com 3 meses gratis, sem compromisso.      |
|                                                  |
|        [Comecar teste gratis ->]                 |
+--------------------------------------------------+
```

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/landing/Hero.tsx` | Trocar badge + adicionar bullets de beneficios do trial |
| `src/pages/Index.tsx` | Atualizar texto e botao da secao CTA final |

---

## Detalhes Tecnicos

### Hero.tsx - Badge do Trial

Trocar o badge atual:
```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
  <Bell className="w-4 h-4" />
  <span>Comunicacao oficial para condominios</span>
</div>
```

Por um badge chamativo com fundo colorido:
```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6 border border-emerald-200">
  <Gift className="w-4 h-4" />
  <span>3 meses gratis para testar</span>
</div>
```

### Hero.tsx - Lista de Beneficios

Expandir a linha de "Configuracao em 2 minutos" para uma lista completa:
```tsx
<div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
  <div className="flex items-center gap-2">
    <CheckCircle className="w-4 h-4 text-primary" />
    <span>Configuracao em 2 minutos</span>
  </div>
  <div className="flex items-center gap-2">
    <CheckCircle className="w-4 h-4 text-emerald-600" />
    <span>3 meses gratis</span>
  </div>
  <div className="flex items-center gap-2">
    <CheckCircle className="w-4 h-4 text-primary" />
    <span>Sem cartao de credito</span>
  </div>
</div>
```

### Index.tsx - CTA Final

Atualizar textos da secao final:
```tsx
<h2>Pronto para transformar a comunicacao do seu condominio?</h2>
<p>Comece com 3 meses gratis. Sem compromisso, sem cartao de credito.</p>
<Button>
  Comecar teste gratis
  <ArrowRight />
</Button>
```

---

## Visual Final Esperado

A landing page tera destaque visual para a oferta de trial em:

1. **Topo**: Badge verde chamativo "3 meses gratis para testar"
2. **Abaixo do CTA principal**: Lista de beneficios incluindo trial
3. **Final da pagina**: Reforco da oferta antes do footer

Isso garante que visitantes vejam a oferta independente de onde estejam na pagina.
