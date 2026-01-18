/*
  # Expandir Tabela de Perfis

  ## Mudanças
  
  1. Adicionar campos adicionais ao perfil:
    - `first_name` (text) - Nome
    - `last_name` (text) - Sobrenome
    - `phone` (text, nullable) - Telefone
    - `avatar_url` (text, nullable) - URL do avatar
    - `bio` (text, nullable) - Biografia
  
  2. Manter `full_name` para compatibilidade
*/

-- Adicionar novos campos à tabela profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS bio text;

-- Criar função para atualizar full_name automaticamente
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

-- Criar trigger para atualizar full_name e updated_at
DROP TRIGGER IF EXISTS update_profile_full_name ON profiles;
CREATE TRIGGER update_profile_full_name
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_full_name();

-- Atualizar políticas para permitir acesso anônimo (se necessário)
DROP POLICY IF EXISTS "Acesso público para visualizar perfis" ON profiles;
DROP POLICY IF EXISTS "Acesso público para criar perfis" ON profiles;
DROP POLICY IF EXISTS "Acesso público para atualizar perfis" ON profiles;

CREATE POLICY "Acesso público para visualizar perfis"
  ON profiles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acesso público para criar perfis"
  ON profiles FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acesso público para atualizar perfis"
  ON profiles FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

