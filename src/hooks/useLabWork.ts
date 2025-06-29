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
  // Payment information
  total_paid?: number;
  balance_remaining?: number;
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

export const useLabWork = () => {
  const [labWork, setLabWork] = useState<LabWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLabWork = async () => {
    try {
      setIsLoading(true);
      
      // Fetch lab work with payment information
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

      // Fetch payment information for each lab work
      const labWorkWithPayments = await Promise.all(
        (data || []).map(async (work) => {
          try {
            const { data: payments, error: paymentsError } = await supabase
              .from('lab_work_payments')
              .select('amount')
              .eq('lab_work_id', work.id);

            if (paymentsError) {
              console.error('Error fetching payments for lab work:', work.id, paymentsError);
              return {
                ...work,
                total_paid: 0,
                balance_remaining: work.cost || 0
              };
            }

            const totalPaid = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
            const balanceRemaining = (work.cost || 0) - totalPaid;

            return {
              ...work,
              total_paid: totalPaid,
              balance_remaining: balanceRemaining
            };
          } catch (error) {
            console.error('Error processing lab work payments:', error);
            return {
              ...work,
              total_paid: 0,
              balance_remaining: work.cost || 0
            };
          }
        })
      );

      setLabWork(labWorkWithPayments);
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

  const createLabWork = async (labWorkData: Omit<LabWork, 'id' | 'created_at' | 'updated_at' | 'patients' | 'treatments' | 'total_paid' | 'balance_remaining'>) => {
    try {
      const { data, error } = await supabase
        .from('lab_work')
        .insert(labWorkData)
        .select()
        .single();

      if (error) {
        console.error('Error creating lab work:', error);
        throw error;
      }

      await fetchLabWork(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error in createLabWork:', error);
      throw error;
    }
  };

  const updateLabWork = async (labWorkId: string, updates: Partial<LabWork>) => {
    try {
      const { data, error } = await supabase
        .from('lab_work')
        .update(updates)
        .eq('id', labWorkId)
        .select()
        .single();

      if (error) {
        console.error('Error updating lab work:', error);
        throw error;
      }

      await fetchLabWork(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error in updateLabWork:', error);
      throw error;
    }
  };

  const deleteLabWork = async (labWorkId: string) => {
    try {
      const { error } = await supabase
        .from('lab_work')
        .delete()
        .eq('id', labWorkId);

      if (error) {
        console.error('Error deleting lab work:', error);
        throw error;
      }

      await fetchLabWork(); // Refresh the list
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

      // Fetch payment information for each lab work
      const labWorkWithPayments = await Promise.all(
        (data || []).map(async (work) => {
          try {
            const { data: payments, error: paymentsError } = await supabase
              .from('lab_work_payments')
              .select('amount')
              .eq('lab_work_id', work.id);

            if (paymentsError) {
              console.error('Error fetching payments for lab work:', work.id, paymentsError);
              return {
                ...work,
                total_paid: 0,
                balance_remaining: work.cost || 0
              };
            }

            const totalPaid = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
            const balanceRemaining = (work.cost || 0) - totalPaid;

            return {
              ...work,
              total_paid: totalPaid,
              balance_remaining: balanceRemaining
            };
          } catch (error) {
            console.error('Error processing lab work payments:', error);
            return {
              ...work,
              total_paid: 0,
              balance_remaining: work.cost || 0
            };
          }
        })
      );

      return labWorkWithPayments;
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

  // Function to refresh lab work data (useful for payment updates)
  const refreshLabWork = async () => {
    await fetchLabWork();
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
    refreshLabWork,
  };
};