'use server';

import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      activeRentals,
      pendingRentals,
      todayPayments,
      allPayments,
      recentRentals,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.rental.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.rental.count({
        where: { status: { in: ['PENDING', 'CONFIRMED'] } },
      }),
      prisma.payment.findMany({
        where: {
          paymentDate: { gte: today },
        },
        select: { amount: true },
      }),
      prisma.payment.findMany({
        select: { amount: true },
      }),
      prisma.rental.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { fullName: true, phone: true } },
          rentalItems: { select: { id: true } },
        },
      }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          performedBy: { select: { name: true } },
        },
      }),
    ]);

    const todayRevenue = todayPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalRevenue = allPayments.reduce((acc, p) => acc + Number(p.amount), 0);

    return {
      success: true,
      data: {
        totalCustomers,
        activeRentals,
        pendingRentals,
        todayRevenue,
        totalRevenue,
        recentRentals: recentRentals.map((r) => ({
          ...r,
          totalAmount: Number(r.totalAmount),
          balance: Number(r.balance),
        })),
        recentAuditLogs,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      data: {
        totalCustomers: 0,
        activeRentals: 0,
        pendingRentals: 0,
        todayRevenue: 0,
        totalRevenue: 0,
        recentRentals: [],
        recentAuditLogs: [],
      },
    };
  }
}

export async function getReportsData() {
  try {
    const [payments, rentals, rentalItems, categories] = await Promise.all([
      prisma.payment.findMany({
        select: { amount: true, paymentMethod: true, paymentDate: true },
      }),
      prisma.rental.findMany({
        select: { id: true, status: true, totalAmount: true, startDate: true, endDate: true },
      }),
      prisma.rentalItem.findMany({
        include: {
          product: {
            select: { name: true, sku: true, category: { select: { name: true } } },
          },
        },
      }),
      prisma.category.findMany({
        include: {
          _count: { select: { products: true } },
        },
      }),
    ]);

    // Payment method breakdown
    const methodTotals: Record<string, number> = {};
    payments.forEach((p) => {
      methodTotals[p.paymentMethod] = (methodTotals[p.paymentMethod] || 0) + Number(p.amount);
    });

    // Rental status breakdown
    const statusCounts: Record<string, number> = {};
    rentals.forEach((r) => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });

    // Top rented products
    const productFrequency: Record<string, { name: string; sku: string; category: string; count: number; revenue: number }> = {};
    rentalItems.forEach((item) => {
      const key = item.productId.toString();
      if (!productFrequency[key]) {
        productFrequency[key] = {
          name: item.product.name,
          sku: item.product.sku,
          category: item.product.category.name,
          count: 0,
          revenue: 0,
        };
      }
      productFrequency[key].count += item.quantity;
      productFrequency[key].revenue += Number(item.subtotal);
    });

    const topProducts = Object.values(productFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalRentalVolume = rentals.length;

    return {
      success: true,
      data: {
        totalRevenue,
        totalRentalVolume,
        methodTotals,
        statusCounts,
        topProducts,
        categories: categories.map((c) => ({
          name: c.name,
          productCount: c._count.products,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching reports data:', error);
    return { success: false, error: 'Failed to fetch reports' };
  }
}

export async function getAuditLogs() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        performedBy: {
          select: { name: true, email: true, role: true },
        },
      },
    });

    return { success: true, data: logs };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return { success: false, error: 'Failed to fetch audit logs' };
  }
}
