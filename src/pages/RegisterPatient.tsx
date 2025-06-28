import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Upload, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const RegisterPatient = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    age: '',
    address: '',
    mobileNumber: '',
    email: '',
    bloodGroup: '',
    allergies: '',
    referredBy: '',
    emergencyContact: '',
    chronicConditions: '',
    insuranceDetails: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).filter(file => 
        file.size <= 10 * 1024 * 1024 && // 10MB limit
        ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
      );
      
      if (newFiles.length !== files.length) {
        toast({
          title: "File Upload Warning",
          description: "Some files were skipped. Only PDF, JPG, PNG files under 10MB are allowed.",
          variant: "destructive",
        });
      }
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate date of birth from age
  const calculateDateOfBirth = (age: string) => {
    if (!age || isNaN(parseInt(age))) return '';
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - parseInt(age);
    return `${birthYear}-01-01`; // Default to January 1st
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.gender || !formData.age || !formData.address || !formData.mobileNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate age
    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      toast({
        title: "Error",
        description: "Please enter a valid age between 0 and 150.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const dateOfBirth = calculateDateOfBirth(formData.age);
      
      const { data, error } = await supabase
        .from('patients')
        .insert({
          full_name: formData.fullName,
          gender: formData.gender,
          date_of_birth: dateOfBirth,
          address: formData.address,
          mobile_number: formData.mobileNumber,
          email: formData.email || null,
          blood_group: formData.bloodGroup || null,
          allergies: formData.allergies || null,
          referred_by: formData.referredBy || null,
          emergency_contact: formData.emergencyContact || null,
          chronic_conditions: formData.chronicConditions || null,
          insurance_details: formData.insuranceDetails || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        toast({
          title: "Error",
          description: "Failed to register patient. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Patient ${formData.fullName} registered successfully! Patient ID: ${data.patient_id}`,
      });

      // Reset form
      setFormData({
        fullName: '',
        gender: '',
        age: '',
        address: '',
        mobileNumber: '',
        email: '',
        bloodGroup: '',
        allergies: '',
        referredBy: '',
        emergencyContact: '',
        chronicConditions: '',
        insuranceDetails: '',
      });
      setUploadedFiles([]);

      // Navigate using the correct patient_id instead of UUID
      setTimeout(() => {
        navigate(`/search?patient=${data.patient_id}`);
      }, 1000);

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <UserPlus className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">
                Register New Patient
              </h1>
            </div>
            <p className="text-slate-600">
              Enter patient information to create a new medical record
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Personal Information */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Basic patient details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        min="0"
                        max="150"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        placeholder="Enter age in years"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Select onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter complete address"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Phone, email and emergency contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">Mobile Number *</Label>
                      <Input
                        id="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="patient@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        placeholder="Name and phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referredBy">Referred By</Label>
                      <Input
                        id="referredBy"
                        value={formData.referredBy}
                        onChange={(e) => handleInputChange('referredBy', e.target.value)}
                        placeholder="Doctor or referral source"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                  <CardDescription>
                    Health conditions, allergies and insurance details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      placeholder="List any known allergies"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                    <Textarea
                      id="chronicConditions"
                      value={formData.chronicConditions}
                      onChange={(e) => handleInputChange('chronicConditions', e.target.value)}
                      placeholder="Diabetes, hypertension, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceDetails">Insurance Details</Label>
                    <Textarea
                      id="insuranceDetails"
                      value={formData.insuranceDetails}
                      onChange={(e) => handleInputChange('insuranceDetails', e.target.value)}
                      placeholder="Insurance provider and policy details"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Document Upload */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Document Upload</CardTitle>
                  <CardDescription>
                    Upload consent forms and relevant documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">
                        Drop files here or click to browse
                      </p>
                      <p className="text-sm text-slate-500">
                        Supported formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
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
                          <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                            <span className="text-sm">{file.name}</span>
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

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => navigate('/search')}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Registering...' : 'Register Patient'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPatient;