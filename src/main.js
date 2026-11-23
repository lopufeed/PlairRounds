import './style.css';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreLabel = document.querySelector('#score');
const overlay = document.querySelector('#overlay');
const startButton = document.querySelector('#start');
const restartButton = document.querySelector('#restart');
const titleLabel = document.querySelector('#message-title');
const copyLabel = document.querySelector('#message-copy');

const game = { running: false, score: 0, basket: { x: 0, y: 0, width: 86, height: 18 }, stars: [], lastTime: 0, spawnTimer: 0, pointerDown: false };
let width = 0;
let height = 0;
let dpr = 1;

function resize() {
  const rect = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width; height = rect.height;
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  game.basket.y = height - 44;
  game.basket.x = Math.min(game.basket.x || width / 2, width - game.basket.width / 2);
  draw();
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#252342'); gradient.addColorStop(1, '#171a2d');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
  // Background dots
  ctx.fillStyle = '#ffffff20';
  for (let i = 0; i < 32; i++) { const x = (i * 97 + 31) % width; const y = (i * 137 + 21) % height; ctx.beginPath(); ctx.arc(x, y, i % 4 === 0 ? 1.7 : 1, 0, Math.PI * 2); ctx.fill(); }
  for (const star of game.stars) { ctx.font = `${star.size}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe276'; ctx.shadowColor = '#ffe276'; ctx.shadowBlur = 16; ctx.fillText('★', star.x, star.y); }
  ctx.shadowBlur = 0;
  const b = game.basket;
  ctx.fillStyle = '#9a83ff'; ctx.beginPath(); ctx.roundRect(b.x - b.width / 2, b.y, b.width, b.height, 9); ctx.fill();
  ctx.fillStyle = '#c6baff'; ctx.beginPath(); ctx.roundRect(b.x - b.width / 2 + 7, b.y + 3, b.width - 14, 5, 3); ctx.fill();
}

function start() { game.running = true; game.score = 0; game.stars = []; game.spawnTimer = 0; scoreLabel.textContent = '0'; overlay.classList.add('hidden'); game.lastTime = performance.now(); requestAnimationFrame(loop); }
function finish() { game.running = false; titleLabel.textContent = 'Игра окончена'; copyLabel.textContent = `Ты поймал${game.score === 1 ? '' : 'а'} ${game.score} звёзд. Сыграем ещё?`; startButton.textContent = 'Ещё раз'; overlay.classList.remove('hidden'); if (window.PLAIR?.score) window.PLAIR.score(game.score); }
function loop(now) {
  if (!game.running) return;
  const dt = Math.min((now - game.lastTime) / 1000, 0.04); game.lastTime = now;
  game.spawnTimer += dt;
  if (game.spawnTimer > Math.max(.35, .95 - game.score * .015)) { game.spawnTimer = 0; game.stars.push({ x: 22 + Math.random() * (width - 44), y: -12, size: 19 + Math.random() * 9, speed: 150 + Math.random() * 80 + game.score * 3 }); }
  for (const star of game.stars) star.y += star.speed * dt;
  game.stars = game.stars.filter(star => {
    if (star.y >= game.basket.y - 5 && star.y <= game.basket.y + game.basket.height + 18 && Math.abs(star.x - game.basket.x) < game.basket.width / 2 + 10) { game.score++; scoreLabel.textContent = String(game.score); return false; }
    if (star.y > height + 20) { finish(); return false; }
    return true;
  });
  draw(); if (game.running) requestAnimationFrame(loop);
}

function moveBasket(clientX) { const rect = canvas.getBoundingClientRect(); game.basket.x = Math.max(game.basket.width / 2, Math.min(width - game.basket.width / 2, clientX - rect.left)); if (!game.running) draw(); }
canvas.addEventListener('pointerdown', e => { game.pointerDown = true; canvas.setPointerCapture(e.pointerId); moveBasket(e.clientX); });
canvas.addEventListener('pointermove', e => { if (game.pointerDown) moveBasket(e.clientX); });
canvas.addEventListener('pointerup', () => { game.pointerDown = false; });
window.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) e.preventDefault(); const step = width * .06; if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') game.basket.x = Math.max(game.basket.width / 2, game.basket.x - step); if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') game.basket.x = Math.min(width - game.basket.width / 2, game.basket.x + step); if (!game.running) draw(); });
startButton.addEventListener('click', start); restartButton.addEventListener('click', () => { titleLabel.textContent = 'Готов играть?'; copyLabel.textContent = 'Двигай корзину и лови звёзды. На телефоне перетаскивай пальцем.'; startButton.textContent = 'Играть'; start(); });
window.addEventListener('resize', resize);
resize();
