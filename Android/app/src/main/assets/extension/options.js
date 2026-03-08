// MANAGE OPTIONS PAGE AND CHECK IF USERSCRIPTS ARE AVAILABLE
document.getElementById('name').innerHTML=chrome.i18n.getMessage("extName");
document.getElementById('version').innerHTML=chrome.i18n.getMessage("extVersion");
document.getElementById('activetext').innerHTML=chrome.i18n.getMessage("activeText");
document.getElementById('btn-1').innerHTML=chrome.i18n.getMessage("btnOne");
document.getElementById('btn-2').innerHTML=chrome.i18n.getMessage("btnTwo");
document.getElementById('new-1').innerHTML=chrome.i18n.getMessage("newOne");
document.getElementById('new-2').innerHTML=chrome.i18n.getMessage("newTwo");
document.getElementById('new-3').innerHTML=chrome.i18n.getMessage("newThree");
document.getElementById('whats-new').innerHTML=chrome.i18n.getMessage("whatsNew");
document.getElementById('new-header').innerHTML=chrome.i18n.getMessage("whatsNewHeader");
document.getElementById('back').innerHTML=chrome.i18n.getMessage("back");
document.getElementById('whats-new').addEventListener('click', function() { document.getElementById('activated').style.display = 'none'; document.getElementById('new-in-this-release').style.display = 'block'; });
document.getElementById('back').addEventListener('click', function() { document.getElementById('activated').style.display = 'block'; document.getElementById('new-in-this-release').style.display = 'none'; });
// Color functions
const hexToRgb = hex => hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b).substring(1).match(/.{2}/g).map(x => parseInt(x, 16));
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}).join('');
const getRelativeLuminance = (rgb) => Math.round(0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]);
function toBrightnessValue(color, target) {
    var i;
    var brightness;
    for (i = 1; i <= 10; i++) {
        brightness = Math.round(getRelativeLuminance(hexToRgb(color)));
        color = adjust(color, target - brightness);
    }
    return color;
}
const adjust = (col, amt) => {
    col = col.replace(/^#/, '');
    if (col.length === 3) {
        col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2]
    };
    let [r, g, b] = col.match(/.{2}/g);
    [r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt];
    r = Math.max(Math.min(255, r), 0).toString(16);
    g = Math.max(Math.min(255, g), 0).toString(16);
    b = Math.max(Math.min(255, b), 0).toString(16);
    const rr = (r.length < 2 ? '0' : '') + r;
    const gg = (g.length < 2 ? '0' : '') + g;
    const bb = (b.length < 2 ? '0' : '') + b;
    return `#${rr}${gg}${bb}`;
}
function adjustColorChannel(channel, hex, value) {
    var rgb = hexToRgb(hex);
    rgb[channel] = rgb[channel] + value;
    hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    return hex;
}
// Insert custom styles based on user settings
chrome.storage.local.get(["primarycolor", "fontname"]).then((result) => {
    var color = result.primarycolor;
    var font = result.fontname;
    if (color == null || color == "" || color == undefined) {
        color = "#0067c2";
        font = "Gabarito";
    }
    //document.getElementsByTagName("body")[0].style.background = color;
    if (font == "Bebas Neue" || font == "Oswald") {
        document.getElementsByTagName("body")[0].style.letterSpacing = "1px";
    }
    document.getElementsByTagName("body")[0].style.fontFamily = font;
    const rgbcolor = hexToRgb(color);
    var background = toBrightnessValue(color, 245);
    var bordercolor = toBrightnessValue(color, 220);
    var borderhover = toBrightnessValue(color, 200);
    // Color is mostly blue
    if (rgbcolor[2] > rgbcolor[0] && rgbcolor[2] > rgbcolor[1]) {
        const factor = -Math.min(Math.round(((rgbcolor[2] - rgbcolor[0]) + (rgbcolor[2] - rgbcolor[1])) / 10), 25);
        background = adjustColorChannel(1, adjustColorChannel(0, toBrightnessValue(color, 245), factor), factor);
        bordercolor = adjustColorChannel(1, adjustColorChannel(0, toBrightnessValue(color, 220), factor), factor);
        borderhover = adjustColorChannel(1, adjustColorChannel(0, toBrightnessValue(color, 200), factor), factor);
    }
    // Color is mostly red
    else if (rgbcolor[0] > rgbcolor[2] && rgbcolor[0] > rgbcolor[1]) {
        const factor = -Math.min(Math.round(((rgbcolor[0] - rgbcolor[2]) + (rgbcolor[0] - rgbcolor[1])) / 10), 25);
        background = adjustColorChannel(2, adjustColorChannel(1, toBrightnessValue(color, 245), factor), factor);
        bordercolor = adjustColorChannel(2, adjustColorChannel(1, toBrightnessValue(color, 220), factor), factor);
        borderhover = adjustColorChannel(2, adjustColorChannel(1, toBrightnessValue(color, 200), factor), factor);
    }
    // Color is mostly green
    else if (rgbcolor[1] > rgbcolor[0] && rgbcolor[1] > rgbcolor[2]) {
        const factor = -Math.min(Math.round(((rgbcolor[1] - rgbcolor[0]) + (rgbcolor[1] - rgbcolor[2])) / 10), 25);
        background = adjustColorChannel(2, adjustColorChannel(0, toBrightnessValue(color, 245), factor), factor);
        bordercolor = adjustColorChannel(2, adjustColorChannel(0, toBrightnessValue(color, 220), factor), factor);
        borderhover = adjustColorChannel(2, adjustColorChannel(0, toBrightnessValue(color, 200), factor), factor);
    }
    document.documentElement.style.setProperty("--button-background-color", background);
    document.documentElement.style.setProperty("--button-border-color", bordercolor);
    document.documentElement.style.setProperty("--button-border-hover-color", borderhover);
    document.documentElement.style.setProperty("--button-color", toBrightnessValue(color, 80));
});