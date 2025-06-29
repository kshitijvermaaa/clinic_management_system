import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, CheckCircle } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { useToast } from '@/hooks/use-toast';

interface PatientSelectorProps {
  selectedPatient: any;
  onPatientSelect: (patient: any) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export const PatientSelector: React.FC<PatientSelectorProps> = ({
  selectedPatient,
  onPatientSelect,
  label = "Patient",
  required = false,
  placeholder = "Search by name or patient ID..."
}) => {
  const { patients } = usePatients();
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (selectedPatient) {
      setSearchValue(selectedPatient.patient_id);
    }
  }, [selectedPatient]);

  useEffect(() => {
    if (searchValue.trim()) {
      const filtered = patients.filter(patient =>
        patient.full_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient.patient_id.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient.mobile_number.includes(searchValue)
      );
      setFilteredPatients(filtered);
    } else {
      // Show recent patients when no search term
      setFilteredPatients(patients.slice(0, 10));
    }
  }, [searchValue, patients]);

  const handleInputChange = (value: string) => {
    setSearchValue(value);
    setShowDropdown(true);
    
    // Clear selected patient if input is manually changed
    if (selectedPatient && value !== selectedPatient.patient_id) {
      onPatientSelect(null);
    }
  };

  const handlePatientSelect = (patient: any) => {
    setSearchValue(patient.patient_id);
    setShowDropdown(false);
    onPatientSelect(patient);
    
    toast({
      title: "Patient Selected",
      description: `${patient.full_name} (${patient.patient_id}) selected`,
    });
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="space-y-2 relative">
      <Label className="text-sm font-medium text-slate-700">
        {label} {required && '*'}
      </Label>
      
      <div className="relative">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="pl-9 border-slate-200 focus:border-blue-500"
            required={required}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <div className="p-3 text-center text-slate-500 text-sm">
                {searchValue ? 'No patients found' : 'No patients available'}
              </div>
            ) : (
              <>
                {!searchValue && (
                  <div className="p-2 border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-600">
                    Recent Patients
                  </div>
                )}
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0"
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{patient.full_name}</div>
                          <div className="text-sm text-slate-500">
                            {patient.patient_id} • {patient.mobile_number.split(',')[0]}
                          </div>
                        </div>
                      </div>
                      {selectedPatient?.id === patient.id && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Selected Patient Display */}
      {selectedPatient && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <strong>Selected:</strong> {selectedPatient.full_name} | 
            <strong> Phone:</strong> {selectedPatient.mobile_number.split(',')[0]} | 
            <strong> ID:</strong> {selectedPatient.patient_id}
          </div>
        </div>
      )}

      {/* Warning if no patient selected */}
      {!selectedPatient && searchValue && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-sm text-red-700">
            <strong>Warning:</strong> No valid patient selected. Please search for and select a patient.
          </div>
        </div>
      )}
    </div>
  );
};