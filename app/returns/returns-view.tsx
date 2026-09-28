'use client';

import { useState } from 'react';
import {
  PlusIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { processReturn } from '@/lib/actions/returns';

interface ReturnRecord {
  id: number;
  rentalId: number;
  returnDate: Date;
  notes: string | null;
  recordedBy: { name: string };
  rental: {
    rentalNumber: string;
    customer: { fullName: string; phone: string };
    totalAmount: number;
    balance: number;
  };
  returnItems: Array<{
    id: number;
    quantity: number;
    damagedQuantity: number;
    missingQuantity: number;
    product: {
      name: string;
      sku: string;
    };
  }>;
}

interface ActiveRental {
  id: number;
  rentalNumber: string;
  customer: { fullName: string };
  rentalItems: Array<{
    id: number;
    productId: number;
    quantity: number;
    product: { name: string; sku: string };
  }>;
}

export function ReturnsView({
  initialReturns,
  activeRentals,
}: {
  initialReturns: ReturnRecord[];
  activeRentals: ActiveRental[];
}) {
  const [returns, setReturns] = useState<ReturnRecord[]>(initialReturns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [selectedRentalId, setSelectedRentalId] = useState<number>(activeRentals[0]?.id || 0);
  const currentRental = activeRentals.find((r) => r.id === selectedRentalId);

  const [returnItemsState, setReturnItemsState] = useState<
    Array<{ productId: number; quantity: number; damagedQuantity: number; missingQuantity: number }>
  >(
    currentRental
      ? currentRental.rentalItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          damagedQuantity: 0,
          missingQuantity: 0,
        }))
      : []
  );

  const [notes, setNotes] = useState('');

  const handleRentalSelect = (id: number) => {
    setSelectedRentalId(id);
    const r = activeRentals.find((rent) => rent.id === id);
    if (r) {
      setReturnItemsState(
        r.rentalItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          damagedQuantity: 0,
          missingQuantity: 0,
        }))
      );
    }
  };

  const handleDamagedChange = (index: number, val: number) => {
    setReturnItemsState((prev) =>
      prev.map((item, i) => (i === index ? { ...item, damagedQuantity: Math.max(0, val) } : item))
    );
  };

  const handleMissingChange = (index: number, val: number) => {
    setReturnItemsState((prev) =>
      prev.map((item, i) => (i === index ? { ...item, missingQuantity: Math.max(0, val) } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRentalId) {
      setErrorMessage('Please select a rental order to return.');
      return;
    }
    setLoading(true);
    setErrorMessage('');

    const res = await processReturn({
      rentalId: selectedRentalId,
      notes,
      items: returnItemsState,
    });

    if (res.success && res.data) {
      const r = activeRentals.find((rent) => rent.id === selectedRentalId);
      const newRecord: ReturnRecord = {
        id: res.data.id,
        rentalId: selectedRentalId,
        returnDate: new Date(),
        notes,
        recordedBy: { name: 'Staff User' },
        rental: {
          rentalNumber: r?.rentalNumber || 'REN-0000',
          customer: { fullName: r?.customer.fullName || 'Customer', phone: '' },
          totalAmount: 0,
          balance: 0,
        },
        returnItems: returnItemsState.map((item, idx) => {
          const prodInfo = r?.rentalItems.find((p) => p.productId === item.productId)?.product;
          return {
            id: idx + 9999,
            quantity: item.quantity,
            damagedQuantity: item.damagedQuantity,
            missingQuantity: item.missingQuantity,
            product: {
              name: prodInfo?.name || 'Equipment',
              sku: prodInfo?.sku || 'SKU',
            },
          };
        }),
      };
      setReturns([newRecord, ...returns]);
      setIsModalOpen(false);
    } else {
      setErrorMessage(res.error || 'Failed to process return');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Return Inspection & Restocking</h1>
          <p className="text-xs text-slate-500">Inspect returned equipment, log damages/loss, and release security deposits</p>
        </div>
        <button
          onClick={() => {
            setErrorMessage('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <PlusIcon className="h-4 w-4" />
          Process Return
        </button>
      </div>

      {/* Returns History Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Return Date</th>
                <th className="px-5 py-3.5">Rental #</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Returned Items & Condition</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5">Inspection Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No equipment returns recorded yet.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => {
                  const hasDamageOrLoss = ret.returnItems.some(
                    (i) => i.damagedQuantity > 0 || i.missingQuantity > 0
                  );
                  return (
                    <tr key={ret.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {new Date(ret.returnDate).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(ret.returnDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-indigo-600">
                        {ret.rental.rentalNumber}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {ret.rental.customer.fullName}
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {ret.returnItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px]">
                              <span className="font-medium text-slate-800">{item.product.name}</span>
                              <span className="text-slate-400">×{item.quantity}</span>
                              {item.damagedQuantity > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                                  {item.damagedQuantity} damaged
                                </span>
                              )}
                              {item.missingQuantity > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">
                                  {item.missingQuantity} missing
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {hasDamageOrLoss ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                            ISSUES NOTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <ShieldCheckIcon className="h-3.5 w-3.5" />
                            PRISTINE
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                        {ret.notes || <span className="italic text-slate-400">All units checked OK</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Return Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Process Equipment Return</h3>
                <p className="text-xs text-slate-500">Inspect items, mark damages, and update stock</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Active Rental Order <span className="text-rose-500">*</span>
                </label>
                {activeRentals.length === 0 ? (
                  <p className="text-amber-600 italic">No currently checked-out or active orders.</p>
                ) : (
                  <select
                    value={selectedRentalId}
                    onChange={(e) => handleRentalSelect(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {activeRentals.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.rentalNumber} - {r.customer.fullName} ({r.rentalItems.length} items)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Items inspection */}
              {currentRental && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-slate-800">Check In Equipment Condition</h4>
                  <div className="space-y-2">
                    {currentRental.rentalItems.map((item, idx) => {
                      const st = returnItemsState[idx];
                      return (
                        <div key={item.id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-bold text-slate-800">{item.product.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Total Checked Out: {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div>
                              <span className="block text-[10px] text-amber-700 font-semibold">Damaged</span>
                              <input
                                type="number"
                                min="0"
                                max={item.quantity}
                                value={st?.damagedQuantity || 0}
                                onChange={(e) => handleDamagedChange(idx, Number(e.target.value))}
                                className="w-14 px-1.5 py-1 border border-slate-200 rounded text-center"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] text-rose-700 font-semibold">Missing</span>
                              <input
                                type="number"
                                min="0"
                                max={item.quantity}
                                value={st?.missingQuantity || 0}
                                onChange={(e) => handleMissingChange(idx, Number(e.target.value))}
                                className="w-14 px-1.5 py-1 border border-slate-200 rounded text-center"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inspection Notes</label>
                <textarea
                  rows={3}
                  placeholder="Gear verified in operational order, cables wrapped, minor lens dust cleaned..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || activeRentals.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Complete Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
