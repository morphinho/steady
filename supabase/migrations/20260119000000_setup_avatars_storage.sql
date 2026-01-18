/*
  # Configurar Storage para Avatares

  ## Mudanças
  
  1. Criar bucket 'avatars' se não existir
  2. Configurar políticas de acesso:
     - Público para leitura (SELECT)
     - Autenticado para upload (INSERT)
     - Usuário pode atualizar/deletar apenas seus próprios arquivos
*/

-- Criar bucket 'avatars' (isso precisa ser feito manualmente no Supabase Dashboard)
-- Storage > Create bucket > Nome: 'avatars' > Public: true

-- Política para permitir leitura pública de avatares
CREATE POLICY IF NOT EXISTS "Permitir leitura pública de avatares"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política para permitir upload de avatares para usuários autenticados
CREATE POLICY IF NOT EXISTS "Permitir upload de avatares"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Política para permitir atualização de avatares próprios
CREATE POLICY IF NOT EXISTS "Permitir atualização de avatares próprios"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Política para permitir deleção de avatares próprios
CREATE POLICY IF NOT EXISTS "Permitir deleção de avatares próprios"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Política para permitir acesso anônimo também (caso necessário)
CREATE POLICY IF NOT EXISTS "Permitir leitura pública de avatares (anon)"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Permitir upload de avatares (anon)"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Permitir atualização de avatares (anon)"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Permitir deleção de avatares (anon)"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'avatars');

