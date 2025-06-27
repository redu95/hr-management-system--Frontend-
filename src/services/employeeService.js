import { useQuery } from '@tanstack/react-query';

const fetchEmployees = async () => {
  const response = await fetch('/api/employees');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const useGetEmployees = () => {
  return useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });
};