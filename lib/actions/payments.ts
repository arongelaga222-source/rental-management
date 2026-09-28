'use server';

import { prisma } from '@/lib/prisma';
import { Prisma, PaymentMethod, RentalStatus } from '@prisma/client';
import { safeRevalidatePath } from '@/lib/utils';

export async function getPayments(searchQuery?: string) {
  try {
    const where: Prisma.PaymentWhereInput = {};
    if (searchQuery) {
      where.OR = [
        { referenceNumber: { contains: searchQuery } },
        { customer: { fullName: { contains: searchQuery } } },
        { rental: { rentalNumber: { contains: searchQuery } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        customer: true,
        rental: true,
        recordedBy: {
          select: { name: true },
        },
      },
    });

    const serializedPayments = payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
      rental: {
        ...p.rental,
        totalAmount: Number(p.rental.totalAmount),
        amountPaid: Number(p.rental.amountPaid),
        balance: Number(p.rental.balance),
      },
    }));

    return { success: true, data: serializedPayments };
  } catch (error) {
    console.error('Error fetching payments:', error);
    return { success: false, error: 'Failed to fetch payments' };
  }
}

export async function recordPayment(data: {
  rentalId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}) {
  try {
    const rental = await prisma.rental.findUnique({
      where: { id: Number(data.rentalId) },
      include: { customer: true },
    });

    if (!rental) {
      return { success: false, error: 'Rental not found' };
    }

    const firstUser = await prisma.user.findFirst();
    const recordedById = firstUser?.id || 1;

    const paymentAmount = Number(data.amount);
    const newAmountPaid = Number(rental.amountPaid) + paymentAmount;
    const newBalance = Math.max(0, Number(rental.totalAmount) - newAmountPaid);

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        rentalId: rental.id,
        customerId: rental.customerId,
        amount: paymentAmount,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber?.trim() || null,
        notes: data.notes?.trim() || null,
        recordedById,
      },
    });

    // Update rental balance
    const updatedStatus =
      rental.status === RentalStatus.RETURNED && newBalance <= 0
        ? RentalStatus.COMPLETED
        : rental.status;

    await prisma.rental.update({
      where: { id: rental.id },
      data: {
        amountPaid: newAmountPaid,
        balance: newBalance,
        status: updatedStatus,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        action: 'PAYMENT_RECORDED',
        performedById: recordedById,
        details: JSON.stringify({
          paymentId: payment.id,
          rentalNumber: rental.rentalNumber,
          amount: paymentAmount,
          method: data.paymentMethod,
        }),
      },
    });

    safeRevalidatePath('/payments');
    safeRevalidatePath('/rentals');
    safeRevalidatePath('/');
    return { success: true, data: payment };
  } catch (error: unknown) {
    console.error('Error recording payment:', error);
    const message = error instanceof Error ? error.message : 'Failed to record payment';
    return { success: false, error: message };
  }
}
