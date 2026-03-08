// MAIN FUNCTIONS

// CACHE FOR ANDROID APP
const saveCache = () => {
    setTimeout(async () => {
        const docClone = document.documentElement.cloneNode(true);

        let combinedCSS = '';

        document.querySelectorAll('style').forEach(style => {
            combinedCSS += style.innerHTML + '\n';
        });

        const styleSheets = Array.from(document.styleSheets);
        for (const sheet of styleSheets) {
            try {
                if (sheet.href) {
                    const res = await fetch(sheet.href);
                    combinedCSS += await res.text() + '\n';
                }
            } catch (e) {}
        }

        const styleTag = document.createElement('style');
        styleTag.innerHTML = combinedCSS;

        const cloneHead = docClone.querySelector('head');
        if (cloneHead) cloneHead.appendChild(styleTag);

        const htmlContent = docClone.outerHTML;
        browser.runtime.sendNativeMessage("somtodaymod", {
            type: "SAVE_CACHE",
            html: htmlContent
        });
    }, 2000);
};
window.addEventListener('load', saveCache);
window.addEventListener('popstate', saveCache);
(function(history){
    const pushState = history.pushState;
    history.pushState = function(state) {
        if (typeof history.onpushstate == "function") {
            history.onpushstate({state: state});
        }
        const result = pushState.apply(history, arguments);
        saveCache();
        return result;
    };
})(window.history);

function onload() {

    // Make sure to have only one instance of the mod active at a time
    if (!n(id('somtoday-mod-active'))) {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD:\nMultiple instances of Somtoday Mod are running.\nSomtoday Mod ' + platform + ' v' + version + ' will not be working until the other instance is deleted or deactivated.'));
        return;
    }

    const mathQuestions = ['compose the formula of f\'x() where f(x) = 2 * sin(9x + 3)', 'rewrite 2 * log3(243) + 28 to the form of log(a)', 'find the value(s) of x in the equation x^2 + 9 = -6x', 'give the point(s) where  12 = 2y + 6x and y = x^2 - 5x intersect (round on 2 decimals)', 'rewrite -sin(8x) to the form of cos(ax + b)'];
    const mathAnswers = ['Answer: f\'(x) = 18 * cos(9x + 3)', 'Answer: log(10^38)', 'Answer: x = -3', 'Answer: (-1,65; 10,94), (3,65; -4,94)', 'Answer: cos(8x + 0.5pi)'];
    const selectedQuestion = Math.floor(Math.random() * mathQuestions.length);
    tn('body', 0).insertAdjacentHTML('beforeend', '<div id="somtoday-mod"><div id="somtoday-mod-active" data-platform="' + platform + '" data-version="' + version + '"><!-- Well hello there! Great work, detective. --><!-- Nothing better to do? Solve this math question: ' + mathQuestions[selectedQuestion] + ' --><div data-info="expand-to-view-answer"><!-- ' + mathAnswers[selectedQuestion] + ' --></div></div></div>');

    // Stop script if 502 error occurs
    if (!n(cn('cf-error-details cf-error-502', 0))) {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Bad gateway (502)'));
        return;
    }

    // Stop script if any other error occurs
    if (!n(tn('sl-error', 0))) {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Unknown error'));
        execute([errorPage]);
        return;
    }

    // Stop script if Somtoday has outage
    if (!n(cn('titlewrap', 0))) {
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
    if (!n(tn('sl-root', 0))) {
        somtodayversion = tn('sl-root', 0).getAttribute('ng-version');
    }
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
            if (!n(tn('sl-modal', 0))) {
                tn('sl-modal', 0).inert = false;
            }
        }
    });

    // Write message in the console
    function consoleMessage() {
        setTimeout(console.log.bind(console, "%cSomtoday Mod is geactiveerd!", "color:#0067c2;font-weight:bold;font-family:Arial;font-size:26px;"));
        setTimeout(console.log.bind(console, "%cGeniet van je betere versie van Somtoday.\n\nMet dank aan " + Object.keys(contributors).join(', ') + "\n" + (n(somtodayversion) ? 'Onbekende versie' : 'Versie ' + somtodayversion) + " van Somtoday\nVersie " + version_name + " van Somtoday Mod " + platform, "color:#0067c2;font-weight:bold;font-family:Arial;font-size:16px;"));
    }

    function initTheme() {
        const theme = get('theme');
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
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-easter-eggs">#blue-screen-of-death{position:fixed;top:0;left:0;z-index:10000;width:100%;height:100%;background:#1173aa;}#blue-screen-of-death svg{user-select:none;pointer-events:none;position:absolute;top:50%;box-sizing:border-box;transform:translateY(-50%);width:100%;}#mod-logo-decoration{position:absolute;width:50px;right:5px;top:65px;transition:transform 0.3s,opacity 0.3s;}#mod-logo-decoration.mod-logo-decoration-clicked{opacity:0;}#mod-logo-decoration:hover{transform:scale(1.1);}#mod-logo-hat{z-index:1;width:80px;height:80px;position:absolute;left:-6px;top:-9px;transform:rotate(-20deg);transition:transform 0.3s,left 0.3s,opacity 0.3s;}#mod-logo-hat:hover{transform:rotate(-30deg);left:-12px;}#mod-logo-hat.mod-logo-hat-clicked{animation:1s hatfalloff forwards;}@keyframes hatfalloff{0%{transform:rotate(-30deg);left:-12px;top:-9px;opacity:1;}90%{opacity:1;}100%{transform:rotate(-140deg);left:-90px;top:75px;opacity:0;}}body.easter-egg-shaking .background.ng-trigger{pointer-events:none !important;}@media(max-width:1279px){#mod-logo-hat{left:-15px;}#mod-logo-hat:hover{left:-20px;}}#somtoday-mod-version-easter-egg:active{border:2px solid var(--bg-primary-normal);border-radius:6px}.mod-easter-egg-logo{position:fixed;z-index:100000000;animation:8s logowalk infinite;width:200px;height:200px;}@keyframes logowalk{0%{bottom:10%;left:-210px;}20%{bottom:20%;left:80%;transform:rotate(40deg);}40%{bottom:40%;left:10px;transform:rotate(60deg);}60%{bottom:90%;left:50%;transform:rotate(-60deg);}80%{bottom:50%;left:90%;transform:rotate(10deg);}100%{bottom:10%;left:-210px;}}body.rainbow{animation:rainbow 4s infinite;}body.rainbow #mod-background{opacity:0.25;}@keyframes rainbow{100%,0%{background-color: rgb(255,0,0);}8%{background-color: rgb(255,127,0);}16%{background-color: rgb(255,255,0);}25%{background-color: rgb(127,255,0);}33%{background-color: rgb(0,255,0);}41%{background-color: rgb(0,255,127);}50%{background-color: rgb(0,255,255);}58%{background-color: rgb(0,127,255);}66%{background-color: rgb(0,0,255);}75%{background-color: rgb(127,0,255);}83%{background-color: rgb(255,0,255);}91%{background-color: rgb(255,0,127);}}body.barrelroll{animation:barrelroll 2s 0.1s infinite;}@keyframes barrelroll{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}' + ((get('layout') == 1 || get('layout') == 4) ? '@media (max-width:767px){#mod-logo-inserted,#mod-logo-hat{display:none;}}' : '') + '</style>');
            let i = 0;
            let j = 0;
            let k = 0;
            let l = 0;
            let m = 0;
            let n = 0;
            let p = 0;
            document.addEventListener('keydown', function (e) {
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
                    tn('body', 0).classList.add('barrelroll');
                    setTimeout(function () {
                        tn('body', 0).classList.remove('barrelroll');
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
                        tn('body', 0).classList.add('barrelroll');
                        setTimeout(function () {
                            tn('body', 0).classList.remove('barrelroll');
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
                        let tada = new Audio(getAudioUrl('tada'));
                        tada.volume = 0.5;
                        tada.play();
                    } catch (e) {
                        console.warn(e);
                    }
                    p = 0;
                }
            });
        }
        if (!n(id('somtoday-mod-version-easter-egg')) && !id('somtoday-mod-version-easter-egg').classList.contains('mod-easter-egg')) {
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
            if (!n(tn('sl-bericht-acties', 0))) {
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
                const elements = tn('sl-rooster-week-header', 0).getElementsByClassName('mod-huiswerk');
                for (const element of elements) {
                    element.remove();
                }
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
            // Viewing Aug-Dec while in Jan-Jul, user is looking at previous year
            else {
                dateString += (year - 1).toString();
            }
        }
        else {
            // Viewing Jan-Jul while in Aug-Dec, user is looking at next year
            if (month + 1 <= 7) {
                dateString += (year + 1).toString();
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
        let icons = {
            'edit': '--fg-warning-normal',
            'homework': '--fg-primary-normal',
            'assignment': '--fg-alternative-normal',
            'test': '--fg-warning-normal',
            'test': '--fg-negative-normal',
            'book': '--fg-warning-normal',
            'clock': '--fg-warning-normal',
            'palm': '--fg-on-positive-weak',
        };
        let iconHTML = '';
        for (const icon of Object.keys(icons)) {
            iconHTML += getIcon(icon, 'mod-homework-icon' + (activeIcon == icon ? ' mod-active' : ''), 'var(' + icons[icon] + ')', 'data-icon="' + icon + '" ');
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
            element.insertAdjacentHTML('beforeend', '<div class="mod-add-homework">' + getIcon('plus') + 'Taak toevoegen</div>');
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
                        'date': dateObject.toISOString(), // Store as ISO string for reliable parsing
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
                // Robust date parsing that handles ISO strings and various formats
                let homeworkDate;
                try {
                    // Try parsing as ISO string first (most reliable)
                    if (typeof homework[i].date === 'string' && homework[i].date.includes('T')) {
                        homeworkDate = new Date(homework[i].date);
                    } else {
                        homeworkDate = new Date(Date.parse(homework[i].date));
                    }
                    // Validate the date is valid
                    if (isNaN(homeworkDate.getTime())) {
                        console.warn('Invalid homework date:', homework[i].date);
                        return; // Skip this homework item
                    }
                } catch (e) {
                    console.error('Error parsing homework date:', homework[i].date, e);
                    return; // Skip this homework item
                }
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
                        insertElement.insertAdjacentHTML('afterend', '<div class="mod-huiswerk ' + (done ? 'mod-huiswerk-done' : (noMoving ? '' : 'mod-before')) + ' mod-homework-' + homework[i].id + '"' + (homework[i].color ? ' style="border-left-color:' + homework[i].color + '"' : '') + '>' + getIcon(homework[i].icon ? homework[i].icon : 'edit', null, homework[i].color) + '<strong>' + sanitizeString(homework[i].subject) + '</strong><p>' + sanitizeString(homework[i].description) + '</p><div><svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" viewBox="0 0 24 24" display="block"><path fill-rule="evenodd" d="m9.706 21.576 13.876-14.05c.538-.55.56-1.43.044-1.998l-2.769-3.06a1.41 1.41 0 0 0-2.076-.025L9.83 11.858a1.41 1.41 0 0 1-2.06-.01L5.424 9.342a1.414 1.414 0 0 0-2.041-.032l-2.96 2.982a1.45 1.45 0 0 0 .003 2.052l7.27 7.242c.56.555 1.455.552 2.01-.01"></path></svg></div></div>');
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
                                element.getElementsByTagName('svg')[0].outerHTML = getIcon(homework[i].icon ? homework[i].icon : 'edit', null, homework[i].color);
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
                                if (!n(tn('sl-modal', 0))) {
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
            tn('body', 0).insertAdjacentHTML('beforeend', '<div id="mod-top-menu"><h2 id="mod-top-menu-title">Titel</h2><div id="mod-logout">' + getIcon("right-from-bracket") + '</div><div id="mod-messages">' + getIcon("envelope") + '</div><div id="mod-profile-link"></div></div>');
            id('mod-profile-link').addEventListener('click', function () {
                cn('menu-avatar', 0).click();
            });
            id('mod-logout').addEventListener('click', function () {
                cn('menu-avatar', 0).click();
                tryRemove(id('mod-top-menu'));
                let checkLogoutButtonPresent = setInterval(function () {
                    if (!n(cn('selector-option uitloggen', 0))) {
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
        else if (!n(cn('avatar', 0)) && !n(cn('avatar', 0).getElementsByClassName('foto')[0]) && !n(id('mod-profile-link'))) {
            id('mod-profile-link').innerHTML = '<div>' + (cn('avatar', 0).getElementsByClassName('foto')[0].classList.contains('hidden') ? '<span>' + ((!n(cn('avatar', 0).getElementsByClassName('initials')[0]) && !n(cn('avatar', 0).getElementsByClassName('initials')[0].children[0])) ? cn('avatar', 0).getElementsByClassName('initials')[0].children[0].innerHTML : '?') + '</span>' : '<img src="' + (n(get('profilepic')) ? cn('avatar', 0).getElementsByClassName('foto')[0].src : get('profilepic')) + '" />') + '</div>';
        }
        if (!n(id('mod-top-menu-title'))) {
            let headerText = '';
            for (const element of tn('sl-tab-item')) {
                if (element.classList.contains('active')) {
                    headerText = element.getElementsByTagName('span')[0].innerHTML;
                }
            }
            if (n(headerText)) {
                if (!n(cn('desktop-title', 0))) {
                    headerText = cn('desktop-title', 0).innerHTML;
                }
                else if (!n(tn('sl-scrollable-title', 0))) {
                    headerText = tn('sl-scrollable-title', 0).innerHTML;
                }
            }
            id('mod-top-menu-title').innerHTML = headerText;
        }
    }

    // Reveal new grades with an animation
    function gradeReveal() {
        if (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) != '0') {
            if (!n(tn('sl-laatsteresultaten', 0)) && !n(tn('sl-resultaat-item', 0))) {
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
                        if (!isNaN(parseFloat(element.children[0].innerHTML))) {
                            countanimation(element.children[0], 0, parseFloat(element.children[0].innerHTML.replace(',', '.')), 2500, 50);
                        }
                        element.classList.add('mod-animation-finished');
                        i++;
                    }
                }
            }
        }
    }

    // Simple count animation
    function countanimation(element, begin, target, time, update, exact) {
        let value;
        if (exact == undefined) {
            value = begin;
        } else {
            value = exact;
        }
        value = value + (target - begin) / (time / update);
        if (value >= target && begin <= target || value <= target && begin >= target) {
            element.innerHTML = target.toFixed(1).replace('.', ',');
        } else {
            exact = value;
            element.innerHTML = value.toFixed(1).replace('.', ',');
            setTimeout(countanimation, update, element, begin, target, time, update, exact);
        }
    }

    const settingKeys = ['primarycolor', 'secondarycolor', 'nicknames', 'bools', 'title', 'icon', 'background', 'backgroundtype', 'backgroundcolor', 'transparency', 'ui', 'uiblur', 'fontname', 'theme', 'layout', 'profilepic', 'username', 'brightness', 'contrast', 'saturate', 'opacity', 'huerotate', 'grayscale', 'sepia', 'invert', 'blur', 'homework', 'menuwidth', 'isbackgroundvideo', 'customfont', 'customfontname', 'letterbeoordelingen'];
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
                    if (!n(tn('sl-modal', 0))) {
                        tn('sl-modal', 0).inert = false;
                    }
                });
                id('mod-message-action2').addEventListener('click', function () {
                    set('nicknames', value);
                    closeModMessage();
                    saveReload(true);
                    tn('sl-root', 0).inert = false;
                    if (!n(tn('sl-modal', 0))) {
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
                    if (!n(tn('sl-modal', 0))) {
                        tn('sl-modal', 0).inert = false;
                    }
                });
                id('mod-message-action2').addEventListener('click', function () {
                    set('username', value);
                    closeModMessage();
                    saveReload(true);
                    tn('sl-root', 0).inert = false;
                    if (!n(tn('sl-modal', 0))) {
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
            if (!n(tn('sl-modal', 0))) {
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

    // [GENERATION] INSERT_FIREWORKSJS

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
        if (get('bools').charAt(BOOL_INDEX.ROSTER_SIMPLIFY) == "1" && !n(tn('sl-rooster-weken', 0))) {
            if (!n(cn('tertiary normal action-primary-normal center', 0)) && !cn('tertiary normal action-primary-normal center', 0).classList.contains('mod-vandaag-button-event-listener-added')) {
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
                            if (!n(tn('sl-rooster-tijden', 0))) {
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
                    if (isWeekShown && !n(cn('tijdlijn', 0))) {
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
                            if (isWeekShown && !isNaN(lessonTime) && !n(cn('tijdlijn', 0)) && (currentTime < lessonTime) && !timeIndicatorPositioned && !n(element.parentElement.getElementsByClassName('tijdlijn')[0])) {
                                if (!n(cn('tijdlijn', 0))) {
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
                    if (!n(tn('sl-vakantie-header', 0))) {
                        tn('sl-vakantie-header', 0).style.borderTop = 'none';
                    }
                    // Update the time text at the left to display 'nth hour' instead of 'hh:mm'
                    if (isWeekShown && !n(tn('sl-rooster-tijden', 0))) {
                        let i = 1;
                        for (const element of tn('sl-rooster-tijden', 0).children) {
                            let span = element.getElementsByTagName('span')[0];
                            if (n(span)) {
                                if (!n(tn('sl-rooster-tijden', 0).children[1])) {
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
        while (!n(cn('mod-style', 0))) {
            cn('mod-style', 0).remove();
        }
        if (get('bools').charAt(BOOL_INDEX.SCROLLBAR) == '0') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">html, body{scrollbar-width:none !important;}</style>');
        }
        if (get('bools').charAt(BOOL_INDEX.TEXT_SELECTION) == '1') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">*{user-select:auto !important;}</style>');
        }
        // [GENERATION] APPLY_STYLES
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
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (min-width: 767px){.berichten-lijst{height:calc(100vh - 129px) !important;}}@media (min-width:1280px){.menu-avatar{width:calc(100% - 35px) !important;overflow:hidden;justify-content:center;}}</style>');
            }
            else {
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-registratie-overzicht{margin-top:50px;}sl-popup{position:fixed !important;top:130px !important;}hmy-popup:has(sl-leerling-menu-acties){position:fixed !important;top:65px !important;right:30px !important;left:unset !important;}#mod-top-menu{display:none;}@media (min-width: 767px) and (max-width:1279px){.berichten-lijst{height:calc(100vh - 129px) !important;}}@media (min-width: 1280px){#mod-new-year{margin-top:calc(64px + var(--safe-area-inset-top));}:root:has(sl-berichten){--safe-area-inset-top:64px !important;}body:has(sl-cijfers),body:has(sl-berichten) .tabs,body:has(sl-berichten) .main,sl-studiewijzer-weken{margin-top:64px;}.menu-avatar{position:fixed !important;top:25px;right:150px;left:unset !important;bottom:unset !important;opacity:0;}#mod-top-menu-title{color:var(--text-strong);}#mod-top-menu{display:block;border-bottom:var(--thinnest-solid-neutral-normal);background:var(--bg-neutral-none);position:' + (get('bools').charAt(BOOL_INDEX.MENU_ALWAYS_SHOW) == '1' ? 'fixed' : 'absolute') + ';top:0;left:var(--safe-area-inset-left);right:0;height:64px;z-index:50;}#mod-top-menu h2{margin:18px 24px;}#mod-profile-link:hover{filter:brightness(0.8);}#mod-profile-link{transition:0.2s filter ease;box-sizing:border-box;position:absolute;right:24px;cursor:pointer;top:0;bottom:0;height:100%;padding:15px;}#mod-logout{right:145px;}#mod-messages{right:90px;}#mod-logout,#mod-messages{cursor:pointer;position:absolute;padding:15px;top:0;}#mod-logout svg,#mod-messages svg{fill:var(--action-primary-normal);height:25px !important;margin-top:4px;transition:fill 0.2s ease;}#mod-logout:hover svg,#mod-messages:hover svg{fill:var(--action-primary-strong);}#mod-profile-link div{height:100%;aspect-ratio:1 / 1;background:var(--bg-primary-weak);overflow:hidden;border-radius:6px;}#mod-profile-link span{margin:6px 0;text-align:center;width:100%;display:block;font-weight:700;color:var(--fg-on-primary-weak);}#mod-profile-link img{width:100%;height:100%;object-fit:cover;}}</style>');
            }
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (min-width:1280px){:root{--safe-area-inset-' + (get('layout') != 3 ? 'left:120px' : 'right:120px') + ' !important;--min-content-vh:calc(100vh - var(--safe-area-inset-top) - var(--safe-area-inset-bottom)) !important;}sl-header > div:first-of-type i{--action-neutral-normal:' + menuColor + ';}#mod-logo-wrapper{width:120px;' + (get('layout') != 3 ? 'margin-left' : 'left') + ':calc((var(--safe-area-inset-' + (get('layout') != 3 ? 'left' : 'right') + ') - 120px) / 2);position:relative;}#mod-logo{width:65%;height:60px;margin:20px 0;position:relative;left:50%;transform:translateX(-50%);}sl-header sl-tab-bar{--action-neutral-normal:' + menuColor + ';--action-primary-normal:' + menuColor + ';position:absolute !important;width:100% !important;height:100% !important;display:block !important;overflow:hidden;}sl-header .item span{text-align:center;margin-top:10px;display:block;}sl-header .active .item, sl-header .item:hover{background:' + highLightColor + ' !important;padding-top:0 !important;}sl-header .item:hover i{scale:0.9;}sl-header .item i{transition:scale 0.3s ease !important;height:40px;display:block;padding-top:23px;fill:var(--action-neutral-normal) !important;}sl-header .item svg{width:100%;height:40px;}sl-header sl-tab-item, sl-header sl-tab-item .item{height:120px !important;position:relative !important;display:block !important;}sl-popup{z-index:101 !important;}sl-header{position:fixed !important;z-index:15 !important;' + (get('layout') != 3 ? 'left' : 'right') + ':0 !important;top: 0 !important;height:100% !important;border-bottom:0 !important;width:var(--safe-area-inset-' + (get('layout') != 3 ? 'left' : 'right') + ') !important;background:' + get('primarycolor') + ' !important;color:' + menuColor + ' !important;}sl-header > div:first-of-type{position:absolute;bottom:20px;left:17px;--bg-elevated-weakest:' + highLightColor + ';}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width:1279px){#mod-logo-wrapper{width:100px;' + (get('layout') != 3 ? 'margin-left' : 'left') + ':calc((var(--safe-area-inset-' + (get('layout') != 3 ? 'left' : 'right') + ') - ' + ((platform == 'Android' || get('layout') != 3) ? '100px' : '115px') + ') / 2);position:relative;}sl-tab-bar hmy-notification-counter{margin-top:-60px !important;margin-left:40px !important;}:root{--safe-area-inset-' + (get('layout') != 3 ? ('left:100px !important' + (platform == 'Android' ? '' : ';--safe-area-inset-right:15px')) : 'right:' + (platform == 'Android' ? '100px' : '115px')) + ' !important;}#mod-background{width:calc(100% - var(--safe-area-inset-left) - var(--safe-area-inset-right) - 2 * ' + get('blur') + ' + 15px);}sl-tab-bar:first-of-type{position:fixed;top:0;' + (get('layout') != 3 ? 'left' : 'right') + ':0;border-top:none;width:' + (get('layout') != 3 ? 'var(--safe-area-inset-left)' : (platform == 'Android' ? 'var(--safe-area-inset-right)' : 'calc(var(--safe-area-inset-right) - 15px)')) + ' !important;height:100%;display:block !important;z-index:0;background:' + get('primarycolor') + '}sl-tab-bar:first-of-type sl-tab-item svg{width:100%;height:40px;}sl-tab-bar:first-of-type sl-tab-item span{font-size:14px;}sl-tab-bar:first-of-type sl-tab-item span{margin-top:10px;}sl-tab-bar:first-of-type sl-tab-item i{height:40px;fill:var(--action-neutral-normal) !important;transition:0.3s scale ease !important;}sl-tab-bar:first-of-type .item:hover i{scale:0.9;}sl-tab-bar:first-of-type .item{height:100%;}sl-tab-bar:first-of-type .active .item, sl-tab-bar:first-of-type .item:hover{background:' + highLightColor + ' !important;padding-top:0 !important;}sl-tab-bar:first-of-type sl-tab-item{--action-neutral-normal:' + menuColor + ';--action-primary-normal:' + menuColor + ';display:block !important;width:100%;height:120px;}sl-header > div:first-of-type{--bg-elevated-weakest:' + highLightColor + ';}#mod-logo{--action-neutral-normal: ' + menuColor + ';width:100%;height:60px;margin:20px 0;}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width: 766px){sl-header:not(.with-back-button){border-bottom:none !important;--column-width: 100% !important;}sl-dagen-header{top:calc(64px + var(--safe-area-inset-top)) !important;border-bottom:none !important;}sl-berichten{background-color:var(--bg-neutral-none);}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">.container{max-width:100%;}sl-header sl-tab-bar div.item span,sl-tab-bar sl-tab-item .item span{text-overflow:ellipsis;overflow:hidden;text-wrap:nowrap;margin-left:-5px;width:calc(100% + 10px);}sl-tab-bar sl-tab-item .item span{' + (get('layout') == 3 ? 'margin-left:5px;' : '') + 'width:calc(100% - 10px);text-align:center;}#mod-menu-resizer{width:12px;height:100%;' + (get('layout') == 3 ? 'left' : 'right') + ':-4px;position:absolute;cursor:ew-resize;}sl-tab-bar sl-tab-item .item{padding-bottom:0 !important;max-height:100%;}sl-rooster-dag.dag{width:calc(100vw - 170px) !important;}hmy-notification-counter span{margin:0 !important;}sl-header hmy-notification-counter{position:absolute;right:30px;top:20px;}sl-tab-bar:first-of-type sl-tab-item{position:relative;max-height:calc(25% - 50px);}.active-border-top,.active-border-bottom{top:0;height:100% !important;width:4px !important;position:absolute;' + (get('layout') != 3 ? 'right' : 'left') + ':0;}sl-sidebar{height:100% !important;}.active-border{display:none !important;}sl-rooster-week.week{width:calc(100% - 55px) !important;}sl-sidebar-page{padding-right:0 !important;}sl-header > div:first-of-type i{z-index:10000;--fg-on-primary-weak:' + menuColor + ';--action-neutral-strong:' + menuColor + ';}sl-header > div:first-of-type{--bg-neutral-weakest:' + highLightColor + '}@media (max-height:670px){#mod-logo-wrapper{height:90px;}}@media (max-height:600px){#mod-logo-wrapper{display:none;}sl-tab-bar:first-of-type sl-tab-item{max-height:calc(25% - 20px) !important;}}</style>');
        }
        else if (get('layout') == 4) {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">:root{--safe-area-inset-left:calc((100% - 1200px) / 2) !important;--safe-area-inset-right:calc((100% - 1200px) / 2) !important;}#mod-background{left:0;width:100%;}sl-home{position:relative;border:var(--thinnest-solid-neutral-normal);display:block;background:var(--bg-neutral-none) !important;' + (get('ui') == 0 ? '' : 'backdrop-filter:blur(' + get('uiblur') + 'px);') + '}sl-rooster-week.week{width:calc(100% - 55px) !important;}</style>');
        }
        // Position menu relatively
        if (get('bools').charAt(BOOL_INDEX.MENU_ALWAYS_SHOW) == '0') {
            if (get('layout') == 1 || get('layout') == 4) {
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width:767px){sl-cijfers .tabs{position:relative !important;}sl-rooster sl-scrollable-title{display:none !important;}sl-studiewijzer sl-dagen-header,sl-cijfers .tabs{top:var(--safe-area-inset-top) !important;}}sl-dagen-header{position:relative !important;}sl-rooster-weken{margin-top:64px;}' + (get('layout') == 4 ? 'body:has(sl-cijfers) sl-header:first-of-type,body:has(sl-berichten) sl-header:first-of-type{margin-top:-64px;}' : '') + 'body:has(sl-cijfers),body:has(sl-berichten){margin-top:64px;}sl-rooster sl-header,sl-cijfers sl-header,sl-berichten sl-header{position:absolute !important;width:100%;}</style>');
            }
            else if (get('layout') == 5) {
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-rooster .headers-container,sl-studiewijzer-weken-header{top:0 !important;}</style>');
            }
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width:767px){sl-berichten div.tabs{top:unset !important;}}' + ((get('layout') == 2 || get('layout') == 3) ? '@media (min-width:1279px){.headers-container{top:calc(var(--safe-area-inset-top)) !important;}}' : '') + 'sl-berichten div.berichten-lijst{height:fit-content !important;}.main,sl-berichten div.tabs{position:relative !important;}sl-rooster .headers-container,sl-rooster .header,sl-cijfers .headers-container,sl-cijfers .header,sl-berichten .headers-container,sl-berichten .header{position:relative !important;}</style>');
        }
        // Hide unread message indicator
        if (get('bools').charAt(BOOL_INDEX.HIDE_MESSAGE_COUNT) == '1') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">hmy-notification-counter{display:none !important;}</style>');
        }
        // Hide menu link text
        if (get('bools').charAt(BOOL_INDEX.MENU_PAGE_NAME) == '0') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-header .item span{display:none !important;}@media (max-width:1279px){sl-tab-bar:first-of-type .item span{display:none !important;}' + ((get('layout') == 2 || get('layout') == 3 || get('layout') == 5) ? 'sl-tab-bar:first-of-type sl-tab-item i{padding-top:0!important}}sl-header .item i{padding-top:36px !important;}' : '}') + '</style>');
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
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-css-variables-2">sl-vakgemiddelden sl-dropdown,sl-cijfer-overzicht sl-dropdown{background:var(--bg-neutral-none);margin-top:-5px;margin-bottom:-5px;}' + (get('uiblur') == 0 ? '' : '.nieuw-bericht-form hmy-popup{top:70px !important;left:70px !important;}sl-plaatsingen,.nieuw-bericht-form,sl-header,sl-laatste-resultaat-item,sl-vakresultaat-item,.berichten-lijst,.vakken,' + (get('layout') == '4' ? '' : 'sl-vakresultaten,hmy-geen-data,hmy-switch-group:has(hmy-switch),sl-bericht-detail .header,sl-bericht-nieuw > .titel,') + '.headers-container,.tabs,sl-studiewijzer-week:has(.datum.vandaag),#mod-top-menu,sl-home > * > sl-tab-bar.show,sl-dagen-header,sl-scrollable-title,sl-studiewijzer-weken-header,sl-cijfer-overzicht-voortgang>div,sl-rooster-tijden{backdrop-filter:blur(' + get('uiblur') + 'px);}') + '@media(max-width:767px){sl-laatste-resultaat-item{backdrop-filter:none;}sl-laatsteresultaten{backdrop-filter:blur(' + get('uiblur') + 'px);}}:root, :root.dark.dark {--thinnest-solid-neutral-strong:1px solid transparent !important;--mod-semi-transparant:' + (tn('html', 0).classList.contains('night') ? '#000' : (darkmode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.65)')) + ';--text-weakest:var(--text-weak);--border-neutral-normal:rgba(' + (darkmode ? '55,64,72,0' : '208,214,220,0') + ');' + ((darkmode && get('ui') > 0.9) ? '--text-weak:#fff;' : '') + '--bg-neutral-none:' + (darkmode ? 'rgba(0,0,0,' + (1 - (get('ui') / 100)) + ')' : 'rgba(255,255,255,' + (1 - (get('ui') / 100)) + ')') + ';--bg-neutral-weakest:' + (darkmode ? 'rgba(0, 0, 0, ' + (1 - (get('ui') / 100)) + ')' : 'rgba(255, 255, 255, ' + (1 - (get('ui') / 100)) + ')') + ';}.mod-multi-choice,input:not(:hover):not(:focus):not(.mod-color-textinput):not(.ng-pristine):not(.ng-dirty),textarea:not(:hover):not(:focus):not(.ng-pristine):not(.ng-dirty),.select-selected{border:1px solid rgba(0,0,0,0.1) !important;}hmy-toggle .toggle:not(:has(input:checked)) .slider{border:2px solid rgba(0,0,0,0.1) !important;}sl-rooster sl-dag-header-tab,.periode-icon{background:none !important;}@media (max-width:767px){' + (platform == 'Android' ? 'sl-rooster-item{margin-left:8px;}' : '') + 'sl-vakgemiddelden sl-dropdown,sl-cijfer-overzicht sl-dropdown{margin-top:10px;}}</style>');
        }
        // If at least one of the colors is not set to the default value, modify Somtoday color variables
        const purple100 = toBrightnessValue(get('secondarycolor'), 41);
        const purple80 = toBrightnessValue(get('secondarycolor'), 53);
        const purple50 = toBrightnessValue(get('secondarycolor'), 88);
        const purple30 = toBrightnessValue(get('secondarycolor'), 126);
        const purple10 = toBrightnessValue(get('secondarycolor'), 201);
        const purple0 = toBrightnessValue(get('secondarycolor'), 231);
        const green100 = toBrightnessValue(get('secondarycolor'), 46);
        const green90 = toBrightnessValue(get('secondarycolor'), 68);
        const green80 = toBrightnessValue(get('secondarycolor'), 113);
        const green50 = toBrightnessValue(get('secondarycolor'), 183);
        const green20 = toBrightnessValue(get('secondarycolor'), 209);
        const green10 = toBrightnessValue(get('secondarycolor'), 228);
        const green0 = toBrightnessValue(get('secondarycolor'), 245);
        const blue100 = toBrightnessValue(get('primarycolor'), 48);
        const blue80 = toBrightnessValue(get('primarycolor'), 56);
        const blue70 = toBrightnessValue(get('primarycolor'), 81);
        const blue60 = toBrightnessValue(get('primarycolor'), 89);
        const blue40 = toBrightnessValue(get('primarycolor'), 140);
        const blue30 = toBrightnessValue(get('primarycolor'), 169);
        const blue20 = toBrightnessValue(get('primarycolor'), 198);
        const blue0 = toBrightnessValue(get('primarycolor'), 241);
        const yellow60 = toBrightnessValue(get('secondarycolor'), 162);
        const yellow50 = toBrightnessValue(get('secondarycolor'), 173);
        const yellow20 = toBrightnessValue(get('secondarycolor'), 198);
        const orange60 = toBrightnessValue(get('secondarycolor'), 141);
        const orange30 = toBrightnessValue(get('secondarycolor'), 180);
        if (get('primarycolor') != '#0067c2' || get('secondarycolor') != '#e69b22') {
            const rgbcolor = hexToRgb(get('primarycolor'));
            // Generate and adjust colors based on highest color channel value
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-css-variables">' + (darkmode ? '#mod-setting-panel ::placeholder{color:var(--action-neutral-normal) !important;}' : '') + ':root, :root.dark.dark {--mod-transparent:rgba(' + (darkmode ? '0,0,0,0.3' : '255,255,255,0.3') + ');--mod-ui-transparent:rgba(' + (darkmode ? '0,0,0' : '255,255,255') + ',' + (1 - (get('ui') / 100)) + ');--purple-100:' + purple100 + ';--purple-80:' + purple80 + ';--purple-50:' + purple50 + ';--purple-30:' + purple30 + ';--purple-10:' + purple10 + ';--purple-0:' + purple0 + ';--mod-semi-transparant:' + (darkmode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.65)') + ';--green-100:' + green100 + ';--green-90:' + green90 + ';--green-80:' + green80 + ';--green-50:' + green50 + ';--green-20:' + green20 + ';--green-10:' + green10 + ';--green-0:' + green0 + ';--thinnest-solid-neutral-strong:var(--b-thinnest) solid var(--border-neutral-normal);--blue-60:' + blue60 + ';--blue-70:' + blue70 + ';--yellow-60:' + yellow60 + ';--blue-0:' + blue0 + ';--blue-80:' + blue80 + ';--blue-30:' + blue30 + ';--blue-20:' + blue20 + ';--blue-100:' + blue100 + ';--yellow-20:' + yellow20 + ';--blue-40:' + blue40 + ';--yellow-50:' + yellow50 + ';--orange-30:' + orange30 + ';--orange-60:' + orange60 + ';}sl-account-modal i{--bg-neutral-moderate:' + (darkmode ? '#282e34' : '#dadfe3') + ';--fg-on-neutral-moderate:' + (darkmode ? '#eaedf0' : '#374048') + ';--bg-primary-weak:' + (darkmode ? '#1a344d' : '#e5f3ff') + ';--fg-on-primary-weak:' + (darkmode ? '#e5f3ff' : '#004180') + ';--bg-alternative-weak:' + (darkmode ? '#342060' : '#ece3ff') + ';--fg-on-alternative-weak:' + (darkmode ? '#d4c0fd' : '#29017d') + ';--bg-accent-weak:' + (darkmode ? '#4d3919' : '#fff4e3') + ';--fg-on-accent-weak:' + (darkmode ? '#fff4e3' : '#4d3919') + ';--bg-positive-weak:' + (darkmode ? '#133914' : '#ebf9ec') + ';--fg-on-positive-weak:' + (darkmode ? '#baf5bc' : '#145716') + ';}</style>');
        }
        else {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-css-variables">' + (darkmode ? '#mod-setting-panel ::placeholder{color:var(--action-neutral-normal) !important;}' : '') + ':root, :root.dark.dark {--mod-transparent:rgba(' + (darkmode ? '0,0,0,0.3' : '255,255,255,0.3') + ');--mod-ui-transparent:rgba(' + (darkmode ? '0,0,0' : '255,255,255') + ',' + (1 - (get('ui') / 100)) + ');}</style>');
        }
    }

    // Get modlogo SVG
    window.logo = function (id, classname, color, style) {
        return '<svg' + (n(id) ? '' : ' id="' + id + '"') + (n(classname) ? '' : ' class="' + classname + '"') + (n(style) ? '' : ' style="' + style + '"') + ' viewBox="0 0 190.5 207" width="190.5" height="207"><g transform="translate(-144.8 -76.5)"><g><path d="M261 107.8v.3c0 3.7 3 6.7 6.6 6.7H299a6.8 6.8 0 0 1 6.7 7V143.2c0 3.7 3 6.7 6.7 6.7h16.1a6.8 6.8 0 0 1 6.7 7V201.6c0 3.7-3 6.6-6.7 6.7h-16.1a6.8 6.8 0 0 0-6.7 7v23.1c0 3.7-3 6.7-6.7 6.7h-10.5a6.8 6.8 0 0 0-6.7 7l-.1 24.4v.3c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.7-7v-24.6c0-3.8-2.8-6.9-6.3-6.9s-6.4 3.1-6.4 7v24.8c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.6-7l.1-24.4v-.3c0-3.7-3-6.7-6.6-6.7h-10.5a6.8 6.8 0 0 1-6.7-7V215c0-3.6-3-6.6-6.7-6.7h-15.8a6.8 6.8 0 0 1-6.7-7V156.6c0-3.7 3-6.7 6.7-6.7h15.8a6.8 6.8 0 0 0 6.7-7v-21.4c0-3.6 3-6.6 6.7-6.7h31a6.8 6.8 0 0 0 6.7-7l.1-24.3v-.3c0-3.6 3-6.6 6.7-6.7h29a6.8 6.8 0 0 1 6.8 7z" fill="' + color + '" /><path d="M289.8 179.2c1.3 0 2.9.3 4.6.9 2.2.7 4 1.7 5 2.7v.2c.8.6 1.3 1.5 1.4 2.6 0 .9-.2 1.7-.6 2.3l-6.8 10.8a60.2 60.2 0 0 1-27.5 19.8c-8.5 3.2-17 4.7-24.7 4.5l-13.2-.1a1.6 1.6 0 0 1-1.7-1.5v-3.3a1.6 1.6 0 0 1 1.7-1.5h.1c7.9.3 16.3-1 24.7-4.2a56 56 0 0 0 34.3-31.4v-.3c.5-1 1.4-1.5 2.3-1.5z" fill="#000000" stroke="none" /><g class="glasses"><path d="M171.4 150.8v-9h137.2v9z" fill="#000000" stroke="none" /><path d="M175.7 155.5v-6h57.5v6z" fill="#000000" stroke="none" /><path d="M179.8 160v-9h48.9v9z" fill="#000000" stroke="none" /><path d="M184 164.5v-9h44.7v9z" fill="#000000" stroke="none" /><path d="M188.6 168.6v-7h31.7v7z" fill="#000000" stroke="none" /><path d="M245.9 155.5v-6h57.4v6z" fill="#000000" stroke="none" /><path d="M250 160v-9h48.8v9z" fill="#000000" stroke="none" /><path d="M254 164.5v-9h41v9z" fill="#000000" stroke="none" /><path d="M258.8 168.6v-7h31.6v7z" fill="#000000" stroke="none" /><path d="M184.5 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M188.8 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M193.3 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M193.3 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M197.6 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M202.1 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M254.8 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M259.1 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M263.6 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M263.6 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M268 159.2V155h4.4v4.3z" fill="#ffffff" stroke="none" /><path d="M272.4 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /></g></g></g></svg>';
    };

    // Construct an icon in SVG format. Only contains icons used by this mod. Icons thanks to Font Awesome: https://fontawesome.com/
    function getIcon(name, classname, color, start) {
        let svg;
        let viewbox = '0 0 512 512';
        n(name) ? name = '' : null;
        classname = n(classname) ? '' : 'class="' + classname + '" ';
        start = n(start) ? '' : start + ' ';
        switch (name) {
            // FONT AWESOME
            case 'envelope':
                svg = 'M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z';
                break;
            case 'right-from-bracket':
                svg = 'M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z';
                break;
            case 'gear':
                svg = 'M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z';
                break;
            case 'floppy-disk':
                viewbox = '0 0 448 512';
                svg = 'M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z';
                break;
            case 'rotate-left':
                svg = 'M48.5 224H40c-13.3 0-24-10.7-24-24V72c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2L98.6 96.6c87.6-86.5 228.7-86.2 315.8 1c87.5 87.5 87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3c-62.2-62.2-162.7-62.5-225.3-1L185 183c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8H48.5z';
                break;
            case 'globe':
                svg = 'M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z';
                break;
            case 'circle-info':
                svg = 'M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z';
                break;
            case 'circle-exclamation':
                svg = 'M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z';
                break;
            case 'upload':
                svg = 'M288 109.3V352c0 17.7-14.3 32-32 32s-32-14.3-32-32V109.3l-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352H192c0 35.3 28.7 64 64 64s64-28.7 64-64H448c35.3 0 64 28.7 64 64v32c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V416c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z';
                break;
            case 'download':
                svg = 'M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z';
                break;
            case 'chevron-right':
                svg = 'M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z';
                break;
            case 'brain':
                svg = 'M184 0c30.9 0 56 25.1 56 56V456c0 30.9-25.1 56-56 56c-28.9 0-52.7-21.9-55.7-50.1c-5.2 1.4-10.7 2.1-16.3 2.1c-35.3 0-64-28.7-64-64c0-7.4 1.3-14.6 3.6-21.2C21.4 367.4 0 338.2 0 304c0-31.9 18.7-59.5 45.8-72.3C37.1 220.8 32 207 32 192c0-30.7 21.6-56.3 50.4-62.6C80.8 123.9 80 118 80 112c0-29.9 20.6-55.1 48.3-62.1C131.3 21.9 155.1 0 184 0zM328 0c28.9 0 52.6 21.9 55.7 49.9c27.8 7 48.3 32.1 48.3 62.1c0 6-.8 11.9-2.4 17.4c28.8 6.2 50.4 31.9 50.4 62.6c0 15-5.1 28.8-13.8 39.7C493.3 244.5 512 272.1 512 304c0 34.2-21.4 63.4-51.6 74.8c2.3 6.6 3.6 13.8 3.6 21.2c0 35.3-28.7 64-64 64c-5.6 0-11.1-.7-16.3-2.1c-3 28.2-26.8 50.1-55.7 50.1c-30.9 0-56-25.1-56-56V56c0-30.9 25.1-56 56-56z';
                break;
            case 'bullseye':
                svg = 'M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z';
                break;
            case 'calculator':
                svg = 'M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM96 64H288c17.7 0 32 14.3 32 32v32c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32zm32 160a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM96 352a32 32 0 1 1 0-64 32 32 0 1 1 0 64zM64 416c0-17.7 14.3-32 32-32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-17.7 0-32-14.3-32-32zM192 256a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm32 64a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm64-64a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm32 64a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM288 448a32 32 0 1 1 0-64 32 32 0 1 1 0 64z';
                break;
            case 'arrows-left-right':
                svg = 'M406.6 374.6l96-96c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224l-293.5 0 41.4-41.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288l293.5 0-41.4 41.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z';
                break;
            case 'earth-europe':
                svg = 'M266.3 48.3L232.5 73.6c-5.4 4-8.5 10.4-8.5 17.1v9.1c0 6.8 5.5 12.3 12.3 12.3c2.4 0 4.8-.7 6.8-2.1l41.8-27.9c2-1.3 4.4-2.1 6.8-2.1h1c6.2 0 11.3 5.1 11.3 11.3c0 3-1.2 5.9-3.3 8l-19.9 19.9c-5.8 5.8-12.9 10.2-20.7 12.8l-26.5 8.8c-5.8 1.9-9.6 7.3-9.6 13.4c0 3.7-1.5 7.3-4.1 10l-17.9 17.9c-6.4 6.4-9.9 15-9.9 24v4.3c0 16.4 13.6 29.7 29.9 29.7c11 0 21.2-6.2 26.1-16l4-8.1c2.4-4.8 7.4-7.9 12.8-7.9c4.5 0 8.7 2.1 11.4 5.7l16.3 21.7c2.1 2.9 5.5 4.5 9.1 4.5c8.4 0 13.9-8.9 10.1-16.4l-1.1-2.3c-3.5-7 0-15.5 7.5-18l21.2-7.1c7.6-2.5 12.7-9.6 12.7-17.6c0-10.3 8.3-18.6 18.6-18.6H400c8.8 0 16 7.2 16 16s-7.2 16-16 16H379.3c-7.2 0-14.2 2.9-19.3 8l-4.7 4.7c-2.1 2.1-3.3 5-3.3 8c0 6.2 5.1 11.3 11.3 11.3h11.3c6 0 11.8 2.4 16 6.6l6.5 6.5c1.8 1.8 2.8 4.3 2.8 6.8s-1 5-2.8 6.8l-7.5 7.5C386 262 384 266.9 384 272s2 10 5.7 13.7L408 304c10.2 10.2 24.1 16 38.6 16H454c6.5-20.2 10-41.7 10-64c0-111.4-87.6-202.4-197.7-207.7zm172 307.9c-3.7-2.6-8.2-4.1-13-4.1c-6 0-11.8-2.4-16-6.6L396 332c-7.7-7.7-18-12-28.9-12c-9.7 0-19.2-3.5-26.6-9.8L314 287.4c-11.6-9.9-26.4-15.4-41.7-15.4H251.4c-12.6 0-25 3.7-35.5 10.7L188.5 301c-17.8 11.9-28.5 31.9-28.5 53.3v3.2c0 17 6.7 33.3 18.7 45.3l16 16c8.5 8.5 20 13.3 32 13.3H248c13.3 0 24 10.7 24 24c0 2.5 .4 5 1.1 7.3c71.3-5.8 132.5-47.6 165.2-107.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM187.3 100.7c-6.2-6.2-16.4-6.2-22.6 0l-32 32c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l32-32c6.2-6.2 6.2-16.4 0-22.6z';
                break;
            case 'landmark':
                svg = 'M240.1 4.2c9.8-5.6 21.9-5.6 31.8 0l171.8 98.1L448 104l0 .9 47.9 27.4c12.6 7.2 18.8 22 15.1 36s-16.4 23.8-30.9 23.8H32c-14.5 0-27.2-9.8-30.9-23.8s2.5-28.8 15.1-36L64 104.9V104l4.4-1.6L240.1 4.2zM64 224h64V416h40V224h64V416h48V224h64V416h40V224h64V420.3c.6 .3 1.2 .7 1.8 1.1l48 32c11.7 7.8 17 22.4 12.9 35.9S494.1 512 480 512H32c-14.1 0-26.5-9.2-30.6-22.7s1.1-28.1 12.9-35.9l48-32c.6-.4 1.2-.7 1.8-1.1V224z';
                break;
            case 'flask':
                svg = 'M288 0H160 128C110.3 0 96 14.3 96 32s14.3 32 32 32V196.8c0 11.8-3.3 23.5-9.5 33.5L10.3 406.2C3.6 417.2 0 429.7 0 442.6C0 480.9 31.1 512 69.4 512H378.6c38.3 0 69.4-31.1 69.4-69.4c0-12.8-3.6-25.4-10.3-36.4L329.5 230.4c-6.2-10.1-9.5-21.7-9.5-33.5V64c17.7 0 32-14.3 32-32s-14.3-32-32-32H288zM192 196.8V64h64V196.8c0 23.7 6.6 46.9 19 67.1L309.5 320h-171L173 263.9c12.4-20.2 19-43.4 19-67.1z';
                break;
            case 'microscope':
                svg = 'M160 32c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32zM32 448H320c70.7 0 128-57.3 128-128s-57.3-128-128-128V128c106 0 192 86 192 192c0 49.2-18.5 94-48.9 128H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H320 32c-17.7 0-32-14.3-32-32s14.3-32 32-32zm80-64H304c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z';
                break;
            case 'book':
                svg = 'M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z';
                break;
            case 'map-location-dot':
                viewbox = '0 0 576 512';
                svg = 'M408 120c0 54.6-73.1 151.9-105.2 192c-7.7 9.6-22 9.6-29.6 0C241.1 271.9 168 174.6 168 120C168 53.7 221.7 0 288 0s120 53.7 120 120zm8 80.4c3.5-6.9 6.7-13.8 9.6-20.6c.5-1.2 1-2.5 1.5-3.7l116-46.4C558.9 123.4 576 135 576 152V422.8c0 9.8-6 18.6-15.1 22.3L416 503V200.4zM137.6 138.3c2.4 14.1 7.2 28.3 12.8 41.5c2.9 6.8 6.1 13.7 9.6 20.6V451.8L32.9 502.7C17.1 509 0 497.4 0 480.4V209.6c0-9.8 6-18.6 15.1-22.3l122.6-49zM327.8 332c13.9-17.4 35.7-45.7 56.2-77V504.3L192 449.4V255c20.5 31.3 42.3 59.6 56.2 77c20.5 25.6 59.1 25.6 79.6 0zM288 152a40 40 0 1 0 0-80 40 40 0 1 0 0 80z';
                break;
            case 'sun':
                svg = 'M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z';
                break;
            case 'palette':
                svg = 'M512 256c0 .9 0 1.8 0 2.7c-.4 36.5-33.6 61.3-70.1 61.3H344c-26.5 0-48 21.5-48 48c0 3.4 .4 6.7 1 9.9c2.1 10.2 6.5 20 10.8 29.9c6.1 13.8 12.1 27.5 12.1 42c0 31.8-21.6 60.7-53.4 62c-3.5 .1-7 .2-10.6 .2C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z';
                break;
            case 'image':
                svg = 'M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6l96 0 32 0 208 0c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z';
                break;
            case 'grip-vertical':
                viewbox = '0 0 320 512';
                svg = 'M40 352l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zm192 0l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zM40 320c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0zM232 192l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zM40 160c-22.1 0-40-17.9-40-40L0 72C0 49.9 17.9 32 40 32l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0zM232 32l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40z';
                break;
            case 'plus':
                viewbox = '0 0 448 512';
                svg = 'M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z';
                break;
            case 'edit':
                svg = 'M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z';
                break;
            case 'clock':
                viewbox = '0 0 640 640';
                svg = 'M320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z';
                break;
            // Homework, assignment etc icons by Topicus
            case 'homework':
                viewbox = '0 0 24 24';
                svg = 'm7 2.804 3.623-2.39a2.5 2.5 0 0 1 2.754 0l9.5 6.269A2.5 2.5 0 0 1 24 8.769v12.735a2.5 2.5 0 0 1-2.5 2.5h-19a2.5 2.5 0 0 1-2.5-2.5V8.77a2.5 2.5 0 0 1 1.123-2.086L3 5.444V1.047a.8.8 0 0 1 .8-.8h2.4a.8.8 0 0 1 .8.8zm0 16.362h3v-4.364h4v4.364h3v-12h-3v4.364h-4V7.166H7z';
                break;
            case 'assignment':
                viewbox = '0 0 24 24';
                svg = 'M16 0H8v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V0H3.429C1.538 0 0 1.677 0 3.74v16.52C0 22.323 1.538 24 3.429 24H20.57c1.892 0 3.43-1.677 3.43-3.74V3.74C24 1.677 22.462 0 20.571 0H19v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm-5.667 6.5a.5.5 0 0 1 .5-.5h2.334a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2.334a.5.5 0 0 1-.5-.5zm1.95 12.396 4.59-4.425a.47.47 0 0 0 0-.642l-1.115-1.173a.417.417 0 0 0-.61 0l-1.481 1.4v-3.61c0-.25-.179-.446-.417-.446h-2.5c-.238 0-.417.195-.417.446v3.61l-1.48-1.4a.417.417 0 0 0-.61 0l-1.117 1.173a.47.47 0 0 0 0 .642l4.547 4.425a.417.417 0 0 0 .61 0';
                break;
            case 'test':
                viewbox = '0 0 24 24';
                svg = 'M3.429 0A3.43 3.43 0 0 0 0 3.429V20.57A3.43 3.43 0 0 0 3.429 24H20.57A3.43 3.43 0 0 0 24 20.571V3.43A3.43 3.43 0 0 0 20.571 0zM17 8.966h-3.465v9.038h-2.912V8.966H7V6h10z';
                break;
            case 'palm':
                viewbox = '0 0 24 24';
                svg = 'M11.479 3.403c-1.089-.546-2.587-1.083-4.04-1.08-1.103.001-2.161.31-3.038 1.044-.604.506-1.172 1.255-1.606 2.35l1.588-.28A1.16 1.16 0 0 1 5.71 6.864l-.083.324c-.155.597-.323 1.248-.389 1.958a5.6 5.6 0 0 0-.018.814A63 63 0 0 1 7.6 8.25q.57-.396 1.115-.767c1.021-.7 1.94-1.33 2.575-1.82a1.16 1.16 0 0 1 1.42 0c.636.49 1.554 1.12 2.575 1.82q.545.372 1.116.767c.807.558 1.64 1.146 2.38 1.711a5.6 5.6 0 0 0-.02-.814c-.064-.71-.233-1.36-.388-1.957l-.083-.325a1.162 1.162 0 0 1 1.327-1.427l1.587.279c-.435-1.093-1.005-1.843-1.61-2.35-.88-.735-1.937-1.043-3.03-1.043-1.458 0-2.956.535-4.043 1.08a1.16 1.16 0 0 1-1.042 0ZM12 1.08C10.781.53 9.143-.003 7.434 0Zm0 0C13.22.53 14.856 0 16.564 0c1.537 0 3.152.44 4.52 1.584s2.387 2.907 2.892 5.365a1.16 1.16 0 0 1-1.338 1.377l-1.69-.297c.053.29.098.594.127.905.1 1.087.02 2.375-.632 3.608a1.16 1.16 0 0 1-1.825.301c-.775-.733-2.106-1.693-3.539-2.684-.347-.24-.701-.483-1.05-.722-.396-.272-.787-.54-1.157-.796-.295 2.517-.48 6.26.085 9.459 1.13.087 2.102.347 3.071.88 1.177.648 2.28 1.664 3.643 3.042A1.161 1.161 0 0 1 18.846 24H5.155a1.161 1.161 0 0 1-.959-1.817c.66-.964 1.803-1.977 3.134-2.748.968-.56 2.096-1.028 3.287-1.244-.503-3.114-.384-6.563-.129-9.109l-.517.355c-.349.239-.703.481-1.05.722-1.432.99-2.764 1.951-3.539 2.684a1.16 1.16 0 0 1-1.825-.3c-.651-1.234-.731-2.522-.631-3.609.028-.311.073-.615.125-.905l-1.688.297A1.16 1.16 0 0 1 .023 6.95C.53 4.492 1.544 2.73 2.91 1.586S5.892.003 7.434 0m.68 21.677h7.774a7 7 0 0 0-.98-.661c-.795-.438-1.616-.627-2.91-.629-1.161-.001-2.401.42-3.504 1.058q-.195.113-.38.232';
                break;
            // Somtoday logo by Topicus
            case 'logo':
                viewbox = '0 0 49 49';
                svg = 'M44.6819 17.3781H43.3148C41.7353 17.3781 40.4606 16.1316 40.4606 14.5871V11.9045C40.4606 10.36 39.1859 9.11355 37.6064 9.11355H32.6184C31.0389 9.11355 29.7642 7.8671 29.7642 6.32258V2.79097C29.7642 1.24645 28.4895 0 26.91 0H22.153C20.5734 0 19.2987 1.24645 19.2987 2.79097V6.32258C19.2987 7.8671 18.024 9.11355 16.4445 9.11355H11.4566C9.87706 9.11355 8.60236 10.36 8.60236 11.9045V14.5871C8.60236 16.1316 7.32766 17.3781 5.74814 17.3781H4.38107C2.80155 17.3781 1.52686 18.6245 1.52686 20.169V28.5058C1.52686 30.0503 2.80155 31.2968 4.38107 31.2968H5.72967C7.30918 31.2968 8.58388 32.5432 8.58388 34.0877V37.1768C8.58388 38.7213 9.85858 39.9677 11.4381 39.9677C13.0176 39.9677 14.2923 41.2142 14.2923 42.7587V46.209C14.2923 47.7535 15.567 49 17.1465 49H20.2132C21.7927 49 23.0674 47.7535 23.0674 46.209V41.4039C23.0674 40.609 23.7232 39.9768 24.5269 39.9768C25.3305 39.9768 25.9863 40.6181 25.9863 41.4039V46.209C25.9863 47.7535 27.261 49 28.8405 49H31.9072C33.4867 49 34.7614 47.7535 34.7614 46.209V42.7587C34.7614 41.2142 36.0361 39.9677 37.6156 39.9677C39.1951 39.9677 40.4698 38.7213 40.4698 37.1768V34.0877C40.4698 32.5432 41.7445 31.2968 43.324 31.2968H44.6726C46.2522 31.2968 47.5269 30.0503 47.5269 28.5058V20.169C47.5269 18.6245 46.2522 17.3781 44.6726 17.3781H44.6819ZM37.902 26.4465C37.006 29.3368 35.0108 31.7123 32.2859 33.1394C30.5863 34.0245 28.7297 34.4761 26.8453 34.4761C25.7184 34.4761 24.5823 34.3135 23.4738 33.9794C22.7995 33.7806 22.4208 33.0852 22.624 32.4348C22.8273 31.7755 23.5385 31.4052 24.2128 31.6039C26.522 32.2903 28.9606 32.0555 31.0943 30.9445C33.2188 29.8335 34.7799 27.9819 35.4819 25.7239C35.6851 25.0645 36.3963 24.7032 37.0706 24.8929C37.7449 25.0916 38.1236 25.7871 37.9204 26.4465H37.902Z';
                break;
            default:
                viewbox = '0 0 384 512';
                svg = 'M64 390.3L153.5 256 64 121.7V390.3zM102.5 448H281.5L192 313.7 102.5 448zm128-192L320 390.3V121.7L230.5 256zM281.5 64H102.5L192 198.3 281.5 64zM0 48C0 21.5 21.5 0 48 0H336c26.5 0 48 21.5 48 48V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V48z';
        }
        return '<svg ' + start + classname + 'height="1em" viewBox="' + viewbox + '"><path fill-rule="evenodd" ' + (n(color) ? '' : 'fill="' + color + '" ') + 'd="' + svg + '"/></svg>';
    }

    // Show a message on top of the page. Similair to browser confirm().
    function modMessage(title, description, link1, link2, red1, red2, noBackgroundClick) {
        tn('sl-root', 0).inert = true;
        if (!n(tn('sl-modal', 0))) {
            tn('sl-modal', 0).inert = true;
        }
        while (!n(id('mod-message'))) {
            tryRemove(id('mod-message'));
        }
        const element = n(id('somtoday-mod')) ? tn('body', 0) : id('somtoday-mod');
        element.insertAdjacentHTML('afterbegin', '<div id="mod-message" class="mod-animation-playing"><center><div onclick="event.stopPropagation();"><h2>' + title + '</h2><p>' + description + '</p>' + (n(link1) ? '' : '<a id="mod-message-action1" class="mod-message-button' + (red1 ? ' mod-button-discouraged' : '') + '" tabindex="0">' + link1 + '</a>') + (n(link2) ? '' : '<a id="mod-message-action2" class="mod-message-button' + (red2 ? ' mod-button-discouraged' : '') + '" tabindex="0">' + link2 + '</a>') + '</div></center></div>');
        if (!n(link1)) {
            id('mod-message-action1').focus();
            setTimeout(function () {
                if (!n(id('mod-message-action1'))) {
                    id('mod-message-action1').addEventListener('keyup', (event) => {
                        if (event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 9) {
                            event.preventDefault();
                            if (!n(id('mod-message-action2'))) {
                                id('mod-message-action2').focus();
                            }
                        }
                    }, { once: true });
                }
            }, 50);
            id('mod-message-action1').addEventListener('click', function () { tn('sl-root', 0).removeAttribute('inert'); if (!n(tn('sl-modal', 0))) { tn('sl-modal', 0).removeAttribute('inert'); } }, { once: true });
        }
        if (!n(link2)) {
            setTimeout(function () {
                if (!n(id('mod-message-action2'))) {
                    id('mod-message-action2').addEventListener('keyup', (event) => {
                        if (event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 9) {
                            event.preventDefault();
                            id('mod-message-action1').focus();
                        }
                    }, { once: true });
                }
            }, 50);
            id('mod-message-action2').addEventListener('click', function () { tn('sl-root', 0).removeAttribute('inert'); if (!n(tn('sl-modal', 0))) { tn('sl-modal', 0).removeAttribute('inert'); } }, { once: true });
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
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-profile-picture">hmy-avatar{border-radius:var(--border-radius);overflow:hidden;}hmy-avatar>.container:not(:has(.initials)){background:url(\'' + get('profilepic') + '\') center / cover;}.foto{opacity:0 !important;}</style>');
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
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                    // Receiver field in message list (can be a teacher name or "Somtoday (automatisch)")
                    for (const element of cn('ontvangers ellipsis')) {
                        if (!element.classList.contains('mod-nickname')) {
                            const text = element.innerHTML.replace(regex, '$1' + nick + '$2');
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
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                    // Sender field in opened message (can be a teacher name or student name)
                    for (const element of cn('van')) {
                        if (!element.classList.contains('mod-nickname')) {
                            const text = element.innerHTML.replace(element.innerHTML.indexOf('<hmy-') != -1 ? regexWhichPreservesIcons : regex, '$1' + nick + '$2');
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                    // Sender field in opened message (can be a teacher name or student name)
                    for (const element of cn('text text-content-smallest-semi')) {
                        if (!element.classList.contains('mod-nickname')) {
                            const text = element.innerHTML.replace(regex, '$1' + nick + '$2');
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                    for (const element of cn('docent')) {
                        if (!element.classList.contains('mod-nickname') && !n(element.getElementsByTagName('span')[0])) {
                            const text = element.getElementsByTagName('span')[0].innerHTML.replace(regex, '$1' + nick + '$2');
                            setHTML(element.getElementsByTagName('span')[0], '');
                            element.getElementsByTagName('span')[0].append(document.createRange().createContextualFragment(text));
                        }
                    }
                    for (const element of tn('hmy-internal-tag')) {
                        if (!element.classList.contains('mod-nickname') && !n(element.getElementsByTagName('span')[0])) {
                            if (nickname[2] && element.innerText == nickname[2]) {
                                setHTML(element.getElementsByTagName('span')[0], '');
                                element.getElementsByTagName('span')[0].append(document.createRange().createContextualFragment(nick));
                            }
                            else {
                                const text = element.getElementsByTagName('span')[0].innerHTML.replace(regex, '$1' + nick + '$2');
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
            if (n(id('mod-menu-resizer')) && !n(tn('sl-tab-bar', 0))) {
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
        if (!n(cn('mod-logo-hat-clicked', 0)) || !n(cn('mod-logo-decoration-clicked', 0))) {
            return;
        }

        tryRemove(id('mod-logo-wrapper'));
        tryRemove(id('mod-logo-hat'));
        tryRemove(id('mod-logo-inserted'));
        if (get('layout') == 2 || get('layout') == 3 || get('layout') == 5) {
            const logoHTML = '<div id="mod-logo-wrapper">' + (get('bools').charAt(BOOL_INDEX.MOD_LOGO) == '0' ? getIcon('logo', null, menuColor, ' id="mod-logo"') : window.logo('mod-logo', '" data-clicks="' + (n(id('mod-logo')) ? '0' : id('mod-logo').dataset.clicks), 'var(--action-neutral-normal)')) + '</div>';
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
                    tn('html', 0).style.overflowY = 'hidden';
                    id('somtoday-mod').insertAdjacentHTML('beforeend', '<div id="blue-screen-of-death"><svg xmlns="http://www.w3.org/2000/svg" width="806.81042" height="588.71942" viewBox="0 0 806.81042 588.71944"><rect style="fill:#1173aa;" width="806.81042" height="588.71942" x="0" y="0"/><g transform="matrix(4.2021373,0,0,4.2021373,0,1.0984253e-5)"><g><path style="fill:#fff;" d="m 28.976126,48.524788 q -1.09375,0 -1.835938,-0.703125 -0.742187,-0.722656 -0.742187,-1.777344 0,-1.074219 0.742187,-1.777344 0.742188,-0.722656 1.835938,-0.722656 1.113281,0 1.855468,0.722656 0.742188,0.703125 0.742188,1.777344 0,1.054688 -0.742188,1.777344 -0.742187,0.703125 -1.855468,0.703125 z m 0,14.902344 q -1.09375,0 -1.835938,-0.703125 -0.742187,-0.722657 -0.742187,-1.777344 0,-1.074219 0.742187,-1.777344 0.742188,-0.722656 1.835938,-0.722656 1.113281,0 1.855468,0.722656 0.742188,0.703125 0.742188,1.777344 0,1.054687 -0.742188,1.777344 -0.742187,0.703125 -1.855468,0.703125 z"/><path style="fill:#fff;" d="m 42.101126,68.974007 q -3.125,-3.417969 -4.53125,-7.363282 -1.386719,-3.964843 -1.386719,-9.335937 0,-5.214844 1.347656,-9.160156 1.367188,-3.964844 4.375,-7.539063 l 1.875,1.5625 q -2.382812,3.417969 -3.476562,7.011719 -1.074219,3.574219 -1.074219,8.125 0,4.433594 1.132812,8.027344 1.132813,3.574218 3.652344,7.109375 z" /></g><g><path style="line-height:142.99999475%;letter-spacing:-0.30000001px;fill:#ffffff" d="m 29.713547,80.950829 -1.688233,-3.325196 h 0.688477 l 1.186523,2.391358 q 0.02197,0.04761 0.05859,0.142822 0.03662,0.09155 0.06958,0.179443 h 0.01099 q 0.03296,-0.120849 0.135499,-0.322265 l 1.241455,-2.391358 h 0.644531 l -1.732178,3.310547 v 1.940918 h -0.615234 z" /><path style="line-height:142.99999475%;letter-spacing:-0.30000001px;fill:#ffffff" d="m 34.016818,82.968651 q -0.55664,0 -0.981445,-0.230713 -0.421143,-0.230713 -0.655518,-0.651856 -0.230712,-0.424804 -0.230712,-0.977783 0,-0.560302 0.230712,-0.988769 0.234375,-0.428467 0.655518,-0.662842 0.424805,-0.234375 0.981445,-0.234375 0.545655,0 0.959473,0.234375 0.413818,0.234375 0.637207,0.662842 0.223389,0.424804 0.219727,0.988769 0,0.556641 -0.227051,0.977783 -0.223389,0.421143 -0.637207,0.651856 -0.410157,0.230713 -0.952149,0.230713 z m 0,-0.578613 q 0.344239,0 0.60791,-0.157471 0.267334,-0.161133 0.413819,-0.45044 0.150146,-0.292968 0.157471,-0.673828 -0.0073,-0.388183 -0.157471,-0.684814 -0.150147,-0.296631 -0.413819,-0.457764 -0.263671,-0.164795 -0.60791,-0.164795 -0.366211,0 -0.648193,0.164795 -0.27832,0.164795 -0.432129,0.461426 -0.150146,0.296631 -0.150146,0.688476 0,0.38086 0.150146,0.670166 0.153809,0.289307 0.432129,0.446778 0.27832,0.157471 0.648193,0.157471 z" /><path style="fill:#fff;" d="m 39.323508,83.01992 q -0.212403,-0.380859 -0.300293,-0.717773 -0.05493,0.150146 -0.212403,0.300293 -0.153808,0.150146 -0.402832,0.252685 -0.245361,0.102539 -0.560302,0.102539 -0.516358,0 -0.834961,-0.201416 -0.318604,-0.201416 -0.454102,-0.520019 -0.135498,-0.322266 -0.135498,-0.706787 v -2.215576 h 0.600586 v 2.028808 q 0,0.479737 0.197754,0.769043 0.201416,0.289307 0.758057,0.289307 0.413818,0 0.684814,-0.194092 0.270996,-0.197754 0.270996,-0.655518 v -2.24121 h 0.600586 v 2.358398 q 0.0037,0.53833 0.318604,1.105957 z" /><path style="fill:#fff;" d="m 41.29006,79.654442 q 0.377197,-0.435791 0.966797,-0.435791 0.164795,0 0.344238,0.03296 L 42.498556,79.8229 q -0.102539,-0.01099 -0.201416,-0.01099 -0.567627,0 -0.941162,0.351562 v 2.713623 h -0.600586 v -3.566894 h 0.454102 l 0.08057,0.344238 z" /><path style="fill:#fff;" d="m 45.497824,77.625633 h 1.442871 q 0.545654,0 0.941162,0.179444 0.39917,0.179443 0.611572,0.531005 0.212403,0.351563 0.212403,0.856934 0,0.516357 -0.245362,0.900879 -0.241699,0.384521 -0.67749,0.593262 -0.432129,0.205078 -0.985107,0.205078 h -0.684815 v 1.984863 h -0.615234 z m 1.256103,2.713623 q 0.615235,0 0.963135,-0.281982 0.3479,-0.281983 0.3479,-0.834961 0,-0.53833 -0.314941,-0.787354 -0.314941,-0.252685 -0.915527,-0.252685 l -0.725098,0.0037 v 2.15332 h 0.644531 z" /><path style="fill:#fff;" d="m 51.661154,82.95034 q -0.736084,0 -1.259766,-0.314941 -0.523681,-0.314942 -0.79834,-0.915527 -0.270996,-0.604249 -0.270996,-1.453858 0,-0.864258 0.314942,-1.479492 0.314941,-0.615234 0.915527,-0.933838 0.604248,-0.322266 1.450195,-0.322266 0.563965,0 1.186524,0.161133 l -0.179444,0.585938 q -0.142822,-0.04761 -0.46875,-0.08423 -0.322265,-0.03662 -0.545654,-0.04761 -0.04395,-0.0037 -0.131836,-0.0037 -0.585937,0 -1.003418,0.256347 -0.41748,0.252686 -0.637207,0.725098 -0.219726,0.472412 -0.219726,1.113281 0,0.662842 0.201416,1.138916 0.205078,0.476074 0.593261,0.72876 0.391846,0.252686 0.9375,0.252686 0.322266,0 0.65918,-0.0769 0.336914,-0.0769 0.703125,-0.201416 l 0.205078,0.560303 q -0.344238,0.131836 -0.794678,0.223389 -0.446777,0.08789 -0.856933,0.08789 z" /><path style="line-height:142.99999475%;letter-spacing:-0.1px;fill:#ffffff" d="m 56.832052,79.654442 q 0.377197,-0.435791 0.966797,-0.435791 0.164795,0 0.344238,0.03296 L 58.040548,79.8229 q -0.102539,-0.01099 -0.201416,-0.01099 -0.567627,0 -0.941162,0.351562 v 2.713623 h -0.600586 v -3.566894 h 0.454102 l 0.08057,0.344238 z" /><path style="line-height:142.99999475%;letter-spacing:-0.1px;fill:#ffffff" d="m 61.27673,83.01992 q -0.201416,-0.351562 -0.303955,-0.725097 -0.06226,0.183105 -0.2417,0.336914 -0.179443,0.153808 -0.428467,0.241699 -0.249023,0.08789 -0.505371,0.08789 -0.362548,0 -0.651855,-0.113526 -0.285645,-0.113525 -0.454102,-0.351562 -0.164795,-0.238037 -0.164795,-0.593262 0,-0.344238 0.17212,-0.596924 0.172119,-0.256347 0.48706,-0.391846 0.318604,-0.135498 0.739746,-0.135498 0.505371,0 0.963135,0.26001 v -0.373535 q 0,-0.439453 -0.205078,-0.640869 -0.205078,-0.201416 -0.60791,-0.201416 -0.153809,0 -0.443116,0.02563 -0.285644,0.02197 -0.534667,0.06225 l -0.10254,-0.600585 q 0.446778,-0.05127 0.699463,-0.07324 0.256348,-0.02197 0.428467,-0.02197 0.666504,0 1.010742,0.351562 0.344239,0.351563 0.347901,1.047363 l 0.0073,1.054688 q 0.0037,0.53833 0.318603,1.105957 z m -1.343995,-0.618896 q 0.285645,0 0.501709,-0.09888 0.216065,-0.09888 0.333252,-0.281983 0.12085,-0.183105 0.12085,-0.421142 v -0.03296 q -0.183105,-0.102539 -0.406494,-0.157471 -0.223389,-0.05859 -0.465088,-0.05859 -0.391846,0 -0.626221,0.139161 -0.234375,0.135498 -0.234375,0.377197 0,0.157471 0.09521,0.27832 0.09888,0.12085 0.274658,0.19043 0.175782,0.06592 0.406494,0.06592 z" /><path style="fill:#fff;" d="m 64.21262,79.214989 q 0.46875,0 0.787353,0.183105 0.318604,0.183106 0.476075,0.505371 0.161132,0.322266 0.161132,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194091,-0.736084 -0.19043,-0.285644 -0.633545,-0.289306 -0.314942,0.0037 -0.593262,0.117187 -0.274658,0.109864 -0.487061,0.31128 l -0.0073,2.662353 h -0.600586 l 0.0073,-3.566894 h 0.443116 l 0.113525,0.355224 q 0.424805,-0.450439 1.12793,-0.450439 z" /><path style="line-height:142.99999475%;letter-spacing:-0.49000001px;fill:#ffffff" d="m 68.644493,78.19326 q -0.175781,0 -0.292969,-0.117187 -0.117187,-0.117188 -0.117187,-0.292969 0,-0.172119 0.117187,-0.289307 0.117188,-0.117187 0.292969,-0.117187 0.172119,0 0.289307,0.117187 0.117187,0.117188 0.117187,0.289307 0,0.175781 -0.117187,0.292969 -0.117188,0.117187 -0.289307,0.117187 z m -0.311279,1.116944 H 68.9338 v 3.566894 h -0.600586 z" /><path style="fill:#fff;" d="m 71.362503,79.214989 q 0.46875,0 0.787354,0.183105 0.318603,0.183106 0.476074,0.505371 0.161133,0.322266 0.161133,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.19043,-0.285644 -0.633545,-0.289306 -0.314941,0.0037 -0.593262,0.117187 -0.274658,0.109864 -0.48706,0.31128 l -0.0073,2.662353 h -0.600585 l 0.0073,-3.566894 h 0.443115 l 0.113525,0.355224 q 0.424805,-0.450439 1.12793,-0.450439 z" /><path style="fill:#fff;" d="m 74.680374,79.844872 v 1.926269 q 0,0.161133 0.06958,0.314941 0.07324,0.150147 0.219727,0.249024 0.146484,0.09522 0.355224,0.09522 0.146485,0 0.333252,-0.02564 v 0.53833 q -0.238037,0.02197 -0.483398,0.02197 -0.340576,0 -0.578613,-0.146485 -0.238037,-0.146484 -0.358887,-0.391845 -0.12085,-0.249024 -0.12085,-0.549317 v -2.03247 h -0.644531 v -0.531006 h 0.644531 v -1.281739 h 0.563965 v 1.281739 h 0.981445 v 0.531006 h -0.981445 z" /><path style="fill:#fff;" d="m 78.078812,82.968651 q -0.556641,0 -0.981446,-0.230713 -0.421142,-0.230713 -0.655517,-0.651856 -0.230713,-0.424804 -0.230713,-0.977783 0,-0.560302 0.230713,-0.988769 0.234375,-0.428467 0.655517,-0.662842 0.424805,-0.234375 0.981446,-0.234375 0.545654,0 0.959472,0.234375 0.413819,0.234375 0.637207,0.662842 0.223389,0.424804 0.219727,0.988769 0,0.556641 -0.227051,0.977783 -0.223389,0.421143 -0.637207,0.651856 -0.410156,0.230713 -0.952148,0.230713 z m 0,-0.578613 q 0.344238,0 0.60791,-0.157471 0.267334,-0.161133 0.413818,-0.45044 0.150147,-0.292968 0.157471,-0.673828 -0.0073,-0.388183 -0.157471,-0.684814 -0.150146,-0.296631 -0.413818,-0.457764 -0.263672,-0.164795 -0.60791,-0.164795 -0.366211,0 -0.648194,0.164795 -0.27832,0.164795 -0.432129,0.461426 -0.150146,0.296631 -0.150146,0.688476 0,0.38086 0.150146,0.670166 0.153809,0.289307 0.432129,0.446778 0.278321,0.157471 0.648194,0.157471 z" /><path style="fill:#fff;" d="m 85.392044,83.01992 q -0.201416,-0.351562 -0.303955,-0.725097 -0.06226,0.183105 -0.241699,0.336914 -0.179444,0.153808 -0.428467,0.241699 -0.249023,0.08789 -0.505371,0.08789 -0.362549,0 -0.651856,-0.113526 -0.285644,-0.113525 -0.454101,-0.351562 -0.164795,-0.238037 -0.164795,-0.593262 0,-0.344238 0.172119,-0.596924 0.172119,-0.256347 0.487061,-0.391846 0.318603,-0.135498 0.739746,-0.135498 0.505371,0 0.963134,0.26001 v -0.373535 q 0,-0.439453 -0.205078,-0.640869 -0.205078,-0.201416 -0.60791,-0.201416 -0.153808,0 -0.443115,0.02563 -0.285645,0.02197 -0.534668,0.06225 L 83.11055,79.310204 q 0.446777,-0.05127 0.699463,-0.07324 0.256347,-0.02197 0.428467,-0.02197 0.666504,0 1.010742,0.351562 0.344238,0.351563 0.3479,1.047363 l 0.0073,1.054688 q 0.0037,0.53833 0.318604,1.105957 z M 84.04805,82.401024 q 0.285644,0 0.501709,-0.09888 0.216064,-0.09888 0.333252,-0.281983 0.120849,-0.183105 0.120849,-0.421142 v -0.03296 q -0.183105,-0.102539 -0.406494,-0.157471 -0.223388,-0.05859 -0.465088,-0.05859 -0.391845,0 -0.62622,0.139161 -0.234375,0.135498 -0.234375,0.377197 0,0.157471 0.09522,0.27832 0.09888,0.12085 0.274658,0.19043 0.175781,0.06592 0.406494,0.06592 z" /><path style="line-height:142.99999475%;letter-spacing:-0.27000001px;fill:#ffffff" d="m 90.639847,79.214989 q 0.505371,0 0.864258,0.212402 0.362548,0.20874 0.549316,0.615234 0.19043,0.402832 0.19043,0.970459 0,0.596924 -0.197754,1.036377 -0.197754,0.435791 -0.5896,0.673828 -0.388183,0.238038 -0.948486,0.238038 -0.86792,0 -1.109619,-0.637207 v 2.274169 h -0.604248 v -5.288085 h 0.446777 l 0.142822,0.454101 q 0.245362,-0.263672 0.567627,-0.406494 0.325928,-0.142822 0.688477,-0.142822 z m -0.08789,3.186035 q 0.300293,0 0.534668,-0.146485 0.238037,-0.146484 0.373535,-0.457763 0.13916,-0.314942 0.13916,-0.791016 0,-0.567627 -0.270996,-0.878906 -0.267334,-0.311279 -0.761718,-0.311279 -0.281983,0 -0.585938,0.09888 -0.300293,0.09521 -0.582275,0.270996 v 1.160888 q 0,0.402832 0.190429,0.64087 0.19043,0.234375 0.45044,0.325927 0.263672,0.08789 0.512695,0.08789 z" /><path style="line-height:142.99999475%;letter-spacing:-0.27000001px;fill:#ffffff" d="m 93.467987,79.654442 q 0.377197,-0.435791 0.966797,-0.435791 0.164795,0 0.344238,0.03296 L 94.676483,79.8229 q -0.102539,-0.01099 -0.201416,-0.01099 -0.567627,0 -0.941162,0.351562 v 2.713623 h -0.600586 v -3.566894 h 0.454102 l 0.08057,0.344238 z" /><path style="fill:#fff;" d="m 96.874748,82.968651 q -0.55664,0 -0.981445,-0.230713 -0.421143,-0.230713 -0.655518,-0.651856 -0.230713,-0.424804 -0.230713,-0.977783 0,-0.560302 0.230713,-0.988769 0.234375,-0.428467 0.655518,-0.662842 0.424805,-0.234375 0.981445,-0.234375 0.545655,0 0.959473,0.234375 0.413818,0.234375 0.637207,0.662842 0.223389,0.424804 0.219726,0.988769 0,0.556641 -0.22705,0.977783 -0.223389,0.421143 -0.637207,0.651856 -0.410157,0.230713 -0.952149,0.230713 z m 0,-0.578613 q 0.344239,0 0.60791,-0.157471 0.267334,-0.161133 0.413819,-0.45044 0.150146,-0.292968 0.15747,-0.673828 -0.0073,-0.388183 -0.15747,-0.684814 -0.150147,-0.296631 -0.413819,-0.457764 -0.263671,-0.164795 -0.60791,-0.164795 -0.366211,0 -0.648193,0.164795 -0.27832,0.164795 -0.432129,0.461426 -0.150147,0.296631 -0.150147,0.688476 0,0.38086 0.150147,0.670166 0.153809,0.289307 0.432129,0.446778 0.27832,0.157471 0.648193,0.157471 z" /><path style="line-height:142.99999475%;letter-spacing:-0.43000001px;fill:#ffffff" d="m 101.51098,79.214989 q 0.52368,0 0.88257,0.223388 0.36255,0.219727 0.54199,0.626221 0.17944,0.402832 0.17944,0.948486 0,0.596924 -0.19775,1.036377 -0.19776,0.435791 -0.5896,0.673828 -0.38818,0.238038 -0.94849,0.238038 -0.84961,0 -1.09863,-0.611573 l -0.17212,0.527344 H 99.6726 L 99.6653,77.32534 h 0.60424 v 2.420655 q 0.49439,-0.531006 1.24146,-0.531006 z m -0.0879,3.186035 q 0.30029,0 0.53467,-0.146485 0.23803,-0.146484 0.37353,-0.457763 0.13916,-0.314942 0.13916,-0.791016 0,-0.3479 -0.12085,-0.615234 -0.11719,-0.270996 -0.35156,-0.421143 -0.23438,-0.153808 -0.5603,-0.153808 -0.36621,0 -0.61158,0.0769 -0.24169,0.07324 -0.55664,0.289307 v 0.688476 l 0.004,0.476074 q 0,0.402832 0.18676,0.64087 0.19043,0.234375 0.45044,0.325927 0.26001,0.08789 0.5127,0.08789 z" /><path style="line-height:142.99999475%;letter-spacing:-0.18000001px;fill:#ffffff" d="m 103.64079,77.32534 h 0.60059 v 5.551758 h -0.60059 z" /><path style="line-height:142.99999475%;letter-spacing:-0.18000001px;fill:#ffffff" d="m 106.96543,82.408348 q 0.24536,0 0.52002,-0.05493 0.27466,-0.05493 0.54932,-0.161132 l 0.18676,0.512695 q -0.26001,0.109863 -0.65917,0.183105 -0.39917,0.07324 -0.7251,0.07324 -0.86426,0 -1.34033,-0.461426 -0.47608,-0.465088 -0.47608,-1.428223 0,-0.600586 0.20874,-1.018066 0.2124,-0.421143 0.61157,-0.637207 0.39917,-0.216065 0.95948,-0.216065 0.49438,0 0.82763,0.230713 0.33325,0.227051 0.49439,0.596924 0.16113,0.366211 0.16113,0.787354 0,0.289306 -0.0806,0.578613 l -2.54882,0.01831 q 0.0806,0.494385 0.41015,0.747071 0.32959,0.249023 0.90088,0.249023 z m -0.24536,-2.633057 q -0.52002,0 -0.78369,0.300293 -0.26367,0.300293 -0.30029,0.809327 l 1.9812,-0.01831 q 0.007,-0.08789 0.007,-0.131836 0,-0.249023 -0.0915,-0.465088 -0.0916,-0.219726 -0.29663,-0.355224 -0.20142,-0.139161 -0.51636,-0.139161 z" /><path style="line-height:142.99999475%;letter-spacing:-0.1px;fill:#ffffff" d="m 113.01468,79.214989 q 0.42847,0 0.72143,0.183105 0.29664,0.183106 0.44312,0.505371 0.14648,0.322266 0.15015,0.739746 v 2.233887 h -0.60059 v -2.06543 q -0.007,-0.454101 -0.19043,-0.736084 -0.1831,-0.285644 -0.60059,-0.285644 -0.29663,0 -0.5603,0.106201 -0.26001,0.102539 -0.4541,0.285645 0.0513,0.223388 0.0513,0.461425 v 2.233887 h -0.60059 v -2.06543 q -0.007,-0.454101 -0.19043,-0.736084 -0.1831,-0.285644 -0.60058,-0.285644 -0.27832,0 -0.52735,0.106201 -0.24902,0.102539 -0.44311,0.289307 l -0.007,2.69165 h -0.60059 l 0.007,-3.566894 h 0.44312 l 0.11352,0.351562 q 0.41382,-0.446777 1.09131,-0.446777 0.37354,0 0.64453,0.13916 0.27466,0.13916 0.43579,0.395508 0.53467,-0.534668 1.27442,-0.534668 z" /><path style="fill:#fff;" d="m 118.17713,79.844872 v 1.926269 q 0,0.161133 0.0696,0.314941 0.0732,0.150147 0.21973,0.249024 0.14648,0.09522 0.35522,0.09522 0.14649,0 0.33325,-0.02564 v 0.53833 q -0.23803,0.02197 -0.48339,0.02197 -0.34058,0 -0.57862,-0.146485 -0.23803,-0.146484 -0.35888,-0.391845 -0.12085,-0.249024 -0.12085,-0.549317 v -2.03247 h -0.64453 v -0.531006 h 0.64453 v -1.281739 h 0.56396 v 1.281739 h 0.98145 v 0.531006 h -0.98145 z" /><path style="line-height:142.99999475%;letter-spacing:-0.14px;fill:#ffffff" d="m 121.65614,79.214989 q 0.46875,0 0.78735,0.183105 0.3186,0.183106 0.47607,0.505371 0.16114,0.322266 0.16114,0.739746 v 2.233887 h -0.60059 v -2.06543 q 0,-0.450439 -0.19409,-0.736084 -0.19409,-0.285644 -0.63355,-0.285644 -0.31494,0 -0.59326,0.113525 -0.27832,0.109864 -0.49438,0.307617 v 2.666016 h -0.60059 v -5.55542 h 0.60059 v 2.307129 q 0.42114,-0.413818 1.09131,-0.413818 z" /><path style="line-height:142.99999475%;letter-spacing:-0.14px;fill:#ffffff" d="m 126.55154,83.01992 q -0.20142,-0.351562 -0.30396,-0.725097 -0.0623,0.183105 -0.2417,0.336914 -0.17944,0.153808 -0.42846,0.241699 -0.24903,0.08789 -0.50538,0.08789 -0.36254,0 -0.65185,-0.113526 -0.28565,-0.113525 -0.4541,-0.351562 -0.1648,-0.238037 -0.1648,-0.593262 0,-0.344238 0.17212,-0.596924 0.17212,-0.256347 0.48706,-0.391846 0.31861,-0.135498 0.73975,-0.135498 0.50537,0 0.96313,0.26001 v -0.373535 q 0,-0.439453 -0.20508,-0.640869 -0.20507,-0.201416 -0.60791,-0.201416 -0.1538,0 -0.44311,0.02563 -0.28565,0.02197 -0.53467,0.06225 l -0.10254,-0.600585 q 0.44678,-0.05127 0.69947,-0.07324 0.25634,-0.02197 0.42846,-0.02197 0.66651,0 1.01074,0.351562 0.34424,0.351563 0.3479,1.047363 l 0.007,1.054688 q 0.004,0.53833 0.3186,1.105957 l -0.531,0.245361 z m -1.344,-0.618896 q 0.28565,0 0.50171,-0.09888 0.21607,-0.09888 0.33325,-0.281983 0.12085,-0.183105 0.12085,-0.421142 v -0.03296 q -0.1831,-0.102539 -0.40649,-0.157471 -0.22339,-0.05859 -0.46509,-0.05859 -0.39184,0 -0.62622,0.139161 -0.23437,0.135498 -0.23437,0.377197 0,0.157471 0.0952,0.27832 0.0989,0.12085 0.27466,0.19043 0.17578,0.06592 0.40649,0.06592 z" /><path style="fill:#fff;" d="m 128.51725,79.844872 v 1.926269 q 0,0.161133 0.0696,0.314941 0.0732,0.150147 0.21973,0.249024 0.14648,0.09522 0.35522,0.09522 0.14649,0 0.33325,-0.02564 v 0.53833 q -0.23803,0.02197 -0.4834,0.02197 -0.34057,0 -0.57861,-0.146485 -0.23804,-0.146484 -0.35889,-0.391845 -0.12084,-0.249024 -0.12084,-0.549317 v -2.03247 h -0.64454 v -0.531006 h 0.64454 v -1.281739 h 0.56396 v 1.281739 h 0.98145 v 0.531006 h -0.98145 z" /><path style="fill:#fff;" d="m 132.67008,78.19326 q -0.17578,0 -0.29297,-0.117187 -0.11718,-0.117188 -0.11718,-0.292969 0,-0.172119 0.11718,-0.289307 0.11719,-0.117187 0.29297,-0.117187 0.17212,0 0.28931,0.117187 0.11719,0.117188 0.11719,0.289307 0,0.175781 -0.11719,0.292969 -0.11719,0.117187 -0.28931,0.117187 z m -0.31128,1.116944 h 0.60059 v 3.566894 h -0.60059 z" /><path style="fill:#fff;" d="m 134.94791,79.844872 v 1.926269 q 0,0.161133 0.0696,0.314941 0.0733,0.150147 0.21973,0.249024 0.14649,0.09522 0.35523,0.09522 0.14648,0 0.33325,-0.02564 v 0.53833 q -0.23804,0.02197 -0.4834,0.02197 -0.34058,0 -0.57861,-0.146485 -0.23804,-0.146484 -0.35889,-0.391845 -0.12085,-0.249024 -0.12085,-0.549317 v -2.03247 h -0.64453 v -0.531006 h 0.64453 v -1.281739 h 0.56396 v 1.281739 h 0.98145 v 0.531006 h -0.98145 z" /><path style="line-height:142.99999475%;letter-spacing:-0.25999999px;fill:#ffffff" d="m 140.03825,82.961327 q -0.55297,0 -0.95214,-0.223389 -0.39917,-0.223389 -0.60791,-0.640869 -0.20875,-0.421143 -0.20875,-0.996094 0,-0.571289 0.21241,-0.996094 0.2124,-0.424804 0.62256,-0.655517 0.41015,-0.230713 0.9851,-0.227051 0.3003,-0.0037 0.5896,0.05493 0.28931,0.05493 0.49073,0.150146 l -0.14649,0.60791 q -0.44678,-0.201416 -0.93017,-0.201416 -0.61158,0 -0.88624,0.314942 -0.27465,0.311279 -0.27465,0.933837 0,0.651856 0.31128,0.970459 0.31494,0.318604 0.91552,0.318604 0.24536,0 0.43579,-0.04761 0.1941,-0.05127 0.50904,-0.168457 l 0.18677,0.55664 q -0.30762,0.117188 -0.63355,0.183106 -0.32593,0.06592 -0.6189,0.06592 z" /><path style="line-height:142.99999475%;letter-spacing:-0.19px;fill:#ffffff" d="m 143.34881,82.968651 q -0.55664,0 -0.98145,-0.230713 -0.42114,-0.230713 -0.65551,-0.651856 -0.23072,-0.424804 -0.23072,-0.977783 0,-0.560302 0.23072,-0.988769 0.23437,-0.428467 0.65551,-0.662842 0.42481,-0.234375 0.98145,-0.234375 0.54565,0 0.95947,0.234375 0.41382,0.234375 0.63721,0.662842 0.22339,0.424804 0.21972,0.988769 0,0.556641 -0.22705,0.977783 -0.22338,0.421143 -0.6372,0.651856 -0.41016,0.230713 -0.95215,0.230713 z m 0,-0.578613 q 0.34424,0 0.60791,-0.157471 0.26733,-0.161133 0.41382,-0.45044 0.15014,-0.292968 0.15747,-0.673828 -0.007,-0.388183 -0.15747,-0.684814 -0.15015,-0.296631 -0.41382,-0.457764 -0.26367,-0.164795 -0.60791,-0.164795 -0.36621,0 -0.6482,0.164795 -0.27832,0.164795 -0.43212,0.461426 -0.15015,0.296631 -0.15015,0.688476 0,0.38086 0.15015,0.670166 0.1538,0.289307 0.43212,0.446778 0.27833,0.157471 0.6482,0.157471 z" /><path style="line-height:142.99999475%;letter-spacing:-0.19px;fill:#ffffff" d="m 148.7655,83.01992 q -0.2124,-0.380859 -0.30029,-0.717773 -0.0549,0.150146 -0.2124,0.300293 -0.15381,0.150146 -0.40283,0.252685 -0.24537,0.102539 -0.56031,0.102539 -0.51635,0 -0.83496,-0.201416 -0.3186,-0.201416 -0.4541,-0.520019 -0.1355,-0.322266 -0.1355,-0.706787 v -2.215576 h 0.60059 v 2.028808 q 0,0.479737 0.19775,0.769043 0.20142,0.289307 0.75806,0.289307 0.41382,0 0.68481,-0.194092 0.271,-0.197754 0.271,-0.655518 v -2.24121 h 0.60059 v 2.358398 q 0.004,0.53833 0.3186,1.105957 z" /><path style="line-height:142.99999475%;letter-spacing:-0.09px;fill:#ffffff" d="m 150.00372,77.32534 h 0.60059 v 5.551758 h -0.60059 z" /><path style="line-height:142.99999475%;letter-spacing:-0.09px;fill:#ffffff" d="m 154.71841,83.01992 q -0.20874,-0.377197 -0.30762,-0.739746 -0.15747,0.336914 -0.49072,0.509033 -0.32959,0.17212 -0.8313,0.17212 -0.47974,0 -0.84229,-0.223389 -0.36255,-0.227051 -0.56396,-0.637207 -0.19776,-0.410156 -0.19776,-0.952149 0,-0.574951 0.22339,-1.010742 0.22339,-0.439453 0.62989,-0.681152 0.41015,-0.241699 0.94848,-0.241699 0.55298,0 1.0437,0.380859 v -2.27417 h 0.60059 v 4.346924 q 0.004,0.53833 0.3186,1.105957 z m -1.48316,-0.633545 q 0.53467,0 0.81299,-0.303955 0.28198,-0.307617 0.28198,-0.864257 V 80.11953 q -0.22705,-0.197754 -0.49072,-0.278321 -0.26367,-0.08057 -0.50537,-0.08057 -0.36987,0 -0.64087,0.164795 -0.271,0.161133 -0.41748,0.465088 -0.14648,0.300293 -0.14648,0.717773 0,0.314942 0.11718,0.60791 0.11719,0.292969 0.36621,0.483399 0.24903,0.186767 0.62256,0.186767 z" /><path style="line-height:142.99999475%;letter-spacing:-0.19px;fill:#ffffff" d="m 157.75219,79.214989 q 0.46875,0 0.78735,0.183105 0.31861,0.183106 0.47608,0.505371 0.16113,0.322266 0.16113,0.739746 v 2.233887 h -0.60059 v -2.06543 q 0,-0.450439 -0.19409,-0.736084 -0.19043,-0.285644 -0.63354,-0.289306 -0.31494,0.0037 -0.59326,0.117187 -0.27466,0.109864 -0.48706,0.31128 l -0.007,2.662353 h -0.60058 l 0.007,-3.566894 h 0.44311 l 0.11353,0.355224 q 0.4248,-0.450439 1.12793,-0.450439 z" /><path style="line-height:142.99999475%;letter-spacing:-0.19px;fill:#ffffff" d="m 160.11102,77.497459 h 0.53101 v 1.71753 h -0.53101 z" /><path style="fill:#fff;" d="m 162.41858,79.844872 v 1.926269 q 0,0.161133 0.0696,0.314941 0.0732,0.150147 0.21973,0.249024 0.14648,0.09522 0.35522,0.09522 0.14648,0 0.33325,-0.02564 v 0.53833 q -0.23803,0.02197 -0.4834,0.02197 -0.34057,0 -0.57861,-0.146485 -0.23804,-0.146484 -0.35889,-0.391845 -0.12085,-0.249024 -0.12085,-0.549317 v -2.03247 h -0.64453 v -0.531006 h 0.64453 v -1.281739 h 0.56397 v 1.281739 h 0.98144 v 0.531006 h -0.98144 z" /><path style="fill:#fff;" d="m 30.251877,89.939988 q 0.46875,0 0.787353,0.183106 0.318604,0.183105 0.476075,0.505371 0.161132,0.322266 0.161132,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194091,-0.736084 -0.194092,-0.285645 -0.633545,-0.285645 -0.314942,0 -0.593262,0.113526 -0.27832,0.109863 -0.494385,0.307617 v 2.666016 h -0.600586 v -5.55542 h 0.600586 v 2.307129 q 0.421143,-0.413819 1.091309,-0.413819 z" /><path style="fill:#fff;" d="m 35.287277,93.74492 q -0.201416,-0.351563 -0.303955,-0.725098 -0.06226,0.183106 -0.241699,0.336914 -0.179443,0.153809 -0.428467,0.2417 -0.249023,0.08789 -0.505371,0.08789 -0.362549,0 -0.651855,-0.113525 -0.285645,-0.113526 -0.454102,-0.351563 -0.164795,-0.238037 -0.164795,-0.593261 0,-0.344239 0.172119,-0.596924 0.172119,-0.256348 0.487061,-0.391846 0.318603,-0.135498 0.739746,-0.135498 0.505371,0 0.963135,0.26001 v -0.373535 q 0,-0.439453 -0.205078,-0.64087 -0.205079,-0.201416 -0.607911,-0.201416 -0.153808,0 -0.443115,0.02563 -0.285644,0.02197 -0.534668,0.06226 l -0.102539,-0.600586 q 0.446777,-0.05127 0.699463,-0.07324 0.256348,-0.02197 0.428467,-0.02197 0.666504,0 1.010742,0.351563 0.344238,0.351562 0.3479,1.047363 l 0.0073,1.054688 q 0.0037,0.53833 0.318603,1.105957 l -0.531006,0.245361 z m -1.343994,-0.618897 q 0.285645,0 0.501709,-0.09888 0.216065,-0.09888 0.333252,-0.281983 0.12085,-0.183105 0.12085,-0.421142 v -0.03296 q -0.183106,-0.10254 -0.406495,-0.157471 -0.223388,-0.05859 -0.465087,-0.05859 -0.391846,0 -0.626221,0.13916 -0.234375,0.135498 -0.234375,0.377198 0,0.15747 0.09521,0.27832 0.09888,0.120849 0.274658,0.19043 0.175781,0.06592 0.406494,0.06592 z" /><path style="letter-spacing:-0.52999997px;fill:#ffffff" d="m 38.323166,89.939988 q 0.46875,0 0.787353,0.183106 0.318604,0.183105 0.476075,0.505371 0.161132,0.322266 0.161132,0.739746 v 2.233887 h -0.600585 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.19043,-0.285645 -0.633545,-0.289307 -0.314942,0.0037 -0.593262,0.117188 -0.274658,0.109863 -0.48706,0.311279 l -0.0073,2.662354 h -0.600586 l 0.0073,-3.566895 h 0.443115 l 0.113525,0.355225 q 0.424805,-0.45044 1.12793,-0.45044 z" /><path style="letter-spacing:-0.1px;fill:#ffffff" d="m 43.341262,93.74492 q -0.20874,-0.377197 -0.307617,-0.739746 -0.157471,0.336914 -0.490723,0.509033 -0.32959,0.172119 -0.831299,0.172119 -0.479736,0 -0.842285,-0.223388 -0.362549,-0.227051 -0.563965,-0.637207 -0.197754,-0.410157 -0.197754,-0.952149 0,-0.574951 0.223389,-1.010742 0.223389,-0.439453 0.629883,-0.681152 0.410156,-0.2417 0.948486,-0.2417 0.552979,0 1.043701,0.38086 v -2.27417 h 0.600586 v 4.346924 q 0.0037,0.53833 0.318604,1.105957 z m -1.483154,-0.633545 q 0.534668,0 0.812988,-0.303955 0.281982,-0.307617 0.281982,-0.864258 v -1.098633 q -0.227051,-0.197754 -0.490722,-0.27832 -0.263672,-0.08057 -0.505371,-0.08057 -0.369874,0 -0.64087,0.164795 -0.270996,0.161132 -0.41748,0.465087 -0.146484,0.300293 -0.146484,0.717774 0,0.314941 0.117187,0.60791 0.117188,0.292969 0.366211,0.483398 0.249023,0.186768 0.622559,0.186768 z" /><path style="letter-spacing:-0.1px;fill:#ffffff" d="m 44.676809,88.05034 h 0.600586 v 5.551758 h -0.600586 z" /><path style="fill:#fff;" d="m 48.081448,93.133348 q 0.245361,0 0.520019,-0.05493 0.274658,-0.05493 0.549317,-0.161133 l 0.186767,0.512696 q -0.26001,0.109863 -0.65918,0.183105 -0.399169,0.07324 -0.725097,0.07324 -0.864258,0 -1.340332,-0.461426 -0.476074,-0.465087 -0.476074,-1.428222 0,-0.600586 0.20874,-1.018067 0.212402,-0.421142 0.611572,-0.637207 0.39917,-0.216064 0.959473,-0.216064 0.494384,0 0.827636,0.230713 0.333252,0.227051 0.494385,0.596924 0.161133,0.366211 0.161133,0.787353 0,0.289307 -0.08057,0.578613 l -2.548829,0.01831 q 0.08057,0.494385 0.410157,0.74707 0.32959,0.249024 0.900879,0.249024 z m -0.245362,-2.633057 q -0.520019,0 -0.783691,0.300293 -0.263672,0.300293 -0.300293,0.809326 l 1.981201,-0.01831 q 0.0073,-0.08789 0.0073,-0.131836 0,-0.249024 -0.09155,-0.465088 -0.09155,-0.219727 -0.296631,-0.355225 -0.201416,-0.13916 -0.516358,-0.13916 z" /><path style="fill:#fff;" d="m 49.83926,94.312547 q 0.245361,-0.457764 0.336914,-0.780029 0.09155,-0.322266 0.09155,-0.765381 h 0.65918 q 0,0.454101 -0.161133,0.944824 -0.157471,0.494385 -0.424805,0.856934 z" /><path style="fill:#fff;" d="m 56.456692,93.74492 q -0.201416,-0.351563 -0.303955,-0.725098 -0.06226,0.183106 -0.2417,0.336914 -0.179443,0.153809 -0.428466,0.2417 -0.249024,0.08789 -0.505371,0.08789 -0.362549,0 -0.651856,-0.113525 -0.285644,-0.113526 -0.454101,-0.351563 -0.164795,-0.238037 -0.164795,-0.593261 0,-0.344239 0.172119,-0.596924 0.172119,-0.256348 0.48706,-0.391846 0.318604,-0.135498 0.739746,-0.135498 0.505371,0 0.963135,0.26001 v -0.373535 q 0,-0.439453 -0.205078,-0.64087 -0.205078,-0.201416 -0.60791,-0.201416 -0.153809,0 -0.443115,0.02563 -0.285645,0.02197 -0.534668,0.06226 l -0.102539,-0.600586 q 0.446777,-0.05127 0.699462,-0.07324 0.256348,-0.02197 0.428467,-0.02197 0.666504,0 1.010742,0.351563 0.344239,0.351562 0.347901,1.047363 l 0.0073,1.054688 q 0.0037,0.53833 0.318604,1.105957 l -0.531006,0.245361 z m -1.343994,-0.618897 q 0.285644,0 0.501709,-0.09888 0.216064,-0.09888 0.333252,-0.281983 0.120849,-0.183105 0.120849,-0.421142 v -0.03296 q -0.183105,-0.10254 -0.406494,-0.157471 -0.223389,-0.05859 -0.465088,-0.05859 -0.391846,0 -0.626221,0.13916 -0.234375,0.135498 -0.234375,0.377198 0,0.15747 0.09522,0.27832 0.09888,0.120849 0.274658,0.19043 0.175782,0.06592 0.406495,0.06592 z" /><path style="letter-spacing:-0.23px;fill:#ffffff" d="m 59.49258,89.939988 q 0.46875,0 0.787354,0.183106 0.318603,0.183105 0.476074,0.505371 0.161133,0.322266 0.161133,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.190429,-0.285645 -0.633545,-0.289307 -0.314941,0.0037 -0.593261,0.117188 -0.274659,0.109863 -0.487061,0.311279 l -0.0073,2.662354 H 57.80071 l 0.0073,-3.566895 h 0.443115 l 0.113526,0.355225 q 0.424804,-0.45044 1.127929,-0.45044 z" /><path style="letter-spacing:-0.23px;fill:#ffffff" d="m 64.810677,93.74492 q -0.208741,-0.377197 -0.307618,-0.739746 -0.15747,0.336914 -0.490722,0.509033 -0.32959,0.172119 -0.831299,0.172119 -0.479736,0 -0.842285,-0.223388 -0.362549,-0.227051 -0.563965,-0.637207 -0.197754,-0.410157 -0.197754,-0.952149 0,-0.574951 0.223389,-1.010742 0.223388,-0.439453 0.629882,-0.681152 0.410157,-0.2417 0.948487,-0.2417 0.552978,0 1.043701,0.38086 v -2.27417 h 0.600586 v 4.346924 q 0.0037,0.53833 0.318603,1.105957 z m -1.483155,-0.633545 q 0.534668,0 0.812989,-0.303955 0.281982,-0.307617 0.281982,-0.864258 v -1.098633 q -0.227051,-0.197754 -0.490723,-0.27832 -0.263672,-0.08057 -0.505371,-0.08057 -0.369873,0 -0.640869,0.164795 -0.270996,0.161132 -0.41748,0.465087 -0.146485,0.300293 -0.146485,0.717774 0,0.314941 0.117188,0.60791 0.117187,0.292969 0.366211,0.483398 0.249023,0.186768 0.622558,0.186768 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 69.505238,89.939988 q 0.46875,0 0.787353,0.183106 0.318604,0.183105 0.476074,0.505371 0.161133,0.322266 0.161133,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.190429,-0.285645 -0.633545,-0.289307 -0.314941,0.0037 -0.593261,0.117188 -0.274658,0.109863 -0.487061,0.311279 l -0.0073,2.662354 h -0.600586 l 0.0073,-3.566895 h 0.443116 l 0.113525,0.355225 q 0.424805,-0.45044 1.12793,-0.45044 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 73.422718,93.69365 q -0.556641,0 -0.981445,-0.230712 -0.421143,-0.230713 -0.655518,-0.651856 -0.230713,-0.424805 -0.230713,-0.977783 0,-0.560303 0.230713,-0.98877 0.234375,-0.428466 0.655518,-0.662841 0.424804,-0.234375 0.981445,-0.234375 0.545654,0 0.959473,0.234375 0.413818,0.234375 0.637207,0.662841 0.223388,0.424805 0.219726,0.98877 0,0.55664 -0.22705,0.977783 -0.223389,0.421143 -0.637208,0.651856 -0.410156,0.230712 -0.952148,0.230712 z m 0,-0.578613 q 0.344238,0 0.60791,-0.157471 0.267334,-0.161132 0.413819,-0.450439 0.150146,-0.292969 0.15747,-0.673828 -0.0073,-0.388184 -0.15747,-0.684815 -0.150147,-0.29663 -0.413819,-0.457763 -0.263672,-0.164795 -0.60791,-0.164795 -0.366211,0 -0.648193,0.164795 -0.278321,0.164795 -0.432129,0.461426 -0.150147,0.29663 -0.150147,0.688476 0,0.380859 0.150147,0.670166 0.153808,0.289307 0.432129,0.446777 0.27832,0.157471 0.648193,0.157471 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 75.439564,90.035203 h 0.611572 l 0.776367,2.548828 q 0.01465,0.05859 0.0293,0.168457 0.01465,0.109864 0.01831,0.161133 h 0.0293 q 0.0037,-0.04395 0.02563,-0.172119 0.02563,-0.131836 0.04028,-0.175781 l 0.84961,-2.53418 h 0.549316 l 0.791016,2.548828 q 0.01099,0.03296 0.0293,0.161133 0.02197,0.124512 0.02563,0.175781 h 0.0293 q 0.0037,-0.03662 0.02563,-0.146484 0.02197,-0.113526 0.04028,-0.183106 l 0.761719,-2.55249 h 0.615234 l -1.124267,3.585205 H 78.940532 L 78.164165,91.21074 q -0.02197,-0.0769 -0.04761,-0.190429 -0.02197,-0.117188 -0.02564,-0.150147 h -0.01465 q -0.0037,0.03296 -0.03296,0.150147 -0.02563,0.113525 -0.04761,0.186767 l -0.820312,2.41333 h -0.600586 l -1.135254,-3.585205 z" /><path style="fill:#fff;" d="m 83.491566,88.91826 q -0.175782,0 -0.292969,-0.117188 -0.117188,-0.117187 -0.117188,-0.292968 0,-0.17212 0.117188,-0.289307 0.117187,-0.117188 0.292969,-0.117188 0.172119,0 0.289306,0.117188 0.117188,0.117187 0.117188,0.289307 0,0.175781 -0.117188,0.292968 -0.117187,0.117188 -0.289306,0.117188 z m -0.31128,1.116943 h 0.600586 v 3.566895 h -0.600586 z" /><path style="fill:#fff;" d="m 85.769398,90.569871 v 1.92627 q 0,0.161132 0.06958,0.314941 0.07324,0.150147 0.219726,0.249024 0.146485,0.09521 0.355225,0.09521 0.146484,0 0.333252,-0.02563 v 0.53833 q -0.238037,0.02197 -0.483398,0.02197 -0.340577,0 -0.578614,-0.146484 -0.238037,-0.146484 -0.358886,-0.391846 -0.12085,-0.249023 -0.12085,-0.549316 v -2.032471 h -0.644531 v -0.531006 h 0.644531 v -1.281738 h 0.563965 v 1.281738 h 0.981445 v 0.531006 h -0.981445 z" /><path style="fill:#fff;" d="m 91.299183,89.939988 q 0.46875,0 0.787353,0.183106 0.318604,0.183105 0.476075,0.505371 0.161132,0.322266 0.161132,0.739746 v 2.233887 h -0.600585 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.19043,-0.285645 -0.633545,-0.289307 -0.314942,0.0037 -0.593262,0.117188 -0.274658,0.109863 -0.48706,0.311279 l -0.0073,2.662354 h -0.600586 l 0.0073,-3.566895 h 0.443115 l 0.113525,0.355225 q 0.424805,-0.45044 1.12793,-0.45044 z" /><path style="fill:#fff;" d="m 95.547226,93.133348 q 0.245361,0 0.520019,-0.05493 0.274659,-0.05493 0.549317,-0.161133 l 0.186767,0.512696 q -0.260009,0.109863 -0.659179,0.183105 -0.39917,0.07324 -0.725098,0.07324 -0.864258,0 -1.340332,-0.461426 -0.476074,-0.465087 -0.476074,-1.428222 0,-0.600586 0.20874,-1.018067 0.212402,-0.421142 0.611572,-0.637207 0.39917,-0.216064 0.959473,-0.216064 0.494385,0 0.827637,0.230713 0.333252,0.227051 0.494385,0.596924 0.161132,0.366211 0.161132,0.787353 0,0.289307 -0.08057,0.578613 l -2.548828,0.01831 q 0.08057,0.494385 0.410156,0.74707 0.32959,0.249024 0.900879,0.249024 z m -0.245361,-2.633057 q -0.52002,0 -0.783692,0.300293 -0.263672,0.300293 -0.300293,0.809326 l 1.981201,-0.01831 q 0.0073,-0.08789 0.0073,-0.131836 0,-0.249024 -0.09155,-0.465088 -0.09155,-0.219727 -0.296631,-0.355225 -0.201416,-0.13916 -0.516357,-0.13916 z" /><path style="fill:#fff;" d="m 99.458359,93.133348 q 0.245361,0 0.520019,-0.05493 0.274662,-0.05493 0.549312,-0.161133 l 0.18677,0.512696 q -0.26001,0.109863 -0.65918,0.183105 -0.399167,0.07324 -0.725095,0.07324 -0.864258,0 -1.340332,-0.461426 -0.476074,-0.465087 -0.476074,-1.428222 0,-0.600586 0.20874,-1.018067 0.212402,-0.421142 0.611572,-0.637207 0.39917,-0.216064 0.959473,-0.216064 0.494385,0 0.827636,0.230713 0.33325,0.227051 0.49439,0.596924 0.16113,0.366211 0.16113,0.787353 0,0.289307 -0.0806,0.578613 l -2.548826,0.01831 q 0.08057,0.494385 0.410156,0.74707 0.32959,0.249024 0.900879,0.249024 z m -0.245362,-2.633057 q -0.520019,0 -0.783691,0.300293 -0.263672,0.300293 -0.300293,0.809326 l 1.981197,-0.01831 q 0.007,-0.08789 0.007,-0.131836 0,-0.249024 -0.0916,-0.465088 -0.09156,-0.219727 -0.296635,-0.355225 -0.201416,-0.13916 -0.516358,-0.13916 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 104.66954,93.74492 q -0.20874,-0.377197 -0.30762,-0.739746 -0.15747,0.336914 -0.49072,0.509033 -0.32959,0.172119 -0.8313,0.172119 -0.47973,0 -0.84228,-0.223388 -0.36255,-0.227051 -0.56397,-0.637207 -0.19775,-0.410157 -0.19775,-0.952149 0,-0.574951 0.22339,-1.010742 0.22339,-0.439453 0.62988,-0.681152 0.41016,-0.2417 0.94849,-0.2417 0.55297,0 1.0437,0.38086 v -2.27417 h 0.60058 v 4.346924 q 0.004,0.53833 0.31861,1.105957 z m -1.48315,-0.633545 q 0.53466,0 0.81298,-0.303955 0.28199,-0.307617 0.28199,-0.864258 v -1.098633 q -0.22705,-0.197754 -0.49073,-0.27832 -0.26367,-0.08057 -0.50537,-0.08057 -0.36987,0 -0.64087,0.164795 -0.27099,0.161132 -0.41748,0.465087 -0.14648,0.300293 -0.14648,0.717774 0,0.314941 0.11719,0.60791 0.11718,0.292969 0.36621,0.483398 0.24902,0.186768 0.62256,0.186768 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 106.76695,93.69365 q -0.57861,-0.0037 -1.20483,-0.285644 l 0.19775,-0.53833 q 0.5896,0.263672 1.00708,0.270996 0.76172,-0.01099 0.76538,-0.501709 0,-0.172119 -0.0989,-0.281982 -0.0952,-0.109864 -0.2417,-0.175782 -0.14283,-0.06592 -0.39551,-0.146484 -0.33325,-0.106201 -0.54199,-0.20874 -0.20874,-0.106202 -0.35889,-0.314942 -0.14648,-0.20874 -0.14648,-0.552978 0.011,-1.025391 1.24878,-1.025391 0.56762,0 0.98876,0.194092 l -0.20874,0.545654 q -0.42114,-0.186767 -0.78002,-0.186767 -0.65552,0.0073 -0.68116,0.472412 0,0.13916 0.0879,0.230713 0.0879,0.09155 0.21607,0.150146 0.13183,0.05493 0.36621,0.131836 0.3479,0.109863 0.56763,0.223389 0.22338,0.109863 0.38452,0.340576 0.16113,0.227051 0.16113,0.604248 0,1.054687 -1.33301,1.054687 z" /><path style="fill:#fff;" d="m 111.59264,90.569871 v 1.92627 q 0,0.161132 0.0696,0.314941 0.0732,0.150147 0.21972,0.249024 0.14649,0.09521 0.35523,0.09521 0.14648,0 0.33325,-0.02563 v 0.53833 q -0.23804,0.02197 -0.4834,0.02197 -0.34058,0 -0.57861,-0.146484 -0.23804,-0.146484 -0.35889,-0.391846 -0.12085,-0.249023 -0.12085,-0.549316 v -2.032471 h -0.64453 v -0.531006 h 0.64453 v -1.281738 h 0.56397 v 1.281738 h 0.98144 v 0.531006 h -0.98144 z" /><path style="fill:#fff;" d="m 114.99107,93.69365 q -0.55664,0 -0.98144,-0.230712 -0.42114,-0.230713 -0.65552,-0.651856 -0.23071,-0.424805 -0.23071,-0.977783 0,-0.560303 0.23071,-0.98877 0.23438,-0.428466 0.65552,-0.662841 0.4248,-0.234375 0.98144,-0.234375 0.54566,0 0.95948,0.234375 0.41381,0.234375 0.6372,0.662841 0.22339,0.424805 0.21973,0.98877 0,0.55664 -0.22705,0.977783 -0.22339,0.421143 -0.63721,0.651856 -0.41015,0.230712 -0.95215,0.230712 z m 0,-0.578613 q 0.34424,0 0.60791,-0.157471 0.26734,-0.161132 0.41382,-0.450439 0.15015,-0.292969 0.15747,-0.673828 -0.007,-0.388184 -0.15747,-0.684815 -0.15014,-0.29663 -0.41382,-0.457763 -0.26367,-0.164795 -0.60791,-0.164795 -0.36621,0 -0.64819,0.164795 -0.27832,0.164795 -0.43213,0.461426 -0.15015,0.29663 -0.15015,0.688476 0,0.380859 0.15015,0.670166 0.15381,0.289307 0.43213,0.446777 0.27832,0.157471 0.64819,0.157471 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 120.36705,90.379441 q 0.3772,-0.435791 0.9668,-0.435791 0.16479,0 0.34424,0.03296 l -0.10254,0.571289 q -0.10254,-0.01099 -0.20142,-0.01099 -0.56763,0 -0.94116,0.351563 v 2.713623 h -0.60059 V 90.0352 h 0.4541 l 0.0806,0.344238 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 123.92438,93.133348 q 0.24536,0 0.52002,-0.05493 0.27466,-0.05493 0.54931,-0.161133 l 0.18677,0.512696 q -0.26001,0.109863 -0.65918,0.183105 -0.39917,0.07324 -0.7251,0.07324 -0.86425,0 -1.34033,-0.461426 -0.47607,-0.465087 -0.47607,-1.428222 0,-0.600586 0.20874,-1.018067 0.2124,-0.421142 0.61157,-0.637207 0.39917,-0.216064 0.95947,-0.216064 0.49439,0 0.82764,0.230713 0.33325,0.227051 0.49438,0.596924 0.16114,0.366211 0.16114,0.787353 0,0.289307 -0.0806,0.578613 l -2.54883,0.01831 q 0.0806,0.494385 0.41016,0.74707 0.32959,0.249024 0.90088,0.249024 z m -0.24536,-2.633057 q -0.52002,0 -0.7837,0.300293 -0.26367,0.300293 -0.30029,0.809326 l 1.9812,-0.01831 q 0.007,-0.08789 0.007,-0.131836 0,-0.249024 -0.0916,-0.465088 -0.0915,-0.219727 -0.29663,-0.355225 -0.20141,-0.13916 -0.51635,-0.13916 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 126.85915,93.69365 q -0.57862,-0.0037 -1.20484,-0.285644 l 0.19776,-0.53833 q 0.5896,0.263672 1.00708,0.270996 0.76171,-0.01099 0.76538,-0.501709 0,-0.172119 -0.0989,-0.281982 -0.0952,-0.109864 -0.2417,-0.175782 -0.14282,-0.06592 -0.39551,-0.146484 -0.33325,-0.106201 -0.54199,-0.20874 -0.20874,-0.106202 -0.35889,-0.314942 -0.14648,-0.20874 -0.14648,-0.552978 0.011,-1.025391 1.24878,-1.025391 0.56763,0 0.98877,0.194092 l -0.20874,0.545654 q -0.42114,-0.186767 -0.78003,-0.186767 -0.65552,0.0073 -0.68115,0.472412 0,0.13916 0.0879,0.230713 0.0879,0.09155 0.21606,0.150146 0.13184,0.05493 0.36621,0.131836 0.3479,0.109863 0.56763,0.223389 0.22339,0.109863 0.38452,0.340576 0.16113,0.227051 0.16113,0.604248 0,1.054687 -1.333,1.054687 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 129.68404,90.569871 v 1.92627 q 0,0.161132 0.0696,0.314941 0.0733,0.150147 0.21973,0.249024 0.14648,0.09521 0.35523,0.09521 0.14648,0 0.33325,-0.02563 v 0.53833 q -0.23804,0.02197 -0.4834,0.02197 -0.34058,0 -0.57861,-0.146484 -0.23804,-0.146484 -0.35889,-0.391846 -0.12085,-0.249023 -0.12085,-0.549316 v -2.032471 h -0.64453 v -0.531006 h 0.64453 v -1.281738 h 0.56396 v 1.281738 h 0.98145 v 0.531006 h -0.98145 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 133.7504,93.74492 q -0.20141,-0.351563 -0.30395,-0.725098 -0.0623,0.183106 -0.2417,0.336914 -0.17944,0.153809 -0.42847,0.2417 -0.24902,0.08789 -0.50537,0.08789 -0.36255,0 -0.65185,-0.113525 -0.28565,-0.113526 -0.4541,-0.351563 -0.1648,-0.238037 -0.1648,-0.593261 0,-0.344239 0.17212,-0.596924 0.17212,-0.256348 0.48706,-0.391846 0.3186,-0.135498 0.73975,-0.135498 0.50537,0 0.96313,0.26001 v -0.373535 q 0,-0.439453 -0.20508,-0.64087 -0.20508,-0.201416 -0.60791,-0.201416 -0.15381,0 -0.44311,0.02563 -0.28565,0.02197 -0.53467,0.06226 l -0.10254,-0.600586 q 0.44678,-0.05127 0.69946,-0.07324 0.25635,-0.02197 0.42847,-0.02197 0.6665,0 1.01074,0.351563 0.34424,0.351562 0.3479,1.047363 l 0.007,1.054688 q 0.004,0.53833 0.3186,1.105957 l -0.53101,0.245361 z m -1.34399,-0.618897 q 0.28564,0 0.50171,-0.09888 0.21606,-0.09888 0.33325,-0.281983 0.12085,-0.183105 0.12085,-0.421142 v -0.03296 q -0.1831,-0.10254 -0.40649,-0.157471 -0.22339,-0.05859 -0.46509,-0.05859 -0.39185,0 -0.62622,0.13916 -0.23438,0.135498 -0.23438,0.377198 0,0.15747 0.0952,0.27832 0.0989,0.120849 0.27466,0.19043 0.17578,0.06592 0.40649,0.06592 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 135.43639,90.379441 q 0.37719,-0.435791 0.96679,-0.435791 0.1648,0 0.34424,0.03296 l -0.10254,0.571289 q -0.10254,-0.01099 -0.20141,-0.01099 -0.56763,0 -0.94117,0.351563 v 2.713623 h -0.60058 V 90.0352 h 0.4541 l 0.0806,0.344238 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 138.06354,90.569871 v 1.92627 q 0,0.161132 0.0696,0.314941 0.0732,0.150147 0.21972,0.249024 0.14649,0.09521 0.35523,0.09521 0.14648,0 0.33325,-0.02563 v 0.53833 q -0.23804,0.02197 -0.4834,0.02197 -0.34057,0 -0.57861,-0.146484 -0.23804,-0.146484 -0.35889,-0.391846 -0.12085,-0.249023 -0.12085,-0.549316 v -2.032471 h -0.64453 v -0.531006 h 0.64453 v -1.281738 h 0.56397 v 1.281738 h 0.98144 v 0.531006 h -0.98144 z" /><path style="fill:#fff;" d="m 139.86305,93.682664 q -0.18677,0 -0.30029,-0.109863 -0.10986,-0.113526 -0.10986,-0.300293 0,-0.186768 0.10986,-0.300293 0.11352,-0.113526 0.30029,-0.113526 0.18677,0 0.3003,0.113526 0.11352,0.113525 0.11352,0.300293 0,0.186767 -0.11352,0.300293 -0.11353,0.109863 -0.3003,0.109863 z" /></g><g><path style="fill:#fff;" d="m 28.880116,106.02305 -0.844117,-1.6626 h 0.344239 l 0.593261,1.19568 q 0.01099,0.0238 0.0293,0.0714 0.01831,0.0458 0.03479,0.0897 h 0.0055 q 0.01648,-0.0604 0.06775,-0.16113 l 0.620728,-1.19568 h 0.322266 l -0.866089,1.65527 v 0.97046 h -0.307617 v -0.96313 z" /><path style="fill:#fff;" d="m 31.181751,107.03196 q -0.27832,0 -0.490722,-0.11536 -0.210572,-0.11535 -0.327759,-0.32592 -0.115357,-0.21241 -0.115357,-0.4889 0,-0.28015 0.115357,-0.49438 0.117187,-0.21423 0.327759,-0.33142 0.212402,-0.11719 0.490722,-0.11719 0.272827,0 0.479737,0.11719 0.206909,0.11719 0.318603,0.33142 0.111694,0.2124 0.109863,0.49438 0,0.27832 -0.113525,0.4889 -0.111694,0.21057 -0.318604,0.32592 -0.205078,0.11536 -0.476074,0.11536 z m 0,-0.28931 q 0.172119,0 0.303955,-0.0787 0.133667,-0.0806 0.20691,-0.22522 0.07507,-0.14649 0.07873,-0.33692 -0.0037,-0.19409 -0.07873,-0.3424 -0.07507,-0.14832 -0.20691,-0.22889 -0.131836,-0.0824 -0.303955,-0.0824 -0.183105,0 -0.324096,0.0824 -0.139161,0.0824 -0.216065,0.23072 -0.07507,0.14831 -0.07507,0.34424 0,0.19043 0.07507,0.33508 0.0769,0.14465 0.216065,0.22339 0.13916,0.0787 0.324096,0.0787 z" /><path style="fill:#fff;" d="m 33.985096,107.05759 q -0.106201,-0.19043 -0.150147,-0.35888 -0.02746,0.0751 -0.106201,0.15014 -0.0769,0.0751 -0.201416,0.12635 -0.12268,0.0513 -0.280151,0.0513 -0.258179,0 -0.417481,-0.10071 -0.159301,-0.10071 -0.22705,-0.26001 -0.06775,-0.16113 -0.06775,-0.35339 v -1.10779 h 0.300293 v 1.0144 q 0,0.23987 0.09888,0.38452 0.100708,0.14466 0.379028,0.14466 0.206909,0 0.342407,-0.097 0.135498,-0.0989 0.135498,-0.32776 v -1.1206 h 0.300293 v 1.1792 q 0.0018,0.26916 0.159302,0.55297 l -0.265503,0.12268 z" /><path style="fill:#fff;" d="m 36.478992,107.0283 q -0.276489,0 -0.476074,-0.1117 -0.199585,-0.11169 -0.303955,-0.32043 -0.10437,-0.21057 -0.10437,-0.49805 0,-0.28564 0.106201,-0.49805 0.106201,-0.2124 0.31128,-0.32775 0.205078,-0.11536 0.492553,-0.11353 0.150147,-0.002 0.2948,0.0275 0.144653,0.0275 0.245361,0.0751 l -0.07324,0.30395 q -0.223388,-0.1007 -0.465088,-0.1007 -0.305786,0 -0.443115,0.15747 -0.137329,0.15564 -0.137329,0.46692 0,0.32592 0.15564,0.48523 0.15747,0.1593 0.457763,0.1593 0.122681,0 0.217896,-0.0238 0.09705,-0.0256 0.254516,-0.0842 l 0.09338,0.27832 q -0.153808,0.0586 -0.316772,0.0915 -0.162964,0.033 -0.309449,0.033 z" /><path style="fill:#fff;" d="m 38.698231,107.05759 q -0.100708,-0.17578 -0.151978,-0.36254 -0.03113,0.0916 -0.120849,0.16845 -0.08972,0.0769 -0.214234,0.12085 -0.124512,0.0439 -0.252685,0.0439 -0.181275,0 -0.325928,-0.0568 -0.142822,-0.0568 -0.227051,-0.17578 -0.0824,-0.11902 -0.0824,-0.29663 0,-0.17212 0.08606,-0.29846 0.08606,-0.12817 0.243531,-0.19592 0.159301,-0.0678 0.369873,-0.0678 0.252685,0 0.481567,0.13 v -0.18676 q 0,-0.21973 -0.102539,-0.32044 -0.102539,-0.10071 -0.303955,-0.10071 -0.0769,0 -0.221558,0.0128 -0.142822,0.011 -0.267334,0.0311 l -0.05127,-0.30029 q 0.223388,-0.0256 0.349731,-0.0366 0.128174,-0.011 0.214234,-0.011 0.333251,0 0.505371,0.17578 0.172119,0.17578 0.17395,0.52368 l 0.0037,0.52735 q 0.0018,0.26916 0.159302,0.55297 l -0.265503,0.12268 z m -0.671997,-0.30944 q 0.142822,0 0.250854,-0.0494 0.108032,-0.0494 0.166626,-0.14099 0.06043,-0.0916 0.06043,-0.21057 v -0.0165 q -0.09155,-0.0513 -0.203247,-0.0787 -0.111694,-0.0293 -0.232544,-0.0293 -0.195923,0 -0.31311,0.0696 -0.117188,0.0678 -0.117188,0.1886 0,0.0787 0.04761,0.13916 0.04944,0.0604 0.137329,0.0952 0.08789,0.033 0.203247,0.033 z" /><path style="fill:#fff;" d="m 40.216175,105.15513 q 0.234375,0 0.393677,0.0915 0.159302,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 h -0.300293 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09521,-0.14283 -0.316772,-0.14466 -0.157471,0.002 -0.296631,0.0586 -0.137329,0.0549 -0.24353,0.15564 l -0.0037,1.33117 H 39.37019 l 0.0037,-1.78344 h 0.221558 l 0.05676,0.17761 q 0.212403,-0.22522 0.563965,-0.22522 z" /><path style="fill:#fff;" d="m 42.977406,107.03196 q -0.289307,-0.002 -0.602417,-0.14282 l 0.09888,-0.26917 q 0.294799,0.13184 0.50354,0.1355 0.380859,-0.005 0.38269,-0.25085 0,-0.0861 -0.04944,-0.141 -0.04761,-0.0549 -0.12085,-0.0879 -0.07141,-0.033 -0.197754,-0.0732 -0.166626,-0.0531 -0.270996,-0.10437 -0.10437,-0.0531 -0.179443,-0.15747 -0.07324,-0.10437 -0.07324,-0.27649 0.0055,-0.51269 0.62439,-0.51269 0.283813,0 0.494385,0.097 l -0.10437,0.27283 q -0.210572,-0.0934 -0.390015,-0.0934 -0.327759,0.004 -0.340576,0.2362 0,0.0696 0.04395,0.11536 0.04395,0.0458 0.108032,0.0751 0.06592,0.0275 0.183106,0.0659 0.17395,0.0549 0.283813,0.11169 0.111695,0.0549 0.192261,0.17029 0.08057,0.11353 0.08057,0.30213 0,0.52734 -0.666503,0.52734 z" /><path style="fill:#fff;" d="m 44.954945,106.75181 q 0.12268,0 0.260009,-0.0275 0.137329,-0.0275 0.274659,-0.0806 l 0.09338,0.25634 q -0.130005,0.0549 -0.329589,0.0916 -0.199585,0.0366 -0.362549,0.0366 -0.432129,0 -0.670166,-0.23072 -0.238037,-0.23254 -0.238037,-0.71411 0,-0.30029 0.10437,-0.50903 0.106201,-0.21057 0.305786,-0.3186 0.199585,-0.10804 0.479736,-0.10804 0.247193,0 0.413819,0.11536 0.166625,0.11353 0.247192,0.29846 0.08057,0.18311 0.08057,0.39368 0,0.14465 -0.04028,0.28931 l -1.274414,0.009 q 0.04028,0.24719 0.205078,0.37354 0.164795,0.12451 0.45044,0.12451 z m -0.122681,-1.31653 q -0.26001,0 -0.391846,0.15015 -0.131836,0.15014 -0.150146,0.40466 l 0.9906,-0.009 q 0.0037,-0.0439 0.0037,-0.0659 0,-0.12452 -0.04578,-0.23255 -0.04578,-0.10986 -0.148315,-0.17761 -0.100708,-0.0696 -0.258179,-0.0696 z" /><path style="fill:#fff;" d="m 47.304188,107.05759 q -0.100708,-0.17578 -0.151978,-0.36254 -0.03113,0.0916 -0.120849,0.16845 -0.08972,0.0769 -0.214234,0.12085 -0.124511,0.0439 -0.252685,0.0439 -0.181275,0 -0.325928,-0.0568 -0.142822,-0.0568 -0.227051,-0.17578 -0.0824,-0.11902 -0.0824,-0.29663 0,-0.17212 0.08606,-0.29846 0.08606,-0.12817 0.243531,-0.19592 0.159301,-0.0678 0.369873,-0.0678 0.252685,0 0.481567,0.13 v -0.18676 q 0,-0.21973 -0.102539,-0.32044 -0.102539,-0.10071 -0.303955,-0.10071 -0.0769,0 -0.221558,0.0128 -0.142822,0.011 -0.267334,0.0311 l -0.05127,-0.30029 q 0.223388,-0.0256 0.349731,-0.0366 0.128174,-0.011 0.214234,-0.011 0.333252,0 0.505371,0.17578 0.172119,0.17578 0.17395,0.52368 l 0.0037,0.52735 q 0.0018,0.26916 0.159302,0.55297 l -0.265503,0.12268 z m -0.671997,-0.30944 q 0.142822,0 0.250854,-0.0494 0.108032,-0.0494 0.166626,-0.14099 0.06043,-0.0916 0.06043,-0.21057 v -0.0165 q -0.09155,-0.0513 -0.203247,-0.0787 -0.111694,-0.0293 -0.232544,-0.0293 -0.195923,0 -0.31311,0.0696 -0.117188,0.0678 -0.117188,0.1886 0,0.0787 0.04761,0.13916 0.04944,0.0604 0.137329,0.0952 0.08789,0.033 0.203247,0.033 z" /><path style="fill:#fff;" d="m 48.247181,105.37486 q 0.188599,-0.2179 0.483398,-0.2179 0.0824,0 0.17212,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283813,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 h 0.227051 l 0.04028,0.17212 z" /><path style="fill:#fff;" d="m 50.036121,107.0283 q -0.276489,0 -0.476074,-0.1117 -0.199585,-0.11169 -0.303955,-0.32043 -0.10437,-0.21057 -0.10437,-0.49805 0,-0.28564 0.106201,-0.49805 0.106201,-0.2124 0.311279,-0.32775 0.205079,-0.11536 0.492554,-0.11353 0.150147,-0.002 0.2948,0.0275 0.144653,0.0275 0.245361,0.0751 l -0.07324,0.30395 q -0.223389,-0.1007 -0.465088,-0.1007 -0.305786,0 -0.443115,0.15747 -0.137329,0.15564 -0.137329,0.46692 0,0.32592 0.15564,0.48523 0.15747,0.1593 0.457763,0.1593 0.122681,0 0.217896,-0.0238 0.09705,-0.0256 0.254516,-0.0842 l 0.09338,0.27832 q -0.153809,0.0586 -0.316772,0.0915 -0.162964,0.033 -0.309449,0.033 z" /><path style="fill:#fff;" d="m 51.861683,105.15513 q 0.234375,0 0.393677,0.0915 0.159301,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 h -0.300293 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09705,-0.14283 -0.316772,-0.14283 -0.157471,0 -0.296631,0.0568 -0.13916,0.0549 -0.247192,0.15381 v 1.333 h -0.300293 v -2.77771 h 0.300293 v 1.15357 q 0.210571,-0.20691 0.545654,-0.20691 z" /><path style="fill:#fff;" d="m 54.827991,104.47581 q -0.100708,0 -0.155639,0.0476 -0.0531,0.0458 -0.07324,0.13733 -0.02014,0.0897 -0.02014,0.23621 v 0.30395 l 0.437622,-0.002 v 0.26551 h -0.437622 v 1.51794 h -0.300293 v -1.51794 h -0.320434 v -0.26184 l 0.320434,-0.002 v -0.28564 q 0,-0.34424 0.115357,-0.54016 0.115356,-0.19775 0.410156,-0.19775 0.06226,0 0.234375,0.0183 l 0.0769,0.009 -0.06592,0.29297 q -0.06775,-0.007 -0.08606,-0.009 -0.08972,-0.0128 -0.135499,-0.0128 z" /><path style="fill:#fff;" d="m 56.150013,107.03196 q -0.27832,0 -0.490723,-0.11536 -0.210571,-0.11535 -0.327758,-0.32592 -0.115357,-0.21241 -0.115357,-0.4889 0,-0.28015 0.115357,-0.49438 0.117187,-0.21423 0.327758,-0.33142 0.212403,-0.11719 0.490723,-0.11719 0.272827,0 0.479736,0.11719 0.206909,0.11719 0.318604,0.33142 0.111694,0.2124 0.109863,0.49438 0,0.27832 -0.113525,0.4889 -0.111695,0.21057 -0.318604,0.32592 -0.205078,0.11536 -0.476074,0.11536 z m 0,-0.28931 q 0.172119,0 0.303955,-0.0787 0.133667,-0.0806 0.206909,-0.22522 0.07507,-0.14649 0.07874,-0.33692 -0.0037,-0.19409 -0.07874,-0.3424 -0.07507,-0.14832 -0.206909,-0.22889 -0.131836,-0.0824 -0.303955,-0.0824 -0.183105,0 -0.324097,0.0824 -0.13916,0.0824 -0.216064,0.23072 -0.07507,0.14831 -0.07507,0.34424 0,0.19043 0.07507,0.33508 0.0769,0.14465 0.216064,0.22339 0.13916,0.0787 0.324097,0.0787 z" /><path style="fill:#fff;" d="m 57.812611,105.37486 q 0.188598,-0.2179 0.483398,-0.2179 0.0824,0 0.172119,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283814,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 h 0.22705 l 0.04028,0.17212 z" /><path style="letter-spacing:0.2px;fill:#ffffff" d="m 60.451576,105.47007 v 0.96313 q 0,0.0806 0.03479,0.15748 0.03662,0.0751 0.109864,0.12451 0.07324,0.0476 0.177612,0.0476 0.07324,0 0.166626,-0.0128 v 0.26916 q -0.119019,0.011 -0.241699,0.011 -0.170288,0 -0.289307,-0.0732 -0.119019,-0.0733 -0.179443,-0.19593 -0.06043,-0.12451 -0.06043,-0.27465 v -1.01624 h -0.322266 v -0.2655 h 0.322266 v -0.64087 h 0.281982 v 0.64087 h 0.490723 v 0.2655 h -0.490723 z" /><path style="letter-spacing:-0.1px;fill:#ffffff" d="m 62.391079,105.15513 q 0.234375,0 0.393677,0.0915 0.159301,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 H 62.80307 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09705,-0.14283 -0.316772,-0.14283 -0.157471,0 -0.296631,0.0568 -0.13916,0.0549 -0.247192,0.15381 v 1.333 h -0.300293 v -2.77771 h 0.300293 v 1.15357 q 0.210571,-0.20691 0.545654,-0.20691 z" /><path style="letter-spacing:-0.1px;fill:#ffffff" d="m 64.4151,106.75181 q 0.122681,0 0.26001,-0.0275 0.137329,-0.0275 0.274658,-0.0806 l 0.09338,0.25634 q -0.130005,0.0549 -0.32959,0.0916 -0.199585,0.0366 -0.362549,0.0366 -0.432129,0 -0.670166,-0.23072 -0.238037,-0.23254 -0.238037,-0.71411 0,-0.30029 0.10437,-0.50903 0.106201,-0.21057 0.305786,-0.3186 0.199585,-0.10804 0.479737,-0.10804 0.247192,0 0.413818,0.11536 0.166626,0.11353 0.247192,0.29846 0.08057,0.18311 0.08057,0.39368 0,0.14465 -0.04028,0.28931 l -1.274414,0.009 q 0.04028,0.24719 0.205078,0.37354 0.164795,0.12451 0.450439,0.12451 z m -0.122681,-1.31653 q -0.260009,0 -0.391845,0.15015 -0.131836,0.15014 -0.150147,0.40466 l 0.990601,-0.009 q 0.0037,-0.0439 0.0037,-0.0659 0,-0.12452 -0.04578,-0.23255 -0.04578,-0.10986 -0.148316,-0.17761 -0.100708,-0.0696 -0.258179,-0.0696 z" /><path style="fill:#fff;" d="m 67.296059,106.75181 q 0.12268,0 0.260009,-0.0275 0.13733,-0.0275 0.274659,-0.0806 l 0.09338,0.25634 q -0.130004,0.0549 -0.329589,0.0916 -0.199585,0.0366 -0.362549,0.0366 -0.432129,0 -0.670166,-0.23072 -0.238037,-0.23254 -0.238037,-0.71411 0,-0.30029 0.10437,-0.50903 0.106201,-0.21057 0.305786,-0.3186 0.199585,-0.10804 0.479736,-0.10804 0.247193,0 0.413819,0.11536 0.166626,0.11353 0.247192,0.29846 0.08057,0.18311 0.08057,0.39368 0,0.14465 -0.04028,0.28931 l -1.274414,0.009 q 0.04028,0.24719 0.205078,0.37354 0.164795,0.12451 0.45044,0.12451 z m -0.122681,-1.31653 q -0.26001,0 -0.391846,0.15015 -0.131836,0.15014 -0.150146,0.40466 l 0.9906,-0.009 q 0.0037,-0.0439 0.0037,-0.0659 0,-0.12452 -0.04578,-0.23255 -0.04578,-0.10986 -0.148315,-0.17761 -0.100708,-0.0696 -0.258179,-0.0696 z" /><path style="letter-spacing:0.1px;fill:#ffffff" d="m 68.676674,105.37486 q 0.188599,-0.2179 0.483398,-0.2179 0.0824,0 0.172119,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283814,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 h 0.227051 l 0.04028,0.17212 z" /><path style="letter-spacing:0.1px;fill:#ffffff" d="m 70.080383,105.37486 q 0.188599,-0.2179 0.483399,-0.2179 0.0824,0 0.172119,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283813,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 H 70.0401 l 0.04028,0.17212 z" /><path style="fill:#fff;" d="m 72.018764,107.03196 q -0.27832,0 -0.490722,-0.11536 -0.210571,-0.11535 -0.327759,-0.32592 -0.115356,-0.21241 -0.115356,-0.4889 0,-0.28015 0.115356,-0.49438 0.117188,-0.21423 0.327759,-0.33142 0.212402,-0.11719 0.490722,-0.11719 0.272828,0 0.479737,0.11719 0.206909,0.11719 0.318603,0.33142 0.111695,0.2124 0.109864,0.49438 0,0.27832 -0.113526,0.4889 -0.111694,0.21057 -0.318603,0.32592 -0.205078,0.11536 -0.476075,0.11536 z m 0,-0.28931 q 0.17212,0 0.303956,-0.0787 0.133667,-0.0806 0.206909,-0.22522 0.07507,-0.14649 0.07873,-0.33692 -0.0037,-0.19409 -0.07873,-0.3424 -0.07507,-0.14832 -0.206909,-0.22889 -0.131836,-0.0824 -0.303956,-0.0824 -0.183105,0 -0.324096,0.0824 -0.13916,0.0824 -0.216065,0.23072 -0.07507,0.14831 -0.07507,0.34424 0,0.19043 0.07507,0.33508 0.0769,0.14465 0.216065,0.22339 0.13916,0.0787 0.324096,0.0787 z" /><path style="fill:#fff;" d="m 73.681362,105.37486 q 0.188599,-0.2179 0.483399,-0.2179 0.0824,0 0.172119,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283813,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 h 0.227051 l 0.04028,0.17212 z" /><path style="letter-spacing:0.11px;fill:#ffffff" d="m 76.655128,107.03196 q -0.27832,0 -0.490722,-0.11536 -0.210571,-0.11535 -0.327759,-0.32592 -0.115356,-0.21241 -0.115356,-0.4889 0,-0.28015 0.115356,-0.49438 0.117188,-0.21423 0.327759,-0.33142 0.212402,-0.11719 0.490722,-0.11719 0.272828,0 0.479737,0.11719 0.206909,0.11719 0.318603,0.33142 0.111695,0.2124 0.109864,0.49438 0,0.27832 -0.113526,0.4889 -0.111694,0.21057 -0.318603,0.32592 -0.205078,0.11536 -0.476075,0.11536 z m 0,-0.28931 q 0.17212,0 0.303956,-0.0787 0.133667,-0.0806 0.206909,-0.22522 0.07507,-0.14649 0.07873,-0.33692 -0.0037,-0.19409 -0.07873,-0.3424 -0.07507,-0.14832 -0.206909,-0.22889 -0.131836,-0.0824 -0.303956,-0.0824 -0.183105,0 -0.324096,0.0824 -0.13916,0.0824 -0.216065,0.23072 -0.07507,0.14831 -0.07507,0.34424 0,0.19043 0.07507,0.33508 0.07691,0.14465 0.216065,0.22339 0.13916,0.0787 0.324096,0.0787 z" /><path style="letter-spacing:0.11px;fill:#ffffff" d="m 79.002678,105.15513 q 0.234375,0 0.393677,0.0915 0.159301,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 h -0.300293 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09521,-0.14283 -0.316772,-0.14466 -0.157471,0.002 -0.296631,0.0586 -0.137329,0.0549 -0.24353,0.15564 l -0.0037,1.33117 h -0.300293 l 0.0037,-1.78344 h 0.221557 l 0.05676,0.17761 q 0.212402,-0.22522 0.563965,-0.22522 z" /><path style="fill:#fff;" d="m 80.392586,104.2103 h 0.300293 v 2.77588 h -0.300293 z" /><path style="fill:#fff;" d="m 81.456429,104.64426 q -0.08789,0 -0.146485,-0.0586 -0.05859,-0.0586 -0.05859,-0.14648 0,-0.0861 0.05859,-0.14466 0.05859,-0.0586 0.146485,-0.0586 0.08606,0 0.144653,0.0586 0.05859,0.0586 0.05859,0.14466 0,0.0879 -0.05859,0.14648 -0.05859,0.0586 -0.144653,0.0586 z m -0.15564,0.55848 h 0.300293 v 1.78344 h -0.300293 z" /><path style="fill:#fff;" d="m 83.060432,105.15513 q 0.234375,0 0.393677,0.0915 0.159302,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 h -0.300293 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09521,-0.14283 -0.316773,-0.14466 -0.15747,0.002 -0.29663,0.0586 -0.13733,0.0549 -0.243531,0.15564 l -0.0037,1.33117 h -0.300293 l 0.0037,-1.78344 h 0.221558 l 0.05676,0.17761 q 0.212402,-0.22522 0.563964,-0.22522 z" /><path style="fill:#fff;" d="m 85.184456,106.75181 q 0.122681,0 0.26001,-0.0275 0.137329,-0.0275 0.274658,-0.0806 l 0.09338,0.25634 q -0.130005,0.0549 -0.32959,0.0916 -0.199585,0.0366 -0.362549,0.0366 -0.432129,0 -0.670166,-0.23072 -0.238037,-0.23254 -0.238037,-0.71411 0,-0.30029 0.10437,-0.50903 0.106201,-0.21057 0.305786,-0.3186 0.199585,-0.10804 0.479736,-0.10804 0.247193,0 0.413819,0.11536 0.166626,0.11353 0.247192,0.29846 0.08057,0.18311 0.08057,0.39368 0,0.14465 -0.04028,0.28931 l -1.274414,0.009 q 0.04028,0.24719 0.205078,0.37354 0.164795,0.12451 0.45044,0.12451 z m -0.122681,-1.31653 q -0.26001,0 -0.391845,0.15015 -0.131836,0.15014 -0.150147,0.40466 l 0.990601,-0.009 q 0.0037,-0.0439 0.0037,-0.0659 0,-0.12452 -0.04578,-0.23255 -0.04578,-0.10986 -0.148315,-0.17761 -0.100708,-0.0696 -0.258179,-0.0696 z" /><path style="fill:#fff;" d="m 86.400276,105.62937 q -0.102539,0 -0.172119,-0.0659 -0.06958,-0.0678 -0.06958,-0.16662 0,-0.10071 0.06958,-0.16663 0.06958,-0.0677 0.172119,-0.0677 0.10437,0 0.17395,0.0677 0.06958,0.0659 0.06958,0.16663 0,0.0989 -0.06958,0.16662 -0.06958,0.0659 -0.17395,0.0659 z m 0,1.3971 q -0.102539,0 -0.172119,-0.0659 -0.06958,-0.0678 -0.06958,-0.16663 0,-0.10071 0.06958,-0.16662 0.06958,-0.0678 0.172119,-0.0678 0.10437,0 0.17395,0.0678 0.06958,0.0659 0.06958,0.16662 0,0.0989 -0.06958,0.16663 -0.06958,0.0659 -0.17395,0.0659 z" /><text x="88" y="107" style="fill:#e1e9ef;font: 3px sans-serif, Arial;">EASTER_EGG_CLICKED_LOGO_TOO_MUCH</text></g></g></svg></div>');
                    setTimeout(function () {
                        id('blue-screen-of-death').addEventListener('click', function () {
                            tn('html', 0).style.overflowY = 'unset';
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

            if ((get('layout') == 1 || get('layout') == 4) && !n(tn('sl-header', 0)) && (birthday || christmas || sinterklaas)) {
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
                if (!n(tn('sl-header', 0)) && (easter || halloween || bevrijdingsdag || newyear)) {
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
    let liveWallpaperFrame;
    let gl;
    function stopLiveWallpaper() {
        if (liveWallpaperFrame) {
            cancelAnimationFrame(liveWallpaperFrame);
            liveWallpaperFrame = null;
        }
        tryRemove(id('mod-background-live'));
    }

    function startLiveWallpaper() {
        stopLiveWallpaper();
        tn('body', 0).insertAdjacentHTML('beforeend', '<canvas id="mod-background-live"></canvas>');
        const canvas = id('mod-background-live');
        gl = canvas.getContext("webgl");
        if (!gl) return;

        // Simple vertex shader
        const vsSource = `
            attribute vec4 aVertexPosition;
            void main() {
                gl_Position = aVertexPosition;
            }
        `;

        // Fragment shader with random color noise
        const fsSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform float u_seed;

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float t = u_time * 0.5;

                // Randomize base colors based on seed
                vec3 col1 = 0.5 + 0.5 * cos(u_seed + vec3(0,2,4));
                vec3 col2 = 0.5 + 0.5 * cos(u_seed + 2.0 + vec3(0,2,4));
                vec3 col3 = 0.5 + 0.5 * cos(u_seed + 4.0 + vec3(0,2,4));

                // Create plasma/noise effect
                float v = 0.0;
                vec2 c = uv * 2.0 - 1.0;
                v += sin((c.x+t));
                v += sin((c.y+t)/2.0);
                v += sin((c.x+c.y+t)/2.0);
                c += 1.0/2.0 * vec2(sin(t/3.0), cos(t/2.0));
                v += sin(sqrt(c.x*c.x+c.y*c.y+1.0)+t);
                v = v/2.0;

                // Mix colors
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
                seed: gl.getUniformLocation(shaderProgram, 'u_seed')
            }
        };

        const buffers = initBuffers(gl);
        const seed = parseFloat(get('live_seed')) || Math.random() * 100;

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
            gl.uniform1f(programInfo.uniformLocations.seed, seed);

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
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-background-style">#mod-background{pointer-events:none;user-select:none;position:fixed;left:calc(var(--safe-area-inset-left) - ' + get('blur') + ');top:calc(var(--safe-area-inset-top) - ' + get('blur') + ');width:calc(100% - var(--safe-area-inset-left) - var(--safe-area-inset-right) - 2 * ' + get('blur') + ');height:calc(100% - var(--safe-area-inset-top) - var(--safe-area-inset-bottom) - 2 * ' + get('blur') + ');object-fit:cover;z-index:-1;}</style>');
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
                tn('html', 0).style.overflow = 'hidden';
                tn('body', 0).insertAdjacentHTML('afterbegin', '<style>#verjaardag{width:100%;height:100%;position:fixed;top:0;left:0;z-index:10000;background:var(--bg-elevated-none);text-align:center;transition:0.3s opacity ease;}#verjaardag div{top:50%;left:50%;transform:translate(-50%, -50%);position:absolute;}.bouncetext{animation:bounce 0.3s ease forwards;color:var(--action-primary-normal);}.bouncetext.small{font-size:0;animation:bouncesmall 0.5s ease forwards 0.3s;margin-top:35px;}@keyframes bouncesmall{0%{font-size:0px;}80%{font-size:29px;}100%{font-size:24px;}}@keyframes bounce{0%{font-size:0px;}80%{font-size:58px;}100%{font-size:48px;}}.verjaardagbtn{background:var(--action-primary-normal);padding:25px 40px;width:fit-content;color:var(--bg-elevated-none) !important;margin-top:50px;opacity:0;display:block;animation:2s fadein ease 0.6s forwards;font-size:16px;border-radius:16px;transition:0.3s background ease !important;}.verjaardagbtn:hover{cursor:pointer;background:var(--action-primary-strong);}@keyframes fadein{0%{opacity:0;}100%{opacity:1;}}</style><div id="verjaardag"><div><h2 class="bouncetext">' + congratstext[0] + '</h2><h2 class="bouncetext small">' + congratstext[1] + '</h2><center><a class="verjaardagbtn" id="congrats-continue">Doorgaan</a></center></div></div>');
                id('congrats-continue').addEventListener('click', function () {
                    set('lastused', year + '-' + (month + 1) + '-' + dayInt);
                    id('confetti-canvas').style.opacity = '0';
                    id('verjaardag').style.opacity = '0';
                    setTimeout(function () {
                        tryRemove(id('confetti-canvas'));
                        tryRemove(id('verjaardag'));
                        tn('html', 0).style.overflowY = 'scroll';
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

    // [GENERATION] ANDROID_START_IGNORE

    async function getFontBase64(font) {
        if (isExtension) {
            const response = await fetch(chrome.runtime.getURL('fonts/' + font + '.ttf'));
            const blob = await response.blob();
            return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
        else {
            // [GENERATION] HARDCODED_FONTS
        }
    }

    // Download image of last n grades OR download image of average of all grades
    function downloadGrades() {
        if (n(tn('sl-resultaat-item', 0))) {
            download();
        }
        else {
            modMessage('Hoeveel cijfers wil je downloaden?', 'Kies het aantal cijfers dat je wil downloaden (1-25).<div class="br"></div><input id="mod-grades-amount" type="number" min="1" max="25" step="1" onkeyup="if (this.value != \'\') { this.value = Math.floor(this.value); } if (this.value < 1 && this.value != \'\') { this.value = 1; } else if (this.value > 25) { this.value = 25; }"/>', 'Doorgaan', 'Annuleren');
            id('mod-message-action1').addEventListener('click', download);
            id('mod-message-action2').addEventListener('click', closeModMessage);
        }
        tn('sl-root', 0).removeAttribute('inert');
        async function download() {
            let number = n(tn('sl-resultaat-item', 0)) ? tn('sl-vakgemiddelde-item').length : Math.min(Math.round(parseFloat(id('mod-grades-amount').value)), tn('sl-resultaat-item').length);
            if (isNaN(number)) {
                number = 1;
            }
            // Show a loading message
            modMessage('Downloaden...', 'Somtoday Mod is bezig met het genereren van je afbeelding. Dit kan even duren...');
            // Construct HTML
            let html = '<div style="width:650px;height:120px;background:#0099ff;display:block;"><svg style="padding:40px 28px;display:inline-block;" xmlns="http://www.w3.org/2000/svg" width="250" height="40" viewBox="0 0 300 49" fill="none"><path d="M44.6819 17.3781H43.3148C41.7353 17.3781 40.4606 16.1316 40.4606 14.5871V11.9045C40.4606 10.36 39.1859 9.11355 37.6064 9.11355H32.6184C31.0389 9.11355 29.7642 7.8671 29.7642 6.32258V2.79097C29.7642 1.24645 28.4895 0 26.91 0H22.153C20.5734 0 19.2987 1.24645 19.2987 2.79097V6.32258C19.2987 7.8671 18.024 9.11355 16.4445 9.11355H11.4566C9.87706 9.11355 8.60236 10.36 8.60236 11.9045V14.5871C8.60236 16.1316 7.32766 17.3781 5.74814 17.3781H4.38107C2.80155 17.3781 1.52686 18.6245 1.52686 20.169V28.5058C1.52686 30.0503 2.80155 31.2968 4.38107 31.2968H5.72967C7.30918 31.2968 8.58388 32.5432 8.58388 34.0877V37.1768C8.58388 38.7213 9.85858 39.9677 11.4381 39.9677C13.0176 39.9677 14.2923 41.2142 14.2923 42.7587V46.209C14.2923 47.7535 15.567 49 17.1465 49H20.2132C21.7927 49 23.0674 47.7535 23.0674 46.209V41.4039C23.0674 40.609 23.7232 39.9768 24.5269 39.9768C25.3305 39.9768 25.9863 40.6181 25.9863 41.4039V46.209C25.9863 47.7535 27.261 49 28.8405 49H31.9072C33.4867 49 34.7614 47.7535 34.7614 46.209V42.7587C34.7614 41.2142 36.0361 39.9677 37.6156 39.9677C39.1951 39.9677 40.4698 38.7213 40.4698 37.1768V34.0877C40.4698 32.5432 41.7445 31.2968 43.324 31.2968H44.6726C46.2522 31.2968 47.5269 30.0503 47.5269 28.5058V20.169C47.5269 18.6245 46.2522 17.3781 44.6726 17.3781H44.6819ZM37.902 26.4465C37.006 29.3368 35.0108 31.7123 32.2859 33.1394C30.5863 34.0245 28.7297 34.4761 26.8453 34.4761C25.7184 34.4761 24.5823 34.3135 23.4738 33.9794C22.7995 33.7806 22.4208 33.0852 22.624 32.4348C22.8273 31.7755 23.5385 31.4052 24.2128 31.6039C26.522 32.2903 28.9606 32.0555 31.0943 30.9445C33.2188 29.8335 34.7799 27.9819 35.4819 25.7239C35.6851 25.0645 36.3963 24.7032 37.0706 24.8929C37.7449 25.0916 38.1236 25.7871 37.9204 26.4465H37.902Z" fill="white"/><path d="M78.6921 18.0352C77.0176 18.0352 75.7302 18.4777 75.7302 19.5882C75.7302 20.473 76.3064 20.78 77.6298 21.1412L81.6901 22.1615C86.1105 23.3533 87.4339 25.6647 87.4339 28.7616C87.4339 33.2761 83.9048 36.2917 77.8098 36.2917C73.7495 36.2917 70.5265 35.1812 68.7079 34.2963L70.0764 28.4907C72.1921 29.6013 74.9379 30.6577 77.2787 30.6577C79.1332 30.6577 80.1506 30.3056 80.1506 29.2853C80.1506 28.5359 79.2683 28.0935 77.8548 27.7323L74.0556 26.712C70.2564 25.6466 68.4019 23.5248 68.4019 20.0216C68.4019 15.4168 72.4171 12.2748 78.8722 12.2748C81.9151 12.2748 85.6693 13.1145 87.4879 13.9542L85.5883 19.8862C83.4276 18.7305 80.8618 18.0262 78.7011 18.0262L78.6921 18.0352Z" fill="white"/><path d="M90.6208 24.2833C90.6208 17.2407 95.8785 12.0581 103.027 12.0581C110.175 12.0581 115.442 17.2407 115.442 24.2833C115.442 31.3258 110.184 36.5084 103.027 36.5084C95.8695 36.5084 90.6208 31.3258 90.6208 24.2833ZM108.329 24.2833C108.329 21.2315 106.169 18.8388 103.027 18.8388C99.8848 18.8388 97.7691 21.2315 97.7691 24.2833C97.7691 27.3351 99.8848 29.7277 103.027 29.7277C106.169 29.7277 108.329 27.3351 108.329 24.2833Z" fill="white"/><path d="M127.361 14.9744C129.036 13.295 131.377 12.2296 134.339 12.2296C138.003 12.2296 140.344 13.5117 141.541 16.1753C143.179 13.8729 145.871 12.2748 149.49 12.2748C155.45 12.2748 157.881 16.8344 157.881 22.5045V27.9129C157.881 29.0686 158.106 30.0347 159.204 30.0347C159.871 30.0347 160.708 29.7728 161.455 29.4117L161.761 35.2985C160.564 35.7861 158.313 36.2736 156.198 36.2736C152.578 36.2736 150.454 34.4588 150.454 29.6735V23.7415C150.454 20.771 149.085 19.1367 146.564 19.1367C144.62 19.1367 143.296 20.3286 142.675 21.6197V35.8403H135.257V23.7054C135.257 20.78 133.979 19.1458 131.458 19.1458C129.342 19.1458 128.01 20.3827 127.352 21.71V35.8403H119.934V12.672H127.352V14.9744H127.361Z" fill="white"/><path d="M173.951 12.6721H181.946V18.4325H173.951V26.2245C173.951 28.879 174.924 29.8541 176.643 29.8541C178.363 29.8541 179.956 29.0144 181.018 28.256L183.269 33.9262C180.973 35.3437 177.921 36.2737 174.257 36.2737C169.486 36.2737 166.533 33.3483 166.533 27.7684V18.4235H162.599V12.663H166.749L167.676 6.77618H173.951V12.663V12.6721Z" fill="white"/><path d="M185.394 24.2833C185.394 17.2407 190.651 12.0581 197.8 12.0581C204.948 12.0581 210.215 17.2407 210.215 24.2833C210.215 31.3258 204.957 36.5084 197.8 36.5084C190.642 36.5084 185.394 31.3258 185.394 24.2833ZM203.102 24.2833C203.102 21.2315 200.942 18.8388 197.8 18.8388C194.658 18.8388 192.542 21.2315 192.542 24.2833C192.542 27.3351 194.658 29.7277 197.8 29.7277C200.942 29.7277 203.102 27.3351 203.102 24.2833Z" fill="white"/><path d="M241.833 35.3076C240.68 35.7951 238.475 36.2827 236.314 36.2827C233.757 36.2827 231.894 35.3979 231.056 33.1406C229.598 35.0006 227.347 36.2827 223.944 36.2827C217.669 36.2827 213.303 31.2355 213.303 24.2381C213.303 17.2407 217.678 12.2748 223.944 12.2748C226.726 12.2748 228.977 13.2499 230.525 14.6674V4.39252H237.944V27.9129C237.944 29.1047 238.205 30.0347 239.357 30.0347C239.978 30.0347 240.725 29.7728 241.563 29.4117L241.824 35.2985L241.833 35.3076ZM230.525 28.1747V20.4279C229.373 19.3625 227.743 18.7485 226.105 18.7485C222.927 18.7485 220.847 20.8703 220.847 24.2381C220.847 27.6059 222.882 29.818 226.105 29.818C227.824 29.818 229.553 29.0234 230.525 28.1747Z" fill="white"/><path d="M270.282 30.0347C271.164 30.0347 271.83 29.7728 272.532 29.4117L272.793 35.2985C271.56 35.7861 269.48 36.2737 267.275 36.2737C264.628 36.2737 262.809 35.2534 262.017 32.951C260.468 34.811 258.038 36.2285 254.95 36.2285C248.63 36.2285 244.308 31.2716 244.308 24.3103C244.308 17.349 248.639 12.2657 254.95 12.2657C257.822 12.2657 260.027 13.1506 261.486 14.7036V12.663H268.904V27.9039C268.904 29.0596 269.165 30.0257 270.273 30.0257L270.282 30.0347ZM257.074 29.809C258.704 29.809 260.342 29.1408 261.495 28.1296V20.4189C260.568 19.4889 258.803 18.7395 257.074 18.7395C253.851 18.7395 251.862 20.9064 251.862 24.3194C251.862 27.7323 253.896 29.809 257.074 29.809Z" fill="white"/><path d="M300 12.6721L290.817 35.5243C288.341 41.8174 285.865 44.6074 280.392 44.6074C278.357 44.6074 276.286 43.858 275.089 43.0544L276.151 37.3842C277.259 37.9621 278.753 38.5851 280.257 38.5851C282.111 38.5851 282.904 37.6551 283.66 36.0118L284.056 35.0367L273.766 12.6721H281.976L287.234 27.7323L292.537 12.6721H300Z" fill="white"/></svg><h3 style="float:right;color:#fff;font-family:Kanit,Tahoma,Arial,sans-serif;vertical-align:top;margin-top:35px;padding-right:30px;letter-spacing:1.5px;font-size:30px;">' + (n(tn('sl-vakgemiddelde-item', 0)) ? 'Mijn cijfers' : 'Laatste rapportcijfers') + '</h3></div><div style="width:600px;padding:40px 25px;background:#fff;height:' + (n(tn('sl-resultaat-item', 0)) ? Math.round(220 + number * 110).toString() : Math.round(280 + number * 134).toString()) + ';">';
            for (let i = 0; i < number; i++) {
                let averagePageGradeIndex = 0;
                if (!n(tn('sl-vakgemiddelde-item', i))) {
                    averagePageGradeIndex = tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer').length - 1;
                }
                html += '<div style="width:100%;border:2px solid rgb(218, 223, 227);border-radius:6px;padding:20px 30px;margin-bottom:15px;box-sizing:border-box;' + (n(tn('sl-resultaat-item', 0)) ? 'height:95px;' : '') + '">' +
                    /* Subject icon */
                    '<svg style="background:#eaedf0;padding:10px;float:left;border-radius:50%;margin-right:12px;overflow: visible;" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 20 20" display="block">' +
                    (n(tn('sl-resultaat-item', 0)) ?
                        tn('sl-vakgemiddelde-item', i).getElementsByTagName('svg')[0].innerHTML :
                        tn('sl-resultaat-item', i).getElementsByTagName('svg')[0].innerHTML
                    ) +
                    '</svg>' +
                    /* Subject name */
                    '<h3 style="font-family:KanitBold;font-size:30px;margin:0;display:block;float:left;max-width:400px;height:40px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">' +
                    (n(tn('sl-resultaat-item', 0)) ?
                        tn('sl-vakgemiddelde-item', i).getElementsByTagName('span')[0].innerHTML :
                        tn('sl-resultaat-item', i).getElementsByClassName('titel')[0].innerHTML
                    ) +
                    '</h3>' +
                    /* Subject grade */
                    '<h3 style="font-family:KanitBold;font-size:30px;margin:0;display:block;float:right;color:' +
                    (n(tn('sl-resultaat-item', 0)) ?
                        /* Vakgemiddelden (Average page) */
                        (!n(tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex]) && tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex].classList.contains('onvoldoende') ?
                            '#d32f0d' :
                            (!n(tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex]) && tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex].classList.contains('neutraal') ?
                                '#a7b3be' :
                                '#000')
                        ) :
                        /* Laatste cijfers (latest grades page) */
                        (!n(tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0]) && tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0].classList.contains('onvoldoende') ?
                            '#d32f0d' :
                            (!n(tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0]) && tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0].classList.contains('neutraal') ?
                                '#a7b3be' :
                                '#000')
                        )
                    ) + ';">' +
                    (n(tn('sl-resultaat-item', 0)) ?
                        (n(tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex]) ?
                            '' :
                            tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[averagePageGradeIndex].innerHTML
                        ) :
                        tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0].innerHTML
                    ) +
                    '</h3>' +
                    (n(tn('sl-resultaat-item', 0)) ?
                        '' :
                        /* Grade weight */
                        '<p style="font-family:Kanit;float:right;font-size:24px;color:#888;margin:5px 10px;display:block;float:right;">' +
                        tn('sl-resultaat-item', i).getElementsByClassName('weging ng-star-inserted')[0].innerHTML +
                        '</p>' +
                        /* Grade description */
                        '<p style="clear:both;font-family:Kanit;font-size:26px;height:35px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;margin:0;display:block;">' +
                        tn('sl-resultaat-item', i).getElementsByClassName('subtitel ng-star-inserted')[0].innerHTML +
                        '</p>'
                    ) +
                    '</div>';
            }
            if (n(tn('sl-resultaat-item', 0)) && !n(cn('totaalgemiddelden', 0))) {
                /* Year average */
                html += '<div style="width:100%;border:2px solid rgb(218, 223, 227);background:#f3f5f6;border-radius:6px;padding:20px 30px;margin-bottom:15px;box-sizing:border-box;height:95px;"><h3 style="font-family:KanitBold;font-size:30px;margin:0;display:block;float:left;max-width:400px;height:40px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">Totaalgemiddelden</h3><h3 style="font-family:KanitBold;font-size:30px;margin:0;display:block;float:right;">' + cn('totaalgemiddelden', 0).getElementsByClassName('cijfer')[0].innerHTML + '</h3></div>';
            }
            else if (n(tn('sl-resultaat-item', 0)) && n(tn('sl-vakgemiddelde-item', 0))) {
                html += '<h3 style="font-family:KanitBold;font-size:30px;margin:0;">Er zijn geen cijfers voor deze periode</h3>';
            }
            html += '</div>';
            // Insert canvas
            tn('body', 0).insertAdjacentHTML('beforeend', '<canvas id="mod-grade-canvas" width="650" height="' + (n(tn('sl-resultaat-item', 0)) ? Math.round(300 + number * 110).toString() : Math.round(280 + number * 134).toString()) + '" style="display:none;"></canvas>');
            const canvas = id('mod-grade-canvas');
            const ctx = canvas.getContext('2d'); !n(tn('sl-resultaat-item', 0)) || !n(tn('sl-vakgemiddelde-item', 0));
            // Use data urls for font in SVG
            const kanitregular = await getFontBase64('Kanit-ExtraLight');
            const kanitbold = await getFontBase64('Kanit-SemiBold');
            // Add SVG with HTML to the canvas
            var img = new Image();
            const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + canvas.width + '" height="' + canvas.height + '"><defs><style type="text/css">@font-face{font-family:KanitBold;src:url(\'' + kanitbold + '\')}@font-face{font-family:Kanit;src:url(\'' + kanitregular + '\')}</style></defs><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">' + html + '</div></foreignObject></svg>';
            const svgObjectUrl = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svg);
            const tempImg = new Image();
            tempImg.addEventListener('load', function () {
                ctx.drawImage(tempImg, 0, 0);
                URL.revokeObjectURL(svgObjectUrl);
                let a = document.createElement('a');
                a.href = canvas.toDataURL('image/png');
                a.download = n(tn('sl-resultaat-item', 0)) ? 'laatste-rapportcijfers.png' : 'cijfers.png';
                a.dispatchEvent(new MouseEvent('click'));
                tryRemove(id('mod-grade-canvas'));
                if (!n(id('mod-message'))) {
                    closeModMessage();
                }
            });
            tempImg.src = svgObjectUrl;
            tn('sl-root', 0).removeAttribute('inert');
        }
    }
    // [GENERATION] ANDROID_END_IGNORE

    // [GENERATION] INSERT_CHARTJS

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
                    fill: false,
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
                        // Letter value is not set, ask user to define it
                        showLetterbeoordelingenMessage(letter);
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
        if (!n(id('mod-grade-suggestions'))) {
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
                fill: false,
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
                fill: false,
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
        if (n(id('mod-grade-calculate')) && !n(tn('sl-resultaat-item', 0)) && get('bools').charAt(BOOL_INDEX.CALCULATION_TOOL) == '1') {
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
        if (!n(tn('sl-cijfer-overzicht', 0))) {
            tryRemove(id('mod-grades-download-computer'));
            tryRemove(id('mod-grades-download-mobile'));
        }
        else if ((!n(tn('sl-resultaat-item', 0)) || !n(tn('sl-vakgemiddelde-item', 0))) && n(tn('sl-vakresultaten', 0)) && get('bools').charAt(BOOL_INDEX.GRADE_DOWNLOAD_BTN) == "1") {
            if (n(id('mod-grades-download-computer')) && !n(tn('hmy-switch-group', 0))) {
                tn('hmy-switch-group', 0).insertAdjacentHTML('beforeend', '<a id="mod-grades-download-computer" class="mod-grades-download">' + getIcon('download', null, 'var(--fg-primary-normal)') + '</a>');
                id('mod-grades-download-computer').addEventListener('click', downloadGrades);
            }
            if (n(id('mod-grades-download-mobile')) && !n(cn('tabs ng-star-inserted', 0))) {
                if (document.documentElement.clientWidth > 767) {
                    cn('tabs ng-star-inserted', 0).getElementsByClassName('filler')[0].insertAdjacentHTML('beforeend', '<a id="mod-grades-download-mobile" class="mod-grades-download">' + getIcon('download', null, 'var(--fg-primary-normal)') + '</a>');
                    id('mod-grades-download-mobile').addEventListener('click', downloadGrades);
                }
                else {
                    tn('sl-scrollable-title', 0).insertAdjacentHTML('beforeend', '<a id="mod-grades-download-mobile" class="mod-grades-download">' + getIcon('download', null, 'var(--fg-primary-normal)') + '</a>');
                    id('mod-grades-download-mobile').addEventListener('click', downloadGrades);
                }
            }
        }
    }

    // Grade Defender Minigame
    function gradeDefenderGame() {
        // Setup canvas
        if (id('grade-defender-canvas')) id('grade-defender-canvas').remove();
        if (id('grade-defender-ui')) id('grade-defender-ui').remove();
        if (id('grade-defender-close')) id('grade-defender-close').remove();
        if (id('grade-defender-gameover')) id('grade-defender-gameover').remove();

        tn('body', 0).insertAdjacentHTML('beforeend', `
            <canvas id="grade-defender-canvas" class="active"></canvas>
            <div id="grade-defender-ui" class="active">Score: <span id="gd-score">0</span> | Levens: <span id="gd-lives">3</span></div>
            <div id="grade-defender-close" class="active">&times;</div>
            <div id="grade-defender-gameover">
                <h1>GAME OVER</h1>
                <h3>Je score: <span id="gd-final-score"></span></h3>
                <div id="grade-defender-restart">Opnieuw</div>
            </div>
        `);

        const canvas = id('grade-defender-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let score = 0;
        let lives = 3;
        let gameRunning = true;
        let enemies = [];
        let projectiles = [];
        let playerX = canvas.width / 2;
        let lastTime = 0;
        let spawnTimer = 0;

        // Assets
        // Using emoji/text for simplicity

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);

        // Controls
        canvas.addEventListener('mousemove', (e) => {
            playerX = e.clientX;
        });
        canvas.addEventListener('touchmove', (e) => {
            playerX = e.touches[0].clientX;
        });
        canvas.addEventListener('click', () => {
            if (gameRunning) {
                projectiles.push({ x: playerX, y: canvas.height - 60, speed: 10 });
            }
        });

        // Save scroll position before hiding overflow
        const savedScrollY = window.scrollY || document.documentElement.scrollTop;

        // Close
        id('grade-defender-close').addEventListener('click', () => {
            gameRunning = false;
            canvas.remove();
            id('grade-defender-ui').remove();
            id('grade-defender-close').remove();
            id('grade-defender-gameover').remove();
            tn('html', 0).style.overflowY = 'scroll';
            // Restore scroll position
            window.scrollTo(0, savedScrollY);
        });

        // Restart
        id('grade-defender-restart').addEventListener('click', () => {
            score = 0;
            lives = 3;
            enemies = [];
            projectiles = [];
            gameRunning = true;
            id('grade-defender-gameover').classList.remove('active');
            requestAnimationFrame(gameLoop);
        });

        tn('html', 0).style.overflowY = 'hidden';

        function gameLoop(timestamp) {
            if (!gameRunning) return;
            const dt = timestamp - lastTime;
            lastTime = timestamp;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Spawn enemies
            spawnTimer += dt;
            if (spawnTimer > 1000) { // Spawn every second
                const type = Math.random();
                let text = (Math.floor(Math.random() * 40) + 10) / 10; // 1.0 - 5.0
                let isBad = true;
                if (type > 0.8) {
                    text = (Math.floor(Math.random() * 45) + 55) / 10; // 5.5 - 10.0
                    isBad = false;
                }
                enemies.push({
                    x: Math.random() * (canvas.width - 50) + 25,
                    y: -50,
                    text: text.toFixed(1),
                    isBad: isBad,
                    speed: Math.random() * 2 + 1 + (score / 50) // Speed increases with score
                });
                spawnTimer = 0;
            }

            // Update & Draw Projectiles
            ctx.fillStyle = '#0099ff';
            for (let i = 0; i < projectiles.length; i++) {
                let p = projectiles[i];
                p.y -= p.speed;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                ctx.fill();
                if (p.y < 0) {
                    projectiles.splice(i, 1);
                    i--;
                }
            }

            // Update & Draw Enemies
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            for (let i = 0; i < enemies.length; i++) {
                let e = enemies[i];
                e.y += e.speed;

                ctx.fillStyle = e.isBad ? '#ff4444' : '#44ff44';
                ctx.fillText(e.text, e.x, e.y);

                // Collision with floor (missed)
                if (e.y > canvas.height) {
                    enemies.splice(i, 1);
                    i--;
                    if (e.isBad) {
                        lives--;
                        id('gd-lives').innerText = lives;
                        if (lives <= 0) {
                            gameRunning = false;
                            id('grade-defender-gameover').classList.add('active');
                            id('gd-final-score').innerText = score;
                        }
                    }
                }

                // Collision with projectiles
                for (let j = 0; j < projectiles.length; j++) {
                    let p = projectiles[j];
                    let dist = Math.hypot(p.x - e.x, p.y - e.y);
                    if (dist < 30) {
                        // Hit!
                        projectiles.splice(j, 1);
                        enemies.splice(i, 1);
                        i--;
                        if (e.isBad) {
                            score += 10;
                        } else {
                            score -= 20; // Hit a good grade
                        }
                        id('gd-score').innerText = score;
                        break;
                    }
                }
            }

            // Draw Player
            ctx.fillStyle = '#fff';
            ctx.fillRect(playerX - 25, canvas.height - 50, 50, 20);
            ctx.fillRect(playerX - 5, canvas.height - 70, 10, 20);

            requestAnimationFrame(gameLoop);
        }
        requestAnimationFrame(gameLoop);
    }

    // Manage calculation tool and graph on subject grades page
    function subjectGradesPage() {
        if (!n(tn('sl-vakresultaten', 0))) {
            execute([insertCalculationTool]);
            const examPage = !n(tn('sl-examenresultaten', 0));
            // Insert graphs + analyse at subject grades page when enabled (2 or more grades need to be present)
            const firstCondition = n(id('mod-grades-graphs')) && get('bools').charAt(BOOL_INDEX.SUBJECT_GRAPHS) == '1';
            const secondCondition = !n(id('mod-grades-graphs')) && ((examPage && id('mod-grades-graphs').dataset.exams == 'false') || (!examPage && id('mod-grades-graphs').dataset.exams == 'true'));
            if (firstCondition || secondCondition) {
                if (secondCondition) {
                    tryRemove(id('mod-grades-graphs'));
                }
                if (!subjectGradesPageContainsNumberGrades()) {
                    return;
                }

                tn('sl-vakresultaten', 0).insertAdjacentHTML(
                    'beforeend',
                    (get('bools').charAt(BOOL_INDEX.GRADE_ANALYSIS) == '1' ? '<h3 style="margin-top: 40px;">Cijferanalyse</h3>' +
                        '<div id="mod-grade-suggestions" style="padding: 15px; margin: 15px 0; background: var(--bg-neutral-none); border-radius: 8px; border: 1px solid var(--border-neutral-weak);">Even geduld, je cijfers worden geanalyseerd...</div>' : '') +
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
    function getAudioUrl(file) {
        // Bandwith issues almost took my site down for a month in summer 2025 when I still hosted these files myself
        // I have a bandwith limit of 100GB/month, so now I use the Chrome extension storage or Netlify for this
        if (isExtension) {
            return chrome.runtime.getURL('sounds/' + file + '.mp3');
        }
        else {
            return 'https://geweldige-geluidseffecten.netlify.app/' + file + '.mp3';
        }
    }
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
        if (!n(id('somtoday-recap')) && n(id('somtoday-recap-wrapper')) && (!n(tn('sl-vakresultaten', 0)) || id('somtoday-recap').nextElementSibling.tagName == 'HMY-SWITCH-GROUP')) {
            tryRemove(id('somtoday-recap'));
        }
        if (id('mod-recap-year')) {
            id('mod-recap-year').innerText = (tn('sl-dropdown', 0) && tn('sl-dropdown', 0).ariaLabel) ? tn('sl-dropdown', 0).ariaLabel.replace(/^[^/]+\/(\d+)/, '$1') : year;
        }
        if ((!n(tn('sl-resultaat-item', 0)) || !n(tn('sl-vakgemiddelde-item', 0)) || !n(tn('sl-cijfer-overzicht', 0))) && n(tn('sl-vakresultaten', 0)) && n(id('somtoday-recap'))) {
            try {
                music = new Audio(getAudioUrl('background'));
            }
            catch (e) {
                console.warn(e);
            }
            music.loop = true;
            const recapYear = (tn('sl-dropdown', 0) && tn('sl-dropdown', 0).ariaLabel) ? tn('sl-dropdown', 0).ariaLabel.replace(/^[^/]+\/(\d+)/, '$1') : year;
            tn('hmy-switch-group', 0).insertAdjacentHTML('afterend', '<div id="somtoday-recap"><h3>Somtoday Recap' + window.logo(null, null, '#fff', 'height:1em;width:fit-content;margin-left:10px;transform:translateY(2px);') + '</h3><p>Bekijk hier jouw jaaroverzicht van <span id="mod-recap-year">' + recapYear + '</span>.</p><div id="somtoday-recap-arrows">' + getIcon('chevron-right', null, '#fff', 'id="recap-arrow-1"') + getIcon('chevron-right', null, '#fff', 'id="recap-arrow-2"') + getIcon('chevron-right', null, '#fff', 'id="recap-arrow-3"') + '</div></div>');
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
                tn('html', 0).style.overflowY = 'hidden';
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
                        tn('html', 0).style.overflowX = 'hidden';
                        tn('html', 0).style.overflowY = 'scroll';
                        isRecapping = false;
                        if (document.fullscreenElement) {
                            document.exitFullscreen();
                        }
                        setTimeout(() => { closing = false; }, 200);
                        endMusic();
                    });
                }


                // Vertically center align page (to prevent absolute positioning from breaking drag list)
                if (!n(cn('recap-page', 0))) {
                    cn('recap-page', 0).style.marginTop = ((document.documentElement.clientHeight - cn('recap-page', 0).clientHeight) / 2) + 'px';
                }

                await new Promise(resolve => setTimeout(resolve, 1000));

                // Vertically center align page (to prevent absolute positioning from breaking drag list)
                if (!n(cn('recap-page', 0))) {
                    cn('recap-page', 0).style.marginTop = ((document.documentElement.clientHeight - cn('recap-page', 0).clientHeight) / 2) + 'px';
                }

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
                        const weging = cijfer.ariaLabel ? parseFloat(cijfer.ariaLabel.replace(/^^[\s\S]*•? ?weging ([\d.,]+)[\s\S]*?$/, '$1')) : null;
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
                html += '<div class="mod-item"><div>' + randomSubject.icon + '</div><p>' + randomSubject.name + '</p>' + getIcon('grip-vertical', null, 'var(--text-weak)') + '</div>';
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
                                    new Audio(getAudioUrl('correct')).play();
                                }
                                catch (e) {
                                    console.warn(e);
                                }
                                startConfetti();
                                setTimeout(stopConfetti, 750);
                            }
                            else {
                                try {
                                    new Audio(getAudioUrl('error')).play();
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
            // Vertically center align page (to prevent absolute positioning from breaking drag list)
            cn('recap-page', 0).style.marginTop = ((document.documentElement.clientHeight - cn('recap-page', 0).clientHeight) / 2) + 'px';
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
                    tn('html', 0).style.overflowX = 'hidden';
                    tn('html', 0).style.overflowY = 'scroll';
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
            cn('recap-page', 0).innerHTML = '<div id="award-wrapper">' + getIcon(icon, null, '#1f86f6') + '</div><h1>AWARD!</h1><h2>Je hebt het dit jaar weer geweldig gedaan.</h2><h3>Omdat ' + description + ' krijg je de ' + award + '-award.</h3><a id="recap-nextpage">Volgende</a>';
            id('recap-nextpage').addEventListener('click', closeRecapPage);
            setTimeout(function () {
                try {
                    new Audio(getAudioUrl('tada')).play();
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
                        new Audio(getAudioUrl('correct')).play();
                    }
                    catch (e) {
                        console.warn(e);
                    }
                    startConfetti();
                    setTimeout(stopConfetti, 750);
                }
                else {
                    try {
                        new Audio(getAudioUrl('error')).play();
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
                        new Audio(getAudioUrl('correct')).play();
                    }
                    catch (e) {
                        console.warn(e);
                    }
                    startConfetti();
                    setTimeout(stopConfetti, 750);
                }
                else {
                    try {
                        new Audio(getAudioUrl('error')).play();
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
    function openSettings() {
        tryRemove(id('mod-setting-panel'));
        // Check if account modal is opened
        if (!n(tn('sl-account-modal', 0))) {
            setTimeout(function () {
                // Set modsettings text
                if (!n(tn('sl-account-modal-header', 1)) && !n(tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0])) {
                    tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0].dataset.originalText = tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0].innerHTML;
                    setHTML(tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0], 'Mod-instellingen');
                }
                // Make opening modsettings multiple times work
                if (document.documentElement.clientWidth <= 767 && !n(tn('sl-account-modal', 0).getElementsByClassName('container')[0])) {
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
            if (!n(tn('sl-account-modal', 0).getElementsByClassName('content')[0]) && !n(tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0]) && !n(tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].children[0])) {
                tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].children[0].inert = true;
            }
            if (!n(tn('sl-account-modal', 0).getElementsByClassName('ng-star-inserted active')[0])) {
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
            let nicknames = '<h3>Nicknames</h3><p>Verander de naam van docenten in Somtoday. HTML is ondersteund.</p><p>Vul de docentnaam precies in als op de berichtenpagina ("Dhr. E.X. Ample"). Vul bij de afkorting de docentafkorting in die in het rooster staat als je op een les klikt (optioneel). Vul tenslotte in welke nickname je deze docent wil geven.</p><div id="nickname-wrapper">';
            let nicknameArray = parseJSON(get('nicknames'));
            if (nicknameArray == null) {
                set('nicknames', '[]');
                nicknameArray = [];
            }
            for (const nickname of nicknameArray) {
                if (nickname.length == 2 || nickname.length == 3) {
                    nicknames += '<div><input type="text" placeholder="Docentnaam" value="' + nickname[0].replaceAll('&', '&amp;').replaceAll('>', '&gt;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') + '"><input type="text" placeholder="Afkorting" value="' + (nickname[2] ? nickname[2].replaceAll('&', '&amp;').replaceAll('>', '&gt;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') : '') + '"><input type="text" placeholder="Nickname" value="' + nickname[1].replaceAll('&', '&amp;').replaceAll('>', '&gt;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') + '"></div>';
                }
            }
            let backgroundHTML = '';
            let numberOfBackgrounds = 0;
            while (!n(get('background' + numberOfBackgrounds))) {
                backgroundHTML += '<img tabindex="0" onclick="document.getElementById(\'mod-background-wrapper\').classList.add(\'mod-modified\');this.remove();" src="' + get('background' + numberOfBackgrounds) + '">';
                numberOfBackgrounds++;
            }
            nicknames += '<div><input type="text" placeholder="Docentnaam"><input type="text" placeholder="Afkorting"><input type="text" placeholder="Nickname"></div></div><div class="br"></div><div tabindex="0" class="mod-button" onclick="document.getElementById(\'nickname-wrapper\').insertAdjacentHTML(\'beforeend\', \'<div><input type=\\\'text\\\' placeholder=\\\'Docentnaam\\\'><input type=\\\'text\\\' placeholder=\\\'Afkorting\\\'><input type=\\\'text\\\' placeholder=\\\'Nickname\\\'></div>\');">Nickname toevoegen</div><div tabindex="0" class="mod-button" onclick="document.getElementById(\'nickname-wrapper\').innerHTML = \'<div><input type=\\\'text\\\' placeholder=\\\'Docentnaam\\\'><input type=\\\'text\\\' placeholder=\\\'Afkorting\\\'><input type=\\\'text\\\' placeholder=\\\'Nickname\\\'></div>\';">Reset</div>';
            const updatechecker = (!isExtension) ? '<a id="mod-update-checker" class="mod-setting-button" tabindex="0"><span>' + getIcon('globe', 'mod-update-rotate', 'var(--text-moderate)') + 'Check updates</span></a>' : '';
            const updateinfo = (!isExtension) ? '' : 'Je browser controleert automatisch op updates.';

            let settingsContent = getSettingsFile(get('settings_type'));
            let contributorContent = '';
            for (const key of Object.keys(contributors)) {
                contributorContent += '<a href="https://github.com/' + sanitizeString(key) + '/" target="_blank"><img src="' + sanitizeString(contributors[key]) + '"><p>' + sanitizeString(key) + '</p></a>';
            }

            const replacements = {
                '{{icon_floppy_disk}}': getIcon('floppy-disk', 'mod-save-shake', 'var(--text-moderate)'),
                '{{icon_rotate_left}}': getIcon('rotate-left', 'mod-reset-rotate', 'var(--text-moderate)'),
                '{{icon_circle_info}}': getIcon('circle-info', 'mod-info-wobble', 'var(--text-moderate)'),
                '{{icon_circle_exclamation}}': getIcon('circle-exclamation', 'mod-bug-scale', 'var(--text-moderate)'),
                '{{icon_upload}}': getIcon('upload', null, 'var(--fg-on-primary-weak)'),
                '{{updatechecker}}': updatechecker,
                '{{addSetting_primarycolor}}': addSetting('Primaire kleur', null, 'primarycolor', 'color', '#0067c2'),
                '{{addSetting_secondarycolor}}': addSetting('Secundaire kleur', null, 'secondarycolor', 'color', '#0067c2'),
                '{{backgroundtype_image_active}}': (n(get('backgroundtype')) || get('backgroundtype') == 'image') ? 'active' : '',
                '{{backgroundtype_slideshow_active}}': get('backgroundtype') == 'slideshow' ? 'active' : '',
                '{{backgroundtype_color_active}}': get('backgroundtype') == 'color' ? 'active' : '',
                '{{backgroundtype_live_active}}': get('backgroundtype') == 'live' ? 'active' : '',
                '{{display_bg_image}}': (n(get('backgroundtype')) || get('backgroundtype') == 'image') ? 'block' : 'none',
                '{{display_mod_filters}}': n(get('background')) ? 'display:none;' : '',
                '{{video_style}}': n(id('mod-background')) ? '' : 'filter:' + id('mod-background').style.filter + ';',
                '{{video_src}}': (get('isbackgroundvideo') && get('isbackgroundvideo') != 'false') ? get('background') : '',
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
                '{{addSetting_background}}': addSetting('Achtergrondafbeelding', 'Stel een afbeelding in voor op de achtergrond. Video\'s worden ook ondersteund.', 'background', 'file', null, 'image/*, video/*'),
                '{{display_bg_slideshow}}': get('backgroundtype') == 'slideshow' ? 'block' : 'none',
                '{{backgroundHTML}}': backgroundHTML,
                '{{display_bg_color}}': get('backgroundtype') == 'color' ? 'block' : 'none',
                '{{display_bg_live}}': get('backgroundtype') == 'live' ? 'block' : 'none',
                '{{addSetting_backgroundcolor}}': addSetting('Achtergrondkleur', null, 'backgroundcolor', 'color', darkmode ? '#20262d' : '#ffffff'),
                '{{addSetting_ui_transparency}}': addSetting('UI-transparantie', 'Verander de transparantie van de UI.', 'ui', 'range', get('ui'), 0, 100, 1, true, 'image', 'opacity'),
                '{{addSetting_ui_blur}}': addSetting('UI-blur', 'Verander de blur van de UI.', 'uiblur', 'range', get('uiblur'), 0, 100, 1, true, 'image', 'blur'),
                '{{theme_wrapper}}': '',
                '{{layout_1}}': '<div tabindex="0" class="layout-container' + (get('layout') == 1 ? ' layout-selected' : '') + '" id="layout-1"><div style="width:94%;height:19%;top:4%;left: 4%;"></div><div style="width:94%;height:68%;top:27%;left:3%;"></div><h3>Standaard</h3></div>',
                '{{layout_2}}': '<div tabindex="0" class="layout-container' + (get('layout') == 2 ? ' layout-selected' : '') + '" id="layout-2"><div style="width: 16%; height: 92%; top: 4%; left: 3%;"></div><div style="width: 75%; height: 92%; right: 3%; top: 4%;"></div><h3>Sidebar links</h3></div>',
                '{{layout_3}}': '<div tabindex="0" class="layout-container' + (get('layout') == 3 ? ' layout-selected' : '') + '" id="layout-3"><div style="width:75%;height:92%;left:3%;top:4%;"></div><div style="width:16%;height:92%;right:3%;top:4%;"></div><h3>Sidebar rechts</h3></div>',
                '{{layout_4}}': '<div tabindex="0" class="layout-container' + (get('layout') == 4 ? ' layout-selected' : '') + '" id="layout-4"><div style="width:68%;height:19%;top:4%;left:16%;"></div><div style="width: 68%;height:68%;top:27%;left: 16%;"></div><h3>Gecentreerd</h3></div>',
                '{{layout_5}}': '<div tabindex="0" class="layout-container' + (get('layout') == 5 ? ' layout-selected' : '') + '" id="layout-5"><div style="width:16%;height:92%;top:4%;left:3%;"></div><div style="width:75%;height:19%;right:3%;top:4%;"></div><div style="width:75%;height:69%;right:3%;top:27%;"></div><h3>Menu & sidebar</h3></div>',
                '{{menu_settings}}': addSetting('Laat menu altijd zien', 'Toon de bovenste menubalk altijd. Als dit uitstaat, verdwijnt deze als je naar beneden scrolt.', 'bools00', 'checkbox', true) + addSetting('Paginanaam in menu', 'Laat een tekst met de paginanaam zien in het menu.', 'bools01', 'checkbox', true) + addSetting('Verberg bericht teller', 'Verberg het tellertje dat het aantal ongelezen berichten aangeeft.', 'bools02', 'checkbox', false),
                '{{nicknames}}': nicknames,
                '{{username_wrapper}}': '<h3>Gebruikersnaam</h3><p>Verander je gebruikersnaam.</p><div id="username-wrapper"><div><input title="Echte naam" class="mod-custom-setting" id="realname" type="text" placeholder="Echte naam" value="' + (n(get('realname')) ? '' : get('realname')) + '"><input title="Nieuwe gebruikersnaam" class="mod-custom-setting" id="username" type="text" placeholder="Nieuwe gebruikersnaam" value="' + (n(get('username')) ? '' : sanitizeString(get('username'))) + '"></div></div>',
                '{{font_settings}}': `
                    <h3>Lettertype</h3>` +
                    (window.getComputedStyle(tn('span', 0)).getPropertyValue('font-family').indexOf('OpenDyslexic') == -1 ? '' : '<div class="br"></div><div class="mod-info-notice">' + getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'De instelling <b><i style="background-color:var(--bg-primary-weak);fill:var(--fg-on-primary-weak);display:inline-block;vertical-align:middle;margin:0 5px;padding:5px;border-radius:4px;"><svg width="16px" height="16px" viewBox="0 0 24 24" display="block"><path d="m10.37 19.785-1.018-3.742H4.229L3.21 19.785H0L4.96 4h3.642l4.98 15.785zm-1.73-6.538L7.623 9.591q-.096-.365-.26-.935a114 114 0 0 0-.317-1.172q-.153-.603-.25-1.043-.095.441-.269 1.097a117 117 0 0 1-.538 2.053l-1.01 3.656h3.663Zm10.89-5.731q2.163 0 3.317 1.054Q23.999 9.623 24 11.774v8.01h-2.047l-.567-1.633h-.077q-.462.644-.942 1.053t-1.105.602q-.625.194-1.52.194a3.55 3.55 0 0 1-1.71-.409q-.75-.408-1.182-1.247-.432-.85-.433-2.15 0-1.914 1.202-2.818 1.2-.914 3.604-1.01l1.865-.065v-.527q0-.946-.442-1.387-.442-.44-1.23-.44a4.9 4.9 0 0 0-1.529.247q-.75.246-1.5.623l-.97-2.215a7.8 7.8 0 0 1 1.913-.796 8.3 8.3 0 0 1 2.2-.29m1.558 6.7-1.135.042q-1.422.043-1.98.57-.547.527-.547 1.387 0 .753.394 1.075.393.312 1.028.312.942 0 1.586-.623.654-.624.654-1.775v-.989Z"></path></svg></i>Weergave > Optimaliseer voor dyslexie</b> moet uitstaan om dit te laten werken.</div><div class="br"></div><div class="br"></div>') + `
                    <div class="mod-custom-select notranslate">
                        <select id="mod-font-select" title="Selecteer een lettertype">
                            <option selected disabled hidden>
                                ${n(get('customfontname')) ? get('fontname') : get('customfontname').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')}
                            </option>
                            <option>${fonts.join('</option><option>')}</option>
                        </select>
                    </div>
                    <label tabindex="0" class="mod-file-label" for="mod-font-file" style="display:inline-block;">
                        ${getIcon('upload', null, 'var(--fg-on-primary-weak)')}
                        <p>Of upload lettertype</p>
                    </label>
                    <input id="mod-font-file" type="file" style="display:none;" accept=".otf,.ttf,.fnt">
                    <div class="example-box-wrapper">
                        <div id="font-box">
                            <h3 style="letter-spacing:normal;">Lettertype</h3>
                            <p style="letter-spacing:normal;margin-bottom:0;">Kies een lettertype voor Somtoday.</p>
                        </div>
                    </div>
                    <div class="br"></div><div class="br"></div><div class="br"></div>`,
                '{{profilepic_setting}}': addSetting('Profielafbeelding', 'Upload je eigen profielafbeelding in plaats van je schoolfoto.' + ((!n(cn('avatar', 0)) && !n(cn('avatar', 0).getElementsByClassName('foto')[0]) && cn('avatar', 0).getElementsByClassName('foto')[0].classList.contains('hidden')) ? '<div class="mod-info-notice">' + getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'De instelling <b><i style="background-color:var(--bg-primary-weak);fill:var(--fg-on-primary-weak);display:inline-block;vertical-align:middle;margin:0 5px;padding:5px;border-radius:4px;"><svg width="16px" height="16px" viewBox="0 0 24 24" display="block"><path d="m10.37 19.785-1.018-3.742H4.229L3.21 19.785H0L4.96 4h3.642l4.98 15.785zm-1.73-6.538L7.623 9.591q-.096-.365-.26-.935a114 114 0 0 0-.317-1.172q-.153-.603-.25-1.043-.095.441-.269 1.097a117 117 0 0 1-.538 2.053l-1.01 3.656h3.663Zm10.89-5.731q2.163 0 3.317 1.054Q23.999 9.623 24 11.774v8.01h-2.047l-.567-1.633h-.077q-.462.644-.942 1.053t-1.105.602q-.625.194-1.52.194a3.55 3.55 0 0 1-1.71-.409q-.75-.408-1.182-1.247-.432-.85-.433-2.15 0-1.914 1.202-2.818 1.2-.914 3.604-1.01l1.865-.065v-.527q0-.946-.442-1.387-.442-.44-1.23-.44a4.9 4.9 0 0 0-1.529.247q-.75.246-1.5.623l-.97-2.215a7.8 7.8 0 0 1 1.913-.796 8.3 8.3 0 0 1 2.2-.29m1.558 6.7-1.135.042q-1.422.043-1.98.57-.547.527-.547 1.387 0 .753.394 1.075.393.312 1.028.312.942 0 1.586-.623.654-.624.654-1.775v-.989Z"></path></svg></i>Weergave > Verberg profielfoto</b> moet uitstaan om dit te laten werken.</div>' : ''), 'profilepic', 'file', null, 'image/*', '120'),
                '{{grade_reveal_setting}}': '<div><h3>Cijfer-reveal</h3><p style="margin-right:15px;">Toon bij je cijfers een optel-animatie.</p><div id="grade-reveal-select" class="mod-multi-choice"><span' + (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) == '1' ? ' class="active"' : '') + ' tabindex="0">Alleen bij nieuwe cijfers</span><span' + (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) == '2' ? ' class="active"' : '') + ' tabindex="0">Altijd</span><span' + (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) == '0' ? ' class="active"' : '') + ' tabindex="0">Nooit</span></div></div>',
                '{{letterbeoordelingen_setting}}': '<div><h3>Letterbeoordelingen</h3><p style="margin-right:15px;">Stel in hoeveel lettercijfers (O, V, G, etc) waard zijn voor jouw school.</p><div id="mod-change-letterbeoordelingen" tabindex="0" class="mod-button">Instellen</div></div>',
                '{{extra_settings}}': addSetting('Analyse op cijferpagina', 'Laat een korte analyse zien op de cijfer-pagina van een vak.', 'bools18', 'checkbox', true) +
                    (platform == 'Android' ? '' : addSetting('Compact rooster', 'Maak je rooster compacter door lesuren in een grid te zetten. Werkt niet voor alle scholen.', 'bools03', 'checkbox', false)) +
                    addSetting('Deel debug-data', 'Verstuur bij een error anonieme informatie naar de developer om Somtoday Mod te verbeteren.', 'bools04', 'checkbox', false) +
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
                '{{browser_settings}}': (platform == 'Android' ? '' : '<h3 class="category" data-category="browser" tabindex="0">Browser</h3><div id="category-browser">' + addSetting('Titel', 'Verander de titel van Somtoday in de tabbladen van de browser.', 'title', 'text', '', 'Somtoday') + '<div class="br"></div><div class="br"></div><div class="br"></div>' + addSetting('Icoon', 'Verander het icoontje van Somtoday in de menubalk van de browser. Accepteert png, jpg/jpeg, gif, svg, ico en meer.</p>' + (platform == 'Firefox' ? '' : '<div class="mod-info-notice">' + getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'Bewegende GIF-bestanden werken alleen in Firefox.</div>') + '<p>', 'icon', 'file', null, 'image/*', '300') + '</div>'),
                '{{autologin_warning}}': get('logincredentialsincorrect') == '1' ? '<div class="mod-info-notice">' + getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'Autologin is tijdelijk uitgeschakeld.</div><div class="br"></div><div class="br"></div><div class="br"></div>' : '',
                '{{autologin_school}}': addSetting('School', 'Voer je schoolnaam in.', 'loginschool', 'text', '', ''),
                '{{autologin_name}}': addSetting('Gebruikersnaam', 'Voer je gebruikersnaam in.', 'loginname', 'text', '', ''),
                '{{autologin_pass}}': addSetting('Wachtwoord', 'Voer je wachtwoord in.', 'loginpass', 'password', '', ''),
                '{{somtoday_version}}': (n(somtodayversion) ? 'Onbekende versie' : 'Versie ' + somtodayversion) + ' van Somtoday | Versie ' + version_name + ' van Somtoday Mod',
                '{{platform}}': 'Somtoday ' + platform,
                '{{contributors_list}}': contributorContent,
                '{{updateinfo}}': updateinfo,
                '{{export_import_buttons}}': (platform == 'Android' ? '' : '<div id="export-settings" class="mod-button">Exporteer Mod-instellingen</div><div id="import-settings" class="mod-button">Importeer Mod-instellingen</div><input type="file" id="import-settings-json" class="hidden" accept="application/json">')
            };


            for (const key in replacements) {
                settingsContent = settingsContent.replaceAll(key, replacements[key]);
            }

            tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].insertAdjacentHTML('beforeend', settingsContent);
            if (platform != 'Android') {
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
            if (!n(id('mod-font-file'))) {
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
            // Add themes
            // Background images thanks to Pexels: https://www.pexels.com
            addTheme('Standaard', '', '0067c2', 'e69b22', 20, false);
            addTheme('Bergen', '618833', '3b4117', '3b4117', 40, false);
            addTheme('Eiland', '994605', '2a83b1', '2a83b1', 25, false);
            addTheme('Zee', '756856', '173559', '173559', 25, false);
            addTheme('Bergmeer', '1284296', '4a6a2f', '4a6a2f', 30, false);
            addTheme('Rivieruitzicht', '822528', '526949', '526949', 40, false);
            addTheme('Ruimte', '110854', '0d0047', '0d0047', 50, true);
            addTheme('Bergen en ruimte', '1624504', '6489a0', '6489a0', 50, true);
            addTheme('Stad', '2246476', '18202d', '18202d', 25, true);
            addTheme('Weg', '1820563', 'de3c22', 'de3c22', 65, true);
            const isbackgroundvideo = get('isbackgroundvideo') && get('isbackgroundvideo') != 'false';
            id('mod-background-preview-image').style.setProperty('filter', getBackgroundFilters(false));
            id('mod-background-preview-video').style.setProperty('filter', getBackgroundFilters(false));
            id('mod-background-preview-image').style.display = !isbackgroundvideo ? 'block' : 'none';
            id('mod-background-preview-video').style.display = isbackgroundvideo ? 'block' : 'none';
            id('addbackground').addEventListener('input', function () {
                const files = this.files;
                for (var i = 0; i < files.length; i++) {
                    if (this.accept != 'image/*' || files[i]['type'].indexOf('image') != -1) {
                        let reader = new FileReader();
                        reader.readAsDataURL(this.files[i]);
                        reader.onload = function () {
                            id('mod-background-wrapper').classList.add('mod-modified');
                            id('mod-background-wrapper').insertAdjacentHTML('afterbegin', '<img tabindex="0" onclick="document.getElementById(\'mod-background-wrapper\').classList.add(\'mod-modified\');this.remove();" src="' + reader.result + '" />');
                        };
                    }
                }
            });
            for (const element of cn('mod-multi-choice')) {
                for (const child of element.children) {
                    child.addEventListener('click', function () {
                        this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                        this.classList.add('active');
                    });
                }
            }
            for (const element of cn('mod-slider')) {
                element.getElementsByTagName('input')[0].addEventListener('input', function () {
                    this.classList.add('mod-modified');
                    this.parentElement.children[2].innerHTML = this.value + this.dataset.unit;
                    id('mod-background-preview-image').style.setProperty('filter', getBackgroundFilters(false));
                    id('mod-background-preview-video').style.setProperty('filter', getBackgroundFilters(false));
                });
            }
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
            id('type-image').addEventListener('click', function () {
                this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                this.classList.add('active');
                show(id('mod-bg-image'));
                hide(id('mod-bg-slideshow'));
                hide(id('mod-bg-color'));
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
            // Make section collapsing work
            let number = 0;
            if (n(get('category'))) {
                set('category', '111111111');
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
            // Drag and drop
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
                                element.nextElementSibling.files = fileList;
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
                                element.nextElementSibling.files = fileList;
                            }
                        });
                    }
                    let inputEvent = new Event('input', {
                        bubbles: false,
                    });
                    element.nextElementSibling.dispatchEvent(inputEvent);
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
            id('save').addEventListener('click', function () {
                execute([save]);
            });
            id('reset').addEventListener('click', function () {
                modMessage('Alles resetten?', 'Al je instellingen zullen worden gereset. Weet je zeker dat je door wil gaan?', 'Ja', 'Nee');
                id('mod-message-action1').addEventListener('click', function () {
                    execute([reset, setBackground, style, pageUpdate]);
                    if (!n(id('mod-grades-graphs')) && get('bools').charAt(BOOL_INDEX.SUBJECT_GRAPHS) == '1' && !n(tn('sl-vakresultaten', 0))) {
                        tryRemove(id('mod-grades-graphs'));
                        tn('sl-vakresultaten', 0).insertAdjacentHTML('beforeend', '<div id="mod-grades-graphs"><h3>Mijn cijfers</h3><div><canvas id="mod-chart-1"></canvas></div><h3>Mijn gemiddelde</h3><div><canvas id="mod-chart-2"></canvas></div></div>');
                        setTimeout(gradeGraphs, 500);
                    }
                    closeModMessage();
                });
                id('mod-message-action2').addEventListener('click', closeModMessage);
            });
            if (!isExtension) {
                id('mod-update-checker').addEventListener('click', function () { execute([checkUpdate]) });
            }
            id('mod-play-defender').addEventListener('click', function () {
                tn('sl-root', 0).inert = false;
                setTimeout(gradeDefenderGame, 200);
            });
            // Make random background button work
            // Random background images thanks to Lorem Picsum: https://picsum.photos
            id('mod-random-background').addEventListener('click', function () {
                id('mod-random-background').classList.toggle('mod-active');
                if (!n(id('mod-random-background').previousElementSibling)) {
                    if (id('mod-random-background').previousElementSibling.classList.contains('mod-active')) {
                        id('mod-random-background').previousElementSibling.classList.remove('mod-active');
                    }
                    if ((((!n(id('mod-random-background').previousElementSibling)) && !n(id('mod-random-background').previousElementSibling.previousElementSibling)) && !n(id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('label')[0])) && id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].classList.contains('mod-active')) {
                        id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].classList.remove('mod-active');
                        setHTML(id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].children[1], 'Kies een bestand');
                        id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('input')[0].value = null;
                    }
                }
            });
            // Live Wallpaper Randomize
            id('mod-live-randomize').addEventListener('click', function () {
                set('live_seed', Math.random() * 100);
                startLiveWallpaper();
            });
            // Add script to make the font select element work
            if (!n(id('mod-font-select-script'))) {
                tryRemove(id('mod-font-select-script'));
            }
            if (id('mod-change-letterbeoordelingen')) {
                id('mod-change-letterbeoordelingen').addEventListener('click', function () {
                    showLetterbeoordelingenMessage();
                });
            }
            id('somtoday-mod').insertAdjacentHTML('beforeend', '<style id="mod-font-select-script" onload=\'let x, i, j, l, ll, selElmnt, a, b, c; x = document.getElementsByClassName("mod-custom-select"); l = x.length; for (i = 0; i < l; i++) { selElmnt = x[i].getElementsByTagName("select")[0]; ll = selElmnt.length; a = document.createElement("DIV"); a.setAttribute("class", "select-selected"); a.setAttribute("tabindex", "0"); a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML; x[i].appendChild(a); b = document.createElement("DIV"); b.setAttribute("class", "select-items select-hide"); for (j = 1; j < ll; j++) { c = document.createElement("DIV"); c.innerHTML = selElmnt.options[j].innerHTML; c.setAttribute("tabindex", "0"); c.style.setProperty("font-family", "\\"" + selElmnt.options[j].innerHTML + "\\", sans-serif", "important"); c.addEventListener("click", function(e) { let y, i, k, s, h, sl, yl; s = this.parentNode.parentNode.getElementsByTagName("select")[0]; sl = s.length; h = this.parentNode.previousSibling; for (i = 0; i < sl; i++) { if (this.style.fontFamily.indexOf(s.options[i].innerHTML + ",") != -1 || this.style.fontFamily.indexOf(s.options[i].innerHTML + "\\",") != -1) { s.selectedIndex = i; h.innerHTML = this.innerHTML; y = this.parentNode.getElementsByClassName("same-as-selected"); yl = y.length; for (k = 0; k < yl; k++) { y[k].removeAttribute("class"); } this.setAttribute("class", "same-as-selected"); break; } } h.click(); document.getElementById("mod-font-select").classList.add("mod-modified"); if (document.getElementById("mod-font-preview")) { document.getElementById("mod-font-preview").remove(); } document.getElementById("mod-font-file").value = ""; let event = new Event("input", { bubbles: false }); document.getElementById("mod-font-file").dispatchEvent(event); document.getElementById("font-box").children[0].style.setProperty("font-family", "\\"" + document.getElementById("mod-font-select").value + "\\", sans-serif", "important"); document.getElementById("font-box").children[1].style.setProperty("font-family", "\\"" + document.getElementById("mod-font-select").value + "\\", sans-serif", "important"); document.getElementsByClassName("select-selected")[0].style.setProperty("font-family", "\\"" + document.getElementById("mod-font-select").value + "\\", sans-serif", "important"); }); b.appendChild(c); } x[i].appendChild(b); a.addEventListener("click", function(e) { e.stopPropagation(); closeAllSelect(this); this.nextSibling.classList.toggle("select-hide"); this.classList.toggle("select-arrow-active"); }); } function closeAllSelect(elmnt) { let x, y, i, xl, yl, arrNo = []; x = document.getElementsByClassName("select-items"); y = document.getElementsByClassName("select-selected"); xl = x.length; yl = y.length; for (i = 0; i < yl; i++) { if (elmnt == y[i]) { arrNo.push(i) } else { y[i].classList.remove("select-arrow-active"); } } for (i = 0; i < xl; i++) { if (arrNo.indexOf(i)) { x[i].classList.add("select-hide"); } } } document.addEventListener("click", closeAllSelect, {passive: true});\'></style>');
            // Add event listeners to make file reset buttons work
            for (const element of cn('mod-file-reset')) {
                element.addEventListener('click', function () {
                    element.classList.toggle('mod-active');
                    if (element.dataset.key == 'background') {
                        if (!n(id('mod-random-background'))) {
                            if (id('mod-random-background').classList.contains('mod-active')) {
                                id('mod-random-background').classList.remove('mod-active');
                            }
                        }
                    }
                    if (!n(element.previousElementSibling)) {
                        if (!n(element.previousElementSibling.getElementsByTagName('label')[0])) {
                            if (element.previousElementSibling.getElementsByTagName('label')[0].classList.contains('mod-active')) {
                                element.previousElementSibling.getElementsByTagName('label')[0].classList.remove('mod-active');
                                setHTML(element.previousElementSibling.getElementsByTagName('label')[0].children[1], 'Kies een bestand');
                                element.previousElementSibling.getElementsByTagName('input')[0].value = null;
                            }
                        }
                    }
                });
            }
        }
    }

    const settingFileCache = {};
    function getSettingsFile(type) {
        // Set default settings type
        if (n(type)) {
            type = 'familiar';
        }

        // Extensions fetch setting content from easy to edit HTML file
        // Other platforms can't do this, so during the generation process it's automatically hardcoded here
        // Currently, only type 'familiar' is supported
        if (isExtension) {
            // On Firefox, chrome.runtime.getURL takes a few ms to load, in which the scrollHeight becomes 0
            // This causes the scroll position to be lost, so we cache the results to prevent this behaviour
            if (settingFileCache[type]) {
                return settingFileCache[type];
            }

            let url = chrome.runtime.getURL('settings_content/' + type + '.html');

            let xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send(null);

            if (xhr.status === 200) {
                settingFileCache[type] = xhr.responseText;
                return xhr.responseText;
            } else {
                return '';
            }
        }
        else {
            // [GENERATION] HARDCODED_SETTINGS
        }
    }

    // Close modsettings
    function closeSettings(element) {
        id('mod-setting-button').classList.remove('active');
        tryRemove(id('mod-setting-panel'));
        if (!n(tn('sl-account-modal', 0))) {
            if (!n(tn('sl-account-modal-header', 1)) && !n(tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0])) {
                tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0].dataset.originalText;
            }
            tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0].innerHTML = element.getElementsByTagName('span')[0].innerHTML;
            if (!n(tn('sl-account-modal', 0).getElementsByClassName('content')[0])) {
                if (!n(tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0])) {
                    if (!n(tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].children[0])) {
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
        if (!n(id('mod-font-file')) && id('mod-font-file').files[0]) {
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
        else if (!n(id('mod-font-select')) && id('mod-font-select').classList.contains('mod-modified')) {
            set('customfont', '');
            set('customfontname', '');
            set('fontname', id('mod-font-select').value);
        }
        for (const element of cn('mod-custom-setting')) {
            if (element.type == 'checkbox' && element.id.indexOf('bools') != -1) {
                set('bools', get('bools').replaceAt(parseInt(element.id.charAt(5) + element.id.charAt(6)), element.checked ? '1' : '0'));
            } else if (element.type == 'checkbox' || element.type == 'range' || element.type == 'text' || element.type == 'password' || element.type == 'number' || element.type == 'color') {
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
            if (id('mod-background-wrapper').classList.contains('mod-modified')) {
                await removeSlideshowBackgrounds();
                let i = 0;
                for (const element of id('mod-background-wrapper').getElementsByTagName('img')) {
                    await saveSlideshowBackground(element, i);
                    i++;
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
        const selectedtheme = cn('theme-selected', 0);
        if (!n(selectedtheme)) {
            if (id('primarycolor').classList.contains('mod-modified') == false) {
                set('primarycolor', '#' + selectedtheme.dataset.color);
            }
            if (id('secondarycolor').classList.contains('mod-modified') == false) {
                set('secondarycolor', '#' + selectedtheme.dataset.secondaryColor);
            }
            set('theme', selectedtheme.dataset.name);
            if (selectedtheme.id != 'Standaard') {
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
        if (!n(cn('layout-selected', 0))) {
            set('layout', parseInt(cn('layout-selected', 0).id.charAt(7)));
        }
        if (!n(id('mod-random-background'))) {
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
        if (!n(id('grade-reveal-select'))) {
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
            if (get('bools').charAt(BOOL_INDEX.SUBJECT_GRAPHS) == '1' && !n(tn('sl-vakresultaten', 0))) {
                tn('sl-vakresultaten', 0).insertAdjacentHTML('beforeend', '<div id="mod-grades-graphs"><h3>Mijn cijfers</h3><div><canvas id="mod-chart-1"></canvas></div><h3>Mijn gemiddelde</h3><div><canvas id="mod-chart-2"></canvas></div></div>');
                setTimeout(gradeGraphs, 500);
            }
            if (!n(tn('sl-modal', 0))) {
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
        set('ui', 0);
        set('uiblur', 0);
        set('fontname', 'Open Sans');
        set('theme', 'Standaard');
        set('layout', 1);
        set('profilepic', '');
        set('username', '');
        set('loginschool', '');
        set('loginname', '');
        set('loginpass', '');
        set('letterbeoordelingen', '');
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
        set('customfont', '');
        set('customfontname', '');
        menuWidth = 110;
        set('isbackgroundvideo', false);
        let i = 0;
        while (!n(get('background' + i))) {
            set('background' + i, '');
            i++;
        }
        if (!n(tn('sl-account-modal', 0))) {
            execute([openSettings, profilePicture]);
        }
    }

    // Check if user is new. If so, save some values and display a welcome message.
    function checkNewUser() {
        if (n(get('firstused'))) {
            set('birthday', '00-00-0000');
            set('lastjubileum', 0);
            execute([reset]);
            tn('head', 0).insertAdjacentHTML('afterbegin', '<style>#mod-welcome{background:#0005;position:fixed;top:0;left:0;width:100%;height:100%;z-index:1000;transition:opacity 0.3s ease;}#mod-welcome > div{width:355px;transform:translate(-50%, -50%);top:50%;position:absolute;left:50%;background: var(--bg-elevated-none);border-radius:16px;overflow:hidden;overflow-y:scroll;max-width:calc(100% - 30px);max-height:calc(100% - 30px);}#mod-welcome > div > div:first-child{background:#09f;height:130px;display:flex;justify-content:center;align-items:center}#mod-welcome svg{width:70px;height:35%;transition:transform .3s ease;cursor:pointer;}#mod-welcome > div > div:last-child{padding:15px 20px;}#mod-welcome h2{font-weight:400;}#mod-welcome input[type=checkbox]{width:20px;display:inline-block;height:20px;}#mod-welcome label{user-select:none;vertical-align:top;display:inline-block;padding-left:10px;margin-bottom:25px;font-size:14px;max-width:calc(100% - 35px);}div:hover > svg .glasses{animation:1s glasses linear forwards;}@keyframes glasses{0%{transform:translateY(-60px);opacity:0;}50%{transform:translateY(-30px);opacity:1;}100%{transform:translateY(0px);opacity:1;}}@media (min-width: 370px) and (min-height:700px){#mod-welcome > div{overflow-y:hidden;}#mod-welcome > div > div:first-child{height:200px;}#mod-welcome > div > div:last-child{padding:30px;}}</style>');
            const welcomecontent = platform == 'Android' ? '<h2>Welkom!</h2><p>Je hebt net de Somtoday Mod Android APK geïnstalleerd. Met deze app kun je alles wat je ook in de normale Somtoday app kan, plus nog veel meer doordat Somtoday Mod erbij zit.</p><p>Voordat je doorgaat, deze app is niet geaffilieerd met Somtoday. Gebruik is op eigen risico. Zorg ervoor dat je regelmatig op updates checkt om de app up to date te houden.</p>' : '<h2>Somtoday Mod is ge&iuml;nstalleerd!</h2><p>Stel achtergronden in, krijg inzicht in je cijfers en meer met Somtoday Mod!</p><p>' + (hasSettingsHash ? 'Laten we meteen beginnen!' : 'Meteen naar de instellingen gaan?') + '</p>';
            id('somtoday-mod').insertAdjacentHTML('afterbegin', '<div id="mod-welcome"><div><div>' + window.logo('mod-welcome-logo', null, '#fff') + '</div><div>' + welcomecontent + '<br><input type="checkbox" id="errordata"><label for="errordata">Verstuur error-data om bugs te fixen</label>' + (hasSettingsHash ? '' : '<div tabindex="0" class="mod-button" id="mod-welcome-open-settings">Instellingen</div>') + '<div tabindex="0" class="mod-button" id="mod-welcome-close">Sluiten</div></div></div></div>');
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
        let code = '<div><h3>' + name + '</h3>' + ((n(description) || type == 'checkbox') ? '' : '<p>' + description + '</p>');
        if (type == 'checkbox') {
            if (key.startsWith('bools')) {
                code += '<label tabindex="0" class="switch" for="' + key + '"><input title="' + name + '" class="mod-custom-setting" type="checkbox" ' + (get('bools').charAt(parseInt(key.charAt(5) + key.charAt(6))) == '1' ? 'checked' : '') + ' oninput="this.classList.add(\'mod-modified\');" id="' + key + '"/><div class="slider round"></div></label>';
            } else {
                code += '<label tabindex="0" class="switch" for="' + key + '"><input title="' + name + '" class="mod-custom-setting" type="checkbox" ' + (get(key) ? 'checked' : '') + ' oninput="this.classList.add(\'mod-modified\');" id="' + key + '"/><div class="slider round"></div></label>';
            }
            code += (n(description) ? '' : '<p>' + description + '</p>') + '</div>';
        } else if (type == 'range') {
            code += '<div class="mod-range-preview">' + getIcon(param5, null, 'var(--fg-on-primary-weak)', 'style="' + (param6 == 'opacity' ? 'opacity:' + parseFloat((100 - (param4 != null ? value : get(key))) / 100).toString() : 'filter:' + param6 + '(' + parseFloat((param4 != null ? value : get(key)) / 4).toString() + 'px)') + '"') + '</div><input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="range" value="' + (param4 != null ? value : get(key)) + '" min="' + param1 + '" max="' + param2 + '" step="' + param3 + '" oninput="this.classList.add(\'mod-modified\');this.parentElement.children[4].innerHTML=this.value;this.parentElement.getElementsByClassName(\'mod-range-preview\')[0].children[0].setAttribute(\'style\', \'' + (param6 == 'opacity' ? 'opacity:\'+parseFloat((100 - this.value) / 100).toString()+\'' : 'filter:' + param6 + '(\'+parseFloat(this.value / 4).toString()+\'px)') + '\');"/><p>' + (param4 != null ? value : get(key)) + '</p><p>%</p></div>';
        } else if (type == 'text' || type == 'password') {
            code += '<input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="' + type + '" placeholder="' + param1 + '" value="' + get(key).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') + '"/></div>';
        } else if (type == 'number') {
            code += '<div class="br"></div><input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="number" placeholder="' + param1 + '" value="' + get(key) + '"/></div>';
        } else if (type == 'color') {
            code += '<div class="br"></div><div class="br"></div><label tabindex="0" class="mod-color" for="' + key + '" style="background: ' + (n(get(key)) ? value : get(key)) + '"><p>Kies een kleur</p></label><input class="mod-color-textinput" title="Voer een hex kleurencode in" value="' + get(key) + '" oninput="if (/^#?([a-fA-F0-9]{6})$/.test(this.value)) { this.parentElement.children[5].value = this.value; this.style.color = \'var(--fg-on-primary-weak)\'; this.parentElement.children[3].style.background = this.value; } else if (/^#?([a-fA-F0-9]{3})$/.test(this.value)) { const sixDigitCode = \'#\' + this.value.charAt(1) + this.value.charAt(1) + this.value.charAt(2) + this.value.charAt(2) + this.value.charAt(3) + this.value.charAt(3); this.parentElement.children[5].value = sixDigitCode; this.style.color = \'var(--fg-on-primary-weak)\'; this.parentElement.children[3].style.background = sixDigitCode; } else { this.style.color = \'darkred\'; }"/><input title="' + name + '" class="mod-custom-setting" value="' + get(key) + '" id="' + key + '" oninput="this.classList.add(\'mod-modified\');this.parentElement.children[3].style.background = this.value; this.parentElement.children[4].value = this.value; this.parentElement.children[4].style.color = \'var(--fg-on-primary-weak)\';" type="color"/></div>';
        } else if (type == 'file') {
            code += '<label tabindex="0" class="mod-file-label" for="' + key + '">' + getIcon('upload', null, 'var(--fg-on-primary-weak)') + '<p>Kies een bestand</p></label><input' + (n(param2) ? '' : ' title="' + name + '" data-size="' + param2 + '"') + ' oninput="this.parentElement.getElementsByTagName(\'label\')[0].classList.remove(\'mod-active\'); if (this.files.length != 0) { const name = this.files[0].name.toLowerCase(); if ((this.accept == \'image/*\' && this.files[0][\'type\'].indexOf(\'image\') != -1) || (this.accept == \'image/*, video/*\' && (this.files[0][\'type\'].indexOf(\'image\') != -1 || this.files[0][\'type\'].indexOf(\'video\') != -1)) || (this.accept != \'image/*, video/*\') && this.accept != \'image/*\') { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = name; this.parentElement.getElementsByTagName(\'label\')[0].classList.add(\'mod-active\'); this.parentElement.nextElementSibling.classList.remove(\'mod-active\'); this.parentElement.nextElementSibling.nextElementSibling.classList.remove(\'mod-active\'); } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; this.value = null; } } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; }" class="mod-file-input mod-custom-setting" type="file" accept="' + param1 + '" id="' + key + '"/></div><div tabindex="0" class="mod-button mod-file-reset" data-key="' + key + '">Reset</div>';
        }
        return code;
    }

    // Add a theme to the modsettings. Can only be called at the modsettings page.
    function addTheme(name, url, primaryColor, secondaryColor, transparency) {
        // URL can be a URL to an image, but also a Pexels ID.
        let smallimg = url;
        let bigimg = url;
        if (!isNaN(parseInt(url))) {
            smallimg = 'https://images.pexels.com/photos/' + url + '/pexels-photo-' + url + '.jpeg?auto=compress&cs=tinysrgb&w=250';
            bigimg = 'https://images.pexels.com/photos/' + url + '/pexels-photo-' + url + '.jpeg?auto=compress&cs=tinysrgb&w=1600';
        }
        let themeclass = '';
        if (get('theme') == name) {
            if (get('primarycolor') == '#' + primaryColor) {
                themeclass = ' theme-selected-set';
            } else {
                set('theme', '');
            }
        }
        // Set empty image as theme background if no url is given
        if (url == '') {
            smallimg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        }
        id('theme-wrapper').insertAdjacentHTML('beforeend', '<div tabindex="0" class="theme' + themeclass + '" id="' + name + '" data-name="' + name + '" data-url="' + bigimg + '" data-color="' + primaryColor + '" data-secondary-color="' + secondaryColor + '" data-transparency="' + transparency + '"><img src="' + smallimg + '" alt="Achtergrondafbeelding: ' + name + '" loading="lazy"/><h3><div style="background:#' + primaryColor + ';" title="#' + primaryColor + '"></div>' + name + '</h3></div>');
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
        if (!n(tn('sl-account-modal', 0)) && !n(tn('sl-account-modal', 0).getElementsByTagName('sl-account-modal-tab')[0]) && n(id('mod-setting-button'))) {
            let modbtn = tn('sl-account-modal', 0).getElementsByTagName('sl-account-modal-tab')[tn('sl-account-modal', 0).getElementsByTagName('sl-account-modal-tab').length - 1].cloneNode(true);
            modbtn.id = 'mod-setting-button';
            modbtn.addEventListener('click', openSettings);
            modbtn.getElementsByTagName('span')[0].innerHTML = 'Mod-instellingen';
            modbtn.getElementsByTagName('i')[0].style.background = darkmode ? '#603d20' : '#ffefe3';
            modbtn.getElementsByTagName('i')[0].style.paddingBottom = '2px';
            modbtn.getElementsByTagName('i')[0].innerHTML = getIcon('gear', null, '#ea9418', 'style="width:16px;height:16px;"');
            tn('sl-account-modal', 0).getElementsByTagName('nav')[0].appendChild(modbtn);
            for (const element of tn('sl-account-modal-tab')) {
                if (element.id != 'mod-setting-button') {
                    element.addEventListener('click', function () { closeSettings(element) });
                }
            }
            setTimeout(function () {
                // Save username and birthday
                if (!n(cn('data-container', 1)) && !n(cn('data-container', 1).getElementsByClassName('ng-star-inserted')[0]) && n(get('realname'))) {
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
        else if (!n(id('mod-setting-button'))) {
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