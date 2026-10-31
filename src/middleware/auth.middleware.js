/**
 * Authentication and Authorization Middleware
 */

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user || !req.session.user.id) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in.'
    });
  }
  next();
}

function requireRole(requiredRole) {
  return function (req, res, next) {
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    if (req.session.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires '${requiredRole}' privileges.`
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};

