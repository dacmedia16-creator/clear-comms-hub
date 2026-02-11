

# Trocar a ZIONTALK_API_KEY no Backend

## O que sera feito

Atualizar o secret `ZIONTALK_API_KEY` armazenado no Lovable Cloud. Essa chave e usada como fallback pelas Edge Functions de WhatsApp quando nenhum numero cadastrado na tabela `whatsapp_senders` esta ativo.

## Passo unico

- Usar a ferramenta de secrets para solicitar a nova API Key do Zion Talk
- Voce vai colar a nova chave em um campo seguro
- O sistema substitui automaticamente o valor antigo

## Observacao

Se voce tambem precisa trocar a API Key de um numero especifico cadastrado na Central de Notificacoes (tabela `whatsapp_senders`), isso e feito pela interface do Super Admin, editando o numero desejado. Essa alteracao e independente do secret do backend.

