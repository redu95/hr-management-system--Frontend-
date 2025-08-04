import { useQuery } from '@tanstack/react-query';
import ApiService from './apiService';

const fetchEmployees = async () => {
  // Use ApiService.getEmployees which now fetches users and filters by role
  return await ApiService.getEmployees();
};

export const useGetEmployees = () => {
  return useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });
};