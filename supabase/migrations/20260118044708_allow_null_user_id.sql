/*
  # Permitir user_id NULL

  ## Mudanças
  
  1. Alterar user_id para permitir NULL nas tabelas
    - Remove constraint NOT NULL de user_id em incomes
    - Remove constraint NOT NULL de user_id em expenses
    - Remove foreign key constraint com auth.users
  
  ## Motivo
  
  - App agora funciona sem autenticação
  - Todos os dados são públicos
*/

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