
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, Users, Calendar, Download, FileText } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';

const Reports = () => {
  const { patients, isLoading: patientsLoading } = usePatients();
  const { appointments, isLoading: appointmentsLoading } = useAppointments();

  // Calculate this month's appointments
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
  });

  // Calculate completed appointments for success rate
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const successRate = appointments.length > 0 ? ((completedAppointments.length / appointments.length) * 100).toFixed(1) : '0';

  const statsData = [
    {
      title: 'Total Patients',
      value: patientsLoading ? '...' : patients.length.toString(),
      change: 'Active patients',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Appointments This Month',
      value: appointmentsLoading ? '...' : thisMonthAppointments.length.toString(),
      change: 'This month',
      trend: 'up',
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'Total Appointments',
      value: appointmentsLoading ? '...' : appointments.length.toString(),
      change: 'All time',
      trend: 'up',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      change: 'Completion rate',
      trend: 'up',
      icon: Activity,
      color: 'orange'
    }
  ];

  // Generate activity data from actual patients
  const recentActivity = patients.slice(0, 3).map(patient => ({
    name: `Patient Registration - ${patient.full_name}`,
    date: new Date(patient.created_at).toLocaleDateString(),
    type: 'Registration',
    size: '1.2 KB'
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-slate-600">Track clinic performance and generate insights</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 transition-all duration-200 shadow-lg">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <Card key={index} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Monthly Appointments</CardTitle>
              <CardDescription>Appointment trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500">Chart visualization coming soon</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {thisMonthAppointments.length} appointments this month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Appointment Status</CardTitle>
              <CardDescription>Breakdown by appointment status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                <div className="text-center space-y-2">
                  <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500">Status breakdown:</p>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div>Scheduled: {appointments.filter(apt => apt.status === 'scheduled').length}</div>
                    <div>Completed: {completedAppointments.length}</div>
                    <div>Cancelled: {appointments.filter(apt => apt.status === 'cancelled').length}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities and records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{activity.name}</div>
                        <div className="text-sm text-slate-500">{activity.date} • {activity.type} • {activity.size}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
