/*
  # Sistema de Controle Financeiro Pessoal

  ## Tabelas Criadas
  
  ### 1. profiles
  - `id` (uuid, primary key) - Referência ao auth.users
  - `full_name` (text) - Nome completo do usuário
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Data de atualização
  
  ### 2. incomes (Entradas Financeiras)
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Referência ao usuário
  - `valor` (decimal) - Valor da entrada
  - `data` (date) - Data da entrada
  - `fonte` (text) - Fonte da entrada
  - `tipo` (text) - 'recorrente' ou 'pontual'
  - `projeto` (text) - Nome do projeto
  - `conta` (text) - 'pessoal' ou 'negocio'
  - `created_at` (timestamptz)
  
  ### 3. expenses (Gastos Financeiros)
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Referência ao usuário
  - `valor` (decimal) - Valor do gasto
  - `data` (date) - Data do gasto
  - `categoria` (text) - Categoria do gasto
  - `descricao` (text, nullable) - Descrição opcional
  - `tipo` (text) - 'fixo' ou 'variavel'
  - `status` (text) - 'pago' ou 'pendente'
  - `conta` (text) - 'pessoal' ou 'negocio'
  - `recorrente` (boolean) - Se é recorrente
  - `created_at` (timestamptz)
  
  ## Segurança (RLS)
  - RLS habilitado em todas as tabelas
  - Usuários só podem acessar seus próprios dados
  - Políticas para SELECT, INSERT, UPDATE e DELETE
*/

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