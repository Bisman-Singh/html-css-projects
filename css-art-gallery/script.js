const artPieces = [
  {
    id: 'sunset',
    title: 'Sunset Scene',
    html: `<div class="sunset"><div class="water"></div></div>`
  },
  {
    id: 'coffee',
    title: 'Coffee Cup',
    html: `<div class="coffee">
      <div class="liquid"></div>
      <div class="steam"><span></span><span></span><span></span></div>
    </div>`
  },
  {
    id: 'rocket',
    title: 'Rocket Ship',
    html: `<div class="rocket">
      <div class="body"></div>
      <div class="window"></div>
      <div class="fin-left"></div>
      <div class="fin-right"></div>
      <div class="flame"></div>
    </div>`
  },
  {
    id: 'cat',
    title: 'Cat Face',
    html: `<div class="cat">
      <div class="head"></div>
      <div class="ear-left"></div>
      <div class="ear-right"></div>
      <div class="eye-left"></div>
      <div class="eye-right"></div>
      <div class="nose"></div>
      <div class="mouth"></div>
      <div class="whisker"></div>
      <div class="whisker"></div>
      <div class="whisker"></div>
      <div class="whisker"></div>
    </div>`
  },
  {
    id: 'mountain',
    title: 'Mountain Landscape',
    html: `<div class="mountain">
      <div class="peak1"></div>
      <div class="peak2"></div>
      <div class="moon"></div>
      <div class="star"></div>
      <div class="star"></div>
      <div class="star"></div>
      <div class="star"></div>
      <div class="star"></div>
    </div>`
  },
  {
    id: 'gamepad',
    title: 'Gamepad Controller',
    html: `<div class="gamepad">
      <div class="pad-body"></div>
      <div class="grip-left"></div>
      <div class="grip-right"></div>
      <div class="dpad"></div>
      <div class="btn-group">
        <div class="btn-a"></div>
        <div class="btn-b"></div>
        <div class="btn-x"></div>
        <div class="btn-y"></div>
      </div>
    </div>`
  },
  {
    id: 'camera',
    title: 'Camera',
    html: `<div class="camera">
      <div class="cam-top"></div>
      <div class="cam-body">
        <div class="lens-outer">
          <div class="lens-inner"></div>
        </div>
        <div class="flash"></div>
        <div class="btn-shutter"></div>
      </div>
    </div>`
  },
  {
    id: 'vinyl',
    title: 'Vinyl Record',
    html: `<div class="vinyl">
      <div class="shine"></div>
      <span class="label-text">PLAY</span>
    </div>`
  }
];

const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxArt = document.getElementById('lightboxArt');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxClose = document.getElementById('lightboxClose');

function renderGallery() {
  gallery.innerHTML = artPieces.map(piece => `
    <div class="card" data-id="${piece.id}">
      <div class="card-art">${piece.html}</div>
      <div class="card-info">${piece.title}</div>
    </div>
  `).join('');
}

function openLightbox(id) {
  const piece = artPieces.find(p => p.id === id);
  if (!piece) return;
  lightboxArt.innerHTML = piece.html;
  lightboxTitle.textContent = piece.title;
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

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

renderGallery();
