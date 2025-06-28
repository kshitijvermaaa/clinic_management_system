import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { VisualTeethSelector } from './VisualTeethSelector';
import { CalendarDays, Clock, User, Phone, FileText, Stethoscope, AlertTriangle, Heart, Bluetooth as Tooth } from 'lucide-react';

interface ToothSelection {
  tooth: string;
  parts: string[];
}

interface EnhancedAppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnhancedAppointmentForm: React.FC<EnhancedAppointmentFormProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [selectedTeeth, setSelectedTeeth] = useState<ToothSelection[]>([]);
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    appointmentType: '',
    patientComplaint: '',
    doctorAnalysis: '',
    treatmentDetails: '',
    treatmentNotes: '',
    painLevel: '',
    urgency: '',
    isFollowUp: false,
    previousTreatment: '',
    allergies: '',
    medications: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Appointment Scheduled Successfully! 🎉",
      description: `New appointment for ${formData.patientName} has been scheduled for ${formData.date} at ${formData.time}.`,
    });
    onOpenChange(false);
    // Reset form
    setFormData({
      patientName: '', patientId: '', phone: '', email: '', date: '', time: '',
      appointmentType: '', patientComplaint: '', doctorAnalysis: '', treatmentDetails: '',
      treatmentNotes: '', painLevel: '', urgency: '', isFollowUp: false, 
      previousTreatment: '', allergies: '', medications: ''
    });
    setSelectedTeeth([]);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPainLevelColor = (level: string) => {
    const num = parseInt(level);
    if (num <= 3) return 'bg-green-100 text-green-700';
    if (num <= 6) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'routine': return 'bg-blue-100 text-blue-700';
      case 'urgent': return 'bg-orange-100 text-orange-700';
      case 'emergency': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            Schedule New Appointment
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Complete patient information and treatment details for the appointment.
          </DialogDescription>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <User className="w-5 h-5 text-blue-600" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name" className="text-sm font-medium text-slate-700">Patient Name *</Label>
                <Input 
                  id="patient-name" 
                  placeholder="Enter full name"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  required 
                  className="border-slate-200 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-id" className="text-sm font-medium text-slate-700">Patient ID</Label>
                <Input 
                  id="patient-id" 
                  placeholder="Auto-generated or existing ID"
                  value={formData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  className="border-slate-200 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number *</Label>
                <Input 
                  id="phone" 
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required 
                  className="border-slate-200 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="patient@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="border-slate-200 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointment Scheduling */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Clock className="w-5 h-5 text-green-600" />
                Appointment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-date" className="text-sm font-medium text-slate-700">Date *</Label>
                <Input 
                  id="appointment-date" 
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required 
                  className="border-slate-200 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-time" className="text-sm font-medium text-slate-700">Time *</Label>
                <Input 
                  id="appointment-time" 
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  required 
                  className="border-slate-200 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency" className="text-sm font-medium text-slate-700">Urgency Level</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                  <SelectTrigger className="border-slate-200 focus:border-green-500">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Routine
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Urgent
                      </div>
                    </SelectItem>
                    <SelectItem value="emergency">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Emergency
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formData.urgency && (
                  <Badge className={getUrgencyColor(formData.urgency)}>
                    {formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Patient Complaint */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Step 1: Patient Complaint
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient-complaint" className="text-sm font-medium text-slate-700">Chief Complaint *</Label>
                <Textarea 
                  id="patient-complaint" 
                  placeholder="Describe the patient's main complaint and symptoms in detail..."
                  value={formData.patientComplaint}
                  onChange={(e) => handleInputChange('patientComplaint', e.target.value)}
                  className="border-slate-200 focus:border-red-500 min-h-[100px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pain-level" className="text-sm font-medium text-slate-700">Pain Level (1-10)</Label>
                <Select value={formData.painLevel} onValueChange={(value) => handleInputChange('painLevel', value)}>
                  <SelectTrigger className="border-slate-200 focus:border-red-500">
                    <SelectValue placeholder="Rate pain level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 10}, (_, i) => (
                      <SelectItem key={i+1} value={(i+1).toString()}>
                        <div className="flex items-center gap-2">
                          <span>{i+1}</span>
                          {i === 0 && <span className="text-green-600">(No Pain)</span>}
                          {i === 4 && <span className="text-yellow-600">(Moderate)</span>}
                          {i === 9 && <span className="text-red-600">(Severe Pain)</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.painLevel && (
                  <Badge className={getPainLevelColor(formData.painLevel)}>
                    Pain Level: {formData.painLevel}/10
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Doctor's Analysis */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Stethoscope className="w-5 h-5 text-purple-600" />
                Step 2: Doctor's Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor-analysis" className="text-sm font-medium text-slate-700">Clinical Analysis & Diagnosis</Label>
                <Textarea 
                  id="doctor-analysis" 
                  placeholder="Doctor's clinical findings, examination results, and preliminary diagnosis..."
                  value={formData.doctorAnalysis}
                  onChange={(e) => handleInputChange('doctorAnalysis', e.target.value)}
                  className="border-slate-200 focus:border-purple-500 min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-type" className="text-sm font-medium text-slate-700">Appointment Type *</Label>
                <Select value={formData.appointmentType} onValueChange={(value) => handleInputChange('appointmentType', value)} required>
                  <SelectTrigger className="border-slate-200 focus:border-purple-500">
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkup">🔍 Routine Checkup</SelectItem>
                    <SelectItem value="cleaning">✨ Teeth Cleaning</SelectItem>
                    <SelectItem value="filling">🦷 Dental Filling</SelectItem>
                    <SelectItem value="extraction">🚫 Tooth Extraction</SelectItem>
                    <SelectItem value="root-canal">🔧 Root Canal Treatment</SelectItem>
                    <SelectItem value="orthodontics">📐 Orthodontic Treatment</SelectItem>
                    <SelectItem value="consultation">💬 Consultation</SelectItem>
                    <SelectItem value="followup">📋 Follow-up</SelectItem>
                    <SelectItem value="emergency">🚨 Emergency Treatment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Visual Teeth Selector (Replaced Image Upload) */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Tooth className="w-5 h-5 text-orange-600" />
                Step 3: Visual Teeth Selector
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label className="text-sm font-medium text-slate-700">
                  Select Affected Teeth and Parts
                </Label>
                <div className="bg-white rounded-xl p-4 border border-orange-200">
                  <VisualTeethSelector
                    selectedTeeth={selectedTeeth}
                    onTeethChange={setSelectedTeeth}
                  />
                </div>
                <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                  💡 Click on different parts of each tooth to select specific areas that need attention, or click the center for the full tooth.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Treatment Details */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <FileText className="w-5 h-5 text-green-600" />
                Step 4: Treatment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="treatment-details" className="text-sm font-medium text-slate-700">Proposed Treatment Plan</Label>
                <Textarea 
                  id="treatment-details" 
                  placeholder="Detailed treatment plan, procedures to be performed, materials needed..."
                  value={formData.treatmentDetails}
                  onChange={(e) => handleInputChange('treatmentDetails', e.target.value)}
                  className="border-slate-200 focus:border-green-500 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Treatment Notes and Observations */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Heart className="w-5 h-5 text-blue-600" />
                Step 5: Treatment Notes & Observations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="treatment-notes" className="text-sm font-medium text-slate-700">Treatment Notes & Observations</Label>
                <Textarea 
                  id="treatment-notes" 
                  placeholder="Additional observations, patient response, follow-up instructions..."
                  value={formData.treatmentNotes}
                  onChange={(e) => handleInputChange('treatmentNotes', e.target.value)}
                  className="border-slate-200 focus:border-blue-500 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Known Allergies
                  </Label>
                  <Textarea 
                    id="allergies" 
                    placeholder="List any known allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    className="border-slate-200 focus:border-blue-500 min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medications" className="text-sm font-medium text-slate-700">Current Medications</Label>
                  <Textarea 
                    id="medications" 
                    placeholder="List current medications"
                    value={formData.medications}
                    onChange={(e) => handleInputChange('medications', e.target.value)}
                    className="border-slate-200 focus:border-blue-500 min-h-[80px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
            >
              Schedule Appointment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};