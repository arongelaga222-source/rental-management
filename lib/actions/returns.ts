'use server';

import { prisma } from '@/lib/prisma';
import { RentalStatus } from '@prisma/client';
import { safeRevalidatePath } from '@/lib/utils';

export async function getReturns() {
  try {
    const returns = await prisma.return.findMany({
      orderBy: { returnDate: 'desc' },
      include: {
        rental: {
          include: {
            customer: true,
          },
        },
        recordedBy: {
          select: { name: true },
        },
        returnItems: {
          include: {
            product: true,
          },
        },
      },
    });

    const serialized = returns.map((r) => ({
      ...r,
      rental: {
        ...r.rental,
        totalAmount: Number(r.rental.totalAmount),
        balance: Number(r.rental.balance),
      },
      returnItems: r.returnItems.map((item) => ({
        ...item,
        product: {
          ...item.product,
          rentalPrice: Number(item.product.rentalPrice),
        },
      })),
    }));

    return { success: true, data: serialized };
  } catch (error) {
    console.error('Error fetching returns:', error);
    return { success: false, error: 'Failed to fetch returns' };
  }
}

export async function processReturn(data: {
  rentalId: number;
  notes?: string;
  items: Array<{
    productId: number;
    quantity: number;
    damagedQuantity: number;
    missingQuantity: number;
  }>;
}) {
  try {
    const rental = await prisma.rental.findUnique({
      where: { id: Number(data.rentalId) },
    });

    if (!rental) {
      return { success: false, error: 'Rental not found' };
    }

    const firstUser = await prisma.user.findFirst();
    const recordedById = firstUser?.id || 1;

    // Create return record
    const returnRecord = await prisma.return.create({
      data: {
        rentalId: rental.id,
        notes: data.notes || null,
        recordedById,
        returnItems: {
          create: data.items.map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            damagedQuantity: Number(item.damagedQuantity || 0),
            missingQuantity: Number(item.missingQuantity || 0),
          })),
        },
      },
      include: {
        returnItems: true,
      },
    });

    // Update rental status
    const newStatus = Number(rental.balance) <= 0 ? RentalStatus.COMPLETED : RentalStatus.RETURNED;
    await prisma.rental.update({
      where: { id: rental.id },
      data: { status: newStatus },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        action: 'RETURN_PROCESSED',
        performedById: recordedById,
        details: JSON.stringify({
          rentalNumber: rental.rentalNumber,
          returnId: returnRecord.id,
          totalDamaged: data.items.reduce((s, i) => s + (Number(i.damagedQuantity) || 0), 0),
          totalMissing: data.items.reduce((s, i) => s + (Number(i.missingQuantity) || 0), 0),
        }),
      },
    });

    safeRevalidatePath('/returns');
    safeRevalidatePath('/rentals');
    safeRevalidatePath('/inventory');
    safeRevalidatePath('/');
    return { success: true, data: returnRecord };
  } catch (error: unknown) {
    console.error('Error processing return:', error);
    const message = error instanceof Error ? error.message : 'Failed to process return';
    return { success: false, error: message };
  }
}
