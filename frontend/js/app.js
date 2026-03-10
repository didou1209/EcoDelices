// js/app.js
// Navbar + Footer dynamiques (supporte: /, /pages/, /admin/)

function linkPrefix() {
  const path = window.location.pathname.replaceAll("\\", "/");
  if (path.includes("/pages/")) return "..";
  if (path.includes("/admin/")) return "..";
  return ".";
}

function renderNavbar() {
  const p = linkPrefix();
  const isAdmin = localStorage.getItem("eco_admin") === "1";
  const cartCount = getCartCountSafe();

  const nav = `
    <div class="navbar">
      <div class="container nav-inner">
        <a class="brand" href="${p}/index.html">
          <span class="badge">BIO</span>
          <span>ÉcoDélices</span>
        </a>

        <div class="nav-links">
          <a href="${p}/index.html">Accueil</a>
          <a href="${p}/pages/apropos.html">À propos</a>
          <a href="${p}/pages/shop.html">Boutique</a>
          <a href="${p}/pages/blog.html">Blog</a>
          <a href="${p}/pages/contact.html">Contact</a>
          <a href="${p}/pages/cart.html">Panier (${cartCount})</a>

          ${
            isAdmin
              ? `
                <a href="${p}/admin/dashboard.html">Blog Admin</a>
                <a href="${p}/admin/products.html">Produits Admin</a>
              `
              : `<a href="${p}/admin/login.html">Connexion</a>`
          }
        </div>
      </div>
    </div>
  `;

  const el = document.getElementById("navbar");
  if (el) el.innerHTML = nav;
}

function renderFooter() {
  const year = new Date().getFullYear();
  const el = document.getElementById("footer");
  if (!el) return;

  el.innerHTML = `
    <div class="footer">
      <div class="container">
        <div><strong>ÉcoDélices</strong> — confitures artisanales biologiques.</div>
        <div class="small">© ${year} — Site vitrine + blogue + boutique .</div>
      </div>
    </div>
  `;
}

// --- Panier count (safe) ---
// Si shop.js n'est pas chargé sur la page, on évite les erreurs.
function getCartCountSafe() {
  try {
    const raw = localStorage.getItem("eco_cart") || "[]";
    const cart = JSON.parse(raw);
    return cart.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  } catch (e) {
    return 0;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  renderFooter();
});
