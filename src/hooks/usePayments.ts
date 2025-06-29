import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  patient_id: string;
  treatment_id?: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  created_at: string;
}

interface PaymentSummary {
  totalCost: number;
  totalPaid: number;
  balance: number;
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch from Supabase first (when we have a payments table)
      // For now, use localStorage with better error handling
      const storedPayments = localStorage.getItem('patient_payments');
      if (storedPayments) {
        try {
          const parsedPayments = JSON.parse(storedPayments);
          setPayments(Array.isArray(parsedPayments) ? parsedPayments : []);
        } catch (parseError) {
          console.error('Error parsing stored payments:', parseError);
          // Reset to empty array if parsing fails
          localStorage.setItem('patient_payments', JSON.stringify([]));
          setPayments([]);
        }
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
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

  const savePaymentsToStorage = (paymentsData: Payment[]) => {
    try {
      localStorage.setItem('patient_payments', JSON.stringify(paymentsData));
      return true;
    } catch (error) {
      console.error('Error saving payments to localStorage:', error);
      return false;
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'created_at'>) => {
    try {
      const newPayment: Payment = {
        ...paymentData,
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
      };

      // Update local state immediately
      const updatedPayments = [...payments, newPayment];
      setPayments(updatedPayments);
      
      // Persist to localStorage
      const saved = savePaymentsToStorage(updatedPayments);
      if (!saved) {
        // Revert local state if storage fails
        setPayments(payments);
        throw new Error('Failed to save payment data');
      }

      // Force a re-render by updating the state again
      setTimeout(() => {
        setPayments([...updatedPayments]);
      }, 100);

      return newPayment;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  };

  const updatePayment = async (paymentId: string, updates: Partial<Payment>) => {
    try {
      // Update local state immediately
      const updatedPayments = payments.map(payment => 
        payment.id === paymentId ? { ...payment, ...updates } : payment
      );
      setPayments(updatedPayments);
      
      // Persist to localStorage
      const saved = savePaymentsToStorage(updatedPayments);
      if (!saved) {
        // Revert local state if storage fails
        setPayments(payments);
        throw new Error('Failed to update payment data');
      }

      return updatedPayments.find(p => p.id === paymentId);
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  };

  const deletePayment = async (paymentId: string) => {
    try {
      // Update local state immediately
      const updatedPayments = payments.filter(payment => payment.id !== paymentId);
      setPayments(updatedPayments);
      
      // Persist to localStorage
      const saved = savePaymentsToStorage(updatedPayments);
      if (!saved) {
        // Revert local state if storage fails
        setPayments(payments);
        throw new Error('Failed to delete payment data');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  };

  const getPaymentsByPatient = async (patientId: string): Promise<Payment[]> => {
    return payments.filter(payment => payment.patient_id === patientId);
  };

  const getPaymentSummaryForPatient = async (patientId: string): Promise<PaymentSummary> => {
    try {
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

      // Calculate total costs from treatments and lab work
      const treatmentCosts = treatments?.reduce((sum, treatment) => sum + (treatment.treatment_cost || 0), 0) || 0;
      const labWorkCosts = labWork?.reduce((sum, work) => sum + (work.cost || 0), 0) || 0;
      const totalCost = treatmentCosts + labWorkCosts;
      
      // Get all payments for this patient
      const patientPayments = payments.filter(payment => payment.patient_id === patientId);
      const totalPaid = patientPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      const balance = totalCost - totalPaid;

      return {
        totalCost,
        totalPaid,
        balance
      };
    } catch (error) {
      console.error('Error calculating payment summary:', error);
      return {
        totalCost: 0,
        totalPaid: 0,
        balance: 0
      };
    }
  };

  // Function to clear all payment data (for testing/reset purposes)
  const clearAllPayments = async () => {
    try {
      setPayments([]);
      localStorage.removeItem('patient_payments');
    } catch (error) {
      console.error('Error clearing payments:', error);
      throw error;
    }
  };

  // Function to refresh payments data
  const refreshPayments = async () => {
    await fetchPayments();
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    isLoading,
    fetchPayments,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByPatient,
    getPaymentSummaryForPatient,
    clearAllPayments,
    refreshPayments,
  };
};