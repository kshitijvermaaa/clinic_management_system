import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FlaskConical, 
  Calendar, 
  DollarSign, 
  FileText, 
  Download, 
  Edit, 
  Trash2,
  User,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  MoreVertical
} from 'lucide-react';
import { LabWork, useLabWork } from '@/hooks/useLabWork';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface LabWorkCardProps {
  labWork: LabWork;
  onEdit?: (labWork: LabWork) => void;
  onViewFiles?: (labWorkId: string) => void;
}

export const LabWorkCard: React.FC<LabWorkCardProps> = ({ labWork, onEdit, onViewFiles }) => {
  const { deleteLabWork, updateLabWork } = useLabWork();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    
    try {
      const updateData: any = { status: newStatus };
      
      // If marking as completed and no actual_date is set, set it to today
      if (newStatus === 'completed' && !labWork.actual_date) {
        updateData.actual_date = new Date().toISOString().split('T')[0];
      }
      
      await updateLabWork(labWork.id, updateData);
      
      toast({
        title: "Status Updated",
        description: `Lab work status changed to ${formatStatus(newStatus)}`,
      });
    } catch (error) {
      console.error('Error updating lab work status:', error);
      toast({
        title: "Error",
        description: "Failed to update lab work status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lab work order? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteLabWork(labWork.id);
      toast({
        title: "Success",
        description: "Lab work order deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting lab work:', error);
      toast({
        title: "Error",
        description: "Failed to delete lab work order.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isOverdue = labWork.expected_date && 
    new Date(labWork.expected_date) < new Date() && 
    labWork.status !== 'completed' && 
    labWork.status !== 'delivered';

  // Calculate balance for simplified cost tracking
  const totalCost = labWork.cost || 0;
  const totalPaid = 0; // This would come from payment records in a real implementation
  const balanceRemaining = totalCost - totalPaid;

  return (
    <Card className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 relative ${isOverdue ? 'ring-2 ring-red-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">{labWork.lab_type}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {/* Dynamic Status Selector */}
                <div className="flex items-center gap-2">
                  <Select
                    value={labWork.status}
                    onValueChange={handleStatusUpdate}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="w-4 h-4 text-blue-600" />
                          In Progress
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="delivered">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          Delivered
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {isUpdatingStatus && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  )}
                </div>
                
                <Badge className={`${getStatusColor(labWork.status)} border font-medium text-xs flex items-center gap-1`}>
                  {getStatusIcon(labWork.status)}
                  {formatStatus(labWork.status)}
                </Badge>
                
                {isOverdue && (
                  <Badge className="bg-red-100 text-red-800 border-red-200 border font-medium text-xs">
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Fixed Actions Menu */}
          <div className="flex items-center gap-2">
            <Popover open={showActions} onOpenChange={setShowActions}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="More Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="space-y-1">
                  {onViewFiles && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onViewFiles(labWork.id);
                        setShowActions(false);
                      }}
                      className="w-full justify-start"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Files
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onEdit(labWork);
                        setShowActions(false);
                      }}
                      className="w-full justify-start"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleDelete();
                      setShowActions(false);
                    }}
                    disabled={isDeleting}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Patient Info */}
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-slate-500" />
          <span className="font-medium">{labWork.patients?.full_name}</span>
          <span className="text-slate-500">({labWork.patient_id})</span>
        </div>

        {/* Lab Info */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span className="font-medium">{labWork.lab_name}</span>
        </div>

        {/* Work Description */}
        <div className="text-sm">
          <div className="font-medium text-slate-700 mb-1">Work Description:</div>
          <div className="text-slate-600 bg-slate-50 p-2 rounded text-xs">
            {labWork.work_description}
          </div>
        </div>

        {/* Treatment Reference */}
        {labWork.treatments && (
          <div className="text-sm">
            <div className="font-medium text-slate-700 mb-1">Related Treatment:</div>
            <div className="text-slate-600 text-xs">
              {labWork.treatments.procedure_done}
            </div>
          </div>
        )}

        <Separator />

        {/* Dates and Cost */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs font-medium">Date Sent</span>
            </div>
            <div className="text-slate-900 font-medium">
              {format(new Date(labWork.date_sent), 'MMM dd, yyyy')}
            </div>
          </div>
          
          {labWork.expected_date && (
            <div>
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-medium">Expected</span>
              </div>
              <div className={`font-medium ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                {format(new Date(labWork.expected_date), 'MMM dd, yyyy')}
              </div>
            </div>
          )}
        </div>

        {labWork.actual_date && (
          <div className="text-sm">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <CheckCircle className="w-3 h-3" />
              <span className="text-xs font-medium">Completed</span>
            </div>
            <div className="text-slate-900 font-medium">
              {format(new Date(labWork.actual_date), 'MMM dd, yyyy')}
            </div>
          </div>
        )}

        {/* Simplified Cost Tracking */}
        {labWork.cost && (
          <div className="space-y-2">
            <div className="text-sm">
              <div className="flex items-center gap-2 text-slate-600 mb-1">
                <DollarSign className="w-3 h-3" />
                <span className="text-xs font-medium">Cost Summary</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-blue-600 font-medium">Total Cost</div>
                  <div className="text-blue-900 font-bold">${totalCost.toFixed(2)}</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-green-600 font-medium">Total Paid</div>
                  <div className="text-green-900 font-bold">${totalPaid.toFixed(2)}</div>
                </div>
                <div className={`p-2 rounded ${balanceRemaining > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
                  <div className={`font-medium ${balanceRemaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    Balance
                  </div>
                  <div className={`font-bold ${balanceRemaining > 0 ? 'text-orange-900' : 'text-green-900'}`}>
                    ${Math.abs(balanceRemaining).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {labWork.instructions && (
          <div className="text-sm">
            <div className="font-medium text-slate-700 mb-1">Instructions:</div>
            <div className="text-slate-600 bg-blue-50 p-2 rounded text-xs">
              {labWork.instructions}
            </div>
          </div>
        )}

        {/* Notes */}
        {labWork.notes && (
          <div className="text-sm">
            <div className="font-medium text-slate-700 mb-1">Notes:</div>
            <div className="text-slate-600 bg-slate-50 p-2 rounded text-xs">
              {labWork.notes}
            </div>
          </div>
        )}

        {/* Status-specific visual indicators */}
        {labWork.status === 'completed' && (
          <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Lab work completed successfully
            </div>
          </div>
        )}

        {labWork.status === 'in_progress' && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
              <PlayCircle className="w-4 h-4" />
              Lab work is currently in progress
            </div>
          </div>
        )}

        {isOverdue && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              This lab work is overdue
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};