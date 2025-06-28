import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, Calendar, FileText, Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';

interface PatientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string | null;
}

export const PatientDetailsDialog: React.FC<PatientDetailsDialogProps> = ({ open, onOpenChange, patientId }) => {
  const navigate = useNavigate();
  const { getPatientById } = usePatients();
  const { appointments } = useAppointments();
  const [patient, setPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (patientId && open) {
      fetchPatientData();
    }
  }, [patientId, open]);

  const fetchPatientData = async () => {
    if (!patientId) return;
    
    try {
      setIsLoading(true);
      const patientData = await getPatientById(patientId);
      setPatient(patientData);
    } catch (error) {
      console.error('Error fetching patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const patientAppointments = appointments.filter(apt => apt.patient_id === patientId);
  const lastVisit = patientAppointments
    .filter(apt => apt.status === 'completed')
    .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())[0];

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Patient Details
          </DialogTitle>
          <DialogDescription>
            Quick overview of patient information and medical history
          </DialogDescription>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-slate-900">{patient.full_name}</h3>
              {patient.patient_nickname && (
                <p className="text-sm text-slate-600">"{patient.patient_nickname}"</p>
              )}
              <p className="text-sm text-slate-600">Patient ID: {patient.patient_id}</p>
              <Badge className="bg-green-50 text-green-700 border-green-200 border font-medium text-xs">
                active
              </Badge>
            </div>
            <div className="text-right text-sm text-slate-600">
              <div>{calculateAge(patient.date_of_birth)} years • {patient.gender}</div>
              {patient.blood_group && <div>Blood Group: {patient.blood_group}</div>}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>{patient.mobile_number}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>{patient.email}</span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-slate-500">Address:</span>
                  <p className="mt-1">{patient.address}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Visit History</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Last Visit: {lastVisit ? lastVisit.appointment_date : 'No visits yet'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Total Visits: {patientAppointments.filter(apt => apt.status === 'completed').length}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Total Appointments: {patientAppointments.length}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium text-slate-900">Medical Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-slate-700">Allergies:</span>
                <p className="text-slate-600 mt-1">{patient.allergies || 'None reported'}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Chronic Conditions:</span>
                <p className="text-slate-600 mt-1">{patient.chronic_conditions || 'None reported'}</p>
              </div>
              {patient.emergency_contact && (
                <div className="md:col-span-2">
                  <span className="font-medium text-slate-700">Emergency Contact:</span>
                  <p className="text-slate-600 mt-1">{patient.emergency_contact}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                navigate(`/patient-record?patient=${patient.patient_id}`);
              }}
              className="flex-1"
              title="View Complete Patient Record"
            >
              <Eye className="w-4 h-4 mr-2" />
              Full Record
            </Button>
            <Button 
              onClick={() => {
                onOpenChange(false);
                navigate('/prescriptions');
              }}
              className="flex-1"
              title="View/Create Prescriptions"
            >
              <FileText className="w-4 h-4 mr-2" />
              Prescriptions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};