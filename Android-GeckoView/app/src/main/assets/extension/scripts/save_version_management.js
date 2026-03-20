// VERSION & SAVE MANAGEMENT
// This script is used to save data for both the Tampermonkey and the Extension version. Also contains localStorage as fallback.
// If you see warning signs and you want to remove them, copy the get and set for the version you are using and place them outside the if statement

// [GENERATION] START_IGNORE
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
    if (value == null) {
        return '';
    }

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
const contributors = getFromJson('contributors');
// [GENERATION] END_IGNORE

let data;
const isExtension = platform != 'Userscript' && platform != 'Android';
const hasSettingsHash = window.location.hash == '#mod-settings';
let storageMethod;
// Check if userscriptmanager allows storage access
if (typeof GM_getValue === 'function' && typeof GM_setValue === 'function') {
    storageMethod = 'userscript';
    function get(key) {
        return GM_getValue(key, null);
    }
    function set(key, value) {
        return GM_setValue(key, value);
    }
    if (platform != 'Userscript') {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Userscript storage is used while the platform is not set to Userscript.'));
    }
}
// Check if extension allows storage access
else if (((typeof chrome !== 'undefined') && chrome.storage) && chrome.storage.local) {
    storageMethod = 'extension';
    chrome.storage.local.get(null).then((result) => {
        data = result;
    });
    chrome.storage.onChanged.addListener((changes) => {
        if (changes['enabled'] != null) {
            window.location.reload();
        }
    });

    function get(key) {
        if (data == null) {
            return '';
        }
        if (data[key] == null) {
            return '';
        }
        return data[key];
    }
    function set(key, value) {
        let prop = key;
        let obj = {};
        obj[prop] = value;
        try {
            chrome.storage.local.set(obj);
        }
        catch (e) {
            setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Couldn\'t save value. Somtoday Mod is probably updating right now.\nError: ' + e));
        }
        data[key] = value;
    }
    if (!isExtension) {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Extension storage is used while the platform is set to ' + platform + '.'));
    }
}
// Check if indexedDB is supported
else if (window?.indexedDB) {
    storageMethod = 'indexedDB';
    const DB_NAME = 'app-storage';
    const STORE_NAME = 'kv';
    const DB_VERSION = 1;

    async function persistStorage() {
        if (!navigator.storage || !navigator.storage.persist) {
            return false;
        }

        const alreadyPersisted = await navigator.storage.persisted();
        if (alreadyPersisted) {
            return true;
        }

        try {
            return await navigator.storage.persist();
        } catch (e) {
            return false;
        }
    }

    async function openDB() {
        const persistent = await persistStorage();
        if (!persistent) {
            setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Storage is not persistent.'));
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function getAllFromStore() {
        data = await realGetAllFromStore();
    }

    async function realGetAllFromStore() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);

            const valuesReq = store.getAll();
            const keysReq = store.getAllKeys();

            tx.oncomplete = () => {
                const map = {};
                keysReq.result.forEach((key, i) => {
                    map[key] = valuesReq.result[i];
                });
                resolve(map);
            };

            tx.onerror = () => reject(tx.error);
        });
    }

    function set(key, value) {
        data[key] = value;
        realSet(key, value);
    }

    async function realSet(key, value) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(value, key);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    }

    function get(key) {
        if (data == null) {
            return '';
        }
        if (data[key] == null) {
            return '';
        }
        return data[key];
    }

    getAllFromStore();
}
// Fallback to local storage
else if (window?.localStorage) {
    storageMethod = 'localStorage';
    let messageShown = false;
    function set(key, value) {
        try {
            localStorage.setItem(key, value);
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