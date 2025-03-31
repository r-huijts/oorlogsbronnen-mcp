import axios from 'axios';

async function testDirectApi() {
  const url = 'https://rest.spinque.com/4/netwerkoorlogsbronnen/api/in10/e/integrated_search/p/topic/roermond/q/class:FILTER/p/value/1.0(http%3A%2F%2Fschema.org%2FPerson)/results,count?count=5&offset=0&config=production';
  
  try {
    console.log('Making request to:', url);
    const response = await axios.get(url);
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('Error:', error);
    }
  }
}

testDirectApi(); 