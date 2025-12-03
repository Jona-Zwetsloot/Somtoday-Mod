// ERROR CHECKS
const fonts = ['Abhaya Libre', 'Aleo', 'Archivo', 'Assistant', 'B612', 'Bebas Neue', 'Black Ops One', 'Brawler', 'Cabin', 'Caladea', 'Cardo', 'Chivo', 'Comic Sans MS', 'Crimson Text', 'DM Serif Text', 'Enriqueta', 'Fira Sans', 'Frank Ruhl Libre', 'Gabarito', 'Gelasio', 'Grenze Gotisch', 'IBM Plex Sans', 'Inconsolata', 'Inter', 'Josefin Sans', 'Kanit', 'Karla', 'Lato', 'Libre Baskerville', 'Libre Franklin', 'Lora', 'Merriweather', 'Montserrat', 'Neuton', 'Noto Serif', 'Nunito', 'Open Sans', 'OpenDyslexic2', 'Oswald', 'papyrus', 'Permanent Marker', 'Pixelify Sans', 'Playfair Display', 'Poetsen One', 'Poppins', 'PT Sans', 'PT Serif', 'Quicksand', 'Raleway', 'Roboto', 'Roboto Slab', 'Rubik', 'Rubik Doodle Shadow', 'Sedan SC', 'Shadows Into Light', 'Single Day', 'Source Sans 3', 'Source Serif 4', 'Spectral', 'Titillium Web', 'Ubuntu', 'Work Sans'];
let today = new Date();
let dayInt = today.getDate();
let month = today.getMonth();
let year = today.getFullYear();
let filesProcessed;
let darkmode = tn('html', 0).classList.contains('dark');
let username;
let realname;
let busy = false;
let isRecapping = false;
let ignoreRecapConditions = false;
if (!n(tn('sl-root', 0))) {
    somtodayversion = tn('sl-root', 0).getAttribute('ng-version');
}
let menuColor;
let highLightColor;
let menuWidth = n(get('menuwidth')) ? 110 : get('menuwidth');

// List of all Google Fonts to be loaded
let fontUrl = 'https://fonts.googleapis.com/css2';
let first = true;
for (const font of fonts) {
    if (font != 'Comic Sans MS' && font != 'papyrus' && font != 'OpenDyslexic2' && font != 'Open Sans') {
        if (first) {
            first = false;
            fontUrl += '?family=' + font.replaceAll(' ', '+');
        }
        else {
            fontUrl += '&family=' + font;
        }
    }
}
fontUrl += '&display=swap';

const mathQuestions = ['compose the formula of f\'x() where f(x) = 2 * sin(9x + 3)', 'rewrite 2 * log3(243) + 28 to the form of log(a)', 'find the value(s) of x in the equation x^2 + 9 = -6x', 'give the point(s) where  12 = 2y + 6x and y = x^2 - 5x intersect (round on 2 decimals)', 'rewrite -sin(8x) to the form of cos(ax + b)'];
const mathAnswers = ['Answer: f\'(x) = 18 * cos(9x + 3)', 'Answer: log(10^38)', 'Answer: x = -3', 'Answer: (-1,65; 10,94), (3,65; -4,94)', 'Answer: cos(8x + 0.5pi)'];
const selectedQuestion = Math.floor(Math.random() * mathQuestions.length);
tn('body', 0).insertAdjacentHTML('beforeend', '<div id="somtoday-mod"><div id="somtoday-mod-active" data-platform="' + window.platform + '" data-version="' + version + '"><!-- Well hello there! Great work, detective. --><!-- Nothing better to do? Solve this math question: ' + mathQuestions[selectedQuestion] + ' --><div data-info="expand-to-view-answer"><!-- ' + mathAnswers[selectedQuestion] + ' --></div></div></div>');

function onload() {
        // Make sure to have only one instance of the mod active at a time
    if (!n(id('somtoday-mod-active'))) {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD:\nMultiple instances of Somtoday Mod are running.\nSomtoday Mod ' + window.platform + ' v' + version + ' will not be working until the other instance is deleted or deactivated.'));
        return;
    }
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

    // Make sure to remove inert on click if needed
    document.addEventListener('click', function () {
        if (n(id('mod-message')) && tn('sl-root', 0).inert) {
            tn('sl-root', 0).inert = false;
            if (!n(tn('sl-modal', 0))) {
                tn('sl-modal', 0).inert = false;
            }
        }
    });
}