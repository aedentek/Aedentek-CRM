// Route preloader utility
export class RoutePreloader {
  private static preloadedRoutes = new Set<string>();
  
  // Map route paths to their lazy components for preloading
  private static routeComponents: Record<string, () => Promise<any>> = {
    '/dashboard': () => import('@/components/dashboard/Dashboard'),
    '/patients/add': () => import('@/components/patients/AddPatient'),
    '/patients/list': () => import('@/components/patients/PatientList'),
    '/patients/deleted': () => import('@/components/patients/DeletedPatients'),
    '/patients/attendance': () => import('@/components/patients/PatientAttendance'),
    '/patients/history': () => import('@/components/patients/PatientHistory'),
    '/patients/payment-fees': () => import('@/components/patients/PatientPaymentFees'),
    '/patients/medical-records': () => import('@/components/patients/PatientMedicalRecord'),
    
    '/management/staff': () => import('@/components/management/StaffManagement'),
    '/management/add-staff': () => import('@/components/management/AddStaff'),
    '/management/deleted-staff': () => import('@/components/management/DeletedStaff'),
    '/management/staff-category': () => import('@/components/management/StaffCategory'),
    '/management/attendance': () => import('@/components/management/AttendanceManagement'),
    '/management/salary-payment': () => import('@/components/management/SalaryPayment'),
    
    '/management/doctors': () => import('@/components/management/DoctorManagement'),
    '/management/add-doctor': () => import('@/components/management/AddDoctor'),
    '/management/deleted-doctors': () => import('@/components/management/DeletedDoctors'),
    '/management/doctor-attendance': () => import('@/components/management/DoctorAttendance'),
    '/management/doctor-salary': () => import('@/components/management/DoctorSalary'),
    '/management/doctor-category': () => import('@/components/management/DoctorCategory'),
    
    '/medicine/management': () => import('@/components/management/MedicineManagement'),
    '/medicine/categories': () => import('@/components/management/MedicineCategories'),
    '/medicine/stock': () => import('@/components/management/MedicineStock'),
    '/medicine/accounts': () => import('@/components/management/MedicineAccounts'),
    
    '/grocery/categories': () => import('@/components/management/GroceryCategories'),
    '/grocery/suppliers': () => import('@/components/management/GrocerySuppliers'),
    '/grocery/stock': () => import('@/components/management/GroceryStock'),
    '/grocery/accounts': () => import('@/components/management/GroceryAccounts'),
    
    '/general/management': () => import('@/components/management/GeneralManagement'),
    '/general/categories': () => import('@/components/management/GeneralCategories'),
    '/general/suppliers': () => import('@/components/management/GeneralSuppliers'),
    '/general/stock': () => import('@/components/management/GeneralStock'),
    '/general/accounts': () => import('@/components/management/GeneralAccounts'),
    
    '/users/add': () => import('@/components/management/AddUser'),
    '/users/list': () => import('@/components/management/UserManagement'),
    '/users/add-role': () => import('@/components/management/AddRole'),
    
    '/leads/list': () => import('@/components/leads/LeadsList'),
    '/leads/add-category': () => import('@/components/leads/AddLeadCategory'),
    
    '/settings': () => import('@/components/settings/Settings'),
    '/administration': () => import('@/components/Administration/Administration'),
  };
  
  static preloadRoute(path: string): void {
    if (this.preloadedRoutes.has(path)) {
      return; // Already preloaded
    }
    
    const componentLoader = this.routeComponents[path];
    if (componentLoader) {
      this.preloadedRoutes.add(path);
      componentLoader().catch((error) => {
        console.warn(`Failed to preload route ${path}:`, error);
        this.preloadedRoutes.delete(path); // Remove from cache on error
      });
    }
  }
  
  static preloadRoutes(paths: string[]): void {
    paths.forEach(path => this.preloadRoute(path));
  }
  
  // Preload routes based on current route context
  static preloadRelatedRoutes(currentPath: string): void {
    if (currentPath.startsWith('/patients')) {
      this.preloadRoutes([
        '/patients/list',
        '/patients/add',
        '/patients/history',
        '/patients/attendance'
      ]);
    } else if (currentPath.startsWith('/management')) {
      this.preloadRoutes([
        '/management/staff',
        '/management/doctors',
        '/management/attendance'
      ]);
    } else if (currentPath.startsWith('/medicine')) {
      this.preloadRoutes([
        '/medicine/management',
        '/medicine/categories',
        '/medicine/stock'
      ]);
    }
  }
  
  // Preload critical routes on app startup
  static preloadCriticalRoutes(): void {
    this.preloadRoutes([
      '/dashboard',
      '/patients/list',
      '/management/staff'
    ]);
  }
}

// Hook for using route preloader
export const useRoutePreloader = () => {
  return {
    preloadRoute: RoutePreloader.preloadRoute.bind(RoutePreloader),
    preloadRoutes: RoutePreloader.preloadRoutes.bind(RoutePreloader),
    preloadRelatedRoutes: RoutePreloader.preloadRelatedRoutes.bind(RoutePreloader),
  };
};
