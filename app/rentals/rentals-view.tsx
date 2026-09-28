'use client';

import { useState } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { RentalStatus, PaymentMethod } from '@prisma/client';
import { createRental, updateRentalStatus } from '@/lib/actions/rentals';

interface Customer {
  id: number;
  customerNumber: string;
  fullName: string;
  phone: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  rentalPrice: number;
  availableQuantity: number;
}

interface Rental {
  id: number;
  rentalNumber: string;
  customerId: number;
  customer: Customer;
  startDate: Date;
  endDate: Date;
  status: RentalStatus;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  depositAmount: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  notes: string | null;
  rentalItems: Array<{
    id: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      name: string;
      sku: string;
      rentalPrice: number;
    };
  }>;
  payments: Array<{
    id: number;
    amount: number;
    paymentDate: Date;
    paymentMethod: string;
  }>;
}

export function RentalsView({
  initialRentals,
  customers,
  products,
  openCreateOnLoad = false,
}: {
  initialRentals: Rental[];
  customers: Customer[];
  products: Product[];
  openCreateOnLoad?: boolean;
}) {
  const [rentals, setRentals] = useState<Rental[]>(initialRentals);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(openCreateOnLoad);
  const [viewingRental, setViewingRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [customerId, setCustomerId] = useState<number>(customers[0]?.id || 1);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [rentalItems, setRentalItems] = useState<
    Array<{ productId: number; quantity: number; unitPrice: number }>
  >([
    {
      productId: products[0]?.id || 1,
      quantity: 1,
      unitPrice: products[0]?.rentalPrice || 50,
    },
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(50);
  const [depositPaid, setDepositPaid] = useState<boolean>(true);
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [notes, setNotes] = useState<string>('');

  // Calculations
  const calculatedSubtotal = rentalItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );
  const calculatedTotal = Math.max(0, calculatedSubtotal - (Number(discount) || 0) + (Number(deliveryFee) || 0));
  const calculatedBalance = Math.max(0, calculatedTotal - (depositPaid ? Number(depositAmount) || 0 : 0));

  const handleAddItem = () => {
    const nextProd = products[0];
    if (nextProd) {
      setRentalItems([
        ...rentalItems,
        { productId: nextProd.id, quantity: 1, unitPrice: nextProd.rentalPrice },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (rentalItems.length > 1) {
      setRentalItems(rentalItems.filter((_, i) => i !== index));
    }
  };

  const handleItemProductChange = (index: number, prodId: number) => {
    const prod = products.find((p) => p.id === prodId);
    setRentalItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              productId: prodId,
              unitPrice: prod?.rentalPrice || item.unitPrice,
            }
          : item
      )
    );
  };

  const handleItemQuantityChange = (index: number, qty: number) => {
    setRentalItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, qty) } : item))
    );
  };

  const handleItemPriceChange = (index: number, price: number) => {
    setRentalItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, unitPrice: Math.max(0, price) } : item))
    );
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (rentalItems.length === 0) {
      setErrorMessage('Please add at least one equipment item.');
      setLoading(false);
      return;
    }

    const res = await createRental({
      customerId,
      startDate,
      endDate,
      items: rentalItems,
      discount: Number(discount) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      depositAmount: Number(depositAmount) || 0,
      depositPaid,
      depositPaymentMethod,
      notes,
    });

    if (res.success && res.data) {
      const cust = customers.find((c) => c.id === customerId);
      const newRental: Rental = {
        ...res.data,
        subtotal: calculatedSubtotal,
        discount: Number(discount) || 0,
        deliveryFee: Number(deliveryFee) || 0,
        depositAmount: Number(depositAmount) || 0,
        totalAmount: calculatedTotal,
        amountPaid: depositPaid ? Number(depositAmount) || 0 : 0,
        balance: calculatedBalance,
        customer: cust || {
          id: customerId,
          customerNumber: 'CUS-NEW',
          fullName: 'Customer',
          phone: '',
        },
        rentalItems: rentalItems.map((item, idx) => {
          const prod = products.find((p) => p.id === item.productId);
          return {
            id: idx + 9999,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
            product: {
              name: prod?.name || 'Equipment',
              sku: prod?.sku || 'SKU',
              rentalPrice: prod?.rentalPrice || 0,
            },
          };
        }),
        payments: depositPaid && Number(depositAmount) > 0 ? [
          {
            id: 9999,
            amount: Number(depositAmount),
            paymentDate: new Date(),
            paymentMethod: depositPaymentMethod,
          }
        ] : [],
      };
      setRentals([newRental, ...rentals]);
      setIsCreateModalOpen(false);
    } else {
      setErrorMessage(res.error || 'Failed to create rental');
    }
    setLoading(false);
  };

  const handleStatusChange = async (rentalId: number, newStatus: RentalStatus) => {
    const res = await updateRentalStatus(rentalId, newStatus);
    if (res.success) {
      setRentals((prev) =>
        prev.map((r) => (r.id === rentalId ? { ...r, status: newStatus } : r))
      );
      if (viewingRental?.id === rentalId) {
        setViewingRental((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } else {
      alert(res.error || 'Failed to update status');
    }
  };

  const filteredRentals = rentals.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.rentalNumber.toLowerCase().includes(q) ||
      r.customer.fullName.toLowerCase().includes(q) ||
      r.customer.phone.includes(q);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rental Agreements & Dispatches</h1>
          <p className="text-xs text-slate-500">Track equipment reservations, active checkouts, and return balances</p>
        </div>
        <button
          onClick={() => {
            setErrorMessage('');
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <PlusIcon className="h-4 w-4" />
          Create Rental
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'PENDING', 'CONFIRMED', 'ACTIVE', 'RETURNED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by rental # or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-800">{filteredRentals.length}</span> rental order(s)
          </div>
        </div>
      </div>

      {/* Rentals Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Rental #</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Rental Period</th>
                <th className="px-5 py-3.5 text-center">Items</th>
                <th className="px-5 py-3.5 text-right">Financials</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No rental orders found.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-indigo-50 text-indigo-700 text-xs">
                          {r.rentalNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{r.customer.fullName}</div>
                      <div className="text-slate-400 text-[11px]">{r.customer.phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(r.startDate).toLocaleDateString()}</span>
                        <span className="text-slate-400">→</span>
                        <span>{new Date(r.endDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {r.rentalItems.length} line item(s)
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="font-bold text-slate-900">₱{r.totalAmount.toFixed(2)}</div>
                      <div className={`text-[11px] font-medium ${r.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {r.balance > 0 ? `Due: ₱${r.balance.toFixed(2)}` : 'Fully Paid'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value as RentalStatus)}
                        className={`text-[10px] font-bold uppercase rounded-full px-2.5 py-1 border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                          r.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : r.status === 'COMPLETED'
                            ? 'bg-slate-100 text-slate-700'
                            : r.status === 'RETURNED'
                            ? 'bg-violet-100 text-violet-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="RETURNED">RETURNED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setViewingRental(r)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Full Rental Agreement"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Rental Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create New Rental Agreement</h3>
                <p className="text-xs text-slate-500">Reserve gear, allocate fleet items, and set pricing terms</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
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

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              {/* Customer Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Customer <span className="text-rose-500">*</span>
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.customerNumber} - {c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rental Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Expected Return Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">Equipment Line Items</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 bg-white border border-slate-300 text-indigo-600 font-semibold rounded-lg hover:bg-slate-100 flex items-center gap-1 shadow-2xs"
                  >
                    <PlusIcon className="h-3.5 w-3.5" /> Add Equipment
                  </button>
                </div>

                <div className="space-y-2">
                  {rentalItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="flex-1">
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemProductChange(index, Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} [{p.sku}] - ₱{p.rentalPrice}/day ({p.availableQuantity} avail)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemQuantityChange(index, Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-center font-bold"
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemPriceChange(index, Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-right font-medium"
                          />
                        </div>
                        <div className="w-20 text-right font-bold text-slate-900 pr-1">
                          ₱{(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={rentalItems.length === 1}
                          className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Financial Additions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount (₱)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivery Fee (₱)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Security Deposit (₱)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Deposit Payment Checkbox */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-900">
                  <input
                    type="checkbox"
                    checked={depositPaid}
                    onChange={(e) => setDepositPaid(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  Security deposit received at checkout
                </label>
                {depositPaid && (
                  <select
                    value={depositPaymentMethod}
                    onChange={(e) => setDepositPaymentMethod(e.target.value as PaymentMethod)}
                    className="px-2.5 py-1 text-xs bg-white border border-emerald-300 rounded-md font-medium text-emerald-800"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="E_WALLET">E-Wallet</option>
                    <option value="OTHER">Other</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Special Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Include extra battery charger, shoot location in studio..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Calculation Summary Box */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1.5">
                <div className="flex justify-between text-slate-300 text-xs">
                  <span>Equipment Subtotal:</span>
                  <span>₱{calculatedSubtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-300 text-xs">
                    <span>Discount:</span>
                    <span>-₱{Number(discount).toFixed(2)}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-slate-300 text-xs">
                    <span>Delivery Fee:</span>
                    <span>+₱{Number(deliveryFee).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-slate-800">
                  <span>Grand Total:</span>
                  <span>₱{calculatedTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-400 font-semibold pt-1">
                  <span>Deposit Collected:</span>
                  <span>₱{(depositPaid ? Number(depositAmount) || 0 : 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-amber-300 font-bold">
                  <span>Remaining Due:</span>
                  <span>₱{calculatedBalance.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm & Book Rental'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Rental Details Modal */}
      {viewingRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{viewingRental.rentalNumber}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      viewingRental.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {viewingRental.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Booked on {new Date(viewingRental.startDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setViewingRental(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Customer info */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Renter:</span>{' '}
                <span className="font-bold text-slate-800">{viewingRental.customer.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400">Phone:</span>{' '}
                <span className="font-bold text-slate-800">{viewingRental.customer.phone}</span>
              </div>
            </div>

            {/* Items list */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Rented Equipment
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {viewingRental.rentalItems.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between bg-white">
                    <div>
                      <p className="font-bold text-slate-900">{item.product.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {item.product.sku} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">₱{item.subtotal.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400">₱{item.unitPrice.toFixed(2)} / ea</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Details */}
            <div className="mt-4 p-4 bg-slate-900 text-white rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal:</span>
                <span>₱{viewingRental.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deposit Amount:</span>
                <span>₱{viewingRental.depositAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-800">
                <span>Total Amount:</span>
                <span>₱{viewingRental.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Total Paid:</span>
                <span>₱{viewingRental.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold">
                <span>Balance Due:</span>
                <span>₱{viewingRental.balance.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment history */}
            {viewingRental.payments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Recorded Payments
                </h4>
                <div className="space-y-1.5">
                  {viewingRental.payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                        <span className="font-semibold text-slate-800">{p.paymentMethod}</span>
                        <span className="text-slate-400">
                          {new Date(p.paymentDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">₱{p.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
