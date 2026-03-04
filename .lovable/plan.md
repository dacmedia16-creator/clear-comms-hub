

## Estimativa de tempo restante no WhatsAppMonitor

Adicionar ao componente `WhatsAppMonitor` um cálculo de tempo restante baseado na média de 21s por mensagem, exibido como badge ou texto ao lado dos contadores existentes.

### Alterações

**`src/components/WhatsAppMonitor.tsx`**

1. Calcular `remaining = total - processed` e `estimatedSeconds = remaining * 21`
2. Formatar em minutos/horas (ex: "~12 min restantes", "~2h 15min restantes")
3. Exibir como badge ao lado dos contadores existentes, visível apenas quando há mensagens pendentes e o envio não está pausado/concluído
4. Usar ícone `Clock` já importado no componente

