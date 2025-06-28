import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarX, Plus, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Holiday {
  id: string;
  holiday_date: string;
  holiday_name: string;
  is_half_day: boolean;
  is_recurring: boolean;
  created_at: string;
}

export const HolidayCalendar: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [holidayType, setHolidayType] = useState<'full-day' | 'half-day'>('full-day');
  const [halfDayPeriod, setHalfDayPeriod] = useState<'morning' | 'evening'>('morning');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHolidays();
  }, []);

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

  const getHolidayForDate = (date: Date) => {
    return holidays.find(holiday => 
      holiday.holiday_date === format(date, 'yyyy-MM-dd')
    );
  };

  const isHolidayDate = (date: Date) => {
    return holidays.some(holiday => 
      holiday.holiday_date === format(date, 'yyyy-MM-dd')
    );
  };

  const handleAddHoliday = async () => {
    if (!selectedDate || !holidayName.trim()) {
      toast({
        title: "Error",
        description: "Please select a date and enter holiday name",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clinic_holidays')
        .insert({
          holiday_date: format(selectedDate, 'yyyy-MM-dd'),
          holiday_name: holidayName.trim(),
          is_half_day: holidayType === 'half-day',
          is_recurring: isRecurring
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding holiday:', error);
        toast({
          title: "Error",
          description: "Failed to add holiday.",
          variant: "destructive",
        });
        return;
      }

      setHolidays(prev => [...prev, data]);
      setHolidayName('');
      setShowAddHoliday(false);
      setSelectedDate(undefined);
      setIsRecurring(false);
      
      toast({
        title: "Holiday Added",
        description: `${holidayName} has been added to the calendar`,
      });
    } catch (error) {
      console.error('Error in handleAddHoliday:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding the holiday.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveHoliday = async (holidayId: string) => {
    const holiday = holidays.find(h => h.id === holidayId);
    
    if (!confirm(`Are you sure you want to remove "${holiday?.holiday_name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clinic_holidays')
        .delete()
        .eq('id', holidayId);

      if (error) {
        console.error('Error removing holiday:', error);
        toast({
          title: "Error",
          description: "Failed to remove holiday.",
          variant: "destructive",
        });
        return;
      }

      setHolidays(prev => prev.filter(h => h.id !== holidayId));
      
      toast({
        title: "Holiday Removed",
        description: `${holiday?.holiday_name} has been removed from the calendar`,
      });
    } catch (error) {
      console.error('Error in handleRemoveHoliday:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while removing the holiday.",
        variant: "destructive",
      });
    }
  };

  const getHolidayBadge = (holiday: Holiday) => {
    if (!holiday.is_half_day) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Closed</Badge>;
    }
    return (
      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
        Half Day
      </Badge>
    );
  };

  // Check if a date should be disabled for appointments
  const isDateDisabledForAppointments = (date: Date) => {
    const holiday = getHolidayForDate(date);
    return holiday && !holiday.is_half_day; // Full day holidays disable appointments
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarX className="w-5 h-5 text-red-600" />
            Clinic Holiday Calendar
          </CardTitle>
          <CardDescription>
            Manage clinic closures and holidays. Full-day holidays will disable appointment scheduling.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-6">
            <div className="flex-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border pointer-events-auto"
                modifiers={{
                  holiday: (date) => isHolidayDate(date),
                  disabled: (date) => isDateDisabledForAppointments(date)
                }}
                modifiersStyles={{
                  holiday: { 
                    backgroundColor: '#fee2e2', 
                    color: '#dc2626',
                    fontWeight: 'bold'
                  },
                  disabled: {
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    textDecoration: 'line-through'
                  }
                }}
                components={{
                  Day: ({ date, ...props }) => {
                    const holiday = getHolidayForDate(date);
                    return (
                      <div {...props} className="relative">
                        <div>{date.getDate()}</div>
                        {holiday && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    );
                  }
                }}
              />
              <div className="mt-4 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-200 rounded"></div>
                  <span>Holiday dates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                  <span>Appointments disabled (full-day closures)</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Scheduled Holidays ({holidays.length})</h3>
                <Dialog open={showAddHoliday} onOpenChange={setShowAddHoliday}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Holiday
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                      <DialogTitle>Add Holiday/Closure</DialogTitle>
                      <DialogDescription>
                        Add a holiday or clinic closure date
                      </DialogDescription>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Selected Date</Label>
                        <p className="text-sm text-slate-600">
                          {selectedDate ? format(selectedDate, 'PPP') : 'No date selected'}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="holidayName">Holiday Name</Label>
                        <Input
                          id="holidayName"
                          placeholder="e.g., Christmas Day, Doctor's Leave"
                          value={holidayName}
                          onChange={(e) => setHolidayName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Closure Type</Label>
                        <Select value={holidayType} onValueChange={(value: 'full-day' | 'half-day') => setHolidayType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-day">Full Day Closure (Disables Appointments)</SelectItem>
                            <SelectItem value="half-day">Half Day Closure (Appointments Allowed)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="recurring"
                          checked={isRecurring}
                          onChange={(e) => setIsRecurring(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <Label htmlFor="recurring" className="text-sm">
                          Recurring annually
                        </Label>
                      </div>
                      <Button onClick={handleAddHoliday} className="w-full">
                        Add Holiday
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {holidays.length === 0 ? (
                  <p className="text-slate-500 text-sm">No holidays scheduled</p>
                ) : (
                  holidays.map((holiday) => (
                    <div key={holiday.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-medium">{holiday.holiday_name}</div>
                        <div className="text-sm text-slate-500">
                          {format(new Date(holiday.holiday_date), 'PPP')}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          {getHolidayBadge(holiday)}
                          {holiday.is_recurring && (
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                          {!holiday.is_half_day && (
                            <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                              Appointments Disabled
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveHoliday(holiday.id)}
                        title="Remove Holiday"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holiday Impact Information */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Clock className="w-5 h-5" />
            Holiday Impact on Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-slate-900">Full Day Holidays</div>
                <div className="text-slate-600">Completely disable appointment scheduling for the day. Existing appointments will need to be rescheduled.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-slate-900">Half Day Holidays</div>
                <div className="text-slate-600">Allow limited appointment scheduling. The holiday will be visible in the scheduler as a notice.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-slate-900">Recurring Holidays</div>
                <div className="text-slate-600">Automatically apply the same holiday every year (e.g., Christmas, New Year).</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};