import React, { useState } from 'react';
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

interface Holiday {
  id: string;
  date: Date;
  name: string;
  type: 'full-day' | 'half-day';
  halfDayPeriod?: 'morning' | 'evening';
}

const defaultHolidays: Holiday[] = [
  {
    id: '1',
    date: new Date('2024-12-25'),
    name: 'Christmas Day',
    type: 'full-day'
  },
  {
    id: '2',
    date: new Date('2024-01-01'),
    name: 'New Year',
    type: 'full-day'
  }
];

export const HolidayCalendar: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>(defaultHolidays);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [holidayType, setHolidayType] = useState<'full-day' | 'half-day'>('full-day');
  const [halfDayPeriod, setHalfDayPeriod] = useState<'morning' | 'evening'>('morning');
  const { toast } = useToast();

  const getHolidayForDate = (date: Date) => {
    return holidays.find(holiday => 
      holiday.date.toDateString() === date.toDateString()
    );
  };

  const isHolidayDate = (date: Date) => {
    return holidays.some(holiday => 
      holiday.date.toDateString() === date.toDateString()
    );
  };

  const handleAddHoliday = () => {
    if (!selectedDate || !holidayName.trim()) {
      toast({
        title: "Error",
        description: "Please select a date and enter holiday name",
        variant: "destructive"
      });
      return;
    }

    const newHoliday: Holiday = {
      id: Date.now().toString(),
      date: selectedDate,
      name: holidayName.trim(),
      type: holidayType,
      halfDayPeriod: holidayType === 'half-day' ? halfDayPeriod : undefined
    };

    setHolidays([...holidays, newHoliday]);
    setHolidayName('');
    setShowAddHoliday(false);
    setSelectedDate(undefined);
    
    toast({
      title: "Holiday Added",
      description: `${holidayName} has been added to the calendar`,
    });
  };

  const handleRemoveHoliday = (holidayId: string) => {
    const holiday = holidays.find(h => h.id === holidayId);
    setHolidays(holidays.filter(h => h.id !== holidayId));
    
    toast({
      title: "Holiday Removed",
      description: `${holiday?.name} has been removed from the calendar`,
    });
  };

  const getHolidayBadge = (holiday: Holiday) => {
    if (holiday.type === 'full-day') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Closed</Badge>;
    }
    return (
      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
        Half Day ({holiday.halfDayPeriod})
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarX className="w-5 h-5 text-red-600" />
            Clinic Holiday Calendar
          </CardTitle>
          <CardDescription>
            Manage clinic closures and holidays to prevent appointment scheduling
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
                  holiday: (date) => isHolidayDate(date)
                }}
                modifiersStyles={{
                  holiday: { 
                    backgroundColor: '#fee2e2', 
                    color: '#dc2626',
                    fontWeight: 'bold'
                  }
                }}
              />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Scheduled Holidays</h3>
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
                            <SelectItem value="full-day">Full Day Closure</SelectItem>
                            <SelectItem value="half-day">Half Day Closure</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {holidayType === 'half-day' && (
                        <div>
                          <Label>Half Day Period</Label>
                          <Select value={halfDayPeriod} onValueChange={(value: 'morning' | 'evening') => setHalfDayPeriod(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">Morning (9 AM - 1 PM)</SelectItem>
                              <SelectItem value="evening">Evening (2 PM - 6 PM)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
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
                    <div key={holiday.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{holiday.name}</div>
                        <div className="text-sm text-slate-500">
                          {format(holiday.date, 'PPP')}
                        </div>
                        <div className="mt-1">
                          {getHolidayBadge(holiday)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveHoliday(holiday.id)}
                        title="Remove Holiday"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};