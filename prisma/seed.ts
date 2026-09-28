import { PrismaClient, Role, ProductStatus, RentalStatus, PaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.returnItem.deleteMany();
  await prisma.return.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rentalItem.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@rentalms.com',
      password: 'adminpassword123',
      name: 'System Admin',
      role: Role.ADMIN,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@rentalms.com',
      password: 'staffpassword123',
      name: 'Sarah Staff',
      role: Role.STAFF,
    },
  });

  // Create Categories
  const catCameras = await prisma.category.create({ data: { name: 'Cameras & Lenses' } });
  const catAudio = await prisma.category.create({ data: { name: 'Audio & Microphones' } });
  const catLighting = await prisma.category.create({ data: { name: 'Lighting & Studio' } });
  const catDrones = await prisma.category.create({ data: { name: 'Drones & Gimbals' } });
  const catHeavy = await prisma.category.create({ data: { name: 'Power & Heavy Machinery' } });

  // Create Products
  const prod1 = await prisma.product.create({
    data: {
      sku: 'CAM-SONY-FX3',
      name: 'Sony FX3 Cinema Line Camera',
      description: 'Full-frame cinema camera with 4K 120p, 10-bit 4:2:2 and top handle XLR.',
      categoryId: catCameras.id,
      totalQuantity: 5,
      rentalPrice: 85.00,
      status: ProductStatus.ACTIVE,
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      sku: 'CAM-CANON-R5',
      name: 'Canon EOS R5 Mirrorless Camera',
      description: '45MP Full-Frame sensor, 8K RAW video, and dual pixel CMOS AF II.',
      categoryId: catCameras.id,
      totalQuantity: 4,
      rentalPrice: 75.00,
      status: ProductStatus.ACTIVE,
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      sku: 'LENS-SONY-2470',
      name: 'Sony FE 24-70mm f/2.8 GM II Lens',
      description: 'Fast standard zoom lens offering exceptional G Master optics.',
      categoryId: catCameras.id,
      totalQuantity: 8,
      rentalPrice: 35.00,
      status: ProductStatus.ACTIVE,
    },
  });

  const prod4 = await prisma.product.create({
    data: {
      sku: 'AUD-RODE-WIRELESS',
      name: 'Rode Wireless PRO Dual Mic System',
      description: 'Compact wireless dual transmitter mic system with 32-bit float onboard recording.',
      categoryId: catAudio.id,
      totalQuantity: 10,
      rentalPrice: 25.00,
      status: ProductStatus.ACTIVE,
    },
  });

  const prod5 = await prisma.product.create({
    data: {
      sku: 'LIGHT-APUTURE-600D',
      name: 'Aputure LS 600d Pro Daylight LED',
      description: 'Powerful 600W daylight-balanced COB LED light fixture for film & photo sets.',
      categoryId: catLighting.id,
      totalQuantity: 6,
      rentalPrice: 60.00,
      status: ProductStatus.ACTIVE,
    },
  });

  const prod6 = await prisma.product.create({
    data: {
      sku: 'DRONE-DJI-M3PRO',
      name: 'DJI Mavic 3 Pro Cine Drone',
      description: 'Triple-camera drone with Hasselblad 4/3 CMOS camera and 43 mins flight time.',
      categoryId: catDrones.id,
      totalQuantity: 3,
      rentalPrice: 120.00,
      status: ProductStatus.ACTIVE,
    },
  });

  const prod7 = await prisma.product.create({
    data: {
      sku: 'GEN-HONDA-EU3000',
      name: 'Honda EU3000iS Inverter Generator',
      description: 'Super quiet 3000W portable inverter generator with electric start.',
      categoryId: catHeavy.id,
      totalQuantity: 2,
      rentalPrice: 50.00,
      status: ProductStatus.ACTIVE,
    },
  });

  // Create Customers
  const cust1 = await prisma.customer.create({
    data: {
      customerNumber: 'CUS-00001',
      fullName: 'Alex Rivera',
      phone: '+1 (555) 234-5678',
      email: 'alex.rivera@visualarts.com',
      address: '742 Evergreen Terrace, Springfield, IL',
      notes: 'VIP Commercial Videographer, always returns equipment in pristine condition.',
    },
  });

  const cust2 = await prisma.customer.create({
    data: {
      customerNumber: 'CUS-00002',
      fullName: 'Elena Rostova',
      phone: '+1 (555) 876-5432',
      email: 'elena@novaproductions.org',
      address: '1048 Ocean Avenue, Santa Monica, CA',
      notes: 'Documentary filmmaker. Preferred payment via Bank Transfer.',
    },
  });

  const cust3 = await prisma.customer.create({
    data: {
      customerNumber: 'CUS-00003',
      fullName: 'Marcus Sterling',
      phone: '+1 (555) 432-1098',
      email: 'm.sterling@eventspro.net',
      address: '500 Madison St, Austin, TX',
      notes: 'Corporate event coordinator, frequently books lighting and audio systems.',
    },
  });

  // Create Rentals
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Active Rental 1
  const rental1 = await prisma.rental.create({
    data: {
      rentalNumber: 'REN-00001',
      customerId: cust1.id,
      startDate: threeDaysAgo,
      endDate: tomorrow,
      status: RentalStatus.ACTIVE,
      subtotal: 360.00,
      discount: 20.00,
      deliveryFee: 15.00,
      depositAmount: 150.00,
      totalAmount: 355.00,
      amountPaid: 355.00,
      balance: 0.00,
      notes: 'Weekend indie shoot on location.',
      createdById: admin.id,
      rentalItems: {
        create: [
          { productId: prod1.id, quantity: 1, unitPrice: 85.00, subtotal: 85.00 },
          { productId: prod3.id, quantity: 1, unitPrice: 35.00, subtotal: 35.00 },
          { productId: prod5.id, quantity: 2, unitPrice: 60.00, subtotal: 120.00 },
          { productId: prod6.id, quantity: 1, unitPrice: 120.00, subtotal: 120.00 },
        ],
      },
    },
  });

  // Payment for Rental 1
  await prisma.payment.create({
    data: {
      rentalId: rental1.id,
      customerId: cust1.id,
      amount: 355.00,
      paymentMethod: PaymentMethod.E_WALLET,
      referenceNumber: 'PAY-WLT-994821',
      notes: 'Full payment settled upon pickup.',
      recordedById: admin.id,
    },
  });

  // Pending Rental 2
  const rental2 = await prisma.rental.create({
    data: {
      rentalNumber: 'REN-00002',
      customerId: cust2.id,
      startDate: tomorrow,
      endDate: nextWeek,
      status: RentalStatus.CONFIRMED,
      subtotal: 510.00,
      discount: 0.00,
      deliveryFee: 25.00,
      depositAmount: 200.00,
      totalAmount: 535.00,
      amountPaid: 200.00,
      balance: 335.00,
      notes: 'Deposit paid. Balance to be settled upon return.',
      createdById: staff.id,
      rentalItems: {
        create: [
          { productId: prod2.id, quantity: 2, unitPrice: 75.00, subtotal: 150.00 },
          { productId: prod4.id, quantity: 2, unitPrice: 25.00, subtotal: 50.00 },
          { productId: prod5.id, quantity: 1, unitPrice: 60.00, subtotal: 60.00 },
          { productId: prod7.id, quantity: 1, unitPrice: 50.00, subtotal: 50.00 },
        ],
      },
    },
  });

  // Deposit Payment for Rental 2
  await prisma.payment.create({
    data: {
      rentalId: rental2.id,
      customerId: cust2.id,
      amount: 200.00,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      referenceNumber: 'TXN-BNK-883719',
      notes: '50% advance security deposit received.',
      recordedById: staff.id,
    },
  });

  // Completed Rental 3 with Return
  const lastWeek = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  const rental3 = await prisma.rental.create({
    data: {
      rentalNumber: 'REN-00003',
      customerId: cust3.id,
      startDate: lastWeek,
      endDate: fiveDaysAgo,
      status: RentalStatus.COMPLETED,
      subtotal: 210.00,
      discount: 10.00,
      deliveryFee: 0.00,
      depositAmount: 100.00,
      totalAmount: 200.00,
      amountPaid: 200.00,
      balance: 0.00,
      notes: 'Stage lighting setup for evening gala.',
      createdById: admin.id,
      rentalItems: {
        create: [
          { productId: prod5.id, quantity: 3, unitPrice: 60.00, subtotal: 180.00 },
          { productId: prod4.id, quantity: 1, unitPrice: 25.00, subtotal: 25.00 },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      rentalId: rental3.id,
      customerId: cust3.id,
      amount: 200.00,
      paymentMethod: PaymentMethod.CASH,
      referenceNumber: 'CSH-RECEIPT-401',
      notes: 'Cash payment settled in full.',
      recordedById: admin.id,
    },
  });

  const returnRecord = await prisma.return.create({
    data: {
      rentalId: rental3.id,
      notes: 'Returned on time. All units tested and working properly.',
      recordedById: admin.id,
      returnItems: {
        create: [
          { productId: prod5.id, quantity: 3, damagedQuantity: 0, missingQuantity: 0 },
          { productId: prod4.id, quantity: 1, damagedQuantity: 0, missingQuantity: 0 },
        ],
      },
    },
  });

  // Create Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { action: 'SYSTEM_INITIALIZED', performedById: admin.id, details: JSON.stringify({ version: '1.0.0' }) },
      { action: 'CUSTOMER_CREATED', performedById: admin.id, details: JSON.stringify({ customer: cust1.fullName }) },
      { action: 'RENTAL_CREATED', performedById: admin.id, details: JSON.stringify({ rentalNumber: rental1.rentalNumber }) },
      { action: 'PAYMENT_RECORDED', performedById: admin.id, details: JSON.stringify({ amount: 355.00, rental: rental1.rentalNumber }) },
      { action: 'RETURN_PROCESSED', performedById: admin.id, details: JSON.stringify({ rental: rental3.rentalNumber, returnId: returnRecord.id }) },
    ],
  });

  console.log('Seeding complete! Sample data ready.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
