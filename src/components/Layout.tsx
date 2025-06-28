import React from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Home, UserPlus, Search, Calendar, FileText, Settings, Activity, LogOut, FlaskConical } from 'lucide-react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Register Patient",
    url: "/register",
    icon: UserPlus,
  },
  {
    title: "Patient Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Appointments",
    url: "/appointments",
    icon: Calendar,
  },
  {
    title: "Lab Work",
    url: "/lab-work",
    icon: FlaskConical,
  },
  {
    title: "Prescriptions",
    url: "/prescriptions",
    icon: FileText,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: Activity,
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Sidebar className="border-r border-slate-200/60 bg-white/95 backdrop-blur-sm">
      <SidebarContent>
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1">
            DentalCare Pro
          </h2>
          <p className="text-sm text-slate-600">Clinic Management</p>
          {user && (
            <div className="mt-2 text-xs text-slate-500">
              Welcome, {user.user_metadata?.full_name || user.email}
            </div>
          )}
        </div>
        
        <SidebarGroup className="p-4">
          <SidebarGroupLabel className="text-slate-500 font-medium mb-2">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.url} 
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
                            : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-blue-600' : 'text-slate-500'
                        }`} />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-4 border-t border-slate-100 mt-auto">
          <SidebarGroupLabel className="text-slate-500 font-medium mb-2">Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/settings" 
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      location.pathname === '/settings' 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
                        : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Settings className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      location.pathname === '/settings' ? 'text-blue-600' : 'text-slate-500'
                    }`} />
                    <span className="font-medium">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                >
                  <LogOut className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">Logout</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 bg-white/95 backdrop-blur-sm shadow-sm">
            <SidebarTrigger className="hover:bg-slate-100 hover:scale-105 transition-all duration-200" />
          </div>
          <div className="overflow-auto h-[calc(100vh-73px)]">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};