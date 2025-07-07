import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const memoryToken = { value: null };

const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('accessToken') || memoryToken.value;

  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default RequireAuth;


