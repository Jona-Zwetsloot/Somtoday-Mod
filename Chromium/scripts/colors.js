// COLORS

// Adjust color with specified amount (make color brighter or darker)
const adjust = (col, amt) => {
    col = col.replace(/^#/, '');
    if (col.length === 3) {
        col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];
    }
    let [r, g, b] = col.match(/.{2}/g);
    [r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt];
    r = Math.max(Math.min(255, r), 0).toString(16);
    g = Math.max(Math.min(255, g), 0).toString(16);
    b = Math.max(Math.min(255, b), 0).toString(16);
    const rr = (r.length < 2 ? '0' : '') + r;
    const gg = (g.length < 2 ? '0' : '') + g;
    const bb = (b.length < 2 ? '0' : '') + b;
    return `#${rr}${gg}${bb}`;
};

// Convert hex to rgb
const hexToRgb = hex => hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b).substring(1).match(/.{2}/g).map(x => parseInt(x, 16));

// Convert rgb to hex
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}).join('');

// Get brightness of color
const getRelativeLuminance = (rgb) => Math.round(0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]);

// Change specific color channel
function adjustColorChannel(channel, hex, value) {
    let rgb = hexToRgb(hex);
    rgb[channel] = Math.min(Math.max(rgb[channel] + value, 0), 255);
    return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

// Change color brightness level
function toBrightnessValue(color, target) {
    let i;
    let brightness;
    const startColor = color;
    for (i = 1; i <= 5; i++) {
        brightness = Math.round(getRelativeLuminance(hexToRgb(color)));
        color = adjust(color, target - brightness);
    }
    // Some colors are very bright on one channel (such as default blue)
    // When the target brightness is too high, these colors will look weird (eg default blue looks too green)
    // This code lowers the 2 other color channels to make sure the color looks good
    const rgbcolor = hexToRgb(startColor);
    const factor = Math.round(target * -0.15);
    if (rgbcolor[2] > rgbcolor[0] && rgbcolor[2] > rgbcolor[1] && rgbcolor[2] + 50 > rgbcolor[0] + rgbcolor[1]) {
        color = adjustColorChannel(1, adjustColorChannel(0, color, factor), factor);
    }
    else if (rgbcolor[0] > rgbcolor[2] && rgbcolor[0] > rgbcolor[1] && rgbcolor[0] + 50 > rgbcolor[1] + rgbcolor[2]) {
        color = adjustColorChannel(2, adjustColorChannel(1, color, factor), factor);
    }
    else if (rgbcolor[1] > rgbcolor[0] && rgbcolor[1] > rgbcolor[2] && rgbcolor[1] + 50 > rgbcolor[0] + rgbcolor[2]) {
        color = adjustColorChannel(2, adjustColorChannel(0, color, factor), factor);
    }
    return color;
}
function addNightTheme() {
    const blokDiv = document.querySelector('div.blok');
    const darkDiv = blokDiv.querySelector('div[data-gtm="instellingen-weergave-theme-dark-mode"]');
    const darkImage = blokDiv.querySelector('input[value="dark"]')?.parentElement.querySelector('img');
    if (darkImage) darkImage.src = chrome.runtime.getURL('images/dark-mode.svg');
    const nightDiv = document.createElement('div');
    nightDiv.setAttribute('_ngcontent-ng-c4136085133', '');
    nightDiv.setAttribute('data-gtm', 'instellingen-weergave-theme-dark-mode');
    nightDiv.setAttribute('tabindex', '0');
    nightDiv.setAttribute('aria-label', 'Weergave Nacht');
    nightDiv.setAttribute('role', 'radio');
    nightDiv.setAttribute('class', 'container dark right');
    nightDiv.setAttribute('aria-checked', 'false');
    nightDiv.innerHTML = `
        <img _ngcontent-ng-c4136085133="" src="../../assets/svg/darkmode.svg" alt="nacht">
        <label _ngcontent-ng-c4136085133="" title="Deze optie is experimenteel, deze optie kan veranderd of verwijderd worden in de toekomst. Deze optie is ook niet van Somtoday zelf, maar van Somtoday Mod.">Nacht <span class="experimental">*</span></label>
        <input _ngcontent-ng-c4136085133="" type="radio" name="thema" value="night" tabindex="-1" class="ng-untouched ng-pristine ng-valid">
    `;
    darkDiv.insertAdjacentElement('afterend', nightDiv);
    const allRadios = blokDiv.querySelectorAll('input[type="radio"][name="thema"]');
    const html = document.documentElement;
    const currentTheme = ['light', 'dark', 'night'].find(t => html.classList.contains(t));
    if (currentTheme) {
        const activeRadio = Array.from(allRadios).find(r => r.value === currentTheme);
        if (activeRadio) activeRadio.checked = true;
    }
    function updateTheme() {
        const html = document.documentElement;
        allRadios.forEach(r => {
            r.parentElement.setAttribute('aria-checked', r.checked ? 'true' : 'false');
        });
        html.classList.remove('light', 'dark', 'night');
        const checkedRadio = Array.from(allRadios).find(r => r.checked);
        if (checkedRadio) {
            html.classList.add(checkedRadio.value);
            set('theme', checkedRadio.value);
        }
    }
    updateTheme();
    allRadios.forEach(r => {
        const div = r.parentElement;
        div.addEventListener('click', () => {
            r.checked = true;
            updateTheme();
        });
    });
}
const waitForTabs = new MutationObserver((mutations, obs) => {
    const tabs = document.querySelectorAll('sl-account-modal-tab');
    if (tabs.length >= 2) {
        obs.disconnect();
        const secondTab = tabs[1];
        const tabObserver = new MutationObserver(() => {
            if (secondTab.getAttribute('aria-selected') === 'true') {
                addNightTheme();
            }
        });
        tabObserver.observe(secondTab, { attributes: true });
    }
});
waitForTabs.observe(document.body, { childList: true, subtree: true });
