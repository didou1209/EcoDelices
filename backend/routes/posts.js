const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all posts
router.get("/", (req, res) => {
  db.query("SELECT * FROM posts ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST create post (admin)
router.post("/", (req, res) => {
  const { title, content } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: "title et content obligatoires" });

  db.query(
    "INSERT INTO posts (title, content) VALUES (?, ?)",
    [title, content],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Post ajouté", id: result.insertId });
    }
  );
});

module.exports = router;