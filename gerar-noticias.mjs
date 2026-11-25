// Gera uma página HTML por notícia + sitemap.xml completo.
// Corre no GitHub Actions (Node 20+). Sem dependências.
import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";

const API = "https://playverse-news-backend.onrender.com";
const SITE = "https://mundogames.co.mz";
const OUT = "noticia";
const PAGE = 50;       // máximo permitido pela API
const MAX_PAGES = 20;  // até 1000 notícias

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slug = s => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "noticia";
const iso = d => { const t = new Date(d); return isNaN(t) ? null : t.toISOString(); };
const trim = (s, n) => { s = String(s ?? "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s; };

async function getJSON(url, tries = 5) {
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(90000) }); // Render pode estar a acordar
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch (e) {
      if (i === tries) throw e;
      await new Promise(r => setTimeout(r, 15000 * i));
    }
  }
}

function corpoHTML(body) {
  return String(body ?? "").split(/\n{2,}|\r\n{2,}/).map(b => b.trim()).filter(Boolean).map(b => {
    const m = b.match(/^#{1,4}\s+(.*)$/s);
    return m ? `<h2>${esc(m[1])}</h2>` : `<p>${esc(b).replace(/\n/g, "<br>")}</p>`;
  }).join("\n");
}

function pagina(n, url, urlImg) {
  const titulo = n.title_pt, desc = trim(n.summary || n.body, 160);
  const pub = iso(n.published_at || n.fetched_at), mod = iso(n.ai_generated_at || n.published_at || n.fetched_at);
  const ld = {
    "@context": "https://schema.org", "@type": "NewsArticle",
    headline: trim(titulo, 110), description: desc, image: urlImg ? [urlImg] : undefined,
    datePublished: pub, dateModified: mod, mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Redação PLAYVERSE", url: SITE },
    publisher: { "@type": "Organization", name: "PLAYVERSE", url: SITE }
  };
  return `<!DOCTYPE html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(trim(titulo, 65))} | PLAYVERSE</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="PLAYVERSE">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
${urlImg ? `<meta property="og:image" content="${esc(urlImg)}">\n<meta name="twitter:image" content="${esc(urlImg)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#080b12">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
<style>
:root{--bg:#080b12;--card:#111826;--txt:#e8ecf4;--mut:#93a0b8;--acc:#7c5cff}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font:17px/1.7 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
header{padding:14px 18px;border-bottom:1px solid #1d2638;display:flex;gap:18px;align-items:center;flex-wrap:wrap}
header a{color:var(--txt);text-decoration:none;font-weight:700}header a.n{color:var(--mut);font-weight:500;font-size:15px}
main{max-width:760px;margin:0 auto;padding:22px 18px 60px}
.cat{color:var(--acc);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
h1{font-size:clamp(26px,5vw,38px);line-height:1.2;margin:.3em 0}
.meta{color:var(--mut);font-size:14px;margin-bottom:18px}
.lead{font-size:19px;color:#c9d2e3}
img.hero{width:100%;height:auto;border-radius:14px;margin:12px 0 22px;background:var(--card)}
h2{font-size:23px;margin:1.6em 0 .4em}
.vid{position:relative;padding-top:56.25%;margin:26px 0}.vid iframe{position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:12px}
.back{display:inline-block;margin-top:30px;color:var(--acc);text-decoration:none;font-weight:600}
.footer{margin-top:40px;border-top:1px solid #1d2638;background:#090e17;padding:38px 0 28px}.shell{width:min(1240px,calc(100% - 42px));margin:auto}.footer-brand{font:700 20px system-ui}.footer-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:34px}.footer-about p{color:#8796aa;font-size:12px;line-height:1.7;max-width:320px;margin:12px 0 0}.footer-brand span{color:#8ebaff}.footer-col{display:flex;flex-direction:column;gap:9px}.footer-col h4{margin:0 0 6px;font:700 11px system-ui;letter-spacing:1.6px;text-transform:uppercase;color:#b6c4d8}.footer-col a{color:#8e9db2;font-size:13px}.footer-col a:hover{color:#fff}.copyright{border-top:1px solid #1d2638;padding-top:18px}@media(max-width:760px){.footer-grid{grid-template-columns:1fr 1fr}.footer-about{grid-column:1/-1}}.copyright{color:#65748a;font-size:11px;margin-top:22px}.footer a{color:inherit;text-decoration:none}
</style>
</head>
<body>
<header><a href="${SITE}/">PLAYVERSE</a><a class="n" href="${SITE}/">Notícias</a><a class="n" href="${SITE}/trailers.html">Trailers</a><a class="n" href="${SITE}/reels.html">Reels</a><a class="n" href="${SITE}/filmes.html">Filmes</a></header>
<main>
<article>
<div class="cat">${esc(n.category || "Gaming")}</div>
<h1>${esc(titulo)}</h1>
<div class="meta">Por Redação PLAYVERSE · <time datetime="${pub || ""}">${pub ? new Date(pub).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" }) : ""}</time></div>
${n.summary ? `<p class="lead">${esc(n.summary)}</p>` : ""}
${urlImg ? `<img class="hero" src="${esc(urlImg)}" alt="${esc(titulo)}" width="1200" height="675" fetchpriority="high" referrerpolicy="no-referrer">` : ""}
${corpoHTML(n.body)}
${n.video_embed_url ? `<div class="vid"><iframe src="${esc(n.video_embed_url)}" title="${esc(n.video_title || titulo)}" loading="lazy" allowfullscreen></iframe></div>` : ""}
</article>
<a class="back" href="${SITE}/">← Mais notícias</a>
</main>
<footer class="footer"><div class="shell"><div class="footer-grid"><div class="footer-about"><a class="footer-brand" href="${SITE}/">PLAY<span>VERSE</span></a><p>O universo gaming, em primeira mão. Notícias, trailers e entretenimento para quem vive os videojogos.</p></div><nav class="footer-col" aria-label="Explorar"><h4>Explorar</h4><a href="${SITE}/">Notícias</a><a href="${SITE}/trailers.html">Trailers</a><a href="${SITE}/reels.html">Reels</a><a href="${SITE}/filmes.html">Filmes</a></nav><nav class="footer-col" aria-label="PLAYVERSE"><h4>PLAYVERSE</h4><a href="${SITE}/sobre-nos.html">Sobre nós</a><a href="${SITE}/contacto.html">Contacto</a></nav><nav class="footer-col" aria-label="Legal"><h4>Legal</h4><a href="${SITE}/politica-de-privacidade.html">Política de Privacidade</a><a href="${SITE}/termos-de-uso.html">Termos de Uso</a><a href="${SITE}/politica-de-cookies.html">Política de Cookies</a></nav></div><p class="copyright">© 2026 PLAYVERSE. Todos os direitos reservados. Marcas, jogos e nomes mencionados pertencem aos respetivos proprietários.</p></div></footer>
</body>
</html>`;
}

// 1) buscar notícias
const todas = [];
for (let p = 0; p < MAX_PAGES; p++) {
  const d = await getJSON(`${API}/api/news?limit=${PAGE}&offset=${p * PAGE}`);
  todas.push(...(d.news || []));
  if (!d.hasMore) break;
}
console.log("Notícias recebidas:", todas.length);
if (!todas.length) { console.log("Nada a gerar (não vou apagar nada)."); process.exit(0); }

// 2) gerar páginas
await mkdir(OUT, { recursive: true });
const urls = [];
for (const n of todas) {
  if (!n.title_pt || !n.body) continue;
  const ficheiro = `${n.id}-${slug(n.title_pt)}.html`;
  const url = `${SITE}/${OUT}/${ficheiro}`;
  const img = n.image_url && /^https:\/\//.test(n.image_url) ? n.image_url : null;
  await writeFile(`${OUT}/${ficheiro}`, pagina(n, url, img));
  urls.push({ url, mod: (iso(n.ai_generated_at || n.published_at || n.fetched_at) || new Date().toISOString()).slice(0, 10) });
}

// 3) sitemap (páginas fixas + notícias)
const hoje = new Date().toISOString().slice(0, 10);
const fixas = ["/", "/trailers.html", "/reels.html", "/filmes.html", "/sobre-nos.html", "/contacto.html", "/politica-de-privacidade.html", "/termos-de-uso.html", "/politica-de-cookies.html"].map(p => ({ url: SITE + p, mod: hoje }));
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...fixas, ...urls].map(u => `  <url>\n    <loc>${esc(u.url)}</loc>\n    <lastmod>${u.mod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
await writeFile("sitemap.xml", xml);
console.log("Páginas geradas:", urls.length);
