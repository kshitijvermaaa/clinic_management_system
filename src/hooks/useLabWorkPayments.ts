import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LabWorkPayment {
  id: string;
  lab_work_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  created_at: string;
}

export const useLabWorkPayments = () => {
  const [payments, setPayments] = useState<LabWorkPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPaymentsByLabWork = async (labWorkId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lab_work_payments')
        .select('*')
        .eq('lab_work_id', labWorkId)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching lab work payments:', error);
        throw error;
      }

      setPayments(data || []);
      return data || [];
    } catch (error) {
      console.error('Error in fetchPaymentsByLabWork:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addPayment = async (paymentData: Omit<LabWorkPayment, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('lab_work_payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) {
        console.error('Error adding payment:', error);
        throw error;
      }

      // Update local state
      setPayments(prev => [data, ...prev]);
      
      toast({
        title: "Payment Added",
        description: `Payment of $${paymentData.amount} has been recorded.`,
      });

      return data;
    } catch (error) {
      console.error('Error in addPayment:', error);
      toast({
        title: "Error",
        description: "Failed to add payment. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePayment = async (paymentId: string, updates: Partial<LabWorkPayment>) => {
    try {
      const { data, error } = await supabase
        .from('lab_work_payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment:', error);
        throw error;
      }

      // Update local state
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId ? { ...payment, ...data } : payment
      ));

      toast({
        title: "Payment Updated",
        description: "Payment has been updated successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error in updatePayment:', error);
      toast({
        title: "Error",
        description: "Failed to update payment. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('lab_work_payments')
        .delete()
        .eq('id', paymentId);

      if (error) {
        console.error('Error deleting payment:', error);
        throw error;
      }

      // Update local state
      setPayments(prev => prev.filter(payment => payment.id !== paymentId));

      toast({
        title: "Payment Deleted",
        description: "Payment has been removed successfully.",
      });
    } catch (error) {
      console.error('Error in deletePayment:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const calculateTotalPaid = (labWorkPayments: LabWorkPayment[]) => {
    return labWorkPayments.reduce((total, payment) => total + payment.amount, 0);
  };

  const calculateBalance = (totalCost: number, labWorkPayments: LabWorkPayment[]) => {
    const totalPaid = calculateTotalPaid(labWorkPayments);
    return totalCost - totalPaid;
  };

  return {
    payments,
    isLoading,
    fetchPaymentsByLabWork,
    addPayment,
    updatePayment,
    deletePayment,
    calculateTotalPaid,
    calculateBalance,
  };
};