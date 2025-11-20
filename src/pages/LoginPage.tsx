import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Dices, Sword, Shield, Scroll } from 'lucide-react';

export const LoginPage = () => {
  const { user, signInWithGoogle, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-amber-500">Yükleniyor...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 text-slate-800 animate-pulse"><Dices size={120} /></div>
      <div className="absolute bottom-10 right-10 text-slate-800 animate-pulse delay-700"><Sword size={120} /></div>
      <div className="absolute top-1/4 right-1/4 text-slate-800 animate-pulse delay-1000"><Shield size={80} /></div>
      <div className="absolute bottom-1/4 left-1/4 text-slate-800 animate-pulse delay-500"><Scroll size={80} /></div>

      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 relative z-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-slate-900 p-4 rounded-full border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
             <Dices className="w-16 h-16 text-amber-500" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-2">
          Zindan Ustası
        </h1>
        <p className="text-slate-400 mb-8">
          Maceralarını yönet, zarlarını at ve efsaneni yaz.
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full bg-white text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-3 hover:bg-slate-100 transition-colors shadow-lg"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Google ile Giriş Yap</span>
        </button>

        <div className="mt-6 text-xs text-slate-500">
            Giriş yaparak kullanım koşullarını kabul etmiş sayılırsınız.
        </div>
      </div>
    </div>
  );
};
