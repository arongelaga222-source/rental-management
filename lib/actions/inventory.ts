'use server';

import { prisma } from '@/lib/prisma';
import { Prisma, ProductStatus } from '@prisma/client';
import { safeRevalidatePath } from '@/lib/utils';

export async function getInventory(searchQuery?: string, categoryId?: number, status?: ProductStatus) {
  try {
    const where: Prisma.ProductWhereInput = {};
    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery } },
        { sku: { contains: searchQuery } },
        { description: { contains: searchQuery } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (status) {
      where.status = status;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        rentalItems: {
          where: {
            rental: {
              status: {
                in: ['ACTIVE', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'],
              },
            },
          },
          select: {
            quantity: true,
          },
        },
      },
    });

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // Calculate currently rented out quantity
    const formattedProducts = products.map((p) => {
      const rentedOut = p.rentalItems.reduce((acc, item) => acc + item.quantity, 0);
      const availableQuantity = Math.max(0, p.totalQuantity - rentedOut);
      return {
        ...p,
        rentalPrice: Number(p.rentalPrice),
        rentedOut,
        availableQuantity,
      };
    });

    return {
      success: true,
      data: {
        products: formattedProducts,
        categories,
      },
    };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return { success: false, error: 'Failed to fetch inventory' };
  }
}

export async function createProduct(formData: {
  sku: string;
  name: string;
  description?: string;
  categoryId: number;
  totalQuantity: number;
  rentalPrice: number;
  status?: ProductStatus;
}) {
  try {
    const newProduct = await prisma.product.create({
      data: {
        sku: formData.sku.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        categoryId: Number(formData.categoryId),
        totalQuantity: Number(formData.totalQuantity),
        rentalPrice: Number(formData.rentalPrice),
        status: formData.status || ProductStatus.ACTIVE,
      },
    });

    const firstUser = await prisma.user.findFirst();
    if (firstUser) {
      await prisma.auditLog.create({
        data: {
          action: 'PRODUCT_CREATED',
          performedById: firstUser.id,
          details: JSON.stringify({
            productId: newProduct.id,
            sku: newProduct.sku,
            name: newProduct.name,
          }),
        },
      });
    }

    safeRevalidatePath('/inventory');
    safeRevalidatePath('/rentals');
    safeRevalidatePath('/');
    return { success: true, data: newProduct };
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return { success: false, error: message };
  }
}

export async function updateProduct(
  id: number,
  formData: {
    sku: string;
    name: string;
    description?: string;
    categoryId: number;
    totalQuantity: number;
    rentalPrice: number;
    status: ProductStatus;
  }
) {
  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        sku: formData.sku.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        categoryId: Number(formData.categoryId),
        totalQuantity: Number(formData.totalQuantity),
        rentalPrice: Number(formData.rentalPrice),
        status: formData.status,
      },
    });

    safeRevalidatePath('/inventory');
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return { success: false, error: message };
  }
}

export async function createCategory(name: string) {
  try {
    const category = await prisma.category.create({
      data: { name: name.trim() },
    });
    safeRevalidatePath('/inventory');
    return { success: true, data: category };
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    const message = error instanceof Error ? error.message : 'Category already exists';
    return { success: false, error: message };
  }
}
