import axios from 'axios';

// Environment variable or default API URL
const API_URL = process.env.NEXT_PUBLIC_AUTH_API || '';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export default axiosInstance; 