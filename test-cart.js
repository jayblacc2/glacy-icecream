const axios = require('axios');

async function test() {
  try {
    // Login
    const loginRes = await axios.post('http://localhost:4000/api/v1/users/login', {
      email: 'test@example.com',
      password: 'testpass123'
    }, {
      withCredentials: true
    });
    
    console.log('Login:', loginRes.data);
    
    if (loginRes.data.success) {
      // Get cart
      const cartRes = await axios.get('http://localhost:4000/api/v1/cart', {
        withCredentials: true
      });
      console.log('Cart:', cartRes.data);
    }
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
  }
}

test();
