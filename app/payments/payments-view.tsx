'use client';

import { useState } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { PaymentMethod } from '@prisma/client';
import { recordPayment } from '@/lib/actions/payments';

interface Payment {
  id: number;
  rentalId: number;
  customerId: number;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber: string | null;
  notes: string | null;
  customer: {
    fullName: string;
    phone: string;
    customerNumber: string;
  };
  rental: {
    rentalNumber: string;
    totalAmount: number;
    amountPaid: number;
    balance: number;
  };
  recordedBy: {
    name: string;
  };
}

interface RentalOption {
  id: number;
  rentalNumber: string;
  customer: { fullName: string };
  balance: number;
}

export function PaymentsView({
  initialPayments,
  unpaidRentals,
}: {
  initialPayments: Payment[];
  unpaidRentals: RentalOption[];
}) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [selectedRentalId, setSelectedRentalId] = useState<number>(
    unpaidRentals[0]?.id || 0
  );
  const selectedRental = unpaidRentals.find((r) => r.id === selectedRentalId);

  const [amount, setAmount] = useState<number>(selectedRental?.balance || 50);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handleRentalChange = (id: number) => {
    setSelectedRentalId(id);
    const r = unpaidRentals.find((rent) => rent.id === id);
    if (r) {
      setAmount(r.balance);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRentalId) {
      setErrorMessage('Please select an active rental order.');
      return;
    }
    setLoading(true);
    setErrorMessage('');

    const res = await recordPayment({
      rentalId: selectedRentalId,
      amount: Number(amount),
      paymentMethod,
      referenceNumber,
      notes,
    });

    if (res.success && res.data) {
      const rental = unpaidRentals.find((r) => r.id === selectedRentalId);
      const newPayment: Payment = {
        ...res.data,
        amount: Number(amount),
        customer: {
          fullName: rental?.customer.fullName || 'Customer',
          phone: '',
          customerNumber: '',
        },
        rental: {
          rentalNumber: rental?.rentalNumber || 'REN-0000',
          totalAmount: 0,
          amountPaid: Number(amount),
          balance: Math.max(0, (rental?.balance || 0) - Number(amount)),
        },
        recordedBy: { name: 'Staff' },
      };
      setPayments([newPayment, ...payments]);
      setIsModalOpen(false);
    } else {
      setErrorMessage(res.error || 'Failed to record payment');
    }
    setLoading(false);
  };

  const filteredPayments = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.customer.fullName.toLowerCase().includes(q) ||
      p.rental.rentalNumber.toLowerCase().includes(q) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q))
    );
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments & Settlement Ledger</h1>
          <p className="text-xs text-slate-500">Track incoming customer receipts, security deposits, and settlement logs</p>
        </div>
        <button
          onClick={() => {
            setErrorMessage('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <PlusIcon className="h-4 w-4" />
          Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Collected</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            ₱{totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sum of all recorded transactions</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Transactions</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{payments.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Payments & deposits processed</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders with Balance</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{unpaidRentals.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Rentals awaiting final payment</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, rental #, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-800">{filteredPayments.length}</span> payment(s) listed
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Customer & Order</th>
                <th className="px-5 py-3.5">Method</th>
                <th className="px-5 py-3.5">Reference ID</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(p.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{p.customer.fullName}</div>
                      <div className="text-indigo-600 font-mono text-[11px]">
                        {p.rental.rentalNumber}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.paymentMethod === 'CASH'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.paymentMethod === 'BANK_TRANSFER'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500">
                      {p.referenceNumber || <span className="italic text-slate-400">Direct Settlement</span>}
                    </td>
                    <td className="px-5 py-4 text-right font-black text-slate-900 text-sm">
                      +₱{p.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {p.recordedBy?.name || 'Staff User'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record New Payment</h3>
                <p className="text-xs text-slate-500">Log cash, transfer, or online transaction</p>
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
                  Select Rental Order <span className="text-rose-500">*</span>
                </label>
                {unpaidRentals.length === 0 ? (
                  <p className="text-amber-600 italic">No orders currently have outstanding balances.</p>
                ) : (
                  <select
                    value={selectedRentalId}
                    onChange={(e) => handleRentalChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {unpaidRentals.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.rentalNumber} - {r.customer.fullName} (Balance: ₱{r.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Payment Amount (₱) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Payment Method <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="E_WALLET">E-Wallet (GCash / Maya / Paypal)</option>
                    <option value="OTHER">Other / POS Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reference / Transaction #</label>
                <input
                  type="text"
                  placeholder="e.g. TXN-1092847 or Receipt #092"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Final balance settled upon return"
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
                  disabled={loading || unpaidRentals.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {loading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
