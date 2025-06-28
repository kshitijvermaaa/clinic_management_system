
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
  clinicName: string;
  setClinicName: (name: string) => void;
  doctorName: string;
  setDoctorName: (name: string) => void;
  licenseNumber: string;
  setLicenseNumber: (license: string) => void;
  settings: {
    clinicName: string;
    doctorName: string;
    licenseNumber: string;
  };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [clinicName, setClinicName] = useState('DentalCare Pro Clinic');
  const [doctorName, setDoctorName] = useState('Dr. Smith');
  const [licenseNumber, setLicenseNumber] = useState('DL12345');

  const settings = {
    clinicName,
    doctorName,
    licenseNumber
  };

  return (
    <SettingsContext.Provider value={{
      clinicName,
      setClinicName,
      doctorName,
      setDoctorName,
      licenseNumber,
      setLicenseNumber,
      settings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
