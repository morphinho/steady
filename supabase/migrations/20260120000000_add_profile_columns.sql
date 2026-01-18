/*
  # Adicionar Colunas ao Perfil
  
  ## Mudanças
  
  1. Adicionar todas as colunas necessárias à tabela profiles:
    - `first_name` (text, nullable) - Nome
    - `last_name` (text, nullable) - Sobrenome
    - `phone` (text, nullable) - Telefone
    - `avatar_url` (text, nullable) - URL do avatar
    - `bio` (text, nullable) - Biografia
  
  2. Criar função para atualizar full_name automaticamente
  3. Criar trigger para atualizar full_name e updated_at
*/

-- Adicionar novos campos à tabela profiles (usando IF NOT EXISTS para evitar erros)
DO $$ 
BEGIN
  -- Adicionar first_name se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN first_name text;
  END IF;

  -- Adicionar last_name se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_name text;
  END IF;

  -- Adicionar phone se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;

  -- Adicionar avatar_url se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;

  -- Adicionar bio se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;
END $$;

-- Criar ou substituir função para atualizar full_name automaticamente
CREATE OR REPLACE FUNCTION update_full_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL THEN
    NEW.full_name = TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar ou substituir trigger para atualizar full_name e updated_at
DROP TRIGGER IF EXISTS update_profile_full_name ON profiles;
CREATE TRIGGER update_profile_full_name
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_full_name();

-- Garantir que as políticas RLS permitam UPDATE e INSERT para authenticated users
DO $$
BEGIN
  -- Remover políticas antigas se existirem
  DROP POLICY IF EXISTS "Usuários podem visualizar próprio perfil" ON profiles;
  DROP POLICY IF EXISTS "Usuários podem inserir próprio perfil" ON profiles;
  DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON profiles;
  
  -- Criar políticas para usuários autenticados
  CREATE POLICY "Usuários podem visualizar próprio perfil"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Usuários podem inserir próprio perfil"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

  CREATE POLICY "Usuários podem atualizar próprio perfil"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
END $$;

