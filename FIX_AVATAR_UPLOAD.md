# Como Corrigir o Upload de Avatar

## Problema
Erro: "new row violates row-level security policy" ao tentar fazer upload de avatar.

## Solução

### Passo 1: Criar o Bucket no Supabase

1. Acesse o **Supabase Dashboard**: https://app.supabase.com
2. Selecione seu projeto: `mhrescjawktjoiypeica`
3. Vá em **Storage** no menu lateral
4. Clique em **Create bucket**
5. Configure:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Marcar como público**
   - **File size limit**: `5242880` (5MB) - opcional
6. Clique em **Create bucket**

### Passo 2: Executar a Migração SQL

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New query**
3. Abra o arquivo: `supabase/migrations/20260121000000_fix_avatars_storage.sql`
4. Copie **TODO** o conteúdo do arquivo
5. Cole no SQL Editor
6. Clique em **Run** (ou pressione `Ctrl+Enter`)

### Passo 3: Verificar

1. Tente fazer upload de uma foto de perfil novamente
2. O upload deve funcionar agora

## O que a migração faz?

- Remove políticas RLS antigas que podem estar causando conflito
- Cria novas políticas RLS corretas que permitem:
  - ✅ Leitura pública de avatares (qualquer um pode ver)
  - ✅ Upload de avatares para usuários autenticados (na pasta do próprio usuário)
  - ✅ Atualização de avatares próprios
  - ✅ Deleção de avatares próprios

## Estrutura de Pastas

Os avatares são salvos na estrutura:
```
avatars/
  └── {user_id}/
      └── avatar-{timestamp}.{ext}
```

Isso garante que cada usuário só possa acessar seus próprios arquivos.

## Se ainda não funcionar

1. Verifique se o bucket `avatars` existe e está marcado como público
2. Verifique se as políticas RLS foram criadas corretamente:
   - Vá em **Storage** → **Policies**
   - Deve haver 4 políticas para o bucket `avatars`
3. Verifique os logs do console do navegador para mais detalhes do erro

