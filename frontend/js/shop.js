"use strict";

/* =========================
   EcoDélices - shop.js (FIXED)
   - Produits: API (Node + MySQL)
   - Commandes: API (POST /orders)
   - Panier: localStorage
   ========================= */

const API_BASE = "http://localhost:3000/api";

/* ====== HELPERS ====== */
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json();
}

async function apiSend(path, method, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });

  if (!res.ok) {
    let data = null;
    try { data = await res.json(); } catch {}
    const err = new Error(`${method} ${path} failed (${res.status})`);
    err.data = data;
    throw err;
  }
  return res.json();
}

function productImageSrc(p) {
  const raw = String(p?.image || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return raw;
  return `../img/${raw}`;
}

/* ====== PANIER (localStorage) ====== */
function getCart() {
  const raw = localStorage.getItem("eco_cart");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("eco_cart", JSON.stringify(cart));
}

function cartCount() {
  return getCart().reduce((sum, it) => sum + Number(it.qty || 0), 0);
}

function addToCart(productId, qty = 1) {
  qty = Number(qty);
  if (!Number.isFinite(qty) || qty < 1) qty = 1;

  const cart = getCart();
  const item = cart.find((i) => Number(i.id) === Number(productId));

  if (item) item.qty = Number(item.qty || 0) + qty;
  else cart.push({ id: Number(productId), qty });

  saveCart(cart);
}

function updateQty(productId, newQty) {
  newQty = Number(newQty);
  let cart = getCart();

  cart = cart
    .map((i) => (Number(i.id) === Number(productId) ? { ...i, qty: newQty } : i))
    .filter((i) => Number(i.qty || 0) > 0);

  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter((i) => Number(i.id) !== Number(productId));
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

/* ====== PRODUITS (API) ====== */
async function getProducts() {
  return apiGet("/products");
}

async function getProductById(id) {
  return apiGet(`/products/${encodeURIComponent(id)}`);
}

/* ====== BOUTIQUE (shop.html) ====== */
async function renderShop(gridId = "productsGrid", countId = "cartCount") {
  const grid = document.getElementById(gridId);
  const count = document.getElementById(countId);
  if (!grid) return;

  grid.innerHTML = `<div class="card"><p class="small">Chargement...</p></div>`;

  try {
    const products = await getProducts();

    grid.innerHTML = products
      .map((p) => {
        const imgSrc = productImageSrc(p);
        const img = imgSrc
          ? `<img src="${imgSrc}" alt="${escapeHtml(p.name)}"
              style="border-radius:14px;height:200px;object-fit:cover;width:100%;border:1px solid rgba(0,0,0,.06);">`
          : "";

        return `
          <div class="card col-4">
            ${img}
            <div class="tag" style="margin-top:10px">${escapeHtml(p.category || "Produit")}</div>
            <h3 style="margin-top:10px">${escapeHtml(p.name)}</h3>
            <p class="small">${escapeHtml(p.description || "")}</p>
            <p><strong>${Number(p.price).toFixed(2)} $</strong>
              <span class="small">• ${escapeHtml(p.size || "")}</span>
            </p>

            <div class="form-actions">
              <a class="btn" href="product.html?id=${encodeURIComponent(p.id)}">Détails</a>
              <button class="btn btn-primary" data-add="${p.id}">Ajouter</button>
            </div>
          </div>
        `;
      })
      .join("");

    grid.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        addToCart(Number(btn.getAttribute("data-add")), 1);
        if (count) count.textContent = `Panier: ${cartCount()}`;
      });
    });

    if (count) count.textContent = `Panier: ${cartCount()}`;
  } catch (e) {
    console.error(e);
    grid.innerHTML = `<div class="card"><p class="small">Erreur de chargement des produits.</p></div>`;
  }
}

/* ====== PAGE PRODUIT (product.html) ====== */
async function renderProductModern(targetId = "productBox") {
  const el = document.getElementById(targetId);
  if (!el) return;

  const id = Number(qs("id"));
  if (!Number.isFinite(id)) {
    el.innerHTML = `
      <div class="card">
        <h2>Produit introuvable</h2>
        <a class="btn btn-primary" href="shop.html">Aller à la boutique</a>
      </div>
    `;
    return;
  }

  el.innerHTML = `<div class="card"><p class="small">Chargement...</p></div>`;

  try {
    const p = await getProductById(id);

    const imgSrc = productImageSrc(p);
    const img = imgSrc
      ? `<img src="${imgSrc}" alt="${escapeHtml(p.name)}"
              style="width:100%;height:320px;object-fit:cover;border-radius:14px;border:1px solid rgba(0,0,0,.06);">`
      : `<div class="card">Sans image</div>`;

    el.innerHTML = `
      <div class="card">
        <div class="grid" style="align-items:start">
          <div class="col-6">
            ${img}
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
              <span class="tag">${escapeHtml(p.category || "Produit")}</span>
              <span class="tag">${escapeHtml(p.size || "")}</span>
            </div>
          </div>

          <div class="col-6">
            <h1 style="margin:0 0 10px">${escapeHtml(p.name)}</h1>
            <p class="small">${escapeHtml(p.description || "")}</p>

            <div class="card" style="margin-top:14px">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                <div>
                  <div class="small">Prix</div>
                  <div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:28px;">
                    ${Number(p.price).toFixed(2)} $
                  </div>
                </div>

                <div style="display:flex;gap:10px;align-items:center;">
                  <button class="btn" id="qtyMinus">-</button>
                  <span class="tag" id="qtyValue">1</span>
                  <button class="btn" id="qtyPlus">+</button>
                </div>
              </div>

              <div class="form-actions" style="margin-top:14px">
                <button class="btn btn-primary" id="addBtn">Ajouter au panier</button>
                <a class="btn" href="cart.html">Voir panier</a>
              </div>

              <p class="small" id="addMsg" style="margin-top:10px"></p>
            </div>
          </div>
        </div>
      </div>
    `;

    let qty = 1;
    const qtyValue = document.getElementById("qtyValue");
    const minus = document.getElementById("qtyMinus");
    const plus = document.getElementById("qtyPlus");

    const setQty = (v) => {
      qty = Math.max(1, Math.min(20, Number(v)));
      if (qtyValue) qtyValue.textContent = String(qty);
    };

    if (minus) minus.addEventListener("click", () => setQty(qty - 1));
    if (plus) plus.addEventListener("click", () => setQty(qty + 1));

    const addBtn = document.getElementById("addBtn");
    const msg = document.getElementById("addMsg");

    if (addBtn) {
      addBtn.addEventListener("click", () => {
        addToCart(Number(p.id), qty);
        if (msg) msg.textContent = `Ajouté au panier (x${qty})`;
      });
    }
  } catch (e) {
    console.error(e);
    el.innerHTML = `
      <div class="card">
        <h2>Produit introuvable</h2>
        <a class="btn btn-primary" href="shop.html">Aller à la boutique</a>
      </div>
    `;
  }
}

/* ====== PANIER (cart.html) ====== */
async function cartItemsDetailed() {
  const cart = getCart();
  const products = await getProducts();

  return cart
    .map((item) => {
      const prod = products.find((p) => Number(p.id) === Number(item.id));
      return prod ? { ...item, product: prod } : null;
    })
    .filter(Boolean);
}

async function cartTotal() {
  const items = await cartItemsDetailed();
  return items.reduce((sum, it) => {
    const price = Number(it.product.price || 0);
    const qty = Number(it.qty || 0);
    return sum + price * qty;
  }, 0);
}

async function renderCart(itemsId = "cartItems", totalId = "cartTotal", countLineId = "cartCountLine") {
  const el = document.getElementById(itemsId);
  const totalEl = document.getElementById(totalId);
  const countEl = document.getElementById(countLineId);
  if (!el) return;

  el.innerHTML = `<div class="card"><p class="small">Chargement...</p></div>`;

  const items = await cartItemsDetailed();

  if (items.length === 0) {
    el.innerHTML = `
      <div class="card">
        <h3>Ton panier est vide</h3>
        <p class="small">Ajoute des produits depuis la boutique.</p>
        <a class="btn btn-primary" href="shop.html">Aller à la boutique</a>
      </div>
    `;
    if (totalEl) totalEl.textContent = "0.00 $";
    if (countEl) countEl.textContent = "0 article(s)";
    return;
  }

  el.innerHTML = items
    .map((it) => {
      const p = it.product;
      const lineTotal = Number(p.price) * Number(it.qty);
      const imgSrc = productImageSrc(p);
      const img = imgSrc
        ? `<img src="${imgSrc}" alt="${escapeHtml(p.name)}"
              style="width:90px;height:90px;object-fit:cover;border-radius:14px;border:1px solid rgba(0,0,0,.06);">`
        : "";

      return `
        <div class="card">
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
            ${img}

            <div style="flex:1;min-width:220px;">
              <div class="tag">${escapeHtml(p.category || "Produit")}</div>
              <h3 style="margin-top:10px">${escapeHtml(p.name)}</h3>
              <p class="small">${escapeHtml(p.size || "")} • ${Number(p.price).toFixed(2)} $</p>
              <p class="small"><strong>Sous-total :</strong> ${lineTotal.toFixed(2)} $</p>
            </div>

            <div style="display:flex;gap:10px;align-items:center;">
              <button class="btn" data-minus="${p.id}">-</button>
              <span class="tag">${Number(it.qty)}</span>
              <button class="btn" data-plus="${p.id}">+</button>
            </div>

            <button class="btn" data-remove="${p.id}">Supprimer</button>
          </div>
        </div>
      `;
    })
    .join("");

  el.querySelectorAll("[data-plus]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.getAttribute("data-plus"));
      const item = getCart().find((i) => Number(i.id) === id);
      updateQty(id, Number(item?.qty || 0) + 1);
      await renderCart(itemsId, totalId, countLineId);
    });
  });

  el.querySelectorAll("[data-minus]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.getAttribute("data-minus"));
      const item = getCart().find((i) => Number(i.id) === id);
      updateQty(id, Math.max(0, Number(item?.qty || 0) - 1));
      await renderCart(itemsId, totalId, countLineId);
    });
  });

  el.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.getAttribute("data-remove"));
      removeFromCart(id);
      await renderCart(itemsId, totalId, countLineId);
    });
  });

  const total = await cartTotal();
  const count = cartCount();
  if (totalEl) totalEl.textContent = `${total.toFixed(2)} $`;
  if (countEl) countEl.textContent = `${count} article(s)`;
}

function bindClearCart(btnId = "clearCartBtn") {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener("click", async () => {
    clearCart();
    if (document.getElementById("cartItems")) {
      await renderCart("cartItems", "cartTotal", "cartCountLine");
    }
  });
}

/* ====== CHECKOUT (checkout.html) ====== */
async function renderCheckoutSummary(listId="checkoutSummary", totalId="checkoutTotal", countId="checkoutCount") {
  const el = document.getElementById(listId);
  const totalEl = document.getElementById(totalId);
  const countEl = document.getElementById(countId);
  if (!el) return;

  el.innerHTML = `<div class="card"><p class="small">Chargement...</p></div>`;

  const items = await cartItemsDetailed();

  if (items.length === 0) {
    el.innerHTML = `
      <div class="card">
        <p class="small">Panier vide.</p>
        <a class="btn btn-primary" href="shop.html">Aller à la boutique</a>
      </div>
    `;
    if (totalEl) totalEl.textContent = "0.00 $";
    if (countEl) countEl.textContent = "0 article(s)";
    return;
  }

  el.innerHTML = items.map((it) => {
    const p = it.product;
    const lineTotal = Number(p.price) * Number(it.qty);
    return `
      <div class="card">
        <div class="tag">${escapeHtml(p.category || "Produit")}</div>
        <h3 style="margin-top:10px">${escapeHtml(p.name)}</h3>
        <p class="small">Qté: ${Number(it.qty)} • ${Number(p.price).toFixed(2)} $</p>
        <p class="small"><strong>Sous-total :</strong> ${lineTotal.toFixed(2)} $</p>
      </div>
    `;
  }).join("");

  const total = await cartTotal();
  const count = cartCount();
  if (totalEl) totalEl.textContent = `${total.toFixed(2)} $`;
  if (countEl) countEl.textContent = `${count} article(s)`;
}

/* ✅ FIX: payload compatible avec ton backend /api/orders
   - supporte fullName OU firstName+lastName
   - items => [{ productId, qty }]
   - redirect order-success.html OK
*/
function bindCheckout(formId="checkoutForm", msgId="checkoutMsg") {
  const form = document.getElementById(formId);
  const msg = document.getElementById(msgId);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const itemsDetailed = await cartItemsDetailed();
      if (!itemsDetailed.length) {
        if (msg) msg.textContent = "Ton panier est vide.";
        return;
      }

      // ✅ fullName (si tu as un champ fullName) sinon firstName+lastName
      const fullNameField = form.fullName?.value;
      const firstName = (form.firstName?.value || "").trim();
      const lastName  = (form.lastName?.value || "").trim();
      const fullName = String(fullNameField || `${firstName} ${lastName}`).trim();

      const payload = {
        fullName,
        email: (form.email?.value || "").trim(),
        phone: (form.phone?.value || "").trim(),
        address: (form.address?.value || "").trim(),
        city: (form.city?.value || "").trim(),
        postal: (form.postal?.value || "").trim(),
        note: (form.note?.value || "").trim(),
        items: itemsDetailed.map((it) => ({
          productId: Number(it.product.id),
          qty: Number(it.qty),
        })),
      };

      // ✅ message simple si champ vide
      if (!payload.fullName) throw new Error("Nom requis");
      if (!payload.email) throw new Error("Email requis");
      if (!payload.phone) throw new Error("Téléphone requis");
      if (!payload.address) throw new Error("Adresse requise");
      if (!payload.city) throw new Error("Ville requise");
      if (!payload.postal) throw new Error("Code postal requis");

      const result = await apiSend("/orders", "POST", payload);

      localStorage.setItem("eco_last_order", result.orderNo || "");
      clearCart();
      window.location.href = "order-success.html";
    } catch (err) {
      console.error("CHECKOUT ERROR:", err);

      const serverMsg =
        err?.data?.error ||
        err?.data?.message ||
        err?.message ||
        "Erreur lors de la confirmation.";

      if (msg) msg.textContent = `Erreur: ${serverMsg}`;
    }
  });
}

function renderOrderSuccess(targetId="orderNumber") {
  const el = document.getElementById(targetId);
  if (!el) return;
  const no = localStorage.getItem("eco_last_order") || "";
  el.textContent = no || "—";
}

/* ====== EXPORT GLOBAL ====== */
window.ecoShop = {
  renderShop,
  renderProductModern,
  renderCart,
  bindClearCart,
  renderCheckoutSummary,
  bindCheckout,
  renderOrderSuccess,
  cartCount,
};