let audioCtx, analyser, source, gainNode;
let audio = null;
let isPlaying = false;
let currentMode = 'bars';
let animationId = null;
let frequencyData, waveformData;

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
}

window.addEventListener('resize', () => {
  resizeCanvas();
});
resizeCanvas();

const playBtn = document.getElementById('play-btn');
const iconPlay = document.getElementById('icon-play');
const iconPause = document.getElementById('icon-pause');
const volumeSlider = document.getElementById('volume');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const trackNameEl = document.getElementById('track-name');
const fileInput = document.getElementById('file-input');

function formatTime(s) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function initAudioContext() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.8;
  gainNode = audioCtx.createGain();
  gainNode.gain.value = parseFloat(volumeSlider.value);
}

function loadFile(file) {
  initAudioContext();

  if (audio) {
    audio.pause();
    if (source) source.disconnect();
  }

  audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.src = URL.createObjectURL(file);

  trackNameEl.textContent = file.name;
  playBtn.disabled = false;

  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayIcon();
  });

  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  frequencyData = new Uint8Array(analyser.frequencyBinCount);
  waveformData = new Uint8Array(analyser.fftSize);

  audio.play().then(() => {
    isPlaying = true;
    updatePlayIcon();
    animate();
  });
}

function togglePlay() {
  if (!audio) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  if (isPlaying) {
    audio.pause();
  } else {
    audio.play();
  }
  isPlaying = !isPlaying;
  updatePlayIcon();
  if (isPlaying && !animationId) animate();
}

function updatePlayIcon() {
  iconPlay.style.display = isPlaying ? 'none' : 'block';
  iconPause.style.display = isPlaying ? 'block' : 'none';
}

function updateProgress() {
  if (!audio || !audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = pct + '%';
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

/* ---- Visualization ---- */
function animate() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  ctx.clearRect(0, 0, w, h);

  if (analyser) {
    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(waveformData);
  }

  switch (currentMode) {
    case 'bars':
      drawBars(w, h);
      break;
    case 'radial':
      drawRadial(w, h);
      break;
    case 'wave':
      drawWave(w, h);
      break;
  }

  updateProgress();
  animationId = requestAnimationFrame(animate);
}

function makeGradient(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#a855f7');
  g.addColorStop(0.5, '#6366f1');
  g.addColorStop(1, '#06b6d4');
  return g;
}

function drawBars(w, h) {
  const len = frequencyData.length;
  const barCount = Math.min(len, 128);
  const barW = (w / barCount) * 0.8;
  const gap = (w / barCount) * 0.2;

  for (let i = 0; i < barCount; i++) {
    const val = frequencyData[i] / 255;
    const barH = val * h * 0.75;
    const x = i * (barW + gap);
    const y = h - barH;

    const g = ctx.createLinearGradient(x, y, x, h);
    g.addColorStop(0, `rgba(6, 182, 212, ${0.6 + val * 0.4})`);
    g.addColorStop(1, `rgba(168, 85, 247, ${0.3 + val * 0.4})`);
    ctx.fillStyle = g;

    ctx.beginPath();
    const r = Math.min(barW / 2, 4);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, h);
    ctx.lineTo(x, h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.fill();

    // Glow
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = val * 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawRadial(w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const baseRadius = Math.min(w, h) * 0.18;
  const maxRadius = Math.min(w, h) * 0.42;
  const count = Math.min(frequencyData.length, 180);

  for (let i = 0; i < count; i++) {
    const val = frequencyData[i] / 255;
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const r = baseRadius + val * (maxRadius - baseRadius);

    const x1 = cx + Math.cos(angle) * baseRadius;
    const y1 = cy + Math.sin(angle) * baseRadius;
    const x2 = cx + Math.cos(angle) * r;
    const y2 = cy + Math.sin(angle) * r;

    const hue = (i / count) * 180 + 200; // purple to cyan range
    ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${0.5 + val * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Tip glow
    if (val > 0.5) {
      ctx.beginPath();
      ctx.arc(x2, y2, 2 + val * 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${val * 0.8})`;
      ctx.fill();
    }
  }

  // Center circle
  const avgVal = [...frequencyData].slice(0, 64).reduce((a, b) => a + b, 0) / (64 * 255);
  const pulse = baseRadius * 0.85 + avgVal * 10;
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse);
  cg.addColorStop(0, `rgba(99, 102, 241, ${0.3 + avgVal * 0.3})`);
  cg.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.beginPath();
  ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
  ctx.fillStyle = cg;
  ctx.fill();
}

function drawWave(w, h) {
  const len = waveformData.length;
  const sliceW = w / len;

  // Background glow line
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
  ctx.beginPath();
  for (let i = 0; i < len; i++) {
    const v = waveformData[i] / 128.0;
    const y = (v * h) / 2;
    if (i === 0) ctx.moveTo(0, y);
    else ctx.lineTo(i * sliceW, y);
  }
  ctx.stroke();

  // Main line
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = makeGradient(ctx, 0, 0, w, 0);
  ctx.beginPath();
  for (let i = 0; i < len; i++) {
    const v = waveformData[i] / 128.0;
    const y = (v * h) / 2;
    if (i === 0) ctx.moveTo(0, y);
    else ctx.lineTo(i * sliceW, y);
  }
  ctx.stroke();

  // Glow effect
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Mirror line (faded)
  ctx.globalAlpha = 0.2;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = makeGradient(ctx, 0, 0, w, 0);
  ctx.beginPath();
  for (let i = 0; i < len; i++) {
    const v = waveformData[i] / 128.0;
    const y = h - (v * h) / 2;
    if (i === 0) ctx.moveTo(0, y);
    else ctx.lineTo(i * sliceW, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/* ---- Idle animation when no audio is loaded ---- */
function drawIdle() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);

  const t = Date.now() / 1000;
  const cx = w / 2;
  const cy = h / 2;

  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 + t * 0.3;
    const r = 80 + Math.sin(t + i * 0.2) * 20;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    const hue = (i / 60) * 180 + 200;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.6)`;
    ctx.fill();
  }

  if (!audio || audio.paused) {
    requestAnimationFrame(drawIdle);
  }
}

drawIdle();

/* ---- Event Listeners ---- */
fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) loadFile(file);
});

playBtn.addEventListener('click', togglePlay);

volumeSlider.addEventListener('input', () => {
  if (gainNode) gainNode.gain.value = parseFloat(volumeSlider.value);
});

progressBar.addEventListener('click', e => {
  if (!audio || !audio.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.mode-btn.active').classList.remove('active');
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
  });
});

document.addEventListener('keydown', e => {
  if (e.code === 'Space' && audio) {
    e.preventDefault();
    togglePlay();
  }
});
