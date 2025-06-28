
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, Phone, Calendar, FileText, Download, Eye, Plus, Stethoscope } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PatientDetailsDialog } from '@/components/appointments/PatientDetailsDialog';
import { useToast } from '@/hooks/use-toast';
import { usePatients } from '@/hooks/usePatients';

const PatientSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { patients, isLoading } = usePatients();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('patient') || '');
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [filteredPatients, setFilteredPatients] = useState(patients);

  // Filter patients based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mobile_number.includes(searchTerm) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

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

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowPatientDetails(true);
  };

  const handleDownloadRecords = (patientName: string) => {
    toast({
      title: "Download Started",
      description: `Downloading medical records for ${patientName}...`,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleNewTreatment = (patientId: string, patientName: string) => {
    navigate(`/in-patient-treatment?patient=${patientId}&name=${encodeURIComponent(patientName)}&type=appointment`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading patients...</p>
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
              Patient Search
            </h1>
            <p className="text-slate-600">Find and manage patient records</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => navigate('/register')}
            title="Register New Patient"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Patient
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Search Patients
            </CardTitle>
            <CardDescription>
              Search by name, patient ID, phone number, or email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Enter patient name, ID, phone, or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9 text-base h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Search Results
            </CardTitle>
            <CardDescription>
              {filteredPatients.length} patients {searchTerm ? 'found' : 'in database'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <User className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>{searchTerm ? 'No patients found matching your search.' : 'No patients registered yet.'}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/register')}
                >
                  Register New Patient
                </Button>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:shadow-md hover:bg-slate-50/50 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">
                          {patient.full_name}
                          {patient.patient_nickname && ` (${patient.patient_nickname})`}
                        </span>
                        <span className="text-sm text-slate-500">({patient.patient_id})</span>
                        <Badge className="bg-green-50 text-green-700 border-green-200 border font-medium text-xs">
                          active
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {patient.mobile_number}
                          </span>
                          {patient.email && <span>{patient.email}</span>}
                          <span>{calculateAge(patient.date_of_birth)}Y {patient.gender}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Registered: {new Date(patient.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleNewTreatment(patient.patient_id, patient.full_name)}
                      title="Start New Treatment"
                    >
                      <Stethoscope className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/appointments')}
                      title="View Patient Appointments"
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/prescriptions')}
                      title="View Patient Prescriptions"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewPatient(patient.patient_id)}
                      title="Quick View Patient Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/patient-record?patient=${patient.patient_id}`)}
                      title="View Complete Patient Record"
                    >
                      <User className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadRecords(patient.full_name)}
                      title="Download Medical Records"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <PatientDetailsDialog
        open={showPatientDetails}
        onOpenChange={setShowPatientDetails}
        patientId={selectedPatientId}
      />
    </div>
  );
};

export default PatientSearch;
