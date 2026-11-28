import './style.css';

let W = 640;
let H = 900;
let MID = H / 2;
let landscapeWorld = false;
const canvas = document.querySelector('#arena');
const ctx = canvas.getContext('2d');
const arenaWrap = document.querySelector('#arena-wrap');
const firstRoundHint = document.querySelector('#first-round-hint');
const touchControls = document.querySelector('#touch-controls');
const screens = Object.fromEntries(['menu', 'skins', 'battle', 'upgrade', 'ending', 'roster', 'zoo'].map(id => [id, document.getElementById(id)]));
const ballSkins = [
  { name: 'Архэ', redName: 'Хаос', idea: 'ИСТОК МАТЕРИИ', redIdea: 'БЕЗОБРАЗНОЕ НАЧАЛО', bonus: 'swift', bonusText: 'Планета перемещается по полю на 25% быстрее', detail: '#d8d5c9', mark: 'crater' },
  { name: 'Апейрон', redName: 'Эреб', idea: 'БЕСКРАЙНИЙ МИР', redIdea: 'ПЕРВОЗДАННАЯ ТЬМА', bonus: 'extraLife', bonusText: 'Начинает партию с четырьмя защитными секциями', detail: '#dff8ff', mark: 'facet' },
  { name: 'Эйдос', redName: 'Морфе', idea: 'ЧИСТАЯ ФОРМА', redIdea: 'ОБРАЗ МИРА', bonus: 'firstRelic', bonusText: 'Первое улучшение сразу получает 3-й уровень', detail: '#f7f4e8', mark: 'stripe' },
  { name: 'Фюсис', redName: 'Гея', idea: 'СИЛА РОСТА', redIdea: 'ЖИВАЯ ЗЕМЛЯ', bonus: 'sourceChance', bonusText: 'Повышает шанс появления точки создания астероида на 25%', detail: '#d3ecd8', mark: 'leaf' },
  { name: 'Гелиос', redName: 'Фаэтон', idea: 'СОЛНЕЧНЫЙ ПОРЯДОК', redIdea: 'ПАДАЮЩИЙ ОГОНЬ', bonus: 'fastMoon', bonusText: 'Точки создания астероидов заряжаются в два раза быстрее', detail: '#f7f4e8', mark: 'spot' },
  { name: 'Селена', redName: 'Геката', idea: 'ЛУННЫЙ ЦИКЛ', redIdea: 'ТАЙНА НОЧИ', bonus: 'deflectMoon', bonusText: 'Каждые 8 отбиваний создают неразрушаемую луну', detail: '#edebf8', mark: 'spots' },
  { name: 'Кайрос', redName: 'Хронос', idea: 'МИГ ПЕРЕМЕНЫ', redIdea: 'НЕОБРАТИМОЕ ВРЕМЯ', bonus: 'asteroid', bonusText: 'Начинает раунд с двумя лунами-перехватчиками', detail: '#f7f4e8', mark: 'comet' },
  { name: 'Логос', redName: 'Ананке', idea: 'ПУЛЬС КОСМОСА', redIdea: 'НЕИЗБЕЖНЫЙ ПОРЯДОК', bonus: 'ricochet', bonusText: 'Астероиды ускоряются после отскока от стены', detail: '#efd9ff', mark: 'pulse' }
];

const BASE_MOVE_SPEED = 500;
const LIGHT_ORBIT_SPEED_RATE = .15;
const relics = [
  { id: 'swiftmove', branch: 'control', name: 'Горизонтальный разгон', text: 'Планета быстрее движется влево и вправо', stat: 'moveSpeedX', value: BASE_MOVE_SPEED * .15, maxLevel: 3 },
  { id: 'verticaldrive', branch: 'control', name: 'Вертикальный разгон', text: 'Планета быстрее движется вверх и вниз', stat: 'moveSpeedY', value: BASE_MOVE_SPEED * .15, maxLevel: 3 },
  { id: 'smallbody', branch: 'control', name: 'Лёгкая орбита', text: 'Уменьшает планету и увеличивает её общую скорость', stat: 'smallBody', value: 1, maxLevel: 2 },
  { id: 'chargerate', branch: 'control', name: 'Усиленное отбивание', text: 'Астероид после отбивания летит быстрее на 20%', stat: 'impact', value: .2, maxLevel: 3 },
  { id: 'resonance', branch: 'control', name: 'Массивное ядро', text: 'Немного увеличивает планету', stat: 'planetSize', value: 3, maxLevel: 3 },
  { id: 'massivebody', branch: 'control', name: 'Колоссальное ядро', text: 'Сильно увеличивает планету, но замедляет её', stat: 'planetSize', value: 10, maxLevel: 2, penalty: { stat: 'moveSpeed', value: -BASE_MOVE_SPEED * .15 } },
  { id: 'satellite', branch: 'control', name: 'Луна-хранитель', text: 'Добавляет луну, которая перехватывает астероиды', stat: 'satellites', value: 1, maxLevel: 2 },
  { id: 'moonmass', branch: 'control', name: 'Массивные луны', text: 'Увеличивает луны и радиус их перехвата', stat: 'satelliteSize', value: 2, maxLevel: 2, requires: 'satellite' },
  { id: 'moonreturn', branch: 'control', name: 'Возврат луны', text: 'Луны быстрее восстанавливаются после разрушения', stat: 'satelliteRegen', value: 1, maxLevel: 2, requires: 'satellite' },
  { id: 'twinmoon', branch: 'control', name: 'Лунная стража', text: 'Луны быстрее вращаются и ловят ещё один астероид', stat: 'orbitSpeed', value: .5, secondaryStat: 'satelliteIntercept', secondaryValue: 1, maxLevel: 2, requires: 'satellite' },
  { id: 'orbitglass', branch: 'control', name: 'Притяжение луны', text: 'Луны дальше от планеты и тянутся к астероидам', stat: 'orbitRadius', value: 12, secondaryStat: 'moonAttraction', secondaryValue: .22, maxLevel: 2, requires: 'satellite' },
  { id: 'bigshot', branch: 'attack', name: 'Тяжесть света', text: 'Увеличивает астероид и его урон по слоям защитных пластин', stat: 'shotSize', value: 5, maxLevel: 3 },
  { id: 'kineticdrive', branch: 'attack', name: 'Кинетический разгон', text: 'Астероиды быстрее вылетают при запуске', stat: 'launchRate', value: .05, maxLevel: 3 },
  { id: 'ricochet', branch: 'attack', name: 'Закон отражения', text: 'Каждый отскок от стен ускоряет астероид', stat: 'bounce', value: 2, maxLevel: 3 },
  { id: 'midgrowth', branch: 'attack', name: 'Убывающий астероид', text: 'Астероид постепенно уменьшается в полёте', stat: 'midGrowth', value: .25, maxLevel: 2 },
  { id: 'comet', branch: 'effects', name: 'Хвост кометы', text: 'На чужой стороне астероид оставляет замедляющий след', stat: 'cometTrail', value: 1, maxLevel: 3 },
  { id: 'coldfront', branch: 'effects', name: 'Гравитационный конус', text: 'Твоя планета создаёт замедляющий соперника гравиконус', stat: 'chillAura', value: 1, maxLevel: 3 },
  { id: 'clashblast', branch: 'effects', name: 'Сверхновая', text: 'Столкновение астероидов вызывает взрыв и оставляет зону замедления', stat: 'clashBlast', value: 1, maxLevel: 3 },
  { id: 'rearplates', branch: 'defense', name: 'Широкий заслон', text: 'Увеличивает длину защитных стенок', stat: 'barrierWidth', value: 20, maxLevel: 3 },
  { id: 'cornerguards', branch: 'defense', name: 'Краевая защита', text: 'Ставит два неразрушимых уголка по краям защиты', stat: 'cornerGuards', value: 1, maxLevel: 3 },
  { id: 'platelayers', branch: 'defense', name: 'Слоистый заслон', text: 'Даёт пластинам второй слой, но сужает их и замедляет восстановление', stat: 'plateLayers', value: 1, maxLevel: 2 },
  { id: 'ironcore', branch: 'defense', name: 'Железное ядро', text: 'Защитные стенки сильнее ускоряют отбитый астероид', stat: 'reflect', value: 1, maxLevel: 3 },
  { id: 'lastlight', branch: 'defense', name: 'Последний свет', text: 'Чем меньше пластин, тем сильнее твоё отражение астероида', stat: 'lastLight', value: .25, maxLevel: 3 },
  { id: 'shieldslow', branch: 'defense', name: 'Тормозящий заслон', text: 'Защитная пластина замедляет отбитый астероид', stat: 'shieldSlow', value: .15, maxLevel: 3 },
  { id: 'wallcounter', branch: 'attack', name: 'Ответный ремонт', text: 'Попадание в заслон соперника восстанавливает слой твоей защиты', stat: 'wallCounter', value: 1, maxLevel: 3 },
  { id: 'sourcerepair', branch: 'defense', name: 'Живой заслон', text: 'Создание астероида восстанавливает слой защиты', stat: 'sourceRepair', value: 1, maxLevel: 3 },
  { id: 'blockpoints', branch: 'defense', name: 'Точки перехвата', text: 'Открывает генераторы точек перехвата. Подлети к точке для зарядки', stat: 'blockNodeChance', value: .2, maxLevel: 3 },
  { id: 'blocksize', branch: 'defense', name: 'Укреплённые точки', text: 'Увеличивает размер защитных точек перехвата', stat: 'blockNodeSize', value: 1, maxLevel: 3, requires: 'blockpoints' },
  { id: 'guardtrail', branch: 'defense', name: 'След хранителя', text: 'След от движения отбивает астероид и ненадолго гаснет', stat: 'guardTrail', value: 1, maxLevel: 3 },
  { id: 'deflectgrowth', branch: 'defense', name: 'Приливная броня', text: 'Отбивания ненадолго увеличивают планету. Рост складывается', stat: 'deflectGrowth', value: 5, maxLevel: 3 },
  { id: 'nodeexpansion', branch: 'spawn', name: 'Частые источники', text: 'Точки создания астероидов появляются чаще', stat: 'nodeChance', value: .2, maxLevel: 3 },
  { id: 'deflectsource', branch: 'spawn', name: 'Эхо отбивания', text: 'Каждые 6 отбиваний дают один источник астероида', stat: 'deflectSource', value: 1, maxLevel: 3 },
  { id: 'nodeslots', branch: 'spawn', name: 'Дополнительный источник', text: 'Источник остаётся после запуска с шансом 25%', stat: 'persistentSourceChance', value: .25, maxLevel: 3, requires: 'nodeexpansion' },
  { id: 'nodecharge', branch: 'spawn', name: 'Быстрый отклик', text: 'Быстрее заряжает источник астероида рядом с планетой', stat: 'nodeCharge', value: .22, maxLevel: 3 },
  { id: 'fastplanet', branch: 'spawn', name: 'Разгон источника', text: 'Увеличивает начальную скорость астероидов из источников', stat: 'nodeShotRate', value: .15, maxLevel: 3 }
];
const relicBranches = [
  { id: 'attack', name: 'АТАКА' }, { id: 'effects', name: 'ЭФФЕКТЫ' },
  { id: 'defense', name: 'ЗАЩИТА' }, { id: 'spawn', name: 'СОЗДАНИЕ' },
  { id: 'control', name: 'КОНТРОЛЬ' }
];
const relicById = new Map(relics.map(card => [card.id, card]));
const relicUpgradeTexts = {
  swiftmove: (rank, card) => `К базовой скорости по горизонтали +${asPercent(rank * card.value / BASE_MOVE_SPEED)}`,
  verticaldrive: (rank, card) => `К базовой скорости по вертикали +${asPercent(rank * card.value / BASE_MOVE_SPEED)}`,
  smallbody: rank => `Планета меньше и быстрее на ${asPercent(rank * LIGHT_ORBIT_SPEED_RATE)}`,
  chargerate: rank => `Бонус к скорости после отбивания +${rank * 20}%`,
  resonance: (rank, card) => `Радиус планеты +${rank * card.value} ед`,
  massivebody: (rank, card) => `Планета крупнее, базовая скорость −${asPercent(-rank * card.penalty.value / BASE_MOVE_SPEED)}`,
  satellite: rank => `Луны для перехвата +${rank}`,
  moonmass: (rank, card) => `Радиус каждой луны +${rank * card.value} ед`,
  moonreturn: rank => `Луны быстрее восстанавливаются после разрушения: ${formatRelicNumber(lunarRecoveryTime(rank))} с`,
  twinmoon: rank => `Луны вращаются на ${rank * 30}% быстрее. Каждый спутник выдерживает до ${1 + Math.min(2, rank)} ударов`,
  orbitglass: (rank, card) => `Орбита лун +${rank * card.value} ед. Они сильнее тянутся к вражеским астероидам`,
  bigshot: (rank, card) => `Астероид крупнее. Снимает до ${plateDamage(rank * card.value)} слоёв за удар по пластине`,
  kineticdrive: () => 'Астероиды быстрее вылетают при запуске',
  ricochet: rank => `Бонус за отскок от стены +${Math.round(ricochetRate(rank * 2) * 100)}% к скорости`,
  midgrowth: () => 'Твой астероид уменьшается по мере дальности полёта',
  comet: rank => `Замедляющий след шире и держится ${formatRelicNumber(cometFieldDuration(rank))} с`,
  coldfront: rank => `Твоя планета создаёт замедляющий соперника гравиконус: −${formatRelicNumber(100 * (1 - chillSpeedMultiplier(rank)))}% скорости`,
  clashblast: rank => `Взрыв охватывает радиус ${62 + Math.min(3, rank) * 12} ед при столкновении астероидов`,
  rearplates: (rank, card) => `Длина каждой пластины до +${Math.min(100, rank * card.value)} ед, если есть место`,
  cornerguards: rank => `Уголки закрывают ещё ${Math.min(3, rank) * 12} ед у каждого края`,
  platelayers: rank => `Слоёв: ${1 + Math.min(2, rank)}. Длина −${layerWidthPenalty(rank) * 100}%, восстановление +${formatRelicNumber(layerRecoveryPenalty(rank))} с`,
  ironcore: rank => `При отскоке от пластины скорость вперёд +${Math.round(plateReflectRate(rank) * 100)}%`,
  lastlight: (rank, card) => `Чем меньше пластин, тем сильнее твоё отражение астероида: +${asPercent(rank * card.value)} за утраченную пластину`,
  shieldslow: (rank, card) => `Пластины снижают скорость отбитого астероида на ${Math.round(Math.min(.5, rank * card.value) * 100)}%`,
  wallcounter: rank => `Удар в чужую пластину чинит до ${Math.min(3, rank)} слоёв твоих`,
  sourcerepair: rank => `Создание астероида восстанавливает ${Math.min(3, rank)} слой${rank === 1 ? '' : 'а'} защиты`,
  blockpoints: (rank, card) => `Генераторы защиты: ${Math.round(Math.min(.75, rank * card.value) * 100)}% за попытку`,
  blocksize: rank => `Размер точки перехвата: ${34 + Math.min(3, rank) * 8}×${18 + Math.min(3, rank) * 4} ед`,
  guardtrail: rank => `След шире и держится ${formatRelicNumber(guardTrailLifetime(rank))} с. Гаснет после отбивания`,
  deflectgrowth: (rank, card) => `Отбивание на время увеличивает радиус на ${Math.min(15, rank * card.value)} ед. Рост складывается`,
  nodeexpansion: (rank, card) => `Базовый шанс источника за попытку +${Math.round(Math.min(.8, rank * card.value) * 100)} п. п.`,
  deflectsource: rank => `Каждые ${deflectSourceThreshold(rank)} отбиваний дают один источник астероида`,
  nodeslots: rank => `Источник остаётся после запуска с шансом ${[0, 25, 50, 80][Math.min(3, rank)]}%`,
  nodecharge: (rank, card) => `Быстрее заряжает источник астероида рядом с планетой: +${Math.round(Math.min(.66, rank * card.value) / .55 * 100)}%`,
  fastplanet: (rank, card) => `Начальная скорость астероидов из источников +${asPercent(rank * card.value)}`
};

const formatRelicNumber = value => Number(value.toFixed(2)).toLocaleString('ru-RU');
const asPercent = rate => `${Math.round(rate * 100)}%`;
const lunarRecoveryTime = rank => Math.max(3.5, 10 - Math.min(2, rank) * 3.25);
const cometFieldDuration = rank => 1.1 + Math.min(3, rank) * .42;
const layerRecoveryPenalty = rank => Math.min(2, rank) * 1.75;
const layerWidthPenalty = rank => Math.min(2, rank) * .25;
const guardTrailLifetime = rank => .28 + Math.min(3, rank) * .14;
const guardTrailHalfWidth = rank => 2 + rank * .55;
const guardTrailRecovery = 1.25;
const guardTrailArming = .16;
const chillSpeedMultiplier = rank => 1 - (.25 + Math.min(3, rank) * .05);
const ricochetRate = bounce => Math.min(.3, bounce * .05);
const plateReflectRate = rank => .1 + Math.min(3, rank) * .1;
const chillConeRange = 235;
const chillConeHalfAngle = rank => .52 + Math.max(0, rank - 1) * .06;
const deflectSourceThreshold = rank => Math.max(4, 7 - Math.floor(rank));
const plateDamage = shotSize => Math.max(1, Math.floor(shotSize / 5) + 1);

const percentageRelics = new Set(['swiftmove', 'verticaldrive', 'smallbody', 'massivebody', 'kineticdrive', 'lastlight', 'fastplanet', 'chargerate', 'twinmoon', 'ricochet', 'midgrowth', 'coldfront', 'platelayers', 'ironcore', 'shieldslow', 'blockpoints', 'nodeexpansion', 'nodecharge', 'nodeslots']);
function relicDescription(card, rank) {
  return rank > 1 || (rank === 1 && percentageRelics.has(card.id)) ? relicUpgradeTexts[card.id](rank, card) : card.text;
}
const MAX_PLAYER_LEVEL = 15;
const XP_PER_LEVEL = 160;
const aiDifficulties = [
  { name: 'СТРАННИК', reaction: 1.65, prediction: .68, error: .13 },
  { name: 'ЗВЁЗДНЫЙ СТРАЖ', reaction: 2.6, prediction: .84, error: .085 },
  { name: 'КАРАТЕЛЬ МИРОВ', reaction: 3.8, prediction: 1, error: .045 },
  { name: 'СИНГУЛЯРНОСТЬ', reaction: 5.4, prediction: 1.12, error: .018 }
];
const aiDifficultyContactNames = ['СО СТРАННИКОМ', 'СО ЗВЁЗДНЫМ СТРАЖЕМ', 'С КАРАТЕЛЕМ МИРОВ', 'С СИНГУЛЯРНОСТЬЮ'];
const aiDifficultyContactLabel = index => `<span>УСТАНОВИТЬ КОНТАКТ</span> <strong>${aiDifficultyContactNames[index]}</strong>`;
const relicUnlockLevels = {
  swiftmove: 1, verticaldrive: 1, nodeexpansion: 1, bigshot: 1, satellite: 1,
  kineticdrive: 2, rearplates: 2,
  nodecharge: 3, smallbody: 3,
  resonance: 4, massivebody: 11,
  moonmass: 5, moonreturn: 7,
  platelayers: 8,
  nodeslots: 9, chargerate: 9, cornerguards: 6, blockpoints: 7, blocksize: 8,
  guardtrail: 10,
  comet: 10, ironcore: 10, shieldslow: 10, wallcounter: 11, sourcerepair: 12,
  midgrowth: 11,
  twinmoon: 12, coldfront: 12,
  fastplanet: 13, orbitglass: 13,
  clashblast: 14,
  lastlight: 15, deflectsource: 6, deflectgrowth: 9
};
const skinUnlockLevels = [1, 1, 0, 0, 0, 0, 0, 0];
// Each difficulty opens a pair: one planet for each side of the composite body.
const skinDifficultyUnlocks = [null, null, 0, 0, 1, 1, 3, 2];
const skinHalfGroups = [[0, 2, 4, 6], [1, 3, 5, 7]];
function skinIsUnlocked(index, level = playerLevel()) {
  const required = skinDifficultyUnlocks[index];
  return required == null ? level >= skinUnlockLevels[index] : (career.difficultyWins?.[required] || 0) > 0;
}
function skinUnlockLabel(index) {
  const required = skinDifficultyUnlocks[index];
  if (required == null) return `ОТКРОЕТСЯ С УРОВНЯ ${skinUnlockLevels[index]}`;
  return careerDifficultyWins() >= required ? `ПОБЕДИТЕ: ${aiDifficulties[required].name}` : 'ОТКРОЕТСЯ ПОСЛЕ ???';
}
const CAREER_KEY = 'planets-career-v1';
const UNIVERSE_KEY_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const UNIVERSE_KEY_SPACE = 26 ** 3, UNIVERSE_KEY_OFFSET = 7919, UNIVERSE_KEY_INVERSE = 14061;
function loadCareer() {
  try {
    const saved = JSON.parse(localStorage.getItem(CAREER_KEY) || '{}');
    const wins = Math.max(0, Math.floor(Number(saved.wins) || 0));
    const storedXp = Math.max(0, Math.floor(Number(saved.xp) || 0));
    return { wins, xp: storedXp || wins * 50, difficultyUnlocked: Math.max(0, Math.min(aiDifficulties.length - 1, Math.floor(Number(saved.difficultyUnlocked) || 0))), difficultyWins: Array.from({length: aiDifficulties.length}, (_, i) => Math.max(0, Math.floor(Number(saved.difficultyWins?.[i]) || 0))), synergies: Array.isArray(saved.synergies) ? saved.synergies.filter(key => /^\d-\d$/.test(key)) : [] };
  } catch { return { wins: 0, xp: 0, difficultyUnlocked: 0, difficultyWins: Array(aiDifficulties.length).fill(0), synergies: [] }; }
}
let career = loadCareer();
function careerDifficultyWins() {
  let count = 0;
  while (count < aiDifficulties.length && (career.difficultyWins?.[count] || 0) > 0) count++;
  return Math.max(count, Math.min(aiDifficulties.length, career.difficultyUnlocked || 0));
}
function encodeUniverseKeyRank(rank) {
  const ordinal = (rank * 5 + UNIVERSE_KEY_OFFSET) % UNIVERSE_KEY_SPACE;
  return UNIVERSE_KEY_ALPHABET[Math.floor(ordinal / 676)] + UNIVERSE_KEY_ALPHABET[Math.floor(ordinal / 26) % 26] + UNIVERSE_KEY_ALPHABET[ordinal % 26];
}
function currentUniverseKey() {
  const allDiscoveriesOpened = relicsUnlockedAt(MAX_PLAYER_LEVEL).length + unlockedSkinsAt(MAX_PLAYER_LEVEL).length + planetSynergies.length === discoveryCount();
  const allOpponentsDefeated = aiDifficulties.every((_, index) => (career.difficultyWins?.[index] || 0) > 0);
  const allSynergiesUnlocked = planetSynergies.every(synergy => career.synergies?.includes(synergy.key));
  if (playerLevel() >= MAX_PLAYER_LEVEL && allDiscoveriesOpened && allOpponentsDefeated && allSynergiesUnlocked) return 'END';
  const roundWins = Math.min(45, career.xp >= (MAX_PLAYER_LEVEL - 1) * XP_PER_LEVEL ? 45 : Math.floor(Math.max(0, career.xp || 0) / 50));
  return encodeUniverseKeyRank(roundWins * 5 + careerDifficultyWins());
}
function decodeUniverseKey(code) {
  const rankCode = code.replace(/[^A-Z]/g, '').slice(0, 3);
  if (!/^[A-Z]{3}$/.test(rankCode)) return null;
  const ordinal = [...rankCode].reduce((value, letter) => value * 26 + UNIVERSE_KEY_ALPHABET.indexOf(letter), 0);
  const rank = ((ordinal - UNIVERSE_KEY_OFFSET + UNIVERSE_KEY_SPACE) % UNIVERSE_KEY_SPACE) * UNIVERSE_KEY_INVERSE % UNIVERSE_KEY_SPACE;
  if (rank > 229) return null;
  const roundWins = Math.floor(rank / 5);
  return { kind: 'career', xp: Math.min((MAX_PLAYER_LEVEL - 1) * XP_PER_LEVEL, roundWins * 50), wins: roundWins, difficultyWinsCount: rank % 5 };
}
function saveCareer() {
  try { localStorage.setItem(CAREER_KEY, JSON.stringify(career)); } catch {}
  renderCareerProgress(); renderRoster();
}
function showUniverseKeyStatus(message, success = false) {
  const status = document.querySelector('#universe-key-status');
  status.textContent = message; status.classList.toggle('is-success', success);
}
function applyUniverseKey() {
  const input = document.querySelector('#universe-key-input'), code = input.value.trim().toUpperCase();
  input.value = code;
  if (code === 'ZOO') {
    state.zooMode = false; renderZoo(); switchScreen('zoo');
    document.querySelector('#universe-key-dialog').classList.add('hidden');
    sound('select', 0); return;
  }
  let restored;
  if (code === 'END') {
    restored = { wins: Math.floor(((MAX_PLAYER_LEVEL - 1) * XP_PER_LEVEL) / 50), xp: (MAX_PLAYER_LEVEL - 1) * XP_PER_LEVEL, difficultyUnlocked: aiDifficulties.length - 1, difficultyWins: Array(aiDifficulties.length).fill(1), synergies: planetSynergies.map(synergy => synergy.key) };
  } else {
    const decoded = decodeUniverseKey(code);
    if (!decoded || decoded.kind !== 'career') { showUniverseKeyStatus('Ключ не распознан'); sound('ui'); return; }
    restored = {
      wins: decoded.wins, xp: decoded.xp,
      difficultyUnlocked: Math.min(aiDifficulties.length - 1, decoded.difficultyWinsCount),
      difficultyWins: Array.from({ length: aiDifficulties.length }, (_, index) => index < decoded.difficultyWinsCount ? 1 : 0), synergies: career.synergies || []
    };
  }
  career = restored; saveCareer();
  document.querySelector('#universe-current-key').textContent = currentUniverseKey();
  showUniverseKeyStatus('Прогресс восстановлен', true); sound('select', 0);
}
function openUniverseKeyDialog() {
  document.querySelector('#universe-current-key').textContent = currentUniverseKey();
  document.querySelector('#universe-key-input').value = '';
  showUniverseKeyStatus('');
  document.querySelector('#universe-key-dialog').classList.remove('hidden');
  document.querySelector('#universe-key-input').focus();
}
const signatureRelics = new Set(['smallbody', 'bigshot', 'ricochet', 'clashblast', 'coldfront', 'midgrowth', 'platelayers', 'nodeslots', 'cornerguards', 'moonreturn', 'massivebody']);

const state = {
  mode: 'ai', phase: 'menu', running: false, lastTime: 0, players: [], shots: [], pendingShots: [], shotImpacts: [], slowFields: [], tapMarks: [], particles: [], gestures: new Map(), chosenSkins: [0, 4], chosenSkinHalves: [[0, 0], [4, 4]], skinHalfFocus: 0, skinConfirmed: [false, false], selectingPlayer: 0, roundIntro: 0, serveOwner: 0, nextServeOwner: null, aiServeDirection: 1, serveAngle: 0, serveBall: null, serveAimPointer: null,
  matchScore: [0, 0], campaignWins: [0, 0], duelsPlayed: 0, matchWinner: null, newlyUnlockedSynergy: null, upgradeOffers: [], startDuelTimer: 0, skinPickerSynergyKey: '', sessionRoundWins: 0, sessionXp: 0, careerRecorded: false, chargeNodes: [], blockNodes: [],
  upgradeChoices: [null, null], upgradeFocus: [0, 0], upgradePrevious: [null, null], continueTimer: 0, keys: new Set(), keyboardActive: [false, false], zooMode: false, zooSkin: 0, zooLoadout: {},
  mobileMoveAxis: [{ x: 0, y: 0 }, { x: 0, y: 0 }], stickPointers: [null, null],
  aiDifficulty: 0, aiThink: 0, aiAimOffset: 0,
  aiTimer: .8, aiMoveTimer: 0, hitstop: 0, shake: 0, spawnClock: 2.4, nodeSpawnTimers: [0, 0], blockSpawnTimers: [0, 0],
  ambient: Array.from({ length: 54 }, (_, i) => ({ x: (i * 157 + 37) % W, y: (i * 113 + 53) % H, size: i % 7 === 0 ? 2 : 1, phase: i * .7 }))
};

function makePlayer(index) {
  const halves = [...(state.chosenSkinHalves[index] || [state.chosenSkins[index], null])];
  return { index, skin: halves[0] ?? halves[1] ?? state.chosenSkins[index], skinHalves: halves, x: W / 2, y: index ? H * .17 : H * .83, targetX: W / 2, targetY: index ? H * .17 : H * .83, vx: 0, shieldBars: [true, true, true], shieldLayerHits: [0, 0, 0], shieldTimers: [0, 0, 0], cornerGuards: [0, 0], armor: 0, lostArmor: false, cards: {}, startUpgradeBonusUsed: false, charges: 1, chargeTimer: 0, orbReady: true, bonusSpeed: 0, bonusPower: 0, facingAngle: index ? Math.PI / 2 : -Math.PI / 2, satellites: [], satelliteTimers: [], satelliteHits: [], moonInvulnerable: [], permanentMoons: 0, guardTrail: [], hitFlash: 0, passFlash: 0, moonSlowTimer: 0, deflectGrow: 0, deflectGrowTimer: 0, reflectBoostTimer: 0, wardRegenBoost: 0, deflectionsForNode: 0, deflectionsForMoon: 0, rosterResetPoints: 0 };
}

function playerSkinHalves(player) { return player?.skinHalves || [player?.skin ?? 0, null]; }
const planetSynergies = [
  { key: '0-1', name: 'УПРУГАЯ ОБОЛОЧКА', text: 'Отбивание быстрее восстанавливает пластины', effect: 'plateOnDeflect' },
  { key: '0-3', name: 'РАЗРУШИТЕЛЬ ИСТОЧНИКОВ', text: 'Твой астероид разрушает источники астероидов соперника', effect: 'destroySources' },
  { key: '0-5', name: 'ПЕРЕГРУЗКА ИСТОЧНИКА', text: 'Попадание по луне на время замедляет соперника', effect: 'moonFlash' },
  { key: '0-7', name: 'ОТРАЖАЮЩИЙ РАЗГОН', text: 'Отражение астероида временно ускоряет планету', effect: 'deflectSpeed' },
  { key: '2-1', name: 'ЗАПАС ПРОЧНОСТИ', text: 'Сломанная защитная пластина не разрушается с шансом 30%', effect: 'plateReturn' },
  { key: '2-3', name: 'НАКОПЛЕННЫЙ ИМПУЛЬС', text: 'Источники заряжаются медленнее, но имеют 50% шанс не исчезнуть', effect: 'persistentSources' },
  { key: '2-5', name: 'ЛУННЫЙ ОБРАЗ', text: 'Все первые улучшения спутников получают +1 уровень', effect: 'satelliteLevel' },
  { key: '2-7', name: 'ЧИСТАЯ ТРАЕКТОРИЯ', text: 'Видны следы астероидов соперника после отскока', effect: 'enemyTrails' },
  { key: '4-1', name: 'СОЛНЕЧНАЯ БРОНЯ', text: 'Создание астероида восстанавливает защитную пластину', effect: 'sourceRepair' },
  { key: '4-3', name: 'ЛУННЫЙ ПРИЛИВ', text: 'Луны крепятся к источникам астероидов и ускоряют их создание', effect: 'moonSources' },
  { key: '4-5', name: 'ЛУННЫЙ АККУМУЛЯТОР', text: 'Попадание астероида по твоей луне создаёт рядом источник астероида', effect: 'moonSource' },
  { key: '4-7', name: 'СВЕТОВОЙ РИКОШЕТ', text: 'Твои астероиды сильнее ускоряются от стен', effect: 'strongRicochet' },
  { key: '6-1', name: 'ДВОЙНОЙ ЗАСЛОН', text: 'Попадание астероида по твоей луне восстанавливает защитную пластину', effect: 'moonRepair' },
  { key: '6-3', name: 'ОТВЕТНЫЙ ИМПУЛЬС', text: 'Лунный перехват заряжает ближайший источник', effect: 'moonCharge' },
  { key: '6-5', name: 'СОГЛАСОВАННЫЕ ОРБИТЫ', text: 'Увеличивает размер планеты за каждую луну рядом с ней', effect: 'moonGrowth' },
  { key: '6-7', name: 'ОРБИТАЛЬНЫЙ РАЗГОН', text: 'Отбивание астероида ускоряет восстановление лун', effect: 'wallMoonRegen' }
];
const synergyByKey = new Map(planetSynergies.map(synergy => [synergy.key, synergy]));
function planetSynergy(halves) {
  if (!halves || halves[0] == null || halves[1] == null || halves[0] === halves[1]) return null;
  const [left, right] = halves, key = `${left}-${right}`;
  return synergyByKey.get(key) || null;
}
function hasSynergy(player, effect) { const synergy = planetSynergy(playerSkinHalves(player)); return Boolean(synergy && synergy.effect === effect && career.synergies?.includes(synergy.key)); }
function planetBonusStrength(player, bonus) { return playerSkinHalves(player).reduce((strength, index) => strength + (index != null && ballSkins[index]?.bonus === bonus ? 1 : 0), 0); }
function repairShieldLayers(player, amount) {
  if (!player || amount <= 0 || !player.shieldLayerHits?.length) return;
  const cap = 1 + statsFor(player).plateLayers;
  let repaired = 0;
  for (let i = 0; i < player.shieldLayerHits.length && repaired < amount; i++) {
    const before = player.shieldLayerHits[i] || 0;
    player.shieldLayerHits[i] = Math.min(cap, before + 1);
    if (player.shieldLayerHits[i] > before) {
      repaired++;
      contactCue({ x: guardBarCenter(player, i), y: player.index ? 40 : H - 40, nx: 0, ny: -1 },
        player.index ? '#ffb19e' : '#b8e9ff', .24, 'restore');
    }
  }
  if (repaired) { player.shieldTimers = player.shieldTimers.map((timer, i) => { if (player.shieldLayerHits[i] > 0) player.shieldBars[i] = true; return player.shieldLayerHits[i] > 0 ? 0 : timer; }); player.hitFlash = Math.max(player.hitFlash || 0, .2); sound('block', player.index); }
}

function spawnChargeNode(owner, x, y) {
  const player = state.players[owner];
  const stats = statsFor(player);
  const node = { owner, x, y, charge: 0, appear: 0, phase: Math.random() * Math.PI * 2, persistent: false, persistentChance: Math.max(stats.persistentSourceChance, hasSynergy(player, 'persistentSources') ? .5 : 0), moonLinked: hasSynergy(player, 'moonSources') };
  state.chargeNodes.push(node);
  burst(x, y, owner ? '#ff7770' : '#69caff', 10);
  state.shotImpacts.push({ x, y, angle: 0, life: .6, max: .6, spawn: true, pointSpawn: true, spawned: true, owner, color: owner ? '#ff7770' : '#69caff' });
  sound('spawn', owner);
  return node;
}

const playerStatsCache = new WeakMap();
function statsFor(player) {
  const cached = playerStatsCache.get(player);
  if (cached && cached.cards === player.cards && cached.halves === player.skinHalves && cached.skin === player.skin) return cached.stats;
  const stats = computePlayerStats(player);
  playerStatsCache.set(player, { cards: player.cards, halves: player.skinHalves, skin: player.skin, stats });
  return stats;
}

// Replace the loadout on edits so physics and rendering always share the same derived stats.
function setRelicRank(player, id, rank) {
  const cards = { ...player.cards };
  if (rank) cards[id] = rank;
  else delete cards[id];
  player.cards = cards;
}

function computePlayerStats(player) {
  const s = { moveSpeed: BASE_MOVE_SPEED, moveSpeedX: 0, moveSpeedY: 0, shotSpeed: 210, launchSpeed: 0, launchRate: 0, nodeShotRate: 0, nodeChance: 0, nodeChanceMultiplier: 1, persistentSourceChance: 0, nodeCharge: 0, blockNodeChance: 0, blockNodeSize: 0, guardTrail: 0, spawnSpeed: 0, spawnCooldown: 0, barrierWidth: 0, wardRegen: 0, plateLayers: 0, cornerGuards: 0, satelliteRegen: 0, satelliteIntercept: 0, moonAttraction: 0, chargeRate: 0, cooldown: .81, planetSize: 0, shotSize: 0, smallBody: 0, clashBlast: 0, chillAura: 0, phase: 0, bounce: 0, satellites: 0, armor: 0, chargeMax: 3, pierce: 0, impact: 0, satelliteSize: 0, lastLight: 0, cometTrail: 0, orbitSpeed: 0, orbitRadius: 0, reflect: 0, wallField: 0, midGrowth: 0, shieldSlow: 0, wallCounter: 0, sourceRepair: 0, deflectGrowth: 0, deflectSource: 0 };
  const loadout = Object.entries(player.cards);
  for (const [id, level] of loadout) {
    const card = relicById.get(id);
    if (!card) continue;
    s[card.stat] += card.value * level;
    if (card.secondaryStat) s[card.secondaryStat] += card.secondaryValue * level;
  }
  s.persistentSourceChance = [0, .25, .5, .8][Math.min(3, player.cards.nodeslots || 0)];
  for (const [id, level] of loadout) {
    const penalty = relicById.get(id)?.penalty;
    if (penalty) s[penalty.stat] += penalty.value * level;
  }
  const bonus = name => planetBonusStrength(player, name);
  s.moveSpeed *= 1.25 ** bonus('swift');
  s.satellites += Math.round(2 * bonus('asteroid'));
  s.bounce += bonus('ricochet');
  s.chargeRate += .55 * bonus('fastMoon');
  s.nodeChanceMultiplier *= 1.25 ** bonus('sourceChance');
  if (s.smallBody) s.moveSpeed += s.smallBody * BASE_MOVE_SPEED * LIGHT_ORBIT_SPEED_RATE;
  s.moveSpeed = Math.max(180, s.moveSpeed); s.moveSpeedX = Math.max(180, s.moveSpeed + s.moveSpeedX); s.moveSpeedY = Math.max(180, s.moveSpeed + s.moveSpeedY); s.shotSpeed = Math.max(145, s.shotSpeed);
  s.cooldown = Math.max(.5, s.cooldown); s.planetSize = Math.min(38, s.planetSize);
  s.satellites = Math.min(4, s.satellites); s.armor = Math.min(3, s.armor); s.reflect = Math.min(3, s.reflect); s.wardRegen = Math.min(3, s.wardRegen); s.satelliteIntercept = Math.min(2, s.satelliteIntercept); s.moonAttraction = Math.min(.44, s.moonAttraction); s.nodeChance = Math.min(.8, s.nodeChance); s.persistentSourceChance = Math.min(.8, s.persistentSourceChance); s.nodeCharge = Math.min(.66, s.nodeCharge); s.spawnSpeed = Math.min(.6, s.spawnSpeed); s.spawnCooldown = Math.min(.54, s.spawnCooldown); s.barrierWidth = Math.min(100, s.barrierWidth); s.chargeRate = Math.min(.7, s.chargeRate); s.bounce = Math.min(8, s.bounce); s.chillAura = Math.min(3, s.chillAura); s.clashBlast = Math.min(3, s.clashBlast); s.wallField = Math.min(3, s.wallField); s.cometTrail = Math.min(3, s.cometTrail);
  s.chargeMax = Math.min(5, s.chargeMax); s.plateLayers = Math.min(2, s.plateLayers); s.cornerGuards = Math.min(3, s.cornerGuards); s.satelliteRegen = Math.min(2, s.satelliteRegen); s.shieldSlow = Math.min(.5, s.shieldSlow); s.wallCounter = Math.min(3, s.wallCounter); s.sourceRepair = Math.min(3, s.sourceRepair); s.blockNodeChance = Math.min(.75, s.blockNodeChance); s.blockNodeSize = Math.min(3, s.blockNodeSize); s.guardTrail = Math.min(3, s.guardTrail); s.deflectSource = Math.min(3, s.deflectSource); s.deflectGrowth = Math.min(15, s.deflectGrowth);
  return s;
}

function switchScreen(id) {
  if (state.phase === 'menu' && id !== 'menu') resetMenuPlanet();
  Object.entries(screens).forEach(([name, node]) => node.classList.toggle('hidden', name !== id));
  state.phase = id;
  syncMusic(id);
  touchControls.classList.toggle('hidden', id !== 'battle' || !window.matchMedia('(pointer: coarse)').matches);
  touchControls.querySelectorAll('.virtual-stick').forEach(stick => stick.classList.toggle('hidden', Number(stick.dataset.player) === 1 && state.mode !== 'pvp'));
  if (id === 'battle') resizeCanvas();
}

function playerLevel(xp = career.xp) { return Math.min(MAX_PLAYER_LEVEL, 1 + Math.floor(Math.max(0, xp) / XP_PER_LEVEL)); }
function relicsUnlockedAt(level) { return relics.filter(card => { const required = relicUnlockLevels[card.id] || 1; return required > 1 && required <= level; }); }
function unlockedSkinsAt(level) { return ballSkins.filter((_, index) => skinDifficultyUnlocks[index] !== null && skinIsUnlocked(index, level)); }
function discoveryCount() { return relics.filter(card => (relicUnlockLevels[card.id] || 1) > 1).length + skinDifficultyUnlocks.filter(level => level !== null).length + planetSynergies.length; }
function renderCareerProgress(animate = false) {
  const progress = document.querySelector('#career-progress');
  if (!progress) return;
  const level = playerLevel(), total = discoveryCount(), opened = relicsUnlockedAt(level).length + unlockedSkinsAt(level).length + (career.synergies?.length || 0);
  const percent = Math.round(opened / total * 100);
  document.querySelector('#career-percent').textContent = `${percent} %`;
  const fill = document.querySelector('#career-progress-fill'), previousWidth = fill.style.width || '0%';
  if (animate) { fill.style.transition = 'none'; fill.style.width = previousWidth; void fill.offsetWidth; requestAnimationFrame(() => { fill.style.transition = ''; fill.style.width = `${percent}%`; progress.classList.remove('progress-awarded'); void progress.offsetWidth; progress.classList.add('progress-awarded'); window.setTimeout(() => progress.classList.remove('progress-awarded'), 950); }); }
  else fill.style.width = `${percent}%`;
  progress.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', String(percent));
}
function renderRoster() {
  const level = playerLevel(), total = discoveryCount();
  const opened = relicsUnlockedAt(level).length + unlockedSkinsAt(level).length + (career.synergies?.length || 0);
  const percent = Math.round(opened / total * 100);
  document.querySelector('#roster-percent').textContent = `${percent} %`;
  document.querySelector('#roster-level-label').textContent = `Ранг ${level}`;
  document.querySelector('#roster-progress-fill').style.width = `${percent}%`;
  const list = document.querySelector('#roster-list');
  const accents = ['#b95740', '#4d9ab0', '#c19a48', '#718f82', '#d07850', '#8397b2'];
  const lockSvg = '<span class="roster-lock" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span>';
  const relicCards = relics.map((card, index) => {
    const unlockLevel = relicUnlockLevels[card.id] || 1, unlocked = level >= unlockLevel;
    const parent = card.requires && relics.find(item => item.id === card.requires);
    if (!unlocked) return `<article class="roster-card is-locked" style="--discovery-accent:${accents[index % accents.length]}" tabindex="0" aria-label="Закрытое улучшение: ${card.name}. Откроется на уровне ${unlockLevel}"><div class="roster-locked-core">${lockSvg}<small class="roster-status">УРОВЕНЬ ${String(unlockLevel).padStart(2, '0')}</small></div></article>`;
    return `<article class="roster-card is-open" style="--discovery-accent:${accents[index % accents.length]}" tabindex="0" aria-label="${card.name}. Открыто. ${card.text}"><div class="roster-art"><span class="roster-icon">${relicIcon(card.stat, card.id)}</span></div><div class="roster-card-copy"><h3>${card.name}</h3><p>${card.text}</p>${parent ? `<small class="roster-requirement">Требует ${parent.name}</small>` : ''}</div></article>`;
  });
  const relicMarkup = relicBranches.map(branch => {
    const branchCards = relicCards.filter((_, index) => relics[index].branch === branch.id);
    return `<div class="roster-branch-heading"><span>${branch.name}</span></div>${branchCards.join('')}`;
  }).join('');
  const synergyIcons = { plateOnDeflect: ['plates'], destroySources: ['nodeChance'], moonFlash: ['chillAura'], deflectSpeed: ['moveSpeed'], plateReturn: ['wardChance'], persistentSources: ['nodeCharge'], satelliteLevel: ['satellites', 'satellite'], enemyTrails: ['bounce', 'ricochet'], sourceRepair: ['armor'], moonSources: ['orbitSpeed'], moonSource: ['nodeChance'], strongRicochet: ['bounce'], moonRepair: ['plates'], moonCharge: ['chargeRate'], moonGrowth: ['satellites', 'satellite'], wallMoonRegen: ['satelliteRegen'] };
  const synergyMarkup = planetSynergies.map((synergy, index) => career.synergies?.includes(synergy.key)
    ? `<article class="roster-card is-open synergy-roster-card" style="--discovery-accent:${accents[index % accents.length]}" tabindex="0" aria-label="${synergy.name}. ${synergy.text}"><div class="roster-art"><span class="roster-icon">${relicIcon(...synergyIcons[synergy.effect])}</span></div><div class="roster-card-copy"><h3>${synergy.name}</h3><p>${synergy.text}</p></div></article>`
    : `<article class="roster-card is-locked synergy-roster-card synergy-locked" style="--discovery-accent:${accents[index % accents.length]}" tabindex="0" aria-label="Закрытая синергия: ${synergy.name}. Откроется после победы на этом сочетании"><div class="roster-locked-core">${lockSvg}<small class="roster-status">${ballSkins[Number(synergy.key[0])]?.name} + ${ballSkins[Number(synergy.key[2])]?.name}</small></div></article>`).join('');
  list.innerHTML = `${relicMarkup}<div class="roster-branch-heading"><span>СИНЕРГИИ</span></div>${synergyMarkup}`;
}

function renderZoo() {
  state.zooLoadout ||= {};
  document.querySelector('#zoo-planets').innerHTML = ballSkins.map((planet, index) => `<button class="zoo-planet ${state.zooSkin === index ? 'selected' : ''}" data-zoo-skin="${index}" type="button"><span class="planet-roster-orb skin-${planet.mark}" style="--orb:#4d9ab0;--orb-detail:${planet.detail}"></span><b>${planet.name}</b><small>${planet.bonusText}</small></button>`).join('');
  document.querySelectorAll('[data-zoo-skin]').forEach(button => button.addEventListener('click', () => { state.zooSkin = Number(button.dataset.zooSkin); renderZoo(); sound('select', 0); }));
  document.querySelector('#zoo-relics').innerHTML = relics.map(card => {
    const level = state.zooLoadout[card.id] || 0, max = card.maxLevel || 3;
    return `<article class="zoo-relic ${level ? 'active' : ''}"><span class="zoo-relic-icon">${relicIcon(card.stat, card.id)}</span><div class="zoo-relic-copy"><b>${card.name}</b><small>${relicDescription(card, level)}</small></div><div class="zoo-relic-level"><button type="button" data-zoo-change="-1" data-relic="${card.id}" aria-label="Уменьшить уровень: ${card.name}" ${level <= 0 ? 'disabled' : ''}>−</button><span>УР. ${level}</span><button type="button" data-zoo-change="1" data-relic="${card.id}" aria-label="Увеличить уровень: ${card.name}" ${level >= max ? 'disabled' : ''}>+</button></div></article>`;
  }).join('');
  document.querySelectorAll('[data-zoo-change]').forEach(button => button.addEventListener('click', () => {
    const card = relics.find(item => item.id === button.dataset.relic), current = state.zooLoadout[card.id] || 0;
    const next = Math.max(0, Math.min(card.maxLevel || 3, current + Number(button.dataset.zooChange)));
    if (next) state.zooLoadout[card.id] = next; else delete state.zooLoadout[card.id];
    renderZoo(); sound('select', 0);
  }));
}

function startZooBattle() {
  state.tutorial = null;
  state.zooMode = true; state.mode = 'ai'; state.aiDifficulty = 0; state.chosenSkins = [state.zooSkin, 1]; state.chosenSkinHalves = [[state.zooSkin, state.zooSkin], [1, 1]];
  state.players = [makePlayer(0), makePlayer(1)];
  state.players[0].cards = { ...state.zooLoadout };
  state.players[1].cards = {};
  state.campaignWins = [0, 0]; state.duelsPlayed = 0; state.matchScore = [0, 0]; state.matchWinner = null; state.sessionRoundWins = 0; state.sessionXp = 0; state.careerRecorded = true;
  startDuel();
}
function resetCareer() {
  career = { wins: 0, xp: 0, difficultyUnlocked: 0, difficultyWins: Array(aiDifficulties.length).fill(0), synergies: [] };
  try {
    for (let index = localStorage.length - 1; index >= 0; index--) {
      const key = localStorage.key(index);
      if (key === CAREER_KEY || /^planets-(career|progress|unlock)/i.test(key || '')) localStorage.removeItem(key);
    }
    localStorage.setItem(CAREER_KEY, JSON.stringify(career));
  } catch {}
  state.sessionRoundWins = 0; state.sessionXp = 0;
  const resetFills = ['#career-progress-fill', '#roster-progress-fill'].map(selector => document.querySelector(selector));
  resetFills.forEach(fill => { fill.style.transition = 'none'; });
  closeRosterResetConfirm(); renderRoster(); renderCareerProgress();
  requestAnimationFrame(() => { resetFills.forEach(fill => { fill.style.transition = ''; }); });
}
let resetConfirmOpener = null;
function openRosterResetConfirm(event) {
  resetConfirmOpener = event.currentTarget;
  document.querySelector('#reset-confirm').classList.remove('hidden');
  document.querySelector('#reset-cancel').focus();
}
function closeRosterResetConfirm() {
  document.querySelector('#reset-confirm').classList.add('hidden');
  resetConfirmOpener?.focus(); resetConfirmOpener = null;
}
function recordCareerSession() {
  if (state.careerRecorded) return;
  state.careerRecorded = true;
  const oldWins = career.wins, oldXp = career.xp, oldLevel = playerLevel(oldXp), sessionWins = state.sessionRoundWins;
  state.sessionXp = sessionWins * 50;
  career = { wins: oldWins + sessionWins, xp: career.xp + state.sessionXp, difficultyUnlocked: career.difficultyUnlocked || 0, difficultyWins: career.difficultyWins || Array(aiDifficulties.length).fill(0), synergies: career.synergies || [] };
  const newLevel = playerLevel();
  try { localStorage.setItem(CAREER_KEY, JSON.stringify(career)); } catch {}
  const newlyUnlockedRelics = relics.filter(card => (relicUnlockLevels[card.id] || 1) > oldLevel && (relicUnlockLevels[card.id] || 1) <= newLevel);
  const newlyUnlockedSkins = [];
  const maxed = newLevel >= MAX_PLAYER_LEVEL;
  const levelLabel = document.querySelector('#session-level');
  const xpFill = document.querySelector('#session-xp-fill');
  xpFill.style.transition = 'none';
  const xpCap = (MAX_PLAYER_LEVEL - 1) * XP_PER_LEVEL, fromXp = Math.min(oldXp, xpCap), toXp = Math.min(career.xp, xpCap), reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const paintXp = value => {
    const currentLevel = playerLevel(Math.floor(value)), withinLevel = currentLevel >= MAX_PLAYER_LEVEL ? XP_PER_LEVEL : Math.floor(value) % XP_PER_LEVEL;
    if (levelLabel.textContent !== `УР. ${currentLevel}`) { levelLabel.textContent = `УР. ${currentLevel}`; levelLabel.classList.remove('level-up'); void levelLabel.offsetWidth; levelLabel.classList.add('level-up'); }
    xpFill.style.width = `${currentLevel >= MAX_PLAYER_LEVEL ? 100 : withinLevel / XP_PER_LEVEL * 100}%`;
    xpFill.parentElement.setAttribute('aria-valuemax', String(XP_PER_LEVEL)); xpFill.parentElement.setAttribute('aria-valuenow', String(withinLevel));
  };
  levelLabel.textContent = `УР. ${playerLevel(fromXp)}`; paintXp(fromXp);
  if (reducedMotion || toXp <= fromXp) { paintXp(toXp); xpFill.style.removeProperty('transition'); }
  else {
    const started = performance.now(), duration = Math.min(3000, Math.max(950, (toXp - fromXp) * 2.2));
    const advanceXp = now => { const progress = Math.min(1, (now - started) / duration), eased = 1 - (1 - progress) ** 3; paintXp(fromXp + (toXp - fromXp) * eased); if (progress < 1) requestAnimationFrame(advanceXp); else { levelLabel.classList.remove('level-up'); xpFill.style.removeProperty('transition'); } };
    requestAnimationFrame(advanceXp);
  }
  let unlockOrder = 0;
  document.querySelector('#session-relics').innerHTML = newlyUnlockedRelics.length ? `<small class="unlock-heading">НОВЫЕ УЛУЧШЕНИЯ</small>${newlyUnlockedRelics.map(card => `<span class="unlock-chip" style="--unlock-delay:${Math.min(unlockOrder++ * 70, 280)}ms"><b>${card.name}</b></span>`).join('')}` : '';
  document.querySelector('#session-skins').innerHTML = newlyUnlockedSkins.length ? `<small class="unlock-heading">НОВЫЕ ПЛАНЕТЫ</small>${newlyUnlockedSkins.map(skin => `<span class="unlock-chip" style="--unlock-delay:${Math.min(unlockOrder++ * 70, 280)}ms"><b>${skin.name}</b></span>`).join('')}` : '';
}

function newGame(mode) {
  state.zooMode = false;
  const blue = skinHalfGroups.map(([starter]) => starter);
  const red = mode === 'pvp' ? [...blue] : [1, 0];
  state.mode = mode; state.chosenSkinHalves = [blue, red]; state.chosenSkins = [blue[0], red[0]]; state.skinHalfFocus = 0; state.skinConfirmed = [false, false]; state.selectingPlayer = 0;
  renderSkinPicker(); switchScreen('skins');
}

function hasCompleteSkinSelection(player) {
  const halves = state.chosenSkinHalves[player];
  return skinHalfGroups.every((group, half) => group.includes(halves?.[half]) && skinIsUnlocked(halves[half]));
}

function renderSkinPicker() {
  const players = document.querySelector('#skin-players'), options = document.querySelector('#skin-options');
  const isLocal = state.mode === 'pvp', pickingBlue = state.selectingPlayer === 0;
  document.querySelector('#skins').classList.toggle('player-two-view', isLocal && !pickingBlue && window.matchMedia('(pointer: coarse)').matches);
  players.innerHTML = isLocal ? `<span class="skin-player skin-${pickingBlue ? 'blue' : 'red'} active">ВЫБОР ${pickingBlue ? 'СИНЕЙ' : 'КРАСНОЙ'} ПЛАНЕТЫ</span>` : '';
  document.querySelector('#skin-return-blue').classList.toggle('hidden', !isLocal || pickingBlue);
  const skinTurn = document.querySelector('#skin-turn');
  skinTurn.textContent = '';
  skinTurn.classList.add('hidden');
  document.querySelector('#skin-title-text').textContent = 'СОЗДАЙ ПЛАНЕТУ';
  const teamColor = state.selectingPlayer ? '#ff382f' : '#159ff2', halves = state.chosenSkinHalves[state.selectingPlayer] || [state.chosenSkins[state.selectingPlayer], null], focus = state.skinHalfFocus;
  const iconColor = state.selectingPlayer ? teamColor : '#44798b';
  document.querySelector('#skins').style.setProperty('--skin-accent', teamColor);
  document.querySelector('#skins').style.setProperty('--skin-layer-accent', teamColor);
  const displayName = (skin, idx) => isLocal && state.selectingPlayer ? skin.redName : skin.name;
  const first = halves[0] == null ? null : ballSkins[halves[0]], second = halves[1] == null ? null : ballSkins[halves[1]], selectedSkin = first || second || ballSkins[state.chosenSkins[state.selectingPlayer]],
    identity = first && second ? (halves[0] === halves[1] ? `МЕГА${displayName(first)}` : `${displayName(first)} ${displayName(second)}`) : displayName(selectedSkin),
    showcase = document.querySelector('#skin-showcase'), showcaseOrb = showcase.querySelector('.showcase-orb');
  showcase.classList.toggle('composite-name', Boolean(first && second && halves[0] !== halves[1]));
  showcase.dataset.mark = selectedSkin.mark;
  showcaseOrb.className = `showcase-orb skin-orb skin-${selectedSkin.mark}`;
  showcaseOrb.style.setProperty('--orb', teamColor); showcaseOrb.style.setProperty('--orb-detail', selectedSkin.detail);
  showcaseOrb.style.backgroundImage = `radial-gradient(circle at 50% 50%,${second?.detail || teamColor} 0 19%,transparent 20%), radial-gradient(circle at 36% 32%,#ffffff55,transparent 27%), radial-gradient(circle at 48% 52%,${teamColor} 8%,${teamColor} 56%,#102226 140%)`;
  const coreMarker = document.querySelector('#skin-showcase-core');
  coreMarker.hidden = !second;
  coreMarker.dataset.mark = second?.mark || '';
  showcase.style.setProperty('--skin-accent', teamColor);
  const nameElement = document.querySelector('#skin-showcase-name');
  nameElement.innerHTML = first && second
    ? `<span class="planet-name-layer">${displayName(first)}</span> <span class="planet-name-core">${displayName(second)}</span>`
    : `<span class="planet-name-${halves[0] != null ? 'layer' : 'core'}">${identity}</span>`;
  nameElement.style.removeProperty('font-size');
  requestAnimationFrame(() => {
    let planetNameSize = Number.parseFloat(getComputedStyle(nameElement).fontSize);
    while (nameElement.clientWidth && nameElement.scrollWidth > nameElement.clientWidth && planetNameSize > 10) {
      planetNameSize -= 1;
      nameElement.style.fontSize = `${planetNameSize}px`;
    }
  });
  const synergy = planetSynergy(halves), synergyElement = document.querySelector('#skin-showcase-synergy'), synergyUnlocked = synergy && career.synergies?.includes(synergy.key);
  document.querySelector('#skin-showcase-idea').textContent = '';
  document.querySelector('#skin-showcase-bonus').textContent = '';
  synergyElement.innerHTML = synergy ? (synergyUnlocked ? `<b>${synergy.name}</b><span>${synergy.text}</span>` : '<span>Победи, чтобы открыть синергию</span>') : '';
  synergyElement.classList.toggle('is-unlocked', Boolean(synergyUnlocked));
  const synergyKey = synergy?.key || '';
  synergyElement.classList.remove('synergy-change');
  if (state.skinPickerSynergyKey !== synergyKey) {
    state.skinPickerSynergyKey = synergyKey;
    if (synergy) { void synergyElement.offsetWidth; synergyElement.classList.add('synergy-change'); }
  }
  const titleElement = document.querySelector('#skin-title-text'), fullComposite = first && second;
  titleElement.textContent = 'СОЗДАЙ ПЛАНЕТУ';
  titleElement.classList.remove('composite-title');
  const previewKey = `${state.selectingPlayer}:${halves[0] ?? '-'}:${halves[1] ?? '-'}`;
  if (state.skinPickerPreviewKey !== previewKey) {
    state.skinPickerPreviewKey = previewKey;
    showcase.classList.remove('skin-change'); void showcase.offsetWidth; showcase.classList.add('skin-change');
  }
  const level = playerLevel();
  options.innerHTML = skinHalfGroups.map((group, halfIndex) => {
    const cards = group.map(i => {
      const skin = ballSkins[i], name = displayName(skin), unlocked = skinIsUnlocked(i, level), selected = halves[halfIndex] === i;
      const label = unlocked ? `<span class="skin-chip-copy"><small>${name}</small><em>${skin.bonusText}</em></span>` : `<span class="skin-chip-copy"><small class="skin-lock-copy" data-glitch="${skinUnlockLabel(i)}">${skinUnlockLabel(i)}</small></span>`;
      return `<button type="button" class="skin-chip skin-half-${halfIndex ? 'right' : 'left'} ${selected ? 'selected' : ''} ${halves.includes(i) ? 'in-composite' : ''} ${unlocked ? '' : 'skin-locked'}" data-skin="${i}" data-half-index="${halfIndex}" aria-pressed="${selected}" aria-label="${unlocked ? `${name}: ${skin.bonusText}` : `${name}, ${skinUnlockLabel(i)}`}" ${unlocked ? '' : 'disabled'}><span class="skin-orb skin-${skin.mark}" style="--orb:${iconColor};--orb-detail:${skin.detail}">${unlocked ? '' : '<i class="skin-lock-mark" aria-hidden="true"></i>'}</span>${label}</button>`;
    }).join('');
    const sectionIcon = halfIndex
      ? '<svg viewBox="0 0 18 18"><path d="m9 1.8 6.2 3.6v7.2L9 16.2l-6.2-3.6V5.4L9 1.8Z"/><circle cx="9" cy="9" r="2.1"/></svg>'
      : '<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="5.8"/><path d="M1.6 11.7c2.4-4 10.4-7.2 14.8-5.4M4.2 14.2l1.2-.4"/></svg>';
    return `<div class="skin-column ${halfIndex ? 'right-half' : 'left-half'} ${halfIndex === focus ? 'focused' : ''}"><div class="skin-column-label"><span class="skin-label-icon" aria-hidden="true">${sectionIcon}</span><span class="skin-label-text">${halfIndex ? 'ЯДРО' : 'ВНЕШНИЙ СЛОЙ'}</span></div>${cards}</div>`;
  }).join('');
  options.querySelectorAll('[data-skin]:not(:disabled)').forEach(button => button.addEventListener('click', () => {
    const player = state.selectingPlayer, halves = state.chosenSkinHalves[player], picked = Number(button.dataset.skin), halfIndex = Number(button.dataset.halfIndex);
    if (halves[halfIndex] === picked) {
      if (state.skinHalfFocus !== halfIndex) { state.skinHalfFocus = halfIndex; renderSkinPicker(); }
      return;
    }
    halves[halfIndex] = picked; state.skinHalfFocus = halfIndex; state.chosenSkins[player] = halves[0] ?? halves[1] ?? picked; sound('select', player);
    renderSkinPicker();
  }));
  const startButton = document.querySelector('#skin-start');
  document.querySelector('.skin-start-row').classList.toggle('local-duel', isLocal);
  startButton.classList.toggle('selecting-blue-body', isLocal && state.selectingPlayer === 0);
  startButton.textContent = isLocal && state.selectingPlayer === 0 ? 'ВЫБРАТЬ ТЕЛО' : 'НАЧАТЬ БИТВУ ПЛАНЕТ';
  startButton.disabled = !hasCompleteSkinSelection(state.selectingPlayer);
  const difficultyPicker = document.querySelector('#ai-difficulty');
  difficultyPicker.classList.toggle('hidden', isLocal);
  if (!isLocal) {
    const unlocked = career.difficultyUnlocked || 0;
    state.aiDifficulty = Math.min(state.aiDifficulty, unlocked);
    const constellations = [
      '<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true"><path d="m18 3 12 9-4 15H8L4 12 18 3Zm0 9 8 6-8 6-8-6 8-6Z"/><path d="m4 12 14 6 12-6M8 27l10-9 8 9"/><circle cx="18" cy="3" r="1.2"/><circle cx="30" cy="12" r="1.2"/><circle cx="26" cy="27" r="1.2"/><circle cx="8" cy="27" r="1.2"/><circle cx="4" cy="12" r="1.2"/><circle cx="18" cy="18" r="1.2"/></svg>',
      '<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true"><path d="m18 2 4 10 10-5-5 10 8 2-9 5 5 9-10-5-3 8-3-10-10 5 5-10-8-3 10-4-5-9 10 5 1-8Z"/><path d="m8 9 20 18M28 9 8 27M3 19l30-2"/><circle cx="18" cy="2" r="1.1"/><circle cx="32" cy="7" r="1.1"/><circle cx="35" cy="19" r="1.1"/><circle cx="30" cy="33" r="1.1"/><circle cx="18" cy="34" r="1.1"/><circle cx="6" cy="32" r="1.1"/><circle cx="2" cy="18" r="1.1"/><circle cx="7" cy="7" r="1.1"/></svg>',
      '<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true"><path d="M18 3 33 29H3L18 3Z"/><path d="M18 3v18M3 29l15-8 15 8"/><circle cx="18" cy="3" r="1.2"/><circle cx="3" cy="29" r="1.2"/><circle cx="33" cy="29" r="1.2"/><circle cx="18" cy="21" r="1.2"/></svg>',
      '<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true"><path d="m18 1 4 10 10-7-6 11 9 3-11 3 7 10-11-6-2 10-3-11-10 7 5-12-9-3 11-3L5 3l11 6 2-8Z"/><path d="m3 15 30 7M5 29 31 7M18 1v34"/><circle cx="18" cy="1" r="1.1"/><circle cx="32" cy="4" r="1.1"/><circle cx="35" cy="18" r="1.1"/><circle cx="31" cy="31" r="1.1"/><circle cx="18" cy="35" r="1.1"/><circle cx="5" cy="31" r="1.1"/><circle cx="1" cy="18" r="1.1"/><circle cx="5" cy="4" r="1.1"/></svg>'
    ];
    difficultyPicker.innerHTML = `<div class="ai-difficulty-heading"><span class="ai-difficulty-label">${aiDifficultyContactLabel(state.aiDifficulty)}</span></div><div class="ai-difficulty-options">${aiDifficulties.map((difficulty, index) => {
      const available = index <= unlocked;
      return `<button type="button" class="ai-difficulty-option ${state.aiDifficulty === index ? 'active' : ''}" data-tier="${index}" data-difficulty="${index}" ${available ? '' : 'disabled'} aria-pressed="${state.aiDifficulty === index}" aria-label="${difficulty.name}${available ? '' : ', откроется после победы на предыдущей сложности'}" title="${available ? difficulty.name : 'Откроется после победы на предыдущей сложности'}"><span class="constellation-mark">${constellations[index]}</span></button>`;
    }).join('')}</div>`;
    difficultyPicker.querySelectorAll('[data-difficulty]:not(:disabled)').forEach(button => button.addEventListener('click', () => {
      state.aiDifficulty = Number(button.dataset.difficulty); sound('select', 1);
      difficultyPicker.querySelectorAll('[data-difficulty]').forEach(option => { const active = Number(option.dataset.difficulty) === state.aiDifficulty; option.classList.toggle('active', active); option.setAttribute('aria-pressed', String(active)); });
      difficultyPicker.querySelector('.ai-difficulty-label').innerHTML = aiDifficultyContactLabel(state.aiDifficulty);
    }));
  }
}

function confirmSkinSelection() {
  const player = state.selectingPlayer;
  if (!hasCompleteSkinSelection(player)) return;
  state.chosenSkins[player] = state.chosenSkinHalves[player][0] ?? state.chosenSkinHalves[player][1] ?? state.chosenSkins[player];
  if (state.mode === 'ai') { beginRun(); return; }
  state.skinConfirmed[player] = true;
  if (player === 0) { state.selectingPlayer = 1; state.skinHalfFocus = 0; renderSkinPicker(); return; }
  beginRun();
}

function moveSkinSelection(delta) {
  const level = playerLevel(), open = skinHalfGroups[state.skinHalfFocus].filter(index => skinIsUnlocked(index, level));
  if (!open.length) return;
  const player = state.selectingPlayer, halves = state.chosenSkinHalves[player], current = open.indexOf(halves[state.skinHalfFocus]);
  halves[state.skinHalfFocus] = open[(Math.max(0, current) + delta + open.length) % open.length]; state.chosenSkins[player] = halves[0] ?? halves[1];
  sound('select', player); renderSkinPicker();
}

function beginRun(mode = state.mode) {
  state.tutorial = null;
  clearTimeout(state.startDuelTimer); state.startDuelTimer = 0;
  state.zooMode = false; state.mode = mode; state.players = [makePlayer(0), makePlayer(1)]; state.campaignWins = [0, 0]; state.duelsPlayed = 0; state.matchScore = [0, 0]; state.matchWinner = null; state.sessionRoundWins = 0; state.sessionXp = 0; state.careerRecorded = false;
  state.shots = []; state.particles = []; state.spawnClock = 2.4;
  showUpgradePhase(true);
}

function startDuel() {
  if (!state.zooMode && state.phase !== 'upgrade') return;
  clearTimeout(state.startDuelTimer); state.startDuelTimer = 0;
  state.duelsPlayed++; state.matchScore = [0, 0];
  state.nextServeOwner = null;
  state.players[0].x = W / 2; state.players[0].y = H * .83; state.players[0].targetX = W / 2; state.players[0].targetY = H * .83;
  state.players[1].x = W / 2; state.players[1].y = H * .17; state.players[1].targetX = W / 2; state.players[1].targetY = H * .17;
  document.querySelector('#duel-number').textContent = partyLabel(state.duelsPlayed); switchScreen('battle'); startRound();
}

function partyLabel(number) {
  if (Math.max(...state.campaignWins) === 4) return 'РЕШАЮЩАЯ ПАРТИЯ';
  return ['ПЕРВАЯ ПАРТИЯ', 'ВТОРАЯ ПАРТИЯ', 'ТРЕТЬЯ ПАРТИЯ', 'ЧЕТВЁРТАЯ ПАРТИЯ', 'ПЯТАЯ ПАРТИЯ'][Math.max(0, Math.min(4, number - 1))];
}

function startRound() {
  clearTimeout(state.continueTimer); state.continueTimer = 0;
  state.mobileMoveAxis = [{ x: 0, y: 0 }, { x: 0, y: 0 }]; state.stickPointers = [null, null];
  state.phase = 'battle';
  syncMusic('battle');
  document.querySelector('#battle').classList.toggle('local-player-two-view', state.mode === 'pvp' && (state.matchScore[0] + state.matchScore[1]) % 2 === 1 && window.matchMedia('(max-width:700px) and (orientation: portrait) and (pointer: coarse)').matches);
  state.players.forEach(player => {
    const extraLife = planetBonusStrength(player, 'extraLife');
    const lifeCount = extraLife > 0 ? 4 : 3;
    player.shieldBars = Array(lifeCount).fill(true); player.shieldTimers = Array(lifeCount).fill(0); player.shieldLayerHits = Array(lifeCount).fill(1 + statsFor(player).plateLayers); player.cornerGuards = Array(2).fill(statsFor(player).cornerGuards); player.armor = statsFor(player).armor; player.lostArmor = false; player.orbReady = true; player.chargeTimer = 0; player.bonusSpeed = 0; player.bonusPower = 0; player.deflectGrow = 0; player.deflectGrowTimer = 0; player.deflectionsForNode = 0; player.moonSlowTimer = 0; player.facingAngle = player.index ? Math.PI / 2 : -Math.PI / 2;
    player.x = W / 2; player.y = player.index ? H * .17 : H * .83; player.previousX = player.x; player.previousY = player.y; player.targetX = player.x; player.targetY = player.y; player.charges = statsFor(player).chargeMax; player.guardTrail = []; player.guardTrailCooldown = 0;
    const startStats = statsFor(player);
    const permanentMoons = Math.min(4, player.permanentMoons || 0), regularMoons = Math.min(startStats.satellites, 4 - permanentMoons);
    player.satellites = Array.from({ length: regularMoons + permanentMoons }, () => true); player.satelliteTimers = Array(player.satellites.length).fill(0); player.satelliteHits = Array(player.satellites.length).fill(1 + startStats.satelliteIntercept); player.moonInvulnerable = player.satellites.map((_, index) => index >= regularMoons); player.spawnMoonSlot = null; player.spawnMoonAppear = 0;
  });
  state.chargeNodes = []; state.blockNodes = []; state.nodeSpawnTimers = [.85, .85]; state.blockSpawnTimers = [1.3, 1.3];
  state.orbitTime = 0;
  for (const player of state.players) { player.moonPositions = []; }
  state.shots = []; state.pendingShots = []; state.shotImpacts = []; state.slowFields = []; state.tapMarks = []; state.particles = []; state.spawnClock = 1.5; state.hitstop = 0; state.shake = 0; arenaWrap.style.transform = ''; canvas.style.transform = 'scale(1)'; state.running = true;
  state.roundIntro = 2.4;
  state.serveOwner = state.nextServeOwner ?? (state.mode === 'ai' ? 0 : (Math.random() < .5 ? 0 : 1));
  state.nextServeOwner = null;
  state.aiServeDirection = Math.random() < .5 ? -1 : 1;
  state.serveAngle = 0; state.serveAimPointer = null;
  state.serveBall = createPongBall(state.serveOwner, .24, 0);
  state.finalBreach = null;
  prepareFirstRoundHint();
  document.querySelector('#curtain').classList.add('hidden');
  const roundIntro = document.querySelector('#round-intro');
  roundIntro.classList.toggle('intro-red', state.serveOwner === 1);
  roundIntro.classList.toggle('intro-blue', state.serveOwner === 0);
  const introTitle = document.querySelector('#round-intro strong');
  introTitle.textContent = state.duelsPlayed === 1 ? 'ДА НАЧНЕТСЯ БИТВА!' : partyLabel(state.duelsPlayed);
  introTitle.innerHTML = introTitle.textContent.split(' ').map((word, wordIndex) => `<span class="round-title-word">${[...word].map((letter, index) => `<span style="--letter-index:${wordIndex * 20 + index}">${letter}</span>`).join('')}</span>`).join(' ');
  roundIntro.classList.remove('hidden');
  resizeCanvas(); state.lastTime = performance.now(); requestAnimationFrame(loop);
}

function fieldFor(index) { const pad = playerRadius(state.players[index] || { cards: {} }) + 8; return index === 0 ? { minY: MID + pad, maxY: H - 34 - pad } : { minY: 34 + pad, maxY: MID - pad }; }
function clampTarget(index, x, y) {
  const player = state.players[index], fallbackX = Number.isFinite(player?.x) ? player.x : W / 2, fallbackY = Number.isFinite(player?.y) ? player.y : (index ? H * .17 : H * .83);
  const safeX = Number.isFinite(x) ? x : fallbackX, safeY = Number.isFinite(y) ? y : fallbackY, radius = playerRadius(player || { cards: {} }), field = fieldFor(index);
  return { x: Math.max(30 + radius, Math.min(W - 30 - radius, safeX)), y: Math.max(field.minY, Math.min(field.maxY, safeY)) };
}
function activeChillRank(player, rank = statsFor(player).chillAura) {
  if (!rank) return 0;
  return state.shots.some(ball => ball.owner === player.index && !(ball.serveTimer > 0)) ? rank : 0;
}

function inChillCone(source, target, rank) {
  const dx = target.x - source.x, dy = target.y - source.y, distance = Math.hypot(dx, dy);
  if (distance > chillConeRange) return false;
  const delta = Math.atan2(Math.sin(Math.atan2(dy, dx) - source.facingAngle), Math.cos(Math.atan2(dy, dx) - source.facingAngle));
  return Math.abs(delta) < chillConeHalfAngle(rank);
}
function playerRadius(player) {
  const s = statsFor(player), activeMoons = player.satellites?.filter(Boolean).length || 0;
  return Math.max(11, 19 + s.planetSize - s.smallBody * 3 + (player.deflectGrow || 0) + (hasSynergy(player, 'moonGrowth') ? activeMoons * 3 : 0));
}

function grantDeflectionEffects(player) {
  if (!player) return;
  const stats = statsFor(player);
  if (hasSynergy(player, 'deflectSpeed')) player.reflectBoostTimer = Math.max(player.reflectBoostTimer || 0, 2.1);
  if (hasSynergy(player, 'plateOnDeflect')) {
    player.wardRegenBoost = Math.max(player.wardRegenBoost || 0, 2.4);
    player.shieldTimers = player.shieldTimers.map(timer => timer > 0 ? Math.max(.001, timer - .85) : 0);
  }
  if (hasSynergy(player, 'wallMoonRegen')) {
    player.satelliteTimers = player.satelliteTimers.map(timer => timer > 0 ? Math.max(.001, timer - 1.15) : timer);
  }
  if (planetBonusStrength(player, 'deflectMoon') > 0 && player.satellites.filter(Boolean).length < 4) {
    player.deflectionsForMoon = (player.deflectionsForMoon || 0) + 1;
    if (player.deflectionsForMoon >= 8) {
      player.deflectionsForMoon -= 8;
      let slot = player.satellites.findIndex(alive => !alive);
      if (slot < 0) {
        slot = player.satellites.length;
        player.satellites.push(true); player.satelliteTimers.push(0);
        player.satelliteHits.push(1 + stats.satelliteIntercept); player.moonInvulnerable.push(true);
      } else {
        player.satellites[slot] = true; player.satelliteTimers[slot] = 0;
        player.satelliteHits[slot] = 1 + stats.satelliteIntercept; player.moonInvulnerable[slot] = true;
      }
      player.permanentMoons = Math.min(4, (player.permanentMoons || 0) + 1);
      player.spawnMoonSlot = slot; player.spawnMoonAppear = .38;
      const position = satelliteTarget(player, slot, state.orbitTime || 0);
      state.shotImpacts.push({ x: position.x, y: position.y, life: .5, max: .5, moonFlash: true, color: player.index ? '#ffb56b' : '#9ee6ff' });
      burst(position.x, position.y, player.index ? '#ffb56b' : '#9ee6ff', 16); sound('spawn', player.index);
    }
  }
  if (stats.deflectSource > 0) {
    player.deflectionsForNode = (player.deflectionsForNode || 0) + 1;
    const threshold = deflectSourceThreshold(stats.deflectSource);
    if (player.deflectionsForNode >= threshold) {
      player.deflectionsForNode -= threshold;
      const y = player.index ? H * (.29 + Math.random() * .08) : H * (.63 + Math.random() * .08);
      spawnChargeNode(player.index, W * (.18 + Math.random() * .64), y);
    }
  }
  if (stats.deflectGrowth > 0) {
    player.deflectGrow = Math.min(32, (player.deflectGrow || 0) + stats.deflectGrowth);
    player.deflectGrowTimer = .48;
  }
}

function sweptCircleEntry(startX, startY, deltaX, deltaY, radius) {
  const c = startX * startX + startY * startY - radius * radius;
  if (c <= 0) return 0;
  const a = deltaX * deltaX + deltaY * deltaY;
  if (a < 1e-8) return null;
  const b = 2 * (startX * deltaX + startY * deltaY), discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;
  const entry = (-b - Math.sqrt(discriminant)) / (2 * a);
  return entry >= 0 && entry <= 1 ? entry : null;
}
function segmentRectEntry(x1, y1, x2, y2, left, top, right, bottom) {
  const dx = x2 - x1, dy = y2 - y1;
  let min = 0, max = 1;
  for (const [p, q] of [[-dx, x1 - left], [dx, right - x1], [-dy, y1 - top], [dy, bottom - y1]]) {
    if (Math.abs(p) < 1e-8) { if (q < 0) return null; continue; }
    const t = q / p;
    if (p < 0) min = Math.max(min, t); else max = Math.min(max, t);
    if (min > max) return null;
  }
  return min;
}
function keyboardAxis(index) {
  const keys = state.keys;
  if (index === 0) return { x: Number(keys.has('KeyD')) - Number(keys.has('KeyA')), y: Number(keys.has('KeyS')) - Number(keys.has('KeyW')) };
  if (state.mode !== 'pvp') return { x: 0, y: 0 };
  return { x: Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft')), y: Number(keys.has('ArrowDown')) - Number(keys.has('ArrowUp')) };
}

function launchPlanet(index, target, pull) {
  const player = state.players[index];
  if (!player || !player.orbReady || player.charges < 1) return;
  const from = { x: player.x, y: player.y };
  const dx = target.x - from.x, dy = target.y - from.y;
  player.facingAngle = Math.atan2(dy, dx);
  const power = Math.min(1, Math.max(.12, pull / 520));
  state.pendingShots.push({ owner: index, from, target, power, timer: .42 });
  player.charges--; player.orbReady = player.charges > 0;
  if (player.charges < statsFor(player).chargeMax && player.chargeTimer <= 0) player.chargeTimer = statsFor(player).cooldown;
  state.shake = Math.max(state.shake, 3.4); pulseArena('shot-fired'); burst(from.x, from.y, index ? '#ff382f' : '#159ff2', 14); vibrate(12);
}

function releasePendingShot(pending) {
  const { owner, from, target, power } = pending, player = state.players[owner], s = statsFor(player);
  const dx = target.x - from.x, dy = target.y - from.y, direction = Math.atan2(dy, dx);
  player.facingAngle = direction;
  const speed = (s.shotSpeed * (.64 + power * .3) + s.launchSpeed * .42 + player.bonusSpeed) * (1 + s.launchRate);
  const radius = 18 + s.shotSize + player.bonusPower + Math.round(power * 4);
  const ball = { x: from.x, y: from.y, vx: Math.cos(direction) * speed, vy: Math.sin(direction) * speed, owner, radius: radius * .68, baseRadius: radius, serveTimer: 0, launchTimer: .22, bounce: s.bounce, pierce: Math.floor(s.pierce), phase: s.phase, impact: s.impact, clashBlast: s.clashBlast, midGrowth: s.midGrowth, wallField: s.wallField, cometTrail: s.cometTrail, cometTimer: 0, maxAge: 16, age: 0, travelled: 0, trail: [], trailLimit: s.cometTrail ? 9 + Math.floor(s.cometTrail) * 5 : 9 };
  ball.shotSize = s.shotSize;
  state.shots.push(ball);
  repairShieldLayers(player, s.sourceRepair + (hasSynergy(player, 'sourceRepair') ? 1 : 0));
  player.bonusSpeed = 0; player.bonusPower = 0; burst(from.x, from.y, owner ? '#ff382f' : '#159ff2', 14); sound('throw', owner);
}

function movePlayer(index, x, y) {
  const player = state.players[index]; if (!player) return;
  const target = clampTarget(index, x, y), dx = target.x - player.x, dy = target.y - player.y;
  player.targetX = target.x; player.targetY = target.y;
  if (Math.hypot(dx, dy) > 8) player.facingAngle = Math.atan2(dy, dx);
}

function loop(now) {
  if (!state.running) return;
  const raw = Math.max(0, Math.min((now - state.lastTime) / 1000, .035)); state.lastTime = now; updateShotImpacts(raw);
  state.hitstop = Math.max(0, state.hitstop - raw); const dt = state.hitstop > 0 ? raw * .08 : raw;
  try { update(dt, raw, now); } catch (error) { console.error('PLΛNETS update failed; keeping the round visible.', error); }
  drawFrameSafely();
  if (!state.running && state.finalBreach) return;
  state.shake = Math.max(0, state.shake - raw * 30);
  if (state.shake > 0) {
    arenaWrap.style.transform = `translate(${(Math.random() - .5) * state.shake}px, ${(Math.random() - .5) * state.shake}px)`;
  } else if (arenaWrap.style.transform) arenaWrap.style.transform = '';
  if (state.running) requestAnimationFrame(loop);
}

function createPongBall(server, delay = .55, angle = (Math.random() - .5) * .32) {
  const direction = server === 0 ? -1 : 1, s = statsFor(state.players[server]), speed = (315 + (s.shotSpeed + s.launchSpeed) * .28) * (1 + s.launchRate);
  const ball = { x: W / 2, y: MID, vx: Math.sin(angle) * speed, vy: Math.cos(angle) * speed * direction, owner: server, radius: Math.max(8, 9 + s.shotSize * .55), baseRadius: Math.max(8, 9 + s.shotSize * .55), serveTimer: delay, serveDuration: delay, age: 0, trail: [], trailLimit: 12, wallBounces: 0, openingServe: state.roundIntro > 0 };
  attuneBall(ball, server); state.shots.push(ball);
  spawnBallEffect(W / 2, MID, server, .08);
  return ball;
}

function setOpeningServeAngle(angle) {
  if (!state.serveBall || state.roundIntro <= 0) return;
  state.serveAngle = Math.max(-.62, Math.min(.62, angle));
  const direction = state.serveOwner === 0 ? -1 : 1, speed = Math.hypot(state.serveBall.vx, state.serveBall.vy);
  state.serveBall.vx = Math.sin(state.serveAngle) * speed;
  state.serveBall.vy = Math.cos(state.serveAngle) * speed * direction;
}

function updateOpeningServeAim() {
  const player = state.players[state.serveOwner], ball = state.serveBall;
  if (!player || !ball || state.roundIntro <= 0) return;
  const approach = Math.max(0, Math.min(1, (250 - Math.abs(player.y - ball.y)) / 190));
  const horizontal = Math.max(-.58, Math.min(.58, (ball.x - player.x) / 84 * approach));
  setOpeningServeAngle(Math.asin(horizontal));
}

function moveOpeningServer(dt) {
  const player = state.players[state.serveOwner];
  if (!player) return;
  if (state.mode === 'ai' && player.index === 1) {
    const target = clampTarget(player.index, W / 2 - state.aiServeDirection * 66, MID - 35);
    player.targetX = target.x; player.targetY = target.y;
  } else {
    const touch = state.mobileMoveAxis[player.index], keys = keyboardAxis(player.index);
    const axis = Math.hypot(touch.x, touch.y) > .08 ? touch : keys, length = Math.hypot(axis.x, axis.y);
    if (length > .08) {
    const stats = statsFor(player);
    player.targetX += axis.x / length * stats.moveSpeedX * dt;
    player.targetY += axis.y / length * stats.moveSpeedY * dt;
    const target = clampTarget(player.index, player.targetX, player.targetY);
    player.targetX = target.x; player.targetY = target.y;
    }
  }
  const dx = player.targetX - player.x, dy = player.targetY - player.y;
  const travelTime = Math.hypot(dx / statsFor(player).moveSpeedX, dy / statsFor(player).moveSpeedY);
  const ratio = travelTime > dt ? dt / travelTime : 1;
  player.x += dx * ratio; player.y += dy * ratio;
  const target = clampTarget(player.index, player.x, player.y);
  player.x = target.x; player.y = target.y;
  if (Math.hypot(dx, dy) > 1) player.facingAngle = Math.atan2(state.serveBall.y - player.y, state.serveBall.x - player.x);
  player.vx = dx * ratio / Math.max(dt, .001); player.vy = dy * ratio / Math.max(dt, .001);
  updateOpeningServeAim();
}

function moveOpeningOpponent(dt) {
  const index = 1 - state.serveOwner, player = state.players[index];
  if (!player) return;
  const stats = statsFor(player);
  if (state.mode === 'ai' && index === 1) {
    const ball = state.serveBall, targetY = H * .25;
    const timeToLine = ball && Math.abs(ball.vy) > 80 ? Math.max(0, Math.min(1.5, (targetY - ball.y) / ball.vy)) : 0;
    const minX = 34 + playerRadius(player), maxX = W - minX, span = maxX - minX;
    let projectedX = ball ? ball.x + ball.vx * timeToLine : W / 2;
    const foldedX = ((projectedX - minX) % (span * 2) + span * 2) % (span * 2);
    if (foldedX > span) projectedX = maxX - (foldedX - span); else projectedX = minX + foldedX;
    const blend = Math.min(1, dt * (aiDifficulties[state.aiDifficulty]?.reaction || 1.5) * 1.35);
    player.targetX += (projectedX - player.targetX) * blend;
    player.targetY += (targetY - player.targetY) * blend;
  } else {
    const touch = state.mobileMoveAxis[index], keys = keyboardAxis(index);
    const axis = Math.hypot(touch.x, touch.y) > .08 ? touch : keys, length = Math.hypot(axis.x, axis.y);
    if (length > .08) {
      player.targetX += axis.x / length * stats.moveSpeedX * dt;
      player.targetY += axis.y / length * stats.moveSpeedY * dt;
    }
  }
  const target = clampTarget(index, player.targetX, player.targetY);
  player.targetX = target.x; player.targetY = target.y;
  const dx = player.targetX - player.x, dy = player.targetY - player.y;
  const travelTime = Math.hypot(dx / stats.moveSpeedX, dy / stats.moveSpeedY), ratio = travelTime > dt ? dt / travelTime : 1;
  player.x += dx * ratio; player.y += dy * ratio;
  const position = clampTarget(index, player.x, player.y);
  player.x = position.x; player.y = position.y;
  player.vx = dx * ratio / Math.max(dt, .001); player.vy = dy * ratio / Math.max(dt, .001);
  if (Math.hypot(dx, dy) > 1) player.facingAngle = Math.atan2(state.serveBall.y - player.y, state.serveBall.x - player.x);
}

function spawnBallEffect(x, y, owner, delay = 0) {
  state.shotImpacts.push({ x, y, angle: 0, life: .48, max: .48, delay, spawned: false, spawn: true, owner, color: owner ? '#ff7770' : '#69caff' });
}

function returnBall(ball, player, contact) {
  if (player.index === 0 && state.tutorial) state.tutorial.deflected = true;
  const s = statsFor(player);
  const motion = Math.max(-1, Math.min(1, player.vx * contact.nx / s.moveSpeedX + player.vy * contact.ny / s.moveSpeedY));
  const offset = Math.max(-.94, Math.min(.94, contact.nx + motion * .18));
  const angle = offset * 1.12 + motion * .12;
  grantDeflectionEffects(player);
  const missingPlates = Math.max(0, coreShieldCount(player) - (player.shieldLayerHits || []).filter(value => value > 0).length);
  const forward = player.index ? 1 : -1;
  const hitFromBehind = contact.ny * forward < -.18;
  const lastLight = s.lastLight * missingPlates / Math.max(1, coreShieldCount(player));
  const speed = Math.min(hitFromBehind ? 920 : 760, (Math.hypot(ball.vx, ball.vy) + 6 + s.shotSpeed * .05 + player.bonusSpeed) * (1 + lastLight) * (1 + s.impact) * (hitFromBehind ? 1.22 : 1));
  ball.vx = Math.sin(angle) * speed; ball.vy = (player.index === 0 ? -1 : 1) * Math.cos(angle) * speed;
  ball.age = 0; ball.travelled = 0; ball.serveTimer = 0; ball.trail = []; ball.shotScale = 1 + player.bonusPower / Math.max(8, 9 + s.shotSize * .55); ball.baseRadius = Math.max(8, 9 + s.shotSize * .55) * ball.shotScale; ball.radius = ball.baseRadius; ball.fireTimer = hitFromBehind ? .9 : 0; ball.fireOwner = hitFromBehind ? player.index : null;
  attuneBall(ball, player.index, false);
  const radius = playerRadius(player);
  const exitAngle = hitFromBehind ? Math.atan2(ball.vy, ball.vx) : Math.atan2(contact.ny, contact.nx);
  const reach = radius + collisionShotRadius(ball) + 2;
  ball.x = player.x + Math.cos(exitAngle) * reach;
  ball.y = player.y + Math.sin(exitAngle) * reach;
  ball.ignorePlayer = player.index; ball.ignoreTimer = .16;
  player.passFlash = hitFromBehind ? .34 : 0;
  player.passAngle = exitAngle;
  player.bonusSpeed = 0; player.bonusPower = 0; player.facingAngle = player.index ? Math.PI / 2 : -Math.PI / 2;
  const color = hitFromBehind ? '#ffad57' : lastLight > 0 ? '#ffe19a' : player.index ? '#ff7770' : '#69caff';
  contactCue(contact, color, hitFromBehind ? .3 : .19, hitFromBehind ? 'pass' : 'return');
  if (hitFromBehind) burst(ball.x, ball.y, color, 8);
  state.shake = Math.max(state.shake, hitFromBehind ? 3 : 1.7);
  state.hitstop = Math.max(state.hitstop, hitFromBehind ? .05 : .03);
  pulseArena('return', player.index); sound('planetHit', player.index); vibrate(hitFromBehind ? 12 : 8);
}

function collisionShotRadius(ball) {
  const shrink = 1 - (ball.midGrowth || 0) * Math.min(1, (ball.travelled || 0) / 700);
  return Math.max(5, Math.min(30, (ball.baseRadius || ball.radius) * shrink));
}

function attuneBall(ball, owner, transferBoost = true) {
  const previousOwner = ball.owner, oldStats = state.players[previousOwner] ? statsFor(state.players[previousOwner]) : null, s = statsFor(state.players[owner]);
  const sizeScale = Number.isFinite(ball.shotScale) ? ball.shotScale : 1;
  const ownerChanged = previousOwner !== owner && oldStats && ball.serveTimer <= 0;
  if (ownerChanged && transferBoost) {
    const speed = Math.hypot(ball.vx, ball.vy), bonus = Math.max(0, s.shotSpeed + s.launchSpeed - oldStats.shotSpeed - oldStats.launchSpeed) * .16 + speed * s.impact * .08;
    if (speed > 0 && bonus > 0) { const next = Math.min(760, speed + bonus); ball.vx *= next / speed; ball.vy *= next / speed; }
  }
  ball.shotScale = sizeScale; ball.baseRadius = Math.max(8, 9 + s.shotSize * .55) * sizeScale;
  ball.radius = Math.min(30, Math.max(5, ball.baseRadius));
  ball.owner = owner; ball.phase = s.phase; ball.pierce = s.pierce;
  ball.midGrowth = s.midGrowth; ball.cometTrail = s.cometTrail; ball.cometTimer = 0;
  ball.shotSize = s.shotSize;
  ball.clashBlast = s.clashBlast; ball.wallField = s.wallField; ball.bounce = s.bounce;
  if (ownerChanged) {
    ball.travelled = 0;
    if (ball.fireOwner !== owner) ball.fireTimer = 0;
  }
}

function coreShieldCount(player) { return planetBonusStrength(player, 'extraLife') > 0 ? 4 : 3; }
const guardGeometryCache = new WeakMap();
function guardGeometry(player) {
  const stats = statsFor(player);
  const cached = guardGeometryCache.get(player);
  if (cached && cached.stats === stats && cached.arenaWidth === W) return cached;
  const extraLife = planetBonusStrength(player, 'extraLife');
  const count = extraLife > 0 ? 4 : 3;
  const gap = 8;
  const clearance = stats.cornerGuards ? Math.min(78, W * .22) : 0;
  const availableWidth = W - clearance * 2 - (count - 1) * gap;
  const naturalWidth = (count > 3 ? 88 : 120) + stats.barrierWidth;
  const widthMultiplier = 1 - layerWidthPenalty(stats.plateLayers);
  const slots = [];
  let totalWidth = 0;
  for (let slot = 0; slot < count; slot++) {
    const lifeScale = slot === 3 ? Math.max(.38, extraLife) : 1;
    const width = Math.max(34, Math.min(naturalWidth * lifeScale, availableWidth / count) * widthMultiplier);
    slots.push({ width, precedingWidth: totalWidth });
    totalWidth += width;
  }
  totalWidth += (count - 1) * gap;
  const geometry = { stats, arenaWidth: W, slots, gap, clearance, totalWidth };
  guardGeometryCache.set(player, geometry);
  return geometry;
}
function guardLeft(player, geometry, playerX = player.x) {
  const { clearance, totalWidth } = geometry;
  return Math.max(clearance, Math.min(W - clearance - totalWidth, playerX - totalWidth / 2));
}
function guardSlotCenter(left, geometry, slot) {
  const { width, precedingWidth } = geometry.slots[slot];
  return left + precedingWidth + slot * geometry.gap + width / 2;
}
function shieldRestoreDuration(player) {
  const { wardRegen, plateLayers } = statsFor(player);
  return Math.max(3.5, 6.5 - wardRegen * 1.25)
    + layerRecoveryPenalty(plateLayers);
}
function guardBarCenter(player, slot) {
  const geometry = guardGeometry(player);
  return guardSlotCenter(guardLeft(player, geometry), geometry, slot);
}
function guardBarAt(player, x, radius = 0, playerX = player.x) {
  // A tiny hidden collision lip makes near-edge catches feel consistent without
  // changing the visible width of the protective plates.
  const edgeForgiveness = 4;
  const geometry = guardGeometry(player);
  const left = guardLeft(player, geometry, playerX);
  for (let slot = 0; slot < player.shieldBars.length; slot++) {
    if (!player.shieldBars[slot] || !(player.shieldLayerHits?.[slot] > 0)) continue;
    const center = guardSlotCenter(left, geometry, slot);
    if (Math.abs(x - center) <= geometry.slots[slot].width / 2 + radius + edgeForgiveness) return slot;
  }
  return -1;
}
function shieldLineCrossing(ball, fromX, fromY, toX, toY) {
  const candidates = [
    { player: state.players[1], direction: -1, line: 48 + ball.radius },
    { player: state.players[0], direction: 1, line: H - 48 - ball.radius }
  ];
  for (const { player, direction, line } of candidates) {
    if (!player || ball.vy * direction <= 0) continue;
    const crossed = direction < 0 ? fromY >= line && toY <= line : fromY <= line && toY >= line;
    if (!crossed) continue;
    const t = Math.max(0, Math.min(1, (line - fromY) / (toY - fromY)));
    return {
      player,
      t,
      x: fromX + (toX - fromX) * t,
      playerX: player.previousX + (player.x - player.previousX) * t,
      y: line
    };
  }
  return null;
}
function satelliteTarget(player, index, now) {
  const stats = statsFor(player), count = Math.max(1, player.satellites.length), angle = now * .001 * (1 + stats.orbitSpeed * .6) + index * Math.PI * 2 / count;
  const orbit = 54 + stats.orbitRadius + Math.max(0, playerRadius(player) - 19);
  const linkedNode = hasSynergy(player, 'moonSources') && index === player.satellites.findIndex(Boolean)
    ? state.chargeNodes.find(node => node.owner === player.index && node.moonLinked) : null;
  const anchor = linkedNode || player, lunarOrbit = linkedNode ? 18 + stats.satelliteSize * .55 : orbit;
  let x = anchor.x + Math.cos(angle) * lunarOrbit, y = anchor.y + Math.sin(angle) * lunarOrbit;
  if (stats.moonAttraction) {
    let nearest = null, nearestDistance = 190;
    for (const shot of state.shots) {
      if (shot.owner === player.index || shot.serveTimer > 0) continue;
      const distance = Math.hypot(shot.x - x, shot.y - y);
      if (distance < nearestDistance) { nearest = shot; nearestDistance = distance; }
    }
    if (nearest) {
      const pull = stats.moonAttraction * (1 - nearestDistance / 190);
      x += (nearest.x - x) * pull; y += (nearest.y - y) * pull;
    }
  }
  return { x, y };
}
function satelliteRadius(player) {
  return 6 + statsFor(player).satelliteSize;
}
function moonRestoreDuration(player) {
  return lunarRecoveryTime(statsFor(player).satelliteRegen);
}
function satellitePosition(player, index) {
  return player.moonPositions?.[index] || satelliteTarget(player, index, state.orbitTime || 0);
}
function advanceOrbitGuards(player, dt) {
  if (!player.satellites.length) return;
  const time = state.orbitTime;
  const previousMoons = player.moonPositions || [];
  const minimumMoonReach = player.satellites.length ? playerRadius(player) + satelliteRadius(player) + 5 : 0;
  player.previousMoonPositions = previousMoons;
  player.moonPositions = player.satellites.map((_, index) => {
    const goal = satelliteTarget(player, index, time);
    const previous = previousMoons[index];
    const startX = previous ? previous.x + player.x - player.previousX : goal.x;
    const startY = previous ? previous.y + player.y - player.previousY : goal.y;
    const step = Math.min(1, dt * 300 / Math.max(1, Math.hypot(goal.x - startX, goal.y - startY)));
    const dx = startX + (goal.x - startX) * step - player.x;
    const dy = startY + (goal.y - startY) * step - player.y;
    const distance = Math.hypot(dx, dy);
    const reach = Math.max(distance, minimumMoonReach);
    const angle = distance > .01 ? Math.atan2(dy, dx) : time * .001 + index;
    return { x: player.x + Math.cos(angle) * reach, y: player.y + Math.sin(angle) * reach };
  });
}

function firstBodyContact(ball, startX, startY, frameFraction) {
  let first = null;
  const deltaX = ball.x - startX, deltaY = ball.y - startY;
  function consider(player, from, to, radius, type, slot) {
    const x = startX - from.x, y = startY - from.y;
    const travelX = (to.x - from.x) * frameFraction, travelY = (to.y - from.y) * frameFraction;
    const dx = deltaX - travelX, dy = deltaY - travelY;
    const reach = radius + ball.radius;
    if (type === 'planet') {
      const distanceSquared = x * x + y * y;
      if (ball.piercedPlayer === player.index) {
        if (distanceSquared <= reach ** 2) return;
        ball.piercedPlayer = null;
      }
      const leaving = x * dx + y * dy >= 0;
      const justDeflected = player.index === ball.ignorePlayer && ball.ignoreTimer > 0;
      if (leaving && (justDeflected || player.index === ball.owner) && distanceSquared <= (reach + 3) ** 2) return;
    }
    const time = sweptCircleEntry(x, y, dx, dy, reach);
    if (time === null || (first && time >= first.time)) return;
    const normalX = x + dx * time, normalY = y + dy * time;
    const angle = Math.hypot(normalX, normalY) > .001 ? Math.atan2(normalY, normalX) : Math.atan2(-dy, -dx);
    const nx = Math.cos(angle), ny = Math.sin(angle);
    const centerX = from.x + travelX * time, centerY = from.y + travelY * time;
    first = { player, type, slot, time, nx, ny, travelX, travelY, x: centerX + nx * radius, y: centerY + ny * radius };
  }
  for (const player of state.players) {
    if (player.index !== ball.owner && !ball.phase && !(ball.pierce > 0)) {
      player.satellites.forEach((alive, slot) => {
        if (!alive) return;
        const to = satellitePosition(player, slot);
        consider(player, player.previousMoonPositions?.[slot] || to, to, satelliteRadius(player), 'moon', slot);
      });
    }
    consider(player, { x: player.previousX, y: player.previousY }, player, playerRadius(player) + 2, 'planet');
  }
  return first;
}

function contactCue(contact, color, life, kind) {
  const { x, y, nx, ny } = contact;
  state.shotImpacts.push({ x, y, nx, ny, color, life, max: life, contactKind: kind });
  burst(contact.x, contact.y, color, kind === 'break' ? 16 : 7);
}

function interceptWithGuard(ball, contact, travelTime) {
  const { player, type, slot, nx, ny, x, y } = contact;
  const isMoon = type === 'moon', color = player.index ? '#ff7770' : '#69caff';
  const attacker = state.players[ball.owner];
  if (isMoon && hasSynergy(attacker, 'moonFlash')) {
    player.moonSlowTimer = Math.max(player.moonSlowTimer || 0, 1.5);
    state.shotImpacts.push({ x, y, life: .32, max: .32, moonFlash: true, color: attacker.index ? '#ff7770' : '#69caff' });
  }
  const protectedMoon = isMoon && Boolean(player.moonInvulnerable?.[slot]);
  if (isMoon && !protectedMoon) player.satelliteHits[slot]--;
  const broken = !isMoon || (!protectedMoon && player.satelliteHits[slot] <= 0);
  if (broken) {
    if (isMoon) {
      player.satellites[slot] = false;
      player.satelliteTimers[slot] = moonRestoreDuration(player);
    }
  }
  grantDeflectionEffects(player);
  if (isMoon && hasSynergy(player, 'moonSource') && state.chargeNodes.filter(node => node.owner === player.index).length < 3) {
    const sourceY = player.index ? H * (.26 + Math.random() * .08) : H * (.66 + Math.random() * .08);
    spawnChargeNode(player.index, Math.max(W * .12, Math.min(W * .88, x)), sourceY);
  }
  if (isMoon && hasSynergy(player, 'moonRepair')) repairShieldLayers(player, 1);
  if (isMoon && hasSynergy(player, 'moonCharge')) {
    const nearest = state.chargeNodes.filter(node => node.owner === player.index)
      .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    if (nearest) {
      nearest.charge = Math.min(1, nearest.charge + .34);
      contactCue({ x: nearest.x, y: nearest.y, nx: 0, ny: -1 }, color, .28, 'restore');
    }
  }
  const guardSpeed = Math.max(-140, Math.min(140, (contact.travelX * nx + contact.travelY * ny) / Math.max(.001, travelTime)));
  const radial = ball.vx * nx + ball.vy * ny - guardSpeed * .4;
  const forward = player.index ? 1 : -1;
  const reflectedX = ball.vx - 2 * Math.min(0, radial) * nx;
  const reflectedY = ball.vy - 2 * Math.min(0, radial) * ny;
  const angle = Math.max(-1.15, Math.min(1.15, Math.atan2(reflectedX, Math.max(180, reflectedY * forward))));
  const speed = Math.max(220, Math.min(760, Math.hypot(ball.vx, ball.vy)));
  ball.vx = Math.sin(angle) * speed; ball.vy = Math.cos(angle) * speed * forward;
  attuneBall(ball, player.index, false);
  ball.x = x + nx * (ball.radius + 2); ball.y = y + ny * (ball.radius + 2);
  ball.trail = [];
  contactCue(contact, protectedMoon ? '#ffe19a' : broken ? '#f5e8c7' : color, broken ? .32 : .22, broken ? 'break' : 'guard');
  state.hitstop = Math.max(state.hitstop, broken ? .06 : .04);
  state.shake = Math.max(state.shake, broken ? 2.4 : 1.2);
  sound('block', player.index);
}

function update(dt, raw, now) {
  for (let i = state.tapMarks.length - 1; i >= 0; i--) { state.tapMarks[i].life -= dt; if (state.tapMarks[i].life <= 0) state.tapMarks.splice(i, 1); }
  if (state.roundIntro > 0) {
    state.roundIntro = Math.max(0, state.roundIntro - dt);
    if (state.roundIntro > .62) { moveOpeningServer(dt); moveOpeningOpponent(dt); }
    if (!state.roundIntro) { document.querySelector('#round-intro').classList.add('hidden'); state.serveBall = null; }
  }
  if (state.roundIntro > .62) { updateParticles(dt); return; }
  if (!state.roundIntro && state.mode === 'ai') updateAI(dt);
  for (const player of state.players) {
    const moveStats = statsFor(player), touchAxis = state.mobileMoveAxis[player.index], axis = Math.hypot(touchAxis.x, touchAxis.y) > .08 ? touchAxis : keyboardAxis(player.index), axisLength = Math.hypot(axis.x, axis.y);
    if (axisLength > .08) { player.targetX += axis.x / axisLength * moveStats.moveSpeedX * dt; player.targetY += axis.y / axisLength * moveStats.moveSpeedY * dt; const target = clampTarget(player.index, player.targetX, player.targetY); player.targetX = target.x; player.targetY = target.y; }
    const slowedByField = state.slowFields.some(field => field.owner !== player.index && field.life > 0
      && Math.hypot(field.x - player.x, field.y - player.y) <= field.radius);
    const opponent = state.players[1 - player.index];
    const chillRank = activeChillRank(opponent);
    const coneSlow = chillRank && inChillCone(opponent, player, chillRank) ? chillSpeedMultiplier(chillRank) : 1;
    const moonSlow = player.moonSlowTimer > 0 ? .72 : 1;
    const moveScale = Math.min(slowedByField ? .62 : 1, coneSlow, moonSlow) * (player.reflectBoostTimer > 0 ? 1.32 : 1);
    const priorX = player.x, priorY = player.y, dx = player.targetX - player.x, dy = player.targetY - player.y;
    player.previousX = priorX; player.previousY = priorY;
    const travelTime = Math.hypot(dx / (moveStats.moveSpeedX * moveScale), dy / (moveStats.moveSpeedY * moveScale)), moveRatio = travelTime > dt ? dt / travelTime : 1;
    player.x += dx * moveRatio; player.y += dy * moveRatio;
    const target = clampTarget(player.index, player.x, player.y); player.x = target.x; player.y = target.y;
    player.vx = (player.x - priorX) / Math.max(dt, .001); player.vy = (player.y - priorY) / Math.max(dt, .001);
    player.guardTrail ||= [];
    if (moveStats.guardTrail > 0) {
      player.guardTrailCooldown = Math.max(0, (player.guardTrailCooldown || 0) - dt);
      for (const segment of player.guardTrail) segment.life -= dt;
      player.guardTrail = player.guardTrail.filter(segment => segment.life > 0);
      const tail = player.guardTrail[player.guardTrail.length - 1];
      if (!player.guardTrailCooldown && Math.hypot(player.x - priorX, player.y - priorY) > 1
          && (!tail || Math.hypot(priorX - tail.x, priorY - tail.y) >= 44)) {
        const duration = guardTrailLifetime(moveStats.guardTrail);
        player.guardTrail.push({ x: priorX, y: priorY, angle: Math.atan2(player.y - priorY, player.x - priorX), life: duration, maxLife: duration });
        player.guardTrail = player.guardTrail.slice(-(1 + moveStats.guardTrail));
      }
    } else player.guardTrail.length = 0;
    if (state.roundIntro > 0 && player.index === state.serveOwner) updateOpeningServeAim();
    player.hitFlash = Math.max(0, player.hitFlash - dt);
    player.reflectBoostTimer = Math.max(0, (player.reflectBoostTimer || 0) - dt);
    player.moonSlowTimer = Math.max(0, (player.moonSlowTimer || 0) - dt);
    player.wardRegenBoost = Math.max(0, (player.wardRegenBoost || 0) - dt);
    player.passFlash = Math.max(0, (player.passFlash || 0) - dt); player.spawnMoonAppear = Math.max(0, (player.spawnMoonAppear || 0) - dt);
    if (player.deflectGrowTimer > 0) player.deflectGrowTimer = Math.max(0, player.deflectGrowTimer - dt);
    else player.deflectGrow = Math.max(0, (player.deflectGrow || 0) - dt * 38);
    for (let segment = 0; segment < player.shieldBars.length; segment++) if (player.shieldTimers[segment] > 0) {
      player.shieldTimers[segment] = Math.max(0, player.shieldTimers[segment] - dt * (player.wardRegenBoost > 0 ? 1.55 : 1));
      if (!player.shieldTimers[segment]) { player.shieldBars[segment] = true; player.shieldLayerHits[segment] = 1 + statsFor(player).plateLayers; burst(guardBarCenter(player, segment), player.index ? 48 : H - 48, player.index ? '#ff7770' : '#69caff', 12); sound('block', player.index); }
    }
    const moonStats = statsFor(player);
    for (let moon = 0; moon < player.satellites.length; moon++) if (!player.satellites[moon] && player.satelliteTimers?.[moon] > 0) {
      player.satelliteTimers[moon] = Math.max(0, player.satelliteTimers[moon] - dt);
      if (!player.satelliteTimers[moon]) {
        player.satellites[moon] = true;
        player.satelliteHits[moon] = 1 + moonStats.satelliteIntercept;
        const point = satellitePosition(player, moon);
        contactCue({ ...point, nx: 0, ny: -1 }, player.index ? '#ffb19e' : '#b8e9ff', .3, 'restore');
        sound('tick', player.index);
      }
    }
    const chargeStats = statsFor(player);
    if (player.charges < chargeStats.chargeMax) {
      if (player.chargeTimer <= 0) player.chargeTimer = chargeStats.cooldown;
      player.chargeTimer -= dt * (1 + chargeStats.chargeRate);
      if (player.chargeTimer <= 0) {
        player.charges = Math.min(chargeStats.chargeMax, player.charges + 1);
        player.orbReady = true;
        player.chargeTimer = player.charges < chargeStats.chargeMax ? chargeStats.cooldown : 0;
        burst(player.x, player.y, player.index ? '#ff7770' : '#69caff', 6);
        sound('tick', player.index);
      }
    } else player.chargeTimer = 0;
  }
  state.orbitTime = (state.orbitTime || 0) + dt * 1000;
  for (const player of state.players) advanceOrbitGuards(player, dt);
  updateChargeNodes(dt); updateBlockNodes(dt);
  updateFirstRoundHint(dt);
  for (let i = state.slowFields.length - 1; i >= 0; i--) { state.slowFields[i].life -= dt; if (state.slowFields[i].life <= 0) state.slowFields.splice(i, 1); }
  for (let i = state.shots.length - 1; i >= 0; i--) {
    const ball = state.shots[i];
    if (![ball.x, ball.y, ball.vx, ball.vy].every(Number.isFinite)) { state.shots.splice(i, 1); createPongBall(1 - (ball.owner === 1 ? 1 : 0), .7, 0); continue; }
    if (ball.serveTimer > 0) { ball.serveTimer -= dt; continue; }
    ball.fireTimer = Math.max(0, (ball.fireTimer || 0) - dt);
    const speed = Math.hypot(ball.vx, ball.vy); ball.travelled = (ball.travelled || 0) + speed * dt;
    ball.radius = collisionShotRadius(ball); ball.age += dt;
    const point = ball.trail.length >= (ball.trailLimit || 12) ? ball.trail.shift() : { x: 0, y: 0 };
    point.x = ball.x; point.y = ball.y;
    ball.trail.push(point);
    const previousBallX = ball.x, previousBallY = ball.y;
    const wallX = ball.vx < 0 ? 28 + ball.radius : W - 28 - ball.radius;
    const wallTime = ball.vx === 0 ? Infinity : (wallX - ball.x) / ball.vx;
    const reachesWall = wallTime <= dt;
    const travelTime = reachesWall ? Math.max(0, wallTime) : dt;
    ball.x += ball.vx * travelTime; ball.y += ball.vy * travelTime;
    if (reachesWall) ball.x = wallX;

    ball.ignoreTimer = Math.max(0, (ball.ignoreTimer || 0) - dt);
    const frameFraction = dt > 0 ? travelTime / dt : 0;
    const bodyContact = firstBodyContact(ball, previousBallX, previousBallY, frameFraction);
    const contactTime = bodyContact?.time ?? 1;
    const contactEndX = previousBallX + (ball.x - previousBallX) * contactTime;
    const contactEndY = previousBallY + (ball.y - previousBallY) * contactTime;
    let ballsCollided = false;
    for (let otherIndex = 0; otherIndex < i; otherIndex++) {
      const other = state.shots[otherIndex];
      if (!other || other.serveTimer > 0 || ball.owner === other.owner || ball.phase || other.phase) continue;
      const travelX = ball.x - previousBallX, travelY = ball.y - previousBallY;
      const clashTime = sweptCircleEntry(previousBallX - other.x, previousBallY - other.y, travelX, travelY, ball.radius + other.radius);
      if (clashTime === null || (bodyContact && clashTime >= contactTime)) continue;
      const hitX = previousBallX + travelX * clashTime, hitY = previousBallY + travelY * clashTime;
      const dx = hitX - other.x, dy = hitY - other.y;
      const angle = Math.hypot(dx, dy) > .01 ? Math.atan2(dy, dx) : Math.atan2(other.vy - ball.vy, other.vx - ball.vx);
      const nx = Math.cos(angle), ny = Math.sin(angle);
      const relative = (ball.vx - other.vx) * nx + (ball.vy - other.vy) * ny;
      if (relative >= 0) continue;
      ball.x = hitX; ball.y = hitY;
      const x = hitX - nx * ball.radius, y = hitY - ny * ball.radius;
      const explosiveOwner = ball.clashBlast ? ball.owner : other.clashBlast ? other.owner : -1;
      const explosive = explosiveOwner >= 0;
      if (explosive) {
        const blastRadius = 62 + Math.max(ball.clashBlast || 0, other.clashBlast || 0) * 12;
        state.shotImpacts.push({ x, y, angle: Math.atan2(dy, dx), life: .44, max: .44, explosion: 1, blastRadius });
        state.slowFields.push({ owner: explosiveOwner, x, y, radius: blastRadius * .82, life: 1.25, maxLife: 1.25, phase: 0, comet: true });
        state.shake = Math.max(state.shake, 8); state.hitstop = Math.max(state.hitstop, .14); burst(x, y, '#fff', 30); sound('block', ball.owner);
        const losingBall = explosiveOwner === ball.owner ? other : ball;
        const removedAt = state.shots.indexOf(losingBall);
        if (removedAt >= 0) {
          state.shots.splice(removedAt, 1);
          if (removedAt < i) i--;
        }
        if (losingBall === ball) { ballsCollided = true; break; }
      } else {
        ball.vx -= relative * nx; ball.vy -= relative * ny;
        other.vx += relative * nx; other.vy += relative * ny;
        burst(x, y, '#fff', 5); state.hitstop = Math.max(state.hitstop, .028); sound('block', ball.owner);
      }
      ballsCollided = true; break;
    }
    if (ballsCollided) continue;
    const onOpponentSide = ball.owner === 0 ? ball.y < MID : ball.y > MID;
    if (ball.cometTrail && onOpponentSide) { ball.cometTimer -= dt; if (ball.cometTimer <= 0) { const n = state.slowFields.filter(f => f.comet && f.owner === ball.owner && !f.wallField).length, cap = 18 + ball.cometTrail * 10; if (n >= cap) { const oldest = state.slowFields.findIndex(f => f.comet && f.owner === ball.owner && !f.wallField); if (oldest >= 0) state.slowFields.splice(oldest, 1); } const life = cometFieldDuration(ball.cometTrail); state.slowFields.push({ owner: ball.owner, x: ball.x, y: ball.y, radius: 20 + ball.cometTrail * 9, life, maxLife: life, phase: Math.random() * 6.28, comet: true }); ball.cometTimer = .2; } }

    if (hasSynergy(state.players[ball.owner], 'destroySources')) {
      const dx = contactEndX - previousBallX, dy = contactEndY - previousBallY, lengthSq = dx * dx + dy * dy;
      const sourceIndex = state.chargeNodes.findIndex(node => node.owner !== ball.owner && (() => {
        const t = lengthSq ? Math.max(0, Math.min(1, ((node.x - previousBallX) * dx + (node.y - previousBallY) * dy) / lengthSq)) : 0;
        return Math.hypot(previousBallX + dx * t - node.x, previousBallY + dy * t - node.y) <= ball.radius + 10;
      })());
      if (sourceIndex >= 0) {
        const [destroyed] = state.chargeNodes.splice(sourceIndex, 1);
        state.shotImpacts.push({ x: destroyed.x, y: destroyed.y, life: .28, max: .28, moonFlash: true, color: ball.owner ? '#ff7770' : '#69caff' });
        burst(destroyed.x, destroyed.y, ball.owner ? '#ff7770' : '#69caff', 8);
      }
    }

    let blockedByTrail = false;
    for (const target of state.players) {
      if (target.index === ball.owner) continue;
      let blocked = false;
      if (!blocked && !ball.phase) {
        const trailLevel = statsFor(target).guardTrail;
        const trail = target.guardTrail || [];
        for (let ti = trail.length - 1; ti >= 0; ti--) {
          const segment = trail[ti];
          if (segment.maxLife - segment.life < guardTrailArming) continue;
          const c = Math.cos(segment.angle), s = Math.sin(segment.angle);
          const toLocal = (x, y) => {
            const dx = x - segment.x, dy = y - segment.y;
            return { x: dx * c + dy * s, y: -dx * s + dy * c };
          };
          const from = toLocal(previousBallX, previousBallY), to = toLocal(contactEndX, contactEndY);
          const halfLength = 9 + trailLevel * 2, halfWidth = ball.radius + guardTrailHalfWidth(trailLevel);
          const entry = segmentRectEntry(from.x, from.y, to.x, to.y, -halfLength, -halfWidth, halfLength, halfWidth);
          if (entry === null || (bodyContact && entry >= 1)) continue;
          ball.x = previousBallX + (contactEndX - previousBallX) * entry;
          ball.y = previousBallY + (contactEndY - previousBallY) * entry;
          ball.vy = (target.index === 0 ? -1 : 1) * Math.max(180, Math.abs(ball.vy) * 1.05);
          ball.vx += Math.sign(ball.x - target.x || 1) * 45;
          attuneBall(ball, target.index); ball.ignorePlayer = target.index; ball.ignoreTimer = .14; ball.trail = [];
          burst(ball.x, ball.y, target.index ? '#ff7770' : '#69caff', 10);
          state.hitstop = Math.max(state.hitstop, .045); sound('block', target.index);
          grantDeflectionEffects(target);
          trail.length = 0; target.guardTrailCooldown = guardTrailRecovery;
          blocked = true; break;
        }
      }
      if (blocked) { blockedByTrail = true; break; }
    }
    if (blockedByTrail) continue;

    let blockedByPoint = false;
    for (let pointIndex = state.blockNodes.length - 1; pointIndex >= 0; pointIndex--) {
      const point = state.blockNodes[pointIndex];
      if (!point.armed || point.owner === ball.owner) continue;
      const halfW = (point.width || 34) / 2 + ball.radius, halfH = (point.height || 18) / 2 + ball.radius;
      const entry = segmentRectEntry(previousBallX, previousBallY, contactEndX, contactEndY,
        point.x - halfW, point.y - halfH, point.x + halfW, point.y + halfH);
      if (entry === null || (bodyContact && entry >= 1)) continue;
      ball.x = previousBallX + (contactEndX - previousBallX) * entry;
      ball.y = previousBallY + (contactEndY - previousBallY) * entry;
      const hitX = Math.max(point.x - point.width / 2, Math.min(point.x + point.width / 2, ball.x));
      const hitY = Math.max(point.y - point.height / 2, Math.min(point.y + point.height / 2, ball.y));
      const normal = Math.atan2(ball.y - hitY, ball.x - hitX), speed = Math.min(920, Math.hypot(ball.vx, ball.vy) * 1.08);
      const side = point.owner === 0 ? -1 : 1;
      ball.vx = Math.cos(normal) * speed + (point.x < W / 2 ? 35 : -35); ball.vy = side * Math.max(180, Math.abs(Math.sin(normal) * speed));
      grantDeflectionEffects(state.players[point.owner]);
      attuneBall(ball, point.owner); ball.ignorePlayer = point.owner; ball.ignoreTimer = .16; ball.trail = [];
      burst(point.x, point.y, point.owner ? '#ff7770' : '#69caff', 19); state.hitstop = Math.max(state.hitstop, .075); sound('block', point.owner);
      state.blockNodes.splice(pointIndex, 1); blockedByPoint = true; break;
    }
    if (blockedByPoint) continue;

    if (bodyContact) {
      const planet = bodyContact.player;
      if (bodyContact.type !== 'planet') {
        interceptWithGuard(ball, bodyContact, travelTime);
      } else if (planet.armor > 0 && ball.pierce > 0) {
        planet.armor--;
        planet.lostArmor = planet.armor === 0;
        ball.pierce--;
        ball.piercedPlayer = planet.index;
        contactCue(bodyContact, '#fff1ce', .22, 'break');
        sound('block', planet.index);
      } else {
        if (planet.armor > 0) {
          planet.armor--;
          planet.lostArmor = planet.armor === 0;
          planet.hitFlash = .22;
        }
        returnBall(ball, planet, bodyContact);
      }
      continue;
    }
    if (reachesWall) {
      ball.vx *= -1;
      ball.wallBounces = (ball.wallBounces || 0) + 1;
      const owner = state.players[ball.owner];
      const ricochetBoost = (1 + ricochetRate(ball.bounce || 0)) * (hasSynergy(owner, 'strongRicochet') ? 1.18 : 1);
      if (ricochetBoost > 1) {
        const speed = Math.hypot(ball.vx, ball.vy);
        const multiplier = speed < 920 && speed > 0 ? Math.min(ricochetBoost, 920 / speed) : 1;
        ball.vx *= multiplier; ball.vy *= multiplier;
      }
      if (ball.wallField) {
        const life = 1.1 + ball.wallField * .35, radius = 45 + ball.wallField * 12;
        const ownedFields = state.slowFields.filter(field => field.wallField && field.owner === ball.owner);
        if (ownedFields.length >= 6) state.slowFields.splice(state.slowFields.indexOf(ownedFields[0]), 1);
        state.slowFields.push({ owner: ball.owner, x: ball.x, y: ball.y, radius, life, maxLife: life, phase: Math.random() * 6.28, comet: true, wallField: true });
      }
      burst(ball.x, ball.y, '#eee9dc', 4); sound('tick', ball.owner);
    }
    const shieldHit = shieldLineCrossing(ball, previousBallX, previousBallY, ball.x, ball.y);
    if (shieldHit) {
      const { player: defender, x: impactX, playerX } = shieldHit;
      const winner = 1 - defender.index;
      const cornerLevel = statsFor(defender).cornerGuards;
      const cornerIndex = impactX < W / 2 ? 0 : 1;
      const cornerReach = 30 + ball.radius + cornerLevel * 12;
      const cornerHit = cornerLevel && defender.cornerGuards?.[cornerIndex] > 0
        && (cornerIndex === 0 ? impactX <= cornerReach : impactX >= W - cornerReach);
      const guardSlot = cornerHit ? -1 : guardBarAt(defender, impactX, ball.radius, playerX);
      if (cornerHit) {
        grantDeflectionEffects(defender);
        defender.hitFlash = .24;
        ball.vy = (defender.index === 0 ? -1 : 1) * Math.abs(ball.vy) * 1.12;
        ball.vx = cornerIndex === 0 ? Math.abs(ball.vx) * 1.06 + 72 : -Math.abs(ball.vx) * 1.06 - 72;
        attuneBall(ball, defender.index);
        ball.x = cornerIndex === 0 ? 28 + ball.radius : W - 28 - ball.radius;
        ball.y = winner === 0 ? 31 + ball.radius : H - 31 - ball.radius; ball.ignorePlayer = defender.index; ball.ignoreTimer = .22; ball.trail = [];
        burst(cornerIndex === 0 ? 34 : W - 34, defender.index ? 42 : H - 42, '#f5e8c7', 22); state.hitstop = Math.max(state.hitstop, .095); sound('block', defender.index);
      } else if (guardSlot >= 0) {
        grantDeflectionEffects(defender);
        const attackerIndex = ball.owner, attackingShotSize = ball.shotSize || 0;
        const initialLayers = defender.shieldLayerHits?.[guardSlot] || 0;
        defender.hitFlash = .22;
        if (initialLayers > 0) {
          defender.shieldLayerHits[guardSlot] = Math.max(0, initialLayers - plateDamage(attackingShotSize));
          if (!defender.shieldLayerHits[guardSlot]) {
            const luckyPlate = hasSynergy(defender, 'plateReturn') && Math.random() < .3;
            if (luckyPlate) {
              defender.shieldLayerHits[guardSlot] = 1;
              defender.shieldBars[guardSlot] = true;
              defender.shieldTimers[guardSlot] = 0;
              state.shotImpacts.push({ x: guardBarCenter(defender, guardSlot), y: defender.index ? 48 : H - 48, life: .4, max: .4, moonFlash: true, color: '#e4c36b' });
            } else {
              defender.shieldBars[guardSlot] = false;
              defender.shieldTimers[guardSlot] = shieldRestoreDuration(defender);
            }
          }
        }
        const reflection = statsFor(defender).reflect;
        ball.vy = (defender.index === 0 ? -1 : 1) * Math.abs(ball.vy) * (reflection ? 1 + plateReflectRate(reflection) : 1); ball.vx *= reflection ? 1.05 + reflection * .2 : 1.05; attuneBall(ball, defender.index);
        const defenseStats = statsFor(defender);
        if (initialLayers > 0 && defenseStats.shieldSlow) { ball.vx *= 1 - defenseStats.shieldSlow; ball.vy *= 1 - defenseStats.shieldSlow; }
        repairShieldLayers(state.players[attackerIndex], statsFor(state.players[attackerIndex]).wallCounter);
        ball.x = impactX; ball.y = winner === 0 ? 31 + ball.radius : H - 31 - ball.radius; ball.ignorePlayer = defender.index; ball.ignoreTimer = .22; ball.trail = [];
        const strongHit = initialLayers > 1 || attackingShotSize > 0;
        burst(impactX, defender.index ? 48 : H - 48, strongHit ? '#fff2bc' : (defender.index ? '#ff7770' : '#69caff'), strongHit ? 15 : 16); state.hitstop = Math.max(state.hitstop, strongHit ? .065 : .09); sound('block', defender.index);
      } else if (defender.armor > 0) {
        if (ball.pierce <= 0) grantDeflectionEffects(defender);
        defender.armor--; defender.lostArmor = defender.armor === 0; defender.hitFlash = .3; ball.vy = defender.index === 0 ? -Math.abs(ball.vy) : Math.abs(ball.vy); ball.vx *= .82;
        if (statsFor(defender).reflect) { const magnitude = Math.hypot(ball.vx, ball.vy), scale = (magnitude + 90 + statsFor(defender).reflect * 30) / magnitude; ball.vx *= scale; ball.vy *= scale; }
        attuneBall(ball, defender.index);
        ball.x = impactX; ball.y = winner === 0 ? 31 + ball.radius : H - 31 - ball.radius; ball.ignorePlayer = defender.index; ball.ignoreTimer = .22; burst(ball.x, ball.y, '#fff', 26); sound('block', defender.index);
      }
    }
    const topBreach = ball.vy < 0 && previousBallY >= 30 + ball.radius && ball.y < 30 + ball.radius;
    const bottomBreach = ball.vy > 0 && previousBallY <= H - 30 - ball.radius && ball.y > H - 30 - ball.radius;
    if (topBreach || bottomBreach) {
      const winner = topBreach ? 0 : 1, defender = state.players[1 - winner];
      defender.hitFlash = .5;
      const edge = topBreach ? 30 : H - 30;
      const crossingY = topBreach ? edge + ball.radius : edge - ball.radius;
      const fraction = Math.max(0, Math.min(1, (crossingY - previousBallY) / (ball.y - previousBallY)));
      const crossingX = previousBallX + (ball.x - previousBallX) * fraction;
      ball.x = crossingX; ball.y = crossingY;
      finishRound(winner, { x: crossingX, y: edge, defender: defender.index, shot: ball }); return;
    }
    if (ball.age > 16) { state.shots.splice(i, 1); createPongBall(1 - ball.owner, .35); }
  }
  updateParticles(dt);
}

function updateAI(dt) {
  const profile = aiDifficulties[state.aiDifficulty] || aiDifficulties[0];
  const ai = state.players[1];
  let ball;
  for (const shot of state.shots) {
    if (shot.serveTimer <= 0 && shot.vy < 0 && (!ball || shot.y <= ball.y)) ball = shot;
  }
  if (ball) {
    state.aiThink -= dt;
    if (state.aiThink <= 0) { state.aiAimOffset = (Math.random() * 2 - 1) * W * profile.error; state.aiThink = .38 + (1 / profile.reaction) * .22; }
    const targetY = Math.max(45, Math.min(MID - 50, ball.y - H * .14));
    const t = Math.max(0, (targetY - ball.y) / Math.min(-120, ball.vy)) * profile.prediction;
    const min = 34, max = W - 34, span = max - min;
    let projected = ball.x + ball.vx * t + state.aiAimOffset, folded = ((projected - min) % (span * 2) + span * 2) % (span * 2);
    if (folded > span) folded = span * 2 - folded;
    const blend = Math.min(1, dt * profile.reaction * 1.6);
    ai.targetX += (min + folded - ai.targetX) * blend; ai.targetY += (targetY - ai.targetY) * blend;
  } else {
    state.aiThink = 0;
    const node = state.chargeNodes.find(item => item.owner === 1);
    const targetX = node ? node.x : W / 2, targetY = node ? node.y : H * .24, blend = Math.min(1, dt * profile.reaction * 1.4);
    ai.targetX += (targetX - ai.targetX) * blend; ai.targetY += (targetY - ai.targetY) * blend;
  }
}

function updateChargeNodes(dt) {
  for (let owner = 0; owner < 2; owner++) {
    const stats = statsFor(state.players[owner]), nodeLimit = 1;
    if (state.chargeNodes.filter(node => node.owner === owner).length >= nodeLimit) continue;
    state.nodeSpawnTimers[owner] -= dt;
    if (state.nodeSpawnTimers[owner] > 0) continue;
    const chance = Math.min(.9, (.084 + stats.nodeChance) * stats.nodeChanceMultiplier) * .5;
    if (Math.random() < chance) {
      const y = owner ? H * (.12 + Math.random() * .26) : H * (.62 + Math.random() * .26);
      const node = spawnChargeNode(owner, W * (.12 + Math.random() * .76), y);
    }
    state.nodeSpawnTimers[owner] = .85 + Math.random() * .65 - stats.spawnCooldown;
  }

  for (let i = state.chargeNodes.length - 1; i >= 0; i--) {
    const node = state.chargeNodes[i], player = state.players[node.owner], stats = statsFor(player);
    node.appear = Math.min(1, node.appear + dt / .58);
    node.cooldown = Math.max(0, (node.cooldown || 0) - dt);
    if (node.appear < 1) continue;
    const collectionRadius = 56;
    if (node.cooldown > 0) continue;
    const linkedMoonIndex = node.moonLinked ? player.satellites.findIndex(Boolean) : -1;
    const linkedMoon = linkedMoonIndex >= 0 ? satellitePosition(player, linkedMoonIndex) : null;
    const moonGenerating = Boolean(linkedMoon && Math.hypot(linkedMoon.x - node.x, linkedMoon.y - node.y) < 50);
    const playerCharging = Math.hypot(player.x - node.x, player.y - node.y) < collectionRadius;
    if (playerCharging || moonGenerating) {
      let rate = .55 + .55 * planetBonusStrength(player, 'fastMoon') + stats.nodeCharge;
      if (node.persistent) rate *= hasSynergy(player, 'persistentSources') ? .62 : .42;
      else if (hasSynergy(player, 'persistentSources')) rate *= .72;
      if (moonGenerating) rate *= 1.65;
      node.charge = Math.min(1, node.charge + dt * rate);
    }
    else node.charge = Math.max(0, node.charge - dt * .08);
    if (node.charge < 1) continue;
    const angle = chargeNodeAim(node, player);
    const speed = (345 + (stats.shotSpeed + stats.launchSpeed) * .28) * (1 + stats.launchRate + stats.nodeShotRate), emergence = Math.max(.38, 1.4 - stats.spawnSpeed);
    const ball = { x: node.x, y: node.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, owner: node.owner, radius: Math.max(6, 8 + stats.shotSize * .55), baseRadius: Math.max(6, 8 + stats.shotSize * .55), serveTimer: emergence, serveDuration: emergence, age: 0, travelled: 0, trail: [], trailLimit: 12, wallBounces: 0, nodeShot: true };
    attuneBall(ball, node.owner); state.shots.push(ball); repairShieldLayers(player, stats.sourceRepair + (hasSynergy(player, 'sourceRepair') ? 1 : 0)); spawnBallEffect(node.x, node.y, node.owner);
    burst(node.x, node.y, node.owner ? '#ff7770' : '#69caff', 14); sound('throw', node.owner);
    if (node.persistent || Math.random() < (node.persistentChance || 0)) { node.persistent = true; node.charge = 0; node.cooldown = 1.35; }
    else state.chargeNodes.splice(i, 1);
    state.nodeSpawnTimers[node.owner] = Math.max(.25, .95 + Math.random() * .55 - stats.spawnCooldown);
  }
}

function updateBlockNodes(dt) {
  for (let owner = 0; owner < 2; owner++) {
    const player = state.players[owner], stats = statsFor(player);
    if (!stats.blockNodeChance) continue;
    const points = state.blockNodes.filter(point => point.owner === owner);
    for (const point of points) { point.width = 34 + stats.blockNodeSize * 8; point.height = 18 + stats.blockNodeSize * 4; }
    if (points.length < 2) {
      state.blockSpawnTimers[owner] -= dt;
      if (state.blockSpawnTimers[owner] <= 0) {
        if (Math.random() < stats.blockNodeChance) {
          const top = owner ? .1 : .59, bottom = owner ? .41 : .9;
          let x, y, attempts = 0;
          do { x = W * (.12 + Math.random() * .76); y = H * (top + Math.random() * (bottom - top)); attempts++; }
          while (attempts < 8 && (Math.hypot(x - player.x, y - player.y) < 100 || state.blockNodes.some(point => Math.hypot(x - point.x, y - point.y) < 84)));
          state.blockNodes.push({ owner, x, y, width: 34 + stats.blockNodeSize * 8, height: 18 + stats.blockNodeSize * 4, charge: 0, appear: 0, armed: false, phase: Math.random() * Math.PI * 2 });
          burst(x, y, owner ? '#ff7770' : '#69caff', 8); sound('spawn', owner);
        }
        state.blockSpawnTimers[owner] = 4.5 + Math.random() * 2;
      }
    }
  }
  for (const point of state.blockNodes) {
    point.appear = Math.min(1, point.appear + dt / .5);
    if (point.armed) continue;
    const player = state.players[point.owner], near = Math.hypot(player.x - point.x, player.y - point.y) < 54;
    point.charge = near ? Math.min(1, point.charge + dt * .85) : Math.max(0, point.charge - dt * .18);
    if (point.charge >= 1) { point.armed = true; burst(point.x, point.y, point.owner ? '#ff7770' : '#69caff', 14); sound('tick', point.owner); }
  }
}

function chargeNodeAim(node, player) {
  // The player's position on either side of the node bends the serve left or right.
  const horizontal = Math.max(-.65, Math.min(.65, (node.x - player.x) / 56 * .65));
  const vertical = node.owner === 0 ? -1 : 1;
  return Math.atan2(vertical, horizontal);
}

const FIRST_ROUND_HINT_KEY = 'planets-first-round-seen';
function prepareFirstRoundHint() {
  state.tutorial = null;
  setFirstRoundHint('');
}

function setFirstRoundHint(copy) {
  if (firstRoundHint.textContent === copy) return;
  firstRoundHint.textContent = copy;
  firstRoundHint.classList.toggle('hidden', !copy);
}

function updateFirstRoundHint(dt) {
  const hint = state.tutorial;
  if (!hint || state.roundIntro > 0) return;
  if (!hint.moved) {
    const player = state.players[0];
    hint.moved = Math.hypot(player.x - hint.origin.x, player.y - hint.origin.y) > 18;
  }
  if (!hint.sourceDone) {
    if (!hint.source) hint.source = state.chargeNodes.find(node => node.owner === 0 && node.appear > .25);
    if (hint.source) {
      if (hint.moved || !hint.firstRound) hint.sourceTime += dt;
      if (!state.chargeNodes.includes(hint.source) || hint.sourceTime > 8) {
        hint.source = null;
        hint.sourceDone = true;
      }
    }
  }
  let copy = '';
  if (hint.firstRound && !hint.moved) copy = window.matchMedia('(pointer: coarse)').matches
    ? 'Проведи пальцем, чтобы двигаться' : 'Двигай планету мышью или WASD';
  else if (hint.source) copy = 'Подлети к источнику и дождись зарядки';
  else if (hint.firstRound && !hint.deflected) copy = 'Подставь планету под астероид';
  setFirstRoundHint(copy);
  if (hint.sourceDone && (!hint.firstRound || hint.deflected)) {
    state.tutorial = null;
    try { localStorage.setItem(FIRST_ROUND_HINT_KEY, '1'); } catch {}
  }
}

const BREACH_FOCUS_MS = 420;

function focusScoreBreach(breach, phase, reducedMotion) {
  const started = performance.now();
  let previous = started;
  const focusFrame = now => {
    if (state.phase !== phase || state.finalBreach !== breach || isPauseOpen()) return;
    const elapsed = Math.max(0, now - started);
    if (elapsed >= BREACH_FOCUS_MS) return;
    const t = elapsed / BREACH_FOCUS_MS;
    breach.shotOpacity = Math.max(0, 1 - t / .9) ** 2;
    if (!reducedMotion) {
      breach.progress = t;
      const approach = Math.min(1, elapsed / 250);
      const zoom = .105 * (1 - (1 - approach) ** 3);
      // Pan towards the impact while keeping the zoomed frame flush with the arena edges.
      const limit = zoom * 50;
      const shift = fraction => Math.max(-limit, Math.min(limit, (.5 - fraction) * zoom * 115));
      canvas.style.transform = `translate(${shift(breach.x / W)}%, ${shift(breach.y / H)}%) scale(${1 + zoom})`;
      updateParticles(Math.max(0, Math.min(35, now - previous)) * .00026);
    }
    previous = now;
    drawFrameSafely();
    requestAnimationFrame(focusFrame);
  };
  requestAnimationFrame(focusFrame);
}

function finishRound(winner, breach = null) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (breach) {
    breach.progress = reducedMotion ? .35 : 0;
    breach.shotOpacity = 1;
  }
  state.finalBreach = breach;
  setFirstRoundHint('');
  const defeated = state.players[1 - winner];
  state.nextServeOwner = defeated.index;
  sound('defeat', defeated.index);
  arenaWrap.style.transform = '';
  pulseArena('impact', defeated.index);
  const impact = breach || defeated;
  burst(impact.x, impact.y, defeated.index ? '#ff7770' : '#69caff', 50);
  burst(impact.x, impact.y, '#fff', 18);
  state.running = false; state.matchScore[winner]++;
  if (state.mode === 'pvp' || winner === 0) state.sessionRoundWins++;
  const matchEnd = !state.zooMode && state.matchScore[winner] >= 2;
  let newlyUnlockedSynergy = null;
  const title = document.querySelector('#curtain-title');
  title.textContent = 'Раунд завершен!'; title.classList.toggle('winner-red', winner === 1); title.classList.toggle('winner-blue', winner === 0);
  const nextLabel = document.querySelector('#curtain-continue');
  const campaignComplete = matchEnd && state.campaignWins[winner] + 1 >= 5;
  if (matchEnd) {
    state.matchWinner = winner; state.campaignWins[winner]++;
    const synergy = planetSynergy(playerSkinHalves(state.players[winner]));
    if (synergy && !career.synergies.includes(synergy.key)) {
      career.synergies.push(synergy.key);
      newlyUnlockedSynergy = synergy;
      try { localStorage.setItem(CAREER_KEY, JSON.stringify(career)); } catch {}
    }
    state.newlyUnlockedSynergy = newlyUnlockedSynergy;
  }
  const nextCaption = matchEnd
    ? (campaignComplete ? 'Итог кампании' : 'Перепланетирование')
    : `Раунд ${state.matchScore[0] + state.matchScore[1] + 1}`;
  nextLabel.innerHTML = `${nextCaption}<span></span>`;
  nextLabel.style.setProperty('--planet-color', matchEnd ? '#e4c36b' : winner === 0 ? '#69caff' : '#ff7770');
  const curtain = document.querySelector('#curtain'), resultPhase = matchEnd ? 'between' : 'round-result';
  curtain.classList.add('hidden'); state.phase = resultPhase;
  if (breach) focusScoreBreach(breach, resultPhase, reducedMotion);
  clearTimeout(state.continueTimer); state.continueTimer = window.setTimeout(() => {
    if (state.phase !== resultPhase) { state.continueTimer = 0; return; }
    curtain.classList.remove('hidden');
    canvas.style.transform = 'scale(1)';
    state.continueTimer = window.setTimeout(() => {
      if (state.phase === resultPhase) continueFromCurtain();
      else state.continueTimer = 0;
    }, 1936);
  }, breach ? BREACH_FOCUS_MS : 128);
}

function continueFromCurtain() {
  clearTimeout(state.continueTimer); state.continueTimer = 0;
  if (isPauseOpen()) return;
  if (state.phase === 'between') startRewardPhase();
  else if (state.phase === 'round-result') startRound();
}

function pulseArena(className, damagedPlayer = null) {
  arenaWrap.classList.remove('impact', 'shot-fired', 'shot-clash', 'damage-blue', 'damage-red');
  void arenaWrap.offsetWidth;
  arenaWrap.classList.add(className);
  if (damagedPlayer !== null) arenaWrap.classList.add(damagedPlayer ? 'damage-red' : 'damage-blue');
  window.setTimeout(() => arenaWrap.classList.remove(className, 'damage-blue', 'damage-red'), className === 'impact' ? 600 : 260);
}

function startRewardPhase() {
  if (state.campaignWins[state.matchWinner] >= 5) { showEnding(state.matchWinner); return; }
  showUpgradePhase(false);
}

function showUpgradePhase(initial = false) {
  state.initialUpgradePhase = initial;
  state.upgradeChoices = [null, null]; state.upgradeFocus = [0, 0]; state.upgradePrevious = [null, null];
  state.upgradeOffers = state.players.map((player, index) => {
    let offers = offerFor(player, index === state.matchWinner);
    if (!offers.length && Object.keys(player.cards).length) {
      if (state.mode === 'ai' && index === 1) {
        player.cards = {};
        offers = offerFor(player, false);
      } else {
        player.rosterResetPoints = (player.rosterResetPoints || 0) + 1;
        player.cards = {};
        offers = offerFor(player, false);
      }
    }
    return offers;
  });
  switchScreen('upgrade');
  const upgradeTitle = document.querySelector('#upgrade-title');
  upgradeTitle.textContent = initial ? 'СТАРТОВЫЙ ВЫБОР' : 'ВЫБОР УЛУЧШЕНИЯ';
  upgradeTitle.classList.toggle('start-choice-title', initial);
  upgradeTitle.classList.toggle('upgrade-choice-title', !initial);
  document.querySelector('#upgrade-context').textContent = initial ? 'ПОДГОТОВКА ПЛАНЕТЫ' : 'ПЕРЕПЛАНЕТИРОВАНИЕ';
  [0, 1].forEach(index => {
    const side = index ? 'two' : 'one';
    document.querySelector(`#upgrade-name-${side}`).textContent = index
      ? 'ПЛАНЕТА КРАСНОЙ СУЩНОСТИ'
      : state.mode === 'ai' ? 'ПЛАНЕТА ТВОЕЙ СУЩНОСТИ' : 'ПЛАНЕТА СИНЕЙ СУЩНОСТИ';
    document.querySelector(`#upgrade-body-${side}`).textContent = '';
    document.querySelector(`#upgrade-role-${side}`).textContent = index === 1 && state.mode === 'ai' ? 'ВЫБИРАЕТ' : '';
    renderOffers(index);
    const resetButton = document.querySelector(`#upgrade-reset-${side}`);
    resetButton.classList.toggle('hidden', !(state.players[index].rosterResetPoints > 0));
    resetButton.disabled = state.upgradeChoices[1 - index] !== null;
    resetButton.textContent = `Перезапустить ростер · ${state.players[index].rosterResetPoints} ${resetPointLabel(state.players[index].rosterResetPoints)}`;
  });
  const aiSide = document.querySelector('#upgrade-side-two');
  aiSide.classList.toggle('opponent-view', state.mode === 'ai');
  aiSide.classList.toggle('ai-thinking', state.mode === 'ai');
  if (state.mode === 'ai') {
    window.setTimeout(() => {
      if (state.phase === 'upgrade' && state.upgradeChoices[1] === null) chooseUpgrade(1, chooseAIOffer());
    }, 420);
  }
}

function resetPointLabel(count) { return count % 10 === 1 && count % 100 !== 11 ? 'очко' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'очка' : 'очков'; }

function chooseAIOffer() {
  const player = state.players[1], stats = statsFor(player);
  const branchWeight = { attack: 1.25, effects: 1.15, defense: stats.armor || stats.barrierWidth ? 1.25 : 1.8, spawn: stats.nodeChance ? 1.45 : 1.65, control: stats.satellites ? 1.25 : 1.75 };
  const index = state.upgradeOffers[1].map((card, offerIndex) => {
    const synergy = (card.id === 'ironcore' && stats.armor ? 1.5 : 0) + (card.id === 'platelayers' && stats.barrierWidth ? .6 : 0) + (card.id === 'twinmoon' && stats.satellites ? 1.1 : 0) + (card.id === 'nodeslots' && stats.nodeChance ? .7 : 0);
    return { offerIndex, value: (branchWeight[card.branch] || 1) + synergy + Math.random() * .25 - (player.cards[card.id] || 0) * .08 };
  }).sort((a, b) => b.value - a.value)[0]?.offerIndex ?? 0;
  return state.upgradeOffers[1][index]?.id;
}

function offerFor(player, winner) {
  const owned = Object.keys(player.cards).map(id => relics.find(card => card.id === id)).filter(Boolean);
  const level = playerLevel(), hasFeature = id => (player.cards[id] || 0) > 0 || (id === 'satellite' && statsFor(player).satellites > 0), available = relics.filter(card => level >= (relicUnlockLevels[card.id] || 1) && (!card.requires || hasFeature(card.requires)));
  let choices = winner ? owned.filter(card => player.cards[card.id] < (card.maxLevel || 3) && available.includes(card)) : available.filter(card => !player.cards[card.id]);
  if (!choices.length) choices = available.filter(card => !player.cards[card.id]);
  if (!choices.length) choices = owned.filter(card => player.cards[card.id] < (card.maxLevel || 3) && available.includes(card));
  return shuffle(choices).slice(0, 3);
}

function relicIcon(stat, id = '') {
  const shapes = {
    blockNodeSize: '<path d="M8 15h32v18H8z"/><path d="M14 20h20M14 25h12M14 29h16"/>',
    guardTrail: '<path d="M9 13h10v7H9zm13 8h10v7H22zm7 10h10v7H29z"/><path d="m7 9-3 3 3 3"/>',
    moveSpeedX: '<path d="M11 24h26M19 15l-9 9 9 9M29 15l9 9-9 9"/>',
    moveSpeedY: '<path d="M24 5v34M14 15l10-10 10 10M14 29l10 10 10-10"/>',
    launchSpeed: '<circle cx="24" cy="24" r="5"/><circle cx="24" cy="24" r="13" stroke-dasharray="2 4"/><path d="M24 4v8m0 24v8M4 24h8m24 0h8"/>',
    cometTrail: '<circle cx="34" cy="15" r="5"/><path d="M29 19 9 37m23-13L17 42m18-12L25 43"/><path d="M8 24h10" stroke-dasharray="2 4"/>',
    spawnCooldown: '<path d="M37 20a14 14 0 1 0 1 8"/><path d="M32 12h8v8M24 15v10l7 4"/><path d="M5 6v10h10"/>',
    returnSpeed: '<path d="M39 14H18a10 10 0 0 0 0 20h15"/><path d="m29 26 8 8-8 8M9 14l8-8 8 8"/>',
    heavy: '<circle cx="24" cy="24" r="14"/><circle cx="24" cy="24" r="5"/><path d="M24 3v7m0 28v7M3 24h7m28 0h7"/>',
    nodeChance: '<circle cx="10" cy="24" r="5"/><circle cx="24" cy="24" r="5"/><circle cx="38" cy="24" r="5"/><path d="M15 24h4m10 0h4"/>',
    deflectSource: '<circle cx="24" cy="24" r="5"/><circle cx="24" cy="24" r="13" stroke-dasharray="2 4"/><path d="M24 2v7m0 30v7M2 24h7m30 0h7"/>',
    deflectGrowth: '<circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="17" stroke-dasharray="3 4"/><path d="M24 2v8m0 28v8M2 24h8m28 0h8"/>',
    nodeCharge: '<circle cx="24" cy="24" r="16"/><path d="M24 8v16l11 7M8 12l5 4m22-4-4 4"/>',
    blockNodeChance: '<circle cx="24" cy="24" r="15"/><path d="M24 9v30M9 24h30"/><path d="m14 14 20 20m0-20L14 34"/>',
    wallField: '<path d="M7 24h34M13 17l-6 7 6 7M35 17l6 7-6 7"/><circle cx="24" cy="24" r="9" stroke-dasharray="2 4"/>',
    chargeRate: '<circle cx="24" cy="24" r="16"/><path d="M24 8v16l10 5M5 5v11h11"/>',
    spawnSpeed: '<circle cx="24" cy="24" r="16"/><path d="M24 7v17l11 7M8 11l5 4m22-4-4 4"/>',
    plates: '<path d="M5 18h38M8 24h32M11 30h26"/><path d="M10 14v20m28-20v20"/>',
    barrierWidth: '<path d="M7 24h34M7 18v12m34-12v12M16 15v18m16-18v18"/>',
    wardRegen: '<path d="M7 24h34M7 18v12m34-12v12M16 15v18m16-18v18"/>',
    orbitSpeed: '<circle cx="24" cy="24" r="5"/><ellipse cx="24" cy="24" rx="18" ry="11"/><path d="m36 13 5 1-1 5M12 35l-5-1 1-5"/>',
    orbitRadius: '<circle cx="24" cy="24" r="5"/><ellipse cx="24" cy="24" rx="21" ry="17"/><circle cx="5" cy="13" r="3"/>',
    plateLayers: '<path d="M6 16h36M6 24h36M6 32h36"/><path d="m12 12-4 4 4 4m24-4 4 4-4 4"/>',
    cornerGuards: '<path d="M7 20V7h13M41 20V7H28M7 28v13h13m21-13v13H28"/><path d="M12 12h7m17 0h-7M12 36h7m17 0h-7"/>',
    satelliteSize: '<circle cx="24" cy="24" r="7"/><ellipse cx="24" cy="24" rx="20" ry="14"/><circle cx="5" cy="21" r="5"/><circle cx="42" cy="27" r="5"/>',
    satelliteRegen: '<circle cx="24" cy="24" r="7"/><ellipse cx="24" cy="24" rx="20" ry="14"/><path d="M36 11a17 17 0 0 1 4 20m-2-7 2 7 6-3"/>',
    moveSpeed: '<path d="M7 31c8-14 15-14 22-21M8 18v13h13"/><path d="M21 36l18-18"/>',
    shotSpeed: '<path d="M5 13h15M5 23h24M5 33h15"/><path d="M31 13l10 10-10 10"/>',
    planetSize: '<circle cx="24" cy="24" r="15"/><circle cx="18" cy="17" r="3"/>',
    shotSize: '<circle cx="24" cy="24" r="17"/><circle cx="18" cy="18" r="4"/>',
    volley: '<circle cx="10" cy="24" r="4"/><circle cx="24" cy="24" r="6"/><circle cx="38" cy="24" r="4"/><path d="M14 24h4m12 0h4"/>',
    midGrowth: '<path d="M5 10h38M5 38h38"/><circle cx="24" cy="24" r="12"/><circle cx="24" cy="24" r="4"/>',
    shatter: '<circle cx="24" cy="24" r="10"/><path d="M24 3v10M24 35v10M3 24h10M35 24h10M9 9l8 8m14 14 8 8M39 9l-8 8M17 31l-8 8"/>',
    smallBody: '<circle cx="24" cy="24" r="9"/><path d="M7 24h9M32 24h9M11 19l-5 5 5 5M37 19l5 5-5 5"/>',
    clashBlast: '<circle cx="24" cy="24" r="7"/><path d="M24 3v12M24 33v12M3 24h12M33 24h12M9 9l9 9M30 30l9 9M39 9l-9 9M18 30l-9 9"/>',
    mines: '<path d="M24 7v8M24 33v8M7 24h8M33 24h8M12 12l6 6m12 12 6 6M36 12l-6 6m-12 12-6 6"/><circle cx="24" cy="24" r="8"/><circle cx="24" cy="24" r="18" stroke-dasharray="2 4"/>',
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
    reflect: '<path d="M7 24h28M27 15l9 9-9 9"/><path d="M39 12v24"/>',
    satelliteSize: '<circle cx="24" cy="24" r="5"/><circle cx="24" cy="24" r="13"/><circle cx="24" cy="7" r="4"/><circle cx="39" cy="33" r="4"/>',
    lastLight: '<circle cx="24" cy="24" r="8"/><path d="M24 3v8M24 37v8M3 24h8M37 24h8M9 9l6 6M33 33l6 6M39 9l-6 6M15 33l-6 6"/>',
    crown: '<path d="M5 14l10 9 9-15 9 15 10-9-4 25H9z"/><path d="M10 33h28"/>'
  };
  const aliases = { dash: 'moveSpeed', heavy: 'planetSize', orbitRange: 'bounce', spawnCooldown: 'spawnSpeed' };
  const custom = {
    swiftmove: shapes.moveSpeedX, verticaldrive: shapes.moveSpeedY, fastplanet: shapes.launchSpeed, kineticdrive: shapes.launchSpeed,
    comet: shapes.cometTrail, quickreturn: shapes.spawnCooldown,
    satellite: '<circle cx="24" cy="24" r="7"/><ellipse cx="24" cy="24" rx="21" ry="15"/><circle cx="7" cy="13" r="3.5"/><circle cx="41" cy="35" r="3.5"/>',
    orbitglass: '<circle cx="24" cy="24" r="6"/><ellipse cx="24" cy="24" rx="22" ry="19"/><circle cx="6" cy="13" r="3"/><circle cx="40" cy="34" r="3"/>',
    twinmoon: '<circle cx="24" cy="24" r="6"/><ellipse cx="24" cy="24" rx="18" ry="12"/><circle cx="8" cy="24" r="3"/><circle cx="40" cy="24" r="3"/><path d="m37 19 4 5-6 1"/>',
    ricochet: '<path d="M8 7v29h31M14 31l-6 6 6 6"/><circle cx="26" cy="19" r="5"/><path d="m28 13 8-7m-5 0h5v5"/>',
    ironcore: '<circle cx="24" cy="24" r="13"/><circle cx="24" cy="24" r="5"/><path d="M24 3v7m0 28v7M3 24h7m28 0h7M34 14l8-6m-7 0h7v7"/>',
    coldfront: '<path d="M24 5v38M7 14l34 20M7 34l34-20M18 10l6-5 6 5M18 38l6 5 6-5M8 21l-1-7 7 1M41 27l1 7-7-1"/>',
    clashblast: shapes.clashBlast
  };
  return `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${custom[id] || shapes[stat] || shapes[aliases[stat]] || shapes.spawnRate}</svg>`;
}

function renderOffers(index) {
  const side = index ? 'two' : 'one', player = state.players[index], root = document.querySelector(`#card-offers-${side}`);
  root.innerHTML = '';
  state.upgradeOffers[index].forEach((card, offerIndex) => {
    const level = player.cards[card.id] || 0, button = document.createElement('button');
    button.className = `relic-card ${level ? '' : 'new-relic-card'} ${signatureRelics.has(card.id) ? 'signature-relic' : ''}`; button.type = 'button'; button.dataset.card = card.id;
    button.disabled = (state.mode === 'ai' && index === 1) || (state.upgradeChoices[index] !== null && state.upgradeChoices[1 - index] !== null);
    const selected = state.upgradeChoices[index] === card.id;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.style.setProperty('--offer-index', offerIndex);
    const startBonus = state.initialUpgradePhase && !player.startUpgradeBonusUsed ? Math.round(2 * planetBonusStrength(player, 'firstRelic')) : 0;
    const satelliteBonus = ['satellite', 'moonmass', 'moonreturn', 'twinmoon', 'orbitglass'].includes(card.id) && hasSynergy(player, 'satelliteLevel') && level === 0 ? 1 : 0;
    const offeredRank = Math.min((card.maxLevel || 3) + startBonus, level + 1 + satelliteBonus + startBonus), stars = '★'.repeat(Math.max(1, Math.min(3, offeredRank)));
    const description = relicDescription(card, offeredRank);
    const action = level ? '<small class="relic-offer-action">Повысить ранг</small>' : '';
    button.innerHTML = `<span class="relic-icon">${relicIcon(card.stat, card.id)}</span><span class="relic-rank" aria-label="Ранг ${offeredRank}">${stars}</span><strong>${card.name}</strong><p>${description}</p>${action}<small class="relic-branch-tag">${relicBranches.find(branch => branch.id === card.branch)?.name || ''}</small>`;
    button.addEventListener('click', () => chooseUpgrade(index, card.id)); root.append(button);
  });
}

function resetUpgradeRoster(index) {
  if (state.phase !== 'upgrade' || state.upgradeChoices[1 - index] !== null) return;
  const player = state.players[index];
  if (!player || player.rosterResetPoints < 1) return;
  const previous = state.upgradePrevious[index];
  if (previous && state.upgradeChoices[index]) {
    setRelicRank(player, previous.id, previous.level);
    player.startUpgradeBonusUsed = previous.startBonusUsed;
    state.upgradeChoices[index] = null;
  }
  player.rosterResetPoints--;
  player.cards = {};
  state.upgradePrevious[index] = null;
  state.upgradeOffers[index] = offerFor(player, false);
  state.upgradeFocus[index] = 0;
  renderOffers(index);
  const side = index ? 'two' : 'one', button = document.querySelector(`#upgrade-reset-${side}`);
  button.classList.toggle('hidden', player.rosterResetPoints < 1);
  button.disabled = state.upgradeChoices[1 - index] !== null;
  button.textContent = `Перезапустить ростер · ${player.rosterResetPoints} ${resetPointLabel(player.rosterResetPoints)}`;
  document.querySelector(`#upgrade-role-${side}`).textContent = '';
  sound('upgrade', index);
}

function moveUpgradeFocus(playerIndex, delta) {
  if (state.phase !== 'upgrade' || state.upgradeChoices[playerIndex] !== null || (state.mode === 'ai' && playerIndex === 1)) return;
  const side = playerIndex ? 'two' : 'one', root = document.querySelector(`#card-offers-${side}`), cards = [...root.querySelectorAll('.relic-card:not(:disabled)')];
  if (!cards.length) return;
  state.upgradeFocus[playerIndex] = (state.upgradeFocus[playerIndex] + delta + cards.length) % cards.length;
  cards[state.upgradeFocus[playerIndex]].focus({ preventScroll: true });
  sound('tick', playerIndex);
}

function activateUpgrade(playerIndex) {
  if (state.phase !== 'upgrade' || state.upgradeChoices[playerIndex] !== null || (state.mode === 'ai' && playerIndex === 1)) return;
  const card = state.upgradeOffers[playerIndex]?.[state.upgradeFocus[playerIndex]];
  if (card) chooseUpgrade(playerIndex, card.id);
}

function chooseUpgrade(playerIndex, cardId) {
  if (state.phase !== 'upgrade' || (state.upgradeChoices[playerIndex] !== null && state.upgradeChoices[1 - playerIndex] !== null)) return;
  const card = state.upgradeOffers[playerIndex].find(item => item.id === cardId), player = state.players[playerIndex];
  if (!card) return;
  if (state.upgradeChoices[playerIndex] === cardId) return;
  if (state.upgradeChoices[playerIndex] !== null) {
    const previous = state.upgradePrevious[playerIndex];
    if (previous) {
      setRelicRank(player, previous.id, previous.level);
      player.startUpgradeBonusUsed = previous.startBonusUsed;
    }
  }
  state.upgradePrevious[playerIndex] = { id: card.id, level: player.cards[card.id] || 0, startBonusUsed: player.startUpgradeBonusUsed };
  sound('upgrade', playerIndex);
  const startBonus = state.initialUpgradePhase && !player.startUpgradeBonusUsed ? Math.round(2 * planetBonusStrength(player, 'firstRelic')) : 0;
  const satelliteRelics = ['satellite', 'moonmass', 'moonreturn', 'twinmoon', 'orbitglass'];
  const satelliteBonus = satelliteRelics.includes(card.id) && hasSynergy(player, 'satelliteLevel') && !(player.cards[card.id] || 0) ? 1 : 0;
  setRelicRank(player, card.id, Math.min((card.maxLevel || 3) + startBonus, (player.cards[card.id] || 0) + 1 + satelliteBonus + startBonus));
  if (state.initialUpgradePhase) player.startUpgradeBonusUsed = true;
  state.upgradeChoices[playerIndex] = cardId;
  const side = playerIndex ? 'two' : 'one', root = document.querySelector(`#card-offers-${side}`);
  if (playerIndex === 1) document.querySelector('#upgrade-side-two').classList.remove('ai-thinking');
  document.querySelector(`#upgrade-role-${side}`).textContent = '';
  document.querySelector(`#upgrade-reset-${side}`).disabled = state.upgradeChoices[1 - playerIndex] !== null;
  document.querySelector(`#upgrade-reset-${playerIndex ? 'one' : 'two'}`).disabled = true;
  root.querySelectorAll('.relic-card').forEach(button => {
    const selected = button.dataset.card === cardId;
    button.disabled = state.upgradeChoices[1 - playerIndex] !== null;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const selectedCard = root.querySelector(`[data-card="${cardId}"]`);
  state.upgradeFocus[playerIndex] = state.upgradeOffers[playerIndex].findIndex(item => item.id === cardId);
  selectedCard.classList.remove('new-relic-card', 'signature-relic');
  if (state.upgradeChoices.every(Boolean)) scheduleUpgradeStart();
}

function scheduleUpgradeStart() {
  clearTimeout(state.startDuelTimer);
  state.startDuelTimer = window.setTimeout(() => {
    state.startDuelTimer = 0;
    if (!isPauseOpen()) startDuel();
  }, 300);
}

function showEnding(winner, reason = 'match') {
  let unlockedDifficulty = null;
  let newlyUnlockedPlanets = [];
  if (state.mode === 'ai' && winner === 0) {
    career.difficultyWins ||= Array(aiDifficulties.length).fill(0);
    if (!(career.difficultyWins[state.aiDifficulty] || 0)) {
      newlyUnlockedPlanets = ballSkins.filter((_, index) => skinDifficultyUnlocks[index] === state.aiDifficulty);
    }
    career.difficultyWins[state.aiDifficulty] = (career.difficultyWins[state.aiDifficulty] || 0) + 1;
    const nextDifficulty = Math.min(aiDifficulties.length - 1, state.aiDifficulty + 1);
    if (nextDifficulty > (career.difficultyUnlocked || 0)) {
      career.difficultyUnlocked = nextDifficulty;
      unlockedDifficulty = aiDifficulties[nextDifficulty].name;
    }
  }
  try { localStorage.setItem(CAREER_KEY, JSON.stringify(career)); } catch {}
  recordCareerSession();
  const unlocks = document.querySelector('#session-skins');
  const unlockedSynergy = state.newlyUnlockedSynergy;
  if (unlockedSynergy) unlocks.insertAdjacentHTML('beforeend', `<span class="unlock-chip synergy-unlock"><b>СИНЕРГИЯ · ${unlockedSynergy.name}</b></span>`);
  state.newlyUnlockedSynergy = null;
  if (newlyUnlockedPlanets.length) unlocks.insertAdjacentHTML('beforeend', newlyUnlockedPlanets.map(skin => `<span class="unlock-chip planet-unlock"><b>НОВАЯ ПЛАНЕТА · ${skin.name}</b></span>`).join(''));
  if (unlockedDifficulty) unlocks.insertAdjacentHTML('beforeend', `<span class="unlock-chip difficulty-unlock"><b>НОВЫЙ СТАТУС · ${unlockedDifficulty}</b></span>`);
  const p1 = winner === 0, localDuel = state.mode === 'pvp', surrendered = reason === 'surrender', winnerTitle = surrendered ? 'ПЛАНЕТЫ ОСТАНОВИЛИСЬ' : localDuel ? `ПОБЕДИЛА ${p1 ? 'СИНЯЯ' : 'КРАСНАЯ'} ПЛАНЕТА` : p1 ? 'ПЛАНЕТА ВЫЖИЛА' : 'ТВОЯ ПЛАНЕТА УНИЧТОЖЕНА';
  const ending = document.querySelector('#ending');
  ending.classList.remove('defeat', 'victory', 'result-red', 'result-blue', 'local-result', 'surrender'); void ending.offsetWidth;
  ending.classList.toggle('defeat', !p1 && !localDuel && !surrendered); ending.classList.toggle('victory', (p1 || localDuel) && !surrendered); ending.classList.toggle('surrender', surrendered);
  ending.classList.add(p1 ? 'result-blue' : 'result-red'); ending.classList.toggle('local-result', localDuel);
  ending.style.setProperty('--result-accent', p1 ? '#4d9ab0' : '#bd533d');
  document.querySelector('#ending-title').textContent = winnerTitle;
  switchScreen('ending'); if (p1 && window.PLAIR?.score) window.PLAIR.score(5);
}

function resizeCanvas() {
  if (!canvas || screens.battle.classList.contains('hidden')) return;
  const rect = canvas.getBoundingClientRect(), nextLandscape = rect.width > rect.height;
  if (nextLandscape !== landscapeWorld) {
    const oldW = W, oldH = H; landscapeWorld = nextLandscape; W = landscapeWorld ? 760 : 640; H = landscapeWorld ? 720 : 900; MID = H / 2;
    const sx = W / oldW, sy = H / oldH;
    const scalePoint = point => { if (point) { point.x *= sx; point.y *= sy; } };
    scalePoint(state.finalBreach);
    state.players.forEach(p => {
      scalePoint(p);
      p.targetX *= sx; p.targetY *= sy;
      p.previousX = p.x; p.previousY = p.y;
      (p.guardTrail || []).forEach(scalePoint);
      (p.moonPositions || []).forEach(scalePoint);
    });
    state.shots.forEach(s => { scalePoint(s); s.vx *= sx; s.vy *= sy; s.trail.forEach(scalePoint); }); state.chargeNodes.forEach(scalePoint); state.blockNodes.forEach(scalePoint);
  state.pendingShots.forEach(s => { scalePoint(s.from); scalePoint(s.target); }); state.slowFields.forEach(scalePoint); state.particles.forEach(p => { scalePoint(p); p.vx *= sx; p.vy *= sy; });
    state.gestures.forEach(g => { scalePoint({ get x(){return g.x}, set x(v){g.x=v}, get y(){return g.y}, set y(v){g.y=v} }); scalePoint({ get x(){return g.startX}, set x(v){g.startX=v}, get y(){return g.startY}, set y(v){g.startY=v} }); });
    state.ambient = Array.from({ length: 70 }, (_, i) => ({ x: (i * 157 + 37) % W, y: (i * 113 + 53) % H, size: i % 7 === 0 ? 2 : 1, phase: i * .7 }));
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  drawFrameSafely();
}

function drawArena() {
  if (!canvas.width) return;
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0); ctx.fillStyle = '#06070b'; ctx.fillRect(0, 0, W, H);
  const now = performance.now(), time = now * .001;
  ctx.fillStyle = '#159ff20a'; ctx.fillRect(0, MID, W, H - MID); ctx.fillStyle = '#ff382f09'; ctx.fillRect(0, 0, W, MID);
  state.players.forEach(player => {
    const color = player.index ? '#ff6158' : '#69caff', y = player.index ? 40 : H - 40;
    const geometry = guardGeometry(player);
    const left = guardLeft(player, geometry);
    ctx.save(); ctx.lineCap = 'square'; ctx.lineWidth = 5; ctx.shadowColor = color; ctx.shadowBlur = player.hitFlash > 0 ? 10 : 4;
    for (let slot = 0; slot < player.shieldBars.length; slot++) {
      const x = guardSlotCenter(left, geometry, slot), { width } = geometry.slots[slot];
      if (!player.shieldBars[slot] || ((player.shieldLayerHits?.[slot] || 0) <= 0 && player.shieldTimers?.[slot] > 0)) {
        if (player.shieldTimers?.[slot] > 0) {
          const progress = 1 - player.shieldTimers[slot] / shieldRestoreDuration(player);
          const fillWidth = width * progress, pulse = .055 + Math.sin(time * 5 + slot) * .008;
          ctx.save(); ctx.lineCap = 'round';
          ctx.globalAlpha = .015; ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.shadowColor = color; ctx.shadowBlur = 4;
          ctx.beginPath(); ctx.moveTo(x - width / 2, y); ctx.lineTo(x + width / 2, y); ctx.stroke();
          ctx.globalAlpha = .065; ctx.shadowBlur = 0; ctx.lineWidth = 1; ctx.strokeStyle = color;
          ctx.strokeRect(x - width / 2, y - 5, width, 10);
          if (fillWidth > 0) {
            ctx.globalAlpha = pulse; ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 3;
            ctx.fillRect(x - fillWidth / 2, y - 3, fillWidth, 6);
            ctx.globalAlpha = .12; ctx.shadowBlur = 0; ctx.strokeStyle = '#f3f3ef'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x - fillWidth / 2, y - 4); ctx.lineTo(x - fillWidth / 2, y + 4); ctx.moveTo(x + fillWidth / 2, y - 4); ctx.lineTo(x + fillWidth / 2, y + 4); ctx.stroke();
          }
          ctx.restore();
        }
        continue;
      }
      const layers = player.shieldLayerHits?.[slot] || 0, inward = player.index ? 1 : -1;
      for (let layer = 1; layer < layers; layer++) {
        ctx.globalAlpha = .42 - layer * .08; ctx.lineWidth = 2; ctx.shadowBlur = 0; ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(x - width / 2, y + inward * layer * 4); ctx.lineTo(x + width / 2, y + inward * layer * 4); ctx.stroke();
      }
      ctx.globalAlpha = layers > 0 ? .98 : .14; ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(x - width / 2, y); ctx.lineTo(x + width / 2, y); ctx.stroke();
      ctx.globalAlpha = .55; ctx.shadowBlur = 0; ctx.lineWidth = 1; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x - width / 2 + 5, y - 1); ctx.lineTo(x + width / 2 - 5, y - 1); ctx.stroke(); ctx.lineWidth = 5; ctx.shadowBlur = 4;
    }
      const cornerLevel = statsFor(player).cornerGuards;
    if (cornerLevel) for (let side = 0; side < 2; side++) {
      const x = side === 0 ? 32 : W - 32;
      const directionX = side === 0 ? 1 : -1;
      // Red is at the top and opens down into the arena; blue mirrors it upward.
      const directionY = player.index === 1 ? 1 : -1;
      const length = 18 + cornerLevel * 11, cornerY = player.index ? 40 : H - 40;
      ctx.save(); ctx.globalAlpha = .42; ctx.strokeStyle = color; ctx.lineWidth = 1.4 + cornerLevel * .35; ctx.shadowColor = color; ctx.shadowBlur = 5 + cornerLevel * 2; ctx.lineCap = 'square';
      ctx.beginPath(); ctx.moveTo(x, cornerY); ctx.lineTo(x + directionX * length, cornerY); ctx.lineTo(x + directionX * length, cornerY + directionY * length); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  });
  ctx.fillStyle = '#dce1ec';
  state.ambient.forEach(star => { ctx.globalAlpha = .12 + (Math.sin(time + star.phase) + 1) * .1; ctx.fillRect(star.x, star.y, star.size, star.size); }); ctx.globalAlpha = 1;
  ctx.strokeStyle = '#d7d8dc24'; ctx.lineWidth = 1;
  ctx.strokeRect(24, 30, W - 48, H - 60);
  ctx.save(); ctx.setLineDash([3, 8]); ctx.strokeStyle = '#e7e4d74a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(30, MID); ctx.lineTo(W - 30, MID); ctx.stroke(); ctx.restore();
  state.players.forEach(player => { ctx.globalAlpha = .14; ctx.strokeStyle = player.index ? '#ff7770' : '#69caff'; ctx.beginPath(); ctx.moveTo(38, player.y); ctx.lineTo(W - 38, player.y); ctx.stroke(); }); ctx.globalAlpha = 1;
  drawLayer('charge points', () => drawChargeNodes(time));
  drawLayer('interception points', () => drawBlockNodes(time));
  drawLayer('score marker', drawMatchMarker);
  drawLayer('slow fields', () => drawSlowFields(time));
  drawLayer('guardian trails', () => state.players.forEach(player => drawGuardTrail(player)));
  drawLayer('balls', () => drawShots(time), () => state.shots.forEach(shot => drawEmergencyOrb(shot.x, shot.y, Math.max(5, shot.radius || 8), shot.owner ? '#bd533d' : '#4d9ab0')));
  drawLayer('impacts', drawShotImpacts);
  drawLayer('touch marks', drawTapMarks);
  state.players.forEach(player => drawLayer(`planet ${player.index}`, () => drawPlayer(player, now), () => drawEmergencyOrb(player.x, player.y, 20, player.index ? '#bd533d' : '#4d9ab0')));
  drawLayer('particles', drawParticles);
  if (state.finalBreach) drawBreachBlast(state.finalBreach);
}

function drawBreachBlast({ x, y, defender, progress }) {
  const inward = defender ? 1 : -1;
  const color = defender ? '#ff7960' : '#70caff';
  const hot = defender ? '#ffe0a0' : '#dcf8ff';
  const fade = 1 - progress;
  const spread = 1 - fade ** 2.5;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, inward);
  ctx.globalCompositeOperation = 'lighter';

  const glowRadius = 30 + spread * 55;
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
  glow.addColorStop(0, hot);
  glow.addColorStop(.22, color);
  glow.addColorStop(1, '#ffffff00');
  ctx.globalAlpha = .72 * fade ** 2;
  ctx.fillStyle = glow;
  ctx.fillRect(-glowRadius, -glowRadius, glowRadius * 2, glowRadius * 2);

  ctx.lineCap = 'round';
  for (let wave = 0; wave < 2; wave++) {
    const phase = Math.max(0, (progress - wave * .12) / (1 - wave * .12));
    const radius = 14 + (1 - (1 - phase) ** 2.5) * (wave ? 56 : 94);
    ctx.globalAlpha = (wave ? .38 : .78) * (1 - phase) ** 1.5;
    ctx.strokeStyle = wave ? color : hot;
    ctx.lineWidth = (wave ? 2 : 4) * (1 - phase) + .7;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * .74, 0, -.09, Math.PI + .09);
    ctx.stroke();
  }

  ctx.globalAlpha = fade * .85;
  ctx.strokeStyle = hot;
  ctx.lineWidth = 1.35;
  ctx.beginPath();
  for (let shard = 0; shard < 13; shard++) {
    const angle = (shard + .45) / 13 * Math.PI;
    const reach = 16 + spread * (44 + (shard * 29) % 58);
    const length = 4 + (shard % 4) * 3;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    ctx.moveTo(dx * (reach - length), dy * (reach - length));
    ctx.lineTo(dx * reach, dy * reach);
  }
  ctx.stroke();

  ctx.globalAlpha = .85 * fade;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-21, 0); ctx.lineTo(-7, 0);
  ctx.moveTo(7, 0); ctx.lineTo(21, 0);
  ctx.stroke();
  ctx.restore();
}

function drawEmergencyOrb(x, y, radius, color) {
  ctx.globalAlpha = 1; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
}

function drawLayer(name, draw, fallback = null) {
  ctx.save();
  try { draw(); }
  catch (error) { console.error(`PLΛNETS ${name} draw failed.`, error); if (fallback) { try { fallback(); } catch (fallbackError) { console.error(`PLΛNETS ${name} fallback failed.`, fallbackError); } } }
  finally { ctx.restore(); }
}

function drawChargeNodes(time) {
  for (const node of state.chargeNodes) {
    const color = node.owner ? '#ff7770' : '#69caff', charging = node.charge || 0;
    const reveal = Math.max(0, Math.min(1, node.appear || 0)), pulse = Math.sin(time * 3 + node.phase);
    if (state.tutorial?.source === node) {
      ctx.save();
      ctx.strokeStyle = '#ffe19a';
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = .75;
      ctx.beginPath(); ctx.arc(node.x, node.y, 22, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(node.x, node.y, 25, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * charging); ctx.stroke();
      ctx.restore();
    }
    const radius = (10 + pulse * 1.1) * (.22 + reveal * .78);
    const angle = chargeNodeAim(node, state.players[node.owner]), length = 24 + charging * 21;
    ctx.save(); ctx.globalAlpha = reveal * (.52 + charging * .4); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.25; ctx.shadowColor = color; ctx.shadowBlur = 3 + charging * 10;
    // A pair of expanding rings makes the random spawn read as an arrival.
    ctx.beginPath(); ctx.arc(node.x, node.y, radius, 0, Math.PI * 2); ctx.stroke();
    if (reveal < .96) { ctx.globalAlpha = 1 - reveal; ctx.beginPath(); ctx.arc(node.x, node.y, 13 + reveal * 29, 0, Math.PI * 2); ctx.stroke(); }
    ctx.shadowBlur = 0; ctx.globalAlpha = reveal * (.12 + charging * .5); ctx.beginPath(); ctx.arc(node.x, node.y, 3.5 + charging * 3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = reveal * (.32 + charging * .56); ctx.setLineDash([2, 4]); ctx.lineWidth = 2.1; ctx.beginPath(); ctx.arc(node.x, node.y, radius + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * charging); ctx.stroke(); ctx.setLineDash([]);
    // The aim preview shows how standing to either side curves the serve.
    ctx.globalAlpha = reveal * (.16 + charging * .5); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(node.x + Math.cos(angle) * length, node.y + Math.sin(angle) * length); ctx.stroke();
    const tipX = node.x + Math.cos(angle) * length, tipY = node.y + Math.sin(angle) * length;
    ctx.beginPath(); ctx.arc(tipX, tipY, 2 + charging * 1.6, 0, Math.PI * 2); ctx.fill();
    if (node.moonLinked) {
      const player = state.players[node.owner], moonIndex = player?.satellites.findIndex(Boolean) ?? -1;
      if (moonIndex >= 0) {
        const moon = satellitePosition(player, moonIndex), distance = Math.hypot(moon.x - node.x, moon.y - node.y);
        ctx.globalAlpha = reveal * .2; ctx.strokeStyle = '#f2e8cd'; ctx.lineWidth = 1; ctx.setLineDash([2, 5]);
        ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(moon.x, moon.y); ctx.stroke(); ctx.setLineDash([]);
        if (distance < 50) { ctx.globalAlpha = reveal * .34; ctx.beginPath(); ctx.arc(node.x, node.y, 15 + Math.sin(time * .008) * 1.5, 0, Math.PI * 2); ctx.stroke(); }
      }
    }
    ctx.restore();
  }
}

function drawBlockNodes(time) {
  for (const point of state.blockNodes) {
    const color = point.owner ? '#ff7770' : '#69caff', alpha = Math.max(0, Math.min(1, point.appear || 0)), pulse = Math.sin(time * 4 + point.phase), w = point.width || 34, h = point.height || 18;
    ctx.save(); ctx.globalAlpha = alpha * (point.armed ? .92 : .46 + point.charge * .34); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = point.armed ? 1.8 : 1.1; ctx.shadowColor = color; ctx.shadowBlur = point.armed ? 12 : 4;
    ctx.fillRect(point.x - w / 2, point.y - h / 2, w, h);
    ctx.globalAlpha *= point.armed ? .84 : .45; ctx.strokeRect(point.x - w / 2, point.y - h / 2, w, h);
    ctx.setLineDash([3, 3]); ctx.globalAlpha *= .64; ctx.strokeRect(point.x - w / 2 - 4, point.y - h / 2 - 4, w + 8, h + 8); ctx.setLineDash([]);
    ctx.globalAlpha = alpha * (point.armed ? .88 : .3 + point.charge * .6); ctx.fillRect(point.x - w * .32, point.y - 1, w * .64 * (point.armed ? 1 : point.charge), 2);
    if (point.armed) { ctx.globalAlpha = .2 + pulse * .06; ctx.fillRect(point.x - w / 2 - 2, point.y - h / 2 - 2, w + 4, h + 4); }
    ctx.restore();
  }
}

function drawGuardTrail(player) {
  const level = statsFor(player).guardTrail;
  if (!level || !player.guardTrail?.length) return;
  const color = player.index ? '#ff7770' : '#69caff';
  ctx.save(); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8;
  for (const segment of player.guardTrail) {
    const life = Math.max(0, Math.min(1, segment.life / segment.maxLife));
    const arming = Math.min(1, (segment.maxLife - segment.life) / guardTrailArming);
    ctx.globalAlpha = life * (.24 + arming * .52);
    ctx.save(); ctx.translate(segment.x, segment.y); ctx.rotate(segment.angle);
    const halfWidth = guardTrailHalfWidth(level), halfLength = 9 + level * 2;
    ctx.fillRect(-halfLength, -halfWidth, halfLength * 2, halfWidth * 2);
    ctx.restore();
  }
  ctx.restore();
}

function drawFrameSafely() {
  try { drawArena(); return; }
  catch (error) {
    console.error('PLΛNETS draw failed; drawing a recovery frame.', error);
    if (!canvas.width || !canvas.height) return;
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0); ctx.fillStyle = '#06070b'; ctx.fillRect(0, 0, W, H);
    state.players.forEach(player => { ctx.fillStyle = player.index ? '#bd533d' : '#4d9ab0'; ctx.beginPath(); ctx.arc(player.x, player.y, 20, 0, Math.PI * 2); ctx.fill(); });
    state.shots.forEach(shot => { ctx.fillStyle = '#ece8dd'; ctx.beginPath(); ctx.arc(shot.x, shot.y, Math.max(4, shot.radius || 8), 0, Math.PI * 2); ctx.fill(); });
    state.chargeNodes.forEach(node => { ctx.strokeStyle = node.owner ? '#ff7770' : '#69caff'; ctx.beginPath(); ctx.arc(node.x, node.y, 10, 0, Math.PI * 2); ctx.stroke(); });
    state.blockNodes.forEach(node => { ctx.strokeStyle = node.owner ? '#ff7770' : '#69caff'; ctx.strokeRect(node.x - (node.width || 34) / 2, node.y - (node.height || 18) / 2, node.width || 34, node.height || 18); });
  }
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

function drawSecondPlanetSigil(skin, x, y, radius, color) {
  const detail = skin?.detail || '#eee9dd';
  ctx.save();
  ctx.globalAlpha = .94;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#f2f0e8';
  ctx.lineWidth = Math.max(.9, radius * .11);
  ctx.shadowColor = detail;
  ctx.shadowBlur = 5;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = detail; ctx.fillStyle = detail; ctx.lineWidth = Math.max(.8, radius * .12);
  if (skin?.mark === 'crater') {
    ctx.beginPath(); ctx.arc(x, y, radius * .48, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + radius * .4, y + radius * .36, radius * .12, 0, Math.PI * 2); ctx.fill();
  } else if (skin?.mark === 'facet') {
    ctx.beginPath(); ctx.moveTo(x, y - radius * .62); ctx.lineTo(x + radius * .55, y); ctx.lineTo(x, y + radius * .62); ctx.lineTo(x - radius * .55, y); ctx.closePath(); ctx.stroke();
  } else if (skin?.mark === 'leaf') {
    ctx.beginPath(); ctx.ellipse(x, y, radius * .25, radius * .56, -.65, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - radius * .28, y + radius * .34); ctx.lineTo(x + radius * .28, y - radius * .34); ctx.stroke();
  } else if (skin?.mark === 'ring') {
    ctx.beginPath(); ctx.arc(x, y, radius * .58, 0, Math.PI * 2); ctx.stroke();
  } else if (skin?.mark === 'stripe') {
    ctx.beginPath(); ctx.moveTo(x - radius * .55, y + radius * .38); ctx.lineTo(x + radius * .55, y - radius * .38); ctx.stroke();
  } else if (skin?.mark === 'spot' || skin?.mark === 'spots') {
    ctx.beginPath(); ctx.arc(x + radius * .18, y + radius * .12, radius * .25, 0, Math.PI * 2); ctx.fill();
    if (skin.mark === 'spots') { ctx.beginPath(); ctx.arc(x - radius * .28, y - radius * .22, radius * .14, 0, Math.PI * 2); ctx.fill(); }
  } else if (skin?.mark === 'comet') {
    ctx.beginPath(); ctx.moveTo(x - radius * .6, y + radius * .35); ctx.lineTo(x + radius * .18, y - radius * .08); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + radius * .3, y - radius * .2, radius * .18, 0, Math.PI * 2); ctx.fill();
  } else {
    [.35, .68].forEach(scale => { ctx.beginPath(); ctx.arc(x, y, radius * scale, 0, Math.PI * 2); ctx.stroke(); });
  }
  ctx.restore();
}

function drawPlayer(player, now) {
  const color = player.index ? '#ff382f' : '#159ff2';
  const auraStrength = activeChillRank(player);
  if (auraStrength) {
    const spread = chillConeHalfAngle(auraStrength);
    ctx.save(); ctx.globalAlpha = .035 + Math.sin(now * .002) * .008; ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.arc(player.x, player.y, chillConeRange, player.facingAngle - spread, player.facingAngle + spread); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = .25 + Math.sin(now * .002) * .04; ctx.strokeStyle = color; ctx.lineWidth = 1.2 + Math.min(1.5, auraStrength * .3); ctx.setLineDash([5, 7]);
    ctx.stroke(); ctx.restore();
  }
  player.satellites.forEach((alive, i) => {
    const { x, y } = satellitePosition(player, i);
    const appear = i === player.spawnMoonSlot ? player.spawnMoonAppear || 0 : 0;
    const moonRadius = satelliteRadius(player);
    if (!alive) {
      if (player.satelliteTimers?.[i] > 0) {
        const ready = 1 - player.satelliteTimers[i] / moonRestoreDuration(player);
        ctx.save(); ctx.globalAlpha = .18 + ready * .2; ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.arc(x, y, moonRadius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = .72; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, moonRadius + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ready); ctx.stroke(); ctx.restore();
      }
      return;
    }
    ctx.save();
    if (appear) {
      ctx.globalAlpha = appear / .38; ctx.strokeStyle = color; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(x, y, moonRadius + 3 + (1 - appear / .38) * 13, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#f0efe9'; ctx.beginPath(); ctx.arc(x, y, moonRadius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 2.1, 0, Math.PI * 2); ctx.fill();
    const protectedMoon = Boolean(player.moonInvulnerable?.[i]);
    const hits = player.satelliteHits[i] || 1;
    ctx.strokeStyle = protectedMoon ? '#ffe19a' : color; ctx.lineWidth = 1.5;
    if (protectedMoon) {
      ctx.beginPath(); ctx.arc(x, y, moonRadius + 3, 0, Math.PI * 2); ctx.stroke();
    } else {
      for (let layer = 1; layer < hits; layer++) {
        const angle = -Math.PI / 2 + (layer - 1) * Math.PI;
        ctx.beginPath(); ctx.arc(x, y, moonRadius + 3, angle - .55, angle + .55); ctx.stroke();
      }
    }
    ctx.restore();
  });
  const radius = playerRadius(player);
  const skin = ballSkins[player.skin] || ballSkins[0], halves = playerSkinHalves(player), otherSkin = ballSkins[halves[1]] || skin;
  const opponent = state.players[1 - player.index], faceAngle = opponent ? Math.atan2(opponent.y - player.y, opponent.x - player.x) : player.index ? Math.PI / 2 : -Math.PI / 2;
  ctx.globalAlpha = player.orbReady ? 1 : .82;
  const planetGradient = ctx.createRadialGradient(player.x - radius * .34, player.y - radius * .38, radius * .04, player.x + radius * .16, player.y + radius * .18, radius * 1.42);
  planetGradient.addColorStop(0, color); planetGradient.addColorStop(.55, color); planetGradient.addColorStop(1, '#172326');
  ctx.fillStyle = planetGradient; ctx.beginPath(); ctx.arc(player.x, player.y, radius, 0, Math.PI * 2); ctx.fill();
  const planetSheen = ctx.createRadialGradient(player.x - radius * .34, player.y - radius * .38, radius * .04, player.x + radius * .16, player.y + radius * .18, radius * 1.42);
  planetSheen.addColorStop(0, '#fff9'); planetSheen.addColorStop(.33, '#ffffff20'); planetSheen.addColorStop(1, '#17232690');
  ctx.fillStyle = planetSheen; ctx.beginPath(); ctx.arc(player.x, player.y, radius, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(faceAngle + Math.PI / 2); ctx.translate(-player.x, -player.y); ctx.beginPath(); ctx.arc(player.x, player.y, radius, 0, Math.PI * 2); ctx.clip(); ctx.strokeStyle = skin.detail; ctx.fillStyle = skin.detail; ctx.lineWidth = Math.max(1.5, radius * .1);
  if (skin.mark === 'crater') {
    ctx.globalAlpha = .28; ctx.beginPath(); ctx.ellipse(player.x + radius * .02, player.y + radius * .03, radius * .45, radius * .43, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = .95; ctx.lineWidth = Math.max(1.5, radius * .08); ctx.stroke();
    ctx.beginPath(); ctx.arc(player.x + radius * .64, player.y + radius * .64, radius * .14, 0, Math.PI * 2); ctx.globalAlpha = .38; ctx.fill(); ctx.globalAlpha = .98; ctx.stroke();
  }
  if (skin.mark === 'facet') {
    ctx.lineWidth = Math.max(1.5, radius * .08); ctx.beginPath(); ctx.moveTo(player.x, player.y - radius * .86); ctx.lineTo(player.x + radius * .86, player.y - radius * .28); ctx.lineTo(player.x + radius * .48, player.y + radius * .86); ctx.lineTo(player.x - radius * .55, player.y + radius * .54); ctx.lineTo(player.x - radius, player.y - radius * .25); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(player.x + radius * .38, player.y - radius * .9); ctx.lineTo(player.x - radius * .08, player.y + radius * .65); ctx.stroke();
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
    [.46, .72].forEach(scale => { ctx.beginPath(); ctx.arc(player.x, player.y, radius * scale, 0, Math.PI * 2); ctx.stroke(); });
    ctx.beginPath(); ctx.arc(player.x, player.y, radius * .13, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  if (halves[0] != null && halves[1] != null && halves[0] !== halves[1]) {
    drawSecondPlanetSigil(otherSkin, player.x + radius * .43, player.y + radius * .4, Math.max(4.5, radius * .25), color);
  }
  ctx.strokeStyle = '#f2f0e8'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(player.x, player.y, radius + 1, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#233536'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(player.x, player.y, radius + 3.2, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  if (player.deflectGrow > .5) {
    ctx.save(); ctx.globalAlpha = Math.min(.75, player.deflectGrow / 18); ctx.strokeStyle = '#f3dfac'; ctx.lineWidth = 1.2 + Math.min(1.4, player.deflectGrow * .08); ctx.shadowColor = '#fff0c8'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(player.x, player.y, radius + 6, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  if (player.passFlash > 0) {
    const glow = Math.min(1, player.passFlash * 3);
    ctx.save(); ctx.globalAlpha = glow; ctx.strokeStyle = '#ffcb82'; ctx.shadowColor = '#ff803d'; ctx.shadowBlur = 20; ctx.lineWidth = 2 + glow * 2;
    ctx.beginPath(); ctx.arc(player.x, player.y, radius + 6 + (1 - glow) * 12, player.passAngle - .82, player.passAngle + .82); ctx.stroke();
    ctx.globalAlpha = glow * .68; ctx.beginPath(); ctx.moveTo(player.x - Math.cos(player.passAngle) * radius * 1.25, player.y - Math.sin(player.passAngle) * radius * 1.25); ctx.lineTo(player.x + Math.cos(player.passAngle) * radius * 1.25, player.y + Math.sin(player.passAngle) * radius * 1.25); ctx.stroke(); ctx.restore();
  }
  if (player.armor > 0) { ctx.strokeStyle = '#f0efe9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(player.x, player.y, radius + 8, 0, Math.PI * 2); ctx.stroke(); }
  if (player.hitFlash > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, player.hitFlash * 3); ctx.strokeStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 24 * player.hitFlash; ctx.lineWidth = 2 + player.hitFlash * 12; ctx.beginPath(); ctx.arc(player.x, player.y, radius + 11, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.globalAlpha = .19; ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([2, 6]); ctx.beginPath(); ctx.arc(player.x, player.y, radius + 13, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
}

function drawSlowFields(time) {
  state.slowFields.forEach(field => {
    const alpha = Math.min(1, field.life / .45) * Math.min(1, field.life / field.maxLife * 2);
    const color = field.comet ? field.owner ? '#ff9b83' : '#8cdcff' : '#b8edff';
    ctx.save(); ctx.globalAlpha = (field.comet ? .1 : .14) * alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(field.x, field.y, field.radius, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = (field.comet ? .62 : .55) * alpha; ctx.strokeStyle = color; ctx.lineWidth = field.comet ? 1.2 : 1.5; ctx.setLineDash(field.comet ? [2, 5] : [4, 6]); ctx.stroke(); ctx.setLineDash([]);
    if (field.comet) { ctx.globalAlpha = .7 * alpha; ctx.fillStyle = '#f6f0df'; ctx.beginPath(); ctx.arc(field.x, field.y, 2.2 + Math.sin(time * 7 + field.phase) * .5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
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

function drawShots(time) {
  const breach = state.finalBreach;
  state.shots.forEach(shot => {
    const opacity = breach?.shot === shot ? breach.shotOpacity : 1;
    if (shot.hidden || !opacity) return;
    const serveProgress = shot.serveTimer > 0 ? Math.max(0, Math.min(1, 1 - shot.serveTimer / (shot.serveDuration || .55))) : 1;
    const reveal = shot.serveTimer > 0 ? Math.min(1, serveProgress / .34) : 1, radius = shot.radius * reveal;
    ctx.save(); ctx.globalAlpha = opacity;
    const color = shot.owner ? '#bd533d' : '#4d9ab0';
    const trailViewer = state.players.find(player => player.index !== shot.owner && hasSynergy(player, 'enemyTrails'));
    if (trailViewer && shot.wallBounces > 0 && shot.trail.length > 1) {
      const first = shot.trail[0];
      ctx.save(); ctx.globalAlpha *= .78; ctx.strokeStyle = trailViewer.index ? '#ff9b83' : '#8cddff'; ctx.lineWidth = Math.max(1.5, shot.radius * .32); ctx.setLineDash([2, 5]); ctx.lineDashOffset = -time * 18; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(first.x, first.y); shot.trail.forEach(point => ctx.lineTo(point.x, point.y)); ctx.lineTo(shot.x, shot.y); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    }
    if (shot.fireTimer > 0) {
      const intensity = Math.min(1, shot.fireTimer / .35), angle = Math.atan2(shot.vy, shot.vx), flameLength = 12 + intensity * 17 + Math.sin(time * 42 + shot.age * 31) * 3;
      ctx.save(); ctx.translate(shot.x, shot.y); ctx.rotate(angle); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= intensity * reveal;
      const flame = ctx.createLinearGradient(-shot.radius - flameLength, 0, -shot.radius * .25, 0);
      flame.addColorStop(0, '#e05a32'); flame.addColorStop(.48, '#ffad4e'); flame.addColorStop(1, '#fff1bd');
      ctx.fillStyle = flame; ctx.shadowColor = '#ff7b37'; ctx.shadowBlur = 13;
      ctx.beginPath(); ctx.moveTo(-shot.radius * .2, -shot.radius * .4); ctx.quadraticCurveTo(-shot.radius - flameLength * .5, -shot.radius * .7, -shot.radius - flameLength, Math.sin(time * 28 + shot.age * 13) * 2); ctx.quadraticCurveTo(-shot.radius - flameLength * .48, shot.radius * .58, -shot.radius * .2, shot.radius * .4); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    if (shot.trail.length > 1) {
      const first = shot.trail[0], tail = ctx.createLinearGradient(first.x, first.y, shot.x, shot.y);
      tail.addColorStop(0, '#ffffff00'); tail.addColorStop(.45, `${color}40`); tail.addColorStop(1, `${color}e8`);
      ctx.beginPath(); ctx.moveTo(first.x, first.y); shot.trail.forEach(point => ctx.lineTo(point.x, point.y)); ctx.lineTo(shot.x, shot.y);
      ctx.save();
      ctx.strokeStyle = tail; ctx.lineWidth = Math.max(2, shot.radius * .48); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = color; ctx.shadowBlur = 9; ctx.stroke(); ctx.restore();
      ctx.save();
      ctx.globalAlpha *= .48 + Math.sin(time * 12 + shot.age * 9) * .14; ctx.strokeStyle = '#f4fbff'; ctx.lineWidth = Math.max(1, shot.radius * .13); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([3, 9]); ctx.lineDashOffset = -time * 34; ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 7; ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    }
    if (shot.serveTimer > 0) {
      const angle = Math.atan2(shot.vy, shot.vx), directionColor = shot.vy < 0 ? '#69caff' : '#ff7770';
      const cueLength = 30 + Math.sin(time * 11) * 3;
      ctx.save(); ctx.globalAlpha *= Math.min(.9, .32 + serveProgress * .58); ctx.strokeStyle = directionColor; ctx.fillStyle = directionColor; ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.shadowColor = directionColor; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(shot.x, shot.y, radius + 5 + Math.sin(time * 8) * 2, 0, Math.PI * 2); ctx.stroke();
      ctx.translate(shot.x, shot.y); ctx.rotate(angle); ctx.beginPath(); ctx.moveTo(radius + 10, 0); ctx.lineTo(radius + cueLength, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(radius + cueLength + 5, 0); ctx.lineTo(radius + cueLength - 3, -4.5); ctx.lineTo(radius + cueLength - 3, 4.5); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha *= reveal; ctx.shadowColor = color; ctx.shadowBlur = 14 * reveal; ctx.fillStyle = '#eee9dc'; ctx.beginPath(); ctx.arc(shot.x, shot.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#f3f3ef'; ctx.beginPath(); ctx.arc(shot.x - radius * .25, shot.y - radius * .27, Math.max(1, radius * .14), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

function drawGestureLines() {}

function drawTapMarks() {
  state.tapMarks.forEach(mark => {
    const alpha = Math.max(0, mark.life / mark.max), radius = 8 + (1 - alpha) * 24, color = mark.owner ? '#ff796f' : '#80d8ff';
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(mark.x, mark.y, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(mark.x, mark.y, 2.5 + alpha * 1.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });
}

function burst(x, y, color, count) { for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2, speed = 30 + Math.random() * 200; state.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: .2 + Math.random() * .35, max: .55, color, size: 1 + Math.random() * 3 }); } }
function vanishShot(shot, x, y) {
  const color = shot.owner ? '#bd533d' : '#4d9ab0';
  state.shotImpacts.push({ x, y, angle: Math.atan2(shot.vy, shot.vx), life: .32, max: .32, vanish: true, radius: shot.radius, color });
  burst(x, y, color, 10); burst(x, y, '#ece8dd', 5);
}
function updateShotImpacts(dt) {
  for (let i = state.shotImpacts.length - 1; i >= 0; i--) {
    const impact = state.shotImpacts[i];
    if (impact.spawn) {
      if (impact.delay > 0) { impact.delay = Math.max(0, impact.delay - dt); continue; }
      if (!impact.spawned) { impact.spawned = true; burst(impact.x, impact.y, impact.color, 13); sound('ballSpawn', impact.owner); }
    }
    impact.life -= dt;
    if (impact.life <= 0) state.shotImpacts.splice(i, 1);
  }
}
function drawShotImpacts() {
  state.shotImpacts.forEach(impact => {
    if (impact.spawn) {
      if (impact.delay > 0) return;
      const progress = 1 - Math.max(0, impact.life / impact.max), alpha = 1 - progress, radius = 5 + progress * 30;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha; ctx.strokeStyle = impact.color; ctx.lineWidth = 2 * alpha; ctx.shadowColor = impact.color; ctx.shadowBlur = 15 * alpha;
      ctx.beginPath(); ctx.arc(impact.x, impact.y, radius, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = alpha * .45; ctx.beginPath(); ctx.arc(impact.x, impact.y, radius * .58, 0, Math.PI * 2); ctx.stroke();
      ctx.restore(); return;
    }
    const alpha = Math.max(0, impact.life / impact.max), stretch = 10 + (1 - alpha) * 28;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alpha;
    if (impact.contactKind) {
      const progress = 1 - alpha;
      const kind = impact.contactKind;
      ctx.strokeStyle = impact.color; ctx.fillStyle = impact.color;
      ctx.shadowColor = impact.color; ctx.shadowBlur = 10 * alpha;
      ctx.lineWidth = 1 + 2 * alpha;
      ctx.translate(impact.x, impact.y);
      ctx.beginPath();
      if (kind === 'break' || kind === 'restore' || kind === 'guard') {
        const radius = 3 + progress * (kind === 'break' ? 23 : 15);
        if (kind === 'break') ctx.setLineDash([3, 4]);
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
      } else {
        ctx.rotate(Math.atan2(impact.ny, impact.nx));
        const reach = 5 + progress * (kind === 'pass' ? 21 : 12);
        ctx.moveTo(-reach * .2, -reach);
        ctx.quadraticCurveTo(reach * .75, 0, -reach * .2, reach);
      }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 1 + alpha * 2.1, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); return;
    }
    if (impact.moonFlash) {
      const radius = 5 + (1 - alpha) * 24;
      ctx.strokeStyle = impact.color; ctx.lineWidth = 2 * alpha; ctx.shadowColor = impact.color; ctx.shadowBlur = 16 * alpha;
      ctx.beginPath(); ctx.arc(impact.x, impact.y, radius, 0, Math.PI * 2); ctx.stroke();
      ctx.translate(impact.x, impact.y); ctx.rotate((1 - alpha) * .8); ctx.beginPath(); ctx.moveTo(-radius * .65, 0); ctx.lineTo(radius * .65, 0); ctx.moveTo(0, -radius * .65); ctx.lineTo(0, radius * .65); ctx.stroke();
      ctx.restore(); return;
    }
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
function drawParticles() {
  let color;
  for (const particle of state.particles) {
    if (particle.color !== color) {
      color = particle.color;
      ctx.fillStyle = color;
    }
    ctx.globalAlpha = Math.max(0, particle.life / particle.max);
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
}
function updateParticles(dt) {
  const particles = state.particles;
  let next = 0;
  for (const particle of particles) {
    particle.x += particle.vx * dt; particle.y += particle.vy * dt;
    particle.vx *= .96; particle.vy *= .96; particle.life -= dt;
    if (particle.life > 0) particles[next++] = particle;
  }
  particles.length = next;
}

let audio, sfxOutput;
const AUDIO_OPTIONS_KEY = 'planets-audio-options';
const AUDIO_STEPS = 5;
const audioOptions = { music: 1, sfx: 1 };
const lastAudibleVolume = { music: .2, sfx: .2 };
try {
  const saved = JSON.parse(localStorage.getItem(AUDIO_OPTIONS_KEY) || '{}');
  for (const name of Object.keys(audioOptions)) {
    if (Number.isFinite(saved?.[name])) {
      audioOptions[name] = Math.round(Math.max(0, Math.min(1, saved[name])) * AUDIO_STEPS) / AUDIO_STEPS;
      if (audioOptions[name] > 0) lastAudibleVolume[name] = audioOptions[name];
    }
  }
} catch {}
const music = new Audio(new URL('../Music/mickeyscat-liquid-time-landscape-background-music-no-copyright-638000(4).mp3', import.meta.url).href);
music.loop = true;
music.preload = 'auto';
music.volume = 0;
music.muted = audioOptions.music === 0;
let musicScene = '';
let musicFadeFrame = 0;
const MUSIC_LEVELS = { menu: .13, battle: .2, upgrade: .075, ending: .1 };
function syncMusic(scene = state.phase) {
  const nextScene = ['round-result', 'between'].includes(scene) ? 'battle'
    : ['menu', 'skins', 'roster'].includes(scene) ? 'menu'
      : scene === 'upgrade' ? 'upgrade' : scene === 'ending' ? 'ending' : 'battle';
  if (nextScene === musicScene && !music.paused) return;
  musicScene = nextScene;
  const targetVolume = (MUSIC_LEVELS[nextScene] ?? .1) * audioOptions.music;
  if (!music.paused) {
    const from = music.volume, to = targetVolume, started = performance.now(), duration = 1050;
    cancelAnimationFrame(musicFadeFrame);
    const fade = now => {
      const t = Math.min(1, (now - started) / duration);
      music.volume = from + (to - from) * (t * t * (3 - 2 * t));
      if (t < 1) musicFadeFrame = requestAnimationFrame(fade);
    };
    musicFadeFrame = requestAnimationFrame(fade);
  } else music.volume = targetVolume;
  music.play().catch(() => {});
}
document.addEventListener('pointerdown', () => syncMusic(state.phase), { once: true, passive: true });
document.addEventListener('keydown', () => syncMusic(state.phase), { once: true });
function sound(kind, index = 0) {
  if (!audioOptions.sfx) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume();
    if (!sfxOutput) {
      sfxOutput = audio.createGain();
      sfxOutput.gain.value = audioOptions.sfx;
      sfxOutput.connect(audio.destination);
    }
    if (kind === 'defeat') {
      const now = audio.currentTime;
      const low = audio.createOscillator(), lowGain = audio.createGain();
      low.type = 'sine'; low.frequency.setValueAtTime(76, now); low.frequency.exponentialRampToValueAtTime(31, now + .72);
      lowGain.gain.setValueAtTime(.0001, now); lowGain.gain.exponentialRampToValueAtTime(.28, now + .018); lowGain.gain.exponentialRampToValueAtTime(.0001, now + .76);
      low.connect(lowGain); lowGain.connect(sfxOutput); low.start(now); low.stop(now + .78);
      const crash = audio.createOscillator(), filter = audio.createBiquadFilter(), crashGain = audio.createGain();
      crash.type = 'sawtooth'; crash.frequency.setValueAtTime(index ? 176 : 148, now); crash.frequency.exponentialRampToValueAtTime(42, now + .46);
      filter.type = 'lowpass'; filter.frequency.setValueAtTime(980, now); filter.frequency.exponentialRampToValueAtTime(260, now + .54); filter.Q.value = .8;
      crashGain.gain.setValueAtTime(.0001, now); crashGain.gain.exponentialRampToValueAtTime(.12, now + .012); crashGain.gain.exponentialRampToValueAtTime(.0001, now + .56);
      crash.connect(filter); filter.connect(crashGain); crashGain.connect(sfxOutput); crash.start(now); crash.stop(now + .58);
      return;
    }
    if (kind === 'planetHit') {
      const now = audio.currentTime, base = index ? 218 : 262;
      const body = audio.createOscillator(), bodyGain = audio.createGain();
      body.type = 'sine'; body.frequency.setValueAtTime(base, now); body.frequency.exponentialRampToValueAtTime(base * 1.28, now + .035); body.frequency.exponentialRampToValueAtTime(base * .62, now + .34);
      bodyGain.gain.setValueAtTime(.0001, now); bodyGain.gain.exponentialRampToValueAtTime(.12, now + .012); bodyGain.gain.exponentialRampToValueAtTime(.0001, now + .36);
      body.connect(bodyGain); bodyGain.connect(sfxOutput); body.start(now); body.stop(now + .38);
      const overtone = audio.createOscillator(), overtoneGain = audio.createGain();
      overtone.type = 'triangle'; overtone.frequency.setValueAtTime(base * 2.15, now); overtone.frequency.exponentialRampToValueAtTime(base * 1.45, now + .19);
      overtoneGain.gain.setValueAtTime(.0001, now); overtoneGain.gain.exponentialRampToValueAtTime(.026, now + .009); overtoneGain.gain.exponentialRampToValueAtTime(.0001, now + .2);
      overtone.connect(overtoneGain); overtoneGain.connect(sfxOutput); overtone.start(now); overtone.stop(now + .22);
      return;
    }
    const osc = audio.createOscillator(), gain = audio.createGain(), now = audio.currentTime;
    const tones = { throw: [index ? 145 : 235, .13, 'sawtooth'], hit: [72, .29, 'sawtooth'], block: [390, .1, 'square'], pickup: [680, .1, 'sine'], spawn: [245, .04, 'sine'], ballSpawn: [280, .16, 'sine'], return: [350, .06, 'triangle'], tick: [190, .035, 'sine'], ui: [370, .055, 'sine'], select: [index ? 440 : 510, .09, 'sine'], upgrade: [index ? 490 : 560, .14, 'triangle'] };
    const [freq, duration, type] = tones[kind] || tones.tick; osc.type = type; osc.frequency.setValueAtTime(freq, now);
    if (kind === 'throw' || kind === 'hit') osc.frequency.exponentialRampToValueAtTime(Math.max(35, freq * .4), now + duration);
    if (kind === 'ballSpawn') osc.frequency.exponentialRampToValueAtTime(freq * 1.75, now + duration);
    const loudness = { hit: .16, throw: .075, block: .06, ballSpawn: .05, pickup: .045, upgrade: .075, select: .05, return: .04, spawn: .025, ui: .032, tick: .018 };
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(loudness[kind] ?? .035, now + .008); gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    osc.connect(gain); gain.connect(sfxOutput); osc.start(now); osc.stop(now + duration + .02);
  } catch {}
}
function vibrate(ms) { if ('vibrate' in navigator) navigator.vibrate(ms); }
function shuffle(items) { return [...items].sort(() => Math.random() - .5); }

function battleRotated() { return document.querySelector('#battle').classList.contains('local-player-two-view') && window.matchMedia('(max-width:700px) and (orientation: portrait) and (pointer: coarse)').matches; }
function stickValue(stick, event) {
  const rect = stick.getBoundingClientRect(), player = Number(stick.dataset.player), centerX = rect.left + rect.width / 2, centerY = rect.top + rect.height / 2, radius = rect.width * .36;
  let x = Math.max(-1, Math.min(1, (event.clientX - centerX) / radius)), y = Math.max(-1, Math.min(1, (event.clientY - centerY) / radius));
  if (battleRotated()) { x *= -1; y *= -1; }
  const length = Math.hypot(x, y); if (length > 1) { x /= length; y /= length; }
  state.mobileMoveAxis[player] = { x, y };
  stick.querySelector('.stick-knob').style.transform = `translate(calc(-50% + ${x * radius}px),calc(-50% + ${y * radius}px))`;
}
touchControls.querySelectorAll('.virtual-stick').forEach(stick => {
  const player = Number(stick.dataset.player);
  stick.addEventListener('pointerdown', event => { if (!state.running) return; event.preventDefault(); stick.setPointerCapture(event.pointerId); state.stickPointers[player] = event.pointerId; stickValue(stick, event); });
  stick.addEventListener('pointermove', event => { if (state.stickPointers[player] === event.pointerId) stickValue(stick, event); });
  const reset = event => { if (state.stickPointers[player] !== event.pointerId) return; state.stickPointers[player] = null; state.mobileMoveAxis[player] = { x: 0, y: 0 }; stick.querySelector('.stick-knob').style.transform = ''; };
  stick.addEventListener('pointerup', reset); stick.addEventListener('pointercancel', reset); stick.addEventListener('lostpointercapture', reset);
});
function eventPoint(event) { const rect = canvas.getBoundingClientRect(); let x = (event.clientX - rect.left) / rect.width * W, y = (event.clientY - rect.top) / rect.height * H; if (battleRotated()) { x = W - x; y = H - y; } return { x, y }; }
canvas.addEventListener('pointerdown', event => {
  if (!state.running) return;
  const point = eventPoint(event), owner = state.mode === 'pvp' ? (point.y < MID ? 1 : 0) : 0;
  if (state.roundIntro > 0) {
    const onPlayerSide = owner === 0 ? point.y > MID : point.y < MID;
    const canMoveDuringServe = owner === state.serveOwner || state.mode === 'pvp' || owner === 0;
    if (!canMoveDuringServe || !onPlayerSide) return;
    event.preventDefault(); canvas.setPointerCapture(event.pointerId);
    state.tapMarks.push({ x: point.x, y: point.y, owner, life: .3, max: .3 });
    state.gestures.set(event.pointerId, { owner, x: point.x });
    movePlayer(owner, point.x, point.y); return;
  }
  if (state.mode === 'ai' && point.y < MID) return;
  event.preventDefault(); canvas.setPointerCapture(event.pointerId);
  state.tapMarks.push({ x: point.x, y: point.y, owner, life: .3, max: .3 });
  state.gestures.set(event.pointerId, { owner, x: point.x });
  movePlayer(owner, point.x, point.y);
});
canvas.addEventListener('pointermove', event => {
  const gesture = state.gestures.get(event.pointerId); if (!gesture) return; const point = eventPoint(event); gesture.x = point.x; movePlayer(gesture.owner, point.x, point.y);
});
const stopDrag = event => { state.gestures.delete(event.pointerId); if (state.serveAimPointer === event.pointerId) state.serveAimPointer = null; };
canvas.addEventListener('pointerup', stopDrag); canvas.addEventListener('pointercancel', stopDrag); canvas.addEventListener('lostpointercapture', stopDrag);

const logo = document.querySelector('.menu-screen h1');
logo.setAttribute('aria-label', logo.textContent.trim());
logo.innerHTML = [...logo.textContent.trim()].map((letter, index) => `<span class="logo-letter ${letter === 'Λ' ? 'logo-mark' : ''}" style="--letter-index:${index}">${letter}</span>`).join('');

const menuPlanet = document.querySelector('.planet-red'), menuScreen = document.querySelector('.menu-screen');
function resetMenuPlanet() {
  menuPlanet?.style.setProperty('--menu-planet-shift-x', '0px');
  menuPlanet?.style.setProperty('--menu-planet-shift-y', '0px');
}
function followMenuPlanet(event) {
  if (!menuPlanet || state.phase !== 'menu' || event.pointerType === 'touch') return;
  const bounds = menuPlanet.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2, centerY = bounds.top + bounds.height / 2;
  const dx = event.clientX - centerX, dy = event.clientY - centerY;
  const distance = Math.hypot(dx, dy), range = Math.min(250, Math.max(140, innerWidth * .24));
  if (distance >= range || distance < 1) return resetMenuPlanet();
  const strength = (1 - distance / range) * Math.min(16, innerWidth * .026);
  menuPlanet.style.setProperty('--menu-planet-shift-x', `${(dx / distance * strength).toFixed(1)}px`);
  menuPlanet.style.setProperty('--menu-planet-shift-y', `${(dy / distance * strength).toFixed(1)}px`);
}
menuScreen?.addEventListener('pointermove', followMenuPlanet, { passive: true });
menuScreen?.addEventListener('pointerleave', resetMenuPlanet);

document.addEventListener('pointerdown', event => event.target.closest('button')?.classList.add('pressing'));
const releaseButtons = () => document.querySelectorAll('.pressing').forEach(button => button.classList.remove('pressing'));
document.addEventListener('pointerup', releaseButtons); document.addEventListener('pointercancel', releaseButtons);
document.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  if (!button.matches('[data-skin], [data-card]')) sound('ui');
  if (button.matches('.ai-difficulty-option')) return;
  button.classList.remove('button-flash'); void button.offsetWidth; button.classList.add('button-flash');
  window.setTimeout(() => button.classList.remove('button-flash'), 420);
});

document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => newGame(button.dataset.mode)));
const skinPreview = document.querySelector('#skin-showcase');
const followSkinPreviewPlanet = event => {
  if (event.pointerType === 'touch') return;
  const orb = skinPreview.querySelector('.showcase-orb'), bounds = orb.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2, centerY = bounds.top + bounds.height / 2;
  const shiftX = Math.max(-20, Math.min(20, (event.clientX - centerX) * .075));
  const shiftY = Math.max(-20, Math.min(20, (event.clientY - centerY) * .075));
  orb.style.setProperty('--preview-shift-x', `${shiftX.toFixed(1)}px`);
  orb.style.setProperty('--preview-shift-y', `${shiftY.toFixed(1)}px`);
};
const resetSkinPreviewPlanet = () => {
  const orb = skinPreview.querySelector('.showcase-orb');
  orb.style.setProperty('--preview-shift-x', '0px');
  orb.style.setProperty('--preview-shift-y', '0px');
};
skinPreview.addEventListener('pointermove', followSkinPreviewPlanet);
skinPreview.addEventListener('pointerleave', resetSkinPreviewPlanet);
skinPreview.addEventListener('pointercancel', resetSkinPreviewPlanet);
const curtain = document.querySelector('#curtain');
const exitConfirm = document.querySelector('#exit-confirm');
const resetConfirm = document.querySelector('#reset-confirm');
const universeKeyDialog = document.querySelector('#universe-key-dialog');
let exitConfirmOpener = null, exitWasRunning = false;
function isPauseOpen() { return !exitConfirm.classList.contains('hidden'); }
for (const name of Object.keys(audioOptions)) {
  const group = document.querySelector(`#pause-${name}`);
  group.innerHTML = Array.from({ length: AUDIO_STEPS }, (_, index) => index + 1).map(step => `<label class="volume-step">
    <input type="radio" name="pause-volume-${name}" value="${step}" aria-label="${step} из ${AUDIO_STEPS}">
    <span aria-hidden="true"></span>
  </label>`).join('');
  const options = [...group.querySelectorAll('input')];
  const paintVolume = () => {
    const selected = Math.round(audioOptions[name] * AUDIO_STEPS);
    options.forEach(option => {
      const step = Number(option.value);
      option.checked = step === selected;
      option.parentElement.classList.toggle('is-filled', selected > 0 && step <= selected);
    });
  };
  const applyVolume = () => {
    if (audioOptions[name] > 0) lastAudibleVolume[name] = audioOptions[name];
    paintVolume();
    if (name === 'music') {
      cancelAnimationFrame(musicFadeFrame);
      music.muted = audioOptions.music === 0;
      music.volume = (MUSIC_LEVELS[musicScene] ?? .1) * audioOptions.music;
      if (audioOptions.music && music.paused) music.play().catch(() => {});
    } else {
      if (sfxOutput) sfxOutput.gain.value = audioOptions.sfx;
      sound('tick');
    }
    try { localStorage.setItem(AUDIO_OPTIONS_KEY, JSON.stringify(audioOptions)); } catch {}
  };
  paintVolume();
  group.addEventListener('change', event => {
    audioOptions[name] = Number(event.target.value) / AUDIO_STEPS;
    applyVolume();
  });
  group.addEventListener('dblclick', event => {
    const step = event.target.closest('.volume-step');
    if (!step) return;
    const clicked = Number(step.querySelector('input')?.value);
    const selected = Math.round(audioOptions[name] * AUDIO_STEPS);
    if (clicked !== selected) return;
    event.preventDefault();
    audioOptions[name] = selected ? 0 : lastAudibleVolume[name] || 1 / AUDIO_STEPS;
    applyVolume();
  });
}
function openExitConfirm(event) {
  if (isPauseOpen()) return;
  exitConfirmOpener = event.currentTarget;
  exitWasRunning = state.running;
  state.running = false;
  state.keys.clear();
  exitConfirm.classList.remove('hidden');
  document.querySelector('#exit-stay').focus();
}
function closeExitConfirm() {
  exitConfirm.classList.add('hidden');
  if (exitWasRunning) {
    state.running = true;
    state.lastTime = performance.now();
    requestAnimationFrame(loop);
  } else if (state.phase === 'upgrade' && !state.startDuelTimer && state.upgradeChoices.every(Boolean)) {
    scheduleUpgradeStart();
  } else if (['round-result', 'between'].includes(state.phase) && !state.continueTimer) {
    state.continueTimer = window.setTimeout(continueFromCurtain, 500);
  }
  exitWasRunning = false;
  exitConfirmOpener?.focus();
}
document.querySelector('#back-to-menu').addEventListener('click', openExitConfirm);
document.querySelector('#exit-stay').addEventListener('click', closeExitConfirm);
document.querySelector('#exit-leave').addEventListener('click', () => {
  exitConfirm.classList.add('hidden');
  exitWasRunning = false;
  exitConfirmOpener = null;
  state.running = false;
  state.keys.clear();
  clearTimeout(state.continueTimer); state.continueTimer = 0;
  clearTimeout(state.startDuelTimer); state.startDuelTimer = 0;
  state.zooMode = false;
  showEnding(1, 'surrender');
  renderCareerProgress(true);
});
document.addEventListener('keydown', event => {
  if (!universeKeyDialog.classList.contains('hidden')) {
    if (event.key === 'Escape') { universeKeyDialog.classList.add('hidden'); document.querySelector('#universe-key-open').focus(); }
    if (event.key === 'Enter' && event.target.id === 'universe-key-input') { event.preventDefault(); applyUniverseKey(); }
    return;
  }
  if (!resetConfirm.classList.contains('hidden')) { if (event.key === 'Escape') closeRosterResetConfirm(); return; }
  if (event.key === 'Escape' && !exitConfirm.classList.contains('hidden')) { closeExitConfirm(); return; }
  if (!exitConfirm.classList.contains('hidden')) return;
  if (event.key === 'Escape' && ['battle', 'upgrade', 'round-result', 'between'].includes(state.phase)) {
    event.preventDefault();
    openExitConfirm({ currentTarget: document.activeElement });
    return;
  }
  const code = event.code;
  if (state.phase === 'battle' && ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(code)) {
    state.keys.add(code); event.preventDefault(); return;
  }
  if (state.phase === 'skins') {
    const player = state.selectingPlayer;
    const left = player === 0 ? code === 'KeyA' : code === 'ArrowLeft', right = player === 0 ? code === 'KeyD' : code === 'ArrowRight';
    const up = player === 0 ? code === 'KeyW' : code === 'ArrowUp', down = player === 0 ? code === 'KeyS' : code === 'ArrowDown';
    if (left || right) { event.preventDefault(); state.skinHalfFocus = left ? 0 : 1; renderSkinPicker(); return; }
    if (up || down) { event.preventDefault(); moveSkinSelection(up ? -1 : 1); return; }
    if (!event.repeat && ((player === 0 && code === 'Space') || (player === 1 && code === 'Enter'))) { event.preventDefault(); sound('ui', player); confirmSkinSelection(); }
    return;
  }
  if (state.phase === 'upgrade') {
    const bluePrev = ['KeyA', 'KeyW'].includes(code), blueNext = ['KeyD', 'KeyS'].includes(code);
    const redPrev = ['ArrowLeft', 'ArrowUp'].includes(code), redNext = ['ArrowRight', 'ArrowDown'].includes(code);
    if (bluePrev || blueNext) { event.preventDefault(); moveUpgradeFocus(0, bluePrev ? -1 : 1); return; }
    if (redPrev || redNext) { event.preventDefault(); moveUpgradeFocus(1, redPrev ? -1 : 1); return; }
    if (!event.repeat && code === 'Space') { event.preventDefault(); activateUpgrade(0); return; }
    if (!event.repeat && code === 'Enter' && state.mode === 'pvp') { event.preventDefault(); activateUpgrade(1); }
  }
});
document.addEventListener('keyup', event => state.keys.delete(event.code));
window.addEventListener('blur', () => state.keys.clear());
document.querySelector('#upgrade-menu').addEventListener('click', openExitConfirm);
document.querySelector('#upgrade-reset-one').addEventListener('click', () => resetUpgradeRoster(0));
document.querySelector('#upgrade-reset-two').addEventListener('click', () => resetUpgradeRoster(1));
document.querySelector('#open-roster').addEventListener('click', () => { renderRoster(); switchScreen('roster'); });
document.querySelector('#roster-back').addEventListener('click', () => switchScreen('menu'));
document.querySelector('#universe-key-open').addEventListener('click', openUniverseKeyDialog);
document.querySelector('#universe-key-close').addEventListener('click', () => { universeKeyDialog.classList.add('hidden'); document.querySelector('#universe-key-open').focus(); });
document.querySelector('#universe-key-apply').addEventListener('click', applyUniverseKey);
document.querySelector('#universe-key-copy').addEventListener('click', async () => {
  const button = document.querySelector('#universe-key-copy');
  try { await navigator.clipboard.writeText(currentUniverseKey()); showUniverseKeyStatus('Ключ скопирован', true); }
  catch { showUniverseKeyStatus(`Ваш ключ: ${currentUniverseKey()}`, true); }
  button.textContent = 'СКОПИРОВАНО'; window.setTimeout(() => { button.textContent = 'КОПИРОВАТЬ'; }, 1100);
});
document.querySelector('#universe-key-input').addEventListener('input', event => { event.target.value = event.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3); showUniverseKeyStatus(''); });
universeKeyDialog.addEventListener('click', event => { if (event.target === universeKeyDialog) { universeKeyDialog.classList.add('hidden'); document.querySelector('#universe-key-open').focus(); } });
document.querySelector('#zoo-back').addEventListener('click', () => { state.zooMode = false; switchScreen('roster'); });
document.querySelector('#zoo-start').addEventListener('click', startZooBattle);
document.querySelector('#roster-reset').addEventListener('click', openRosterResetConfirm);
document.querySelector('#reset-cancel').addEventListener('click', closeRosterResetConfirm);
document.querySelector('#reset-accept').addEventListener('click', resetCareer);
resetConfirm.addEventListener('click', event => { if (event.target === resetConfirm) closeRosterResetConfirm(); });
document.querySelector('#play-again').addEventListener('click', () => newGame(state.mode));
document.querySelector('#skin-back').addEventListener('click', () => switchScreen('menu'));
document.querySelector('#skin-return-blue').addEventListener('click', () => {
  if (state.mode !== 'pvp' || state.selectingPlayer !== 1) return;
  state.skinConfirmed[0] = false;
  state.selectingPlayer = 0;
  state.skinHalfFocus = 0;
  renderSkinPicker();
});
document.querySelector('#skin-start').addEventListener('click', confirmSkinSelection);
document.querySelector('#ending-menu').addEventListener('click', () => { switchScreen('menu'); renderCareerProgress(true); });
window.addEventListener('resize', resizeCanvas);

switchScreen('menu');
renderCareerProgress();

