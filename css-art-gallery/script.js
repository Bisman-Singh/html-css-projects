const artPieces = [...(window.ART_DATA_1 || []), ...(window.ART_DATA_2 || [])];

const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxArt = document.getElementById('lightboxArt');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCat = document.getElementById('lightboxCat');
const lightboxClose = document.getElementById('lightboxClose');
const filterBar = document.getElementById('filterBar');
const searchInput = document.getElementById('search');
const counter = document.getElementById('counter');

const categories = ['All', ...new Set(artPieces.map(p => p.category))];
let activeCategory = 'All';
let searchQuery = '';

function renderFilters() {
  filterBar.innerHTML = categories.map(cat =>
    `<button class="filter-btn${cat === activeCategory ? ' active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');
}

function getFiltered() {
  return artPieces.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery) || p.category.toLowerCase().includes(searchQuery);
    return matchCat && matchSearch;
  });
}

function renderGallery() {
  const filtered = getFiltered();
  counter.textContent = `Showing ${filtered.length} of ${artPieces.length}`;

  if (filtered.length === 0) {
    gallery.innerHTML = '<div class="no-results">No art pieces match your search.</div>';
    return;
  }

  gallery.innerHTML = filtered.map((piece, i) => `
    <div class="card" data-id="${piece.id}" style="animation-delay:${Math.min(i * 30, 600)}ms">
      <div class="card-art">${piece.html}</div>
      <div class="card-info">${piece.title}</div>
      <div class="card-category">${piece.category}</div>
    </div>
  `).join('');
}

function openLightbox(id) {
  const piece = artPieces.find(p => p.id === id);
  if (!piece) return;
  lightboxArt.innerHTML = piece.html;
  lightboxTitle.textContent = piece.title;
  lightboxCat.textContent = piece.category;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

gallery.addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (card) openLightbox(card.dataset.id);
});

filterBar.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  activeCategory = btn.dataset.cat;
  renderFilters();
  renderGallery();
});

searchInput.addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderGallery();
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

renderFilters();
renderGallery();
