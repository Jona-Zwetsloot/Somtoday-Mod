// MAIN FUNCTIONS

function onload() {

    // Make sure to have only one instance of the mod active at a time
    if (id('somtoday-mod-active')) {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD:\nMultiple instances of Somtoday Mod are running.\nSomtoday Mod ' + platform + ' v' + version + ' will not be working until the other instance is deleted or deactivated.'));
        return;
    }

    // [GENERATION] APPLY_STYLES

    const mathQuestions = ['compose the formula of f\'x() where f(x) = 2 * sin(9x + 3)', 'rewrite 2 * log3(243) + 28 to the form of log(a)', 'find the value(s) of x in the equation x^2 + 9 = -6x', 'give the point(s) where  12 = 2y + 6x and y = x^2 - 5x intersect (round on 2 decimals)', 'rewrite -sin(8x) to the form of cos(ax + b)'];
    const mathAnswers = ['Answer: f\'(x) = 18 * cos(9x + 3)', 'Answer: log(10^38)', 'Answer: x = -3', 'Answer: (-1,65; 10,94), (3,65; -4,94)', 'Answer: cos(8x + 0.5pi)'];
    const selectedQuestion = Math.floor(Math.random() * mathQuestions.length);
    tn('body', 0).insertAdjacentHTML('beforeend', '<div id="somtoday-mod"><div id="somtoday-mod-active" data-platform="' + platform + '" data-version="' + version + '"><!-- Well hello there! Great work, detective. --><!-- Nothing better to do? Solve this math question: ' + mathQuestions[selectedQuestion] + ' --><div data-info="expand-to-view-answer"><!-- ' + mathAnswers[selectedQuestion] + ' --></div></div></div>');

    // Stop script if 502 error occurs
    if (cn('cf-error-details cf-error-502', 0)) {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Bad gateway (502)'));
        return;
    }

    // Stop script if any other error occurs
    if (tn('sl-error', 0)) {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Unknown error'));
        execute([errorPage]);
        return;
    }

    // Stop script if Somtoday has outage
    if (cn('titlewrap', 0)) {
        // Since https://som.today and the error page are very similar, check if the word 'storing' is present on the page
        if (cn('titlewrap', 0).parentElement.parentElement.innerHTML.indexOf('storing') != -1) {
            setTimeout(console.warn.bind(console, 'Somtoday Mod ERROR\nSomtoday is down.'));
            return;
        }
    }

    let today = new Date();
    let dayInt = today.getDate();
    let month = today.getMonth();
    let year = today.getFullYear();
    let filesProcessed;
    let darkmode = tn('html', 0).classList.contains('dark') || tn('html', 0).classList.contains('night');
    let busy = false;
    let isRecapping = false;
    let ignoreRecapConditions = false;
    let ignoreCountdownConditions = false;
    let menuColor;
    let highLightColor;
    let menuWidth = n(get('menuwidth')) ? 110 : get('menuwidth');

    // List of all Google Fonts to be loaded
    const fonts = ['Abhaya Libre', 'Aleo', 'Archivo', 'Assistant', 'B612', 'Bebas Neue', 'Black Ops One', 'Brawler', 'Cabin', 'Caladea', 'Cardo', 'Chivo', 'Comic Sans MS', 'Crimson Text', 'DM Serif Text', 'Enriqueta', 'Fira Sans', 'Frank Ruhl Libre', 'Gabarito', 'Gelasio', 'Grenze Gotisch', 'IBM Plex Sans', 'Inconsolata', 'Inter', 'Josefin Sans', 'Kanit', 'Karla', 'Lato', 'Libre Baskerville', 'Libre Franklin', 'Lora', 'Merriweather', 'Montserrat', 'Neuton', 'Noto Serif', 'Nunito', 'Open Sans', 'OpenDyslexic2', 'Oswald', 'papyrus', 'Permanent Marker', 'Pixelify Sans', 'Playfair Display', 'Poetsen One', 'Poppins', 'PT Sans', 'PT Serif', 'Quicksand', 'Raleway', 'Roboto', 'Roboto Slab', 'Rubik', 'Rubik Doodle Shadow', 'Sedan SC', 'Shadows Into Light', 'Single Day', 'Source Sans 3', 'Source Serif 4', 'Spectral', 'Titillium Web', 'Ubuntu', 'Work Sans'];
    let fontUrl = 'https://fonts.googleapis.com/css2';
    let first = true;
    for (const font of fonts) {
        if (font != 'Comic Sans MS' && font != 'papyrus' && font != 'OpenDyslexic2' && font != 'Open Sans') {
            fontUrl += (first ? '?' : '&') + 'family=' + font.replaceAll(' ', '+');
            first = false;
        }
    }
    fontUrl += '&display=swap';

    // Make sure to remove inert on click if needed
    document.addEventListener('click', function () {
        if (n(id('mod-message')) && tn('sl-root', 0).inert) {
            tn('sl-root', 0).inert = false;
            if (tn('sl-modal', 0)) {
                tn('sl-modal', 0).inert = false;
            }
        }
    });

    // Write message in the console
    function consoleMessage() {
        setTimeout(console.log.bind(console, "%cSomtoday Mod is geactiveerd!", "color:#0067c2;font-weight:bold;font-family:Arial;font-size:26px;"));
        setTimeout(console.log.bind(console, "%cGeniet van je betere versie van Somtoday.\n\nMet dank aan " + Object.keys(contributors).join(', ') + "\nVersie " + version_name + " van Somtoday Mod " + platform, "color:#0067c2;font-weight:bold;font-family:Arial;font-size:16px;"));
    }

    function initTheme() {
        const theme = get('theme');

        browser.runtime.sendNativeMessage('somtodaymod', { type: 'SAVE_THEME', theme: theme });

        if ((theme == 'light' || theme == 'dark' || theme == 'night') && get('autotheme') !== 'true') {
            const html = document.documentElement;
            html.classList.remove('light', 'dark', 'night');
            html.classList.add(theme);
        }
    }

    function editGrades() {
        // Change to true to be able to edit your grades. Not added by default to prevent students from misleading their parents.
        // If you see this, you are smart enough to know how inspect element works, so just enable it if you want to.
        if (false) {
            for (const element of cn('cijfer')) {
                element.contentEditable = true;
                element.addEventListener('click', function (event) { this.focus(); event.stopPropagation(); });
            }
        }
    }

    function easterEggs() {
        if (n(id('mod-easter-eggs'))) {
            if (get('layout') == 1 || get('layout') == 4) {
                tn('head', 0).insertAdjacentHTML('beforeend', `
                <style id="mod-easter-eggs">
                    @media (max-width:767px) {
                        #mod-logo-inserted,
                        #mod-logo-hat {
                            display: none;
                        }
                    }
                </style>
                `);
            }
            let i = 0;
            let j = 0;
            let k = 0;
            let l = 0;
            let m = 0;
            let n = 0;
            let p = 0;
            document.addEventListener('keydown', function (e) {
                if (e == null || e.key == null) {
                    return;
                }

                let konamikeys = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
                if (e.key.toLowerCase() == konamikeys[i]) {
                    i++;
                }
                else {
                    i = 0;
                }
                if (i == konamikeys.length) {
                    tn('body', 0).classList.add('rainbow');
                }
                // Somtoday Mod
                let somtodaymodkeys = 'somtoday mod shake';
                if (e.key.toLowerCase() == somtodaymodkeys.charAt(j)) {
                    j++;
                }
                else {
                    j = 0;
                }
                if (j == somtodaymodkeys.length) {
                    tn('body', 0).classList.add('easter-egg-shaking');
                    easterEggShake();
                }
                // Barrel roll
                let barrelrollkeys = 'do a barrel roll';
                if (e.key.toLowerCase() == barrelrollkeys.charAt(k)) {
                    k++;
                }
                else {
                    k = 0;
                }
                if (k == barrelrollkeys.length) {
                    tn('html', 0).classList.add('barrelroll');
                    setTimeout(function () {
                        tn('html', 0).classList.remove('barrelroll');
                    }, 2100);
                }
                // Barrel roll x times
                let barrelrollxkeys = 'do a barrel roll x';
                if (e.key.toLowerCase() == barrelrollxkeys.charAt(l)) {
                    l++;
                }
                else {
                    l = 0;
                }
                if (l == barrelrollxkeys.length) {
                    modMessage('BARREL ROLL', 'Hoeveel barrel rolls?<div class="br"></div><input id="mod-barrel-roll-amount" type="number" min="0" step="1" onkeyup="if (this.value != \'\') { this.value = Math.floor(this.value); } if (this.value < 1 && this.value != \'\') { this.value = 1; }"/>', 'Doorgaan', 'Annuleren');
                    id('mod-message-action1').addEventListener('click', function () {
                        closeModMessage();
                        tn('html', 0).classList.add('barrelroll');
                        setTimeout(function () {
                            tn('html', 0).classList.remove('barrelroll');
                        }, id('mod-barrel-roll-amount').value * 2000 + 100);
                    });
                    id('mod-message-action2').addEventListener('click', closeModMessage);
                }
                // Somtoday recap
                let recapkeys = 'recap';
                if (e.key.toLowerCase() == recapkeys.charAt(m)) {
                    m++;
                }
                else {
                    m = 0;
                }
                if (m == recapkeys.length) {
                    ignoreRecapConditions = true;
                    somtodayRecap();
                }
                // New year countdown
                let countdownkeys = 'countdown';
                if (e.key.toLowerCase() == countdownkeys.charAt(n)) {
                    n++;
                }
                else {
                    n = 0;
                }
                if (n == countdownkeys.length) {
                    ignoreCountdownConditions = true;
                    newYearCountdown();
                }
                // Party mode
                let partykeys = 'party';
                if (e.key.toLowerCase() == partykeys.charAt(p)) {
                    p++;
                }
                else {
                    p = 0;
                }
                if (p == partykeys.length) {
                    toggleConfetti();
                    try {
                        let tada = new Audio(window.getAudioUrl('tada'));
                        tada.volume = 0.5;
                        tada.play();
                    } catch (e) {
                        console.warn(e);
                    }
                    p = 0;
                }
            });
        }
        if (id('somtoday-mod-version-easter-egg') && !id('somtoday-mod-version-easter-egg').classList.contains('mod-easter-egg')) {
            id('somtoday-mod-version-easter-egg').addEventListener('click', function () {
                tn('body', 0).insertAdjacentHTML('beforeend', window.logo(null, 'mod-easter-egg-logo mod-add-eventlistener" data-add-event-listener="true', '#0099ff'));
                for (const element of cn('mod-easter-egg-logo mod-add-eventlistener')) {
                    element.classList.remove('mod-add-eventlistener');
                    element.addEventListener('click', function () { this.remove(); });
                }
            });
            id('somtoday-mod-version-easter-egg').classList.add('mod-easter-egg');
        }
        if (tn('body', 0).classList.contains('easter-egg-shaking')) {
            easterEggShake();
        }
        function easterEggShake() {
            var shakingElements = [];
            shakingElements = Array.prototype.concat.apply(shakingElements, cn('terug'));
            shakingElements = Array.prototype.concat.apply(shakingElements, cn('sluiten'));
            shakingElements = Array.prototype.concat.apply(shakingElements, tn('hmy-button'));
            shakingElements = Array.prototype.concat.apply(shakingElements, tn('hmy-tab'));
            shakingElements = Array.prototype.concat.apply(shakingElements, tn('hmy-switch'));
            for (const element of shakingElements) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of cn('afspraak-header')) {
                element.children[element.children.length - 1].addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            if (tn('sl-bericht-acties', 0)) {
                for (const element of tn('sl-bericht-acties', 0).children) {
                    element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
                }
            }
            for (const element of tn('sl-studiewijzer-item')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of tn('sl-studiewijzer-filter-button')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of tn('sl-rooster-item')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of tn('sl-rooster-huiswerk-stack')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of tn('sl-bericht-samenvatting')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of tn('hmy-geen-data')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of cn('button')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of cn('nieuw-bericht')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            tn('sl-header', 0).addEventListener('mouseover', function () { shakeOnHover(this, -20, 20, -20, 20); });
        }
        function shakeOnHover(element, xMin, xMax, yMin, yMax) {
            element.style.transform = 'translate(' + (Math.random() * (xMax - xMin) + xMin).toString() + 'px, ' + (Math.random() * (yMax - yMin) + yMin).toString() + 'px)';
        }
    }

    let homeworkBusy = false;
    let homework;
    function customHomework() {
        if (n(get('homework'))) {
            set('homework', '[]');
        }
        if (get('bools').charAt(BOOL_INDEX.CUSTOM_HOMEWORK) == '1' && !homeworkBusy) {
            if (document.documentElement.clientWidth <= 767) {
                homeworkBusy = true;
                document.querySelectorAll('.mod-huiswerk').forEach(e => e.remove());
                document.querySelectorAll('.mod-placeholder').forEach(e => e.remove());
                homeworkBusy = false;
            }
            homework = JSON.parse(get('homework'));
            let startIndex = 0;
            for (let i = 0; i < homework.length; i++) {
                if (homework.returning == '0') {
                    startIndex = i;
                    break;
                }
            }
            // STUDIEWIJZER
            // Loop through days on computer
            let index = 0;
            for (const element of tn('sl-studiewijzer-dag')) {
                index = customHomeworkInner(element, index, startIndex);
            }
            // Loop through days on mobile
            index = 0;
            for (const element of tn('sl-studiewijzer-lijst-dag')) {
                index = customHomeworkInner(element, index, startIndex);
            }
            // Loop through week tasks
            index = 0;
            for (const element of tn('sl-studiewijzer-week')) {
                if (element.getElementsByClassName('week')[0]) {
                    index = customHomeworkInner(element.getElementsByClassName('week')[0], index, startIndex);
                }
            }
            // ROOSTER
            if (tn('sl-rooster-week-header', 0)) {
                // Remove old custom homework first (might belong to different week)
                let elements = document.querySelectorAll('sl-rooster-week-header .mod-huiswerk');
                elements.forEach(el => el.remove());
                // Then add new custom homework
                index = 0;
                for (const element of tn('sl-rooster-week-header', 0).getElementsByClassName('dag')) {
                    index = customHomeworkInner(element, index, startIndex);
                }
            }
        }
        else if (!homeworkBusy) {
            homeworkBusy = true;
            document.querySelectorAll('.mod-huiswerk').forEach(e => e.remove());
            document.querySelectorAll('.mod-add-homework').forEach(e => e.remove());
            document.querySelectorAll('.mod-placeholder').forEach(e => e.remove());
            homeworkBusy = false;
        }
    }

    function sortByDate(a, b) {
        // If weekly or monthly task, position it in the front of the array
        if (a.returning != '0') {
            return -1;
        }
        if (b.returning != '0') {
            return 1;
        }
        // Non-reoccurring tasks are sorted by time after the weekly and monthly tasks
        if (Date.parse(a.date) < Date.parse(b.date)) {
            return -1;
        }
        if (Date.parse(a.date) > Date.parse(b.date)) {
            return 1;
        }
        return 0;
    }

    function ariaLabelToDate(element) {
        let dateString;
        if (n(element.children[0])) {
            return;
        }
        if (element.getElementsByClassName('header')[0]) {
            element = element.getElementsByClassName('header')[0];
            dateString = ((n(element.children[0].ariaLabel) || !element.children[0].ariaLabel.match(/ (\d*? [a-z]*?)$/, '')) ? '' : element.children[0].ariaLabel.match(/ (\d*? [a-z]*?)$/, '')[1]) + ' ';
        }
        else {
            dateString = ((n(element.children[0].ariaLabel) || !element.children[0].ariaLabel.match(/^[A-Za-z]+? ([0-9]+?[ -][A-Za-z]+)/, '')) ? '' : element.children[0].ariaLabel.match(/^[A-Za-z]+? ([0-9]+?[ -][A-Za-z]+)/, '')[1]) + ' ';
        }
        // Datestring does not include the current year. So we have to reason which year it is based on the current month and datestring month
        if (dateString == ' ') {
            return;
        }
        if (dateString.indexOf('januari') != -1 || dateString.indexOf('februari') != -1 || dateString.indexOf('maart') != -1 || dateString.indexOf('april') != -1 || dateString.indexOf('mei') != -1 || dateString.indexOf('juni') != -1 || dateString.indexOf('juli') != -1) {
            // Viewing Jan-Jul while in Jan-Jul, user is looking at current year
            if (month + 1 <= 7) {
                dateString += year;
            }
            // Viewing Jan-Jul while in Aug-Dec, user is looking at previous year
            else {
                dateString += (year - 1).toString();
            }
        }
        else {
            // Viewing Aug-Dec while in Jan-Jul, user is looking at previous year
            if (month + 1 <= 7) {
                dateString += (year - 1).toString();
            }
            // Viewing Aug-Dec while in Aug-Dec, user is looking at current year
            else {
                dateString += year;
            }
        }
        let englishDateString = dateString.replace('januari', 'january').replace('februari', 'february').replace('maart', 'march').replace('mei', 'may').replace('juni', 'june').replace('juli', 'july').replace('augustus', 'august').replace('oktober', 'october');
        return dateObject = new Date(Date.parse(englishDateString));
    }

    function customHomeworkIcons(activeIcon, activeColor) {
        let icons = [
            {
                name: 'edit',
                color: '--fg-warning-normal',
            },
            {
                name: 'homework',
                color: '--fg-primary-normal',
            },
            {
                name: 'assignment',
                color: '--fg-alternative-normal',
            },
            {
                name: 'test',
                color: '--fg-warning-normal',
            },
            {
                name: 'test',
                color: '--fg-negative-normal',
            },
            {
                name: 'book',
                color: '--fg-warning-normal',
            },
            {
                name: 'clock',
                color: '--fg-warning-normal',
            },
            {
                name: 'palm',
                color: '--fg-on-positive-weak',
            }
        ];
        let iconHTML = '';
        for (const icon of icons) {
            iconHTML += window.getIcon(icon.name, 'mod-homework-icon' + (activeIcon == icon.name ? ' mod-active' : ''), 'var(' + icon.color + ')', 'data-icon="' + icon.name + '" ');
        }
        const col = window.getComputedStyle(document.documentElement).getPropertyValue('--fg-warning-normal');
        return '<div style="display:flex;margin-top:20px;align-items:center;gap:10px;flex-wrap:wrap;">' + iconHTML + '<label tabindex="0" for="homeworkcolor" style="margin-left:auto;cursor:pointer;">Kleur kiezen</label><input style="display:none;" value="' + ((activeColor && activeColor.startsWith('#')) ? activeColor : col) + '" id="homeworkcolor" type="color"></div>';
    }

    // Called for each day/week in the roster
    function customHomeworkInner(element, startIndex, recurringTasksEndIndex) {
        if (homeworkBusy) {
            return;
        }
        const currentStudiewijzerDate = ariaLabelToDate(element.classList.contains('week') ? element.nextElementSibling : element);
        const isWeek = !n(element.getElementsByClassName('header')[0]);
        if (n(element.getElementsByClassName('mod-add-homework')[0])) {
            element.insertAdjacentHTML('beforeend', '<div class="mod-add-homework">' + window.getIcon('plus') + 'Taak toevoegen</div>');
            element.getElementsByClassName('mod-add-homework')[0].addEventListener('click', function () {
                modMessage('Taak toevoegen', 'Voeg je eigen taak toe aan de kalender. De taak wordt alleen in deze ' + (platform == 'Android' ? 'app' : 'browser') + ' opgeslagen.</p>' +
                    '<input id="mod-homework-subject" type="text" placeholder="Vul een vak in"><div class="br"></div><textarea id="mod-homework-description" placeholder="Vul een taak in"></textarea>' +
                    '<div class="mod-multi-choice" id="studiewijzer-afspraak-toevoegen-select"><span class="active" tabindex="0">Eenmalig</span><span tabindex="0">Wekelijks</span>' + (isWeek ? '' : '<span tabindex="0">Maandelijks</span>') + '</div>' +
                    customHomeworkIcons('edit') +
                    '<p>', 'Toevoegen', 'Annuleren');
                for (const element of cn('mod-homework-icon')) {
                    element.addEventListener('click', function () {
                        cn('mod-homework-icon mod-active', 0).classList.remove('mod-active');
                        this.classList.add('mod-active');
                    })
                }
                id('homeworkcolor').addEventListener('input', function () {
                    for (const element of cn('mod-homework-icon')) {
                        element.children[0].setAttribute('fill', this.value);
                    }
                });
                id('mod-message-action1').addEventListener('click', function () {
                    const dateObject = ariaLabelToDate(element.classList.contains('week') ? element.nextElementSibling : element);
                    homework.push({
                        'id': (Math.random() + '' + window.performance.now()).replaceAll('.', ''),
                        'date': dateObject,
                        'subject': id('mod-homework-subject').value,
                        'description': id('mod-homework-description').value,
                        'done': (id('studiewijzer-afspraak-toevoegen-select').children[0].classList.contains('active') ? false : {}),
                        'returning': (id('studiewijzer-afspraak-toevoegen-select').children[1].classList.contains('active') ? '1' : (id('studiewijzer-afspraak-toevoegen-select').children[0].classList.contains('active') ? '0' : '2')),
                        'week': isWeek,
                        'icon': cn('mod-homework-icon mod-active', 0).dataset.icon,
                        'color': cn('mod-homework-icon mod-active', 0).children[0].getAttribute('fill'),
                    });
                    // Mostly sort by date
                    homework.sort(sortByDate);
                    // Remove old homework
                    for (let i = 0; i < homework.length; i++) {
                        if (homework[i].returning == '0' && (new Date().getFullYear() - new Date(Date.parse(homework[i].date)).getFullYear() >= 2)) {
                            homework.splice(i, 1);
                            i--;
                        }
                    }
                    set('homework', JSON.stringify(homework));
                    execute([customHomework]);
                    closeModMessage();
                });
                id('mod-message-action2').addEventListener('click', closeModMessage);
                for (const element of cn('mod-multi-choice')) {
                    for (const child of element.children) {
                        child.addEventListener('click', function () {
                            if (this.parentElement.getElementsByClassName('active')[0]) {
                                this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                            }
                            this.classList.add('active');
                        });
                    }
                }
            });
        }
        let lastShown = 0;
        if (!isNaN(currentStudiewijzerDate)) {
            function addHomework(j) {
                let i = j;
                let lastRecurring = homework[i].returning;
                const taskId = homework[i].id;
                function updateIndex() {
                    i = 0;
                    for (const homeworkObject of homework) {
                        if (homeworkObject.id == taskId) {
                            break;
                        }
                        else if (i > homework.length) {
                            return;
                        }
                        else {
                            i++;
                        }
                    }
                }
                let homeworkDate = new Date(Date.parse(homework[i].date));
                const showIfOnce = currentStudiewijzerDate.getFullYear() == homeworkDate.getFullYear() && currentStudiewijzerDate.getMonth() == homeworkDate.getMonth() && currentStudiewijzerDate.getDate() == homeworkDate.getDate();
                const showIfWeekly = homework[i].returning == '1' && currentStudiewijzerDate.getTime() >= homeworkDate.getTime() && currentStudiewijzerDate.getDay() == homeworkDate.getDay();
                const showIfMonthly = homework[i].returning == '2' && currentStudiewijzerDate.getTime() >= homeworkDate.getTime() && currentStudiewijzerDate.getDate() == homeworkDate.getDate() && !isWeek;
                if ((showIfOnce || showIfWeekly || showIfMonthly) && n(element.getElementsByClassName('mod-homework-' + homework[i].id)[0]) && ((isWeek && homework[i].week) || (!isWeek && !homework[i].week))) {
                    lastShown = i;
                    let insertElement;
                    const studiewijzerItems = element.getElementsByTagName('sl-studiewijzer-items')[0];
                    if (studiewijzerItems && !studiewijzerItems.classList.contains('mod-added') && studiewijzerItems.childElementCount == 0) {
                        studiewijzerItems.classList.add('mod-added');
                    }
                    else if (n(studiewijzerItems)) {
                        if (element.getElementsByClassName('header')[0]) {
                            element.getElementsByClassName('header')[0].insertAdjacentHTML('afterend', '<sl-studiewijzer-items class="mod-added"></sl-studiewijzer-items>');
                        }
                        else if (element.getElementsByClassName('dag-header')[0]) {
                            element.getElementsByClassName('dag-header')[0].insertAdjacentHTML('afterend', '<sl-studiewijzer-items class="mod-added"></sl-studiewijzer-items>');
                        }
                        else {
                            element.insertAdjacentHTML('beforeend', '<sl-studiewijzer-items class="mod-added mod-rooster"></sl-studiewijzer-items>');
                        }
                    }
                    let done;
                    // Weekly/monthly task
                    if (typeof homework[i].done === 'object') {
                        done = homework[i].done[currentStudiewijzerDate.getTime()] == true;
                    }
                    else {
                        done = homework[i].done;
                    }
                    if (done) {
                        insertElement = element.getElementsByTagName('sl-studiewijzer-items')[0];
                    }
                    else {
                        insertElement = element.getElementsByClassName('header')[0] ? element.getElementsByClassName('header')[0] : (element.getElementsByClassName('dag-header')[0] ? element.getElementsByClassName('dag-header')[0] : element.getElementsByTagName('sl-studiewijzer-items')[0]);
                    }
                    if (!n(insertElement)) {
                        const noMoving = element.getElementsByTagName('sl-studiewijzer-items')[0] && element.getElementsByTagName('sl-studiewijzer-items')[0].classList.contains('mod-rooster');
                        insertElement.insertAdjacentHTML('afterend', '<div class="mod-huiswerk ' + (done ? 'mod-huiswerk-done' : (noMoving ? '' : 'mod-before')) + ' mod-homework-' + homework[i].id + '"' + (homework[i].color ? ' style="border-left-color:' + homework[i].color + '"' : '') + '>' + window.getIcon(homework[i].icon ? homework[i].icon : 'edit', null, homework[i].color) + '<strong>' + sanitizeString(homework[i].subject) + '</strong><p>' + sanitizeString(homework[i].description) + '</p><div><svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" viewBox="0 0 24 24" display="block"><path fill-rule="evenodd" d="m9.706 21.576 13.876-14.05c.538-.55.56-1.43.044-1.998l-2.769-3.06a1.41 1.41 0 0 0-2.076-.025L9.83 11.858a1.41 1.41 0 0 1-2.06-.01L5.424 9.342a1.414 1.414 0 0 0-2.041-.032l-2.96 2.982a1.45 1.45 0 0 0 .003 2.052l7.27 7.242c.56.555 1.455.552 2.01-.01"></path></svg></div></div>');
                        const homeworkItem = insertElement.nextElementSibling;
                        const homeworkClassName = 'mod-homework-' + homework[i].id;
                        function saveAdjustedHomework(e) {
                            updateIndex();
                            e.stopPropagation();
                            homework[i].subject = id('mod-homework-subject').value;
                            homework[i].description = id('mod-homework-description').value;
                            homework[i].returning = id('studiewijzer-afspraak-toevoegen-select').children[1].classList.contains('active') ? '1' : (id('studiewijzer-afspraak-toevoegen-select').children[0].classList.contains('active') ? '0' : '2');
                            homework[i].icon = cn('mod-homework-icon mod-active', 0).dataset.icon;
                            homework[i].color = cn('mod-homework-icon mod-active', 0).children[0].getAttribute('fill');
                            const isRecurringAdjusted = lastRecurring != homework[i].returning;
                            lastRecurring = homework[i].returning;
                            for (const element of cn(homeworkClassName)) {
                                element.getElementsByTagName('strong')[0].innerHTML = sanitizeString(homework[i].subject);
                                element.getElementsByTagName('p')[0].innerHTML = sanitizeString(homework[i].description);;
                                element.getElementsByTagName('svg')[0].outerHTML = window.getIcon(homework[i].icon ? homework[i].icon : 'edit', null, homework[i].color);
                                element.style.borderLeftColor = homework[i].color;
                            }
                            set('homework', JSON.stringify(homework));
                            if (isRecurringAdjusted) {
                                homeworkBusy = true;
                                document.querySelectorAll('.' + homeworkClassName).forEach(e => e.remove());
                                homeworkBusy = false;
                            }
                            closeModMessage();
                        }
                        homeworkItem.addEventListener('click', function () {
                            updateIndex();
                            modMessage('', '</p>' +
                                '<input id="mod-homework-subject" type="text" value="' + sanitizeString(homework[i].subject) + '" style="font-weight:700;font-size:20px;margin-top:-20px;"><div class="br"></div>' +
                                '<textarea id="mod-homework-description" oninput="document.getElementById(\'mod-message-action1\').innerHTML = \'Opslaan\';">' + sanitizeString(homework[i].description) + '</textarea>' +
                                '<div class="mod-multi-choice" id="studiewijzer-afspraak-toevoegen-select"><span' + (homework[i].returning == '0' ? ' class="active"' : '') + ' tabindex="0">Eenmalig</span><span' + (homework[i].returning == '1' ? ' class="active"' : '') + ' tabindex="0">Wekelijks</span>' + (isWeek ? '' : '<span' + (homework[i].returning == '2' ? ' class="active"' : '') + ' tabindex="0">Maandelijks</span>') + '</div>' +
                                customHomeworkIcons(homework[i].icon, homework[i].color) +
                                '<p>', 'Sluiten', 'Taak verwijderen', null, true, true);
                            for (const element of cn('mod-homework-icon')) {
                                element.addEventListener('click', function () {
                                    cn('mod-homework-icon mod-active', 0).classList.remove('mod-active');
                                    this.classList.add('mod-active');
                                })
                            }
                            id('homeworkcolor').addEventListener('input', function () {
                                for (const element of cn('mod-homework-icon')) {
                                    element.children[0].setAttribute('fill', this.value);
                                }
                            });
                            id('mod-message-action1').addEventListener('click', saveAdjustedHomework);
                            id('mod-message-action2').addEventListener('click', function (e) {
                                updateIndex();
                                e.stopPropagation();
                                homework.splice(i, 1);
                                set('homework', JSON.stringify(homework));
                                homeworkBusy = true;
                                document.querySelectorAll('.' + homeworkClassName).forEach(e => e.remove());
                                homeworkBusy = false;
                                closeModMessage();
                            });
                            id('mod-message').addEventListener('click', function () {
                                closeModMessage();
                                tn('sl-root', 0).inert = false;
                                if (tn('sl-modal', 0)) {
                                    tn('sl-modal', 0).inert = false;
                                }
                            });
                            for (const element of cn('mod-multi-choice')) {
                                for (const child of element.children) {
                                    child.addEventListener('click', function () {
                                        if (this.parentElement.getElementsByClassName('active')[0]) {
                                            this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                                        }
                                        this.classList.add('active');
                                    });
                                }
                                setHTML(id('mod-message-action1'), 'Opslaan');
                            }
                        });
                        homeworkItem.getElementsByTagName('div')[0].addEventListener('click', function (e) {
                            updateIndex();
                            e.stopPropagation();
                            const noMoving = element.getElementsByTagName('sl-studiewijzer-items')[0] && element.getElementsByTagName('sl-studiewijzer-items')[0].classList.contains('mod-rooster');
                            // Unchecking homework
                            // We place the item above native homework, and above checked Somtoday Mod homework
                            if (homeworkItem.classList.contains('mod-huiswerk-done')) {
                                homeworkItem.classList.remove('mod-huiswerk-done');
                                homeworkItem.classList.remove('mod-huiswerk-animation');
                                // Weekly/monthly task
                                if (typeof homework[i].done === 'object') {
                                    homework[i].done[currentStudiewijzerDate.getTime()] = false;
                                }
                                // Single task
                                else {
                                    homework[i].done = false;
                                }
                                if (!noMoving) {
                                    if (n(element.getElementsByTagName('sl-studiewijzer-items')[0]) && element.getElementsByClassName('dag-header')[0]) {
                                        element.insertBefore(homeworkItem, element.getElementsByClassName('dag-header')[0].nextSibling);
                                    }
                                    else {
                                        element.insertBefore(homeworkItem, element.getElementsByTagName('sl-studiewijzer-items')[0]);
                                    }
                                    homeworkItem.classList.add('mod-before');
                                }
                            }
                            // Checking homework
                            // We always want to place the item as low as possible, since checked items always move to the bottom
                            else {
                                homeworkItem.classList.add('mod-huiswerk-done');
                                if (!noMoving) {
                                    let nextElement = homeworkItem.nextElementSibling;
                                    let isOnSamePosition = true;
                                    // If there is native Somtoday homework, we know that the item can't be at
                                    if (element.getElementsByTagName('sl-studiewijzer-item').length > 0) {
                                        isOnSamePosition = false;
                                    }
                                    else {
                                        // If there is "fake" Somtoday Mod homework, we also check 
                                        let loopBreak = 0;
                                        while (loopBreak < 100 && !nextElement.classList.contains('mod-add-homework')) {
                                            if (nextElement.classList.contains('mod-huiswerk')) {
                                                isOnSamePosition = false;
                                                break;
                                            }
                                            nextElement = nextElement.nextElementSibling;
                                            loopBreak++;
                                        }
                                    }
                                    let hoursToMove = element.getElementsByClassName('mod-huiswerk').length - 1;
                                    hoursToMove += element.getElementsByTagName('sl-studiewijzer-item').length;
                                    if (hoursToMove > 0 && !isOnSamePosition) {
                                        homeworkItem.style.setProperty('--mod-hours-to-move', hoursToMove);
                                        homeworkItem.classList.add('mod-huiswerk-animation');
                                        element.getElementsByClassName('mod-add-homework')[0].insertAdjacentHTML('beforebegin', '<div class="mod-huiswerk mod-placeholder" style="visibility:hidden;"></div>');
                                        homeworkItem.addEventListener('animationend', () => {
                                            if (element.getElementsByClassName('mod-placeholder')[0]) {
                                                element.getElementsByClassName('mod-placeholder')[0].remove();
                                            }
                                        });
                                    }
                                }
                                // Weekly/monthly task
                                if (typeof homework[i].done === 'object') {
                                    homework[i].done[currentStudiewijzerDate.getTime()] = true;
                                }
                                // Single task
                                else {
                                    homework[i].done = true;
                                }
                                if (!noMoving) {
                                    element.insertBefore(homeworkItem, element.getElementsByClassName('mod-add-homework')[0]);
                                    homeworkItem.classList.remove('mod-before');
                                }
                            }
                            set('homework', JSON.stringify(homework));
                        });
                    }
                }
                else if (homework[i].returning == '0' && lastShown != 0) {
                    return true;
                }
                return false;
            }
            for (let j = 0; j < recurringTasksEndIndex; j++) {
                if (addHomework(j)) {
                    break;
                }
            }
            for (let j = startIndex; j < homework.length; j++) {
                if (addHomework(j)) {
                    break;
                }
            }
        }
        return lastShown;
    }

    // Add a menu bar on top of the page
    function topMenu() {
        if (get('layout') == 5 && n(id('mod-top-menu'))) {
            tn('body', 0).insertAdjacentHTML('beforeend', '<div id="mod-top-menu"><h2 id="mod-top-menu-title">Titel</h2><div id="mod-logout">' + window.getIcon("right-from-bracket") + '</div><div id="mod-messages">' + window.getIcon("envelope") + '</div><div id="mod-profile-link"></div></div>');
            id('mod-profile-link').addEventListener('click', function () {
                cn('menu-avatar', 0).click();
            });
            id('mod-logout').addEventListener('click', function () {
                cn('menu-avatar', 0).click();
                tryRemove(id('mod-top-menu'));
                let checkLogoutButtonPresent = setInterval(function () {
                    if (cn('selector-option uitloggen', 0)) {
                        cn('selector-option uitloggen', 0).click();
                        clearInterval(checkLogoutButtonPresent);
                    }
                }, 10);
            });
            id('mod-messages').addEventListener('click', function () {
                tn('sl-tab-item', 3).click();
            });
        }
        else if (get('layout') != 5) {
            tryRemove(id('mod-top-menu'));
        }
        else if (cn('avatar', 0) && cn('avatar', 0).getElementsByClassName('foto')[0] && id('mod-profile-link')) {
            id('mod-profile-link').innerHTML = '<div>' + (cn('avatar', 0).getElementsByClassName('foto')[0].classList.contains('hidden') ? '<span>' + ((cn('avatar', 0).getElementsByClassName('initials')[0] && cn('avatar', 0).getElementsByClassName('initials')[0].children[0]) ? cn('avatar', 0).getElementsByClassName('initials')[0].children[0].innerHTML : '?') + '</span>' : '<img src="' + (n(get('profilepic')) ? cn('avatar', 0).getElementsByClassName('foto')[0].src : get('profilepic')) + '" />') + '</div>';
        }
        if (id('mod-top-menu-title')) {
            let headerText = '';
            for (const element of tn('sl-tab-item')) {
                if (element.classList.contains('active')) {
                    headerText = element.getElementsByTagName('span')[0].innerHTML;
                }
            }
            if (n(headerText)) {
                if (cn('desktop-title', 0)) {
                    headerText = cn('desktop-title', 0).innerHTML;
                }
                else if (tn('sl-scrollable-title', 0)) {
                    headerText = tn('sl-scrollable-title', 0).innerHTML;
                }
            }
            id('mod-top-menu-title').innerHTML = headerText;
        }
    }

    // Reveal new grades with an animation
    function gradeReveal() {
        if (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) != '0') {
            if (tn('sl-laatsteresultaten', 0) && tn('sl-resultaat-item', 0)) {
                let i = 0;
                const lastGrade = get('lastgrade');
                const lastGradeTitle = get('lastgradetitle');
                const lastGradeDescription = get('lastgradedescription');
                for (const element of cn('cijfer')) {
                    if (element.classList.contains('mod-animation-finished')) {
                        break;
                    }
                    if (!n(element.children[0])) {
                        if (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) == '1' && (element.children[0].innerHTML == lastGrade && (n(element.parentElement.parentElement.parentElement.getElementsByClassName('titel')[0]) || element.parentElement.parentElement.parentElement.getElementsByClassName('titel')[0].innerHTML == lastGradeTitle) && (n(element.parentElement.parentElement.parentElement.getElementsByClassName('subtitel')[0]) || element.parentElement.parentElement.parentElement.getElementsByClassName('subtitel')[0].innerHTML.split('• ')[1] == lastGradeDescription))) {
                            break;
                        }
                        else if (i == 0) {
                            set('lastgrade', element.children[0].innerHTML);
                            set('lastgradetitle', element.parentElement.parentElement.parentElement.getElementsByClassName('titel')[0].innerHTML);
                            set('lastgradedescription', element.parentElement.parentElement.parentElement.getElementsByClassName('subtitel')[0].innerHTML.split('• ')[1]);
                        }
                        element.classList.add('mod-animation-finished');
                        if (!isNaN(parseFloat(element.children[0].innerHTML))) {
                            countAnimation(element.children[0], 0, parseFloat(element.children[0].innerHTML.replace(',', '.')), 3500, 30);
                        }
                        i++;
                    }
                }
            }
        }
    }

    // Simple count animation
    function countAnimation(element, begin, target, time, update, className, elapsedTime) {
        if (elapsedTime === undefined) {
            elapsedTime = 0;
            className = element.parentElement.getAttribute('class');
        }
        elapsedTime += update;

        let result = target;
        if (elapsedTime < time) {
            let t = elapsedTime / time;
            let ease = 1 - Math.pow(1 - t, 5);
            result = begin + (target - begin) * ease;

            element.parentElement.classList.remove('onvoldoende');
            element.parentElement.classList.remove('ruimvoldoende');
            if (result < 5.5) {
                // Jullie hebben allemaal een onvoldoende
                element.parentElement.classList.add('onvoldoende');
            }
            if (result >= 8.0) {
                // Of nee, toch niet
                element.parentElement.classList.add('ruimvoldoende');
            }

            setTimeout(countAnimation, update, element, begin, target, time, update, className, elapsedTime);
        }
        else {
            element.parentElement.setAttribute('class', className);
        }

        element.innerHTML = result.toFixed(1).replace('.', ',');
    }

    const settingKeys = ['primarycolor', 'secondarycolor', 'nicknames', 'bools', 'title', 'icon', 'background', 'backgroundtype', 'backgroundcolor', 'livetype', 'livecolor1', 'livecolor2', 'livecolor3', 'ui', 'uiblur', 'fontname', 'theme', 'preset', 'layout', 'profilepic', 'username', 'brightness', 'contrast', 'saturate', 'opacity', 'huerotate', 'grayscale', 'sepia', 'invert', 'blur', 'homework', 'menuwidth', 'isbackgroundvideo', 'customfont', 'customfontname', 'letterbeoordelingen', 'customcss'];
    function exportSettings() {
        let settings = {};
        for (const key of settingKeys) {
            settings[key] = get(key);
        }
        let i = 0;
        while (!n(get('background' + i))) {
            settings['background' + i] = get('background' + i);
            i++;
        }
        let json = JSON.stringify(settings);
        let saveData = (function () {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            return function (fileName) {
                var blob = new Blob([json], { type: "octet/stream" }),
                    url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            };
        }());

        saveData('config.json');
    }

    function parseJSON(str) {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }
        return json;
    }

    // Ensure the new value is valid
    async function keyIsValid(key, value) {
        if (value == null) {
            return false;
        }
        if (key == 'primarycolor' || key == 'secondarycolor' || key == 'backgroundcolor') {
            return /^#[0-9a-fA-F]{6}$/.test(value);
        }
        else if (key == 'bools') {
            return /^(0|1){18,}$/.test(value);
        }
        else if (key == 'ui' || key == 'uiblur') {
            return value >= 0 && value <= 100;
        }
        else if (key == 'menuwidth') {
            return value >= 50 && value <= 700;
        }
        else if (key == 'brightness' || key == 'contrast' || key == 'saturate' || key == 'opacity' || key == 'grayscale' || key == 'sepia' || key == 'invert') {
            return /^\d+%$/.test(value);
        }
        else if (key == 'huerotate') {
            return /^\d+deg$/.test(value);
        }
        else if (key == 'blur') {
            return /^\d+(\.\d+)?px$/.test(value);
        }
        else if (key == 'layout') {
            return value >= 1 && value <= 5;
        }
        else if (key == 'nicknames') {
            const json = parseJSON(value);
            if (json === null || !(json instanceof Array)) {
                return false;
            }
            let mayContainHTMLTag = false;
            let i = 0;
            for (const nickname of json) {
                if (nickname.length != 2 && nickname.length != 3) {
                    return false;
                }
                if (/<\/?[a-z][\s\S]*>/i.test(nickname[0]) || /<\/?[a-z][\s\S]*>/i.test(nickname[1])) {
                    mayContainHTMLTag = true;
                    json[i][0] = sanitizeString(nickname[0]);
                    json[i][1] = sanitizeString(nickname[1]);
                    if (nickname.length == 3 && /<\/?[a-z][\s\S]*>/i.test(nickname[2])) {
                        json[i][2] = sanitizeString(nickname[2]);
                    }
                }
                i++;
            }
            if (mayContainHTMLTag) {
                while (id('mod-message')) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                modMessage('Onveilige instellingswaarde', 'Het lijkt erop dat de instellingswaarde voor "Nicknames" HTML-elementen bevat, waarmee er onveilige code op je computer uitgevoerd kan worden. Wil je deze HTML elementen weghalen voor de veiligheid?', 'Weghalen', 'Behouden', false, true);
                id('mod-message-action1').addEventListener('click', function () {
                    set('nicknames', JSON.stringify(json));
                    closeModMessage();
                    saveReload(true);
                    tn('sl-root', 0).inert = false;
                    if (tn('sl-modal', 0)) {
                        tn('sl-modal', 0).inert = false;
                    }
                });
                id('mod-message-action2').addEventListener('click', function () {
                    set('nicknames', value);
                    closeModMessage();
                    saveReload(true);
                    tn('sl-root', 0).inert = false;
                    if (tn('sl-modal', 0)) {
                        tn('sl-modal', 0).inert = false;
                    }
                });
                return null;
            }
            return true;
        }
        else if (key == 'username') {
            if (/<\/?[a-z][\s\S]*>/i.test(value)) {
                while (id('mod-message')) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                modMessage('Onveilige instellingswaarde', 'Het lijkt erop dat de instellingswaarde voor "Username" HTML-elementen bevat, waarmee er onveilige code op je computer uitgevoerd kan worden. Wil je deze HTML elementen weghalen voor de veiligheid?', 'Weghalen', 'Behouden', false, true);
                id('mod-message-action1').addEventListener('click', function () {
                    set('username', sanitizeString(value));
                    closeModMessage();
                    saveReload(true);
                    tn('sl-root', 0).inert = false;
                    if (tn('sl-modal', 0)) {
                        tn('sl-modal', 0).inert = false;
                    }
                });
                id('mod-message-action2').addEventListener('click', function () {
                    set('username', value);
                    closeModMessage();
                    saveReload(true);
                    tn('sl-root', 0).inert = false;
                    if (tn('sl-modal', 0)) {
                        tn('sl-modal', 0).inert = false;
                    }
                });
                return null;
            }
            return true;
        }
        else if (key == 'homework' || key == 'letterbeoordelingen') {
            return parseJSON(value) !== null;
        }
        else if (key == 'icon' || key == 'background' || key == 'profilepic' || key == 'customfont') {
            return value.startsWith('data:');
        }
        else if (key == 'backgroundtype') {
            return (value == 'image' || value == 'color' || value == 'slideshow' || value == 'live');
        }
        else if (key == 'fontname') {
            return fonts.includes(value);
        }
        else if (key == 'isbackgroundvideo') {
            return (value === true || value === false || value === 'true' || value === 'false');
        }

        return true;
    }

    async function importSettings() {
        execute([reset]);
        new Response(this.files[0]).json().then(json => {
            let closeModMessages = true;
            modMessage('Laden...', 'Dit kan even duren als je veel afbeeldingen hebt ingesteld...');
            Object.keys(json).forEach(async function (key) {
                if (settingKeys.includes(key)) {
                    const isValid = await keyIsValid(key, json[key]);
                    if (isValid) {
                        set(key, json[key]);
                    }
                    else if (isValid === null) {
                        closeModMessages = false;
                    }
                }
            });
            saveReload(true);
            tn('sl-root', 0).inert = false;
            if (tn('sl-modal', 0)) {
                tn('sl-modal', 0).inert = false;
            }
            if (closeModMessages) {
                closeModMessage();
            }
            // For some reason it sometimes needs a timeout to load properly
            setTimeout(function () {
                saveReload(true);
            }, 1000);
        }, err => {
            modMessage('Oeps...', 'Het lijkt erop dat dit bestand ongeldig is.', 'Oke');
            id('mod-message-action1').addEventListener('click', closeModMessage);
        });
    }

    // Add new year countdown
    let newYearCountdownClosed = false;
    function newYearCountdown() {
        const now = new Date();
        const newYear = new Date(now.getFullYear() + 1, 0, 1);
        const diff = newYear - now;
        if ((ignoreCountdownConditions || (get('bools').charAt(BOOL_INDEX.EVENTS) == '1' && Math.floor(diff / (1000 * 60 * 60 * 24)) <= 7)) && !newYearCountdownClosed && !id('mod-new-year')) {
            const rosterContainer = document.querySelector('sl-rooster-weken');
            if (rosterContainer) {
                const parent = document.createElement('div');
                parent.id = 'mod-new-year';
                const div = document.createElement('div');
                div.id = 'mod-new-year-fireworks';
                parent.appendChild(div);
                const button = document.createElement('button');
                button.innerHTML = '&times;';
                button.addEventListener('click', function () {
                    newYearCountdownClosed = true;
                    this.parentElement.style.height = '0px';
                    this.parentElement.style.padding = '0px';
                    setTimeout(function () {
                        if (this && this.parentElement) {
                            this.parentElement.remove();
                        }
                    }, 500);
                });
                parent.appendChild(button);
                const h3 = document.createElement('h3');
                h3.innerText = 'Aftellen tot het nieuwe jaar!';

                const yearDuration = (1000 * 60 * 60 * 24 * 365.25);
                let texts = [
                    'Wat is jouw goede voornemen?',
                    'Ga jij volgend jaar voor de 10\'en?',
                    'Al bijna nieuwjaar!',
                    'KERSTVAKANTIE!!! (en bijna nieuwjaar dus)',
                    'Al zin in volgend jaar?',
                    'Wat ga je doen in de vakantie?',
                    'Neem tijd voor zelfreflectie en ga gamen ofzo',
                    'Alvast een fijne kerst en gelukkig nieuwjaar!',
                    'Ga naar buiten en gooi een sneeuwbal (of aardebal als er geen sneeuw ligt)',
                    'OLIEBOLLEN ZIJN LEKKER!!!',
                    'Op {percentage}% van dit jaar',
                    'Als je je huiswerk verbrandt, is het dan vuurwerk?',
                    'Vanaf 1 januari is het {next_year}',
                    'Volgend jaar wordt minstens 10x beter',
                    'Nog ongeveer {seconds_to_next_year} seconden',
                    'Over ≈{seconds_to_next_year} seconden is {year} voorbij',
                    'Nog maar even...'
                ];
                let current;

                setInterval(function () {
                    const now = new Date();
                    const diff = newYear - now;
                    if (diff <= 0) {
                        return;
                    }
                    let random = Math.floor(Math.random() * texts.length);
                    while (current == random) {
                        random = Math.floor(Math.random() * texts.length);
                    }
                    current = random;
                    h3.innerText = texts[current]
                        .replace('{percentage}', ((yearDuration - diff) / yearDuration * 100).toFixed(3).replace('.', ','))
                        .replace('{seconds_to_next_year}', Math.round(diff / 1000))
                        .replace('{next_year}', now.getFullYear() + 1)
                        .replace('{year}', now.getFullYear());
                    h3.classList.add('mod-letter-slide');
                    setTimeout(function () {
                        h3.classList.remove('mod-letter-slide');
                    }, 500);
                }, 10000);

                parent.appendChild(h3);
                const countdownElement = document.createElement('div');
                for (let i = 0; i < 4; i++) {
                    const div = document.createElement('div');
                    const p = document.createElement('p');
                    div.appendChild(p);
                    const span = document.createElement('span');
                    div.appendChild(span);
                    countdownElement.appendChild(div);
                }
                parent.appendChild(countdownElement);
                rosterContainer.parentElement.insertAdjacentElement('beforebegin', parent);
                const fireworks = new Fireworks.default(id('mod-new-year-fireworks'), {
                    intensity: 12,
                    traceSpeed: 7,
                });
                fireworks.start();
                window.addEventListener('visibilitychange', function () {
                    if (document.visibilityState === 'hidden') {
                        fireworks.stop();
                    }
                    else {
                        fireworks.start();
                    }
                });

                const p1 = countdownElement.children[0].getElementsByTagName('p')[0];
                const p2 = countdownElement.children[1].getElementsByTagName('p')[0];
                const p3 = countdownElement.children[2].getElementsByTagName('p')[0];
                const p4 = countdownElement.children[3].getElementsByTagName('p')[0];
                function updateCountdown() {
                    const now = new Date();
                    const diff = newYear - now;

                    const days = Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0);
                    const hours = Math.max(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), 0);
                    const minutes = Math.max(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), 0);
                    const seconds = Math.max(Math.floor((diff % (1000 * 60)) / 1000), 0);

                    if (p1.innerText !== days.toString()) {
                        p1.classList.add('mod-letter-slide');
                        p1.innerText = days;
                        countdownElement.children[0].getElementsByTagName('span')[0].innerText = days == 1 ? 'dag' : 'dagen';
                        setTimeout(function () {
                            p1.classList.remove('mod-letter-slide');
                        }, 500);
                    }
                    if (p2.innerText !== hours.toString()) {
                        p2.classList.add('mod-letter-slide');
                        p2.innerText = hours;
                        countdownElement.children[1].getElementsByTagName('span')[0].innerText = hours == 1 ? 'uur' : 'uren';
                        setTimeout(function () {
                            p2.classList.remove('mod-letter-slide');
                        }, 500);
                    }
                    if (p3.innerText !== minutes.toString()) {
                        p3.classList.add('mod-letter-slide');
                        p3.innerText = minutes;
                        countdownElement.children[2].getElementsByTagName('span')[0].innerText = minutes == 1 ? 'minuut' : 'minuten';
                        setTimeout(function () {
                            p3.classList.remove('mod-letter-slide');
                        }, 500);
                    }
                    if (p4.innerText !== seconds.toString()) {
                        p4.classList.add('mod-letter-slide');
                        p4.innerText = seconds;
                        countdownElement.children[3].getElementsByTagName('span')[0].innerText = seconds == 1 ? 'seconde' : 'seconden';
                        setTimeout(function () {
                            p4.classList.remove('mod-letter-slide');
                        }, 500);
                    }

                    // Check for new year
                    if (days == 0 && hours == 0 && minutes == 0 && seconds == 0 && !id('mod-fireworks')) {
                        h3.innerText = 'GELUKKIG NIEUWJAAR!';
                        const fireworkElement = document.createElement('div');
                        fireworkElement.id = 'mod-fireworks';
                        rosterContainer.insertAdjacentElement('beforebegin', fireworkElement);
                        const fireworks = new Fireworks.default(fireworkElement);
                        fireworks.start();
                        startConfetti();
                        window.addEventListener('visibilitychange', function () {
                            if (document.visibilityState === 'hidden') {
                                fireworks.stop();
                            }
                            else {
                                fireworks.start();
                            }
                        });
                    }
                }

                setInterval(updateCountdown, 1000);
                updateCountdown();
            }
        }
    }

    // Simplify the roster page, by aligning the lessons in a grid
    let timeIndicatorTop = 0;
    let normalRosterHeight = 0;
    function rosterSimplify() {
        // Every time the roster is modified, the week may have changed, so update custom homework as well
        execute([customHomework]);
        // Only execute roster simplify when enabled and on roster page
        if (get('bools').charAt(BOOL_INDEX.ROSTER_SIMPLIFY) == "1" && tn('sl-rooster-weken', 0)) {
            if (cn('tertiary normal action-primary-normal center', 0) && !cn('tertiary normal action-primary-normal center', 0).classList.contains('mod-vandaag-button-event-listener-added')) {
                // If "Vandaag" button is clicked Somtoday will load all weeks from scratch with js, within the pageUpdate timeout
                // This means rosterSimplify has to be called again with a delay
                cn('tertiary normal action-primary-normal center', 0).addEventListener('click', function () {
                    setTimeout(rosterSimplify, 5000);
                    setTimeout(rosterSimplify, 10000);
                });
                cn('tertiary normal action-primary-normal center', 0).classList.add('mod-vandaag-button-event-listener-added');
            }
            tn('sl-rooster-weken', 0).style.minHeight = 'calc(100vh - 175px)';
            // Get the height the roster takes up normally
            normalRosterHeight = Math.max(tn('sl-rooster-weken', 0).clientHeight, normalRosterHeight);
            // Loop through all loaded weeks and simplify them
            let currentTime = today.getHours() + (today.getMinutes() / 60);
            for (const parent of tn('sl-rooster-week')) {
                const isWeekShown = !parent.ariaHidden;
                let shouldUpdate = true;
                // Check if this week contains lessons without an hour number, if so just leave it like it is to prevent confusion (overlapping/aligning with different hour)
                for (const element of parent.getElementsByTagName('sl-rooster-item')) {
                    if (n(element.getElementsByClassName('opacity-80')[0]) || element.getElementsByClassName('opacity-80')[0].innerHTML.length == 0 || isNaN(parseInt(element.getElementsByClassName('opacity-80')[0].innerHTML.charAt(0)))) {
                        if (isWeekShown) {
                            tn('sl-rooster-weken', 0).style.height = normalRosterHeight + 'px';
                            tn('sl-rooster-weken', 0).style.overflowY = 'visible';
                            // Update the time text at the left to display 'hh:mm' instead of 'nth hour'
                            if (tn('sl-rooster-tijden', 0)) {
                                let i = 0;
                                for (const element of tn('sl-rooster-tijden', 0).children) {
                                    const span = element.getElementsByTagName('span')[0];
                                    if (!n(span) && !n(span.dataset.modOriginalContent)) {
                                        setHTML(span, span.dataset.modOriginalContent);
                                    }
                                    i++;
                                }
                            }
                        }
                        shouldUpdate = false;
                    }
                }
                if (shouldUpdate) {
                    let timeIndicatorPositioned = false;
                    // Position time indicator at end if it is past the last lesson
                    if (isWeekShown && cn('tijdlijn', 0)) {
                        let elements = cn('tijdlijn', 0).parentElement.getElementsByTagName('sl-rooster-item');
                        if (!n(elements[0]) && !n(elements[elements.length - 1].getElementsByClassName('opacity-80')[0])) {
                            // Get hour number from last hour
                            let hour = elements[elements.length - 1].getElementsByClassName('opacity-80')[0].innerHTML;
                            hour = parseInt(hour.substring(0, hour.length - 1));
                            // Get top value of last hour
                            let lastHourTop = elements[elements.length - 1].style.top;
                            lastHourTop = parseInt(lastHourTop.substring(0, lastHourTop.length - 2));
                            // Get top value of time indicator
                            timeIndicatorTop = cn('tijdlijn', 0).style.top;
                            timeIndicatorTop = parseInt(timeIndicatorTop.substring(0, timeIndicatorTop.length - 2));
                            // If the top value of the last hour is less than the top value of the time indicator the time indicator should be repositioned
                            if (!isNaN(hour) && !isNaN(lastHourTop) && !isNaN(timeIndicatorTop) && lastHourTop < timeIndicatorTop) {
                                cn('tijdlijn', 0).style.top = (hour * 84) + 'px';
                                timeIndicatorTop = (hour * 84);
                                timeIndicatorPositioned = true;
                            }
                        }
                    }
                    // Loop through every lesson in the week and reposition it
                    let prevHour = 1;
                    let prevHeight = 0;
                    let lastHour = 1;
                    for (const element of parent.getElementsByTagName('sl-rooster-item')) {
                        if (!n(element.getElementsByClassName('opacity-80')[0]) && !n(element.getElementsByClassName('opacity-80')[0].parentElement.children[1])) {
                            let hour = element.getElementsByClassName('opacity-80')[0].innerHTML;
                            hour = parseInt(hour.substring(0, hour.length - 1));
                            let lessonTime = element.getElementsByClassName('opacity-80')[0].parentElement.children[1].innerHTML.split(':');
                            lessonTime = parseFloat(lessonTime[0]) + (parseFloat(lessonTime[1]) / 60);
                            let top;
                            if (isNaN(hour)) {
                                top = prevHour * 84 + prevHeight - 84;
                                prevHour++;
                                if (prevHour > lastHour) {
                                    lastHour = prevHour;
                                }
                            }
                            else {
                                prevHour = hour;
                                top = hour * 84 - 84;
                                if (hour > lastHour) {
                                    lastHour = hour;
                                }
                            }
                            element.style.top = top + 'px';
                            if (isWeekShown && !isNaN(lessonTime) && cn('tijdlijn', 0) && (currentTime < lessonTime) && !timeIndicatorPositioned && !n(element.parentElement.getElementsByClassName('tijdlijn')[0])) {
                                if (cn('tijdlijn', 0)) {
                                    cn('tijdlijn', 0).style.top = top + 'px';
                                }
                                timeIndicatorTop = top;
                                timeIndicatorPositioned = true;
                            }
                            prevHeight = element.clientHeight;
                        }
                    }
                    if (isWeekShown) {
                        tn('sl-rooster-weken', 0).style.height = (Math.max(lastHour + 2, 5) * 84 - 54) + 'px';
                        tn('sl-rooster-weken', 0).style.overflowY = 'hidden';
                    }
                    if (tn('sl-vakantie-header', 0)) {
                        tn('sl-vakantie-header', 0).style.borderTop = 'none';
                    }
                    // Update the time text at the left to display 'nth hour' instead of 'hh:mm'
                    if (isWeekShown && tn('sl-rooster-tijden', 0)) {
                        let i = 1;
                        for (const element of tn('sl-rooster-tijden', 0).children) {
                            let span = element.getElementsByTagName('span')[0];
                            if (n(span)) {
                                if (tn('sl-rooster-tijden', 0).children[1]) {
                                    setHTML(element, tn('sl-rooster-tijden', 0).children[1].innerHTML);
                                    span = element.getElementsByTagName('span')[0];
                                    setHTML(span, ' ');
                                }
                            }
                            if (!n(span)) {
                                if (span.innerHTML.indexOf('uur') == -1) {
                                    span.dataset.modOriginalContent = span.innerHTML;
                                }
                                setHTML(span, i.toString() + 'e uur');
                            }
                            i++;
                        }
                    }
                }
            }
        }
    }

    // Apply style
    function style() {
        if (getRelativeLuminance(hexToRgb(get('primarycolor'))) >= 240) {
            menuColor = adjust(get('primarycolor'), -170);
        } else if (getRelativeLuminance(hexToRgb(get('primarycolor'))) >= 160) {
            menuColor = adjust(get('primarycolor'), -110);
        } else {
            menuColor = '#fff';
        }
        if (getRelativeLuminance(hexToRgb(get('primarycolor'))) >= 160) {
            highLightColor = adjust(get('primarycolor'), -35);
        } else {
            highLightColor = adjust(get('primarycolor'), 35);
        }
        while (cn('mod-style', 0)) {
            cn('mod-style', 0).remove();
        }
        if (get('bools').charAt(BOOL_INDEX.SCROLLBAR) == '0') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">html, body{scrollbar-width:none !important;}</style>');
        }
        if (get('bools').charAt(BOOL_INDEX.TEXT_SELECTION) == '1') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">*{user-select:auto !important;}</style>');
        }
        // General style
        tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">' + (get('bools').charAt(BOOL_INDEX.ROSTER_GRID) == '0' ? 'sl-rooster-week .uur{border-left:none !important;border-bottom:none !important;}' : '') + '</style>');
        tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (min-width:767px){:root{--min-content-vh:calc(100vh - ' + (get('layout') == '4' ? '66px' : '74px') + ') !important;}}</style>');
        // Font
        if (n(get('customfontname'))) {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@import url("' + fontUrl + '");*{font-family:"' + get('fontname') + '","Open Sans",sans-serif !important;' + ((get('fontname') == "Bebas Neue" || get('fontname') == "Oswald") ? "letter-spacing:1px;" : "") + '}</style>');
        }
        else {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@import url("' + fontUrl + '");@font-face{font-family:modCustomFont;src:url("' + get('customfont') + '");}*{font-family:modCustomFont,"Open Sans",sans-serif !important;}</style>');
        }
        // Make sure everything is readable with background with 100% ui transparency
        if (get('layout') != 4 && ((get('backgroundtype') == 'image' && !n(get('background'))) || (get('backgroundtype') == 'color') || (get('backgroundtype') == 'slideshow' && !n(get('background0'))) || get('backgroundtype') == 'live')) {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">hmy-switch-group:has(hmy-switch),sl-bericht-detail .header,sl-bericht-nieuw > .titel{border-radius:6px;padding:10px;background-color:var(--bg-neutral-none);}.content:has(sl-registraties){background:var(--mod-transparent);}sl-studiewijzer-week{border-bottom:2px solid var(--mod-transparent) !important;}sl-studiewijzer-dag{border-right:2px solid var(--mod-transparent) !important;}' + (get('bools').charAt(BOOL_INDEX.ROSTER_GRID) == '1' ? 'sl-rooster-week .uur{border-left:2px solid var(--mod-transparent) !important;border-bottom:2px solid var(--mod-transparent) !important;}' : '') + '.container:has(sl-vakresultaten){padding-bottom:0 !important;}sl-vakresultaten{background-color:var(--bg-neutral-none);padding:20px !important; padding-bottom:40px !important;}hmy-geen-data > span{margin-top:20px;}hmy-geen-data{background:var(--mod-ui-transparent);padding:30px 60px;border-radius:24px;}</style>');
        }
        // Adjust menu for layouts
        if (get('layout') == 2 || get('layout') == 3 || get('layout') == 5) {
            if (get('layout') == 2 || get('layout') == 3) {
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-popup{position:fixed !important;top:70px !important;}hmy-popup:has(sl-leerling-menu-acties){position:fixed !important;bottom:80px !important;top:unset !important;}@media (min-width:1280px){.header,.headers-container{top:0 !important;}div.berichten-lijst{height:calc(100vh - 64px) !important;}}</style>');
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (min-width: 767px){.berichten-lijst{height:calc(100vh - 129px) !important;}}@media (min-width:1280px){.menu-avatar{width:calc(100% - 12px * 2) !important;justify-content:center;}}</style>');
            }
            else {
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-sidebar-page{top: 0px !important; height: 100% !important;}sl-rooster-weken{margin-top:63px;}sl-registratie-overzicht{margin-top:50px;}sl-gepubliceerde-schoolinformatie-navigation{padding-top: 80px !important;;}sl-popup{position:fixed !important;top:130px !important;}hmy-popup:has(sl-leerling-menu-acties){position:fixed !important;top:65px !important;right:30px !important;left:unset !important;}#mod-top-menu{display:none;}@media (min-width: 767px) and (max-width:1279px){.berichten-lijst{height:calc(100vh - 129px) !important;}sl-header{height:0px !important;position:fixed !important;left: 0px !important;right: 0px !important;}}@media (min-width: 767px){sl-header{background:none !important;backdrop-filter:none !important;}#mod-new-year{margin-top:calc(64px + var(--safe-area-inset-top));}:root:has(sl-berichten){--safe-area-inset-top:64px !important;}body:has(sl-cijfers),body:has(sl-berichten) .tabs,body:has(sl-berichten) .main,sl-studiewijzer-weken{margin-top:63px;}.menu-avatar{position:fixed !important;top:25px;right:150px;left:unset !important;bottom:unset !important;opacity:0;}#mod-top-menu-title{color:var(--text-strong);}#mod-top-menu{display:block;border-bottom:var(--thinnest-solid-neutral-normal);background:var(--bg-neutral-none);position:' + (get('bools').charAt(BOOL_INDEX.MENU_ALWAYS_SHOW) == '1' ? 'fixed' : 'absolute') + ';top:0;left:var(--safe-area-inset-left);right:0;height:64px;z-index:50;}#mod-top-menu h2{margin:18px 24px;}#mod-profile-link:hover{filter:brightness(0.8);}#mod-profile-link{transition:0.2s filter ease;box-sizing:border-box;position:absolute;right:24px;cursor:pointer;top:0;bottom:0;height:100%;padding:15px;}#mod-logout{right:145px;}#mod-messages{right:90px;}#mod-logout,#mod-messages{cursor:pointer;position:absolute;padding:15px;top:0;}#mod-logout svg,#mod-messages svg{fill:var(--action-primary-normal);height:25px !important;margin-top:4px;transition:fill 0.2s ease;}#mod-logout:hover svg,#mod-messages:hover svg{fill:var(--action-primary-strong);}#mod-profile-link div{height:100%;aspect-ratio:1 / 1;background:var(--bg-primary-weak);overflow:hidden;border-radius:6px;}#mod-profile-link span{margin:6px 0;text-align:center;width:100%;display:block;font-weight:700;color:var(--fg-on-primary-weak);}#mod-profile-link img{width:100%;height:100%;object-fit:cover;}}</style>');
            }
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">.menu-avatar .hamburger { flex-shrink: 1; min-width: 0; } @media (min-width:1280px){:root{--safe-area-inset-' + (get('layout') != 3 ? 'left:120px' : 'right:120px') + ' !important;--min-content-vh:calc(100vh - var(--safe-area-inset-top) - var(--safe-area-inset-bottom)) !important;}sl-header > div:first-of-type i{--action-neutral-normal:' + menuColor + ';}#mod-logo-wrapper{width:120px;' + (get('layout') != 3 ? 'margin-left' : 'left') + ':calc((var(--safe-area-inset-' + (get('layout') != 3 ? 'left' : 'right') + ') - 120px) / 2);position:relative;}#mod-logo{width:65%;height:60px;margin:20px 0;position:relative;left:50%;transform:translateX(-50%);}sl-header sl-tab-bar{--action-neutral-normal:' + menuColor + ';--action-primary-normal:' + menuColor + ';position:absolute !important;width:100% !important;height:100% !important;display:block !important;overflow:hidden;}sl-header .item span{text-align:center;margin-top:10px;display:block;}sl-header .active .item, sl-header .item:hover{background:' + highLightColor + ' !important;padding-top:0 !important;}sl-header .item:hover i{scale:0.9;}sl-header .item i{transition:scale 0.3s ease !important;height:40px;display:block;padding-top:23px;fill:var(--action-neutral-normal) !important;}sl-header .item svg{width:100%;height:40px;}sl-header sl-tab-item, sl-header sl-tab-item .item{height:120px !important;position:relative !important;display:block !important;}sl-popup{z-index:101 !important;}sl-header{position:fixed !important;z-index:15 !important;' + (get('layout') != 3 ? 'left' : 'right') + ':0 !important;top: 0 !important;height:100% !important;border-bottom:0 !important;width:var(--safe-area-inset-' + (get('layout') != 3 ? 'left' : 'right') + ') !important;background:' + get('primarycolor') + ' !important;color:' + menuColor + ' !important;}sl-header > div:first-of-type{position:absolute;bottom:20px;left:12px;--bg-elevated-weakest:' + highLightColor + ';}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width:1279px){#mod-logo-wrapper{width:100px;' + (get('layout') != 3 ? 'margin-left' : 'left') + ':calc((var(--safe-area-inset-' + (get('layout') != 3 ? 'left' : 'right') + ') - ' + ((platform == 'Android' || get('layout') != 3) ? '100px' : '115px') + ') / 2);position:relative;}sl-tab-bar hmy-notification-counter{margin-top:-60px !important;margin-left:40px !important;}:root{--safe-area-inset-' + (get('layout') != 3 ? 'left' : 'right') + ': 100px !important;}#mod-background{width:calc(100% - var(--safe-area-inset-left) - var(--safe-area-inset-right) - 2 * ' + get('blur') + ' + 15px);}sl-tab-bar:first-of-type{position:fixed;top:0;' + (get('layout') != 3 ? 'left' : 'right') + ':0;border-top:none;width:' + (get('layout') != 3 ? 'var(--safe-area-inset-left)' : 'var(--safe-area-inset-right)') + ' !important;height:100%;display:block !important;z-index:0;background:' + get('primarycolor') + '}sl-tab-bar:first-of-type sl-tab-item svg{width:100%;height:40px;}sl-tab-bar:first-of-type sl-tab-item span{font-size:14px;}sl-tab-bar:first-of-type sl-tab-item span{margin-top:10px;}sl-tab-bar:first-of-type sl-tab-item i{height:40px;fill:var(--action-neutral-normal) !important;transition:0.3s scale ease !important;}sl-tab-bar:first-of-type .item:hover i{scale:0.9;}sl-tab-bar:first-of-type .item{height:100%;}sl-tab-bar:first-of-type .active .item, sl-tab-bar:first-of-type .item:hover{background:' + highLightColor + ' !important;padding-top:0 !important;}sl-tab-bar:first-of-type sl-tab-item{--action-neutral-normal:' + menuColor + ';--action-primary-normal:' + menuColor + ';display:block !important;width:100%;height:120px;}sl-header > div:first-of-type{--bg-elevated-weakest:' + highLightColor + ';}#mod-logo{--action-neutral-normal: ' + menuColor + ';width:100%;height:60px;margin:20px 0;}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width: 766px){sl-header:not(.with-back-button){border-bottom:none !important;--column-width: 100% !important;}sl-dagen-header{top:calc(' + ((get('layout') == 1 || get('layout') == 4) ? '64px' : '0px') + ' + var(--safe-area-inset-top)) !important;border-bottom:none !important;}sl-berichten{background-color:var(--bg-neutral-none);}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">.container{max-width:100%;}sl-header sl-tab-bar div.item span,sl-tab-bar sl-tab-item .item span{text-overflow:ellipsis;overflow:hidden;text-wrap:nowrap;margin-left:-5px;width:calc(100% + 10px);}sl-tab-bar sl-tab-item .item span{' + (get('layout') == 3 ? 'margin-left:5px;' : '') + 'width:calc(100% - 10px);text-align:center;}#mod-menu-resizer{width:12px;height:100%;' + (get('layout') == 3 ? 'left' : 'right') + ':-4px;position:absolute;cursor:ew-resize;}sl-tab-bar sl-tab-item .item{padding-bottom:0 !important;max-height:100%;}sl-rooster-dag.dag{width:calc(100vw - 170px) !important;}hmy-notification-counter span{margin:0 !important;}sl-header hmy-notification-counter{position:absolute;right:30px;top:20px;}sl-tab-bar:first-of-type sl-tab-item{position:relative;max-height:calc(25% - 50px);}.active-border-top,.active-border-bottom{top:0;height:100% !important;width:4px !important;position:absolute;' + (get('layout') != 3 ? 'right' : 'left') + ':0;}sl-sidebar{height:100% !important;}.active-border{display:none !important;}sl-rooster-week.week{width:calc(100% - 55px) !important;}sl-sidebar-page{padding-right:0 !important;}sl-header > div:first-of-type i{z-index:10000;--fg-on-primary-weak:' + menuColor + ';--action-neutral-strong:' + menuColor + ';}sl-header > div:first-of-type{--bg-neutral-weakest:' + highLightColor + '}@media (max-height:670px){#mod-logo-wrapper{height:90px;}}@media (max-height:600px){#mod-logo-wrapper{display:none;}sl-tab-bar:first-of-type sl-tab-item{max-height:calc(25% - 20px) !important;}}</style>');
        }
        else if (get('layout') == 4) {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">:root{--safe-area-inset-left:calc((100% - 1200px) / 2) !important;--safe-area-inset-right:calc((100% - 1200px) / 2) !important;}#mod-background{left:0;width:100%;}sl-home{position:relative;border:var(--thinnest-solid-neutral-normal);display:block;background:var(--bg-neutral-none) !important;' + (get('ui') == 0 ? '' : 'backdrop-filter:blur(' + get('uiblur') + 'px);') + '}sl-rooster-week.week{width:calc(100% - 55px) !important;}</style>');
        }
        // Position menu relatively
        if (get('bools').charAt(BOOL_INDEX.MENU_ALWAYS_SHOW) == '0') {
            tn('head', 0).insertAdjacentHTML('beforeend', `<style class="mod-style">
            :root {
                --mod-menu-height: 64px;
            }

            /* Top menu part on rooster page */
            .headers-container {
                position: relative !important;
            }

            .datum-container {
                position: inherit !important;
            }
                
            ${(get('layout') == 1 || get('layout') == 4) ? `

            /* The main menu visible on big screens */
            sl-header {
	            position: absolute !important;
                width: 100%;
            }

            /* Studiewijzer is not endless on mobile */
            @media (min-width: 767px) {
                /* Compensate for position absolute on main menu */
                sl-home>*>.content, sl-home>*>.container {
                    margin-top: var(--mod-menu-height) !important;
                }

                /* The studiewijzer is too big and you start somewhere halfway on the page,
                   so we need to always show the menu here unfortunately */
                sl-studiewijzer sl-header {
	                position: sticky !important;
                }

                .headers-container {
                    margin-top: calc(-1 * var(--mod-menu-height));
                    margin-bottom: var(--mod-menu-height);
                }
            }

            @media (min-width: 767px) and (max-width: 1279px) {
                sl-scrollable-title.scrollable-title.title {
                    margin-top: var(--mod-menu-height) !important;
                    margin-bottom: calc(-1 * var(--mod-menu-height)) !important;
                }

                body:has(sl-berichten) .tabs {
                margin-top }
            }
            ` :
                    `
            /* The mod top menu in layout 4 must be fixed in the studiewijzer */
            body:has(sl-studiewijzer) #mod-top-menu {
                position: fixed !important;
            }
            `}


            ${get('layout') == 5 ? `
            @media (min-width: 767px) and (max-width: 1279px) {
                body:has(sl-berichten) .tabs {
                    margin-top: 0px !important;
                }
            }
            ` : ''}

            @media (max-width: 767px) {
                sl-scrollable-title {
                    height: 64px !important;
                }
                sl-header {
                    grid-template-columns: 1fr auto auto !important;
                }
                sl-header .actions {
                	height: var(--mod-menu-height);
                	align-items: center;
                }
                .headers-container {
                    background: transparent !important;
                    margin-bottom: 0px !important;
                }
                sl-dagen-header {
                    top: 0px !important;
                }
                sl-header {
                    position: relative !important;
                    width: 100%;
                }
                sl-header .title {
                    opacity: 0;
                }
                    
                ${(get('layout') == 1 || get('layout') == 5) ? `
                .headers-container {
                    margin-top: calc(-1 * var(--mod-menu-height)) !important;
                }
                ` : ''}
            }

            /* Tabs as shown on the grades/messages pages should not be sticky */
            .tabs {
                position: relative !important;
                top: unset !important;
            }

            /* Messages page should be scrollable on the body element instead of on .berichten-lijst */
            div.berichten-lijst {
                height: fit-content !important;
            }

            @media (max-width: 1279px) {
                ${(get('layout') != 1 && get('layout') != 4) ? `
                /* In every layout except the centered one, wethe centered layout */
                sl-header {
                    height: 0px !important;
                }

                ${get('layout') != 5 ? `
                .headers-container {
                    margin-top: calc(-1 * var(--mod-menu-height)) !important;
                    margin-bottom: var(--mod-menu-height) !important;
                }
                sl-studiewijzer-weken-header {
                    top: 0px !important;
                }
                ` : ''}
                sl-header {
                    position: fixed !important;
                    left: 0px !important;
                    right: 0px !important;
                }
                .menu-avatar {
                	position: fixed !important;
                	top: calc(100vh - 68px);
                	${get('layout') == 3 ? 'right' : 'left'}: 12px;
                }
                .menu-avatar .hamburger {
                    fill: #fff !important;
                }
                ` : ''}
            }
            
            </style>`);

            /*if (get('layout') == 1 || get('layout') == 4) {
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width:767px){sl-cijfers .tabs{position:relative !important;}sl-rooster sl-scrollable-title{display:none !important;}sl-studiewijzer sl-dagen-header,sl-cijfers .tabs{top:var(--safe-area-inset-top) !important;}}sl-dagen-header{position:relative !important;}sl-rooster-weken{margin-top:64px;}' + (get('layout') == 4 ? 'body:has(sl-cijfers) sl-header:first-of-type,body:has(sl-berichten) sl-header:first-of-type{margin-top:-64px;}' : '') + 'body:has(sl-cijfers),body:has(sl-berichten){margin-top:64px;}sl-rooster sl-header,sl-cijfers sl-header,sl-berichten sl-header{position:absolute !important;width:100%;}</style>');
            }
            else if (get('layout') == 5) {
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-rooster .headers-container,sl-studiewijzer-weken-header{top:0 !important;}</style>');
            }
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width:767px){sl-berichten div.tabs{top:unset !important;}}' + ((get('layout') == 2 || get('layout') == 3) ? '@media (min-width:1279px){.headers-container{top:calc(var(--safe-area-inset-top)) !important;}}' : '') + 'sl-berichten div.berichten-lijst{height:fit-content !important;}.main,sl-berichten div.tabs{position:relative !important;}sl-rooster .headers-container,sl-rooster .header,sl-cijfers .headers-container,sl-cijfers .header,sl-berichten .headers-container,sl-berichten .header{position:relative !important;}</style>');*/
        }
        // Hide unread message indicator
        if (get('bools').charAt(BOOL_INDEX.HIDE_MESSAGE_COUNT) == '1') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">hmy-notification-counter{display:none !important;}</style>');
        }
        // Hide menu link text
        if (get('bools').charAt(BOOL_INDEX.MENU_PAGE_NAME) == '0') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-header .item span{display:none !important;}@media (max-width:1279px){sl-tab-bar:first-of-type .item span{display:none !important;}' + ((get('layout') == 2 || get('layout') == 3 || get('layout') == 5) ? 'sl-tab-bar:first-of-type sl-tab-item i{padding-top:0!important}}sl-header .item i{padding-top:36px !important;}' : '}') + '</style>');
        }
        // Custom CSS - inject at the end so it overrides mod and Somtoday CSS
        if (!n(get('customcss')) && get('customcss').trim() !== '') {
            // Sanitize CSS to prevent breaking out of style tag and potential code injection
            let sanitizedCSS = get('customcss')
                .replace(/javascript:[^'"]+/gi, '')  // Remove javascript: URLs
                .replace(/@import[^;\n]+/gi, '');  // Remove @import to prevent loading external CSS
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style mod-custom-css">' + sanitizedCSS + '</style>');

            const customCSS = document.createElement('style');
            customCSS.setAttribute('class', 'mod-style mod-custom-css');
            customCSS.innerText = sanitizedCSS;
            tn('head', 0).appendChild(customCSS);

            // Force !important on every rule via CSSOM
            for (const sheet of document.styleSheets) {
                if (sheet.ownerNode !== customCSS) continue;
                for (const rule of sheet.cssRules) {
                    if (!(rule instanceof CSSStyleRule)) continue;
                    for (const prop of rule.style) {
                        rule.style.setProperty(prop, rule.style.getPropertyValue(prop), 'important');
                    }
                }
            }
        }
    }

    // Change some setting values to ensure the script will work after updating
    function updateCheck() {
        // Make sure to not mess up new user save data
        if (!n(get('firstused'))) {
            // Set default values for new users who first navigate to old version and later to a new one
            if (n(get('bools'))) {
                set('bools', '110001110111100000000000000000');
            }
            if (n(get('layout'))) {
                set('layout', 1);
            }
            if (get('uiblur') == null) {
                set('uiblur', 0);
            }
            if (get('ui') == null) {
                set('ui', 20);
            }
            // Check if user has used the old version of Somtoday and is using new version for the first time
            if (n(get('version')) && !n(get('primarycolor'))) {
                modMessage('Somtoday update!', 'Somtoday heeft een grote update gekregen! Somtoday Mod is hier op voorbereid en heeft ook een update gekregen. De mod-instellingen zijn nu te vinden in een apart tabblad in de instellingen van Somtoday. Het is mogelijk dat je sommige instellingen opnieuw moet instellen.', 'Doorgaan');
                id('mod-message-action1').addEventListener('click', closeModMessage);
                set('bools', '110001110111100000000000000000');
                set('secondarycolor', '#e69b22');
            }
            if (get('version') == 4) {
                set('bools', get('bools').replaceAt(12, '1'));
            }
            if (get('version') < 4.6) {
                if (get('blur') == '') {
                    set('blur', '0px');
                }
                else if (get('blur') != null && !isNaN(parseInt(get('blur')))) {
                    set('blur', get('blur') + 'px');
                }
                set('bools', get('bools').replaceAt(15, '1'));
            }
            if (get('version') < 4.7) {
                set('brightness', '100%');
                set('contrast', '100%');
                set('saturate', '100%');
                set('opacity', '100%');
                set('huerotate', '0deg');
                set('grayscale', '0%');
                set('sepia', '0%');
                set('invert', '0%');
            }
            if (get('version') < 4.9) {
                set('bools', get('bools').replaceAt(16, '1'));
            }
            if (n(get('homework'))) {
                set('homework', '[]');
            }
            if (get('version') < 5.1) {
                // Update nickname storage to use JSON instead of pipe-delimited string
                if (n(get('nicknames'))) {
                    set('nicknames', '[]');
                }
                else if (parseJSON(get('nicknames')) == null) {
                    let json = [];
                    let namearray = get('nicknames').split('|');
                    for (let i = 0; i < (namearray.length / 2); i++) {
                        json.push([namearray[i * 2], namearray[i * 2 + 1]]);
                    }
                    set('nicknames', JSON.stringify(json));
                }
            }
            if (get('version') < 5.3) {
                set('bools', get('bools').replaceAt(17, '1'));
            }
        }
        // Save current version for update checks in future versions
        set('version', version);
    }

    // Update the CSS variables used by Somtoday and Somtoday Mod
    let primaryColorValue;
    let secondaryColorValue;
    let darkModeValue;
    let uiValue;
    let uiBlurValue;
    let layoutValue;
    function updateCssVariables() {
        // Do not update CSS variables when nothing relevant changed
        if (!n(primaryColorValue) && primaryColorValue == get('primarycolor') && secondaryColorValue == get('secondarycolor') && darkModeValue == (tn('html', 0).classList.contains('dark') || tn('html', 0).classList.contains('night')) && uiValue == get('ui') && uiBlurValue == get('uiblur') && layoutValue == get('layout')) {
            return;
        }
        primaryColorValue = get('primarycolor');
        secondaryColorValue = get('secondarycolor');
        darkModeValue = tn('html', 0).classList.contains('dark') || tn('html', 0).classList.contains('night');
        darkmode = darkModeValue;
        uiValue = get('ui');
        uiBlurValue = get('uiblur');
        layoutValue = get('layout');
        tryRemove(id('mod-css-variables'));
        tryRemove(id('mod-css-variables-2'));
        if (get('ui') != 0 || get('backgroundtype') == 'live') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-css-variables-2">sl-vakgemiddelden sl-dropdown,sl-cijfer-overzicht sl-dropdown{background:var(--bg-neutral-none);margin-top:-5px;margin-bottom:-5px;}' + (get('uiblur') == 0 ? '' : '.nieuw-bericht-form hmy-popup{top:70px !important;left:70px !important;}sl-plaatsingen,.nieuw-bericht-form,sl-header,sl-laatste-resultaat-item,sl-vakresultaat-item,.berichten-lijst,.vakken,' + (get('layout') == '4' ? '' : 'sl-vakresultaten,hmy-geen-data,hmy-switch-group:has(hmy-switch),sl-bericht-detail .header,sl-bericht-nieuw > .titel,') + '.headers-container,.tabs,sl-studiewijzer-week:has(.datum.vandaag),#mod-top-menu,sl-home > * > sl-tab-bar.show,sl-dagen-header,sl-scrollable-title,sl-studiewijzer-weken-header,sl-cijfer-overzicht-voortgang>div,sl-rooster-tijden{backdrop-filter:blur(' + get('uiblur') + 'px);}') + '@media(max-width:767px){sl-laatste-resultaat-item{backdrop-filter:none;}sl-laatsteresultaten{backdrop-filter:blur(' + get('uiblur') + 'px);}}:root, :root.dark.dark {--thinnest-solid-neutral-strong:1px solid transparent !important;--text-weakest:var(--text-weak);--border-neutral-normal:transparent;' + ((darkmode && get('ui') > 0.9) ? '--text-weak:#fff;' : '') + '--bg-neutral-none:' + (darkmode ? 'rgba(0,0,0,' + (1 - (get('ui') / 100)) + ')' : 'rgba(255,255,255,' + (1 - (get('ui') / 100)) + ')') + ';--bg-neutral-weakest:' + (darkmode ? 'rgba(0, 0, 0, ' + (1 - (get('ui') / 100)) + ')' : 'rgba(255, 255, 255, ' + (1 - (get('ui') / 100)) + ')') + ';}.mod-multi-choice,input:not(:hover):not(:focus):not(.mod-color-textinput):not(.ng-pristine):not(.ng-dirty),textarea:not(:hover):not(:focus):not(.ng-pristine):not(.ng-dirty),.select-selected{border:1px solid rgba(0,0,0,0.1) !important;}hmy-toggle .toggle:not(:has(input:checked)) .slider{border:2px solid rgba(0,0,0,0.1) !important;}sl-dag-header-tab,.periode-icon{background:none !important;}@media (max-width:767px){' + (platform == 'Android' ? 'sl-rooster-item{margin-left:8px;}' : '') + 'sl-vakgemiddelden sl-dropdown,sl-cijfer-overzicht sl-dropdown{margin-top:10px;}}</style>');
        }
        // If at least one of the colors is not set to the default value, modify Somtoday color variables
        let css = (darkmode ? '#mod-setting-panel ::placeholder{ color: var(--action-neutral-normal) !important; }' : '') + ' :root, :root.dark.dark { --mod-transparent: rgba(' + (darkmode ? '0,0,0,0.3' : '255,255,255,0.3') + '); --mod-ui-transparent: rgba(' + (darkmode ? '0,0,0' : '255,255,255') + ',' + (1 - (get('ui') / 100)) + '); --mod-semi-transparant: ' + (tn('html', 0).classList.contains('night') ? '#000' : (darkmode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.65)')) + '; --mod-border-neutral-normal: rgb(' + (darkmode ? '55,64,72' : '208,214,220') + ');';
        if (get('primarycolor') != '#0067c2' || get('secondarycolor') != '#e69b22') {
            const rgbcolor = hexToRgb(get('primarycolor'));
            let cssVariables = '';
            const blueBrightness = ['241', '220', '198', '169', '140', '115', '89', '81', '56', '52', '48'];
            const greenBrightness = ['245', '228', '209', '200', '192', '183', '160', '137', '114', '68', '46'];
            const yellowBrightness = ['241', '220', '198', '190', '180', '173', '162', '137', '114', '68', '46'];
            const purpleBrightness = ['231', '201', '170', '126', '100', '88', '77', '65', '53', '50', '41'];
            const orangeBrightness = ['241', '220', '198', '180', '168', '155', '141', '90', '56', '52', '48'];
            for (let i = 0; i < blueBrightness.length; i++) {
                cssVariables += `--blue-${i * 10}: ${toBrightnessValue(get('primarycolor'), blueBrightness[i])};`;
                cssVariables += `--green-${i * 10}: ${toBrightnessValue(get('secondarycolor'), greenBrightness[i])};`;
                cssVariables += `--yellow-${i * 10}: ${toBrightnessValue(get('secondarycolor'), yellowBrightness[i])};`;
                cssVariables += `--purple-${i * 10}: ${toBrightnessValue(get('secondarycolor'), purpleBrightness[i])};`;
                cssVariables += `--orange-${i * 10}: ${toBrightnessValue(get('secondarycolor'), orangeBrightness[i])};`;
            }
            // Generate and adjust colors based on highest color channel value
            css += cssVariables + `}
            sl-account-modal i {
                --bg-neutral-moderate: ${darkmode ? '#282e34' : '#dadfe3'};
                --fg-on-neutral-moderate: ${darkmode ? '#eaedf0' : '#374048'};
                --bg-primary-weakest: ${darkmode ? '#1a344d' : '#e5f3ff'};
                --fg-on-primary-weakest: ${darkmode ? '#e5f3ff' : '#004180'};
                --bg-alternative-weak: ${darkmode ? '#342060' : '#ece3ff'};
                --fg-on-alternative-weak: ${darkmode ? '#d4c0fd' : '#29017d'};
                --bg-accent-weak: ${darkmode ? '#4d3919' : '#fff4e3'};
                --fg-on-accent-weak: ${darkmode ? '#fff4e3' : '#4d3919'};
                --bg-positive-weakest: ${darkmode ? '#133914' : '#ebf9ec'};
                --fg-on-positive-weakest: ${darkmode ? '#baf5bc' : '#145716'};
            }`;
        }
        else {
            css += '}';
        }
        tn('head', 0).insertAdjacentHTML('beforeend', `<style id="mod-css-variables">${css}</style>`);
    }

    // Show a message on top of the page. Similair to browser confirm().
    function modMessage(title, description, link1, link2, red1, red2, noBackgroundClick) {
        tn('sl-root', 0).inert = true;
        if (tn('sl-modal', 0)) {
            tn('sl-modal', 0).inert = true;
        }
        while (id('mod-message')) {
            tryRemove(id('mod-message'));
        }
        const element = n(id('somtoday-mod')) ? tn('body', 0) : id('somtoday-mod');
        element.insertAdjacentHTML('afterbegin', '<div id="mod-message" class="mod-animation-playing"><center><div onclick="event.stopPropagation();"><h2>' + title + '</h2><p>' + description + '</p>' + (n(link1) ? '' : '<a id="mod-message-action1" class="mod-message-button' + (red1 ? ' mod-button-discouraged' : '') + '" tabindex="0">' + link1 + '</a>') + (n(link2) ? '' : '<a id="mod-message-action2" class="mod-message-button' + (red2 ? ' mod-button-discouraged' : '') + '" tabindex="0">' + link2 + '</a>') + '</div></center></div>');
        if (!n(link1)) {
            id('mod-message-action1').focus();
            setTimeout(function () {
                if (id('mod-message-action1')) {
                    id('mod-message-action1').addEventListener('keyup', (event) => {
                        if (event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 9) {
                            event.preventDefault();
                            if (id('mod-message-action2')) {
                                id('mod-message-action2').focus();
                            }
                        }
                    }, { once: true });
                }
            }, 50);
            id('mod-message-action1').addEventListener('click', function () { tn('sl-root', 0).removeAttribute('inert'); if (tn('sl-modal', 0)) { tn('sl-modal', 0).removeAttribute('inert'); } }, { once: true });
        }
        if (!n(link2)) {
            setTimeout(function () {
                if (id('mod-message-action2')) {
                    id('mod-message-action2').addEventListener('keyup', (event) => {
                        if (event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 9) {
                            event.preventDefault();
                            id('mod-message-action1').focus();
                        }
                    }, { once: true });
                }
            }, 50);
            id('mod-message-action2').addEventListener('click', function () { tn('sl-root', 0).removeAttribute('inert'); if (tn('sl-modal', 0)) { tn('sl-modal', 0).removeAttribute('inert'); } }, { once: true });
            if (noBackgroundClick == null) {
                id('mod-message').addEventListener('click', function () { if (!n('mod-message-action2')) { id('mod-message-action2').click(); } }, { once: true });
            }
        }
        else if (!n(link1) && noBackgroundClick == null) {
            id('mod-message').addEventListener('click', function () { if (!n('mod-message-action1')) { id('mod-message-action1').click(); } }, { once: true });
        }
        setTimeout(function () {
            if (id('mod-message')) {
                id('mod-message').classList.remove('mod-animation-playing');
            }
        }, 500);
    }

    function closeModMessage() {
        id('mod-message').classList.add('mod-msg-closed');
        setTimeout(function () {
            tryRemove(id('mod-message'));
        }, 305);
    }

    // Change profile pictures when enabled
    let profilePictureChanged = false;
    function profilePicture() {
        // Change all profile pictures if custom one is set
        if (!n(get('profilepic'))) {
            profilePictureChanged = true;
            tryRemove(id('mod-profile-picture'));
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-profile-picture">hmy-avatar>.container{border-radius:var(--border-radius);background:url(\'' + get('profilepic') + '\') center / cover !important;}.foto, .initials{opacity:0 !important;}</style>');
        }
        // Reset all profile pictures when profile picture is reset
        else if (profilePictureChanged) {
            profilePictureChanged = false;
            tryRemove(id('mod-profile-picture'));
        }
    }

    // Change teacher names to nicknames when enabled
    function teacherNicknames() {
        if (!n(get('nicknames'))) {
            const namearray = JSON.parse(get('nicknames'));
            for (const nickname of namearray) {
                const real = nickname[0];
                const nick = nickname[1];
                if (real != '') {
                    const regex = new RegExp('(.*?)' + real.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(.*?)', 'g');
                    const regexWhichPreservesIcons = new RegExp('(.*?)' + real.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(.*?<hmy-?.*)', 'g');
                    // Sender field in message list (is always a teacher name)
                    for (const element of cn('afzenders')) {
                        if (!element.classList.contains('mod-nickname')) {
                            const text = element.innerHTML.replace(regex, '$1' + nick + '$2');
                            if (text != element.innerHTML) {
                                element.classList.add('mod-nickname');
                            }
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                    // Receiver field in message list (can be a teacher name or "Somtoday (automatisch)")
                    for (const element of cn('ontvangers ellipsis')) {
                        if (!element.classList.contains('mod-nickname')) {
                            const text = element.innerHTML.replace(regex, '$1' + nick + '$2');
                            if (text != element.innerHTML) {
                                element.classList.add('mod-nickname');
                            }
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                    // Receiver field in opened message (can be a teacher name, student name, group name or "Somtoday (automatisch)")
                    // This field is complicated because everything is stored under child elements and it is just a mess.
                    // Everything is stored as "<span>FirstName&nbsp;</span> <span>Lastname</span>" and this needs to be parsed
                    for (const element of cn('ontvangers')) {
                        if (!element.classList.contains('mod-nickname') && !element.classList.contains('ellipsis') && !element.classList.contains('input-veld') && (n(element.children[0]) || !element.children[0].classList.contains('zoekveld'))) {
                            setHTML(element, element.innerHTML.replaceAll('&nbsp;</span> <span>', ' ').replaceAll('<span>', '').replaceAll('</span><!---->', ''));
                            const text = element.innerHTML.replace(element.innerHTML.indexOf('<hmy-') != -1 ? regexWhichPreservesIcons : regex, '$1' + nick + '$2');
                            if (text != element.innerHTML) {
                                element.classList.add('mod-nickname');
                            }
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                    // Sender field in opened message (can be a teacher name or student name)
                    for (const element of cn('van')) {
                        if (!element.classList.contains('mod-nickname')) {
                            const text = element.innerHTML.replace(element.innerHTML.indexOf('<hmy-') != -1 ? regexWhichPreservesIcons : regex, '$1' + nick + '$2');
                            if (text != element.innerHTML) {
                                element.classList.add('mod-nickname');
                            }
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                    // Sender field in opened message (can be a teacher name or student name)
                    for (const element of cn('text text-content-smallest-semi')) {
                        if (!element.classList.contains('mod-nickname')) {
                            const text = element.innerHTML.replace(regex, '$1' + nick + '$2');
                            if (text != element.innerHTML) {
                                element.classList.add('mod-nickname');
                            }
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                    for (const element of cn('docent')) {
                        if (!element.classList.contains('mod-nickname') && element.getElementsByTagName('span')[0]) {
                            const text = element.getElementsByTagName('span')[0].innerHTML.replace(regex, '$1' + nick + '$2');
                            if (text != element.getElementsByTagName('span')[0].innerHTML) {
                                element.classList.add('mod-nickname');
                            }
                            setHTML(element.getElementsByTagName('span')[0], '');
                            element.getElementsByTagName('span')[0].append(document.createRange().createContextualFragment(text));
                        }
                    }
                    for (const element of tn('hmy-internal-tag')) {
                        if (!element.classList.contains('mod-nickname') && element.getElementsByTagName('span')[0] && !element.getElementsByTagName('span')[0].classList.contains('mod-nickname') && element.getElementsByTagName('span')[0]) {
                            if (nickname[2] && element.innerText == nickname[2]) {
                                element.getElementsByTagName('span')[0].classList.add('mod-nickname');
                                setHTML(element.getElementsByTagName('span')[0], '');
                                element.getElementsByTagName('span')[0].append(document.createRange().createContextualFragment(nick));
                            }
                            else {
                                const text = element.getElementsByTagName('span')[0].innerHTML.replace(regex, '$1' + nick + '$2');
                                if (text != element.getElementsByTagName('span')[0].innerHTML) {
                                    element.getElementsByTagName('span')[0].classList.add('mod-nickname');
                                }
                                setHTML(element.getElementsByTagName('span')[0], '');
                                element.getElementsByTagName('span')[0].append(document.createRange().createContextualFragment(text));
                            }
                        }
                    }
                }
            }
            for (const element of cn('afzenders')) {
                element.classList.add('mod-nickname');
            }
            for (const element of cn('ontvangers')) {
                element.classList.add('mod-nickname');
            }
            for (const element of cn('van')) {
                element.classList.add('mod-nickname');
            }
            for (const element of cn('text text-content-smallest-semi')) {
                element.classList.add('mod-nickname');
            }
            for (const element of cn('docent')) {
                element.classList.add('mod-nickname');
            }
            for (const element of tn('hmy-internal-tag')) {
                element.classList.add('mod-nickname');
            }
        }
    }

    // Change username when enabled
    function userName() {
        if (!n(get('username')) && !n(get('realname')) && get('username') != get('realname')) {
            // Name field on Mijn gegevens page
            for (const element of cn('persinfo')) {
                if (element.innerHTML.indexOf(get('realname')) != -1) {
                    setHTML(element, element.innerHTML.replaceAll(get('realname'), get('username')));
                }
            }
            // Sender field in opened message (can be a teacher name or student name)
            for (const element of cn('van')) {
                if (element.innerHTML.indexOf(get('realname')) != -1) {
                    setHTML(element, '');
                    element.append(document.createRange().createContextualFragment(get('username')));
                }
            }
            // Receiver field in opened message (can be a teacher name, student name, group name or "Somtoday (automatisch)")
            // This field is complicated because everything is stored under child elements and it is just a mess.
            // Everything is stored as "<span>FirstName&nbsp;</span> <span>Lastname</span>" and this needs to be parsed
            for (const element of cn('ontvangers')) {
                const search = get('realname').replaceAll(' ', '&nbsp;</span> <span>');
                if (element.innerHTML.indexOf(search) != -1) {
                    element.innerHTML = element.innerHTML.replaceAll(search, get('username').replaceAll(' ', '&nbsp</span> <span>'));
                }
            }
            for (const element of tn('hmy-internal-tag')) {
                if (!n(element.getElementsByTagName('span')[0]) && element.getElementsByTagName('span')[0].innerHTML.indexOf(get('realname')) != -1) {
                    element.getElementsByTagName('span')[0].innerHTML = element.getElementsByTagName('span')[0].innerHTML.replaceAll(get('realname'), get('username'));
                }
            }
            for (const element of cn('omschrijving')) {
                if (element.innerHTML.indexOf(get('realname')) != -1) {
                    element.innerHTML = element.innerHTML.replaceAll(get('realname'), get('username'));
                }
            }
            for (const element of tn('sl-html-content')) {
                if (!n(element.children[0]) && element.children[0].innerHTML.indexOf(get('realname')) != -1) {
                    element.children[0].innerHTML = element.children[0].innerHTML.replaceAll(get('realname'), get('username'));
                }
            }
        }
    }

    // Insert modlogo into menu when enabled
    // This should happen on start and when resizing (because the menu type can change)
    let logoClicks = 0;
    function modLogo() {
        if (get('layout') == 2 || get('layout') == 3 || get('layout') == 5) {
            if (n(id('mod-menu-resizer')) && tn('sl-tab-bar', 0)) {
                tn('sl-tab-bar', 0).insertAdjacentHTML('beforeend', '<div id="mod-menu-resizer"></div>');
                let moving = false;
                if (get('layout') == 3) {
                    tn('body', 0).style.cssText = '--safe-area-inset-right: ' + menuWidth + 'px !important';
                }
                else {
                    tn('body', 0).style.cssText = '--safe-area-inset-left: ' + menuWidth + 'px !important';
                }
                id('mod-menu-resizer').addEventListener('mousedown', function (e) {
                    moving = true;
                });
                id('mod-menu-resizer').addEventListener('touchstart', function (e) {
                    moving = true;
                });
                document.addEventListener('mouseup', function (e) {
                    moving = false;
                });
                document.addEventListener('touchend', function (e) {
                    moving = false;
                });
                function moveEventHandler(e) {
                    if (moving) {
                        let clientXInput;
                        if (e.touches == null || e.touches[0] == null) {
                            clientXInput = e.clientX;
                        }
                        else {
                            clientXInput = e.touches[0].clientX;
                        }
                        if (get('layout') == 3) {
                            menuWidth = document.documentElement.clientWidth - clientXInput;
                            if (menuWidth < 50) {
                                menuWidth = 50;
                            }
                            else if (menuWidth > 700) {
                                menuWidth = 700;
                            }
                            set('menuwidth', menuWidth);
                            tn('body', 0).style.cssText = '--safe-area-inset-right: ' + menuWidth + 'px !important';
                        }
                        else {
                            menuWidth = clientXInput;
                            if (menuWidth < 50) {
                                menuWidth = 50;
                            }
                            else if (menuWidth > 700) {
                                menuWidth = 700;
                            }
                            set('menuwidth', menuWidth);
                            tn('body', 0).style.cssText = '--safe-area-inset-left: ' + menuWidth + 'px !important';
                        }
                    }
                }
                document.addEventListener('mousemove', moveEventHandler);
                document.addEventListener('touchmove', moveEventHandler);
            }
        }
        else {
            tn('body', 0).style.cssText = '';
        }

        // Make sure we do not replace the logo while animations are playing
        if (cn('mod-logo-hat-clicked', 0) || cn('mod-logo-decoration-clicked', 0)) {
            return;
        }

        tryRemove(id('mod-logo-wrapper'));
        tryRemove(id('mod-logo-hat'));
        tryRemove(id('mod-logo-inserted'));
        if (get('layout') == 2 || get('layout') == 3 || get('layout') == 5) {
            const logoHTML = '<div id="mod-logo-wrapper">' + (get('bools').charAt(BOOL_INDEX.MOD_LOGO) == '0' ? window.getIcon('logo', null, menuColor, ' id="mod-logo"') : window.logo('mod-logo', '" data-clicks="' + (n(id('mod-logo')) ? '0' : id('mod-logo').dataset.clicks), 'var(--action-neutral-normal)')) + '</div>';
            if (n(id('mod-logo')) && tn('sl-header', 0) && tn('sl-header', 0).getElementsByTagName('sl-tab-bar')[0]) {
                tn('sl-header', 0).getElementsByTagName('sl-tab-bar')[0].insertAdjacentHTML('afterbegin', logoHTML);
            }
            else if (n(id('mod-logo')) && tn('sl-tab-bar', 0)) {
                tn('sl-tab-bar', 0).insertAdjacentHTML('afterbegin', logoHTML);
            }
            else {
                return;
            }
            id('mod-logo').addEventListener('click', function () {
                logoClicks += 1;
                if (logoClicks == 10) {
                    logoClicks = 0;
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen();
                    }
                    tn('body', 0).style.setProperty('overflow-y', 'hidden', 'important');
                    id('somtoday-mod').insertAdjacentHTML('beforeend', '<div id="blue-screen-of-death"><svg xmlns="http://www.w3.org/2000/svg" width="806.81042" height="588.71942" viewBox="0 0 806.81042 588.71944"><rect style="fill:#1173aa;" width="806.81042" height="588.71942" x="0" y="0"/><g transform="matrix(4.2021373,0,0,4.2021373,0,1.0984253e-5)"><g><path style="fill:#fff;" d="m 28.976126,48.524788 q -1.09375,0 -1.835938,-0.703125 -0.742187,-0.722656 -0.742187,-1.777344 0,-1.074219 0.742187,-1.777344 0.742188,-0.722656 1.835938,-0.722656 1.113281,0 1.855468,0.722656 0.742188,0.703125 0.742188,1.777344 0,1.054688 -0.742188,1.777344 -0.742187,0.703125 -1.855468,0.703125 z m 0,14.902344 q -1.09375,0 -1.835938,-0.703125 -0.742187,-0.722657 -0.742187,-1.777344 0,-1.074219 0.742187,-1.777344 0.742188,-0.722656 1.835938,-0.722656 1.113281,0 1.855468,0.722656 0.742188,0.703125 0.742188,1.777344 0,1.054687 -0.742188,1.777344 -0.742187,0.703125 -1.855468,0.703125 z"/><path style="fill:#fff;" d="m 42.101126,68.974007 q -3.125,-3.417969 -4.53125,-7.363282 -1.386719,-3.964843 -1.386719,-9.335937 0,-5.214844 1.347656,-9.160156 1.367188,-3.964844 4.375,-7.539063 l 1.875,1.5625 q -2.382812,3.417969 -3.476562,7.011719 -1.074219,3.574219 -1.074219,8.125 0,4.433594 1.132812,8.027344 1.132813,3.574218 3.652344,7.109375 z" /></g><g><path style="line-height:142.99999475%;letter-spacing:-0.30000001px;fill:#ffffff" d="m 29.713547,80.950829 -1.688233,-3.325196 h 0.688477 l 1.186523,2.391358 q 0.02197,0.04761 0.05859,0.142822 0.03662,0.09155 0.06958,0.179443 h 0.01099 q 0.03296,-0.120849 0.135499,-0.322265 l 1.241455,-2.391358 h 0.644531 l -1.732178,3.310547 v 1.940918 h -0.615234 z" /><path style="line-height:142.99999475%;letter-spacing:-0.30000001px;fill:#ffffff" d="m 34.016818,82.968651 q -0.55664,0 -0.981445,-0.230713 -0.421143,-0.230713 -0.655518,-0.651856 -0.230712,-0.424804 -0.230712,-0.977783 0,-0.560302 0.230712,-0.988769 0.234375,-0.428467 0.655518,-0.662842 0.424805,-0.234375 0.981445,-0.234375 0.545655,0 0.959473,0.234375 0.413818,0.234375 0.637207,0.662842 0.223389,0.424804 0.219727,0.988769 0,0.556641 -0.227051,0.977783 -0.223389,0.421143 -0.637207,0.651856 -0.410157,0.230713 -0.952149,0.230713 z m 0,-0.578613 q 0.344239,0 0.60791,-0.157471 0.267334,-0.161133 0.413819,-0.45044 0.150146,-0.292968 0.157471,-0.673828 -0.0073,-0.388183 -0.157471,-0.684814 -0.150147,-0.296631 -0.413819,-0.457764 -0.263671,-0.164795 -0.60791,-0.164795 -0.366211,0 -0.648193,0.164795 -0.27832,0.164795 -0.432129,0.461426 -0.150146,0.296631 -0.150146,0.688476 0,0.38086 0.150146,0.670166 0.153809,0.289307 0.432129,0.446778 0.27832,0.157471 0.648193,0.157471 z" /><path style="fill:#fff;" d="m 39.323508,83.01992 q -0.212403,-0.380859 -0.300293,-0.717773 -0.05493,0.150146 -0.212403,0.300293 -0.153808,0.150146 -0.402832,0.252685 -0.245361,0.102539 -0.560302,0.102539 -0.516358,0 -0.834961,-0.201416 -0.318604,-0.201416 -0.454102,-0.520019 -0.135498,-0.322266 -0.135498,-0.706787 v -2.215576 h 0.600586 v 2.028808 q 0,0.479737 0.197754,0.769043 0.201416,0.289307 0.758057,0.289307 0.413818,0 0.684814,-0.194092 0.270996,-0.197754 0.270996,-0.655518 v -2.24121 h 0.600586 v 2.358398 q 0.0037,0.53833 0.318604,1.105957 z" /><path style="fill:#fff;" d="m 41.29006,79.654442 q 0.377197,-0.435791 0.966797,-0.435791 0.164795,0 0.344238,0.03296 L 42.498556,79.8229 q -0.102539,-0.01099 -0.201416,-0.01099 -0.567627,0 -0.941162,0.351562 v 2.713623 h -0.600586 v -3.566894 h 0.454102 l 0.08057,0.344238 z" /><path style="fill:#fff;" d="m 45.497824,77.625633 h 1.442871 q 0.545654,0 0.941162,0.179444 0.39917,0.179443 0.611572,0.531005 0.212403,0.351563 0.212403,0.856934 0,0.516357 -0.245362,0.900879 -0.241699,0.384521 -0.67749,0.593262 -0.432129,0.205078 -0.985107,0.205078 h -0.684815 v 1.984863 h -0.615234 z m 1.256103,2.713623 q 0.615235,0 0.963135,-0.281982 0.3479,-0.281983 0.3479,-0.834961 0,-0.53833 -0.314941,-0.787354 -0.314941,-0.252685 -0.915527,-0.252685 l -0.725098,0.0037 v 2.15332 h 0.644531 z" /><path style="fill:#fff;" d="m 51.661154,82.95034 q -0.736084,0 -1.259766,-0.314941 -0.523681,-0.314942 -0.79834,-0.915527 -0.270996,-0.604249 -0.270996,-1.453858 0,-0.864258 0.314942,-1.479492 0.314941,-0.615234 0.915527,-0.933838 0.604248,-0.322266 1.450195,-0.322266 0.563965,0 1.186524,0.161133 l -0.179444,0.585938 q -0.142822,-0.04761 -0.46875,-0.08423 -0.322265,-0.03662 -0.545654,-0.04761 -0.04395,-0.0037 -0.131836,-0.0037 -0.585937,0 -1.003418,0.256347 -0.41748,0.252686 -0.637207,0.725098 -0.219726,0.472412 -0.219726,1.113281 0,0.662842 0.201416,1.138916 0.205078,0.476074 0.593261,0.72876 0.391846,0.252686 0.9375,0.252686 0.322266,0 0.65918,-0.0769 0.336914,-0.0769 0.703125,-0.201416 l 0.205078,0.560303 q -0.344238,0.131836 -0.794678,0.223389 -0.446777,0.08789 -0.856933,0.08789 z" /><path style="line-height:142.99999475%;letter-spacing:-0.1px;fill:#ffffff" d="m 56.832052,79.654442 q 0.377197,-0.435791 0.966797,-0.435791 0.164795,0 0.344238,0.03296 L 58.040548,79.8229 q -0.102539,-0.01099 -0.201416,-0.01099 -0.567627,0 -0.941162,0.351562 v 2.713623 h -0.600586 v -3.566894 h 0.454102 l 0.08057,0.344238 z" /><path style="line-height:142.99999475%;letter-spacing:-0.1px;fill:#ffffff" d="m 61.27673,83.01992 q -0.201416,-0.351562 -0.303955,-0.725097 -0.06226,0.183105 -0.2417,0.336914 -0.179443,0.153808 -0.428467,0.241699 -0.249023,0.08789 -0.505371,0.08789 -0.362548,0 -0.651855,-0.113526 -0.285645,-0.113525 -0.454102,-0.351562 -0.164795,-0.238037 -0.164795,-0.593262 0,-0.344238 0.17212,-0.596924 0.172119,-0.256347 0.48706,-0.391846 0.318604,-0.135498 0.739746,-0.135498 0.505371,0 0.963135,0.26001 v -0.373535 q 0,-0.439453 -0.205078,-0.640869 -0.205078,-0.201416 -0.60791,-0.201416 -0.153809,0 -0.443116,0.02563 -0.285644,0.02197 -0.534667,0.06225 l -0.10254,-0.600585 q 0.446778,-0.05127 0.699463,-0.07324 0.256348,-0.02197 0.428467,-0.02197 0.666504,0 1.010742,0.351562 0.344239,0.351563 0.347901,1.047363 l 0.0073,1.054688 q 0.0037,0.53833 0.318603,1.105957 z m -1.343995,-0.618896 q 0.285645,0 0.501709,-0.09888 0.216065,-0.09888 0.333252,-0.281983 0.12085,-0.183105 0.12085,-0.421142 v -0.03296 q -0.183105,-0.102539 -0.406494,-0.157471 -0.223389,-0.05859 -0.465088,-0.05859 -0.391846,0 -0.626221,0.139161 -0.234375,0.135498 -0.234375,0.377197 0,0.157471 0.09521,0.27832 0.09888,0.12085 0.274658,0.19043 0.175782,0.06592 0.406494,0.06592 z" /><path style="fill:#fff;" d="m 64.21262,79.214989 q 0.46875,0 0.787353,0.183105 0.318604,0.183106 0.476075,0.505371 0.161132,0.322266 0.161132,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194091,-0.736084 -0.19043,-0.285644 -0.633545,-0.289306 -0.314942,0.0037 -0.593262,0.117187 -0.274658,0.109864 -0.487061,0.31128 l -0.0073,2.662353 h -0.600586 l 0.0073,-3.566894 h 0.443116 l 0.113525,0.355224 q 0.424805,-0.450439 1.12793,-0.450439 z" /><path style="line-height:142.99999475%;letter-spacing:-0.49000001px;fill:#ffffff" d="m 68.644493,78.19326 q -0.175781,0 -0.292969,-0.117187 -0.117187,-0.117188 -0.117187,-0.292969 0,-0.172119 0.117187,-0.289307 0.117188,-0.117187 0.292969,-0.117187 0.172119,0 0.289307,0.117187 0.117187,0.117188 0.117187,0.289307 0,0.175781 -0.117187,0.292969 -0.117188,0.117187 -0.289307,0.117187 z m -0.311279,1.116944 H 68.9338 v 3.566894 h -0.600586 z" /><path style="fill:#fff;" d="m 71.362503,79.214989 q 0.46875,0 0.787354,0.183105 0.318603,0.183106 0.476074,0.505371 0.161133,0.322266 0.161133,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.19043,-0.285644 -0.633545,-0.289306 -0.314941,0.0037 -0.593262,0.117187 -0.274658,0.109864 -0.48706,0.31128 l -0.0073,2.662353 h -0.600585 l 0.0073,-3.566894 h 0.443115 l 0.113525,0.355224 q 0.424805,-0.450439 1.12793,-0.450439 z" /><path style="fill:#fff;" d="m 74.680374,79.844872 v 1.926269 q 0,0.161133 0.06958,0.314941 0.07324,0.150147 0.219727,0.249024 0.146484,0.09522 0.355224,0.09522 0.146485,0 0.333252,-0.02564 v 0.53833 q -0.238037,0.02197 -0.483398,0.02197 -0.340576,0 -0.578613,-0.146485 -0.238037,-0.146484 -0.358887,-0.391845 -0.12085,-0.249024 -0.12085,-0.549317 v -2.03247 h -0.644531 v -0.531006 h 0.644531 v -1.281739 h 0.563965 v 1.281739 h 0.981445 v 0.531006 h -0.981445 z" /><path style="fill:#fff;" d="m 78.078812,82.968651 q -0.556641,0 -0.981446,-0.230713 -0.421142,-0.230713 -0.655517,-0.651856 -0.230713,-0.424804 -0.230713,-0.977783 0,-0.560302 0.230713,-0.988769 0.234375,-0.428467 0.655517,-0.662842 0.424805,-0.234375 0.981446,-0.234375 0.545654,0 0.959472,0.234375 0.413819,0.234375 0.637207,0.662842 0.223389,0.424804 0.219727,0.988769 0,0.556641 -0.227051,0.977783 -0.223389,0.421143 -0.637207,0.651856 -0.410156,0.230713 -0.952148,0.230713 z m 0,-0.578613 q 0.344238,0 0.60791,-0.157471 0.267334,-0.161133 0.413818,-0.45044 0.150147,-0.292968 0.157471,-0.673828 -0.0073,-0.388183 -0.157471,-0.684814 -0.150146,-0.296631 -0.413818,-0.457764 -0.263672,-0.164795 -0.60791,-0.164795 -0.366211,0 -0.648194,0.164795 -0.27832,0.164795 -0.432129,0.461426 -0.150146,0.296631 -0.150146,0.688476 0,0.38086 0.150146,0.670166 0.153809,0.289307 0.432129,0.446778 0.278321,0.157471 0.648194,0.157471 z" /><path style="fill:#fff;" d="m 85.392044,83.01992 q -0.201416,-0.351562 -0.303955,-0.725097 -0.06226,0.183105 -0.241699,0.336914 -0.179444,0.153808 -0.428467,0.241699 -0.249023,0.08789 -0.505371,0.08789 -0.362549,0 -0.651856,-0.113526 -0.285644,-0.113525 -0.454101,-0.351562 -0.164795,-0.238037 -0.164795,-0.593262 0,-0.344238 0.172119,-0.596924 0.172119,-0.256347 0.487061,-0.391846 0.318603,-0.135498 0.739746,-0.135498 0.505371,0 0.963134,0.26001 v -0.373535 q 0,-0.439453 -0.205078,-0.640869 -0.205078,-0.201416 -0.60791,-0.201416 -0.153808,0 -0.443115,0.02563 -0.285645,0.02197 -0.534668,0.06225 L 83.11055,79.310204 q 0.446777,-0.05127 0.699463,-0.07324 0.256347,-0.02197 0.428467,-0.02197 0.666504,0 1.010742,0.351562 0.344238,0.351563 0.3479,1.047363 l 0.0073,1.054688 q 0.0037,0.53833 0.318604,1.105957 z M 84.04805,82.401024 q 0.285644,0 0.501709,-0.09888 0.216064,-0.09888 0.333252,-0.281983 0.120849,-0.183105 0.120849,-0.421142 v -0.03296 q -0.183105,-0.102539 -0.406494,-0.157471 -0.223388,-0.05859 -0.465088,-0.05859 -0.391845,0 -0.62622,0.139161 -0.234375,0.135498 -0.234375,0.377197 0,0.157471 0.09522,0.27832 0.09888,0.12085 0.274658,0.19043 0.175781,0.06592 0.406494,0.06592 z" /><path style="line-height:142.99999475%;letter-spacing:-0.27000001px;fill:#ffffff" d="m 90.639847,79.214989 q 0.505371,0 0.864258,0.212402 0.362548,0.20874 0.549316,0.615234 0.19043,0.402832 0.19043,0.970459 0,0.596924 -0.197754,1.036377 -0.197754,0.435791 -0.5896,0.673828 -0.388183,0.238038 -0.948486,0.238038 -0.86792,0 -1.109619,-0.637207 v 2.274169 h -0.604248 v -5.288085 h 0.446777 l 0.142822,0.454101 q 0.245362,-0.263672 0.567627,-0.406494 0.325928,-0.142822 0.688477,-0.142822 z m -0.08789,3.186035 q 0.300293,0 0.534668,-0.146485 0.238037,-0.146484 0.373535,-0.457763 0.13916,-0.314942 0.13916,-0.791016 0,-0.567627 -0.270996,-0.878906 -0.267334,-0.311279 -0.761718,-0.311279 -0.281983,0 -0.585938,0.09888 -0.300293,0.09521 -0.582275,0.270996 v 1.160888 q 0,0.402832 0.190429,0.64087 0.19043,0.234375 0.45044,0.325927 0.263672,0.08789 0.512695,0.08789 z" /><path style="line-height:142.99999475%;letter-spacing:-0.27000001px;fill:#ffffff" d="m 93.467987,79.654442 q 0.377197,-0.435791 0.966797,-0.435791 0.164795,0 0.344238,0.03296 L 94.676483,79.8229 q -0.102539,-0.01099 -0.201416,-0.01099 -0.567627,0 -0.941162,0.351562 v 2.713623 h -0.600586 v -3.566894 h 0.454102 l 0.08057,0.344238 z" /><path style="fill:#fff;" d="m 96.874748,82.968651 q -0.55664,0 -0.981445,-0.230713 -0.421143,-0.230713 -0.655518,-0.651856 -0.230713,-0.424804 -0.230713,-0.977783 0,-0.560302 0.230713,-0.988769 0.234375,-0.428467 0.655518,-0.662842 0.424805,-0.234375 0.981445,-0.234375 0.545655,0 0.959473,0.234375 0.413818,0.234375 0.637207,0.662842 0.223389,0.424804 0.219726,0.988769 0,0.556641 -0.22705,0.977783 -0.223389,0.421143 -0.637207,0.651856 -0.410157,0.230713 -0.952149,0.230713 z m 0,-0.578613 q 0.344239,0 0.60791,-0.157471 0.267334,-0.161133 0.413819,-0.45044 0.150146,-0.292968 0.15747,-0.673828 -0.0073,-0.388183 -0.15747,-0.684814 -0.150147,-0.296631 -0.413819,-0.457764 -0.263671,-0.164795 -0.60791,-0.164795 -0.366211,0 -0.648193,0.164795 -0.27832,0.164795 -0.432129,0.461426 -0.150147,0.296631 -0.150147,0.688476 0,0.38086 0.150147,0.670166 0.153809,0.289307 0.432129,0.446778 0.27832,0.157471 0.648193,0.157471 z" /><path style="line-height:142.99999475%;letter-spacing:-0.43000001px;fill:#ffffff" d="m 101.51098,79.214989 q 0.52368,0 0.88257,0.223388 0.36255,0.219727 0.54199,0.626221 0.17944,0.402832 0.17944,0.948486 0,0.596924 -0.19775,1.036377 -0.19776,0.435791 -0.5896,0.673828 -0.38818,0.238038 -0.94849,0.238038 -0.84961,0 -1.09863,-0.611573 l -0.17212,0.527344 H 99.6726 L 99.6653,77.32534 h 0.60424 v 2.420655 q 0.49439,-0.531006 1.24146,-0.531006 z m -0.0879,3.186035 q 0.30029,0 0.53467,-0.146485 0.23803,-0.146484 0.37353,-0.457763 0.13916,-0.314942 0.13916,-0.791016 0,-0.3479 -0.12085,-0.615234 -0.11719,-0.270996 -0.35156,-0.421143 -0.23438,-0.153808 -0.5603,-0.153808 -0.36621,0 -0.61158,0.0769 -0.24169,0.07324 -0.55664,0.289307 v 0.688476 l 0.004,0.476074 q 0,0.402832 0.18676,0.64087 0.19043,0.234375 0.45044,0.325927 0.26001,0.08789 0.5127,0.08789 z" /><path style="line-height:142.99999475%;letter-spacing:-0.18000001px;fill:#ffffff" d="m 103.64079,77.32534 h 0.60059 v 5.551758 h -0.60059 z" /><path style="line-height:142.99999475%;letter-spacing:-0.18000001px;fill:#ffffff" d="m 106.96543,82.408348 q 0.24536,0 0.52002,-0.05493 0.27466,-0.05493 0.54932,-0.161132 l 0.18676,0.512695 q -0.26001,0.109863 -0.65917,0.183105 -0.39917,0.07324 -0.7251,0.07324 -0.86426,0 -1.34033,-0.461426 -0.47608,-0.465088 -0.47608,-1.428223 0,-0.600586 0.20874,-1.018066 0.2124,-0.421143 0.61157,-0.637207 0.39917,-0.216065 0.95948,-0.216065 0.49438,0 0.82763,0.230713 0.33325,0.227051 0.49439,0.596924 0.16113,0.366211 0.16113,0.787354 0,0.289306 -0.0806,0.578613 l -2.54882,0.01831 q 0.0806,0.494385 0.41015,0.747071 0.32959,0.249023 0.90088,0.249023 z m -0.24536,-2.633057 q -0.52002,0 -0.78369,0.300293 -0.26367,0.300293 -0.30029,0.809327 l 1.9812,-0.01831 q 0.007,-0.08789 0.007,-0.131836 0,-0.249023 -0.0915,-0.465088 -0.0916,-0.219726 -0.29663,-0.355224 -0.20142,-0.139161 -0.51636,-0.139161 z" /><path style="line-height:142.99999475%;letter-spacing:-0.1px;fill:#ffffff" d="m 113.01468,79.214989 q 0.42847,0 0.72143,0.183105 0.29664,0.183106 0.44312,0.505371 0.14648,0.322266 0.15015,0.739746 v 2.233887 h -0.60059 v -2.06543 q -0.007,-0.454101 -0.19043,-0.736084 -0.1831,-0.285644 -0.60059,-0.285644 -0.29663,0 -0.5603,0.106201 -0.26001,0.102539 -0.4541,0.285645 0.0513,0.223388 0.0513,0.461425 v 2.233887 h -0.60059 v -2.06543 q -0.007,-0.454101 -0.19043,-0.736084 -0.1831,-0.285644 -0.60058,-0.285644 -0.27832,0 -0.52735,0.106201 -0.24902,0.102539 -0.44311,0.289307 l -0.007,2.69165 h -0.60059 l 0.007,-3.566894 h 0.44312 l 0.11352,0.351562 q 0.41382,-0.446777 1.09131,-0.446777 0.37354,0 0.64453,0.13916 0.27466,0.13916 0.43579,0.395508 0.53467,-0.534668 1.27442,-0.534668 z" /><path style="fill:#fff;" d="m 118.17713,79.844872 v 1.926269 q 0,0.161133 0.0696,0.314941 0.0732,0.150147 0.21973,0.249024 0.14648,0.09522 0.35522,0.09522 0.14649,0 0.33325,-0.02564 v 0.53833 q -0.23803,0.02197 -0.48339,0.02197 -0.34058,0 -0.57862,-0.146485 -0.23803,-0.146484 -0.35888,-0.391845 -0.12085,-0.249024 -0.12085,-0.549317 v -2.03247 h -0.64453 v -0.531006 h 0.64453 v -1.281739 h 0.56396 v 1.281739 h 0.98145 v 0.531006 h -0.98145 z" /><path style="line-height:142.99999475%;letter-spacing:-0.14px;fill:#ffffff" d="m 121.65614,79.214989 q 0.46875,0 0.78735,0.183105 0.3186,0.183106 0.47607,0.505371 0.16114,0.322266 0.16114,0.739746 v 2.233887 h -0.60059 v -2.06543 q 0,-0.450439 -0.19409,-0.736084 -0.19409,-0.285644 -0.63355,-0.285644 -0.31494,0 -0.59326,0.113525 -0.27832,0.109864 -0.49438,0.307617 v 2.666016 h -0.60059 v -5.55542 h 0.60059 v 2.307129 q 0.42114,-0.413818 1.09131,-0.413818 z" /><path style="line-height:142.99999475%;letter-spacing:-0.14px;fill:#ffffff" d="m 126.55154,83.01992 q -0.20142,-0.351562 -0.30396,-0.725097 -0.0623,0.183105 -0.2417,0.336914 -0.17944,0.153808 -0.42846,0.241699 -0.24903,0.08789 -0.50538,0.08789 -0.36254,0 -0.65185,-0.113526 -0.28565,-0.113525 -0.4541,-0.351562 -0.1648,-0.238037 -0.1648,-0.593262 0,-0.344238 0.17212,-0.596924 0.17212,-0.256347 0.48706,-0.391846 0.31861,-0.135498 0.73975,-0.135498 0.50537,0 0.96313,0.26001 v -0.373535 q 0,-0.439453 -0.20508,-0.640869 -0.20507,-0.201416 -0.60791,-0.201416 -0.1538,0 -0.44311,0.02563 -0.28565,0.02197 -0.53467,0.06225 l -0.10254,-0.600585 q 0.44678,-0.05127 0.69947,-0.07324 0.25634,-0.02197 0.42846,-0.02197 0.66651,0 1.01074,0.351562 0.34424,0.351563 0.3479,1.047363 l 0.007,1.054688 q 0.004,0.53833 0.3186,1.105957 l -0.531,0.245361 z m -1.344,-0.618896 q 0.28565,0 0.50171,-0.09888 0.21607,-0.09888 0.33325,-0.281983 0.12085,-0.183105 0.12085,-0.421142 v -0.03296 q -0.1831,-0.102539 -0.40649,-0.157471 -0.22339,-0.05859 -0.46509,-0.05859 -0.39184,0 -0.62622,0.139161 -0.23437,0.135498 -0.23437,0.377197 0,0.157471 0.0952,0.27832 0.0989,0.12085 0.27466,0.19043 0.17578,0.06592 0.40649,0.06592 z" /><path style="fill:#fff;" d="m 128.51725,79.844872 v 1.926269 q 0,0.161133 0.0696,0.314941 0.0732,0.150147 0.21973,0.249024 0.14648,0.09522 0.35522,0.09522 0.14649,0 0.33325,-0.02564 v 0.53833 q -0.23803,0.02197 -0.4834,0.02197 -0.34057,0 -0.57861,-0.146485 -0.23804,-0.146484 -0.35889,-0.391845 -0.12084,-0.249024 -0.12084,-0.549317 v -2.03247 h -0.64454 v -0.531006 h 0.64454 v -1.281739 h 0.56396 v 1.281739 h 0.98145 v 0.531006 h -0.98145 z" /><path style="fill:#fff;" d="m 132.67008,78.19326 q -0.17578,0 -0.29297,-0.117187 -0.11718,-0.117188 -0.11718,-0.292969 0,-0.172119 0.11718,-0.289307 0.11719,-0.117187 0.29297,-0.117187 0.17212,0 0.28931,0.117187 0.11719,0.117188 0.11719,0.289307 0,0.175781 -0.11719,0.292969 -0.11719,0.117187 -0.28931,0.117187 z m -0.31128,1.116944 h 0.60059 v 3.566894 h -0.60059 z" /><path style="fill:#fff;" d="m 134.94791,79.844872 v 1.926269 q 0,0.161133 0.0696,0.314941 0.0733,0.150147 0.21973,0.249024 0.14649,0.09522 0.35523,0.09522 0.14648,0 0.33325,-0.02564 v 0.53833 q -0.23804,0.02197 -0.4834,0.02197 -0.34058,0 -0.57861,-0.146485 -0.23804,-0.146484 -0.35889,-0.391845 -0.12085,-0.249024 -0.12085,-0.549317 v -2.03247 h -0.64453 v -0.531006 h 0.64453 v -1.281739 h 0.56396 v 1.281739 h 0.98145 v 0.531006 h -0.98145 z" /><path style="line-height:142.99999475%;letter-spacing:-0.25999999px;fill:#ffffff" d="m 140.03825,82.961327 q -0.55297,0 -0.95214,-0.223389 -0.39917,-0.223389 -0.60791,-0.640869 -0.20875,-0.421143 -0.20875,-0.996094 0,-0.571289 0.21241,-0.996094 0.2124,-0.424804 0.62256,-0.655517 0.41015,-0.230713 0.9851,-0.227051 0.3003,-0.0037 0.5896,0.05493 0.28931,0.05493 0.49073,0.150146 l -0.14649,0.60791 q -0.44678,-0.201416 -0.93017,-0.201416 -0.61158,0 -0.88624,0.314942 -0.27465,0.311279 -0.27465,0.933837 0,0.651856 0.31128,0.970459 0.31494,0.318604 0.91552,0.318604 0.24536,0 0.43579,-0.04761 0.1941,-0.05127 0.50904,-0.168457 l 0.18677,0.55664 q -0.30762,0.117188 -0.63355,0.183106 -0.32593,0.06592 -0.6189,0.06592 z" /><path style="line-height:142.99999475%;letter-spacing:-0.19px;fill:#ffffff" d="m 143.34881,82.968651 q -0.55664,0 -0.98145,-0.230713 -0.42114,-0.230713 -0.65551,-0.651856 -0.23072,-0.424804 -0.23072,-0.977783 0,-0.560302 0.23072,-0.988769 0.23437,-0.428467 0.65551,-0.662842 0.42481,-0.234375 0.98145,-0.234375 0.54565,0 0.95947,0.234375 0.41382,0.234375 0.63721,0.662842 0.22339,0.424804 0.21972,0.988769 0,0.556641 -0.22705,0.977783 -0.22338,0.421143 -0.6372,0.651856 -0.41016,0.230713 -0.95215,0.230713 z m 0,-0.578613 q 0.34424,0 0.60791,-0.157471 0.26733,-0.161133 0.41382,-0.45044 0.15014,-0.292968 0.15747,-0.673828 -0.007,-0.388183 -0.15747,-0.684814 -0.15015,-0.296631 -0.41382,-0.457764 -0.26367,-0.164795 -0.60791,-0.164795 -0.36621,0 -0.6482,0.164795 -0.27832,0.164795 -0.43212,0.461426 -0.15015,0.296631 -0.15015,0.688476 0,0.38086 0.15015,0.670166 0.1538,0.289307 0.43212,0.446778 0.27833,0.157471 0.6482,0.157471 z" /><path style="line-height:142.99999475%;letter-spacing:-0.19px;fill:#ffffff" d="m 148.7655,83.01992 q -0.2124,-0.380859 -0.30029,-0.717773 -0.0549,0.150146 -0.2124,0.300293 -0.15381,0.150146 -0.40283,0.252685 -0.24537,0.102539 -0.56031,0.102539 -0.51635,0 -0.83496,-0.201416 -0.3186,-0.201416 -0.4541,-0.520019 -0.1355,-0.322266 -0.1355,-0.706787 v -2.215576 h 0.60059 v 2.028808 q 0,0.479737 0.19775,0.769043 0.20142,0.289307 0.75806,0.289307 0.41382,0 0.68481,-0.194092 0.271,-0.197754 0.271,-0.655518 v -2.24121 h 0.60059 v 2.358398 q 0.004,0.53833 0.3186,1.105957 z" /><path style="line-height:142.99999475%;letter-spacing:-0.09px;fill:#ffffff" d="m 150.00372,77.32534 h 0.60059 v 5.551758 h -0.60059 z" /><path style="line-height:142.99999475%;letter-spacing:-0.09px;fill:#ffffff" d="m 154.71841,83.01992 q -0.20874,-0.377197 -0.30762,-0.739746 -0.15747,0.336914 -0.49072,0.509033 -0.32959,0.17212 -0.8313,0.17212 -0.47974,0 -0.84229,-0.223389 -0.36255,-0.227051 -0.56396,-0.637207 -0.19776,-0.410156 -0.19776,-0.952149 0,-0.574951 0.22339,-1.010742 0.22339,-0.439453 0.62989,-0.681152 0.41015,-0.241699 0.94848,-0.241699 0.55298,0 1.0437,0.380859 v -2.27417 h 0.60059 v 4.346924 q 0.004,0.53833 0.3186,1.105957 z m -1.48316,-0.633545 q 0.53467,0 0.81299,-0.303955 0.28198,-0.307617 0.28198,-0.864257 V 80.11953 q -0.22705,-0.197754 -0.49072,-0.278321 -0.26367,-0.08057 -0.50537,-0.08057 -0.36987,0 -0.64087,0.164795 -0.271,0.161133 -0.41748,0.465088 -0.14648,0.300293 -0.14648,0.717773 0,0.314942 0.11718,0.60791 0.11719,0.292969 0.36621,0.483399 0.24903,0.186767 0.62256,0.186767 z" /><path style="line-height:142.99999475%;letter-spacing:-0.19px;fill:#ffffff" d="m 157.75219,79.214989 q 0.46875,0 0.78735,0.183105 0.31861,0.183106 0.47608,0.505371 0.16113,0.322266 0.16113,0.739746 v 2.233887 h -0.60059 v -2.06543 q 0,-0.450439 -0.19409,-0.736084 -0.19043,-0.285644 -0.63354,-0.289306 -0.31494,0.0037 -0.59326,0.117187 -0.27466,0.109864 -0.48706,0.31128 l -0.007,2.662353 h -0.60058 l 0.007,-3.566894 h 0.44311 l 0.11353,0.355224 q 0.4248,-0.450439 1.12793,-0.450439 z" /><path style="line-height:142.99999475%;letter-spacing:-0.19px;fill:#ffffff" d="m 160.11102,77.497459 h 0.53101 v 1.71753 h -0.53101 z" /><path style="fill:#fff;" d="m 162.41858,79.844872 v 1.926269 q 0,0.161133 0.0696,0.314941 0.0732,0.150147 0.21973,0.249024 0.14648,0.09522 0.35522,0.09522 0.14648,0 0.33325,-0.02564 v 0.53833 q -0.23803,0.02197 -0.4834,0.02197 -0.34057,0 -0.57861,-0.146485 -0.23804,-0.146484 -0.35889,-0.391845 -0.12085,-0.249024 -0.12085,-0.549317 v -2.03247 h -0.64453 v -0.531006 h 0.64453 v -1.281739 h 0.56397 v 1.281739 h 0.98144 v 0.531006 h -0.98144 z" /><path style="fill:#fff;" d="m 30.251877,89.939988 q 0.46875,0 0.787353,0.183106 0.318604,0.183105 0.476075,0.505371 0.161132,0.322266 0.161132,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194091,-0.736084 -0.194092,-0.285645 -0.633545,-0.285645 -0.314942,0 -0.593262,0.113526 -0.27832,0.109863 -0.494385,0.307617 v 2.666016 h -0.600586 v -5.55542 h 0.600586 v 2.307129 q 0.421143,-0.413819 1.091309,-0.413819 z" /><path style="fill:#fff;" d="m 35.287277,93.74492 q -0.201416,-0.351563 -0.303955,-0.725098 -0.06226,0.183106 -0.241699,0.336914 -0.179443,0.153809 -0.428467,0.2417 -0.249023,0.08789 -0.505371,0.08789 -0.362549,0 -0.651855,-0.113525 -0.285645,-0.113526 -0.454102,-0.351563 -0.164795,-0.238037 -0.164795,-0.593261 0,-0.344239 0.172119,-0.596924 0.172119,-0.256348 0.487061,-0.391846 0.318603,-0.135498 0.739746,-0.135498 0.505371,0 0.963135,0.26001 v -0.373535 q 0,-0.439453 -0.205078,-0.64087 -0.205079,-0.201416 -0.607911,-0.201416 -0.153808,0 -0.443115,0.02563 -0.285644,0.02197 -0.534668,0.06226 l -0.102539,-0.600586 q 0.446777,-0.05127 0.699463,-0.07324 0.256348,-0.02197 0.428467,-0.02197 0.666504,0 1.010742,0.351563 0.344238,0.351562 0.3479,1.047363 l 0.0073,1.054688 q 0.0037,0.53833 0.318603,1.105957 l -0.531006,0.245361 z m -1.343994,-0.618897 q 0.285645,0 0.501709,-0.09888 0.216065,-0.09888 0.333252,-0.281983 0.12085,-0.183105 0.12085,-0.421142 v -0.03296 q -0.183106,-0.10254 -0.406495,-0.157471 -0.223388,-0.05859 -0.465087,-0.05859 -0.391846,0 -0.626221,0.13916 -0.234375,0.135498 -0.234375,0.377198 0,0.15747 0.09521,0.27832 0.09888,0.120849 0.274658,0.19043 0.175781,0.06592 0.406494,0.06592 z" /><path style="letter-spacing:-0.52999997px;fill:#ffffff" d="m 38.323166,89.939988 q 0.46875,0 0.787353,0.183106 0.318604,0.183105 0.476075,0.505371 0.161132,0.322266 0.161132,0.739746 v 2.233887 h -0.600585 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.19043,-0.285645 -0.633545,-0.289307 -0.314942,0.0037 -0.593262,0.117188 -0.274658,0.109863 -0.48706,0.311279 l -0.0073,2.662354 h -0.600586 l 0.0073,-3.566895 h 0.443115 l 0.113525,0.355225 q 0.424805,-0.45044 1.12793,-0.45044 z" /><path style="letter-spacing:-0.1px;fill:#ffffff" d="m 43.341262,93.74492 q -0.20874,-0.377197 -0.307617,-0.739746 -0.157471,0.336914 -0.490723,0.509033 -0.32959,0.172119 -0.831299,0.172119 -0.479736,0 -0.842285,-0.223388 -0.362549,-0.227051 -0.563965,-0.637207 -0.197754,-0.410157 -0.197754,-0.952149 0,-0.574951 0.223389,-1.010742 0.223389,-0.439453 0.629883,-0.681152 0.410156,-0.2417 0.948486,-0.2417 0.552979,0 1.043701,0.38086 v -2.27417 h 0.600586 v 4.346924 q 0.0037,0.53833 0.318604,1.105957 z m -1.483154,-0.633545 q 0.534668,0 0.812988,-0.303955 0.281982,-0.307617 0.281982,-0.864258 v -1.098633 q -0.227051,-0.197754 -0.490722,-0.27832 -0.263672,-0.08057 -0.505371,-0.08057 -0.369874,0 -0.64087,0.164795 -0.270996,0.161132 -0.41748,0.465087 -0.146484,0.300293 -0.146484,0.717774 0,0.314941 0.117187,0.60791 0.117188,0.292969 0.366211,0.483398 0.249023,0.186768 0.622559,0.186768 z" /><path style="letter-spacing:-0.1px;fill:#ffffff" d="m 44.676809,88.05034 h 0.600586 v 5.551758 h -0.600586 z" /><path style="fill:#fff;" d="m 48.081448,93.133348 q 0.245361,0 0.520019,-0.05493 0.274658,-0.05493 0.549317,-0.161133 l 0.186767,0.512696 q -0.26001,0.109863 -0.65918,0.183105 -0.399169,0.07324 -0.725097,0.07324 -0.864258,0 -1.340332,-0.461426 -0.476074,-0.465087 -0.476074,-1.428222 0,-0.600586 0.20874,-1.018067 0.212402,-0.421142 0.611572,-0.637207 0.39917,-0.216064 0.959473,-0.216064 0.494384,0 0.827636,0.230713 0.333252,0.227051 0.494385,0.596924 0.161133,0.366211 0.161133,0.787353 0,0.289307 -0.08057,0.578613 l -2.548829,0.01831 q 0.08057,0.494385 0.410157,0.74707 0.32959,0.249024 0.900879,0.249024 z m -0.245362,-2.633057 q -0.520019,0 -0.783691,0.300293 -0.263672,0.300293 -0.300293,0.809326 l 1.981201,-0.01831 q 0.0073,-0.08789 0.0073,-0.131836 0,-0.249024 -0.09155,-0.465088 -0.09155,-0.219727 -0.296631,-0.355225 -0.201416,-0.13916 -0.516358,-0.13916 z" /><path style="fill:#fff;" d="m 49.83926,94.312547 q 0.245361,-0.457764 0.336914,-0.780029 0.09155,-0.322266 0.09155,-0.765381 h 0.65918 q 0,0.454101 -0.161133,0.944824 -0.157471,0.494385 -0.424805,0.856934 z" /><path style="fill:#fff;" d="m 56.456692,93.74492 q -0.201416,-0.351563 -0.303955,-0.725098 -0.06226,0.183106 -0.2417,0.336914 -0.179443,0.153809 -0.428466,0.2417 -0.249024,0.08789 -0.505371,0.08789 -0.362549,0 -0.651856,-0.113525 -0.285644,-0.113526 -0.454101,-0.351563 -0.164795,-0.238037 -0.164795,-0.593261 0,-0.344239 0.172119,-0.596924 0.172119,-0.256348 0.48706,-0.391846 0.318604,-0.135498 0.739746,-0.135498 0.505371,0 0.963135,0.26001 v -0.373535 q 0,-0.439453 -0.205078,-0.64087 -0.205078,-0.201416 -0.60791,-0.201416 -0.153809,0 -0.443115,0.02563 -0.285645,0.02197 -0.534668,0.06226 l -0.102539,-0.600586 q 0.446777,-0.05127 0.699462,-0.07324 0.256348,-0.02197 0.428467,-0.02197 0.666504,0 1.010742,0.351563 0.344239,0.351562 0.347901,1.047363 l 0.0073,1.054688 q 0.0037,0.53833 0.318604,1.105957 l -0.531006,0.245361 z m -1.343994,-0.618897 q 0.285644,0 0.501709,-0.09888 0.216064,-0.09888 0.333252,-0.281983 0.120849,-0.183105 0.120849,-0.421142 v -0.03296 q -0.183105,-0.10254 -0.406494,-0.157471 -0.223389,-0.05859 -0.465088,-0.05859 -0.391846,0 -0.626221,0.13916 -0.234375,0.135498 -0.234375,0.377198 0,0.15747 0.09522,0.27832 0.09888,0.120849 0.274658,0.19043 0.175782,0.06592 0.406495,0.06592 z" /><path style="letter-spacing:-0.23px;fill:#ffffff" d="m 59.49258,89.939988 q 0.46875,0 0.787354,0.183106 0.318603,0.183105 0.476074,0.505371 0.161133,0.322266 0.161133,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.190429,-0.285645 -0.633545,-0.289307 -0.314941,0.0037 -0.593261,0.117188 -0.274659,0.109863 -0.487061,0.311279 l -0.0073,2.662354 H 57.80071 l 0.0073,-3.566895 h 0.443115 l 0.113526,0.355225 q 0.424804,-0.45044 1.127929,-0.45044 z" /><path style="letter-spacing:-0.23px;fill:#ffffff" d="m 64.810677,93.74492 q -0.208741,-0.377197 -0.307618,-0.739746 -0.15747,0.336914 -0.490722,0.509033 -0.32959,0.172119 -0.831299,0.172119 -0.479736,0 -0.842285,-0.223388 -0.362549,-0.227051 -0.563965,-0.637207 -0.197754,-0.410157 -0.197754,-0.952149 0,-0.574951 0.223389,-1.010742 0.223388,-0.439453 0.629882,-0.681152 0.410157,-0.2417 0.948487,-0.2417 0.552978,0 1.043701,0.38086 v -2.27417 h 0.600586 v 4.346924 q 0.0037,0.53833 0.318603,1.105957 z m -1.483155,-0.633545 q 0.534668,0 0.812989,-0.303955 0.281982,-0.307617 0.281982,-0.864258 v -1.098633 q -0.227051,-0.197754 -0.490723,-0.27832 -0.263672,-0.08057 -0.505371,-0.08057 -0.369873,0 -0.640869,0.164795 -0.270996,0.161132 -0.41748,0.465087 -0.146485,0.300293 -0.146485,0.717774 0,0.314941 0.117188,0.60791 0.117187,0.292969 0.366211,0.483398 0.249023,0.186768 0.622558,0.186768 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 69.505238,89.939988 q 0.46875,0 0.787353,0.183106 0.318604,0.183105 0.476074,0.505371 0.161133,0.322266 0.161133,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.190429,-0.285645 -0.633545,-0.289307 -0.314941,0.0037 -0.593261,0.117188 -0.274658,0.109863 -0.487061,0.311279 l -0.0073,2.662354 h -0.600586 l 0.0073,-3.566895 h 0.443116 l 0.113525,0.355225 q 0.424805,-0.45044 1.12793,-0.45044 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 73.422718,93.69365 q -0.556641,0 -0.981445,-0.230712 -0.421143,-0.230713 -0.655518,-0.651856 -0.230713,-0.424805 -0.230713,-0.977783 0,-0.560303 0.230713,-0.98877 0.234375,-0.428466 0.655518,-0.662841 0.424804,-0.234375 0.981445,-0.234375 0.545654,0 0.959473,0.234375 0.413818,0.234375 0.637207,0.662841 0.223388,0.424805 0.219726,0.98877 0,0.55664 -0.22705,0.977783 -0.223389,0.421143 -0.637208,0.651856 -0.410156,0.230712 -0.952148,0.230712 z m 0,-0.578613 q 0.344238,0 0.60791,-0.157471 0.267334,-0.161132 0.413819,-0.450439 0.150146,-0.292969 0.15747,-0.673828 -0.0073,-0.388184 -0.15747,-0.684815 -0.150147,-0.29663 -0.413819,-0.457763 -0.263672,-0.164795 -0.60791,-0.164795 -0.366211,0 -0.648193,0.164795 -0.278321,0.164795 -0.432129,0.461426 -0.150147,0.29663 -0.150147,0.688476 0,0.380859 0.150147,0.670166 0.153808,0.289307 0.432129,0.446777 0.27832,0.157471 0.648193,0.157471 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 75.439564,90.035203 h 0.611572 l 0.776367,2.548828 q 0.01465,0.05859 0.0293,0.168457 0.01465,0.109864 0.01831,0.161133 h 0.0293 q 0.0037,-0.04395 0.02563,-0.172119 0.02563,-0.131836 0.04028,-0.175781 l 0.84961,-2.53418 h 0.549316 l 0.791016,2.548828 q 0.01099,0.03296 0.0293,0.161133 0.02197,0.124512 0.02563,0.175781 h 0.0293 q 0.0037,-0.03662 0.02563,-0.146484 0.02197,-0.113526 0.04028,-0.183106 l 0.761719,-2.55249 h 0.615234 l -1.124267,3.585205 H 78.940532 L 78.164165,91.21074 q -0.02197,-0.0769 -0.04761,-0.190429 -0.02197,-0.117188 -0.02564,-0.150147 h -0.01465 q -0.0037,0.03296 -0.03296,0.150147 -0.02563,0.113525 -0.04761,0.186767 l -0.820312,2.41333 h -0.600586 l -1.135254,-3.585205 z" /><path style="fill:#fff;" d="m 83.491566,88.91826 q -0.175782,0 -0.292969,-0.117188 -0.117188,-0.117187 -0.117188,-0.292968 0,-0.17212 0.117188,-0.289307 0.117187,-0.117188 0.292969,-0.117188 0.172119,0 0.289306,0.117188 0.117188,0.117187 0.117188,0.289307 0,0.175781 -0.117188,0.292968 -0.117187,0.117188 -0.289306,0.117188 z m -0.31128,1.116943 h 0.600586 v 3.566895 h -0.600586 z" /><path style="fill:#fff;" d="m 85.769398,90.569871 v 1.92627 q 0,0.161132 0.06958,0.314941 0.07324,0.150147 0.219726,0.249024 0.146485,0.09521 0.355225,0.09521 0.146484,0 0.333252,-0.02563 v 0.53833 q -0.238037,0.02197 -0.483398,0.02197 -0.340577,0 -0.578614,-0.146484 -0.238037,-0.146484 -0.358886,-0.391846 -0.12085,-0.249023 -0.12085,-0.549316 v -2.032471 h -0.644531 v -0.531006 h 0.644531 v -1.281738 h 0.563965 v 1.281738 h 0.981445 v 0.531006 h -0.981445 z" /><path style="fill:#fff;" d="m 91.299183,89.939988 q 0.46875,0 0.787353,0.183106 0.318604,0.183105 0.476075,0.505371 0.161132,0.322266 0.161132,0.739746 v 2.233887 h -0.600585 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.19043,-0.285645 -0.633545,-0.289307 -0.314942,0.0037 -0.593262,0.117188 -0.274658,0.109863 -0.48706,0.311279 l -0.0073,2.662354 h -0.600586 l 0.0073,-3.566895 h 0.443115 l 0.113525,0.355225 q 0.424805,-0.45044 1.12793,-0.45044 z" /><path style="fill:#fff;" d="m 95.547226,93.133348 q 0.245361,0 0.520019,-0.05493 0.274659,-0.05493 0.549317,-0.161133 l 0.186767,0.512696 q -0.260009,0.109863 -0.659179,0.183105 -0.39917,0.07324 -0.725098,0.07324 -0.864258,0 -1.340332,-0.461426 -0.476074,-0.465087 -0.476074,-1.428222 0,-0.600586 0.20874,-1.018067 0.212402,-0.421142 0.611572,-0.637207 0.39917,-0.216064 0.959473,-0.216064 0.494385,0 0.827637,0.230713 0.333252,0.227051 0.494385,0.596924 0.161132,0.366211 0.161132,0.787353 0,0.289307 -0.08057,0.578613 l -2.548828,0.01831 q 0.08057,0.494385 0.410156,0.74707 0.32959,0.249024 0.900879,0.249024 z m -0.245361,-2.633057 q -0.52002,0 -0.783692,0.300293 -0.263672,0.300293 -0.300293,0.809326 l 1.981201,-0.01831 q 0.0073,-0.08789 0.0073,-0.131836 0,-0.249024 -0.09155,-0.465088 -0.09155,-0.219727 -0.296631,-0.355225 -0.201416,-0.13916 -0.516357,-0.13916 z" /><path style="fill:#fff;" d="m 99.458359,93.133348 q 0.245361,0 0.520019,-0.05493 0.274662,-0.05493 0.549312,-0.161133 l 0.18677,0.512696 q -0.26001,0.109863 -0.65918,0.183105 -0.399167,0.07324 -0.725095,0.07324 -0.864258,0 -1.340332,-0.461426 -0.476074,-0.465087 -0.476074,-1.428222 0,-0.600586 0.20874,-1.018067 0.212402,-0.421142 0.611572,-0.637207 0.39917,-0.216064 0.959473,-0.216064 0.494385,0 0.827636,0.230713 0.33325,0.227051 0.49439,0.596924 0.16113,0.366211 0.16113,0.787353 0,0.289307 -0.0806,0.578613 l -2.548826,0.01831 q 0.08057,0.494385 0.410156,0.74707 0.32959,0.249024 0.900879,0.249024 z m -0.245362,-2.633057 q -0.520019,0 -0.783691,0.300293 -0.263672,0.300293 -0.300293,0.809326 l 1.981197,-0.01831 q 0.007,-0.08789 0.007,-0.131836 0,-0.249024 -0.0916,-0.465088 -0.09156,-0.219727 -0.296635,-0.355225 -0.201416,-0.13916 -0.516358,-0.13916 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 104.66954,93.74492 q -0.20874,-0.377197 -0.30762,-0.739746 -0.15747,0.336914 -0.49072,0.509033 -0.32959,0.172119 -0.8313,0.172119 -0.47973,0 -0.84228,-0.223388 -0.36255,-0.227051 -0.56397,-0.637207 -0.19775,-0.410157 -0.19775,-0.952149 0,-0.574951 0.22339,-1.010742 0.22339,-0.439453 0.62988,-0.681152 0.41016,-0.2417 0.94849,-0.2417 0.55297,0 1.0437,0.38086 v -2.27417 h 0.60058 v 4.346924 q 0.004,0.53833 0.31861,1.105957 z m -1.48315,-0.633545 q 0.53466,0 0.81298,-0.303955 0.28199,-0.307617 0.28199,-0.864258 v -1.098633 q -0.22705,-0.197754 -0.49073,-0.27832 -0.26367,-0.08057 -0.50537,-0.08057 -0.36987,0 -0.64087,0.164795 -0.27099,0.161132 -0.41748,0.465087 -0.14648,0.300293 -0.14648,0.717774 0,0.314941 0.11719,0.60791 0.11718,0.292969 0.36621,0.483398 0.24902,0.186768 0.62256,0.186768 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 106.76695,93.69365 q -0.57861,-0.0037 -1.20483,-0.285644 l 0.19775,-0.53833 q 0.5896,0.263672 1.00708,0.270996 0.76172,-0.01099 0.76538,-0.501709 0,-0.172119 -0.0989,-0.281982 -0.0952,-0.109864 -0.2417,-0.175782 -0.14283,-0.06592 -0.39551,-0.146484 -0.33325,-0.106201 -0.54199,-0.20874 -0.20874,-0.106202 -0.35889,-0.314942 -0.14648,-0.20874 -0.14648,-0.552978 0.011,-1.025391 1.24878,-1.025391 0.56762,0 0.98876,0.194092 l -0.20874,0.545654 q -0.42114,-0.186767 -0.78002,-0.186767 -0.65552,0.0073 -0.68116,0.472412 0,0.13916 0.0879,0.230713 0.0879,0.09155 0.21607,0.150146 0.13183,0.05493 0.36621,0.131836 0.3479,0.109863 0.56763,0.223389 0.22338,0.109863 0.38452,0.340576 0.16113,0.227051 0.16113,0.604248 0,1.054687 -1.33301,1.054687 z" /><path style="fill:#fff;" d="m 111.59264,90.569871 v 1.92627 q 0,0.161132 0.0696,0.314941 0.0732,0.150147 0.21972,0.249024 0.14649,0.09521 0.35523,0.09521 0.14648,0 0.33325,-0.02563 v 0.53833 q -0.23804,0.02197 -0.4834,0.02197 -0.34058,0 -0.57861,-0.146484 -0.23804,-0.146484 -0.35889,-0.391846 -0.12085,-0.249023 -0.12085,-0.549316 v -2.032471 h -0.64453 v -0.531006 h 0.64453 v -1.281738 h 0.56397 v 1.281738 h 0.98144 v 0.531006 h -0.98144 z" /><path style="fill:#fff;" d="m 114.99107,93.69365 q -0.55664,0 -0.98144,-0.230712 -0.42114,-0.230713 -0.65552,-0.651856 -0.23071,-0.424805 -0.23071,-0.977783 0,-0.560303 0.23071,-0.98877 0.23438,-0.428466 0.65552,-0.662841 0.4248,-0.234375 0.98144,-0.234375 0.54566,0 0.95948,0.234375 0.41381,0.234375 0.6372,0.662841 0.22339,0.424805 0.21973,0.98877 0,0.55664 -0.22705,0.977783 -0.22339,0.421143 -0.63721,0.651856 -0.41015,0.230712 -0.95215,0.230712 z m 0,-0.578613 q 0.34424,0 0.60791,-0.157471 0.26734,-0.161132 0.41382,-0.450439 0.15015,-0.292969 0.15747,-0.673828 -0.007,-0.388184 -0.15747,-0.684815 -0.15014,-0.29663 -0.41382,-0.457763 -0.26367,-0.164795 -0.60791,-0.164795 -0.36621,0 -0.64819,0.164795 -0.27832,0.164795 -0.43213,0.461426 -0.15015,0.29663 -0.15015,0.688476 0,0.380859 0.15015,0.670166 0.15381,0.289307 0.43213,0.446777 0.27832,0.157471 0.64819,0.157471 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 120.36705,90.379441 q 0.3772,-0.435791 0.9668,-0.435791 0.16479,0 0.34424,0.03296 l -0.10254,0.571289 q -0.10254,-0.01099 -0.20142,-0.01099 -0.56763,0 -0.94116,0.351563 v 2.713623 h -0.60059 V 90.0352 h 0.4541 l 0.0806,0.344238 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 123.92438,93.133348 q 0.24536,0 0.52002,-0.05493 0.27466,-0.05493 0.54931,-0.161133 l 0.18677,0.512696 q -0.26001,0.109863 -0.65918,0.183105 -0.39917,0.07324 -0.7251,0.07324 -0.86425,0 -1.34033,-0.461426 -0.47607,-0.465087 -0.47607,-1.428222 0,-0.600586 0.20874,-1.018067 0.2124,-0.421142 0.61157,-0.637207 0.39917,-0.216064 0.95947,-0.216064 0.49439,0 0.82764,0.230713 0.33325,0.227051 0.49438,0.596924 0.16114,0.366211 0.16114,0.787353 0,0.289307 -0.0806,0.578613 l -2.54883,0.01831 q 0.0806,0.494385 0.41016,0.74707 0.32959,0.249024 0.90088,0.249024 z m -0.24536,-2.633057 q -0.52002,0 -0.7837,0.300293 -0.26367,0.300293 -0.30029,0.809326 l 1.9812,-0.01831 q 0.007,-0.08789 0.007,-0.131836 0,-0.249024 -0.0916,-0.465088 -0.0915,-0.219727 -0.29663,-0.355225 -0.20141,-0.13916 -0.51635,-0.13916 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 126.85915,93.69365 q -0.57862,-0.0037 -1.20484,-0.285644 l 0.19776,-0.53833 q 0.5896,0.263672 1.00708,0.270996 0.76171,-0.01099 0.76538,-0.501709 0,-0.172119 -0.0989,-0.281982 -0.0952,-0.109864 -0.2417,-0.175782 -0.14282,-0.06592 -0.39551,-0.146484 -0.33325,-0.106201 -0.54199,-0.20874 -0.20874,-0.106202 -0.35889,-0.314942 -0.14648,-0.20874 -0.14648,-0.552978 0.011,-1.025391 1.24878,-1.025391 0.56763,0 0.98877,0.194092 l -0.20874,0.545654 q -0.42114,-0.186767 -0.78003,-0.186767 -0.65552,0.0073 -0.68115,0.472412 0,0.13916 0.0879,0.230713 0.0879,0.09155 0.21606,0.150146 0.13184,0.05493 0.36621,0.131836 0.3479,0.109863 0.56763,0.223389 0.22339,0.109863 0.38452,0.340576 0.16113,0.227051 0.16113,0.604248 0,1.054687 -1.333,1.054687 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 129.68404,90.569871 v 1.92627 q 0,0.161132 0.0696,0.314941 0.0733,0.150147 0.21973,0.249024 0.14648,0.09521 0.35523,0.09521 0.14648,0 0.33325,-0.02563 v 0.53833 q -0.23804,0.02197 -0.4834,0.02197 -0.34058,0 -0.57861,-0.146484 -0.23804,-0.146484 -0.35889,-0.391846 -0.12085,-0.249023 -0.12085,-0.549316 v -2.032471 h -0.64453 v -0.531006 h 0.64453 v -1.281738 h 0.56396 v 1.281738 h 0.98145 v 0.531006 h -0.98145 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 133.7504,93.74492 q -0.20141,-0.351563 -0.30395,-0.725098 -0.0623,0.183106 -0.2417,0.336914 -0.17944,0.153809 -0.42847,0.2417 -0.24902,0.08789 -0.50537,0.08789 -0.36255,0 -0.65185,-0.113525 -0.28565,-0.113526 -0.4541,-0.351563 -0.1648,-0.238037 -0.1648,-0.593261 0,-0.344239 0.17212,-0.596924 0.17212,-0.256348 0.48706,-0.391846 0.3186,-0.135498 0.73975,-0.135498 0.50537,0 0.96313,0.26001 v -0.373535 q 0,-0.439453 -0.20508,-0.64087 -0.20508,-0.201416 -0.60791,-0.201416 -0.15381,0 -0.44311,0.02563 -0.28565,0.02197 -0.53467,0.06226 l -0.10254,-0.600586 q 0.44678,-0.05127 0.69946,-0.07324 0.25635,-0.02197 0.42847,-0.02197 0.6665,0 1.01074,0.351563 0.34424,0.351562 0.3479,1.047363 l 0.007,1.054688 q 0.004,0.53833 0.3186,1.105957 l -0.53101,0.245361 z m -1.34399,-0.618897 q 0.28564,0 0.50171,-0.09888 0.21606,-0.09888 0.33325,-0.281983 0.12085,-0.183105 0.12085,-0.421142 v -0.03296 q -0.1831,-0.10254 -0.40649,-0.157471 -0.22339,-0.05859 -0.46509,-0.05859 -0.39185,0 -0.62622,0.13916 -0.23438,0.135498 -0.23438,0.377198 0,0.15747 0.0952,0.27832 0.0989,0.120849 0.27466,0.19043 0.17578,0.06592 0.40649,0.06592 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 135.43639,90.379441 q 0.37719,-0.435791 0.96679,-0.435791 0.1648,0 0.34424,0.03296 l -0.10254,0.571289 q -0.10254,-0.01099 -0.20141,-0.01099 -0.56763,0 -0.94117,0.351563 v 2.713623 h -0.60058 V 90.0352 h 0.4541 l 0.0806,0.344238 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 138.06354,90.569871 v 1.92627 q 0,0.161132 0.0696,0.314941 0.0732,0.150147 0.21972,0.249024 0.14649,0.09521 0.35523,0.09521 0.14648,0 0.33325,-0.02563 v 0.53833 q -0.23804,0.02197 -0.4834,0.02197 -0.34057,0 -0.57861,-0.146484 -0.23804,-0.146484 -0.35889,-0.391846 -0.12085,-0.249023 -0.12085,-0.549316 v -2.032471 h -0.64453 v -0.531006 h 0.64453 v -1.281738 h 0.56397 v 1.281738 h 0.98144 v 0.531006 h -0.98144 z" /><path style="fill:#fff;" d="m 139.86305,93.682664 q -0.18677,0 -0.30029,-0.109863 -0.10986,-0.113526 -0.10986,-0.300293 0,-0.186768 0.10986,-0.300293 0.11352,-0.113526 0.30029,-0.113526 0.18677,0 0.3003,0.113526 0.11352,0.113525 0.11352,0.300293 0,0.186767 -0.11352,0.300293 -0.11353,0.109863 -0.3003,0.109863 z" /></g><g><path style="fill:#fff;" d="m 28.880116,106.02305 -0.844117,-1.6626 h 0.344239 l 0.593261,1.19568 q 0.01099,0.0238 0.0293,0.0714 0.01831,0.0458 0.03479,0.0897 h 0.0055 q 0.01648,-0.0604 0.06775,-0.16113 l 0.620728,-1.19568 h 0.322266 l -0.866089,1.65527 v 0.97046 h -0.307617 v -0.96313 z" /><path style="fill:#fff;" d="m 31.181751,107.03196 q -0.27832,0 -0.490722,-0.11536 -0.210572,-0.11535 -0.327759,-0.32592 -0.115357,-0.21241 -0.115357,-0.4889 0,-0.28015 0.115357,-0.49438 0.117187,-0.21423 0.327759,-0.33142 0.212402,-0.11719 0.490722,-0.11719 0.272827,0 0.479737,0.11719 0.206909,0.11719 0.318603,0.33142 0.111694,0.2124 0.109863,0.49438 0,0.27832 -0.113525,0.4889 -0.111694,0.21057 -0.318604,0.32592 -0.205078,0.11536 -0.476074,0.11536 z m 0,-0.28931 q 0.172119,0 0.303955,-0.0787 0.133667,-0.0806 0.20691,-0.22522 0.07507,-0.14649 0.07873,-0.33692 -0.0037,-0.19409 -0.07873,-0.3424 -0.07507,-0.14832 -0.20691,-0.22889 -0.131836,-0.0824 -0.303955,-0.0824 -0.183105,0 -0.324096,0.0824 -0.139161,0.0824 -0.216065,0.23072 -0.07507,0.14831 -0.07507,0.34424 0,0.19043 0.07507,0.33508 0.0769,0.14465 0.216065,0.22339 0.13916,0.0787 0.324096,0.0787 z" /><path style="fill:#fff;" d="m 33.985096,107.05759 q -0.106201,-0.19043 -0.150147,-0.35888 -0.02746,0.0751 -0.106201,0.15014 -0.0769,0.0751 -0.201416,0.12635 -0.12268,0.0513 -0.280151,0.0513 -0.258179,0 -0.417481,-0.10071 -0.159301,-0.10071 -0.22705,-0.26001 -0.06775,-0.16113 -0.06775,-0.35339 v -1.10779 h 0.300293 v 1.0144 q 0,0.23987 0.09888,0.38452 0.100708,0.14466 0.379028,0.14466 0.206909,0 0.342407,-0.097 0.135498,-0.0989 0.135498,-0.32776 v -1.1206 h 0.300293 v 1.1792 q 0.0018,0.26916 0.159302,0.55297 l -0.265503,0.12268 z" /><path style="fill:#fff;" d="m 36.478992,107.0283 q -0.276489,0 -0.476074,-0.1117 -0.199585,-0.11169 -0.303955,-0.32043 -0.10437,-0.21057 -0.10437,-0.49805 0,-0.28564 0.106201,-0.49805 0.106201,-0.2124 0.31128,-0.32775 0.205078,-0.11536 0.492553,-0.11353 0.150147,-0.002 0.2948,0.0275 0.144653,0.0275 0.245361,0.0751 l -0.07324,0.30395 q -0.223388,-0.1007 -0.465088,-0.1007 -0.305786,0 -0.443115,0.15747 -0.137329,0.15564 -0.137329,0.46692 0,0.32592 0.15564,0.48523 0.15747,0.1593 0.457763,0.1593 0.122681,0 0.217896,-0.0238 0.09705,-0.0256 0.254516,-0.0842 l 0.09338,0.27832 q -0.153808,0.0586 -0.316772,0.0915 -0.162964,0.033 -0.309449,0.033 z" /><path style="fill:#fff;" d="m 38.698231,107.05759 q -0.100708,-0.17578 -0.151978,-0.36254 -0.03113,0.0916 -0.120849,0.16845 -0.08972,0.0769 -0.214234,0.12085 -0.124512,0.0439 -0.252685,0.0439 -0.181275,0 -0.325928,-0.0568 -0.142822,-0.0568 -0.227051,-0.17578 -0.0824,-0.11902 -0.0824,-0.29663 0,-0.17212 0.08606,-0.29846 0.08606,-0.12817 0.243531,-0.19592 0.159301,-0.0678 0.369873,-0.0678 0.252685,0 0.481567,0.13 v -0.18676 q 0,-0.21973 -0.102539,-0.32044 -0.102539,-0.10071 -0.303955,-0.10071 -0.0769,0 -0.221558,0.0128 -0.142822,0.011 -0.267334,0.0311 l -0.05127,-0.30029 q 0.223388,-0.0256 0.349731,-0.0366 0.128174,-0.011 0.214234,-0.011 0.333251,0 0.505371,0.17578 0.172119,0.17578 0.17395,0.52368 l 0.0037,0.52735 q 0.0018,0.26916 0.159302,0.55297 l -0.265503,0.12268 z m -0.671997,-0.30944 q 0.142822,0 0.250854,-0.0494 0.108032,-0.0494 0.166626,-0.14099 0.06043,-0.0916 0.06043,-0.21057 v -0.0165 q -0.09155,-0.0513 -0.203247,-0.0787 -0.111694,-0.0293 -0.232544,-0.0293 -0.195923,0 -0.31311,0.0696 -0.117188,0.0678 -0.117188,0.1886 0,0.0787 0.04761,0.13916 0.04944,0.0604 0.137329,0.0952 0.08789,0.033 0.203247,0.033 z" /><path style="fill:#fff;" d="m 40.216175,105.15513 q 0.234375,0 0.393677,0.0915 0.159302,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 h -0.300293 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09521,-0.14283 -0.316772,-0.14466 -0.157471,0.002 -0.296631,0.0586 -0.137329,0.0549 -0.24353,0.15564 l -0.0037,1.33117 H 39.37019 l 0.0037,-1.78344 h 0.221558 l 0.05676,0.17761 q 0.212403,-0.22522 0.563965,-0.22522 z" /><path style="fill:#fff;" d="m 42.977406,107.03196 q -0.289307,-0.002 -0.602417,-0.14282 l 0.09888,-0.26917 q 0.294799,0.13184 0.50354,0.1355 0.380859,-0.005 0.38269,-0.25085 0,-0.0861 -0.04944,-0.141 -0.04761,-0.0549 -0.12085,-0.0879 -0.07141,-0.033 -0.197754,-0.0732 -0.166626,-0.0531 -0.270996,-0.10437 -0.10437,-0.0531 -0.179443,-0.15747 -0.07324,-0.10437 -0.07324,-0.27649 0.0055,-0.51269 0.62439,-0.51269 0.283813,0 0.494385,0.097 l -0.10437,0.27283 q -0.210572,-0.0934 -0.390015,-0.0934 -0.327759,0.004 -0.340576,0.2362 0,0.0696 0.04395,0.11536 0.04395,0.0458 0.108032,0.0751 0.06592,0.0275 0.183106,0.0659 0.17395,0.0549 0.283813,0.11169 0.111695,0.0549 0.192261,0.17029 0.08057,0.11353 0.08057,0.30213 0,0.52734 -0.666503,0.52734 z" /><path style="fill:#fff;" d="m 44.954945,106.75181 q 0.12268,0 0.260009,-0.0275 0.137329,-0.0275 0.274659,-0.0806 l 0.09338,0.25634 q -0.130005,0.0549 -0.329589,0.0916 -0.199585,0.0366 -0.362549,0.0366 -0.432129,0 -0.670166,-0.23072 -0.238037,-0.23254 -0.238037,-0.71411 0,-0.30029 0.10437,-0.50903 0.106201,-0.21057 0.305786,-0.3186 0.199585,-0.10804 0.479736,-0.10804 0.247193,0 0.413819,0.11536 0.166625,0.11353 0.247192,0.29846 0.08057,0.18311 0.08057,0.39368 0,0.14465 -0.04028,0.28931 l -1.274414,0.009 q 0.04028,0.24719 0.205078,0.37354 0.164795,0.12451 0.45044,0.12451 z m -0.122681,-1.31653 q -0.26001,0 -0.391846,0.15015 -0.131836,0.15014 -0.150146,0.40466 l 0.9906,-0.009 q 0.0037,-0.0439 0.0037,-0.0659 0,-0.12452 -0.04578,-0.23255 -0.04578,-0.10986 -0.148315,-0.17761 -0.100708,-0.0696 -0.258179,-0.0696 z" /><path style="fill:#fff;" d="m 47.304188,107.05759 q -0.100708,-0.17578 -0.151978,-0.36254 -0.03113,0.0916 -0.120849,0.16845 -0.08972,0.0769 -0.214234,0.12085 -0.124511,0.0439 -0.252685,0.0439 -0.181275,0 -0.325928,-0.0568 -0.142822,-0.0568 -0.227051,-0.17578 -0.0824,-0.11902 -0.0824,-0.29663 0,-0.17212 0.08606,-0.29846 0.08606,-0.12817 0.243531,-0.19592 0.159301,-0.0678 0.369873,-0.0678 0.252685,0 0.481567,0.13 v -0.18676 q 0,-0.21973 -0.102539,-0.32044 -0.102539,-0.10071 -0.303955,-0.10071 -0.0769,0 -0.221558,0.0128 -0.142822,0.011 -0.267334,0.0311 l -0.05127,-0.30029 q 0.223388,-0.0256 0.349731,-0.0366 0.128174,-0.011 0.214234,-0.011 0.333252,0 0.505371,0.17578 0.172119,0.17578 0.17395,0.52368 l 0.0037,0.52735 q 0.0018,0.26916 0.159302,0.55297 l -0.265503,0.12268 z m -0.671997,-0.30944 q 0.142822,0 0.250854,-0.0494 0.108032,-0.0494 0.166626,-0.14099 0.06043,-0.0916 0.06043,-0.21057 v -0.0165 q -0.09155,-0.0513 -0.203247,-0.0787 -0.111694,-0.0293 -0.232544,-0.0293 -0.195923,0 -0.31311,0.0696 -0.117188,0.0678 -0.117188,0.1886 0,0.0787 0.04761,0.13916 0.04944,0.0604 0.137329,0.0952 0.08789,0.033 0.203247,0.033 z" /><path style="fill:#fff;" d="m 48.247181,105.37486 q 0.188599,-0.2179 0.483398,-0.2179 0.0824,0 0.17212,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283813,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 h 0.227051 l 0.04028,0.17212 z" /><path style="fill:#fff;" d="m 50.036121,107.0283 q -0.276489,0 -0.476074,-0.1117 -0.199585,-0.11169 -0.303955,-0.32043 -0.10437,-0.21057 -0.10437,-0.49805 0,-0.28564 0.106201,-0.49805 0.106201,-0.2124 0.311279,-0.32775 0.205079,-0.11536 0.492554,-0.11353 0.150147,-0.002 0.2948,0.0275 0.144653,0.0275 0.245361,0.0751 l -0.07324,0.30395 q -0.223389,-0.1007 -0.465088,-0.1007 -0.305786,0 -0.443115,0.15747 -0.137329,0.15564 -0.137329,0.46692 0,0.32592 0.15564,0.48523 0.15747,0.1593 0.457763,0.1593 0.122681,0 0.217896,-0.0238 0.09705,-0.0256 0.254516,-0.0842 l 0.09338,0.27832 q -0.153809,0.0586 -0.316772,0.0915 -0.162964,0.033 -0.309449,0.033 z" /><path style="fill:#fff;" d="m 51.861683,105.15513 q 0.234375,0 0.393677,0.0915 0.159301,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 h -0.300293 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09705,-0.14283 -0.316772,-0.14283 -0.157471,0 -0.296631,0.0568 -0.13916,0.0549 -0.247192,0.15381 v 1.333 h -0.300293 v -2.77771 h 0.300293 v 1.15357 q 0.210571,-0.20691 0.545654,-0.20691 z" /><path style="fill:#fff;" d="m 54.827991,104.47581 q -0.100708,0 -0.155639,0.0476 -0.0531,0.0458 -0.07324,0.13733 -0.02014,0.0897 -0.02014,0.23621 v 0.30395 l 0.437622,-0.002 v 0.26551 h -0.437622 v 1.51794 h -0.300293 v -1.51794 h -0.320434 v -0.26184 l 0.320434,-0.002 v -0.28564 q 0,-0.34424 0.115357,-0.54016 0.115356,-0.19775 0.410156,-0.19775 0.06226,0 0.234375,0.0183 l 0.0769,0.009 -0.06592,0.29297 q -0.06775,-0.007 -0.08606,-0.009 -0.08972,-0.0128 -0.135499,-0.0128 z" /><path style="fill:#fff;" d="m 56.150013,107.03196 q -0.27832,0 -0.490723,-0.11536 -0.210571,-0.11535 -0.327758,-0.32592 -0.115357,-0.21241 -0.115357,-0.4889 0,-0.28015 0.115357,-0.49438 0.117187,-0.21423 0.327758,-0.33142 0.212403,-0.11719 0.490723,-0.11719 0.272827,0 0.479736,0.11719 0.206909,0.11719 0.318604,0.33142 0.111694,0.2124 0.109863,0.49438 0,0.27832 -0.113525,0.4889 -0.111695,0.21057 -0.318604,0.32592 -0.205078,0.11536 -0.476074,0.11536 z m 0,-0.28931 q 0.172119,0 0.303955,-0.0787 0.133667,-0.0806 0.206909,-0.22522 0.07507,-0.14649 0.07874,-0.33692 -0.0037,-0.19409 -0.07874,-0.3424 -0.07507,-0.14832 -0.206909,-0.22889 -0.131836,-0.0824 -0.303955,-0.0824 -0.183105,0 -0.324097,0.0824 -0.13916,0.0824 -0.216064,0.23072 -0.07507,0.14831 -0.07507,0.34424 0,0.19043 0.07507,0.33508 0.0769,0.14465 0.216064,0.22339 0.13916,0.0787 0.324097,0.0787 z" /><path style="fill:#fff;" d="m 57.812611,105.37486 q 0.188598,-0.2179 0.483398,-0.2179 0.0824,0 0.172119,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283814,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 h 0.22705 l 0.04028,0.17212 z" /><path style="letter-spacing:0.2px;fill:#ffffff" d="m 60.451576,105.47007 v 0.96313 q 0,0.0806 0.03479,0.15748 0.03662,0.0751 0.109864,0.12451 0.07324,0.0476 0.177612,0.0476 0.07324,0 0.166626,-0.0128 v 0.26916 q -0.119019,0.011 -0.241699,0.011 -0.170288,0 -0.289307,-0.0732 -0.119019,-0.0733 -0.179443,-0.19593 -0.06043,-0.12451 -0.06043,-0.27465 v -1.01624 h -0.322266 v -0.2655 h 0.322266 v -0.64087 h 0.281982 v 0.64087 h 0.490723 v 0.2655 h -0.490723 z" /><path style="letter-spacing:-0.1px;fill:#ffffff" d="m 62.391079,105.15513 q 0.234375,0 0.393677,0.0915 0.159301,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 H 62.80307 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09705,-0.14283 -0.316772,-0.14283 -0.157471,0 -0.296631,0.0568 -0.13916,0.0549 -0.247192,0.15381 v 1.333 h -0.300293 v -2.77771 h 0.300293 v 1.15357 q 0.210571,-0.20691 0.545654,-0.20691 z" /><path style="letter-spacing:-0.1px;fill:#ffffff" d="m 64.4151,106.75181 q 0.122681,0 0.26001,-0.0275 0.137329,-0.0275 0.274658,-0.0806 l 0.09338,0.25634 q -0.130005,0.0549 -0.32959,0.0916 -0.199585,0.0366 -0.362549,0.0366 -0.432129,0 -0.670166,-0.23072 -0.238037,-0.23254 -0.238037,-0.71411 0,-0.30029 0.10437,-0.50903 0.106201,-0.21057 0.305786,-0.3186 0.199585,-0.10804 0.479737,-0.10804 0.247192,0 0.413818,0.11536 0.166626,0.11353 0.247192,0.29846 0.08057,0.18311 0.08057,0.39368 0,0.14465 -0.04028,0.28931 l -1.274414,0.009 q 0.04028,0.24719 0.205078,0.37354 0.164795,0.12451 0.450439,0.12451 z m -0.122681,-1.31653 q -0.260009,0 -0.391845,0.15015 -0.131836,0.15014 -0.150147,0.40466 l 0.990601,-0.009 q 0.0037,-0.0439 0.0037,-0.0659 0,-0.12452 -0.04578,-0.23255 -0.04578,-0.10986 -0.148316,-0.17761 -0.100708,-0.0696 -0.258179,-0.0696 z" /><path style="fill:#fff;" d="m 67.296059,106.75181 q 0.12268,0 0.260009,-0.0275 0.13733,-0.0275 0.274659,-0.0806 l 0.09338,0.25634 q -0.130004,0.0549 -0.329589,0.0916 -0.199585,0.0366 -0.362549,0.0366 -0.432129,0 -0.670166,-0.23072 -0.238037,-0.23254 -0.238037,-0.71411 0,-0.30029 0.10437,-0.50903 0.106201,-0.21057 0.305786,-0.3186 0.199585,-0.10804 0.479736,-0.10804 0.247193,0 0.413819,0.11536 0.166626,0.11353 0.247192,0.29846 0.08057,0.18311 0.08057,0.39368 0,0.14465 -0.04028,0.28931 l -1.274414,0.009 q 0.04028,0.24719 0.205078,0.37354 0.164795,0.12451 0.45044,0.12451 z m -0.122681,-1.31653 q -0.26001,0 -0.391846,0.15015 -0.131836,0.15014 -0.150146,0.40466 l 0.9906,-0.009 q 0.0037,-0.0439 0.0037,-0.0659 0,-0.12452 -0.04578,-0.23255 -0.04578,-0.10986 -0.148315,-0.17761 -0.100708,-0.0696 -0.258179,-0.0696 z" /><path style="letter-spacing:0.1px;fill:#ffffff" d="m 68.676674,105.37486 q 0.188599,-0.2179 0.483398,-0.2179 0.0824,0 0.172119,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283814,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 h 0.227051 l 0.04028,0.17212 z" /><path style="letter-spacing:0.1px;fill:#ffffff" d="m 70.080383,105.37486 q 0.188599,-0.2179 0.483399,-0.2179 0.0824,0 0.172119,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283813,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 H 70.0401 l 0.04028,0.17212 z" /><path style="fill:#fff;" d="m 72.018764,107.03196 q -0.27832,0 -0.490722,-0.11536 -0.210571,-0.11535 -0.327759,-0.32592 -0.115356,-0.21241 -0.115356,-0.4889 0,-0.28015 0.115356,-0.49438 0.117188,-0.21423 0.327759,-0.33142 0.212402,-0.11719 0.490722,-0.11719 0.272828,0 0.479737,0.11719 0.206909,0.11719 0.318603,0.33142 0.111695,0.2124 0.109864,0.49438 0,0.27832 -0.113526,0.4889 -0.111694,0.21057 -0.318603,0.32592 -0.205078,0.11536 -0.476075,0.11536 z m 0,-0.28931 q 0.17212,0 0.303956,-0.0787 0.133667,-0.0806 0.206909,-0.22522 0.07507,-0.14649 0.07873,-0.33692 -0.0037,-0.19409 -0.07873,-0.3424 -0.07507,-0.14832 -0.206909,-0.22889 -0.131836,-0.0824 -0.303956,-0.0824 -0.183105,0 -0.324096,0.0824 -0.13916,0.0824 -0.216065,0.23072 -0.07507,0.14831 -0.07507,0.34424 0,0.19043 0.07507,0.33508 0.0769,0.14465 0.216065,0.22339 0.13916,0.0787 0.324096,0.0787 z" /><path style="fill:#fff;" d="m 73.681362,105.37486 q 0.188599,-0.2179 0.483399,-0.2179 0.0824,0 0.172119,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283813,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 h 0.227051 l 0.04028,0.17212 z" /><path style="letter-spacing:0.11px;fill:#ffffff" d="m 76.655128,107.03196 q -0.27832,0 -0.490722,-0.11536 -0.210571,-0.11535 -0.327759,-0.32592 -0.115356,-0.21241 -0.115356,-0.4889 0,-0.28015 0.115356,-0.49438 0.117188,-0.21423 0.327759,-0.33142 0.212402,-0.11719 0.490722,-0.11719 0.272828,0 0.479737,0.11719 0.206909,0.11719 0.318603,0.33142 0.111695,0.2124 0.109864,0.49438 0,0.27832 -0.113526,0.4889 -0.111694,0.21057 -0.318603,0.32592 -0.205078,0.11536 -0.476075,0.11536 z m 0,-0.28931 q 0.17212,0 0.303956,-0.0787 0.133667,-0.0806 0.206909,-0.22522 0.07507,-0.14649 0.07873,-0.33692 -0.0037,-0.19409 -0.07873,-0.3424 -0.07507,-0.14832 -0.206909,-0.22889 -0.131836,-0.0824 -0.303956,-0.0824 -0.183105,0 -0.324096,0.0824 -0.13916,0.0824 -0.216065,0.23072 -0.07507,0.14831 -0.07507,0.34424 0,0.19043 0.07507,0.33508 0.07691,0.14465 0.216065,0.22339 0.13916,0.0787 0.324096,0.0787 z" /><path style="letter-spacing:0.11px;fill:#ffffff" d="m 79.002678,105.15513 q 0.234375,0 0.393677,0.0915 0.159301,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 h -0.300293 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09521,-0.14283 -0.316772,-0.14466 -0.157471,0.002 -0.296631,0.0586 -0.137329,0.0549 -0.24353,0.15564 l -0.0037,1.33117 h -0.300293 l 0.0037,-1.78344 h 0.221557 l 0.05676,0.17761 q 0.212402,-0.22522 0.563965,-0.22522 z" /><path style="fill:#fff;" d="m 80.392586,104.2103 h 0.300293 v 2.77588 h -0.300293 z" /><path style="fill:#fff;" d="m 81.456429,104.64426 q -0.08789,0 -0.146485,-0.0586 -0.05859,-0.0586 -0.05859,-0.14648 0,-0.0861 0.05859,-0.14466 0.05859,-0.0586 0.146485,-0.0586 0.08606,0 0.144653,0.0586 0.05859,0.0586 0.05859,0.14466 0,0.0879 -0.05859,0.14648 -0.05859,0.0586 -0.144653,0.0586 z m -0.15564,0.55848 h 0.300293 v 1.78344 h -0.300293 z" /><path style="fill:#fff;" d="m 83.060432,105.15513 q 0.234375,0 0.393677,0.0915 0.159302,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 h -0.300293 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09521,-0.14283 -0.316773,-0.14466 -0.15747,0.002 -0.29663,0.0586 -0.13733,0.0549 -0.243531,0.15564 l -0.0037,1.33117 h -0.300293 l 0.0037,-1.78344 h 0.221558 l 0.05676,0.17761 q 0.212402,-0.22522 0.563964,-0.22522 z" /><path style="fill:#fff;" d="m 85.184456,106.75181 q 0.122681,0 0.26001,-0.0275 0.137329,-0.0275 0.274658,-0.0806 l 0.09338,0.25634 q -0.130005,0.0549 -0.32959,0.0916 -0.199585,0.0366 -0.362549,0.0366 -0.432129,0 -0.670166,-0.23072 -0.238037,-0.23254 -0.238037,-0.71411 0,-0.30029 0.10437,-0.50903 0.106201,-0.21057 0.305786,-0.3186 0.199585,-0.10804 0.479736,-0.10804 0.247193,0 0.413819,0.11536 0.166626,0.11353 0.247192,0.29846 0.08057,0.18311 0.08057,0.39368 0,0.14465 -0.04028,0.28931 l -1.274414,0.009 q 0.04028,0.24719 0.205078,0.37354 0.164795,0.12451 0.45044,0.12451 z m -0.122681,-1.31653 q -0.26001,0 -0.391845,0.15015 -0.131836,0.15014 -0.150147,0.40466 l 0.990601,-0.009 q 0.0037,-0.0439 0.0037,-0.0659 0,-0.12452 -0.04578,-0.23255 -0.04578,-0.10986 -0.148315,-0.17761 -0.100708,-0.0696 -0.258179,-0.0696 z" /><path style="fill:#fff;" d="m 86.400276,105.62937 q -0.102539,0 -0.172119,-0.0659 -0.06958,-0.0678 -0.06958,-0.16662 0,-0.10071 0.06958,-0.16663 0.06958,-0.0677 0.172119,-0.0677 0.10437,0 0.17395,0.0677 0.06958,0.0659 0.06958,0.16663 0,0.0989 -0.06958,0.16662 -0.06958,0.0659 -0.17395,0.0659 z m 0,1.3971 q -0.102539,0 -0.172119,-0.0659 -0.06958,-0.0678 -0.06958,-0.16663 0,-0.10071 0.06958,-0.16662 0.06958,-0.0678 0.172119,-0.0678 0.10437,0 0.17395,0.0678 0.06958,0.0659 0.06958,0.16662 0,0.0989 -0.06958,0.16663 -0.06958,0.0659 -0.17395,0.0659 z" /><text x="88" y="107" style="fill:#e1e9ef;font: 3px sans-serif, Arial;">EASTER_EGG_CLICKED_LOGO_TOO_MUCH</text></g></g></svg></div>');
                    setTimeout(function () {
                        id('blue-screen-of-death').addEventListener('click', function () {
                            tn('body', 0).style.setProperty('overflow-y', 'scroll', 'important');
                            this.remove();
                        });
                    }, 1000);
                }
            });
        }

        // Months are 0-indexed
        const monthInt = month + 1;

        // Show logo hat on holidays
        if (get('bools').charAt(BOOL_INDEX.EVENTS) == '1' && n(id('mod-logo-hat')) && !tn('body', 0).classList.contains('mod-logo-hat-hidden')) {
            let insertElement = id('mod-logo');
            let isDefaultLikeLayout = false;

            const birthday = parseInt(get('birthday').charAt(0) + get('birthday').charAt(1)) == dayInt && parseInt(get('birthday').charAt(3) + get('birthday').charAt(4)) == monthInt;
            const christmas = monthInt == 12 && dayInt > 10 && dayInt < 31;
            const sinterklaas = monthInt == 12 && dayInt <= 5;

            if ((get('layout') == 1 || get('layout') == 4) && tn('sl-header', 0) && (birthday || christmas || sinterklaas)) {
                tn('sl-header', 0).style.overflow = 'hidden';
                tn('sl-header', 0).insertAdjacentHTML('beforeend', window.logo('mod-logo-inserted', null, 'var(--action-neutral-normal)', 'position:absolute;width:50px;height:54px;right:25px;bottom:-15px;z-index:-1;transition:bottom 0.4s ease 0.3s;'));
                insertElement = id('mod-logo-inserted');
                isDefaultLikeLayout = true;
            }
            if (insertElement) {
                // Show birthday hat if it is birthday of user
                if (birthday) {
                    insertElement.insertAdjacentHTML('beforebegin', '<svg id="mod-logo-hat" style="width:37px;translate:38px -12px;' + (isDefaultLikeLayout ? 'right:80px;left:unset;' : '') + '" viewBox="0 0 448 511.7"><path fill="#FFDB56" d="M415.7 428.6c-101.8 39.1-258 38.3-382.5.7L226 11.3l189.7 417.3z"/><path fill="#F6C134" d="M415.7 428.6a411 411 0 0 1-77 20.6l-155.5-345L226 11.4l189.7 417.2z"/><circle fill="#D83636" cx="224" cy="41.6" r="41.6"/><path fill="#F2433B" d="M224 0h.2a37 37 0 0 1-35.5 63.6 41.4 41.4 0 0 1-6.3-22C182.4 18.6 201 0 224 0zM106 271.4l38.5-83.3c46.8-17.9 89.7-37.5 134.8-59.6l2.5 5.5 22.5 51.6C244.7 223.9 177.7 251 106 271.4zm236.9-3 5.3 11.7a756.5 756.5 0 0 1-304 126l37-80.6A770.9 770.9 0 0 0 322 223.6l20.9 44.9zm22.7 50 2.2 5 23 50.9a776.6 776.6 0 0 1-72.1 48.6 485.5 485.5 0 0 1-68.8 35.3c-61.4 1.7-117.6-4-166.1-16.2 93-19.6 187.8-59.6 281.8-123.6z"/><path fill="#F2433B" d="M19.3 480.5a27.8 27.8 0 0 1 17-53A635.4 635.4 0 0 0 227.9 456c64 0 127.7-9.2 183.2-28.5a27.8 27.8 0 1 1 18.3 52.6C368 501.4 298 511.6 227.8 511.7a691.8 691.8 0 0 1-208.5-31.2z"/></svg>');
                }
                // Show santa hat if it is 11 dec - 30 dec
                else if (christmas) {
                    insertElement.insertAdjacentHTML('beforebegin', '<svg id="mod-logo-hat" viewBox="0 0 408.7 251.7"' + (isDefaultLikeLayout ? ' style="left:unset;right:35px;height:80px;width:70px;"' : '') + '><g><path d="m382.6 131.7-91.8 63-148.7-1.2-15-21 8.6-16.2c-7.2-4.8-16-9-25.7-12-12.7-4-25.1-5.4-35.5-4.6l-1.2-.5-6.6-20.4a138.5 138.5 0 0 0 74.2-68l2-3.8A99.1 99.1 0 0 1 243 1.1l3.4.4c71.8 14 125.8 59.4 132.8 114z" fill="#ed4241"/><path d="M274.2 8.8c57.6 19 98.9 59.4 104.9 106.8l3.5 16-91.8 63-148.7-1.1-14.4-20.1.4-2 124.7-23c36.4-6 64-36.4 64-73.2a74 74 0 0 0-41.3-65.8z" fill="#c52c37"/><path d="M408.7 164.7c-4 30.8-65.1 65.5-144.2 80.2-71.6 13.4-135.3 6.3-157.8-15.4l20.5-57.6c18.8 18.1 72 24 132 12.9 66-12.4 117.1-41.3 120.5-67z" fill="#c1cfe8"/><path d="M406 161.2c-17.6 38.3-85 69.2-166.9 73.2-20.4 1-40 .2-58.4-2l-3.8-.5a43.5 43.5 0 0 1-43.2-42.6c0-4 .6-7.8 1.7-11.5l.2.2c23.6 13.2 71 16.6 123.5 6.8 66.2-12.4 117.2-41.3 120.6-67l26.5 42.8z" fill="#d7e0ef"/><path d="M75.3 141.3a37.8 37.8 0 1 1-75.5.2 37.8 37.8 0 0 1 75.5-.2z" fill="#c1cfe8"/><path d="M67.6 119A37.5 37.5 0 0 0 0 141.6l.3 1.6a36.5 36.5 0 0 0 33.2 19.5c20 0 36.2-14.5 36.2-32.5 0-3.5-.7-6.9-1.8-10z" fill="#d7e0ef"/></g></svg>');
                }
                // Show sinterklaas mijter if it is 1 dec - 5 dec
                else if (sinterklaas) {
                    insertElement.insertAdjacentHTML('beforebegin', '<svg id="mod-logo-hat" viewBox="0 0 155.5 253.7" width="155.5" height="253.7" style="translate:30px -25px;width:40px;' + (isDefaultLikeLayout ? 'left:unset;right:73px;' : '') + '"><defs><linearGradient x1="162.4" y1="180" x2="317.9" y2="180" gradientUnits="userSpaceOnUse" id="a"><stop offset="0" stop-color="#ae1d1a"/><stop offset="1" stop-color="#da2d29"/></linearGradient><linearGradient x1="162.6" y1="212.5" x2="317.7" y2="212.5" gradientUnits="userSpaceOnUse" id="b"><stop offset="0" stop-color="#f39221"/><stop offset="1" stop-color="#ffc800"/></linearGradient><linearGradient x1="169.4" y1="289.4" x2="310.8" y2="289.4" gradientUnits="userSpaceOnUse" id="c"><stop offset="0" stop-color="#f39221"/><stop offset="1" stop-color="#ffc800"/></linearGradient><linearGradient x1="226.3" y1="180" x2="253.7" y2="180" gradientUnits="userSpaceOnUse" id="d"><stop offset="0" stop-color="#f8a813"/><stop offset="1" stop-color="#fab20d"/></linearGradient><linearGradient x1="162.4" y1="132.3" x2="317.9" y2="132.3" gradientUnits="userSpaceOnUse" id="e"><stop offset="0" stop-color="#f39221"/><stop offset="1" stop-color="#ffc800"/></linearGradient></defs><g><path d="M162.4 186.9c2.5-12.5 6.2-23.9 10.6-32.8l.9-1.8c22.5-45.5 47.3-82 66-99.2h.2c18.7 17.2 43.5 53.7 66 99.2l.9 1.8c4.4 9 8.1 20.3 10.6 32.8l.3-.2a551.6 551.6 0 0 1-12.5 118l.2.5a1293.6 1293.6 0 0 1-131.2 0l.5-.6c-4.3-18-8-41.9-10.3-68.1-1.6-18-2.3-34.9-2.2-49.8z" fill="url(#a)" transform="translate(-162.4 -53.1)"/><path d="M315.8 232.3c-16.6-5.8-44.4-9.6-75.8-9.6s-59.1 3.8-75.8 9.5c-.8-10.2-1.4-20-1.6-29.4h.2c16.5-6.1 44.9-10.1 77.2-10.1 32.5 0 61 4 77.5 10.2l.2-.2c-.3 9.2-.8 19-1.6 29.1z" fill="url(#b)" transform="translate(-162.4 -53.1)"/><path d="M169.4 276.6c16.9-2.8 42-4.6 70.2-4.6 28.6 0 54.2 1.8 71.2 4.8a379.9 379.9 0 0 1-5.4 27.8l.2.6a1293.6 1293.6 0 0 1-131.2 0l.5-.6c-2-8.2-3.8-17.6-5.4-28z" fill="url(#c)" transform="translate(-162.4 -53.1)"/><path d="M226.3 278.3V81.7h27.4v196.6z" fill="url(#d)" transform="translate(-162.4 -53.1)"/><path d="M317.2 204.3a118 118 0 0 0-10.2-28.8l-.9-1.6c-22.5-42.2-47.3-76.1-66-92h-.2c-18.7 15.9-43.5 49.8-66 92l-.9 1.6c-3.9 7.4-7.3 16.5-9.7 26.6l-.8.7c-.1-4.4-.2-8.6-.1-12.6v.1a129 129 0 0 1 10.6-31.9l.9-1.6c22.5-44.3 47.3-79.7 66-96.5h.2c18.7 16.8 43.5 52.2 66 96.5l.9 1.6a129 129 0 0 1 10.6 32l.3-.2-.1 12.7z" fill="url(#e)" transform="translate(-162.4 -53.1)"/></g></svg>');
                }
                // Add hat events
                if (birthday || christmas || sinterklaas) {
                    id('mod-logo-hat').addEventListener('click', function () {
                        if (isDefaultLikeLayout) {
                            id('mod-logo-inserted').style.bottom = '-55px';
                            this.style.opacity = '0';
                            this.style.animation = 'none';
                        }
                        this.classList.add('mod-logo-hat-clicked');
                        setTimeout(function () {
                            tn('body', 0).classList.add('mod-logo-hat-hidden');
                            if (id('mod-logo-hat')) {
                                id('mod-logo-hat').remove();
                            }
                        }, 1050);
                    });
                }
            }
        }
        if (get('bools').charAt(BOOL_INDEX.EVENTS) == '1' && n(id('mod-logo-decoration')) && !tn('body', 0).classList.contains('mod-logo-decoration-hidden')) {
            let insertElement = id('mod-logo');
            let position = 'beforebegin';
            if (get('layout') == 1 || get('layout') == 4) {
                insertElement = tn('sl-header', 0);
                position = 'beforeend';
            }

            // Easter date is terrible to calculate, but this code seems to work
            const C = Math.floor(year / 100);
            const N = year - 19 * Math.floor(year / 19);
            const K = Math.floor((C - 17) / 25);
            let I = C - Math.floor(C / 4) - Math.floor((C - K) / 3) + 19 * N + 15;
            I = I - 30 * Math.floor((I / 30));
            I = I - Math.floor(I / 28) * (1 - Math.floor(I / 28) * Math.floor(29 / (I + 1)) * Math.floor((21 - N) / 11));
            let J = year + Math.floor(year / 4) + I + 2 - C + Math.floor(C / 4);
            J = J - 7 * Math.floor(J / 7);
            const L = I - J;
            const M = 3 + Math.floor((L + 40) / 44);
            const D = L + 28 - 31 * Math.floor(M / 4);

            const easter = monthInt == M && (dayInt == D || dayInt == D + 1);
            const halloween = monthInt == 10 && dayInt > 25;
            const bevrijdingsdag = monthInt == 5 && dayInt == 5;
            const newyear = (monthInt == 12 && dayInt == 31) || (monthInt == 1 && dayInt == 1);

            if (insertElement) {
                // Show easter eggs on easter
                if (easter) {
                    insertElement.insertAdjacentHTML(position, '<svg id="mod-logo-decoration"' + ((get('layout') == 1 || get('layout') == 4) ? ' style="right:' + (n(id('mod-logo-hat')) ? '50' : '90') + 'px;top:30px;z-index:-10;"' : '') + ' viewBox="0 0 313.1 232"><g><path d="M227.1 110.9a62.9 62.9 0 0 1-57.2 64.8 62.8 62.8 0 0 1-69.7-52.7l-.5-5C94 56.3 116.8 3.8 151.4.2c35-3.7 68.8 44.2 75.4 107l.1 1.2z" fill="#ff896c"/><path d="m205.7 38.5-1.4-1a34.8 34.8 0 0 0-46 3.4l-1.9 2a34.8 34.8 0 0 1-46 2.7l-2.5-1.8-4.2 14.3c1.7.9 3.2 1.9 4.7 3l2.6 1.7a34.8 34.8 0 0 0 46-2.7l1.9-2a34.8 34.8 0 0 1 45.9-3.3l2.6 1.7c2.7 2.1 5.7 3.8 9 5zM98.6 96.3a34 34 0 0 1 15.3 6.5l2.6 1.7a34.8 34.8 0 0 0 46-2.6l1.9-2a34.8 34.8 0 0 1 41.8-6l8-11.5-1.8-1.4-2.6-1.7a34.8 34.8 0 0 0-46 3.4l-1.9 2a34.8 34.8 0 0 1-46 2.7l-2.5-1.8a34 34 0 0 0-13.5-6.2zM196.1 118.1a35.3 35.3 0 0 0-31.5 9.8l-1.9 2a34.5 34.5 0 0 1-34.8 8.4l6.7 18.6 3.5.2c9.8.2 18.8-3.7 25.1-10l2-2a34.8 34.8 0 0 1 24.4-10.3z" fill="#ff5757"/><path d="M133.4 149.4a62.9 62.9 0 0 1-37.5 77.9 62.8 62.8 0 0 1-81.4-31.9l-1.9-4.6C-9.6 132.9-1.8 76.2 30.5 63.3c32.7-13 78.2 24 101.6 82.6l.4 1.1z" fill="#5de7ff"/><path d="M309.6 180.3a62.9 62.9 0 0 1-72.5 47 62.8 62.8 0 0 1-53-69.5l.9-5c11-60.9 47.2-105.3 81.4-99.5 34.8 5.9 54.4 61.1 43.9 123.4l-.2 1.2z" fill="#ffe16b"/><path d="m109 104.2-16.3 20.4-31.9 1L42.1 150l-31 1-6.7 12.4L1.8 147 8 135.6l29-1L54.5 112l29.8-1 15.2-19zM129.1 139.7l-15 18.8-36.5 1.2-21.4 27.9-35.5 1.2-4.9 8.8-5.5-13.9 6.9-12.6 33.1-1.1 20-26 34.1-1.2 16.6-20.7z" fill="#5ca7ff"/><path d="M261.6 141.3c.8 5.6-3 10.8-8.4 11.6-5.5.8-10.6-3-11.4-8.7-.9-5.6 2.9-10.8 8.4-11.6 5.4-.8 10.5 3 11.4 8.7zM304.8 150c.9 5.6-2.9 10.8-8.4 11.6-5.4.8-10.5-3-11.4-8.7-.8-5.6 3-10.8 8.4-11.6 5.5-.8 10.6 3 11.4 8.7zM218.7 132c.9 5.6-2.9 10.8-8.4 11.6-5.4.8-10.5-3-11.4-8.7-.8-5.5 3-10.7 8.4-11.6 5.5-.8 10.6 3.1 11.4 8.7zM246 95c.6 5.6-3.3 10.7-8.8 11.3-5.5.7-10.5-3.4-11.2-9a10.1 10.1 0 0 1 8.8-11.3c5.5-.7 10.5 3.4 11.1 9zM288.2 103.6c.7 5.7-3.3 10.7-8.7 11.4-5.5.6-10.5-3.4-11.2-9a10.1 10.1 0 0 1 8.8-11.4c5.5-.6 10.4 3.4 11.1 9zM233 184c.6 5.6-3.3 10.7-8.8 11.3-5.5.7-10.5-3.4-11.2-9a10.1 10.1 0 0 1 8.8-11.3c5.5-.7 10.5 3.4 11.1 9zM275.2 192.6c.7 5.7-3.3 10.7-8.7 11.4-5.5.6-10.5-3.4-11.2-9a10.1 10.1 0 0 1 8.8-11.4c5.5-.6 10.4 3.4 11.1 9z" fill="#ffba3a"/></g></svg>');
                }
                // Show pumpkin on halloween
                else if (halloween) {
                    insertElement.insertAdjacentHTML(position, '<svg id="mod-logo-decoration"' + ((get('layout') == 1 || get('layout') == 4) ? ' style="right:' + (n(id('mod-logo-hat')) ? '50' : '90') + 'px;top:30px;z-index:-10;"' : '') + ' viewBox="0 0 186.2 160.9"><g><path d="M121 149c0 7-15 12-34 12s-35-5-35-12 16-12 35-12 34 5 34 12zM154 41c0 7-28 13-61 13-34 0-61-6-61-13s27-13 61-13c33 0 61 6 61 13z" fill="#ca6512"/><path d="M125 154c6-9 8-30 6-54-2-21-7-38-13-48l-1-1a9 9 0 0 1 2-8h1c4-3 9-5 14-5 20 0 36 27 36 60s-16 60-36 60l-9-2z" fill="#ca6512"/><path d="m99 154-30 1-13-1a72 72 0 0 1-22-55c0-35 20-64 45-64 24 0 44 26 45 60l2 27v2c0 12-5 23-12 31z" fill="#ca6512"/><path d="M49 40c-13 8-23 30-23 56 0 24 9 46 22 55l-3 2-8-2-9-4c-13-6-23-29-23-56l1-17 1-2c3-18 16-32 32-36h8l4 2z" fill="#ca6512"/><path d="m106 30 4 2v3l-6 10h-3c-3-4-12-7-21-7l-6 1-1-2 9-7c3-2 4-5 4-9s-2-7-5-9h-1c-2 0-3-1-3-3V8l6-6a6 6 0 0 1 9 1z" fill="#34785d"/><path d="M116 121v2c0 21-13 38-30 38l-7-1-6-3c-17-4-30-28-30-57 0-32 16-57 36-57 19 0 35 24 36 54z" fill="#eb7615"/><path d="M114 154c6-9 8-30 6-54-2-21-7-38-13-48l-1-1a9 9 0 0 1 2-7v-1c5-3 10-5 15-5 20 0 36 27 36 60s-16 60-36 60l-9-2z" fill="#eb7615"/><path d="m140 40 4-2h8c16 4 29 18 32 36l1 2 1 17c0 27-10 50-22 56l-9 4-9 2-3-2c13-9 22-30 22-55 0-26-10-48-23-56z" fill="#eb7615"/><path d="M60 42c-14 8-23 30-23 56 0 25 9 46 21 55l-2 2-9-2-9-4c-13-6-23-29-23-56l2-17v-2c4-18 16-32 33-36h7l4 2z" fill="#eb7615"/><path d="m28 148-8-3-10-11-6-10a119 119 0 0 1-3-48v-2c3-17 14-31 27-35h7C19 46 8 68 8 94c0 22 8 41 19 50zM70 35l-9-2-16 1c2-3 8-5 15-5 5 0 9 1 12 3zM141 36h-6l-4-3h-6l-9 1c3-2 8-3 14-3 5 0 10 1 13 3z" fill="#eb7615"/><path d="m70 69-24 1 14-22z"/><path d="m118 48 14 22-24-1z"/><path d="M95 95H82l7-12z"/><path d="M66 67H55l7-10zM66 122l1-12 11 1-2 12zM102 123l-1-12 10-1 2 12z" fill="#fff"/><path d="M112 110c17-4 31-11 36-19l2 2v2c0 22-26 40-58 40-29 0-53-15-57-34v-1c7 4 19 8 33 10l1 11 8-10 13 1 8-1h3l6 10z"/><path d="m121 57 7 10h-11z" fill="#fff"/></g></svg>');
                }
                // Show flag on bevrijdingsdag
                else if (bevrijdingsdag) {
                    insertElement.insertAdjacentHTML(position, '<svg id="mod-logo-decoration"' + ((get('layout') == 1 || get('layout') == 4) ? ' style="right:' + (n(id('mod-logo-hat')) ? '50' : '90') + 'px;top:30px;z-index:-10;"' : '') + ' viewBox="0 0 200.9 251.5" style="width:35px;rotate:15deg;"><defs><linearGradient x1="149.5" y1="63.4" x2="335.6" y2="63.4" gradientUnits="userSpaceOnUse" id="a"><stop offset="0" stop-color="red"/><stop offset="1" stop-color="#ff6300"/></linearGradient><linearGradient x1="149.5" y1="138.4" x2="335.6" y2="138.4" gradientUnits="userSpaceOnUse" id="b"><stop offset="0" stop-color="#0a00ff"/><stop offset="1" stop-color="#00a2ff"/></linearGradient><linearGradient x1="149.5" y1="100.9" x2="335.6" y2="100.9" gradientUnits="userSpaceOnUse" id="c"><stop offset="0" stop-color="#f0f0f0"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><g><path d="M335.6 85.3A71.2 71.2 0 0 1 292 98.9a68 68 0 0 1-47.6-17.2l-3.4-2.7a71.2 71.2 0 0 0-43.7-13.6 68 68 0 0 0-47.7 17.2V45a68 68 0 0 1 47.7-17.2c17.5 0 33.2 5.3 43.7 13.6l3.4 2.7a68 68 0 0 0 47.6 17.2c17.5 0 33.2-5.3 43.7-13.6z" fill="url(#a)" transform="translate(-134.8 -15.4)"/><path d="M335.6 160.3a71.2 71.2 0 0 1-43.7 13.6 68 68 0 0 1-47.6-17.2l-3.4-2.7a71.2 71.2 0 0 0-43.7-13.6 68 68 0 0 0-47.7 17.2V120a68 68 0 0 1 47.7-17.2c17.5 0 33.2 5.3 43.7 13.6l3.4 2.7a68 68 0 0 0 47.6 17.2c17.5 0 33.2-5.3 43.7-13.6z" fill="url(#b)" transform="translate(-134.8 -15.4)"/><path d="M335.6 122.8a71.2 71.2 0 0 1-43.7 13.6 68 68 0 0 1-47.6-17.2l-3.4-2.7a71.2 71.2 0 0 0-43.7-13.6 68 68 0 0 0-47.7 17.2V82.6a68 68 0 0 1 47.7-17.2c17.5 0 33.2 5.3 43.7 13.6l3.4 2.7A68 68 0 0 0 291.9 99c17.5 0 33.2-5.3 43.7-13.6z" fill="url(#c)" transform="translate(-134.8 -15.4)"/><path d="M4.5 245.5v-230h11v230z" fill="#ffad66"/><path d="M21.5 10.8a10.8 10.8 0 1 1-21.5 0 10.8 10.8 0 0 1 21.5 0zM15.5 246a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" fill="#ffad66"/></g></svg>');
                }
                // Show fireworks on new years eve
                else if (newyear) {
                    insertElement.insertAdjacentHTML(position, '<svg id="mod-logo-decoration"' + ((get('layout') == 1 || get('layout') == 4) ? ' style="right:' + (n(id('mod-logo-hat')) ? '50' : '90') + 'px;top:21px;z-index:-10;"' : '') + ' viewBox="0 0 158 151"><defs><linearGradient x1="161.4" y1="148.1" x2="225.1" y2="148.1" gradientUnits="userSpaceOnUse" id="a"><stop offset="0" stop-color="#fad914"/><stop offset="1" stop-color="#fba314"/></linearGradient><linearGradient x1="241.6" y1="129.4" x2="292.1" y2="129.4" gradientUnits="userSpaceOnUse" id="b"><stop offset="0" stop-color="#fad914"/><stop offset="1" stop-color="#fba314"/></linearGradient><linearGradient x1="270.3" y1="182.9" x2="319.6" y2="182.9" gradientUnits="userSpaceOnUse" id="c"><stop offset="0" stop-color="#fad914"/><stop offset="1" stop-color="#fba314"/></linearGradient></defs><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" stroke-miterlimit="10" style="mix-blend-mode:normal"><path d="m196 129 21-10-6 22 14 18-22 1-12 18-8-19-22-6 18-15-1-20z" fill="url(#a)" transform="translate(-161 -105)"/><path d="m266 114 15-9-2 17 13 13-17 3-7 16-9-15-17-2 11-13-3-16z" fill="url(#b)" transform="translate(-161 -105)"/><path d="m302 171 18-3-10 15 7 17-16-4-14 11-1-16-16-9 17-8 3-16z" fill="url(#c)" transform="translate(-161 -105)"/><path d="M52 70c9 9 17 23 20 39 3 15 2 29-2 39M82 109c-2-6-3-13-3-21 0-18 6-34 15-43M81 147c2-26 17-48 37-55" fill="none" stroke="#e19600" stroke-width="6"/></g></svg>');
                }
                // Add decoration events
                if (tn('sl-header', 0) && (easter || halloween || bevrijdingsdag || newyear)) {
                    tn('sl-header', 0).style.overflow = 'hidden';
                    id('mod-logo-decoration').addEventListener('click', function () {
                        this.classList.add('mod-logo-decoration-clicked');
                        setTimeout(function () {
                            tn('body', 0).classList.add('mod-logo-decoration-hidden');
                            if (id('mod-logo-decoration')) {
                                id('mod-logo-decoration').remove();
                            }
                        }, 900);
                    });
                }
            }
        }
    }

    // Live Wallpaper
    function stopLiveWallpaper() {
        tryRemove(id('mod-background-live'));
    }

    function randomColor(offset = 0) {
        const seed = Math.random() * 100;
        return [
            Math.round((0.5 + 0.5 * Math.cos(seed + offset + 0)) * 255),
            Math.round((0.5 + 0.5 * Math.cos(seed + offset + 2)) * 255),
            Math.round((0.5 + 0.5 * Math.cos(seed + offset + 4)) * 255),
        ];
    }

    function startLiveWallpaper(preview = false, col1, col2, col3) {
        let gl;
        if (!preview) {
            stopLiveWallpaper();
            tn('body', 0).insertAdjacentHTML('beforeend', '<canvas id="mod-background-live"></canvas>');
        }
        const canvas = id(preview ? 'mod-live-preview' : 'mod-background-live');
        gl = canvas.getContext('webgl');
        if (!gl) return;

        // Simple vertex shader
        const vsSource = `
            attribute vec4 aVertexPosition;
            void main() {
                gl_Position = aVertexPosition;
            }
        `;

        if (!preview) {
            if (n(get('livecolor1')) || n(get('livecolor2')) || n(get('livecolor3'))) {
                set('livecolor1', rgbToHex(randomColor(0)));
                set('livecolor2', rgbToHex(randomColor(2)));
                set('livecolor3', rgbToHex(randomColor(4)));
            }
            col1 = hexToRgb(get('livecolor1'));
            col2 = hexToRgb(get('livecolor2'));
            col3 = hexToRgb(get('livecolor3'));
        }

        // Fragment shader with random color noise, colors are represented as RGB 0-1 vec3
        // We create a plasma/noise effect (see math stuff), and mix the colors with eachother at the end
        const fsSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float t = u_time * 0.5;

                vec3 col1 = vec3(${col1[0] / 255},${col1[1] / 255},${col1[2] / 255});
                vec3 col2 = vec3(${col2[0] / 255},${col2[1] / 255},${col2[2] / 255});
                vec3 col3 = vec3(${col3[0] / 255},${col3[1] / 255},${col3[2] / 255});

                float v = 0.0;
                vec2 c = uv * 2.0 - 1.0;
                v += sin((c.x+t));
                v += sin((c.y+t)/2.0);
                v += sin((c.x+c.y+t)/2.0);
                c += 1.0/2.0 * vec2(sin(t/3.0), cos(t/2.0));
                v += sin(sqrt(c.x*c.x+c.y*c.y+1.0)+t);
                v = v/2.0;

                vec3 color = mix(col1, col2, smoothstep(0.0, 1.0, sin(v * 3.0 + t)));
                color = mix(color, col3, smoothstep(0.0, 1.0, cos(v * 2.0 - t)));

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
            },
            uniformLocations: {
                time: gl.getUniformLocation(shaderProgram, 'u_time'),
                resolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
            }
        };

        const buffers = initBuffers(gl);

        function render(now) {
            if (!gl) return;
            now *= 0.001; // convert to seconds

            // Resize if needed
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                gl.viewport(0, 0, canvas.width, canvas.height);
            }

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(programInfo.program);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

            gl.uniform1f(programInfo.uniformLocations.time, now);
            gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            liveWallpaperFrame = requestAnimationFrame(render);
        }
        liveWallpaperFrame = requestAnimationFrame(render);
    }

    function initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        return shaderProgram;
    }

    function loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function initBuffers(gl) {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        return { position: positionBuffer };
    }

    // Insert the background
    function setBackground() {
        tryRemove(id('mod-background'));
        tryRemove(id('mod-backgroundcolor'));
        tryRemove(id('mod-backgroundslide'));
        tryRemove(id('mod-background-style'));
        stopLiveWallpaper();
        if ((n(get('backgroundtype')) || get('backgroundtype') == 'image') && !n(get('background'))) {
            // Unfortunately, localStorage can only save strings, so check for 'false' too
            if (get('isbackgroundvideo') && get('isbackgroundvideo') != 'false') {
                id('somtoday-mod', 0).insertAdjacentHTML('beforeend', '<video id="mod-background" src="' + get('background') + '" style="' + getBackgroundFilters() + '" autoplay muted loop></video>');
            }
            else {
                id('somtoday-mod', 0).insertAdjacentHTML('beforeend', '<img id="mod-background" src="' + get('background') + '" style="' + getBackgroundFilters() + '">');
            }
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-background-style">#mod-background{' + (get('layout') == 5 ? '--safe-area-inset-top: 0px !important;' : '') + 'pointer-events:none;user-select:none;position:fixed;left:calc(var(--safe-area-inset-left) - ' + get('blur') + ');top:calc(var(--safe-area-inset-top) - ' + get('blur') + ');width:calc(100% - var(--safe-area-inset-left) - var(--safe-area-inset-right) - 2 * ' + get('blur') + ');height:calc(100% - var(--safe-area-inset-top) - var(--safe-area-inset-bottom) - 2 * ' + get('blur') + ');object-fit:cover;z-index:-1;}</style>');
        }
        else if (get('backgroundtype') == 'color' && !n(get('backgroundcolor'))) {
            id('somtoday-mod', 0).insertAdjacentHTML('beforeend', '<div id="mod-backgroundcolor"></div>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-background-style">#mod-backgroundcolor{pointer-events:none;user-select:none;position:fixed;left:0;width:100%;top:0;height:100%;object-fit:cover;z-index:-1;background:' + get('backgroundcolor') + ';}</style>');
        }
        else if (get('backgroundtype') == 'slideshow' && !n(get('background0'))) {
            const randomChoice = Math.floor(Math.random() * get('slides'));
            id('somtoday-mod', 0).insertAdjacentHTML('beforeend', '<img id="mod-backgroundslide" src="' + get('background' + randomChoice) + '">');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-background-style">#mod-backgroundslide{pointer-events:none;user-select:none;position:fixed;left:0;width:100%;top:0;height:100%;object-fit:cover;z-index:-1;}</style>');
        }
        else if (get('backgroundtype') == 'live') {
            startLiveWallpaper();
        }
    }

    function getBackgroundFilters(fromSavedSettings = true) {
        let filter = '';
        let properties = ['brightness', 'contrast', 'saturate', 'opacity', 'huerotate', 'grayscale', 'sepia', 'invert', 'blur'];
        for (const filterProperty of properties) {
            const value = fromSavedSettings ? get(filterProperty) : id(filterProperty).value + id(filterProperty).dataset.unit;
            if (value != null) {
                // Add to filter
                // Extensions can't save data with "hue-rotate" as key because it contains a hyphen
                filter += ' ' + (filterProperty == 'huerotate' ? 'hue-rotate' : filterProperty) + '(' + value + ')';
            }
        }
        if (fromSavedSettings) {
            if (!n(filter)) {
                filter = 'filter:' + filter + ';';
            }
        }
        return filter;
    }

    // Change title and icon of Somtoday when enabled
    function browserSettings() {
        if (!n(get('title'))) {
            if (n(tn('title', 0).dataset.modOriginalTitle)) {
                tn('title', 0).dataset.modOriginalTitle = tn('title', 0).innerHTML;
            }
            tn('title', 0).innerHTML = get('title');
        }
        else if (!n(tn('title', 0).dataset.modOriginalTitle)) {
            tn('title', 0).innerHTML = tn('title', 0).dataset.modOriginalTitle;
        }
        for (const element of tn('link')) {
            if (element.getAttribute('rel') == 'icon') {
                if (!n(get('icon'))) {
                    if (n(element.dataset.modOriginalHref)) {
                        element.dataset.modOriginalHref = element.href;
                    }
                    element.href = get('icon');
                }
                else if (!n(element.dataset.modOriginalHref)) {
                    element.href = element.dataset.modOriginalHref;
                }
            }
        }
    }

    // Confetti effect thanks to CSS Script: https://www.cssscript.com/demo/confetti-falling-animation/
    let maxParticleCount = 150;
    let particleSpeed = 2;
    let startConfetti;
    let stopConfetti;
    let toggleConfetti;
    let removeConfetti;
    (function () {
        startConfetti = startConfettiInner;
        stopConfetti = stopConfettiInner;
        toggleConfetti = toggleConfettiInner;
        removeConfetti = removeConfettiInner;
        let colors = ['#ec1254', '#f27c14', '#f27c14', '#f5e31d', '#1ee8b6', '#26a1d5'];
        let streamingConfetti = false;
        let animationTimer = null;
        let particles = [];
        let waveAngle = 0;

        function resetParticle(particle, width, height) {
            particle.color = colors[(Math.random() * colors.length) | 0];
            particle.x = Math.random() * width;
            particle.y = Math.random() * height - height;
            particle.diameter = Math.random() * 10 + 5;
            particle.tilt = Math.random() * 10 - 10;
            particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
            particle.tiltAngle = 0;
            return particle;
        }

        function startConfettiInner() {
            let width = window.innerWidth;
            let height = window.innerHeight;
            window.requestAnimFrame = (function () {
                return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
                    return window.setTimeout(callback, 16.6666667);
                };
            })();
            let canvas = id('confetti-canvas');
            if (canvas === null) {
                canvas = document.createElement('canvas');
                canvas.setAttribute('id', 'confetti-canvas');
                canvas.setAttribute('style', 'display:block;z-index:999999;pointer-events:none;position:fixed;top:0;left:0;transition:0.3s opacity ease;');
                document.body.appendChild(canvas);
                canvas.width = width;
                canvas.height = height;
                window.addEventListener('resize', function () {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }, { passive: true });
            }
            let context = canvas.getContext('2d');
            while (particles.length < maxParticleCount) {
                particles.push(resetParticle({}, width, height));
            }
            streamingConfetti = true;
            if (animationTimer === null) {
                (function runAnimation() {
                    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
                    if (particles.length === 0) {
                        animationTimer = null;
                    } else {
                        updateParticles();
                        drawParticles(context);
                        animationTimer = requestAnimFrame(runAnimation);
                    }
                })();
            }
        }

        function stopConfettiInner() {
            streamingConfetti = false;
        }

        function removeConfettiInner() {
            stopConfetti();
            particles = [];
        }

        function toggleConfettiInner() {
            if (streamingConfetti) {
                stopConfettiInner();
            } else {
                startConfettiInner();
            }
        }

        function drawParticles(context) {
            let particle;
            let x;
            for (let i = 0; i < particles.length; i++) {
                particle = particles[i];
                context.beginPath();
                context.lineWidth = particle.diameter;
                context.strokeStyle = particle.color;
                x = particle.x + particle.tilt;
                context.moveTo(x + particle.diameter / 2, particle.y);
                context.lineTo(x, particle.y + particle.tilt + particle.diameter / 2);
                context.stroke();
            }
        }

        function updateParticles() {
            let width = window.innerWidth;
            let height = window.innerHeight;
            let particle;
            waveAngle += 0.01;
            for (let i = 0; i < particles.length; i++) {
                particle = particles[i];
                if (!streamingConfetti && particle.y < -15) {
                    particle.y = height + 100;
                } else {
                    particle.tiltAngle += particle.tiltAngleIncrement;
                    particle.x += Math.sin(waveAngle);
                    particle.y += (Math.cos(waveAngle) + particle.diameter + particleSpeed) * 0.5;
                    particle.tilt = Math.sin(particle.tiltAngle) * 15;
                }
                if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
                    if (streamingConfetti && particles.length <= maxParticleCount) {
                        resetParticle(particle, width, height);
                    } else {
                        particles.splice(i, 1);
                        i--;
                    }
                }
            }
        }
    })();

    // Show confetti when it is the users birthday or when the user uses Somtoday Mod for n years
    function congratulations() {
        // Only activate it when enabled in settings and if it is the first time Somtoday is used on the current day (months are zero-based)
        if (get('bools').charAt(BOOL_INDEX.CONGRATULATIONS) == '1' && (year + '-' + (month + 1) + '-' + dayInt) != get('lastused')) {
            // Get years since first use
            const firstused = new Date(get('firstused'));
            const lastused = new Date(get('lastused'));
            const yeardifference = parseInt((lastused - firstused) / 1000 / 60 / 60 / 24 / 365);
            // Get birthday date
            const date = new Date();
            const birthdayday = parseInt(get('birthday').charAt(0) + get('birthday').charAt(1));
            const birthdaymonth = parseInt(get('birthday').charAt(3) + get('birthday').charAt(4));
            // Check if confetti should be shown
            let congratstext = [''];
            if (yeardifference > get('lastjubileum')) {
                congratstext = ['Bedankt' + (n(get('username')) ? (n(get('realname')) ? '' : ', ' + get('realname').replace(/ .*/, '')) : ', ' + get('username').replace(/ .*/, '')) + '!', 'Je gebruikt Somtoday Mod nu al ' + yeardifference + ' jaar. Bedankt!'];
                set('lastjubileum', yeardifference);
            }
            if (birthdayday == dayInt && birthdaymonth == (month + 1)) {
                const randomDescriptionArray = ['Maak er maar een mooie dag van!', 'Gefeliciteerd! Je bent weer een jaartje dichterbij je afstuderen!', 'Geniet ervan! Mogen al je dromen uitkomen!', 'Jaja, je bent weer jarig! Van harte gefeliciteerd!', '"School is raar, hier is een schaar" ~ iemand die ooit jarig was'];
                congratstext = ['Fijne verjaardag!', randomDescriptionArray[Math.floor(Math.random() * randomDescriptionArray.length)]];
            }
            if (congratstext[1] != null) {
                // Confetti should be shown, so insert the confetti
                tn('body', 0).style.setProperty('overflow-y', 'hidden', 'important');
                tn('body', 0).insertAdjacentHTML('afterbegin', '<style>#verjaardag{width:100%;height:100%;position:fixed;top:0;left:0;z-index:10000;background:var(--bg-elevated-none);text-align:center;transition:0.3s opacity ease;}#verjaardag div{top:50%;left:50%;transform:translate(-50%, -50%);position:absolute;}.bouncetext{animation:bounce 0.3s ease forwards;color:var(--action-primary-normal);}.bouncetext.small{font-size:0;animation:bouncesmall 0.5s ease forwards 0.3s;margin-top:35px;}@keyframes bouncesmall{0%{font-size:0px;}80%{font-size:29px;}100%{font-size:24px;}}@keyframes bounce{0%{font-size:0px;}80%{font-size:58px;}100%{font-size:48px;}}.verjaardagbtn{background:var(--action-primary-normal);padding:25px 40px;width:fit-content;color:var(--bg-elevated-none) !important;margin-top:50px;opacity:0;display:block;animation:2s fadein ease 0.6s forwards;font-size:16px;border-radius:16px;transition:0.3s background ease !important;}.verjaardagbtn:hover{cursor:pointer;background:var(--action-primary-strong);}@keyframes fadein{0%{opacity:0;}100%{opacity:1;}}</style><div id="verjaardag"><div><h2 class="bouncetext">' + congratstext[0] + '</h2><h2 class="bouncetext small">' + congratstext[1] + '</h2><center><a class="verjaardagbtn" id="congrats-continue">Doorgaan</a></center></div></div>');
                id('congrats-continue').addEventListener('click', function () {
                    set('lastused', year + '-' + (month + 1) + '-' + dayInt);
                    id('confetti-canvas').style.opacity = '0';
                    id('verjaardag').style.opacity = '0';
                    setTimeout(function () {
                        tryRemove(id('confetti-canvas'));
                        tryRemove(id('verjaardag'));
                        tn('body', 0).style.setProperty('overflow-y', 'scroll', 'important');
                    }, 350);
                });
                setTimeout(startConfetti, 500);
            }
            else {
                set('lastused', year + '-' + (month + 1) + '-' + dayInt);
            }
        }
        else {
            set('lastused', year + '-' + (month + 1) + '-' + dayInt);
        }
    }





    // GRADE TOOLS

    // Download image of average of all grades
    function downloadGrades() {
        const cijferoverzicht = tn('sl-cijfer-overzicht', 0);
        if (n(tn('sl-resultaat-item', 0)) || cijferoverzicht) {
            download();
        }
        else {
            modMessage('Hoeveel cijfers wil je downloaden?', 'Kies het aantal cijfers dat je wil downloaden (1-25).<div class="br"></div><input id="mod-grades-amount" type="number" min="1" max="25" step="1" onkeyup="if (this.value != \'\') { this.value = Math.floor(this.value); } if (this.value < 1 && this.value != \'\') { this.value = 1; } else if (this.value > 25) { this.value = 25; }"/>', 'Doorgaan', 'Annuleren');
            id('mod-message-action1').addEventListener('click', download);
            id('mod-message-action2').addEventListener('click', closeModMessage);
        }
        tn('sl-root', 0).removeAttribute('inert');
        async function download() {
            let items = [];
            let number;
            let totalWidth = 36 * 2 + 600;
            // Get information from grade overview
            if (cijferoverzicht) {
                let i = 0;
                // First of all, get information about the different sections
                // This is used to later determine which grades should be placed in which section
                // These sections might be year quarters (1-4), or in case of exam year categories ("Grades" and "Averages")
                for (const section of cn('periode-header')) {
                    totalWidth +=
                        22 // gap between sections
                        + 15 * 2 // section padding
                        ;
                    if (!section.classList.contains('open')) {
                        section.click();
                    }
                    const count = parseInt(section.style.getPropertyValue('--aantal-items'));
                    const category = section.getAttribute('aria-label');
                    for (let j = 0; j < count; j++) {
                        items[i + j] = {
                            index: i + j,
                            category: category,
                        };
                    }
                    i += count;
                }
                let category;
                // Then, get some intel about the columns
                const columns = cn('vak-gemiddelde-header')[0].getElementsByTagName('th');
                for (i = 1; i < columns.length; i++) {
                    items[i - 1].column = columns[i].innerHTML.trim();
                    items[i - 1].gemiddelde = columns[i].classList.contains('gemiddelde');
                    items[i - 1].last = columns[i].classList.contains('last');
                    if (items[i - 1].category != category) {
                        category = items[i - 1].category;
                    }
                    else {
                        totalWidth += 15;
                    }
                    if (items[i - 1].gemiddelde) {
                        totalWidth += 150; // Gemiddelden zijn breder omdat deze vaak formaat 0.00 hebben
                    }
                    else {
                        totalWidth += 120; // Cijfers zijn smaller omdat deze vaak formaat 0.0 hebben
                    }
                }
                number = cn('vak-row').length;
            }
            else {
                totalWidth = 1000;
                number = tn('sl-resultaat-item', 0) ? Math.min(Math.round(parseFloat(id('mod-grades-amount').value)), tn('sl-resultaat-item').length) : tn('sl-vakgemiddelde-item').length;
                if (isNaN(number)) {
                    number = 1;
                }
            }

            const cijferOverzichtPeriod = (tn('sl-dropdown', 0) && tn('sl-dropdown', 0).ariaLabel)
                ? tn('sl-dropdown', 0).ariaLabel
                : 'Cijferoverzicht';

            // Show a loading message
            modMessage('Downloaden...', 'Somtoday Mod is bezig met het genereren van je afbeelding. Dit kan even duren...');
            // Construct HTML
            const font = 'Kanit, Arial, sans-serif, Tahoma';
            const headerBackground = darkmode ? '#2b3c63' : '#0099ff';
            const headerText = cijferoverzicht ? cijferOverzichtPeriod : (n(tn('sl-vakgemiddelde-item', 0)) ? 'Mijn cijfers' : 'Laatste rapportcijfers');
            let html = `
                <div style="
                    width: ${totalWidth}px;
                    height: 218px;
                    background-color: ${headerBackground};
                    display: flex;
                    align-items: center;
                    padding: 0 44px;
                    box-sizing: border-box;
                    font-family: ${font};
                    font-weight: 400;
                    margin-bottom: -42px;
	                padding-bottom: 42px;
                ">
                    <svg style="flex-shrink: 0;" xmlns="http://www.w3.org/2000/svg" width="368" height="60" viewBox="0 0 300 49" fill="none">
                        <path d="M44.6819 17.3781H43.3148C41.7353 17.3781 40.4606 16.1316 40.4606 14.5871V11.9045C40.4606 10.36 39.1859 9.11355 37.6064 9.11355H32.6184C31.0389 9.11355 29.7642 7.8671 29.7642 6.32258V2.79097C29.7642 1.24645 28.4895 0 26.91 0H22.153C20.5734 0 19.2987 1.24645 19.2987 2.79097V6.32258C19.2987 7.8671 18.024 9.11355 16.4445 9.11355H11.4566C9.87706 9.11355 8.60236 10.36 8.60236 11.9045V14.5871C8.60236 16.1316 7.32766 17.3781 5.74814 17.3781H4.38107C2.80155 17.3781 1.52686 18.6245 1.52686 20.169V28.5058C1.52686 30.0503 2.80155 31.2968 4.38107 31.2968H5.72967C7.30918 31.2968 8.58388 32.5432 8.58388 34.0877V37.1768C8.58388 38.7213 9.85858 39.9677 11.4381 39.9677C13.0176 39.9677 14.2923 41.2142 14.2923 42.7587V46.209C14.2923 47.7535 15.567 49 17.1465 49H20.2132C21.7927 49 23.0674 47.7535 23.0674 46.209V41.4039C23.0674 40.609 23.7232 39.9768 24.5269 39.9768C25.3305 39.9768 25.9863 40.6181 25.9863 41.4039V46.209C25.9863 47.7535 27.261 49 28.8405 49H31.9072C33.4867 49 34.7614 47.7535 34.7614 46.209V42.7587C34.7614 41.2142 36.0361 39.9677 37.6156 39.9677C39.1951 39.9677 40.4698 38.7213 40.4698 37.1768V34.0877C40.4698 32.5432 41.7445 31.2968 43.324 31.2968H44.6726C46.2522 31.2968 47.5269 30.0503 47.5269 28.5058V20.169C47.5269 18.6245 46.2522 17.3781 44.6726 17.3781H44.6819ZM37.902 26.4465C37.006 29.3368 35.0108 31.7123 32.2859 33.1394C30.5863 34.0245 28.7297 34.4761 26.8453 34.4761C25.7184 34.4761 24.5823 34.3135 23.4738 33.9794C22.7995 33.7806 22.4208 33.0852 22.624 32.4348C22.8273 31.7755 23.5385 31.4052 24.2128 31.6039C26.522 32.2903 28.9606 32.0555 31.0943 30.9445C33.2188 29.8335 34.7799 27.9819 35.4819 25.7239C35.6851 25.0645 36.3963 24.7032 37.0706 24.8929C37.7449 25.0916 38.1236 25.7871 37.9204 26.4465H37.902Z" fill="white" />
                        <path d="M78.6921 18.0352C77.0176 18.0352 75.7302 18.4777 75.7302 19.5882C75.7302 20.473 76.3064 20.78 77.6298 21.1412L81.6901 22.1615C86.1105 23.3533 87.4339 25.6647 87.4339 28.7616C87.4339 33.2761 83.9048 36.2917 77.8098 36.2917C73.7495 36.2917 70.5265 35.1812 68.7079 34.2963L70.0764 28.4907C72.1921 29.6013 74.9379 30.6577 77.2787 30.6577C79.1332 30.6577 80.1506 30.3056 80.1506 29.2853C80.1506 28.5359 79.2683 28.0935 77.8548 27.7323L74.0556 26.712C70.2564 25.6466 68.4019 23.5248 68.4019 20.0216C68.4019 15.4168 72.4171 12.2748 78.8722 12.2748C81.9151 12.2748 85.6693 13.1145 87.4879 13.9542L85.5883 19.8862C83.4276 18.7305 80.8618 18.0262 78.7011 18.0262L78.6921 18.0352Z" fill="white" />
                        <path d="M90.6208 24.2833C90.6208 17.2407 95.8785 12.0581 103.027 12.0581C110.175 12.0581 115.442 17.2407 115.442 24.2833C115.442 31.3258 110.184 36.5084 103.027 36.5084C95.8695 36.5084 90.6208 31.3258 90.6208 24.2833ZM108.329 24.2833C108.329 21.2315 106.169 18.8388 103.027 18.8388C99.8848 18.8388 97.7691 21.2315 97.7691 24.2833C97.7691 27.3351 99.8848 29.7277 103.027 29.7277C106.169 29.7277 108.329 27.3351 108.329 24.2833Z" fill="white" />
                        <path d="M127.361 14.9744C129.036 13.295 131.377 12.2296 134.339 12.2296C138.003 12.2296 140.344 13.5117 141.541 16.1753C143.179 13.8729 145.871 12.2748 149.49 12.2748C155.45 12.2748 157.881 16.8344 157.881 22.5045V27.9129C157.881 29.0686 158.106 30.0347 159.204 30.0347C159.871 30.0347 160.708 29.7728 161.455 29.4117L161.761 35.2985C160.564 35.7861 158.313 36.2736 156.198 36.2736C152.578 36.2736 150.454 34.4588 150.454 29.6735V23.7415C150.454 20.771 149.085 19.1367 146.564 19.1367C144.62 19.1367 143.296 20.3286 142.675 21.6197V35.8403H135.257V23.7054C135.257 20.78 133.979 19.1458 131.458 19.1458C129.342 19.1458 128.01 20.3827 127.352 21.71V35.8403H119.934V12.672H127.352V14.9744H127.361Z" fill="white" />
                        <path d="M173.951 12.6721H181.946V18.4325H173.951V26.2245C173.951 28.879 174.924 29.8541 176.643 29.8541C178.363 29.8541 179.956 29.0144 181.018 28.256L183.269 33.9262C180.973 35.3437 177.921 36.2737 174.257 36.2737C169.486 36.2737 166.533 33.3483 166.533 27.7684V18.4235H162.599V12.663H166.749L167.676 6.77618H173.951V12.663V12.6721Z" fill="white" />
                        <path d="M185.394 24.2833C185.394 17.2407 190.651 12.0581 197.8 12.0581C204.948 12.0581 210.215 17.2407 210.215 24.2833C210.215 31.3258 204.957 36.5084 197.8 36.5084C190.642 36.5084 185.394 31.3258 185.394 24.2833ZM203.102 24.2833C203.102 21.2315 200.942 18.8388 197.8 18.8388C194.658 18.8388 192.542 21.2315 192.542 24.2833C192.542 27.3351 194.658 29.7277 197.8 29.7277C200.942 29.7277 203.102 27.3351 203.102 24.2833Z" fill="white" />
                        <path d="M241.833 35.3076C240.68 35.7951 238.475 36.2827 236.314 36.2827C233.757 36.2827 231.894 35.3979 231.056 33.1406C229.598 35.0006 227.347 36.2827 223.944 36.2827C217.669 36.2827 213.303 31.2355 213.303 24.2381C213.303 17.2407 217.678 12.2748 223.944 12.2748C226.726 12.2748 228.977 13.2499 230.525 14.6674V4.39252H237.944V27.9129C237.944 29.1047 238.205 30.0347 239.357 30.0347C239.978 30.0347 240.725 29.7728 241.563 29.4117L241.824 35.2985L241.833 35.3076ZM230.525 28.1747V20.4279C229.373 19.3625 227.743 18.7485 226.105 18.7485C222.927 18.7485 220.847 20.8703 220.847 24.2381C220.847 27.6059 222.882 29.818 226.105 29.818C227.824 29.818 229.553 29.0234 230.525 28.1747Z" fill="white" />
                        <path d="M270.282 30.0347C271.164 30.0347 271.83 29.7728 272.532 29.4117L272.793 35.2985C271.56 35.7861 269.48 36.2737 267.275 36.2737C264.628 36.2737 262.809 35.2534 262.017 32.951C260.468 34.811 258.038 36.2285 254.95 36.2285C248.63 36.2285 244.308 31.2716 244.308 24.3103C244.308 17.349 248.639 12.2657 254.95 12.2657C257.822 12.2657 260.027 13.1506 261.486 14.7036V12.663H268.904V27.9039C268.904 29.0596 269.165 30.0257 270.273 30.0257L270.282 30.0347ZM257.074 29.809C258.704 29.809 260.342 29.1408 261.495 28.1296V20.4189C260.568 19.4889 258.803 18.7395 257.074 18.7395C253.851 18.7395 251.862 20.9064 251.862 24.3194C251.862 27.7323 253.896 29.809 257.074 29.809Z" fill="white" />
                        <path d="M300 12.6721L290.817 35.5243C288.341 41.8174 285.865 44.6074 280.392 44.6074C278.357 44.6074 276.286 43.858 275.089 43.0544L276.151 37.3842C277.259 37.9621 278.753 38.5851 280.257 38.5851C282.111 38.5851 282.904 37.6551 283.66 36.0118L284.056 35.0367L273.766 12.6721H281.976L287.234 27.7323L292.537 12.6721H300Z" fill="white" />
                    </svg>
                    <h3 style="
                        letter-spacing: 2.2px;
                        font-size: 44px;
                        margin-left: 50px;
                        color: #fff;
                        font-family: ${font};
                        font-weight: 400;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        flex-grow: 1;
                        flex-shrink: 1;
                        text-align: right;
                    ">${headerText}</h3>
                </div>`;
            const containerBackground = darkmode ? '#1a1b29' : '#e7e8f0';
            const containerHeight =
                2 * 52 + // container padding top+bottom
                (Math.max(number, 1) - 1) * 22 + // gap between container items
                Math.max(number, 1) * 140 + // container item height
                (cijferoverzicht ? 60 + 22 : 0); // cijferoverzicht top row
            html += `
                <div style="
                    width: ${totalWidth}px;
                    height: ${containerHeight}px;
                    display: flex;
                    padding: 52px 36px;
                    flex-direction: column;
                    gap: 22px;
                    background-color: ${containerBackground};
                    box-sizing: border-box;
                	border-top-left-radius: 42px;
                	border-top-right-radius: 42px;
                ">`;
            const subjectBackground = darkmode ? '#31354b' : '#fff';
            const subjectIconBackground = darkmode ? '#414768' : '#0002';
            const subjectColor = darkmode ? '#fff' : '#393950';
            const fadedColor = darkmode ? '#a2a2db' : '#6f6f9b';
            if (cijferoverzicht) {
                const sectionStyle = `
                	display: flex;
                	align-items: center;
                	height: 140px;
                	box-sizing: border-box;
                	background-color: ${subjectBackground};
                	border-radius: 35px;
                	padding: 0 15px;
                	gap: 15px;
                	corner-shape: squircle;
                `;

                const firstSectionStyle = sectionStyle + `
                	padding: 0 30px;
                	width: 600px;
                `;

                const h3Style = `
                    color: ${subjectColor};
                    font-size: 42px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    width: 390px;
                    margin: 0;
                    font-family: ${font};
                	font-weight: 400;
                `;

                const gemiddeldeBackground = darkmode ? '#2c2d42' : '#f2f3f9';
                const gemiddeldeStyle = `
                	background-color: ${gemiddeldeBackground};
                	font-weight: 600;
                `;
                const gemiddeldeLastStyle = `
                	background-color: ${containerBackground};
                	font-weight: 600;
                `;

                // Column information
                html += `
                <div style="
                	display: flex;
                	gap: 22px;
                ">
                    <div style="
                        ${firstSectionStyle}
                        background-color: transparent;
                        height: 60px;
                    ">
                        <h3 style="${h3Style}">Vakken</h3>
                    </div>`;
                let category;
                for (const item of items) {
                    const width = item.gemiddelde ? '150px' : '120px';

                    let content = '';
                    if (item.category != category) {
                        category = item.category;
                        // Close previous section (not needed at start)
                        if (item.index != 0) {
                            html += `</div>`;
                        }
                        html += `<div style="
                            ${sectionStyle}
                            background-color: transparent;
                            height: 60px;
                        ">`;
                        content = item.category.replace('Periode: ', 'Periode ');
                    }
                    if (item.column && item.column.replace(/\s/g, '') != '' && item.column.length <= 3) {
                        content = item.column;
                    }

                    html += `
                    <p style="
                        color: ${fadedColor};
                        font-size: 2em;
                        width: ${width};
                        white-space: nowrap;
                    	font-family: ${font};
                    	font-weight: 400;
                    ">${content}</p>`;
                    // Close last section (only needed at end)
                    if (item.index == items.length - 1) {
                        html += `</div>`;
                    }
                }
                html += `</div>`;

                const vakken = cn('vak-row');
                for (const vak of vakken) {
                    // Insert subject icon + name
                    html += `
                    <div style="
                    	display: flex;
                    	gap: 22px;
                    ">
                        <div style="${firstSectionStyle}">
                            <svg style="
                                padding: 18px;
                                border-radius: 50%;
                                background-color: ${subjectIconBackground};
                                height: 36px;
                                width: 36px;
                                flex-shrink: 0;
                                overflow: visible;
                            " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">${vak.getElementsByTagName('svg')[0].innerHTML}</svg>
                            <h3 style="${h3Style}">${vak.getElementsByClassName('naam')[0].innerHTML.trim()}</h3>
                        </div>`;

                    // Insert all grades in their sections
                    for (const item of items) {
                        const averageStyle = (item.last && item.gemiddelde) ? gemiddeldeLastStyle : (item.gemiddelde ? gemiddeldeStyle : '');
                        const width = item.gemiddelde ? '150px' : '120px';
                        if (item.category != category) {
                            category = item.category;
                            // Close previous section (not needed at start)
                            if (item.index != 0) {
                                html += `</div>`;
                            }
                            html += `<div style="${sectionStyle}">`;
                        }

                        const el = vak.getElementsByTagName('td')[item.index + 1];

                        const red = el.classList.contains('onvoldoende');
                        const green = el.classList.contains('ruimvoldoende');
                        const grey = el.classList.contains('neutraal');
                        const gradeColor = red ? (darkmode ? '#f08080' : '#ca1a1a') : (green ? (darkmode ? '#80f0a2' : '#22a816') : (grey ? (darkmode ? '#a1a5c2' : '#8d90aa') : subjectColor));

                        html += `
                    <p style="
                    	color: ${gradeColor};
                    	font-size: 52px;
                    	height: 114px;
                    	border-radius: 26px;
                        corner-shape: squircle;
                    	width: ${width};
                    	text-align: center;
                    	font-family: ${font};
                    	font-weight: 400;
                    	display: flex;
                    	align-items: center;
                    	justify-content: center;
                        ${averageStyle}
                    ">${el.innerHTML.trim()}</p>`;
                        // Close last section (only needed at end)
                        if (item.index == items.length - 1) {
                            html += `</div>`;
                        }
                    }
                    html += `</div>`;
                }
            }
            else {
                for (let i = 0; i < number; i++) {
                    let averagePageGradeIndex = 0;
                    if (tn('sl-vakgemiddelde-item', i)) {
                        averagePageGradeIndex = tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer').length - 1;
                    }
                    const subjectIcon = n(tn('sl-resultaat-item', 0)) ?
                        tn('sl-vakgemiddelde-item', i).getElementsByTagName('svg')[0].innerHTML :
                        tn('sl-resultaat-item', i).getElementsByTagName('svg')[0].innerHTML
                        ;
                    const subjectName = n(tn('sl-resultaat-item', 0)) ?
                        tn('sl-vakgemiddelde-item', i).getElementsByTagName('span')[0].innerHTML :
                        tn('sl-resultaat-item', i).getElementsByClassName('titel')[0].innerHTML
                        ;
                    let grade = (n(tn('sl-resultaat-item', 0)) ?
                        (n(tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex]) ?
                            '' :
                            tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex].innerHTML
                        ) :
                        tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0].innerHTML
                    );
                    const gradeWeight = tn('sl-resultaat-item', i)?.getElementsByClassName('weging ng-star-inserted')[0]?.innerHTML ?? null;
                    const gradeWeightHTML = gradeWeight ?
                        `<p style="
                            font-size: 32px;
                            color: ${fadedColor};
                            font-family: ${font};
                            font-weight: 400;
                        ">${gradeWeight}</p>` : '';
                    const gradeDescription = tn('sl-resultaat-item', i)?.getElementsByClassName('subtitel ng-star-inserted')[0]?.innerHTML ?? null;
                    const gradeDescriptionHTML = gradeDescription ?
                        `<p style="
                            margin: 0;
                            color: ${fadedColor};
                            font-family: ${font};
                            font-weight: 400;
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            min-width: 0;
                            font-size: 24px;
                        ">${gradeDescription}</p>` : '';
                    const red =
                        (tn('sl-resultaat-item', i) &&
                            tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0] &&
                            tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0].classList.contains('onvoldoende')) ||
                        (tn('sl-vakgemiddelde-item', i) &&
                            tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex] &&
                            tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex].classList.contains('onvoldoende'));
                    const green =
                        (tn('sl-resultaat-item', i) &&
                            tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0] &&
                            tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0].classList.contains('ruimvoldoende')) ||
                        (tn('sl-vakgemiddelde-item', i) &&
                            tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex] &&
                            tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex].classList.contains('ruimvoldoende'));
                    let grey =
                        (tn('sl-resultaat-item', i) &&
                            tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0] &&
                            tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0].classList.contains('neutraal')) ||
                        (tn('sl-vakgemiddelde-item', i) &&
                            tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex] &&
                            tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex].classList.contains('neutraal'));
                    if (!grade || grade.replace(/\s/g, '') == '') {
                        grade = '-';
                        grey = true;
                    }
                    let gradeColor = red ? (darkmode ? '#f08080' : '#ca1a1a') : (green ? (darkmode ? '#80f0a2' : '#22a816') : (grey ? (darkmode ? '#a1a5c2' : '#8d90aa') : subjectColor));
                    html += `
                    <div style="
                        display: flex;
                        align-items: center;
                        height: 140px;
                        box-sizing: border-box;
                        background-color: ${subjectBackground};
                        border-radius: 35px;
                        padding: 0 44px;
                        gap: 22px;
                        corner-shape: squircle;
                    ">
                        <svg style="
                            padding: 18px;
                            border-radius: 50%;
                            background-color: ${subjectIconBackground};
                            height: 36px;
                            width: 36px;
                            flex-shrink: 0;
                            overflow: visible;
                        " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">${subjectIcon}</svg>
                        <div style="
                            flex-shrink: 1;
                            flex-grow: 1;
                            min-width: 0;
                        ">
                            <h3 style="        
                                color: ${subjectColor};
                                font-size: 42px;
                                overflow: hidden;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                font-family: ${font};
                                font-weight: 400;
                                min-width: 0;
                                margin: 0;
                            ">${subjectName}</h3>
                            ${gradeDescriptionHTML}
                        </div>
                        ${gradeWeightHTML}
                        <p style="
                            color: ${gradeColor};
                            font-size: 52px;
                            font-weight: 600;
                            margin-left: auto;
                            flex-shrink: 0;
                            font-family: ${font};
                            font-weight: 400;
                        ">${grade}</p>
                    </div>`;
                }
                if (n(tn('sl-resultaat-item', 0)) && n(tn('sl-vakgemiddelde-item', 0))) {
                    html += `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 140px;
                        box-sizing: border-box;
                        background-color: ${subjectBackground};
                        border-radius: 35px;
                        padding: 0 44px;
                        gap: 22px;
                        corner-shape: squircle;
                    ">
                        <h3 style="        
                            color: ${subjectColor};
                            font-size: 42px;
                            font-family: ${font};
                            font-weight: 400;
                            ">Er zijn geen cijfers voor deze periode</h3>
                    </div>`;
                }
            }
            html += `</div>`;
            const totalHeight = containerHeight + 176; // add header height
            // Insert canvas
            tn('body', 0).insertAdjacentHTML('beforeend', `<canvas id="mod-grade-canvas" width="${totalWidth}" height="${totalHeight}" style="display:none;"></canvas>`);
            const canvas = id('mod-grade-canvas');
            const ctx = canvas.getContext('2d');
            // Use data urls for font in SVG
            const kanit = await window.getResourceAsBase64('fonts/Kanit-ExtraLight.woff2');
            // Add SVG with HTML to the canvas
            const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + canvas.width + '" height="' + canvas.height + '"><defs><style type="text/css">@font-face{font-family:Kanit;src:url(\'' + kanit + '\')}</style></defs><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">' + html + '</div></foreignObject></svg>';
            const svgObjectUrl = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svg);
            const tempImg = new Image();
            tempImg.addEventListener('load', function () {
                ctx.drawImage(tempImg, 0, 0);
                URL.revokeObjectURL(svgObjectUrl);
                let a = document.createElement('a');
                a.href = canvas.toDataURL('image/png');
                a.download = cijferoverzicht ? 'cijferoverzicht-' + cijferOverzichtPeriod.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.png' : (n(tn('sl-resultaat-item', 0)) ? 'laatste-rapportcijfers.png' : 'cijfers.png');
                a.dispatchEvent(new MouseEvent('click'));
                tryRemove(id('mod-grade-canvas'));
                if (id('mod-message')) {
                    closeModMessage();
                }
            });
            tempImg.addEventListener('error', function (e) {
                console.log(e);
                tryRemove(id('mod-grade-canvas'));
                if (id('mod-message')) {
                    closeModMessage();
                }
            });
            tempImg.src = svgObjectUrl;
            tn('sl-root', 0).removeAttribute('inert');
        }
    }

    // Add graphs to the subject grade page
    function gradeGraphs(recapData) {
        if (!n(recapData)) {
            let recapChart = Chart.getChart('recap-chart');
            if (recapChart) {
                recapChart.destroy();
            }
            Chart.defaults.color = '#fff';
            let recapCanvas = document.getElementById('recap-chart');
            let recapCtx = recapCanvas.getContext('2d');
            let recapGradient = recapCtx.createLinearGradient(0, 0, 0, 300);
            recapGradient.addColorStop(0, '#fff');
            recapGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            let recapPoints = [];
            let recapDates = [];
            for (const grade of recapData.grades) {
                if (!isNaN(grade.cijfer)) {
                    recapPoints.unshift(grade.cijfer);
                    recapDates.push('Mysterieus vak');
                }
            }
            let recapChartData = {
                labels: recapDates,
                datasets: [{
                    label: 'Mysterieus vak',
                    lineTension: 0,
                    backgroundColor: recapGradient,
                    fill: true,
                    borderColor: '#fff',
                    data: recapPoints.reverse(),
                    pointStyle: 'circle',
                    pointRadius: 3,
                    pointHoverRadius: 7,
                    hitRadius: 500,
                }],
            };
            recapChart = new Chart(recapCtx, {
                type: 'line',
                data: recapChartData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 11,
                            ticks: {
                                autoSkip: true,
                                callback: (value, index, values) => (index == (values.length - 1)) ? undefined : value,
                            },
                        },
                        x: {
                            ticks: {
                                display: false,
                            },
                        },
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                },
            });
            return;
        }
        if (n(document.getElementById('mod-chart-1')) || n(document.getElementById('mod-chart-2'))) {
            return;
        }

        let modChart1 = Chart.getChart('mod-chart-1');
        if (modChart1) {
            modChart1.destroy();
        }
        let modChart2 = Chart.getChart('mod-chart-2');
        if (modChart2) {
            modChart2.destroy();
        }

        Chart.defaults.color = darkmode ? '#fff' : '#000';
        let canvas = document.getElementById('mod-chart-1');
        let ctx = canvas.getContext('2d');
        let points = [];
        let weight = [];
        let dates = [];
        let dateObjects = [];
        const color = toBrightnessValue(get('primarycolor'), 150);
        const endcolor = hexToRgb(color);
        var gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(' + endcolor[0] + ',' + endcolor[1] + ',' + endcolor[2] + ',0)');
        for (const element of tn('sl-resultaat-item')) {
            if (!n(element.getElementsByClassName('cijfer')[0]) && !n(element.getElementsByClassName('cijfer')[0].children[0])) {
                if (element.getElementsByClassName('weging')[0].innerHTML.replace(',', '.').match(/[0-9]+(\.[0-9]+)?/) == null) {
                    continue;
                }
                const weging = parseFloat(element.getElementsByClassName('weging')[0].innerHTML.replace(',', '.').match(/[0-9]+(\.[0-9]+)?/)[0]);
                let grade = parseFloat(element.getElementsByClassName('cijfer')[0].children[0].innerHTML.replace(',', '.'));

                let dateObject;
                const dateString = n(element.getElementsByClassName('subtitel')[0]) ? '' : element.getElementsByClassName('subtitel')[0].innerHTML;
                if (dateString.indexOf('Vandaag') != -1) {
                    dateObject = Date.now();
                }
                else if (dateString.indexOf('Gisteren') != -1) {
                    dateObject = new Date(Date.now() - 86400000);
                }
                else {
                    // Make string date parsable with Date.parse()
                    // First change month abbreviations to English
                    let englishDateString = dateString.replace('mrt', 'mar').replace('mei', 'may').replace('mei', 'may').replace('okt', 'oct');
                    // Then add the year if not present
                    if (englishDateString.match(".*?[0-9]{4}") == null) {
                        englishDateString += ' ' + year;
                    }
                    dateObject = Date.parse(englishDateString);
                }

                if (isNaN(grade) && weging != 0) {
                    let letterbeoordelingen = parseJSON(get('letterbeoordelingen'));
                    const letter = element.getElementsByClassName('cijfer')[0].children[0].innerHTML.replace(',', '.');
                    if (letterbeoordelingen == null || letterbeoordelingen[letter] == null) {
                        // Letter value is not set, user should set it in modsettings if they want to count it
                        continue;
                    }
                    else if (isNaN(letterbeoordelingen[letter])) {
                        // Letter should be ignored if set to "-" (or if non-numeric in general)
                        continue;
                    }
                    else {
                        // Letter value is numeric and set
                        grade = letterbeoordelingen[letter];
                    }
                }

                if (!isNaN(grade)) {
                    if (dateObjects.length == 0) {
                        points.push(grade);
                        dates.push(dateString);
                        dateObjects.push(dateObject);
                        weight.push(weging);
                    }
                    else {
                        // Keep array sorted by date
                        for (let i = 0; i < dateObjects.length; i++) {
                            if (dateObject <= dateObjects[i]) {
                                points.splice(i, 0, grade);
                                dates.splice(i, 0, dateString);
                                dateObjects.splice(i, 0, dateObject);
                                weight.splice(i, 0, weging);
                                break;
                            }
                            else if (i >= dateObjects.length - 1) {
                                points.push(grade);
                                dates.push(dateString);
                                dateObjects.push(dateObject);
                                weight.push(weging);
                                break;
                            }
                        }
                    }
                }
            }
        }
        // Calculate average and suggestions
        let totalWeight = 0;
        let weightedSum = 0;
        for (let i = 0; i < points.length; i++) {
            let w = weight[i];
            if (w > 50) w = 1;
            totalWeight += w;
            weightedSum += points[i] * w;
        }
        let suggestionText = "Er zijn nog niet genoeg cijfers om een analyse te maken.";
        if (totalWeight > 0) {
            const average = weightedSum / totalWeight;
            const roundedAverage = (Math.round(average * 10) / 10).toString().replace('.', ',');
            // Trend analysis (laatste 3 cijfers)
            let trend = "stabiel";
            if (points.length >= 2) {
                let recentSum = 0;
                let recentWeight = 0;
                let count = 0;
                for (let i = points.length - 1; i >= 0 && count < 3; i--) {
                    let wRecent = weight[i];
                    if (wRecent > 50) wRecent = 1;
                    recentSum += points[i] * wRecent;
                    recentWeight += wRecent;
                    count++;
                }
                if (recentWeight > 0) {
                    const recentAverage = recentSum / recentWeight;
                    if (recentAverage > average + 0.3) trend = "stijgend";
                    else if (recentAverage < average - 0.3) trend = "dalend";
                }
            }
            let advice = "";
            if (average < 5.5) {
                const needed = ((5.5 * (totalWeight + 1)) - weightedSum);
                advice = `Je staat helaas onvoldoende (${roundedAverage}). Probeer een <b>${Math.ceil(needed * 10) / 10}</b> of hoger te halen voor je volgende toets (1x wegend) om weer voldoende te staan. Zet 'm op!`;
            } else if (average < 6.5) {
                advice = `Je staat een voldoende (${roundedAverage}), maar het kan altijd beter! Blijf goed opletten in de les.`;
            } else if (average < 7.5) {
                advice = `Lekker bezig! Je staat een mooie ${roundedAverage}. Ga zo door!`;
            } else {
                advice = `Wauw! Je staat een ${roundedAverage}! Jij bent echt goed bezig!`;
            }
            let trendText = "";
            if (trend == "stijgend") trendText = " <br>🚀 Je laatste cijfers zitten in de lift!";
            else if (trend == "dalend") trendText = " <br>📉 Pas op, je laatste cijfers zijn wat lager dan gemiddeld.";
            suggestionText = advice + trendText;
        }
        if (id('mod-grade-suggestions')) {
            id('mod-grade-suggestions').innerHTML = suggestionText;
        }
        if (points.length < 2) {
            hide(id('mod-grades-graphs'));
            return;
        }
        let chartdata = {
            labels: dates,
            datasets: [{
                label: (n(cn('vaknaam', 0)) || n(cn('vaknaam', 0).getElementsByTagName('span')[0])) ? '' : cn('vaknaam', 0).getElementsByTagName('span')[0].innerHTML,
                lineTension: 0,
                backgroundColor: gradient,
                fill: true,
                borderColor: color,
                data: points,
                pointStyle: 'circle',
                pointRadius: 3,
                pointHoverRadius: 7,
                hitRadius: 500
            }]
        };
        modChart1 = new Chart(ctx, {
            type: 'line',
            data: chartdata,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 11,
                        ticks: {
                            autoSkip: true,
                            callback: (value, index, values) => (index == (values.length - 1)) ? undefined : value,
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                },
            },
        });
        canvas = document.getElementById('mod-chart-2');
        ctx = canvas.getContext('2d');
        let values = [];
        let totalGrades = 0;
        let rollingTotalWeight = 0;
        for (let i = 0; i < points.length; i++) {
            let wRolling = weight[i];
            if (wRolling > 50) wRolling = 1;
            totalGrades += points[i] * wRolling;
            rollingTotalWeight += wRolling;
            values.push(Math.floor((totalGrades / rollingTotalWeight) * 100) / 100);
        }
        chartdata = {
            labels: dates,
            datasets: [{
                label: (n(cn('vaknaam', 0)) || n(cn('vaknaam', 0).getElementsByTagName('span')[0])) ? '' : cn('vaknaam', 0).getElementsByTagName('span')[0].innerHTML,
                lineTension: 0,
                backgroundColor: gradient,
                fill: true,
                borderColor: color,
                data: values,
                pointStyle: 'circle',
                pointRadius: 3,
                pointHoverRadius: 7,
                hitRadius: 500
            }]
        };
        modChart2 = new Chart(ctx, {
            type: 'line',
            data: chartdata,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 11,
                        ticks: {
                            autoSkip: true,
                            callback: (value, index, values) => (index == (values.length - 1)) ? undefined : value,
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                },
            },
        });
    }

    function showLetterbeoordelingenMessage(letter) {
        let list = {
            'U': ['Uitstekend', 10],
            'ZG': ['Zeer goed', 9],
            'G': ['Goed', 8],
            'RV': ['Ruim voldoende', 7],
            'V': ['Voldoende', 6],
            'T': ['Twijfel', 5],
            'M': ['Matig', 5],
            'O': ['Onvoldoende', 4],
            'RO': ['Ruim onvoldoende', 3],
            'S': ['Slecht', 2],
            'ZS': ['Zeer slecht', 1],
            'A': ['Af', 10],
            'B': ['Bijna', 5.5],
            'N': ['Niet af', 1],
            'L': ['Lopend', 1],
        };
        let letterbeoordelingen = parseJSON(get('letterbeoordelingen'));
        if (letter != null && !n(letterbeoordelingen) && letterbeoordelingen[letter] == '-') {
            return;
        }
        if (letterbeoordelingen) {
            for (const [key, value] of Object.entries(letterbeoordelingen)) {
                list[key] = [list[key] ? list[key][0] : key, value];
            }
        }
        if (letter != null && list[letter] == null) {
            list[letter] = [];
        }
        let listHTML = '';
        for (const [key, value] of Object.entries(list)) {
            listHTML += '<div><label>' + key + (value[0] ? ' (' + value[0] + ')' : '') + '</label><input class="mod-letterbeoordelingen-letter" value="' + value[1] + '" data-mod-letter="' + key + '" type="number" placeholder="' + (value[0] ? value[0] : key) + '"></div>';
        }
        modMessage('Letterbeoordelingen', 'Bij sommige scholen tellen letterbeoordelingen (O, V, G, etc) mee voor je gemiddelde. Helaas verschilt het per school hoeveel een letter als cijfer waard is. Vul hieronder in hoeveel elke letter waard is.</p><div id="mod-letterbeoordelingen">' + listHTML + '</div><p>', 'Opslaan', 'Sluiten');
        id('mod-message-action1').addEventListener('click', function () {
            if (letterbeoordelingen == null) {
                letterbeoordelingen = {};
            }
            // Save letterbeoordelingen
            for (const element of cn('mod-letterbeoordelingen-letter')) {
                if (!isNaN(parseFloat(element.value))) {
                    letterbeoordelingen[element.dataset.modLetter] = element.value;
                }
                else {
                    // Save "-" to indicate this letter should be ignored
                    letterbeoordelingen[element.dataset.modLetter] = '-';
                }
            }
            console.log(letterbeoordelingen);
            set('letterbeoordelingen', JSON.stringify(letterbeoordelingen));
            closeModMessage();
        });
        id('mod-message-action2').addEventListener('click', function () {
            // Save letterbeoordelingen
            if (letterbeoordelingen == null) {
                letterbeoordelingen = {};
            }
            for (const element of cn('mod-letterbeoordelingen-letter')) {
                // Save "-" to indicate this letter should be ignored
                letterbeoordelingen[element.dataset.modLetter] = '-';
            }
            set('letterbeoordelingen', JSON.stringify(letterbeoordelingen));
            closeModMessage();
        });
    }

    function calculateAverage() {
        let total = 0;
        let weight = 0;
        for (const element of document.getElementsByTagName('sl-resultaat-item')) {
            // Each element should have a grade and weight
            if (!n(element.getElementsByClassName('cijfer')[0]) && !n(element.getElementsByClassName('cijfer')[0].children[0]) && !n(element.getElementsByClassName('weging')[0])) {

                // Ignore this grade and continue with the next one if the weight is not a number
                // Should never happen unless your school has a fucked up and stupid grade system
                if (element.getElementsByClassName('weging')[0].innerHTML.replace(',', '.').match(/[0-9]+(\.[0-9]+)?/) == null) {
                    continue;
                }
                const tempWeight = parseFloat(element.getElementsByClassName('weging')[0].innerHTML.replace(',', '.').match(/[0-9]+(\.[0-9]+)?/)[0]);
                const tempGrade = parseFloat(element.getElementsByClassName('cijfer')[0].children[0].innerHTML.replace(',', '.'));

                // If grade is not a number, check if user has set a corresponding numeric value
                if (isNaN(tempGrade)) {
                    // If weight is zero, it is probably a "handelingsdeel" and we can ignore it
                    if (tempWeight != 0) {
                        let letterbeoordelingen = parseJSON(get('letterbeoordelingen'));
                        const letter = element.getElementsByClassName('cijfer')[0].children[0].innerHTML.replace(',', '.');
                        if (letterbeoordelingen == null || letterbeoordelingen[letter] == null) {
                            // Probably just a future grade with content "-", ignore
                            if (element.getElementsByClassName('cijfer')[0].classList.contains('neutraal')) {
                                continue;
                            }
                            // Letter value is not set, ask user to define it
                            showLetterbeoordelingenMessage(letter);
                        }
                        else if (isNaN(letterbeoordelingen[letter])) {
                            // Letter should be ignored if set to "-" (or if non-numeric in general)
                            continue;
                        }
                        else {
                            // Letter value is numeric and set
                            total += letterbeoordelingen[letter] * tempWeight;
                            weight += tempWeight;
                        }
                    }
                }
                else {
                    total += tempGrade * tempWeight;
                    weight += tempWeight;
                }
            }
        }
        return {
            'total': total,
            'weight': weight,
        };
    }

    function subjectGradesPageContainsNumberGrades() {
        for (const element of tn('sl-resultaat-item')) {
            if (element.getElementsByClassName('cijfer')[0]) {
                if (!isNaN(parseFloat(element.getElementsByClassName('cijfer')[0].innerText.replace(',', '.')))) {
                    return true;
                }
            }
        }
        return false;
    }

    // Add grade calculation tools when enabled
    function insertCalculationTool() {
        if (n(id('mod-grade-calculate')) && tn('sl-resultaat-item', 0) && get('bools').charAt(BOOL_INDEX.CALCULATION_TOOL) == '1') {
            if (!subjectGradesPageContainsNumberGrades()) {
                return;
            }
            tn('sl-vakresultaten', 0).insertAdjacentHTML('beforeend', '<div id="mod-grade-calculate"><h3>Gemiddelde berekenen</h3><p>Wat moet ik halen?</p><input id="mod-grade-one-one" type="number" placeholder="Ik wil staan"><input id="mod-grade-one-two" type="number" placeholder="Weging aankomend cijfer"><input id="mod-grade-one-three" type="submit" value="Berekenen"><br><p>Wat ga ik staan?</p><input id="mod-grade-two-one" type="number" placeholder="Ik haal een"><input id="mod-grade-two-two" type="number" placeholder="Met de weging"/><input id="mod-grade-two-three" type="submit" value="Berekenen"/></div>');
            id('mod-grade-one-three').addEventListener('click', function () {
                let averageData = calculateAverage();
                // Calculate grade needed for chosen average
                let chosenAverage = parseFloat(id('mod-grade-one-one').value);
                let chosenWeight = parseFloat(id('mod-grade-one-two').value);
                if (isNaN(chosenAverage) || isNaN(chosenWeight)) {
                    id('mod-grade-one-three').value = 'Berekenen';
                }
                else {
                    id('mod-grade-one-three').value = (Math.ceil(((chosenAverage * (chosenWeight + averageData['weight']) - averageData['total']) / chosenWeight) * 100) / 100).toFixed(2).toString().replace('.', ',');
                }
            });
            id('mod-grade-two-three').addEventListener('click', function () {
                let averageData = calculateAverage();
                // Calculate average with chosen grade added
                let chosenGrade = parseFloat(id('mod-grade-two-one').value);
                let chosenWeight = parseFloat(id('mod-grade-two-two').value);
                if (isNaN(chosenGrade) || isNaN(chosenWeight)) {
                    id('mod-grade-two-three').value = 'Berekenen';
                }
                else {
                    averageData['total'] += chosenGrade * chosenWeight;
                    averageData['weight'] += chosenWeight;
                    id('mod-grade-two-three').value = (Math.floor((averageData['total'] / averageData['weight']) * 100) / 100).toFixed(2).toString().replace('.', ',');
                }
            });
        }
    }

    // Check if latest grades page or average grades page is open
    function insertGradeDownloadButton() {
        // Android version does not support image downloading yet
        if (platform == 'Android') {
            return;
        }
        if ((tn('sl-resultaat-item', 0) || tn('sl-vakgemiddelde-item', 0) || tn('sl-cijfer-overzicht', 0)) && n(tn('sl-vakresultaten', 0)) && get('bools').charAt(BOOL_INDEX.GRADE_DOWNLOAD_BTN) == "1") {
            if (n(id('mod-grades-download-computer')) && tn('hmy-switch-group', 0)) {
                tn('hmy-switch-group', 0).insertAdjacentHTML('beforeend', '<a id="mod-grades-download-computer" class="mod-grades-download">' + window.getIcon('download', null, 'var(--fg-primary-normal)') + '</a>');
                id('mod-grades-download-computer').addEventListener('click', downloadGrades);
            }
            if (n(id('mod-grades-download-mobile')) && cn('tabs ng-star-inserted', 0)) {
                if (document.documentElement.clientWidth > 767) {
                    cn('tabs ng-star-inserted', 0).getElementsByClassName('filler')[0].insertAdjacentHTML('beforeend', '<a id="mod-grades-download-mobile" class="mod-grades-download">' + window.getIcon('download', null, 'var(--fg-primary-normal)') + '</a>');
                    id('mod-grades-download-mobile').addEventListener('click', downloadGrades);
                }
                else {
                    tn('sl-scrollable-title', 0).insertAdjacentHTML('beforeend', '<a id="mod-grades-download-mobile" class="mod-grades-download">' + window.getIcon('download', null, 'var(--fg-primary-normal)') + '</a>');
                    id('mod-grades-download-mobile').addEventListener('click', downloadGrades);
                }
            }
        }
    }

    // Manage calculation tool and graph on subject grades page
    function subjectGradesPage() {
        if (tn('sl-vakresultaten', 0)) {
            execute([insertCalculationTool]);
            const examPage = !n(tn('sl-examenresultaten', 0));
            // Insert graphs + analyse at subject grades page when enabled (2 or more grades need to be present)
            const firstCondition = n(id('mod-grades-graphs')) && get('bools').charAt(BOOL_INDEX.SUBJECT_GRAPHS) == '1';
            const secondCondition = id('mod-grades-graphs') && ((examPage && id('mod-grades-graphs').dataset.exams == 'false') || (!examPage && id('mod-grades-graphs').dataset.exams == 'true'));
            if (firstCondition || secondCondition) {
                if (secondCondition) {
                    tryRemove(id('mod-grades-graphs'));
                }
                if (!subjectGradesPageContainsNumberGrades()) {
                    return;
                }

                tn('sl-vakresultaten', 0).insertAdjacentHTML(
                    'beforeend',
                    '<div id="mod-cijferanalyse">' +
                    (get('bools').charAt(BOOL_INDEX.GRADE_ANALYSIS) == '1' ? '<h3 style="margin-top: 40px;">Cijferanalyse</h3>' +
                        '<div id="mod-grade-suggestions" style="padding: 15px; margin: 15px 0; background: var(--bg-neutral-none); border-radius: 8px; border: 1px solid var(--border-neutral-weak);">Even geduld, je cijfers worden geanalyseerd...</div>' : '') +
                    '</div>' +
                    '<div id="mod-grades-graphs" data-exams="' + (examPage ? 'true' : 'false') + '">' +
                    '<h3>Mijn ' + (examPage ? 'examen' : '') + 'cijfers</h3><div><canvas id="mod-chart-1"></canvas></div>' +
                    '<h3>Mijn ' + (examPage ? 'examen' : '') + 'gemiddelde</h3><div><canvas id="mod-chart-2"></canvas></div>' +
                    '</div>'
                );
                setTimeout(function () { execute([gradeGraphs]); }, 500);
            }
        }
    }

    // Data object which will contain an array of the grades of every subject
    let gradedata;
    let gradingSystems;
    let totalAverage;
    let totalGrades = 0;
    let totalWeight = 0;
    let availablePages = [];
    let music;
    function somtodayRecap() {
        if (!ignoreRecapConditions) {
            if (get('bools').charAt(BOOL_INDEX.RECAP) == "0") {
                return;
            }
            if (!((month == 5 && dayInt > 25) || month == 6)) {
                return;
            }
        }
        // Set amount of viewed pages to zero
        let pages = 0;
        // Needed to collect all subject grades
        let closing = false;
        if (id('somtoday-recap') && n(id('somtoday-recap-wrapper')) && (tn('sl-vakresultaten', 0) || id('somtoday-recap').nextElementSibling.tagName == 'HMY-SWITCH-GROUP')) {
            tryRemove(id('somtoday-recap'));
        }
        if (id('mod-recap-year')) {
            id('mod-recap-year').innerText = (tn('sl-dropdown', 0) && tn('sl-dropdown', 0).ariaLabel) ? tn('sl-dropdown', 0).ariaLabel.replace(/^[^/]+\/(\d+)/, '$1') : year;
        }
        if ((tn('sl-resultaat-item', 0) || tn('sl-vakgemiddelde-item', 0) || tn('sl-cijfer-overzicht', 0)) && n(tn('sl-vakresultaten', 0)) && n(id('somtoday-recap'))) {
            try {
                music = new Audio(window.getAudioUrl('background'));
            }
            catch (e) {
                console.warn(e);
            }
            music.loop = true;
            const recapYear = (tn('sl-dropdown', 0) && tn('sl-dropdown', 0).ariaLabel) ? tn('sl-dropdown', 0).ariaLabel.replace(/^[^/]+\/(\d+)/, '$1') : year;
            tn('hmy-switch-group', 0).insertAdjacentHTML('afterend', '<div id="somtoday-recap"><h3>Somtoday Recap' + window.logo(null, null, '#fff', 'height:1em;width:fit-content;margin-left:10px;transform:translateY(2px);') + '</h3><p>Bekijk hier jouw jaaroverzicht van <span id="mod-recap-year">' + recapYear + '</span>.</p><div id="somtoday-recap-arrows">' + window.getIcon('chevron-right', null, '#fff', 'id="recap-arrow-1"') + window.getIcon('chevron-right', null, '#fff', 'id="recap-arrow-2"') + window.getIcon('chevron-right', null, '#fff', 'id="recap-arrow-3"') + '</div></div>');
            // Open recap on click
            id('somtoday-recap').addEventListener('click', async function () {
                music.currentTime = 0;
                music.play();
                music.volume = 1;
                isRecapping = true;
                // Request fullscreen (to hide URL changes when collecting grades)
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                }
                // Insert recap HTML
                tn('body', 0).style.setProperty('overflow-y', 'hidden', 'important');
                const currentYear = year || new Date().getFullYear();
                const prevYear = currentYear - 1;

                const recapYears = (tn('sl-dropdown', 0) && tn('sl-dropdown', 0).ariaLabel)
                    ? tn('sl-dropdown', 0).ariaLabel.replace(/^[^/]+(\d\d)\/\d+(\d\d)$/, '$1/$2')
                    : prevYear.toString().slice(-2) + '/' + currentYear.toString().slice(-2);

                const wrapper = id('somtoday-mod');
                if (wrapper) {
                    wrapper.insertAdjacentHTML('beforeend', `
                        <div id="somtoday-recap-wrapper">
                            <div id="recap-progress"></div>
                            <div id="recap-close">&times;</div>
                            <center class="recap-page">
                                <h1>Somtoday Recap ${recapYears}</h1>
                                <h2>Het schooljaar zit er al weer bijna op! Hoog tijd voor de Somtoday Recap!</h2>
                                <a id="recap-nextpage">Laden...</a>
                            </center>
                            <ul class="circles">
                                <li></li><li></li><li></li><li></li><li></li>
                                <li></li><li></li><li></li><li></li><li></li>
                            </ul>
                        </div>
                    `);
                }

                const recapClose = id('recap-close');
                if (recapClose) {
                    recapClose.addEventListener('click', function () {
                        if (document.documentElement.clientWidth < 1280) {
                            window.location.href = 'https://leerling.somtoday.nl/cijfers';
                            return;
                        }
                        closing = true;
                        const wrapper = id('somtoday-recap-wrapper');
                        if (wrapper) wrapper.remove();
                        stopConfetti();
                        tn('body', 0).style.overflowX = 'hidden';
                        tn('body', 0).style.setProperty('overflow-y', 'scroll', 'important');
                        isRecapping = false;
                        if (document.fullscreenElement) {
                            document.exitFullscreen();
                        }
                        setTimeout(() => { closing = false; }, 200);
                        endMusic();
                    });
                }

                await new Promise(resolve => setTimeout(resolve, 1000));

                // After recap is opened, collect grade data
                let i;

                // Prevent unnecessary page updates while collecting recap data
                busy = true;

                if (closing) { return; }

                gradedata = [];
                totalGrades = 0;
                totalWeight = 0;
                // For some reason some schools use different grading systems
                // System names are made up by me, there is almost no information on the internet about these systems
                gradingSystems = {
                    cijfers: false, // Just normal 1-10 numbers
                    plusmin: false, // +, - (and -/+ or -/+)
                    voortgang: false, // Afgerond, Bijna, Niet afgerond, Lopend, indicates student progress
                    letters: false, // Goed (8), Voldoende (6), Matig (5), Onvoldoende (4), etc, every letter has a corresponding number
                };

                // Open cijferoverzicht
                if (n(tn('sl-cijfer-overzicht', 0))) {
                    while (!window.navigator.onLine) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    tn('hmy-switch')[2].click();
                }

                while (true) {
                    if (closing) { return; }
                    // Check if cijferoverzicht is opened
                    if (tn('sl-cijfer-overzicht', 0) && cn('vak-row', 0)) {
                        break;
                    }
                    // Try for 7.5 seconds, then try to open cijferoverzicht again
                    if (i > 750) {
                        i = 0;
                        if (n(tn('sl-cijfer-overzicht', 0))) {
                            tn('hmy-switch')[2].click();
                        }
                    }
                    await new Promise(resolve => setTimeout(resolve, 10));
                    i++;
                }

                let totalAverageGrades = 0, totalAverageWeight = 0;

                for (const period of cn('periode-header')) {
                    if (!period.classList.contains('open')) {
                        period.click();
                    }
                }

                for (i = 0; true; i++) {
                    if (closing) { return; }
                    // Check if all periods are expanded, if so, continue
                    let allPeriodsExpanded = true;
                    for (const period of cn('periode-header')) {
                        if (!period.classList.contains('open')) {
                            allPeriodsExpanded = false;
                        }
                    }
                    if (allPeriodsExpanded) {
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 10));
                }

                i = 0;
                for (const element of cn('vak-row')) {
                    if (closing) { return; }

                    let subject = {};
                    let subjectTotalGrades = 0;
                    let subjectTotalWeight = 0;
                    let subjectGradingSystems = {
                        cijfers: false,
                        plusmin: false,
                        voortgang: false,
                        letters: false,
                    };

                    if (element.getElementsByClassName('naam')[0]) {
                        subject.name = element.getElementsByClassName('naam')[0].innerText;
                    }
                    if (element.getElementsByTagName('hmy-vak-icon')[0] && element.getElementsByTagName('hmy-vak-icon')[0].getElementsByTagName('svg')[0]) {
                        subject.icon = element.getElementsByTagName('hmy-vak-icon')[0].getElementsByTagName('svg')[0].outerHTML;
                    }
                    let averageElements = element.getElementsByClassName('cijfer gemiddelde');
                    if (averageElements.length >= 1) {
                        let average;
                        // First, try to take last available numeric and precise average
                        // "Rapport gem." (one to last average) is in format 0.00, "Rapportcijfer" (last average) in format "0"
                        for (const gemiddelde of averageElements) {
                            if (gemiddelde.innerText.indexOf(',') != -1 || gemiddelde.innerText.indexOf('.') != -1) {
                                average = gemiddelde.innerText.replace(',', '.');
                            }
                        }
                        // Just take last average, no matter the contents, we've got nothing better
                        if (!average) {
                            average = averageElements[averageElements.length - 1].innerText;
                        }

                        subject.average = isNaN(parseFloat(average)) ? average : parseFloat(average);
                        if (!isNaN(parseFloat(subject.average))) {
                            totalAverageGrades += Math.round(parseFloat(subject.average));
                            totalAverageWeight++;
                        }
                    }

                    subject.grades = [];

                    // Add individual grades and their weight
                    for (const cijfer of element.getElementsByClassName('cijfer')) {
                        if (cijfer.innerText == '') {
                            continue;
                        }
                        const grade = parseFloat(cijfer.innerText.replace(',', '.'));
                        const weging = cijfer.ariaLabel ? parseFloat(cijfer.ariaLabel.replace(/^[\s\S]*•? ?weging ([\d.,]+)[\s\S]*?$/, '$1')) : null;
                        if (cijfer.ariaLabel && !isNaN(weging) && !cijfer.classList.contains('gemiddelde')) {
                            subject.grades.push({
                                cijfer: isNaN(grade) ? cijfer.innerText : grade,
                                weging: weging,
                            });
                            if (isNaN(grade)) {
                                if (cijfer.innerText.indexOf('+') != -1 || cijfer.innerText.indexOf('-') != -1) {
                                    subjectGradingSystems.plusmin = true;
                                }
                                else if (cijfer.innerText.indexOf('A') != -1 || cijfer.innerText.indexOf('B') != -1 || cijfer.innerText.indexOf('N') != -1 || cijfer.innerText.indexOf('L') != -1) {
                                    subjectGradingSystems.voortgang = true;
                                }
                                else {
                                    subjectGradingSystems.letters = true;
                                }
                            }
                            else {
                                subjectGradingSystems.cijfers = true;
                            }
                            subjectTotalGrades++;
                            subjectTotalWeight += weging;
                        }
                    }

                    subject.gradeCount = subjectTotalGrades;
                    subject.weightCount = subjectTotalWeight;

                    let isUnique = true;
                    for (const loopSubject of gradedata) {
                        if (loopSubject.name == subject.name) {
                            isUnique = false;
                        }
                    }
                    if (subjectTotalGrades > 0 && isUnique) {
                        totalGrades += subjectTotalGrades;
                        totalWeight += subjectTotalWeight;
                        subject.systems = subjectGradingSystems;
                        gradedata.push(subject);

                        if (subjectGradingSystems.cijfers) {
                            gradingSystems.cijfers = true;
                        }
                        if (subjectGradingSystems.plusmin) {
                            gradingSystems.plusmin = true;
                        }
                        if (subjectGradingSystems.voortgang) {
                            gradingSystems.voortgang = true;
                        }
                        if (subjectGradingSystems.letters) {
                            gradingSystems.letters = true;
                        }
                    }

                    i++;
                }
                if (totalAverageWeight != 0) {
                    totalAverage = (totalAverageGrades / totalAverageWeight).toFixed(2);
                }
                console.log(gradedata);

                if (gradedata.length == 0) {
                    modMessage('Geen data', 'Het lijkt erop dat je nog geen cijfers hebt gekregen dit jaar. Probeer het later nog eens.', 'Doorgaan');
                    id('mod-message-action1').addEventListener('click', function () {
                        window.location.href = 'https://leerling.somtoday.nl/cijfers';
                        closeModMessage();
                    });
                    return;
                }

                availablePages = [busyYear, twoTrueOneFalse, twoTrueOneFalse];
                if (gradingSystems.cijfers) {
                    availablePages.push(subjectsLow);
                    availablePages.push(subjectsHigh);
                    availablePages.push(guessTheGraph);
                    availablePages.push(onvoldoendeGraph);
                    i = 0;
                    for (const subject of gradedata) {
                        if (!isNaN(subject.average)) {
                            i++;
                        }
                    }
                    if (i > 5 && totalGrades > 10) {
                        availablePages.push(overgangsCheck);
                    }
                    for (const subject of gradedata) {
                        if (!isNaN(subject.average)) {
                            availablePages.push(orderSubjects);
                            break;
                        }
                    }
                }
                if (gradingSystems.plusmin) {
                    availablePages.push(plusMinGraph);
                    availablePages.push(twoTrueOneFalse);
                    availablePages.push(twoTrueOneFalse);
                }
                if (gradingSystems.voortgang) {
                    availablePages.push(completedGraph);
                    availablePages.push(twoTrueOneFalse);
                    availablePages.push(twoTrueOneFalse);
                }

                // All grades are collected, allow user to continue
                id('recap-nextpage').innerHTML = 'Start Somtoday Recap';
                pages = 0;
                id('recap-nextpage').addEventListener('click', closeRecapPage);
                busy = false;
            });
        }

        function orderSubjects() {
            let usedSubjects = [];
            let subjects = [];
            let html = '';
            for (var i = 0; i < 5 && i < gradedata.length; i++) {
                let randomSubject = gradedata[Math.floor(Math.random() * gradedata.length)];
                if (usedSubjects.includes(randomSubject.name) || !randomSubject.systems.cijfers) {
                    for (const subject of gradedata) {
                        if (!usedSubjects.includes(subject.name) && subject.systems.cijfers) {
                            randomSubject = subject;
                            break;
                        }
                    }
                    if (usedSubjects.includes(randomSubject.name) || !randomSubject.systems.cijfers) {
                        break;
                    }
                }
                usedSubjects.push(randomSubject.name);
                subjects.push(randomSubject);
                html += '<div class="mod-item"><div>' + randomSubject.icon + '</div><p>' + randomSubject.name + '</p>' + window.getIcon('grip-vertical', null, 'var(--text-weak)') + '</div>';
            }
            cn('recap-page', 0).innerHTML = '<h1>Wat zijn je beste vakken?</h1><h2>Sorteer je vakken op basis van je gemiddelde</h2><div id="mod-grade-average-sort-list">' + html + '</div><a id="recap-nextpage">Volgende</a>';

            const list = document.getElementById('mod-grade-average-sort-list');
            let draggingEle;
            let placeholder;
            let isDraggingStarted = false;
            let x = 0;
            let y = 0;
            const swap = function (nodeA, nodeB) {
                const parentA = nodeA.parentNode;
                const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;
                nodeB.parentNode.insertBefore(nodeA, nodeB);
                parentA.insertBefore(nodeB, siblingA);
            };
            const isAbove = function (nodeA, nodeB) {
                const rectA = nodeA.getBoundingClientRect();
                const rectB = nodeB.getBoundingClientRect();
                return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
            };
            const mouseDownHandler = function (e) {
                if (e.target.classList.contains('mod-item')) {
                    draggingEle = e.target;
                } else if (e.target.parentElement.classList.contains('mod-item')) {
                    draggingEle = e.target.parentElement;
                } else if (e.target.parentElement.parentElement.classList.contains('mod-item')) {
                    draggingEle = e.target.parentElement.parentElement;
                }
                const rect = draggingEle.getBoundingClientRect();
                if (e.touches == null || e.touches[0] == null) {
                    x = e.pageX - rect.left;
                    y = e.pageY - rect.top;
                }
                else {
                    x = e.touches[0].pageX - rect.left;
                    y = e.touches[0].pageY - rect.top;
                }
                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('touchmove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
                document.addEventListener('touchend', mouseUpHandler);
            };
            const mouseMoveHandler = function (e) {
                const draggingRect = draggingEle.getBoundingClientRect();
                if (!isDraggingStarted) {
                    isDraggingStarted = true;
                    placeholder = document.createElement('div');
                    placeholder.classList.add('placeholder');
                    draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
                    placeholder.style.height = '23px';
                }
                draggingEle.style.position = 'absolute';
                if (e.touches == null || e.touches[0] == null) {
                    draggingEle.style.top = (e.pageY - y) + 'px';
                    draggingEle.style.left = (e.pageX - x) + 'px';
                }
                else {
                    draggingEle.style.top = (e.touches[0].pageY - y) + 'px';
                    draggingEle.style.left = (e.touches[0].pageX - x) + 'px';
                }
                const prevEle = draggingEle.previousElementSibling;
                const nextEle = placeholder.nextElementSibling;
                if (prevEle && isAbove(draggingEle, prevEle)) {
                    swap(placeholder, draggingEle);
                    swap(placeholder, prevEle);
                    return;
                }
                if (nextEle && isAbove(nextEle, draggingEle)) {
                    swap(nextEle, placeholder);
                    swap(nextEle, draggingEle);
                }
            };
            const mouseUpHandler = function () {
                placeholder && placeholder.parentNode && placeholder.parentNode.removeChild(placeholder);
                draggingEle.style.removeProperty('top');
                draggingEle.style.removeProperty('left');
                draggingEle.style.removeProperty('position');
                x = null;
                y = null;
                draggingEle = null;
                isDraggingStarted = false;
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('touchmove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
                document.removeEventListener('touchend', mouseUpHandler);
            };
            [].slice.call(list.querySelectorAll('.mod-item')).forEach(function (item) {
                item.addEventListener('mousedown', mouseDownHandler);
                item.addEventListener('touchstart', mouseDownHandler);
            });

            let clicked = false;
            let answerInterval;
            let audioHasFired = false;
            id('recap-nextpage').addEventListener('click', function () {
                if (clicked) {
                    if (answerInterval != null) {
                        clearInterval(answerInterval);
                    }
                    closeRecapPage();
                    return;
                }
                function checkAnswers(first = false) {
                    if (n(id('mod-grade-average-sort-list'))) {
                        clearInterval(answerInterval);
                        return;
                    }
                    let orderedSubjects = subjects.slice();
                    const loopCount = orderedSubjects.length;
                    let correct = true;
                    for (var i = 0; i < loopCount; i++) {
                        let maxGrade = 0;
                        let maxGradeIndex = 0;
                        for (var j = 0; j < orderedSubjects.length; j++) {
                            if (orderedSubjects[j].average > maxGrade) {
                                maxGrade = orderedSubjects[j].average;
                                maxGradeIndex = j;
                            }
                        }
                        // Correct
                        const pElement = id('mod-grade-average-sort-list').getElementsByClassName('mod-item')[i].getElementsByTagName('p')[0];
                        if (pElement.innerText == orderedSubjects[maxGradeIndex].name) {
                            pElement.classList.remove('wrong');
                            pElement.classList.add('right');
                            if (first) {
                                pElement.insertAdjacentHTML('afterend', '<p>' + orderedSubjects[maxGradeIndex].average.toString().replace('.', ',') + '</p>');
                            }
                        }
                        // Wrong
                        else {
                            correct = false;
                            let subjectAverage = '';
                            for (const subject of subjects) {
                                if (subject.name == pElement.innerText) {
                                    subjectAverage = subject.average.toString().replace('.', ',');
                                    break;
                                }
                            }
                            pElement.classList.remove('right');
                            pElement.classList.add('wrong');
                            if (first) {
                                pElement.insertAdjacentHTML('afterend', '<p>' + subjectAverage + '</p>');
                            }
                        }
                        if (!audioHasFired) {
                            audioHasFired = true;
                            if (correct) {
                                try {
                                    new Audio(window.getAudioUrl('correct')).play();
                                }
                                catch (e) {
                                    console.warn(e);
                                }
                                startConfetti();
                                setTimeout(stopConfetti, 750);
                            }
                            else {
                                try {
                                    new Audio(window.getAudioUrl('error')).play();
                                }
                                catch (e) {
                                    console.warn(e);
                                }
                            }
                        }
                        orderedSubjects.splice(maxGradeIndex, 1);
                    }
                }
                checkAnswers(true);
                answerInterval = setInterval(checkAnswers, 50);
                setTimeout(function () {
                    clicked = true;
                }, 100);
            });
        }
        function closeRecapPage() {
            id('recap-progress').insertAdjacentHTML('beforeend', '<div></div>');
            cn('recap-page', 0).classList.add('recap-closing');
            setTimeout(function () {
                cn('recap-page', 0).classList.remove('recap-closing');
            }, 350);
            pages++;
            let i;
            if (pages > 8) {
                pages = 8;
            }
            switch (pages) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    music.volume = 1;
                    if (availablePages.length > 0) {
                        i = Math.round(Math.random() * (availablePages.length - 1));
                        availablePages[i]();
                        availablePages.splice(i, 1);
                        break;
                    }
                    else {
                        pages = 7;
                    }
                case 7:
                    award();
                    break;
                case 8:
                    finish();
                    break;
            }
        }
        function finish() {
            setTimeout(startConfetti, 100);
            cn('recap-page', 0).innerHTML = '<h1>Gefeliciteerd!</h1><h2>Het jaar zit erop en de vakantie is al in zicht.</h2><h3>Veel plezier in de vakantie en hopelijk tot volgend jaar!</h3><a id="recap-nextpage">Sluiten</a>';
            id('recap-nextpage').addEventListener('click', function () {
                // overzicht page causes menu to disappear on small devices, just reload cijfers page to prevent this bug
                if (document.documentElement.clientWidth < 1280) {
                    window.location.href = 'https://leerling.somtoday.nl/cijfers';
                    return;
                }
                setTimeout(function () {
                    tryRemove(id('somtoday-recap-wrapper'));
                    stopConfetti();
                    tn('body', 0).style.overflowX = 'hidden';
                    tn('body', 0).style.setProperty('overflow-y', 'scroll', 'important');
                    endMusic();
                }, 550);
                isRecapping = false;
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            });
            return;
        }
        async function endMusic() {
            let prev = music.volume;
            while (true) {
                if (music.volume > prev) {
                    break;
                }
                prev = music.volume;
                let newVolume = music.volume - 0.05;
                if (newVolume >= 0) {
                    music.volume = newVolume;
                }
                else {
                    music.pause();
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        function award() {
            let award = 'none';
            let description;
            let icon;
            let times = 0;
            while (award == 'none' && times < 50) {
                let min, max, i, subject, gradeVar;
                const randomAwardTry = Math.round(Math.random() * (13 - 1) + 1);
                switch (randomAwardTry) {
                    case 1:
                        // MEESTERBREIN AWARD
                        if (totalAverage && totalAverage > 8) {
                            award = 'meesterbrein';
                            description = 'je gemiddelde hoger is dan een 8';
                            icon = 'brain';
                        }
                        break;
                    case 2:
                        if (gradingSystems.cijfers) {
                            // STEADY AWARD
                            min = 10;
                            max = 0;
                            for (const subject of gradedata) {
                                for (const grade of subject.grades) {
                                    if (!isNaN(grade.cijfer)) {
                                        if (grade.cijfer > max) {
                                            max = grade.cijfer;
                                        }
                                        if (grade.cijfer < min) {
                                            min = grade.cijfer;
                                        }
                                    }
                                }
                            }
                            if ((max - min) < 2 && (max - min) > 0) {
                                award = 'steady';
                                description = 'het verschil tussen je hoogste en laagste punt minder dan 2 is';
                                icon = 'arrows-left-right';
                            }
                        }
                        break;
                    case 3:
                        // ALGEBRA AWARD
                        for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('wis') != -1 || subject.name.toLowerCase().indexOf('math') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'algebra';
                                    description = 'je een voldoende staat voor wiskunde';
                                    icon = 'calculator';
                                }
                                break;
                            }
                        }
                        break;
                    case 4:
                        // SCHEIKUNDE AWARD
                        for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('sch') != -1 || subject.name.toLowerCase().indexOf('chem') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'chemicus';
                                    description = 'je een voldoende staat voor scheikunde';
                                    icon = 'flask';
                                }
                                break;
                            }
                        }
                        break;
                    case 5:
                        // TAALGENIE AWARD
                        for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('fra') != -1 || subject.name.toLowerCase().indexOf('eng') != -1 || subject.name.toLowerCase().indexOf('dui') != -1 || subject.name.toLowerCase().indexOf('spa') != -1 || subject.name.toLowerCase().indexOf('eng') != -1 || subject.name.toLowerCase().indexOf('chi') != -1 || subject.name.toLowerCase().indexOf('taal') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'taalgenie';
                                    description = 'je een voldoende staat voor een taal';
                                    icon = 'earth-europe';
                                }
                                break;
                            }
                        }
                        break;
                    case 6:
                        // OUDHEID AWARD
                        for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('gri') != -1 || subject.name.toLowerCase().indexOf('gre') != -1 || subject.name.toLowerCase().indexOf('lat') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'oudheid';
                                    description = 'je een voldoende staat voor een klassieke taal';
                                    icon = 'landmark';
                                }
                                break;
                            }
                        }
                        break;
                    case 7:
                        // WETENSCHAPPER AWARD
                        for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('nat') != -1 || subject.name.toLowerCase().indexOf('phy') != -1 || subject.name.toLowerCase().indexOf('bio') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'wetenschapper';
                                    description = 'je een voldoende staat voor natuurkunde of biologie';
                                    icon = 'microscope';
                                }
                                break;
                            }
                        }
                        break;
                    case 8:
                        // ONTDEKKER AWARD
                        for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('aard') != -1 || subject.name.toLowerCase().indexOf('geo') != -1 || subject.name.toLowerCase().indexOf('ges') != -1 || subject.name.toLowerCase().indexOf('his') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'ontdekker';
                                    description = 'je een voldoende staat voor aardrijkskunde of geschiedenis';
                                    icon = 'map-location-dot';
                                }
                                break;
                            }
                        }
                        break;
                    case 9:
                        // FOCUSED AWARD
                        max = false;
                        i = 2;
                        for (const subject of gradedata) {
                            if (!isNaN(parseFloat(subject.average)) && parseFloat(subject[0]) >= 8.5) {
                                max = true;
                            }
                        }
                        if (max) {
                            award = 'gefocust';
                            description = 'je afgeronde gemiddelde van minstens &eacute;&eacute;n vak een 9 of hoger is';
                            icon = 'bullseye';
                        }
                        break;
                    case 10:
                        if (gradedata.length >= 15) {
                            award = 'drukte';
                            description = 'je 15 of meer vakken had';
                            icon = 'book';
                        }
                        break;
                    case 11:
                        // ARTIEST AWARD
                        for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('beeldend') != -1 || subject.name.toLowerCase().indexOf('kunst') != -1 || subject.name.toLowerCase().indexOf('art') != -1 || subject.name.toLowerCase().indexOf('vorming') != -1 || subject.name.toLowerCase().indexOf('ckv') != -1 || subject.name.toLowerCase().indexOf('kcv') != -1 || subject.name.toLowerCase().indexOf('cultuur') != -1 || subject.name.toLowerCase().indexOf('culturele') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'artiest';
                                    description = 'je een voldoende staat voor ' + subject.name;
                                    icon = 'palette';
                                }
                                break;
                            }
                        }
                        break;
                    case 12:
                        // SMART AWARD
                        let tens = 0;
                        if (gradingSystems.cijfers) {
                            for (const subject of gradedata) {
                                for (const grade of subject.grades) {
                                    if (!isNaN(grade) && grade == 10) {
                                        tens++;
                                    }
                                }
                            }
                            if (tens >= 3) {
                                award = 'smart';
                                description = 'je 3 keer een tien hebt gehaald dit jaar';
                                icon = 'brain';
                            }
                        }
                        break;
                    case 13:
                        award = 'vakantie';
                        description = 'het nu alweer bijna zomervakantie is';
                        icon = 'sun';
                        break;
                }
                times++;
            }
            if (award == 'none') {
                award = 'vakantie';
                description = "het nu alweer bijna zomervakantie is";
                icon = 'sun';
            }
            cn('recap-page', 0).innerHTML = '<div id="award-wrapper">' + window.getIcon(icon, null, '#1f86f6') + '</div><h1>AWARD!</h1><h2>Je hebt het dit jaar weer geweldig gedaan.</h2><h3>Omdat ' + description + ' krijg je de ' + award + '-award.</h3><a id="recap-nextpage">Volgende</a>';
            id('recap-nextpage').addEventListener('click', closeRecapPage);
            setTimeout(function () {
                try {
                    new Audio(window.getAudioUrl('tada')).play();
                }
                catch (e) {
                    console.warn(e);
                }
            }, 1000);
        }
        function busyYear() {
            if (totalGrades > 15) {
                cn('recap-page', 0).innerHTML = '<h1>' + (pages > 1 ? 'En w' : 'W') + 'at was het toch een druk jaar 😅</h1><h2>Je hebt in totaal <i>' + totalGrades + '</i> ' + (totalGrades == 1 ? 'cijfer' : 'cijfers') + ' gekregen met een totale weging van maar liefst <i>' + totalWeight + '</i>!</h2><h3>Dat is wel een applausje waard!</h3><a id="recap-nextpage">Volgende</a>';
            }
            else {
                cn('recap-page', 0).innerHTML = '<h1>Lekker rustig jaartje 😎</h1><h2>Je hebt in totaal <i>' + totalGrades + '</i> ' + (totalGrades == 1 ? 'cijfer' : 'cijfers') + ' gekregen met een totale weging van <i>' + totalWeight + '</i>!</h2><h3>Dat is relaxed door het jaar heen gaan!</h3><a id="recap-nextpage">Volgende</a>';
            }
            id('recap-nextpage').addEventListener('click', closeRecapPage);
        }
        function subjectsHigh() {
            let highest = Number.MIN_SAFE_INTEGER, highestName, secondHighest, secondHighestName;
            for (const subject of gradedata) {
                if (subject.systems.cijfers) {
                    for (const grade of subject.grades) {
                        if (!isNaN(grade.cijfer) && grade.cijfer >= highest) {
                            if (highestName) {
                                secondHighest = highest;
                                secondHighestName = highestName;
                            }
                            highest = grade.cijfer;
                            highestName = subject.name;
                        }
                    }
                }
            }
            if (highest >= 5.5 && (secondHighest == null || secondHighest >= 5.5)) {
                cn('recap-page', 0).innerHTML = '<h1>' + (pages > 1 ? 'En w' : 'W') + 'at heb je toch goede cijfers gehaald </h1><h2>Toen je een <i>' + highest + '</i> haalde voor ' + highestName + ' was je echt de uitblinker van de klas ✨</h2>' + (secondHighest ? '<h3>En vergeet ook niet de <i>' + secondHighest + '</i> die je voor ' + secondHighestName + ' haalde!</h3>' : '') + '<a id="recap-nextpage">Volgende</a>';
            }
            else {
                cn('recap-page', 0).innerHTML = '<h1>Laten we naar je cijfers kijken</h1><h2>Daar is wel wat ruimte voor verbetering 😅. Je hoogste cijfer is een <i>' + highest + '</i> voor ' + highestName + '.</h2>' + (secondHighest ? '<h3>En je op een na hoogste een <i>' + secondHighest + '</i> die je voor ' + secondHighestName + ' kreeg.</h3>' : '') + '<a id="recap-nextpage">Volgende</a>';
            }
            id('recap-nextpage').addEventListener('click', closeRecapPage);
        }
        function subjectsLow() {
            let lowest = Number.MAX_SAFE_INTEGER, lowestName, lowestAverage;
            for (const subject of gradedata) {
                if (subject.systems.cijfers) {
                    for (const grade of subject.grades) {
                        if (!isNaN(grade.cijfer) && grade.cijfer < lowest) {
                            lowest = grade.cijfer;
                            lowestName = subject.name;
                            lowestAverage = subject.average;
                        }
                    }
                }
            }
            if (lowest < 5.5) {
                cn('recap-page', 0).innerHTML = '<h1>Soms was een toets vervelend 😓</h1><h2>Sommige toetsen zijn veel te moeilijk. Zoals de toets waarbij je een <i>' + lowest + '</i> haalde voor ' + lowestName + '.</h2><h3>' + (lowestAverage < 5.5 ? 'Toch heb je dit nog wel wat omhoog weten te halen naar een <i>' + lowestAverage + '</i>.' : 'Gelukkig bleef je doorzetten en sta je nu toch voldoende met een gemiddelde van <i>' + lowestAverage + '</i>!') + '</h3><a id="recap-nextpage">Volgende</a>';
            }
            else {
                cn('recap-page', 0).innerHTML = '<h1>Wow, alleen maar voldoendes!</h1><h2>Je hebt geen enkele onvoldoende gekregen dit jaar 🥳! Je laagste cijfer was een <i>' + lowest + '</i> voor ' + lowestName + '.</h2><h3>Ondanks dat ' + lowestName + ' soms lastig is, is je gemiddelde voor dit vak een <i>' + lowestAverage + '</i>!</h3><a id="recap-nextpage">Volgende</a>';
            }
            id('recap-nextpage').addEventListener('click', closeRecapPage);
        }
        function twoTrueOneFalse() {
            // Determine which one is a lie
            let i = 0;
            // average
            let averageSubject = gradedata[Math.round(Math.random() * (gradedata.length - 1))];
            let average = averageSubject.average;
            let replacementSubject, replacement = 0;
            if (n(average)) {
                replacementSubject = averageSubject;
                for (const cijfer of replacementSubject.grades) {
                    replacement += cijfer.weging;
                }
            }
            // grade
            let gradeSubject = gradedata[Math.round(Math.random() * (gradedata.length - 1))];
            let grade = gradeSubject.grades[Math.round(Math.random() * (gradeSubject.grades.length - 1))].cijfer;
            // amount
            let amountSubject = gradedata[Math.round(Math.random() * (gradedata.length - 1))];
            let amount = amountSubject.gradeCount;
            let real;
            let random = Math.round(Math.random() * (3 - 1) + 1);
            switch (random) {
                case 1:
                    if (replacementSubject) {
                        real = replacement;
                        const randomNumber = Math.floor(Math.random() * (3 - -3 + 1) + -3);
                        replacement += randomNumber == 0 ? 1 : randomNumber;
                        break;
                    }
                    real = average;
                    if (isNaN(parseFloat(average))) {
                        let choices;
                        if (average.indexOf('+') != -1 || average.indexOf('-') != -1) {
                            choices = ['+', '-', '-/+'];
                        }
                        else if (average.indexOf('A') != -1 || average.indexOf('B') != -1 || average.indexOf('N') != -1 || average.indexOf('L') != -1) {
                            choices = ['A', 'B', 'N', 'L'];
                        }
                        else {
                            choices = ['O', 'V', 'G'];
                        }
                        choices = choices.filter(item => item !== average);
                        average = choices[Math.round(Math.random() * (choices.length - 1))];
                    }
                    else {
                        const add = Math.round(Math.random() * (2 - 0.5) + 0.5 * 100) / 100;
                        average += add == 0 ? 0.1 : add;
                        average = average.toFixed(2);
                    }
                    break;
                case 2:
                    real = grade;
                    if (gradeSubject.systems.cijfers) {
                        if (isNaN(grade)) {
                            for (const gradeInList of gradeSubject.grades) {
                                if (gradeInList && !isNaN(gradeInList)) {
                                    grade = gradeInList;
                                    break;
                                }
                            }
                        }
                        real = grade;
                        i = 0;
                        while (true) {
                            grade += Math.round(Math.random() * (1 + 1) - 1 * 10) / 10;

                            let gradeInGradeList = false;
                            for (const gradeInList of gradeSubject.grades) {
                                if (gradeInList.cijfer == grade) {
                                    gradeInGradeList = true;
                                    break;
                                }
                            }
                            if (!gradeInGradeList && real != grade) {
                                break;
                            }

                            // HOW DID THIS HAPPEN?!?
                            if (i > 100) {
                                grade = Math.PI.toFixed(5);
                                break;
                            }

                            i++;
                        }
                        grade = grade.toFixed(1);
                    }
                    else {
                        let choices;
                        if (gradeSubject.systems.plusmin) {
                            choices = ['+', '-', '-/+'];
                        }
                        else if (gradeSubject.systems.voortgang) {
                            choices = ['A', 'B', 'N', 'L'];
                        }
                        else if (gradeSubject.systems.letters) {
                            choices = ['O', 'V', 'G'];
                        }
                        for (const gradeInList of gradeSubject.grades) {
                            choices = choices.filter(item => item !== gradeInList.cijfer);
                        }
                        if (choices.length == 0) {
                            grade = Math.PI.toFixed(5);
                        }
                        else {
                            grade = choices[Math.round(Math.random() * (choices.length - 1))];
                        }
                    }
                    break;
                case 3:
                    real = amount;
                    i = 0;
                    while (real == amount) {
                        if (i > 100) {
                            if (isNaN(amount)) {
                                amount = 0;
                            }
                            else {
                                amount += 1;
                            }
                            break;
                        }
                        amount += Math.round(Math.random() * (2 + 2) - 2);
                        i++;
                    }
                    break;
            }
            cn('recap-page', 0).innerHTML = '<h1>Kies een van de opties.</h1><h2>Welke van de volgende opties klopt niet? 🤔</h2><label><input type="checkbox" id="recap-option-1"/><p>' + (replacementSubject ? 'Je cijfers voor ' + replacementSubject.name + ' hebben een totale weging van <span class="number">' + replacement + '</span><span class="correction"></span>' : 'Je staat een <span class="number">' + average + '</span><span class="correction"></span> voor ' + averageSubject.name) + '</p></label><label><input type="checkbox" id="recap-option-2"/><p>Je hebt een <span class="number">' + grade + '</span><span class="correction"></span> voor ' + gradeSubject.name + ' gehaald</p></label><label><input type="checkbox" id="recap-option-3"/><p>Je hebt <span class="number">' + amount + '</span><span class="correction"></span> ' + (amount == 1 ? 'cijfer' : 'cijfers') + ' voor ' + amountSubject.name + ' gehaald</p></label><a id="recap-nextpage">Controleren</a>';
            let clicked = false;
            id('recap-nextpage').addEventListener('click', function () {
                if (clicked) {
                    closeRecapPage();
                    return;
                }
                if (!id('recap-option-1').checked && !id('recap-option-2').checked && !id('recap-option-3').checked) {
                    return;
                }
                id('recap-option-1').parentElement.style.pointerEvents = 'none';
                id('recap-option-2').parentElement.style.pointerEvents = 'none';
                id('recap-option-3').parentElement.style.pointerEvents = 'none';
                if (id('recap-option-' + random).checked) {
                    clicked = true;
                    id('recap-option-' + random).parentElement.classList.add('right');
                    id('recap-option-' + random).parentElement.getElementsByClassName('correction')[0].innerHTML = ' ' + real;
                    this.innerHTML = 'Volgende';
                    try {
                        new Audio(window.getAudioUrl('correct')).play();
                    }
                    catch (e) {
                        console.warn(e);
                    }
                    startConfetti();
                    setTimeout(stopConfetti, 750);
                }
                else {
                    try {
                        new Audio(window.getAudioUrl('error')).play();
                    }
                    catch (e) {
                        console.warn(e);
                    }
                    clicked = true;
                    if (id('recap-option-1').checked) {
                        id('recap-option-1').parentElement.classList.add('wrong');
                    }
                    if (id('recap-option-2').checked) {
                        id('recap-option-2').parentElement.classList.add('wrong');
                    }
                    if (id('recap-option-3').checked) {
                        id('recap-option-3').parentElement.classList.add('wrong');
                    }
                    id('recap-option-' + random).parentElement.classList.add('right');
                    id('recap-option-' + random).parentElement.getElementsByClassName('correction')[0].innerHTML = ' ' + real;
                    this.innerHTML = 'Volgende';
                }
            });
            id('recap-option-1').addEventListener('change', function () { id('recap-option-2').checked = false; id('recap-option-3').checked = false; });
            id('recap-option-2').addEventListener('change', function () { id('recap-option-1').checked = false; id('recap-option-3').checked = false; });
            id('recap-option-3').addEventListener('change', function () { id('recap-option-1').checked = false; id('recap-option-2').checked = false; });
        }
        function overgangsCheck() {
            let distribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let tekorten = 0, compensatie = 0;
            let kernvakken_onvoldoende = [];
            let kernvakken_5_of_hoger = [];
            let alle_vakken_4_of_hoger = [];
            let onvoldoendes = [];
            let overgang = 100;
            for (const subject of gradedata) {
                if (!isNaN(parseFloat(subject.average))) {
                    const average = Math.round(subject.average);
                    const kernvak = subject.name.toLowerCase().indexOf('wiskunde') != -1 && subject.name.toLowerCase().indexOf('nederlands') != -1 && subject.name.toLowerCase().indexOf('engels') != -1;
                    tekorten += Math.max(6 - average, 0);
                    compensatie += Math.max(average - 6, 0);
                    if (average < 6 && kernvak) {
                        kernvakken_onvoldoende.push(subject);
                        if (kernvakken_onvoldoende.length > 1) {
                            overgang -= 25;
                        }
                    }
                    if (average < 5 && kernvak) {
                        kernvakken_5_of_hoger.push(subject);
                        overgang -= 25;
                    }
                    if (average < 4) {
                        alle_vakken_4_of_hoger.push(subject);
                        overgang -= (tekorten - 2) * 25;
                    }
                    if (average <= 5) {
                        onvoldoendes.push(subject);
                    }
                }
                for (const grade of subject.grades) {
                    if (!isNaN(parseFloat(grade.cijfer))) {
                        distribution[Math.round(grade.cijfer) - 1]++;
                    }
                }
            }
            if (tekorten > 3) {
                overgang -= 50 * (tekorten - 3);
            }
            else {
                overgang -= 2 * tekorten;
            }
            if (tekorten > 1 && tekorten > compensatie) {
                overgang -= 25 * (tekorten - compensatie);
            }
            if (overgang > 0 && overgang < 95) {
                overgang += Math.floor(Math.random() * (5 + 1))
            }
            overgang = Math.max(overgang, 5); // never 0%, because this makes people angry :(
            overgang = Math.min(overgang, 99); // never 100%, because this makes people disappointed if incorrect
            cn('recap-page', 0).innerHTML = '<h1>' + overgang + '% kans om over te gaan</h1><h2>' + (overgang == 100 ? 'Met deze flawless cijferlijst ga je natuurlijk zeker weten over! ✅' : (overgang > 75 ? 'Prima gedaan! Af en toe een onvoldoende halen kan gebeuren, maar dat zit jou nooit in de weg! 🙃' : (overgang > 50 ? 'Redelijke cijferlijst, al voldoe je niet aan alle overgangsnormen.' : (overgang >= 25 ? 'Hmm, dat gaat een taai overgangsgesprek worden. Maar jij kan dit! Veel succes!' : 'Hmm, dat gaat een taai overgangsgesprek worden. Hopelijk komt het goed voor je.')))) + '</h3><br><br><div id="recap-chart-wrapper"><canvas id="recap-chart" width="350" height="350"></canvas></div><a id="recap-nextpage">Doorgaan</a>';
            id('recap-nextpage').addEventListener('click', closeRecapPage);
            if (distribution[9] + distribution[8] + distribution[7] + distribution[6] + distribution[5] + distribution[4] + distribution[3] + distribution[2] + distribution[1] + distribution[0] == 0) {
                id('recap-chart').remove();
                return;
            }
            Chart.defaults.color = '#fff';
            let recapCanvas = document.getElementById('recap-chart');
            let recapCtx = recapCanvas.getContext('2d');
            let recapChart = new Chart(recapCtx, {
                type: 'doughnut',
                data: {
                    labels: ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'],
                    datasets: [{
                        data: [distribution[9], distribution[8], distribution[7], distribution[6], distribution[5], distribution[4], distribution[3], distribution[2], distribution[1], distribution[0]],
                        backgroundColor: [
                            '#317256',
                            '#419873',
                            '#52BF90',
                            '#82C96D',
                            '#CBE07E',
                            '#EBDE7C',
                            '#FAB061',
                            '#EB6963',
                            '#CC4533',
                            '#AB4141',
                        ],
                        borderWidth: 0,
                    }],
                },
                options: {
                    responsive: false,
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                },
            });
        }
        function onvoldoendeGraph() {
            let voldoende = 0, onvoldoende = 0;
            for (const subject of gradedata) {
                if (subject.systems.cijfers) {
                    for (const grade of subject.grades) {
                        if (!isNaN(parseFloat(grade.cijfer))) {
                            if (grade.cijfer >= 5.5) {
                                voldoende++;
                            }
                            else {
                                onvoldoende++;
                            }
                        }
                    }
                }
            }
            let percentage = Math.max(voldoende, 1) / Math.max(onvoldoende, 1) * 100;
            cn('recap-page', 0).innerHTML = '<h1>' + (percentage > 85 ? 'Voldoende?!? JA!' : (percentage > 50 ? 'Voldoendes?' : 'Hmmm...')) + '</h1><h2>' + (percentage > 85 ? 'Natuurlijk heb je dit jaar weer veel voldoendes gehaald!' : (percentage > 50 ? 'Jazeker! Je hebt meer dan de helft voldoende!' : 'Dat is niet zo best. Volgend jaar beter?')) + '</h3><br><br><div id="recap-chart-wrapper"><canvas id="recap-chart" width="300" height="300"></canvas></div><a id="recap-nextpage">Doorgaan</a>';
            Chart.defaults.color = '#fff';
            let recapCanvas = document.getElementById('recap-chart');
            let recapCtx = recapCanvas.getContext('2d');
            let recapChart = new Chart(recapCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Voldoende', 'Onvoldoende'],
                    datasets: [{
                        data: [voldoende, onvoldoende],
                        backgroundColor: [
                            'rgb(144, 255, 194)',
                            'rgb(255, 163, 171)',
                        ],
                        borderWidth: 0,
                    }],
                },
                options: {
                    responsive: false,
                },
            });
            id('recap-nextpage').addEventListener('click', closeRecapPage);
        }
        function completedGraph() {
            let a = 0, b = 0, n = 0, l = 0;
            for (const subject of gradedata) {
                if (subject.systems.voortgang) {
                    for (const grade of subject.grades) {
                        if (grade.cijfer.toString().indexOf('A') != -1) {
                            a++;
                        }
                        if (grade.cijfer.toString().indexOf('B') != -1) {
                            b++;
                        }
                        if (grade.cijfer.toString().indexOf('N') != -1) {
                            n++;
                        }
                        if (grade.cijfer.toString().indexOf('L') != -1) {
                            l++;
                        }
                    }
                }
            }
            cn('recap-page', 0).innerHTML = '<h1>Doel gehaald! 🎯</h1><h2>Goed gedaan! Ook dit jaar is weer voorbij!</h2><h3>Hoeveel proefwerken en opdrachten heb je wel niet gemaakt? Veel.</h3><br><br><div id="recap-chart-wrapper"><canvas id="recap-chart" width="300" height="300"></canvas></div><a id="recap-nextpage">Doorgaan</a>';
            Chart.defaults.color = '#fff';
            let recapCanvas = document.getElementById('recap-chart');
            let recapCtx = recapCanvas.getContext('2d');
            let recapChart = new Chart(recapCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Afgerond', 'Bijna', 'Niet afgerond', 'Lopend'],
                    datasets: [{
                        data: [a, b, n, l],
                        backgroundColor: [
                            'rgb(144, 255, 194)',
                            'rgb(255, 235, 171)',
                            'rgb(255, 163, 171)',
                            'rgb(100, 171, 255)',
                        ],
                        borderWidth: 0,
                    }],
                },
                options: {
                    responsive: false,
                },
            });
            id('recap-nextpage').addEventListener('click', closeRecapPage);
        }
        function plusMinGraph() {
            let plus = 0, min = 0, plusmin = 0;
            for (const subject of gradedata) {
                if (subject.systems.plusmin) {
                    for (const grade of subject.grades) {
                        const containsPlus = grade.cijfer.toString().indexOf('+') != -1;
                        const containsMin = grade.cijfer.toString().indexOf('-') != -1;
                        if (containsPlus && containsMin) {
                            plusmin++;
                        }
                        else if (containsPlus) {
                            plus++;
                        }
                        else if (containsMin) {
                            min++;
                        }
                    }
                }
            }
            cn('recap-page', 0).innerHTML = '<h1>Je krijgt een dikke plus!</h1><h2>' + (plus > min ? 'Ook dit jaar zijn er weer flink wat plussen uitgedeeld!' : (plus < min ? 'De minnen overtroffen dit jaar helaas de plussen... Maar niet getreurd, want je hebt toch nog ' + plus + ' plussen bij elkaar weten te verzamelen! Goed gedaan!' : 'Het is een gelijkspel! Je hebt precies evenveel plussen als minnen!')) + '</h2><br><br><div id="recap-chart-wrapper"><canvas id="recap-chart"></canvas></div><a id="recap-nextpage">Doorgaan</a>';
            Chart.defaults.color = '#fff';
            let recapCanvas = document.getElementById('recap-chart');
            let recapCtx = recapCanvas.getContext('2d');
            let recapChart = new Chart(recapCtx, {
                type: 'bar',
                data: {
                    labels: ['+', '-', '-/+'],
                    datasets: [{
                        data: [plus, min, plusmin],
                        backgroundColor: [
                            'rgb(144, 255, 194)',
                            'rgb(255, 163, 171)',
                            'rgb(255, 235, 171)',
                        ],
                        borderRadius: 8,
                    }],
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                },
            });
            id('recap-nextpage').addEventListener('click', closeRecapPage);
        }
        function guessTheGraph() {
            cn('recap-page', 0).innerHTML = '<h1>Van welk vak is deze grafiek?</h1><h2>Van welk vak denk je dat de onderstaande grafiek is?</h2><div id="recap-chart-wrapper"><canvas id="recap-chart"></canvas></div><label><input type="checkbox" id="recap-option-1"/><p id="recap-text-1"></p></label><label><input type="checkbox" id="recap-option-2"/><p id="recap-text-2"></p></label><label><input type="checkbox" id="recap-option-3"/><p id="recap-text-3"></p></label><a id="recap-nextpage">Controleren</a>';
            let chosenSubject = gradedata[Math.round(Math.random() * (gradedata.length - 1))];
            while (!chosenSubject.systems.cijfers) {
                chosenSubject = gradedata[Math.round(Math.random() * (gradedata.length - 1))];
            }
            gradeGraphs(chosenSubject);
            const random = Math.round(Math.random() * (3 - 1) + 1);
            id('recap-option-' + random).innerHTML = chosenSubject.name;
            let fakeOptionOne = gradedata[Math.round(Math.random() * (gradedata.length - 1))].name;
            let i = 0;
            const subjectArray = ['Aardrijkskunde', 'Geschiedenis', 'Nederlands', 'Engels', 'Frans', 'Natuurkunde', 'Wiskunde', 'Biologie', 'Scheikunde'];
            while (fakeOptionOne == chosenSubject.name) {
                if (i > 100) {
                    fakeOptionOne = subjectArray[Math.floor(Math.random() * subjectArray.length)];
                    break;
                }
                fakeOptionOne = gradedata[Math.round(Math.random() * (gradedata.length - 1))].name;
                i++;
            }
            i = 0;
            let fakeOptionTwo = gradedata[Math.round(Math.random() * (gradedata.length - 1))].name;
            while (fakeOptionTwo == chosenSubject.name || fakeOptionTwo == fakeOptionOne) {
                if (i > 100) {
                    fakeOptionTwo = subjectArray[Math.floor(Math.random() * subjectArray.length)];
                    break;
                }
                fakeOptionTwo = gradedata[Math.round(Math.random() * (gradedata.length - 1))].name;
                i++;
            }
            id('recap-text-' + random).innerHTML = chosenSubject.name;
            switch (random) {
                case 1:
                    id('recap-text-2').innerHTML = fakeOptionOne;
                    id('recap-text-3').innerHTML = fakeOptionTwo;
                    break;
                case 2:
                    id('recap-text-1').innerHTML = fakeOptionOne;
                    id('recap-text-3').innerHTML = fakeOptionTwo;
                    break;
                case 3:
                    id('recap-text-1').innerHTML = fakeOptionOne;
                    id('recap-text-2').innerHTML = fakeOptionTwo;
                    break;
            }
            let clicked = false;
            id('recap-nextpage').addEventListener('click', function () {
                if (clicked) {
                    closeRecapPage();
                    return;
                }
                if (!id('recap-option-1').checked && !id('recap-option-2').checked && !id('recap-option-3').checked) {
                    return;
                }
                if (id('recap-option-' + random).checked) {
                    clicked = true;
                    id('recap-option-' + random).parentElement.classList.add('right');
                    this.innerHTML = 'Volgende';
                    try {
                        new Audio(window.getAudioUrl('correct')).play();
                    }
                    catch (e) {
                        console.warn(e);
                    }
                    startConfetti();
                    setTimeout(stopConfetti, 750);
                }
                else {
                    try {
                        new Audio(window.getAudioUrl('error')).play();
                    }
                    catch (e) {
                        console.warn(e);
                    }
                    clicked = true;
                    if (id('recap-option-1').checked) {
                        id('recap-option-1').parentElement.classList.add('wrong');
                    }
                    if (id('recap-option-2').checked) {
                        id('recap-option-2').parentElement.classList.add('wrong');
                    }
                    if (id('recap-option-3').checked) {
                        id('recap-option-3').parentElement.classList.add('wrong');
                    }
                    id('recap-option-' + random).parentElement.classList.add('right');
                    this.innerHTML = 'Volgende';
                }
            });
            id('recap-option-1').addEventListener('change', function () { id('recap-option-2').checked = false; id('recap-option-3').checked = false; });
            id('recap-option-2').addEventListener('change', function () { id('recap-option-1').checked = false; id('recap-option-3').checked = false; });
            id('recap-option-3').addEventListener('change', function () { id('recap-option-1').checked = false; id('recap-option-2').checked = false; });
        }
    }

    // MODSETTINGS

    // Open modsettings
    let themeCount = 0;
    function openSettings() {
        tryRemove(id('mod-setting-panel'));
        // Check if account modal is opened
        if (tn('sl-account-modal', 0)) {
            setTimeout(function () {
                // Set modsettings text
                if (tn('sl-account-modal-header', 1) && tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0]) {
                    tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0].dataset.originalText = tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0].innerHTML;
                    setHTML(tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0], 'Mod-instellingen');
                }
                // Make opening modsettings multiple times work
                if (document.documentElement.clientWidth <= 767 && tn('sl-account-modal', 0).getElementsByClassName('container')[0]) {
                    if (!tn('sl-account-modal', 0).getElementsByClassName('container')[0].classList.contains('show-details')) {
                        if (tn('sl-account-modal-tab', 0).classList.contains('active')) {
                            tn('sl-account-modal-tab', 1).click();
                        }
                        else {
                            tn('sl-account-modal-tab', 0).click();
                        }
                        openSettings();
                    }
                }
            }, 10);
            if (n(tn('sl-account-modal', 0).getElementsByClassName('content')[0])) {
                tn('sl-account-modal', 0).insertAdjacentHTML('beforeend', '<div class="content" style="padding: 20px 40px;"></div>');
            }
            if (tn('sl-account-modal', 0).getElementsByClassName('content')[0] && tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0] && tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].children[0]) {
                tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].children[0].inert = true;
            }
            if (tn('sl-account-modal', 0).getElementsByClassName('ng-star-inserted active')[0]) {
                tn('sl-account-modal', 0).getElementsByClassName('ng-star-inserted active')[0].classList.remove('active');
            }
            if (n(tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0])) {
                tn('sl-account-modal', 0).getElementsByClassName('content')[0].insertAdjacentHTML('beforeend', '<div></div>');
                if (tn('sl-account-modal-tab', 0).classList.contains('active')) {
                    tn('sl-account-modal-tab', 1).click();
                }
                else {
                    tn('sl-account-modal-tab', 0).click();
                }
            }
            if (id('mod-setting-button')) {
                id('mod-setting-button').classList.add('active');
            }
            else {
                execute([insertModSettingLink]);
            }


            // Nicknames
            let nicknames = `
            <h3>Nicknames</h3>
            <p>Verander de naam van docenten in Somtoday. HTML is ondersteund.</p>
            <p>Vul de docentnaam precies in als op de berichtenpagina ("Dhr. E.X. Ample"). Vul bij de afkorting de docentafkorting in die in het rooster staat als je op een les klikt (optioneel). Vul tenslotte in welke nickname je deze docent wil geven.</p>
            <div id="nickname-wrapper">`;
            let nicknameArray = parseJSON(get('nicknames'));
            if ((nicknameArray instanceof Array) == false) {
                nicknameArray = [];
                set('nicknames', '[]');
            }
            nicknameArray.push(['', '', '']);
            for (const nickname of nicknameArray) {
                if (nickname.length == 2 || nickname.length == 3) {
                    const teacherName = sanitizeString(nickname[0]);
                    const teacherAbbreviation = sanitizeString(nickname[2] ?? '');
                    const teacherNickname = sanitizeString(nickname[1]);
                    nicknames += `
                    <div>
                        <input type="text" placeholder="Docentnaam" value="${teacherName}">
                        <input type="text" placeholder="Afkorting" value="${teacherAbbreviation}">
                        <input type="text" placeholder="Nickname" value="${teacherNickname}">
                    </div>`;
                }
            }
            nicknames += `
            </div>
            <div class="br"></div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
                <div tabindex="0" class="mod-button" onclick="
                    document.getElementById('nickname-wrapper').insertAdjacentHTML('beforeend', \`
                    <div>
                        <input type=\\'text\\' placeholder=\\'Docentnaam\\'>
                        <input type=\\'text\\' placeholder=\\'Afkorting\\'>
                        <input type=\\'text\\' placeholder=\\'Nickname\\'>
                    </div>\`);
                ">${window.getIcon('plus', null, 'var(--fg-on-primary-weak)')}Nickname toevoegen</div>
                <div tabindex="0" class="mod-button" onclick="
                    document.getElementById('nickname-wrapper').innerHTML = \`
                    <div>
                        <input type=\\'text\\' placeholder=\\'Docentnaam\\'>
                        <input type=\\'text\\' placeholder=\\'Afkorting\\'>
                        <input type=\\'text\\' placeholder=\\'Nickname\\'>
                    </div>\`;
                ">${window.getIcon('rotate-left', null, 'var(--fg-on-primary-weak)')}Reset</div>
            </div>`;

            // Update details for multiple versions
            const updatechecker = `
            <a id="mod-update-checker" class="mod-setting-button" tabindex="0">
                <span>${window.getIcon('globe', 'mod-update-rotate', 'var(--text-moderate)')}Check updates</span>
            </a>`;
            const updateinfo = 'Je browser controleert automatisch op updates.';

            // Credit contributors
            let contributorContent = '';
            for (const [key, value] of Object.entries(contributors)) {
                contributorContent += `
                <a class="mod-credits-gh-pill" href="https://github.com/${sanitizeString(key)}/" target="_blank" rel="noopener">
                    <img src="${sanitizeString(value)}" alt="${sanitizeString(key)}" class="mod-credits-gh-avatar">
                    <span class="mod-credits-gh-name">${sanitizeString(key)}</span>
                </a>
                `;
            }

            // Define some constants used in the replacements we'll do later
            const openDyslexicEnabled = tn('span', 0) ? (window.getComputedStyle(tn('span', 0)).getPropertyValue('font-family').indexOf('OpenDyslexic') != -1) : false;
            // "Weergave > Verberg profielfoto" is overridden when this option exists (some schools don't have profile pictures) AND a custom profile picture is set
            const avatarHiddenOverridden = document.querySelector('.avatar .initials') && !n(get('profilepic')) && n(document.getElementsByClassName('profielfoto-optie')[0]);
            const weergave = '<i style="background-color:var(--bg-primary-weak);fill:var(--fg-on-primary-weak);display:inline-block;vertical-align:middle;margin:0 5px;padding:5px;border-radius:4px;"><svg width="16px" height="16px" viewBox="0 0 24 24" display="block"><path d="m10.37 19.785-1.018-3.742H4.229L3.21 19.785H0L4.96 4h3.642l4.98 15.785zm-1.73-6.538L7.623 9.591q-.096-.365-.26-.935a114 114 0 0 0-.317-1.172q-.153-.603-.25-1.043-.095.441-.269 1.097a117 117 0 0 1-.538 2.053l-1.01 3.656h3.663Zm10.89-5.731q2.163 0 3.317 1.054Q23.999 9.623 24 11.774v8.01h-2.047l-.567-1.633h-.077q-.462.644-.942 1.053t-1.105.602q-.625.194-1.52.194a3.55 3.55 0 0 1-1.71-.409q-.75-.408-1.182-1.247-.432-.85-.433-2.15 0-1.914 1.202-2.818 1.2-.914 3.604-1.01l1.865-.065v-.527q0-.946-.442-1.387-.442-.44-1.23-.44a4.9 4.9 0 0 0-1.529.247q-.75.246-1.5.623l-.97-2.215a7.8 7.8 0 0 1 1.913-.796 8.3 8.3 0 0 1 2.2-.29m1.558 6.7-1.135.042q-1.422.043-1.98.57-.547.527-.547 1.387 0 .753.394 1.075.393.312 1.028.312.942 0 1.586-.623.654-.624.654-1.775v-.989Z"></path></svg></i>';
            const ngDetected = /(_ngcontent|_nghost|ng-tns-c\d+|ng-c\d+)/.test(get('customcss') ?? '');
            const night = document.getElementsByTagName('html')[0].classList.contains('night');

            // Fetch settings template HTML
            let settingsContent = window.getResourceAsText('data/settings.html');
            if (n(settingsContent)) {
                settingsContent = '<h3 style="margin-top: 200px;">Error</h3><p style="margin-bottom: 200px;">Could not generate the settings HTML at this moment. Try again later.</h3>';
            }

            // Replace keys in replacement with real content
            const replacements = {
                '{{icon_floppy_disk}}': window.getIcon('floppy-disk', 'mod-save-shake', 'var(--text-moderate)'),
                '{{icon_rotate_left}}': window.getIcon('rotate-left', 'mod-reset-rotate', 'var(--text-moderate)'),
                '{{icon_circle_info}}': window.getIcon('circle-info', 'mod-info-wobble', 'var(--text-moderate)'),
                '{{icon_circle_exclamation}}': window.getIcon('circle-exclamation', 'mod-bug-scale', 'var(--text-moderate)'),
                '{{icon_upload}}': window.getIcon('upload', null, 'var(--fg-on-primary-weak)'),
                '{{icon_shuffle}}': window.getIcon('shuffle', null, 'var(--fg-on-primary-weak)'),
                '{{icon_palette}}': window.getIcon('palette', null, 'var(--fg-on-primary-weak)'),
                '{{icon_edit}}': window.getIcon('edit', null, 'var(--fg-on-primary-weak)'),
                '{{updatechecker}}': isExtension ? '' : updatechecker,
                '{{addSetting_primarycolor}}': addSetting('Primaire kleur', null, 'primarycolor', 'color', '#0067c2'),
                '{{addSetting_secondarycolor}}': addSetting('Secundaire kleur', null, 'secondarycolor', 'color', '#0067c2'),
                '{{addLiveColors}}': addSetting(null, null, 'livecolor1', 'color', '#000000') + addSetting(null, null, 'livecolor2', 'color', '#000000') + addSetting(null, null, 'livecolor3', 'color', '#000000'),
                '{{backgroundtype_image_active}}': (n(get('backgroundtype')) || get('backgroundtype') == 'image') ? 'active' : '',
                '{{backgroundtype_slideshow_active}}': get('backgroundtype') == 'slideshow' ? 'active' : '',
                '{{backgroundtype_color_active}}': get('backgroundtype') == 'color' ? 'active' : '',
                '{{backgroundtype_live_active}}': get('backgroundtype') == 'live' ? 'active' : '',
                '{{display_bg_image}}': (n(get('backgroundtype')) || get('backgroundtype') == 'image') ? 'block' : 'none',
                '{{display_mod_filters}}': n(get('background')) ? 'display:none;' : '',
                '{{video_style}}': n(id('mod-background')) ? '' : 'filter:' + id('mod-background').style.filter + ';',
                '{{video_src}}': (get('isbackgroundvideo') && get('isbackgroundvideo') != 'false') ? `src="${get('background')}"` : '',
                '{{image_style}}': (n(id('mod-background')) ? '' : 'filter:' + id('mod-background').style.filter + ';') + ((get('isbackgroundvideo') && get('isbackgroundvideo') != 'false') ? 'display:none;' : ''),
                '{{image_src}}': (n(get('background')) ? 'data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=' : get('background')),
                '{{addSlider_brightness}}': addSlider('Helderheid', 'brightness', 0, 200, '%', 100),
                '{{addSlider_contrast}}': addSlider('Contrast', 'contrast', 0, 200, '%', 100),
                '{{addSlider_saturate}}': addSlider('Verzadiging', 'saturate', 0, 200, '%', 100),
                '{{addSlider_opacity}}': addSlider('Opacity', 'opacity', 0, 100, '%', 100),
                '{{addSlider_huerotate}}': addSlider('Kleurrotatie', 'huerotate', 0, 360, 'deg', 0),
                '{{addSlider_grayscale}}': addSlider('Grayscale', 'grayscale', 0, 100, '%', 0),
                '{{addSlider_sepia}}': addSlider('Sepia', 'sepia', 0, 100, '%', 0),
                '{{addSlider_invert}}': addSlider('Invert', 'invert', 0, 100, '%', 0),
                '{{addSlider_blur}}': addSlider('Blur', 'blur', 0, 200, 'px', 0),
                '{{addSetting_background}}': addSetting('Achtergrondafbeelding', 'Stel een afbeelding in voor op de achtergrond. Video\'s worden ook ondersteund.', 'background', 'file', null, 'image/*, video/*', null, `<div tabindex="0" class="mod-button" id="mod-random-background">${window.getIcon('shuffle', null, 'var(--fg-on-primary-weak)')}<span>Random</span></div>`),
                '{{display_bg_slideshow}}': get('backgroundtype') == 'slideshow' ? 'block' : 'none',
                '{{display_bg_color}}': get('backgroundtype') == 'color' ? 'block' : 'none',
                '{{display_bg_live}}': get('backgroundtype') == 'live' ? 'block' : 'none',
                '{{addSetting_backgroundcolor}}': addSetting('Achtergrondkleur', null, 'backgroundcolor', 'color', darkmode ? '#20262d' : '#ffffff'),
                '{{addSetting_ui_transparency}}': night ? '<div class="br"></div><div class="mod-info-notice">' + window.getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'Somtoday Mod Night mode ondersteunt momenteel geen UI transparantie en/of blur.</div>' : addSetting('UI-transparantie', 'Verander de transparantie van de UI.', 'ui', 'range', get('ui'), 0, 100, 1, true, 'image', 'opacity'),
                '{{addSetting_ui_blur}}': night ? '' : addSetting('UI-blur', 'Verander de blur van de UI.', 'uiblur', 'range', get('uiblur'), 0, 100, 1, true, 'image', 'blur'),
                '{{layout_1}}': '<div tabindex="0" class="layout-container' + (get('layout') == 1 ? ' layout-selected' : '') + '" id="layout-1"><div style="width:94%;height:19%;top:4%;left: 3%;"></div><div style="width:94%;height:68%;top:27%;left:3%;"></div><h3>Standaard</h3></div>',
                '{{layout_2}}': '<div tabindex="0" class="layout-container' + (get('layout') == 2 ? ' layout-selected' : '') + '" id="layout-2"><div style="width: 16%; height: 92%; top: 4%; left: 3%;"></div><div style="width: 75%; height: 92%; right: 3%; top: 4%;"></div><h3>Sidebar links</h3></div>',
                '{{layout_3}}': '<div tabindex="0" class="layout-container' + (get('layout') == 3 ? ' layout-selected' : '') + '" id="layout-3"><div style="width:75%;height:92%;left:3%;top:4%;"></div><div style="width:16%;height:92%;right:3%;top:4%;"></div><h3>Sidebar rechts</h3></div>',
                '{{layout_4}}': '<div tabindex="0" class="layout-container' + (get('layout') == 4 ? ' layout-selected' : '') + '" id="layout-4"><div style="width:68%;height:19%;top:4%;left:16%;"></div><div style="width: 68%;height:68%;top:27%;left: 16%;"></div><h3>Gecentreerd</h3></div>',
                '{{layout_5}}': '<div tabindex="0" class="layout-container' + (get('layout') == 5 ? ' layout-selected' : '') + '" id="layout-5"><div style="width:16%;height:92%;top:4%;left:3%;"></div><div style="width:75%;height:19%;right:3%;top:4%;"></div><div style="width:75%;height:69%;right:3%;top:27%;"></div><h3>Menu & sidebar</h3></div>',
                '{{menu_settings}}':
                    addSetting('Laat menu altijd zien', 'Toon de bovenste menubalk altijd. Als dit uitstaat, verdwijnt deze als je naar beneden scrolt.', 'bools00', 'checkbox', true) +
                    addSetting('Paginanaam in menu', 'Laat een tekst met de paginanaam zien in het menu.', 'bools01', 'checkbox', true) +
                    addSetting('Verberg bericht teller', 'Verberg het tellertje dat het aantal ongelezen berichten aangeeft.', 'bools02', 'checkbox', false),
                '{{nicknames}}': nicknames,
                '{{username_wrapper}}': '<h3>Gebruikersnaam</h3><p>Verander je gebruikersnaam.</p><div id="username-wrapper"><div><input title="Echte naam" class="mod-custom-setting" id="realname" type="text" placeholder="Echte naam" value="' + (n(get('realname')) ? '' : get('realname')) + '"><input title="Nieuwe gebruikersnaam" class="mod-custom-setting" id="username" type="text" placeholder="Nieuwe gebruikersnaam" value="' + (n(get('username')) ? '' : sanitizeString(get('username'))) + '"></div></div>',
                '{{font_settings}}': `
                    <h3>Lettertype</h3>` +
                    (openDyslexicEnabled ? '<div class="br"></div><div class="mod-info-notice">' + window.getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'De instelling <b>' + weergave + 'Weergave > Optimaliseer voor dyslexie</b> moet uitstaan om dit te laten werken.</div><div class="br"></div><div class="br"></div>' : '') + `
                    <div class="br"></div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
                        <div class="mod-custom-select notranslate">
                            <select id="mod-font-select" title="Selecteer een lettertype">
                                <option selected disabled hidden>
                                    ${n(get('customfontname')) ? get('fontname') : sanitizeString(get('customfontname'))}
                                </option>
                                <option>${fonts.join('</option><option>')}</option>
                            </select>
                        </div>
                        <label tabindex="0" class="mod-file-label" for="mod-font-file">
                            ${window.getIcon('upload', null, 'var(--fg-on-primary-weak)')}
                            <span>Of upload lettertype</span>
                        </label>
                    </div>
                    <input id="mod-font-file" type="file" style="display:none;" accept=".otf,.ttf,.fnt,.woff,.woff2">
                    <div class="example-box-wrapper">
                        <div id="font-box">
                            <h3 style="letter-spacing:normal;">Lettertype</h3>
                            <p style="letter-spacing:normal;margin-bottom:0;">Kies een lettertype voor Somtoday.</p>
                        </div>
                    </div>
                    <div class="br"></div><div class="br"></div><div class="br"></div>`,
                '{{profilepic_setting}}': addSetting('Profielafbeelding', 'Gebruik een eigen profielafbeelding in plaats van je schoolfoto.' + (avatarHiddenOverridden ? '<div class="mod-info-notice">' + window.getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'De instelling <b>' + weergave + 'Weergave > Verberg profielfoto</b> wordt genegeerd omdat je een custom profielafbeelding hebt ingesteld. Reset deze instelling om je initialen te tonen.</div>' : ''), 'profilepic', 'file', null, 'image/*', '120'),
                '{{grade_reveal_setting}}': '<div><h3>Cijfer-reveal</h3><p style="margin-right:15px;">Toon bij je cijfers een optel-animatie.</p><div id="grade-reveal-select" class="mod-multi-choice"><span' + (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) == '1' ? ' class="active"' : '') + ' tabindex="0">Alleen bij nieuwe cijfers</span><span' + (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) == '2' ? ' class="active"' : '') + ' tabindex="0">Altijd</span><span' + (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) == '0' ? ' class="active"' : '') + ' tabindex="0">Nooit</span></div></div>',
                '{{letterbeoordelingen_setting}}': `<div><h3>Letterbeoordelingen</h3><p style="margin-right:15px;">Stel in hoeveel lettercijfers (O, V, G, etc) waard zijn voor jouw school.</p><div id="mod-change-letterbeoordelingen" tabindex="0" class="mod-button">${window.getIcon('edit', null, 'var(--fg-on-primary-weak)')}Instellen</div></div>`,
                '{{extra_settings}}': addSetting('Analyse op cijferpagina', 'Laat een korte analyse zien op de cijfer-pagina van een vak.', 'bools18', 'checkbox', true) +
                    (platform == 'Android' ? '' : addSetting('Compact rooster', 'Maak je rooster compacter door lesuren in een grid te zetten. Werkt niet voor alle scholen.', 'bools03', 'checkbox', false)) +
                    addSetting('Deel debug-data', 'Verstuur bij een error anonieme informatie naar de developers om Somtoday Mod te verbeteren.', 'bools04', 'checkbox', false) +
                    (platform == 'Android' ? '' : addSetting('Downloadknop voor cijfers', 'Laat een downloadknop zien op de laatste cijfers en vakgemiddelden-pagina.', 'bools05', 'checkbox', true)) +
                    addSetting('Feestdagen', 'Laat bij feestdagen soms iets zien, zoals een kerstmuts op het Somtoday-logo.', 'bools17', 'checkbox', true) +
                    addSetting('Felicitatieberichten', 'Laat een felicitatiebericht zien als je jarig bent, of als je al een aantal jaar van Somtoday Mod gebruik maakt.', 'bools06', 'checkbox', true) +
                    addSetting('Grafieken op cijferpagina', 'Laat een cijfer- en gemiddeldegrafiek zien op de cijfer-pagina van een vak.', 'bools07', 'checkbox', true) +
                    ((get('layout') == 2 || get('layout') == 3 || get('layout') == 5) ? addSetting('Logo van mod in menu', 'Laat in plaats van het logo van Somtoday het logo van Somtoday Mod zien.', 'bools08', 'checkbox', true) : '') +
                    addSetting('Raster bij rooster', 'Laat een raster zien achter je rooster.', 'bools15', 'checkbox', true) +
                    (platform == 'Android' ? '' : addSetting('Redirect naar ELO', 'Redirect je automatisch van https://som.today naar https://inloggen.somtoday.nl.', 'bools09', 'checkbox', true)) +
                    addSetting('Rekentool op cijferpagina', 'Voeg een rekentool toe op de cijferpagina om snel te berekenen welk cijfer je moet halen.', 'bools10', 'checkbox', true) +
                    addSetting('Scrollbar', 'Laat de scrollbar van een pagina zien.', 'bools11', 'checkbox', true) +
                    addSetting('Selecteren', 'Maak alle tekst selecteerbaar.', 'bools13', 'checkbox', false) +
                    addSetting('Somtoday Recap', 'Laat aan het einde van het schooljaar een recap-knop zien (vanaf 26 juni).', 'bools12', 'checkbox', true) +
                    addSetting('Taken toevoegen', 'Laat een knop zien om taken toe te voegen aan de studiewijzer.', 'bools16', 'checkbox', true),
                '{{browser_settings}}': (platform == 'Android' ? '' :
                    addSetting('Titel', 'Verander de titel van Somtoday in de tabbladen van de browser.', 'title', 'text', '', 'Somtoday') + '<div class="br"></div><div class="br"></div><div class="br"></div>' +
                    addSetting('Icoon', 'Verander het icoontje van Somtoday in de menubalk van de browser. Accepteert png, jpg/jpeg, gif, svg, ico en meer.</p>' + (platform == 'Firefox' ? '' : '<div class="mod-info-notice">' + window.getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'Bewegende GIF-bestanden werken alleen in Firefox.</div>') + '<div class="br"></div><p>', 'icon', 'file', null, 'image/*', '300') + '<div class="br"></div><div class="br"></div>'
                ) +
                    addSetting('Aangepaste CSS', 'Voer hier je eigen CSS in om Somtoday nóg verder te veranderen. Dit is een geavanceerde instelling voor gebruikers die weten hoe CSS werkt.', 'customcss', 'textarea', '', '/* Voorbeeld: */\nbody {\n    background: red;\n}', '15') + '<div id="angular-hash-warning" style="display: ' + (ngDetected ? 'block' : 'none') + ';"><div class="br"></div><div class="mod-info-notice">' + window.getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'We hebben een _ng-attribuut of ng-classname gedetecteerd. Deze worden door A<b>ng</b>ular bij elke versie van Somtoday opnieuw gegenereerd, waardoor de CSS over een paar maanden niet meer zal werken. Het is beter om id\'s, normale classnames en andere selectors te gebruiken.</div><div class="br"></div><div class="br"></div></div>',
                '{{autologin_warning}}': get('logincredentialsincorrect') == '1' ? '<div class="mod-info-notice">' + window.getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'Autologin is tijdelijk uitgeschakeld.</div><div class="br"></div><div class="br"></div><div class="br"></div>' : '',
                '{{autologin_school}}': addSetting('School', 'Voer je schoolnaam in.', 'loginschool', 'text', '', ''),
                '{{autologin_name}}': addSetting('Gebruikersnaam', 'Voer je gebruikersnaam in.', 'loginname', 'text', '', ''),
                '{{autologin_pass}}': addSetting('Wachtwoord', 'Voer je wachtwoord in.', 'loginpass', 'password', '', ''),
                '{{somtoday_version}}': 'Versie ' + version_name + ' van Somtoday Mod',
                '{{platform}}': 'Somtoday ' + platform,
                '{{contributors_list}}': contributorContent,
                '{{updateinfo}}': isExtension ? updateinfo : '',
                '{{export_import_buttons}}': (platform == 'Android' ? '' : `<div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;"><div id="export-settings" class="mod-button">${window.getIcon('export', null, 'var(--fg-on-primary-weak)')}<span>Exporteer Mod-instellingen</span></div><div id="import-settings" class="mod-button">${window.getIcon('import', null, 'var(--fg-on-primary-weak)')}<span>Importeer Mod-instellingen</span></div></div><input type="file" id="import-settings-json" class="hidden" accept="application/json">`)
            };
            for (const key in replacements) {
                settingsContent = settingsContent.replaceAll(key, replacements[key]);
            }

            // Insert the HTML
            tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].insertAdjacentHTML('beforeend', settingsContent);

            for (const element of cn('mod-game')) {
                element.addEventListener('click', function () {
                    const game = this.dataset.game;
                    execute([
                        game === 'the-dungeon' ? startTheDungeon :
                            game === 'the-escape' ? startTheEscape :
                                game === 'grade-defender' ? startGradeDefender : null
                    ]);
                });
            }

            // Import/export settings, which does not work on Android (can't download files there in a WebView at the moment)
            if (id('import-settings') && id('export-settings') && id('import-settings-json')) {
                id('export-settings').addEventListener('click', exportSettings);
                id('import-settings').addEventListener('click', function () {
                    modMessage('Instellingen importeren?', 'Wanneer je Mod-instellingen importeert worden je huidige instellingen overschreven. Importeer alleen instellingsbestanden die je vertrouwt of zelf hebt ge&euml;xporteerd.', 'Ja', 'Nee');
                    id('mod-message-action1').addEventListener('click', function () {
                        id('import-settings-json').click();
                        closeModMessage();
                    });
                    id('mod-message-action2').addEventListener('click', closeModMessage);
                });
                id('import-settings-json').addEventListener('input', importSettings);
            }

            // Upload your own custom font file, like Wingdings
            if (id('mod-font-file')) {
                id('mod-font-file').addEventListener('input', function () {
                    if (this.files.length != 0) {
                        tryRemove(id('mod-font-preview'));
                        this.parentElement.getElementsByTagName('label')[0].children[1].innerText = this.files[0].name.toLowerCase();
                        this.parentElement.getElementsByTagName('label')[0].classList.add('mod-active');
                        let reader = new FileReader();
                        reader.readAsDataURL(id('mod-font-file').files[0]);
                        reader.onload = function () {
                            setTimeout(function () {
                                tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-font-preview">@font-face{font-family:modCustomFontPreview;src:url("' + reader.result + '");}</style>');
                                document.getElementById('font-box').children[0].style.setProperty('font-family', 'modCustomFontPreview, sans-serif', 'important');
                                document.getElementById('font-box').children[1].style.setProperty('font-family', 'modCustomFontPreview, sans-serif', 'important');
                            }, 100);
                        };
                    } else {
                        this.parentElement.getElementsByTagName('label')[0].children[1].innerText = 'Of upload lettertype';
                        this.parentElement.getElementsByTagName('label')[0].classList.remove('mod-active');
                        this.value = null;
                    }
                });
            }
            if (id('customcss')) {
                // Insert tab instead of moving to the next element
                id('customcss').addEventListener('keydown', function (e) {
                    if (e.key === 'Tab') {
                        e.preventDefault(); e.preventDefault();

                        // execCommand doesn't mess with Ctrl Z history
                        if (!document.execCommand('insertText', false, '    ')) {
                            // Fallback, execCommand is technically deprecated and could be removed sooner or later
                            const start = id('customcss').selectionStart;
                            const end = id('customcss').selectionEnd;

                            id('customcss').value = id('customcss').value.substring(0, start) +
                                '    ' +
                                id('customcss').value.substring(end);

                            id('customcss').selectionStart = id('customcss').selectionEnd = start + 4;
                        }

                    }
                });

                // Live input checking
                id('customcss').addEventListener('input', function (e) {
                    const content = e.target.value;

                    // Angular hash check
                    if (/(_ngcontent|_nghost|ng-tns-c\d+|ng-c\d+)/.test(content)) {
                        id('angular-hash-warning').style.display = 'block';
                    } else {
                        id('angular-hash-warning').style.display = 'none';
                    }

                    // Live sanitization to prevent surprises after save
                    if (content.indexOf('javascript:') != -1 || content.indexOf('@import') != -1) {
                        e.target.value = e.target.value.replace(/javascript:[^'"]*/gi, '').replace(/@import[^;\n]*/gi, '');
                    }
                });
            }

            // Add themes
            // Background images thanks to Pexels: https://www.pexels.com
            themeCount = 0; // used for "Meer bekijken" logic, gets incremented with each addTheme()
            addTheme('Standaard', '', '#0067c2', '#e69b22');
            addTheme('Bergen', '618833', '#3b4117', '#3b4117');
            addTheme('Eiland', '994605', '#2a83b1', '#2a83b1');
            addTheme('Zee', '756856', '#173559', '#173559');
            addTheme('Bergmeer', '1284296', '#4a6a2f', '#4a6a2f');
            addTheme('Rivieruitzicht', '822528', '#526949', '#526949');
            addTheme('Ruimte', '110854', '#0d0047', '#0d0047');
            addTheme('Bergen en ruimte', '1624504', '#6489a0', '#6489a0');
            addTheme('Stad', '2246476', '#18202d', '#18202d');
            addTheme('Weg', '1820563', '#de3c22', '#de3c22');
            addTheme('Woestijn', '847402', '#ac7a0d', '#ac7a0d');
            addTheme('Kronkelweg', '34535324', '#ee8317', '#ee8317');
            addTheme('Kat', '730896', '#2b2d36', '#ffffff');
            addTheme('Honden', '215957', '#ee8317', '#ee8317');
            addTheme('Gamen', '539986', '#1100ffff', '#ffffff');
            addTheme('Biljard', '6253916', '#27f56c', '#13bd4c');
            addTheme('Arcade', '28920045', '#fd4ff4', '#fd4ff4');
            addTheme('Ski\'s', '257961', '#f71111', '#f71111');
            addTheme('Schaken', '277124', '#514642', '#e8e8e8');
            addTheme('Kerstmis', '1708601', '#0dac0d', '#a50c0c');
            id('theme-wrapper').insertAdjacentHTML('afterend', `<div id="more-themes" tabindex="0" class="mod-button">Meer bekijken</div>`);
            document.getElementById('more-themes').addEventListener('click', function () {
                const hiddenThemes = this.previousElementSibling.querySelectorAll('.theme[style]');
                for (let i = 0; i < 10; i++) {
                    if (n(hiddenThemes[i])) break;

                    hiddenThemes[i].removeAttribute('style');
                }
                if (hiddenThemes.length - 10 <= 0) {
                    this.remove();
                }
            });

            // Backgrounds
            const slideshowWrapper = id('mod-background-wrapper');
            const slideshowLabel = slideshowWrapper.getElementsByTagName('label')[0];
            const slideCount = n(get('slides')) ? 0 : get('slides');
            // Insert placeholder divs (will be replaced with <img> elements)
            for (let i = 0; i < slideCount; i++) {
                slideshowWrapper.insertBefore(document.createElement('div'), slideshowLabel);
            }

            // Add slideshow image asynchronous
            async function addImage(url, element = null) {
                return new Promise((resolve, reject) => {
                    if (n(slideshowLabel)) {
                        resolve();
                    }

                    const img = document.createElement('img');
                    img.onload = resolve;
                    img.onerror = reject;
                    img.addEventListener('click', function () {
                        id('mod-background-wrapper').classList.add('mod-modified');
                        this.remove();
                    })
                    img.tabIndex = 0;
                    img.src = url;
                    if (element) {
                        element.replaceWith(img);
                    }
                    else {
                        slideshowWrapper.insertBefore(img, slideshowLabel);
                    }
                })
            }

            // Replace all placeholder <div> elements with their corresponding <img> elements
            addSlide(0);
            async function addSlide(i) {
                const div = slideshowWrapper.getElementsByTagName('div')[0];
                const background = get(`background${i}`);

                if (i >= slideCount) {
                    slideshowWrapper.classList.remove('mod-loading');
                    return;
                }

                await addImage(background, div);
                await new Promise(resolve => setTimeout(resolve, 1));

                addSlide(i + 1);
            }
            const notLoaded = slideshowWrapper.querySelectorAll('div');
            notLoaded.forEach(el => el.remove());

            // Backgrounds section event listeners
            if (id('mod-background-preview-image') && id('mod-background-preview-video')) {
                const isbackgroundvideo = get('isbackgroundvideo') && get('isbackgroundvideo') != 'false';
                id('mod-background-preview-image').style.setProperty('filter', getBackgroundFilters(false));
                id('mod-background-preview-video').style.setProperty('filter', getBackgroundFilters(false));
                id('mod-background-preview-image').style.display = !isbackgroundvideo ? 'block' : 'none';
                id('mod-background-preview-video').style.display = isbackgroundvideo ? 'block' : 'none';
            }
            if (id('addbackground')) {
                id('addbackground').addEventListener('input', function () {
                    const files = this.files;
                    for (var i = 0; i < files.length; i++) {
                        if (this.accept != 'image/*' || files[i]['type'].indexOf('image') != -1) {
                            let reader = new FileReader();
                            reader.readAsDataURL(this.files[i]);
                            reader.onload = function () {
                                id('mod-background-wrapper').classList.add('mod-modified');
                                addImage(reader.result);
                            };
                        }
                    }
                });
            }
            if (id('background')) {
                id('background').addEventListener('input', function () {
                    if (this.files[0] != null) {
                        const isVideo = this.files[0].type.indexOf('video') != -1;
                        let reader = new FileReader();
                        reader.readAsDataURL(this.files[0]);
                        id('mod-background-preview-image').style.display = !isVideo ? 'block' : 'none';
                        id('mod-background-preview-video').style.display = isVideo ? 'block' : 'none';
                        id('mod-filters').style.display = 'block';
                        reader.onload = function () {
                            if (isVideo) {
                                id('mod-background-preview-video').src = reader.result;
                            }
                            else {
                                id('mod-background-preview-image').src = reader.result;
                            }
                        };
                    }
                    else {
                        id('mod-filters').style.display = 'none';
                    }
                });
            }
            if (id('mod-reset-filters')) {
                id('mod-reset-filters').addEventListener('click', function () {
                    id('brightness').value = 100;
                    id('brightness').dispatchEvent(new Event('input'));
                    id('contrast').value = 100;
                    id('contrast').dispatchEvent(new Event('input'));
                    id('saturate').value = 100;
                    id('saturate').dispatchEvent(new Event('input'));
                    id('opacity').value = 100;
                    id('opacity').dispatchEvent(new Event('input'));
                    id('huerotate').value = 0;
                    id('huerotate').dispatchEvent(new Event('input'));
                    id('grayscale').value = 0;
                    id('grayscale').dispatchEvent(new Event('input'));
                    id('sepia').value = 0;
                    id('sepia').dispatchEvent(new Event('input'));
                    id('invert').value = 0;
                    id('invert').dispatchEvent(new Event('input'));
                    id('blur').value = 0;
                    id('blur').dispatchEvent(new Event('input'));
                    id('mod-background-preview-image').style.setProperty('filter', getBackgroundFilters(false));
                    id('mod-background-preview-video').style.setProperty('filter', getBackgroundFilters(false));
                });
            }
            if (id('type-image') && id('type-slideshow') && id('type-color') && id('type-live')) {
                id('type-image').addEventListener('click', function () {
                    this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                    this.classList.add('active');
                    show(id('mod-bg-image'));
                    hide(id('mod-bg-slideshow'));
                    hide(id('mod-bg-color'));
                    hide(id('mod-bg-live'));
                });
                id('type-slideshow').addEventListener('click', function () {
                    this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                    this.classList.add('active');
                    hide(id('mod-bg-image'));
                    show(id('mod-bg-slideshow'));
                    hide(id('mod-bg-color'));
                    hide(id('mod-bg-live'));
                });
                id('type-color').addEventListener('click', function () {
                    this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                    this.classList.add('active');
                    hide(id('mod-bg-image'));
                    hide(id('mod-bg-slideshow'));
                    show(id('mod-bg-color'));
                    hide(id('mod-bg-live'));
                });
                id('type-live').addEventListener('click', function () {
                    this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                    this.classList.add('active');
                    hide(id('mod-bg-image'));
                    hide(id('mod-bg-slideshow'));
                    hide(id('mod-bg-color'));
                    show(id('mod-bg-live'));
                });
            }

            // Multiple choice select
            for (const element of cn('mod-multi-choice')) {
                for (const child of element.children) {
                    child.addEventListener('click', function () {
                        this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                        this.classList.add('active');
                    });
                }
            }
            // Filter sliders
            for (const element of cn('mod-slider')) {
                if (!element.getElementsByTagName('input')[0]) {
                    continue;
                }
                element.getElementsByTagName('input')[0].addEventListener('input', function () {
                    this.classList.add('mod-modified');
                    this.parentElement.children[2].innerHTML = this.value + this.dataset.unit;
                    id('mod-background-preview-image').style.setProperty('filter', getBackgroundFilters(false));
                    id('mod-background-preview-video').style.setProperty('filter', getBackgroundFilters(false));
                });
            }
            // Drag and drop on file inputs
            for (const element of cn('mod-file-label')) {
                element.addEventListener('drop', function (event) {
                    // Prevent default behavior (Prevent file from being opened)
                    event.preventDefault();

                    let done = false;
                    if (event.dataTransfer.items) {
                        [...event.dataTransfer.items].forEach((item, i) => {
                            if (!done && item.kind === "file") {
                                done = true;
                                element.classList.remove('mod-drag-and-drop');
                                const file = item.getAsFile();
                                const dataTransfer = new DataTransfer();
                                dataTransfer.items.add(file);
                                const fileList = dataTransfer.files;
                                element.parentElement.previousElementSibling.files = fileList;
                            }
                        });
                    } else {
                        [...event.dataTransfer.files].forEach((file, i) => {
                            if (!done) {
                                done = true;
                                element.classList.remove('mod-drag-and-drop');
                                const dataTransfer = new DataTransfer();
                                dataTransfer.items.add(file);
                                const fileList = dataTransfer.files;
                                element.parentElement.previousElementSibling.files = fileList;
                            }
                        });
                    }
                    let inputEvent = new Event('input', {
                        bubbles: false,
                    });
                    element.parentElement.previousElementSibling.dispatchEvent(inputEvent);
                });
                element.addEventListener('dragover', function (event) {
                    event.preventDefault();
                    element.classList.add('mod-drag-and-drop');
                    element.children[1].innerHTML = 'Drop een afbeelding';
                });
                element.addEventListener('dragleave', function () {
                    element.classList.remove('mod-drag-and-drop');
                    element.children[1].innerHTML = 'Kies een bestand';
                });
            }
            // File reset buttons
            for (const element of cn('mod-file-reset')) {
                element.addEventListener('click', function () {
                    const shouldBeActive = !element.classList.contains('mod-active');
                    for (const btn of element.parentElement.getElementsByClassName('mod-active')) {
                        btn.classList.remove('mod-active');
                        if (btn.classList.contains('mod-file-label')) {
                            setHTML(btn.children[1], 'Kies een bestand');
                            element.parentElement.previousElementSibling.value = null;
                        }
                    }
                    if (shouldBeActive) {
                        element.classList.add('mod-active');
                    }
                });
            }

            // Section collapsing
            let number = 0;
            if (n(get('category'))) {
                set('category', '1'.repeat(20));
            }
            const categories = get('category');
            for (const element of cn('mod-setting-button')) {
                element.addEventListener('keyup', (event) => { if (event.keyCode === 13) { element.click(); } }, { once: true });
            }
            for (const element of id('mod-setting-panel').getElementsByClassName('category')) {
                const index = number;
                id('category-' + element.dataset.category).style.display = categories.charAt(index) == '1' ? 'block' : 'none';
                if (categories.charAt(index) == '1') {
                    element.classList.remove('collapsed');
                }
                else {
                    element.classList.add('collapsed');
                }
                element.addEventListener('click', function () {
                    // Collapsed: whether the category was collapsed before toggling
                    // So if collapsed == true, then the category should be shown
                    const collapsed = id('category-' + element.dataset.category).style.display == 'none';
                    set('category', get('category').replaceAt(index, collapsed ? '1' : '0'));
                    if (collapsed) {
                        element.classList.remove('collapsed');
                    }
                    else {
                        element.classList.add('collapsed');
                    }
                    id('category-' + element.dataset.category).style.display = collapsed ? 'block' : 'none';
                });
                element.addEventListener('keyup', (event) => { if (event.keyCode === 13) { element.click(); } }, { once: true });
                number++;
            }

            // Add event listeners to make layout boxes work
            for (const element of cn('layout-container')) {
                element.addEventListener('click', function () {
                    for (const element of cn('layout-selected')) {
                        element.classList.remove('layout-selected');
                    }
                    element.classList.add('layout-selected');
                });
            }

            // Make save button, reset button (and updatechecker for the Userscript-version) work
            if (id('save')) {
                id('save').addEventListener('click', function () {
                    execute([save]);
                });
            }
            if (id('reset')) {
                id('reset').addEventListener('click', function () {
                    modMessage('Alles resetten?', 'Al je instellingen zullen worden gereset. Weet je zeker dat je door wil gaan?', 'Ja', 'Nee');
                    id('mod-message-action1').addEventListener('click', function () {
                        execute([reset, setBackground, style, pageUpdate]);
                        if (id('mod-grades-graphs') && get('bools').charAt(BOOL_INDEX.SUBJECT_GRAPHS) == '1' && tn('sl-vakresultaten', 0)) {
                            tryRemove(id('mod-grades-graphs'));
                            tn('sl-vakresultaten', 0).insertAdjacentHTML('beforeend', '<div id="mod-grades-graphs"><h3>Mijn cijfers</h3><div><canvas id="mod-chart-1"></canvas></div><h3>Mijn gemiddelde</h3><div><canvas id="mod-chart-2"></canvas></div></div>');
                            setTimeout(gradeGraphs, 500);
                        }
                        closeModMessage();
                    });
                    id('mod-message-action2').addEventListener('click', closeModMessage);
                });
            }
            if (id('mod-update-checker')) {
                id('mod-update-checker').addEventListener('click', function () { execute([checkUpdate]) });
            }
            // Make random background button work
            // Random background images thanks to Lorem Picsum: https://picsum.photos
            if (id('mod-random-background')) {
                id('mod-random-background').addEventListener('click', function () {
                    id('mod-random-background').classList.toggle('mod-active');
                    if (id('mod-random-background').previousElementSibling) {
                        if (id('mod-random-background').previousElementSibling.classList.contains('mod-active')) {
                            id('mod-random-background').previousElementSibling.classList.remove('mod-active');
                        }
                        if ((((id('mod-random-background').previousElementSibling) && id('mod-random-background').previousElementSibling.previousElementSibling) && id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('label')[0]) && id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].classList.contains('mod-active')) {
                            id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].classList.remove('mod-active');
                            setHTML(id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].children[1], 'Kies een bestand');
                            id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('input')[0].value = null;
                        }
                    }
                });
            }

            // Live wallpaper
            if (id('mod-live-random')) {
                let liveType, col1, col2, col3;

                id('primarycolor').addEventListener('change', function () {
                    if (liveType == 'primary') {
                        id('mod-live-primary').click();
                    }
                });

                id('secondarycolor').addEventListener('change', function () {
                    if (liveType == 'secondary') {
                        id('mod-live-secondary').click();
                    }
                });

                id('livecolor1').addEventListener('input', function () {
                    const rgb = hexToRgb(this.value);
                    if (col1[0] != rgb[0] || col1[1] != rgb[1] || col1[2] != rgb[2]) {
                        col1 = rgb;
                        resetLiveButtons();
                    }
                });
                id('livecolor2').addEventListener('input', function () {
                    const rgb = hexToRgb(this.value);
                    if (col2[0] != rgb[0] || col2[1] != rgb[1] || col2[2] != rgb[2]) {
                        col2 = rgb;
                        resetLiveButtons();
                    }
                });
                id('livecolor3').addEventListener('input', function () {
                    const rgb = hexToRgb(this.value);
                    if (col3[0] != rgb[0] || col3[1] != rgb[1] || col3[2] != rgb[2]) {
                        col3 = rgb;
                        resetLiveButtons();
                    }
                });

                function resetLiveButtons(e) {
                    if (e) return;

                    id('mod-bg-live').dataset.type = liveType;
                    id('mod-live-random').classList.remove('mod-active');
                    id('mod-live-primary').classList.remove('mod-active');
                    id('mod-live-secondary').classList.remove('mod-active');
                    id('mod-live-custom').classList.remove('mod-active');

                    id('livecolor1').value = rgbToHex(col1);
                    id('livecolor1').dispatchEvent(new Event('input', { bubbles: false }));
                    id('livecolor2').value = rgbToHex(col2);
                    id('livecolor2').dispatchEvent(new Event('input', { bubbles: false }));
                    id('livecolor3').value = rgbToHex(col3);
                    id('livecolor3').dispatchEvent(new Event('input', { bubbles: false }));

                    id(`mod-live-${liveType}`).classList.add('mod-active');

                    if (liveType == 'custom') {
                        show(id('mod-live-colors'));
                    }
                    else {
                        hide(id('mod-live-colors'));
                    }

                    startLiveWallpaper(true, col1, col2, col3);
                }

                id('mod-live-random').addEventListener('click', function () {
                    liveType = 'random';
                    col1 = randomColor(0);
                    col2 = randomColor(2);
                    col3 = randomColor(4);

                    resetLiveButtons();
                });
                id('mod-live-primary').addEventListener('click', function () {
                    const baseColor = id('primarycolor').value;

                    liveType = 'primary';
                    col1 = hexToRgb(baseColor);
                    col2 = hexToRgb(adjust(baseColor, -50));
                    col3 = hexToRgb(adjust(baseColor, 50));

                    resetLiveButtons();
                });
                id('mod-live-secondary').addEventListener('click', function () {
                    const baseColor = id('secondarycolor').value;

                    liveType = 'secondary';
                    col1 = hexToRgb(baseColor);
                    col2 = hexToRgb(adjust(baseColor, -50));
                    col3 = hexToRgb(adjust(baseColor, 50));

                    resetLiveButtons();
                });
                id('mod-live-custom').addEventListener('click', function () {
                    liveType = 'custom';

                    resetLiveButtons();
                });

                if (n(get('livetype'))) {
                    id('mod-live-random').click();
                }
                else {
                    liveType = get('livetype');
                    col1 = hexToRgb(get('livecolor1'));
                    col2 = hexToRgb(get('livecolor2'));
                    col3 = hexToRgb(get('livecolor3'));

                    resetLiveButtons();
                }
            }

            // Letterbeoordelingen
            if (id('mod-change-letterbeoordelingen')) {
                id('mod-change-letterbeoordelingen').addEventListener('click', function () {
                    showLetterbeoordelingenMessage();
                });
            }
            // Add script to make the font select element work
            if (id('mod-font-select-script')) {
                tryRemove(id('mod-font-select-script'));
            }
            id('somtoday-mod').insertAdjacentHTML('beforeend', '<style id="mod-font-select-script" onload=\'let x, i, j, l, ll, selElmnt, a, b, c; x = document.getElementsByClassName("mod-custom-select"); l = x.length; for (i = 0; i < l; i++) { selElmnt = x[i].getElementsByTagName("select")[0]; ll = selElmnt.length; a = document.createElement("DIV"); a.setAttribute("class", "select-selected"); a.setAttribute("tabindex", "0"); a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML; x[i].appendChild(a); b = document.createElement("DIV"); b.setAttribute("class", "select-items select-hide"); for (j = 1; j < ll; j++) { c = document.createElement("DIV"); c.innerHTML = selElmnt.options[j].innerHTML; c.setAttribute("tabindex", "0"); c.style.setProperty("font-family", "\\"" + selElmnt.options[j].innerHTML + "\\", sans-serif", "important"); c.addEventListener("click", function(e) { let y, i, k, s, h, sl, yl; s = this.parentNode.parentNode.getElementsByTagName("select")[0]; sl = s.length; h = this.parentNode.previousSibling; for (i = 0; i < sl; i++) { if (this.style.fontFamily.indexOf(s.options[i].innerHTML + ",") != -1 || this.style.fontFamily.indexOf(s.options[i].innerHTML + "\\",") != -1) { s.selectedIndex = i; h.innerHTML = this.innerHTML; y = this.parentNode.getElementsByClassName("same-as-selected"); yl = y.length; for (k = 0; k < yl; k++) { y[k].removeAttribute("class"); } this.setAttribute("class", "same-as-selected"); break; } } h.click(); document.getElementById("mod-font-select").classList.add("mod-modified"); if (document.getElementById("mod-font-preview")) { document.getElementById("mod-font-preview").remove(); } document.getElementById("mod-font-file").value = ""; let event = new Event("input", { bubbles: false }); document.getElementById("mod-font-file").dispatchEvent(event); document.getElementById("font-box").children[0].style.setProperty("font-family", "\\"" + document.getElementById("mod-font-select").value + "\\", sans-serif", "important"); document.getElementById("font-box").children[1].style.setProperty("font-family", "\\"" + document.getElementById("mod-font-select").value + "\\", sans-serif", "important"); document.getElementsByClassName("select-selected")[0].style.setProperty("font-family", "\\"" + document.getElementById("mod-font-select").value + "\\", sans-serif", "important"); }); b.appendChild(c); } x[i].appendChild(b); a.addEventListener("click", function(e) { e.stopPropagation(); closeAllSelect(this); this.nextSibling.classList.toggle("select-hide"); this.classList.toggle("select-arrow-active"); }); } function closeAllSelect(elmnt) { let x, y, i, xl, yl, arrNo = []; x = document.getElementsByClassName("select-items"); y = document.getElementsByClassName("select-selected"); xl = x.length; yl = y.length; for (i = 0; i < yl; i++) { if (elmnt == y[i]) { arrNo.push(i) } else { y[i].classList.remove("select-arrow-active"); } } for (i = 0; i < xl; i++) { if (arrNo.indexOf(i)) { x[i].classList.add("select-hide"); } } } document.addEventListener("click", closeAllSelect, {passive: true});\'></style>');
        }
    }

    // Close modsettings
    function closeSettings(element) {
        id('mod-setting-button').classList.remove('active');
        tryRemove(id('mod-setting-panel'));
        if (tn('sl-account-modal', 0)) {
            if (tn('sl-account-modal-header', 1) && tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0]) {
                tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0].dataset.originalText;
            }
            tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0].innerHTML = element.getElementsByTagName('span')[0].innerHTML;
            if (tn('sl-account-modal', 0).getElementsByClassName('content')[0]) {
                if (tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0]) {
                    if (tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].children[0]) {
                        tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].children[0].removeAttribute('inert');
                    }
                }
            }
        }
    }

    // Remove all old slideshow backgrounds
    function removeSlideshowBackgrounds() {
        let i = 0;
        while (!n(get('background' + i))) {
            set('background' + i, '');
            i++;
        }
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }

    // Save all new slideshow backgrounds
    function saveSlideshowBackground(element, i) {
        set('background' + i, element.src);
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }

    // Save all modsettings
    async function save() {
        let reload = true;
        let nicknames = [];
        // If login credentials have changed, assume they are correct
        if (id('loginname').value != get('loginname') || id('loginpass').value != get('loginpass') || id('loginschool').value != get('loginschool')) {
            set('logincredentialsincorrect', '0');
        }
        for (const element of id('nickname-wrapper').children) {
            if (!n(element.getElementsByTagName('input')[1])) {
                // Docent name can't be empty
                if (!n(element.getElementsByTagName('input')[0].value)) {
                    nicknames.push([element.getElementsByTagName('input')[0].value, element.getElementsByTagName('input')[2].value, element.getElementsByTagName('input')[1].value]);
                }
            }
        }
        set('nicknames', JSON.stringify(nicknames));
        // Save all form elements added with addSetting()
        filesProcessed = 0;
        for (const element of cn('mod-slider')) {
            set(element.getElementsByTagName('input')[0].dataset.property, element.getElementsByTagName('input')[0].value + element.getElementsByTagName('input')[0].dataset.unit);
        }
        if (id('mod-font-file') && id('mod-font-file').files[0]) {
            set('customfontname', id('mod-font-file').files[0].name);
            let reader = new FileReader();
            reader.readAsDataURL(id('mod-font-file').files[0]);
            reader.onload = function () {
                set('customfont', reader.result);
                setTimeout(function () {
                    execute([style]);
                }, 100);
            };
        }
        else if (id('mod-font-select') && id('mod-font-select').classList.contains('mod-modified')) {
            set('customfont', '');
            set('customfontname', '');
            set('fontname', id('mod-font-select').value);
        }
        for (const element of cn('mod-custom-setting')) {
            if (element.type == 'checkbox' && element.id.indexOf('bools') != -1) {
                set('bools', get('bools').replaceAt(parseInt(element.id.charAt(5) + element.id.charAt(6)), element.checked ? '1' : '0'));
            } else if (element.type == 'checkbox' || element.type == 'range' || element.type == 'text' || element.type == 'password' || element.type == 'number' || element.type == 'color' || element.tagName == 'TEXTAREA') {
                set(element.id, element.value);
            } else if (element.type == 'file') {
                if (element.files.length != 0) {
                    // Compress files to desired size in pixels using canvas
                    let size = element.dataset.size;
                    if (!n(size) && (element.files[0].type == 'image/png' || element.files[0].type == 'image/jpeg' || element.files[0].type == 'image/webp')) {
                        size = parseInt(size);
                        const canvas = document.createElement('canvas');
                        let ctx = canvas.getContext('2d');
                        let img = new Image;
                        canvas.height = size;
                        canvas.width = size;
                        img.onload = function () {
                            canvas.height = canvas.width * (img.height / img.width);
                            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                            const result = canvas.toDataURL('image/webp');
                            if (result.length > 100) {
                                set(element.id, result);
                                filesProcessed++;
                            }
                            // If result is empty data URI, fall back to non-compressed file
                            else {
                                let reader = new FileReader();
                                reader.readAsDataURL(element.files[0]);
                                reader.onload = function () {
                                    set(element.id, reader.result);
                                    filesProcessed++;
                                };
                            }
                        };
                        img.src = URL.createObjectURL(element.files[0]);
                    }
                    // File should not be compressed
                    else {
                        let reader = new FileReader();
                        reader.readAsDataURL(element.files[0]);
                        reader.onload = function () {
                            if (element.id == 'background') {
                                set('isbackgroundvideo', element.files[0]['type'].indexOf('video') != -1);
                            }
                            set(element.id, reader.result);
                            filesProcessed++;
                        };
                    }
                }
                // File is not set
                else {
                    filesProcessed++;
                }
            }
        }
        if (id('mod-bg-image').style.display == 'block') {
            set('backgroundtype', 'image');
        }
        else if (id('mod-bg-slideshow').style.display == 'block') {
            modMessage('Bezig met opslaan', 'Je achtergrondafbeeldingen worden nu opgeslagen. Dit kan even duren.', null, null, null, null, true);
            set('backgroundtype', 'slideshow');
            if (id('mod-background-wrapper').classList.contains('mod-modified') == true && id('mod-background-wrapper').classList.contains('mod-loading') == false) {
                await removeSlideshowBackgrounds();
                let i = 0;
                for (const element of id('mod-background-wrapper').getElementsByTagName('img')) {
                    if (element.complete && element.naturalWidth != 0) {
                        await saveSlideshowBackground(element, i);
                        i++;
                    }
                }
                set('slides', i);
            }
        }
        else if (id('mod-bg-color').style.display == 'block') {
            set('backgroundtype', 'color');
        }
        else if (id('mod-bg-live').style.display == 'block') {
            set('backgroundtype', 'live');
        }
        if (id('mod-bg-live')?.dataset?.type) {
            set('livetype', id('mod-bg-live').dataset.type);
        }
        const selectedtheme = cn('theme-selected', 0);
        if (!n(selectedtheme)) {
            if (id('primarycolor').classList.contains('mod-modified') == false) {
                set('primarycolor', selectedtheme.dataset.color);
            }
            if (id('secondarycolor').classList.contains('mod-modified') == false) {
                set('secondarycolor', selectedtheme.dataset.secondaryColor);
            }
            set('preset', selectedtheme.dataset.name);
            if (selectedtheme.id != 'Standaard' && selectedtheme.dataset.url) {
                toDataURL(selectedtheme.dataset.url, function (dataUrl) {
                    set('background', dataUrl);
                    set('backgroundtype', 'image');
                    filesProcessed++;
                });
            }
            else {
                set('background', '');
                set('backgroundtype', 'image');
                filesProcessed++;
            }
        }
        else {
            filesProcessed++;
        }
        if (cn('layout-selected', 0)) {
            set('layout', parseInt(cn('layout-selected', 0).id.charAt(7)));
        }
        if (id('mod-random-background')) {
            if (id('mod-random-background').classList.contains('mod-active')) {
                toDataURL('https://picsum.photos/1600/800', function (dataUrl) {
                    set('background', dataUrl);
                    filesProcessed++;
                });
            }
            else {
                filesProcessed++;
            }
        }
        else {
            filesProcessed++;
        }
        for (const element of cn('mod-file-reset')) {
            if (element.classList.contains('mod-active')) {
                set(element.dataset.key, '');
            }
        }
        if (id('grade-reveal-select')) {
            const showOnlyForNewGrades = id('grade-reveal-select').children[0].classList.contains('active');
            const showAlways = id('grade-reveal-select').children[1].classList.contains('active');
            set('bools', get('bools').replaceAt(14, showOnlyForNewGrades ? '1' : (showAlways ? '2' : '0')));
        }
        // Reload page to show changes
        // Only reload when all files are processed (required for Firefox, but also an extra check for the other browsers)
        if (reload) {
            execute([saveReload]);
        }
        modMessage('Opgeslagen!', 'Al je instellingen zijn opgeslagen.', 'Doorgaan');
        id('mod-message-action1').addEventListener('click', closeModMessage);
    }

    // Make sure everything is saved before reload
    function saveReload(loadAnyway = false) {
        if (loadAnyway || filesProcessed >= (cn('mod-file-input').length + 1)) {
            // Update all things that could have changed
            execute([setBackground, style, pageUpdate, openSettings, browserSettings, profilePicture]);
            // Update grade graphs
            tryRemove(id('mod-grades-graphs'));
            if (get('bools').charAt(BOOL_INDEX.SUBJECT_GRAPHS) == '1' && tn('sl-vakresultaten', 0)) {
                tn('sl-vakresultaten', 0).insertAdjacentHTML('beforeend', '<div id="mod-grades-graphs"><h3>Mijn cijfers</h3><div><canvas id="mod-chart-1"></canvas></div><h3>Mijn gemiddelde</h3><div><canvas id="mod-chart-2"></canvas></div></div>');
                setTimeout(gradeGraphs, 500);
            }
            if (tn('sl-modal', 0)) {
                tn('sl-modal', 0).style.zIndex = '100000';
            }
            if (get('layout') == 3) {
                tn('body', 0).style.cssText = '--safe-area-inset-right: ' + menuWidth + 'px !important';
            }
            else if (get('layout') == 2 || get('layout') == 5) {
                tn('body', 0).style.cssText = '--safe-area-inset-left: ' + menuWidth + 'px !important';
            }
        }
        else {
            setTimeout(saveReload, 100);
        }
    }

    // Reset all settings
    function reset() {
        set('primarycolor', '#0067c2');
        set('secondarycolor', '#e69b22');
        set('nicknames', '[]');
        set('bools', '110001110111101111100000000000');
        set('title', '');
        set('icon', '');
        set('background', '');
        set('backgroundtype', 'image');
        set('backgroundcolor', darkmode ? '#20262d' : '#ffffff');
        set('livetype', '');
        set('livecolor1', '');
        set('livecolor2', '');
        set('livecolor3', '');
        set('ui', 0);
        set('uiblur', 0);
        set('fontname', 'Open Sans');
        set('theme', 'light');
        set('preset', 'Standaard');
        set('layout', 1);
        set('profilepic', '');
        set('username', '');
        set('brightness', '100%');
        set('contrast', '100%');
        set('saturate', '100%');
        set('opacity', '100%');
        set('huerotate', '0deg');
        set('grayscale', '0%');
        set('sepia', '0%');
        set('invert', '0%');
        set('blur', '0px');
        set('menuwidth', 110);
        set('isbackgroundvideo', false);
        set('customfont', '');
        set('customfontname', '');
        set('letterbeoordelingen', '');
        set('customcss', '');
        set('loginschool', '');
        set('loginname', '');
        set('loginpass', '');
        menuWidth = 110;
        let i = 0;
        while (!n(get('background' + i))) {
            set('background' + i, '');
            i++;
        }
        if (tn('sl-account-modal', 0)) {
            execute([openSettings, profilePicture]);
        }
    }

    // Check if user is new. If so, save some values and display a welcome message.
    function checkNewUser() {
        if (n(get('firstused'))) {
            set('birthday', '00-00-0000');
            set('lastjubileum', 0);
            execute([reset]);
            tn('head', 0).insertAdjacentHTML('afterbegin', '<style>#mod-welcome{background:#0005;position:fixed;top:0;left:0;width:100%;height:100%;z-index:1000;transition:opacity 0.3s ease;}#mod-welcome > div{width:355px;transform:translate(-50%, -50%);top:50%;position:absolute;left:50%;background: var(--bg-elevated-none);border-radius:16px;overflow:hidden;overflow-y:scroll;max-width:calc(100% - 30px);max-height:calc(100% - 30px);}#mod-welcome > div > div:first-child{background:#09f;height:130px;display:flex;justify-content:center;align-items:center}#mod-welcome>div>div>svg{width:70px;height:35%;transition:transform .3s ease;cursor:pointer;}#mod-welcome > div > div:last-child{padding:15px 20px;}#mod-welcome h2{font-weight:400;}#mod-welcome input[type=checkbox]{width:20px;display:inline-block;height:20px;}#mod-welcome label{user-select:none;vertical-align:top;display:inline-block;padding-left:10px;margin-bottom:25px;font-size:14px;max-width:calc(100% - 35px);}div:hover > svg .glasses{animation:1s glasses linear forwards;}@keyframes glasses{0%{transform:translateY(-60px);opacity:0;}50%{transform:translateY(-30px);opacity:1;}100%{transform:translateY(0px);opacity:1;}}@media (min-width: 370px) and (min-height:700px){#mod-welcome > div{overflow-y:hidden;}#mod-welcome > div > div:first-child{height:200px;}#mod-welcome > div > div:last-child{padding:30px;}}</style>');
            const welcomecontent = platform == 'Android' ? '<h2>Welkom!</h2><p>Je hebt net de Somtoday Mod Android APK geïnstalleerd. Met deze app kun je alles wat je ook in de normale Somtoday app kan, plus nog veel meer doordat Somtoday Mod erbij zit.</p><p>Voordat je doorgaat, deze app is niet geaffilieerd met Somtoday. Gebruik is op eigen risico. Zorg ervoor dat je regelmatig op updates checkt om de app up to date te houden.</p>' : '<h2>Somtoday Mod is ge&iuml;nstalleerd!</h2><p>Stel achtergronden in, krijg inzicht in je cijfers en meer met Somtoday Mod!</p><p>' + (hasSettingsHash ? 'Laten we meteen beginnen!' : 'Meteen naar de instellingen gaan?') + '</p>';
            id('somtoday-mod').insertAdjacentHTML('afterbegin', '<div id="mod-welcome"><div><div>' + window.logo('mod-welcome-logo', null, '#fff') + '</div><div>' + welcomecontent + '<br><input type="checkbox" id="errordata"><label for="errordata">Verstuur error-data om bugs te fixen</label><div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">' + (hasSettingsHash ? '' : '<div tabindex="0" class="mod-button" id="mod-welcome-open-settings">' + window.getIcon('gear', null, 'var(--fg-on-primary-weak)') + '<span>Instellingen</span></div>') + '<div tabindex="0" class="mod-button" id="mod-welcome-close">Sluiten</div></div></div></div></div>');
            function closeWelcomeDialog() {
                set('firstused', year + '-' + (month + 1) + '-' + dayInt);
                id('mod-welcome').style.opacity = '0';
                if (id('errordata').checked) {
                    // Permission for sending debug-data
                    set('bools', get('bools').replaceAt(4, '1'));
                }
                setTimeout(function () {
                    tryRemove(id('mod-welcome'));
                }, 400);
            }
            if (!hasSettingsHash) {
                id('mod-welcome-open-settings').addEventListener('click', function () {
                    closeWelcomeDialog();
                    openModSettingsDirectly(true);
                });
            }
            id('mod-welcome-close').addEventListener('click', function () {
                closeWelcomeDialog();
                if (hasSettingsHash) {
                    execute([openSettings]);
                }
            });
            id('mod-welcome-logo').addEventListener('click', function () {
                this.style.transform = 'scale(1.3)';
                setTimeout(function () {
                    id('mod-welcome-logo').style.transform = 'scale(1)';
                }, 300);
            });
        }
    }

    function addSlider(name, property, min, max, unit, defaultValue) {
        let value = get(property);
        if (get(property) == null || get(property) == '' || isNaN(parseInt(get(property)))) {
            value = (defaultValue + unit);
        }
        return '<div class="mod-slider"><p>' + name + '</p><input id="' + property + '" title="' + name + '" data-property="' + property + '" data-unit="' + unit + '" type="range" min="' + min + '" max="' + max + '" step="' + (property == 'blur' ? 0.25 : 1) + '" value="' + value.match(/\d+(\.\d+)?/)[0] + '" /><p>' + value + '</p></div>';
    }

    // Constructs HTML code for the setting page
    function addSetting(name, description, key, type, value, param1, param2, param3, param4, param5, param6) {
        if (get(key) == null && !key.startsWith('bools')) {
            set(key, value);
        }
        let code = '<div>' + (n(name) ? '' : '<h3>' + name + '</h3>') + ((n(description) || type == 'checkbox') ? '' : '<div><p>' + description + '</p></div>');
        if (type == 'checkbox') {
            if (key.startsWith('bools')) {
                code += '<label tabindex="0" class="switch" for="' + key + '"><input title="' + name + '" class="mod-custom-setting" type="checkbox" ' + (get('bools').charAt(parseInt(key.charAt(5) + key.charAt(6))) == '1' ? 'checked' : '') + ' oninput="this.classList.add(\'mod-modified\');" id="' + key + '"/><div class="slider round"></div></label>';
            } else {
                code += '<label tabindex="0" class="switch" for="' + key + '"><input title="' + name + '" class="mod-custom-setting" type="checkbox" ' + (get(key) ? 'checked' : '') + ' oninput="this.classList.add(\'mod-modified\');" id="' + key + '"/><div class="slider round"></div></label>';
            }
            code += (n(description) ? '' : '<p>' + description + '</p>');
        } else if (type == 'range') {
            code += '<div class="mod-range-preview">' + window.getIcon(param5, null, 'var(--fg-on-primary-weak)', 'style="' + (param6 == 'opacity' ? 'opacity:' + parseFloat((100 - (param4 != null ? value : get(key))) / 100).toString() : 'filter:' + param6 + '(' + parseFloat((param4 != null ? value : get(key)) / 4).toString() + 'px)') + '"') + '</div><input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="range" value="' + (param4 != null ? value : get(key)) + '" min="' + param1 + '" max="' + param2 + '" step="' + param3 + '" oninput="this.classList.add(\'mod-modified\');this.parentElement.children[4].innerHTML=this.value;this.parentElement.getElementsByClassName(\'mod-range-preview\')[0].children[0].setAttribute(\'style\', \'' + (param6 == 'opacity' ? 'opacity:\'+parseFloat((100 - this.value) / 100).toString()+\'' : 'filter:' + param6 + '(\'+parseFloat(this.value / 4).toString()+\'px)') + '\');"/><p>' + (param4 != null ? value : get(key)) + '</p><p>%</p>';
        } else if (type == 'text' || type == 'password') {
            code += '<input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="' + type + '" placeholder="' + param1 + '" value="' + get(key).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') + '">';
        } else if (type == 'number') {
            code += '<div class="br"></div><input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="number" placeholder="' + param1 + '" value="' + get(key) + '">';
        } else if (type == 'color') {
            code += `
            <div class="br"></div>
            <div class="br"></div>
            <input
                type="color"
                title="${name ?? 'Kleur kiezen'}"
                class="mod-custom-setting"
                value="${n(get(key)) ? value : get(key)}"
                id="${key}"
                oninput="
                    this.classList.add('mod-modified');
                    this.nextElementSibling.getElementsByClassName('mod-color')[0].style.background = this.value;
                    this.nextElementSibling.getElementsByClassName('mod-color-textinput')[0].value = this.value;
                    this.nextElementSibling.getElementsByClassName('mod-color-textinput')[0].style.color = 'var(--fg-on-primary-weak)';
                "
            >
            <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
            <label tabindex="0" class="mod-color" for="${key}" style="background: ${n(get(key)) ? value : get(key)}">
                <p>Kies een kleur</p>
            </label>
            <input
                class="mod-color-textinput"
                title="Voer een hex kleurencode in"
                value="${n(get(key)) ? value : get(key)}"
                oninput="
                    if (/^#?([a-fA-F0-9]{6})$/.test(this.value)) {
                        this.parentElement.previousElementSibling.value = this.value;
                        this.style.color = 'var(--fg-on-primary-weak)';
                        this.parentElement.getElementsByClassName('mod-color')[0].style.background = this.value;
                    } else if (/^#?([a-fA-F0-9]{3})$/.test(this.value)) {
                        const sixDigitCode = '#' + this.value.charAt(1) + this.value.charAt(1) + this.value.charAt(2) + this.value.charAt(2) + this.value.charAt(3) + this.value.charAt(3);
                        this.parentElement.previousElementSibling.value = sixDigitCode;
                        this.style.color = 'var(--fg-on-primary-weak)';
                        this.parentElement.getElementsByClassName('mod-color')[0].style.background = sixDigitCode;
                    } else {
                        this.style.color = 'darkred';
                    }
                "
                onblur="
                    this.parentElement.previousElementSibling.dispatchEvent(new Event('input'));
                "
            >
            </div>
            `;
        } else if (type == 'file') {
            code += `
            <input
                ${n(param2) ? '' : ' title="' + name + '" data-size="' + param2 + '"'}
                class="mod-file-input mod-custom-setting"
                type="file"
                accept="${param1}" id="${key}"
                oninput="
                    const fileLabel = this.nextElementSibling.getElementsByClassName('mod-file-label')[0];
                    fileLabel.classList.remove('mod-active');
                    if (this.files.length != 0) {
                        const name = this.files[0].name.toLowerCase();
                        if (
                            (this.accept == 'image/*' && this.files[0]['type'].startsWith('image/')) ||
                            (this.accept == 'image/*, video/*' && (this.files[0]['type'].startsWith('image/') || this.files[0]['type'].startsWith('video/'))) ||
                            (this.accept != 'image/*, video/*' && this.accept != 'image/*')
                        ) {
                            for (const btn of this.nextElementSibling.getElementsByClassName('mod-active')) {
                                btn.classList.remove('mod-active');
                            }
                            fileLabel.children[1].innerText = name;
                            fileLabel.classList.add('mod-active');
                        } else {
                            fileLabel.children[1].innerText = 'Kies een bestand';
                            this.value = null;
                        }
                    } else {
                        fileLabel.children[1].innerText = 'Kies een bestand';
                    }
                "
            >
            <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
                <label tabindex="0" class="mod-file-label" for="${key}">
                    ${window.getIcon('upload', null, 'var(--fg-on-primary-weak)')}
                    <span>Kies een bestand</span>
                </label>
                <div tabindex="0" class="mod-button mod-file-reset" data-key="${key}">${window.getIcon('rotate-left', null, 'var(--text-moderate)')}<span>Reset</span></div>
                ${param3 ?? ''}
            </div>
            `;
        } else if (type == 'textarea') {
            code += '<textarea title="' + name + '" class="mod-custom-setting" id="' + key + '" placeholder="' + (param1 || '') + '" rows="' + (param2 || '10') + '">' + get(key).replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</textarea>';
        }
        code += '</div>';
        return code;
    }

    // Add a theme to the modsettings. Can only be called at the modsettings page.
    function addTheme(name, url, primaryColor, secondaryColor) {
        if (n(id('theme-wrapper'))) {
            return;
        }
        themeCount++;

        // URL can be a URL to an image, but also a Pexels ID.
        let smallimg = url;
        let bigimg = url;
        let preview;
        if (!isNaN(parseInt(url))) {
            smallimg = 'https://images.pexels.com/photos/' + url + '/pexels-photo-' + url + '.jpeg?auto=compress&cs=tinysrgb&w=250';
            bigimg = 'https://images.pexels.com/photos/' + url + '/pexels-photo-' + url + '.jpeg?auto=compress&cs=tinysrgb&w=1600';
        }
        let themeclass = '';
        if (get('preset') == name) {
            if (get('primarycolor') == primaryColor) {
                themeclass = ' theme-selected-set';
            } else {
                set('theme', '');
            }
        }
        // Set empty image as theme background if no url is given
        if (url) {
            preview = `<img src="${smallimg}" alt="Achtergrondafbeelding: ${name}" loading="lazy">`;
        }
        else {
            preview = '<span></span>';
        }
        const hidden = themeCount > 10 ? 'style="display: none;"' : '';
        id('theme-wrapper').insertAdjacentHTML('beforeend', `
            <div ${hidden} tabindex="0" class="theme${themeclass}" id="${name}" data-name="${name}"${bigimg ? ` data-url="${bigimg}"` : ''} data-color="${primaryColor}" data-secondary-color="${secondaryColor}">
                ${preview}
                <h3>
                    <div style="background:${primaryColor};" title="${primaryColor}"></div>
                    ${name}
                </h3>
            </div>
        `);
        id(name).addEventListener('click', function () {
            for (const element of cn('theme')) {
                element.classList.remove('theme-selected-set');
                element.classList.remove('theme-selected');
            }
            id(name).classList.add('theme-selected');
        });
    }

    // Open modsettings directly when hash is #mod-settings
    async function openModSettingsDirectly(forceOpen = false) {
        if (window.location.hash == '#mod-settings' || get('opensettingsIntention') == '1' || forceOpen) {
            if (tn('sl-modal', 0)) {
                return;
            }

            if (!forceOpen) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            tn('sl-header', 0).getElementsByTagName('div')[0].click();

            let i = 0, j = 0;
            while (n(cn('selector-option instellingen', 0))) {
                await new Promise(resolve => setTimeout(resolve, 100));
                // Wait on popup for 20 x 100 = 2000ms, then try clicking element again
                if (i > 20) {
                    i = 0;
                    j++;
                    // Stop after 3 retries
                    if (j > 3) {
                        set('opensettingsIntention', '0');
                        return;
                    }
                    tn('sl-header', 0).getElementsByTagName('div')[0].click();
                }
                i++;
            }

            cn('selector-option instellingen', 0).click();

            i = 0;
            while (n(id('mod-setting-button'))) {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (i > 20) {
                    set('opensettingsIntention', '0');
                    return;
                }
                i++;
            }

            id('mod-setting-button').click();
            set('opensettingsIntention', '0');
            history.replaceState('', document.title, window.location.pathname + window.location.search);
        }
    }

    // Insert modsettings link in the setting menu
    function insertModSettingLink() {
        if (tn('sl-account-modal', 0) && tn('sl-account-modal', 0).getElementsByTagName('sl-account-modal-tab')[0] && n(id('mod-setting-button'))) {
            let modbtn = tn('sl-account-modal', 0).getElementsByTagName('sl-account-modal-tab')[tn('sl-account-modal', 0).getElementsByTagName('sl-account-modal-tab').length - 1].cloneNode(true);
            modbtn.id = 'mod-setting-button';
            modbtn.classList.remove('active');
            modbtn.ariaSelected = false;
            modbtn.addEventListener('click', openSettings);
            modbtn.getElementsByTagName('span')[0].innerHTML = 'Mod-instellingen';
            modbtn.getElementsByTagName('i')[0].style.background = darkmode ? '#603d20' : '#ffefe3';
            modbtn.getElementsByTagName('i')[0].style.paddingBottom = '2px';
            modbtn.getElementsByTagName('i')[0].innerHTML = window.getIcon('gear', null, '#ea9418', 'style="width:16px;height:16px;"');
            tn('sl-account-modal', 0).getElementsByTagName('nav')[0].appendChild(modbtn);
            for (const element of tn('sl-account-modal-tab')) {
                if (element.id != 'mod-setting-button') {
                    element.addEventListener('click', function () { closeSettings(element) });
                }
            }
            setTimeout(function () {
                // Save username and birthday
                if (cn('data-container', 1) && cn('data-container', 1).getElementsByClassName('ng-star-inserted')[0] && n(get('realname'))) {
                    set('realname', cn('data-container', 1).getElementsByClassName('ng-star-inserted')[0].innerHTML);
                }
                for (const parent of cn('data-container')) {
                    for (const element of parent.children) {
                        if (!n(element.getAttribute('aria-label'))) {
                            if (element.getAttribute('aria-label').toLowerCase().indexOf('geboortedatum') != -1) {
                                set('birthday', element.innerHTML);
                            }
                        }
                    }
                }
            }, 200);

        }
        // Update background of modsetting link in settings menu
        else if (id('mod-setting-button')) {
            id('mod-setting-button').getElementsByTagName('i')[0].style.background = darkmode ? '#603d20' : '#ffefe3';
        }
    }



    // Executes when page changes
    function pageUpdate(updateStyle = true, updateLogo = true) {
        if (busy || isRecapping) {
            return;
        }
        darkmode = tn('html', 0).classList.contains('dark') || tn('html', 0).classList.contains('night');
        busy = true;
        execute([gradeReveal, userName, teacherNicknames, insertModSettingLink, insertGradeDownloadButton, subjectGradesPage, somtodayRecap, rosterSimplify, newYearCountdown, topMenu, easterEggs, editGrades, browserSettings, initTheme]);
        if (updateStyle) {
            execute([updateCssVariables]);
        }
        if (updateLogo) {
            execute([modLogo]);
        }
        // Allow this function to be executed again after 1ms
        setTimeout(function () {
            busy = false;
        }, 1);
    }

    // Execute pageUpdate when page changes
    function addMutationObserver() {
        // If the page panel changes, do pageUpdate.
        const pageobserver = new MutationObserver(() => {
            if (!busy) {
                setTimeout(function () { execute([pageUpdate]); }, 5);
            }
        });
        pageobserver.observe(tn('html', 0), {
            attributes: false,
            subtree: true,
            childList: true
        });
        const darkModeObserver = new MutationObserver(() => {
            setTimeout(function () { execute([updateCssVariables]); }, 5);
        });
        darkModeObserver.observe(tn('html', 0), {
            attributes: true,
            subtree: false,
            childList: false
        });
        window.addEventListener('click', function () { pageUpdate(false, true) });
    }





    // SERVER REQUESTS

    // Check if updates are available - userscript only (user initiated)
    function checkUpdate() {
        fetch('https://jonazwetsloot.nl/somtoday-mod-update-checker?v=' + version).then(function (response) {
            if (response.ok) {
                return response.text();
            }
            return Promise.reject(response);
        }).then(text => {
            if (text == 'Newest') {
                modMessage('Geen updates gevonden', 'Helaas, er zijn geen updates gevonden.', 'Oke');
                id('mod-message-action1').addEventListener('click', closeModMessage);
            } else if (text == 'Optional') {
                modMessage('Kleine update gevonden', 'Er is een kleine update gevonden. Wil je de update installeren?', 'Ja', 'Nee');
                if (platform == 'Userscript') {
                    id('mod-message-action1').addEventListener('click', function () { window.open('https://jonazwetsloot.nl/userscripts/SomtodayMod' + (minified ? '' : 'Unminified') + '.user.js'); });
                }
                else {
                    id('mod-message-action1').addEventListener('click', function () { window.open('https://jonazwetsloot.nl/versions/somtoday-mod'); });
                }
                id('mod-message-action2').addEventListener('click', closeModMessage);
            } else if (text == 'Update') {
                modMessage('Update gevonden', 'Er is een update gevonden. Wil je de update installeren?', 'Ja', 'Nee');
                if (platform == 'Userscript') {
                    id('mod-message-action1').addEventListener('click', function () { window.open('https://jonazwetsloot.nl/userscripts/SomtodayMod' + (minified ? '' : 'Unminified') + '.user.js'); });
                }
                else {
                    id('mod-message-action1').addEventListener('click', function () { window.open('https://jonazwetsloot.nl/versions/somtoday-mod'); });
                }
                id('mod-message-action2').addEventListener('click', closeModMessage);
            }
            else {
                modMessage('Fout', 'Somtoday Mod kan de reactie van de server niet begrijpen.', 'Oke');
                id('mod-message-action1').addEventListener('click', closeModMessage);
            }
        }).catch((response) => {
            modMessage('Fout', 'Er kon niet op updates worden gechecked. Het kan zijn dat de server van Somtoday Mod down is of dat je wifi uitstaat.', 'Oke');
            id('mod-message-action1').addEventListener('click', closeModMessage);
        });
    }

    // Convert an image URL to a base64 image
    function toDataURL(url, callback) {
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {
            let reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

    // Execute everything
    execute([updateCheck, checkNewUser, setBackground, updateCssVariables, style, addMutationObserver, browserSettings, congratulations, openModSettingsDirectly, profilePicture, initTheme, consoleMessage]);

    // Allow transitions after 0.4s
    setTimeout(function () {
        tryRemove(id('transitions-disabled'));
    }, 400);
}
