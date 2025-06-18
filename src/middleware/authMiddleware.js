exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  return res.status(401).send('Unauthorized: Please login first.');
};

exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'ADMIN') return next();
  return res.status(401).send('Unauthorized: Admin only.');
};

exports.isDoctor = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'DOCTOR') return next();
  return res.status(401).send('Unauthorized: Doctor only.');
};

exports.isReceptionist = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'RECEPTIONIST') return next();
  return res.status(401).send('Unauthorized: Receptionist only.');
};
