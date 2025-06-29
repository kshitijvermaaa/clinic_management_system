import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LabWork {
  id: string;
  patient_id: string;
  treatment_id?: string;
  lab_type: string;
  lab_name: string;
  work_description: string;
  instructions?: string;
  date_sent: string;
  expected_date?: string;
  actual_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered';
  cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  patients?: {
    full_name: string;
    mobile_number: string;
    patient_id: string;
  };
  treatments?: {
    procedure_done: string;
  };
}

export interface LabWorkFile {
  id: string;
  lab_work_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface LabWorkPayment {
  id: string;
  lab_work_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  created_at: string;
}

export const useLabWork = () => {
  const [labWork, setLabWork] = useState<LabWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLabWork = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lab_work')
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
        .order('date_sent', { ascending: false });

      if (error) {
        console.error('Error fetching lab work:', error);
        toast({
          title: "Error",
          description: "Failed to load lab work. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setLabWork(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading lab work.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createLabWork = async (labWorkData: Omit<LabWork, 'id' | 'created_at' | 'updated_at' | 'patients' | 'treatments'>) => {
    try {
      const { data, error } = await supabase
        .from('lab_work')
        .insert(labWorkData)
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
        .single();

      if (error) {
        console.error('Error creating lab work:', error);
        throw error;
      }

      // Update local state immediately with the new lab work
      setLabWork(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error in createLabWork:', error);
      throw error;
    }
  };

  const updateLabWork = async (labWorkId: string, updates: Partial<LabWork>) => {
    try {
      // Update local state immediately for real-time UI updates (optimistic update)
      setLabWork(prev => prev.map(work => 
        work.id === labWorkId ? { ...work, ...updates } : work
      ));

      const { data, error } = await supabase
        .from('lab_work')
        .update(updates)
        .eq('id', labWorkId)
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
        .single();

      if (error) {
        console.error('Error updating lab work:', error);
        // Revert the optimistic update on error
        await fetchLabWork();
        throw error;
      }

      // Update local state with the server response
      setLabWork(prev => prev.map(work => 
        work.id === labWorkId ? data : work
      ));

      return data;
    } catch (error) {
      console.error('Error in updateLabWork:', error);
      throw error;
    }
  };

  const deleteLabWork = async (labWorkId: string) => {
    try {
      // Store original state for potential rollback
      const originalLabWork = [...labWork];
      
      // Update local state immediately (optimistic update)
      setLabWork(prev => prev.filter(work => work.id !== labWorkId));

      const { error } = await supabase
        .from('lab_work')
        .delete()
        .eq('id', labWorkId);

      if (error) {
        console.error('Error deleting lab work:', error);
        // Revert the optimistic update on error
        setLabWork(originalLabWork);
        throw error;
      }

      // No need to fetch again since we already updated locally and it was successful
    } catch (error) {
      console.error('Error in deleteLabWork:', error);
      throw error;
    }
  };

  const getLabWorkByPatient = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('lab_work')
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
        .eq('patient_id', patientId)
        .order('date_sent', { ascending: false });

      if (error) {
        console.error('Error fetching patient lab work:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLabWorkByPatient:', error);
      throw error;
    }
  };

  const uploadLabWorkFile = async (labWorkId: string, file: File) => {
    try {
      const fileName = `${labWorkId}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('lab-work-files')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      // Save file metadata to database
      const { data, error: dbError } = await supabase
        .from('lab_work_files')
        .insert({
          lab_work_id: labWorkId,
          file_name: file.name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error saving file metadata:', dbError);
        throw dbError;
      }

      return data;
    } catch (error) {
      console.error('Error in uploadLabWorkFile:', error);
      throw error;
    }
  };

  const getLabWorkFiles = async (labWorkId: string) => {
    try {
      const { data, error } = await supabase
        .from('lab_work_files')
        .select('*')
        .eq('lab_work_id', labWorkId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching lab work files:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLabWorkFiles:', error);
      throw error;
    }
  };

  const downloadLabWorkFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('lab-work-files')
        .download(filePath);

      if (error) {
        console.error('Error downloading file:', error);
        throw error;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error in downloadLabWorkFile:', error);
      throw error;
    }
  };

  // New function to add payment for lab work
  const addLabWorkPayment = async (labWorkId: string, paymentData: {
    amount_paid: number;
    payment_method: string;
    notes?: string;
  }) => {
    try {
      // First, create the payment record in a payments table (we'll need to create this)
      // For now, we'll store payment info in localStorage as a temporary solution
      const payments = JSON.parse(localStorage.getItem('lab_work_payments') || '{}');
      const paymentId = `payment_${Date.now()}`;
      
      payments[labWorkId] = {
        id: paymentId,
        lab_work_id: labWorkId,
        amount_paid: paymentData.amount_paid,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: paymentData.payment_method,
        notes: paymentData.notes,
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem('lab_work_payments', JSON.stringify(payments));
      
      return payments[labWorkId];
    } catch (error) {
      console.error('Error adding lab work payment:', error);
      throw error;
    }
  };

  // Function to get payment info for lab work
  const getLabWorkPayment = async (labWorkId: string) => {
    try {
      const payments = JSON.parse(localStorage.getItem('lab_work_payments') || '{}');
      return payments[labWorkId] || null;
    } catch (error) {
      console.error('Error getting lab work payment:', error);
      return null;
    }
  };

  // Function to update payment for lab work
  const updateLabWorkPayment = async (labWorkId: string, paymentData: {
    amount_paid: number;
    payment_method: string;
    notes?: string;
  }) => {
    try {
      const payments = JSON.parse(localStorage.getItem('lab_work_payments') || '{}');
      
      if (payments[labWorkId]) {
        payments[labWorkId] = {
          ...payments[labWorkId],
          amount_paid: paymentData.amount_paid,
          payment_method: paymentData.payment_method,
          notes: paymentData.notes,
          updated_at: new Date().toISOString()
        };
      } else {
        // Create new payment if doesn't exist
        payments[labWorkId] = {
          id: `payment_${Date.now()}`,
          lab_work_id: labWorkId,
          amount_paid: paymentData.amount_paid,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: paymentData.payment_method,
          notes: paymentData.notes,
          created_at: new Date().toISOString()
        };
      }
      
      localStorage.setItem('lab_work_payments', JSON.stringify(payments));
      
      return payments[labWorkId];
    } catch (error) {
      console.error('Error updating lab work payment:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchLabWork();
  }, []);

  return {
    labWork,
    isLoading,
    fetchLabWork,
    createLabWork,
    updateLabWork,
    deleteLabWork,
    getLabWorkByPatient,
    uploadLabWorkFile,
    getLabWorkFiles,
    downloadLabWorkFile,
    addLabWorkPayment,
    getLabWorkPayment,
    updateLabWorkPayment,
  };
};