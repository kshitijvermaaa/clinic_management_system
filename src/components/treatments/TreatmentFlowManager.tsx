
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Plus, CheckCircle, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { VisualTeethSelector } from '@/components/appointments/VisualTeethSelector';

interface ToothSelection {
  tooth: string;
  parts: string[];
}

interface TreatmentSession {
  id: string;
  date: string;
  treatmentType: string;
  teethTreated: ToothSelection[];
  notes: string;
  status: 'completed' | 'in-progress';
  nextAppointment?: {
    date: string;
    purpose: string;
    notes: string;
  };
}

interface TreatmentFlowManagerProps {
  patientId: string;
  patientName: string;
  isNewPatient?: boolean;
  existingSessions?: TreatmentSession[];
}

export const TreatmentFlowManager: React.FC<TreatmentFlowManagerProps> = ({
  patientId,
  patientName,
  isNewPatient = false,
  existingSessions = []
}) => {
  const [sessions, setSessions] = useState<TreatmentSession[]>(existingSessions);
  const [currentSession, setCurrentSession] = useState<Partial<TreatmentSession>>({
    date: new Date().toISOString().split('T')[0],
    treatmentType: '',
    teethTreated: [],
    notes: '',
    status: 'in-progress'
  });
  const [selectedTeeth, setSelectedTeeth] = useState<ToothSelection[]>([]);
  const [nextAppointment, setNextAppointment] = useState({
    date: '',
    purpose: '',
    notes: ''
  });

  const handleSaveSession = () => {
    const newSession: TreatmentSession = {
      id: `S${Date.now()}`,
      date: currentSession.date || new Date().toISOString().split('T')[0],
      treatmentType: currentSession.treatmentType || '',
      teethTreated: selectedTeeth,
      notes: currentSession.notes || '',
      status: 'completed',
      nextAppointment: nextAppointment.date ? nextAppointment : undefined
    };

    setSessions([...sessions, newSession]);
    
    // Reset form
    setCurrentSession({
      date: new Date().toISOString().split('T')[0],
      treatmentType: '',
      teethTreated: [],
      notes: '',
      status: 'in-progress'
    });
    setSelectedTeeth([]);
    setNextAppointment({ date: '', purpose: '', notes: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {patientName.charAt(0)}
            </div>
            <div>
              <div className="text-xl">{patientName}</div>
              <div className="text-sm text-slate-600">Patient ID: {patientId}</div>
            </div>
            {isNewPatient && (
              <Badge className="bg-green-100 text-green-700 ml-auto">New Patient</Badge>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Treatment History */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Treatment History ({sessions.length} sessions)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.map((session, index) => (
              <div key={session.id} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  {index < sessions.length - 1 && (
                    <div className="w-0.5 h-8 bg-blue-200 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{session.treatmentType}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <span className="text-sm text-slate-600">{session.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{session.notes}</p>
                  {session.teethTreated.length > 0 && (
                    <div className="text-xs text-slate-500">
                      Teeth treated: {session.teethTreated.map(t => t.tooth).join(', ')}
                    </div>
                  )}
                  {session.nextAppointment && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                      <strong>Next Appointment:</strong> {session.nextAppointment.date} - {session.nextAppointment.purpose}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current Session */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {isNewPatient ? 'First Visit - Registration & Initial Treatment' : 'New Treatment Session'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session-date">Session Date</Label>
              <Input
                id="session-date"
                type="date"
                value={currentSession.date}
                onChange={(e) => setCurrentSession({...currentSession, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="treatment-type">Treatment Type</Label>
              <Select 
                value={currentSession.treatmentType} 
                onValueChange={(value) => setCurrentSession({...currentSession, treatmentType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Initial Consultation</SelectItem>
                  <SelectItem value="cleaning">Teeth Cleaning</SelectItem>
                  <SelectItem value="filling">Dental Filling</SelectItem>
                  <SelectItem value="root-canal">Root Canal Treatment</SelectItem>
                  <SelectItem value="crown">Crown Placement</SelectItem>
                  <SelectItem value="extraction">Tooth Extraction</SelectItem>
                  <SelectItem value="scaling">Scaling & Polishing</SelectItem>
                  <SelectItem value="orthodontics">Orthodontic Treatment</SelectItem>
                  <SelectItem value="x-ray">X-Ray & Diagnosis</SelectItem>
                  <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Teeth Selector */}
          <div className="space-y-4">
            <Label>Teeth Treated (Select affected teeth and parts)</Label>
            <VisualTeethSelector 
              selectedTeeth={selectedTeeth} 
              onTeethChange={setSelectedTeeth} 
            />
          </div>

          {/* Treatment Notes */}
          <div className="space-y-2">
            <Label htmlFor="treatment-notes">Treatment Notes & Observations</Label>
            <Textarea
              id="treatment-notes"
              placeholder="Describe what was done, patient's condition, any complications, medications prescribed, etc."
              value={currentSession.notes}
              onChange={(e) => setCurrentSession({...currentSession, notes: e.target.value})}
              className="min-h-[100px]"
            />
          </div>

          <Separator />

          {/* Next Appointment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-orange-600" />
              <h4 className="font-medium">Schedule Next Appointment (if needed)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="next-date">Next Appointment Date</Label>
                <Input
                  id="next-date"
                  type="date"
                  value={nextAppointment.date}
                  onChange={(e) => setNextAppointment({...nextAppointment, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next-purpose">Purpose</Label>
                <Select 
                  value={nextAppointment.purpose} 
                  onValueChange={(value) => setNextAppointment({...nextAppointment, purpose: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Reason for next visit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow-up">Follow-up Check</SelectItem>
                    <SelectItem value="continue-treatment">Continue Treatment</SelectItem>
                    <SelectItem value="test-results">Review Test Results</SelectItem>
                    <SelectItem value="crown-fitting">Crown Fitting</SelectItem>
                    <SelectItem value="root-canal-completion">Complete Root Canal</SelectItem>
                    <SelectItem value="cleaning">Regular Cleaning</SelectItem>
                    <SelectItem value="adjustment">Adjustment/Fine-tuning</SelectItem>
                    <SelectItem value="medication-review">Medication Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {nextAppointment.date && (
              <div className="space-y-2">
                <Label htmlFor="next-notes">Instructions for Next Visit</Label>
                <Textarea
                  id="next-notes"
                  placeholder="Special instructions, preparations needed, things to bring, etc."
                  value={nextAppointment.notes}
                  onChange={(e) => setNextAppointment({...nextAppointment, notes: e.target.value})}
                />
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveSession} className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Session & Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
