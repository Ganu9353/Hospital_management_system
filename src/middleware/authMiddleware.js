// middlewares/authMiddleware.js
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next(); // Proceed to next middleware or route
  }
  return res.redirect('/login');
};

exports.isAdmin = (req, res, next) => {
  if (req.session?.user?.role === 'ADMIN') {
    return next();
  }
  return res.status(403).send('Access denied: Admins only');
};

exports.isDoctor = (req, res, next) => {
  if (req.session?.user?.role === 'DOCTOR') {
    return next();
  }
  return res.status(403).send('Access denied: Doctors only');
};

exports.isReceptionist = (req, res, next) => {
  if (req.session?.user?.role === 'RECEPTIONIST') {
    return next();
  }
  return res.status(403).send('Access denied: Receptionists only');
};
