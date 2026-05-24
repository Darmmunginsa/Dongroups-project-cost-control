import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const baseNavItems = [
  { path: '/dashboard', label: 'ภาพรวม', icon: '📊' },
  { path: '/projects', label: 'Projects', icon: '📁' },
  { path: '/disbursements', label: 'เบิกจ่าย', icon: '💸' },
  { path: '/capital', label: 'เงินทุน', icon: '💰' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isAdmin = user?.role === 'admin';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = isAdmin
    ? [...baseNavItems, { path: '/logs', label: 'ประวัติ', icon: '📋' }, { path: '/settings', label: 'ตั้งค่า', icon: '⚙️' }]
    : baseNavItems;
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: 'var(--color-primary)' }}>P</div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">Project Cost</p>
            <p className="text-xs text-gray-400 leading-tight">Control</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={active ? { backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-text)' } : {}}
            >
              <span>{item.icon}</span>
              <span className={active ? '' : 'text-gray-600'}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-100">
        <Link to="/profile" onClick={closeSidebar} className="flex items-center gap-2 px-2 py-1.5 mb-1 rounded-lg hover:bg-gray-50 transition-colors group">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
            {(user?.displayName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{user?.displayName || user?.username}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
          <span className="text-gray-300 group-hover:text-gray-500 text-xs">✏️</span>
        </Link>
        {user?.role === 'admin' && (
          <Link to="/users" onClick={closeSidebar} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors ${location.pathname === '/users' ? 'bg-gray-50' : ''}`}>
            <span>👥</span> จัดการผู้ใช้
          </Link>
        )}
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors mt-1">
          <span>🚪</span> ออกจากระบบ
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg, #f0f5ff)' }}>

      {/* ===== DESKTOP Sidebar ===== */}
      <aside className="hidden sm:flex w-56 bg-white border-r border-gray-200 flex-col fixed h-full z-10">
        <SidebarContent />
      </aside>

      {/* ===== MOBILE Overlay ===== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeSidebar} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ===== MOBILE Top Bar ===== */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 flex items-center px-4 py-3 gap-3">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-600 p-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: 'var(--color-primary)' }}>P</div>
          <p className="text-sm font-semibold text-gray-800">Project Cost Control</p>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 sm:ml-56 min-h-screen pt-14 sm:pt-0">
        {children}
      </main>
    </div>
  );
}
