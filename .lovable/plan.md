

## Assunto de email editavel para organizacoes genericas

Permitir que gestores de organizacoes do tipo `generic` personalizem o assunto do email ao criar um aviso, em vez de usar o padrao `[Nome da Org] Titulo do Aviso`.

### Alteracoes

**1. `src/pages/AdminCondominiumPage.tsx`**
- Novo state: `emailSubject` (string, inicializado vazio)
- Quando o usuario marca "Enviar via Email" E `organizationType === 'generic'`, exibir um campo de Input logo abaixo do checkbox de email com:
  - Label: "Assunto do email"
  - Placeholder: o valor padrao (`[NomeOrg] Titulo`)
  - Auto-preenchido com `[${condominium.name}] ${title}` quando vazio
- Passar `emailSubject` na chamada `sendEmailToMembers`
- Resetar `emailSubject` ao limpar o formulario

**2. `src/hooks/useSendEmail.ts`**
- Adicionar parametro opcional `emailSubject?: string` na interface `AnnouncementForEmail`
- Passar `email_subject` no body da chamada da edge function

**3. `supabase/functions/send-email/index.ts`**
- Aceitar `email_subject` opcional no `RequestBody`
- Na funcao `sendEmailsInBackground`, usar `email_subject` se fornecido, caso contrario manter o padrao `[${condominium.name}] ${announcement.title}`

### Detalhes tecnicos

- O campo de assunto so aparece quando: `organizationType === 'generic'` E `sendEmail === true` E `condominium?.notification_email === true`
- O placeholder mostra o assunto padrao em tempo real (atualiza conforme o titulo muda)
- Se o campo ficar vazio, o backend usa o formato padrao como fallback
- Nenhuma alteracao de banco de dados necessaria (o assunto nao e persistido, e usado apenas no momento do disparo)

### Arquivos modificados

- `src/pages/AdminCondominiumPage.tsx` (novo state + campo condicional + passagem do valor)
- `src/hooks/useSendEmail.ts` (novo parametro opcional)
- `supabase/functions/send-email/index.ts` (aceitar e usar assunto customizado)
