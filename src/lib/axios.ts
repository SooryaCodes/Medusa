import axios from 'axios';

// Environment variable or default API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.65.247:8080/api';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export default axiosInstance; 