import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Printer } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import jsPDF from 'jspdf';

interface PrescriptionViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: any;
}

export const PrescriptionViewer: React.FC<PrescriptionViewerProps> = ({ open, onOpenChange, prescription }) => {
  const { clinicName, doctorName, licenseNumber } = useSettings();

  if (!prescription) return null;

  const handleDownloadPDF = () => {
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription ${prescription.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
              .clinic-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
              .clinic-details { font-size: 12px; color: #666; }
              .prescription-title { font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0; }
              .prescription-id { font-size: 14px; color: #666; }
              .section { margin: 20px 0; }
              .label { font-weight: bold; }
              .patient-info { border: 1px solid #ccc; padding: 15px; margin: 20px 0; }
              .medicines { list-style: decimal; padding-left: 20px; }
              .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
              .signature-area { margin-top: 30px; }
              .signature-line { border-bottom: 1px solid #000; width: 200px; margin-bottom: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="clinic-name">${clinicName}</div>
              <div class="clinic-details">Dental Care & Treatment Center</div>
              <div class="clinic-details">123 Medical Street, Health City | Phone: +91 9876543210</div>
            </div>
            
            <div class="prescription-title">PRESCRIPTION</div>
            
            <div style="display: flex; justify-content: space-between;">
              <div class="prescription-id">Prescription ID: ${prescription.id}</div>
              <div>Date: ${prescription.date}</div>
            </div>
            
            <div class="patient-info">
              <div class="label">PATIENT INFORMATION</div>
              <div>Name: ${prescription.patientName}</div>
              <div>Patient ID: ${prescription.patientId}</div>
            </div>
            
            <div class="section">
              <div class="label">DIAGNOSIS:</div>
              <div>${prescription.diagnosis}</div>
            </div>
            
            <div class="section">
              <div class="label">PRESCRIBED MEDICATIONS:</div>
              <ol class="medicines">
                ${prescription.medicines.map((med: string) => `<li>${med}</li>`).join('')}
              </ol>
            </div>
            
            <div class="signature-area">
              <div class="signature-line"></div>
              <div>${doctorName}</div>
              <div>License: ${licenseNumber}</div>
              <div>Doctor Signature</div>
            </div>
            
            <div class="footer">
              <div style="text-align: center; font-size: 12px; color: #666;">
                This is a computer-generated prescription.<br>
                Generated on ${new Date().toLocaleString()}
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Prescription Details
          </DialogTitle>
        </div>
        
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 border-b pb-4">
            <h2 className="text-xl font-bold">{clinicName}</h2>
            <p className="text-sm text-slate-600">Dental Care & Treatment Center</p>
            <p className="text-xs text-slate-500">123 Medical Street, Health City | Phone: +91 9876543210</p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-bold">PRESCRIPTION</h3>
            <div className="flex justify-between text-sm text-slate-600 mt-2">
              <span>Prescription ID: {prescription.id}</span>
              <span>Date: {prescription.date}</span>
            </div>
          </div>

          <Separator />

          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-slate-900">Patient Information</h4>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Name:</span> {prescription.patientName}</div>
                <div><span className="font-medium">Patient ID:</span> {prescription.patientId}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-slate-900">Status</h4>
              <Badge className={`${prescription.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-700 border-slate-200'} border font-medium text-xs`}>
                {prescription.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Diagnosis */}
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Diagnosis</h4>
            <p className="text-sm text-slate-600">{prescription.diagnosis}</p>
          </div>

          <Separator />

          {/* Medications */}
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Prescribed Medications</h4>
            <ol className="list-decimal list-inside space-y-1">
              {prescription.medicines.map((medicine: string, index: number) => (
                <li key={index} className="text-sm text-slate-600">{medicine}</li>
              ))}
            </ol>
          </div>

          <Separator />

          {/* Footer */}
          <div className="text-sm text-slate-600 space-y-1">
            <div><span className="font-medium">Doctor:</span> {doctorName}</div>
            <div><span className="font-medium">License:</span> {licenseNumber}</div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handlePrint} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};