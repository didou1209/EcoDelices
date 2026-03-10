const DEFAULT_POSTS = [
  {
    id: 1,
    title: "5 idées de tartines pour un matin parfait",
    category: "Recettes",
    date: "2026-02-10",
    excerpt: "Des idées simples, gourmandes et 100% maison avec nos confitures bio.",
    content:
      "Voici 5 idées de tartines :\n\n" +
      "1) Beurre + fraise\n2) Fromage frais + abricot\n3) Yaourt + figue\n4) Avoine + framboise\n5) Peanut butter + bleuet\n\n" +
      "Astuce : ajoute des noix et un peu de miel pour plus de texture."
  },
  {
    id: 2,
    title: "Pourquoi choisir une confiture biologique ?",
    category: "Actualités",
    date: "2026-02-05",
    excerpt: "Moins d’additifs, plus de goût, et un vrai respect de la nature.",
    content:
      "Le bio, c’est surtout :\n\n- Des ingrédients plus propres\n- Une production responsable\n- Un goût plus authentique\n\n" +
      "Chez ÉcoDélices, on mise sur la simplicité : fruits, sucre, et patience."
  },
  {
    id: 3,
    title: "Notre philosophie : local, artisanal, chaleureux",
    category: "ÉcoDélices",
    date: "2026-01-28",
    excerpt: "Découvre nos valeurs et ce qui nous rend différents.",
    content:
      "ÉcoDélices est une petite entreprise locale. On valorise :\n\n" +
      "- Les producteurs d’ici\n- Les recettes artisanales\n- Le respect de l’environnement\n\n" +
      "Merci de faire partie de l’aventure !"
  }
];

function getPosts() {
  const raw = localStorage.getItem("eco_posts");
  if (!raw) return DEFAULT_POSTS;
  try { return JSON.parse(raw); } catch { return DEFAULT_POSTS; }
}

function savePosts(posts) {
  localStorage.setItem("eco_posts", JSON.stringify(posts));
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ============ BLOG LIST ============ */
function renderBlogList(targetId = "postsList") {
  const el = document.getElementById(targetId);
  if (!el) return;

  const posts = getPosts().sort((a,b)=> (b.date||"").localeCompare(a.date||""));
  el.innerHTML = posts.map(p => `
    <div class="card post">
      <div style="flex:1">
        <div class="tag">${escapeHtml(p.category || "Blog")}</div>
        <h3 style="margin-top:10px">${escapeHtml(p.title)}</h3>
        <div class="meta">${escapeHtml(p.date || "")}</div>
        <p>${escapeHtml(p.excerpt || "")}</p>
        <a class="btn btn-primary" href="article.html?id=${encodeURIComponent(p.id)}">Lire l’article</a>
      </div>
    </div>
  `).join("");
}

/* ============ ARTICLE PAGE ============ */
function renderArticle(targetId = "articleBox") {
  const el = document.getElementById(targetId);
  if (!el) return;

  const id = Number(qs("id"));
  const post = getPosts().find(p => p.id === id);

  if (!post) {
    el.innerHTML = `<div class="card"><h2>Article introuvable</h2><p>Retour au blog.</p><a class="btn" href="blog.html">Blog</a></div>`;
    return;
  }

  el.innerHTML = `
    <div class="card">
      <div class="tag">${escapeHtml(post.category || "Blog")}</div>
      <h1 style="margin-top:10px">${escapeHtml(post.title)}</h1>
      <p class="small">${escapeHtml(post.date || "")}</p>
      <hr style="border:none;border-top:1px solid rgba(0,0,0,.08);margin:14px 0;">
      <p style="white-space:pre-line">${escapeHtml(post.content || "")}</p>
      <div class="form-actions">
        <a class="btn" href="blog.html">← Retour</a>
      </div>
    </div>
  `;
}

/* ============ ADMIN ============ */
function requireAdmin() {
  const ok = localStorage.getItem("eco_admin") === "1";
  if (!ok) window.location.href = "login.html";
}

function adminLogin(formId="loginForm", msgId="loginMsg") {
  const form = document.getElementById(formId);
  const msg = document.getElementById(msgId);
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = form.querySelector("[name=username]").value.trim();
    const p = form.querySelector("[name=password]").value.trim();

    // Demo simple
    if (u === "admin" && p === "admin") {
      localStorage.setItem("eco_admin", "1");
      window.location.href = "dashboard.html";
    } else {
      if (msg) msg.textContent = "Identifiants incorrects (utilise admin / admin).";
    }
  });
}

function adminLogout(btnId="logoutBtn") {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener("click", () => {
    localStorage.removeItem("eco_admin");
    window.location.href = "login.html";
  });
}

function renderAdminPosts(targetId="adminPosts") {
  const el = document.getElementById(targetId);
  if (!el) return;

  const posts = getPosts().sort((a,b)=> (b.date||"").localeCompare(a.date||""));
  el.innerHTML = posts.map(p => `
    <div class="card">
      <div class="tag">${escapeHtml(p.category || "Blog")}</div>
      <h3 style="margin-top:10px">${escapeHtml(p.title)}</h3>
      <p class="small">${escapeHtml(p.date || "")}</p>
      <div class="form-actions">
        <a class="btn" href="../pages/article.html?id=${encodeURIComponent(p.id)}">Voir</a>
        <button class="btn" data-del="${p.id}">Supprimer</button>
      </div>
    </div>
  `).join("");

  el.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-del"));
      const posts2 = getPosts().filter(x => x.id !== id);
      savePosts(posts2);
      renderAdminPosts(targetId);
    });
  });
}

function adminCreatePost(formId="createPostForm", msgId="createMsg") {
  const form = document.getElementById(formId);
  const msg = document.getElementById(msgId);
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = form.querySelector("[name=title]").value.trim();
    const category = form.querySelector("[name=category]").value.trim();
    const excerpt = form.querySelector("[name=excerpt]").value.trim();
    const content = form.querySelector("[name=content]").value.trim();

    if (!title || !content) {
      if (msg) msg.textContent = "Titre et contenu sont obligatoires.";
      return;
    }

    const posts = getPosts();
    const nextId = (Math.max(...posts.map(p=>p.id)) || 0) + 1;
    const today = new Date().toISOString().slice(0,10);

    posts.push({ id: nextId, title, category, excerpt, content, date: today });
    savePosts(posts);

    form.reset();
    if (msg) msg.textContent = "Article ajouté ✅";
    renderAdminPosts();
  });
}

/* ============ HELPERS ============ */
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
