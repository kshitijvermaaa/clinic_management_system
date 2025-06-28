
-- Create enum types first
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE public.treatment_status AS ENUM ('ongoing', 'completed', 'paused');
CREATE TYPE public.appointment_type AS ENUM ('regular', 'emergency', 'walkin', 'followup');

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  patient_nickname TEXT,
  gender TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  address TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT,
  blood_group TEXT,
  allergies TEXT,
  referred_by TEXT,
  emergency_contact TEXT,
  chronic_conditions TEXT,
  insurance_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  appointment_type appointment_type NOT NULL DEFAULT 'regular',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treatments table
CREATE TABLE public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  treatment_date DATE NOT NULL,
  teeth_involved TEXT[],
  procedure_done TEXT NOT NULL,
  materials_used TEXT,
  notes TEXT,
  treatment_status treatment_status NOT NULL DEFAULT 'ongoing',
  next_appointment_date DATE,
  treatment_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  treatment_id UUID REFERENCES public.treatments(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  prescribed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clinic_holidays table
CREATE TABLE public.clinic_holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  holiday_date DATE NOT NULL UNIQUE,
  holiday_name TEXT NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  is_half_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clinic_closures table (for emergency closures)
CREATE TABLE public.clinic_closures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  closure_date DATE NOT NULL,
  reason TEXT NOT NULL,
  is_half_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user authentication
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'doctor',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Authenticated users can view patients" ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update patients" ON public.patients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete patients" ON public.patients FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view appointments" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete appointments" ON public.appointments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view treatments" ON public.treatments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert treatments" ON public.treatments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update treatments" ON public.treatments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete treatments" ON public.treatments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view prescriptions" ON public.prescriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert prescriptions" ON public.prescriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update prescriptions" ON public.prescriptions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete prescriptions" ON public.prescriptions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view holidays" ON public.clinic_holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert holidays" ON public.clinic_holidays FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update holidays" ON public.clinic_holidays FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete holidays" ON public.clinic_holidays FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view closures" ON public.clinic_closures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert closures" ON public.clinic_closures FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update closures" ON public.clinic_closures FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete closures" ON public.clinic_closures FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', 'doctor');
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_patients_mobile ON public.patients(mobile_number);
CREATE INDEX idx_patients_name ON public.patients(full_name);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_treatments_patient ON public.treatments(patient_id);
CREATE INDEX idx_treatments_date ON public.treatments(treatment_date);
CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
