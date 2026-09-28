import { getCustomers } from '@/lib/actions/customers';
import { CustomersView } from './customers-view';
import { CustomerType } from '@/types';
import { serializeData } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const result = await getCustomers();
  const customers = serializeData(result.success && result.data ? result.data : []) as unknown as CustomerType[];

  return <CustomersView initialCustomers={customers} />;
}
