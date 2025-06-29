import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAppointments } from '@/hooks/useAppointments';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  currentDate: Date;
  currentTime: string;
  reason: string;
}

interface RescheduleAppointmentProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule?: (appointmentId: string, newDate: Date, newTime: string) => void;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

export const RescheduleAppointment: React.FC<RescheduleAppointmentProps> = ({
  appointment,
  open,
  onOpenChange,
  onReschedule
}) => {
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newTime, setNewTime] = useState<string>('');
  const [reason, setReason] = useState('');
  const { toast } = useToast();
  const { updateAppointment } = useAppointments();

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      toast({
        title: "Error",
        description: "Please select both date and time",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateAppointment(appointment.id, {
        appointment_date: format(newDate, 'yyyy-MM-dd'),
        appointment_time: newTime + ':00',
        status: 'rescheduled',
        notes: reason || `Rescheduled from ${format(appointment.currentDate, 'PPP')} at ${appointment.currentTime}`
      });

      toast({
        title: "Appointment Rescheduled",
        description: `${appointment.patientName}'s appointment has been moved to ${format(newDate, 'PPP')} at ${newTime}`,
      });
      
      onOpenChange(false);
      setNewDate(undefined);
      setNewTime('');
      setReason('');
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Reschedule Appointment
          </DialogTitle>
          <DialogDescription>
            Change the date and time for this appointment
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Appointment Info */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Current Appointment
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Patient:</span> {appointment.patientName} ({appointment.patientId})
              </div>
              <div>
                <span className="font-medium">Current Date:</span> {format(appointment.currentDate, 'PPP')}
              </div>
              <div>
                <span className="font-medium">Current Time:</span> {appointment.currentTime}
              </div>
              <div>
                <span className="font-medium">Reason:</span> {appointment.reason}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <Label className="text-base font-semibold">Select New Date</Label>
              <div className="mt-2">
                <Calendar
                  mode="single"
                  selected={newDate}
                  onSelect={setNewDate}
                  className="rounded-md border pointer-events-auto"
                  disabled={(date) => isPastDate(date) || isWeekend(date)}
                  modifiers={{
                    weekend: isWeekend,
                    disabled: (date) => isPastDate(date) || isWeekend(date)
                  }}
                  modifiersStyles={{
                    weekend: { 
                      backgroundColor: '#fef3c7', 
                      color: '#d97706'
                    },
                    disabled: {
                      backgroundColor: '#f1f5f9',
                      color: '#94a3b8'
                    }
                  }}
                />
                <p className="text-xs text-slate-500 mt-2">
                  * Weekends are not available for appointments
                </p>
              </div>
            </div>

            {/* Time Selection and Options */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="newTime" className="text-base font-semibold">Select Time</Label>
                <Select value={newTime} onValueChange={setNewTime}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rescheduleReason">Reason for Rescheduling (Optional)</Label>
                <Input
                  id="rescheduleReason"
                  placeholder="e.g., Patient request, emergency, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-2"
                />
              </div>

              {newDate && newTime && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">New Appointment Details</h4>
                  <div className="text-sm text-blue-800">
                    <div><strong>Date:</strong> {format(newDate, 'PPP')}</div>
                    <div><strong>Time:</strong> {newTime}</div>
                    <div><strong>Patient:</strong> {appointment.patientName}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReschedule}
              disabled={!newDate || !newTime}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Reschedule Appointment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};