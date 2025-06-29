/*
  # Create payments table for tracking patient payments

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `patient_id` (text, foreign key to patients)
      - `treatment_id` (uuid, foreign key to treatments, optional)
      - `lab_work_id` (uuid, foreign key to lab_work, optional)
      - `amount` (numeric, payment amount)
      - `payment_date` (date, when payment was made)
      - `payment_method` (text, how payment was made)
      - `notes` (text, additional notes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on payments table
    - Add policies for authenticated users to manage payments

  3. Constraints
    - Foreign keys to patients, treatments, and lab_work
    - Check constraint for positive amounts
    - Indexes for performance
*/

-- Drop existing table if it exists to start fresh
DROP TABLE IF EXISTS public.payments CASCADE;

-- Create the payments table
CREATE TABLE public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id text NOT NULL,
    treatment_id uuid,
    lab_work_id uuid,
    amount numeric(10,2) NOT NULL,
    payment_date date NOT NULL DEFAULT CURRENT_DATE,
    payment_method text NOT NULL DEFAULT 'cash',
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Add constraints inline to avoid conflicts
    CONSTRAINT payments_patient_id_fkey 
        FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT payments_treatment_id_fkey 
        FOREIGN KEY (treatment_id) REFERENCES public.treatments(id) ON DELETE SET NULL,
    CONSTRAINT payments_lab_work_id_fkey 
        FOREIGN KEY (lab_work_id) REFERENCES public.lab_work(id) ON DELETE SET NULL,
    CONSTRAINT payments_amount_check 
        CHECK (amount > 0)
);

-- Create indexes for performance
CREATE INDEX idx_payments_patient ON public.payments (patient_id);
CREATE INDEX idx_payments_treatment ON public.payments (treatment_id);
CREATE INDEX idx_payments_lab_work ON public.payments (lab_work_id);
CREATE INDEX idx_payments_date ON public.payments (payment_date);

-- Create or replace the trigger function (safe to run multiple times)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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