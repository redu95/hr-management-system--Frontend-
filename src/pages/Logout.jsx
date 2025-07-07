import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memoryToken } from '../components/common/RequireAuth';

const Logout = () => {
  console.log('Logout component rendered');
  const navigate = useNavigate();

  useEffect(() => {
    // Clear authentication tokens and any other user data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    memoryToken.value = null; // Clear in-memory token

    // Redirect to login page after clearing
    navigate('/login');
  }, [navigate]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Logging out...</h2>
    </div>
  );
};

export default Logout;
