
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Phone, Calendar, Stethoscope, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '@/hooks/useAppointments';
import { useToast } from '@/hooks/use-toast';

export const TodaysAppointments: React.FC = () => {
  const navigate = useNavigate();
  const { appointments, isLoading, updateAppointment } = useAppointments();
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(apt => apt.appointment_date === today);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRecordTreatment = (appointment: any) => {
    navigate(`/in-patient-treatment?patient=${appointment.patient_id}&name=${encodeURIComponent(appointment.patients?.full_name || 'Unknown')}&type=appointment`);
  };

  const handleMarkComplete = async (appointment: any) => {
    try {
      await updateAppointment(appointment.id, { status: 'completed' });
      toast({
        title: "Success",
        description: `Appointment for ${appointment.patients?.full_name} marked as completed`,
      });
    } catch (error) {
      console.error('Error marking appointment as complete:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Today's Appointments
        </CardTitle>
        <CardDescription>
          {todaysAppointments.length} appointments scheduled for today
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {todaysAppointments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No appointments scheduled for today.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/appointments')}
            >
              Schedule New Appointment
            </Button>
          </div>
        ) : (
          <>
            {todaysAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Clock className="w-4 h-4 text-slate-500" />
                    {appointment.appointment_time}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-900">
                        {appointment.patients?.full_name || 'Unknown Patient'}
                      </span>
                      <span className="text-sm text-slate-500">
                        ({appointment.patients?.patient_id || appointment.patient_id})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {appointment.patients?.mobile_number || 'No phone'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">{appointment.appointment_type}</span>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                  {appointment.status === 'scheduled' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkComplete(appointment)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        title="Mark as Complete"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleRecordTreatment(appointment)}
                        className="bg-blue-600 hover:bg-blue-700"
                        title="Record Treatment"
                      >
                        <Stethoscope className="w-4 h-4 mr-1" />
                        Record Treatment
                      </Button>
                    </div>
                  )}
                  {appointment.status === 'completed' && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleRecordTreatment(appointment)}
                      title="Add Treatment Notes"
                    >
                      <Stethoscope className="w-4 h-4 mr-1" />
                      Add Notes
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/appointments')}>
              View All Appointments
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
