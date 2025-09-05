import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000/api';

async function testCertificatesAPI() {
  console.log('🧪 Testing Certificates API...\n');
  
  try {
    // Test 1: Get all certificates
    console.log('1️⃣ Testing GET /api/certificates...');
    const response = await fetch(`${API_URL}/certificates`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ GET /api/certificates successful');
      console.log(`📊 Found ${result.data?.length || 0} certificates`);
      if (result.data && result.data.length > 0) {
        console.log('📄 Sample certificate:', {
          id: result.data[0].id,
          certificateNumber: result.data[0].certificateNumber,
          patientName: result.data[0].patientName,
          certificateType: result.data[0].certificateType,
          status: result.data[0].status
        });
      }
    } else {
      console.log('❌ GET /api/certificates failed:', result);
    }
    
    console.log('\n2️⃣ Testing GET /api/certificates/stats/overview...');
    const statsResponse = await fetch(`${API_URL}/certificates/stats/overview`);
    const statsResult = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('✅ GET /api/certificates/stats/overview successful');
      console.log('📊 Certificate statistics:', statsResult.data);
    } else {
      console.log('❌ GET /api/certificates/stats/overview failed:', statsResult);
    }
    
    console.log('\n3️⃣ Testing POST /api/certificates (add new certificate)...');
    const newCertificate = {
      certificateNumber: 'CERT-TEST-001',
      patientId: 'P001',
      patientName: 'Test Patient',
      certificateType: 'Medical Certificate',
      issuedDate: '2024-12-05',
      validUntil: '2025-12-05',
      title: 'Test Certificate',
      description: 'This is a test certificate created by the API test script',
      doctorName: 'Dr. Test Doctor',
      status: 'Active',
      issuedBy: 'Test Hospital',
      notes: 'Test notes',
      createdBy: 'test-script'
    };
    
    const addResponse = await fetch(`${API_URL}/certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newCertificate)
    });
    
    const addResult = await addResponse.json();
    
    if (addResponse.ok) {
      console.log('✅ POST /api/certificates successful');
      console.log('📄 New certificate created with ID:', addResult.data?.id);
      console.log('🆔 Certificate number:', addResult.data?.certificateNumber);
      
      // Test 4: Get the newly created certificate
      const newCertId = addResult.data?.id;
      if (newCertId) {
        console.log('\n4️⃣ Testing GET /api/certificates/:id...');
        const getResponse = await fetch(`${API_URL}/certificates/${newCertId}`);
        const getResult = await getResponse.json();
        
        if (getResponse.ok) {
          console.log('✅ GET /api/certificates/:id successful');
          console.log('📄 Retrieved certificate:', {
            id: getResult.data.id,
            certificateNumber: getResult.data.certificateNumber,
            title: getResult.data.title,
            status: getResult.data.status
          });
        } else {
          console.log('❌ GET /api/certificates/:id failed:', getResult);
        }
        
        // Test 5: Update the certificate
        console.log('\n5️⃣ Testing PUT /api/certificates/:id...');
        const updateData = {
          ...newCertificate,
          title: 'Updated Test Certificate',
          description: 'This certificate has been updated by the API test script',
          updatedBy: 'test-script'
        };
        
        const updateResponse = await fetch(`${API_URL}/certificates/${newCertId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        const updateResult = await updateResponse.json();
        
        if (updateResponse.ok) {
          console.log('✅ PUT /api/certificates/:id successful');
          console.log('📝 Certificate updated successfully');
        } else {
          console.log('❌ PUT /api/certificates/:id failed:', updateResult);
        }
        
        // Test 6: Delete the test certificate
        console.log('\n6️⃣ Testing DELETE /api/certificates/:id...');
        const deleteResponse = await fetch(`${API_URL}/certificates/${newCertId}`, {
          method: 'DELETE'
        });
        
        const deleteResult = await deleteResponse.json();
        
        if (deleteResponse.ok) {
          console.log('✅ DELETE /api/certificates/:id successful');
          console.log('🗑️ Test certificate deleted successfully');
        } else {
          console.log('❌ DELETE /api/certificates/:id failed:', deleteResult);
        }
      }
    } else {
      console.log('❌ POST /api/certificates failed:', addResult);
    }
    
    console.log('\n🎉 Certificates API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testCertificatesAPI();
