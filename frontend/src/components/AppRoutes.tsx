import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import lazy-loaded components
import {
  Dashboard,
  AddPatient,
  PatientList,
  DeletedPatients,
  PatientAttendance,
  PatientHistory,
  PatientPaymentFees,
  PatientBiodata,
  PatientFullyHistory,
  TestRoute,
  TestReportAmountPage,
  PatientMedicalRecord,
  MinimalCertificateTest,
  StaffManagement,
  DeletedStaff,
  AddStaff,
  StaffCategoryManagement,
  AttendanceManagement,
  SalaryPayment,
  DoctorManagement,
  AddDoctor,
  DeletedDoctors,
  DoctorAttendance,
  DoctorSalary,
  DoctorCategory,
  MedicineManagement,
  CategoryManagement,
  MedicineStock,
  MedicineAccounts,
  SupplierManagement,
  GroceryManagement,
  GroceryCategories,
  GrocerySuppliers,
  GroceryStock,
  GroceryAccounts,
  GeneralManagement,
  GeneralCategories,
  GeneralSuppliers,
  GeneralStock,
  GeneralAccounts,
  AddUser,
  UserManagement,
  AddRole,
  AddLeadCategory,
  LeadsList,
  Settings,
  Administration,
  StaffAdvance,
  DoctorAdvance
} from '@/components/LazyComponents';

interface AppRoutesProps {
  user: { name: string; role: string; email: string; permissions: string[] };
}

const AppRoutes: React.FC<AppRoutesProps> = ({ user }) => {
  // Note: Individual components now handle their own page titles
  // usePageTitle() is called in each component for better control

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard user={user} />} />
      
      {/* Patient Management Routes */}
      <Route path="/patients/details/:patientId" element={<PatientBiodata />} />
      <Route path="/patients/fully-history/:patientId" element={<PatientFullyHistory />} />
      <Route path="/test/:testId" element={<TestRoute />} />
      <Route path="/patients/add" element={<AddPatient />} />
      <Route path="/patients/list" element={<PatientList />} />
      <Route path="/patients/test-report-amount" element={<TestReportAmountPage />} />
      <Route path="/patients/deleted" element={<DeletedPatients />} />
      <Route path="/patients/attendance" element={<PatientAttendance />} />
      <Route path="/patients/history" element={<PatientHistory />} />
      <Route path="/patients/payment-fees" element={<PatientPaymentFees />} />
      <Route path="/patients/medical-records" element={<PatientMedicalRecord />} />
      
      {/* Staff Management Routes */}
      <Route path="/management/add-doctor" element={<AddDoctor />} />
      <Route path="/management/deleted-doctors" element={<DeletedDoctors />} />
      <Route path="/management/doctor-attendance" element={<DoctorAttendance />} />
      <Route path="/management/doctor-salary" element={<DoctorSalary />} />
      <Route path="/management/doctor-advance" element={<DoctorAdvance />} />
      <Route path="/management/doctor-category" element={<DoctorCategory />} />
      <Route path="/management/staff-category" element={<StaffCategoryManagement />} />
      <Route path="/management/add-staff" element={<AddStaff />} />
      <Route path="/management/staff" element={<StaffManagement />} />
      <Route path="/management/deleted-staff" element={<DeletedStaff />} />
      <Route path="/management/doctors" element={<DoctorManagement />} />
      <Route path="/management/suppliers" element={<SupplierManagement />} />
      <Route path="/management/grocery" element={<GroceryManagement />} />
      <Route path="/management/attendance" element={<AttendanceManagement />} />
      <Route path="/management/salary-payment" element={<SalaryPayment />} />
      <Route path="/management/staff-advance" element={<StaffAdvance />} />
      
      {/* Medicine Management Routes */}
      <Route path="/medicine/management" element={<MedicineManagement />} />
      <Route path="/medicine/categories" element={<CategoryManagement />} />
      <Route path="/medicine/suppliers" element={<SupplierManagement />} />
      <Route path="/medicine/stock" element={<MedicineStock />} />
      <Route path="/medicine/accounts" element={<MedicineAccounts />} />
      
      {/* Grocery Management Routes */}
      <Route path="/grocery/categories" element={<GroceryCategories />} />
      <Route path="/grocery/suppliers" element={<GrocerySuppliers />} />
      <Route path="/grocery/stock" element={<GroceryStock />} />
      <Route path="/grocery/accounts" element={<GroceryAccounts />} />
      
      {/* General Management Routes */}
      <Route path="/general/management" element={<GeneralManagement />} />
      <Route path="/general/add" element={<GeneralManagement />} />
      <Route path="/general/categories" element={<GeneralCategories />} />
      <Route path="/general/suppliers" element={<GeneralSuppliers />} />
      <Route path="/general/stock" element={<GeneralStock />} />
      <Route path="/general/accounts" element={<GeneralAccounts />} />
      
      {/* Lead Management Routes */}
      <Route path="/leads/list" element={<LeadsList />} />
      <Route path="/leads/add-category" element={<AddLeadCategory />} />
      
      {/* User Management Routes */}
      <Route path="/users/add" element={<AddUser />} />
      <Route path="/users/list" element={<UserManagement />} />
      <Route path="/users/add-role" element={<AddRole />} />
      <Route path="/management/user-role/add" element={<AddRole />} />
      <Route path="/management/user-role/roles" element={<UserManagement />} />
      
      {/* Administration Route */}
      <Route path="/administration" element={<Administration />} />
      
      {/* Settings Routes */}
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings/certificates" element={<MinimalCertificateTest />} />
    </Routes>
  );
};

export default AppRoutes;
