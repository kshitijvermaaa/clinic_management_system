import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FlaskConical, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  PlayCircle,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EnhancedLabWorkForm } from '@/components/labwork/EnhancedLabWorkForm';
import { LabWorkCard } from '@/components/labwork/LabWorkCard';
import { LabWorkFilesDialog } from '@/components/labwork/LabWorkFilesDialog';
import { useLabWork, LabWork as LabWorkType } from '@/hooks/useLabWork';

const LabWork = () => {
  const navigate = useNavigate();
  const { labWork, isLoading } = useLabWork();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showLabWorkForm, setShowLabWorkForm] = useState(false);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [selectedLabWorkId, setSelectedLabWorkId] = useState('');
  const [selectedLabWorkTitle, setSelectedLabWorkTitle] = useState('');

  // Filter lab work based on search and status
  const filteredLabWork = labWork.filter(work => {
    const matchesSearch = 
      work.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      work.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      work.lab_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      work.lab_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      work.work_description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || work.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group lab work by status for tabs
  const pendingWork = filteredLabWork.filter(work => work.status === 'pending');
  const inProgressWork = filteredLabWork.filter(work => work.status === 'in_progress');
  const completedWork = filteredLabWork.filter(work => work.status === 'completed');
  const deliveredWork = filteredLabWork.filter(work => work.status === 'delivered');

  // Calculate overdue work
  const overdueWork = filteredLabWork.filter(work => 
    work.expected_date && 
    new Date(work.expected_date) < new Date() && 
    work.status !== 'completed' && 
    work.status !== 'delivered'
  );

  // Calculate completion rate
  const totalWork = labWork.length;
  const completedTotal = labWork.filter(work => work.status === 'completed' || work.status === 'delivered').length;
  const completionRate = totalWork > 0 ? ((completedTotal / totalWork) * 100).toFixed(1) : '0';

  const handleViewFiles = (labWorkId: string, labWorkTitle: string) => {
    setSelectedLabWorkId(labWorkId);
    setSelectedLabWorkTitle(labWorkTitle);
    setShowFilesDialog(true);
  };

  const handleEdit = (labWork: LabWorkType) => {
    // For now, we'll just show a toast. In a full implementation, 
    // you'd open an edit form with the lab work data pre-filled
    console.log('Edit lab work:', labWork);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading lab work...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Lab Work Management
            </h1>
            <p className="text-slate-600">Manage dental laboratory work orders and track progress with detailed cost analysis</p>
          </div>
          <Button 
            onClick={() => setShowLabWorkForm(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:scale-105 transition-all duration-200 shadow-lg"
            title="Create New Lab Work Order"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Lab Work
          </Button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Orders</p>
                  <p className="text-2xl font-bold text-slate-900">{labWork.length}</p>
                </div>
                <FlaskConical className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingWork.length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{inProgressWork.length}</p>
                </div>
                <PlayCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedWork.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdueWork.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{completionRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-600" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by patient, lab type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lab Work Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">
              All ({filteredLabWork.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingWork.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({inProgressWork.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedWork.length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered ({deliveredWork.length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue ({overdueWork.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <LabWorkGrid 
              labWork={filteredLabWork} 
              onViewFiles={handleViewFiles}
              onEdit={handleEdit}
            />
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <LabWorkGrid 
              labWork={pendingWork} 
              onViewFiles={handleViewFiles}
              onEdit={handleEdit}
            />
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-4">
            <LabWorkGrid 
              labWork={inProgressWork} 
              onViewFiles={handleViewFiles}
              onEdit={handleEdit}
            />
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <LabWorkGrid 
              labWork={completedWork} 
              onViewFiles={handleViewFiles}
              onEdit={handleEdit}
            />
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4">
            <LabWorkGrid 
              labWork={deliveredWork} 
              onViewFiles={handleViewFiles}
              onEdit={handleEdit}
            />
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <LabWorkGrid 
              labWork={overdueWork} 
              onViewFiles={handleViewFiles}
              onEdit={handleEdit}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Lab Work Form Dialog */}
      <EnhancedLabWorkForm 
        open={showLabWorkForm} 
        onOpenChange={setShowLabWorkForm} 
      />

      {/* Files Dialog */}
      <LabWorkFilesDialog
        open={showFilesDialog}
        onOpenChange={setShowFilesDialog}
        labWorkId={selectedLabWorkId}
        labWorkTitle={selectedLabWorkTitle}
      />
    </div>
  );
};

// Helper component for rendering lab work grid
const LabWorkGrid: React.FC<{
  labWork: LabWorkType[];
  onViewFiles: (labWorkId: string, labWorkTitle: string) => void;
  onEdit: (labWork: LabWorkType) => void;
}> = ({ labWork, onViewFiles, onEdit }) => {
  if (labWork.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="text-center text-slate-500">
            <FlaskConical className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No lab work orders found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {labWork.map((work) => (
        <LabWorkCard
          key={work.id}
          labWork={work}
          onEdit={onEdit}
          onViewFiles={(labWorkId) => onViewFiles(labWorkId, `${work.lab_type} - ${work.patients?.full_name}`)}
        />
      ))}
    </div>
  );
};

export default LabWork;