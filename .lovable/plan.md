

# Plano: Dar Mais Enfase às Funcionalidades Multi-Segmento

## Objetivo

Atualizar a landing page para destacar melhor que o AVISO PRO funciona para múltiplos tipos de organizações (não apenas condomínios), enfatizando a adaptação automática de terminologia e campos para cada segmento.

---

## Problemas Identificados

1. **Hero ainda focado em condomínios**: O mockup do celular mostra apenas "Condomínio Jardins" e "moradores"
2. **Benefícios genéricos**: As features não destacam a adaptação por segmento
3. **SegmentGrid muito simples**: Não mostra o diferencial de terminologia adaptada
4. **Falta de seção "Novidades"**: Não há destaque para funcionalidades recentemente adicionadas
5. **Header sem link para segmentos**: Navegação não leva diretamente aos segmentos

---

## Alterações Propostas

### 1. Hero - Mockup Rotativo por Segmento

Trocar o mockup estático por uma animação que alterna entre diferentes segmentos:

- **Condomínio Jardins** → "Síndico" / "Moradores"
- **Clínica Saúde Total** → "Administrador" / "Pacientes"  
- **Empresa XYZ** → "Gestor" / "Colaboradores"
- **Igreja Esperança** → "Pastor" / "Membros"

Cada 4 segundos, o mockup muda suavemente para mostrar um segmento diferente.

### 2. Nova Seção: "Destaques" (após Hero)

Adicionar uma faixa de destaque com as novidades:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✨ NOVIDADES                                                           │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │ 🏢 6 Segmentos   │  │ 📝 Terminologia  │  │ 🎥 Upload de     │      │
│  │                  │  │    Adaptada      │  │    Vídeos        │      │
│  │ Condomínios,     │  │                  │  │                  │      │
│  │ Empresas,        │  │ Cada organização │  │ Até 300MB por    │      │
│  │ Clínicas...      │  │ usa sua própria  │  │ vídeo na linha   │      │
│  │                  │  │ linguagem        │  │ do tempo         │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3. SegmentGrid Expandido

Adicionar mais informações em cada card de segmento:

- Mostrar exemplos de terminologia: "Síndico → Morador" / "Gestor → Colaborador"
- Badge "Novo" nos segmentos recém-adicionados (Franquias, Igrejas)
- Ao passar o mouse, revelar os termos adaptados

### 4. Seção "Terminologia Inteligente"

Nova seção visual mostrando a adaptação de termos:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🎯 TERMINOLOGIA QUE SE ADAPTA                                          │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │   Condomínio          Empresa           Igreja                    │  │
│  │   ──────────          ───────           ──────                    │  │
│  │   Síndico      →      Gestor     →      Pastor                    │  │
│  │   Morador      →      Colaborador →     Membro                    │  │
│  │   Bloco        →      Departamento →    Ministério                │  │
│  │   Unidade      →      Cargo       →     Grupo                     │  │
│  │                                                                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Campos opcionais para segmentos que não precisam de localização       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5. UseCaseTabs - Adicionar Badge Visual

Destacar visualmente o segmento ativo com animação e mostrar quantos casos de uso cada um tem.

### 6. Header - Adicionar Link "Segmentos"

Adicionar navegação para a seção de segmentos:

```
[ Logo AVISO PRO ]  [ Segmentos ]  [ Funcionalidades ]  [ Como funciona ]  [ Entrar ] [ Criar canal ]
```

### 7. Features Atualizadas

Adicionar nova feature destacando a adaptação multi-segmento:

- **"Sua linguagem, seu sistema"**: O AVISO PRO se adapta automaticamente ao vocabulário da sua organização

---

## Arquivos a Modificar/Criar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/landing/Hero.tsx` | Mockup rotativo por segmento |
| `src/components/landing/HighlightsBar.tsx` | **CRIAR** - Faixa de novidades |
| `src/components/landing/SegmentGrid.tsx` | Expandir cards com terminologia |
| `src/components/landing/TerminologyShowcase.tsx` | **CRIAR** - Seção visual de termos |
| `src/components/landing/Header.tsx` | Adicionar link "Segmentos" |
| `src/components/landing/FeatureShowcase.tsx` | Adicionar feature de adaptação |
| `src/pages/Index.tsx` | Adicionar novas seções |

---

## Nova Estrutura da Landing Page

```
1. Header (com link Segmentos)
2. Hero (mockup rotativo)
3. HighlightsBar (novidades) ← NOVO
4. SegmentGrid (expandido)
5. UseCaseTabs
6. TerminologyShowcase ← NOVO
7. FeatureShowcase (atualizado)
8. TrustSection
9. HowItWorks
10. CTA Final
11. Footer
```

---

## Detalhes de Implementação

### Hero - Mockup Rotativo

```typescript
// Estado para controlar segmento atual
const [currentSegment, setCurrentSegment] = useState(0);
const segments = [
  { name: "Condomínio Jardins", role: "Canal Oficial", recipient: "moradores" },
  { name: "Clínica Saúde Total", role: "Canal Oficial", recipient: "pacientes" },
  { name: "Tech Solutions", role: "Canal Oficial", recipient: "colaboradores" },
  { name: "Igreja Esperança", role: "Canal Oficial", recipient: "membros" },
];

// Rotação automática a cada 4 segundos
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSegment((prev) => (prev + 1) % segments.length);
  }, 4000);
  return () => clearInterval(interval);
}, []);
```

### HighlightsBar - Novidades

Cards horizontais com:
- Ícone + Título + Descrição curta
- Cores de destaque (gradiente ou primary)
- Animação sutil de entrada

### TerminologyShowcase - Comparativo Visual

Tabela/grid mostrando a transformação de termos:
- 3 colunas para 3 segmentos diferentes
- Setas indicando a adaptação
- Destaque visual para os termos

---

## Resultado Esperado

Após as alterações, o visitante entenderá imediatamente que:

1. O AVISO PRO funciona para **6 tipos diferentes de organizações**
2. O sistema **se adapta automaticamente** à linguagem de cada segmento
3. **Campos são opcionais** para segmentos que não precisam de localização
4. **Upload de vídeos** está disponível (até 300MB)
5. Cada segmento tem **casos de uso específicos**

---

## Seção Técnica

### Animações Suaves

Usar Tailwind + CSS para transições:
- `transition-all duration-500`
- `animate-fade-in` para entrada de elementos
- Opacity e transform para mudanças de conteúdo

### Performance

- Lazy load para imagens de segmentos
- Preload do próximo segmento no mockup rotativo
- Usar `will-change` para otimizar animações

