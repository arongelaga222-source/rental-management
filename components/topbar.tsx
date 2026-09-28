'use client';

import { BellIcon, MagnifyingGlassIcon, UserCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Topbar() {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/customers')) return 'Customer Directory';
    if (path.startsWith('/rentals')) return 'Rental Operations';
    if (path.startsWith('/inventory')) return 'Inventory & Equipment';
    if (path.startsWith('/payments')) return 'Financial Transactions';
    if (path.startsWith('/returns')) return 'Return Processing';
    if (path.startsWith('/reports')) return 'Analytics & Reports';
    if (path.startsWith('/audit')) return 'Security Audit Trail';
    if (path.startsWith('/settings')) return 'System Settings';
    if (path.startsWith('/auth')) return 'Authentication';
    return 'Rental Management';
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{getPageTitle(pathname)}</h2>
          <p className="text-xs text-slate-500 hidden sm:block">Real-time equipment tracking and transactions</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/rentals?new=true"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            New Rental
          </Link>

          <div className="relative hidden md:block">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-56 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700 transition-all"
            />
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <button
            type="button"
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full"></span>
          </button>

          <Link
            href="/settings"
            className="flex items-center gap-2 p-1 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
          >
            <UserCircleIcon className="h-7 w-7 text-indigo-600" />
            <span className="text-xs font-medium text-slate-700 hidden lg:inline">Admin User</span>
          </Link>
        </div>
      </div>
    </header>
  );
}