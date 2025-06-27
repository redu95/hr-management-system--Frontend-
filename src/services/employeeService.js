import { useQuery } from '@tanstack/react-query';

const fetchEmployees = async () => {
  const res = await fetch('/api/employees');
  return res.json();
};

export const useGetEmployees = () => {
  return useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });
};