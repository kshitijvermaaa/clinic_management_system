import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Holiday {
  id: string;
  holiday_date: string;
  holiday_name: string;
  is_half_day: boolean;
  is_recurring: boolean;
  created_at: string;
}

export const useHolidays = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchHolidays = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clinic_holidays')
        .select('*')
        .order('holiday_date', { ascending: true });

      if (error) {
        console.error('Error fetching holidays:', error);
        toast({
          title: "Error",
          description: "Failed to load holidays.",
          variant: "destructive",
        });
        return;
      }

      setHolidays(data || []);
    } catch (error) {
      console.error('Error in fetchHolidays:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading holidays.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isDateHoliday = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return holidays.find(holiday => holiday.holiday_date === dateString);
  };

  const isDateDisabledForAppointments = (date: Date) => {
    const holiday = isDateHoliday(date);
    return holiday && !holiday.is_half_day; // Full day holidays disable appointments
  };

  const getHolidayForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return holidays.find(holiday => holiday.holiday_date === dateString);
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  return {
    holidays,
    isLoading,
    fetchHolidays,
    isDateHoliday,
    isDateDisabledForAppointments,
    getHolidayForDate,
  };
};