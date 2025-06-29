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
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const { toast } = useToast();

  const fetchLabWork = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching lab work data from Supabase...');
      
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
          description: "Failed to load lab work from database.",
          variant: "destructive",
        });
        return;
      }

      console.log('Lab work data loaded from database:', data?.length || 0, 'items');
      setLabWork(data || []);
      setLastUpdate(Date.now());
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
      console.log('Creating lab work in database:', labWorkData);
      
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
        toast({
          title: "Database Error",
          description: "Failed to save lab work to database.",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Lab work created successfully in database:', data);

      // Update local state immediately with the new lab work
      setLabWork(prev => [data, ...prev]);
      
      // Force multiple re-renders to ensure UI updates
      setUpdateTrigger(prev => prev + 1);
      setLastUpdate(Date.now());
      
      setTimeout(() => {
        setUpdateTrigger(prev => prev + 1);
        setLastUpdate(Date.now());
      }, 100);

      toast({
        title: "Lab Work Created",
        description: "Lab work has been saved to database successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error in createLabWork:', error);
      throw error;
    }
  };

  const updateLabWork = async (labWorkId: string, updates: Partial<LabWork>) => {
    try {
      console.log('Updating lab work in database:', labWorkId, updates);
      
      // Update local state immediately for real-time UI updates (optimistic update)
      const originalLabWork = [...labWork];
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
        setLabWork(originalLabWork);
        toast({
          title: "Database Error",
          description: "Failed to update lab work in database.",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Lab work updated successfully in database:', data);

      // Update local state with the server response
      setLabWork(prev => prev.map(work => 
        work.id === labWorkId ? data : work
      ));

      // Force multiple re-renders to ensure UI consistency
      setUpdateTrigger(prev => prev + 1);
      setLastUpdate(Date.now());
      
      setTimeout(() => {
        setUpdateTrigger(prev => prev + 1);
        setLastUpdate(Date.now());
      }, 100);

      setTimeout(() => {
        setUpdateTrigger(prev => prev + 1);
        setLastUpdate(Date.now());
      }, 500);

      toast({
        title: "Lab Work Updated",
        description: "Changes have been saved to database.",
      });

      return data;
    } catch (error) {
      console.error('Error in updateLabWork:', error);
      throw error;
    }
  };

  const deleteLabWork = async (labWorkId: string) => {
    try {
      console.log('Deleting lab work from database:', labWorkId);
      
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
        toast({
          title: "Database Error",
          description: "Failed to delete lab work from database.",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Lab work deleted successfully from database');

      // Force re-render to ensure UI consistency
      setUpdateTrigger(prev => prev + 1);
      setLastUpdate(Date.now());

      toast({
        title: "Lab Work Deleted",
        description: "Lab work has been removed from database.",
      });

    } catch (error) {
      console.error('Error in deleteLabWork:', error);
      throw error;
    }
  };

  const getLabWorkByPatient = async (patientId: string) => {
    try {
      console.log('Fetching lab work for patient from database:', patientId);
      
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

      console.log('Patient lab work loaded from database:', data?.length || 0, 'items');
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

  // Enhanced function to add payment for lab work using the payments table
  const addLabWorkPayment = async (labWorkId: string, paymentData: {
    amount_paid: number;
    payment_method: string;
    notes?: string;
  }) => {
    try {
      console.log('Adding lab work payment to database:', labWorkId, paymentData);
      
      // Get the lab work to find the patient_id
      const { data: labWorkData, error: labWorkError } = await supabase
        .from('lab_work')
        .select('patient_id')
        .eq('id', labWorkId)
        .single();

      if (labWorkError) {
        console.error('Error fetching lab work:', labWorkError);
        throw labWorkError;
      }

      // Insert payment into the payments table
      const { data, error } = await supabase
        .from('payments')
        .insert({
          patient_id: labWorkData.patient_id,
          lab_work_id: labWorkId,
          amount: paymentData.amount_paid,
          payment_method: paymentData.payment_method,
          notes: paymentData.notes,
          payment_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding lab work payment:', error);
        throw error;
      }

      console.log('Lab work payment added to database successfully:', data);
      
      toast({
        title: "Payment Saved",
        description: "Lab work payment has been saved to database.",
      });

      return data;
    } catch (error) {
      console.error('Error adding lab work payment:', error);
      throw error;
    }
  };

  // Function to get payment info for lab work from the payments table
  const getLabWorkPayment = async (labWorkId: string) => {
    try {
      console.log('Fetching lab work payment from database:', labWorkId);
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('lab_work_id', labWorkId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching lab work payment:', error);
        throw error;
      }

      console.log('Lab work payment loaded from database:', data);
      return data || null;
    } catch (error) {
      console.error('Error getting lab work payment:', error);
      return null;
    }
  };

  // Function to update payment for lab work in the payments table
  const updateLabWorkPayment = async (labWorkId: string, paymentData: {
    amount_paid: number;
    payment_method: string;
    notes?: string;
  }) => {
    try {
      console.log('Updating lab work payment in database:', labWorkId, paymentData);
      
      const { data, error } = await supabase
        .from('payments')
        .update({
          amount: paymentData.amount_paid,
          payment_method: paymentData.payment_method,
          notes: paymentData.notes
        })
        .eq('lab_work_id', labWorkId)
        .select()
        .single();

      if (error) {
        console.error('Error updating lab work payment:', error);
        throw error;
      }

      console.log('Lab work payment updated in database successfully:', data);
      
      toast({
        title: "Payment Updated",
        description: "Lab work payment has been updated in database.",
      });

      return data;
    } catch (error) {
      console.error('Error updating lab work payment:', error);
      throw error;
    }
  };

  // Function to force refresh lab work data with multiple update triggers
  const refreshLabWork = async () => {
    console.log('Force refreshing lab work data from database...');
    await fetchLabWork();
    
    // Force multiple re-renders to ensure UI updates
    setUpdateTrigger(prev => prev + 1);
    setLastUpdate(Date.now());
    
    setTimeout(() => {
      setUpdateTrigger(prev => prev + 1);
      setLastUpdate(Date.now());
    }, 100);
    
    setTimeout(() => {
      setUpdateTrigger(prev => prev + 1);
      setLastUpdate(Date.now());
    }, 500);
  };

  useEffect(() => {
    fetchLabWork();
  }, [updateTrigger]);

  return {
    labWork,
    isLoading,
    lastUpdate, // Expose this for components that need to track updates
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
    refreshLabWork,
  };
};