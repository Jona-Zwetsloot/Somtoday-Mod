// ==UserScript==
// @name         Somtoday Mod
// @namespace    https://jonazwetsloot.nl/projecten/somtoday-mod
// @version      4.0
// @description  Give Somtoday a new look with this script.
// @author       Jona Zwetsloot
// @match        https://*.somtoday.nl/*
// @match        https://som.today/*
// @icon         https://jonazwetsloot.nl/images/SomtodayModIcon.png
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==

// SOMTODAY MOD FULL VERSION
// Somtoday Mod (c) 2023-2024 by Jona Zwetsloot is licensed under CC BY-NC-SA 4.0
// This means you are free to edit and share this code if you attribute the maker. You also have to use the same license and you are not allowed to use this software for commercial purposes.
// See https://jonazwetsloot.nl/projecten/somtoday-mod for more information about Somtoday Mod.

// TRANSITIONAL VERSION
// This version of Somtoday Mod actually contains two different versions. One for the old versions of Somtoday (<=v14) and one for the new ones (>=v17).
// This is to support the old version while it's still in use. When Somtoday has completed the transition to v17, the version for <=v14 will be removed.
// The new version can be found in the onload() function and the old one in the legacy() function.
// Please note that both versions share the same storage. Some settings are conflicting. This is not a bug as Somtoday Mod is not meant to be used with both versions.

// TABLE OF CONTENTS (FOR THE NEW VERSION)
// 1 - VERSION & SAVE MANAGEMENT
//     Manages version, platform and save data.

// 2 - SHORTHAND FUNCTIONS
//     Contains a few shorthand functions.

// 3 - EXECUTE MOD AFTER PAGE LOAD
//     Makes sure the script executes at the right time.

// 4 - COLORS
//     Contains all functions needed to create the colors Somtoday Mod uses.

// 5 - ERROR CHECKS
//     Check if other Somtoday Mod instances are active and if an error occured.

// 6 - MAIN FUNCTIONS
//     Contains the main functions, such as pageUpdate(), style() and updateCssVariables().

// 7 - CUSTOMIZATION
//     Customize Somtoday by adding a profilePicture(), creating teacherNicknames(), and changing your userName()

// 8 - GRADE TOOLS
//     Add graphs, a calculation tool and download button to grade pages

// 9 - MODSETTINGS
//     Add the modsettings to the Somtoday-settings

//10 - SERVER REQUESTS
//     Connect to the Somtoday Mod server for bug reporting, update checking and feedback sending.





// 1 - VERSION & SAVE MANAGEMENT

// Contains code to save data for both the Tampermonkey and the Extension version. Also contains localStorage as fallback.
// If you see warning signs and you want to remove them, copy the get and set for the version you are using and place them outside the if statement

const version = 4.0;
const platform = "Userscript";
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
        setTimeout(console.warn.bind(console, "SOMTODAY MOD: Userscript storage is used while the platform is not set to Userscript."));
    }
}
// Check if extension allows storage access
else if (((typeof chrome !== 'undefined') && chrome.storage) && chrome.storage.local) {
    // GET DATA
    chrome.storage.local.get(["background", "birthday", "blur", "bools", "enabled", "firstused", "fontname", "icon", "lastjubileum", "lastused", "layout", "nicknames", "primarycolor", "profilepic", "realname", "secondarycolor", "theme", "title", "transparency", "username", "version", "zoom"]).then((result) => {
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
            lastjubileum: result.lastjubileum,
            lastused: result.lastused,
            layout: result.layout,
            nicknames: result.nicknames,
            primarycolor: result.primarycolor,
            profilepic: result.profilepic,
            realname: result.realname,
            secondarycolor: result.secondarycolor,
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
        setTimeout(console.warn.bind(console, "SOMTODAY MOD: Extension storage is used while the platform is set to Userscript."));
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
    setTimeout(console.warn.bind(console, "SOMTODAY MOD: Could not find extension or userscript storage. Falling back to localstorage."));
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
String.prototype.replaceAt = function (index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}





// 3 - EXECUTE MOD AFTER PAGE LOAD

if (window.location.origin.indexOf("som.today") != -1) {
    if ((get("bools") == null) || get("bools").charAt(9) == "1") {
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
    window.addEventListener('load', tryLoad, { passive: true });

    // Set interval to be sure that the mod doesn't miss the load event
    loadInterval = setInterval(tryLoad, 50);
}

function tryLoad() {
    // Check if page is not yet loaded, if script is enabled and if required elements exist
    if (!isloaded && (platform == "Userscript" || data != null) && ((!n(tn('sl-home', 0)) && !n(tn('sl-home', 0).children[1])) || !n(tn('sl-error', 0)) || !n(id('master-panel')) || (!n(cn("stpanel--status", 0)) && !n(cn("errorTekst", 0))))) {
        clearInterval(loadInterval);
        // Page has loaded
        isloaded = true;
        // Show page
        if (platform == "Userscript" || (data != null && data.enabled)) {
            tn('html', 0).style.opacity = "1";
            if (n(tn('sl-home', 0)) && n(tn('sl-error', 0))) {
                if (window.location.href.indexOf('/home/') != -1 || window.location.href.indexOf('/error') != -1) {
                    tn('html', 0).removeAttribute('style');
                    execute([legacy]);
                }
            }
            else {
                execute([onload]);
            }
        }
    }
}

// Report bug if user has given permission (when error happens)
let somtodayversion;
function sendDebugData(name, error) {
    if (get("bools") == null || get("bools").charAt(5) == "1") {
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
    rgb[channel] = Math.min(Math.max(rgb[channel] + value, 0), 255);
    return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

// Change color brightness level
function toBrightnessValue(color, target) {
    let i;
    let brightness;
    const startColor = color;
    for (i = 1; i <= 10; i++) {
        brightness = Math.round(getRelativeLuminance(hexToRgb(color)));
        color = adjust(color, target - brightness);
    }
    const rgbcolor = hexToRgb(startColor);
    const factor = Math.round(target * -0.15);
    // Color is mostly blue
    if (rgbcolor[2] > rgbcolor[0] && rgbcolor[2] > rgbcolor[1]) {
        color = adjustColorChannel(1, adjustColorChannel(0, color, factor), factor);
    }
    // Color is mostly red
    else if (rgbcolor[0] > rgbcolor[2] && rgbcolor[0] > rgbcolor[1]) {
        color = adjustColorChannel(2, adjustColorChannel(1, color, factor), factor);
    }
    // Color is mostly green
    else if (rgbcolor[1] > rgbcolor[0] && rgbcolor[1] > rgbcolor[2]) {
        color = adjustColorChannel(2, adjustColorChannel(0, color, factor), factor);
    }
    return color;
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

    // Stop script if any other error occurs
    if (!n(tn('sl-error', 0))) {
        setTimeout(console.warn.bind(console, "SOMTODAY MOD: Unknown error"));
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

    let today = new Date();
    let dayInt = today.getDate();
    let month = today.getMonth();
    let year = today.getFullYear();
    let filesProcessed;
    let darkmode = tn('html', 0).classList.contains('dark');
    let username;
    let realname;
    let busy = false;
    somtodayversion = tn('sl-root', 0).getAttribute('ng-version');





    // 6 - MAIN FUNCTIONS

    // Write message in the console
    function consoleMessage() {
        setTimeout(console.log.bind(console, "%cSomtoday Mod is geactiveerd!", "color:#0067c2;font-weight:bold;font-family:Arial;font-size:26px;"));
        setTimeout(console.log.bind(console, "%cGeniet van je betere versie van Somtoday.\n\n© Jona Zwetsloot | Versie " + somtodayversion + " van Somtoday | Versie " + version + " van Somtoday Mod " + platform, "color:#0067c2;font-weight:bold;font-family:Arial;font-size:16px;"));
    }

    // Executes when page changes
    function pageUpdate() {
        darkmode = tn('html', 0).classList.contains('dark');
        busy = true;
        execute([profilePicture, teacherNicknames, userName, modLogo, updateCssVariables, insertModSettingLink, insertGradeDownloadButton, subjectGradesPage]);
        // Execute resize event
        window.dispatchEvent(new Event('resize'));
        // Allow this function to be executed again after 100ms
        setTimeout(function () {
            busy = false;
        }, 100);
    }

    // Execute pageUpdate when page changes
    function addMutationObserver() {
        // If the page panel changes, do pageUpdate.
        const pageobserver = new MutationObserver(() => {
            if (!busy) {
                setTimeout(function () { execute([pageUpdate]); }, 5);
            }
        });
        setInterval(function () { if (!busy) { execute([pageUpdate]); } }, 250);
        pageobserver.observe(tn('html', 0), {
            attributes: true,
            subtree: true,
            childList: true
        });
    }

    // Apply style
    function style() {
        let menuColor;
        if (getRelativeLuminance(hexToRgb(get('primarycolor'))) >= 240) {
            menuColor = adjust(get('primarycolor'), -170);
        } else if (getRelativeLuminance(hexToRgb(get('primarycolor'))) >= 160) {
            menuColor = adjust(get('primarycolor'), -110);
        } else {
            menuColor = "#fff";
        }
        let highLightColor;
        if (getRelativeLuminance(hexToRgb(get('primarycolor'))) >= 160) {
            highLightColor = adjust(get('primarycolor'), -35);
        } else {
            highLightColor = adjust(get('primarycolor'), 35);
        }
        while (!n(cn('mod-style', 0))) {
            cn('mod-style', 0).remove()
        }
        if (get('bools').charAt(11) == "0") {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">html, body{scrollbar-width:none !important;}</style>');
        }
        tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">body{overflow-y:scroll !important;}sl-modal > div:has(sl-account-modal){max-width:2048px !important;height:92% !important;max-height:92% !important;}.zoekresultaten-inner{max-height:368px !important;}.week:not(sl-rooster-week){background:var(--bg-neutral-none) !important;color:var(--text-strong) !important;}@media (min-width:1280px){sl-tab-bar{background:none !important;}}.navigation,.dagen,.actiepanel,.dag-afkortingen{background:none !important;}.zoekresultaten{border:none !important;}sl-plaatsingen, .nieuw-bericht-form{background:var(--bg-neutral-none);}hmy-switch-group{position:relative;}sl-account-modal .content,.tabs .filler{position:relative;}#mod-setting-panel{position:absolute;background:var(--bg-elevated-none);top:0;left:0;width:100%;height:fit-content;padding:10px 30px;box-sizing:border-box;z-index:100;}</style>');
        tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">#mod-grades-graphs > div{height:350px;width:100%;position:relative;}#mod-grades-graphs > div > canvas{position:relative;width:100%;height:100%;}#mod-grades-graphs > h3{margin-top:40px;margin-bottom:10px;color:var(--text-strong);}.mod-info-notice{width:fit-content;margin-bottom:-15px;padding:10px 20px;border:2px solid var(--blue-0);color:var(--fg-on-primary-weak);line-height:15px;border-radius:16px;padding-left:50px;}.mod-info-notice svg{height:20px;position:absolute;margin-left:-30px;margin-top:-4px }#mod-grade-calculate{margin-top:40px;color:var(--text-strong);width:calc(100% + 15px);}#mod-grade-calculate input{width:calc(33.333% - 15px);margin-right:15px;display:inline-block;}#mod-grade-calculate input[type=submit]{background:var(--action-primary-normal);color:var(--text-inverted); transition: background 0.3s ease !important;cursor:pointer;}#mod-grade-calculate input[type=submit]:hover{background:var(--action-primary-strong);}.mod-grades-download{right:0;position:absolute;margin-top: 5px;cursor:pointer;}.mod-grades-download svg{height: 25px;}sl-studiewijzer-week:has(.datum.vandaag){background:var(--mod-semi-transparant) !important;}sl-laatste-resultaat-item,sl-vakresultaat-item{background:var(--bg-elevated-none) !important;}sl-laatste-resultaat-item:hover{}</style>');
        tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width:1280px){sl-modal > div:has(sl-account-modal){max-width:2048px !important;height:95% !important;max-height:95% !important;}}</style>');
        // Font - DONE
        tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@import url("https://fonts.googleapis.com/css2?family=Abhaya+Libre&family=Aleo&family=Archivo&family=Assistant&family=B612&family=Bebas+Neue&family=Black+Ops+One&family=Brawler&family=Cabin&family=Caladea&family=Cardo&family=Chivo&family=Crimson+Text&family=DM+Serif+Text&family=Enriqueta&family=Fira+Sans&family=Frank+Ruhl+Libre&family=Gabarito&family=Gelasio&family=Grenze+Gotisch&family=IBM+Plex+Sans&family=Inconsolata&family=Inter&family=Josefin+Sans&family=Kanit&family=Karla&family=Lato&family=Libre+Baskerville&family=Libre+Franklin&family=Lora&family=Merriweather&family=Montserrat&family=Neuton&family=Noto+Serif&family=Nunito&family=Oswald&family=Permanent+Marker&family=Pixelify+Sans&family=PT+Sans&family=PT+Serif&family=Playfair+Display:ital@1&family=Poppins&family=Poetsen+One&family=Quicksand&family=Raleway&family=Roboto&family=Roboto+Slab&family=Rubik&family=Rubik+Doodle+Shadow&family=Sedan+SC&family=Shadows+Into+Light&family=Single+Day&family=Source+Sans+3&family=Source+Serif+4:opsz@8..60&family=Spectral&family=Titillium+Web&family=Ubuntu&family=Work+Sans&display=swap");*:not(.mod-custom-select *):not(#font-box *){font-family:"' + get("fontname") + '","Open Sans",sans-serif !important;' + ((get("fontname") == "Bebas Neue" || get("fontname") == "Oswald") ? "letter-spacing:1px;" : "") + ' }</style>');
        // Setting buttons icon animations - DONE
        tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">.mod-user-scale{animation:0.6s usericonscale 0.2s ease;}@keyframes usericonscale{0%{transform:scale(1);}50%{transform:scale(1.1);}100%{transform:scale(1);}}a:hover .mod-feedback-bounce{animation:0.6s feedbackbounce 0.2s ease;}@keyframes feedbackbounce{0%,20%,50%,80%,100%{transform:translateY(0);}40%{transform:translateY(-8px);}60%{transform:translateY(-4px);}}a:hover .mod-save-shake{animation:0.6s saveshake 0.2s ease;}@keyframes saveshake{0%{transform:rotate(0deg);}25%{transform:rotate(15deg);}50%{transform:rotate(0eg);}75%{transform:rotate(-15deg);}100%{transform:rotate(0deg);}}a:hover .mod-bug-scale{animation:0.6s bugscale 0.2s ease;}@keyframes bugscale{0%{opacity:0;transform:scale(.3);}50%{opacity:1;transform:scale(1.05);}70%{transform:scale(.9);}100%{transform:scale(1);}}a:hover .mod-info-wobble{animation:0.6s infowobble 0.2s ease;}@keyframes infowobble{from,to{transform:scale(1,1);}25%{transform:scale(0.8,1.2);}50%{transform:scale(1.2,0.8);}75%{transform:scale(0.9,1.1);}}a:hover .mod-update-rotate{animation:0.8s updaterotate 0.2s ease;}@keyframes updaterotate{0%{transform:rotateY(0deg);}100%{transform:rotateY(360deg);}}a:hover .mod-reset-rotate{animation:0.8s resetrotate 0.2s ease;}@keyframes resetrotate{0%{transform:rotate(360deg);}100%{transform:rotate(0deg);}}.mod-gear-rotate{animation:0.8s gearrotate 0.2s ease;}@keyframes gearrotate{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>');
        // Input type range - DONE
        tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">input[type="range"]{-webkit-appearance:none;appearance:none;background:transparent;cursor:pointer;width:15rem;max-width:100%;}input[type="range"]:focus{outline:none;}input[type="range"]::-webkit-slider-runnable-track{background-color:var(--bg-primary-weak);border-radius:0.5rem;height:0.5rem;}input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;margin-top:-4px;border-radius:50%;background-color:var(--bg-primary-strong);height:1rem;width:1rem;}input[type="range"]:focus::-webkit-slider-thumb{border:none;outline:3px solid var(--border-accent-normal);outline-offset:0.125rem;}input[type="range"]::-moz-range-track{background-color:var(--bg-primary-weak);border-radius:0.5rem;height:0.5rem;}input[type="range"]::-moz-range-thumb{border:none;border-radius:50%;background-color:var(--bg-primary-strong);height:1rem;width:1rem;}input[type="range"]:focus::-moz-range-thumb{border:none;outline:3px solid var(--border-accent-normal);outline-offset:0.125rem;}</style>');
        // Input type checkbox
        tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">.switch{display:inline-block;height:25px;position:relative;vertical-align:top;width:50px;margin:10px 0;margin-bottom:30px;}.switch input{display:none !important;}.slider{background-color:var(--bg-primary-weak);bottom:-1px;cursor:pointer;left:0;position:absolute;right:0;top:1px;transition:background .2s;}.slider:before{background-color:#fff;bottom:4px;content:"";height:17px;left:4px;position:absolute;transition:.2s;width:17px;}input:checked + .slider{background-color:var(--bg-primary-strong);}input:checked + .slider:before{transform:translateX(26px);}.slider.round{border-radius:34px;margin-bottom:0 !important;}.slider.round:before{border-radius:50%;}</style>');
        // Custom select
        tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">.mod-custom-select{position:relative;font-family:Arial,sans-serif;margin-top:10px;width:240px;}.mod-custom-select select{display:none;}.select-selected{border-radius:6px;border:2px solid var(--blue-0)mportant;background-color:var(--bg-elevated-none);}.select-selected:after{position:absolute;content:"";top:14px;right:10px;width:0;height:0;border:6px solid transparent;border-color:var(--blue-0) transparent transparent transparent;}.select-selected.select-arrow-active:after{border-color:transparent transparent var(--blue-0) transparent;top:7px;}.select-items div,.select-selected{color:var(--text-moderate);letter-spacing:normal;padding:8px 16px;border:1px solid transparent;border-color:transparent transparent rgba(0,0,0,0.1) transparent;cursor:pointer;-webkit-user-select:none;user-select:none;}.select-items{max-height:400px;position:absolute;background-color:var(--bg-elevated-none);color:var(--text-moderate);top:calc(100% + 10px);left:-2px;width:calc(100% + 2px);right:0;z-index:99;border-radius:8px;overflow:hidden;overflow-y:auto;border-radius:6px;box-shadow:0 0 30px var(--bg-elevated-strong);}.select-items div:last-of-type{border:2px solid transparent;}.select-hide{display:none;}.select-items div:hover,.same-as-selected{background-color:rgba(0,0,0,0.1);}</style>');
        // Mod message style - DONE
        tn("head", 0).insertAdjacentHTML('beforeend', '<style class="mod-style">#mod-message textarea{height:300px;padding:12px 20px; outline: none}#mod-message .mod-message-button{-webkit-user-select:none;user-select:none;text-decoration:none;font-size:14px;padding:12px 24px;border:4px solid var(--bg-primary-normal);background:var(--bg-primary-normal);border-radius:8px;margin-top:10px;margin-right:10px;display:inline-block;color:var(--text-inverted);outline:none;cursor:pointer;}#mod-message .mod-message-button:focus{border:4px solid var(--bg-primary-strong);}#mod-message .mod-message-button.mod-button-discouraged{background:var(--bg-elevated-none) !important; color:red; border:4px solid red;}#mod-message .mod-message-button.mod-button-discouraged:focus{border:4px solid darkred;}#mod-message a{text-decoration:underline;}#mod-message p,#mod-message h3{font-size:14px;margin-bottom:10px;line-height:17px;}#mod-message h2{font-size:18px;margin-bottom:20px;}#mod-message > center{position:absolute;width:100%;top:-300px;animation:0.4s modmessageslidein ease 0.15s forwards;opacity:0;}@keyframes modmessageslidein{0%{top:-300px;opacity:0;}50%{opacity:1;}100%{top:0;opacity:1;}}#mod-message > center > div{background:var(--bg-elevated-none);box-shadow:0 0 50px var(--bg-elevated-weak);width:500px;max-width:calc(100% - 16px);border-bottom-left-radius:16px;border-bottom-right-radius:16px;text-align:left;padding:20px 30px;box-sizing:border-box;}#mod-message{position:fixed;top:0;left:0;width:100%;height:100%;opacity:0;z-index:100000;background:rgba(0,0,0,0.2);box-sizing:border-box;transition:opacity .2s ease !important;}#mod-message.mod-msg-open{opacity:1;animation:0.2s modmessagebackground ease forwards;}@keyframes modmessagebackground{0%{background:rgba(0,0,0,0);}100%{background:rgba(0,0,0,0.2);}}</style>');
        // mod-setting-button DONE
        tn("head", 0).insertAdjacentHTML('beforeend', '<style class="mod-style">.mod-setting-button{padding:10px 20px;background:var(--bg-elevated-weak);border-radius:8px;margin-right:10px;display:inline-block;margin-bottom:10px;transition:background 0.3s ease !important;cursor:pointer;user-select:none;}.mod-setting-button:hover{background:var(--bg-elevated-strong);color:var(--text-moderate);}.mod-setting-button svg{margin-right:10px;height:18px;margin-bottom:-3px;}</style>');
        // Modsettings
        tn("head", 0).insertAdjacentHTML('beforeend', '<style class="mod-style">.br{height:10px;clear:both;}.layout-container.layout-selected,.layout-container:hover{border:3px solid var(--fg-on-primary-weak);}.layout-container{display:inline-block;vertical-align:top;margin-left:10px;margin-bottom:50px !important;width:180px;height:130px;background:var(--bg-elevated-none);border:3px solid var(--bg-elevated-none);border-radius:16px;position:relative;cursor:pointer;transition:border 0.2s ease !important;box-shadow:2px 2px 20px var(--bg-elevated-strong);}.layout-container h3{bottom:-40px;width:100%;position:absolute;text-align:center;}.layout-container div{-webkit-user-select:none;user-select:none;background:var(--bg-primary-weak);border-radius:6px;position:absolute;}.example-box-wrapper{border:3px solid var(--blue-0);width:500px;padding:10px 20px;border-radius:12px;overflow:hidden;max-width:calc(100% - 50px);margin-top:15px;}.example-box-wrapper > div{transform-origin:top left;}.theme{user-select:none;display:inline-block;cursor:pointer;width:calc(20% - 11px);margin-bottom:10px;margin-right:5px;overflow:hidden;background:var(--bg-elevated-none);border:3px solid transparent;border-radius:16px;transition:.2s border ease,.2s background ease !important;box-shadow:2px 2px 10px var(--bg-elevated-strong);}.theme:hover,.theme.theme-selected,.theme.theme-selected-set{border:3px solid var(--blue-0);}.theme.theme-selected,.theme.theme-selected-set{background:var(--blue-0);color:var(--grey-80);}.theme img{width:100%;height:175px;object-fit:cover;background:var(--bg-elevated-none);margin-bottom:-5px}.theme h3{padding:10px;padding-left:30px;overflow:hidden;text-overflow:ellipsis;text-wrap:nowrap;}.theme h3 div{display:inline-block;height:12px;width:12px;border-radius:50%;position:absolute;margin:5px -20px;}#mod-setting-panel .category:first-of-type{margin-top:20px;}#mod-setting-panel .category{padding:10px;border-bottom:6px solid var(--bg-primary-weak);border-radius:6px;font-size:20px;margin:20px -10px;margin-top:50px;}#mod-setting-panel > div > p:first-of-type{margin-right:15px;}.mod-file-label,.mod-button{-webkit-user-select:none;user-select:none;transition:0.2s border ease !important;margin-bottom:8px;display:block;width:fit-content;padding:10px 18px;border:2px solid var(--fg-on-primary-weak);border-radius:12px;color:var(--fg-on-primary-weak);}.mod-button{display:inline-block;margin-right:10px;}.mod-file-label:hover,.mod-button:hover{border:2px solid var(--bg-primary-weak);cursor:pointer;}label.mod-file-label.mod-active svg path{fill:white !important;}div.mod-button.mod-active,label.mod-file-label.mod-active{background:var(--fg-on-primary-weak);color:var(--text-inverted);}.mod-file-label p{margin-left:10px;display:inline;}input[type="file"].mod-file-input{display:none !important;}input[type="color"]{width:0;height:0;visibility:hidden;overflow:hidden;opacity:0;}.mod-color{cursor:pointer;width:38px;height:38px;border-radius:50%;display:inline-block;}.mod-color p{margin:8px 50px;width:150px;}.mod-color-textinput{width:120px;margin-left:125px;color:var(--fg-on-primary-weak);display:inline-block;padding:5px;border:none !important;outline:none !important;background:transparent;box-shadow:none !important;}#mod-setting-panel > div > p{display:inline-block;}</style>');
        // Adjust menu for layout 2, 3 and 4
        if (get('layout') == 2 || get('layout') == 3) {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (min-width:1280px){:root{--safe-area-inset-' + (get('layout') == 2 ? 'left' : 'right') + ':120px !important;--min-content-vh:calc(100vh - var(--safe-area-inset-top) - var(--safe-area-inset-bottom)) !important;}#mod-logo{width:100%;height:60px;margin:20px 0;}sl-header sl-tab-bar{--action-neutral-normal:' + menuColor + ';--action-primary-normal:' + menuColor + ';position:absolute !important;width:100% !important;height:100% !important;display:block !important;}sl-header .item span{text-align:center;margin-top:10px;display:block;}sl-header .active .item, sl-header .item:hover{background:' + highLightColor + ' !important;padding-top:0 !important;}sl-header .item:hover i{scale:0.9;}sl-header .item i{transition:scale 0.3s ease !important;height:40px;display:block;padding-top:23px;fill:var(--action-neutral-normal) !important;}sl-header .item svg{width:100%;height:100%;}sl-header sl-tab-item, sl-header sl-tab-item .item{height:120px !important;position:relative !important;display:block !important;}sl-popup{z-index:101 !important;}sl-header{position:fixed !important;z-index:15 !important;' + (get('layout') == 2 ? 'left' : 'right') + ':0 !important;top: 0 !important;height:100% !important;width:120px !important;background:' + get('primarycolor') + ' !important;color:' + menuColor + ' !important;}sl-header > div:first-of-type{position:absolute;bottom:20px;left:17px;--bg-elevated-weakest:' + highLightColor + ';}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width:1280px){:root{--safe-area-inset-' + (get('layout') == 2 ? 'left:100px' : 'right:115px') + ' !important;}sl-tab-bar:first-of-type{position:fixed;top:0;' + (get('layout') == 2 ? 'left' : 'right') + ':0;border-top:none;width:100px;height:100%;display:block !important;z-index:0;background:' + get('primarycolor') + '}sl-tab-bar:first-of-type sl-tab-item svg{width:100%;height:100%;}sl-tab-bar:first-of-type sl-tab-item span{font-size:14px;}sl-tab-bar:first-of-type sl-tab-item span{margin-top:10px;}sl-tab-bar:first-of-type sl-tab-item i{height:40px;fill:var(--action-neutral-normal) !important;padding-top:25px;transition:0.3s scale ease !important;}sl-tab-bar:first-of-type .item:hover i{scale:0.9;}sl-tab-bar:first-of-type .item{height:100%;}sl-tab-bar:first-of-type .active .item, sl-tab-bar:first-of-type .item:hover{background:' + highLightColor + ' !important;padding-top:0 !important;}sl-tab-bar:first-of-type sl-tab-item{--action-neutral-normal:' + menuColor + ';--action-primary-normal:' + menuColor + ';display:block !important;width:100%;height:120px;}sl-header > div:first-of-type{position:fixed;bottom:20px;' + (get('layout') == 2 ? 'left' : 'right') + ':23px;pointer-events:all;--bg-elevated-weakest:' + highLightColor + ';}#mod-logo{--action-neutral-normal: ' + menuColor + ';width:100%;height:60px;margin:20px 0;}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (min-width: 767px) {.header,.headers-container{top:0 !important;}.berichten-lijst{height:calc(100vh - 160px + 96px) !important;}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (min-width: 767px) and (max-width: 1280px) {sl-header{background:none !important;pointer-events:none !important;}sl-header > div:first-of-type{pointer-events:all !important;}sl-berichten > .container{margin-top:-64px !important;}.berichten-lijst{margin-top:64px !important;margin-bottom:0 !important;}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width: 767px) {sl-header:not(.with-back-button){border-bottom:none !important;--column-width: 100% !important;}sl-header.with-back-button .title{margin-left:30px;}sl-header .title{position:absolute !important; left: 20px;}sl-dagen-header{top:calc(64px + var(--safe-area-inset-top)) !important;border-bottom:none !important;}.container > sl-scrollable-title{display:none !important;}.berichten-lijst{margin-top:64px !important;margin-bottom:0 !important;}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-sidebar{height:100% !important;}sl-berichten > .container{position:absolute;top:0;height:100%;width:calc(100% - 100px);}.berichten-lijst{height:calc(100vh - 64px) !important;}.active-border{display:none !important;}sl-rooster-week.week{width:calc(100% - 55px) !important;}sl-header{top:0 !important;}sl-bericht-detail{padding-top:84px !important;}sl-sidebar-page{padding-right:0 !important;}sl-header > div:first-of-type i{--fg-on-primary-weak:' + menuColor + ';}.beta{display:none !important;}</style>');
        }
        else if (get('layout') == 4) {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">:root{--safe-area-inset-left:calc((100% - 1200px) / 2);--safe-area-inset-right:calc((100% - 1200px) / 2);}sl-home{border:var(--thinnest-solid-neutral-normal);display:block;background:var(--bg-neutral-none) !important;}sl-rooster-week.week{width:calc(100% - 55px) !important;}</style>');
        }
        // Position menu relatively
        if (get('layout') == 1 || get('layout') == 4) {
            if (get('bools').charAt(0) == "0") {
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">.beta{display:none !important;}body{margin-top:64px;}sl-rooster sl-header,sl-cijfers sl-header,sl-berichten sl-header{position:absolute !important;width:100%;}sl-rooster .headers-container,sl-rooster .header,sl-cijfers .headers-container,sl-cijfers .header,sl-berichten .headers-container,sl-berichten .header{position:relative !important;}</style>');
            }
        }
        // Hide unread message indicator
        if (get('bools').charAt(2) == "1") {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">hmy-notification-counter{display:none !important;}</style>');
        }
        // Hide menu link text
        if (get('bools').charAt(1) == "0") {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-header .item span{display:none !important;}@media (max-width:1280px){sl-tab-bar:first-of-type .item span{display:none !important;}' + ((get('layout') == 2 || get('layout') == 3) ? 'sl-tab-bar:first-of-type sl-tab-item i{padding-top:37px!important}}sl-header .item i{padding-top:36px !important;}' : '}') + '</style>');
        }
    }

    // Change some setting values to ensure the script will work after updating
    function updateCheck() {
        // Check if user has used the old version of Somtoday and is using new version for the first time
        if (n(get('version')) && !n(get('primarycolor'))) {
            modMessage('Somtoday update!', 'Somtoday heeft een grote update gekregen! Somtoday Mod is hier op voorbereid en heeft aanpassingen gemaakt. De mod-instellingen zijn nu te vinden in een apart tabblad in de instellingen van Somtoday. Het is mogelijk dat je sommige instellingen opnieuw moet instellen.', 'Doorgaan');
            id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 350); });
            set("bools", "110101110111000000000000000000");
            set("secondarycolor", "#e69b22");
        }
        set('version', version);
    }

    // Check if user is new. If so, save some values and display a welcome message.
    function checkNewUser() {
        if (n(get("primarycolor"))) {
            set("firstused", year + "-" + (month + 1) + "-" + dayInt);
            set("birthday", "00-00-0000");
            set('lastjubileum', 0);
            reset();
            tn("html", 0).style.overflow = "hidden";
            tn("head", 0).insertAdjacentHTML('afterbegin', '<style>#welcome{position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000000;background:white;transition:opacity 0.3s ease;}#welcome *{box-sizing:border-box;color:#000;}#welcome h2{line-height:36px;font-size:36px;color:#09f;margin-bottom:30px;}#welcome h3{font-size:24px;margin-top:15px;}#welcome #errordata{width:25px;height:25px;margin:0;margin-top:20px;display:inline-block;}#welcome a{margin-top:20px;display:block;border:3px solid #09f;padding:15px 25px;border-radius:16px;font-size:20px;transition:0.3s background ease,0.2s color ease;width:fit-content;-webkit-user-select:none;user-select:none;cursor:pointer;}#welcome a:hover{background:#09f;color:white;}#welcome label{width:calc(100% - 50px);-webkit-user-select:none;user-select:none;cursor:pointer;font-size:20px;vertical-align:top;padding:19px 16px;}#welcome .modlogo{transition:transform 0.3s ease;}#welcome .modlogo:hover{transform:scale(1.05);}#welcome-background{background:#09f;float:right;width:750px;max-width:50%;height:100%;position:relative;padding-right:75px;transition:width .2s ease,padding-right .2s ease;}#welcome-background center{position:relative;top:50%;transform:translateY(-50%);}#wave{position:absolute;left:0;width:100%;top:0;height:100%;transform:translateX(-240px);}#welcome-text{float:left;width:calc(100% - 850px);padding-right:150px;padding:25px 50px;position:absolute;top:50%;transform:translateY(-50%);}@media (max-width:1500px){#welcome-background{width:550px;}#welcome-text{width:calc(100% - 650px);}}@media (max-width:1300px){#welcome-background{width:350px;}#welcome-text{width:calc(100% - 450px);}}@media (max-width:1060px){#welcome-background{width:250px;padding-right:0;}.modlogo{width:100px;height:100px;}#wave{display:none;}#welcome-text{width:calc(100% - 250px);}}@media (max-width:700px){#welcome-background{width:100%;max-width:100%;position:absolute;height:200px;}#welcome-text{width:100%;}}@media (max-height:850px), (max-width:370px){#welcome-text{top:200px;transform:none;}}@media (max-width:370px){#welcome-text{padding:25px;}}@media (max-height:650px) and (max-width:700px){#welcome-background{display:none;}}@media (max-height:650px){#welcome-text{top:0;}}@media (max-height:520px){#welcome h2{margin-bottom:15px;line-height:1;font-size:30px;}#welcome a{margin-top:0;}#welcome h3{font-size:18px;margin-top:10px;line-height:1;}}</style>');
            id("somtoday-mod").insertAdjacentHTML('afterbegin', '<div id="welcome"><div id="welcome-text"><h2>Somtoday mod is ge&iuml;nstalleerd!</h2><h3>Bedankt voor het downloaden van Somtoday Mod!</h3><h3>De mod zal Somtoday voor je aanpassen, zodat het er mooier uitziet.</h3><input id="errordata" type="checkbox"/><label style="display: inline-block;" for="errordata">Verzamel error-data om Somtoday Mod te verbeteren</label><div class="br"></div><a id="continuetosom">Door naar Somtoday</a></div><div id="welcome-background"><svg id="wave" width="245.3" height="1440"><path d="m235 937-6-48c-5-48-15-144-42-240s-69-192-70-288c1-96 43-192 91-288s102-192 101-288c1-96-53-192-80-240l-26-48h160V937z" transform="translate(-117 503)" data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill="#09f" stroke-miterlimit="10" style="mix-blend-mode:normal" /></svg><center><svg viewBox="0 0 190.5 207" width="190.5" height="207" class="modlogo"><g transform="translate(-144.8 -76.5)"><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill-rule="nonzero" stroke-width="0" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dashoffset="0" style="mix-blend-mode:normal"><path d="M261 107.8v.3c0 3.7 3 6.7 6.6 6.7H299a6.8 6.8 0 0 1 6.7 7V143.2c0 3.7 3 6.7 6.7 6.7h16.1a6.8 6.8 0 0 1 6.7 7V201.6c0 3.7-3 6.6-6.7 6.7h-16.1a6.8 6.8 0 0 0-6.7 7v23.1c0 3.7-3 6.7-6.7 6.7h-10.5a6.8 6.8 0 0 0-6.7 7l-.1 24.4v.3c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.7-7v-24.6c0-3.8-2.8-6.9-6.3-6.9s-6.4 3.1-6.4 7v24.8c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.6-7l.1-24.4v-.3c0-3.7-3-6.7-6.6-6.7h-10.5a6.8 6.8 0 0 1-6.7-7V215c0-3.6-3-6.6-6.7-6.7h-15.8a6.8 6.8 0 0 1-6.7-7V156.6c0-3.7 3-6.7 6.7-6.7h15.8a6.8 6.8 0 0 0 6.7-7v-21.4c0-3.6 3-6.6 6.7-6.7h31a6.8 6.8 0 0 0 6.7-7l.1-24.3v-.3c0-3.6 3-6.6 6.7-6.7h29a6.8 6.8 0 0 1 6.8 7z" data-paper-data="{&quot;index&quot;:null}" fill="#ffffff" stroke="#000000" /><path d="M289.8 179.2c1.3 0 2.9.3 4.6.9 2.2.7 4 1.7 5 2.7v.2c.8.6 1.3 1.5 1.4 2.6 0 .9-.2 1.7-.6 2.3l-6.8 10.8a60.2 60.2 0 0 1-27.5 19.8c-8.5 3.2-17 4.7-24.7 4.5l-13.2-.1a1.6 1.6 0 0 1-1.7-1.5v-3.3a1.6 1.6 0 0 1 1.7-1.5h.1c7.9.3 16.3-1 24.7-4.2a56 56 0 0 0 34.3-31.4v-.3c.5-1 1.4-1.5 2.3-1.5z" fill="#000000" stroke="none" /><g class="glasses"><path d="M171.4 150.8v-9h137.2v9z" fill="#000000" stroke="none" /><path d="M175.7 155.5v-6h57.5v6z" fill="#000000" stroke="none" /><path d="M179.8 160v-9h48.9v9z" fill="#000000" stroke="none" /><path d="M184 164.5v-9h44.7v9z" fill="#000000" stroke="none" /><path d="M188.6 168.6v-7h31.7v7z" fill="#000000" stroke="none" /><path d="M245.9 155.5v-6h57.4v6z" fill="#000000" stroke="none" /><path d="M250 160v-9h48.8v9z" fill="#000000" stroke="none" /><path d="M254 164.5v-9h41v9z" fill="#000000" stroke="none" /><path d="M258.8 168.6v-7h31.6v7z" fill="#000000" stroke="none" /><path d="M184.5 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M188.8 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M193.3 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M193.3 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M197.6 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M202.1 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M254.8 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M259.1 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M263.6 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M263.6 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M268 159.2V155h4.4v4.3z" fill="#ffffff" stroke="none" /><path d="M272.4 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /></g></g></g></svg></center></div></div>')
            if (!n(id('continuetosom'))) {
                id('continuetosom').addEventListener("click", function () {
                    id('welcome').style.opacity = '0';
                    tn("html", 0).style.overflowY = "scroll";
                    if (id("errordata").checked) {
                        // Permission for sending debug-data
                        set("bools", get("bools").replaceAt(4, "1"));
                    }
                    setTimeout(function () {
                        tryRemove(id('welcome'));
                    }, 400);
                });
            }
        }
    }

    // Update the CSS variables used by Somtoday and Somtoday Mod
    function updateCssVariables() {
        tryRemove(id('mod-css-variables'));
        const rgbcolor = hexToRgb(get('primarycolor'));
        // Generate and adjust colors based on highest color channel value
        //console.log(getRelativeLuminance(hexToRgb('#da6710')));
        tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-css-variables">:root, :root.dark.dark {--mod-semi-transparant:' + (darkmode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.65)') + ';--thinnest-solid-neutral-strong:var(--b-thinnest) solid var(--border-neutral-normal);--blue-60:' + toBrightnessValue(get("primarycolor"), 89) + ';--blue-70:' + toBrightnessValue(get("primarycolor"), 81) + ';--yellow-60:' + toBrightnessValue(get("secondarycolor"), 162) + ';--blue-0:' + toBrightnessValue(get("primarycolor"), 241) + ';--blue-80:' + toBrightnessValue(get("primarycolor"), 56) + ';--blue-30:' + toBrightnessValue(get("primarycolor"), 169) + ';--blue-20:' + toBrightnessValue(get("primarycolor"), 198) + ';--blue-100:' + toBrightnessValue(get("primarycolor"), 48) + ';--yellow-20:' + toBrightnessValue(get("secondarycolor"), 198) + ';--blue-40:' + toBrightnessValue(get("primarycolor"), 140) + ';--yellow-50:' + toBrightnessValue(get("secondarycolor"), 173) + ';--orange-30:' + toBrightnessValue(get("secondarycolor"), 180) + ';--orange-60:' + toBrightnessValue(get("secondarycolor"), 141) + ';</style>');
    }

    // Construct an icon in SVG format. Only contains icons used by this mod. Icons thanks to Font Awesome: https://fontawesome.com/
    function getIcon(name, classname, color, start) {
        let svg;
        let viewbox = '0 0 512 512';
        n(name) ? name = "" : null;
        n(color) ? color = "#fff" : null;
        classname = n(classname) ? "" : 'class="' + classname + '" ';
        start = n(start) ? "" : start + " ";
        switch (name) {
            // FONT AWESOME
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
            case 'comment-dots':
                svg = 'M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3 0 0 0 0 0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z';
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
            // Somtoday Logo SVG door Topicus
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

    // Show a message on top of the page. Similair to browser confirm().
    function modMessage(title, description, link1, link2, red1, red2, noBackgroundClick) {
        while (!n(id('mod-message'))) {
            tryRemove(id('mod-message'));
        }
        const element = n(id('somtoday-mod')) ? tn('body', 0) : id('somtoday-mod');
        element.insertAdjacentHTML('afterbegin', '<div id="mod-message" class="mod-msg-open"><center><div onclick="event.stopPropagation();"><h2>' + title + '</h2><p>' + description + '</p>' + (n(link1) ? '' : '<a id="mod-message-action1" class="mod-message-button' + (red1 ? ' mod-button-discouraged' : '') + '" tabindex="0">' + link1 + '</a>') + (n(link2) ? '' : '<a id="mod-message-action2" class="mod-message-button' + (red2 ? ' mod-button-discouraged' : '') + '" tabindex="0">' + link2 + '</a>') + '</div></center></div>');
        if (!n(link1)) {
            id('mod-message-action1').focus();
            id('mod-message-action1').addEventListener("keydown", (event) => { if (event.keyCode === 13) { id('mod-message-action1').click(); } else if (event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 9) { event.preventDefault(); if (!n(id('mod-message-action2'))) { id('mod-message-action2').focus(); } } });
        }
        if (!n(link2)) {
            id('mod-message-action2').addEventListener("keydown", (event) => { if (event.keyCode === 13) { id('mod-message-action2').click(); } else if (event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 9) { event.preventDefault(); id('mod-message-action1').focus(); } });
            if (noBackgroundClick == null) {
                id('mod-message').addEventListener("click", function () { if (!n('mod-message-action2')) { id('mod-message-action2').click(); } });
            }
        }
        else if (!n(link1) && noBackgroundClick == null) {
            id('mod-message').addEventListener("click", function () { if (!n('mod-message-action1')) { id('mod-message-action1').click(); } });
        }
    }





    // 7 - CUSTOMIZATION

    // Change profile pictures when enabled
    function profilePicture() {
        if (!n(get('profilepic')) && get('bools').charAt(3) == "1") {
            setTimeout(function () {
                for (const element of cn('foto')) {
                    element.src = get('profilepic');
                }
            }, 1000);
        }
    }

    // Change teacher names to nicknames when enabled
    function teacherNicknames() {
        if (!n(get('nicknames'))) {
            let namearray = get("nicknames").split("|");
            for (let i = 0; i < (namearray.length / 2); i++) {
                let real = namearray[i * 2];
                let nick = namearray[i * 2 + 1];
                if (real != "") {
                    let regex = new RegExp("(.*?)" + real.replace(/\\/g, '\\\\') + "(.*?)", "g");
                    nick = "$1" + nick + "$2";
                    for (const element of cn('afzenders')) {
                        const text = element.innerHTML.replace(regex, nick);
                        element.innerHTML = "";
                        element.append(document.createRange().createContextualFragment(text));
                    }
                    for (const element of cn('ontvangers ellipsis')) {
                        const text = element.innerHTML.replace(regex, nick);
                        element.innerHTML = "";
                        element.append(document.createRange().createContextualFragment(text));
                    }
                    for (const element of cn('van')) {
                        const text = element.innerHTML.replace(regex, nick);
                        element.innerHTML = "";
                        element.append(document.createRange().createContextualFragment(text));
                    }
                }
            }
        }
    }

    // Change username when enabled
    function userName() {
        if (!n(get('username'))) {
            for (const element of cn('van')) {
                if (element.innerHTML.indexOf(get('realname')) != -1) {
                    element.innerHTML = "";
                    element.append(document.createRange().createContextualFragment(get('username')));
                }
            }
            for (const element of cn('ontvanger-naam')) {
                if (element.innerHTML.indexOf(get('realname')) != -1) {
                    element.innerHTML = "";
                    element.append(document.createRange().createContextualFragment(get('username')));
                }
            }
        }
    }

    // Insert modlogo into menu when enabled
    function modLogo() {
        tryRemove(id('mod-logo'))
        if (get('layout') == 2 || get('layout') == 3) {
            const logo = (get('bools').charAt(6) == "0" ? getIcon('logo', null, menuColor, ' id="mod-logo"') : '<svg id="mod-logo" viewBox="0 0 190.5 207" width="190.5" height="207" class="modlogo"><g transform="translate(-144.8 -76.5)"><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill-rule="nonzero" stroke-width="0" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dashoffset="0" style="mix-blend-mode:normal"><path d="M261 107.8v.3c0 3.7 3 6.7 6.6 6.7H299a6.8 6.8 0 0 1 6.7 7V143.2c0 3.7 3 6.7 6.7 6.7h16.1a6.8 6.8 0 0 1 6.7 7V201.6c0 3.7-3 6.6-6.7 6.7h-16.1a6.8 6.8 0 0 0-6.7 7v23.1c0 3.7-3 6.7-6.7 6.7h-10.5a6.8 6.8 0 0 0-6.7 7l-.1 24.4v.3c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.7-7v-24.6c0-3.8-2.8-6.9-6.3-6.9s-6.4 3.1-6.4 7v24.8c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.6-7l.1-24.4v-.3c0-3.7-3-6.7-6.6-6.7h-10.5a6.8 6.8 0 0 1-6.7-7V215c0-3.6-3-6.6-6.7-6.7h-15.8a6.8 6.8 0 0 1-6.7-7V156.6c0-3.7 3-6.7 6.7-6.7h15.8a6.8 6.8 0 0 0 6.7-7v-21.4c0-3.6 3-6.6 6.7-6.7h31a6.8 6.8 0 0 0 6.7-7l.1-24.3v-.3c0-3.6 3-6.6 6.7-6.7h29a6.8 6.8 0 0 1 6.8 7z" data-paper-data="{&quot;index&quot;:null}" fill="var(--action-neutral-normal)" stroke="#000000" /><path d="M289.8 179.2c1.3 0 2.9.3 4.6.9 2.2.7 4 1.7 5 2.7v.2c.8.6 1.3 1.5 1.4 2.6 0 .9-.2 1.7-.6 2.3l-6.8 10.8a60.2 60.2 0 0 1-27.5 19.8c-8.5 3.2-17 4.7-24.7 4.5l-13.2-.1a1.6 1.6 0 0 1-1.7-1.5v-3.3a1.6 1.6 0 0 1 1.7-1.5h.1c7.9.3 16.3-1 24.7-4.2a56 56 0 0 0 34.3-31.4v-.3c.5-1 1.4-1.5 2.3-1.5z" fill="#000000" stroke="none" /><g class="glasses"><path d="M171.4 150.8v-9h137.2v9z" fill="#000000" stroke="none" /><path d="M175.7 155.5v-6h57.5v6z" fill="#000000" stroke="none" /><path d="M179.8 160v-9h48.9v9z" fill="#000000" stroke="none" /><path d="M184 164.5v-9h44.7v9z" fill="#000000" stroke="none" /><path d="M188.6 168.6v-7h31.7v7z" fill="#000000" stroke="none" /><path d="M245.9 155.5v-6h57.4v6z" fill="#000000" stroke="none" /><path d="M250 160v-9h48.8v9z" fill="#000000" stroke="none" /><path d="M254 164.5v-9h41v9z" fill="#000000" stroke="none" /><path d="M258.8 168.6v-7h31.6v7z" fill="#000000" stroke="none" /><path d="M184.5 155.1v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M188.8 159.2V155h4.5v4.3z" fill="#fff" stroke="none" /><path d="M193.3 163.5v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M193.3 155.1v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M197.6 159.2V155h4.5v4.3z" fill="#fff" stroke="none" /><path d="M202.1 163.5v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M254.8 155.1v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M259.1 159.2V155h4.5v4.3z" fill="#fff" stroke="none" /><path d="M263.6 163.5v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M263.6 155.1v-4.3h4.5v4.3z" fill="#fff" stroke="none" /><path d="M268 159.2V155h4.4v4.3z" fill="#fff" stroke="none" /><path d="M272.4 163.5v-4.3h4.5v4.3z" fill="#fff" stroke="none"/></g></g></g></svg>');
            if (n(id('mod-logo')) && !n(tn('sl-header', 0)) && !n(tn('sl-header', 0).getElementsByTagName('sl-tab-bar')[0])) {
                tn('sl-header', 0).getElementsByTagName('sl-tab-bar')[0].insertAdjacentHTML('afterbegin', logo);
            }
            else if (n(id('mod-logo')) && !n(tn('sl-tab-bar', 0))) {
                tn('sl-tab-bar', 0).insertAdjacentHTML('afterbegin', logo);
            }
        }
    }

    // Show user initials instead of profile picture
    function showInitials() {
        if (get('bools').charAt(3) == "0" && !n(tn('sl-avatar', 0))) {
            setTimeout(function () {
                const ng = tn('sl-avatar', 0).getElementsByTagName('img')[0].attributes[0].name;
                tn('sl-avatar', 0).getElementsByClassName('container')[0].insertAdjacentHTML('beforeend', '<div ' + ng + ' class="initials ng-star-inserted"><span ' + ng + '>' + get('username').replace(/[^A-Z]+/g, "") + '</span></div>');
                tn('sl-avatar', 0).getElementsByTagName('img')[0].remove();
            }, 1000);
        }
    }

    // Insert the background
    function setBackground() {
        tryRemove(id('mod-background'));
        tryRemove(id('mod-background-style'));
        if (!n(get('background'))) {
            id('somtoday-mod', 0).insertAdjacentHTML('beforeend', '<img id="mod-background" src="' + get('background') + '">');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-background-style">#mod-background{position:fixed;left:-' + get('blur') + 'px;width:calc(100% + ' + (get('blur') * 2) + 'px);top:-' + get('blur') + 'px;height:calc(100% + ' + (get('blur') * 2) + 'px);object-fit:cover;z-index:-1;opacity:' + (1 - get("transparency")) + ';filter:blur(' + get("blur") + 'px);}</style>');
        }
    }

    // Change title and icon of Somtoday when enabled
    function browserSettings() {
        if (!n(get('title'))) {
            tn('title', 0).innerHTML = get('title');
        }
        if (!n(get('icon'))) {
            for (const element of tn('link')) {
                if (element.getAttribute('rel') == "icon") {
                    element.href = get("icon");
                }
            }
        }
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
                congratstext = ["Bedankt" + (n(get('username')) ? '' : ', ' + get('username').replace(/ .*/, '')) + "!", "Je gebruikt Somtoday mod nu al " + yeardifference + " jaar. Bedankt!"];
                set('lastjubileum', yeardifference);
            }
            if (birthdayday == dayInt && birthdaymonth == (month + 1)) {
                congratstext = ["Fijne verjaardag!", "Maak er maar een mooie dag van!"];
            }
            if (congratstext[1] != null) {
                // Confetti should be shown, so insert the confetti
                tn("html", 0).style.overflow = "hidden";
                tn('body', 0).insertAdjacentHTML('afterbegin', '<style>#verjaardag{width:100%;height:100%;position:fixed;top:0;left:0;z-index:10000;background:var(--bg-elevated-none);text-align:center;transition:0.3s opacity ease;}#verjaardag div{top:50%;left:50%;transform:translate(-50%, -50%);position:absolute;}.bouncetext{animation:bounce 0.3s ease forwards;color:var(--action-primary-normal);}.bouncetext.small{font-size:0;animation:bouncesmall 0.5s ease forwards 0.3s;margin-top:35px;}@keyframes bouncesmall{0%{font-size:0px;}80%{font-size:29px;}100%{font-size:24px;}}@keyframes bounce{0%{font-size:0px;}80%{font-size:58px;}100%{font-size:48px;}}.verjaardagbtn{background:var(--action-primary-normal);padding:25px 40px;width:fit-content;color:var(--bg-elevated-none) !important;margin-top:50px;opacity:0;display:block;animation:2s fadein ease 0.6s forwards;font-size:16px;border-radius:16px;transition:0.3s background ease !important;}.verjaardagbtn:hover{cursor:pointer;background:var(--action-primary-strong);}@keyframes fadein{0%{opacity:0;}100%{opacity:1;}}</style><div id="verjaardag"><div><h2 class="bouncetext">' + congratstext[0] + '</h2><h2 class="bouncetext small">' + congratstext[1] + '</h2><center><a class="verjaardagbtn" id="congrats-continue">Doorgaan</a></center></div></div>');
                id("congrats-continue").addEventListener("click", function () {
                    id("confetti-canvas").style.opacity = '0';
                    id("verjaardag").style.opacity = '0';
                    setTimeout(function () {
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
                (function () {
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
                        window.requestAnimFrame = (function () {
                            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
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
                            window.addEventListener("resize", function () {
                                canvas.width = window.innerWidth;
                                canvas.height = window.innerHeight;
                            }, { passive: true });
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





    // 8 - GRADE TOOLS

    // Download image of last n grades OR download image of average of all grades
    function downloadGrades() {
        if (n(tn('sl-resultaat-item', 0))) {
            download();
        }
        else {
            modMessage('Hoeveel cijfers wil je downloaden?', 'Kies het aantal cijfers dat je wil downloaden (1-25).<div class="br"></div><input id="mod-grades-amount" type="number" min="1" max="25" step="1" onkeyup="if (this.value != \'\') { this.value = Math.floor(this.value); } if (this.value < 1 && this.value != \'\') { this.value = 1; } else if (this.value > 25) { this.value = 25; }"/>', 'Doorgaan', 'Annuleren');
            id('mod-message-action1').addEventListener("click", download);
            id('mod-message-action2').addEventListener("click", function () {
                id('mod-message').classList.remove('mod-msg-open');
                setTimeout(function () { tryRemove(id('mod-message')); }, 355);
            });
        }
        function download() {
            let number = n(tn('sl-resultaat-item', 0)) ? tn('sl-vakgemiddelde-item').length : Math.round(parseFloat(id('mod-grades-amount').value));
            if (isNaN(number)) {
                number = 1;
            }
            // Show a loading message
            modMessage('Downloaden...', 'Somtoday Mod is bezig met het genereren van je afbeelding. Dit kan even duren...')
            // Construct HTML
            let html = '<div style="width:650px;height:120px;background:#0099ff;display:block;"><svg style="padding:40px 28px;display:inline-block;" xmlns="http://www.w3.org/2000/svg" width="250" height="40" viewBox="0 0 300 49" fill="none"><path d="M44.6819 17.3781H43.3148C41.7353 17.3781 40.4606 16.1316 40.4606 14.5871V11.9045C40.4606 10.36 39.1859 9.11355 37.6064 9.11355H32.6184C31.0389 9.11355 29.7642 7.8671 29.7642 6.32258V2.79097C29.7642 1.24645 28.4895 0 26.91 0H22.153C20.5734 0 19.2987 1.24645 19.2987 2.79097V6.32258C19.2987 7.8671 18.024 9.11355 16.4445 9.11355H11.4566C9.87706 9.11355 8.60236 10.36 8.60236 11.9045V14.5871C8.60236 16.1316 7.32766 17.3781 5.74814 17.3781H4.38107C2.80155 17.3781 1.52686 18.6245 1.52686 20.169V28.5058C1.52686 30.0503 2.80155 31.2968 4.38107 31.2968H5.72967C7.30918 31.2968 8.58388 32.5432 8.58388 34.0877V37.1768C8.58388 38.7213 9.85858 39.9677 11.4381 39.9677C13.0176 39.9677 14.2923 41.2142 14.2923 42.7587V46.209C14.2923 47.7535 15.567 49 17.1465 49H20.2132C21.7927 49 23.0674 47.7535 23.0674 46.209V41.4039C23.0674 40.609 23.7232 39.9768 24.5269 39.9768C25.3305 39.9768 25.9863 40.6181 25.9863 41.4039V46.209C25.9863 47.7535 27.261 49 28.8405 49H31.9072C33.4867 49 34.7614 47.7535 34.7614 46.209V42.7587C34.7614 41.2142 36.0361 39.9677 37.6156 39.9677C39.1951 39.9677 40.4698 38.7213 40.4698 37.1768V34.0877C40.4698 32.5432 41.7445 31.2968 43.324 31.2968H44.6726C46.2522 31.2968 47.5269 30.0503 47.5269 28.5058V20.169C47.5269 18.6245 46.2522 17.3781 44.6726 17.3781H44.6819ZM37.902 26.4465C37.006 29.3368 35.0108 31.7123 32.2859 33.1394C30.5863 34.0245 28.7297 34.4761 26.8453 34.4761C25.7184 34.4761 24.5823 34.3135 23.4738 33.9794C22.7995 33.7806 22.4208 33.0852 22.624 32.4348C22.8273 31.7755 23.5385 31.4052 24.2128 31.6039C26.522 32.2903 28.9606 32.0555 31.0943 30.9445C33.2188 29.8335 34.7799 27.9819 35.4819 25.7239C35.6851 25.0645 36.3963 24.7032 37.0706 24.8929C37.7449 25.0916 38.1236 25.7871 37.9204 26.4465H37.902Z" fill="white"/><path d="M78.6921 18.0352C77.0176 18.0352 75.7302 18.4777 75.7302 19.5882C75.7302 20.473 76.3064 20.78 77.6298 21.1412L81.6901 22.1615C86.1105 23.3533 87.4339 25.6647 87.4339 28.7616C87.4339 33.2761 83.9048 36.2917 77.8098 36.2917C73.7495 36.2917 70.5265 35.1812 68.7079 34.2963L70.0764 28.4907C72.1921 29.6013 74.9379 30.6577 77.2787 30.6577C79.1332 30.6577 80.1506 30.3056 80.1506 29.2853C80.1506 28.5359 79.2683 28.0935 77.8548 27.7323L74.0556 26.712C70.2564 25.6466 68.4019 23.5248 68.4019 20.0216C68.4019 15.4168 72.4171 12.2748 78.8722 12.2748C81.9151 12.2748 85.6693 13.1145 87.4879 13.9542L85.5883 19.8862C83.4276 18.7305 80.8618 18.0262 78.7011 18.0262L78.6921 18.0352Z" fill="white"/><path d="M90.6208 24.2833C90.6208 17.2407 95.8785 12.0581 103.027 12.0581C110.175 12.0581 115.442 17.2407 115.442 24.2833C115.442 31.3258 110.184 36.5084 103.027 36.5084C95.8695 36.5084 90.6208 31.3258 90.6208 24.2833ZM108.329 24.2833C108.329 21.2315 106.169 18.8388 103.027 18.8388C99.8848 18.8388 97.7691 21.2315 97.7691 24.2833C97.7691 27.3351 99.8848 29.7277 103.027 29.7277C106.169 29.7277 108.329 27.3351 108.329 24.2833Z" fill="white"/><path d="M127.361 14.9744C129.036 13.295 131.377 12.2296 134.339 12.2296C138.003 12.2296 140.344 13.5117 141.541 16.1753C143.179 13.8729 145.871 12.2748 149.49 12.2748C155.45 12.2748 157.881 16.8344 157.881 22.5045V27.9129C157.881 29.0686 158.106 30.0347 159.204 30.0347C159.871 30.0347 160.708 29.7728 161.455 29.4117L161.761 35.2985C160.564 35.7861 158.313 36.2736 156.198 36.2736C152.578 36.2736 150.454 34.4588 150.454 29.6735V23.7415C150.454 20.771 149.085 19.1367 146.564 19.1367C144.62 19.1367 143.296 20.3286 142.675 21.6197V35.8403H135.257V23.7054C135.257 20.78 133.979 19.1458 131.458 19.1458C129.342 19.1458 128.01 20.3827 127.352 21.71V35.8403H119.934V12.672H127.352V14.9744H127.361Z" fill="white"/><path d="M173.951 12.6721H181.946V18.4325H173.951V26.2245C173.951 28.879 174.924 29.8541 176.643 29.8541C178.363 29.8541 179.956 29.0144 181.018 28.256L183.269 33.9262C180.973 35.3437 177.921 36.2737 174.257 36.2737C169.486 36.2737 166.533 33.3483 166.533 27.7684V18.4235H162.599V12.663H166.749L167.676 6.77618H173.951V12.663V12.6721Z" fill="white"/><path d="M185.394 24.2833C185.394 17.2407 190.651 12.0581 197.8 12.0581C204.948 12.0581 210.215 17.2407 210.215 24.2833C210.215 31.3258 204.957 36.5084 197.8 36.5084C190.642 36.5084 185.394 31.3258 185.394 24.2833ZM203.102 24.2833C203.102 21.2315 200.942 18.8388 197.8 18.8388C194.658 18.8388 192.542 21.2315 192.542 24.2833C192.542 27.3351 194.658 29.7277 197.8 29.7277C200.942 29.7277 203.102 27.3351 203.102 24.2833Z" fill="white"/><path d="M241.833 35.3076C240.68 35.7951 238.475 36.2827 236.314 36.2827C233.757 36.2827 231.894 35.3979 231.056 33.1406C229.598 35.0006 227.347 36.2827 223.944 36.2827C217.669 36.2827 213.303 31.2355 213.303 24.2381C213.303 17.2407 217.678 12.2748 223.944 12.2748C226.726 12.2748 228.977 13.2499 230.525 14.6674V4.39252H237.944V27.9129C237.944 29.1047 238.205 30.0347 239.357 30.0347C239.978 30.0347 240.725 29.7728 241.563 29.4117L241.824 35.2985L241.833 35.3076ZM230.525 28.1747V20.4279C229.373 19.3625 227.743 18.7485 226.105 18.7485C222.927 18.7485 220.847 20.8703 220.847 24.2381C220.847 27.6059 222.882 29.818 226.105 29.818C227.824 29.818 229.553 29.0234 230.525 28.1747Z" fill="white"/><path d="M270.282 30.0347C271.164 30.0347 271.83 29.7728 272.532 29.4117L272.793 35.2985C271.56 35.7861 269.48 36.2737 267.275 36.2737C264.628 36.2737 262.809 35.2534 262.017 32.951C260.468 34.811 258.038 36.2285 254.95 36.2285C248.63 36.2285 244.308 31.2716 244.308 24.3103C244.308 17.349 248.639 12.2657 254.95 12.2657C257.822 12.2657 260.027 13.1506 261.486 14.7036V12.663H268.904V27.9039C268.904 29.0596 269.165 30.0257 270.273 30.0257L270.282 30.0347ZM257.074 29.809C258.704 29.809 260.342 29.1408 261.495 28.1296V20.4189C260.568 19.4889 258.803 18.7395 257.074 18.7395C253.851 18.7395 251.862 20.9064 251.862 24.3194C251.862 27.7323 253.896 29.809 257.074 29.809Z" fill="white"/><path d="M300 12.6721L290.817 35.5243C288.341 41.8174 285.865 44.6074 280.392 44.6074C278.357 44.6074 276.286 43.858 275.089 43.0544L276.151 37.3842C277.259 37.9621 278.753 38.5851 280.257 38.5851C282.111 38.5851 282.904 37.6551 283.66 36.0118L284.056 35.0367L273.766 12.6721H281.976L287.234 27.7323L292.537 12.6721H300Z" fill="white"/></svg><h3 style="float:right;color:#fff;font-family:Kanit,Tahoma,Arial,sans-serif;vertical-align:top;margin-top:35px;padding-right:30px;letter-spacing:1.5px;font-size:30px;">' + (n(tn('sl-resultaat-item', 0)) ? 'Mijn gemiddelden' : 'Mijn cijfers') + '</h3></div><div style="width:600px;padding:40px 25px;background:#fff;height:' + (n(tn('sl-resultaat-item', 0)) ? Math.round(220 + number * 110).toString() : Math.round(280 + number * 134).toString()) + ';">';
            for (let i = 0; i < number; i++) {
                html += '<div style="width:100%;border:2px solid rgb(218, 223, 227);border-radius:6px;padding:20px 30px;margin-bottom:15px;box-sizing:border-box;' + (n(tn('sl-resultaat-item', 0)) ? 'height:95px;' : '') + '"><svg style="background:#eaedf0;padding:10px;float:left;border-radius:50%;margin-right:12px;overflow: visible;" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 20 20" display="block">' + (n(tn('sl-resultaat-item', 0)) ? tn('sl-vakgemiddelde-item', i).getElementsByTagName('svg')[0].innerHTML : tn('sl-resultaat-item', i).getElementsByTagName('svg')[0].innerHTML) + '</svg><h3 style="font-family:KanitBold;font-size:30px;margin:0;display:block;float:left;max-width:400px;height:40px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">' + (n(tn('sl-resultaat-item', 0)) ? tn('sl-vakgemiddelde-item', i).getElementsByTagName('span')[0].innerHTML : tn('sl-resultaat-item', i).getElementsByClassName('titel')[0].innerHTML) + '</h3><h3 style="font-family:KanitBold;font-size:30px;margin:0;display:block;float:right;color:' + (n(tn('sl-resultaat-item', 0)) ? (tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[0].classList.contains('onvoldoende') ? '#d32f0d' : (tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[0].classList.contains('neutraal') ? '#a7b3be' : '#000')) : (tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0].classList.contains('onvoldoende') ? '#d32f0d' : (tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0].classList.contains('neutraal') ? '#a7b3be' : '#000'))) + ';">' + (n(tn('sl-resultaat-item', 0)) ? tn('sl-vakgemiddelde-item', i).getElementsByClassName('cijfer')[0].innerHTML : tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0].innerHTML) + '</h3>' + (n(tn('sl-resultaat-item', 0)) ? '' : '<p style="font-family:Kanit;float:right;font-size:24px;color:#888;margin:5px 10px;display:block;float:right;">' + tn('sl-resultaat-item', i).getElementsByClassName('weging ng-star-inserted')[0].innerHTML + '</p><p style="clear:both;font-family:Kanit;font-size:26px;height:35px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;margin:0;display:block;">' + tn('sl-resultaat-item', i).getElementsByClassName('subtitel ng-star-inserted')[0].innerHTML + '</p>') + '</div>';
            }
            html += '</div>';
            // Insert canvas
            tn('body', 0).insertAdjacentHTML('beforeend', '<canvas id="mod-grade-canvas" width="650" height="' + (n(tn('sl-resultaat-item', 0)) ? Math.round(220 + number * 110).toString() : Math.round(280 + number * 134).toString()) + '" style="display:none;"></canvas>');
            const canvas = id('mod-grade-canvas');
            const ctx = canvas.getContext('2d'); !n(tn('sl-resultaat-item', 0)) || !n(tn('sl-vakgemiddelde-item', 0))
            // Use data urls for font in SVG
            const kanitbold = 'MARK_BOLD';
            const kanitregular = 'MARK_REGULAR';
            // Add SVG with HTML to the canvas
            var img = new Image();
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><defs><style type="text/css">@font-face{font-family:KanitBold;src:url('${kanitbold}')}@font-face{font-family:Kanit;src:url('${kanitregular}')}</style></defs><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${html}</div></foreignObject></svg>`;
            const svgObjectUrl = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svg);
            const tempImg = new Image();
            tempImg.addEventListener('load', function () {
                ctx.drawImage(tempImg, 0, 0);
                URL.revokeObjectURL(svgObjectUrl);
                let a = document.createElement('a');
                a.href = canvas.toDataURL("image/png");
                a.download = n(tn('sl-resultaat-item', 0)) ? "gemiddelden.png" : "cijfers.png";
                a.dispatchEvent(new MouseEvent("click"));
                tryRemove(id('mod-grade-canvas'));
                if (!n(id('mod-message'))) {
                    id('mod-message').classList.remove('mod-msg-open');
                    setTimeout(function () { tryRemove(id('mod-message')); }, 355);
                }
            });
            tempImg.src = svgObjectUrl;
        }
    }

    // Add graphs to the subject grade page
    function gradeGraphs() {
        // Chart.js v3.9.0
        // Copyright 2022 Chart.js Contributors
        // Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
        // The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
        // THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        // [Start of Chart.js]
        !function (t, e) { "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).Chart = e() }(this, (function () { "use strict"; function t() { } const e = function () { let t = 0; return function () { return t++ } }(); function i(t) { return null == t } function s(t) { if (Array.isArray && Array.isArray(t)) return !0; const e = Object.prototype.toString.call(t); return "[object" === e.slice(0, 7) && "Array]" === e.slice(-6) } function n(t) { return null !== t && "[object Object]" === Object.prototype.toString.call(t) } const o = t => ("number" == typeof t || t instanceof Number) && isFinite(+t); function a(t, e) { return o(t) ? t : e } function r(t, e) { return void 0 === t ? e : t } const l = (t, e) => "string" == typeof t && t.endsWith("%") ? parseFloat(t) / 100 : t / e, h = (t, e) => "string" == typeof t && t.endsWith("%") ? parseFloat(t) / 100 * e : +t; function c(t, e, i) { if (t && "function" == typeof t.call) return t.apply(i, e) } function d(t, e, i, o) { let a, r, l; if (s(t)) if (r = t.length, o) for (a = r - 1; a >= 0; a--)e.call(i, t[a], a); else for (a = 0; a < r; a++)e.call(i, t[a], a); else if (n(t)) for (l = Object.keys(t), r = l.length, a = 0; a < r; a++)e.call(i, t[l[a]], l[a]) } function u(t, e) { let i, s, n, o; if (!t || !e || t.length !== e.length) return !1; for (i = 0, s = t.length; i < s; ++i)if (n = t[i], o = e[i], n.datasetIndex !== o.datasetIndex || n.index !== o.index) return !1; return !0 } function f(t) { if (s(t)) return t.map(f); if (n(t)) { const e = Object.create(null), i = Object.keys(t), s = i.length; let n = 0; for (; n < s; ++n)e[i[n]] = f(t[i[n]]); return e } return t } function g(t) { return -1 === ["__proto__", "prototype", "constructor"].indexOf(t) } function p(t, e, i, s) { if (!g(t)) return; const o = e[t], a = i[t]; n(o) && n(a) ? m(o, a, s) : e[t] = f(a) } function m(t, e, i) { const o = s(e) ? e : [e], a = o.length; if (!n(t)) return t; const r = (i = i || {}).merger || p; for (let s = 0; s < a; ++s) { if (!n(e = o[s])) continue; const a = Object.keys(e); for (let s = 0, n = a.length; s < n; ++s)r(a[s], t, e, i) } return t } function b(t, e) { return m(t, e, { merger: x }) } function x(t, e, i) { if (!g(t)) return; const s = e[t], o = i[t]; n(s) && n(o) ? b(s, o) : Object.prototype.hasOwnProperty.call(e, t) || (e[t] = f(o)) } const _ = { "": t => t, x: t => t.x, y: t => t.y }; function y(t, e) { const i = _[e] || (_[e] = function (t) { const e = v(t); return t => { for (const i of e) { if ("" === i) break; t = t && t[i] } return t } }(e)); return i(t) } function v(t) { const e = t.split("."), i = []; let s = ""; for (const t of e) s += t, s.endsWith("\\") ? s = s.slice(0, -1) + "." : (i.push(s), s = ""); return i } function w(t) { return t.charAt(0).toUpperCase() + t.slice(1) } const M = t => void 0 !== t, k = t => "function" == typeof t, S = (t, e) => { if (t.size !== e.size) return !1; for (const i of t) if (!e.has(i)) return !1; return !0 }; function P(t) { return "mouseup" === t.type || "click" === t.type || "contextmenu" === t.type } const D = Math.PI, O = 2 * D, C = O + D, A = Number.POSITIVE_INFINITY, T = D / 180, L = D / 2, E = D / 4, R = 2 * D / 3, I = Math.log10, z = Math.sign; function F(t) { const e = Math.round(t); t = N(t, e, t / 1e3) ? e : t; const i = Math.pow(10, Math.floor(I(t))), s = t / i; return (s <= 1 ? 1 : s <= 2 ? 2 : s <= 5 ? 5 : 10) * i } function V(t) { const e = [], i = Math.sqrt(t); let s; for (s = 1; s < i; s++)t % s == 0 && (e.push(s), e.push(t / s)); return i === (0 | i) && e.push(i), e.sort(((t, e) => t - e)).pop(), e } function B(t) { return !isNaN(parseFloat(t)) && isFinite(t) } function N(t, e, i) { return Math.abs(t - e) < i } function W(t, e) { const i = Math.round(t); return i - e <= t && i + e >= t } function j(t, e, i) { let s, n, o; for (s = 0, n = t.length; s < n; s++)o = t[s][i], isNaN(o) || (e.min = Math.min(e.min, o), e.max = Math.max(e.max, o)) } function H(t) { return t * (D / 180) } function $(t) { return t * (180 / D) } function Y(t) { if (!o(t)) return; let e = 1, i = 0; for (; Math.round(t * e) / e !== t;)e *= 10, i++; return i } function U(t, e) { const i = e.x - t.x, s = e.y - t.y, n = Math.sqrt(i * i + s * s); let o = Math.atan2(s, i); return o < -.5 * D && (o += O), { angle: o, distance: n } } function X(t, e) { return Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2)) } function q(t, e) { return (t - e + C) % O - D } function K(t) { return (t % O + O) % O } function G(t, e, i, s) { const n = K(t), o = K(e), a = K(i), r = K(o - n), l = K(a - n), h = K(n - o), c = K(n - a); return n === o || n === a || s && o === a || r > l && h < c } function Z(t, e, i) { return Math.max(e, Math.min(i, t)) } function J(t) { return Z(t, -32768, 32767) } function Q(t, e, i, s = 1e-6) { return t >= Math.min(e, i) - s && t <= Math.max(e, i) + s } function tt(t, e, i) { i = i || (i => t[i] < e); let s, n = t.length - 1, o = 0; for (; n - o > 1;)s = o + n >> 1, i(s) ? o = s : n = s; return { lo: o, hi: n } } const et = (t, e, i, s) => tt(t, i, s ? s => t[s][e] <= i : s => t[s][e] < i), it = (t, e, i) => tt(t, i, (s => t[s][e] >= i)); function st(t, e, i) { let s = 0, n = t.length; for (; s < n && t[s] < e;)s++; for (; n > s && t[n - 1] > i;)n--; return s > 0 || n < t.length ? t.slice(s, n) : t } const nt = ["push", "pop", "shift", "splice", "unshift"]; function ot(t, e) { t._chartjs ? t._chartjs.listeners.push(e) : (Object.defineProperty(t, "_chartjs", { configurable: !0, enumerable: !1, value: { listeners: [e] } }), nt.forEach((e => { const i = "_onData" + w(e), s = t[e]; Object.defineProperty(t, e, { configurable: !0, enumerable: !1, value(...e) { const n = s.apply(this, e); return t._chartjs.listeners.forEach((t => { "function" == typeof t[i] && t[i](...e) })), n } }) }))) } function at(t, e) { const i = t._chartjs; if (!i) return; const s = i.listeners, n = s.indexOf(e); -1 !== n && s.splice(n, 1), s.length > 0 || (nt.forEach((e => { delete t[e] })), delete t._chartjs) } function rt(t) { const e = new Set; let i, s; for (i = 0, s = t.length; i < s; ++i)e.add(t[i]); return e.size === s ? t : Array.from(e) } const lt = "undefined" == typeof window ? function (t) { return t() } : window.requestAnimationFrame; function ht(t, e, i) { const s = i || (t => Array.prototype.slice.call(t)); let n = !1, o = []; return function (...i) { o = s(i), n || (n = !0, lt.call(window, (() => { n = !1, t.apply(e, o) }))) } } function ct(t, e) { let i; return function (...s) { return e ? (clearTimeout(i), i = setTimeout(t, e, s)) : t.apply(this, s), e } } const dt = t => "start" === t ? "left" : "end" === t ? "right" : "center", ut = (t, e, i) => "start" === t ? e : "end" === t ? i : (e + i) / 2, ft = (t, e, i, s) => t === (s ? "left" : "right") ? i : "center" === t ? (e + i) / 2 : e; function gt(t, e, i) { const s = e.length; let n = 0, o = s; if (t._sorted) { const { iScale: a, _parsed: r } = t, l = a.axis, { min: h, max: c, minDefined: d, maxDefined: u } = a.getUserBounds(); d && (n = Z(Math.min(et(r, a.axis, h).lo, i ? s : et(e, l, a.getPixelForValue(h)).lo), 0, s - 1)), o = u ? Z(Math.max(et(r, a.axis, c, !0).hi + 1, i ? 0 : et(e, l, a.getPixelForValue(c), !0).hi + 1), n, s) - n : s - n } return { start: n, count: o } } function pt(t) { const { xScale: e, yScale: i, _scaleRanges: s } = t, n = { xmin: e.min, xmax: e.max, ymin: i.min, ymax: i.max }; if (!s) return t._scaleRanges = n, !0; const o = s.xmin !== e.min || s.xmax !== e.max || s.ymin !== i.min || s.ymax !== i.max; return Object.assign(s, n), o } var mt = new class { constructor() { this._request = null, this._charts = new Map, this._running = !1, this._lastDate = void 0 } _notify(t, e, i, s) { const n = e.listeners[s], o = e.duration; n.forEach((s => s({ chart: t, initial: e.initial, numSteps: o, currentStep: Math.min(i - e.start, o) }))) } _refresh() { this._request || (this._running = !0, this._request = lt.call(window, (() => { this._update(), this._request = null, this._running && this._refresh() }))) } _update(t = Date.now()) { let e = 0; this._charts.forEach(((i, s) => { if (!i.running || !i.items.length) return; const n = i.items; let o, a = n.length - 1, r = !1; for (; a >= 0; --a)o = n[a], o._active ? (o._total > i.duration && (i.duration = o._total), o.tick(t), r = !0) : (n[a] = n[n.length - 1], n.pop()); r && (s.draw(), this._notify(s, i, t, "progress")), n.length || (i.running = !1, this._notify(s, i, t, "complete"), i.initial = !1), e += n.length })), this._lastDate = t, 0 === e && (this._running = !1) } _getAnims(t) { const e = this._charts; let i = e.get(t); return i || (i = { running: !1, initial: !0, items: [], listeners: { complete: [], progress: [] } }, e.set(t, i)), i } listen(t, e, i) { this._getAnims(t).listeners[e].push(i) } add(t, e) { e && e.length && this._getAnims(t).items.push(...e) } has(t) { return this._getAnims(t).items.length > 0 } start(t) { const e = this._charts.get(t); e && (e.running = !0, e.start = Date.now(), e.duration = e.items.reduce(((t, e) => Math.max(t, e._duration)), 0), this._refresh()) } running(t) { if (!this._running) return !1; const e = this._charts.get(t); return !!(e && e.running && e.items.length) } stop(t) { const e = this._charts.get(t); if (!e || !e.items.length) return; const i = e.items; let s = i.length - 1; for (; s >= 0; --s)i[s].cancel(); e.items = [], this._notify(t, e, Date.now(), "complete") } remove(t) { return this._charts.delete(t) } }; function bt(t) { return t + .5 | 0 } const xt = (t, e, i) => Math.max(Math.min(t, i), e); function _t(t) { return xt(bt(2.55 * t), 0, 255) } function yt(t) { return xt(bt(255 * t), 0, 255) } function vt(t) { return xt(bt(t / 2.55) / 100, 0, 1) } function wt(t) { return xt(bt(100 * t), 0, 100) } const Mt = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 }, kt = [..."0123456789ABCDEF"], St = t => kt[15 & t], Pt = t => kt[(240 & t) >> 4] + kt[15 & t], Dt = t => (240 & t) >> 4 == (15 & t); function Ot(t) { var e = (t => Dt(t.r) && Dt(t.g) && Dt(t.b) && Dt(t.a))(t) ? St : Pt; return t ? "#" + e(t.r) + e(t.g) + e(t.b) + ((t, e) => t < 255 ? e(t) : "")(t.a, e) : void 0 } const Ct = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/; function At(t, e, i) { const s = e * Math.min(i, 1 - i), n = (e, n = (e + t / 30) % 12) => i - s * Math.max(Math.min(n - 3, 9 - n, 1), -1); return [n(0), n(8), n(4)] } function Tt(t, e, i) { const s = (s, n = (s + t / 60) % 6) => i - i * e * Math.max(Math.min(n, 4 - n, 1), 0); return [s(5), s(3), s(1)] } function Lt(t, e, i) { const s = At(t, 1, .5); let n; for (e + i > 1 && (n = 1 / (e + i), e *= n, i *= n), n = 0; n < 3; n++)s[n] *= 1 - e - i, s[n] += e; return s } function Et(t) { const e = t.r / 255, i = t.g / 255, s = t.b / 255, n = Math.max(e, i, s), o = Math.min(e, i, s), a = (n + o) / 2; let r, l, h; return n !== o && (h = n - o, l = a > .5 ? h / (2 - n - o) : h / (n + o), r = function (t, e, i, s, n) { return t === n ? (e - i) / s + (e < i ? 6 : 0) : e === n ? (i - t) / s + 2 : (t - e) / s + 4 }(e, i, s, h, n), r = 60 * r + .5), [0 | r, l || 0, a] } function Rt(t, e, i, s) { return (Array.isArray(e) ? t(e[0], e[1], e[2]) : t(e, i, s)).map(yt) } function It(t, e, i) { return Rt(At, t, e, i) } function zt(t) { return (t % 360 + 360) % 360 } function Ft(t) { const e = Ct.exec(t); let i, s = 255; if (!e) return; e[5] !== i && (s = e[6] ? _t(+e[5]) : yt(+e[5])); const n = zt(+e[2]), o = +e[3] / 100, a = +e[4] / 100; return i = "hwb" === e[1] ? function (t, e, i) { return Rt(Lt, t, e, i) }(n, o, a) : "hsv" === e[1] ? function (t, e, i) { return Rt(Tt, t, e, i) }(n, o, a) : It(n, o, a), { r: i[0], g: i[1], b: i[2], a: s } } const Vt = { x: "dark", Z: "light", Y: "re", X: "blu", W: "gr", V: "medium", U: "slate", A: "ee", T: "ol", S: "or", B: "ra", C: "lateg", D: "ights", R: "in", Q: "turquois", E: "hi", P: "ro", O: "al", N: "le", M: "de", L: "yello", F: "en", K: "ch", G: "arks", H: "ea", I: "ightg", J: "wh" }, Bt = { OiceXe: "f0f8ff", antiquewEte: "faebd7", aqua: "ffff", aquamarRe: "7fffd4", azuY: "f0ffff", beige: "f5f5dc", bisque: "ffe4c4", black: "0", blanKedOmond: "ffebcd", Xe: "ff", XeviTet: "8a2be2", bPwn: "a52a2a", burlywood: "deb887", caMtXe: "5f9ea0", KartYuse: "7fff00", KocTate: "d2691e", cSO: "ff7f50", cSnflowerXe: "6495ed", cSnsilk: "fff8dc", crimson: "dc143c", cyan: "ffff", xXe: "8b", xcyan: "8b8b", xgTMnPd: "b8860b", xWay: "a9a9a9", xgYF: "6400", xgYy: "a9a9a9", xkhaki: "bdb76b", xmagFta: "8b008b", xTivegYF: "556b2f", xSange: "ff8c00", xScEd: "9932cc", xYd: "8b0000", xsOmon: "e9967a", xsHgYF: "8fbc8f", xUXe: "483d8b", xUWay: "2f4f4f", xUgYy: "2f4f4f", xQe: "ced1", xviTet: "9400d3", dAppRk: "ff1493", dApskyXe: "bfff", dimWay: "696969", dimgYy: "696969", dodgerXe: "1e90ff", fiYbrick: "b22222", flSOwEte: "fffaf0", foYstWAn: "228b22", fuKsia: "ff00ff", gaRsbSo: "dcdcdc", ghostwEte: "f8f8ff", gTd: "ffd700", gTMnPd: "daa520", Way: "808080", gYF: "8000", gYFLw: "adff2f", gYy: "808080", honeyMw: "f0fff0", hotpRk: "ff69b4", RdianYd: "cd5c5c", Rdigo: "4b0082", ivSy: "fffff0", khaki: "f0e68c", lavFMr: "e6e6fa", lavFMrXsh: "fff0f5", lawngYF: "7cfc00", NmoncEffon: "fffacd", ZXe: "add8e6", ZcSO: "f08080", Zcyan: "e0ffff", ZgTMnPdLw: "fafad2", ZWay: "d3d3d3", ZgYF: "90ee90", ZgYy: "d3d3d3", ZpRk: "ffb6c1", ZsOmon: "ffa07a", ZsHgYF: "20b2aa", ZskyXe: "87cefa", ZUWay: "778899", ZUgYy: "778899", ZstAlXe: "b0c4de", ZLw: "ffffe0", lime: "ff00", limegYF: "32cd32", lRF: "faf0e6", magFta: "ff00ff", maPon: "800000", VaquamarRe: "66cdaa", VXe: "cd", VScEd: "ba55d3", VpurpN: "9370db", VsHgYF: "3cb371", VUXe: "7b68ee", VsprRggYF: "fa9a", VQe: "48d1cc", VviTetYd: "c71585", midnightXe: "191970", mRtcYam: "f5fffa", mistyPse: "ffe4e1", moccasR: "ffe4b5", navajowEte: "ffdead", navy: "80", Tdlace: "fdf5e6", Tive: "808000", TivedBb: "6b8e23", Sange: "ffa500", SangeYd: "ff4500", ScEd: "da70d6", pOegTMnPd: "eee8aa", pOegYF: "98fb98", pOeQe: "afeeee", pOeviTetYd: "db7093", papayawEp: "ffefd5", pHKpuff: "ffdab9", peru: "cd853f", pRk: "ffc0cb", plum: "dda0dd", powMrXe: "b0e0e6", purpN: "800080", YbeccapurpN: "663399", Yd: "ff0000", Psybrown: "bc8f8f", PyOXe: "4169e1", saddNbPwn: "8b4513", sOmon: "fa8072", sandybPwn: "f4a460", sHgYF: "2e8b57", sHshell: "fff5ee", siFna: "a0522d", silver: "c0c0c0", skyXe: "87ceeb", UXe: "6a5acd", UWay: "708090", UgYy: "708090", snow: "fffafa", sprRggYF: "ff7f", stAlXe: "4682b4", tan: "d2b48c", teO: "8080", tEstN: "d8bfd8", tomato: "ff6347", Qe: "40e0d0", viTet: "ee82ee", JHt: "f5deb3", wEte: "ffffff", wEtesmoke: "f5f5f5", Lw: "ffff00", LwgYF: "9acd32" }; let Nt; function Wt(t) { Nt || (Nt = function () { const t = {}, e = Object.keys(Bt), i = Object.keys(Vt); let s, n, o, a, r; for (s = 0; s < e.length; s++) { for (a = r = e[s], n = 0; n < i.length; n++)o = i[n], r = r.replace(o, Vt[o]); o = parseInt(Bt[a], 16), t[r] = [o >> 16 & 255, o >> 8 & 255, 255 & o] } return t }(), Nt.transparent = [0, 0, 0, 0]); const e = Nt[t.toLowerCase()]; return e && { r: e[0], g: e[1], b: e[2], a: 4 === e.length ? e[3] : 255 } } const jt = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/; const Ht = t => t <= .0031308 ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - .055, $t = t => t <= .04045 ? t / 12.92 : Math.pow((t + .055) / 1.055, 2.4); function Yt(t, e, i) { if (t) { let s = Et(t); s[e] = Math.max(0, Math.min(s[e] + s[e] * i, 0 === e ? 360 : 1)), s = It(s), t.r = s[0], t.g = s[1], t.b = s[2] } } function Ut(t, e) { return t ? Object.assign(e || {}, t) : t } function Xt(t) { var e = { r: 0, g: 0, b: 0, a: 255 }; return Array.isArray(t) ? t.length >= 3 && (e = { r: t[0], g: t[1], b: t[2], a: 255 }, t.length > 3 && (e.a = yt(t[3]))) : (e = Ut(t, { r: 0, g: 0, b: 0, a: 1 })).a = yt(e.a), e } function qt(t) { return "r" === t.charAt(0) ? function (t) { const e = jt.exec(t); let i, s, n, o = 255; if (e) { if (e[7] !== i) { const t = +e[7]; o = e[8] ? _t(t) : xt(255 * t, 0, 255) } return i = +e[1], s = +e[3], n = +e[5], i = 255 & (e[2] ? _t(i) : xt(i, 0, 255)), s = 255 & (e[4] ? _t(s) : xt(s, 0, 255)), n = 255 & (e[6] ? _t(n) : xt(n, 0, 255)), { r: i, g: s, b: n, a: o } } }(t) : Ft(t) } class Kt { constructor(t) { if (t instanceof Kt) return t; const e = typeof t; let i; var s, n, o; "object" === e ? i = Xt(t) : "string" === e && (o = (s = t).length, "#" === s[0] && (4 === o || 5 === o ? n = { r: 255 & 17 * Mt[s[1]], g: 255 & 17 * Mt[s[2]], b: 255 & 17 * Mt[s[3]], a: 5 === o ? 17 * Mt[s[4]] : 255 } : 7 !== o && 9 !== o || (n = { r: Mt[s[1]] << 4 | Mt[s[2]], g: Mt[s[3]] << 4 | Mt[s[4]], b: Mt[s[5]] << 4 | Mt[s[6]], a: 9 === o ? Mt[s[7]] << 4 | Mt[s[8]] : 255 })), i = n || Wt(t) || qt(t)), this._rgb = i, this._valid = !!i } get valid() { return this._valid } get rgb() { var t = Ut(this._rgb); return t && (t.a = vt(t.a)), t } set rgb(t) { this._rgb = Xt(t) } rgbString() { return this._valid ? (t = this._rgb) && (t.a < 255 ? `rgba(${t.r}, ${t.g}, ${t.b}, ${vt(t.a)})` : `rgb(${t.r}, ${t.g}, ${t.b})`) : void 0; var t } hexString() { return this._valid ? Ot(this._rgb) : void 0 } hslString() { return this._valid ? function (t) { if (!t) return; const e = Et(t), i = e[0], s = wt(e[1]), n = wt(e[2]); return t.a < 255 ? `hsla(${i}, ${s}%, ${n}%, ${vt(t.a)})` : `hsl(${i}, ${s}%, ${n}%)` }(this._rgb) : void 0 } mix(t, e) { if (t) { const i = this.rgb, s = t.rgb; let n; const o = e === n ? .5 : e, a = 2 * o - 1, r = i.a - s.a, l = ((a * r == -1 ? a : (a + r) / (1 + a * r)) + 1) / 2; n = 1 - l, i.r = 255 & l * i.r + n * s.r + .5, i.g = 255 & l * i.g + n * s.g + .5, i.b = 255 & l * i.b + n * s.b + .5, i.a = o * i.a + (1 - o) * s.a, this.rgb = i } return this } interpolate(t, e) { return t && (this._rgb = function (t, e, i) { const s = $t(vt(t.r)), n = $t(vt(t.g)), o = $t(vt(t.b)); return { r: yt(Ht(s + i * ($t(vt(e.r)) - s))), g: yt(Ht(n + i * ($t(vt(e.g)) - n))), b: yt(Ht(o + i * ($t(vt(e.b)) - o))), a: t.a + i * (e.a - t.a) } }(this._rgb, t._rgb, e)), this } clone() { return new Kt(this.rgb) } alpha(t) { return this._rgb.a = yt(t), this } clearer(t) { return this._rgb.a *= 1 - t, this } greyscale() { const t = this._rgb, e = bt(.3 * t.r + .59 * t.g + .11 * t.b); return t.r = t.g = t.b = e, this } opaquer(t) { return this._rgb.a *= 1 + t, this } negate() { const t = this._rgb; return t.r = 255 - t.r, t.g = 255 - t.g, t.b = 255 - t.b, this } lighten(t) { return Yt(this._rgb, 2, t), this } darken(t) { return Yt(this._rgb, 2, -t), this } saturate(t) { return Yt(this._rgb, 1, t), this } desaturate(t) { return Yt(this._rgb, 1, -t), this } rotate(t) { return function (t, e) { var i = Et(t); i[0] = zt(i[0] + e), i = It(i), t.r = i[0], t.g = i[1], t.b = i[2] }(this._rgb, t), this } } function Gt(t) { return new Kt(t) } function Zt(t) { if (t && "object" == typeof t) { const e = t.toString(); return "[object CanvasPattern]" === e || "[object CanvasGradient]" === e } return !1 } function Jt(t) { return Zt(t) ? t : Gt(t) } function Qt(t) { return Zt(t) ? t : Gt(t).saturate(.5).darken(.1).hexString() } const te = Object.create(null), ee = Object.create(null); function ie(t, e) { if (!e) return t; const i = e.split("."); for (let e = 0, s = i.length; e < s; ++e) { const s = i[e]; t = t[s] || (t[s] = Object.create(null)) } return t } function se(t, e, i) { return "string" == typeof e ? m(ie(t, e), i) : m(ie(t, ""), e) } var ne = new class { constructor(t) { this.animation = void 0, this.backgroundColor = "rgba(0,0,0,0.1)", this.borderColor = "rgba(0,0,0,0.1)", this.color = "#666", this.datasets = {}, this.devicePixelRatio = t => t.chart.platform.getDevicePixelRatio(), this.elements = {}, this.events = ["mousemove", "mouseout", "click", "touchstart", "touchmove"], this.font = { family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif", size: 12, style: "normal", lineHeight: 1.2, weight: null }, this.hover = {}, this.hoverBackgroundColor = (t, e) => Qt(e.backgroundColor), this.hoverBorderColor = (t, e) => Qt(e.borderColor), this.hoverColor = (t, e) => Qt(e.color), this.indexAxis = "x", this.interaction = { mode: "nearest", intersect: !0, includeInvisible: !1 }, this.maintainAspectRatio = !0, this.onHover = null, this.onClick = null, this.parsing = !0, this.plugins = {}, this.responsive = !0, this.scale = void 0, this.scales = {}, this.showLine = !0, this.drawActiveElementsOnTop = !0, this.describe(t) } set(t, e) { return se(this, t, e) } get(t) { return ie(this, t) } describe(t, e) { return se(ee, t, e) } override(t, e) { return se(te, t, e) } route(t, e, i, s) { const o = ie(this, t), a = ie(this, i), l = "_" + e; Object.defineProperties(o, { [l]: { value: o[e], writable: !0 }, [e]: { enumerable: !0, get() { const t = this[l], e = a[s]; return n(t) ? Object.assign({}, e, t) : r(t, e) }, set(t) { this[l] = t } } }) } }({ _scriptable: t => !t.startsWith("on"), _indexable: t => "events" !== t, hover: { _fallback: "interaction" }, interaction: { _scriptable: !1, _indexable: !1 } }); function oe() { return "undefined" != typeof window && "undefined" != typeof document } function ae(t) { let e = t.parentNode; return e && "[object ShadowRoot]" === e.toString() && (e = e.host), e } function re(t, e, i) { let s; return "string" == typeof t ? (s = parseInt(t, 10), -1 !== t.indexOf("%") && (s = s / 100 * e.parentNode[i])) : s = t, s } const le = t => window.getComputedStyle(t, null); function he(t, e) { return le(t).getPropertyValue(e) } const ce = ["top", "right", "bottom", "left"]; function de(t, e, i) { const s = {}; i = i ? "-" + i : ""; for (let n = 0; n < 4; n++) { const o = ce[n]; s[o] = parseFloat(t[e + "-" + o + i]) || 0 } return s.width = s.left + s.right, s.height = s.top + s.bottom, s } function ue(t, e) { if ("native" in t) return t; const { canvas: i, currentDevicePixelRatio: s } = e, n = le(i), o = "border-box" === n.boxSizing, a = de(n, "padding"), r = de(n, "border", "width"), { x: l, y: h, box: c } = function (t, e) { const i = t.touches, s = i && i.length ? i[0] : t, { offsetX: n, offsetY: o } = s; let a, r, l = !1; if (((t, e, i) => (t > 0 || e > 0) && (!i || !i.shadowRoot))(n, o, t.target)) a = n, r = o; else { const t = e.getBoundingClientRect(); a = s.clientX - t.left, r = s.clientY - t.top, l = !0 } return { x: a, y: r, box: l } }(t, i), d = a.left + (c && r.left), u = a.top + (c && r.top); let { width: f, height: g } = e; return o && (f -= a.width + r.width, g -= a.height + r.height), { x: Math.round((l - d) / f * i.width / s), y: Math.round((h - u) / g * i.height / s) } } const fe = t => Math.round(10 * t) / 10; function ge(t, e, i, s) { const n = le(t), o = de(n, "margin"), a = re(n.maxWidth, t, "clientWidth") || A, r = re(n.maxHeight, t, "clientHeight") || A, l = function (t, e, i) { let s, n; if (void 0 === e || void 0 === i) { const o = ae(t); if (o) { const t = o.getBoundingClientRect(), a = le(o), r = de(a, "border", "width"), l = de(a, "padding"); e = t.width - l.width - r.width, i = t.height - l.height - r.height, s = re(a.maxWidth, o, "clientWidth"), n = re(a.maxHeight, o, "clientHeight") } else e = t.clientWidth, i = t.clientHeight } return { width: e, height: i, maxWidth: s || A, maxHeight: n || A } }(t, e, i); let { width: h, height: c } = l; if ("content-box" === n.boxSizing) { const t = de(n, "border", "width"), e = de(n, "padding"); h -= e.width + t.width, c -= e.height + t.height } return h = Math.max(0, h - o.width), c = Math.max(0, s ? Math.floor(h / s) : c - o.height), h = fe(Math.min(h, a, l.maxWidth)), c = fe(Math.min(c, r, l.maxHeight)), h && !c && (c = fe(h / 2)), { width: h, height: c } } function pe(t, e, i) { const s = e || 1, n = Math.floor(t.height * s), o = Math.floor(t.width * s); t.height = n / s, t.width = o / s; const a = t.canvas; return a.style && (i || !a.style.height && !a.style.width) && (a.style.height = `${t.height}px`, a.style.width = `${t.width}px`), (t.currentDevicePixelRatio !== s || a.height !== n || a.width !== o) && (t.currentDevicePixelRatio = s, a.height = n, a.width = o, t.ctx.setTransform(s, 0, 0, s, 0, 0), !0) } const me = function () { let t = !1; try { const e = { get passive() { return t = !0, !1 } }; window.addEventListener("test", null, e), window.removeEventListener("test", null, e) } catch (t) { } return t }(); function be(t, e) { const i = he(t, e), s = i && i.match(/^(\d+)(\.\d+)?px$/); return s ? +s[1] : void 0 } function xe(t) { return !t || i(t.size) || i(t.family) ? null : (t.style ? t.style + " " : "") + (t.weight ? t.weight + " " : "") + t.size + "px " + t.family } function _e(t, e, i, s, n) { let o = e[n]; return o || (o = e[n] = t.measureText(n).width, i.push(n)), o > s && (s = o), s } function ye(t, e, i, n) { let o = (n = n || {}).data = n.data || {}, a = n.garbageCollect = n.garbageCollect || []; n.font !== e && (o = n.data = {}, a = n.garbageCollect = [], n.font = e), t.save(), t.font = e; let r = 0; const l = i.length; let h, c, d, u, f; for (h = 0; h < l; h++)if (u = i[h], null != u && !0 !== s(u)) r = _e(t, o, a, r, u); else if (s(u)) for (c = 0, d = u.length; c < d; c++)f = u[c], null == f || s(f) || (r = _e(t, o, a, r, f)); t.restore(); const g = a.length / 2; if (g > i.length) { for (h = 0; h < g; h++)delete o[a[h]]; a.splice(0, g) } return r } function ve(t, e, i) { const s = t.currentDevicePixelRatio, n = 0 !== i ? Math.max(i / 2, .5) : 0; return Math.round((e - n) * s) / s + n } function we(t, e) { (e = e || t.getContext("2d")).save(), e.resetTransform(), e.clearRect(0, 0, t.width, t.height), e.restore() } function Me(t, e, i, s) { ke(t, e, i, s, null) } function ke(t, e, i, s, n) { let o, a, r, l, h, c; const d = e.pointStyle, u = e.rotation, f = e.radius; let g = (u || 0) * T; if (d && "object" == typeof d && (o = d.toString(), "[object HTMLImageElement]" === o || "[object HTMLCanvasElement]" === o)) return t.save(), t.translate(i, s), t.rotate(g), t.drawImage(d, -d.width / 2, -d.height / 2, d.width, d.height), void t.restore(); if (!(isNaN(f) || f <= 0)) { switch (t.beginPath(), d) { default: n ? t.ellipse(i, s, n / 2, f, 0, 0, O) : t.arc(i, s, f, 0, O), t.closePath(); break; case "triangle": t.moveTo(i + Math.sin(g) * f, s - Math.cos(g) * f), g += R, t.lineTo(i + Math.sin(g) * f, s - Math.cos(g) * f), g += R, t.lineTo(i + Math.sin(g) * f, s - Math.cos(g) * f), t.closePath(); break; case "rectRounded": h = .516 * f, l = f - h, a = Math.cos(g + E) * l, r = Math.sin(g + E) * l, t.arc(i - a, s - r, h, g - D, g - L), t.arc(i + r, s - a, h, g - L, g), t.arc(i + a, s + r, h, g, g + L), t.arc(i - r, s + a, h, g + L, g + D), t.closePath(); break; case "rect": if (!u) { l = Math.SQRT1_2 * f, c = n ? n / 2 : l, t.rect(i - c, s - l, 2 * c, 2 * l); break } g += E; case "rectRot": a = Math.cos(g) * f, r = Math.sin(g) * f, t.moveTo(i - a, s - r), t.lineTo(i + r, s - a), t.lineTo(i + a, s + r), t.lineTo(i - r, s + a), t.closePath(); break; case "crossRot": g += E; case "cross": a = Math.cos(g) * f, r = Math.sin(g) * f, t.moveTo(i - a, s - r), t.lineTo(i + a, s + r), t.moveTo(i + r, s - a), t.lineTo(i - r, s + a); break; case "star": a = Math.cos(g) * f, r = Math.sin(g) * f, t.moveTo(i - a, s - r), t.lineTo(i + a, s + r), t.moveTo(i + r, s - a), t.lineTo(i - r, s + a), g += E, a = Math.cos(g) * f, r = Math.sin(g) * f, t.moveTo(i - a, s - r), t.lineTo(i + a, s + r), t.moveTo(i + r, s - a), t.lineTo(i - r, s + a); break; case "line": a = n ? n / 2 : Math.cos(g) * f, r = Math.sin(g) * f, t.moveTo(i - a, s - r), t.lineTo(i + a, s + r); break; case "dash": t.moveTo(i, s), t.lineTo(i + Math.cos(g) * f, s + Math.sin(g) * f) }t.fill(), e.borderWidth > 0 && t.stroke() } } function Se(t, e, i) { return i = i || .5, !e || t && t.x > e.left - i && t.x < e.right + i && t.y > e.top - i && t.y < e.bottom + i } function Pe(t, e) { t.save(), t.beginPath(), t.rect(e.left, e.top, e.right - e.left, e.bottom - e.top), t.clip() } function De(t) { t.restore() } function Oe(t, e, i, s, n) { if (!e) return t.lineTo(i.x, i.y); if ("middle" === n) { const s = (e.x + i.x) / 2; t.lineTo(s, e.y), t.lineTo(s, i.y) } else "after" === n != !!s ? t.lineTo(e.x, i.y) : t.lineTo(i.x, e.y); t.lineTo(i.x, i.y) } function Ce(t, e, i, s) { if (!e) return t.lineTo(i.x, i.y); t.bezierCurveTo(s ? e.cp1x : e.cp2x, s ? e.cp1y : e.cp2y, s ? i.cp2x : i.cp1x, s ? i.cp2y : i.cp1y, i.x, i.y) } function Ae(t, e, n, o, a, r = {}) { const l = s(e) ? e : [e], h = r.strokeWidth > 0 && "" !== r.strokeColor; let c, d; for (t.save(), t.font = a.string, function (t, e) { e.translation && t.translate(e.translation[0], e.translation[1]); i(e.rotation) || t.rotate(e.rotation); e.color && (t.fillStyle = e.color); e.textAlign && (t.textAlign = e.textAlign); e.textBaseline && (t.textBaseline = e.textBaseline) }(t, r), c = 0; c < l.length; ++c)d = l[c], h && (r.strokeColor && (t.strokeStyle = r.strokeColor), i(r.strokeWidth) || (t.lineWidth = r.strokeWidth), t.strokeText(d, n, o, r.maxWidth)), t.fillText(d, n, o, r.maxWidth), Te(t, n, o, d, r), o += a.lineHeight; t.restore() } function Te(t, e, i, s, n) { if (n.strikethrough || n.underline) { const o = t.measureText(s), a = e - o.actualBoundingBoxLeft, r = e + o.actualBoundingBoxRight, l = i - o.actualBoundingBoxAscent, h = i + o.actualBoundingBoxDescent, c = n.strikethrough ? (l + h) / 2 : h; t.strokeStyle = t.fillStyle, t.beginPath(), t.lineWidth = n.decorationWidth || 2, t.moveTo(a, c), t.lineTo(r, c), t.stroke() } } function Le(t, e) { const { x: i, y: s, w: n, h: o, radius: a } = e; t.arc(i + a.topLeft, s + a.topLeft, a.topLeft, -L, D, !0), t.lineTo(i, s + o - a.bottomLeft), t.arc(i + a.bottomLeft, s + o - a.bottomLeft, a.bottomLeft, D, L, !0), t.lineTo(i + n - a.bottomRight, s + o), t.arc(i + n - a.bottomRight, s + o - a.bottomRight, a.bottomRight, L, 0, !0), t.lineTo(i + n, s + a.topRight), t.arc(i + n - a.topRight, s + a.topRight, a.topRight, 0, -L, !0), t.lineTo(i + a.topLeft, s) } function Ee(t, e = [""], i = t, s, n = (() => t[0])) { M(s) || (s = $e("_fallback", t)); const o = { [Symbol.toStringTag]: "Object", _cacheable: !0, _scopes: t, _rootScopes: i, _fallback: s, _getTarget: n, override: n => Ee([n, ...t], e, i, s) }; return new Proxy(o, { deleteProperty: (e, i) => (delete e[i], delete e._keys, delete t[0][i], !0), get: (i, s) => Ve(i, s, (() => function (t, e, i, s) { let n; for (const o of e) if (n = $e(ze(o, t), i), M(n)) return Fe(t, n) ? je(i, s, t, n) : n }(s, e, t, i))), getOwnPropertyDescriptor: (t, e) => Reflect.getOwnPropertyDescriptor(t._scopes[0], e), getPrototypeOf: () => Reflect.getPrototypeOf(t[0]), has: (t, e) => Ye(t).includes(e), ownKeys: t => Ye(t), set(t, e, i) { const s = t._storage || (t._storage = n()); return t[e] = s[e] = i, delete t._keys, !0 } }) } function Re(t, e, i, o) { const a = { _cacheable: !1, _proxy: t, _context: e, _subProxy: i, _stack: new Set, _descriptors: Ie(t, o), setContext: e => Re(t, e, i, o), override: s => Re(t.override(s), e, i, o) }; return new Proxy(a, { deleteProperty: (e, i) => (delete e[i], delete t[i], !0), get: (t, e, i) => Ve(t, e, (() => function (t, e, i) { const { _proxy: o, _context: a, _subProxy: r, _descriptors: l } = t; let h = o[e]; k(h) && l.isScriptable(e) && (h = function (t, e, i, s) { const { _proxy: n, _context: o, _subProxy: a, _stack: r } = i; if (r.has(t)) throw new Error("Recursion detected: " + Array.from(r).join("->") + "->" + t); r.add(t), e = e(o, a || s), r.delete(t), Fe(t, e) && (e = je(n._scopes, n, t, e)); return e }(e, h, t, i)); s(h) && h.length && (h = function (t, e, i, s) { const { _proxy: o, _context: a, _subProxy: r, _descriptors: l } = i; if (M(a.index) && s(t)) e = e[a.index % e.length]; else if (n(e[0])) { const i = e, s = o._scopes.filter((t => t !== i)); e = []; for (const n of i) { const i = je(s, o, t, n); e.push(Re(i, a, r && r[t], l)) } } return e }(e, h, t, l.isIndexable)); Fe(e, h) && (h = Re(h, a, r && r[e], l)); return h }(t, e, i))), getOwnPropertyDescriptor: (e, i) => e._descriptors.allKeys ? Reflect.has(t, i) ? { enumerable: !0, configurable: !0 } : void 0 : Reflect.getOwnPropertyDescriptor(t, i), getPrototypeOf: () => Reflect.getPrototypeOf(t), has: (e, i) => Reflect.has(t, i), ownKeys: () => Reflect.ownKeys(t), set: (e, i, s) => (t[i] = s, delete e[i], !0) }) } function Ie(t, e = { scriptable: !0, indexable: !0 }) { const { _scriptable: i = e.scriptable, _indexable: s = e.indexable, _allKeys: n = e.allKeys } = t; return { allKeys: n, scriptable: i, indexable: s, isScriptable: k(i) ? i : () => i, isIndexable: k(s) ? s : () => s } } const ze = (t, e) => t ? t + w(e) : e, Fe = (t, e) => n(e) && "adapters" !== t && (null === Object.getPrototypeOf(e) || e.constructor === Object); function Ve(t, e, i) { if (Object.prototype.hasOwnProperty.call(t, e)) return t[e]; const s = i(); return t[e] = s, s } function Be(t, e, i) { return k(t) ? t(e, i) : t } const Ne = (t, e) => !0 === t ? e : "string" == typeof t ? y(e, t) : void 0; function We(t, e, i, s, n) { for (const o of e) { const e = Ne(i, o); if (e) { t.add(e); const o = Be(e._fallback, i, n); if (M(o) && o !== i && o !== s) return o } else if (!1 === e && M(s) && i !== s) return null } return !1 } function je(t, e, i, o) { const a = e._rootScopes, r = Be(e._fallback, i, o), l = [...t, ...a], h = new Set; h.add(o); let c = He(h, l, i, r || i, o); return null !== c && ((!M(r) || r === i || (c = He(h, l, r, c, o), null !== c)) && Ee(Array.from(h), [""], a, r, (() => function (t, e, i) { const o = t._getTarget(); e in o || (o[e] = {}); const a = o[e]; if (s(a) && n(i)) return i; return a }(e, i, o)))) } function He(t, e, i, s, n) { for (; i;)i = We(t, e, i, s, n); return i } function $e(t, e) { for (const i of e) { if (!i) continue; const e = i[t]; if (M(e)) return e } } function Ye(t) { let e = t._keys; return e || (e = t._keys = function (t) { const e = new Set; for (const i of t) for (const t of Object.keys(i).filter((t => !t.startsWith("_")))) e.add(t); return Array.from(e) }(t._scopes)), e } function Ue(t, e, i, s) { const { iScale: n } = t, { key: o = "r" } = this._parsing, a = new Array(s); let r, l, h, c; for (r = 0, l = s; r < l; ++r)h = r + i, c = e[h], a[r] = { r: n.parse(y(c, o), h) }; return a } const Xe = Number.EPSILON || 1e-14, qe = (t, e) => e < t.length && !t[e].skip && t[e], Ke = t => "x" === t ? "y" : "x"; function Ge(t, e, i, s) { const n = t.skip ? e : t, o = e, a = i.skip ? e : i, r = X(o, n), l = X(a, o); let h = r / (r + l), c = l / (r + l); h = isNaN(h) ? 0 : h, c = isNaN(c) ? 0 : c; const d = s * h, u = s * c; return { previous: { x: o.x - d * (a.x - n.x), y: o.y - d * (a.y - n.y) }, next: { x: o.x + u * (a.x - n.x), y: o.y + u * (a.y - n.y) } } } function Ze(t, e = "x") { const i = Ke(e), s = t.length, n = Array(s).fill(0), o = Array(s); let a, r, l, h = qe(t, 0); for (a = 0; a < s; ++a)if (r = l, l = h, h = qe(t, a + 1), l) { if (h) { const t = h[e] - l[e]; n[a] = 0 !== t ? (h[i] - l[i]) / t : 0 } o[a] = r ? h ? z(n[a - 1]) !== z(n[a]) ? 0 : (n[a - 1] + n[a]) / 2 : n[a - 1] : n[a] } !function (t, e, i) { const s = t.length; let n, o, a, r, l, h = qe(t, 0); for (let c = 0; c < s - 1; ++c)l = h, h = qe(t, c + 1), l && h && (N(e[c], 0, Xe) ? i[c] = i[c + 1] = 0 : (n = i[c] / e[c], o = i[c + 1] / e[c], r = Math.pow(n, 2) + Math.pow(o, 2), r <= 9 || (a = 3 / Math.sqrt(r), i[c] = n * a * e[c], i[c + 1] = o * a * e[c]))) }(t, n, o), function (t, e, i = "x") { const s = Ke(i), n = t.length; let o, a, r, l = qe(t, 0); for (let h = 0; h < n; ++h) { if (a = r, r = l, l = qe(t, h + 1), !r) continue; const n = r[i], c = r[s]; a && (o = (n - a[i]) / 3, r[`cp1${i}`] = n - o, r[`cp1${s}`] = c - o * e[h]), l && (o = (l[i] - n) / 3, r[`cp2${i}`] = n + o, r[`cp2${s}`] = c + o * e[h]) } }(t, o, e) } function Je(t, e, i) { return Math.max(Math.min(t, i), e) } function Qe(t, e, i, s, n) { let o, a, r, l; if (e.spanGaps && (t = t.filter((t => !t.skip))), "monotone" === e.cubicInterpolationMode) Ze(t, n); else { let i = s ? t[t.length - 1] : t[0]; for (o = 0, a = t.length; o < a; ++o)r = t[o], l = Ge(i, r, t[Math.min(o + 1, a - (s ? 0 : 1)) % a], e.tension), r.cp1x = l.previous.x, r.cp1y = l.previous.y, r.cp2x = l.next.x, r.cp2y = l.next.y, i = r } e.capBezierPoints && function (t, e) { let i, s, n, o, a, r = Se(t[0], e); for (i = 0, s = t.length; i < s; ++i)a = o, o = r, r = i < s - 1 && Se(t[i + 1], e), o && (n = t[i], a && (n.cp1x = Je(n.cp1x, e.left, e.right), n.cp1y = Je(n.cp1y, e.top, e.bottom)), r && (n.cp2x = Je(n.cp2x, e.left, e.right), n.cp2y = Je(n.cp2y, e.top, e.bottom))) }(t, i) } const ti = t => 0 === t || 1 === t, ei = (t, e, i) => -Math.pow(2, 10 * (t -= 1)) * Math.sin((t - e) * O / i), ii = (t, e, i) => Math.pow(2, -10 * t) * Math.sin((t - e) * O / i) + 1, si = { linear: t => t, easeInQuad: t => t * t, easeOutQuad: t => -t * (t - 2), easeInOutQuad: t => (t /= .5) < 1 ? .5 * t * t : -.5 * (--t * (t - 2) - 1), easeInCubic: t => t * t * t, easeOutCubic: t => (t -= 1) * t * t + 1, easeInOutCubic: t => (t /= .5) < 1 ? .5 * t * t * t : .5 * ((t -= 2) * t * t + 2), easeInQuart: t => t * t * t * t, easeOutQuart: t => -((t -= 1) * t * t * t - 1), easeInOutQuart: t => (t /= .5) < 1 ? .5 * t * t * t * t : -.5 * ((t -= 2) * t * t * t - 2), easeInQuint: t => t * t * t * t * t, easeOutQuint: t => (t -= 1) * t * t * t * t + 1, easeInOutQuint: t => (t /= .5) < 1 ? .5 * t * t * t * t * t : .5 * ((t -= 2) * t * t * t * t + 2), easeInSine: t => 1 - Math.cos(t * L), easeOutSine: t => Math.sin(t * L), easeInOutSine: t => -.5 * (Math.cos(D * t) - 1), easeInExpo: t => 0 === t ? 0 : Math.pow(2, 10 * (t - 1)), easeOutExpo: t => 1 === t ? 1 : 1 - Math.pow(2, -10 * t), easeInOutExpo: t => ti(t) ? t : t < .5 ? .5 * Math.pow(2, 10 * (2 * t - 1)) : .5 * (2 - Math.pow(2, -10 * (2 * t - 1))), easeInCirc: t => t >= 1 ? t : -(Math.sqrt(1 - t * t) - 1), easeOutCirc: t => Math.sqrt(1 - (t -= 1) * t), easeInOutCirc: t => (t /= .5) < 1 ? -.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1), easeInElastic: t => ti(t) ? t : ei(t, .075, .3), easeOutElastic: t => ti(t) ? t : ii(t, .075, .3), easeInOutElastic(t) { const e = .1125; return ti(t) ? t : t < .5 ? .5 * ei(2 * t, e, .45) : .5 + .5 * ii(2 * t - 1, e, .45) }, easeInBack(t) { const e = 1.70158; return t * t * ((e + 1) * t - e) }, easeOutBack(t) { const e = 1.70158; return (t -= 1) * t * ((e + 1) * t + e) + 1 }, easeInOutBack(t) { let e = 1.70158; return (t /= .5) < 1 ? t * t * ((1 + (e *= 1.525)) * t - e) * .5 : .5 * ((t -= 2) * t * ((1 + (e *= 1.525)) * t + e) + 2) }, easeInBounce: t => 1 - si.easeOutBounce(1 - t), easeOutBounce(t) { const e = 7.5625, i = 2.75; return t < 1 / i ? e * t * t : t < 2 / i ? e * (t -= 1.5 / i) * t + .75 : t < 2.5 / i ? e * (t -= 2.25 / i) * t + .9375 : e * (t -= 2.625 / i) * t + .984375 }, easeInOutBounce: t => t < .5 ? .5 * si.easeInBounce(2 * t) : .5 * si.easeOutBounce(2 * t - 1) + .5 }; function ni(t, e, i, s) { return { x: t.x + i * (e.x - t.x), y: t.y + i * (e.y - t.y) } } function oi(t, e, i, s) { return { x: t.x + i * (e.x - t.x), y: "middle" === s ? i < .5 ? t.y : e.y : "after" === s ? i < 1 ? t.y : e.y : i > 0 ? e.y : t.y } } function ai(t, e, i, s) { const n = { x: t.cp2x, y: t.cp2y }, o = { x: e.cp1x, y: e.cp1y }, a = ni(t, n, i), r = ni(n, o, i), l = ni(o, e, i), h = ni(a, r, i), c = ni(r, l, i); return ni(h, c, i) } const ri = new Map; function li(t, e, i) { return function (t, e) { e = e || {}; const i = t + JSON.stringify(e); let s = ri.get(i); return s || (s = new Intl.NumberFormat(t, e), ri.set(i, s)), s }(e, i).format(t) } const hi = new RegExp(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/), ci = new RegExp(/^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/); function di(t, e) { const i = ("" + t).match(hi); if (!i || "normal" === i[1]) return 1.2 * e; switch (t = +i[2], i[3]) { case "px": return t; case "%": t /= 100 }return e * t } function ui(t, e) { const i = {}, s = n(e), o = s ? Object.keys(e) : e, a = n(t) ? s ? i => r(t[i], t[e[i]]) : e => t[e] : () => t; for (const t of o) i[t] = +a(t) || 0; return i } function fi(t) { return ui(t, { top: "y", right: "x", bottom: "y", left: "x" }) } function gi(t) { return ui(t, ["topLeft", "topRight", "bottomLeft", "bottomRight"]) } function pi(t) { const e = fi(t); return e.width = e.left + e.right, e.height = e.top + e.bottom, e } function mi(t, e) { t = t || {}, e = e || ne.font; let i = r(t.size, e.size); "string" == typeof i && (i = parseInt(i, 10)); let s = r(t.style, e.style); s && !("" + s).match(ci) && (console.warn('Invalid font style specified: "' + s + '"'), s = ""); const n = { family: r(t.family, e.family), lineHeight: di(r(t.lineHeight, e.lineHeight), i), size: i, style: s, weight: r(t.weight, e.weight), string: "" }; return n.string = xe(n), n } function bi(t, e, i, n) { let o, a, r, l = !0; for (o = 0, a = t.length; o < a; ++o)if (r = t[o], void 0 !== r && (void 0 !== e && "function" == typeof r && (r = r(e), l = !1), void 0 !== i && s(r) && (r = r[i % r.length], l = !1), void 0 !== r)) return n && !l && (n.cacheable = !1), r } function xi(t, e, i) { const { min: s, max: n } = t, o = h(e, (n - s) / 2), a = (t, e) => i && 0 === t ? 0 : t + e; return { min: a(s, -Math.abs(o)), max: a(n, o) } } function _i(t, e) { return Object.assign(Object.create(t), e) } function yi(t, e, i) { return t ? function (t, e) { return { x: i => t + t + e - i, setWidth(t) { e = t }, textAlign: t => "center" === t ? t : "right" === t ? "left" : "right", xPlus: (t, e) => t - e, leftForLtr: (t, e) => t - e } }(e, i) : { x: t => t, setWidth(t) { }, textAlign: t => t, xPlus: (t, e) => t + e, leftForLtr: (t, e) => t } } function vi(t, e) { let i, s; "ltr" !== e && "rtl" !== e || (i = t.canvas.style, s = [i.getPropertyValue("direction"), i.getPropertyPriority("direction")], i.setProperty("direction", e, "important"), t.prevTextDirection = s) } function wi(t, e) { void 0 !== e && (delete t.prevTextDirection, t.canvas.style.setProperty("direction", e[0], e[1])) } function Mi(t) { return "angle" === t ? { between: G, compare: q, normalize: K } : { between: Q, compare: (t, e) => t - e, normalize: t => t } } function ki({ start: t, end: e, count: i, loop: s, style: n }) { return { start: t % i, end: e % i, loop: s && (e - t + 1) % i == 0, style: n } } function Si(t, e, i) { if (!i) return [t]; const { property: s, start: n, end: o } = i, a = e.length, { compare: r, between: l, normalize: h } = Mi(s), { start: c, end: d, loop: u, style: f } = function (t, e, i) { const { property: s, start: n, end: o } = i, { between: a, normalize: r } = Mi(s), l = e.length; let h, c, { start: d, end: u, loop: f } = t; if (f) { for (d += l, u += l, h = 0, c = l; h < c && a(r(e[d % l][s]), n, o); ++h)d--, u--; d %= l, u %= l } return u < d && (u += l), { start: d, end: u, loop: f, style: t.style } }(t, e, i), g = []; let p, m, b, x = !1, _ = null; const y = () => x || l(n, b, p) && 0 !== r(n, b), v = () => !x || 0 === r(o, p) || l(o, b, p); for (let t = c, i = c; t <= d; ++t)m = e[t % a], m.skip || (p = h(m[s]), p !== b && (x = l(p, n, o), null === _ && y() && (_ = 0 === r(p, n) ? t : i), null !== _ && v() && (g.push(ki({ start: _, end: t, loop: u, count: a, style: f })), _ = null), i = t, b = p)); return null !== _ && g.push(ki({ start: _, end: d, loop: u, count: a, style: f })), g } function Pi(t, e) { const i = [], s = t.segments; for (let n = 0; n < s.length; n++) { const o = Si(s[n], t.points, e); o.length && i.push(...o) } return i } function Di(t, e) { const i = t.points, s = t.options.spanGaps, n = i.length; if (!n) return []; const o = !!t._loop, { start: a, end: r } = function (t, e, i, s) { let n = 0, o = e - 1; if (i && !s) for (; n < e && !t[n].skip;)n++; for (; n < e && t[n].skip;)n++; for (n %= e, i && (o += n); o > n && t[o % e].skip;)o--; return o %= e, { start: n, end: o } }(i, n, o, s); if (!0 === s) return Oi(t, [{ start: a, end: r, loop: o }], i, e); return Oi(t, function (t, e, i, s) { const n = t.length, o = []; let a, r = e, l = t[e]; for (a = e + 1; a <= i; ++a) { const i = t[a % n]; i.skip || i.stop ? l.skip || (s = !1, o.push({ start: e % n, end: (a - 1) % n, loop: s }), e = r = i.stop ? a : null) : (r = a, l.skip && (e = a)), l = i } return null !== r && o.push({ start: e % n, end: r % n, loop: s }), o }(i, a, r < a ? r + n : r, !!t._fullLoop && 0 === a && r === n - 1), i, e) } function Oi(t, e, i, s) { return s && s.setContext && i ? function (t, e, i, s) { const n = t._chart.getContext(), o = Ci(t.options), { _datasetIndex: a, options: { spanGaps: r } } = t, l = i.length, h = []; let c = o, d = e[0].start, u = d; function f(t, e, s, n) { const o = r ? -1 : 1; if (t !== e) { for (t += l; i[t % l].skip;)t -= o; for (; i[e % l].skip;)e += o; t % l != e % l && (h.push({ start: t % l, end: e % l, loop: s, style: n }), c = n, d = e % l) } } for (const t of e) { d = r ? d : t.start; let e, o = i[d % l]; for (u = d + 1; u <= t.end; u++) { const r = i[u % l]; e = Ci(s.setContext(_i(n, { type: "segment", p0: o, p1: r, p0DataIndex: (u - 1) % l, p1DataIndex: u % l, datasetIndex: a }))), Ai(e, c) && f(d, u - 1, t.loop, c), o = r, c = e } d < u - 1 && f(d, u - 1, t.loop, c) } return h }(t, e, i, s) : e } function Ci(t) { return { backgroundColor: t.backgroundColor, borderCapStyle: t.borderCapStyle, borderDash: t.borderDash, borderDashOffset: t.borderDashOffset, borderJoinStyle: t.borderJoinStyle, borderWidth: t.borderWidth, borderColor: t.borderColor } } function Ai(t, e) { return e && JSON.stringify(t) !== JSON.stringify(e) } var Ti = Object.freeze({ __proto__: null, easingEffects: si, isPatternOrGradient: Zt, color: Jt, getHoverColor: Qt, noop: t, uid: e, isNullOrUndef: i, isArray: s, isObject: n, isFinite: o, finiteOrDefault: a, valueOrDefault: r, toPercentage: l, toDimension: h, callback: c, each: d, _elementsEqual: u, clone: f, _merger: p, merge: m, mergeIf: b, _mergerIf: x, _deprecated: function (t, e, i, s) { void 0 !== e && console.warn(t + ': "' + i + '" is deprecated. Please use "' + s + '" instead') }, resolveObjectKey: y, _splitKey: v, _capitalize: w, defined: M, isFunction: k, setsEqual: S, _isClickEvent: P, toFontString: xe, _measureText: _e, _longestText: ye, _alignPixel: ve, clearCanvas: we, drawPoint: Me, drawPointLegend: ke, _isPointInArea: Se, clipArea: Pe, unclipArea: De, _steppedLineTo: Oe, _bezierCurveTo: Ce, renderText: Ae, addRoundedRectPath: Le, _lookup: tt, _lookupByKey: et, _rlookupByKey: it, _filterBetween: st, listenArrayEvents: ot, unlistenArrayEvents: at, _arrayUnique: rt, _createResolver: Ee, _attachContext: Re, _descriptors: Ie, _parseObjectDataRadialScale: Ue, splineCurve: Ge, splineCurveMonotone: Ze, _updateBezierControlPoints: Qe, _isDomSupported: oe, _getParentNode: ae, getStyle: he, getRelativePosition: ue, getMaximumSize: ge, retinaScale: pe, supportsEventListenerOptions: me, readUsedSize: be, fontString: function (t, e, i) { return e + " " + t + "px " + i }, requestAnimFrame: lt, throttled: ht, debounce: ct, _toLeftRightCenter: dt, _alignStartEnd: ut, _textX: ft, _getStartAndCountOfVisiblePoints: gt, _scaleRangesChanged: pt, _pointInLine: ni, _steppedInterpolation: oi, _bezierInterpolation: ai, formatNumber: li, toLineHeight: di, _readValueToProps: ui, toTRBL: fi, toTRBLCorners: gi, toPadding: pi, toFont: mi, resolve: bi, _addGrace: xi, createContext: _i, PI: D, TAU: O, PITAU: C, INFINITY: A, RAD_PER_DEG: T, HALF_PI: L, QUARTER_PI: E, TWO_THIRDS_PI: R, log10: I, sign: z, niceNum: F, _factorize: V, isNumber: B, almostEquals: N, almostWhole: W, _setMinAndMaxByKey: j, toRadians: H, toDegrees: $, _decimalPlaces: Y, getAngleFromPoint: U, distanceBetweenPoints: X, _angleDiff: q, _normalizeAngle: K, _angleBetween: G, _limitValue: Z, _int16Range: J, _isBetween: Q, getRtlAdapter: yi, overrideTextDirection: vi, restoreTextDirection: wi, _boundSegment: Si, _boundSegments: Pi, _computeSegments: Di }); function Li(t, e, i, s) { const { controller: n, data: o, _sorted: a } = t, r = n._cachedMeta.iScale; if (r && e === r.axis && "r" !== e && a && o.length) { const t = r._reversePixels ? it : et; if (!s) return t(o, e, i); if (n._sharedOptions) { const s = o[0], n = "function" == typeof s.getRange && s.getRange(e); if (n) { const s = t(o, e, i - n), a = t(o, e, i + n); return { lo: s.lo, hi: a.hi } } } } return { lo: 0, hi: o.length - 1 } } function Ei(t, e, i, s, n) { const o = t.getSortedVisibleDatasetMetas(), a = i[e]; for (let t = 0, i = o.length; t < i; ++t) { const { index: i, data: r } = o[t], { lo: l, hi: h } = Li(o[t], e, a, n); for (let t = l; t <= h; ++t) { const e = r[t]; e.skip || s(e, i, t) } } } function Ri(t, e, i, s, n) { const o = []; if (!n && !t.isPointInArea(e)) return o; return Ei(t, i, e, (function (i, a, r) { (n || Se(i, t.chartArea, 0)) && i.inRange(e.x, e.y, s) && o.push({ element: i, datasetIndex: a, index: r }) }), !0), o } function Ii(t, e, i, s, n, o) { let a = []; const r = function (t) { const e = -1 !== t.indexOf("x"), i = -1 !== t.indexOf("y"); return function (t, s) { const n = e ? Math.abs(t.x - s.x) : 0, o = i ? Math.abs(t.y - s.y) : 0; return Math.sqrt(Math.pow(n, 2) + Math.pow(o, 2)) } }(i); let l = Number.POSITIVE_INFINITY; return Ei(t, i, e, (function (i, h, c) { const d = i.inRange(e.x, e.y, n); if (s && !d) return; const u = i.getCenterPoint(n); if (!(!!o || t.isPointInArea(u)) && !d) return; const f = r(e, u); f < l ? (a = [{ element: i, datasetIndex: h, index: c }], l = f) : f === l && a.push({ element: i, datasetIndex: h, index: c }) })), a } function zi(t, e, i, s, n, o) { return o || t.isPointInArea(e) ? "r" !== i || s ? Ii(t, e, i, s, n, o) : function (t, e, i, s) { let n = []; return Ei(t, i, e, (function (t, i, o) { const { startAngle: a, endAngle: r } = t.getProps(["startAngle", "endAngle"], s), { angle: l } = U(t, { x: e.x, y: e.y }); G(l, a, r) && n.push({ element: t, datasetIndex: i, index: o }) })), n }(t, e, i, n) : [] } function Fi(t, e, i, s, n) { const o = [], a = "x" === i ? "inXRange" : "inYRange"; let r = !1; return Ei(t, i, e, ((t, s, l) => { t[a](e[i], n) && (o.push({ element: t, datasetIndex: s, index: l }), r = r || t.inRange(e.x, e.y, n)) })), s && !r ? [] : o } var Vi = { evaluateInteractionItems: Ei, modes: { index(t, e, i, s) { const n = ue(e, t), o = i.axis || "x", a = i.includeInvisible || !1, r = i.intersect ? Ri(t, n, o, s, a) : zi(t, n, o, !1, s, a), l = []; return r.length ? (t.getSortedVisibleDatasetMetas().forEach((t => { const e = r[0].index, i = t.data[e]; i && !i.skip && l.push({ element: i, datasetIndex: t.index, index: e }) })), l) : [] }, dataset(t, e, i, s) { const n = ue(e, t), o = i.axis || "xy", a = i.includeInvisible || !1; let r = i.intersect ? Ri(t, n, o, s, a) : zi(t, n, o, !1, s, a); if (r.length > 0) { const e = r[0].datasetIndex, i = t.getDatasetMeta(e).data; r = []; for (let t = 0; t < i.length; ++t)r.push({ element: i[t], datasetIndex: e, index: t }) } return r }, point: (t, e, i, s) => Ri(t, ue(e, t), i.axis || "xy", s, i.includeInvisible || !1), nearest(t, e, i, s) { const n = ue(e, t), o = i.axis || "xy", a = i.includeInvisible || !1; return zi(t, n, o, i.intersect, s, a) }, x: (t, e, i, s) => Fi(t, ue(e, t), "x", i.intersect, s), y: (t, e, i, s) => Fi(t, ue(e, t), "y", i.intersect, s) } }; const Bi = ["left", "top", "right", "bottom"]; function Ni(t, e) { return t.filter((t => t.pos === e)) } function Wi(t, e) { return t.filter((t => -1 === Bi.indexOf(t.pos) && t.box.axis === e)) } function ji(t, e) { return t.sort(((t, i) => { const s = e ? i : t, n = e ? t : i; return s.weight === n.weight ? s.index - n.index : s.weight - n.weight })) } function Hi(t, e) { const i = function (t) { const e = {}; for (const i of t) { const { stack: t, pos: s, stackWeight: n } = i; if (!t || !Bi.includes(s)) continue; const o = e[t] || (e[t] = { count: 0, placed: 0, weight: 0, size: 0 }); o.count++, o.weight += n } return e }(t), { vBoxMaxWidth: s, hBoxMaxHeight: n } = e; let o, a, r; for (o = 0, a = t.length; o < a; ++o) { r = t[o]; const { fullSize: a } = r.box, l = i[r.stack], h = l && r.stackWeight / l.weight; r.horizontal ? (r.width = h ? h * s : a && e.availableWidth, r.height = n) : (r.width = s, r.height = h ? h * n : a && e.availableHeight) } return i } function $i(t, e, i, s) { return Math.max(t[i], e[i]) + Math.max(t[s], e[s]) } function Yi(t, e) { t.top = Math.max(t.top, e.top), t.left = Math.max(t.left, e.left), t.bottom = Math.max(t.bottom, e.bottom), t.right = Math.max(t.right, e.right) } function Ui(t, e, i, s) { const { pos: o, box: a } = i, r = t.maxPadding; if (!n(o)) { i.size && (t[o] -= i.size); const e = s[i.stack] || { size: 0, count: 1 }; e.size = Math.max(e.size, i.horizontal ? a.height : a.width), i.size = e.size / e.count, t[o] += i.size } a.getPadding && Yi(r, a.getPadding()); const l = Math.max(0, e.outerWidth - $i(r, t, "left", "right")), h = Math.max(0, e.outerHeight - $i(r, t, "top", "bottom")), c = l !== t.w, d = h !== t.h; return t.w = l, t.h = h, i.horizontal ? { same: c, other: d } : { same: d, other: c } } function Xi(t, e) { const i = e.maxPadding; function s(t) { const s = { left: 0, top: 0, right: 0, bottom: 0 }; return t.forEach((t => { s[t] = Math.max(e[t], i[t]) })), s } return s(t ? ["left", "right"] : ["top", "bottom"]) } function qi(t, e, i, s) { const n = []; let o, a, r, l, h, c; for (o = 0, a = t.length, h = 0; o < a; ++o) { r = t[o], l = r.box, l.update(r.width || e.w, r.height || e.h, Xi(r.horizontal, e)); const { same: a, other: d } = Ui(e, i, r, s); h |= a && n.length, c = c || d, l.fullSize || n.push(r) } return h && qi(n, e, i, s) || c } function Ki(t, e, i, s, n) { t.top = i, t.left = e, t.right = e + s, t.bottom = i + n, t.width = s, t.height = n } function Gi(t, e, i, s) { const n = i.padding; let { x: o, y: a } = e; for (const r of t) { const t = r.box, l = s[r.stack] || { count: 1, placed: 0, weight: 1 }, h = r.stackWeight / l.weight || 1; if (r.horizontal) { const s = e.w * h, o = l.size || t.height; M(l.start) && (a = l.start), t.fullSize ? Ki(t, n.left, a, i.outerWidth - n.right - n.left, o) : Ki(t, e.left + l.placed, a, s, o), l.start = a, l.placed += s, a = t.bottom } else { const s = e.h * h, a = l.size || t.width; M(l.start) && (o = l.start), t.fullSize ? Ki(t, o, n.top, a, i.outerHeight - n.bottom - n.top) : Ki(t, o, e.top + l.placed, a, s), l.start = o, l.placed += s, o = t.right } } e.x = o, e.y = a } ne.set("layout", { autoPadding: !0, padding: { top: 0, right: 0, bottom: 0, left: 0 } }); var Zi = { addBox(t, e) { t.boxes || (t.boxes = []), e.fullSize = e.fullSize || !1, e.position = e.position || "top", e.weight = e.weight || 0, e._layers = e._layers || function () { return [{ z: 0, draw(t) { e.draw(t) } }] }, t.boxes.push(e) }, removeBox(t, e) { const i = t.boxes ? t.boxes.indexOf(e) : -1; -1 !== i && t.boxes.splice(i, 1) }, configure(t, e, i) { e.fullSize = i.fullSize, e.position = i.position, e.weight = i.weight }, update(t, e, i, s) { if (!t) return; const n = pi(t.options.layout.padding), o = Math.max(e - n.width, 0), a = Math.max(i - n.height, 0), r = function (t) { const e = function (t) { const e = []; let i, s, n, o, a, r; for (i = 0, s = (t || []).length; i < s; ++i)n = t[i], ({ position: o, options: { stack: a, stackWeight: r = 1 } } = n), e.push({ index: i, box: n, pos: o, horizontal: n.isHorizontal(), weight: n.weight, stack: a && o + a, stackWeight: r }); return e }(t), i = ji(e.filter((t => t.box.fullSize)), !0), s = ji(Ni(e, "left"), !0), n = ji(Ni(e, "right")), o = ji(Ni(e, "top"), !0), a = ji(Ni(e, "bottom")), r = Wi(e, "x"), l = Wi(e, "y"); return { fullSize: i, leftAndTop: s.concat(o), rightAndBottom: n.concat(l).concat(a).concat(r), chartArea: Ni(e, "chartArea"), vertical: s.concat(n).concat(l), horizontal: o.concat(a).concat(r) } }(t.boxes), l = r.vertical, h = r.horizontal; d(t.boxes, (t => { "function" == typeof t.beforeLayout && t.beforeLayout() })); const c = l.reduce(((t, e) => e.box.options && !1 === e.box.options.display ? t : t + 1), 0) || 1, u = Object.freeze({ outerWidth: e, outerHeight: i, padding: n, availableWidth: o, availableHeight: a, vBoxMaxWidth: o / 2 / c, hBoxMaxHeight: a / 2 }), f = Object.assign({}, n); Yi(f, pi(s)); const g = Object.assign({ maxPadding: f, w: o, h: a, x: n.left, y: n.top }, n), p = Hi(l.concat(h), u); qi(r.fullSize, g, u, p), qi(l, g, u, p), qi(h, g, u, p) && qi(l, g, u, p), function (t) { const e = t.maxPadding; function i(i) { const s = Math.max(e[i] - t[i], 0); return t[i] += s, s } t.y += i("top"), t.x += i("left"), i("right"), i("bottom") }(g), Gi(r.leftAndTop, g, u, p), g.x += g.w, g.y += g.h, Gi(r.rightAndBottom, g, u, p), t.chartArea = { left: g.left, top: g.top, right: g.left + g.w, bottom: g.top + g.h, height: g.h, width: g.w }, d(r.chartArea, (e => { const i = e.box; Object.assign(i, t.chartArea), i.update(g.w, g.h, { left: 0, top: 0, right: 0, bottom: 0 }) })) } }; class Ji { acquireContext(t, e) { } releaseContext(t) { return !1 } addEventListener(t, e, i) { } removeEventListener(t, e, i) { } getDevicePixelRatio() { return 1 } getMaximumSize(t, e, i, s) { return e = Math.max(0, e || t.width), i = i || t.height, { width: e, height: Math.max(0, s ? Math.floor(e / s) : i) } } isAttached(t) { return !0 } updateConfig(t) { } } class Qi extends Ji { acquireContext(t) { return t && t.getContext && t.getContext("2d") || null } updateConfig(t) { t.options.animation = !1 } } const ts = { touchstart: "mousedown", touchmove: "mousemove", touchend: "mouseup", pointerenter: "mouseenter", pointerdown: "mousedown", pointermove: "mousemove", pointerup: "mouseup", pointerleave: "mouseout", pointerout: "mouseout" }, es = t => null === t || "" === t; const is = !!me && { passive: !0 }; function ss(t, e, i) { t.canvas.removeEventListener(e, i, is) } function ns(t, e) { for (const i of t) if (i === e || i.contains(e)) return !0 } function os(t, e, i) { const s = t.canvas, n = new MutationObserver((t => { let e = !1; for (const i of t) e = e || ns(i.addedNodes, s), e = e && !ns(i.removedNodes, s); e && i() })); return n.observe(document, { childList: !0, subtree: !0 }), n } function as(t, e, i) { const s = t.canvas, n = new MutationObserver((t => { let e = !1; for (const i of t) e = e || ns(i.removedNodes, s), e = e && !ns(i.addedNodes, s); e && i() })); return n.observe(document, { childList: !0, subtree: !0 }), n } const rs = new Map; let ls = 0; function hs() { const t = window.devicePixelRatio; t !== ls && (ls = t, rs.forEach(((e, i) => { i.currentDevicePixelRatio !== t && e() }))) } function cs(t, e, i) { const s = t.canvas, n = s && ae(s); if (!n) return; const o = ht(((t, e) => { const s = n.clientWidth; i(t, e), s < n.clientWidth && i() }), window), a = new ResizeObserver((t => { const e = t[0], i = e.contentRect.width, s = e.contentRect.height; 0 === i && 0 === s || o(i, s) })); return a.observe(n), function (t, e) { rs.size || window.addEventListener("resize", hs), rs.set(t, e) }(t, o), a } function ds(t, e, i) { i && i.disconnect(), "resize" === e && function (t) { rs.delete(t), rs.size || window.removeEventListener("resize", hs) }(t) } function us(t, e, i) { const s = t.canvas, n = ht((e => { null !== t.ctx && i(function (t, e) { const i = ts[t.type] || t.type, { x: s, y: n } = ue(t, e); return { type: i, chart: e, native: t, x: void 0 !== s ? s : null, y: void 0 !== n ? n : null } }(e, t)) }), t, (t => { const e = t[0]; return [e, e.offsetX, e.offsetY] })); return function (t, e, i) { t.addEventListener(e, i, is) }(s, e, n), n } class fs extends Ji { acquireContext(t, e) { const i = t && t.getContext && t.getContext("2d"); return i && i.canvas === t ? (function (t, e) { const i = t.style, s = t.getAttribute("height"), n = t.getAttribute("width"); if (t.$chartjs = { initial: { height: s, width: n, style: { display: i.display, height: i.height, width: i.width } } }, i.display = i.display || "block", i.boxSizing = i.boxSizing || "border-box", es(n)) { const e = be(t, "width"); void 0 !== e && (t.width = e) } if (es(s)) if ("" === t.style.height) t.height = t.width / (e || 2); else { const e = be(t, "height"); void 0 !== e && (t.height = e) } }(t, e), i) : null } releaseContext(t) { const e = t.canvas; if (!e.$chartjs) return !1; const s = e.$chartjs.initial;["height", "width"].forEach((t => { const n = s[t]; i(n) ? e.removeAttribute(t) : e.setAttribute(t, n) })); const n = s.style || {}; return Object.keys(n).forEach((t => { e.style[t] = n[t] })), e.width = e.width, delete e.$chartjs, !0 } addEventListener(t, e, i) { this.removeEventListener(t, e); const s = t.$proxies || (t.$proxies = {}), n = { attach: os, detach: as, resize: cs }[e] || us; s[e] = n(t, e, i) } removeEventListener(t, e) { const i = t.$proxies || (t.$proxies = {}), s = i[e]; if (!s) return; ({ attach: ds, detach: ds, resize: ds }[e] || ss)(t, e, s), i[e] = void 0 } getDevicePixelRatio() { return window.devicePixelRatio } getMaximumSize(t, e, i, s) { return ge(t, e, i, s) } isAttached(t) { const e = ae(t); return !(!e || !e.isConnected) } } function gs(t) { return !oe() || "undefined" != typeof OffscreenCanvas && t instanceof OffscreenCanvas ? Qi : fs } var ps = Object.freeze({ __proto__: null, _detectPlatform: gs, BasePlatform: Ji, BasicPlatform: Qi, DomPlatform: fs }); const ms = "transparent", bs = { boolean: (t, e, i) => i > .5 ? e : t, color(t, e, i) { const s = Jt(t || ms), n = s.valid && Jt(e || ms); return n && n.valid ? n.mix(s, i).hexString() : e }, number: (t, e, i) => t + (e - t) * i }; class xs { constructor(t, e, i, s) { const n = e[i]; s = bi([t.to, s, n, t.from]); const o = bi([t.from, n, s]); this._active = !0, this._fn = t.fn || bs[t.type || typeof o], this._easing = si[t.easing] || si.linear, this._start = Math.floor(Date.now() + (t.delay || 0)), this._duration = this._total = Math.floor(t.duration), this._loop = !!t.loop, this._target = e, this._prop = i, this._from = o, this._to = s, this._promises = void 0 } active() { return this._active } update(t, e, i) { if (this._active) { this._notify(!1); const s = this._target[this._prop], n = i - this._start, o = this._duration - n; this._start = i, this._duration = Math.floor(Math.max(o, t.duration)), this._total += n, this._loop = !!t.loop, this._to = bi([t.to, e, s, t.from]), this._from = bi([t.from, s, e]) } } cancel() { this._active && (this.tick(Date.now()), this._active = !1, this._notify(!1)) } tick(t) { const e = t - this._start, i = this._duration, s = this._prop, n = this._from, o = this._loop, a = this._to; let r; if (this._active = n !== a && (o || e < i), !this._active) return this._target[s] = a, void this._notify(!0); e < 0 ? this._target[s] = n : (r = e / i % 2, r = o && r > 1 ? 2 - r : r, r = this._easing(Math.min(1, Math.max(0, r))), this._target[s] = this._fn(n, a, r)) } wait() { const t = this._promises || (this._promises = []); return new Promise(((e, i) => { t.push({ res: e, rej: i }) })) } _notify(t) { const e = t ? "res" : "rej", i = this._promises || []; for (let t = 0; t < i.length; t++)i[t][e]() } } ne.set("animation", { delay: void 0, duration: 1e3, easing: "easeOutQuart", fn: void 0, from: void 0, loop: void 0, to: void 0, type: void 0 }); const _s = Object.keys(ne.animation); ne.describe("animation", { _fallback: !1, _indexable: !1, _scriptable: t => "onProgress" !== t && "onComplete" !== t && "fn" !== t }), ne.set("animations", { colors: { type: "color", properties: ["color", "borderColor", "backgroundColor"] }, numbers: { type: "number", properties: ["x", "y", "borderWidth", "radius", "tension"] } }), ne.describe("animations", { _fallback: "animation" }), ne.set("transitions", { active: { animation: { duration: 400 } }, resize: { animation: { duration: 0 } }, show: { animations: { colors: { from: "transparent" }, visible: { type: "boolean", duration: 0 } } }, hide: { animations: { colors: { to: "transparent" }, visible: { type: "boolean", easing: "linear", fn: t => 0 | t } } } }); class ys { constructor(t, e) { this._chart = t, this._properties = new Map, this.configure(e) } configure(t) { if (!n(t)) return; const e = this._properties; Object.getOwnPropertyNames(t).forEach((i => { const o = t[i]; if (!n(o)) return; const a = {}; for (const t of _s) a[t] = o[t]; (s(o.properties) && o.properties || [i]).forEach((t => { t !== i && e.has(t) || e.set(t, a) })) })) } _animateOptions(t, e) { const i = e.options, s = function (t, e) { if (!e) return; let i = t.options; if (!i) return void (t.options = e); i.$shared && (t.options = i = Object.assign({}, i, { $shared: !1, $animations: {} })); return i }(t, i); if (!s) return []; const n = this._createAnimations(s, i); return i.$shared && function (t, e) { const i = [], s = Object.keys(e); for (let e = 0; e < s.length; e++) { const n = t[s[e]]; n && n.active() && i.push(n.wait()) } return Promise.all(i) }(t.options.$animations, i).then((() => { t.options = i }), (() => { })), n } _createAnimations(t, e) { const i = this._properties, s = [], n = t.$animations || (t.$animations = {}), o = Object.keys(e), a = Date.now(); let r; for (r = o.length - 1; r >= 0; --r) { const l = o[r]; if ("$" === l.charAt(0)) continue; if ("options" === l) { s.push(...this._animateOptions(t, e)); continue } const h = e[l]; let c = n[l]; const d = i.get(l); if (c) { if (d && c.active()) { c.update(d, h, a); continue } c.cancel() } d && d.duration ? (n[l] = c = new xs(d, t, l, h), s.push(c)) : t[l] = h } return s } update(t, e) { if (0 === this._properties.size) return void Object.assign(t, e); const i = this._createAnimations(t, e); return i.length ? (mt.add(this._chart, i), !0) : void 0 } } function vs(t, e) { const i = t && t.options || {}, s = i.reverse, n = void 0 === i.min ? e : 0, o = void 0 === i.max ? e : 0; return { start: s ? o : n, end: s ? n : o } } function ws(t, e) { const i = [], s = t._getSortedDatasetMetas(e); let n, o; for (n = 0, o = s.length; n < o; ++n)i.push(s[n].index); return i } function Ms(t, e, i, s = {}) { const n = t.keys, a = "single" === s.mode; let r, l, h, c; if (null !== e) { for (r = 0, l = n.length; r < l; ++r) { if (h = +n[r], h === i) { if (s.all) continue; break } c = t.values[h], o(c) && (a || 0 === e || z(e) === z(c)) && (e += c) } return e } } function ks(t, e) { const i = t && t.options.stacked; return i || void 0 === i && void 0 !== e.stack } function Ss(t, e, i) { const s = t[e] || (t[e] = {}); return s[i] || (s[i] = {}) } function Ps(t, e, i, s) { for (const n of e.getMatchingVisibleMetas(s).reverse()) { const e = t[n.index]; if (i && e > 0 || !i && e < 0) return n.index } return null } function Ds(t, e) { const { chart: i, _cachedMeta: s } = t, n = i._stacks || (i._stacks = {}), { iScale: o, vScale: a, index: r } = s, l = o.axis, h = a.axis, c = function (t, e, i) { return `${t.id}.${e.id}.${i.stack || i.type}` }(o, a, s), d = e.length; let u; for (let t = 0; t < d; ++t) { const i = e[t], { [l]: o, [h]: d } = i; u = (i._stacks || (i._stacks = {}))[h] = Ss(n, c, o), u[r] = d, u._top = Ps(u, a, !0, s.type), u._bottom = Ps(u, a, !1, s.type) } } function Os(t, e) { const i = t.scales; return Object.keys(i).filter((t => i[t].axis === e)).shift() } function Cs(t, e) { const i = t.controller.index, s = t.vScale && t.vScale.axis; if (s) { e = e || t._parsed; for (const t of e) { const e = t._stacks; if (!e || void 0 === e[s] || void 0 === e[s][i]) return; delete e[s][i] } } } const As = t => "reset" === t || "none" === t, Ts = (t, e) => e ? t : Object.assign({}, t); class Ls { constructor(t, e) { this.chart = t, this._ctx = t.ctx, this.index = e, this._cachedDataOpts = {}, this._cachedMeta = this.getMeta(), this._type = this._cachedMeta.type, this.options = void 0, this._parsing = !1, this._data = void 0, this._objectData = void 0, this._sharedOptions = void 0, this._drawStart = void 0, this._drawCount = void 0, this.enableOptionSharing = !1, this.supportsDecimation = !1, this.$context = void 0, this._syncList = [], this.initialize() } initialize() { const t = this._cachedMeta; this.configure(), this.linkScales(), t._stacked = ks(t.vScale, t), this.addElements() } updateIndex(t) { this.index !== t && Cs(this._cachedMeta), this.index = t } linkScales() { const t = this.chart, e = this._cachedMeta, i = this.getDataset(), s = (t, e, i, s) => "x" === t ? e : "r" === t ? s : i, n = e.xAxisID = r(i.xAxisID, Os(t, "x")), o = e.yAxisID = r(i.yAxisID, Os(t, "y")), a = e.rAxisID = r(i.rAxisID, Os(t, "r")), l = e.indexAxis, h = e.iAxisID = s(l, n, o, a), c = e.vAxisID = s(l, o, n, a); e.xScale = this.getScaleForId(n), e.yScale = this.getScaleForId(o), e.rScale = this.getScaleForId(a), e.iScale = this.getScaleForId(h), e.vScale = this.getScaleForId(c) } getDataset() { return this.chart.data.datasets[this.index] } getMeta() { return this.chart.getDatasetMeta(this.index) } getScaleForId(t) { return this.chart.scales[t] } _getOtherScale(t) { const e = this._cachedMeta; return t === e.iScale ? e.vScale : e.iScale } reset() { this._update("reset") } _destroy() { const t = this._cachedMeta; this._data && at(this._data, this), t._stacked && Cs(t) } _dataCheck() { const t = this.getDataset(), e = t.data || (t.data = []), i = this._data; if (n(e)) this._data = function (t) { const e = Object.keys(t), i = new Array(e.length); let s, n, o; for (s = 0, n = e.length; s < n; ++s)o = e[s], i[s] = { x: o, y: t[o] }; return i }(e); else if (i !== e) { if (i) { at(i, this); const t = this._cachedMeta; Cs(t), t._parsed = [] } e && Object.isExtensible(e) && ot(e, this), this._syncList = [], this._data = e } } addElements() { const t = this._cachedMeta; this._dataCheck(), this.datasetElementType && (t.dataset = new this.datasetElementType) } buildOrUpdateElements(t) { const e = this._cachedMeta, i = this.getDataset(); let s = !1; this._dataCheck(); const n = e._stacked; e._stacked = ks(e.vScale, e), e.stack !== i.stack && (s = !0, Cs(e), e.stack = i.stack), this._resyncElements(t), (s || n !== e._stacked) && Ds(this, e._parsed) } configure() { const t = this.chart.config, e = t.datasetScopeKeys(this._type), i = t.getOptionScopes(this.getDataset(), e, !0); this.options = t.createResolver(i, this.getContext()), this._parsing = this.options.parsing, this._cachedDataOpts = {} } parse(t, e) { const { _cachedMeta: i, _data: o } = this, { iScale: a, _stacked: r } = i, l = a.axis; let h, c, d, u = 0 === t && e === o.length || i._sorted, f = t > 0 && i._parsed[t - 1]; if (!1 === this._parsing) i._parsed = o, i._sorted = !0, d = o; else { d = s(o[t]) ? this.parseArrayData(i, o, t, e) : n(o[t]) ? this.parseObjectData(i, o, t, e) : this.parsePrimitiveData(i, o, t, e); const a = () => null === c[l] || f && c[l] < f[l]; for (h = 0; h < e; ++h)i._parsed[h + t] = c = d[h], u && (a() && (u = !1), f = c); i._sorted = u } r && Ds(this, d) } parsePrimitiveData(t, e, i, s) { const { iScale: n, vScale: o } = t, a = n.axis, r = o.axis, l = n.getLabels(), h = n === o, c = new Array(s); let d, u, f; for (d = 0, u = s; d < u; ++d)f = d + i, c[d] = { [a]: h || n.parse(l[f], f), [r]: o.parse(e[f], f) }; return c } parseArrayData(t, e, i, s) { const { xScale: n, yScale: o } = t, a = new Array(s); let r, l, h, c; for (r = 0, l = s; r < l; ++r)h = r + i, c = e[h], a[r] = { x: n.parse(c[0], h), y: o.parse(c[1], h) }; return a } parseObjectData(t, e, i, s) { const { xScale: n, yScale: o } = t, { xAxisKey: a = "x", yAxisKey: r = "y" } = this._parsing, l = new Array(s); let h, c, d, u; for (h = 0, c = s; h < c; ++h)d = h + i, u = e[d], l[h] = { x: n.parse(y(u, a), d), y: o.parse(y(u, r), d) }; return l } getParsed(t) { return this._cachedMeta._parsed[t] } getDataElement(t) { return this._cachedMeta.data[t] } applyStack(t, e, i) { const s = this.chart, n = this._cachedMeta, o = e[t.axis]; return Ms({ keys: ws(s, !0), values: e._stacks[t.axis] }, o, n.index, { mode: i }) } updateRangeFromParsed(t, e, i, s) { const n = i[e.axis]; let o = null === n ? NaN : n; const a = s && i._stacks[e.axis]; s && a && (s.values = a, o = Ms(s, n, this._cachedMeta.index)), t.min = Math.min(t.min, o), t.max = Math.max(t.max, o) } getMinMax(t, e) { const i = this._cachedMeta, s = i._parsed, n = i._sorted && t === i.iScale, a = s.length, r = this._getOtherScale(t), l = ((t, e, i) => t && !e.hidden && e._stacked && { keys: ws(i, !0), values: null })(e, i, this.chart), h = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }, { min: c, max: d } = function (t) { const { min: e, max: i, minDefined: s, maxDefined: n } = t.getUserBounds(); return { min: s ? e : Number.NEGATIVE_INFINITY, max: n ? i : Number.POSITIVE_INFINITY } }(r); let u, f; function g() { f = s[u]; const e = f[r.axis]; return !o(f[t.axis]) || c > e || d < e } for (u = 0; u < a && (g() || (this.updateRangeFromParsed(h, t, f, l), !n)); ++u); if (n) for (u = a - 1; u >= 0; --u)if (!g()) { this.updateRangeFromParsed(h, t, f, l); break } return h } getAllParsedValues(t) { const e = this._cachedMeta._parsed, i = []; let s, n, a; for (s = 0, n = e.length; s < n; ++s)a = e[s][t.axis], o(a) && i.push(a); return i } getMaxOverflow() { return !1 } getLabelAndValue(t) { const e = this._cachedMeta, i = e.iScale, s = e.vScale, n = this.getParsed(t); return { label: i ? "" + i.getLabelForValue(n[i.axis]) : "", value: s ? "" + s.getLabelForValue(n[s.axis]) : "" } } _update(t) { const e = this._cachedMeta; this.update(t || "default"), e._clip = function (t) { let e, i, s, o; return n(t) ? (e = t.top, i = t.right, s = t.bottom, o = t.left) : e = i = s = o = t, { top: e, right: i, bottom: s, left: o, disabled: !1 === t } }(r(this.options.clip, function (t, e, i) { if (!1 === i) return !1; const s = vs(t, i), n = vs(e, i); return { top: n.end, right: s.end, bottom: n.start, left: s.start } }(e.xScale, e.yScale, this.getMaxOverflow()))) } update(t) { } draw() { const t = this._ctx, e = this.chart, i = this._cachedMeta, s = i.data || [], n = e.chartArea, o = [], a = this._drawStart || 0, r = this._drawCount || s.length - a, l = this.options.drawActiveElementsOnTop; let h; for (i.dataset && i.dataset.draw(t, n, a, r), h = a; h < a + r; ++h) { const e = s[h]; e.hidden || (e.active && l ? o.push(e) : e.draw(t, n)) } for (h = 0; h < o.length; ++h)o[h].draw(t, n) } getStyle(t, e) { const i = e ? "active" : "default"; return void 0 === t && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(i) : this.resolveDataElementOptions(t || 0, i) } getContext(t, e, i) { const s = this.getDataset(); let n; if (t >= 0 && t < this._cachedMeta.data.length) { const e = this._cachedMeta.data[t]; n = e.$context || (e.$context = function (t, e, i) { return _i(t, { active: !1, dataIndex: e, parsed: void 0, raw: void 0, element: i, index: e, mode: "default", type: "data" }) }(this.getContext(), t, e)), n.parsed = this.getParsed(t), n.raw = s.data[t], n.index = n.dataIndex = t } else n = this.$context || (this.$context = function (t, e) { return _i(t, { active: !1, dataset: void 0, datasetIndex: e, index: e, mode: "default", type: "dataset" }) }(this.chart.getContext(), this.index)), n.dataset = s, n.index = n.datasetIndex = this.index; return n.active = !!e, n.mode = i, n } resolveDatasetElementOptions(t) { return this._resolveElementOptions(this.datasetElementType.id, t) } resolveDataElementOptions(t, e) { return this._resolveElementOptions(this.dataElementType.id, e, t) } _resolveElementOptions(t, e = "default", i) { const s = "active" === e, n = this._cachedDataOpts, o = t + "-" + e, a = n[o], r = this.enableOptionSharing && M(i); if (a) return Ts(a, r); const l = this.chart.config, h = l.datasetElementScopeKeys(this._type, t), c = s ? [`${t}Hover`, "hover", t, ""] : [t, ""], d = l.getOptionScopes(this.getDataset(), h), u = Object.keys(ne.elements[t]), f = l.resolveNamedOptions(d, u, (() => this.getContext(i, s)), c); return f.$shared && (f.$shared = r, n[o] = Object.freeze(Ts(f, r))), f } _resolveAnimations(t, e, i) { const s = this.chart, n = this._cachedDataOpts, o = `animation-${e}`, a = n[o]; if (a) return a; let r; if (!1 !== s.options.animation) { const s = this.chart.config, n = s.datasetAnimationScopeKeys(this._type, e), o = s.getOptionScopes(this.getDataset(), n); r = s.createResolver(o, this.getContext(t, i, e)) } const l = new ys(s, r && r.animations); return r && r._cacheable && (n[o] = Object.freeze(l)), l } getSharedOptions(t) { if (t.$shared) return this._sharedOptions || (this._sharedOptions = Object.assign({}, t)) } includeOptions(t, e) { return !e || As(t) || this.chart._animationsDisabled } _getSharedOptions(t, e) { const i = this.resolveDataElementOptions(t, e), s = this._sharedOptions, n = this.getSharedOptions(i), o = this.includeOptions(e, n) || n !== s; return this.updateSharedOptions(n, e, i), { sharedOptions: n, includeOptions: o } } updateElement(t, e, i, s) { As(s) ? Object.assign(t, i) : this._resolveAnimations(e, s).update(t, i) } updateSharedOptions(t, e, i) { t && !As(e) && this._resolveAnimations(void 0, e).update(t, i) } _setStyle(t, e, i, s) { t.active = s; const n = this.getStyle(e, s); this._resolveAnimations(e, i, s).update(t, { options: !s && this.getSharedOptions(n) || n }) } removeHoverStyle(t, e, i) { this._setStyle(t, i, "active", !1) } setHoverStyle(t, e, i) { this._setStyle(t, i, "active", !0) } _removeDatasetHoverStyle() { const t = this._cachedMeta.dataset; t && this._setStyle(t, void 0, "active", !1) } _setDatasetHoverStyle() { const t = this._cachedMeta.dataset; t && this._setStyle(t, void 0, "active", !0) } _resyncElements(t) { const e = this._data, i = this._cachedMeta.data; for (const [t, e, i] of this._syncList) this[t](e, i); this._syncList = []; const s = i.length, n = e.length, o = Math.min(n, s); o && this.parse(0, o), n > s ? this._insertElements(s, n - s, t) : n < s && this._removeElements(n, s - n) } _insertElements(t, e, i = !0) { const s = this._cachedMeta, n = s.data, o = t + e; let a; const r = t => { for (t.length += e, a = t.length - 1; a >= o; a--)t[a] = t[a - e] }; for (r(n), a = t; a < o; ++a)n[a] = new this.dataElementType; this._parsing && r(s._parsed), this.parse(t, e), i && this.updateElements(n, t, e, "reset") } updateElements(t, e, i, s) { } _removeElements(t, e) { const i = this._cachedMeta; if (this._parsing) { const s = i._parsed.splice(t, e); i._stacked && Cs(i, s) } i.data.splice(t, e) } _sync(t) { if (this._parsing) this._syncList.push(t); else { const [e, i, s] = t; this[e](i, s) } this.chart._dataChanges.push([this.index, ...t]) } _onDataPush() { const t = arguments.length; this._sync(["_insertElements", this.getDataset().data.length - t, t]) } _onDataPop() { this._sync(["_removeElements", this._cachedMeta.data.length - 1, 1]) } _onDataShift() { this._sync(["_removeElements", 0, 1]) } _onDataSplice(t, e) { e && this._sync(["_removeElements", t, e]); const i = arguments.length - 2; i && this._sync(["_insertElements", t, i]) } _onDataUnshift() { this._sync(["_insertElements", 0, arguments.length]) } } Ls.defaults = {}, Ls.prototype.datasetElementType = null, Ls.prototype.dataElementType = null; class Es { constructor() { this.x = void 0, this.y = void 0, this.active = !1, this.options = void 0, this.$animations = void 0 } tooltipPosition(t) { const { x: e, y: i } = this.getProps(["x", "y"], t); return { x: e, y: i } } hasValue() { return B(this.x) && B(this.y) } getProps(t, e) { const i = this.$animations; if (!e || !i) return this; const s = {}; return t.forEach((t => { s[t] = i[t] && i[t].active() ? i[t]._to : this[t] })), s } } Es.defaults = {}, Es.defaultRoutes = void 0; const Rs = { values: t => s(t) ? t : "" + t, numeric(t, e, i) { if (0 === t) return "0"; const s = this.chart.options.locale; let n, o = t; if (i.length > 1) { const e = Math.max(Math.abs(i[0].value), Math.abs(i[i.length - 1].value)); (e < 1e-4 || e > 1e15) && (n = "scientific"), o = function (t, e) { let i = e.length > 3 ? e[2].value - e[1].value : e[1].value - e[0].value; Math.abs(i) >= 1 && t !== Math.floor(t) && (i = t - Math.floor(t)); return i }(t, i) } const a = I(Math.abs(o)), r = Math.max(Math.min(-1 * Math.floor(a), 20), 0), l = { notation: n, minimumFractionDigits: r, maximumFractionDigits: r }; return Object.assign(l, this.options.ticks.format), li(t, s, l) }, logarithmic(t, e, i) { if (0 === t) return "0"; const s = t / Math.pow(10, Math.floor(I(t))); return 1 === s || 2 === s || 5 === s ? Rs.numeric.call(this, t, e, i) : "" } }; var Is = { formatters: Rs }; function zs(t, e) { const s = t.options.ticks, n = s.maxTicksLimit || function (t) { const e = t.options.offset, i = t._tickSize(), s = t._length / i + (e ? 0 : 1), n = t._maxLength / i; return Math.floor(Math.min(s, n)) }(t), o = s.major.enabled ? function (t) { const e = []; let i, s; for (i = 0, s = t.length; i < s; i++)t[i].major && e.push(i); return e }(e) : [], a = o.length, r = o[0], l = o[a - 1], h = []; if (a > n) return function (t, e, i, s) { let n, o = 0, a = i[0]; for (s = Math.ceil(s), n = 0; n < t.length; n++)n === a && (e.push(t[n]), o++, a = i[o * s]) }(e, h, o, a / n), h; const c = function (t, e, i) { const s = function (t) { const e = t.length; let i, s; if (e < 2) return !1; for (s = t[0], i = 1; i < e; ++i)if (t[i] - t[i - 1] !== s) return !1; return s }(t), n = e.length / i; if (!s) return Math.max(n, 1); const o = V(s); for (let t = 0, e = o.length - 1; t < e; t++) { const e = o[t]; if (e > n) return e } return Math.max(n, 1) }(o, e, n); if (a > 0) { let t, s; const n = a > 1 ? Math.round((l - r) / (a - 1)) : null; for (Fs(e, h, c, i(n) ? 0 : r - n, r), t = 0, s = a - 1; t < s; t++)Fs(e, h, c, o[t], o[t + 1]); return Fs(e, h, c, l, i(n) ? e.length : l + n), h } return Fs(e, h, c), h } function Fs(t, e, i, s, n) { const o = r(s, 0), a = Math.min(r(n, t.length), t.length); let l, h, c, d = 0; for (i = Math.ceil(i), n && (l = n - s, i = l / Math.floor(l / i)), c = o; c < 0;)d++, c = Math.round(o + d * i); for (h = Math.max(o, 0); h < a; h++)h === c && (e.push(t[h]), d++, c = Math.round(o + d * i)) } ne.set("scale", { display: !0, offset: !1, reverse: !1, beginAtZero: !1, bounds: "ticks", grace: 0, grid: { display: !0, lineWidth: 1, drawBorder: !0, drawOnChartArea: !0, drawTicks: !0, tickLength: 8, tickWidth: (t, e) => e.lineWidth, tickColor: (t, e) => e.color, offset: !1, borderDash: [], borderDashOffset: 0, borderWidth: 1 }, title: { display: !1, text: "", padding: { top: 4, bottom: 4 } }, ticks: { minRotation: 0, maxRotation: 50, mirror: !1, textStrokeWidth: 0, textStrokeColor: "", padding: 3, display: !0, autoSkip: !0, autoSkipPadding: 3, labelOffset: 0, callback: Is.formatters.values, minor: {}, major: {}, align: "center", crossAlign: "near", showLabelBackdrop: !1, backdropColor: "rgba(255, 255, 255, 0.75)", backdropPadding: 2 } }), ne.route("scale.ticks", "color", "", "color"), ne.route("scale.grid", "color", "", "borderColor"), ne.route("scale.grid", "borderColor", "", "borderColor"), ne.route("scale.title", "color", "", "color"), ne.describe("scale", { _fallback: !1, _scriptable: t => !t.startsWith("before") && !t.startsWith("after") && "callback" !== t && "parser" !== t, _indexable: t => "borderDash" !== t && "tickBorderDash" !== t }), ne.describe("scales", { _fallback: "scale" }), ne.describe("scale.ticks", { _scriptable: t => "backdropPadding" !== t && "callback" !== t, _indexable: t => "backdropPadding" !== t }); const Vs = (t, e, i) => "top" === e || "left" === e ? t[e] + i : t[e] - i; function Bs(t, e) { const i = [], s = t.length / e, n = t.length; let o = 0; for (; o < n; o += s)i.push(t[Math.floor(o)]); return i } function Ns(t, e, i) { const s = t.ticks.length, n = Math.min(e, s - 1), o = t._startPixel, a = t._endPixel, r = 1e-6; let l, h = t.getPixelForTick(n); if (!(i && (l = 1 === s ? Math.max(h - o, a - h) : 0 === e ? (t.getPixelForTick(1) - h) / 2 : (h - t.getPixelForTick(n - 1)) / 2, h += n < e ? l : -l, h < o - r || h > a + r))) return h } function Ws(t) { return t.drawTicks ? t.tickLength : 0 } function js(t, e) { if (!t.display) return 0; const i = mi(t.font, e), n = pi(t.padding); return (s(t.text) ? t.text.length : 1) * i.lineHeight + n.height } function Hs(t, e, i) { let s = dt(t); return (i && "right" !== e || !i && "right" === e) && (s = (t => "left" === t ? "right" : "right" === t ? "left" : t)(s)), s } class $s extends Es { constructor(t) { super(), this.id = t.id, this.type = t.type, this.options = void 0, this.ctx = t.ctx, this.chart = t.chart, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this._margins = { left: 0, right: 0, top: 0, bottom: 0 }, this.maxWidth = void 0, this.maxHeight = void 0, this.paddingTop = void 0, this.paddingBottom = void 0, this.paddingLeft = void 0, this.paddingRight = void 0, this.axis = void 0, this.labelRotation = void 0, this.min = void 0, this.max = void 0, this._range = void 0, this.ticks = [], this._gridLineItems = null, this._labelItems = null, this._labelSizes = null, this._length = 0, this._maxLength = 0, this._longestTextCache = {}, this._startPixel = void 0, this._endPixel = void 0, this._reversePixels = !1, this._userMax = void 0, this._userMin = void 0, this._suggestedMax = void 0, this._suggestedMin = void 0, this._ticksLength = 0, this._borderValue = 0, this._cache = {}, this._dataLimitsCached = !1, this.$context = void 0 } init(t) { this.options = t.setContext(this.getContext()), this.axis = t.axis, this._userMin = this.parse(t.min), this._userMax = this.parse(t.max), this._suggestedMin = this.parse(t.suggestedMin), this._suggestedMax = this.parse(t.suggestedMax) } parse(t, e) { return t } getUserBounds() { let { _userMin: t, _userMax: e, _suggestedMin: i, _suggestedMax: s } = this; return t = a(t, Number.POSITIVE_INFINITY), e = a(e, Number.NEGATIVE_INFINITY), i = a(i, Number.POSITIVE_INFINITY), s = a(s, Number.NEGATIVE_INFINITY), { min: a(t, i), max: a(e, s), minDefined: o(t), maxDefined: o(e) } } getMinMax(t) { let e, { min: i, max: s, minDefined: n, maxDefined: o } = this.getUserBounds(); if (n && o) return { min: i, max: s }; const r = this.getMatchingVisibleMetas(); for (let a = 0, l = r.length; a < l; ++a)e = r[a].controller.getMinMax(this, t), n || (i = Math.min(i, e.min)), o || (s = Math.max(s, e.max)); return i = o && i > s ? s : i, s = n && i > s ? i : s, { min: a(i, a(s, i)), max: a(s, a(i, s)) } } getPadding() { return { left: this.paddingLeft || 0, top: this.paddingTop || 0, right: this.paddingRight || 0, bottom: this.paddingBottom || 0 } } getTicks() { return this.ticks } getLabels() { const t = this.chart.data; return this.options.labels || (this.isHorizontal() ? t.xLabels : t.yLabels) || t.labels || [] } beforeLayout() { this._cache = {}, this._dataLimitsCached = !1 } beforeUpdate() { c(this.options.beforeUpdate, [this]) } update(t, e, i) { const { beginAtZero: s, grace: n, ticks: o } = this.options, a = o.sampleSize; this.beforeUpdate(), this.maxWidth = t, this.maxHeight = e, this._margins = i = Object.assign({ left: 0, right: 0, top: 0, bottom: 0 }, i), this.ticks = null, this._labelSizes = null, this._gridLineItems = null, this._labelItems = null, this.beforeSetDimensions(), this.setDimensions(), this.afterSetDimensions(), this._maxLength = this.isHorizontal() ? this.width + i.left + i.right : this.height + i.top + i.bottom, this._dataLimitsCached || (this.beforeDataLimits(), this.determineDataLimits(), this.afterDataLimits(), this._range = xi(this, n, s), this._dataLimitsCached = !0), this.beforeBuildTicks(), this.ticks = this.buildTicks() || [], this.afterBuildTicks(); const r = a < this.ticks.length; this._convertTicksToLabels(r ? Bs(this.ticks, a) : this.ticks), this.configure(), this.beforeCalculateLabelRotation(), this.calculateLabelRotation(), this.afterCalculateLabelRotation(), o.display && (o.autoSkip || "auto" === o.source) && (this.ticks = zs(this, this.ticks), this._labelSizes = null, this.afterAutoSkip()), r && this._convertTicksToLabels(this.ticks), this.beforeFit(), this.fit(), this.afterFit(), this.afterUpdate() } configure() { let t, e, i = this.options.reverse; this.isHorizontal() ? (t = this.left, e = this.right) : (t = this.top, e = this.bottom, i = !i), this._startPixel = t, this._endPixel = e, this._reversePixels = i, this._length = e - t, this._alignToPixels = this.options.alignToPixels } afterUpdate() { c(this.options.afterUpdate, [this]) } beforeSetDimensions() { c(this.options.beforeSetDimensions, [this]) } setDimensions() { this.isHorizontal() ? (this.width = this.maxWidth, this.left = 0, this.right = this.width) : (this.height = this.maxHeight, this.top = 0, this.bottom = this.height), this.paddingLeft = 0, this.paddingTop = 0, this.paddingRight = 0, this.paddingBottom = 0 } afterSetDimensions() { c(this.options.afterSetDimensions, [this]) } _callHooks(t) { this.chart.notifyPlugins(t, this.getContext()), c(this.options[t], [this]) } beforeDataLimits() { this._callHooks("beforeDataLimits") } determineDataLimits() { } afterDataLimits() { this._callHooks("afterDataLimits") } beforeBuildTicks() { this._callHooks("beforeBuildTicks") } buildTicks() { return [] } afterBuildTicks() { this._callHooks("afterBuildTicks") } beforeTickToLabelConversion() { c(this.options.beforeTickToLabelConversion, [this]) } generateTickLabels(t) { const e = this.options.ticks; let i, s, n; for (i = 0, s = t.length; i < s; i++)n = t[i], n.label = c(e.callback, [n.value, i, t], this) } afterTickToLabelConversion() { c(this.options.afterTickToLabelConversion, [this]) } beforeCalculateLabelRotation() { c(this.options.beforeCalculateLabelRotation, [this]) } calculateLabelRotation() { const t = this.options, e = t.ticks, i = this.ticks.length, s = e.minRotation || 0, n = e.maxRotation; let o, a, r, l = s; if (!this._isVisible() || !e.display || s >= n || i <= 1 || !this.isHorizontal()) return void (this.labelRotation = s); const h = this._getLabelSizes(), c = h.widest.width, d = h.highest.height, u = Z(this.chart.width - c, 0, this.maxWidth); o = t.offset ? this.maxWidth / i : u / (i - 1), c + 6 > o && (o = u / (i - (t.offset ? .5 : 1)), a = this.maxHeight - Ws(t.grid) - e.padding - js(t.title, this.chart.options.font), r = Math.sqrt(c * c + d * d), l = $(Math.min(Math.asin(Z((h.highest.height + 6) / o, -1, 1)), Math.asin(Z(a / r, -1, 1)) - Math.asin(Z(d / r, -1, 1)))), l = Math.max(s, Math.min(n, l))), this.labelRotation = l } afterCalculateLabelRotation() { c(this.options.afterCalculateLabelRotation, [this]) } afterAutoSkip() { } beforeFit() { c(this.options.beforeFit, [this]) } fit() { const t = { width: 0, height: 0 }, { chart: e, options: { ticks: i, title: s, grid: n } } = this, o = this._isVisible(), a = this.isHorizontal(); if (o) { const o = js(s, e.options.font); if (a ? (t.width = this.maxWidth, t.height = Ws(n) + o) : (t.height = this.maxHeight, t.width = Ws(n) + o), i.display && this.ticks.length) { const { first: e, last: s, widest: n, highest: o } = this._getLabelSizes(), r = 2 * i.padding, l = H(this.labelRotation), h = Math.cos(l), c = Math.sin(l); if (a) { const e = i.mirror ? 0 : c * n.width + h * o.height; t.height = Math.min(this.maxHeight, t.height + e + r) } else { const e = i.mirror ? 0 : h * n.width + c * o.height; t.width = Math.min(this.maxWidth, t.width + e + r) } this._calculatePadding(e, s, c, h) } } this._handleMargins(), a ? (this.width = this._length = e.width - this._margins.left - this._margins.right, this.height = t.height) : (this.width = t.width, this.height = this._length = e.height - this._margins.top - this._margins.bottom) } _calculatePadding(t, e, i, s) { const { ticks: { align: n, padding: o }, position: a } = this.options, r = 0 !== this.labelRotation, l = "top" !== a && "x" === this.axis; if (this.isHorizontal()) { const a = this.getPixelForTick(0) - this.left, h = this.right - this.getPixelForTick(this.ticks.length - 1); let c = 0, d = 0; r ? l ? (c = s * t.width, d = i * e.height) : (c = i * t.height, d = s * e.width) : "start" === n ? d = e.width : "end" === n ? c = t.width : "inner" !== n && (c = t.width / 2, d = e.width / 2), this.paddingLeft = Math.max((c - a + o) * this.width / (this.width - a), 0), this.paddingRight = Math.max((d - h + o) * this.width / (this.width - h), 0) } else { let i = e.height / 2, s = t.height / 2; "start" === n ? (i = 0, s = t.height) : "end" === n && (i = e.height, s = 0), this.paddingTop = i + o, this.paddingBottom = s + o } } _handleMargins() { this._margins && (this._margins.left = Math.max(this.paddingLeft, this._margins.left), this._margins.top = Math.max(this.paddingTop, this._margins.top), this._margins.right = Math.max(this.paddingRight, this._margins.right), this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom)) } afterFit() { c(this.options.afterFit, [this]) } isHorizontal() { const { axis: t, position: e } = this.options; return "top" === e || "bottom" === e || "x" === t } isFullSize() { return this.options.fullSize } _convertTicksToLabels(t) { let e, s; for (this.beforeTickToLabelConversion(), this.generateTickLabels(t), e = 0, s = t.length; e < s; e++)i(t[e].label) && (t.splice(e, 1), s--, e--); this.afterTickToLabelConversion() } _getLabelSizes() { let t = this._labelSizes; if (!t) { const e = this.options.ticks.sampleSize; let i = this.ticks; e < i.length && (i = Bs(i, e)), this._labelSizes = t = this._computeLabelSizes(i, i.length) } return t } _computeLabelSizes(t, e) { const { ctx: n, _longestTextCache: o } = this, a = [], r = []; let l, h, c, u, f, g, p, m, b, x, _, y = 0, v = 0; for (l = 0; l < e; ++l) { if (u = t[l].label, f = this._resolveTickFontOptions(l), n.font = g = f.string, p = o[g] = o[g] || { data: {}, gc: [] }, m = f.lineHeight, b = x = 0, i(u) || s(u)) { if (s(u)) for (h = 0, c = u.length; h < c; ++h)_ = u[h], i(_) || s(_) || (b = _e(n, p.data, p.gc, b, _), x += m) } else b = _e(n, p.data, p.gc, b, u), x = m; a.push(b), r.push(x), y = Math.max(b, y), v = Math.max(x, v) } !function (t, e) { d(t, (t => { const i = t.gc, s = i.length / 2; let n; if (s > e) { for (n = 0; n < s; ++n)delete t.data[i[n]]; i.splice(0, s) } })) }(o, e); const w = a.indexOf(y), M = r.indexOf(v), k = t => ({ width: a[t] || 0, height: r[t] || 0 }); return { first: k(0), last: k(e - 1), widest: k(w), highest: k(M), widths: a, heights: r } } getLabelForValue(t) { return t } getPixelForValue(t, e) { return NaN } getValueForPixel(t) { } getPixelForTick(t) { const e = this.ticks; return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value) } getPixelForDecimal(t) { this._reversePixels && (t = 1 - t); const e = this._startPixel + t * this._length; return J(this._alignToPixels ? ve(this.chart, e, 0) : e) } getDecimalForPixel(t) { const e = (t - this._startPixel) / this._length; return this._reversePixels ? 1 - e : e } getBasePixel() { return this.getPixelForValue(this.getBaseValue()) } getBaseValue() { const { min: t, max: e } = this; return t < 0 && e < 0 ? e : t > 0 && e > 0 ? t : 0 } getContext(t) { const e = this.ticks || []; if (t >= 0 && t < e.length) { const i = e[t]; return i.$context || (i.$context = function (t, e, i) { return _i(t, { tick: i, index: e, type: "tick" }) }(this.getContext(), t, i)) } return this.$context || (this.$context = _i(this.chart.getContext(), { scale: this, type: "scale" })) } _tickSize() { const t = this.options.ticks, e = H(this.labelRotation), i = Math.abs(Math.cos(e)), s = Math.abs(Math.sin(e)), n = this._getLabelSizes(), o = t.autoSkipPadding || 0, a = n ? n.widest.width + o : 0, r = n ? n.highest.height + o : 0; return this.isHorizontal() ? r * i > a * s ? a / i : r / s : r * s < a * i ? r / i : a / s } _isVisible() { const t = this.options.display; return "auto" !== t ? !!t : this.getMatchingVisibleMetas().length > 0 } _computeGridLineItems(t) { const e = this.axis, i = this.chart, s = this.options, { grid: o, position: a } = s, l = o.offset, h = this.isHorizontal(), c = this.ticks.length + (l ? 1 : 0), d = Ws(o), u = [], f = o.setContext(this.getContext()), g = f.drawBorder ? f.borderWidth : 0, p = g / 2, m = function (t) { return ve(i, t, g) }; let b, x, _, y, v, w, M, k, S, P, D, O; if ("top" === a) b = m(this.bottom), w = this.bottom - d, k = b - p, P = m(t.top) + p, O = t.bottom; else if ("bottom" === a) b = m(this.top), P = t.top, O = m(t.bottom) - p, w = b + p, k = this.top + d; else if ("left" === a) b = m(this.right), v = this.right - d, M = b - p, S = m(t.left) + p, D = t.right; else if ("right" === a) b = m(this.left), S = t.left, D = m(t.right) - p, v = b + p, M = this.left + d; else if ("x" === e) { if ("center" === a) b = m((t.top + t.bottom) / 2 + .5); else if (n(a)) { const t = Object.keys(a)[0], e = a[t]; b = m(this.chart.scales[t].getPixelForValue(e)) } P = t.top, O = t.bottom, w = b + p, k = w + d } else if ("y" === e) { if ("center" === a) b = m((t.left + t.right) / 2); else if (n(a)) { const t = Object.keys(a)[0], e = a[t]; b = m(this.chart.scales[t].getPixelForValue(e)) } v = b - p, M = v - d, S = t.left, D = t.right } const C = r(s.ticks.maxTicksLimit, c), A = Math.max(1, Math.ceil(c / C)); for (x = 0; x < c; x += A) { const t = o.setContext(this.getContext(x)), e = t.lineWidth, s = t.color, n = t.borderDash || [], a = t.borderDashOffset, r = t.tickWidth, c = t.tickColor, d = t.tickBorderDash || [], f = t.tickBorderDashOffset; _ = Ns(this, x, l), void 0 !== _ && (y = ve(i, _, e), h ? v = M = S = D = y : w = k = P = O = y, u.push({ tx1: v, ty1: w, tx2: M, ty2: k, x1: S, y1: P, x2: D, y2: O, width: e, color: s, borderDash: n, borderDashOffset: a, tickWidth: r, tickColor: c, tickBorderDash: d, tickBorderDashOffset: f })) } return this._ticksLength = c, this._borderValue = b, u } _computeLabelItems(t) { const e = this.axis, i = this.options, { position: o, ticks: a } = i, r = this.isHorizontal(), l = this.ticks, { align: h, crossAlign: c, padding: d, mirror: u } = a, f = Ws(i.grid), g = f + d, p = u ? -d : g, m = -H(this.labelRotation), b = []; let x, _, y, v, w, M, k, S, P, D, O, C, A = "middle"; if ("top" === o) M = this.bottom - p, k = this._getXAxisLabelAlignment(); else if ("bottom" === o) M = this.top + p, k = this._getXAxisLabelAlignment(); else if ("left" === o) { const t = this._getYAxisLabelAlignment(f); k = t.textAlign, w = t.x } else if ("right" === o) { const t = this._getYAxisLabelAlignment(f); k = t.textAlign, w = t.x } else if ("x" === e) { if ("center" === o) M = (t.top + t.bottom) / 2 + g; else if (n(o)) { const t = Object.keys(o)[0], e = o[t]; M = this.chart.scales[t].getPixelForValue(e) + g } k = this._getXAxisLabelAlignment() } else if ("y" === e) { if ("center" === o) w = (t.left + t.right) / 2 - g; else if (n(o)) { const t = Object.keys(o)[0], e = o[t]; w = this.chart.scales[t].getPixelForValue(e) } k = this._getYAxisLabelAlignment(f).textAlign } "y" === e && ("start" === h ? A = "top" : "end" === h && (A = "bottom")); const T = this._getLabelSizes(); for (x = 0, _ = l.length; x < _; ++x) { y = l[x], v = y.label; const t = a.setContext(this.getContext(x)); S = this.getPixelForTick(x) + a.labelOffset, P = this._resolveTickFontOptions(x), D = P.lineHeight, O = s(v) ? v.length : 1; const e = O / 2, i = t.color, n = t.textStrokeColor, h = t.textStrokeWidth; let d, f = k; if (r ? (w = S, "inner" === k && (f = x === _ - 1 ? this.options.reverse ? "left" : "right" : 0 === x ? this.options.reverse ? "right" : "left" : "center"), C = "top" === o ? "near" === c || 0 !== m ? -O * D + D / 2 : "center" === c ? -T.highest.height / 2 - e * D + D : -T.highest.height + D / 2 : "near" === c || 0 !== m ? D / 2 : "center" === c ? T.highest.height / 2 - e * D : T.highest.height - O * D, u && (C *= -1)) : (M = S, C = (1 - O) * D / 2), t.showLabelBackdrop) { const e = pi(t.backdropPadding), i = T.heights[x], s = T.widths[x]; let n = M + C - e.top, o = w - e.left; switch (A) { case "middle": n -= i / 2; break; case "bottom": n -= i }switch (k) { case "center": o -= s / 2; break; case "right": o -= s }d = { left: o, top: n, width: s + e.width, height: i + e.height, color: t.backdropColor } } b.push({ rotation: m, label: v, font: P, color: i, strokeColor: n, strokeWidth: h, textOffset: C, textAlign: f, textBaseline: A, translation: [w, M], backdrop: d }) } return b } _getXAxisLabelAlignment() { const { position: t, ticks: e } = this.options; if (-H(this.labelRotation)) return "top" === t ? "left" : "right"; let i = "center"; return "start" === e.align ? i = "left" : "end" === e.align ? i = "right" : "inner" === e.align && (i = "inner"), i } _getYAxisLabelAlignment(t) { const { position: e, ticks: { crossAlign: i, mirror: s, padding: n } } = this.options, o = t + n, a = this._getLabelSizes().widest.width; let r, l; return "left" === e ? s ? (l = this.right + n, "near" === i ? r = "left" : "center" === i ? (r = "center", l += a / 2) : (r = "right", l += a)) : (l = this.right - o, "near" === i ? r = "right" : "center" === i ? (r = "center", l -= a / 2) : (r = "left", l = this.left)) : "right" === e ? s ? (l = this.left + n, "near" === i ? r = "right" : "center" === i ? (r = "center", l -= a / 2) : (r = "left", l -= a)) : (l = this.left + o, "near" === i ? r = "left" : "center" === i ? (r = "center", l += a / 2) : (r = "right", l = this.right)) : r = "right", { textAlign: r, x: l } } _computeLabelArea() { if (this.options.ticks.mirror) return; const t = this.chart, e = this.options.position; return "left" === e || "right" === e ? { top: 0, left: this.left, bottom: t.height, right: this.right } : "top" === e || "bottom" === e ? { top: this.top, left: 0, bottom: this.bottom, right: t.width } : void 0 } drawBackground() { const { ctx: t, options: { backgroundColor: e }, left: i, top: s, width: n, height: o } = this; e && (t.save(), t.fillStyle = e, t.fillRect(i, s, n, o), t.restore()) } getLineWidthForValue(t) { const e = this.options.grid; if (!this._isVisible() || !e.display) return 0; const i = this.ticks.findIndex((e => e.value === t)); if (i >= 0) { return e.setContext(this.getContext(i)).lineWidth } return 0 } drawGrid(t) { const e = this.options.grid, i = this.ctx, s = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(t)); let n, o; const a = (t, e, s) => { s.width && s.color && (i.save(), i.lineWidth = s.width, i.strokeStyle = s.color, i.setLineDash(s.borderDash || []), i.lineDashOffset = s.borderDashOffset, i.beginPath(), i.moveTo(t.x, t.y), i.lineTo(e.x, e.y), i.stroke(), i.restore()) }; if (e.display) for (n = 0, o = s.length; n < o; ++n) { const t = s[n]; e.drawOnChartArea && a({ x: t.x1, y: t.y1 }, { x: t.x2, y: t.y2 }, t), e.drawTicks && a({ x: t.tx1, y: t.ty1 }, { x: t.tx2, y: t.ty2 }, { color: t.tickColor, width: t.tickWidth, borderDash: t.tickBorderDash, borderDashOffset: t.tickBorderDashOffset }) } } drawBorder() { const { chart: t, ctx: e, options: { grid: i } } = this, s = i.setContext(this.getContext()), n = i.drawBorder ? s.borderWidth : 0; if (!n) return; const o = i.setContext(this.getContext(0)).lineWidth, a = this._borderValue; let r, l, h, c; this.isHorizontal() ? (r = ve(t, this.left, n) - n / 2, l = ve(t, this.right, o) + o / 2, h = c = a) : (h = ve(t, this.top, n) - n / 2, c = ve(t, this.bottom, o) + o / 2, r = l = a), e.save(), e.lineWidth = s.borderWidth, e.strokeStyle = s.borderColor, e.beginPath(), e.moveTo(r, h), e.lineTo(l, c), e.stroke(), e.restore() } drawLabels(t) { if (!this.options.ticks.display) return; const e = this.ctx, i = this._computeLabelArea(); i && Pe(e, i); const s = this._labelItems || (this._labelItems = this._computeLabelItems(t)); let n, o; for (n = 0, o = s.length; n < o; ++n) { const t = s[n], i = t.font, o = t.label; t.backdrop && (e.fillStyle = t.backdrop.color, e.fillRect(t.backdrop.left, t.backdrop.top, t.backdrop.width, t.backdrop.height)), Ae(e, o, 0, t.textOffset, i, t) } i && De(e) } drawTitle() { const { ctx: t, options: { position: e, title: i, reverse: o } } = this; if (!i.display) return; const a = mi(i.font), r = pi(i.padding), l = i.align; let h = a.lineHeight / 2; "bottom" === e || "center" === e || n(e) ? (h += r.bottom, s(i.text) && (h += a.lineHeight * (i.text.length - 1))) : h += r.top; const { titleX: c, titleY: d, maxWidth: u, rotation: f } = function (t, e, i, s) { const { top: o, left: a, bottom: r, right: l, chart: h } = t, { chartArea: c, scales: d } = h; let u, f, g, p = 0; const m = r - o, b = l - a; if (t.isHorizontal()) { if (f = ut(s, a, l), n(i)) { const t = Object.keys(i)[0], s = i[t]; g = d[t].getPixelForValue(s) + m - e } else g = "center" === i ? (c.bottom + c.top) / 2 + m - e : Vs(t, i, e); u = l - a } else { if (n(i)) { const t = Object.keys(i)[0], s = i[t]; f = d[t].getPixelForValue(s) - b + e } else f = "center" === i ? (c.left + c.right) / 2 - b + e : Vs(t, i, e); g = ut(s, r, o), p = "left" === i ? -L : L } return { titleX: f, titleY: g, maxWidth: u, rotation: p } }(this, h, e, l); Ae(t, i.text, 0, 0, a, { color: i.color, maxWidth: u, rotation: f, textAlign: Hs(l, e, o), textBaseline: "middle", translation: [c, d] }) } draw(t) { this._isVisible() && (this.drawBackground(), this.drawGrid(t), this.drawBorder(), this.drawTitle(), this.drawLabels(t)) } _layers() { const t = this.options, e = t.ticks && t.ticks.z || 0, i = r(t.grid && t.grid.z, -1); return this._isVisible() && this.draw === $s.prototype.draw ? [{ z: i, draw: t => { this.drawBackground(), this.drawGrid(t), this.drawTitle() } }, { z: i + 1, draw: () => { this.drawBorder() } }, { z: e, draw: t => { this.drawLabels(t) } }] : [{ z: e, draw: t => { this.draw(t) } }] } getMatchingVisibleMetas(t) { const e = this.chart.getSortedVisibleDatasetMetas(), i = this.axis + "AxisID", s = []; let n, o; for (n = 0, o = e.length; n < o; ++n) { const o = e[n]; o[i] !== this.id || t && o.type !== t || s.push(o) } return s } _resolveTickFontOptions(t) { return mi(this.options.ticks.setContext(this.getContext(t)).font) } _maxDigits() { const t = this._resolveTickFontOptions(0).lineHeight; return (this.isHorizontal() ? this.width : this.height) / t } } class Ys { constructor(t, e, i) { this.type = t, this.scope = e, this.override = i, this.items = Object.create(null) } isForType(t) { return Object.prototype.isPrototypeOf.call(this.type.prototype, t.prototype) } register(t) { const e = Object.getPrototypeOf(t); let i; (function (t) { return "id" in t && "defaults" in t })(e) && (i = this.register(e)); const s = this.items, n = t.id, o = this.scope + "." + n; if (!n) throw new Error("class does not have id: " + t); return n in s || (s[n] = t, function (t, e, i) { const s = m(Object.create(null), [i ? ne.get(i) : {}, ne.get(e), t.defaults]); ne.set(e, s), t.defaultRoutes && function (t, e) { Object.keys(e).forEach((i => { const s = i.split("."), n = s.pop(), o = [t].concat(s).join("."), a = e[i].split("."), r = a.pop(), l = a.join("."); ne.route(o, n, l, r) })) }(e, t.defaultRoutes); t.descriptors && ne.describe(e, t.descriptors) }(t, o, i), this.override && ne.override(t.id, t.overrides)), o } get(t) { return this.items[t] } unregister(t) { const e = this.items, i = t.id, s = this.scope; i in e && delete e[i], s && i in ne[s] && (delete ne[s][i], this.override && delete te[i]) } } var Us = new class { constructor() { this.controllers = new Ys(Ls, "datasets", !0), this.elements = new Ys(Es, "elements"), this.plugins = new Ys(Object, "plugins"), this.scales = new Ys($s, "scales"), this._typedRegistries = [this.controllers, this.scales, this.elements] } add(...t) { this._each("register", t) } remove(...t) { this._each("unregister", t) } addControllers(...t) { this._each("register", t, this.controllers) } addElements(...t) { this._each("register", t, this.elements) } addPlugins(...t) { this._each("register", t, this.plugins) } addScales(...t) { this._each("register", t, this.scales) } getController(t) { return this._get(t, this.controllers, "controller") } getElement(t) { return this._get(t, this.elements, "element") } getPlugin(t) { return this._get(t, this.plugins, "plugin") } getScale(t) { return this._get(t, this.scales, "scale") } removeControllers(...t) { this._each("unregister", t, this.controllers) } removeElements(...t) { this._each("unregister", t, this.elements) } removePlugins(...t) { this._each("unregister", t, this.plugins) } removeScales(...t) { this._each("unregister", t, this.scales) } _each(t, e, i) { [...e].forEach((e => { const s = i || this._getRegistryForType(e); i || s.isForType(e) || s === this.plugins && e.id ? this._exec(t, s, e) : d(e, (e => { const s = i || this._getRegistryForType(e); this._exec(t, s, e) })) })) } _exec(t, e, i) { const s = w(t); c(i["before" + s], [], i), e[t](i), c(i["after" + s], [], i) } _getRegistryForType(t) { for (let e = 0; e < this._typedRegistries.length; e++) { const i = this._typedRegistries[e]; if (i.isForType(t)) return i } return this.plugins } _get(t, e, i) { const s = e.get(t); if (void 0 === s) throw new Error('"' + t + '" is not a registered ' + i + "."); return s } }; class Xs { constructor() { this._init = [] } notify(t, e, i, s) { "beforeInit" === e && (this._init = this._createDescriptors(t, !0), this._notify(this._init, t, "install")); const n = s ? this._descriptors(t).filter(s) : this._descriptors(t), o = this._notify(n, t, e, i); return "afterDestroy" === e && (this._notify(n, t, "stop"), this._notify(this._init, t, "uninstall")), o } _notify(t, e, i, s) { s = s || {}; for (const n of t) { const t = n.plugin; if (!1 === c(t[i], [e, s, n.options], t) && s.cancelable) return !1 } return !0 } invalidate() { i(this._cache) || (this._oldCache = this._cache, this._cache = void 0) } _descriptors(t) { if (this._cache) return this._cache; const e = this._cache = this._createDescriptors(t); return this._notifyStateChanges(t), e } _createDescriptors(t, e) { const i = t && t.config, s = r(i.options && i.options.plugins, {}), n = function (t) { const e = {}, i = [], s = Object.keys(Us.plugins.items); for (let t = 0; t < s.length; t++)i.push(Us.getPlugin(s[t])); const n = t.plugins || []; for (let t = 0; t < n.length; t++) { const s = n[t]; -1 === i.indexOf(s) && (i.push(s), e[s.id] = !0) } return { plugins: i, localIds: e } }(i); return !1 !== s || e ? function (t, { plugins: e, localIds: i }, s, n) { const o = [], a = t.getContext(); for (const r of e) { const e = r.id, l = qs(s[e], n); null !== l && o.push({ plugin: r, options: Ks(t.config, { plugin: r, local: i[e] }, l, a) }) } return o }(t, n, s, e) : [] } _notifyStateChanges(t) { const e = this._oldCache || [], i = this._cache, s = (t, e) => t.filter((t => !e.some((e => t.plugin.id === e.plugin.id)))); this._notify(s(e, i), t, "stop"), this._notify(s(i, e), t, "start") } } function qs(t, e) { return e || !1 !== t ? !0 === t ? {} : t : null } function Ks(t, { plugin: e, local: i }, s, n) { const o = t.pluginScopeKeys(e), a = t.getOptionScopes(s, o); return i && e.defaults && a.push(e.defaults), t.createResolver(a, n, [""], { scriptable: !1, indexable: !1, allKeys: !0 }) } function Gs(t, e) { const i = ne.datasets[t] || {}; return ((e.datasets || {})[t] || {}).indexAxis || e.indexAxis || i.indexAxis || "x" } function Zs(t, e) { return "x" === t || "y" === t ? t : e.axis || ("top" === (i = e.position) || "bottom" === i ? "x" : "left" === i || "right" === i ? "y" : void 0) || t.charAt(0).toLowerCase(); var i } function Js(t) { const e = t.options || (t.options = {}); e.plugins = r(e.plugins, {}), e.scales = function (t, e) { const i = te[t.type] || { scales: {} }, s = e.scales || {}, o = Gs(t.type, e), a = Object.create(null), r = Object.create(null); return Object.keys(s).forEach((t => { const e = s[t]; if (!n(e)) return console.error(`Invalid scale configuration for scale: ${t}`); if (e._proxy) return console.warn(`Ignoring resolver passed as options for scale: ${t}`); const l = Zs(t, e), h = function (t, e) { return t === e ? "_index_" : "_value_" }(l, o), c = i.scales || {}; a[l] = a[l] || t, r[t] = b(Object.create(null), [{ axis: l }, e, c[l], c[h]]) })), t.data.datasets.forEach((i => { const n = i.type || t.type, o = i.indexAxis || Gs(n, e), l = (te[n] || {}).scales || {}; Object.keys(l).forEach((t => { const e = function (t, e) { let i = t; return "_index_" === t ? i = e : "_value_" === t && (i = "x" === e ? "y" : "x"), i }(t, o), n = i[e + "AxisID"] || a[e] || e; r[n] = r[n] || Object.create(null), b(r[n], [{ axis: e }, s[n], l[t]]) })) })), Object.keys(r).forEach((t => { const e = r[t]; b(e, [ne.scales[e.type], ne.scale]) })), r }(t, e) } function Qs(t) { return (t = t || {}).datasets = t.datasets || [], t.labels = t.labels || [], t } const tn = new Map, en = new Set; function sn(t, e) { let i = tn.get(t); return i || (i = e(), tn.set(t, i), en.add(i)), i } const nn = (t, e, i) => { const s = y(e, i); void 0 !== s && t.add(s) }; class on { constructor(t) { this._config = function (t) { return (t = t || {}).data = Qs(t.data), Js(t), t }(t), this._scopeCache = new Map, this._resolverCache = new Map } get platform() { return this._config.platform } get type() { return this._config.type } set type(t) { this._config.type = t } get data() { return this._config.data } set data(t) { this._config.data = Qs(t) } get options() { return this._config.options } set options(t) { this._config.options = t } get plugins() { return this._config.plugins } update() { const t = this._config; this.clearCache(), Js(t) } clearCache() { this._scopeCache.clear(), this._resolverCache.clear() } datasetScopeKeys(t) { return sn(t, (() => [[`datasets.${t}`, ""]])) } datasetAnimationScopeKeys(t, e) { return sn(`${t}.transition.${e}`, (() => [[`datasets.${t}.transitions.${e}`, `transitions.${e}`], [`datasets.${t}`, ""]])) } datasetElementScopeKeys(t, e) { return sn(`${t}-${e}`, (() => [[`datasets.${t}.elements.${e}`, `datasets.${t}`, `elements.${e}`, ""]])) } pluginScopeKeys(t) { const e = t.id; return sn(`${this.type}-plugin-${e}`, (() => [[`plugins.${e}`, ...t.additionalOptionScopes || []]])) } _cachedScopes(t, e) { const i = this._scopeCache; let s = i.get(t); return s && !e || (s = new Map, i.set(t, s)), s } getOptionScopes(t, e, i) { const { options: s, type: n } = this, o = this._cachedScopes(t, i), a = o.get(e); if (a) return a; const r = new Set; e.forEach((e => { t && (r.add(t), e.forEach((e => nn(r, t, e)))), e.forEach((t => nn(r, s, t))), e.forEach((t => nn(r, te[n] || {}, t))), e.forEach((t => nn(r, ne, t))), e.forEach((t => nn(r, ee, t))) })); const l = Array.from(r); return 0 === l.length && l.push(Object.create(null)), en.has(e) && o.set(e, l), l } chartOptionScopes() { const { options: t, type: e } = this; return [t, te[e] || {}, ne.datasets[e] || {}, { type: e }, ne, ee] } resolveNamedOptions(t, e, i, n = [""]) { const o = { $shared: !0 }, { resolver: a, subPrefixes: r } = an(this._resolverCache, t, n); let l = a; if (function (t, e) { const { isScriptable: i, isIndexable: n } = Ie(t); for (const o of e) { const e = i(o), a = n(o), r = (a || e) && t[o]; if (e && (k(r) || rn(r)) || a && s(r)) return !0 } return !1 }(a, e)) { o.$shared = !1; l = Re(a, i = k(i) ? i() : i, this.createResolver(t, i, r)) } for (const t of e) o[t] = l[t]; return o } createResolver(t, e, i = [""], s) { const { resolver: o } = an(this._resolverCache, t, i); return n(e) ? Re(o, e, void 0, s) : o } } function an(t, e, i) { let s = t.get(e); s || (s = new Map, t.set(e, s)); const n = i.join(); let o = s.get(n); if (!o) { o = { resolver: Ee(e, i), subPrefixes: i.filter((t => !t.toLowerCase().includes("hover"))) }, s.set(n, o) } return o } const rn = t => n(t) && Object.getOwnPropertyNames(t).reduce(((e, i) => e || k(t[i])), !1); const ln = ["top", "bottom", "left", "right", "chartArea"]; function hn(t, e) { return "top" === t || "bottom" === t || -1 === ln.indexOf(t) && "x" === e } function cn(t, e) { return function (i, s) { return i[t] === s[t] ? i[e] - s[e] : i[t] - s[t] } } function dn(t) { const e = t.chart, i = e.options.animation; e.notifyPlugins("afterRender"), c(i && i.onComplete, [t], e) } function un(t) { const e = t.chart, i = e.options.animation; c(i && i.onProgress, [t], e) } function fn(t) { return oe() && "string" == typeof t ? t = document.getElementById(t) : t && t.length && (t = t[0]), t && t.canvas && (t = t.canvas), t } const gn = {}, pn = t => { const e = fn(t); return Object.values(gn).filter((t => t.canvas === e)).pop() }; function mn(t, e, i) { const s = Object.keys(t); for (const n of s) { const s = +n; if (s >= e) { const o = t[n]; delete t[n], (i > 0 || s > e) && (t[s + i] = o) } } } class bn { constructor(t, i) { const s = this.config = new on(i), n = fn(t), o = pn(n); if (o) throw new Error("Canvas is already in use. Chart with ID '" + o.id + "' must be destroyed before the canvas with ID '" + o.canvas.id + "' can be reused."); const a = s.createResolver(s.chartOptionScopes(), this.getContext()); this.platform = new (s.platform || gs(n)), this.platform.updateConfig(s); const r = this.platform.acquireContext(n, a.aspectRatio), l = r && r.canvas, h = l && l.height, c = l && l.width; this.id = e(), this.ctx = r, this.canvas = l, this.width = c, this.height = h, this._options = a, this._aspectRatio = this.aspectRatio, this._layers = [], this._metasets = [], this._stacks = void 0, this.boxes = [], this.currentDevicePixelRatio = void 0, this.chartArea = void 0, this._active = [], this._lastEvent = void 0, this._listeners = {}, this._responsiveListeners = void 0, this._sortedMetasets = [], this.scales = {}, this._plugins = new Xs, this.$proxies = {}, this._hiddenIndices = {}, this.attached = !1, this._animationsDisabled = void 0, this.$context = void 0, this._doResize = ct((t => this.update(t)), a.resizeDelay || 0), this._dataChanges = [], gn[this.id] = this, r && l ? (mt.listen(this, "complete", dn), mt.listen(this, "progress", un), this._initialize(), this.attached && this.update()) : console.error("Failed to create chart: can't acquire context from the given item") } get aspectRatio() { const { options: { aspectRatio: t, maintainAspectRatio: e }, width: s, height: n, _aspectRatio: o } = this; return i(t) ? e && o ? o : n ? s / n : null : t } get data() { return this.config.data } set data(t) { this.config.data = t } get options() { return this._options } set options(t) { this.config.options = t } _initialize() { return this.notifyPlugins("beforeInit"), this.options.responsive ? this.resize() : pe(this, this.options.devicePixelRatio), this.bindEvents(), this.notifyPlugins("afterInit"), this } clear() { return we(this.canvas, this.ctx), this } stop() { return mt.stop(this), this } resize(t, e) { mt.running(this) ? this._resizeBeforeDraw = { width: t, height: e } : this._resize(t, e) } _resize(t, e) { const i = this.options, s = this.canvas, n = i.maintainAspectRatio && this.aspectRatio, o = this.platform.getMaximumSize(s, t, e, n), a = i.devicePixelRatio || this.platform.getDevicePixelRatio(), r = this.width ? "resize" : "attach"; this.width = o.width, this.height = o.height, this._aspectRatio = this.aspectRatio, pe(this, a, !0) && (this.notifyPlugins("resize", { size: o }), c(i.onResize, [this, o], this), this.attached && this._doResize(r) && this.render()) } ensureScalesHaveIDs() { d(this.options.scales || {}, ((t, e) => { t.id = e })) } buildOrUpdateScales() { const t = this.options, e = t.scales, i = this.scales, s = Object.keys(i).reduce(((t, e) => (t[e] = !1, t)), {}); let n = []; e && (n = n.concat(Object.keys(e).map((t => { const i = e[t], s = Zs(t, i), n = "r" === s, o = "x" === s; return { options: i, dposition: n ? "chartArea" : o ? "bottom" : "left", dtype: n ? "radialLinear" : o ? "category" : "linear" } })))), d(n, (e => { const n = e.options, o = n.id, a = Zs(o, n), l = r(n.type, e.dtype); void 0 !== n.position && hn(n.position, a) === hn(e.dposition) || (n.position = e.dposition), s[o] = !0; let h = null; if (o in i && i[o].type === l) h = i[o]; else { h = new (Us.getScale(l))({ id: o, type: l, ctx: this.ctx, chart: this }), i[h.id] = h } h.init(n, t) })), d(s, ((t, e) => { t || delete i[e] })), d(i, (t => { Zi.configure(this, t, t.options), Zi.addBox(this, t) })) } _updateMetasets() { const t = this._metasets, e = this.data.datasets.length, i = t.length; if (t.sort(((t, e) => t.index - e.index)), i > e) { for (let t = e; t < i; ++t)this._destroyDatasetMeta(t); t.splice(e, i - e) } this._sortedMetasets = t.slice(0).sort(cn("order", "index")) } _removeUnreferencedMetasets() { const { _metasets: t, data: { datasets: e } } = this; t.length > e.length && delete this._stacks, t.forEach(((t, i) => { 0 === e.filter((e => e === t._dataset)).length && this._destroyDatasetMeta(i) })) } buildOrUpdateControllers() { const t = [], e = this.data.datasets; let i, s; for (this._removeUnreferencedMetasets(), i = 0, s = e.length; i < s; i++) { const s = e[i]; let n = this.getDatasetMeta(i); const o = s.type || this.config.type; if (n.type && n.type !== o && (this._destroyDatasetMeta(i), n = this.getDatasetMeta(i)), n.type = o, n.indexAxis = s.indexAxis || Gs(o, this.options), n.order = s.order || 0, n.index = i, n.label = "" + s.label, n.visible = this.isDatasetVisible(i), n.controller) n.controller.updateIndex(i), n.controller.linkScales(); else { const e = Us.getController(o), { datasetElementType: s, dataElementType: a } = ne.datasets[o]; Object.assign(e.prototype, { dataElementType: Us.getElement(a), datasetElementType: s && Us.getElement(s) }), n.controller = new e(this, i), t.push(n.controller) } } return this._updateMetasets(), t } _resetElements() { d(this.data.datasets, ((t, e) => { this.getDatasetMeta(e).controller.reset() }), this) } reset() { this._resetElements(), this.notifyPlugins("reset") } update(t) { const e = this.config; e.update(); const i = this._options = e.createResolver(e.chartOptionScopes(), this.getContext()), s = this._animationsDisabled = !i.animation; if (this._updateScales(), this._checkEventBindings(), this._updateHiddenIndices(), this._plugins.invalidate(), !1 === this.notifyPlugins("beforeUpdate", { mode: t, cancelable: !0 })) return; const n = this.buildOrUpdateControllers(); this.notifyPlugins("beforeElementsUpdate"); let o = 0; for (let t = 0, e = this.data.datasets.length; t < e; t++) { const { controller: e } = this.getDatasetMeta(t), i = !s && -1 === n.indexOf(e); e.buildOrUpdateElements(i), o = Math.max(+e.getMaxOverflow(), o) } o = this._minPadding = i.layout.autoPadding ? o : 0, this._updateLayout(o), s || d(n, (t => { t.reset() })), this._updateDatasets(t), this.notifyPlugins("afterUpdate", { mode: t }), this._layers.sort(cn("z", "_idx")); const { _active: a, _lastEvent: r } = this; r ? this._eventHandler(r, !0) : a.length && this._updateHoverStyles(a, a, !0), this.render() } _updateScales() { d(this.scales, (t => { Zi.removeBox(this, t) })), this.ensureScalesHaveIDs(), this.buildOrUpdateScales() } _checkEventBindings() { const t = this.options, e = new Set(Object.keys(this._listeners)), i = new Set(t.events); S(e, i) && !!this._responsiveListeners === t.responsive || (this.unbindEvents(), this.bindEvents()) } _updateHiddenIndices() { const { _hiddenIndices: t } = this, e = this._getUniformDataChanges() || []; for (const { method: i, start: s, count: n } of e) { mn(t, s, "_removeElements" === i ? -n : n) } } _getUniformDataChanges() { const t = this._dataChanges; if (!t || !t.length) return; this._dataChanges = []; const e = this.data.datasets.length, i = e => new Set(t.filter((t => t[0] === e)).map(((t, e) => e + "," + t.splice(1).join(",")))), s = i(0); for (let t = 1; t < e; t++)if (!S(s, i(t))) return; return Array.from(s).map((t => t.split(","))).map((t => ({ method: t[1], start: +t[2], count: +t[3] }))) } _updateLayout(t) { if (!1 === this.notifyPlugins("beforeLayout", { cancelable: !0 })) return; Zi.update(this, this.width, this.height, t); const e = this.chartArea, i = e.width <= 0 || e.height <= 0; this._layers = [], d(this.boxes, (t => { i && "chartArea" === t.position || (t.configure && t.configure(), this._layers.push(...t._layers())) }), this), this._layers.forEach(((t, e) => { t._idx = e })), this.notifyPlugins("afterLayout") } _updateDatasets(t) { if (!1 !== this.notifyPlugins("beforeDatasetsUpdate", { mode: t, cancelable: !0 })) { for (let t = 0, e = this.data.datasets.length; t < e; ++t)this.getDatasetMeta(t).controller.configure(); for (let e = 0, i = this.data.datasets.length; e < i; ++e)this._updateDataset(e, k(t) ? t({ datasetIndex: e }) : t); this.notifyPlugins("afterDatasetsUpdate", { mode: t }) } } _updateDataset(t, e) { const i = this.getDatasetMeta(t), s = { meta: i, index: t, mode: e, cancelable: !0 }; !1 !== this.notifyPlugins("beforeDatasetUpdate", s) && (i.controller._update(e), s.cancelable = !1, this.notifyPlugins("afterDatasetUpdate", s)) } render() { !1 !== this.notifyPlugins("beforeRender", { cancelable: !0 }) && (mt.has(this) ? this.attached && !mt.running(this) && mt.start(this) : (this.draw(), dn({ chart: this }))) } draw() { let t; if (this._resizeBeforeDraw) { const { width: t, height: e } = this._resizeBeforeDraw; this._resize(t, e), this._resizeBeforeDraw = null } if (this.clear(), this.width <= 0 || this.height <= 0) return; if (!1 === this.notifyPlugins("beforeDraw", { cancelable: !0 })) return; const e = this._layers; for (t = 0; t < e.length && e[t].z <= 0; ++t)e[t].draw(this.chartArea); for (this._drawDatasets(); t < e.length; ++t)e[t].draw(this.chartArea); this.notifyPlugins("afterDraw") } _getSortedDatasetMetas(t) { const e = this._sortedMetasets, i = []; let s, n; for (s = 0, n = e.length; s < n; ++s) { const n = e[s]; t && !n.visible || i.push(n) } return i } getSortedVisibleDatasetMetas() { return this._getSortedDatasetMetas(!0) } _drawDatasets() { if (!1 === this.notifyPlugins("beforeDatasetsDraw", { cancelable: !0 })) return; const t = this.getSortedVisibleDatasetMetas(); for (let e = t.length - 1; e >= 0; --e)this._drawDataset(t[e]); this.notifyPlugins("afterDatasetsDraw") } _drawDataset(t) { const e = this.ctx, i = t._clip, s = !i.disabled, n = this.chartArea, o = { meta: t, index: t.index, cancelable: !0 }; !1 !== this.notifyPlugins("beforeDatasetDraw", o) && (s && Pe(e, { left: !1 === i.left ? 0 : n.left - i.left, right: !1 === i.right ? this.width : n.right + i.right, top: !1 === i.top ? 0 : n.top - i.top, bottom: !1 === i.bottom ? this.height : n.bottom + i.bottom }), t.controller.draw(), s && De(e), o.cancelable = !1, this.notifyPlugins("afterDatasetDraw", o)) } isPointInArea(t) { return Se(t, this.chartArea, this._minPadding) } getElementsAtEventForMode(t, e, i, s) { const n = Vi.modes[e]; return "function" == typeof n ? n(this, t, i, s) : [] } getDatasetMeta(t) { const e = this.data.datasets[t], i = this._metasets; let s = i.filter((t => t && t._dataset === e)).pop(); return s || (s = { type: null, data: [], dataset: null, controller: null, hidden: null, xAxisID: null, yAxisID: null, order: e && e.order || 0, index: t, _dataset: e, _parsed: [], _sorted: !1 }, i.push(s)), s } getContext() { return this.$context || (this.$context = _i(null, { chart: this, type: "chart" })) } getVisibleDatasetCount() { return this.getSortedVisibleDatasetMetas().length } isDatasetVisible(t) { const e = this.data.datasets[t]; if (!e) return !1; const i = this.getDatasetMeta(t); return "boolean" == typeof i.hidden ? !i.hidden : !e.hidden } setDatasetVisibility(t, e) { this.getDatasetMeta(t).hidden = !e } toggleDataVisibility(t) { this._hiddenIndices[t] = !this._hiddenIndices[t] } getDataVisibility(t) { return !this._hiddenIndices[t] } _updateVisibility(t, e, i) { const s = i ? "show" : "hide", n = this.getDatasetMeta(t), o = n.controller._resolveAnimations(void 0, s); M(e) ? (n.data[e].hidden = !i, this.update()) : (this.setDatasetVisibility(t, i), o.update(n, { visible: i }), this.update((e => e.datasetIndex === t ? s : void 0))) } hide(t, e) { this._updateVisibility(t, e, !1) } show(t, e) { this._updateVisibility(t, e, !0) } _destroyDatasetMeta(t) { const e = this._metasets[t]; e && e.controller && e.controller._destroy(), delete this._metasets[t] } _stop() { let t, e; for (this.stop(), mt.remove(this), t = 0, e = this.data.datasets.length; t < e; ++t)this._destroyDatasetMeta(t) } destroy() { this.notifyPlugins("beforeDestroy"); const { canvas: t, ctx: e } = this; this._stop(), this.config.clearCache(), t && (this.unbindEvents(), we(t, e), this.platform.releaseContext(e), this.canvas = null, this.ctx = null), this.notifyPlugins("destroy"), delete gn[this.id], this.notifyPlugins("afterDestroy") } toBase64Image(...t) { return this.canvas.toDataURL(...t) } bindEvents() { this.bindUserEvents(), this.options.responsive ? this.bindResponsiveEvents() : this.attached = !0 } bindUserEvents() { const t = this._listeners, e = this.platform, i = (i, s) => { e.addEventListener(this, i, s), t[i] = s }, s = (t, e, i) => { t.offsetX = e, t.offsetY = i, this._eventHandler(t) }; d(this.options.events, (t => i(t, s))) } bindResponsiveEvents() { this._responsiveListeners || (this._responsiveListeners = {}); const t = this._responsiveListeners, e = this.platform, i = (i, s) => { e.addEventListener(this, i, s), t[i] = s }, s = (i, s) => { t[i] && (e.removeEventListener(this, i, s), delete t[i]) }, n = (t, e) => { this.canvas && this.resize(t, e) }; let o; const a = () => { s("attach", a), this.attached = !0, this.resize(), i("resize", n), i("detach", o) }; o = () => { this.attached = !1, s("resize", n), this._stop(), this._resize(0, 0), i("attach", a) }, e.isAttached(this.canvas) ? a() : o() } unbindEvents() { d(this._listeners, ((t, e) => { this.platform.removeEventListener(this, e, t) })), this._listeners = {}, d(this._responsiveListeners, ((t, e) => { this.platform.removeEventListener(this, e, t) })), this._responsiveListeners = void 0 } updateHoverStyle(t, e, i) { const s = i ? "set" : "remove"; let n, o, a, r; for ("dataset" === e && (n = this.getDatasetMeta(t[0].datasetIndex), n.controller["_" + s + "DatasetHoverStyle"]()), a = 0, r = t.length; a < r; ++a) { o = t[a]; const e = o && this.getDatasetMeta(o.datasetIndex).controller; e && e[s + "HoverStyle"](o.element, o.datasetIndex, o.index) } } getActiveElements() { return this._active || [] } setActiveElements(t) { const e = this._active || [], i = t.map((({ datasetIndex: t, index: e }) => { const i = this.getDatasetMeta(t); if (!i) throw new Error("No dataset found at index " + t); return { datasetIndex: t, element: i.data[e], index: e } })); !u(i, e) && (this._active = i, this._lastEvent = null, this._updateHoverStyles(i, e)) } notifyPlugins(t, e, i) { return this._plugins.notify(this, t, e, i) } _updateHoverStyles(t, e, i) { const s = this.options.hover, n = (t, e) => t.filter((t => !e.some((e => t.datasetIndex === e.datasetIndex && t.index === e.index)))), o = n(e, t), a = i ? t : n(t, e); o.length && this.updateHoverStyle(o, s.mode, !1), a.length && s.mode && this.updateHoverStyle(a, s.mode, !0) } _eventHandler(t, e) { const i = { event: t, replay: e, cancelable: !0, inChartArea: this.isPointInArea(t) }, s = e => (e.options.events || this.options.events).includes(t.native.type); if (!1 === this.notifyPlugins("beforeEvent", i, s)) return; const n = this._handleEvent(t, e, i.inChartArea); return i.cancelable = !1, this.notifyPlugins("afterEvent", i, s), (n || i.changed) && this.render(), this } _handleEvent(t, e, i) { const { _active: s = [], options: n } = this, o = e, a = this._getActiveElements(t, s, i, o), r = P(t), l = function (t, e, i, s) { return i && "mouseout" !== t.type ? s ? e : t : null }(t, this._lastEvent, i, r); i && (this._lastEvent = null, c(n.onHover, [t, a, this], this), r && c(n.onClick, [t, a, this], this)); const h = !u(a, s); return (h || e) && (this._active = a, this._updateHoverStyles(a, s, e)), this._lastEvent = l, h } _getActiveElements(t, e, i, s) { if ("mouseout" === t.type) return []; if (!i) return e; const n = this.options.hover; return this.getElementsAtEventForMode(t, n.mode, n, s) } } const xn = () => d(bn.instances, (t => t._plugins.invalidate())), _n = !0; function yn() { throw new Error("This method is not implemented: Check that a complete date adapter is provided.") } Object.defineProperties(bn, { defaults: { enumerable: _n, value: ne }, instances: { enumerable: _n, value: gn }, overrides: { enumerable: _n, value: te }, registry: { enumerable: _n, value: Us }, version: { enumerable: _n, value: "3.9.0" }, getChart: { enumerable: _n, value: pn }, register: { enumerable: _n, value: (...t) => { Us.add(...t), xn() } }, unregister: { enumerable: _n, value: (...t) => { Us.remove(...t), xn() } } }); class vn { constructor(t) { this.options = t || {} } init(t) { } formats() { return yn() } parse(t, e) { return yn() } format(t, e) { return yn() } add(t, e, i) { return yn() } diff(t, e, i) { return yn() } startOf(t, e, i) { return yn() } endOf(t, e) { return yn() } } vn.override = function (t) { Object.assign(vn.prototype, t) }; var wn = { _date: vn }; function Mn(t) { const e = t.iScale, i = function (t, e) { if (!t._cache.$bar) { const i = t.getMatchingVisibleMetas(e); let s = []; for (let e = 0, n = i.length; e < n; e++)s = s.concat(i[e].controller.getAllParsedValues(t)); t._cache.$bar = rt(s.sort(((t, e) => t - e))) } return t._cache.$bar }(e, t.type); let s, n, o, a, r = e._length; const l = () => { 32767 !== o && -32768 !== o && (M(a) && (r = Math.min(r, Math.abs(o - a) || r)), a = o) }; for (s = 0, n = i.length; s < n; ++s)o = e.getPixelForValue(i[s]), l(); for (a = void 0, s = 0, n = e.ticks.length; s < n; ++s)o = e.getPixelForTick(s), l(); return r } function kn(t, e, i, n) { return s(t) ? function (t, e, i, s) { const n = i.parse(t[0], s), o = i.parse(t[1], s), a = Math.min(n, o), r = Math.max(n, o); let l = a, h = r; Math.abs(a) > Math.abs(r) && (l = r, h = a), e[i.axis] = h, e._custom = { barStart: l, barEnd: h, start: n, end: o, min: a, max: r } }(t, e, i, n) : e[i.axis] = i.parse(t, n), e } function Sn(t, e, i, s) { const n = t.iScale, o = t.vScale, a = n.getLabels(), r = n === o, l = []; let h, c, d, u; for (h = i, c = i + s; h < c; ++h)u = e[h], d = {}, d[n.axis] = r || n.parse(a[h], h), l.push(kn(u, d, o, h)); return l } function Pn(t) { return t && void 0 !== t.barStart && void 0 !== t.barEnd } function Dn(t, e, i, s) { let n = e.borderSkipped; const o = {}; if (!n) return void (t.borderSkipped = o); if (!0 === n) return void (t.borderSkipped = { top: !0, right: !0, bottom: !0, left: !0 }); const { start: a, end: r, reverse: l, top: h, bottom: c } = function (t) { let e, i, s, n, o; return t.horizontal ? (e = t.base > t.x, i = "left", s = "right") : (e = t.base < t.y, i = "bottom", s = "top"), e ? (n = "end", o = "start") : (n = "start", o = "end"), { start: i, end: s, reverse: e, top: n, bottom: o } }(t); "middle" === n && i && (t.enableBorderRadius = !0, (i._top || 0) === s ? n = h : (i._bottom || 0) === s ? n = c : (o[On(c, a, r, l)] = !0, n = h)), o[On(n, a, r, l)] = !0, t.borderSkipped = o } function On(t, e, i, s) { var n, o, a; return s ? (a = i, t = Cn(t = (n = t) === (o = e) ? a : n === a ? o : n, i, e)) : t = Cn(t, e, i), t } function Cn(t, e, i) { return "start" === t ? e : "end" === t ? i : t } function An(t, { inflateAmount: e }, i) { t.inflateAmount = "auto" === e ? 1 === i ? .33 : 0 : e } class Tn extends Ls { parsePrimitiveData(t, e, i, s) { return Sn(t, e, i, s) } parseArrayData(t, e, i, s) { return Sn(t, e, i, s) } parseObjectData(t, e, i, s) { const { iScale: n, vScale: o } = t, { xAxisKey: a = "x", yAxisKey: r = "y" } = this._parsing, l = "x" === n.axis ? a : r, h = "x" === o.axis ? a : r, c = []; let d, u, f, g; for (d = i, u = i + s; d < u; ++d)g = e[d], f = {}, f[n.axis] = n.parse(y(g, l), d), c.push(kn(y(g, h), f, o, d)); return c } updateRangeFromParsed(t, e, i, s) { super.updateRangeFromParsed(t, e, i, s); const n = i._custom; n && e === this._cachedMeta.vScale && (t.min = Math.min(t.min, n.min), t.max = Math.max(t.max, n.max)) } getMaxOverflow() { return 0 } getLabelAndValue(t) { const e = this._cachedMeta, { iScale: i, vScale: s } = e, n = this.getParsed(t), o = n._custom, a = Pn(o) ? "[" + o.start + ", " + o.end + "]" : "" + s.getLabelForValue(n[s.axis]); return { label: "" + i.getLabelForValue(n[i.axis]), value: a } } initialize() { this.enableOptionSharing = !0, super.initialize(); this._cachedMeta.stack = this.getDataset().stack } update(t) { const e = this._cachedMeta; this.updateElements(e.data, 0, e.data.length, t) } updateElements(t, e, s, n) { const o = "reset" === n, { index: a, _cachedMeta: { vScale: r } } = this, l = r.getBasePixel(), h = r.isHorizontal(), c = this._getRuler(), { sharedOptions: d, includeOptions: u } = this._getSharedOptions(e, n); for (let f = e; f < e + s; f++) { const e = this.getParsed(f), s = o || i(e[r.axis]) ? { base: l, head: l } : this._calculateBarValuePixels(f), g = this._calculateBarIndexPixels(f, c), p = (e._stacks || {})[r.axis], m = { horizontal: h, base: s.base, enableBorderRadius: !p || Pn(e._custom) || a === p._top || a === p._bottom, x: h ? s.head : g.center, y: h ? g.center : s.head, height: h ? g.size : Math.abs(s.size), width: h ? Math.abs(s.size) : g.size }; u && (m.options = d || this.resolveDataElementOptions(f, t[f].active ? "active" : n)); const b = m.options || t[f].options; Dn(m, b, p, a), An(m, b, c.ratio), this.updateElement(t[f], f, m, n) } } _getStacks(t, e) { const { iScale: s } = this._cachedMeta, n = s.getMatchingVisibleMetas(this._type).filter((t => t.controller.options.grouped)), o = s.options.stacked, a = [], r = t => { const s = t.controller.getParsed(e), n = s && s[t.vScale.axis]; if (i(n) || isNaN(n)) return !0 }; for (const i of n) if ((void 0 === e || !r(i)) && ((!1 === o || -1 === a.indexOf(i.stack) || void 0 === o && void 0 === i.stack) && a.push(i.stack), i.index === t)) break; return a.length || a.push(void 0), a } _getStackCount(t) { return this._getStacks(void 0, t).length } _getStackIndex(t, e, i) { const s = this._getStacks(t, i), n = void 0 !== e ? s.indexOf(e) : -1; return -1 === n ? s.length - 1 : n } _getRuler() { const t = this.options, e = this._cachedMeta, i = e.iScale, s = []; let n, o; for (n = 0, o = e.data.length; n < o; ++n)s.push(i.getPixelForValue(this.getParsed(n)[i.axis], n)); const a = t.barThickness; return { min: a || Mn(e), pixels: s, start: i._startPixel, end: i._endPixel, stackCount: this._getStackCount(), scale: i, grouped: t.grouped, ratio: a ? 1 : t.categoryPercentage * t.barPercentage } } _calculateBarValuePixels(t) { const { _cachedMeta: { vScale: e, _stacked: s }, options: { base: n, minBarLength: o } } = this, a = n || 0, r = this.getParsed(t), l = r._custom, h = Pn(l); let c, d, u = r[e.axis], f = 0, g = s ? this.applyStack(e, r, s) : u; g !== u && (f = g - u, g = u), h && (u = l.barStart, g = l.barEnd - l.barStart, 0 !== u && z(u) !== z(l.barEnd) && (f = 0), f += u); const p = i(n) || h ? f : n; let m = e.getPixelForValue(p); if (c = this.chart.getDataVisibility(t) ? e.getPixelForValue(f + g) : m, d = c - m, Math.abs(d) < o) { d = function (t, e, i) { return 0 !== t ? z(t) : (e.isHorizontal() ? 1 : -1) * (e.min >= i ? 1 : -1) }(d, e, a) * o, u === a && (m -= d / 2); const t = e.getPixelForDecimal(0), i = e.getPixelForDecimal(1), s = Math.min(t, i), n = Math.max(t, i); m = Math.max(Math.min(m, n), s), c = m + d } if (m === e.getPixelForValue(a)) { const t = z(d) * e.getLineWidthForValue(a) / 2; m += t, d -= t } return { size: d, base: m, head: c, center: c + d / 2 } } _calculateBarIndexPixels(t, e) { const s = e.scale, n = this.options, o = n.skipNull, a = r(n.maxBarThickness, 1 / 0); let l, h; if (e.grouped) { const s = o ? this._getStackCount(t) : e.stackCount, r = "flex" === n.barThickness ? function (t, e, i, s) { const n = e.pixels, o = n[t]; let a = t > 0 ? n[t - 1] : null, r = t < n.length - 1 ? n[t + 1] : null; const l = i.categoryPercentage; null === a && (a = o - (null === r ? e.end - e.start : r - o)), null === r && (r = o + o - a); const h = o - (o - Math.min(a, r)) / 2 * l; return { chunk: Math.abs(r - a) / 2 * l / s, ratio: i.barPercentage, start: h } }(t, e, n, s) : function (t, e, s, n) { const o = s.barThickness; let a, r; return i(o) ? (a = e.min * s.categoryPercentage, r = s.barPercentage) : (a = o * n, r = 1), { chunk: a / n, ratio: r, start: e.pixels[t] - a / 2 } }(t, e, n, s), c = this._getStackIndex(this.index, this._cachedMeta.stack, o ? t : void 0); l = r.start + r.chunk * c + r.chunk / 2, h = Math.min(a, r.chunk * r.ratio) } else l = s.getPixelForValue(this.getParsed(t)[s.axis], t), h = Math.min(a, e.min * e.ratio); return { base: l - h / 2, head: l + h / 2, center: l, size: h } } draw() { const t = this._cachedMeta, e = t.vScale, i = t.data, s = i.length; let n = 0; for (; n < s; ++n)null !== this.getParsed(n)[e.axis] && i[n].draw(this._ctx) } } Tn.id = "bar", Tn.defaults = { datasetElementType: !1, dataElementType: "bar", categoryPercentage: .8, barPercentage: .9, grouped: !0, animations: { numbers: { type: "number", properties: ["x", "y", "base", "width", "height"] } } }, Tn.overrides = { scales: { _index_: { type: "category", offset: !0, grid: { offset: !0 } }, _value_: { type: "linear", beginAtZero: !0 } } }; class Ln extends Ls { initialize() { this.enableOptionSharing = !0, super.initialize() } parsePrimitiveData(t, e, i, s) { const n = super.parsePrimitiveData(t, e, i, s); for (let t = 0; t < n.length; t++)n[t]._custom = this.resolveDataElementOptions(t + i).radius; return n } parseArrayData(t, e, i, s) { const n = super.parseArrayData(t, e, i, s); for (let t = 0; t < n.length; t++) { const s = e[i + t]; n[t]._custom = r(s[2], this.resolveDataElementOptions(t + i).radius) } return n } parseObjectData(t, e, i, s) { const n = super.parseObjectData(t, e, i, s); for (let t = 0; t < n.length; t++) { const s = e[i + t]; n[t]._custom = r(s && s.r && +s.r, this.resolveDataElementOptions(t + i).radius) } return n } getMaxOverflow() { const t = this._cachedMeta.data; let e = 0; for (let i = t.length - 1; i >= 0; --i)e = Math.max(e, t[i].size(this.resolveDataElementOptions(i)) / 2); return e > 0 && e } getLabelAndValue(t) { const e = this._cachedMeta, { xScale: i, yScale: s } = e, n = this.getParsed(t), o = i.getLabelForValue(n.x), a = s.getLabelForValue(n.y), r = n._custom; return { label: e.label, value: "(" + o + ", " + a + (r ? ", " + r : "") + ")" } } update(t) { const e = this._cachedMeta.data; this.updateElements(e, 0, e.length, t) } updateElements(t, e, i, s) { const n = "reset" === s, { iScale: o, vScale: a } = this._cachedMeta, { sharedOptions: r, includeOptions: l } = this._getSharedOptions(e, s), h = o.axis, c = a.axis; for (let d = e; d < e + i; d++) { const e = t[d], i = !n && this.getParsed(d), u = {}, f = u[h] = n ? o.getPixelForDecimal(.5) : o.getPixelForValue(i[h]), g = u[c] = n ? a.getBasePixel() : a.getPixelForValue(i[c]); u.skip = isNaN(f) || isNaN(g), l && (u.options = r || this.resolveDataElementOptions(d, e.active ? "active" : s), n && (u.options.radius = 0)), this.updateElement(e, d, u, s) } } resolveDataElementOptions(t, e) { const i = this.getParsed(t); let s = super.resolveDataElementOptions(t, e); s.$shared && (s = Object.assign({}, s, { $shared: !1 })); const n = s.radius; return "active" !== e && (s.radius = 0), s.radius += r(i && i._custom, n), s } } Ln.id = "bubble", Ln.defaults = { datasetElementType: !1, dataElementType: "point", animations: { numbers: { type: "number", properties: ["x", "y", "borderWidth", "radius"] } } }, Ln.overrides = { scales: { x: { type: "linear" }, y: { type: "linear" } }, plugins: { tooltip: { callbacks: { title: () => "" } } } }; class En extends Ls { constructor(t, e) { super(t, e), this.enableOptionSharing = !0, this.innerRadius = void 0, this.outerRadius = void 0, this.offsetX = void 0, this.offsetY = void 0 } linkScales() { } parse(t, e) { const i = this.getDataset().data, s = this._cachedMeta; if (!1 === this._parsing) s._parsed = i; else { let o, a, r = t => +i[t]; if (n(i[t])) { const { key: t = "value" } = this._parsing; r = e => +y(i[e], t) } for (o = t, a = t + e; o < a; ++o)s._parsed[o] = r(o) } } _getRotation() { return H(this.options.rotation - 90) } _getCircumference() { return H(this.options.circumference) } _getRotationExtents() { let t = O, e = -O; for (let i = 0; i < this.chart.data.datasets.length; ++i)if (this.chart.isDatasetVisible(i)) { const s = this.chart.getDatasetMeta(i).controller, n = s._getRotation(), o = s._getCircumference(); t = Math.min(t, n), e = Math.max(e, n + o) } return { rotation: t, circumference: e - t } } update(t) { const e = this.chart, { chartArea: i } = e, s = this._cachedMeta, n = s.data, o = this.getMaxBorderWidth() + this.getMaxOffset(n) + this.options.spacing, a = Math.max((Math.min(i.width, i.height) - o) / 2, 0), r = Math.min(l(this.options.cutout, a), 1), c = this._getRingWeight(this.index), { circumference: d, rotation: u } = this._getRotationExtents(), { ratioX: f, ratioY: g, offsetX: p, offsetY: m } = function (t, e, i) { let s = 1, n = 1, o = 0, a = 0; if (e < O) { const r = t, l = r + e, h = Math.cos(r), c = Math.sin(r), d = Math.cos(l), u = Math.sin(l), f = (t, e, s) => G(t, r, l, !0) ? 1 : Math.max(e, e * i, s, s * i), g = (t, e, s) => G(t, r, l, !0) ? -1 : Math.min(e, e * i, s, s * i), p = f(0, h, d), m = f(L, c, u), b = g(D, h, d), x = g(D + L, c, u); s = (p - b) / 2, n = (m - x) / 2, o = -(p + b) / 2, a = -(m + x) / 2 } return { ratioX: s, ratioY: n, offsetX: o, offsetY: a } }(u, d, r), b = (i.width - o) / f, x = (i.height - o) / g, _ = Math.max(Math.min(b, x) / 2, 0), y = h(this.options.radius, _), v = (y - Math.max(y * r, 0)) / this._getVisibleDatasetWeightTotal(); this.offsetX = p * y, this.offsetY = m * y, s.total = this.calculateTotal(), this.outerRadius = y - v * this._getRingWeightOffset(this.index), this.innerRadius = Math.max(this.outerRadius - v * c, 0), this.updateElements(n, 0, n.length, t) } _circumference(t, e) { const i = this.options, s = this._cachedMeta, n = this._getCircumference(); return e && i.animation.animateRotate || !this.chart.getDataVisibility(t) || null === s._parsed[t] || s.data[t].hidden ? 0 : this.calculateCircumference(s._parsed[t] * n / O) } updateElements(t, e, i, s) { const n = "reset" === s, o = this.chart, a = o.chartArea, r = o.options.animation, l = (a.left + a.right) / 2, h = (a.top + a.bottom) / 2, c = n && r.animateScale, d = c ? 0 : this.innerRadius, u = c ? 0 : this.outerRadius, { sharedOptions: f, includeOptions: g } = this._getSharedOptions(e, s); let p, m = this._getRotation(); for (p = 0; p < e; ++p)m += this._circumference(p, n); for (p = e; p < e + i; ++p) { const e = this._circumference(p, n), i = t[p], o = { x: l + this.offsetX, y: h + this.offsetY, startAngle: m, endAngle: m + e, circumference: e, outerRadius: u, innerRadius: d }; g && (o.options = f || this.resolveDataElementOptions(p, i.active ? "active" : s)), m += e, this.updateElement(i, p, o, s) } } calculateTotal() { const t = this._cachedMeta, e = t.data; let i, s = 0; for (i = 0; i < e.length; i++) { const n = t._parsed[i]; null === n || isNaN(n) || !this.chart.getDataVisibility(i) || e[i].hidden || (s += Math.abs(n)) } return s } calculateCircumference(t) { const e = this._cachedMeta.total; return e > 0 && !isNaN(t) ? O * (Math.abs(t) / e) : 0 } getLabelAndValue(t) { const e = this._cachedMeta, i = this.chart, s = i.data.labels || [], n = li(e._parsed[t], i.options.locale); return { label: s[t] || "", value: n } } getMaxBorderWidth(t) { let e = 0; const i = this.chart; let s, n, o, a, r; if (!t) for (s = 0, n = i.data.datasets.length; s < n; ++s)if (i.isDatasetVisible(s)) { o = i.getDatasetMeta(s), t = o.data, a = o.controller; break } if (!t) return 0; for (s = 0, n = t.length; s < n; ++s)r = a.resolveDataElementOptions(s), "inner" !== r.borderAlign && (e = Math.max(e, r.borderWidth || 0, r.hoverBorderWidth || 0)); return e } getMaxOffset(t) { let e = 0; for (let i = 0, s = t.length; i < s; ++i) { const t = this.resolveDataElementOptions(i); e = Math.max(e, t.offset || 0, t.hoverOffset || 0) } return e } _getRingWeightOffset(t) { let e = 0; for (let i = 0; i < t; ++i)this.chart.isDatasetVisible(i) && (e += this._getRingWeight(i)); return e } _getRingWeight(t) { return Math.max(r(this.chart.data.datasets[t].weight, 1), 0) } _getVisibleDatasetWeightTotal() { return this._getRingWeightOffset(this.chart.data.datasets.length) || 1 } } En.id = "doughnut", En.defaults = { datasetElementType: !1, dataElementType: "arc", animation: { animateRotate: !0, animateScale: !1 }, animations: { numbers: { type: "number", properties: ["circumference", "endAngle", "innerRadius", "outerRadius", "startAngle", "x", "y", "offset", "borderWidth", "spacing"] } }, cutout: "50%", rotation: 0, circumference: 360, radius: "100%", spacing: 0, indexAxis: "r" }, En.descriptors = { _scriptable: t => "spacing" !== t, _indexable: t => "spacing" !== t }, En.overrides = { aspectRatio: 1, plugins: { legend: { labels: { generateLabels(t) { const e = t.data; if (e.labels.length && e.datasets.length) { const { labels: { pointStyle: i } } = t.legend.options; return e.labels.map(((e, s) => { const n = t.getDatasetMeta(0).controller.getStyle(s); return { text: e, fillStyle: n.backgroundColor, strokeStyle: n.borderColor, lineWidth: n.borderWidth, pointStyle: i, hidden: !t.getDataVisibility(s), index: s } })) } return [] } }, onClick(t, e, i) { i.chart.toggleDataVisibility(e.index), i.chart.update() } }, tooltip: { callbacks: { title: () => "", label(t) { let e = t.label; const i = ": " + t.formattedValue; return s(e) ? (e = e.slice(), e[0] += i) : e += i, e } } } } }; class Rn extends Ls { initialize() { this.enableOptionSharing = !0, this.supportsDecimation = !0, super.initialize() } update(t) { const e = this._cachedMeta, { dataset: i, data: s = [], _dataset: n } = e, o = this.chart._animationsDisabled; let { start: a, count: r } = gt(e, s, o); this._drawStart = a, this._drawCount = r, pt(e) && (a = 0, r = s.length), i._chart = this.chart, i._datasetIndex = this.index, i._decimated = !!n._decimated, i.points = s; const l = this.resolveDatasetElementOptions(t); this.options.showLine || (l.borderWidth = 0), l.segment = this.options.segment, this.updateElement(i, void 0, { animated: !o, options: l }, t), this.updateElements(s, a, r, t) } updateElements(t, e, s, n) { const o = "reset" === n, { iScale: a, vScale: r, _stacked: l, _dataset: h } = this._cachedMeta, { sharedOptions: c, includeOptions: d } = this._getSharedOptions(e, n), u = a.axis, f = r.axis, { spanGaps: g, segment: p } = this.options, m = B(g) ? g : Number.POSITIVE_INFINITY, b = this.chart._animationsDisabled || o || "none" === n; let x = e > 0 && this.getParsed(e - 1); for (let g = e; g < e + s; ++g) { const e = t[g], s = this.getParsed(g), _ = b ? e : {}, y = i(s[f]), v = _[u] = a.getPixelForValue(s[u], g), w = _[f] = o || y ? r.getBasePixel() : r.getPixelForValue(l ? this.applyStack(r, s, l) : s[f], g); _.skip = isNaN(v) || isNaN(w) || y, _.stop = g > 0 && Math.abs(s[u] - x[u]) > m, p && (_.parsed = s, _.raw = h.data[g]), d && (_.options = c || this.resolveDataElementOptions(g, e.active ? "active" : n)), b || this.updateElement(e, g, _, n), x = s } } getMaxOverflow() { const t = this._cachedMeta, e = t.dataset, i = e.options && e.options.borderWidth || 0, s = t.data || []; if (!s.length) return i; const n = s[0].size(this.resolveDataElementOptions(0)), o = s[s.length - 1].size(this.resolveDataElementOptions(s.length - 1)); return Math.max(i, n, o) / 2 } draw() { const t = this._cachedMeta; t.dataset.updateControlPoints(this.chart.chartArea, t.iScale.axis), super.draw() } } Rn.id = "line", Rn.defaults = { datasetElementType: "line", dataElementType: "point", showLine: !0, spanGaps: !1 }, Rn.overrides = { scales: { _index_: { type: "category" }, _value_: { type: "linear" } } }; class In extends Ls { constructor(t, e) { super(t, e), this.innerRadius = void 0, this.outerRadius = void 0 } getLabelAndValue(t) { const e = this._cachedMeta, i = this.chart, s = i.data.labels || [], n = li(e._parsed[t].r, i.options.locale); return { label: s[t] || "", value: n } } parseObjectData(t, e, i, s) { return Ue.bind(this)(t, e, i, s) } update(t) { const e = this._cachedMeta.data; this._updateRadius(), this.updateElements(e, 0, e.length, t) } getMinMax() { const t = this._cachedMeta, e = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }; return t.data.forEach(((t, i) => { const s = this.getParsed(i).r; !isNaN(s) && this.chart.getDataVisibility(i) && (s < e.min && (e.min = s), s > e.max && (e.max = s)) })), e } _updateRadius() { const t = this.chart, e = t.chartArea, i = t.options, s = Math.min(e.right - e.left, e.bottom - e.top), n = Math.max(s / 2, 0), o = (n - Math.max(i.cutoutPercentage ? n / 100 * i.cutoutPercentage : 1, 0)) / t.getVisibleDatasetCount(); this.outerRadius = n - o * this.index, this.innerRadius = this.outerRadius - o } updateElements(t, e, i, s) { const n = "reset" === s, o = this.chart, a = o.options.animation, r = this._cachedMeta.rScale, l = r.xCenter, h = r.yCenter, c = r.getIndexAngle(0) - .5 * D; let d, u = c; const f = 360 / this.countVisibleElements(); for (d = 0; d < e; ++d)u += this._computeAngle(d, s, f); for (d = e; d < e + i; d++) { const e = t[d]; let i = u, g = u + this._computeAngle(d, s, f), p = o.getDataVisibility(d) ? r.getDistanceFromCenterForValue(this.getParsed(d).r) : 0; u = g, n && (a.animateScale && (p = 0), a.animateRotate && (i = g = c)); const m = { x: l, y: h, innerRadius: 0, outerRadius: p, startAngle: i, endAngle: g, options: this.resolveDataElementOptions(d, e.active ? "active" : s) }; this.updateElement(e, d, m, s) } } countVisibleElements() { const t = this._cachedMeta; let e = 0; return t.data.forEach(((t, i) => { !isNaN(this.getParsed(i).r) && this.chart.getDataVisibility(i) && e++ })), e } _computeAngle(t, e, i) { return this.chart.getDataVisibility(t) ? H(this.resolveDataElementOptions(t, e).angle || i) : 0 } } In.id = "polarArea", In.defaults = { dataElementType: "arc", animation: { animateRotate: !0, animateScale: !0 }, animations: { numbers: { type: "number", properties: ["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"] } }, indexAxis: "r", startAngle: 0 }, In.overrides = { aspectRatio: 1, plugins: { legend: { labels: { generateLabels(t) { const e = t.data; if (e.labels.length && e.datasets.length) { const { labels: { pointStyle: i } } = t.legend.options; return e.labels.map(((e, s) => { const n = t.getDatasetMeta(0).controller.getStyle(s); return { text: e, fillStyle: n.backgroundColor, strokeStyle: n.borderColor, lineWidth: n.borderWidth, pointStyle: i, hidden: !t.getDataVisibility(s), index: s } })) } return [] } }, onClick(t, e, i) { i.chart.toggleDataVisibility(e.index), i.chart.update() } }, tooltip: { callbacks: { title: () => "", label: t => t.chart.data.labels[t.dataIndex] + ": " + t.formattedValue } } }, scales: { r: { type: "radialLinear", angleLines: { display: !1 }, beginAtZero: !0, grid: { circular: !0 }, pointLabels: { display: !1 }, startAngle: 0 } } }; class zn extends En { } zn.id = "pie", zn.defaults = { cutout: 0, rotation: 0, circumference: 360, radius: "100%" }; class Fn extends Ls { getLabelAndValue(t) { const e = this._cachedMeta.vScale, i = this.getParsed(t); return { label: e.getLabels()[t], value: "" + e.getLabelForValue(i[e.axis]) } } parseObjectData(t, e, i, s) { return Ue.bind(this)(t, e, i, s) } update(t) { const e = this._cachedMeta, i = e.dataset, s = e.data || [], n = e.iScale.getLabels(); if (i.points = s, "resize" !== t) { const e = this.resolveDatasetElementOptions(t); this.options.showLine || (e.borderWidth = 0); const o = { _loop: !0, _fullLoop: n.length === s.length, options: e }; this.updateElement(i, void 0, o, t) } this.updateElements(s, 0, s.length, t) } updateElements(t, e, i, s) { const n = this._cachedMeta.rScale, o = "reset" === s; for (let a = e; a < e + i; a++) { const e = t[a], i = this.resolveDataElementOptions(a, e.active ? "active" : s), r = n.getPointPositionForValue(a, this.getParsed(a).r), l = o ? n.xCenter : r.x, h = o ? n.yCenter : r.y, c = { x: l, y: h, angle: r.angle, skip: isNaN(l) || isNaN(h), options: i }; this.updateElement(e, a, c, s) } } } Fn.id = "radar", Fn.defaults = { datasetElementType: "line", dataElementType: "point", indexAxis: "r", showLine: !0, elements: { line: { fill: "start" } } }, Fn.overrides = { aspectRatio: 1, scales: { r: { type: "radialLinear" } } }; class Vn extends Ls { update(t) { const e = this._cachedMeta, { data: i = [] } = e, s = this.chart._animationsDisabled; let { start: n, count: o } = gt(e, i, s); if (this._drawStart = n, this._drawCount = o, pt(e) && (n = 0, o = i.length), this.options.showLine) { const { dataset: n, _dataset: o } = e; n._chart = this.chart, n._datasetIndex = this.index, n._decimated = !!o._decimated, n.points = i; const a = this.resolveDatasetElementOptions(t); a.segment = this.options.segment, this.updateElement(n, void 0, { animated: !s, options: a }, t) } this.updateElements(i, n, o, t) } addElements() { const { showLine: t } = this.options; !this.datasetElementType && t && (this.datasetElementType = Us.getElement("line")), super.addElements() } updateElements(t, e, s, n) { const o = "reset" === n, { iScale: a, vScale: r, _stacked: l, _dataset: h } = this._cachedMeta, c = this.resolveDataElementOptions(e, n), d = this.getSharedOptions(c), u = this.includeOptions(n, d), f = a.axis, g = r.axis, { spanGaps: p, segment: m } = this.options, b = B(p) ? p : Number.POSITIVE_INFINITY, x = this.chart._animationsDisabled || o || "none" === n; let _ = e > 0 && this.getParsed(e - 1); for (let c = e; c < e + s; ++c) { const e = t[c], s = this.getParsed(c), p = x ? e : {}, y = i(s[g]), v = p[f] = a.getPixelForValue(s[f], c), w = p[g] = o || y ? r.getBasePixel() : r.getPixelForValue(l ? this.applyStack(r, s, l) : s[g], c); p.skip = isNaN(v) || isNaN(w) || y, p.stop = c > 0 && Math.abs(s[f] - _[f]) > b, m && (p.parsed = s, p.raw = h.data[c]), u && (p.options = d || this.resolveDataElementOptions(c, e.active ? "active" : n)), x || this.updateElement(e, c, p, n), _ = s } this.updateSharedOptions(d, n, c) } getMaxOverflow() { const t = this._cachedMeta, e = t.data || []; if (!this.options.showLine) { let t = 0; for (let i = e.length - 1; i >= 0; --i)t = Math.max(t, e[i].size(this.resolveDataElementOptions(i)) / 2); return t > 0 && t } const i = t.dataset, s = i.options && i.options.borderWidth || 0; if (!e.length) return s; const n = e[0].size(this.resolveDataElementOptions(0)), o = e[e.length - 1].size(this.resolveDataElementOptions(e.length - 1)); return Math.max(s, n, o) / 2 } } Vn.id = "scatter", Vn.defaults = { datasetElementType: !1, dataElementType: "point", showLine: !1, fill: !1 }, Vn.overrides = { interaction: { mode: "point" }, plugins: { tooltip: { callbacks: { title: () => "", label: t => "(" + t.label + ", " + t.formattedValue + ")" } } }, scales: { x: { type: "linear" }, y: { type: "linear" } } }; var Bn = Object.freeze({ __proto__: null, BarController: Tn, BubbleController: Ln, DoughnutController: En, LineController: Rn, PolarAreaController: In, PieController: zn, RadarController: Fn, ScatterController: Vn }); function Nn(t, e, i) { const { startAngle: s, pixelMargin: n, x: o, y: a, outerRadius: r, innerRadius: l } = e; let h = n / r; t.beginPath(), t.arc(o, a, r, s - h, i + h), l > n ? (h = n / l, t.arc(o, a, l, i + h, s - h, !0)) : t.arc(o, a, n, i + L, s - L), t.closePath(), t.clip() } function Wn(t, e, i, s) { const n = ui(t.options.borderRadius, ["outerStart", "outerEnd", "innerStart", "innerEnd"]); const o = (i - e) / 2, a = Math.min(o, s * e / 2), r = t => { const e = (i - Math.min(o, t)) * s / 2; return Z(t, 0, Math.min(o, e)) }; return { outerStart: r(n.outerStart), outerEnd: r(n.outerEnd), innerStart: Z(n.innerStart, 0, a), innerEnd: Z(n.innerEnd, 0, a) } } function jn(t, e, i, s) { return { x: i + t * Math.cos(e), y: s + t * Math.sin(e) } } function Hn(t, e, i, s, n, o) { const { x: a, y: r, startAngle: l, pixelMargin: h, innerRadius: c } = e, d = Math.max(e.outerRadius + s + i - h, 0), u = c > 0 ? c + s + i + h : 0; let f = 0; const g = n - l; if (s) { const t = ((c > 0 ? c - s : 0) + (d > 0 ? d - s : 0)) / 2; f = (g - (0 !== t ? g * t / (t + s) : g)) / 2 } const p = (g - Math.max(.001, g * d - i / D) / d) / 2, m = l + p + f, b = n - p - f, { outerStart: x, outerEnd: _, innerStart: y, innerEnd: v } = Wn(e, u, d, b - m), w = d - x, M = d - _, k = m + x / w, S = b - _ / M, P = u + y, O = u + v, C = m + y / P, A = b - v / O; if (t.beginPath(), o) { if (t.arc(a, r, d, k, S), _ > 0) { const e = jn(M, S, a, r); t.arc(e.x, e.y, _, S, b + L) } const e = jn(O, b, a, r); if (t.lineTo(e.x, e.y), v > 0) { const e = jn(O, A, a, r); t.arc(e.x, e.y, v, b + L, A + Math.PI) } if (t.arc(a, r, u, b - v / u, m + y / u, !0), y > 0) { const e = jn(P, C, a, r); t.arc(e.x, e.y, y, C + Math.PI, m - L) } const i = jn(w, m, a, r); if (t.lineTo(i.x, i.y), x > 0) { const e = jn(w, k, a, r); t.arc(e.x, e.y, x, m - L, k) } } else { t.moveTo(a, r); const e = Math.cos(k) * d + a, i = Math.sin(k) * d + r; t.lineTo(e, i); const s = Math.cos(S) * d + a, n = Math.sin(S) * d + r; t.lineTo(s, n) } t.closePath() } function $n(t, e, i, s, n, o) { const { options: a } = e, { borderWidth: r, borderJoinStyle: l } = a, h = "inner" === a.borderAlign; r && (h ? (t.lineWidth = 2 * r, t.lineJoin = l || "round") : (t.lineWidth = r, t.lineJoin = l || "bevel"), e.fullCircles && function (t, e, i) { const { x: s, y: n, startAngle: o, pixelMargin: a, fullCircles: r } = e, l = Math.max(e.outerRadius - a, 0), h = e.innerRadius + a; let c; for (i && Nn(t, e, o + O), t.beginPath(), t.arc(s, n, h, o + O, o, !0), c = 0; c < r; ++c)t.stroke(); for (t.beginPath(), t.arc(s, n, l, o, o + O), c = 0; c < r; ++c)t.stroke() }(t, e, h), h && Nn(t, e, n), Hn(t, e, i, s, n, o), t.stroke()) } class Yn extends Es { constructor(t) { super(), this.options = void 0, this.circumference = void 0, this.startAngle = void 0, this.endAngle = void 0, this.innerRadius = void 0, this.outerRadius = void 0, this.pixelMargin = 0, this.fullCircles = 0, t && Object.assign(this, t) } inRange(t, e, i) { const s = this.getProps(["x", "y"], i), { angle: n, distance: o } = U(s, { x: t, y: e }), { startAngle: a, endAngle: l, innerRadius: h, outerRadius: c, circumference: d } = this.getProps(["startAngle", "endAngle", "innerRadius", "outerRadius", "circumference"], i), u = this.options.spacing / 2, f = r(d, l - a) >= O || G(n, a, l), g = Q(o, h + u, c + u); return f && g } getCenterPoint(t) { const { x: e, y: i, startAngle: s, endAngle: n, innerRadius: o, outerRadius: a } = this.getProps(["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius", "circumference"], t), { offset: r, spacing: l } = this.options, h = (s + n) / 2, c = (o + a + l + r) / 2; return { x: e + Math.cos(h) * c, y: i + Math.sin(h) * c } } tooltipPosition(t) { return this.getCenterPoint(t) } draw(t) { const { options: e, circumference: i } = this, s = (e.offset || 0) / 2, n = (e.spacing || 0) / 2, o = e.circular; if (this.pixelMargin = "inner" === e.borderAlign ? .33 : 0, this.fullCircles = i > O ? Math.floor(i / O) : 0, 0 === i || this.innerRadius < 0 || this.outerRadius < 0) return; t.save(); let a = 0; if (s) { a = s / 2; const e = (this.startAngle + this.endAngle) / 2; t.translate(Math.cos(e) * a, Math.sin(e) * a), this.circumference >= D && (a = s) } t.fillStyle = e.backgroundColor, t.strokeStyle = e.borderColor; const r = function (t, e, i, s, n) { const { fullCircles: o, startAngle: a, circumference: r } = e; let l = e.endAngle; if (o) { Hn(t, e, i, s, a + O, n); for (let e = 0; e < o; ++e)t.fill(); isNaN(r) || (l = a + r % O, r % O == 0 && (l += O)) } return Hn(t, e, i, s, l, n), t.fill(), l }(t, this, a, n, o); $n(t, this, a, n, r, o), t.restore() } } function Un(t, e, i = e) { t.lineCap = r(i.borderCapStyle, e.borderCapStyle), t.setLineDash(r(i.borderDash, e.borderDash)), t.lineDashOffset = r(i.borderDashOffset, e.borderDashOffset), t.lineJoin = r(i.borderJoinStyle, e.borderJoinStyle), t.lineWidth = r(i.borderWidth, e.borderWidth), t.strokeStyle = r(i.borderColor, e.borderColor) } function Xn(t, e, i) { t.lineTo(i.x, i.y) } function qn(t, e, i = {}) { const s = t.length, { start: n = 0, end: o = s - 1 } = i, { start: a, end: r } = e, l = Math.max(n, a), h = Math.min(o, r), c = n < a && o < a || n > r && o > r; return { count: s, start: l, loop: e.loop, ilen: h < l && !c ? s + h - l : h - l } } function Kn(t, e, i, s) { const { points: n, options: o } = e, { count: a, start: r, loop: l, ilen: h } = qn(n, i, s), c = function (t) { return t.stepped ? Oe : t.tension || "monotone" === t.cubicInterpolationMode ? Ce : Xn }(o); let d, u, f, { move: g = !0, reverse: p } = s || {}; for (d = 0; d <= h; ++d)u = n[(r + (p ? h - d : d)) % a], u.skip || (g ? (t.moveTo(u.x, u.y), g = !1) : c(t, f, u, p, o.stepped), f = u); return l && (u = n[(r + (p ? h : 0)) % a], c(t, f, u, p, o.stepped)), !!l } function Gn(t, e, i, s) { const n = e.points, { count: o, start: a, ilen: r } = qn(n, i, s), { move: l = !0, reverse: h } = s || {}; let c, d, u, f, g, p, m = 0, b = 0; const x = t => (a + (h ? r - t : t)) % o, _ = () => { f !== g && (t.lineTo(m, g), t.lineTo(m, f), t.lineTo(m, p)) }; for (l && (d = n[x(0)], t.moveTo(d.x, d.y)), c = 0; c <= r; ++c) { if (d = n[x(c)], d.skip) continue; const e = d.x, i = d.y, s = 0 | e; s === u ? (i < f ? f = i : i > g && (g = i), m = (b * m + e) / ++b) : (_(), t.lineTo(e, i), u = s, b = 0, f = g = i), p = i } _() } function Zn(t) { const e = t.options, i = e.borderDash && e.borderDash.length; return !(t._decimated || t._loop || e.tension || "monotone" === e.cubicInterpolationMode || e.stepped || i) ? Gn : Kn } Yn.id = "arc", Yn.defaults = { borderAlign: "center", borderColor: "#fff", borderJoinStyle: void 0, borderRadius: 0, borderWidth: 2, offset: 0, spacing: 0, angle: void 0, circular: !0 }, Yn.defaultRoutes = { backgroundColor: "backgroundColor" }; const Jn = "function" == typeof Path2D; function Qn(t, e, i, s) { Jn && !e.options.segment ? function (t, e, i, s) { let n = e._path; n || (n = e._path = new Path2D, e.path(n, i, s) && n.closePath()), Un(t, e.options), t.stroke(n) }(t, e, i, s) : function (t, e, i, s) { const { segments: n, options: o } = e, a = Zn(e); for (const r of n) Un(t, o, r.style), t.beginPath(), a(t, e, r, { start: i, end: i + s - 1 }) && t.closePath(), t.stroke() }(t, e, i, s) } class to extends Es { constructor(t) { super(), this.animated = !0, this.options = void 0, this._chart = void 0, this._loop = void 0, this._fullLoop = void 0, this._path = void 0, this._points = void 0, this._segments = void 0, this._decimated = !1, this._pointsUpdated = !1, this._datasetIndex = void 0, t && Object.assign(this, t) } updateControlPoints(t, e) { const i = this.options; if ((i.tension || "monotone" === i.cubicInterpolationMode) && !i.stepped && !this._pointsUpdated) { const s = i.spanGaps ? this._loop : this._fullLoop; Qe(this._points, i, t, s, e), this._pointsUpdated = !0 } } set points(t) { this._points = t, delete this._segments, delete this._path, this._pointsUpdated = !1 } get points() { return this._points } get segments() { return this._segments || (this._segments = Di(this, this.options.segment)) } first() { const t = this.segments, e = this.points; return t.length && e[t[0].start] } last() { const t = this.segments, e = this.points, i = t.length; return i && e[t[i - 1].end] } interpolate(t, e) { const i = this.options, s = t[e], n = this.points, o = Pi(this, { property: e, start: s, end: s }); if (!o.length) return; const a = [], r = function (t) { return t.stepped ? oi : t.tension || "monotone" === t.cubicInterpolationMode ? ai : ni }(i); let l, h; for (l = 0, h = o.length; l < h; ++l) { const { start: h, end: c } = o[l], d = n[h], u = n[c]; if (d === u) { a.push(d); continue } const f = r(d, u, Math.abs((s - d[e]) / (u[e] - d[e])), i.stepped); f[e] = t[e], a.push(f) } return 1 === a.length ? a[0] : a } pathSegment(t, e, i) { return Zn(this)(t, this, e, i) } path(t, e, i) { const s = this.segments, n = Zn(this); let o = this._loop; e = e || 0, i = i || this.points.length - e; for (const a of s) o &= n(t, this, a, { start: e, end: e + i - 1 }); return !!o } draw(t, e, i, s) { const n = this.options || {}; (this.points || []).length && n.borderWidth && (t.save(), Qn(t, this, i, s), t.restore()), this.animated && (this._pointsUpdated = !1, this._path = void 0) } } function eo(t, e, i, s) { const n = t.options, { [i]: o } = t.getProps([i], s); return Math.abs(e - o) < n.radius + n.hitRadius } to.id = "line", to.defaults = { borderCapStyle: "butt", borderDash: [], borderDashOffset: 0, borderJoinStyle: "miter", borderWidth: 3, capBezierPoints: !0, cubicInterpolationMode: "default", fill: !1, spanGaps: !1, stepped: !1, tension: 0 }, to.defaultRoutes = { backgroundColor: "backgroundColor", borderColor: "borderColor" }, to.descriptors = { _scriptable: !0, _indexable: t => "borderDash" !== t && "fill" !== t }; class io extends Es { constructor(t) { super(), this.options = void 0, this.parsed = void 0, this.skip = void 0, this.stop = void 0, t && Object.assign(this, t) } inRange(t, e, i) { const s = this.options, { x: n, y: o } = this.getProps(["x", "y"], i); return Math.pow(t - n, 2) + Math.pow(e - o, 2) < Math.pow(s.hitRadius + s.radius, 2) } inXRange(t, e) { return eo(this, t, "x", e) } inYRange(t, e) { return eo(this, t, "y", e) } getCenterPoint(t) { const { x: e, y: i } = this.getProps(["x", "y"], t); return { x: e, y: i } } size(t) { let e = (t = t || this.options || {}).radius || 0; e = Math.max(e, e && t.hoverRadius || 0); return 2 * (e + (e && t.borderWidth || 0)) } draw(t, e) { const i = this.options; this.skip || i.radius < .1 || !Se(this, e, this.size(i) / 2) || (t.strokeStyle = i.borderColor, t.lineWidth = i.borderWidth, t.fillStyle = i.backgroundColor, Me(t, i, this.x, this.y)) } getRange() { const t = this.options || {}; return t.radius + t.hitRadius } } function so(t, e) { const { x: i, y: s, base: n, width: o, height: a } = t.getProps(["x", "y", "base", "width", "height"], e); let r, l, h, c, d; return t.horizontal ? (d = a / 2, r = Math.min(i, n), l = Math.max(i, n), h = s - d, c = s + d) : (d = o / 2, r = i - d, l = i + d, h = Math.min(s, n), c = Math.max(s, n)), { left: r, top: h, right: l, bottom: c } } function no(t, e, i, s) { return t ? 0 : Z(e, i, s) } function oo(t) { const e = so(t), i = e.right - e.left, s = e.bottom - e.top, o = function (t, e, i) { const s = t.options.borderWidth, n = t.borderSkipped, o = fi(s); return { t: no(n.top, o.top, 0, i), r: no(n.right, o.right, 0, e), b: no(n.bottom, o.bottom, 0, i), l: no(n.left, o.left, 0, e) } }(t, i / 2, s / 2), a = function (t, e, i) { const { enableBorderRadius: s } = t.getProps(["enableBorderRadius"]), o = t.options.borderRadius, a = gi(o), r = Math.min(e, i), l = t.borderSkipped, h = s || n(o); return { topLeft: no(!h || l.top || l.left, a.topLeft, 0, r), topRight: no(!h || l.top || l.right, a.topRight, 0, r), bottomLeft: no(!h || l.bottom || l.left, a.bottomLeft, 0, r), bottomRight: no(!h || l.bottom || l.right, a.bottomRight, 0, r) } }(t, i / 2, s / 2); return { outer: { x: e.left, y: e.top, w: i, h: s, radius: a }, inner: { x: e.left + o.l, y: e.top + o.t, w: i - o.l - o.r, h: s - o.t - o.b, radius: { topLeft: Math.max(0, a.topLeft - Math.max(o.t, o.l)), topRight: Math.max(0, a.topRight - Math.max(o.t, o.r)), bottomLeft: Math.max(0, a.bottomLeft - Math.max(o.b, o.l)), bottomRight: Math.max(0, a.bottomRight - Math.max(o.b, o.r)) } } } } function ao(t, e, i, s) { const n = null === e, o = null === i, a = t && !(n && o) && so(t, s); return a && (n || Q(e, a.left, a.right)) && (o || Q(i, a.top, a.bottom)) } function ro(t, e) { t.rect(e.x, e.y, e.w, e.h) } function lo(t, e, i = {}) { const s = t.x !== i.x ? -e : 0, n = t.y !== i.y ? -e : 0, o = (t.x + t.w !== i.x + i.w ? e : 0) - s, a = (t.y + t.h !== i.y + i.h ? e : 0) - n; return { x: t.x + s, y: t.y + n, w: t.w + o, h: t.h + a, radius: t.radius } } io.id = "point", io.defaults = { borderWidth: 1, hitRadius: 1, hoverBorderWidth: 1, hoverRadius: 4, pointStyle: "circle", radius: 3, rotation: 0 }, io.defaultRoutes = { backgroundColor: "backgroundColor", borderColor: "borderColor" }; class ho extends Es { constructor(t) { super(), this.options = void 0, this.horizontal = void 0, this.base = void 0, this.width = void 0, this.height = void 0, this.inflateAmount = void 0, t && Object.assign(this, t) } draw(t) { const { inflateAmount: e, options: { borderColor: i, backgroundColor: s } } = this, { inner: n, outer: o } = oo(this), a = (r = o.radius).topLeft || r.topRight || r.bottomLeft || r.bottomRight ? Le : ro; var r; t.save(), o.w === n.w && o.h === n.h || (t.beginPath(), a(t, lo(o, e, n)), t.clip(), a(t, lo(n, -e, o)), t.fillStyle = i, t.fill("evenodd")), t.beginPath(), a(t, lo(n, e)), t.fillStyle = s, t.fill(), t.restore() } inRange(t, e, i) { return ao(this, t, e, i) } inXRange(t, e) { return ao(this, t, null, e) } inYRange(t, e) { return ao(this, null, t, e) } getCenterPoint(t) { const { x: e, y: i, base: s, horizontal: n } = this.getProps(["x", "y", "base", "horizontal"], t); return { x: n ? (e + s) / 2 : e, y: n ? i : (i + s) / 2 } } getRange(t) { return "x" === t ? this.width / 2 : this.height / 2 } } ho.id = "bar", ho.defaults = { borderSkipped: "start", borderWidth: 0, borderRadius: 0, inflateAmount: "auto", pointStyle: void 0 }, ho.defaultRoutes = { backgroundColor: "backgroundColor", borderColor: "borderColor" }; var co = Object.freeze({ __proto__: null, ArcElement: Yn, LineElement: to, PointElement: io, BarElement: ho }); function uo(t) { if (t._decimated) { const e = t._data; delete t._decimated, delete t._data, Object.defineProperty(t, "data", { value: e }) } } function fo(t) { t.data.datasets.forEach((t => { uo(t) })) } var go = { id: "decimation", defaults: { algorithm: "min-max", enabled: !1 }, beforeElementsUpdate: (t, e, s) => { if (!s.enabled) return void fo(t); const n = t.width; t.data.datasets.forEach(((e, o) => { const { _data: a, indexAxis: r } = e, l = t.getDatasetMeta(o), h = a || e.data; if ("y" === bi([r, t.options.indexAxis])) return; if (!l.controller.supportsDecimation) return; const c = t.scales[l.xAxisID]; if ("linear" !== c.type && "time" !== c.type) return; if (t.options.parsing) return; let { start: d, count: u } = function (t, e) { const i = e.length; let s, n = 0; const { iScale: o } = t, { min: a, max: r, minDefined: l, maxDefined: h } = o.getUserBounds(); return l && (n = Z(et(e, o.axis, a).lo, 0, i - 1)), s = h ? Z(et(e, o.axis, r).hi + 1, n, i) - n : i - n, { start: n, count: s } }(l, h); if (u <= (s.threshold || 4 * n)) return void uo(e); let f; switch (i(a) && (e._data = h, delete e.data, Object.defineProperty(e, "data", { configurable: !0, enumerable: !0, get: function () { return this._decimated }, set: function (t) { this._data = t } })), s.algorithm) { case "lttb": f = function (t, e, i, s, n) { const o = n.samples || s; if (o >= i) return t.slice(e, e + i); const a = [], r = (i - 2) / (o - 2); let l = 0; const h = e + i - 1; let c, d, u, f, g, p = e; for (a[l++] = t[p], c = 0; c < o - 2; c++) { let s, n = 0, o = 0; const h = Math.floor((c + 1) * r) + 1 + e, m = Math.min(Math.floor((c + 2) * r) + 1, i) + e, b = m - h; for (s = h; s < m; s++)n += t[s].x, o += t[s].y; n /= b, o /= b; const x = Math.floor(c * r) + 1 + e, _ = Math.min(Math.floor((c + 1) * r) + 1, i) + e, { x: y, y: v } = t[p]; for (u = f = -1, s = x; s < _; s++)f = .5 * Math.abs((y - n) * (t[s].y - v) - (y - t[s].x) * (o - v)), f > u && (u = f, d = t[s], g = s); a[l++] = d, p = g } return a[l++] = t[h], a }(h, d, u, n, s); break; case "min-max": f = function (t, e, s, n) { let o, a, r, l, h, c, d, u, f, g, p = 0, m = 0; const b = [], x = e + s - 1, _ = t[e].x, y = t[x].x - _; for (o = e; o < e + s; ++o) { a = t[o], r = (a.x - _) / y * n, l = a.y; const e = 0 | r; if (e === h) l < f ? (f = l, c = o) : l > g && (g = l, d = o), p = (m * p + a.x) / ++m; else { const s = o - 1; if (!i(c) && !i(d)) { const e = Math.min(c, d), i = Math.max(c, d); e !== u && e !== s && b.push({ ...t[e], x: p }), i !== u && i !== s && b.push({ ...t[i], x: p }) } o > 0 && s !== u && b.push(t[s]), b.push(a), h = e, m = 0, f = g = l, c = d = u = o } } return b }(h, d, u, n); break; default: throw new Error(`Unsupported decimation algorithm '${s.algorithm}'`) }e._decimated = f })) }, destroy(t) { fo(t) } }; function po(t, e, i, s) { if (s) return; let n = e[t], o = i[t]; return "angle" === t && (n = K(n), o = K(o)), { property: t, start: n, end: o } } function mo(t, e, i) { for (; e > t; e--) { const t = i[e]; if (!isNaN(t.x) && !isNaN(t.y)) break } return e } function bo(t, e, i, s) { return t && e ? s(t[i], e[i]) : t ? t[i] : e ? e[i] : 0 } function xo(t, e) { let i = [], n = !1; return s(t) ? (n = !0, i = t) : i = function (t, e) { const { x: i = null, y: s = null } = t || {}, n = e.points, o = []; return e.segments.forEach((({ start: t, end: e }) => { e = mo(t, e, n); const a = n[t], r = n[e]; null !== s ? (o.push({ x: a.x, y: s }), o.push({ x: r.x, y: s })) : null !== i && (o.push({ x: i, y: a.y }), o.push({ x: i, y: r.y })) })), o }(t, e), i.length ? new to({ points: i, options: { tension: 0 }, _loop: n, _fullLoop: n }) : null } function _o(t) { return t && !1 !== t.fill } function yo(t, e, i) { let s = t[e].fill; const n = [e]; let a; if (!i) return s; for (; !1 !== s && -1 === n.indexOf(s);) { if (!o(s)) return s; if (a = t[s], !a) return !1; if (a.visible) return s; n.push(s), s = a.fill } return !1 } function vo(t, e, i) { const s = function (t) { const e = t.options, i = e.fill; let s = r(i && i.target, i); void 0 === s && (s = !!e.backgroundColor); if (!1 === s || null === s) return !1; if (!0 === s) return "origin"; return s }(t); if (n(s)) return !isNaN(s.value) && s; let a = parseFloat(s); return o(a) && Math.floor(a) === a ? function (t, e, i, s) { "-" !== t && "+" !== t || (i = e + i); if (i === e || i < 0 || i >= s) return !1; return i }(s[0], e, a, i) : ["origin", "start", "end", "stack", "shape"].indexOf(s) >= 0 && s } function wo(t, e, i) { const s = []; for (let n = 0; n < i.length; n++) { const o = i[n], { first: a, last: r, point: l } = Mo(o, e, "x"); if (!(!l || a && r)) if (a) s.unshift(l); else if (t.push(l), !r) break } t.push(...s) } function Mo(t, e, i) { const s = t.interpolate(e, i); if (!s) return {}; const n = s[i], o = t.segments, a = t.points; let r = !1, l = !1; for (let t = 0; t < o.length; t++) { const e = o[t], s = a[e.start][i], h = a[e.end][i]; if (Q(n, s, h)) { r = n === s, l = n === h; break } } return { first: r, last: l, point: s } } class ko { constructor(t) { this.x = t.x, this.y = t.y, this.radius = t.radius } pathSegment(t, e, i) { const { x: s, y: n, radius: o } = this; return e = e || { start: 0, end: O }, t.arc(s, n, o, e.end, e.start, !0), !i.bounds } interpolate(t) { const { x: e, y: i, radius: s } = this, n = t.angle; return { x: e + Math.cos(n) * s, y: i + Math.sin(n) * s, angle: n } } } function So(t) { const { chart: e, fill: i, line: s } = t; if (o(i)) return function (t, e) { const i = t.getDatasetMeta(e); return i && t.isDatasetVisible(e) ? i.dataset : null }(e, i); if ("stack" === i) return function (t) { const { scale: e, index: i, line: s } = t, n = [], o = s.segments, a = s.points, r = function (t, e) { const i = [], s = t.getMatchingVisibleMetas("line"); for (let t = 0; t < s.length; t++) { const n = s[t]; if (n.index === e) break; n.hidden || i.unshift(n.dataset) } return i }(e, i); r.push(xo({ x: null, y: e.bottom }, s)); for (let t = 0; t < o.length; t++) { const e = o[t]; for (let t = e.start; t <= e.end; t++)wo(n, a[t], r) } return new to({ points: n, options: {} }) }(t); if ("shape" === i) return !0; const a = function (t) { if ((t.scale || {}).getPointPositionForValue) return function (t) { const { scale: e, fill: i } = t, s = e.options, o = e.getLabels().length, a = s.reverse ? e.max : e.min, r = function (t, e, i) { let s; return s = "start" === t ? i : "end" === t ? e.options.reverse ? e.min : e.max : n(t) ? t.value : e.getBaseValue(), s }(i, e, a), l = []; if (s.grid.circular) { const t = e.getPointPositionForValue(0, a); return new ko({ x: t.x, y: t.y, radius: e.getDistanceFromCenterForValue(r) }) } for (let t = 0; t < o; ++t)l.push(e.getPointPositionForValue(t, r)); return l }(t); return function (t) { const { scale: e = {}, fill: i } = t, s = function (t, e) { let i = null; return "start" === t ? i = e.bottom : "end" === t ? i = e.top : n(t) ? i = e.getPixelForValue(t.value) : e.getBasePixel && (i = e.getBasePixel()), i }(i, e); if (o(s)) { const t = e.isHorizontal(); return { x: t ? s : null, y: t ? null : s } } return null }(t) }(t); return a instanceof ko ? a : xo(a, s) } function Po(t, e, i) { const s = So(e), { line: n, scale: o, axis: a } = e, r = n.options, l = r.fill, h = r.backgroundColor, { above: c = h, below: d = h } = l || {}; s && n.points.length && (Pe(t, i), function (t, e) { const { line: i, target: s, above: n, below: o, area: a, scale: r } = e, l = i._loop ? "angle" : e.axis; t.save(), "x" === l && o !== n && (Do(t, s, a.top), Oo(t, { line: i, target: s, color: n, scale: r, property: l }), t.restore(), t.save(), Do(t, s, a.bottom)); Oo(t, { line: i, target: s, color: o, scale: r, property: l }), t.restore() }(t, { line: n, target: s, above: c, below: d, area: i, scale: o, axis: a }), De(t)) } function Do(t, e, i) { const { segments: s, points: n } = e; let o = !0, a = !1; t.beginPath(); for (const r of s) { const { start: s, end: l } = r, h = n[s], c = n[mo(s, l, n)]; o ? (t.moveTo(h.x, h.y), o = !1) : (t.lineTo(h.x, i), t.lineTo(h.x, h.y)), a = !!e.pathSegment(t, r, { move: a }), a ? t.closePath() : t.lineTo(c.x, i) } t.lineTo(e.first().x, i), t.closePath(), t.clip() } function Oo(t, e) { const { line: i, target: s, property: n, color: o, scale: a } = e, r = function (t, e, i) { const s = t.segments, n = t.points, o = e.points, a = []; for (const t of s) { let { start: s, end: r } = t; r = mo(s, r, n); const l = po(i, n[s], n[r], t.loop); if (!e.segments) { a.push({ source: t, target: l, start: n[s], end: n[r] }); continue } const h = Pi(e, l); for (const e of h) { const s = po(i, o[e.start], o[e.end], e.loop), r = Si(t, n, s); for (const t of r) a.push({ source: t, target: e, start: { [i]: bo(l, s, "start", Math.max) }, end: { [i]: bo(l, s, "end", Math.min) } }) } } return a }(i, s, n); for (const { source: e, target: l, start: h, end: c } of r) { const { style: { backgroundColor: r = o } = {} } = e, d = !0 !== s; t.save(), t.fillStyle = r, Co(t, a, d && po(n, h, c)), t.beginPath(); const u = !!i.pathSegment(t, e); let f; if (d) { u ? t.closePath() : Ao(t, s, c, n); const e = !!s.pathSegment(t, l, { move: u, reverse: !0 }); f = u && e, f || Ao(t, s, h, n) } t.closePath(), t.fill(f ? "evenodd" : "nonzero"), t.restore() } } function Co(t, e, i) { const { top: s, bottom: n } = e.chart.chartArea, { property: o, start: a, end: r } = i || {}; "x" === o && (t.beginPath(), t.rect(a, s, r - a, n - s), t.clip()) } function Ao(t, e, i, s) { const n = e.interpolate(i, s); n && t.lineTo(n.x, n.y) } var To = { id: "filler", afterDatasetsUpdate(t, e, i) { const s = (t.data.datasets || []).length, n = []; let o, a, r, l; for (a = 0; a < s; ++a)o = t.getDatasetMeta(a), r = o.dataset, l = null, r && r.options && r instanceof to && (l = { visible: t.isDatasetVisible(a), index: a, fill: vo(r, a, s), chart: t, axis: o.controller.options.indexAxis, scale: o.vScale, line: r }), o.$filler = l, n.push(l); for (a = 0; a < s; ++a)l = n[a], l && !1 !== l.fill && (l.fill = yo(n, a, i.propagate)) }, beforeDraw(t, e, i) { const s = "beforeDraw" === i.drawTime, n = t.getSortedVisibleDatasetMetas(), o = t.chartArea; for (let e = n.length - 1; e >= 0; --e) { const i = n[e].$filler; i && (i.line.updateControlPoints(o, i.axis), s && i.fill && Po(t.ctx, i, o)) } }, beforeDatasetsDraw(t, e, i) { if ("beforeDatasetsDraw" !== i.drawTime) return; const s = t.getSortedVisibleDatasetMetas(); for (let e = s.length - 1; e >= 0; --e) { const i = s[e].$filler; _o(i) && Po(t.ctx, i, t.chartArea) } }, beforeDatasetDraw(t, e, i) { const s = e.meta.$filler; _o(s) && "beforeDatasetDraw" === i.drawTime && Po(t.ctx, s, t.chartArea) }, defaults: { propagate: !0, drawTime: "beforeDatasetDraw" } }; const Lo = (t, e) => { let { boxHeight: i = e, boxWidth: s = e } = t; return t.usePointStyle && (i = Math.min(i, e), s = t.pointStyleWidth || Math.min(s, e)), { boxWidth: s, boxHeight: i, itemHeight: Math.max(e, i) } }; class Eo extends Es { constructor(t) { super(), this._added = !1, this.legendHitBoxes = [], this._hoveredItem = null, this.doughnutMode = !1, this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this.legendItems = void 0, this.columnSizes = void 0, this.lineWidths = void 0, this.maxHeight = void 0, this.maxWidth = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.height = void 0, this.width = void 0, this._margins = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0 } update(t, e, i) { this.maxWidth = t, this.maxHeight = e, this._margins = i, this.setDimensions(), this.buildLabels(), this.fit() } setDimensions() { this.isHorizontal() ? (this.width = this.maxWidth, this.left = this._margins.left, this.right = this.width) : (this.height = this.maxHeight, this.top = this._margins.top, this.bottom = this.height) } buildLabels() { const t = this.options.labels || {}; let e = c(t.generateLabels, [this.chart], this) || []; t.filter && (e = e.filter((e => t.filter(e, this.chart.data)))), t.sort && (e = e.sort(((e, i) => t.sort(e, i, this.chart.data)))), this.options.reverse && e.reverse(), this.legendItems = e } fit() { const { options: t, ctx: e } = this; if (!t.display) return void (this.width = this.height = 0); const i = t.labels, s = mi(i.font), n = s.size, o = this._computeTitleHeight(), { boxWidth: a, itemHeight: r } = Lo(i, n); let l, h; e.font = s.string, this.isHorizontal() ? (l = this.maxWidth, h = this._fitRows(o, n, a, r) + 10) : (h = this.maxHeight, l = this._fitCols(o, n, a, r) + 10), this.width = Math.min(l, t.maxWidth || this.maxWidth), this.height = Math.min(h, t.maxHeight || this.maxHeight) } _fitRows(t, e, i, s) { const { ctx: n, maxWidth: o, options: { labels: { padding: a } } } = this, r = this.legendHitBoxes = [], l = this.lineWidths = [0], h = s + a; let c = t; n.textAlign = "left", n.textBaseline = "middle"; let d = -1, u = -h; return this.legendItems.forEach(((t, f) => { const g = i + e / 2 + n.measureText(t.text).width; (0 === f || l[l.length - 1] + g + 2 * a > o) && (c += h, l[l.length - (f > 0 ? 0 : 1)] = 0, u += h, d++), r[f] = { left: 0, top: u, row: d, width: g, height: s }, l[l.length - 1] += g + a })), c } _fitCols(t, e, i, s) { const { ctx: n, maxHeight: o, options: { labels: { padding: a } } } = this, r = this.legendHitBoxes = [], l = this.columnSizes = [], h = o - t; let c = a, d = 0, u = 0, f = 0, g = 0; return this.legendItems.forEach(((t, o) => { const p = i + e / 2 + n.measureText(t.text).width; o > 0 && u + s + 2 * a > h && (c += d + a, l.push({ width: d, height: u }), f += d + a, g++, d = u = 0), r[o] = { left: f, top: u, col: g, width: p, height: s }, d = Math.max(d, p), u += s + a })), c += d, l.push({ width: d, height: u }), c } adjustHitBoxes() { if (!this.options.display) return; const t = this._computeTitleHeight(), { legendHitBoxes: e, options: { align: i, labels: { padding: s }, rtl: n } } = this, o = yi(n, this.left, this.width); if (this.isHorizontal()) { let n = 0, a = ut(i, this.left + s, this.right - this.lineWidths[n]); for (const r of e) n !== r.row && (n = r.row, a = ut(i, this.left + s, this.right - this.lineWidths[n])), r.top += this.top + t + s, r.left = o.leftForLtr(o.x(a), r.width), a += r.width + s } else { let n = 0, a = ut(i, this.top + t + s, this.bottom - this.columnSizes[n].height); for (const r of e) r.col !== n && (n = r.col, a = ut(i, this.top + t + s, this.bottom - this.columnSizes[n].height)), r.top = a, r.left += this.left + s, r.left = o.leftForLtr(o.x(r.left), r.width), a += r.height + s } } isHorizontal() { return "top" === this.options.position || "bottom" === this.options.position } draw() { if (this.options.display) { const t = this.ctx; Pe(t, this), this._draw(), De(t) } } _draw() { const { options: t, columnSizes: e, lineWidths: i, ctx: s } = this, { align: n, labels: o } = t, a = ne.color, l = yi(t.rtl, this.left, this.width), h = mi(o.font), { color: c, padding: d } = o, u = h.size, f = u / 2; let g; this.drawTitle(), s.textAlign = l.textAlign("left"), s.textBaseline = "middle", s.lineWidth = .5, s.font = h.string; const { boxWidth: p, boxHeight: m, itemHeight: b } = Lo(o, u), x = this.isHorizontal(), _ = this._computeTitleHeight(); g = x ? { x: ut(n, this.left + d, this.right - i[0]), y: this.top + d + _, line: 0 } : { x: this.left + d, y: ut(n, this.top + _ + d, this.bottom - e[0].height), line: 0 }, vi(this.ctx, t.textDirection); const y = b + d; this.legendItems.forEach(((v, w) => { s.strokeStyle = v.fontColor || c, s.fillStyle = v.fontColor || c; const M = s.measureText(v.text).width, k = l.textAlign(v.textAlign || (v.textAlign = o.textAlign)), S = p + f + M; let P = g.x, D = g.y; l.setWidth(this.width), x ? w > 0 && P + S + d > this.right && (D = g.y += y, g.line++, P = g.x = ut(n, this.left + d, this.right - i[g.line])) : w > 0 && D + y > this.bottom && (P = g.x = P + e[g.line].width + d, g.line++, D = g.y = ut(n, this.top + _ + d, this.bottom - e[g.line].height)); !function (t, e, i) { if (isNaN(p) || p <= 0 || isNaN(m) || m < 0) return; s.save(); const n = r(i.lineWidth, 1); if (s.fillStyle = r(i.fillStyle, a), s.lineCap = r(i.lineCap, "butt"), s.lineDashOffset = r(i.lineDashOffset, 0), s.lineJoin = r(i.lineJoin, "miter"), s.lineWidth = n, s.strokeStyle = r(i.strokeStyle, a), s.setLineDash(r(i.lineDash, [])), o.usePointStyle) { const a = { radius: m * Math.SQRT2 / 2, pointStyle: i.pointStyle, rotation: i.rotation, borderWidth: n }, r = l.xPlus(t, p / 2); ke(s, a, r, e + f, o.pointStyleWidth && p) } else { const o = e + Math.max((u - m) / 2, 0), a = l.leftForLtr(t, p), r = gi(i.borderRadius); s.beginPath(), Object.values(r).some((t => 0 !== t)) ? Le(s, { x: a, y: o, w: p, h: m, radius: r }) : s.rect(a, o, p, m), s.fill(), 0 !== n && s.stroke() } s.restore() }(l.x(P), D, v), P = ft(k, P + p + f, x ? P + S : this.right, t.rtl), function (t, e, i) { Ae(s, i.text, t, e + b / 2, h, { strikethrough: i.hidden, textAlign: l.textAlign(i.textAlign) }) }(l.x(P), D, v), x ? g.x += S + d : g.y += y })), wi(this.ctx, t.textDirection) } drawTitle() { const t = this.options, e = t.title, i = mi(e.font), s = pi(e.padding); if (!e.display) return; const n = yi(t.rtl, this.left, this.width), o = this.ctx, a = e.position, r = i.size / 2, l = s.top + r; let h, c = this.left, d = this.width; if (this.isHorizontal()) d = Math.max(...this.lineWidths), h = this.top + l, c = ut(t.align, c, this.right - d); else { const e = this.columnSizes.reduce(((t, e) => Math.max(t, e.height)), 0); h = l + ut(t.align, this.top, this.bottom - e - t.labels.padding - this._computeTitleHeight()) } const u = ut(a, c, c + d); o.textAlign = n.textAlign(dt(a)), o.textBaseline = "middle", o.strokeStyle = e.color, o.fillStyle = e.color, o.font = i.string, Ae(o, e.text, u, h, i) } _computeTitleHeight() { const t = this.options.title, e = mi(t.font), i = pi(t.padding); return t.display ? e.lineHeight + i.height : 0 } _getLegendItemAt(t, e) { let i, s, n; if (Q(t, this.left, this.right) && Q(e, this.top, this.bottom)) for (n = this.legendHitBoxes, i = 0; i < n.length; ++i)if (s = n[i], Q(t, s.left, s.left + s.width) && Q(e, s.top, s.top + s.height)) return this.legendItems[i]; return null } handleEvent(t) { const e = this.options; if (!function (t, e) { if (("mousemove" === t || "mouseout" === t) && (e.onHover || e.onLeave)) return !0; if (e.onClick && ("click" === t || "mouseup" === t)) return !0; return !1 }(t.type, e)) return; const i = this._getLegendItemAt(t.x, t.y); if ("mousemove" === t.type || "mouseout" === t.type) { const o = this._hoveredItem, a = (n = i, null !== (s = o) && null !== n && s.datasetIndex === n.datasetIndex && s.index === n.index); o && !a && c(e.onLeave, [t, o, this], this), this._hoveredItem = i, i && !a && c(e.onHover, [t, i, this], this) } else i && c(e.onClick, [t, i, this], this); var s, n } } var Ro = { id: "legend", _element: Eo, start(t, e, i) { const s = t.legend = new Eo({ ctx: t.ctx, options: i, chart: t }); Zi.configure(t, s, i), Zi.addBox(t, s) }, stop(t) { Zi.removeBox(t, t.legend), delete t.legend }, beforeUpdate(t, e, i) { const s = t.legend; Zi.configure(t, s, i), s.options = i }, afterUpdate(t) { const e = t.legend; e.buildLabels(), e.adjustHitBoxes() }, afterEvent(t, e) { e.replay || t.legend.handleEvent(e.event) }, defaults: { display: !0, position: "top", align: "center", fullSize: !0, reverse: !1, weight: 1e3, onClick(t, e, i) { const s = e.datasetIndex, n = i.chart; n.isDatasetVisible(s) ? (n.hide(s), e.hidden = !0) : (n.show(s), e.hidden = !1) }, onHover: null, onLeave: null, labels: { color: t => t.chart.options.color, boxWidth: 40, padding: 10, generateLabels(t) { const e = t.data.datasets, { labels: { usePointStyle: i, pointStyle: s, textAlign: n, color: o } } = t.legend.options; return t._getSortedDatasetMetas().map((t => { const a = t.controller.getStyle(i ? 0 : void 0), r = pi(a.borderWidth); return { text: e[t.index].label, fillStyle: a.backgroundColor, fontColor: o, hidden: !t.visible, lineCap: a.borderCapStyle, lineDash: a.borderDash, lineDashOffset: a.borderDashOffset, lineJoin: a.borderJoinStyle, lineWidth: (r.width + r.height) / 4, strokeStyle: a.borderColor, pointStyle: s || a.pointStyle, rotation: a.rotation, textAlign: n || a.textAlign, borderRadius: 0, datasetIndex: t.index } }), this) } }, title: { color: t => t.chart.options.color, display: !1, position: "center", text: "" } }, descriptors: { _scriptable: t => !t.startsWith("on"), labels: { _scriptable: t => !["generateLabels", "filter", "sort"].includes(t) } } }; class Io extends Es { constructor(t) { super(), this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this._padding = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0 } update(t, e) { const i = this.options; if (this.left = 0, this.top = 0, !i.display) return void (this.width = this.height = this.right = this.bottom = 0); this.width = this.right = t, this.height = this.bottom = e; const n = s(i.text) ? i.text.length : 1; this._padding = pi(i.padding); const o = n * mi(i.font).lineHeight + this._padding.height; this.isHorizontal() ? this.height = o : this.width = o } isHorizontal() { const t = this.options.position; return "top" === t || "bottom" === t } _drawArgs(t) { const { top: e, left: i, bottom: s, right: n, options: o } = this, a = o.align; let r, l, h, c = 0; return this.isHorizontal() ? (l = ut(a, i, n), h = e + t, r = n - i) : ("left" === o.position ? (l = i + t, h = ut(a, s, e), c = -.5 * D) : (l = n - t, h = ut(a, e, s), c = .5 * D), r = s - e), { titleX: l, titleY: h, maxWidth: r, rotation: c } } draw() { const t = this.ctx, e = this.options; if (!e.display) return; const i = mi(e.font), s = i.lineHeight / 2 + this._padding.top, { titleX: n, titleY: o, maxWidth: a, rotation: r } = this._drawArgs(s); Ae(t, e.text, 0, 0, i, { color: e.color, maxWidth: a, rotation: r, textAlign: dt(e.align), textBaseline: "middle", translation: [n, o] }) } } var zo = { id: "title", _element: Io, start(t, e, i) { !function (t, e) { const i = new Io({ ctx: t.ctx, options: e, chart: t }); Zi.configure(t, i, e), Zi.addBox(t, i), t.titleBlock = i }(t, i) }, stop(t) { const e = t.titleBlock; Zi.removeBox(t, e), delete t.titleBlock }, beforeUpdate(t, e, i) { const s = t.titleBlock; Zi.configure(t, s, i), s.options = i }, defaults: { align: "center", display: !1, font: { weight: "bold" }, fullSize: !0, padding: 10, position: "top", text: "", weight: 2e3 }, defaultRoutes: { color: "color" }, descriptors: { _scriptable: !0, _indexable: !1 } }; const Fo = new WeakMap; var Vo = { id: "subtitle", start(t, e, i) { const s = new Io({ ctx: t.ctx, options: i, chart: t }); Zi.configure(t, s, i), Zi.addBox(t, s), Fo.set(t, s) }, stop(t) { Zi.removeBox(t, Fo.get(t)), Fo.delete(t) }, beforeUpdate(t, e, i) { const s = Fo.get(t); Zi.configure(t, s, i), s.options = i }, defaults: { align: "center", display: !1, font: { weight: "normal" }, fullSize: !0, padding: 0, position: "top", text: "", weight: 1500 }, defaultRoutes: { color: "color" }, descriptors: { _scriptable: !0, _indexable: !1 } }; const Bo = { average(t) { if (!t.length) return !1; let e, i, s = 0, n = 0, o = 0; for (e = 0, i = t.length; e < i; ++e) { const i = t[e].element; if (i && i.hasValue()) { const t = i.tooltipPosition(); s += t.x, n += t.y, ++o } } return { x: s / o, y: n / o } }, nearest(t, e) { if (!t.length) return !1; let i, s, n, o = e.x, a = e.y, r = Number.POSITIVE_INFINITY; for (i = 0, s = t.length; i < s; ++i) { const s = t[i].element; if (s && s.hasValue()) { const t = X(e, s.getCenterPoint()); t < r && (r = t, n = s) } } if (n) { const t = n.tooltipPosition(); o = t.x, a = t.y } return { x: o, y: a } } }; function No(t, e) { return e && (s(e) ? Array.prototype.push.apply(t, e) : t.push(e)), t } function Wo(t) { return ("string" == typeof t || t instanceof String) && t.indexOf("\n") > -1 ? t.split("\n") : t } function jo(t, e) { const { element: i, datasetIndex: s, index: n } = e, o = t.getDatasetMeta(s).controller, { label: a, value: r } = o.getLabelAndValue(n); return { chart: t, label: a, parsed: o.getParsed(n), raw: t.data.datasets[s].data[n], formattedValue: r, dataset: o.getDataset(), dataIndex: n, datasetIndex: s, element: i } } function Ho(t, e) { const i = t.chart.ctx, { body: s, footer: n, title: o } = t, { boxWidth: a, boxHeight: r } = e, l = mi(e.bodyFont), h = mi(e.titleFont), c = mi(e.footerFont), u = o.length, f = n.length, g = s.length, p = pi(e.padding); let m = p.height, b = 0, x = s.reduce(((t, e) => t + e.before.length + e.lines.length + e.after.length), 0); if (x += t.beforeBody.length + t.afterBody.length, u && (m += u * h.lineHeight + (u - 1) * e.titleSpacing + e.titleMarginBottom), x) { m += g * (e.displayColors ? Math.max(r, l.lineHeight) : l.lineHeight) + (x - g) * l.lineHeight + (x - 1) * e.bodySpacing } f && (m += e.footerMarginTop + f * c.lineHeight + (f - 1) * e.footerSpacing); let _ = 0; const y = function (t) { b = Math.max(b, i.measureText(t).width + _) }; return i.save(), i.font = h.string, d(t.title, y), i.font = l.string, d(t.beforeBody.concat(t.afterBody), y), _ = e.displayColors ? a + 2 + e.boxPadding : 0, d(s, (t => { d(t.before, y), d(t.lines, y), d(t.after, y) })), _ = 0, i.font = c.string, d(t.footer, y), i.restore(), b += p.width, { width: b, height: m } } function $o(t, e, i, s) { const { x: n, width: o } = i, { width: a, chartArea: { left: r, right: l } } = t; let h = "center"; return "center" === s ? h = n <= (r + l) / 2 ? "left" : "right" : n <= o / 2 ? h = "left" : n >= a - o / 2 && (h = "right"), function (t, e, i, s) { const { x: n, width: o } = s, a = i.caretSize + i.caretPadding; return "left" === t && n + o + a > e.width || "right" === t && n - o - a < 0 || void 0 }(h, t, e, i) && (h = "center"), h } function Yo(t, e, i) { const s = i.yAlign || e.yAlign || function (t, e) { const { y: i, height: s } = e; return i < s / 2 ? "top" : i > t.height - s / 2 ? "bottom" : "center" }(t, i); return { xAlign: i.xAlign || e.xAlign || $o(t, e, i, s), yAlign: s } } function Uo(t, e, i, s) { const { caretSize: n, caretPadding: o, cornerRadius: a } = t, { xAlign: r, yAlign: l } = i, h = n + o, { topLeft: c, topRight: d, bottomLeft: u, bottomRight: f } = gi(a); let g = function (t, e) { let { x: i, width: s } = t; return "right" === e ? i -= s : "center" === e && (i -= s / 2), i }(e, r); const p = function (t, e, i) { let { y: s, height: n } = t; return "top" === e ? s += i : s -= "bottom" === e ? n + i : n / 2, s }(e, l, h); return "center" === l ? "left" === r ? g += h : "right" === r && (g -= h) : "left" === r ? g -= Math.max(c, u) + n : "right" === r && (g += Math.max(d, f) + n), { x: Z(g, 0, s.width - e.width), y: Z(p, 0, s.height - e.height) } } function Xo(t, e, i) { const s = pi(i.padding); return "center" === e ? t.x + t.width / 2 : "right" === e ? t.x + t.width - s.right : t.x + s.left } function qo(t) { return No([], Wo(t)) } function Ko(t, e) { const i = e && e.dataset && e.dataset.tooltip && e.dataset.tooltip.callbacks; return i ? t.override(i) : t } class Go extends Es { constructor(t) { super(), this.opacity = 0, this._active = [], this._eventPosition = void 0, this._size = void 0, this._cachedAnimations = void 0, this._tooltipItems = [], this.$animations = void 0, this.$context = void 0, this.chart = t.chart || t._chart, this._chart = this.chart, this.options = t.options, this.dataPoints = void 0, this.title = void 0, this.beforeBody = void 0, this.body = void 0, this.afterBody = void 0, this.footer = void 0, this.xAlign = void 0, this.yAlign = void 0, this.x = void 0, this.y = void 0, this.height = void 0, this.width = void 0, this.caretX = void 0, this.caretY = void 0, this.labelColors = void 0, this.labelPointStyles = void 0, this.labelTextColors = void 0 } initialize(t) { this.options = t, this._cachedAnimations = void 0, this.$context = void 0 } _resolveAnimations() { const t = this._cachedAnimations; if (t) return t; const e = this.chart, i = this.options.setContext(this.getContext()), s = i.enabled && e.options.animation && i.animations, n = new ys(this.chart, s); return s._cacheable && (this._cachedAnimations = Object.freeze(n)), n } getContext() { return this.$context || (this.$context = (t = this.chart.getContext(), e = this, i = this._tooltipItems, _i(t, { tooltip: e, tooltipItems: i, type: "tooltip" }))); var t, e, i } getTitle(t, e) { const { callbacks: i } = e, s = i.beforeTitle.apply(this, [t]), n = i.title.apply(this, [t]), o = i.afterTitle.apply(this, [t]); let a = []; return a = No(a, Wo(s)), a = No(a, Wo(n)), a = No(a, Wo(o)), a } getBeforeBody(t, e) { return qo(e.callbacks.beforeBody.apply(this, [t])) } getBody(t, e) { const { callbacks: i } = e, s = []; return d(t, (t => { const e = { before: [], lines: [], after: [] }, n = Ko(i, t); No(e.before, Wo(n.beforeLabel.call(this, t))), No(e.lines, n.label.call(this, t)), No(e.after, Wo(n.afterLabel.call(this, t))), s.push(e) })), s } getAfterBody(t, e) { return qo(e.callbacks.afterBody.apply(this, [t])) } getFooter(t, e) { const { callbacks: i } = e, s = i.beforeFooter.apply(this, [t]), n = i.footer.apply(this, [t]), o = i.afterFooter.apply(this, [t]); let a = []; return a = No(a, Wo(s)), a = No(a, Wo(n)), a = No(a, Wo(o)), a } _createItems(t) { const e = this._active, i = this.chart.data, s = [], n = [], o = []; let a, r, l = []; for (a = 0, r = e.length; a < r; ++a)l.push(jo(this.chart, e[a])); return t.filter && (l = l.filter(((e, s, n) => t.filter(e, s, n, i)))), t.itemSort && (l = l.sort(((e, s) => t.itemSort(e, s, i)))), d(l, (e => { const i = Ko(t.callbacks, e); s.push(i.labelColor.call(this, e)), n.push(i.labelPointStyle.call(this, e)), o.push(i.labelTextColor.call(this, e)) })), this.labelColors = s, this.labelPointStyles = n, this.labelTextColors = o, this.dataPoints = l, l } update(t, e) { const i = this.options.setContext(this.getContext()), s = this._active; let n, o = []; if (s.length) { const t = Bo[i.position].call(this, s, this._eventPosition); o = this._createItems(i), this.title = this.getTitle(o, i), this.beforeBody = this.getBeforeBody(o, i), this.body = this.getBody(o, i), this.afterBody = this.getAfterBody(o, i), this.footer = this.getFooter(o, i); const e = this._size = Ho(this, i), a = Object.assign({}, t, e), r = Yo(this.chart, i, a), l = Uo(i, a, r, this.chart); this.xAlign = r.xAlign, this.yAlign = r.yAlign, n = { opacity: 1, x: l.x, y: l.y, width: e.width, height: e.height, caretX: t.x, caretY: t.y } } else 0 !== this.opacity && (n = { opacity: 0 }); this._tooltipItems = o, this.$context = void 0, n && this._resolveAnimations().update(this, n), t && i.external && i.external.call(this, { chart: this.chart, tooltip: this, replay: e }) } drawCaret(t, e, i, s) { const n = this.getCaretPosition(t, i, s); e.lineTo(n.x1, n.y1), e.lineTo(n.x2, n.y2), e.lineTo(n.x3, n.y3) } getCaretPosition(t, e, i) { const { xAlign: s, yAlign: n } = this, { caretSize: o, cornerRadius: a } = i, { topLeft: r, topRight: l, bottomLeft: h, bottomRight: c } = gi(a), { x: d, y: u } = t, { width: f, height: g } = e; let p, m, b, x, _, y; return "center" === n ? (_ = u + g / 2, "left" === s ? (p = d, m = p - o, x = _ + o, y = _ - o) : (p = d + f, m = p + o, x = _ - o, y = _ + o), b = p) : (m = "left" === s ? d + Math.max(r, h) + o : "right" === s ? d + f - Math.max(l, c) - o : this.caretX, "top" === n ? (x = u, _ = x - o, p = m - o, b = m + o) : (x = u + g, _ = x + o, p = m + o, b = m - o), y = x), { x1: p, x2: m, x3: b, y1: x, y2: _, y3: y } } drawTitle(t, e, i) { const s = this.title, n = s.length; let o, a, r; if (n) { const l = yi(i.rtl, this.x, this.width); for (t.x = Xo(this, i.titleAlign, i), e.textAlign = l.textAlign(i.titleAlign), e.textBaseline = "middle", o = mi(i.titleFont), a = i.titleSpacing, e.fillStyle = i.titleColor, e.font = o.string, r = 0; r < n; ++r)e.fillText(s[r], l.x(t.x), t.y + o.lineHeight / 2), t.y += o.lineHeight + a, r + 1 === n && (t.y += i.titleMarginBottom - a) } } _drawColorBox(t, e, i, s, o) { const a = this.labelColors[i], r = this.labelPointStyles[i], { boxHeight: l, boxWidth: h, boxPadding: c } = o, d = mi(o.bodyFont), u = Xo(this, "left", o), f = s.x(u), g = l < d.lineHeight ? (d.lineHeight - l) / 2 : 0, p = e.y + g; if (o.usePointStyle) { const e = { radius: Math.min(h, l) / 2, pointStyle: r.pointStyle, rotation: r.rotation, borderWidth: 1 }, i = s.leftForLtr(f, h) + h / 2, n = p + l / 2; t.strokeStyle = o.multiKeyBackground, t.fillStyle = o.multiKeyBackground, Me(t, e, i, n), t.strokeStyle = a.borderColor, t.fillStyle = a.backgroundColor, Me(t, e, i, n) } else { t.lineWidth = n(a.borderWidth) ? Math.max(...Object.values(a.borderWidth)) : a.borderWidth || 1, t.strokeStyle = a.borderColor, t.setLineDash(a.borderDash || []), t.lineDashOffset = a.borderDashOffset || 0; const e = s.leftForLtr(f, h - c), i = s.leftForLtr(s.xPlus(f, 1), h - c - 2), r = gi(a.borderRadius); Object.values(r).some((t => 0 !== t)) ? (t.beginPath(), t.fillStyle = o.multiKeyBackground, Le(t, { x: e, y: p, w: h, h: l, radius: r }), t.fill(), t.stroke(), t.fillStyle = a.backgroundColor, t.beginPath(), Le(t, { x: i, y: p + 1, w: h - 2, h: l - 2, radius: r }), t.fill()) : (t.fillStyle = o.multiKeyBackground, t.fillRect(e, p, h, l), t.strokeRect(e, p, h, l), t.fillStyle = a.backgroundColor, t.fillRect(i, p + 1, h - 2, l - 2)) } t.fillStyle = this.labelTextColors[i] } drawBody(t, e, i) { const { body: s } = this, { bodySpacing: n, bodyAlign: o, displayColors: a, boxHeight: r, boxWidth: l, boxPadding: h } = i, c = mi(i.bodyFont); let u = c.lineHeight, f = 0; const g = yi(i.rtl, this.x, this.width), p = function (i) { e.fillText(i, g.x(t.x + f), t.y + u / 2), t.y += u + n }, m = g.textAlign(o); let b, x, _, y, v, w, M; for (e.textAlign = o, e.textBaseline = "middle", e.font = c.string, t.x = Xo(this, m, i), e.fillStyle = i.bodyColor, d(this.beforeBody, p), f = a && "right" !== m ? "center" === o ? l / 2 + h : l + 2 + h : 0, y = 0, w = s.length; y < w; ++y) { for (b = s[y], x = this.labelTextColors[y], e.fillStyle = x, d(b.before, p), _ = b.lines, a && _.length && (this._drawColorBox(e, t, y, g, i), u = Math.max(c.lineHeight, r)), v = 0, M = _.length; v < M; ++v)p(_[v]), u = c.lineHeight; d(b.after, p) } f = 0, u = c.lineHeight, d(this.afterBody, p), t.y -= n } drawFooter(t, e, i) { const s = this.footer, n = s.length; let o, a; if (n) { const r = yi(i.rtl, this.x, this.width); for (t.x = Xo(this, i.footerAlign, i), t.y += i.footerMarginTop, e.textAlign = r.textAlign(i.footerAlign), e.textBaseline = "middle", o = mi(i.footerFont), e.fillStyle = i.footerColor, e.font = o.string, a = 0; a < n; ++a)e.fillText(s[a], r.x(t.x), t.y + o.lineHeight / 2), t.y += o.lineHeight + i.footerSpacing } } drawBackground(t, e, i, s) { const { xAlign: n, yAlign: o } = this, { x: a, y: r } = t, { width: l, height: h } = i, { topLeft: c, topRight: d, bottomLeft: u, bottomRight: f } = gi(s.cornerRadius); e.fillStyle = s.backgroundColor, e.strokeStyle = s.borderColor, e.lineWidth = s.borderWidth, e.beginPath(), e.moveTo(a + c, r), "top" === o && this.drawCaret(t, e, i, s), e.lineTo(a + l - d, r), e.quadraticCurveTo(a + l, r, a + l, r + d), "center" === o && "right" === n && this.drawCaret(t, e, i, s), e.lineTo(a + l, r + h - f), e.quadraticCurveTo(a + l, r + h, a + l - f, r + h), "bottom" === o && this.drawCaret(t, e, i, s), e.lineTo(a + u, r + h), e.quadraticCurveTo(a, r + h, a, r + h - u), "center" === o && "left" === n && this.drawCaret(t, e, i, s), e.lineTo(a, r + c), e.quadraticCurveTo(a, r, a + c, r), e.closePath(), e.fill(), s.borderWidth > 0 && e.stroke() } _updateAnimationTarget(t) { const e = this.chart, i = this.$animations, s = i && i.x, n = i && i.y; if (s || n) { const i = Bo[t.position].call(this, this._active, this._eventPosition); if (!i) return; const o = this._size = Ho(this, t), a = Object.assign({}, i, this._size), r = Yo(e, t, a), l = Uo(t, a, r, e); s._to === l.x && n._to === l.y || (this.xAlign = r.xAlign, this.yAlign = r.yAlign, this.width = o.width, this.height = o.height, this.caretX = i.x, this.caretY = i.y, this._resolveAnimations().update(this, l)) } } _willRender() { return !!this.opacity } draw(t) { const e = this.options.setContext(this.getContext()); let i = this.opacity; if (!i) return; this._updateAnimationTarget(e); const s = { width: this.width, height: this.height }, n = { x: this.x, y: this.y }; i = Math.abs(i) < .001 ? 0 : i; const o = pi(e.padding), a = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length; e.enabled && a && (t.save(), t.globalAlpha = i, this.drawBackground(n, t, s, e), vi(t, e.textDirection), n.y += o.top, this.drawTitle(n, t, e), this.drawBody(n, t, e), this.drawFooter(n, t, e), wi(t, e.textDirection), t.restore()) } getActiveElements() { return this._active || [] } setActiveElements(t, e) { const i = this._active, s = t.map((({ datasetIndex: t, index: e }) => { const i = this.chart.getDatasetMeta(t); if (!i) throw new Error("Cannot find a dataset at index " + t); return { datasetIndex: t, element: i.data[e], index: e } })), n = !u(i, s), o = this._positionChanged(s, e); (n || o) && (this._active = s, this._eventPosition = e, this._ignoreReplayEvents = !0, this.update(!0)) } handleEvent(t, e, i = !0) { if (e && this._ignoreReplayEvents) return !1; this._ignoreReplayEvents = !1; const s = this.options, n = this._active || [], o = this._getActiveElements(t, n, e, i), a = this._positionChanged(o, t), r = e || !u(o, n) || a; return r && (this._active = o, (s.enabled || s.external) && (this._eventPosition = { x: t.x, y: t.y }, this.update(!0, e))), r } _getActiveElements(t, e, i, s) { const n = this.options; if ("mouseout" === t.type) return []; if (!s) return e; const o = this.chart.getElementsAtEventForMode(t, n.mode, n, i); return n.reverse && o.reverse(), o } _positionChanged(t, e) { const { caretX: i, caretY: s, options: n } = this, o = Bo[n.position].call(this, t, e); return !1 !== o && (i !== o.x || s !== o.y) } } Go.positioners = Bo; var Zo = { id: "tooltip", _element: Go, positioners: Bo, afterInit(t, e, i) { i && (t.tooltip = new Go({ chart: t, options: i })) }, beforeUpdate(t, e, i) { t.tooltip && t.tooltip.initialize(i) }, reset(t, e, i) { t.tooltip && t.tooltip.initialize(i) }, afterDraw(t) { const e = t.tooltip; if (e && e._willRender()) { const i = { tooltip: e }; if (!1 === t.notifyPlugins("beforeTooltipDraw", i)) return; e.draw(t.ctx), t.notifyPlugins("afterTooltipDraw", i) } }, afterEvent(t, e) { if (t.tooltip) { const i = e.replay; t.tooltip.handleEvent(e.event, i, e.inChartArea) && (e.changed = !0) } }, defaults: { enabled: !0, external: null, position: "average", backgroundColor: "rgba(0,0,0,0.8)", titleColor: "#fff", titleFont: { weight: "bold" }, titleSpacing: 2, titleMarginBottom: 6, titleAlign: "left", bodyColor: "#fff", bodySpacing: 2, bodyFont: {}, bodyAlign: "left", footerColor: "#fff", footerSpacing: 2, footerMarginTop: 6, footerFont: { weight: "bold" }, footerAlign: "left", padding: 6, caretPadding: 2, caretSize: 5, cornerRadius: 6, boxHeight: (t, e) => e.bodyFont.size, boxWidth: (t, e) => e.bodyFont.size, multiKeyBackground: "#fff", displayColors: !0, boxPadding: 0, borderColor: "rgba(0,0,0,0)", borderWidth: 0, animation: { duration: 400, easing: "easeOutQuart" }, animations: { numbers: { type: "number", properties: ["x", "y", "width", "height", "caretX", "caretY"] }, opacity: { easing: "linear", duration: 200 } }, callbacks: { beforeTitle: t, title(t) { if (t.length > 0) { const e = t[0], i = e.chart.data.labels, s = i ? i.length : 0; if (this && this.options && "dataset" === this.options.mode) return e.dataset.label || ""; if (e.label) return e.label; if (s > 0 && e.dataIndex < s) return i[e.dataIndex] } return "" }, afterTitle: t, beforeBody: t, beforeLabel: t, label(t) { if (this && this.options && "dataset" === this.options.mode) return t.label + ": " + t.formattedValue || t.formattedValue; let e = t.dataset.label || ""; e && (e += ": "); const s = t.formattedValue; return i(s) || (e += s), e }, labelColor(t) { const e = t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex); return { borderColor: e.borderColor, backgroundColor: e.backgroundColor, borderWidth: e.borderWidth, borderDash: e.borderDash, borderDashOffset: e.borderDashOffset, borderRadius: 0 } }, labelTextColor() { return this.options.bodyColor }, labelPointStyle(t) { const e = t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex); return { pointStyle: e.pointStyle, rotation: e.rotation } }, afterLabel: t, afterBody: t, beforeFooter: t, footer: t, afterFooter: t } }, defaultRoutes: { bodyFont: "font", footerFont: "font", titleFont: "font" }, descriptors: { _scriptable: t => "filter" !== t && "itemSort" !== t && "external" !== t, _indexable: !1, callbacks: { _scriptable: !1, _indexable: !1 }, animation: { _fallback: !1 }, animations: { _fallback: "animation" } }, additionalOptionScopes: ["interaction"] }, Jo = Object.freeze({ __proto__: null, Decimation: go, Filler: To, Legend: Ro, SubTitle: Vo, Title: zo, Tooltip: Zo }); function Qo(t, e, i, s) { const n = t.indexOf(e); if (-1 === n) return ((t, e, i, s) => ("string" == typeof e ? (i = t.push(e) - 1, s.unshift({ index: i, label: e })) : isNaN(e) && (i = null), i))(t, e, i, s); return n !== t.lastIndexOf(e) ? i : n } class ta extends $s { constructor(t) { super(t), this._startValue = void 0, this._valueRange = 0, this._addedLabels = [] } init(t) { const e = this._addedLabels; if (e.length) { const t = this.getLabels(); for (const { index: i, label: s } of e) t[i] === s && t.splice(i, 1); this._addedLabels = [] } super.init(t) } parse(t, e) { if (i(t)) return null; const s = this.getLabels(); return ((t, e) => null === t ? null : Z(Math.round(t), 0, e))(e = isFinite(e) && s[e] === t ? e : Qo(s, t, r(e, t), this._addedLabels), s.length - 1) } determineDataLimits() { const { minDefined: t, maxDefined: e } = this.getUserBounds(); let { min: i, max: s } = this.getMinMax(!0); "ticks" === this.options.bounds && (t || (i = 0), e || (s = this.getLabels().length - 1)), this.min = i, this.max = s } buildTicks() { const t = this.min, e = this.max, i = this.options.offset, s = []; let n = this.getLabels(); n = 0 === t && e === n.length - 1 ? n : n.slice(t, e + 1), this._valueRange = Math.max(n.length - (i ? 0 : 1), 1), this._startValue = this.min - (i ? .5 : 0); for (let i = t; i <= e; i++)s.push({ value: i }); return s } getLabelForValue(t) { const e = this.getLabels(); return t >= 0 && t < e.length ? e[t] : t } configure() { super.configure(), this.isHorizontal() || (this._reversePixels = !this._reversePixels) } getPixelForValue(t) { return "number" != typeof t && (t = this.parse(t)), null === t ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange) } getPixelForTick(t) { const e = this.ticks; return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value) } getValueForPixel(t) { return Math.round(this._startValue + this.getDecimalForPixel(t) * this._valueRange) } getBasePixel() { return this.bottom } } function ea(t, e, { horizontal: i, minRotation: s }) { const n = H(s), o = (i ? Math.sin(n) : Math.cos(n)) || .001, a = .75 * e * ("" + t).length; return Math.min(e / o, a) } ta.id = "category", ta.defaults = { ticks: { callback: ta.prototype.getLabelForValue } }; class ia extends $s { constructor(t) { super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._endValue = void 0, this._valueRange = 0 } parse(t, e) { return i(t) || ("number" == typeof t || t instanceof Number) && !isFinite(+t) ? null : +t } handleTickRangeOptions() { const { beginAtZero: t } = this.options, { minDefined: e, maxDefined: i } = this.getUserBounds(); let { min: s, max: n } = this; const o = t => s = e ? s : t, a = t => n = i ? n : t; if (t) { const t = z(s), e = z(n); t < 0 && e < 0 ? a(0) : t > 0 && e > 0 && o(0) } if (s === n) { let e = 1; (n >= Number.MAX_SAFE_INTEGER || s <= Number.MIN_SAFE_INTEGER) && (e = Math.abs(.05 * n)), a(n + e), t || o(s - e) } this.min = s, this.max = n } getTickLimit() { const t = this.options.ticks; let e, { maxTicksLimit: i, stepSize: s } = t; return s ? (e = Math.ceil(this.max / s) - Math.floor(this.min / s) + 1, e > 1e3 && (console.warn(`scales.${this.id}.ticks.stepSize: ${s} would result generating up to ${e} ticks. Limiting to 1000.`), e = 1e3)) : (e = this.computeTickLimit(), i = i || 11), i && (e = Math.min(i, e)), e } computeTickLimit() { return Number.POSITIVE_INFINITY } buildTicks() { const t = this.options, e = t.ticks; let s = this.getTickLimit(); s = Math.max(2, s); const n = function (t, e) { const s = [], { bounds: n, step: o, min: a, max: r, precision: l, count: h, maxTicks: c, maxDigits: d, includeBounds: u } = t, f = o || 1, g = c - 1, { min: p, max: m } = e, b = !i(a), x = !i(r), _ = !i(h), y = (m - p) / (d + 1); let v, w, M, k, S = F((m - p) / g / f) * f; if (S < 1e-14 && !b && !x) return [{ value: p }, { value: m }]; k = Math.ceil(m / S) - Math.floor(p / S), k > g && (S = F(k * S / g / f) * f), i(l) || (v = Math.pow(10, l), S = Math.ceil(S * v) / v), "ticks" === n ? (w = Math.floor(p / S) * S, M = Math.ceil(m / S) * S) : (w = p, M = m), b && x && o && W((r - a) / o, S / 1e3) ? (k = Math.round(Math.min((r - a) / S, c)), S = (r - a) / k, w = a, M = r) : _ ? (w = b ? a : w, M = x ? r : M, k = h - 1, S = (M - w) / k) : (k = (M - w) / S, k = N(k, Math.round(k), S / 1e3) ? Math.round(k) : Math.ceil(k)); const P = Math.max(Y(S), Y(w)); v = Math.pow(10, i(l) ? P : l), w = Math.round(w * v) / v, M = Math.round(M * v) / v; let D = 0; for (b && (u && w !== a ? (s.push({ value: a }), w < a && D++, N(Math.round((w + D * S) * v) / v, a, ea(a, y, t)) && D++) : w < a && D++); D < k; ++D)s.push({ value: Math.round((w + D * S) * v) / v }); return x && u && M !== r ? s.length && N(s[s.length - 1].value, r, ea(r, y, t)) ? s[s.length - 1].value = r : s.push({ value: r }) : x && M !== r || s.push({ value: M }), s }({ maxTicks: s, bounds: t.bounds, min: t.min, max: t.max, precision: e.precision, step: e.stepSize, count: e.count, maxDigits: this._maxDigits(), horizontal: this.isHorizontal(), minRotation: e.minRotation || 0, includeBounds: !1 !== e.includeBounds }, this._range || this); return "ticks" === t.bounds && j(n, this, "value"), t.reverse ? (n.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), n } configure() { const t = this.ticks; let e = this.min, i = this.max; if (super.configure(), this.options.offset && t.length) { const s = (i - e) / Math.max(t.length - 1, 1) / 2; e -= s, i += s } this._startValue = e, this._endValue = i, this._valueRange = i - e } getLabelForValue(t) { return li(t, this.chart.options.locale, this.options.ticks.format) } } class sa extends ia { determineDataLimits() { const { min: t, max: e } = this.getMinMax(!0); this.min = o(t) ? t : 0, this.max = o(e) ? e : 1, this.handleTickRangeOptions() } computeTickLimit() { const t = this.isHorizontal(), e = t ? this.width : this.height, i = H(this.options.ticks.minRotation), s = (t ? Math.sin(i) : Math.cos(i)) || .001, n = this._resolveTickFontOptions(0); return Math.ceil(e / Math.min(40, n.lineHeight / s)) } getPixelForValue(t) { return null === t ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange) } getValueForPixel(t) { return this._startValue + this.getDecimalForPixel(t) * this._valueRange } } function na(t) { return 1 === t / Math.pow(10, Math.floor(I(t))) } sa.id = "linear", sa.defaults = { ticks: { callback: Is.formatters.numeric } }; class oa extends $s { constructor(t) { super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._valueRange = 0 } parse(t, e) { const i = ia.prototype.parse.apply(this, [t, e]); if (0 !== i) return o(i) && i > 0 ? i : null; this._zero = !0 } determineDataLimits() { const { min: t, max: e } = this.getMinMax(!0); this.min = o(t) ? Math.max(0, t) : null, this.max = o(e) ? Math.max(0, e) : null, this.options.beginAtZero && (this._zero = !0), this.handleTickRangeOptions() } handleTickRangeOptions() { const { minDefined: t, maxDefined: e } = this.getUserBounds(); let i = this.min, s = this.max; const n = e => i = t ? i : e, o = t => s = e ? s : t, a = (t, e) => Math.pow(10, Math.floor(I(t)) + e); i === s && (i <= 0 ? (n(1), o(10)) : (n(a(i, -1)), o(a(s, 1)))), i <= 0 && n(a(s, -1)), s <= 0 && o(a(i, 1)), this._zero && this.min !== this._suggestedMin && i === a(this.min, 0) && n(a(i, -1)), this.min = i, this.max = s } buildTicks() { const t = this.options, e = function (t, e) { const i = Math.floor(I(e.max)), s = Math.ceil(e.max / Math.pow(10, i)), n = []; let o = a(t.min, Math.pow(10, Math.floor(I(e.min)))), r = Math.floor(I(o)), l = Math.floor(o / Math.pow(10, r)), h = r < 0 ? Math.pow(10, Math.abs(r)) : 1; do { n.push({ value: o, major: na(o) }), ++l, 10 === l && (l = 1, ++r, h = r >= 0 ? 1 : h), o = Math.round(l * Math.pow(10, r) * h) / h } while (r < i || r === i && l < s); const c = a(t.max, o); return n.push({ value: c, major: na(o) }), n }({ min: this._userMin, max: this._userMax }, this); return "ticks" === t.bounds && j(e, this, "value"), t.reverse ? (e.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), e } getLabelForValue(t) { return void 0 === t ? "0" : li(t, this.chart.options.locale, this.options.ticks.format) } configure() { const t = this.min; super.configure(), this._startValue = I(t), this._valueRange = I(this.max) - I(t) } getPixelForValue(t) { return void 0 !== t && 0 !== t || (t = this.min), null === t || isNaN(t) ? NaN : this.getPixelForDecimal(t === this.min ? 0 : (I(t) - this._startValue) / this._valueRange) } getValueForPixel(t) { const e = this.getDecimalForPixel(t); return Math.pow(10, this._startValue + e * this._valueRange) } } function aa(t) { const e = t.ticks; if (e.display && t.display) { const t = pi(e.backdropPadding); return r(e.font && e.font.size, ne.font.size) + t.height } return 0 } function ra(t, e, i, s, n) { return t === s || t === n ? { start: e - i / 2, end: e + i / 2 } : t < s || t > n ? { start: e - i, end: e } : { start: e, end: e + i } } function la(t) { const e = { l: t.left + t._padding.left, r: t.right - t._padding.right, t: t.top + t._padding.top, b: t.bottom - t._padding.bottom }, i = Object.assign({}, e), n = [], o = [], a = t._pointLabels.length, r = t.options.pointLabels, l = r.centerPointLabels ? D / a : 0; for (let u = 0; u < a; u++) { const a = r.setContext(t.getPointLabelContext(u)); o[u] = a.padding; const f = t.getPointPosition(u, t.drawingArea + o[u], l), g = mi(a.font), p = (h = t.ctx, c = g, d = s(d = t._pointLabels[u]) ? d : [d], { w: ye(h, c.string, d), h: d.length * c.lineHeight }); n[u] = p; const m = K(t.getIndexAngle(u) + l), b = Math.round($(m)); ha(i, e, m, ra(b, f.x, p.w, 0, 180), ra(b, f.y, p.h, 90, 270)) } var h, c, d; t.setCenterPoint(e.l - i.l, i.r - e.r, e.t - i.t, i.b - e.b), t._pointLabelItems = function (t, e, i) { const s = [], n = t._pointLabels.length, o = t.options, a = aa(o) / 2, r = t.drawingArea, l = o.pointLabels.centerPointLabels ? D / n : 0; for (let o = 0; o < n; o++) { const n = t.getPointPosition(o, r + a + i[o], l), h = Math.round($(K(n.angle + L))), c = e[o], d = ua(n.y, c.h, h), u = ca(h), f = da(n.x, c.w, u); s.push({ x: n.x, y: d, textAlign: u, left: f, top: d, right: f + c.w, bottom: d + c.h }) } return s }(t, n, o) } function ha(t, e, i, s, n) { const o = Math.abs(Math.sin(i)), a = Math.abs(Math.cos(i)); let r = 0, l = 0; s.start < e.l ? (r = (e.l - s.start) / o, t.l = Math.min(t.l, e.l - r)) : s.end > e.r && (r = (s.end - e.r) / o, t.r = Math.max(t.r, e.r + r)), n.start < e.t ? (l = (e.t - n.start) / a, t.t = Math.min(t.t, e.t - l)) : n.end > e.b && (l = (n.end - e.b) / a, t.b = Math.max(t.b, e.b + l)) } function ca(t) { return 0 === t || 180 === t ? "center" : t < 180 ? "left" : "right" } function da(t, e, i) { return "right" === i ? t -= e : "center" === i && (t -= e / 2), t } function ua(t, e, i) { return 90 === i || 270 === i ? t -= e / 2 : (i > 270 || i < 90) && (t -= e), t } function fa(t, e, i, s) { const { ctx: n } = t; if (i) n.arc(t.xCenter, t.yCenter, e, 0, O); else { let i = t.getPointPosition(0, e); n.moveTo(i.x, i.y); for (let o = 1; o < s; o++)i = t.getPointPosition(o, e), n.lineTo(i.x, i.y) } } oa.id = "logarithmic", oa.defaults = { ticks: { callback: Is.formatters.logarithmic, major: { enabled: !0 } } }; class ga extends ia { constructor(t) { super(t), this.xCenter = void 0, this.yCenter = void 0, this.drawingArea = void 0, this._pointLabels = [], this._pointLabelItems = [] } setDimensions() { const t = this._padding = pi(aa(this.options) / 2), e = this.width = this.maxWidth - t.width, i = this.height = this.maxHeight - t.height; this.xCenter = Math.floor(this.left + e / 2 + t.left), this.yCenter = Math.floor(this.top + i / 2 + t.top), this.drawingArea = Math.floor(Math.min(e, i) / 2) } determineDataLimits() { const { min: t, max: e } = this.getMinMax(!1); this.min = o(t) && !isNaN(t) ? t : 0, this.max = o(e) && !isNaN(e) ? e : 0, this.handleTickRangeOptions() } computeTickLimit() { return Math.ceil(this.drawingArea / aa(this.options)) } generateTickLabels(t) { ia.prototype.generateTickLabels.call(this, t), this._pointLabels = this.getLabels().map(((t, e) => { const i = c(this.options.pointLabels.callback, [t, e], this); return i || 0 === i ? i : "" })).filter(((t, e) => this.chart.getDataVisibility(e))) } fit() { const t = this.options; t.display && t.pointLabels.display ? la(this) : this.setCenterPoint(0, 0, 0, 0) } setCenterPoint(t, e, i, s) { this.xCenter += Math.floor((t - e) / 2), this.yCenter += Math.floor((i - s) / 2), this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(t, e, i, s)) } getIndexAngle(t) { return K(t * (O / (this._pointLabels.length || 1)) + H(this.options.startAngle || 0)) } getDistanceFromCenterForValue(t) { if (i(t)) return NaN; const e = this.drawingArea / (this.max - this.min); return this.options.reverse ? (this.max - t) * e : (t - this.min) * e } getValueForDistanceFromCenter(t) { if (i(t)) return NaN; const e = t / (this.drawingArea / (this.max - this.min)); return this.options.reverse ? this.max - e : this.min + e } getPointLabelContext(t) { const e = this._pointLabels || []; if (t >= 0 && t < e.length) { const i = e[t]; return function (t, e, i) { return _i(t, { label: i, index: e, type: "pointLabel" }) }(this.getContext(), t, i) } } getPointPosition(t, e, i = 0) { const s = this.getIndexAngle(t) - L + i; return { x: Math.cos(s) * e + this.xCenter, y: Math.sin(s) * e + this.yCenter, angle: s } } getPointPositionForValue(t, e) { return this.getPointPosition(t, this.getDistanceFromCenterForValue(e)) } getBasePosition(t) { return this.getPointPositionForValue(t || 0, this.getBaseValue()) } getPointLabelPosition(t) { const { left: e, top: i, right: s, bottom: n } = this._pointLabelItems[t]; return { left: e, top: i, right: s, bottom: n } } drawBackground() { const { backgroundColor: t, grid: { circular: e } } = this.options; if (t) { const i = this.ctx; i.save(), i.beginPath(), fa(this, this.getDistanceFromCenterForValue(this._endValue), e, this._pointLabels.length), i.closePath(), i.fillStyle = t, i.fill(), i.restore() } } drawGrid() { const t = this.ctx, e = this.options, { angleLines: s, grid: n } = e, o = this._pointLabels.length; let a, r, l; if (e.pointLabels.display && function (t, e) { const { ctx: s, options: { pointLabels: n } } = t; for (let o = e - 1; o >= 0; o--) { const e = n.setContext(t.getPointLabelContext(o)), a = mi(e.font), { x: r, y: l, textAlign: h, left: c, top: d, right: u, bottom: f } = t._pointLabelItems[o], { backdropColor: g } = e; if (!i(g)) { const t = gi(e.borderRadius), i = pi(e.backdropPadding); s.fillStyle = g; const n = c - i.left, o = d - i.top, a = u - c + i.width, r = f - d + i.height; Object.values(t).some((t => 0 !== t)) ? (s.beginPath(), Le(s, { x: n, y: o, w: a, h: r, radius: t }), s.fill()) : s.fillRect(n, o, a, r) } Ae(s, t._pointLabels[o], r, l + a.lineHeight / 2, a, { color: e.color, textAlign: h, textBaseline: "middle" }) } }(this, o), n.display && this.ticks.forEach(((t, e) => { if (0 !== e) { r = this.getDistanceFromCenterForValue(t.value); !function (t, e, i, s) { const n = t.ctx, o = e.circular, { color: a, lineWidth: r } = e; !o && !s || !a || !r || i < 0 || (n.save(), n.strokeStyle = a, n.lineWidth = r, n.setLineDash(e.borderDash), n.lineDashOffset = e.borderDashOffset, n.beginPath(), fa(t, i, o, s), n.closePath(), n.stroke(), n.restore()) }(this, n.setContext(this.getContext(e - 1)), r, o) } })), s.display) { for (t.save(), a = o - 1; a >= 0; a--) { const i = s.setContext(this.getPointLabelContext(a)), { color: n, lineWidth: o } = i; o && n && (t.lineWidth = o, t.strokeStyle = n, t.setLineDash(i.borderDash), t.lineDashOffset = i.borderDashOffset, r = this.getDistanceFromCenterForValue(e.ticks.reverse ? this.min : this.max), l = this.getPointPosition(a, r), t.beginPath(), t.moveTo(this.xCenter, this.yCenter), t.lineTo(l.x, l.y), t.stroke()) } t.restore() } } drawBorder() { } drawLabels() { const t = this.ctx, e = this.options, i = e.ticks; if (!i.display) return; const s = this.getIndexAngle(0); let n, o; t.save(), t.translate(this.xCenter, this.yCenter), t.rotate(s), t.textAlign = "center", t.textBaseline = "middle", this.ticks.forEach(((s, a) => { if (0 === a && !e.reverse) return; const r = i.setContext(this.getContext(a)), l = mi(r.font); if (n = this.getDistanceFromCenterForValue(this.ticks[a].value), r.showLabelBackdrop) { t.font = l.string, o = t.measureText(s.label).width, t.fillStyle = r.backdropColor; const e = pi(r.backdropPadding); t.fillRect(-o / 2 - e.left, -n - l.size / 2 - e.top, o + e.width, l.size + e.height) } Ae(t, s.label, 0, -n, l, { color: r.color }) })), t.restore() } drawTitle() { } } ga.id = "radialLinear", ga.defaults = { display: !0, animate: !0, position: "chartArea", angleLines: { display: !0, lineWidth: 1, borderDash: [], borderDashOffset: 0 }, grid: { circular: !1 }, startAngle: 0, ticks: { showLabelBackdrop: !0, callback: Is.formatters.numeric }, pointLabels: { backdropColor: void 0, backdropPadding: 2, display: !0, font: { size: 10 }, callback: t => t, padding: 5, centerPointLabels: !1 } }, ga.defaultRoutes = { "angleLines.color": "borderColor", "pointLabels.color": "color", "ticks.color": "color" }, ga.descriptors = { angleLines: { _fallback: "grid" } }; const pa = { millisecond: { common: !0, size: 1, steps: 1e3 }, second: { common: !0, size: 1e3, steps: 60 }, minute: { common: !0, size: 6e4, steps: 60 }, hour: { common: !0, size: 36e5, steps: 24 }, day: { common: !0, size: 864e5, steps: 30 }, week: { common: !1, size: 6048e5, steps: 4 }, month: { common: !0, size: 2628e6, steps: 12 }, quarter: { common: !1, size: 7884e6, steps: 4 }, year: { common: !0, size: 3154e7 } }, ma = Object.keys(pa); function ba(t, e) { return t - e } function xa(t, e) { if (i(e)) return null; const s = t._adapter, { parser: n, round: a, isoWeekday: r } = t._parseOpts; let l = e; return "function" == typeof n && (l = n(l)), o(l) || (l = "string" == typeof n ? s.parse(l, n) : s.parse(l)), null === l ? null : (a && (l = "week" !== a || !B(r) && !0 !== r ? s.startOf(l, a) : s.startOf(l, "isoWeek", r)), +l) } function _a(t, e, i, s) { const n = ma.length; for (let o = ma.indexOf(t); o < n - 1; ++o) { const t = pa[ma[o]], n = t.steps ? t.steps : Number.MAX_SAFE_INTEGER; if (t.common && Math.ceil((i - e) / (n * t.size)) <= s) return ma[o] } return ma[n - 1] } function ya(t, e, i) { if (i) { if (i.length) { const { lo: s, hi: n } = tt(i, e); t[i[s] >= e ? i[s] : i[n]] = !0 } } else t[e] = !0 } function va(t, e, i) { const s = [], n = {}, o = e.length; let a, r; for (a = 0; a < o; ++a)r = e[a], n[r] = a, s.push({ value: r, major: !1 }); return 0 !== o && i ? function (t, e, i, s) { const n = t._adapter, o = +n.startOf(e[0].value, s), a = e[e.length - 1].value; let r, l; for (r = o; r <= a; r = +n.add(r, 1, s))l = i[r], l >= 0 && (e[l].major = !0); return e }(t, s, n, i) : s } class wa extends $s { constructor(t) { super(t), this._cache = { data: [], labels: [], all: [] }, this._unit = "day", this._majorUnit = void 0, this._offsets = {}, this._normalized = !1, this._parseOpts = void 0 } init(t, e) { const i = t.time || (t.time = {}), s = this._adapter = new wn._date(t.adapters.date); s.init(e), b(i.displayFormats, s.formats()), this._parseOpts = { parser: i.parser, round: i.round, isoWeekday: i.isoWeekday }, super.init(t), this._normalized = e.normalized } parse(t, e) { return void 0 === t ? null : xa(this, t) } beforeLayout() { super.beforeLayout(), this._cache = { data: [], labels: [], all: [] } } determineDataLimits() { const t = this.options, e = this._adapter, i = t.time.unit || "day"; let { min: s, max: n, minDefined: a, maxDefined: r } = this.getUserBounds(); function l(t) { a || isNaN(t.min) || (s = Math.min(s, t.min)), r || isNaN(t.max) || (n = Math.max(n, t.max)) } a && r || (l(this._getLabelBounds()), "ticks" === t.bounds && "labels" === t.ticks.source || l(this.getMinMax(!1))), s = o(s) && !isNaN(s) ? s : +e.startOf(Date.now(), i), n = o(n) && !isNaN(n) ? n : +e.endOf(Date.now(), i) + 1, this.min = Math.min(s, n - 1), this.max = Math.max(s + 1, n) } _getLabelBounds() { const t = this.getLabelTimestamps(); let e = Number.POSITIVE_INFINITY, i = Number.NEGATIVE_INFINITY; return t.length && (e = t[0], i = t[t.length - 1]), { min: e, max: i } } buildTicks() { const t = this.options, e = t.time, i = t.ticks, s = "labels" === i.source ? this.getLabelTimestamps() : this._generate(); "ticks" === t.bounds && s.length && (this.min = this._userMin || s[0], this.max = this._userMax || s[s.length - 1]); const n = this.min, o = st(s, n, this.max); return this._unit = e.unit || (i.autoSkip ? _a(e.minUnit, this.min, this.max, this._getLabelCapacity(n)) : function (t, e, i, s, n) { for (let o = ma.length - 1; o >= ma.indexOf(i); o--) { const i = ma[o]; if (pa[i].common && t._adapter.diff(n, s, i) >= e - 1) return i } return ma[i ? ma.indexOf(i) : 0] }(this, o.length, e.minUnit, this.min, this.max)), this._majorUnit = i.major.enabled && "year" !== this._unit ? function (t) { for (let e = ma.indexOf(t) + 1, i = ma.length; e < i; ++e)if (pa[ma[e]].common) return ma[e] }(this._unit) : void 0, this.initOffsets(s), t.reverse && o.reverse(), va(this, o, this._majorUnit) } afterAutoSkip() { this.options.offsetAfterAutoskip && this.initOffsets(this.ticks.map((t => +t.value))) } initOffsets(t) { let e, i, s = 0, n = 0; this.options.offset && t.length && (e = this.getDecimalForValue(t[0]), s = 1 === t.length ? 1 - e : (this.getDecimalForValue(t[1]) - e) / 2, i = this.getDecimalForValue(t[t.length - 1]), n = 1 === t.length ? i : (i - this.getDecimalForValue(t[t.length - 2])) / 2); const o = t.length < 3 ? .5 : .25; s = Z(s, 0, o), n = Z(n, 0, o), this._offsets = { start: s, end: n, factor: 1 / (s + 1 + n) } } _generate() { const t = this._adapter, e = this.min, i = this.max, s = this.options, n = s.time, o = n.unit || _a(n.minUnit, e, i, this._getLabelCapacity(e)), a = r(n.stepSize, 1), l = "week" === o && n.isoWeekday, h = B(l) || !0 === l, c = {}; let d, u, f = e; if (h && (f = +t.startOf(f, "isoWeek", l)), f = +t.startOf(f, h ? "day" : o), t.diff(i, e, o) > 1e5 * a) throw new Error(e + " and " + i + " are too far apart with stepSize of " + a + " " + o); const g = "data" === s.ticks.source && this.getDataTimestamps(); for (d = f, u = 0; d < i; d = +t.add(d, a, o), u++)ya(c, d, g); return d !== i && "ticks" !== s.bounds && 1 !== u || ya(c, d, g), Object.keys(c).sort(((t, e) => t - e)).map((t => +t)) } getLabelForValue(t) { const e = this._adapter, i = this.options.time; return i.tooltipFormat ? e.format(t, i.tooltipFormat) : e.format(t, i.displayFormats.datetime) } _tickFormatFunction(t, e, i, s) { const n = this.options, o = n.time.displayFormats, a = this._unit, r = this._majorUnit, l = a && o[a], h = r && o[r], d = i[e], u = r && h && d && d.major, f = this._adapter.format(t, s || (u ? h : l)), g = n.ticks.callback; return g ? c(g, [f, e, i], this) : f } generateTickLabels(t) { let e, i, s; for (e = 0, i = t.length; e < i; ++e)s = t[e], s.label = this._tickFormatFunction(s.value, e, t) } getDecimalForValue(t) { return null === t ? NaN : (t - this.min) / (this.max - this.min) } getPixelForValue(t) { const e = this._offsets, i = this.getDecimalForValue(t); return this.getPixelForDecimal((e.start + i) * e.factor) } getValueForPixel(t) { const e = this._offsets, i = this.getDecimalForPixel(t) / e.factor - e.end; return this.min + i * (this.max - this.min) } _getLabelSize(t) { const e = this.options.ticks, i = this.ctx.measureText(t).width, s = H(this.isHorizontal() ? e.maxRotation : e.minRotation), n = Math.cos(s), o = Math.sin(s), a = this._resolveTickFontOptions(0).size; return { w: i * n + a * o, h: i * o + a * n } } _getLabelCapacity(t) { const e = this.options.time, i = e.displayFormats, s = i[e.unit] || i.millisecond, n = this._tickFormatFunction(t, 0, va(this, [t], this._majorUnit), s), o = this._getLabelSize(n), a = Math.floor(this.isHorizontal() ? this.width / o.w : this.height / o.h) - 1; return a > 0 ? a : 1 } getDataTimestamps() { let t, e, i = this._cache.data || []; if (i.length) return i; const s = this.getMatchingVisibleMetas(); if (this._normalized && s.length) return this._cache.data = s[0].controller.getAllParsedValues(this); for (t = 0, e = s.length; t < e; ++t)i = i.concat(s[t].controller.getAllParsedValues(this)); return this._cache.data = this.normalize(i) } getLabelTimestamps() { const t = this._cache.labels || []; let e, i; if (t.length) return t; const s = this.getLabels(); for (e = 0, i = s.length; e < i; ++e)t.push(xa(this, s[e])); return this._cache.labels = this._normalized ? t : this.normalize(t) } normalize(t) { return rt(t.sort(ba)) } } function Ma(t, e, i) { let s, n, o, a, r = 0, l = t.length - 1; i ? (e >= t[r].pos && e <= t[l].pos && ({ lo: r, hi: l } = et(t, "pos", e)), ({ pos: s, time: o } = t[r]), ({ pos: n, time: a } = t[l])) : (e >= t[r].time && e <= t[l].time && ({ lo: r, hi: l } = et(t, "time", e)), ({ time: s, pos: o } = t[r]), ({ time: n, pos: a } = t[l])); const h = n - s; return h ? o + (a - o) * (e - s) / h : o } wa.id = "time", wa.defaults = { bounds: "data", adapters: {}, time: { parser: !1, unit: !1, round: !1, isoWeekday: !1, minUnit: "millisecond", displayFormats: {} }, ticks: { source: "auto", major: { enabled: !1 } } }; class ka extends wa { constructor(t) { super(t), this._table = [], this._minPos = void 0, this._tableRange = void 0 } initOffsets() { const t = this._getTimestampsForTable(), e = this._table = this.buildLookupTable(t); this._minPos = Ma(e, this.min), this._tableRange = Ma(e, this.max) - this._minPos, super.initOffsets(t) } buildLookupTable(t) { const { min: e, max: i } = this, s = [], n = []; let o, a, r, l, h; for (o = 0, a = t.length; o < a; ++o)l = t[o], l >= e && l <= i && s.push(l); if (s.length < 2) return [{ time: e, pos: 0 }, { time: i, pos: 1 }]; for (o = 0, a = s.length; o < a; ++o)h = s[o + 1], r = s[o - 1], l = s[o], Math.round((h + r) / 2) !== l && n.push({ time: l, pos: o / (a - 1) }); return n } _getTimestampsForTable() { let t = this._cache.all || []; if (t.length) return t; const e = this.getDataTimestamps(), i = this.getLabelTimestamps(); return t = e.length && i.length ? this.normalize(e.concat(i)) : e.length ? e : i, t = this._cache.all = t, t } getDecimalForValue(t) { return (Ma(this._table, t) - this._minPos) / this._tableRange } getValueForPixel(t) { const e = this._offsets, i = this.getDecimalForPixel(t) / e.factor - e.end; return Ma(this._table, i * this._tableRange + this._minPos, !0) } } ka.id = "timeseries", ka.defaults = wa.defaults; var Sa = Object.freeze({ __proto__: null, CategoryScale: ta, LinearScale: sa, LogarithmicScale: oa, RadialLinearScale: ga, TimeScale: wa, TimeSeriesScale: ka }); return bn.register(Bn, Sa, co, Jo), bn.helpers = { ...Ti }, bn._adapters = wn, bn.Animation = xs, bn.Animations = ys, bn.animator = mt, bn.controllers = Us.controllers.items, bn.DatasetController = Ls, bn.Element = Es, bn.elements = co, bn.Interaction = Vi, bn.layouts = Zi, bn.platforms = ps, bn.Scale = $s, bn.Ticks = Is, Object.assign(bn, Bn, Sa, co, Jo, ps), bn.Chart = bn, "undefined" != typeof window && (window.Chart = bn), bn }));
        // [End of Chart.js]
        Chart.defaults.color = darkmode ? "#fff" : '#000';
        var canvas = document.getElementById("mod-chart-1");
        var ctx = canvas.getContext("2d");
        var points = [];
        var dates = [];
        const color = toBrightnessValue(get("primarycolor"), 150);
        const endcolor = hexToRgb(color);
        var gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(' + endcolor[0] + ',' + endcolor[1] + ',' + endcolor[2] + ',0)');
        for (const element of tn('sl-resultaat-item')) {
            const grade = parseFloat(element.getElementsByClassName('cijfer')[0].children[0].innerHTML.replace(',', '.'));
            if (!isNaN(grade)) {
                points.unshift(grade);
                dates.unshift(element.getElementsByClassName('subtitel')[0].innerHTML);
            }
        }
        if (points.length == 0) {
            hide(id('mod-grades-graphs'));
            return;
        }
        var data = {
            labels: dates,
            datasets: [{
                label: cn('vaknaam', 0).getElementsByTagName('span')[0].innerHTML,
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
        var chart = new Chart(ctx, {
            type: 'line',
            data: data,
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
        canvas = document.getElementById("mod-chart-2");
        ctx = canvas.getContext("2d");
        points = [];
        dates = [];
        var totalGrades = 0;
        var totalWeight = 0;
        for (var i = tn('sl-resultaat-item').length - 1; i >= 0; i--) {
            const grade = parseFloat(tn('sl-resultaat-item', i).getElementsByClassName('cijfer')[0].children[0].innerHTML.replace(',', '.'));
            const weight = parseFloat(tn('sl-resultaat-item', i).getElementsByClassName('weging')[0].innerHTML.replace(',', '.'));
            if (!isNaN(grade) && !isNaN(weight)) {
                totalGrades += grade * weight;
                totalWeight += weight;
                points.push(Math.floor((totalGrades / totalWeight) * 100) / 100);
                dates.push(tn('sl-resultaat-item', i).getElementsByClassName('subtitel')[0].innerHTML);
            }
        }
        data = {
            labels: dates,
            datasets: [{
                label: cn('vaknaam', 0).getElementsByTagName('span')[0].innerHTML,
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
        chart = new Chart(ctx, {
            type: 'line',
            data: data,
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

    // Add grade calculation tools when enabled
    function insertCalculationTool() {
        if (n(id('mod-grade-calculate')) && get('bools').charAt(10) == "1") {
            tn('sl-vakresultaten', 0).insertAdjacentHTML('beforeend', '<div id="mod-grade-calculate"><h3>Gemiddelde berekenen</h3><p>Wat moet ik halen?</p><input id="mod-grade-one-one" type="number" placeholder="Ik wil staan"/><input id="mod-grade-one-two" type="number" placeholder="Weging"/><input id="mod-grade-one-three" type="submit" value="Berekenen"/><br><p>Wat ga ik staan?</p><input id="mod-grade-two-one" type="number" placeholder="Ik haal een"/><input id="mod-grade-two-two" type="number" placeholder="Weging"/><input id="mod-grade-two-three" type="submit" value="Berekenen"/></div>')
            id('mod-grade-one-three').addEventListener('click', function () {
                // Calculate average
                let total = 0;
                let weight = 0;
                for (const element of tn('sl-resultaat-item')) {
                    const tempGrade = parseFloat(element.getElementsByClassName('cijfer')[0].children[0].innerHTML.replace(',', '.'));
                    const tempWeight = parseFloat(element.getElementsByClassName('weging')[0].innerHTML.substring(0, element.getElementsByClassName('weging')[0].innerHTML.length - 1));
                    if (!isNaN(tempGrade) && !isNaN(tempWeight)) {
                        total += tempGrade * tempWeight;
                        weight += tempWeight;
                    }
                }
                // Calculate grade needed for chosen average
                let chosenAverage = parseFloat(id('mod-grade-one-one').value);
                let chosenWeight = parseFloat(id('mod-grade-one-two').value);
                if (isNaN(chosenAverage) || isNaN(chosenWeight)) {
                    id('mod-grade-one-three').value = "Berekenen";
                }
                else {
                    id('mod-grade-one-three').value = (Math.ceil(((chosenAverage * (chosenWeight + weight) - total) / chosenWeight) * 100) / 100).toFixed(2).toString().replace('.', ',');
                }
            });
            id('mod-grade-two-three').addEventListener('click', function () {
                // Calculate average
                let total = 0;
                let weight = 0;
                for (const element of tn('sl-resultaat-item')) {
                    const tempGrade = parseFloat(element.getElementsByClassName('cijfer')[0].children[0].innerHTML.replace(',', '.'));
                    const tempWeight = parseFloat(element.getElementsByClassName('weging')[0].innerHTML.substring(0, element.getElementsByClassName('weging')[0].innerHTML.length - 1));
                    if (!isNaN(tempGrade) && !isNaN(tempWeight)) {
                        total += tempGrade * tempWeight;
                        weight += tempWeight;
                    }
                }
                // Calculate average with chosen grade added
                let chosenGrade = parseFloat(id('mod-grade-two-one').value);
                let chosenWeight = parseFloat(id('mod-grade-two-two').value);
                if (isNaN(chosenGrade) || isNaN(chosenWeight)) {
                    id('mod-grade-two-three').value = "Berekenen";
                }
                else {
                    total += chosenGrade * chosenWeight;
                    weight += chosenWeight;
                    id('mod-grade-two-three').value = (Math.floor((total / weight) * 100) / 100).toFixed(2).toString().replace('.', ',');
                }
            });
        }
    }

    // Check if latest grades page or average grades page is open
    function insertGradeDownloadButton() {
        if ((!n(tn('sl-resultaat-item', 0)) || !n(tn('sl-vakgemiddelde-item', 0))) && n(tn('sl-vakresultaten', 0)) && get("bools").charAt(5) == "1") {
            if (n(id('mod-grades-download-computer')) && !n(tn('hmy-switch-group', 0))) {
                tn('hmy-switch-group', 0).insertAdjacentHTML('beforeend', '<a id="mod-grades-download-computer" class="mod-grades-download">' + getIcon('download', null, 'var(--fg-primary-normal)') + '</a>');
                id('mod-grades-download-computer').addEventListener('click', downloadGrades);
            }
            if (n(id('mod-grades-download-mobile')) && !n(cn('tabs ng-star-inserted', 0))) {
                cn('tabs ng-star-inserted', 0).getElementsByClassName('filler')[0].insertAdjacentHTML('beforeend', '<a id="mod-grades-download-mobile" class="mod-grades-download">' + getIcon('download', null, 'var(--fg-primary-normal)') + '</a>');
                id('mod-grades-download-mobile').addEventListener('click', downloadGrades);
            }
        }
    }

    // Manage calculation tool and graph on subject grades page
    function subjectGradesPage() {
        if (!n(tn('sl-vakresultaten', 0))) {
            insertCalculationTool();
            // Insert graphs at subject grades page when enabled
            if (n(id('mod-grades-graphs')) && get("bools").charAt(7) == "1" && !n(tn('sl-resultaat-item', 0))) {
                tn('sl-vakresultaten', 0).insertAdjacentHTML('beforeend', '<div id="mod-grades-graphs"><h3>Mijn cijfers</h3><div><canvas id="mod-chart-1"></canvas></div><h3>Mijn gemiddelde</h3><div><canvas id="mod-chart-2"></canvas></div></div>');
                setTimeout(gradeGraphs, 500);
            }
        }
    }





    // 9 - MODSETTINGS

    // Open modsettings
    function openSettings() {
        tryRemove(id('mod-setting-panel'));
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
        id("mod-setting-button").classList.add('active');
        if (tn('sl-account-modal-header', 1) != null) {
            tn('sl-account-modal-header', 1).getElementsByClassName('ng-star-inserted')[1].innerHTML = 'Mod-instellingen';
        }
        const updatechecker = platform == "Userscript" ? '<a id="mod-update-checker" class="mod-setting-button"><span>' + getIcon('globe', 'mod-update-rotate', 'var(--text-moderate)') + 'Check updates</span></a>' : '';
        const updateinfo = platform == "Userscript" ? '' : '<p>Je browser controleert automatisch op updates voor de Somtoday Mod-extensie. Het is wel mogelijk dat een nieuwe update in het review-proces is bij ' + platform + '.</p>';
        const settingcontent = tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].insertAdjacentHTML('beforeend', '<div id="mod-setting-panel"><div id="mod-actions"><a id="save" class="mod-setting-button"><span>' + getIcon('floppy-disk', 'mod-save-shake', 'var(--text-moderate)') + 'Instellingen opslaan</span></a><a id="reset" class="mod-setting-button"><span>' + getIcon('rotate-left', 'mod-reset-rotate', 'var(--text-moderate)') + 'Reset instellingen</span></a>' + updatechecker + '<a class="mod-setting-button" id="information-about-mod"><span>' + getIcon('circle-info', 'mod-info-wobble', 'var(--text-moderate)') + 'Informatie over mod</span></a><a class="mod-setting-button" id="mod-feedback"><span>' + getIcon('comment-dots', 'mod-feedback-bounce', 'var(--text-moderate)') + 'Feedback geven</span></a><a class="mod-setting-button" id="mod-bug-report"><span>' + getIcon('circle-exclamation', 'mod-bug-scale', 'var(--text-moderate)') + 'Bug melden</span></a></div><h3 class="category">Kleuren</h3>' + addSetting('Primaire kleur', null, 'primarycolor', 'color', '#0067c2') + '<div class="br"></div><div class="br"></div>' + addSetting('Secundaire kleur', null, 'secondarycolor', 'color', '#0067c2') + '<h3 class="category">Achtergrond</h3>' + addSetting('Achtergrondafbeelding', 'Stel een afbeelding in voor op de achtergrond.', 'background', 'file', null, 'image/*') + '<div class="mod-button" id="mod-random-background">Random</div><div class="br"></div><div class="br"></div>' + addSetting('Achtergrond-transparantie', 'Verander de transparantie van de achtergrond.', 'transparency', 'range', Math.round(Math.abs(1 - get("transparency")) * 100), 0, 100, 1, true) + '<div class="br"></div><div class="br"></div>' + addSetting('Achtergrond-blur', 'Blur de achtergrondafbeelding.', 'blur', 'range', get("blur") * 2, 0, 100, 1, true) + '<h3 class="category">Thema\'s</h3><div class="br"></div><div id="theme-wrapper"></div><div class="br"></div><h3 class="category">Layout</h3><div id="layout-wrapper"><div class="layout-container' + (get('layout') == 1 ? ' layout-selected' : '') + '" id="layout-1"><div style="width:94%;height:19%;top:4%;left: 4%;"></div><div style="width:94%;height:68%;top:27%;left:3%;"></div><h3>Standaard</h3></div><div class="layout-container' + (get('layout') == 2 ? ' layout-selected' : '') + '" id="layout-2"><div style="width: 16%; height: 92%; top: 4%; left: 3%;"></div><div style="width: 75%; height: 92%; right: 3%; top: 4%;"></div><h3>Sidebar links</h3></div><div class="layout-container' + (get('layout') == 3 ? ' layout-selected' : '') + '" id="layout-3"><div style="width:75%;height:92%;left:3%;top:4%;"></div><div style="width:16%;height:92%;right:3%;top:4%;"></div><h3>Sidebar rechts</h3></div><div class="layout-container' + (get('layout') == 4 ? ' layout-selected' : '') + '" id="layout-4"><div style="width:68%;height:19%;top:4%;left:16%;"></div><div style="width: 68%;height:68%;top:27%;left: 16%;"></div><h3>Gecentreerd</h3></div></div><h3 class="category">Menu</h3>' + ((get('layout') == 1 || get('layout') == 4) ? addSetting('Laat menu altijd zien', 'Toon de bovenste menubalk altijd. Als dit uitstaat, verdwijnt deze als je naar beneden scrollt.', 'bools00', 'checkbox', true) : '') + addSetting('Paginanaam in menu', 'Laat een tekst met de paginanaam zien in het menu.', 'bools01', 'checkbox', true) + addSetting('Verberg bericht teller', 'Verberg het tellertje dat het aantal ongelezen berichten aangeeft.', 'bools02', 'checkbox', false) + '<h3 class="category">Algemeen</h3>' + addSetting('Nicknames', 'Verander de naam van docenten in Somtoday. Voer in in het formaat "Echte naam|Nickname|Echte naam 2|Nickname 2|Echte naam 3|Nickname 3" (etc...) voor zoveel namen als je wil. HTML is ondersteund.', 'nicknames', 'text', '', 'Echte naam|Nickname|Echte naam 2|Nickname 2|Echte naam 3|Nickname 3') + '<div class="br"></div><div class="br"></div><div class="br"></div>' + addSetting('Gebruikersnaam', 'Verander je gebruikersnaam.', 'username', 'text', '', get('realname')) + '<div class="br"></div><div class="br"></div><div class="br"></div><h3>Lettertype</h3><div class="mod-custom-select notranslate"><select id="mod-font-select" title="Selecteer een lettertype"><option selected disabled hidden>' + get("fontname") + '</option><option>Abhaya Libre</option><option>Aleo</option><option>Archivo</option><option>Assistant</option><option>B612</option><option>Bebas Neue</option><option>Black Ops One</option><option>Brawler</option><option>Cabin</option><option>Caladea</option><option>Cardo</option><option>Chivo</option><option>Comic Sans MS</option><option>Crimson Text</option><option>DM Serif Text</option><option>Enriqueta</option><option>Fira Sans</option><option>Frank Ruhl Libre</option><option>Gabarito</option><option>Gelasio</option><option>Grenze Gotisch</option><option>IBM Plex Sans</option><option>Inconsolata</option><option>Inter</option><option>Josefin Sans</option><option>Kanit</option><option>Karla</option><option>Lato</option><option>Libre Baskerville</option><option>Libre Franklin</option><option>Lora</option><option>Merriweather</option><option>Montserrat</option><option>Neuton</option><option>Noto Serif</option><option>Nunito</option><option>OpenDyslexic2</option><option>Open Sans</option><option>Oswald</option><option>Permanent Marker</option><option>Pixelify Sans</option><option>Playfair Display</option><option>Poetsen One</option><option>Poppins</option><option>PT Sans</option><option>PT Serif</option><option>Quicksand</option><option>Raleway</option><option>Roboto</option><option>Roboto Slab</option><option>Rubik Doodle Shadow</option><option>Rubik</option><option>Sedan SC</option><option>Shadows Into Light</option><option>Single Day</option><option>Source Sans 3</option><option>Source Serif 4</option><option>Spectral</option><option>Titillium Web</option><option>Ubuntu</option><option>Work Sans</option></select></div><div class="example-box-wrapper"><div id="font-box"><h3 style="letter-spacing:normal;">Lettertype</h3><p style="letter-spacing:normal;margin-bottom:0;">Kies een lettertype voor Somtoday.</p></div></div><div class="br"></div><div class="br"></div><div class="br"></div>' + addSetting('Profielafbeelding', 'Laat je profielfoto in het menu en bij verstuurde berichten zien. Als dit uitstaat worden je initialen getoond.', 'bools03', 'checkbox', true) + addSetting('Aangepaste profielafbeelding', 'Upload je eigen profielafbeelding in plaats van je schoolfoto. De instelling <b>Profielafbeelding</b> moet aanstaan.', 'profilepic', 'file', null, 'image/*', '120') + '<h3 class="category">Aanvullende opties</h3>' + addSetting('Deel debug-data', 'Verstuur bij een error anonieme informatie naar de developer om Somtoday Mod te verbeteren.', 'bools04', 'checkbox', false) + addSetting('Downloadknop voor cijfers', 'Laat een downloadknop zien op de laatste cijfers en vakgemiddelden-pagina.', 'bools05', 'checkbox', true) + addSetting('Felicitatieberichten', 'Laat een felicitatiebericht zien als je jarig bent, of als je al een aantal jaar van Somtoday Mod gebruik maakt.', 'bools06', 'checkbox', true) + addSetting('Grafieken op cijferpagina', 'Laat een cijfer- en gemiddeldegrafiek zien op de cijfer-pagina van een vak.', 'bools07', 'checkbox', true) + ((get('layout') == 2 || get('layout') == 3) ? addSetting('Logo van mod in menu', 'Laat in plaats van het logo van Somtoday het logo van Somtoday Mod zien.', 'bools08', 'checkbox', true) : '') + addSetting('Redirect naar ELO', 'Redirect je automatisch van https://som.today naar https://inloggen.somtoday.nl.', 'bools09', 'checkbox', true) + addSetting('Rekentool op cijferpagina', 'Voeg een rekentool toe op de cijferpagina om snel te berekenen welk cijfer je moet halen.', 'bools10', 'checkbox', true) + addSetting('Scrollbar', 'Laat de scrollbar van een pagina zien.', 'bools11', 'checkbox', true) + '<h3 class="category">Browser</h3>' + addSetting('Titel', 'Verander de titel van Somtoday in de tabbladen van de browser.', 'title', 'text', '', 'Somtoday Leerling') + '<div class="br"></div><div class="br"></div><div class="br"></div>' + addSetting('Icoon', 'Verander het icoontje van Somtoday in de menubalk van de browser. Accepteert png, jpg/jpeg, gif, svg, ico en meer.</p><div class="mod-info-notice">' + getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'Bewegende GIF-bestanden werken alleen in Firefox.</div><p>', 'icon', 'file', null, 'image/*', '300') + '<div class="br"></div><p>Versie ' + somtodayversion + ' van Somtoday | Versie ' + version + ' van Somtoday Mod</p><p>Bedankt voor het gebruiken van Somtoday Mod ' + platform + '!</p>' + updateinfo + '<div class="br"></div></div>');
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
        // Add event listeners to make layout boxes work
        for (const element of cn("layout-container")) {
            element.addEventListener("click", function () {
                for (const element of cn("layout-selected")) {
                    element.classList.remove("layout-selected");
                }
                element.classList.add("layout-selected");
            });
        }
        // Make save button, reset button (and updatechecker for the Userscript-version) work
        id("save").addEventListener("click", function () { execute([save]) });
        id("reset").addEventListener("click", function () {
            modMessage('Alles resetten?', 'Al je instellingen zullen worden gereset. Weet je zeker dat je door wil gaan?', 'Ja', 'Nee');
            id('mod-message-action1').addEventListener("click", function () { reset(); setBackground(); style(); pageUpdate(); if (!n(id('mod-grades-graphs')) && get("bools").charAt(7) == "1" && !n(tn('sl-vakresultaten', 0))) { tryRemove(id('mod-grades-graphs')); tn('sl-vakresultaten', 0).insertAdjacentHTML('beforeend', '<div id="mod-grades-graphs"><h3>Mijn cijfers</h3><div><canvas id="mod-chart-1"></canvas></div><h3>Mijn gemiddelde</h3><div><canvas id="mod-chart-2"></canvas></div></div>'); setTimeout(gradeGraphs, 500); } id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 350); });
            id('mod-message-action2').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 350); });
        });
        id("information-about-mod").addEventListener("click", function () {
            modMessage('Informatie', '</p><h3>Over</h3><p>Somtoday Mod is een gratis ' + (platform == 'Userscript' ? 'userscript dat' : 'browserextensie die') + ' de website van Somtoday aanpast. Het verbetert het uiterlijk van Somtoday en voegt opties zoals achtergronden, lettertypes, kleuren, layout en meer toe. Somtoday Mod is niet geaffilieerd met Somtoday/Topicus.</p><br><h3>Versieinformatie</h3><p>Somtoday Mod ' + platform + ' v' + version + ' met Somtoday ' + somtodayversion + '</p><br><h3>Privacybeleid & Source code</h3><p>Het privacybeleid is <a href="https://jonazwetsloot.nl/somtoday-mod-privacy-policy" target="_blank">hier</a> te vinden. De GitHub repo is <a href="https://jonazwetsloot.nl/versions/somtoday-mod" target="_blank">hier</a> te vinden.</p><br><h3>Copyright</h3><p>&copy; 2023 - 2024 Jona Zwetsloot, gelicentieerd onder <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a>.</p>', 'Meer informatie', 'Terug');
            id('mod-message-action1').addEventListener("click", function () { window.open('https://jonazwetsloot.nl/projecten/somtoday-mod', '_blank'); });
            id('mod-message-action2').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 350); });
        });
        id("mod-bug-report").addEventListener("click", function () { execute([prepareBugReport]) });
        id("mod-feedback").addEventListener("click", function () { execute([feedback]) });
        if (platform == "Userscript") {
            id("mod-update-checker").addEventListener("click", function () { execute([checkUpdate]) });
        }
        // Make random background button work
        // Random background images thanks to Lorem Picsum: https://picsum.photos
        id("mod-random-background").addEventListener("click", function () {
            id("mod-random-background").classList.toggle('mod-active');
            if (!n(id('mod-random-background').previousElementSibling)) {
                if (id('mod-random-background').previousElementSibling.classList.contains("mod-active")) {
                    id('mod-random-background').previousElementSibling.classList.remove("mod-active");
                }
                if ((((!n(id("mod-random-background").previousElementSibling)) && !n(id("mod-random-background").previousElementSibling.previousElementSibling)) && !n(id("mod-random-background").previousElementSibling.previousElementSibling.getElementsByTagName('label')[0])) && id("mod-random-background").previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].classList.contains("mod-active")) {
                    id("mod-random-background").previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].classList.remove("mod-active");
                    setHTML(id("mod-random-background").previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].children[1], "Kies een bestand");
                    id("mod-random-background").previousElementSibling.previousElementSibling.getElementsByTagName('input')[0].value = null;
                }
            }
        });
        // Add script to make the font select element work
        if (!n(id('mod-font-select-script'))) {
            tryRemove(id('mod-font-select-script'));
        }
        id('somtoday-mod').insertAdjacentHTML('beforeend', '<style id="mod-font-select-script" onload=\'let x, i, j, l, ll, selElmnt, a, b, c; x = document.getElementsByClassName("mod-custom-select"); l = x.length; for (i = 0; i < l; i++) { selElmnt = x[i].getElementsByTagName("select")[0]; ll = selElmnt.length; a = document.createElement("DIV"); a.setAttribute("class", "select-selected"); a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML; x[i].appendChild(a); b = document.createElement("DIV"); b.setAttribute("class", "select-items select-hide"); for (j = 1; j < ll; j++) { c = document.createElement("DIV"); c.innerHTML = selElmnt.options[j].innerHTML; c.style.fontFamily = "\\"" + selElmnt.options[j].innerHTML + "\\", sans-serif"; c.addEventListener("click", function(e) { let y, i, k, s, h, sl, yl; s = this.parentNode.parentNode.getElementsByTagName("select")[0]; sl = s.length; h = this.parentNode.previousSibling; for (i = 0; i < sl; i++) { if (this.style.fontFamily.indexOf(s.options[i].innerHTML) != -1) { s.selectedIndex = i; h.innerHTML = this.innerHTML; y = this.parentNode.getElementsByClassName("same-as-selected"); yl = y.length; for (k = 0; k < yl; k++) { y[k].removeAttribute("class"); } this.setAttribute("class", "same-as-selected"); break; } } h.click(); document.getElementById("font-box").children[0].style.fontFamily = document.getElementById("font-box").children[1].style.fontFamily = document.getElementsByClassName("select-selected")[0].style.fontFamily = "\\"" + document.getElementById("mod-font-select").value + "\\", sans-serif"; }); b.appendChild(c); } x[i].appendChild(b); a.addEventListener("click", function(e) { e.stopPropagation(); closeAllSelect(this); this.nextSibling.classList.toggle("select-hide"); this.classList.toggle("select-arrow-active"); }); } function closeAllSelect(elmnt) { let x, y, i, xl, yl, arrNo = []; x = document.getElementsByClassName("select-items"); y = document.getElementsByClassName("select-selected"); xl = x.length; yl = y.length; for (i = 0; i < yl; i++) { if (elmnt == y[i]) { arrNo.push(i) } else { y[i].classList.remove("select-arrow-active"); } } for (i = 0; i < xl; i++) { if (arrNo.indexOf(i)) { x[i].classList.add("select-hide"); } } } document.addEventListener("click", closeAllSelect, {passive: true});\'></style>');
        // Add event listeners to make file reset buttons work
        for (const element of cn("mod-file-reset")) {
            element.addEventListener("click", function () {
                element.classList.toggle("mod-active");
                if (element.dataset.key == "background") {
                    if (!n(id('mod-random-background'))) {
                        if (id('mod-random-background').classList.contains("mod-active")) {
                            id('mod-random-background').classList.remove("mod-active");
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
    }

    // Close modsettings
    function closeSettings(element) {
        id("mod-setting-button").classList.remove('active');
        tryRemove(id("mod-setting-panel"));
        tn('sl-account-modal-header', 1).getElementsByClassName('ng-star-inserted')[1].innerHTML = element.getElementsByTagName('span')[0].innerHTML;
    }

    // Save all modsettings
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
                    // Blur is divided by 2 to prevent a too strong effect
                    set("blur", element.value / 2);
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
                        id('mod-message-action1').addEventListener("click", function () { window.location.reload(); });
                    }
                }
                else {
                    set(element.id, element.value);
                }
            } else if (element.type == "file") {
                if (element.files.length != 0) {
                    // Compress files to desired size in pixels using canvas
                    let size = element.dataset.size;
                    if (!n(size) && (element.files[0].type == "image/png" || element.files[0].type == "image/jpeg" || element.files[0].type == "image/webp")) {
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
                                reader.onload = function () {
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
                        reader.onload = function () {
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
            set("theme", selectedtheme.dataset.name);
            if (selectedtheme.id != "Standaard") {
                toDataURL(selectedtheme.dataset.url, function (dataUrl) {
                    set("background", dataUrl);
                    filesProcessed++;
                });
            }
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
        if (!n(id('mod-random-background'))) {
            if (id('mod-random-background').classList.contains('mod-active')) {
                toDataURL('https://picsum.photos/1600/800', function (dataUrl) {
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
        set("fontname", id("mod-font-select").value);
        // Reload page to show changes
        // Only reload when all files are processed (required for Firefox, but also an extra check for the other browsers)
        if (reload) {
            saveReload();
        }
    }

    // Make sure everything is saved before reload
    function saveReload() {
        if ((cn('mod-file-input').length + 2) == filesProcessed) {
            setBackground();
            style();
            pageUpdate();
            if (!n(id('mod-grades-graphs')) && get("bools").charAt(7) == "1" && !n(tn('sl-vakresultaten', 0))) {
                tryRemove(id('mod-grades-graphs'));
                tn('sl-vakresultaten', 0).insertAdjacentHTML('beforeend', '<div id="mod-grades-graphs"><h3>Mijn cijfers</h3><div><canvas id="mod-chart-1"></canvas></div><h3>Mijn gemiddelde</h3><div><canvas id="mod-chart-2"></canvas></div></div>');
                setTimeout(gradeGraphs, 500);
            }
        }
        else {
            setTimeout(saveReload, 100);
        }
    }

    // Reset all settings
    function reset() {
        set("primarycolor", "#0067c2");
        set("secondarycolor", "#e69b22");
        set("nicknames", "");
        set("bools", "110101110111000000000000000000");
        set("zoom", "120");
        set("title", "");
        set("icon", "");
        set("background", "");
        set("transparency", 0.8);
        set("fontname", "Open Sans");
        set("theme", "Standaard");
        set("layout", 1);
        set("profilepic", "");
        set("username", "");
    }

    // Constructs HTML code for the setting page
    function addSetting(name, description, key, type, value, param1, param2, param3, param4) {
        if (get(key) == null && !key.startsWith('bools')) {
            set(key, value);
        }
        let code = '<div><h3>' + name + '</h3>' + (n(description) ? '' : '<p>' + description + '</p>');
        if (type == "checkbox") {
            if (key.startsWith('bools')) {
                code += '<label class="switch" for="' + key + '"><input title="' + name + '" class="mod-custom-setting" type="checkbox" ' + (get('bools').charAt(parseInt(key.charAt(5) + key.charAt(6))) == "1" ? 'checked' : '') + ' oninput="this.classList.add(\'mod-modified\');" id="' + key + '"/><div class="slider round"></div></label></div>';
            } else {
                code += '<label class="switch" for="' + key + '"><input title="' + name + '" class="mod-custom-setting" type="checkbox" ' + (get(key) ? 'checked' : '') + ' oninput="this.classList.add(\'mod-modified\');" id="' + key + '"/><div class="slider round"></div></label></div>';
            }
        } else if (type == "range") {
            code += '<input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="range" value="' + (param4 != null ? value : get(key)) + '" min="' + param1 + '" max="' + param2 + '" step="' + param3 + '" oninput="this.classList.add(\'mod-modified\');this.parentElement.children[3].innerHTML = this.value;"/><p>' + (param4 != null ? value : get(key)) + '</p><p>%</p></div>';
        } else if (type == "text") {
            code += '<input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="text" placeholder="' + param1 + '" value="' + get(key).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') + '"/></div>';
        } else if (type == "number") {
            code += '<div class="br"></div><input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="number" placeholder="' + param1 + '" value="' + get(key) + '"/></div>';
        } else if (type == "color") {
            code += '<div class="br"></div><div class="br"></div><label class="mod-color" for="' + key + '" style="background: ' + get(key) + '"><p>Kies een kleur</p></label><input class="mod-color-textinput" title="Voer een hex kleurencode in" value="' + get(key) + '" onchange="if (/^#?([a-fA-F0-9]{6})$/.test(this.value)) { this.parentElement.children[5].value = this.value; this.style.color = \'var(--fg-on-primary-weak)\'; this.parentElement.children[3].style.background = this.value; } else if (/^#?([a-fA-F0-9]{3})$/.test(this.value)) { const sixDigitCode = \'#\' + this.value.charAt(1) + this.value.charAt(1) + this.value.charAt(2) + this.value.charAt(2) + this.value.charAt(3) + this.value.charAt(3); this.parentElement.children[5].value = sixDigitCode; this.style.color = \'var(--fg-on-primary-weak)\'; this.parentElement.children[3].style.background = sixDigitCode; } else { this.style.color = \'darkred\'; }"/><input title="' + name + '" class="mod-custom-setting" value="' + get(key) + '" id="' + key + '" oninput="this.classList.add(\'mod-modified\');this.parentElement.children[3].style.background = this.value; this.parentElement.children[4].value = this.value; this.parentElement.children[4].style.color = \'var(--fg-on-primary-weak)\';" type="color"/></div>';
        } else if (type == "file") {
            code += '<label class="mod-file-label" for="' + key + '">' + getIcon('upload', null, 'var(--fg-on-primary-weak)') + '<p>Kies een bestand</p></label><input' + (n(param2) ? '' : ' title="' + name + '" data-size="' + param2 + '"') + ' oninput="this.parentElement.getElementsByTagName(\'label\')[0].classList.remove(\'mod-active\'); if (this.files.length != 0) { const name = this.files[0].name.toLowerCase(); if (this.accept != \'image/*\' || this.files[0][\'type\'].indexOf(\'image\') != -1) { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = name; this.parentElement.getElementsByTagName(\'label\')[0].classList.add(\'mod-active\'); this.parentElement.nextElementSibling.classList.remove(\'mod-active\'); this.parentElement.nextElementSibling.nextElementSibling.classList.remove(\'mod-active\'); } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; this.value = null; } } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; }" class="mod-file-input mod-custom-setting" type="file" accept="' + param1 + '" id="' + key + '"/></div><div class="mod-button mod-file-reset" data-key="' + key + '">Reset</div>';
        }
        return code;
    }

    // Add a theme to the modsettings. Can only be called at the modsettings page.
    function addTheme(name, url, color, transparency) {
        // URL can be a URL to an image, but also a Pexels ID.
        let smallimg = url;
        let bigimg = url;
        if (!isNaN(parseInt(url))) {
            smallimg = 'https://images.pexels.com/photos/' + url + '/pexels-photo-' + url + '.jpeg?auto=compress&cs=tinysrgb&w=250';
            bigimg = 'https://images.pexels.com/photos/' + url + '/pexels-photo-' + url + '.jpeg?auto=compress&cs=tinysrgb&w=1600';
        }
        let themeclass = "";
        if (get("theme") == name) {
            if (get("primarycolor") == "#" + color) {
                themeclass = " theme-selected-set";
            } else {
                set("theme", "");
            }
        }
        // Set emtpy image as theme background if no url is given
        if (url == "") {
            smallimg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        }
        id('theme-wrapper').insertAdjacentHTML('beforeend', '<div class="theme' + themeclass + '" id="' + name + '" data-name="' + name + '" data-url="' + bigimg + '" data-color="' + color + '" data-transparency="' + transparency + '"><img src="' + smallimg + '" alt="Achtergrondafbeelding: ' + name + '" loading="lazy"/><h3><div style="background:#' + color + ';" title="#' + color + '"></div>' + name + '</h3></div>');
        id(name).addEventListener("click", function () {
            for (const element of cn('theme')) {
                element.classList.remove('theme-selected-set');
                element.classList.remove('theme-selected');
            }
            id(name).classList.add('theme-selected');
        });
    }

    // Open modsettings directly when hash is #mod-settings
    function openModSettingsDirectly() {
        if (window.location.hash == "#mod-settings") {
            tn('sl-header', 0).getElementsByTagName('div')[0].click();
            setTimeout(function () {
                cn('selector-option instellingen', 0).click();
            }, 100);
            setTimeout(function () {
                id('mod-setting-button').click();
                history.replaceState("", document.title, window.location.pathname + window.location.search);
            }, 500);
        }
    }

    // Insert modsettings link in the setting menu
    function insertModSettingLink() {
        if (!n(tn('sl-account-modal', 0)) && !n(tn('sl-account-modal', 0).getElementsByTagName('sl-account-modal-tab')[0]) && n(id("mod-setting-button"))) {
            let modbtn = tn('sl-account-modal', 0).getElementsByTagName('sl-account-modal-tab')[tn('sl-account-modal', 0).getElementsByTagName('sl-account-modal-tab').length - 1].cloneNode(true);
            modbtn.id = "mod-setting-button";
            modbtn.addEventListener('click', openSettings);
            modbtn.getElementsByTagName('span')[0].innerHTML = 'Mod-instellingen';
            modbtn.getElementsByTagName('i')[0].style.background = darkmode ? '#603d20' : '#ffefe3';
            modbtn.getElementsByTagName('i')[0].style.paddingBottom = '2px';
            modbtn.getElementsByTagName('i')[0].innerHTML = getIcon('gear', null, '#ea9418', 'style="width:16px;height:16px;"')
            tn('sl-account-modal', 0).getElementsByTagName('nav')[0].appendChild(modbtn);
            for (const element of tn('sl-account-modal-tab')) {
                if (element.id != 'mod-setting-button') {
                    element.addEventListener('click', function () { closeSettings(element) });
                }
            }
            setTimeout(function () {
                // Save username and birthday
                if (!n(cn('data-container', 1)) && !n(cn('data-container', 1).getElementsByClassName('ng-star-inserted')[0]) && n(get('username'))) {
                    console.log('set to: ' + cn('data-container', 1).getElementsByClassName('ng-star-inserted')[0].innerHTML);
                    set('username', cn('data-container', 1).getElementsByClassName('ng-star-inserted')[0].innerHTML);
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
        else if (!n(id("mod-setting-button"))) {
            id("mod-setting-button").getElementsByTagName('i')[0].style.background = darkmode ? '#603d20' : '#ffefe3';
        }
    }





    // 10 - SERVER REQUESTS

    // Check if updates are available - userscript only (user initiated)
    function checkUpdate() {
        fetch("https://jonazwetsloot.nl/somtoday-mod-update-checker?v=" + version).then(function (response) {
            if (response.ok) {
                return response.text();
            }
            return Promise.reject(response);
        }).then(text => {
            if (text == "Newest") {
                modMessage('Geen updates gevonden', 'Helaas, er zijn geen updates gevonden.', 'Oke');
                id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
            } else if (text == "Optional") {
                modMessage('Kleine update gevonden', 'Er is een kleine update gevonden. Wil je de update installeren?', 'Ja', 'Nee');
                id('mod-message-action1').addEventListener("click", function () { window.open('https://jonazwetsloot.nl/userscripts/SomtodayMod' + (minified ? '' : 'Unminified') + '.user.js'); });
                id('mod-message-action2').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
            } else if (text == "Update") {
                modMessage('Update gevonden', 'Er is een update gevonden. Wil je de update installeren?', 'Ja', 'Nee');
                id('mod-message-action1').addEventListener("click", function () { window.open('https://jonazwetsloot.nl/userscripts/SomtodayMod' + (minified ? '' : 'Unminified') + '.user.js'); });
                id('mod-message-action2').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
            }
            else {
                modMessage('Fout', 'Somtoday Mod kan de reactie van de server niet begrijpen.', 'Oke');
                id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
            }
        }).catch((response) => {
            modMessage('Fout', 'Er kon niet op updates worden gechecked. Het kan zijn dat de server van Somtoday Mod down is of dat je wifi uitstaat.', 'Oke');
            id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
        });
    }

    // Sends a feedback message (user initiated)
    function feedback() {
        modMessage('Feedback geven', 'Heb je suggesties voor verbeteringen of een heel goed idee voor Somtoday Mod? Dan kan je hier feedback geven.</p><textarea placeholder="Schrijf hier je feedback." id="mod-feedback-message"></textarea><p>', 'Verstuur', 'Terug');
        id('mod-message-action1').addEventListener("click", function () {
            hide(id('mod-message-action1'));
            hide(id('mod-message-action2'));
            if (n(id('mod-feedback-message').value)) {
                id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305);
                setTimeout(function () {
                    modMessage('Fout', 'Voer een tekst in.', 'Oke');
                    id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); if (!n(id('mod-feedback'))) { id("mod-feedback").click(); } }, 305); });
                }, 310);
            }
            else {
                let formData = new FormData();
                formData.append('message', id('mod-feedback-message').value);
                fetch("https://jonazwetsloot.nl/somtoday-mod-feedback", { method: 'POST', body: formData }).then(function (response) {
                    if (response.ok) {
                        return response.text();
                    }
                    return Promise.reject(response);
                }).then(text => {
                    id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
                    if (text == "Sent") {
                        setTimeout(function () {
                            modMessage('Verstuurd!', 'Je feedback is verstuurd.', 'Oke');
                            id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                        }, 310);
                    } else {
                        setTimeout(function () {
                            modMessage('Fout', 'De server kon je feedback niet verwerken.', 'Oke');
                            id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                        }, 310);
                    }
                }).catch((response) => {
                    id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
                    setTimeout(function () {
                        modMessage('Fout', 'Je feedback kon niet worden verstuurd. Het kan zijn dat de server van Somtoday Mod down is of dat je wifi uitstaat.', 'Oke');
                        id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                        id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                    }, 310);
                });
            }
        });
        id('mod-message-action2').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
    }

    // Show message and prepare bug report server request (user initiated)
    function prepareBugReport() {
        modMessage('Bug melden', 'Heb je een bug ontdekt? Dan kan je die hier melden. Alle bugs zijn openbaar te bekijken <a href="https://jonazwetsloot.nl/bugs/somtoday-mod" target="_blank">op deze pagina</a>.</p><input type="text" placeholder="Korte beschrijving van bug" id="mod-bug-details"><div class="br"></div><textarea placeholder="Uitgebreidere beschrijving van bug" id="mod-bug-title"></textarea><p style="margin-top: 20px; margin-bottom: -5px;">Screenshot (optioneel)</p><div><label style="margin-top: 15px;" class="mod-file-label" for="mod-bug-screenshot">' + getIcon('upload', null, 'var(--fg-on-primary-weak)') + '<p style="display: inline;">Kies een bestand</p></label><input oninput="this.parentElement.getElementsByTagName(\'label\')[0].classList.remove(\'mod-active\'); if (this.files.length != 0) { const name = this.files[0].name.toLowerCase(); if (this.files[0][\'type\'].indexOf(\'image\') != -1) { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = name; this.parentElement.getElementsByTagName(\'label\')[0].classList.add(\'mod-active\'); } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; this.value = null; } } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; }" class="mod-file-input" type="file" accept="image/*" id="mod-bug-screenshot"/></div><p>', 'Verstuur', 'Terug');
        id('mod-message-action1').addEventListener("click", function () {
            hide(id('mod-message-action1'));
            hide(id('mod-message-action2'));
            if (n(id('mod-bug-title').value) || n(id('mod-bug-details').value)) {
                id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
                setTimeout(function () {
                    modMessage('Fout', 'Voer ten minste beide tekstvelden in.', 'Oke');
                    id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); if (!n(id('mod-bug-report'))) { id("mod-bug-report").click(); } }, 305); });
                }, 310);
            }
            else {
                let formData = new FormData();
                formData.append('title', id('mod-bug-details').value);
                formData.append('message', id('mod-bug-title').value);
                formData.append('product', 'Somtoday Mod');
                formData.append('version', version);
                formData.append('platform', platform);
                if (!n(id('mod-bug-screenshot').files[0])) {
                    let reader = new FileReader();
                    reader.readAsDataURL(id('mod-bug-screenshot').files[0]);
                    reader.onload = function () {
                        formData.append('screenshot', reader.result);
                        sendBugReport(formData);
                    };
                }
                else {
                    sendBugReport(formData);
                }
            }
        });
        id('mod-message-action2').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
    }

    // Submits a bug report (user initiated)
    function sendBugReport(formData) {
        fetch("https://jonazwetsloot.nl/somtoday-mod-error", { method: 'POST', body: formData }).then(function (response) {
            if (response.ok) {
                return response.text();
            }
            return Promise.reject(response);
        }).then(text => {
            id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
            if (text == "Success") {
                setTimeout(function () {
                    modMessage('Verstuurd!', 'Je bugreport is verstuurd.', 'Oke');
                    id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                }, 310);
            } else {
                setTimeout(function () {
                    modMessage('Fout', 'De server kon de request niet verwerken.', 'Oke');
                    id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                }, 310);
            }
        }).catch((response) => {
            id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
            setTimeout(function () {
                modMessage('Fout', 'Je bugreport kon niet worden verstuurd. Het kan zijn dat de server van Somtoday Mod down is of dat je wifi uitstaat.', 'Oke');
                id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
            }, 310);
        });
    }

    // Convert an image URL to a base64 image
    function toDataURL(url, callback) {
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {
            let reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

    // Execute everything
    execute([updateCheck, checkNewUser, setBackground, updateCssVariables, style, addMutationObserver, browserSettings, congratulations, openModSettingsDirectly, showInitials, consoleMessage]);
}










// LEGACY-SCRIPT
// WILL BE REMOVED WHEN SOMTODAY V17 IS RELEASED IN AUGUST 2024

function legacy() {
    // Show a message on top of the page. Similair to browser confirm().
    function modMessage(title, description, link1, link2, red1, red2, noBackgroundClick) {
        while (!n(id('mod-message'))) {
            tryRemove(id('mod-message'));
        }
        const element = n(id('somtoday-mod')) ? tn('body', 0) : id('somtoday-mod');
        element.insertAdjacentHTML('afterbegin', '<div id="mod-message" class="mod-msg-open"><center><div onclick="event.stopPropagation();"><h2>' + title + '</h2><p>' + description + '</p>' + (n(link1) ? '' : '<a id="mod-message-action1" class="mod-message-button' + (red1 ? ' mod-button-discouraged' : '') + '" tabindex="0">' + link1 + '</a>') + (n(link2) ? '' : '<a id="mod-message-action2" class="mod-message-button' + (red2 ? ' mod-button-discouraged' : '') + '" tabindex="0">' + link2 + '</a>') + '</div></center></div>');
        if (!n(link1)) {
            id('mod-message-action1').focus();
            id('mod-message-action1').addEventListener("keydown", (event) => { if (event.keyCode === 13) { id('mod-message-action1').click(); } else if (event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 9) { event.preventDefault(); if (!n(id('mod-message-action2'))) { id('mod-message-action2').focus(); } } });
        }
        if (!n(link2)) {
            id('mod-message-action2').addEventListener("keydown", (event) => { if (event.keyCode === 13) { id('mod-message-action2').click(); } else if (event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 9) { event.preventDefault(); id('mod-message-action1').focus(); } });
            if (noBackgroundClick == null) {
                id('mod-message').addEventListener("click", function () { id('mod-message-action2').click(); });
            }
        }
        else if (!n(link1) && noBackgroundClick == null) {
            id('mod-message').addEventListener("click", function () { id('mod-message-action1').click(); });
        }
    }
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
            setTimeout(console.warn.bind(console, "SOMTODAY MOD: Could not find logout button."));
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
            setTimeout(console.warn.bind(console, "SOMTODAY MOD: Could not find messages button."));
            id('user').insertAdjacentHTML('beforeend', '<a id="mod-open-messages" href="/home/messages"></a>');
            messagesElement = id('mod-open-messages');
        }
        if (profileElement == null) {
            setTimeout(console.warn.bind(console, "SOMTODAY MOD: Could not find profile button."));
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
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>@import url("https://fonts.googleapis.com/css2?family=Abhaya+Libre&family=Aleo&family=Archivo&family=Assistant&family=B612&family=Bebas+Neue&family=Black+Ops+One&family=Brawler&family=Cabin&family=Caladea&family=Cardo&family=Chivo&family=Crimson+Text&family=DM+Serif+Text&family=Enriqueta&family=Fira+Sans&family=Frank+Ruhl+Libre&family=Gabarito&family=Gelasio&family=IBM+Plex+Sans&family=Inconsolata&family=Inter&family=Josefin+Sans&family=Kanit&family=Karla&family=Lato&family=Libre+Baskerville&family=Libre+Franklin&family=Lora&family=Merriweather&family=Montserrat&family=Neuton&family=Noto+Serif&family=Nunito&family=Open+Sans&family=Oswald&family=Permanent+Marker&family=PT+Sans&family=PT+Serif&family=Playfair+Display:ital@1&family=Poppins&family=Poetsen+One&family=Quicksand&family=Raleway&family=Roboto&family=Roboto+Slab&family=Rubik&family=Rubik+Doodle+Shadow&family=Sedan+SC&family=Shadows+Into+Light&family=Single+Day&family=Source+Sans+3&family=Source+Serif+4:opsz@8..60&family=Spectral&family=Titillium+Web&family=Ubuntu&family=Work+Sans&display=swap");*,.ui-widget input,.ui-widget select,.ui-widget textarea,.ui-widget button,textarea{font-family:"' + get("fontname") + '","Open Sans","SOMFont",sans-serif;' + ((get("fontname") == "Bebas Neue" || get("fontname") == "Oswald") ? "letter-spacing:1px;" : "") + ' }#background-image-overlay{pointer-events:none;-webkit-user-select:none;user-select:none;z-index:-1;' + (layout == 1 ? 'min-height:calc(100vh - 180px);width:70%;left:15%;top:160px;position:absolute;background:' + colors[8] + ';height:' + ((n(id('master-panel')) || n(id('detail-panel-wrapper'))) ? '' : Math.max(id('master-panel').clientHeight, id('detail-panel-wrapper').clientHeight)) + 'px;' : (layout == 4 ? 'width:100%;left:0;top:0;position:fixed;background:' + colors[8] + ';height:100%;' : '')) + ' }#main-menu-wrapper{z-index:998;overflow:hidden;padding:0px;background:' + colors[0] + ';' + ((layout == 1 || layout == 4) ? 'position:absolute;left:0;top:80px;height:80px;' : 'position:fixed;top:0;height:100%;width:120px;max-width:14vw;') + (layout == 1 ? 'width:70%;border-top-left-radius:16px;border-top-right-radius:16px;margin-left:15%;' : (layout == 2 ? 'left:0;' : (layout == 3 ? 'right:0;' : 'width:100%;'))) + '}h1 > #logo{height:35px;width:35px;margin-left:-50px;margin-top:-5px;position:absolute;}center > #logo{height:min(11vw,8vh);width:50%;padding:10px 0;}#main-menu{width:100%;height:100%;' + ((layout == 2 || layout == 3) ? 'overflow-y:auto;' : '') + '}#main-menu div a{border-radius:0;background:transparent;color:white;max-height:14vw;' + ((layout == 2 || layout == 3) ? 'width:100%;height:' + (id('main-menu').getElementsByTagName('a').length > 8 ? '95px' : '100px;') : (layout == 1 ? 'width:140px;height:80px;' : 'width:150px;height:80px;')) + ' padding:0;margin:0;transition:background 0.3s ease;display:inline-block;}#main-menu div a svg{transition:transform 0.3s ease;}#main-menu div a.active svg,#main-menu div a:hover svg{transform:scale(1.1);}#main-menu div a.active,#main-menu div a:hover,#main-menu div a:focus{background:' + ((layout == 1 || layout == 4) ? colors[1] : (layout == 2 ? 'linear-gradient(-90deg,' + colors[0] + ' 0%,' + colors[1] + ' 40%,' + colors[1] + ' 100%)' : 'linear-gradient(90deg,' + colors[0] + ' 0%,' + colors[1] + ' 40%,' + colors[1] + ' 100%)')) + ' !important;color:white !important;}div.profile-img{background:' + colors[1] + ';}.profile-img{line-height:50px;border-radius:50%;overflow:hidden;-webkit-user-select:none;user-select:none;object-fit:cover;color:' + colors[2] + ';width:50px;height:50px;font-size:' + (Math.min(55 / (n(initials) ? '' : initials).length, 25)).toString() + 'px;text-align:center;font-weight:700;}.profile-img-menu{z-index:10000;position:absolute;right:' + (layout == 1 ? 'calc(15% + 30px)' : '40px') + ';top:13px;}.profile-img-menu div{transition:filter 0.2s ease,background 0.2s ease,color 0.2s ease;}.topmenusvg{height:30px;width:30px;position:absolute;top:23px;}.topmenusvg svg{width:100%;height:100%;transition:filter 0.2s ease;}#header-wrapper{visibility:hidden;}#user{box-sizing:border-box;' + (layout == 1 ? '' : 'border-bottom:3px solid ' + colors[4]) + ';' + ((layout == 1 || layout == 4) ? 'width:100%;margin-left:0;' : (layout == 2 ? 'margin-left:min(14vw,120px);width:calc(100% - min(14vw,120px));' : 'margin-right:min(14vw,120px);margin-left:0;width:calc(100% - min(14vw,120px));')) + ' visibility:visible;position:' + (get("bools").charAt(3) == "0" ? "absolute" : "fixed") + ';top:' + ((layout == 1 && get('bools').charAt(3) == "0") ? '-20px' : '0') + ';left:0;z-index:1000;background:' + colors[12] + ';height:80px;}#user a{opacity:1 !important;}#user a:hover div#profile-img,div#profile-img:hover,#user a:focus div#profile-img{background:' + colors[7] + ';color:white;}#user a:hover img, #user a:hover svg,#user a:focus svg{filter:brightness(140%);}#user img:first-child{display:none;}#page-title{position:absolute;left:' + (layout == 1 ? 'calc(15% + 70px)' : (layout == 4 ? '80px' : '35px')) + ';top:25px;}#inbox-counter{position:absolute;right:' + (layout == 1 ? 'calc(15% + 130px)' : '140px') + ';top:0;z-index:100000;width:fit-content !important;height:unset !important;min-width:24px;}#main-menu-wrapper label.MainMenuIcons:before{width:100%;font-size:26px;text-align:center;}.famenu,#main-menu-wrapper label.MainMenuIcons{display:block;width:100%;height:35%;padding-top:' + ((get("bools").charAt(1) == "0" && layout == 1) ? '23px' : ((get("bools").charAt(1) == "0" && layout == 4) ? '23px' : '26%')) + ';}.famenu.tag,#main-menu-wrapper.tag label.MainMenuIcons{padding-top:' + ((layout == 1 || layout == 4) ? '15px' : '16%') + ';}#main-menu p,#main-menu q{font-size:15px;font-weight:700;width:calc(100% - 4px);padding:10px 2px;text-align:center;color:' + colors[2] + ';word-wrap:break-word;}</style>');
        // Calendar
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>#calendar,#calendar *{box-sizing:border-box;}ul{list-style-type:none;}#calendar{position:absolute;top:0;right:0;' + ((layout == 1 || layout == 4) ? 'padding-top:' + (Math.round(66 / (zoom / 100))).toString() + 'px;padding-left:20px;' :'padding-left:15%;') + ' height:calc((100vh - 80px) / ' + (zoom / 100) + ');max-width:600px;z-index:1000;width:100%;background:' + (layout == 1 ? 'transparent;border-top-right-radius:16px' :'linear-gradient(to right,rgba(0,0,0,0),' + colors[3] + ' 20%)') + ';-webkit-user-select:none;user-select:none;}.month{padding:25px 40px;width:100%;}.month ul{position:relative;margin:0;padding:0;}.month ul li{margin:0 5px;display:inline-block;color:' + colors[6] + ';font-size:20px;text-transform:uppercase;letter-spacing:3px;float:left;}#month{padding-left:15px;}#month,#year{padding-top:8px;}#weekdays{margin-top:40px;margin-bottom:0;padding:25px 40px;}#weekdays li{color:' + colors[11] + ';display:inline-block;text-align:center;}#days{padding:40px;margin:0;}#days li{position:relative;list-style-type:none;text-align:center;font-size:16px;color:' + colors[9] + ';aspect-ratio:1 / 1;padding-top:calc(50% - 18px);margin:8px;border-radius:50%;cursor:pointer;transition:0.2s background ease;}#days li:hover,#days li.selected{background:' + colors[5] + ';}#days li.empty{border:none;cursor:default;}#days li.active{background:' + colors[6] + ';color:white !important;font-weight:700;}#days li:after{content:"";position:absolute;display:none;border-radius:50%;margin-left:37.5%;margin-top:10%;width:25%;height:25%;}#days li.green:after{display:block;background:#39c380;}#days li.orange:after{display:block;background:#e8ad1c;}#days li.red:after{display:block;background:#f56558;}#days,#weekdays{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr 1fr;grid-template-rows:1fr;}.empty{background:none !important;}@media all and (max-width:1300px){#content-wrapper:has(.stpanel--status){' + (layout == 2 ? 'padding-left: 12vw;' : (layout == 3 ? 'padding-right: 12vw;' : '')) + '}#calendar{padding-left:5%;background:linear-gradient(to right,rgba(0,0,0,0),' + colors[3] + ' 15%);}#days li{margin:15px 2px;padding-top:6px;}}' + ((layout == 2 || layout == 3) ? '#detail-panel-wrapper:has(#calendar){overflow:visible !important;}' : '') + '@media all and (max-height:760px){#weekdays{margin-top:10px;}#days{padding: 0 40px;}}@media (max-width:1300px) and (max-height:760px){#days li {margin:5px 0;}}@media all and (max-height:680px){#days li{margin:0;height:40px;}}</style>');
        // Media queries
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>' + (layout == 1 ? '@media (max-width:1440px){#page-title{left:calc(7.5% + 70px);}.profile-img-menu{right:calc(7.5% + 30px);}a.logout-btn{right:calc(7.5% + 170px);}a.messages-btn{right:calc(7.5% + 110px);}#inbox-counter{right:calc(7.5% + 130px);}.bericht .r-content{max-width:calc(100% - 55px) !important;}.msgdetails1 > .pasfoto{width:40px !important;height:40px !important;margin-right:10px !important;line-height:38px;font-size:20px;}div#master-panel:has(.profileMaster){width:calc(85% / ' + (zoom / 100) + ' - 235px) !important;}div#master-panel:has(.roosterMaster){width:calc(85% / ' + (zoom / 100) + ') !important;}#somtoday-mod > div#modactions{right:7.5%;}#main-menu-wrapper{margin-left:7.5% !important;width:85% !important;}#master-panel{left:7.5% !important;width:' + (48 / (zoom / 100)) + '% !important;}#detail-panel-wrapper{width:calc(' + (35 / (zoom / 100)) + '% - 15px) !important;right:7.5% !important;}#background-image-overlay{left:7.5% !important;width:85% !important;}}' : '') + ((layout == 2 || layout == 3) ? '@media (max-height:890px){#main-menu div a{height:90px;margin:0 !important;}.famenu{padding-top:22%;}.famenu.tag{padding-top:13%;}}@media (max-height:790px){#main-menu div a{height:80px;}.famenu{padding-top:20%;}.famenu.tag{padding-top:10%;}}@media (max-height:700px){#main-menu div a{height:70px;}.famenu{padding-top:17%;}.famenu.tag{padding-top:7%;}}@media (max-height:570px){#main-menu div a{height:60px;}.famenu{padding-top:14%;}.famenu.tag{padding-top:5%;}}' : '') + '@media (max-width:875px){.truncate.afspraak div.toekenning.truncate{padding:0;margin-top:42px;}div.truncate.afspraak{margin:0 2px;}a.afspraak-link.inline{padding:7px;width:calc(100% - 15px);height:calc(100% - 14px);}#main-menu p{font-size:14px;}}@media (max-width:700px){div.layout-container{width:calc(50% - 16px);height:unset;aspect-ratio:1.3 / 1;}div.theme img{height:100px;}div.theme h3{font-size:0;margin-left:0;}.theme h3 svg{height:15px;}div.theme{width:calc(50% - 20px);}#main-menu p{font-size:12px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;}}@media (max-width:600px){#modsettings #modsettings-inner{padding:calc(10px / ' + (zoom / 100) + ') calc(20px / ' + (zoom / 100) + ');height:calc((100% - 20px) /' + (zoom / 100) + ');max-width:calc((100% - 40px) /' + (zoom / 100) + ');}.layout-container div span{display:none;}#main-menu div a{margin:' + ((layout == 4 || layout == 1) ? '0' : '8px 0') + ';}}@media (max-width:500px){div.yellow.ribbon a:first-of-type:not(.menuitem):has(svg){margin-left:-5px;}#master-panel .date{margin-left:-13px;}div.m-element{padding:20px 15px;}.m-wrapper .m-element .IconFont.MainMenuIcons{padding-left:15px;}div div.huiswerk{margin-left:35px;max-width:calc(100% - 105px);}.profielTblData .twopartfields > span,.twopartfields input{max-width:100px !important;}#page-title p{max-width:calc(100vw - 280px);overflow:hidden; height:30px;}label.switch{margin:-8px 0;margin-left:5px;}div#modactions a{margin-bottom:0;}span#inbox-counter{right:115px;}div a.menuitem svg{margin-left:-35px;}div a.menuitem{padding-left:20px;font-size:15px;margin-right:0;}div#modsettings > div > p{max-width:100%;}#modsettings > div:has(.switch) p{width:calc(100% - 55px) !important;}div div#master-panel:has(.profileMaster){width:' + ((layout == 1 || layout == 4) ? 'calc(100% / ' + (zoom / 100) + ' - 40px)' : 'calc((100% - min(14vw,120px)) / ' + (zoom / 100) + ' - 30px)') + ' !important;}.profileMaster div#modsettings{padding:5px 25px}#somtoday-mod > div#modactions{width:30px!important;}#theme-wrapper,#layout-wrapper{width:calc(100% + 58px);}#somtoday-mod > #modactions .button-silver-deluxe span{padding:15px 20px;margin-left:-8px;border-radius:6px;}.toekenning.truncate .icon-huiswerk svg,.toekenning.truncate .icon-toets svg,.toekenning.truncate .icon-grote-toets svg{display:none}.toekenning.truncate .icon-huiswerk,.toekenning.truncate .icon-toets,.toekenning.truncate .icon-grote-toets{width:10px;height:10px;margin-left:0;}.toekenning.truncate{padding:3px !important;}.roster-table-header .day .huiswerk-items{padding-left:0;}.weekitems.eerste-kolom{margin-left:-4px;margin-top:10px;}.hours.eerste-kolom,.day.filler.eerste-kolom{display:none}.day{height:1130px;}div.roster-table{padding:5px;width:calc(100% - 10px);}' + (layout == 1 ? '' : '#inbox-counter{right:120px;}') + ' .profile-img-menu{-webkit-user-select:none;user-select:none;right:25px !important;}a.logout-btn{right:145px !important;}a.messages-btn{right:95px !important;}#page-title{left: ' + (layout == 2 ? '20px' : '10px') + ';}}@media (max-width:1024px){#content-wrapper.is-opendetailpanel #detail-panel-wrapper{top:80px;}}@media (max-width:380px){#page-title p{display:none;}}@media (max-height:600px) and (min-width:1020px){#somtoday-mod > div#modactions{position:absolute;height:fit-content;}}@media (max-height:550px) and (max-width:1020px){#somtoday-mod > div#modactions{position:absolute;border-left:none;}#somtoday-mod > div#modactions a{margin-right:0;}#somtoday-mod > div#modactions .button-silver-deluxe span{overflow:hidden;padding-left:0;width:30px;}}@media (max-width:1020px){.close-detailpanel{right:-5px !important;z-index:1;}.berichtenDetail .close-detailpanel,.activityDetail .close-detailpanel,.homeworkDetail .close-detailpanel{right:20px !important;}.homeworkDetail .blue.ribbon p{transform:translate(-35px,-13px);}.bericht .r-content{max-width:calc(100% - 110px) !important;}#header{margin-left:0;margin-right:0;}div#master-panel:has(.profileMaster){width:' + ((layout == 1 || layout == 4) ? 'calc(100% / ' + (zoom / 100) + ' - 60px)' : 'calc((100% - min(14vw,120px)) / ' + (zoom / 100) + ' - 60px)') + ' !important;padding-right:0;}' + (layout == 1 ? 'body div#master-panel:has(.roosterMaster){width:calc(100% / ' + (zoom / 100) + ') !important;}' : '') + ' .roosterMaster .uurNummer{margin-left:0;}.hour.pauze{visibility:hidden;}' + (layout == 1 ? '.profile-img-menu{-webkit-user-select:none;user-select:none;right:50px;}a.logout-btn{right:170px;}a.messages-btn{right:120px;}#page-title{left:80px;}#inbox-counter{right:140px;}' : '') + ' #header .right{position:static;}#master-panel .date div p.date-day{margin-left:0;}.weekitems.eerste-kolom{margin-bottom:50px;}body #master-panel,body.roster #master-panel{left:' + (layout == 2 ? 'min(120px,14vw)' : '0') + ' !important;width:' + ((layout == 4 || layout == 1) ? 'calc((100% / ' + (zoom / 100) + '))' : 'calc((100% - min(120px,14vw)) / ' + (zoom / 100) + ')') + ' !important;}#background-image-overlay{left:0 !important;width:100% !important;}' + (layout == 1 ? '#main-menu-wrapper{width:100% !important;margin-left:0 !important;}' : '') + ' #content-wrapper #detail-panel-wrapper,#content-wrapper.is-opendetailpanel #master-panel{display:none !important;}#content-wrapper.is-opendetailpanel #detail-panel-wrapper,#content-wrapper #master-panel{display:block !important;top:' + ((layout == 4 || layout == 1) ? '160px' : '80px') + ' !important;}#content-wrapper.is-opendetailpanel #detail-panel{padding-top:20px;box-sizing:border-box;}.box.msgdetails2{margin-right:0;}.leermiddelen #content-wrapper.is-opendetailpanel #detail-panel-wrapper{min-height:60px;opacity:1 !important;}#content-wrapper.is-opendetailpanel #detail-panel-wrapper{overflow:hidden !important;height:fit-content;display:block;position:absolute;top:80px;z-index:10;width:calc((100% ' + ((layout == 4 || layout == 1) ? '' : '- min(120px,14vw)') + ') / ' + (zoom / 100) + ' - 30px) !important;' + ((layout == 2 || layout == 3) ? (layout == 3 ? 'right' : 'left') + ':min(120px,14vw)' : 'left:0') + ' !important;transform-origin:top left !important;right:0;padding:0 15px;}}@media all and (max-width:1700px){' + ((layout == 4 || layout == 1) ? '#main-menu div a{width:' + (100 / id('main-menu').getElementsByTagName('a').length) + '% !important;max-height:80px !important;}' : '') + ' .homeworkDetail .blue.ribbon p{visibility:hidden;}.homeworkDetail .blue.ribbon p a{visibility:visible;}}.logout-btn{right:' + (layout == 1 ? 'calc(15% + 170px)' : '180px') + ';}.messages-btn{right:' + (layout == 1 ? 'calc(15% + 110px)' : '120px') + ';}ul li label{color:' + colors[7] + ';font-size:14px;padding:5px;}input[type=text],input[type=number],#mod-message textarea{background:none;max-width:calc(100% - 24px);background:' + colors[12] + ';border:2px solid ' + colors[4] + ';color:' + colors[11] + ';transition:border 0.2s ease;border-radius:14px;padding:5px 10px;}input[type=text]:focus,input[type=number]:focus,#mod-message textarea:focus{outline:none;border:2px solid ' + colors[7] + ';}</style>');
        // Somtoday popups (roster popup and link popup)
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>.fancybox-close,.ui-dialog .ui-dialog-titlebar-close{background:' + colors[0] + ';border-radius:50%;transition:0.2s background ease;animation:0.2s closebtnopacity ease;border:none;width:36px;height:36px;z-index:1000;overflow:hidden;}@keyframes closebtnopacity{0%{opacity:0;transform:scale(0);}100%{opacity:1;transform:scale(1);}}' + (layout == 1 ? '.ui-dialog{transform:translateY(-20px);}' : '') + '.ui-dialog .ui-dialog-titlebar-close{margin-right:-20px;margin-top:-35px;}.fancybox-close:hover,.ui-dialog .ui-dialog-titlebar-close:hover{background:' + colors[1] + ';}.ui-icon.ui-icon-closethick{background-image:unset !important;position:relative;margin-top:-3px;margin-left:0;display:block;top:0;left:0;width:100%;height:100%;text-indent:0;}.fancybox-close:before,.ui-icon-closethick:before{content:"\u00D7";display:block;color:white;font-size:30px;margin:2px 8px;transition:transform 0.2s ease;}.fancybox-close:hover:before,.ui-dialog .ui-dialog-titlebar-close:hover .ui-icon-closethick:before{transform:scale(0.8);}.fancybox-wrap{overflow:visible !important;}.fancybox-skin,.box{background:' + colors[12] + ';padding:15px 20px !important;border-radius:12px;}.fancybox-skin{padding-right:0 !important;transition:0.3s box-shadow ease;box-shadow:' + (get('bools').charAt(0) == "1" ? '0 0 50px #555' : '0 0 50px #aaa') + ' !important;}.fancybox-skin *,.box *{color:' + colors[11] + ' !important;word-wrap:break-word;} .fancybox-inner,.fancybox-skin{width:665px !important;max-width:100%;}.fancybox-skin{max-width:calc(100% - 25px);}.fancybox-overlay{overflow:hidden !important;background:rgba(0,0,0,0.3);} .ui-widget.ui-widget-content,.ui-widget.ui-widget-content fieldset,fieldset input{color:' + colors[11] + ';border:none;}fieldset legend{margin-left:-2px;font-size:16px;font-weight:700;}fieldset label:last-of-type{display:none;}fieldset{border:none;padding-bottom:20px;}fieldset label input{margin-top:5px;}fieldset label{margin-top:10px;display:block;}fieldset input[type=submit],fieldset input[type=reset]{font-weight:700;cursor:pointer;padding-top:15px;background:none;}</style>');
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
        tn("head", 0).insertAdjacentHTML('beforeend', '<style>#mod-message input,div#mod-message textarea{display:block;width:100%;max-width:100%;padding:20px;font-size:14px;margin:10px 0;}div#mod-message textarea{height:300px;padding:12px 20px;}#mod-message .mod-message-button:focus{border:4px solid ' + colors[13] + ';}#mod-message .mod-message-button.mod-button-discouraged:focus{border:4px solid darkred !important;}#mod-message .mod-message-button.mod-button-discouraged{background:' + colors[12] + ' !important; color:red !important; border:4px solid red !important;}#mod-message .mod-message-button{-webkit-user-select:none;user-select:none;text-decoration:none;font-size:14px;padding:12px 24px;border:4px solid ' + colors[0] + ';background:' + colors[0] + ';border-radius:8px;margin-top:10px;margin-right:10px;display:inline-block;color:' + colors[2] + ';}#mod-message a{text-decoration:underline;}#mod-message p,#mod-message h3{font-size:14px;margin-bottom:10px;line-height:17px;}#mod-message h2{font-size:18px;margin-bottom:20px;}#mod-message > center{position:absolute;width:100%;top:-300px;animation:0.4s modmessageslidein ease 0.15s forwards;opacity:0;}@keyframes modmessageslidein{0%{top:-300px;opacity:0;}50%{opacity:1;}100%{top:0;opacity:1;}}#mod-message > center > div{background:' + colors[12] + ';box-shadow:' + (get('bools').charAt(0) == "1" ? '0 0 50px #555' : '0 0 50px #aaa') + ';width:500px;max-width:calc(100% - 16px);border-bottom-left-radius:16px;border-bottom-right-radius:16px;text-align:left;padding:20px 30px;box-sizing:border-box;}#mod-message,#mod-message *{box-sizing:border-box;}#mod-message{position:fixed;top:0;left:0;width:100%;height:100%;opacity:0;z-index:100000;background:' + (get('bools').charAt(0) == '1' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)') + ';box-sizing:border-box;transition:opacity .2s ease;}#mod-message.mod-msg-open{opacity:1;animation:0.2s modmessagebackground ease forwards;}@keyframes modmessagebackground{0%{background:rgba(0,0,0,0);}100%{background:' + (get('bools').charAt(0) == '1' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)') + ';}}</style>');
        // Mod tooltip - imitates Somtoday tooltips
        tn("head", 0).insertAdjacentHTML('beforeend', '<style>.mod-tooltip-active{opacity:1;}.mod-tooltip{opacity:0;}.mod-tooltip,.mod-tooltip-active{transition:opacity 0.6s ease;z-index:1000;background:' + colors[12] + ';display:block;position:absolute;font-size:1.1em;pointer-events:none;padding:8px;color:' + colors[11] + ';border-radius:4px;max-width:min(500px,70%);}</style>');
        // Modsettings
        tn("head", 0).insertAdjacentHTML('beforeend', '<style>.layout-container.layout-selected,.layout-container:hover{border:3px solid ' + colors[1] + ';}.layout-container{display:inline-block;vertical-align:top;margin-left:10px;margin-bottom:50px !important;width:180px;height:130px;background:' + colors[12] + ';border:3px solid ' + colors[12] + ';border-radius:16px;position:relative;cursor:pointer;transition:border 0.2s ease;box-shadow:2px 2px 20px ' + (get('bools').charAt(0) == "1" ? '#555' : '#ddd') + ';}.layout-container div span{position:absolute;transform:translate(-50%,-50%);top:50%;left:50%;}.layout-container h3{bottom:-40px;width:100%;position:absolute;text-align:center;}.layout-container div{-webkit-user-select:none;user-select:none;background:' + colors[5] + ';border-radius:6px;position:absolute;}.example-box-wrapper{background:' + colors[12] + ';border:3px solid ' + colors[4] + ';width:500px;padding:10px 20px;border-radius:12px;overflow:hidden;max-width:calc(100% - 50px);margin-top:-10px;}.example-box-wrapper > div{transform-origin:top left;}#theme-wrapper,#layout-wrapper{width:calc(100% + 18px);margin-left:-5px;}#layout-wrapper{margin-left:-15px;}.theme{display:inline-block;cursor:pointer;width:190px;margin-bottom:10px !important;margin-left:5px;overflow:hidden;background:' + colors[12] + ';border:3px solid ' + colors[12] + ';border-radius:16px;transition:.3s border ease,.2s background ease;box-shadow:2px 2px 10px ' + (get('bools').charAt(0) == "1" ? '#555' : '#ddd') + ';}.theme:hover,.theme.theme-selected,.theme.theme-selected-set{border:3px solid ' + colors[5] + ';}.theme.theme-selected,.theme.theme-selected-set{background:' + colors[5] + ';}.theme img{width:100%;height:175px;object-fit:cover;background:' + colors[12] + ';}.theme h3{margin:10px 15px;}.theme h3 div{display:inline-block;height:12px;width:12px;border-radius:50%;position:absolute;margin:5px 10px;}.theme h3 svg{display:inline-block;position:absolute;margin:3px 30px;}.profileMaster #modsettings{padding:5px 35px;margin-top:-70px;}#modsettings.mod-setting-popup{position:fixed;top:0;left:0;height:100%;width:100%;background:rgba(0,0,0,0.3);z-index:1000;}#modsettings.mod-setting-popup > div{transform-origin:top center;background:' + colors[12] + ';width:calc(1000px / ' + (zoom / 100) + ');max-width:calc((100% - 80px) / ' + (zoom / 100) + ');position:absolute;top:0;height:calc((100% - 40px) / ' + (zoom / 100) + ');overflow-x:hidden;overflow-y:auto;padding:calc(20px / ' + (zoom / 100) + ') calc(40px / ' + (zoom / 100) + ');left:50%;transform:translateX(-50%) scale(' + zoom + '%);}#somtoday-mod > #modactions{position:fixed;padding:20px;right:' + (layout == 3 ? 'min(120px,14vw)' : (layout == 1 ? '15%;border-image:linear-gradient(to top,' + colors[4] + ' 80%,rgba(0,0,0,0) 90%) 1 100%' : "0")) + ';top:0;padding-top:' + ((layout == 4 || layout == 1) ? (layout == 1 ? (Math.round(200 / (zoom / 100))).toString() + 'px' : (Math.round(190 / (zoom / 100))).toString() + 'px') : "100px") + ';height:100%;background:' + (layout == 1 ? 'transparent' : colors[12]) + ';border-left:3px solid ' + colors[4] + ';transform:scale(' + zoom + '%);transform-origin:top right;width:195px;}#modactions .button-silver-deluxe span{background:transparent;border:none;text-wrap:nowrap;}#modactions .button-silver-deluxe:hover span{background:' + colors[4] + ';}#modactions a{margin-right:10px;margin-bottom:10px;width:100%;}#modsettings-inner #modactions{margin:0 -10px;margin-bottom:-60px;}#modsettings-inner #modactions a{width:fit-content;}#modsettings h3.category{padding:10px;border-bottom:6px solid ' + colors[14] + ';border-radius:6px;font-size:20px;margin:20px -10px;margin-top:75px;}#modsettings div{margin-bottom:30px;}#modsettings input{margin-left:0;display:block;}#modsettings p{display:inline-block;}#modsettings > div > p{max-width:calc(100% - 100px);}#modsettings input[type="text"]{width:500px;}div.mod-button{margin-top:-20px;margin-bottom:20px !important;display:inline-block;margin-right:10px;}label.mod-file-label:hover,.mod-button:hover{border:2px solid ' + colors[5] + ';cursor:pointer;}.mod-file-label,.mod-button{-webkit-user-select:none;user-select:none;transition:0.2s border ease;background:' + colors[12] + ';display:block;width:fit-content;padding:10px 18px;border:2px solid ' + colors[7] + ';border-radius:12px;margin:5px 0;color:' + colors[7] + ';}label.mod-file-label.mod-active svg path{fill:white !important;}div.mod-button.mod-active,label.mod-file-label.mod-active{background:' + colors[7] + ';color:' + colors[12] + ';}.mod-file-label p{margin-left:10px;}input[type="file"].mod-file-input{display:none !important;}input[type="color"]{width:0;height:0;visibility:hidden;overflow:hidden;opacity:0;}.color{cursor:pointer;width:35px;height:35px;border-radius:50%;border:3px solid ' + colors[4] + ';display:inline-block;}</style>');
        // Miscellaneous
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>.ui-tooltip{pointer-events:none;' + (get("bools").charAt(8) == "1" ? "display:none !important;}" : " }") + (get("bools").charAt(9) == "0" ? 'html::-webkit-scrollbar{display:none;}html{scrollbar-width:none;' : 'html{') + (layout == 1 ? ' position:relative;margin-top:20px;' : '') + ' scroll-padding-top:100px !important;scroll-padding-bottom:150px !important;background-color:' + colors[12] + ';}.custom-select{border:2px solid #f0f3f5;background:#fff;}.custom-select:hover{border:2px solid ' + colors[3] + ';}.custom-select:focus-within{outline:none !important;border:2px solid ' + colors[13] + ' !important;}.custom-select select{outline:none;}.afspraak-window .bold{margin-bottom:6px;}.ui-autocomplete{padding:0;margin:0;border-radius:16px;overflow:hidden;translate:200px 0 !important;}.inpQuickSearch{width:100% !important;}.inpQuickSearch input{width:100% !important;}.ui-menu .ui-menu-item .ui-menu-item-wrapper{padding:10px 15px;}.ui-state-active,.ui-widget-content .ui-state-active{background:' + colors[3] + ';color:' + colors[11] + ';border:none;padding:11px 16px !important;}.inleveropdracht-conversation-separator{border-top:none;}.leermiddelenDetail .panel-header .type{margin-top:-5px;}.jaarbijlagen .jaarbijlagen-header{margin-bottom:7px;margin-top:7px;padding-top:15px;}.jaarbijlagen .jaarbijlage-map .jaarbijlage-map-header,.jaarbijlagen .bijlagen-container .bijlagen-header{margin:0 -15px;padding:0 15px;}.jaarbijlagen .jaarbijlage .url{margin:-6px -10px;padding:6px 10px;}.jaarbijlagen .icon-chevron-right{margin-top:3px;}.jaarbijlagen .expanded .icon-chevron-right{margin-top:-5px;}.section>h3{border-top:none;border-bottom:0;margin-bottom:0;}.yellow.ribbon .d-next svg,.yellow.ribbon .d-prev svg,#mod-nextmonth svg,#mod-prevmonth svg,.yellow.ribbon .chk svg{transition:transform 0.3s ease;}.yellow.ribbon .d-next:hover svg,.yellow.ribbon .d-prev:hover svg,#mod-nextmonth:hover svg,#mod-prevmonth:hover svg,.yellow.ribbon .chk:hover svg{transform:scale(1.1);}.homeworkDetail .blue.ribbon p{margin-top:-5px;}.roosterMaster .hours .hour{width:100% !important;}.set .block .blocks{display:block;}.profileMaster{position:relative;}#master-panel:has(.profileMaster){width:calc((' + (layout == 1 ? 70 : 100) + '% / ' + (zoom / 100) + ') - 238px' + ((layout == 2 || layout == 3) ? ' - (min(120px,14vw) / ' + (zoom / 100) + ')' : '') + ') !important;}#master-panel:has(.roosterMaster){width:calc((' + (layout == 1 ? 70 : 100) + '%' + ((layout == 2 || layout == 3) ? ' - min(120px,14vw)' : '') + ') / ' + (zoom / 100) + ') !important;}.roosterMaster{width:100%;}.uurTijd,.pauzetijden{margin-left:65px;}.profileMaster h2.left-16{margin-left:26px;}.vakkenMaster .sub>span:first-of-type{display:inline;}.section.beschrijving .right{color:' + colors[6] + ';border:2px solid ' + colors[3] + ';background:' + colors[12] + ' !important;transition:border .3s ease,background .3s ease,color .2s ease;margin-bottom:10px;float:left;margin-left:0;margin-right:8px;}.section.beschrijving .right:hover{background:' + colors[0] + ' !important;color:' + colors[2] + ';border:2px solid ' + colors[0] + ';}.agendaKwtWindow table.keuzes tr.details td.details{line-height:17px;}.bericht .r-content{max-width:calc(100% - 80px);}.r-content.bericht > .msgdetails1:first-of-type h2:empty:before,.m-element .msgdetails1 h2:empty:before{content:"Geen onderwerp";color:' + colors[9] + ';}#detail-panel .type,.m-wrapper.active .type{margin-right:5px;width:29px;line-height:29px;}.type span{width:35px;text-wrap:nowrap;overflow:hidden;text-overflow:ellipsis;}.leermiddelenDetail .set .double .block .content > div > div:first-of-type:not(:empty){margin-top:6px;}.leermiddelenDetail .set,.vakkenDetail .section:last-of-type .set{column-count:2;}.leermiddelenDetail .set .double,.vakkenDetail .section:last-of-type .set .double{display:inline-block;width:100%;}.set .double .block{margin:5px 0;}.leermiddelenDetail .set .double .block .content .header{margin:-12px;padding:12px;display:block;}.close-detailpanel .icon-remove-sign{color:' + colors[6] + ';}#main-menu-bottom{display:none;}.ui-widget-overlay.ui-front{background:#000;z-index:10000 !important;}div.info-notice.nobackground{padding:0;margin:15px 30px !important;background:none;border:none;}.inleverperiode-panel .header{line-height:25px;}.inleverperiode-panel .leerling-inlevering{line-height:30px;}.file-download .header{margin-top:20px;}div.info-notice{width:fit-content;margin-bottom:10px !important;padding:10px 20px;border:2px solid ' + colors[7] + ';color:' + colors[7] + ' !important;background:' + colors[12] + ';line-height:15px;border-radius:16px;padding-left:50px;}.info-notice svg{height:20px;position:absolute;margin-left:-30px;margin-top:-4px }.goverview{margin-top:20px;}.m-wrapper.active .m-element .IconFont.MainMenuIcons{opacity:1;padding-left:30px;font-size:15px;}.inleveropdracht-conversation .reactie-container textarea{outline:none;border:2px solid ' + colors[4] + ';line-height:27px;padding:5px 10px;transition:border .2s ease;background:' + colors[12] + ';}.inleveropdracht-conversation .reactie-container textarea:hover{border:2px solid ' + colors[4] + ';box-shadow:none;}.inleveropdracht-conversation .reactie-container textarea:focus{box-shadow:none;border:2px solid ' + colors[13] + ';}.inleveropdracht-conversation .reactie-container a{border:none;background:' + colors[13] + ';}.inleveropdracht-conversation .reactie-container a.disabled i{color:#bbb;}.gperiod .tog-period,.gperiod.expand .tog-period{border-top:0;}#mod-prevmonth, #mod-nextmonth{display:none;}.homeworkaster #mod-prevmonth,.homeworkaster #mod-nextmonth{height:1.5em;display:inline-block;margin-right:12px;padding:1px 2px;box-sizing:border-box;}.homeworkaster .yellow.ribbon span{width:100px;}#background-img{z-index:-2;pointer-events:none;-webkit-user-select:none;user-select:none;position:fixed;top:0;left:0;width:100%;height:100%;object-fit:cover;' + (!n(get("blur")) ? 'filter:blur(' + get("blur") + 'px);' : '') + ' }.br{height:10px;margin-bottom:0 !important;}#master-panel .sub,.inleveropdracht-conversation .boodschap .afzender{color:' + colors[9] + ';}.afspraak-window{width:630px;}.details.expanded tr{width:100%;display:inline-block;}.inleveropdracht-conversation .boodschap{display:inline-block;width:calc(100% - 80px);vertical-align:top;margin-left:0;}.leerling-inlevering .icon-trash{padding-top:10px;}#modactions .button-silver-deluxe span{-webkit-user-select:none;user-select:none;padding-left:40px;position:relative;font-size:14px;}#modactions .button-silver-deluxe span svg{height:1.5em;position:absolute;left:15px;font-size:12px;}@media (max-width:1020px){#somtoday-mod > #modactions h2{display:none;}#somtoday-mod > #modactions{padding:5px !important;right:' + (layout == 3 ? 'min(120px,14vw)' : '0') + ' !important;padding-top:' + Math.round(195 / (zoom / 100)).toString() + 'px !important;width:50px !important;}#somtoday-mod > #modactions .button-silver-deluxe span{color:transparent;width:60px;}}.keuzes tr.details td.details{width:100%;}.keuzes tr.details td:last-of-type table tr td:last-of-type{min-width:250px;}.keuzes tr.details > td:first-of-type{display:none;}</style>');
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>.antwoordheader{margin-top:15px;}.conversation div.sub{position:absolute;top:-30px;width:100%;}.conversation .bericht{position:relative;margin-top:60px;margin-bottom:0;}.triangle-box::after,.triangle-box::before{display:none;}.triangle-box{background:' + colors[12] + ';margin-left:70px;border:3px solid ' + colors[3] + ';color:' + colors[11] + ';padding:10px 20px;}.conversation .pasfoto{position:absolute;}.conversation{border-top:none;}.label-pill-lighter,.huiswerkbijlage .simple-view .bijlage-extensie,.simple-view,.jaarbijlage-extensie{background:transparent !important;border:2px solid ' + colors[3] + ' !important;color:' + colors[6] + ' !important;}.jaarbijlage{border:2px solid transparent !important;}.simple-view:hover,.simple-view:hover .bijlage-extensie,.jaarbijlage:hover .jaarbijlage-extensie{border:2px solid ' + colors[1] + ' !important;}.simple-view,.huiswerkbijlage .simple-view .bijlage-extensie,.simple-view .bijlage-label,.jaarbijlage,.jaarbijlage-extensie{transition:0.3s background ease,0.2s color ease,0.2s border ease !important;}.simple-view:hover,.huiswerkbijlage .simple-view:hover .bijlage-extensie,.jaarbijlage:hover .jaarbijlage-extensie,.jaarbijlage:hover{background:' + colors[0] + ' !important;color:' + colors[2] + ' !important;}.simple-view:hover .bijlage-label,.jaarbijlagen .jaarbijlage:hover .jaarbijlage-label{color:' + colors[2] + ' !important;}.huiswerkbijlage .simple-view .bijlage-label{color:' + colors[6] + ';}.section.beschrijving > .section:last-of-type > p{margin-top:5px;margin-bottom:10px;}.box.small.inline.roster .location{padding-left:0;background:none;}.box.small.inline.roster .number{margin-right:10px;color:' + colors[6] + ';}.box.small.inline.roster{background:' + (get('bools').charAt(0) == "1" ? colors[8] : colors[12]) + ';vertical-align:top;width:calc(33.333% - 10px);padding:10px 15px !important;border-radius:14px;box-sizing:border-box;border:none;color:' + colors[9] + ';min-width:130px;margin-right:10px;margin-bottom:10px;}.glevel > div{padding:5px 15px;}.glevel > div{display:none;}.glevel:has(.expanded) > div{display:block;}.glevel{background:' + colors[8] + ';border-radius:8px;}.gperiod.expand .tog-noperiod,.tog-level:hover{border-radius:8px;border:none;background:' + colors[8] + ' url(../images/bck_levelshrinked-ver-183AE12A8943134C34FA665BC1D0AFF0.png) no-repeat 10px 10px;}.tog-level.expanded{background:' + colors[8] + ' url(../images/bck_levelexpanded-ver-E3703F8158EBFA264750E762D48B5ABF.png) no-repeat 10px 10px;}.grades .glevel .tog-level span.right,.tog-level > span > span > .right{margin-right:10px;}.tog-level{transition:background 0.2s ease;border-radius:8px;border:none;background:transparent url(../images/bck_levelshrinked-ver-183AE12A8943134C34FA665BC1D0AFF0.png) no-repeat 10px 10px;padding:5px;padding-left:30px;}.gperiod.expand,.gperiod.expand tbody,.exam td,.exam tr.even,.exam tr.odd{background:transparent;border:none;}.section span.grade,.section span.weging{background:none;}div.wysiwyg>textarea{background:' + colors[12] + ';width:calc(100% - 30px) !important;}.set .block .blocks .block{background:' + colors[8] + ';margin:8px 0;width:unset !important;display:block;border-radius:12px;padding:10px 20px;border:3px solid ' + colors[4] + ';}.set .block .blocks .block *{color:' + colors[11] + ';}.inleverperiode-panel .block,.inleverperiode-panel .leerling-inlevering{border:none;}.file-download .naam{color:' + colors[6] + ' !important;}.file-download .leerling-inlevering:hover{background:transparent !important;}.ui-widget-header,.ui-widget-content,.section .grade,.section .weging{background:' + colors[12] + ';border:none;}.map-naam{-webkit-user-select:none;user-select:none;}.bijlagen-container:hover .map-naam,.jaarbijlage-map:hover .map-naam,textarea{color:' + colors[11] + ' !important;}.jaarbijlagen .jaarbijlage,.huiswerkbijlage .simple-view{-webkit-user-select:none;user-select:none;border-radius:6px;background:' + colors[12] + ';border:none;}.jaarbijlagen .bijlagen-container .bijlagen-header,.jaarbijlagen .bijlagen-container .jaarbijlage-map-header,.jaarbijlagen .jaarbijlage-map .bijlagen-header,.jaarbijlagen .jaarbijlage-map .jaarbijlage-map-header,.jaarbijlagen .jaarbijlage .jaarbijlage-label{color:' + colors[6] + ';}.jaarbijlagen .bijlagen-container,.jaarbijlagen .jaarbijlage-map{background:' + colors[12] + ';border:none !important;transition:background 0.3s ease;}.jaarbijlagen .bijlagen-container:hover,.jaarbijlagen .bijlagen-container.expanded,.jaarbijlagen .jaarbijlage-map.expanded,.jaarbijlagen .jaarbijlage-map:hover,div.block.content,.box.inleverperiode,.double .block{background:' + colors[8] + ';border:none !important;transition:background 0.3s ease;}.box.inleverperiode,.double .block{color:' + colors[11] + ' }.box.inleverperiode:hover,.double .block:hover{background:' + colors[12] + ';}.box.inleverperiode:hover *{color:' + colors[6] + ' !important;}#master-panel{transform:scale(' + zoom + '%);transform-origin:top left;min-height:calc((100vh - ' + (layout == 1 ? '180px' : (layout == 4 ? '160px' : '80px')) + ') / ' + (zoom / 100) + ');padding-bottom:0;padding-top:0;position:absolute;' + (layout == 1 ? 'top:160px;left:15%' : (layout == 2 ? 'top:80px;left:min(14vw,120px)' : (layout == 3 ? 'top:80px;left:0' : 'top:160px;left:0'))) + ';background:' + ((layout != 1 && layout != 4) ? colors[8] : 'transparent') + ';}#detail-panel{width:100% !important;top:0;position:static !important;' + ((layout == 1 || layout == 4) ? 'padding-top:' + (Math.round(115 / (zoom / 100))).toString() + 'px;' : '') + ' }#detail-panel-wrapper{transform:scale(' + zoom + '%);transform-origin:top right;background:' + ((layout != 1 && layout != 4) ? colors[8] : 'transparent') + ';' + ((layout == 2 || layout == 4) ? 'top:80px;right:0;' : (layout == 1 ? 'top:80px;right:15%;' : 'top:80px;right:min(14vw,120px);')) + ((get("bools").charAt(3) == "1" && layout != 4 && layout != 1) ? 'height:calc((100% - 80px) / ' + (zoom / 100) + ') !important;position:fixed;overflow-y:auto !important;overflow-x:hidden !important;' : 'position:absolute;min-height:calc((100% - 160px) / ' + (zoom / 100) + ');height:fit-content;overflow:visible !important;') + ' min-width:unset;}#master-panel~#detail-panel-wrapper{border-left:none !important;}#detail-panel,#detail-panel-wrapper,.loaderFade,#master-panel{transition:none;}.button-silver-deluxe{box-shadow:none;border:none;}a.button-silver-deluxe:focus span,div.button-silver-deluxe:focus span,a.button-silver-deluxe:hover span,div.button-silver-deluxe:hover span{background:' + colors[4] + ';color:' + colors[9] + ';text-shadow:none;font-weight:700;}.button-silver-deluxe span{text-shadow:none;transition:0.3s background ease;background:' + colors[12] + ';border:3px solid ' + colors[4] + ';color:' + colors[9] + ';padding:10px 20px;border-radius:14px;}#master-panel div.sub{padding-left:0;}.roster-table-content .uurNummer,.goverview tbody td,.goverview th{background:' + colors[12] + ' !important;border:3px solid ' + colors[3] + ' !important;color:' + colors[9] + ' !important;}.goverview th{background:' + colors[3] + ' !important;}</style>');
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>.roster-table{padding:20px;width:calc(100% - 40px);}.huiswerk-items{min-height:80px !important;padding-top:10px;padding-bottom:20px;}.weekitems.eerste-kolom .weekItem,.weekitems.eerste-kolom .geen-items{padding-top:15px;}.ui-widget-shadow{box-shadow:none;}.roster-table-header .day .huiswerk-items,.roster-table-header .day,.dayTitle{background:transparent !important;}.toekenning.truncate .icon-huiswerk,.toekenning.truncate .icon-toets,.toekenning.truncate .icon-grote-toets{margin-right:3px;}.toekenning.truncate .huiswerk-gemaakt,.glevel *{color:' + colors[9] + ' !important;}.toekenning.truncate span,.toekenning.truncate a,.toekenning.truncate,.huiswerk-items{color:' + colors[10] + ';pointer-events:all;}.afspraak .icon-link{position:relative;z-index:10;}.icon-studiewijzer,.icon-huiswerk,.icon-leermiddelen{background:#39c380;}.icon-toets{background:#e8ad1c;}.icon-grote-toets{background:#f56558;}.icon-studiewijzer,.icon-toets,.icon-huiswerk,.icon-grote-toets,.icon-leermiddelen{margin-left:5px;padding-top:4px;box-sizing:border-box;height:22px;width:22px;}.icon-studiewijzer:before,.icon-toets:before,.icon-huiswerk:before,.icon-grote-toets:before,.icon-leermiddelen:before{display:none;}.icon-leermiddelen{margin-left:0;}.afspraak-link.inline{padding:12px 15px;margin:0;height:calc(100% - 24px);width:calc(100% - 30px);position:absolute;}.truncate.afspraak{box-sizing:border-box;background:' + colors[3] + ';border-radius:8px;transition:background 0.3s ease;margin:0 5px;}.afspraakVakNaam.truncate,.load-more a div{min-width:40px;text-decoration-color: ' + colors[6] + ' !important;color:' + colors[6] + ';}.load-more a:hover div{text-decoration:underline;}.afspraakTijdEnLocatie div{clear:unset !important;display:inline-block !important;margin-right:10px !important;}.afspraakTijdEnLocatie *,.kwtOpties{color:' + colors[9] + ';font-size:12px;padding-left:0;}.truncate.afspraak:hover{background:' + colors[4] + ';}.truncate.afspraak.nlg{background:' + colors[8] + ';box-shadow:none;border:3px solid ' + colors[3] + ';}.day{border-left:none;}.dayTitle,.roster-table-content .day,.roster-table-content .hours,.roster-table-header,.roster-table-content .hours .hour{border-color:transparent !important;}.hour.pauze{background:none !important;}.truncate.afspraak .toekenning.truncate{margin-top:55px; height:fit-content;position:relative;pointer-events:none;padding:0 7px;}.toekenning.truncate{background:transparent;padding:3px 7px;padding-right:15px;z-index:1;}.d-next,.d-prev{transform:none;border:none;cursor:pointer;height:18px;width:18px;}#nprogress .bar,#nprogress .peg{background:' + colors[0] + ';box-shadow:none;}body{height:0;overflow-y:scroll !important;color:' + colors[11] + ';}#content,body{border:none;background:transparent !important;}div.panel-header{border-bottom:0 !important;margin-bottom:4px;max-width:100% !important;}.title div.block.content{padding:13px 20px;border-radius:12px;}h2,h3,.title div.block.content,.section>p,.inleveropdracht-conversation .boodschap .content{color:' + colors[11] + ';}div table.tblData td.tblTag{color:' + colors[11] + ';border-bottom:0;}.section li.block,.box.msgdetails2,.verstuurpanel .invoerVeld.textinhoud{word-wrap:break-word;background:' + (get('bools').charAt(0) == "1" ? colors[8] : colors[12]) + ';margin:8px 0;padding:15px 20px;border-radius:14px;border:3px solid ' + colors[3] + ';color:' + colors[11] + ';}.bericht .r-content h2{max-width:100%;}.verstuurpanel .invoerVeld.textinhoud{width:calc(100% - 55px);transition:border .3s ease;}.verstuurpanel .invoerVeld.textinhoud:focus{outline:none;border:3px solid ' + colors[7] + ';}.studiewijzerdescription,.r-content{color:' + colors[9] + ';}.yellow.ribbon a.IconFont,.yellow.ribbon a:hover{background:transparent;} h1,.box .number{color:' + colors[6] + ' !important;} .blue.ribbon p{margin-left:-140px !important;display:block;position:absolute;}.left h1{display:none;}.profileMaster div h2{display:none;}.yellow.ribbon:hover a.menuitem::after,a.menuitem:hover::after{margin-left:10px;opacity:1;}a.menuitem:after{transition:opacity 0.3s ease,margin-left 0.3s ease;opacity:0;display:inline-block;margin-left:-5px;position:absolute;margin-top:3px;content:url(\'data:image/svg+xml;utf8,<svg fill="%23' + colors[6].substring(1) + '" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>\');}a.menuitem svg{width:25px;height:25px;margin-left:-50px;margin-top:-3px;position:absolute;}a.menuitem{-webkit-user-select:none;user-select:none;padding:0;padding-left:50px;margin:5px 25px;display:block;font-size:18px;color:' + colors[6] + ';}.pasfoto{border:0 !important;border-radius:50%;overflow:hidden;object-fit:cover;display:inline-block;width:50px !important;height:50px !important;margin-right:20px !important;}.pasfoto svg{height:100%;background:' + colors[8] + ';}.yellow.ribbon{top:0;left:0;position:absolute;box-sizing:border-box;padding:10px;width:100%;background:linear-gradient(90deg,' + colors[4] + ' 0%,' + colors[3] + ' 25%,' + colors[3] + ' 75%,rgba(0,0,0,0) 100%) !important;}.yellow.ribbon *{overflow:visible;}.yellow.ribbon p{height:34px;}.yellow.ribbon p a{border-bottom:0 !important;}.yellow.ribbon p a:before{display:none;}.tog-period span.titel{width:calc(100% - 100px);height:24px;overflow:hidden;text-overflow:ellipsis;display:inline-block;line-height:20px;white-space:nowrap;}.box.small.roster.class li > *{font-size:14px;margin-left:10px;margin-top:0;margin-bottom:5px;display:inline-block;}.box.small.roster.class li{height:fit-content !important;display:block;}.box.small.roster.class{border:none;padding:15px;border-radius:10px;margin-bottom:10px;}.box .class-time{background:none;padding-left:0;display:block;}.m-element:hover{border-bottom:0 !important;}.twopartfields span{float:right;}.profielTblData,.profileMaster .m-wrapperTable{max-width:100%;width:720px;padding-left:10px;}.profielTblData .button-silver-deluxe{margin-right:0;margin-bottom:15px;}div.m-wrapperTable table.profielTblData tr td{border-bottom:none;padding:0 5px !important;}.profielTblData tr td:first-of-type{width:70%;}.profielTblData tr td:last-of-type{text-align:right;}.m-wrapper.active{margin-right:0;padding-right:0;background:none !important;}.m-wrapper.active .type.IconFont.icon-envelope-open,.m-wrapper.active .type.IconFont.icon-envelope-open-attach,.m-wrapper.active .type.IconFont.icon-envelope,.m-wrapper.active .type.IconFont.icon-envelope-attach{width:29px;}.profileMaster .m-wrapper.active .type:has(svg){width:29px;}.IconFont:not(.MainMenuIcons):before,.IconFont label:before,.m-wrapper .type:before,.icon-envelope-open:before,.icon-trash:before,.mod-icon-hide:before{display:none;}.msgdetails1 .IconFont svg,.m-wrapper .type svg{display:block;margin:auto;}.msgdetails1 .IconFont:not(.icon-chevron-right),.m-wrapper .type{position:absolute;overflow:visible !important;}.r_content.sub{padding:0 !important;}div.type{text-align:left;color:' + colors[6] + ';background:none;border:none;margin:0;}</style>');
        tn('head', 0).insertAdjacentHTML('beforeend', '<style>.weekitems.eerste-kolom .geen-items.truncate{padding-left:14px;}#user span.header{display:none;}#close-modsettings{user-select:none;font-size:50px;right:0;position:absolute;color:white;text-shadow:0 0 5px #555;padding:5px 20px;}svg:hover g.glasses{animation:1s glasses linear forwards;}@keyframes glasses{0%{transform:translateY(-60px);opacity:0;}50%{transform:translateY(-30px);opacity:1;}100%{transform:translateY(0px);opacity:1;}}.geen-items.truncate{padding:3px 6px;}.stpanel--error--message a:hover,.stpanel--status a:hover{background:' + colors[0] + ';color:' + colors[2] + ';}.stpanel--error--message a,.stpanel--status a{display:block;transition:0.2s background ease, 0.2s color ease;padding: 20px 40px;border:2px solid ' + colors[0] + ';margin-top:30px;color:' + colors[6] + ';border-radius:12px;}.stpanel--error--message,.stpanel--status{background:unset;padding:1rem 4rem;font-size:15px;}#content{box-shadow:none;}#content-wrapper:has(.stpanel--status){margin-top:110px;}.mod-paperclip{position:absolute;height:18px;width:18px;background:' + colors[7] + ';border-radius:50%;margin-left:18px;margin-top:-5px;}#detail-panel:has(.activityDetail){padding-top:' + ((layout == 2 || layout == 3) ? 'calc(20px / ' + (zoom / 100).toString() + ')' : 'calc(100px / ' + (zoom / 100).toString() + ')') + ';}.invoerVeld.textinhoud .ui-resizable-handle { display: none !important; }.m-element h2.centered{padding-top:9px;}.section.NewMessageDetail{padding-right:10px;}ul.feedbackPanel,.feedbackPanel:has(.feedbackPanelERROR){margin:0 0 10px 0 !important;padding:10px 15px;background:' + (get("bools").charAt(0) == "1" ? '#66000f' : '#eed3d7') + ' !important;}ul.feedbackPanel li{padding:0;background:unset !important;color:' + colors[11] + '!important}.m-element,div.m-wrapperTable table tr td{border:none;}.icon-md.icon-info-sign{cursor:pointer;}.r-content.bericht.expand.reply .pasfoto{right:0;}div.date{position:relative;display:block;height:70px;}div.huiswerk{max-width:calc(100% - 150px);margin-bottom:0;position:relative;margin-left:48px;}.sub.homework,.sub.homework .deadline,div.huiswerk,.sub span,.yellow.ribbon span,.yellow.ribbon a,.dayTitle.truncate span,.hour.pauze,.weekitems .weekitemLabel,.roster-table-header .geen-items{color:' + colors[9] + ';}.sub a span,.box a,.box u:has(a),.box a *{text-decoration-color:#39f !important;color:#39f !important;}.m-element{padding:20px 25px;border-bottom:0;min-height:40px;}.m-element:hover,.m-wrapper.active .m-element{background:linear-gradient(90deg,' + colors[4] + ' 0%,' + colors[3] + ' 25%,' + colors[3] + ' 70%,rgba(0,0,0,0) 100%) !important;}div.date div{left:65px;top:25px;}#master-panel .date div p.date-day,#master-panel .date div p.date-month,#master-panel .date div,#master-panel .date div p.date-day,#master-panel .date div p.date-month,#master-panel .date span{text-align:left;padding:15px 0;height:fit-content;background:none !important;border:none !important; color:' + colors[6] + ' !important;width:fit-content;display:inline-block;font-size:16px;padding-right:4px;text-transform:lowercase;}.date-day{background:transparent !important;}.huiswerk .onderwerp,.homework-detail-header{color:' + colors[10] + ';}.active .huiswerk .onderwerp,#master-panel h2,.blue.ribbon p,.blue.ribbon .icon-check,.blue.ribbon .icon-check-empty{color:' + colors[6] + ' !important;}</style>');
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
                id("congrats-continue").addEventListener("click", function () {
                    id("confetti-canvas").style.opacity = '0';
                    id("verjaardag").style.opacity = '0';
                    setTimeout(function () {
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
                (function () {
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
                        window.requestAnimFrame = (function () {
                            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
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
                            window.addEventListener("resize", function () {
                                canvas.width = window.innerWidth;
                                canvas.height = window.innerHeight;
                            }, { passive: true });
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
            case 'user':
                viewbox = '0 0 448 512';
                svg = 'M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z';
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
        setTimeout(function () {
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
            id(idstring).addEventListener("mouseenter", function () {
                for (const element of cn('mod-tooltip-active')) {
                    element.classList.remove('mod-tooltip-active');
                    element.classList.add('mod-tooltip');
                    setTimeout(function () { tryRemove(element) }, 300);
                }
                if (!n(id('for' + idstring))) {
                    tryRemove(id('for' + idstring));
                }
                id("somtoday-mod").insertAdjacentHTML('beforeend', '<div class="mod-tooltip" id="for' + idstring + '" data-forelement="' + idstring + '" style="left:' + (id(idstring).getBoundingClientRect().right - 30) + 'px;top:' + (id(idstring).getBoundingClientRect().bottom + window.scrollY - 9) + 'px;">' + text + '</div>');
                setTimeout(function () { if (!n(id('for' + idstring))) { id('for' + idstring).classList.add('mod-tooltip-active'); id('for' + idstring).classList.remove('mod-tooltip'); } }, 10);
            });
            id(idstring).addEventListener("mouseleave", function () {
                for (const element of cn('mod-tooltip-active')) {
                    if (element.dataset.forelement == idstring) {
                        element.classList.remove('mod-tooltip-active');
                        element.classList.add('mod-tooltip');
                        setTimeout(function () { tryRemove(element) }, 300);
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
                id('mod-message-action1').addEventListener("click", function () {
                    if (id('dont-show-again').checked) {
                        set('bools', get('bools').replaceAt(13, "1"));
                    }
                    set('bools', get('bools').replaceAt(12, "0"));
                    id('mod-message').classList.remove('mod-msg-open');
                    setTimeout(function () { tryRemove(id('mod-message')); }, 350);
                });
                id('mod-message-action2').addEventListener("click", function () {
                    if (id('dont-show-again').checked) {
                        set('bools', get('bools').replaceAt(13, "1"));
                    }
                    modMessage('Zeker weten?', 'Ga alleen door als je de instelling Multitab browsing al langere tijd aan hebt staan.', 'Doorgaan', 'Multitab browsing uitzetten', true, false, true);
                    id('mod-message-action1').addEventListener("click", function () {
                        window.location.reload();
                        id('mod-message').classList.remove('mod-msg-open');
                        setTimeout(function () { tryRemove(id('mod-message')); }, 355);
                    });
                    id('mod-message-action2').addEventListener("click", function () {
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
                setTimeout(function () {
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
            cn('close-detailpanel', 0).addEventListener("click", function () {
                if (!n(id('background-image-overlay')) && get('layout') == 1) {
                    id('background-image-overlay').style.height = (Math.max(id('master-panel').clientHeight, id('detail-panel-wrapper').clientHeight) * (get('zoom') / 100)) + 'px';
                }
            });
        }
        if ((get("layout") == 2 || get("layout") == 3) && n(cn("leermiddelenMaster", 0))) {
            if ((id('detail-panel').clientHeight < 50)) {
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
        let date = "ma 01 ---.";
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
                        default: selectedmonth = month + 1; break;
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
                element.addEventListener('click', function () {
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
            cn('close-detailpanel', 0).addEventListener("click", function () {
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
        // Replace docent name with nickname if set
        if (!n(get("nicknames")) && !isOpen("leermiddelenMaster")) {
            let namearray = get("nicknames").split("|");
            let real;
            let nick;
            for (let i = 0; i < (namearray.length / 2); i++) {
                real = namearray[i * 2];
                nick = namearray[i * 2 + 1];
                //console.log(real + ', ' + nick + ', ' + i);
                if (real != "") {
                    let regex = new RegExp("((<span>)(.*?))" + real.replace(/\\/g, '\\\\') + "((.*?)(<\/span>)+?)", "g");
                    nick = "$1" + nick + "$4";
                    // Replace at message list in master panel
                    for (const element of cn("r_content sub")) {
                        if (!element.classList.contains('mod-nickname')) {
                            if (!n(element.children[1]) && !n(element.children[1].children[1])) {
                                element.children[1].parentElement.append(document.createRange().createContextualFragment('<span>' + element.children[1].innerHTML.replace(regex, nick) + '</span>'));
                                tryRemove(element.children[1]);
                            }
                            if (!n(element.children[2]) && !n(element.children[2].children[1])) {
                                element.children[2].parentElement.append(document.createRange().createContextualFragment('<span>' + element.children[2].innerHTML.replace(regex, nick) + '</span>'));
                                tryRemove(element.children[2]);
                            }
                        }
                    }
                    for (const element of cn("r-content")) {
                        if (!element.classList.contains('mod-nickname') && !element.classList.contains('bericht') && (n(element.children[0]) || !element.children[0].classList.contains('grade'))) {
                            // Replace at subjects page in master panel
                            if ((!n(element.children[0])) && element.children[0].tagName == "SPAN") {
                                element.prepend(document.createRange().createContextualFragment(("<span>" + element.children[0].innerHTML + "</span>").replace(regex, nick)));
                                tryRemove(element.children[1]);
                            }
                            // Replace in detail panel (at message and subjects page)
                            if (!n(element.getElementsByClassName('sub')[0])) {
                                element.append(document.createRange().createContextualFragment(("<div class='sub'>" + element.getElementsByClassName('sub')[0].innerHTML + "</div>").replace(regex, nick)));
                                tryRemove(element.getElementsByClassName('sub')[0]);
                            }
                        }
                    }
                    // Replace at mentor field on profile page
                    for (const element of cn("twopartfields")) {
                        if (!element.classList.contains('mod-nickname')) {
                            if ((!n(element.children[0])) && element.children[0].tagName == "SPAN") {
                                element.prepend(document.createRange().createContextualFragment(("<span>" + element.children[0].innerHTML + "</span>").replace(regex, nick)));
                                tryRemove(element.children[1]);
                            }
                        }
                    }
                    // Replace at message conversation in detail panel
                    for (const element of cn("conversation-afzender")) {
                        if (!element.classList.contains('mod-nickname')) {
                            const name = element.innerHTML;
                            element.innerHTML = "";
                            element.prepend(document.createRange().createContextualFragment(("<span>" + name + "</span>").replace(regex, nick)));
                        }
                    }
                }
            }
            // Add classname to prevent same element from being affected twice
            for (const element of cn("r_content sub")) {element.classList.add('mod-nickname');}
            for (const element of cn("r-content")) {element.classList.add('mod-nickname');}
            for (const element of cn("twopartfields")) {element.classList.add('mod-nickname');}
            for (const element of cn("conversation-afzender")) {element.classList.add('mod-nickname');}
        }
        // Replace real name of user with nickname if set
        if (!n(get('username'))) {
            for (const element of cn("sub")) {
                if ((!n(element.children[0])) && !n(element.children[0].children[1])) {
                    setHTML(element.children[0].children[1], element.children[0].children[1].innerHTML.replace(realname, get('username').replace(/</g, '&lt;').replace(/>/g, '&gt;')));
                }
                if (!n(element.getElementsByTagName('label')[0])) {
                    setHTML(element.getElementsByTagName('label')[0], element.getElementsByTagName('label')[0].innerHTML.replace(realname, get('username').replace(/</g, '&lt;').replace(/>/g, '&gt;')));
                }
            }
            for (const element of cn("r-content bericht expand reply")) {
                if (!n(element.getElementsByClassName('conversation-afzender')[0])) {
                    setHTML(element.getElementsByClassName('conversation-afzender')[0], get('username').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                }
            }
        }
    }

    // Change profile pictures
    function profilePicture() {
        for (const element of cn("pasfoto")) {
            if (!n(element.src)) {
                // Default profile picture is shown (user has no profile picture)
                if ((element.src.indexOf('pasfoto_geen.jpg') != -1 || element.src.indexOf('defaultpasfoto.jpg') != -1) && element.src.replace(new RegExp("(.+)(&antiCache.+)", "g"), "$1") != profilepic) {
                    const newelement = document.createElement("div");
                    newelement.classList.add("pasfoto");
                    setHTML(newelement, getIcon("circle-user", null, colors[7]));
                    element.replaceWith(newelement);
                }
                // User has profile picture, change it to initials or custom profile picture if enabled in settings
                if (!n(get("profilepic")) || get("bools").charAt(2) == "0") {
                    if (element.src.replace(new RegExp("(.+)(&antiCache.+)", "g"), "$1") == profilepic) {
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
            const iframeHeight = setInterval(function () {
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
                            if (!n(id('mod-day-' + day))) {
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
            cn("createLink", 0).addEventListener("click", function () {
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
            setTimeout(function () {
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
                        id('mod-message-action1').addEventListener("click", function () { window.location.reload(); });
                    }
                }
                else {
                    set(element.id, element.value);
                }
            } else if (element.type == "file") {
                if (element.files.length != 0) {
                    // Compress files to desired size in pixels using canvas
                    let size = element.dataset.size;
                    if (!n(size) && (element.files[0].type == "image/png" || element.files[0].type == "image/jpeg" || element.files[0].type == "image/webp")) {
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
                                reader.onload = function () {
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
                        reader.onload = function () {
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
                toDataURL(selectedtheme.dataset.url, function (dataUrl) {
                    set("background", dataUrl);
                    filesProcessed++;
                });
            }
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
                toDataURL('https://picsum.photos/1600/800', function (dataUrl) {
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
        if (isOpen("profileMaster")) {
            cn("profileMaster", 0).insertAdjacentHTML('beforeend', '<div id="modsettings">' + form + '</div>');
            if (n(id('modactions'))) {
                id('somtoday-mod').insertAdjacentHTML('beforeend', buttons);
            }
            // Add open profilesettings button and open the modsettings
            if (!n(cn("yellow ribbon", 0))) {
                setHTML(cn("yellow ribbon", 0), "<a class='menuitem'>" + getIcon("user", null, colors[6]) + "Ga naar profielinstellingen</a>");
                cn("yellow ribbon", 0).addEventListener("click", function () {
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
                setTimeout(function () { window.scrollTo(0, get('settingscroll')) }, 50);
            }
            else {
                set('settingscroll', window.scrollY);
            }
        }
        else {
            tn("body", 0).insertAdjacentHTML('beforeend', '<div id="modsettings" class="mod-setting-popup"><div id="modsettings-inner">' + form + '</div><a id="close-modsettings">&times;</a></div>');
            tn('html', 0).style.position = 'fixed';
            tn('html', 0).style.width = '100%';
            if (n(id('modactions'))) {
                id('modsettings-inner').insertAdjacentHTML('afterbegin', buttons);
            }
            id('close-modsettings').addEventListener('click', function () { tryRemove(id('modsettings')); tryRemove(id('modsettingsfontscript')); tn('html', 0).style.position = 'relative'; })
        }
        // Add script to make the font select element work
        if (!n(id('modsettingsfontscript'))) {
            tryRemove(id('modsettingsfontscript'));
        }
        id('somtoday-mod').insertAdjacentHTML('beforeend', '<style id="modsettingsfontscript" onload=\'let x, i, j, l, ll, selElmnt, a, b, c; x = document.getElementsByClassName("custom-select-mod"); l = x.length; for (i = 0; i < l; i++) { selElmnt = x[i].getElementsByTagName("select")[0]; ll = selElmnt.length; a = document.createElement("DIV"); a.setAttribute("class", "select-selected"); a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML; x[i].appendChild(a); b = document.createElement("DIV"); b.setAttribute("class", "select-items select-hide"); for (j = 1; j < ll; j++) { c = document.createElement("DIV"); c.innerHTML = selElmnt.options[j].innerHTML; c.style.fontFamily = "\\"" + selElmnt.options[j].innerHTML + "\\", sans-serif"; c.addEventListener("click", function(e) { let y, i, k, s, h, sl, yl; s = this.parentNode.parentNode.getElementsByTagName("select")[0]; sl = s.length; h = this.parentNode.previousSibling; for (i = 0; i < sl; i++) { if (this.style.fontFamily.indexOf(s.options[i].innerHTML) != -1) { s.selectedIndex = i; h.innerHTML = this.innerHTML; y = this.parentNode.getElementsByClassName("same-as-selected"); yl = y.length; for (k = 0; k < yl; k++) { y[k].removeAttribute("class"); } this.setAttribute("class", "same-as-selected"); break; } } h.click(); document.getElementById("font-box").children[0].style.fontFamily = document.getElementById("font-box").children[1].style.fontFamily = document.getElementsByClassName("select-selected")[0].style.fontFamily = "\\"" + document.getElementById("font").value + "\\", sans-serif"; }); b.appendChild(c); } x[i].appendChild(b); a.addEventListener("click", function(e) { e.stopPropagation(); closeAllSelect(this); this.nextSibling.classList.toggle("select-hide"); this.classList.toggle("select-arrow-active"); }); } function closeAllSelect(elmnt) { let x, y, i, xl, yl, arrNo = []; x = document.getElementsByClassName("select-items"); y = document.getElementsByClassName("select-selected"); xl = x.length; yl = y.length; for (i = 0; i < yl; i++) { if (elmnt == y[i]) { arrNo.push(i) } else { y[i].classList.remove("select-arrow-active"); } } for (i = 0; i < xl; i++) { if (arrNo.indexOf(i)) { x[i].classList.add("select-hide"); } } } document.addEventListener("click", closeAllSelect, {passive: true});\'></style>');
        // Add event listeners to make layout boxes work
        for (const element of cn("layout-container")) {
            element.addEventListener("click", function () {
                for (const element of cn("layout-selected")) {
                    element.classList.remove("layout-selected");
                }
                element.classList.add("layout-selected");
            });
        }
        // Add event listeners to make file reset buttons work
        for (const element of cn("mod-file-reset")) {
            element.addEventListener("click", function () {
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
        id("zoom").addEventListener("input", function () {
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
        id("save").addEventListener("click", function () { execute([save]) });
        id("reset").addEventListener("click", function () {
            modMessage('Alles resetten?', 'Al je instellingen zullen worden gereset. Weet je zeker dat je door wil gaan?', 'Ja', 'Nee');
            id('mod-message-action1').addEventListener("click", function () { reset(); window.location.reload(); });
            id('mod-message-action2').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 350); });
        });
        id("information-about-mod").addEventListener("click", function () {
            modMessage('Informatie', '</p><h3>Over</h3><p>Somtoday Mod is een gratis ' + (platform == 'Userscript' ? 'userscript dat' : 'browserextensie die') + ' de website van Somtoday aanpast. Het verbetert het uiterlijk van Somtoday en voegt opties zoals een dark mode, lettertypes, kleuren, achtergronden, layout en meer toe. Somtoday Mod is niet geaffilieerd met Somtoday/Topicus.</p><br><h3>Versieinformatie</h3><p>Somtoday Mod ' + platform + ' v' + version + ' met Somtoday ' + somtodayversion + '</p><br><h3>Privacybeleid & Source code</h3><p>Het privacybeleid is <a href="https://jonazwetsloot.nl/somtoday-mod-privacy-policy" target="_blank">hier</a> te vinden. Source code is <a href="https://jonazwetsloot.nl/versions/somtoday-mod" target="_blank">hier</a> te vinden.</p><br><h3>Copyright</h3><p>&copy; 2023 - 2024 Jona Zwetsloot, gelicentieerd onder <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a>.</p>', 'Meer informatie', 'Terug');
            id('mod-message-action1').addEventListener("click", function () { window.open('https://jonazwetsloot.nl/projecten/somtoday-mod', '_blank'); });
            id('mod-message-action2').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 350); });
        });
        id("report-bug").addEventListener("click", function () { execute([prepareBugReport]) });
        id("feedback").addEventListener("click", function () { execute([feedback]) });
        if (platform == "Userscript") {
            id("versionchecker").addEventListener("click", function () { execute([checkUpdate]) });
        }
        // Make random background button work
        // Random background images thanks to Lorem Picsum: https://picsum.photos
        id("randombackground").addEventListener("click", function () {
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
        id(name).addEventListener("click", function () {
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
        xhr.onload = function () {
            let reader = new FileReader();
            reader.onloadend = function () {
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
        fetch("https://jonazwetsloot.nl/somtoday-mod-update-checker?v=" + version).then(function (response) {
            if (response.ok) {
                return response.text();
            }
            return Promise.reject(response);
        }).then(text => {
            if (text == "Newest") {
                modMessage('Geen updates gevonden', 'Helaas, er zijn geen updates gevonden.', 'Oke');
                id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
            } else if (text == "Optional") {
                modMessage('Kleine update gevonden', 'Er is een kleine update gevonden. Wil je de update installeren?', 'Ja', 'Nee');
                id('mod-message-action1').addEventListener("click", function () { window.open('https://jonazwetsloot.nl/userscripts/SomtodayMod' + (minified ? '' : 'Unminified') + '.user.js'); });
                id('mod-message-action2').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
            } else if (text == "Update") {
                modMessage('Update gevonden', 'Er is een update gevonden. Wil je de update installeren?', 'Ja', 'Nee');
                id('mod-message-action1').addEventListener("click", function () { window.open('https://jonazwetsloot.nl/userscripts/SomtodayMod' + (minified ? '' : 'Unminified') + '.user.js'); });
                id('mod-message-action2').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
            }
            else {
                modMessage('Fout', 'Somtoday Mod kan de reactie van de server niet begrijpen.', 'Oke');
                id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
            }
        }).catch((response) => {
            modMessage('Fout', 'Er kon niet op updates worden gechecked. Het kan zijn dat de server van Somtoday Mod down is of dat je wifi uitstaat.', 'Oke');
            id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305); });
        });
    }

    // Sends a feedback message (user initiated)
    function feedback() {
        modMessage('Feedback geven', 'Heb je suggesties voor verbeteringen of een heel goed idee voor Somtoday Mod? Dan kan je hier feedback geven.</p><textarea placeholder="Schrijf hier je feedback." id="feedbackmsg"></textarea><p>', 'Verstuur', 'Terug');
        id('mod-message-action1').addEventListener("click", function () {
            hide(id('mod-message-action1'));
            hide(id('mod-message-action2'));
            if (n(id('feedbackmsg').value)) {
                id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')) }, 305);
                setTimeout(function () {
                    modMessage('Fout', 'Voer een tekst in.', 'Oke');
                    id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); if (!n(id('feedback'))) { id("feedback").click(); } }, 305); });
                }, 310);
            }
            else {
                let formData = new FormData();
                formData.append('message', id('feedbackmsg').value);
                fetch("https://jonazwetsloot.nl/somtoday-mod-feedback", { method: 'POST', body: formData }).then(function (response) {
                    if (response.ok) {
                        return response.text();
                    }
                    return Promise.reject(response);
                }).then(text => {
                    id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
                    if (text == "Sent") {
                        setTimeout(function () {
                            modMessage('Verstuurd!', 'Je feedback is verstuurd.', 'Oke');
                            id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                        }, 310);
                    } else {
                        setTimeout(function () {
                            modMessage('Fout', 'De server kon je feedback niet verwerken.', 'Oke');
                            id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                        }, 310);
                    }
                }).catch((response) => {
                    id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
                    setTimeout(function () {
                        modMessage('Fout', 'Je feedback kon niet worden verstuurd. Het kan zijn dat de server van Somtoday Mod down is of dat je wifi uitstaat.', 'Oke');
                        id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                        id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                    }, 310);
                });
            }
        });
        id('mod-message-action2').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
    }

    // Show message and prepare bug report server request (user initiated)
    function prepareBugReport() {
        modMessage('Bug melden', 'Heb je een bug ontdekt? Dan kan je die hier melden. Alle bugs zijn openbaar te bekijken <a href="https://jonazwetsloot.nl/bugs/somtoday-mod" target="_blank">op deze pagina</a>.</p><input type="text" placeholder="Korte beschrijving van bug" id="shortdescription"><textarea placeholder="Uitgebreidere beschrijving van bug" id="longdescription"></textarea><p style="margin-top: 20px; margin-bottom: -5px;">Screenshot (optioneel)</p><div><label style="margin-top: 15px;" class="mod-file-label" for="bug-screenshot">' + getIcon('upload', null, colors[7]) + '<p style="display: inline;">Kies een bestand</p></label><input oninput="this.parentElement.getElementsByTagName(\'label\')[0].classList.remove(\'mod-active\'); if (this.files.length != 0) { const name = this.files[0].name.toLowerCase(); if (this.files[0][\'type\'].indexOf(\'image\') != -1) { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = name; this.parentElement.getElementsByTagName(\'label\')[0].classList.add(\'mod-active\'); } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; this.value = null; } } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; }" class="mod-file-input" type="file" accept="image/*" id="bug-screenshot"/></div><p>', 'Verstuur', 'Terug');
        id('mod-message-action1').addEventListener("click", function () {
            hide(id('mod-message-action1'));
            hide(id('mod-message-action2'));
            if (n(id('shortdescription').value) || n(id('longdescription').value)) {
                id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
                setTimeout(function () {
                    modMessage('Fout', 'Voer ten minste beide tekstvelden in.', 'Oke');
                    id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); if (!n(id('report-bug'))) { id("report-bug").click(); } }, 305); });
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
                    reader.onload = function () {
                        formData.append('screenshot', reader.result);
                        sendBugReport(formData);
                    };
                }
                else {
                    sendBugReport(formData);
                }
            }
        });
        id('mod-message-action2').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
    }

    // Submits a bug report (user initiated)
    function sendBugReport(formData) {
        fetch("https://jonazwetsloot.nl/somtoday-mod-error", { method: 'POST', body: formData }).then(function (response) {
            if (response.ok) {
                return response.text();
            }
            return Promise.reject(response);
        }).then(text => {
            id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
            if (text == "Success") {
                setTimeout(function () {
                    modMessage('Verstuurd!', 'Je bugreport is verstuurd.', 'Oke');
                    id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                }, 310);
            } else {
                setTimeout(function () {
                    modMessage('Fout', 'De server kon de request niet verwerken.', 'Oke');
                    id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                }, 310);
            }
        }).catch((response) => {
            id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305);
            setTimeout(function () {
                modMessage('Fout', 'Je bugreport kon niet worden verstuurd. Het kan zijn dat de server van Somtoday Mod down is of dat je wifi uitstaat.', 'Oke');
                id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
                id('mod-message-action1').addEventListener("click", function () { id('mod-message').classList.remove('mod-msg-open'); setTimeout(function () { tryRemove(id('mod-message')); }, 305); });
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
            id('continuetosom').addEventListener("click", function () {
                id('welcome').style.opacity = '0';
                tn("html", 0).style.overflowY = "scroll";
                if (id("errordata").checked) {
                    // Permission for sending debug-data
                    set("bools", get("bools").replaceAt(5, "1"));
                }
                setTimeout(function () {
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
    setTimeout(function () {
        execute([pageUpdate]);
    }, 50);

    // Allow transitions after 0.5s
    setTimeout(function () {
        tryRemove(id('transitions-disabled'));
    }, 400);

    // Save the scroll position on the setting page
    window.addEventListener("scroll", function () {
        if (!n(cn('profileMaster', 0))) {
            setTimeout(function () { set('settingscroll', window.scrollY); }, 150);
        }
        else {
            setTimeout(function () { set('settingscroll', 0); }, 150);
        }
    }, { passive: true });

    // Add resize event listener to change some heights dynamically
    if (get('layout') == 1) {
        window.addEventListener("resize", function () {
            if (!n(id('master-panel')) && !n(id('detail-panel-wrapper'))) {
                if (!n(id('background-image-overlay'))) {
                    id('background-image-overlay').style.height = (Math.max(id('master-panel').clientHeight, id('detail-panel-wrapper').clientHeight) * (get('zoom') / 100)) + 'px';
                }
                if (!n(id('calendar'))) {
                    id('calendar').style.height = (id('master-panel').clientHeight + (80 / (get('zoom') / 100))) + 'px';
                }
            }
        }, { passive: true });
    }
    if (get('layout') == 2 || get('layout') == 3) {
        window.addEventListener("resize", function () {
            if (!n(id('calendar'))) {
                id('detail-panel-wrapper').style.height = id('calendar').style.height;
            }
        }, { passive: true });
    }

    var target;
    window.addEventListener('click', function (e) {
        // Remove all active tooltips on click
        for (const element of cn('mod-tooltip-active')) {
            element.classList.remove('mod-tooltip-active');
            element.classList.add('mod-tooltip');
            setTimeout(function () { tryRemove(element) }, 300);
        }
        // Get last clicked element (used to get last clicked link in autoreload function)
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
    }, { passive: true });

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