import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLabWork } from '@/hooks/useLabWork';
import { usePatients } from '@/hooks/usePatients';
import { useTreatments } from '@/hooks/useTreatments';
import { 
  FlaskConical, 
  Upload, 
  X, 
  FileText, 
  Calendar, 
  DollarSign,
  User,
  Building2,
  ClipboardList,
  Calculator,
  Search
} from 'lucide-react';

interface EnhancedLabWorkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  treatmentId?: string;
}

export const EnhancedLabWorkForm: React.FC<EnhancedLabWorkFormProps> = ({ 
  open, 
  onOpenChange, 
  patientId: initialPatientId,
  treatmentId: initialTreatmentId 
}) => {
  const { toast } = useToast();
  const { createLabWork, uploadLabWorkFile } = useLabWork();
  const { patients } = usePatients();
  const { treatments } = useTreatments();
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientSearchValue, setPatientSearchValue] = useState('');
  
  const [formData, setFormData] = useState({
    patient_id: initialPatientId || '',
    treatment_id: initialTreatmentId || '',
    lab_type: '',
    lab_name: '',
    work_description: '',
    instructions: '',
    date_sent: new Date().toISOString().split('T')[0],
    expected_date: '',
    notes: '',
    // Simplified cost tracking fields
    total_cost: '',
    total_paid: '',
    balance_remaining: ''
  });

  // Pre-populate selectedPatient when form opens with initialPatientId
  useEffect(() => {
    if (initialPatientId && patients.length > 0) {
      const patient = patients.find(p => p.patient_id === initialPatientId);
      if (patient) {
        setSelectedPatient(patient);
        setPatientSearchValue(patient.patient_id);
      }
    }
  }, [initialPatientId, patients]);

  const labTypes = [
    'Crown & Bridge',
    'Dentures (Complete)',
    'Dentures (Partial)',
    'Implant Crown',
    'Orthodontic Appliance',
    'Night Guard',
    'Whitening Trays',
    'Surgical Guide',
    'Temporary Crown',
    'Veneer',
    'Inlay/Onlay',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    // Handle treatment_id specifically to convert "none" back to empty string
    if (field === 'treatment_id' && value === 'none') {
      setFormData(prev => ({ ...prev, [field]: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Auto-calculate balance when cost or paid amount changes
    if (['total_cost', 'total_paid'].includes(field)) {
      calculateBalance({ ...formData, [field]: value });
    }
  };

  const calculateBalance = (data: typeof formData) => {
    const totalCost = parseFloat(data.total_cost) || 0;
    const totalPaid = parseFloat(data.total_paid) || 0;
    const balance = totalCost - totalPaid;
    
    setFormData(prev => ({ 
      ...prev, 
      balance_remaining: balance.toFixed(2)
    }));
  };

  const handlePatientSearch = (patientCode: string) => {
    const patient = patients.find(p => 
      p.patient_id.toLowerCase() === patientCode.toLowerCase() ||
      p.full_name.toLowerCase().includes(patientCode.toLowerCase())
    );
    
    if (patient) {
      setSelectedPatient(patient);
      setFormData(prev => ({ ...prev, patient_id: patient.patient_id }));
      toast({
        title: "Patient Found",
        description: `Linked to ${patient.full_name} (${patient.patient_id})`,
      });
    } else {
      setSelectedPatient(null);
      setFormData(prev => ({ ...prev, patient_id: '' }));
      toast({
        title: "Patient Not Found",
        description: "Please check the patient code and try again.",
        variant: "destructive",
      });
    }
  };

  const handlePatientSearchInputChange = (value: string) => {
    setPatientSearchValue(value);
    // Clear selected patient if input is manually changed
    if (selectedPatient && value !== selectedPatient.patient_id) {
      setSelectedPatient(null);
      setFormData(prev => ({ ...prev, patient_id: '' }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).filter(file => 
        file.size <= 50 * 1024 * 1024 // 50MB limit
      );
      
      if (newFiles.length !== files.length) {
        toast({
          title: "File Upload Warning",
          description: "Some files were skipped. Maximum file size is 50MB.",
          variant: "destructive",
        });
      }
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that a valid patient is selected
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please search for and select a valid patient before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.lab_type || !formData.lab_name || !formData.work_description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const labWorkData = {
        patient_id: selectedPatient.patient_id,
        treatment_id: formData.treatment_id || undefined,
        lab_type: formData.lab_type,
        lab_name: formData.lab_name,
        work_description: formData.work_description,
        instructions: formData.instructions || undefined,
        date_sent: formData.date_sent,
        expected_date: formData.expected_date || undefined,
        cost: formData.total_cost ? parseFloat(formData.total_cost) : undefined,
        notes: formData.notes || undefined,
        status: 'pending' as const
      };

      const createdLabWork = await createLabWork(labWorkData);

      // Upload files if any
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          try {
            await uploadLabWorkFile(createdLabWork.id, file);
          } catch (error) {
            console.error('Error uploading file:', error);
            toast({
              title: "Upload Warning",
              description: `Failed to upload ${file.name}`,
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: "Success",
        description: "Lab work created successfully!",
      });

      // Reset form
      setFormData({
        patient_id: initialPatientId || '',
        treatment_id: initialTreatmentId || '',
        lab_type: '',
        lab_name: '',
        work_description: '',
        instructions: '',
        date_sent: new Date().toISOString().split('T')[0],
        expected_date: '',
        notes: '',
        total_cost: '',
        total_paid: '',
        balance_remaining: ''
      });
      setUploadedFiles([]);
      setSelectedPatient(null);
      setPatientSearchValue('');
      onOpenChange(false);

    } catch (error) {
      console.error('Error creating lab work:', error);
      toast({
        title: "Error",
        description: "Failed to create lab work. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const patientTreatments = treatments.filter(t => t.patient_id === selectedPatient?.patient_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            Create Lab Work Order
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Submit work to dental laboratory with detailed specifications and simplified cost tracking.
          </DialogDescription>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Linkage */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <User className="w-5 h-5 text-blue-600" />
                Patient Linkage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-search" className="text-sm font-medium text-slate-700">Patient Code/Name *</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="patient-search"
                      placeholder="Enter patient code or name"
                      value={patientSearchValue}
                      onChange={(e) => handlePatientSearchInputChange(e.target.value)}
                      className="border-slate-200 focus:border-blue-500"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => handlePatientSearch(patientSearchValue)}
                      className="px-3"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="treatment-select" className="text-sm font-medium text-slate-700">Related Treatment (Optional)</Label>
                  <Select 
                    value={formData.treatment_id || 'none'} 
                    onValueChange={(value) => handleInputChange('treatment_id', value)}
                  >
                    <SelectTrigger className="border-slate-200 focus:border-blue-500">
                      <SelectValue placeholder="Select treatment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No related treatment</SelectItem>
                      {patientTreatments.map((treatment) => (
                        <SelectItem key={treatment.id} value={treatment.id}>
                          {treatment.procedure_done} - {treatment.treatment_date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedPatient && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm">
                    <strong>Linked Patient:</strong> {selectedPatient.full_name} | 
                    <strong> Phone:</strong> {selectedPatient.mobile_number} | 
                    <strong> ID:</strong> {selectedPatient.patient_id}
                  </div>
                </div>
              )}

              {!selectedPatient && patientSearchValue && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-sm text-red-700">
                    <strong>Warning:</strong> No valid patient selected. Please search for and select a patient before submitting.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lab Work Details */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Building2 className="w-5 h-5 text-purple-600" />
                Lab Work Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lab-type" className="text-sm font-medium text-slate-700">Lab Work Type *</Label>
                <Select 
                  value={formData.lab_type} 
                  onValueChange={(value) => handleInputChange('lab_type', value)}
                  required
                >
                  <SelectTrigger className="border-slate-200 focus:border-purple-500">
                    <SelectValue placeholder="Select lab work type" />
                  </SelectTrigger>
                  <SelectContent>
                    {labTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lab-name" className="text-sm font-medium text-slate-700">Laboratory Name *</Label>
                <Input 
                  id="lab-name" 
                  placeholder="Enter laboratory name"
                  value={formData.lab_name}
                  onChange={(e) => handleInputChange('lab_name', e.target.value)}
                  required 
                  className="border-slate-200 focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="work-description" className="text-sm font-medium text-slate-700">Work Description *</Label>
                <Textarea 
                  id="work-description" 
                  placeholder="Detailed description of the lab work required"
                  value={formData.work_description}
                  onChange={(e) => handleInputChange('work_description', e.target.value)}
                  required 
                  className="border-slate-200 focus:border-purple-500 min-h-[80px]"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="instructions" className="text-sm font-medium text-slate-700">Special Instructions</Label>
                <Textarea 
                  id="instructions" 
                  placeholder="Any special instructions for the laboratory"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  className="border-slate-200 focus:border-purple-500 min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Calendar className="w-5 h-5 text-green-600" />
                Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-sent" className="text-sm font-medium text-slate-700">Date Sent *</Label>
                <Input 
                  id="date-sent" 
                  type="date"
                  value={formData.date_sent}
                  onChange={(e) => handleInputChange('date_sent', e.target.value)}
                  required 
                  className="border-slate-200 focus:border-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected-date" className="text-sm font-medium text-slate-700">Expected Completion</Label>
                <Input 
                  id="expected-date" 
                  type="date"
                  value={formData.expected_date}
                  onChange={(e) => handleInputChange('expected_date', e.target.value)}
                  className="border-slate-200 focus:border-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Simplified Cost Tracking */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Calculator className="w-5 h-5 text-yellow-600" />
                Cost Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total-cost" className="text-sm font-medium text-slate-700">Total Cost</Label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input 
                      id="total-cost" 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.total_cost}
                      onChange={(e) => handleInputChange('total_cost', e.target.value)}
                      className="pl-9 border-slate-200 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total-paid" className="text-sm font-medium text-slate-700">Total Paid</Label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input 
                      id="total-paid" 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.total_paid}
                      onChange={(e) => handleInputChange('total_paid', e.target.value)}
                      className="pl-9 border-slate-200 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balance-remaining" className="text-sm font-medium text-slate-700">Balance Remaining</Label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input 
                      id="balance-remaining" 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.balance_remaining}
                      readOnly
                      className="pl-9 border-slate-200 bg-slate-50 font-semibold text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {formData.balance_remaining && parseFloat(formData.balance_remaining) !== 0 && (
                <div className={`p-3 rounded-lg border ${
                  parseFloat(formData.balance_remaining) > 0 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className={`text-sm font-medium ${
                    parseFloat(formData.balance_remaining) > 0 
                      ? 'text-orange-800' 
                      : 'text-green-800'
                  }`}>
                    {parseFloat(formData.balance_remaining) > 0 
                      ? `Outstanding Balance: $${formData.balance_remaining}` 
                      : `Overpaid: $${Math.abs(parseFloat(formData.balance_remaining)).toFixed(2)}`
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Upload className="w-5 h-5 text-orange-600" />
                Upload Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-orange-400 transition-colors">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-slate-500">
                    Supported formats: Images, PDFs, Documents (Max 50MB each)
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Choose Files
                  </Button>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files:</Label>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <div>
                            <span className="text-sm font-medium">{file.name}</span>
                            <div className="text-xs text-slate-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Additional Notes
                </Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any additional notes or comments"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="border-slate-200 focus:border-blue-500"
                />
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
              disabled={isLoading || !selectedPatient}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Creating Lab Work...' : 'Create Lab Work Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};