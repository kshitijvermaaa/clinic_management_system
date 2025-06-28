
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Treatment {
  id: string;
  patient_id: string;
  appointment_id?: string;
  treatment_date: string;
  teeth_involved?: string[];
  procedure_done: string;
  materials_used?: string;
  notes?: string;
  treatment_status: 'ongoing' | 'completed' | 'paused';
  next_appointment_date?: string;
  treatment_cost?: number;
  created_at: string;
  updated_at: string;
  patients?: {
    full_name: string;
    mobile_number: string;
  };
}

export const useTreatments = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTreatments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('treatments')
        .select(`
          *,
          patients:patient_id (
            full_name,
            mobile_number
          )
        `)
        .order('treatment_date', { ascending: false });

      if (error) {
        console.error('Error fetching treatments:', error);
        toast({
          title: "Error",
          description: "Failed to load treatments. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setTreatments(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading treatments.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTreatment = async (treatmentData: Omit<Treatment, 'id' | 'created_at' | 'updated_at' | 'patients'>) => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .insert(treatmentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating treatment:', error);
        throw error;
      }

      // Refresh the treatments list
      await fetchTreatments();
      return data;
    } catch (error) {
      console.error('Error in createTreatment:', error);
      throw error;
    }
  };

  const updateTreatment = async (treatmentId: string, updates: Partial<Treatment>) => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .update(updates)
        .eq('id', treatmentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating treatment:', error);
        throw error;
      }

      // Refresh the treatments list
      await fetchTreatments();
      return data;
    } catch (error) {
      console.error('Error in updateTreatment:', error);
      throw error;
    }
  };

  const getTreatmentsByPatient = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('patient_id', patientId)
        .order('treatment_date', { ascending: false });

      if (error) {
        console.error('Error fetching patient treatments:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTreatmentsByPatient:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  return {
    treatments,
    isLoading,
    fetchTreatments,
    createTreatment,
    updateTreatment,
    getTreatmentsByPatient,
  };
};
