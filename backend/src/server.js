const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireTenant, requireCustomer } = require('./middleware/auth');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 1. Auth & User Sync
// ==========================================
app.post('/api/auth/sync', async (req, res) => {
  const { firebaseUid, email, name, role, tenantId } = req.body;

  if (!firebaseUid || !email || !name || !role) {
    return res.status(400).json({ error: 'Missing required fields: firebaseUid, email, name, role' });
  }

  if (!['CUSTOMER', 'TENANT', 'SUPER_ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be CUSTOMER, TENANT, or SUPER_ADMIN' });
  }

  try {
    // Find existing user by firebaseUid or email to avoid unique constraint conflicts
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid },
          { email }
        ]
      },
      include: {
        tenant: true,
      }
    });

    if (user) {
      // Update existing user, mapping them to the new firebaseUid/email
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseUid,
          email,
          name,
          role,
          tenantId: role === 'TENANT' ? tenantId : null,
        },
        include: {
          tenant: true,
        }
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          firebaseUid,
          email,
          name,
          role,
          tenantId: role === 'TENANT' ? tenantId : null,
        },
        include: {
          tenant: true,
        }
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// ==========================================
// 2. Customer Endpoints
// ==========================================

// POST /api/tenants : Create a new tenant (mitra catering)
app.post('/api/tenants', async (req, res) => {
  const { name, description, address } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing required field: name' });
  }

  try {
    const newTenant = await prisma.tenant.create({
      data: {
        name,
        description,
        address,
      },
    });
    res.status(201).json(newTenant);
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// GET /api/tenants : List all available caterings
app.get('/api/tenants', verifyToken, async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// GET /api/tenants/:tenantId/menus?date=YYYY-MM-DD : Get menus for a specific tenant on a specific date
app.get('/api/tenants/:tenantId/menus', verifyToken, async (req, res) => {
  const { tenantId } = req.params;
  const { date } = req.query; // format YYYY-MM-DD

  if (!date) {
    return res.status(400).json({ error: 'Query parameter "date" (YYYY-MM-DD) is required' });
  }

  try {
    // 1. Get all menus for this tenant on the specified date
    const menus = await prisma.menu.findMany({
      where: {
        tenantId,
        availableAt: date,
      },
    });

    // 2. For each menu, calculate the remaining quota
    const menusWithRemainingQuota = await Promise.all(
      menus.map(async (menu) => {
        // Sum the quantities of this menu in PAID orders for this target date
        const paidItems = await prisma.orderItem.findMany({
          where: {
            menuId: menu.id,
            targetDate: date,
            order: {
              paymentStatus: 'PAID',
            },
          },
        });

        const totalPaidQuantity = paidItems.reduce((sum, item) => sum + item.quantity, 0);
        const remainingQuota = Math.max(0, menu.maxQuota - totalPaidQuantity);

        return {
          ...menu,
          remainingQuota,
          orderedQuantity: totalPaidQuantity,
        };
      })
    );

    res.json(menusWithRemainingQuota);
  } catch (error) {
    console.error('Error fetching menus for tenant:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

// POST /api/orders : Create a pre-order with paymentStatus "PENDING"
app.post('/api/orders', verifyToken, requireCustomer, async (req, res) => {
  const { tenantId, items } = req.body; // items: [{ menuId, quantity, targetDate }]

  if (!tenantId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: tenantId, items (array)' });
  }

  try {
    let totalAmount = 0;
    const itemsWithPrices = [];

    // Verify all menus exist, match the tenant, and have sufficient quota
    for (const item of items) {
      const { menuId, quantity, targetDate } = item;

      if (!menuId || !quantity || quantity <= 0 || !targetDate) {
        return res.status(400).json({ error: 'Invalid order item. Must specify menuId, quantity > 0, and targetDate' });
      }

      const menu = await prisma.menu.findUnique({
        where: { id: menuId },
      });

      if (!menu) {
        return res.status(400).json({ error: `Menu with ID ${menuId} not found` });
      }

      if (menu.tenantId !== tenantId) {
        return res.status(400).json({ error: `Menu ${menu.name} does not belong to the selected tenant` });
      }

      // Calculate remaining quota for this menu on targetDate
      const paidItems = await prisma.orderItem.findMany({
        where: {
          menuId: menu.id,
          targetDate: targetDate,
          order: {
            paymentStatus: 'PAID',
          },
        },
      });

      const totalPaidQuantity = paidItems.reduce((sum, item) => sum + item.quantity, 0);
      const remainingQuota = menu.maxQuota - totalPaidQuantity;

      if (quantity > remainingQuota) {
        return res.status(400).json({
          error: `Stok/Quota tidak mencukupi untuk menu: ${menu.name}. Sisa kuota: ${remainingQuota}, diminta: ${quantity}`,
        });
      }

      totalAmount += menu.price * quantity;
      itemsWithPrices.push({
        menuId,
        quantity,
        targetDate,
        price: menu.price,
      });
    }

    // Create order and order items in transaction
    const order = await prisma.order.create({
      data: {
        customerId: req.user.id,
        tenantId,
        totalAmount,
        paymentStatus: 'PENDING',
        orderItems: {
          create: itemsWithPrices.map((item) => ({
            menuId: item.menuId,
            quantity: item.quantity,
            targetDate: item.targetDate,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            menu: true,
          },
        },
        tenant: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders : Customer orders history
app.get('/api/orders', verifyToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        customerId: req.user.id,
      },
      include: {
        orderItems: {
          include: {
            menu: true,
          },
        },
        tenant: true,
      },
      orderBy: {
        orderDate: 'desc',
      },
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ==========================================
// 3. Dummy Payment Endpoint
// ==========================================

// PATCH /api/orders/:id/pay : Updates the order status to PAID or FAILED
app.patch('/api/orders/:id/pay', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "PAID" or "FAILED"

  if (!status || !['PAID', 'FAILED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid payment status. Must be "PAID" or "FAILED"' });
  }

  try {
    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Double check quota if status changes to PAID
    if (status === 'PAID') {
      for (const item of order.orderItems) {
        const menu = await prisma.menu.findUnique({
          where: { id: item.menuId },
        });

        if (!menu) {
          return res.status(400).json({ error: `Menu item not found for order item` });
        }

        // Calculate remaining quota (excluding current order in case it was already paid)
        const paidItems = await prisma.orderItem.findMany({
          where: {
            menuId: menu.id,
            targetDate: item.targetDate,
            order: {
              paymentStatus: 'PAID',
              id: { not: id }, // exclude this order
            },
          },
        });

        const totalPaidQuantity = paidItems.reduce((sum, i) => sum + i.quantity, 0);
        const remainingQuota = menu.maxQuota - totalPaidQuantity;

        if (item.quantity > remainingQuota) {
          // Fail the payment if quota got consumed in the meantime
          await prisma.order.update({
            where: { id },
            data: { 
              paymentStatus: 'FAILED',
              status: 'CANCELLED'
            },
          });
          return res.status(400).json({
            error: `Gagal membayar: Kuota untuk menu ${menu.name} sudah penuh. Status pesanan diubah menjadi FAILED.`,
          });
        }
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        paymentStatus: status,
        status: status === 'PAID' ? 'PAID' : 'CANCELLED'
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to process payment status update' });
  }
});

// ==========================================
// 4. Tenant Endpoints
// ==========================================

// GET /api/tenant/menus : List all menus created by this tenant
app.get('/api/tenant/menus', verifyToken, requireTenant, async (req, res) => {
  try {
    const menus = await prisma.menu.findMany({
      where: {
        tenantId: req.user.tenantId, // Enforce Multi-Tenant Isolation
      },
      orderBy: [{ availableAt: 'desc' }, { name: 'asc' }],
    });
    res.json(menus);
  } catch (error) {
    console.error('Error fetching tenant menus:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

// POST /api/tenant/menus : Create a new daily menu
app.post('/api/tenant/menus', verifyToken, requireTenant, async (req, res) => {
  const { name, description, price, maxQuota, availableAt } = req.body;

  if (!name || !price || !maxQuota || !availableAt) {
    return res.status(400).json({ error: 'Missing required fields: name, price, maxQuota, availableAt (YYYY-MM-DD)' });
  }

  try {
    const newMenu = await prisma.menu.create({
      data: {
        tenantId: req.user.tenantId, // Enforce Multi-Tenant Isolation
        name,
        description,
        price: parseFloat(price),
        maxQuota: parseInt(maxQuota),
        availableAt,
      },
    });
    res.status(201).json(newMenu);
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).json({ error: 'Failed to create menu' });
  }
});

// GET /api/tenant/kitchen-rekap?date=YYYY-MM-DD : Aggregate total quantities of each menu to be cooked for a specific date (PAID only)
app.get('/api/tenant/kitchen-rekap', verifyToken, requireTenant, async (req, res) => {
  const { date } = req.query; // format YYYY-MM-DD

  if (!date) {
    return res.status(400).json({ error: 'Query parameter "date" (YYYY-MM-DD) is required' });
  }

  try {
    // Get all order items for this tenant and target date where paymentStatus is PAID
    const orderItems = await prisma.orderItem.findMany({
      where: {
        targetDate: date,
        order: {
          tenantId: req.user.tenantId, // Enforce Multi-Tenant Isolation
          paymentStatus: 'PAID',
        },
      },
      include: {
        menu: true,
      },
    });

    // Aggregate quantities by menu
    const aggregation = {};
    orderItems.forEach((item) => {
      if (!aggregation[item.menuId]) {
        aggregation[item.menuId] = {
          menuId: item.menuId,
          name: item.menu.name,
          description: item.menu.description,
          price: item.menu.price,
          totalQuantity: 0,
        };
      }
      aggregation[item.menuId].totalQuantity += item.quantity;
    });

    const rekapList = Object.values(aggregation);
    res.json(rekapList);
  } catch (error) {
    console.error('Error generating kitchen rekap:', error);
    res.status(500).json({ error: 'Failed to generate kitchen rekap' });
  }
});

// GET /api/tenant/orders : Get all orders placed with this tenant
app.get('/api/tenant/orders', verifyToken, requireTenant, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        tenantId: req.user.tenantId,
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            menu: true,
          },
        },
      },
      orderBy: {
        orderDate: 'desc',
      },
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching tenant orders:', error);
    res.status(500).json({ error: 'Failed to fetch tenant orders' });
  }
});

// PATCH /api/tenant/orders/:id/status : Update status of an order (PREPARING, SHIPPED, COMPLETED, CANCELLED)
app.patch('/api/tenant/orders/:id/status', verifyToken, requireTenant, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "PAID", "PREPARING", "SHIPPED", "COMPLETED", "CANCELLED"

  if (!status || !['PAID', 'PREPARING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid order status. Must be PAID, PREPARING, SHIPPED, COMPLETED, or CANCELLED' });
  }

  try {
    // Verify order belongs to this tenant
    const order = await prisma.order.findFirst({
      where: {
        id,
        tenantId: req.user.tenantId,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found or access denied' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// GET /api/tenant/stats : Get dashboard statistics for tenant (active menus count, total orders, total revenue)
app.get('/api/tenant/stats', verifyToken, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // 1. Total active/created menus
    const menuCount = await prisma.menu.count({
      where: { tenantId },
    });

    // 2. Total PAID orders
    const orderCount = await prisma.order.count({
      where: {
        tenantId,
        paymentStatus: 'PAID',
      },
    });

    // 3. Total revenue from PAID orders
    const revenueAggregate = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        tenantId,
        paymentStatus: 'PAID',
      },
    });

    const totalRevenue = revenueAggregate._sum.totalAmount || 0;

    res.json({
      menuCount,
      orderCount,
      totalRevenue,
    });
  } catch (error) {
    console.error('Error fetching tenant stats:', error);
    res.status(500).json({ error: 'Failed to fetch tenant stats' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Catering backend server is running on http://localhost:${PORT}`);
});
