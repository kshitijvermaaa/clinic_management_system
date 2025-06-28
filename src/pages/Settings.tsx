
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Building2, User, Save, Upload, Bell, Lock, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [clinicInfo, setClinicInfo] = useState({
    name: 'DentalCare Pro Clinic',
    address: '123 Main Street, Medical District',
    phone: '+91 9876543210',
    email: 'info@dentalcarepro.com',
    website: 'www.dentalcarepro.com'
  });

  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. John Smith',
    qualification: 'BDS, MDS (Oral Surgery)',
    regNumber: 'REG123456',
    experience: '15 years'
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your clinic settings have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-600">Manage your clinic and application settings</p>
        </div>

        {/* Clinic Information */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Clinic Information
            </CardTitle>
            <CardDescription>
              Update your clinic details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-name">Clinic Name</Label>
                <Input
                  id="clinic-name"
                  value={clinicInfo.name}
                  onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-phone">Phone Number</Label>
                <Input
                  id="clinic-phone"
                  value={clinicInfo.phone}
                  onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic-address">Address</Label>
              <Textarea
                id="clinic-address"
                value={clinicInfo.address}
                onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-email">Email</Label>
                <Input
                  id="clinic-email"
                  type="email"
                  value={clinicInfo.email}
                  onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-website">Website</Label>
                <Input
                  id="clinic-website"
                  value={clinicInfo.website}
                  onChange={(e) => setClinicInfo({ ...clinicInfo, website: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Information */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Doctor Information
            </CardTitle>
            <CardDescription>
              Update doctor credentials and professional details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor-name">Doctor Name</Label>
                <Input
                  id="doctor-name"
                  value={doctorInfo.name}
                  onChange={(e) => setDoctorInfo({ ...doctorInfo, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-reg">Registration Number</Label>
                <Input
                  id="doctor-reg"
                  value={doctorInfo.regNumber}
                  onChange={(e) => setDoctorInfo({ ...doctorInfo, regNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor-qualification">Qualification</Label>
                <Input
                  id="doctor-qualification"
                  value={doctorInfo.qualification}
                  onChange={(e) => setDoctorInfo({ ...doctorInfo, qualification: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-experience">Experience</Label>
                <Input
                  id="doctor-experience"
                  value={doctorInfo.experience}
                  onChange={(e) => setDoctorInfo({ ...doctorInfo, experience: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Letterhead Upload */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Letterhead
              </CardTitle>
              <CardDescription>
                Upload clinic letterhead for prescriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-600">Click to upload letterhead</p>
                <p className="text-xs text-slate-500">PDF, JPG, PNG up to 5MB</p>
              </div>
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload Letterhead
              </Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-blue-600" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Bell className="w-4 h-4 mr-2" />
                Notification Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Lock className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Database className="w-4 h-4 mr-2" />
                Backup & Restore
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
