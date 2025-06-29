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
import { Stethoscope, Calendar as CalendarIcon, Save, FileText, ArrowLeft, AlertTriangle, User as UserIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { VisualTeethSelector } from '@/components/appointments/VisualTeethSelector';
import { PatientSelector } from '@/components/common/PatientSelector';
import { usePatients } from '@/hooks/usePatients';

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
  const { getPatientById } = usePatients();
  
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [treatmentData, setTreatmentData] = useState({
    patientComplaint: '',
    painLevel: '',
    doctorAnalysis: '',
    procedure_done: '',
    customProcedure: '',
    notes: '',
    treatment_cost: '',
    teeth_involved: [] as ToothSelection[],
    treatment_status: 'ongoing' as 'ongoing' | 'completed' | 'paused'
  });

  const [nextAppointmentDate, setNextAppointmentDate] = useState<Date>();
  const [documents, setDocuments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Common dental procedures
  const commonProcedures = [
    'Routine Checkup',
    'Teeth Cleaning',
    'Dental Filling',
    'Root Canal Treatment',
    'Tooth Extraction',
    'Crown Placement',
    'Bridge Work',
    'Scaling & Polishing',
    'Orthodontic Consultation',
    'Wisdom Tooth Extraction',
    'Dental Implant',
    'Veneer Placement',
    'Teeth Whitening',
    'Gum Treatment',
    'Emergency Treatment',
    'Follow-up Visit'
  ];

  // Check if patient is already provided (from patient search or dashboard)
  const hasPreselectedPatient = Boolean(patientId && patientName);

  // Initialize with existing patient if provided - fetch complete patient data
  useEffect(() => {
    const loadPatient = async () => {
      if (patientId) {
        setIsLoadingPatient(true);
        try {
          const patient = await getPatientById(patientId);
          if (patient) {
            setSelectedPatient(patient);
          } else {
            // Fallback: create partial object if patient not found in database
            setSelectedPatient({
              patient_id: patientId,
              full_name: patientName || 'Unknown Patient',
              mobile_number: '', // Ensure mobile_number is always present
              email: '',
              date_of_birth: null,
              gender: '',
              address: ''
            });
          }
        } catch (error) {
          console.error('Error loading patient:', error);
          // Fallback: create partial object on error
          setSelectedPatient({
            patient_id: patientId,
            full_name: patientName || 'Unknown Patient',
            mobile_number: '', // Ensure mobile_number is always present
            email: '',
            date_of_birth: null,
            gender: '',
            address: ''
          });
        } finally {
          setIsLoadingPatient(false);
        }
      }
    };

    loadPatient();
  }, [patientId, patientName, getPatientById]);

  const handleInputChange = (field: string, value: string) => {
    setTreatmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProcedureSelect = (procedure: string) => {
    if (procedure === 'custom') {
      handleInputChange('procedure_done', '');
    } else {
      handleInputChange('procedure_done', procedure);
      handleInputChange('customProcedure', '');
    }
  };

  const addCustomProcedure = () => {
    if (treatmentData.customProcedure.trim()) {
      handleInputChange('procedure_done', treatmentData.customProcedure.trim());
      handleInputChange('customProcedure', '');
    }
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
    if (!selectedPatient || !treatmentData.patientComplaint || !treatmentData.procedure_done) {
      toast({
        title: "Error",
        description: "Patient, complaint, and procedure are required",
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

      // Combine patient complaint, pain level, and doctor analysis into notes
      const combinedNotes = [
        `Patient Complaint: ${treatmentData.patientComplaint}`,
        treatmentData.painLevel ? `Pain Level: ${treatmentData.painLevel}/10` : '',
        treatmentData.doctorAnalysis ? `Doctor's Analysis: ${treatmentData.doctorAnalysis}` : '',
        treatmentData.notes ? `Additional Notes: ${treatmentData.notes}` : ''
      ].filter(Boolean).join('\n\n');

      // Save treatment
      const { data: treatment, error: treatmentError } = await supabase
        .from('treatments')
        .insert({
          patient_id: selectedPatient.patient_id,
          procedure_done: treatmentData.procedure_done,
          notes: combinedNotes,
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
            patient_id: selectedPatient.patient_id,
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
      navigate(`/patient-record?patient=${selectedPatient.patient_id}`);

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

  const getPainLevelColor = (level: string) => {
    const num = parseInt(level);
    if (num <= 3) return 'bg-green-100 text-green-700';
    if (num <= 6) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
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
                    Recording treatment session
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
              {selectedPatient && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/patient-record?patient=${selectedPatient.patient_id}`)}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Patient Record
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Patient Selection - Only show if no patient is preselected */}
        {!hasPreselectedPatient && (
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                Patient Selection
              </CardTitle>
              <CardDescription className="text-slate-600">
                Select the patient for this treatment session
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingPatient ? (
                <div className="flex items-center justify-center p-4">
                  <div className="text-slate-600">Loading patient information...</div>
                </div>
              ) : (
                <div className="w-full max-w-2xl mx-auto">
                  <PatientSelector
                    selectedPatient={selectedPatient}
                    onPatientSelect={setSelectedPatient}
                    label="Patient"
                    required={true}
                    placeholder="Search by patient name or ID..."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Patient Info Display - Show when patient is preselected */}
        {hasPreselectedPatient && selectedPatient && (
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-600 rounded-lg">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                Selected Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-green-900">{selectedPatient.full_name}</div>
                  <div className="text-sm text-green-700">
                    Patient ID: {selectedPatient.patient_id}
                    {selectedPatient.mobile_number && ` • Phone: ${selectedPatient.mobile_number.split(',')[0]}`}
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Ready for Treatment
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Patient Complaint */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-red-50 to-slate-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-red-600 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              Step 1: Patient Complaint
            </CardTitle>
            <CardDescription className="text-slate-600">
              Record the patient's chief complaint and symptoms
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <Label htmlFor="patient-complaint" className="text-sm font-semibold text-slate-700">
                Chief Complaint *
              </Label>
              <Textarea
                id="patient-complaint"
                placeholder="Describe the patient's main complaint and symptoms in detail..."
                value={treatmentData.patientComplaint}
                onChange={(e) => handleInputChange('patientComplaint', e.target.value)}
                className="border-slate-300 focus:border-red-500 focus:ring-red-500/20 min-h-[100px]"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="pain-level" className="text-sm font-semibold text-slate-700">
                Pain Level (1-10)
              </Label>
              <Select value={treatmentData.painLevel} onValueChange={(value) => handleInputChange('painLevel', value)}>
                <SelectTrigger className="border-slate-300 focus:border-red-500">
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
              {treatmentData.painLevel && (
                <Badge className={getPainLevelColor(treatmentData.painLevel)}>
                  Pain Level: {treatmentData.painLevel}/10
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Doctor's Analysis */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-slate-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              Step 2: Doctor's Analysis
            </CardTitle>
            <CardDescription className="text-slate-600">
              Clinical findings, examination results, and diagnosis
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <Label htmlFor="doctor-analysis" className="text-sm font-semibold text-slate-700">
                Clinical Analysis & Diagnosis
              </Label>
              <Textarea
                id="doctor-analysis"
                placeholder="Doctor's clinical findings, examination results, and preliminary diagnosis..."
                value={treatmentData.doctorAnalysis}
                onChange={(e) => handleInputChange('doctorAnalysis', e.target.value)}
                className="border-slate-300 focus:border-purple-500 focus:ring-purple-500/20 min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Visual Teeth Selector */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-slate-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              Step 3: Teeth Involved
            </CardTitle>
            <CardDescription className="text-slate-600">
              Select the teeth and specific parts involved in treatment
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-white rounded-xl p-4 border border-orange-200">
              <VisualTeethSelector
                selectedTeeth={treatmentData.teeth_involved}
                onTeethChange={(teeth) => setTreatmentData(prev => ({ ...prev, teeth_involved: teeth }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Treatment Details */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-slate-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-green-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Step 4: Treatment Details
            </CardTitle>
            <CardDescription className="text-slate-600">
              Specify the procedure performed and treatment information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Procedure Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-slate-700">Procedure Done *</Label>
              <Select onValueChange={handleProcedureSelect}>
                <SelectTrigger className="border-slate-300 focus:border-green-500">
                  <SelectValue placeholder="Select procedure performed" />
                </SelectTrigger>
                <SelectContent>
                  {commonProcedures.map((procedure) => (
                    <SelectItem key={procedure} value={procedure}>
                      {procedure}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">+ Add Custom Procedure</SelectItem>
                </SelectContent>
              </Select>

              {/* Custom Procedure Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter custom procedure"
                  value={treatmentData.customProcedure}
                  onChange={(e) => handleInputChange('customProcedure', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomProcedure())}
                  className="border-slate-300 focus:border-green-500"
                />
                <Button type="button" variant="outline" onClick={addCustomProcedure}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Selected Procedure Display */}
              {treatmentData.procedure_done && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-800">
                      Selected: {treatmentData.procedure_done}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInputChange('procedure_done', '')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Treatment Cost and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="cost" className="text-sm font-semibold text-slate-700">
                  Treatment Cost (₹)
                </Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={treatmentData.treatment_cost}
                  onChange={(e) => handleInputChange('treatment_cost', e.target.value)}
                  className="border-slate-300 focus:border-green-500 focus:ring-green-500/20"
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
                  <SelectTrigger className="border-slate-300 focus:border-green-500">
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
          </CardContent>
        </Card>

        {/* Step 5: Treatment Notes */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Step 5: Additional Notes
            </CardTitle>
            <CardDescription className="text-slate-600">
              Additional observations, instructions, and follow-up notes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                Treatment Notes & Observations
              </Label>
              <Textarea
                id="notes"
                placeholder="Additional observations, patient response, follow-up instructions, medications prescribed..."
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
                <FileText className="w-6 h-6 text-slate-400" />
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
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            onClick={handleSaveTreatment}
            disabled={isLoading || !selectedPatient || !treatmentData.patientComplaint || !treatmentData.procedure_done}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3"
            size="lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {isLoading ? 'Saving Treatment...' : 'Save Treatment Record'}
          </Button>
          
          {selectedPatient && (
            <Button
              variant="outline"
              onClick={() => navigate(`/patient-record?patient=${selectedPatient.patient_id}`)}
              className="sm:w-auto border-slate-300 hover:bg-slate-50 py-3"
              size="lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Patient Record
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};