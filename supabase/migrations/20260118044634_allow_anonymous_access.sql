/*
  # Permitir Acesso Anônimo ao App

  ## Mudanças
  
  1. Adicionar políticas para permitir acesso anônimo (público) às tabelas
    - Permite SELECT, INSERT, UPDATE, DELETE sem autenticação
    - Remove necessidade de login para usar o app
  
  ## Segurança
  
  - RLS permanece habilitado
  - Políticas públicas permitem acesso total para demonstração
  - Em produção, considere adicionar validações adicionais
*/

-- Políticas públicas para incomes (permitir tudo para anon)
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

-- Políticas públicas para expenses (permitir tudo para anon)
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