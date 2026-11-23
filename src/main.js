import './style.css';

let W = 640;
let H = 900;
let MID = H / 2;
let landscapeWorld = false;
const canvas = document.querySelector('#arena');
const ctx = canvas.getContext('2d');
const arenaWrap = document.querySelector('#arena-wrap');
const touchControls = document.querySelector('#touch-controls');
const screens = Object.fromEntries(['menu', 'skins', 'battle', 'upgrade', 'ending'].map(id => [id, document.getElementById(id)]));
const ballSkins = [
  { name: 'Архэ', redName: 'Хаос', idea: 'ИСТОК МАТЕРИИ', redIdea: 'БЕЗОБРАЗНОЕ НАЧАЛО', detail: '#d8d5c9', mark: 'crater' },
  { name: 'Апейрон', redName: 'Эреб', idea: 'БЕСКРАЙНИЙ МИР', redIdea: 'ПЕРВОЗДАННАЯ ТЬМА', detail: '#dff8ff', mark: 'facet' },
  { name: 'Эйдос', redName: 'Морфе', idea: 'ЧИСТАЯ ФОРМА', redIdea: 'ОБРАЗ МИРА', detail: '#e4aa70', mark: 'stripe' },
  { name: 'Фюсис', redName: 'Гея', idea: 'СИЛА РОСТА', redIdea: 'ЖИВАЯ ЗЕМЛЯ', detail: '#d3ecd8', mark: 'leaf' },
  { name: 'Гелиос', redName: 'Фаэтон', idea: 'СОЛНЕЧНЫЙ ПОРЯДОК', redIdea: 'ПАДАЮЩИЙ ОГОНЬ', detail: '#fff0b2', mark: 'spot' },
  { name: 'Селена', redName: 'Геката', idea: 'ЛУННЫЙ ЦИКЛ', redIdea: 'ТАЙНА НОЧИ', detail: '#edebf8', mark: 'spots' },
  { name: 'Кайрос', redName: 'Хронос', idea: 'МИГ ПЕРЕМЕНЫ', redIdea: 'НЕОБРАТИМОЕ ВРЕМЯ', detail: '#ffcfaa', mark: 'comet' },
  { name: 'Логос', redName: 'Ананке', idea: 'ПУЛЬС КОСМОСА', redIdea: 'НЕИЗБЕЖНЫЙ ПОРЯДОК', detail: '#efd9ff', mark: 'pulse' }
];

const relics = [
  { id: 'swiftmove', name: 'Быстрый ход', text: 'Планета быстрее перемещается по полю', stat: 'moveSpeed', value: 70 },
  { id: 'warp', name: 'Складка пространства', text: 'После перемещения даёт короткий рывок', stat: 'dash', value: 1 },
  { id: 'fastplanet', name: 'Красное смещение', text: 'Брошенная планета летит быстрее', stat: 'shotSpeed', value: 110 },
  { id: 'comet', name: 'Хвост кометы', text: 'За броском тянется длинный след', stat: 'cometTrail', value: 1 },
  { id: 'bigshot', name: 'Тяжесть света', text: 'Каждый уровень увеличивает размер выстрела', stat: 'shotSize', value: 4 },
  { id: 'heavyplanet', name: 'Тяжёлое ядро', text: 'Бросок крупнее, но летит медленнее', stat: 'heavy', value: 1 },
  { id: 'quickreturn', name: 'Быстрый возврат', text: 'Планета раньше возвращается после броска', stat: 'cooldown', value: -.18 },
  { id: 'afterimage', name: 'Послесвечение', text: 'Уже созданный отголосок летит быстрее', stat: 'echoSpeed', value: .28, requires: 'echo' },
  { id: 'ricochet', name: 'Закон отражения', text: 'Выстрел один раз отскакивает от стены', stat: 'bounce', value: 1 },
  { id: 'satellite', name: 'Спутник-хранитель', text: 'Спутник перехватывает один бросок', stat: 'satellites', value: 1 },
  { id: 'twinmoon', name: 'Двойная луна', text: 'Твои спутники быстрее вращаются вокруг тебя', stat: 'orbitSpeed', value: 1, requires: 'satellite' },
  { id: 'armor', name: 'Каменная кора', text: 'Один бросок не выбьет тебя из раунда', stat: 'armor', value: 1 },
  { id: 'ironcore', name: 'Железное ядро', text: 'Твоя броня отражает заблокированный бросок', stat: 'reflect', value: 1, requires: 'armor' },
  { id: 'shardfall', name: 'Звёздный дождь', text: 'Объекты чаще появляются на поле', stat: 'spawnRate', value: .9 },
  { id: 'starmap', name: 'Карта созвездий', text: 'Легче собирать объекты на поле', stat: 'magnet', value: 38 },
  { id: 'resonance', name: 'Резонанс', text: 'Можно хранить ещё один заряд', stat: 'chargeMax', value: 1 },
  { id: 'wardseed', name: 'Семя защиты', text: 'Чаще появляется белый осколок брони', stat: 'wardChance', value: .12 },
  { id: 'ember', name: 'Уголь звезды', text: 'Синий осколок сильнее ускоряет бросок', stat: 'pickupSpeed', value: 100 },
  { id: 'piercer', name: 'Игла судьбы', text: 'Бросок пробивает спутники и броню', stat: 'pierce', value: 1 },
  { id: 'phase', name: 'Прозрачный путь', text: 'Выстрелы проходят сквозь чужие выстрелы', stat: 'phase', value: 1, maxLevel: 1 },
  { id: 'seeker', name: 'Звезда-проводник', text: 'Планета мягко меняет курс к сопернику', stat: 'homing', value: .7 },
  { id: 'smallbody', name: 'Лёгкая орбита', text: 'Ты меньше и быстрее перемещаешься', stat: 'smallBody', value: 1 },
  { id: 'split', name: 'Тройное затмение', text: 'I — два выстрела · II — три выстрела', stat: 'split', value: 1, maxLevel: 2 },
  { id: 'echo', name: 'Эхо пустоты', text: 'Следом за броском летит его отголосок', stat: 'echo', value: 1 },
  { id: 'coldfront', name: 'Холодный фронт', text: 'Соперник медленнее рядом с тобой', stat: 'chillAura', value: 1 },
  { id: 'deepfield', name: 'Глубокое поле', text: 'Рикошет разгоняет выстрел после отскока', stat: 'bounceSpeed', value: 75, requires: 'ricochet' },
  { id: 'clashblast', name: 'Сверхновая', text: 'Столкновение выстрелов создаёт взрывную волну', stat: 'clashBlast', value: 1 },
  { id: 'orbitglass', name: 'Орбитальное стекло', text: 'Твои спутники держатся дальше от планеты', stat: 'orbitRadius', value: 12, requires: 'satellite' },
  { id: 'lastlight', name: 'Последний свет', text: 'После потери своей брони бросок быстрее', stat: 'lastLight', value: 140, requires: 'armor' },
  { id: 'crown', name: 'Корона пустоты', text: 'Планета быстрее ходит и летит', stat: 'crown', value: 1 }
];
const signatureRelics = new Set(['smallbody', 'bigshot', 'split', 'ricochet', 'clashblast', 'coldfront', 'phase']);

const state = {
  mode: 'ai', phase: 'menu', running: false, lastTime: 0, players: [], shots: [], pendingShots: [], shotImpacts: [], tapMarks: [], chargeNodes: [], pickups: [], particles: [], gestures: new Map(), chosenSkins: [0, 4], skinPicked: [false, false], skinConfirmed: [false, false], selectingPlayer: 0, roundIntro: 0,
  matchScore: [0, 0], campaignWins: [0, 0], duelsPlayed: 0, matchWinner: null, upgradeOffers: [],
  upgradeChoices: [null, null], continueTimer: 0, keys: new Set(), keyboardActive: [false, false],
  mobileMoveAxis: { x: 0, y: 0 }, mobileAim: { x: 0, y: 0, strength: 0 }, stickPointers: { move: null, fire: null },
  aiTimer: .8, aiMoveTimer: 0, hitstop: 0, shake: 0, cameraZoom: 1, spawnClock: 2.4,
  ambient: Array.from({ length: 54 }, (_, i) => ({ x: (i * 157 + 37) % W, y: (i * 113 + 53) % H, size: i % 7 === 0 ? 2 : 1, phase: i * .7 }))
};

function makePlayer(index) {
  return { index, skin: state.chosenSkins[index], x: W / 2, y: index ? H * .17 : H * .83, targetX: W / 2, targetY: index ? H * .17 : H * .83, hp: 1, armor: 0, lostArmor: false, cards: {}, charges: 1, orbReady: true, cooldown: 0, bonusSpeed: 0, bonusPower: 0, dashTimer: 0, satellites: [], hitFlash: 0 };
}

function statsFor(player) {
  const s = { moveSpeed: 410, shotSpeed: 310, cooldown: .94, planetSize: 0, shotSize: 0, smallBody: 0, clashBlast: 0, chillAura: 0, phase: 0, bounce: 0, satellites: 0, armor: 0, chargeMax: 3, spawnRate: 0, magnet: 22, pickupPower: 0, wardChance: 0, pickupSpeed: 0, pierce: 0, homing: 0, split: 0, echo: 0, impact: 0, bounceSpeed: 0, satelliteSize: 0, lastLight: 0, crown: 0, dash: 0, cometTrail: 0, orbitSpeed: 0, orbitRadius: 0, reflect: 0, nodeMagnet: 0, heavy: 0, echoSpeed: 0, orbitRange: 0 };
  for (const [id, level] of Object.entries(player.cards)) { const card = relics.find(item => item.id === id); if (card) s[card.stat] += card.value * level; }
  if (s.heavy) { s.planetSize += 3 * s.heavy; s.shotSpeed -= 38 * s.heavy; }
  if (s.crown) { s.moveSpeed += s.crown * 28; s.shotSpeed += s.crown * 45; }
  if (s.smallBody) s.moveSpeed += s.smallBody * 66;
  s.moveSpeed = Math.max(180, s.moveSpeed); s.shotSpeed = Math.max(240, s.shotSpeed);
  s.cooldown = Math.max(.42, s.cooldown); s.planetSize = Math.min(12, s.planetSize);
  s.satellites = Math.min(4, s.satellites); s.armor = Math.min(3, s.armor);
  s.chargeMax = Math.min(6, s.chargeMax);
  return s;
}

function switchScreen(id) {
  Object.entries(screens).forEach(([name, node]) => node.classList.toggle('hidden', name !== id));
  state.phase = id;
  touchControls.classList.toggle('hidden', id !== 'battle' || !window.matchMedia('(pointer: coarse)').matches);
  if (id === 'battle') resizeCanvas();
}

function newGame(mode) {
  state.mode = mode; state.chosenSkins = [0, 4]; state.skinPicked = mode === 'ai' ? [true, true] : [true, false]; state.skinConfirmed = [false, false]; state.selectingPlayer = 0;
  renderSkinPicker(); switchScreen('skins');
}

function renderSkinPicker() {
  const players = document.querySelector('#skin-players'), options = document.querySelector('#skin-options');
  const isLocal = state.mode === 'pvp', pickingBlue = state.selectingPlayer === 0;
  players.innerHTML = isLocal ? `<span class="skin-player skin-blue ${pickingBlue ? 'active' : state.skinConfirmed[0] ? 'done' : ''}">СИНИЙ</span><span class="skin-player skin-red ${!pickingBlue ? 'active' : state.skinConfirmed[1] ? 'done' : ''}">КРАСНЫЙ</span>` : '';
  const skinTurn = document.querySelector('#skin-turn');
  skinTurn.textContent = isLocal ? (pickingBlue ? 'ХОД СИНЕЙ ПЛАНЕТЫ' : 'ХОД КРАСНОЙ ПЛАНЕТЫ') : '';
  skinTurn.classList.toggle('hidden', !isLocal);
  document.querySelector('#skin-title-text').textContent = isLocal ? (pickingBlue ? 'СИНЯЯ ПЛАНЕТА' : 'КРАСНАЯ ПЛАНЕТА') : 'ВЫБЕРИ ПЛАНЕТУ';
  const teamColor = state.selectingPlayer ? '#ff382f' : '#159ff2';
  const selectedSkin = ballSkins[state.chosenSkins[state.selectingPlayer]], selectedName = isLocal && state.selectingPlayer ? selectedSkin.redName : selectedSkin.name, selectedIdea = isLocal && state.selectingPlayer ? selectedSkin.redIdea : selectedSkin.idea, showcase = document.querySelector('#skin-showcase'), showcaseOrb = showcase.querySelector('.showcase-orb');
  showcaseOrb.className = `showcase-orb skin-orb skin-${selectedSkin.mark}`;
  showcaseOrb.style.setProperty('--orb', teamColor); showcaseOrb.style.setProperty('--orb-detail', selectedSkin.detail);
  showcase.style.setProperty('--skin-accent', teamColor);
  document.querySelector('#skin-showcase-name').textContent = selectedName;
  document.querySelector('#skin-showcase-idea').textContent = selectedIdea;
  showcase.classList.remove('skin-change'); void showcase.offsetWidth; showcase.classList.add('skin-change');
  options.innerHTML = ballSkins.map((skin, i) => { const name = isLocal && state.selectingPlayer ? skin.redName : skin.name; return `<button class="skin-chip ${state.chosenSkins[state.selectingPlayer] === i ? 'selected' : ''}" data-skin="${i}" aria-label="${name}"><span class="skin-orb skin-${skin.mark}" style="--orb:${teamColor};--orb-detail:${skin.detail}"></span><small>${name}</small></button>`; }).join('');
  options.querySelectorAll('[data-skin]').forEach(button => button.addEventListener('click', () => {
    state.chosenSkins[state.selectingPlayer] = Number(button.dataset.skin); state.skinPicked[state.selectingPlayer] = true;
    if (state.mode === 'ai') { state.chosenSkins[1] = (state.chosenSkins[0] + 4) % ballSkins.length; state.skinPicked[1] = true; }
    renderSkinPicker();
  }));
  const startButton = document.querySelector('#skin-start');
  startButton.textContent = isLocal && state.selectingPlayer === 0 ? 'ВЫБРАТЬ ПЛАНЕТУ' : 'НАЧАТЬ БИТВУ ПЛАНЕТ';
  startButton.disabled = isLocal && !state.skinPicked[state.selectingPlayer];
}

function confirmSkinSelection() {
  if (state.mode === 'ai') { beginRun(); return; }
  const player = state.selectingPlayer;
  if (!state.skinPicked[player]) return;
  state.skinConfirmed[player] = true;
  if (player === 0) { state.selectingPlayer = 1; renderSkinPicker(); return; }
  beginRun();
}

function beginRun(mode = state.mode) {
  state.mode = mode; state.players = [makePlayer(0), makePlayer(1)]; state.campaignWins = [0, 0]; state.duelsPlayed = 0; state.matchScore = [0, 0]; state.matchWinner = null;
  state.shots = []; state.pickups = []; state.particles = []; state.spawnClock = 2.4;
  document.querySelector('#name-one').textContent = mode === 'ai' ? 'Ты' : 'Синий бог'; document.querySelector('#name-two').textContent = mode === 'ai' ? 'ИИ' : ballSkins[state.players[1].skin].redName;
  showUpgradePhase(true);
}

function startDuel() {
  state.duelsPlayed++; state.matchScore = [0, 0];
  state.players[0].x = W / 2; state.players[0].y = H * .83; state.players[0].targetX = W / 2; state.players[0].targetY = H * .83;
  state.players[1].x = W / 2; state.players[1].y = H * .17; state.players[1].targetX = W / 2; state.players[1].targetY = H * .17;
  document.querySelector('#duel-number').textContent = String(state.duelsPlayed).padStart(2, '0'); updateCampaign(); switchScreen('battle'); startRound();
}

function updateCampaign() {
  const root = document.querySelector('#campaign-pips'); root.innerHTML = '';
  for (let i = 0; i < 5; i++) { const pip = document.createElement('i'); if (i < state.campaignWins[0]) pip.className = 'won'; if (state.mode === 'pvp' && i < state.campaignWins[1]) pip.className = 'won opponent-won'; root.append(pip); }
  root.setAttribute('aria-label', `Победы ${state.campaignWins[0]} : ${state.campaignWins[1]}`);
}

function startRound() {
  clearTimeout(state.continueTimer); state.continueTimer = 0;
  state.mobileMoveAxis = { x: 0, y: 0 }; state.mobileAim = { x: 0, y: 0, strength: 0 };
  state.phase = 'battle';
  state.players.forEach(player => {
    player.hp = 1; player.armor = statsFor(player).armor; player.lostArmor = false; player.orbReady = true; player.cooldown = 0; player.bonusSpeed = 0; player.bonusPower = 0;
    player.x = W / 2; player.y = player.index ? H * .17 : H * .83; player.targetX = player.x; player.targetY = player.y; player.charges = 1;
    player.satellites = Array.from({ length: statsFor(player).satellites }, () => true);
  });
  state.shots = []; state.pendingShots = []; state.shotImpacts = []; state.tapMarks = []; state.pickups = []; state.particles = []; state.chargeNodes = makeChargeNodes(); state.spawnClock = 1.5; state.hitstop = 0; state.shake = 0; state.cameraZoom = 1; arenaWrap.style.transform = ''; canvas.style.transform = 'scale(1)'; state.running = true;
  document.querySelector('#curtain').classList.add('hidden'); state.roundIntro = 1.12;
  document.querySelector('#round-intro').classList.remove('hidden');
  updateReadout(); state.lastTime = performance.now(); requestAnimationFrame(loop);
}

function makeChargeNodes() {
  return [
    { owner: 1, x: W * .22, y: H * .23 }, { owner: 1, x: W * .78, y: H * .23 }, { owner: 1, x: W * .5, y: H * .41 },
    { owner: 0, x: W * .22, y: H * .77 }, { owner: 0, x: W * .78, y: H * .77 }, { owner: 0, x: W * .5, y: H * .59 }
  ].map(node => ({ ...node, active: true, respawn: 0, radius: 13, phase: Math.random() * 6.28 }));
}

function fieldFor(index) { return index === 0 ? { minY: MID + 30, maxY: H - 48 } : { minY: 48, maxY: MID - 30 }; }
function clampTarget(index, x, y) { const field = fieldFor(index); return { x: Math.max(44, Math.min(W - 44, x)), y: Math.max(field.minY, Math.min(field.maxY, y)) }; }
function hasShot(index) { return state.shots.some(shot => shot.owner === index) || state.pendingShots.some(shot => shot.owner === index); }
function playerRadius(player) { const s = statsFor(player); return Math.max(11, 19 + s.planetSize - s.smallBody * 3); }
function keyboardAxis(index) {
  const keys = state.keys;
  if (index === 0) return { x: Number(keys.has('KeyD')) - Number(keys.has('KeyA')), y: Number(keys.has('KeyS')) - Number(keys.has('KeyW')) };
  if (state.mode !== 'pvp') return { x: 0, y: 0 };
  return { x: Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft')), y: Number(keys.has('ArrowDown')) - Number(keys.has('ArrowUp')) };
}

function launchPlanet(index, target, pull) {
  const player = state.players[index];
  if (!player || !player.orbReady || hasShot(index) || player.charges < 1) return;
  const from = { x: player.x, y: player.y };
  const dx = target.x - from.x, dy = target.y - from.y;
  const power = Math.min(1, Math.max(.12, pull / 520));
  state.pendingShots.push({ owner: index, from, target, power, timer: .42 });
  player.charges--; player.orbReady = false; player.cooldown = statsFor(player).cooldown;
  state.shake = Math.max(state.shake, 3.4); pulseArena('shot-fired'); burst(from.x, from.y, index ? '#ff382f' : '#159ff2', 14); vibrate(12); updateReadout();
}

function releasePendingShot(pending) {
  const { owner, from, target, power } = pending, player = state.players[owner], s = statsFor(player);
  const dx = target.x - from.x, dy = target.y - from.y, direction = Math.atan2(dy, dx);
  const speed = s.shotSpeed * (.64 + power * .3) + player.bonusSpeed + (player.lostArmor ? s.lastLight : 0);
  const radius = 18 + s.planetSize + s.shotSize + player.bonusPower + Math.round(power * 4);
  const angles = s.split >= 2 ? [direction - .2, direction, direction + .2] : s.split === 1 ? [direction - .12, direction + .12] : [direction];
  angles.forEach(angle => state.shots.push({ x: from.x, y: from.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, owner, radius: radius * .68, baseRadius: radius, launchTimer: .22, bounce: Math.floor(s.bounce), homing: s.homing, pierce: Math.floor(s.pierce), phase: s.phase, impact: s.impact, clashBlast: s.clashBlast, maxAge: 2.5 + s.orbitRange * .5, age: 0, trail: [], trailLimit: s.cometTrail ? 9 + Math.floor(s.cometTrail) * 5 : 9, echo: false }));
  for (let echo = 0; echo < Math.floor(s.echo); echo++) window.setTimeout(() => { if (state.phase === 'battle' && state.running) { const echoSpeed = Math.min(1.3, .78 + s.echoSpeed - echo * .08), echoRadius = radius * .76; state.shots.push({ x: from.x, y: from.y, vx: Math.cos(direction) * speed * echoSpeed, vy: Math.sin(direction) * speed * echoSpeed, owner, radius: echoRadius * .68, baseRadius: echoRadius, launchTimer: .22, bounce: 0, homing: s.homing, pierce: 0, phase: s.phase, impact: 0, clashBlast: s.clashBlast, age: 0, trail: [], trailLimit: 9, echo: true }); } }, 190 + echo * 170);
  player.bonusSpeed = 0; player.bonusPower = 0; burst(from.x, from.y, owner ? '#ff382f' : '#159ff2', 14); sound('throw', owner);
}

function movePlayer(index, x, y) {
  const player = state.players[index]; if (!player) return;
  const target = clampTarget(index, x, y); player.targetX = target.x; player.targetY = target.y;
  if (statsFor(player).dash) player.dashTimer = .12 + statsFor(player).dash * .08;
}

function loop(now) {
  if (!state.running) return;
  const raw = Math.min((now - state.lastTime) / 1000, .035); state.lastTime = now; updateShotImpacts(raw);
  state.hitstop = Math.max(0, state.hitstop - raw); const dt = state.hitstop > 0 ? raw * .08 : raw;
  update(dt, raw, now); drawArena(); updateReadout(); state.shake = Math.max(0, state.shake - raw * 30); state.cameraZoom += (1 - state.cameraZoom) * Math.min(1, raw * 8);
  canvas.style.transform = `scale(${state.cameraZoom.toFixed(3)})`;
  arenaWrap.style.transform = state.shake > 0 ? `translate(${(Math.random() - .5) * state.shake}px, ${(Math.random() - .5) * state.shake}px)` : '';
  if (state.running) requestAnimationFrame(loop);
}

function update(dt, raw, now) {
  for (let i = state.tapMarks.length - 1; i >= 0; i--) { state.tapMarks[i].life -= dt; if (state.tapMarks[i].life <= 0) state.tapMarks.splice(i, 1); }
  if (state.roundIntro > 0) { state.roundIntro = Math.max(0, state.roundIntro - dt); if (!state.roundIntro) document.querySelector('#round-intro').classList.add('hidden'); }
  if (state.roundIntro > .62) { updateParticles(dt); return; }
  if (state.mode === 'ai') updateAI(dt);
  for (const player of state.players) {
    const s = statsFor(player);
    const axis = player.index === 0 && Math.hypot(state.mobileMoveAxis.x, state.mobileMoveAxis.y) > .08
      ? state.mobileMoveAxis
      : keyboardAxis(player.index);
    const axisLength = Math.hypot(axis.x, axis.y);
    if (axisLength > .08) {
      const target = clampTarget(player.index, player.x + axis.x / axisLength * 190, player.y + axis.y / axisLength * 190);
      player.targetX = target.x; player.targetY = target.y; state.keyboardActive[player.index] = true;
    } else if (state.keyboardActive[player.index]) {
      player.targetX = player.x; player.targetY = player.y; state.keyboardActive[player.index] = false;
    }
    const nextDx = player.targetX - player.x, nextDy = player.targetY - player.y, nextDistance = Math.hypot(nextDx, nextDy);
    const aura = statsFor(state.players[1 - player.index]).chillAura, slowed = aura > 0 && Math.hypot(player.x - state.players[1 - player.index].x, player.y - state.players[1 - player.index].y) < 150 ? Math.max(.5, 1 - aura * .17) : 1;
    if (nextDistance > 1) { const step = Math.min(nextDistance, s.moveSpeed * slowed * (player.dashTimer > 0 ? 1.8 + s.dash * .15 : 1) * dt); player.x += nextDx / nextDistance * step; player.y += nextDy / nextDistance * step; }
    player.dashTimer = Math.max(0, player.dashTimer - dt);
    player.cooldown = Math.max(0, player.cooldown - dt);
    if (!player.orbReady && player.cooldown <= 0 && !hasShot(player.index)) { player.orbReady = true; burst(player.x, player.y, player.index ? '#ff382f' : '#159ff2', 5); sound('return', player.index); }
    player.hitFlash = Math.max(0, player.hitFlash - dt);
  }
  for (const node of state.chargeNodes) {
    if (!node.active) { node.respawn -= dt; if (node.respawn <= 0) node.active = true; continue; }
    const player = state.players[node.owner];
    if (player.charges < statsFor(player).chargeMax && Math.hypot(player.x - node.x, player.y - node.y) < 30 + statsFor(player).nodeMagnet * 22) {
      player.charges++; node.active = false; node.respawn = 3.7;
      burst(node.x, node.y, '#ffe18a', 16); sound('charge', node.owner); vibrate(11); updateReadout();
    }
  }
  state.spawnClock -= dt;
  if (state.spawnClock <= 0 && state.pickups.length < 5) { spawnPickup(); state.spawnClock = Math.max(2.2, 6.3 - Math.max(...state.players.map(p => statsFor(p).spawnRate))); }

  for (let i = state.pendingShots.length - 1; i >= 0; i--) {
    const pending = state.pendingShots[i]; pending.timer -= dt;
    if (pending.timer <= 0) { state.pendingShots.splice(i, 1); releasePendingShot(pending); }
  }

  for (let i = state.shots.length - 1; i >= 0; i--) {
    const shot = state.shots[i]; shot.age += dt;
    if (shot.launchTimer > 0) {
      shot.launchTimer = Math.max(0, shot.launchTimer - dt);
      const t = 1 - shot.launchTimer / .22;
      const scale = t < .62 ? .68 + .5 * (1 - Math.pow(1 - t / .62, 2)) : 1.18 - .18 * ((t - .62) / .38);
      shot.radius = shot.baseRadius * scale;
    }
    shot.trail.push({ x: shot.x, y: shot.y }); if (shot.trail.length > (shot.trailLimit || 9)) shot.trail.shift();
    if (shot.homing > 0) {
      const target = state.players[1 - shot.owner], angle = Math.atan2(target.y - shot.y, target.x - shot.x), current = Math.atan2(shot.vy, shot.vx);
      const diff = Math.atan2(Math.sin(angle - current), Math.cos(angle - current)); const next = current + Math.max(-shot.homing * dt, Math.min(shot.homing * dt, diff)); const speed = Math.hypot(shot.vx, shot.vy);
      shot.vx = Math.cos(next) * speed; shot.vy = Math.sin(next) * speed;
    }
    shot.x += shot.vx * dt; shot.y += shot.vy * dt;
    let clash = false;
    for (let otherIndex = 0; otherIndex < state.shots.length; otherIndex++) {
      const other = state.shots[otherIndex];
      if (other === shot || other.owner === shot.owner || shot.phase > 0 || other.phase > 0 || Math.hypot(shot.x - other.x, shot.y - other.y) >= shot.radius + other.radius) continue;
      const x = (shot.x + other.x) / 2, y = (shot.y + other.y) / 2, dx = shot.vx - other.vx, dy = shot.vy - other.vy, explosive = shot.clashBlast > 0 || other.clashBlast > 0;
      const first = state.shots.indexOf(shot), second = state.shots.indexOf(other);
      if (first < 0 || second < 0) continue;
      state.shotImpacts.push({ x, y, angle: Math.atan2(dy, dx), life: explosive ? .48 : .28, max: explosive ? .48 : .28, explosion: explosive ? 1 : 0, blastRadius: 88 });
      state.shots.splice(Math.max(first, second), 1); state.shots.splice(Math.min(first, second), 1);
      state.hitstop = Math.max(state.hitstop, explosive ? .2 : .12); state.shake = Math.max(state.shake, explosive ? 9 : 5); pulseArena('shot-clash');
      burst(x, y, '#ffffff', explosive ? 40 : 24); burst(x, y, '#c9f4ff', explosive ? 24 : 12);
      if (explosive) state.players.forEach(player => {
        const ox = player.x - x, oy = player.y - y, distance = Math.hypot(ox, oy);
        if (distance > 0 && distance < 88) {
          if (player.armor > 0) { player.armor--; player.lostArmor = player.armor === 0; }
          const push = (88 - distance) * .8, pushed = clampTarget(player.index, player.x + ox / distance * push, player.y + oy / distance * push);
          player.x = player.targetX = pushed.x; player.y = player.targetY = pushed.y; player.hitFlash = .2;
        }
      });
      sound('block', shot.owner);
      clash = true; i = state.shots.length; break;
    }
    if (clash) continue;
    if (shot.x < shot.radius || shot.x > W - shot.radius || shot.y < shot.radius || shot.y > H - shot.radius) {
      if (shot.bounce > 0) {
        if (shot.x < shot.radius || shot.x > W - shot.radius) shot.vx *= -1;
        if (shot.y < shot.radius || shot.y > H - shot.radius) shot.vy *= -1;
        shot.bounce--; const rebound = 1 + statsFor(state.players[shot.owner]).bounceSpeed * .001; shot.vx *= rebound; shot.vy *= rebound; shot.x = Math.max(shot.radius, Math.min(W - shot.radius, shot.x)); shot.y = Math.max(shot.radius, Math.min(H - shot.radius, shot.y)); sound('tick', shot.owner);
      } else {
        const x = Math.max(0, Math.min(W, shot.x)), y = Math.max(0, Math.min(H, shot.y));
        vanishShot(shot, x, y); state.shots.splice(i, 1); continue;
      }
    }
    const target = state.players[1 - shot.owner];
    const satellite = target.satellites.findIndex(Boolean);
    if (satellite >= 0 && shot.pierce <= 0) {
      const a = now * .001 * (1 + statsFor(target).orbitSpeed * .6) + satellite * Math.PI * 2 / Math.max(1, target.satellites.length), orbit = 31 + statsFor(target).orbitRadius, sx = target.x + Math.cos(a) * orbit, sy = target.y + Math.sin(a) * orbit;
      if (Math.hypot(shot.x - sx, shot.y - sy) < shot.radius + 6) { target.satellites[satellite] = false; vanishShot(shot, sx, sy); state.shots.splice(i, 1); burst(sx, sy, target.index ? '#ff382f' : '#159ff2', 10); sound('block', target.index); continue; }
    }
    if (Math.hypot(shot.x - target.x, shot.y - target.y) < shot.radius + playerRadius(target)) {
      if (target.armor > 0 && shot.pierce <= 0) {
        const push = 40 + shot.impact * 26;
        target.armor--; target.lostArmor = target.armor === 0; target.hitFlash = .28; target.x = target.targetX = clampTarget(target.index, target.x + (shot.vx > 0 ? 1 : -1) * push, target.y + (target.index ? 24 : -24)).x;
        target.y = target.targetY = clampTarget(target.index, target.x, target.y + (target.index ? 24 : -24)).y;
        if (statsFor(target).reflect && !shot.reflected) { shot.owner = target.index; shot.vx *= -1; shot.vy *= -1; shot.reflected = true; shot.age = 0; }
        else state.shots.splice(i, 1);
        state.hitstop = .18; state.shake = Math.max(state.shake, 8); state.cameraZoom = Math.max(state.cameraZoom, 1.035); pulseArena('impact', target.index); burst(target.x, target.y, '#ffffff', 26); sound('block', target.index); continue;
      }
      const winner = shot.owner; state.shots.splice(i, 1); target.hitFlash = .42; state.hitstop = .32; state.shake = Math.max(state.shake, 15); state.cameraZoom = Math.max(state.cameraZoom, 1.065); pulseArena('impact', target.index);
      burst(target.x, target.y, target.index ? '#ff382f' : '#159ff2', 42); sound('hit', target.index); vibrate(55); finishRound(winner); return;
    }
    for (let j = state.pickups.length - 1; j >= 0; j--) {
      const object = state.pickups[j];
      if (Math.hypot(shot.x - object.x, shot.y - object.y) < shot.radius + object.radius) {
        burst(object.x, object.y, object.color, 8); state.pickups.splice(j, 1);
        if (shot.bounce > 0) { shot.vx *= -1; shot.vy *= -1; shot.bounce--; } else { vanishShot(shot, shot.x, shot.y); state.shots.splice(i, 1); }
        sound('block', shot.owner); break;
      }
    }
    if (shot.age > (shot.maxAge || 2.5)) state.shots.splice(i, 1);
  }

  for (const player of state.players) {
    const s = statsFor(player);
    player.satellites.forEach((alive, index) => {
      if (!alive) return;
      const a = now * .001 * (1 + s.orbitSpeed * .6) + index * Math.PI * 2 / Math.max(1, player.satellites.length), orbit = 31 + s.orbitRadius, sx = player.x + Math.cos(a) * orbit, sy = player.y + Math.sin(a) * orbit;
      for (let i = state.shots.length - 1; i >= 0; i--) { const shot = state.shots[i]; if (shot.owner !== player.index && shot.pierce <= 0 && Math.hypot(shot.x - sx, shot.y - sy) < shot.radius + 6) { player.satellites[index] = false; state.shots.splice(i, 1); burst(sx, sy, player.index ? '#ff382f' : '#159ff2', 10); sound('block', player.index); break; } }
    });
    for (let i = state.pickups.length - 1; i >= 0; i--) {
      const object = state.pickups[i], dx = player.x - object.x, dy = player.y - object.y, distance = Math.hypot(dx, dy);
      if (distance < s.magnet + 42) { object.x += dx / Math.max(1, distance) * dt * (45 + s.magnet); object.y += dy / Math.max(1, distance) * dt * (45 + s.magnet); }
      if (distance < 27) collectObject(player, object, i);
    }
  }
  updateParticles(dt);
}

function updateAI(dt) {
  const ai = state.players[1], human = state.players[0]; state.aiMoveTimer -= dt; state.aiTimer -= dt;
  if (state.aiMoveTimer <= 0) {
    const incoming = state.shots.some(shot => shot.owner === 0 && Math.hypot(shot.x - ai.x, shot.y - ai.y) < 170);
    const chargeNode = state.chargeNodes.filter(node => node.owner === 1 && node.active).sort((a, b) => Math.hypot(a.x - ai.x, a.y - ai.y) - Math.hypot(b.x - ai.x, b.y - ai.y))[0];
    if (ai.charges < 2 && chargeNode) movePlayer(1, chargeNode.x, chargeNode.y);
    else {
      const targetX = incoming ? ai.x + (Math.random() > .5 ? 120 : -120) : human.x + (Math.random() - .5) * 150;
      const targetY = incoming ? ai.y - 65 : 120 + Math.random() * 250;
      movePlayer(1, targetX, targetY);
    }
    state.aiMoveTimer = incoming ? .35 : .75 + Math.random() * .45;
  }
  if (state.aiTimer <= 0 && ai.orbReady && ai.charges > 0 && !hasShot(1)) {
    const lead = Math.min(.32, Math.hypot(human.targetX - human.x, human.targetY - human.y) / 900);
    launchPlanet(1, { x: human.x + (human.targetX - human.x) * lead, y: human.y + (human.targetY - human.y) * lead }, 240 + Math.random() * 180);
    state.aiTimer = 1.1 + Math.random() * .6;
  }
}

function spawnPickup() {
  const top = Math.random() > .5, x = 60 + Math.random() * (W - 120), y = top ? 75 + Math.random() * (MID - 105) : MID + 30 + Math.random() * (MID - 105);
  const ward = Math.max(...state.players.map(p => statsFor(p).wardChance)); const roll = Math.random();
  const type = roll < .15 + ward ? 'ward' : roll < .48 ? 'boost' : 'power';
  const look = type === 'ward' ? ['#eeede8', '◇'] : type === 'boost' ? ['#159ff2', '＋'] : ['#ff382f', '✦'];
  state.pickups.push({ x, y, radius: 10, type, color: look[0], symbol: look[1], phase: Math.random() * 6.28, age: 0 }); sound('spawn', 0);
}

function collectObject(player, object, index) {
  if (object.type === 'ward') player.armor = Math.min(3, player.armor + 1);
  else if (object.type === 'boost') player.bonusSpeed += 80 + statsFor(player).pickupSpeed;
  else player.bonusPower += 2 + statsFor(player).pickupPower;
  state.pickups.splice(index, 1); burst(player.x, player.y, player.index ? '#ff382f' : '#159ff2', 14); sound('pickup', player.index); vibrate(9);
}

function finishRound(winner) {
  state.running = false; state.matchScore[winner]++;
  const defeated = 1 - winner;
  const matchEnd = state.matchScore[winner] >= 2;
  const title = document.querySelector('#curtain-title');
  title.textContent = 'Раунд завершен!'; title.classList.toggle('defeated-red', defeated === 1); title.classList.toggle('defeated-blue', defeated === 0);
  const nextLabel = document.querySelector('#curtain-continue');
  nextLabel.innerHTML = matchEnd ? 'Перепланетирование<span></span>' : `Раунд ${state.matchScore[0] + state.matchScore[1] + 1}<span></span>`;
  const curtain = document.querySelector('#curtain'), resultPhase = matchEnd ? 'between' : 'round-result';
  curtain.classList.add('hidden'); state.phase = resultPhase;
  if (matchEnd) { state.matchWinner = winner; state.campaignWins[winner]++; updateCampaign(); }
  clearTimeout(state.continueTimer); state.continueTimer = window.setTimeout(() => {
    if (state.phase !== resultPhase) { state.continueTimer = 0; return; }
    curtain.classList.remove('hidden'); state.continueTimer = window.setTimeout(continueFromCurtain, 2400);
  }, 160);
}

function continueFromCurtain() {
  clearTimeout(state.continueTimer); state.continueTimer = 0;
  if (state.phase === 'between') startRewardPhase();
  else if (state.phase === 'round-result') startRound();
}

function pulseArena(className, damagedPlayer = null) {
  arenaWrap.classList.remove('impact', 'shot-fired', 'shot-clash', 'damage-blue', 'damage-red');
  void arenaWrap.offsetWidth;
  arenaWrap.classList.add(className);
  if (damagedPlayer !== null) arenaWrap.classList.add(damagedPlayer ? 'damage-red' : 'damage-blue');
  window.setTimeout(() => arenaWrap.classList.remove(className, 'damage-blue', 'damage-red'), className === 'impact' ? 420 : 260);
}

function startRewardPhase() {
  if (state.campaignWins[state.matchWinner] >= 5) { showEnding(state.matchWinner); return; }
  showUpgradePhase(false);
}

function showUpgradePhase(initial = false) {
  state.upgradeChoices = [null, null];
  state.upgradeOffers = state.players.map((player, index) => offerFor(player, index === state.matchWinner));
  switchScreen('upgrade');
  const upgradeTitle = document.querySelector('#upgrade-title');
  upgradeTitle.textContent = initial ? 'СТАРТОВЫЙ ВЫБОР' : 'ВЫБОР УЛУЧШЕНИЯ';
  upgradeTitle.classList.toggle('start-choice-title', initial);
  [0, 1].forEach(index => {
    const side = index ? 'two' : 'one';
    const canImproveOwned = index === state.matchWinner && state.upgradeOffers[index].some(card => state.players[index].cards[card.id]);
  document.querySelector(`#upgrade-name-${side}`).textContent = index ? ballSkins[state.players[index].skin].redName : `${ballSkins[state.players[index].skin].name} (твоя планета)`;
    document.querySelector(`#upgrade-role-${side}`).textContent = initial ? '' : canImproveOwned ? 'УЛУЧШЕНИЕ' : 'НОВАЯ СИЛА';
    renderOffers(index);
  });
  const aiSide = document.querySelector('#upgrade-side-two');
  aiSide.classList.toggle('opponent-view', state.mode === 'ai');
  aiSide.classList.toggle('ai-thinking', state.mode === 'ai');
  if (state.mode === 'ai') {
    document.querySelector('#upgrade-role-two').textContent = 'ВЫБИРАЕТ';
    window.setTimeout(() => {
      if (state.phase === 'upgrade' && state.upgradeChoices[1] === null) chooseUpgrade(1, chooseAIOffer());
    }, 420);
  }
}

function chooseAIOffer() {
  const player = state.players[1], stats = statsFor(player);
  const preference = { armor: stats.armor ? .8 : 2.6, satellites: stats.satellites ? 1 : 2.1, shotSpeed: 1.8, shotSize: 1.5, phase: 1.5, cooldown: 1.7, moveSpeed: 1.6, smallBody: stats.smallBody ? .8 : 2.2, split: stats.split ? 1.6 : 2, clashBlast: 1.8, chillAura: 1.7, reflect: stats.armor ? 2 : .8, orbitSpeed: 1.3, orbitRadius: 1.3, echoSpeed: 1.4, bounceSpeed: 1.5, lastLight: 1.2, chargeMax: 1.5, homing: 1.4, pierce: 1.3, bounce: 1.1 };
  const index = state.upgradeOffers[1].map((card, offerIndex) => ({ offerIndex, value: (preference[card.stat] ?? 1) + Math.random() * .3 - (player.cards[card.id] || 0) * .08 })).sort((a, b) => b.value - a.value)[0]?.offerIndex ?? 0;
  return state.upgradeOffers[1][index]?.id;
}

function offerFor(player, winner) {
  const owned = Object.keys(player.cards).map(id => relics.find(card => card.id === id)).filter(Boolean);
  const available = relics.filter(card => !card.requires || player.cards[card.requires] > 0);
  let choices = winner ? owned.filter(card => player.cards[card.id] < (card.maxLevel || 3) && available.includes(card)) : available.filter(card => !player.cards[card.id]);
  if (!choices.length) choices = available.filter(card => !player.cards[card.id]);
  if (!choices.length) choices = owned.filter(card => player.cards[card.id] < (card.maxLevel || 3) && available.includes(card));
  const featured = shuffle(choices.filter(card => signatureRelics.has(card.id)));
  if (featured.length) return [featured[0], ...shuffle(choices.filter(card => card.id !== featured[0].id)).slice(0, 2)];
  return shuffle(choices).slice(0, 3);
}

function relicIcon(stat) {
  const shapes = {
    moveSpeed: '<path d="M7 31c8-14 15-14 22-21M8 18v13h13"/><path d="M21 36l18-18"/>',
    shotSpeed: '<path d="M5 13h15M5 23h24M5 33h15"/><path d="M31 13l10 10-10 10"/>',
    planetSize: '<circle cx="24" cy="24" r="15"/><circle cx="18" cy="17" r="3"/>',
    shotSize: '<circle cx="24" cy="24" r="17"/><circle cx="18" cy="18" r="4"/>',
    smallBody: '<circle cx="24" cy="24" r="9"/><path d="M7 24h9M32 24h9M11 19l-5 5 5 5M37 19l5 5-5 5"/>',
    clashBlast: '<circle cx="24" cy="24" r="7"/><path d="M24 3v12M24 33v12M3 24h12M33 24h12M9 9l9 9M30 30l9 9M39 9l-9 9M18 30l-9 9"/>',
    phase: '<circle cx="24" cy="24" r="15" stroke-dasharray="7 5"/><path d="M6 24h13m10 0h13M16 18l6 6-6 6M32 18l-6 6 6 6"/>',
    chillAura: '<circle cx="24" cy="24" r="7"/><circle cx="24" cy="24" r="15" stroke-dasharray="2 4"/><path d="M24 2v7M24 39v7M2 24h7M39 24h7"/>',
    cooldown: '<path d="M37 20a14 14 0 1 0 1 8"/><path d="M32 12h8v8M24 15v10l7 4"/>',
    bounce: '<path d="M8 10h13v13H8zM27 27h13v13H27z"/><path d="M21 16h8v15"/>',
    satellites: '<circle cx="24" cy="24" r="8"/><circle cx="9" cy="24" r="3"/><circle cx="39" cy="24" r="3"/><ellipse cx="24" cy="24" rx="19" ry="11"/>',
    armor: '<path d="M24 5l15 6v11c0 10-7 17-15 21C16 39 9 32 9 22V11z"/><path d="M17 24l5 5 10-11"/>',
    spawnRate: '<path d="M24 4l5 13 14 1-11 9 4 14-12-8-12 8 4-14-11-9 14-1z"/>',
    magnet: '<path d="M12 8v16a12 12 0 0 0 24 0V8"/><path d="M12 8h8v13h-8zM28 8h8v13h-8z"/>',
    chargeMax: '<path d="M27 4L12 26h11l-2 18 15-24H25z"/>',
    wardChance: '<path d="M24 5l15 6v11c0 10-7 17-15 21C16 39 9 32 9 22V11z"/><circle cx="24" cy="23" r="5"/>',
    pickupSpeed: '<path d="M8 12h17M8 24h27M8 36h17"/><path d="M28 10l8 14-8 14"/>',
    pierce: '<path d="M24 5l8 27-8-5-8 5z"/><path d="M24 32v11"/>',
    homing: '<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="8"/><circle cx="24" cy="24" r="2"/>',
    split: '<path d="M24 40V25M24 25L11 10M24 25L37 10"/><circle cx="11" cy="10" r="3"/><circle cx="37" cy="10" r="3"/>',
    echo: '<circle cx="24" cy="24" r="5"/><path d="M24 7a17 17 0 0 1 0 34M24 13a11 11 0 0 1 0 22"/>',
    impact: '<path d="M24 4v13M24 31v13M4 24h13M31 24h13M10 10l9 9M29 29l9 9M38 10l-9 9M19 29l-9 9"/>',
    bounceSpeed: '<ellipse cx="24" cy="24" rx="19" ry="8"/><circle cx="24" cy="24" r="5"/><path d="M9 18l-4 6 4 6M39 18l4 6-4 6"/>',
    satelliteSize: '<circle cx="24" cy="24" r="5"/><circle cx="24" cy="24" r="13"/><circle cx="24" cy="7" r="4"/><circle cx="39" cy="33" r="4"/>',
    lastLight: '<circle cx="24" cy="24" r="8"/><path d="M24 3v8M24 37v8M3 24h8M37 24h8M9 9l6 6M33 33l6 6M39 9l-6 6M15 33l-6 6"/>',
    crown: '<path d="M5 14l10 9 9-15 9 15 10-9-4 25H9z"/><path d="M10 33h28"/>'
  };
  const aliases = { dash: 'moveSpeed', cometTrail: 'echo', heavy: 'planetSize', echoSpeed: 'echo', orbitSpeed: 'satellites', reflect: 'armor', nodeMagnet: 'magnet', orbitRadius: 'satelliteSize', orbitRange: 'bounce' };
  return `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shapes[stat] || shapes[aliases[stat]] || shapes.spawnRate}</svg>`;
}

function renderOffers(index) {
  const side = index ? 'two' : 'one', player = state.players[index], root = document.querySelector(`#card-offers-${side}`);
  root.innerHTML = '';
  state.upgradeOffers[index].forEach((card, offerIndex) => {
    const level = player.cards[card.id] || 0, button = document.createElement('button');
    button.className = `relic-card ${level ? '' : 'new-relic-card'} ${signatureRelics.has(card.id) ? 'signature-relic' : ''}`; button.type = 'button'; button.dataset.card = card.id;
    button.disabled = state.mode === 'ai' && index === 1;
    button.style.setProperty('--offer-index', offerIndex);
    button.innerHTML = `<span class="relic-icon">${relicIcon(card.stat)}</span><strong>${card.name}</strong><p>${card.text}</p>${level ? `<small class="card-status card-level"><span>УЛУЧШЕНИЕ УРОВНЯ</span><b>${level} → ${level + 1}</b></small>` : '<small class="card-status new-relic">НОВАЯ РЕЛИКВИЯ</small>'}`;
    button.addEventListener('click', () => chooseUpgrade(index, card.id)); root.append(button);
  });
}

function chooseUpgrade(playerIndex, cardId) {
  if (state.phase !== 'upgrade' || state.upgradeChoices[playerIndex] !== null) return;
  const card = state.upgradeOffers[playerIndex].find(item => item.id === cardId), player = state.players[playerIndex];
  if (!card) return;
  player.cards[card.id] = Math.min(card.maxLevel || 3, (player.cards[card.id] || 0) + 1); state.upgradeChoices[playerIndex] = cardId;
  const side = playerIndex ? 'two' : 'one', root = document.querySelector(`#card-offers-${side}`);
  if (playerIndex === 1) document.querySelector('#upgrade-side-two').classList.remove('ai-thinking');
  document.querySelector(`#upgrade-role-${side}`).textContent = '';
  root.querySelectorAll('.relic-card').forEach(button => { button.disabled = true; button.classList.toggle('selected', button.dataset.card === cardId); });
  const selectedCard = root.querySelector(`[data-card="${cardId}"]`);
  selectedCard.querySelector('.card-status').textContent = 'ВЫБРАНО';
  selectedCard.querySelector('.card-status').classList.remove('new-relic', 'card-level');
  selectedCard.querySelector('.card-status').classList.add('chosen-relic');
  selectedCard.classList.remove('new-relic-card', 'signature-relic');
  if (state.upgradeChoices.every(Boolean)) window.setTimeout(startDuel, 300);
}

function showEnding(winner) {
  const p1 = winner === 0, ending = document.querySelector('#ending');
  ending.classList.remove('defeat'); void ending.offsetWidth; ending.classList.toggle('defeat', !p1);
  document.querySelector('#ending-title').textContent = p1 ? 'КОРОНА ТВОЯ' : 'ВАША ПЛАНЕТА УНИЧТОЖЕНА';
  switchScreen('ending'); if (p1 && window.PLAIR?.score) window.PLAIR.score(5);
}

function updateReadout() {
  if (!state.players.length) return;
  state.players.forEach((player, i) => {
    const side = i ? 'two' : 'one';
    const marks = `${'● '.repeat(player.hp)}${'◇ '.repeat(player.armor)}`.trim() || '○';
    const s = statsFor(player), chargeMarks = Array.from({ length: s.chargeMax }, (_, n) => n < player.charges ? '●' : '○').join('');
    document.querySelector(`#health-${side}`).textContent = marks;
    document.querySelector(`#charge-${side}`).textContent = chargeMarks;
  });
}

function resizeCanvas() {
  if (!canvas || screens.battle.classList.contains('hidden')) return;
  const rect = canvas.getBoundingClientRect(), nextLandscape = rect.width > rect.height;
  if (nextLandscape !== landscapeWorld) {
    const oldW = W, oldH = H; landscapeWorld = nextLandscape; W = landscapeWorld ? 760 : 640; H = landscapeWorld ? 720 : 900; MID = H / 2;
    const sx = W / oldW, sy = H / oldH;
    const scalePoint = point => { if (point) { point.x *= sx; point.y *= sy; } };
    state.players.forEach(p => { scalePoint(p); scalePoint({ get x(){return p.targetX}, set x(v){p.targetX=v}, get y(){return p.targetY}, set y(v){p.targetY=v} }); });
    state.shots.forEach(s => { scalePoint(s); s.vx *= sx; s.vy *= sy; s.trail.forEach(scalePoint); });
    state.pendingShots.forEach(s => { scalePoint(s.from); scalePoint(s.target); }); state.chargeNodes.forEach(scalePoint); state.pickups.forEach(scalePoint); state.particles.forEach(p => { scalePoint(p); p.vx *= sx; p.vy *= sy; });
    state.gestures.forEach(g => { scalePoint({ get x(){return g.x}, set x(v){g.x=v}, get y(){return g.y}, set y(v){g.y=v} }); scalePoint({ get x(){return g.startX}, set x(v){g.startX=v}, get y(){return g.startY}, set y(v){g.startY=v} }); });
    state.ambient = Array.from({ length: 70 }, (_, i) => ({ x: (i * 157 + 37) % W, y: (i * 113 + 53) % H, size: i % 7 === 0 ? 2 : 1, phase: i * .7 }));
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr); ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0); drawArena();
}

function drawArena() {
  if (!canvas.width) return;
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0); ctx.fillStyle = '#06070b'; ctx.fillRect(0, 0, W, H);
  const now = performance.now(), time = now * .001;
  ctx.fillStyle = '#159ff20a'; ctx.fillRect(0, MID, W, H - MID); ctx.fillStyle = '#ff382f09'; ctx.fillRect(0, 0, W, MID);
  state.ambient.forEach(star => { ctx.globalAlpha = .12 + (Math.sin(time + star.phase) + 1) * .1; ctx.fillStyle = '#dce1ec'; ctx.fillRect(star.x, star.y, star.size, star.size); }); ctx.globalAlpha = 1;
  ctx.strokeStyle = '#d7d8dc24'; ctx.lineWidth = 1;
  ctx.strokeRect(24, 30, W - 48, H - 60); ctx.beginPath(); ctx.moveTo(24, MID); ctx.lineTo(W - 24, MID); ctx.stroke();
  drawMatchMarker();
  drawChargeNodes(time); drawPickups(time); drawPendingShots(now); drawShots(); drawShotImpacts(); drawTapMarks(); state.players.forEach(player => drawPlayer(player, now)); drawGestureLines(); drawParticles();
}

function drawMatchMarker() {
  const x = W / 2, y = MID, radius = Math.min(31, W * .055);
  ctx.save();
  ctx.beginPath(); ctx.setLineDash([2, 5]); ctx.lineWidth = 1.5; ctx.strokeStyle = '#e7e4d755';
  ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);

  const drawRoundProgress = (wins, start, color) => {
    const progress = Math.min(1, wins / 2);
    if (!progress) return;
    ctx.beginPath(); ctx.lineCap = 'round'; ctx.lineWidth = 3.5; ctx.strokeStyle = color;
    ctx.arc(x, y, radius, start, start + Math.PI * progress); ctx.stroke();
  };
  drawRoundProgress(state.matchScore[0], 0, '#69caff');
  drawRoundProgress(state.matchScore[1], Math.PI, '#ff7770');

  const drawWins = (wins, py, color) => {
    const spacing = 8, start = x - spacing * 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.arc(start + i * spacing, py, 1.8, 0, Math.PI * 2);
      ctx.globalAlpha = i < wins ? .95 : .22; ctx.fillStyle = color; ctx.fill();
    }
  };
  drawWins(state.campaignWins[0], y - radius - 8, '#69caff');
  drawWins(state.campaignWins[1], y + radius + 8, '#ff7770');
  ctx.globalAlpha = 1; ctx.restore();
}

function drawPlayer(player, now) {
  const color = player.index ? '#ff382f' : '#159ff2';
  const auraStrength = statsFor(player).chillAura;
  if (auraStrength) {
    ctx.save(); ctx.globalAlpha = .12 + Math.sin(now * .002) * .025; ctx.strokeStyle = color; ctx.lineWidth = 1 + Math.min(2, auraStrength * .4); ctx.setLineDash([3, 7]);
    ctx.beginPath(); ctx.arc(player.x, player.y, 150, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  }
  player.satellites.forEach((alive, i) => {
    if (!alive) return;
    const angle = now * .001 * (1 + statsFor(player).orbitSpeed * .6) + i * Math.PI * 2 / Math.max(1, player.satellites.length), orbit = 31 + statsFor(player).orbitRadius, x = player.x + Math.cos(angle) * orbit, y = player.y + Math.sin(angle) * orbit;
    ctx.fillStyle = '#f0efe9'; ctx.beginPath(); ctx.arc(x, y, 5 + statsFor(player).satelliteSize, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 2.1, 0, Math.PI * 2); ctx.fill();
  });
  const radius = playerRadius(player);
  const skin = ballSkins[player.skin] || ballSkins[0];
  ctx.globalAlpha = player.orbReady ? 1 : .25;
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(player.x, player.y, radius, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(player.x, player.y, radius, 0, Math.PI * 2); ctx.clip(); ctx.strokeStyle = skin.detail; ctx.fillStyle = skin.detail; ctx.lineWidth = Math.max(1.5, radius * .1);
  if (skin.mark === 'crater') {
    [[-.28, -.2, .22], [.27, .23, .15], [-.04, .4, .09]].forEach(([x, y, size]) => { ctx.beginPath(); ctx.arc(player.x + radius * x, player.y + radius * y, radius * size, 0, Math.PI * 2); ctx.globalAlpha = .38; ctx.fill(); ctx.globalAlpha = .9; ctx.stroke(); });
  }
  if (skin.mark === 'facet') {
    ctx.beginPath(); ctx.arc(player.x, player.y, radius * .67, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(player.x - radius * .65, player.y - radius * .12); ctx.lineTo(player.x + radius * .05, player.y - radius * .58); ctx.lineTo(player.x + radius * .55, player.y + radius * .16); ctx.lineTo(player.x - radius * .05, player.y + radius * .58); ctx.closePath(); ctx.stroke();
  }
  if (skin.mark === 'leaf') {
    ctx.lineWidth = Math.max(1.8, radius * .13); ctx.beginPath(); ctx.moveTo(player.x - radius * .48, player.y + radius * .48); ctx.quadraticCurveTo(player.x, player.y, player.x + radius * .48, player.y - radius * .48); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(player.x - radius * .15, player.y - radius * .04, radius * .29, radius * .13, -.65, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(player.x + radius * .18, player.y + radius * .17, radius * .27, radius * .12, -.65, 0, Math.PI * 2); ctx.stroke();
  }
  if (skin.mark === 'ring') { ctx.beginPath(); ctx.arc(player.x, player.y, radius * .58, 0, Math.PI * 2); ctx.stroke(); }
  if (skin.mark === 'stripe') { ctx.translate(player.x, player.y); ctx.rotate(-.65); ctx.fillRect(-radius * 1.5, -radius * .18, radius * 3, radius * .36); }
  if (skin.mark === 'spot' || skin.mark === 'spots') { ctx.beginPath(); ctx.arc(player.x + radius * .24, player.y + radius * .15, radius * .22, 0, Math.PI * 2); ctx.fill(); if (skin.mark === 'spots') { ctx.beginPath(); ctx.arc(player.x - radius * .3, player.y - radius * .22, radius * .12, 0, Math.PI * 2); ctx.fill(); } }
  if (skin.mark === 'comet') {
    ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(-.7); ctx.fillRect(-radius * .9, -radius * .12, radius * 1.45, radius * .24); ctx.globalAlpha = .62; ctx.fillRect(-radius * .78, radius * .25, radius * 1.05, radius * .1); ctx.restore();
    ctx.beginPath(); ctx.arc(player.x + radius * .28, player.y - radius * .2, radius * .18, 0, Math.PI * 2); ctx.fill();
  }
  if (skin.mark === 'pulse') {
    [.34, .64].forEach(scale => { ctx.beginPath(); ctx.arc(player.x, player.y, radius * scale, 0, Math.PI * 2); ctx.stroke(); });
    ctx.beginPath(); ctx.arc(player.x, player.y, radius * .13, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(player.x - radius * .3, player.y - radius * .33, Math.max(3, radius * .15), 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(player.x, player.y, radius + 2, 0, Math.PI * 2); ctx.stroke();
  if (player.armor > 0) { ctx.strokeStyle = '#f0efe9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(player.x, player.y, radius + 8, 0, Math.PI * 2); ctx.stroke(); }
  if (player.hitFlash > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, player.hitFlash * 3); ctx.strokeStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 24 * player.hitFlash; ctx.lineWidth = 2 + player.hitFlash * 12; ctx.beginPath(); ctx.arc(player.x, player.y, radius + 11, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  const cap = statsFor(player).chargeMax;
  for (let i = 0; i < cap; i++) {
    const x = player.x + (i - (cap - 1) / 2) * 8, y = player.y + radius + 12;
    ctx.fillStyle = i < player.charges ? '#ffe18a' : '#ffe18a40'; ctx.beginPath(); ctx.arc(x, y, 2.3, 0, Math.PI * 2); ctx.fill();
  }
}

function drawChargeNodes(time) {
  state.chargeNodes.forEach(node => {
    const pulse = Math.sin(time * 4 + node.phase) * 2;
    ctx.globalAlpha = node.active ? .95 : .18;
    ctx.strokeStyle = '#ffe18a'; ctx.lineWidth = node.active ? 1.6 : 1;
    ctx.beginPath(); ctx.arc(node.x, node.y, node.radius + pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.translate(node.x, node.y); ctx.rotate(Math.PI / 4 + time * .25);
    ctx.fillStyle = node.active ? '#ffe18a' : '#ffe18a55'; ctx.fillRect(-4, -4, 8, 8); ctx.restore();
    if (!node.active) { ctx.strokeStyle = '#ffe18a55'; ctx.beginPath(); ctx.arc(node.x, node.y, node.radius + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - node.respawn / 3.7)); ctx.stroke(); }
    ctx.globalAlpha = 1;
  });
}

function drawPendingShots(now) {
  state.pendingShots.forEach(pending => {
    const color = pending.owner ? '#ff5b54' : '#53bdff', progress = 1 - pending.timer / .42;
    ctx.globalAlpha = .28 + progress * .55; ctx.strokeStyle = color; ctx.lineWidth = 1.5 + progress * 2;
    ctx.setLineDash([4, 7]); ctx.beginPath(); ctx.moveTo(pending.from.x, pending.from.y); ctx.lineTo(pending.target.x, pending.target.y); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(pending.target.x, pending.target.y, 8 + Math.sin(now * .025) * 2, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(pending.from.x, pending.from.y, 24 + progress * 8, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  });
}

function drawPickups(time) {
  state.pickups.forEach(object => {
    const pulse = Math.sin(time * 4 + object.phase) * 2; ctx.save(); ctx.translate(object.x, object.y); ctx.rotate(time * .5 + object.phase);
    ctx.strokeStyle = object.color; ctx.lineWidth = 1.6; ctx.strokeRect(-object.radius - pulse, -object.radius - pulse, (object.radius + pulse) * 2, (object.radius + pulse) * 2);
    ctx.fillStyle = object.color; ctx.font = '15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(object.symbol, 0, 0); ctx.restore();
  });
}

function drawShots() {
  state.shots.forEach(shot => {
    const color = shot.owner ? '#bd533d' : '#4d9ab0';
    if (shot.trail.length > 1) {
      const first = shot.trail[0], tail = ctx.createLinearGradient(first.x, first.y, shot.x, shot.y);
      tail.addColorStop(0, '#ffffff00'); tail.addColorStop(.45, `${color}40`); tail.addColorStop(1, `${color}e8`);
      ctx.save(); ctx.beginPath(); ctx.moveTo(first.x, first.y); shot.trail.forEach(point => ctx.lineTo(point.x, point.y)); ctx.lineTo(shot.x, shot.y);
      ctx.strokeStyle = tail; ctx.lineWidth = Math.max(2, shot.radius * .48); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = color; ctx.shadowBlur = shot.echo ? 5 : 9; ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f3f3ef'; ctx.beginPath(); ctx.arc(shot.x - shot.radius * .25, shot.y - shot.radius * .27, Math.max(3, shot.radius * .14), 0, Math.PI * 2); ctx.fill();
  });
}

function drawGestureLines() {
  if (state.mobileAim.strength > .08 && state.players[0]) {
    const player = state.players[0], target = mobileAimTarget();
    ctx.globalAlpha = Math.min(.82, .28 + state.mobileAim.strength * .5); ctx.strokeStyle = '#53bdff'; ctx.lineWidth = 1.7; ctx.setLineDash([5, 7]);
    ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(target.x, target.y); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(target.x, target.y, 8 + state.mobileAim.strength * 7, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  }
  state.gestures.forEach(gesture => {
    if (!gesture.crossed) return;
    const player = state.players[gesture.owner], distance = Math.hypot(gesture.x - gesture.startX, gesture.y - gesture.startY), alpha = Math.min(.85, distance / 360);
    ctx.globalAlpha = alpha; ctx.strokeStyle = gesture.owner ? '#ff5b54' : '#53bdff'; ctx.lineWidth = 1.5 + alpha * 2; ctx.setLineDash([5, 7]);
    ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(gesture.x, gesture.y); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(gesture.x, gesture.y, 8 + alpha * 7, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#f3f3ef'; ctx.beginPath(); ctx.arc(gesture.x, gesture.y, 3 + alpha * 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  });
}

function drawTapMarks() {
  state.tapMarks.forEach(mark => {
    const alpha = Math.max(0, mark.life / mark.max), radius = 8 + (1 - alpha) * 24, color = mark.owner ? '#ff796f' : '#80d8ff';
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(mark.x, mark.y, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(mark.x, mark.y, 2.5 + alpha * 1.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });
}

function mobileAimTarget() {
  const player = state.players[0], aim = state.mobileAim;
  return { x: Math.max(44, Math.min(W - 44, player.x + aim.x * W * .42)), y: Math.max(48, Math.min(MID - 42, H * .46 + aim.y * H * .3)) };
}

function burst(x, y, color, count) { for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2, speed = 30 + Math.random() * 200; state.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: .2 + Math.random() * .35, max: .55, color, size: 1 + Math.random() * 3 }); } }
function vanishShot(shot, x, y) {
  const color = shot.owner ? '#bd533d' : '#4d9ab0';
  state.shotImpacts.push({ x, y, angle: Math.atan2(shot.vy, shot.vx), life: .32, max: .32, vanish: true, radius: shot.radius, color });
  burst(x, y, color, 10); burst(x, y, '#ece8dd', 5);
}
function updateShotImpacts(dt) { for (let i = state.shotImpacts.length - 1; i >= 0; i--) { state.shotImpacts[i].life -= dt; if (state.shotImpacts[i].life <= 0) state.shotImpacts.splice(i, 1); } }
function drawShotImpacts() {
  state.shotImpacts.forEach(impact => {
    const alpha = Math.max(0, impact.life / impact.max), stretch = 10 + (1 - alpha) * 28;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha;
    if (impact.vanish) {
      ctx.shadowColor = impact.color; ctx.shadowBlur = 18 * alpha; ctx.fillStyle = impact.color;
      ctx.beginPath(); ctx.arc(impact.x, impact.y, impact.radius * (.18 + .82 * alpha), 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.strokeStyle = '#ece8dd'; ctx.lineWidth = 1.5 * alpha;
      ctx.beginPath(); ctx.arc(impact.x, impact.y, impact.radius * (1.35 - .55 * alpha), 0, Math.PI * 2); ctx.stroke();
    }
    if (impact.explosion) {
      const progress = 1 - alpha, radius = 10 + impact.blastRadius * progress;
      ctx.shadowColor = '#fff'; ctx.shadowBlur = 22 * alpha; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3 * alpha + 1;
      ctx.beginPath(); ctx.arc(impact.x, impact.y, radius, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(235,249,255,${alpha * .25})`; ctx.beginPath(); ctx.arc(impact.x, impact.y, radius * .72, 0, Math.PI * 2); ctx.fill();
    }
    ctx.translate(impact.x, impact.y); ctx.rotate(impact.angle);
    ctx.shadowColor = '#fff'; ctx.shadowBlur = 20 * alpha; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineWidth = 2.5 + alpha * 2;
    ctx.beginPath(); ctx.moveTo(-stretch, 0); ctx.lineTo(stretch, 0); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 2 + alpha * 5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });
}
function drawParticles() { state.particles.forEach(p => { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size); }); ctx.globalAlpha = 1; }
function updateParticles(dt) { for (let i = state.particles.length - 1; i >= 0; i--) { const p = state.particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .96; p.vy *= .96; p.life -= dt; if (p.life <= 0) state.particles.splice(i, 1); } }

let audio;
function sound(kind, index = 0) {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume();
    const osc = audio.createOscillator(), gain = audio.createGain(), now = audio.currentTime;
    const tones = { throw: [index ? 145 : 235, .13, 'sawtooth'], hit: [72, .23, 'sawtooth'], block: [390, .1, 'square'], pickup: [680, .1, 'sine'], spawn: [245, .04, 'sine'], return: [350, .06, 'triangle'], tick: [190, .035, 'sine'] };
    const [freq, duration, type] = tones[kind] || tones.tick; osc.type = type; osc.frequency.setValueAtTime(freq, now);
    if (kind === 'throw' || kind === 'hit') osc.frequency.exponentialRampToValueAtTime(Math.max(35, freq * .4), now + duration);
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(kind === 'hit' ? .12 : .045, now + .008); gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    osc.connect(gain); gain.connect(audio.destination); osc.start(now); osc.stop(now + duration + .02);
  } catch {}
}
function vibrate(ms) { if ('vibrate' in navigator) navigator.vibrate(ms); }
function shuffle(items) { return [...items].sort(() => Math.random() - .5); }

function eventPoint(event) { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) / rect.width * W, y: (event.clientY - rect.top) / rect.height * H }; }
canvas.addEventListener('pointerdown', event => {
  if (!state.running || state.roundIntro > 0) return;
  const point = eventPoint(event), owner = state.mode === 'pvp' ? (point.y < MID ? 1 : 0) : 0;
  if (state.mode === 'ai' && point.y < MID) return;
  event.preventDefault(); canvas.setPointerCapture(event.pointerId);
  const tapMark = { x: point.x, y: point.y, owner, life: .38, max: .38 }; state.tapMarks.push(tapMark);
  state.gestures.set(event.pointerId, { owner, startX: point.x, startY: point.y, x: point.x, y: point.y, crossed: false, tapMark });
});
canvas.addEventListener('pointermove', event => {
  const gesture = state.gestures.get(event.pointerId); if (!gesture) return;
  const point = eventPoint(event); gesture.x = point.x; gesture.y = point.y;
  gesture.tapMark.x = point.x; gesture.tapMark.y = point.y;
  gesture.tapMark.life = gesture.tapMark.max;
  if (!state.tapMarks.includes(gesture.tapMark)) state.tapMarks.push(gesture.tapMark);
  gesture.crossed = gesture.owner === 0 ? point.y < MID - 12 : point.y > MID + 12;
});
canvas.addEventListener('pointerup', event => {
  const gesture = state.gestures.get(event.pointerId); if (!gesture) return;
  const point = eventPoint(event); gesture.x = point.x; gesture.y = point.y; state.gestures.delete(event.pointerId); const owner = gesture.owner, enemySide = owner === 0 ? gesture.y < MID - 12 : gesture.y > MID + 12;
  gesture.tapMark.x = point.x; gesture.tapMark.y = point.y; gesture.tapMark.life = gesture.tapMark.max;
  if (!state.tapMarks.includes(gesture.tapMark)) state.tapMarks.push(gesture.tapMark);
  const drag = Math.hypot(gesture.x - gesture.startX, gesture.y - gesture.startY);
  if (enemySide && drag > 50) launchPlanet(owner, { x: gesture.x, y: gesture.y }, drag);
  else if (owner === 0 ? gesture.y >= MID : gesture.y < MID) movePlayer(owner, gesture.x, gesture.y);
});
canvas.addEventListener('pointercancel', event => state.gestures.delete(event.pointerId));
canvas.addEventListener('lostpointercapture', event => state.gestures.delete(event.pointerId));

const logo = document.querySelector('.menu-screen h1');
logo.setAttribute('aria-label', logo.textContent.trim());
logo.innerHTML = [...logo.textContent.trim()].map((letter, index) => `<span class="logo-letter ${letter === 'Λ' ? 'logo-mark' : ''}" style="--letter-index:${index}">${letter}</span>`).join('');

document.addEventListener('pointerdown', event => event.target.closest('button')?.classList.add('pressing'));
const releaseButtons = () => document.querySelectorAll('.pressing').forEach(button => button.classList.remove('pressing'));
document.addEventListener('pointerup', releaseButtons); document.addEventListener('pointercancel', releaseButtons);
document.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  button.classList.remove('button-flash'); void button.offsetWidth; button.classList.add('button-flash');
  window.setTimeout(() => button.classList.remove('button-flash'), 420);
});

document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => newGame(button.dataset.mode)));
const curtain = document.querySelector('#curtain');
const exitConfirm = document.querySelector('#exit-confirm');
let exitConfirmOpener = null, exitWasRunning = false;
function openExitConfirm(event) { exitConfirmOpener = event.currentTarget; exitWasRunning = state.running; state.running = false; exitConfirm.classList.remove('hidden'); document.querySelector('#exit-stay').focus(); }
function closeExitConfirm() { exitConfirm.classList.add('hidden'); if (exitWasRunning) { state.running = true; state.lastTime = performance.now(); requestAnimationFrame(loop); } exitConfirmOpener?.focus(); }
document.querySelector('#back-to-menu').addEventListener('click', openExitConfirm);
document.querySelector('#exit-stay').addEventListener('click', closeExitConfirm);
document.querySelector('#exit-leave').addEventListener('click', () => { exitConfirm.classList.add('hidden'); state.running = false; showEnding(1); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !exitConfirm.classList.contains('hidden')) closeExitConfirm(); });
document.querySelector('#upgrade-menu').addEventListener('click', openExitConfirm);
document.querySelector('#play-again').addEventListener('click', () => newGame(state.mode));
document.querySelector('#skin-back').addEventListener('click', () => switchScreen('menu'));
document.querySelector('#skin-start').addEventListener('click', confirmSkinSelection);
document.querySelector('#ending-menu').addEventListener('click', () => switchScreen('menu'));
window.addEventListener('resize', resizeCanvas);

switchScreen('menu');
