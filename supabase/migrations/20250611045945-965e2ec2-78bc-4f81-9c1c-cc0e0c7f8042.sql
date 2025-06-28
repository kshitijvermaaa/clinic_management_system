
-- First, let's create a function to generate custom patient IDs
CREATE OR REPLACE FUNCTION generate_patient_id() RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Generate 2 random uppercase letters + 6 random digits
        new_id := 
            chr(65 + floor(random() * 26)::int) || 
            chr(65 + floor(random() * 26)::int) || 
            lpad(floor(random() * 1000000)::text, 6, '0');
        
        -- Check if this ID already exists
        SELECT COUNT(*) INTO exists_check FROM patients WHERE patient_id = new_id;
        
        -- If it doesn't exist, we can use it
        IF exists_check = 0 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Add patient_id column to patients table
ALTER TABLE patients ADD COLUMN patient_id TEXT UNIQUE;

-- Update existing patients with new patient IDs
UPDATE patients SET patient_id = generate_patient_id() WHERE patient_id IS NULL;

-- Make patient_id not null and set default
ALTER TABLE patients ALTER COLUMN patient_id SET NOT NULL;
ALTER TABLE patients ALTER COLUMN patient_id SET DEFAULT generate_patient_id();

-- Update appointments table to reference patient_id instead of UUID
ALTER TABLE appointments ADD COLUMN patient_custom_id TEXT;

-- Copy existing patient references using the new patient_id
UPDATE appointments 
SET patient_custom_id = (
    SELECT patient_id 
    FROM patients 
    WHERE patients.id = appointments.patient_id
);

-- Drop the old foreign key and rename the column
ALTER TABLE appointments DROP COLUMN patient_id;
ALTER TABLE appointments RENAME COLUMN patient_custom_id TO patient_id;

-- Add foreign key constraint
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_patient_id 
FOREIGN KEY (patient_id) REFERENCES patients(patient_id);

-- Do the same for treatments table
ALTER TABLE treatments ADD COLUMN patient_custom_id TEXT;

UPDATE treatments 
SET patient_custom_id = (
    SELECT patient_id 
    FROM patients 
    WHERE patients.id = treatments.patient_id
);

ALTER TABLE treatments DROP COLUMN patient_id;
ALTER TABLE treatments RENAME COLUMN patient_custom_id TO patient_id;

ALTER TABLE treatments ADD CONSTRAINT fk_treatments_patient_id 
FOREIGN KEY (patient_id) REFERENCES patients(patient_id);

-- Do the same for prescriptions table
ALTER TABLE prescriptions ADD COLUMN patient_custom_id TEXT;

UPDATE prescriptions 
SET patient_custom_id = (
    SELECT patient_id 
    FROM patients 
    WHERE patients.id = prescriptions.patient_id
);

ALTER TABLE prescriptions DROP COLUMN patient_id;
ALTER TABLE prescriptions RENAME COLUMN patient_custom_id TO patient_id;

ALTER TABLE prescriptions ADD CONSTRAINT fk_prescriptions_patient_id 
FOREIGN KEY (patient_id) REFERENCES patients(patient_id);
