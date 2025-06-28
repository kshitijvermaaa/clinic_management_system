
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Search, User, Phone, FileText, Eye, CalendarX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EnhancedAppointmentForm } from '@/components/appointments/EnhancedAppointmentForm';
import { PatientDetailsDialog } from '@/components/appointments/PatientDetailsDialog';
import { RescheduleAppointment } from '@/components/appointments/RescheduleAppointment';
import { HolidayCalendar } from '@/components/calendar/HolidayCalendar';
import { ClinicClosureManager } from '@/components/appointments/ClinicClosureManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppointments } from '@/hooks/useAppointments';

const Appointments = () => {
  const navigate = useNavigate();
  const { appointments, isLoading } = useAppointments();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'rescheduled':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.patients?.mobile_number?.includes(searchTerm) ||
    appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.patient_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowPatientDetails(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleReschedule = (appointment: any) => {
    console.log('Rescheduling appointment:', appointment);
    setSelectedAppointment({
      id: appointment.id,
      patientName: appointment.patients?.full_name || 'Unknown Patient',
      patientId: appointment.patient_id,
      currentDate: new Date(appointment.appointment_date),
      currentTime: appointment.appointment_time,
      reason: appointment.notes || appointment.appointment_type
    });
    setShowReschedule(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Appointments Management
            </h1>
            <p className="text-slate-600">Manage appointments, holidays, and clinic operations</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9 w-64"
              />
            </div>
            <Button 
              onClick={() => setShowAppointmentForm(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 transition-all duration-200 shadow-lg"
              title="Schedule New Appointment"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>

        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments">All Appointments</TabsTrigger>
            <TabsTrigger value="holidays">Holiday Calendar</TabsTrigger>
            <TabsTrigger value="closure">Emergency Closure</TabsTrigger>
            <TabsTrigger value="reschedule">Reschedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appointments" className="space-y-4">
            {/* All Appointments */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  All Appointments - {appointments.length} total
                </CardTitle>
                <CardDescription>
                  {filteredAppointments.length} appointments {searchTerm ? 'found' : 'in database'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>{searchTerm ? 'No appointments found matching your search.' : 'No appointments scheduled yet.'}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowAppointmentForm(true)}
                    >
                      Schedule New Appointment
                    </Button>
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:shadow-md hover:bg-slate-50/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-900">{appointment.patients?.full_name || 'Unknown Patient'}</span>
                            <span className="text-sm text-slate-500">({appointment.patients?.patient_id || appointment.patient_id})</span>
                            <span className="text-sm font-mono text-slate-600">{appointment.appointment_time}</span>
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {appointment.patients?.mobile_number || 'No phone'}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Date: {appointment.appointment_date} | Type: {appointment.appointment_type}
                              {appointment.notes && ` | ${appointment.notes}`}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(appointment.status)} border font-medium`}>
                          {appointment.status}
                        </Badge>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReschedule(appointment)}
                            title="Reschedule Appointment"
                          >
                            <CalendarX className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewPatient(appointment.patient_id)}
                            title="View Patient Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/patient-record?patient=${appointment.patient_id}`)}
                            title="View Full Patient Record"
                          >
                            <User className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate('/prescriptions')}
                            title="View/Create Prescriptions"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holidays">
            <HolidayCalendar />
          </TabsContent>

          <TabsContent value="closure">
            <ClinicClosureManager />
          </TabsContent>

          <TabsContent value="reschedule">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarX className="w-5 h-5 text-blue-600" />
                  Appointment Rescheduling
                </CardTitle>
                <CardDescription>
                  Reschedule individual appointments or manage bulk changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Click the reschedule button next to any appointment in the "All Appointments" tab to reschedule it, 
                  or use the "Emergency Closure" tab to handle multiple appointments at once.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Appointment Form Dialog */}
      <EnhancedAppointmentForm 
        open={showAppointmentForm} 
        onOpenChange={setShowAppointmentForm} 
      />

      {/* Patient Details Dialog */}
      <PatientDetailsDialog
        open={showPatientDetails}
        onOpenChange={setShowPatientDetails}
        patientId={selectedPatientId}
      />

      {/* Reschedule Dialog */}
      {selectedAppointment && (
        <RescheduleAppointment
          appointment={selectedAppointment}
          open={showReschedule}
          onOpenChange={setShowReschedule}
        />
      )}
    </div>
  );
};

export default Appointments;
