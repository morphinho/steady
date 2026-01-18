/*
  # Criar Tabela de Dívidas

  ## Nova Tabela
  
  ### debts (Dívidas)
  - `id` (uuid, primary key) - ID único da dívida
  - `user_id` (uuid, nullable) - Referência ao usuário (nullable para acesso público)
  - `nome` (text) - Nome/descrição da dívida
  - `credor` (text) - Nome do credor (quem emprestou)
  - `valor_total` (decimal) - Valor total da dívida
  - `valor_pago` (decimal) - Quanto já foi pago
  - `data_inicio` (date) - Data de início da dívida
  - `data_vencimento` (date, nullable) - Data de vencimento
  - `taxa_juros` (decimal, nullable) - Taxa de juros (%)
  - `status` (text) - Status: 'aberta', 'paga', 'atrasada'
  - `conta` (text) - Tipo de conta: 'pessoal' ou 'negocio'
  - `parcelas_total` (int, nullable) - Número total de parcelas
  - `parcelas_pagas` (int, nullable) - Número de parcelas já pagas
  - `observacoes` (text, nullable) - Observações adicionais
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Data de última atualização
  
  ## Segurança (RLS)
  - RLS habilitado
  - Políticas públicas para acesso anônimo
  - SELECT, INSERT, UPDATE, DELETE permitidos para todos
*/

-- Criar tabela de dívidas
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

-- Políticas para usuários autenticados (caso futuramente habilitem auth)
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