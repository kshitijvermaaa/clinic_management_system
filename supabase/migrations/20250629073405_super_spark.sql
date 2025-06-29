/*
  # Create payments table for lab work and treatment payments

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `patient_id` (text, foreign key to patients.patient_id)
      - `treatment_id` (uuid, foreign key to treatments.id, nullable)
      - `lab_work_id` (uuid, foreign key to lab_work.id, nullable)
      - `amount` (numeric, payment amount)
      - `payment_date` (date, when payment was made)
      - `payment_method` (text, how payment was made)
      - `notes` (text, optional payment notes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `payments` table
    - Add policies for authenticated users to manage payments

  3. Indexes
    - Add indexes for efficient querying by patient, treatment, and lab work
*/

-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id text NOT NULL,
  treatment_id uuid,
  lab_work_id uuid,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text NOT NULL DEFAULT 'cash',
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'payments_patient_id_fkey'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_patient_id_fkey 
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'payments_treatment_id_fkey'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_treatment_id_fkey 
    FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'payments_lab_work_id_fkey'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_lab_work_id_fkey 
    FOREIGN KEY (lab_work_id) REFERENCES lab_work(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_payments_patient ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_treatment ON payments(treatment_id);
CREATE INDEX IF NOT EXISTS idx_payments_lab_work ON payments(lab_work_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY IF NOT EXISTS "Authenticated users can view payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can insert payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can update payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can delete payments"
  ON payments
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();