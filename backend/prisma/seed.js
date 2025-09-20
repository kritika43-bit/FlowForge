const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create users
    console.log('👥 Creating users...');
    
    const adminPassword = await bcrypt.hash('admin123', 10);
    const managerPassword = await bcrypt.hash('manager123', 10);
    const operatorPassword = await bcrypt.hash('operator123', 10);
    const inventoryPassword = await bcrypt.hash('inventory123', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@flowforge.com' },
      update: {},
      create: {
        email: 'admin@flowforge.com',
        password: adminPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        position: 'System Admin',
        department: 'IT',
        isActive: true,
      },
    });

    const manager = await prisma.user.upsert({
      where: { email: 'manager@flowforge.com' },
      update: {},
      create: {
        email: 'manager@flowforge.com',
        password: managerPassword,
        firstName: 'Production',
        lastName: 'Manager',
        role: 'MANAGER',
        position: 'Production Manager',
        department: 'Production',
        isActive: true,
      },
    });

    const operator = await prisma.user.upsert({
      where: { email: 'operator@flowforge.com' },
      update: {},
      create: {
        email: 'operator@flowforge.com',
        password: operatorPassword,
        firstName: 'Machine',
        lastName: 'Operator',
        role: 'OPERATOR',
        position: 'Machine Operator',
        department: 'Production',
        isActive: true,
      },
    });

    const inventoryUser = await prisma.user.upsert({
      where: { email: 'inventory@flowforge.com' },
      update: {},
      create: {
        email: 'inventory@flowforge.com',
        password: inventoryPassword,
        firstName: 'Inventory',
        lastName: 'Manager',
        role: 'INVENTORY',
        position: 'Inventory Manager',
        department: 'Warehouse',
        isActive: true,
      },
    });

    console.log(`✅ Created ${[admin, manager, operator, inventoryUser].length} users`);

    // Create work centers
    console.log('🏭 Creating work centers...');
    
    const workCenters = await Promise.all([
      prisma.workCenter.upsert({
        where: { name: 'Assembly Line 1' },
        update: {},
        create: {
          name: 'Assembly Line 1',
          type: 'ASSEMBLY',
          location: 'Floor 1, Section A',
          status: 'RUNNING',
          capacity: 3,
          hourlyCost: 25.00,
        },
      }),
      prisma.workCenter.upsert({
        where: { name: 'CNC Machine 1' },
        update: {},
        create: {
          name: 'CNC Machine 1',
          type: 'MACHINING',
          location: 'Floor 2, Section B',
          status: 'RUNNING',
          capacity: 1,
          hourlyCost: 45.00,
        },
      }),
      prisma.workCenter.upsert({
        where: { name: 'Quality Control Station' },
        update: {},
        create: {
          name: 'Quality Control Station',
          type: 'QUALITY',
          location: 'Floor 1, Section C',
          status: 'RUNNING',
          capacity: 2,
          hourlyCost: 30.00,
        },
      }),
      prisma.workCenter.upsert({
        where: { name: 'Packaging Line' },
        update: {},
        create: {
          name: 'Packaging Line',
          type: 'PACKAGING',
          location: 'Floor 1, Section D',
          status: 'RUNNING',
          capacity: 2,
          hourlyCost: 20.00,
        },
      }),
    ]);

    console.log(`✅ Created ${workCenters.length} work centers`);

    // Create stock items (components)
    console.log('📦 Creating stock items...');
    
    const stockItems = await Promise.all([
      prisma.stockItem.upsert({
        where: { sku: 'COMP-001' },
        update: {},
        create: {
          name: 'Microcontroller Board',
          sku: 'COMP-001',
          description: 'Arduino-compatible microcontroller board',
          category: 'ELECTRONICS',
          quantity: 150,
          unitCost: 12.50,
          reorderPoint: 20,
          maxStock: 500,
          location: 'Warehouse A-1',
          supplier: 'TechParts Inc.',
        },
      }),
      prisma.stockItem.upsert({
        where: { sku: 'COMP-002' },
        update: {},
        create: {
          name: 'LED Display Module',
          sku: 'COMP-002',
          description: '16x2 LCD display with backlight',
          category: 'ELECTRONICS',
          quantity: 75,
          unitCost: 8.75,
          reorderPoint: 10,
          maxStock: 200,
          location: 'Warehouse A-2',
          supplier: 'DisplayTech Co.',
        },
      }),
      prisma.stockItem.upsert({
        where: { sku: 'COMP-003' },
        update: {},
        create: {
          name: 'Plastic Enclosure',
          sku: 'COMP-003',
          description: 'ABS plastic enclosure with mounting holes',
          category: 'MECHANICAL',
          quantity: 200,
          unitCost: 3.25,
          reorderPoint: 25,
          maxStock: 1000,
          location: 'Warehouse B-1',
          supplier: 'PlasticWorks Ltd.',
        },
      }),
      prisma.stockItem.upsert({
        where: { sku: 'COMP-004' },
        update: {},
        create: {
          name: 'Power Supply Unit',
          sku: 'COMP-004',
          description: '12V 2A switching power supply',
          category: 'ELECTRONICS',
          quantity: 50,
          unitCost: 15.00,
          reorderPoint: 8,
          maxStock: 100,
          location: 'Warehouse A-3',
          supplier: 'PowerTech Inc.',
        },
      }),
      prisma.stockItem.upsert({
        where: { sku: 'COMP-005' },
        update: {},
        create: {
          name: 'Connecting Cables',
          sku: 'COMP-005',
          description: 'Set of jumper wires and connectors',
          category: 'ELECTRONICS',
          quantity: 300,
          unitCost: 2.50,
          reorderPoint: 50,
          maxStock: 1000,
          location: 'Warehouse A-4',
          supplier: 'CableMaster Corp.',
        },
      }),
    ]);

    console.log(`✅ Created ${stockItems.length} stock items`);

    // Create products
    console.log('🛠️ Creating products...');
    
    const products = await Promise.all([
      prisma.product.upsert({
        where: { name: 'Smart Home Controller' },
        update: {},
        create: {
          name: 'Smart Home Controller',
          description: 'WiFi-enabled home automation controller with LCD display',
          category: 'ELECTRONICS',
          sku: 'PROD-001',
          unitPrice: 89.99,
          leadTime: 5,
        },
      }),
      prisma.product.upsert({
        where: { name: 'Industrial Sensor Module' },
        update: {},
        create: {
          name: 'Industrial Sensor Module',
          description: 'Multi-sensor environmental monitoring device',
          category: 'ELECTRONICS',
          sku: 'PROD-002',
          unitPrice: 129.99,
          leadTime: 7,
        },
      }),
    ]);

    console.log(`✅ Created ${products.length} products`);

    // Create BOMs
    console.log('📋 Creating Bills of Materials...');
    
    const smartHomeBOM = await prisma.billOfMaterials.create({
      data: {
        productId: products[0].id,
        name: 'Smart Home Controller v1.0',
        version: '1.0',
        description: 'Complete BOM for Smart Home Controller',
        status: 'ACTIVE',
      },
    });

    const bomItems = await Promise.all([
      prisma.bomItem.create({
        data: {
          bomId: smartHomeBOM.id,
          componentId: stockItems[0].id, // Microcontroller
          quantity: 1,
          unit: 'pcs',
          sequence: 1,
        },
      }),
      prisma.bomItem.create({
        data: {
          bomId: smartHomeBOM.id,
          componentId: stockItems[1].id, // LED Display
          quantity: 1,
          unit: 'pcs',
          sequence: 2,
        },
      }),
      prisma.bomItem.create({
        data: {
          bomId: smartHomeBOM.id,
          componentId: stockItems[2].id, // Plastic Enclosure
          quantity: 1,
          unit: 'pcs',
          sequence: 3,
        },
      }),
      prisma.bomItem.create({
        data: {
          bomId: smartHomeBOM.id,
          componentId: stockItems[3].id, // Power Supply
          quantity: 1,
          unit: 'pcs',
          sequence: 4,
        },
      }),
      prisma.bomItem.create({
        data: {
          bomId: smartHomeBOM.id,
          componentId: stockItems[4].id, // Cables
          quantity: 1,
          unit: 'set',
          sequence: 5,
        },
      }),
    ]);

    console.log(`✅ Created BOM with ${bomItems.length} items`);

    // Create manufacturing orders
    console.log('📋 Creating manufacturing orders...');
    
    const manufacturingOrders = await Promise.all([
      prisma.manufacturingOrder.create({
        data: {
          orderNumber: 'MO-2024-001',
          productId: products[0].id,
          quantity: 50,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          priority: 'HIGH',
          assignedToId: manager.id,
          estimatedCost: 1625.00, // 50 * (12.50 + 8.75 + 3.25 + 15.00 + 2.50)
          status: 'PENDING',
          notes: 'Priority order for customer ABC Corp',
        },
      }),
      prisma.manufacturingOrder.create({
        data: {
          orderNumber: 'MO-2024-002',
          productId: products[1].id,
          quantity: 25,
          deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
          priority: 'MEDIUM',
          assignedToId: manager.id,
          estimatedCost: 1050.00,
          status: 'PENDING',
          notes: 'Standard production batch',
        },
      }),
    ]);

    console.log(`✅ Created ${manufacturingOrders.length} manufacturing orders`);

    // Create work orders
    console.log('🔧 Creating work orders...');
    
    const workOrders = await Promise.all([
      prisma.workOrder.create({
        data: {
          workOrderNumber: 'WO-2024-0001',
          manufacturingOrderId: manufacturingOrders[0].id,
          workCenterId: workCenters[0].id, // Assembly Line 1
          operation: 'Main Assembly',
          estimatedDuration: 480, // 8 hours
          assignedToId: operator.id,
          sequence: 1,
          notes: 'Assemble main components',
          status: 'PENDING',
        },
      }),
      prisma.workOrder.create({
        data: {
          workOrderNumber: 'WO-2024-0002',
          manufacturingOrderId: manufacturingOrders[0].id,
          workCenterId: workCenters[2].id, // Quality Control
          operation: 'Quality Inspection',
          estimatedDuration: 120, // 2 hours
          assignedToId: operator.id,
          sequence: 2,
          notes: 'Final quality check and testing',
          status: 'PENDING',
        },
      }),
      prisma.workOrder.create({
        data: {
          workOrderNumber: 'WO-2024-0003',
          manufacturingOrderId: manufacturingOrders[0].id,
          workCenterId: workCenters[3].id, // Packaging
          operation: 'Packaging',
          estimatedDuration: 60, // 1 hour
          assignedToId: operator.id,
          sequence: 3,
          notes: 'Package and label products',
          status: 'PENDING',
        },
      }),
    ]);

    console.log(`✅ Created ${workOrders.length} work orders`);

    // Create some stock movements
    console.log('📊 Creating stock movements...');
    
    const stockMovements = await Promise.all([
      prisma.stockMovement.create({
        data: {
          stockItemId: stockItems[0].id,
          type: 'IN',
          quantity: 100,
          previousQuantity: 50,
          newQuantity: 150,
          reference: 'PO-2024-001',
          notes: 'Purchase order delivery',
          userId: inventoryUser.id,
        },
      }),
      prisma.stockMovement.create({
        data: {
          stockItemId: stockItems[1].id,
          type: 'OUT',
          quantity: 25,
          previousQuantity: 100,
          newQuantity: 75,
          reference: 'MO-2024-001',
          notes: 'Used for manufacturing order',
          userId: inventoryUser.id,
        },
      }),
    ]);

    console.log(`✅ Created ${stockMovements.length} stock movements`);

    // Create user activities
    console.log('📝 Creating user activities...');
    
    await Promise.all([
      prisma.userActivity.create({
        data: {
          type: 'login',
          description: 'User logged in to the system',
          userId: admin.id,
        },
      }),
      prisma.userActivity.create({
        data: {
          type: 'order_created',
          description: 'Created manufacturing order MO-2024-001',
          userId: manager.id,
          metadata: { orderId: manufacturingOrders[0].id },
        },
      }),
    ]);

    console.log('✅ Created user activities');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: 4 (admin, manager, operator, inventory)`);
    console.log(`🏭 Work Centers: ${workCenters.length}`);
    console.log(`📦 Stock Items: ${stockItems.length}`);
    console.log(`🛠️ Products: ${products.length}`);
    console.log(`📋 Manufacturing Orders: ${manufacturingOrders.length}`);
    console.log(`🔧 Work Orders: ${workOrders.length}`);
    console.log(`📊 Stock Movements: ${stockMovements.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@flowforge.com / admin123');
    console.log('Manager: manager@flowforge.com / manager123');
    console.log('Operator: operator@flowforge.com / operator123');
    console.log('Inventory: inventory@flowforge.com / inventory123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
