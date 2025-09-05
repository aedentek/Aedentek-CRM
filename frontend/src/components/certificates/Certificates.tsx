import React, { useState, useEffect, useMemo } from 'react';
import { DatabaseService } from '@/services/databaseService';
import CertificateService from '@/services/certificateService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ActionButtons } from '@/components/ui/HeaderActionButtons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  FileText, 
  Search, 
  Download, 
  Edit2, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Upload, 
  Users, 
  Activity, 
  Calendar,
  Plus, 
  X, 
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  CalendarDays,
  Shield,
  Stethoscope
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { Textarea } from '@/components/ui/textarea';
import usePageTitle from '@/hooks/usePageTitle';
import '../../styles/modern-forms.css';
import '../../styles/modern-tables.css';
import '@/styles/global-crm-design.css';

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photo?: string;
}

interface Certificate {
  id: number;
  certificateNumber: string;
  patientId: string;
  patientName: string;
  certificateType: string;
  issuedDate: string;
  validUntil?: string;
  title: string;
  description?: string;
  doctorName?: string;
  doctorSignature?: string;
  hospitalStamp?: string;
  certificateTemplate: string;
  documents: string[];
  status: 'Active' | 'Expired' | 'Revoked' | 'Draft';
  issuedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

interface CertificateStats {
  totalCertificates: number;
  activeCertificates: number;
  expiredCertificates: number;
  revokedCertificates: number;
  draftCertificates: number;
  medicalCertificates: number;
  fitnessCertificates: number;
  vaccinationCertificates: number;
  todayCertificates: number;
  thisMonthCertificates: number;
}

const Certificates: React.FC = () => {
  // Set page title
  usePageTitle();

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [patients, setPatients] = useState<Patient[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertificateStats>({
    totalCertificates: 0,
    activeCertificates: 0,
    expiredCertificates: 0,
    revokedCertificates: 0,
    draftCertificates: 0,
    medicalCertificates: 0,
    fitnessCertificates: 0,
    vaccinationCertificates: 0,
    todayCertificates: 0,
    thisMonthCertificates: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Loading states
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
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
    certificateNumber: '',
    patientId: '',
    patientName: '',
    certificateType: 'Medical Certificate',
    issuedDate: new Date().toISOString().split('T')[0],
    validUntil: '',
    title: '',
    description: '',
    doctorName: '',
    doctorSignature: '',
    hospitalStamp: '',
    certificateTemplate: 'standard',
    documents: [] as string[],
    status: 'Active' as 'Active' | 'Expired' | 'Revoked' | 'Draft',
    issuedBy: '',
    notes: '',
    documentFiles: [] as File[]
  });

  // Certificate type and status options
  const certificateTypes = CertificateService.getCertificateTypeOptions();
  const statusOptions = CertificateService.getStatusOptions();
  const templateOptions = CertificateService.getTemplateOptions();

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, [refreshCounter]);

  const loadAllData = async () => {
    setIsLoadingComplete(false);
    await Promise.all([
      loadPatients(),
      loadCertificates(),
      loadStats()
    ]);
    setIsLoadingComplete(true);
  };

  const loadPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const patientsData = await DatabaseService.getAllPatients();
      setPatients(patientsData || []);
      console.log('✅ Patients loaded:', patientsData?.length);
    } catch (error) {
      console.error('❌ Error loading patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const loadCertificates = async () => {
    setIsLoadingCertificates(true);
    try {
      const certificatesData = await CertificateService.getAllCertificates();
      setCertificates(certificatesData || []);
      console.log('✅ Certificates loaded:', certificatesData?.length);
    } catch (error) {
      console.error('❌ Error loading certificates:', error);
      toast({
        title: "Error",
        description: "Failed to load certificates data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCertificates(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await CertificateService.getCertificateStats();
      setStats(statsData || {
        totalCertificates: 0,
        activeCertificates: 0,
        expiredCertificates: 0,
        revokedCertificates: 0,
        draftCertificates: 0,
        medicalCertificates: 0,
        fitnessCertificates: 0,
        vaccinationCertificates: 0,
        todayCertificates: 0,
        thisMonthCertificates: 0
      });
      console.log('✅ Certificate stats loaded');
    } catch (error) {
      console.error('❌ Error loading certificate stats:', error);
    }
  };

  // Filter certificates based on search and filters
  const filteredCertificates = useMemo(() => {
    return certificates.filter(certificate => {
      const matchesSearch = 
        certificate.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || certificate.certificateType === typeFilter;
      const matchesStatus = statusFilter === 'all' || certificate.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [certificates, searchTerm, typeFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCertificates = filteredCertificates.slice(startIndex, endIndex);

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle patient selection
  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientId: patient.id,
        patientName: patient.name
      }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      certificateNumber: '',
      patientId: '',
      patientName: '',
      certificateType: 'Medical Certificate',
      issuedDate: new Date().toISOString().split('T')[0],
      validUntil: '',
      title: '',
      description: '',
      doctorName: '',
      doctorSignature: '',
      hospitalStamp: '',
      certificateTemplate: 'standard',
      documents: [],
      status: 'Active',
      issuedBy: '',
      notes: '',
      documentFiles: []
    });
  };

  // Handle add/edit certificate
  const handleSubmit = async () => {
    if (!formData.patientId || !formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const certificateData = {
        ...formData,
        certificateNumber: formData.certificateNumber || CertificateService.generateCertificateNumber(),
        createdBy: editCertificate ? undefined : 'admin',
        updatedBy: editCertificate ? 'admin' : undefined
      };

      if (editCertificate) {
        await CertificateService.updateCertificate(editCertificate.id.toString(), certificateData);
        toast({
          title: "Success",
          description: "Certificate updated successfully",
        });
      } else {
        await CertificateService.addCertificate(certificateData);
        toast({
          title: "Success",
          description: "Certificate added successfully",
        });
      }

      setShowAddDialog(false);
      setEditCertificate(null);
      resetForm();
      setRefreshCounter(prev => prev + 1);
    } catch (error) {
      console.error('❌ Error saving certificate:', error);
      toast({
        title: "Error",
        description: "Failed to save certificate",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete certificate
  const handleDelete = async () => {
    if (!certificateToDelete) return;

    setIsUpdating(true);
    try {
      await CertificateService.deleteCertificate(certificateToDelete.id.toString());
      toast({
        title: "Success",
        description: "Certificate deleted successfully",
      });
      setShowDeleteDialog(false);
      setCertificateToDelete(null);
      setRefreshCounter(prev => prev + 1);
    } catch (error) {
      console.error('❌ Error deleting certificate:', error);
      toast({
        title: "Error",
        description: "Failed to delete certificate",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle actions
  const handleView = (certificate: Certificate) => {
    setViewCertificate(certificate);
    setShowViewDialog(true);
  };

  const handleEdit = (certificate: Certificate) => {
    setEditCertificate(certificate);
    setFormData({
      certificateNumber: certificate.certificateNumber,
      patientId: certificate.patientId,
      patientName: certificate.patientName,
      certificateType: certificate.certificateType,
      issuedDate: certificate.issuedDate,
      validUntil: certificate.validUntil || '',
      title: certificate.title,
      description: certificate.description || '',
      doctorName: certificate.doctorName || '',
      doctorSignature: certificate.doctorSignature || '',
      hospitalStamp: certificate.hospitalStamp || '',
      certificateTemplate: certificate.certificateTemplate,
      documents: certificate.documents || [],
      status: certificate.status,
      issuedBy: certificate.issuedBy || '',
      notes: certificate.notes || '',
      documentFiles: []
    });
    setShowAddDialog(true);
  };

  const handleDeleteClick = (certificate: Certificate) => {
    setCertificateToDelete(certificate);
    setShowDeleteDialog(true);
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredCertificates.map(cert => ({
      'Certificate Number': cert.certificateNumber,
      'Patient ID': cert.patientId,
      'Patient Name': cert.patientName,
      'Type': cert.certificateType,
      'Issued Date': format(new Date(cert.issuedDate), 'dd/MM/yyyy'),
      'Valid Until': cert.validUntil ? format(new Date(cert.validUntil), 'dd/MM/yyyy') : 'N/A',
      'Title': cert.title,
      'Doctor': cert.doctorName || 'N/A',
      'Status': cert.status,
      'Issued By': cert.issuedBy || 'N/A',
      'Created Date': format(new Date(cert.createdAt), 'dd/MM/yyyy HH:mm')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Certificates");
    XLSX.writeFile(wb, `certificates_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Success",
      description: "Certificates exported successfully",
    });
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Expired': return 'destructive';
      case 'Revoked': return 'secondary';
      case 'Draft': return 'outline';
      default: return 'default';
    }
  };

  // Check if certificate is expiring soon (within 30 days)
  const isExpiringSoon = (validUntil?: string) => {
    if (!validUntil) return false;
    const daysUntilExpiry = CertificateService.getDaysUntilExpiry(validUntil);
    return daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className="crm-page-bg">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="crm-header-container">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="crm-header-icon">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Certificates Management</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track patient certificates</p>
              </div>
            </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-shrink-0">
            <div className="flex gap-2">
              <ActionButtons.Refresh 
                onClick={() => setRefreshCounter(prev => prev + 1)}
                loading={isLoadingCertificates || isLoadingPatients}
              />
              <ActionButtons.Export 
                onClick={handleExport}
                text="Export Certificates"
              />
            </div>
            <Button
              onClick={() => {
                resetForm();
                setEditCertificate(null);
                setShowAddDialog(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Certificate
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="crm-stat-card crm-stat-card-blue">
          <CardContent className="relative p-3 sm:p-4 lg:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-blue-700 mb-1 truncate">Total Certificates</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 mb-1">{stats.totalCertificates}</p>
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

        <Card className="crm-stat-card crm-stat-card-green">
          <CardContent className="relative p-3 sm:p-4 lg:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-green-700 mb-1 truncate">Active Certificates</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 mb-1">{stats.activeCertificates}</p>
                <div className="flex items-center text-xs text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">Currently valid</span>
                </div>
              </div>
              <div className="crm-stat-icon crm-stat-icon-green">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="crm-stat-card crm-stat-card-red">
          <CardContent className="relative p-3 sm:p-4 lg:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-red-700 mb-1 truncate">Expired Certificates</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-900 mb-1">{stats.expiredCertificates}</p>
                <div className="flex items-center text-xs text-red-600">
                  <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">Need renewal</span>
                </div>
              </div>
              <div className="crm-stat-icon crm-stat-icon-red">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="crm-stat-card crm-stat-card-purple">
          <CardContent className="relative p-3 sm:p-4 lg:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-purple-700 mb-1 truncate">This Month</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900 mb-1">{stats.thisMonthCertificates}</p>
                <div className="flex items-center text-xs text-purple-600">
                  <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">Issued recently</span>
                </div>
              </div>
              <div className="crm-stat-icon crm-stat-icon-purple">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Section */}
      <div className="crm-controls-container">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by certificate number, patient name, title, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {certificateTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="crm-table-container">
        <div className="crm-table-header">
          <div className="crm-table-title">
            <Award className="crm-table-title-icon" />
            <h2 className="crm-table-title-text">Certificates</h2>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          {/* Loading Indicator */}
          {(!isLoadingComplete && (isLoadingCertificates || isLoadingPatients)) && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading certificates...</span>
              </div>
            </div>
          )}

          {/* No Data State */}
          {isLoadingComplete && filteredCertificates.length === 0 && (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'No certificates match your current filters.'
                  : 'Get started by adding your first certificate.'
                }
              </p>
              {(!searchTerm && typeFilter === 'all' && statusFilter === 'all') && (
                <Button
                  onClick={() => {
                    resetForm();
                    setEditCertificate(null);
                    setShowAddDialog(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Certificate
                </Button>
              )}
            </div>
          )}

          {/* Certificates Table */}
          {isLoadingComplete && filteredCertificates.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">#</TableHead>
                  <TableHead className="text-center">Certificate No.</TableHead>
                  <TableHead className="text-center">Patient</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Title</TableHead>
                  <TableHead className="text-center">Issued Date</TableHead>
                  <TableHead className="text-center">Valid Until</TableHead>
                  <TableHead className="text-center">Doctor</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCertificates.map((certificate, index) => (
                  <TableRow key={certificate.id} className="hover:bg-muted/50">
                    <TableCell className="text-center font-medium">{startIndex + index + 1}</TableCell>
                    <TableCell className="text-center">
                      <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {certificate.certificateNumber}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div>
                        <div className="font-medium">{certificate.patientName}</div>
                        <div className="text-sm text-gray-500">ID: {certificate.patientId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="capitalize">
                        {certificate.certificateType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center max-w-xs truncate" title={certificate.title}>
                      {certificate.title}
                    </TableCell>
                    <TableCell className="text-center">
                      {format(new Date(certificate.issuedDate), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-center">
                      {certificate.validUntil ? (
                        <div className={`${isExpiringSoon(certificate.validUntil) ? 'text-orange-600' : ''}`}>
                          {format(new Date(certificate.validUntil), 'dd/MM/yyyy')}
                          {isExpiringSoon(certificate.validUntil) && (
                            <div className="text-xs text-orange-500">Expiring soon</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No expiry</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {certificate.doctorName ? (
                        <div className="flex items-center justify-center">
                          <Stethoscope className="w-3 h-3 mr-1" />
                          <span className="text-sm">{certificate.doctorName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusBadgeVariant(certificate.status)}>
                        {certificate.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(certificate)}
                          className="action-btn-lead action-btn-view"
                          title="View Certificate"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(certificate)}
                          className="action-btn-lead action-btn-edit"
                          title="Edit Certificate"
                        >
                          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(certificate)}
                          className="action-btn-lead action-btn-delete"
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
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredCertificates.length > itemsPerPage && isLoadingComplete && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredCertificates.length)} of {filteredCertificates.length} certificates
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = i + Math.max(1, currentPage - 2);
              if (pageNumber > totalPages) return null;
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                  className="w-8"
                >
                  {pageNumber}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Certificate Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full sm:max-w-4xl overflow-hidden bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-2xl p-0 m-4 rounded-xl">
          {/* Modal Header */}
          <div className="relative pb-3 sm:pb-4 md:pb-6 border-b border-blue-100 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-2 sm:border-4 border-white shadow-lg overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Award className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{editCertificate ? 'Edit Certificate' : 'Add New Certificate'}</span>
                  </h2>
                  <div className="text-xs sm:text-sm md:text-lg lg:text-xl mt-1 flex items-center gap-2">
                    <span className="text-gray-600">
                      {editCertificate ? 'Update the certificate details below.' : 'Create a new certificate with patient and medical details.'}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditCertificate(null);
                  resetForm();
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto max-h-[calc(95vh-100px)] sm:max-h-[calc(95vh-120px)] md:max-h-[calc(95vh-140px)] lg:max-h-[calc(95vh-200px)] custom-scrollbar">
            <div className="p-2 sm:p-3 md:p-4 lg:p-6 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
              {/* Form Content */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-blue-100 shadow-sm">
                
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Patient Selection */}
                  <div className="md:col-span-2">
                    <Label htmlFor="patient" className="text-sm font-medium text-gray-700 mb-2 block">Patient *</Label>
                    <Select value={formData.patientId} onValueChange={handlePatientSelect}>
                      <SelectTrigger className="bg-white/90 backdrop-blur-sm border-gray-200 rounded-lg">
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-600" />
                              <span>{patient.name} (ID: {patient.id})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Certificate Number */}
                  <div>
                    <Label htmlFor="certificateNumber" className="text-sm font-medium text-gray-700 mb-2 block">
                      Certificate Number
                    </Label>
                    <Input
                      id="certificateNumber"
                      value={formData.certificateNumber}
                      onChange={(e) => handleFormChange('certificateNumber', e.target.value)}
                      placeholder="Auto-generated if empty"
                      className="bg-white/90 backdrop-blur-sm border-gray-200 rounded-lg"
                    />
                  </div>

                  {/* Certificate Type */}
                  <div>
                    <Label htmlFor="certificateType" className="text-sm font-medium text-gray-700 mb-2 block">Certificate Type *</Label>
                    <Select value={formData.certificateType} onValueChange={(value) => handleFormChange('certificateType', value)}>
                      <SelectTrigger className="bg-white/90 backdrop-blur-sm border-gray-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {certificateTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Issued Date */}
                  <div>
                    <Label htmlFor="issuedDate" className="text-sm font-medium text-gray-700 mb-2 block">Issued Date *</Label>
                    <Input
                      id="issuedDate"
                      type="date"
                      value={formData.issuedDate}
                      onChange={(e) => handleFormChange('issuedDate', e.target.value)}
                      className="bg-white/90 backdrop-blur-sm border-gray-200 rounded-lg"
                    />
                  </div>

                  {/* Valid Until */}
                  <div>
                    <Label htmlFor="validUntil" className="text-sm font-medium text-gray-700 mb-2 block">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => handleFormChange('validUntil', e.target.value)}
                      className="bg-white/90 backdrop-blur-sm border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="space-y-4 mb-6">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">Certificate Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="e.g., Medical Fitness Certificate"
                      className="bg-white/90 backdrop-blur-sm border-gray-200 rounded-lg"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Detailed description of the certificate..."
                      rows={3}
                      className="bg-white/90 backdrop-blur-sm border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Medical Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Doctor Name */}
                  <div>
                    <Label htmlFor="doctorName" className="text-sm font-medium text-gray-700 mb-2 block">Doctor Name</Label>
                    <Input
                      id="doctorName"
                      value={formData.doctorName}
                      onChange={(e) => handleFormChange('doctorName', e.target.value)}
                      placeholder="Dr. John Smith"
                      className="bg-white/90 backdrop-blur-sm border-gray-200 rounded-lg"
                    />
                  </div>

                  {/* Issued By */}
                  <div>
                    <Label htmlFor="issuedBy" className="text-sm font-medium text-gray-700 mb-2 block">Issued By</Label>
                    <Input
                      id="issuedBy"
                      value={formData.issuedBy}
                      onChange={(e) => handleFormChange('issuedBy', e.target.value)}
                      placeholder="Hospital/Clinic name"
                      className="bg-white/90 backdrop-blur-sm border-gray-200 rounded-lg"
                    />
                  </div>

                  {/* Certificate Template */}
                  <div>
                    <Label htmlFor="certificateTemplate" className="text-sm font-medium text-gray-700 mb-2 block">Template</Label>
                    <Select value={formData.certificateTemplate} onValueChange={(value) => handleFormChange('certificateTemplate', value)}>
                      <SelectTrigger className="bg-white/90 backdrop-blur-sm border-gray-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templateOptions.map((template) => (
                          <SelectItem key={template.value} value={template.value}>{template.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleFormChange('status', value as any)}>
                      <SelectTrigger className="bg-white/90 backdrop-blur-sm border-gray-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Any additional notes or conditions..."
                    rows={2}
                    className="bg-white/90 backdrop-blur-sm border-gray-200 rounded-lg"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowAddDialog(false);
                      setEditCertificate(null);
                      resetForm();
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isUpdating || !formData.patientId || !formData.title.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editCertificate ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 mr-2" />
                        {editCertificate ? 'Update Certificate' : 'Add Certificate'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Certificate Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full sm:max-w-3xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Certificate Details
            </DialogTitle>
          </DialogHeader>
          
          {viewCertificate && (
            <div className="space-y-6 p-4">
              {/* Certificate Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{viewCertificate.title}</h3>
                  <div className="font-mono text-lg text-blue-600 bg-white px-4 py-2 rounded-lg inline-block">
                    {viewCertificate.certificateNumber}
                  </div>
                </div>
              </div>

              {/* Certificate Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Patient Information</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium">{viewCertificate.patientName}</div>
                      <div className="text-sm text-gray-500">ID: {viewCertificate.patientId}</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Certificate Type</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-sm">
                        {viewCertificate.certificateType}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(viewCertificate.status)}>
                        {viewCertificate.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Issued Date</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      {format(new Date(viewCertificate.issuedDate), 'dd MMMM yyyy')}
                    </div>
                  </div>

                  {viewCertificate.validUntil && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Valid Until</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                        {format(new Date(viewCertificate.validUntil), 'dd MMMM yyyy')}
                        {isExpiringSoon(viewCertificate.validUntil) && (
                          <div className="text-sm text-orange-600 mt-1">⚠️ Expiring soon</div>
                        )}
                      </div>
                    </div>
                  )}

                  {viewCertificate.doctorName && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Doctor</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg flex items-center">
                        <Stethoscope className="w-4 h-4 mr-2 text-blue-600" />
                        {viewCertificate.doctorName}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {viewCertificate.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                    {viewCertificate.description}
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewCertificate.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                    {viewCertificate.notes}
                  </div>
                </div>
              )}

              {/* Issued By */}
              {viewCertificate.issuedBy && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Issued By</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    {viewCertificate.issuedBy}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Created: {format(new Date(viewCertificate.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                  <span>Updated: {format(new Date(viewCertificate.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Certificate
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this certificate? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {certificateToDelete && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm">
                  <div className="font-medium">Certificate: {certificateToDelete.certificateNumber}</div>
                  <div className="text-gray-600">Patient: {certificateToDelete.patientName}</div>
                  <div className="text-gray-600">Title: {certificateToDelete.title}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setCertificateToDelete(null);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
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

export default Certificates;
