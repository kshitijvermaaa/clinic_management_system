
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  patient_nickname?: string;
  gender: string;
  date_of_birth: string;
  address: string;
  mobile_number: string;
  email?: string;
  blood_group?: string;
  allergies?: string;
  referred_by?: string;
  emergency_contact?: string;
  chronic_conditions?: string;
  insurance_details?: string;
  created_at: string;
  updated_at: string;
}

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patients:', error);
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setPatients(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading patients.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPatient = async (patientData: Omit<Patient, 'id' | 'patient_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        throw error;
      }

      await fetchPatients();
      return data;
    } catch (error) {
      console.error('Error in createPatient:', error);
      throw error;
    }
  };

  const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('patient_id', patientId)
        .select()
        .single();

      if (error) {
        console.error('Error updating patient:', error);
        throw error;
      }

      await fetchPatients();
      return data;
    } catch (error) {
      console.error('Error in updatePatient:', error);
      throw error;
    }
  };

  const getPatientById = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (error) {
        console.error('Error fetching patient:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    isLoading,
    fetchPatients,
    createPatient,
    updatePatient,
    getPatientById,
  };
};
