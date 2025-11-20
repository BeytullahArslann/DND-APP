import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export const ErrorPage = () => {
  const error: any = useRouteError();
  const navigate = useNavigate();

  console.error(error);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl max-w-md w-full">
        <div className="flex justify-center mb-4 text-amber-500">
          <AlertTriangle size={64} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Bir Hata Oluştu!</h1>
        <p className="text-slate-400 mb-6">
          {error?.statusText || error?.message || "Beklenmedik bir hata ile karşılaştık."}
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors"
        >
          <Home className="mr-2" size={20} /> Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
};
