import { prisma } from '@/lib/prisma';
import {
  Cog6ToothIcon,
  ServerIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const users = await prisma.user.findMany({
    orderBy: { role: 'asc' },
  });

  const [customerCount, productCount, rentalCount, paymentCount] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count(),
    prisma.rental.count(),
    prisma.payment.count(),
  ]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Account Settings</h1>
        <p className="text-xs text-slate-500">Configure business policies, staff user credentials, and database parameters</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Profile */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Cog6ToothIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Rental Business Configuration</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Company / Branch Name</label>
              <input
                type="text"
                defaultValue="Apex Cine & Heavy Equipment Rentals"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Default Currency</label>
                <select
                  defaultValue="PHP"
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 font-medium bg-slate-50 cursor-not-allowed"
                >
                  <option value="PHP">PHP (₱) - Philippine Peso</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  defaultValue="0.0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Default Deposit Policy</label>
              <input
                type="text"
                defaultValue="50% security deposit collected on contract confirmation"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <button
              type="button"
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs"
            >
              Save Configuration
            </button>
          </div>
        </div>

        {/* Database Health & Metrics */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ServerIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Database & Infrastructure</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900">Database Engine</span>
                <p className="text-[11px] text-emerald-700">SQLite Local Engine (dev.db)</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                ONLINE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Customers</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{customerCount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Products</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{productCount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Rentals</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{rentalCount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Payments</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{paymentCount}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Production upgrades can connect to PostgreSQL by specifying DATABASE_URL in your .env configuration.
            </p>
          </div>
        </div>
      </div>

      {/* Staff Accounts Management */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Staff & Operator Accounts</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{users.length} registered user(s)</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {users.map((u) => (
            <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{u.name}</p>
                  <p className="text-slate-400 text-[11px]">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    u.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {u.role}
                </span>
                <span className="text-[11px] text-slate-400">
                  Added {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
