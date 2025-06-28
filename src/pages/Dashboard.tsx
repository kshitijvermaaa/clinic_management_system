
import React from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TodaysAppointments } from '@/components/dashboard/TodaysAppointments';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Calendar, Users, Activity, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';

const Dashboard = () => {
  const { patients, isLoading: patientsLoading } = usePatients();
  const { appointments, isLoading: appointmentsLoading } = useAppointments();

  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(apt => apt.appointment_date === today);
  const completedToday = todaysAppointments.filter(apt => apt.status === 'completed').length;
  const pendingToday = todaysAppointments.filter(apt => apt.status === 'scheduled').length;

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date();
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const thisWeekAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate >= startOfWeek && aptDate <= endOfWeek;
  });

  const statsData = [
    {
      title: 'Total Patients',
      value: patientsLoading ? '...' : patients.length.toString(),
      icon: Users,
      trend: 'Active patient database',
      trendUp: true,
    },
    {
      title: "Today's Appointments",
      value: appointmentsLoading ? '...' : todaysAppointments.length.toString(),
      icon: Calendar,
      trend: `${completedToday} completed, ${pendingToday} pending`,
      trendUp: true,
    },
    {
      title: 'This Week',
      value: appointmentsLoading ? '...' : thisWeekAppointments.length.toString(),
      icon: Activity,
      trend: 'Total appointments this week',
      trendUp: true,
    },
    {
      title: 'System Status',
      value: 'Online',
      icon: TrendingUp,
      trend: 'All systems operational',
      trendUp: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Welcome back! Here's what's happening at your clinic today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <div 
              key={stat.title} 
              className="animate-fade-in" 
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <StatsCard {...stat} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <TodaysAppointments />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
            <QuickActions />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '600ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest actions in your clinic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patients.slice(0, 3).map((patient, index) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div>
                      <div className="font-medium text-slate-900">New patient registered</div>
                      <div className="text-sm text-slate-600">{patient.full_name} ({patient.patient_id})</div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {patients.length === 0 && (
                  <div className="text-center py-4 text-slate-500">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '700ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Next scheduled appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments
                  .filter(apt => new Date(apt.appointment_date) >= new Date() && apt.status === 'scheduled')
                  .slice(0, 3)
                  .map((appointment, index) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-medium text-slate-900">{appointment.patients?.full_name || 'Unknown'}</div>
                        <div className="text-sm text-slate-600">
                          {appointment.appointment_date} at {appointment.appointment_time}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {appointment.appointment_type}
                      </div>
                    </div>
                  ))}
                {appointments.filter(apt => new Date(apt.appointment_date) >= new Date() && apt.status === 'scheduled').length === 0 && (
                  <div className="text-center py-4 text-slate-500">
                    <p>No upcoming appointments</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
