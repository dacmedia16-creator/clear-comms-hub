
# Melhorar Chat da IA - Markdown + Efeito Typewriter

## Problemas Identificados

1. **Asteriscos visíveis** - O texto `**negrito**` aparece literalmente ao invés de ser formatado
2. **Texto aparece de uma vez** - Não há efeito visual de digitação progressiva

## Solução

### 1. Renderização de Markdown
Instalar e usar a biblioteca `react-markdown` para renderizar corretamente:
- **Negrito** (`**texto**`)
- *Itálico* (`*texto*`)
- Listas
- Links
- Código inline

### 2. Efeito Typewriter (Digitação Gradual)
O streaming já funciona (recebemos chunk por chunk da API), mas os chunks vêm em blocos grandes. Vou adicionar um efeito visual que simula digitação:
- Quando um novo chunk chega, ele é exibido caractere por caractere
- Velocidade configurável (~20-30ms por caractere)
- Suave e natural

## Mudanças Técnicas

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `package.json` | Adicionar `react-markdown` |
| `src/components/landing/SalesChatbot.tsx` | Usar ReactMarkdown + efeito typewriter |

### Nova Estrutura do ChatMessage

```tsx
import ReactMarkdown from 'react-markdown';

function ChatMessage({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  const [displayedContent, setDisplayedContent] = useState("");
  
  // Efeito typewriter para mensagens do assistente
  useEffect(() => {
    if (message.role === "user") {
      setDisplayedContent(message.content);
      return;
    }
    
    // Typewriter: adiciona caracteres gradualmente
    // ...lógica de animação
  }, [message.content]);

  return (
    <div className={...}>
      {isUser ? (
        <p>{message.content}</p>
      ) : (
        <ReactMarkdown className="prose prose-sm">
          {displayedContent}
        </ReactMarkdown>
      )}
    </div>
  );
}
```

### Configuração de Estilos do Markdown

Adicionar classes CSS para o markdown ficar bonito no chat:
- Parágrafos com espaçamento correto
- Links coloridos
- Listas formatadas
- Código com fundo destacado

## Resultado Esperado

| Antes | Depois |
|-------|--------|
| `**AVISO PRO**` | **AVISO PRO** |
| Texto aparece em blocos | Texto aparece letra por letra |
| Formatação quebrada | Listas, negrito, itálico funcionando |

## Velocidade do Typewriter

- **Rápido**: ~15ms por caractere (parece natural)
- Quando o streaming termina, o texto restante aparece imediatamente
- Mensagens do usuário aparecem instantaneamente
