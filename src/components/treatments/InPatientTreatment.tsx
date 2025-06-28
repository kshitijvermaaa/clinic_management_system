
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Stethoscope, Calendar as CalendarIcon, Save, FileText, Upload, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { VisualTeethSelector } from '@/components/appointments/VisualTeethSelector';

interface ToothSelection {
  tooth: string;
  parts: string[];
}

interface InPatientTreatmentProps {
  patientId: string;
  patientName: string;
  visitType: 'appointment' | 'first-visit' | 'emergency';
}

export const InPatientTreatment: React.FC<InPatientTreatmentProps> = ({ 
  patientId, 
  patientName, 
  visitType 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [treatmentData, setTreatmentData] = useState({
    procedure_done: '',
    materials_used: '',
    notes: '',
    treatment_cost: '',
    teeth_involved: [] as ToothSelection[],
    treatment_status: 'ongoing' as 'ongoing' | 'completed' | 'paused'
  });

  const [nextAppointmentDate, setNextAppointmentDate] = useState<Date>();
  const [documents, setDocuments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setTreatmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setDocuments(Array.from(files));
    }
  };

  const uploadDocuments = async (treatmentId: string) => {
    if (documents.length === 0) return;

    try {
      for (const file of documents) {
        const fileName = `${treatmentId}/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage
          .from('treatment-documents')
          .upload(fileName, file);

        if (error) {
          console.error('Error uploading file:', error);
          toast({
            title: "Upload Warning",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Documents Uploaded",
        description: `${documents.length} document(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error in uploadDocuments:', error);
    }
  };

  const handleSaveTreatment = async () => {
    if (!patientId || !treatmentData.procedure_done) {
      toast({
        title: "Error",
        description: "Patient ID and procedure are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Convert ToothSelection[] to string[] for database storage
      const teethInvolvedStrings = treatmentData.teeth_involved.map(selection => 
        `${selection.tooth}:${selection.parts.join(',')}`
      );

      // Save treatment
      const { data: treatment, error: treatmentError } = await supabase
        .from('treatments')
        .insert({
          patient_id: patientId,
          procedure_done: treatmentData.procedure_done,
          materials_used: treatmentData.materials_used || null,
          notes: treatmentData.notes || null,
          treatment_cost: treatmentData.treatment_cost ? parseFloat(treatmentData.treatment_cost) : null,
          teeth_involved: teethInvolvedStrings.length > 0 ? teethInvolvedStrings : null,
          treatment_date: new Date().toISOString().split('T')[0],
          treatment_status: treatmentData.treatment_status,
          next_appointment_date: nextAppointmentDate ? format(nextAppointmentDate, 'yyyy-MM-dd') : null
        })
        .select()
        .single();

      if (treatmentError) {
        console.error('Treatment error:', treatmentError);
        throw treatmentError;
      }

      // Create next appointment if date is selected
      if (nextAppointmentDate && treatment) {
        const { error: appointmentError } = await supabase
          .from('appointments')
          .insert({
            patient_id: patientId,
            appointment_date: format(nextAppointmentDate, 'yyyy-MM-dd'),
            appointment_time: '10:00:00',
            appointment_type: 'followup',
            status: 'scheduled',
            notes: `Follow-up for: ${treatmentData.procedure_done}`
          });

        if (appointmentError) {
          console.error('Appointment error:', appointmentError);
          toast({
            title: "Warning",
            description: "Treatment saved but failed to create appointment",
            variant: "destructive",
          });
        }
      }

      // Upload documents
      if (treatment && documents.length > 0) {
        await uploadDocuments(treatment.id);
      }

      toast({
        title: "Success",
        description: "Treatment recorded successfully",
      });

      // Navigate back or to patient record
      navigate(`/patient-record?patient=${patientId}`);

    } catch (error) {
      console.error('Error saving treatment:', error);
      toast({
        title: "Error",
        description: "Failed to save treatment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(-1)}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  In-Patient Treatment
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <p className="text-blue-100">
                    Recording treatment for: <span className="font-semibold text-white">{patientName || 'Unknown Patient'}</span>
                  </p>
                  {visitType && (
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {visitType.replace('-', ' ').toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/patient-record?patient=${patientId}`)}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Patient Record
              </Button>
            </div>
          </div>
        </div>

        {/* Main Treatment Form */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              Treatment Details
            </CardTitle>
            <CardDescription className="text-slate-600">
              Record the treatment procedure and relevant information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="procedure" className="text-sm font-semibold text-slate-700">
                  Procedure Done *
                </Label>
                <Input
                  id="procedure"
                  placeholder="e.g., Root Canal Treatment, Extraction, Cleaning"
                  value={treatmentData.procedure_done}
                  onChange={(e) => handleInputChange('procedure_done', e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="cost" className="text-sm font-semibold text-slate-700">
                  Treatment Cost
                </Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="0.00"
                  value={treatmentData.treatment_cost}
                  onChange={(e) => handleInputChange('treatment_cost', e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="materials" className="text-sm font-semibold text-slate-700">
                  Materials Used
                </Label>
                <Input
                  id="materials"
                  placeholder="e.g., Amalgam, Composite, Local Anesthesia"
                  value={treatmentData.materials_used}
                  onChange={(e) => handleInputChange('materials_used', e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700">Treatment Status</Label>
                <Select
                  value={treatmentData.treatment_status}
                  onValueChange={(value: 'ongoing' | 'completed' | 'paused') => 
                    handleInputChange('treatment_status', value)
                  }
                >
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visual Teeth Selector */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-slate-700">
                Teeth Involved (Visual Selection)
              </Label>
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4">
                <VisualTeethSelector
                  selectedTeeth={treatmentData.teeth_involved}
                  onTeethChange={(teeth) => setTreatmentData(prev => ({ ...prev, teeth_involved: teeth }))}
                />
              </div>
            </div>

            {/* Treatment Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                Treatment Notes & Observations
              </Label>
              <Textarea
                id="notes"
                placeholder="Describe the treatment procedure, patient's condition, any complications, medications prescribed..."
                value={treatmentData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="min-h-[120px] border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                rows={5}
              />
            </div>

            {/* Document Upload */}
            <div className="space-y-3">
              <Label htmlFor="documents" className="text-sm font-semibold text-slate-700">
                Upload Treatment Documents
              </Label>
              <div className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:border-blue-400 transition-colors">
                <Upload className="w-6 h-6 text-slate-400" />
                <div className="flex-1">
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="border-0 bg-transparent p-0 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>
              </div>
              {documents.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    📁 {documents.length} file(s) selected:
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {documents.map(f => f.name).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Next Appointment Scheduling */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-slate-800">Schedule Next Appointment (Optional)</h4>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-orange-300 hover:border-orange-400 hover:bg-orange-50"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextAppointmentDate ? format(nextAppointmentDate, 'PPP') : 'Select appointment date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={nextAppointmentDate}
                    onSelect={setNextAppointmentDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
              <Button
                onClick={handleSaveTreatment}
                disabled={isLoading || !treatmentData.procedure_done}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3"
                size="lg"
              >
                <Save className="w-5 h-5 mr-2" />
                {isLoading ? 'Saving Treatment...' : 'Save Treatment Record'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate(`/patient-record?patient=${patientId}`)}
                className="sm:w-auto border-slate-300 hover:bg-slate-50 py-3"
                size="lg"
              >
                <FileText className="w-5 h-5 mr-2" />
                View Patient Record
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
