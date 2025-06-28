import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Search, Plus, Eye, User, Calendar, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EnhancedPrescriptionForm } from '@/components/prescriptions/EnhancedPrescriptionForm';
import { PrescriptionViewer } from '@/components/prescriptions/PrescriptionViewer';
import { useSettings } from '@/contexts/SettingsContext';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

const Prescriptions = () => {
  const navigate = useNavigate();
  const { clinicName, doctorName, licenseNumber } = useSettings();
  const { prescriptions, isLoading } = usePrescriptions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [showPrescriptionViewer, setShowPrescriptionViewer] = useState(false);

  // Group prescriptions by patient and date for better display
  const groupedPrescriptions = prescriptions.reduce((acc, prescription) => {
    const key = `${prescription.patient_id}-${prescription.prescribed_date}`;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        patient_id: prescription.patient_id,
        patientName: prescription.patients?.full_name || 'Unknown Patient',
        patientId: prescription.patients?.patient_id || prescription.patient_id,
        date: prescription.prescribed_date,
        medicines: [],
        status: 'active', // Default status
        diagnosis: 'Multiple medications', // We'll need to enhance this
        treatment: prescription.treatments?.procedure_done
      };
    }
    acc[key].medicines.push(`${prescription.medication_name} ${prescription.dosage} - ${prescription.frequency} for ${prescription.duration}`);
    return acc;
  }, {} as Record<string, any>);

  const prescriptionsData = Object.values(groupedPrescriptions);

  // Filter prescriptions
  const filteredPrescriptions = prescriptionsData.filter(prescription => {
    const matchesSearch = 
      prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter === 'all' || (() => {
      const prescriptionDate = new Date(prescription.date);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - prescriptionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          return daysDiff === 0;
        case 'week':
          return daysDiff <= 7;
        case 'month':
          return daysDiff <= 30;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'completed':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleViewPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionViewer(true);
  };

  const handleDownloadPrescription = (prescription: any) => {
    const doc = new jsPDF();
    
    // Add letterhead
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(clinicName, 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Dental Care & Treatment Center', 105, 30, { align: 'center' });
    doc.text('123 Medical Street, Health City | Phone: +91 9876543210', 105, 37, { align: 'center' });
    
    // Draw header line
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);
    
    // Prescription header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIPTION', 105, 55, { align: 'center' });
    
    // Prescription details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Prescription ID: ${prescription.id}`, 20, 70);
    doc.text(`Date: ${prescription.date}`, 150, 70);
    
    // Patient information box
    doc.setLineWidth(0.3);
    doc.rect(20, 80, 170, 25);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 25, 88);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${prescription.patientName}`, 25, 95);
    doc.text(`Patient ID: ${prescription.patientId}`, 25, 102);
    
    // Diagnosis
    doc.setFont('helvetica', 'bold');
    doc.text('DIAGNOSIS:', 20, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(prescription.diagnosis, 20, 127);
    
    // Medications
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIBED MEDICATIONS:', 20, 145);
    doc.setFont('helvetica', 'normal');
    
    let yPosition = 152;
    prescription.medicines.forEach((medicine: string, index: number) => {
      doc.text(`${index + 1}. ${medicine}`, 25, yPosition);
      yPosition += 7;
    });
    
    // Doctor signature area
    yPosition += 20;
    doc.setLineWidth(0.3);
    doc.line(20, yPosition, 90, yPosition);
    doc.text(`${doctorName}`, 20, yPosition + 7);
    doc.text(`License: ${licenseNumber}`, 20, yPosition + 14);
    doc.text('Doctor Signature', 20, yPosition + 21);
    
    // Footer
    doc.setFontSize(8);
    doc.text('This is a computer-generated prescription.', 105, 280, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
    
    // Save the PDF
    doc.save(`prescription-${prescription.id}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading prescriptions...</p>
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
              Prescriptions
            </h1>
            <p className="text-slate-600">Manage patient prescriptions and medicines</p>
          </div>
          <Button 
            onClick={() => setShowPrescriptionForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 transition-all duration-200 shadow-lg"
            title="Create New Prescription"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Prescription
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by patient name, ID, or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Prescriptions</p>
                  <p className="text-2xl font-bold text-slate-900">{prescriptionsData.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">This Month</p>
                  <p className="text-2xl font-bold text-green-600">
                    {prescriptionsData.filter(p => {
                      const prescriptionDate = new Date(p.date);
                      const today = new Date();
                      return prescriptionDate.getMonth() === today.getMonth() && 
                             prescriptionDate.getFullYear() === today.getFullYear();
                    }).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Unique Patients</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(prescriptionsData.map(p => p.patient_id)).size}
                  </p>
                </div>
                <User className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prescriptions List */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Prescription Records
            </CardTitle>
            <CardDescription>
              {filteredPrescriptions.length} prescriptions found
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>{searchTerm || dateFilter !== 'all' ? 'No prescriptions found matching your criteria.' : 'No prescriptions created yet.'}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowPrescriptionForm(true)}
                >
                  Create First Prescription
                </Button>
              </div>
            ) : (
              filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:shadow-md hover:bg-slate-50/50 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">{prescription.patientName}</span>
                        <span className="text-sm text-slate-500">({prescription.patientId})</span>
                        <span className="text-sm font-mono text-slate-600">{prescription.id.slice(0, 8)}</span>
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        <div>{prescription.diagnosis}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {prescription.medicines.length} medication(s) • {format(new Date(prescription.date), 'PPP')}
                          {prescription.treatment && ` • Related to: ${prescription.treatment}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(prescription.status)} border font-medium`}>
                      {prescription.status}
                    </Badge>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/patient-record?patient=${prescription.patient_id}`)}
                        title="View Patient Record"
                      >
                        <User className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewPrescription(prescription)}
                        title="View Prescription Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadPrescription(prescription)}
                        title="Download Prescription"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Prescription Form Dialog */}
      <EnhancedPrescriptionForm 
        open={showPrescriptionForm} 
        onOpenChange={setShowPrescriptionForm} 
      />

      {/* Prescription Viewer Dialog */}
      <PrescriptionViewer
        open={showPrescriptionViewer}
        onOpenChange={setShowPrescriptionViewer}
        prescription={selectedPrescription}
      />
    </div>
  );
};

export default Prescriptions;