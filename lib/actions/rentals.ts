'use server';

import { prisma } from '@/lib/prisma';
import { Prisma, RentalStatus, PaymentMethod } from '@prisma/client';
import { safeRevalidatePath } from '@/lib/utils';

export async function getRentals(statusFilter?: RentalStatus, searchQuery?: string) {
  try {
    const where: Prisma.RentalWhereInput = {};
    if (statusFilter) {
      where.status = statusFilter;
    }
    if (searchQuery) {
      where.OR = [
        { rentalNumber: { contains: searchQuery } },
        { customer: { fullName: { contains: searchQuery } } },
        { customer: { phone: { contains: searchQuery } } },
      ];
    }

    const rentals = await prisma.rental.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        createdBy: {
          select: { name: true, email: true },
        },
        rentalItems: {
          include: {
            product: true,
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        returns: {
          include: {
            returnItems: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    const serializedRentals = rentals.map((r) => ({
      ...r,
      subtotal: Number(r.subtotal),
      discount: Number(r.discount),
      deliveryFee: Number(r.deliveryFee),
      depositAmount: Number(r.depositAmount),
      totalAmount: Number(r.totalAmount),
      amountPaid: Number(r.amountPaid),
      balance: Number(r.balance),
      rentalItems: r.rentalItems.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        product: {
          ...item.product,
          rentalPrice: Number(item.product.rentalPrice),
        },
      })),
      payments: r.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    }));

    return { success: true, data: serializedRentals };
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return { success: false, error: 'Failed to fetch rentals' };
  }
}

export async function createRental(data: {
  customerId: number;
  startDate: string;
  endDate: string;
  items: Array<{ productId: number; quantity: number; unitPrice: number }>;
  discount?: number;
  deliveryFee?: number;
  depositAmount?: number;
  depositPaid?: boolean;
  depositPaymentMethod?: PaymentMethod;
  notes?: string;
}) {
  try {
    const count = await prisma.rental.count();
    const rentalNumber = `REN-${String(count + 1).padStart(5, '0')}`;

    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discount = data.discount || 0;
    const deliveryFee = data.deliveryFee || 0;
    const depositAmount = data.depositAmount || 0;
    const totalAmount = subtotal - discount + deliveryFee;

    const initialPaid = data.depositPaid ? depositAmount : 0;
    const balance = totalAmount - initialPaid;

    const firstUser = await prisma.user.findFirst();
    const createdById = firstUser?.id || 1;

    const rental = await prisma.rental.create({
      data: {
        rentalNumber,
        customerId: Number(data.customerId),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.depositPaid && depositAmount > 0 ? RentalStatus.CONFIRMED : RentalStatus.PENDING,
        subtotal,
        discount,
        deliveryFee,
        depositAmount,
        totalAmount,
        amountPaid: initialPaid,
        balance,
        notes: data.notes || null,
        createdById,
        rentalItems: {
          create: data.items.map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            subtotal: Number(item.quantity) * Number(item.unitPrice),
          })),
        },
      },
      include: {
        customer: true,
      },
    });

    // Record initial deposit payment if paid
    if (data.depositPaid && depositAmount > 0) {
      await prisma.payment.create({
        data: {
          rentalId: rental.id,
          customerId: Number(data.customerId),
          amount: depositAmount,
          paymentMethod: data.depositPaymentMethod || PaymentMethod.CASH,
          referenceNumber: `DEP-${rentalNumber}`,
          notes: 'Security deposit on rental confirmation',
          recordedById: createdById,
        },
      });
    }

    // Record audit log
    await prisma.auditLog.create({
      data: {
        action: 'RENTAL_CREATED',
        performedById: createdById,
        details: JSON.stringify({
          rentalNumber,
          customer: rental.customer.fullName,
          totalAmount,
          itemCount: data.items.length,
        }),
      },
    });

    safeRevalidatePath('/rentals');
    safeRevalidatePath('/inventory');
    safeRevalidatePath('/customers');
    safeRevalidatePath('/');
    return { success: true, data: rental };
  } catch (error: unknown) {
    console.error('Error creating rental:', error);
    const message = error instanceof Error ? error.message : 'Failed to create rental';
    return { success: false, error: message };
  }
}

export async function updateRentalStatus(rentalId: number, status: RentalStatus) {
  try {
    const updated = await prisma.rental.update({
      where: { id: rentalId },
      data: { status },
      include: { customer: true },
    });

    const firstUser = await prisma.user.findFirst();
    if (firstUser) {
      await prisma.auditLog.create({
        data: {
          action: 'RENTAL_STATUS_CHANGED',
          performedById: firstUser.id,
          details: JSON.stringify({
            rentalNumber: updated.rentalNumber,
            newStatus: status,
          }),
        },
      });
    }

    safeRevalidatePath('/rentals');
    safeRevalidatePath('/returns');
    safeRevalidatePath('/');
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error('Error updating rental status:', error);
    const message = error instanceof Error ? error.message : 'Failed to update rental status';
    return { success: false, error: message };
  }
}
