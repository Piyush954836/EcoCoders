// middleware/authMiddleware.js
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
      // User is logged in, proceed to the next middleware
      return next();
  }
  // If not logged in, redirect to the login page
  res.redirect('/login');
}

module.exports = ensureAuthenticated;
