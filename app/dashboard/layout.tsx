'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Building2, Key, Store, Tag, LogOut, ChevronRight } from 'lucide-react';

const NAV = [
  { href: '/dashboard',                   label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/dashboard/companies',         label: 'Şirkətlər',    icon: Building2       },
  { href: '/dashboard/licenses',          label: 'Lisenziyalar', icon: Key             },
  { href: '/dashboard/vendors',           label: 'Vendorlar',    icon: Store           },
  { href: '/dashboard/discounts',         label: 'Endirimlər',   icon: Tag             },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('bonusum_admin_token');
    if (!token) { router.push('/auth/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch { router.push('/auth/login'); }
  }, []);

  const logout = () => {
    localStorage.removeItem('bonusum_admin_token');
    router.push('/auth/login');
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside style={{ width: 200 }}
        className="bg-[#0F172A] flex flex-col fixed h-full z-10">

        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-sm">🎁</div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">Bonusum</p>
              <p className="text-white/35 text-xs">Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV.map(n => {
            const active = isActive(n.href);
            return (
              <Link key={n.href} href={n.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all
                  ${active
                    ? 'bg-white/12 text-white'
                    : 'text-white/45 hover:text-white/80 hover:bg-white/6'}`}>
                <n.icon size={15} className={active ? 'text-white' : 'text-white/45'} />
                {n.label}
                {active && <ChevronRight size={12} className="ml-auto text-white/40" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-2 py-3 border-t border-white/8">
          <div className="px-3 py-2 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.[0] || 'B'}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
                <p className="text-white/35 text-[11px] truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-white/35 hover:text-white/60 hover:bg-white/5 rounded-lg transition-all">
            <LogOut size={13} /> Çıxış
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-screen" style={{ marginLeft: 200 }}>
        <div className="p-6 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}