/*
  # Corrigir Storage para Avatares - RLS Policies
  
  Este script corrige as políticas RLS para o bucket avatars.
  Execute este script no Supabase SQL Editor.
*/

-- Remover políticas antigas se existirem (para evitar conflitos)
DROP POLICY IF EXISTS "Permitir leitura pública de avatares" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de avatares" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de avatares próprios" ON storage.objects;
DROP POLICY IF EXISTS "Permitir deleção de avatares próprios" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de avatares (anon)" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de avatares (anon)" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de avatares (anon)" ON storage.objects;
DROP POLICY IF EXISTS "Permitir deleção de avatares (anon)" ON storage.objects;

-- Política para permitir leitura pública de avatares
CREATE POLICY "Permitir leitura pública de avatares"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política para permitir upload de avatares para usuários autenticados
-- Permite upload na pasta do próprio usuário: {user_id}/filename
CREATE POLICY "Permitir upload de avatares"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Política para permitir atualização de avatares próprios
CREATE POLICY "Permitir atualização de avatares próprios"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Política para permitir deleção de avatares próprios
CREATE POLICY "Permitir deleção de avatares próprios"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

