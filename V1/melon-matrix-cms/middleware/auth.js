// Guards for the admin area.

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.redirect("/admin/login");
}

// For the login page: already-authenticated users go straight to the dashboard.
function guestOnly(req, res, next) {
  if (req.session && req.session.userId) return res.redirect("/admin");
  return next();
}

module.exports = { requireAuth, guestOnly };
