const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, price, size, category, description, image FROM products ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/products", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "INVALID_ID" });

    const [rows] = await db.query(
      "SELECT id, name, price, size, category, description, image FROM products WHERE id = ?",
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: "NOT_FOUND" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/products/:id", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const { name, price, size, category, description, image } = req.body;

    if (!name || !Number.isFinite(Number(price))) {
      return res.status(400).json({ error: "NAME_AND_PRICE_REQUIRED" });
    }

    const payload = {
      name: String(name).trim(),
      price: Number(price),
      size: String(size || "").trim(),
      category: String(category || "").trim(),
      description: String(description || "").trim(),
      image: String(image || "").trim(),
    };

    const [result] = await db.query(
      "INSERT INTO products (name, price, size, category, description, image) VALUES (?,?,?,?,?,?)",
      [payload.name, payload.price, payload.size, payload.category, payload.description, payload.image]
    );

    res.status(201).json({ id: result.insertId, ...payload });
  } catch (err) {
    console.error("POST /api/products", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

// PUT /api/products/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "INVALID_ID" });

    const { name, price, size, category, description, image } = req.body;

    if (!name || !Number.isFinite(Number(price))) {
      return res.status(400).json({ error: "NAME_AND_PRICE_REQUIRED" });
    }

    const payload = {
      name: String(name).trim(),
      price: Number(price),
      size: String(size || "").trim(),
      category: String(category || "").trim(),
      description: String(description || "").trim(),
      image: String(image || "").trim(),
    };

    const [result] = await db.query(
      "UPDATE products SET name=?, price=?, size=?, category=?, description=?, image=? WHERE id=?",
      [payload.name, payload.price, payload.size, payload.category, payload.description, payload.image, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "NOT_FOUND" });

    res.json({ id, ...payload });
  } catch (err) {
    console.error("PUT /api/products/:id", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "INVALID_ID" });

    const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "NOT_FOUND" });

    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/products/:id", err);
    res.status(500).json({ error: "DB_ERROR" });
  }
});

module.exports = router;