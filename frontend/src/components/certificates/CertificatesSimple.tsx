import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { getCertificatePhotoUrl } from '@/utils/photoUtils';
import { 
  FileText, 
  Search, 
  Download, 
  Edit2, 
  Loader2, 
  Trash2, 
  Eye, 
  Upload, 
  Users, 
  Activity, 
  Calendar,
  Plus, 
  X, 
  Award,
  User,
  CalendarDays,
  Image,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import usePageTitle from '@/hooks/usePageTitle';
import '../../styles/modern-forms.css';
import '../../styles/modern-tables.css';
import '@/styles/global-crm-design.css';

interface Certificate {
  id: number;
  patientName: string;
  certificateType: string;
  issuedDate: string;
  description?: string;
  certificatePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

interface CertificateStats {
  total: number;
  thisMonth: number;
  today: number;
}

// Simplified Certificate Service
class SimpleCertificateService {
  static baseUrl = import.meta.env.VITE_API_URL;

  static async getAllCertificates() {
    try {
      console.log('🔍 Fetching all certificates...');
      
      // Create timeout controller for 60 seconds (cold start)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(`${this.baseUrl}/certificates`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch certificates: ${error}`);
      }
      const result = await response.json();
      console.log(`✅ Fetched ${result.data?.length || 0} certificates`);
      return result.data || [];
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out - Server may be starting up (this can take up to 60 seconds on first load)');
      }
      console.error('❌ Error fetching certificates:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      console.log('📊 Fetching certificate statistics...');
      
      // Create timeout controller for 60 seconds (cold start) 
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(`${this.baseUrl}/certificates/stats/overview`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch stats: ${error}`);
      }
      const result = await response.json();
      console.log('✅ Fetched certificate stats');
      return result.data || { total: 0, thisMonth: 0, today: 0 };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Stats request timed out - Server may be starting up (this can take up to 60 seconds on first load)');
      }
      console.error('❌ Error fetching stats:', error);
      throw error;
    }
  }

  static async createCertificate(formData: FormData) {
    try {
      console.log('📝 Creating new certificate...');
      const response = await fetch(`${this.baseUrl}/certificates`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create certificate: ${error}`);
      }
      const result = await response.json();
      console.log('✅ Certificate created successfully');
      return result.data;
    } catch (error) {
      console.error('❌ Error creating certificate:', error);
      throw error;
    }
  }

  static async updateCertificate(id: number, formData: FormData) {
    try {
      console.log(`📝 Updating certificate ${id}...`);
      const response = await fetch(`${this.baseUrl}/certificates/${id}`, {
        method: 'PUT',
        body: formData
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update certificate: ${error}`);
      }
      const result = await response.json();
      console.log('✅ Certificate updated successfully');
      return result.data;
    } catch (error) {
      console.error('❌ Error updating certificate:', error);
      throw error;
    }
  }

  static async deleteCertificate(id: number) {
    try {
      console.log(`🗑️ Deleting certificate ${id}...`);
      const response = await fetch(`${this.baseUrl}/certificates/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete certificate: ${error}`);
      }
      console.log('✅ Certificate deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting certificate:', error);
      throw error;
    }
  }
}

const CertificatesSimple: React.FC = () => {
  // Set page title
  usePageTitle();

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertificateStats>({
    total: 0,
    thisMonth: 0,
    today: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Loading states
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(false);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  // Modal states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editCertificate, setEditCertificate] = useState<Certificate | null>(null);
  const [viewCertificate, setViewCertificate] = useState<Certificate | null>(null);
  const [certificateToDelete, setCertificateToDelete] = useState<Certificate | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    certificateType: '',
    issuedDate: new Date().toISOString().split('T')[0],
    description: '',
    certificatePhoto: null as File | null
  });

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoadingComplete(false);
    await Promise.all([
      loadCertificates(),
      loadStats()
    ]);
    setIsLoadingComplete(true);
  };

  const loadCertificates = async () => {
    setIsLoadingCertificates(true);
    try {
      const certificatesData = await SimpleCertificateService.getAllCertificates();
      setCertificates(certificatesData || []);
      console.log('✅ Certificates loaded:', certificatesData?.length);
    } catch (error) {
      console.error('❌ Error loading certificates:', error);
      toast({
        title: "Loading Error",
        description: error.message.includes('timed out') 
          ? "Server is starting up, please wait 30-60 seconds and try again" 
          : "Failed to load certificates data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCertificates(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await SimpleCertificateService.getStats();
      setStats(statsData);
      console.log('✅ Stats loaded:', statsData);
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      toast({
        title: "Stats Error", 
        description: error.message.includes('timed out')
          ? "Server is starting up, please wait 30-60 seconds and try again"
          : "Failed to load statistics",
        variant: "destructive",
      });
    }
  };

  // Filter and search logic
  const filteredCertificates = useMemo(() => {
    return certificates.filter(certificate => {
      const matchesSearch = !searchTerm || 
        certificate.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.certificateType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (certificate.description && certificate.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }, [certificates, searchTerm]);

  // Pagination logic
  const paginatedCertificates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCertificates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCertificates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);

  // Form handlers
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      certificatePhoto: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.certificateType || !formData.issuedDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Certificate Type, Issued Date)",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      const submitData = new FormData();
      submitData.append('patientName', formData.patientName);
      submitData.append('certificateType', formData.certificateType);
      submitData.append('issuedDate', formData.issuedDate);
      submitData.append('description', formData.description);
      
      if (formData.certificatePhoto) {
        submitData.append('certificatePhoto', formData.certificatePhoto);
      }

      if (editCertificate) {
        await SimpleCertificateService.updateCertificate(editCertificate.id, submitData);
        toast({
          title: "Success",
          description: "Certificate updated successfully",
        });
      } else {
        await SimpleCertificateService.createCertificate(submitData);
        toast({
          title: "Success",
          description: "Certificate created successfully",
        });
      }

      // Reset form and refresh data
      resetForm();
      loadAllData();
    } catch (error) {
      console.error('Error submitting certificate:', error);
      toast({
        title: "Error",
        description: `Failed to ${editCertificate ? 'update' : 'create'} certificate`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      certificateType: '',
      issuedDate: new Date().toISOString().split('T')[0],
      description: '',
      certificatePhoto: null
    });
    setEditCertificate(null);
    setShowAddDialog(false);
  };

  const handleEdit = (certificate: Certificate) => {
    setFormData({
      patientName: certificate.patientName,
      certificateType: certificate.certificateType,
      issuedDate: certificate.issuedDate,
      description: certificate.description || '',
      certificatePhoto: null
    });
    setEditCertificate(certificate);
    setShowAddDialog(true);
  };

  const handleDelete = async () => {
    if (!certificateToDelete) return;

    setIsUpdating(true);
    try {
      await SimpleCertificateService.deleteCertificate(certificateToDelete.id);
      toast({
        title: "Success",
        description: "Certificate deleted successfully",
      });
      loadAllData();
      setShowDeleteDialog(false);
      setCertificateToDelete(null);
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast({
        title: "Error",
        description: "Failed to delete certificate",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleView = (certificate: Certificate) => {
    setViewCertificate(certificate);
    setShowViewDialog(true);
  };

  return (
    <div className="crm-page-bg">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="crm-header-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="crm-header-icon">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Certificate Management</h1>
              </div>
            </div>
          
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="global-btn flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Certificate</span>
                <span className="sm:hidden">+</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="certificate-stats-grid">
          {/* Total Certificates Card */}
          <Card className="crm-stat-card crm-stat-card-blue">
            <CardContent className="relative p-3 sm:p-4 lg:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-blue-700 mb-1 truncate">Total Certificates</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 mb-1">{stats.total}</p>
                  <div className="flex items-center text-xs text-blue-600">
                    <Award className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">All certificates</span>
                  </div>
                </div>
                <div className="crm-stat-icon crm-stat-icon-blue">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* This Month Card */}
          <Card className="crm-stat-card crm-stat-card-green">
            <CardContent className="relative p-3 sm:p-4 lg:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-green-700 mb-1 truncate">This Month</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 mb-1">{stats.thisMonth}</p>
                  <div className="flex items-center text-xs text-green-600">
                    <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Issued this month</span>
                  </div>
                </div>
                <div className="crm-stat-icon crm-stat-icon-green">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Today Card */}
          <Card className="crm-stat-card crm-stat-card-orange">
            <CardContent className="relative p-3 sm:p-4 lg:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-orange-700 mb-1 truncate">Today</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900 mb-1">{stats.today}</p>
                  <div className="flex items-center text-xs text-orange-600">
                    <Activity className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Issued today</span>
                  </div>
                </div>
                <div className="crm-stat-icon crm-stat-icon-orange">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <div className="crm-controls-container">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search certificates by name, type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="global-input pl-10 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Table */}
        <Card className="crm-table-container">
          <CardHeader className="crm-table-header">
            <div className="crm-table-title">
              <FileText className="crm-table-title-icon" />
              <span className="crm-table-title-text">Certificates List ({filteredCertificates.length})</span>
              <span className="crm-table-title-text-mobile">Certificates ({filteredCertificates.length})</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingCertificates ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">Loading certificates...</span>
              </div>
            ) : filteredCertificates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'No certificates match your search criteria.' : 'Get started by adding your first certificate.'}
                </p>
                <Button onClick={() => setShowAddDialog(true)} className="global-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Certificate
                </Button>
              </div>
            ) : (
              <>
                {/* Scrollable Table View for All Screen Sizes */}
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
                            <User className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Name</span>
                          </div>
                        </TableHead>
                        <TableHead className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Certificate Type</span>
                          </div>
                        </TableHead>
                        <TableHead className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Issued Date</span>
                            <span className="sm:hidden">Date</span>
                          </div>
                        </TableHead>
                        <TableHead className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <span>Description</span>
                          </div>
                        </TableHead>
                        <TableHead className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <Image className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Photo</span>
                          </div>
                        </TableHead>
                        <TableHead className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <span>Actions</span>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCertificates.map((certificate, index) => (
                        <TableRow key={certificate.id} className="hover:bg-gray-50 border-b transition-colors">
                          <TableCell className="px-2 sm:px-3 lg:px-4 py-3 text-center text-xs sm:text-sm">
                            <div className="flex justify-center">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                {((currentPage - 1) * itemsPerPage) + index + 1}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-2 sm:px-3 lg:px-4 py-3 text-center text-xs sm:text-sm">
                            <div className="flex justify-center">
                              <div className="font-medium text-gray-900 text-xs sm:text-sm truncate max-w-[120px]">
                                {certificate.patientName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-2 sm:px-3 lg:px-4 py-3 text-center text-xs sm:text-sm">
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {certificate.certificateType}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-2 sm:px-3 lg:px-4 py-3 text-center text-xs sm:text-sm">
                            <div className="flex justify-center">
                              <div className="font-medium text-gray-900">
                                {format(new Date(certificate.issuedDate), 'dd/MM/yyyy')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-2 sm:px-3 lg:px-4 py-3 text-center text-xs sm:text-sm">
                            <div className="max-w-[150px] mx-auto">
                              <p className="text-gray-700 truncate" title={certificate.description || 'No description'}>
                                {certificate.description || 'No description'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-2 sm:px-3 lg:px-4 py-3 text-center text-xs sm:text-sm">
                            {certificate.certificatePhoto ? (
                              <div className="flex justify-center">
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  <Image className="h-3 w-3 mr-1" />
                                  Available
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500 border-gray-200">
                                  <Image className="h-3 w-3 mr-1" />
                                  No Photo
                                </Badge>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="px-2 sm:px-3 lg:px-4 py-3 text-center text-xs sm:text-sm">
                            <div className="action-buttons-container">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(certificate)}
                                className="action-btn-lead action-btn-view h-8 w-8 sm:h-9 sm:w-9 p-0"
                                title="View Certificate"
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(certificate)}
                                className="action-btn-lead action-btn-edit h-8 w-8 sm:h-9 sm:w-9 p-0"
                                title="Edit Certificate"
                              >
                                <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCertificateToDelete(certificate);
                                  setShowDeleteDialog(true);
                                }}
                                className="action-btn-lead action-btn-delete h-8 w-8 sm:h-9 sm:w-9 p-0"
                                title="Delete Certificate"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="crm-pagination-container">
                    <div className="crm-pagination-info">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCertificates.length)} of {filteredCertificates.length} certificates
                    </div>
                    <div className="crm-pagination-controls">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="crm-pagination-button"
                      >
                        Previous
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className="crm-pagination-button"
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="crm-pagination-button"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Add Certificate Dialog */}
        <Dialog open={showAddDialog && !editCertificate} onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
        }}>
          <DialogContent className="editpopup form dialog-content sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="editpopup form dialog-header relative pb-3 sm:pb-4 md:pb-6 border-b border-blue-100 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
              <div className="flex items-center gap-3">
                <div className="editpopup form dialog-header icon-container p-2 bg-blue-100 rounded-lg">
                  <Award className="editpopup form dialog-header icon h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="editpopup form dialog-title text-xl font-bold text-gray-900">
                    Add New Certificate
                  </DialogTitle>
                  <DialogDescription className="editpopup form dialog-description text-gray-600 mt-1">
                    Fill in the certificate details below
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="editpopup form form-container space-y-6 p-3 sm:p-4 md:p-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName" className="text-sm font-medium text-gray-700">
                    Name *
                  </Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => handleFormChange('patientName', e.target.value)}
                    placeholder="Enter name"
                    className="bg-white border-gray-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificateType" className="text-sm font-medium text-gray-700">
                    Certificate Type *
                  </Label>
                  <Input
                    id="certificateType"
                    value={formData.certificateType}
                    onChange={(e) => handleFormChange('certificateType', e.target.value)}
                    placeholder="e.g., Medical Certificate, Vaccination Certificate"
                    className="bg-white border-gray-300"
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="issuedDate" className="text-sm font-medium text-gray-700">
                    Issued Date *
                  </Label>
                  <Input
                    id="issuedDate"
                    type="date"
                    value={formData.issuedDate}
                    onChange={(e) => handleFormChange('issuedDate', e.target.value)}
                    className="bg-white border-gray-300"
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Enter certificate description (optional)"
                    className="bg-white border-gray-300"
                    rows={3}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="certificatePhoto" className="text-sm font-medium text-gray-700">
                    Certificate Photo
                  </Label>
                  <Input
                    id="certificatePhoto"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="bg-white border-gray-300"
                  />
                  <p className="text-xs text-gray-500">
                    Upload certificate image or PDF (max 10MB)
                  </p>
                </div>
              </div>
            </form>

            <DialogFooter className="editpopup form dialog-footer flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isUpdating}
                className="w-full sm:w-auto global-btn"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Certificate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Certificate Dialog */}
        {editCertificate && (
          <Dialog open={!!editCertificate} onOpenChange={(open) => {
            if (!open) {
              resetForm();
            }
          }}>
            <DialogContent className="editpopup form dialog-content sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader className="editpopup form dialog-header relative pb-3 sm:pb-4 md:pb-6 border-b border-blue-100 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                <div className="flex items-center gap-3">
                  <div className="editpopup form dialog-header icon-container p-2 bg-blue-100 rounded-lg">
                    <Edit2 className="editpopup form dialog-header icon h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <DialogTitle className="editpopup form dialog-title text-xl font-bold text-gray-900">
                      Edit Certificate - {editCertificate.id}
                    </DialogTitle>
                    <DialogDescription className="editpopup form dialog-description text-gray-600 mt-1">
                      Update certificate information and details
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                className="editpopup form form-container space-y-6 p-3 sm:p-4 md:p-6"
              >
                {/* Certificate Information Section */}
                <div className="editpopup form form-section space-y-4">
                  <h3 className="editpopup form form-section-title text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="editpopup form form-section-icon personal w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Award className="h-4 w-4 text-blue-600" />
                    </div>
                    Certificate Information
                  </h3>
                  <div className="editpopup form form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="editpopup form form-field space-y-2">
                      <Label htmlFor="edit-name" className="editpopup form form-label text-sm font-medium text-gray-700">
                        Name <span className="editpopup form form-required text-destructive">*</span>
                      </Label>
                      <Input
                        id="edit-name"
                        value={editCertificate.patientName}
                        onChange={(e) => setEditCertificate({...editCertificate, patientName: e.target.value})}
                        placeholder="Enter name"
                        className="editpopup form form-input mt-1 border-primary/30 focus:border-primary"
                        required
                      />
                    </div>

                    <div className="editpopup form form-field space-y-2">
                      <Label htmlFor="edit-certificateType" className="editpopup form form-label text-sm font-medium text-gray-700">
                        Certificate Type <span className="editpopup form form-required text-destructive">*</span>
                      </Label>
                      <Input
                        id="edit-certificateType"
                        value={editCertificate.certificateType}
                        onChange={(e) => setEditCertificate({...editCertificate, certificateType: e.target.value})}
                        placeholder="e.g., Medical Certificate, Vaccination Certificate"
                        className="editpopup form form-input mt-1 border-primary/30 focus:border-primary"
                        required
                      />
                    </div>

                    <div className="editpopup form form-field space-y-2 md:col-span-2">
                      <Label htmlFor="edit-issuedDate" className="editpopup form form-label text-sm font-medium text-gray-700">
                        Issued Date <span className="editpopup form form-required text-destructive">*</span>
                      </Label>
                      <Input
                        id="edit-issuedDate"
                        type="date"
                        value={editCertificate.issuedDate}
                        onChange={(e) => setEditCertificate({...editCertificate, issuedDate: e.target.value})}
                        className="editpopup form form-input mt-1 border-primary/30 focus:border-primary"
                        required
                      />
                    </div>

                    <div className="editpopup form form-field space-y-2 md:col-span-2">
                      <Label htmlFor="edit-description" className="editpopup form form-label text-sm font-medium text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        id="edit-description"
                        value={editCertificate.description || ''}
                        onChange={(e) => setEditCertificate({...editCertificate, description: e.target.value})}
                        placeholder="Enter certificate description (optional)"
                        className="editpopup form form-input mt-1 border-primary/30 focus:border-primary"
                        rows={3}
                      />
                    </div>

                    <div className="editpopup form form-field space-y-2 md:col-span-2">
                      <Label htmlFor="edit-certificatePhoto" className="editpopup form form-label text-sm font-medium text-gray-700">
                        Certificate Photo
                      </Label>
                      <Input
                        id="edit-certificatePhoto"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="editpopup form form-input mt-1 border-primary/30 focus:border-primary"
                      />
                      <p className="text-xs text-gray-500">
                        Upload certificate image or PDF (max 10MB). Leave empty to keep existing photo.
                      </p>
                      {editCertificate.certificatePhoto && (
                        <div className="mt-2">
                          <p className="text-xs text-green-600">Current photo: {editCertificate.certificatePhoto.split('/').pop()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>

              <DialogFooter className="editpopup form dialog-footer flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="editpopup form footer-button-cancel w-full sm:w-auto modern-btn modern-btn-secondary"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isUpdating}
                  className="w-full sm:w-auto global-btn"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Update Certificate
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* View Certificate Dialog - Glass Morphism Design */}
        {viewCertificate && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowViewDialog(false);
              setViewCertificate(null);
            }}
          >
            <div 
              className="max-w-[95vw] max-h-[95vh] w-full sm:max-w-6xl overflow-hidden bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-2xl p-0 m-4 rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header - Glass Morphism Style */}
              <div className="relative pb-3 sm:pb-4 md:pb-6 border-b border-blue-100 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                {/* Gradient Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
                
                {/* Header Content */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-4">
                  
                  {/* Certificate Icon Section */}
                  <div className="relative flex-shrink-0">
                    {viewCertificate.certificatePhoto ? (
                      <img 
                        src={getCertificatePhotoUrl(viewCertificate.certificatePhoto)}
                        alt={`${viewCertificate.certificateType} Certificate`}
                        className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full object-cover border-2 sm:border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className={`${viewCertificate.certificatePhoto ? 'hidden' : 'flex'} w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 items-center justify-center border-2 sm:border-4 border-white shadow-lg`}>
                      <Award className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white" />
                    </div>
                    {/* Status Badge */}
                    <div className="absolute -bottom-1 -right-1">
                      <Badge className="bg-green-500 hover:bg-green-600 text-white border-2 border-white shadow-sm text-xs">
                        Active
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Title and Info Section */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-1 sm:gap-2 truncate">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{viewCertificate.certificateType}</span>
                    </h2>
                    <div className="text-xs sm:text-sm md:text-lg lg:text-xl mt-1 flex items-center gap-2">
                      <span className="text-gray-600">Certificate ID:</span>
                      <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-200">
                        {viewCertificate.id}
                      </span>
                    </div>
                  </div>
                  
                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowViewDialog(false);
                      setViewCertificate(null);
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(95vh-100px)] sm:max-h-[calc(95vh-120px)] md:max-h-[calc(95vh-140px)] lg:max-h-[calc(95vh-200px)] custom-scrollbar">
                <div className="p-2 sm:p-3 md:p-4 lg:p-6 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
                  {/* Certificate Information Section */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-blue-100 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Award className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 text-blue-600" />
                      </div>
                      Certificate Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Label className="text-xs font-medium text-blue-600 uppercase tracking-wide">Name</Label>
                            <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">{viewCertificate.patientName}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Award className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Label className="text-xs font-medium text-green-600 uppercase tracking-wide">Certificate Type</Label>
                            <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">{viewCertificate.certificateType}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Label className="text-xs font-medium text-purple-600 uppercase tracking-wide">Issued Date</Label>
                            <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                              {format(new Date(viewCertificate.issuedDate), 'dd-MM-yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Photo Section */}
                  {viewCertificate.certificatePhoto && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-green-100 shadow-sm">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Image className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 text-green-600" />
                        </div>
                        Certificate Photo
                      </h3>
                      <div className="flex justify-center">
                        <img 
                          src={getCertificatePhotoUrl(viewCertificate.certificatePhoto)}
                          alt={`${viewCertificate.certificateType} Certificate`}
                          className="max-w-full max-h-96 object-contain rounded-lg border-2 border-gray-200 shadow-lg"
                          onError={(e) => {
                            console.error('Image load failed:', getCertificatePhotoUrl(viewCertificate.certificatePhoto));
                            e.currentTarget.src = '/placeholder-certificate.png';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Description Section */}
                  {viewCertificate.description && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-orange-100 shadow-sm">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 text-orange-600" />
                        </div>
                        Description
                      </h3>
                      <div className="bg-gradient-to-br from-orange-50 to-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border border-orange-100">
                        <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">{viewCertificate.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Metadata Section */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 text-gray-600" />
                      </div>
                      Record Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                      <div className="bg-gradient-to-br from-gray-50 to-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Created Date</Label>
                            <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                              {format(new Date(viewCertificate.createdAt), 'dd-MM-yyyy hh:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog - Centered */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="crm-modal-container">
            <DialogHeader className="editpopup form dialog-header">
              <div className="editpopup form icon-title-container">
                <div className="editpopup form dialog-icon">
                  <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <div className="editpopup form title-description">
                  <DialogTitle className="editpopup form dialog-title text-red-700">
                    Delete Certificate
                  </DialogTitle>
                  <DialogDescription className="editpopup form dialog-description">
                    Are you sure you want to delete this certificate? This action cannot be undone.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            {certificateToDelete && (
              <div className="mx-4 my-4 p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{certificateToDelete.patientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">ID: {certificateToDelete.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{format(new Date(certificateToDelete.issuedDate), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-2">⚠️ This will permanently delete:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Certificate document and photo</li>
                      <li>• All certificate history records</li>
                      <li>• Certificate metadata and timestamps</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="editpopup form dialog-footer flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowDeleteDialog(false);
                  setCertificateToDelete(null);
                }}
                disabled={isUpdating}
                className="editpopup form footer-button-cancel w-full sm:w-auto modern-btn modern-btn-secondary"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleDelete}
                disabled={isUpdating}
                className="editpopup form footer-button-delete w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Delete Certificate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CertificatesSimple;
