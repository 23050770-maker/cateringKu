const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to decode JWT payload without verification (useful for local demo without service account)
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT payload:', error);
    return null;
  }
}

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  let firebaseUid = null;
  let email = null;
  let name = null;

  // 1. Check if it is a mock token (e.g. mock_customer_uid_123, mock_tenant_uid_123)
  if (token.startsWith('mock_')) {
    firebaseUid = token;
  } else {
    // 2. Try to parse as standard Firebase JWT
    const decodedPayload = decodeJwtPayload(token);
    if (decodedPayload) {
      // Firebase JWT fields: sub/user_id contains the Firebase UID
      firebaseUid = decodedPayload.sub || decodedPayload.user_id;
      email = decodedPayload.email;
      name = decodedPayload.name;
    } else {
      // If it's not a valid JWT format, treat the token string itself as the firebaseUid
      firebaseUid = token;
    }
  }

  if (!firebaseUid) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
  }

  try {
    // Look up the user in local SQLite database
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { tenant: true },
    });

    if (!user) {
      // For testing/development convenience, if the user doesn't exist,
      // we can automatically register them if it is a mock token
      if (token.startsWith('mock_')) {
        const defaultRole = token.includes('tenant') ? 'TENANT' : 'CUSTOMER';
        const defaultName = token.includes('tenant') ? 'Mock Tenant User' : 'Mock Customer User';
        const defaultEmail = `${firebaseUid}@example.com`;

        console.log(`Auto-creating mock user for token: ${firebaseUid}`);
        
        let tenantId = null;
        if (defaultRole === 'TENANT') {
          // Bind to the first tenant in database for ease of testing
          const firstTenant = await prisma.tenant.findFirst();
          if (firstTenant) {
            tenantId = firstTenant.id;
          }
        }

        const newUser = await prisma.user.create({
          data: {
            firebaseUid,
            email: defaultEmail,
            name: defaultName,
            role: defaultRole,
            tenantId,
          },
          include: { tenant: true },
        });

        req.user = newUser;
        return next();
      }

      return res.status(401).json({ error: 'Unauthorized: User not synced in database' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

// Middleware to enforce Tenant role
function requireTenant(req, res, next) {
  if (!req.user || req.user.role !== 'TENANT') {
    return res.status(403).json({ error: 'Forbidden: Tenant access required' });
  }
  if (!req.user.tenantId) {
    return res.status(403).json({ error: 'Forbidden: User is not linked to any Tenant' });
  }
  next();
}

// Middleware to enforce Customer role
function requireCustomer(req, res, next) {
  if (!req.user || req.user.role !== 'CUSTOMER') {
    return res.status(403).json({ error: 'Forbidden: Customer access required' });
  }
  next();
}

module.exports = {
  verifyToken,
  requireTenant,
  requireCustomer,
};
