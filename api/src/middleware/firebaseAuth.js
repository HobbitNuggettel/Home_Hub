const { firebaseAdmin } = require('../config/firebase-admin');

// Firebase Authentication Middleware
const authenticateFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Firebase ID token required in Authorization header (Bearer token)'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify Firebase ID token
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      
      // Add user info to request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user',
        displayName: decodedToken.name || decodedToken.displayName,
        emailVerified: decodedToken.email_verified || false
      };
      
      console.log(`🔐 Firebase auth successful for user: ${req.user.email} (${req.user.uid})`);
      next();
    } catch (firebaseError) {
      console.error('❌ Firebase token verification failed:', firebaseError.message);
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Firebase ID token is invalid or expired'
      });
    }
  } catch (error) {
    console.error('❌ Firebase auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
};

// Check if user has specific access level for a resource
const checkUserAccess = (requiredLevel = 'read') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
      }

      const userUid = req.user.uid;
      const resourceOwnerId = req.params.userId || req.body.userId || req.query.userId;
      
      // Admin users have full access
      if (req.user.role === 'admin') {
        console.log(`👑 Admin access granted for user: ${req.user.email}`);
        return next();
      }

      // Check if user is accessing their own resource
      if (resourceOwnerId && resourceOwnerId === userUid) {
        console.log(`✅ Owner access granted for user: ${req.user.email}`);
        return next();
      }

      // Check Firebase Realtime Database for granted permissions
      try {
        const db = firebaseAdmin.database();
        const accessRef = db.ref(`userAccess/${resourceOwnerId || 'default'}/canAccess/${userUid}`);
        const accessSnapshot = await accessRef.once('value');
        const accessData = accessSnapshot.val();

        if (!accessData) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'No access permissions found for this resource'
          });
        }

        const userAccessLevel = accessData.accessLevel || 'read';
        
        // Check access level hierarchy
        const accessLevels = ['read', 'write', 'admin'];
        const requiredIndex = accessLevels.indexOf(requiredLevel);
        const userIndex = accessLevels.indexOf(userAccessLevel);

        if (userIndex >= requiredIndex) {
          console.log(`✅ Access granted (${userAccessLevel}) for user: ${req.user.email}`);
          next();
        } else {
          return res.status(403).json({
            error: 'Insufficient permissions',
            message: `Required: ${requiredLevel}, User has: ${userAccessLevel}`,
            requiredLevel,
            userLevel: userAccessLevel
          });
        }
      } catch (dbError) {
        console.error('❌ Database access check failed:', dbError.message);
        
        // In development, allow access if database check fails
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Development mode: allowing access despite database error');
          return next();
        }
        
        return res.status(500).json({
          error: 'Permission check failed',
          message: 'Unable to verify user permissions'
        });
      }
    } catch (error) {
      console.error('❌ Access check middleware error:', error);
      return res.status(500).json({
        error: 'Access check error',
        message: 'Internal server error during permission verification'
      });
    }
  };
};

// Role-based access control
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        error: 'Insufficient role',
        message: `Required role: ${requiredRole}, User role: ${req.user.role}`
      });
    }

    next();
  };
};

// Resource ownership check
const requireOwnershipOrAdmin = (resourceType = 'user') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
      }

      // Admin users can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params.id || req.params.userId;
      
      if (!resourceId) {
        return res.status(400).json({
          error: 'Bad request',
          message: 'Resource ID required'
        });
      }

      // Check if user owns the resource
      if (resourceType === 'user' && resourceId === req.user.uid) {
        return next();
      }

      // For other resource types, check ownership in database
      try {
        const db = firebaseAdmin.database();
        const resourceRef = db.ref(`${resourceType}s/${resourceId}`);
        const resourceSnapshot = await resourceRef.once('value');
        const resourceData = resourceSnapshot.val();

        if (!resourceData) {
          return res.status(404).json({
            error: 'Not found',
            message: `${resourceType} not found`
          });
        }

        if (resourceData.userId === req.user.uid || resourceData.ownerId === req.user.uid) {
          return next();
        }

        return res.status(403).json({
          error: 'Access denied',
          message: `You don't own this ${resourceType}`
        });
      } catch (dbError) {
        console.error('❌ Resource ownership check failed:', dbError.message);
        
        // In development, allow access if database check fails
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Development mode: allowing access despite ownership check error');
          return next();
        }
        
        return res.status(500).json({
          error: 'Ownership check failed',
          message: 'Unable to verify resource ownership'
        });
      }
    } catch (error) {
      console.error('❌ Ownership check middleware error:', error);
      return res.status(500).json({
        error: 'Ownership check error',
        message: 'Internal server error during ownership verification'
      });
    }
  };
};

module.exports = {
  authenticateFirebaseToken,
  checkUserAccess,
  requireRole,
  requireOwnershipOrAdmin
};
