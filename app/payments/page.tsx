import { getPayments } from '@/lib/actions/payments';
import { getRentals } from '@/lib/actions/rentals';
import { PaymentsView } from './payments-view';
import { PaymentType } from '@/types';
import { serializeData } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const [paymentsRes, rentalsRes] = await Promise.all([
    getPayments(),
    getRentals(),
  ]);

  const payments = serializeData(paymentsRes.success && paymentsRes.data ? paymentsRes.data : []) as unknown as PaymentType[];
  const rentals = rentalsRes.success && rentalsRes.data ? rentalsRes.data : [];

  // Filter rentals that have outstanding balance
  const unpaidRentals = serializeData(
    rentals
      .filter((r) => r.balance > 0)
      .map((r) => ({
        id: r.id,
        rentalNumber: r.rentalNumber,
        customer: { fullName: r.customer.fullName },
        balance: r.balance,
      }))
  );

  return <PaymentsView initialPayments={payments} unpaidRentals={unpaidRentals} />;
}
