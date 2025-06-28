import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Prescription {
  id: string;
  patient_id: string;
  treatment_id?: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  prescribed_date: string;
  created_at: string;
  patients?: {
    full_name: string;
    mobile_number: string;
    patient_id: string;
  };
  treatments?: {
    procedure_done: string;
  };
}

interface PrescriptionCreate {
  patient_id: string;
  treatment_id?: string;
  medications: {
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  diagnosis: string;
  symptoms?: string;
  notes?: string;
}

export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPrescriptions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patients:patient_id (
            full_name,
            mobile_number,
            patient_id
          ),
          treatments:treatment_id (
            procedure_done
          )
        `)
        .order('prescribed_date', { ascending: false });

      if (error) {
        console.error('Error fetching prescriptions:', error);
        toast({
          title: "Error",
          description: "Failed to load prescriptions. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setPrescriptions(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading prescriptions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPrescription = async (prescriptionData: PrescriptionCreate) => {
    try {
      const prescriptionRecords = prescriptionData.medications.map(medication => ({
        patient_id: prescriptionData.patient_id,
        treatment_id: prescriptionData.treatment_id || null,
        medication_name: medication.medication_name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        duration: medication.duration,
        instructions: medication.instructions || null,
        prescribed_date: new Date().toISOString().split('T')[0]
      }));

      const { data, error } = await supabase
        .from('prescriptions')
        .insert(prescriptionRecords)
        .select();

      if (error) {
        console.error('Error creating prescription:', error);
        throw error;
      }

      await fetchPrescriptions();
      return data;
    } catch (error) {
      console.error('Error in createPrescription:', error);
      throw error;
    }
  };

  const getPrescriptionsByPatient = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          treatments:treatment_id (
            procedure_done
          )
        `)
        .eq('patient_id', patientId)
        .order('prescribed_date', { ascending: false });

      if (error) {
        console.error('Error fetching patient prescriptions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPrescriptionsByPatient:', error);
      throw error;
    }
  };

  const updatePrescription = async (prescriptionId: string, updates: Partial<Prescription>) => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .update(updates)
        .eq('id', prescriptionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating prescription:', error);
        throw error;
      }

      await fetchPrescriptions();
      return data;
    } catch (error) {
      console.error('Error in updatePrescription:', error);
      throw error;
    }
  };

  const deletePrescription = async (prescriptionId: string) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', prescriptionId);

      if (error) {
        console.error('Error deleting prescription:', error);
        throw error;
      }

      await fetchPrescriptions();
    } catch (error) {
      console.error('Error in deletePrescription:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return {
    prescriptions,
    isLoading,
    fetchPrescriptions,
    createPrescription,
    getPrescriptionsByPatient,
    updatePrescription,
    deletePrescription,
  };
};