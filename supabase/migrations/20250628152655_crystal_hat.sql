/*
  # Lab Work Management Schema

  1. New Tables
    - `lab_work`
      - `id` (uuid, primary key)
      - `patient_id` (text, foreign key to patients)
      - `treatment_id` (uuid, foreign key to treatments, optional)
      - `lab_type` (text, type of lab work)
      - `lab_name` (text, name of the laboratory)
      - `work_description` (text, description of work requested)
      - `instructions` (text, special instructions)
      - `date_sent` (date, when sent to lab)
      - `expected_date` (date, expected completion)
      - `actual_date` (date, actual completion)
      - `status` (enum: pending, in_progress, completed, delivered)
      - `cost` (decimal, lab work cost)
      - `notes` (text, additional notes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `lab_work_files`
      - `id` (uuid, primary key)
      - `lab_work_id` (uuid, foreign key to lab_work)
      - `file_name` (text, original file name)
      - `file_path` (text, storage path)
      - `file_type` (text, mime type)
      - `file_size` (integer, file size in bytes)
      - `uploaded_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create enum for lab work status
CREATE TYPE public.lab_work_status AS ENUM ('pending', 'in_progress', 'completed', 'delivered');

-- Create lab_work table
CREATE TABLE IF NOT EXISTS public.lab_work (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id text NOT NULL REFERENCES public.patients(patient_id) ON DELETE CASCADE,
  treatment_id uuid REFERENCES public.treatments(id) ON DELETE SET NULL,
  lab_type text NOT NULL,
  lab_name text NOT NULL,
  work_description text NOT NULL,
  instructions text,
  date_sent date NOT NULL DEFAULT CURRENT_DATE,
  expected_date date,
  actual_date date,
  status lab_work_status NOT NULL DEFAULT 'pending',
  cost decimal(10,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lab_work_files table
CREATE TABLE IF NOT EXISTS public.lab_work_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_work_id uuid NOT NULL REFERENCES public.lab_work(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lab_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_work_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view lab work" ON public.lab_work FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert lab work" ON public.lab_work FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update lab work" ON public.lab_work FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete lab work" ON public.lab_work FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view lab work files" ON public.lab_work_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert lab work files" ON public.lab_work_files FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update lab work files" ON public.lab_work_files FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete lab work files" ON public.lab_work_files FOR DELETE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lab_work_patient ON public.lab_work(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_work_status ON public.lab_work(status);
CREATE INDEX IF NOT EXISTS idx_lab_work_date_sent ON public.lab_work(date_sent);
CREATE INDEX IF NOT EXISTS idx_lab_work_files_lab_work ON public.lab_work_files(lab_work_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_lab_work_updated_at BEFORE UPDATE ON public.lab_work
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();