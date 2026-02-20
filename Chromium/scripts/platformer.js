// MINIGAME
// Platformer v2 minigame
async function startPlatformerGame() {
    tn('body', 0).classList.add('mod-game-playing');

    const DEBUG_MODE = true;
    let debugVisible = false;

    tn('body', 0).insertAdjacentHTML('beforeend', `
<div id="mod-game">
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

    const canvas = id('mod-canvas');
    const ctx    = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function isMobile() {
        return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    }
    function updateMobileVis() {
        id('mod-mobile-controls').style.display = isMobile() ? 'flex' : 'none';
        id('mod-pause-btn').style.display = isMobile() ? 'inline-block' : 'none';
    }
    updateMobileVis();
    window.addEventListener('resize', updateMobileVis);

    let musicAudio = null;
    function playLevelMusic(src) {
        if (musicAudio) { musicAudio.pause(); musicAudio = null; }
        if (!src) return;
        try {
            musicAudio = new Audio(getAudioUrl(src));
            musicAudio.loop   = true;
            musicAudio.volume = 0.2;
            musicAudio.play().catch(() => {});
        } catch(e) {}
    }
    function stopMusic() {
        if (musicAudio) {
            const a = musicAudio;
            musicAudio = null;
            a.pause();
            a.src = '';
        }
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
        const el     = doc.querySelector('level');
        const descEl = el.querySelector('description');
        const lvl = {
            index:       idx,
            title:       el.getAttribute('title')      || `Level ${idx + 1}`,
            description: descEl ? descEl.textContent.trim() : '',
            song:        el.getAttribute('song')       || null,
            worldWidth:  parseFloat(el.getAttribute('worldWidth'))  || 3000,
            worldHeight: parseFloat(el.getAttribute('worldHeight')) || 1400,
            spawnX:      parseFloat(el.getAttribute('spawnX'))      || 60,
            spawnY:      parseFloat(el.getAttribute('spawnY'))      || 120,
            flagX:       parseFloat(el.getAttribute('flagX'))       || 2900,
            flagY:       parseFloat(el.getAttribute('flagY'))       || 120,
            floors:      [], walls:   [], lavas:    [],
            trampolines: [], enemies: [], orbs:     [],
            mpUp:        [], mpRight: [], coins:    [], checkpoints: [],
            texts:       [], portals: [],
            drawOrder:   [],
            playAgainText: 'Opnieuw spelen',
            closeGameText: 'Sluiten',
        };
        for (const c of el.children) {
            const tag         = c.tagName;
            if (tag === 'description') continue;
            const x           = parseFloat(c.getAttribute('x'))       ?? 0;
            const y           = parseFloat(c.getAttribute('y'))       ?? 0;
            const w           = parseFloat(c.getAttribute('width'))    || 100;
            const h           = parseFloat(c.getAttribute('height'))   || 20;
            const ghost       = c.getAttribute('ghost')       === 'true';
            const oneWay      = c.getAttribute('oneWay')      === 'true';
            const texture     = c.getAttribute('texture')     || null;
            const textureMode = c.getAttribute('textureMode') || 'tile';
            if (tag === 'floor') {
                const obj = { type: 'floor', x, y, w, h, ghost, oneWay, texture, textureMode, tex: null };
                lvl.floors.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'wall') {
                const obj = { type: 'wall', x, y, w, h, ghost, texture, textureMode, tex: null };
                lvl.walls.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'lava') {
                const obj = { type: 'lava', x, y, w, h, ghost, texture, textureMode, tex: null };
                lvl.lavas.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'trampoline') {
                const obj = { type: 'trampoline', x, y, w, h, ghost, texture, textureMode, tex: null, strength: parseFloat(c.getAttribute('strength')) || 2.5 };
                lvl.trampolines.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'enemy') {
                const mn = c.getAttribute('min') !== null ? parseFloat(c.getAttribute('min')) : null;
                const mx = c.getAttribute('max') !== null ? parseFloat(c.getAttribute('max')) : null;
                const n1 = Math.floor(Math.random() * 5) + 1;
                let   n2 = Math.floor(Math.random() * 10);
                if (n1 === 5 && n2 >= 5) n2 = 4;
                const obj = { type: 'enemy', x, y, w: 50, h: 50, startX: x, min: mn, max: mx, label: `${n1},${n2}`, ghost, texture, textureMode, tex: null };
                lvl.enemies.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'orb') {
                const obj = { type: 'orb', x, y, r: 20, strength: parseFloat(c.getAttribute('strength')) || 2.5, actTimer: 0, ghost, texture, textureMode, tex: null };
                lvl.orbs.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'movingPlatformUp') {
                const sy = parseFloat(c.getAttribute('startY')) || y;
                const ey = parseFloat(c.getAttribute('endY'))   || y + 300;
                const obj = { type: 'mpUp', x, w, h, startY: sy, endY: ey, cy: sy, dir: 1, ghost, oneWay, texture, textureMode, tex: null };
                lvl.mpUp.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'movingPlatformRight') {
                const sx = parseFloat(c.getAttribute('startX')) || x;
                const ex = parseFloat(c.getAttribute('endX'))   || x + 300;
                const obj = { type: 'mpRight', y, w, h, startX: sx, endX: ex, cx: sx, dir: 1, ghost, oneWay, texture, textureMode, tex: null };
                lvl.mpRight.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'coin') {
                const r = parseFloat(c.getAttribute('r')) || 14;
                const obj = { type: 'coin', x, y, r, collected: false, bobTimer: Math.random() * Math.PI * 2, ghost, texture, textureMode, tex: null };
                lvl.coins.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'checkpoint') {
                const obj = { type: 'checkpoint', x, y, activated: false };
                lvl.checkpoints.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'text') {
                const baseFont  = c.getAttribute('font')  || '20px sans-serif';
                const baseColor = c.getAttribute('color') || '#ffffff';
                const TAG_COLORS = { y: '#fce512', r: '#fc1212', g: '#4caf50', bl: '#5b9cf6', o: '#fc9312', p: '#c084fc', w: '#ffffff', gray: '#9b9b9c' };
                function parseSegments(node, bold, color) {
                    const segs = [];
                    for (const child of node.childNodes) {
                        if (child.nodeType === 3) {
                            if (child.nodeValue) segs.push({ text: child.nodeValue, bold, color });
                        } else if (child.nodeType === 1) {
                            const t = child.tagName.toLowerCase();
                            const newBold  = bold  || t === 'b';
                            const newColor = TAG_COLORS[t] !== undefined ? TAG_COLORS[t] : color;
                            segs.push(...parseSegments(child, newBold, newColor));
                        }
                    }
                    return segs;
                }
                const segments = parseSegments(c, false, baseColor);
                const obj = {
                    type: 'text',
                    x, y,
                    segments,
                    baseFont,
                    ghost,
                };
                lvl.texts.push(obj); lvl.drawOrder.push(obj);
            } else if (tag === 'portal') {
                const portalId   = c.getAttribute('portal-id')    || null;
                const toPortalId = c.getAttribute('to-portal-id') || null;
                const obj = { type: 'portal', x, y, w, h, portalId, toPortalId, cooldown: 0, texture, textureMode, tex: null };
                lvl.portals.push(obj); lvl.drawOrder.push(obj);
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
            if (obj.texture) obj.tex = await loadTexture(obj.texture);
        }));
    }

    const levels = [];
    const parser = new DOMParser();
    for (let i = 0; ; i++) {
        try {
            const resp = await fetch(chrome.runtime.getURL(`platformer_levels/lvl-${i}.xml`));
            if (!resp.ok) break;
            const xml = parser.parseFromString(await resp.text(), 'text/xml');
            if (xml.querySelector('parsererror')) break;
            const lvl = parseLvl(xml, i);
            await loadLevelTextures(lvl);
            levels.push(lvl);
        } catch(e) { break; }
    }

    const PW = 49, PH = 49;
    const GRAV     = 1800;
    const JUMP_V   = 620;
    const SPEED    = 300;
    const MAX_FALL = -1400;
    const FLAG_W   = 14, FLAG_H = 80;
    const PORTAL_COOLDOWN = 0.4;

    let lvl      = null;
    let lvlIdx   = 0;
    let px, py, vx = 0, vy = 0;
    let onGround = false;
    let phase    = 'playing';
    let camX = 0, camY = 0;
    let elapsed  = 0;
    let timing   = false;
    let jumpQ = false;
    let jumpHeldLastFrame = false;
    let jumpAnim = 0, landAnim = 0;
    let gameAlive  = true;
    let descTimer  = 0;
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

    function getCurrentCheckpoint() {
        return checkpointHistory.length > 0 ? checkpointHistory[checkpointHistory.length - 1] : null;
    }

    function captureCollectedSnapshot() {
        const snap = new Set();
        if (lvl) lvl.coins.forEach((co, i) => { if (co.collected) snap.add(i); });
        return snap;
    }

    function restoreFromCheckpoint(cp) {
        if (!cp) {
            sessionCoins -= lvl.coins.filter(co => co.collected).length;
            elapsed = 0;
            px = lvl.spawnX; py = lvl.spawnY;
            lvl.coins.forEach(co => { co.collected = false; });
        } else {
            px = cp.x; py = cp.y;
            sessionCoins = cp.coins;
            elapsed = cp.elapsed;
            lvl.coins.forEach((co, i) => { co.collected = cp.collectedSnapshot.has(i); });
        }
    }

    document.addEventListener('keydown', e => {
        if (['ArrowDown','ArrowUp','Space'].includes(e.code)) e.preventDefault();
        KEY[e.code] = true;
        if (['ArrowUp','KeyW','Space'].includes(e.code)) jumpQ = true;
        if (DEBUG_MODE && e.code === 'KeyH') debugVisible = !debugVisible;
        if (e.code === 'Escape') togglePause();
    });
    document.addEventListener('keyup', e => { KEY[e.code] = false; });

    function togglePause() {
        if (phase === 'win') return;
        if (phase === 'playing') {
            phase = 'paused';
            timing = false;
            if (musicAudio) musicAudio.pause();
        } else if (phase === 'paused') {
            phase = 'playing';
            timing = true;
            if (musicAudio) musicAudio.play().catch(() => {});
        }
    }

    function mBtn(btnId, onD, onU) {
        const b = id(btnId); if (!b) return;
        ['touchstart','mousedown'].forEach(ev => b.addEventListener(ev, e => { e.preventDefault(); onD(); }));
        ['touchend','mouseup','touchcancel','mouseleave'].forEach(ev => b.addEventListener(ev, e => { e.preventDefault(); onU(); }));
    }
    mBtn('mod-btn-left',  () => mLeft  = true,                   () => mLeft  = false);
    mBtn('mod-btn-right', () => mRight = true,                   () => mRight = false);
    mBtn('mod-btn-jump',  () => { mJump = true; jumpQ = true; }, () => mJump  = false);

    id('mod-pause-btn').addEventListener('click', () => togglePause());
    id('mod-close-button').addEventListener('click', endGame);

    function hit(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    function countLevelCoins(l) {
        return l ? l.coins.filter(c => !c.ghost).length : 0;
    }

    function loadLvl(idx) {
        if (idx >= levels.length) { winGame(); return; }
        lvlIdx = idx;
        lvl    = levels[idx];
        for (const mp of lvl.mpUp)         { mp.cy = mp.startY; mp.dir = 1; }
        for (const mp of lvl.mpRight)      { mp.cx = mp.startX; mp.dir = 1; }
        for (const orb of lvl.orbs)        { orb.actTimer = 0; }
        for (const en  of lvl.enemies)     { en.x = en.startX; }
        for (const co  of lvl.coins)       { co.collected = false; }
        for (const cp  of lvl.checkpoints) { cp.activated = false; }
        for (const pt  of lvl.portals)     { pt.cooldown = 0; }
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
        id('mod-level-title').textContent = lvl.title;
        playLevelMusic(lvl.song);
    }

    function winGame() {
        phase = 'win';
        timing = false;
        stopMusic();
        const prev = get('platformer-gamerecord');
        if (n(prev) || elapsed < parseFloat(prev)) set('platformer-gamerecord', elapsed.toFixed(1));
        const prevCoins = parseInt(get('platformer-coinrecord') || '0');
        if (sessionCoins > prevCoins) set('platformer-coinrecord', sessionCoins);
    }

    function endGame() {
        gameAlive = false;
        stopMusic();
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('resize', updateMobileVis);
        tn('body', 0).classList.remove('mod-game-playing');
        setTimeout(() => { const g = id('mod-game'); if (g) g.remove(); }, 320);
    }

    function updateCam() {
        const tx = px + PW / 2 - canvas.width  * 0.4;
        const ty = lvl.worldHeight - py - PH / 2 - canvas.height / 2;
        if (snapCam) {
            camX = tx;
            camY = ty;
            const stillInPortal = lvl.portals.some(pt => hit(px, py, PW, PH, pt.x, pt.y, pt.w, pt.h));
            if (!stillInPortal) snapCam = false;
        } else {
            camX += (tx - camX) * 0.1;
            camY += (ty - camY) * 0.1;
        }
        camX = Math.max(0, Math.min(camX, lvl.worldWidth  - canvas.width));
        camY = Math.max(0, Math.min(camY, lvl.worldHeight - canvas.height));
    }

    function wx(x)    { return x - camX; }
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

    function teleportThroughPortal(destPortal, enterSide) {
        if (enterSide === 'left') {
            px = destPortal.x + destPortal.w + 10;
            py = destPortal.y + (destPortal.h - PH) / 2;
        } else if (enterSide === 'right') {
            px = destPortal.x - PW - 10;
            py = destPortal.y + (destPortal.h - PH) / 2;
        } else if (enterSide === 'bottom') {
            px = destPortal.x + (destPortal.w - PW) / 2;
            py = destPortal.y + destPortal.h + 10;
        } else {
            px = destPortal.x + (destPortal.w - PW) / 2;
            py = destPortal.y - PH - 10;
        }
        portalCooldownTimer = PORTAL_COOLDOWN;
        snapCam = true;
    }

    function update(dt) {
        if (phase !== 'playing') return;

        if (descTimer > 0) descTimer -= dt;
        if (portalCooldownTimer > 0) portalCooldownTimer -= dt;

        for (const popup of coinPopups) { popup.y -= 60 * dt; popup.life -= dt; }
        coinPopups = coinPopups.filter(p => p.life > 0);

        const goLeft  = mLeft  || KEY['ArrowLeft']  || KEY['KeyA'];
        const goRight = mRight || KEY['ArrowRight'] || KEY['KeyD'];

        if (goRight && !goLeft)      vx =  SPEED;
        else if (goLeft && !goRight) vx = -SPEED;
        else                         vx =  0;

        if (!onGround) {
            vy -= GRAV * dt;
            if (vy < MAX_FALL) vy = MAX_FALL;
        }

        const jumpHeld = mJump || KEY['ArrowUp'] || KEY['KeyW'] || KEY['Space'];
        if (!jumpHeld) jumpQ = false;
        const wantJump = jumpQ || (jumpHeld && onGround);

        const jumpReleasedSinceLastJump = !jumpHeldLastFrame;

        if (wantJump) {
            let jumped = false;
            let orbHit = false;

            for (const orb of lvl.orbs) {
                if (orb.ghost) continue;
                const orbHitSize = orb.r * 2;
                if (orb.actTimer <= 0 && (
                    hit(px, py, PW, PH, orb.x - orb.r, orb.y - orb.r, orbHitSize, orbHitSize) ||
                    (orb.x >= px && orb.x <= px + PW && orb.y >= py && orb.y <= py + PH)
                )) {
                    vy = orb.strength * 370;
                    onGround = false;
                    orb.actTimer = 0.18;
                    jumpAnim = 0.3;
                    orbHit = true;
                    jumped = true;
                    break;
                }
            }

            if (!orbHit && onGround) {
                vy = JUMP_V;
                onGround = false;
                jumpAnim = 0.3;
                jumped = true;
            }

            if (jumped) jumpQ = false;
        }

        if (!jumpHeld) {
            for (const orb of lvl.orbs) {
                if (orb.ghost) continue;
                const orbHitSize = orb.r * 2;
                if (orb.actTimer <= 0 && (
                    hit(px, py, PW, PH, orb.x - orb.r, orb.y - orb.r, orbHitSize, orbHitSize) ||
                    (orb.x >= px && orb.x <= px + PW && orb.y >= py && orb.y <= py + PH)
                )) {
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
            }
        }

        for (const mp of lvl.mpUp) {
            const spd = 200 * dt;
            mp.cy += mp.dir * spd;
            if (mp.cy >= mp.endY)   { mp.cy = mp.endY;   mp.dir = -1; }
            if (mp.cy <= mp.startY) { mp.cy = mp.startY; mp.dir =  1; }
        }
        for (const mp of lvl.mpRight) {
            const spd = 160 * dt;
            mp.cx += mp.dir * spd;
            if (mp.cx >= mp.endX)   { mp.cx = mp.endX;   mp.dir = -1; }
            if (mp.cx <= mp.startX) { mp.cx = mp.startX; mp.dir =  1; }
        }

        for (const en of lvl.enemies) {
            const spd = 100 * dt;
            en.x += en.x > px ? -spd : spd;
            if (en.min !== null && en.x < en.min) en.x = en.min;
            if (en.max !== null && en.x > en.max) en.x = en.max;
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
                    collectedSnapshot: captureCollectedSnapshot(),
                });
            }
        }

        for (const co of lvl.coins) {
            co.bobTimer += dt * 3;
            if (co.ghost || co.collected) continue;
            if (hit(px, py, PW, PH, co.x - co.r, co.y - co.r, co.r * 2, co.r * 2)) {
                co.collected = true;
                sessionCoins++;
                sessionTotalCoins++;
                const coinAudio = new Audio(getAudioUrl('coin'));
                coinAudio.loop   = false;
                coinAudio.volume = 0.4;
                coinAudio.play().catch(() => {});
                coinPopups.push({ x: wx(co.x), y: wy(co.y, co.r * 2), life: 0.8, maxLife: 0.8 });
            }
        }

        if (portalCooldownTimer <= 0) {
            for (const portal of lvl.portals) {
                if (!hit(px, py, PW, PH, portal.x, portal.y, portal.w, portal.h)) continue;
                const destPortal = lvl.portals.find(p => p.portalId === portal.toPortalId);
                if (!destPortal) continue;
                const enterSide = getEnterSide(portal);
                teleportThroughPortal(destPortal, enterSide);
                break;
            }
        }

        px += vx * dt;
        px = Math.max(0, Math.min(px, lvl.worldWidth - PW));

        for (const wl of lvl.walls) {
            if (wl.ghost) continue;
            if (hit(px, py, PW, PH, wl.x, wl.y, wl.w, wl.h)) {
                px = vx >= 0 ? wl.x - PW : wl.x + wl.w;
                vx = 0;
            }
        }

        py += vy * dt;

        const solids = [
            ...lvl.floors.filter(f => !f.ghost),
            ...lvl.mpUp.filter(mp => !mp.ghost).map(mp => ({ x: mp.x,  y: mp.cy, w: mp.w, h: mp.h, oneWay: mp.oneWay, type: 'mpUp' })),
            ...lvl.mpRight.filter(mp => !mp.ghost).map(mp => ({ x: mp.cx, y: mp.y, w: mp.w, h: mp.h, oneWay: mp.oneWay, type: 'mpRight' })),
        ];
        onGround = false;
        standingOn = null;

        for (const fl of solids) {
            if (!hit(px, py, PW, PH, fl.x, fl.y, fl.w, fl.h)) continue;
            const playerBottom = py;
            const playerTop    = py + PH;
            const flTop        = fl.y + fl.h;
            const flBottom     = fl.y;
            const overlapY     = Math.min(playerTop - flBottom, flTop - playerBottom);
            const overlapX     = Math.min((px + PW) - fl.x, (fl.x + fl.w) - px);
            if (overlapY < overlapX) {
                if (vy <= 0 && playerBottom < flTop && playerTop > flTop - 0.5) {
                    py = flTop;
                    if (vy < -200 && !onGround) landAnim = 0.22;
                    vy = 0;
                    onGround = true;
                    standingOn = fl;
                } else if (!fl.oneWay && vy > 0 && playerTop > flBottom && playerBottom < flBottom) {
                    py = flBottom - PH;
                    vy = -200;
                }
            } else if (!fl.oneWay) {
                px = px + PW / 2 < fl.x + fl.w / 2 ? fl.x - PW : fl.x + fl.w;
                vx = 0;
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

        let dead = false;
        for (const lv of lvl.lavas)   { if (!lv.ghost && hit(px, py, PW, PH, lv.x, lv.y, lv.w, lv.h)) { dead = true; break; } }
        if (!dead) for (const en of lvl.enemies) { if (!en.ghost && hit(px, py, PW, PH, en.x, en.y, en.w, en.h)) { dead = true; break; } }
        if (dead) {
            const cp = getCurrentCheckpoint();
            restoreFromCheckpoint(cp);
            vx = 0; vy = 0; onGround = false;
            portalCooldownTimer = 0;
            snapCam = true;
            for (const en  of lvl.enemies) en.x = en.startX;
            for (const orb of lvl.orbs)    orb.actTimer = 0;
        }

        if (hit(px, py, PW, PH, lvl.flagX, lvl.flagY, FLAG_W, FLAG_H)) loadLvl(lvlIdx + 1);

        if (jumpAnim > 0) jumpAnim -= dt;
        if (landAnim > 0) landAnim -= dt;

        updateCam();
    }

    const COL = {
        floor: '#9b9b9c', wall: '#9b9b9c', lava: '#fc9312',
        tramp: '#1264fc', enemy: '#fc1212',
        orbRing: '#eaecd1', orbCore: '#fce512',
        flagPole: '#ffad66', flagBody: '#ca0000',
        coin: '#ffd700', coinShine: '#fff8a0', coinShadow: '#b8860b',
        portalInner: 'rgba(120,60,255,0.35)',
        portalRim:   '#a855f7',
        portalGlow:  'rgba(168,85,247,0.55)',
    };

    function texFillRect(obj, x, y, w, h, fallbackCol, r = 0) {
        const cx = wx(x), cy = wy(y, h);
        if (obj.tex) {
            if (obj.textureMode === 'stretch') {
                if (r > 0) { ctx.save(); ctx.beginPath(); ctx.roundRect(cx, cy, w, h, r); ctx.clip(); }
                ctx.drawImage(obj.tex.img, cx, cy, w, h);
                if (r > 0) ctx.restore();
            } else if (obj.textureMode === 'cover') {
                const imgW = obj.tex.img.naturalWidth, imgH = obj.tex.img.naturalHeight;
                const scale = Math.max(w / imgW, h / imgH);
                const dw = imgW * scale, dh = imgH * scale;
                const dx = cx + (w - dw) / 2, dy = cy + (h - dh) / 2;
                ctx.save();
                ctx.beginPath();
                if (r > 0) ctx.roundRect(cx, cy, w, h, r); else ctx.rect(cx, cy, w, h);
                ctx.clip();
                ctx.drawImage(obj.tex.img, dx, dy, dw, dh);
                ctx.restore();
            } else {
                const m = new DOMMatrix();
                m.translateSelf(cx, cy);
                obj.tex.pat.setTransform(m);
                ctx.fillStyle = obj.tex.pat;
                if (r > 0) { ctx.beginPath(); ctx.roundRect(cx, cy, w, h, r); ctx.fill(); }
                else       { ctx.fillRect(cx, cy, w, h); }
            }
        } else {
            ctx.fillStyle = fallbackCol;
            if (r > 0) { ctx.beginPath(); ctx.roundRect(cx, cy, w, h, r); ctx.fill(); }
            else       { ctx.fillRect(cx, cy, w, h); }
        }
    }

    function ghostFillRect(obj, x, y, w, h, fallbackCol, r = 0) {
        if (!obj.ghost) { texFillRect(obj, x, y, w, h, fallbackCol, r); return; }
        ctx.save();
        if (!obj.tex) ctx.globalAlpha = 0.25;
        texFillRect(obj, x, y, w, h, fallbackCol, r);
        if (!obj.tex) {
            ctx.globalAlpha = 0.55;
            ctx.strokeStyle = fallbackCol;
            ctx.lineWidth   = 2;
            ctx.setLineDash([6, 4]);
            const cx = wx(x), cy = wy(y, h);
            if (r > 0) { ctx.beginPath(); ctx.roundRect(cx, cy, w, h, r); ctx.stroke(); }
            else       { ctx.strokeRect(cx, cy, w, h); }
        }
        ctx.restore();
    }

    function drawBg() {
        const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, '#0f0f23');
        g.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(155,155,156,0.06)';
        ctx.lineWidth = 1;
        const gs = 80, ox = camX % gs, oy = camY % gs;
        for (let x = -ox; x < canvas.width;  x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
        for (let y = -oy; y < canvas.height; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    }

    function drawPortal(portal) {
        const cx = wx(portal.x);
        const cy = wy(portal.y, portal.h);
        const w  = portal.w;
        const h  = portal.h;

        if (portal.tex) {
            ctx.save();
            if (portal.textureMode === 'stretch') {
                ctx.drawImage(portal.tex.img, cx, cy, w, h);
            } else if (portal.textureMode === 'cover') {
                const imgW = portal.tex.img.naturalWidth, imgH = portal.tex.img.naturalHeight;
                const scale = Math.max(w / imgW, h / imgH);
                const dw = imgW * scale, dh = imgH * scale;
                ctx.save();
                ctx.beginPath(); ctx.rect(cx, cy, w, h); ctx.clip();
                ctx.drawImage(portal.tex.img, cx + (w - dw) / 2, cy + (h - dh) / 2, dw, dh);
                ctx.restore();
            } else {
                const m = new DOMMatrix();
                m.translateSelf(cx, cy);
                portal.tex.pat.setTransform(m);
                ctx.fillStyle = portal.tex.pat;
                ctx.fillRect(cx, cy, w, h);
            }
            ctx.restore();
            return;
        }

        const t  = performance.now() / 1000;
        const pulse = 0.7 + 0.3 * Math.sin(t * 3 + (portal.portalId || 0) * 1.7);

        ctx.save();
        ctx.shadowColor = COL.portalGlow;
        ctx.shadowBlur  = 18 * pulse;

        ctx.strokeStyle = COL.portalRim;
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.roundRect(cx, cy, w, h, 6);
        ctx.stroke();

        ctx.shadowBlur = 0;

        const numBands = 6;
        for (let i = 0; i < numBands; i++) {
            const frac   = (i / numBands + t * 0.4) % 1;
            const alpha  = (1 - frac) * 0.18 * pulse;
            const inset  = frac * Math.min(w, h) * 0.38;
            ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
            ctx.lineWidth   = 1.5;
            ctx.beginPath();
            ctx.roundRect(cx + inset, cy + inset, Math.max(2, w - inset * 2), Math.max(2, h - inset * 2), Math.max(1, 6 - inset * 0.1));
            ctx.stroke();
        }

        ctx.fillStyle = COL.portalInner;
        ctx.beginPath();
        ctx.roundRect(cx, cy, w, h, 6);
        ctx.fill();

        ctx.restore();
    }

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
        ctx.lineTo(fx + 4,  fy + 26);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.arc(fx + 2, fy, 5, 0, Math.PI * 2);
        ctx.fillStyle = poleCol;
        ctx.fill();
        ctx.restore();
    }

    function drawFlag() {
        const fx = wx(lvl.flagX), fy = wy(lvl.flagY, FLAG_H);
        ctx.fillStyle = COL.flagPole;
        ctx.fillRect(fx, fy, 4, FLAG_H);
        ctx.fillStyle = COL.flagBody;
        ctx.beginPath();
        ctx.moveTo(fx + 4, fy);
        ctx.lineTo(fx + 36, fy + 16);
        ctx.lineTo(fx + 4,  fy + 32);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.arc(fx + 2, fy, 5, 0, Math.PI * 2);
        ctx.fillStyle = COL.flagPole;
        ctx.fill();
    }

    function drawText(t) {
        if (!t.segments || t.segments.length === 0) return;
        ctx.save();
        if (t.ghost) ctx.globalAlpha = 0.3;
        ctx.textBaseline = 'middle';
        ctx.textAlign    = 'left';
        ctx.shadowBlur   = 0;
        const sizeMatch = t.baseFont.match(/(\d+)px/);
        const basePx    = sizeMatch ? parseInt(sizeMatch[1]) : 20;
        const fontRest  = t.baseFont.replace(/(?:bold\s*)?\d+px/, '').trim();
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
            ctx.font      = segFont(seg.bold);
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
        const cy = wy(co.y, co.r * 2) + co.r + bob;
        ctx.save();
        if (co.ghost) ctx.globalAlpha = 0.3;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
        ctx.shadowBlur  = 10;
        const g = ctx.createRadialGradient(cx - co.r * 0.3, cy - co.r * 0.3, 0, cx, cy, co.r);
        g.addColorStop(0,   COL.coinShine);
        g.addColorStop(0.4, COL.coin);
        g.addColorStop(1,   COL.coinShadow);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, co.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur  = 0;
        ctx.strokeStyle = COL.coinShadow;
        ctx.lineWidth   = 1.5;
        if (co.ghost) ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(cx, cy, co.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle    = COL.coinShadow;
        ctx.font         = `bold ${Math.round(co.r * 1.1)}px sans-serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', cx, cy + 1);
        ctx.restore();
    }

    function drawCoinPopups() {
        for (const popup of coinPopups) {
            ctx.save();
            ctx.globalAlpha  = popup.life / popup.maxLife;
            ctx.fillStyle    = COL.coin;
            ctx.font         = 'bold 20px sans-serif';
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+1', popup.x, popup.y);
            ctx.restore();
        }
    }

    function drawDescription() {
        if (descTimer <= 0 || !lvl || !lvl.description) return;
        const alpha = Math.min(1, descTimer / 0.5) * Math.min(1, descTimer / 1.0);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle   = 'rgba(0,0,0,0.55)';
        const padding = 18;
        ctx.font = '18px sans-serif';
        const textW = ctx.measureText(lvl.description).width;
        const boxW  = textW + padding * 2;
        const boxH  = 48;
        const bx    = canvas.width / 2 - boxW / 2;
        const by    = canvas.height * 0.72;
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 10);
        ctx.fill();
        ctx.fillStyle    = '#e0e0e0';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lvl.description, canvas.width / 2, by + boxH / 2);
        ctx.restore();
    }

    function drawDebug(dt) {
        if (!debugVisible || !lvl) return;

        fpsAccum  += dt;
        fpsFrames += 1;
        if (fpsAccum >= 0.25) {
            fps       = Math.round(fpsFrames / fpsAccum);
            fpsAccum  = 0;
            fpsFrames = 0;
        }

        ctx.save();
        ctx.lineWidth = 1.5;

        ctx.strokeStyle = 'rgba(0,255,0,0.9)';
        ctx.strokeRect(wx(px), wy(py, PH), PW, PH);

        ctx.strokeStyle = 'rgba(80,160,255,0.55)';
        for (const f of lvl.floors) { if (!f.ghost) ctx.strokeRect(wx(f.x), wy(f.y, f.h), f.w, f.h); }

        ctx.strokeStyle = 'rgba(80,160,255,0.55)';
        for (const w of lvl.walls) { if (!w.ghost) ctx.strokeRect(wx(w.x), wy(w.y, w.h), w.w, w.h); }

        ctx.strokeStyle = 'rgba(100,200,255,0.7)';
        for (const mp of lvl.mpUp)    ctx.strokeRect(wx(mp.x),  wy(mp.cy, mp.h), mp.w, mp.h);
        for (const mp of lvl.mpRight) ctx.strokeRect(wx(mp.cx), wy(mp.y,  mp.h), mp.w, mp.h);

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

        ctx.strokeStyle = 'rgba(80,160,255,0.7)';
        for (const cp of lvl.checkpoints) {
            ctx.strokeRect(wx(cp.x), wy(cp.y, FLAG_H), FLAG_W, FLAG_H);
        }

        ctx.strokeStyle = 'rgba(80,160,255,0.8)';
        ctx.strokeRect(wx(lvl.flagX), wy(lvl.flagY, FLAG_H), FLAG_W, FLAG_H);

        ctx.strokeStyle = 'rgba(255,80,80,0.8)';
        for (const lv of lvl.lavas) { if (!lv.ghost) ctx.strokeRect(wx(lv.x), wy(lv.y, lv.h), lv.w, lv.h); }

        ctx.strokeStyle = 'rgba(255,50,50,0.9)';
        for (const en of lvl.enemies) { if (!en.ghost) ctx.strokeRect(wx(en.x), wy(en.y, en.h), en.w, en.h); }

        ctx.strokeStyle = 'rgba(200,100,255,0.9)';
        for (const pt of lvl.portals) ctx.strokeRect(wx(pt.x), wy(pt.y, pt.h), pt.w, pt.h);

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
                ? `standing on: ${standingOn.type}` + (standingOn.type !== 'world_floor' ? `  @ x:${(standingOn.x||0).toFixed(0)} y:${(standingOn.y||0).toFixed(0)}` : '')
                : 'standing on: (air)',
            `level: ${lvlIdx}  phase: ${phase}`,
            `elapsed: ${elapsed.toFixed(2)}s`,
            `portalCooldown: ${portalCooldownTimer.toFixed(2)}s`,
            `checkpoints: ${checkpointHistory.length}`,
        ];

        const lh = 18, pad = 10;
        const panelW = 300, panelH = lines.length * lh + pad * 2;
        const bx = 8, by = 52;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.62)';
        ctx.beginPath();
        ctx.roundRect(bx, by, panelW, panelH, 8);
        ctx.fill();
        ctx.font         = '13px monospace';
        ctx.textAlign    = 'left';
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
        ctx.shadowBlur  = 8;
        ctx.translate(-PW / 2, -PH / 2);
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary-normal').trim() || '#ffffff';
        ctx.fillStyle = bgColor;
        ctx.fill(PLAYER_PATH);
        ctx.restore();
    }

    function drawOrb(orb) {
        const cx   = wx(orb.x);
        const cy   = wy(orb.y, orb.r * 2) + orb.r;
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
                const size  = orb.r * 2;
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
            g.addColorStop(0,   glow ? 'rgba(255,240,0,1)'   : COL.orbCore);
            g.addColorStop(0.5, glow ? 'rgba(255,180,0,0.8)' : 'rgba(252,229,18,0.6)');
            g.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(cx, cy, orb.r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = COL.orbRing; ctx.lineWidth = 2;
        if (orb.ghost) ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.arc(cx, cy, orb.r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }

    function drawEnemy(en) {
        ctx.save();
        if (en.ghost) { ctx.globalAlpha = 0.25; ctx.setLineDash([6,4]); }
        if (en.tex) {
            const ex = wx(en.x), ey = wy(en.y, en.h);
            ctx.save();
            ctx.beginPath(); ctx.roundRect(ex, ey, en.w, en.h, 6); ctx.clip();
            if (en.textureMode === 'stretch') {
                ctx.drawImage(en.tex.img, ex, ey, en.w, en.h);
            } else if (en.textureMode === 'cover') {
                const imgW = en.tex.img.naturalWidth, imgH = en.tex.img.naturalHeight;
                const scale = Math.max(en.w / imgW, en.h / imgH);
                const dw = imgW * scale, dh = imgH * scale;
                ctx.drawImage(en.tex.img, ex + (en.w - dw) / 2, ey + (en.h - dh) / 2, dw, dh);
            } else {
                const m = new DOMMatrix();
                m.translateSelf(ex, ey);
                en.tex.pat.setTransform(m);
                ctx.fillStyle = en.tex.pat;
                ctx.fill();
            }
            ctx.restore();
        } else {
            texFillRect(en, en.x, en.y, en.w, en.h, COL.enemy, 6);
        }
        if (en.ghost) {
            ctx.globalAlpha = 0.55;
            ctx.strokeStyle = COL.enemy; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(wx(en.x), wy(en.y, en.h), en.w, en.h, 6); ctx.stroke();
        }
        ctx.globalAlpha  = en.ghost ? 0.35 : 1;
        ctx.fillStyle    = '#fff';
        ctx.font         = 'bold 15px sans-serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(en.label, wx(en.x + en.w / 2), wy(en.y, en.h) + en.h / 2);
        ctx.restore();
    }

    const btns = [];
    function drawBtn(x, y, w, h, label, col, cb, disabled = false) {
        ctx.save();
        const hov = !disabled && mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
        ctx.fillStyle = disabled ? '#2a2a2a' : (hov ? darken(col) : col);
        ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill();
        ctx.fillStyle    = disabled ? '#555' : '#fff';
        ctx.font         = 'bold 20px sans-serif';
        ctx.textAlign    = 'center';
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
    canvas.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    canvas.addEventListener('click', e => {
        for (const b of btns) {
            if (e.clientX >= b.x && e.clientX <= b.x + b.w && e.clientY >= b.y && e.clientY <= b.y + b.h) {
                b.cb(); return;
            }
        }
    });
    canvas.addEventListener('touchend', e => {
        const touch = e.changedTouches[0];
        if (!touch) return;
        for (const b of btns) {
            if (touch.clientX >= b.x && touch.clientX <= b.x + b.w && touch.clientY >= b.y && touch.clientY <= b.y + b.h) {
                b.cb(); return;
            }
        }
    });

    function drawPauseScreen() {
        ctx.save();
        ctx.shadowBlur  = 0;
        ctx.shadowColor = 'transparent';

        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const panelW = 360, panelH = 390;
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

        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle    = '#ffffff';
        ctx.font         = 'bold 32px sans-serif';
        ctx.fillText('Pauze', canvas.width / 2, py2 + 46);

        const bw = 300, bh = 52, bx = canvas.width / 2 - bw / 2;
        const gap = 14;

        drawBtn(bx, py2 + 84,               bw, bh, '▶  Doorgaan',          '#3f8541', () => { phase = 'playing'; timing = true; if (musicAudio) musicAudio.play().catch(() => {}); });
        drawBtn(bx, py2 + 84 + (bh + gap),  bw, bh, '↺  Herstarten bij checkpoint', '#1264fc',
            () => {
                const cp = getCurrentCheckpoint();
                restoreFromCheckpoint(cp);
                vx = 0; vy = 0; onGround = false;
                for (const en  of lvl.enemies) en.x = en.startX;
                for (const orb of lvl.orbs)    orb.actTimer = 0;
                portalCooldownTimer = 0;
                snapCam = true;
                phase = 'playing'; timing = true;
                if (musicAudio) musicAudio.play().catch(() => {});
            }
        );

        const hasUndo = checkpointHistory.length > 0;
        const undoLabel = '↩  Verwijder checkpoint';
        drawBtn(bx, py2 + 84 + (bh + gap) * 2, bw, bh, undoLabel, hasUndo ? '#7c3aed' : '#333',
            () => {
                if (!hasUndo) return;
                checkpointHistory.pop();
                for (const cp of lvl.checkpoints) {
                    cp.activated = checkpointHistory.some(h => h.x === cp.x && h.y === cp.y);
                }
                const cp = getCurrentCheckpoint();
                restoreFromCheckpoint(cp);
                vx = 0; vy = 0; onGround = false;
                for (const en  of lvl.enemies) en.x = en.startX;
                for (const orb of lvl.orbs)    orb.actTimer = 0;
                portalCooldownTimer = 0;
                snapCam = true;
                phase = 'playing'; timing = true;
                if (musicAudio) musicAudio.play().catch(() => {});
            },
            !hasUndo
        );

        drawBtn(bx, py2 + 84 + (bh + gap) * 3, bw, bh, '✕  Sluiten', '#555', () => endGame());

        ctx.fillStyle    = 'rgba(155,155,156,0.5)';
        ctx.font         = '13px sans-serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        if (isMobile()) {
            ctx.fillText('Tik buiten dit venster om door te gaan', canvas.width / 2, py2 + panelH - 18);
        } else {
            ctx.fillText('ESC om door te gaan', canvas.width / 2, py2 + panelH - 18);
        }

        ctx.restore();
    }

    function drawWinScreen() {
        ctx.save();
        ctx.shadowBlur  = 0;
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fce512';
        ctx.font      = 'bold 56px sans-serif';
        ctx.fillText('🎉 Voltooid! 🎉', canvas.width / 2, canvas.height / 2 - 90);
        ctx.fillStyle = '#9b9b9c';
        ctx.font      = '30px sans-serif';
        ctx.fillText(`Tijd: ${elapsed.toFixed(1)}s`, canvas.width / 2, canvas.height / 2 - 30);
        const rec = get('platformer-gamerecord');
        if (!n(rec)) ctx.fillText(`Record: ${parseFloat(rec).toFixed(1)}s`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillStyle = COL.coin;
        ctx.font      = 'bold 28px sans-serif';
        const totalPossible = levels.reduce((sum, l) => sum + countLevelCoins(l), 0);
        ctx.fillText(`🪙 Munten: ${sessionCoins} / ${totalPossible}`, canvas.width / 2, canvas.height / 2 + 68);
        const bw = 300, bh = 54, bx = canvas.width / 2 - bw / 2;
        drawBtn(bx, canvas.height / 2 + 110, bw, bh, lvl?.playAgainText || 'Opnieuw spelen', '#3f8541', () => { elapsed = 0; timing = true; sessionCoins = 0; sessionTotalCoins = 0; loadLvl(0); });
        drawBtn(bx, canvas.height / 2 + 180, bw, bh, lvl?.closeGameText || 'Sluiten', '#555', () => endGame());
        ctx.restore();
    }

    function drawHUD() {
        const rec = get('platformer-gamerecord');
        let txt = `Tijd: ${elapsed.toFixed(0)}s`;
        if (!n(rec)) txt += `, record: ${parseFloat(rec).toFixed(0)}s`;
        id('mod-playtime').textContent = txt;
        const totalPossible = levels.reduce((sum, l) => sum + countLevelCoins(l), 0);
        id('mod-coins-hud').textContent = totalPossible > 0 ? `🪙 ${sessionCoins}` : '';
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

        for (const o of lvl.drawOrder) {
            if      (o.type === 'floor')       ghostFillRect(o, o.x,  o.y,  o.w, o.h, COL.floor);
            else if (o.type === 'wall')        ghostFillRect(o, o.x,  o.y,  o.w, o.h, COL.wall);
            else if (o.type === 'lava')        ghostFillRect(o, o.x,  o.y,  o.w, o.h, COL.lava);
            else if (o.type === 'trampoline')  ghostFillRect(o, o.x,  o.y,  o.w, o.h, COL.tramp, 8);
            else if (o.type === 'mpUp')        ghostFillRect(o, o.x,  o.cy, o.w, o.h, COL.floor);
            else if (o.type === 'mpRight')     ghostFillRect(o, o.cx, o.y,  o.w, o.h, COL.floor);
            else if (o.type === 'enemy')       drawEnemy(o);
            else if (o.type === 'orb')         drawOrb(o);
            else if (o.type === 'coin')        drawCoin(o);
            else if (o.type === 'checkpoint')  drawCheckpoint(o);
            else if (o.type === 'text')        drawText(o);
            else if (o.type === 'portal')      drawPortal(o);
        }
        drawFlag();
        drawPlayer();
        drawCoinPopups();

        ctx.restore();

        drawHUD();
        drawDescription();
        if (phase === 'paused') drawPauseScreen();
        if (phase === 'win')    drawWinScreen();

        drawDebug(dt);
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

    elapsed = 0; timing = true; sessionCoins = 0; sessionTotalCoins = 0;
    loadLvl(0);
    requestAnimationFrame(loop);

    function getAudioUrl(file) {
        if (isExtension) {
            return chrome.runtime.getURL('sounds/' + file + '.mp3');
        } else {
            return 'https://geweldige-geluidseffecten.netlify.app/' + file + '.mp3';
        }
    }
}