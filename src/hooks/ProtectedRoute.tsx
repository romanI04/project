import { Navigate } from 'react-router-dom';
import { useSession } from './use-session';
import React from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    // Optional: Render a loading spinner while session is being checked
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute; 