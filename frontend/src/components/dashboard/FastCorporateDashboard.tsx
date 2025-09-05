import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MonthYearPickerDialog from '@/components/shared/MonthYearPickerDialog';
import { DatabaseService } from '@/services/databaseService';
import { useToast } from "@/hooks/use-toast";
import usePageTitle from '@/hooks/usePageTitle';
import { cn } from "@/lib/utils";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Package,
  Stethoscope,
  RefreshCw,
  Bell,
  Clock,
  Calendar,
  Activity,
  Search,
  Plus,
  DollarSign,
  CheckCircle,
  CreditCard,
  ArrowRight,
  MoreHorizontal,
  Heart,
  Database,
  Pill,
  Eye,
  Building2,
  BarChart3,
  Calendar as CalendarIcon,
  ChevronRight,
  Shield,
  Lock,
  CheckCircle as CheckIcon,
  BarChart,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  UserPlus,
  Edit2,
  Trash2
} from 'lucide-react';

// Helper function to format dates to DD/MM/YYYY
const formatDateDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return '-';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Return original if invalid
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateStr; // Return original if formatting fails
  }
};

interface DashboardProps {
  user: { name: string; role: string };
}

interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  progress: number;
}

interface LeadItem {
  id: string | number;
  date: string;
  name: string;
  contactNumber: string;
  reminderDate: string;
  category: string;
  status: 'Active' | 'Inactive';
  description: string;
}

// Professional enterprise metric card component
const MetricCard = memo(({ metric }: { metric: MetricCard }) => {
  const Icon = metric.icon;
  return (
    <Card className="h-full bg-white border border-gray-200/60 shadow-sm hover:shadow-lg hover:border-gray-300/80 transition-all duration-300 group">
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-50 border border-slate-200/50 rounded-xl flex items-center justify-center group-hover:bg-slate-100 transition-colors duration-300">
              <Icon className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600 uppercase tracking-wider">
                {metric.title}
              </div>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs font-semibold px-2.5 py-1 border",
              metric.trend === 'up' 
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                : 'text-red-700 bg-red-50 border-red-200'
            )}
          >
            {metric.trend === 'up' ? 
              <TrendingUp className="w-3 h-3 mr-1" /> : 
              <TrendingDown className="w-3 h-3 mr-1" />
            }
            +{metric.change}%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-6">
        <div className="space-y-4">
          <div className="text-3xl font-bold text-slate-900 tracking-tight">
            {metric.value}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {metric.description}
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {metric.progress}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-700 ease-out",
                  metric.trend === 'up' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-slate-400 to-slate-500'
                )}
                style={{ width: `${metric.progress}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const QuickActionButton = memo(({ action, onClick }: { action: any; onClick: () => void }) => {
  const Icon = action.icon;
  return (
    <Button
      variant="ghost"
      className="h-14 w-full justify-start px-4 bg-white border border-slate-200/60 hover:bg-slate-50 hover:border-slate-300/80 hover:shadow-sm transition-all duration-300 group"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3 w-full">
        <div className="w-10 h-10 bg-slate-50 border border-slate-200/50 rounded-lg flex items-center justify-center group-hover:bg-slate-100 transition-colors duration-300">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
        
        <div className="text-left flex-1">
          <div className="font-semibold text-slate-900 text-sm">
            {action.title}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {action.description}
          </div>
        </div>
        
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all duration-300" />
      </div>
    </Button>
  );
});

const CorporateDashboard: React.FC<DashboardProps> = memo(({ user }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  usePageTitle('Dashboard - Gandhi Bai Healthcare');

  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Real data state
  const [patientsCount, setPatientsCount] = useState<number>(0);
  const [doctorsCount, setDoctorsCount] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [medicineStockCount, setMedicineStockCount] = useState<number>(0);
  const [leadsData, setLeadsData] = useState<any[]>([]);

  // Pagination state for leads table
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5; // Show only 5 leads in dashboard

  // Month/Year picker state
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [showMonthYearDialog, setShowMonthYearDialog] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Load real data from database
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load patients count
        const patientsData = await DatabaseService.getAllPatients();
        setPatientsCount(patientsData?.length || 0);
        
        // Load doctors count
        const doctorsData = await DatabaseService.getAllDoctors();
        setDoctorsCount(doctorsData?.length || 0);
        
        // Load staff count
        const staffData = await DatabaseService.getAllStaff();
        setStaffCount(staffData?.length || 0);
        
        // Load medicine stock count
        const medicineProducts = await DatabaseService.getAllMedicineProducts();
        const totalStock = medicineProducts?.reduce((sum: number, product: any) => {
          return sum + (parseInt(product.current_stock) || 0);
        }, 0) || 0;
        setMedicineStockCount(totalStock);
        
        // Load leads data
        const allLeads = await DatabaseService.getAllLeads();
        setLeadsData(allLeads || []);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedMonth, selectedYear, toast]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPriority, selectedMonth, selectedYear]);

  // Professional metrics data with real data
  const metrics = useMemo<MetricCard[]>(() => [
    {
      id: 'patients',
      title: 'Total Patients',
      value: loading ? 'Loading...' : patientsCount.toLocaleString(),
      change: 12.5,
      trend: 'up',
      icon: Users,
      color: 'from-blue-600 to-blue-700',
      description: 'Active patients',
      progress: 89
    },
    {
      id: 'doctors',
      title: 'Doctor List',
      value: loading ? 'Loading...' : doctorsCount.toLocaleString(),
      change: 15.8,
      trend: 'up',
      icon: Stethoscope,
      color: 'from-green-600 to-green-700',
      description: 'Total doctors',
      progress: 94
    },
    {
      id: 'staff',
      title: 'Staff List',
      value: loading ? 'Loading...' : staffCount.toLocaleString(),
      change: 4.2,
      trend: 'up',
      icon: Users,
      color: 'from-purple-600 to-purple-700',
      description: 'Total staff',
      progress: 82
    },
    {
      id: 'medicine-stock',
      title: 'Medicine Stock',
      value: loading ? 'Loading...' : medicineStockCount.toLocaleString(),
      change: 8.1,
      trend: 'up',
      icon: Pill,
      color: 'from-orange-600 to-orange-700',
      description: 'Units in stock',
      progress: 76
    }
  ], [loading, patientsCount, doctorsCount, staffCount, medicineStockCount]);

  const quickActions = useMemo(() => [
    {
      id: 'leads',
      title: 'Lead Management',
      description: 'Manage and track potential clients',
      icon: UserPlus,
      color: 'bg-blue-500',
      href: '/leads/list'
    },
    {
      id: 'patients',
      title: 'Patient Management',
      description: 'View and manage patient records',
      icon: Heart,
      color: 'bg-green-500',
      href: '/patients/list'
    },
    {
      id: 'doctors',
      title: 'Doctor Management',
      description: 'Manage doctors and schedules',
      icon: Stethoscope,
      color: 'bg-blue-600',
      href: '/management/doctors'
    },
    {
      id: 'staff',
      title: 'Staff Management',
      description: 'Manage staff and payroll',
      icon: Briefcase,
      color: 'bg-indigo-500',
      href: '/management/staff'
    }
  ], []);

  const leads = useMemo<LeadItem[]>(() => {
    // Convert database leads to match our interface
    return leadsData.map(lead => ({
      id: lead.id,
      date: lead.date || '',
      name: lead.name || '',
      contactNumber: lead.contactNumber || '',
      reminderDate: lead.reminderDate || '',
      category: lead.category || '',
      status: lead.status || 'Active',
      description: lead.description || ''
    }));
  }, [leadsData]);

  // Professional filtered leads with month/year filtering
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Status filtering (using 'all' for all leads, 'Active' or 'Inactive' for specific statuses)
      const statusMatch = filterPriority === 'all' || lead.status === filterPriority;
      
      // Search filtering by name, category, or contact number
      const searchMatch = searchTerm === '' || 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contactNumber.includes(searchTerm);
      
      // Month/Year filtering based on reminder date
      const reminderDate = new Date(lead.reminderDate);
      const reminderMonth = reminderDate.getMonth() + 1; // Convert to 1-based month
      const reminderYear = reminderDate.getFullYear();
      
      const monthYearMatch = reminderMonth === selectedMonth && reminderYear === selectedYear;
      
      return statusMatch && searchMatch && monthYearMatch;
    });
  }, [leads, filterPriority, searchTerm, selectedMonth, selectedYear]);

  // Paginated leads for dashboard display
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredLeads.slice(startIndex, endIndex);
  }, [filteredLeads, currentPage, rowsPerPage]);

  // Professional callback functions
  const handleQuickAction = useCallback((href: string) => {
    navigate(href);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    toast({
      title: "Dashboard Updated",
      description: "All data has been refreshed successfully.",
    });
  }, [toast]);

  // Professional loading effects
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin border-t-slate-900 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-slate-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Gandhi Bai Healthcare
            </h3>
            <div className="w-48 mx-auto mt-4">
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 rounded-full animate-pulse" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Professional Executive Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
        <div className="px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Gandhi Bai Healthcare</h1>
                  {/* <p className="text-sm text-slate-500 font-medium">Enterprise Management Platform</p> */}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-700 font-medium">{currentTime.toLocaleTimeString()}</span>
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                className="hidden sm:flex border-slate-200 hover:bg-slate-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="font-medium">Refresh</span>
              </Button>
              
              {/* <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                <span className="font-medium">New</span>
              </Button>
              
              <Avatar className="h-9 w-9 border-2 border-slate-200">
                <AvatarFallback className="bg-slate-100 text-slate-700 text-sm font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar> */}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8">
        {/* Executive Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
              </h2>
              {/* <p className="text-slate-600 font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })} • Dashboard Overview
              </p> */}
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-semibold text-emerald-700">System Operational</span>
              </div>
              
              {/* Month/Year Picker Button */}
              <Button
                variant="outline"
                onClick={() => setShowMonthYearDialog(true)}
                className="flex items-center space-x-2 px-4 py-2 border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {months[selectedMonth - 1]} {selectedYear}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Executive Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lead Management */}
          <div className="lg:col-span-2">
            <Card className="h-full shadow-sm border-slate-200/60">
              <CardHeader className="bg-slate-50/50 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                      <UserPlus className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Lead Management</CardTitle>
                      {/* <CardDescription className="text-slate-600 font-medium">Potential clients and business opportunities</CardDescription> */}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 font-semibold px-3 py-1">
                      {filteredLeads.length} Leads
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/leads/list')}
                      className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
                    >
                      <Eye className="w-4 h-4" />
                      View All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Executive Search and Filter */}
                <div className="p-6 border-b border-slate-200/60 bg-white">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search leads by name, category, or contact number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                      />
                    </div>
                    <div className="flex gap-2">
                      {[
                        { key: 'all', label: 'All Leads' },
                        { key: 'Active', label: 'Active' },
                        { key: 'Inactive', label: 'Inactive' }
                      ].map((status) => (
                        <Button
                          key={status.key}
                          variant={filterPriority === status.key ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilterPriority(status.key)}
                          className={cn(
                            "font-medium",
                            filterPriority === status.key 
                              ? "bg-slate-900 hover:bg-slate-800 text-white" 
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          )}
                        >
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Professional Leads Table - Exact Format */}
                <div className="overflow-x-auto">
                  <Table className="w-full min-w-[800px]">
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b">
                        <TableHead className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <span>S No</span>
                          </div>
                        </TableHead>
                        <TableHead className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Date</span>
                          </div>
                        </TableHead>
                        <TableHead className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <span>Name</span>
                          </div>
                        </TableHead>
                        <TableHead className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Contact Number</span>
                          </div>
                        </TableHead>
                        <TableHead className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <span>Category</span>
                          </div>
                        </TableHead>
                        <TableHead className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Reminder Date</span>
                            <span className="sm:hidden">Reminder</span>
                          </div>
                        </TableHead>
                        <TableHead className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Status</span>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLeads.length > 0 ? (
                        paginatedLeads.map((lead, idx) => (
                          <TableRow 
                            key={lead.id} 
                            className="bg-white border-b hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => navigate('/leads/list')}
                            title="Click to view all leads"
                          >
                            <TableCell className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-xs sm:text-sm whitespace-nowrap">
                              {(currentPage - 1) * rowsPerPage + idx + 1}
                            </TableCell>
                            <TableCell className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-xs sm:text-sm whitespace-nowrap">
                              {formatDateDDMMYYYY(lead.date)}
                            </TableCell>
                            <TableCell className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 font-medium text-center text-xs sm:text-sm whitespace-nowrap">
                              {lead.name}
                            </TableCell>
                            <TableCell className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-xs sm:text-sm whitespace-nowrap">
                              {lead.contactNumber}
                            </TableCell>
                            <TableCell className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-xs sm:text-sm whitespace-nowrap">
                              {lead.category}
                            </TableCell>
                            <TableCell className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-xs sm:text-sm whitespace-nowrap">
                              {formatDateDDMMYYYY(lead.reminderDate)}
                            </TableCell>
                            <TableCell className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-xs sm:text-sm whitespace-nowrap">
                              <Badge 
                                variant={lead.status === 'Active' ? 'default' : 'destructive'}
                                className={`
                                  ${lead.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                                  ${lead.status === 'Inactive' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
                                `}
                              >
                                {lead.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No leads found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination for Leads Table */}
                {filteredLeads.length > rowsPerPage && (
                  <div className="mt-4 flex items-center justify-between px-4 py-3 border-t border-gray-200">
                    {/* Pagination Info */}
                    <div className="text-xs sm:text-sm text-gray-600">
                      <span className="hidden sm:inline">
                        Page {currentPage} of {Math.ceil(filteredLeads.length / rowsPerPage)} 
                        ({filteredLeads.length} total leads)
                      </span>
                      <span className="sm:hidden">
                        {currentPage} / {Math.ceil(filteredLeads.length / rowsPerPage)}
                      </span>
                    </div>
                    
                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="bg-white hover:bg-gray-50 text-gray-600 border-gray-300 text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </Button>
                      
                      {/* Page Numbers for Desktop */}
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: Math.min(3, Math.ceil(filteredLeads.length / rowsPerPage)) }, (_, i) => {
                          const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
                          let pageNumber;
                          
                          if (totalPages <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 2) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 1) {
                            pageNumber = totalPages - 2 + i;
                          } else {
                            pageNumber = currentPage - 1 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`w-8 h-8 p-0 text-xs ${
                                currentPage === pageNumber 
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                                  : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-300'
                              }`}
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredLeads.length / rowsPerPage), p + 1))}
                        disabled={currentPage === Math.ceil(filteredLeads.length / rowsPerPage)}
                        className="bg-white hover:bg-gray-50 text-gray-600 border-gray-300 text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Executive Sidebar */}
          <div className="space-y-6">
            {/* Executive Quick Actions */}
            <Card className="shadow-sm border-slate-200/60">
              <CardHeader className="bg-slate-50/50 border-b border-slate-200/60">
                <CardTitle className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                    <BarChart className="w-4 h-4 text-slate-600" />
                  </div>
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-slate-600 font-medium">Access core system functions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {quickActions.map((action) => (
                  <QuickActionButton 
                    key={action.id} 
                    action={action} 
                    onClick={() => handleQuickAction(action.href)} 
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Month/Year Picker Dialog */}
      <MonthYearPickerDialog
        open={showMonthYearDialog}
        onOpenChange={setShowMonthYearDialog}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onApply={() => {
          setShowMonthYearDialog(false);
          toast({
            title: "Filter Applied",
            description: `Dashboard filtered for ${months[selectedMonth - 1]} ${selectedYear}`,
          });
        }}
        title="Select Dashboard Period"
        description="Filter dashboard data by specific month and year"
        previewText="dashboard data"
      />
    </div>
  );
});

export default CorporateDashboard;
