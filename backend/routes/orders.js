// backend/routes/orders.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // mysql2/promise pool

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}
function toInt(v) {
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

// ✅ GET all orders
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, order_no, full_name, email, phone, address, city, postal, note, total, created_at
       FROM orders
       ORDER BY created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error("GET /orders error:", err);
    return res.status(500).json({ error: "Erreur serveur (get orders)" });
  }
});

// ✅ GET one order + items
router.get("/:id", async (req, res) => {
  const id = toInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "id invalide" });

  try {
    const [orders] = await db.query(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (orders.length === 0) return res.status(404).json({ error: "Commande introuvable" });

    const [items] = await db.query(
      `SELECT id, order_id, product_id, name, price, qty, line_total
       FROM order_items
       WHERE order_id = ?
       ORDER BY id ASC`,
      [id]
    );

    return res.json({ order: orders[0], items });
  } catch (err) {
    console.error("GET /orders/:id error:", err);
    return res.status(500).json({ error: "Erreur serveur (get order detail)" });
  }
});

// ✅ Dashboard stats (total ventes, nb commandes, produit top)
router.get("/stats/summary", async (req, res) => {
  try {
    const [[a]] = await db.query(`SELECT COUNT(*) AS ordersCount, COALESCE(SUM(total),0) AS totalSales FROM orders`);
    const [top] = await db.query(`
      SELECT name, SUM(qty) AS totalQty
      FROM order_items
      GROUP BY name
      ORDER BY totalQty DESC
      LIMIT 1
    `);

    return res.json({
      ordersCount: Number(a.ordersCount || 0),
      totalSales: Number(a.totalSales || 0),
      topProduct: top[0] ? { name: top[0].name, qty: Number(top[0].totalQty || 0) } : null
    });
  } catch (err) {
    console.error("GET /orders/stats error:", err);
    return res.status(500).json({ error: "Erreur serveur (stats)" });
  }
});

// ✅ POST create order
router.post("/", async (req, res) => {
  const body = req.body || {};

  if (!isNonEmptyString(body.fullName)) return res.status(400).json({ error: "fullName requis" });
  if (!isNonEmptyString(body.email)) return res.status(400).json({ error: "email requis" });
  if (!isNonEmptyString(body.phone)) return res.status(400).json({ error: "phone requis" });
  if (!isNonEmptyString(body.address)) return res.status(400).json({ error: "address requis" });
  if (!isNonEmptyString(body.city)) return res.status(400).json({ error: "city requis" });
  if (!isNonEmptyString(body.postal)) return res.status(400).json({ error: "postal requis" });

  let rawItems = body.items;

  if (typeof rawItems === "string") {
    try { rawItems = JSON.parse(rawItems); }
    catch { return res.status(400).json({ error: "items doit être un tableau JSON valide" }); }
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return res.status(400).json({ error: "items requis (tableau non vide)" });
  }

  const items = rawItems.map((it) => ({
    productId: toInt(it.productId),
    qty: toInt(it.qty ?? it.quantity),
  }));

  if (items.some((it) => !Number.isInteger(it.productId) || it.productId <= 0)) {
    return res.status(400).json({ error: "productId invalide" });
  }
  if (items.some((it) => !Number.isInteger(it.qty) || it.qty <= 0)) {
    return res.status(400).json({ error: "qty invalide" });
  }

  const orderNo = `ORD-${Date.now()}`;

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const productIds = [...new Set(items.map((x) => x.productId))];
    const placeholders = productIds.map(() => "?").join(",");

    const [products] = await conn.query(
      `SELECT id, name, price FROM products WHERE id IN (${placeholders})`,
      productIds
    );

    if (products.length !== productIds.length) {
      const found = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !found.has(id));
      await conn.rollback();
      return res.status(400).json({ error: "Produit(s) introuvable(s)", missing });
    }

    const productMap = new Map(
      products.map((p) => [p.id, { name: String(p.name), price: Number(p.price) }])
    );

    let total = 0;
    const normalizedItems = items.map((it) => {
      const p = productMap.get(it.productId);
      const unitPrice = Number(p.price);
      const lineTotal = Number((unitPrice * it.qty).toFixed(2));
      total = Number((total + lineTotal).toFixed(2));

      return { productId: it.productId, name: p.name, unitPrice, qty: it.qty, lineTotal };
    });

    const [orderResult] = await conn.query(
      `INSERT INTO orders
       (order_no, full_name, email, phone, address, city, postal, note, total, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        orderNo,
        body.fullName.trim(),
        body.email.trim(),
        body.phone.trim(),
        body.address.trim(),
        body.city.trim(),
        body.postal.trim(),
        (body.note ?? "").toString().trim(),
        total,
      ]
    );

    const orderId = orderResult.insertId;

    for (const it of normalizedItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, name, price, qty, line_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, it.productId, it.name, it.unitPrice, it.qty, it.lineTotal]
      );
    }

    await conn.commit();

    return res.status(201).json({ message: "Commande créée", orderId, orderNo, total, items: normalizedItems });
  } catch (err) {
    try { if (conn) await conn.rollback(); } catch (_) {}
    console.error("POST /orders error:", err);
    return res.status(500).json({ error: "Erreur serveur (create order)", message: err.message });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;