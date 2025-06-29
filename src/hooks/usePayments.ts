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
  const [lastUpdate, setLastUpdate] = useState(Date.now());
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
      // Force update to trigger re-renders
      setLastUpdate(Date.now());
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

      // Update local state immediately for real-time UI update
      const updatedPayments = [...payments, newPayment];
      setPayments(updatedPayments);
      
      // Persist to localStorage
      const saved = savePaymentsToStorage(updatedPayments);
      if (!saved) {
        // Revert local state if storage fails
        setPayments(payments);
        throw new Error('Failed to save payment data');
      }

      // Force multiple re-renders to ensure UI updates
      setTimeout(() => {
        setPayments([...updatedPayments]);
        setLastUpdate(Date.now());
      }, 100);

      setTimeout(() => {
        setPayments([...updatedPayments]);
        setLastUpdate(Date.now());
      }, 500);

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

      // Force re-render
      setLastUpdate(Date.now());

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

      // Force re-render
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  };

  const getPaymentsByPatient = async (patientId: string): Promise<Payment[]> => {
    // Always fetch fresh data
    await fetchPayments();
    return payments.filter(payment => payment.patient_id === patientId);
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

      // Calculate total costs from treatments and lab work
      const treatmentCosts = treatments?.reduce((sum, treatment) => sum + (treatment.treatment_cost || 0), 0) || 0;
      const labWorkCosts = labWork?.reduce((sum, work) => sum + (work.cost || 0), 0) || 0;
      const totalCost = treatmentCosts + labWorkCosts;
      
      // Get all payments for this patient (fresh data)
      await fetchPayments();
      const patientPayments = payments.filter(payment => payment.patient_id === patientId);
      const totalPaid = patientPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
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

  // Function to clear all payment data (for testing/reset purposes)
  const clearAllPayments = async () => {
    try {
      setPayments([]);
      localStorage.removeItem('patient_payments');
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error clearing payments:', error);
      throw error;
    }
  };

  // Function to refresh payments data with force update
  const refreshPayments = async () => {
    console.log('Force refreshing payments data...');
    await fetchPayments();
    setLastUpdate(Date.now());
    
    // Force multiple updates to ensure UI refresh
    setTimeout(() => {
      setLastUpdate(Date.now());
    }, 100);
    
    setTimeout(() => {
      setLastUpdate(Date.now());
    }, 500);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Add effect to listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'patient_payments') {
        console.log('Payment data changed in another tab, refreshing...');
        fetchPayments();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    payments,
    isLoading,
    lastUpdate, // Expose this for components that need to track updates
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