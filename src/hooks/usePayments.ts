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
      // For now, we'll use localStorage to simulate payment persistence
      // In a real app, this would be a Supabase table
      const storedPayments = localStorage.getItem('patient_payments');
      if (storedPayments) {
        setPayments(JSON.parse(storedPayments));
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payment data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'created_at'>) => {
    try {
      const newPayment: Payment = {
        ...paymentData,
        id: `payment_${Date.now()}`,
        created_at: new Date().toISOString()
      };

      const updatedPayments = [...payments, newPayment];
      setPayments(updatedPayments);
      
      // Persist to localStorage
      localStorage.setItem('patient_payments', JSON.stringify(updatedPayments));

      return newPayment;
    } catch (error) {
      console.error('Error adding payment:', error);
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
        throw treatmentError;
      }

      const totalCost = treatments?.reduce((sum, treatment) => sum + (treatment.treatment_cost || 0), 0) || 0;
      
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

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    isLoading,
    fetchPayments,
    addPayment,
    getPaymentsByPatient,
    getPaymentSummaryForPatient,
  };
};