// 1 - VERSION & SAVE MANAGEMENT

// Contains code to save data for both the Tampermonkey and the Extension version. Also contains localStorage as fallback.
// If you see warning signs and you want to remove them, copy the get and set for the version you are using and place them outside the if statement
const version = 3.7;
const platform = "Chromium";
const minified = false;

let isloaded = false;
let loadInterval;
let data;
// Check if userscriptmanager allows storage access
if (typeof GM_getValue === 'function' && typeof GM_setValue === 'function') {
    function get(e) {
        return GM_getValue(e, null)
    }
    function set(e, t) {
        return GM_setValue(e, t)
    }
    if (platform != "Userscript") {
        setTimeout(console.warn.bind("console", "SOMTODAY MOD: Userscript storage is used while the platform is not set to Userscript."));
    }
}
// Check if extension allows storage access
else if (((typeof chrome !== 'undefined') && chrome.storage) && chrome.storage.local) {
    // GET DATA
    chrome.storage.local.get(["background", "birthday", "blur", "bools", "enabled", "firstused", "fontname", "icon", "initials", "lastjubileum", "lastused", "layout", "nicknames", "primarycolor", "profilepic", "reload", "theme", "title", "transparency", "username", "version", "zoom"]).then((result) => {
        // CHECK IF SCRIPT IS ENABLED
        data = {
            background: result.background,
            birthday: result.birthday,
            blur: result.blur,
            bools: result.bools,
            enabled: result.enabled,
            firstused: result.firstused,
            fontname: result.fontname,
            icon: result.icon,
            initials: result.initials,
            lastjubileum: result.lastjubileum,
            lastused: result.lastused,
            layout: result.layout,
            nicknames: result.nicknames,
            primarycolor: result.primarycolor,
            profilepic: result.profilepic,
            reload: result.reload,
            theme: result.theme,
            title: result.title,
            transparency: result.transparency,
            username: result.username,
            version: result.version,
            zoom: result.zoom
        };
    });
    chrome.storage.onChanged.addListener((changes) => {
        if (changes['enabled'] != null) {
            window.location.reload();
        }
    });
    var isUpdating = false;
    function get(e) {
        if (data == null) {
            return "";
        }
        if (data[e] == null) {
            return "";
        }
        return data[e];
    }
    function set(e, t) {
        let prop = e;
        let obj = {};
        obj[prop] = t;
        try {
            chrome.storage.local.set(obj);
        }
        catch (e) {
            setTimeout(console.warn.bind(console, "SOMTODAY MOD: Couldn't save value. Somtoday Mod is probably updating right now.\nError: " + e));
        }
        data[e] = t;
    }
    if (platform == "Userscript") {
        setTimeout(console.warn.bind("console", "SOMTODAY MOD: Extension storage is used while the platform is set to Userscript."));
    }
}
// Fallback to local storage
else if (window.localStorage) {
    var messageShown = false;
    function set(name, value) {
        try {
            localStorage.setItem(name, value);
        }
        catch (e) {
            if (messageShown == false) {
                if (confirm('De LocalStorage-limiet is bereikt. Sommige instellingen zijn niet opgeslagen.\nControleer of je Somtoday Mod ' + (platform == 'Userscript' ? 'GM_getValue en GM_setValue hebt gegrant' : 'toestemming hebt gegeven tot de storage') + ' als je meer opslagruimte wil.\nWil je de LocalStorage wissen?')) {
                    localStorage.clear();
                    window.location.reload();
                }
                messageShown = true;
            }
        }
    }
    function get(key) {
        return localStorage.getItem(key);
    }
    setTimeout(console.warn.bind("console", "SOMTODAY MOD: Could not find extension or userscript storage. Falling back to localstorage."));
}
else {
    throw new Error("Somtoday Mod ERROR\nCould not find any place to store setting data.\nConsider updating your browser, or giving Somtoday Mod storage access.");
}





// 2 - SHORTHAND FUNCTIONS

// document.getElementById(...) --> id(...)
function id(id) {
    return document.getElementById(id);
}

// document.getElementsByClassName(...)[i] --> cn(..., i)
function cn(cl, index) {
    if (index == null) {
        return document.getElementsByClassName(cl);
    } else if (document.getElementsByClassName(cl)[index] != null) {
        return document.getElementsByClassName(cl)[index];
    }
    return null;
}

// document.getElementsByTagName(...)[i] --> tn(..., i)
function tn(tn, index) {
    if (index == null) {
        return document.getElementsByTagName(tn);
    } else if (document.getElementsByTagName(tn)[index] != null) {
        return document.getElementsByTagName(tn)[index];
    }
    return null;
}

// element.style.display = 'none' --> hide(element)
function hide(element) {
    if (element != null) {
        element.style.display = "none";
    }
}

// element.style.display = 'block' --> show(element)
function show(element) {
    if (element != null) {
        element.style.display = "block";
    }
}

// object == '' || object == null || object == '0' --> n(object)
function n(object) {
    if (object instanceof Element) {
        if (object == null) {
            return true;
        }
        else {
            return false;
        }
    }
    if (object == "" || object == null || object == "0") {
        return true;
    }
    return false;
}

// if (element != null) { element.innerHTML = html } --> setHTML(element, html)
function setHTML(element, html) {
    if (element != null) {
        element.innerHTML = html;
    }
}

// if (element != null) { element.remove() } --> tryRemove(element)
function tryRemove(element) {
    if (element != null) {
        element.remove();
    }
}

// try { function() } catch (e) { ... } --> execute([function])
function execute(functionarray) {
    for (const element of functionarray) {
        try {
            element();
        } catch (e) {
            sendDebugData(element.name, e);
            setTimeout(console.error.bind(console, e));
        }
    }
}

// string.substring(0, index) + replacement + string.substring(index + replacement.length) --> string.replaceAt(index, replacement)
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}





// 3 - EXECUTE MOD AFTER PAGE LOAD

if (window.location.origin.indexOf("som.today") != -1) {
    if ((get("bools") == null) || get("bools").charAt(4) == "1") {
        window.location.replace("https://inloggen.somtoday.nl");
    }
}
else {
    // Hide page while loading
    if (!n(tn('html', 0))) {
        tn('html', 0).style.opacity = "0";
    }

    // Stop transitions while loading
    if (!n(tn('html', 0)) && n(id('transitions-disabled'))) {
        tn('html', 0).insertAdjacentHTML('afterbegin', '<style id="transitions-disabled">* { transition: none !important; }</style>');
    }

    // Add onload event listener and execute onload function if page is loaded
    window.addEventListener('load', tryLoad, {passive: true});

    // Set interval to be sure that the mod doesn't miss the load event
    loadInterval = setInterval(tryLoad, 50);
}

function tryLoad() {
    // Check if page is not yet loaded and elements exist (and if mod is enabled)
    if (!isloaded && (!n(id('master-panel')) || (!n(cn("stpanel--status", 0)) && !n(cn("errorTekst", 0)))) && (platform == "Userscript" || data != null)) {
        clearInterval(loadInterval);
        // Page has loaded
        isloaded = true;
        // Show page
        tn('html', 0).removeAttribute('style');
        if (platform == "Userscript" || (data != null && data.enabled)) {
            execute([onload]);
        }
    }
}

// Show a message on top of the page. Similair to browser confirm().
function modMessage(title, description, link1, link2, red1, red2, noBackgroundClick) {
    while (!n(id('mod-message'))) {
        tryRemove(id('mod-message'));
    }
    const element = n(id('somtoday-mod')) ? tn('body', 0) : id('somtoday-mod');
    element.insertAdjacentHTML('afterbegin', '<div id="mod-message" class="mod-msg-open"><center><div onclick="event.stopPropagation();"><h2>' + title + '</h2><p>' + description + '</p>' + (n(link1) ? '' : '<a id="mod-message-action1" class="mod-message-button' + (red1 ? ' mod-button-discouraged' : '') + '" tabindex="0">' + link1 + '</a>') + (n(link2) ? '' : '<a id="mod-message-action2" class="mod-message-button' + (red2 ? ' mod-button-discouraged' : '') + '" tabindex="0">' + link2 + '</a>') + '</div></center></div>');
    if (!n(link1)) {
        id('mod-message-action1').focus();
        id('mod-message-action1').addEventListener("keydown", (event) => { if (event.keyCode === 13) { id('mod-message-action1').click(); } else if (event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 9) { event.preventDefault(); if (!n(id('mod-message-action2'))) { id('mod-message-action2').focus(); } } } );
    }
    if (!n(link2)) {
        id('mod-message-action2').addEventListener("keydown", (event) => { if (event.keyCode === 13) { id('mod-message-action2').click(); } else if (event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 9) { event.preventDefault(); id('mod-message-action1').focus(); } } );
        if (noBackgroundClick == null) {
            id('mod-message').addEventListener("click", function() { id('mod-message-action2').click(); } );
        }
    }
    else if (!n(link1) && noBackgroundClick == null) {
        id('mod-message').addEventListener("click", function() { id('mod-message-action1').click(); } );
    }
}

// Report bug if user has given permission (when error happens)
function sendDebugData(name, error) {
    if (get("bools").charAt(5) == "1") {
        let somtodayversion = "0";
        if (!n(cn('version', 0))) {
            if (!n(cn('version', 0).children[0])) {
                somtodayversion = cn('version', 0).children[0].innerHTML;
            }
        }
        fetch("https://jonazwetsloot.nl/reporterror?product=Somtoday%20Mod%20" + platform + "&function=" + name.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0') + "&cause=" + error.toString().replace(/\n/g, '%0A').replace(/[\\"']/g, '\$&').replace(/\u0000/g, '\0') + "&page=" + window.location.href.split('/').pop().split('?')[0] + "&version=" + somtodayversion + "&productversion=" + version + "&settings=" + get("bools") + "");
    }
}





// 4 - COLORS

// Adjust color with specified amount (make color brighter or darker)
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
    rgb[channel] = rgb[channel] + value;
    hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    return hex;
}

// Change color brightness level
function toBrightnessValue(color, target) {
    let i;
    let brightness;
    for (i = 1; i <= 10; i++) {
        brightness = Math.round(getRelativeLuminance(hexToRgb(color)));
        color = adjust(color, target - brightness);
    }
    return color;
}

// Define the colors used in CSS later
let colors;
function generateColors() {
    colors = [get("primarycolor")];
    // Make sure menu bar is not invisible on background
    if (get('layout') == 1 || get('layout') == 4) {
        if (get('bools').charAt(0) == "1") {
            if (getRelativeLuminance(hexToRgb(colors[0])) <= 10) {
                colors[0] = adjust(colors[0], 15);
            }
        }
        else {
            if (getRelativeLuminance(hexToRgb(colors[0])) >= 250) {
                colors[0] = adjust(colors[0], -10);
            }
        }
    }
    if (getRelativeLuminance(hexToRgb(colors[0])) >= 160) {
        colors[1] = adjust(colors[0], -35);
    } else {
        colors[1] = adjust(colors[0], 35);
    }
    if (getRelativeLuminance(hexToRgb(colors[0])) >= 240) {
        colors[2] = adjust(colors[0], -170);
    } else if (getRelativeLuminance(hexToRgb(colors[0])) >= 160) {
        colors[2] = adjust(colors[0], -110);
    } else {
        colors[2] = "#fff";
    }
    if (get("bools").charAt(0) == "1") {
        const rgbcolor = hexToRgb(colors[0]);
        // Generate and adjust colors based on highest color channel value
        // Color is mostly blue
        if (rgbcolor[2] > rgbcolor[0] && rgbcolor[2] > rgbcolor[1]) {
            const factor = Math.min(Math.round(((rgbcolor[2] - rgbcolor[0]) + (rgbcolor[2] - rgbcolor[1])) / 10), 25);
            colors[3] = adjustColorChannel(1, adjustColorChannel(0, toBrightnessValue(colors[0], 20), factor), factor);
            colors[4] = adjustColorChannel(1, adjustColorChannel(0, toBrightnessValue(colors[0], 25), factor), factor);
            colors[5] = adjustColorChannel(1, adjustColorChannel(0, toBrightnessValue(colors[0], 35), factor), factor);
        }
        // Color is mostly red
        else if (rgbcolor[0] > rgbcolor[2] && rgbcolor[0] > rgbcolor[1]) {
            const factor = Math.min(Math.round(((rgbcolor[0] - rgbcolor[2]) + (rgbcolor[0] - rgbcolor[1])) / 10), 25);
            colors[3] = adjustColorChannel(2, adjustColorChannel(1, toBrightnessValue(colors[0], 20), factor), factor);
            colors[4] = adjustColorChannel(2, adjustColorChannel(1, toBrightnessValue(colors[0], 25), factor), factor);
            colors[5] = adjustColorChannel(2, adjustColorChannel(1, toBrightnessValue(colors[0], 35), factor), factor);
        }
        // Color is mostly green
        else if (rgbcolor[1] > rgbcolor[0] && rgbcolor[1] > rgbcolor[2]) {
            const factor = Math.min(Math.round(((rgbcolor[1] - rgbcolor[0]) + (rgbcolor[1] - rgbcolor[2])) / 10), 25);
            colors[3] = adjustColorChannel(2, adjustColorChannel(0, toBrightnessValue(colors[0], 20), factor), factor);
            colors[4] = adjustColorChannel(2, adjustColorChannel(0, toBrightnessValue(colors[0], 25), factor), factor);
            colors[5] = adjustColorChannel(2, adjustColorChannel(0, toBrightnessValue(colors[0], 35), factor), factor);
        }
        // Color is black, white or grey
        else {
            colors[3] = toBrightnessValue(colors[0], 20);
            colors[4] = toBrightnessValue(colors[0], 25);
            colors[5] = toBrightnessValue(colors[0], 35);
        }
        colors[6] = toBrightnessValue(colors[0], 165);
        colors[7] = toBrightnessValue(colors[0], 195);
        colors[8] = "rgba(255,255,255,0.1)";
        colors[9] = "#fff";
        colors[10] = colors[6];
        colors[11] = "#fff";
        colors[12] = "#000";
        if (!n(get("background"))) {
            colors[3] = "rgba(" + hexToRgb(colors[3]) + "," + get("transparency") + ")";
            colors[8] = "rgba(0,0,0," + get("transparency") + ")";
        }
        colors[14] = "#000";
    } else {
        const rgbcolor = hexToRgb(colors[0]);
        // Generate and adjust colors based on highest color channel value
        // Color is mostly blue
        if (rgbcolor[2] > rgbcolor[0] && rgbcolor[2] > rgbcolor[1]) {
            const factor = -Math.min(Math.round(((rgbcolor[2] - rgbcolor[0]) + (rgbcolor[2] - rgbcolor[1])) / 10), 25);
            colors[3] = adjustColorChannel(1, adjustColorChannel(0, toBrightnessValue(colors[0], 250), factor), factor);
            colors[4] = adjustColorChannel(1, adjustColorChannel(0, toBrightnessValue(colors[0], 245), factor), factor);
            colors[5] = adjustColorChannel(1, adjustColorChannel(0, toBrightnessValue(colors[0], 235), factor), factor);
        }
        // Color is mostly red
        else if (rgbcolor[0] > rgbcolor[2] && rgbcolor[0] > rgbcolor[1]) {
            const factor = -Math.min(Math.round(((rgbcolor[0] - rgbcolor[2]) + (rgbcolor[0] - rgbcolor[1])) / 10), 25);
            colors[3] = adjustColorChannel(2, adjustColorChannel(1, toBrightnessValue(colors[0], 250), factor), factor);
            colors[4] = adjustColorChannel(2, adjustColorChannel(1, toBrightnessValue(colors[0], 245), factor), factor);
            colors[5] = adjustColorChannel(2, adjustColorChannel(1, toBrightnessValue(colors[0], 235), factor), factor);
        }
        // Color is mostly green
        else if (rgbcolor[1] > rgbcolor[0] && rgbcolor[1] > rgbcolor[2]) {
            const factor = -Math.min(Math.round(((rgbcolor[1] - rgbcolor[0]) + (rgbcolor[1] - rgbcolor[2])) / 10), 25);
            colors[3] = adjustColorChannel(2, adjustColorChannel(0, toBrightnessValue(colors[0], 250), factor), factor);
            colors[4] = adjustColorChannel(2, adjustColorChannel(0, toBrightnessValue(colors[0], 245), factor), factor);
            colors[5] = adjustColorChannel(2, adjustColorChannel(0, toBrightnessValue(colors[0], 235), factor), factor);
        }
        // Color is black, white or grey
        else {
            colors[3] = toBrightnessValue(colors[0], 250);
            colors[4] = toBrightnessValue(colors[0], 245);
            colors[5] = toBrightnessValue(colors[0], 235);
        }
        colors[6] = toBrightnessValue(colors[0], 50);
        colors[7] = toBrightnessValue(colors[0], 100);
        colors[8] = "rgba(0,0,0,0.03)";
        colors[9] = "#3b4d68";
        colors[10] = "#000829";
        colors[11] = "#000";
        if (!n(get("background"))) {
            colors[3] = "rgba(" + hexToRgb(colors[3]) + "," + get("transparency") + ")";
            colors[8] = "rgba(255,255,255," + get("transparency") + ")";
        }
        colors[12] = "#fff";
    }
    if (getRelativeLuminance(hexToRgb(colors[0])) <= 50) {
        colors[13] = adjust(colors[0], 100);
    }
    else {
        if (getRelativeLuminance(hexToRgb(colors[0])) <= 100) {
            colors[13] = adjust(colors[0], -50);
        }
        else {
            colors[13] = adjust(colors[0], -100);
        }
    }
    if (get("bools").charAt(0) == "1") {
        colors[14] = toBrightnessValue(colors[0], 100);
        colors[15] = toBrightnessValue(colors[0], 150);
    }
    else {
        colors[14] = toBrightnessValue(colors[0], 200);
        colors[15] = toBrightnessValue(colors[0], 150);
    }
}





// 5 - ERROR CHECKS

// The onload function contains the rest of the script, which is loaded when the page is ready or 1s has passed since script load.
function onload() {
    // Make sure to have only one instance of the mod active at a time
    if (!n(id('somtoday-mod-active'))) {
        setTimeout(console.warn.bind(console, "SOMTODAY MOD:\nMultiple instances of Somtoday Mod are running.\nSomtoday Mod " + platform + " v" + version + " will not be working until the other instance is deleted or deactivated."));
        return;
    } else {
        tn('body', 0).insertAdjacentHTML('beforeend', '<div id="somtoday-mod"><div id="somtoday-mod-active" style="display: none;">' + platform + ' v' + version + '</div></div>');
    }

    // Stop script if 502 error occurs
    if (!n(cn("cf-error-details cf-error-502", 0))) {
        setTimeout(console.warn.bind(console, "SOMTODAY MOD: Bad gateway (502)"));
        return;
    }

    // Stop script if 404 error occurs
    if (!n(cn("stpanel--error--message", 0))) {
        setTimeout(console.warn.bind(console, "SOMTODAY MOD: Page could not be found (404)"));
        return;
    }

    // Stop script if Somtoday has outage
    if (!n(cn("titlewrap", 0))) {
        // Since https://som.today and the error page are very similar, check if the word 'storing' is present on the page
        if (cn("titlewrap", 0).parentElement.parentElement.innerHTML.indexOf('storing') != -1) {
            setTimeout(console.warn.bind(console, "Somtoday Mod ERROR\nSomtoday is down."));
            return;
        }
    }

    let username;
    let realname;
    let firstname;
    let lastname;
    let initials;
    let profilepic;
    let somtodayversion;

    let today = new Date();
    let dayInt = today.getDate();
    let month = today.getMonth();
    let year = today.getFullYear();

    let busy = false;
    let filesProcessed = 0;





    // 6 - IMPORTANT FUNCTIONS

    // Get some data from page, insert page icon and title if specified
    function start() {
        set("reload", new Date().getTime());
        if (!n(id('user'))) {
            if (!n(id('user').getElementsByTagName('img')[0])) {
                if (!n(id('user').getElementsByTagName('img')[0].src)) {
                    profilepic = id('user').getElementsByTagName('img')[0].src;
                }
            }
            if (!n(id('user').getElementsByTagName('a')[0])) {
                if (!n(id('user').getElementsByTagName('a')[0].children[1])) {
                    // Username is in expected element
                    if (id('user').getElementsByTagName('a')[0].href.indexOf('profile') != -1 && id('user').getElementsByTagName('a')[1].href.indexOf('profile?') == -1) {
                        username = id('user').getElementsByTagName('a')[0].children[1].innerHTML;
                    }
                    // Username is in an other, unknown element
                    else {
                        for (const element of id('user').getElementsByTagName('a')) {
                            if (element.href.indexOf('profile') != -1 && element.href.indexOf('profile?') == -1) {
                                if (!n(element.children[1])) {
                                    username = element.children[1].innerHTML;
                                }
                                else if (!n(element.children[0])) {
                                    username = element.children[0].innerHTML;
                                }
                                else {
                                    username = element.innerHTML;
                                }
                            }
                        }
                    }
                    if (n(username)) {
                        username = '';
                    }
                    realname = username;
                    username = n(get('username')) ? username : get('username')
                    firstname = username.replace(/ .*/, '');
                    lastname = username.replace(/.* /, '');
                    initials = username.replace(/[^A-Z]+/g, "");
                }
            }
            if (!n(cn('version', 0))) {
                if (!n(cn('version', 0).children[0])) {
                    somtodayversion = cn('version', 0).children[0].innerHTML;
                }
            }
        }
        if (document.getElementsByName("viewport")[0] != null) {
            document.getElementsByName("viewport")[0].content = 'width=device-width, initial-scale=1';
        }
        tn('head', 0).insertAdjacentHTML('afterbegin', (n(get("icon")) ? "" : '<link rel="icon" href="' + get("icon") + '"></link>') + (n(get("title")) ? "" : '<title>' + get("title") + '</title>'));
    }

    // Adjust main menu style based on layout
    function menu() {
        if (n(id('logo')) && (get('layout') == 2 || get('layout') == 3)) {
            id('main-menu').insertAdjacentHTML('afterbegin', '<center>' + (get("bools").charAt(15) == "0" ? getIcon('logo', null, colors[2], ' id="logo"') : '<svg id="logo" viewBox="0 0 190.5 207" width="190.5" height="207" class="modlogo"><g transform="translate(-144.8 -76.5)"><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill-rule="nonzero" stroke-width="0" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dashoffset="0" style="mix-blend-mode:normal"><path d="M261 107.8v.3c0 3.7 3 6.7 6.6 6.7H299a6.8 6.8 0 0 1 6.7 7V143.2c0 3.7 3 6.7 6.7 6.7h16.1a6.8 6.8 0 0 1 6.7 7V201.6c0 3.7-3 6.6-6.7 6.7h-16.1a6.8 6.8 0 0 0-6.7 7v23.1c0 3.7-3 6.7-6.7 6.7h-10.5a6.8 6.8 0 0 0-6.7 7l-.1 24.4v.3c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.7-7v-24.6c0-3.8-2.8-6.9-6.3-6.9s-6.4 3.1-6.4 7v24.8c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.6-7l.1-24.4v-.3c0-3.7-3-6.7-6.6-6.7h-10.5a6.8 6.8 0 0 1-6.7-7V215c0-3.6-3-6.6-6.7-6.7h-15.8a6.8 6.8 0 0 1-6.7-7V156.6c0-3.7 3-6.7 6.7-6.7h15.8a6.8 6.8 0 0 0 6.7-7v-21.4c0-3.6 3-6.6 6.7-6.7h31a6.8 6.8 0 0 0 6.7-7l.1-24.3v-.3c0-3.6 3-6.6 6.7-6.7h29a6.8 6.8 0 0 1 6.8 7z" data-paper-data="{&quot;index&quot;:null}" fill="' + colors[2] + '" stroke="#000000" /><path d="M289.8 179.2c1.3 0 2.9.3 4.6.9 2.2.7 4 1.7 5 2.7v.2c.8.6 1.3 1.5 1.4 2.6 0 .9-.2 1.7-.6 2.3l-6.8 10.8a60.2 60.2 0 0 1-27.5 19.8c-8.5 3.2-17 4.7-24.7 4.5l-13.2-.1a1.6 1.6 0 0 1-1.7-1.5v-3.3a1.6 1.6 0 0 1 1.7-1.5h.1c7.9.3 16.3-1 24.7-4.2a56 56 0 0 0 34.3-31.4v-.3c.5-1 1.4-1.5 2.3-1.5z" fill="#000000" stroke="none" /><g class="glasses"><path d="M171.4 150.8v-9h137.2v9z" fill="#000000" stroke="none" /><path d="M175.7 155.5v-6h57.5v6z" fill="#000000" stroke="none" /><path d="M179.8 160v-9h48.9v9z" fill="#000000" stroke="none" /><path d="M184 164.5v-9h44.7v9z" fill="#000000" stroke="none" /><path d="M188.6 168.6v-7h31.7v7z" fill="#000000" stroke="none" /><path d="M245.9 155.5v-6h57.4v6z" fill="#000000" stroke="none" /><path d="M250 160v-9h48.8v9z" fill="#000000" stroke="none" /><path d="M254 164.5v-9h41v9z" fill="#000000" stroke="none" /><path d="M258.8 168.6v-7h31.6v7z" fill="#000000" stroke="none" /><path d="M184.5 155.1v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M188.8 159.2V155h4.5v4.3z" fill="#fff" stroke="none" /><path d="M193.3 163.5v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M193.3 155.1v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M197.6 159.2V155h4.5v4.3z" fill="#fff" stroke="none" /><path d="M202.1 163.5v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M254.8 155.1v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M259.1 159.2V155h4.5v4.3z" fill="#fff" stroke="none" /><path d="M263.6 163.5v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M263.6 155.1v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M268 159.2V155h4.4v4.3z" fill="#fff" stroke="none" /><path d="M272.4 163.5v-4.3h4.5v4.3z" fill="#fff" stroke="none"/></g></g></g></svg>') + '</center>');
        } else {
            id('somtoday-mod').insertAdjacentHTML('beforeend', '<div id="background-image-overlay"></div>');
        }
        // Check for internal server error in which case the #user element does not exist
        let internalServerError = false;
        if (n(id('user'))) {
            id('header').insertAdjacentHTML('beforeend', '<div class="right"><div id="user"></div></div>');
            internalServerError = true;
        }
        // Try to find some menu links
        let logoutElement;
        let profileElement;
        let messagesElement;
        for (const element of id('user').getElementsByTagName('a')) {
            if (element.href.indexOf('logout') != -1) {
                logoutElement = element;
            }
            else if (element.href.indexOf('profile') != -1 && element.href.indexOf('profile?') == -1) {
                profileElement = element;
            }
            else if (element.href.indexOf('messages') != -1 && element.href.indexOf('messages?') == -1) {
                messagesElement = element;
            }
        }
        // Insert fallback menu links if they can't be found
        if (logoutElement == null) {
            setTimeout(console.warn.bind("console", "SOMTODAY MOD: Could not find logout button."));
            // Construct logout URL that works 90% of the time
            var state = history.state || {};
            var reloadCount = state.reloadCount || 0;
            if (performance.navigation.type === 1) {
                state.reloadCount = ++reloadCount;
                history.replaceState(state, null, document.URL);
            } else if (reloadCount) {
                delete state.reloadCount;
                reloadCount = 0;
                history.replaceState(state, null, document.URL);
            }
            id('user').insertAdjacentHTML('beforeend', '<a id="mod-open-logout" href="' + window.location.pathname + window.location.search.split('&')[0] + '-' + (Math.max(reloadCount, 1)) + '.-userPanel-logout"></a>');
            logoutElement = id('mod-open-logout');
        }
        if (messagesElement == null) {
            setTimeout(console.warn.bind("console", "SOMTODAY MOD: Could not find messages button."));
            id('user').insertAdjacentHTML('beforeend', '<a id="mod-open-messages" href="/home/messages"></a>');
            messagesElement = id('mod-open-messages');
        }
        if (profileElement == null) {
            setTimeout(console.warn.bind("console", "SOMTODAY MOD: Could not find profile button."));
            id('user').insertAdjacentHTML('beforeend', '<a id="mod-open-settings"></a>');
            id('mod-open-settings').addEventListener('click', insertSettings);
            profileElement = id('mod-open-settings');
        }
        // Update menu content
        if (!internalServerError) {
            setHTML(logoutElement, getIcon("right-from-bracket", null, colors[7]));
            logoutElement.classList.add('topmenusvg', 'logout-btn');
            logoutElement.title = "Uitloggen";
            setHTML(messagesElement, getIcon("envelope", null, colors[7]));
            messagesElement.classList.add('topmenusvg', 'messages-btn');
            messagesElement.title = "Berichten";
            let userPic = !n(get("profilepic"));
            setHTML(profileElement, (get("bools").charAt(2) == "1" && !(profilepic == null && !userPic)) ? "<img class='profile-img' style='display: inline-block;' src='" + (userPic ? get("profilepic") : profilepic) + "'/>" : "<div id='profile-img' class='profile-img'>" + (n(initials) ? getIcon('user', null, null, 'style="margin-top:11px;"') : initials) + "</div>");
            profileElement.classList.add('profile-img-menu');
        }
        id('user').insertAdjacentHTML('beforeend', '<h1 id="page-title">' + (
            (get('layout') == 1 || get('layout') == 4) ?
                (get("bools").charAt(15) == "0" ?
                     getIcon('logo', null, colors[7], ' id="logo"') :
                     '<svg id="logo" viewBox="0 0 190.5 207" width="190.5" height="207" class="modlogo"><g transform="translate(-144.8 -76.5)"><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill-rule="nonzero" stroke-width="0" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dashoffset="0" style="mix-blend-mode:normal"><path d="M261 107.8v.3c0 3.7 3 6.7 6.6 6.7H299a6.8 6.8 0 0 1 6.7 7V143.2c0 3.7 3 6.7 6.7 6.7h16.1a6.8 6.8 0 0 1 6.7 7V201.6c0 3.7-3 6.6-6.7 6.7h-16.1a6.8 6.8 0 0 0-6.7 7v23.1c0 3.7-3 6.7-6.7 6.7h-10.5a6.8 6.8 0 0 0-6.7 7l-.1 24.4v.3c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.7-7v-24.6c0-3.8-2.8-6.9-6.3-6.9s-6.4 3.1-6.4 7v24.8c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.6-7l.1-24.4v-.3c0-3.7-3-6.7-6.6-6.7h-10.5a6.8 6.8 0 0 1-6.7-7V215c0-3.6-3-6.6-6.7-6.7h-15.8a6.8 6.8 0 0 1-6.7-7V156.6c0-3.7 3-6.7 6.7-6.7h15.8a6.8 6.8 0 0 0 6.7-7v-21.4c0-3.6 3-6.6 6.7-6.7h31a6.8 6.8 0 0 0 6.7-7l.1-24.3v-.3c0-3.6 3-6.6 6.7-6.7h29a6.8 6.8 0 0 1 6.8 7z" data-paper-data="{&quot;index&quot;:null}" fill="' + colors[1] + '" stroke="#000000" /><path d="M289.8 179.2c1.3 0 2.9.3 4.6.9 2.2.7 4 1.7 5 2.7v.2c.8.6 1.3 1.5 1.4 2.6 0 .9-.2 1.7-.6 2.3l-6.8 10.8a60.2 60.2 0 0 1-27.5 19.8c-8.5 3.2-17 4.7-24.7 4.5l-13.2-.1a1.6 1.6 0 0 1-1.7-1.5v-3.3a1.6 1.6 0 0 1 1.7-1.5h.1c7.9.3 16.3-1 24.7-4.2a56 56 0 0 0 34.3-31.4v-.3c.5-1 1.4-1.5 2.3-1.5z" fill="#000000" stroke="none" /><g class="glasses"><path d="M171.4 150.8v-9h137.2v9z" fill="#000000" stroke="none" /><path d="M175.7 155.5v-6h57.5v6z" fill="#000000" stroke="none" /><path d="M179.8 160v-9h48.9v9z" fill="#000000" stroke="none" /><path d="M184 164.5v-9h44.7v9z" fill="#000000" stroke="none" /><path d="M188.6 168.6v-7h31.7v7z" fill="#000000" stroke="none" /><path d="M245.9 155.5v-6h57.4v6z" fill="#000000" stroke="none" /><path d="M250 160v-9h48.8v9z" fill="#000000" stroke="none" /><path d="M254 164.5v-9h41v9z" fill="#000000" stroke="none" /><path d="M258.8 168.6v-7h31.6v7z" fill="#000000" stroke="none" /><path d="M184.5 155.1v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M188.8 159.2V155h4.5v4.3z" fill="#fff" stroke="none" /><path d="M193.3 163.5v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M193.3 155.1v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M197.6 159.2V155h4.5v4.3z" fill="#fff" stroke="none" /><path d="M202.1 163.5v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M254.8 155.1v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M259.1 159.2V155h4.5v4.3z" fill="#fff" stroke="none" /><path d="M263.6 163.5v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M263.6 155.1v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M268 159.2V155h4.4v4.3z" fill="#fff" stroke="none" /><path d="M272.4 163.5v-4.3h4.5v4.3z" fill="#fff" stroke="none" /></g></g></g></svg>')
            : '') + '<p>' + (internalServerError ? 'Interne fout' : '') + '</p></h1>');
        if (get("bools").charAt(7) == "1") {
            tryRemove(id('inbox-counter'));
        }
        if (!n(get("background"))) {
            id('somtoday-mod').insertAdjacentHTML('afterbegin', '<img id="background-img" src="' + get("background") + '">');
        }
    }

    // Show new icons (and tags if enabled) in menu
    function menuIcons() {
        let tags = ["", "", "", "", "", "", ""];
        let showtag = "";
        if (get("bools").charAt(1) == "1") {
            id('main-menu-wrapper').classList.add('tag');
            showtag = " tag";
            tags = ["<p>Nieuws</p>", "<p>Rooster</p>", "<p>Huiswerk</p>", "<p>Cijfers</p>", "<p>Vakken</p>", "<p>Afwezigheid</p>", "<p>Leermiddelen</p>"];
        }
        const classname = "famenu" + showtag;
        // Change menu icons, can be removed if you want to show the old icons
        setHTML(id('news'), getIcon("newspaper", classname, colors[2]) + tags[0]);
        setHTML(id('roster'), getIcon("calendar-days", classname, colors[2]) + tags[1]);
        setHTML(id('homework'), getIcon("pencil", classname, colors[2]) + tags[2]);
        setHTML(id('grades'), getIcon("clipboard-check", classname, colors[2]) + tags[3]);
        setHTML(id('subjects'), getIcon("book", classname, colors[2]) + tags[4]);
        setHTML(id('absence'), getIcon("user-clock", classname, colors[2]) + tags[5]);
        setHTML(id('leermiddelen'), getIcon("book-bookmark", classname, colors[2]) + tags[6]);
    }

    // Insert CSS into page. The various topics are not strictly adhered to.
    function style() {
        // Fonts thanks to Google Fonts: https://fonts.google.com/
        const layout = get('layout');
        const zoom = get('zoom');
        // Menu
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>@import url("https://fonts.googleapis.com/css2?family=Abhaya+Libre&family=Aleo&family=Archivo&family=Assistant&family=B612&family=Bebas+Neue&family=Black+Ops+One&family=Brawler&family=Cabin&family=Caladea&family=Cardo&family=Chivo&family=Crimson+Text&family=DM+Serif+Text&family=Enriqueta&family=Fira+Sans&family=Frank+Ruhl+Libre&family=Gabarito&family=Gelasio&family=IBM+Plex+Sans&family=Inconsolata&family=Inter&family=Josefin+Sans&family=Kanit&family=Karla&family=Lato&family=Libre+Baskerville&family=Libre+Franklin&family=Lora&family=Merriweather&family=Montserrat&family=Neuton&family=Noto+Serif&family=Nunito&family=Open+Sans&family=Oswald&family=Permanent+Marker&family=PT+Sans&family=PT+Serif&family=Playfair+Display:ital@1&family=Poppins&family=Poetsen+One&family=Quicksand&family=Raleway&family=Roboto&family=Roboto+Slab&family=Rubik&family=Rubik+Doodle+Shadow&family=Sedan+SC&family=Shadows+Into+Light&family=Single+Day&family=Source+Sans+3&family=Source+Serif+4:opsz@8..60&family=Spectral&family=Titillium+Web&family=Ubuntu&family=Work+Sans&display=swap");*,.ui-widget input,.ui-widget select,.ui-widget textarea,.ui-widget button,textarea{font-family:"' + get("fontname") + '","Open Sans","SOMFont",sans-serif;' + ((get("fontname") == "Bebas Neue" || get("fontname") == "Oswald") ? "letter-spacing:1px;" :"") + ' }#background-image-overlay{pointer-events:none;-webkit-user-select:none;user-select:none;z-index:-1;' + (layout == 1 ? 'min-height:calc(100vh - 180px);width:70%;left:15%;top:160px;position:absolute;background:' + colors[8] + ';height:' + ((n(id('master-panel')) || n(id('detail-panel-wrapper'))) ? '' : Math.max(id('master-panel').clientHeight,id('detail-panel-wrapper').clientHeight)) + 'px;' :(layout == 4 ? 'width:100%;left:0;top:0;position:fixed;background:' + colors[8] + ';height:100%;' :'')) + ' }#main-menu-wrapper{z-index:998;overflow:hidden;padding:0px;background:' + colors[0] + ';' + ((layout == 1 || layout == 4) ? 'position:absolute;left:0;top:80px;height:80px;' :'position:fixed;top:0;height:100%;width:120px;max-width:14vw;') + (layout == 1 ? 'width:70%;border-top-left-radius:16px;border-top-right-radius:16px;margin-left:15%;' :(layout == 2 ? 'left:0;' :(layout == 3 ? 'right:0;' :'width:100%;'))) + '}h1 > #logo{height:35px;width:35px;margin-left:-50px;margin-top:-5px;position:absolute;}center > #logo{height:min(11vw,8vh);width:50%;padding:10px 0;}#main-menu{width:100%;height:100%;' + ((layout == 2 || layout == 3) ? 'overflow-y:auto;' : '') + '}#main-menu div a{border-radius:0;background:transparent;color:white;max-height:14vw;' + ((layout == 2 || layout == 3) ? 'width:100%;height:' + (id('main-menu').getElementsByTagName('a').length > 8 ? '95px' :'100px;') :(layout == 1 ? 'width:140px;height:80px;' :'width:150px;height:80px;')) + ' padding:0;margin:0;transition:background 0.3s ease;display:inline-block;}#main-menu div a svg{transition:transform 0.3s ease;}#main-menu div a.active svg,#main-menu div a:hover svg{transform:scale(1.1);}#main-menu div a.active,#main-menu div a:hover,#main-menu div a:focus{background:' + ((layout == 1 || layout == 4) ? colors[1] :(layout == 2 ? 'linear-gradient(-90deg,' + colors[0] + ' 0%,' + colors[1] + ' 40%,' + colors[1] + ' 100%)' :'linear-gradient(90deg,' + colors[0] + ' 0%,' + colors[1] + ' 40%,' + colors[1] + ' 100%)')) + ' !important;color:white !important;}div.profile-img{background:' + colors[1] + ';}.profile-img{line-height:50px;border-radius:50%;overflow:hidden;-webkit-user-select:none;user-select:none;object-fit:cover;color:' + colors[2] + ';width:50px;height:50px;font-size:' + (Math.min(55/(n(initials) ? '' : initials).length, 25)).toString() + 'px;text-align:center;font-weight:700;}.profile-img-menu{z-index:10000;position:absolute;right:' + (layout == 1 ? 'calc(15% + 30px)' :'40px') + ';top:13px;}.profile-img-menu div{transition:filter 0.2s ease,background 0.2s ease,color 0.2s ease;}.topmenusvg{height:30px;width:30px;position:absolute;top:23px;}.topmenusvg svg{width:100%;height:100%;transition:filter 0.2s ease;}#header-wrapper{visibility:hidden;}#user{box-sizing:border-box;' + (layout == 1 ? '' :'border-bottom:3px solid ' + colors[4]) + ';' + ((layout == 1 || layout == 4) ? 'width:100%;margin-left:0;' :(layout == 2 ? 'margin-left:min(14vw,120px);width:calc(100% - min(14vw,120px));' :'margin-right:min(14vw,120px);margin-left:0;width:calc(100% - min(14vw,120px));')) + ' visibility:visible;position:' + (get("bools").charAt(3) == "0" ? "absolute" :"fixed") + ';top:' + ((layout == 1 && get('bools').charAt(3) == "0") ? '-20px' :'0') + ';left:0;z-index:1000;background:' + colors[12] + ';height:80px;}#user a{opacity:1 !important;}#user a:hover div#profile-img,div#profile-img:hover,#user a:focus div#profile-img{background:' + colors[7] + ';color:white;}#user a:hover img, #user a:hover svg,#user a:focus svg{filter:brightness(140%);}#user img:first-child{display:none;}#page-title{position:absolute;left:' + (layout == 1 ? 'calc(15% + 70px)' :(layout == 4 ? '80px' :'35px')) + ';top:25px;}#inbox-counter{position:absolute;right:' + (layout == 1 ? 'calc(15% + 130px)' :'140px') + ';top:0;z-index:100000;width:fit-content !important;height:unset !important;min-width:24px;}#main-menu-wrapper label.MainMenuIcons:before{width:100%;font-size:26px;text-align:center;}.famenu,#main-menu-wrapper label.MainMenuIcons{display:block;width:100%;height:35%;padding-top:' + ((get("bools").charAt(1) == "0" && layout == 1) ? '23px' :((get("bools").charAt(1) == "0" && layout == 4) ? '23px' :'26%')) + ';}.famenu.tag,#main-menu-wrapper.tag label.MainMenuIcons{padding-top:' + ((layout == 1 || layout == 4) ? '15px' :'16%') + ';}#main-menu p,#main-menu q{font-size:15px;font-weight:700;width:calc(100% - 4px);padding:10px 2px;text-align:center;color:' + colors[2] + ';word-wrap:break-word;}</style>');
        // Calendar
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>#calendar,#calendar *{box-sizing:border-box;}ul{list-style-type:none;}#calendar{position:absolute;top:0;right:0;' + ((layout == 1 || layout == 4) ? 'padding-top:' + (Math.round(66 / (zoom / 100))).toString() + 'px;padding-left:20px;' :'padding-left:15%;') + ' height:calc((100vh - 80px) / ' + (zoom / 100) + ');max-width:600px;z-index:1000;width:100%;background:' + (layout == 1 ? 'transparent;border-top-right-radius:16px' :'linear-gradient(to right,rgba(0,0,0,0),' + colors[3] + ' 20%)') + ';-webkit-user-select:none;user-select:none;}.month{padding:25px 40px;width:100%;}.month ul{position:relative;margin:0;padding:0;}.month ul li{margin:0 5px;display:inline-block;color:' + colors[6] + ';font-size:20px;text-transform:uppercase;letter-spacing:3px;float:left;}#month{padding-left:15px;}#month,#year{padding-top:8px;}#weekdays{margin-top:40px;margin-bottom:0;padding:25px 40px;}#weekdays li{color:' + colors[11] + ';display:inline-block;text-align:center;}#days{padding:40px;margin:0;}#days li{position:relative;list-style-type:none;text-align:center;font-size:16px;color:' + colors[9] + ';aspect-ratio:1 / 1;padding-top:calc(50% - 18px);margin:8px;border-radius:50%;cursor:pointer;transition:0.2s background ease;}#days li:hover,#days li.selected{background:' + colors[5] + ';}#days li.empty{border:none;cursor:default;}#days li.active{background:' + colors[6] + ';color:white !important;font-weight:700;}#days li:after{content:"";position:absolute;display:none;border-radius:50%;margin-left:37.5%;margin-top:10%;width:25%;height:25%;}#days li.green:after{display:block;background:#39c380;}#days li.orange:after{display:block;background:#e8ad1c;}#days li.red:after{display:block;background:#f56558;}#days,#weekdays{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr 1fr;grid-template-rows:1fr;}.empty{background:none !important;}@media all and (max-width:1300px){#content-wrapper:has(.stpanel--status){' + (layout == 2 ? 'padding-left: 12vw;' : (layout == 3 ? 'padding-right: 12vw;' : '')) + '}#calendar{padding-left:5%;background:linear-gradient(to right,rgba(0,0,0,0),' + colors[3] + ' 15%);}#days li{margin:15px 2px;padding-top:6px;}}' + ((layout == 2 || layout == 3) ? '#detail-panel-wrapper:has(#calendar){overflow:visible !important;}' : '') + '</style>');
        // Media queries
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>' + (layout == 1 ? '@media (max-width:1440px){#page-title{left:calc(7.5% + 70px);}.profile-img-menu{right:calc(7.5% + 30px);}a.logout-btn{right:calc(7.5% + 170px);}a.messages-btn{right:calc(7.5% + 110px);}#inbox-counter{right:calc(7.5% + 130px);}.bericht .r-content{max-width:calc(100% - 55px) !important;}.msgdetails1 > .pasfoto{width:40px !important;height:40px !important;margin-right:10px !important;line-height:38px;font-size:20px;}div#master-panel:has(.profileMaster){width:calc(85% / ' + (zoom / 100) + ' - 235px) !important;}div#master-panel:has(.roosterMaster){width:calc(85% / ' + (zoom / 100) + ') !important;}#somtoday-mod > div#modactions{right:7.5%;}#main-menu-wrapper{margin-left:7.5% !important;width:85% !important;}#master-panel{left:7.5% !important;width:' + (48 / (zoom / 100)) + '% !important;}#detail-panel-wrapper{width:calc(' + (35 / (zoom / 100)) + '% - 15px) !important;right:7.5% !important;}#background-image-overlay{left:7.5% !important;width:85% !important;}}' :'') + ((layout == 2 || layout == 3) ? '@media (max-height:890px){#main-menu div a{height:90px;margin:0 !important;}.famenu{padding-top:22%;}.famenu.tag{padding-top:13%;}}@media (max-height:790px){#main-menu div a{height:80px;}.famenu{padding-top:20%;}.famenu.tag{padding-top:10%;}}@media (max-height:700px){#main-menu div a{height:70px;}.famenu{padding-top:17%;}.famenu.tag{padding-top:7%;}}@media (max-height:570px){#main-menu div a{height:60px;}.famenu{padding-top:14%;}.famenu.tag{padding-top:5%;}}' : '' ) + '@media (max-width:875px){.truncate.afspraak div.toekenning.truncate{padding:0;margin-top:42px;}div.truncate.afspraak{margin:0 2px;}a.afspraak-link.inline{padding:7px;width:calc(100% - 15px);height:calc(100% - 14px);}#main-menu p{font-size:14px;}}@media (max-width:700px){div.layout-container{width:calc(50% - 16px);height:unset;aspect-ratio:1.3 / 1;}div.theme img{height:100px;}div.theme h3{font-size:0;margin-left:0;}.theme h3 svg{height:15px;}div.theme{width:calc(50% - 20px);}#main-menu p{font-size:12px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;}}@media (max-width:600px){#modsettings #modsettings-inner{padding:calc(10px / ' + (zoom / 100) + ') calc(20px / ' + (zoom / 100) + ');height:calc((100% - 20px) /' + (zoom / 100) + ');max-width:calc((100% - 40px) /' + (zoom / 100) + ');}.layout-container div span{display:none;}#main-menu div a{margin:' + ((layout == 4 || layout == 1) ? '0' :'8px 0') + ';}}@media (max-width:500px){.profielTblData .twopartfields > span,.twopartfields input{max-width:100px !important;}#page-title p{max-width:calc(100vw - 280px);overflow:hidden; height:30px;}label.switch{margin:-8px 0;margin-left:5px;}div#modactions a{margin-bottom:0;}span#inbox-counter{right:115px;}div a.menuitem svg{margin-left:-35px;}div a.menuitem{padding-left:20px;font-size:15px;margin-right:0;}div#modsettings > div > p{max-width:100%;}#modsettings > div:has(.switch) p{width:calc(100% - 55px) !important;}div div#master-panel:has(.profileMaster){width:' + ((layout == 1 || layout == 4) ? 'calc(100% / ' + (zoom / 100) + ' - 40px)' :'calc((100% - min(14vw,120px)) / ' + (zoom / 100) + ' - 30px)') + ' !important;}.profileMaster div#modsettings{padding:5px 25px}#somtoday-mod > div#modactions{width:30px!important;}#theme-wrapper,#layout-wrapper{width:calc(100% + 58px);}#somtoday-mod > #modactions .button-silver-deluxe span{padding:15px 20px;margin-left:-8px;border-radius:6px;}.toekenning.truncate .icon-huiswerk svg,.toekenning.truncate .icon-toets svg,.toekenning.truncate .icon-grote-toets svg{display:none}.toekenning.truncate .icon-huiswerk,.toekenning.truncate .icon-toets,.toekenning.truncate .icon-grote-toets{width:10px;height:10px;margin-left:0;}.toekenning.truncate{padding:3px !important;}.roster-table-header .day .huiswerk-items{padding-left:0;}.weekitems.eerste-kolom{margin-left:-4px;margin-top:10px;}.hours.eerste-kolom,.day.filler.eerste-kolom{display:none}.day{height:1130px;}div.roster-table{padding:5px;width:calc(100% - 10px);}' + (layout == 1 ? '' :'#inbox-counter{right:120px;}') + ' .profile-img-menu{-webkit-user-select:none;user-select:none;right:25px !important;}a.logout-btn{right:145px !important;}a.messages-btn{right:95px !important;}#page-title{left: ' + (layout == 2 ? '20px' : '10px') + ';}}@media (max-width:1024px){#content-wrapper.is-opendetailpanel #detail-panel-wrapper{top:80px;}}@media (max-width:380px){#page-title p{display:none;}}@media (max-height:600px) and (min-width:1020px){#somtoday-mod > div#modactions{position:absolute;height:fit-content;}}@media (max-height:550px) and (max-width:1020px){#somtoday-mod > div#modactions{position:absolute;border-left:none;}#somtoday-mod > div#modactions a{margin-right:0;}#somtoday-mod > div#modactions .button-silver-deluxe span{overflow:hidden;padding-left:0;width:30px;}}@media (max-width:1020px){.close-detailpanel{right:-5px !important;z-index:1;}.berichtenDetail .close-detailpanel,.activityDetail .close-detailpanel,.homeworkDetail .close-detailpanel{right:20px !important;}.homeworkDetail .blue.ribbon p{transform:translate(-35px,-13px);}.bericht .r-content{max-width:calc(100% - 110px) !important;}#header{margin-left:0;margin-right:0;}div#master-panel:has(.profileMaster){width:' + ((layout == 1 || layout == 4) ? 'calc(100% / ' + (zoom / 100) + ' - 60px)' :'calc((100% - min(14vw,120px)) / ' + (zoom / 100) + ' - 60px)') + ' !important;padding-right:0;}' + (layout == 1 ? 'body div#master-panel:has(.roosterMaster){width:calc(100% / ' + (zoom / 100) + ') !important;}' :'') + ' .roosterMaster .uurNummer{margin-left:0;}.hour.pauze{visibility:hidden;}' + (layout == 1 ? '.profile-img-menu{-webkit-user-select:none;user-select:none;right:50px;}a.logout-btn{right:170px;}a.messages-btn{right:120px;}#page-title{left:80px;}#inbox-counter{right:140px;}' :'') + ' #header .right{position:static;}#master-panel .date div p.date-day{margin-left:0;}.weekitems.eerste-kolom{margin-bottom:50px;}body #master-panel,body.roster #master-panel{left:' + (layout == 2 ? 'min(120px,14vw)' :'0') + ' !important;width:' + ((layout == 4 || layout == 1) ? 'calc((100% / ' + (zoom / 100) + '))' :'calc((100% - min(120px,14vw)) / ' + (zoom / 100) + ')') + ' !important;}#background-image-overlay{left:0 !important;width:100% !important;}' + (layout == 1 ? '#main-menu-wrapper{width:100% !important;margin-left:0 !important;}':'') + ' #content-wrapper #detail-panel-wrapper,#content-wrapper.is-opendetailpanel #master-panel{display:none !important;}#content-wrapper.is-opendetailpanel #detail-panel-wrapper,#content-wrapper #master-panel{display:block !important;top:' + ((layout == 4 || layout == 1) ? '160px' :'80px') + ' !important;}#content-wrapper.is-opendetailpanel #detail-panel{padding-top:20px;box-sizing:border-box;}.box.msgdetails2{margin-right:0;}.leermiddelen #content-wrapper.is-opendetailpanel #detail-panel-wrapper{min-height:60px;opacity:1 !important;}#content-wrapper.is-opendetailpanel #detail-panel-wrapper{overflow:hidden !important;height:fit-content;display:block;position:absolute;top:80px;z-index:10;width:calc((100% ' + ((layout == 4 || layout == 1) ? '' :'- min(120px,14vw)') + ') / ' + (zoom / 100) + ' - 30px) !important;' + ((layout == 2 || layout == 3) ? (layout == 3 ? 'right' :'left') + ':min(120px,14vw)' :'left:0') + ' !important;transform-origin:top left !important;right:0;padding:0 15px;}}@media all and (max-width:1700px){' + ((layout == 4 || layout == 1) ? '#main-menu div a{width:' + (100 / id('main-menu').getElementsByTagName('a').length) + '% !important;max-height:80px !important;}' :'') + ' .homeworkDetail .blue.ribbon p{visibility:hidden;}.homeworkDetail .blue.ribbon p a{visibility:visible;}}.logout-btn{right:' + (layout == 1 ? 'calc(15% + 170px)' :'180px') + ';}.messages-btn{right:' + (layout == 1 ? 'calc(15% + 110px)' :'120px') + ';}ul li label{color:' + colors[7] + ';font-size:14px;padding:5px;}input[type=text],input[type=number],#mod-message textarea{background:none;max-width:calc(100% - 24px);background:' + colors[12] + ';border:2px solid ' + colors[4] + ';color:' + colors[11] + ';transition:border 0.2s ease;border-radius:14px;padding:5px 10px;}input[type=text]:focus,input[type=number]:focus,#mod-message textarea:focus{outline:none;border:2px solid ' + colors[7] + ';}</style>');
        // Somtoday popups (roster popup and link popup)
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>.fancybox-close,.ui-dialog .ui-dialog-titlebar-close{background:' + colors[0] + ';border-radius:50%;transition:0.2s background ease;animation:0.2s closebtnopacity ease;border:none;width:36px;height:36px;z-index:1000;overflow:hidden;}@keyframes closebtnopacity{0%{opacity:0;transform:scale(0);}100%{opacity:1;transform:scale(1);}}' + (layout == 1 ? '.ui-dialog{transform:translateY(-20px);}' :'') + '.ui-dialog .ui-dialog-titlebar-close{margin-right:-20px;margin-top:-35px;}.fancybox-close:hover,.ui-dialog .ui-dialog-titlebar-close:hover{background:' + colors[1] + ';}.ui-icon.ui-icon-closethick{background-image:unset !important;position:relative;margin-top:-3px;margin-left:0;display:block;top:0;left:0;width:100%;height:100%;text-indent:0;}.fancybox-close:before,.ui-icon-closethick:before{content:"\u00D7";display:block;color:white;font-size:30px;margin:2px 8px;transition:transform 0.2s ease;}.fancybox-close:hover:before,.ui-dialog .ui-dialog-titlebar-close:hover .ui-icon-closethick:before{transform:scale(0.8);}.fancybox-wrap{overflow:visible !important;}.fancybox-skin,.box{background:' + colors[12] + ';padding:15px 20px !important;border-radius:12px;}.fancybox-skin{padding-right:0 !important;transition:0.3s box-shadow ease;box-shadow:' + (get('bools').charAt(0) == "1" ? '0 0 50px #555' :'0 0 50px #aaa') + ' !important;}.fancybox-skin *,.box *{color:' + colors[11] + ' !important;word-wrap:break-word;} .fancybox-inner,.fancybox-skin{width:665px !important;max-width:100%;}.fancybox-skin{max-width:calc(100% - 25px);}.fancybox-overlay{overflow:hidden !important;background:rgba(0,0,0,0.3);} .ui-widget.ui-widget-content,.ui-widget.ui-widget-content fieldset,fieldset input{color:' + colors[11] + ';border:none;}fieldset legend{margin-left:-2px;font-size:16px;font-weight:700;}fieldset label:last-of-type{display:none;}fieldset{border:none;padding-bottom:20px;}fieldset label input{margin-top:5px;}fieldset label{margin-top:10px;display:block;}fieldset input[type=submit],fieldset input[type=reset]{font-weight:700;cursor:pointer;padding-top:15px;background:none;}</style>');
        // Icon animations
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>.mod-user-scale{animation:0.6s usericonscale 0.2s ease;}@keyframes usericonscale{0%{transform:scale(1);}50%{transform:scale(1.1);}100%{transform:scale(1);}}a:hover .mod-feedback-bounce{animation:0.6s feedbackbounce 0.2s ease;}@keyframes feedbackbounce{0%,20%,50%,80%,100%{transform:translateY(0);}40%{transform:translateY(-8px);}60%{transform:translateY(-4px);}}a:hover .mod-save-shake{animation:0.6s saveshake 0.2s ease;}@keyframes saveshake{0%{transform:rotate(0deg);}25%{transform:rotate(15deg);}50%{transform:rotate(0eg);}75%{transform:rotate(-15deg);}100%{transform:rotate(0deg);}}a:hover .mod-bug-scale{animation:0.6s bugscale 0.2s ease;}@keyframes bugscale{0%{opacity:0;transform:scale(.3);}50%{opacity:1;transform:scale(1.05);}70%{transform:scale(.9);}100%{transform:scale(1);}}a:hover .mod-info-wobble{animation:0.6s infowobble 0.2s ease;}@keyframes infowobble{from,to{transform:scale(1,1);}25%{transform:scale(0.8,1.2);}50%{transform:scale(1.2,0.8);}75%{transform:scale(0.9,1.1);}}a:hover .mod-update-rotate{animation:0.8s updaterotate 0.2s ease;}@keyframes updaterotate{0%{transform:rotateY(0deg);}100%{transform:rotateY(360deg);}}a:hover .mod-reset-rotate{animation:0.8s resetrotate 0.2s ease;}@keyframes resetrotate{0%{transform:rotate(360deg);}100%{transform:rotate(0deg);}}.mod-gear-rotate{animation:0.8s gearrotate 0.2s ease;}@keyframes gearrotate{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>');
        // Input type range
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>input[type="range"]{-webkit-appearance:none;appearance:none;background:transparent;cursor:pointer;width:15rem;margin-bottom:10px;margin-top:12px;max-width:100%;}input[type="range"]:focus{outline:none;}input[type="range"]::-webkit-slider-runnable-track{background-color:' + colors[14] + ';border-radius:0.5rem;height:0.5rem;}input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;margin-top:-4px;border-radius:50%;background-color:' + colors[15] + ';height:1rem;width:1rem;}input[type="range"]:focus::-webkit-slider-thumb{border:none;outline:3px solid ' + colors[15] + ';outline-offset:0.125rem;}input[type="range"]::-moz-range-track{background-color:' + colors[14] + ';border-radius:0.5rem;height:0.5rem;}input[type="range"]::-moz-range-thumb{border:none;border-radius:50%;background-color:' + colors[15] + ';height:1rem;width:1rem;}input[type="range"]:focus::-moz-range-thumb{border:none;outline:3px solid ' + colors[1] + ';outline-offset:0.125rem;}</style>');
        // Input type checkbox
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>.switch{display:inline-block;height:25px;position:relative;vertical-align:top;width:50px;margin:-8px 15px;}.switch input{display:none !important;}.slider{background-color:' + colors[5] + ';bottom:-1px;cursor:pointer;left:0;position:absolute;right:0;top:1px;transition:background .2s;}.slider:before{background-color:#fff;bottom:4px;content:"";height:17px;left:4px;position:absolute;transition:.2s;width:17px;}input:checked + .slider{background-color:' + colors[7] + ';}input:checked + .slider:before{transform:translateX(26px);}.slider.round{border-radius:34px;margin-bottom:0 !important;}.slider.round:before{border-radius:50%;}</style>');
        // Custom select
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>.custom-select-mod{position:relative;font-family:Arial;}.custom-select-mod select{display:none;}.select-selected{border-radius:6px;border:2px solid ' + colors[4] + ' !important;background-color:' + colors[12] + ';}.select-selected:after{position:absolute;content:"";top:14px;right:10px;width:0;height:0;border:6px solid transparent;border-color:' + colors[11] + ' transparent transparent transparent;}.select-selected.select-arrow-active:after{border-color:transparent transparent ' + colors[11] + ' transparent;top:7px;}.select-items div,.select-selected{color:' + colors[11] + ' !important;letter-spacing:normal;padding:8px 16px;border:1px solid transparent;margin-bottom:0 !important;border-color:transparent transparent rgba(0,0,0,0.1) transparent;cursor:pointer;-webkit-user-select:none;user-select:none;}.select-items{max-height:400px;position:absolute;background-color:' + colors[12] + ';color:' + colors[11] + ';top:calc(100% + 10px);left:-2px;width:calc(100% + 2px);right:0;z-index:99;border-radius:8px;overflow:hidden;overflow-y:auto;border-radius:6px;box-shadow:0 0 30px ' + colors[8] + ', 0 0 30px ' + colors[8] + ';}.select-items::-webkit-scrollbar{width:10px;background:transparent;}.select-items::-webkit-scrollbar-track{border-radius:6px;background: transparent;}.select-items::-webkit-scrollbar-thumb{background:' + colors[4] + ';border-radius: 6px;}.select-items::-webkit-scrollbar-thumb:hover{background:' + colors[15] + ';}.select-items div:last-of-type{border:2px solid transparent;}.select-hide{display:none;}.select-items div:hover,.same-as-selected{background-color:rgba(0,0,0,0.1);}</style>');
        // New message at message page
        tn("head", 0).insertAdjacentHTML('beforeend', '<style>#new-toolbar{width:100%;pointer-events:none;position:absolute;}#new-toolbar svg{display:inline-block;height:15px;width:15px;padding:7.5px 7.5px;}#new-toolbar div{display:inline-block;width:10px;}div.wysiwyg.wysiwyg ul.toolbar li{padding:0;margin:0;float:unset;display:inline-block;background:none;border:none;height:30px;width:30px;vertical-align:middle;}.NewMessageDetail .invoerVeld table{width:100% !important;}.NewMessageDetail .invoerVeld table div.wysiwyg.wysiwyg ul.toolbar,.form-ouderavond .invoerVeld table div.wysiwyg.wysiwyg ul.toolbar{height:fit-content;padding:0;}div.wysiwyg.wysiwyg ul.toolbar li:hover,div.wysiwyg.wysiwyg ul.toolbar li.active{border:none;height:30px;width:30px;}div.wysiwyg.wysiwyg ul.toolbar li:hover{background:' + colors[3] + ' !important;}div.wysiwyg.wysiwyg ul.toolbar li.separator{border-radius:0;border:none;width:10px;padding:0;height:25px;margin:0;pointer-events:none;}.NewMessageDetail .invoerVeld table div.wysiwyg{position:relative;background:' + colors[12] + ' !important;}.NewMessageDetail .invoerVeld.textinhoud{background:none;border:none;width:100%;}div.wysiwyg.wysiwyg div.toolbar-wrap{border-bottom:2px solid ' + colors[4] + ';}.NewMessageDetail .invoerVeld table div.wysiwyg.wysiwyg iframe,div.wysiwyg>textarea{padding:10px 15px;}div.wysiwyg.wysiwyg ul.toolbar li.disabled{background:' + colors[12] + ' !important;opacity:0.7 !important;}div.wysiwyg:not(.ui-resizable)::before{content:"Je bekijkt nu de HTML-code voor je bericht." !important;bottom:5px;right:10px;display:block !important;font-size:10px;position:absolute !important;}#iddad{/*padding:2px 5px;*/ font-size:15px;font-family:Arial,Verdana,Helvetica,"Arial Unicode MS",sans-serif;}</style>');
        // Mod message style
        tn("head", 0).insertAdjacentHTML('beforeend', '<style>#mod-message input,div#mod-message textarea{display:block;width:100%;max-width:100%;padding:20px;font-size:14px;margin:10px 0;}div#mod-message textarea{height:300px;padding:12px 20px;}#mod-message .mod-message-button:focus{border:4px solid ' + colors[13] + ';}#mod-message .mod-message-button.mod-button-discouraged:focus{border:4px solid darkred !important;}#mod-message .mod-message-button.mod-button-discouraged{background:' + colors[12] + ' !important; color:red !important; border:4px solid red !important;}#mod-message .mod-message-button{-webkit-user-select:none;user-select:none;text-decoration:none;font-size:14px;padding:12px 24px;border:4px solid ' + colors[0] + ';background:' + colors[0] + ';border-radius:8px;margin-top:10px;margin-right:10px;display:inline-block;color:' + colors[2] + ';}#mod-message a{text-decoration:underline;}#mod-message p,#mod-message h3{font-size:14px;margin-bottom:10px;line-height:17px;}#mod-message h2{font-size:18px;margin-bottom:20px;}#mod-message > center{position:absolute;width:100%;top:-300px;animation:0.4s modmessageslidein ease 0.15s forwards;opacity:0;}@keyframes modmessageslidein{0%{top:-300px;opacity:0;}50%{opacity:1;}100%{top:0;opacity:1;}}#mod-message > center > div{background:' + colors[12] + ';box-shadow:' + (get('bools').charAt(0) == "1" ? '0 0 50px #555' :'0 0 50px #aaa') + ';width:500px;max-width:calc(100% - 16px);border-bottom-left-radius:16px;border-bottom-right-radius:16px;text-align:left;padding:20px 30px;box-sizing:border-box;}#mod-message,#mod-message *{box-sizing:border-box;}#mod-message{position:fixed;top:0;left:0;width:100%;height:100%;opacity:0;z-index:100000;background:' + (get('bools').charAt(0) == '1' ? 'rgba(0,0,0,0.4)' :'rgba(0,0,0,0.1)') + ';box-sizing:border-box;transition:opacity .2s ease;}#mod-message.mod-msg-open{opacity:1;animation:0.2s modmessagebackground ease forwards;}@keyframes modmessagebackground{0%{background:rgba(0,0,0,0);}100%{background:' + (get('bools').charAt(0) == '1' ? 'rgba(0,0,0,0.4)' :'rgba(0,0,0,0.1)') + ';}}</style>');
        // Mod tooltip - imitates Somtoday tooltips
        tn("head", 0).insertAdjacentHTML('beforeend', '<style>.mod-tooltip-active{opacity:1;}.mod-tooltip{opacity:0;}.mod-tooltip,.mod-tooltip-active{transition:opacity 0.6s ease;z-index:1000;background:' + colors[12] + ';display:block;position:absolute;font-size:1.1em;pointer-events:none;padding:8px;color:' + colors[11] + ';border-radius:4px;max-width:min(500px,70%);}</style>');
        // Modsettings
        tn("head", 0).insertAdjacentHTML('beforeend', '<style>.layout-container.layout-selected,.layout-container:hover{border:3px solid ' + colors[1] + ';}.layout-container{display:inline-block;vertical-align:top;margin-left:10px;margin-bottom:50px !important;width:180px;height:130px;background:' + colors[12] + ';border:3px solid ' + colors[12] + ';border-radius:16px;position:relative;cursor:pointer;transition:border 0.2s ease;box-shadow:2px 2px 20px ' + (get('bools').charAt(0) == "1" ? '#555' :'#ddd') + ';}.layout-container div span{position:absolute;transform:translate(-50%,-50%);top:50%;left:50%;}.layout-container h3{bottom:-40px;width:100%;position:absolute;text-align:center;}.layout-container div{-webkit-user-select:none;user-select:none;background:' + colors[5] + ';border-radius:6px;position:absolute;}.example-box-wrapper{background:' + colors[12] + ';border:3px solid ' + colors[4] + ';width:500px;padding:10px 20px;border-radius:12px;overflow:hidden;max-width:calc(100% - 50px);margin-top:-10px;}.example-box-wrapper > div{transform-origin:top left;}#theme-wrapper,#layout-wrapper{width:calc(100% + 18px);margin-left:-5px;}#layout-wrapper{margin-left:-15px;}.theme{display:inline-block;cursor:pointer;width:190px;margin-bottom:10px !important;margin-left:5px;overflow:hidden;background:' + colors[12] + ';border:3px solid ' + colors[12] + ';border-radius:16px;transition:.3s border ease,.2s background ease;box-shadow:2px 2px 10px ' + (get('bools').charAt(0) == "1" ? '#555' :'#ddd') + ';}.theme:hover,.theme.theme-selected,.theme.theme-selected-set{border:3px solid ' + colors[5] + ';}.theme.theme-selected,.theme.theme-selected-set{background:' + colors[5] + ';}.theme img{width:100%;height:175px;object-fit:cover;background:' + colors[12] + ';}.theme h3{margin:10px 15px;}.theme h3 div{display:inline-block;height:12px;width:12px;border-radius:50%;position:absolute;margin:5px 10px;}.theme h3 svg{display:inline-block;position:absolute;margin:3px 30px;}.profileMaster #modsettings{padding:5px 35px;margin-top:-70px;}#modsettings.mod-setting-popup{position:fixed;top:0;left:0;height:100%;width:100%;background:rgba(0,0,0,0.3);z-index:1000;}#modsettings.mod-setting-popup > div{transform-origin:top center;background:' + colors[12] + ';width:calc(1000px / ' + (zoom / 100) + ');max-width:calc((100% - 80px) / ' + (zoom / 100) + ');position:absolute;top:0;height:calc((100% - 40px) / ' + (zoom / 100) + ');overflow-x:hidden;overflow-y:auto;padding:calc(20px / ' + (zoom / 100) + ') calc(40px / ' + (zoom / 100) + ');left:50%;transform:translateX(-50%) scale(' + zoom + '%);}#somtoday-mod > #modactions{position:fixed;padding:20px;right:' + (layout == 3 ? 'min(120px,14vw)' :(layout == 1 ? '15%;border-image:linear-gradient(to top,' + colors[4] + ' 80%,rgba(0,0,0,0) 90%) 1 100%' :"0")) + ';top:0;padding-top:' + ((layout == 4 || layout == 1) ? (layout == 1 ? (Math.round(200 / (zoom / 100))).toString() + 'px' :(Math.round(190 / (zoom / 100))).toString() + 'px') :"100px") + ';height:100%;background:' + (layout == 1 ? 'transparent' :colors[12]) + ';border-left:3px solid ' + colors[4] + ';transform:scale(' + zoom + '%);transform-origin:top right;width:195px;}#modactions .button-silver-deluxe span{background:transparent;border:none;text-wrap:nowrap;}#modactions .button-silver-deluxe:hover span{background:' + colors[4] + ';}#modactions a{margin-right:10px;margin-bottom:10px;width:100%;}#modsettings-inner #modactions{margin:0 -10px;margin-bottom:-60px;}#modsettings-inner #modactions a{width:fit-content;}#modsettings h3.category{padding:10px;border-bottom:6px solid ' + colors[14] + ';border-radius:6px;font-size:20px;margin:20px -10px;margin-top:75px;}#modsettings div{margin-bottom:30px;}#modsettings input{margin-left:0;display:block;}#modsettings p{display:inline-block;}#modsettings > div > p{max-width:calc(100% - 100px);}#modsettings input[type="text"]{width:500px;}div.mod-button{margin-top:-20px;margin-bottom:20px !important;display:inline-block;margin-right:10px;}label.mod-file-label:hover,.mod-button:hover{border:2px solid ' + colors[5] + ';cursor:pointer;}.mod-file-label,.mod-button{-webkit-user-select:none;user-select:none;transition:0.2s border ease;background:' + colors[12] + ';display:block;width:fit-content;padding:10px 18px;border:2px solid ' + colors[7] + ';border-radius:12px;margin:5px 0;color:' + colors[7] + ';}label.mod-file-label.mod-active svg path{fill:white !important;}div.mod-button.mod-active,label.mod-file-label.mod-active{background:' + colors[7] + ';color:' + colors[12] + ';}.mod-file-label p{margin-left:10px;}input[type="file"].mod-file-input{display:none !important;}input[type="color"]{width:0;height:0;visibility:hidden;overflow:hidden;opacity:0;}.color{cursor:pointer;width:35px;height:35px;border-radius:50%;border:3px solid ' + colors[4] + ';display:inline-block;}</style>');
        // Miscellaneous
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>.ui-tooltip{pointer-events:none;' + (get("bools").charAt(8) == "1" ? "display:none !important;}" :" }") + (get("bools").charAt(9) == "0" ? 'html::-webkit-scrollbar{display:none;}html{scrollbar-width:none;' :'html{') + (layout == 1 ? ' position:relative;margin-top:20px;' :'') + ' scroll-padding-top:100px !important;scroll-padding-bottom:150px !important;background-color:' + colors[12] + ';}.custom-select{border:2px solid #f0f3f5;background:#fff;}.custom-select:hover{border:2px solid ' + colors[3] + ';}.custom-select:focus-within{outline:none !important;border:2px solid ' + colors[13] + ' !important;}.custom-select select{outline:none;}.afspraak-window .bold{margin-bottom:6px;}.ui-autocomplete{padding:0;margin:0;border-radius:16px;overflow:hidden;translate:200px 0 !important;}.inpQuickSearch{width:100% !important;}.inpQuickSearch input{width:100% !important;}.ui-menu .ui-menu-item .ui-menu-item-wrapper{padding:10px 15px;}.ui-state-active,.ui-widget-content .ui-state-active{background:' + colors[3] + ';color:' + colors[11] + ';border:none;padding:11px 16px !important;}.inleveropdracht-conversation-separator{border-top:none;}.leermiddelenDetail .panel-header .type{margin-top:-5px;}.jaarbijlagen .jaarbijlagen-header{margin-bottom:7px;margin-top:7px;padding-top:15px;}.jaarbijlagen .jaarbijlage-map .jaarbijlage-map-header,.jaarbijlagen .bijlagen-container .bijlagen-header{margin:0 -15px;padding:0 15px;}.jaarbijlagen .jaarbijlage .url{margin:-6px -10px;padding:6px 10px;}.jaarbijlagen .icon-chevron-right{margin-top:3px;}.jaarbijlagen .expanded .icon-chevron-right{margin-top:-5px;}.section>h3{border-top:none;border-bottom:0;margin-bottom:0;}.yellow.ribbon .d-next svg,.yellow.ribbon .d-prev svg,#mod-nextmonth svg,#mod-prevmonth svg,.yellow.ribbon .chk svg{transition:transform 0.3s ease;}.yellow.ribbon .d-next:hover svg,.yellow.ribbon .d-prev:hover svg,#mod-nextmonth:hover svg,#mod-prevmonth:hover svg,.yellow.ribbon .chk:hover svg{transform:scale(1.1);}.homeworkDetail .blue.ribbon p{margin-top:-5px;}.roosterMaster .hours .hour{width:100% !important;}.set .block .blocks{display:block;}.profileMaster{position:relative;}#master-panel:has(.profileMaster){width:calc((' + (layout == 1 ? 70 :100) + '% / ' + (zoom / 100) + ') - 238px' + ((layout == 2 || layout == 3) ? ' - (min(120px,14vw) / ' + (zoom / 100) + ')':'') + ') !important;}#master-panel:has(.roosterMaster){width:calc((' + (layout == 1 ? 70 :100) + '%' + ((layout == 2 || layout == 3) ? ' - min(120px,14vw)':'') + ') / ' + (zoom / 100) + ') !important;}.roosterMaster{width:100%;}.uurTijd,.pauzetijden{margin-left:65px;}.profileMaster h2.left-16{margin-left:26px;}.vakkenMaster .sub>span:first-of-type{display:inline;}.section.beschrijving .right{color:' + colors[6] + ';border:2px solid ' + colors[3] + ';background:' + colors[12] + ' !important;transition:border .3s ease,background .3s ease,color .2s ease;margin-bottom:10px;float:left;margin-left:0;margin-right:8px;}.section.beschrijving .right:hover{background:' + colors[0] + ' !important;color:' + colors[2] + ';border:2px solid ' + colors[0] + ';}.agendaKwtWindow table.keuzes tr.details td.details{line-height:17px;}.bericht .r-content{max-width:calc(100% - 80px);}.r-content.bericht > .msgdetails1:first-of-type h2:empty:before,.m-element .msgdetails1 h2:empty:before{content:"Geen onderwerp";color:' + colors[9] + ';}#detail-panel .type,.m-wrapper.active .type{margin-right:5px;width:29px;line-height:29px;}.type span{width:35px;text-wrap:nowrap;overflow:hidden;text-overflow:ellipsis;}.leermiddelenDetail .set .double .block .content > div > div:first-of-type:not(:empty){margin-top:6px;}.leermiddelenDetail .set,.vakkenDetail .section:last-of-type .set{column-count:2;}.leermiddelenDetail .set .double,.vakkenDetail .section:last-of-type .set .double{display:inline-block;width:100%;}.set .double .block{margin:5px 0;}.leermiddelenDetail .set .double .block .content .header{margin:-12px;padding:12px;display:block;}.close-detailpanel .icon-remove-sign{color:' + colors[6] + ';}#main-menu-bottom{display:none;}.ui-widget-overlay.ui-front{background:#000;z-index:10000 !important;}div.info-notice.nobackground{padding:0;margin:15px 30px !important;background:none;border:none;}.inleverperiode-panel .header{line-height:25px;}.inleverperiode-panel .leerling-inlevering{line-height:30px;}.file-download .header{margin-top:20px;}div.info-notice{width:fit-content;margin-bottom:10px !important;padding:10px 20px;border:2px solid ' + colors[7] + ';color:' + colors[7] + ' !important;background:' + colors[12] + ';line-height:15px;border-radius:16px;padding-left:50px;}.info-notice svg{height:20px;position:absolute;margin-left:-30px;margin-top:-4px }.goverview{margin-top:20px;}.m-wrapper.active .m-element .IconFont.MainMenuIcons{opacity:1;padding-left:30px;font-size:15px;}.inleveropdracht-conversation .reactie-container textarea{outline:none;border:2px solid ' + colors[4] + ';line-height:27px;padding:5px 10px;transition:border .2s ease;background:' + colors[12] + ';}.inleveropdracht-conversation .reactie-container textarea:hover{border:2px solid ' + colors[4] + ';box-shadow:none;}.inleveropdracht-conversation .reactie-container textarea:focus{box-shadow:none;border:2px solid ' + colors[13] + ';}.inleveropdracht-conversation .reactie-container a{border:none;background:' + colors[13] + ';}.inleveropdracht-conversation .reactie-container a.disabled i{color:#bbb;}.gperiod .tog-period,.gperiod.expand .tog-period{border-top:0;}#mod-prevmonth,#mod-nextmonth{height:1.5em;display:inline-block;margin-right:12px;padding:1px 2px;box-sizing:border-box;}.homeworkaster .yellow.ribbon span{width:100px;}#background-img{z-index:-2;pointer-events:none;-webkit-user-select:none;user-select:none;position:fixed;top:0;left:0;width:100%;height:100%;object-fit:cover;' + (!n(get("blur")) ? 'filter:blur(' + get("blur") + 'px);' :'') + ' }.br{height:10px;margin-bottom:0 !important;}#master-panel .sub,.inleveropdracht-conversation .boodschap .afzender{color:' + colors[9] + ';}.afspraak-window{width:630px;}.details.expanded tr{width:100%;display:inline-block;}.inleveropdracht-conversation .boodschap{display:inline-block;width:calc(100% - 80px);vertical-align:top;margin-left:0;}.leerling-inlevering .icon-trash{padding-top:10px;}#modactions .button-silver-deluxe span{-webkit-user-select:none;user-select:none;padding-left:40px;position:relative;font-size:14px;}#modactions .button-silver-deluxe span svg{height:1.5em;position:absolute;left:15px;font-size:12px;}@media (max-width:1020px){#somtoday-mod > #modactions h2{display:none;}#somtoday-mod > #modactions{padding:5px !important;right:' + (layout == 3 ? 'min(120px,14vw)' :'0') + ' !important;padding-top:' + Math.round(195 / (zoom / 100)).toString() + 'px !important;width:50px !important;}#somtoday-mod > #modactions .button-silver-deluxe span{color:transparent;width:60px;}}.keuzes tr.details td.details{width:100%;}.keuzes tr.details td:last-of-type table tr td:last-of-type{min-width:250px;}.keuzes tr.details > td:first-of-type{display:none;}</style>');
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>.antwoordheader{margin-top:15px;}.conversation div.sub{position:absolute;top:-30px;width:100%;}.conversation .bericht{position:relative;margin-top:60px;margin-bottom:0;}.triangle-box::after,.triangle-box::before{display:none;}.triangle-box{background:' + colors[12] + ';margin-left:70px;border:3px solid ' + colors[3] + ';color:' + colors[11] + ';padding:10px 20px;}.conversation .pasfoto{position:absolute;}.conversation{border-top:none;}.label-pill-lighter,.huiswerkbijlage .simple-view .bijlage-extensie,.simple-view,.jaarbijlage-extensie{background:transparent !important;border:2px solid ' + colors[3] + ' !important;color:' + colors[6] + ' !important;}.jaarbijlage{border:2px solid transparent !important;}.simple-view:hover,.simple-view:hover .bijlage-extensie,.jaarbijlage:hover .jaarbijlage-extensie{border:2px solid ' + colors[1] + ' !important;}.simple-view,.huiswerkbijlage .simple-view .bijlage-extensie,.simple-view .bijlage-label,.jaarbijlage,.jaarbijlage-extensie{transition:0.3s background ease,0.2s color ease,0.2s border ease !important;}.simple-view:hover,.huiswerkbijlage .simple-view:hover .bijlage-extensie,.jaarbijlage:hover .jaarbijlage-extensie,.jaarbijlage:hover{background:' + colors[0] + ' !important;color:' + colors[2] + ' !important;}.simple-view:hover .bijlage-label,.jaarbijlagen .jaarbijlage:hover .jaarbijlage-label{color:' + colors[2] + ' !important;}.huiswerkbijlage .simple-view .bijlage-label{color:' + colors[6] + ';}.section.beschrijving > .section:last-of-type > p{margin-top:5px;margin-bottom:10px;}.box.small.inline.roster .location{padding-left:0;background:none;}.box.small.inline.roster .number{margin-right:10px;color:' + colors[6] + ';}.box.small.inline.roster{background:' + (get('bools').charAt(0) == "1" ? colors[8] :colors[12]) + ';vertical-align:top;width:calc(33.333% - 10px);padding:10px 15px !important;border-radius:14px;box-sizing:border-box;border:none;color:' + colors[9] + ';min-width:130px;margin-right:10px;margin-bottom:10px;}.glevel > div{padding:5px 15px;}.glevel > div{display:none;}.glevel:has(.expanded) > div{display:block;}.glevel{background:' + colors[8] + ';border-radius:8px;}.gperiod.expand .tog-noperiod,.tog-level:hover{border-radius:8px;border:none;background:' + colors[8] + ' url(../images/bck_levelshrinked-ver-183AE12A8943134C34FA665BC1D0AFF0.png) no-repeat 10px 10px;}.tog-level.expanded{background:' + colors[8] + ' url(../images/bck_levelexpanded-ver-E3703F8158EBFA264750E762D48B5ABF.png) no-repeat 10px 10px;}.grades .glevel .tog-level span.right,.tog-level > span > span > .right{margin-right:10px;}.tog-level{transition:background 0.2s ease;border-radius:8px;border:none;background:transparent url(../images/bck_levelshrinked-ver-183AE12A8943134C34FA665BC1D0AFF0.png) no-repeat 10px 10px;padding:5px;padding-left:30px;}.gperiod.expand,.gperiod.expand tbody,.exam td,.exam tr.even,.exam tr.odd{background:transparent;border:none;}.section span.grade,.section span.weging{background:none;}div.wysiwyg>textarea{background:' + colors[12] + ';width:calc(100% - 30px) !important;}.set .block .blocks .block{background:' + colors[8] + ';margin:8px 0;width:unset !important;display:block;border-radius:12px;padding:10px 20px;border:3px solid ' + colors[4] + ';}.set .block .blocks .block *{color:' + colors[11] + ';}.inleverperiode-panel .block,.inleverperiode-panel .leerling-inlevering{border:none;}.file-download .naam{color:' + colors[6] + ' !important;}.file-download .leerling-inlevering:hover{background:transparent !important;}.ui-widget-header,.ui-widget-content,.section .grade,.section .weging{background:' + colors[12] + ';border:none;}.map-naam{-webkit-user-select:none;user-select:none;}.bijlagen-container:hover .map-naam,.jaarbijlage-map:hover .map-naam,textarea{color:' + colors[11] + ' !important;}.jaarbijlagen .jaarbijlage,.huiswerkbijlage .simple-view{-webkit-user-select:none;user-select:none;border-radius:6px;background:' + colors[12] + ';border:none;}.jaarbijlagen .bijlagen-container .bijlagen-header,.jaarbijlagen .bijlagen-container .jaarbijlage-map-header,.jaarbijlagen .jaarbijlage-map .bijlagen-header,.jaarbijlagen .jaarbijlage-map .jaarbijlage-map-header,.jaarbijlagen .jaarbijlage .jaarbijlage-label{color:' + colors[6] + ';}.jaarbijlagen .bijlagen-container,.jaarbijlagen .jaarbijlage-map{background:' + colors[12] + ';border:none !important;transition:background 0.3s ease;}.jaarbijlagen .bijlagen-container:hover,.jaarbijlagen .bijlagen-container.expanded,.jaarbijlagen .jaarbijlage-map.expanded,.jaarbijlagen .jaarbijlage-map:hover,div.block.content,.box.inleverperiode,.double .block{background:' + colors[8] + ';border:none !important;transition:background 0.3s ease;}.box.inleverperiode,.double .block{color:' + colors[11] + ' }.box.inleverperiode:hover,.double .block:hover{background:' + colors[12] + ';}.box.inleverperiode:hover *{color:' + colors[6] + ' !important;}#master-panel{transform:scale(' + zoom + '%);transform-origin:top left;min-height:calc((100vh - ' + (layout == 1 ? '180px' :(layout == 4 ? '160px' :'80px')) + ') / ' + (zoom / 100) + ');padding-bottom:0;padding-top:0;position:absolute;' + (layout == 1 ? 'top:160px;left:15%' :(layout == 2 ? 'top:80px;left:min(14vw,120px)' :(layout == 3 ? 'top:80px;left:0' :'top:160px;left:0'))) + ';background:' + ((layout != 1 && layout != 4) ? colors[8] :'transparent') + ';}#detail-panel{width:100% !important;top:0;position:static !important;' + ((layout == 1 || layout == 4) ? 'padding-top:' + (Math.round(115 / (zoom / 100))).toString() + 'px;' :'') + ' }#detail-panel-wrapper{transform:scale(' + zoom + '%);transform-origin:top right;background:' + ((layout != 1 && layout != 4) ? colors[8] :'transparent') + ';' + ((layout == 2 || layout == 4) ? 'top:80px;right:0;' :(layout == 1 ? 'top:80px;right:15%;' :'top:80px;right:min(14vw,120px);')) + ((get("bools").charAt(3) == "1" && layout != 4 && layout != 1) ? 'height:calc((100% - 80px) / ' + (zoom / 100) + ') !important;position:fixed;overflow-y:auto !important;overflow-x:hidden !important;' :'position:absolute;min-height:calc((100% - 160px) / ' + (zoom / 100) + ');height:fit-content;overflow:visible !important;') + ' min-width:unset;}#master-panel~#detail-panel-wrapper{border-left:none !important;}#detail-panel,#detail-panel-wrapper,.loaderFade,#master-panel{transition:none;}.button-silver-deluxe{box-shadow:none;border:none;}a.button-silver-deluxe:focus span,div.button-silver-deluxe:focus span,a.button-silver-deluxe:hover span,div.button-silver-deluxe:hover span{background:' + colors[4] + ';color:' + colors[9] + ';text-shadow:none;font-weight:700;}.button-silver-deluxe span{text-shadow:none;transition:0.3s background ease;background:' + colors[12] + ';border:3px solid ' + colors[4] + ';color:' + colors[9] + ';padding:10px 20px;border-radius:14px;}#master-panel div.sub{padding-left:0;}.roster-table-content .uurNummer,.goverview tbody td,.goverview th{background:' + colors[12] + ' !important;border:3px solid ' + colors[3] + ' !important;color:' + colors[9] + ' !important;}.goverview th{background:' + colors[3] + ' !important;}</style>');
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>.roster-table{padding:20px;width:calc(100% - 40px);}.huiswerk-items{min-height:80px !important;padding-top:10px;padding-bottom:20px;}.weekitems.eerste-kolom .weekItem,.weekitems.eerste-kolom .geen-items{padding-top:15px;}.ui-widget-shadow{box-shadow:none;}.roster-table-header .day .huiswerk-items,.roster-table-header .day,.dayTitle{background:transparent !important;}.toekenning.truncate .icon-huiswerk,.toekenning.truncate .icon-toets,.toekenning.truncate .icon-grote-toets{margin-right:3px;}.toekenning.truncate .huiswerk-gemaakt,.glevel *{color:' + colors[9] + ' !important;}.toekenning.truncate span,.toekenning.truncate a,.toekenning.truncate,.huiswerk-items{color:' + colors[10] + ';pointer-events:all;}.afspraak .icon-link{position:relative;z-index:10;}.icon-studiewijzer,.icon-huiswerk,.icon-leermiddelen{background:#39c380;}.icon-toets{background:#e8ad1c;}.icon-grote-toets{background:#f56558;}.icon-studiewijzer,.icon-toets,.icon-huiswerk,.icon-grote-toets,.icon-leermiddelen{margin-left:5px;padding-top:4px;box-sizing:border-box;height:22px;width:22px;}.icon-studiewijzer:before,.icon-toets:before,.icon-huiswerk:before,.icon-grote-toets:before,.icon-leermiddelen:before{display:none;}.icon-leermiddelen{margin-left:0;}.afspraak-link.inline{padding:12px 15px;margin:0;height:calc(100% - 24px);width:calc(100% - 30px);position:absolute;}.truncate.afspraak{box-sizing:border-box;background:' + colors[3] + ';border-radius:8px;transition:background 0.3s ease;margin:0 5px;}.afspraakVakNaam.truncate,.load-more a div{min-width:40px;text-decoration-color: ' + colors[6] + ' !important;color:' + colors[6] + ';}.load-more a:hover div{text-decoration:underline;}.afspraakLocatie,.kwtOpties{color:' + colors[9] + ';font-size:12px;padding-left:0;}.truncate.afspraak:hover{background:' + colors[4] + ';}.truncate.afspraak.nlg{background:' + colors[8] + ';box-shadow:none;border:3px solid ' + colors[3] + ';}.day{border-left:none;}.dayTitle,.roster-table-content .day,.roster-table-content .hours,.roster-table-header,.roster-table-content .hours .hour{border-color:transparent !important;}.hour.pauze{background:none !important;}.truncate.afspraak .toekenning.truncate{margin-top:55px; height:fit-content;position:relative;pointer-events:none;padding:0 7px;}.toekenning.truncate{background:transparent;padding:3px 7px;padding-right:15px;z-index:1;}.d-next,.d-prev{transform:none;border:none;cursor:pointer;height:18px;width:18px;}#nprogress .bar,#nprogress .peg{background:' + colors[0] + ';box-shadow:none;}body{height:0;overflow-y:scroll !important;color:' + colors[11] + ';}#content,body{border:none;background:transparent !important;}div.panel-header{border-bottom:0 !important;margin-bottom:4px;max-width:100% !important;}.title div.block.content{padding:13px 20px;border-radius:12px;}h2,h3,.title div.block.content,.section>p,.inleveropdracht-conversation .boodschap .content{color:' + colors[11] + ';}div table.tblData td.tblTag{color:' + colors[11] + ';border-bottom:0;}.section li.block,.box.msgdetails2,.verstuurpanel .invoerVeld.textinhoud{word-wrap:break-word;background:' + (get('bools').charAt(0) == "1" ? colors[8] :colors[12]) + ';margin:8px 0;padding:15px 20px;border-radius:14px;border:3px solid ' + colors[3] + ';color:' + colors[11] + ';}.bericht .r-content h2{max-width:100%;}.verstuurpanel .invoerVeld.textinhoud{width:calc(100% - 55px);transition:border .3s ease;}.verstuurpanel .invoerVeld.textinhoud:focus{outline:none;border:3px solid ' + colors[7] + ';}.studiewijzerdescription,.r-content{color:' + colors[9] + ';}.yellow.ribbon a.IconFont,.yellow.ribbon a:hover{background:transparent;} h1,.box .number{color:' + colors[6] + ' !important;} .blue.ribbon p{margin-left:-140px !important;display:block;position:absolute;}.left h1{display:none;}.profileMaster div h2{display:none;}.yellow.ribbon:hover a.menuitem::after,a.menuitem:hover::after{margin-left:10px;opacity:1;}a.menuitem:after{transition:opacity 0.3s ease,margin-left 0.3s ease;opacity:0;display:inline-block;margin-left:-5px;position:absolute;margin-top:3px;content:url(\'data:image/svg+xml;utf8,<svg fill="%23' + colors[6].substring(1) + '" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>\');}a.menuitem svg{width:25px;height:25px;margin-left:-50px;margin-top:-3px;position:absolute;}a.menuitem{-webkit-user-select:none;user-select:none;padding:0;padding-left:50px;margin:5px 25px;display:block;font-size:18px;color:' + colors[6] + ';}.pasfoto{border:0 !important;border-radius:50%;overflow:hidden;object-fit:cover;display:inline-block;width:50px !important;height:50px !important;margin-right:20px !important;}.pasfoto svg{height:100%;background:' + colors[8] + ';}.yellow.ribbon{top:0;left:0;position:absolute;box-sizing:border-box;padding:10px;width:100%;background:linear-gradient(90deg,' + colors[4] + ' 0%,' + colors[3] + ' 25%,' + colors[3] + ' 75%,rgba(0,0,0,0) 100%) !important;}.yellow.ribbon *{overflow:visible;}.yellow.ribbon p{height:34px;}.yellow.ribbon p a{border-bottom:0 !important;}.yellow.ribbon p a:before{display:none;}.tog-period span.titel{width:calc(100% - 80px);height:24px;overflow:hidden;text-overflow:ellipsis;display:inline-block;line-height:20px;white-space:nowrap;}.box.small.roster.class li > *{font-size:14px;margin-left:10px;margin-top:0;margin-bottom:5px;display:inline-block;}.box.small.roster.class li{height:fit-content !important;display:block;}.box.small.roster.class{border:none;padding:15px;border-radius:10px;margin-bottom:10px;}.box .class-time{background:none;padding-left:0;display:block;}.m-element:hover{border-bottom:0 !important;}.twopartfields span{float:right;}.profielTblData,.profileMaster .m-wrapperTable{max-width:100%;width:720px;padding-left:10px;}.profielTblData .button-silver-deluxe{margin-right:0;margin-bottom:15px;}div.m-wrapperTable table.profielTblData tr td{border-bottom:none;padding:0 5px !important;}.profielTblData tr td:first-of-type{width:70%;}.profielTblData tr td:last-of-type{text-align:right;}.m-wrapper.active{margin-right:0;padding-right:0;background:none !important;}.m-wrapper.active .type.IconFont.icon-envelope-open,.m-wrapper.active .type.IconFont.icon-envelope-open-attach,.m-wrapper.active .type.IconFont.icon-envelope,.m-wrapper.active .type.IconFont.icon-envelope-attach{width:29px;}.profileMaster .m-wrapper.active .type:has(svg){width:29px;}.IconFont:not(.MainMenuIcons):before,.IconFont label:before,.m-wrapper .type:before,.icon-envelope-open:before,.icon-trash:before,.mod-icon-hide:before{display:none;}.msgdetails1 .IconFont svg,.m-wrapper .type svg{display:block;margin:auto;}.msgdetails1 .IconFont:not(.icon-chevron-right),.m-wrapper .type{position:absolute;overflow:visible !important;}.r_content.sub{padding:0 !important;}div.type{text-align:left;color:' + colors[6] + ';background:none;border:none;margin:0;}</style>');
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>#user span.header{display:none;}#close-modsettings{user-select:none;font-size:50px;right:0;position:absolute;color:white;text-shadow:0 0 5px #555;padding:5px 20px;}svg:hover g.glasses{animation:1s glasses linear forwards;}@keyframes glasses{0%{transform:translateY(-60px);opacity:0;}50%{transform:translateY(-30px);opacity:1;}100%{transform:translateY(0px);opacity:1;}}.geen-items.truncate{padding:3px 6px;}.stpanel--error--message a:hover,.stpanel--status a:hover{background:' + colors[0] + ';color:' + colors[2] + ';}.stpanel--error--message a,.stpanel--status a{display:block;transition:0.2s background ease, 0.2s color ease;padding: 20px 40px;border:2px solid ' + colors[0] + ';margin-top:30px;color:' + colors[6] + ';border-radius:12px;}.stpanel--error--message,.stpanel--status{background:unset;padding:1rem 4rem;font-size:15px;}#content{box-shadow:none;}#content-wrapper:has(.stpanel--status){margin-top:110px;}.mod-paperclip{position:absolute;height:18px;width:18px;background:' + colors[7] + ';border-radius:50%;margin-left:18px;margin-top:-5px;}#detail-panel:has(.activityDetail){padding-top:' + ((layout == 2 || layout == 3) ? 'calc(20px / ' + (zoom / 100).toString() + ')' : 'calc(100px / ' + (zoom / 100).toString() + ')') + ';}.invoerVeld.textinhoud .ui-resizable-handle { display: none !important; }.m-element h2.centered{padding-top:9px;}.section.NewMessageDetail{padding-right:10px;}ul.feedbackPanel,.feedbackPanel:has(.feedbackPanelERROR){margin:0 0 10px 0 !important;padding:10px 15px;background:' + (get("bools").charAt(0) == "1" ? '#66000f' : '#eed3d7') + ' !important;}ul.feedbackPanel li{padding:0;background:unset !important;color:' + colors[11] + '!important}.m-element,div.m-wrapperTable table tr td{border:none;}.icon-md.icon-info-sign{cursor:pointer;}.r-content.bericht.expand.reply .pasfoto{right:0;}div.date{position:relative;display:block;height:70px;}div.huiswerk{max-width:calc(100% - 150px);margin-bottom:0;position:relative;margin-left:48px;}.sub.homework,.sub.homework .deadline,div.huiswerk,.sub span,.yellow.ribbon span,.yellow.ribbon a,.dayTitle.truncate span,.hour.pauze,.weekitems .weekitemLabel,.roster-table-header .geen-items{color:' + colors[9] + ';}.sub a span,.box a,.box u:has(a),.box a *{text-decoration-color:#39f !important;color:#39f !important;}.m-element{padding:20px 25px;border-bottom:0;min-height:40px;}.m-element:hover,.m-wrapper.active .m-element{background:linear-gradient(90deg,' + colors[4] + ' 0%,' + colors[3] + ' 25%,' + colors[3] + ' 70%,rgba(0,0,0,0) 100%) !important;}div.date div{left:65px;top:25px;}#master-panel .date div p.date-day,#master-panel .date div p.date-month,#master-panel .date div,#master-panel .date div p.date-day,#master-panel .date div p.date-month,#master-panel .date span{text-align:left;padding:15px 0;height:fit-content;background:none !important;border:none !important; color:' + colors[6] + ' !important;width:fit-content;display:inline-block;font-size:16px;padding-right:4px;text-transform:lowercase;}.date-day{background:transparent !important;}.huiswerk .onderwerp,.homework-detail-header{color:' + colors[10] + ';}.active .huiswerk .onderwerp,#master-panel h2,.blue.ribbon p,.blue.ribbon .icon-check,.blue.ribbon .icon-check-empty{color:' + colors[6] + ' !important;}</style>');
    }

    // Write message in the console
    function consoleMessage() {
        setTimeout(console.log.bind(console, "%cSomtoday Mod is geactiveerd!", "color:#0067c2;font-weight:bold;font-family:Arial;font-size:26px;"));
        setTimeout(console.log.bind(console, "%cGeniet van je betere versie van Somtoday.\n\n© Jona Zwetsloot | Versie " + somtodayversion + " van Somtoday | Versie " + version + " van Somtoday Mod " + platform, "color:#0067c2;font-weight:bold;font-family:Arial;font-size:16px;"));
    }

    // Show confetti when it is the users birthday or when the user uses Somtoday Mod for n years
    function congratulations() {
        // Only activate it when enabled in settings and if it is the first time Somtoday is used on the current day (months are zero-based)
        if (get("bools").charAt(6) == "1" && (year + "-" + (month + 1) + "-" + dayInt) != get("lastused")) {
            // Get years since first use
            const firstused = new Date(get("firstused"));
            const lastused = new Date(get("lastused"));
            const yeardifference = parseInt((lastused - firstused) / 1000 / 60 / 60 / 24 / 365);
            // Get birthday date
            const date = new Date();
            const birthdayday = parseInt(get("birthday").charAt(0) + get("birthday").charAt(1));
            const birthdaymonth = parseInt(get("birthday").charAt(3) + get("birthday").charAt(4));
            // Check if confetti should be shown
            let congratstext = [""];
            if (yeardifference > get('lastjubileum')) {
                congratstext = ["Bedankt" + (n(firstname) ? '' : ', ' + firstname) + "!", "Je gebruikt Somtoday mod nu al " + yeardifference + " jaar. Bedankt!"];
                set('lastjubileum', yeardifference);
            }
            if (birthdayday == dayInt && birthdaymonth == (month + 1)) {
                congratstext = ["Fijne verjaardag!", "Maak er maar een mooie dag van!"];
            }
            if (congratstext[1] != null) {
                // Confetti should be shown, so insert the confetti
                tn("html", 0).style.overflow = "hidden";
                tn('body', 0).insertAdjacentHTML('afterbegin', '<style>#verjaardag{width:100%;height:100%;position:fixed;top:0;z-index:10000;background:' + colors[12] + ';text-align:center;transition:0.3s opacity ease;}#verjaardag div{top:50%;left:50%;transform:translate(-50%, -50%);position:absolute;}.bouncetext{animation:bounce 0.3s ease forwards;color:' + colors[9] + ';}.bouncetext.small{font-size:0;animation:bouncesmall 0.5s ease forwards 0.3s;margin-top:35px;}@keyframes bouncesmall{0%{font-size:0px;}80%{font-size:29px;}100%{font-size:24px;}}@keyframes bounce{0%{font-size:0px;}80%{font-size:58px;}100%{font-size:48px;}}.verjaardagbtn{background:' + colors[1] + ';padding:25px 40px;width:fit-content;color:' + colors[2] + ';margin-top:50px;opacity:0;display:block;animation:2s fadein ease 0.6s forwards;font-size:16px;border-radius:16px;transition:0.3s background ease;}.verjaardagbtn:hover{background:' + colors[0] + ';}@keyframes fadein{0%{opacity:0;}100%{opacity:1;}}</style><div id="verjaardag"><div><h2 class="bouncetext">' + congratstext[0] + '</h2><h2 class="bouncetext small">' + congratstext[1] + '</h2><center><a class="verjaardagbtn" id="congrats-continue">Doorgaan</a></center></div></div>');
                id("congrats-continue").addEventListener("click", function() {
                    id("confetti-canvas").style.opacity = '0';
                    id("verjaardag").style.opacity = '0';
                    setTimeout(function() {
                        tryRemove(id("confetti-canvas"));
                        tryRemove(id("verjaardag"));
                        tn("html", 0).style.overflowY = "scroll"
                    }, 350);
                });
                // Confetti effect thanks to CSS Script: https://www.cssscript.com/demo/confetti-falling-animation/
                let maxParticleCount = 150;
                let particleSpeed = 2;
                let startConfetti;
                let stopConfetti;
                let toggleConfetti;
                let removeConfetti;
                (function() {
                    startConfetti = startConfettiInner;
                    stopConfetti = stopConfettiInner;
                    toggleConfetti = toggleConfettiInner;
                    removeConfetti = removeConfettiInner;
                    let colors = ["#ec1254", "#f27c14", "#f27c14", "#f5e31d", "#1ee8b6", "#26a1d5"];
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
                        window.requestAnimFrame = (function() {
                            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                                return window.setTimeout(callback, 16.6666667);
                            };
                        })();
                        let canvas = id("confetti-canvas");
                        if (canvas === null) {
                            canvas = document.createElement("canvas");
                            canvas.setAttribute("id", "confetti-canvas");
                            canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none;position:fixed;top:0;left:0;transition:0.3s opacity ease;");
                            document.body.appendChild(canvas);
                            canvas.width = width;
                            canvas.height = height;
                            window.addEventListener("resize", function() {
                                canvas.width = window.innerWidth;
                                canvas.height = window.innerHeight;
                            }, {passive: true});
                        }
                        let context = canvas.getContext("2d");
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
                setTimeout(startConfetti, 500);
            }
        }
        set("lastused", year + "-" + (month + 1) + "-" + dayInt);
    }

    // Construct an icon in SVG format. Only contains icons used by this mod.
    function getIcon(name, classname, color, start) {
        // Icons thanks to Font Awesome: https://fontawesome.com/
        // If you want to add another icon:
        // 1. Copy one of the cases and give your icon a new unique name.
        // 2. Go to https://fontawesome.com/search, pick an icon and select SVG.
        // 3. Assign the viewBox to the variable viewbox and the d (the path) to the variable svg.
        // 4. Now you can use this function to get your own icon.
        let svg;
        let viewbox = '0 0 512 512';
        n(name) ? name = "" : null;
        n(color) ? color = "#fff" : null;
        classname = n(classname) ? "" : 'class="' + classname + '" ';
        start = n(start) ? "" : start + " ";
        switch (name) {
            // FONT AWESOME
            case 'newspaper':
                svg = 'M96 96c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H80c-44.2 0-80-35.8-80-80V128c0-17.7 14.3-32 32-32s32 14.3 32 32V400c0 8.8 7.2 16 16 16s16-7.2 16-16V96zm64 24v80c0 13.3 10.7 24 24 24H296c13.3 0 24-10.7 24-24V120c0-13.3-10.7-24-24-24H184c-13.3 0-24 10.7-24 24zm208-8c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H384c-8.8 0-16 7.2-16 16zM160 304c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16H432c8.8 0 16-7.2 16-16s-7.2-16-16-16H176c-8.8 0-16 7.2-16 16z';
                break;
            case 'calendar-days':
                viewbox = '0 0 448 512';
                svg = 'M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z';
                break;
            case 'pencil':
                svg = 'M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z';
                break;
            case 'clipboard-check':
                viewbox = '0 0 384 512';
                svg = 'M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H282.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM305 273L177 401c-9.4 9.4-24.6 9.4-33.9 0L79 337c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L271 239c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z';
                break;
            case 'book':
                viewbox = '0 0 448 512';
                svg = 'M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z';
                break;
            case 'user-clock':
                viewbox = '0 0 640 512';
                svg = 'M224 0a128 128 0 1 1 0 256A128 128 0 1 1 224 0zM178.3 304h91.4c20.6 0 40.4 3.5 58.8 9.9C323 331 320 349.1 320 368c0 59.5 29.5 112.1 74.8 144H29.7C13.3 512 0 498.7 0 482.3C0 383.8 79.8 304 178.3 304zM352 368a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-80c-8.8 0-16 7.2-16 16v64c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H512V304c0-8.8-7.2-16-16-16z';
                break;
            case 'book-bookmark':
                viewbox = '0 0 448 512';
                svg = 'M0 96C0 43 43 0 96 0h96V190.7c0 13.4 15.5 20.9 26 12.5L272 160l54 43.2c10.5 8.4 26 .9 26-12.5V0h32 32c17.7 0 32 14.3 32 32V352c0 17.7-14.3 32-32 32v64c17.7 0 32 14.3 32 32s-14.3 32-32 32H384 96c-53 0-96-43-96-96V96zM64 416c0 17.7 14.3 32 32 32H352V384H96c-17.7 0-32 14.3-32 32z';
                break;
            case 'envelope':
                svg = 'M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z';
                break;
            case 'right-from-bracket':
                svg = 'M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z';
                break;
            case 'user':
                viewbox = '0 0 448 512';
                svg = 'M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z';
                break;
            case 'key':
                svg = 'M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z';
                break;
            case 'list-check':
                svg = 'M152.1 38.2c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 113C-2.3 103.6-2.3 88.4 7 79s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zm0 160c9.9 8.9 10.7 24 1.8 33.9l-72 80c-4.4 4.9-10.6 7.8-17.2 7.9s-12.9-2.4-17.6-7L7 273c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l22.1 22.1 55.1-61.2c8.9-9.9 24-10.7 33.9-1.8zM224 96c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H256c-17.7 0-32-14.3-32-32zm0 160c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H256c-17.7 0-32-14.3-32-32zM160 416c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H192c-17.7 0-32-14.3-32-32zM48 368a48 48 0 1 1 0 96 48 48 0 1 1 0-96z';
                break;
            case 'school':
                viewbox = '0 0 640 512';
                svg = 'M337.8 5.4C327-1.8 313-1.8 302.2 5.4L166.3 96H48C21.5 96 0 117.5 0 144V464c0 26.5 21.5 48 48 48H592c26.5 0 48-21.5 48-48V144c0-26.5-21.5-48-48-48H473.7L337.8 5.4zM256 416c0-35.3 28.7-64 64-64s64 28.7 64 64v96H256V416zM96 192h32c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16H96c-8.8 0-16-7.2-16-16V208c0-8.8 7.2-16 16-16zm400 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16H512c-8.8 0-16-7.2-16-16V208zM96 320h32c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16H96c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16zm400 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16H512c-8.8 0-16-7.2-16-16V336zM232 176a88 88 0 1 1 176 0 88 88 0 1 1 -176 0zm88-48c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H336V144c0-8.8-7.2-16-16-16z';
                break;
            case 'calendar':
                viewbox = '0 0 448 512';
                svg = 'M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z';
                break;
            case 'gear':
                svg = 'M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z';
                break;
            case 'comment-dots':
                svg = 'M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3 0 0 0 0 0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z';
                break;
            case 'circle-exclamation':
                svg = 'M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z';
                break;
            case 'eye':
                viewbox = '0 0 576 512';
                svg = 'M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z';
                break;
            case 'paperclip':
                viewbox = '0 0 448 512';
                svg = 'M364.2 83.8c-24.4-24.4-64-24.4-88.4 0l-184 184c-42.1 42.1-42.1 110.3 0 152.4s110.3 42.1 152.4 0l152-152c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-152 152c-64 64-167.6 64-231.6 0s-64-167.6 0-231.6l184-184c46.3-46.3 121.3-46.3 167.6 0s46.3 121.3 0 167.6l-176 176c-28.6 28.6-75 28.6-103.6 0s-28.6-75 0-103.6l144-144c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-144 144c-6.7 6.7-6.7 17.7 0 24.4s17.7 6.7 24.4 0l176-176c24.4-24.4 24.4-64 0-88.4z';
                break;
            case 'envelope-open':
                svg = 'M64 208.1L256 65.9 448 208.1v47.4L289.5 373c-9.7 7.2-21.4 11-33.5 11s-23.8-3.9-33.5-11L64 255.5V208.1zM256 0c-12.1 0-23.8 3.9-33.5 11L25.9 156.7C9.6 168.8 0 187.8 0 208.1V448c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V208.1c0-20.3-9.6-39.4-25.9-51.4L289.5 11C279.8 3.9 268.1 0 256 0z';
                break;
            case 'pen-to-square':
                svg = 'M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z';
                break;
            case 'circle-user':
                svg = 'M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z';
                break;
            case 'bold':
                viewbox = '0 0 384 512';
                svg = 'M0 64C0 46.3 14.3 32 32 32H80 96 224c70.7 0 128 57.3 128 128c0 31.3-11.3 60.1-30 82.3c37.1 22.4 62 63.1 62 109.7c0 70.7-57.3 128-128 128H96 80 32c-17.7 0-32-14.3-32-32s14.3-32 32-32H48V256 96H32C14.3 96 0 81.7 0 64zM224 224c35.3 0 64-28.7 64-64s-28.7-64-64-64H112V224H224zM112 288V416H256c35.3 0 64-28.7 64-64s-28.7-64-64-64H224 112z';
                break;
            case 'italic':
                viewbox = '0 0 384 512';
                svg = 'M128 64c0-17.7 14.3-32 32-32H352c17.7 0 32 14.3 32 32s-14.3 32-32 32H293.3L160 416h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H90.7L224 96H160c-17.7 0-32-14.3-32-32z';
                break;
            case 'underline':
                viewbox = '0 0 448 512';
                svg = 'M16 64c0-17.7 14.3-32 32-32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H128V224c0 53 43 96 96 96s96-43 96-96V96H304c-17.7 0-32-14.3-32-32s14.3-32 32-32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H384V224c0 88.4-71.6 160-160 160s-160-71.6-160-160V96H48C30.3 96 16 81.7 16 64zM0 448c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32z';
                break;
            case 'subscript':
                svg = 'M32 64C14.3 64 0 78.3 0 96s14.3 32 32 32H47.3l89.6 128L47.3 384H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H64c10.4 0 20.2-5.1 26.2-13.6L176 311.8l85.8 122.6c6 8.6 15.8 13.6 26.2 13.6h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H304.7L215.1 256l89.6-128H320c17.7 0 32-14.3 32-32s-14.3-32-32-32H288c-10.4 0-20.2 5.1-26.2 13.6L176 200.2 90.2 77.6C84.2 69.1 74.4 64 64 64H32zM480 320c0-11.1-5.7-21.4-15.2-27.2s-21.2-6.4-31.1-1.4l-32 16c-15.8 7.9-22.2 27.1-14.3 42.9C393 361.5 404.3 368 416 368v80c-17.7 0-32 14.3-32 32s14.3 32 32 32h32 32c17.7 0 32-14.3 32-32s-14.3-32-32-32V320z';
                break;
            case 'superscript':
                svg = 'M480 32c0-11.1-5.7-21.4-15.2-27.2s-21.2-6.4-31.1-1.4l-32 16c-15.8 7.9-22.2 27.1-14.3 42.9C393 73.5 404.3 80 416 80v80c-17.7 0-32 14.3-32 32s14.3 32 32 32h32 32c17.7 0 32-14.3 32-32s-14.3-32-32-32V32zM32 64C14.3 64 0 78.3 0 96s14.3 32 32 32H47.3l89.6 128L47.3 384H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H64c10.4 0 20.2-5.1 26.2-13.6L176 311.8l85.8 122.6c6 8.6 15.8 13.6 26.2 13.6h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H304.7L215.1 256l89.6-128H320c17.7 0 32-14.3 32-32s-14.3-32-32-32H288c-10.4 0-20.2 5.1-26.2 13.6L176 200.2 90.2 77.6C84.2 69.1 74.4 64 64 64H32z';
                break;
            case 'rotate-left':
                svg = 'M48.5 224H40c-13.3 0-24-10.7-24-24V72c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2L98.6 96.6c87.6-86.5 228.7-86.2 315.8 1c87.5 87.5 87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3c-62.2-62.2-162.7-62.5-225.3-1L185 183c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8H48.5z';
                break;
            case 'rotate-right':
                svg = 'M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z';
                break;
            case 'list-ol':
                svg = 'M24 56c0-13.3 10.7-24 24-24H80c13.3 0 24 10.7 24 24V176h16c13.3 0 24 10.7 24 24s-10.7 24-24 24H40c-13.3 0-24-10.7-24-24s10.7-24 24-24H56V80H48C34.7 80 24 69.3 24 56zM86.7 341.2c-6.5-7.4-18.3-6.9-24 1.2L51.5 357.9c-7.7 10.8-22.7 13.3-33.5 5.6s-13.3-22.7-5.6-33.5l11.1-15.6c23.7-33.2 72.3-35.6 99.2-4.9c21.3 24.4 20.8 60.9-1.1 84.7L86.8 432H120c13.3 0 24 10.7 24 24s-10.7 24-24 24H32c-9.5 0-18.2-5.6-22-14.4s-2.1-18.9 4.3-25.9l72-78c5.3-5.8 5.4-14.6 .3-20.5zM224 64H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32z';
                break;
            case 'list-ul':
                svg = 'M64 144a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM64 464a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm48-208a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z';
                break;
            case 'link':
                viewbox = '0 0 640 512';
                svg = 'M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z';
                break;
            case 'code':
                viewbox = '0 0 640 512';
                svg = 'M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z';
                break;
            case 'xmark':
                viewbox = '0 0 384 512';
                svg = 'M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z';
                break;
            case 'square-check':
                svg = 'M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z';
                break;
            case 'square':
                svg = 'M384 80c8.8 0 16 7.2 16 16V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V96c0-8.8 7.2-16 16-16H384zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z';
                break;
            case 'trash':
                viewbox = '0 0 448 512';
                svg = 'M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z';
                break;
            case 'right-to-bracket':
                svg = 'M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z';
                break;
            case 'right-from-bracket':
                svg = 'M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z';
                break;
            case 'calendar-solid':
                viewbox = '0 0 448 512';
                svg = 'M96 32V64H48C21.5 64 0 85.5 0 112v48H448V112c0-26.5-21.5-48-48-48H352V32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H160V32c0-17.7-14.3-32-32-32S96 14.3 96 32zM448 192H0V464c0 26.5 21.5 48 48 48H400c26.5 0 48-21.5 48-48V192z';
                break;
            case 'chevron-left':
                svg = 'M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z';
                break;
            case 'chevron-right':
                svg = 'M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z';
                break;
            case 'floppy-disk':
                viewbox = '0 0 448 512';
                svg = 'M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z';
                break;
            case 'circle-info':
                svg = 'M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z';
                break;
            case 'globe':
                svg = 'M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z';
                break;
            case 'moon':
                viewbox = '0 0 384 512';
                svg = 'M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z';
                break;
            case 'sun':
                svg = 'M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z';
                break;
            case 'forward':
                svg = 'M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4L224 214.3V256v41.7L52.5 440.6zM256 352V256 128 96c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l192 160c7.3 6.1 11.5 15.1 11.5 24.6s-4.2 18.5-11.5 24.6l-192 160c-9.5 7.9-22.8 9.7-34.1 4.4s-18.4-16.6-18.4-29V352z';
                break;
            case 'backward':
                svg = 'M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 214.3V256v41.7L459.5 440.6zM256 352V256 128 96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V352z';
                break;
            case 'upload':
                svg = 'M288 109.3V352c0 17.7-14.3 32-32 32s-32-14.3-32-32V109.3l-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352H192c0 35.3 28.7 64 64 64s64-28.7 64-64H448c35.3 0 64 28.7 64 64v32c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V416c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z';
                break;
            // H1, H2 and H3 icon thanks to Getbootstrap: https://icons.getbootstrap.com/icons/type-h1/, https://icons.getbootstrap.com/icons/type-h2/, https://icons.getbootstrap.com/icons/type-h3/
            case 'h1':
                viewbox = '0 0 16 16';
                svg = 'M7.648 13V3H6.3v4.234H1.348V3H0v10h1.348V8.421H6.3V13zM14 13V3h-1.333l-2.381 1.766V6.12L12.6 4.443h.066V13z';
                break;
            case 'h2':
                viewbox = '0 0 16 16';
                svg = 'M7.495 13V3.201H6.174v4.15H1.32V3.2H0V13h1.32V8.513h4.854V13h1.32Zm3.174-7.071v-.05c0-.934.66-1.752 1.801-1.752 1.005 0 1.76.639 1.76 1.651 0 .898-.582 1.58-1.12 2.19l-3.69 4.2V13h6.331v-1.149h-4.458v-.079L13.9 8.786c.919-1.048 1.666-1.874 1.666-3.101C15.565 4.149 14.35 3 12.499 3 10.46 3 9.384 4.393 9.384 5.879v.05h1.285Z';
                break;
            case 'h3':
                viewbox = '0 0 16 16';
                svg = 'M11.07 8.4h1.049c1.174 0 1.99.69 2.004 1.724.014 1.034-.802 1.786-2.068 1.779-1.11-.007-1.905-.605-1.99-1.357h-1.21C8.926 11.91 10.116 13 12.028 13c1.99 0 3.439-1.188 3.404-2.87-.028-1.553-1.287-2.221-2.096-2.313v-.07c.724-.127 1.814-.935 1.772-2.293-.035-1.392-1.21-2.468-3.038-2.454-1.927.007-2.94 1.196-2.981 2.426h1.23c.064-.71.732-1.336 1.744-1.336 1.027 0 1.744.64 1.744 1.568.007.95-.738 1.639-1.744 1.639h-.991V8.4ZM7.495 13V3.201H6.174v4.15H1.32V3.2H0V13h1.32V8.513h4.854V13h1.32Z';
                break;
            // SOMTODAY LOGO
            case 'logo':
                viewbox = '0 0 49 49';
                svg = 'M44.6819 17.3781H43.3148C41.7353 17.3781 40.4606 16.1316 40.4606 14.5871V11.9045C40.4606 10.36 39.1859 9.11355 37.6064 9.11355H32.6184C31.0389 9.11355 29.7642 7.8671 29.7642 6.32258V2.79097C29.7642 1.24645 28.4895 0 26.91 0H22.153C20.5734 0 19.2987 1.24645 19.2987 2.79097V6.32258C19.2987 7.8671 18.024 9.11355 16.4445 9.11355H11.4566C9.87706 9.11355 8.60236 10.36 8.60236 11.9045V14.5871C8.60236 16.1316 7.32766 17.3781 5.74814 17.3781H4.38107C2.80155 17.3781 1.52686 18.6245 1.52686 20.169V28.5058C1.52686 30.0503 2.80155 31.2968 4.38107 31.2968H5.72967C7.30918 31.2968 8.58388 32.5432 8.58388 34.0877V37.1768C8.58388 38.7213 9.85858 39.9677 11.4381 39.9677C13.0176 39.9677 14.2923 41.2142 14.2923 42.7587V46.209C14.2923 47.7535 15.567 49 17.1465 49H20.2132C21.7927 49 23.0674 47.7535 23.0674 46.209V41.4039C23.0674 40.609 23.7232 39.9768 24.5269 39.9768C25.3305 39.9768 25.9863 40.6181 25.9863 41.4039V46.209C25.9863 47.7535 27.261 49 28.8405 49H31.9072C33.4867 49 34.7614 47.7535 34.7614 46.209V42.7587C34.7614 41.2142 36.0361 39.9677 37.6156 39.9677C39.1951 39.9677 40.4698 38.7213 40.4698 37.1768V34.0877C40.4698 32.5432 41.7445 31.2968 43.324 31.2968H44.6726C46.2522 31.2968 47.5269 30.0503 47.5269 28.5058V20.169C47.5269 18.6245 46.2522 17.3781 44.6726 17.3781H44.6819ZM37.902 26.4465C37.006 29.3368 35.0108 31.7123 32.2859 33.1394C30.5863 34.0245 28.7297 34.4761 26.8453 34.4761C25.7184 34.4761 24.5823 34.3135 23.4738 33.9794C22.7995 33.7806 22.4208 33.0852 22.624 32.4348C22.8273 31.7755 23.5385 31.4052 24.2128 31.6039C26.522 32.2903 28.9606 32.0555 31.0943 30.9445C33.2188 29.8335 34.7799 27.9819 35.4819 25.7239C35.6851 25.0645 36.3963 24.7032 37.0706 24.8929C37.7449 25.0916 38.1236 25.7871 37.9204 26.4465H37.902Z';
                break;
            default:
                viewbox = '0 0 384 512';
                svg = 'M64 390.3L153.5 256 64 121.7V390.3zM102.5 448H281.5L192 313.7 102.5 448zm128-192L320 390.3V121.7L230.5 256zM281.5 64H102.5L192 198.3 281.5 64zM0 48C0 21.5 21.5 0 48 0H336c26.5 0 48 21.5 48 48V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V48z';
        }
        return '<svg ' + start + classname + 'height="1em" viewBox="' + viewbox + '"><path fill="' + color + '" d="' + svg + '"/></svg>';
    }

    // pageUpdate is executed at page load and when the masterpanel or the detailpanel changes.
    function pageUpdate() {
        // Set busy to true to be sure the pageUpdate isn't executed twice when master and detailpanel change at the same time
        busy = true;
        execute([autoReload, panelStyles, icons, profilePicture, pageName, hideElements, panelHeaderIcons]);
        if (isOpen("roosterMaster")) {
            execute([roosterLayout]);
        } else if (isOpen("homeworkaster") || isOpen("homeworkMaster")) {
            // Homeworkmaster classname is spelled wrong. Check also for good version in case it is changed in the future.
            execute([insertCalendar, monthNavigation, calendarHomework]);
        } else if (isOpen("cijfersMaster")) {
            execute([gradeDescription]);
        } else if (isOpen("vakkenMaster")) {
            execute([subjectPageCloseButton]);
        } else if (isOpen("leermiddelenMaster")) {
            execute([addSubjectName]);
        } else if (isOpen("profileMaster")) {
            execute([settingData, insertSettings])
        } else if (isOpen("berichtenMaster")) {
            execute([linkPopup, toolbar, hideConversation]);
        } else if (isOpen("activityMaster")) {
            execute([roosterEmpty]);
        }
        execute([nicknames]);
        // Simulate resize event and set busy to false
        window.dispatchEvent(new Event('resize'));
        setTimeout(function() {
            busy = false;
        }, 100);
    }

    // Check if a panel is open
    function isOpen(className) {
        return !n(cn(className, 0)) && !cn(className, 0).hidden && !n(cn(className, 0).children[0]);
    }

    // Get the number of loaded pages (should be one but sometimes its not for some reason)
    // Used for autoReload function and to check if some items should be removed
    function getPagesLoaded() {
        let i = 0;
        if (!n(id('master-panel'))) {
            for (const element of id('master-panel').children) {
                if (!n(element.classList) && !element.hidden && !n(element.children[0])) {
                    i++;
                }
            }
        }
        return i;
    }

    // Bind a tooltip that looks like a real Somtoday's tooltip to an element
    function bindTooltip(idstring, text) {
        if (get('bools').charAt(8) != "1") {
            id(idstring).addEventListener("mouseenter", function() {
                for (const element of cn('mod-tooltip-active')) {
                    element.classList.remove('mod-tooltip-active');
                    element.classList.add('mod-tooltip');
                    setTimeout(function() { tryRemove(element) }, 300);
                }
                if (!n(id('for' + idstring))) {
                    tryRemove(id('for' + idstring));
                }
                id("somtoday-mod").insertAdjacentHTML('beforeend', '<div class="mod-tooltip" id="for' + idstring + '" data-forelement="' + idstring + '" style="left:' + (id(idstring).getBoundingClientRect().right - 30) + 'px;top:' + (id(idstring).getBoundingClientRect().bottom + window.scrollY - 9) + 'px;">' + text + '</div>');
                setTimeout(function(){ if (!n(id('for' + idstring))) { id('for' + idstring).classList.add('mod-tooltip-active'); id('for' + idstring).classList.remove('mod-tooltip'); } }, 10);
            });
            id(idstring).addEventListener("mouseleave", function() {
                for (const element of cn('mod-tooltip-active')) {
                    if (element.dataset.forelement == idstring) {
                        element.classList.remove('mod-tooltip-active');
                        element.classList.add('mod-tooltip');
                        setTimeout(function() { tryRemove(element) }, 300);
                    }
                }
            });
        }
    }





    // 7 - PAGEUPDATE FUNCTIONS

    // Autoreload page if Somtoday error occurs
    function autoReload() {
        // Somtoday behaves weird with multiple tabs open. To solve this, this code reloads the page. It also adds protections to prevent a reload loop.
        if (get("bools").charAt(12) == "1" && autorefreshAvailable && getPagesLoaded() > 1) {
            if (parseFloat((new Date() - get('reload')) / 1000) <= 2 && get("bools").charAt(13) == "0") {
                // Display warning message
                modMessage('Multitab browsing fout', 'Er zijn veel opeenvolgende refreshes door Somtoday Mod gedetecteerd. Het wordt aangeraden Multitab browsing uit te zetten om zo een reload loop te voorkomen. Wil je Multitab browsing uitzetten?</p><br><p style="display: inline-block;">Dit bericht niet meer tonen</p><label class="switch" for="dont-show-again"><input type="checkbox" id="dont-show-again"><div class="slider round"></div></label>', 'Uitzetten (aangeraden)', 'Aanlaten', false, true, true);
                id('mod-message-action1').addEventListener("click", function() {
                    if (id('dont-show-again').checked) {
                        set('bools', get('bools').replaceAt(13, "1"));
                    }
                    set('bools', get('bools').replaceAt(12, "0"));
                    id('mod-message').classList.remove('mod-msg-open');
                    setTimeout(function () { tryRemove(id('mod-message')); }, 350); });
                id('mod-message-action2').addEventListener("click", function() {
                    if (id('dont-show-again').checked) {
                        set('bools', get('bools').replaceAt(13, "1"));
                    }
                    modMessage('Zeker weten?', 'Ga alleen door als je de instelling Multitab browsing al langere tijd aan hebt staan.', 'Doorgaan', 'Multitab browsing uitzetten', true, false, true);
                    id('mod-message-action1').addEventListener("click", function() {
                        window.location.reload();
                        id('mod-message').classList.remove('mod-msg-open');
                        setTimeout(function () { tryRemove(id('mod-message')); }, 355);
                    });
                    id('mod-message-action2').addEventListener("click", function() {
                        set('bools', get('bools').replaceAt(12, "0"));
                        id('mod-message').classList.remove('mod-msg-open');
                        setTimeout(function () { tryRemove(id('mod-message')); }, 355);
                    });
                });
            }
            else {
                // Reload with set delay to prevent fast reload loop
                let reloadTimeout = -0.00035 * Math.pow(new Date() - get('reload'), 2) + 6000;
                if (reloadTimeout < 0) {
                    reloadTimeout = 0;
                }
                setTimeout(function() {
                    set("reload", new Date());
                    if (!n(target)) {
                        if (!n(target.href)) {
                            window.location.href = target.href;
                        }
                        else {
                            window.location.reload();
                        }
                    }
                    else {
                        window.location.reload();
                    }
                }, reloadTimeout);
                return;
            }
        }
    }

    // Apply default Somtoday Mod-styles to the master and detail panel
    function panelStyles() {
        if (n(id('master-panel')) || n(id("detail-panel-wrapper"))) {
            return;
        }
        id('detail-panel-wrapper').style.visibility = 'visible';
        if (get('layout') == 4) {
            id('master-panel').style.width = 'calc(60% / ' + (get("zoom") / 100) + ' - 30px)';
            id('detail-panel-wrapper').style.width = 'calc(40% / ' + (get("zoom") / 100) + ')';
        } else if (get('layout') == 1) {
            id('master-panel').style.width = 'calc((60% - 20%) / ' + (get("zoom") / 100) + ' - 30px)';
            id('detail-panel-wrapper').style.width = 'calc((40% - 10%) / ' + (get("zoom") / 100) + ')';
            id('background-image-overlay').style.height = (Math.max(id('master-panel').clientHeight, id('detail-panel-wrapper').clientHeight) * (get('zoom') / 100)) + 'px';
        } else {
            id('master-panel').style.width = 'calc((60% - min(120px, 14vw)) / ' + (get("zoom") / 100) + ' - 30px)';
            id('detail-panel-wrapper').style.width = 'calc(40% / ' + (get("zoom") / 100) + ')';
        }
        if (!n(cn('is-opendetailpanel', 0)) && id('detail-panel').clientHeight < 30) {
            id('content-wrapper').classList.remove('is-opendetailpanel');
        }
        id('detail-panel').style.width = 'calc((40%) / ' + (get("zoom") / 100) + ' - 30px)';
        if (!n(cn('close-detailpanel', 0)) && get('layout') == 1) {
            cn('close-detailpanel', 0).addEventListener("click", function() {
                if (!n(id('background-image-overlay')) && get('layout') == 1) {
                    id('background-image-overlay').style.height = (Math.max(id('master-panel').clientHeight, id('detail-panel-wrapper').clientHeight) * (get('zoom') / 100)) + 'px';
                }
            });
        }
        if ((get("layout") == 2 || get("layout") == 3) && n(cn("leermiddelenMaster", 0))) {
            if ((id('detail-panel').clientHeight < 50) ) {
                id("detail-panel-wrapper").style.opacity = '0';
            }
            else {
                id("detail-panel-wrapper").style.opacity = '1';
            }
        }
        else {
            id("detail-panel-wrapper").style.opacity = '1';
        }
        for (const element of tn('input')) {
            element.classList.add('notranslate');
        }
    }

    // Get date from URL, then if available get date from page element
    function homeworkDate() {
        let date = "ma 01 jan.";
        let selectedday = isNaN(parseInt(window.location.href.replace(/([^]*datum=([0-9]*)-)([0-9]*)-([0-9]*)([^]*)/g, "$2"))) ? dayInt : parseInt(window.location.href.replace(/([^]*datum=([0-9]*)-)([0-9]*)-([0-9]*)([^]*)/g, "$2"));
        let selectedmonth = isNaN(parseInt(window.location.href.replace(/([^]*datum=([0-9]*)-)([0-9]*)-([0-9]*)([^]*)/g, "$3"))) ? month + 1 : parseInt(window.location.href.replace(/([^]*datum=([0-9]*)-)([0-9]*)-([0-9]*)([^]*)/g, "$3"));
        let selectedyear = isNaN(parseInt(window.location.href.replace(/([^]*datum=([0-9]*)-)([0-9]*)-([0-9]*)([^]*)/g, "$4"))) ? year : parseInt(window.location.href.replace(/([^]*datum=([0-9]*)-)([0-9]*)-([0-9]*)([^]*)/g, "$4"));
        if (!n(cn("yellow ribbon", 0))) {
            if (!n(cn("yellow ribbon", 0).children[0])) {
                if (!n(cn("yellow ribbon", 0).children[0].getElementsByTagName("span")[0])) {
                    date = cn("yellow ribbon", 0).children[0].getElementsByTagName("span")[0].innerHTML;
                    selectedday = parseInt(date.charAt(3) + date.charAt(4));
                    const month = date.charAt(6) + date.charAt(7) + date.charAt(8);
                    selectedyear = parseInt(date.charAt(11) + date.charAt(12) + date.charAt(13) + date.charAt(14));
                    if (isNaN(selectedyear)) {
                        selectedyear = year;
                    }
                    selectedmonth = 1;
                    switch (month) {
                        case 'jan': selectedmonth = 1; break;
                        case 'feb': selectedmonth = 2; break;
                        case 'mrt': selectedmonth = 3; break;
                        case 'apr': selectedmonth = 4; break;
                        case 'mei': selectedmonth = 5; break;
                        case 'jun': selectedmonth = 6; break;
                        case 'jul': selectedmonth = 7; break;
                        case 'aug': selectedmonth = 8; break;
                        case 'sep': selectedmonth = 9; break;
                        case 'okt': selectedmonth = 10; break;
                        case 'nov': selectedmonth = 11; break;
                        case 'dec': selectedmonth = 12; break;
                    }
                }
            }
        }
        return [selectedday, selectedmonth, selectedyear];
    }

    // Construct a nextmonth and previousmonth url which takes leap years and stuff into account
    function monthNavigation() {
        let nexturl;
        let prevurl;
        const selectedDate = homeworkDate();
        let selectedday = selectedDate[0];
        let selectedmonth = selectedDate[1];
        let selectedyear = selectedDate[2];
        if (selectedday > 30) {
            selectedday = 30;
        }
        nexturl = selectedday + '-' + (selectedmonth + 1) + '-' + selectedyear;
        prevurl = selectedday + '-' + (selectedmonth - 1) + '-' + selectedyear;
        if (selectedmonth == 12) {
            nexturl = selectedday + '-1-' + (selectedyear + 1);
        }
        if (selectedmonth == 1) {
            prevurl = selectedday + '-12-' + (selectedyear - 1);
        }
        if (selectedday > 28 && selectedmonth == 3) {
            // Check for leap year
            if ((selectedyear / 4) == Math.round(selectedyear / 4)) {
                prevurl = '29-2-' + selectedyear;
            } else {
                prevurl = '28-2-' + selectedyear;
            }
        } else if (selectedday > 28 && selectedmonth == 1) {
            // Check for leap year
            if ((selectedyear / 4) == Math.round(selectedyear / 4)) {
                nexturl = '29-2-' + selectedyear;
            } else {
                nexturl = '28-2-' + selectedyear;
            }
        }
        // If the nextmonth and previousmonth buttons do not exist yet, insert them
        if (n(id("mod-nextmonth")) && !n(cn("d-next", 0))) {
            cn("d-next", 0).insertAdjacentHTML('afterend', '<a id="mod-nextmonth" href="' + window.location.origin + '/home/homework?datum=' + nexturl + '&windowsize=23">' + getIcon('forward', null, colors[6], 'style="height: 1.5em;"') + '</a>');
            bindTooltip('mod-nextmonth', 'Maand vooruit');
        }
        if (n(id("mod-prevmonth")) && !n(cn("d-prev", 0))) {
            cn("d-prev", 0).insertAdjacentHTML('beforebegin', '<a id="mod-prevmonth" href="' + window.location.origin + '/home/homework?datum=' + prevurl + '&windowsize=23">' + getIcon('backward', null, colors[6], 'style="height: 1.5em;"') + '</a>');
            bindTooltip('mod-prevmonth', 'Maand terug');
        }
        // Remove empty days if enabled
        if (get("bools").charAt(10) == "1") {
            while (!n(cn("type-empty", 0))) {
                tryRemove(cn("type-empty", 0).parentNode.parentNode.parentNode);
            }
        }
    }

    // Change a lot of Somtoday default icons to Font Awesome icons
    function icons() {
        for (const element of cn('icon-huiswerk')) {
            setHTML(element, getIcon('pencil', null, "rgba(0,0,0,0.5)"));
        }
        for (const element of cn('icon-trash')) {
            setHTML(element, getIcon('xmark', null, colors[6]));
        }
        for (const element of cn('icon-studiewijzer')) {
            setHTML(element, getIcon('book', null, "rgba(0,0,0,0.5)"));
        }
        for (const element of cn('icon-toets')) {
            setHTML(element, getIcon('pencil', null, "rgba(0,0,0,0.5)"));
        }
        for (const element of cn('icon-grote-toets')) {
            setHTML(element, getIcon('pencil', null, "rgba(0,0,0,0.5)"));
        }
        for (const element of cn('icon-leermiddelen')) {
            setHTML(element, getIcon('book-bookmark', null, "rgba(0,0,0,0.5)"));
        }
        for (const element of cn('IconFont')) {
            if (element.classList.contains('icon-envelope-attach')) {
                setHTML(element, '<div class="mod-paperclip">' + getIcon("paperclip", null, colors[12], 'style="width: 12px; height: 12px; margin-top: 3px"') + '</div>' + getIcon("envelope", null, colors[6]));
            } else if (element.classList.contains('icon-envelope-open-attach')) {
                setHTML(element, '<div class="mod-paperclip">' + getIcon("paperclip", null, colors[12], 'style="width: 12px; height: 12px; margin-top: 3px"') + '</div>' + getIcon("envelope-open", null, colors[6]));
            } else if (element.classList.contains('icon-envelope')) {
                setHTML(element, getIcon("envelope", null, colors[6]));
            } else if (element.classList.contains('icon-envelope-open')) {
                setHTML(element, getIcon("envelope-open", null, colors[6]));
            } else if (element.classList.contains('icon-resultaten') && !element.classList.contains('MainMenuIcons')) {
                setHTML(element, getIcon("clipboard-check", null, colors[6]));
            } else if (element.classList.contains('icon-edit')) {
                setHTML(element, getIcon("pen-to-square", null, colors[6]));
            } else if (element.classList.contains('icon-user-quest')) {
                setHTML(element, getIcon("comment-dots", null, colors[6]));
            } else if (element.classList.contains('icon-user-watch')) {
                setHTML(element, getIcon("eye", null, colors[6]));
            } else if (element.classList.contains('icon-user-warning')) {
                setHTML(element, getIcon("circle-exclamation", null, colors[6]));
            } else if (element.classList.contains('icon-check')) {
                setHTML(element, getIcon("square-check", null, colors[6]));
                element.classList.add('mod-icon-hide');
            } else if (element.classList.contains('icon-check-empty')) {
                setHTML(element, getIcon("square", null, colors[6]));
                element.classList.add('mod-icon-hide');
            } else if (element.classList.contains('icon-chevron-right')) {
                setHTML(element, getIcon("chevron-right", null, colors[6]));
            } else if (element.classList.contains('MainMenuIcons')) {
                if (!n(element.children[0])) {
                    if (element.children[0].classList.contains('icon-check')) {
                        setHTML(element, getIcon("square-check", null, colors[6]));
                    } else if (element.children[0].classList.contains('icon-check-empty')) {
                        setHTML(element, getIcon("square", null, colors[6]));
                    }
                }
            }
        }
        // Change next and previous day/week icon
        setHTML(cn("d-next", 0), getIcon('chevron-right', null, colors[6], 'style="height: 1.5em;"'));
        setHTML(cn("d-prev", 0), getIcon('chevron-left', null, colors[6], 'style="height: 1.5em;"'));
        // Change assignment warning icon for assignments (warning is shown when deadline is approaching or when it has already passed)
        if (!n(cn("warningPeriode", 0))) {
            for (const element of cn('warningPeriode')) {
                if (!n(element.children[1])) {
                    if (element.children[1].innerHTML == "De deadline is verlopen") {
                        setHTML(element, '<div class="info-notice nobackground">' + getIcon('circle-info', null, colors[7], 'style="height: 20px;"') + 'De deadline is verlopen</div>');
                    } else if (element.children[1].innerHTML == "Inleverperiode loopt bijna af") {
                        setHTML(element, '<div class="info-notice nobackground">' + getIcon('circle-info', null, colors[7], 'style="height: 20px;"') + 'Inleverperiode loopt bijna af</div>');
                    }
                }
            }
        }
        // Add new icon to mark-message-as-unseen button and update the message count when it is clicked
        for (const element of cn('icon-envelope-open icon-lg')) {
            setHTML(element, getIcon("envelope-open", null, colors[6]));
            if (!element.classList.contains('mod-event-listener')) {
                element.addEventListener('click', function() {
                    this.style.pointerEvents = 'none';
                    if (!n(id('inbox-counter'))) {
                        setHTML(id('inbox-counter'), (parseInt(id('inbox-counter').innerText) + 1).toString());
                        id('inbox-counter').classList.remove("no-unread-messages");
                    }
                });
                element.classList.add('mod-event-listener');
            }
        }
        // Add new icon to delete-message button
        for (const element of cn('icon-trash')) {
            setHTML(element, getIcon("trash", null, colors[6]));
        }
    }

    // Add new icons at panel header
    function panelHeaderIcons() {
        if (!n(cn("activityMaster", 0)) || !n(cn("absenceMaster", 0)) || !n(cn("berichtenMaster", 0))) {
            let number = 1;
            if ((!n(cn('yellow ribbon', 0))) && !n(cn('yellow ribbon', 0).children[0])) {
                if (!n(cn("activityMaster", 0))) {
                    if (cn('yellow ribbon', 0).children[0].children[4]) {
                        setHTML(cn('yellow ribbon', 0).children[0].children[1], cn('yellow ribbon', 0).children[0].children[1].classList.contains('checked') ? getIcon("envelope", null, colors[6]) : getIcon("envelope", null, colors[1]));
                        setHTML(cn('yellow ribbon', 0).children[0].children[2], cn('yellow ribbon', 0).children[0].children[2].classList.contains('checked') ? getIcon("calendar-days", null, colors[6]) : getIcon("calendar-days", null, colors[1]));
                        setHTML(cn('yellow ribbon', 0).children[0].children[3], cn('yellow ribbon', 0).children[0].children[3].classList.contains('checked') ? getIcon("clipboard-check", null, colors[6]) : getIcon("clipboard-check", null, colors[1]));
                        setHTML(cn('yellow ribbon', 0).children[0].children[4], cn('yellow ribbon', 0).children[0].children[4].classList.contains('checked') ? getIcon("user-clock", null, colors[6]) : getIcon("user-clock", null, colors[1]));
                    }
                }
                else if (!n(cn("absenceMaster", 0))) {
                    if (cn('yellow ribbon', 0).children[0].children[3]) {
                        setHTML(cn('yellow ribbon', 0).children[0].children[1], cn('yellow ribbon', 0).children[0].children[1].classList.contains('checked') ? getIcon("comment-dots", null, colors[6]) : getIcon("comment-dots", null, colors[1]));
                        setHTML(cn('yellow ribbon', 0).children[0].children[2], cn('yellow ribbon', 0).children[0].children[2].classList.contains('checked') ? getIcon("eye", null, colors[6]) : getIcon("eye", null, colors[1]));
                        setHTML(cn('yellow ribbon', 0).children[0].children[3], cn('yellow ribbon', 0).children[0].children[3].classList.contains('checked') ? getIcon("circle-exclamation", null, colors[6]) : getIcon("circle-exclamation", null, colors[1]));
                    }
                }
                else if (!n(cn("berichtenMaster", 0))) {
                    if (cn('yellow ribbon', 0).children[0].children[2]) {
                        setHTML(cn('yellow ribbon', 0).children[0].children[1].children[0], cn('yellow ribbon', 0).children[0].children[1].classList.contains('checked') ? getIcon("right-to-bracket", null, colors[6], 'style="cursor: pointer;"') : getIcon("right-to-bracket", null, colors[1], 'style="cursor: pointer;"'));
                        setHTML(cn('yellow ribbon', 0).children[0].children[2].children[0], cn('yellow ribbon', 0).children[0].children[2].classList.contains('checked') ? getIcon("right-from-bracket", null, colors[6], 'style="cursor: pointer;"') : getIcon("right-from-bracket", null, colors[1], 'style="cursor: pointer;"'));
                    }
                }
                if (!n(cn('yellow ribbon', 0).children[0].getElementsByTagName('span')[0])) {
                    setHTML(cn('yellow ribbon', 0).children[0].getElementsByTagName('span')[0], '');
                }
            }
        }
    }

    // Display full grade description instead of only a few words
    function gradeDescription() {
        for (const element of cn('tog-period')) {
            if (!n(element.children[0].title)) {
                setHTML(element.children[0], element.children[0].title.replace(/(\r\n|\n|\r)/gm, " "));
            }
        }
    }

    // Close button doesn't work on the subjects page for some reason (also doesn't work without mod), so make it work again
    function subjectPageCloseButton() {
        hide(cn('panel-header', 0));
        if (!n(cn('close-detailpanel', 0))) {
            cn('close-detailpanel', 0).addEventListener("click", function() {
                id('content-wrapper').classList.remove('is-opendetailpanel');
            });
        }
    }

    // Insert selected subject name on learning resources page
    function addSubjectName() {
        // Hide panel header
        hide(cn('panel-header', 0));
        if (!n(cn('m-wrapper active', 0))) {
            // Option one - Somtoday inserts different styled version, change it to the expected one
            if (!n(cn("leermiddelenDetail", 0).getElementsByClassName('panel-header')[0])) {
                if (!n(cn('vakAfkortingFontSize', 0))) {
                    if (cn('m-wrapper active', 0).getElementsByTagName('h2')[0].innerHTML != "Algemeen") {
                        setHTML(cn("leermiddelenDetail", 0).getElementsByClassName('panel-header')[0], '<div class="type">' + cn('m-wrapper active', 0).getElementsByClassName('type')[0].children[0].innerHTML + '</div><div class="r-content"><h2>' + cn('m-wrapper active', 0).getElementsByTagName('h2')[0].innerHTML + '</h2></div>');
                    }
                }
            }
            // Option two - Somtoday doesn't
            else {
                if (!n(cn('m-wrapper active', 0).getElementsByClassName('type')[0]) && !n(cn('m-wrapper active', 0).getElementsByTagName('h2')[0])) {
                    if (!n(cn('m-wrapper active', 0).getElementsByClassName('type')[0].children[0])) {
                        if (cn('m-wrapper active', 0).getElementsByTagName('h2')[0].innerHTML != "Algemeen") {
                            cn("leermiddelenDetail", 0).insertAdjacentHTML('afterbegin', '<div><div class="panel-header"><div class="type">' + cn('m-wrapper active', 0).getElementsByClassName('type')[0].children[0].innerHTML + '</div><div class="r-content"><h2>' + cn('m-wrapper active', 0).getElementsByTagName('h2')[0].innerHTML + '</h2></div></div></div>');
                        }
                    }
                }
            }
            // Display no learning resources message
            if (n(cn("double", 0)) && !n(cn('m-wrapper active', 0).getElementsByClassName('type')[0])) {
                if (!n(cn('m-wrapper active', 0).getElementsByClassName('type')[0].children[0])) {
                    if (cn('m-wrapper active', 0).getElementsByTagName('h2')[0].innerHTML != "Algemeen") {
                        cn("leermiddelenDetail", 0).getElementsByClassName('panel-header')[0].insertAdjacentHTML('afterend', '<p style="font-size: 12px;">Je hebt geen leermiddelen voor dit vak.</p>');
                    }
                }
            }
        }
        // Open learning resources in new tab if enabled in settings
        if (get('bools').charAt(14) == '1') {
            for (const element of cn('header')) {
                if (element.tagName == "A") {
                    element.target = "_blank";
                }
            }
        }
    }

    // Get user birthday from profile page and save it in storage
    // Also change username if user has set different username
    function settingData() {
        id('detail-panel-wrapper').setAttribute('style', 'visibility: hidden;');
        for (const element of cn('label twopartfields')) {
            if (((!n(element.parentElement.parentElement.children[1])) && !n(element.parentElement.parentElement.children[1].children[0])) && !n(element.parentElement.parentElement.children[1].children[0].children[0])) {
                if (element.textContent.includes("Geboortedatum")) {
                    set("birthday", element.parentElement.parentElement.children[1].children[0].children[0].innerText);
                }
                else if (element.textContent.includes("Volledige naam") && !n(get('username'))) {
                    setHTML(element.parentElement.parentElement.children[1].children[0].children[0], get('username').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                }
            }
        }
    }

    // If user has specified nicknames, change docent names (or own name) to nickname
    // Doesn't use innerHTML for docent names because innerHTML doesn't allow script injection
    function nicknames() {
        if (!n(get("nicknames")) && !isOpen("leermiddelenMaster")) {
            let namearray = get("nicknames").split("|");
            for (let i = 0; i < (namearray.length / 2); i++) {
                let real = namearray[i * 2];
                let nick = namearray[i * 2 + 1];
                if (real != "") {
                    let regex = new RegExp("((<span>)(.*?))" + real.replace(/\\/g, '\\\\') + "((.*?)(<\/span>)+?)", "g");
                    nick = "$1" + nick + "$4";
                    for (const element of cn("r_content sub")) {
                        // Element is in message list
                        if ((!n(element.children[1])) && !n(element.children[1].children[1])) {
                            element.children[1].parentElement.append(document.createRange().createContextualFragment(element.children[1].innerHTML.replace(regex, nick)));
                            tryRemove(element.children[1]);
                        }
                    }
                    for (const element of cn("r-content")) {
                        if (!element.classList.contains('bericht')) {
                            if ((!n(element.children[0])) && element.children[0].tagName == "SPAN") {
                                element.prepend(document.createRange().createContextualFragment(("<span>" + element.children[0].innerHTML + "</span>").replace(regex, nick)));
                                tryRemove(element.children[1]);
                            }
                            if (!n(element.getElementsByClassName('sub')[0])) {
                                element.append(document.createRange().createContextualFragment(("<div class='sub'>" + element.getElementsByClassName('sub')[0].innerHTML + "</div>").replace(regex, nick)));
                                tryRemove(element.getElementsByClassName('sub')[0]);
                            }
                        }
                    }
                    for (const element of cn("twopartfields")) {
                        if ((!n(element.children[0])) && element.children[0].tagName == "SPAN") {
                            element.prepend(document.createRange().createContextualFragment(("<span>" + element.children[0].innerHTML + "</span>").replace(regex, nick)));
                            tryRemove(element.children[1]);
                        }
                    }
                }
            }
        }
        if (!n('username')) {
            for (const element of cn("sub")) {
                if ((!n(element.children[0])) && !n(element.children[0].children[1])) {
                    setHTML(element.children[0].children[1], element.children[0].children[1].innerHTML.replace(realname, get('username').replace(/</g, '&lt;').replace(/>/g, '&gt;')));
                }
                if (!n(element.getElementsByTagName('label')[0])) {
                    setHTML(element.getElementsByTagName('label')[0], element.getElementsByTagName('label')[0].innerHTML.replace(realname, get('username').replace(/</g, '&lt;').replace(/>/g, '&gt;')));
                }
            }
        }
    }

    // Change profile pictures
    function profilePicture() {
        for (const element of cn("pasfoto")) {
            if (!n(element.src)) {
                // Default profile picture is shown (user has no profile picture)
                if ((element.src.indexOf('pasfoto_geen.jpg') != -1 || element.src.indexOf('defaultpasfoto.jpg') != -1) && element.src.replace(new RegExp("(.+)(&antiCache.+)","g"),"$1") != profilepic) {
                    const newelement = document.createElement("div");
                    newelement.classList.add("pasfoto");
                    setHTML(newelement, getIcon("circle-user", null, colors[7]));
                    element.replaceWith(newelement);
                }
                // User has profile picture, change it to initials or custom profile picture if enabled in settings
                if (!n(get("profilepic")) || get("bools").charAt(2) == "0") {
                    if (element.src.replace(new RegExp("(.+)(&antiCache.+)","g"),"$1") == profilepic) {
                        if (get("bools").charAt(2) == "0") {
                            element.insertAdjacentHTML('afterend', '<div class="pasfoto profile-img">' + (!n(initials) ? getIcon('user', null, null, 'style="margin-top:10px;height:80%;"') : initials) + '</div>');
                            tryRemove(element);
                        }
                        else {
                            element.src = get("profilepic");
                        }
                    }
                }
            }
        }
    }

    // New toolbar for new message panel at messages page
    function toolbar() {
        // Add new toolbar icons
        if (!n(cn("toolbar-wrap", 0)) && n(id("new-toolbar"))) {
            cn("toolbar-wrap", 0).insertAdjacentHTML('afterbegin', '<div id="new-toolbar">' + getIcon("bold", null, colors[6]) + getIcon("italic", null, colors[6]) + getIcon("underline", null, colors[6]) + "<div></div>" + getIcon("subscript", null, colors[6]) + getIcon("superscript", null, colors[6]) + "<div></div>" + getIcon("rotate-left", null, colors[6]) + getIcon("rotate-right", null, colors[6]) + "<div></div>" + getIcon("list-ol", null, colors[6]) + getIcon("list-ul", null, colors[6]) + "<div></div>" + getIcon("link", null, colors[6]) + "<div></div>" + getIcon("h1", null, colors[6]) + getIcon("h2", null, colors[6]) + getIcon("h3", null, colors[6]) + "<div></div>" + getIcon("code", null, colors[6]) + getIcon("xmark", null, colors[6]) + '</div>');
            cn('w-100p unitHeight_100', 0).addEventListener('focus', function test(event) {
                event.stopImmediatePropagation();
            }, true);
        }
        // Update message iframe height and change iframe fontsize and stuff
        // Also disable auto-translating in iframe so it doesn't translate your message (this happens in Edge)
        if ((!n(cn('wysiwyg ui-resizable', 0))) && !n(cn('wysiwyg ui-resizable', 0).children[1])) {
            cn('wysiwyg ui-resizable', 0).classList.add('notranslate');
            let x = cn('wysiwyg ui-resizable', 0).children[1];
            let y = (x.contentWindow || x.contentDocument);
            if (y.document) {
                y = y.document;
            }
            x.classList.add('notranslate');
            y.getElementsByTagName('html')[0].classList.add('notranslate');
            y.getElementsByTagName('body')[0].classList.add('notranslate');
            y.getElementsByTagName('html')[0].translate = 'no';
            const iframeHeight = setInterval(function (){
                if ((!n(cn('wysiwyg ui-resizable', 0))) && !n(cn('wysiwyg ui-resizable', 0).children[1])) {
                    // Setting the height smaller causes scrolling problem in layout 2 and 3 if the setting Always show menu is enabled
                    if ((get('layout') == 1 || get('layout') == 4) || ((get('layout') == 2 || get('layout') == 3) && get('bools').charAt(3) == '0')) {
                        cn('wysiwyg ui-resizable', 0).children[1].style.height = '150px';
                    }
                    cn('wysiwyg ui-resizable', 0).children[1].style.height = y.body.scrollHeight + 'px';
                    window.dispatchEvent(new Event('resize'));
                    y.body.style.fontSize = "15px";
                    y.body.style.paddingRight = "15px";
                    y.body.style.color = colors[11];
                    y.body.style.wordWrap = "break-word";
                    y.body.style.overflow = "hidden";
                }
                else {
                    clearInterval(iframeHeight);
                }
            }, 10);
        }
    }

    // Update page name in menu
    function pageName() {
        if (!n(tn('h1', 1))) {
            if (get('layout') == 4 || get('layout') == 1) {
                if (!n(id('page-title').getElementsByTagName('p')[0])) {
                    setHTML(id('page-title').getElementsByTagName('p')[0], tn('h1', 1).innerHTML);
                }
            } else {
                setHTML(id('page-title'), tn('h1', 1).innerHTML);
            }
        }
    }

    // Hide conversation beneath messages if empty
    function hideConversation() {
        if (!n(cn('conversation', 0))) {
            if (cn('conversation', 0).clientHeight < 50) {
                hide(cn('conversation', 0));
            }
            else {
                show(cn('conversation', 0));
                if (n(id('conversation-header'))) {
                    cn('conversation', 0).insertAdjacentHTML('afterbegin', '<h3 id="conversation-header" style="margin-bottom: -10px;">Gesprek</h3>');
                }
            }
        }
    }

    // Add message to news page if you have no lessons today
    function roosterEmpty() {
        if ((!n(id('detail-panel')) && !n(cn('activityDetail', 0))) && !n(cn('activityDetail', 0).getElementsByClassName('left')[0])) {
            if (n(id('detail-panel').getElementsByClassName('box')[0]) && n(id('mod-nolessons'))) {
                cn('activityDetail', 0).getElementsByClassName('left')[0].insertAdjacentHTML('beforeend', '<p id="mod-nolessons" style="padding-top:8px;">Je hebt geen lessen meer vandaag!</p>');
            }
        }
    }

    // Apply style to master panel on roster page
    function roosterLayout() {
        if (get('layout') == 1) {
            id('master-panel').style.width = 'calc((100% - 30%) / ' + (get("zoom") / 100) + ')';
        } else {
            id('master-panel').style.width = 'calc(100% / ' + (get("zoom") / 100) + ')';
        }
    }

    // Remove some elements if they aren't needed anymore
    function hideElements() {
        // Remove modactions if page is not profile page
        if (n(id('modsettings'))) {
            tryRemove(id("modactions"));
            tryRemove(id("modsettingsfontscript"));
        }
        // Remove calendar
        tryRemove(id('calendar'));
    }

    // Add homework/test/exam indicator to calendar days
    function calendarHomework() {
        if (get("bools").charAt(11) == "0") {
            let isSelected = false;
            for (const element of cn('m-element')) {
                if (((!n(element.parentNode)) && !n(element.parentNode.parentNode)) && !n(element.parentNode.parentNode.getElementsByClassName('date-month')[0])) {
                    let daymonth = element.parentNode.parentNode.getElementsByClassName('date-month')[0].innerHTML;
                    daymonth = daymonth.slice(0, -1);
                    daymonth = daymonth.charAt(0).toUpperCase() + daymonth.slice(1);
                    let day = "";
                    // Check if day is from displayed month
                    if (((!n(id('month'))) && id('month').innerHTML.charAt(0) == daymonth.charAt(0)) && !n(element.parentNode.parentNode.getElementsByTagName('span')[0])) {
                        day = element.parentNode.parentNode.getElementsByTagName('span')[0].innerHTML;
                        // Set id to day so calendar can reference to it
                        element.parentNode.parentNode.getElementsByTagName('span')[0].id = 'mod-day-' + day;
                        // Check if day contains icon
                        if (!n(element.getElementsByClassName('right')[1])) {
                            if (!n(element.getElementsByClassName('right')[1].children[0])) {
                                if (element.getElementsByClassName('right')[1].children[0].classList.contains('icon-grote-toets')) {
                                    // This day contains an exam
                                    if (day != "") {
                                        id('days').querySelectorAll('[data-day="' + day + '"]')[0].classList.add("red");
                                    }
                                } else if (element.getElementsByClassName('right')[1].children[0].classList.contains('icon-toets')) {
                                    // This day contains a test
                                    if (day != "") {
                                        id('days').querySelectorAll('[data-day="' + day + '"]')[0].classList.add("orange");
                                    }
                                }
                            } else {
                                // This day contains homework, which has no icon
                                if (day != "") {
                                    id('days').querySelectorAll('[data-day="' + day + '"]')[0].classList.add("green");
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Inserts a calendar into the homework page when enabled
    function insertCalendar() {
        if (get("bools").charAt(11) == "0") {
            id("detail-panel-wrapper").style.opacity = '1';
            if ((id('detail-panel').clientHeight < 100) || (id('detail-panel').clientHeight < 200 && (get('layout') == 1 || get('layout') == 4))) {
                tryRemove(id("calendar"));
                const selectedDate = homeworkDate();
                let selectedmonth = selectedDate[1] - 1;
                let selectedyear = selectedDate[2];
                // Calendar thanks to GeeksForGeeks: https://www.geeksforgeeks.org/how-to-create-a-dynamic-calendar-in-html-css-javascript/
                id('detail-panel').insertAdjacentHTML('afterbegin', '<div id="calendar"><div class="month"><ul><li id="month"></li><li id="year"></li><li style="float:unset;clear:both;"></li></ul></div><ul id="weekdays"><li>Ma</li><li>Di</li><li>Wo</li><li>Do</li><li>Vr</li><li>Za</li><li>Zo</li></ul><ul id="days"></ul></div>');
                let calendarBody = id("days");
                let months = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];
                function showDate(e) {
                    if (cn("selected", 0) != null) {
                        cn("selected", 0).classList.remove("selected");
                    }
                    e.classList.add("selected");
                    let showYear = e.getAttribute("data-year");
                    let showMonth = e.getAttribute("data-month");
                    let showDay = e.getAttribute("data-day");
                }

                function showCalendar(month, year) {
                    let firstDay = new Date(year, month).getDay();
                    setHTML(calendarBody, "");
                    let totalDays = daysInMonth(month, year);
                    blankDates(firstDay === 0 ? 6 : firstDay - 1);
                    for (let day = 1; day <= totalDays; day++) {
                        let cell = document.createElement("li");
                        let cellText = document.createTextNode(day);
                        if (dayInt === day && month === today.getMonth() && year === today.getFullYear()) {
                            cell.classList.add("active");
                            cell.classList.add("selected");
                        }
                        cell.setAttribute("data-day", day);
                        cell.setAttribute("data-month", month);
                        cell.setAttribute("data-year", year);
                        cell.classList.add("singleDay");
                        cell.appendChild(cellText);
                        cell.onclick = function(e) {
                            showDate(e.target);
                            if (!n(id(day))) {
                                id('mod-day-' + day).scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }
                        };
                        calendarBody.appendChild(cell);
                    }
                    setHTML(id("month"), months[month]);
                    setHTML(id("year"), year);
                };
                showCalendar(selectedmonth, selectedyear);

                function daysInMonth(month, year) {
                    return new Date(year, month + 1, 0).getDate();
                }

                function blankDates(count) {
                    for (let x = 0; x < count; x++) {
                        let cell = document.createElement("li");
                        let cellText = document.createTextNode("");
                        cell.appendChild(cellText);
                        cell.classList.add("empty");
                        calendarBody.appendChild(cell);
                    }
                }
                id("detail-panel-wrapper").style.overflow = "visible";
                show(id('calendar'));
                setTimeout(function() {
                    id('calendar').style.height = ((get('layout') == 4 || get('layout') == 1) ? ((id('master-panel').clientHeight + (80 / (get('zoom') / 100))) + 'px') : (id('master-panel').clientHeight) + 'px');
                    if (get('layout') == 2 || get('layout') == 3) {
                        if (!n(id('calendar'))) {
                            id('detail-panel-wrapper').style.height = id('calendar').style.height;
                        }
                    }
                }, 50);
            } else {
                hide(id('calendar'));
            }
        }
    }

    // Adjust the link popup menu at the messages page
    function linkPopup() {
        // Autofill the target field on message-page
        if (!n(cn("createLink", 0))) {
            cn("createLink", 0).addEventListener("click", function() {
                if (!n(cn("wysiwyg ui-dialog-content ui-widget-content", 0))) {
                    setHTML(tn("fieldset", 0).children[0], "Link invoegen");
                    tn("fieldset", 0).children[1].children[0].value = "";
                    tn("fieldset", 0).children[1].children[0].placeholder = "https://example.com";
                    tn("fieldset", 0).children[2].children[0].placeholder = "Titel";
                    tn("fieldset", 0).children[3].children[0].value = "_blank";
                    tn("fieldset", 0).children[4].value = "Link invoegen";
                    tn("fieldset", 0).children[5].value = "Terug";
                }
            });
        }
    }





    // 8 - SETTINGS

    // Open or close settings at profile page
    function openSetting(number) {
        if (number == 1) {
            // Show modsettings
            for (const element of cn('profileMaster', 0).children[0].children) {
                if (!element.classList.contains('panel-header')) {
                    hide(element);
                }
            }
            show(id("modsettings"));
            show(id("modactions"));
        } else {
            // Show profile settings
            for (const element of cn('profileMaster', 0).children[0].children) {
                show(element);
            }
            hide(id("modsettings"));
            hide(id("modactions"));
        }
        // For some reason the background image overlay is a little too small when loading the page, so set it to the correct height
        if (!n(id('background-image-overlay')) && get('layout') == 1) {
            setTimeout(function() {
                id('background-image-overlay').style.height = (Math.max(id('master-panel').clientHeight, id('detail-panel-wrapper').clientHeight) * (get('zoom') / 100)) + 'px';
            }, 50);
        }
    }

    // Reset all settings
    function reset() {
        set("primarycolor", "#0067c2");
        set("nicknames", "");
        set("bools", "010110100110101000000000000000");
        set("zoom", "120");
        set("title", "");
        set("icon", "");
        set("background", "");
        set("transparency", 0.8);
        set("fontname", "Gabarito");
        set("theme", "Standaard");
        set("layout", 1);
        set("profilepic", "");
        set("username", "");
    }

    // Save all settings
    function save() {
        let reload = true;
        // Save all form elements added with addSetting()
        filesProcessed = 0;
        for (const element of cn('mod-custom-setting')) {
            if (element.type == "checkbox" && element.id.indexOf('bools') != -1) {
                set('bools', get('bools').replaceAt(parseInt(element.id.charAt(5) + element.id.charAt(6)), element.checked ? '1' : '0'));
            } else if (element.type == "checkbox" || element.type == "range" || element.type == "text" || element.type == "number" || element.type == "color") {
                // Now save the right value for a few exceptions
                if (element.id == "transparency") {
                    // Transparency is inverted and divided by 100 so it works with the opacity property
                    set("transparency", (100 - element.value) / 100);
                } else if (element.id == "blur") {
                    // Blur is divided by 5 to prevent a too strong effect
                    set("blur", element.value / 5);
                } else if (element.id == "nicknames") {
                    // Nickname string is checked and rejected if not valid
                    let namearray = element.value.split("|");
                    for (let string of namearray) {
                        if (string.indexOf('\\') != -1) {
                            // Escape backslash to prevent escape
                            string = string.replace(/\\/g, '\\\\');
                        }
                    }
                    if (element.value == "") {
                        set("nicknames", "");
                    } else if ((Math.round(namearray.length / 2) == namearray.length / 2) && namearray.length > 1) {
                        set("nicknames", element.value);
                    } else if ((element.value.charAt(element.value.length - 1) == "|") && namearray.length > 1) {
                        set("nicknames", element.value.substring(0, element.value.length - 1));
                    } else {
                        // Prevent reload to show message
                        reload = false;
                        modMessage('Ongeldige nickname string', 'De ingevoerde nickname string is in een verkeerd formaat.', 'Oke');
                        id('mod-message-action1').addEventListener("click", function() { window.location.reload(); });
                    }
                }
                else {
                    set(element.id, element.value);
                }
            } else if (element.type == "file") {
                if (element.files.length != 0) {
                    // Compress files to desired size in pixels using canvas
                    let size = element.dataset.size;
                    if (!n(size) && (element.files[0].type == "image/png" || element.files[0].type == "image/jpeg" || element.files[0].type =="image/webp")) {
                        size = parseInt(size);
                        const canvas = document.createElement("canvas");
                        let ctx = canvas.getContext('2d');
                        let img = new Image;
                        canvas.height = size;
                        canvas.width = size;
                        img.onload = function () {
                            canvas.height = canvas.width * (img.height / img.width);
                            let oc = document.createElement('canvas'), octx = oc.getContext('2d');
                            oc.width = img.width * 0.5;
                            oc.height = img.height * 0.5;
                            octx.drawImage(img, 0, 0, oc.width, oc.height);
                            octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);
                            ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5, 0, 0, canvas.width, canvas.height);
                            const result = canvas.toDataURL("image/webp");
                            if (result.length > 100) {
                                set(element.id, result);
                                filesProcessed++;
                            }
                            // If result is empty data URI, fall back to non-compressed file
                            else {
                                let reader = new FileReader();
                                reader.readAsDataURL(element.files[0]);
                                reader.onload = function() {
                                    set(element.id, reader.result);
                                    filesProcessed++;
                                };
                            }
                        }
                        img.src = URL.createObjectURL(element.files[0]);
                    }
                    // File should not be compressed
                    else {
                        let reader = new FileReader();
                        reader.readAsDataURL(element.files[0]);
                        reader.onload = function() {
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
        const selectedtheme = cn('theme-selected', 0);
        if (!n(selectedtheme)) {
            if (id('primarycolor').classList.contains('mod-modified') == false) {
                set("primarycolor", "#" + selectedtheme.dataset.color);
            }
            if (id('transparency').classList.contains('mod-modified') == false) {
                set('transparency', ((100 - selectedtheme.dataset.transparency) / 100));
            }
            if (id('bools00').classList.contains('mod-modified') == false) {
                set('bools', get('bools').replaceAt(0, selectedtheme.dataset.dark == "true" ? "1" : "0"));
            }
            set("theme", selectedtheme.dataset.name);
            if (selectedtheme.id != "Standaard") {
                toDataURL(selectedtheme.dataset.url, function(dataUrl) {
                    set("background", dataUrl);
                    filesProcessed++;
                }); }
            else {
                set("background", "");
                filesProcessed++;
            }
        }
        else {
            filesProcessed++;
        }
        if (!n(cn('layout-selected', 0))) {
            set('layout', parseInt(cn('layout-selected', 0).id.charAt(7)));
        }
        if (!n(id('randombackground'))) {
            if (id('randombackground').classList.contains('mod-active')) {
                toDataURL('https://picsum.photos/1600/800', function(dataUrl) {
                    set("background", dataUrl);
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
        for (const element of cn("mod-file-reset")) {
            if (element.classList.contains('mod-active')) {
                set(element.dataset.key, "");
            }
        }
        // Save fontname, because it is not added with addSetting()
        set("fontname", id("font").value);
        // Reload page to show changes
        // Only reload when all files are processed (required for Firefox, but also an extra check for the other browsers)
        if (reload) {
            saveReload();
        }
    }

    // Make sure everything is saved before reload
    function saveReload() {
        if ((cn('mod-file-input').length + 2) == filesProcessed) {
            window.location.reload();
        }
        else {
            setTimeout(saveReload, 100);
        }
    }

    // Constructs HTML code for the setting page
    function addSetting(name, description, key, type, value, param1, param2, param3, param4) {
        if (get(key) == null && !key.startsWith('bools')) {
            set(key, value);
        }
        let code = '<div><h3>' + name + '</h3><p>' + description + '</p>';
        if (type == "checkbox") {
            if (key.startsWith('bools')) {
                code += '<label class="switch" for="' + key + '"><input title="' + name + '" class="mod-custom-setting" type="checkbox" ' + (get('bools').charAt(parseInt(key.charAt(5) + key.charAt(6))) == "1" ? 'checked' : '') + ' oninput="this.classList.add(\'mod-modified\');" id="' + key + '"/><div class="slider round"></div></label></div>';
            } else {
                code += '<label class="switch" for="' + key + '"><input title="' + name + '" class="mod-custom-setting" type="checkbox" ' + (get(key) ? 'checked' : '') + ' oninput="this.classList.add(\'mod-modified\');" id="' + key + '"/><div class="slider round"></div></label></div>';
            }
        } else if (type == "range") {
            code += '<input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="range" value="' + (param4 != null ? value : get(key)) + '" min="' + param1 + '" max="' + param2 + '" step="' + param3 + '" oninput="this.classList.add(\'mod-modified\');this.parentElement.children[3].innerHTML = this.value;"/><p>' + (param4 != null ? value : get(key)) + '</p><p>%</p></div>';
        } else if (type == "text") {
            code += '<div class="br"></div><input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="text" placeholder="' + param1 + '" value="' + get(key).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') + '"/></div>';
        } else if (type == "number") {
            code += '<div class="br"></div><input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="number" placeholder="' + param1 + '" value="' + get(key) + '"/></div>';
        } else if (type == "color") {
            code += '<div class="br"></div><label class="color" for="' + key + '" style="background: ' + get(key) + '"></label><input title="Voer een hex kleurencode in" style="outline: none; color: ' + colors[11] + '; display: inline-block; cursor: pointer; vertical-align: top; padding: 15px 10px; background: transparent;" value="' + get(key) + '" onchange="if (/^#?([a-fA-F0-9]{6})$/.test(this.value)) { this.parentElement.children[5].value = this.value; this.style.color = \'' + colors[11] + '\'; this.parentElement.children[3].style.background = this.value; } else if (/^#?([a-fA-F0-9]{3})$/.test(this.value)) { const sixDigitCode = \'#\' + this.value.charAt(1) + this.value.charAt(1) + this.value.charAt(2) + this.value.charAt(2) + this.value.charAt(3) + this.value.charAt(3); this.parentElement.children[5].value = sixDigitCode; this.style.color = \'' + colors[11] + '\'; this.parentElement.children[3].style.background = sixDigitCode; } else { this.style.color = \'darkred\'; }"/><input title="' + name + '" class="mod-custom-setting" value="' + get(key) + '" id="' + key + '" oninput="this.classList.add(\'mod-modified\');this.parentElement.children[3].style.background = this.value; this.parentElement.children[4].value = this.value; this.parentElement.children[4].style.color = \'' + colors[11] + '\';" type="color"/></div>';
        } else if (type == "file") {
            code += '<label class="mod-file-label" for="' + key + '">' + getIcon('upload', null, colors[7]) + '<p>Kies een bestand</p></label><input' + (n(param2) ? '' : ' title="' + name + '" data-size="' + param2 + '"') + ' oninput="this.parentElement.getElementsByTagName(\'label\')[0].classList.remove(\'mod-active\'); if (this.files.length != 0) { const name = this.files[0].name.toLowerCase(); if (this.accept != \'image/*\' || this.files[0][\'type\'].indexOf(\'image\') != -1) { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = name; this.parentElement.getElementsByTagName(\'label\')[0].classList.add(\'mod-active\'); this.parentElement.nextElementSibling.classList.remove(\'mod-active\'); this.parentElement.nextElementSibling.nextElementSibling.classList.remove(\'mod-active\'); } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; this.value = null; } } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; }" class="mod-file-input mod-custom-setting" type="file" accept="' + param1 + '" id="' + key + '"/></div><div class="mod-button mod-file-reset" data-key="' + key + '">Reset</div>';
        }
        return code;
    }

    // Insert the modsettings
    function insertSettings() {
        if (!n(id('modsettings'))) {
            return;
        }
        // Only display update checker for Userscript, and display autoupdate message for Extension
        const updatechecker = platform == "Userscript" ? '<a id="versionchecker" class="button-silver-deluxe"><span>' + getIcon('globe', 'mod-update-rotate', colors[11]) + 'Check updates</span></a>' : '';
        const updateinfo = platform == "Userscript" ? '' : '<div class="br"></div><p>Je browser controleert automatisch op updates voor de Somtoday Mod-extensie. Het is wel mogelijk dat een nieuwe update in het review-proces is bij ' + platform + '.</p>';

        // Construct mod settings
        // To add your own settings, you can use the addSetting() function.
        // Copy one of the settings, change the 3rd parameter to be something else - it should be unique, for example uniquekey - and then you can access the value with get(uniquekey) once the user has saved the form.
        const form = '<h3 class="category">Thema</h3><h3>Snelle thema\'s</h3><div id="theme-wrapper"></div>' +
            addSetting('Kleur van Somtoday', 'Pas het thema van Somtoday aan op basis van een kleur.', 'primarycolor', 'color', '#0067c2') +
            addSetting('Dark mode', 'Geef Somtoday een donkere look.', 'bools00', 'checkbox', false) +
            '<h3 class="category">Layout</h3><div id="layout-wrapper"><div class="layout-container' + (get('layout') == 1 ? ' layout-selected' : '') + '" id="layout-1"><div style="width: 66%; height: 19%; top: 4%; left: 17%;"><span>Menu</span></div><div style="width: 66%; height: 11%; top: 27%; left: 17%;"><span>Links</span></div><div style="width: 66%; height: 53%; top: 42%; left: 17%;"><span>Content</span></div><h3>Standaard</h3></div><div class="layout-container' + (get('layout') == 2 ? ' layout-selected' : '') + '" id="layout-2"><div style="width: 16%; height: 92%; top: 4%; left: 3%;"><span>Links</span></div><div style="width: 75%; height: 19%; right: 3%; top: 4%;"><span>Menu</span></div><div style="width: 75%; height: 69%; right: 3%; top: 27%;"><span>Content</span></div><h3>Sidebar links</h3></div><div class="layout-container' + (get('layout') == 3 ? ' layout-selected' : '') + '" id="layout-3"><div style="width: 75%; height: 19%; left: 3%; top: 4%;"><span>Menu</span></div><div style="width: 16%; height: 92%; top: 4%; right: 3%;"><span>Links</span></div><div style="width: 75%; height: 69%; left: 3%; top: 27%;"><span>Content</span></div><h3>Sidebar rechts</h3></div><div class="layout-container' + (get('layout') == 4 ? ' layout-selected' : '') + '" id="layout-4"><div style="width: 94%; height: 19%; top: 4%; left: 3%;"><span>Menu</span></div><div style="width: 94%; height: 11%; top: 27%; left: 3%;"><span>Links</span></div><div style="width: 94%; height: 53%; top: 42%; left: 3%;"><span>Content</span></div><h3>Breed</h3></div></div><h3 class="category">Achtergrond</h3>' +
            addSetting('Achtergrondafbeelding', 'Stelt een afbeelding in voor op de achtergrond.</p><div class="br"></div><p>', 'background', 'file', null, 'image/*') + '<div class="mod-button" id="randombackground">Random</div>' +
            addSetting('UI transparantie', 'Verandert de transparantie van de UI.', 'transparency', 'range', Math.round(Math.abs(1 - get("transparency")) * 100), 0, 100, 1, true) +
            addSetting('Achtergrond-blur', 'Blurt de achtergrondafbeelding.', 'blur', 'range', get("blur") * 5, 0, 100, 1, true) +
            '<h3 class="category">Algemeen</h3>' +
            addSetting('Zoom level', 'Verandert de grootte van Somtoday. De menubalken blijven dezelfde grootte.', 'zoom', 'range', 120, 50, 250, 1) + '<div class="example-box-wrapper"><div id="zoom-box"><h3>Zoom level</h3><p>Verandert de grootte van Somtoday. De menubalken blijven dezelfde grootte.</p></div></div>' +
            '<h3>Lettertype</h3><div class="custom-select-mod notranslate" style="width:200px;"><select id="font" title="Selecteer een lettertype"><option selected disabled hidden>' + get("fontname") + '</option><option>Abhaya Libre</option><option>Archivo</option><option>Assistant</option><option>B612</option><option>Bebas Neue</option><option>Brawler</option><option>Cabin</option><option>Caladea</option><option>Cardo</option><option>Chivo</option><option>Crimson Text</option><option>DM Serif Text</option><option>Enriqueta</option><option>Fira Sans</option><option>Frank Ruhl Libre</option><option>Gabarito</option><option>Gelasio</option><option>IBM Plex Sans</option><option>Inconsolata</option><option>Inter</option><option>Josefin Sans</option><option>Kanit</option><option>Karla</option><option>Lato</option><option>Libre Baskerville</option><option>Libre Franklin</option><option>Lora</option><option>Merriweather</option><option>Montserrat</option><option>Neuton</option><option>Noto Serif</option><option>Nunito</option><option>Open Sans</option><option>Oswald</option><option>Playfair Display</option><option>Poetsen One</option><option>Poppins</option><option>PT Sans</option><option>PT Serif</option><option>Quicksand</option><option>Raleway</option><option>Roboto</option><option>Rubik</option><option>Sedan SC</option><option>Source Sans 3</option><option>Source Serif 4</option><option>Spectral</option><option>Titillium Web</option><option>Ubuntu</option><option>Work Sans</option></select></div><div class="example-box-wrapper"><div id="font-box"><h3 style="letter-spacing: normal;">Lettertype</h3><p style="letter-spacing: normal;">Kies een lettertype voor Somtoday.</p></div></div>' +
            addSetting('Nicknames', 'Verander de naam van docenten in Somtoday (met uitzondering van als je een bericht gaat versturen).</p><div class="br"></div><p>Voer in in het formaat "Echte naam|Nickname|Echte naam 2|Nickname 2|Echte naam 3|Nickname 3" (etc...) voor zoveel namen als je wil. HTML is ondersteund.<div class="br"></div><p>', 'nicknames', 'text', '', 'Echte naam|Nickname|Echte naam 2|Nickname 2|Echte naam 3|Nickname 3') +
            addSetting('Gebruikersnaam', 'Verander je gebruikersnaam.', 'username', 'text', '', realname) +
            addSetting('Profielafbeelding', 'Laat je profielfoto in het menu en bij verstuurde berichten zien. Als dit uitstaat worden je initialen getoond.', 'bools02', 'checkbox', false) +
            addSetting('Aangepaste profielafbeelding', 'Upload je eigen profielafbeelding in plaats van je schoolfoto.</p><div class="br"></div><p>De instelling <b>Profielafbeelding</b> moet aanstaan.</p><div class="br"></div><p>', 'profilepic', 'file', null, 'image/*', '120') +
            '<h3 class="category">Menu</h3>' +
            addSetting('Laat menu altijd zien', 'Toont de bovenste menubalk altijd. Als dit uitstaat, verdwijnt deze als je naar beneden scrollt.', 'bools03', 'checkbox', false) +
            addSetting('Paginanaam in navigatiemenu', 'Laat een tekst met de paginanaam zien onder het icoontje in het navigatiemenu.', 'bools01', 'checkbox', false) +
            addSetting('Verberg bericht teller in menu', 'Verberg het gele tellertje dat het aantal ongelezen berichten aangeeft.', 'bools07', 'checkbox', false) +
            '<h3 class="category">Aanvullende opties</h3>' +
            addSetting('Deel debug-data', 'Verstuurt bij een error informatie naar de developer om Somtoday te verbeteren.</p><div class="br"></div><p>Dit gebeurt anoniem en hier kan je niet mee worden geidentificeerd.', 'bools05', 'checkbox', false) +
            addSetting('Felicitatieberichten', 'Laat een felicitatiebericht zien als je jarig bent, of als je al een aantal jaar van Somtoday Mod gebruik maakt.', 'bools06', 'checkbox', true) +
            addSetting('Logo van mod in menu', 'Laat in plaats van het logo van Somtoday het logo van Somtoday Mod zien.', 'bools15', 'checkbox', true) +
            (autorefreshAvailable ? addSetting('Multitab browsing', 'Somtoday kan met meerdere tabbladen open onverwacht reageren. Deze instelling herlaadt de pagina wanneer dit gebeurt.', 'bools12', 'checkbox', false) : '') +
            addSetting('Open leermiddelen in nieuw tabblad', 'Open alle leermiddelen automatisch in een nieuw tabblad', 'bools14', 'checkbox', true) +
            addSetting('Redirect naar ELO', 'Redirect je automatisch van https://som.today naar https://inloggen.somtoday.nl.', 'bools04', 'checkbox', true) +
            addSetting('Scrollbar', 'Laat de scrollbar van een pagina zien.', 'bools09', 'checkbox', true) +
            addSetting('Verberg kalender', 'Verberg de kalender op de huiswerkpagina.', 'bools11', 'checkbox', false) +
            addSetting('Verberg lege dagen', 'Verberg lege dagen bij de huiswerkpagina.', 'bools10', 'checkbox', true) +
            addSetting('Verberg tooltips', 'Verberg de uitleggende teksten die verschijnen als je over een knop gaat met je muis.', 'bools08', 'checkbox', false) +
            '<h3 class="category">Browser</h3>' +
            addSetting('Titel', 'Verander de titel van Somtoday in de menubalk van de browser. De standaardtekst is "Somtoday - Samen Slimmer Onderwijs".</p><div class="br"></div><p style="margin-bottom: 15px;">Laat het tekstveld leeg als je de standaardtitel wil.', 'title', 'text', '', 'Somtoday - Samen Slimmer Onderwijs') +
            addSetting('Icoon', 'Verander het icoontje van Somtoday in de menubalk van de browser. Accepteert png, jpg/jpeg, gif, svg, ico en meer.</p><div class="br"></div><p>Als een bestand niet werkt, dan zal er een standaardicoontje te zien zijn of het vorige icoontje zal getoond worden.</p><div class="br"></div><div class="info-notice">' + getIcon('circle-info', null, colors[7], 'style="height: 20px;"') + 'Bestanden van meer dan 1 MB worden door Chromium-browsers (Chrome, Edge, Opera) niet geaccepteerd.<br>PNG, JPG en WEBP-bestanden worden daarom automatisch gecomprimeerd tot minder dan 1 MB.<br>Bewegende GIF-bestanden werken alleen in Firefox.</div><p>', 'icon', 'file', null, 'image/*', '300') +
            '<div class="br"></div><p>Versie ' + somtodayversion + ' van Somtoday | Versie ' + version + ' van Somtoday Mod</p><div class="br"></div><p>Bedankt voor het gebruiken van Somtoday Mod ' + platform + '!</p>' + updateinfo + '<div class="br"></div>';
        const buttons = '<div id="modactions"><h2 style="padding: 12px;">Acties</h2><a id="save" class="button-silver-deluxe"><span>' + getIcon('floppy-disk', 'mod-save-shake', colors[11]) + 'Instellingen opslaan</span></a><a id="reset" class="button-silver-deluxe"><span>' + getIcon('rotate-left', 'mod-reset-rotate', colors[11]) + 'Reset instellingen</span></a>' + updatechecker + '<a class="button-silver-deluxe" id="information-about-mod"><span>' + getIcon('circle-info', 'mod-info-wobble', colors[11]) + 'Informatie over mod</span></a><a class="button-silver-deluxe" id="feedback"><span>' + getIcon('comment-dots', 'mod-feedback-bounce', colors[11]) + 'Feedback geven</span></a><a class="button-silver-deluxe" id="report-bug"><span>' + getIcon('circle-exclamation', 'mod-bug-scale', colors[11]) + 'Bug melden</span></a></div>';
        // If Somtoday has no profile page option, add settings as popup
        if (n(cn("profileMaster", 0))) {
            tn("body", 0).insertAdjacentHTML('beforeend', '<div id="modsettings" class="mod-setting-popup"><div id="modsettings-inner">' + form + '</div><a id="close-modsettings">&times;</a></div>');
            tn('html', 0).style.position = 'fixed';
            tn('html', 0).style.width = '100%';
            if (n(id('modactions'))) {
                id('modsettings-inner').insertAdjacentHTML('afterbegin', buttons);
            }
            id('close-modsettings').addEventListener('click', function() { tryRemove(id('modsettings')); tryRemove(id('modsettingsfontscript')); tn('html', 0).style.position = 'relative'; })
        }
        else {
            cn("profileMaster", 0).insertAdjacentHTML('beforeend', '<div id="modsettings">' + form + '</div>');
            if (n(id('modactions'))) {
                id('somtoday-mod').insertAdjacentHTML('beforeend', buttons);
            }
            // Add open profilesettings button and open the modsettings
            if (!n(cn("yellow ribbon", 0))) {
                setHTML(cn("yellow ribbon", 0), "<a class='menuitem'>" + getIcon("user", null, colors[6]) + "Ga naar profielinstellingen</a>");
                cn("yellow ribbon", 0).addEventListener("click", function() {
                    if (id('modsettings').style.display == "none") {
                        openSetting(1);
                        setHTML(this.children[0], getIcon("user", 'mod-user-scale', colors[6]) + 'Ga naar profielinstellingen');
                    } else {
                        openSetting(0);
                        setHTML(this.children[0], getIcon("gear", 'mod-gear-rotate', colors[6]) + 'Ga naar modinstellingen');
                    }
                });
                cn("yellow ribbon", 0).style.cursor = 'pointer';
                cn("panel-header", 0).style.marginBottom = '20px';
                openSetting(1);
            }
            // Scroll to the scroll position at the setting page
            if (!n(get('settingscroll'))) {
                setTimeout(function(){window.scrollTo(0, get('settingscroll'))}, 50);
            }
            else {
                set('settingscroll', window.scrollY);
            }
        }
        // Add script to make the font select element work
        if (!n(id('modsettingsfontscript'))) {
            tryRemove(id('modsettingsfontscript'));
        }
        id('somtoday-mod').insertAdjacentHTML('beforeend', '<style id="modsettingsfontscript" onload=\'let x, i, j, l, ll, selElmnt, a, b, c; x = document.getElementsByClassName("custom-select-mod"); l = x.length; for (i = 0; i < l; i++) { selElmnt = x[i].getElementsByTagName("select")[0]; ll = selElmnt.length; a = document.createElement("DIV"); a.setAttribute("class", "select-selected"); a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML; x[i].appendChild(a); b = document.createElement("DIV"); b.setAttribute("class", "select-items select-hide"); for (j = 1; j < ll; j++) { c = document.createElement("DIV"); c.innerHTML = selElmnt.options[j].innerHTML; c.style.fontFamily = "\\"" + selElmnt.options[j].innerHTML + "\\", sans-serif"; c.addEventListener("click", function(e) { let y, i, k, s, h, sl, yl; s = this.parentNode.parentNode.getElementsByTagName("select")[0]; sl = s.length; h = this.parentNode.previousSibling; for (i = 0; i < sl; i++) { if (this.style.fontFamily.indexOf(s.options[i].innerHTML) != -1) { s.selectedIndex = i; h.innerHTML = this.innerHTML; y = this.parentNode.getElementsByClassName("same-as-selected"); yl = y.length; for (k = 0; k < yl; k++) { y[k].removeAttribute("class"); } this.setAttribute("class", "same-as-selected"); break; } } h.click(); document.getElementById("font-box").children[0].style.fontFamily = document.getElementById("font-box").children[1].style.fontFamily = document.getElementsByClassName("select-selected")[0].style.fontFamily = "\\"" + document.getElementById("font").value + "\\", sans-serif"; }); b.appendChild(c); } x[i].appendChild(b); a.addEventListener("click", function(e) { e.stopPropagation(); closeAllSelect(this); this.nextSibling.classList.toggle("select-hide"); this.classList.toggle("select-arrow-active"); }); } function closeAllSelect(elmnt) { let x, y, i, xl, yl, arrNo = []; x = document.getElementsByClassName("select-items"); y = document.getElementsByClassName("select-selected"); xl = x.length; yl = y.length; for (i = 0; i < yl; i++) { if (elmnt == y[i]) { arrNo.push(i) } else { y[i].classList.remove("select-arrow-active"); } } for (i = 0; i < xl; i++) { if (arrNo.indexOf(i)) { x[i].classList.add("select-hide"); } } } document.addEventListener("click", closeAllSelect, {passive: true});\'></style>');
        // Add event listeners to make layout boxes work
        for (const element of cn("layout-container")) {
            element.addEventListener("click", function() {
                for (const element of cn("layout-selected")) {
                    element.classList.remove("layout-selected");
                }
                element.classList.add("layout-selected");
            });
        }
        // Add event listeners to make file reset buttons work
        for (const element of cn("mod-file-reset")) {
            element.addEventListener("click", function() {
                element.classList.toggle("mod-active");
                if (element.dataset.key == "background") {
                    if (!n(id('randombackground'))) {
                        if (id('randombackground').classList.contains("mod-active")) {
                            id('randombackground').classList.remove("mod-active");
                        }
                    }
                }
                if (!n(element.previousElementSibling)) {
                    if (!n(element.previousElementSibling.getElementsByTagName('label')[0])) {
                        if (element.previousElementSibling.getElementsByTagName('label')[0].classList.contains("mod-active")) {
                            element.previousElementSibling.getElementsByTagName('label')[0].classList.remove("mod-active");
                            setHTML(element.previousElementSibling.getElementsByTagName('label')[0].children[1], "Kies een bestand");
                            element.previousElementSibling.getElementsByTagName('input')[0].value = null;
                        }
                    }
                }
            });
        }
        // Make zoom preview box work
        id("zoom").addEventListener("input", function() {
            id('zoom-box').style.transform = 'scale(calc(' + this.value + ' / ' + get("zoom") + '))';
        });
        // Add themes
        // Background images thanks to Pexels: https://www.pexels.com
        addTheme("Standaard", "", "0067c2", 20, false);
        addTheme("Bergen", "618833", "3b4117", 40, false);
        addTheme("Eiland", "994605", "2a83b1", 25, false);
        addTheme("Zee", "756856", "173559", 25, false);
        addTheme("Bergmeer", "1284296", "4a6a2f", 30, false);
        addTheme("Rivieruitzicht", "822528", "526949", 40, false);
        addTheme("Ruimte", "110854", "0d0047", 50, true);
        addTheme("Bergen en ruimte", "1624504", "6489a0", 50, true);
        addTheme("Stad", "2246476", "18202d", 25, true);
        addTheme("Weg", "1820563", "de3c22", 65, true);
        // Make save button, reset button (and updatechecker for the Userscript-version) work
        id("save").addEventListener("click", function() { execute([save]) });
        id("reset").addEventListener("click", function() {
            modMessage('Alles resetten?', 'Al je instellingen zullen worden gereset. Weet je zeker dat je door wil gaan?', 'Ja', 'Nee');
            id('mod-message-action1').addEventListener("click", function() { reset(); window.location.reload(); });
            id('mod-message-action2').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 350); });
        });
        id("information-about-mod").addEventListener("click", function() {
            modMessage('Informatie', '</p><h3>Over</h3><p>Somtoday Mod is een gratis ' + (platform == 'Userscript' ? 'userscript dat': 'browserextensie die') + ' de website van Somtoday aanpast. Het verbetert het uiterlijk van Somtoday en voegt opties zoals een dark mode, lettertypes, kleuren, achtergronden, layout en meer toe. Somtoday Mod is niet geaffilieerd met Somtoday/Topicus.</p><br><h3>Versieinformatie</h3><p>Somtoday Mod ' + platform + ' v' + version + ' met Somtoday ' + somtodayversion + '</p><br><h3>Privacybeleid & Source code</h3><p>Het privacybeleid is <a href="https://jonazwetsloot.nl/somtoday-mod-privacy-policy" target="_blank">hier</a> te vinden. Source code is <a href="https://jonazwetsloot.nl/versions/somtoday-mod" target="_blank">hier</a> te vinden.</p><br><h3>Copyright</h3><p>&copy; 2023 - 2024 Jona Zwetsloot, gelicentieerd onder <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a>.</p>', 'Meer informatie', 'Terug');
            id('mod-message-action1').addEventListener("click", function() { window.open('https://jonazwetsloot.nl/projecten/somtoday-mod', '_blank'); });
            id('mod-message-action2').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 350); });
        });
        id("report-bug").addEventListener("click", function() { execute([prepareBugReport]) });
        id("feedback").addEventListener("click", function() { execute([feedback]) });
        if (platform == "Userscript") {
            id("versionchecker").addEventListener("click", function() { execute([checkUpdate]) });
        }
        // Make random background button work
        // Random background images thanks to Lorem Picsum: https://picsum.photos
        id("randombackground").addEventListener("click", function() {
            id("randombackground").classList.toggle('mod-active');
            if (!n(id('randombackground').previousElementSibling)) {
                if (id('randombackground').previousElementSibling.classList.contains("mod-active")) {
                    id('randombackground').previousElementSibling.classList.remove("mod-active");
                }
                if ((((!n(id("randombackground").previousElementSibling)) && !n(id("randombackground").previousElementSibling.previousElementSibling)) && !n(id("randombackground").previousElementSibling.previousElementSibling.getElementsByTagName('label')[0])) && id("randombackground").previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].classList.contains("mod-active")) {
                    id("randombackground").previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].classList.remove("mod-active");
                    setHTML(id("randombackground").previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].children[1], "Kies een bestand");
                    id("randombackground").previousElementSibling.previousElementSibling.getElementsByTagName('input')[0].value = null;
                }
            }
        });
        if (get('bools').charAt(8) != "1") {
            // Add tooltip
            let infosign = 1;
            for (const element of cn('icon-md icon-info-sign')) {
                if (n(element.id)) {
                    element.id = "info" + infosign;
                    infosign++;
                }
                if (!n(element.title)) {
                    bindTooltip(element.id, element.title);
                    element.title = '';
                }
            }
        }
    }

    // Add a theme to the modsettings. Can only be called at the modsettings page.
    function addTheme(name, url, color, transparency, dark) {
        // URL can be a URL to an image, but also a Pexels ID.
        let smallimg = url;
        let bigimg = url;
        if (!isNaN(parseInt(url))) {
            smallimg = 'https://images.pexels.com/photos/' + url + '/pexels-photo-' + url + '.jpeg?auto=compress&cs=tinysrgb&w=250';
            bigimg = 'https://images.pexels.com/photos/' + url + '/pexels-photo-' + url + '.jpeg?auto=compress&cs=tinysrgb&w=1600';
        }
        let themeclass = "";
        if (get("theme") == name) {
            if (((get("bools").charAt(0) == "1" && dark == true) || (get("bools").charAt(0) == "0" && dark == false)) && get("primarycolor") == "#" + color) {
                themeclass = " theme-selected-set";
            } else {
                set("theme", "");
            }
        }
        // Set emtpy image as theme background if no url is given
        if (url == "") {
            smallimg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        }
        id('theme-wrapper').insertAdjacentHTML('beforeend', '<div class="theme' + themeclass + '" id="' + name + '" data-name="' + name + '" data-url="' + bigimg + '" data-color="' + color + '" data-transparency="' + transparency + '" data-dark="' + dark + '"><img src="' + smallimg + '" alt="Achtergrondafbeelding: ' + name + '" loading="lazy"/><h3>' + name + '<div style="background:#' + color + ';" title="#' + color + '"></div>' + getIcon(dark ? "moon" : "sun", null, colors[11]) + '</h3></div>');
        id(name).addEventListener("click", function() {
            for (const element of cn('theme')) {
                element.classList.remove('theme-selected-set');
                element.classList.remove('theme-selected');
            }
            id(name).classList.add('theme-selected');
        });
    }

    // Convert an image URL to a base64 image
    function toDataURL(url, callback) {
        let xhr = new XMLHttpRequest();
        xhr.onload = function() {
            let reader = new FileReader();
            reader.onloadend = function() {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }





    // 9 - SERVER REQUESTS

    // Check if updates are available - userscript only (user initiated)
    function checkUpdate() {
        fetch("https://jonazwetsloot.nl/somtoday-mod-update-checker?v=" + version).then(function(response) {
            if (response.ok) {
                return response.text();
            }
            return Promise.reject(response);
        }).then(text => {
            if (text == "Newest") {
                modMessage('Geen updates gevonden', 'Helaas, er zijn geen updates gevonden.', 'Oke');
                id('mod-message-action1').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
            } else if (text == "Optional") {
                modMessage('Kleine update gevonden', 'Er is een kleine update gevonden. Wil je de update installeren?', 'Ja', 'Nee');
                id('mod-message-action1').addEventListener("click", function() { window.open('https://jonazwetsloot.nl/userscripts/SomtodayMod' + (minified ? '' : 'Unminified') + '.user.js'); });
                id('mod-message-action2').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
            } else if (text == "Update") {
                modMessage('Update gevonden', 'Er is een update gevonden. Wil je de update installeren?', 'Ja', 'Nee');
                id('mod-message-action1').addEventListener("click", function() { window.open('https://jonazwetsloot.nl/userscripts/SomtodayMod' + (minified ? '' : 'Unminified') + '.user.js'); });
                id('mod-message-action2').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
            }
            else {
                modMessage('Fout', 'Somtoday Mod kan de reactie van de server niet begrijpen.', 'Oke');
                id('mod-message-action1').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
            }
        }).catch((response) => {
            modMessage('Fout', 'Er kon niet op updates worden gechecked. Het kan zijn dat de server van Somtoday Mod down is of dat je wifi uitstaat.', 'Oke');
            id('mod-message-action1').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
        });
    }

    // Sends a feedback message (user initiated)
    function feedback() {
        modMessage('Feedback geven', 'Heb je suggesties voor verbeteringen of een heel goed idee voor Somtoday Mod? Dan kan je hier feedback geven.</p><textarea placeholder="Schrijf hier je feedback." id="feedbackmsg"></textarea><p>', 'Verstuur', 'Terug');
        id('mod-message-action1').addEventListener("click", function() {
            hide(id('mod-message-action1'));
            hide(id('mod-message-action2'));
            if (n(id('feedbackmsg').value)) {
                id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305);
                setTimeout(function() {
                    modMessage('Fout', 'Voer een tekst in.', 'Oke');
                    id('mod-message-action1').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); if (!n(id('feedback'))) { id("feedback").click();} }, 305); });
                }, 310);
            }
            else {
                let formData = new FormData();
                formData.append('message', id('feedbackmsg').value);
                fetch("https://jonazwetsloot.nl/somtoday-mod-feedback", { method: 'POST', body: formData }).then(function(response) {
                    if (response.ok) {
                        return response.text();
                    }
                    return Promise.reject(response);
                }).then(text => {
                    id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
                    if (text == "Sent") {
                        setTimeout(function() {
                        modMessage('Verstuurd!', 'Je feedback is verstuurd.', 'Oke');
                            id('mod-message-action1').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                        }, 310);
                    } else {
                        setTimeout(function() {
                            modMessage('Fout', 'De server kon je feedback niet verwerken.', 'Oke');
                            id('mod-message-action1').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                        }, 310);
                    }
                }).catch((response) => {
                    id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
                    setTimeout(function() {
                        modMessage('Fout', 'Je feedback kon niet worden verstuurd. Het kan zijn dat de server van Somtoday Mod down is of dat je wifi uitstaat.', 'Oke');
                        id('mod-message-action1').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                        id('mod-message-action1').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                    }, 310);
                });
            }
        });
        id('mod-message-action2').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
    }

    // Show message and prepare bug report server request (user initiated)
    function prepareBugReport() {
        modMessage('Bug melden', 'Heb je een bug ontdekt? Dan kan je die hier melden. Alle bugs zijn openbaar te bekijken <a href="https://jonazwetsloot.nl/bugs/somtoday-mod" target="_blank">op deze pagina</a>.</p><input type="text" placeholder="Korte beschrijving van bug" id="shortdescription"><textarea placeholder="Uitgebreidere beschrijving van bug" id="longdescription"></textarea><p style="margin-top: 20px; margin-bottom: -5px;">Screenshot (optioneel)</p><div><label style="margin-top: 15px;" class="mod-file-label" for="bug-screenshot">' + getIcon('upload', null, colors[7]) + '<p style="display: inline;">Kies een bestand</p></label><input oninput="this.parentElement.getElementsByTagName(\'label\')[0].classList.remove(\'mod-active\'); if (this.files.length != 0) { const name = this.files[0].name.toLowerCase(); if (this.files[0][\'type\'].indexOf(\'image\') != -1) { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = name; this.parentElement.getElementsByTagName(\'label\')[0].classList.add(\'mod-active\'); } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; this.value = null; } } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; }" class="mod-file-input" type="file" accept="image/*" id="bug-screenshot"/></div><p>', 'Verstuur', 'Terug');
        id('mod-message-action1').addEventListener("click", function() {
            hide(id('mod-message-action1'));
            hide(id('mod-message-action2'));
            if (n(id('shortdescription').value) || n(id('longdescription').value)) {
                id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
                setTimeout(function() {
                    modMessage('Fout', 'Voer ten minste beide tekstvelden in.', 'Oke');
                    id('mod-message-action1').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); if (!n(id('report-bug'))) { id("report-bug").click();} }, 305); });
                }, 310);
            }
            else {
                let formData = new FormData();
                formData.append('title', id('shortdescription').value);
                formData.append('message', id('longdescription').value);
                formData.append('product', 'Somtoday Mod');
                formData.append('version', version);
                formData.append('platform', platform);
                if (!n(id('bug-screenshot').files[0])) {
                    let reader = new FileReader();
                    reader.readAsDataURL(id('bug-screenshot').files[0]);
                    reader.onload = function() {
                        formData.append('screenshot', reader.result);
                        sendBugReport(formData);
                    };
                }
                else {
                    sendBugReport(formData);
                }
            }
        });
        id('mod-message-action2').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
    }

    // Submits a bug report (user initiated)
    function sendBugReport(formData) {
        fetch("https://jonazwetsloot.nl/somtoday-mod-error", { method: 'POST', body: formData }).then(function(response) {
            if (response.ok) {
                return response.text();
            }
            return Promise.reject(response);
        }).then(text => {
            id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
            if (text == "Success") {
                setTimeout(function() {
                    modMessage('Verstuurd!', 'Je bugreport is verstuurd.', 'Oke');
                    id('mod-message-action1').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                }, 310);
            } else {
                setTimeout(function() {
                    modMessage('Fout', 'De server kon de request niet verwerken.', 'Oke');
                    id('mod-message-action1').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                }, 310);
            }
        }).catch((response) => {
            id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
            setTimeout(function() {
                modMessage('Fout', 'Je bugreport kon niet worden verstuurd. Het kan zijn dat de server van Somtoday Mod down is of dat je wifi uitstaat.', 'Oke');
                id('mod-message-action1').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                id('mod-message-action1').addEventListener("click", function() { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
            }, 310);
        });
    }





    // 10 - EXECUTION

    // Check if user is new. If so, save some values and display a welcome message.
    if (n(get("primarycolor"))) {
        set("firstused", year + "-" + (month + 1) + "-" + dayInt);
        set("birthday", "00-00-0000");
        set('lastjubileum', 0);
        reset();
        tn("html", 0).style.overflow = "hidden";
        tn("head", 0).insertAdjacentHTML('afterbegin', '<style>#welcome{position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000000;background:white;transition:opacity 0.3s ease;}#welcome *{box-sizing:border-box;}#welcome h2{line-height:36px;font-size:36px;color:#09f;margin-bottom:30px;}#welcome h3{font-size:24px;margin-top:15px;}#welcome #errordata{width:25px;height:25px;margin:0;margin-top:20px;display:inline-block;}#welcome a{margin-top:20px;display:block;border:3px solid #09f;padding:15px 25px;border-radius:16px;font-size:20px;transition:0.3s background ease,0.2s color ease;width:fit-content;-webkit-user-select:none;user-select:none;cursor:pointer;}#welcome a:hover{background:#09f;color:white;}#welcome label{width:calc(100% - 50px);-webkit-user-select:none;user-select:none;cursor:pointer;font-size:20px;vertical-align:top;padding:22px 16px;}#welcome .modlogo{transition:transform 0.3s ease;}#welcome .modlogo:hover{transform:scale(1.05);}#welcome-background{background:#09f;float:right;width:750px;max-width:50%;height:100%;position:relative;padding-right:75px;transition:width .2s ease,padding-right .2s ease;}#welcome-background center{position:relative;top:50%;transform:translateY(-50%);}#wave{position:absolute;left:0;width:100%;top:0;height:100%;transform:translateX(-240px);}#welcome-text{float:left;width:calc(100% - 850px);padding-right:150px;padding:25px 50px;position:absolute;top:50%;transform:translateY(-50%);}@media (max-width:1500px){#welcome-background{width:550px;}#welcome-text{width:calc(100% - 650px);}}@media (max-width:1300px){#welcome-background{width:350px;}#welcome-text{width:calc(100% - 450px);}}@media (max-width:1060px){#welcome-background{width:250px;padding-right:0;}.modlogo{width:100px;height:100px;}#wave{display:none;}#welcome-text{width:calc(100% - 250px);}}@media (max-width:700px){#welcome-background{width:100%;max-width:100%;position:absolute;height:200px;}#welcome-text{width:100%;}}@media (max-height:850px), (max-width:370px){#welcome-text{top:200px;transform:none;}}@media (max-width:370px){#welcome-text{padding:25px;}}@media (max-height:650px) and (max-width:700px){#welcome-background{display:none;}}@media (max-height:650px){#welcome-text{top:0;}}@media (max-height:520px){#welcome h2{margin-bottom:15px;line-height:1;font-size:30px;}#welcome a{margin-top:0;}#welcome h3{font-size:18px;margin-top:10px;line-height:1;}}</style>');
        id("somtoday-mod").insertAdjacentHTML('afterbegin', '<div id="welcome"><div id="welcome-text"><h2>Somtoday mod is ge&iuml;nstalleerd!</h2><h3>Bedankt voor het downloaden van Somtoday Mod!</h3><h3>De mod zal Somtoday voor je aanpassen, zodat het er mooier uitziet.</h3><input id="errordata" type="checkbox"/><label style="display: inline-block;" for="errordata">Verzamel error-data om Somtoday Mod te verbeteren</label><div class="br"></div><a id="continuetosom">Door naar Somtoday</a></div><div id="welcome-background"><svg id="wave" width="245.3" height="1440"><path d="m235 937-6-48c-5-48-15-144-42-240s-69-192-70-288c1-96 43-192 91-288s102-192 101-288c1-96-53-192-80-240l-26-48h160V937z" transform="translate(-117 503)" data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill="#09f" stroke-miterlimit="10" style="mix-blend-mode:normal" /></svg><center><svg viewBox="0 0 190.5 207" width="190.5" height="207" class="modlogo"><g transform="translate(-144.8 -76.5)"><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill-rule="nonzero" stroke-width="0" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dashoffset="0" style="mix-blend-mode:normal"><path d="M261 107.8v.3c0 3.7 3 6.7 6.6 6.7H299a6.8 6.8 0 0 1 6.7 7V143.2c0 3.7 3 6.7 6.7 6.7h16.1a6.8 6.8 0 0 1 6.7 7V201.6c0 3.7-3 6.6-6.7 6.7h-16.1a6.8 6.8 0 0 0-6.7 7v23.1c0 3.7-3 6.7-6.7 6.7h-10.5a6.8 6.8 0 0 0-6.7 7l-.1 24.4v.3c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.7-7v-24.6c0-3.8-2.8-6.9-6.3-6.9s-6.4 3.1-6.4 7v24.8c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.6-7l.1-24.4v-.3c0-3.7-3-6.7-6.6-6.7h-10.5a6.8 6.8 0 0 1-6.7-7V215c0-3.6-3-6.6-6.7-6.7h-15.8a6.8 6.8 0 0 1-6.7-7V156.6c0-3.7 3-6.7 6.7-6.7h15.8a6.8 6.8 0 0 0 6.7-7v-21.4c0-3.6 3-6.6 6.7-6.7h31a6.8 6.8 0 0 0 6.7-7l.1-24.3v-.3c0-3.6 3-6.6 6.7-6.7h29a6.8 6.8 0 0 1 6.8 7z" data-paper-data="{&quot;index&quot;:null}" fill="#ffffff" stroke="#000000" /><path d="M289.8 179.2c1.3 0 2.9.3 4.6.9 2.2.7 4 1.7 5 2.7v.2c.8.6 1.3 1.5 1.4 2.6 0 .9-.2 1.7-.6 2.3l-6.8 10.8a60.2 60.2 0 0 1-27.5 19.8c-8.5 3.2-17 4.7-24.7 4.5l-13.2-.1a1.6 1.6 0 0 1-1.7-1.5v-3.3a1.6 1.6 0 0 1 1.7-1.5h.1c7.9.3 16.3-1 24.7-4.2a56 56 0 0 0 34.3-31.4v-.3c.5-1 1.4-1.5 2.3-1.5z" fill="#000000" stroke="none" /><g class="glasses"><path d="M171.4 150.8v-9h137.2v9z" fill="#000000" stroke="none" /><path d="M175.7 155.5v-6h57.5v6z" fill="#000000" stroke="none" /><path d="M179.8 160v-9h48.9v9z" fill="#000000" stroke="none" /><path d="M184 164.5v-9h44.7v9z" fill="#000000" stroke="none" /><path d="M188.6 168.6v-7h31.7v7z" fill="#000000" stroke="none" /><path d="M245.9 155.5v-6h57.4v6z" fill="#000000" stroke="none" /><path d="M250 160v-9h48.8v9z" fill="#000000" stroke="none" /><path d="M254 164.5v-9h41v9z" fill="#000000" stroke="none" /><path d="M258.8 168.6v-7h31.6v7z" fill="#000000" stroke="none" /><path d="M184.5 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M188.8 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M193.3 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M193.3 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M197.6 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M202.1 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M254.8 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M259.1 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M263.6 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M263.6 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M268 159.2V155h4.4v4.3z" fill="#ffffff" stroke="none" /><path d="M272.4 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /></g></g></g></svg></center></div></div>')
        if (!n(id('continuetosom'))) {
            id('continuetosom').addEventListener("click", function() {
                id('welcome').style.opacity = '0';
                tn("html", 0).style.overflowY = "scroll";
                if (id("errordata").checked) {
                    // Permission for sending debug-data
                    set("bools", get("bools").replaceAt(5, "1"));
                }
                setTimeout(function() {
                    tryRemove(id('welcome'));
                }, 400);
            });
        }
    }

    // Check if autorefresh is available. If not, disable it to prevent reload loops.
    let autorefreshAvailable = getPagesLoaded() == 1;
    if (!autorefreshAvailable) {
        set('bools', get('bools').replaceAt(12, "0"));
    }

    // Execute functions
    execute([start, consoleMessage, generateColors, congratulations, menu, menuIcons, style, pageUpdate]);

    // Pageupdate after 50ms to prevent detailpanel misbehaviour in layout 2 or 3
    setTimeout(function() {
        execute([pageUpdate]);
    }, 50);

    // Allow transitions after 0.5s
    setTimeout(function() {
        tryRemove(id('transitions-disabled'));
    }, 400);

    // Save the scroll position on the setting page
    window.addEventListener("scroll", function() {
        if (!n(cn('profileMaster', 0))) {
            setTimeout(function(){set('settingscroll', window.scrollY);}, 150);
        }
        else {
            setTimeout(function(){set('settingscroll', 0);}, 150);
        }
    }, {passive: true});

    // Add resize event listener to change some heights dynamically
    if (get('layout') == 1) {
        window.addEventListener("resize", function() {
            if (!n(id('master-panel')) && !n(id('detail-panel-wrapper'))) {
                if (!n(id('background-image-overlay'))) {
                    id('background-image-overlay').style.height = (Math.max(id('master-panel').clientHeight, id('detail-panel-wrapper').clientHeight) * (get('zoom') / 100)) + 'px';
                }
                if (!n(id('calendar'))) {
                    id('calendar').style.height = (id('master-panel').clientHeight + (80 / (get('zoom') / 100))) + 'px';
                }
            }
        }, {passive: true});
    }
    if (get('layout') == 2 || get('layout') == 3) {
        window.addEventListener("resize", function() {
            if (!n(id('calendar'))) {
                id('detail-panel-wrapper').style.height = id('calendar').style.height;
            }
        }, {passive: true});
    }

    // Add click event listener to get last clicked element (used to get last clicked link)
    var target;
    window.addEventListener('click', function(e) {
        e = e || window.event;
        if (((!n((e.target || e.srcElement).parentElement)) && !n((e.target || e.srcElement).parentElement.parentElement)) && !n((e.target || e.srcElement).parentElement.parentElement.parentElement)) {
            if (((e.target || e.srcElement).parentElement.parentElement.parentElement.id == "main-menu" && (e.target || e.srcElement).parentElement.tagName == "A") || (e.target || e.srcElement).id == "profile-img" || (e.target || e.srcElement).id == "messages-btn") {
                target = (e.target || e.srcElement).parentElement;
                return;
            }
            if ((e.target || e.srcElement).id.parentElement == "messages-btn") {
                target = (e.target || e.srcElement).parentElement.parentElement;
                return;
            }
        }
        target = null;
        return;
    }, {passive: true});

    // If the detail panel changes, do ondetailpanelchange.
    const detailpanelobserver = new MutationObserver(() => {
        if (!busy) {
            execute([pageUpdate]);
        }
    });

    // If the detail panel changes, do ondetailpanelchange.
    const masterpanelobserver = new MutationObserver(() => {
        if (!busy) {
            execute([pageUpdate]);
        }
    });

    execute([addObservers]);
    var observerStep = 10;
    function addObservers() {
        // Assign the observers to their elements.
        if (!n(id('detail-panel')) && !n(id('master-panel'))) {
            detailpanelobserver.observe(id('detail-panel'), {
                subtree: true,
                childList: true
            });
            masterpanelobserver.observe(id('master-panel'), {
                subtree: true,
                childList: true
            });
        }
        else {
            observerStep = observerStep * 5;
            setTimeout(addObservers, observerStep);
        }
    }
}