import axios from 'axios';

// Ensure the variable starts with VITE_ if you are using Vite
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`, 
  withCredentials: true,
});