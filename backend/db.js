// backend/db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",          // <-- si tu as un mot de passe, mets-le ici
  database: "ecodelices", // <-- Vérifie le nom EXACT dans phpMyAdmin
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("MySQL pool initialisé");

module.exports = pool;