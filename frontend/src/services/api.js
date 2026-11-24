import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = async () => {
  const response = await apiClient.get('/');
  return response.data;
};

export const calculateMeetingPoint = async (payload) => {
  const response = await apiClient.post('/api/calculate-meeting-point', payload);
  return response.data;
};
