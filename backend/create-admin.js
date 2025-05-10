const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    const response = await axios.post(`${API_URL}/users/register`, {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

createAdmin(); 