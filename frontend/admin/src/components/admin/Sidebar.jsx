import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Tag,
  LogOut,
  GraduationCap,
  Bell,
  Newspaper
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function Sidebar() {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin-login';
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/orders',    label: 'Orders',    icon: ShoppingBag },
    { path: '/admin/pm-users',  label: 'PM Users',  icon: GraduationCap },
    { path: '/admin/affiliates',label: 'Affiliates',icon: Users },
    { path: '/admin/coupons',   label: 'Coupons',   icon: Tag },
    { path: '/admin/news',      label: 'News Updates', icon: Bell },
    { path: '/admin/blogs',     label: 'Blog Posts',   icon: Newspaper },
  ];

  return (
    <div style={{
      width: '240px',
      height: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0, top: 0,
      zIndex: 100,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      padding: '0',
      overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{
        padding: '28px 20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <div style={{
          width: '38px', height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99,102,241,0.35)'
        }}>
          <GraduationCap size={20} color="white" />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', letterSpacing: '-0.3px' }}>DC ADMIN</div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>Marketing Suite v2.0</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', color: '#334155', letterSpacing: '1px', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px' }}>
          Main Menu
        </div>
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} style={{ marginBottom: '4px' }}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    color: isActive ? '#fff' : '#64748b',
                    borderRadius: '10px',
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(59,130,246,0.25), rgba(99,102,241,0.15))'
                      : 'transparent',
                    border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    fontWeight: isActive ? '600' : '400',
                    fontSize: '14px',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#e2e8f0';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#64748b';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      left: '12px',
                      width: '3px', height: '20px',
                      background: 'linear-gradient(180deg, #3b82f6, #6366f1)',
                      borderRadius: '999px',
                      marginLeft: '-12px'
                    }} />
                  )}
                  <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                    flexShrink: 0
                  }}>
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', width: '100%', borderRadius: '10px',
            color: '#ef4444', fontSize: '14px', fontWeight: '500',
            transition: 'all 0.18s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(239,68,68,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <LogOut size={16} />
          </div>
          Sign Out
        </button>
      </div>
    </div>
  );
}
