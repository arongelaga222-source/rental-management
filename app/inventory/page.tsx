import { getInventory } from '@/lib/actions/inventory';
import { InventoryView } from './inventory-view';
import { ProductType, CategoryType } from '@/types';
import { serializeData } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const result = await getInventory();
  const products = serializeData(result.success && result.data ? result.data.products : []) as unknown as ProductType[];
  const categories = serializeData(result.success && result.data ? result.data.categories : []) as unknown as CategoryType[];

  return <InventoryView initialProducts={products} initialCategories={categories} />;
}
