import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Calendar as CalendarIcon, Users, ArrowRight, X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: Date;
  time: string;
  reason: string;
}

const mockAppointments: Appointment[] = [
  {
    id: 'A001',
    patientName: 'John Doe',
    patientId: 'P001',
    date: new Date('2024-06-15'),
    time: '10:00 AM',
    reason: 'Routine Checkup'
  },
  {
    id: 'A002',
    patientName: 'Sarah Johnson',
    patientId: 'P024',
    date: new Date('2024-06-15'),
    time: '02:00 PM',
    reason: 'Root Canal Follow-up'
  }
];

export const ClinicClosureManager: React.FC = () => {
  const [closureDate, setClosureDate] = useState<Date | undefined>();
  const [affectedAppointments, setAffectedAppointments] = useState<Appointment[]>([]);
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [closureReason, setClosureReason] = useState('');
  const [actionType, setActionType] = useState<'reschedule-all' | 'reschedule-individual' | 'cancel-all'>('reschedule-all');
  const [showClosureDialog, setShowClosureDialog] = useState(false);
  const { toast } = useToast();

  const handleDateSelect = (date: Date | undefined) => {
    setClosureDate(date);
    if (date) {
      // Find appointments for the selected date
      const appointments = mockAppointments.filter(apt => 
        apt.date.toDateString() === date.toDateString()
      );
      setAffectedAppointments(appointments);
    } else {
      setAffectedAppointments([]);
    }
  };

  const handleEmergencyClosure = () => {
    if (!closureDate || !closureReason.trim()) {
      toast({
        title: "Error",
        description: "Please select a date and provide closure reason",
        variant: "destructive"
      });
      return;
    }

    if (actionType === 'reschedule-all' && !newDate) {
      toast({
        title: "Error",
        description: "Please select a new date for rescheduling",
        variant: "destructive"
      });
      return;
    }

    // Process based on action type
    switch (actionType) {
      case 'reschedule-all':
        toast({
          title: "Appointments Rescheduled",
          description: `All ${affectedAppointments.length} appointments moved to ${format(newDate!, 'PPP')}`,
        });
        break;
      case 'cancel-all':
        toast({
          title: "Appointments Cancelled",
          description: `All ${affectedAppointments.length} appointments have been cancelled`,
        });
        break;
      case 'reschedule-individual':
        toast({
          title: "Ready for Individual Rescheduling",
          description: "You can now reschedule each appointment individually",
        });
        break;
    }

    setShowClosureDialog(false);
    setClosureDate(undefined);
    setNewDate(undefined);
    setClosureReason('');
    setAffectedAppointments([]);
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Emergency Clinic Closure
        </CardTitle>
        <CardDescription>
          Handle unexpected clinic closures and manage affected appointments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Date Selection */}
          <div>
            <Label className="text-base font-semibold">Select Closure Date</Label>
            <div className="mt-2">
              <Calendar
                mode="single"
                selected={closureDate}
                onSelect={handleDateSelect}
                className="rounded-md border pointer-events-auto"
                disabled={isPastDate}
              />
            </div>
          </div>

          {/* Affected Appointments */}
          <div>
            <Label className="text-base font-semibold">
              Affected Appointments {closureDate && `(${format(closureDate, 'PPP')})`}
            </Label>
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
              {affectedAppointments.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  {closureDate ? 'No appointments scheduled for this date' : 'Select a date to view appointments'}
                </p>
              ) : (
                affectedAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{apt.patientName} ({apt.patientId})</div>
                      <div className="text-xs text-slate-500">{apt.time} - {apt.reason}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {affectedAppointments.length > 0 && (
              <Dialog open={showClosureDialog} onOpenChange={setShowClosureDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Proceed with Closure
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Emergency Clinic Closure</DialogTitle>
                    <DialogDescription>
                      Manage appointments for {format(closureDate!, 'PPP')}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="closureReason">Reason for Closure</Label>
                      <Textarea
                        id="closureReason"
                        placeholder="e.g., Medical emergency, equipment failure, weather conditions"
                        value={closureReason}
                        onChange={(e) => setClosureReason(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Action for Affected Appointments</Label>
                      <Select value={actionType} onValueChange={(value: any) => setActionType(value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reschedule-all">Reschedule All to New Date</SelectItem>
                          <SelectItem value="reschedule-individual">Reschedule Individually</SelectItem>
                          <SelectItem value="cancel-all">Cancel All Appointments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {actionType === 'reschedule-all' && (
                      <div>
                        <Label>New Date for All Appointments</Label>
                        <div className="mt-2">
                          <Calendar
                            mode="single"
                            selected={newDate}
                            onSelect={setNewDate}
                            className="rounded-md border pointer-events-auto w-fit"
                            disabled={(date) => isPastDate(date) || isWeekend(date)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium mb-2">Summary</h4>
                      <div className="text-sm space-y-1">
                        <div><strong>Closure Date:</strong> {format(closureDate!, 'PPP')}</div>
                        <div><strong>Affected Appointments:</strong> {affectedAppointments.length}</div>
                        <div><strong>Action:</strong> {actionType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                        {actionType === 'reschedule-all' && newDate && (
                          <div><strong>New Date:</strong> {format(newDate, 'PPP')}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowClosureDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleEmergencyClosure}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Confirm Closure
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};