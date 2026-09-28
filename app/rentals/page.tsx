import { getRentals } from '@/lib/actions/rentals';
import { getCustomers } from '@/lib/actions/customers';
import { getInventory } from '@/lib/actions/inventory';
import { RentalsView } from './rentals-view';
import { RentalType, ProductType } from '@/types';
import { serializeData } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const resolvedParams = await searchParams;
  const openCreateOnLoad = resolvedParams?.new === 'true';

  const [rentalsRes, customersRes, inventoryRes] = await Promise.all([
    getRentals(),
    getCustomers(),
    getInventory(),
  ]);

  const rentals = serializeData(rentalsRes.success && rentalsRes.data ? rentalsRes.data : []) as unknown as RentalType[];
  const customers = serializeData(customersRes.success && customersRes.data ? customersRes.data : []);
  const products = serializeData(inventoryRes.success && inventoryRes.data ? inventoryRes.data.products : []) as unknown as ProductType[];

  return (
    <RentalsView
      initialRentals={rentals}
      customers={customers}
      products={products}
      openCreateOnLoad={openCreateOnLoad}
    />
  );
}
