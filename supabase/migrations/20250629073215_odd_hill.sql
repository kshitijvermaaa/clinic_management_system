/*
  # Create payments table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `patient_id` (text, foreign key to patients.patient_id)
      - `treatment_id` (uuid, foreign key to treatments.id, nullable)
      - `lab_work_id` (uuid, foreign key to lab_work.id, nullable)
      - `amount` (numeric, required)
      - `payment_date` (date, required)
      - `payment_method` (text, required)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `payments` table
    - Add policies for authenticated users to perform CRUD operations

  3. Indexes
    - Add indexes on foreign key columns for performance
    - Add indexes on commonly queried columns (payment_date, patient_id)

  4. Constraints
    - Add check constraint to ensure amount is positive
    - Add foreign key constraints with appropriate cascade behavior
*/

-- Create the payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id text NOT NULL,
    treatment_id uuid,
    lab_work_id uuid,
    amount numeric(10,2) NOT NULL,
    payment_date date NOT NULL DEFAULT CURRENT_DATE,
    payment_method text NOT NULL DEFAULT 'cash',
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE public.payments 
ADD CONSTRAINT payments_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;

ALTER TABLE public.payments 
ADD CONSTRAINT payments_treatment_id_fkey 
FOREIGN KEY (treatment_id) REFERENCES public.treatments(id) ON DELETE SET NULL;

ALTER TABLE public.payments 
ADD CONSTRAINT payments_lab_work_id_fkey 
FOREIGN KEY (lab_work_id) REFERENCES public.lab_work(id) ON DELETE SET NULL;

-- Add check constraint for positive amounts
ALTER TABLE public.payments 
ADD CONSTRAINT payments_amount_check 
CHECK (amount > 0);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_patient ON public.payments (patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_treatment ON public.payments (treatment_id);
CREATE INDEX IF NOT EXISTS idx_payments_lab_work ON public.payments (lab_work_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments (payment_date);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_payments_updated_at'
    ) THEN
        CREATE TRIGGER update_payments_updated_at
            BEFORE UPDATE ON public.payments
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Authenticated users can view payments"
    ON public.payments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert payments"
    ON public.payments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments"
    ON public.payments
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete payments"
    ON public.payments
    FOR DELETE
    TO authenticated
    USING (true);