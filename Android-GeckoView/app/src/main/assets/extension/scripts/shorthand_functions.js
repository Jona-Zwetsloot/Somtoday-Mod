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