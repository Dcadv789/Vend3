/*
  # Create simulations table

  1. New Tables
    - `simulations`
      - `id` (uuid, primary key)
      - `type` (text) - Tipo de simulação (SAC ou PRICE)
      - `financing_amount` (numeric) - Valor do financiamento
      - `down_payment` (numeric) - Entrada
      - `operation_date` (date) - Data da operação
      - `first_payment_date` (date) - Data do primeiro pagamento
      - `months` (integer) - Prazo em meses
      - `monthly_rate` (numeric) - Taxa mensal
      - `yearly_rate` (numeric) - Taxa anual
      - `bank` (text) - Banco
      - `installments` (jsonb) - Array de parcelas
      - `totals` (jsonb) - Totais do financiamento
      - `created_at` (timestamptz) - Data de criação
      - `user_id` (uuid) - ID do usuário (foreign key)

  2. Security
    - Enable RLS on `simulations` table
    - Add policies for authenticated users to manage their own simulations
*/

CREATE TABLE IF NOT EXISTS simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  financing_amount numeric NOT NULL,
  down_payment numeric NOT NULL,
  operation_date date NOT NULL,
  first_payment_date date NOT NULL,
  months integer NOT NULL,
  monthly_rate numeric NOT NULL,
  yearly_rate numeric NOT NULL,
  bank text,
  installments jsonb NOT NULL,
  totals jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own simulations"
  ON simulations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own simulations"
  ON simulations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own simulations"
  ON simulations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);