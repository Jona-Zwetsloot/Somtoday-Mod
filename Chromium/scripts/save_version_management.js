// VERSION & SAVE MANAGEMENT
// This script is used to save data for both the Tampermonkey and the Extension version. Also contains localStorage as fallback.
// If you see warning signs and you want to remove them, copy the get and set for the version you are using and place them outside the if statement

let version_json = {};

function loadJson() {
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', chrome.runtime.getURL('version_info.json'), false);
        xhr.send();
        if (xhr.status === 200) {
            version_json = JSON.parse(xhr.responseText);
            getFromJson.data = version_json;
        } else {
            version_json = {};
            getFromJson.data = {};
        }
    } catch (err) {
        console.error('Somtoday Mod ERROR: Could not load version_info.json', err);
        version_json = {};
        getFromJson.data = {};
    }
}

function getFromJson(key) {
    if (!getFromJson.data) loadJson();

    const value = getFromJson.data[key];
    if (value == null) return '';

    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    return value;
}

loadJson();

const version = getFromJson('version');
const platform = getFromJson('platform');
const minified = getFromJson('minified');
const version_name = getFromJson('version_name');

let data;
const hasSettingsHash = window.location.hash == '#mod-settings';
// Check if userscriptmanager allows storage access
if (typeof GM_getValue === 'function' && typeof GM_setValue === 'function') {
    function get(e) {
        return GM_getValue(e, null);
    }
    function set(e, t) {
        return GM_setValue(e, t);
    }
    if (platform != 'Userscript') {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Userscript storage is used while the platform is not set to Userscript.'));
    }
}
// Check if extension allows storage access
else if (((typeof chrome !== 'undefined') && chrome.storage) && chrome.storage.local) {
    chrome.storage.local.get(null).then((result) => {
        data = result;
    });
    chrome.storage.onChanged.addListener((changes) => {
        if (changes['enabled'] != null) {
            window.location.reload();
        }
    });
    
    function get(e) {
        if (data == null) {
            return '';
        }
        if (data[e] == null) {
            return '';
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
            setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Couldn\'t save value. Somtoday Mod is probably updating right now.\nError: ' + e));
        }
        data[e] = t;
    }
    if (platform == 'Userscript') {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Extension storage is used while the platform is set to Userscript.'));
    }
}
// Fallback to local storage
else if (window.localStorage) {
    let messageShown = false;
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
    setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Could not find extension or userscript storage. Falling back to localstorage.'));
}
else {
    throw new Error('Somtoday Mod ERROR\nCould not find any place to store setting data.\nConsider updating your browser, or giving Somtoday Mod storage access.');
}
// Remember to open settings if settings hash is present
if (hasSettingsHash) {
    set('opensettingsIntention', '1');
}