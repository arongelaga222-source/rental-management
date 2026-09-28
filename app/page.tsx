import Link from 'next/link';
import {
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';
import { getDashboardStats } from '@/lib/actions/reports';
import { serializeData } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const result = await getDashboardStats();
  const stats = serializeData(result.data);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Rental Operations Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back to RentalMS
            </h1>
            <p className="text-indigo-100 text-sm mt-1 max-w-xl">
              Track equipment reservations, real-time fleet availability, customer bookings, and financial settlements.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/rentals"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-sm rounded-xl shadow-md transition-all"
            >
              <PlusIcon className="h-4 w-4" />
              New Rental
            </Link>
            <Link
              href="/customers"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-800/60 hover:bg-indigo-800/80 text-white font-medium text-sm rounded-xl border border-white/20 transition-all"
            >
              <UsersIcon className="h-4 w-4" />
              Add Customer
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Rentals</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingCartIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.activeRentals}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <ArrowTrendingUpIcon className="h-3.5 w-3.5 mr-0.5 inline" /> In Field
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Currently rented out equipment</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today&apos;s Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CurrencyDollarIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              ₱{stats.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-medium text-emerald-600">Settled</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Cash and online payments today</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Bookings</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <ClockIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.pendingRentals}</span>
            <span className="text-xs font-medium text-amber-600">Awaiting Dispatch</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Reserved orders needing fulfillment</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
              <UsersIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalCustomers}</span>
            <span className="text-xs font-medium text-slate-500">Registered</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Active client accounts in CRM</p>
        </div>
      </div>

      {/* Main Content Sections: Recent Rentals & Quick Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Rentals */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Recent Rental Orders</h2>
              <p className="text-xs text-slate-500">Latest reservations and active dispatches</p>
            </div>
            <Link
              href="/rentals"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View all
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentRentals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No rental bookings recorded yet.
              </div>
            ) : (
              stats.recentRentals.map((rental) => (
                <div key={rental.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {rental.rentalNumber.split('-')[1]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800">{rental.rentalNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rental.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rental.status === 'CONFIRMED'
                              ? 'bg-blue-100 text-blue-800'
                              : rental.status === 'COMPLETED'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rental.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {rental.customer?.fullName} • {rental.rentalItems?.length || 0} item(s)
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">₱{rental.totalAmount.toFixed(2)}</p>
                    <p className={`text-[11px] font-medium ${rental.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {rental.balance > 0 ? `Due: ₱${rental.balance.toFixed(2)}` : 'Paid in Full'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/rentals"
                className="p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex flex-col items-center justify-center text-center transition-all group"
              >
                <ShoppingCartIcon className="h-6 w-6 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-700">Book Rental</span>
              </Link>
              <Link
                href="/payments"
                className="p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 flex flex-col items-center justify-center text-center transition-all group"
              >
                <CurrencyDollarIcon className="h-6 w-6 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-700">Record Pay</span>
              </Link>
              <Link
                href="/returns"
                className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center transition-all group"
              >
                <CheckCircleIcon className="h-6 w-6 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-700">Log Return</span>
              </Link>
              <Link
                href="/inventory"
                className="p-3 rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 flex flex-col items-center justify-center text-center transition-all group"
              >
                <ArchiveBoxIcon className="h-6 w-6 text-violet-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-700">Inventory</span>
              </Link>
            </div>
          </div>

          {/* Recent Audit Logs */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
              <Link href="/audit" className="text-xs text-indigo-600 font-semibold hover:underline">
                Audit log
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentAuditLogs.length === 0 ? (
                <p className="text-xs text-slate-400">No activity logged.</p>
              ) : (
                stats.recentAuditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-slate-400 text-[10px]">
                        By {log.performedBy.name} • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}