import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  patient_id: string;
  treatment_id?: string;
  lab_work_id?: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface PaymentSummary {
  totalCost: number;
  totalPaid: number;
  balance: number;
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const { toast } = useToast();

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching payments from Supabase...');
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        toast({
          title: "Error",
          description: "Failed to load payment data from database.",
          variant: "destructive",
        });
        return;
      }

      console.log('Payments loaded from database:', data?.length || 0);
      setPayments(data || []);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error in fetchPayments:', error);
      toast({
        title: "Error",
        description: "Failed to load payment data.",
        variant: "destructive",
      });
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding payment to database:', paymentData);
      
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) {
        console.error('Error adding payment:', error);
        toast({
          title: "Error",
          description: "Failed to save payment to database.",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Payment added successfully:', data);
      
      // Update local state immediately
      setPayments(prev => [data, ...prev]);
      setLastUpdate(Date.now());
      
      toast({
        title: "Payment Added",
        description: `Payment of ₹${paymentData.amount} has been recorded successfully.`,
      });

      return data;
    } catch (error) {
      console.error('Error in addPayment:', error);
      throw error;
    }
  };

  const updatePayment = async (paymentId: string, updates: Partial<Payment>) => {
    try {
      console.log('Updating payment in database:', paymentId, updates);
      
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment:', error);
        toast({
          title: "Error",
          description: "Failed to update payment in database.",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Payment updated successfully:', data);
      
      // Update local state
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId ? data : payment
      ));
      setLastUpdate(Date.now());

      toast({
        title: "Payment Updated",
        description: "Payment has been updated successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error in updatePayment:', error);
      throw error;
    }
  };

  const deletePayment = async (paymentId: string) => {
    try {
      console.log('Deleting payment from database:', paymentId);
      
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) {
        console.error('Error deleting payment:', error);
        toast({
          title: "Error",
          description: "Failed to delete payment from database.",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Payment deleted successfully');
      
      // Update local state
      setPayments(prev => prev.filter(payment => payment.id !== paymentId));
      setLastUpdate(Date.now());

      toast({
        title: "Payment Deleted",
        description: "Payment record has been deleted.",
      });
    } catch (error) {
      console.error('Error in deletePayment:', error);
      throw error;
    }
  };

  const getPaymentsByPatient = async (patientId: string): Promise<Payment[]> => {
    try {
      console.log('Fetching payments for patient:', patientId);
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('patient_id', patientId)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching patient payments:', error);
        throw error;
      }

      console.log('Patient payments loaded:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getPaymentsByPatient:', error);
      return [];
    }
  };

  const getPaymentSummaryForPatient = async (patientId: string): Promise<PaymentSummary> => {
    try {
      console.log('Calculating payment summary for patient:', patientId);
      
      // Get all treatments for this patient to calculate total cost
      const { data: treatments, error: treatmentError } = await supabase
        .from('treatments')
        .select('treatment_cost')
        .eq('patient_id', patientId);

      if (treatmentError) {
        console.error('Error fetching treatments:', treatmentError);
      }

      // Get lab work costs for this patient
      const { data: labWork, error: labWorkError } = await supabase
        .from('lab_work')
        .select('cost')
        .eq('patient_id', patientId);

      if (labWorkError) {
        console.error('Error fetching lab work:', labWorkError);
      }

      // Get all payments for this patient
      const { data: patientPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('patient_id', patientId);

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      }

      // Calculate totals
      const treatmentCosts = treatments?.reduce((sum, treatment) => sum + (treatment.treatment_cost || 0), 0) || 0;
      const labWorkCosts = labWork?.reduce((sum, work) => sum + (work.cost || 0), 0) || 0;
      const totalCost = treatmentCosts + labWorkCosts;
      
      const totalPaid = patientPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      const balance = totalCost - totalPaid;

      const summary = {
        totalCost,
        totalPaid,
        balance
      };

      console.log('Payment summary calculated:', summary);
      return summary;
    } catch (error) {
      console.error('Error calculating payment summary:', error);
      return {
        totalCost: 0,
        totalPaid: 0,
        balance: 0
      };
    }
  };

  const refreshPayments = async () => {
    console.log('Force refreshing payments data...');
    await fetchPayments();
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    isLoading,
    lastUpdate,
    fetchPayments,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByPatient,
    getPaymentSummaryForPatient,
    refreshPayments,
  };
};