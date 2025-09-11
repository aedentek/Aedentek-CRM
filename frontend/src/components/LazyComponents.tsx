import React, { Suspense } from 'react';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

// HOC for wrapping lazy components with Suspense and appropriate loading skeleton
export const withSuspense = (
  Component: React.LazyExoticComponent<React.ComponentType<any>>, 
  loadingType: 'page' | 'table' | 'form' | 'dashboard' = 'page'
) => {
  return (props: any) => (
    <Suspense fallback={<LoadingSkeleton type={loadingType} />}>
      <Component {...props} />
    </Suspense>
  );
};

// Lazy loaded components
export const LazyDashboard = React.lazy(() => import('@/components/dashboard/Dashboard'));
export const LazyAddPatient = React.lazy(() => import('@/components/patients/AddPatient'));
export const LazyPatientList = React.lazy(() => import('@/components/patients/PatientList'));
export const LazyDeletedPatients = React.lazy(() => import('@/components/patients/DeletedPatients'));
export const LazyPatientAttendance = React.lazy(() => import('@/components/patients/PatientAttendance'));
export const LazyPatientHistory = React.lazy(() => import('@/components/patients/PatientHistory'));
export const LazyPatientPaymentFees = React.lazy(() => import('@/components/patients/PatientPaymentFees'));
export const LazyPatientBiodata = React.lazy(() => import('@/components/patients/PatientBiodata'));
export const LazyPatientFullyHistory = React.lazy(() => import('@/components/patients/PatientFullyHistory'));
export const LazyTestRoute = React.lazy(() => import('@/components/TestRoute'));
export const LazyTestReportAmountPage = React.lazy(() => import('@/pages/management/test-report-amount'));
export const LazyPatientMedicalRecord = React.lazy(() => import('@/components/patients/PatientMedicalRecord'));
export const LazyMinimalCertificateTest = React.lazy(() => import('@/components/certificates/MinimalCertificateTest'));

// Staff Management
export const LazyStaffManagement = React.lazy(() => import('@/components/management/StaffManagement'));
export const LazyDeletedStaff = React.lazy(() => import('@/components/management/DeletedStaff'));
export const LazyAddStaff = React.lazy(() => import('@/components/management/AddStaff'));
export const LazyStaffCategoryManagement = React.lazy(() => import('@/components/management/StaffCategory'));
export const LazyAttendanceManagement = React.lazy(() => import('@/components/management/AttendanceManagement'));
export const LazySalaryPayment = React.lazy(() => import('@/components/management/SalaryPayment'));

// Doctor Management
export const LazyDoctorManagement = React.lazy(() => import('@/components/management/DoctorManagement'));
export const LazyAddDoctor = React.lazy(() => import('@/components/management/AddDoctor'));
export const LazyDeletedDoctors = React.lazy(() => import('@/components/management/DeletedDoctors'));
export const LazyDoctorAttendance = React.lazy(() => import('@/components/management/DoctorAttendance'));
export const LazyDoctorSalary = React.lazy(() => import('@/components/management/DoctorSalary'));
export const LazyDoctorCategory = React.lazy(() => import('@/components/management/DoctorCategory'));

// Medicine Management
export const LazyMedicineManagement = React.lazy(() => import('@/components/management/MedicineManagement'));
export const LazyCategoryManagement = React.lazy(() => import('@/components/management/MedicineCategories'));
export const LazyMedicineStock = React.lazy(() => import('@/components/management/MedicineStock'));
export const LazyMedicineAccounts = React.lazy(() => import('@/components/management/MedicineAccounts'));

// Supplier Management
export const LazySupplierManagement = React.lazy(() => import('@/components/management/SupplierManagement'));
export const LazyGroceryManagement = React.lazy(() => import('@/components/management/GroceryManagement'));
export const LazyGroceryCategories = React.lazy(() => import('@/components/management/GroceryCategories'));
export const LazyGrocerySuppliers = React.lazy(() => import('@/components/management/GrocerySuppliers'));
export const LazyGroceryStock = React.lazy(() => import('@/components/management/GroceryStock'));
export const LazyGroceryAccounts = React.lazy(() => import('@/components/management/GroceryAccounts'));

// General Management
export const LazyGeneralManagement = React.lazy(() => import('@/components/management/GeneralManagement'));
export const LazyGeneralCategories = React.lazy(() => import('@/components/management/GeneralCategories'));
export const LazyGeneralSuppliers = React.lazy(() => import('@/components/management/GeneralSuppliers'));
export const LazyGeneralStock = React.lazy(() => import('@/components/management/GeneralStock'));
export const LazyGeneralAccounts = React.lazy(() => import('@/components/management/GeneralAccounts'));

// User Management
export const LazyAddUser = React.lazy(() => import('@/components/management/AddUser'));
export const LazyUserManagement = React.lazy(() => import('@/components/management/UserManagement'));
export const LazyAddRole = React.lazy(() => import('@/components/management/AddRole'));

// Leads
export const LazyAddLeadCategory = React.lazy(() => import('@/components/leads/AddLeadCategory'));
export const LazyLeadsList = React.lazy(() => import('@/components/leads/LeadsList'));

// Settings & Administration
export const LazySettings = React.lazy(() => import('@/components/settings/Settings'));
export const LazyAdministration = React.lazy(() => import('@/components/Administration/Administration'));
export const LazyStaffAdvance = React.lazy(() => import('@/pages/management/staff-advance'));

// Additional pages
export const LazyNotFound = React.lazy(() => import('@/pages/NotFound'));
export const LazyIndex = React.lazy(() => import('@/pages/Index'));
export const LazyDoctorAdvance = React.lazy(() => import('@/pages/management/doctor-advance'));

// Wrapped components with Suspense and appropriate loading types
export const Dashboard = withSuspense(LazyDashboard, 'dashboard');
export const AddPatient = withSuspense(LazyAddPatient, 'form');
export const PatientList = withSuspense(LazyPatientList, 'table');
export const DeletedPatients = withSuspense(LazyDeletedPatients, 'table');
export const PatientAttendance = withSuspense(LazyPatientAttendance, 'table');
export const PatientHistory = withSuspense(LazyPatientHistory, 'table');
export const PatientPaymentFees = withSuspense(LazyPatientPaymentFees, 'form');
export const PatientBiodata = withSuspense(LazyPatientBiodata, 'page');
export const PatientFullyHistory = withSuspense(LazyPatientFullyHistory, 'page');
export const TestRoute = withSuspense(LazyTestRoute, 'page');
export const TestReportAmountPage = withSuspense(LazyTestReportAmountPage, 'table');
export const PatientMedicalRecord = withSuspense(LazyPatientMedicalRecord, 'table');
export const MinimalCertificateTest = withSuspense(LazyMinimalCertificateTest, 'page');

export const StaffManagement = withSuspense(LazyStaffManagement, 'table');
export const DeletedStaff = withSuspense(LazyDeletedStaff, 'table');
export const AddStaff = withSuspense(LazyAddStaff, 'form');
export const StaffCategoryManagement = withSuspense(LazyStaffCategoryManagement, 'table');
export const AttendanceManagement = withSuspense(LazyAttendanceManagement, 'table');
export const SalaryPayment = withSuspense(LazySalaryPayment, 'form');

export const DoctorManagement = withSuspense(LazyDoctorManagement, 'table');
export const AddDoctor = withSuspense(LazyAddDoctor, 'form');
export const DeletedDoctors = withSuspense(LazyDeletedDoctors, 'table');
export const DoctorAttendance = withSuspense(LazyDoctorAttendance, 'table');
export const DoctorSalary = withSuspense(LazyDoctorSalary, 'form');
export const DoctorCategory = withSuspense(LazyDoctorCategory, 'table');

export const MedicineManagement = withSuspense(LazyMedicineManagement, 'table');
export const CategoryManagement = withSuspense(LazyCategoryManagement, 'table');
export const MedicineStock = withSuspense(LazyMedicineStock, 'table');
export const MedicineAccounts = withSuspense(LazyMedicineAccounts, 'table');

export const SupplierManagement = withSuspense(LazySupplierManagement, 'table');
export const GroceryManagement = withSuspense(LazyGroceryManagement, 'table');
export const GroceryCategories = withSuspense(LazyGroceryCategories, 'table');
export const GrocerySuppliers = withSuspense(LazyGrocerySuppliers, 'table');
export const GroceryStock = withSuspense(LazyGroceryStock, 'table');
export const GroceryAccounts = withSuspense(LazyGroceryAccounts, 'table');

export const GeneralManagement = withSuspense(LazyGeneralManagement, 'table');
export const GeneralCategories = withSuspense(LazyGeneralCategories, 'table');
export const GeneralSuppliers = withSuspense(LazyGeneralSuppliers, 'table');
export const GeneralStock = withSuspense(LazyGeneralStock, 'table');
export const GeneralAccounts = withSuspense(LazyGeneralAccounts, 'table');

export const AddUser = withSuspense(LazyAddUser, 'form');
export const UserManagement = withSuspense(LazyUserManagement, 'table');
export const AddRole = withSuspense(LazyAddRole, 'form');

export const AddLeadCategory = withSuspense(LazyAddLeadCategory, 'form');
export const LeadsList = withSuspense(LazyLeadsList, 'table');

export const Settings = withSuspense(LazySettings, 'page');
export const Administration = withSuspense(LazyAdministration, 'page');
export const StaffAdvance = withSuspense(LazyStaffAdvance, 'table');

export const NotFound = withSuspense(LazyNotFound, 'page');
export const Index = withSuspense(LazyIndex, 'page');
export const DoctorAdvance = withSuspense(LazyDoctorAdvance, 'table');
