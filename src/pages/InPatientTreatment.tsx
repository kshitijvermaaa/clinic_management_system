
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { InPatientTreatment } from '@/components/treatments/InPatientTreatment';

const InPatientTreatmentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const patientId = searchParams.get('patient') || '';
  const patientName = searchParams.get('name') || '';
  const visitType = searchParams.get('type') as 'appointment' | 'first-visit' | 'emergency' || 'appointment';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)} 
              className="border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                In-Patient Treatment
              </h1>
              <p className="text-slate-600">Record treatment details for patient visit</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/search')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <User className="w-4 h-4 mr-2" />
            Find Patient
          </Button>
        </div>

        {/* Treatment Component */}
        <InPatientTreatment
          patientId={patientId}
          patientName={patientName}
          visitType={visitType}
        />
      </div>
    </div>
  );
};

export default InPatientTreatmentPage;
