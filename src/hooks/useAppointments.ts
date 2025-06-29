import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  appointment_type: 'regular' | 'emergency' | 'walkin' | 'followup';
  notes?: string;
  created_at: string;
  updated_at: string;
  patients?: {
    full_name: string;
    mobile_number: string;
    email?: string;
    patient_id: string;
  };
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching appointments...');
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients:patient_id (
            full_name,
            mobile_number,
            email,
            patient_id
          )
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Error",
          description: "Failed to load appointments. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Appointments fetched successfully:', data);
      
      // Sort appointments: scheduled first (by date/time), then others
      const sortedAppointments = (data || []).sort((a, b) => {
        // First, sort by status - scheduled appointments first
        if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
        if (a.status !== 'scheduled' && b.status === 'scheduled') return 1;
        
        // Then sort by date
        const dateComparison = new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // Finally sort by time
        return a.appointment_time.localeCompare(b.appointment_time);
      });
      
      setAppointments(sortedAppointments);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading appointments.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patients'>) => {
    try {
      console.log('Creating appointment:', appointmentData);
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }

      console.log('Appointment created successfully:', data);
      await fetchAppointments();
      return data;
    } catch (error) {
      console.error('Error in createAppointment:', error);
      throw error;
    }
  };

  const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      console.log('Updating appointment:', appointmentId, updates);
      
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating appointment:', error);
        throw error;
      }

      console.log('Appointment updated successfully:', data);
      await fetchAppointments();
      return data;
    } catch (error) {
      console.error('Error in updateAppointment:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    isLoading,
    fetchAppointments,
    createAppointment,
    updateAppointment,
  };
};