import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardPage } from './pages/DashboardPage';
import { RoomPage } from './pages/RoomPage';
import GameRulesPage from './pages/GameRulesPage';
import { ErrorPage } from './pages/ErrorPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import RulesEditor from './pages/admin/RulesEditor';
import BackgroundsEditor from './pages/admin/BackgroundsEditor';
import SpellsEditor from './pages/admin/SpellsEditor';
import WeaponsEditor from './pages/admin/WeaponsEditor';
import UsersPage from './pages/admin/UsersPage';

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
    path: '/rules',
    element: <MainLayout />,
    children: [
      { path: '', element: <GameRulesPage /> }
    ]
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '', element: <AdminDashboard /> },
      { path: 'rules', element: <RulesEditor /> },
      { path: 'backgrounds', element: <BackgroundsEditor /> },
      { path: 'spells', element: <SpellsEditor /> },
      { path: 'weapons', element: <WeaponsEditor /> },
      { path: 'users', element: <UsersPage /> },
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
