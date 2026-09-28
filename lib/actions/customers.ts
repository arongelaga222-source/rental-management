'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils';

export async function getCustomers(searchQuery?: string) {
  try {
    const where = searchQuery
      ? {
          OR: [
            { fullName: { contains: searchQuery } },
            { customerNumber: { contains: searchQuery } },
            { phone: { contains: searchQuery } },
            { email: { contains: searchQuery } },
          ],
        }
      : {};

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        rentals: {
          select: {
            id: true,
            rentalNumber: true,
            status: true,
            totalAmount: true,
            balance: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    return {
      success: true,
      data: customers.map((c) => ({
        ...c,
        rentals: c.rentals.map((r) => ({
          ...r,
          totalAmount: Number(r.totalAmount),
          balance: Number(r.balance),
        })),
      })),
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    return { success: false, error: 'Failed to fetch customers' };
  }
}

export async function createCustomer(formData: {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}) {
  try {
    const count = await prisma.customer.count();
    const customerNumber = `CUS-${String(count + 1).padStart(5, '0')}`;

    const newCustomer = await prisma.customer.create({
      data: {
        customerNumber,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || null,
        notes: formData.notes?.trim() || null,
      },
    });

    // Record audit log
    const firstUser = await prisma.user.findFirst();
    if (firstUser) {
      await prisma.auditLog.create({
        data: {
          action: 'CUSTOMER_CREATED',
          performedById: firstUser.id,
          details: JSON.stringify({
            customerId: newCustomer.id,
            customerNumber: newCustomer.customerNumber,
            name: newCustomer.fullName,
          }),
        },
      });
    }

    safeRevalidatePath('/customers');
    safeRevalidatePath('/');
    return { success: true, data: newCustomer };
  } catch (error: unknown) {
    console.error('Error creating customer:', error);
    const message = error instanceof Error ? error.message : 'Failed to create customer';
    return { success: false, error: message };
  }
}

export async function updateCustomer(
  id: number,
  formData: {
    fullName: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
  }
) {
  try {
    const updated = await prisma.customer.update({
      where: { id },
      data: {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || null,
        notes: formData.notes?.trim() || null,
      },
    });

    safeRevalidatePath('/customers');
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error('Error updating customer:', error);
    const message = error instanceof Error ? error.message : 'Failed to update customer';
    return { success: false, error: message };
  }
}

export async function deleteCustomer(id: number) {
  try {
    // Check if customer has active rentals
    const rentals = await prisma.rental.findMany({
      where: { customerId: id },
    });

    if (rentals.length > 0) {
      return {
        success: false,
        error: 'Cannot delete customer with existing rental history.',
      };
    }

    await prisma.customer.delete({ where: { id } });
    safeRevalidatePath('/customers');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting customer:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete customer';
    return { success: false, error: message };
  }
}
