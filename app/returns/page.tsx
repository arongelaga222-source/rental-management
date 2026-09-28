import { getReturns } from '@/lib/actions/returns';
import { getRentals } from '@/lib/actions/rentals';
import { ReturnsView } from './returns-view';
import { ReturnType } from '@/types';
import { serializeData } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ReturnsPage() {
  const [returnsRes, rentalsRes] = await Promise.all([
    getReturns(),
    getRentals(),
  ]);

  const returns = serializeData(returnsRes.success && returnsRes.data ? returnsRes.data : []) as unknown as ReturnType[];
  const rentals = rentalsRes.success && rentalsRes.data ? rentalsRes.data : [];

  // Renters who have gear out in field
  const activeRentals = serializeData(
    rentals
      .filter((r) => ['ACTIVE', 'CONFIRMED', 'OUT_FOR_DELIVERY'].includes(r.status))
      .map((r) => ({
        id: r.id,
        rentalNumber: r.rentalNumber,
        customer: { fullName: r.customer.fullName },
        rentalItems: r.rentalItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: { name: item.product.name, sku: item.product.sku },
        })),
      }))
  );

  return <ReturnsView initialReturns={returns} activeRentals={activeRentals} />;
}
