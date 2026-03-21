// MINIGAME
// Platformer v2 minigame
async function startPlatformerGame() {
    if (!isExtension) {
        tn('body', 0).insertAdjacentHTML('beforeend', `
<div id="mod-game-unavailable" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.85);z-index:99999;font-family:sans-serif;">
  <div style="background:#1a1a2e;border:1.5px solid rgba(155,155,156,0.25);border-radius:18px;padding:48px 56px;text-align:center;max-width:480px;">
    <div style="font-size:48px;margin-bottom:16px;">🎮</div>
    <p style="color:#ffffff;font-size:20px;margin:0;">Sorry, maar Somtoday Mod platformer v2 is niet beschikbaar op ${platform}</p>
  </div>
</div>`);
        return;
    }

    const DEBUG_MODE = false; // IMPORTANT: DISABLE THIS IN PRODUCTION
    let debugVisible = false;

    const BACKEND_URL = 'https://somtoday-mod-platformer-backend.onrender.com';

    const consoleHunter = console.log.bind(console, "Wat doe je hier? Zoek je een code... Wat een 'CONSOLEHUNTER' ben jij zeg...");
    consoleHunter();

    let CODE_UUID = get('platformer-uuid');
    if (!CODE_UUID) {
        CODE_UUID = crypto.randomUUID();
        set('platformer-uuid', CODE_UUID);
    }

    tn('body', 0).insertAdjacentHTML('beforeend', `
    <div id="mod-menu">
    <div class="mod-menu-overlay">
        <div class="mod-menu-panel">
        <div id="mod-screen-main" class="mod-screen">
            <button class="mod-menu-close-x" id="mod-menu-close">✕</button>
            <div class="mod-menu-logo">
                <img draggable="false" src="${chrome.runtime.getURL('images/platformerv2/logo.svg')}">
            </div>
            <div class="mod-menu-coins-display">
            <span class="mod-menu-coin-icon">🪙</span>
            <span id="mod-menu-total-coins">0</span>
            </div>
            <div class="mod-menu-play-area">
            <div class="mod-menu-side-btn" id="mod-menu-codes">
                <div class="mod-menu-side-btn-circle">🔑</div>
                <span class="mod-menu-side-btn-label">Codes</span>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;">
                <button class="mod-menu-play-circle" id="mod-menu-play">
                <span class="mod-menu-play-icon">▶</span>
                </button>
                <div class="mod-menu-play-label">SPELEN</div>
            </div>
            <div class="mod-menu-side-btn" id="mod-menu-shop">
                <div class="mod-menu-side-btn-circle">🛒</div>
                <span class="mod-menu-side-btn-label">Shop</span>
            </div>
            </div>
            <button class="mod-credits-float-btn" id="mod-menu-credits-btn" title="Credits">📜</button>
        </div>

        <div id="mod-screen-levels" class="mod-screen mod-screen-hidden">
            <div class="mod-menu-header">
            <button class="mod-menu-back" id="mod-levels-back">← Terug</button>
            <div class="mod-menu-header-title">Selecteer Level</div>
            <div class="mod-menu-coins-sm">
                <span>🪙</span>
                <span id="mod-levels-coins">0</span>
            </div>
            </div>
            <div class="mod-level-grid" id="mod-level-grid"></div>
        </div>
        </div>
    </div>
    </div>
    <div id="mod-game" style="display:none;">
    <canvas id="mod-canvas"></canvas>
    <div id="mod-hud">
    <span id="mod-playtime"></span>
    <span id="mod-coins-hud"></span>
    <span id="mod-level-title"></span>
    <button id="mod-pause-btn">&#9646;&#9646;</button>
    <span id="mod-close-button">&times;</span>
    </div>
    <div id="mod-mobile-controls">
    <button id="mod-btn-left">&#9664;</button>
    <button id="mod-btn-jump">&#9650;</button>
    <button id="mod-btn-right">&#9654;</button>
    </div>
    </div>`);

    function showScreen(screenId) {
        ['mod-screen-main', 'mod-screen-levels'].forEach(sid => {
            const el = document.getElementById(sid);
            if (el) el.classList.toggle('mod-screen-hidden', sid !== screenId);
        });
    }

    function updateMenuCoins() {
        const totalCoins = parseInt(get('platformer-total-coins') || '0');
        const codeCoins = parseInt(get('platformer-code-coins') || '0');
        const total = totalCoins + codeCoins;
        document.getElementById('mod-menu-total-coins').textContent = total;
        document.getElementById('mod-levels-coins').textContent = total;
    }

    function getLevelBestTime(levelIdx) {
        const data = get(`platformer-besttime-${levelIdx}`);
        return data ? parseFloat(data) : null;
    }

    function setLevelBestTime(levelIdx, time) {
        const prev = getLevelBestTime(levelIdx);
        if (prev === null || time < prev) {
            set(`platformer-besttime-${levelIdx}`, time.toFixed(2));
        }
    }

    function getCompletedLevels() {
        const data = get('platformer-progress');
        return data ? JSON.parse(data) : {};
    }

    function markLevelCompleted(levelIdx, coins) {
        const progress = getCompletedLevels();
        if (!progress[levelIdx] || progress[levelIdx].coins < coins) {
            progress[levelIdx] = { completed: true, coins };
            set('platformer-progress', JSON.stringify(progress));
        }
    }

    function getLevelCoins(levelIdx) {
        const progress = getCompletedLevels();
        return progress[levelIdx]?.coins || 0;
    }

    function getTotalCoinsEarned() {
        const progress = getCompletedLevels();
        return Object.values(progress).reduce((sum, p) => sum + (p.coins || 0), 0);
    }

    function startGame(startLevelIdx = 0) {
        gameAlive = true;
        document.getElementById('mod-menu').style.display = 'none';
        document.getElementById('mod-game').style.display = 'block';
        tn('body', 0).classList.add('mod-game-playing');

        resizeCanvas();
        updateMobileVis();

        elapsed = 0;
        timing = true;
        sessionCoins = 0;
        sessionTotalCoins = 0;
        loadLvl(startLevelIdx);

        lastTs = null;
        requestAnimationFrame(loop);
    }

    document.getElementById('mod-menu-play').addEventListener('click', () => {
        showScreen('mod-screen-levels');
        populateLevelGrid();
    });

    document.getElementById('mod-menu-codes').addEventListener('click', () => {
        const overlay = document.createElement('div');
        overlay.className = 'mod-coming-soon-overlay';
        overlay.id = 'mod-codes-overlay';
        overlay.innerHTML = `
            <div class="mod-coming-soon-box" style="max-width: 440px; padding: 32px 40px;">
                <div class="mod-codes-icon">🔐</div>
                <h3>Codes</h3>
                <p class="mod-codes-desc">Voer een code in om speciale beloningen te ontvangen</p>
                <div class="mod-codes-input-wrap">
                    <input type="text" class="mod-codes-input" id="mod-codes-input" placeholder="CODE123" maxlength="20">
                    <button class="mod-codes-submit" id="mod-codes-submit">Verzenden</button>
                </div>
                <div class="mod-codes-status" id="mod-codes-status"></div>
                <div class="mod-codes-history" id="mod-codes-history" style="display:none;">
                    <div class="mod-codes-history-title">Munten van codes</div>
                    <div class="mod-codes-history-val" id="mod-codes-history-val">0</div>
                </div>
                <button class="mod-coming-soon-close" id="mod-codes-close">Sluiten</button>
            </div>
        `;
        document.body.appendChild(overlay);
        
        const codeCoins = parseInt(get('platformer-code-coins') || '0');
        if (codeCoins > 0) {
            document.getElementById('mod-codes-history').style.display = 'block';
            document.getElementById('mod-codes-history-val').textContent = codeCoins;
        }
        
        const closeOverlay = () => {
            overlay.remove();
            updateMenuCoins();
        };
        
        document.getElementById('mod-codes-close').addEventListener('click', closeOverlay);
        overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });
        
        document.getElementById('mod-codes-submit').addEventListener('click', async () => {
            const input = document.getElementById('mod-codes-input');
            const status = document.getElementById('mod-codes-status');
            const code = input.value.trim().toUpperCase();

            if (!code) {
                status.className = 'mod-codes-status mod-codes-status-error';
                status.textContent = 'Voer een code in';
                return;
            }

            const usedCodes = JSON.parse(get('platformer-used-codes') || '[]');
            if (usedCodes.includes(code)) {
                status.className = 'mod-codes-status mod-codes-status-error';
                status.textContent = 'Deze code is al gebruikt';
                return;
            }

            status.className = 'mod-codes-status mod-codes-status-loading';
            status.textContent = 'Code valideren... dit kan tot 50 seconden duren';

            try {
                const resp = await fetch(`${BACKEND_URL}/redeem`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, uuid: CODE_UUID }),
                });
                const data = await resp.json();

                if (resp.ok && data.success) {
                    const reward = data.reward.coins || 0;
                    const currentCodeCoins = parseInt(get('platformer-code-coins') || '0');
                    set('platformer-code-coins', currentCodeCoins + reward);

                    usedCodes.push(code);
                    set('platformer-used-codes', JSON.stringify(usedCodes));

                    status.className = 'mod-codes-status mod-codes-status-success';
                    status.textContent = `🎉 +${reward} munten ontvangen!`;
                    input.value = '';

                    const newTotal = currentCodeCoins + reward;
                    document.getElementById('mod-codes-history').style.display = 'block';
                    document.getElementById('mod-codes-history-val').textContent = newTotal;
                    updateMenuCoins();
                } else if (resp.status === 409) {
                    usedCodes.push(code);
                    set('platformer-used-codes', JSON.stringify(usedCodes));
                    status.className = 'mod-codes-status mod-codes-status-error';
                    status.textContent = 'Deze code is al gebruikt';
                } else if (resp.status === 404) {
                    status.className = 'mod-codes-status mod-codes-status-error';
                    status.textContent = 'Ongeldige code';
                } else {
                    status.className = 'mod-codes-status mod-codes-status-error';
                    status.textContent = 'Er is een fout opgetreden, probeer opnieuw';
                }
            } catch(e) {
                status.className = 'mod-codes-status mod-codes-status-error';
                status.textContent = 'Geen verbinding met server, probeer het later opnieuw';
            }
        });
        
        document.getElementById('mod-codes-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('mod-codes-submit').click();
            }
        });
    });

    document.getElementById('mod-menu-close').addEventListener('click', () => {
        closeEntirePlatformer();
    });

    document.getElementById('mod-levels-back').addEventListener('click', () => {
        showScreen('mod-screen-main');
    });

    document.getElementById('mod-menu-credits-btn').addEventListener('click', async () => await openCreditsPopup());

    document.getElementById('mod-menu-shop').addEventListener('click', () => {
        const overlay = document.createElement('div');
        overlay.className = 'mod-coming-soon-overlay';
        overlay.id = 'mod-coming-soon';
        overlay.innerHTML = `
          <div class="mod-coming-soon-box">
            <div class="mod-cs-icon">🛒</div>
            <h3>Shop</h3>
            <p>Binnenkort beschikbaar!</p>
            <button class="mod-coming-soon-close" id="mod-cs-close">Sluiten</button>
          </div>
        `;
        document.body.appendChild(overlay);
        document.getElementById('mod-cs-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    });

    const canvas = id('mod-canvas');
    const ctx = canvas.getContext('2d');
    const MAX_CANVAS_WIDTH = 2600;

    function resizeCanvas() {
        const cw = Math.min(window.innerWidth, MAX_CANVAS_WIDTH);
        canvas.width = cw;
        canvas.height = window.innerHeight;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '50%';
        canvas.style.transform = 'translateX(-50%)';
        canvas.style.width = cw + 'px';
        canvas.style.maxWidth = MAX_CANVAS_WIDTH + 'px';
        canvas.style.height = window.innerHeight + 'px';
        try { if (lvl) lvl._bgBaked = null; } catch(e) {}
    }

    function isMobile() {
        return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    }

    function updateMobileVis() {
        id('mod-mobile-controls').style.display = isMobile() ? 'flex' : 'none';
        id('mod-pause-btn').style.display = isMobile() ? 'inline-block' : 'none';
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        updateMobileVis();
    });

    let musicAudio = null;
    let musicFading = null;
    let currentSong = null;
    let sfxVolume = parseFloat(get('platformer-sfxVolume') ?? 1);
    if (isNaN(sfxVolume)) sfxVolume = 1;
    let musicVolume = parseFloat(get('platformer-musicVolume') ?? 1);
    if (isNaN(musicVolume)) musicVolume = 1;

    function _killAudio(a) {
        if (!a) return;
        try { a.pause(); a.src = ''; } catch(e) {}
    }

    function _killFading() {
        if (!musicFading) return;
        _killAudio(musicFading.outAudio);
        _killAudio(musicFading.inAudio);
        musicFading = null;
    }

    function fadeMusicTo(src, duration = 1.5) {
        currentSong = src;
        const outAudio = musicFading ? musicFading.inAudio : musicAudio;
        if (musicFading) { _killAudio(musicFading.outAudio); musicFading = null; }
        musicAudio = null;
        let inAudio = null;
        if (src) {
            try {
                inAudio = new Audio(getAudioUrl(src));
                inAudio.loop = true;
                inAudio.volume = 0;
                inAudio.play().catch(() => {});
            } catch(e) {}
        }
        musicFading = { outAudio, inAudio, timer: 0, duration: Math.max(0.05, duration) };
    }

    function updateMusicFade(dt) {
        if (!musicFading) return;
        musicFading.timer += dt;
        const t = Math.min(1, musicFading.timer / musicFading.duration);
        if (musicFading.outAudio) musicFading.outAudio.volume = musicVolume * (1 - t);
        if (musicFading.inAudio) musicFading.inAudio.volume = musicVolume * t;
        if (t >= 1) {
            _killAudio(musicFading.outAudio);
            musicAudio = musicFading.inAudio;
            musicFading = null;
        }
    }

    function playLevelMusic(src) {
        currentSong = src;
        _killFading();
        _killAudio(musicAudio);
        musicAudio = null;
        if (!src) return;
        try {
            musicAudio = new Audio(getAudioUrl(src));
            musicAudio.loop = true;
            musicAudio.volume = musicVolume;
            musicAudio.play().catch(() => {});
        } catch(e) {}
    }

    function stopMusic() {
        currentSong = null;
        _killFading();
        _killAudio(musicAudio);
        musicAudio = null;
    }

    const textureCache = {};
    async function loadTexture(src) {
        if (!src) return null;
        if (textureCache[src]) return textureCache[src];
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                const entry = { img, pat: ctx.createPattern(img, 'repeat') };
                textureCache[src] = entry;
                resolve(entry);
            };
            img.onerror = () => resolve(null);
            img.src = chrome.runtime.getURL(src);
        });
    }

    function parseLvl(doc, idx) {
        const el = doc.querySelector('level');
        const descEl = el.querySelector('description');
        const lvl = {
            index: idx,
            title: el.getAttribute('title') || `Level ${idx + 1}`,
            description: descEl ? descEl.textContent.trim() : '',
            song: el.getAttribute('song') || null,
            worldWidth: parseFloat(el.getAttribute('worldWidth')) || 3000,
            worldHeight: parseFloat(el.getAttribute('worldHeight')) || 1400,
            spawnX: parseFloat(el.getAttribute('spawnX')) || 60,
            spawnY: parseFloat(el.getAttribute('spawnY')) || 120,
            floors: [], walls: [], lavas: [],
            trampolines: [], enemies: [], orbs: [],
            mpUp: [], mpRight: [], coins: [], checkpoints: [],
            texts: [], portals: [], ends: [],
            keys: [],
            areas: [],
            cameras: [],
            musicTriggers: [],
            enemySpawners: [],
            despawnTriggers: [],
            drawOrder: [],
            playAgainText: 'Opnieuw spelen',
            closeGameText: 'Menu',
            bgColor: el.getAttribute('bgColor') || null,
            bgColor2: el.getAttribute('bgColor2') || null,
            bgTexture: el.getAttribute('bgTexture') || null,
            bgTextureMode: el.getAttribute('bgTextureMode') || 'tile',
            bgTextureAlpha: parseFloat(el.getAttribute('bgTextureAlpha') ?? 1),
            _bgTexEntry: null,
            _bgBaked: null,
            _bgBakedW: 0,
            _bgBakedH: 0,
        };
        for (const c of el.children) {
            const tag = c.tagName;
            if (tag === 'description') continue;
            const x = parseFloat(c.getAttribute('x')) ?? 0;
            const y = parseFloat(c.getAttribute('y')) ?? 0;
            const w = parseFloat(c.getAttribute('width')) || 100;
            const h = parseFloat(c.getAttribute('height')) || 20;
            const ghost = c.getAttribute('ghost') === 'true';
            const oneWay = c.getAttribute('oneWay') === 'true';
            const texture = c.getAttribute('texture') || null;
            const textureMode = c.getAttribute('textureMode') || 'tile';
            const textureFrames = parseInt(c.getAttribute('textureFrames')) || 1;
            const textureFps = parseFloat(c.getAttribute('textureFps')) || 8;
            const rotation = parseFloat(c.getAttribute('rotation')) || 0;
            const invertX = c.getAttribute('invertX') === 'true';
            const invertY = c.getAttribute('invertY') === 'true';
            if (tag === 'floor') {
                const obj = { type: 'floor', x, y, w, h, ghost, oneWay, texture, textureMode, textureFrames, textureFps, rotation, invertX, invertY, tex: null };
                lvl.floors.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'wall') {
                const textureGhost = c.getAttribute('textureGhost') || null;
                const opaque = c.getAttribute('opaque') === 'true';
                const keyId = c.getAttribute('keyId') || null;
                const keyColor = c.getAttribute('keyColor') || '#ffd700';
                const keyholeAttr = c.getAttribute('keyhole') || 'visible';
                const closeOnAreaId = c.getAttribute('closeOnAreaId') || null;
                const riseWithId = c.getAttribute('riseWithId') || null;
                const riseYOnly = c.getAttribute('riseYOnly') === 'true';
                const riseYOffset = parseFloat(c.getAttribute('riseYOffset')) || 0;
                const obj = {
                    type: 'wall', x, y, w, h, ghost, opaque, texture, textureMode, textureFrames, textureFps, rotation, invertX, invertY,
                    textureGhost, tex: null, texGhost: null, playerOverlap: false,
                    keyId, keyColor,
                    keyholeVisible: keyholeAttr !== 'invisible',
                    doorOpen: false, doorSlide: 0, doorDir: 0,
                    closeOnAreaId, areaCloseSlide: closeOnAreaId ? 1 : 0, areaCloseDir: 0,
                    riseWithId, riseYOnly, riseYOffset,
                    riseCurrentY: y, riseCurrentH: h,
                };
                lvl.walls.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'lava') {
                const flowUp = c.getAttribute('flowUp') === 'true';
                const flowSpeed = parseFloat(c.getAttribute('flowSpeed')) || 50;
                const flowDuration = parseFloat(c.getAttribute('flowDuration')) || 0;
                const flowAreaId = c.getAttribute('flowAreaId') || null;
                const riseId = c.getAttribute('riseId') || null;
                const obj = {
                    type: 'lava', x, y, w, h, ghost, texture, textureMode, textureFrames, textureFps, rotation, invertX, invertY, tex: null,
                    flowUp, flowSpeed, flowDuration, flowAreaId,
                    riseId, currentH: h, flowTimer: 0,
                    flowing: flowUp && !flowAreaId,
                };
                lvl.lavas.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'trampoline') {
                const obj = { type: 'trampoline', x, y, w, h, ghost, texture, textureMode, textureFrames, textureFps, rotation, invertX, invertY, tex: null, strength: parseFloat(c.getAttribute('strength')) || 2.5 };
                lvl.trampolines.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'enemy') {
                const mn = c.getAttribute('min') !== null ? parseFloat(c.getAttribute('min')) : null;
                const mx = c.getAttribute('max') !== null ? parseFloat(c.getAttribute('max')) : null;
                const detectionR = parseFloat(c.getAttribute('detectionRadius')) || 200;
                const stuck = c.getAttribute('stuck') === 'false';
                const n1 = Math.floor(Math.random() * 5) + 1;
                let n2 = Math.floor(Math.random() * 10);
                if (n1 === 5 && n2 >= 5) n2 = 4;
                const obj = { type: 'enemy', x, y, w: 50, h: 50, startX: x, startY: y, min: mn, max: mx, detectionR, detected: false, label: `${n1},${n2}`, ghost, texture, textureMode, textureFrames, textureFps, rotation, invertX, invertY, tex: null, stuck: stuck, vy: 0, onGround: false };
                lvl.enemies.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'orb') {
                const obj = { type: 'orb', x, y, r: 20, strength: parseFloat(c.getAttribute('strength')) || 2.5, actTimer: 0, ghost, texture, textureMode, textureFrames, textureFps, rotation, invertX, invertY, tex: null };
                lvl.orbs.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'movingPlatformUp') {
                const psy = parseFloat(c.getAttribute('startY')) || y;
                const pey = parseFloat(c.getAttribute('endY')) || y + 300;
                const triggerMode = c.getAttribute('triggerMode') === 'true';
                const triggerTimeout = parseFloat(c.getAttribute('triggerTimeout') ?? 1.0);
                const returnTimeout = parseFloat(c.getAttribute('returnTimeout') ?? 2.0);
                const obj = { type: 'mpUp', x, w, h, startY: psy, endY: pey, cy: psy, dir: 1, ghost, oneWay, texture, textureMode, textureFrames, textureFps, rotation, invertX, invertY, tex: null, triggerMode, triggerTimeout, returnTimeout, triggerTimer: 0, returnTimer: 0, triggerState: 'idle' };
                lvl.mpUp.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'movingPlatformRight') {
                const psx = parseFloat(c.getAttribute('startX')) || x;
                const pex = parseFloat(c.getAttribute('endX')) || x + 300;
                const obj = { type: 'mpRight', y, w, h, startX: psx, endX: pex, cx: psx, dir: 1, ghost, oneWay, texture, textureMode, textureFrames, textureFps, rotation, invertX, invertY, tex: null };
                lvl.mpRight.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'coin') {
                const r = parseFloat(c.getAttribute('r')) || 14;
                const blue = c.getAttribute('blue') === 'true';
                const obj = { type: 'coin', x, y, r, collected: false, bobTimer: Math.random() * Math.PI * 2, ghost, texture, textureMode, textureFrames, textureFps, rotation, invertX, invertY, tex: null, blue };
                lvl.coins.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'checkpoint') {
                const obj = { type: 'checkpoint', x, y, activated: false };
                lvl.checkpoints.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'end') {
                const obj = { type: 'end', x, y, w, h };
                lvl.ends.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'text') {
                const baseFont = c.getAttribute('font') || '20px sans-serif';
                const baseColor = c.getAttribute('color') || '#ffffff';
                const TAG_COLORS = { y: '#fce512', r: '#fc1212', g: '#4caf50', bl: '#5b9cf6', o: '#fc9312', p: '#c084fc', w: '#ffffff', gray: '#9b9b9c' };
                function parseSegments(node, bold, color) {
                    const segs = [];
                    for (const child of node.childNodes) {
                        if (child.nodeType === 3) {
                            if (child.nodeValue) segs.push({ text: child.nodeValue, bold, color });
                        } else if (child.nodeType === 1) {
                            const tn2 = child.tagName.toLowerCase();
                            const newBold = bold || tn2 === 'b';
                            const newColor = TAG_COLORS[tn2] !== undefined ? TAG_COLORS[tn2] : color;
                            segs.push(...parseSegments(child, newBold, newColor));
                        }
                    }
                    return segs;
                }
                const segments = parseSegments(c, false, baseColor);
                const obj = { type: 'text', x, y, segments, baseFont, ghost };
                lvl.texts.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'portal') {
                const portalId = c.getAttribute('portal-id') || null;
                const toPortalId = c.getAttribute('to-portal-id') || null;
                const obj = { type: 'portal', x, y, w, h, portalId, toPortalId, cooldown: 0, texture, textureMode, textureFrames, textureFps, rotation, invertX, invertY, tex: null };
                lvl.portals.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'key') {
                const keyId = c.getAttribute('keyId') || `key_${Math.random()}`;
                const keyColor = c.getAttribute('color') || '#ffd700';
                const r = parseFloat(c.getAttribute('r')) || 16;
                const obj = {
                    type: 'key', x, y, origX: x, origY: y, r, keyId, keyColor,
                    collected: false,
                    bobTimer: Math.random() * Math.PI * 2,
                    ghost,
                    _swapLocked: false,
                };
                lvl.keys.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'area') {
                const areaId = c.getAttribute('id') || `area_${Math.random()}`;
                const checkpointX = c.getAttribute('checkpointX') !== null ? parseFloat(c.getAttribute('checkpointX')) : null;
                const checkpointY = c.getAttribute('checkpointY') !== null ? parseFloat(c.getAttribute('checkpointY')) : null;
                const obj = {
                    type: 'area', x, y, w, h, areaId,
                    checkpointX, checkpointY,
                    triggered: false,
                };
                lvl.areas.push(obj);
            } else if (tag === 'camera') {
                const areaId = c.getAttribute('areaId') || null;
                const lockX = c.getAttribute('lockX') === 'true';
                const lockY = c.getAttribute('lockY') === 'true';
                const targetCamX = c.getAttribute('targetCamX') !== null ? parseFloat(c.getAttribute('targetCamX')) : null;
                const targetCamY = c.getAttribute('targetCamY') !== null ? parseFloat(c.getAttribute('targetCamY')) : null;
                lvl.cameras.push({ type: 'camera', areaId, lockX, lockY, targetCamX, targetCamY });
            } else if (tag === 'music') {
                const areaId = c.getAttribute('areaId') || null;
                const song = c.getAttribute('song') || null;
                const fadeDuration = parseFloat(c.getAttribute('fadeDuration')) || 1.5;
                const restartOnDie = c.getAttribute('restartOnDie') === 'true';
                lvl.musicTriggers.push({ areaId, song, fadeDuration, fired: false, restartOnDie });
            } else if (tag === 'enemySpawner') {
                const areaId = c.getAttribute('areaId') || null;
                const count = parseInt(c.getAttribute('count')) || 1;
                const spawnX = parseFloat(c.getAttribute('x')) ?? 0;
                const spawnY = parseFloat(c.getAttribute('y')) ?? 0;
                const spawnSpread = parseFloat(c.getAttribute('spread')) || 0;
                const mn = c.getAttribute('min') !== null ? parseFloat(c.getAttribute('min')) : null;
                const mx = c.getAttribute('max') !== null ? parseFloat(c.getAttribute('max')) : null;
                const detectionR = parseFloat(c.getAttribute('detectionRadius')) || 200;
                const stuck = c.getAttribute('stuck') !== 'false';
                const ghostSp = c.getAttribute('ghost') === 'true';
                const textureSp = c.getAttribute('texture') || null;
                const textureModeSp = c.getAttribute('textureMode') || 'tile';
                if (!lvl.enemySpawners) lvl.enemySpawners = [];
                lvl.enemySpawners.push({
                    areaId, count, spawnX, spawnY, spread: spawnSpread,
                    min: mn, max: mx, detectionR,
                    stuck, ghost: ghostSp, texture: textureSp, textureMode: textureModeSp, textureFrames, textureFps, rotation, invertX, invertY,
                    speed: parseFloat(c.getAttribute('speed')) || 100,
                    fired: false,
                });
            } else if (tag === 'despawnEnemies') {
                lvl.despawnTriggers.push({
                    areaId: c.getAttribute('areaId') || null,
                    spawnerAreaId: c.getAttribute('spawnerAreaId') || null,
                    fired: false,
                });
            } else if (tag === 'playAgainButton') {
                lvl.playAgainText = c.textContent || lvl.playAgainText;
            } else if (tag === 'closeGameButton') {
                lvl.closeGameText = c.textContent || lvl.closeGameText;
            }
        }
        return lvl;
    }

    async function loadLevelTextures(lvl) {
        const all = [...lvl.floors, ...lvl.walls, ...lvl.lavas, ...lvl.trampolines,
            ...lvl.enemies, ...lvl.orbs, ...lvl.mpUp, ...lvl.mpRight, ...lvl.coins, ...lvl.portals];
        await Promise.all(all.map(async obj => {
            if (obj.texture) {
                obj.tex = await loadTexture(obj.texture);
                if (obj.tex && obj.textureMode === 'tile' && obj.w && obj.h) {
                    if (obj.textureFrames > 1) {
                        obj._animBakedFrames = bakeAnimatedTiledTexture(obj.tex, obj.w, obj.h, obj.textureFrames);
                    } else {
                        obj.bakedCanvas = bakeTiledTexture(obj.tex, obj.w, obj.h);
                    }
                }
            }
            if (obj.textureGhost) obj.texGhost = await loadTexture(obj.textureGhost);
        }));
        if (lvl.bgTexture) {
            lvl._bgTexEntry = await loadTexture(lvl.bgTexture);
        }
    }

    function bakeBg(lvl) {
        const w = canvas.width, h = canvas.height;
        if (lvl._bgBaked && lvl._bgBakedW === w && lvl._bgBakedH === h) {
            return lvl._bgBaked;
        }
        const oc = new OffscreenCanvas(w, h);
        const octx = oc.getContext('2d');

        const top = lvl.bgColor || '#0f0f23';
        const bottom = lvl.bgColor2 || (lvl.bgColor ? lvl.bgColor : '#1a1a2e');
        const g = octx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, top);
        g.addColorStop(1, bottom);
        octx.fillStyle = g;
        octx.fillRect(0, 0, w, h);

        if (lvl._bgTexEntry) {
            const tex = lvl._bgTexEntry;
            const mode = lvl.bgTextureMode;
            const alpha = lvl.bgTextureAlpha ?? 1;
            octx.globalAlpha = alpha;
            if (mode === 'tile') {
                const pat = octx.createPattern(tex.img, 'repeat');
                octx.fillStyle = pat;
                octx.fillRect(0, 0, w, h);
            } else if (mode === 'stretch') {
                octx.drawImage(tex.img, 0, 0, w, h);
            } else if (mode === 'cover') {
                const imgW = tex.img.naturalWidth, imgH = tex.img.naturalHeight;
                const scale = Math.max(w / imgW, h / imgH);
                const dw = imgW * scale, dh = imgH * scale;
                octx.drawImage(tex.img, (w - dw) / 2, (h - dh) / 2, dw, dh);
            }
            octx.globalAlpha = 1;
        }

        lvl._bgBaked = oc;
        lvl._bgBakedW = w;
        lvl._bgBakedH = h;
        return oc;
    }

    function bakeTiledTexture(texEntry, w, h) {
        const oc = new OffscreenCanvas(w, h);
        const octx = oc.getContext('2d');
        const pat = octx.createPattern(texEntry.img, 'repeat');
        octx.fillStyle = pat;
        octx.fillRect(0, 0, w, h);
        return oc;
    }

    function bakeAnimatedTiledTexture(texEntry, w, h, frameCount) {
        const img = texEntry.img;
        const frameH = img.naturalHeight / frameCount;
        const frameW = img.naturalWidth;
        return Array.from({ length: frameCount }, (_, i) => {
            const oc = new OffscreenCanvas(w, h);
            const octx = oc.getContext('2d');
            for (let ty = 0; ty < h; ty += frameH) {
                for (let tx = 0; tx < w; tx += frameW) {
                    octx.drawImage(img, 0, i * frameH, frameW, frameH, tx, ty, frameW, frameH);
                }
            }
            return oc;
        });
    }

    const levels = [];
    const parser = new DOMParser();
    for (let i = 0; ; i++) {
        try {
            const resp = await fetch(chrome.runtime.getURL(`platformer_levels/lvl-${i}.xml`));
            if (!resp.ok) break;
            const xml = parser.parseFromString(await resp.text(), 'text/xml');
            if (xml.querySelector('parseerror')) break;
            const lvlParsed = parseLvl(xml, i);
            await loadLevelTextures(lvlParsed);
            levels.push(lvlParsed);
        } catch(e) { break; }
    }

    function populateLevelGrid() {
        const grid = document.getElementById('mod-level-grid');
        grid.innerHTML = '';
        const progress = getCompletedLevels();
        const highestCompleted = Math.max(-1, ...Object.keys(progress).map(k => parseInt(k)));

        levels.forEach((level, idx) => {
            const totalCoins = countLevelCoins(level);
            const earnedCoins = getLevelCoins(idx);
            const completed = progress[idx]?.completed || false;
            const locked = idx > highestCompleted + 1;
            const bestTime = getLevelBestTime(idx);

            const card = document.createElement('div');
            card.className = 'mod-level-card';
            if (completed) card.classList.add('mod-level-done');
            if (locked) card.classList.add('mod-level-locked');

            if (locked) {
                card.innerHTML = `
                    <div class="mod-level-lock">🔒</div>
                    <div class="mod-level-num">${idx + 1}</div>
                    <div class="mod-level-name">${level.title}</div>
                `;
            } else {
                card.innerHTML = `
                    ${completed ? '<div class="mod-level-badge">✓</div>' : ''}
                    <div class="mod-level-num">${idx + 1}</div>
                    <div class="mod-level-name">${level.title}</div>
                    ${totalCoins > 0 ? `<div class="mod-level-coins">🪙 ${earnedCoins}/${totalCoins}</div>` : ''}
                    ${bestTime !== null ? `<div class="mod-level-besttime">⏱ ${bestTime.toFixed(1)}s</div>` : ''}
                `;

                card.addEventListener('click', () => {
                    startGame(idx);
                });
            }

            grid.appendChild(card);
        });
    }

    updateMenuCoins();
    populateLevelGrid();

    const PW = 49, PH = 49;
    const GRAV = 1800;
    const JUMP_V = 620;
    const SPEED = 300;
    const MAX_FALL = -1400;
    const PORTAL_COOLDOWN = 0.4;
    const DEATH_DUR = 0.7;
    const DOOR_SLIDE_SPEED = 4;

    const sfxPool = {};

    let lvl = null;
    let lvlIdx = 0;
    let px, py, vx = 0, vy = 0;
    let onGround = false;
    let phase = 'playing';
    let camX = 0, camY = 0;
    let elapsed = 0;
    let timing = false;
    let jumpQ = false;
    let jumpHeldLastFrame = false;
    let jumpAnim = 0, landAnim = 0;
    let gameAlive = true;
    let descTimer = 0;
    let sessionCoins = 0;
    let sessionTotalCoins = 0;
    let coinPopups = [];

    let checkpointHistory = [];

    let portalCooldownTimer = 0;
    let snapCam = false;
    const KEY = {};

    let fps = 0, fpsAccum = 0, fpsFrames = 0;
    let standingOn = null;

    let mLeft = false, mRight = false, mJump = false;

    let debugCpIdx = -1;

    let deathTimer = 0;
    let deathSlices = [];

    let heldKey = null;

    let doorMsg = null;

    let noclip = false;

    let levelCompletedTime = 0;

    function getCurrentCheckpoint() {
        return checkpointHistory.length > 0 ? checkpointHistory[checkpointHistory.length - 1] : null;
    }

    function captureCollectedSnapshot() {
        const snap = new Set();
        if (lvl) lvl.coins.forEach((co, i) => { if (co.collected) snap.add(i); });
        return snap;
    }

    function captureKeySnapshot() {
        const collectedKeys = new Set();
        if (lvl) lvl.keys.forEach((k, i) => { if (k.collected) collectedKeys.add(i); });
        return { collectedKeys, heldKey: heldKey ? { ...heldKey } : null };
    }

    function captureAreaSnapshot() {
        if (!lvl) return [];
        return lvl.areas.map(a => ({ triggered: a.triggered }));
    }

    function captureLavaSnapshot() {
        if (!lvl) return [];
        return lvl.lavas.map(lv => ({
            currentH: lv.currentH,
            flowTimer: lv.flowTimer,
            flowing: lv.flowing,
        }));
    }

    function restoreFromCheckpoint(cp) {
        if (!cp) {
            sessionCoins -= lvl.coins.filter(co => co.collected).length;
            elapsed = 0;
            px = lvl.spawnX; py = lvl.spawnY;
            lvl.coins.forEach(co => { co.collected = false; });
            lvl.keys.forEach(k => { k.collected = false; k.x = k.origX; k.y = k.origY; k._swapLocked = false; });
            heldKey = null;
            lvl.walls.forEach(w => {
                if (w.keyId) { w.doorOpen = false; w.doorSlide = 0; w.doorDir = 0; }
                if (w.closeOnAreaId) { w.areaCloseSlide = 1; w.areaCloseDir = 0; }
            });
            lvl.areas.forEach(a => { a.triggered = false; });
            lvl.musicTriggers.forEach(mt => { mt.fired = false; });
            lvl.despawnTriggers.forEach(ds => { ds.fired = false; });
            lvl.enemySpawners.forEach(sp => { sp._pendingSpawns = 0; sp._spawnTimer = 0; sp._waitingForExit = false; });
            lvl.lavas.forEach(lv => {
                if (lv.flowUp) { lv.currentH = lv.h; lv.flowTimer = 0; lv.flowing = !lv.flowAreaId; }
            });
            lvl.enemies.forEach(en => { if (!en._spawned) { en.x = en.startX; en.y = en.startY; en.vy = 0; en.onGround = false; } en.detected = false; });
            if (currentSong !== lvl.song) fadeMusicTo(lvl.song, 1.0);
        } else {
            px = cp.x; py = cp.y;
            sessionCoins = cp.coins;
            lvl.coins.forEach((co, i) => { co.collected = cp.collectedSnapshot.has(i); });
            if (cp.keySnapshot) {
                lvl.keys.forEach((k, i) => {
                    k.collected = cp.keySnapshot.collectedKeys.has(i);
                    if (!k.collected) { k.x = k.origX; k.y = k.origY; }
                    k._swapLocked = false;
                });
                heldKey = cp.keySnapshot.heldKey ? { ...cp.keySnapshot.heldKey } : null;
            }
            if (cp.doorSnapshot) {
                lvl.walls.forEach((w, i) => {
                    if (w.keyId && cp.doorSnapshot[i] !== undefined) {
                        w.doorOpen = cp.doorSnapshot[i].doorOpen;
                        w.doorSlide = cp.doorSnapshot[i].doorSlide;
                        w.doorDir = 0;
                    }
                });
            }
            lvl.areas.forEach(a => { a.triggered = false; });
            lvl.musicTriggers.forEach(mt => { mt.fired = false; });
            lvl.despawnTriggers.forEach(ds => { ds.fired = false; });
            lvl.enemySpawners.forEach(sp => { sp._pendingSpawns = 0; sp._spawnTimer = 0; sp._waitingForExit = false; });
            lvl.walls.forEach(w => {
                if (!w.closeOnAreaId) return;
                const linkedArea = lvl.areas.find(a => a.areaId === w.closeOnAreaId);
                const areaIdx = lvl.areas.indexOf(linkedArea);
                const wasTriggeredAtCp = cp.areaSnapshot && areaIdx !== -1 && cp.areaSnapshot[areaIdx]?.triggered;
                w.areaCloseSlide = wasTriggeredAtCp ? 0 : 1;
                w.areaCloseDir = 0;
            });
            if (cp.lavaSnapshot) {
                lvl.lavas.forEach((lv, i) => {
                    const snap = cp.lavaSnapshot[i];
                    if (!snap || !lv.flowUp) return;
                    lv.currentH = snap.currentH;
                    lv.flowTimer = snap.flowTimer;
                    lv.flowing = snap.flowing;
                });
            }
            lvl.enemies.forEach(en => { if (!en._spawned) { en.x = en.startX; en.y = en.startY; en.vy = 0; en.onGround = false; } en.detected = false; });
            const fadeSong = cp.songSnapshot !== undefined ? cp.songSnapshot : lvl.song;
            const shouldRestart = currentSong !== fadeSong ||
                lvl.musicTriggers.some(mt => mt.song === fadeSong && mt.restartOnDie);
            if (shouldRestart) fadeMusicTo(fadeSong, 1.0);
        }
    }

    function captureDoorSnapshot() {
        const snap = {};
        if (lvl) lvl.walls.forEach((w, i) => {
            if (w.keyId) snap[i] = { doorOpen: w.doorOpen, doorSlide: w.doorSlide };
        });
        return snap;
    }

    document.addEventListener('keydown', e => {
        if (['ArrowDown', 'ArrowUp', 'Space'].includes(e.code)) e.preventDefault();
        KEY[e.code] = true;
        if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) jumpQ = true;
        if (DEBUG_MODE && e.code === 'KeyH') debugVisible = !debugVisible;
        if (DEBUG_MODE && e.code === 'KeyN') { noclip = !noclip; }
        if (e.code === 'Escape') togglePause();
        if (DEBUG_MODE && e.code === 'KeyE') {
            const areaCps = lvl.areas
                .filter(a => a.checkpointX !== null)
                .map(a => ({ x: a.checkpointX, y: a.checkpointY ?? a.checkpointX }));
            const cps = [{ x: lvl.spawnX, y: lvl.spawnY }, ...lvl.checkpoints, ...areaCps];
            debugCpIdx = Math.min(debugCpIdx + 1, cps.length - 1);
            const cp = cps[debugCpIdx];
            const alreadyIn = checkpointHistory.some(h => h.x === cp.x && h.y === cp.y);
            if (!alreadyIn && debugCpIdx > 0) {
                checkpointHistory.push({
                    x: cp.x, y: cp.y,
                    coins: sessionCoins,
                    elapsed,
                    songSnapshot: currentSong,
                    collectedSnapshot: captureCollectedSnapshot(),
                    keySnapshot: captureKeySnapshot(),
                    doorSnapshot: captureDoorSnapshot(),
                    areaSnapshot: captureAreaSnapshot(),
                    lavaSnapshot: captureLavaSnapshot(),
                });
            }
            px = cp.x; py = cp.y; vx = 0; vy = 0; snapCam = true;
        }
        if (DEBUG_MODE && e.code === 'KeyQ') {
            const areaCps = lvl.areas
                .filter(a => a.checkpointX !== null)
                .map(a => ({ x: a.checkpointX, y: a.checkpointY ?? a.checkpointX }));
            const cps = [{ x: lvl.spawnX, y: lvl.spawnY }, ...lvl.checkpoints, ...areaCps];
            debugCpIdx = Math.max(debugCpIdx - 1, 0);
            const cp = cps[debugCpIdx];
            px = cp.x; py = cp.y; vx = 0; vy = 0; snapCam = true;
        }
    });
    document.addEventListener('keyup', e => { KEY[e.code] = false; });

    function togglePause() {
        if (phase === 'win' || phase === 'levelComplete') return;
        if (phase === 'playing') {
            phase = 'paused';
            timing = false;
            if (musicAudio) musicAudio.pause();
            if (musicFading) {
                if (musicFading.outAudio) musicFading.outAudio.pause();
                if (musicFading.inAudio) musicFading.inAudio.pause();
            }
        } else if (phase === 'paused') {
            phase = 'playing';
            timing = true;
            if (musicAudio) musicAudio.play().catch(() => {});
            if (musicFading) {
                if (musicFading.outAudio) musicFading.outAudio.play().catch(() => {});
                if (musicFading.inAudio) musicFading.inAudio.play().catch(() => {});
            }
        }
    }

    function mBtn(btnId, onD, onU) {
        const b = id(btnId); if (!b) return;
        ['touchstart', 'mousedown'].forEach(ev => b.addEventListener(ev, e => { e.preventDefault(); onD(); }));
        ['touchend', 'mouseup', 'touchcancel', 'mouseleave'].forEach(ev => b.addEventListener(ev, e => { e.preventDefault(); onU(); }));
    }
    mBtn('mod-btn-left', () => mLeft = true, () => mLeft = false);
    mBtn('mod-btn-right', () => mRight = true, () => mRight = false);
    mBtn('mod-btn-jump', () => { mJump = true; jumpQ = true; }, () => mJump = false);

    id('mod-pause-btn').addEventListener('click', () => togglePause());
    id('mod-pause-btn').addEventListener('touchend', e => { e.preventDefault(); e.stopPropagation(); togglePause(); });
    id('mod-close-button').addEventListener('click', endGame);

    function hit(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    function circleRectHit(circleX, circleY, radius, rectX, rectY, rectW, rectH) {
        const closestX = Math.max(rectX, Math.min(circleX, rectX + rectW));
        const closestY = Math.max(rectY, Math.min(circleY, rectY + rectH));
        const dx = circleX - closestX;
        const dy = circleY - closestY;
        return (dx * dx + dy * dy) < (radius * radius);
    }
 
    function circleCircleHit(x1, y1, r1, x2, y2, r2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const distSq = dx * dx + dy * dy;
        const radSum = r1 + r2;
        return distSq < (radSum * radSum);
    }

    function countLevelCoins(l) {
        return l ? l.coins.filter(c => !c.ghost).reduce((t, c) => t + (c.blue ? 10 : 1), 0) : 0;
    }

    function showDoorMsg(text) {
        doorMsg = { text, timer: 2.2, maxTimer: 2.2 };
    }

    function loadLvl(idx) {
        if (idx >= levels.length) { winGame(); return; }
        lvlIdx = idx;
        lvl = levels[idx];
        for (const mp of lvl.mpUp) { mp.cy = mp.startY; mp.dir = 1; mp.triggerTimer = 0; mp.returnTimer = 0; mp.triggerState = 'idle'; }
        for (const mp of lvl.mpRight) { mp.cx = mp.startX; mp.dir = 1; }
        for (const orb of lvl.orbs) { orb.actTimer = 0; }
        for (const en of lvl.enemies) { en.x = en.startX; en.y = en.startY; en.vy = 0; en.onGround = false; en.detected = false; }
        for (const co of lvl.coins) { co.collected = false; }
        for (const cp of lvl.checkpoints) { cp.activated = false; }
        for (const pt of lvl.portals) { pt.cooldown = 0; }
        for (const wl of lvl.walls) {
            wl.playerOverlap = false;
            if (wl.keyId) { wl.doorOpen = false; wl.doorSlide = 0; wl.doorDir = 0; }
            if (wl.closeOnAreaId) { wl.areaCloseSlide = 1; wl.areaCloseDir = 0; }
        }
        for (const k of lvl.keys) { k.collected = false; k.x = k.origX; k.y = k.origY; k._swapLocked = false; }
        for (const a of lvl.areas) { a.triggered = false; }
        for (const mt of lvl.musicTriggers) { mt.fired = false; }
        for (const sp of lvl.enemySpawners) { sp.fired = false; sp._pendingSpawns = 0; sp._spawnTimer = 0; sp._waitingForExit = false; }
        for (const ds of lvl.despawnTriggers) { ds.fired = false; }
        for (const lv of lvl.lavas) {
            if (lv.flowUp) { lv.currentH = lv.h; lv.flowTimer = 0; lv.flowing = !lv.flowAreaId; }
        }
        heldKey = null;
        doorMsg = null;
        checkpointHistory = [];
        px = lvl.spawnX; py = lvl.spawnY;
        vx = 0; vy = 0; onGround = false;
        phase = 'playing';
        timing = true;
        jumpAnim = 0; landAnim = 0;
        jumpHeldLastFrame = false;
        portalCooldownTimer = 0;
        snapCam = true;
        descTimer = lvl.description ? 4.0 : 0;
        camX = Math.max(0, px - canvas.width / 2);
        camY = Math.max(0, lvl.worldHeight - py - canvas.height / 2);
        debugCpIdx = -1;
        id('mod-level-title').textContent = lvl.title;
        playLevelMusic(lvl.song);
    }

    function completedLevel() {
        phase = 'levelComplete';
        timing = false;
        levelCompletedTime = elapsed;

        markLevelCompleted(lvlIdx, sessionCoins);
        setLevelBestTime(lvlIdx, elapsed);

        const totalEarned = getTotalCoinsEarned();
        set('platformer-total-coins', totalEarned);
    }

    function winGame() {
        phase = 'win';
        timing = false;
        stopMusic();

        markLevelCompleted(lvlIdx, sessionCoins);
        setLevelBestTime(lvlIdx, elapsed);

        const totalEarned = getTotalCoinsEarned();
        set('platformer-total-coins', totalEarned);
    }

    function endGame() {
        gameAlive = false;
        timing = false;
        stopMusic();
        
        for (const pool of Object.values(sfxPool)) {
            for (const audio of pool) {
                try { audio.pause(); audio.currentTime = 0; } catch(e) {}
            }
        }
        
        tn('body', 0).classList.remove('mod-game-playing');

        document.getElementById('mod-game').style.display = 'none';
        document.getElementById('mod-menu').style.display = '';

        updateMenuCoins();
        populateLevelGrid();
        showScreen('mod-screen-main');

        gameAlive = true;
    }

    function closeEntirePlatformer() {
        gameAlive = false;
        timing = false;
        stopMusic();
        
        for (const pool of Object.values(sfxPool)) {
            for (const audio of pool) {
                try { audio.pause(); audio.currentTime = 0; } catch(e) {}
            }
        }
        
        tn('body', 0).classList.remove('mod-game-playing');

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.delete('mod-play');
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);

        const menuEl = document.getElementById('mod-menu');
        const gameEl = document.getElementById('mod-game');
        if (menuEl) menuEl.remove();
        if (gameEl) gameEl.remove();
    }

    function updateCam() {
        let tx = px + PW / 2 - canvas.width / 2;
        let ty = lvl.worldHeight - (py + PH / 2) - canvas.height / 2;
 
        for (const cam of lvl.cameras) {
            if (!cam.areaId) continue;
            const area = lvl.areas.find(a => a.areaId === cam.areaId);
            if (!area) continue;
            const inArea = px + PW > area.x && px < area.x + area.w &&
                py + PH > area.y && py < area.y + area.h;
            if (!inArea) continue;
            if (cam.lockX && cam.targetCamX !== null) tx = cam.targetCamX - canvas.width / 2;
            if (cam.lockY && cam.targetCamY !== null) ty = lvl.worldHeight - cam.targetCamY - canvas.height / 2;
        }
 
        if (snapCam) {
            camX = tx;
            camY = ty;
            const stillInPortal = lvl.portals.some(pt => hit(px, py, PW, PH, pt.x, pt.y, pt.w, pt.h));
            if (!stillInPortal) snapCam = false;
        } else {
            camX += (tx - camX) * 0.05;
            camY += (ty - camY) * 0.05;
        }
        camX = Math.max(0, Math.min(camX, lvl.worldWidth - canvas.width));
        camY = Math.max(0, Math.min(camY, lvl.worldHeight - canvas.height));
    }
 

    function wx(x) { return x - camX; }
    function wy(y, h) { return lvl.worldHeight - y - h - camY; }

    function getEnterSide(portal) {
        const pCenterX = px + PW / 2;
        const pCenterY = py + PH / 2;
        const portalCenterX = portal.x + portal.w / 2;
        const portalCenterY = portal.y + portal.h / 2;
        const dx = pCenterX - portalCenterX;
        const dy = pCenterY - portalCenterY;
        const halfW = portal.w / 2;
        const halfH = portal.h / 2;
        const normX = halfW > 0 ? dx / halfW : 0;
        const normY = halfH > 0 ? dy / halfH : 0;
        if (Math.abs(normX) >= Math.abs(normY)) {
            return normX >= 0 ? 'right' : 'left';
        } else {
            return normY >= 0 ? 'top' : 'bottom';
        }
    }

    function teleportThroughPortal(srcPortal, destPortal, enterSide) {
        if (enterSide === 'left' || enterSide === 'right') {
            const relY = Math.max(0, Math.min(1, (py - srcPortal.y) / srcPortal.h));
            px = enterSide === 'left' ? destPortal.x + destPortal.w + 10 : destPortal.x - PW - 10;
            py = destPortal.y + relY * destPortal.h;
        } else {
            const relY = Math.max(0, Math.min(1, (py - srcPortal.y) / srcPortal.h));
            px = destPortal.x + (destPortal.w - PW) / 2;
            py = destPortal.y + relY * destPortal.h;
        }
        portalCooldownTimer = 0;
        snapCam = true;
    }

    function getDoorEffectiveRect(wl) {
        if (!wl.keyId) return { x: wl.x, y: wl.y, w: wl.w, h: wl.h };
        const slideOffset = wl.doorSlide * wl.h;
        return { x: wl.x, y: wl.y + slideOffset, w: wl.w, h: wl.h * (1 - wl.doorSlide) };
    }

    function getAreaCloseRect(wl) {
        if (!wl.closeOnAreaId) return { x: wl.x, y: wl.y, w: wl.w, h: wl.h };
        const vis = 1 - wl.areaCloseSlide;
        return { x: wl.x, y: wl.y, w: wl.w, h: wl.h * vis };
    }

    function getRotatedCorners(x, y, w, h, rotRad) {
        const cx = x + w / 2, cy = y + h / 2;
        const cos = Math.cos(rotRad), sin = Math.sin(rotRad);
        const hw = w / 2, hh = h / 2;
        return [
            [cx - cos * hw + sin * hh, cy - sin * hw - cos * hh],
            [cx + cos * hw + sin * hh, cy + sin * hw - cos * hh],
            [cx + cos * hw - sin * hh, cy + sin * hw + cos * hh],
            [cx - cos * hw - sin * hh, cy - sin * hw + cos * hh],
        ];
    }

    function getAxes(corners) {
        const axes = [];
        for (let i = 0; i < corners.length; i++) {
            const [x1, y1] = corners[i];
            const [x2, y2] = corners[(i + 1) % corners.length];
            const nx = -(y2 - y1), ny = x2 - x1;
            const len = Math.sqrt(nx * nx + ny * ny);
            if (len > 0) axes.push([nx / len, ny / len]);
        }
        return axes;
    }

    function satMTV(ax, ay, aw, ah, bx, by, bw, bh, bRotRad) {
        if (!bRotRad) return null;
        const cornersA = [[ax, ay], [ax + aw, ay], [ax + aw, ay + ah], [ax, ay + ah]];
        const cornersB = getRotatedCorners(bx, by, bw, bh, bRotRad);
        const axes = [...getAxes(cornersA), ...getAxes(cornersB)];
        let minOverlap = Infinity, mtvX = 0, mtvY = 0;
        for (const [nx, ny] of axes) {
            let minA = Infinity, maxA = -Infinity, minB = Infinity, maxB = -Infinity;
            for (const [cx, cy] of cornersA) { const p = cx * nx + cy * ny; minA = Math.min(minA, p); maxA = Math.max(maxA, p); }
            for (const [cx, cy] of cornersB) { const p = cx * nx + cy * ny; minB = Math.min(minB, p); maxB = Math.max(maxB, p); }
            if (maxA < minB || maxB < minA) return null;
            const overlap = Math.min(maxA - minB, maxB - minA);
            if (overlap < minOverlap) { minOverlap = overlap; mtvX = nx * overlap; mtvY = ny * overlap; }
        }
        const dCx = (ax + aw / 2) - (bx + bw / 2);
        const dCy = (ay + ah / 2) - (by + bh / 2);
        if (dCx * mtvX + dCy * mtvY < 0) { mtvX = -mtvX; mtvY = -mtvY; }
        return { x: mtvX, y: mtvY };
    }

    function hitRotated(ax, ay, aw, ah, obj) {
        const rot = (obj.rotation || 0) * Math.PI / 180;
        const bx = obj.x ?? obj.cx ?? 0;
        const by = obj.y ?? obj.cy ?? 0;
        const bw = obj.w ?? obj.r * 2;
        const bh = obj.h ?? obj.r * 2;
        if (!rot) return hit(ax, ay, aw, ah, bx, by, bw, bh);
        return satMTV(ax, ay, aw, ah, bx, by, bw, bh, rot) !== null;
    }

    function update(dt) {
        if (phase === 'dying') {
            deathTimer -= dt;
            for (const s of deathSlices) {
                s.worldX += s.vx * dt;
                s.worldYBottom += s.vy * dt;
                s.vy -= GRAV * dt;
                if (s.vy < MAX_FALL) s.vy = MAX_FALL;
                s.rot += s.rotV * dt;
            }
            if (deathTimer <= 0) {
                deathSlices = [];
                const cp = getCurrentCheckpoint();
                restoreFromCheckpoint(cp);
                vx = 0; vy = 0; onGround = false;
                portalCooldownTimer = 0;
                snapCam = true;
                for (const en of lvl.enemies) { if (!en._spawned) { en.x = en.startX; en.y = en.startY; en.vy = 0; en.onGround = false; } en.detected = false; }
                for (const orb of lvl.orbs) orb.actTimer = 0;
                phase = 'playing';
            }
            updateCam();
            return;
        }
        if (phase === 'levelComplete' || phase === 'win') return;
        if (phase !== 'playing') return;

        if (descTimer > 0) descTimer -= dt;
        if (portalCooldownTimer > 0) portalCooldownTimer -= dt;
        if (doorMsg && doorMsg.timer > 0) doorMsg.timer -= dt;

        updateMusicFade(dt);

        for (const popup of coinPopups) { popup.y -= 60 * dt; popup.life -= dt; }
        coinPopups = coinPopups.filter(p => p.life > 0);

        for (const wl of lvl.walls) {
            if (!wl.keyId) continue;
            if (wl.doorDir === 1) {
                wl.doorSlide = Math.min(1, wl.doorSlide + DOOR_SLIDE_SPEED * dt);
                if (wl.doorSlide >= 1) { wl.doorSlide = 1; wl.doorDir = 0; wl.doorOpen = true; }
            }
        }

        for (const wl of lvl.walls) {
            if (!wl.closeOnAreaId || wl.areaCloseDir === 0) continue;
            wl.areaCloseSlide = Math.max(0, wl.areaCloseSlide - DOOR_SLIDE_SPEED * dt);
            if (wl.areaCloseSlide <= 0) { wl.areaCloseSlide = 0; wl.areaCloseDir = 0; }
        }

        for (const lv of lvl.lavas) {
            if (!lv.flowUp || !lv.flowing) continue;
            if (lv.flowDuration > 0 && lv.flowTimer >= lv.flowDuration) continue;
            lv.flowTimer += dt;
            const lavaElapsed = lv.flowDuration > 0 ? Math.min(lv.flowTimer, lv.flowDuration) : lv.flowTimer;
            lv.currentH = lv.h + lv.flowSpeed * lavaElapsed;
        }

        for (const wl of lvl.walls) {
            if (!wl.riseWithId) continue;
            const lava = lvl.lavas.find(lv => lv.riseId === wl.riseWithId);
            if (!lava) continue;
            const lavaTopY = lava.y + (lava.flowUp ? lava.currentH : lava.h);
            if (wl.riseYOnly) {
                wl.riseCurrentY = lavaTopY + wl.riseYOffset;
                wl.riseCurrentH = wl.h;
            } else {
                wl.riseCurrentY = lava.y + wl.riseYOffset;
                wl.riseCurrentH = lavaTopY - lava.y - wl.riseYOffset;
            }
        }

        for (const area of lvl.areas) {
            if (area.triggered) continue;
            const fullyInside = px >= area.x && px + PW <= area.x + area.w &&
                py >= area.y && py + PH <= area.y + area.h;
            if (!fullyInside) continue;
            area.triggered = true;

            if (area.checkpointX !== null) {
                checkpointHistory.push({
                    x: area.checkpointX,
                    y: area.checkpointY ?? area.checkpointX,
                    coins: sessionCoins,
                    elapsed,
                    songSnapshot: currentSong,
                    collectedSnapshot: captureCollectedSnapshot(),
                    keySnapshot: captureKeySnapshot(),
                    doorSnapshot: captureDoorSnapshot(),
                    areaSnapshot: captureAreaSnapshot(),
                    lavaSnapshot: captureLavaSnapshot(),
                });
            }

            for (const wl of lvl.walls) {
                if (wl.closeOnAreaId === area.areaId) {
                    wl.areaCloseDir = 1;
                }
            }

            for (const lv of lvl.lavas) {
                if (lv.flowAreaId === area.areaId) {
                    lv.flowing = true;
                    lv.flowTimer = 0;
                }
            }

            for (const sp of lvl.enemySpawners) {
                if (!sp.fired && sp.areaId === area.areaId) {
                    sp.fired = true;
                    sp._pendingSpawns = sp.count;
                    sp._spawnTimer = 0;
                    sp._waitingForExit = true;
                }
            }

            for (const ds of lvl.despawnTriggers) {
                if (!ds.fired && ds.areaId === area.areaId) {
                    ds.fired = true;
                    if (ds.spawnerAreaId === null) {
                        lvl.enemies = [];
                        lvl.drawOrder = lvl.drawOrder.filter(o => o.type !== 'enemy');
                    } else {
                        const spawner = lvl.enemySpawners.find(sp => sp.areaId === ds.spawnerAreaId);
                        if (spawner) {
                            lvl.enemies = lvl.enemies.filter(en => !(en._spawned && en._spawnerAreaId === ds.spawnerAreaId));
                            lvl.drawOrder = lvl.drawOrder.filter(o => !(o.type === 'enemy' && o._spawned && o._spawnerAreaId === ds.spawnerAreaId));
                            spawner.fired = false;
                        }
                    }
                }
            }

            for (const mt of lvl.musicTriggers) {
                if (!mt.fired && mt.areaId === area.areaId) {
                    mt.fired = true;
                    fadeMusicTo(mt.song, mt.fadeDuration);
                }
            }
        }

        const SPAWN_INTERVAL = 0.4;
        const SPAWN_CLEAR_RADIUS = 60;

        for (const sp of lvl.enemySpawners) {
            if (!sp._waitingForExit && !sp._pendingSpawns) continue;

            const area = lvl.areas.find(a => a.areaId === sp.areaId);
            const playerInArea = area && (
                px + PW > area.x && px < area.x + area.w &&
                py + PH > area.y && py < area.y + area.h
            );

            if (sp._waitingForExit) {
                if (!playerInArea) sp._waitingForExit = false;
                continue;
            }

            if (sp._pendingSpawns > 0) {
                sp._spawnTimer -= dt;
                if (sp._spawnTimer > 0) continue;

                const spawnIdx = sp.count - sp._pendingSpawns;
                const ex = sp.spawnX + spawnIdx * sp.spread;
                const ey = sp.spawnY;
                const dx = (px + PW / 2) - (ex + 25);
                const dy = (py + PH / 2) - (ey + 25);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < SPAWN_CLEAR_RADIUS) continue;

                const n1 = Math.floor(Math.random() * 5) + 1;
                let n2 = Math.floor(Math.random() * 10);
                if (n1 === 5 && n2 >= 5) n2 = 4;
                const spawnedEnemy = {
                    type: 'enemy',
                    x: ex, y: ey,
                    startX: ex, startY: ey,
                    _spawnerAreaId: sp.areaId,
                    w: 50, h: 50,
                    min: sp.min, max: sp.max,
                    detectionR: sp.detectionR,
                    speed: sp.speed,
                    detected: false,
                    label: `${n1},${n2}`,
                    ghost: sp.ghost,
                    texture: sp.texture,
                    textureMode: sp.textureMode,
                    tex: null,
                    stuck: sp.stuck,
                    vy: 0, onGround: false,
                    _spawned: true,
                };
                if (sp.texture) loadTexture(sp.texture).then(t => { spawnedEnemy.tex = t; });
                lvl.enemies.push(spawnedEnemy);
                lvl.drawOrder.push(spawnedEnemy);
                sp._pendingSpawns--;
                sp._spawnTimer = SPAWN_INTERVAL;
            }
        }

        const goLeft = mLeft || KEY['ArrowLeft'] || KEY['KeyA'];
        const goRight = mRight || KEY['ArrowRight'] || KEY['KeyD'];

        if (goRight && !goLeft) vx = SPEED;
        else if (goLeft && !goRight) vx = -SPEED;
        else vx = 0;

        if (standingOn?._mp) {
            if (standingOn.type === 'mpRight') px = Math.max(0, Math.min(px + standingOn._mp.deltaX, lvl.worldWidth - PW));
            if (standingOn.type === 'mpUp') py += standingOn._mp.deltaY;
        }

        if (!onGround) {
            vy -= GRAV * dt;
            if (vy < MAX_FALL) vy = MAX_FALL;
        }

        const jumpHeld = mJump || KEY['ArrowUp'] || KEY['KeyW'] || KEY['Space'];
        if (!jumpHeld) jumpQ = false;
        const wantJump = jumpQ || (jumpHeld && onGround);
 
        const PLAYER_INNER_SIZE = 12;
        const playerInnerX = px + (PW - PLAYER_INNER_SIZE) / 2;
        const playerInnerY = py + (PH - PLAYER_INNER_SIZE) / 2;
 
        for (const orb of lvl.orbs) {
            if (orb.ghost) continue;
            
            const touchingOrbInner = circleRectHit(orb.x, orb.y, orb.r, playerInnerX, playerInnerY, PLAYER_INNER_SIZE, PLAYER_INNER_SIZE);
            
            if (touchingOrbInner && jumpHeld && orb.actTimer <= 0) {
                vy = orb.strength * 370;
                onGround = false;
                orb.actTimer = 0.18;
                jumpAnim = 0.3;
                jumpQ = false;
                playSfx('orb-jump');
                break;
            }
        }
 
        if (wantJump && onGround) {
            vy = JUMP_V;
            onGround = false;
            jumpAnim = 0.3;
            jumpQ = false;
        }
 
        if (!jumpHeld) {
            for (const orb of lvl.orbs) {
                if (orb.ghost) continue;
                const touchingOrbInner = circleRectHit(orb.x, orb.y, orb.r, playerInnerX, playerInnerY, PLAYER_INNER_SIZE, PLAYER_INNER_SIZE);
                if (touchingOrbInner && orb.actTimer <= 0) {
                    orb.actTimer = 0.18;
                }
            }
        }

        jumpHeldLastFrame = jumpHeld;

        for (const tr of lvl.trampolines) {
            if (tr.ghost) continue;
            if (hit(px, py, PW, PH, tr.x, tr.y, tr.w, tr.h)) {
                vy = tr.strength * 380;
                onGround = false;
                jumpAnim = 0.3;
                playSfx('orb-jump');
            }
        }

        for (const mp of lvl.mpUp) {
            const oldCy = mp.cy;
            if (mp.triggerMode) {
                const playerOnTop = standingOn?._mp === mp;
                const fallDir = mp.endY > mp.startY ? 1 : -1;
                if (mp.triggerState === 'idle') {
                    if (playerOnTop) {
                        mp.triggerTimer += dt;
                        const nudge = Math.min(mp.triggerTimer / mp.triggerTimeout, 1) * 14;
                        mp.cy = mp.startY - nudge;
                    } else {
                        mp.triggerTimer = Math.max(0, mp.triggerTimer - dt * 2.5);
                        const nudge = Math.min(mp.triggerTimer / mp.triggerTimeout, 1) * 14;
                        mp.cy = mp.startY - nudge;
                    }
                    if (mp.triggerTimer >= mp.triggerTimeout) {
                        mp.triggerState = 'falling';
                        mp.triggerTimer = 0;
                    }
                } else if (mp.triggerState === 'falling') {
                    mp.cy += fallDir * 200 * dt;
                    if ((fallDir === 1 && mp.cy >= mp.endY) || (fallDir === -1 && mp.cy <= mp.endY)) {
                        mp.cy = mp.endY;
                        mp.triggerState = 'waiting';
                        mp.returnTimer = mp.returnTimeout;
                    }
                } else if (mp.triggerState === 'waiting') {
                    mp.returnTimer -= dt;
                    if (mp.returnTimer <= 0) {
                        mp.triggerState = 'returning';
                    }
                } else if (mp.triggerState === 'returning') {
                    mp.cy -= fallDir * 200 * dt;
                    if ((fallDir === 1 && mp.cy <= mp.startY) || (fallDir === -1 && mp.cy >= mp.startY)) {
                        mp.cy = mp.startY;
                        mp.triggerState = 'idle';
                        mp.triggerTimer = 0;
                    }
                }
            } else {
                const spd = 200 * dt;
                mp.cy += mp.dir * spd;
                if (mp.cy >= mp.endY) { mp.cy = mp.endY; mp.dir = -1; }
                if (mp.cy <= mp.startY) { mp.cy = mp.startY; mp.dir = 1; }
            }
            mp.deltaY = mp.cy - oldCy;
        }

        for (const mp of lvl.mpRight) {
            const spd = 160 * dt;
            const oldCx = mp.cx;
            mp.cx += mp.dir * spd;
            if (mp.cx >= mp.endX) { mp.cx = mp.endX; mp.dir = -1; }
            if (mp.cx <= mp.startX) { mp.cx = mp.startX; mp.dir = 1; }
            mp.deltaX = mp.cx - oldCx;
        }

        for (const en of lvl.enemies) {
            const spd = (en.speed ?? 100) * dt;
            const edx = (px + PW / 2) - (en.x + en.w / 2);
            const edy = (py + PH / 2) - (en.y + en.h / 2);
            en.detected = Math.sqrt(edx * edx + edy * edy) <= en.detectionR;

            if (en.detected) {
                const moveDir = en.x + en.w / 2 > px + PW / 2 ? -1 : 1;

                if (en.stuck) {
                    const nextX = en.x + moveDir * spd;
                    const checkX = moveDir > 0 ? nextX + en.w : nextX;
                    const groundCheckY = en.y - 2;
                    let hasGround = false;
                    for (const fl of [...lvl.floors, ...lvl.mpUp.map(mp => ({ x: mp.x, y: mp.cy, w: mp.w, h: mp.h })), ...lvl.mpRight.map(mp => ({ x: mp.cx, y: mp.y, w: mp.w, h: mp.h }))]) {
                        if (checkX >= fl.x && checkX <= fl.x + fl.w &&
                            groundCheckY <= fl.y + fl.h && groundCheckY >= fl.y - 4) {
                            hasGround = true; break;
                        }
                    }
                    if (hasGround) en.x += moveDir * spd;
                } else {
                    en.x += moveDir * spd;

                    if (!en.onGround) {
                        en.vy -= GRAV * dt;
                        if (en.vy < MAX_FALL) en.vy = MAX_FALL;
                    }
                    en.y += en.vy * dt;

                    en.onGround = false;
                    const enSolids = [
                        ...lvl.floors.filter(f => !f.ghost),
                        ...lvl.mpUp.filter(mp => !mp.ghost).map(mp => ({ x: mp.x, y: mp.cy, w: mp.w, h: mp.h, oneWay: mp.oneWay, type: 'mpUp', _mp: mp, rotation: mp.rotation || 0 })),
                        ...lvl.mpRight.filter(mp => !mp.ghost).map(mp => ({ x: mp.cx, y: mp.y, w: mp.w, h: mp.h, oneWay: mp.oneWay, type: 'mpRight', _mp: mp, rotation: mp.rotation || 0 })),
                        ...lvl.walls.filter(w => !w.ghost && !w.keyId && !w.closeOnAreaId),
                    ];

                    for (const fl of enSolids) {
                        if (!hit(en.x, en.y, en.w, en.h, fl.x, fl.y, fl.w, fl.h)) continue;
                        const enBottom = en.y;
                        const enTop = en.y + en.h;
                        const flTop = fl.y + fl.h;
                        const flBottom = fl.y;
                        const overlapY = Math.min(enTop - flBottom, flTop - enBottom);
                        const overlapX = Math.min((en.x + en.w) - fl.x, (fl.x + fl.w) - en.x);
                        if (overlapY < overlapX) {
                            if (en.vy <= 0 && enBottom < flTop && enTop > flTop - 2) {
                                en.y = flTop;
                                en.vy = 0;
                                en.onGround = true;
                            } else if (en.vy > 0) {
                                en.y = flBottom - en.h;
                                en.vy = -100;
                            }
                        } else {
                            en.x -= moveDir * spd;
                            if (en.onGround) {
                                en.vy = JUMP_V * 0.85;
                                en.onGround = false;
                            }
                        }
                    }

                    if (en.onGround && py + PH < en.y - 20) {
                        en.vy = JUMP_V * 0.85;
                        en.onGround = false;
                    }
                }
            } else if (!en.stuck) {
                if (!en.onGround) {
                    en.vy -= GRAV * dt;
                    if (en.vy < MAX_FALL) en.vy = MAX_FALL;
                }
                en.y += en.vy * dt;
                en.onGround = false;
                const enSolids = [
                    ...lvl.floors.filter(f => !f.ghost),
                    ...lvl.mpUp.filter(mp => !mp.ghost).map(mp => ({ x: mp.x, y: mp.cy, w: mp.w, h: mp.h })),
                    ...lvl.mpRight.filter(mp => !mp.ghost).map(mp => ({ x: mp.cx, y: mp.y, w: mp.w, h: mp.h })),
                ];
                for (const fl of enSolids) {
                    if (!hit(en.x, en.y, en.w, en.h, fl.x, fl.y, fl.w, fl.h)) continue;
                    const enBottom = en.y;
                    const enTop = en.y + en.h;
                    const flTop = fl.y + fl.h;
                    if (en.vy <= 0 && enBottom < flTop) {
                        en.y = flTop; en.vy = 0; en.onGround = true;
                    }
                }
            }

            if (en.min !== null && en.x < en.min) { en.x = en.min; }
            if (en.max !== null && en.x + en.w > en.max) { en.x = en.max - en.w; }
        }

        for (let i = 0; i < lvl.enemies.length; i++) {
            const a = lvl.enemies[i];
            if (a.ghost) continue;
            for (let j = i + 1; j < lvl.enemies.length; j++) {
                const b = lvl.enemies[j];
                if (b.ghost) continue;
                if (!hit(a.x, a.y, a.w, a.h, b.x, b.y, b.w, b.h)) continue;
                const overlapX = Math.min((a.x + a.w) - b.x, (b.x + b.w) - a.x);
                const overlapY = Math.min((a.y + a.h) - b.y, (b.y + b.h) - a.y);
                if (overlapX <= overlapY) {
                    const half = overlapX / 2;
                    const aLeft = (a.x + a.w / 2) < (b.x + b.w / 2);
                    if (aLeft) { a.x -= half; b.x += half; }
                    else { a.x += half; b.x -= half; }
                } else {
                    const half = overlapY / 2;
                    const aBelow = (a.y + a.h / 2) < (b.y + b.h / 2);
                    if (aBelow) { a.y -= half; b.y += half; }
                    else { a.y += half; b.y -= half; }
                }
                if (a.min !== null && a.x < a.min) a.x = a.min;
                if (a.max !== null && a.x + a.w > a.max) a.x = a.max - a.w;
                if (b.min !== null && b.x < b.min) b.x = b.min;
                if (b.max !== null && b.x + b.w > b.max) b.x = b.max - b.w;
            }
        }

        for (const orb of lvl.orbs) { if (orb.actTimer > 0) orb.actTimer -= dt; }

        for (const cp of lvl.checkpoints) {
            if (!cp.activated && hit(px, py, PW, PH, cp.x, cp.y, FLAG_W, FLAG_H)) {
                cp.activated = true;
                checkpointHistory.push({
                    x: cp.x,
                    y: cp.y,
                    coins: sessionCoins,
                    elapsed,
                    songSnapshot: currentSong,
                    collectedSnapshot: captureCollectedSnapshot(),
                    keySnapshot: captureKeySnapshot(),
                    doorSnapshot: captureDoorSnapshot(),
                    areaSnapshot: captureAreaSnapshot(),
                    lavaSnapshot: captureLavaSnapshot(),
                });
            }
        }

        for (const co of lvl.coins) {
            co.bobTimer += dt * 3;
            if (co.ghost || co.collected) continue;
            if (hitRotated(px, py, PW, PH, { x: co.x - co.r, y: co.y - co.r, w: co.r * 2, h: co.r * 2, rotation: co.rotation || 0 })) {
                co.collected = true;
                const coinVal = co.blue ? 10 : 1;
                sessionCoins += coinVal;
                sessionTotalCoins += coinVal;
                playSfx('coin');
                coinPopups.push({ x: wx(co.x), y: wy(co.y, co.r * 2), life: 0.8, maxLife: 0.8, value: coinVal, blue: co.blue });
            }
        }

        for (const k of lvl.keys) {
            k.bobTimer += dt * 2.5;
            if (k.ghost || k.collected) continue;
            if (k._swapLocked) {
                if (!hit(px, py, PW, PH, k.x - k.r, k.y - k.r, k.r * 2, k.r * 2)) {
                    k._swapLocked = false;
                }
                continue;
            }
            if (hit(px, py, PW, PH, k.x - k.r, k.y - k.r, k.r * 2, k.r * 2)) {
                k.collected = true;
                if (heldKey) {
                    const droppedKey = lvl.keys.find(kk => kk.keyId === heldKey.keyId);
                    if (droppedKey) {
                        droppedKey.collected = false;
                        droppedKey.x = px + PW / 2;
                        droppedKey.y = py;
                        droppedKey._swapLocked = true;
                    }
                }
                heldKey = { keyId: k.keyId, keyColor: k.keyColor };
                playSfx('coin');
            }
        }

        if (portalCooldownTimer <= 0) {
            for (const portal of lvl.portals) {
                if (!hit(px, py, PW, PH, portal.x, portal.y, portal.w, portal.h)) continue;
                const destPortal = lvl.portals.find(p => p.portalId === portal.toPortalId);
                if (!destPortal) continue;
                const enterSide = getEnterSide(portal);
                teleportThroughPortal(portal, destPortal, enterSide);
                break;
            }
        }

        px += vx * dt;
        px = Math.max(0, Math.min(px, lvl.worldWidth - PW));

        if (!noclip) for (const wl of lvl.walls) {
            if (wl.ghost) continue;
            let wx2, wy2, ww, wh;
            if (wl.keyId) {
                const dr = getDoorEffectiveRect(wl);
                if (dr.h <= 1) continue;
                wx2 = dr.x; wy2 = dr.y; ww = dr.w; wh = dr.h;
            } else if (wl.closeOnAreaId) {
                const dr = getAreaCloseRect(wl);
                if (dr.h <= 1) continue;
                wx2 = dr.x; wy2 = dr.y; ww = dr.w; wh = dr.h;
            } else {
                wx2 = wl.x; wy2 = wl.y; ww = wl.w; wh = wl.h;
            }
            if (hit(px, py, PW, PH, wx2, wy2, ww, wh)) {
                px = vx >= 0 ? wx2 - PW : wx2 + ww;
                vx = 0;
            }
        }

        for (const wl of lvl.walls) {
            if (wl.ghost) wl.playerOverlap = hit(px, py, PW, PH, wl.x, wl.y, wl.w, wl.h);
        }

        py += vy * dt;

        const solidWallEntries = lvl.walls
            .filter(w => !w.ghost &&
                !(w.keyId && w.doorSlide >= 1) &&
                !(w.closeOnAreaId && w.areaCloseSlide >= 1))
            .map(w => {
                if (w.keyId) {
                    const dr = getDoorEffectiveRect(w);
                    return { x: dr.x, y: dr.y, w: dr.w, h: dr.h, oneWay: false, type: 'wall', _wall: w, rotation: w.rotation || 0 };
                }
                if (w.closeOnAreaId) {
                    const dr = getAreaCloseRect(w);
                    return { x: dr.x, y: dr.y, w: dr.w, h: dr.h, oneWay: false, type: 'wall', _wall: w, rotation: w.rotation || 0 };
                }
                return { x: w.x, y: w.y, w: w.w, h: w.h, oneWay: false, type: 'wall', _wall: w, rotation: w.rotation || 0 };
            })
            .filter(e => e.h > 1);

        const solids = [
            ...lvl.floors.filter(f => !f.ghost),
            ...lvl.mpUp.filter(mp => !mp.ghost).map(mp => ({ x: mp.x, y: mp.cy, w: mp.w, h: mp.h, oneWay: mp.oneWay, type: 'mpUp', _mp: mp })),
            ...lvl.mpRight.filter(mp => !mp.ghost).map(mp => ({ x: mp.cx, y: mp.y, w: mp.w, h: mp.h, oneWay: mp.oneWay, type: 'mpRight', _mp: mp })),
            ...solidWallEntries,
        ];
        onGround = false;
        standingOn = null;

        for (const fl of solids) {
            if (!hit(px, py, PW, PH, fl.x, fl.y, fl.w, fl.h)) continue;
            const playerBottom = py;
            const playerTop = py + PH;
            const flTop = fl.y + fl.h;
            const flBottom = fl.y;
            const overlapY = Math.min(playerTop - flBottom, flTop - playerBottom);
            const overlapX = Math.min((px + PW) - fl.x, (fl.x + fl.w) - px);
            if (overlapY < overlapX) {
                if (vy <= 0 && playerBottom < flTop && playerTop > flTop - 0.5) {
                    py = flTop;
                    if (vy < -200 && !onGround) landAnim = 0.22;
                    vy = 0;
                    onGround = true;
                    standingOn = fl;
                } else if (!fl.oneWay && vy > 0 && playerTop > flBottom && playerBottom < flBottom) {
                    if (!noclip) { py = flBottom - PH; vy = -200; }
                }
            } else if (!fl.oneWay) {
                if (!noclip) { px = px + PW / 2 < fl.x + fl.w / 2 ? fl.x - PW : fl.x + fl.w; vx = 0; }
            }
        }
        for (const fl of solids) {
            if (!(fl.rotation || 0)) continue;
            const rotRad = fl.rotation * Math.PI / 180;
            const mtv = satMTV(px, py, PW, PH, fl.x, fl.y, fl.w, fl.h, rotRad);
            if (!mtv) continue;
            if (Math.abs(mtv.y) >= Math.abs(mtv.x)) {
                if (mtv.y > 0) {
                    py += mtv.y;
                    if (vy < -200 && !onGround) landAnim = 0.22;
                    vy = 0; onGround = true; standingOn = fl;
                } else if (!fl.oneWay) {
                    py += mtv.y; vy = -200;
                }
            } else if (!fl.oneWay) {
                px += mtv.x; vx = 0;
            }
        }
        if (!onGround) {
            for (const fl of solids) {
                const atFlTop = Math.abs(py - (fl.y + fl.h)) < 2;
                if (atFlTop && px + PW > fl.x && px < fl.x + fl.w) {
                    onGround = true;
                    standingOn = fl;
                    break;
                }
            }
        }

        if (py + PH > lvl.worldHeight) { py = lvl.worldHeight - PH; vy = 0; }
        if (py <= 0) { py = 0; if (vy < -200 && !onGround) landAnim = 0.22; vy = 0; onGround = true; standingOn = { type: 'world_floor' }; }

        const DOOR_TOUCH_MARGIN = 6;
        for (const wl of lvl.walls) {
            if (!wl.keyId || wl.doorOpen || wl.doorDir === 1) continue;
            const dr = getDoorEffectiveRect(wl);
            if (dr.h <= 1) continue;
            if (hit(
                px - DOOR_TOUCH_MARGIN, py - DOOR_TOUCH_MARGIN,
                PW + DOOR_TOUCH_MARGIN * 2, PH + DOOR_TOUCH_MARGIN * 2,
                dr.x, dr.y, dr.w, dr.h
            )) {
                if (!heldKey) {
                    showDoorMsg('Je hebt een sleutel nodig om deze deur te openen');
                } else if (heldKey.keyId !== wl.keyId) {
                    showDoorMsg('Dit is niet de juiste sleutel, zoek een andere sleutel');
                } else {
                    wl.doorDir = 1;
                    heldKey = null;
                    playSfx('coin');
                }
            }
        }

        let dead = false;
        if (!noclip) {
            for (const lv of lvl.lavas) {
                if (!lv.ghost && hitRotated(px, py, PW, PH, { x: lv.x, y: lv.y, w: lv.w, h: lv.flowUp ? lv.currentH : lv.h, rotation: lv.rotation || 0 })) { dead = true; break; }
            }
            if (!dead) for (const en of lvl.enemies) { if (!en.ghost && hitRotated(px, py, PW, PH, en)) { dead = true; break; } }
        }
        if (dead) {
            playSfx('die');
            createDeathSlices();
            phase = 'dying';
            deathTimer = DEATH_DUR;
        }

        for (const en of lvl.ends) {
            if (hit(px, py, PW, PH, en.x, en.y, en.w, en.h)) {
                const isLastLevel = lvlIdx >= levels.length - 1;
                if (isLastLevel) {
                    winGame();
                } else {
                    completedLevel();
                }
                break;
            }
        }

        if (jumpAnim > 0) jumpAnim -= dt;
        if (landAnim > 0) landAnim -= dt;

        updateCam();
    }

    const COL = {
        floor: '#9b9b9c', wall: '#9b9b9c', lava: '#fc9312',
        tramp: '#1264fc', enemy: '#fc1212',
        orbRing: '#eaecd1', orbCore: '#fce512',
        coin: '#ffd700', coinShine: '#fff8a0', coinShadow: '#b8860b',
        portalInner: 'rgba(120,60,255,0.35)',
        portalRim: '#a855f7',
        portalGlow: 'rgba(168,85,247,0.55)',
    };

    const FLAG_W = 14, FLAG_H = 80;

    function isVisible(x, y, w, h) {
        const cx = wx(x), cy = wy(y, h);
        return cx + w > 0 && cx < canvas.width && cy + h > 0 && cy < canvas.height;
    }

    function getAnimFrame(obj) {
        if (!obj.textureFrames || obj.textureFrames <= 1) return -1;
        return Math.floor((performance.now() / 1000 * (obj.textureFps || 8)) % obj.textureFrames) | 0;
    }

    function _texDraw(obj, lx, ly, w, h, fallbackCol, r, inRotCtx) {
        const frame = getAnimFrame(obj);
        if (frame >= 0 && obj.tex) {
            const img = obj.tex.img;
            const frameH = img.naturalHeight / obj.textureFrames;
            if (obj._animBakedFrames) {
                const drawX = inRotCtx ? -w / 2 : lx;
                const drawY = inRotCtx ? -h / 2 : ly;
                if (r > 0) { ctx.save(); ctx.beginPath(); ctx.roundRect(drawX, drawY, w, h, r); ctx.clip(); ctx.drawImage(obj._animBakedFrames[frame], drawX, drawY); ctx.restore(); }
                else ctx.drawImage(obj._animBakedFrames[frame], drawX, drawY);
                return;
            }
            ctx.save();
            ctx.beginPath(); if (r > 0) ctx.roundRect(lx, ly, w, h, r); else ctx.rect(lx, ly, w, h); ctx.clip();
            if (obj.textureMode === 'cover') {
                const scale = Math.max(w / img.naturalWidth, h / frameH);
                const dw = img.naturalWidth * scale, dh = frameH * scale;
                ctx.drawImage(img, 0, frame * frameH, img.naturalWidth, frameH, lx + (w - dw) / 2, ly + (h - dh) / 2, dw, dh);
            } else {
                ctx.drawImage(img, 0, frame * frameH, img.naturalWidth, frameH, lx, ly, w, h);
            }
            ctx.restore();
            return;
        }
        if (obj.bakedCanvas) {
            if (r > 0) { ctx.save(); ctx.beginPath(); ctx.roundRect(lx, ly, w, h, r); ctx.clip(); ctx.drawImage(obj.bakedCanvas, lx, ly); ctx.restore(); }
            else ctx.drawImage(obj.bakedCanvas, lx, ly);
            return;
        }
        if (obj.tex) {
            if (obj.textureMode === 'stretch') {
                if (r > 0) { ctx.save(); ctx.beginPath(); ctx.roundRect(lx, ly, w, h, r); ctx.clip(); }
                ctx.drawImage(obj.tex.img, lx, ly, w, h);
                if (r > 0) ctx.restore();
            } else if (obj.textureMode === 'cover') {
                const imgW = obj.tex.img.naturalWidth, imgH = obj.tex.img.naturalHeight;
                const scale = Math.max(w / imgW, h / imgH);
                const dw = imgW * scale, dh = imgH * scale;
                ctx.save(); ctx.beginPath();
                if (r > 0) ctx.roundRect(lx, ly, w, h, r); else ctx.rect(lx, ly, w, h);
                ctx.clip(); ctx.drawImage(obj.tex.img, lx + (w - dw) / 2, ly + (h - dh) / 2, dw, dh); ctx.restore();
            } else if (inRotCtx) {
                ctx.save(); ctx.beginPath();
                if (r > 0) ctx.roundRect(lx, ly, w, h, r); else ctx.rect(lx, ly, w, h); ctx.clip();
                const iw = obj.tex.img.naturalWidth, ih = obj.tex.img.naturalHeight;
                for (let ty = 0; ty < h; ty += ih) for (let tx = 0; tx < w; tx += iw) ctx.drawImage(obj.tex.img, lx + tx, ly + ty);
                ctx.restore();
            } else {
                const m = new DOMMatrix(); m.translateSelf(lx, ly);
                obj.tex.pat.setTransform(m); ctx.fillStyle = obj.tex.pat;
                if (r > 0) { ctx.beginPath(); ctx.roundRect(lx, ly, w, h, r); ctx.fill(); }
                else ctx.fillRect(lx, ly, w, h);
            }
        } else {
            ctx.fillStyle = fallbackCol;
            if (r > 0) { ctx.beginPath(); ctx.roundRect(lx, ly, w, h, r); ctx.fill(); }
            else ctx.fillRect(lx, ly, w, h);
        }
    }

    function texFillRect(obj, x, y, w, h, fallbackCol, r = 0) {
        const rot = (obj.rotation || 0) * Math.PI / 180;
        const sx = obj.invertX ? -1 : 1;
        const sy = obj.invertY ? -1 : 1;
        const cx = wx(x), cy = wy(y, h);
        if (rot !== 0 || obj.invertX || obj.invertY) {
            ctx.save();
            ctx.translate(cx + w / 2, cy + h / 2);
            if (rot !== 0) ctx.rotate(rot);
            ctx.scale(sx, sy);
            _texDraw(obj, -w / 2, -h / 2, w, h, fallbackCol, r, true);
            ctx.restore();
            return;
        }
        _texDraw(obj, cx, cy, w, h, fallbackCol, r, false);
    }

    function ghostFillRect(obj, x, y, w, h, fallbackCol, r = 0) {
        if (!obj.ghost) { texFillRect(obj, x, y, w, h, fallbackCol, r); return; }
        const cxPos = wx(x), cyPos = wy(y, h);
        if (obj.texGhost) {
            texFillRect(obj, x, y, w, h, fallbackCol, r);
            if (obj.playerOverlap) {
                ctx.save();
                if (r > 0) { ctx.beginPath(); ctx.roundRect(cxPos, cyPos, w, h, r); ctx.clip(); }
                else { ctx.beginPath(); ctx.rect(cxPos, cyPos, w, h); ctx.clip(); }
                const m = new DOMMatrix();
                m.translateSelf(cxPos, cyPos);
                obj.texGhost.pat.setTransform(m);
                ctx.fillStyle = obj.texGhost.pat;
                ctx.globalAlpha = 1;
                if (r > 0) { ctx.beginPath(); ctx.roundRect(cxPos, cyPos, w, h, r); ctx.fill(); }
                else { ctx.fillRect(cxPos, cyPos, w, h); }
                ctx.restore();
            }
            return;
        }
        if (obj.playerOverlap && obj.opaque) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            texFillRect(obj, x, y, w, h, fallbackCol, r);
            ctx.restore();
            return;
        }
        ctx.save();
        if (!obj.tex) ctx.globalAlpha = 0.25;
        texFillRect(obj, x, y, w, h, fallbackCol, r);
        if (!obj.tex) {
            ctx.globalAlpha = 0.55;
            ctx.strokeStyle = fallbackCol;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            if (r > 0) { ctx.beginPath(); ctx.roundRect(cxPos, cyPos, w, h, r); ctx.stroke(); }
            else { ctx.strokeRect(cxPos, cyPos, w, h); }
        }
        ctx.restore();
    }

    function drawKeyDoor(wl) {
        if (wl.doorSlide >= 1) return;

        const dr = getDoorEffectiveRect(wl);
        if (dr.h <= 0) return;

        const rot = (wl.rotation || 0) * Math.PI / 180;
        const cx = wx(dr.x);
        const cy = wy(dr.y, dr.h);
        const w = dr.w;
        const h = dr.h;
        const kc = wl.keyColor || '#ffd700';

        ctx.save();

        if (rot !== 0) {
            ctx.translate(cx + w / 2, cy + h / 2);
            ctx.rotate(rot);
            ctx.translate(-w / 2, -h / 2);
        }

        const sx = wl.invertX ? -1 : 1;
        const sy = wl.invertY ? -1 : 1;
        if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);

        const lx = rot !== 0 ? 0 : cx;
        const ly = rot !== 0 ? 0 : cy;

        if (wl.tex) {
            if (wl.textureMode === 'stretch') {
                ctx.drawImage(wl.tex.img, lx, ly, w, h);
            } else if (wl.textureMode === 'cover') {
                const imgW = wl.tex.img.naturalWidth, imgH = wl.tex.img.naturalHeight;
                const scale = Math.max(w / imgW, h / imgH);
                const dw = imgW * scale, dh = imgH * scale;
                ctx.save();
                ctx.beginPath(); ctx.rect(lx, ly, w, h); ctx.clip();
                ctx.drawImage(wl.tex.img, lx + (w - dw) / 2, ly + (h - dh) / 2, dw, dh);
                ctx.restore();
            } else {
                if (wl.bakedCanvas) {
                    ctx.save();
                    ctx.beginPath(); ctx.rect(lx, ly, w, h); ctx.clip();
                    ctx.drawImage(wl.bakedCanvas, lx, ly);
                    ctx.restore();
                } else {
                    const m = new DOMMatrix();
                    m.translateSelf(lx, ly);
                    wl.tex.pat.setTransform(m);
                    ctx.fillStyle = wl.tex.pat;
                    ctx.fillRect(lx, ly, w, h);
                }
            }
        } else {
            ctx.fillStyle = blendDoorColor(kc);
            ctx.beginPath();
            ctx.roundRect(lx, ly, w, h, 4);
            ctx.fill();

            ctx.strokeStyle = 'rgba(0,0,0,0.18)';
            ctx.lineWidth = 2;
            const panelInset = Math.min(8, w * 0.12, h * 0.08);
            if (w > 20 && h > 20) {
                ctx.strokeRect(lx + panelInset, ly + panelInset, w - panelInset * 2, h - panelInset * 2);
            }

            ctx.strokeStyle = kc;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = kc;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(lx, ly, w, h, 4);
            ctx.stroke();
        }

        if (wl.keyholeVisible && h > 20) {
            const khCx = lx + w / 2;
            const khCy = ly + h * 0.42;
            const khR = Math.min(Math.max(w * 0.22, 10), Math.max(h * 0.18, 10), 28);
            const slotW = khR * 0.85;
            const slotH = khR * 1.4;

            ctx.save();
            ctx.shadowColor = kc;
            ctx.shadowBlur = 16;

            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.beginPath();
            ctx.arc(khCx, khCy, khR, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = kc;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(khCx, khCy, khR, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.beginPath();
            ctx.moveTo(khCx - slotW / 2, khCy + khR * 0.1);
            ctx.lineTo(khCx + slotW / 2, khCy + khR * 0.1);
            ctx.lineTo(khCx + slotW * 0.3, khCy + khR * 0.1 + slotH);
            ctx.lineTo(khCx - slotW * 0.3, khCy + khR * 0.1 + slotH);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = kc;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(khCx - slotW / 2, khCy + khR * 0.1);
            ctx.lineTo(khCx + slotW / 2, khCy + khR * 0.1);
            ctx.lineTo(khCx + slotW * 0.3, khCy + khR * 0.1 + slotH);
            ctx.lineTo(khCx - slotW * 0.3, khCy + khR * 0.1 + slotH);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
        }

        ctx.restore();
    }

    function drawAreaCloseWall(wl) {
        if (wl.areaCloseSlide >= 1) return;
        const dr = getAreaCloseRect(wl);
        if (dr.h <= 0) return;

        const rot = (wl.rotation || 0) * Math.PI / 180;
        const cxPos = wx(dr.x);
        const cyPos = wy(dr.y, dr.h);
        const w = dr.w;
        const h = dr.h;

        ctx.save();

        if (rot !== 0) {
            ctx.translate(cxPos + w / 2, cyPos + h / 2);
            ctx.rotate(rot);
            ctx.translate(-w / 2, -h / 2);
        }

        const sx = wl.invertX ? -1 : 1;
        const sy = wl.invertY ? -1 : 1;
        if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);

        const lx = rot !== 0 ? 0 : cxPos;
        const ly = rot !== 0 ? 0 : cyPos;

        if (wl.tex) {
            if (wl.textureMode === 'stretch') {
                ctx.drawImage(wl.tex.img, lx, ly, w, h);
            } else if (wl.textureMode === 'cover') {
                const imgW = wl.tex.img.naturalWidth, imgH = wl.tex.img.naturalHeight;
                const scale = Math.max(w / imgW, h / imgH);
                const dw = imgW * scale, dh = imgH * scale;
                ctx.save();
                ctx.beginPath(); ctx.rect(lx, ly, w, h); ctx.clip();
                ctx.drawImage(wl.tex.img, lx + (w - dw) / 2, ly + (h - dh) / 2, dw, dh);
                ctx.restore();
            } else if (wl.bakedCanvas) {
                ctx.save();
                ctx.beginPath(); ctx.rect(lx, ly, w, h); ctx.clip();
                ctx.drawImage(wl.bakedCanvas, lx, ly);
                ctx.restore();
            } else {
                const m = new DOMMatrix();
                m.translateSelf(lx, ly);
                wl.tex.pat.setTransform(m);
                ctx.fillStyle = wl.tex.pat;
                ctx.fillRect(lx, ly, w, h);
            }
        } else {
            ctx.fillStyle = COL.wall;
            ctx.fillRect(lx, ly, w, h);
        }

        ctx.restore();
    }

    function blendDoorColor(hexColor) {
        try {
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            return `rgb(${Math.round(r * 0.22 + 60)},${Math.round(g * 0.22 + 60)},${Math.round(b * 0.22 + 60)})`;
        } catch (e) { return '#555'; }
    }

    function drawBg() {
        if (lvl) {
            ctx.drawImage(bakeBg(lvl), 0, 0);
        } else {
            const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
            g.addColorStop(0, '#0f0f23');
            g.addColorStop(1, '#1a1a2e');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (debugVisible) {
            ctx.strokeStyle = 'rgba(155,155,156,0.06)';
            ctx.lineWidth = 1;
            const gs = 80, ox = camX % gs, oy = camY % gs;
            for (let x = -ox; x < canvas.width; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
            for (let y = -oy; y < canvas.height; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
        }
    }

    function drawPortal(portal) {
        const rot = (portal.rotation || 0) * Math.PI / 180;
        const cx = wx(portal.x);
        const cy = wy(portal.y, portal.h);
        const w = portal.w;
        const h = portal.h;

        ctx.save();

        ctx.translate(cx + w / 2, cy + h / 2);
        if (rot !== 0) ctx.rotate(rot);
        const sx = portal.invertX ? -1 : 1;
        const sy = portal.invertY ? -1 : 1;
        if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);
        const lx = -w / 2;
        const ly = -h / 2;

        if (portal.tex) {
            if (portal.bakedCanvas) {
                ctx.save();
                ctx.beginPath(); ctx.rect(lx, ly, w, h); ctx.clip();
                ctx.drawImage(portal.bakedCanvas, lx, ly);
                ctx.restore();
            } else if (portal.textureMode === 'stretch') {
                ctx.drawImage(portal.tex.img, lx, ly, w, h);
            } else if (portal.textureMode === 'cover') {
                const imgW = portal.tex.img.naturalWidth, imgH = portal.tex.img.naturalHeight;
                const scale = Math.max(w / imgW, h / imgH);
                const dw = imgW * scale, dh = imgH * scale;
                ctx.save();
                ctx.beginPath(); ctx.rect(lx, ly, w, h); ctx.clip();
                ctx.drawImage(portal.tex.img, lx + (w - dw) / 2, ly + (h - dh) / 2, dw, dh);
                ctx.restore();
            } else {
                const m = new DOMMatrix();
                m.translateSelf(lx, ly);
                portal.tex.pat.setTransform(m);
                ctx.fillStyle = portal.tex.pat;
                ctx.fillRect(lx, ly, w, h);
            }
            ctx.restore();
            return;
        }

        const t = performance.now() / 1000;
        const pulse = 0.7 + 0.3 * Math.sin(t * 3 + (portal.portalId || 0) * 1.7);

        ctx.shadowColor = COL.portalGlow;
        ctx.shadowBlur = 18 * pulse;

        ctx.strokeStyle = COL.portalRim;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(lx, ly, w, h, 6);
        ctx.stroke();

        ctx.shadowBlur = 0;

        const numBands = 6;
        for (let i = 0; i < numBands; i++) {
            const frac = (i / numBands + t * 0.4) % 1;
            const alpha = (1 - frac) * 0.18 * pulse;
            const inset = frac * Math.min(w, h) * 0.38;
            ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(lx + inset, ly + inset, Math.max(2, w - inset * 2), Math.max(2, h - inset * 2), Math.max(1, 6 - inset * 0.1));
            ctx.stroke();
        }

        ctx.fillStyle = COL.portalInner;
        ctx.beginPath();
        ctx.roundRect(lx, ly, w, h, 6);
        ctx.fill();

        ctx.restore();
    }

    function drawEnd(en) {}

    function drawCheckpoint(cp) {
        const fx = wx(cp.x), fy = wy(cp.y, FLAG_H);
        const poleCol = cp.activated ? '#4caf50' : '#888';
        const flagCol = cp.activated ? '#2e7d32' : '#555';
        ctx.save();
        if (cp.activated) { ctx.shadowColor = 'rgba(76,175,80,0.5)'; ctx.shadowBlur = 14; }
        ctx.fillStyle = poleCol;
        ctx.fillRect(fx, fy, 4, FLAG_H);
        ctx.fillStyle = flagCol;
        ctx.beginPath();
        ctx.moveTo(fx + 4, fy);
        ctx.lineTo(fx + 30, fy + 13);
        ctx.lineTo(fx + 4, fy + 26);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.arc(fx + 2, fy, 5, 0, Math.PI * 2);
        ctx.fillStyle = poleCol;
        ctx.fill();
        ctx.restore();
    }

    function drawText(t) {
        if (!t.segments || t.segments.length === 0) return;
        ctx.save();
        if (t.ghost) ctx.globalAlpha = 0.3;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.shadowBlur = 0;
        const sizeMatch = t.baseFont.match(/(\d+)px/);
        const basePx = sizeMatch ? parseInt(sizeMatch[1]) : 20;
        const fontRest = t.baseFont.replace(/(?:bold\s*)?\d+px/, '').trim();
        function segFont(bold) {
            return (bold ? 'bold ' : '') + basePx + 'px ' + fontRest;
        }
        let totalW = 0;
        for (const seg of t.segments) {
            ctx.font = segFont(seg.bold);
            totalW += ctx.measureText(seg.text).width;
        }
        const drawX = wx(t.x) - totalW / 2;
        const drawY = wy(t.y, 0);
        let curX = drawX;
        for (const seg of t.segments) {
            ctx.font = segFont(seg.bold);
            ctx.fillStyle = seg.color;
            ctx.fillText(seg.text, curX, drawY);
            curX += ctx.measureText(seg.text).width;
        }
        ctx.restore();
    }

    function drawCoin(co) {
        if (co.collected) return;
        const bob = Math.sin(co.bobTimer) * 4;
        const cx = wx(co.x);
        const cy = wy(co.y - co.r, co.r * 2) + co.r + bob;
        ctx.save();
        if (co.ghost) ctx.globalAlpha = 0.3;
        if (co.blue) {
            ctx.shadowColor = 'rgba(80, 160, 255, 0.9)';
            ctx.shadowBlur = 18;
        } else {
            ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
            ctx.shadowBlur = 10;
        }
        const innerCol = co.blue ? '#a0d4ff' : COL.coinShine;
        const midCol = co.blue ? '#5b9cf6' : COL.coin;
        const outerCol = co.blue ? '#1a4d99' : COL.coinShadow;
        const g = ctx.createRadialGradient(cx - co.r * 0.3, cy - co.r * 0.3, 0, cx, cy, co.r);
        g.addColorStop(0, innerCol);
        g.addColorStop(0.4, midCol);
        g.addColorStop(1, outerCol);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, co.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = outerCol;
        ctx.lineWidth = 1.5;
        if (co.ghost) ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(cx, cy, co.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = outerCol;
        ctx.font = `bold ${Math.round(co.r * (co.blue ? 0.72 : 1.1))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(co.blue ? '$10' : '$', cx, cy + 1);
        ctx.restore();
    }

    function drawKey(k) {
        if (k.collected) return;
        const bob = Math.sin(k.bobTimer) * 3;
        const kc = k.keyColor || '#ffd700';
        const cx = wx(k.x);
        const cy = wy(k.y, k.r * 2) + k.r + bob;
        const r = k.r;

        ctx.save();
        if (k.ghost) ctx.globalAlpha = 0.3;
        ctx.shadowColor = kc;
        ctx.shadowBlur = 14;

        const headR = r * 0.58;
        ctx.fillStyle = kc;
        ctx.beginPath();
        ctx.arc(cx - r * 0.18, cy - r * 0.1, headR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = blendDoorColor(kc);
        ctx.beginPath();
        ctx.arc(cx - r * 0.18, cy - r * 0.1, headR * 0.45, 0, Math.PI * 2);
        ctx.fill();

        const shaftX = cx - r * 0.18 + headR * 0.85;
        const shaftY = cy - r * 0.1;
        const shaftL = r * 1.1;
        const shaftH = r * 0.28;
        ctx.fillStyle = kc;
        ctx.fillRect(shaftX, shaftY - shaftH / 2, shaftL, shaftH);

        const toothW = shaftH * 0.7;
        const toothH = shaftH * 0.8;
        const t1X = shaftX + shaftL * 0.45;
        const t2X = shaftX + shaftL * 0.7;
        ctx.fillRect(t1X, shaftY + shaftH / 2, toothW, toothH);
        ctx.fillRect(t2X, shaftY + shaftH / 2, toothW, toothH);

        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1.2;
        if (k.ghost) ctx.setLineDash([3, 2]);

        ctx.beginPath();
        ctx.arc(cx - r * 0.18, cy - r * 0.1, headR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    function drawHeldKey() {
        if (!heldKey) return;
        const kc = heldKey.keyColor || '#ffd700';
        const kx = wx(px + PW / 2);
        const ky = wy(py + PH, 0) - 12;
        const r = 9;

        ctx.save();
        ctx.shadowColor = kc;
        ctx.shadowBlur = 10;

        const headR = r * 0.56;
        ctx.fillStyle = kc;
        ctx.beginPath();
        ctx.arc(kx - r * 0.18, ky, headR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.arc(kx - r * 0.18, ky, headR * 0.45, 0, Math.PI * 2);
        ctx.fill();

        const shaftX = kx - r * 0.18 + headR * 0.85;
        const shaftH = r * 0.28;
        ctx.fillStyle = kc;
        ctx.fillRect(shaftX, ky - shaftH / 2, r * 1.05, shaftH);

        const tw = shaftH * 0.7, th = shaftH * 0.8;
        ctx.fillRect(shaftX + r * 0.42, ky + shaftH / 2, tw, th);
        ctx.fillRect(shaftX + r * 0.67, ky + shaftH / 2, tw, th);

        ctx.restore();
    }

    function drawDoorMessage() {
        if (!doorMsg || doorMsg.timer <= 0) return;
        const alpha = Math.min(1, doorMsg.timer / 0.4) * Math.min(1, doorMsg.timer);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.font = 'bold 17px sans-serif';
        const textW = ctx.measureText(doorMsg.text).width;
        const pad = 16;
        const boxW = textW + pad * 2;
        const boxH = 44;
        const bx = canvas.width / 2 - boxW / 2;
        const by = canvas.height * 0.62;

        ctx.fillStyle = 'rgba(20,5,5,0.82)';
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 10);
        ctx.fill();

        ctx.strokeStyle = '#fc4040';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 10);
        ctx.stroke();

        ctx.fillStyle = '#ffdddd';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(doorMsg.text, canvas.width / 2, by + boxH / 2);
        ctx.restore();
    }

    function drawCoinPopups() {
        for (const popup of coinPopups) {
            ctx.save();
            ctx.globalAlpha = popup.life / popup.maxLife;
            ctx.fillStyle = popup.blue ? '#5b9cf6' : COL.coin;
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`+${popup.value || 1}`, popup.x, popup.y);
            ctx.restore();
        }
    }

    function drawDescription() {
        if (descTimer <= 0 || !lvl || !lvl.description) return;
        const alpha = Math.min(1, descTimer / 0.5) * Math.min(1, descTimer / 1.0);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        const padding = 18;
        ctx.font = '18px sans-serif';
        const textW = ctx.measureText(lvl.description).width;
        const boxW = textW + padding * 2;
        const boxH = 48;
        const bx = canvas.width / 2 - boxW / 2;
        const by = canvas.height * 0.72;
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 10);
        ctx.fill();
        ctx.fillStyle = '#e0e0e0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lvl.description, canvas.width / 2, by + boxH / 2);
        ctx.restore();
    }

    function drawDebug(dt) {
        if (!debugVisible || !lvl) return;

        fpsAccum += dt;
        fpsFrames += 1;
        if (fpsAccum >= 0.25) {
            fps = Math.round(fpsFrames / fpsAccum);
            fpsAccum = 0;
            fpsFrames = 0;
        }

        ctx.save();
        ctx.lineWidth = 1.5;

        ctx.strokeStyle = 'rgba(0,255,0,0.9)';
        ctx.strokeRect(wx(px), wy(py, PH), PW, PH);

        ctx.strokeStyle = 'rgba(0,255,0,0.9)';
        ctx.strokeRect(wx(px), wy(py, PH), PW, PH);
 
        const PLAYER_INNER_SIZE = 12;
        const innerX = wx(px) + (PW - PLAYER_INNER_SIZE) / 2;
        const innerY = wy(py, PH) + (PH - PLAYER_INNER_SIZE) / 2;
        ctx.strokeStyle = 'rgba(255,255,0,0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(innerX, innerY, PLAYER_INNER_SIZE, PLAYER_INNER_SIZE);

        ctx.strokeStyle = 'rgba(80,160,255,0.55)';
        for (const f of lvl.floors) { if (!f.ghost) ctx.strokeRect(wx(f.x), wy(f.y, f.h), f.w, f.h); }

        ctx.strokeStyle = 'rgba(80,160,255,0.55)';
        for (const w of lvl.walls) { if (!w.ghost) ctx.strokeRect(wx(w.x), wy(w.y, w.h), w.w, w.h); }

        ctx.strokeStyle = 'rgba(100,200,255,0.7)';
        for (const mp of lvl.mpUp) ctx.strokeRect(wx(mp.x), wy(mp.cy, mp.h), mp.w, mp.h);
        for (const mp of lvl.mpRight) ctx.strokeRect(wx(mp.cx), wy(mp.y, mp.h), mp.w, mp.h);

        ctx.strokeStyle = 'rgba(80,160,255,0.7)';
        for (const tr of lvl.trampolines) { if (!tr.ghost) ctx.strokeRect(wx(tr.x), wy(tr.y, tr.h), tr.w, tr.h); }

        ctx.strokeStyle = 'rgba(80,160,255,0.9)';
        for (const orb of lvl.orbs) {
            if (!orb.ghost) {
                const s = orb.r * 2;
                ctx.strokeRect(wx(orb.x - orb.r), wy(orb.y, s), s, s);
            }
        }

        ctx.strokeStyle = 'rgba(80,160,255,0.9)';
        for (const co of lvl.coins) {
            if (!co.ghost && !co.collected) {
                const s = co.r * 2;
                ctx.strokeRect(wx(co.x - co.r), wy(co.y - co.r, s), s, s);
            }
        }

        ctx.strokeStyle = 'rgba(255,215,0,0.9)';
        for (const k of lvl.keys) {
            if (!k.collected) {
                const s = k.r * 2;
                ctx.strokeRect(wx(k.x - k.r), wy(k.y - k.r, s), s, s);
            }
        }

        ctx.strokeStyle = 'rgba(80,160,255,0.7)';
        for (const cp of lvl.checkpoints) {
            ctx.strokeRect(wx(cp.x), wy(cp.y, FLAG_H), FLAG_W, FLAG_H);
        }

        ctx.strokeStyle = 'rgba(252,229,18,0.9)';
        for (const en of lvl.ends) {
            ctx.strokeRect(wx(en.x), wy(en.y, en.h), en.w, en.h);
        }

        ctx.strokeStyle = 'rgba(255,80,80,0.8)';
        for (const lv of lvl.lavas) { if (!lv.ghost) ctx.strokeRect(wx(lv.x), wy(lv.y, lv.flowUp ? lv.currentH : lv.h), lv.w, lv.flowUp ? lv.currentH : lv.h); }

        ctx.strokeStyle = 'rgba(255,50,50,0.9)';
        for (const en of lvl.enemies) {
            if (!en.ghost) {
                ctx.strokeRect(wx(en.x), wy(en.y, en.h), en.w, en.h);
                const ecx = wx(en.x + en.w / 2);
                const ecy = wy(en.y + en.h / 2, 0);
                ctx.strokeStyle = en.detected ? 'rgba(255,220,0,0.9)' : 'rgba(255,220,0,0.35)';
                ctx.beginPath();
                ctx.arc(ecx, ecy, en.detectionR, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeStyle = 'rgba(255,50,50,0.9)';
            }
        }

        ctx.strokeStyle = 'rgba(200,100,255,0.9)';
        for (const pt of lvl.portals) ctx.strokeRect(wx(pt.x), wy(pt.y, pt.h), pt.w, pt.h);

        ctx.strokeStyle = 'rgba(0,255,180,0.7)';
        ctx.setLineDash([6, 4]);
        for (const area of lvl.areas) {
            ctx.strokeRect(wx(area.x), wy(area.y, area.h), area.w, area.h);
            ctx.fillStyle = area.triggered ? 'rgba(0,255,180,0.08)' : 'rgba(0,255,180,0.03)';
            ctx.fillRect(wx(area.x), wy(area.y, area.h), area.w, area.h);
            ctx.fillStyle = area.triggered ? 'rgba(0,255,180,0.9)' : 'rgba(0,255,180,0.5)';
            ctx.font = '11px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`area:${area.areaId}`, wx(area.x) + 3, wy(area.y, area.h) + 3);
        }
        ctx.setLineDash([]);

        ctx.restore();

        const lines = [
            `[H] debug  FPS: ${fps}`,
            `pos  x:${px.toFixed(1)}  y:${py.toFixed(1)}`,
            `vel  vx:${vx.toFixed(1)}  vy:${vy.toFixed(1)}`,
            `cam  cx:${camX.toFixed(1)}  cy:${camY.toFixed(1)}`,
            `onGround: ${onGround}`,
            `jumping: ${jumpAnim > 0}   jumpQ: ${jumpQ}`,
            `space: ${!!(KEY['Space'])}  up: ${!!(KEY['ArrowUp'])}  w: ${!!(KEY['KeyW'])}`,
            `left: ${!!(KEY['ArrowLeft'] || KEY['KeyA'])}  right: ${!!(KEY['ArrowRight'] || KEY['KeyD'])}`,
            standingOn
                ? `standing on: ${standingOn.type}` + (standingOn.type !== 'world_floor' ? `  @ x:${(standingOn.x || 0).toFixed(0)} y:${(standingOn.y || 0).toFixed(0)}` : '')
                : 'standing on: (air)',
            `level: ${lvlIdx}  phase: ${phase}`,
            `elapsed: ${elapsed.toFixed(2)}s`,
            `portalCooldown: ${portalCooldownTimer.toFixed(2)}s`,
            `checkpoints: ${checkpointHistory.length}`,
            `[Q/E] chp: ${debugCpIdx < 0 ? 'spawn' : debugCpIdx} / ${lvl.checkpoints.length - 1}`,
            `heldKey: ${heldKey ? heldKey.keyId + ' (' + heldKey.keyColor + ')' : 'none'}`,
            `areas: ${lvl.areas.map(a => a.areaId + (a.triggered ? '✓' : '○')).join(', ') || 'none'}`,
            noclip ? '[N] NOCLIP ON' : '[N] noclip off',
        ];

        const lh = 18, pad = 10;
        const panelW = 300, panelH = lines.length * lh + pad * 2;
        const bx = 8, by = 52;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.62)';
        ctx.beginPath();
        ctx.roundRect(bx, by, panelW, panelH, 8);
        ctx.fill();
        ctx.font = '13px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        lines.forEach((line, i) => {
            ctx.fillStyle = i === 0 ? '#fce512' : '#d0ffd0';
            ctx.fillText(line, bx + pad, by + pad + i * lh);
        });
        ctx.restore();
    }

    const PLAYER_PATH = new Path2D(
        'M44.6819 17.3781H43.3148C41.7353 17.3781 40.4606 16.1316 40.4606 14.5871V11.9045' +
        'C40.4606 10.36 39.1859 9.11355 37.6064 9.11355H32.6184C31.0389 9.11355 29.7642 7.8671 ' +
        '29.7642 6.32258V2.79097C29.7642 1.24645 28.4895 0 26.91 0H22.153C20.5734 0 19.2987 ' +
        '1.24645 19.2987 2.79097V6.32258C19.2987 7.8671 18.024 9.11355 16.4445 9.11355H11.4566' +
        'C9.87706 9.11355 8.60236 10.36 8.60236 11.9045V14.5871C8.60236 16.1316 7.32766 17.3781 ' +
        '5.74814 17.3781H4.38107C2.80155 17.3781 1.52686 18.6245 1.52686 20.169V28.5058C1.52686 ' +
        '30.0503 2.80155 31.2968 4.38107 31.2968H5.72967C7.30918 31.2968 8.58388 32.5432 ' +
        '8.58388 34.0877V37.1768C8.58388 38.7213 9.85858 39.9677 11.4381 39.9677C13.0176 39.9677 ' +
        '14.2923 41.2142 14.2923 42.7587V46.209C14.2923 47.7535 15.567 49 17.1465 49H20.2132' +
        'C21.7927 49 23.0674 47.7535 23.0674 46.209V41.4039C23.0674 40.609 23.7232 39.9768 ' +
        '24.5269 39.9768C25.3305 39.9768 25.9863 40.6181 25.9863 41.4039V46.209C25.9863 47.7535 ' +
        '27.261 49 28.8405 49H31.9072C33.4867 49 34.7614 47.7535 34.7614 46.209V42.7587' +
        'C34.7614 41.2142 36.0361 39.9677 37.6156 39.9677C39.1951 39.9677 40.4698 38.7213 ' +
        '40.4698 37.1768V34.0877C40.4698 32.5432 41.7445 31.2968 43.324 31.2968H44.6726' +
        'C46.2522 31.2968 47.5269 30.0503 47.5269 28.5058V20.169C47.5269 18.6245 46.2522 ' +
        '17.3781 44.6726 17.3781H44.6819Z' +
        'M37.902 26.4465C37.006 29.3368 35.0108 31.7123 32.2859 33.1394C30.5863 34.0245 ' +
        '28.7297 34.4761 26.8453 34.4761C25.7184 34.4761 24.5823 34.3135 23.4738 33.9794' +
        'C22.7995 33.7806 22.4208 33.0852 22.624 32.4348C22.8273 31.7755 23.5385 31.4052 ' +
        '24.2128 31.6039C26.522 32.2903 28.9606 32.0555 31.0943 30.9445C33.2188 29.8335 ' +
        '34.7799 27.9819 35.4819 25.7239C35.6851 25.0645 36.3963 24.7032 37.0706 24.8929' +
        'C37.7449 25.0916 38.1236 25.7871 37.9204 26.4465H37.902Z'
    );

    function drawPlayer() {
        const cx = wx(px) + PW / 2;
        const cy = wy(py, PH) + PH / 2;
        ctx.save();
        ctx.translate(cx, cy);
        let sx = 1, sy = 1;
        if (jumpAnim > 0) {
            const t = jumpAnim / 0.3;
            sx = 1 - 0.28 * Math.sin(t * Math.PI);
            sy = 1 + 0.28 * Math.sin(t * Math.PI);
        } else if (landAnim > 0) {
            const t = landAnim / 0.22;
            sx = 1 + 0.22 * Math.sin(t * Math.PI);
            sy = 1 - 0.22 * Math.sin(t * Math.PI);
        }
        ctx.scale(sx, sy);
        ctx.shadowColor = 'rgba(255,255,255,0.3)';
        ctx.shadowBlur = 8;
        ctx.translate(-PW / 2, -PH / 2);
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary-normal').trim() || '#ffffff';
        ctx.fillStyle = bgColor;
        ctx.fill(PLAYER_PATH);
        ctx.restore();

        drawHeldKey();
    }

    function drawOrb(orb) {
        const cx = wx(orb.x);
        const cy = wy(orb.y, orb.r * 2) + orb.r;
        const glow = orb.actTimer > 0;
        ctx.save();
        if (orb.ghost) ctx.globalAlpha = 0.3;
        if (glow && !orb.ghost) { ctx.shadowColor = 'rgba(255,220,0,0.9)'; ctx.shadowBlur = 20; }
        if (orb.tex) {
            ctx.save();
            ctx.beginPath(); ctx.arc(cx, cy, orb.r, 0, Math.PI * 2); ctx.clip();
            if (orb.textureMode === 'stretch') {
                ctx.drawImage(orb.tex.img, cx - orb.r, cy - orb.r, orb.r * 2, orb.r * 2);
            } else if (orb.textureMode === 'cover') {
                const imgW = orb.tex.img.naturalWidth, imgH = orb.tex.img.naturalHeight;
                const size = orb.r * 2;
                const scale = Math.max(size / imgW, size / imgH);
                const dw = imgW * scale, dh = imgH * scale;
                ctx.drawImage(orb.tex.img, cx - orb.r + (size - dw) / 2, cy - orb.r + (size - dh) / 2, dw, dh);
            } else {
                const m = new DOMMatrix();
                m.translateSelf(cx - orb.r, cy - orb.r);
                orb.tex.pat.setTransform(m);
                ctx.fillStyle = orb.tex.pat;
                ctx.fill();
            }
            ctx.restore();
        } else {
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r);
            g.addColorStop(0, glow ? 'rgba(255,240,0,1)' : COL.orbCore);
            g.addColorStop(0.5, glow ? 'rgba(255,180,0,0.8)' : 'rgba(252,229,18,0.6)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(cx, cy, orb.r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = COL.orbRing; ctx.lineWidth = 2;
        if (orb.ghost) ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.arc(cx, cy, orb.r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }

    function drawEnemy(en) {
        const rot = (en.rotation || 0) * Math.PI / 180;
        const ex = wx(en.x), ey = wy(en.y, en.h);

        ctx.save();

        if (rot !== 0) {
            ctx.translate(ex + en.w / 2, ey + en.h / 2);
            ctx.rotate(rot);
            ctx.translate(-en.w / 2, -en.h / 2);
        }

        const sx = en.invertX ? -1 : 1;
        const sy = en.invertY ? -1 : 1;
        if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);

        const lx = rot !== 0 ? 0 : ex;
        const ly = rot !== 0 ? 0 : ey;

        if (en.ghost) { ctx.globalAlpha = 0.25; ctx.setLineDash([6, 4]); }

        if (en.tex) {
            const frame = getAnimFrame(en);
            ctx.save();
            ctx.beginPath(); ctx.roundRect(lx, ly, en.w, en.h, 6); ctx.clip();
            if (frame >= 0) {
                const img = en.tex.img;
                const frameH = img.naturalHeight / en.textureFrames;
                ctx.drawImage(img, 0, frame * frameH, img.naturalWidth, frameH, lx, ly, en.w, en.h);
            } else if (en.textureMode === 'stretch') {
                ctx.drawImage(en.tex.img, lx, ly, en.w, en.h);
            } else if (en.textureMode === 'cover') {
                const imgW = en.tex.img.naturalWidth, imgH = en.tex.img.naturalHeight;
                const scale = Math.max(en.w / imgW, en.h / imgH);
                const dw = imgW * scale, dh = imgH * scale;
                ctx.drawImage(en.tex.img, lx + (en.w - dw) / 2, ly + (en.h - dh) / 2, dw, dh);
            } else {
                const m = new DOMMatrix();
                m.translateSelf(lx, ly);
                en.tex.pat.setTransform(m);
                ctx.fillStyle = en.tex.pat;
                ctx.fill();
            }
            ctx.restore();
        } else {
            ctx.fillStyle = COL.enemy;
            ctx.beginPath(); ctx.roundRect(lx, ly, en.w, en.h, 6); ctx.fill();
        }

        if (en.ghost) {
            ctx.globalAlpha = 0.55;
            ctx.strokeStyle = COL.enemy; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(lx, ly, en.w, en.h, 6); ctx.stroke();
        }

        ctx.globalAlpha = en.ghost ? 0.35 : 1;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(en.label, lx + en.w / 2, ly + en.h / 2);

        ctx.restore();
    }

    const btns = [];
    function drawBtn(x, y, w, h, label, col, cb, disabled = false) {
        ctx.save();
        const hov = !disabled && mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
        ctx.fillStyle = disabled ? '#2a2a2a' : (hov ? darken(col) : col);
        ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill();
        ctx.fillStyle = disabled ? '#555' : '#fff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + w / 2, y + h / 2);
        ctx.restore();
        if (!disabled) btns.push({ x, y, w, h, cb });
    }
    function darken(hex) {
        if (hex === '#3f8541') return '#145716';
        if (hex === '#1264fc') return '#0a3d8f';
        if (hex === '#7c3aed') return '#5b21b6';
        return '#333';
    }

    let mouseX = -1, mouseY = -1;
    function handleSliderAt(clientX, clientY) {
        for (const b of btns) {
            if (!b._slider) continue;
            if (clientX >= b.x && clientX <= b.x + b.w && clientY >= b.y && clientY <= b.y + b.h) {
                const v = Math.max(0, Math.min(1, (clientX - b._sliderX) / b._sliderW));
                b._setVol(v);
                return true;
            }
        }
        return false;
    }

    let mouseDown = false;
    canvas.addEventListener('mousedown', e => { mouseDown = true; handleSliderAt(e.clientX, e.clientY); });
    canvas.addEventListener('mouseup', () => mouseDown = false);
    canvas.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; if (mouseDown) handleSliderAt(e.clientX, e.clientY); });
    canvas.addEventListener('click', e => {
        if (handleSliderAt(e.clientX, e.clientY)) return;
        for (const b of btns) {
            if (!b._slider && e.clientX >= b.x && e.clientX <= b.x + b.w && e.clientY >= b.y && e.clientY <= b.y + b.h) {
                b.cb(); return;
            }
        }
    });
    canvas.addEventListener('touchmove', e => {
        const t = e.touches[0]; if (!t) return;
        handleSliderAt(t.clientX, t.clientY);
    }, { passive: true });
    canvas.addEventListener('touchend', e => {
        const touch = e.changedTouches[0]; if (!touch) return;
        if (handleSliderAt(touch.clientX, touch.clientY)) return;
        for (const b of btns) {
            if (!b._slider && touch.clientX >= b.x && touch.clientX <= b.x + b.w && touch.clientY >= b.y && touch.clientY <= b.y + b.h) {
                b.cb(); return;
            }
        }
    });

    function drawPauseScreen() {
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const panelW = 360, panelH = 530;
        const px2 = canvas.width / 2 - panelW / 2;
        const py2 = canvas.height / 2 - panelH / 2;

        ctx.fillStyle = 'rgba(15,15,35,0.95)';
        ctx.beginPath();
        ctx.roundRect(px2, py2, panelW, panelH, 18);
        ctx.fill();
        ctx.strokeStyle = 'rgba(155,155,156,0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(px2, py2, panelW, panelH, 18);
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('Pauze', canvas.width / 2, py2 + 46);

        const bw = 300, bh = 52, bx = canvas.width / 2 - bw / 2;
        const gap = 14;

        drawBtn(bx, py2 + 84, bw, bh, '▶  Doorgaan', '#3f8541', () => { phase = 'playing'; timing = true; if (musicAudio) musicAudio.play().catch(() => {}); });
        drawBtn(bx, py2 + 84 + (bh + gap), bw, bh, '↺  Herstarten bij checkpoint', '#1264fc',
            () => {
                const cp = getCurrentCheckpoint();
                restoreFromCheckpoint(cp);
                vx = 0; vy = 0; onGround = false;
                for (const en of lvl.enemies) { if (!en._spawned) { en.x = en.startX; en.y = en.startY; en.vy = 0; en.onGround = false; } en.detected = false; }
                for (const orb of lvl.orbs) orb.actTimer = 0;
                portalCooldownTimer = 0;
                snapCam = true;
                phase = 'playing'; timing = true;
                if (musicAudio) musicAudio.play().catch(() => {});
            }
        );

        const hasUndo = checkpointHistory.length > 0;
        drawBtn(bx, py2 + 84 + (bh + gap) * 2, bw, bh, '↩  Verwijder checkpoint', hasUndo ? '#7c3aed' : '#333',
            () => {
                if (!hasUndo) return;
                checkpointHistory.pop();
                for (const cp of lvl.checkpoints) {
                    cp.activated = checkpointHistory.some(h => h.x === cp.x && h.y === cp.y);
                }
                const cp = getCurrentCheckpoint();
                restoreFromCheckpoint(cp);
                vx = 0; vy = 0; onGround = false;
                for (const en of lvl.enemies) { if (!en._spawned) { en.x = en.startX; en.y = en.startY; en.vy = 0; en.onGround = false; } en.detected = false; }
                for (const orb of lvl.orbs) orb.actTimer = 0;
                portalCooldownTimer = 0;
                snapCam = true;
                phase = 'playing'; timing = true;
                if (musicAudio) musicAudio.play().catch(() => {});
            },
            !hasUndo
        );

        drawBtn(bx, py2 + 84 + (bh + gap) * 3, bw, bh, '✕  Sluiten', '#555', () => endGame());

        const sliderX = px2 + 30;
        const sliderW = panelW - 60;
        const sliderY1 = py2 + 84 + (bh + gap) * 4 + 10;
        const sliderY2 = sliderY1 + 52;

        for (const [label, vol, setVol, y] of [
            ['Muziek', musicVolume, (v) => {
                set('platformer-musicVolume', v);
                musicVolume = v;
                if (musicAudio) musicAudio.volume = v;
                if (musicFading) {
                    const t = Math.min(1, musicFading.timer / musicFading.duration);
                    if (musicFading.outAudio) musicFading.outAudio.volume = v * (1 - t);
                    if (musicFading.inAudio) musicFading.inAudio.volume = v * t;
                }
            }, sliderY1],
            ['Geluiden', sfxVolume, (v) => { set('platformer-sfxVolume', v); sfxVolume = v; }, sliderY2],
        ]) {
            ctx.fillStyle = '#aaa';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, sliderX, y + 8);

            const trackY = y + 28;
            const trackH = 6;
            ctx.fillStyle = '#333';
            ctx.beginPath(); ctx.roundRect(sliderX, trackY - trackH / 2, sliderW, trackH, 3); ctx.fill();

            ctx.fillStyle = '#5b9cf6';
            ctx.beginPath(); ctx.roundRect(sliderX, trackY - trackH / 2, sliderW * vol, trackH, 3); ctx.fill();

            const knobX = sliderX + sliderW * vol;
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(knobX, trackY, 9, 0, Math.PI * 2); ctx.fill();

            btns.push({
                x: sliderX, y: trackY - 14, w: sliderW, h: 28,
                cb: () => {},
                _slider: true, _setVol: setVol, _sliderX: sliderX, _sliderW: sliderW,
            });
        }

        ctx.fillStyle = 'rgba(155,155,156,0.5)';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (isMobile()) {
            ctx.fillText('Tik buiten dit venster om door te gaan', canvas.width / 2, py2 + panelH - 18);
        } else {
            ctx.fillText('ESC om door te gaan', canvas.width / 2, py2 + panelH - 18);
        }

        ctx.restore();
    }

    function drawLevelCompleteScreen() {
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const panelW = 380, panelH = 340;
        const px2 = canvas.width / 2 - panelW / 2;
        const py2 = canvas.height / 2 - panelH / 2;

        ctx.fillStyle = 'rgba(15,15,35,0.97)';
        ctx.beginPath();
        ctx.roundRect(px2, py2, panelW, panelH, 18);
        ctx.fill();
        ctx.strokeStyle = 'rgba(76,175,80,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(px2, py2, panelW, panelH, 18);
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#fce512';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('✓ Level voltooid!', canvas.width / 2, py2 + 52);

        ctx.fillStyle = '#9b9b9c';
        ctx.font = '22px sans-serif';
        ctx.fillText(`Tijd: ${levelCompletedTime.toFixed(1)}s`, canvas.width / 2, py2 + 102);

        const bestTime = getLevelBestTime(lvlIdx);
        if (bestTime !== null) {
            const isNew = Math.abs(bestTime - levelCompletedTime) < 0.05;
            ctx.fillStyle = isNew ? '#4caf50' : '#9b9b9c';
            ctx.font = isNew ? 'bold 18px sans-serif' : '18px sans-serif';
            ctx.fillText(isNew ? `🏆 Nieuwe beste tijd: ${bestTime.toFixed(1)}s` : `Beste tijd: ${bestTime.toFixed(1)}s`, canvas.width / 2, py2 + 138);
        }

        const totalPossible = countLevelCoins(lvl);
        if (totalPossible > 0) {
            ctx.fillStyle = COL.coin;
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(`🪙 ${sessionCoins} / ${totalPossible}`, canvas.width / 2, py2 + 172);
        }

        const bw = 320, bh = 52, bx = canvas.width / 2 - bw / 2;

        drawBtn(bx, py2 + 210, bw, bh, '↺  Opnieuw spelen', '#1264fc', () => {
            elapsed = 0;
            sessionCoins = 0;
            sessionTotalCoins = 0;
            loadLvl(lvlIdx);
        });

        drawBtn(bx, py2 + 210 + bh + 12, bw, bh, '☰  Terug naar menu', '#555', () => {
            endGame();
            showScreen('mod-screen-levels');
        });

        ctx.restore();
    }
    function drawWinScreen() {
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fce512';
        ctx.font = 'bold 56px sans-serif';
        ctx.fillText('🎉 Voltooid! 🎉', canvas.width / 2, canvas.height / 2 - 90);
        ctx.fillStyle = '#9b9b9c';
        ctx.font = '30px sans-serif';
        ctx.fillText(`Tijd: ${elapsed.toFixed(1)}s`, canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillStyle = COL.coin;
        ctx.font = 'bold 28px sans-serif';
        const totalPossible = levels.reduce((sum, l) => sum + countLevelCoins(l), 0);
        ctx.fillText(`🪙 Munten: ${sessionCoins} / ${totalPossible}`, canvas.width / 2, canvas.height / 2 + 68);
        const bw = 300, bh = 54, bx = canvas.width / 2 - bw / 2;
        drawBtn(bx, canvas.height / 2 + 110, bw, bh, lvl?.playAgainText || 'Opnieuw spelen', '#3f8541', () => { elapsed = 0; timing = true; sessionCoins = 0; sessionTotalCoins = 0; loadLvl(0); });
        drawBtn(bx, canvas.height / 2 + 180, bw, bh, 'Menu', '#555', () => endGame());
        ctx.restore();
    }

    function drawHUD() {
        id('mod-playtime').textContent = `Tijd: ${elapsed.toFixed(0)}s`;
        const totalPossible = levels.reduce((sum, l) => sum + countLevelCoins(l), 0);
        id('mod-coins-hud').textContent = totalPossible > 0 ? `🪙 ${sessionCoins}` : '';
    }

    function redrawObj(o) {
        if (o.type === 'floor') {
            if (isVisible(o.x, o.y, o.w, o.h)) ghostFillRect(o, o.x, o.y, o.w, o.h, COL.floor);
        } else if (o.type === 'wall') {
            const drawY = o.riseWithId ? o.riseCurrentY : o.y;
            const drawH = o.riseWithId ? o.riseCurrentH : o.h;
            if (isVisible(o.x, drawY, o.w, drawH)) {
                if (o.keyId) {
                    drawKeyDoor(o);
                } else if (o.closeOnAreaId) {
                    drawAreaCloseWall(o);
                } else {
                    ghostFillRect(o, o.x, drawY, o.w, drawH, COL.wall);
                }
            }
        } else if (o.type === 'lava') {
            const lh = o.flowUp ? o.currentH : o.h;
            if (isVisible(o.x, o.y, o.w, lh)) ghostFillRect(o, o.x, o.y, o.w, lh, COL.lava);
        } else if (o.type === 'trampoline') {
            if (isVisible(o.x, o.y, o.w, o.h)) ghostFillRect(o, o.x, o.y, o.w, o.h, COL.tramp, 8);
        } else if (o.type === 'mpUp') {
            if (isVisible(o.x, o.cy, o.w, o.h)) ghostFillRect(o, o.x, o.cy, o.w, o.h, COL.floor);
        } else if (o.type === 'mpRight') {
            if (isVisible(o.cx, o.y, o.w, o.h)) ghostFillRect(o, o.cx, o.y, o.w, o.h, COL.floor);
        } else if (o.type === 'enemy') {
            if (isVisible(o.x, o.y, o.w, o.h)) drawEnemy(o);
        } else if (o.type === 'orb') {
            if (isVisible(o.x - o.r, o.y - o.r, o.r * 2, o.r * 2)) drawOrb(o);
        } else if (o.type === 'coin') {
            if (isVisible(o.x - o.r, o.y - o.r, o.r * 2, o.r * 2)) drawCoin(o);
        } else if (o.type === 'key') {
            if (isVisible(o.x - o.r, o.y - o.r, o.r * 2, o.r * 2)) drawKey(o);
        } else if (o.type === 'checkpoint') {
            if (isVisible(o.x, o.y, FLAG_W, FLAG_H)) drawCheckpoint(o);
        } else if (o.type === 'end') {
            if (isVisible(o.x, o.y, o.w, o.h)) drawEnd(o);
        } else if (o.type === 'text') {
            if (isVisible(o.x - 400, o.y - 40, 800, 80)) drawText(o);
        } else if (o.type === 'portal') {
            if (isVisible(o.x, o.y, o.w, o.h)) drawPortal(o);
        }
    }

    function render(dt) {
        btns.length = 0;
        if (!lvl) return;
        drawBg();
        const floorCanvasY = wy(0, 0);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, floorCanvasY);
        ctx.clip();

        const activeGhostWalls = lvl.walls.filter(w => w.ghost && w.opaque && w.playerOverlap);
        const ghostWallRevealSets = activeGhostWalls.map(gw => ({
            wall: gw,
            objectsBehind: lvl.drawOrder.slice(0, lvl.drawOrder.indexOf(gw)),
        }));

        for (const o of lvl.drawOrder) {
            if (o.type === 'floor') {
                if (isVisible(o.x, o.y, o.w, o.h)) ghostFillRect(o, o.x, o.y, o.w, o.h, COL.floor);
            } else if (o.type === 'wall') {
                const drawY = o.riseWithId ? o.riseCurrentY : o.y;
                const drawH = o.riseWithId ? o.riseCurrentH : o.h;
                if (isVisible(o.x, drawY, o.w, drawH)) {
                    if (o.keyId) {
                        drawKeyDoor(o);
                    } else if (o.closeOnAreaId) {
                        drawAreaCloseWall(o);
                    } else {
                        ghostFillRect(o, o.x, drawY, o.w, drawH, COL.wall);
                    }
                }
            } else if (o.type === 'lava') {
                const lh = o.flowUp ? o.currentH : o.h;
                if (isVisible(o.x, o.y, o.w, lh)) ghostFillRect(o, o.x, o.y, o.w, lh, COL.lava);
            } else if (o.type === 'trampoline') {
                if (isVisible(o.x, o.y, o.w, o.h)) ghostFillRect(o, o.x, o.y, o.w, o.h, COL.tramp, 8);
            } else if (o.type === 'mpUp') {
                if (isVisible(o.x, o.cy, o.w, o.h)) ghostFillRect(o, o.x, o.cy, o.w, o.h, COL.floor);
            } else if (o.type === 'mpRight') {
                if (isVisible(o.cx, o.y, o.w, o.h)) ghostFillRect(o, o.cx, o.y, o.w, o.h, COL.floor);
            } else if (o.type === 'enemy') {
                if (isVisible(o.x, o.y, o.w, o.h)) drawEnemy(o);
            } else if (o.type === 'orb') {
                if (isVisible(o.x - o.r, o.y - o.r, o.r * 2, o.r * 2)) drawOrb(o);
            } else if (o.type === 'coin') {
                if (isVisible(o.x - o.r, o.y - o.r, o.r * 2, o.r * 2)) drawCoin(o);
            } else if (o.type === 'key') {
                if (isVisible(o.x - o.r, o.y - o.r, o.r * 2, o.r * 2)) drawKey(o);
            } else if (o.type === 'checkpoint') {
                if (isVisible(o.x, o.y, FLAG_W, FLAG_H)) drawCheckpoint(o);
            } else if (o.type === 'end') {
                if (isVisible(o.x, o.y, o.w, o.h)) drawEnd(o);
            } else if (o.type === 'text') {
                if (isVisible(o.x - 400, o.y - 40, 800, 80)) drawText(o);
            } else if (o.type === 'portal') {
                if (isVisible(o.x, o.y, o.w, o.h)) drawPortal(o);
            }
        }
        if (phase === 'dying') drawDeathSlices(); else drawPlayer();

        for (const { wall: gw, objectsBehind } of ghostWallRevealSets) {
            if (!isVisible(gw.x, gw.y, gw.w, gw.h)) continue;
            if (!gw.playerOverlap) continue;
            ctx.save();
            ctx.beginPath();
            ctx.rect(wx(gw.x), wy(gw.y, gw.h), gw.w, gw.h);
            ctx.clip();
            for (const o of objectsBehind) redrawObj(o);
            if (phase === 'dying') drawDeathSlices(); else drawPlayer();
            ctx.restore();
        }

        drawCoinPopups();
        ctx.restore();
        drawHUD();
        drawDescription();
        drawDoorMessage();
        if (phase === 'paused') drawPauseScreen();
        if (phase === 'levelComplete') drawLevelCompleteScreen();
        if (phase === 'win') drawWinScreen();
        drawDebug(dt);
    }

    function createDeathSlices() {
        deathSlices = [];
        const count = 6;
        const sliceH = PH / count;
        const col = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary-normal').trim() || '#ffffff';
        for (let i = 0; i < count; i++) {
            deathSlices.push({
                worldX: px,
                worldYBottom: py + PH - (i + 1) * sliceH,
                localY: i * sliceH,
                h: sliceH,
                vx: (Math.random() - 0.5) * 700,
                vy: 200 + Math.random() * 500,
                rot: 0,
                rotV: (Math.random() - 0.5) * 18,
                col,
            });
        }
    }

    function drawDeathSlices() {
        const alpha = Math.max(0, deathTimer / DEATH_DUR);
        for (const s of deathSlices) {
            const sx = wx(s.worldX);
            const sy = wy(s.worldYBottom, s.h);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(sx + PW / 2, sy + s.h / 2);
            ctx.rotate(s.rot);
            ctx.beginPath();
            ctx.rect(-PW / 2, -s.h / 2, PW, s.h);
            ctx.clip();
            ctx.translate(-PW / 2, -s.h / 2 - s.localY);
            ctx.fillStyle = s.col;
            ctx.fill(PLAYER_PATH);
            ctx.restore();
        }
        ctx.globalAlpha = 1;
    }

    let lastTs = null;
    function loop(ts) {
        if (!gameAlive) return;
        const dt = lastTs === null ? 0.016 : Math.min((ts - lastTs) / 1000, 0.05);
        lastTs = ts;
        if (timing && phase === 'playing') elapsed += dt;
        update(dt);
        render(dt);
        requestAnimationFrame(loop);
    }

    function getAudioUrl(file) {
        if (isExtension) {
            return chrome.runtime.getURL('sounds/' + file + '.mp3');
        } else {
            return 'https://geweldige-geluidseffecten.netlify.app/' + file + '.mp3';
        }
    }

    function playSfx(name) {
        if (!sfxPool[name]) sfxPool[name] = [];
        const pool = sfxPool[name];
        let a = pool.find(x => x.paused || x.ended);
        if (!a) { a = new Audio(getAudioUrl(name)); pool.push(a); }
        a.currentTime = 0;
        a.volume = sfxVolume;
        a.play().catch(() => {});
    }

async function openCreditsPopup() {
        function mdInline(str) {
            return str
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
                    '<a href="$2" target="_blank" rel="noopener">$1</a>');
        }

        const contributors = [
            {
                username: 'levkris',
                avatar: 'https://avatars.githubusercontent.com/u/105733478?v=4',
                github: 'https://github.com/levkris',
            },
        ];

        let musicRows = '';
        let sfxRows = '';
        let licenseBlocks = '';

        try {
            const resp = await fetch(chrome.runtime.getURL('platformer/credits.md'));
            const md = await resp.text();
            const lines = md.split('\n');

            let section = null;
            for (const raw of lines) {
                const line = raw.trimEnd();

                const h = line.match(/^##\s+(.*)/);
                if (h) {
                    const title = h[1].trim();
                    if (/music/i.test(title)) section = 'music';
                    else if (/sound/i.test(title)) section = 'sfx';
                    else if (/license/i.test(title)) section = 'license';
                    else section = null;
                    continue;
                }

                if (/^---+$/.test(line)) { section = null; continue; }

                if (section === 'music' && line.startsWith('|')) {
                    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
                    if (cells.length < 4) continue;
                    if (/^[-:\s]+$/.test(cells[0]) || /bestand|file/i.test(cells[0])) continue;
                    musicRows += `<tr>
                        <td>${mdInline(cells[0])}</td>
                        <td>${mdInline(cells[1])}</td>
                        <td>${mdInline(cells[2])}</td>
                        <td>${mdInline(cells[3])}</td>
                    </tr>`;
                }

                if (section === 'sfx' && line.startsWith('|')) {
                    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
                    if (cells.length < 2) continue;
                    if (/^[-:\s]+$/.test(cells[0]) || /bestand|file/i.test(cells[0])) continue;
                    sfxRows += `<tr>
                        <td>${mdInline(cells[0])}</td>
                        <td>${mdInline(cells[1])}</td>
                    </tr>`;
                }

                if (section === 'license' && line.trim()) {
                    licenseBlocks += `<p class="mod-credits-license-text">${mdInline(line.trim())}</p>`;
                }
            }

        } catch (e) {
            console.warn('Could not load credits.md', e);
        }

        const contributorHTML = contributors.map(c => `
            <a class="mod-credits-gh-pill" href="${c.github}" target="_blank" rel="noopener">
                ${c.avatar ? `<img src="${c.avatar}" alt="${c.username}" class="mod-credits-gh-avatar">` : ''}
                <span class="mod-credits-gh-name">${c.username}</span>
                <svg class="mod-credits-gh-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577
                    0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755
                    -1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07
                    1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332
                    -5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005
                    -.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552
                    3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22
                    0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015
                    3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
            </a>
        `).join('');

        const overlay = document.createElement('div');
        overlay.className = 'mod-coming-soon-overlay';
        overlay.id = 'mod-credits-overlay';
        overlay.innerHTML = `
            <div class="mod-credits-box">
                <button class="mod-credits-close" id="mod-credits-close" aria-label="Sluiten">✕</button>

                <div class="mod-credits-header">
                    <span class="mod-credits-header-icon">📜</span>
                    <h2 class="mod-credits-title">Credits</h2>
                </div>

                <div class="mod-credits-scroll">

                    <section class="mod-credits-section">
                        <h3 class="mod-credits-section-title">👾 Contributors</h3>
                        <div class="mod-credits-gh-pills">${contributorHTML}</div>
                    </section>
                    <div class="mod-credits-divider"></div>

                    ${musicRows ? `
                    <section class="mod-credits-section">
                        <h3 class="mod-credits-section-title">🎵 Muziek</h3>
                        <table class="mod-credits-table">
                            <thead><tr><th>Bestand</th><th>Titel</th><th>Artiest</th><th>Licentie</th></tr></thead>
                            <tbody>${musicRows}</tbody>
                        </table>
                    </section>
                    <div class="mod-credits-divider"></div>
                    ` : ''}

                    ${sfxRows ? `
                    <section class="mod-credits-section">
                        <h3 class="mod-credits-section-title">🔊 Geluidseffecten</h3>
                        <table class="mod-credits-table">
                            <thead><tr><th>Bestand</th><th>Bron</th></tr></thead>
                            <tbody>${sfxRows}</tbody>
                        </table>
                    </section>
                    <div class="mod-credits-divider"></div>
                    ` : ''}

                    ${licenseBlocks ? `
                    <section class="mod-credits-section mod-credits-license-section">
                        <h3 class="mod-credits-section-title">📄 Licentie-informatie</h3>
                        ${licenseBlocks}
                    </section>
                    ` : ''}

                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        document.getElementById('mod-credits-close').addEventListener('click', close);
        overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    }
}