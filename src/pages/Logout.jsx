import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Add logout logic here (e.g., clear auth tokens)
    navigate('/login');
  }, [navigate]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Logging out...</h2>
    </div>
  );
};

export default Logout;
