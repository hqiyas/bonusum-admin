'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',  icon: '📊' },
  { href: '/companies',  label: 'Şirkətlər',  icon: '🏢' },
  { href: '/licenses',   label: 'Lisenziyalar', icon: '🔑' },
  { href: '/vendors',    label: 'Vendorlar',   icon: '🏪' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user,   setUser]   = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('bonusum_admin_token');
    if (!token) { router.push('/auth/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch {
      router.push('/auth/login');
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('bonusum_admin_token');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1a2e] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <span className="text-xl">🎁</span>
            </div>
            <div>
              <p className="font-bold text-white text-sm">Bonusum</p>
              <p className="text-white/40 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${pathname === n.href || pathname.startsWith(n.href + '/')
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:bg-white/10 hover:text-white'}`}>
              <span>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-xs font-bold">
              B
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">Bonusum Admin</p>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full text-left text-xs text-white/40 hover:text-white/70 transition-all px-1">
            Çıxış →
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}