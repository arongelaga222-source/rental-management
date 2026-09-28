import { getReportsData } from '@/lib/actions/reports';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  FireIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const res = await getReportsData();
  const data = res.data;

  if (!data) {
    return <div className="p-8 text-center text-slate-500">Failed to load reports data.</div>;
  }

  const { totalRevenue, totalRentalVolume, methodTotals, statusCounts, topProducts, categories } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Business Intelligence & Reports</h1>
        <p className="text-xs text-slate-500">Financial revenue breakdown, fleet utilization, and top performing assets</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CurrencyDollarIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              ₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Lifetime payments across all channels</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Rentals Booked</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <ShoppingCartIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalRentalVolume}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowTrendingUpIcon className="h-3.5 w-3.5 mr-0.5 inline" /> Active Fleet
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Rental transactions registered</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Order Value</span>
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
              <ChartBarIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              ₱{totalRentalVolume > 0 ? (totalRevenue / totalRentalVolume).toFixed(2) : '0.00'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Revenue per equipment agreement</p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5 text-indigo-600" />
            Payment Method Breakdown
          </h3>
          <div className="space-y-4">
            {Object.keys(methodTotals).length === 0 ? (
              <p className="text-xs text-slate-400">No payment data recorded.</p>
            ) : (
              Object.entries(methodTotals).map(([method, amount]) => {
                const percent = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                return (
                  <div key={method} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{method.replace('_', ' ')}</span>
                      <span className="text-slate-900 font-bold">₱{amount.toFixed(2)} ({percent.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Rental Status Distribution */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5 text-indigo-600" />
            Rental Orders by Workflow Status
          </h3>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percent = totalRentalVolume > 0 ? (count / totalRentalVolume) * 100 : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{status}</span>
                    <span className="text-slate-900">{count} order(s)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        status === 'ACTIVE'
                          ? 'bg-emerald-500'
                          : status === 'CONFIRMED'
                          ? 'bg-blue-500'
                          : status === 'COMPLETED'
                          ? 'bg-slate-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Rented Equipment Leaderboard */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-amber-500" />
            Top Performing Gear & Assets
          </h3>
          <span className="text-xs text-slate-500">Ranked by rental bookings</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Equipment</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Units Rented Out</th>
                <th className="px-4 py-3 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {topProducts.map((p, idx) => (
                <tr key={p.sku} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{p.sku}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-[11px]">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800">
                    {p.count} units
                  </td>
                  <td className="px-4 py-3 text-right font-black text-slate-900 text-sm">
                    ₱{p.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Categories Distribution */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          Fleet Categories Distribution
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((c) => (
            <div key={c.name} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs font-semibold text-slate-700 block truncate">{c.name}</span>
              <span className="text-xl font-black text-indigo-600 block mt-1">{c.productCount}</span>
              <span className="text-[10px] text-slate-400">gear models</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
