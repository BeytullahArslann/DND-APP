import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardPage } from './pages/DashboardPage';
import { RoomPage } from './pages/RoomPage';
import { ErrorPage } from './pages/ErrorPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-white p-10">Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '', element: <LoginPage /> }
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    errorElement: <ErrorPage />,
    children: [
      { path: '', element: <DashboardPage /> },
      { path: 'room/:roomId', element: <RoomPage /> }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
], {
  basename: import.meta.env.BASE_URL
});

export default function App() {
  return (
      <RouterProvider router={router} />
  );
}
