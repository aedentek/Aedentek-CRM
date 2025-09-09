class CertificateService {
  static baseUrl = import.meta.env.VITE_API_URL;

  static async getAllCertificates() {
    try {
      console.log('🔍 Fetching all certificates...');
      const response = await fetch(`${this.baseUrl}/certificates`);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch certificates: ${error}`);
      }
      const result = await response.json();
      console.log(`✅ Fetched ${result.data?.length || 0} certificates`);
      return result.data || [];
    } catch (error) {
      console.error('❌ Error fetching certificates:', error);
      throw error;
    }
  }

  static async getCertificateById(id: string) {
    try {
      console.log(`🔍 Fetching certificate with ID: ${id}`);
      const response = await fetch(`${this.baseUrl}/certificates/${id}`);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch certificate: ${error}`);
      }
      const result = await response.json();
      console.log(`✅ Fetched certificate: ${result.data?.certificateNumber}`);
      return result.data;
    } catch (error) {
      console.error('❌ Error fetching certificate:', error);
      throw error;
    }
  }

  static async getCertificatesByPatientId(patientId: string) {
    try {
      console.log(`🔍 Fetching certificates for patient: ${patientId}`);
      const response = await fetch(`${this.baseUrl}/certificates/patient/${patientId}`);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch patient certificates: ${error}`);
      }
      const result = await response.json();
      console.log(`✅ Fetched ${result.data?.length || 0} certificates for patient ${patientId}`);
      return result.data || [];
    } catch (error) {
      console.error('❌ Error fetching patient certificates:', error);
      throw error;
    }
  }

  static async addCertificate(data: any) {
    try {
      console.log('📝 Adding new certificate...');
      console.log('Certificate data:', data);
      
      const response = await fetch(`${this.baseUrl}/certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to add certificate');
      }
      
      const result = await response.json();
      console.log(`✅ Certificate added successfully: ${result.data?.certificateNumber}`);
      return result.data;
    } catch (error) {
      console.error('❌ Error adding certificate:', error);
      throw error;
    }
  }

  static async updateCertificate(id: string, data: any) {
    try {
      console.log(`📝 Updating certificate with ID: ${id}`);
      console.log('Update data:', data);
      
      const response = await fetch(`${this.baseUrl}/certificates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to update certificate');
      }
      
      const result = await response.json();
      console.log(`✅ Certificate updated successfully: ID ${id}`);
      return result.data;
    } catch (error) {
      console.error('❌ Error updating certificate:', error);
      throw error;
    }
  }

  static async deleteCertificate(id: string) {
    try {
      console.log(`🗑️ Deleting certificate with ID: ${id}`);
      
      const response = await fetch(`${this.baseUrl}/certificates/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to delete certificate');
      }
      
      console.log(`✅ Certificate deleted successfully: ID ${id}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting certificate:', error);
      throw error;
    }
  }

  static async getCertificateStats() {
    try {
      console.log('📊 Fetching certificate statistics...');
      const response = await fetch(`${this.baseUrl}/certificates/stats/overview`);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch certificate stats: ${error}`);
      }
      const result = await response.json();
      console.log('✅ Fetched certificate statistics');
      return result.data;
    } catch (error) {
      console.error('❌ Error fetching certificate statistics:', error);
      throw error;
    }
  }

  // Utility methods for certificate management
  static getCertificateTypeOptions() {
    return [
      { value: 'Medical Certificate', label: 'Medical Certificate' },
      { value: 'Fitness Certificate', label: 'Fitness Certificate' },
      { value: 'Vaccination Certificate', label: 'Vaccination Certificate' },
      { value: 'Test Report Certificate', label: 'Test Report Certificate' },
      { value: 'Discharge Certificate', label: 'Discharge Certificate' },
      { value: 'Other', label: 'Other' }
    ];
  }

  static getStatusOptions() {
    return [
      { value: 'Active', label: 'Active' },
      { value: 'Expired', label: 'Expired' },
      { value: 'Revoked', label: 'Revoked' },
      { value: 'Draft', label: 'Draft' }
    ];
  }

  static getTemplateOptions() {
    return [
      { value: 'standard', label: 'Standard Template' },
      { value: 'medical', label: 'Medical Template' },
      { value: 'fitness', label: 'Fitness Template' },
      { value: 'vaccination', label: 'Vaccination Template' }
    ];
  }

  static generateCertificateNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `CERT-${year}${month}-${timestamp}`;
  }

  static isExpired(validUntil: string | null) {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  }

  static getDaysUntilExpiry(validUntil: string | null) {
    if (!validUntil) return null;
    const expiryDate = new Date(validUntil);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export default CertificateService;
