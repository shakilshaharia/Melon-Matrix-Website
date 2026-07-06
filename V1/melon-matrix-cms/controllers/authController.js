const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.loginForm = (req, res) => {
  res.render("admin/login", { error: null, email: "" });
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = email ? await User.findByEmail(email) : null;
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) {
      return res.status(401).render("admin/login", { error: "Invalid email or password.", email });
    }

    // Prevent session fixation: issue a fresh session on login.
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      req.session.userName = user.name;
      res.redirect("/admin");
    });
  } catch (err) { next(err); }
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.redirect("/admin/login");
  });
};
