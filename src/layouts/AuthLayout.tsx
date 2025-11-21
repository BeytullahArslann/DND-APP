import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export const AuthLayout = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-amber-500">{t('common.loading')}</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Outlet />
    </div>
  );
};
