const paragraphs = [
  "The quick brown fox jumps over the lazy dog near the riverbank where wildflowers bloom in every color imaginable during the warm summer months.",
  "Programming is the art of telling a computer what to do through carefully crafted instructions that must be precise and unambiguous in their meaning.",
  "A journey of a thousand miles begins with a single step, and every great achievement starts with the decision to try something new and challenging.",
  "The ocean waves crashed against the rocky shore as seagulls circled overhead, their cries echoing across the misty morning landscape below the cliffs.",
  "In the heart of the ancient forest, towering oak trees formed a natural cathedral where sunlight filtered through leaves creating patterns on the ground.",
  "Technology continues to reshape our daily lives in ways we never imagined, from how we communicate to how we work and entertain ourselves each day.",
  "The art of cooking requires patience, creativity, and a willingness to experiment with different flavors and techniques until you find the perfect combination.",
  "Music has the remarkable ability to transport us to different times and places, evoking emotions and memories that words alone cannot adequately express.",
  "Scientists have discovered that regular exercise not only strengthens the body but also improves mental health, memory, and overall cognitive function significantly.",
  "The night sky was filled with countless stars, each one a distant sun with its own system of planets orbiting in the vast expanse of space.",
  "Reading books opens doors to new worlds and perspectives, allowing us to experience lives vastly different from our own through the power of storytelling.",
  "The city skyline glittered with thousands of lights as the sun set behind the mountains, painting the clouds in shades of orange, pink, and purple.",
  "Learning a new language is like gaining a new lens through which to view the world, revealing cultural nuances and ways of thinking previously hidden.",
  "The garden was a masterpiece of careful planning, with rows of vegetables, herbs, and flowers arranged in perfect harmony to maximize both beauty and yield."
];

const DURATION = 60;
const AVERAGE_WPM = 40;

const textDisplay = document.getElementById('textDisplay');
const inputArea = document.getElementById('inputArea');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const charsEl = document.getElementById('chars');
const timerEl = document.getElementById('timer');
const progressFill = document.getElementById('progressFill');
const restartBtn = document.getElementById('restartBtn');
const resultsOverlay = document.getElementById('resultsOverlay');
const resultsRestart = document.getElementById('resultsRestart');
const resultWpm = document.getElementById('resultWpm');
const resultAccuracy = document.getElementById('resultAccuracy');
const resultChars = document.getElementById('resultChars');
const resultCorrect = document.getElementById('resultCorrect');
const comparison = document.getElementById('comparison');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');

let currentText = '';
let timeLeft = DURATION;
let timerInterval = null;
let started = false;
let finished = false;
let correctChars = 0;
let totalTyped = 0;

function getRandomParagraph() {
  return paragraphs[Math.floor(Math.random() * paragraphs.length)];
}

function renderText(typed) {
  const chars = currentText.split('');
  textDisplay.innerHTML = chars.map((ch, i) => {
    let cls = '';
    if (i < typed.length) {
      cls = typed[i] === ch ? 'correct' : 'incorrect';
    } else if (i === typed.length) {
      cls = 'current';
    }
    const display = ch === ' ' ? '&nbsp;' : ch;
    return `<span class="char ${cls}">${display}</span>`;
  }).join('');
}

function updateStats() {
  const typed = inputArea.value;
  totalTyped = typed.length;
  correctChars = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === currentText[i]) correctChars++;
  }

  const elapsed = DURATION - timeLeft;
  const minutes = elapsed / 60;
  const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
  const acc = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

  wpmEl.textContent = wpm;
  accuracyEl.textContent = acc;
  charsEl.textContent = totalTyped;
}

function startTimer() {
  started = true;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    progressFill.style.width = ((timeLeft / DURATION) * 100) + '%';
    updateStats();

    if (timeLeft <= 0) {
      endTest();
    }
  }, 1000);
}

function endTest() {
  clearInterval(timerInterval);
  finished = true;
  inputArea.disabled = true;

  const elapsed = DURATION - timeLeft;
  const minutes = elapsed / 60 || 1 / 60;
  const finalWpm = Math.round((correctChars / 5) / minutes);
  const finalAcc = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;

  resultWpm.textContent = finalWpm;
  resultAccuracy.textContent = finalAcc + '%';
  resultChars.textContent = totalTyped;
  resultCorrect.textContent = correctChars;

  if (finalWpm > AVERAGE_WPM + 10) {
    comparison.textContent = `Above average! You're ${finalWpm - AVERAGE_WPM} WPM faster than the average (${AVERAGE_WPM} WPM).`;
    comparison.className = 'comparison above';
  } else if (finalWpm >= AVERAGE_WPM - 5) {
    comparison.textContent = `Right around average (${AVERAGE_WPM} WPM). Keep practicing!`;
    comparison.className = 'comparison average';
  } else {
    comparison.textContent = `Below average (${AVERAGE_WPM} WPM). Practice makes perfect — try again!`;
    comparison.className = 'comparison below';
  }

  resultsOverlay.classList.add('active');
  saveHistory(finalWpm, finalAcc, totalTyped);
}

function saveHistory(wpm, acc, chars) {
  const history = JSON.parse(localStorage.getItem('typingHistory') || '[]');
  history.unshift({
    wpm,
    accuracy: acc,
    chars,
    date: new Date().toLocaleString()
  });
  if (history.length > 20) history.length = 20;
  localStorage.setItem('typingHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('typingHistory') || '[]');
  if (history.length === 0) {
    historySection.style.display = 'none';
    return;
  }
  historySection.style.display = 'block';
  historyList.innerHTML = history.map(h => `
    <div class="history-item">
      <span class="hi-wpm">${h.wpm} WPM</span>
      <span class="hi-acc">${h.accuracy}%</span>
      <span class="hi-date">${h.date}</span>
    </div>
  `).join('');
}

function reset() {
  clearInterval(timerInterval);
  started = false;
  finished = false;
  timeLeft = DURATION;
  correctChars = 0;
  totalTyped = 0;
  currentText = getRandomParagraph();

  inputArea.value = '';
  inputArea.disabled = false;
  inputArea.focus();

  timerEl.textContent = DURATION;
  wpmEl.textContent = '0';
  accuracyEl.textContent = '100';
  charsEl.textContent = '0';
  progressFill.style.width = '100%';

  resultsOverlay.classList.remove('active');
  renderText('');
  renderHistory();
}

inputArea.addEventListener('input', () => {
  if (finished) return;
  if (!started) startTimer();
  const typed = inputArea.value;
  renderText(typed);
  updateStats();

  if (typed.length >= currentText.length) {
    endTest();
  }
});

inputArea.addEventListener('paste', e => e.preventDefault());

restartBtn.addEventListener('click', reset);
resultsRestart.addEventListener('click', reset);

reset();
