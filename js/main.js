// ==========================================================
// Carte ANKOR : construit la page à partir de data/carte.json
// ==========================================================

const SOURCE = "data/carte.json";

const EMBLEME = `
  <svg class="embleme" viewBox="0 0 40 52" aria-hidden="true">
    <path d="M2 2h36v48H2zM8 8v36h24V14H14v24h12V20h-6v12"/>
  </svg>`;

// --- Utilitaires -------------------------------------------

const formatPrix = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function prix(valeur) {
  return `${formatPrix.format(valeur)} €`;
}

function echapper(texte = "") {
  return String(texte)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// --- Rendu d'un article ------------------------------------

function rendrePrix(article, formats) {
  const valeurs = article.prix || [];

  // Catégorie avec colonnes (25cl / 33cl / 50cl, 12cl / 75cl…)
  if (formats && formats.length) {
    const cellules = formats.map((format, i) => {
      const v = valeurs[i];
      return v == null
        ? `<span class="vide" aria-hidden="true">–</span>`
        : `<span><span class="sr-only">${echapper(format)} : </span>${prix(v)}</span>`;
    });
    return `<span class="article__prix">${cellules.join("")}</span>`;
  }

  // Prix simple, ou plusieurs prix à la suite (Planteur 25cl / 1l)
  const texte = valeurs.filter((v) => v != null).map(prix).join(" / ");
  return `<span class="article__prix article__prix--libre">${texte}</span>`;
}

function rendreOptions(options = []) {
  if (!options.length) return "";
  const items = options
    .map(
      (o) => `
        <li>
          <span class="option__nom">${echapper(o.nom)}</span>
          ${o.prix != null ? `<span class="option__prix">+${prix(o.prix)}</span>` : ""}
          ${o.description ? `<span class="option__description">${echapper(o.description)}</span>` : ""}
        </li>`
    )
    .join("");
  return `<ul class="options">${items}</ul>`;
}

function rendreArticle(article, formats) {
  const tag = article.tag ? `<span class="tag">${echapper(article.tag)}</span>` : "";
  const moment = article.duMoment ? ` <span class="du-moment">du moment</span>` : "";
  const vege = article.vege ? ` <span class="vege" title="Végétarien">(V)</span>` : "";
  const detail = article.detail
    ? ` <span class="article__detail">(${echapper(article.detail)})</span>`
    : "";

  return `
    <li class="article">
      <div class="article__ligne">
        <span class="article__nom">${tag}${echapper(article.nom)}${moment}${vege}${detail}</span>
        <span class="pointilles" aria-hidden="true"></span>
        ${rendrePrix(article, formats)}
      </div>
      ${article.description ? `<p class="article__description">${echapper(article.description)}</p>` : ""}
      ${rendreOptions(article.options)}
    </li>`;
}

// --- Rendu des catégories et chapitres ---------------------

function rendreCategorie(categorie) {
  const style = categorie.style ? ` categorie--${categorie.style}` : "";
  const formats = categorie.formats || [];
  const entetesFormats = formats.length
    ? `<span class="formats" aria-hidden="true">${formats.map((f) => `<span>${echapper(f)}</span>`).join("")}</span>`
    : "";

  return `
    <section class="categorie${style}">
      <div class="categorie__entete">
        <h3 class="categorie__titre">${echapper(categorie.titre)}</h3>
        ${entetesFormats}
      </div>
      <ul class="articles">
        ${categorie.articles.map((a) => rendreArticle(a, formats)).join("")}
      </ul>
    </section>`;
}

function rendreChapitre(chapitre) {
  return `
    <article class="chapitre" id="${echapper(chapitre.id)}">
      <div class="chapitre__entete">
        ${EMBLEME}
        <h2 class="chapitre__titre">${echapper(chapitre.titre)}</h2>
      </div>
      <div class="meandre" aria-hidden="true"></div>
      ${chapitre.categories.map(rendreCategorie).join("")}
      ${chapitre.legende ? `<p class="legende">${echapper(chapitre.legende)}</p>` : ""}
    </article>`;
}

function rendreNav(chapitres) {
  return chapitres
    .map((c) => `<a href="#${echapper(c.id)}" data-id="${echapper(c.id)}">${echapper(c.titre)}</a>`)
    .join("");
}

function rendrePied(mentions = []) {
  return mentions.map((m) => `<p>${echapper(m)}</p>`).join("") + EMBLEME;
}

// --- Onglet actif dans la navigation -----------------------

// Fait défiler la barre de navigation horizontalement, sans toucher
// au défilement de la page (scrollIntoView faisait remonter la page,
// car il ramenait aussi la barre « collante » à sa place d'origine).
function centrerLien(lien) {
  const nav = lien.parentElement;
  const cible = lien.offsetLeft - (nav.clientWidth - lien.offsetWidth) / 2;
  nav.scrollTo({ left: Math.max(0, cible), behavior: "smooth" });
}

function suivreChapitreActif() {
  const liens = document.querySelectorAll(".nav a");
  const chapitres = document.querySelectorAll(".chapitre");

  const observateur = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((entree) => {
        if (!entree.isIntersecting) return;
        liens.forEach((lien) => {
          const actif = lien.dataset.id === entree.target.id;
          lien.classList.toggle("actif", actif);
          if (actif) centrerLien(lien);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  chapitres.forEach((c) => observateur.observe(c));
}

// --- Démarrage ---------------------------------------------

async function init() {
  const conteneur = document.getElementById("carte");
  try {
    const reponse = await fetch(SOURCE, { cache: "no-store" });
    if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
    const carte = await reponse.json();

    document.getElementById("nav").innerHTML = rendreNav(carte.chapitres);
    conteneur.innerHTML = carte.chapitres.map(rendreChapitre).join("");
    document.getElementById("pied").innerHTML = rendrePied(carte.mentions);
    suivreChapitreActif();
  } catch (erreur) {
    console.error("Impossible de charger la carte :", erreur);
    conteneur.innerHTML = `<p class="erreur">La carte n'a pas pu être chargée. Demandez-la au comptoir !</p>`;
  }
}

init();