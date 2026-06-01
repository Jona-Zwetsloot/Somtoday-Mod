// SHORTHAND FUNCTIONS

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
    if (object == '' || object == null) {
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
let somtodayversion;
let rateLimitDate;
function execute(functionarray) {
    for (const element of functionarray) {
        try {
            element();
        } catch (e) {
            // Report bug if user has given permission (when error happens)
            // Rate limit: 1 debug data request per 60 seconds
            // This is to prevent flooding the log
            if (rateLimitDate != null && (Date.now() - rateLimitDate) / 1000 < 60) {
                return;
            }
            rateLimitDate = Date.now();
            if (get('bools') == null || (window.location.origin.indexOf('leerling') != -1 && get('bools').charAt(BOOL_INDEX.SHARE_DEBUG_DATA) == '1')) {
                fetch('https://jonazwetsloot.nl/reporterror?product=Somtoday%20Mod%20' + platform + '&function=' + encodeURIComponent(element.name) + '&cause=' + encodeURIComponent(e.toString()) + '&page=' + encodeURIComponent(window.location.href.split('/').pop().split('?')[0]) + '&version=' + somtodayversion + '&productversion=' + version + '&settings=' + get('bools'));
            }
            setTimeout(console.error.bind(console, e));
        }
    }
}

// string.substring(0, index) + replacement + string.substring(index + replacement.length) --> string.replaceAt(index, replacement)
String.prototype.replaceAt = function (index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
};

function sanitizeString(str) {
    if (str == null) {
        return '';
    }
    return str.replaceAll('&', '&amp;').replaceAll('>', '&gt;').replaceAll('<', '&lt;').replaceAll('"', '&quot;').replaceAll('\'', '&#x27;');
}

function waitForElement(selector, timeout = 30000) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
}

const BOOL_INDEX = {
    MENU_ALWAYS_SHOW: 0,
    MENU_PAGE_NAME: 1,
    HIDE_MESSAGE_COUNT: 2,
    ROSTER_SIMPLIFY: 3,
    SHARE_DEBUG_DATA: 4,
    GRADE_DOWNLOAD_BTN: 5,
    CONGRATULATIONS: 6,
    SUBJECT_GRAPHS: 7,
    MOD_LOGO: 8,
    REDIRECT_ELO: 9,
    CALCULATION_TOOL: 10,
    SCROLLBAR: 11,
    RECAP: 12,
    TEXT_SELECTION: 13,
    GRADE_REVEAL: 14,
    ROSTER_GRID: 15,
    CUSTOM_HOMEWORK: 16,
    EVENTS: 17,
    GRADE_ANALYSIS: 18,
};

// Get modlogo SVG
window.logo = function (id, classname, color, style) {
    return '<svg xmlns="http://www.w3.org/2000/svg"' + (n(id) ? '' : ' id="' + id + '"') + (n(classname) ? '' : ' class="' + classname + '"') + (n(style) ? '' : ' style="' + style + '"') + ' viewBox="0 0 190.5 207" width="190.5" height="207"><g transform="translate(-144.8 -76.5)"><g><path d="M261 107.8v.3c0 3.7 3 6.7 6.6 6.7H299a6.8 6.8 0 0 1 6.7 7V143.2c0 3.7 3 6.7 6.7 6.7h16.1a6.8 6.8 0 0 1 6.7 7V201.6c0 3.7-3 6.6-6.7 6.7h-16.1a6.8 6.8 0 0 0-6.7 7v23.1c0 3.7-3 6.7-6.7 6.7h-10.5a6.8 6.8 0 0 0-6.7 7l-.1 24.4v.3c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.7-7v-24.6c0-3.8-2.8-6.9-6.3-6.9s-6.4 3.1-6.4 7v24.8c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.6-7l.1-24.4v-.3c0-3.7-3-6.7-6.6-6.7h-10.5a6.8 6.8 0 0 1-6.7-7V215c0-3.6-3-6.6-6.7-6.7h-15.8a6.8 6.8 0 0 1-6.7-7V156.6c0-3.7 3-6.7 6.7-6.7h15.8a6.8 6.8 0 0 0 6.7-7v-21.4c0-3.6 3-6.6 6.7-6.7h31a6.8 6.8 0 0 0 6.7-7l.1-24.3v-.3c0-3.6 3-6.6 6.7-6.7h29a6.8 6.8 0 0 1 6.8 7z" fill="' + color + '" /><path d="M289.8 179.2c1.3 0 2.9.3 4.6.9 2.2.7 4 1.7 5 2.7v.2c.8.6 1.3 1.5 1.4 2.6 0 .9-.2 1.7-.6 2.3l-6.8 10.8a60.2 60.2 0 0 1-27.5 19.8c-8.5 3.2-17 4.7-24.7 4.5l-13.2-.1a1.6 1.6 0 0 1-1.7-1.5v-3.3a1.6 1.6 0 0 1 1.7-1.5h.1c7.9.3 16.3-1 24.7-4.2a56 56 0 0 0 34.3-31.4v-.3c.5-1 1.4-1.5 2.3-1.5z" fill="#000000" stroke="none" /><g class="glasses"><path d="M171.4 150.8v-9h137.2v9z" fill="#000000" stroke="none" /><path d="M175.7 155.5v-6h57.5v6z" fill="#000000" stroke="none" /><path d="M179.8 160v-9h48.9v9z" fill="#000000" stroke="none" /><path d="M184 164.5v-9h44.7v9z" fill="#000000" stroke="none" /><path d="M188.6 168.6v-7h31.7v7z" fill="#000000" stroke="none" /><path d="M245.9 155.5v-6h57.4v6z" fill="#000000" stroke="none" /><path d="M250 160v-9h48.8v9z" fill="#000000" stroke="none" /><path d="M254 164.5v-9h41v9z" fill="#000000" stroke="none" /><path d="M258.8 168.6v-7h31.6v7z" fill="#000000" stroke="none" /><path d="M184.5 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M188.8 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M193.3 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M193.3 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M197.6 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M202.1 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M254.8 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M259.1 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M263.6 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M263.6 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M268 159.2V155h4.4v4.3z" fill="#ffffff" stroke="none" /><path d="M272.4 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /></g></g></g></svg>';
};

// Get image or font file URI
window.getResource = function (file) {
    // Browser extension uses extension storage to load files, while the userscript
    // and Android version contain an inlined switch statement with base64 URIs

    let fileMap = null;
    // [GENERATION] DEFINE_FILEMAP

    // Browser extension uses extension storage to load files
    if (fileMap == null) {
        return chrome.runtime.getURL(file);
    }
    // The userscript and Android version contain a JSON fileMap, eg { "image/example.png": "data:image/png;base64,..." }
    else {
        return fileMap[file];
    }
}

// Get file contents as text
window.getResourceAsTextCache = {};
window.getResourceAsText = function (file) {
    if (window.getResourceAsTextCache[file] == null) {
        const resource = window.getResource(file);
        // Base64 URI
        if (resource.startsWith('data:')) {
            const base64 = resource.split(',')[1];
            window.getResourceAsTextCache[file] = decodeURIComponent(escape(window.atob(base64)));
        }
        // File URL
        else {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', resource, false);
            xhr.send();
            window.getResourceAsTextCache[file] = xhr.responseText ?? null;
        }
    }
    return window.getResourceAsTextCache[file];
}

// Get file contents as base64 URI
window.getResourceAsBase64 = async function (file) {
    const resource = window.getResource(file);
    // Base64 URI
    if (resource.startsWith('data:')) {
        return resource;
    }
    // File URL
    else {
        // Convert stored font file to base64 data URI
        const response = await fetch(resource);
        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}

// Get audio resource URI
window.getAudioUrl = function (file) {
    // Browser extension ships with audio, userscript and Android use external hosted audio
    // Audio is too heavy to include as base64 URI
    if (isExtension) {
        return chrome.runtime.getURL('sounds/' + file + '.opus');
    }
    else {
        return 'https://geweldige-geluidseffecten.netlify.app/' + file + '.opus';
    }
}
