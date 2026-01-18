# Como Executar a Migração

## Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://app.supabase.com
   - Faça login e selecione seu projeto

2. **Abra o SQL Editor:**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New query**

3. **Execute a migração:**
   - Abra o arquivo: `project/supabase/migrations/20260120000000_add_profile_columns.sql`
   - Copie TODO o conteúdo do arquivo
   - Cole no SQL Editor do Supabase
   - Clique em **Run** (ou pressione `Ctrl+Enter`)

4. **Verifique o resultado:**
   - Você deve ver uma mensagem de sucesso
   - As colunas serão adicionadas à tabela `profiles`

## Opção 2: Via Supabase CLI

Se você tem o Supabase CLI instalado:

```bash
cd project
supabase db push
```

## O que a migração faz:

✅ Adiciona as colunas necessárias:
- `first_name` (text)
- `last_name` (text)
- `phone` (text)
- `avatar_url` (text)
- `bio` (text)

✅ Cria função e trigger para atualizar `full_name` automaticamente

✅ Configura políticas RLS para usuários autenticados

## Verificação

Após executar a migração, você pode verificar se funcionou:

1. No Supabase Dashboard, vá em **Table Editor**
2. Selecione a tabela `profiles`
3. Verifique se as novas colunas aparecem

## Suas Credenciais

- **URL:** https://dxfhjkirjhptfqnlnugj.supabase.co
- **Projeto:** dxfhjkirjhptfqnlnugj

