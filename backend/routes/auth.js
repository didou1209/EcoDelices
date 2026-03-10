const express = require("express");
const router = express.Router();

/**
 * Démo login:
 * admin/admin -> role=admin
 * client/client -> role=client
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (username === "admin" && password === "admin") {
    return res.json({ ok: true, role: "admin", username: "admin" });
  }

  if (username === "client" && password === "client") {
    return res.json({ ok: true, role: "client", username: "client" });
  }

  return res.status(401).json({ ok: false, message: "Identifiants invalides" });
});

router.post("/logout", (req, res) => {
  res.json({ ok: true });
});

module.exports = router;