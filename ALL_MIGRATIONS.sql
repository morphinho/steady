/*
  ============================================
  TODAS AS MIGRAÇÕES COMBINADAS
  Execute este arquivo no Supabase SQL Editor
  ============================================
*/

-- ============================================
-- Migração 1: Criar tabelas principais
-- ============================================

-- Criar tabela de perfis
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de entradas financeiras
CREATE TABLE IF NOT EXISTS incomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor decimal(12, 2) NOT NULL DEFAULT 0,
  data date NOT NULL DEFAULT CURRENT_DATE,
  fonte text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('recorrente', 'pontual')),
  projeto text,
  conta text NOT NULL CHECK (conta IN ('pessoal', 'negocio')),
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de gastos financeiros
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor decimal(12, 2) NOT NULL DEFAULT 0,
  data date NOT NULL DEFAULT CURRENT_DATE,
  categoria text NOT NULL,
  descricao text,
  tipo text NOT NULL CHECK (tipo IN ('fixo', 'variavel')),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente')),
  conta text NOT NULL CHECK (conta IN ('pessoal', 'negocio')),
  recorrente boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS incomes_user_id_idx ON incomes(user_id);
CREATE INDEX IF NOT EXISTS incomes_data_idx ON incomes(data);
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_data_idx ON expenses(data);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
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

-- Políticas para incomes
CREATE POLICY "Usuários podem visualizar próprias entradas"
  ON incomes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar próprias entradas"
  ON incomes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprias entradas"
  ON incomes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar próprias entradas"
  ON incomes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para expenses
CREATE POLICY "Usuários podem visualizar próprios gastos"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar próprios gastos"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprios gastos"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar próprios gastos"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- Migração 2: Permitir acesso anônimo
-- ============================================

-- Políticas públicas para incomes
CREATE POLICY "Acesso público para visualizar entradas"
  ON incomes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acesso público para criar entradas"
  ON incomes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acesso público para atualizar entradas"
  ON incomes FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso público para deletar entradas"
  ON incomes FOR DELETE
  TO anon
  USING (true);

-- Políticas públicas para expenses
CREATE POLICY "Acesso público para visualizar gastos"
  ON expenses FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acesso público para criar gastos"
  ON expenses FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acesso público para atualizar gastos"
  ON expenses FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso público para deletar gastos"
  ON expenses FOR DELETE
  TO anon
  USING (true);

-- ============================================
-- Migração 3: Permitir user_id NULL
-- ============================================

-- Alterar incomes para permitir user_id NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'incomes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE incomes DROP CONSTRAINT IF EXISTS incomes_user_id_fkey;
    ALTER TABLE incomes ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- Alterar expenses para permitir user_id NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;
    ALTER TABLE expenses ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- ============================================
-- Migração 4: Criar tabela de dívidas
-- ============================================

CREATE TABLE IF NOT EXISTS debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  nome text NOT NULL,
  credor text NOT NULL,
  valor_total decimal(12, 2) NOT NULL DEFAULT 0,
  valor_pago decimal(12, 2) NOT NULL DEFAULT 0,
  data_inicio date NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento date,
  taxa_juros decimal(5, 2) DEFAULT 0,
  status text NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'paga', 'atrasada')),
  conta text NOT NULL CHECK (conta IN ('pessoal', 'negocio')),
  parcelas_total int,
  parcelas_pagas int DEFAULT 0,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS debts_user_id_idx ON debts(user_id);
CREATE INDEX IF NOT EXISTS debts_status_idx ON debts(status);
CREATE INDEX IF NOT EXISTS debts_data_vencimento_idx ON debts(data_vencimento);

-- Habilitar RLS
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para acesso anônimo
CREATE POLICY "Acesso público para visualizar dívidas"
  ON debts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Acesso público para criar dívidas"
  ON debts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Acesso público para atualizar dívidas"
  ON debts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso público para deletar dívidas"
  ON debts FOR DELETE
  TO anon
  USING (true);

-- Políticas para usuários autenticados
CREATE POLICY "Usuários autenticados podem visualizar dívidas"
  ON debts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar dívidas"
  ON debts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar dívidas"
  ON debts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar dívidas"
  ON debts FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- Migração 5: Expandir tabela de perfis
-- ============================================

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

-- Políticas públicas para perfis
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

-- ============================================
-- Migração 6: Configurar Storage para Avatares
-- ============================================

-- NOTA: O bucket 'avatars' precisa ser criado manualmente no Supabase Dashboard
-- Storage > Create bucket > Nome: 'avatars' > Public: true

-- Política para permitir leitura pública de avatares
DROP POLICY IF EXISTS "Permitir leitura pública de avatares" ON storage.objects;
CREATE POLICY "Permitir leitura pública de avatares"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política para permitir upload de avatares para usuários autenticados
DROP POLICY IF EXISTS "Permitir upload de avatares" ON storage.objects;
CREATE POLICY "Permitir upload de avatares"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Política para permitir atualização de avatares próprios
DROP POLICY IF EXISTS "Permitir atualização de avatares próprios" ON storage.objects;
CREATE POLICY "Permitir atualização de avatares próprios"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Política para permitir deleção de avatares próprios
DROP POLICY IF EXISTS "Permitir deleção de avatares próprios" ON storage.objects;
CREATE POLICY "Permitir deleção de avatares próprios"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Políticas para acesso anônimo
DROP POLICY IF EXISTS "Permitir leitura pública de avatares (anon)" ON storage.objects;
CREATE POLICY "Permitir leitura pública de avatares (anon)"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Permitir upload de avatares (anon)" ON storage.objects;
CREATE POLICY "Permitir upload de avatares (anon)"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Permitir atualização de avatares (anon)" ON storage.objects;
CREATE POLICY "Permitir atualização de avatares (anon)"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Permitir deleção de avatares (anon)" ON storage.objects;
CREATE POLICY "Permitir deleção de avatares (anon)"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'avatars');

-- ============================================
-- Migração 7: Garantir colunas do perfil
-- ============================================

-- Garantir que todas as colunas existam (usando IF NOT EXISTS)
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

