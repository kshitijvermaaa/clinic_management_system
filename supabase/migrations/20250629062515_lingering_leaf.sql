/*
  # Lab Work Payment Tracking System

  1. New Tables
    - `lab_work_payments`
      - `id` (uuid, primary key)
      - `lab_work_id` (uuid, foreign key to lab_work)
      - `amount` (decimal, payment amount)
      - `payment_date` (date, when payment was made)
      - `payment_method` (text, how payment was made)
      - `notes` (text, payment notes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on lab_work_payments table
    - Add policies for authenticated users

  3. Functions
    - Function to calculate total payments for lab work
    - Function to calculate remaining balance
*/

-- Create lab_work_payments table
CREATE TABLE IF NOT EXISTS public.lab_work_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_work_id uuid NOT NULL REFERENCES public.lab_work(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text NOT NULL DEFAULT 'cash',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lab_work_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view lab work payments" ON public.lab_work_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert lab work payments" ON public.lab_work_payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update lab work payments" ON public.lab_work_payments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete lab work payments" ON public.lab_work_payments FOR DELETE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lab_work_payments_lab_work ON public.lab_work_payments(lab_work_id);
CREATE INDEX IF NOT EXISTS idx_lab_work_payments_date ON public.lab_work_payments(payment_date);

-- Function to calculate total payments for a lab work
CREATE OR REPLACE FUNCTION get_lab_work_total_payments(lab_work_uuid uuid)
RETURNS decimal(10,2) AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(amount) FROM public.lab_work_payments WHERE lab_work_id = lab_work_uuid),
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate remaining balance for a lab work
CREATE OR REPLACE FUNCTION get_lab_work_balance(lab_work_uuid uuid)
RETURNS decimal(10,2) AS $$
DECLARE
  total_cost decimal(10,2);
  total_paid decimal(10,2);
BEGIN
  SELECT COALESCE(cost, 0) INTO total_cost FROM public.lab_work WHERE id = lab_work_uuid;
  SELECT get_lab_work_total_payments(lab_work_uuid) INTO total_paid;
  
  RETURN total_cost - total_paid;
END;
$$ LANGUAGE plpgsql;