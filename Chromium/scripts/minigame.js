// MINIGAMES
// A minigame on the error page
function errorPage() {
    if (!n(tn('hmy-button', 0))) {
        tn('hmy-button', 0).insertAdjacentHTML('afterend', '<a id="mod-play-game">Of speel een game</a>');
        id('mod-play-game').addEventListener('click', async function () {
            tn('body', 0).classList.add('mod-game-playing');

            tn('body', 0).insertAdjacentHTML('beforeend', `
<div id="mod-game">
  <canvas id="mod-canvas"></canvas>
  <div id="mod-hud">
    <span id="mod-playtime"></span>
    <span id="mod-level-title"></span>
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
                return ('ontouchstart' in window) || window.innerWidth < 700;
            }
            function updateMobileVis() {
                id('mod-mobile-controls').style.display = isMobile() ? 'flex' : 'none';
            }
            updateMobileVis();
            window.addEventListener('resize', updateMobileVis);

            let currentAudio = null;
            function playLevelMusic(src) {
                if (currentAudio) { currentAudio.pause(); currentAudio = null; }
                if (!src) return;
                try {
                    currentAudio = new Audio(chrome.runtime.getURL(src));
                    currentAudio.loop   = true;
                    currentAudio.volume = 0.5;
                    currentAudio.play().catch(() => {});
                } catch(e) {}
            }
            function stopMusic() {
                if (currentAudio) { currentAudio.pause(); currentAudio = null; }
            }

            const textureCache = {};
            async function loadTexture(src) {
                if (!src) return null;
                if (textureCache[src]) return textureCache[src];
                return new Promise(resolve => {
                    const img = new Image();
                    img.onload = () => {
                        const pat = ctx.createPattern(img, 'repeat');
                        textureCache[src] = pat;
                        resolve(pat);
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
                    description: descEl ? descEl.textContent   : '',
                    song:        el.getAttribute('song')       || null,
                    worldWidth:  parseFloat(el.getAttribute('worldWidth'))  || 3000,
                    worldHeight: parseFloat(el.getAttribute('worldHeight')) || 1400,
                    spawnX:      parseFloat(el.getAttribute('spawnX'))      || 60,
                    spawnY:      parseFloat(el.getAttribute('spawnY'))      || 120,
                    flagX:       parseFloat(el.getAttribute('flagX'))       || 2900,
                    flagY:       parseFloat(el.getAttribute('flagY'))       || 120,
                    floors:      [], walls:   [], lavas:    [],
                    trampolines: [], enemies: [], orbs:     [],
                    mpUp:        [], mpRight: [],
                    playAgainText: 'Opnieuw spelen',
                    closeGameText: 'Sluiten',
                };
                for (const c of el.children) {
                    const tag     = c.tagName;
                    if (tag === 'description') continue;
                    const x       = parseFloat(c.getAttribute('x'))       || 0;
                    const y       = parseFloat(c.getAttribute('y'))       || 0;
                    const w       = parseFloat(c.getAttribute('width'))    || 100;
                    const h       = parseFloat(c.getAttribute('height'))   || 20;
                    const ghost   = c.getAttribute('ghost')   === 'true';
                    const texture = c.getAttribute('texture') || null;
                    if (tag === 'floor')      lvl.floors.push({ x, y, w, h, ghost, texture, pat: null });
                    else if (tag === 'wall')  lvl.walls.push({ x, y, w, h, ghost, texture, pat: null });
                    else if (tag === 'lava')  lvl.lavas.push({ x, y, w, h, ghost, texture, pat: null });
                    else if (tag === 'trampoline') lvl.trampolines.push({ x, y, w, h, ghost, texture, pat: null, strength: parseFloat(c.getAttribute('strength')) || 2.5 });
                    else if (tag === 'enemy') {
                        const mn = c.getAttribute('min') !== null ? parseFloat(c.getAttribute('min')) : null;
                        const mx = c.getAttribute('max') !== null ? parseFloat(c.getAttribute('max')) : null;
                        const n1 = Math.floor(Math.random() * 5) + 1;
                        let   n2 = Math.floor(Math.random() * 10);
                        if (n1 === 5 && n2 >= 5) n2 = 4;
                        lvl.enemies.push({ x, y, w: 50, h: 50, startX: x, min: mn, max: mx, label: `${n1},${n2}`, ghost, texture, pat: null });
                    }
                    else if (tag === 'orb') lvl.orbs.push({ x, y, r: 20, strength: parseFloat(c.getAttribute('strength')) || 2.5, actTimer: 0, ghost, texture, pat: null });
                    else if (tag === 'movingPlatformUp') {
                        const sy = parseFloat(c.getAttribute('startY')) || y;
                        const ey = parseFloat(c.getAttribute('endY'))   || y + 300;
                        lvl.mpUp.push({ x, w, h, startY: sy, endY: ey, cy: sy, dir: 1, ghost, texture, pat: null });
                    }
                    else if (tag === 'movingPlatformRight') {
                        const sx = parseFloat(c.getAttribute('startX')) || x;
                        const ex = parseFloat(c.getAttribute('endX'))   || x + 300;
                        lvl.mpRight.push({ y, w, h, startX: sx, endX: ex, cx: sx, dir: 1, ghost, texture, pat: null });
                    }
                    else if (tag === 'playAgainButton') lvl.playAgainText = c.textContent || lvl.playAgainText;
                    else if (tag === 'closeGameButton') lvl.closeGameText = c.textContent || lvl.closeGameText;
                }
                return lvl;
            }

            async function loadLevelTextures(lvl) {
                const all = [...lvl.floors, ...lvl.walls, ...lvl.lavas, ...lvl.trampolines,
                             ...lvl.enemies, ...lvl.orbs, ...lvl.mpUp, ...lvl.mpRight];
                await Promise.all(all.map(async obj => {
                    if (obj.texture) obj.pat = await loadTexture(obj.texture);
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
            const GRAV      = 1800;
            const JUMP_V    = 620;
            const SPEED     = 300;
            const MAX_FALL  = -1400;
            const FLAG_W    = 14, FLAG_H = 80;

            let lvl        = null;
            let lvlIdx     = 0;
            let px, py, vx = 0, vy = 0;
            let onGround   = false;
            let phase      = 'playing';
            let camX = 0, camY = 0;
            let elapsed    = 0;
            let timing     = false;
            let jumpQ      = false;
            let jumpAnim   = 0, landAnim = 0;
            let gameAlive  = true;
            const KEY = {};

            let mLeft = false, mRight = false, mJump = false;

            document.addEventListener('keydown', e => {
                if (['ArrowDown','ArrowUp','Space'].includes(e.code)) e.preventDefault();
                KEY[e.code] = true;
                if (['ArrowUp','KeyW','Space'].includes(e.code)) jumpQ = true;
            });
            document.addEventListener('keyup', e => { KEY[e.code] = false; });

            function mBtn(btnId, onD, onU) {
                const b = id(btnId); if (!b) return;
                ['touchstart','mousedown'].forEach(ev => b.addEventListener(ev, e => { e.preventDefault(); onD(); }));
                ['touchend','mouseup','touchcancel','mouseleave'].forEach(ev => b.addEventListener(ev, e => { e.preventDefault(); onU(); }));
            }
            mBtn('mod-btn-left',  () => mLeft  = true,                    () => mLeft  = false);
            mBtn('mod-btn-right', () => mRight = true,                    () => mRight = false);
            mBtn('mod-btn-jump',  () => { mJump = true; jumpQ = true; },  () => mJump  = false);

            id('mod-close-button').addEventListener('click', endGame);

            function hit(ax, ay, aw, ah, bx, by, bw, bh) {
                return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
            }

            function loadLvl(idx) {
                if (idx >= levels.length) { winGame(); return; }
                lvlIdx = idx;
                lvl    = levels[idx];
                for (const mp of lvl.mpUp)    { mp.cy = mp.startY; mp.dir = 1; }
                for (const mp of lvl.mpRight) { mp.cx = mp.startX; mp.dir = 1; }
                for (const orb of lvl.orbs)   { orb.actTimer = 0; }
                for (const en  of lvl.enemies){ en.x = en.startX; }
                px = lvl.spawnX; py = lvl.spawnY;
                vx = 0; vy = 0; onGround = false;
                phase = 'playing';
                jumpAnim = 0; landAnim = 0;
                camX = Math.max(0, px - canvas.width / 2);
                camY = Math.max(0, lvl.worldHeight - py - canvas.height / 2);
                id('mod-level-title').textContent = lvl.title;
                playLevelMusic(lvl.song);
            }

            function winGame() {
                phase = 'win';
                timing = false;
                stopMusic();
                const prev = get('gamerecord');
                if (n(prev) || elapsed < parseFloat(prev)) set('gamerecord', elapsed.toFixed(1));
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
                camX += (tx - camX) * 0.1;
                camY += (ty - camY) * 0.1;
                camX = Math.max(0, Math.min(camX, lvl.worldWidth  - canvas.width));
                camY = Math.max(0, Math.min(camY, lvl.worldHeight - canvas.height));
            }

            function wx(x) { return x - camX; }
            function wy(y, h) { return lvl.worldHeight - y - h - camY; }

            function update(dt) {
                if (phase !== 'playing') return;

                const goLeft  = mLeft  || KEY['ArrowLeft']  || KEY['KeyA'];
                const goRight = mRight || KEY['ArrowRight'] || KEY['KeyD'];

                if (goRight && !goLeft)       vx =  SPEED;
                else if (goLeft && !goRight)  vx = -SPEED;
                else                          vx =  0;

                if (!onGround) {
                    vy -= GRAV * dt;
                    if (vy < MAX_FALL) vy = MAX_FALL;
                }

                const jumpHeld = mJump || KEY['ArrowUp'] || KEY['KeyW'] || KEY['Space'];
                const wantJump = jumpQ || (jumpHeld && onGround);

                if (wantJump) {
                    let orbHit = false;
                    for (const orb of lvl.orbs) {
                        if (orb.ghost) continue;
                        if (orb.actTimer <= 0 && hit(px, py, PW, PH, orb.x - orb.r, orb.y - orb.r, orb.r * 2, orb.r * 2)) {
                            vy = orb.strength * 370;
                            onGround = false;
                            orb.actTimer = 0.18;
                            jumpAnim = 0.3;
                            orbHit = true;
                            break;
                        }
                    }
                    if (!orbHit && onGround) {
                        vy = JUMP_V;
                        onGround = false;
                        jumpAnim = 0.3;
                    }
                    jumpQ = false;
                }

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

                if (py < 0) { py = 0; if (vy < -200 && !onGround) landAnim = 0.22; vy = 0; onGround = true; }

                const solids = [
                    ...lvl.floors.filter(f => !f.ghost),
                    ...lvl.mpUp.filter(mp => !mp.ghost).map(mp => ({ x: mp.x, y: mp.cy, w: mp.w, h: mp.h })),
                    ...lvl.mpRight.filter(mp => !mp.ghost).map(mp => ({ x: mp.cx, y: mp.y, w: mp.w, h: mp.h })),
                ];
                onGround = (py === 0);
                for (const fl of solids) {
                    if (!hit(px, py, PW, PH, fl.x, fl.y, fl.w, fl.h)) continue;
                    const playerBottom = py;
                    const playerTop    = py + PH;
                    const flTop        = fl.y + fl.h;
                    const flBottom     = fl.y;
                    const overlapY     = Math.min(playerTop - flBottom, flTop - playerBottom);
                    const overlapX     = Math.min((px + PW) - fl.x, (fl.x + fl.w) - px);
                    if (overlapY < overlapX) {
                        if (vy <= 0 && playerBottom < flTop && playerTop > flTop) {
                            py = flTop;
                            if (vy < -200 && !onGround) landAnim = 0.22;
                            vy = 0;
                            onGround = true;
                        } else if (vy > 0 && playerTop > flBottom && playerBottom < flBottom) {
                            py = flBottom - PH;
                            vy = -200;
                        }
                    }
                }

                if (py + PH > lvl.worldHeight) { py = lvl.worldHeight - PH; vy = 0; }

                let dead = false;
                for (const lv of lvl.lavas)   { if (!lv.ghost && hit(px, py, PW, PH, lv.x, lv.y, lv.w, lv.h)) { dead = true; break; } }
                if (!dead) for (const en of lvl.enemies) { if (!en.ghost && hit(px, py, PW, PH, en.x, en.y, en.w, en.h)) { dead = true; break; } }
                if (dead) {
                    px = lvl.spawnX; py = lvl.spawnY;
                    vx = 0; vy = 0; onGround = false;
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
            };

            function resolveFill(obj, fallbackCol) {
                return (obj.pat) ? obj.pat : fallbackCol;
            }

            function applyTextureTransform(obj, x, y) {
                if (obj.pat) {
                    const m = new DOMMatrix();
                    m.translateSelf(wx(x), wy(y, obj.h ?? 0));
                    obj.pat.setTransform(m);
                }
            }

            function fillRect(x, y, w, h, col, r = 0) {
                ctx.fillStyle = col;
                if (r > 0) {
                    ctx.beginPath(); ctx.roundRect(wx(x), wy(y, h), w, h, r); ctx.fill();
                } else {
                    ctx.fillRect(wx(x), wy(y, h), w, h);
                }
            }

            function texFillRect(obj, x, y, w, h, fallbackCol, r = 0) {
                if (obj.pat) applyTextureTransform(obj, x, y);
                ctx.fillStyle = resolveFill(obj, fallbackCol);
                const cx = wx(x), cy = wy(y, h);
                if (r > 0) {
                    ctx.beginPath(); ctx.roundRect(cx, cy, w, h, r); ctx.fill();
                } else {
                    ctx.fillRect(cx, cy, w, h);
                }
            }

            function ghostFillRect(obj, x, y, w, h, fallbackCol, r = 0) {
                if (!obj.ghost) { texFillRect(obj, x, y, w, h, fallbackCol, r); return; }
                ctx.save();
                if (!obj.pat) ctx.globalAlpha = 0.25;
                texFillRect(obj, x, y, w, h, fallbackCol, r);
                if (!obj.pat) {
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

                const bgColor = getComputedStyle(document.documentElement)
                    .getPropertyValue('--bg-primary-normal').trim() || '#ffffff';
                ctx.fillStyle = bgColor;
                ctx.fill(PLAYER_PATH);
                ctx.restore();
            }

            function drawOrb(orb) {
                const cx = wx(orb.x);
                const cy = wy(orb.y, orb.r * 2) + orb.r;
                const glow = orb.actTimer > 0;
                ctx.save();
                if (orb.ghost) ctx.globalAlpha = 0.3;
                if (glow && !orb.ghost) { ctx.shadowColor = 'rgba(255,220,0,0.9)'; ctx.shadowBlur = 20; }
                if (orb.pat) {
                    const m = new DOMMatrix();
                    m.translateSelf(cx - orb.r, cy - orb.r);
                    orb.pat.setTransform(m);
                    ctx.fillStyle = orb.pat;
                } else {
                    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r);
                    g.addColorStop(0,   glow ? 'rgba(255,240,0,1)'   : COL.orbCore);
                    g.addColorStop(0.5, glow ? 'rgba(255,180,0,0.8)' : 'rgba(252,229,18,0.6)');
                    g.addColorStop(1,   'rgba(0,0,0,0)');
                    ctx.fillStyle = g;
                }
                ctx.beginPath(); ctx.arc(cx, cy, orb.r, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = COL.orbRing; ctx.lineWidth = 2;
                if (orb.ghost) ctx.setLineDash([4, 3]);
                ctx.beginPath(); ctx.arc(cx, cy, orb.r, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();
            }

            function drawEnemy(en) {
                ctx.save();
                if (en.ghost) { ctx.globalAlpha = 0.25; ctx.setLineDash([6,4]); }
                if (en.pat) {
                    const m = new DOMMatrix();
                    m.translateSelf(wx(en.x), wy(en.y, en.h));
                    en.pat.setTransform(m);
                    ctx.fillStyle = en.pat;
                    const cx = wx(en.x), cy = wy(en.y, en.h);
                    ctx.beginPath(); ctx.roundRect(cx, cy, en.w, en.h, 6); ctx.fill();
                } else {
                    fillRect(en.x, en.y, en.w, en.h, COL.enemy, 6);
                }
                if (en.ghost) {
                    ctx.globalAlpha = 0.55;
                    ctx.strokeStyle = COL.enemy; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.roundRect(wx(en.x), wy(en.y, en.h), en.w, en.h, 6); ctx.stroke();
                }
                ctx.globalAlpha = en.ghost ? 0.35 : 1;
                ctx.fillStyle   = '#fff';
                ctx.font        = 'bold 15px sans-serif';
                ctx.textAlign   = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(en.label, wx(en.x + en.w / 2), wy(en.y, en.h) + en.h / 2);
                ctx.restore();
            }

            const btns = [];
            function drawBtn(x, y, w, h, label, col, cb) {
                const hov = mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
                ctx.fillStyle = hov ? darken(col) : col;
                ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill();
                ctx.fillStyle   = '#fff';
                ctx.font        = 'bold 20px sans-serif';
                ctx.textAlign   = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, x + w / 2, y + h / 2);
                btns.push({ x, y, w, h, cb });
            }
            function darken(hex) {
                return hex === '#3f8541' ? '#145716' : '#333';
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

            function drawWinScreen() {
                ctx.fillStyle = 'rgba(0,0,0,0.72)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fce512';
                ctx.font      = 'bold 56px sans-serif';
                ctx.fillText('🎉 Voltooid! 🎉', canvas.width / 2, canvas.height / 2 - 70);
                ctx.fillStyle = '#9b9b9c';
                ctx.font      = '30px sans-serif';
                ctx.fillText(`Tijd: ${elapsed.toFixed(1)}s`, canvas.width / 2, canvas.height / 2 - 10);
                const rec = get('gamerecord');
                if (!n(rec)) ctx.fillText(`Record: ${parseFloat(rec).toFixed(1)}s`, canvas.width / 2, canvas.height / 2 + 40);
                const bw = 300, bh = 54, bx = canvas.width / 2 - bw / 2;
                drawBtn(bx, canvas.height / 2 + 100, bw, bh, lvl?.playAgainText || 'Opnieuw spelen', '#3f8541', () => { elapsed = 0; timing = true; loadLvl(0); });
                drawBtn(bx, canvas.height / 2 + 170, bw, bh, lvl?.closeGameText || 'Sluiten', '#555', () => endGame());
            }

            function drawHUD() {
                const rec = get('gamerecord');
                let txt = `Tijd: ${elapsed.toFixed(0)}s`;
                if (!n(rec)) txt += `, record: ${parseFloat(rec).toFixed(0)}s`;
                id('mod-playtime').textContent = txt;
            }

            function render() {
                btns.length = 0;
                if (!lvl) return;
                drawBg();
                for (const fl of lvl.floors)     ghostFillRect(fl,  fl.x,  fl.y,  fl.w, fl.h, COL.floor);
                for (const wl of lvl.walls)       ghostFillRect(wl,  wl.x,  wl.y,  wl.w, wl.h, COL.wall);
                for (const lv of lvl.lavas)       ghostFillRect(lv,  lv.x,  lv.y,  lv.w, lv.h, COL.lava);
                for (const tr of lvl.trampolines) ghostFillRect(tr,  tr.x,  tr.y,  tr.w, tr.h, COL.tramp, 8);
                for (const mp of lvl.mpUp)        ghostFillRect(mp,  mp.x,  mp.cy, mp.w, mp.h, COL.floor);
                for (const mp of lvl.mpRight)     ghostFillRect(mp,  mp.cx, mp.y,  mp.w, mp.h, COL.floor);
                for (const en of lvl.enemies)     drawEnemy(en);
                for (const orb of lvl.orbs)       drawOrb(orb);
                drawFlag();
                drawPlayer();
                drawHUD();
                if (phase === 'win') drawWinScreen();
            }

            let lastTs = null;
            function loop(ts) {
                if (!gameAlive) return;
                const dt = lastTs === null ? 0.016 : Math.min((ts - lastTs) / 1000, 0.05);
                lastTs = ts;
                if (timing && phase === 'playing') elapsed += dt;
                update(dt);
                render();
                requestAnimationFrame(loop);
            }

            elapsed = 0; timing = true;
            loadLvl(0);
            requestAnimationFrame(loop);
        });

        if (window.location.hash === '#mod-play') {
            id('mod-play-game').click();
            history.replaceState('', document.title, window.location.pathname + window.location.search);
        }
    }
}