const express = require("express");
const router = express.Router();

// Démo : endpoint admin
router.get("/ping", (req, res) => {
  res.json({ ok: true, message: "Admin route OK" });
});

module.exports = router;