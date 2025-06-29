import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Upload, Save, X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const RegisterPatient = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState([{ id: 1, number: '', type: 'primary' }]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    age: '',
    address: '',
    email: '',
    bloodGroup: '',
    allergies: [] as string[],
    customAllergy: '',
    referredBy: '',
    emergencyContact: '',
    chronicConditions: [] as string[],
    customChronicCondition: '',
    insuranceDetails: '',
  });

  // Predefined options
  const commonAllergies = [
    'Penicillin',
    'Latex',
    'Lidocaine',
    'Aspirin',
    'Ibuprofen',
    'Sulfa drugs',
    'Codeine',
    'Morphine',
    'Nickel',
    'Adhesive tape',
    'Food allergies',
    'Seasonal allergies',
    'No known allergies'
  ];

  const commonChronicConditions = [
    'Diabetes',
    'Hypertension',
    'Heart disease',
    'Asthma',
    'Arthritis',
    'Thyroid disorders',
    'Kidney disease',
    'Liver disease',
    'Cancer',
    'Depression',
    'Anxiety',
    'Osteoporosis',
    'COPD',
    'Epilepsy',
    'No chronic conditions'
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneNumberChange = (id: number, field: string, value: string) => {
    setPhoneNumbers(prev => prev.map(phone => 
      phone.id === id ? { ...phone, [field]: value } : phone
    ));
  };

  const addPhoneNumber = () => {
    const newId = Math.max(...phoneNumbers.map(p => p.id)) + 1;
    setPhoneNumbers(prev => [...prev, { id: newId, number: '', type: 'secondary' }]);
  };

  const removePhoneNumber = (id: number) => {
    if (phoneNumbers.length > 1) {
      setPhoneNumbers(prev => prev.filter(phone => phone.id !== id));
    }
  };

  const handleAllergySelect = (allergy: string) => {
    if (!formData.allergies.includes(allergy)) {
      handleInputChange('allergies', [...formData.allergies, allergy]);
    }
  };

  const removeAllergy = (allergy: string) => {
    handleInputChange('allergies', formData.allergies.filter(a => a !== allergy));
  };

  const addCustomAllergy = () => {
    if (formData.customAllergy.trim() && !formData.allergies.includes(formData.customAllergy.trim())) {
      handleInputChange('allergies', [...formData.allergies, formData.customAllergy.trim()]);
      handleInputChange('customAllergy', '');
    }
  };

  const handleChronicConditionSelect = (condition: string) => {
    if (!formData.chronicConditions.includes(condition)) {
      handleInputChange('chronicConditions', [...formData.chronicConditions, condition]);
    }
  };

  const removeChronicCondition = (condition: string) => {
    handleInputChange('chronicConditions', formData.chronicConditions.filter(c => c !== condition));
  };

  const addCustomChronicCondition = () => {
    if (formData.customChronicCondition.trim() && !formData.chronicConditions.includes(formData.customChronicCondition.trim())) {
      handleInputChange('chronicConditions', [...formData.chronicConditions, formData.customChronicCondition.trim()]);
      handleInputChange('customChronicCondition', '');
    }
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
    
    const primaryPhone = phoneNumbers.find(p => p.type === 'primary')?.number || phoneNumbers[0]?.number;
    
    if (!formData.fullName || !formData.gender || !formData.age || !formData.address || !primaryPhone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including at least one phone number.",
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
      
      // Prepare phone numbers data
      const phoneNumbersData = phoneNumbers
        .filter(p => p.number.trim())
        .map(p => `${p.type}: ${p.number}`)
        .join(', ');
      
      const { data, error } = await supabase
        .from('patients')
        .insert({
          full_name: formData.fullName,
          gender: formData.gender,
          date_of_birth: dateOfBirth,
          address: formData.address,
          mobile_number: phoneNumbersData,
          email: formData.email || null,
          blood_group: formData.bloodGroup || null,
          allergies: formData.allergies.length > 0 ? formData.allergies.join(', ') : null,
          referred_by: formData.referredBy || null,
          emergency_contact: formData.emergencyContact || null,
          chronic_conditions: formData.chronicConditions.length > 0 ? formData.chronicConditions.join(', ') : null,
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
        email: '',
        bloodGroup: '',
        allergies: [],
        customAllergy: '',
        referredBy: '',
        emergencyContact: '',
        chronicConditions: [],
        customChronicCondition: '',
        insuranceDetails: '',
      });
      setPhoneNumbers([{ id: 1, number: '', type: 'primary' }]);
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
                    Phone numbers, email and emergency contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Multiple Phone Numbers */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Phone Numbers *</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addPhoneNumber}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Phone
                      </Button>
                    </div>
                    {phoneNumbers.map((phone, index) => (
                      <div key={phone.id} className="flex gap-3 items-end">
                        <div className="flex-1">
                          <Input
                            placeholder="+91 98765 43210"
                            value={phone.number}
                            onChange={(e) => handlePhoneNumberChange(phone.id, 'number', e.target.value)}
                            required={index === 0}
                          />
                        </div>
                        <div className="w-32">
                          <Select 
                            value={phone.type} 
                            onValueChange={(value) => handlePhoneNumberChange(phone.id, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">Primary</SelectItem>
                              <SelectItem value="secondary">Secondary</SelectItem>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {phoneNumbers.length > 1 && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removePhoneNumber(phone.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      placeholder="Name and phone number"
                    />
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
                  {/* Allergies */}
                  <div className="space-y-4">
                    <Label>Allergies</Label>
                    <Select onValueChange={handleAllergySelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select common allergies" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonAllergies.map((allergy) => (
                          <SelectItem key={allergy} value={allergy}>
                            {allergy}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom allergy"
                        value={formData.customAllergy}
                        onChange={(e) => handleInputChange('customAllergy', e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAllergy())}
                      />
                      <Button type="button" variant="outline" onClick={addCustomAllergy}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {formData.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.allergies.map((allergy) => (
                          <div key={allergy} className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-md text-sm">
                            {allergy}
                            <button
                              type="button"
                              onClick={() => removeAllergy(allergy)}
                              className="ml-1 hover:text-red-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chronic Conditions */}
                  <div className="space-y-4">
                    <Label>Chronic Conditions</Label>
                    <Select onValueChange={handleChronicConditionSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select common chronic conditions" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonChronicConditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom chronic condition"
                        value={formData.customChronicCondition}
                        onChange={(e) => handleInputChange('customChronicCondition', e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomChronicCondition())}
                      />
                      <Button type="button" variant="outline" onClick={addCustomChronicCondition}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {formData.chronicConditions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.chronicConditions.map((condition) => (
                          <div key={condition} className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-sm">
                            {condition}
                            <button
                              type="button"
                              onClick={() => removeChronicCondition(condition)}
                              className="ml-1 hover:text-orange-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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