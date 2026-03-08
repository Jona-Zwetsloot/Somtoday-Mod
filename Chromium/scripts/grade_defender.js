// MINIGAME
// grade defender minigame
function gradeDefenderGame() {
    if (id('grade-defender-canvas')) id('grade-defender-canvas').remove();
    if (id('grade-defender-ui')) id('grade-defender-ui').remove();
    if (id('grade-defender-close')) id('grade-defender-close').remove();
    if (id('grade-defender-gameover')) id('grade-defender-gameover').remove();
    if (id('grade-defender-shop')) id('grade-defender-shop').remove();
    if (id('grade-defender-shop-btn')) id('grade-defender-shop-btn').remove();

    const savedData = JSON.parse(get('gradeDefenderData') || '{"coins":0,"highScore":0,"unlockedWeapons":["basic"],"currentWeapon":"basic"}');

    tn('body', 0).insertAdjacentHTML('beforeend', `
        <canvas id="grade-defender-canvas" class="active"></canvas>
        <div id="grade-defender-ui" class="active">
            <div class="gd-stat">💰 <span id="gd-coins">${savedData.coins}</span></div>
            <div class="gd-stat">⭐ <span id="gd-score">0</span></div>
            <div class="gd-stat">❤️ <span id="gd-lives">5</span></div>
            <div class="gd-stat">🔥 <span id="gd-combo">0</span>x</div>
            <div class="gd-stat">🎯 <span id="gd-weapon">${savedData.currentWeapon}</span></div>
        </div>
        <div id="grade-defender-close" class="active">&times;</div>
        <button id="grade-defender-shop-btn" class="active">🛒 Winkel</button>
        <div id="grade-defender-shop">
            <h2>Wapenshop</h2>
            <div class="shop-items"></div>
            <button id="shop-close">Sluiten</button>
        </div>
        <div id="grade-defender-gameover">
            <h1>GAME OVER</h1>
            <h3>Score: <span id="gd-final-score"></span></h3>
            <h3>Munten Verdiend: <span id="gd-coins-earned"></span></h3>
            <h3>High Score: <span id="gd-high-score">${savedData.highScore}</span></h3>
            <div id="grade-defender-restart">Opnieuw Spelen</div>
        </div>
    `);

    const weapons = {
        basic: { name: 'Basis', cost: 0, damage: 1, speed: 10, cooldown: 200, color: '#0099ff' },
        rapid: { name: 'Snelvuur', cost: 100, damage: 1, speed: 12, cooldown: 100, color: '#ff9900' },
        laser: { name: 'Laser', cost: 250, damage: 3, speed: 15, cooldown: 300, color: '#ff0099' },
        nuke: { name: 'Kernbom', cost: 500, damage: 10, speed: 8, cooldown: 800, color: '#9900ff', splash: 100 },
        rainbow: { name: 'Regenboog', cost: 1000, damage: 5, speed: 20, cooldown: 50, color: 'rainbow', multishot: 3 }
    };

    const shopItems = id('grade-defender-shop').querySelector('.shop-items');
    Object.keys(weapons).forEach(key => {
        const w = weapons[key];
        const unlocked = savedData.unlockedWeapons.includes(key);
        shopItems.insertAdjacentHTML('beforeend', `
            <div class="shop-item ${unlocked ? 'unlocked' : ''}">
                <h4>${w.name}</h4>
                <p>💰 ${w.cost} | ⚡ SCH: ${w.damage} | 🚀 Snelheid: ${w.speed}</p>
                <button data-weapon="${key}" ${unlocked ? 'disabled' : ''}>${unlocked ? 'In bezit' : 'Kopen'}</button>
            </div>
        `);
    });

    const canvas = id('grade-defender-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let score = 0;
    let lives = 5;
    let coins = savedData.coins;
    let combo = 0;
    let gameRunning = true;
    let enemies = [];
    let projectiles = [];
    let particles = [];
    let powerups = [];
    let playerX = canvas.width / 2;
    let lastTime = 0;
    let spawnTimer = 0;
    let lastShot = 0;
    let currentWeapon = savedData.currentWeapon;
    let shake = 0;

    // Create player logo image
    const logoImg = new Image();
    // Use the logo function to get SVG and encode it for data URL
    const logoSvg = window.logo(null, 'mod-logo-float', 'var(--action-neutral-normal)');
    // Need to parse the SVG string to extraction proper dimensions if needed, but for now wrap in base64
    logoImg.src = 'data:image/svg+xml;base64,' + btoa(logoSvg);

    function saveData() {
        const data = {
            coins,
            highScore: Math.max(score, savedData.highScore),
            unlockedWeapons: savedData.unlockedWeapons,
            currentWeapon
        };
        set('gradeDefenderData', JSON.stringify(data));
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);

    canvas.addEventListener('mousemove', (e) => { playerX = e.clientX; });
    canvas.addEventListener('touchmove', (e) => { playerX = e.touches[0].clientX; e.preventDefault(); });

    function shoot() {
        if (!gameRunning) return;
        const now = Date.now();
        if (now - lastShot < weapons[currentWeapon].cooldown) return;
        lastShot = now;

        const w = weapons[currentWeapon];
        if (w.multishot) {
            for (let i = 0; i < w.multishot; i++) {
                const angle = (i - 1) * 0.3;
                projectiles.push({
                    x: playerX,
                    y: canvas.height - 60,
                    vx: Math.sin(angle) * 5,
                    vy: -w.speed,
                    damage: w.damage,
                    color: w.color,
                    splash: w.splash
                });
            }
        } else {
            projectiles.push({
                x: playerX,
                y: canvas.height - 60,
                vx: 0,
                vy: -w.speed,
                damage: w.damage,
                color: w.color,
                splash: w.splash
            });
        }
    }

    canvas.addEventListener('click', shoot);
    canvas.addEventListener('touchstart', shoot);

    id('grade-defender-close').addEventListener('click', () => {
        gameRunning = false;
        saveData();
        canvas.remove();
        id('grade-defender-ui').remove();
        id('grade-defender-close').remove();
        id('grade-defender-shop-btn').remove();
        id('grade-defender-shop').remove();
        id('grade-defender-gameover').remove();
        tn('html', 0).style.overflowY = 'scroll';

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.delete('mod-play');
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    });

    id('grade-defender-restart').addEventListener('click', () => {
        score = 0;
        lives = 5;
        combo = 0;
        enemies = [];
        projectiles = [];
        particles = [];
        powerups = [];
        gameRunning = true;
        id('grade-defender-gameover').classList.remove('active');
        lastTime = 0;
        requestAnimationFrame(gameLoop);
    });

    id('grade-defender-shop-btn').addEventListener('click', () => {
        id('grade-defender-shop').classList.toggle('active');
    });

    id('shop-close').addEventListener('click', () => {
        id('grade-defender-shop').classList.remove('active');
    });

    shopItems.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const weaponKey = e.target.dataset.weapon;
            const weapon = weapons[weaponKey];
            if (coins >= weapon.cost && !savedData.unlockedWeapons.includes(weaponKey)) {
                coins -= weapon.cost;
                savedData.unlockedWeapons.push(weaponKey);
                currentWeapon = weaponKey;
                e.target.disabled = true;
                e.target.textContent = 'Owned';
                e.target.parentElement.classList.add('unlocked');
                id('gd-coins').textContent = coins;
                id('gd-weapon').textContent = weapon.name;
                saveData();
                createParticles(canvas.width / 2, canvas.height / 2, '#ffd700', 50);
            }
        }
    });

    tn('html', 0).style.overflowY = 'hidden';

    function createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                color
            });
        }
    }

    function gameLoop(timestamp) {
        if (!gameRunning) return;
        const dt = timestamp - lastTime;
        lastTime = timestamp;

        ctx.save();
        if (shake > 0) {
            ctx.translate(Math.random() * shake - shake / 2, Math.random() * shake - shake / 2);
            shake *= 0.9;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Use clearRect for transparency if needed, or fill
        // Gradient background is handled by CSS now for performance and style (radial gradient)
        // But we need to clear previous frame

        ctx.restore();

        spawnTimer += dt;
        const spawnRate = Math.max(300, 1000 - score * 2);
        if (spawnTimer > spawnRate) {
            const type = Math.random();
            let text, isBad, worth;
            if (type > 0.9) {
                text = '⭐';
                isBad = false;
                worth = 50;
            } else if (type > 0.7) {
                text = (Math.floor(Math.random() * 45) + 55) / 10;
                isBad = false;
                worth = 5;
            } else {
                text = (Math.floor(Math.random() * 40) + 10) / 10;
                isBad = true;
                worth = 10;
            }
            enemies.push({
                x: Math.random() * (canvas.width - 50) + 25,
                y: -50,
                text: text.toString(),
                isBad,
                worth,
                health: isBad ? 1 : 1,
                maxHealth: isBad ? 1 : 1,
                speed: Math.random() * 2 + 1 + (score / 100)
            });
            spawnTimer = 0;
        }

        if (Math.random() < 0.002 && powerups.length < 2) {
            const types = ['❤️', '💰', '⚡'];
            powerups.push({
                x: Math.random() * (canvas.width - 50) + 25,
                y: -30,
                type: types[Math.floor(Math.random() * types.length)],
                speed: 2
            });
        }

        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life -= 0.02;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 4, 4);
            if (p.life <= 0) {
                particles.splice(i, 1);
                i--;
            }
        }
        ctx.globalAlpha = 1;

        for (let i = 0; i < projectiles.length; i++) {
            let p = projectiles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.color === 'rainbow') {
                const hue = (Date.now() / 10) % 360;
                ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            } else {
                ctx.fillStyle = p.color;
            }

            ctx.shadowBlur = 15;
            ctx.shadowColor = ctx.fillStyle;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (p.y < -10) {
                projectiles.splice(i, 1);
                i--;
            }
        }

        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        for (let i = 0; i < enemies.length; i++) {
            let e = enemies[i];
            e.y += e.speed;

            ctx.fillStyle = e.isBad ? '#ff4444' : '#44ff44';
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillText(e.text, e.x, e.y);
            ctx.shadowBlur = 0;

            if (e.health < e.maxHealth) {
                ctx.fillStyle = '#333';
                ctx.fillRect(e.x - 20, e.y - 40, 40, 5);
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(e.x - 20, e.y - 40, 40 * (e.health / e.maxHealth), 5);
            }

            if (e.y > canvas.height) {
                enemies.splice(i, 1);
                i--;
                if (e.isBad) {
                    lives--;
                    combo = 0;
                    shake = 10;
                    id('gd-lives').innerText = lives;
                    id('gd-combo').innerText = combo;
                    if (lives <= 0) {
                        gameRunning = false;
                        const coinsEarned = Math.floor(score / 10);
                        coins += coinsEarned;
                        savedData.coins = coins;
                        id('grade-defender-gameover').classList.add('active');
                        id('gd-final-score').innerText = Math.floor(score);
                        id('gd-coins-earned').innerText = coinsEarned;
                        id('gd-high-score').innerText = Math.max(score, savedData.highScore);
                        saveData();
                    }
                }
            }

            for (let j = 0; j < projectiles.length; j++) {
                let p = projectiles[j];
                let dist = Math.hypot(p.x - e.x, p.y - e.y);
                if (dist < 35) {
                    e.health -= p.damage;
                    createParticles(e.x, e.y, e.isBad ? '#ff4444' : '#44ff44', 10);

                    if (p.splash) {
                        for (let k = 0; k < enemies.length; k++) {
                            if (k !== i) {
                                let splashDist = Math.hypot(enemies[k].x - e.x, enemies[k].y - e.y);
                                if (splashDist < p.splash) {
                                    enemies[k].health -= p.damage / 2;
                                    createParticles(enemies[k].x, enemies[k].y, '#ff9900', 5);
                                }
                            }
                        }
                    }

                    projectiles.splice(j, 1);

                    if (e.health <= 0) {
                        enemies.splice(i, 1);
                        i--;
                        if (e.isBad) {
                            score += e.worth * (1 + combo * 0.1);
                            combo++;
                            shake = 3;
                        } else {
                            score = Math.max(0, score - 20);
                            combo = 0;
                        }
                        id('gd-score').innerText = Math.floor(score);
                        id('gd-combo').innerText = combo;
                        createParticles(e.x, e.y, e.isBad ? '#ffd700' : '#ff4444', 20);
                    }
                    break;
                }
            }
        }

        for (let i = 0; i < powerups.length; i++) {
            let p = powerups[i];
            p.y += p.speed;
            ctx.font = 'bold 30px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText(p.type, p.x, p.y);

            if (p.y > canvas.height) {
                powerups.splice(i, 1);
                i--;
                continue;
            }

            if (Math.hypot(p.x - playerX, p.y - (canvas.height - 50)) < 40) {
                if (p.type === '❤️') lives = Math.min(10, lives + 1);
                if (p.type === '💰') coins += 10;
                if (p.type === '⚡') combo += 5;
                createParticles(p.x, p.y, '#ffd700', 30);
                id('gd-lives').innerText = lives;
                id('gd-coins').innerText = coins;
                id('gd-combo').innerText = combo;
                powerups.splice(i, 1);
                i--;
            }
        }

        ctx.save();
        ctx.translate(playerX, canvas.height - 50);
        if (logoImg.complete && logoImg.width > 0) {
            // Draw logo with proper centering
            ctx.drawImage(logoImg, -30, -30, 60, 60);
        } else {
            ctx.fillStyle = '#fff';
            ctx.fillRect(-25, 0, 50, 20);
            ctx.fillRect(-5, -20, 10, 20);
        }
        ctx.restore();

        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}
window.logo = function (id, classname, color, style) {
    return '<svg' + (n(id) ? '' : ' id="' + id + '"') + (n(classname) ? '' : ' class="' + classname + '"') + (n(style) ? '' : ' style="' + style + '"') + ' viewBox="0 0 190.5 207" width="190.5" height="207"><g transform="translate(-144.8 -76.5)"><g><path d="M261 107.8v.3c0 3.7 3 6.7 6.6 6.7H299a6.8 6.8 0 0 1 6.7 7V143.2c0 3.7 3 6.7 6.7 6.7h16.1a6.8 6.8 0 0 1 6.7 7V201.6c0 3.7-3 6.6-6.7 6.7h-16.1a6.8 6.8 0 0 0-6.7 7v23.1c0 3.7-3 6.7-6.7 6.7h-10.5a6.8 6.8 0 0 0-6.7 7l-.1 24.4v.3c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.7-7v-24.6c0-3.8-2.8-6.9-6.3-6.9s-6.4 3.1-6.4 7v24.8c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.6-7l.1-24.4v-.3c0-3.7-3-6.7-6.6-6.7h-10.5a6.8 6.8 0 0 1-6.7-7V215c0-3.6-3-6.6-6.7-6.7h-15.8a6.8 6.8 0 0 1-6.7-7V156.6c0-3.7 3-6.7 6.7-6.7h15.8a6.8 6.8 0 0 0 6.7-7v-21.4c0-3.6 3-6.6 6.7-6.7h31a6.8 6.8 0 0 0 6.7-7l.1-24.3v-.3c0-3.6 3-6.6 6.7-6.7h29a6.8 6.8 0 0 1 6.8 7z" fill="' + color + '" /><path d="M289.8 179.2c1.3 0 2.9.3 4.6.9 2.2.7 4 1.7 5 2.7v.2c.8.6 1.3 1.5 1.4 2.6 0 .9-.2 1.7-.6 2.3l-6.8 10.8a60.2 60.2 0 0 1-27.5 19.8c-8.5 3.2-17 4.7-24.7 4.5l-13.2-.1a1.6 1.6 0 0 1-1.7-1.5v-3.3a1.6 1.6 0 0 1 1.7-1.5h.1c7.9.3 16.3-1 24.7-4.2a56 56 0 0 0 34.3-31.4v-.3c.5-1 1.4-1.5 2.3-1.5z" fill="#000000" stroke="none" /><g class="glasses"><path d="M171.4 150.8v-9h137.2v9z" fill="#000000" stroke="none" /><path d="M175.7 155.5v-6h57.5v6z" fill="#000000" stroke="none" /><path d="M179.8 160v-9h48.9v9z" fill="#000000" stroke="none" /><path d="M184 164.5v-9h44.7v9z" fill="#000000" stroke="none" /><path d="M188.6 168.6v-7h31.7v7z" fill="#000000" stroke="none" /><path d="M245.9 155.5v-6h57.4v6z" fill="#000000" stroke="none" /><path d="M250 160v-9h48.8v9z" fill="#000000" stroke="none" /><path d="M254 164.5v-9h41v9z" fill="#000000" stroke="none" /><path d="M258.8 168.6v-7h31.6v7z" fill="#000000" stroke="none" /><path d="M184.5 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M188.8 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M193.3 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M193.3 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M197.6 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M202.1 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M254.8 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M259.1 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M263.6 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M263.6 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M268 159.2V155h4.4v4.3z" fill="#ffffff" stroke="none" /><path d="M272.4 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /></g></g></g></svg>';
};