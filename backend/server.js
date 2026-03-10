const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");

app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);

// Test route
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});