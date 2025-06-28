import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Calendar, Search, FileText, Stethoscope, AlertTriangle, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const handleWalkInTreatment = () => {
    navigate('/in-patient-treatment?type=first-visit');
  };

  const handleEmergencyTreatment = () => {
    navigate('/in-patient-treatment?type=emergency');
  };

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks to get things done quickly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full justify-start gap-3 bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/register')}
        >
          <UserPlus className="w-4 h-4" />
          Register New Patient
        </Button>
        
        <Button 
          className="w-full justify-start gap-3 bg-green-600 hover:bg-green-700"
          onClick={handleWalkInTreatment}
        >
          <Stethoscope className="w-4 h-4" />
          Walk-in Treatment
        </Button>
        
        <Button 
          className="w-full justify-start gap-3 bg-red-600 hover:bg-red-700"
          onClick={handleEmergencyTreatment}
        >
          <AlertTriangle className="w-4 h-4" />
          Emergency Treatment
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3"
          onClick={() => navigate('/appointments')}
        >
          <Calendar className="w-4 h-4" />
          Schedule Appointment
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3"
          onClick={() => navigate('/lab-work')}
        >
          <FlaskConical className="w-4 h-4" />
          Create Lab Work
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3"
          onClick={() => navigate('/search')}
        >
          <Search className="w-4 h-4" />
          Find Patient
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3"
          onClick={() => navigate('/prescriptions')}
        >
          <FileText className="w-4 h-4" />
          Generate Prescription
        </Button>
        
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-sm font-medium text-slate-900 mb-3">Recent Patients</h4>
          <div className="space-y-2">
            <div 
              className="text-sm text-slate-600 hover:text-slate-900 cursor-pointer p-2 hover:bg-slate-50 rounded"
              onClick={() => navigate('/search')}
            >
              John Doe (P001)
            </div>
            <div 
              className="text-sm text-slate-600 hover:text-slate-900 cursor-pointer p-2 hover:bg-slate-50 rounded"
              onClick={() => navigate('/search')}
            >
              Sarah Johnson (P024)
            </div>
            <div 
              className="text-sm text-slate-600 hover:text-slate-900 cursor-pointer p-2 hover:bg-slate-50 rounded"
              onClick={() => navigate('/search')}
            >
              Mike Wilson (P035)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};