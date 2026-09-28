import { ProductStatus, RentalStatus, PaymentMethod } from '@prisma/client';

export interface CustomerType {
  id: number;
  customerNumber: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: Date;
  rentals: Array<{
    id: number;
    rentalNumber: string;
    status: string;
    totalAmount: number;
    balance: number;
    startDate: Date;
    endDate: Date;
  }>;
}

export interface ProductType {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  categoryId: number;
  category: { id: number; name: string };
  totalQuantity: number;
  rentalPrice: number;
  status: ProductStatus;
  rentedOut: number;
  availableQuantity: number;
}

export interface CategoryType {
  id: number;
  name: string;
  _count: { products: number };
}

export interface RentalType {
  id: number;
  rentalNumber: string;
  customerId: number;
  customer: {
    id: number;
    customerNumber: string;
    fullName: string;
    phone: string;
  };
  startDate: Date;
  endDate: Date;
  status: RentalStatus;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  depositAmount: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  notes: string | null;
  rentalItems: Array<{
    id: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      name: string;
      sku: string;
      rentalPrice: number;
    };
  }>;
  payments: Array<{
    id: number;
    amount: number;
    paymentDate: Date;
    paymentMethod: string;
  }>;
}

export interface PaymentType {
  id: number;
  rentalId: number;
  customerId: number;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber: string | null;
  notes: string | null;
  customer: {
    fullName: string;
    phone: string;
    customerNumber: string;
  };
  rental: {
    rentalNumber: string;
    totalAmount: number;
    amountPaid: number;
    balance: number;
  };
  recordedBy: {
    name: string;
  };
}

export interface ReturnType {
  id: number;
  rentalId: number;
  returnDate: Date;
  notes: string | null;
  recordedBy: { name: string };
  rental: {
    rentalNumber: string;
    customer: { fullName: string; phone: string };
    totalAmount: number;
    balance: number;
  };
  returnItems: Array<{
    id: number;
    quantity: number;
    damagedQuantity: number;
    missingQuantity: number;
    product: {
      name: string;
      sku: string;
    };
  }>;
}
