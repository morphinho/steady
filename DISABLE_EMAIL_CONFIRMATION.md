# Como Desabilitar Confirmação de Email no Supabase

## Passo a Passo

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://app.supabase.com
   - Faça login e selecione seu projeto: `mhrescjawktjoiypeica`

2. **Navegue até Authentication Settings:**
   - No menu lateral esquerdo, clique em **Authentication**
   - Clique em **Providers** (ou vá direto em **Settings**)

3. **Desabilite Email Confirmation:**
   - Procure pela seção **Email Auth** ou **Email Provider**
   - Encontre a opção **"Enable email confirmations"** ou **"Confirm email"**
   - **Desmarque/Desative** essa opção
   - Clique em **Save** ou **Update**

4. **Alternativa - Via Auth Settings:**
   - Em **Authentication** → **Settings**
   - Procure por **"Enable email confirmations"**
   - Desative essa opção
   - Salve as alterações

5. **Verifique:**
   - Após desabilitar, novos usuários poderão fazer login imediatamente após criar a conta
   - Não será necessário confirmar o email antes de fazer login

## Importante

- Esta configuração afeta apenas **novos usuários**
- Usuários que já criaram conta antes dessa mudança podem precisar confirmar o email uma vez
- Para usuários existentes que não confirmaram o email, você pode confirmar manualmente no Dashboard:
  - Vá em **Authentication** → **Users**
  - Encontre o usuário
  - Clique nos três pontos (⋯) → **Confirm email**

## Após Desabilitar

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Teste criando uma nova conta - o login deve funcionar imediatamente sem precisar confirmar o email.

