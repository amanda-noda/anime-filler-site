const FILLER_API = 'https://filler-list.chaiwala-anime.workers.dev';
const ANIME_LIST_API = 'https://anime-filler.vercel.app/api/anime';

const QUICK_SLUGS = [
  'naruto',
  'naruto-shippuden',
  'one-piece',
  'bleach',
  'dragon-ball-z',
  'dragon-ball-super',
  'black-clover',
  'boruto-naruto-next-generations',
  'hunter-x-hunter',
  'fairy-tail',
  'my-hero-academia',
  'attack-titan',
  'demon-slayer-kimetsu-no-yaiba',
  'jujutsu-kaisen',
  'death-note',
];

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const autocompleteList = document.getElementById('autocompleteList');
const quickChips = document.getElementById('quickChips');
const resultsSection = document.getElementById('resultsSection');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const animeTitle = document.getElementById('animeTitle');
const statsRow = document.getElementById('statsRow');
const copyFillerBtn = document.getElementById('copyFillerBtn');
const copyFeedback = document.getElementById('copyFeedback');
const timelineEl = document.getElementById('timeline');
const tabFiller = document.getElementById('tabFiller');
const tabCanon = document.getElementById('tabCanon');
const tabAnimeCanon = document.getElementById('tabAnimeCanon');
const panelFiller = document.getElementById('panelFiller');
const panelCanon = document.getElementById('panelCanon');
const panelAnimeCanon = document.getElementById('panelAnimeCanon');
const listFiller = document.getElementById('listFiller');
const listCanon = document.getElementById('listCanon');
const listAnimeCanon = document.getElementById('listAnimeCanon');

let animeList = [];
let currentData = null;

function slugFromLink(link) {
  if (!link) return '';
  try {
    const path = new URL(link).pathname;
    const parts = path.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  } catch {
    return '';
  }
}

async function loadAnimeList() {
  try {
    const res = await fetch(ANIME_LIST_API);
    if (!res.ok) return;
    const raw = await res.json();
    animeList = raw.map((item) => ({
      name: item.name,
      slug: slugFromLink(item.link),
    })).filter((item) => item.slug);
  } catch (e) {
    console.warn('Falha ao carregar lista de animes', e);
  }
}

function formatName(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function normalizeQuery(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

function showAutocomplete(query) {
  if (!query || query.length < 2) {
    autocompleteList.hidden = true;
    autocompleteList.innerHTML = '';
    return;
  }
  const q = normalizeQuery(query);
  const matches = animeList.filter(
    (item) =>
      normalizeQuery(item.name).includes(q) ||
      normalizeQuery(item.slug).includes(q)
  ).slice(0, 12);

  if (matches.length === 0) {
    autocompleteList.hidden = true;
    autocompleteList.innerHTML = '';
    return;
  }

  autocompleteList.innerHTML = '';
  searchInput.setAttribute('aria-expanded', 'true');
  matches.forEach((item) => {
    const opt = document.createElement('button');
    opt.type = 'button';
    opt.className = 'autocomplete-option';
    opt.role = 'option';
    opt.textContent = item.name;
    opt.dataset.slug = item.slug;
    opt.addEventListener('click', () => selectAnime(item.slug));
    autocompleteList.appendChild(opt);
  });
  autocompleteList.hidden = false;
}

function hideAutocomplete() {
  setTimeout(() => {
    autocompleteList.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
  }, 150);
}

function selectAnime(slug) {
  searchInput.value = formatName(slug);
  hideAutocomplete();
  search(slug);
}

function renderEpisodes(container, episodes, type) {
  container.innerHTML = '';
  if (!episodes || episodes.length === 0) {
    container.innerHTML = '<p class="panel-desc" style="margin:0">Nenhum episódio nesta categoria.</p>';
    return;
  }
  episodes.forEach((num) => {
    const badge = document.createElement('span');
    badge.className = `ep-badge ${type}`;
    badge.textContent = num;
    badge.title = `Episódio ${num}`;
    container.appendChild(badge);
  });
}

function buildTimeline(data) {
  const filler = new Set(data.fillerEpisodes || []);
  const canon = new Set(data.cannonEpisodes || []);
  const animecanon = new Set(data.animecanonsEp || []);
  const maxEp = Math.max(
    ...(data.fillerEpisodes || []),
    ...(data.cannonEpisodes || []),
    ...(data.animecanonsEp || []),
    1
  );

  timelineEl.innerHTML = '';
  for (let ep = 1; ep <= maxEp; ep++) {
    const cell = document.createElement('span');
    cell.className = 'timeline-cell';
    cell.setAttribute('role', 'img');
    if (filler.has(ep) && !canon.has(ep) && !animecanon.has(ep)) {
      cell.classList.add('filler');
      cell.setAttribute('aria-label', `Episódio ${ep} - Filler`);
    } else if (animecanon.has(ep)) {
      cell.classList.add('animecanon');
      cell.setAttribute('aria-label', `Episódio ${ep} - Anime canon`);
    } else {
      cell.classList.add('canon');
      cell.setAttribute('aria-label', `Episódio ${ep} - Canon`);
    }
    cell.title = `Ep. ${ep}`;
    timelineEl.appendChild(cell);
  }
}

function setActiveTab(tab) {
  [tabFiller, tabCanon, tabAnimeCanon].forEach((t) => t.setAttribute('aria-selected', 'false'));
  tab.setAttribute('aria-selected', 'true');
}

function showPanel(panel) {
  [panelFiller, panelCanon, panelAnimeCanon].forEach((p) => p.classList.add('hidden'));
  panel.classList.remove('hidden');
}

function displayResults(data) {
  currentData = data;
  const name = data.animeName ? formatName(data.animeName) : 'Anime';
  animeTitle.textContent = name;

  const filler = data.fillerEpisodes || [];
  const canon = data.cannonEpisodes || [];
  const animecanon = data.animecanonsEp || [];

  statsRow.innerHTML = `
    <span class="stat-filler"><strong>${filler.length}</strong> filler</span>
    <span class="stat-canon"><strong>${canon.length}</strong> canon/misto</span>
    <span class="stat-animecanon"><strong>${animecanon.length}</strong> anime canon</span>
  `;

  buildTimeline(data);
  renderEpisodes(listFiller, filler, 'filler');
  renderEpisodes(listCanon, canon, 'canon');
  renderEpisodes(listAnimeCanon, animecanon, 'animecanon');

  resultsSection.hidden = false;
  errorState.hidden = true;
  emptyState.hidden = true;

  setActiveTab(tabFiller);
  showPanel(panelFiller);
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorState.hidden = false;
  resultsSection.hidden = true;
  emptyState.hidden = true;
}

function setLoading(loading) {
  searchBtn.disabled = loading;
  searchBtn.classList.toggle('loading', loading);
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function search(input) {
  let slug = typeof input === 'string' ? input.trim() : '';
  if (!slug) return;

  if (!/^[a-z0-9-]+$/i.test(slug)) {
    slug = slugify(slug);
  }

  setLoading(true);
  errorState.hidden = true;

  try {
    const res = await fetch(`${FILLER_API}/${encodeURIComponent(slug)}`);
    if (!res.ok) {
      showError('Anime não encontrado. Tente outro nome ou escolha um da lista ao digitar.');
      return;
    }
    const data = await res.json();
    displayResults(data);
  } catch (err) {
    showError('Erro ao buscar. Verifique sua conexão e tente novamente.');
    console.error(err);
  } finally {
    setLoading(false);
  }
}

function copyFillerList() {
  if (!currentData || !currentData.fillerEpisodes || currentData.fillerEpisodes.length === 0) {
    copyFeedback.textContent = 'Não há fillers para copiar.';
    return;
  }
  const text = currentData.fillerEpisodes.join(', ');
  navigator.clipboard.writeText(text).then(
    () => {
      copyFeedback.textContent = 'Lista copiada!';
      setTimeout(() => (copyFeedback.textContent = ''), 2500);
    },
    () => {
      copyFeedback.textContent = 'Falha ao copiar.';
    }
  );
}

function initQuickPicks() {
  quickChips.innerHTML = '';
  QUICK_SLUGS.forEach((slug) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = formatName(slug);
    btn.addEventListener('click', () => {
      searchInput.value = formatName(slug);
      search(slug);
    });
    quickChips.appendChild(btn);
  });
}

searchBtn.addEventListener('click', () => search(searchInput.value.trim()));
searchInput.addEventListener('input', () => showAutocomplete(searchInput.value));
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const first = autocompleteList.querySelector('.autocomplete-option');
    if (first && !autocompleteList.hidden) {
      selectAnime(first.dataset.slug);
    } else {
      search(searchInput.value.trim());
    }
  }
  if (e.key === 'Escape') hideAutocomplete();
});
searchInput.addEventListener('blur', hideAutocomplete);

document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
    hideAutocomplete();
  }
});

tabFiller.addEventListener('click', () => {
  setActiveTab(tabFiller);
  showPanel(panelFiller);
});
tabCanon.addEventListener('click', () => {
  setActiveTab(tabCanon);
  showPanel(panelCanon);
});
tabAnimeCanon.addEventListener('click', () => {
  setActiveTab(tabAnimeCanon);
  showPanel(panelAnimeCanon);
});

copyFillerBtn.addEventListener('click', copyFillerList);

loadAnimeList().then(initQuickPicks);
