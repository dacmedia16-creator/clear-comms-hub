

# Melhorar Seção de Funcionalidades com Imagens do Sistema

## Resumo

Redesenhar a seção de Features para incluir capturas de tela reais do sistema, tornando-a mais visual e convincente para novos visitantes.

## Abordagem Proposta

### Opção 1: Layout Alternado com Screenshots (Recomendado)

Transformar a seção de funcionalidades em um layout alternado onde cada feature importante tem uma imagem do sistema ao lado da descrição:

```text
+---------------------------+    +---------------------------+
|                           |    |                           |
|  [IMAGEM DA TIMELINE]     |    |  Titulo da Feature        |
|                           |    |  Descricao detalhada      |
|                           |    |                           |
+---------------------------+    +---------------------------+

+---------------------------+    +---------------------------+
|                           |    |                           |
|  Titulo da Feature        |    |  [IMAGEM DOS FILTROS]     |
|  Descricao detalhada      |    |                           |
|                           |    |                           |
+---------------------------+    +---------------------------+
```

### Opcion 2: Manter Grid Atual com Thumbnails

Adicionar pequenas imagens/thumbnails em cada card de feature, mantendo o layout de grid atual.

## Proximos Passos

**Voce precisa fornecer as imagens do sistema.** Pode fazer isso de duas formas:

1. **Fazer upload via chat**: Tire screenshots das telas principais (timeline, dashboard, filtros, notificacoes) e envie aqui no chat
2. **Indicar quais telas quer mostrar**: Me diga quais funcionalidades quer destacar e eu posso abrir o sistema no navegador para capturar

## Telas Sugeridas para Captura

1. **Timeline de avisos** - Mostrando cards de avisos com categorias coloridas
2. **Filtros por categoria** - Barra de filtros horizontal
3. **Dashboard do sindico** - Painel de gerenciamento
4. **Card de aviso expandido** - Detalhes de um comunicado
5. **Notificacao WhatsApp** - Simulacao ou exemplo

## Secao Tecnica

### Estrutura do Novo Componente

```tsx
// Novo componente FeatureShowcase.tsx
interface FeatureShowcaseItem {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

// Layout alternado com AspectRatio para manter proporcoes
<div className="grid lg:grid-cols-2 gap-8 items-center">
  <div className="order-2 lg:order-1">
    <h3>Titulo</h3>
    <p>Descricao</p>
  </div>
  <div className="order-1 lg:order-2">
    <AspectRatio ratio={16/9}>
      <img src={feature.image} />
    </AspectRatio>
  </div>
</div>
```

### Armazenamento de Imagens

As imagens enviadas serao salvas na pasta `public/screenshots/` ou utilizadas diretamente do upload.

### Otimizacoes

- Usar lazy loading para imagens
- Adicionar sombra e borda para parecer uma janela de app
- Animacao de fade-in ao rolar a pagina

## Resultado Esperado

Uma secao de features mais visual e profissional que mostra o produto real, aumentando a conversao de visitantes.

