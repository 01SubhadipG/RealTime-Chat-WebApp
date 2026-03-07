import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`, // This will now use Render in production
  withCredentials: true,
});