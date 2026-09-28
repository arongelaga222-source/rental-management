'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Squares2X2Icon,
  UsersIcon,
  ShoppingCartIcon,
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  TruckIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Squares2X2Icon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Rentals', href: '/rentals', icon: ShoppingCartIcon },
  { name: 'Inventory', href: '/inventory', icon: ArchiveBoxIcon },
  { name: 'Payments', href: '/payments', icon: CurrencyDollarIcon },
  { name: 'Returns', href: '/returns', icon: TruckIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Audit Log', href: '/audit', icon: DocumentTextIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col h-screen shrink-0">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-white tracking-tight">RentalMS</div>
            <div className="text-[11px] text-slate-400 font-medium">Enterprise Suite</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Status footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">System Admin</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Admin Online
            </p>
          </div>
        </div>
        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all border border-slate-800"
        >
          <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
          Switch User / Sign Out
        </Link>
      </div>
    </aside>
  );
}