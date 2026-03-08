// MINIGAMES
// A minigame on the error page
function errorPage() {
    if (!n(tn('hmy-button', 0))) {
        tn('hmy-button', 0).insertAdjacentHTML('afterend', '<a id="mod-play-game">Of speel een game</a>');
        id('mod-play-game').addEventListener('click', function () {
            tn('body', 0).classList.add('mod-game-playing');
            const svg = tn('sl-error-image', 0).getElementsByTagName('svg')[0];
            tn('body', 0).insertAdjacentHTML('beforeend', '<div id="mod-game"><p id="mod-playtime"></p><p id="mod-close-button">&times;</p><div id="mod-basefloor"></div><div id="mod-player-container"><svg id="mod-flag-end" viewBox="0 0 147.6 250.5"><defs><linearGradient x1="154.8" y1="129.9" x2="287" y2="129.9" gradientUnits="userSpaceOnUse" id="a"><stop offset="0" stop-color="red"/><stop offset="1" stop-color="#ca0000"/></linearGradient></defs><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" stroke-width="0" stroke-miterlimit="10" style="mix-blend-mode:normal"><path d="m155 76 132 54-132 54z" data-paper-data="{&quot;index&quot;:null}" fill="url(#a)" transform="translate(-139 -56)"/><path d="M5 244V14h11v230z" fill="#ffad66"/><path d="M22 10a11 11 0 1 1-22 2 11 11 0 0 1 22-2zm-6 235a5 5 0 1 1-11 0 5 5 0 0 1 11 0z" fill="#ffad66"/></g></svg><svg id="mod-player" viewBox="0 0 49 49"><rect id="mod-player-rect" x="0" y="39" width="49" height="10" fill="transparent"></rect><path d="M44.6819 17.3781H43.3148C41.7353 17.3781 40.4606 16.1316 40.4606 14.5871V11.9045C40.4606 10.36 39.1859 9.11355 37.6064 9.11355H32.6184C31.0389 9.11355 29.7642 7.8671 29.7642 6.32258V2.79097C29.7642 1.24645 28.4895 0 26.91 0H22.153C20.5734 0 19.2987 1.24645 19.2987 2.79097V6.32258C19.2987 7.8671 18.024 9.11355 16.4445 9.11355H11.4566C9.87706 9.11355 8.60236 10.36 8.60236 11.9045V14.5871C8.60236 16.1316 7.32766 17.3781 5.74814 17.3781H4.38107C2.80155 17.3781 1.52686 18.6245 1.52686 20.169V28.5058C1.52686 30.0503 2.80155 31.2968 4.38107 31.2968H5.72967C7.30918 31.2968 8.58388 32.5432 8.58388 34.0877V37.1768C8.58388 38.7213 9.85858 39.9677 11.4381 39.9677C13.0176 39.9677 14.2923 41.2142 14.2923 42.7587V46.209C14.2923 47.7535 15.567 49 17.1465 49H20.2132C21.7927 49 23.0674 47.7535 23.0674 46.209V41.4039C23.0674 40.609 23.7232 39.9768 24.5269 39.9768C25.3305 39.9768 25.9863 40.6181 25.9863 41.4039V46.209C25.9863 47.7535 27.261 49 28.8405 49H31.9072C33.4867 49 34.7614 47.7535 34.7614 46.209V42.7587C34.7614 41.2142 36.0361 39.9677 37.6156 39.9677C39.1951 39.9677 40.4698 38.7213 40.4698 37.1768V34.0877C40.4698 32.5432 41.7445 31.2968 43.324 31.2968H44.6726C46.2522 31.2968 47.5269 30.0503 47.5269 28.5058V20.169C47.5269 18.6245 46.2522 17.3781 44.6726 17.3781H44.6819ZM37.902 26.4465C37.006 29.3368 35.0108 31.7123 32.2859 33.1394C30.5863 34.0245 28.7297 34.4761 26.8453 34.4761C25.7184 34.4761 24.5823 34.3135 23.4738 33.9794C22.7995 33.7806 22.4208 33.0852 22.624 32.4348C22.8273 31.7755 23.5385 31.4052 24.2128 31.6039C26.522 32.2903 28.9606 32.0555 31.0943 30.9445C33.2188 29.8335 34.7799 27.9819 35.4819 25.7239C35.6851 25.0645 36.3963 24.7032 37.0706 24.8929C37.7449 25.0916 38.1236 25.7871 37.9204 26.4465H37.902Z" fill="var(--bg-primary-normal)" /></svg>' +
                '<div id="mod-level-0" class="mod-level" data-title="Je hebt de geheime kamer gevonden!" data-description="Druk op <i>pijl omlaag</i> of <i>S</i> om laag te blijven" data-right="5" data-bottom="2"><svg style="position:absolute;top:0;right:5%;transform:rotate(195deg);width:200px;" viewBox="0 0 333 303"><g><path d="M101 64V0h232v64H131l-30 28z" fill="#fff"></path><path d="M46 291v-71h27v71z" fill="#4750ff"></path><path d="M86 290c0 6-9 11-20 11s-20-5-20-11c0-7 9-12 20-12s20 5 20 12z" fill="#4750ff"></path><path d="M17 292v-70h27v70z" fill="#636cff"></path><path d="M57 291c0 7-9 12-20 12s-20-5-20-12c0-6 9-11 20-11s20 5 20 11z" fill="#636cff"></path><path d="M92 194c0 28-20 50-44 50-25 0-45-22-45-50s20-50 45-50c24 0 44 22 44 50z" fill="#55b1ff"></path><path d="M56 81c0 10-9 18-19 18-11 0-20-8-20-18s9-18 20-18c10 0 19 8 19 18z" fill="#c17100"></path><path d="M93 118c0 24-20 43-45 43-24 0-44-19-44-43s20-43 44-43c25 0 45 19 45 43z" fill="#ff9898"></path><path d="M79 107c0 5-4 9-9 9-4 0-8-4-8-9s4-9 8-9c5 0 9 4 9 9z" fill="#fff"></path><path d="M76 107c0 2-2 4-4 4-1 0-3-2-3-4s2-3 3-3c2 0 4 1 4 3z"></path><path d="M39 88c0 10-9 18-20 18-10 0-19-8-19-18 0-9 9-17 19-17 11 0 20 8 20 17z" fill="#d47b00"></path><path d="M82 102 64 91l2-3 17 12z"></path><path d="m59 188 51-66 16 12-51 66z" fill="#55b1ff"></path><path d="M135 129c-5 6-14 8-21 3-6-5-7-14-2-21 5-6 14-7 21-3 6 5 7 14 2 21z" fill="#ffa9a9"></path><path d="m71 137 8-7 11 3-1 3z"></path><text transform="translate(136 26) scale(.43897)" font-size="40" font-family="sans-serif"><tspan x="0" dy="0">Kom hier,</tspan><tspan x="0" dy="46">jij schobbejak!</tspan></text></g></svg><div class="mod-trampoline" style="width:100%;bottom:0;" data-strength="1.45"></div><div class="mod-lava" style="width:100%;bottom:98%;"></div></div>' +
                '<div id="mod-level-1" class="mod-level mod-active-level" data-title="Somtoday Platformer" data-description="Een van je docenten achtervolgt je omdat je je huiswerk niet hebt gemaakt. Ren gauw weg!" data-right="5" data-bottom="0"></div>' +
                '<div id="mod-level-2" class="mod-level" data-title="Spring naar de top" data-right="5" data-bottom="34"><div class="mod-floor" style="width:20%;bottom:10%;left:20%;"></div><div class="mod-floor" style="width:20%;bottom:21%;left:50%;"></div><div class="mod-floor" style="width:20%;bottom:32%;left:80%;"></div></div>' +
                '<div id="mod-level-3" class="mod-level" data-title="Val niet in de lava" data-right="5" data-bottom="0"><div class="mod-lava" style="width:23%;bottom:0;left:40%;"></div><div class="mod-floor" style="width:15%;bottom:10%;left:20%;"></div><div class="mod-floor" style="width:15%;bottom:20%;left:0%;"></div><div class="mod-floor" style="width:15%;bottom:30%;left:20%;"></div></div>' +
                '<div id="mod-level-4" class="mod-level" data-title="Trampolines!" data-right="5" data-bottom="69"><div class="mod-trampoline" style="width:15%;bottom:0;left:20%;"></div><div class="mod-floor" style="width:15%;bottom:30%;left:35%;"></div><div class="mod-trampoline" style="width:15%;bottom:30%;left:50%;"></div><div class="mod-floor" style="width:15%;bottom:56%;left:65%;"></div><div class="mod-floor" style="width:20%;bottom:67%;left:80%;"></div></div>' +
                '<div id="mod-level-5" class="mod-level" data-title="Wat een groot lava-blok!" data-right="5" data-bottom="77"><div class="mod-trampoline" style="width:12.5%;bottom:0;left:0;"></div><div class="mod-floor" style="width:12.5%;bottom:29%;left:12.5%;"></div><div class="mod-floor" style="width:12.5%;bottom:46%;left:0;"></div><div class="mod-floor" style="width:12.5%;bottom:64%;left:12.5%;"></div><div class="mod-floor" style="width:12.5%;bottom:64%;left:45%;"></div><div class="mod-floor" style="width:12.5%;bottom:64%;left:75%;"></div><div class="mod-floor" style="width:12.5%;bottom:75%;left:87.5%;"></div><div class="mod-lava" style="width:50%;bottom:0;left:25%;height:64%;"></div></div>' +
                '<div id="mod-level-6" class="mod-level" data-title="Pas op voor onvoldoendes" data-right="5" data-bottom="0"><div class="mod-trampoline" style="width:15%;bottom:0;left: 10%;"></div><div class="mod-enemy" data-x="50" style="bottom:0;left:50%;"></div><div class="mod-enemy" data-x="75" style="bottom:0;left:75%;"></div></div>' +
                '<div id="mod-level-7" class="mod-level" data-title="Wow! Je bent al bij level 7!" data-right="5" data-bottom="0"><div class="mod-enemy" data-x="50" data-min="14" style="bottom:0;left:50%;"></div><div class="mod-wall" style="bottom:0;left:12.5%;height:13%;"></div><div class="mod-wall" style="bottom:13%;left:75%;height:100%;"></div><div class="mod-floor" style="width:20%;bottom:13%;left:12.5%;"></div><div class="mod-floor" style="width:35%;bottom:13%;left:40%;"></div></div>' +
                '<div id="mod-level-8" class="mod-level" data-title="Soms moet je gewoon snel zijn" data-left="5" data-bottom="85"><div class="mod-lava" style="width:10%;bottom:72%;left:30%;"></div><div class="mod-lava" style="width:10%;bottom:72%;left:60%;"></div><div class="mod-enemy" style="bottom:38%;left:40%;" data-x="40" data-max="40" data-min="15"></div><div class="mod-trampoline" style="width:15%;bottom:38%;left:85%;"></div><div class="mod-floor" style="width:70%;bottom:70%;left:15%;"></div><div class="mod-floor" style="width:80%;bottom:18%;left:0;"></div><div class="mod-enemy" style="bottom:20%;left:55%;" data-x="55" data-max="55"></div><div class="mod-floor" style="width:30%;bottom:36%;left:70%;"></div><div class="mod-floor" style="width:30%;bottom:36%;left:15%;"></div><div class="mod-floor" style="width:28%;bottom:49%;left:44%;"></div><div class="mod-floor" style="width:17%;bottom:83%;left:0;"></div><div class="mod-wall" style="bottom:36%;left:44%;height:13%;"></div><div class="mod-wall" style="bottom:70%;left:15%;height:13%;"></div><div class="mod-wall" style="bottom:36%;left:70%;height:13%;"></div></div>' +
                '<div id="mod-level-9" class="mod-level" data-title="Stap op de bewegende platforms" data-right="5" data-bottom="60"><div class="mod-lava" style="width:60%;bottom:0;left:40%;"></div><div class="mod-moving-platform-up" data-bottom="0" data-direction="up" style="left:20%;bottom:0;top:42%;right:65%;"><div class="mod-floor mod-platform"></div></div><div class="mod-moving-platform-right" data-right="0" data-direction="left" style="left:35%;top:40%;right:20%;"><div class="mod-floor"></div></div><div class="mod-floor" style="width:15%;bottom:58%;left:85%;"></div></div>' +
                '<div id="mod-level-10" class="mod-level" data-title="" data-right="40" data-bottom="80"><h1 class="mod-floor" style="width:50%;left:25%;">Laatste level!</h1><div class="mod-floor" style="width:20%;bottom:15%;left:20%;"></div><div class="mod-floor" style="width:20%;bottom:34%;left:0;"></div><div class="mod-floor" style="width:20%;bottom:15%;left:60%;"></div><div class="mod-floor" style="width:20%;bottom:34%;left:80%;"></div><div class="mod-floor" style="width:20%;bottom:78%;left:50%;"></div><div class="mod-trampoline" style="width:10%;bottom:54%;left:30%;"></div></div>' +
                '<div id="mod-level-11" class="mod-level" data-title="Gefeliciteerd" data-description="Je bent succesvol ontsnapt aan de docent!" data-right="-5" data-bottom="-5"><a id="mod-play-again" style="bottom:20%;">Nog een keer spelen</a><a id="mod-close-game" style="bottom:10%;">Spel sluiten</a></div>' +
                '<h1 id="mod-h1-header"></h1><h3 id="mod-h3-header"></h3></div></div>');

            let detectOverlap = (function () {
                function getPositions(elem) {
                    const pos = elem.getBoundingClientRect();
                    return [[pos.left, pos.right], [pos.top, pos.bottom]];
                }

                function comparePositions(p1, p2) {
                    let r1, r2;
                    if (p1[0] < p2[0]) {
                        r1 = p1;
                        r2 = p2;
                    } else {
                        r1 = p2;
                        r2 = p1;
                    }
                    return r1[1] > r2[0] || r1[0] === r2[0];
                }

                return function (a, b) {
                    const pos1 = getPositions(a),
                        pos2 = getPositions(b);
                    return comparePositions(pos1[0], pos2[0]) && comparePositions(pos1[1], pos2[1]);
                };
            })();

            const player = id('mod-player');
            const playerRect = id('mod-player-rect');
            let positionX = 2;
            let positionY = 0;
            let velocityX = 0;
            let velocityY = 0;
            let onGround = true;
            let floorElements;
            let wallElements;
            let lavaElements;
            let trampolineElements;
            let enemyElements;
            let movingPlatformsUp;
            let movingPlatformsRight;
            var pressedKeys = {};
            let windowWidth = document.documentElement.clientWidth;
            let windowHeight = document.documentElement.clientHeight - 100;
            let level = 1;
            let activeLevel;
            for (const element of cn('mod-enemy')) {
                element.dataset.start = element.dataset.x;
                const numOne = Math.floor(Math.random() * (5) + 1);
                let numTwo = Math.floor(Math.random() * (10));
                if (numOne == 5 && numTwo >= 5) {
                    numTwo = 4;
                }
                element.innerHTML = '<p>' + numOne.toString() + ',' + numTwo.toString() + '</p>';
            }

            let time = 0;
            let timer;
            setTimeInterval();
            function setTimeInterval() {
                setTime();
                timer = setInterval(function () {
                    time++;
                    setTime();
                }, 1000);
            }

            function setTime() {
                if (!n(id('mod-playtime'))) {
                    if (n(get('gamerecord'))) {
                        id('mod-playtime').innerHTML = 'Tijd: ' + time + 's';
                    }
                    else {
                        id('mod-playtime').innerHTML = 'Tijd: ' + time + 's, ' + 'record: ' + get('gamerecord') + 's';
                    }
                }
            }

            function openLevel(number) {
                level = number;
                activeLevel = id('mod-level-' + level.toString());
                if (number == 11) {
                    if (!n(timer)) {
                        clearInterval(timer);
                    }
                    if (n(get('gamerecord')) || time < get('gamerecord')) {
                        set('gamerecord', time);
                    }
                }
                if (n(activeLevel)) {
                    tn('body', 0).classList.remove('mod-game-playing');
                    // Reset error page SVG if it exists
                    if (!n(tn('sl-error-image', 0)) && !n(tn('sl-error-image', 0).getElementsByTagName('svg')[0])) {
                        const errorSvg = tn('sl-error-image', 0).getElementsByTagName('svg')[0];
                        errorSvg.style.marginTop = '';
                        errorSvg.style.transform = '';
                    }
                    if (!n(updateGame)) {
                        clearInterval(updateGame);
                    }
                    if (!n(timer)) {
                        clearInterval(timer);
                    }
                    setTimeout(function () {
                        if (!n(id('mod-game'))) {
                            id('mod-game').remove();
                        }
                    }, 320);
                    return;
                }
                floorElements = activeLevel.getElementsByClassName('mod-floor');
                wallElements = activeLevel.getElementsByClassName('mod-wall');
                lavaElements = activeLevel.getElementsByClassName('mod-lava');
                trampolineElements = activeLevel.getElementsByClassName('mod-trampoline');
                enemyElements = activeLevel.getElementsByClassName('mod-enemy');
                movingPlatformsUp = activeLevel.getElementsByClassName('mod-moving-platform-up');
                movingPlatformsRight = activeLevel.getElementsByClassName('mod-moving-platform-right');
                id('mod-h1-header').innerHTML = activeLevel.dataset.title;
                if (!n(activeLevel.dataset.description)) {
                    id('mod-h3-header').innerHTML = activeLevel.dataset.description;
                }
                else {
                    id('mod-h3-header').innerHTML = '';
                }
                cn('mod-active-level', 0).classList.remove('mod-active-level');
                activeLevel.classList.add('mod-active-level');
                if (n(activeLevel.dataset.left)) {
                    id('mod-flag-end').style.left = '';
                    id('mod-flag-end').style.right = activeLevel.dataset.right + '%';
                }
                else {
                    id('mod-flag-end').style.right = '';
                    id('mod-flag-end').style.left = activeLevel.dataset.left + '%';
                }
                id('mod-flag-end').style.bottom = activeLevel.dataset.bottom + '%';
                positionX = 2;
                positionY = 0;
                velocityX = 0;
                velocityY = 0;
                onGround = true;
            }

            openLevel(1);

            id('mod-close-game').addEventListener('click', function () { openLevel(12); });
            id('mod-close-button').addEventListener('click', function () { openLevel(12); });
            id('mod-play-again').addEventListener('click', function () { time = 0; setTimeInterval(); openLevel(1); });

            document.addEventListener('keyup', function (e) { pressedKeys[e.keyCode] = false; });
            document.addEventListener('keydown', function (e) { if (e.keyCode == 40) { e.preventDefault(); } pressedKeys[e.keyCode] = true; });

            let touchX;
            let touchY;
            let isTouching = false;
            document.addEventListener('touchstart', function (e) { isTouching = true; const touch = e.touches[0] || e.changedTouches[0]; touchX = touch.pageX; touchY = touch.pageY; });
            document.addEventListener('touchmove', function (e) { isTouching = true; const touch = e.touches[0] || e.changedTouches[0]; touchX = touch.pageX; touchY = touch.pageY; });
            document.addEventListener('touchend', function (e) { isTouching = false; });
            document.addEventListener('touchcancel', function (e) { isTouching = false; });


            document.addEventListener('mousedown', function (e) { isTouching = true; touchX = e.clientX; touchY = e.clientY; });
            document.addEventListener('mousemove', function (e) { touchX = e.clientX; touchY = e.clientY; });
            document.addEventListener('mouseover', function (e) { touchX = e.clientX; touchY = e.clientY; });
            document.addEventListener('mouseenter', function (e) { touchX = e.clientX; touchY = e.clientY; });
            document.addEventListener('mouseup', function (e) { isTouching = false; });
            document.addEventListener('mouseleave', function (e) { isTouching = false; });

            document.addEventListener('resize', function () { windowWidth = document.documentElement.clientWidth; windowHeight = document.documentElement.clientHeight; });

            // Handle movement
            const updateGame = setInterval(function () {
                const boundingRect = player.getBoundingClientRect();
                // Up
                if ((isTouching && touchY < boundingRect.top - 100) || pressedKeys[38] || pressedKeys[87]) {
                    if (onGround) {
                        for (const element of movingPlatformsUp) {
                            if (element.dataset.direction == 'up' && detectOverlap(playerRect, element.children[0])) {
                                velocityY += 0.7;
                                positionY += 0.7;
                            }
                        }
                        velocityY += 1.7;
                        onGround = false;
                        positionY += 0.3;
                        player.style.bottom = positionY + '%';
                    }
                }
                // Down
                if ((isTouching && touchY > boundingRect.top + 100) || pressedKeys[40] || pressedKeys[83]) {
                    velocityY -= 0.2;
                }
                // Right
                if ((isTouching && touchX > boundingRect.left + 100) || pressedKeys[39] || pressedKeys[68]) {
                    velocityX += 0.055;
                }
                // Left
                if ((isTouching && touchX < boundingRect.left - 100) || pressedKeys[37] || pressedKeys[65]) {
                    velocityX -= 0.055;
                }
                if (velocityX > 1) {
                    velocityX = 1;
                }
                if (velocityX < -1) {
                    velocityX = -1;
                }
                for (const element of movingPlatformsUp) {
                    if (element.dataset.direction == 'up') {
                        const newValue = parseFloat(element.dataset.bottom) + 0.5;
                        element.dataset.bottom = newValue;
                        element.children[0].style.bottom = newValue.toString() + '%';
                        if (newValue >= 100) {
                            element.dataset.direction = 'down';
                        }
                        if (detectOverlap(playerRect, element.children[0])) {
                            positionY += element.clientHeight / 100 * 0.5 / windowHeight;
                            onGround = true;
                        }
                    }
                    else {
                        const newValue = parseFloat(element.dataset.bottom) - 0.5;
                        element.dataset.bottom = newValue;
                        element.children[0].style.bottom = newValue.toString() + '%';
                        if (newValue <= 0) {
                            element.dataset.direction = 'up';
                        }
                        if (detectOverlap(playerRect, element.children[0])) {
                            positionY -= element.clientHeight / 100 * 0.5 / windowHeight;
                            onGround = true;
                        }
                    }
                }
                for (const element of movingPlatformsRight) {
                    if (element.dataset.direction == 'left') {
                        const newValue = parseFloat(element.dataset.right) + 0.4;
                        element.dataset.right = newValue;
                        element.children[0].style.right = newValue.toString() + '%';
                        if (newValue >= 100) {
                            element.dataset.direction = 'right';
                        }
                        if (detectOverlap(playerRect, element.children[0])) {
                            positionX -= element.clientWidth / 100 * 0.4 / windowWidth * 100;
                            onGround = true;
                        }
                    }
                    else {
                        const newValue = parseFloat(element.dataset.right) - 0.4;
                        element.dataset.right = newValue;
                        element.children[0].style.right = newValue.toString() + '%';
                        if (newValue <= 0) {
                            element.dataset.direction = 'left';
                        }
                        if (detectOverlap(playerRect, element.children[0])) {
                            positionX += element.clientWidth / 100 * 0.4 / windowWidth * 100;
                            onGround = true;
                        }
                    }
                }
                if (positionY <= 0) {
                    velocityY = 0;
                    onGround = true;
                }
                else {
                    onGround = false;
                    for (const element of floorElements) {
                        if (detectOverlap(playerRect, element)) {
                            if (velocityY <= 0) {
                                velocityY = 0;
                                onGround = true;
                                player.style.bottom = (positionY + 0.3) + '%';
                                if (detectOverlap(playerRect, element)) {
                                    positionY += 0.3;
                                }
                            }
                            else {
                                velocityY = -0.5;
                            }
                            break;
                        }
                        else if (detectOverlap(player, element)) {
                            velocityY = -0.5;
                            break;
                        }
                    }
                }
                for (const element of wallElements) {
                    if (detectOverlap(playerRect, element)) {
                        if (velocityX > 0) {
                            velocityX = -0.5;
                        }
                        else if (velocityX < 0) {
                            velocityX = 0.5;
                        }
                    }
                }
                for (const element of trampolineElements) {
                    if (detectOverlap(player, element)) {
                        if (n(element.dataset.strength)) {
                            velocityY = 2.5;
                        }
                        else {
                            velocityY = 2.5 * parseFloat(element.dataset.strength);
                        }
                        onGround = false;
                    }
                }
                if (positionX + velocityX < 0) {
                    positionX = 0;
                    const newLevel = level - 1;
                    if (newLevel >= 0) {
                        setTimeout(function () {
                            if (level != newLevel && positionX + velocityX < 0) {
                                openLevel(newLevel);
                            }
                        }, 2000);
                    }
                }
                else if (windowWidth / 100 * (positionX + velocityX) > windowWidth - 50) {
                    positionX = 100 / windowWidth * (windowWidth - 50);
                }
                else {
                    positionX += velocityX;
                }
                if (positionY + velocityY < 0) {
                    positionY = 0;
                }
                else {
                    positionY += velocityY;
                }
                velocityX = velocityX * 0.9;
                if (!onGround) {
                    velocityY -= 0.07;
                }
                player.style.left = positionX + '%';
                player.style.bottom = positionY + '%';
                if (detectOverlap(player, id('mod-flag-end'))) {
                    openLevel(level + 1);
                }
                // Reset position when touching lava
                for (const element of lavaElements) {
                    if (detectOverlap(player, element)) {
                        positionX = 2;
                        positionY = 0;
                        velocityX = 0;
                        velocityY = 0;
                        onGround = true;
                    }
                }
                // Enemy movement
                for (const element of enemyElements) {
                    if (detectOverlap(player, element)) {
                        positionX = 2;
                        positionY = 0;
                        velocityX = 0;
                        velocityY = 0;
                        onGround = true;
                        for (const element of enemyElements) {
                            element.dataset.x = element.dataset.start;
                            element.style.left = (parseFloat(element.dataset.x)).toString() + '%';
                        }
                    }
                    else {
                        const currentPositionX = parseFloat(element.dataset.x);
                        let newValue;
                        if (currentPositionX > positionX) {
                            newValue = currentPositionX - 0.18;
                        }
                        else {
                            newValue = currentPositionX + 0.18;
                        }
                        if (!n(element.dataset.min) && newValue < parseFloat(element.dataset.min)) {
                            newValue = parseFloat(element.dataset.min);
                        }
                        if (!n(element.dataset.max) && newValue > parseFloat(element.dataset.max)) {
                            newValue = parseFloat(element.dataset.max);
                        }
                        element.dataset.x = newValue;
                        element.style.left = newValue.toString() + '%';
                    }
                }
            }, 10);
        });

        if (window.location.hash == '#mod-play') {
            id('mod-play-game').click();
            history.replaceState('', document.title, window.location.pathname + window.location.search);
        }
    }
}