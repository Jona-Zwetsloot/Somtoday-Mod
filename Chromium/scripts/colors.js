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