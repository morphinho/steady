# Configuração do Storage para Avatares

Para que o upload de foto de perfil funcione, você precisa configurar o bucket de storage no Supabase.

## Passos para Configurar:

1. **Acesse o Supabase Dashboard**
   - Vá para o seu projeto no [Supabase Dashboard](https://app.supabase.com)

2. **Criar o Bucket**
   - No menu lateral, clique em **Storage**
   - Clique em **New bucket**
   - Nome: `avatars`
   - Marque **Public bucket** (para permitir acesso público às imagens)
   - Clique em **Create bucket**

3. **Configurar Políticas (RLS)**
   - Após criar o bucket, clique em **Policies** na página do bucket
   - Ou execute a migração SQL que está em `supabase/migrations/20260119000000_setup_avatars_storage.sql`
   - Isso configurará as políticas necessárias para:
     - Leitura pública de avatares
     - Upload por usuários autenticados
     - Atualização/deleção apenas dos próprios arquivos

4. **Alternativa: Executar Migração**
   - Se você usa Supabase CLI, execute:
     ```bash
     supabase db push
     ```
   - Ou copie e cole o conteúdo de `supabase/migrations/20260119000000_setup_avatars_storage.sql` no SQL Editor do Supabase

## Verificação

Após configurar, tente fazer upload de uma foto de perfil. Se ainda houver erros:

1. Verifique o console do navegador (F12) para ver mensagens de erro detalhadas
2. Verifique se o bucket foi criado corretamente
3. Verifique se as políticas RLS estão ativas
4. Verifique se o bucket está marcado como público

## Troubleshooting

- **Erro "Bucket not found"**: Certifique-se de que o bucket foi criado com o nome exato `avatars`
- **Erro de permissão**: Verifique se as políticas RLS foram aplicadas corretamente
- **Erro 403**: O bucket precisa estar marcado como público ou as políticas precisam permitir acesso anônimo

