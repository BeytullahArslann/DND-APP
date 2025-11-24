import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { usingDemoConfig } from '../lib/firebase';
import { LayoutDashboard, Book, Sparkles, Sword, Users, Home, LogOut } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      if (usingDemoConfig) {
          setIsAdmin(true);
          setChecking(false);
          return;
      }

      if (user) {
        const profile = await userService.getUserProfile(user.uid);
        setIsAdmin(!!profile?.isAdmin);
      } else {
        setIsAdmin(false);
      }
      setChecking(false);
    };
    checkAdmin();
  }, [user]);

  if (loading || checking) {
    return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Yükleniyor...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/rules', icon: <Book size={20} />, label: 'Kurallar' },
    { path: '/admin/backgrounds', icon: <Book size={20} />, label: 'Geçmişler' },
    { path: '/admin/spells', icon: <Sparkles size={20} />, label: 'Büyüler' },
    { path: '/admin/weapons', icon: <Sword size={20} />, label: 'Silahlar' },
    { path: '/admin/armors', icon: <Sword size={20} />, label: 'Zırhlar' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Kullanıcılar' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded">
            <LayoutDashboard size={20} />
          </div>
          <span className="font-bold text-lg">Admin Panel</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <Home size={20} />
            <span>Siteye Dön</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-900 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
