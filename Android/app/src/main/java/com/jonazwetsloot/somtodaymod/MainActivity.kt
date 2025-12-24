package com.jonazwetsloot.somtodaymod

import android.content.Context
import android.content.Intent
import android.content.res.ColorStateList
import android.content.res.Configuration
import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.os.Parcelable
import android.provider.MediaStore
import android.view.View
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import android.widget.RelativeLayout
import androidx.activity.ComponentActivity
import androidx.core.content.ContextCompat
import java.io.File


class MainActivity : ComponentActivity() {
    private val fileChooserResultCode = 1
    private var mUploadMessage: ValueCallback<Uri>? = null
    private var mUploadMessages: ValueCallback<Array<Uri>>? = null
    private var mCapturedImageURI: Uri? = null
    private var myWebView: WebView? = null
    var progressBar : ProgressBar? = null
    var isProgressBarShown : Boolean = false

    override fun onBackPressed() {
        if (myWebView!!.canGoBack()) {
            myWebView!!.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        myWebView = WebView(this)
        super.onCreate(savedInstanceState)
        appContext = applicationContext
        myWebView!!.settings.javaScriptEnabled = true
        myWebView!!.webViewClient = MyWebViewClient()
        myWebView!!.getSettings().setDomStorageEnabled(true)
        myWebView!!.getSettings().setLoadWithOverviewMode(true)
        myWebView!!.getSettings().setAllowFileAccess(true)
        setContentView(myWebView)
        myWebView!!.loadUrl("https://leerling.somtoday.nl/")
        myWebView!!.webChromeClient = object : WebChromeClient() {
            // openFileChooser for Android 3.0+
            fun openFileChooser(uploadMsg: ValueCallback<Uri?>, acceptType: String?) {
                mUploadMessage = uploadMsg as ValueCallback<Uri>
                openImageChooser()
            }


            // For Lollipop 5.0+ Devices
            override fun onShowFileChooser(
                mWebView: WebView?,
                filePathCallback: ValueCallback<Array<Uri?>?>,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                mUploadMessages = filePathCallback as ValueCallback<Array<Uri>>
                openImageChooser()
                return true
            }


            // openFileChooser for Android < 3.0
            fun openFileChooser(uploadMsg: ValueCallback<Uri?>) {
                openFileChooser(uploadMsg, "")
            }


            // openFileChooser for other Android versions
            fun openFileChooser(
                uploadMsg: ValueCallback<Uri?>,
                acceptType: String?,
                capture: String?
            ) {
                openFileChooser(uploadMsg, acceptType)
            }

            private fun openImageChooser() {
                try {
                    val imageStorageDir = File(
                        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES),
                        "FolderName"
                    )
                    if (!imageStorageDir.exists()) {
                        imageStorageDir.mkdirs()
                    }
                    val file = File(
                        imageStorageDir.toString() + File.separator + "IMG_" + System.currentTimeMillis()
                            .toString() + ".jpg"
                    )
                    mCapturedImageURI = Uri.fromFile(file)

                    val captureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                    captureIntent.putExtra(MediaStore.EXTRA_OUTPUT, mCapturedImageURI)

                    val i = Intent(Intent.ACTION_GET_CONTENT)
                    i.addCategory(Intent.CATEGORY_OPENABLE)
                    i.setType("image/*")
                    i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                    val chooserIntent = Intent.createChooser(i, "Kies een bestand")
                    chooserIntent.putExtra(
                        Intent.EXTRA_INITIAL_INTENTS,
                        arrayOf<Parcelable>(captureIntent)
                    )

                    startActivityForResult(chooserIntent, fileChooserResultCode)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }


        }
    }

    public override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == fileChooserResultCode) {
            if (null == mUploadMessage && null == mUploadMessages) {
                return
            }

            if (null != mUploadMessage) {
                handleUploadMessage(requestCode, resultCode, data)
            } else {
                handleUploadMessages(requestCode, resultCode, data)
            }
        }
    }

    private fun handleUploadMessage(requestCode: Int, resultCode: Int, data: Intent?) {
        var result: Uri? = null
        try {
            result = if (resultCode != RESULT_OK) {
                null
            } else {
                // retrieve from the private variable if the intent is null

                if (data == null) mCapturedImageURI else data.data
            }
        } catch (e: java.lang.Exception) {
            e.printStackTrace()
        }
        mUploadMessage!!.onReceiveValue(result)
        mUploadMessage = null
    }

    public override fun onSaveInstanceState(outBundle: Bundle) {
        super.onSaveInstanceState(outBundle)
        myWebView!!.saveState(outBundle)
    }

    public override fun onRestoreInstanceState(savedBundle: Bundle) {
        super.onRestoreInstanceState(savedBundle)
        myWebView!!.restoreState(savedBundle)
    }

    private fun handleUploadMessages(requestCode: Int, resultCode: Int, data: Intent?) {
        var results: Array<Uri?>? = null
        try {
            if (resultCode != RESULT_OK) {
                results = null
            } else {
                if (data != null) {
                    val dataString = data.dataString
                    val clipData = data.clipData
                    if (clipData != null) {
                        results = arrayOfNulls(clipData.itemCount)
                        for (i in 0 until clipData.itemCount) {
                            val item = clipData.getItemAt(i)
                            results[i] = item.uri
                        }
                    }
                    if (dataString != null) {
                        results = arrayOf(Uri.parse(dataString))
                    }
                } else {
                    results = arrayOf(mCapturedImageURI)
                }
            }
        } catch (e: java.lang.Exception) {
            e.printStackTrace()
        }
        mUploadMessages!!.onReceiveValue(results as Array<Uri>)
        mUploadMessages = null
    }

    private inner class MyWebViewClient : WebViewClient() {
        var isPageError: Boolean = false

        override fun onPageFinished(view: WebView, url: String) {
            if (isPageError) {
                if (!isProgressBarShown) {
                    view.visibility = View.GONE
                    val layout = RelativeLayout(appContext)
                    val progressBar =
                        ProgressBar(appContext, null, android.R.attr.progressBarStyleLarge)
                    progressBar.isIndeterminate = true
                    progressBar.visibility = View.VISIBLE
                    progressBar.setProgressTintList(ColorStateList.valueOf(Color.RED))
                    val params = RelativeLayout.LayoutParams(100, 100)
                    params.addRule(RelativeLayout.CENTER_IN_PARENT)
                    layout.addView(progressBar, params)

                    setContentView(layout)
                    isProgressBarShown = true
                }
            }
            else {
                view.visibility = View.VISIBLE
                setContentView(view)
                isProgressBarShown = false
            }
            view.loadUrl("""javascript:(function loadEverything() {
const version = 5.3;
const platform = 'Android';
const minified = false;
const version_name = '5.3-release';
const contributors = {"Jona-Zwetsloot":"https:\/\/avatars.githubusercontent.com\/u\/170928581?s=64&v=4","compiledkernel-idk":"https:\/\/avatars.githubusercontent.com\/u\/220610112?s=64&v=4","levkris":"https:\/\/avatars.githubusercontent.com\/u\/105733478?s=64&v=4","timmah12341":"https:\/\/avatars.githubusercontent.com\/u\/200096760?s=64&v=4","JxxIT":"https:\/\/avatars.githubusercontent.com\/u\/110342008?s=64&v=4"};


let data;
const isExtension = platform != 'Userscript' && platform != 'Android';
const hasSettingsHash = window.location.hash == '#mod-settings';if (typeof GM_getValue === 'function' && typeof GM_setValue === 'function') {
    function get(e) {
        return GM_getValue(e, null);
    }
    function set(e, t) {
        return GM_setValue(e, t);
    }
    if (platform != 'Userscript') {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Userscript storage is used while the platform is not set to Userscript.'));
    }
}else if (((typeof chrome !== 'undefined') && chrome.storage) && chrome.storage.local) {
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
    if (!isExtension) {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Extension storage is used while the platform is set to ' + platform + '.'));
    }
}else if (window.localStorage) {
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
}if (hasSettingsHash) {
    set('opensettingsIntention', '1');
}

function id(id) {
    return document.getElementById(id);
}
function cn(cl, index) {
    if (index == null) {
        return document.getElementsByClassName(cl);
    } else if (document.getElementsByClassName(cl)[index] != null) {
        return document.getElementsByClassName(cl)[index];
    }
    return null;
}
function tn(tn, index) {
    if (index == null) {
        return document.getElementsByTagName(tn);
    } else if (document.getElementsByTagName(tn)[index] != null) {
        return document.getElementsByTagName(tn)[index];
    }
    return null;
}
function hide(element) {
    if (element != null) {
        element.style.display = "none";
    }
}
function show(element) {
    if (element != null) {
        element.style.display = "block";
    }
}
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
function setHTML(element, html) {
    if (element != null) {
        element.innerHTML = html;
    }
}
function tryRemove(element) {
    if (element != null) {
        element.remove();
    }
}
let somtodayversion;
let rateLimitDate;
function execute(functionarray) {
    for (const element of functionarray) {
        try {
            element();
        } catch (e) {
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
    return `#${"$"}{rr}${"$"}{gg}${"$"}{bb}`;
};
const hexToRgb = hex => hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])${"$"}/i, (m, r, g, b) => '#' + r + r + g + g + b + b).substring(1).match(/.{2}/g).map(x => parseInt(x, 16));
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}).join('');
const getRelativeLuminance = (rgb) => Math.round(0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]);
function adjustColorChannel(channel, hex, value) {
    let rgb = hexToRgb(hex);
    rgb[channel] = Math.min(Math.max(rgb[channel] + value, 0), 255);
    return rgbToHex(rgb[0], rgb[1], rgb[2]);
}
function toBrightnessValue(color, target) {
    let i;
    let brightness;
    const startColor = color;
    for (i = 1; i <= 5; i++) {
        brightness = Math.round(getRelativeLuminance(hexToRgb(color)));
        color = adjust(color, target - brightness);
    }
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
    if (id('mod-night-theme')) {
        return;
    }

    if (cn('toggle-systeemvoorkeur', 0)) {
               set('autotheme', cn('toggle-systeemvoorkeur', 0).ariaChecked == 'true' ? 'true' : 'false');

        cn('toggle-systeemvoorkeur', 0).addEventListener('click', function () {
                       if (this.ariaChecked == 'true') {
                set('autotheme', 'true');
                               if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    if (cn('container dark', 0) && cn('container dark', 0).ariaChecked == 'false') {
                        cn('container dark', 0).click();
                        this.click();
                    }
                }
                               else {
                    if (cn('container light', 0) && cn('container light', 0).ariaChecked == 'false') {
                        cn('container light', 0).click();
                        this.click();
                    }
                }
            }
                       else {
                set('autotheme', 'false');
            }

                       updateTheme();
        });
    }

       const blokDiv = document.querySelector('div.blok');
    const darkDiv = blokDiv.querySelector('div[data-gtm="instellingen-weergave-theme-dark-mode"]');
    const darkImage = darkDiv.getElementsByTagName('img')[0];
    const nightDiv = darkDiv.cloneNode(true);
    nightDiv.id = 'mod-night-theme';
    nightDiv.getElementsByTagName('label')[0].title = 'Toegevoegd door Somtoday Mod';
    nightDiv.getElementsByTagName('label')[0].innerHTML = 'Night ' + window.logo(null, null, '#0099ff', 'height:1em;width:fit-content;margin-left:5px;transform:translateY(2px);');
    nightDiv.getElementsByTagName('input')[0].value = 'night';
    nightDiv.getElementsByTagName('input')[0].checked = get('theme') == 'night';
    nightDiv.setAttribute('aria-label', 'Weergave nacht');
          if (darkImage) {
        if (isExtension) {
            darkImage.src = chrome.runtime.getURL('images/dark-mode.svg');
        }
        else {
            darkImage.outerHTML = '<svg width="128" height="95" viewBox="0 0 128 95" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_4_2)"><path d="M122 0.5H6C2.96243 0.5 0.5 2.96243 0.5 6V89C0.5 92.0376 2.96243 94.5 6 94.5H122C125.038 94.5 127.5 92.0376 127.5 89V6C127.5 2.96243 125.038 0.5 122 0.5Z" fill="#778091" stroke="#E2E5E9"/><path d="M32.2441 33C32.2441 31.3431 33.5873 30 35.2441 30H127.023V89C127.023 91.7614 124.784 94 122.023 94H32.2441V33Z" fill="#20262D"/><path d="M46.8223 53L45.7051 49.8281H41.3379L40.2207 53H38.2441L42.4941 41.5312H44.5723L48.8145 53H46.8223ZM45.2207 48.2188L44.1348 45.0938C44.0931 44.9583 44.0332 44.7682 43.9551 44.5234C43.877 44.2734 43.7988 44.0208 43.7207 43.7656C43.6426 43.5052 43.5775 43.2866 43.5254 43.1095C43.4733 43.323 43.4082 43.5625 43.3301 43.8281C43.2572 44.0885 43.1842 44.3333 43.1113 44.5625C43.0436 44.7917 42.9915 44.9688 42.9551 45.0938L41.8613 48.2188H45.2207ZM53.5254 44.1875C54.6191 44.1875 55.4447 44.4298 56.002 44.9142C56.5645 45.3985 56.8457 46.1536 56.8457 47.1797V53H55.541L55.1895 51.7734H55.127C54.8822 52.0859 54.6296 52.3439 54.3691 52.547C54.1087 52.7501 53.8066 52.901 53.4629 53C53.1243 53.1042 52.7103 53.1562 52.2207 53.1562C51.7051 53.1562 51.2441 53.0625 50.8379 52.875C50.4316 52.6823 50.1113 52.3906 49.877 52C49.6426 51.6094 49.5254 51.1146 49.5254 50.5156C49.5254 49.625 49.8561 48.9558 50.5176 48.5079C51.1842 48.06 52.1895 47.8125 53.5332 47.7656L55.0332 47.7109V47.2579C55.0332 46.659 54.8926 46.2319 54.6113 45.9767C54.3353 45.7215 53.9447 45.5938 53.4395 45.5938C53.0072 45.5938 52.5879 45.6562 52.1816 45.7812C51.7754 45.9062 51.3796 46.0599 50.9941 46.2422L50.4004 44.9454C50.8223 44.7215 51.3014 44.5391 51.8379 44.3984C52.3796 44.2578 52.9421 44.1875 53.5254 44.1875ZM55.0254 48.8672L53.9082 48.9062C52.9915 48.9376 52.3483 49.0938 51.9785 49.375C51.6087 49.6562 51.4238 50.0418 51.4238 50.5312C51.4238 50.9584 51.5514 51.2708 51.8066 51.4688C52.0618 51.6615 52.3978 51.7579 52.8145 51.7579C53.4499 51.7579 53.9759 51.5781 54.3926 51.2188C54.8145 50.8542 55.0254 50.3203 55.0254 49.6172V48.8672Z" fill="white"/></g><defs><clipPath id="clip0_4_2"><rect width="128" height="95" fill="white"/></clipPath></defs></svg>';
        }
    }
    darkDiv.insertAdjacentElement('afterend', nightDiv);

          const allRadios = blokDiv.querySelectorAll('input[type="radio"][name="thema"]');
    const html = document.documentElement;
    const currentTheme = ['light', 'dark', 'night'].find(t => html.classList.contains(t));
    if (currentTheme) {
        const activeRadio = Array.from(allRadios).find(r => r.value === currentTheme);
        if (activeRadio) {
            activeRadio.checked = true;
        }
    }

       function updateTheme() {
        const html = document.documentElement;
        allRadios.forEach(r => {
            r.parentElement.setAttribute('aria-checked', r.checked ? 'true' : 'false');
        });
        html.classList.remove('light', 'dark', 'night');
        const checkedRadio = Array.from(allRadios).find(r => r.checked);
        if (checkedRadio && (checkedRadio.value == 'light' || checkedRadio.value == 'dark' || checkedRadio.value == 'night')) {
                       html.classList.add(checkedRadio.value);
            set('theme', checkedRadio.value);

                       if (checkedRadio.value == 'night' && cn('toggle-systeemvoorkeur', 0) && cn('toggle-systeemvoorkeur', 0).ariaChecked == 'true') {
                cn('toggle-systeemvoorkeur', 0).click();
            }
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
        const secondTab = tabs[1];
        const tabObserver = new MutationObserver(() => {
            if (secondTab.getAttribute('aria-selected') === 'true') {
                addNightTheme();
                tabObserver.disconnect();
            }
        });
        tabObserver.observe(secondTab, { attributes: true });
    }
});
waitForTabs.observe(document.body, { childList: true, subtree: true });

function errorPage() {
    if (!n(tn('hmy-button', 0))) {
        tn('hmy-button', 0).insertAdjacentHTML('afterend', '<a id="mod-play-game">Of speel een game</a>');
        id('mod-play-game').addEventListener('click', function () {
            tn('body', 0).classList.add('mod-game-playing');
                    const svg = tn('sl-error-image', 0).getElementsByTagName('svg')[0];
            tn('body', 0).insertAdjacentHTML('beforeend', '<div id="mod-game"><p id="mod-playtime"></p><p id="mod-close-button">&times;</p><div id="mod-basefloor"></div><div id="mod-player-container"><svg id="mod-flag-end" viewBox="0 0 147.6 250.5"><defs><linearGradient x1="154.8" y1="129.9" x2="287" y2="129.9" gradientUnits="userSpaceOnUse" id="a"><stop offset="0" stop-color="red"/><stop offset="1" stop-color="#ca0000"/></linearGradient></defs><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" stroke-width="0" stroke-miterlimit="10" style="mix-blend-mode:normal"><path d="m155 76 132 54-132 54z" data-paper-data="{&quot;index&quot;:null}" fill="url(#a)" transform="translate(-139 -56)"/><path d="M5 244V14h11v230z" fill="#ffad66"/><path d="M22 10a11 11 0 1 1-22 2 11 11 0 0 1 22-2zm-6 235a5 5 0 1 1-11 0 5 5 0 0 1 11 0z" fill="#ffad66"/></g></svg><svg id="mod-player" viewBox="0 0 49 49"><rect id="mod-player-rect" x="0" y="39" width="49" height="10" fill="transparent"></rect><path d="M44.6819 17.3781H43.3148C41.7353 17.3781 40.4606 16.1316 40.4606 14.5871V11.9045C40.4606 10.36 39.1859 9.11355 37.6064 9.11355H32.6184C31.0389 9.11355 29.7642 7.8671 29.7642 6.32258V2.79097C29.7642 1.24645 28.4895 0 26.91 0H22.153C20.5734 0 19.2987 1.24645 19.2987 2.79097V6.32258C19.2987 7.8671 18.024 9.11355 16.4445 9.11355H11.4566C9.87706 9.11355 8.60236 10.36 8.60236 11.9045V14.5871C8.60236 16.1316 7.32766 17.3781 5.74814 17.3781H4.38107C2.80155 17.3781 1.52686 18.6245 1.52686 20.169V28.5058C1.52686 30.0503 2.80155 31.2968 4.38107 31.2968H5.72967C7.30918 31.2968 8.58388 32.5432 8.58388 34.0877V37.1768C8.58388 38.7213 9.85858 39.9677 11.4381 39.9677C13.0176 39.9677 14.2923 41.2142 14.2923 42.7587V46.209C14.2923 47.7535 15.567 49 17.1465 49H20.2132C21.7927 49 23.0674 47.7535 23.0674 46.209V41.4039C23.0674 40.609 23.7232 39.9768 24.5269 39.9768C25.3305 39.9768 25.9863 40.6181 25.9863 41.4039V46.209C25.9863 47.7535 27.261 49 28.8405 49H31.9072C33.4867 49 34.7614 47.7535 34.7614 46.209V42.7587C34.7614 41.2142 36.0361 39.9677 37.6156 39.9677C39.1951 39.9677 40.4698 38.7213 40.4698 37.1768V34.0877C40.4698 32.5432 41.7445 31.2968 43.324 31.2968H44.6726C46.2522 31.2968 47.5269 30.0503 47.5269 28.5058V20.169C47.5269 18.6245 46.2522 17.3781 44.6726 17.3781H44.6819ZM37.902 26.4465C37.006 29.3368 35.0108 31.7123 32.2859 33.1394C30.5863 34.0245 28.7297 34.4761 26.8453 34.4761C25.7184 34.4761 24.5823 34.3135 23.4738 33.9794C22.7995 33.7806 22.4208 33.0852 22.624 32.4348C22.8273 31.7755 23.5385 31.4052 24.2128 31.6039C26.522 32.2903 28.9606 32.0555 31.0943 30.9445C33.2188 29.8335 34.7799 27.9819 35.4819 25.7239C35.6851 25.0645 36.3963 24.7032 37.0706 24.8929C37.7449 25.0916 38.1236 25.7871 37.9204 26.4465H37.902Z" fill="var(--bg-primary-normal)" /></svg>' +
                '<div id="mod-level-0" class="mod-level" data-title="Je hebt de geheime kamer gevonden!" data-description="Druk op <i>pijl omlaag</i> of <i>S</i> om laag te blijven" data-right="5" data-bottom="2"><svg style="position:absolute;top:0;right:5%;transform:rotate(195deg);width:200px;" viewBox="0 0 333 303"><g><path d="M101 64V0h232v64H131l-30 28z" fill="#fff"></path><path d="M46 291v-71h27v71z" fill="#4750ff"></path><path d="M86 290c0 6-9 11-20 11s-20-5-20-11c0-7 9-12 20-12s20 5 20 12z" fill="#4750ff"></path><path d="M17 292v-70h27v70z" fill="#636cff"></path><path d="M57 291c0 7-9 12-20 12s-20-5-20-12c0-6 9-11 20-11s20 5 20 11z" fill="#636cff"></path><path d="M92 194c0 28-20 50-44 50-25 0-45-22-45-50s20-50 45-50c24 0 44 22 44 50z" fill="#55b1ff"></path><path d="M56 81c0 10-9 18-19 18-11 0-20-8-20-18s9-18 20-18c10 0 19 8 19 18z" fill="#c17100"></path><path d="M93 118c0 24-20 43-45 43-24 0-44-19-44-43s20-43 44-43c25 0 45 19 45 43z" fill="#ff9898"></path><path d="M79 107c0 5-4 9-9 9-4 0-8-4-8-9s4-9 8-9c5 0 9 4 9 9z" fill="#fff"></path><path d="M76 107c0 2-2 4-4 4-1 0-3-2-3-4s2-3 3-3c2 0 4 1 4 3z"></path><path d="M39 88c0 10-9 18-20 18-10 0-19-8-19-18 0-9 9-17 19-17 11 0 20 8 20 17z" fill="#d47b00"></path><path d="M82 102 64 91l2-3 17 12z"></path><path d="m59 188 51-66 16 12-51 66z" fill="#55b1ff"></path><path d="M135 129c-5 6-14 8-21 3-6-5-7-14-2-21 5-6 14-7 21-3 6 5 7 14 2 21z" fill="#ffa9a9"></path><path d="m71 137 8-7 11 3-1 3z"></path><text transform="translate(136 26) scale(.43897)" font-size="40" font-family="sans-serif"><tspan x="0" dy="0">Kom hier,</tspan><tspan x="0" dy="46">jij schobbejak!</tspan></text></g></svg><div class="mod-trampoline" style="width:100%;bottom:0;" data-strength="1.45"></div><div class="mod-lava" style="width:100%;bottom:98%;"></div></div>' +
                '<div id="mod-level-1" class="mod-level mod-active-level" data-title="Somtoday Platformer" data-description="Een van je docenten achtervolgt je omdat je je huiswerk niet hebt gemaakt. Ren gauw weg!" data-right="5" data-bottom="0"></div>' +
                '<div id="mod-level-2" class="mod-level" data-title="Spring naar de top" data-right="5" data-bottom="34"><div class="mod-floor" style="width:20%;bottom:10%;left:20%;"></div><div class="mod-floor" style="width:20%;bottom:21%;left:50%;"></div><div class="mod-floor" style="width:20%;bottom:32%;left:80%;"></div></div>' +
                '<div id="mod-level-3" class="mod-level" data-title="Val niet in de lava" data-right="5" data-bottom="0"><div class="mod-lava" style="width:23%;bottom:0;left:40%;"></div><div class="mod-floor" style="width:15%;bottom:10%;left:20%;"></div><div class="mod-floor" style="width:15%;bottom:20%;left:0%;"></div><div class="mod-floor" style="width:15%;bottom:30%;left:20%;"></div></div>' +
                '<div id="mod-level-4" class="mod-level" data-title="Trampolines!" data-right="5" data-bottom="69"><div class="mod-trampoline" style="width:15%;bottom:0;left:20%;"></div><div class="mod-floor" style="width:15%;bottom:30%;left:35%;"></div><div class="mod-trampoline" style="width:15%;bottom:30%;left:50%;"></div><div class="mod-floor" style="width:15%;bottom:56%;left:65%;"></div><div class="mod-floor" style="width:20%;bottom:67%;left:80%;"></div></div>' +
                '<div id="mod-level-5" class="mod-level" data-title="Wat een groot lava-blok!" data-right="5" data-bottom="77"><div class="mod-trampoline" style="width:12.5%;bottom:0;left:0;"></div><div class="mod-floor" style="width:12.5%;bottom:29%;left:12.5%;"></div><div class="mod-floor" style="width:12.5%;bottom:46%;left:0;"></div><div class="mod-floor" style="width:12.5%;bottom:64%;left:12.5%;"></div><div class="mod-floor" style="width:12.5%;bottom:64%;left:45%;"></div><div class="mod-floor" style="width:12.5%;bottom:64%;left:75%;"></div><div class="mod-floor" style="width:12.5%;bottom:75%;left:87.5%;"></div><div class="mod-lava" style="width:50%;bottom:0;left:25%;height:64%;"></div></div>' +
                '<div id="mod-level-6" class="mod-level" data-title="Pas op voor onvoldoendes" data-right="5" data-bottom="0"><div class="mod-trampoline" style="width:15%;bottom:0;left: 10%;"></div><div class="mod-enemy" data-x="50" style="bottom:0;left:50%;"></div><div class="mod-enemy" data-x="75" style="bottom:0;left:75%;"></div></div>' +
                '<div id="mod-level-7" class="mod-level" data-title="Wow! Je bent al bij level 7!" data-right="5" data-bottom="0"><div class="mod-enemy" data-x="50" data-min="14" style="bottom:0;left:50%;"></div><div class="mod-wall" style="bottom:0;left:12.5%;height:13%;"></div><div class="mod-wall" style="bottom:13%;left:75%;height:100%;"></div><div class="mod-floor" style="width:20%;bottom:13%;left:12.5%;"></div><div class="mod-floor" style="width:35%;bottom:13%;left:40%;"></div></div>' +
                '<div id="mod-level-8" class="mod-level" data-title="Soms moet je gewoon snel zijn" data-left="5" data-bottom="85"><div class="mod-lava" style="width:10%;bottom:72%;left:30%;"></div><div class="mod-lava" style="width:10%;bottom:72%;left:60%;"></div><div class="mod-enemy" style="bottom:38%;left:40%;" data-x="40" data-max="40" data-min="15"></div><div class="mod-trampoline" style="width:15%;bottom:38%;left:85%;"></div><div class="mod-floor" style="width:70%;bottom:70%;left:15%;"></div><div class="mod-floor" style="width:80%;bottom:18%;left:0;"></div><div class="mod-enemy" style="bottom:20%;left:55%;" data-x="55" data-max="55"></div><div class="mod-floor" style="width:30%;bottom:36%;left:70%;"></div><div class="mod-floor" style="width:30%;bottom:36%;left:15%;"></div><div class="mod-floor" style="width:28%;bottom:49%;left:44%;"></div><div class="mod-floor" style="width:17%;bottom:83%;left:0;"></div><div class="mod-wall" style="bottom:36%;left:44%;height:13%;"></div><div class="mod-wall" style="bottom:70%;left:15%;height:13%;"></div><div class="mod-wall" style="bottom:36%;left:70%;height:13%;"></div></div>' +
                '<div id="mod-level-9" class="mod-level" data-title="Stap op de bewegende platforms" data-right="5" data-bottom="60"><div class="mod-lava" style="width:60%;bottom:0;left:40%;"></div><div class="mod-moving-platform-up" data-bottom="0" data-direction="up" style="left:20%;bottom:0;top:42%;right:65%;"><div class="mod-floor mod-platform"></div></div><div class="mod-moving-platform-right" data-right="0" data-direction="left" style="left:35%;top:40%;right:20%;"><div class="mod-floor"></div></div><div class="mod-floor" style="width:15%;bottom:58%;left:85%;"></div></div>' +
                '<div id="mod-level-10" class="mod-level" data-title="" data-right="40" data-bottom="80"><h1 class="mod-floor" style="width:50%;left:25%;">Laatste level!</h1><div class="mod-floor" style="width:20%;bottom:15%;left:20%;"></div><div class="mod-floor" style="width:20%;bottom:34%;left:0;"></div><div class="mod-floor" style="width:20%;bottom:15%;left:60%;"></div><div class="mod-floor" style="width:20%;bottom:34%;left:80%;"></div><div class="mod-floor" style="width:20%;bottom:78%;left:50%;"></div><div class="mod-trampoline" style="width:10%;bottom:54%;left:30%;"></div></div>' +
                '<div id="mod-level-11" class="mod-level" data-title="Gefeliciteerd" data-description="Je bent succesvol ontsnapt aan de docent!" data-right="-5" data-bottom="-5"><a id="mod-play-again" style="bottom:20%;">Nog een keer spelen</a><a id="mod-close-game" style="bottom:10%;">Spel sluiten</a></div>' +
                '<h1 id="mod-h1-header"></h1><h3 id="mod-h3-header"></h3></div></div>');

            let detectOverlap = (function () {
                function getPositions(elem) {
                    const pos = elem.getBoundingClientRect();
                    return [[pos.left, pos.right], [pos.top, pos.bottom]];
                }

                function comparePositions(p1, p2) {
                    let r1, r2;
                    if (p1[0] < p2[0]) {
                        r1 = p1;
                        r2 = p2;
                    } else {
                        r1 = p2;
                        r2 = p1;
                    }
                    return r1[1] > r2[0] || r1[0] === r2[0];
                }

                return function (a, b) {
                    const pos1 = getPositions(a),
                        pos2 = getPositions(b);
                    return comparePositions(pos1[0], pos2[0]) && comparePositions(pos1[1], pos2[1]);
                };
            })();

            const player = id('mod-player');
            const playerRect = id('mod-player-rect');
            let positionX = 2;
            let positionY = 0;
            let velocityX = 0;
            let velocityY = 0;
            let onGround = true;
            let floorElements;
            let wallElements;
            let lavaElements;
            let trampolineElements;
            let enemyElements;
            let movingPlatformsUp;
            let movingPlatformsRight;
            var pressedKeys = {};
            let windowWidth = document.documentElement.clientWidth;
            let windowHeight = document.documentElement.clientHeight - 100;
            let level = 1;
            let activeLevel;
            for (const element of cn('mod-enemy')) {
                element.dataset.start = element.dataset.x;
                const numOne = Math.floor(Math.random() * (5) + 1);
                let numTwo = Math.floor(Math.random() * (10));
                if (numOne == 5 && numTwo >= 5) {
                    numTwo = 4;
                }
                element.innerHTML = '<p>' + numOne.toString() + ',' + numTwo.toString() + '</p>';
            }

            let time = 0;
            let timer;
            setTimeInterval();
            function setTimeInterval() {
                setTime();
                timer = setInterval(function () {
                    time++;
                    setTime();
                }, 1000);
            }

            function setTime() {
                if (!n(id('mod-playtime'))) {
                    if (n(get('gamerecord'))) {
                        id('mod-playtime').innerHTML = 'Tijd: ' + time + 's';
                    }
                    else {
                        id('mod-playtime').innerHTML = 'Tijd: ' + time + 's, ' + 'record: ' + get('gamerecord') + 's';
                    }
                }
            }

            function openLevel(number) {
                level = number;
                activeLevel = id('mod-level-' + level.toString());
                if (number == 11) {
                    if (!n(timer)) {
                        clearInterval(timer);
                    }
                    if (n(get('gamerecord')) || time < get('gamerecord')) {
                        set('gamerecord', time);
                    }
                }
                if (n(activeLevel)) {
                    tn('body', 0).classList.remove('mod-game-playing');
                    if (!n(updateGame)) {
                        clearInterval(updateGame);
                    }
                    if (!n(timer)) {
                        clearInterval(timer);
                    }
                    setTimeout(function () {
                        id('mod-game').remove();
                    }, 320);
                    return;
                }
                floorElements = activeLevel.getElementsByClassName('mod-floor');
                wallElements = activeLevel.getElementsByClassName('mod-wall');
                lavaElements = activeLevel.getElementsByClassName('mod-lava');
                trampolineElements = activeLevel.getElementsByClassName('mod-trampoline');
                enemyElements = activeLevel.getElementsByClassName('mod-enemy');
                movingPlatformsUp = activeLevel.getElementsByClassName('mod-moving-platform-up');
                movingPlatformsRight = activeLevel.getElementsByClassName('mod-moving-platform-right');
                id('mod-h1-header').innerHTML = activeLevel.dataset.title;
                if (!n(activeLevel.dataset.description)) {
                    id('mod-h3-header').innerHTML = activeLevel.dataset.description;
                }
                else {
                    id('mod-h3-header').innerHTML = '';
                }
                cn('mod-active-level', 0).classList.remove('mod-active-level');
                activeLevel.classList.add('mod-active-level');
                if (n(activeLevel.dataset.left)) {
                    id('mod-flag-end').style.left = '';
                    id('mod-flag-end').style.right = activeLevel.dataset.right + '%';
                }
                else {
                    id('mod-flag-end').style.right = '';
                    id('mod-flag-end').style.left = activeLevel.dataset.left + '%';
                }
                id('mod-flag-end').style.bottom = activeLevel.dataset.bottom + '%';
                positionX = 2;
                positionY = 0;
                velocityX = 0;
                velocityY = 0;
                onGround = true;
            }

            openLevel(1);

            id('mod-close-game').addEventListener('click', function () { openLevel(12); });
            id('mod-close-button').addEventListener('click', function () { openLevel(12); });
            id('mod-play-again').addEventListener('click', function () { time = 0; setTimeInterval(); openLevel(1); });

            document.addEventListener('keyup', function (e) { pressedKeys[e.keyCode] = false; });
            document.addEventListener('keydown', function (e) { if (e.keyCode == 40) { e.preventDefault(); } pressedKeys[e.keyCode] = true; });

            let touchX;
            let touchY;
            let isTouching = false;
            document.addEventListener('touchstart', function (e) { isTouching = true; const touch = e.touches[0] || e.changedTouches[0]; touchX = touch.pageX; touchY = touch.pageY; });
            document.addEventListener('touchmove', function (e) { isTouching = true; const touch = e.touches[0] || e.changedTouches[0]; touchX = touch.pageX; touchY = touch.pageY; });
            document.addEventListener('touchend', function (e) { isTouching = false; });
            document.addEventListener('touchcancel', function (e) { isTouching = false; });


            document.addEventListener('mousedown', function (e) { isTouching = true; touchX = e.clientX; touchY = e.clientY; });
            document.addEventListener('mousemove', function (e) { touchX = e.clientX; touchY = e.clientY; });
            document.addEventListener('mouseover', function (e) { touchX = e.clientX; touchY = e.clientY; });
            document.addEventListener('mouseenter', function (e) { touchX = e.clientX; touchY = e.clientY; });
            document.addEventListener('mouseup', function (e) { isTouching = false; });
            document.addEventListener('mouseleave', function (e) { isTouching = false; });

            document.addEventListener('resize', function () { windowWidth = document.documentElement.clientWidth; windowHeight = document.documentElement.clientHeight; });

                       const updateGame = setInterval(function () {
                const boundingRect = player.getBoundingClientRect();
                               if ((isTouching && touchY < boundingRect.top - 100) || pressedKeys[38] || pressedKeys[87]) {
                    if (onGround) {
                        for (const element of movingPlatformsUp) {
                            if (element.dataset.direction == 'up' && detectOverlap(playerRect, element.children[0])) {
                                velocityY += 0.7;
                                positionY += 0.7;
                            }
                        }
                        velocityY += 1.7;
                        onGround = false;
                        positionY += 0.3;
                        player.style.bottom = positionY + '%';
                    }
                }
                               if ((isTouching && touchY > boundingRect.top + 100) || pressedKeys[40] || pressedKeys[83]) {
                    velocityY -= 0.2;
                }
                               if ((isTouching && touchX > boundingRect.left + 100) || pressedKeys[39] || pressedKeys[68]) {
                    velocityX += 0.055;
                }
                               if ((isTouching && touchX < boundingRect.left - 100) || pressedKeys[37] || pressedKeys[65]) {
                    velocityX -= 0.055;
                }
                if (velocityX > 1) {
                    velocityX = 1;
                }
                if (velocityX < -1) {
                    velocityX = -1;
                }
                for (const element of movingPlatformsUp) {
                    if (element.dataset.direction == 'up') {
                        const newValue = parseFloat(element.dataset.bottom) + 0.5;
                        element.dataset.bottom = newValue;
                        element.children[0].style.bottom = newValue.toString() + '%';
                        if (newValue >= 100) {
                            element.dataset.direction = 'down';
                        }
                        if (detectOverlap(playerRect, element.children[0])) {
                            positionY += element.clientHeight / 100 * 0.5 / windowHeight;
                            onGround = true;
                        }
                    }
                    else {
                        const newValue = parseFloat(element.dataset.bottom) - 0.5;
                        element.dataset.bottom = newValue;
                        element.children[0].style.bottom = newValue.toString() + '%';
                        if (newValue <= 0) {
                            element.dataset.direction = 'up';
                        }
                        if (detectOverlap(playerRect, element.children[0])) {
                            positionY -= element.clientHeight / 100 * 0.5 / windowHeight;
                            onGround = true;
                        }
                    }
                }
                for (const element of movingPlatformsRight) {
                    if (element.dataset.direction == 'left') {
                        const newValue = parseFloat(element.dataset.right) + 0.4;
                        element.dataset.right = newValue;
                        element.children[0].style.right = newValue.toString() + '%';
                        if (newValue >= 100) {
                            element.dataset.direction = 'right';
                        }
                        if (detectOverlap(playerRect, element.children[0])) {
                            positionX -= element.clientWidth / 100 * 0.4 / windowWidth * 100;
                            onGround = true;
                        }
                    }
                    else {
                        const newValue = parseFloat(element.dataset.right) - 0.4;
                        element.dataset.right = newValue;
                        element.children[0].style.right = newValue.toString() + '%';
                        if (newValue <= 0) {
                            element.dataset.direction = 'left';
                        }
                        if (detectOverlap(playerRect, element.children[0])) {
                            positionX += element.clientWidth / 100 * 0.4 / windowWidth * 100;
                            onGround = true;
                        }
                    }
                }
                if (positionY <= 0) {
                    velocityY = 0;
                    onGround = true;
                }
                else {
                    onGround = false;
                    for (const element of floorElements) {
                        if (detectOverlap(playerRect, element)) {
                            if (velocityY <= 0) {
                                velocityY = 0;
                                onGround = true;
                                player.style.bottom = (positionY + 0.3) + '%';
                                if (detectOverlap(playerRect, element)) {
                                    positionY += 0.3;
                                }
                            }
                            else {
                                velocityY = -0.5;
                            }
                            break;
                        }
                        else if (detectOverlap(player, element)) {
                            velocityY = -0.5;
                            break;
                        }
                    }
                }
                for (const element of wallElements) {
                    if (detectOverlap(playerRect, element)) {
                        if (velocityX > 0) {
                            velocityX = -0.5;
                        }
                        else if (velocityX < 0) {
                            velocityX = 0.5;
                        }
                    }
                }
                for (const element of trampolineElements) {
                    if (detectOverlap(player, element)) {
                        if (n(element.dataset.strength)) {
                            velocityY = 2.5;
                        }
                        else {
                            velocityY = 2.5 * parseFloat(element.dataset.strength);
                        }
                        onGround = false;
                    }
                }
                if (positionX + velocityX < 0) {
                    positionX = 0;
                    const newLevel = level - 1;
                    if (newLevel >= 0) {
                        setTimeout(function () {
                            if (level != newLevel && positionX + velocityX < 0) {
                                openLevel(newLevel);
                            }
                        }, 2000);
                    }
                }
                else if (windowWidth / 100 * (positionX + velocityX) > windowWidth - 50) {
                    positionX = 100 / windowWidth * (windowWidth - 50);
                }
                else {
                    positionX += velocityX;
                }
                if (positionY + velocityY < 0) {
                    positionY = 0;
                }
                else {
                    positionY += velocityY;
                }
                velocityX = velocityX * 0.9;
                if (!onGround) {
                    velocityY -= 0.07;
                }
                player.style.left = positionX + '%';
                player.style.bottom = positionY + '%';
                if (detectOverlap(player, id('mod-flag-end'))) {
                    openLevel(level + 1);
                }
                               for (const element of lavaElements) {
                    if (detectOverlap(player, element)) {
                        positionX = 2;
                        positionY = 0;
                        velocityX = 0;
                        velocityY = 0;
                        onGround = true;
                    }
                }
                               for (const element of enemyElements) {
                    if (detectOverlap(player, element)) {
                        positionX = 2;
                        positionY = 0;
                        velocityX = 0;
                        velocityY = 0;
                        onGround = true;
                        for (const element of enemyElements) {
                            element.dataset.x = element.dataset.start;
                            element.style.left = (parseFloat(element.dataset.x)).toString() + '%';
                        }
                    }
                    else {
                        const currentPositionX = parseFloat(element.dataset.x);
                        let newValue;
                        if (currentPositionX > positionX) {
                            newValue = currentPositionX - 0.18;
                        }
                        else {
                            newValue = currentPositionX + 0.18;
                        }
                        if (!n(element.dataset.min) && newValue < parseFloat(element.dataset.min)) {
                            newValue = parseFloat(element.dataset.min);
                        }
                        if (!n(element.dataset.max) && newValue > parseFloat(element.dataset.max)) {
                            newValue = parseFloat(element.dataset.max);
                        }
                        element.dataset.x = newValue;
                        element.style.left = newValue.toString() + '%';
                    }
                }
            }, 10);
        });

        if (window.location.hash == '#mod-play') {
            id('mod-play-game').click();
            history.replaceState('', document.title, window.location.pathname + window.location.search);
        }
    }
}
async function autoLogin() {
    if (n(get('loginschool')) || get('logincredentialsincorrect') == '1') {
        return;
    }

       const schoolField = await waitForElement('#organisatieSearchField, #organisatieInput');

    if (!n(cn('feedbackPanelERROR', 0))) {
        set('logincredentialsincorrect', '1');
        return;
    } else if (!schoolField) {
        return;
    }

       if (!n(id('organisatieSearchField'))) {
        id('organisatieSearchField').value = get('loginschool');
               if (!n(cn('form--checkbox checkbox-label', 0)) && cn('form--checkbox checkbox-label', 0).ariaChecked == 'false') {
            cn('form--checkbox checkbox-label', 0).click();
        }
    }

    if (n(get('loginname'))) {
        return;
    }

       await new Promise(resolve => setTimeout(resolve, 100));

       if (!n(cn('button--stpanel primary-button', 0))) {
        cn('button--stpanel primary-button', 0).click();
    }

       const usernameField = await waitForElement('#usernameField');

    if (!n(cn('feedbackPanelERROR', 0))) {
        set('logincredentialsincorrect', '1');
        return;
    } else if (!usernameField) {
        return;
    }

       id('usernameField').value = get('loginname');

    if (!n(id('passwordField'))) {
               if (n(get('loginpass'))) {
            return;
        }
        id('passwordField').value = get('loginpass');
    }
       if (!n(cn('form--checkbox checkbox-label', 0)) && cn('form--checkbox checkbox-label', 0).ariaChecked == 'false') {
        cn('form--checkbox checkbox-label', 0).click();
    }

       const submitButton = await waitForElement('.button--stpanel.primary-button');
    if (!submitButton) {
        return;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
       cn('button--stpanel primary-button', 0).click();

             setTimeout(() => {
        if (!n(cn('feedbackPanelERROR', 0))) {
            set('logincredentialsincorrect', '1');
        }
    }, 1000);
}

async function waitForPageLoad() {
    while (isExtension && data == null) {
        await new Promise(resolve => setTimeout(resolve, 25));
    }
    
       if (hasSettingsHash) {
        set('opensettingsIntention', '1');
    }
       if (isExtension && !data.enabled) {
        return;
    }
       else if (window.location.origin.indexOf('inloggen') != -1) {
        execute([autoLogin]);
        return;
    }
       else if (window.location.origin.indexOf('som.today') != -1) {
        if (get('bools') == null || get('bools').charAt(BOOL_INDEX.REDIRECT_ELO) == '1') {
            window.location.replace('https://inloggen.somtoday.nl');
        }
        return;
    }

       const loadedElement = await waitForElement('sl-home > *:nth-child(2), sl-error, .errorTekst, iframe[src="https://som.today/updaten/"]');

    if (loadedElement) {
        if (loadedElement.tagName === 'IFRAME') {
            return;
        }
        execute([onload]);
    }
}

execute([waitForPageLoad]);


function onload() {

       if (!n(id('somtoday-mod-active'))) {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD:\nMultiple instances of Somtoday Mod are running.\nSomtoday Mod ' + platform + ' v' + version + ' will not be working until the other instance is deleted or deactivated.'));
        return;
    }

    const mathQuestions = ['compose the formula of f\'x() where f(x) = 2 * sin(9x + 3)', 'rewrite 2 * log3(243) + 28 to the form of log(a)', 'find the value(s) of x in the equation x^2 + 9 = -6x', 'give the point(s) where  12 = 2y + 6x and y = x^2 - 5x intersect (round on 2 decimals)', 'rewrite -sin(8x) to the form of cos(ax + b)'];
    const mathAnswers = ['Answer: f\'(x) = 18 * cos(9x + 3)', 'Answer: log(10^38)', 'Answer: x = -3', 'Answer: (-1,65; 10,94), (3,65; -4,94)', 'Answer: cos(8x + 0.5pi)'];
    const selectedQuestion = Math.floor(Math.random() * mathQuestions.length);
    tn('body', 0).insertAdjacentHTML('beforeend', '<div id="somtoday-mod"><div id="somtoday-mod-active" data-platform="' + platform + '" data-version="' + version + '"><!-- Well hello there! Great work, detective. --><!-- Nothing better to do? Solve this math question: ' + mathQuestions[selectedQuestion] + ' --><div data-info="expand-to-view-answer"><!-- ' + mathAnswers[selectedQuestion] + ' --></div></div></div>');

       if (!n(cn('cf-error-details cf-error-502', 0))) {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Bad gateway (502)'));
        return;
    }

       if (!n(tn('sl-error', 0))) {
        setTimeout(console.warn.bind(console, 'SOMTODAY MOD: Unknown error'));
        execute([errorPage]);
        return;
    }

       if (!n(cn('titlewrap', 0))) {
               if (cn('titlewrap', 0).parentElement.parentElement.innerHTML.indexOf('storing') != -1) {
            setTimeout(console.warn.bind(console, 'Somtoday Mod ERROR\nSomtoday is down.'));
            return;
        }
    }

    let today = new Date();
    let dayInt = today.getDate();
    let month = today.getMonth();
    let year = today.getFullYear();
    let filesProcessed;
    let darkmode = tn('html', 0).classList.contains('dark') || tn('html', 0).classList.contains('night');
    let busy = false;
    let isRecapping = false;
    let ignoreRecapConditions = false;
    let ignoreCountdownConditions = false;
    if (!n(tn('sl-root', 0))) {
        somtodayversion = tn('sl-root', 0).getAttribute('ng-version');
    }
    let menuColor;
    let highLightColor;
    let menuWidth = n(get('menuwidth')) ? 110 : get('menuwidth');

       const fonts = ['Abhaya Libre', 'Aleo', 'Archivo', 'Assistant', 'B612', 'Bebas Neue', 'Black Ops One', 'Brawler', 'Cabin', 'Caladea', 'Cardo', 'Chivo', 'Comic Sans MS', 'Crimson Text', 'DM Serif Text', 'Enriqueta', 'Fira Sans', 'Frank Ruhl Libre', 'Gabarito', 'Gelasio', 'Grenze Gotisch', 'IBM Plex Sans', 'Inconsolata', 'Inter', 'Josefin Sans', 'Kanit', 'Karla', 'Lato', 'Libre Baskerville', 'Libre Franklin', 'Lora', 'Merriweather', 'Montserrat', 'Neuton', 'Noto Serif', 'Nunito', 'Open Sans', 'OpenDyslexic2', 'Oswald', 'papyrus', 'Permanent Marker', 'Pixelify Sans', 'Playfair Display', 'Poetsen One', 'Poppins', 'PT Sans', 'PT Serif', 'Quicksand', 'Raleway', 'Roboto', 'Roboto Slab', 'Rubik', 'Rubik Doodle Shadow', 'Sedan SC', 'Shadows Into Light', 'Single Day', 'Source Sans 3', 'Source Serif 4', 'Spectral', 'Titillium Web', 'Ubuntu', 'Work Sans'];
    let fontUrl = 'https://fonts.googleapis.com/css2';
    let first = true;
    for (const font of fonts) {
        if (font != 'Comic Sans MS' && font != 'papyrus' && font != 'OpenDyslexic2' && font != 'Open Sans') {
            fontUrl += (first ? '?' : '&') + 'family=' + font.replaceAll(' ', '+');
            first = false;
        }
    }
    fontUrl += '&display=swap';

       document.addEventListener('click', function () {
        if (n(id('mod-message')) && tn('sl-root', 0).inert) {
            tn('sl-root', 0).inert = false;
            if (!n(tn('sl-modal', 0))) {
                tn('sl-modal', 0).inert = false;
            }
        }
    });

       function consoleMessage() {
        setTimeout(console.log.bind(console, "%cSomtoday Mod is geactiveerd!", "color:#0067c2;font-weight:bold;font-family:Arial;font-size:26px;"));
        setTimeout(console.log.bind(console, "%cGeniet van je betere versie van Somtoday.\n\nMet dank aan " + Object.keys(contributors).join(', ') + "\n" + (n(somtodayversion) ? 'Onbekende versie' : 'Versie ' + somtodayversion) + " van Somtoday\nVersie " + version_name + " van Somtoday Mod " + platform, "color:#0067c2;font-weight:bold;font-family:Arial;font-size:16px;"));
    }

    function initTheme() {
        const theme = get('theme');
        if ((theme == 'light' || theme == 'dark' || theme == 'night') && get('autotheme') !== 'true') {
            const html = document.documentElement;
            html.classList.remove('light', 'dark', 'night');
            html.classList.add(theme);
        }
    }

    function editGrades() {
                      if (false) {
            for (const element of cn('cijfer')) {
                element.contentEditable = true;
                element.addEventListener('click', function (event) { this.focus(); event.stopPropagation(); });
            }
        }
    }

    function easterEggs() {
        if (n(id('mod-easter-eggs'))) {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-easter-eggs">#blue-screen-of-death{position:fixed;top:0;left:0;z-index:10000;width:100%;height:100%;background:#1173aa;}#blue-screen-of-death svg{user-select:none;pointer-events:none;position:absolute;top:50%;box-sizing:border-box;transform:translateY(-50%);width:100%;}#mod-logo-decoration{position:absolute;width:50px;right:5px;top:65px;transition:transform 0.3s,opacity 0.3s;}#mod-logo-decoration.mod-logo-decoration-clicked{opacity:0;}#mod-logo-decoration:hover{transform:scale(1.1);}#mod-logo-hat{z-index:1;width:80px;height:80px;position:absolute;left:-6px;top:-9px;transform:rotate(-20deg);transition:transform 0.3s,left 0.3s,opacity 0.3s;}#mod-logo-hat:hover{transform:rotate(-30deg);left:-12px;}#mod-logo-hat.mod-logo-hat-clicked{animation:1s hatfalloff forwards;}@keyframes hatfalloff{0%{transform:rotate(-30deg);left:-12px;top:-9px;opacity:1;}90%{opacity:1;}100%{transform:rotate(-140deg);left:-90px;top:75px;opacity:0;}}body.easter-egg-shaking .background.ng-trigger{pointer-events:none !important;}@media(max-width:1279px){#mod-logo-hat{left:-15px;}#mod-logo-hat:hover{left:-20px;}}#somtoday-mod-version-easter-egg:active{border:2px solid var(--bg-primary-normal);border-radius:6px}.mod-easter-egg-logo{position:fixed;z-index:100000000;animation:8s logowalk infinite;width:200px;height:200px;}@keyframes logowalk{0%{bottom:10%;left:-210px;}20%{bottom:20%;left:80%;transform:rotate(40deg);}40%{bottom:40%;left:10px;transform:rotate(60deg);}60%{bottom:90%;left:50%;transform:rotate(-60deg);}80%{bottom:50%;left:90%;transform:rotate(10deg);}100%{bottom:10%;left:-210px;}}body.rainbow{animation:rainbow 4s infinite;}body.rainbow #mod-background{opacity:0.25;}@keyframes rainbow{100%,0%{background-color: rgb(255,0,0);}8%{background-color: rgb(255,127,0);}16%{background-color: rgb(255,255,0);}25%{background-color: rgb(127,255,0);}33%{background-color: rgb(0,255,0);}41%{background-color: rgb(0,255,127);}50%{background-color: rgb(0,255,255);}58%{background-color: rgb(0,127,255);}66%{background-color: rgb(0,0,255);}75%{background-color: rgb(127,0,255);}83%{background-color: rgb(255,0,255);}91%{background-color: rgb(255,0,127);}}body.barrelroll{animation:barrelroll 2s 0.1s infinite;}@keyframes barrelroll{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}' + ((get('layout') == 1 || get('layout') == 4) ? '@media (max-width:767px){#mod-logo-inserted,#mod-logo-hat{display:none;}}' : '') + '</style>');
            let i = 0;
            let j = 0;
            let k = 0;
            let l = 0;
            let m = 0;
            let n = 0;
            let p = 0;
            document.addEventListener('keydown', function (e) {
                let konamikeys = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
                if (e.key.toLowerCase() == konamikeys[i]) {
                    i++;
                }
                else {
                    i = 0;
                }
                if (i == konamikeys.length) {
                    tn('body', 0).classList.add('rainbow');
                }
                               let somtodaymodkeys = 'somtoday mod shake';
                if (e.key.toLowerCase() == somtodaymodkeys.charAt(j)) {
                    j++;
                }
                else {
                    j = 0;
                }
                if (j == somtodaymodkeys.length) {
                    tn('body', 0).classList.add('easter-egg-shaking');
                    easterEggShake();
                }
                               let barrelrollkeys = 'do a barrel roll';
                if (e.key.toLowerCase() == barrelrollkeys.charAt(k)) {
                    k++;
                }
                else {
                    k = 0;
                }
                if (k == barrelrollkeys.length) {
                    tn('body', 0).classList.add('barrelroll');
                    setTimeout(function () {
                        tn('body', 0).classList.remove('barrelroll');
                    }, 2100);
                }
                               let barrelrollxkeys = 'do a barrel roll x';
                if (e.key.toLowerCase() == barrelrollxkeys.charAt(l)) {
                    l++;
                }
                else {
                    l = 0;
                }
                if (l == barrelrollxkeys.length) {
                    modMessage('BARREL ROLL', 'Hoeveel barrel rolls?<div class="br"></div><input id="mod-barrel-roll-amount" type="number" min="0" step="1" onkeyup="if (this.value != \'\') { this.value = Math.floor(this.value); } if (this.value < 1 && this.value != \'\') { this.value = 1; }"/>', 'Doorgaan', 'Annuleren');
                    id('mod-message-action1').addEventListener('click', function () {
                        closeModMessage();
                        tn('body', 0).classList.add('barrelroll');
                        setTimeout(function () {
                            tn('body', 0).classList.remove('barrelroll');
                        }, id('mod-barrel-roll-amount').value * 2000 + 100);
                    });
                    id('mod-message-action2').addEventListener('click', closeModMessage);
                }
                               let recapkeys = 'recap';
                if (e.key.toLowerCase() == recapkeys.charAt(m)) {
                    m++;
                }
                else {
                    m = 0;
                }
                if (m == recapkeys.length) {
                    ignoreRecapConditions = true;
                    somtodayRecap();
                }
                               let countdownkeys = 'countdown';
                if (e.key.toLowerCase() == countdownkeys.charAt(n)) {
                    n++;
                }
                else {
                    n = 0;
                }
                if (n == countdownkeys.length) {
                    ignoreCountdownConditions = true;
                    newYearCountdown();
                }
                               let partykeys = 'party';
                if (e.key.toLowerCase() == partykeys.charAt(p)) {
                    p++;
                }
                else {
                    p = 0;
                }
                if (p == partykeys.length) {
                    toggleConfetti();
                    try {
                        let tada = new Audio(getAudioUrl('tada'));
                        tada.volume = 0.5;
                        tada.play();
                    } catch (e) {
                        console.warn(e);
                    }
                    p = 0;
                }
            });
        }
        if (!n(id('somtoday-mod-version-easter-egg')) && !id('somtoday-mod-version-easter-egg').classList.contains('mod-easter-egg')) {
            id('somtoday-mod-version-easter-egg').addEventListener('click', function () {
                tn('body', 0).insertAdjacentHTML('beforeend', window.logo(null, 'mod-easter-egg-logo mod-add-eventlistener" data-add-event-listener="true', '#0099ff'));
                for (const element of cn('mod-easter-egg-logo mod-add-eventlistener')) {
                    element.classList.remove('mod-add-eventlistener');
                    element.addEventListener('click', function () { this.remove(); });
                }
            });
            id('somtoday-mod-version-easter-egg').classList.add('mod-easter-egg');
        }
        if (tn('body', 0).classList.contains('easter-egg-shaking')) {
            easterEggShake();
        }
        function easterEggShake() {
            var shakingElements = [];
            shakingElements = Array.prototype.concat.apply(shakingElements, cn('terug'));
            shakingElements = Array.prototype.concat.apply(shakingElements, cn('sluiten'));
            shakingElements = Array.prototype.concat.apply(shakingElements, tn('hmy-button'));
            shakingElements = Array.prototype.concat.apply(shakingElements, tn('hmy-tab'));
            shakingElements = Array.prototype.concat.apply(shakingElements, tn('hmy-switch'));
            for (const element of shakingElements) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of cn('afspraak-header')) {
                element.children[element.children.length - 1].addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            if (!n(tn('sl-bericht-acties', 0))) {
                for (const element of tn('sl-bericht-acties', 0).children) {
                    element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
                }
            }
            for (const element of tn('sl-studiewijzer-item')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of tn('sl-studiewijzer-filter-button')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of tn('sl-rooster-item')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of tn('sl-rooster-huiswerk-stack')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of tn('sl-bericht-samenvatting')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of tn('hmy-geen-data')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of cn('button')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            for (const element of cn('nieuw-bericht')) {
                element.addEventListener('mouseover', function () { shakeOnHover(this, -30, 30, -30, 30); });
            }
            tn('sl-header', 0).addEventListener('mouseover', function () { shakeOnHover(this, -20, 20, -20, 20); });
        }
        function shakeOnHover(element, xMin, xMax, yMin, yMax) {
            element.style.transform = 'translate(' + (Math.random() * (xMax - xMin) + xMin).toString() + 'px, ' + (Math.random() * (yMax - yMin) + yMin).toString() + 'px)';
        }
    }

    let homeworkBusy = false;
    let homework;
    function customHomework() {
        if (n(get('homework'))) {
            set('homework', '[]');
        }
        if (get('bools').charAt(BOOL_INDEX.CUSTOM_HOMEWORK) == '1' && !homeworkBusy) {
            if (document.documentElement.clientWidth <= 767) {
                homeworkBusy = true;
                document.querySelectorAll('.mod-huiswerk').forEach(e => e.remove());
                document.querySelectorAll('.mod-placeholder').forEach(e => e.remove());
                homeworkBusy = false;
            }
            homework = JSON.parse(get('homework'));
            let startIndex = 0;
            for (let i = 0; i < homework.length; i++) {
                if (homework.returning == '0') {
                    startIndex = i;
                    break;
                }
            }
                                  let index = 0;
            for (const element of tn('sl-studiewijzer-dag')) {
                index = customHomeworkInner(element, index, startIndex);
            }
                       index = 0;
            for (const element of tn('sl-studiewijzer-lijst-dag')) {
                index = customHomeworkInner(element, index, startIndex);
            }
                       index = 0;
            for (const element of tn('sl-studiewijzer-week')) {
                if (element.getElementsByClassName('week')[0]) {
                    index = customHomeworkInner(element.getElementsByClassName('week')[0], index, startIndex);
                }
            }
                       if (tn('sl-rooster-week-header', 0)) {
                               const elements = tn('sl-rooster-week-header', 0).getElementsByClassName('mod-huiswerk');
                for (const element of elements) {
                    element.remove();
                }
                               index = 0;
                for (const element of tn('sl-rooster-week-header', 0).getElementsByClassName('dag')) {
                    index = customHomeworkInner(element, index, startIndex);
                }
            }
        }
        else if (!homeworkBusy) {
            homeworkBusy = true;
            document.querySelectorAll('.mod-huiswerk').forEach(e => e.remove());
            document.querySelectorAll('.mod-add-homework').forEach(e => e.remove());
            document.querySelectorAll('.mod-placeholder').forEach(e => e.remove());
            homeworkBusy = false;
        }
    }

    function sortByDate(a, b) {
               if (a.returning != '0') {
            return -1;
        }
        if (b.returning != '0') {
            return 1;
        }
               if (Date.parse(a.date) < Date.parse(b.date)) {
            return -1;
        }
        if (Date.parse(a.date) > Date.parse(b.date)) {
            return 1;
        }
        return 0;
    }

    function ariaLabelToDate(element) {
        let dateString;
        if (n(element.children[0])) {
            return;
        }
        if (element.getElementsByClassName('header')[0]) {
            element = element.getElementsByClassName('header')[0];
            dateString = ((n(element.children[0].ariaLabel) || !element.children[0].ariaLabel.match(/ (\d*? [a-z]*?)${"$"}/, '')) ? '' : element.children[0].ariaLabel.match(/ (\d*? [a-z]*?)${"$"}/, '')[1]) + ' ';
        }
        else {
            dateString = ((n(element.children[0].ariaLabel) || !element.children[0].ariaLabel.match(/^[A-Za-z]+? ([0-9]+?[ -][A-Za-z]+)/, '')) ? '' : element.children[0].ariaLabel.match(/^[A-Za-z]+? ([0-9]+?[ -][A-Za-z]+)/, '')[1]) + ' ';
        }
               if (dateString == ' ') {
            return;
        }
        if (dateString.indexOf('januari') != -1 || dateString.indexOf('februari') != -1 || dateString.indexOf('maart') != -1 || dateString.indexOf('april') != -1 || dateString.indexOf('mei') != -1 || dateString.indexOf('juni') != -1 || dateString.indexOf('juli') != -1) {
                       if (month + 1 <= 7) {
                dateString += year;
            }
                       else {
                dateString += (year - 1).toString();
            }
        }
        else {
                       if (month + 1 <= 7) {
                dateString += (year + 1).toString();
            }
                       else {
                dateString += year;
            }
        }
        let englishDateString = dateString.replace('januari', 'january').replace('februari', 'february').replace('maart', 'march').replace('mei', 'may').replace('juni', 'june').replace('juli', 'july').replace('augustus', 'august').replace('oktober', 'october');
        return dateObject = new Date(Date.parse(englishDateString));
    }

    function customHomeworkIcons(activeIcon, activeColor) {
        let icons = {
            'edit': '--fg-warning-normal',
            'homework': '--fg-primary-normal',
            'assignment': '--fg-alternative-normal',
            'test': '--fg-warning-normal',
            'test': '--fg-negative-normal',
            'book': '--fg-warning-normal',
            'clock': '--fg-warning-normal',
            'palm': '--fg-on-positive-weak',
        };
        let iconHTML = '';
        for (const icon of Object.keys(icons)) {
            iconHTML += getIcon(icon, 'mod-homework-icon' + (activeIcon == icon ? ' mod-active' : ''), 'var(' + icons[icon] + ')', 'data-icon="' + icon + '" ');
        }
        const col = window.getComputedStyle(document.documentElement).getPropertyValue('--fg-warning-normal');
        return '<div style="display:flex;margin-top:20px;align-items:center;gap:10px;flex-wrap:wrap;">' + iconHTML + '<label tabindex="0" for="homeworkcolor" style="margin-left:auto;cursor:pointer;">Kleur kiezen</label><input style="display:none;" value="' + ((activeColor && activeColor.startsWith('#')) ? activeColor : col) + '" id="homeworkcolor" type="color"></div>';
    }

       function customHomeworkInner(element, startIndex, recurringTasksEndIndex) {
        if (homeworkBusy) {
            return;
        }
        const currentStudiewijzerDate = ariaLabelToDate(element.classList.contains('week') ? element.nextElementSibling : element);
        const isWeek = !n(element.getElementsByClassName('header')[0]);
        if (n(element.getElementsByClassName('mod-add-homework')[0])) {
            element.insertAdjacentHTML('beforeend', '<div class="mod-add-homework">' + getIcon('plus') + 'Taak toevoegen</div>');
            element.getElementsByClassName('mod-add-homework')[0].addEventListener('click', function () {
                modMessage('Taak toevoegen', 'Voeg je eigen taak toe aan de kalender. De taak wordt alleen in deze ' + (platform == 'Android' ? 'app' : 'browser') + ' opgeslagen.</p>' +
                    '<input id="mod-homework-subject" type="text" placeholder="Vul een vak in"><div class="br"></div><textarea id="mod-homework-description" placeholder="Vul een taak in"></textarea>' +
                    '<div class="mod-multi-choice" id="studiewijzer-afspraak-toevoegen-select"><span class="active" tabindex="0">Eenmalig</span><span tabindex="0">Wekelijks</span>' + (isWeek ? '' : '<span tabindex="0">Maandelijks</span>') + '</div>' +
                    customHomeworkIcons('edit') +
                    '<p>', 'Toevoegen', 'Annuleren');
                for (const element of cn('mod-homework-icon')) {
                    element.addEventListener('click', function () {
                        cn('mod-homework-icon mod-active', 0).classList.remove('mod-active');
                        this.classList.add('mod-active');
                    })
                }
                id('homeworkcolor').addEventListener('input', function () {
                    for (const element of cn('mod-homework-icon')) {
                        element.children[0].setAttribute('fill', this.value);
                    }
                });
                id('mod-message-action1').addEventListener('click', function () {
                    const dateObject = ariaLabelToDate(element.classList.contains('week') ? element.nextElementSibling : element);
                    homework.push({
                        'id': (Math.random() + '' + window.performance.now()).replaceAll('.', ''),
                        'date': dateObject,
                        'subject': id('mod-homework-subject').value,
                        'description': id('mod-homework-description').value,
                        'done': (id('studiewijzer-afspraak-toevoegen-select').children[0].classList.contains('active') ? false : {}),
                        'returning': (id('studiewijzer-afspraak-toevoegen-select').children[1].classList.contains('active') ? '1' : (id('studiewijzer-afspraak-toevoegen-select').children[0].classList.contains('active') ? '0' : '2')),
                        'week': isWeek,
                        'icon': cn('mod-homework-icon mod-active', 0).dataset.icon,
                        'color': cn('mod-homework-icon mod-active', 0).children[0].getAttribute('fill'),
                    });
                                       homework.sort(sortByDate);
                                       for (let i = 0; i < homework.length; i++) {
                        if (homework[i].returning == '0' && (new Date().getFullYear() - new Date(Date.parse(homework[i].date)).getFullYear() >= 2)) {
                            homework.splice(i, 1);
                            i--;
                        }
                    }
                    set('homework', JSON.stringify(homework));
                    execute([customHomework]);
                    closeModMessage();
                });
                id('mod-message-action2').addEventListener('click', closeModMessage);
                for (const element of cn('mod-multi-choice')) {
                    for (const child of element.children) {
                        child.addEventListener('click', function () {
                            if (this.parentElement.getElementsByClassName('active')[0]) {
                                this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                            }
                            this.classList.add('active');
                        });
                    }
                }
            });
        }
        let lastShown = 0;
        if (!isNaN(currentStudiewijzerDate)) {
            function addHomework(j) {
                let i = j;
                let lastRecurring = homework[i].returning;
                const taskId = homework[i].id;
                function updateIndex() {
                    i = 0;
                    for (const homeworkObject of homework) {
                        if (homeworkObject.id == taskId) {
                            break;
                        }
                        else if (i > homework.length) {
                            return;
                        }
                        else {
                            i++;
                        }
                    }
                }
                let homeworkDate = new Date(Date.parse(homework[i].date));
                const showIfOnce = currentStudiewijzerDate.getFullYear() == homeworkDate.getFullYear() && currentStudiewijzerDate.getMonth() == homeworkDate.getMonth() && currentStudiewijzerDate.getDate() == homeworkDate.getDate();
                const showIfWeekly = homework[i].returning == '1' && currentStudiewijzerDate.getTime() >= homeworkDate.getTime() && currentStudiewijzerDate.getDay() == homeworkDate.getDay();
                const showIfMonthly = homework[i].returning == '2' && currentStudiewijzerDate.getTime() >= homeworkDate.getTime() && currentStudiewijzerDate.getDate() == homeworkDate.getDate() && !isWeek;
                if ((showIfOnce || showIfWeekly || showIfMonthly) && n(element.getElementsByClassName('mod-homework-' + homework[i].id)[0]) && ((isWeek && homework[i].week) || (!isWeek && !homework[i].week))) {
                    lastShown = i;
                    let insertElement;
                    const studiewijzerItems = element.getElementsByTagName('sl-studiewijzer-items')[0];
                    if (studiewijzerItems && !studiewijzerItems.classList.contains('mod-added') && studiewijzerItems.childElementCount == 0) {
                        studiewijzerItems.classList.add('mod-added');
                    }
                    else if (n(studiewijzerItems)) {
                        if (element.getElementsByClassName('header')[0]) {
                            element.getElementsByClassName('header')[0].insertAdjacentHTML('afterend', '<sl-studiewijzer-items class="mod-added"></sl-studiewijzer-items>');
                        }
                        else if (element.getElementsByClassName('dag-header')[0]) {
                            element.getElementsByClassName('dag-header')[0].insertAdjacentHTML('afterend', '<sl-studiewijzer-items class="mod-added"></sl-studiewijzer-items>');
                        }
                        else {
                            element.insertAdjacentHTML('beforeend', '<sl-studiewijzer-items class="mod-added mod-rooster"></sl-studiewijzer-items>');
                        }
                    }
                    let done;
                                       if (typeof homework[i].done === 'object') {
                        done = homework[i].done[currentStudiewijzerDate.getTime()] == true;
                    }
                    else {
                        done = homework[i].done;
                    }
                    if (done) {
                        insertElement = element.getElementsByTagName('sl-studiewijzer-items')[0];
                    }
                    else {
                        insertElement = element.getElementsByClassName('header')[0] ? element.getElementsByClassName('header')[0] : (element.getElementsByClassName('dag-header')[0] ? element.getElementsByClassName('dag-header')[0] : element.getElementsByTagName('sl-studiewijzer-items')[0]);
                    }
                    if (!n(insertElement)) {
                        const noMoving = element.getElementsByTagName('sl-studiewijzer-items')[0] && element.getElementsByTagName('sl-studiewijzer-items')[0].classList.contains('mod-rooster');
                        insertElement.insertAdjacentHTML('afterend', '<div class="mod-huiswerk ' + (done ? 'mod-huiswerk-done' : (noMoving ? '' : 'mod-before')) + ' mod-homework-' + homework[i].id + '"' + (homework[i].color ? ' style="border-left-color:' + homework[i].color + '"' : '') + '>' + getIcon(homework[i].icon ? homework[i].icon : 'edit', null, homework[i].color) + '<strong>' + sanitizeString(homework[i].subject) + '</strong><p>' + sanitizeString(homework[i].description) + '</p><div><svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" viewBox="0 0 24 24" display="block"><path fill-rule="evenodd" d="m9.706 21.576 13.876-14.05c.538-.55.56-1.43.044-1.998l-2.769-3.06a1.41 1.41 0 0 0-2.076-.025L9.83 11.858a1.41 1.41 0 0 1-2.06-.01L5.424 9.342a1.414 1.414 0 0 0-2.041-.032l-2.96 2.982a1.45 1.45 0 0 0 .003 2.052l7.27 7.242c.56.555 1.455.552 2.01-.01"></path></svg></div></div>');
                        const homeworkItem = insertElement.nextElementSibling;
                        const homeworkClassName = 'mod-homework-' + homework[i].id;
                        function saveAdjustedHomework(e) {
                            updateIndex();
                            e.stopPropagation();
                            homework[i].subject = id('mod-homework-subject').value;
                            homework[i].description = id('mod-homework-description').value;
                            homework[i].returning = id('studiewijzer-afspraak-toevoegen-select').children[1].classList.contains('active') ? '1' : (id('studiewijzer-afspraak-toevoegen-select').children[0].classList.contains('active') ? '0' : '2');
                            homework[i].icon = cn('mod-homework-icon mod-active', 0).dataset.icon;
                            homework[i].color = cn('mod-homework-icon mod-active', 0).children[0].getAttribute('fill');
                            const isRecurringAdjusted = lastRecurring != homework[i].returning;
                            lastRecurring = homework[i].returning;
                            for (const element of cn(homeworkClassName)) {
                                element.getElementsByTagName('strong')[0].innerHTML = sanitizeString(homework[i].subject);
                                element.getElementsByTagName('p')[0].innerHTML = sanitizeString(homework[i].description);;
                                element.getElementsByTagName('svg')[0].outerHTML = getIcon(homework[i].icon ? homework[i].icon : 'edit', null, homework[i].color);
                                element.style.borderLeftColor = homework[i].color;
                            }
                            set('homework', JSON.stringify(homework));
                            if (isRecurringAdjusted) {
                                homeworkBusy = true;
                                document.querySelectorAll('.' + homeworkClassName).forEach(e => e.remove());
                                homeworkBusy = false;
                            }
                            closeModMessage();
                        }
                        homeworkItem.addEventListener('click', function () {
                            updateIndex();
                            modMessage('', '</p>' +
                                '<input id="mod-homework-subject" type="text" value="' + sanitizeString(homework[i].subject) + '" style="font-weight:700;font-size:20px;margin-top:-20px;"><div class="br"></div>' +
                                '<textarea id="mod-homework-description" oninput="document.getElementById(\'mod-message-action1\').innerHTML = \'Opslaan\';">' + sanitizeString(homework[i].description) + '</textarea>' +
                                '<div class="mod-multi-choice" id="studiewijzer-afspraak-toevoegen-select"><span' + (homework[i].returning == '0' ? ' class="active"' : '') + ' tabindex="0">Eenmalig</span><span' + (homework[i].returning == '1' ? ' class="active"' : '') + ' tabindex="0">Wekelijks</span>' + (isWeek ? '' : '<span' + (homework[i].returning == '2' ? ' class="active"' : '') + ' tabindex="0">Maandelijks</span>') + '</div>' +
                                customHomeworkIcons(homework[i].icon, homework[i].color) +
                                '<p>', 'Sluiten', 'Taak verwijderen', null, true, true);
                            for (const element of cn('mod-homework-icon')) {
                                element.addEventListener('click', function () {
                                    cn('mod-homework-icon mod-active', 0).classList.remove('mod-active');
                                    this.classList.add('mod-active');
                                })
                            }
                            id('homeworkcolor').addEventListener('input', function () {
                                for (const element of cn('mod-homework-icon')) {
                                    element.children[0].setAttribute('fill', this.value);
                                }
                            });
                            id('mod-message-action1').addEventListener('click', saveAdjustedHomework);
                            id('mod-message-action2').addEventListener('click', function (e) {
                                updateIndex();
                                e.stopPropagation();
                                homework.splice(i, 1);
                                set('homework', JSON.stringify(homework));
                                homeworkBusy = true;
                                document.querySelectorAll('.' + homeworkClassName).forEach(e => e.remove());
                                homeworkBusy = false;
                                closeModMessage();
                            });
                            id('mod-message').addEventListener('click', function () {
                                closeModMessage();
                                tn('sl-root', 0).inert = false;
                                if (!n(tn('sl-modal', 0))) {
                                    tn('sl-modal', 0).inert = false;
                                }
                            });
                            for (const element of cn('mod-multi-choice')) {
                                for (const child of element.children) {
                                    child.addEventListener('click', function () {
                                        if (this.parentElement.getElementsByClassName('active')[0]) {
                                            this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                                        }
                                        this.classList.add('active');
                                    });
                                }
                                setHTML(id('mod-message-action1'), 'Opslaan');
                            }
                        });
                        homeworkItem.getElementsByTagName('div')[0].addEventListener('click', function (e) {
                            updateIndex();
                            e.stopPropagation();
                            const noMoving = element.getElementsByTagName('sl-studiewijzer-items')[0] && element.getElementsByTagName('sl-studiewijzer-items')[0].classList.contains('mod-rooster');
                                                                                  if (homeworkItem.classList.contains('mod-huiswerk-done')) {
                                homeworkItem.classList.remove('mod-huiswerk-done');
                                homeworkItem.classList.remove('mod-huiswerk-animation');
                                                               if (typeof homework[i].done === 'object') {
                                    homework[i].done[currentStudiewijzerDate.getTime()] = false;
                                }
                                                               else {
                                    homework[i].done = false;
                                }
                                if (!noMoving) {
                                    if (n(element.getElementsByTagName('sl-studiewijzer-items')[0]) && element.getElementsByClassName('dag-header')[0]) {
                                        element.insertBefore(homeworkItem, element.getElementsByClassName('dag-header')[0].nextSibling);
                                    }
                                    else {
                                        element.insertBefore(homeworkItem, element.getElementsByTagName('sl-studiewijzer-items')[0]);
                                    }
                                    homeworkItem.classList.add('mod-before');
                                }
                            }
                                                                                  else {
                                homeworkItem.classList.add('mod-huiswerk-done');
                                if (!noMoving) {
                                    let nextElement = homeworkItem.nextElementSibling;
                                    let isOnSamePosition = true;
                                                                       if (element.getElementsByTagName('sl-studiewijzer-item').length > 0) {
                                        isOnSamePosition = false;
                                    }
                                    else {
                                                                               let loopBreak = 0;
                                        while (loopBreak < 100 && !nextElement.classList.contains('mod-add-homework')) {
                                            if (nextElement.classList.contains('mod-huiswerk')) {
                                                isOnSamePosition = false;
                                                break;
                                            }
                                            nextElement = nextElement.nextElementSibling;
                                            loopBreak++;
                                        }
                                    }
                                    let hoursToMove = element.getElementsByClassName('mod-huiswerk').length - 1;
                                    hoursToMove += element.getElementsByTagName('sl-studiewijzer-item').length;
                                    if (hoursToMove > 0 && !isOnSamePosition) {
                                        homeworkItem.style.setProperty('--mod-hours-to-move', hoursToMove);
                                        homeworkItem.classList.add('mod-huiswerk-animation');
                                        element.getElementsByClassName('mod-add-homework')[0].insertAdjacentHTML('beforebegin', '<div class="mod-huiswerk mod-placeholder" style="visibility:hidden;"></div>');
                                        homeworkItem.addEventListener('animationend', () => {
                                            if (element.getElementsByClassName('mod-placeholder')[0]) {
                                                element.getElementsByClassName('mod-placeholder')[0].remove();
                                            }
                                        });
                                    }
                                }
                                                               if (typeof homework[i].done === 'object') {
                                    homework[i].done[currentStudiewijzerDate.getTime()] = true;
                                }
                                                               else {
                                    homework[i].done = true;
                                }
                                if (!noMoving) {
                                    element.insertBefore(homeworkItem, element.getElementsByClassName('mod-add-homework')[0]);
                                    homeworkItem.classList.remove('mod-before');
                                }
                            }
                            set('homework', JSON.stringify(homework));
                        });
                    }
                }
                else if (homework[i].returning == '0' && lastShown != 0) {
                    return true;
                }
                return false;
            }
            for (let j = 0; j < recurringTasksEndIndex; j++) {
                if (addHomework(j)) {
                    break;
                }
            }
            for (let j = startIndex; j < homework.length; j++) {
                if (addHomework(j)) {
                    break;
                }
            }
        }
        return lastShown;
    }

       function topMenu() {
        if (get('layout') == 5 && n(id('mod-top-menu'))) {
            tn('body', 0).insertAdjacentHTML('beforeend', '<div id="mod-top-menu"><h2 id="mod-top-menu-title">Titel</h2><div id="mod-logout">' + getIcon("right-from-bracket") + '</div><div id="mod-messages">' + getIcon("envelope") + '</div><div id="mod-profile-link"></div></div>');
            id('mod-profile-link').addEventListener('click', function () {
                cn('menu-avatar', 0).click();
            });
            id('mod-logout').addEventListener('click', function () {
                cn('menu-avatar', 0).click();
                tryRemove(id('mod-top-menu'));
                let checkLogoutButtonPresent = setInterval(function () {
                    if (!n(cn('selector-option uitloggen', 0))) {
                        cn('selector-option uitloggen', 0).click();
                        clearInterval(checkLogoutButtonPresent);
                    }
                }, 10);
            });
            id('mod-messages').addEventListener('click', function () {
                tn('sl-tab-item', 3).click();
            });
        }
        else if (get('layout') != 5) {
            tryRemove(id('mod-top-menu'));
        }
        else if (!n(cn('avatar', 0)) && !n(cn('avatar', 0).getElementsByClassName('foto')[0]) && !n(id('mod-profile-link'))) {
            id('mod-profile-link').innerHTML = '<div>' + (cn('avatar', 0).getElementsByClassName('foto')[0].classList.contains('hidden') ? '<span>' + ((!n(cn('avatar', 0).getElementsByClassName('initials')[0]) && !n(cn('avatar', 0).getElementsByClassName('initials')[0].children[0])) ? cn('avatar', 0).getElementsByClassName('initials')[0].children[0].innerHTML : '?') + '</span>' : '<img src="' + (n(get('profilepic')) ? cn('avatar', 0).getElementsByClassName('foto')[0].src : get('profilepic')) + '" />') + '</div>';
        }
        if (!n(id('mod-top-menu-title'))) {
            let headerText = '';
            for (const element of tn('sl-tab-item')) {
                if (element.classList.contains('active')) {
                    headerText = element.getElementsByTagName('span')[0].innerHTML;
                }
            }
            if (n(headerText)) {
                if (!n(cn('desktop-title', 0))) {
                    headerText = cn('desktop-title', 0).innerHTML;
                }
                else if (!n(tn('sl-scrollable-title', 0))) {
                    headerText = tn('sl-scrollable-title', 0).innerHTML;
                }
            }
            id('mod-top-menu-title').innerHTML = headerText;
        }
    }

       function gradeReveal() {
        if (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) != '0') {
            if (!n(tn('sl-laatsteresultaten', 0)) && !n(tn('sl-resultaat-item', 0))) {
                let i = 0;
                const lastGrade = get('lastgrade');
                const lastGradeTitle = get('lastgradetitle');
                const lastGradeDescription = get('lastgradedescription');
                for (const element of cn('cijfer')) {
                    if (element.classList.contains('mod-animation-finished')) {
                        break;
                    }
                    if (!n(element.children[0])) {
                        if (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) == '1' && (element.children[0].innerHTML == lastGrade && (n(element.parentElement.parentElement.parentElement.getElementsByClassName('titel')[0]) || element.parentElement.parentElement.parentElement.getElementsByClassName('titel')[0].innerHTML == lastGradeTitle) && (n(element.parentElement.parentElement.parentElement.getElementsByClassName('subtitel')[0]) || element.parentElement.parentElement.parentElement.getElementsByClassName('subtitel')[0].innerHTML.split('• ')[1] == lastGradeDescription))) {
                            break;
                        }
                        else if (i == 0) {
                            set('lastgrade', element.children[0].innerHTML);
                            set('lastgradetitle', element.parentElement.parentElement.parentElement.getElementsByClassName('titel')[0].innerHTML);
                            set('lastgradedescription', element.parentElement.parentElement.parentElement.getElementsByClassName('subtitel')[0].innerHTML.split('• ')[1]);
                        }
                        if (!isNaN(parseFloat(element.children[0].innerHTML))) {
                            countanimation(element.children[0], 0, parseFloat(element.children[0].innerHTML.replace(',', '.')), 2500, 50);
                        }
                        element.classList.add('mod-animation-finished');
                        i++;
                    }
                }
            }
        }
    }

       function countanimation(element, begin, target, time, update, exact) {
        let value;
        if (exact == undefined) {
            value = begin;
        } else {
            value = exact;
        }
        value = value + (target - begin) / (time / update);
        if (value >= target && begin <= target || value <= target && begin >= target) {
            element.innerHTML = target.toFixed(1).replace('.', ',');
        } else {
            exact = value;
            element.innerHTML = value.toFixed(1).replace('.', ',');
            setTimeout(countanimation, update, element, begin, target, time, update, exact);
        }
    }

    const settingKeys = ['primarycolor', 'secondarycolor', 'nicknames', 'bools', 'title', 'icon', 'background', 'backgroundtype', 'backgroundcolor', 'transparency', 'ui', 'uiblur', 'fontname', 'theme', 'layout', 'profilepic', 'username', 'brightness', 'contrast', 'saturate', 'opacity', 'huerotate', 'grayscale', 'sepia', 'invert', 'blur', 'homework', 'menuwidth', 'isbackgroundvideo', 'customfont', 'customfontname', 'letterbeoordelingen'];
    function exportSettings() {
        let settings = {};
        for (const key of settingKeys) {
            settings[key] = get(key);
        }
        let i = 0;
        while (!n(get('background' + i))) {
            settings['background' + i] = get('background' + i);
            i++;
        }
        let json = JSON.stringify(settings);
        let saveData = (function () {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            return function (fileName) {
                var blob = new Blob([json], { type: "octet/stream" }),
                    url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            };
        }());

        saveData('config.json');
    }

    function parseJSON(str) {
        let json;
        try {
            json = JSON.parse(str);
        } catch (e) {
            return null;
        }
        return json;
    }

       async function keyIsValid(key, value) {
        if (value == null) {
            return false;
        }
        if (key == 'primarycolor' || key == 'secondarycolor' || key == 'backgroundcolor') {
            return /^#[0-9a-fA-F]{6}${"$"}/.test(value);
        }
        else if (key == 'bools') {
            return /^(0|1){18,}${"$"}/.test(value);
        }
        else if (key == 'ui' || key == 'uiblur') {
            return value >= 0 && value <= 100;
        }
        else if (key == 'menuwidth') {
            return value >= 50 && value <= 700;
        }
        else if (key == 'brightness' || key == 'contrast' || key == 'saturate' || key == 'opacity' || key == 'grayscale' || key == 'sepia' || key == 'invert') {
            return /^\d+%${"$"}/.test(value);
        }
        else if (key == 'huerotate') {
            return /^\d+deg${"$"}/.test(value);
        }
        else if (key == 'blur') {
            return /^\d+(\.\d+)?px${"$"}/.test(value);
        }
        else if (key == 'layout') {
            return value >= 1 && value <= 5;
        }
        else if (key == 'nicknames') {
            const json = parseJSON(value);
            if (json === null || !(json instanceof Array)) {
                return false;
            }
            let mayContainHTMLTag = false;
            let i = 0;
            for (const nickname of json) {
                if (nickname.length != 2 && nickname.length != 3) {
                    return false;
                }
                if (/<\/?[a-z][\s\S]*>/i.test(nickname[0]) || /<\/?[a-z][\s\S]*>/i.test(nickname[1])) {
                    mayContainHTMLTag = true;
                    json[i][0] = sanitizeString(nickname[0]);
                    json[i][1] = sanitizeString(nickname[1]);
                    if (nickname.length == 3 && /<\/?[a-z][\s\S]*>/i.test(nickname[2])) {
                        json[i][2] = sanitizeString(nickname[2]);
                    }
                }
                i++;
            }
            if (mayContainHTMLTag) {
                while (id('mod-message')) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                modMessage('Onveilige instellingswaarde', 'Het lijkt erop dat de instellingswaarde voor "Nicknames" HTML-elementen bevat, waarmee er onveilige code op je computer uitgevoerd kan worden. Wil je deze HTML elementen weghalen voor de veiligheid?', 'Weghalen', 'Behouden', false, true);
                id('mod-message-action1').addEventListener('click', function () {
                    set('nicknames', JSON.stringify(json));
                    closeModMessage();
                    saveReload(true);
                    tn('sl-root', 0).inert = false;
                    if (!n(tn('sl-modal', 0))) {
                        tn('sl-modal', 0).inert = false;
                    }
                });
                id('mod-message-action2').addEventListener('click', function () {
                    set('nicknames', value);
                    closeModMessage();
                    saveReload(true);
                    tn('sl-root', 0).inert = false;
                    if (!n(tn('sl-modal', 0))) {
                        tn('sl-modal', 0).inert = false;
                    }
                });
                return null;
            }
            return true;
        }
        else if (key == 'username') {
            if (/<\/?[a-z][\s\S]*>/i.test(value)) {
                while (id('mod-message')) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                modMessage('Onveilige instellingswaarde', 'Het lijkt erop dat de instellingswaarde voor "Username" HTML-elementen bevat, waarmee er onveilige code op je computer uitgevoerd kan worden. Wil je deze HTML elementen weghalen voor de veiligheid?', 'Weghalen', 'Behouden', false, true);
                id('mod-message-action1').addEventListener('click', function () {
                    set('username', sanitizeString(value));
                    closeModMessage();
                    saveReload(true);
                    tn('sl-root', 0).inert = false;
                    if (!n(tn('sl-modal', 0))) {
                        tn('sl-modal', 0).inert = false;
                    }
                });
                id('mod-message-action2').addEventListener('click', function () {
                    set('username', value);
                    closeModMessage();
                    saveReload(true);
                    tn('sl-root', 0).inert = false;
                    if (!n(tn('sl-modal', 0))) {
                        tn('sl-modal', 0).inert = false;
                    }
                });
                return null;
            }
            return true;
        }
        else if (key == 'homework' || key == 'letterbeoordelingen') {
            return parseJSON(value) !== null;
        }
        else if (key == 'icon' || key == 'background' || key == 'profilepic' || key == 'customfont') {
            return value.startsWith('data:');
        }
        else if (key == 'backgroundtype') {
            return (value == 'image' || value == 'color' || value == 'slideshow' || value == 'live');
        }
        else if (key == 'fontname') {
            return fonts.includes(value);
        }
        else if (key == 'isbackgroundvideo') {
            return (value === true || value === false || value === 'true' || value === 'false');
        }

        return true;
    }

    async function importSettings() {
        execute([reset]);
        new Response(this.files[0]).json().then(json => {
            let closeModMessages = true;
            modMessage('Laden...', 'Dit kan even duren als je veel afbeeldingen hebt ingesteld...');
            Object.keys(json).forEach(async function (key) {
                if (settingKeys.includes(key)) {
                    const isValid = await keyIsValid(key, json[key]);
                    if (isValid) {
                        set(key, json[key]);
                    }
                    else if (isValid === null) {
                        closeModMessages = false;
                    }
                }
            });
            saveReload(true);
            tn('sl-root', 0).inert = false;
            if (!n(tn('sl-modal', 0))) {
                tn('sl-modal', 0).inert = false;
            }
            if (closeModMessages) {
                closeModMessage();
            }
                       setTimeout(function () {
                saveReload(true);
            }, 1000);
        }, err => {
            modMessage('Oeps...', 'Het lijkt erop dat dit bestand ongeldig is.', 'Oke');
            id('mod-message-action1').addEventListener('click', closeModMessage);
        });
    }

   
(function(c,u){typeof exports=="object"&&typeof module<"u"?u(exports):typeof define=="function"&&define.amd?define(["exports"],u):(c=typeof globalThis<"u"?globalThis:c||self,u(c.Fireworks={}))})(this,function(c){"use strict";function u(e){return Math.abs(Math.floor(e))}function p(e,t){return Math.random()*(t-e)+e}function o(e,t){return Math.floor(p(e,t+1))}function g(e,t,i,s){const n=Math.pow;return Math.sqrt(n(e-i,2)+n(t-s,2))}function f(e,t,i=1){if(e>360||e<0)throw new Error(`Expected hue 0-360 range, got \`${"$"}{e}\``);if(t>100||t<0)throw new Error(`Expected lightness 0-100 range, got \`${"$"}{t}\``);if(i>1||i<0)throw new Error(`Expected alpha 0-1 range, got \`${"$"}{i}\``);return`hsla(${"$"}{e}, 100%, ${"$"}{t}%, ${"$"}{i})`}const v=e=>{if(typeof e=="object"&&e!==null){if(typeof Object.getPrototypeOf=="function"){const t=Object.getPrototypeOf(e);return t===Object.prototype||t===null}return Object.prototype.toString.call(e)==="[object Object]"}return!1},b=["__proto__","constructor","prototype"],w=(...e)=>e.reduce((t,i)=>(Object.keys(i).forEach(s=>{b.includes(s)||(Array.isArray(t[s])&&Array.isArray(i[s])?t[s]=i[s]:v(t[s])&&v(i[s])?t[s]=w(t[s],i[s]):t[s]=i[s])}),t),{});function S(e,t){let i;return(...s)=>{i&&clearTimeout(i),i=setTimeout(()=>e(...s),t)}}class O{x;y;ctx;hue;friction;gravity;flickering;lineWidth;explosionLength;angle;speed;brightness;coordinates=[];decay;alpha=1;constructor({x:t,y:i,ctx:s,hue:n,decay:h,gravity:a,friction:r,brightness:l,flickering:d,lineWidth:x,explosionLength:m}){for(this.x=t,this.y=i,this.ctx=s,this.hue=n,this.gravity=a,this.friction=r,this.flickering=d,this.lineWidth=x,this.explosionLength=m,this.angle=p(0,Math.PI*2),this.speed=o(1,10),this.brightness=o(l.min,l.max),this.decay=p(h.min,h.max);this.explosionLength--;)this.coordinates.push([t,i])}update(t){this.coordinates.pop(),this.coordinates.unshift([this.x,this.y]),this.speed*=this.friction,this.x+=Math.cos(this.angle)*this.speed,this.y+=Math.sin(this.angle)*this.speed+this.gravity,this.alpha-=this.decay,this.alpha<=this.decay&&t()}draw(){const t=this.coordinates.length-1;this.ctx.beginPath(),this.ctx.lineWidth=this.lineWidth,this.ctx.fillStyle=f(this.hue,this.brightness,this.alpha),this.ctx.moveTo(this.coordinates[t][0],this.coordinates[t][1]),this.ctx.lineTo(this.x,this.y),this.ctx.strokeStyle=f(this.hue,this.flickering?p(0,this.brightness):this.brightness,this.alpha),this.ctx.stroke()}}class E{constructor(t,i){this.options=t,this.canvas=i,this.pointerDown=this.pointerDown.bind(this),this.pointerUp=this.pointerUp.bind(this),this.pointerMove=this.pointerMove.bind(this)}active=!1;x;y;get mouseOptions(){return this.options.mouse}mount(){this.canvas.addEventListener("pointerdown",this.pointerDown),this.canvas.addEventListener("pointerup",this.pointerUp),this.canvas.addEventListener("pointermove",this.pointerMove)}unmount(){this.canvas.removeEventListener("pointerdown",this.pointerDown),this.canvas.removeEventListener("pointerup",this.pointerUp),this.canvas.removeEventListener("pointermove",this.pointerMove)}usePointer(t,i){const{click:s,move:n}=this.mouseOptions;(s||n)&&(this.x=t.pageX-this.canvas.offsetLeft,this.y=t.pageY-this.canvas.offsetTop,this.active=i)}pointerDown(t){this.usePointer(t,this.mouseOptions.click)}pointerUp(t){this.usePointer(t,!1)}pointerMove(t){this.usePointer(t,this.active)}}class M{hue;rocketsPoint;opacity;acceleration;friction;gravity;particles;explosion;mouse;boundaries;sound;delay;brightness;decay;flickering;intensity;traceLength;traceSpeed;lineWidth;lineStyle;autoresize;constructor(){this.autoresize=!0,this.lineStyle="round",this.flickering=50,this.traceLength=3,this.traceSpeed=10,this.intensity=30,this.explosion=5,this.gravity=1.5,this.opacity=.5,this.particles=50,this.friction=.95,this.acceleration=1.05,this.hue={min:0,max:360},this.rocketsPoint={min:50,max:50},this.lineWidth={explosion:{min:1,max:3},trace:{min:1,max:2}},this.mouse={click:!1,move:!1,max:1},this.delay={min:30,max:60},this.brightness={min:50,max:80},this.decay={min:.015,max:.03},this.sound={enabled:!1,files:["explosion0.mp3","explosion1.mp3","explosion2.mp3"],volume:{min:4,max:8}},this.boundaries={debug:!1,height:0,width:0,x:50,y:50}}update(t){Object.assign(this,w(this,t))}}class z{constructor(t,i){this.options=t,this.render=i}tick=0;rafId=0;fps=60;tolerance=.1;now;mount(){this.now=performance.now();const t=1e3/this.fps,i=s=>{this.rafId=requestAnimationFrame(i);const n=s-this.now;n>=t-this.tolerance&&(this.render(),this.now=s-n%t,this.tick+=n*(this.options.intensity*Math.PI)/1e3)};this.rafId=requestAnimationFrame(i)}unmount(){cancelAnimationFrame(this.rafId)}}class L{constructor(t,i,s){this.options=t,this.updateSize=i,this.container=s}resizer;mount(){if(!this.resizer){const t=S(()=>this.updateSize(),100);this.resizer=new ResizeObserver(t)}this.options.autoresize&&this.resizer.observe(this.container)}unmount(){this.resizer&&this.resizer.unobserve(this.container)}}class T{constructor(t){this.options=t,this.init()}buffers=[];audioContext;onInit=!1;get isEnabled(){return this.options.sound.enabled}get soundOptions(){return this.options.sound}init(){!this.onInit&&this.isEnabled&&(this.onInit=!0,this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.loadSounds())}async loadSounds(){for(const t of this.soundOptions.files){const i=await(await fetch(t)).arrayBuffer();this.audioContext.decodeAudioData(i).then(s=>{this.buffers.push(s)}).catch(s=>{throw s})}}play(){if(this.isEnabled&&this.buffers.length){const t=this.audioContext.createBufferSource(),i=this.buffers[o(0,this.buffers.length-1)],s=this.audioContext.createGain();t.buffer=i,s.gain.value=p(this.soundOptions.volume.min/100,this.soundOptions.volume.max/100),s.connect(this.audioContext.destination),t.connect(s),t.start(0)}else this.init()}}class C{x;y;sx;sy;dx;dy;ctx;hue;speed;acceleration;traceLength;totalDistance;angle;brightness;coordinates=[];currentDistance=0;constructor({x:t,y:i,dx:s,dy:n,ctx:h,hue:a,speed:r,traceLength:l,acceleration:d}){for(this.x=t,this.y=i,this.sx=t,this.sy=i,this.dx=s,this.dy=n,this.ctx=h,this.hue=a,this.speed=r,this.traceLength=l,this.acceleration=d,this.totalDistance=g(t,i,s,n),this.angle=Math.atan2(n-i,s-t),this.brightness=o(50,70);this.traceLength--;)this.coordinates.push([t,i])}update(t){this.coordinates.pop(),this.coordinates.unshift([this.x,this.y]),this.speed*=this.acceleration;const i=Math.cos(this.angle)*this.speed,s=Math.sin(this.angle)*this.speed;this.currentDistance=g(this.sx,this.sy,this.x+i,this.y+s),this.currentDistance>=this.totalDistance?t(this.dx,this.dy,this.hue):(this.x+=i,this.y+=s)}draw(){const t=this.coordinates.length-1;this.ctx.beginPath(),this.ctx.moveTo(this.coordinates[t][0],this.coordinates[t][1]),this.ctx.lineTo(this.x,this.y),this.ctx.strokeStyle=f(this.hue,this.brightness),this.ctx.stroke()}}class y{target;container;canvas;ctx;width;height;traces=[];explosions=[];waitStopRaf;running=!1;opts;sound;resize;mouse;raf;constructor(t,i={}){this.target=t,this.container=t,this.opts=new M,this.createCanvas(this.target),this.updateOptions(i),this.sound=new T(this.opts),this.resize=new L(this.opts,this.updateSize.bind(this),this.container),this.mouse=new E(this.opts,this.canvas),this.raf=new z(this.opts,this.render.bind(this))}get isRunning(){return this.running}get version(){return"2.10.8"}get currentOptions(){return this.opts}start(){this.running||(this.canvas.isConnected||this.createCanvas(this.target),this.running=!0,this.resize.mount(),this.mouse.mount(),this.raf.mount())}stop(t=!1){this.running&&(this.running=!1,this.resize.unmount(),this.mouse.unmount(),this.raf.unmount(),this.clear(),t&&this.canvas.remove())}async waitStop(t){if(this.running)return new Promise(i=>{this.waitStopRaf=()=>{this.waitStopRaf&&(requestAnimationFrame(this.waitStopRaf),!this.traces.length&&!this.explosions.length&&(this.waitStopRaf=null,this.stop(t),i()))},this.waitStopRaf()})}pause(){this.running=!this.running,this.running?this.raf.mount():this.raf.unmount()}clear(){this.ctx&&(this.traces=[],this.explosions=[],this.ctx.clearRect(0,0,this.width,this.height))}launch(t=1){for(let i=0;i<t;i++)this.createTrace();this.waitStopRaf||(this.start(),this.waitStop())}updateOptions(t){this.opts.update(t)}updateSize({width:t=this.container.clientWidth,height:i=this.container.clientHeight}={}){this.width=t,this.height=i,this.canvas.width=t,this.canvas.height=i,this.updateBoundaries({...this.opts.boundaries,width:t,height:i})}updateBoundaries(t){this.updateOptions({boundaries:t})}createCanvas(t){t instanceof HTMLCanvasElement?(t.isConnected||document.body.append(t),this.canvas=t):(this.canvas=document.createElement("canvas"),this.container.append(this.canvas)),this.ctx=this.canvas.getContext("2d"),this.updateSize()}render(){if(!this.ctx||!this.running)return;const{opacity:t,lineStyle:i,lineWidth:s}=this.opts;this.ctx.globalCompositeOperation="destination-out",this.ctx.fillStyle=`rgba(0, 0, 0, ${"$"}{t})`,this.ctx.fillRect(0,0,this.width,this.height),this.ctx.globalCompositeOperation="lighter",this.ctx.lineCap=i,this.ctx.lineJoin="round",this.ctx.lineWidth=p(s.trace.min,s.trace.max),this.initTrace(),this.drawTrace(),this.drawExplosion()}createTrace(){const{hue:t,rocketsPoint:i,boundaries:s,traceLength:n,traceSpeed:h,acceleration:a,mouse:r}=this.opts;this.traces.push(new C({x:this.width*o(i.min,i.max)/100,y:this.height,dx:this.mouse.x&&r.move||this.mouse.active?this.mouse.x:o(s.x,s.width-s.x*2),dy:this.mouse.y&&r.move||this.mouse.active?this.mouse.y:o(s.y,s.height*.5),ctx:this.ctx,hue:o(t.min,t.max),speed:h,acceleration:a,traceLength:u(n)}))}initTrace(){if(this.waitStopRaf)return;const{delay:t,mouse:i}=this.opts;(this.raf.tick>o(t.min,t.max)||this.mouse.active&&i.max>this.traces.length)&&(this.createTrace(),this.raf.tick=0)}drawTrace(){let t=this.traces.length;for(;t--;)this.traces[t].draw(),this.traces[t].update((i,s,n)=>{this.initExplosion(i,s,n),this.sound.play(),this.traces.splice(t,1)})}initExplosion(t,i,s){const{particles:n,flickering:h,lineWidth:a,explosion:r,brightness:l,friction:d,gravity:x,decay:m}=this.opts;let P=u(n);for(;P--;)this.explosions.push(new O({x:t,y:i,ctx:this.ctx,hue:s,friction:d,gravity:x,flickering:o(0,100)<=h,lineWidth:p(a.explosion.min,a.explosion.max),explosionLength:u(r),brightness:l,decay:m}))}drawExplosion(){let t=this.explosions.length;for(;t--;)this.explosions[t].draw(),this.explosions[t].update(()=>{this.explosions.splice(t,1)})}}c.Fireworks=y,c.default=y,Object.defineProperties(c,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});


       let newYearCountdownClosed = false;
    function newYearCountdown() {
        const now = new Date();
        const newYear = new Date(now.getFullYear() + 1, 0, 1);
        const diff = newYear - now;
        if ((ignoreCountdownConditions || (get('bools').charAt(BOOL_INDEX.EVENTS) == '1' && Math.floor(diff / (1000 * 60 * 60 * 24)) <= 7)) && !newYearCountdownClosed && !id('mod-new-year')) {
            const rosterContainer = document.querySelector('sl-rooster-weken');
            if (rosterContainer) {
                const parent = document.createElement('div');
                parent.id = 'mod-new-year';
                const div = document.createElement('div');
                div.id = 'mod-new-year-fireworks';
                parent.appendChild(div);
                const button = document.createElement('button');
                button.innerHTML = '&times;';
                button.addEventListener('click', function () {
                    newYearCountdownClosed = true;
                    this.parentElement.style.height = '0px';
                    this.parentElement.style.padding = '0px';
                    setTimeout(function () {
                        if (this && this.parentElement) {
                            this.parentElement.remove();
                        }
                    }, 500);
                });
                parent.appendChild(button);
                const h3 = document.createElement('h3');
                h3.innerText = 'Aftellen tot het nieuwe jaar!';

                const yearDuration = (1000 * 60 * 60 * 24 * 365.25);
                let texts = [
                    'Wat is jouw goede voornemen?',
                    'Ga jij volgend jaar voor de 10\'en?',
                    'Al bijna nieuwjaar!',
                    'KERSTVAKANTIE!!! (en bijna nieuwjaar dus)',
                    'Al zin in volgend jaar?',
                    'Wat ga je doen in de vakantie?',
                    'Neem tijd voor zelfreflectie en ga gamen ofzo',
                    'Alvast een fijne kerst en gelukkig nieuwjaar!',
                    'Ga naar buiten en gooi een sneeuwbal (of aardebal als er geen sneeuw ligt)',
                    'OLIEBOLLEN ZIJN LEKKER!!!',
                    'Op {percentage}% van dit jaar',
                    'Als je je huiswerk verbrandt, is het dan vuurwerk?',
                    'Vanaf 1 januari is het {next_year}',
                    'Volgend jaar wordt minstens 10x beter',
                    'Nog ongeveer {seconds_to_next_year} seconden',
                    'Over ≈{seconds_to_next_year} seconden is {year} voorbij',
                    'Nog maar even...'
                ];
                let current;

                setInterval(function () {
                    const now = new Date();
                    const diff = newYear - now;
                    if (diff <= 0) {
                        return;
                    }
                    let random = Math.floor(Math.random() * texts.length);
                    while (current == random) {
                        random = Math.floor(Math.random() * texts.length);
                    }
                    current = random;
                    h3.innerText = texts[current]
                        .replace('{percentage}', ((yearDuration - diff) / yearDuration * 100).toFixed(3).replace('.', ','))
                        .replace('{seconds_to_next_year}', Math.round(diff / 1000))
                        .replace('{next_year}', now.getFullYear() + 1)
                        .replace('{year}', now.getFullYear());
                    h3.classList.add('mod-letter-slide');
                    setTimeout(function () {
                        h3.classList.remove('mod-letter-slide');
                    }, 500);
                }, 10000);

                parent.appendChild(h3);
                const countdownElement = document.createElement('div');
                for (let i = 0; i < 4; i++) {
                    const div = document.createElement('div');
                    const p = document.createElement('p');
                    div.appendChild(p);
                    const span = document.createElement('span');
                    div.appendChild(span);
                    countdownElement.appendChild(div);
                }
                parent.appendChild(countdownElement);
                rosterContainer.parentElement.insertAdjacentElement('beforebegin', parent);
                const fireworks = new Fireworks.default(id('mod-new-year-fireworks'), {
                    intensity: 12,
                    traceSpeed: 7,
                });
                fireworks.start();
                window.addEventListener('visibilitychange', function () {
                    if (document.visibilityState === 'hidden') {
                        fireworks.stop();
                    }
                    else {
                        fireworks.start();
                    }
                });

                const p1 = countdownElement.children[0].getElementsByTagName('p')[0];
                const p2 = countdownElement.children[1].getElementsByTagName('p')[0];
                const p3 = countdownElement.children[2].getElementsByTagName('p')[0];
                const p4 = countdownElement.children[3].getElementsByTagName('p')[0];
                function updateCountdown() {
                    const now = new Date();
                    const diff = newYear - now;

                    const days = Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0);
                    const hours = Math.max(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), 0);
                    const minutes = Math.max(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), 0);
                    const seconds = Math.max(Math.floor((diff % (1000 * 60)) / 1000), 0);

                    if (p1.innerText !== days.toString()) {
                        p1.classList.add('mod-letter-slide');
                        p1.innerText = days;
                        countdownElement.children[0].getElementsByTagName('span')[0].innerText = days == 1 ? 'dag' : 'dagen';
                        setTimeout(function () {
                            p1.classList.remove('mod-letter-slide');
                        }, 500);
                    }
                    if (p2.innerText !== hours.toString()) {
                        p2.classList.add('mod-letter-slide');
                        p2.innerText = hours;
                        countdownElement.children[1].getElementsByTagName('span')[0].innerText = hours == 1 ? 'uur' : 'uren';
                        setTimeout(function () {
                            p2.classList.remove('mod-letter-slide');
                        }, 500);
                    }
                    if (p3.innerText !== minutes.toString()) {
                        p3.classList.add('mod-letter-slide');
                        p3.innerText = minutes;
                        countdownElement.children[2].getElementsByTagName('span')[0].innerText = minutes == 1 ? 'minuut' : 'minuten';
                        setTimeout(function () {
                            p3.classList.remove('mod-letter-slide');
                        }, 500);
                    }
                    if (p4.innerText !== seconds.toString()) {
                        p4.classList.add('mod-letter-slide');
                        p4.innerText = seconds;
                        countdownElement.children[3].getElementsByTagName('span')[0].innerText = seconds == 1 ? 'seconde' : 'seconden';
                        setTimeout(function () {
                            p4.classList.remove('mod-letter-slide');
                        }, 500);
                    }

                                       if (days == 0 && hours == 0 && minutes == 0 && seconds == 0 && !id('mod-fireworks')) {
                        h3.innerText = 'GELUKKIG NIEUWJAAR!';
                        const fireworkElement = document.createElement('div');
                        fireworkElement.id = 'mod-fireworks';
                        rosterContainer.insertAdjacentElement('beforebegin', fireworkElement);
                        const fireworks = new Fireworks.default(fireworkElement);
                        fireworks.start();
                        startConfetti();
                        window.addEventListener('visibilitychange', function () {
                            if (document.visibilityState === 'hidden') {
                                fireworks.stop();
                            }
                            else {
                                fireworks.start();
                            }
                        });
                    }
                }

                setInterval(updateCountdown, 1000);
                updateCountdown();
            }
        }
    }

       let timeIndicatorTop = 0;
    let normalRosterHeight = 0;
    function rosterSimplify() {
               execute([customHomework]);
               if (get('bools').charAt(BOOL_INDEX.ROSTER_SIMPLIFY) == "1" && !n(tn('sl-rooster-weken', 0))) {
            if (!n(cn('tertiary normal action-primary-normal center', 0)) && !cn('tertiary normal action-primary-normal center', 0).classList.contains('mod-vandaag-button-event-listener-added')) {
                                              cn('tertiary normal action-primary-normal center', 0).addEventListener('click', function () {
                    setTimeout(rosterSimplify, 5000);
                    setTimeout(rosterSimplify, 10000);
                });
                cn('tertiary normal action-primary-normal center', 0).classList.add('mod-vandaag-button-event-listener-added');
            }
            tn('sl-rooster-weken', 0).style.minHeight = 'calc(100vh - 175px)';
                       normalRosterHeight = Math.max(tn('sl-rooster-weken', 0).clientHeight, normalRosterHeight);
                       let currentTime = today.getHours() + (today.getMinutes() / 60);
            for (const parent of tn('sl-rooster-week')) {
                const isWeekShown = !parent.ariaHidden;
                let shouldUpdate = true;
                               for (const element of parent.getElementsByTagName('sl-rooster-item')) {
                    if (n(element.getElementsByClassName('opacity-80')[0]) || element.getElementsByClassName('opacity-80')[0].innerHTML.length == 0 || isNaN(parseInt(element.getElementsByClassName('opacity-80')[0].innerHTML.charAt(0)))) {
                        if (isWeekShown) {
                            tn('sl-rooster-weken', 0).style.height = normalRosterHeight + 'px';
                            tn('sl-rooster-weken', 0).style.overflowY = 'visible';
                                                       if (!n(tn('sl-rooster-tijden', 0))) {
                                let i = 0;
                                for (const element of tn('sl-rooster-tijden', 0).children) {
                                    const span = element.getElementsByTagName('span')[0];
                                    if (!n(span) && !n(span.dataset.modOriginalContent)) {
                                        setHTML(span, span.dataset.modOriginalContent);
                                    }
                                    i++;
                                }
                            }
                        }
                        shouldUpdate = false;
                    }
                }
                if (shouldUpdate) {
                    let timeIndicatorPositioned = false;
                                       if (isWeekShown && !n(cn('tijdlijn', 0))) {
                        let elements = cn('tijdlijn', 0).parentElement.getElementsByTagName('sl-rooster-item');
                        if (!n(elements[0]) && !n(elements[elements.length - 1].getElementsByClassName('opacity-80')[0])) {
                                                       let hour = elements[elements.length - 1].getElementsByClassName('opacity-80')[0].innerHTML;
                            hour = parseInt(hour.substring(0, hour.length - 1));
                                                       let lastHourTop = elements[elements.length - 1].style.top;
                            lastHourTop = parseInt(lastHourTop.substring(0, lastHourTop.length - 2));
                                                       timeIndicatorTop = cn('tijdlijn', 0).style.top;
                            timeIndicatorTop = parseInt(timeIndicatorTop.substring(0, timeIndicatorTop.length - 2));
                                                       if (!isNaN(hour) && !isNaN(lastHourTop) && !isNaN(timeIndicatorTop) && lastHourTop < timeIndicatorTop) {
                                cn('tijdlijn', 0).style.top = (hour * 84) + 'px';
                                timeIndicatorTop = (hour * 84);
                                timeIndicatorPositioned = true;
                            }
                        }
                    }
                                       let prevHour = 1;
                    let prevHeight = 0;
                    let lastHour = 1;
                    for (const element of parent.getElementsByTagName('sl-rooster-item')) {
                        if (!n(element.getElementsByClassName('opacity-80')[0]) && !n(element.getElementsByClassName('opacity-80')[0].parentElement.children[1])) {
                            let hour = element.getElementsByClassName('opacity-80')[0].innerHTML;
                            hour = parseInt(hour.substring(0, hour.length - 1));
                            let lessonTime = element.getElementsByClassName('opacity-80')[0].parentElement.children[1].innerHTML.split(':');
                            lessonTime = parseFloat(lessonTime[0]) + (parseFloat(lessonTime[1]) / 60);
                            let top;
                            if (isNaN(hour)) {
                                top = prevHour * 84 + prevHeight - 84;
                                prevHour++;
                                if (prevHour > lastHour) {
                                    lastHour = prevHour;
                                }
                            }
                            else {
                                prevHour = hour;
                                top = hour * 84 - 84;
                                if (hour > lastHour) {
                                    lastHour = hour;
                                }
                            }
                            element.style.top = top + 'px';
                            if (isWeekShown && !isNaN(lessonTime) && !n(cn('tijdlijn', 0)) && (currentTime < lessonTime) && !timeIndicatorPositioned && !n(element.parentElement.getElementsByClassName('tijdlijn')[0])) {
                                if (!n(cn('tijdlijn', 0))) {
                                    cn('tijdlijn', 0).style.top = top + 'px';
                                }
                                timeIndicatorTop = top;
                                timeIndicatorPositioned = true;
                            }
                            prevHeight = element.clientHeight;
                        }
                    }
                    if (isWeekShown) {
                        tn('sl-rooster-weken', 0).style.height = (Math.max(lastHour + 2, 5) * 84 - 54) + 'px';
                        tn('sl-rooster-weken', 0).style.overflowY = 'hidden';
                    }
                    if (!n(tn('sl-vakantie-header', 0))) {
                        tn('sl-vakantie-header', 0).style.borderTop = 'none';
                    }
                                       if (isWeekShown && !n(tn('sl-rooster-tijden', 0))) {
                        let i = 1;
                        for (const element of tn('sl-rooster-tijden', 0).children) {
                            let span = element.getElementsByTagName('span')[0];
                            if (n(span)) {
                                if (!n(tn('sl-rooster-tijden', 0).children[1])) {
                                    setHTML(element, tn('sl-rooster-tijden', 0).children[1].innerHTML);
                                    span = element.getElementsByTagName('span')[0];
                                    setHTML(span, ' ');
                                }
                            }
                            if (!n(span)) {
                                if (span.innerHTML.indexOf('uur') == -1) {
                                    span.dataset.modOriginalContent = span.innerHTML;
                                }
                                setHTML(span, i.toString() + 'e uur');
                            }
                            i++;
                        }
                    }
                }
            }
        }
    }

       function style() {
        if (getRelativeLuminance(hexToRgb(get('primarycolor'))) >= 240) {
            menuColor = adjust(get('primarycolor'), -170);
        } else if (getRelativeLuminance(hexToRgb(get('primarycolor'))) >= 160) {
            menuColor = adjust(get('primarycolor'), -110);
        } else {
            menuColor = '#fff';
        }
        if (getRelativeLuminance(hexToRgb(get('primarycolor'))) >= 160) {
            highLightColor = adjust(get('primarycolor'), -35);
        } else {
            highLightColor = adjust(get('primarycolor'), 35);
        }
        while (!n(cn('mod-style', 0))) {
            cn('mod-style', 0).remove();
        }
        if (get('bools').charAt(BOOL_INDEX.SCROLLBAR) == '0') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">html, body{scrollbar-width:none !important;}</style>');
        }
        if (get('bools').charAt(BOOL_INDEX.TEXT_SELECTION) == '1') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">*{user-select:auto !important;}</style>');
        }
        tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-studiewijzer-week .week,sl-studiewijzer-dag { position: relative;}@keyframes homeworkchecked { 0% { margin-top: 32px; position: absolute; width: calc(100% - 32px); z-index: 15; } 100% { margin-top: calc(64px * var(--mod-hours-to-move) + 28px); position: absolute; width: calc(100% - 32px); z-index: 1; }}sl-studiewijzer-items.mod-added { margin-top: -4px;}.mod-huiswerk { margin-top: -4px; height: 58px; position: relative; background: var(--bg-elevated-weakest); border-left: 4px solid var(--fg-warning-normal); border-top: var(--thinnest-solid-neutral-normal); border-right: var(--thinnest-solid-neutral-normal); border-bottom: var(--thinnest-solid-neutral-normal); overflow: hidden;}.mod-huiswerk.mod-huiswerk-done:hover { border-top: var(--thinnest-solid-positive-normal); border-right: var(--thinnest-solid-positive-normal); border-bottom: var(--thinnest-solid-positive-normal);}.mod-huiswerk-animation { animation: homeworkchecked 0.3s ease;}.mod-huiswerk.mod-huiswerk-done { border-left: 4px solid var(--fg-on-positive-weak); background: var(--bg-positive-weak);}.mod-huiswerk.mod-huiswerk-done svg { fill: var(--fg-on-positive-weak); opacity: 0.6;}.mod-huiswerk.mod-huiswerk-done strong,.mod-huiswerk.mod-huiswerk-done p { text-decoration: line-through; color: var(--fg-on-positive-weak); opacity: .6;}.mod-huiswerk div { position: absolute; height: 17px; width: 17px; border: var(--thin-solid-neutral-strong); right: -25px; border-radius: var(--border-radius-normal); background: var(--bg-elevated-none); top: 17px; transition: right 0.2s ease;}.mod-huiswerk:hover div { right: 15px;}.mod-huiswerk:hover div:hover { border-color: var(--action-positive-normal);}.mod-huiswerk strong,.mod-huiswerk p { overflow: hidden; width: calc(100% - 20px); text-wrap: nowrap; text-overflow: ellipsis; font-weight: 600;}.mod-huiswerk strong { font-size: 14px; margin-top: -5px; display: block; margin-left: 10px; color: var(--text-strong);}.mod-huiswerk p { margin: 0 0 0 10px; font-size: 12px; color: var(--text-weak);}.mod-huiswerk:hover strong,.mod-huiswerk:hover p { width: calc(100% - 55px);}.mod-huiswerk,.mod-add-homework { width: 100%; border-radius: var(--border-radius-normal); box-sizing: border-box; padding: 16px 0 16px 38px; cursor: pointer;}.mod-huiswerk.mod-before { margin-top: 0; margin-bottom: -4px;}.mod-huiswerk:hover { border-top: var(--thinnest-solid-primary-normal); border-right: var(--thinnest-solid-primary-normal); border-bottom: var(--thinnest-solid-primary-normal);}.mod-add-homework { padding: 8px 0 8px 38px; background: var(--mod-semi-transparant, var(--bg-elevated-none)); border: 2px dashed var(--bg-elevated-weak); color: var(--text-weak);}.mod-add-homework:hover { opacity: 1;}.mod-huiswerk div svg { display: none;}.mod-huiswerk.mod-huiswerk-done div { background: var(--action-positive-normal); border-color: var(--action-positive-normal);}.mod-huiswerk.mod-huiswerk-done div svg { display: block; fill: var(--border-neutral-inverted); padding: 2px 3px;}.mod-huiswerk>svg,.mod-add-homework svg { height: 16px; position: absolute; margin-top: 3px; margin-left: -22px;}.mod-huiswerk svg { fill: var(--fg-warning-normal); overflow: visible;}.mod-add-homework svg { fill: var(--text-weak); height: 16px; position: absolute; margin-top: 3px; margin-left: -22px;}.mod-homework-icon { height: 1.1em; padding: 10px; border-radius: 50%; overflow: visible; cursor: pointer; transition: background .3s ease;}.mod-homework-icon.mod-active, .mod-homework-icon:hover { background: var(--bg-elevated-strong);}.mod-user-scale { animation: 0.6s usericonscale 0.2s ease;}@keyframes usericonscale { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); }}a:hover .mod-save-shake { animation: 0.6s saveshake 0.2s ease;}@keyframes saveshake { 0% { transform: rotate(0deg); } 25% { transform: rotate(15deg); } 50% { transform: rotate(0eg); } 75% { transform: rotate(-15deg); } 100% { transform: rotate(0deg); }}a:hover .mod-bug-scale { animation: 0.6s bugscale 0.2s ease;}@keyframes bugscale { 0% { opacity: 0; transform: scale(.3); } 50% { opacity: 1; transform: scale(1.05); } 70% { transform: scale(.9); } 100% { transform: scale(1); }}a:hover .mod-info-wobble { animation: 0.6s infowobble 0.2s ease;}@keyframes infowobble { from, to { transform: scale(1, 1); } 25% { transform: scale(0.8, 1.2); } 50% { transform: scale(1.2, 0.8); } 75% { transform: scale(0.9, 1.1); }}a:hover .mod-update-rotate { animation: 0.8s updaterotate 0.2s ease;}@keyframes updaterotate { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); }}a:hover .mod-reset-rotate { animation: 0.8s resetrotate 0.2s ease;}@keyframes resetrotate { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); }}.mod-gear-rotate { animation: 0.8s gearrotate 0.2s ease;}@keyframes gearrotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}.mod-range-preview { height: 40px; width: 40px; overflow: hidden; position: absolute; margin-left: 250px; border: var(--thinnest-solid-neutral-normal); border-radius: 6px; padding: 7px; box-sizing: border-box;}.mod-range-preview svg { height: 100% !important;}input[type="range"] { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; width: 15rem;}input[type="range"]:focus { outline: none;}input[type="range"]::-webkit-slider-runnable-track { background-color: var(--bg-primary-weak); border-radius: 0.5rem; height: 0.5rem;}input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; margin-top: -4px; border-radius: 50%; background-color: var(--bg-primary-strong); height: 1rem; width: 1rem;}input[type="range"]:focus::-webkit-slider-thumb { border: none; outline: 3px solid var(--border-accent-normal); outline-offset: 0.125rem;}input[type="range"]::-moz-range-track { background-color: var(--bg-primary-weak); border-radius: 0.5rem; height: 0.5rem;}input[type="range"]::-moz-range-thumb { border: none; border-radius: 50%; background-color: var(--bg-primary-strong); height: 1rem; width: 1rem;}input[type="range"]:focus::-moz-range-thumb { border: none; outline: 3px solid var(--border-accent-normal); outline-offset: 0.125rem;}.switch { display: inline-block; height: 25px; position: relative; vertical-align: top; width: 50px; margin: 12px 10px 25px 0;}.switch input { display: none !important;}.slider { background-color: var(--bg-primary-weak); bottom: -1px; cursor: pointer; left: 0; position: absolute; right: 0; top: 1px; transition: background .2s;}.slider:before { background-color: #fff; bottom: 4px; content: ""; height: 17px; left: 4px; position: absolute; transition: .2s; width: 17px;}input:checked+.slider { background-color: var(--bg-primary-strong);}input:checked+.slider:before { transform: translateX(26px);}.slider.round { border-radius: 34px; margin-bottom: 0 !important;}.slider.round:before { border-radius: 50%;}.mod-custom-select { position: relative; font-family: Arial, sans-serif; margin-top: 10px; width: 240px; display: inline-block; margin-right: 15px; margin-bottom: 8px;}.mod-custom-select select { display: none;}.select-selected { transition: background 0.2s ease; border-radius: 6px; border: var(--thinnest-solid-neutral-normal) !important; background-color: var(--bg-elevated-weakest);}.select-selected:after { position: absolute; content: ""; top: 18px; right: 10px; width: 0; height: 0; border: 6px solid transparent; border-color: var(--text-moderate) transparent transparent transparent;}.select-selected.select-arrow-active,.select-selected:hover { background: var(--bg-elevated-strong) !important;}.select-selected.select-arrow-active:after { border-color: transparent transparent var(--text-moderate) transparent; top: 10px;}.select-items div,.select-selected { color: var(--text-moderate); letter-spacing: normal; padding: 8px 16px; border: 1px solid transparent; border-color: transparent transparent rgba(0, 0, 0, 0.1) transparent; cursor: pointer; -webkit-user-select: none; user-select: none;}.select-items { max-height: 400px; position: absolute; background-color: var(--bg-elevated-none); color: var(--text-moderate); top: calc(100% + 10px); left: -2px; width: calc(100% + 2px); right: 0; z-index: 99; border-radius: 8px; overflow: hidden; overflow-y: auto; border-radius: 6px; box-shadow: 0 0 30px var(--bg-elevated-strong);}.select-items div:last-of-type { border: 2px solid transparent;}.select-hide { display: none;}.select-items div:hover,.same-as-selected { background-color: rgba(0, 0, 0, 0.1);}#mod-message textarea { height: 200px; padding: 12px 20px; outline-offset: unset;}#mod-message .mod-message-button { -webkit-user-select: none; user-select: none; text-decoration: none; font-size: 14px; padding: 12px 24px; border: 4px solid var(--bg-primary-normal); background: var(--bg-primary-normal); border-radius: 8px; margin-top: 10px; margin-right: 10px; display: inline-block; color: var(--text-inverted); outline: none; cursor: pointer; transition: background 0.2s ease, border 0.2s ease;}#mod-message .mod-message-button:hover { background: var(--bg-primary-strong);}#mod-message .mod-message-button:focus,#mod-message .mod-message-button:hover { border: 4px solid var(--bg-primary-strong);}#mod-message .mod-message-button.mod-button-discouraged { background: var(--bg-elevated-none) !important; color: red; border: 4px solid red;}#mod-message .mod-message-button.mod-button-discouraged:focus,#mod-message .mod-message-button.mod-button-discouraged:hover { border: 4px solid darkred;}#mod-message a { text-decoration: underline;}#mod-message p,#mod-message h3 { font-size: 14px; margin-bottom: 10px; line-height: 17px;}#mod-message h2 { font-size: 18px; margin-bottom: 20px;}#mod-message>center { position: absolute; width: 100%;}#mod-message.mod-animation-playing>center { opacity: 0; transform: translateY(-300px); animation: 0.4s modmessageslidein ease 0.15s forwards;}@keyframes modmessageslidein { 0% { transform: translateY(-300px); opacity: 0; } 50% { opacity: 1; } 100% { transform: none; opacity: 1; }}#mod-message>center>div { background: var(--bg-elevated-none); box-shadow: 0 0 50px var(--bg-elevated-weak); width: 500px; max-width: calc(100% - 16px); border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; text-align: left; padding: 20px 30px; box-sizing: border-box;}#mod-message { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000000; background: rgba(0, 0, 0, 0.2); box-sizing: border-box;}#mod-message.mod-animation-playing { animation: 0.2s modmessagebackground ease forwards;}#mod-message.mod-msg-closed { opacity: 0;}@keyframes modmessagebackground { 0% { background: rgba(0, 0, 0, 0); } 100% { background: rgba(0, 0, 0, 0.2); }}#mod-letterbeoordelingen { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5px 15px;}#mod-letterbeoordelingen label { display: block; margin: 5px 0; font-size: 0.9em; text-wrap: nowrap; text-overflow: ellipsis; overflow: hidden;}#mod-letterbeoordelingen input { height: 30px;}#mod-actions { background: var(--bg-elevated-none); margin-left: -30px; padding: 10px 30px; z-index: 100; width: 100%; margin-top: -10px; top: -5px;}.mod-setting-button { padding: 10px 12px; background: var(--bg-elevated-weak); border-radius: 8px; margin-right: 8px; display: inline-block; margin-bottom: 10px; transition: background 0.3s ease !important; cursor: pointer; user-select: none; color: var(--text-moderate) !important;}.mod-setting-button:hover { background: var(--bg-elevated-strong); color: var(--text-moderate);}.mod-setting-button svg { margin-right: 10px; height: 18px; margin-bottom: -3px;}#mod-background-wrapper { width: 100%;}#mod-background-wrapper label svg { width: 100%; height: 100%; padding: 50px 15px; box-sizing: border-box;}#mod-background-wrapper img:hover { filter: opacity(0.5);}#mod-background-wrapper label,#mod-background-wrapper img { cursor: pointer; height: 150px; width: 150px; background: var(--bg-elevated-none); border-radius: 8px; object-fit: cover; display: inline-block; margin-right: 15px; margin-bottom: 15px; vertical-align: top;}.dodgerblue { color: dodgerblue; cursor: pointer; user-select: none;}.mod-background-preview { width: 100%; height: 175px; object-fit: cover; border-radius: 12px; clip-path: inset(0 round 12px);}.mod-slider { display: inline-block; min-width: 50%;}.mod-slider input,.mod-slider p { display: inline-block; margin: 3px 15px 3px 0; vertical-align: middle; min-width: 45px;}.mod-slider input { height: 40px; background: var(--bg-elevated-none);}.mod-slider p:first-of-type { font-weight: 700; min-width: 115px;}.mod-background-type-content { padding: 20px; background: var(--bg-elevated-weakest); border: 1px solid rgba(0, 0, 0, 0.1); border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;}#mod-background-type { display: flex; flex-wrap: wrap; border: 1px solid rgba(0, 0, 0, 0.1); border-bottom: none; padding-top: 3px; border-top-left-radius: 16px; border-top-right-radius: 16px;}#mod-background-type a { flex-grow: 1; text-align: center; padding: 10px; cursor: pointer;}#mod-background-type a.active { border-bottom: 3px solid var(--fg-on-primary-weak); font-weight: 700;}.br { height: 10px; clear: both;}.layout-container.layout-selected,.layout-container:hover { border: 3px solid var(--fg-on-primary-weak);}.layout-container { display: inline-block; vertical-align: top; margin-left: 10px; margin-bottom: 50px !important; width: 180px; aspect-ratio: 18/13; background: var(--bg-elevated-none); border: 3px solid var(--bg-elevated-none); border-radius: 16px; position: relative; cursor: pointer; transition: border 0.2s ease !important; box-shadow: 2px 2px 20px var(--bg-elevated-strong);}.layout-container h3 { bottom: -40px; width: 100%; position: absolute; text-align: center; overflow: hidden; text-wrap: nowrap; text-overflow: ellipsis;}.layout-container div { -webkit-user-select: none; user-select: none; background: var(--bg-primary-weak); border-radius: 6px; position: absolute;}.example-box-wrapper { border: 3px solid var(--blue-0); width: 500px; padding: 10px 20px; border-radius: 12px; overflow: hidden; max-width: calc(100% - 50px); margin-top: 15px;}.example-box-wrapper>div { transform-origin: top left;}.theme { user-select: none; display: inline-block; cursor: pointer; width: calc(20% - 11px); margin-bottom: 10px; margin-right: 5px; overflow: hidden; background: var(--bg-elevated-none); border: 3px solid transparent; border-radius: 16px; transition: .2s border ease, .2s background ease !important; box-shadow: 2px 2px 10px var(--bg-elevated-strong);}.theme:hover,.theme.theme-selected,.theme.theme-selected-set { border: 3px solid var(--blue-0);}.theme.theme-selected,.theme.theme-selected-set { background: var(--blue-0); color: var(--grey-80);}.theme img { width: 100%; height: 175px; object-fit: cover; background: var(--bg-elevated-none); margin-bottom: -5px}.theme h3 { padding: 10px; padding-left: 30px; overflow: hidden; text-overflow: ellipsis; text-wrap: nowrap;}.theme h3 div { display: inline-block; height: 12px; width: 12px; border-radius: 50%; position: absolute; margin: 5px -20px;}#mod-setting-panel .category:first-of-type { margin-top: 20px;}#mod-setting-panel .category { cursor: pointer; user-select: none; padding: 10px; border-bottom: 6px solid var(--bg-primary-weak); border-radius: 6px; font-size: 20px; margin: 20px -10px; margin-top: 50px;}#mod-setting-panel .category:after { content: ""; transform: rotate(45deg); border: solid var(--bg-primary-normal); border-width: 0 3px 3px 0; display: inline-block; padding: 3px; margin-left: 15px; margin-top: 8px; position: absolute;}#mod-setting-panel .category.collapsed { margin-bottom: -40px;}#mod-setting-panel .category:last-of-type { margin-bottom: 20px;}#mod-setting-panel .category.collapsed:after { transform: rotate(225deg); margin-top: 11px;}#mod-setting-panel>div>p:first-of-type { margin-right: 15px;}.mod-file-label,.mod-button { -webkit-user-select: none; user-select: none; transition: 0.2s border ease !important; margin-bottom: 8px; display: block; width: fit-content; padding: 10px 18px; border: 2px solid var(--fg-on-primary-weak); border-radius: 12px; color: var(--fg-on-primary-weak) !important;}.mod-file-label.mod-drag-and-drop { border: 5px solid var(--fg-on-primary-weak); font-weight: 700;}.mod-button { display: inline-block; margin-right: 10px;}.mod-file-label:hover,.mod-button:hover { border: 2px solid var(--bg-primary-weak); cursor: pointer;}label.mod-file-label.mod-active svg path { fill: white !important;}div.mod-button.mod-active,label.mod-file-label.mod-active { background: var(--fg-on-primary-weak); color: var(--text-inverted) !important;}.mod-file-label p { margin-left: 10px; display: inline;}input[type="file"].mod-file-input { display: none !important;}input[type="color"] { width: 0; height: 0; visibility: hidden; overflow: hidden; opacity: 0;}.mod-color { cursor: pointer; width: 38px; height: 38px; border-radius: 50%; display: inline-block;}.mod-color p { margin: 8px 50px; width: 150px;}.mod-color-textinput { width: 120px; margin-left: 125px; color: var(--fg-on-primary-weak); display: inline-block; padding: 5px; border: none !important; outline: none !important; background: transparent; box-shadow: none !important;}#mod-setting-panel>div>div>p { display: inline-block; max-width: calc(100% - 70px);}#nickname-wrapper>div,#username-wrapper>div { display: flex; margin-bottom: 10px; gap: 15px; row-gap: 2px;}#nickname-wrapper>div input,#username-wrapper>div input { flex-grow: 1;}#nickname-wrapper>div>input:first-of-type,#username-wrapper>div>input:first-of-type { width: 42%;}#nickname-wrapper>div>input:nth-child(2) { width: 24%;}#mod-setting-panel { position: absolute; background: var(--bg-elevated-none); top: 2px; left: 0; width: 100%; height: fit-content; padding: 0 30px; box-sizing: border-box; z-index: 100;}@media (max-width:550px) { .mod-slider { width: 100%; } #mod-setting-panel h3, #mod-setting-panel div { clear: both; } .mod-range-preview { right: 15px; } input[type="range"] { width: calc(100% - 50px) !important; } .mod-slider p:last-of-type { height: 7px; transform: translateY(-72px); float: right; margin: 0 !important; } .mod-slider input[type="range"] { width: 100% !important; } #mod-grade-calculate input { width: calc(100% - 30px) !important; margin-bottom: 10px; } #nickname-wrapper input, #username-wrapper input { width: 100% !important; } #nickname-wrapper div, #username-wrapper div { flex-wrap: wrap; } .layout-container { width: calc(50% - 20px) !important; }}#grade-reveal-select { margin-bottom: 20px;}@media (max-width:1300px) { .theme { width: calc(33.33333% - 11px); }}@media (max-width:1000px) { .theme { width: calc(50% - 11px); } #mod-setting-panel { padding: 0 15px; }}@media (max-width:475px) { #mod-background-wrapper label, #mod-background-wrapper img { width: calc(50% - 10px); margin-right: 10px; }}:root.night { --bg-mask-normal: rgba(0, 0, 0, 0.9); --shadow-color: rgba(0, 0, 0, 0.8); --raised-weak-x: 0; --raised-weak-y: 1px; --raised-weak-blur: 2px; --raised-normal-x: 0; --raised-normal-y: 1px; --raised-normal-blur: 4px; --raised-strong-x: 0; --raised-strong-y: 2px; --raised-strong-blur: 10px; --raised-strongest-x: 0; --raised-strongest-y: 3px; --raised-strongest-blur: 16px; --border-neutral-inverted: #ffffff; --border-neutral-weak: #3a3a3a; --border-neutral-normal: #2a2a2a; --border-neutral-strong: #1e1e1e; --border-neutral-strongest: #121212; --border-primary-weak: #444444; --border-primary-normal: #2c2c2c; --border-primary-strong: var(--blue-40); --border-accent-normal: #f2b94c; --border-accent-strong: #e8a41f; --border-warning-normal: #d96c3f; --border-warning-strong: #c74f20; --border-negative-normal: #d94a3f; --border-negative-strong: #b32a1c; --border-positive-normal: #3ca86c; --border-positive-strong: #2b7f4f; --border-alternative-normal: #8156d1; --border-alternative-strong: #5c2fa3; --bg-neutral-none: #000000; --bg-neutral-weakest: #0f0f0f; --bg-neutral-weak: #151515; --bg-neutral-moderate: #1a1a1a; --bg-neutral-strong: #1f1f1f; --bg-neutral-strongest: #242424; --bg-neutral-max: #2a2a2a; --bg-elevated-none: #000000; --bg-elevated-weakest: #141414; --bg-elevated-weak: #191919; --bg-elevated-strong: #1f1f1f; --bg-primary-normal: #575757; --bg-primary-strong: #343434; --bg-primary-strongest: #0a0a0a; --bg-primary-weak: #222222; --bg-accent-weak: #3a3a3a; --bg-accent-normal: #f2b94c; --bg-accent-strong: #e8a41f; --bg-accent-max: #d78f00; --bg-warning-weak: #3a3a3a; --bg-warning-normal: #d96c3f; --bg-warning-strong: #c74f20; --bg-warning-max: #a2340c; --bg-negative-weak: #3a3a3a; --bg-negative-normal: #d94a3f; --bg-negative-strong: #b32a1c; --bg-negative-max: #8b1200; --bg-positive-weak: #3a3a3a; --bg-positive-normal: #3ca86c; --bg-positive-strong: #2b7f4f; --bg-positive-max: #1a5035; --bg-alternative-weak: #3a3a3a; --bg-alternative-normal: #8156d1; --bg-alternative-strong: #5c2fa3; --bg-alternative-max: #3a1860; --fg-on-neutral-none: #eaeaea; --fg-on-neutral-weakest: #d7d7d7; --fg-on-neutral-weak: #c4c4c4; --fg-on-neutral-moderate: #b1b1b1; --fg-on-neutral-strong: #9e9e9e; --fg-on-neutral-strongest: #7f7f7f; --fg-on-neutral-max: #6f6f6f; --fg-on-primary-normal: #f5f5f5; --fg-on-primary-weak: #c4c4c4; --fg-on-primary-strong: #ffffff; --fg-on-primary-strongest: #b0b0b0; --fg-on-accent-weak: #fff8e0; --fg-on-accent-normal: #ffffff; --fg-on-accent-strong: #ffffff; --fg-on-accent-max: #fdf5cc; --fg-on-warning-weak: #f7dcc0; --fg-on-warning-normal: #ffffff; --fg-on-warning-strong: #ffffff; --fg-on-warning-max: #f0d4b0; --fg-on-negative-weak: #f4c9c3; --fg-on-negative-normal: #ffffff; --fg-on-negative-strong: #ffffff; --fg-on-negative-max: #e0b0a8; --fg-on-positive-weak: #b0e6c4; --fg-on-positive-normal: #ffffff; --fg-on-positive-strong: #ffffff; --fg-on-positive-max: #d1f0d6; --fg-on-alternative-weak: #d1b8f7; --fg-on-alternative-normal: #ffffff; --fg-on-alternative-strong: #ffffff; --fg-on-alternative-max: #c8a0f0; --text-strong: #ffffff; --text-moderate: #b0b0b0; --text-weak: #888888; --text-weakest: #666666; --text-inverted: #0a0a0a; --disabled-bg: #1b1b1b; --disabled-fg: #555555; --disabled-border: #2a2a2a;}:root.night ::-webkit-scrollbar { width: 12px; height: 12px;}:root.night ::-webkit-scrollbar-track { background: #1a1a1a;}:root.night ::-webkit-scrollbar-thumb { background-color: #444444; border-radius: 6px; border: 3px solid #1a1a1a;}:root.night ::-webkit-scrollbar-thumb:hover { background-color: #666666;}:root.night .afgevinkt { background-color: transparent !important;}:root.night .datum.vandaag,:root.night .active-today,:root.night span.active { background-color: var(--bg-accent-max) !important; color: var(--text-strong) !important;}@media screen and (max-width: 767px) { :root.night .datum.vandaag { background-color: unset !important; }}:root.night hmy-pill { --text-color: var(--fg-on-positive-weak); --background-color: transparent; --text-color-darker: var(--fg-on-positive-normal); --background-color-darker: var(--bg-positive-normal); --background-color-darker-hover: var(--bg-positive-strong); --border-color: var(--border-positive-strong); border: 1px solid;}:root.night .week:not(sl-rooster-week) { background: transparent !important;}:root.night .icon.svg { background-color: var(--bg-primary-weak) !important;}#mod-play-game { color: dodgerblue; text-align: center; cursor: pointer;}sl-error-image svg { transition: 1s transform ease, margin-top 0.3s ease !important;}.mod-game-playing sl-error-image svg { margin-top: 100px; transform: scale(40); --fg-negative-normal: transparent;}.mod-game-playing sl-error-image svg * { transition: fill 0.3s ease !important;}.mod-game-playing body { height: 100vh; overflow: hidden;}.mod-floor,.mod-wall,#mod-basefloor { background: #9b9b9c; position: absolute; height: 2%;}.mod-wall { width: 20px;}body.mod-game-playing { height: 100vh; overflow: hidden;}#mod-player,#mod-basefloor,#mod-flag-end,.mod-level,h1#mod-h1-header { opacity: 0; transition: opacity 0.3s ease;}.mod-game-playing #mod-player,.mod-game-playing #mod-basefloor,.mod-game-playing #mod-flag-end,.mod-game-playing .mod-active-level,.mod-game-playing h1#mod-h1-header { opacity: 1;}.mod-lava { background: #fc9312; position: absolute; height: 2%;}.mod-enemy { background: #fc1212; position: absolute; height: 50px; width: 50px; border-radius: 6px;}.mod-enemy p { color: #fff; font-weight: 700; text-align: center; font-size: 18px; margin-top: 12px;}.mod-trampoline { background: #1264fc; position: absolute; height: 2%;}.mod-game-playing #mod-player { position: absolute; bottom: 100px; height: 50px; left: 20px;}.mod-game-playing #mod-basefloor { position: absolute; left: 0; right: 0; bottom: 0; height: 100px}.mod-game-playing #mod-flag-end { position: absolute; width: 50px;}#mod-player-container { position: absolute; top: 0; left: 0; right: 0; bottom: 100px;}.mod-game-playing * { user-select: none !important; touch-action: none !important;}.mod-moving-platform-up,.mod-moving-platform-right { position: absolute;}.mod-moving-platform-up div { width: 100%; height: 30px;}.mod-moving-platform-right div { height: 30px; width: 30%;}.mod-game-playing h1,.mod-game-playing h3,#mod-playtime { text-shadow: 2px 2px 4px var(--border-neutral-weak); font-size: 48px; color: #9b9b9c; font-weight: 700; position: absolute; top: 50%; transform: translateY(-50%); text-align: center; width: 100%; box-sizing: border-box; padding: 0 10%;}#mod-playtime,#mod-close-button { position: absolute; top: 40px; left: 30px; padding: 0; width: fit-content; margin: 0; font-size: 24px;}#mod-close-button { left: unset; right: 30px; z-index: 1000; top: 15px; font-size: 32px; cursor: pointer;}.mod-game-playing h3 { font-size: 28px; padding-top: 100px;}#mod-play-again,#mod-close-game { position: absolute; width: 300px; max-width: 90%; background: #3f8541; color: #fff; font-weight: 700; padding: 20px; transform: translateX(50%); right: 50%; transition: background 0.3s ease !important; border-radius: 12px;}#mod-play-again:hover,#mod-close-game:hover { background: #145716; cursor: pointer;}@media (max-width:700px) { #mod-h3-header { transform: unset; }}.mod-level h1 { background: rgba(0, 0, 0, 0.1); height: fit-content; padding: 0;}#somtoday-recap { cursor: pointer; overflow: hidden; background: linear-gradient(145deg, var(--blue-40) 0%, var(--blue-100) 100%); color: #fff; background-size: 200% 200%; padding: 15px 20px; border-radius: 6px; animation: backgroundanimation 7s ease infinite; position: relative; max-height: 65px; max-width: 100%; width: 680px; margin: 0 auto; margin-bottom: 30px;}@keyframes backgroundanimation { 0% { background-position: 0 0; } 50% { background-position: 100% 100%; } 100% { background-position: 0 0; }}#somtoday-recap-arrows { position: absolute; right: 50px; bottom: 10px;}#somtoday-recap-arrows svg { display: inline-block; height: 55px;}#recap-arrow-1 { animation: arrowanimation 5s ease infinite;}#recap-arrow-2 { animation: arrowanimation 5s ease infinite 0.5s;}#recap-arrow-3 { animation: arrowanimation 5s ease infinite 1s;}#somtoday-recap p { margin-bottom: 0;}#somtoday-recap p,#somtoday-recap h3 { z-index: 1; position: relative;}@keyframes arrowanimation { 0% { transform: none; } 50% { transform: translateX(20px); } 100% { transform: none; }}#somtoday-recap-wrapper { width: 0; height: 0; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(145deg, var(--blue-40) 0%, var(--blue-100) 100%); z-index: 1000; border-radius: 50%; animation: recapstart 0.5s forwards ease;}@keyframes recapstart { 100% { border-radius: 0; height: 100%; width: 100%; }}#somtoday-recap-wrapper .recap-page { width: 100%; box-sizing: border-box; padding: 30px; transition: opacity 0.5s ease !important;}.recap-page.recap-closing { opacity: 0;}#somtoday-recap-wrapper h1,#somtoday-recap-wrapper h2,#somtoday-recap-wrapper h3 { scale: 0; font-size: 3.25em; color: #fff; animation: textscale 0.7s forwards ease 1s;}#somtoday-recap-wrapper h2 { font-size: 2em; animation: textscale 0.7s forwards ease 2s; margin-top: 20px;}#somtoday-recap-wrapper h3 { line-height: 40px; margin-top: 15px; font-size: 2em; animation: textscale 0.7s forwards ease 2.5s;}#somtoday-recap-wrapper a { user-select: none; margin-top: 30px; color: #fff; border: 3px solid #fff; padding: 20px 40px; border-radius: 6px; display: block; font-size: 1.5em; width: fit-content; animation: textscale 0.7s forwards ease 2.5s; scale: 0; cursor: pointer; transition: background 0.2s ease !important;}#somtoday-recap-wrapper a:hover { background: #fff; color: #1f86f6;}@keyframes textscale { 0% { scale: 0; } 100% { scale: 100%; }}#somtoday-recap-wrapper label:first-of-type { margin-top: 20px;}#somtoday-recap-wrapper label { animation: textscale 0.7s forwards ease 2.5s; scale: 0; display: block;}#somtoday-recap-wrapper label input { display: inline-block; width: 30px;}#somtoday-recap-wrapper label p { max-width: calc(100% - 50px); margin-left: 10px; display: inline-block; color: #fff; vertical-align: top; font-size: 1.6em; margin-top: 5px;}#somtoday-recap-wrapper .wrong p,#somtoday-recap-wrapper .wrong { color: #ff0000;}#somtoday-recap-wrapper .right p,#somtoday-recap-wrapper .right { color: #00cf00;}#somtoday-recap-wrapper label.right span.number { text-decoration: line-through;}#recap-progress { box-sizing: border-box; position: absolute; top: 10px; left: 20px; width: calc(100% - 20px);}#recap-progress div { width: 0; animation: progress 0.6s forwards ease 0.3s; display: inline-block; background: #fff; margin-right: 20px; height: 10px; border-radius: 5px;}@keyframes progress { 0% { width: 0; } 100% { width: calc(12.5% - 20px) }}#recap-chart { width: 100%; height: 100%;}#recap-chart-wrapper { width: 500px; max-width: 90%; margin: 0 10px;}#award-wrapper { background: #fff; padding: 40px; margin-bottom: 40px; width: fit-content; border-radius: 8px; animation: textscale 0.7s forwards ease 1s; scale: 0;}#award-wrapper svg { height: 100px;}#recap-close { position: absolute; font-size: 64px; top: 30px; right: 30px; cursor: pointer; color: #fff; z-index: 1000;}.mod-item>svg { float: right; cursor: ns-resize; margin-top: 3px;}.mod-item div svg { float: left;}.mod-item p { float: left; margin: 0 10px; font-size: 1rem;}#mod-grade-average-sort-list { margin-top: 30px;}.mod-item,.placeholder { user-select: none; width: 400px; background: var(--bg-elevated-none); border-radius: 16px; padding: 15px 20px; height: 23px; margin-bottom: 10px; max-width: calc(100vw - 100px);}@media (max-width:767px) { #somtoday-recap-wrapper label p { text-align: left; margin-left: 20px; } #somtoday-recap-arrows svg { opacity: 0.2; } #somtoday-recap { border-radius: 0; margin-bottom: 0; } #somtoday-recap-wrapper .recap-page { font-size: 0.6em; }}#recap-nextpage { user-select: none;}.circles { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none;}.circles li { position: absolute; display: block; list-style: none; width: 20px; height: 20px; background: rgba(255, 255, 255, 0.2); animation: animate 25s linear infinite; bottom: -150px;}.circles li:nth-child(1) { left: 25%; width: 80px; height: 80px; animation-delay: 0s;}.circles li:nth-child(2) { left: 10%; width: 20px; height: 20px; animation-delay: 2s; animation-duration: 12s;}.circles li:nth-child(3) { left: 70%; width: 20px; height: 20px; animation-delay: 4s;}.circles li:nth-child(4) { left: 40%; width: 60px; height: 60px; animation-delay: 0s; animation-duration: 18s;}.circles li:nth-child(5) { left: 65%; width: 20px; height: 20px; animation-delay: 0s;}.circles li:nth-child(6) { left: 75%; width: 110px; height: 110px; animation-delay: 3s;}.circles li:nth-child(7) { left: 35%; width: 150px; height: 150px; animation-delay: 7s;}.circles li:nth-child(8) { left: 50%; width: 25px; height: 25px; animation-delay: 15s; animation-duration: 45s;}.circles li:nth-child(9) { left: 20%; width: 15px; height: 15px; animation-delay: 2s; animation-duration: 35s;}.circles li:nth-child(10) { left: 85%; width: 150px; height: 150px; animation-delay: 0s; animation-duration: 11s;}@keyframes animate { 0% { transform: translateY(0) rotate(0deg); opacity: 1; border-radius: 0; } 100% { transform: translateY(-1000px) rotate(720deg); opacity: 0; border-radius: 50%; }}:root { --ruimvoldoende-cijfer-color: #3f8541 !important;}:root.dark { --ruimvoldoende-cijfer-color: #90ea93 !important;}body { overflow-y: scroll !important; background: var(--bg-elevated-none);}html.dark .cijfer.neutraal { color: var(--fg-primary-normal) !important;}sl-scrollable-title { background: var(--bg-neutral-none); padding: 0 16px !important; margin: 0 !important; max-width: unset !important;}hmy-switch-group:has(hmy-switch),sl-bericht-detail .header,sl-bericht-nieuw>.titel { position: relative;}sl-bericht-nieuw .nieuw-bericht-form input,sl-bericht-nieuw .nieuw-bericht-form textarea,sl-bericht-nieuw .nieuw-bericht-form sl-bericht-ontvanger-selectie { background: none;}sl-rooster-tijden>div:first-of-type span { padding-top: 10px;}.tijd { text-wrap: nowrap;}sl-modal>div:has(sl-account-modal) { max-width: 2048px !important; height: 92% !important; max-height: 92% !important;}.zoekresultaten-inner { max-height: 368px !important;}.week:not(sl-rooster-week) { background: var(--bg-neutral-none) !important; color: var(--text-strong) !important;}@media (min-width:1280px) { sl-tab-bar { background: none !important; }}.navigation,.dagen,.actiepanel,.dag-afkortingen { background: none !important;}.zoekresultaten { border: none !important;}sl-plaatsingen,.nieuw-bericht-form { background: var(--bg-neutral-none);}sl-cijfers .tabs { border-radius: 6px;}sl-account-modal .content,.tabs .filler { position: relative;}#studiewijzer-afspraak-toevoegen-select { margin-top: 20px;}.mod-multi-choice { display: inline-block; vertical-align: top; border: var(--thinnest-solid-neutral-normal); border-radius: 12px; overflow: hidden;}.mod-multi-choice span { padding: 10px 15px; display: inline-block; cursor: pointer; user-select: none; transition: background .2s ease;}.mod-multi-choice span:hover { background: var(--bg-elevated-weakest);}.mod-multi-choice span.active { background: var(--bg-elevated-weak);}@media (max-width:48em) { #mod-grade-calculate, #mod-grades-graphs { padding: 0 20px; box-sizing: border-box; }}.input-veld { border-width: 2px !important;}button.tertiary:not(:hover),sl-studiewijzer-filter-button:not(:hover) { background: var(--bg-neutral-none) !important;}#mod-grades-graphs>div { margin-bottom: 50px; width: 100%; position: relative;}#mod-grades-graphs>div>canvas { position: relative; width: 100%; height: 100%;}#mod-grades-graphs>h3 { margin-top: 40px; margin-bottom: 10px; color: var(--text-strong);}.mod-info-notice { width: fit-content; margin-bottom: -15px; padding: 10px 20px; border: 2px solid var(--blue-0); color: var(--fg-on-primary-weak); line-height: 15px; border-radius: 16px; padding-left: 50px; position: relative;}.mod-info-notice>svg { height: 20px; position: absolute; top: 50%; transform: translateY(-50%); left: 18px;}#mod-grade-calculate { margin-top: 40px; color: var(--text-strong); width: calc(100% + 15px);}#mod-grade-calculate input { width: calc(50% - 80px); margin-right: 15px; display: inline-block;}#mod-grade-calculate #mod-grade-one-three,#mod-grade-calculate #mod-grade-two-three { width: 115px;}#mod-grade-calculate input[type=submit] { background: var(--action-primary-normal); color: var(--text-inverted); transition: background 0.3s ease !important; cursor: pointer;}#mod-grade-calculate input[type=submit]:hover { background: var(--action-primary-strong);}.mod-grades-download { right: 20px; position: absolute; margin-top: 5px; cursor: pointer;}.mod-grades-download svg { height: 25px;}sl-studiewijzer-week:has(.datum.vandaag) { background: var(--mod-semi-transparant) !important;}sl-laatste-resultaat-item,sl-vakresultaat-item { background: var(--bg-neutral-none) !important;}sl-rooster-week-header .dag { align-content: start !important;}sl-rooster-week-header .dag p { height: fit-content;}sl-rooster-week-header .mod-add-homework { display: none !important;}@media (max-width:767px) { .mod-huiswerk strong, .mod-huiswerk p { width: calc(100% - 65px) !important; } sl-studiewijzer-dag .mod-huiswerk { margin-top: -12px !important; } sl-studiewijzer-dag .mod-huiswerk.mod-before { margin-top: 0 !important; margin-bottom: -12px !important; } sl-studiewijzer-lijst-dag .mod-huiswerk, sl-studiewijzer-lijst-dag .mod-add-homework { margin-top: 4px !important; } sl-studiewijzer-lijst-dag .mod-huiswerk.mod-before { margin-top: 0 !important; margin-bottom: 4px !important; } sl-studiewijzer-lijst-dag .dag-header { background: transparent !important; } #mod-message>center>div { padding: 20px !important; } .mod-multi-choice span { padding: 10px !important; } .mod-huiswerk.mod-huiswerk-done div svg { opacity: 1 !important; padding: 2px !important; width: 16px !important; height: 16px !important; } .mod-huiswerk div { right: 15px !important; width: 20px !important; height: 20px !important; } .laad-eerdere { background: var(--bg-neutral-none) !important; } .berichten-lijst { min-height: calc(var(--min-content-vh) - 64px - 32px) !important; margin-bottom: 0 !important; } sl-cijfers>.container { padding-bottom: 0 !important; } sl-cijfers .tabs { border-radius: 0; }}@media (min-width:1120px) and (min-height:550px) { #mod-actions { position: sticky; }}@media (max-width:1279px) { sl-modal>div:has(sl-account-modal) { max-width: 2048px !important; height: 95% !important; max-height: 95% !important; }}@media (min-width:767px) { .mod-add-homework { opacity: 0; transition: 0.2s opacity ease; }}#grade-defender-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100000; background: rgba(0, 0, 0, 0.85); cursor: crosshair; display: none;}#grade-defender-canvas.active { display: block;}#grade-defender-ui { position: fixed; top: 20px; left: 20px; z-index: 100001; color: #fff; font-family: \'Kanit\', sans-serif; font-size: 24px; pointer-events: none; display: none;}#grade-defender-ui.active { display: block;}#grade-defender-close { position: fixed; top: 20px; right: 20px; z-index: 100001; color: #fff; font-size: 40px; cursor: pointer; line-height: 30px; display: none;}#grade-defender-close.active { display: block;}#grade-defender-gameover { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 100002; color: #fff; text-align: center; display: none;}#grade-defender-gameover.active { display: block;}#grade-defender-gameover h1 { font-size: 60px; margin: 0; color: #ff4444; text-shadow: 0 0 20px rgba(255, 0, 0, 0.5);}#grade-defender-restart { background: #fff; color: #000; padding: 15px 30px; border-radius: 30px; font-size: 20px; cursor: pointer; margin-top: 20px; display: inline-block; font-weight: bold;}#mod-background-live { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none;}#mod-bg-live { padding: 20px; background: var(--bg-elevated-weakest); border: 1px solid rgba(0, 0, 0, 0.1); border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;}#mod-new-year { padding: 20px; background: linear-gradient(to bottom, #39497b, #182859); color: #fff; position: relative; transition: height .3s ease, padding .3s ease; height: 142px; box-sizing: border-box;}#mod-new-year button { position: absolute; right: 20px; cursor: pointer; color: #fff; background: #fff2; border: none; font-size: 26px; height: 40px; width: 40px; border-radius: 50%; transition: background .2s ease;}#mod-new-year button:hover { background: #fff4;}#mod-new-year h3 { text-align: center; display: block;}#mod-new-year>div:last-of-type { display: flex; justify-content: center; gap: 10px; margin-top: 15px;}#mod-new-year>div:last-of-type>div { background: #fff2; display: block; width: 80px; padding: 6px 12px; border-radius: 8px; text-align: center; overflow: hidden;}#mod-new-year div p { margin: 0; font-size: 1.5em;}.mod-letter-slide { animation: mod-letter-slide .4s;}@keyframes mod-letter-slide { 0% { transform: translateY(-30px); } 100% { transform: translateY(0px); }}#mod-new-year div span { display: block; font-size: 0.7em; transform: translateY(-3px);}#mod-new-year-fireworks { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;}#mod-fireworks { position: fixed; top: 0px; left: 0px; width: 100dvw; height: 100dvh; z-index: 1000; pointer-events: none;}#mod-contributors { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; row-gap: 5px; margin-bottom: 25px;}#mod-contributors a { display: flex; gap: 10px; align-items: center; background: var(--bg-elevated-weak); border-radius: 100dvh; padding-right: 15px; transition: background .2s ease;}#mod-contributors a img { height: 2em; border-radius: 50%;}#mod-contributors a p { margin: 0;}#mod-contributors a:hover { background: var(--bg-elevated-strong); cursor: pointer;}.blok>.container>svg { width: 100%; height: 100%;}</style>');
               tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">' + (get('bools').charAt(BOOL_INDEX.ROSTER_GRID) == '0' ? 'sl-rooster-week .uur{border-left:none !important;border-bottom:none !important;}' : '') + '</style>');
        tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (min-width:767px){:root{--min-content-vh:calc(100vh - ' + (get('layout') == '4' ? '66px' : '74px') + ') !important;}}</style>');
               if (n(get('customfontname'))) {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@import url("' + fontUrl + '");*{font-family:"' + get('fontname') + '","Open Sans",sans-serif !important;' + ((get('fontname') == "Bebas Neue" || get("fontname") == "Oswald") ? "letter-spacing:1px;" : "") + '}</style>');
        }
        else {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@import url("' + fontUrl + '");@font-face{font-family:modCustomFont;src:url("' + get('customfont') + '");}*{font-family:modCustomFont,"Open Sans",sans-serif !important;}</style>');
        }
               if (get('layout') != 4 && ((get("backgroundtype") == 'image' && !n(get("background"))) || (get("backgroundtype") == 'color') || (get("backgroundtype") == 'slideshow' && !n(get("background0"))) || get("backgroundtype") == 'live')) {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">hmy-switch-group:has(hmy-switch),sl-bericht-detail .header,sl-bericht-nieuw > .titel{border-radius:6px;padding:10px;background-color:var(--bg-neutral-none);}.content:has(sl-registraties){background:var(--mod-transparent);}sl-studiewijzer-week{border-bottom:2px solid var(--mod-transparent) !important;}sl-studiewijzer-dag{border-right:2px solid var(--mod-transparent) !important;}' + (get('bools').charAt(BOOL_INDEX.ROSTER_GRID) == '1' ? 'sl-rooster-week .uur{border-left:2px solid var(--mod-transparent) !important;border-bottom:2px solid var(--mod-transparent) !important;}' : '') + '.container:has(sl-vakresultaten){padding-bottom:0 !important;}sl-vakresultaten{background-color:var(--bg-neutral-none);padding:20px !important; padding-bottom:40px !important;}hmy-geen-data > span{margin-top:20px;}hmy-geen-data{background:var(--mod-ui-transparent);padding:30px 60px;border-radius:24px;}</style>');
        }
               if (get('layout') == 2 || get('layout') == 3 || get('layout') == 5) {
            if (get('layout') == 2 || get('layout') == 3) {
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-popup{position:fixed !important;top:70px !important;}hmy-popup:has(sl-leerling-menu-acties){position:fixed !important;bottom:80px !important;top:unset !important;}@media (min-width:1280px){.header,.headers-container{top:0 !important;}div.berichten-lijst{height:calc(100vh - 64px) !important;}}</style>');
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (min-width: 767px){.berichten-lijst{height:calc(100vh - 129px) !important;}}@media (min-width:1280px){.menu-avatar{width:calc(100% - 35px) !important;overflow:hidden;justify-content:center;}}</style>');
            }
            else {
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-registratie-overzicht{margin-top:50px;}sl-popup{position:fixed !important;top:130px !important;}hmy-popup:has(sl-leerling-menu-acties){position:fixed !important;top:65px !important;right:30px !important;left:unset !important;}#mod-top-menu{display:none;}@media (min-width: 767px) and (max-width:1279px){.berichten-lijst{height:calc(100vh - 129px) !important;}}@media (min-width: 1280px){#mod-new-year{margin-top:calc(64px + var(--safe-area-inset-top));}:root:has(sl-berichten){--safe-area-inset-top:64px !important;}body:has(sl-cijfers),body:has(sl-berichten) .tabs,body:has(sl-berichten) .main,sl-studiewijzer-weken{margin-top:64px;}.menu-avatar{position:fixed !important;top:25px;right:150px;left:unset !important;bottom:unset !important;opacity:0;}#mod-top-menu-title{color:var(--text-strong);}#mod-top-menu{display:block;border-bottom:var(--thinnest-solid-neutral-normal);background:var(--bg-neutral-none);position:' + (get('bools').charAt(BOOL_INDEX.MENU_ALWAYS_SHOW) == '1' ? 'fixed' : 'absolute') + ';top:0;left:var(--safe-area-inset-left);right:0;height:64px;z-index:50;}#mod-top-menu h2{margin:18px 24px;}#mod-profile-link:hover{filter:brightness(0.8);}#mod-profile-link{transition:0.2s filter ease;box-sizing:border-box;position:absolute;right:24px;cursor:pointer;top:0;bottom:0;height:100%;padding:15px;}#mod-logout{right:145px;}#mod-messages{right:90px;}#mod-logout,#mod-messages{cursor:pointer;position:absolute;padding:15px;top:0;}#mod-logout svg,#mod-messages svg{fill:var(--action-primary-normal);height:25px !important;margin-top:4px;transition:fill 0.2s ease;}#mod-logout:hover svg,#mod-messages:hover svg{fill:var(--action-primary-strong);}#mod-profile-link div{height:100%;aspect-ratio:1 / 1;background:var(--bg-primary-weak);overflow:hidden;border-radius:6px;}#mod-profile-link span{margin:6px 0;text-align:center;width:100%;display:block;font-weight:700;color:var(--fg-on-primary-weak);}#mod-profile-link img{width:100%;height:100%;object-fit:cover;}}</style>');
            }
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (min-width:1280px){:root{--safe-area-inset-' + (get('layout') != 3 ? 'left:120px' : 'right:120px') + ' !important;--min-content-vh:calc(100vh - var(--safe-area-inset-top) - var(--safe-area-inset-bottom)) !important;}sl-header > div:first-of-type i{--action-neutral-normal:' + menuColor + ';}#mod-logo-wrapper{width:120px;' + (get('layout') != 3 ? 'margin-left' : 'left') + ':calc((var(--safe-area-inset-' + (get('layout') != 3 ? 'left' : 'right') + ') - 120px) / 2);position:relative;}#mod-logo{width:65%;height:60px;margin:20px 0;position:relative;left:50%;transform:translateX(-50%);}sl-header sl-tab-bar{--action-neutral-normal:' + menuColor + ';--action-primary-normal:' + menuColor + ';position:absolute !important;width:100% !important;height:100% !important;display:block !important;overflow:hidden;}sl-header .item span{text-align:center;margin-top:10px;display:block;}sl-header .active .item, sl-header .item:hover{background:' + highLightColor + ' !important;padding-top:0 !important;}sl-header .item:hover i{scale:0.9;}sl-header .item i{transition:scale 0.3s ease !important;height:40px;display:block;padding-top:23px;fill:var(--action-neutral-normal) !important;}sl-header .item svg{width:100%;height:40px;}sl-header sl-tab-item, sl-header sl-tab-item .item{height:120px !important;position:relative !important;display:block !important;}sl-popup{z-index:101 !important;}sl-header{position:fixed !important;z-index:15 !important;' + (get('layout') != 3 ? 'left' : 'right') + ':0 !important;top: 0 !important;height:100% !important;border-bottom:0 !important;width:var(--safe-area-inset-' + (get('layout') != 3 ? 'left' : 'right') + ') !important;background:' + get('primarycolor') + ' !important;color:' + menuColor + ' !important;}sl-header > div:first-of-type{position:absolute;bottom:20px;left:17px;--bg-elevated-weakest:' + highLightColor + ';}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width:1279px){#mod-logo-wrapper{width:100px;' + (get('layout') != 3 ? 'margin-left' : 'left') + ':calc((var(--safe-area-inset-' + (get('layout') != 3 ? 'left' : 'right') + ') - ' + ((platform == 'Android' || get('layout') != 3) ? '100px' : '115px') + ') / 2);position:relative;}sl-tab-bar hmy-notification-counter{margin-top:-60px !important;margin-left:40px !important;}:root{--safe-area-inset-' + (get('layout') != 3 ? ('left:100px !important' + (platform == 'Android' ? '' : ';--safe-area-inset-right:15px')) : 'right:' + (platform == 'Android' ? '100px' : '115px')) + ' !important;}#mod-background{width:calc(100% - var(--safe-area-inset-left) - var(--safe-area-inset-right) - 2 * ' + get('blur') + ' + 15px);}sl-tab-bar:first-of-type{position:fixed;top:0;' + (get('layout') != 3 ? 'left' : 'right') + ':0;border-top:none;width:' + (get('layout') != 3 ? 'var(--safe-area-inset-left)' : (platform == 'Android' ? 'var(--safe-area-inset-right)' : 'calc(var(--safe-area-inset-right) - 15px)')) + ' !important;height:100%;display:block !important;z-index:0;background:' + get('primarycolor') + '}sl-tab-bar:first-of-type sl-tab-item svg{width:100%;height:40px;}sl-tab-bar:first-of-type sl-tab-item span{font-size:14px;}sl-tab-bar:first-of-type sl-tab-item span{margin-top:10px;}sl-tab-bar:first-of-type sl-tab-item i{height:40px;fill:var(--action-neutral-normal) !important;transition:0.3s scale ease !important;}sl-tab-bar:first-of-type .item:hover i{scale:0.9;}sl-tab-bar:first-of-type .item{height:100%;}sl-tab-bar:first-of-type .active .item, sl-tab-bar:first-of-type .item:hover{background:' + highLightColor + ' !important;padding-top:0 !important;}sl-tab-bar:first-of-type sl-tab-item{--action-neutral-normal:' + menuColor + ';--action-primary-normal:' + menuColor + ';display:block !important;width:100%;height:120px;}sl-header > div:first-of-type{--bg-elevated-weakest:' + highLightColor + ';}#mod-logo{--action-neutral-normal: ' + menuColor + ';width:100%;height:60px;margin:20px 0;}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width: 766px){sl-header:not(.with-back-button){border-bottom:none !important;--column-width: 100% !important;}sl-dagen-header{top:calc(64px + var(--safe-area-inset-top)) !important;border-bottom:none !important;}sl-berichten{background-color:var(--bg-neutral-none);}}</style>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">.container{max-width:100%;}sl-header sl-tab-bar div.item span,sl-tab-bar sl-tab-item .item span{text-overflow:ellipsis;overflow:hidden;text-wrap:nowrap;margin-left:-5px;width:calc(100% + 10px);}sl-tab-bar sl-tab-item .item span{' + (get('layout') == 3 ? 'margin-left:5px;' : '') + 'width:calc(100% - 10px);text-align:center;}#mod-menu-resizer{width:12px;height:100%;' + (get('layout') == 3 ? 'left' : 'right') + ':-4px;position:absolute;cursor:ew-resize;}sl-tab-bar sl-tab-item .item{padding-bottom:0 !important;max-height:100%;}sl-rooster-dag.dag{width:calc(100vw - 170px) !important;}hmy-notification-counter span{margin:0 !important;}sl-header hmy-notification-counter{position:absolute;right:30px;top:20px;}sl-tab-bar:first-of-type sl-tab-item{position:relative;max-height:calc(25% - 50px);}.active-border-top,.active-border-bottom{top:0;height:100% !important;width:4px !important;position:absolute;' + (get('layout') != 3 ? 'right' : 'left') + ':0;}sl-sidebar{height:100% !important;}.active-border{display:none !important;}sl-rooster-week.week{width:calc(100% - 55px) !important;}sl-sidebar-page{padding-right:0 !important;}sl-header > div:first-of-type i{z-index:10000;--fg-on-primary-weak:' + menuColor + ';--action-neutral-strong:' + menuColor + ';}sl-header > div:first-of-type{--bg-neutral-weakest:' + highLightColor + '}@media (max-height:670px){#mod-logo-wrapper{height:90px;}}@media (max-height:600px){#mod-logo-wrapper{display:none;}sl-tab-bar:first-of-type sl-tab-item{max-height:calc(25% - 20px) !important;}}</style>');
        }
        else if (get('layout') == 4) {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">:root{--safe-area-inset-left:calc((100% - 1200px) / 2) !important;--safe-area-inset-right:calc((100% - 1200px) / 2) !important;}#mod-background{left:0;width:100%;}sl-home{position:relative;border:var(--thinnest-solid-neutral-normal);display:block;background:var(--bg-neutral-none) !important;' + (get('ui') == 0 ? '' : 'backdrop-filter:blur(' + get('uiblur') + 'px);') + '}sl-rooster-week.week{width:calc(100% - 55px) !important;}</style>');
        }
               if (get('bools').charAt(BOOL_INDEX.MENU_ALWAYS_SHOW) == '0') {
            if (get('layout') == 1 || get('layout') == 4) {
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width:767px){sl-cijfers .tabs{position:relative !important;}sl-rooster sl-scrollable-title{display:none !important;}sl-studiewijzer sl-dagen-header,sl-cijfers .tabs{top:var(--safe-area-inset-top) !important;}}sl-dagen-header{position:relative !important;}sl-rooster-weken{margin-top:64px;}' + (get('layout') == 4 ? 'body:has(sl-cijfers) sl-header:first-of-type,body:has(sl-berichten) sl-header:first-of-type{margin-top:-64px;}' : '') + 'body:has(sl-cijfers),body:has(sl-berichten){margin-top:64px;}sl-rooster sl-header,sl-cijfers sl-header,sl-berichten sl-header{position:absolute !important;width:100%;}</style>');
            }
            else if (get('layout') == 5) {
                tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-rooster .headers-container,sl-studiewijzer-weken-header{top:0 !important;}</style>');
            }
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">@media (max-width:767px){sl-berichten div.tabs{top:unset !important;}}' + ((get('layout') == 2 || get('layout') == 3) ? '@media (min-width:1279px){.headers-container{top:calc(var(--safe-area-inset-top)) !important;}}' : '') + 'sl-berichten div.berichten-lijst{height:fit-content !important;}.main,sl-berichten div.tabs{position:relative !important;}sl-rooster .headers-container,sl-rooster .header,sl-cijfers .headers-container,sl-cijfers .header,sl-berichten .headers-container,sl-berichten .header{position:relative !important;}</style>');
        }
               if (get('bools').charAt(BOOL_INDEX.HIDE_MESSAGE_COUNT) == '1') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">hmy-notification-counter{display:none !important;}</style>');
        }
               if (get('bools').charAt(BOOL_INDEX.MENU_PAGE_NAME) == '0') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style class="mod-style">sl-header .item span{display:none !important;}@media (max-width:1279px){sl-tab-bar:first-of-type .item span{display:none !important;}' + ((get('layout') == 2 || get('layout') == 3 || get('layout') == 5) ? 'sl-tab-bar:first-of-type sl-tab-item i{padding-top:0!important}}sl-header .item i{padding-top:36px !important;}' : '}') + '</style>');
        }
    }

       function updateCheck() {
               if (!n(get('firstused'))) {
                       if (n(get('bools'))) {
                set('bools', '110001110111100000000000000000');
            }
            if (n(get('layout'))) {
                set('layout', 1);
            }
            if (get('uiblur') == null) {
                set('uiblur', 0);
            }
            if (get('ui') == null) {
                set('ui', 20);
            }
                       if (n(get('version')) && !n(get('primarycolor'))) {
                modMessage('Somtoday update!', 'Somtoday heeft een grote update gekregen! Somtoday Mod is hier op voorbereid en heeft ook een update gekregen. De mod-instellingen zijn nu te vinden in een apart tabblad in de instellingen van Somtoday. Het is mogelijk dat je sommige instellingen opnieuw moet instellen.', 'Doorgaan');
                id('mod-message-action1').addEventListener('click', closeModMessage);
                set('bools', '110001110111100000000000000000');
                set('secondarycolor', '#e69b22');
            }
            if (get('version') == 4) {
                set('bools', get('bools').replaceAt(12, '1'));
            }
            if (get('version') < 4.6) {
                if (get('blur') == '') {
                    set('blur', '0px');
                }
                else if (get('blur') != null && !isNaN(parseInt(get('blur')))) {
                    set('blur', get('blur') + 'px');
                }
                set('bools', get('bools').replaceAt(15, '1'));
            }
            if (get('version') < 4.7) {
                set('brightness', '100%');
                set('contrast', '100%');
                set('saturate', '100%');
                set('opacity', '100%');
                set('huerotate', '0deg');
                set('grayscale', '0%');
                set('sepia', '0%');
                set('invert', '0%');
            }
            if (get('version') < 4.9) {
                set('bools', get('bools').replaceAt(16, '1'));
            }
            if (n(get('homework'))) {
                set('homework', '[]');
            }
            if (get('version') < 5.1) {
                               if (n(get('nicknames'))) {
                    set('nicknames', '[]');
                }
                else if (parseJSON(get('nicknames')) == null) {
                    let json = [];
                    let namearray = get('nicknames').split('|');
                    for (let i = 0; i < (namearray.length / 2); i++) {
                        json.push([namearray[i * 2], namearray[i * 2 + 1]]);
                    }
                    set('nicknames', JSON.stringify(json));
                }
            }
            if (get('version') < 5.3) {
                set('bools', get('bools').replaceAt(17, '1'));
            }
        }
               set('version', version);
    }

       let primaryColorValue;
    let secondaryColorValue;
    let darkModeValue;
    let uiValue;
    let uiBlurValue;
    let layoutValue;
    function updateCssVariables() {
               if (!n(primaryColorValue) && primaryColorValue == get('primarycolor') && secondaryColorValue == get('secondarycolor') && darkModeValue == (tn('html', 0).classList.contains('dark') || tn('html', 0).classList.contains('night')) && uiValue == get('ui') && uiBlurValue == get('uiblur') && layoutValue == get('layout')) {
            return;
        }
        primaryColorValue = get('primarycolor');
        secondaryColorValue = get('secondarycolor');
        darkModeValue = tn('html', 0).classList.contains('dark') || tn('html', 0).classList.contains('night');
        darkmode = darkModeValue;
        uiValue = get('ui');
        uiBlurValue = get('uiblur');
        layoutValue = get('layout');
        tryRemove(id('mod-css-variables'));
        tryRemove(id('mod-css-variables-2'));
        if (get('ui') != 0 || get("backgroundtype") == 'live') {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-css-variables-2">sl-vakgemiddelden sl-dropdown,sl-cijfer-overzicht sl-dropdown{background:var(--bg-neutral-none);margin-top:-5px;margin-bottom:-5px;}' + (get('uiblur') == 0 ? '' : '.nieuw-bericht-form hmy-popup{top:70px !important;left:70px !important;}sl-plaatsingen,.nieuw-bericht-form,sl-header,sl-laatste-resultaat-item,sl-vakresultaat-item,.berichten-lijst,.vakken,' + (get('layout') == '4' ? '' : 'sl-vakresultaten,hmy-geen-data,hmy-switch-group:has(hmy-switch),sl-bericht-detail .header,sl-bericht-nieuw > .titel,') + '.headers-container,.tabs,sl-studiewijzer-week:has(.datum.vandaag),#mod-top-menu,sl-home > * > sl-tab-bar.show,sl-dagen-header,sl-scrollable-title,sl-studiewijzer-weken-header,sl-cijfer-overzicht-voortgang>div,sl-rooster-tijden{backdrop-filter:blur(' + get('uiblur') + 'px);}') + '@media(max-width:767px){sl-laatste-resultaat-item{backdrop-filter:none;}sl-laatsteresultaten{backdrop-filter:blur(' + get('uiblur') + 'px);}}:root, :root.dark.dark {--thinnest-solid-neutral-strong:1px solid transparent !important;--mod-semi-transparant:' + (tn('html', 0).classList.contains('night') ? '#000' : (darkmode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.65)')) + ';--text-weakest:var(--text-weak);--border-neutral-normal:rgba(' + (darkmode ? '55,64,72,0' : '208,214,220,0') + ');' + ((darkmode && get('ui') > 0.9) ? '--text-weak:#fff;' : '') + '--bg-neutral-none:' + (darkmode ? 'rgba(0,0,0,' + (1 - (get('ui') / 100)) + ')' : 'rgba(255,255,255,' + (1 - (get('ui') / 100)) + ')') + ';--bg-neutral-weakest:' + (darkmode ? 'rgba(0, 0, 0, ' + (1 - (get('ui') / 100)) + ')' : 'rgba(255, 255, 255, ' + (1 - (get('ui') / 100)) + ')') + ';}.mod-multi-choice,input:not(:hover):not(:focus):not(.mod-color-textinput):not(.ng-pristine):not(.ng-dirty),textarea:not(:hover):not(:focus):not(.ng-pristine):not(.ng-dirty),.select-selected{border:1px solid rgba(0,0,0,0.1) !important;}hmy-toggle .toggle:not(:has(input:checked)) .slider{border:2px solid rgba(0,0,0,0.1) !important;}sl-rooster sl-dag-header-tab,.periode-icon{background:none !important;}@media (max-width:767px){' + (platform == 'Android' ? 'sl-rooster-item{margin-left:8px;}' : '') + 'sl-vakgemiddelden sl-dropdown,sl-cijfer-overzicht sl-dropdown{margin-top:10px;}}</style>');
        }
               const purple100 = toBrightnessValue(get('secondarycolor'), 41);
        const purple80 = toBrightnessValue(get('secondarycolor'), 53);
        const purple50 = toBrightnessValue(get('secondarycolor'), 88);
        const purple30 = toBrightnessValue(get('secondarycolor'), 126);
        const purple10 = toBrightnessValue(get('secondarycolor'), 201);
        const purple0 = toBrightnessValue(get('secondarycolor'), 231);
        const green100 = toBrightnessValue(get('secondarycolor'), 46);
        const green90 = toBrightnessValue(get('secondarycolor'), 68);
        const green80 = toBrightnessValue(get('secondarycolor'), 113);
        const green50 = toBrightnessValue(get('secondarycolor'), 183);
        const green20 = toBrightnessValue(get('secondarycolor'), 209);
        const green10 = toBrightnessValue(get('secondarycolor'), 228);
        const green0 = toBrightnessValue(get('secondarycolor'), 245);
        const blue100 = toBrightnessValue(get("primarycolor"), 48);
        const blue80 = toBrightnessValue(get("primarycolor"), 56);
        const blue70 = toBrightnessValue(get("primarycolor"), 81);
        const blue60 = toBrightnessValue(get("primarycolor"), 89);
        const blue40 = toBrightnessValue(get("primarycolor"), 140);
        const blue30 = toBrightnessValue(get("primarycolor"), 169);
        const blue20 = toBrightnessValue(get("primarycolor"), 198);
        const blue0 = toBrightnessValue(get("primarycolor"), 241);
        const yellow60 = toBrightnessValue(get('secondarycolor'), 162);
        const yellow50 = toBrightnessValue(get('secondarycolor'), 173);
        const yellow20 = toBrightnessValue(get('secondarycolor'), 198);
        const orange60 = toBrightnessValue(get('secondarycolor'), 141);
        const orange30 = toBrightnessValue(get('secondarycolor'), 180);
        if (get('primarycolor') != '#0067c2' || get('secondarycolor') != '#e69b22') {
            const rgbcolor = hexToRgb(get('primarycolor'));
                       tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-css-variables">' + (darkmode ? '#mod-setting-panel ::placeholder{color:var(--action-neutral-normal) !important;}' : '') + ':root, :root.dark.dark {--mod-transparent:rgba(' + (darkmode ? '0,0,0,0.3' : '255,255,255,0.3') + ');--mod-ui-transparent:rgba(' + (darkmode ? '0,0,0' : '255,255,255') + ',' + (1 - (get('ui') / 100)) + ');--purple-100:' + purple100 + ';--purple-80:' + purple80 + ';--purple-50:' + purple50 + ';--purple-30:' + purple30 + ';--purple-10:' + purple10 + ';--purple-0:' + purple0 + ';--mod-semi-transparant:' + (darkmode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.65)') + ';--green-100:' + green100 + ';--green-90:' + green90 + ';--green-80:' + green80 + ';--green-50:' + green50 + ';--green-20:' + green20 + ';--green-10:' + green10 + ';--green-0:' + green0 + ';--thinnest-solid-neutral-strong:var(--b-thinnest) solid var(--border-neutral-normal);--blue-60:' + blue60 + ';--blue-70:' + blue70 + ';--yellow-60:' + yellow60 + ';--blue-0:' + blue0 + ';--blue-80:' + blue80 + ';--blue-30:' + blue30 + ';--blue-20:' + blue20 + ';--blue-100:' + blue100 + ';--yellow-20:' + yellow20 + ';--blue-40:' + blue40 + ';--yellow-50:' + yellow50 + ';--orange-30:' + orange30 + ';--orange-60:' + orange60 + ';}sl-account-modal i{--bg-neutral-moderate:' + (darkmode ? '#282e34' : '#dadfe3') + ';--fg-on-neutral-moderate:' + (darkmode ? '#eaedf0' : '#374048') + ';--bg-primary-weak:' + (darkmode ? '#1a344d' : '#e5f3ff') + ';--fg-on-primary-weak:' + (darkmode ? '#e5f3ff' : '#004180') + ';--bg-alternative-weak:' + (darkmode ? '#342060' : '#ece3ff') + ';--fg-on-alternative-weak:' + (darkmode ? '#d4c0fd' : '#29017d') + ';--bg-accent-weak:' + (darkmode ? '#4d3919' : '#fff4e3') + ';--fg-on-accent-weak:' + (darkmode ? '#fff4e3' : '#4d3919') + ';--bg-positive-weak:' + (darkmode ? '#133914' : '#ebf9ec') + ';--fg-on-positive-weak:' + (darkmode ? '#baf5bc' : '#145716') + ';}</style>');
        }
        else {
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-css-variables">' + (darkmode ? '#mod-setting-panel ::placeholder{color:var(--action-neutral-normal) !important;}' : '') + ':root, :root.dark.dark {--mod-transparent:rgba(' + (darkmode ? '0,0,0,0.3' : '255,255,255,0.3') + ');--mod-ui-transparent:rgba(' + (darkmode ? '0,0,0' : '255,255,255') + ',' + (1 - (get('ui') / 100)) + ');}</style>');
        }
    }

       window.logo = function (id, classname, color, style) {
        return '<svg' + (n(id) ? '' : ' id="' + id + '"') + (n(classname) ? '' : ' class="' + classname + '"') + (n(style) ? '' : ' style="' + style + '"') + ' viewBox="0 0 190.5 207" width="190.5" height="207"><g transform="translate(-144.8 -76.5)"><g><path d="M261 107.8v.3c0 3.7 3 6.7 6.6 6.7H299a6.8 6.8 0 0 1 6.7 7V143.2c0 3.7 3 6.7 6.7 6.7h16.1a6.8 6.8 0 0 1 6.7 7V201.6c0 3.7-3 6.6-6.7 6.7h-16.1a6.8 6.8 0 0 0-6.7 7v23.1c0 3.7-3 6.7-6.7 6.7h-10.5a6.8 6.8 0 0 0-6.7 7l-.1 24.4v.3c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.7-7v-24.6c0-3.8-2.8-6.9-6.3-6.9s-6.4 3.1-6.4 7v24.8c0 3.6-3 6.6-6.7 6.7h-22.3a6.8 6.8 0 0 1-6.6-7l.1-24.4v-.3c0-3.7-3-6.7-6.6-6.7h-10.5a6.8 6.8 0 0 1-6.7-7V215c0-3.6-3-6.6-6.7-6.7h-15.8a6.8 6.8 0 0 1-6.7-7V156.6c0-3.7 3-6.7 6.7-6.7h15.8a6.8 6.8 0 0 0 6.7-7v-21.4c0-3.6 3-6.6 6.7-6.7h31a6.8 6.8 0 0 0 6.7-7l.1-24.3v-.3c0-3.6 3-6.6 6.7-6.7h29a6.8 6.8 0 0 1 6.8 7z" fill="' + color + '" /><path d="M289.8 179.2c1.3 0 2.9.3 4.6.9 2.2.7 4 1.7 5 2.7v.2c.8.6 1.3 1.5 1.4 2.6 0 .9-.2 1.7-.6 2.3l-6.8 10.8a60.2 60.2 0 0 1-27.5 19.8c-8.5 3.2-17 4.7-24.7 4.5l-13.2-.1a1.6 1.6 0 0 1-1.7-1.5v-3.3a1.6 1.6 0 0 1 1.7-1.5h.1c7.9.3 16.3-1 24.7-4.2a56 56 0 0 0 34.3-31.4v-.3c.5-1 1.4-1.5 2.3-1.5z" fill="#000000" stroke="none" /><g class="glasses"><path d="M171.4 150.8v-9h137.2v9z" fill="#000000" stroke="none" /><path d="M175.7 155.5v-6h57.5v6z" fill="#000000" stroke="none" /><path d="M179.8 160v-9h48.9v9z" fill="#000000" stroke="none" /><path d="M184 164.5v-9h44.7v9z" fill="#000000" stroke="none" /><path d="M188.6 168.6v-7h31.7v7z" fill="#000000" stroke="none" /><path d="M245.9 155.5v-6h57.4v6z" fill="#000000" stroke="none" /><path d="M250 160v-9h48.8v9z" fill="#000000" stroke="none" /><path d="M254 164.5v-9h41v9z" fill="#000000" stroke="none" /><path d="M258.8 168.6v-7h31.6v7z" fill="#000000" stroke="none" /><path d="M184.5 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M188.8 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M193.3 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M193.3 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M197.6 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M202.1 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M254.8 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M259.1 159.2V155h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M263.6 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M263.6 155.1v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /><path d="M268 159.2V155h4.4v4.3z" fill="#ffffff" stroke="none" /><path d="M272.4 163.5v-4.3h4.5v4.3z" fill="#ffffff" stroke="none" /></g></g></g></svg>';
    };

       function getIcon(name, classname, color, start) {
        let svg;
        let viewbox = '0 0 512 512';
        n(name) ? name = '' : null;
        classname = n(classname) ? '' : 'class="' + classname + '" ';
        start = n(start) ? '' : start + ' ';
        switch (name) {
                       case 'envelope':
                svg = 'M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z';
                break;
            case 'right-from-bracket':
                svg = 'M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z';
                break;
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
            case 'circle-exclamation':
                svg = 'M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z';
                break;
            case 'upload':
                svg = 'M288 109.3V352c0 17.7-14.3 32-32 32s-32-14.3-32-32V109.3l-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352H192c0 35.3 28.7 64 64 64s64-28.7 64-64H448c35.3 0 64 28.7 64 64v32c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V416c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z';
                break;
            case 'download':
                svg = 'M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z';
                break;
            case 'chevron-right':
                svg = 'M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z';
                break;
            case 'brain':
                svg = 'M184 0c30.9 0 56 25.1 56 56V456c0 30.9-25.1 56-56 56c-28.9 0-52.7-21.9-55.7-50.1c-5.2 1.4-10.7 2.1-16.3 2.1c-35.3 0-64-28.7-64-64c0-7.4 1.3-14.6 3.6-21.2C21.4 367.4 0 338.2 0 304c0-31.9 18.7-59.5 45.8-72.3C37.1 220.8 32 207 32 192c0-30.7 21.6-56.3 50.4-62.6C80.8 123.9 80 118 80 112c0-29.9 20.6-55.1 48.3-62.1C131.3 21.9 155.1 0 184 0zM328 0c28.9 0 52.6 21.9 55.7 49.9c27.8 7 48.3 32.1 48.3 62.1c0 6-.8 11.9-2.4 17.4c28.8 6.2 50.4 31.9 50.4 62.6c0 15-5.1 28.8-13.8 39.7C493.3 244.5 512 272.1 512 304c0 34.2-21.4 63.4-51.6 74.8c2.3 6.6 3.6 13.8 3.6 21.2c0 35.3-28.7 64-64 64c-5.6 0-11.1-.7-16.3-2.1c-3 28.2-26.8 50.1-55.7 50.1c-30.9 0-56-25.1-56-56V56c0-30.9 25.1-56 56-56z';
                break;
            case 'bullseye':
                svg = 'M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z';
                break;
            case 'calculator':
                svg = 'M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM96 64H288c17.7 0 32 14.3 32 32v32c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32zm32 160a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM96 352a32 32 0 1 1 0-64 32 32 0 1 1 0 64zM64 416c0-17.7 14.3-32 32-32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-17.7 0-32-14.3-32-32zM192 256a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm32 64a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm64-64a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm32 64a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM288 448a32 32 0 1 1 0-64 32 32 0 1 1 0 64z';
                break;
            case 'arrows-left-right':
                svg = 'M406.6 374.6l96-96c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224l-293.5 0 41.4-41.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288l293.5 0-41.4 41.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z';
                break;
            case 'earth-europe':
                svg = 'M266.3 48.3L232.5 73.6c-5.4 4-8.5 10.4-8.5 17.1v9.1c0 6.8 5.5 12.3 12.3 12.3c2.4 0 4.8-.7 6.8-2.1l41.8-27.9c2-1.3 4.4-2.1 6.8-2.1h1c6.2 0 11.3 5.1 11.3 11.3c0 3-1.2 5.9-3.3 8l-19.9 19.9c-5.8 5.8-12.9 10.2-20.7 12.8l-26.5 8.8c-5.8 1.9-9.6 7.3-9.6 13.4c0 3.7-1.5 7.3-4.1 10l-17.9 17.9c-6.4 6.4-9.9 15-9.9 24v4.3c0 16.4 13.6 29.7 29.9 29.7c11 0 21.2-6.2 26.1-16l4-8.1c2.4-4.8 7.4-7.9 12.8-7.9c4.5 0 8.7 2.1 11.4 5.7l16.3 21.7c2.1 2.9 5.5 4.5 9.1 4.5c8.4 0 13.9-8.9 10.1-16.4l-1.1-2.3c-3.5-7 0-15.5 7.5-18l21.2-7.1c7.6-2.5 12.7-9.6 12.7-17.6c0-10.3 8.3-18.6 18.6-18.6H400c8.8 0 16 7.2 16 16s-7.2 16-16 16H379.3c-7.2 0-14.2 2.9-19.3 8l-4.7 4.7c-2.1 2.1-3.3 5-3.3 8c0 6.2 5.1 11.3 11.3 11.3h11.3c6 0 11.8 2.4 16 6.6l6.5 6.5c1.8 1.8 2.8 4.3 2.8 6.8s-1 5-2.8 6.8l-7.5 7.5C386 262 384 266.9 384 272s2 10 5.7 13.7L408 304c10.2 10.2 24.1 16 38.6 16H454c6.5-20.2 10-41.7 10-64c0-111.4-87.6-202.4-197.7-207.7zm172 307.9c-3.7-2.6-8.2-4.1-13-4.1c-6 0-11.8-2.4-16-6.6L396 332c-7.7-7.7-18-12-28.9-12c-9.7 0-19.2-3.5-26.6-9.8L314 287.4c-11.6-9.9-26.4-15.4-41.7-15.4H251.4c-12.6 0-25 3.7-35.5 10.7L188.5 301c-17.8 11.9-28.5 31.9-28.5 53.3v3.2c0 17 6.7 33.3 18.7 45.3l16 16c8.5 8.5 20 13.3 32 13.3H248c13.3 0 24 10.7 24 24c0 2.5 .4 5 1.1 7.3c71.3-5.8 132.5-47.6 165.2-107.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM187.3 100.7c-6.2-6.2-16.4-6.2-22.6 0l-32 32c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l32-32c6.2-6.2 6.2-16.4 0-22.6z';
                break;
            case 'landmark':
                svg = 'M240.1 4.2c9.8-5.6 21.9-5.6 31.8 0l171.8 98.1L448 104l0 .9 47.9 27.4c12.6 7.2 18.8 22 15.1 36s-16.4 23.8-30.9 23.8H32c-14.5 0-27.2-9.8-30.9-23.8s2.5-28.8 15.1-36L64 104.9V104l4.4-1.6L240.1 4.2zM64 224h64V416h40V224h64V416h48V224h64V416h40V224h64V420.3c.6 .3 1.2 .7 1.8 1.1l48 32c11.7 7.8 17 22.4 12.9 35.9S494.1 512 480 512H32c-14.1 0-26.5-9.2-30.6-22.7s1.1-28.1 12.9-35.9l48-32c.6-.4 1.2-.7 1.8-1.1V224z';
                break;
            case 'flask':
                svg = 'M288 0H160 128C110.3 0 96 14.3 96 32s14.3 32 32 32V196.8c0 11.8-3.3 23.5-9.5 33.5L10.3 406.2C3.6 417.2 0 429.7 0 442.6C0 480.9 31.1 512 69.4 512H378.6c38.3 0 69.4-31.1 69.4-69.4c0-12.8-3.6-25.4-10.3-36.4L329.5 230.4c-6.2-10.1-9.5-21.7-9.5-33.5V64c17.7 0 32-14.3 32-32s-14.3-32-32-32H288zM192 196.8V64h64V196.8c0 23.7 6.6 46.9 19 67.1L309.5 320h-171L173 263.9c12.4-20.2 19-43.4 19-67.1z';
                break;
            case 'microscope':
                svg = 'M160 32c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32zM32 448H320c70.7 0 128-57.3 128-128s-57.3-128-128-128V128c106 0 192 86 192 192c0 49.2-18.5 94-48.9 128H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H320 32c-17.7 0-32-14.3-32-32s14.3-32 32-32zm80-64H304c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z';
                break;
            case 'book':
                svg = 'M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z';
                break;
            case 'map-location-dot':
                viewbox = '0 0 576 512';
                svg = 'M408 120c0 54.6-73.1 151.9-105.2 192c-7.7 9.6-22 9.6-29.6 0C241.1 271.9 168 174.6 168 120C168 53.7 221.7 0 288 0s120 53.7 120 120zm8 80.4c3.5-6.9 6.7-13.8 9.6-20.6c.5-1.2 1-2.5 1.5-3.7l116-46.4C558.9 123.4 576 135 576 152V422.8c0 9.8-6 18.6-15.1 22.3L416 503V200.4zM137.6 138.3c2.4 14.1 7.2 28.3 12.8 41.5c2.9 6.8 6.1 13.7 9.6 20.6V451.8L32.9 502.7C17.1 509 0 497.4 0 480.4V209.6c0-9.8 6-18.6 15.1-22.3l122.6-49zM327.8 332c13.9-17.4 35.7-45.7 56.2-77V504.3L192 449.4V255c20.5 31.3 42.3 59.6 56.2 77c20.5 25.6 59.1 25.6 79.6 0zM288 152a40 40 0 1 0 0-80 40 40 0 1 0 0 80z';
                break;
            case 'sun':
                svg = 'M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z';
                break;
            case 'palette':
                svg = 'M512 256c0 .9 0 1.8 0 2.7c-.4 36.5-33.6 61.3-70.1 61.3H344c-26.5 0-48 21.5-48 48c0 3.4 .4 6.7 1 9.9c2.1 10.2 6.5 20 10.8 29.9c6.1 13.8 12.1 27.5 12.1 42c0 31.8-21.6 60.7-53.4 62c-3.5 .1-7 .2-10.6 .2C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z';
                break;
            case 'image':
                svg = 'M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6l96 0 32 0 208 0c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z';
                break;
            case 'grip-vertical':
                viewbox = '0 0 320 512';
                svg = 'M40 352l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zm192 0l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zM40 320c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0zM232 192l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40zM40 160c-22.1 0-40-17.9-40-40L0 72C0 49.9 17.9 32 40 32l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0zM232 32l48 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-48 0c-22.1 0-40-17.9-40-40l0-48c0-22.1 17.9-40 40-40z';
                break;
            case 'plus':
                viewbox = '0 0 448 512';
                svg = 'M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z';
                break;
            case 'edit':
                svg = 'M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z';
                break;
            case 'clock':
                viewbox = '0 0 640 640';
                svg = 'M320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z';
                break;
                       case 'homework':
                viewbox = '0 0 24 24';
                svg = 'm7 2.804 3.623-2.39a2.5 2.5 0 0 1 2.754 0l9.5 6.269A2.5 2.5 0 0 1 24 8.769v12.735a2.5 2.5 0 0 1-2.5 2.5h-19a2.5 2.5 0 0 1-2.5-2.5V8.77a2.5 2.5 0 0 1 1.123-2.086L3 5.444V1.047a.8.8 0 0 1 .8-.8h2.4a.8.8 0 0 1 .8.8zm0 16.362h3v-4.364h4v4.364h3v-12h-3v4.364h-4V7.166H7z';
                break;
            case 'assignment':
                viewbox = '0 0 24 24';
                svg = 'M16 0H8v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V0H3.429C1.538 0 0 1.677 0 3.74v16.52C0 22.323 1.538 24 3.429 24H20.57c1.892 0 3.43-1.677 3.43-3.74V3.74C24 1.677 22.462 0 20.571 0H19v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm-5.667 6.5a.5.5 0 0 1 .5-.5h2.334a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2.334a.5.5 0 0 1-.5-.5zm1.95 12.396 4.59-4.425a.47.47 0 0 0 0-.642l-1.115-1.173a.417.417 0 0 0-.61 0l-1.481 1.4v-3.61c0-.25-.179-.446-.417-.446h-2.5c-.238 0-.417.195-.417.446v3.61l-1.48-1.4a.417.417 0 0 0-.61 0l-1.117 1.173a.47.47 0 0 0 0 .642l4.547 4.425a.417.417 0 0 0 .61 0';
                break;
            case 'test':
                viewbox = '0 0 24 24';
                svg = 'M3.429 0A3.43 3.43 0 0 0 0 3.429V20.57A3.43 3.43 0 0 0 3.429 24H20.57A3.43 3.43 0 0 0 24 20.571V3.43A3.43 3.43 0 0 0 20.571 0zM17 8.966h-3.465v9.038h-2.912V8.966H7V6h10z';
                break;
            case 'palm':
                viewbox = '0 0 24 24';
                svg = 'M11.479 3.403c-1.089-.546-2.587-1.083-4.04-1.08-1.103.001-2.161.31-3.038 1.044-.604.506-1.172 1.255-1.606 2.35l1.588-.28A1.16 1.16 0 0 1 5.71 6.864l-.083.324c-.155.597-.323 1.248-.389 1.958a5.6 5.6 0 0 0-.018.814A63 63 0 0 1 7.6 8.25q.57-.396 1.115-.767c1.021-.7 1.94-1.33 2.575-1.82a1.16 1.16 0 0 1 1.42 0c.636.49 1.554 1.12 2.575 1.82q.545.372 1.116.767c.807.558 1.64 1.146 2.38 1.711a5.6 5.6 0 0 0-.02-.814c-.064-.71-.233-1.36-.388-1.957l-.083-.325a1.162 1.162 0 0 1 1.327-1.427l1.587.279c-.435-1.093-1.005-1.843-1.61-2.35-.88-.735-1.937-1.043-3.03-1.043-1.458 0-2.956.535-4.043 1.08a1.16 1.16 0 0 1-1.042 0ZM12 1.08C10.781.53 9.143-.003 7.434 0Zm0 0C13.22.53 14.856 0 16.564 0c1.537 0 3.152.44 4.52 1.584s2.387 2.907 2.892 5.365a1.16 1.16 0 0 1-1.338 1.377l-1.69-.297c.053.29.098.594.127.905.1 1.087.02 2.375-.632 3.608a1.16 1.16 0 0 1-1.825.301c-.775-.733-2.106-1.693-3.539-2.684-.347-.24-.701-.483-1.05-.722-.396-.272-.787-.54-1.157-.796-.295 2.517-.48 6.26.085 9.459 1.13.087 2.102.347 3.071.88 1.177.648 2.28 1.664 3.643 3.042A1.161 1.161 0 0 1 18.846 24H5.155a1.161 1.161 0 0 1-.959-1.817c.66-.964 1.803-1.977 3.134-2.748.968-.56 2.096-1.028 3.287-1.244-.503-3.114-.384-6.563-.129-9.109l-.517.355c-.349.239-.703.481-1.05.722-1.432.99-2.764 1.951-3.539 2.684a1.16 1.16 0 0 1-1.825-.3c-.651-1.234-.731-2.522-.631-3.609.028-.311.073-.615.125-.905l-1.688.297A1.16 1.16 0 0 1 .023 6.95C.53 4.492 1.544 2.73 2.91 1.586S5.892.003 7.434 0m.68 21.677h7.774a7 7 0 0 0-.98-.661c-.795-.438-1.616-.627-2.91-.629-1.161-.001-2.401.42-3.504 1.058q-.195.113-.38.232';
                break;
                       case 'logo':
                viewbox = '0 0 49 49';
                svg = 'M44.6819 17.3781H43.3148C41.7353 17.3781 40.4606 16.1316 40.4606 14.5871V11.9045C40.4606 10.36 39.1859 9.11355 37.6064 9.11355H32.6184C31.0389 9.11355 29.7642 7.8671 29.7642 6.32258V2.79097C29.7642 1.24645 28.4895 0 26.91 0H22.153C20.5734 0 19.2987 1.24645 19.2987 2.79097V6.32258C19.2987 7.8671 18.024 9.11355 16.4445 9.11355H11.4566C9.87706 9.11355 8.60236 10.36 8.60236 11.9045V14.5871C8.60236 16.1316 7.32766 17.3781 5.74814 17.3781H4.38107C2.80155 17.3781 1.52686 18.6245 1.52686 20.169V28.5058C1.52686 30.0503 2.80155 31.2968 4.38107 31.2968H5.72967C7.30918 31.2968 8.58388 32.5432 8.58388 34.0877V37.1768C8.58388 38.7213 9.85858 39.9677 11.4381 39.9677C13.0176 39.9677 14.2923 41.2142 14.2923 42.7587V46.209C14.2923 47.7535 15.567 49 17.1465 49H20.2132C21.7927 49 23.0674 47.7535 23.0674 46.209V41.4039C23.0674 40.609 23.7232 39.9768 24.5269 39.9768C25.3305 39.9768 25.9863 40.6181 25.9863 41.4039V46.209C25.9863 47.7535 27.261 49 28.8405 49H31.9072C33.4867 49 34.7614 47.7535 34.7614 46.209V42.7587C34.7614 41.2142 36.0361 39.9677 37.6156 39.9677C39.1951 39.9677 40.4698 38.7213 40.4698 37.1768V34.0877C40.4698 32.5432 41.7445 31.2968 43.324 31.2968H44.6726C46.2522 31.2968 47.5269 30.0503 47.5269 28.5058V20.169C47.5269 18.6245 46.2522 17.3781 44.6726 17.3781H44.6819ZM37.902 26.4465C37.006 29.3368 35.0108 31.7123 32.2859 33.1394C30.5863 34.0245 28.7297 34.4761 26.8453 34.4761C25.7184 34.4761 24.5823 34.3135 23.4738 33.9794C22.7995 33.7806 22.4208 33.0852 22.624 32.4348C22.8273 31.7755 23.5385 31.4052 24.2128 31.6039C26.522 32.2903 28.9606 32.0555 31.0943 30.9445C33.2188 29.8335 34.7799 27.9819 35.4819 25.7239C35.6851 25.0645 36.3963 24.7032 37.0706 24.8929C37.7449 25.0916 38.1236 25.7871 37.9204 26.4465H37.902Z';
                break;
            default:
                viewbox = '0 0 384 512';
                svg = 'M64 390.3L153.5 256 64 121.7V390.3zM102.5 448H281.5L192 313.7 102.5 448zm128-192L320 390.3V121.7L230.5 256zM281.5 64H102.5L192 198.3 281.5 64zM0 48C0 21.5 21.5 0 48 0H336c26.5 0 48 21.5 48 48V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V48z';
        }
        return '<svg ' + start + classname + 'height="1em" viewBox="' + viewbox + '"><path fill-rule="evenodd" ' + (n(color) ? '' : 'fill="' + color + '" ') + 'd="' + svg + '"/></svg>';
    }

       function modMessage(title, description, link1, link2, red1, red2, noBackgroundClick) {
        tn('sl-root', 0).inert = true;
        if (!n(tn('sl-modal', 0))) {
            tn('sl-modal', 0).inert = true;
        }
        while (!n(id('mod-message'))) {
            tryRemove(id('mod-message'));
        }
        const element = n(id('somtoday-mod')) ? tn('body', 0) : id('somtoday-mod');
        element.insertAdjacentHTML('afterbegin', '<div id="mod-message" class="mod-animation-playing"><center><div onclick="event.stopPropagation();"><h2>' + title + '</h2><p>' + description + '</p>' + (n(link1) ? '' : '<a id="mod-message-action1" class="mod-message-button' + (red1 ? ' mod-button-discouraged' : '') + '" tabindex="0">' + link1 + '</a>') + (n(link2) ? '' : '<a id="mod-message-action2" class="mod-message-button' + (red2 ? ' mod-button-discouraged' : '') + '" tabindex="0">' + link2 + '</a>') + '</div></center></div>');
        if (!n(link1)) {
            id('mod-message-action1').focus();
            setTimeout(function () {
                if (!n(id('mod-message-action1'))) {
                    id('mod-message-action1').addEventListener('keyup', (event) => {
                        if (event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 9) {
                            event.preventDefault();
                            if (!n(id('mod-message-action2'))) {
                                id('mod-message-action2').focus();
                            }
                        }
                    }, { once: true });
                }
            }, 50);
            id('mod-message-action1').addEventListener('click', function () { tn('sl-root', 0).removeAttribute('inert'); if (!n(tn('sl-modal', 0))) { tn('sl-modal', 0).removeAttribute('inert'); } }, { once: true });
        }
        if (!n(link2)) {
            setTimeout(function () {
                if (!n(id('mod-message-action2'))) {
                    id('mod-message-action2').addEventListener('keyup', (event) => {
                        if (event.keyCode === 39 || event.keyCode === 37 || event.keyCode === 9) {
                            event.preventDefault();
                            id('mod-message-action1').focus();
                        }
                    }, { once: true });
                }
            }, 50);
            id('mod-message-action2').addEventListener('click', function () { tn('sl-root', 0).removeAttribute('inert'); if (!n(tn('sl-modal', 0))) { tn('sl-modal', 0).removeAttribute('inert'); } }, { once: true });
            if (noBackgroundClick == null) {
                id('mod-message').addEventListener('click', function () { if (!n('mod-message-action2')) { id('mod-message-action2').click(); } }, { once: true });
            }
        }
        else if (!n(link1) && noBackgroundClick == null) {
            id('mod-message').addEventListener('click', function () { if (!n('mod-message-action1')) { id('mod-message-action1').click(); } }, { once: true });
        }
        setTimeout(function () {
            if (id('mod-message')) {
                id('mod-message').classList.remove('mod-animation-playing');
            }
        }, 500);
    }

    function closeModMessage() {
        id('mod-message').classList.add('mod-msg-closed');
        setTimeout(function () {
            tryRemove(id('mod-message'));
        }, 305);
    }

       let profilePictureChanged = false;
    function profilePicture() {
               if (!n(get('profilepic'))) {
            profilePictureChanged = true;
            tryRemove(id('mod-profile-picture'));
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-profile-picture">hmy-avatar{border-radius:var(--border-radius);overflow:hidden;}hmy-avatar>.container:not(:has(.initials)){background:url(\'' + get('profilepic') + '\') center / cover;}.foto{opacity:0 !important;}</style>');
        }
               else if (profilePictureChanged) {
            profilePictureChanged = false;
            tryRemove(id('mod-profile-picture'));
        }
    }

       function teacherNicknames() {
        if (!n(get('nicknames'))) {
            const namearray = JSON.parse(get('nicknames'));
            for (const nickname of namearray) {
                const real = nickname[0];
                const nick = nickname[1];
                if (real != '') {
                    const regex = new RegExp('(.*?)' + real.replace(/[.*+?^${"$"}{}()|[\]\\]/g, '\\${"$"}&') + '(.*?)', 'g');
                    const regexWhichPreservesIcons = new RegExp('(.*?)' + real.replace(/[.*+?^${"$"}{}()|[\]\\]/g, '\\${"$"}&') + '(.*?<hmy-?.*)', 'g');
                                       for (const element of cn('afzenders')) {
                        if (!element.classList.contains('mod-nickname')) {
                            const text = element.innerHTML.replace(regex, '${"$"}1' + nick + '${"$"}2');
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                                       for (const element of cn('ontvangers ellipsis')) {
                        if (!element.classList.contains('mod-nickname')) {
                            const text = element.innerHTML.replace(regex, '${"$"}1' + nick + '${"$"}2');
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                                                                             for (const element of cn('ontvangers')) {
                        if (!element.classList.contains('mod-nickname') && !element.classList.contains('ellipsis') && !element.classList.contains('input-veld') && (n(element.children[0]) || !element.children[0].classList.contains('zoekveld'))) {
                            setHTML(element, element.innerHTML.replaceAll('&nbsp;</span> <span>', ' ').replaceAll('<span>', '').replaceAll('</span><!---->', ''));
                            const text = element.innerHTML.replace(element.innerHTML.indexOf('<hmy-') != -1 ? regexWhichPreservesIcons : regex, '${"$"}1' + nick + '${"$"}2');
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                                       for (const element of cn('van')) {
                        if (!element.classList.contains('mod-nickname')) {
                            const text = element.innerHTML.replace(element.innerHTML.indexOf('<hmy-') != -1 ? regexWhichPreservesIcons : regex, '${"$"}1' + nick + '${"$"}2');
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                                       for (const element of cn('text text-content-smallest-semi')) {
                        if (!element.classList.contains('mod-nickname')) {
                            const text = element.innerHTML.replace(regex, '${"$"}1' + nick + '${"$"}2');
                            setHTML(element, '');
                            element.append(document.createRange().createContextualFragment(text));
                        }
                    }
                    for (const element of cn('docent')) {
                        if (!element.classList.contains('mod-nickname') && !n(element.getElementsByTagName('span')[0])) {
                            const text = element.getElementsByTagName('span')[0].innerHTML.replace(regex, '${"$"}1' + nick + '${"$"}2');
                            setHTML(element.getElementsByTagName('span')[0], '');
                            element.getElementsByTagName('span')[0].append(document.createRange().createContextualFragment(text));
                        }
                    }
                    for (const element of tn('hmy-internal-tag')) {
                        if (!element.classList.contains('mod-nickname') && !n(element.getElementsByTagName('span')[0])) {
                            if (nickname[2] && element.innerText == nickname[2]) {
                                setHTML(element.getElementsByTagName('span')[0], '');
                                element.getElementsByTagName('span')[0].append(document.createRange().createContextualFragment(nick));
                            }
                            else {
                                const text = element.getElementsByTagName('span')[0].innerHTML.replace(regex, '${"$"}1' + nick + '${"$"}2');
                                setHTML(element.getElementsByTagName('span')[0], '');
                                element.getElementsByTagName('span')[0].append(document.createRange().createContextualFragment(text));
                            }
                        }
                    }
                }
            }
            for (const element of cn('afzenders')) {
                element.classList.add('mod-nickname');
            }
            for (const element of cn('ontvangers')) {
                element.classList.add('mod-nickname');
            }
            for (const element of cn('van')) {
                element.classList.add('mod-nickname');
            }
            for (const element of cn('text text-content-smallest-semi')) {
                element.classList.add('mod-nickname');
            }
            for (const element of cn('docent')) {
                element.classList.add('mod-nickname');
            }
            for (const element of tn('hmy-internal-tag')) {
                element.classList.add('mod-nickname');
            }
        }
    }

       function userName() {
        if (!n(get('username')) && !n(get('realname')) && get('username') != get('realname')) {
                       for (const element of cn('persinfo')) {
                if (element.innerHTML.indexOf(get('realname')) != -1) {
                    setHTML(element, element.innerHTML.replaceAll(get('realname'), get('username')));
                }
            }
                       for (const element of cn('van')) {
                if (element.innerHTML.indexOf(get('realname')) != -1) {
                    setHTML(element, '');
                    element.append(document.createRange().createContextualFragment(get('username')));
                }
            }
                                             for (const element of cn('ontvangers')) {
                const search = get('realname').replaceAll(' ', '&nbsp;</span> <span>');
                if (element.innerHTML.indexOf(search) != -1) {
                    element.innerHTML = element.innerHTML.replaceAll(search, get('username').replaceAll(' ', '&nbsp</span> <span>'));
                }
            }
            for (const element of tn('hmy-internal-tag')) {
                if (!n(element.getElementsByTagName('span')[0]) && element.getElementsByTagName('span')[0].innerHTML.indexOf(get('realname')) != -1) {
                    element.getElementsByTagName('span')[0].innerHTML = element.getElementsByTagName('span')[0].innerHTML.replaceAll(get('realname'), get('username'));
                }
            }
            for (const element of cn('omschrijving')) {
                if (element.innerHTML.indexOf(get('realname')) != -1) {
                    element.innerHTML = element.innerHTML.replaceAll(get('realname'), get('username'));
                }
            }
            for (const element of tn('sl-html-content')) {
                if (!n(element.children[0]) && element.children[0].innerHTML.indexOf(get('realname')) != -1) {
                    element.children[0].innerHTML = element.children[0].innerHTML.replaceAll(get('realname'), get('username'));
                }
            }
        }
    }

          let logoClicks = 0;
    function modLogo() {
        if (get('layout') == 2 || get('layout') == 3 || get('layout') == 5) {
            if (n(id('mod-menu-resizer')) && !n(tn('sl-tab-bar', 0))) {
                tn('sl-tab-bar', 0).insertAdjacentHTML('beforeend', '<div id="mod-menu-resizer"></div>');
                let moving = false;
                if (get('layout') == 3) {
                    tn('body', 0).style.cssText = '--safe-area-inset-right: ' + menuWidth + 'px !important';
                }
                else {
                    tn('body', 0).style.cssText = '--safe-area-inset-left: ' + menuWidth + 'px !important';
                }
                id('mod-menu-resizer').addEventListener('mousedown', function (e) {
                    moving = true;
                });
                id('mod-menu-resizer').addEventListener('touchstart', function (e) {
                    moving = true;
                });
                document.addEventListener('mouseup', function (e) {
                    moving = false;
                });
                document.addEventListener('touchend', function (e) {
                    moving = false;
                });
                function moveEventHandler(e) {
                    if (moving) {
                        let clientXInput;
                        if (e.touches == null || e.touches[0] == null) {
                            clientXInput = e.clientX;
                        }
                        else {
                            clientXInput = e.touches[0].clientX;
                        }
                        if (get('layout') == 3) {
                            menuWidth = document.documentElement.clientWidth - clientXInput;
                            if (menuWidth < 50) {
                                menuWidth = 50;
                            }
                            else if (menuWidth > 700) {
                                menuWidth = 700;
                            }
                            set('menuwidth', menuWidth);
                            tn('body', 0).style.cssText = '--safe-area-inset-right: ' + menuWidth + 'px !important';
                        }
                        else {
                            menuWidth = clientXInput;
                            if (menuWidth < 50) {
                                menuWidth = 50;
                            }
                            else if (menuWidth > 700) {
                                menuWidth = 700;
                            }
                            set('menuwidth', menuWidth);
                            tn('body', 0).style.cssText = '--safe-area-inset-left: ' + menuWidth + 'px !important';
                        }
                    }
                }
                document.addEventListener('mousemove', moveEventHandler);
                document.addEventListener('touchmove', moveEventHandler);
            }
        }
        else {
            tn('body', 0).style.cssText = '';
        }

               if (!n(cn('mod-logo-hat-clicked', 0)) || !n(cn('mod-logo-decoration-clicked', 0))) {
            return;
        }

        tryRemove(id('mod-logo-wrapper'));
        tryRemove(id('mod-logo-hat'));
        tryRemove(id('mod-logo-inserted'));
        if (get('layout') == 2 || get('layout') == 3 || get('layout') == 5) {
            const logoHTML = '<div id="mod-logo-wrapper">' + (get('bools').charAt(BOOL_INDEX.MOD_LOGO) == '0' ? getIcon('logo', null, menuColor, ' id="mod-logo"') : window.logo('mod-logo', '" data-clicks="' + (n(id('mod-logo')) ? '0' : id('mod-logo').dataset.clicks), 'var(--action-neutral-normal)')) + '</div>';
            if (n(id('mod-logo')) && tn('sl-header', 0) && tn('sl-header', 0).getElementsByTagName('sl-tab-bar')[0]) {
                tn('sl-header', 0).getElementsByTagName('sl-tab-bar')[0].insertAdjacentHTML('afterbegin', logoHTML);
            }
            else if (n(id('mod-logo')) && tn('sl-tab-bar', 0)) {
                tn('sl-tab-bar', 0).insertAdjacentHTML('afterbegin', logoHTML);
            }
            else {
                return;
            }
            id('mod-logo').addEventListener('click', function () {
                logoClicks += 1;
                if (logoClicks == 10) {
                    logoClicks = 0;
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen();
                    }
                    tn('html', 0).style.overflowY = 'hidden';
                    id('somtoday-mod').insertAdjacentHTML('beforeend', '<div id="blue-screen-of-death"><svg xmlns="http://www.w3.org/2000/svg" width="806.81042" height="588.71942" viewBox="0 0 806.81042 588.71944"><rect style="fill:#1173aa;" width="806.81042" height="588.71942" x="0" y="0"/><g transform="matrix(4.2021373,0,0,4.2021373,0,1.0984253e-5)"><g><path style="fill:#fff;" d="m 28.976126,48.524788 q -1.09375,0 -1.835938,-0.703125 -0.742187,-0.722656 -0.742187,-1.777344 0,-1.074219 0.742187,-1.777344 0.742188,-0.722656 1.835938,-0.722656 1.113281,0 1.855468,0.722656 0.742188,0.703125 0.742188,1.777344 0,1.054688 -0.742188,1.777344 -0.742187,0.703125 -1.855468,0.703125 z m 0,14.902344 q -1.09375,0 -1.835938,-0.703125 -0.742187,-0.722657 -0.742187,-1.777344 0,-1.074219 0.742187,-1.777344 0.742188,-0.722656 1.835938,-0.722656 1.113281,0 1.855468,0.722656 0.742188,0.703125 0.742188,1.777344 0,1.054687 -0.742188,1.777344 -0.742187,0.703125 -1.855468,0.703125 z"/><path style="fill:#fff;" d="m 42.101126,68.974007 q -3.125,-3.417969 -4.53125,-7.363282 -1.386719,-3.964843 -1.386719,-9.335937 0,-5.214844 1.347656,-9.160156 1.367188,-3.964844 4.375,-7.539063 l 1.875,1.5625 q -2.382812,3.417969 -3.476562,7.011719 -1.074219,3.574219 -1.074219,8.125 0,4.433594 1.132812,8.027344 1.132813,3.574218 3.652344,7.109375 z" /></g><g><path style="line-height:142.99999475%;letter-spacing:-0.30000001px;fill:#ffffff" d="m 29.713547,80.950829 -1.688233,-3.325196 h 0.688477 l 1.186523,2.391358 q 0.02197,0.04761 0.05859,0.142822 0.03662,0.09155 0.06958,0.179443 h 0.01099 q 0.03296,-0.120849 0.135499,-0.322265 l 1.241455,-2.391358 h 0.644531 l -1.732178,3.310547 v 1.940918 h -0.615234 z" /><path style="line-height:142.99999475%;letter-spacing:-0.30000001px;fill:#ffffff" d="m 34.016818,82.968651 q -0.55664,0 -0.981445,-0.230713 -0.421143,-0.230713 -0.655518,-0.651856 -0.230712,-0.424804 -0.230712,-0.977783 0,-0.560302 0.230712,-0.988769 0.234375,-0.428467 0.655518,-0.662842 0.424805,-0.234375 0.981445,-0.234375 0.545655,0 0.959473,0.234375 0.413818,0.234375 0.637207,0.662842 0.223389,0.424804 0.219727,0.988769 0,0.556641 -0.227051,0.977783 -0.223389,0.421143 -0.637207,0.651856 -0.410157,0.230713 -0.952149,0.230713 z m 0,-0.578613 q 0.344239,0 0.60791,-0.157471 0.267334,-0.161133 0.413819,-0.45044 0.150146,-0.292968 0.157471,-0.673828 -0.0073,-0.388183 -0.157471,-0.684814 -0.150147,-0.296631 -0.413819,-0.457764 -0.263671,-0.164795 -0.60791,-0.164795 -0.366211,0 -0.648193,0.164795 -0.27832,0.164795 -0.432129,0.461426 -0.150146,0.296631 -0.150146,0.688476 0,0.38086 0.150146,0.670166 0.153809,0.289307 0.432129,0.446778 0.27832,0.157471 0.648193,0.157471 z" /><path style="fill:#fff;" d="m 39.323508,83.01992 q -0.212403,-0.380859 -0.300293,-0.717773 -0.05493,0.150146 -0.212403,0.300293 -0.153808,0.150146 -0.402832,0.252685 -0.245361,0.102539 -0.560302,0.102539 -0.516358,0 -0.834961,-0.201416 -0.318604,-0.201416 -0.454102,-0.520019 -0.135498,-0.322266 -0.135498,-0.706787 v -2.215576 h 0.600586 v 2.028808 q 0,0.479737 0.197754,0.769043 0.201416,0.289307 0.758057,0.289307 0.413818,0 0.684814,-0.194092 0.270996,-0.197754 0.270996,-0.655518 v -2.24121 h 0.600586 v 2.358398 q 0.0037,0.53833 0.318604,1.105957 z" /><path style="fill:#fff;" d="m 41.29006,79.654442 q 0.377197,-0.435791 0.966797,-0.435791 0.164795,0 0.344238,0.03296 L 42.498556,79.8229 q -0.102539,-0.01099 -0.201416,-0.01099 -0.567627,0 -0.941162,0.351562 v 2.713623 h -0.600586 v -3.566894 h 0.454102 l 0.08057,0.344238 z" /><path style="fill:#fff;" d="m 45.497824,77.625633 h 1.442871 q 0.545654,0 0.941162,0.179444 0.39917,0.179443 0.611572,0.531005 0.212403,0.351563 0.212403,0.856934 0,0.516357 -0.245362,0.900879 -0.241699,0.384521 -0.67749,0.593262 -0.432129,0.205078 -0.985107,0.205078 h -0.684815 v 1.984863 h -0.615234 z m 1.256103,2.713623 q 0.615235,0 0.963135,-0.281982 0.3479,-0.281983 0.3479,-0.834961 0,-0.53833 -0.314941,-0.787354 -0.314941,-0.252685 -0.915527,-0.252685 l -0.725098,0.0037 v 2.15332 h 0.644531 z" /><path style="fill:#fff;" d="m 51.661154,82.95034 q -0.736084,0 -1.259766,-0.314941 -0.523681,-0.314942 -0.79834,-0.915527 -0.270996,-0.604249 -0.270996,-1.453858 0,-0.864258 0.314942,-1.479492 0.314941,-0.615234 0.915527,-0.933838 0.604248,-0.322266 1.450195,-0.322266 0.563965,0 1.186524,0.161133 l -0.179444,0.585938 q -0.142822,-0.04761 -0.46875,-0.08423 -0.322265,-0.03662 -0.545654,-0.04761 -0.04395,-0.0037 -0.131836,-0.0037 -0.585937,0 -1.003418,0.256347 -0.41748,0.252686 -0.637207,0.725098 -0.219726,0.472412 -0.219726,1.113281 0,0.662842 0.201416,1.138916 0.205078,0.476074 0.593261,0.72876 0.391846,0.252686 0.9375,0.252686 0.322266,0 0.65918,-0.0769 0.336914,-0.0769 0.703125,-0.201416 l 0.205078,0.560303 q -0.344238,0.131836 -0.794678,0.223389 -0.446777,0.08789 -0.856933,0.08789 z" /><path style="line-height:142.99999475%;letter-spacing:-0.1px;fill:#ffffff" d="m 56.832052,79.654442 q 0.377197,-0.435791 0.966797,-0.435791 0.164795,0 0.344238,0.03296 L 58.040548,79.8229 q -0.102539,-0.01099 -0.201416,-0.01099 -0.567627,0 -0.941162,0.351562 v 2.713623 h -0.600586 v -3.566894 h 0.454102 l 0.08057,0.344238 z" /><path style="line-height:142.99999475%;letter-spacing:-0.1px;fill:#ffffff" d="m 61.27673,83.01992 q -0.201416,-0.351562 -0.303955,-0.725097 -0.06226,0.183105 -0.2417,0.336914 -0.179443,0.153808 -0.428467,0.241699 -0.249023,0.08789 -0.505371,0.08789 -0.362548,0 -0.651855,-0.113526 -0.285645,-0.113525 -0.454102,-0.351562 -0.164795,-0.238037 -0.164795,-0.593262 0,-0.344238 0.17212,-0.596924 0.172119,-0.256347 0.48706,-0.391846 0.318604,-0.135498 0.739746,-0.135498 0.505371,0 0.963135,0.26001 v -0.373535 q 0,-0.439453 -0.205078,-0.640869 -0.205078,-0.201416 -0.60791,-0.201416 -0.153809,0 -0.443116,0.02563 -0.285644,0.02197 -0.534667,0.06225 l -0.10254,-0.600585 q 0.446778,-0.05127 0.699463,-0.07324 0.256348,-0.02197 0.428467,-0.02197 0.666504,0 1.010742,0.351562 0.344239,0.351563 0.347901,1.047363 l 0.0073,1.054688 q 0.0037,0.53833 0.318603,1.105957 z m -1.343995,-0.618896 q 0.285645,0 0.501709,-0.09888 0.216065,-0.09888 0.333252,-0.281983 0.12085,-0.183105 0.12085,-0.421142 v -0.03296 q -0.183105,-0.102539 -0.406494,-0.157471 -0.223389,-0.05859 -0.465088,-0.05859 -0.391846,0 -0.626221,0.139161 -0.234375,0.135498 -0.234375,0.377197 0,0.157471 0.09521,0.27832 0.09888,0.12085 0.274658,0.19043 0.175782,0.06592 0.406494,0.06592 z" /><path style="fill:#fff;" d="m 64.21262,79.214989 q 0.46875,0 0.787353,0.183105 0.318604,0.183106 0.476075,0.505371 0.161132,0.322266 0.161132,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194091,-0.736084 -0.19043,-0.285644 -0.633545,-0.289306 -0.314942,0.0037 -0.593262,0.117187 -0.274658,0.109864 -0.487061,0.31128 l -0.0073,2.662353 h -0.600586 l 0.0073,-3.566894 h 0.443116 l 0.113525,0.355224 q 0.424805,-0.450439 1.12793,-0.450439 z" /><path style="line-height:142.99999475%;letter-spacing:-0.49000001px;fill:#ffffff" d="m 68.644493,78.19326 q -0.175781,0 -0.292969,-0.117187 -0.117187,-0.117188 -0.117187,-0.292969 0,-0.172119 0.117187,-0.289307 0.117188,-0.117187 0.292969,-0.117187 0.172119,0 0.289307,0.117187 0.117187,0.117188 0.117187,0.289307 0,0.175781 -0.117187,0.292969 -0.117188,0.117187 -0.289307,0.117187 z m -0.311279,1.116944 H 68.9338 v 3.566894 h -0.600586 z" /><path style="fill:#fff;" d="m 71.362503,79.214989 q 0.46875,0 0.787354,0.183105 0.318603,0.183106 0.476074,0.505371 0.161133,0.322266 0.161133,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.19043,-0.285644 -0.633545,-0.289306 -0.314941,0.0037 -0.593262,0.117187 -0.274658,0.109864 -0.48706,0.31128 l -0.0073,2.662353 h -0.600585 l 0.0073,-3.566894 h 0.443115 l 0.113525,0.355224 q 0.424805,-0.450439 1.12793,-0.450439 z" /><path style="fill:#fff;" d="m 74.680374,79.844872 v 1.926269 q 0,0.161133 0.06958,0.314941 0.07324,0.150147 0.219727,0.249024 0.146484,0.09522 0.355224,0.09522 0.146485,0 0.333252,-0.02564 v 0.53833 q -0.238037,0.02197 -0.483398,0.02197 -0.340576,0 -0.578613,-0.146485 -0.238037,-0.146484 -0.358887,-0.391845 -0.12085,-0.249024 -0.12085,-0.549317 v -2.03247 h -0.644531 v -0.531006 h 0.644531 v -1.281739 h 0.563965 v 1.281739 h 0.981445 v 0.531006 h -0.981445 z" /><path style="fill:#fff;" d="m 78.078812,82.968651 q -0.556641,0 -0.981446,-0.230713 -0.421142,-0.230713 -0.655517,-0.651856 -0.230713,-0.424804 -0.230713,-0.977783 0,-0.560302 0.230713,-0.988769 0.234375,-0.428467 0.655517,-0.662842 0.424805,-0.234375 0.981446,-0.234375 0.545654,0 0.959472,0.234375 0.413819,0.234375 0.637207,0.662842 0.223389,0.424804 0.219727,0.988769 0,0.556641 -0.227051,0.977783 -0.223389,0.421143 -0.637207,0.651856 -0.410156,0.230713 -0.952148,0.230713 z m 0,-0.578613 q 0.344238,0 0.60791,-0.157471 0.267334,-0.161133 0.413818,-0.45044 0.150147,-0.292968 0.157471,-0.673828 -0.0073,-0.388183 -0.157471,-0.684814 -0.150146,-0.296631 -0.413818,-0.457764 -0.263672,-0.164795 -0.60791,-0.164795 -0.366211,0 -0.648194,0.164795 -0.27832,0.164795 -0.432129,0.461426 -0.150146,0.296631 -0.150146,0.688476 0,0.38086 0.150146,0.670166 0.153809,0.289307 0.432129,0.446778 0.278321,0.157471 0.648194,0.157471 z" /><path style="fill:#fff;" d="m 85.392044,83.01992 q -0.201416,-0.351562 -0.303955,-0.725097 -0.06226,0.183105 -0.241699,0.336914 -0.179444,0.153808 -0.428467,0.241699 -0.249023,0.08789 -0.505371,0.08789 -0.362549,0 -0.651856,-0.113526 -0.285644,-0.113525 -0.454101,-0.351562 -0.164795,-0.238037 -0.164795,-0.593262 0,-0.344238 0.172119,-0.596924 0.172119,-0.256347 0.487061,-0.391846 0.318603,-0.135498 0.739746,-0.135498 0.505371,0 0.963134,0.26001 v -0.373535 q 0,-0.439453 -0.205078,-0.640869 -0.205078,-0.201416 -0.60791,-0.201416 -0.153808,0 -0.443115,0.02563 -0.285645,0.02197 -0.534668,0.06225 L 83.11055,79.310204 q 0.446777,-0.05127 0.699463,-0.07324 0.256347,-0.02197 0.428467,-0.02197 0.666504,0 1.010742,0.351562 0.344238,0.351563 0.3479,1.047363 l 0.0073,1.054688 q 0.0037,0.53833 0.318604,1.105957 z M 84.04805,82.401024 q 0.285644,0 0.501709,-0.09888 0.216064,-0.09888 0.333252,-0.281983 0.120849,-0.183105 0.120849,-0.421142 v -0.03296 q -0.183105,-0.102539 -0.406494,-0.157471 -0.223388,-0.05859 -0.465088,-0.05859 -0.391845,0 -0.62622,0.139161 -0.234375,0.135498 -0.234375,0.377197 0,0.157471 0.09522,0.27832 0.09888,0.12085 0.274658,0.19043 0.175781,0.06592 0.406494,0.06592 z" /><path style="line-height:142.99999475%;letter-spacing:-0.27000001px;fill:#ffffff" d="m 90.639847,79.214989 q 0.505371,0 0.864258,0.212402 0.362548,0.20874 0.549316,0.615234 0.19043,0.402832 0.19043,0.970459 0,0.596924 -0.197754,1.036377 -0.197754,0.435791 -0.5896,0.673828 -0.388183,0.238038 -0.948486,0.238038 -0.86792,0 -1.109619,-0.637207 v 2.274169 h -0.604248 v -5.288085 h 0.446777 l 0.142822,0.454101 q 0.245362,-0.263672 0.567627,-0.406494 0.325928,-0.142822 0.688477,-0.142822 z m -0.08789,3.186035 q 0.300293,0 0.534668,-0.146485 0.238037,-0.146484 0.373535,-0.457763 0.13916,-0.314942 0.13916,-0.791016 0,-0.567627 -0.270996,-0.878906 -0.267334,-0.311279 -0.761718,-0.311279 -0.281983,0 -0.585938,0.09888 -0.300293,0.09521 -0.582275,0.270996 v 1.160888 q 0,0.402832 0.190429,0.64087 0.19043,0.234375 0.45044,0.325927 0.263672,0.08789 0.512695,0.08789 z" /><path style="line-height:142.99999475%;letter-spacing:-0.27000001px;fill:#ffffff" d="m 93.467987,79.654442 q 0.377197,-0.435791 0.966797,-0.435791 0.164795,0 0.344238,0.03296 L 94.676483,79.8229 q -0.102539,-0.01099 -0.201416,-0.01099 -0.567627,0 -0.941162,0.351562 v 2.713623 h -0.600586 v -3.566894 h 0.454102 l 0.08057,0.344238 z" /><path style="fill:#fff;" d="m 96.874748,82.968651 q -0.55664,0 -0.981445,-0.230713 -0.421143,-0.230713 -0.655518,-0.651856 -0.230713,-0.424804 -0.230713,-0.977783 0,-0.560302 0.230713,-0.988769 0.234375,-0.428467 0.655518,-0.662842 0.424805,-0.234375 0.981445,-0.234375 0.545655,0 0.959473,0.234375 0.413818,0.234375 0.637207,0.662842 0.223389,0.424804 0.219726,0.988769 0,0.556641 -0.22705,0.977783 -0.223389,0.421143 -0.637207,0.651856 -0.410157,0.230713 -0.952149,0.230713 z m 0,-0.578613 q 0.344239,0 0.60791,-0.157471 0.267334,-0.161133 0.413819,-0.45044 0.150146,-0.292968 0.15747,-0.673828 -0.0073,-0.388183 -0.15747,-0.684814 -0.150147,-0.296631 -0.413819,-0.457764 -0.263671,-0.164795 -0.60791,-0.164795 -0.366211,0 -0.648193,0.164795 -0.27832,0.164795 -0.432129,0.461426 -0.150147,0.296631 -0.150147,0.688476 0,0.38086 0.150147,0.670166 0.153809,0.289307 0.432129,0.446778 0.27832,0.157471 0.648193,0.157471 z" /><path style="line-height:142.99999475%;letter-spacing:-0.43000001px;fill:#ffffff" d="m 101.51098,79.214989 q 0.52368,0 0.88257,0.223388 0.36255,0.219727 0.54199,0.626221 0.17944,0.402832 0.17944,0.948486 0,0.596924 -0.19775,1.036377 -0.19776,0.435791 -0.5896,0.673828 -0.38818,0.238038 -0.94849,0.238038 -0.84961,0 -1.09863,-0.611573 l -0.17212,0.527344 H 99.6726 L 99.6653,77.32534 h 0.60424 v 2.420655 q 0.49439,-0.531006 1.24146,-0.531006 z m -0.0879,3.186035 q 0.30029,0 0.53467,-0.146485 0.23803,-0.146484 0.37353,-0.457763 0.13916,-0.314942 0.13916,-0.791016 0,-0.3479 -0.12085,-0.615234 -0.11719,-0.270996 -0.35156,-0.421143 -0.23438,-0.153808 -0.5603,-0.153808 -0.36621,0 -0.61158,0.0769 -0.24169,0.07324 -0.55664,0.289307 v 0.688476 l 0.004,0.476074 q 0,0.402832 0.18676,0.64087 0.19043,0.234375 0.45044,0.325927 0.26001,0.08789 0.5127,0.08789 z" /><path style="line-height:142.99999475%;letter-spacing:-0.18000001px;fill:#ffffff" d="m 103.64079,77.32534 h 0.60059 v 5.551758 h -0.60059 z" /><path style="line-height:142.99999475%;letter-spacing:-0.18000001px;fill:#ffffff" d="m 106.96543,82.408348 q 0.24536,0 0.52002,-0.05493 0.27466,-0.05493 0.54932,-0.161132 l 0.18676,0.512695 q -0.26001,0.109863 -0.65917,0.183105 -0.39917,0.07324 -0.7251,0.07324 -0.86426,0 -1.34033,-0.461426 -0.47608,-0.465088 -0.47608,-1.428223 0,-0.600586 0.20874,-1.018066 0.2124,-0.421143 0.61157,-0.637207 0.39917,-0.216065 0.95948,-0.216065 0.49438,0 0.82763,0.230713 0.33325,0.227051 0.49439,0.596924 0.16113,0.366211 0.16113,0.787354 0,0.289306 -0.0806,0.578613 l -2.54882,0.01831 q 0.0806,0.494385 0.41015,0.747071 0.32959,0.249023 0.90088,0.249023 z m -0.24536,-2.633057 q -0.52002,0 -0.78369,0.300293 -0.26367,0.300293 -0.30029,0.809327 l 1.9812,-0.01831 q 0.007,-0.08789 0.007,-0.131836 0,-0.249023 -0.0915,-0.465088 -0.0916,-0.219726 -0.29663,-0.355224 -0.20142,-0.139161 -0.51636,-0.139161 z" /><path style="line-height:142.99999475%;letter-spacing:-0.1px;fill:#ffffff" d="m 113.01468,79.214989 q 0.42847,0 0.72143,0.183105 0.29664,0.183106 0.44312,0.505371 0.14648,0.322266 0.15015,0.739746 v 2.233887 h -0.60059 v -2.06543 q -0.007,-0.454101 -0.19043,-0.736084 -0.1831,-0.285644 -0.60059,-0.285644 -0.29663,0 -0.5603,0.106201 -0.26001,0.102539 -0.4541,0.285645 0.0513,0.223388 0.0513,0.461425 v 2.233887 h -0.60059 v -2.06543 q -0.007,-0.454101 -0.19043,-0.736084 -0.1831,-0.285644 -0.60058,-0.285644 -0.27832,0 -0.52735,0.106201 -0.24902,0.102539 -0.44311,0.289307 l -0.007,2.69165 h -0.60059 l 0.007,-3.566894 h 0.44312 l 0.11352,0.351562 q 0.41382,-0.446777 1.09131,-0.446777 0.37354,0 0.64453,0.13916 0.27466,0.13916 0.43579,0.395508 0.53467,-0.534668 1.27442,-0.534668 z" /><path style="fill:#fff;" d="m 118.17713,79.844872 v 1.926269 q 0,0.161133 0.0696,0.314941 0.0732,0.150147 0.21973,0.249024 0.14648,0.09522 0.35522,0.09522 0.14649,0 0.33325,-0.02564 v 0.53833 q -0.23803,0.02197 -0.48339,0.02197 -0.34058,0 -0.57862,-0.146485 -0.23803,-0.146484 -0.35888,-0.391845 -0.12085,-0.249024 -0.12085,-0.549317 v -2.03247 h -0.64453 v -0.531006 h 0.64453 v -1.281739 h 0.56396 v 1.281739 h 0.98145 v 0.531006 h -0.98145 z" /><path style="line-height:142.99999475%;letter-spacing:-0.14px;fill:#ffffff" d="m 121.65614,79.214989 q 0.46875,0 0.78735,0.183105 0.3186,0.183106 0.47607,0.505371 0.16114,0.322266 0.16114,0.739746 v 2.233887 h -0.60059 v -2.06543 q 0,-0.450439 -0.19409,-0.736084 -0.19409,-0.285644 -0.63355,-0.285644 -0.31494,0 -0.59326,0.113525 -0.27832,0.109864 -0.49438,0.307617 v 2.666016 h -0.60059 v -5.55542 h 0.60059 v 2.307129 q 0.42114,-0.413818 1.09131,-0.413818 z" /><path style="line-height:142.99999475%;letter-spacing:-0.14px;fill:#ffffff" d="m 126.55154,83.01992 q -0.20142,-0.351562 -0.30396,-0.725097 -0.0623,0.183105 -0.2417,0.336914 -0.17944,0.153808 -0.42846,0.241699 -0.24903,0.08789 -0.50538,0.08789 -0.36254,0 -0.65185,-0.113526 -0.28565,-0.113525 -0.4541,-0.351562 -0.1648,-0.238037 -0.1648,-0.593262 0,-0.344238 0.17212,-0.596924 0.17212,-0.256347 0.48706,-0.391846 0.31861,-0.135498 0.73975,-0.135498 0.50537,0 0.96313,0.26001 v -0.373535 q 0,-0.439453 -0.20508,-0.640869 -0.20507,-0.201416 -0.60791,-0.201416 -0.1538,0 -0.44311,0.02563 -0.28565,0.02197 -0.53467,0.06225 l -0.10254,-0.600585 q 0.44678,-0.05127 0.69947,-0.07324 0.25634,-0.02197 0.42846,-0.02197 0.66651,0 1.01074,0.351562 0.34424,0.351563 0.3479,1.047363 l 0.007,1.054688 q 0.004,0.53833 0.3186,1.105957 l -0.531,0.245361 z m -1.344,-0.618896 q 0.28565,0 0.50171,-0.09888 0.21607,-0.09888 0.33325,-0.281983 0.12085,-0.183105 0.12085,-0.421142 v -0.03296 q -0.1831,-0.102539 -0.40649,-0.157471 -0.22339,-0.05859 -0.46509,-0.05859 -0.39184,0 -0.62622,0.139161 -0.23437,0.135498 -0.23437,0.377197 0,0.157471 0.0952,0.27832 0.0989,0.12085 0.27466,0.19043 0.17578,0.06592 0.40649,0.06592 z" /><path style="fill:#fff;" d="m 128.51725,79.844872 v 1.926269 q 0,0.161133 0.0696,0.314941 0.0732,0.150147 0.21973,0.249024 0.14648,0.09522 0.35522,0.09522 0.14649,0 0.33325,-0.02564 v 0.53833 q -0.23803,0.02197 -0.4834,0.02197 -0.34057,0 -0.57861,-0.146485 -0.23804,-0.146484 -0.35889,-0.391845 -0.12084,-0.249024 -0.12084,-0.549317 v -2.03247 h -0.64454 v -0.531006 h 0.64454 v -1.281739 h 0.56396 v 1.281739 h 0.98145 v 0.531006 h -0.98145 z" /><path style="fill:#fff;" d="m 132.67008,78.19326 q -0.17578,0 -0.29297,-0.117187 -0.11718,-0.117188 -0.11718,-0.292969 0,-0.172119 0.11718,-0.289307 0.11719,-0.117187 0.29297,-0.117187 0.17212,0 0.28931,0.117187 0.11719,0.117188 0.11719,0.289307 0,0.175781 -0.11719,0.292969 -0.11719,0.117187 -0.28931,0.117187 z m -0.31128,1.116944 h 0.60059 v 3.566894 h -0.60059 z" /><path style="fill:#fff;" d="m 134.94791,79.844872 v 1.926269 q 0,0.161133 0.0696,0.314941 0.0733,0.150147 0.21973,0.249024 0.14649,0.09522 0.35523,0.09522 0.14648,0 0.33325,-0.02564 v 0.53833 q -0.23804,0.02197 -0.4834,0.02197 -0.34058,0 -0.57861,-0.146485 -0.23804,-0.146484 -0.35889,-0.391845 -0.12085,-0.249024 -0.12085,-0.549317 v -2.03247 h -0.64453 v -0.531006 h 0.64453 v -1.281739 h 0.56396 v 1.281739 h 0.98145 v 0.531006 h -0.98145 z" /><path style="line-height:142.99999475%;letter-spacing:-0.25999999px;fill:#ffffff" d="m 140.03825,82.961327 q -0.55297,0 -0.95214,-0.223389 -0.39917,-0.223389 -0.60791,-0.640869 -0.20875,-0.421143 -0.20875,-0.996094 0,-0.571289 0.21241,-0.996094 0.2124,-0.424804 0.62256,-0.655517 0.41015,-0.230713 0.9851,-0.227051 0.3003,-0.0037 0.5896,0.05493 0.28931,0.05493 0.49073,0.150146 l -0.14649,0.60791 q -0.44678,-0.201416 -0.93017,-0.201416 -0.61158,0 -0.88624,0.314942 -0.27465,0.311279 -0.27465,0.933837 0,0.651856 0.31128,0.970459 0.31494,0.318604 0.91552,0.318604 0.24536,0 0.43579,-0.04761 0.1941,-0.05127 0.50904,-0.168457 l 0.18677,0.55664 q -0.30762,0.117188 -0.63355,0.183106 -0.32593,0.06592 -0.6189,0.06592 z" /><path style="line-height:142.99999475%;letter-spacing:-0.19px;fill:#ffffff" d="m 143.34881,82.968651 q -0.55664,0 -0.98145,-0.230713 -0.42114,-0.230713 -0.65551,-0.651856 -0.23072,-0.424804 -0.23072,-0.977783 0,-0.560302 0.23072,-0.988769 0.23437,-0.428467 0.65551,-0.662842 0.42481,-0.234375 0.98145,-0.234375 0.54565,0 0.95947,0.234375 0.41382,0.234375 0.63721,0.662842 0.22339,0.424804 0.21972,0.988769 0,0.556641 -0.22705,0.977783 -0.22338,0.421143 -0.6372,0.651856 -0.41016,0.230713 -0.95215,0.230713 z m 0,-0.578613 q 0.34424,0 0.60791,-0.157471 0.26733,-0.161133 0.41382,-0.45044 0.15014,-0.292968 0.15747,-0.673828 -0.007,-0.388183 -0.15747,-0.684814 -0.15015,-0.296631 -0.41382,-0.457764 -0.26367,-0.164795 -0.60791,-0.164795 -0.36621,0 -0.6482,0.164795 -0.27832,0.164795 -0.43212,0.461426 -0.15015,0.296631 -0.15015,0.688476 0,0.38086 0.15015,0.670166 0.1538,0.289307 0.43212,0.446778 0.27833,0.157471 0.6482,0.157471 z" /><path style="line-height:142.99999475%;letter-spacing:-0.19px;fill:#ffffff" d="m 148.7655,83.01992 q -0.2124,-0.380859 -0.30029,-0.717773 -0.0549,0.150146 -0.2124,0.300293 -0.15381,0.150146 -0.40283,0.252685 -0.24537,0.102539 -0.56031,0.102539 -0.51635,0 -0.83496,-0.201416 -0.3186,-0.201416 -0.4541,-0.520019 -0.1355,-0.322266 -0.1355,-0.706787 v -2.215576 h 0.60059 v 2.028808 q 0,0.479737 0.19775,0.769043 0.20142,0.289307 0.75806,0.289307 0.41382,0 0.68481,-0.194092 0.271,-0.197754 0.271,-0.655518 v -2.24121 h 0.60059 v 2.358398 q 0.004,0.53833 0.3186,1.105957 z" /><path style="line-height:142.99999475%;letter-spacing:-0.09px;fill:#ffffff" d="m 150.00372,77.32534 h 0.60059 v 5.551758 h -0.60059 z" /><path style="line-height:142.99999475%;letter-spacing:-0.09px;fill:#ffffff" d="m 154.71841,83.01992 q -0.20874,-0.377197 -0.30762,-0.739746 -0.15747,0.336914 -0.49072,0.509033 -0.32959,0.17212 -0.8313,0.17212 -0.47974,0 -0.84229,-0.223389 -0.36255,-0.227051 -0.56396,-0.637207 -0.19776,-0.410156 -0.19776,-0.952149 0,-0.574951 0.22339,-1.010742 0.22339,-0.439453 0.62989,-0.681152 0.41015,-0.241699 0.94848,-0.241699 0.55298,0 1.0437,0.380859 v -2.27417 h 0.60059 v 4.346924 q 0.004,0.53833 0.3186,1.105957 z m -1.48316,-0.633545 q 0.53467,0 0.81299,-0.303955 0.28198,-0.307617 0.28198,-0.864257 V 80.11953 q -0.22705,-0.197754 -0.49072,-0.278321 -0.26367,-0.08057 -0.50537,-0.08057 -0.36987,0 -0.64087,0.164795 -0.271,0.161133 -0.41748,0.465088 -0.14648,0.300293 -0.14648,0.717773 0,0.314942 0.11718,0.60791 0.11719,0.292969 0.36621,0.483399 0.24903,0.186767 0.62256,0.186767 z" /><path style="line-height:142.99999475%;letter-spacing:-0.19px;fill:#ffffff" d="m 157.75219,79.214989 q 0.46875,0 0.78735,0.183105 0.31861,0.183106 0.47608,0.505371 0.16113,0.322266 0.16113,0.739746 v 2.233887 h -0.60059 v -2.06543 q 0,-0.450439 -0.19409,-0.736084 -0.19043,-0.285644 -0.63354,-0.289306 -0.31494,0.0037 -0.59326,0.117187 -0.27466,0.109864 -0.48706,0.31128 l -0.007,2.662353 h -0.60058 l 0.007,-3.566894 h 0.44311 l 0.11353,0.355224 q 0.4248,-0.450439 1.12793,-0.450439 z" /><path style="line-height:142.99999475%;letter-spacing:-0.19px;fill:#ffffff" d="m 160.11102,77.497459 h 0.53101 v 1.71753 h -0.53101 z" /><path style="fill:#fff;" d="m 162.41858,79.844872 v 1.926269 q 0,0.161133 0.0696,0.314941 0.0732,0.150147 0.21973,0.249024 0.14648,0.09522 0.35522,0.09522 0.14648,0 0.33325,-0.02564 v 0.53833 q -0.23803,0.02197 -0.4834,0.02197 -0.34057,0 -0.57861,-0.146485 -0.23804,-0.146484 -0.35889,-0.391845 -0.12085,-0.249024 -0.12085,-0.549317 v -2.03247 h -0.64453 v -0.531006 h 0.64453 v -1.281739 h 0.56397 v 1.281739 h 0.98144 v 0.531006 h -0.98144 z" /><path style="fill:#fff;" d="m 30.251877,89.939988 q 0.46875,0 0.787353,0.183106 0.318604,0.183105 0.476075,0.505371 0.161132,0.322266 0.161132,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194091,-0.736084 -0.194092,-0.285645 -0.633545,-0.285645 -0.314942,0 -0.593262,0.113526 -0.27832,0.109863 -0.494385,0.307617 v 2.666016 h -0.600586 v -5.55542 h 0.600586 v 2.307129 q 0.421143,-0.413819 1.091309,-0.413819 z" /><path style="fill:#fff;" d="m 35.287277,93.74492 q -0.201416,-0.351563 -0.303955,-0.725098 -0.06226,0.183106 -0.241699,0.336914 -0.179443,0.153809 -0.428467,0.2417 -0.249023,0.08789 -0.505371,0.08789 -0.362549,0 -0.651855,-0.113525 -0.285645,-0.113526 -0.454102,-0.351563 -0.164795,-0.238037 -0.164795,-0.593261 0,-0.344239 0.172119,-0.596924 0.172119,-0.256348 0.487061,-0.391846 0.318603,-0.135498 0.739746,-0.135498 0.505371,0 0.963135,0.26001 v -0.373535 q 0,-0.439453 -0.205078,-0.64087 -0.205079,-0.201416 -0.607911,-0.201416 -0.153808,0 -0.443115,0.02563 -0.285644,0.02197 -0.534668,0.06226 l -0.102539,-0.600586 q 0.446777,-0.05127 0.699463,-0.07324 0.256348,-0.02197 0.428467,-0.02197 0.666504,0 1.010742,0.351563 0.344238,0.351562 0.3479,1.047363 l 0.0073,1.054688 q 0.0037,0.53833 0.318603,1.105957 l -0.531006,0.245361 z m -1.343994,-0.618897 q 0.285645,0 0.501709,-0.09888 0.216065,-0.09888 0.333252,-0.281983 0.12085,-0.183105 0.12085,-0.421142 v -0.03296 q -0.183106,-0.10254 -0.406495,-0.157471 -0.223388,-0.05859 -0.465087,-0.05859 -0.391846,0 -0.626221,0.13916 -0.234375,0.135498 -0.234375,0.377198 0,0.15747 0.09521,0.27832 0.09888,0.120849 0.274658,0.19043 0.175781,0.06592 0.406494,0.06592 z" /><path style="letter-spacing:-0.52999997px;fill:#ffffff" d="m 38.323166,89.939988 q 0.46875,0 0.787353,0.183106 0.318604,0.183105 0.476075,0.505371 0.161132,0.322266 0.161132,0.739746 v 2.233887 h -0.600585 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.19043,-0.285645 -0.633545,-0.289307 -0.314942,0.0037 -0.593262,0.117188 -0.274658,0.109863 -0.48706,0.311279 l -0.0073,2.662354 h -0.600586 l 0.0073,-3.566895 h 0.443115 l 0.113525,0.355225 q 0.424805,-0.45044 1.12793,-0.45044 z" /><path style="letter-spacing:-0.1px;fill:#ffffff" d="m 43.341262,93.74492 q -0.20874,-0.377197 -0.307617,-0.739746 -0.157471,0.336914 -0.490723,0.509033 -0.32959,0.172119 -0.831299,0.172119 -0.479736,0 -0.842285,-0.223388 -0.362549,-0.227051 -0.563965,-0.637207 -0.197754,-0.410157 -0.197754,-0.952149 0,-0.574951 0.223389,-1.010742 0.223389,-0.439453 0.629883,-0.681152 0.410156,-0.2417 0.948486,-0.2417 0.552979,0 1.043701,0.38086 v -2.27417 h 0.600586 v 4.346924 q 0.0037,0.53833 0.318604,1.105957 z m -1.483154,-0.633545 q 0.534668,0 0.812988,-0.303955 0.281982,-0.307617 0.281982,-0.864258 v -1.098633 q -0.227051,-0.197754 -0.490722,-0.27832 -0.263672,-0.08057 -0.505371,-0.08057 -0.369874,0 -0.64087,0.164795 -0.270996,0.161132 -0.41748,0.465087 -0.146484,0.300293 -0.146484,0.717774 0,0.314941 0.117187,0.60791 0.117188,0.292969 0.366211,0.483398 0.249023,0.186768 0.622559,0.186768 z" /><path style="letter-spacing:-0.1px;fill:#ffffff" d="m 44.676809,88.05034 h 0.600586 v 5.551758 h -0.600586 z" /><path style="fill:#fff;" d="m 48.081448,93.133348 q 0.245361,0 0.520019,-0.05493 0.274658,-0.05493 0.549317,-0.161133 l 0.186767,0.512696 q -0.26001,0.109863 -0.65918,0.183105 -0.399169,0.07324 -0.725097,0.07324 -0.864258,0 -1.340332,-0.461426 -0.476074,-0.465087 -0.476074,-1.428222 0,-0.600586 0.20874,-1.018067 0.212402,-0.421142 0.611572,-0.637207 0.39917,-0.216064 0.959473,-0.216064 0.494384,0 0.827636,0.230713 0.333252,0.227051 0.494385,0.596924 0.161133,0.366211 0.161133,0.787353 0,0.289307 -0.08057,0.578613 l -2.548829,0.01831 q 0.08057,0.494385 0.410157,0.74707 0.32959,0.249024 0.900879,0.249024 z m -0.245362,-2.633057 q -0.520019,0 -0.783691,0.300293 -0.263672,0.300293 -0.300293,0.809326 l 1.981201,-0.01831 q 0.0073,-0.08789 0.0073,-0.131836 0,-0.249024 -0.09155,-0.465088 -0.09155,-0.219727 -0.296631,-0.355225 -0.201416,-0.13916 -0.516358,-0.13916 z" /><path style="fill:#fff;" d="m 49.83926,94.312547 q 0.245361,-0.457764 0.336914,-0.780029 0.09155,-0.322266 0.09155,-0.765381 h 0.65918 q 0,0.454101 -0.161133,0.944824 -0.157471,0.494385 -0.424805,0.856934 z" /><path style="fill:#fff;" d="m 56.456692,93.74492 q -0.201416,-0.351563 -0.303955,-0.725098 -0.06226,0.183106 -0.2417,0.336914 -0.179443,0.153809 -0.428466,0.2417 -0.249024,0.08789 -0.505371,0.08789 -0.362549,0 -0.651856,-0.113525 -0.285644,-0.113526 -0.454101,-0.351563 -0.164795,-0.238037 -0.164795,-0.593261 0,-0.344239 0.172119,-0.596924 0.172119,-0.256348 0.48706,-0.391846 0.318604,-0.135498 0.739746,-0.135498 0.505371,0 0.963135,0.26001 v -0.373535 q 0,-0.439453 -0.205078,-0.64087 -0.205078,-0.201416 -0.60791,-0.201416 -0.153809,0 -0.443115,0.02563 -0.285645,0.02197 -0.534668,0.06226 l -0.102539,-0.600586 q 0.446777,-0.05127 0.699462,-0.07324 0.256348,-0.02197 0.428467,-0.02197 0.666504,0 1.010742,0.351563 0.344239,0.351562 0.347901,1.047363 l 0.0073,1.054688 q 0.0037,0.53833 0.318604,1.105957 l -0.531006,0.245361 z m -1.343994,-0.618897 q 0.285644,0 0.501709,-0.09888 0.216064,-0.09888 0.333252,-0.281983 0.120849,-0.183105 0.120849,-0.421142 v -0.03296 q -0.183105,-0.10254 -0.406494,-0.157471 -0.223389,-0.05859 -0.465088,-0.05859 -0.391846,0 -0.626221,0.13916 -0.234375,0.135498 -0.234375,0.377198 0,0.15747 0.09522,0.27832 0.09888,0.120849 0.274658,0.19043 0.175782,0.06592 0.406495,0.06592 z" /><path style="letter-spacing:-0.23px;fill:#ffffff" d="m 59.49258,89.939988 q 0.46875,0 0.787354,0.183106 0.318603,0.183105 0.476074,0.505371 0.161133,0.322266 0.161133,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.190429,-0.285645 -0.633545,-0.289307 -0.314941,0.0037 -0.593261,0.117188 -0.274659,0.109863 -0.487061,0.311279 l -0.0073,2.662354 H 57.80071 l 0.0073,-3.566895 h 0.443115 l 0.113526,0.355225 q 0.424804,-0.45044 1.127929,-0.45044 z" /><path style="letter-spacing:-0.23px;fill:#ffffff" d="m 64.810677,93.74492 q -0.208741,-0.377197 -0.307618,-0.739746 -0.15747,0.336914 -0.490722,0.509033 -0.32959,0.172119 -0.831299,0.172119 -0.479736,0 -0.842285,-0.223388 -0.362549,-0.227051 -0.563965,-0.637207 -0.197754,-0.410157 -0.197754,-0.952149 0,-0.574951 0.223389,-1.010742 0.223388,-0.439453 0.629882,-0.681152 0.410157,-0.2417 0.948487,-0.2417 0.552978,0 1.043701,0.38086 v -2.27417 h 0.600586 v 4.346924 q 0.0037,0.53833 0.318603,1.105957 z m -1.483155,-0.633545 q 0.534668,0 0.812989,-0.303955 0.281982,-0.307617 0.281982,-0.864258 v -1.098633 q -0.227051,-0.197754 -0.490723,-0.27832 -0.263672,-0.08057 -0.505371,-0.08057 -0.369873,0 -0.640869,0.164795 -0.270996,0.161132 -0.41748,0.465087 -0.146485,0.300293 -0.146485,0.717774 0,0.314941 0.117188,0.60791 0.117187,0.292969 0.366211,0.483398 0.249023,0.186768 0.622558,0.186768 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 69.505238,89.939988 q 0.46875,0 0.787353,0.183106 0.318604,0.183105 0.476074,0.505371 0.161133,0.322266 0.161133,0.739746 v 2.233887 h -0.600586 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.190429,-0.285645 -0.633545,-0.289307 -0.314941,0.0037 -0.593261,0.117188 -0.274658,0.109863 -0.487061,0.311279 l -0.0073,2.662354 h -0.600586 l 0.0073,-3.566895 h 0.443116 l 0.113525,0.355225 q 0.424805,-0.45044 1.12793,-0.45044 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 73.422718,93.69365 q -0.556641,0 -0.981445,-0.230712 -0.421143,-0.230713 -0.655518,-0.651856 -0.230713,-0.424805 -0.230713,-0.977783 0,-0.560303 0.230713,-0.98877 0.234375,-0.428466 0.655518,-0.662841 0.424804,-0.234375 0.981445,-0.234375 0.545654,0 0.959473,0.234375 0.413818,0.234375 0.637207,0.662841 0.223388,0.424805 0.219726,0.98877 0,0.55664 -0.22705,0.977783 -0.223389,0.421143 -0.637208,0.651856 -0.410156,0.230712 -0.952148,0.230712 z m 0,-0.578613 q 0.344238,0 0.60791,-0.157471 0.267334,-0.161132 0.413819,-0.450439 0.150146,-0.292969 0.15747,-0.673828 -0.0073,-0.388184 -0.15747,-0.684815 -0.150147,-0.29663 -0.413819,-0.457763 -0.263672,-0.164795 -0.60791,-0.164795 -0.366211,0 -0.648193,0.164795 -0.278321,0.164795 -0.432129,0.461426 -0.150147,0.29663 -0.150147,0.688476 0,0.380859 0.150147,0.670166 0.153808,0.289307 0.432129,0.446777 0.27832,0.157471 0.648193,0.157471 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 75.439564,90.035203 h 0.611572 l 0.776367,2.548828 q 0.01465,0.05859 0.0293,0.168457 0.01465,0.109864 0.01831,0.161133 h 0.0293 q 0.0037,-0.04395 0.02563,-0.172119 0.02563,-0.131836 0.04028,-0.175781 l 0.84961,-2.53418 h 0.549316 l 0.791016,2.548828 q 0.01099,0.03296 0.0293,0.161133 0.02197,0.124512 0.02563,0.175781 h 0.0293 q 0.0037,-0.03662 0.02563,-0.146484 0.02197,-0.113526 0.04028,-0.183106 l 0.761719,-2.55249 h 0.615234 l -1.124267,3.585205 H 78.940532 L 78.164165,91.21074 q -0.02197,-0.0769 -0.04761,-0.190429 -0.02197,-0.117188 -0.02564,-0.150147 h -0.01465 q -0.0037,0.03296 -0.03296,0.150147 -0.02563,0.113525 -0.04761,0.186767 l -0.820312,2.41333 h -0.600586 l -1.135254,-3.585205 z" /><path style="fill:#fff;" d="m 83.491566,88.91826 q -0.175782,0 -0.292969,-0.117188 -0.117188,-0.117187 -0.117188,-0.292968 0,-0.17212 0.117188,-0.289307 0.117187,-0.117188 0.292969,-0.117188 0.172119,0 0.289306,0.117188 0.117188,0.117187 0.117188,0.289307 0,0.175781 -0.117188,0.292968 -0.117187,0.117188 -0.289306,0.117188 z m -0.31128,1.116943 h 0.600586 v 3.566895 h -0.600586 z" /><path style="fill:#fff;" d="m 85.769398,90.569871 v 1.92627 q 0,0.161132 0.06958,0.314941 0.07324,0.150147 0.219726,0.249024 0.146485,0.09521 0.355225,0.09521 0.146484,0 0.333252,-0.02563 v 0.53833 q -0.238037,0.02197 -0.483398,0.02197 -0.340577,0 -0.578614,-0.146484 -0.238037,-0.146484 -0.358886,-0.391846 -0.12085,-0.249023 -0.12085,-0.549316 v -2.032471 h -0.644531 v -0.531006 h 0.644531 v -1.281738 h 0.563965 v 1.281738 h 0.981445 v 0.531006 h -0.981445 z" /><path style="fill:#fff;" d="m 91.299183,89.939988 q 0.46875,0 0.787353,0.183106 0.318604,0.183105 0.476075,0.505371 0.161132,0.322266 0.161132,0.739746 v 2.233887 h -0.600585 v -2.06543 q 0,-0.450439 -0.194092,-0.736084 -0.19043,-0.285645 -0.633545,-0.289307 -0.314942,0.0037 -0.593262,0.117188 -0.274658,0.109863 -0.48706,0.311279 l -0.0073,2.662354 h -0.600586 l 0.0073,-3.566895 h 0.443115 l 0.113525,0.355225 q 0.424805,-0.45044 1.12793,-0.45044 z" /><path style="fill:#fff;" d="m 95.547226,93.133348 q 0.245361,0 0.520019,-0.05493 0.274659,-0.05493 0.549317,-0.161133 l 0.186767,0.512696 q -0.260009,0.109863 -0.659179,0.183105 -0.39917,0.07324 -0.725098,0.07324 -0.864258,0 -1.340332,-0.461426 -0.476074,-0.465087 -0.476074,-1.428222 0,-0.600586 0.20874,-1.018067 0.212402,-0.421142 0.611572,-0.637207 0.39917,-0.216064 0.959473,-0.216064 0.494385,0 0.827637,0.230713 0.333252,0.227051 0.494385,0.596924 0.161132,0.366211 0.161132,0.787353 0,0.289307 -0.08057,0.578613 l -2.548828,0.01831 q 0.08057,0.494385 0.410156,0.74707 0.32959,0.249024 0.900879,0.249024 z m -0.245361,-2.633057 q -0.52002,0 -0.783692,0.300293 -0.263672,0.300293 -0.300293,0.809326 l 1.981201,-0.01831 q 0.0073,-0.08789 0.0073,-0.131836 0,-0.249024 -0.09155,-0.465088 -0.09155,-0.219727 -0.296631,-0.355225 -0.201416,-0.13916 -0.516357,-0.13916 z" /><path style="fill:#fff;" d="m 99.458359,93.133348 q 0.245361,0 0.520019,-0.05493 0.274662,-0.05493 0.549312,-0.161133 l 0.18677,0.512696 q -0.26001,0.109863 -0.65918,0.183105 -0.399167,0.07324 -0.725095,0.07324 -0.864258,0 -1.340332,-0.461426 -0.476074,-0.465087 -0.476074,-1.428222 0,-0.600586 0.20874,-1.018067 0.212402,-0.421142 0.611572,-0.637207 0.39917,-0.216064 0.959473,-0.216064 0.494385,0 0.827636,0.230713 0.33325,0.227051 0.49439,0.596924 0.16113,0.366211 0.16113,0.787353 0,0.289307 -0.0806,0.578613 l -2.548826,0.01831 q 0.08057,0.494385 0.410156,0.74707 0.32959,0.249024 0.900879,0.249024 z m -0.245362,-2.633057 q -0.520019,0 -0.783691,0.300293 -0.263672,0.300293 -0.300293,0.809326 l 1.981197,-0.01831 q 0.007,-0.08789 0.007,-0.131836 0,-0.249024 -0.0916,-0.465088 -0.09156,-0.219727 -0.296635,-0.355225 -0.201416,-0.13916 -0.516358,-0.13916 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 104.66954,93.74492 q -0.20874,-0.377197 -0.30762,-0.739746 -0.15747,0.336914 -0.49072,0.509033 -0.32959,0.172119 -0.8313,0.172119 -0.47973,0 -0.84228,-0.223388 -0.36255,-0.227051 -0.56397,-0.637207 -0.19775,-0.410157 -0.19775,-0.952149 0,-0.574951 0.22339,-1.010742 0.22339,-0.439453 0.62988,-0.681152 0.41016,-0.2417 0.94849,-0.2417 0.55297,0 1.0437,0.38086 v -2.27417 h 0.60058 v 4.346924 q 0.004,0.53833 0.31861,1.105957 z m -1.48315,-0.633545 q 0.53466,0 0.81298,-0.303955 0.28199,-0.307617 0.28199,-0.864258 v -1.098633 q -0.22705,-0.197754 -0.49073,-0.27832 -0.26367,-0.08057 -0.50537,-0.08057 -0.36987,0 -0.64087,0.164795 -0.27099,0.161132 -0.41748,0.465087 -0.14648,0.300293 -0.14648,0.717774 0,0.314941 0.11719,0.60791 0.11718,0.292969 0.36621,0.483398 0.24902,0.186768 0.62256,0.186768 z" /><path style="letter-spacing:-0.25px;fill:#ffffff" d="m 106.76695,93.69365 q -0.57861,-0.0037 -1.20483,-0.285644 l 0.19775,-0.53833 q 0.5896,0.263672 1.00708,0.270996 0.76172,-0.01099 0.76538,-0.501709 0,-0.172119 -0.0989,-0.281982 -0.0952,-0.109864 -0.2417,-0.175782 -0.14283,-0.06592 -0.39551,-0.146484 -0.33325,-0.106201 -0.54199,-0.20874 -0.20874,-0.106202 -0.35889,-0.314942 -0.14648,-0.20874 -0.14648,-0.552978 0.011,-1.025391 1.24878,-1.025391 0.56762,0 0.98876,0.194092 l -0.20874,0.545654 q -0.42114,-0.186767 -0.78002,-0.186767 -0.65552,0.0073 -0.68116,0.472412 0,0.13916 0.0879,0.230713 0.0879,0.09155 0.21607,0.150146 0.13183,0.05493 0.36621,0.131836 0.3479,0.109863 0.56763,0.223389 0.22338,0.109863 0.38452,0.340576 0.16113,0.227051 0.16113,0.604248 0,1.054687 -1.33301,1.054687 z" /><path style="fill:#fff;" d="m 111.59264,90.569871 v 1.92627 q 0,0.161132 0.0696,0.314941 0.0732,0.150147 0.21972,0.249024 0.14649,0.09521 0.35523,0.09521 0.14648,0 0.33325,-0.02563 v 0.53833 q -0.23804,0.02197 -0.4834,0.02197 -0.34058,0 -0.57861,-0.146484 -0.23804,-0.146484 -0.35889,-0.391846 -0.12085,-0.249023 -0.12085,-0.549316 v -2.032471 h -0.64453 v -0.531006 h 0.64453 v -1.281738 h 0.56397 v 1.281738 h 0.98144 v 0.531006 h -0.98144 z" /><path style="fill:#fff;" d="m 114.99107,93.69365 q -0.55664,0 -0.98144,-0.230712 -0.42114,-0.230713 -0.65552,-0.651856 -0.23071,-0.424805 -0.23071,-0.977783 0,-0.560303 0.23071,-0.98877 0.23438,-0.428466 0.65552,-0.662841 0.4248,-0.234375 0.98144,-0.234375 0.54566,0 0.95948,0.234375 0.41381,0.234375 0.6372,0.662841 0.22339,0.424805 0.21973,0.98877 0,0.55664 -0.22705,0.977783 -0.22339,0.421143 -0.63721,0.651856 -0.41015,0.230712 -0.95215,0.230712 z m 0,-0.578613 q 0.34424,0 0.60791,-0.157471 0.26734,-0.161132 0.41382,-0.450439 0.15015,-0.292969 0.15747,-0.673828 -0.007,-0.388184 -0.15747,-0.684815 -0.15014,-0.29663 -0.41382,-0.457763 -0.26367,-0.164795 -0.60791,-0.164795 -0.36621,0 -0.64819,0.164795 -0.27832,0.164795 -0.43213,0.461426 -0.15015,0.29663 -0.15015,0.688476 0,0.380859 0.15015,0.670166 0.15381,0.289307 0.43213,0.446777 0.27832,0.157471 0.64819,0.157471 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 120.36705,90.379441 q 0.3772,-0.435791 0.9668,-0.435791 0.16479,0 0.34424,0.03296 l -0.10254,0.571289 q -0.10254,-0.01099 -0.20142,-0.01099 -0.56763,0 -0.94116,0.351563 v 2.713623 h -0.60059 V 90.0352 h 0.4541 l 0.0806,0.344238 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 123.92438,93.133348 q 0.24536,0 0.52002,-0.05493 0.27466,-0.05493 0.54931,-0.161133 l 0.18677,0.512696 q -0.26001,0.109863 -0.65918,0.183105 -0.39917,0.07324 -0.7251,0.07324 -0.86425,0 -1.34033,-0.461426 -0.47607,-0.465087 -0.47607,-1.428222 0,-0.600586 0.20874,-1.018067 0.2124,-0.421142 0.61157,-0.637207 0.39917,-0.216064 0.95947,-0.216064 0.49439,0 0.82764,0.230713 0.33325,0.227051 0.49438,0.596924 0.16114,0.366211 0.16114,0.787353 0,0.289307 -0.0806,0.578613 l -2.54883,0.01831 q 0.0806,0.494385 0.41016,0.74707 0.32959,0.249024 0.90088,0.249024 z m -0.24536,-2.633057 q -0.52002,0 -0.7837,0.300293 -0.26367,0.300293 -0.30029,0.809326 l 1.9812,-0.01831 q 0.007,-0.08789 0.007,-0.131836 0,-0.249024 -0.0916,-0.465088 -0.0915,-0.219727 -0.29663,-0.355225 -0.20141,-0.13916 -0.51635,-0.13916 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 126.85915,93.69365 q -0.57862,-0.0037 -1.20484,-0.285644 l 0.19776,-0.53833 q 0.5896,0.263672 1.00708,0.270996 0.76171,-0.01099 0.76538,-0.501709 0,-0.172119 -0.0989,-0.281982 -0.0952,-0.109864 -0.2417,-0.175782 -0.14282,-0.06592 -0.39551,-0.146484 -0.33325,-0.106201 -0.54199,-0.20874 -0.20874,-0.106202 -0.35889,-0.314942 -0.14648,-0.20874 -0.14648,-0.552978 0.011,-1.025391 1.24878,-1.025391 0.56763,0 0.98877,0.194092 l -0.20874,0.545654 q -0.42114,-0.186767 -0.78003,-0.186767 -0.65552,0.0073 -0.68115,0.472412 0,0.13916 0.0879,0.230713 0.0879,0.09155 0.21606,0.150146 0.13184,0.05493 0.36621,0.131836 0.3479,0.109863 0.56763,0.223389 0.22339,0.109863 0.38452,0.340576 0.16113,0.227051 0.16113,0.604248 0,1.054687 -1.333,1.054687 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 129.68404,90.569871 v 1.92627 q 0,0.161132 0.0696,0.314941 0.0733,0.150147 0.21973,0.249024 0.14648,0.09521 0.35523,0.09521 0.14648,0 0.33325,-0.02563 v 0.53833 q -0.23804,0.02197 -0.4834,0.02197 -0.34058,0 -0.57861,-0.146484 -0.23804,-0.146484 -0.35889,-0.391846 -0.12085,-0.249023 -0.12085,-0.549316 v -2.032471 h -0.64453 v -0.531006 h 0.64453 v -1.281738 h 0.56396 v 1.281738 h 0.98145 v 0.531006 h -0.98145 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 133.7504,93.74492 q -0.20141,-0.351563 -0.30395,-0.725098 -0.0623,0.183106 -0.2417,0.336914 -0.17944,0.153809 -0.42847,0.2417 -0.24902,0.08789 -0.50537,0.08789 -0.36255,0 -0.65185,-0.113525 -0.28565,-0.113526 -0.4541,-0.351563 -0.1648,-0.238037 -0.1648,-0.593261 0,-0.344239 0.17212,-0.596924 0.17212,-0.256348 0.48706,-0.391846 0.3186,-0.135498 0.73975,-0.135498 0.50537,0 0.96313,0.26001 v -0.373535 q 0,-0.439453 -0.20508,-0.64087 -0.20508,-0.201416 -0.60791,-0.201416 -0.15381,0 -0.44311,0.02563 -0.28565,0.02197 -0.53467,0.06226 l -0.10254,-0.600586 q 0.44678,-0.05127 0.69946,-0.07324 0.25635,-0.02197 0.42847,-0.02197 0.6665,0 1.01074,0.351563 0.34424,0.351562 0.3479,1.047363 l 0.007,1.054688 q 0.004,0.53833 0.3186,1.105957 l -0.53101,0.245361 z m -1.34399,-0.618897 q 0.28564,0 0.50171,-0.09888 0.21606,-0.09888 0.33325,-0.281983 0.12085,-0.183105 0.12085,-0.421142 v -0.03296 q -0.1831,-0.10254 -0.40649,-0.157471 -0.22339,-0.05859 -0.46509,-0.05859 -0.39185,0 -0.62622,0.13916 -0.23438,0.135498 -0.23438,0.377198 0,0.15747 0.0952,0.27832 0.0989,0.120849 0.27466,0.19043 0.17578,0.06592 0.40649,0.06592 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 135.43639,90.379441 q 0.37719,-0.435791 0.96679,-0.435791 0.1648,0 0.34424,0.03296 l -0.10254,0.571289 q -0.10254,-0.01099 -0.20141,-0.01099 -0.56763,0 -0.94117,0.351563 v 2.713623 h -0.60058 V 90.0352 h 0.4541 l 0.0806,0.344238 z" /><path style="letter-spacing:-0.2px;fill:#ffffff" d="m 138.06354,90.569871 v 1.92627 q 0,0.161132 0.0696,0.314941 0.0732,0.150147 0.21972,0.249024 0.14649,0.09521 0.35523,0.09521 0.14648,0 0.33325,-0.02563 v 0.53833 q -0.23804,0.02197 -0.4834,0.02197 -0.34057,0 -0.57861,-0.146484 -0.23804,-0.146484 -0.35889,-0.391846 -0.12085,-0.249023 -0.12085,-0.549316 v -2.032471 h -0.64453 v -0.531006 h 0.64453 v -1.281738 h 0.56397 v 1.281738 h 0.98144 v 0.531006 h -0.98144 z" /><path style="fill:#fff;" d="m 139.86305,93.682664 q -0.18677,0 -0.30029,-0.109863 -0.10986,-0.113526 -0.10986,-0.300293 0,-0.186768 0.10986,-0.300293 0.11352,-0.113526 0.30029,-0.113526 0.18677,0 0.3003,0.113526 0.11352,0.113525 0.11352,0.300293 0,0.186767 -0.11352,0.300293 -0.11353,0.109863 -0.3003,0.109863 z" /></g><g><path style="fill:#fff;" d="m 28.880116,106.02305 -0.844117,-1.6626 h 0.344239 l 0.593261,1.19568 q 0.01099,0.0238 0.0293,0.0714 0.01831,0.0458 0.03479,0.0897 h 0.0055 q 0.01648,-0.0604 0.06775,-0.16113 l 0.620728,-1.19568 h 0.322266 l -0.866089,1.65527 v 0.97046 h -0.307617 v -0.96313 z" /><path style="fill:#fff;" d="m 31.181751,107.03196 q -0.27832,0 -0.490722,-0.11536 -0.210572,-0.11535 -0.327759,-0.32592 -0.115357,-0.21241 -0.115357,-0.4889 0,-0.28015 0.115357,-0.49438 0.117187,-0.21423 0.327759,-0.33142 0.212402,-0.11719 0.490722,-0.11719 0.272827,0 0.479737,0.11719 0.206909,0.11719 0.318603,0.33142 0.111694,0.2124 0.109863,0.49438 0,0.27832 -0.113525,0.4889 -0.111694,0.21057 -0.318604,0.32592 -0.205078,0.11536 -0.476074,0.11536 z m 0,-0.28931 q 0.172119,0 0.303955,-0.0787 0.133667,-0.0806 0.20691,-0.22522 0.07507,-0.14649 0.07873,-0.33692 -0.0037,-0.19409 -0.07873,-0.3424 -0.07507,-0.14832 -0.20691,-0.22889 -0.131836,-0.0824 -0.303955,-0.0824 -0.183105,0 -0.324096,0.0824 -0.139161,0.0824 -0.216065,0.23072 -0.07507,0.14831 -0.07507,0.34424 0,0.19043 0.07507,0.33508 0.0769,0.14465 0.216065,0.22339 0.13916,0.0787 0.324096,0.0787 z" /><path style="fill:#fff;" d="m 33.985096,107.05759 q -0.106201,-0.19043 -0.150147,-0.35888 -0.02746,0.0751 -0.106201,0.15014 -0.0769,0.0751 -0.201416,0.12635 -0.12268,0.0513 -0.280151,0.0513 -0.258179,0 -0.417481,-0.10071 -0.159301,-0.10071 -0.22705,-0.26001 -0.06775,-0.16113 -0.06775,-0.35339 v -1.10779 h 0.300293 v 1.0144 q 0,0.23987 0.09888,0.38452 0.100708,0.14466 0.379028,0.14466 0.206909,0 0.342407,-0.097 0.135498,-0.0989 0.135498,-0.32776 v -1.1206 h 0.300293 v 1.1792 q 0.0018,0.26916 0.159302,0.55297 l -0.265503,0.12268 z" /><path style="fill:#fff;" d="m 36.478992,107.0283 q -0.276489,0 -0.476074,-0.1117 -0.199585,-0.11169 -0.303955,-0.32043 -0.10437,-0.21057 -0.10437,-0.49805 0,-0.28564 0.106201,-0.49805 0.106201,-0.2124 0.31128,-0.32775 0.205078,-0.11536 0.492553,-0.11353 0.150147,-0.002 0.2948,0.0275 0.144653,0.0275 0.245361,0.0751 l -0.07324,0.30395 q -0.223388,-0.1007 -0.465088,-0.1007 -0.305786,0 -0.443115,0.15747 -0.137329,0.15564 -0.137329,0.46692 0,0.32592 0.15564,0.48523 0.15747,0.1593 0.457763,0.1593 0.122681,0 0.217896,-0.0238 0.09705,-0.0256 0.254516,-0.0842 l 0.09338,0.27832 q -0.153808,0.0586 -0.316772,0.0915 -0.162964,0.033 -0.309449,0.033 z" /><path style="fill:#fff;" d="m 38.698231,107.05759 q -0.100708,-0.17578 -0.151978,-0.36254 -0.03113,0.0916 -0.120849,0.16845 -0.08972,0.0769 -0.214234,0.12085 -0.124512,0.0439 -0.252685,0.0439 -0.181275,0 -0.325928,-0.0568 -0.142822,-0.0568 -0.227051,-0.17578 -0.0824,-0.11902 -0.0824,-0.29663 0,-0.17212 0.08606,-0.29846 0.08606,-0.12817 0.243531,-0.19592 0.159301,-0.0678 0.369873,-0.0678 0.252685,0 0.481567,0.13 v -0.18676 q 0,-0.21973 -0.102539,-0.32044 -0.102539,-0.10071 -0.303955,-0.10071 -0.0769,0 -0.221558,0.0128 -0.142822,0.011 -0.267334,0.0311 l -0.05127,-0.30029 q 0.223388,-0.0256 0.349731,-0.0366 0.128174,-0.011 0.214234,-0.011 0.333251,0 0.505371,0.17578 0.172119,0.17578 0.17395,0.52368 l 0.0037,0.52735 q 0.0018,0.26916 0.159302,0.55297 l -0.265503,0.12268 z m -0.671997,-0.30944 q 0.142822,0 0.250854,-0.0494 0.108032,-0.0494 0.166626,-0.14099 0.06043,-0.0916 0.06043,-0.21057 v -0.0165 q -0.09155,-0.0513 -0.203247,-0.0787 -0.111694,-0.0293 -0.232544,-0.0293 -0.195923,0 -0.31311,0.0696 -0.117188,0.0678 -0.117188,0.1886 0,0.0787 0.04761,0.13916 0.04944,0.0604 0.137329,0.0952 0.08789,0.033 0.203247,0.033 z" /><path style="fill:#fff;" d="m 40.216175,105.15513 q 0.234375,0 0.393677,0.0915 0.159302,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 h -0.300293 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09521,-0.14283 -0.316772,-0.14466 -0.157471,0.002 -0.296631,0.0586 -0.137329,0.0549 -0.24353,0.15564 l -0.0037,1.33117 H 39.37019 l 0.0037,-1.78344 h 0.221558 l 0.05676,0.17761 q 0.212403,-0.22522 0.563965,-0.22522 z" /><path style="fill:#fff;" d="m 42.977406,107.03196 q -0.289307,-0.002 -0.602417,-0.14282 l 0.09888,-0.26917 q 0.294799,0.13184 0.50354,0.1355 0.380859,-0.005 0.38269,-0.25085 0,-0.0861 -0.04944,-0.141 -0.04761,-0.0549 -0.12085,-0.0879 -0.07141,-0.033 -0.197754,-0.0732 -0.166626,-0.0531 -0.270996,-0.10437 -0.10437,-0.0531 -0.179443,-0.15747 -0.07324,-0.10437 -0.07324,-0.27649 0.0055,-0.51269 0.62439,-0.51269 0.283813,0 0.494385,0.097 l -0.10437,0.27283 q -0.210572,-0.0934 -0.390015,-0.0934 -0.327759,0.004 -0.340576,0.2362 0,0.0696 0.04395,0.11536 0.04395,0.0458 0.108032,0.0751 0.06592,0.0275 0.183106,0.0659 0.17395,0.0549 0.283813,0.11169 0.111695,0.0549 0.192261,0.17029 0.08057,0.11353 0.08057,0.30213 0,0.52734 -0.666503,0.52734 z" /><path style="fill:#fff;" d="m 44.954945,106.75181 q 0.12268,0 0.260009,-0.0275 0.137329,-0.0275 0.274659,-0.0806 l 0.09338,0.25634 q -0.130005,0.0549 -0.329589,0.0916 -0.199585,0.0366 -0.362549,0.0366 -0.432129,0 -0.670166,-0.23072 -0.238037,-0.23254 -0.238037,-0.71411 0,-0.30029 0.10437,-0.50903 0.106201,-0.21057 0.305786,-0.3186 0.199585,-0.10804 0.479736,-0.10804 0.247193,0 0.413819,0.11536 0.166625,0.11353 0.247192,0.29846 0.08057,0.18311 0.08057,0.39368 0,0.14465 -0.04028,0.28931 l -1.274414,0.009 q 0.04028,0.24719 0.205078,0.37354 0.164795,0.12451 0.45044,0.12451 z m -0.122681,-1.31653 q -0.26001,0 -0.391846,0.15015 -0.131836,0.15014 -0.150146,0.40466 l 0.9906,-0.009 q 0.0037,-0.0439 0.0037,-0.0659 0,-0.12452 -0.04578,-0.23255 -0.04578,-0.10986 -0.148315,-0.17761 -0.100708,-0.0696 -0.258179,-0.0696 z" /><path style="fill:#fff;" d="m 47.304188,107.05759 q -0.100708,-0.17578 -0.151978,-0.36254 -0.03113,0.0916 -0.120849,0.16845 -0.08972,0.0769 -0.214234,0.12085 -0.124511,0.0439 -0.252685,0.0439 -0.181275,0 -0.325928,-0.0568 -0.142822,-0.0568 -0.227051,-0.17578 -0.0824,-0.11902 -0.0824,-0.29663 0,-0.17212 0.08606,-0.29846 0.08606,-0.12817 0.243531,-0.19592 0.159301,-0.0678 0.369873,-0.0678 0.252685,0 0.481567,0.13 v -0.18676 q 0,-0.21973 -0.102539,-0.32044 -0.102539,-0.10071 -0.303955,-0.10071 -0.0769,0 -0.221558,0.0128 -0.142822,0.011 -0.267334,0.0311 l -0.05127,-0.30029 q 0.223388,-0.0256 0.349731,-0.0366 0.128174,-0.011 0.214234,-0.011 0.333252,0 0.505371,0.17578 0.172119,0.17578 0.17395,0.52368 l 0.0037,0.52735 q 0.0018,0.26916 0.159302,0.55297 l -0.265503,0.12268 z m -0.671997,-0.30944 q 0.142822,0 0.250854,-0.0494 0.108032,-0.0494 0.166626,-0.14099 0.06043,-0.0916 0.06043,-0.21057 v -0.0165 q -0.09155,-0.0513 -0.203247,-0.0787 -0.111694,-0.0293 -0.232544,-0.0293 -0.195923,0 -0.31311,0.0696 -0.117188,0.0678 -0.117188,0.1886 0,0.0787 0.04761,0.13916 0.04944,0.0604 0.137329,0.0952 0.08789,0.033 0.203247,0.033 z" /><path style="fill:#fff;" d="m 48.247181,105.37486 q 0.188599,-0.2179 0.483398,-0.2179 0.0824,0 0.17212,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283813,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 h 0.227051 l 0.04028,0.17212 z" /><path style="fill:#fff;" d="m 50.036121,107.0283 q -0.276489,0 -0.476074,-0.1117 -0.199585,-0.11169 -0.303955,-0.32043 -0.10437,-0.21057 -0.10437,-0.49805 0,-0.28564 0.106201,-0.49805 0.106201,-0.2124 0.311279,-0.32775 0.205079,-0.11536 0.492554,-0.11353 0.150147,-0.002 0.2948,0.0275 0.144653,0.0275 0.245361,0.0751 l -0.07324,0.30395 q -0.223389,-0.1007 -0.465088,-0.1007 -0.305786,0 -0.443115,0.15747 -0.137329,0.15564 -0.137329,0.46692 0,0.32592 0.15564,0.48523 0.15747,0.1593 0.457763,0.1593 0.122681,0 0.217896,-0.0238 0.09705,-0.0256 0.254516,-0.0842 l 0.09338,0.27832 q -0.153809,0.0586 -0.316772,0.0915 -0.162964,0.033 -0.309449,0.033 z" /><path style="fill:#fff;" d="m 51.861683,105.15513 q 0.234375,0 0.393677,0.0915 0.159301,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 h -0.300293 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09705,-0.14283 -0.316772,-0.14283 -0.157471,0 -0.296631,0.0568 -0.13916,0.0549 -0.247192,0.15381 v 1.333 h -0.300293 v -2.77771 h 0.300293 v 1.15357 q 0.210571,-0.20691 0.545654,-0.20691 z" /><path style="fill:#fff;" d="m 54.827991,104.47581 q -0.100708,0 -0.155639,0.0476 -0.0531,0.0458 -0.07324,0.13733 -0.02014,0.0897 -0.02014,0.23621 v 0.30395 l 0.437622,-0.002 v 0.26551 h -0.437622 v 1.51794 h -0.300293 v -1.51794 h -0.320434 v -0.26184 l 0.320434,-0.002 v -0.28564 q 0,-0.34424 0.115357,-0.54016 0.115356,-0.19775 0.410156,-0.19775 0.06226,0 0.234375,0.0183 l 0.0769,0.009 -0.06592,0.29297 q -0.06775,-0.007 -0.08606,-0.009 -0.08972,-0.0128 -0.135499,-0.0128 z" /><path style="fill:#fff;" d="m 56.150013,107.03196 q -0.27832,0 -0.490723,-0.11536 -0.210571,-0.11535 -0.327758,-0.32592 -0.115357,-0.21241 -0.115357,-0.4889 0,-0.28015 0.115357,-0.49438 0.117187,-0.21423 0.327758,-0.33142 0.212403,-0.11719 0.490723,-0.11719 0.272827,0 0.479736,0.11719 0.206909,0.11719 0.318604,0.33142 0.111694,0.2124 0.109863,0.49438 0,0.27832 -0.113525,0.4889 -0.111695,0.21057 -0.318604,0.32592 -0.205078,0.11536 -0.476074,0.11536 z m 0,-0.28931 q 0.172119,0 0.303955,-0.0787 0.133667,-0.0806 0.206909,-0.22522 0.07507,-0.14649 0.07874,-0.33692 -0.0037,-0.19409 -0.07874,-0.3424 -0.07507,-0.14832 -0.206909,-0.22889 -0.131836,-0.0824 -0.303955,-0.0824 -0.183105,0 -0.324097,0.0824 -0.13916,0.0824 -0.216064,0.23072 -0.07507,0.14831 -0.07507,0.34424 0,0.19043 0.07507,0.33508 0.0769,0.14465 0.216064,0.22339 0.13916,0.0787 0.324097,0.0787 z" /><path style="fill:#fff;" d="m 57.812611,105.37486 q 0.188598,-0.2179 0.483398,-0.2179 0.0824,0 0.172119,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283814,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 h 0.22705 l 0.04028,0.17212 z" /><path style="letter-spacing:0.2px;fill:#ffffff" d="m 60.451576,105.47007 v 0.96313 q 0,0.0806 0.03479,0.15748 0.03662,0.0751 0.109864,0.12451 0.07324,0.0476 0.177612,0.0476 0.07324,0 0.166626,-0.0128 v 0.26916 q -0.119019,0.011 -0.241699,0.011 -0.170288,0 -0.289307,-0.0732 -0.119019,-0.0733 -0.179443,-0.19593 -0.06043,-0.12451 -0.06043,-0.27465 v -1.01624 h -0.322266 v -0.2655 h 0.322266 v -0.64087 h 0.281982 v 0.64087 h 0.490723 v 0.2655 h -0.490723 z" /><path style="letter-spacing:-0.1px;fill:#ffffff" d="m 62.391079,105.15513 q 0.234375,0 0.393677,0.0915 0.159301,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 H 62.80307 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09705,-0.14283 -0.316772,-0.14283 -0.157471,0 -0.296631,0.0568 -0.13916,0.0549 -0.247192,0.15381 v 1.333 h -0.300293 v -2.77771 h 0.300293 v 1.15357 q 0.210571,-0.20691 0.545654,-0.20691 z" /><path style="letter-spacing:-0.1px;fill:#ffffff" d="m 64.4151,106.75181 q 0.122681,0 0.26001,-0.0275 0.137329,-0.0275 0.274658,-0.0806 l 0.09338,0.25634 q -0.130005,0.0549 -0.32959,0.0916 -0.199585,0.0366 -0.362549,0.0366 -0.432129,0 -0.670166,-0.23072 -0.238037,-0.23254 -0.238037,-0.71411 0,-0.30029 0.10437,-0.50903 0.106201,-0.21057 0.305786,-0.3186 0.199585,-0.10804 0.479737,-0.10804 0.247192,0 0.413818,0.11536 0.166626,0.11353 0.247192,0.29846 0.08057,0.18311 0.08057,0.39368 0,0.14465 -0.04028,0.28931 l -1.274414,0.009 q 0.04028,0.24719 0.205078,0.37354 0.164795,0.12451 0.450439,0.12451 z m -0.122681,-1.31653 q -0.260009,0 -0.391845,0.15015 -0.131836,0.15014 -0.150147,0.40466 l 0.990601,-0.009 q 0.0037,-0.0439 0.0037,-0.0659 0,-0.12452 -0.04578,-0.23255 -0.04578,-0.10986 -0.148316,-0.17761 -0.100708,-0.0696 -0.258179,-0.0696 z" /><path style="fill:#fff;" d="m 67.296059,106.75181 q 0.12268,0 0.260009,-0.0275 0.13733,-0.0275 0.274659,-0.0806 l 0.09338,0.25634 q -0.130004,0.0549 -0.329589,0.0916 -0.199585,0.0366 -0.362549,0.0366 -0.432129,0 -0.670166,-0.23072 -0.238037,-0.23254 -0.238037,-0.71411 0,-0.30029 0.10437,-0.50903 0.106201,-0.21057 0.305786,-0.3186 0.199585,-0.10804 0.479736,-0.10804 0.247193,0 0.413819,0.11536 0.166626,0.11353 0.247192,0.29846 0.08057,0.18311 0.08057,0.39368 0,0.14465 -0.04028,0.28931 l -1.274414,0.009 q 0.04028,0.24719 0.205078,0.37354 0.164795,0.12451 0.45044,0.12451 z m -0.122681,-1.31653 q -0.26001,0 -0.391846,0.15015 -0.131836,0.15014 -0.150146,0.40466 l 0.9906,-0.009 q 0.0037,-0.0439 0.0037,-0.0659 0,-0.12452 -0.04578,-0.23255 -0.04578,-0.10986 -0.148315,-0.17761 -0.100708,-0.0696 -0.258179,-0.0696 z" /><path style="letter-spacing:0.1px;fill:#ffffff" d="m 68.676674,105.37486 q 0.188599,-0.2179 0.483398,-0.2179 0.0824,0 0.172119,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283814,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 h 0.227051 l 0.04028,0.17212 z" /><path style="letter-spacing:0.1px;fill:#ffffff" d="m 70.080383,105.37486 q 0.188599,-0.2179 0.483399,-0.2179 0.0824,0 0.172119,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283813,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 H 70.0401 l 0.04028,0.17212 z" /><path style="fill:#fff;" d="m 72.018764,107.03196 q -0.27832,0 -0.490722,-0.11536 -0.210571,-0.11535 -0.327759,-0.32592 -0.115356,-0.21241 -0.115356,-0.4889 0,-0.28015 0.115356,-0.49438 0.117188,-0.21423 0.327759,-0.33142 0.212402,-0.11719 0.490722,-0.11719 0.272828,0 0.479737,0.11719 0.206909,0.11719 0.318603,0.33142 0.111695,0.2124 0.109864,0.49438 0,0.27832 -0.113526,0.4889 -0.111694,0.21057 -0.318603,0.32592 -0.205078,0.11536 -0.476075,0.11536 z m 0,-0.28931 q 0.17212,0 0.303956,-0.0787 0.133667,-0.0806 0.206909,-0.22522 0.07507,-0.14649 0.07873,-0.33692 -0.0037,-0.19409 -0.07873,-0.3424 -0.07507,-0.14832 -0.206909,-0.22889 -0.131836,-0.0824 -0.303956,-0.0824 -0.183105,0 -0.324096,0.0824 -0.13916,0.0824 -0.216065,0.23072 -0.07507,0.14831 -0.07507,0.34424 0,0.19043 0.07507,0.33508 0.0769,0.14465 0.216065,0.22339 0.13916,0.0787 0.324096,0.0787 z" /><path style="fill:#fff;" d="m 73.681362,105.37486 q 0.188599,-0.2179 0.483399,-0.2179 0.0824,0 0.172119,0.0165 l -0.05127,0.28564 q -0.05127,-0.005 -0.100708,-0.005 -0.283813,0 -0.470581,0.17578 v 1.35681 h -0.300293 v -1.78344 h 0.227051 l 0.04028,0.17212 z" /><path style="letter-spacing:0.11px;fill:#ffffff" d="m 76.655128,107.03196 q -0.27832,0 -0.490722,-0.11536 -0.210571,-0.11535 -0.327759,-0.32592 -0.115356,-0.21241 -0.115356,-0.4889 0,-0.28015 0.115356,-0.49438 0.117188,-0.21423 0.327759,-0.33142 0.212402,-0.11719 0.490722,-0.11719 0.272828,0 0.479737,0.11719 0.206909,0.11719 0.318603,0.33142 0.111695,0.2124 0.109864,0.49438 0,0.27832 -0.113526,0.4889 -0.111694,0.21057 -0.318603,0.32592 -0.205078,0.11536 -0.476075,0.11536 z m 0,-0.28931 q 0.17212,0 0.303956,-0.0787 0.133667,-0.0806 0.206909,-0.22522 0.07507,-0.14649 0.07873,-0.33692 -0.0037,-0.19409 -0.07873,-0.3424 -0.07507,-0.14832 -0.206909,-0.22889 -0.131836,-0.0824 -0.303956,-0.0824 -0.183105,0 -0.324096,0.0824 -0.13916,0.0824 -0.216065,0.23072 -0.07507,0.14831 -0.07507,0.34424 0,0.19043 0.07507,0.33508 0.07691,0.14465 0.216065,0.22339 0.13916,0.0787 0.324096,0.0787 z" /><path style="letter-spacing:0.11px;fill:#ffffff" d="m 79.002678,105.15513 q 0.234375,0 0.393677,0.0915 0.159301,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 h -0.300293 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09521,-0.14283 -0.316772,-0.14466 -0.157471,0.002 -0.296631,0.0586 -0.137329,0.0549 -0.24353,0.15564 l -0.0037,1.33117 h -0.300293 l 0.0037,-1.78344 h 0.221557 l 0.05676,0.17761 q 0.212402,-0.22522 0.563965,-0.22522 z" /><path style="fill:#fff;" d="m 80.392586,104.2103 h 0.300293 v 2.77588 h -0.300293 z" /><path style="fill:#fff;" d="m 81.456429,104.64426 q -0.08789,0 -0.146485,-0.0586 -0.05859,-0.0586 -0.05859,-0.14648 0,-0.0861 0.05859,-0.14466 0.05859,-0.0586 0.146485,-0.0586 0.08606,0 0.144653,0.0586 0.05859,0.0586 0.05859,0.14466 0,0.0879 -0.05859,0.14648 -0.05859,0.0586 -0.144653,0.0586 z m -0.15564,0.55848 h 0.300293 v 1.78344 h -0.300293 z" /><path style="fill:#fff;" d="m 83.060432,105.15513 q 0.234375,0 0.393677,0.0915 0.159302,0.0915 0.238037,0.25269 0.08057,0.16113 0.08057,0.36987 v 1.11694 h -0.300293 v -1.03271 q 0,-0.22522 -0.09705,-0.36804 -0.09521,-0.14283 -0.316773,-0.14466 -0.15747,0.002 -0.29663,0.0586 -0.13733,0.0549 -0.243531,0.15564 l -0.0037,1.33117 h -0.300293 l 0.0037,-1.78344 h 0.221558 l 0.05676,0.17761 q 0.212402,-0.22522 0.563964,-0.22522 z" /><path style="fill:#fff;" d="m 85.184456,106.75181 q 0.122681,0 0.26001,-0.0275 0.137329,-0.0275 0.274658,-0.0806 l 0.09338,0.25634 q -0.130005,0.0549 -0.32959,0.0916 -0.199585,0.0366 -0.362549,0.0366 -0.432129,0 -0.670166,-0.23072 -0.238037,-0.23254 -0.238037,-0.71411 0,-0.30029 0.10437,-0.50903 0.106201,-0.21057 0.305786,-0.3186 0.199585,-0.10804 0.479736,-0.10804 0.247193,0 0.413819,0.11536 0.166626,0.11353 0.247192,0.29846 0.08057,0.18311 0.08057,0.39368 0,0.14465 -0.04028,0.28931 l -1.274414,0.009 q 0.04028,0.24719 0.205078,0.37354 0.164795,0.12451 0.45044,0.12451 z m -0.122681,-1.31653 q -0.26001,0 -0.391845,0.15015 -0.131836,0.15014 -0.150147,0.40466 l 0.990601,-0.009 q 0.0037,-0.0439 0.0037,-0.0659 0,-0.12452 -0.04578,-0.23255 -0.04578,-0.10986 -0.148315,-0.17761 -0.100708,-0.0696 -0.258179,-0.0696 z" /><path style="fill:#fff;" d="m 86.400276,105.62937 q -0.102539,0 -0.172119,-0.0659 -0.06958,-0.0678 -0.06958,-0.16662 0,-0.10071 0.06958,-0.16663 0.06958,-0.0677 0.172119,-0.0677 0.10437,0 0.17395,0.0677 0.06958,0.0659 0.06958,0.16663 0,0.0989 -0.06958,0.16662 -0.06958,0.0659 -0.17395,0.0659 z m 0,1.3971 q -0.102539,0 -0.172119,-0.0659 -0.06958,-0.0678 -0.06958,-0.16663 0,-0.10071 0.06958,-0.16662 0.06958,-0.0678 0.172119,-0.0678 0.10437,0 0.17395,0.0678 0.06958,0.0659 0.06958,0.16662 0,0.0989 -0.06958,0.16663 -0.06958,0.0659 -0.17395,0.0659 z" /><text x="88" y="107" style="fill:#e1e9ef;font: 3px sans-serif, Arial;">EASTER_EGG_CLICKED_LOGO_TOO_MUCH</text></g></g></svg></div>');
                    setTimeout(function () {
                        id('blue-screen-of-death').addEventListener('click', function () {
                            tn('html', 0).style.overflowY = 'unset';
                            this.remove();
                        });
                    }, 1000);
                }
            });
        }

               const monthInt = month + 1;

               if (get('bools').charAt(BOOL_INDEX.EVENTS) == '1' && n(id('mod-logo-hat')) && !tn('body', 0).classList.contains('mod-logo-hat-hidden')) {
            let insertElement = id('mod-logo');
            let isDefaultLikeLayout = false;

            const birthday = parseInt(get('birthday').charAt(0) + get('birthday').charAt(1)) == dayInt && parseInt(get('birthday').charAt(3) + get('birthday').charAt(4)) == monthInt;
            const christmas = monthInt == 12 && dayInt > 10 && dayInt < 31;
            const sinterklaas = monthInt == 12 && dayInt <= 5;

            if ((get('layout') == 1 || get('layout') == 4) && !n(tn('sl-header', 0)) && (birthday || christmas || sinterklaas)) {
                tn('sl-header', 0).style.overflow = 'hidden';
                tn('sl-header', 0).insertAdjacentHTML('beforeend', window.logo('mod-logo-inserted', null, 'var(--action-neutral-normal)', 'position:absolute;width:50px;height:54px;right:25px;bottom:-15px;z-index:-1;transition:bottom 0.4s ease 0.3s;'));
                insertElement = id('mod-logo-inserted');
                isDefaultLikeLayout = true;
            }
            if (insertElement) {
                               if (birthday) {
                    insertElement.insertAdjacentHTML('beforebegin', '<svg id="mod-logo-hat" style="width:37px;translate:38px -12px;' + (isDefaultLikeLayout ? 'right:80px;left:unset;' : '') + '" viewBox="0 0 448 511.7"><path fill="#FFDB56" d="M415.7 428.6c-101.8 39.1-258 38.3-382.5.7L226 11.3l189.7 417.3z"/><path fill="#F6C134" d="M415.7 428.6a411 411 0 0 1-77 20.6l-155.5-345L226 11.4l189.7 417.2z"/><circle fill="#D83636" cx="224" cy="41.6" r="41.6"/><path fill="#F2433B" d="M224 0h.2a37 37 0 0 1-35.5 63.6 41.4 41.4 0 0 1-6.3-22C182.4 18.6 201 0 224 0zM106 271.4l38.5-83.3c46.8-17.9 89.7-37.5 134.8-59.6l2.5 5.5 22.5 51.6C244.7 223.9 177.7 251 106 271.4zm236.9-3 5.3 11.7a756.5 756.5 0 0 1-304 126l37-80.6A770.9 770.9 0 0 0 322 223.6l20.9 44.9zm22.7 50 2.2 5 23 50.9a776.6 776.6 0 0 1-72.1 48.6 485.5 485.5 0 0 1-68.8 35.3c-61.4 1.7-117.6-4-166.1-16.2 93-19.6 187.8-59.6 281.8-123.6z"/><path fill="#F2433B" d="M19.3 480.5a27.8 27.8 0 0 1 17-53A635.4 635.4 0 0 0 227.9 456c64 0 127.7-9.2 183.2-28.5a27.8 27.8 0 1 1 18.3 52.6C368 501.4 298 511.6 227.8 511.7a691.8 691.8 0 0 1-208.5-31.2z"/></svg>');
                }
                               else if (christmas) {
                    insertElement.insertAdjacentHTML('beforebegin', '<svg id="mod-logo-hat" viewBox="0 0 408.7 251.7"' + (isDefaultLikeLayout ? ' style="left:unset;right:35px;height:80px;width:70px;"' : '') + '><g><path d="m382.6 131.7-91.8 63-148.7-1.2-15-21 8.6-16.2c-7.2-4.8-16-9-25.7-12-12.7-4-25.1-5.4-35.5-4.6l-1.2-.5-6.6-20.4a138.5 138.5 0 0 0 74.2-68l2-3.8A99.1 99.1 0 0 1 243 1.1l3.4.4c71.8 14 125.8 59.4 132.8 114z" fill="#ed4241"/><path d="M274.2 8.8c57.6 19 98.9 59.4 104.9 106.8l3.5 16-91.8 63-148.7-1.1-14.4-20.1.4-2 124.7-23c36.4-6 64-36.4 64-73.2a74 74 0 0 0-41.3-65.8z" fill="#c52c37"/><path d="M408.7 164.7c-4 30.8-65.1 65.5-144.2 80.2-71.6 13.4-135.3 6.3-157.8-15.4l20.5-57.6c18.8 18.1 72 24 132 12.9 66-12.4 117.1-41.3 120.5-67z" fill="#c1cfe8"/><path d="M406 161.2c-17.6 38.3-85 69.2-166.9 73.2-20.4 1-40 .2-58.4-2l-3.8-.5a43.5 43.5 0 0 1-43.2-42.6c0-4 .6-7.8 1.7-11.5l.2.2c23.6 13.2 71 16.6 123.5 6.8 66.2-12.4 117.2-41.3 120.6-67l26.5 42.8z" fill="#d7e0ef"/><path d="M75.3 141.3a37.8 37.8 0 1 1-75.5.2 37.8 37.8 0 0 1 75.5-.2z" fill="#c1cfe8"/><path d="M67.6 119A37.5 37.5 0 0 0 0 141.6l.3 1.6a36.5 36.5 0 0 0 33.2 19.5c20 0 36.2-14.5 36.2-32.5 0-3.5-.7-6.9-1.8-10z" fill="#d7e0ef"/></g></svg>');
                }
                               else if (sinterklaas) {
                    insertElement.insertAdjacentHTML('beforebegin', '<svg id="mod-logo-hat" viewBox="0 0 155.5 253.7" width="155.5" height="253.7" style="translate:30px -25px;width:40px;' + (isDefaultLikeLayout ? 'left:unset;right:73px;' : '') + '"><defs><linearGradient x1="162.4" y1="180" x2="317.9" y2="180" gradientUnits="userSpaceOnUse" id="a"><stop offset="0" stop-color="#ae1d1a"/><stop offset="1" stop-color="#da2d29"/></linearGradient><linearGradient x1="162.6" y1="212.5" x2="317.7" y2="212.5" gradientUnits="userSpaceOnUse" id="b"><stop offset="0" stop-color="#f39221"/><stop offset="1" stop-color="#ffc800"/></linearGradient><linearGradient x1="169.4" y1="289.4" x2="310.8" y2="289.4" gradientUnits="userSpaceOnUse" id="c"><stop offset="0" stop-color="#f39221"/><stop offset="1" stop-color="#ffc800"/></linearGradient><linearGradient x1="226.3" y1="180" x2="253.7" y2="180" gradientUnits="userSpaceOnUse" id="d"><stop offset="0" stop-color="#f8a813"/><stop offset="1" stop-color="#fab20d"/></linearGradient><linearGradient x1="162.4" y1="132.3" x2="317.9" y2="132.3" gradientUnits="userSpaceOnUse" id="e"><stop offset="0" stop-color="#f39221"/><stop offset="1" stop-color="#ffc800"/></linearGradient></defs><g><path d="M162.4 186.9c2.5-12.5 6.2-23.9 10.6-32.8l.9-1.8c22.5-45.5 47.3-82 66-99.2h.2c18.7 17.2 43.5 53.7 66 99.2l.9 1.8c4.4 9 8.1 20.3 10.6 32.8l.3-.2a551.6 551.6 0 0 1-12.5 118l.2.5a1293.6 1293.6 0 0 1-131.2 0l.5-.6c-4.3-18-8-41.9-10.3-68.1-1.6-18-2.3-34.9-2.2-49.8z" fill="url(#a)" transform="translate(-162.4 -53.1)"/><path d="M315.8 232.3c-16.6-5.8-44.4-9.6-75.8-9.6s-59.1 3.8-75.8 9.5c-.8-10.2-1.4-20-1.6-29.4h.2c16.5-6.1 44.9-10.1 77.2-10.1 32.5 0 61 4 77.5 10.2l.2-.2c-.3 9.2-.8 19-1.6 29.1z" fill="url(#b)" transform="translate(-162.4 -53.1)"/><path d="M169.4 276.6c16.9-2.8 42-4.6 70.2-4.6 28.6 0 54.2 1.8 71.2 4.8a379.9 379.9 0 0 1-5.4 27.8l.2.6a1293.6 1293.6 0 0 1-131.2 0l.5-.6c-2-8.2-3.8-17.6-5.4-28z" fill="url(#c)" transform="translate(-162.4 -53.1)"/><path d="M226.3 278.3V81.7h27.4v196.6z" fill="url(#d)" transform="translate(-162.4 -53.1)"/><path d="M317.2 204.3a118 118 0 0 0-10.2-28.8l-.9-1.6c-22.5-42.2-47.3-76.1-66-92h-.2c-18.7 15.9-43.5 49.8-66 92l-.9 1.6c-3.9 7.4-7.3 16.5-9.7 26.6l-.8.7c-.1-4.4-.2-8.6-.1-12.6v.1a129 129 0 0 1 10.6-31.9l.9-1.6c22.5-44.3 47.3-79.7 66-96.5h.2c18.7 16.8 43.5 52.2 66 96.5l.9 1.6a129 129 0 0 1 10.6 32l.3-.2-.1 12.7z" fill="url(#e)" transform="translate(-162.4 -53.1)"/></g></svg>');
                }
                               if (birthday || christmas || sinterklaas) {
                    id('mod-logo-hat').addEventListener('click', function () {
                        if (isDefaultLikeLayout) {
                            id('mod-logo-inserted').style.bottom = '-55px';
                            this.style.opacity = '0';
                            this.style.animation = 'none';
                        }
                        this.classList.add('mod-logo-hat-clicked');
                        setTimeout(function () {
                            tn('body', 0).classList.add('mod-logo-hat-hidden');
                            if (id('mod-logo-hat')) {
                                id('mod-logo-hat').remove();
                            }
                        }, 1050);
                    });
                }
            }
        }
        if (get('bools').charAt(BOOL_INDEX.EVENTS) == '1' && n(id('mod-logo-decoration')) && !tn('body', 0).classList.contains('mod-logo-decoration-hidden')) {
            let insertElement = id('mod-logo');
            let position = 'beforebegin';
            if (get('layout') == 1 || get('layout') == 4) {
                insertElement = tn('sl-header', 0);
                position = 'beforeend';
            }

                       const C = Math.floor(year / 100);
            const N = year - 19 * Math.floor(year / 19);
            const K = Math.floor((C - 17) / 25);
            let I = C - Math.floor(C / 4) - Math.floor((C - K) / 3) + 19 * N + 15;
            I = I - 30 * Math.floor((I / 30));
            I = I - Math.floor(I / 28) * (1 - Math.floor(I / 28) * Math.floor(29 / (I + 1)) * Math.floor((21 - N) / 11));
            let J = year + Math.floor(year / 4) + I + 2 - C + Math.floor(C / 4);
            J = J - 7 * Math.floor(J / 7);
            const L = I - J;
            const M = 3 + Math.floor((L + 40) / 44);
            const D = L + 28 - 31 * Math.floor(M / 4);

            const easter = monthInt == M && (dayInt == D || dayInt == D + 1);
            const halloween = monthInt == 10 && dayInt > 25;
            const bevrijdingsdag = monthInt == 5 && dayInt == 5;
            const newyear = (monthInt == 12 && dayInt == 31) || (monthInt == 1 && dayInt == 1);

                       if (easter) {
                insertElement.insertAdjacentHTML(position, '<svg id="mod-logo-decoration"' + ((get('layout') == 1 || get('layout') == 4) ? ' style="right:' + (n(id('mod-logo-hat')) ? '50' : '90') + 'px;top:30px;z-index:-10;"' : '') + ' viewBox="0 0 313.1 232"><g><path d="M227.1 110.9a62.9 62.9 0 0 1-57.2 64.8 62.8 62.8 0 0 1-69.7-52.7l-.5-5C94 56.3 116.8 3.8 151.4.2c35-3.7 68.8 44.2 75.4 107l.1 1.2z" fill="#ff896c"/><path d="m205.7 38.5-1.4-1a34.8 34.8 0 0 0-46 3.4l-1.9 2a34.8 34.8 0 0 1-46 2.7l-2.5-1.8-4.2 14.3c1.7.9 3.2 1.9 4.7 3l2.6 1.7a34.8 34.8 0 0 0 46-2.7l1.9-2a34.8 34.8 0 0 1 45.9-3.3l2.6 1.7c2.7 2.1 5.7 3.8 9 5zM98.6 96.3a34 34 0 0 1 15.3 6.5l2.6 1.7a34.8 34.8 0 0 0 46-2.6l1.9-2a34.8 34.8 0 0 1 41.8-6l8-11.5-1.8-1.4-2.6-1.7a34.8 34.8 0 0 0-46 3.4l-1.9 2a34.8 34.8 0 0 1-46 2.7l-2.5-1.8a34 34 0 0 0-13.5-6.2zM196.1 118.1a35.3 35.3 0 0 0-31.5 9.8l-1.9 2a34.5 34.5 0 0 1-34.8 8.4l6.7 18.6 3.5.2c9.8.2 18.8-3.7 25.1-10l2-2a34.8 34.8 0 0 1 24.4-10.3z" fill="#ff5757"/><path d="M133.4 149.4a62.9 62.9 0 0 1-37.5 77.9 62.8 62.8 0 0 1-81.4-31.9l-1.9-4.6C-9.6 132.9-1.8 76.2 30.5 63.3c32.7-13 78.2 24 101.6 82.6l.4 1.1z" fill="#5de7ff"/><path d="M309.6 180.3a62.9 62.9 0 0 1-72.5 47 62.8 62.8 0 0 1-53-69.5l.9-5c11-60.9 47.2-105.3 81.4-99.5 34.8 5.9 54.4 61.1 43.9 123.4l-.2 1.2z" fill="#ffe16b"/><path d="m109 104.2-16.3 20.4-31.9 1L42.1 150l-31 1-6.7 12.4L1.8 147 8 135.6l29-1L54.5 112l29.8-1 15.2-19zM129.1 139.7l-15 18.8-36.5 1.2-21.4 27.9-35.5 1.2-4.9 8.8-5.5-13.9 6.9-12.6 33.1-1.1 20-26 34.1-1.2 16.6-20.7z" fill="#5ca7ff"/><path d="M261.6 141.3c.8 5.6-3 10.8-8.4 11.6-5.5.8-10.6-3-11.4-8.7-.9-5.6 2.9-10.8 8.4-11.6 5.4-.8 10.5 3 11.4 8.7zM304.8 150c.9 5.6-2.9 10.8-8.4 11.6-5.4.8-10.5-3-11.4-8.7-.8-5.6 3-10.8 8.4-11.6 5.5-.8 10.6 3 11.4 8.7zM218.7 132c.9 5.6-2.9 10.8-8.4 11.6-5.4.8-10.5-3-11.4-8.7-.8-5.5 3-10.7 8.4-11.6 5.5-.8 10.6 3.1 11.4 8.7zM246 95c.6 5.6-3.3 10.7-8.8 11.3-5.5.7-10.5-3.4-11.2-9a10.1 10.1 0 0 1 8.8-11.3c5.5-.7 10.5 3.4 11.1 9zM288.2 103.6c.7 5.7-3.3 10.7-8.7 11.4-5.5.6-10.5-3.4-11.2-9a10.1 10.1 0 0 1 8.8-11.4c5.5-.6 10.4 3.4 11.1 9zM233 184c.6 5.6-3.3 10.7-8.8 11.3-5.5.7-10.5-3.4-11.2-9a10.1 10.1 0 0 1 8.8-11.3c5.5-.7 10.5 3.4 11.1 9zM275.2 192.6c.7 5.7-3.3 10.7-8.7 11.4-5.5.6-10.5-3.4-11.2-9a10.1 10.1 0 0 1 8.8-11.4c5.5-.6 10.4 3.4 11.1 9z" fill="#ffba3a"/></g></svg>');
            }
                       else if (halloween) {
                insertElement.insertAdjacentHTML(position, '<svg id="mod-logo-decoration"' + ((get('layout') == 1 || get('layout') == 4) ? ' style="right:' + (n(id('mod-logo-hat')) ? '50' : '90') + 'px;top:30px;z-index:-10;"' : '') + ' viewBox="0 0 186.2 160.9"><g><path d="M121 149c0 7-15 12-34 12s-35-5-35-12 16-12 35-12 34 5 34 12zM154 41c0 7-28 13-61 13-34 0-61-6-61-13s27-13 61-13c33 0 61 6 61 13z" fill="#ca6512"/><path d="M125 154c6-9 8-30 6-54-2-21-7-38-13-48l-1-1a9 9 0 0 1 2-8h1c4-3 9-5 14-5 20 0 36 27 36 60s-16 60-36 60l-9-2z" fill="#ca6512"/><path d="m99 154-30 1-13-1a72 72 0 0 1-22-55c0-35 20-64 45-64 24 0 44 26 45 60l2 27v2c0 12-5 23-12 31z" fill="#ca6512"/><path d="M49 40c-13 8-23 30-23 56 0 24 9 46 22 55l-3 2-8-2-9-4c-13-6-23-29-23-56l1-17 1-2c3-18 16-32 32-36h8l4 2z" fill="#ca6512"/><path d="m106 30 4 2v3l-6 10h-3c-3-4-12-7-21-7l-6 1-1-2 9-7c3-2 4-5 4-9s-2-7-5-9h-1c-2 0-3-1-3-3V8l6-6a6 6 0 0 1 9 1z" fill="#34785d"/><path d="M116 121v2c0 21-13 38-30 38l-7-1-6-3c-17-4-30-28-30-57 0-32 16-57 36-57 19 0 35 24 36 54z" fill="#eb7615"/><path d="M114 154c6-9 8-30 6-54-2-21-7-38-13-48l-1-1a9 9 0 0 1 2-7v-1c5-3 10-5 15-5 20 0 36 27 36 60s-16 60-36 60l-9-2z" fill="#eb7615"/><path d="m140 40 4-2h8c16 4 29 18 32 36l1 2 1 17c0 27-10 50-22 56l-9 4-9 2-3-2c13-9 22-30 22-55 0-26-10-48-23-56z" fill="#eb7615"/><path d="M60 42c-14 8-23 30-23 56 0 25 9 46 21 55l-2 2-9-2-9-4c-13-6-23-29-23-56l2-17v-2c4-18 16-32 33-36h7l4 2z" fill="#eb7615"/><path d="m28 148-8-3-10-11-6-10a119 119 0 0 1-3-48v-2c3-17 14-31 27-35h7C19 46 8 68 8 94c0 22 8 41 19 50zM70 35l-9-2-16 1c2-3 8-5 15-5 5 0 9 1 12 3zM141 36h-6l-4-3h-6l-9 1c3-2 8-3 14-3 5 0 10 1 13 3z" fill="#eb7615"/><path d="m70 69-24 1 14-22z"/><path d="m118 48 14 22-24-1z"/><path d="M95 95H82l7-12z"/><path d="M66 67H55l7-10zM66 122l1-12 11 1-2 12zM102 123l-1-12 10-1 2 12z" fill="#fff"/><path d="M112 110c17-4 31-11 36-19l2 2v2c0 22-26 40-58 40-29 0-53-15-57-34v-1c7 4 19 8 33 10l1 11 8-10 13 1 8-1h3l6 10z"/><path d="m121 57 7 10h-11z" fill="#fff"/></g></svg>');
            }
                       else if (bevrijdingsdag) {
                insertElement.insertAdjacentHTML(position, '<svg id="mod-logo-decoration"' + ((get('layout') == 1 || get('layout') == 4) ? ' style="right:' + (n(id('mod-logo-hat')) ? '50' : '90') + 'px;top:30px;z-index:-10;"' : '') + ' viewBox="0 0 200.9 251.5" style="width:35px;rotate:15deg;"><defs><linearGradient x1="149.5" y1="63.4" x2="335.6" y2="63.4" gradientUnits="userSpaceOnUse" id="a"><stop offset="0" stop-color="red"/><stop offset="1" stop-color="#ff6300"/></linearGradient><linearGradient x1="149.5" y1="138.4" x2="335.6" y2="138.4" gradientUnits="userSpaceOnUse" id="b"><stop offset="0" stop-color="#0a00ff"/><stop offset="1" stop-color="#00a2ff"/></linearGradient><linearGradient x1="149.5" y1="100.9" x2="335.6" y2="100.9" gradientUnits="userSpaceOnUse" id="c"><stop offset="0" stop-color="#f0f0f0"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><g><path d="M335.6 85.3A71.2 71.2 0 0 1 292 98.9a68 68 0 0 1-47.6-17.2l-3.4-2.7a71.2 71.2 0 0 0-43.7-13.6 68 68 0 0 0-47.7 17.2V45a68 68 0 0 1 47.7-17.2c17.5 0 33.2 5.3 43.7 13.6l3.4 2.7a68 68 0 0 0 47.6 17.2c17.5 0 33.2-5.3 43.7-13.6z" fill="url(#a)" transform="translate(-134.8 -15.4)"/><path d="M335.6 160.3a71.2 71.2 0 0 1-43.7 13.6 68 68 0 0 1-47.6-17.2l-3.4-2.7a71.2 71.2 0 0 0-43.7-13.6 68 68 0 0 0-47.7 17.2V120a68 68 0 0 1 47.7-17.2c17.5 0 33.2 5.3 43.7 13.6l3.4 2.7a68 68 0 0 0 47.6 17.2c17.5 0 33.2-5.3 43.7-13.6z" fill="url(#b)" transform="translate(-134.8 -15.4)"/><path d="M335.6 122.8a71.2 71.2 0 0 1-43.7 13.6 68 68 0 0 1-47.6-17.2l-3.4-2.7a71.2 71.2 0 0 0-43.7-13.6 68 68 0 0 0-47.7 17.2V82.6a68 68 0 0 1 47.7-17.2c17.5 0 33.2 5.3 43.7 13.6l3.4 2.7A68 68 0 0 0 291.9 99c17.5 0 33.2-5.3 43.7-13.6z" fill="url(#c)" transform="translate(-134.8 -15.4)"/><path d="M4.5 245.5v-230h11v230z" fill="#ffad66"/><path d="M21.5 10.8a10.8 10.8 0 1 1-21.5 0 10.8 10.8 0 0 1 21.5 0zM15.5 246a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" fill="#ffad66"/></g></svg>');
            }
                       else if (newyear) {
                insertElement.insertAdjacentHTML(position, '<svg id="mod-logo-decoration"' + ((get('layout') == 1 || get('layout') == 4) ? ' style="right:' + (n(id('mod-logo-hat')) ? '50' : '90') + 'px;top:21px;z-index:-10;"' : '') + ' viewBox="0 0 158 151"><defs><linearGradient x1="161.4" y1="148.1" x2="225.1" y2="148.1" gradientUnits="userSpaceOnUse" id="a"><stop offset="0" stop-color="#fad914"/><stop offset="1" stop-color="#fba314"/></linearGradient><linearGradient x1="241.6" y1="129.4" x2="292.1" y2="129.4" gradientUnits="userSpaceOnUse" id="b"><stop offset="0" stop-color="#fad914"/><stop offset="1" stop-color="#fba314"/></linearGradient><linearGradient x1="270.3" y1="182.9" x2="319.6" y2="182.9" gradientUnits="userSpaceOnUse" id="c"><stop offset="0" stop-color="#fad914"/><stop offset="1" stop-color="#fba314"/></linearGradient></defs><g data-paper-data="{&quot;isPaintingLayer&quot;:true}" stroke-miterlimit="10" style="mix-blend-mode:normal"><path d="m196 129 21-10-6 22 14 18-22 1-12 18-8-19-22-6 18-15-1-20z" fill="url(#a)" transform="translate(-161 -105)"/><path d="m266 114 15-9-2 17 13 13-17 3-7 16-9-15-17-2 11-13-3-16z" fill="url(#b)" transform="translate(-161 -105)"/><path d="m302 171 18-3-10 15 7 17-16-4-14 11-1-16-16-9 17-8 3-16z" fill="url(#c)" transform="translate(-161 -105)"/><path d="M52 70c9 9 17 23 20 39 3 15 2 29-2 39M82 109c-2-6-3-13-3-21 0-18 6-34 15-43M81 147c2-26 17-48 37-55" fill="none" stroke="#e19600" stroke-width="6"/></g></svg>');
            }
                       if (!n(tn('sl-header', 0)) && (easter || halloween || bevrijdingsdag || newyear)) {
                tn('sl-header', 0).style.overflow = 'hidden';
                id('mod-logo-decoration').addEventListener('click', function () {
                    this.classList.add('mod-logo-decoration-clicked');
                    setTimeout(function () {
                        tn('body', 0).classList.add('mod-logo-decoration-hidden');
                        if (id('mod-logo-decoration')) {
                            id('mod-logo-decoration').remove();
                        }
                    }, 900);
                });
            }
        }
    }

       let liveWallpaperFrame;
    let gl;
    function stopLiveWallpaper() {
        if (liveWallpaperFrame) {
            cancelAnimationFrame(liveWallpaperFrame);
            liveWallpaperFrame = null;
        }
        tryRemove(id('mod-background-live'));
    }

    function startLiveWallpaper() {
        stopLiveWallpaper();
        tn('body', 0).insertAdjacentHTML('beforeend', '<canvas id="mod-background-live"></canvas>');
        const canvas = id('mod-background-live');
        gl = canvas.getContext("webgl");
        if (!gl) return;

               const vsSource = `
            attribute vec4 aVertexPosition;
            void main() {
                gl_Position = aVertexPosition;
            }
        `;

               const fsSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform float u_seed;

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float t = u_time * 0.5;

                               vec3 col1 = 0.5 + 0.5 * cos(u_seed + vec3(0,2,4));
                vec3 col2 = 0.5 + 0.5 * cos(u_seed + 2.0 + vec3(0,2,4));
                vec3 col3 = 0.5 + 0.5 * cos(u_seed + 4.0 + vec3(0,2,4));

                               float v = 0.0;
                vec2 c = uv * 2.0 - 1.0;
                v += sin((c.x+t));
                v += sin((c.y+t)/2.0);
                v += sin((c.x+c.y+t)/2.0);
                c += 1.0/2.0 * vec2(sin(t/3.0), cos(t/2.0));
                v += sin(sqrt(c.x*c.x+c.y*c.y+1.0)+t);
                v = v/2.0;

                               vec3 color = mix(col1, col2, smoothstep(0.0, 1.0, sin(v * 3.0 + t)));
                color = mix(color, col3, smoothstep(0.0, 1.0, cos(v * 2.0 - t)));

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
            },
            uniformLocations: {
                time: gl.getUniformLocation(shaderProgram, 'u_time'),
                resolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
                seed: gl.getUniformLocation(shaderProgram, 'u_seed')
            }
        };

        const buffers = initBuffers(gl);
        const seed = parseFloat(get('live_seed')) || Math.random() * 100;

        function render(now) {
            if (!gl) return;
            now *= 0.001;
                       if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                gl.viewport(0, 0, canvas.width, canvas.height);
            }

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(programInfo.program);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

            gl.uniform1f(programInfo.uniformLocations.time, now);
            gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
            gl.uniform1f(programInfo.uniformLocations.seed, seed);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            liveWallpaperFrame = requestAnimationFrame(render);
        }
        liveWallpaperFrame = requestAnimationFrame(render);
    }

    function initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        return shaderProgram;
    }

    function loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function initBuffers(gl) {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        return { position: positionBuffer };
    }

       function setBackground() {
        tryRemove(id('mod-background'));
        tryRemove(id('mod-backgroundcolor'));
        tryRemove(id('mod-backgroundslide'));
        tryRemove(id('mod-background-style'));
        stopLiveWallpaper();
        if ((n(get('backgroundtype')) || get('backgroundtype') == 'image') && !n(get('background'))) {
                       if (get('isbackgroundvideo') && get('isbackgroundvideo') != 'false') {
                id('somtoday-mod', 0).insertAdjacentHTML('beforeend', '<video id="mod-background" src="' + get('background') + '" style="' + getBackgroundFilters() + '" autoplay muted loop></video>');
            }
            else {
                id('somtoday-mod', 0).insertAdjacentHTML('beforeend', '<img id="mod-background" src="' + get('background') + '" style="' + getBackgroundFilters() + '">');
            }
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-background-style">#mod-background{pointer-events:none;user-select:none;position:fixed;left:calc(var(--safe-area-inset-left) - ' + get('blur') + ');top:calc(var(--safe-area-inset-top) - ' + get('blur') + ');width:calc(100% - var(--safe-area-inset-left) - var(--safe-area-inset-right) - 2 * ' + get('blur') + ');height:calc(100% - var(--safe-area-inset-top) - var(--safe-area-inset-bottom) - 2 * ' + get('blur') + ');object-fit:cover;z-index:-1;}</style>');
        }
        else if (get('backgroundtype') == 'color' && !n(get('backgroundcolor'))) {
            id('somtoday-mod', 0).insertAdjacentHTML('beforeend', '<div id="mod-backgroundcolor"></div>');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-background-style">#mod-backgroundcolor{pointer-events:none;user-select:none;position:fixed;left:0;width:100%;top:0;height:100%;object-fit:cover;z-index:-1;background:' + get('backgroundcolor') + ';}</style>');
        }
        else if (get('backgroundtype') == 'slideshow' && !n(get('background0'))) {
            const randomChoice = Math.floor(Math.random() * get('slides'));
            id('somtoday-mod', 0).insertAdjacentHTML('beforeend', '<img id="mod-backgroundslide" src="' + get('background' + randomChoice) + '">');
            tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-background-style">#mod-backgroundslide{pointer-events:none;user-select:none;position:fixed;left:0;width:100%;top:0;height:100%;object-fit:cover;z-index:-1;}</style>');
        }
        else if (get('backgroundtype') == 'live') {
            startLiveWallpaper();
        }
    }

    function getBackgroundFilters(fromSavedSettings = true) {
        let filter = '';
        let properties = ['brightness', 'contrast', 'saturate', 'opacity', 'huerotate', 'grayscale', 'sepia', 'invert', 'blur'];
        for (const filterProperty of properties) {
            const value = fromSavedSettings ? get(filterProperty) : id(filterProperty).value + id(filterProperty).dataset.unit;
            if (value != null) {
                                              filter += ' ' + (filterProperty == 'huerotate' ? 'hue-rotate' : filterProperty) + '(' + value + ')';
            }
        }
        if (fromSavedSettings) {
            if (!n(filter)) {
                filter = 'filter:' + filter + ';';
            }
        }
        return filter;
    }

       function browserSettings() {
        if (!n(get('title'))) {
            if (n(tn('title', 0).dataset.modOriginalTitle)) {
                tn('title', 0).dataset.modOriginalTitle = tn('title', 0).innerHTML;
            }
            tn('title', 0).innerHTML = get('title');
        }
        else if (!n(tn('title', 0).dataset.modOriginalTitle)) {
            tn('title', 0).innerHTML = tn('title', 0).dataset.modOriginalTitle;
        }
        for (const element of tn('link')) {
            if (element.getAttribute('rel') == 'icon') {
                if (!n(get('icon'))) {
                    if (n(element.dataset.modOriginalHref)) {
                        element.dataset.modOriginalHref = element.href;
                    }
                    element.href = get('icon');
                }
                else if (!n(element.dataset.modOriginalHref)) {
                    element.href = element.dataset.modOriginalHref;
                }
            }
        }
    }

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
        let colors = ['#ec1254', '#f27c14', '#f27c14', '#f5e31d', '#1ee8b6', '#26a1d5'];
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
            let canvas = id('confetti-canvas');
            if (canvas === null) {
                canvas = document.createElement('canvas');
                canvas.setAttribute('id', 'confetti-canvas');
                canvas.setAttribute('style', 'display:block;z-index:999999;pointer-events:none;position:fixed;top:0;left:0;transition:0.3s opacity ease;');
                document.body.appendChild(canvas);
                canvas.width = width;
                canvas.height = height;
                window.addEventListener('resize', function () {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }, { passive: true });
            }
            let context = canvas.getContext('2d');
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

       function congratulations() {
               if (get('bools').charAt(BOOL_INDEX.CONGRATULATIONS) == '1' && (year + '-' + (month + 1) + '-' + dayInt) != get('lastused')) {
                       const firstused = new Date(get('firstused'));
            const lastused = new Date(get('lastused'));
            const yeardifference = parseInt((lastused - firstused) / 1000 / 60 / 60 / 24 / 365);
                       const date = new Date();
            const birthdayday = parseInt(get('birthday').charAt(0) + get('birthday').charAt(1));
            const birthdaymonth = parseInt(get('birthday').charAt(3) + get('birthday').charAt(4));
                       let congratstext = [''];
            if (yeardifference > get('lastjubileum')) {
                congratstext = ['Bedankt' + (n(get('username')) ? (n(get('realname')) ? '' : ', ' + get('realname').replace(/ .*/, '')) : ', ' + get('username').replace(/ .*/, '')) + '!', 'Je gebruikt Somtoday Mod nu al ' + yeardifference + ' jaar. Bedankt!'];
                set('lastjubileum', yeardifference);
            }
            if (birthdayday == dayInt && birthdaymonth == (month + 1)) {
                const randomDescriptionArray = ['Maak er maar een mooie dag van!', 'Gefeliciteerd! Je bent weer een jaartje dichterbij je afstuderen!', 'Geniet ervan! Mogen al je dromen uitkomen!', 'Jaja, je bent weer jarig! Van harte gefeliciteerd!', '"School is raar, hier is een schaar" ~ iemand die ooit jarig was'];
                congratstext = ['Fijne verjaardag!', randomDescriptionArray[Math.floor(Math.random() * randomDescriptionArray.length)]];
            }
            if (congratstext[1] != null) {
                               tn('html', 0).style.overflow = 'hidden';
                tn('body', 0).insertAdjacentHTML('afterbegin', '<style>#verjaardag{width:100%;height:100%;position:fixed;top:0;left:0;z-index:10000;background:var(--bg-elevated-none);text-align:center;transition:0.3s opacity ease;}#verjaardag div{top:50%;left:50%;transform:translate(-50%, -50%);position:absolute;}.bouncetext{animation:bounce 0.3s ease forwards;color:var(--action-primary-normal);}.bouncetext.small{font-size:0;animation:bouncesmall 0.5s ease forwards 0.3s;margin-top:35px;}@keyframes bouncesmall{0%{font-size:0px;}80%{font-size:29px;}100%{font-size:24px;}}@keyframes bounce{0%{font-size:0px;}80%{font-size:58px;}100%{font-size:48px;}}.verjaardagbtn{background:var(--action-primary-normal);padding:25px 40px;width:fit-content;color:var(--bg-elevated-none) !important;margin-top:50px;opacity:0;display:block;animation:2s fadein ease 0.6s forwards;font-size:16px;border-radius:16px;transition:0.3s background ease !important;}.verjaardagbtn:hover{cursor:pointer;background:var(--action-primary-strong);}@keyframes fadein{0%{opacity:0;}100%{opacity:1;}}</style><div id="verjaardag"><div><h2 class="bouncetext">' + congratstext[0] + '</h2><h2 class="bouncetext small">' + congratstext[1] + '</h2><center><a class="verjaardagbtn" id="congrats-continue">Doorgaan</a></center></div></div>');
                id('congrats-continue').addEventListener('click', function () {
                    set('lastused', year + '-' + (month + 1) + '-' + dayInt);
                    id('confetti-canvas').style.opacity = '0';
                    id('verjaardag').style.opacity = '0';
                    setTimeout(function () {
                        tryRemove(id('confetti-canvas'));
                        tryRemove(id('verjaardag'));
                        tn('html', 0).style.overflowY = 'scroll';
                    }, 350);
                });
                setTimeout(startConfetti, 500);
            }
            else {
                set('lastused', year + '-' + (month + 1) + '-' + dayInt);
            }
        }
        else {
            set('lastused', year + '-' + (month + 1) + '-' + dayInt);
        }
    }





   
      !function (t, e) { "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).Chart = e() }(this, (function () { "use strict"; function t() { } const e = function () { let t = 0; return function () { return t++ } }(); function i(t) { return null == t } function s(t) { if (Array.isArray && Array.isArray(t)) return !0; const e = Object.prototype.toString.call(t); return "[object" === e.slice(0, 7) && "Array]" === e.slice(-6) } function n(t) { return null !== t && "[object Object]" === Object.prototype.toString.call(t) } const o = t => ("number" == typeof t || t instanceof Number) && isFinite(+t); function a(t, e) { return o(t) ? t : e } function r(t, e) { return void 0 === t ? e : t } const l = (t, e) => "string" == typeof t && t.endsWith("%") ? parseFloat(t) / 100 : t / e, h = (t, e) => "string" == typeof t && t.endsWith("%") ? parseFloat(t) / 100 * e : +t; function c(t, e, i) { if (t && "function" == typeof t.call) return t.apply(i, e) } function d(t, e, i, o) { let a, r, l; if (s(t)) if (r = t.length, o) for (a = r - 1; a >= 0; a--)e.call(i, t[a], a); else for (a = 0; a < r; a++)e.call(i, t[a], a); else if (n(t)) for (l = Object.keys(t), r = l.length, a = 0; a < r; a++)e.call(i, t[l[a]], l[a]) } function u(t, e) { let i, s, n, o; if (!t || !e || t.length !== e.length) return !1; for (i = 0, s = t.length; i < s; ++i)if (n = t[i], o = e[i], n.datasetIndex !== o.datasetIndex || n.index !== o.index) return !1; return !0 } function f(t) { if (s(t)) return t.map(f); if (n(t)) { const e = Object.create(null), i = Object.keys(t), s = i.length; let n = 0; for (; n < s; ++n)e[i[n]] = f(t[i[n]]); return e } return t } function g(t) { return -1 === ["__proto__", "prototype", "constructor"].indexOf(t) } function p(t, e, i, s) { if (!g(t)) return; const o = e[t], a = i[t]; n(o) && n(a) ? m(o, a, s) : e[t] = f(a) } function m(t, e, i) { const o = s(e) ? e : [e], a = o.length; if (!n(t)) return t; const r = (i = i || {}).merger || p; for (let s = 0; s < a; ++s) { if (!n(e = o[s])) continue; const a = Object.keys(e); for (let s = 0, n = a.length; s < n; ++s)r(a[s], t, e, i) } return t } function b(t, e) { return m(t, e, { merger: x }) } function x(t, e, i) { if (!g(t)) return; const s = e[t], o = i[t]; n(s) && n(o) ? b(s, o) : Object.prototype.hasOwnProperty.call(e, t) || (e[t] = f(o)) } const _ = { "": t => t, x: t => t.x, y: t => t.y }; function y(t, e) { const i = _[e] || (_[e] = function (t) { const e = v(t); return t => { for (const i of e) { if ("" === i) break; t = t && t[i] } return t } }(e)); return i(t) } function v(t) { const e = t.split("."), i = []; let s = ""; for (const t of e) s += t, s.endsWith("\\") ? s = s.slice(0, -1) + "." : (i.push(s), s = ""); return i } function w(t) { return t.charAt(0).toUpperCase() + t.slice(1) } const M = t => void 0 !== t, k = t => "function" == typeof t, S = (t, e) => { if (t.size !== e.size) return !1; for (const i of t) if (!e.has(i)) return !1; return !0 }; function P(t) { return "mouseup" === t.type || "click" === t.type || "contextmenu" === t.type } const D = Math.PI, O = 2 * D, C = O + D, A = Number.POSITIVE_INFINITY, T = D / 180, L = D / 2, E = D / 4, R = 2 * D / 3, I = Math.log10, z = Math.sign; function F(t) { const e = Math.round(t); t = N(t, e, t / 1e3) ? e : t; const i = Math.pow(10, Math.floor(I(t))), s = t / i; return (s <= 1 ? 1 : s <= 2 ? 2 : s <= 5 ? 5 : 10) * i } function V(t) { const e = [], i = Math.sqrt(t); let s; for (s = 1; s < i; s++)t % s == 0 && (e.push(s), e.push(t / s)); return i === (0 | i) && e.push(i), e.sort(((t, e) => t - e)).pop(), e } function B(t) { return !isNaN(parseFloat(t)) && isFinite(t) } function N(t, e, i) { return Math.abs(t - e) < i } function W(t, e) { const i = Math.round(t); return i - e <= t && i + e >= t } function j(t, e, i) { let s, n, o; for (s = 0, n = t.length; s < n; s++)o = t[s][i], isNaN(o) || (e.min = Math.min(e.min, o), e.max = Math.max(e.max, o)) } function H(t) { return t * (D / 180) } function ${"$"}(t) { return t * (180 / D) } function Y(t) { if (!o(t)) return; let e = 1, i = 0; for (; Math.round(t * e) / e !== t;)e *= 10, i++; return i } function U(t, e) { const i = e.x - t.x, s = e.y - t.y, n = Math.sqrt(i * i + s * s); let o = Math.atan2(s, i); return o < -.5 * D && (o += O), { angle: o, distance: n } } function X(t, e) { return Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2)) } function q(t, e) { return (t - e + C) % O - D } function K(t) { return (t % O + O) % O } function G(t, e, i, s) { const n = K(t), o = K(e), a = K(i), r = K(o - n), l = K(a - n), h = K(n - o), c = K(n - a); return n === o || n === a || s && o === a || r > l && h < c } function Z(t, e, i) { return Math.max(e, Math.min(i, t)) } function J(t) { return Z(t, -32768, 32767) } function Q(t, e, i, s = 1e-6) { return t >= Math.min(e, i) - s && t <= Math.max(e, i) + s } function tt(t, e, i) { i = i || (i => t[i] < e); let s, n = t.length - 1, o = 0; for (; n - o > 1;)s = o + n >> 1, i(s) ? o = s : n = s; return { lo: o, hi: n } } const et = (t, e, i, s) => tt(t, i, s ? s => t[s][e] <= i : s => t[s][e] < i), it = (t, e, i) => tt(t, i, (s => t[s][e] >= i)); function st(t, e, i) { let s = 0, n = t.length; for (; s < n && t[s] < e;)s++; for (; n > s && t[n - 1] > i;)n--; return s > 0 || n < t.length ? t.slice(s, n) : t } const nt = ["push", "pop", "shift", "splice", "unshift"]; function ot(t, e) { t._chartjs ? t._chartjs.listeners.push(e) : (Object.defineProperty(t, "_chartjs", { configurable: !0, enumerable: !1, value: { listeners: [e] } }), nt.forEach((e => { const i = "_onData" + w(e), s = t[e]; Object.defineProperty(t, e, { configurable: !0, enumerable: !1, value(...e) { const n = s.apply(this, e); return t._chartjs.listeners.forEach((t => { "function" == typeof t[i] && t[i](...e) })), n } }) }))) } function at(t, e) { const i = t._chartjs; if (!i) return; const s = i.listeners, n = s.indexOf(e); -1 !== n && s.splice(n, 1), s.length > 0 || (nt.forEach((e => { delete t[e] })), delete t._chartjs) } function rt(t) { const e = new Set; let i, s; for (i = 0, s = t.length; i < s; ++i)e.add(t[i]); return e.size === s ? t : Array.from(e) } const lt = "undefined" == typeof window ? function (t) { return t() } : window.requestAnimationFrame; function ht(t, e, i) { const s = i || (t => Array.prototype.slice.call(t)); let n = !1, o = []; return function (...i) { o = s(i), n || (n = !0, lt.call(window, (() => { n = !1, t.apply(e, o) }))) } } function ct(t, e) { let i; return function (...s) { return e ? (clearTimeout(i), i = setTimeout(t, e, s)) : t.apply(this, s), e } } const dt = t => "start" === t ? "left" : "end" === t ? "right" : "center", ut = (t, e, i) => "start" === t ? e : "end" === t ? i : (e + i) / 2, ft = (t, e, i, s) => t === (s ? "left" : "right") ? i : "center" === t ? (e + i) / 2 : e; function gt(t, e, i) { const s = e.length; let n = 0, o = s; if (t._sorted) { const { iScale: a, _parsed: r } = t, l = a.axis, { min: h, max: c, minDefined: d, maxDefined: u } = a.getUserBounds(); d && (n = Z(Math.min(et(r, a.axis, h).lo, i ? s : et(e, l, a.getPixelForValue(h)).lo), 0, s - 1)), o = u ? Z(Math.max(et(r, a.axis, c, !0).hi + 1, i ? 0 : et(e, l, a.getPixelForValue(c), !0).hi + 1), n, s) - n : s - n } return { start: n, count: o } } function pt(t) { const { xScale: e, yScale: i, _scaleRanges: s } = t, n = { xmin: e.min, xmax: e.max, ymin: i.min, ymax: i.max }; if (!s) return t._scaleRanges = n, !0; const o = s.xmin !== e.min || s.xmax !== e.max || s.ymin !== i.min || s.ymax !== i.max; return Object.assign(s, n), o } var mt = new class { constructor() { this._request = null, this._charts = new Map, this._running = !1, this._lastDate = void 0 } _notify(t, e, i, s) { const n = e.listeners[s], o = e.duration; n.forEach((s => s({ chart: t, initial: e.initial, numSteps: o, currentStep: Math.min(i - e.start, o) }))) } _refresh() { this._request || (this._running = !0, this._request = lt.call(window, (() => { this._update(), this._request = null, this._running && this._refresh() }))) } _update(t = Date.now()) { let e = 0; this._charts.forEach(((i, s) => { if (!i.running || !i.items.length) return; const n = i.items; let o, a = n.length - 1, r = !1; for (; a >= 0; --a)o = n[a], o._active ? (o._total > i.duration && (i.duration = o._total), o.tick(t), r = !0) : (n[a] = n[n.length - 1], n.pop()); r && (s.draw(), this._notify(s, i, t, "progress")), n.length || (i.running = !1, this._notify(s, i, t, "complete"), i.initial = !1), e += n.length })), this._lastDate = t, 0 === e && (this._running = !1) } _getAnims(t) { const e = this._charts; let i = e.get(t); return i || (i = { running: !1, initial: !0, items: [], listeners: { complete: [], progress: [] } }, e.set(t, i)), i } listen(t, e, i) { this._getAnims(t).listeners[e].push(i) } add(t, e) { e && e.length && this._getAnims(t).items.push(...e) } has(t) { return this._getAnims(t).items.length > 0 } start(t) { const e = this._charts.get(t); e && (e.running = !0, e.start = Date.now(), e.duration = e.items.reduce(((t, e) => Math.max(t, e._duration)), 0), this._refresh()) } running(t) { if (!this._running) return !1; const e = this._charts.get(t); return !!(e && e.running && e.items.length) } stop(t) { const e = this._charts.get(t); if (!e || !e.items.length) return; const i = e.items; let s = i.length - 1; for (; s >= 0; --s)i[s].cancel(); e.items = [], this._notify(t, e, Date.now(), "complete") } remove(t) { return this._charts.delete(t) } }; function bt(t) { return t + .5 | 0 } const xt = (t, e, i) => Math.max(Math.min(t, i), e); function _t(t) { return xt(bt(2.55 * t), 0, 255) } function yt(t) { return xt(bt(255 * t), 0, 255) } function vt(t) { return xt(bt(t / 2.55) / 100, 0, 1) } function wt(t) { return xt(bt(100 * t), 0, 100) } const Mt = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 }, kt = [..."0123456789ABCDEF"], St = t => kt[15 & t], Pt = t => kt[(240 & t) >> 4] + kt[15 & t], Dt = t => (240 & t) >> 4 == (15 & t); function Ot(t) { var e = (t => Dt(t.r) && Dt(t.g) && Dt(t.b) && Dt(t.a))(t) ? St : Pt; return t ? "#" + e(t.r) + e(t.g) + e(t.b) + ((t, e) => t < 255 ? e(t) : "")(t.a, e) : void 0 } const Ct = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)${"$"}/; function At(t, e, i) { const s = e * Math.min(i, 1 - i), n = (e, n = (e + t / 30) % 12) => i - s * Math.max(Math.min(n - 3, 9 - n, 1), -1); return [n(0), n(8), n(4)] } function Tt(t, e, i) { const s = (s, n = (s + t / 60) % 6) => i - i * e * Math.max(Math.min(n, 4 - n, 1), 0); return [s(5), s(3), s(1)] } function Lt(t, e, i) { const s = At(t, 1, .5); let n; for (e + i > 1 && (n = 1 / (e + i), e *= n, i *= n), n = 0; n < 3; n++)s[n] *= 1 - e - i, s[n] += e; return s } function Et(t) { const e = t.r / 255, i = t.g / 255, s = t.b / 255, n = Math.max(e, i, s), o = Math.min(e, i, s), a = (n + o) / 2; let r, l, h; return n !== o && (h = n - o, l = a > .5 ? h / (2 - n - o) : h / (n + o), r = function (t, e, i, s, n) { return t === n ? (e - i) / s + (e < i ? 6 : 0) : e === n ? (i - t) / s + 2 : (t - e) / s + 4 }(e, i, s, h, n), r = 60 * r + .5), [0 | r, l || 0, a] } function Rt(t, e, i, s) { return (Array.isArray(e) ? t(e[0], e[1], e[2]) : t(e, i, s)).map(yt) } function It(t, e, i) { return Rt(At, t, e, i) } function zt(t) { return (t % 360 + 360) % 360 } function Ft(t) { const e = Ct.exec(t); let i, s = 255; if (!e) return; e[5] !== i && (s = e[6] ? _t(+e[5]) : yt(+e[5])); const n = zt(+e[2]), o = +e[3] / 100, a = +e[4] / 100; return i = "hwb" === e[1] ? function (t, e, i) { return Rt(Lt, t, e, i) }(n, o, a) : "hsv" === e[1] ? function (t, e, i) { return Rt(Tt, t, e, i) }(n, o, a) : It(n, o, a), { r: i[0], g: i[1], b: i[2], a: s } } const Vt = { x: "dark", Z: "light", Y: "re", X: "blu", W: "gr", V: "medium", U: "slate", A: "ee", T: "ol", S: "or", B: "ra", C: "lateg", D: "ights", R: "in", Q: "turquois", E: "hi", P: "ro", O: "al", N: "le", M: "de", L: "yello", F: "en", K: "ch", G: "arks", H: "ea", I: "ightg", J: "wh" }, Bt = { OiceXe: "f0f8ff", antiquewEte: "faebd7", aqua: "ffff", aquamarRe: "7fffd4", azuY: "f0ffff", beige: "f5f5dc", bisque: "ffe4c4", black: "0", blanKedOmond: "ffebcd", Xe: "ff", XeviTet: "8a2be2", bPwn: "a52a2a", burlywood: "deb887", caMtXe: "5f9ea0", KartYuse: "7fff00", KocTate: "d2691e", cSO: "ff7f50", cSnflowerXe: "6495ed", cSnsilk: "fff8dc", crimson: "dc143c", cyan: "ffff", xXe: "8b", xcyan: "8b8b", xgTMnPd: "b8860b", xWay: "a9a9a9", xgYF: "6400", xgYy: "a9a9a9", xkhaki: "bdb76b", xmagFta: "8b008b", xTivegYF: "556b2f", xSange: "ff8c00", xScEd: "9932cc", xYd: "8b0000", xsOmon: "e9967a", xsHgYF: "8fbc8f", xUXe: "483d8b", xUWay: "2f4f4f", xUgYy: "2f4f4f", xQe: "ced1", xviTet: "9400d3", dAppRk: "ff1493", dApskyXe: "bfff", dimWay: "696969", dimgYy: "696969", dodgerXe: "1e90ff", fiYbrick: "b22222", flSOwEte: "fffaf0", foYstWAn: "228b22", fuKsia: "ff00ff", gaRsbSo: "dcdcdc", ghostwEte: "f8f8ff", gTd: "ffd700", gTMnPd: "daa520", Way: "808080", gYF: "8000", gYFLw: "adff2f", gYy: "808080", honeyMw: "f0fff0", hotpRk: "ff69b4", RdianYd: "cd5c5c", Rdigo: "4b0082", ivSy: "fffff0", khaki: "f0e68c", lavFMr: "e6e6fa", lavFMrXsh: "fff0f5", lawngYF: "7cfc00", NmoncEffon: "fffacd", ZXe: "add8e6", ZcSO: "f08080", Zcyan: "e0ffff", ZgTMnPdLw: "fafad2", ZWay: "d3d3d3", ZgYF: "90ee90", ZgYy: "d3d3d3", ZpRk: "ffb6c1", ZsOmon: "ffa07a", ZsHgYF: "20b2aa", ZskyXe: "87cefa", ZUWay: "778899", ZUgYy: "778899", ZstAlXe: "b0c4de", ZLw: "ffffe0", lime: "ff00", limegYF: "32cd32", lRF: "faf0e6", magFta: "ff00ff", maPon: "800000", VaquamarRe: "66cdaa", VXe: "cd", VScEd: "ba55d3", VpurpN: "9370db", VsHgYF: "3cb371", VUXe: "7b68ee", VsprRggYF: "fa9a", VQe: "48d1cc", VviTetYd: "c71585", midnightXe: "191970", mRtcYam: "f5fffa", mistyPse: "ffe4e1", moccasR: "ffe4b5", navajowEte: "ffdead", navy: "80", Tdlace: "fdf5e6", Tive: "808000", TivedBb: "6b8e23", Sange: "ffa500", SangeYd: "ff4500", ScEd: "da70d6", pOegTMnPd: "eee8aa", pOegYF: "98fb98", pOeQe: "afeeee", pOeviTetYd: "db7093", papayawEp: "ffefd5", pHKpuff: "ffdab9", peru: "cd853f", pRk: "ffc0cb", plum: "dda0dd", powMrXe: "b0e0e6", purpN: "800080", YbeccapurpN: "663399", Yd: "ff0000", Psybrown: "bc8f8f", PyOXe: "4169e1", saddNbPwn: "8b4513", sOmon: "fa8072", sandybPwn: "f4a460", sHgYF: "2e8b57", sHshell: "fff5ee", siFna: "a0522d", silver: "c0c0c0", skyXe: "87ceeb", UXe: "6a5acd", UWay: "708090", UgYy: "708090", snow: "fffafa", sprRggYF: "ff7f", stAlXe: "4682b4", tan: "d2b48c", teO: "8080", tEstN: "d8bfd8", tomato: "ff6347", Qe: "40e0d0", viTet: "ee82ee", JHt: "f5deb3", wEte: "ffffff", wEtesmoke: "f5f5f5", Lw: "ffff00", LwgYF: "9acd32" }; let Nt; function Wt(t) { Nt || (Nt = function () { const t = {}, e = Object.keys(Bt), i = Object.keys(Vt); let s, n, o, a, r; for (s = 0; s < e.length; s++) { for (a = r = e[s], n = 0; n < i.length; n++)o = i[n], r = r.replace(o, Vt[o]); o = parseInt(Bt[a], 16), t[r] = [o >> 16 & 255, o >> 8 & 255, 255 & o] } return t }(), Nt.transparent = [0, 0, 0, 0]); const e = Nt[t.toLowerCase()]; return e && { r: e[0], g: e[1], b: e[2], a: 4 === e.length ? e[3] : 255 } } const jt = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)${"$"}/; const Ht = t => t <= .0031308 ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - .055, ${"$"}t = t => t <= .04045 ? t / 12.92 : Math.pow((t + .055) / 1.055, 2.4); function Yt(t, e, i) { if (t) { let s = Et(t); s[e] = Math.max(0, Math.min(s[e] + s[e] * i, 0 === e ? 360 : 1)), s = It(s), t.r = s[0], t.g = s[1], t.b = s[2] } } function Ut(t, e) { return t ? Object.assign(e || {}, t) : t } function Xt(t) { var e = { r: 0, g: 0, b: 0, a: 255 }; return Array.isArray(t) ? t.length >= 3 && (e = { r: t[0], g: t[1], b: t[2], a: 255 }, t.length > 3 && (e.a = yt(t[3]))) : (e = Ut(t, { r: 0, g: 0, b: 0, a: 1 })).a = yt(e.a), e } function qt(t) { return "r" === t.charAt(0) ? function (t) { const e = jt.exec(t); let i, s, n, o = 255; if (e) { if (e[7] !== i) { const t = +e[7]; o = e[8] ? _t(t) : xt(255 * t, 0, 255) } return i = +e[1], s = +e[3], n = +e[5], i = 255 & (e[2] ? _t(i) : xt(i, 0, 255)), s = 255 & (e[4] ? _t(s) : xt(s, 0, 255)), n = 255 & (e[6] ? _t(n) : xt(n, 0, 255)), { r: i, g: s, b: n, a: o } } }(t) : Ft(t) } class Kt { constructor(t) { if (t instanceof Kt) return t; const e = typeof t; let i; var s, n, o; "object" === e ? i = Xt(t) : "string" === e && (o = (s = t).length, "#" === s[0] && (4 === o || 5 === o ? n = { r: 255 & 17 * Mt[s[1]], g: 255 & 17 * Mt[s[2]], b: 255 & 17 * Mt[s[3]], a: 5 === o ? 17 * Mt[s[4]] : 255 } : 7 !== o && 9 !== o || (n = { r: Mt[s[1]] << 4 | Mt[s[2]], g: Mt[s[3]] << 4 | Mt[s[4]], b: Mt[s[5]] << 4 | Mt[s[6]], a: 9 === o ? Mt[s[7]] << 4 | Mt[s[8]] : 255 })), i = n || Wt(t) || qt(t)), this._rgb = i, this._valid = !!i } get valid() { return this._valid } get rgb() { var t = Ut(this._rgb); return t && (t.a = vt(t.a)), t } set rgb(t) { this._rgb = Xt(t) } rgbString() { return this._valid ? (t = this._rgb) && (t.a < 255 ? `rgba(${"$"}{t.r}, ${"$"}{t.g}, ${"$"}{t.b}, ${"$"}{vt(t.a)})` : `rgb(${"$"}{t.r}, ${"$"}{t.g}, ${"$"}{t.b})`) : void 0; var t } hexString() { return this._valid ? Ot(this._rgb) : void 0 } hslString() { return this._valid ? function (t) { if (!t) return; const e = Et(t), i = e[0], s = wt(e[1]), n = wt(e[2]); return t.a < 255 ? `hsla(${"$"}{i}, ${"$"}{s}%, ${"$"}{n}%, ${"$"}{vt(t.a)})` : `hsl(${"$"}{i}, ${"$"}{s}%, ${"$"}{n}%)` }(this._rgb) : void 0 } mix(t, e) { if (t) { const i = this.rgb, s = t.rgb; let n; const o = e === n ? .5 : e, a = 2 * o - 1, r = i.a - s.a, l = ((a * r == -1 ? a : (a + r) / (1 + a * r)) + 1) / 2; n = 1 - l, i.r = 255 & l * i.r + n * s.r + .5, i.g = 255 & l * i.g + n * s.g + .5, i.b = 255 & l * i.b + n * s.b + .5, i.a = o * i.a + (1 - o) * s.a, this.rgb = i } return this } interpolate(t, e) { return t && (this._rgb = function (t, e, i) { const s = ${"$"}t(vt(t.r)), n = ${"$"}t(vt(t.g)), o = ${"$"}t(vt(t.b)); return { r: yt(Ht(s + i * (${"$"}t(vt(e.r)) - s))), g: yt(Ht(n + i * (${"$"}t(vt(e.g)) - n))), b: yt(Ht(o + i * (${"$"}t(vt(e.b)) - o))), a: t.a + i * (e.a - t.a) } }(this._rgb, t._rgb, e)), this } clone() { return new Kt(this.rgb) } alpha(t) { return this._rgb.a = yt(t), this } clearer(t) { return this._rgb.a *= 1 - t, this } greyscale() { const t = this._rgb, e = bt(.3 * t.r + .59 * t.g + .11 * t.b); return t.r = t.g = t.b = e, this } opaquer(t) { return this._rgb.a *= 1 + t, this } negate() { const t = this._rgb; return t.r = 255 - t.r, t.g = 255 - t.g, t.b = 255 - t.b, this } lighten(t) { return Yt(this._rgb, 2, t), this } darken(t) { return Yt(this._rgb, 2, -t), this } saturate(t) { return Yt(this._rgb, 1, t), this } desaturate(t) { return Yt(this._rgb, 1, -t), this } rotate(t) { return function (t, e) { var i = Et(t); i[0] = zt(i[0] + e), i = It(i), t.r = i[0], t.g = i[1], t.b = i[2] }(this._rgb, t), this } } function Gt(t) { return new Kt(t) } function Zt(t) { if (t && "object" == typeof t) { const e = t.toString(); return "[object CanvasPattern]" === e || "[object CanvasGradient]" === e } return !1 } function Jt(t) { return Zt(t) ? t : Gt(t) } function Qt(t) { return Zt(t) ? t : Gt(t).saturate(.5).darken(.1).hexString() } const te = Object.create(null), ee = Object.create(null); function ie(t, e) { if (!e) return t; const i = e.split("."); for (let e = 0, s = i.length; e < s; ++e) { const s = i[e]; t = t[s] || (t[s] = Object.create(null)) } return t } function se(t, e, i) { return "string" == typeof e ? m(ie(t, e), i) : m(ie(t, ""), e) } var ne = new class { constructor(t) { this.animation = void 0, this.backgroundColor = "rgba(0,0,0,0.1)", this.borderColor = "rgba(0,0,0,0.1)", this.color = "#666", this.datasets = {}, this.devicePixelRatio = t => t.chart.platform.getDevicePixelRatio(), this.elements = {}, this.events = ["mousemove", "mouseout", "click", "touchstart", "touchmove"], this.font = { family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif", size: 12, style: "normal", lineHeight: 1.2, weight: null }, this.hover = {}, this.hoverBackgroundColor = (t, e) => Qt(e.backgroundColor), this.hoverBorderColor = (t, e) => Qt(e.borderColor), this.hoverColor = (t, e) => Qt(e.color), this.indexAxis = "x", this.interaction = { mode: "nearest", intersect: !0, includeInvisible: !1 }, this.maintainAspectRatio = !0, this.onHover = null, this.onClick = null, this.parsing = !0, this.plugins = {}, this.responsive = !0, this.scale = void 0, this.scales = {}, this.showLine = !0, this.drawActiveElementsOnTop = !0, this.describe(t) } set(t, e) { return se(this, t, e) } get(t) { return ie(this, t) } describe(t, e) { return se(ee, t, e) } override(t, e) { return se(te, t, e) } route(t, e, i, s) { const o = ie(this, t), a = ie(this, i), l = "_" + e; Object.defineProperties(o, { [l]: { value: o[e], writable: !0 }, [e]: { enumerable: !0, get() { const t = this[l], e = a[s]; return n(t) ? Object.assign({}, e, t) : r(t, e) }, set(t) { this[l] = t } } }) } }({ _scriptable: t => !t.startsWith("on"), _indexable: t => "events" !== t, hover: { _fallback: "interaction" }, interaction: { _scriptable: !1, _indexable: !1 } }); function oe() { return "undefined" != typeof window && "undefined" != typeof document } function ae(t) { let e = t.parentNode; return e && "[object ShadowRoot]" === e.toString() && (e = e.host), e } function re(t, e, i) { let s; return "string" == typeof t ? (s = parseInt(t, 10), -1 !== t.indexOf("%") && (s = s / 100 * e.parentNode[i])) : s = t, s } const le = t => window.getComputedStyle(t, null); function he(t, e) { return le(t).getPropertyValue(e) } const ce = ["top", "right", "bottom", "left"]; function de(t, e, i) { const s = {}; i = i ? "-" + i : ""; for (let n = 0; n < 4; n++) { const o = ce[n]; s[o] = parseFloat(t[e + "-" + o + i]) || 0 } return s.width = s.left + s.right, s.height = s.top + s.bottom, s } function ue(t, e) { if ("native" in t) return t; const { canvas: i, currentDevicePixelRatio: s } = e, n = le(i), o = "border-box" === n.boxSizing, a = de(n, "padding"), r = de(n, "border", "width"), { x: l, y: h, box: c } = function (t, e) { const i = t.touches, s = i && i.length ? i[0] : t, { offsetX: n, offsetY: o } = s; let a, r, l = !1; if (((t, e, i) => (t > 0 || e > 0) && (!i || !i.shadowRoot))(n, o, t.target)) a = n, r = o; else { const t = e.getBoundingClientRect(); a = s.clientX - t.left, r = s.clientY - t.top, l = !0 } return { x: a, y: r, box: l } }(t, i), d = a.left + (c && r.left), u = a.top + (c && r.top); let { width: f, height: g } = e; return o && (f -= a.width + r.width, g -= a.height + r.height), { x: Math.round((l - d) / f * i.width / s), y: Math.round((h - u) / g * i.height / s) } } const fe = t => Math.round(10 * t) / 10; function ge(t, e, i, s) { const n = le(t), o = de(n, "margin"), a = re(n.maxWidth, t, "clientWidth") || A, r = re(n.maxHeight, t, "clientHeight") || A, l = function (t, e, i) { let s, n; if (void 0 === e || void 0 === i) { const o = ae(t); if (o) { const t = o.getBoundingClientRect(), a = le(o), r = de(a, "border", "width"), l = de(a, "padding"); e = t.width - l.width - r.width, i = t.height - l.height - r.height, s = re(a.maxWidth, o, "clientWidth"), n = re(a.maxHeight, o, "clientHeight") } else e = t.clientWidth, i = t.clientHeight } return { width: e, height: i, maxWidth: s || A, maxHeight: n || A } }(t, e, i); let { width: h, height: c } = l; if ("content-box" === n.boxSizing) { const t = de(n, "border", "width"), e = de(n, "padding"); h -= e.width + t.width, c -= e.height + t.height } return h = Math.max(0, h - o.width), c = Math.max(0, s ? Math.floor(h / s) : c - o.height), h = fe(Math.min(h, a, l.maxWidth)), c = fe(Math.min(c, r, l.maxHeight)), h && !c && (c = fe(h / 2)), { width: h, height: c } } function pe(t, e, i) { const s = e || 1, n = Math.floor(t.height * s), o = Math.floor(t.width * s); t.height = n / s, t.width = o / s; const a = t.canvas; return a.style && (i || !a.style.height && !a.style.width) && (a.style.height = `${"$"}{t.height}px`, a.style.width = `${"$"}{t.width}px`), (t.currentDevicePixelRatio !== s || a.height !== n || a.width !== o) && (t.currentDevicePixelRatio = s, a.height = n, a.width = o, t.ctx.setTransform(s, 0, 0, s, 0, 0), !0) } const me = function () { let t = !1; try { const e = { get passive() { return t = !0, !1 } }; window.addEventListener("test", null, e), window.removeEventListener("test", null, e) } catch (t) { } return t }(); function be(t, e) { const i = he(t, e), s = i && i.match(/^(\d+)(\.\d+)?px${"$"}/); return s ? +s[1] : void 0 } function xe(t) { return !t || i(t.size) || i(t.family) ? null : (t.style ? t.style + " " : "") + (t.weight ? t.weight + " " : "") + t.size + "px " + t.family } function _e(t, e, i, s, n) { let o = e[n]; return o || (o = e[n] = t.measureText(n).width, i.push(n)), o > s && (s = o), s } function ye(t, e, i, n) { let o = (n = n || {}).data = n.data || {}, a = n.garbageCollect = n.garbageCollect || []; n.font !== e && (o = n.data = {}, a = n.garbageCollect = [], n.font = e), t.save(), t.font = e; let r = 0; const l = i.length; let h, c, d, u, f; for (h = 0; h < l; h++)if (u = i[h], null != u && !0 !== s(u)) r = _e(t, o, a, r, u); else if (s(u)) for (c = 0, d = u.length; c < d; c++)f = u[c], null == f || s(f) || (r = _e(t, o, a, r, f)); t.restore(); const g = a.length / 2; if (g > i.length) { for (h = 0; h < g; h++)delete o[a[h]]; a.splice(0, g) } return r } function ve(t, e, i) { const s = t.currentDevicePixelRatio, n = 0 !== i ? Math.max(i / 2, .5) : 0; return Math.round((e - n) * s) / s + n } function we(t, e) { (e = e || t.getContext("2d")).save(), e.resetTransform(), e.clearRect(0, 0, t.width, t.height), e.restore() } function Me(t, e, i, s) { ke(t, e, i, s, null) } function ke(t, e, i, s, n) { let o, a, r, l, h, c; const d = e.pointStyle, u = e.rotation, f = e.radius; let g = (u || 0) * T; if (d && "object" == typeof d && (o = d.toString(), "[object HTMLImageElement]" === o || "[object HTMLCanvasElement]" === o)) return t.save(), t.translate(i, s), t.rotate(g), t.drawImage(d, -d.width / 2, -d.height / 2, d.width, d.height), void t.restore(); if (!(isNaN(f) || f <= 0)) { switch (t.beginPath(), d) { default: n ? t.ellipse(i, s, n / 2, f, 0, 0, O) : t.arc(i, s, f, 0, O), t.closePath(); break; case "triangle": t.moveTo(i + Math.sin(g) * f, s - Math.cos(g) * f), g += R, t.lineTo(i + Math.sin(g) * f, s - Math.cos(g) * f), g += R, t.lineTo(i + Math.sin(g) * f, s - Math.cos(g) * f), t.closePath(); break; case "rectRounded": h = .516 * f, l = f - h, a = Math.cos(g + E) * l, r = Math.sin(g + E) * l, t.arc(i - a, s - r, h, g - D, g - L), t.arc(i + r, s - a, h, g - L, g), t.arc(i + a, s + r, h, g, g + L), t.arc(i - r, s + a, h, g + L, g + D), t.closePath(); break; case "rect": if (!u) { l = Math.SQRT1_2 * f, c = n ? n / 2 : l, t.rect(i - c, s - l, 2 * c, 2 * l); break } g += E; case "rectRot": a = Math.cos(g) * f, r = Math.sin(g) * f, t.moveTo(i - a, s - r), t.lineTo(i + r, s - a), t.lineTo(i + a, s + r), t.lineTo(i - r, s + a), t.closePath(); break; case "crossRot": g += E; case "cross": a = Math.cos(g) * f, r = Math.sin(g) * f, t.moveTo(i - a, s - r), t.lineTo(i + a, s + r), t.moveTo(i + r, s - a), t.lineTo(i - r, s + a); break; case "star": a = Math.cos(g) * f, r = Math.sin(g) * f, t.moveTo(i - a, s - r), t.lineTo(i + a, s + r), t.moveTo(i + r, s - a), t.lineTo(i - r, s + a), g += E, a = Math.cos(g) * f, r = Math.sin(g) * f, t.moveTo(i - a, s - r), t.lineTo(i + a, s + r), t.moveTo(i + r, s - a), t.lineTo(i - r, s + a); break; case "line": a = n ? n / 2 : Math.cos(g) * f, r = Math.sin(g) * f, t.moveTo(i - a, s - r), t.lineTo(i + a, s + r); break; case "dash": t.moveTo(i, s), t.lineTo(i + Math.cos(g) * f, s + Math.sin(g) * f) }t.fill(), e.borderWidth > 0 && t.stroke() } } function Se(t, e, i) { return i = i || .5, !e || t && t.x > e.left - i && t.x < e.right + i && t.y > e.top - i && t.y < e.bottom + i } function Pe(t, e) { t.save(), t.beginPath(), t.rect(e.left, e.top, e.right - e.left, e.bottom - e.top), t.clip() } function De(t) { t.restore() } function Oe(t, e, i, s, n) { if (!e) return t.lineTo(i.x, i.y); if ("middle" === n) { const s = (e.x + i.x) / 2; t.lineTo(s, e.y), t.lineTo(s, i.y) } else "after" === n != !!s ? t.lineTo(e.x, i.y) : t.lineTo(i.x, e.y); t.lineTo(i.x, i.y) } function Ce(t, e, i, s) { if (!e) return t.lineTo(i.x, i.y); t.bezierCurveTo(s ? e.cp1x : e.cp2x, s ? e.cp1y : e.cp2y, s ? i.cp2x : i.cp1x, s ? i.cp2y : i.cp1y, i.x, i.y) } function Ae(t, e, n, o, a, r = {}) { const l = s(e) ? e : [e], h = r.strokeWidth > 0 && "" !== r.strokeColor; let c, d; for (t.save(), t.font = a.string, function (t, e) { e.translation && t.translate(e.translation[0], e.translation[1]); i(e.rotation) || t.rotate(e.rotation); e.color && (t.fillStyle = e.color); e.textAlign && (t.textAlign = e.textAlign); e.textBaseline && (t.textBaseline = e.textBaseline) }(t, r), c = 0; c < l.length; ++c)d = l[c], h && (r.strokeColor && (t.strokeStyle = r.strokeColor), i(r.strokeWidth) || (t.lineWidth = r.strokeWidth), t.strokeText(d, n, o, r.maxWidth)), t.fillText(d, n, o, r.maxWidth), Te(t, n, o, d, r), o += a.lineHeight; t.restore() } function Te(t, e, i, s, n) { if (n.strikethrough || n.underline) { const o = t.measureText(s), a = e - o.actualBoundingBoxLeft, r = e + o.actualBoundingBoxRight, l = i - o.actualBoundingBoxAscent, h = i + o.actualBoundingBoxDescent, c = n.strikethrough ? (l + h) / 2 : h; t.strokeStyle = t.fillStyle, t.beginPath(), t.lineWidth = n.decorationWidth || 2, t.moveTo(a, c), t.lineTo(r, c), t.stroke() } } function Le(t, e) { const { x: i, y: s, w: n, h: o, radius: a } = e; t.arc(i + a.topLeft, s + a.topLeft, a.topLeft, -L, D, !0), t.lineTo(i, s + o - a.bottomLeft), t.arc(i + a.bottomLeft, s + o - a.bottomLeft, a.bottomLeft, D, L, !0), t.lineTo(i + n - a.bottomRight, s + o), t.arc(i + n - a.bottomRight, s + o - a.bottomRight, a.bottomRight, L, 0, !0), t.lineTo(i + n, s + a.topRight), t.arc(i + n - a.topRight, s + a.topRight, a.topRight, 0, -L, !0), t.lineTo(i + a.topLeft, s) } function Ee(t, e = [""], i = t, s, n = (() => t[0])) { M(s) || (s = ${"$"}e("_fallback", t)); const o = { [Symbol.toStringTag]: "Object", _cacheable: !0, _scopes: t, _rootScopes: i, _fallback: s, _getTarget: n, override: n => Ee([n, ...t], e, i, s) }; return new Proxy(o, { deleteProperty: (e, i) => (delete e[i], delete e._keys, delete t[0][i], !0), get: (i, s) => Ve(i, s, (() => function (t, e, i, s) { let n; for (const o of e) if (n = ${"$"}e(ze(o, t), i), M(n)) return Fe(t, n) ? je(i, s, t, n) : n }(s, e, t, i))), getOwnPropertyDescriptor: (t, e) => Reflect.getOwnPropertyDescriptor(t._scopes[0], e), getPrototypeOf: () => Reflect.getPrototypeOf(t[0]), has: (t, e) => Ye(t).includes(e), ownKeys: t => Ye(t), set(t, e, i) { const s = t._storage || (t._storage = n()); return t[e] = s[e] = i, delete t._keys, !0 } }) } function Re(t, e, i, o) { const a = { _cacheable: !1, _proxy: t, _context: e, _subProxy: i, _stack: new Set, _descriptors: Ie(t, o), setContext: e => Re(t, e, i, o), override: s => Re(t.override(s), e, i, o) }; return new Proxy(a, { deleteProperty: (e, i) => (delete e[i], delete t[i], !0), get: (t, e, i) => Ve(t, e, (() => function (t, e, i) { const { _proxy: o, _context: a, _subProxy: r, _descriptors: l } = t; let h = o[e]; k(h) && l.isScriptable(e) && (h = function (t, e, i, s) { const { _proxy: n, _context: o, _subProxy: a, _stack: r } = i; if (r.has(t)) throw new Error("Recursion detected: " + Array.from(r).join("->") + "->" + t); r.add(t), e = e(o, a || s), r.delete(t), Fe(t, e) && (e = je(n._scopes, n, t, e)); return e }(e, h, t, i)); s(h) && h.length && (h = function (t, e, i, s) { const { _proxy: o, _context: a, _subProxy: r, _descriptors: l } = i; if (M(a.index) && s(t)) e = e[a.index % e.length]; else if (n(e[0])) { const i = e, s = o._scopes.filter((t => t !== i)); e = []; for (const n of i) { const i = je(s, o, t, n); e.push(Re(i, a, r && r[t], l)) } } return e }(e, h, t, l.isIndexable)); Fe(e, h) && (h = Re(h, a, r && r[e], l)); return h }(t, e, i))), getOwnPropertyDescriptor: (e, i) => e._descriptors.allKeys ? Reflect.has(t, i) ? { enumerable: !0, configurable: !0 } : void 0 : Reflect.getOwnPropertyDescriptor(t, i), getPrototypeOf: () => Reflect.getPrototypeOf(t), has: (e, i) => Reflect.has(t, i), ownKeys: () => Reflect.ownKeys(t), set: (e, i, s) => (t[i] = s, delete e[i], !0) }) } function Ie(t, e = { scriptable: !0, indexable: !0 }) { const { _scriptable: i = e.scriptable, _indexable: s = e.indexable, _allKeys: n = e.allKeys } = t; return { allKeys: n, scriptable: i, indexable: s, isScriptable: k(i) ? i : () => i, isIndexable: k(s) ? s : () => s } } const ze = (t, e) => t ? t + w(e) : e, Fe = (t, e) => n(e) && "adapters" !== t && (null === Object.getPrototypeOf(e) || e.constructor === Object); function Ve(t, e, i) { if (Object.prototype.hasOwnProperty.call(t, e)) return t[e]; const s = i(); return t[e] = s, s } function Be(t, e, i) { return k(t) ? t(e, i) : t } const Ne = (t, e) => !0 === t ? e : "string" == typeof t ? y(e, t) : void 0; function We(t, e, i, s, n) { for (const o of e) { const e = Ne(i, o); if (e) { t.add(e); const o = Be(e._fallback, i, n); if (M(o) && o !== i && o !== s) return o } else if (!1 === e && M(s) && i !== s) return null } return !1 } function je(t, e, i, o) { const a = e._rootScopes, r = Be(e._fallback, i, o), l = [...t, ...a], h = new Set; h.add(o); let c = He(h, l, i, r || i, o); return null !== c && ((!M(r) || r === i || (c = He(h, l, r, c, o), null !== c)) && Ee(Array.from(h), [""], a, r, (() => function (t, e, i) { const o = t._getTarget(); e in o || (o[e] = {}); const a = o[e]; if (s(a) && n(i)) return i; return a }(e, i, o)))) } function He(t, e, i, s, n) { for (; i;)i = We(t, e, i, s, n); return i } function ${"$"}e(t, e) { for (const i of e) { if (!i) continue; const e = i[t]; if (M(e)) return e } } function Ye(t) { let e = t._keys; return e || (e = t._keys = function (t) { const e = new Set; for (const i of t) for (const t of Object.keys(i).filter((t => !t.startsWith("_")))) e.add(t); return Array.from(e) }(t._scopes)), e } function Ue(t, e, i, s) { const { iScale: n } = t, { key: o = "r" } = this._parsing, a = new Array(s); let r, l, h, c; for (r = 0, l = s; r < l; ++r)h = r + i, c = e[h], a[r] = { r: n.parse(y(c, o), h) }; return a } const Xe = Number.EPSILON || 1e-14, qe = (t, e) => e < t.length && !t[e].skip && t[e], Ke = t => "x" === t ? "y" : "x"; function Ge(t, e, i, s) { const n = t.skip ? e : t, o = e, a = i.skip ? e : i, r = X(o, n), l = X(a, o); let h = r / (r + l), c = l / (r + l); h = isNaN(h) ? 0 : h, c = isNaN(c) ? 0 : c; const d = s * h, u = s * c; return { previous: { x: o.x - d * (a.x - n.x), y: o.y - d * (a.y - n.y) }, next: { x: o.x + u * (a.x - n.x), y: o.y + u * (a.y - n.y) } } } function Ze(t, e = "x") { const i = Ke(e), s = t.length, n = Array(s).fill(0), o = Array(s); let a, r, l, h = qe(t, 0); for (a = 0; a < s; ++a)if (r = l, l = h, h = qe(t, a + 1), l) { if (h) { const t = h[e] - l[e]; n[a] = 0 !== t ? (h[i] - l[i]) / t : 0 } o[a] = r ? h ? z(n[a - 1]) !== z(n[a]) ? 0 : (n[a - 1] + n[a]) / 2 : n[a - 1] : n[a] } !function (t, e, i) { const s = t.length; let n, o, a, r, l, h = qe(t, 0); for (let c = 0; c < s - 1; ++c)l = h, h = qe(t, c + 1), l && h && (N(e[c], 0, Xe) ? i[c] = i[c + 1] = 0 : (n = i[c] / e[c], o = i[c + 1] / e[c], r = Math.pow(n, 2) + Math.pow(o, 2), r <= 9 || (a = 3 / Math.sqrt(r), i[c] = n * a * e[c], i[c + 1] = o * a * e[c]))) }(t, n, o), function (t, e, i = "x") { const s = Ke(i), n = t.length; let o, a, r, l = qe(t, 0); for (let h = 0; h < n; ++h) { if (a = r, r = l, l = qe(t, h + 1), !r) continue; const n = r[i], c = r[s]; a && (o = (n - a[i]) / 3, r[`cp1${"$"}{i}`] = n - o, r[`cp1${"$"}{s}`] = c - o * e[h]), l && (o = (l[i] - n) / 3, r[`cp2${"$"}{i}`] = n + o, r[`cp2${"$"}{s}`] = c + o * e[h]) } }(t, o, e) } function Je(t, e, i) { return Math.max(Math.min(t, i), e) } function Qe(t, e, i, s, n) { let o, a, r, l; if (e.spanGaps && (t = t.filter((t => !t.skip))), "monotone" === e.cubicInterpolationMode) Ze(t, n); else { let i = s ? t[t.length - 1] : t[0]; for (o = 0, a = t.length; o < a; ++o)r = t[o], l = Ge(i, r, t[Math.min(o + 1, a - (s ? 0 : 1)) % a], e.tension), r.cp1x = l.previous.x, r.cp1y = l.previous.y, r.cp2x = l.next.x, r.cp2y = l.next.y, i = r } e.capBezierPoints && function (t, e) { let i, s, n, o, a, r = Se(t[0], e); for (i = 0, s = t.length; i < s; ++i)a = o, o = r, r = i < s - 1 && Se(t[i + 1], e), o && (n = t[i], a && (n.cp1x = Je(n.cp1x, e.left, e.right), n.cp1y = Je(n.cp1y, e.top, e.bottom)), r && (n.cp2x = Je(n.cp2x, e.left, e.right), n.cp2y = Je(n.cp2y, e.top, e.bottom))) }(t, i) } const ti = t => 0 === t || 1 === t, ei = (t, e, i) => -Math.pow(2, 10 * (t -= 1)) * Math.sin((t - e) * O / i), ii = (t, e, i) => Math.pow(2, -10 * t) * Math.sin((t - e) * O / i) + 1, si = { linear: t => t, easeInQuad: t => t * t, easeOutQuad: t => -t * (t - 2), easeInOutQuad: t => (t /= .5) < 1 ? .5 * t * t : -.5 * (--t * (t - 2) - 1), easeInCubic: t => t * t * t, easeOutCubic: t => (t -= 1) * t * t + 1, easeInOutCubic: t => (t /= .5) < 1 ? .5 * t * t * t : .5 * ((t -= 2) * t * t + 2), easeInQuart: t => t * t * t * t, easeOutQuart: t => -((t -= 1) * t * t * t - 1), easeInOutQuart: t => (t /= .5) < 1 ? .5 * t * t * t * t : -.5 * ((t -= 2) * t * t * t - 2), easeInQuint: t => t * t * t * t * t, easeOutQuint: t => (t -= 1) * t * t * t * t + 1, easeInOutQuint: t => (t /= .5) < 1 ? .5 * t * t * t * t * t : .5 * ((t -= 2) * t * t * t * t + 2), easeInSine: t => 1 - Math.cos(t * L), easeOutSine: t => Math.sin(t * L), easeInOutSine: t => -.5 * (Math.cos(D * t) - 1), easeInExpo: t => 0 === t ? 0 : Math.pow(2, 10 * (t - 1)), easeOutExpo: t => 1 === t ? 1 : 1 - Math.pow(2, -10 * t), easeInOutExpo: t => ti(t) ? t : t < .5 ? .5 * Math.pow(2, 10 * (2 * t - 1)) : .5 * (2 - Math.pow(2, -10 * (2 * t - 1))), easeInCirc: t => t >= 1 ? t : -(Math.sqrt(1 - t * t) - 1), easeOutCirc: t => Math.sqrt(1 - (t -= 1) * t), easeInOutCirc: t => (t /= .5) < 1 ? -.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1), easeInElastic: t => ti(t) ? t : ei(t, .075, .3), easeOutElastic: t => ti(t) ? t : ii(t, .075, .3), easeInOutElastic(t) { const e = .1125; return ti(t) ? t : t < .5 ? .5 * ei(2 * t, e, .45) : .5 + .5 * ii(2 * t - 1, e, .45) }, easeInBack(t) { const e = 1.70158; return t * t * ((e + 1) * t - e) }, easeOutBack(t) { const e = 1.70158; return (t -= 1) * t * ((e + 1) * t + e) + 1 }, easeInOutBack(t) { let e = 1.70158; return (t /= .5) < 1 ? t * t * ((1 + (e *= 1.525)) * t - e) * .5 : .5 * ((t -= 2) * t * ((1 + (e *= 1.525)) * t + e) + 2) }, easeInBounce: t => 1 - si.easeOutBounce(1 - t), easeOutBounce(t) { const e = 7.5625, i = 2.75; return t < 1 / i ? e * t * t : t < 2 / i ? e * (t -= 1.5 / i) * t + .75 : t < 2.5 / i ? e * (t -= 2.25 / i) * t + .9375 : e * (t -= 2.625 / i) * t + .984375 }, easeInOutBounce: t => t < .5 ? .5 * si.easeInBounce(2 * t) : .5 * si.easeOutBounce(2 * t - 1) + .5 }; function ni(t, e, i, s) { return { x: t.x + i * (e.x - t.x), y: t.y + i * (e.y - t.y) } } function oi(t, e, i, s) { return { x: t.x + i * (e.x - t.x), y: "middle" === s ? i < .5 ? t.y : e.y : "after" === s ? i < 1 ? t.y : e.y : i > 0 ? e.y : t.y } } function ai(t, e, i, s) { const n = { x: t.cp2x, y: t.cp2y }, o = { x: e.cp1x, y: e.cp1y }, a = ni(t, n, i), r = ni(n, o, i), l = ni(o, e, i), h = ni(a, r, i), c = ni(r, l, i); return ni(h, c, i) } const ri = new Map; function li(t, e, i) { return function (t, e) { e = e || {}; const i = t + JSON.stringify(e); let s = ri.get(i); return s || (s = new Intl.NumberFormat(t, e), ri.set(i, s)), s }(e, i).format(t) } const hi = new RegExp(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)${"$"}/), ci = new RegExp(/^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))${"$"}/); function di(t, e) { const i = ("" + t).match(hi); if (!i || "normal" === i[1]) return 1.2 * e; switch (t = +i[2], i[3]) { case "px": return t; case "%": t /= 100 }return e * t } function ui(t, e) { const i = {}, s = n(e), o = s ? Object.keys(e) : e, a = n(t) ? s ? i => r(t[i], t[e[i]]) : e => t[e] : () => t; for (const t of o) i[t] = +a(t) || 0; return i } function fi(t) { return ui(t, { top: "y", right: "x", bottom: "y", left: "x" }) } function gi(t) { return ui(t, ["topLeft", "topRight", "bottomLeft", "bottomRight"]) } function pi(t) { const e = fi(t); return e.width = e.left + e.right, e.height = e.top + e.bottom, e } function mi(t, e) { t = t || {}, e = e || ne.font; let i = r(t.size, e.size); "string" == typeof i && (i = parseInt(i, 10)); let s = r(t.style, e.style); s && !("" + s).match(ci) && (console.warn('Invalid font style specified: "' + s + '"'), s = ""); const n = { family: r(t.family, e.family), lineHeight: di(r(t.lineHeight, e.lineHeight), i), size: i, style: s, weight: r(t.weight, e.weight), string: "" }; return n.string = xe(n), n } function bi(t, e, i, n) { let o, a, r, l = !0; for (o = 0, a = t.length; o < a; ++o)if (r = t[o], void 0 !== r && (void 0 !== e && "function" == typeof r && (r = r(e), l = !1), void 0 !== i && s(r) && (r = r[i % r.length], l = !1), void 0 !== r)) return n && !l && (n.cacheable = !1), r } function xi(t, e, i) { const { min: s, max: n } = t, o = h(e, (n - s) / 2), a = (t, e) => i && 0 === t ? 0 : t + e; return { min: a(s, -Math.abs(o)), max: a(n, o) } } function _i(t, e) { return Object.assign(Object.create(t), e) } function yi(t, e, i) { return t ? function (t, e) { return { x: i => t + t + e - i, setWidth(t) { e = t }, textAlign: t => "center" === t ? t : "right" === t ? "left" : "right", xPlus: (t, e) => t - e, leftForLtr: (t, e) => t - e } }(e, i) : { x: t => t, setWidth(t) { }, textAlign: t => t, xPlus: (t, e) => t + e, leftForLtr: (t, e) => t } } function vi(t, e) { let i, s; "ltr" !== e && "rtl" !== e || (i = t.canvas.style, s = [i.getPropertyValue("direction"), i.getPropertyPriority("direction")], i.setProperty("direction", e, "important"), t.prevTextDirection = s) } function wi(t, e) { void 0 !== e && (delete t.prevTextDirection, t.canvas.style.setProperty("direction", e[0], e[1])) } function Mi(t) { return "angle" === t ? { between: G, compare: q, normalize: K } : { between: Q, compare: (t, e) => t - e, normalize: t => t } } function ki({ start: t, end: e, count: i, loop: s, style: n }) { return { start: t % i, end: e % i, loop: s && (e - t + 1) % i == 0, style: n } } function Si(t, e, i) { if (!i) return [t]; const { property: s, start: n, end: o } = i, a = e.length, { compare: r, between: l, normalize: h } = Mi(s), { start: c, end: d, loop: u, style: f } = function (t, e, i) { const { property: s, start: n, end: o } = i, { between: a, normalize: r } = Mi(s), l = e.length; let h, c, { start: d, end: u, loop: f } = t; if (f) { for (d += l, u += l, h = 0, c = l; h < c && a(r(e[d % l][s]), n, o); ++h)d--, u--; d %= l, u %= l } return u < d && (u += l), { start: d, end: u, loop: f, style: t.style } }(t, e, i), g = []; let p, m, b, x = !1, _ = null; const y = () => x || l(n, b, p) && 0 !== r(n, b), v = () => !x || 0 === r(o, p) || l(o, b, p); for (let t = c, i = c; t <= d; ++t)m = e[t % a], m.skip || (p = h(m[s]), p !== b && (x = l(p, n, o), null === _ && y() && (_ = 0 === r(p, n) ? t : i), null !== _ && v() && (g.push(ki({ start: _, end: t, loop: u, count: a, style: f })), _ = null), i = t, b = p)); return null !== _ && g.push(ki({ start: _, end: d, loop: u, count: a, style: f })), g } function Pi(t, e) { const i = [], s = t.segments; for (let n = 0; n < s.length; n++) { const o = Si(s[n], t.points, e); o.length && i.push(...o) } return i } function Di(t, e) { const i = t.points, s = t.options.spanGaps, n = i.length; if (!n) return []; const o = !!t._loop, { start: a, end: r } = function (t, e, i, s) { let n = 0, o = e - 1; if (i && !s) for (; n < e && !t[n].skip;)n++; for (; n < e && t[n].skip;)n++; for (n %= e, i && (o += n); o > n && t[o % e].skip;)o--; return o %= e, { start: n, end: o } }(i, n, o, s); if (!0 === s) return Oi(t, [{ start: a, end: r, loop: o }], i, e); return Oi(t, function (t, e, i, s) { const n = t.length, o = []; let a, r = e, l = t[e]; for (a = e + 1; a <= i; ++a) { const i = t[a % n]; i.skip || i.stop ? l.skip || (s = !1, o.push({ start: e % n, end: (a - 1) % n, loop: s }), e = r = i.stop ? a : null) : (r = a, l.skip && (e = a)), l = i } return null !== r && o.push({ start: e % n, end: r % n, loop: s }), o }(i, a, r < a ? r + n : r, !!t._fullLoop && 0 === a && r === n - 1), i, e) } function Oi(t, e, i, s) { return s && s.setContext && i ? function (t, e, i, s) { const n = t._chart.getContext(), o = Ci(t.options), { _datasetIndex: a, options: { spanGaps: r } } = t, l = i.length, h = []; let c = o, d = e[0].start, u = d; function f(t, e, s, n) { const o = r ? -1 : 1; if (t !== e) { for (t += l; i[t % l].skip;)t -= o; for (; i[e % l].skip;)e += o; t % l != e % l && (h.push({ start: t % l, end: e % l, loop: s, style: n }), c = n, d = e % l) } } for (const t of e) { d = r ? d : t.start; let e, o = i[d % l]; for (u = d + 1; u <= t.end; u++) { const r = i[u % l]; e = Ci(s.setContext(_i(n, { type: "segment", p0: o, p1: r, p0DataIndex: (u - 1) % l, p1DataIndex: u % l, datasetIndex: a }))), Ai(e, c) && f(d, u - 1, t.loop, c), o = r, c = e } d < u - 1 && f(d, u - 1, t.loop, c) } return h }(t, e, i, s) : e } function Ci(t) { return { backgroundColor: t.backgroundColor, borderCapStyle: t.borderCapStyle, borderDash: t.borderDash, borderDashOffset: t.borderDashOffset, borderJoinStyle: t.borderJoinStyle, borderWidth: t.borderWidth, borderColor: t.borderColor } } function Ai(t, e) { return e && JSON.stringify(t) !== JSON.stringify(e) } var Ti = Object.freeze({ __proto__: null, easingEffects: si, isPatternOrGradient: Zt, color: Jt, getHoverColor: Qt, noop: t, uid: e, isNullOrUndef: i, isArray: s, isObject: n, isFinite: o, finiteOrDefault: a, valueOrDefault: r, toPercentage: l, toDimension: h, callback: c, each: d, _elementsEqual: u, clone: f, _merger: p, merge: m, mergeIf: b, _mergerIf: x, _deprecated: function (t, e, i, s) { void 0 !== e && console.warn(t + ': "' + i + '" is deprecated. Please use "' + s + '" instead') }, resolveObjectKey: y, _splitKey: v, _capitalize: w, defined: M, isFunction: k, setsEqual: S, _isClickEvent: P, toFontString: xe, _measureText: _e, _longestText: ye, _alignPixel: ve, clearCanvas: we, drawPoint: Me, drawPointLegend: ke, _isPointInArea: Se, clipArea: Pe, unclipArea: De, _steppedLineTo: Oe, _bezierCurveTo: Ce, renderText: Ae, addRoundedRectPath: Le, _lookup: tt, _lookupByKey: et, _rlookupByKey: it, _filterBetween: st, listenArrayEvents: ot, unlistenArrayEvents: at, _arrayUnique: rt, _createResolver: Ee, _attachContext: Re, _descriptors: Ie, _parseObjectDataRadialScale: Ue, splineCurve: Ge, splineCurveMonotone: Ze, _updateBezierControlPoints: Qe, _isDomSupported: oe, _getParentNode: ae, getStyle: he, getRelativePosition: ue, getMaximumSize: ge, retinaScale: pe, supportsEventListenerOptions: me, readUsedSize: be, fontString: function (t, e, i) { return e + " " + t + "px " + i }, requestAnimFrame: lt, throttled: ht, debounce: ct, _toLeftRightCenter: dt, _alignStartEnd: ut, _textX: ft, _getStartAndCountOfVisiblePoints: gt, _scaleRangesChanged: pt, _pointInLine: ni, _steppedInterpolation: oi, _bezierInterpolation: ai, formatNumber: li, toLineHeight: di, _readValueToProps: ui, toTRBL: fi, toTRBLCorners: gi, toPadding: pi, toFont: mi, resolve: bi, _addGrace: xi, createContext: _i, PI: D, TAU: O, PITAU: C, INFINITY: A, RAD_PER_DEG: T, HALF_PI: L, QUARTER_PI: E, TWO_THIRDS_PI: R, log10: I, sign: z, niceNum: F, _factorize: V, isNumber: B, almostEquals: N, almostWhole: W, _setMinAndMaxByKey: j, toRadians: H, toDegrees: ${"$"}, _decimalPlaces: Y, getAngleFromPoint: U, distanceBetweenPoints: X, _angleDiff: q, _normalizeAngle: K, _angleBetween: G, _limitValue: Z, _int16Range: J, _isBetween: Q, getRtlAdapter: yi, overrideTextDirection: vi, restoreTextDirection: wi, _boundSegment: Si, _boundSegments: Pi, _computeSegments: Di }); function Li(t, e, i, s) { const { controller: n, data: o, _sorted: a } = t, r = n._cachedMeta.iScale; if (r && e === r.axis && "r" !== e && a && o.length) { const t = r._reversePixels ? it : et; if (!s) return t(o, e, i); if (n._sharedOptions) { const s = o[0], n = "function" == typeof s.getRange && s.getRange(e); if (n) { const s = t(o, e, i - n), a = t(o, e, i + n); return { lo: s.lo, hi: a.hi } } } } return { lo: 0, hi: o.length - 1 } } function Ei(t, e, i, s, n) { const o = t.getSortedVisibleDatasetMetas(), a = i[e]; for (let t = 0, i = o.length; t < i; ++t) { const { index: i, data: r } = o[t], { lo: l, hi: h } = Li(o[t], e, a, n); for (let t = l; t <= h; ++t) { const e = r[t]; e.skip || s(e, i, t) } } } function Ri(t, e, i, s, n) { const o = []; if (!n && !t.isPointInArea(e)) return o; return Ei(t, i, e, (function (i, a, r) { (n || Se(i, t.chartArea, 0)) && i.inRange(e.x, e.y, s) && o.push({ element: i, datasetIndex: a, index: r }) }), !0), o } function Ii(t, e, i, s, n, o) { let a = []; const r = function (t) { const e = -1 !== t.indexOf("x"), i = -1 !== t.indexOf("y"); return function (t, s) { const n = e ? Math.abs(t.x - s.x) : 0, o = i ? Math.abs(t.y - s.y) : 0; return Math.sqrt(Math.pow(n, 2) + Math.pow(o, 2)) } }(i); let l = Number.POSITIVE_INFINITY; return Ei(t, i, e, (function (i, h, c) { const d = i.inRange(e.x, e.y, n); if (s && !d) return; const u = i.getCenterPoint(n); if (!(!!o || t.isPointInArea(u)) && !d) return; const f = r(e, u); f < l ? (a = [{ element: i, datasetIndex: h, index: c }], l = f) : f === l && a.push({ element: i, datasetIndex: h, index: c }) })), a } function zi(t, e, i, s, n, o) { return o || t.isPointInArea(e) ? "r" !== i || s ? Ii(t, e, i, s, n, o) : function (t, e, i, s) { let n = []; return Ei(t, i, e, (function (t, i, o) { const { startAngle: a, endAngle: r } = t.getProps(["startAngle", "endAngle"], s), { angle: l } = U(t, { x: e.x, y: e.y }); G(l, a, r) && n.push({ element: t, datasetIndex: i, index: o }) })), n }(t, e, i, n) : [] } function Fi(t, e, i, s, n) { const o = [], a = "x" === i ? "inXRange" : "inYRange"; let r = !1; return Ei(t, i, e, ((t, s, l) => { t[a](e[i], n) && (o.push({ element: t, datasetIndex: s, index: l }), r = r || t.inRange(e.x, e.y, n)) })), s && !r ? [] : o } var Vi = { evaluateInteractionItems: Ei, modes: { index(t, e, i, s) { const n = ue(e, t), o = i.axis || "x", a = i.includeInvisible || !1, r = i.intersect ? Ri(t, n, o, s, a) : zi(t, n, o, !1, s, a), l = []; return r.length ? (t.getSortedVisibleDatasetMetas().forEach((t => { const e = r[0].index, i = t.data[e]; i && !i.skip && l.push({ element: i, datasetIndex: t.index, index: e }) })), l) : [] }, dataset(t, e, i, s) { const n = ue(e, t), o = i.axis || "xy", a = i.includeInvisible || !1; let r = i.intersect ? Ri(t, n, o, s, a) : zi(t, n, o, !1, s, a); if (r.length > 0) { const e = r[0].datasetIndex, i = t.getDatasetMeta(e).data; r = []; for (let t = 0; t < i.length; ++t)r.push({ element: i[t], datasetIndex: e, index: t }) } return r }, point: (t, e, i, s) => Ri(t, ue(e, t), i.axis || "xy", s, i.includeInvisible || !1), nearest(t, e, i, s) { const n = ue(e, t), o = i.axis || "xy", a = i.includeInvisible || !1; return zi(t, n, o, i.intersect, s, a) }, x: (t, e, i, s) => Fi(t, ue(e, t), "x", i.intersect, s), y: (t, e, i, s) => Fi(t, ue(e, t), "y", i.intersect, s) } }; const Bi = ["left", "top", "right", "bottom"]; function Ni(t, e) { return t.filter((t => t.pos === e)) } function Wi(t, e) { return t.filter((t => -1 === Bi.indexOf(t.pos) && t.box.axis === e)) } function ji(t, e) { return t.sort(((t, i) => { const s = e ? i : t, n = e ? t : i; return s.weight === n.weight ? s.index - n.index : s.weight - n.weight })) } function Hi(t, e) { const i = function (t) { const e = {}; for (const i of t) { const { stack: t, pos: s, stackWeight: n } = i; if (!t || !Bi.includes(s)) continue; const o = e[t] || (e[t] = { count: 0, placed: 0, weight: 0, size: 0 }); o.count++, o.weight += n } return e }(t), { vBoxMaxWidth: s, hBoxMaxHeight: n } = e; let o, a, r; for (o = 0, a = t.length; o < a; ++o) { r = t[o]; const { fullSize: a } = r.box, l = i[r.stack], h = l && r.stackWeight / l.weight; r.horizontal ? (r.width = h ? h * s : a && e.availableWidth, r.height = n) : (r.width = s, r.height = h ? h * n : a && e.availableHeight) } return i } function ${"$"}i(t, e, i, s) { return Math.max(t[i], e[i]) + Math.max(t[s], e[s]) } function Yi(t, e) { t.top = Math.max(t.top, e.top), t.left = Math.max(t.left, e.left), t.bottom = Math.max(t.bottom, e.bottom), t.right = Math.max(t.right, e.right) } function Ui(t, e, i, s) { const { pos: o, box: a } = i, r = t.maxPadding; if (!n(o)) { i.size && (t[o] -= i.size); const e = s[i.stack] || { size: 0, count: 1 }; e.size = Math.max(e.size, i.horizontal ? a.height : a.width), i.size = e.size / e.count, t[o] += i.size } a.getPadding && Yi(r, a.getPadding()); const l = Math.max(0, e.outerWidth - ${"$"}i(r, t, "left", "right")), h = Math.max(0, e.outerHeight - ${"$"}i(r, t, "top", "bottom")), c = l !== t.w, d = h !== t.h; return t.w = l, t.h = h, i.horizontal ? { same: c, other: d } : { same: d, other: c } } function Xi(t, e) { const i = e.maxPadding; function s(t) { const s = { left: 0, top: 0, right: 0, bottom: 0 }; return t.forEach((t => { s[t] = Math.max(e[t], i[t]) })), s } return s(t ? ["left", "right"] : ["top", "bottom"]) } function qi(t, e, i, s) { const n = []; let o, a, r, l, h, c; for (o = 0, a = t.length, h = 0; o < a; ++o) { r = t[o], l = r.box, l.update(r.width || e.w, r.height || e.h, Xi(r.horizontal, e)); const { same: a, other: d } = Ui(e, i, r, s); h |= a && n.length, c = c || d, l.fullSize || n.push(r) } return h && qi(n, e, i, s) || c } function Ki(t, e, i, s, n) { t.top = i, t.left = e, t.right = e + s, t.bottom = i + n, t.width = s, t.height = n } function Gi(t, e, i, s) { const n = i.padding; let { x: o, y: a } = e; for (const r of t) { const t = r.box, l = s[r.stack] || { count: 1, placed: 0, weight: 1 }, h = r.stackWeight / l.weight || 1; if (r.horizontal) { const s = e.w * h, o = l.size || t.height; M(l.start) && (a = l.start), t.fullSize ? Ki(t, n.left, a, i.outerWidth - n.right - n.left, o) : Ki(t, e.left + l.placed, a, s, o), l.start = a, l.placed += s, a = t.bottom } else { const s = e.h * h, a = l.size || t.width; M(l.start) && (o = l.start), t.fullSize ? Ki(t, o, n.top, a, i.outerHeight - n.bottom - n.top) : Ki(t, o, e.top + l.placed, a, s), l.start = o, l.placed += s, o = t.right } } e.x = o, e.y = a } ne.set("layout", { autoPadding: !0, padding: { top: 0, right: 0, bottom: 0, left: 0 } }); var Zi = { addBox(t, e) { t.boxes || (t.boxes = []), e.fullSize = e.fullSize || !1, e.position = e.position || "top", e.weight = e.weight || 0, e._layers = e._layers || function () { return [{ z: 0, draw(t) { e.draw(t) } }] }, t.boxes.push(e) }, removeBox(t, e) { const i = t.boxes ? t.boxes.indexOf(e) : -1; -1 !== i && t.boxes.splice(i, 1) }, configure(t, e, i) { e.fullSize = i.fullSize, e.position = i.position, e.weight = i.weight }, update(t, e, i, s) { if (!t) return; const n = pi(t.options.layout.padding), o = Math.max(e - n.width, 0), a = Math.max(i - n.height, 0), r = function (t) { const e = function (t) { const e = []; let i, s, n, o, a, r; for (i = 0, s = (t || []).length; i < s; ++i)n = t[i], ({ position: o, options: { stack: a, stackWeight: r = 1 } } = n), e.push({ index: i, box: n, pos: o, horizontal: n.isHorizontal(), weight: n.weight, stack: a && o + a, stackWeight: r }); return e }(t), i = ji(e.filter((t => t.box.fullSize)), !0), s = ji(Ni(e, "left"), !0), n = ji(Ni(e, "right")), o = ji(Ni(e, "top"), !0), a = ji(Ni(e, "bottom")), r = Wi(e, "x"), l = Wi(e, "y"); return { fullSize: i, leftAndTop: s.concat(o), rightAndBottom: n.concat(l).concat(a).concat(r), chartArea: Ni(e, "chartArea"), vertical: s.concat(n).concat(l), horizontal: o.concat(a).concat(r) } }(t.boxes), l = r.vertical, h = r.horizontal; d(t.boxes, (t => { "function" == typeof t.beforeLayout && t.beforeLayout() })); const c = l.reduce(((t, e) => e.box.options && !1 === e.box.options.display ? t : t + 1), 0) || 1, u = Object.freeze({ outerWidth: e, outerHeight: i, padding: n, availableWidth: o, availableHeight: a, vBoxMaxWidth: o / 2 / c, hBoxMaxHeight: a / 2 }), f = Object.assign({}, n); Yi(f, pi(s)); const g = Object.assign({ maxPadding: f, w: o, h: a, x: n.left, y: n.top }, n), p = Hi(l.concat(h), u); qi(r.fullSize, g, u, p), qi(l, g, u, p), qi(h, g, u, p) && qi(l, g, u, p), function (t) { const e = t.maxPadding; function i(i) { const s = Math.max(e[i] - t[i], 0); return t[i] += s, s } t.y += i("top"), t.x += i("left"), i("right"), i("bottom") }(g), Gi(r.leftAndTop, g, u, p), g.x += g.w, g.y += g.h, Gi(r.rightAndBottom, g, u, p), t.chartArea = { left: g.left, top: g.top, right: g.left + g.w, bottom: g.top + g.h, height: g.h, width: g.w }, d(r.chartArea, (e => { const i = e.box; Object.assign(i, t.chartArea), i.update(g.w, g.h, { left: 0, top: 0, right: 0, bottom: 0 }) })) } }; class Ji { acquireContext(t, e) { } releaseContext(t) { return !1 } addEventListener(t, e, i) { } removeEventListener(t, e, i) { } getDevicePixelRatio() { return 1 } getMaximumSize(t, e, i, s) { return e = Math.max(0, e || t.width), i = i || t.height, { width: e, height: Math.max(0, s ? Math.floor(e / s) : i) } } isAttached(t) { return !0 } updateConfig(t) { } } class Qi extends Ji { acquireContext(t) { return t && t.getContext && t.getContext("2d") || null } updateConfig(t) { t.options.animation = !1 } } const ts = { touchstart: "mousedown", touchmove: "mousemove", touchend: "mouseup", pointerenter: "mouseenter", pointerdown: "mousedown", pointermove: "mousemove", pointerup: "mouseup", pointerleave: "mouseout", pointerout: "mouseout" }, es = t => null === t || "" === t; const is = !!me && { passive: !0 }; function ss(t, e, i) { t.canvas.removeEventListener(e, i, is) } function ns(t, e) { for (const i of t) if (i === e || i.contains(e)) return !0 } function os(t, e, i) { const s = t.canvas, n = new MutationObserver((t => { let e = !1; for (const i of t) e = e || ns(i.addedNodes, s), e = e && !ns(i.removedNodes, s); e && i() })); return n.observe(document, { childList: !0, subtree: !0 }), n } function as(t, e, i) { const s = t.canvas, n = new MutationObserver((t => { let e = !1; for (const i of t) e = e || ns(i.removedNodes, s), e = e && !ns(i.addedNodes, s); e && i() })); return n.observe(document, { childList: !0, subtree: !0 }), n } const rs = new Map; let ls = 0; function hs() { const t = window.devicePixelRatio; t !== ls && (ls = t, rs.forEach(((e, i) => { i.currentDevicePixelRatio !== t && e() }))) } function cs(t, e, i) { const s = t.canvas, n = s && ae(s); if (!n) return; const o = ht(((t, e) => { const s = n.clientWidth; i(t, e), s < n.clientWidth && i() }), window), a = new ResizeObserver((t => { const e = t[0], i = e.contentRect.width, s = e.contentRect.height; 0 === i && 0 === s || o(i, s) })); return a.observe(n), function (t, e) { rs.size || window.addEventListener("resize", hs), rs.set(t, e) }(t, o), a } function ds(t, e, i) { i && i.disconnect(), "resize" === e && function (t) { rs.delete(t), rs.size || window.removeEventListener("resize", hs) }(t) } function us(t, e, i) { const s = t.canvas, n = ht((e => { null !== t.ctx && i(function (t, e) { const i = ts[t.type] || t.type, { x: s, y: n } = ue(t, e); return { type: i, chart: e, native: t, x: void 0 !== s ? s : null, y: void 0 !== n ? n : null } }(e, t)) }), t, (t => { const e = t[0]; return [e, e.offsetX, e.offsetY] })); return function (t, e, i) { t.addEventListener(e, i, is) }(s, e, n), n } class fs extends Ji { acquireContext(t, e) { const i = t && t.getContext && t.getContext("2d"); return i && i.canvas === t ? (function (t, e) { const i = t.style, s = t.getAttribute("height"), n = t.getAttribute("width"); if (t.${"$"}chartjs = { initial: { height: s, width: n, style: { display: i.display, height: i.height, width: i.width } } }, i.display = i.display || "block", i.boxSizing = i.boxSizing || "border-box", es(n)) { const e = be(t, "width"); void 0 !== e && (t.width = e) } if (es(s)) if ("" === t.style.height) t.height = t.width / (e || 2); else { const e = be(t, "height"); void 0 !== e && (t.height = e) } }(t, e), i) : null } releaseContext(t) { const e = t.canvas; if (!e.${"$"}chartjs) return !1; const s = e.${"$"}chartjs.initial;["height", "width"].forEach((t => { const n = s[t]; i(n) ? e.removeAttribute(t) : e.setAttribute(t, n) })); const n = s.style || {}; return Object.keys(n).forEach((t => { e.style[t] = n[t] })), e.width = e.width, delete e.${"$"}chartjs, !0 } addEventListener(t, e, i) { this.removeEventListener(t, e); const s = t.${"$"}proxies || (t.${"$"}proxies = {}), n = { attach: os, detach: as, resize: cs }[e] || us; s[e] = n(t, e, i) } removeEventListener(t, e) { const i = t.${"$"}proxies || (t.${"$"}proxies = {}), s = i[e]; if (!s) return; ({ attach: ds, detach: ds, resize: ds }[e] || ss)(t, e, s), i[e] = void 0 } getDevicePixelRatio() { return window.devicePixelRatio } getMaximumSize(t, e, i, s) { return ge(t, e, i, s) } isAttached(t) { const e = ae(t); return !(!e || !e.isConnected) } } function gs(t) { return !oe() || "undefined" != typeof OffscreenCanvas && t instanceof OffscreenCanvas ? Qi : fs } var ps = Object.freeze({ __proto__: null, _detectPlatform: gs, BasePlatform: Ji, BasicPlatform: Qi, DomPlatform: fs }); const ms = "transparent", bs = { boolean: (t, e, i) => i > .5 ? e : t, color(t, e, i) { const s = Jt(t || ms), n = s.valid && Jt(e || ms); return n && n.valid ? n.mix(s, i).hexString() : e }, number: (t, e, i) => t + (e - t) * i }; class xs { constructor(t, e, i, s) { const n = e[i]; s = bi([t.to, s, n, t.from]); const o = bi([t.from, n, s]); this._active = !0, this._fn = t.fn || bs[t.type || typeof o], this._easing = si[t.easing] || si.linear, this._start = Math.floor(Date.now() + (t.delay || 0)), this._duration = this._total = Math.floor(t.duration), this._loop = !!t.loop, this._target = e, this._prop = i, this._from = o, this._to = s, this._promises = void 0 } active() { return this._active } update(t, e, i) { if (this._active) { this._notify(!1); const s = this._target[this._prop], n = i - this._start, o = this._duration - n; this._start = i, this._duration = Math.floor(Math.max(o, t.duration)), this._total += n, this._loop = !!t.loop, this._to = bi([t.to, e, s, t.from]), this._from = bi([t.from, s, e]) } } cancel() { this._active && (this.tick(Date.now()), this._active = !1, this._notify(!1)) } tick(t) { const e = t - this._start, i = this._duration, s = this._prop, n = this._from, o = this._loop, a = this._to; let r; if (this._active = n !== a && (o || e < i), !this._active) return this._target[s] = a, void this._notify(!0); e < 0 ? this._target[s] = n : (r = e / i % 2, r = o && r > 1 ? 2 - r : r, r = this._easing(Math.min(1, Math.max(0, r))), this._target[s] = this._fn(n, a, r)) } wait() { const t = this._promises || (this._promises = []); return new Promise(((e, i) => { t.push({ res: e, rej: i }) })) } _notify(t) { const e = t ? "res" : "rej", i = this._promises || []; for (let t = 0; t < i.length; t++)i[t][e]() } } ne.set("animation", { delay: void 0, duration: 1e3, easing: "easeOutQuart", fn: void 0, from: void 0, loop: void 0, to: void 0, type: void 0 }); const _s = Object.keys(ne.animation); ne.describe("animation", { _fallback: !1, _indexable: !1, _scriptable: t => "onProgress" !== t && "onComplete" !== t && "fn" !== t }), ne.set("animations", { colors: { type: "color", properties: ["color", "borderColor", "backgroundColor"] }, numbers: { type: "number", properties: ["x", "y", "borderWidth", "radius", "tension"] } }), ne.describe("animations", { _fallback: "animation" }), ne.set("transitions", { active: { animation: { duration: 400 } }, resize: { animation: { duration: 0 } }, show: { animations: { colors: { from: "transparent" }, visible: { type: "boolean", duration: 0 } } }, hide: { animations: { colors: { to: "transparent" }, visible: { type: "boolean", easing: "linear", fn: t => 0 | t } } } }); class ys { constructor(t, e) { this._chart = t, this._properties = new Map, this.configure(e) } configure(t) { if (!n(t)) return; const e = this._properties; Object.getOwnPropertyNames(t).forEach((i => { const o = t[i]; if (!n(o)) return; const a = {}; for (const t of _s) a[t] = o[t]; (s(o.properties) && o.properties || [i]).forEach((t => { t !== i && e.has(t) || e.set(t, a) })) })) } _animateOptions(t, e) { const i = e.options, s = function (t, e) { if (!e) return; let i = t.options; if (!i) return void (t.options = e); i.${"$"}shared && (t.options = i = Object.assign({}, i, { ${"$"}shared: !1, ${"$"}animations: {} })); return i }(t, i); if (!s) return []; const n = this._createAnimations(s, i); return i.${"$"}shared && function (t, e) { const i = [], s = Object.keys(e); for (let e = 0; e < s.length; e++) { const n = t[s[e]]; n && n.active() && i.push(n.wait()) } return Promise.all(i) }(t.options.${"$"}animations, i).then((() => { t.options = i }), (() => { })), n } _createAnimations(t, e) { const i = this._properties, s = [], n = t.${"$"}animations || (t.${"$"}animations = {}), o = Object.keys(e), a = Date.now(); let r; for (r = o.length - 1; r >= 0; --r) { const l = o[r]; if ("${"$"}" === l.charAt(0)) continue; if ("options" === l) { s.push(...this._animateOptions(t, e)); continue } const h = e[l]; let c = n[l]; const d = i.get(l); if (c) { if (d && c.active()) { c.update(d, h, a); continue } c.cancel() } d && d.duration ? (n[l] = c = new xs(d, t, l, h), s.push(c)) : t[l] = h } return s } update(t, e) { if (0 === this._properties.size) return void Object.assign(t, e); const i = this._createAnimations(t, e); return i.length ? (mt.add(this._chart, i), !0) : void 0 } } function vs(t, e) { const i = t && t.options || {}, s = i.reverse, n = void 0 === i.min ? e : 0, o = void 0 === i.max ? e : 0; return { start: s ? o : n, end: s ? n : o } } function ws(t, e) { const i = [], s = t._getSortedDatasetMetas(e); let n, o; for (n = 0, o = s.length; n < o; ++n)i.push(s[n].index); return i } function Ms(t, e, i, s = {}) { const n = t.keys, a = "single" === s.mode; let r, l, h, c; if (null !== e) { for (r = 0, l = n.length; r < l; ++r) { if (h = +n[r], h === i) { if (s.all) continue; break } c = t.values[h], o(c) && (a || 0 === e || z(e) === z(c)) && (e += c) } return e } } function ks(t, e) { const i = t && t.options.stacked; return i || void 0 === i && void 0 !== e.stack } function Ss(t, e, i) { const s = t[e] || (t[e] = {}); return s[i] || (s[i] = {}) } function Ps(t, e, i, s) { for (const n of e.getMatchingVisibleMetas(s).reverse()) { const e = t[n.index]; if (i && e > 0 || !i && e < 0) return n.index } return null } function Ds(t, e) { const { chart: i, _cachedMeta: s } = t, n = i._stacks || (i._stacks = {}), { iScale: o, vScale: a, index: r } = s, l = o.axis, h = a.axis, c = function (t, e, i) { return `${"$"}{t.id}.${"$"}{e.id}.${"$"}{i.stack || i.type}` }(o, a, s), d = e.length; let u; for (let t = 0; t < d; ++t) { const i = e[t], { [l]: o, [h]: d } = i; u = (i._stacks || (i._stacks = {}))[h] = Ss(n, c, o), u[r] = d, u._top = Ps(u, a, !0, s.type), u._bottom = Ps(u, a, !1, s.type) } } function Os(t, e) { const i = t.scales; return Object.keys(i).filter((t => i[t].axis === e)).shift() } function Cs(t, e) { const i = t.controller.index, s = t.vScale && t.vScale.axis; if (s) { e = e || t._parsed; for (const t of e) { const e = t._stacks; if (!e || void 0 === e[s] || void 0 === e[s][i]) return; delete e[s][i] } } } const As = t => "reset" === t || "none" === t, Ts = (t, e) => e ? t : Object.assign({}, t); class Ls { constructor(t, e) { this.chart = t, this._ctx = t.ctx, this.index = e, this._cachedDataOpts = {}, this._cachedMeta = this.getMeta(), this._type = this._cachedMeta.type, this.options = void 0, this._parsing = !1, this._data = void 0, this._objectData = void 0, this._sharedOptions = void 0, this._drawStart = void 0, this._drawCount = void 0, this.enableOptionSharing = !1, this.supportsDecimation = !1, this.${"$"}context = void 0, this._syncList = [], this.initialize() } initialize() { const t = this._cachedMeta; this.configure(), this.linkScales(), t._stacked = ks(t.vScale, t), this.addElements() } updateIndex(t) { this.index !== t && Cs(this._cachedMeta), this.index = t } linkScales() { const t = this.chart, e = this._cachedMeta, i = this.getDataset(), s = (t, e, i, s) => "x" === t ? e : "r" === t ? s : i, n = e.xAxisID = r(i.xAxisID, Os(t, "x")), o = e.yAxisID = r(i.yAxisID, Os(t, "y")), a = e.rAxisID = r(i.rAxisID, Os(t, "r")), l = e.indexAxis, h = e.iAxisID = s(l, n, o, a), c = e.vAxisID = s(l, o, n, a); e.xScale = this.getScaleForId(n), e.yScale = this.getScaleForId(o), e.rScale = this.getScaleForId(a), e.iScale = this.getScaleForId(h), e.vScale = this.getScaleForId(c) } getDataset() { return this.chart.data.datasets[this.index] } getMeta() { return this.chart.getDatasetMeta(this.index) } getScaleForId(t) { return this.chart.scales[t] } _getOtherScale(t) { const e = this._cachedMeta; return t === e.iScale ? e.vScale : e.iScale } reset() { this._update("reset") } _destroy() { const t = this._cachedMeta; this._data && at(this._data, this), t._stacked && Cs(t) } _dataCheck() { const t = this.getDataset(), e = t.data || (t.data = []), i = this._data; if (n(e)) this._data = function (t) { const e = Object.keys(t), i = new Array(e.length); let s, n, o; for (s = 0, n = e.length; s < n; ++s)o = e[s], i[s] = { x: o, y: t[o] }; return i }(e); else if (i !== e) { if (i) { at(i, this); const t = this._cachedMeta; Cs(t), t._parsed = [] } e && Object.isExtensible(e) && ot(e, this), this._syncList = [], this._data = e } } addElements() { const t = this._cachedMeta; this._dataCheck(), this.datasetElementType && (t.dataset = new this.datasetElementType) } buildOrUpdateElements(t) { const e = this._cachedMeta, i = this.getDataset(); let s = !1; this._dataCheck(); const n = e._stacked; e._stacked = ks(e.vScale, e), e.stack !== i.stack && (s = !0, Cs(e), e.stack = i.stack), this._resyncElements(t), (s || n !== e._stacked) && Ds(this, e._parsed) } configure() { const t = this.chart.config, e = t.datasetScopeKeys(this._type), i = t.getOptionScopes(this.getDataset(), e, !0); this.options = t.createResolver(i, this.getContext()), this._parsing = this.options.parsing, this._cachedDataOpts = {} } parse(t, e) { const { _cachedMeta: i, _data: o } = this, { iScale: a, _stacked: r } = i, l = a.axis; let h, c, d, u = 0 === t && e === o.length || i._sorted, f = t > 0 && i._parsed[t - 1]; if (!1 === this._parsing) i._parsed = o, i._sorted = !0, d = o; else { d = s(o[t]) ? this.parseArrayData(i, o, t, e) : n(o[t]) ? this.parseObjectData(i, o, t, e) : this.parsePrimitiveData(i, o, t, e); const a = () => null === c[l] || f && c[l] < f[l]; for (h = 0; h < e; ++h)i._parsed[h + t] = c = d[h], u && (a() && (u = !1), f = c); i._sorted = u } r && Ds(this, d) } parsePrimitiveData(t, e, i, s) { const { iScale: n, vScale: o } = t, a = n.axis, r = o.axis, l = n.getLabels(), h = n === o, c = new Array(s); let d, u, f; for (d = 0, u = s; d < u; ++d)f = d + i, c[d] = { [a]: h || n.parse(l[f], f), [r]: o.parse(e[f], f) }; return c } parseArrayData(t, e, i, s) { const { xScale: n, yScale: o } = t, a = new Array(s); let r, l, h, c; for (r = 0, l = s; r < l; ++r)h = r + i, c = e[h], a[r] = { x: n.parse(c[0], h), y: o.parse(c[1], h) }; return a } parseObjectData(t, e, i, s) { const { xScale: n, yScale: o } = t, { xAxisKey: a = "x", yAxisKey: r = "y" } = this._parsing, l = new Array(s); let h, c, d, u; for (h = 0, c = s; h < c; ++h)d = h + i, u = e[d], l[h] = { x: n.parse(y(u, a), d), y: o.parse(y(u, r), d) }; return l } getParsed(t) { return this._cachedMeta._parsed[t] } getDataElement(t) { return this._cachedMeta.data[t] } applyStack(t, e, i) { const s = this.chart, n = this._cachedMeta, o = e[t.axis]; return Ms({ keys: ws(s, !0), values: e._stacks[t.axis] }, o, n.index, { mode: i }) } updateRangeFromParsed(t, e, i, s) { const n = i[e.axis]; let o = null === n ? NaN : n; const a = s && i._stacks[e.axis]; s && a && (s.values = a, o = Ms(s, n, this._cachedMeta.index)), t.min = Math.min(t.min, o), t.max = Math.max(t.max, o) } getMinMax(t, e) { const i = this._cachedMeta, s = i._parsed, n = i._sorted && t === i.iScale, a = s.length, r = this._getOtherScale(t), l = ((t, e, i) => t && !e.hidden && e._stacked && { keys: ws(i, !0), values: null })(e, i, this.chart), h = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }, { min: c, max: d } = function (t) { const { min: e, max: i, minDefined: s, maxDefined: n } = t.getUserBounds(); return { min: s ? e : Number.NEGATIVE_INFINITY, max: n ? i : Number.POSITIVE_INFINITY } }(r); let u, f; function g() { f = s[u]; const e = f[r.axis]; return !o(f[t.axis]) || c > e || d < e } for (u = 0; u < a && (g() || (this.updateRangeFromParsed(h, t, f, l), !n)); ++u); if (n) for (u = a - 1; u >= 0; --u)if (!g()) { this.updateRangeFromParsed(h, t, f, l); break } return h } getAllParsedValues(t) { const e = this._cachedMeta._parsed, i = []; let s, n, a; for (s = 0, n = e.length; s < n; ++s)a = e[s][t.axis], o(a) && i.push(a); return i } getMaxOverflow() { return !1 } getLabelAndValue(t) { const e = this._cachedMeta, i = e.iScale, s = e.vScale, n = this.getParsed(t); return { label: i ? "" + i.getLabelForValue(n[i.axis]) : "", value: s ? "" + s.getLabelForValue(n[s.axis]) : "" } } _update(t) { const e = this._cachedMeta; this.update(t || "default"), e._clip = function (t) { let e, i, s, o; return n(t) ? (e = t.top, i = t.right, s = t.bottom, o = t.left) : e = i = s = o = t, { top: e, right: i, bottom: s, left: o, disabled: !1 === t } }(r(this.options.clip, function (t, e, i) { if (!1 === i) return !1; const s = vs(t, i), n = vs(e, i); return { top: n.end, right: s.end, bottom: n.start, left: s.start } }(e.xScale, e.yScale, this.getMaxOverflow()))) } update(t) { } draw() { const t = this._ctx, e = this.chart, i = this._cachedMeta, s = i.data || [], n = e.chartArea, o = [], a = this._drawStart || 0, r = this._drawCount || s.length - a, l = this.options.drawActiveElementsOnTop; let h; for (i.dataset && i.dataset.draw(t, n, a, r), h = a; h < a + r; ++h) { const e = s[h]; e.hidden || (e.active && l ? o.push(e) : e.draw(t, n)) } for (h = 0; h < o.length; ++h)o[h].draw(t, n) } getStyle(t, e) { const i = e ? "active" : "default"; return void 0 === t && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(i) : this.resolveDataElementOptions(t || 0, i) } getContext(t, e, i) { const s = this.getDataset(); let n; if (t >= 0 && t < this._cachedMeta.data.length) { const e = this._cachedMeta.data[t]; n = e.${"$"}context || (e.${"$"}context = function (t, e, i) { return _i(t, { active: !1, dataIndex: e, parsed: void 0, raw: void 0, element: i, index: e, mode: "default", type: "data" }) }(this.getContext(), t, e)), n.parsed = this.getParsed(t), n.raw = s.data[t], n.index = n.dataIndex = t } else n = this.${"$"}context || (this.${"$"}context = function (t, e) { return _i(t, { active: !1, dataset: void 0, datasetIndex: e, index: e, mode: "default", type: "dataset" }) }(this.chart.getContext(), this.index)), n.dataset = s, n.index = n.datasetIndex = this.index; return n.active = !!e, n.mode = i, n } resolveDatasetElementOptions(t) { return this._resolveElementOptions(this.datasetElementType.id, t) } resolveDataElementOptions(t, e) { return this._resolveElementOptions(this.dataElementType.id, e, t) } _resolveElementOptions(t, e = "default", i) { const s = "active" === e, n = this._cachedDataOpts, o = t + "-" + e, a = n[o], r = this.enableOptionSharing && M(i); if (a) return Ts(a, r); const l = this.chart.config, h = l.datasetElementScopeKeys(this._type, t), c = s ? [`${"$"}{t}Hover`, "hover", t, ""] : [t, ""], d = l.getOptionScopes(this.getDataset(), h), u = Object.keys(ne.elements[t]), f = l.resolveNamedOptions(d, u, (() => this.getContext(i, s)), c); return f.${"$"}shared && (f.${"$"}shared = r, n[o] = Object.freeze(Ts(f, r))), f } _resolveAnimations(t, e, i) { const s = this.chart, n = this._cachedDataOpts, o = `animation-${"$"}{e}`, a = n[o]; if (a) return a; let r; if (!1 !== s.options.animation) { const s = this.chart.config, n = s.datasetAnimationScopeKeys(this._type, e), o = s.getOptionScopes(this.getDataset(), n); r = s.createResolver(o, this.getContext(t, i, e)) } const l = new ys(s, r && r.animations); return r && r._cacheable && (n[o] = Object.freeze(l)), l } getSharedOptions(t) { if (t.${"$"}shared) return this._sharedOptions || (this._sharedOptions = Object.assign({}, t)) } includeOptions(t, e) { return !e || As(t) || this.chart._animationsDisabled } _getSharedOptions(t, e) { const i = this.resolveDataElementOptions(t, e), s = this._sharedOptions, n = this.getSharedOptions(i), o = this.includeOptions(e, n) || n !== s; return this.updateSharedOptions(n, e, i), { sharedOptions: n, includeOptions: o } } updateElement(t, e, i, s) { As(s) ? Object.assign(t, i) : this._resolveAnimations(e, s).update(t, i) } updateSharedOptions(t, e, i) { t && !As(e) && this._resolveAnimations(void 0, e).update(t, i) } _setStyle(t, e, i, s) { t.active = s; const n = this.getStyle(e, s); this._resolveAnimations(e, i, s).update(t, { options: !s && this.getSharedOptions(n) || n }) } removeHoverStyle(t, e, i) { this._setStyle(t, i, "active", !1) } setHoverStyle(t, e, i) { this._setStyle(t, i, "active", !0) } _removeDatasetHoverStyle() { const t = this._cachedMeta.dataset; t && this._setStyle(t, void 0, "active", !1) } _setDatasetHoverStyle() { const t = this._cachedMeta.dataset; t && this._setStyle(t, void 0, "active", !0) } _resyncElements(t) { const e = this._data, i = this._cachedMeta.data; for (const [t, e, i] of this._syncList) this[t](e, i); this._syncList = []; const s = i.length, n = e.length, o = Math.min(n, s); o && this.parse(0, o), n > s ? this._insertElements(s, n - s, t) : n < s && this._removeElements(n, s - n) } _insertElements(t, e, i = !0) { const s = this._cachedMeta, n = s.data, o = t + e; let a; const r = t => { for (t.length += e, a = t.length - 1; a >= o; a--)t[a] = t[a - e] }; for (r(n), a = t; a < o; ++a)n[a] = new this.dataElementType; this._parsing && r(s._parsed), this.parse(t, e), i && this.updateElements(n, t, e, "reset") } updateElements(t, e, i, s) { } _removeElements(t, e) { const i = this._cachedMeta; if (this._parsing) { const s = i._parsed.splice(t, e); i._stacked && Cs(i, s) } i.data.splice(t, e) } _sync(t) { if (this._parsing) this._syncList.push(t); else { const [e, i, s] = t; this[e](i, s) } this.chart._dataChanges.push([this.index, ...t]) } _onDataPush() { const t = arguments.length; this._sync(["_insertElements", this.getDataset().data.length - t, t]) } _onDataPop() { this._sync(["_removeElements", this._cachedMeta.data.length - 1, 1]) } _onDataShift() { this._sync(["_removeElements", 0, 1]) } _onDataSplice(t, e) { e && this._sync(["_removeElements", t, e]); const i = arguments.length - 2; i && this._sync(["_insertElements", t, i]) } _onDataUnshift() { this._sync(["_insertElements", 0, arguments.length]) } } Ls.defaults = {}, Ls.prototype.datasetElementType = null, Ls.prototype.dataElementType = null; class Es { constructor() { this.x = void 0, this.y = void 0, this.active = !1, this.options = void 0, this.${"$"}animations = void 0 } tooltipPosition(t) { const { x: e, y: i } = this.getProps(["x", "y"], t); return { x: e, y: i } } hasValue() { return B(this.x) && B(this.y) } getProps(t, e) { const i = this.${"$"}animations; if (!e || !i) return this; const s = {}; return t.forEach((t => { s[t] = i[t] && i[t].active() ? i[t]._to : this[t] })), s } } Es.defaults = {}, Es.defaultRoutes = void 0; const Rs = { values: t => s(t) ? t : "" + t, numeric(t, e, i) { if (0 === t) return "0"; const s = this.chart.options.locale; let n, o = t; if (i.length > 1) { const e = Math.max(Math.abs(i[0].value), Math.abs(i[i.length - 1].value)); (e < 1e-4 || e > 1e15) && (n = "scientific"), o = function (t, e) { let i = e.length > 3 ? e[2].value - e[1].value : e[1].value - e[0].value; Math.abs(i) >= 1 && t !== Math.floor(t) && (i = t - Math.floor(t)); return i }(t, i) } const a = I(Math.abs(o)), r = Math.max(Math.min(-1 * Math.floor(a), 20), 0), l = { notation: n, minimumFractionDigits: r, maximumFractionDigits: r }; return Object.assign(l, this.options.ticks.format), li(t, s, l) }, logarithmic(t, e, i) { if (0 === t) return "0"; const s = t / Math.pow(10, Math.floor(I(t))); return 1 === s || 2 === s || 5 === s ? Rs.numeric.call(this, t, e, i) : "" } }; var Is = { formatters: Rs }; function zs(t, e) { const s = t.options.ticks, n = s.maxTicksLimit || function (t) { const e = t.options.offset, i = t._tickSize(), s = t._length / i + (e ? 0 : 1), n = t._maxLength / i; return Math.floor(Math.min(s, n)) }(t), o = s.major.enabled ? function (t) { const e = []; let i, s; for (i = 0, s = t.length; i < s; i++)t[i].major && e.push(i); return e }(e) : [], a = o.length, r = o[0], l = o[a - 1], h = []; if (a > n) return function (t, e, i, s) { let n, o = 0, a = i[0]; for (s = Math.ceil(s), n = 0; n < t.length; n++)n === a && (e.push(t[n]), o++, a = i[o * s]) }(e, h, o, a / n), h; const c = function (t, e, i) { const s = function (t) { const e = t.length; let i, s; if (e < 2) return !1; for (s = t[0], i = 1; i < e; ++i)if (t[i] - t[i - 1] !== s) return !1; return s }(t), n = e.length / i; if (!s) return Math.max(n, 1); const o = V(s); for (let t = 0, e = o.length - 1; t < e; t++) { const e = o[t]; if (e > n) return e } return Math.max(n, 1) }(o, e, n); if (a > 0) { let t, s; const n = a > 1 ? Math.round((l - r) / (a - 1)) : null; for (Fs(e, h, c, i(n) ? 0 : r - n, r), t = 0, s = a - 1; t < s; t++)Fs(e, h, c, o[t], o[t + 1]); return Fs(e, h, c, l, i(n) ? e.length : l + n), h } return Fs(e, h, c), h } function Fs(t, e, i, s, n) { const o = r(s, 0), a = Math.min(r(n, t.length), t.length); let l, h, c, d = 0; for (i = Math.ceil(i), n && (l = n - s, i = l / Math.floor(l / i)), c = o; c < 0;)d++, c = Math.round(o + d * i); for (h = Math.max(o, 0); h < a; h++)h === c && (e.push(t[h]), d++, c = Math.round(o + d * i)) } ne.set("scale", { display: !0, offset: !1, reverse: !1, beginAtZero: !1, bounds: "ticks", grace: 0, grid: { display: !0, lineWidth: 1, drawBorder: !0, drawOnChartArea: !0, drawTicks: !0, tickLength: 8, tickWidth: (t, e) => e.lineWidth, tickColor: (t, e) => e.color, offset: !1, borderDash: [], borderDashOffset: 0, borderWidth: 1 }, title: { display: !1, text: "", padding: { top: 4, bottom: 4 } }, ticks: { minRotation: 0, maxRotation: 50, mirror: !1, textStrokeWidth: 0, textStrokeColor: "", padding: 3, display: !0, autoSkip: !0, autoSkipPadding: 3, labelOffset: 0, callback: Is.formatters.values, minor: {}, major: {}, align: "center", crossAlign: "near", showLabelBackdrop: !1, backdropColor: "rgba(255, 255, 255, 0.75)", backdropPadding: 2 } }), ne.route("scale.ticks", "color", "", "color"), ne.route("scale.grid", "color", "", "borderColor"), ne.route("scale.grid", "borderColor", "", "borderColor"), ne.route("scale.title", "color", "", "color"), ne.describe("scale", { _fallback: !1, _scriptable: t => !t.startsWith("before") && !t.startsWith("after") && "callback" !== t && "parser" !== t, _indexable: t => "borderDash" !== t && "tickBorderDash" !== t }), ne.describe("scales", { _fallback: "scale" }), ne.describe("scale.ticks", { _scriptable: t => "backdropPadding" !== t && "callback" !== t, _indexable: t => "backdropPadding" !== t }); const Vs = (t, e, i) => "top" === e || "left" === e ? t[e] + i : t[e] - i; function Bs(t, e) { const i = [], s = t.length / e, n = t.length; let o = 0; for (; o < n; o += s)i.push(t[Math.floor(o)]); return i } function Ns(t, e, i) { const s = t.ticks.length, n = Math.min(e, s - 1), o = t._startPixel, a = t._endPixel, r = 1e-6; let l, h = t.getPixelForTick(n); if (!(i && (l = 1 === s ? Math.max(h - o, a - h) : 0 === e ? (t.getPixelForTick(1) - h) / 2 : (h - t.getPixelForTick(n - 1)) / 2, h += n < e ? l : -l, h < o - r || h > a + r))) return h } function Ws(t) { return t.drawTicks ? t.tickLength : 0 } function js(t, e) { if (!t.display) return 0; const i = mi(t.font, e), n = pi(t.padding); return (s(t.text) ? t.text.length : 1) * i.lineHeight + n.height } function Hs(t, e, i) { let s = dt(t); return (i && "right" !== e || !i && "right" === e) && (s = (t => "left" === t ? "right" : "right" === t ? "left" : t)(s)), s } class ${"$"}s extends Es { constructor(t) { super(), this.id = t.id, this.type = t.type, this.options = void 0, this.ctx = t.ctx, this.chart = t.chart, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this._margins = { left: 0, right: 0, top: 0, bottom: 0 }, this.maxWidth = void 0, this.maxHeight = void 0, this.paddingTop = void 0, this.paddingBottom = void 0, this.paddingLeft = void 0, this.paddingRight = void 0, this.axis = void 0, this.labelRotation = void 0, this.min = void 0, this.max = void 0, this._range = void 0, this.ticks = [], this._gridLineItems = null, this._labelItems = null, this._labelSizes = null, this._length = 0, this._maxLength = 0, this._longestTextCache = {}, this._startPixel = void 0, this._endPixel = void 0, this._reversePixels = !1, this._userMax = void 0, this._userMin = void 0, this._suggestedMax = void 0, this._suggestedMin = void 0, this._ticksLength = 0, this._borderValue = 0, this._cache = {}, this._dataLimitsCached = !1, this.${"$"}context = void 0 } init(t) { this.options = t.setContext(this.getContext()), this.axis = t.axis, this._userMin = this.parse(t.min), this._userMax = this.parse(t.max), this._suggestedMin = this.parse(t.suggestedMin), this._suggestedMax = this.parse(t.suggestedMax) } parse(t, e) { return t } getUserBounds() { let { _userMin: t, _userMax: e, _suggestedMin: i, _suggestedMax: s } = this; return t = a(t, Number.POSITIVE_INFINITY), e = a(e, Number.NEGATIVE_INFINITY), i = a(i, Number.POSITIVE_INFINITY), s = a(s, Number.NEGATIVE_INFINITY), { min: a(t, i), max: a(e, s), minDefined: o(t), maxDefined: o(e) } } getMinMax(t) { let e, { min: i, max: s, minDefined: n, maxDefined: o } = this.getUserBounds(); if (n && o) return { min: i, max: s }; const r = this.getMatchingVisibleMetas(); for (let a = 0, l = r.length; a < l; ++a)e = r[a].controller.getMinMax(this, t), n || (i = Math.min(i, e.min)), o || (s = Math.max(s, e.max)); return i = o && i > s ? s : i, s = n && i > s ? i : s, { min: a(i, a(s, i)), max: a(s, a(i, s)) } } getPadding() { return { left: this.paddingLeft || 0, top: this.paddingTop || 0, right: this.paddingRight || 0, bottom: this.paddingBottom || 0 } } getTicks() { return this.ticks } getLabels() { const t = this.chart.data; return this.options.labels || (this.isHorizontal() ? t.xLabels : t.yLabels) || t.labels || [] } beforeLayout() { this._cache = {}, this._dataLimitsCached = !1 } beforeUpdate() { c(this.options.beforeUpdate, [this]) } update(t, e, i) { const { beginAtZero: s, grace: n, ticks: o } = this.options, a = o.sampleSize; this.beforeUpdate(), this.maxWidth = t, this.maxHeight = e, this._margins = i = Object.assign({ left: 0, right: 0, top: 0, bottom: 0 }, i), this.ticks = null, this._labelSizes = null, this._gridLineItems = null, this._labelItems = null, this.beforeSetDimensions(), this.setDimensions(), this.afterSetDimensions(), this._maxLength = this.isHorizontal() ? this.width + i.left + i.right : this.height + i.top + i.bottom, this._dataLimitsCached || (this.beforeDataLimits(), this.determineDataLimits(), this.afterDataLimits(), this._range = xi(this, n, s), this._dataLimitsCached = !0), this.beforeBuildTicks(), this.ticks = this.buildTicks() || [], this.afterBuildTicks(); const r = a < this.ticks.length; this._convertTicksToLabels(r ? Bs(this.ticks, a) : this.ticks), this.configure(), this.beforeCalculateLabelRotation(), this.calculateLabelRotation(), this.afterCalculateLabelRotation(), o.display && (o.autoSkip || "auto" === o.source) && (this.ticks = zs(this, this.ticks), this._labelSizes = null, this.afterAutoSkip()), r && this._convertTicksToLabels(this.ticks), this.beforeFit(), this.fit(), this.afterFit(), this.afterUpdate() } configure() { let t, e, i = this.options.reverse; this.isHorizontal() ? (t = this.left, e = this.right) : (t = this.top, e = this.bottom, i = !i), this._startPixel = t, this._endPixel = e, this._reversePixels = i, this._length = e - t, this._alignToPixels = this.options.alignToPixels } afterUpdate() { c(this.options.afterUpdate, [this]) } beforeSetDimensions() { c(this.options.beforeSetDimensions, [this]) } setDimensions() { this.isHorizontal() ? (this.width = this.maxWidth, this.left = 0, this.right = this.width) : (this.height = this.maxHeight, this.top = 0, this.bottom = this.height), this.paddingLeft = 0, this.paddingTop = 0, this.paddingRight = 0, this.paddingBottom = 0 } afterSetDimensions() { c(this.options.afterSetDimensions, [this]) } _callHooks(t) { this.chart.notifyPlugins(t, this.getContext()), c(this.options[t], [this]) } beforeDataLimits() { this._callHooks("beforeDataLimits") } determineDataLimits() { } afterDataLimits() { this._callHooks("afterDataLimits") } beforeBuildTicks() { this._callHooks("beforeBuildTicks") } buildTicks() { return [] } afterBuildTicks() { this._callHooks("afterBuildTicks") } beforeTickToLabelConversion() { c(this.options.beforeTickToLabelConversion, [this]) } generateTickLabels(t) { const e = this.options.ticks; let i, s, n; for (i = 0, s = t.length; i < s; i++)n = t[i], n.label = c(e.callback, [n.value, i, t], this) } afterTickToLabelConversion() { c(this.options.afterTickToLabelConversion, [this]) } beforeCalculateLabelRotation() { c(this.options.beforeCalculateLabelRotation, [this]) } calculateLabelRotation() { const t = this.options, e = t.ticks, i = this.ticks.length, s = e.minRotation || 0, n = e.maxRotation; let o, a, r, l = s; if (!this._isVisible() || !e.display || s >= n || i <= 1 || !this.isHorizontal()) return void (this.labelRotation = s); const h = this._getLabelSizes(), c = h.widest.width, d = h.highest.height, u = Z(this.chart.width - c, 0, this.maxWidth); o = t.offset ? this.maxWidth / i : u / (i - 1), c + 6 > o && (o = u / (i - (t.offset ? .5 : 1)), a = this.maxHeight - Ws(t.grid) - e.padding - js(t.title, this.chart.options.font), r = Math.sqrt(c * c + d * d), l = ${"$"}(Math.min(Math.asin(Z((h.highest.height + 6) / o, -1, 1)), Math.asin(Z(a / r, -1, 1)) - Math.asin(Z(d / r, -1, 1)))), l = Math.max(s, Math.min(n, l))), this.labelRotation = l } afterCalculateLabelRotation() { c(this.options.afterCalculateLabelRotation, [this]) } afterAutoSkip() { } beforeFit() { c(this.options.beforeFit, [this]) } fit() { const t = { width: 0, height: 0 }, { chart: e, options: { ticks: i, title: s, grid: n } } = this, o = this._isVisible(), a = this.isHorizontal(); if (o) { const o = js(s, e.options.font); if (a ? (t.width = this.maxWidth, t.height = Ws(n) + o) : (t.height = this.maxHeight, t.width = Ws(n) + o), i.display && this.ticks.length) { const { first: e, last: s, widest: n, highest: o } = this._getLabelSizes(), r = 2 * i.padding, l = H(this.labelRotation), h = Math.cos(l), c = Math.sin(l); if (a) { const e = i.mirror ? 0 : c * n.width + h * o.height; t.height = Math.min(this.maxHeight, t.height + e + r) } else { const e = i.mirror ? 0 : h * n.width + c * o.height; t.width = Math.min(this.maxWidth, t.width + e + r) } this._calculatePadding(e, s, c, h) } } this._handleMargins(), a ? (this.width = this._length = e.width - this._margins.left - this._margins.right, this.height = t.height) : (this.width = t.width, this.height = this._length = e.height - this._margins.top - this._margins.bottom) } _calculatePadding(t, e, i, s) { const { ticks: { align: n, padding: o }, position: a } = this.options, r = 0 !== this.labelRotation, l = "top" !== a && "x" === this.axis; if (this.isHorizontal()) { const a = this.getPixelForTick(0) - this.left, h = this.right - this.getPixelForTick(this.ticks.length - 1); let c = 0, d = 0; r ? l ? (c = s * t.width, d = i * e.height) : (c = i * t.height, d = s * e.width) : "start" === n ? d = e.width : "end" === n ? c = t.width : "inner" !== n && (c = t.width / 2, d = e.width / 2), this.paddingLeft = Math.max((c - a + o) * this.width / (this.width - a), 0), this.paddingRight = Math.max((d - h + o) * this.width / (this.width - h), 0) } else { let i = e.height / 2, s = t.height / 2; "start" === n ? (i = 0, s = t.height) : "end" === n && (i = e.height, s = 0), this.paddingTop = i + o, this.paddingBottom = s + o } } _handleMargins() { this._margins && (this._margins.left = Math.max(this.paddingLeft, this._margins.left), this._margins.top = Math.max(this.paddingTop, this._margins.top), this._margins.right = Math.max(this.paddingRight, this._margins.right), this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom)) } afterFit() { c(this.options.afterFit, [this]) } isHorizontal() { const { axis: t, position: e } = this.options; return "top" === e || "bottom" === e || "x" === t } isFullSize() { return this.options.fullSize } _convertTicksToLabels(t) { let e, s; for (this.beforeTickToLabelConversion(), this.generateTickLabels(t), e = 0, s = t.length; e < s; e++)i(t[e].label) && (t.splice(e, 1), s--, e--); this.afterTickToLabelConversion() } _getLabelSizes() { let t = this._labelSizes; if (!t) { const e = this.options.ticks.sampleSize; let i = this.ticks; e < i.length && (i = Bs(i, e)), this._labelSizes = t = this._computeLabelSizes(i, i.length) } return t } _computeLabelSizes(t, e) { const { ctx: n, _longestTextCache: o } = this, a = [], r = []; let l, h, c, u, f, g, p, m, b, x, _, y = 0, v = 0; for (l = 0; l < e; ++l) { if (u = t[l].label, f = this._resolveTickFontOptions(l), n.font = g = f.string, p = o[g] = o[g] || { data: {}, gc: [] }, m = f.lineHeight, b = x = 0, i(u) || s(u)) { if (s(u)) for (h = 0, c = u.length; h < c; ++h)_ = u[h], i(_) || s(_) || (b = _e(n, p.data, p.gc, b, _), x += m) } else b = _e(n, p.data, p.gc, b, u), x = m; a.push(b), r.push(x), y = Math.max(b, y), v = Math.max(x, v) } !function (t, e) { d(t, (t => { const i = t.gc, s = i.length / 2; let n; if (s > e) { for (n = 0; n < s; ++n)delete t.data[i[n]]; i.splice(0, s) } })) }(o, e); const w = a.indexOf(y), M = r.indexOf(v), k = t => ({ width: a[t] || 0, height: r[t] || 0 }); return { first: k(0), last: k(e - 1), widest: k(w), highest: k(M), widths: a, heights: r } } getLabelForValue(t) { return t } getPixelForValue(t, e) { return NaN } getValueForPixel(t) { } getPixelForTick(t) { const e = this.ticks; return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value) } getPixelForDecimal(t) { this._reversePixels && (t = 1 - t); const e = this._startPixel + t * this._length; return J(this._alignToPixels ? ve(this.chart, e, 0) : e) } getDecimalForPixel(t) { const e = (t - this._startPixel) / this._length; return this._reversePixels ? 1 - e : e } getBasePixel() { return this.getPixelForValue(this.getBaseValue()) } getBaseValue() { const { min: t, max: e } = this; return t < 0 && e < 0 ? e : t > 0 && e > 0 ? t : 0 } getContext(t) { const e = this.ticks || []; if (t >= 0 && t < e.length) { const i = e[t]; return i.${"$"}context || (i.${"$"}context = function (t, e, i) { return _i(t, { tick: i, index: e, type: "tick" }) }(this.getContext(), t, i)) } return this.${"$"}context || (this.${"$"}context = _i(this.chart.getContext(), { scale: this, type: "scale" })) } _tickSize() { const t = this.options.ticks, e = H(this.labelRotation), i = Math.abs(Math.cos(e)), s = Math.abs(Math.sin(e)), n = this._getLabelSizes(), o = t.autoSkipPadding || 0, a = n ? n.widest.width + o : 0, r = n ? n.highest.height + o : 0; return this.isHorizontal() ? r * i > a * s ? a / i : r / s : r * s < a * i ? r / i : a / s } _isVisible() { const t = this.options.display; return "auto" !== t ? !!t : this.getMatchingVisibleMetas().length > 0 } _computeGridLineItems(t) { const e = this.axis, i = this.chart, s = this.options, { grid: o, position: a } = s, l = o.offset, h = this.isHorizontal(), c = this.ticks.length + (l ? 1 : 0), d = Ws(o), u = [], f = o.setContext(this.getContext()), g = f.drawBorder ? f.borderWidth : 0, p = g / 2, m = function (t) { return ve(i, t, g) }; let b, x, _, y, v, w, M, k, S, P, D, O; if ("top" === a) b = m(this.bottom), w = this.bottom - d, k = b - p, P = m(t.top) + p, O = t.bottom; else if ("bottom" === a) b = m(this.top), P = t.top, O = m(t.bottom) - p, w = b + p, k = this.top + d; else if ("left" === a) b = m(this.right), v = this.right - d, M = b - p, S = m(t.left) + p, D = t.right; else if ("right" === a) b = m(this.left), S = t.left, D = m(t.right) - p, v = b + p, M = this.left + d; else if ("x" === e) { if ("center" === a) b = m((t.top + t.bottom) / 2 + .5); else if (n(a)) { const t = Object.keys(a)[0], e = a[t]; b = m(this.chart.scales[t].getPixelForValue(e)) } P = t.top, O = t.bottom, w = b + p, k = w + d } else if ("y" === e) { if ("center" === a) b = m((t.left + t.right) / 2); else if (n(a)) { const t = Object.keys(a)[0], e = a[t]; b = m(this.chart.scales[t].getPixelForValue(e)) } v = b - p, M = v - d, S = t.left, D = t.right } const C = r(s.ticks.maxTicksLimit, c), A = Math.max(1, Math.ceil(c / C)); for (x = 0; x < c; x += A) { const t = o.setContext(this.getContext(x)), e = t.lineWidth, s = t.color, n = t.borderDash || [], a = t.borderDashOffset, r = t.tickWidth, c = t.tickColor, d = t.tickBorderDash || [], f = t.tickBorderDashOffset; _ = Ns(this, x, l), void 0 !== _ && (y = ve(i, _, e), h ? v = M = S = D = y : w = k = P = O = y, u.push({ tx1: v, ty1: w, tx2: M, ty2: k, x1: S, y1: P, x2: D, y2: O, width: e, color: s, borderDash: n, borderDashOffset: a, tickWidth: r, tickColor: c, tickBorderDash: d, tickBorderDashOffset: f })) } return this._ticksLength = c, this._borderValue = b, u } _computeLabelItems(t) { const e = this.axis, i = this.options, { position: o, ticks: a } = i, r = this.isHorizontal(), l = this.ticks, { align: h, crossAlign: c, padding: d, mirror: u } = a, f = Ws(i.grid), g = f + d, p = u ? -d : g, m = -H(this.labelRotation), b = []; let x, _, y, v, w, M, k, S, P, D, O, C, A = "middle"; if ("top" === o) M = this.bottom - p, k = this._getXAxisLabelAlignment(); else if ("bottom" === o) M = this.top + p, k = this._getXAxisLabelAlignment(); else if ("left" === o) { const t = this._getYAxisLabelAlignment(f); k = t.textAlign, w = t.x } else if ("right" === o) { const t = this._getYAxisLabelAlignment(f); k = t.textAlign, w = t.x } else if ("x" === e) { if ("center" === o) M = (t.top + t.bottom) / 2 + g; else if (n(o)) { const t = Object.keys(o)[0], e = o[t]; M = this.chart.scales[t].getPixelForValue(e) + g } k = this._getXAxisLabelAlignment() } else if ("y" === e) { if ("center" === o) w = (t.left + t.right) / 2 - g; else if (n(o)) { const t = Object.keys(o)[0], e = o[t]; w = this.chart.scales[t].getPixelForValue(e) } k = this._getYAxisLabelAlignment(f).textAlign } "y" === e && ("start" === h ? A = "top" : "end" === h && (A = "bottom")); const T = this._getLabelSizes(); for (x = 0, _ = l.length; x < _; ++x) { y = l[x], v = y.label; const t = a.setContext(this.getContext(x)); S = this.getPixelForTick(x) + a.labelOffset, P = this._resolveTickFontOptions(x), D = P.lineHeight, O = s(v) ? v.length : 1; const e = O / 2, i = t.color, n = t.textStrokeColor, h = t.textStrokeWidth; let d, f = k; if (r ? (w = S, "inner" === k && (f = x === _ - 1 ? this.options.reverse ? "left" : "right" : 0 === x ? this.options.reverse ? "right" : "left" : "center"), C = "top" === o ? "near" === c || 0 !== m ? -O * D + D / 2 : "center" === c ? -T.highest.height / 2 - e * D + D : -T.highest.height + D / 2 : "near" === c || 0 !== m ? D / 2 : "center" === c ? T.highest.height / 2 - e * D : T.highest.height - O * D, u && (C *= -1)) : (M = S, C = (1 - O) * D / 2), t.showLabelBackdrop) { const e = pi(t.backdropPadding), i = T.heights[x], s = T.widths[x]; let n = M + C - e.top, o = w - e.left; switch (A) { case "middle": n -= i / 2; break; case "bottom": n -= i }switch (k) { case "center": o -= s / 2; break; case "right": o -= s }d = { left: o, top: n, width: s + e.width, height: i + e.height, color: t.backdropColor } } b.push({ rotation: m, label: v, font: P, color: i, strokeColor: n, strokeWidth: h, textOffset: C, textAlign: f, textBaseline: A, translation: [w, M], backdrop: d }) } return b } _getXAxisLabelAlignment() { const { position: t, ticks: e } = this.options; if (-H(this.labelRotation)) return "top" === t ? "left" : "right"; let i = "center"; return "start" === e.align ? i = "left" : "end" === e.align ? i = "right" : "inner" === e.align && (i = "inner"), i } _getYAxisLabelAlignment(t) { const { position: e, ticks: { crossAlign: i, mirror: s, padding: n } } = this.options, o = t + n, a = this._getLabelSizes().widest.width; let r, l; return "left" === e ? s ? (l = this.right + n, "near" === i ? r = "left" : "center" === i ? (r = "center", l += a / 2) : (r = "right", l += a)) : (l = this.right - o, "near" === i ? r = "right" : "center" === i ? (r = "center", l -= a / 2) : (r = "left", l = this.left)) : "right" === e ? s ? (l = this.left + n, "near" === i ? r = "right" : "center" === i ? (r = "center", l -= a / 2) : (r = "left", l -= a)) : (l = this.left + o, "near" === i ? r = "left" : "center" === i ? (r = "center", l += a / 2) : (r = "right", l = this.right)) : r = "right", { textAlign: r, x: l } } _computeLabelArea() { if (this.options.ticks.mirror) return; const t = this.chart, e = this.options.position; return "left" === e || "right" === e ? { top: 0, left: this.left, bottom: t.height, right: this.right } : "top" === e || "bottom" === e ? { top: this.top, left: 0, bottom: this.bottom, right: t.width } : void 0 } drawBackground() { const { ctx: t, options: { backgroundColor: e }, left: i, top: s, width: n, height: o } = this; e && (t.save(), t.fillStyle = e, t.fillRect(i, s, n, o), t.restore()) } getLineWidthForValue(t) { const e = this.options.grid; if (!this._isVisible() || !e.display) return 0; const i = this.ticks.findIndex((e => e.value === t)); if (i >= 0) { return e.setContext(this.getContext(i)).lineWidth } return 0 } drawGrid(t) { const e = this.options.grid, i = this.ctx, s = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(t)); let n, o; const a = (t, e, s) => { s.width && s.color && (i.save(), i.lineWidth = s.width, i.strokeStyle = s.color, i.setLineDash(s.borderDash || []), i.lineDashOffset = s.borderDashOffset, i.beginPath(), i.moveTo(t.x, t.y), i.lineTo(e.x, e.y), i.stroke(), i.restore()) }; if (e.display) for (n = 0, o = s.length; n < o; ++n) { const t = s[n]; e.drawOnChartArea && a({ x: t.x1, y: t.y1 }, { x: t.x2, y: t.y2 }, t), e.drawTicks && a({ x: t.tx1, y: t.ty1 }, { x: t.tx2, y: t.ty2 }, { color: t.tickColor, width: t.tickWidth, borderDash: t.tickBorderDash, borderDashOffset: t.tickBorderDashOffset }) } } drawBorder() { const { chart: t, ctx: e, options: { grid: i } } = this, s = i.setContext(this.getContext()), n = i.drawBorder ? s.borderWidth : 0; if (!n) return; const o = i.setContext(this.getContext(0)).lineWidth, a = this._borderValue; let r, l, h, c; this.isHorizontal() ? (r = ve(t, this.left, n) - n / 2, l = ve(t, this.right, o) + o / 2, h = c = a) : (h = ve(t, this.top, n) - n / 2, c = ve(t, this.bottom, o) + o / 2, r = l = a), e.save(), e.lineWidth = s.borderWidth, e.strokeStyle = s.borderColor, e.beginPath(), e.moveTo(r, h), e.lineTo(l, c), e.stroke(), e.restore() } drawLabels(t) { if (!this.options.ticks.display) return; const e = this.ctx, i = this._computeLabelArea(); i && Pe(e, i); const s = this._labelItems || (this._labelItems = this._computeLabelItems(t)); let n, o; for (n = 0, o = s.length; n < o; ++n) { const t = s[n], i = t.font, o = t.label; t.backdrop && (e.fillStyle = t.backdrop.color, e.fillRect(t.backdrop.left, t.backdrop.top, t.backdrop.width, t.backdrop.height)), Ae(e, o, 0, t.textOffset, i, t) } i && De(e) } drawTitle() { const { ctx: t, options: { position: e, title: i, reverse: o } } = this; if (!i.display) return; const a = mi(i.font), r = pi(i.padding), l = i.align; let h = a.lineHeight / 2; "bottom" === e || "center" === e || n(e) ? (h += r.bottom, s(i.text) && (h += a.lineHeight * (i.text.length - 1))) : h += r.top; const { titleX: c, titleY: d, maxWidth: u, rotation: f } = function (t, e, i, s) { const { top: o, left: a, bottom: r, right: l, chart: h } = t, { chartArea: c, scales: d } = h; let u, f, g, p = 0; const m = r - o, b = l - a; if (t.isHorizontal()) { if (f = ut(s, a, l), n(i)) { const t = Object.keys(i)[0], s = i[t]; g = d[t].getPixelForValue(s) + m - e } else g = "center" === i ? (c.bottom + c.top) / 2 + m - e : Vs(t, i, e); u = l - a } else { if (n(i)) { const t = Object.keys(i)[0], s = i[t]; f = d[t].getPixelForValue(s) - b + e } else f = "center" === i ? (c.left + c.right) / 2 - b + e : Vs(t, i, e); g = ut(s, r, o), p = "left" === i ? -L : L } return { titleX: f, titleY: g, maxWidth: u, rotation: p } }(this, h, e, l); Ae(t, i.text, 0, 0, a, { color: i.color, maxWidth: u, rotation: f, textAlign: Hs(l, e, o), textBaseline: "middle", translation: [c, d] }) } draw(t) { this._isVisible() && (this.drawBackground(), this.drawGrid(t), this.drawBorder(), this.drawTitle(), this.drawLabels(t)) } _layers() { const t = this.options, e = t.ticks && t.ticks.z || 0, i = r(t.grid && t.grid.z, -1); return this._isVisible() && this.draw === ${"$"}s.prototype.draw ? [{ z: i, draw: t => { this.drawBackground(), this.drawGrid(t), this.drawTitle() } }, { z: i + 1, draw: () => { this.drawBorder() } }, { z: e, draw: t => { this.drawLabels(t) } }] : [{ z: e, draw: t => { this.draw(t) } }] } getMatchingVisibleMetas(t) { const e = this.chart.getSortedVisibleDatasetMetas(), i = this.axis + "AxisID", s = []; let n, o; for (n = 0, o = e.length; n < o; ++n) { const o = e[n]; o[i] !== this.id || t && o.type !== t || s.push(o) } return s } _resolveTickFontOptions(t) { return mi(this.options.ticks.setContext(this.getContext(t)).font) } _maxDigits() { const t = this._resolveTickFontOptions(0).lineHeight; return (this.isHorizontal() ? this.width : this.height) / t } } class Ys { constructor(t, e, i) { this.type = t, this.scope = e, this.override = i, this.items = Object.create(null) } isForType(t) { return Object.prototype.isPrototypeOf.call(this.type.prototype, t.prototype) } register(t) { const e = Object.getPrototypeOf(t); let i; (function (t) { return "id" in t && "defaults" in t })(e) && (i = this.register(e)); const s = this.items, n = t.id, o = this.scope + "." + n; if (!n) throw new Error("class does not have id: " + t); return n in s || (s[n] = t, function (t, e, i) { const s = m(Object.create(null), [i ? ne.get(i) : {}, ne.get(e), t.defaults]); ne.set(e, s), t.defaultRoutes && function (t, e) { Object.keys(e).forEach((i => { const s = i.split("."), n = s.pop(), o = [t].concat(s).join("."), a = e[i].split("."), r = a.pop(), l = a.join("."); ne.route(o, n, l, r) })) }(e, t.defaultRoutes); t.descriptors && ne.describe(e, t.descriptors) }(t, o, i), this.override && ne.override(t.id, t.overrides)), o } get(t) { return this.items[t] } unregister(t) { const e = this.items, i = t.id, s = this.scope; i in e && delete e[i], s && i in ne[s] && (delete ne[s][i], this.override && delete te[i]) } } var Us = new class { constructor() { this.controllers = new Ys(Ls, "datasets", !0), this.elements = new Ys(Es, "elements"), this.plugins = new Ys(Object, "plugins"), this.scales = new Ys(${"$"}s, "scales"), this._typedRegistries = [this.controllers, this.scales, this.elements] } add(...t) { this._each("register", t) } remove(...t) { this._each("unregister", t) } addControllers(...t) { this._each("register", t, this.controllers) } addElements(...t) { this._each("register", t, this.elements) } addPlugins(...t) { this._each("register", t, this.plugins) } addScales(...t) { this._each("register", t, this.scales) } getController(t) { return this._get(t, this.controllers, "controller") } getElement(t) { return this._get(t, this.elements, "element") } getPlugin(t) { return this._get(t, this.plugins, "plugin") } getScale(t) { return this._get(t, this.scales, "scale") } removeControllers(...t) { this._each("unregister", t, this.controllers) } removeElements(...t) { this._each("unregister", t, this.elements) } removePlugins(...t) { this._each("unregister", t, this.plugins) } removeScales(...t) { this._each("unregister", t, this.scales) } _each(t, e, i) { [...e].forEach((e => { const s = i || this._getRegistryForType(e); i || s.isForType(e) || s === this.plugins && e.id ? this._exec(t, s, e) : d(e, (e => { const s = i || this._getRegistryForType(e); this._exec(t, s, e) })) })) } _exec(t, e, i) { const s = w(t); c(i["before" + s], [], i), e[t](i), c(i["after" + s], [], i) } _getRegistryForType(t) { for (let e = 0; e < this._typedRegistries.length; e++) { const i = this._typedRegistries[e]; if (i.isForType(t)) return i } return this.plugins } _get(t, e, i) { const s = e.get(t); if (void 0 === s) throw new Error('"' + t + '" is not a registered ' + i + "."); return s } }; class Xs { constructor() { this._init = [] } notify(t, e, i, s) { "beforeInit" === e && (this._init = this._createDescriptors(t, !0), this._notify(this._init, t, "install")); const n = s ? this._descriptors(t).filter(s) : this._descriptors(t), o = this._notify(n, t, e, i); return "afterDestroy" === e && (this._notify(n, t, "stop"), this._notify(this._init, t, "uninstall")), o } _notify(t, e, i, s) { s = s || {}; for (const n of t) { const t = n.plugin; if (!1 === c(t[i], [e, s, n.options], t) && s.cancelable) return !1 } return !0 } invalidate() { i(this._cache) || (this._oldCache = this._cache, this._cache = void 0) } _descriptors(t) { if (this._cache) return this._cache; const e = this._cache = this._createDescriptors(t); return this._notifyStateChanges(t), e } _createDescriptors(t, e) { const i = t && t.config, s = r(i.options && i.options.plugins, {}), n = function (t) { const e = {}, i = [], s = Object.keys(Us.plugins.items); for (let t = 0; t < s.length; t++)i.push(Us.getPlugin(s[t])); const n = t.plugins || []; for (let t = 0; t < n.length; t++) { const s = n[t]; -1 === i.indexOf(s) && (i.push(s), e[s.id] = !0) } return { plugins: i, localIds: e } }(i); return !1 !== s || e ? function (t, { plugins: e, localIds: i }, s, n) { const o = [], a = t.getContext(); for (const r of e) { const e = r.id, l = qs(s[e], n); null !== l && o.push({ plugin: r, options: Ks(t.config, { plugin: r, local: i[e] }, l, a) }) } return o }(t, n, s, e) : [] } _notifyStateChanges(t) { const e = this._oldCache || [], i = this._cache, s = (t, e) => t.filter((t => !e.some((e => t.plugin.id === e.plugin.id)))); this._notify(s(e, i), t, "stop"), this._notify(s(i, e), t, "start") } } function qs(t, e) { return e || !1 !== t ? !0 === t ? {} : t : null } function Ks(t, { plugin: e, local: i }, s, n) { const o = t.pluginScopeKeys(e), a = t.getOptionScopes(s, o); return i && e.defaults && a.push(e.defaults), t.createResolver(a, n, [""], { scriptable: !1, indexable: !1, allKeys: !0 }) } function Gs(t, e) { const i = ne.datasets[t] || {}; return ((e.datasets || {})[t] || {}).indexAxis || e.indexAxis || i.indexAxis || "x" } function Zs(t, e) { return "x" === t || "y" === t ? t : e.axis || ("top" === (i = e.position) || "bottom" === i ? "x" : "left" === i || "right" === i ? "y" : void 0) || t.charAt(0).toLowerCase(); var i } function Js(t) { const e = t.options || (t.options = {}); e.plugins = r(e.plugins, {}), e.scales = function (t, e) { const i = te[t.type] || { scales: {} }, s = e.scales || {}, o = Gs(t.type, e), a = Object.create(null), r = Object.create(null); return Object.keys(s).forEach((t => { const e = s[t]; if (!n(e)) return console.error(`Invalid scale configuration for scale: ${"$"}{t}`); if (e._proxy) return console.warn(`Ignoring resolver passed as options for scale: ${"$"}{t}`); const l = Zs(t, e), h = function (t, e) { return t === e ? "_index_" : "_value_" }(l, o), c = i.scales || {}; a[l] = a[l] || t, r[t] = b(Object.create(null), [{ axis: l }, e, c[l], c[h]]) })), t.data.datasets.forEach((i => { const n = i.type || t.type, o = i.indexAxis || Gs(n, e), l = (te[n] || {}).scales || {}; Object.keys(l).forEach((t => { const e = function (t, e) { let i = t; return "_index_" === t ? i = e : "_value_" === t && (i = "x" === e ? "y" : "x"), i }(t, o), n = i[e + "AxisID"] || a[e] || e; r[n] = r[n] || Object.create(null), b(r[n], [{ axis: e }, s[n], l[t]]) })) })), Object.keys(r).forEach((t => { const e = r[t]; b(e, [ne.scales[e.type], ne.scale]) })), r }(t, e) } function Qs(t) { return (t = t || {}).datasets = t.datasets || [], t.labels = t.labels || [], t } const tn = new Map, en = new Set; function sn(t, e) { let i = tn.get(t); return i || (i = e(), tn.set(t, i), en.add(i)), i } const nn = (t, e, i) => { const s = y(e, i); void 0 !== s && t.add(s) }; class on { constructor(t) { this._config = function (t) { return (t = t || {}).data = Qs(t.data), Js(t), t }(t), this._scopeCache = new Map, this._resolverCache = new Map } get platform() { return this._config.platform } get type() { return this._config.type } set type(t) { this._config.type = t } get data() { return this._config.data } set data(t) { this._config.data = Qs(t) } get options() { return this._config.options } set options(t) { this._config.options = t } get plugins() { return this._config.plugins } update() { const t = this._config; this.clearCache(), Js(t) } clearCache() { this._scopeCache.clear(), this._resolverCache.clear() } datasetScopeKeys(t) { return sn(t, (() => [[`datasets.${"$"}{t}`, ""]])) } datasetAnimationScopeKeys(t, e) { return sn(`${"$"}{t}.transition.${"$"}{e}`, (() => [[`datasets.${"$"}{t}.transitions.${"$"}{e}`, `transitions.${"$"}{e}`], [`datasets.${"$"}{t}`, ""]])) } datasetElementScopeKeys(t, e) { return sn(`${"$"}{t}-${"$"}{e}`, (() => [[`datasets.${"$"}{t}.elements.${"$"}{e}`, `datasets.${"$"}{t}`, `elements.${"$"}{e}`, ""]])) } pluginScopeKeys(t) { const e = t.id; return sn(`${"$"}{this.type}-plugin-${"$"}{e}`, (() => [[`plugins.${"$"}{e}`, ...t.additionalOptionScopes || []]])) } _cachedScopes(t, e) { const i = this._scopeCache; let s = i.get(t); return s && !e || (s = new Map, i.set(t, s)), s } getOptionScopes(t, e, i) { const { options: s, type: n } = this, o = this._cachedScopes(t, i), a = o.get(e); if (a) return a; const r = new Set; e.forEach((e => { t && (r.add(t), e.forEach((e => nn(r, t, e)))), e.forEach((t => nn(r, s, t))), e.forEach((t => nn(r, te[n] || {}, t))), e.forEach((t => nn(r, ne, t))), e.forEach((t => nn(r, ee, t))) })); const l = Array.from(r); return 0 === l.length && l.push(Object.create(null)), en.has(e) && o.set(e, l), l } chartOptionScopes() { const { options: t, type: e } = this; return [t, te[e] || {}, ne.datasets[e] || {}, { type: e }, ne, ee] } resolveNamedOptions(t, e, i, n = [""]) { const o = { ${"$"}shared: !0 }, { resolver: a, subPrefixes: r } = an(this._resolverCache, t, n); let l = a; if (function (t, e) { const { isScriptable: i, isIndexable: n } = Ie(t); for (const o of e) { const e = i(o), a = n(o), r = (a || e) && t[o]; if (e && (k(r) || rn(r)) || a && s(r)) return !0 } return !1 }(a, e)) { o.${"$"}shared = !1; l = Re(a, i = k(i) ? i() : i, this.createResolver(t, i, r)) } for (const t of e) o[t] = l[t]; return o } createResolver(t, e, i = [""], s) { const { resolver: o } = an(this._resolverCache, t, i); return n(e) ? Re(o, e, void 0, s) : o } } function an(t, e, i) { let s = t.get(e); s || (s = new Map, t.set(e, s)); const n = i.join(); let o = s.get(n); if (!o) { o = { resolver: Ee(e, i), subPrefixes: i.filter((t => !t.toLowerCase().includes("hover"))) }, s.set(n, o) } return o } const rn = t => n(t) && Object.getOwnPropertyNames(t).reduce(((e, i) => e || k(t[i])), !1); const ln = ["top", "bottom", "left", "right", "chartArea"]; function hn(t, e) { return "top" === t || "bottom" === t || -1 === ln.indexOf(t) && "x" === e } function cn(t, e) { return function (i, s) { return i[t] === s[t] ? i[e] - s[e] : i[t] - s[t] } } function dn(t) { const e = t.chart, i = e.options.animation; e.notifyPlugins("afterRender"), c(i && i.onComplete, [t], e) } function un(t) { const e = t.chart, i = e.options.animation; c(i && i.onProgress, [t], e) } function fn(t) { return oe() && "string" == typeof t ? t = document.getElementById(t) : t && t.length && (t = t[0]), t && t.canvas && (t = t.canvas), t } const gn = {}, pn = t => { const e = fn(t); return Object.values(gn).filter((t => t.canvas === e)).pop() }; function mn(t, e, i) { const s = Object.keys(t); for (const n of s) { const s = +n; if (s >= e) { const o = t[n]; delete t[n], (i > 0 || s > e) && (t[s + i] = o) } } } class bn { constructor(t, i) { const s = this.config = new on(i), n = fn(t), o = pn(n); if (o) throw new Error("Canvas is already in use. Chart with ID '" + o.id + "' must be destroyed before the canvas with ID '" + o.canvas.id + "' can be reused."); const a = s.createResolver(s.chartOptionScopes(), this.getContext()); this.platform = new (s.platform || gs(n)), this.platform.updateConfig(s); const r = this.platform.acquireContext(n, a.aspectRatio), l = r && r.canvas, h = l && l.height, c = l && l.width; this.id = e(), this.ctx = r, this.canvas = l, this.width = c, this.height = h, this._options = a, this._aspectRatio = this.aspectRatio, this._layers = [], this._metasets = [], this._stacks = void 0, this.boxes = [], this.currentDevicePixelRatio = void 0, this.chartArea = void 0, this._active = [], this._lastEvent = void 0, this._listeners = {}, this._responsiveListeners = void 0, this._sortedMetasets = [], this.scales = {}, this._plugins = new Xs, this.${"$"}proxies = {}, this._hiddenIndices = {}, this.attached = !1, this._animationsDisabled = void 0, this.${"$"}context = void 0, this._doResize = ct((t => this.update(t)), a.resizeDelay || 0), this._dataChanges = [], gn[this.id] = this, r && l ? (mt.listen(this, "complete", dn), mt.listen(this, "progress", un), this._initialize(), this.attached && this.update()) : console.error("Failed to create chart: can't acquire context from the given item") } get aspectRatio() { const { options: { aspectRatio: t, maintainAspectRatio: e }, width: s, height: n, _aspectRatio: o } = this; return i(t) ? e && o ? o : n ? s / n : null : t } get data() { return this.config.data } set data(t) { this.config.data = t } get options() { return this._options } set options(t) { this.config.options = t } _initialize() { return this.notifyPlugins("beforeInit"), this.options.responsive ? this.resize() : pe(this, this.options.devicePixelRatio), this.bindEvents(), this.notifyPlugins("afterInit"), this } clear() { return we(this.canvas, this.ctx), this } stop() { return mt.stop(this), this } resize(t, e) { mt.running(this) ? this._resizeBeforeDraw = { width: t, height: e } : this._resize(t, e) } _resize(t, e) { const i = this.options, s = this.canvas, n = i.maintainAspectRatio && this.aspectRatio, o = this.platform.getMaximumSize(s, t, e, n), a = i.devicePixelRatio || this.platform.getDevicePixelRatio(), r = this.width ? "resize" : "attach"; this.width = o.width, this.height = o.height, this._aspectRatio = this.aspectRatio, pe(this, a, !0) && (this.notifyPlugins("resize", { size: o }), c(i.onResize, [this, o], this), this.attached && this._doResize(r) && this.render()) } ensureScalesHaveIDs() { d(this.options.scales || {}, ((t, e) => { t.id = e })) } buildOrUpdateScales() { const t = this.options, e = t.scales, i = this.scales, s = Object.keys(i).reduce(((t, e) => (t[e] = !1, t)), {}); let n = []; e && (n = n.concat(Object.keys(e).map((t => { const i = e[t], s = Zs(t, i), n = "r" === s, o = "x" === s; return { options: i, dposition: n ? "chartArea" : o ? "bottom" : "left", dtype: n ? "radialLinear" : o ? "category" : "linear" } })))), d(n, (e => { const n = e.options, o = n.id, a = Zs(o, n), l = r(n.type, e.dtype); void 0 !== n.position && hn(n.position, a) === hn(e.dposition) || (n.position = e.dposition), s[o] = !0; let h = null; if (o in i && i[o].type === l) h = i[o]; else { h = new (Us.getScale(l))({ id: o, type: l, ctx: this.ctx, chart: this }), i[h.id] = h } h.init(n, t) })), d(s, ((t, e) => { t || delete i[e] })), d(i, (t => { Zi.configure(this, t, t.options), Zi.addBox(this, t) })) } _updateMetasets() { const t = this._metasets, e = this.data.datasets.length, i = t.length; if (t.sort(((t, e) => t.index - e.index)), i > e) { for (let t = e; t < i; ++t)this._destroyDatasetMeta(t); t.splice(e, i - e) } this._sortedMetasets = t.slice(0).sort(cn("order", "index")) } _removeUnreferencedMetasets() { const { _metasets: t, data: { datasets: e } } = this; t.length > e.length && delete this._stacks, t.forEach(((t, i) => { 0 === e.filter((e => e === t._dataset)).length && this._destroyDatasetMeta(i) })) } buildOrUpdateControllers() { const t = [], e = this.data.datasets; let i, s; for (this._removeUnreferencedMetasets(), i = 0, s = e.length; i < s; i++) { const s = e[i]; let n = this.getDatasetMeta(i); const o = s.type || this.config.type; if (n.type && n.type !== o && (this._destroyDatasetMeta(i), n = this.getDatasetMeta(i)), n.type = o, n.indexAxis = s.indexAxis || Gs(o, this.options), n.order = s.order || 0, n.index = i, n.label = "" + s.label, n.visible = this.isDatasetVisible(i), n.controller) n.controller.updateIndex(i), n.controller.linkScales(); else { const e = Us.getController(o), { datasetElementType: s, dataElementType: a } = ne.datasets[o]; Object.assign(e.prototype, { dataElementType: Us.getElement(a), datasetElementType: s && Us.getElement(s) }), n.controller = new e(this, i), t.push(n.controller) } } return this._updateMetasets(), t } _resetElements() { d(this.data.datasets, ((t, e) => { this.getDatasetMeta(e).controller.reset() }), this) } reset() { this._resetElements(), this.notifyPlugins("reset") } update(t) { const e = this.config; e.update(); const i = this._options = e.createResolver(e.chartOptionScopes(), this.getContext()), s = this._animationsDisabled = !i.animation; if (this._updateScales(), this._checkEventBindings(), this._updateHiddenIndices(), this._plugins.invalidate(), !1 === this.notifyPlugins("beforeUpdate", { mode: t, cancelable: !0 })) return; const n = this.buildOrUpdateControllers(); this.notifyPlugins("beforeElementsUpdate"); let o = 0; for (let t = 0, e = this.data.datasets.length; t < e; t++) { const { controller: e } = this.getDatasetMeta(t), i = !s && -1 === n.indexOf(e); e.buildOrUpdateElements(i), o = Math.max(+e.getMaxOverflow(), o) } o = this._minPadding = i.layout.autoPadding ? o : 0, this._updateLayout(o), s || d(n, (t => { t.reset() })), this._updateDatasets(t), this.notifyPlugins("afterUpdate", { mode: t }), this._layers.sort(cn("z", "_idx")); const { _active: a, _lastEvent: r } = this; r ? this._eventHandler(r, !0) : a.length && this._updateHoverStyles(a, a, !0), this.render() } _updateScales() { d(this.scales, (t => { Zi.removeBox(this, t) })), this.ensureScalesHaveIDs(), this.buildOrUpdateScales() } _checkEventBindings() { const t = this.options, e = new Set(Object.keys(this._listeners)), i = new Set(t.events); S(e, i) && !!this._responsiveListeners === t.responsive || (this.unbindEvents(), this.bindEvents()) } _updateHiddenIndices() { const { _hiddenIndices: t } = this, e = this._getUniformDataChanges() || []; for (const { method: i, start: s, count: n } of e) { mn(t, s, "_removeElements" === i ? -n : n) } } _getUniformDataChanges() { const t = this._dataChanges; if (!t || !t.length) return; this._dataChanges = []; const e = this.data.datasets.length, i = e => new Set(t.filter((t => t[0] === e)).map(((t, e) => e + "," + t.splice(1).join(",")))), s = i(0); for (let t = 1; t < e; t++)if (!S(s, i(t))) return; return Array.from(s).map((t => t.split(","))).map((t => ({ method: t[1], start: +t[2], count: +t[3] }))) } _updateLayout(t) { if (!1 === this.notifyPlugins("beforeLayout", { cancelable: !0 })) return; Zi.update(this, this.width, this.height, t); const e = this.chartArea, i = e.width <= 0 || e.height <= 0; this._layers = [], d(this.boxes, (t => { i && "chartArea" === t.position || (t.configure && t.configure(), this._layers.push(...t._layers())) }), this), this._layers.forEach(((t, e) => { t._idx = e })), this.notifyPlugins("afterLayout") } _updateDatasets(t) { if (!1 !== this.notifyPlugins("beforeDatasetsUpdate", { mode: t, cancelable: !0 })) { for (let t = 0, e = this.data.datasets.length; t < e; ++t)this.getDatasetMeta(t).controller.configure(); for (let e = 0, i = this.data.datasets.length; e < i; ++e)this._updateDataset(e, k(t) ? t({ datasetIndex: e }) : t); this.notifyPlugins("afterDatasetsUpdate", { mode: t }) } } _updateDataset(t, e) { const i = this.getDatasetMeta(t), s = { meta: i, index: t, mode: e, cancelable: !0 }; !1 !== this.notifyPlugins("beforeDatasetUpdate", s) && (i.controller._update(e), s.cancelable = !1, this.notifyPlugins("afterDatasetUpdate", s)) } render() { !1 !== this.notifyPlugins("beforeRender", { cancelable: !0 }) && (mt.has(this) ? this.attached && !mt.running(this) && mt.start(this) : (this.draw(), dn({ chart: this }))) } draw() { let t; if (this._resizeBeforeDraw) { const { width: t, height: e } = this._resizeBeforeDraw; this._resize(t, e), this._resizeBeforeDraw = null } if (this.clear(), this.width <= 0 || this.height <= 0) return; if (!1 === this.notifyPlugins("beforeDraw", { cancelable: !0 })) return; const e = this._layers; for (t = 0; t < e.length && e[t].z <= 0; ++t)e[t].draw(this.chartArea); for (this._drawDatasets(); t < e.length; ++t)e[t].draw(this.chartArea); this.notifyPlugins("afterDraw") } _getSortedDatasetMetas(t) { const e = this._sortedMetasets, i = []; let s, n; for (s = 0, n = e.length; s < n; ++s) { const n = e[s]; t && !n.visible || i.push(n) } return i } getSortedVisibleDatasetMetas() { return this._getSortedDatasetMetas(!0) } _drawDatasets() { if (!1 === this.notifyPlugins("beforeDatasetsDraw", { cancelable: !0 })) return; const t = this.getSortedVisibleDatasetMetas(); for (let e = t.length - 1; e >= 0; --e)this._drawDataset(t[e]); this.notifyPlugins("afterDatasetsDraw") } _drawDataset(t) { const e = this.ctx, i = t._clip, s = !i.disabled, n = this.chartArea, o = { meta: t, index: t.index, cancelable: !0 }; !1 !== this.notifyPlugins("beforeDatasetDraw", o) && (s && Pe(e, { left: !1 === i.left ? 0 : n.left - i.left, right: !1 === i.right ? this.width : n.right + i.right, top: !1 === i.top ? 0 : n.top - i.top, bottom: !1 === i.bottom ? this.height : n.bottom + i.bottom }), t.controller.draw(), s && De(e), o.cancelable = !1, this.notifyPlugins("afterDatasetDraw", o)) } isPointInArea(t) { return Se(t, this.chartArea, this._minPadding) } getElementsAtEventForMode(t, e, i, s) { const n = Vi.modes[e]; return "function" == typeof n ? n(this, t, i, s) : [] } getDatasetMeta(t) { const e = this.data.datasets[t], i = this._metasets; let s = i.filter((t => t && t._dataset === e)).pop(); return s || (s = { type: null, data: [], dataset: null, controller: null, hidden: null, xAxisID: null, yAxisID: null, order: e && e.order || 0, index: t, _dataset: e, _parsed: [], _sorted: !1 }, i.push(s)), s } getContext() { return this.${"$"}context || (this.${"$"}context = _i(null, { chart: this, type: "chart" })) } getVisibleDatasetCount() { return this.getSortedVisibleDatasetMetas().length } isDatasetVisible(t) { const e = this.data.datasets[t]; if (!e) return !1; const i = this.getDatasetMeta(t); return "boolean" == typeof i.hidden ? !i.hidden : !e.hidden } setDatasetVisibility(t, e) { this.getDatasetMeta(t).hidden = !e } toggleDataVisibility(t) { this._hiddenIndices[t] = !this._hiddenIndices[t] } getDataVisibility(t) { return !this._hiddenIndices[t] } _updateVisibility(t, e, i) { const s = i ? "show" : "hide", n = this.getDatasetMeta(t), o = n.controller._resolveAnimations(void 0, s); M(e) ? (n.data[e].hidden = !i, this.update()) : (this.setDatasetVisibility(t, i), o.update(n, { visible: i }), this.update((e => e.datasetIndex === t ? s : void 0))) } hide(t, e) { this._updateVisibility(t, e, !1) } show(t, e) { this._updateVisibility(t, e, !0) } _destroyDatasetMeta(t) { const e = this._metasets[t]; e && e.controller && e.controller._destroy(), delete this._metasets[t] } _stop() { let t, e; for (this.stop(), mt.remove(this), t = 0, e = this.data.datasets.length; t < e; ++t)this._destroyDatasetMeta(t) } destroy() { this.notifyPlugins("beforeDestroy"); const { canvas: t, ctx: e } = this; this._stop(), this.config.clearCache(), t && (this.unbindEvents(), we(t, e), this.platform.releaseContext(e), this.canvas = null, this.ctx = null), this.notifyPlugins("destroy"), delete gn[this.id], this.notifyPlugins("afterDestroy") } toBase64Image(...t) { return this.canvas.toDataURL(...t) } bindEvents() { this.bindUserEvents(), this.options.responsive ? this.bindResponsiveEvents() : this.attached = !0 } bindUserEvents() { const t = this._listeners, e = this.platform, i = (i, s) => { e.addEventListener(this, i, s), t[i] = s }, s = (t, e, i) => { t.offsetX = e, t.offsetY = i, this._eventHandler(t) }; d(this.options.events, (t => i(t, s))) } bindResponsiveEvents() { this._responsiveListeners || (this._responsiveListeners = {}); const t = this._responsiveListeners, e = this.platform, i = (i, s) => { e.addEventListener(this, i, s), t[i] = s }, s = (i, s) => { t[i] && (e.removeEventListener(this, i, s), delete t[i]) }, n = (t, e) => { this.canvas && this.resize(t, e) }; let o; const a = () => { s("attach", a), this.attached = !0, this.resize(), i("resize", n), i("detach", o) }; o = () => { this.attached = !1, s("resize", n), this._stop(), this._resize(0, 0), i("attach", a) }, e.isAttached(this.canvas) ? a() : o() } unbindEvents() { d(this._listeners, ((t, e) => { this.platform.removeEventListener(this, e, t) })), this._listeners = {}, d(this._responsiveListeners, ((t, e) => { this.platform.removeEventListener(this, e, t) })), this._responsiveListeners = void 0 } updateHoverStyle(t, e, i) { const s = i ? "set" : "remove"; let n, o, a, r; for ("dataset" === e && (n = this.getDatasetMeta(t[0].datasetIndex), n.controller["_" + s + "DatasetHoverStyle"]()), a = 0, r = t.length; a < r; ++a) { o = t[a]; const e = o && this.getDatasetMeta(o.datasetIndex).controller; e && e[s + "HoverStyle"](o.element, o.datasetIndex, o.index) } } getActiveElements() { return this._active || [] } setActiveElements(t) { const e = this._active || [], i = t.map((({ datasetIndex: t, index: e }) => { const i = this.getDatasetMeta(t); if (!i) throw new Error("No dataset found at index " + t); return { datasetIndex: t, element: i.data[e], index: e } })); !u(i, e) && (this._active = i, this._lastEvent = null, this._updateHoverStyles(i, e)) } notifyPlugins(t, e, i) { return this._plugins.notify(this, t, e, i) } _updateHoverStyles(t, e, i) { const s = this.options.hover, n = (t, e) => t.filter((t => !e.some((e => t.datasetIndex === e.datasetIndex && t.index === e.index)))), o = n(e, t), a = i ? t : n(t, e); o.length && this.updateHoverStyle(o, s.mode, !1), a.length && s.mode && this.updateHoverStyle(a, s.mode, !0) } _eventHandler(t, e) { const i = { event: t, replay: e, cancelable: !0, inChartArea: this.isPointInArea(t) }, s = e => (e.options.events || this.options.events).includes(t.native.type); if (!1 === this.notifyPlugins("beforeEvent", i, s)) return; const n = this._handleEvent(t, e, i.inChartArea); return i.cancelable = !1, this.notifyPlugins("afterEvent", i, s), (n || i.changed) && this.render(), this } _handleEvent(t, e, i) { const { _active: s = [], options: n } = this, o = e, a = this._getActiveElements(t, s, i, o), r = P(t), l = function (t, e, i, s) { return i && "mouseout" !== t.type ? s ? e : t : null }(t, this._lastEvent, i, r); i && (this._lastEvent = null, c(n.onHover, [t, a, this], this), r && c(n.onClick, [t, a, this], this)); const h = !u(a, s); return (h || e) && (this._active = a, this._updateHoverStyles(a, s, e)), this._lastEvent = l, h } _getActiveElements(t, e, i, s) { if ("mouseout" === t.type) return []; if (!i) return e; const n = this.options.hover; return this.getElementsAtEventForMode(t, n.mode, n, s) } } const xn = () => d(bn.instances, (t => t._plugins.invalidate())), _n = !0; function yn() { throw new Error("This method is not implemented: Check that a complete date adapter is provided.") } Object.defineProperties(bn, { defaults: { enumerable: _n, value: ne }, instances: { enumerable: _n, value: gn }, overrides: { enumerable: _n, value: te }, registry: { enumerable: _n, value: Us }, version: { enumerable: _n, value: "3.9.0" }, getChart: { enumerable: _n, value: pn }, register: { enumerable: _n, value: (...t) => { Us.add(...t), xn() } }, unregister: { enumerable: _n, value: (...t) => { Us.remove(...t), xn() } } }); class vn { constructor(t) { this.options = t || {} } init(t) { } formats() { return yn() } parse(t, e) { return yn() } format(t, e) { return yn() } add(t, e, i) { return yn() } diff(t, e, i) { return yn() } startOf(t, e, i) { return yn() } endOf(t, e) { return yn() } } vn.override = function (t) { Object.assign(vn.prototype, t) }; var wn = { _date: vn }; function Mn(t) { const e = t.iScale, i = function (t, e) { if (!t._cache.${"$"}bar) { const i = t.getMatchingVisibleMetas(e); let s = []; for (let e = 0, n = i.length; e < n; e++)s = s.concat(i[e].controller.getAllParsedValues(t)); t._cache.${"$"}bar = rt(s.sort(((t, e) => t - e))) } return t._cache.${"$"}bar }(e, t.type); let s, n, o, a, r = e._length; const l = () => { 32767 !== o && -32768 !== o && (M(a) && (r = Math.min(r, Math.abs(o - a) || r)), a = o) }; for (s = 0, n = i.length; s < n; ++s)o = e.getPixelForValue(i[s]), l(); for (a = void 0, s = 0, n = e.ticks.length; s < n; ++s)o = e.getPixelForTick(s), l(); return r } function kn(t, e, i, n) { return s(t) ? function (t, e, i, s) { const n = i.parse(t[0], s), o = i.parse(t[1], s), a = Math.min(n, o), r = Math.max(n, o); let l = a, h = r; Math.abs(a) > Math.abs(r) && (l = r, h = a), e[i.axis] = h, e._custom = { barStart: l, barEnd: h, start: n, end: o, min: a, max: r } }(t, e, i, n) : e[i.axis] = i.parse(t, n), e } function Sn(t, e, i, s) { const n = t.iScale, o = t.vScale, a = n.getLabels(), r = n === o, l = []; let h, c, d, u; for (h = i, c = i + s; h < c; ++h)u = e[h], d = {}, d[n.axis] = r || n.parse(a[h], h), l.push(kn(u, d, o, h)); return l } function Pn(t) { return t && void 0 !== t.barStart && void 0 !== t.barEnd } function Dn(t, e, i, s) { let n = e.borderSkipped; const o = {}; if (!n) return void (t.borderSkipped = o); if (!0 === n) return void (t.borderSkipped = { top: !0, right: !0, bottom: !0, left: !0 }); const { start: a, end: r, reverse: l, top: h, bottom: c } = function (t) { let e, i, s, n, o; return t.horizontal ? (e = t.base > t.x, i = "left", s = "right") : (e = t.base < t.y, i = "bottom", s = "top"), e ? (n = "end", o = "start") : (n = "start", o = "end"), { start: i, end: s, reverse: e, top: n, bottom: o } }(t); "middle" === n && i && (t.enableBorderRadius = !0, (i._top || 0) === s ? n = h : (i._bottom || 0) === s ? n = c : (o[On(c, a, r, l)] = !0, n = h)), o[On(n, a, r, l)] = !0, t.borderSkipped = o } function On(t, e, i, s) { var n, o, a; return s ? (a = i, t = Cn(t = (n = t) === (o = e) ? a : n === a ? o : n, i, e)) : t = Cn(t, e, i), t } function Cn(t, e, i) { return "start" === t ? e : "end" === t ? i : t } function An(t, { inflateAmount: e }, i) { t.inflateAmount = "auto" === e ? 1 === i ? .33 : 0 : e } class Tn extends Ls { parsePrimitiveData(t, e, i, s) { return Sn(t, e, i, s) } parseArrayData(t, e, i, s) { return Sn(t, e, i, s) } parseObjectData(t, e, i, s) { const { iScale: n, vScale: o } = t, { xAxisKey: a = "x", yAxisKey: r = "y" } = this._parsing, l = "x" === n.axis ? a : r, h = "x" === o.axis ? a : r, c = []; let d, u, f, g; for (d = i, u = i + s; d < u; ++d)g = e[d], f = {}, f[n.axis] = n.parse(y(g, l), d), c.push(kn(y(g, h), f, o, d)); return c } updateRangeFromParsed(t, e, i, s) { super.updateRangeFromParsed(t, e, i, s); const n = i._custom; n && e === this._cachedMeta.vScale && (t.min = Math.min(t.min, n.min), t.max = Math.max(t.max, n.max)) } getMaxOverflow() { return 0 } getLabelAndValue(t) { const e = this._cachedMeta, { iScale: i, vScale: s } = e, n = this.getParsed(t), o = n._custom, a = Pn(o) ? "[" + o.start + ", " + o.end + "]" : "" + s.getLabelForValue(n[s.axis]); return { label: "" + i.getLabelForValue(n[i.axis]), value: a } } initialize() { this.enableOptionSharing = !0, super.initialize(); this._cachedMeta.stack = this.getDataset().stack } update(t) { const e = this._cachedMeta; this.updateElements(e.data, 0, e.data.length, t) } updateElements(t, e, s, n) { const o = "reset" === n, { index: a, _cachedMeta: { vScale: r } } = this, l = r.getBasePixel(), h = r.isHorizontal(), c = this._getRuler(), { sharedOptions: d, includeOptions: u } = this._getSharedOptions(e, n); for (let f = e; f < e + s; f++) { const e = this.getParsed(f), s = o || i(e[r.axis]) ? { base: l, head: l } : this._calculateBarValuePixels(f), g = this._calculateBarIndexPixels(f, c), p = (e._stacks || {})[r.axis], m = { horizontal: h, base: s.base, enableBorderRadius: !p || Pn(e._custom) || a === p._top || a === p._bottom, x: h ? s.head : g.center, y: h ? g.center : s.head, height: h ? g.size : Math.abs(s.size), width: h ? Math.abs(s.size) : g.size }; u && (m.options = d || this.resolveDataElementOptions(f, t[f].active ? "active" : n)); const b = m.options || t[f].options; Dn(m, b, p, a), An(m, b, c.ratio), this.updateElement(t[f], f, m, n) } } _getStacks(t, e) { const { iScale: s } = this._cachedMeta, n = s.getMatchingVisibleMetas(this._type).filter((t => t.controller.options.grouped)), o = s.options.stacked, a = [], r = t => { const s = t.controller.getParsed(e), n = s && s[t.vScale.axis]; if (i(n) || isNaN(n)) return !0 }; for (const i of n) if ((void 0 === e || !r(i)) && ((!1 === o || -1 === a.indexOf(i.stack) || void 0 === o && void 0 === i.stack) && a.push(i.stack), i.index === t)) break; return a.length || a.push(void 0), a } _getStackCount(t) { return this._getStacks(void 0, t).length } _getStackIndex(t, e, i) { const s = this._getStacks(t, i), n = void 0 !== e ? s.indexOf(e) : -1; return -1 === n ? s.length - 1 : n } _getRuler() { const t = this.options, e = this._cachedMeta, i = e.iScale, s = []; let n, o; for (n = 0, o = e.data.length; n < o; ++n)s.push(i.getPixelForValue(this.getParsed(n)[i.axis], n)); const a = t.barThickness; return { min: a || Mn(e), pixels: s, start: i._startPixel, end: i._endPixel, stackCount: this._getStackCount(), scale: i, grouped: t.grouped, ratio: a ? 1 : t.categoryPercentage * t.barPercentage } } _calculateBarValuePixels(t) { const { _cachedMeta: { vScale: e, _stacked: s }, options: { base: n, minBarLength: o } } = this, a = n || 0, r = this.getParsed(t), l = r._custom, h = Pn(l); let c, d, u = r[e.axis], f = 0, g = s ? this.applyStack(e, r, s) : u; g !== u && (f = g - u, g = u), h && (u = l.barStart, g = l.barEnd - l.barStart, 0 !== u && z(u) !== z(l.barEnd) && (f = 0), f += u); const p = i(n) || h ? f : n; let m = e.getPixelForValue(p); if (c = this.chart.getDataVisibility(t) ? e.getPixelForValue(f + g) : m, d = c - m, Math.abs(d) < o) { d = function (t, e, i) { return 0 !== t ? z(t) : (e.isHorizontal() ? 1 : -1) * (e.min >= i ? 1 : -1) }(d, e, a) * o, u === a && (m -= d / 2); const t = e.getPixelForDecimal(0), i = e.getPixelForDecimal(1), s = Math.min(t, i), n = Math.max(t, i); m = Math.max(Math.min(m, n), s), c = m + d } if (m === e.getPixelForValue(a)) { const t = z(d) * e.getLineWidthForValue(a) / 2; m += t, d -= t } return { size: d, base: m, head: c, center: c + d / 2 } } _calculateBarIndexPixels(t, e) { const s = e.scale, n = this.options, o = n.skipNull, a = r(n.maxBarThickness, 1 / 0); let l, h; if (e.grouped) { const s = o ? this._getStackCount(t) : e.stackCount, r = "flex" === n.barThickness ? function (t, e, i, s) { const n = e.pixels, o = n[t]; let a = t > 0 ? n[t - 1] : null, r = t < n.length - 1 ? n[t + 1] : null; const l = i.categoryPercentage; null === a && (a = o - (null === r ? e.end - e.start : r - o)), null === r && (r = o + o - a); const h = o - (o - Math.min(a, r)) / 2 * l; return { chunk: Math.abs(r - a) / 2 * l / s, ratio: i.barPercentage, start: h } }(t, e, n, s) : function (t, e, s, n) { const o = s.barThickness; let a, r; return i(o) ? (a = e.min * s.categoryPercentage, r = s.barPercentage) : (a = o * n, r = 1), { chunk: a / n, ratio: r, start: e.pixels[t] - a / 2 } }(t, e, n, s), c = this._getStackIndex(this.index, this._cachedMeta.stack, o ? t : void 0); l = r.start + r.chunk * c + r.chunk / 2, h = Math.min(a, r.chunk * r.ratio) } else l = s.getPixelForValue(this.getParsed(t)[s.axis], t), h = Math.min(a, e.min * e.ratio); return { base: l - h / 2, head: l + h / 2, center: l, size: h } } draw() { const t = this._cachedMeta, e = t.vScale, i = t.data, s = i.length; let n = 0; for (; n < s; ++n)null !== this.getParsed(n)[e.axis] && i[n].draw(this._ctx) } } Tn.id = "bar", Tn.defaults = { datasetElementType: !1, dataElementType: "bar", categoryPercentage: .8, barPercentage: .9, grouped: !0, animations: { numbers: { type: "number", properties: ["x", "y", "base", "width", "height"] } } }, Tn.overrides = { scales: { _index_: { type: "category", offset: !0, grid: { offset: !0 } }, _value_: { type: "linear", beginAtZero: !0 } } }; class Ln extends Ls { initialize() { this.enableOptionSharing = !0, super.initialize() } parsePrimitiveData(t, e, i, s) { const n = super.parsePrimitiveData(t, e, i, s); for (let t = 0; t < n.length; t++)n[t]._custom = this.resolveDataElementOptions(t + i).radius; return n } parseArrayData(t, e, i, s) { const n = super.parseArrayData(t, e, i, s); for (let t = 0; t < n.length; t++) { const s = e[i + t]; n[t]._custom = r(s[2], this.resolveDataElementOptions(t + i).radius) } return n } parseObjectData(t, e, i, s) { const n = super.parseObjectData(t, e, i, s); for (let t = 0; t < n.length; t++) { const s = e[i + t]; n[t]._custom = r(s && s.r && +s.r, this.resolveDataElementOptions(t + i).radius) } return n } getMaxOverflow() { const t = this._cachedMeta.data; let e = 0; for (let i = t.length - 1; i >= 0; --i)e = Math.max(e, t[i].size(this.resolveDataElementOptions(i)) / 2); return e > 0 && e } getLabelAndValue(t) { const e = this._cachedMeta, { xScale: i, yScale: s } = e, n = this.getParsed(t), o = i.getLabelForValue(n.x), a = s.getLabelForValue(n.y), r = n._custom; return { label: e.label, value: "(" + o + ", " + a + (r ? ", " + r : "") + ")" } } update(t) { const e = this._cachedMeta.data; this.updateElements(e, 0, e.length, t) } updateElements(t, e, i, s) { const n = "reset" === s, { iScale: o, vScale: a } = this._cachedMeta, { sharedOptions: r, includeOptions: l } = this._getSharedOptions(e, s), h = o.axis, c = a.axis; for (let d = e; d < e + i; d++) { const e = t[d], i = !n && this.getParsed(d), u = {}, f = u[h] = n ? o.getPixelForDecimal(.5) : o.getPixelForValue(i[h]), g = u[c] = n ? a.getBasePixel() : a.getPixelForValue(i[c]); u.skip = isNaN(f) || isNaN(g), l && (u.options = r || this.resolveDataElementOptions(d, e.active ? "active" : s), n && (u.options.radius = 0)), this.updateElement(e, d, u, s) } } resolveDataElementOptions(t, e) { const i = this.getParsed(t); let s = super.resolveDataElementOptions(t, e); s.${"$"}shared && (s = Object.assign({}, s, { ${"$"}shared: !1 })); const n = s.radius; return "active" !== e && (s.radius = 0), s.radius += r(i && i._custom, n), s } } Ln.id = "bubble", Ln.defaults = { datasetElementType: !1, dataElementType: "point", animations: { numbers: { type: "number", properties: ["x", "y", "borderWidth", "radius"] } } }, Ln.overrides = { scales: { x: { type: "linear" }, y: { type: "linear" } }, plugins: { tooltip: { callbacks: { title: () => "" } } } }; class En extends Ls { constructor(t, e) { super(t, e), this.enableOptionSharing = !0, this.innerRadius = void 0, this.outerRadius = void 0, this.offsetX = void 0, this.offsetY = void 0 } linkScales() { } parse(t, e) { const i = this.getDataset().data, s = this._cachedMeta; if (!1 === this._parsing) s._parsed = i; else { let o, a, r = t => +i[t]; if (n(i[t])) { const { key: t = "value" } = this._parsing; r = e => +y(i[e], t) } for (o = t, a = t + e; o < a; ++o)s._parsed[o] = r(o) } } _getRotation() { return H(this.options.rotation - 90) } _getCircumference() { return H(this.options.circumference) } _getRotationExtents() { let t = O, e = -O; for (let i = 0; i < this.chart.data.datasets.length; ++i)if (this.chart.isDatasetVisible(i)) { const s = this.chart.getDatasetMeta(i).controller, n = s._getRotation(), o = s._getCircumference(); t = Math.min(t, n), e = Math.max(e, n + o) } return { rotation: t, circumference: e - t } } update(t) { const e = this.chart, { chartArea: i } = e, s = this._cachedMeta, n = s.data, o = this.getMaxBorderWidth() + this.getMaxOffset(n) + this.options.spacing, a = Math.max((Math.min(i.width, i.height) - o) / 2, 0), r = Math.min(l(this.options.cutout, a), 1), c = this._getRingWeight(this.index), { circumference: d, rotation: u } = this._getRotationExtents(), { ratioX: f, ratioY: g, offsetX: p, offsetY: m } = function (t, e, i) { let s = 1, n = 1, o = 0, a = 0; if (e < O) { const r = t, l = r + e, h = Math.cos(r), c = Math.sin(r), d = Math.cos(l), u = Math.sin(l), f = (t, e, s) => G(t, r, l, !0) ? 1 : Math.max(e, e * i, s, s * i), g = (t, e, s) => G(t, r, l, !0) ? -1 : Math.min(e, e * i, s, s * i), p = f(0, h, d), m = f(L, c, u), b = g(D, h, d), x = g(D + L, c, u); s = (p - b) / 2, n = (m - x) / 2, o = -(p + b) / 2, a = -(m + x) / 2 } return { ratioX: s, ratioY: n, offsetX: o, offsetY: a } }(u, d, r), b = (i.width - o) / f, x = (i.height - o) / g, _ = Math.max(Math.min(b, x) / 2, 0), y = h(this.options.radius, _), v = (y - Math.max(y * r, 0)) / this._getVisibleDatasetWeightTotal(); this.offsetX = p * y, this.offsetY = m * y, s.total = this.calculateTotal(), this.outerRadius = y - v * this._getRingWeightOffset(this.index), this.innerRadius = Math.max(this.outerRadius - v * c, 0), this.updateElements(n, 0, n.length, t) } _circumference(t, e) { const i = this.options, s = this._cachedMeta, n = this._getCircumference(); return e && i.animation.animateRotate || !this.chart.getDataVisibility(t) || null === s._parsed[t] || s.data[t].hidden ? 0 : this.calculateCircumference(s._parsed[t] * n / O) } updateElements(t, e, i, s) { const n = "reset" === s, o = this.chart, a = o.chartArea, r = o.options.animation, l = (a.left + a.right) / 2, h = (a.top + a.bottom) / 2, c = n && r.animateScale, d = c ? 0 : this.innerRadius, u = c ? 0 : this.outerRadius, { sharedOptions: f, includeOptions: g } = this._getSharedOptions(e, s); let p, m = this._getRotation(); for (p = 0; p < e; ++p)m += this._circumference(p, n); for (p = e; p < e + i; ++p) { const e = this._circumference(p, n), i = t[p], o = { x: l + this.offsetX, y: h + this.offsetY, startAngle: m, endAngle: m + e, circumference: e, outerRadius: u, innerRadius: d }; g && (o.options = f || this.resolveDataElementOptions(p, i.active ? "active" : s)), m += e, this.updateElement(i, p, o, s) } } calculateTotal() { const t = this._cachedMeta, e = t.data; let i, s = 0; for (i = 0; i < e.length; i++) { const n = t._parsed[i]; null === n || isNaN(n) || !this.chart.getDataVisibility(i) || e[i].hidden || (s += Math.abs(n)) } return s } calculateCircumference(t) { const e = this._cachedMeta.total; return e > 0 && !isNaN(t) ? O * (Math.abs(t) / e) : 0 } getLabelAndValue(t) { const e = this._cachedMeta, i = this.chart, s = i.data.labels || [], n = li(e._parsed[t], i.options.locale); return { label: s[t] || "", value: n } } getMaxBorderWidth(t) { let e = 0; const i = this.chart; let s, n, o, a, r; if (!t) for (s = 0, n = i.data.datasets.length; s < n; ++s)if (i.isDatasetVisible(s)) { o = i.getDatasetMeta(s), t = o.data, a = o.controller; break } if (!t) return 0; for (s = 0, n = t.length; s < n; ++s)r = a.resolveDataElementOptions(s), "inner" !== r.borderAlign && (e = Math.max(e, r.borderWidth || 0, r.hoverBorderWidth || 0)); return e } getMaxOffset(t) { let e = 0; for (let i = 0, s = t.length; i < s; ++i) { const t = this.resolveDataElementOptions(i); e = Math.max(e, t.offset || 0, t.hoverOffset || 0) } return e } _getRingWeightOffset(t) { let e = 0; for (let i = 0; i < t; ++i)this.chart.isDatasetVisible(i) && (e += this._getRingWeight(i)); return e } _getRingWeight(t) { return Math.max(r(this.chart.data.datasets[t].weight, 1), 0) } _getVisibleDatasetWeightTotal() { return this._getRingWeightOffset(this.chart.data.datasets.length) || 1 } } En.id = "doughnut", En.defaults = { datasetElementType: !1, dataElementType: "arc", animation: { animateRotate: !0, animateScale: !1 }, animations: { numbers: { type: "number", properties: ["circumference", "endAngle", "innerRadius", "outerRadius", "startAngle", "x", "y", "offset", "borderWidth", "spacing"] } }, cutout: "50%", rotation: 0, circumference: 360, radius: "100%", spacing: 0, indexAxis: "r" }, En.descriptors = { _scriptable: t => "spacing" !== t, _indexable: t => "spacing" !== t }, En.overrides = { aspectRatio: 1, plugins: { legend: { labels: { generateLabels(t) { const e = t.data; if (e.labels.length && e.datasets.length) { const { labels: { pointStyle: i } } = t.legend.options; return e.labels.map(((e, s) => { const n = t.getDatasetMeta(0).controller.getStyle(s); return { text: e, fillStyle: n.backgroundColor, strokeStyle: n.borderColor, lineWidth: n.borderWidth, pointStyle: i, hidden: !t.getDataVisibility(s), index: s } })) } return [] } }, onClick(t, e, i) { i.chart.toggleDataVisibility(e.index), i.chart.update() } }, tooltip: { callbacks: { title: () => "", label(t) { let e = t.label; const i = ": " + t.formattedValue; return s(e) ? (e = e.slice(), e[0] += i) : e += i, e } } } } }; class Rn extends Ls { initialize() { this.enableOptionSharing = !0, this.supportsDecimation = !0, super.initialize() } update(t) { const e = this._cachedMeta, { dataset: i, data: s = [], _dataset: n } = e, o = this.chart._animationsDisabled; let { start: a, count: r } = gt(e, s, o); this._drawStart = a, this._drawCount = r, pt(e) && (a = 0, r = s.length), i._chart = this.chart, i._datasetIndex = this.index, i._decimated = !!n._decimated, i.points = s; const l = this.resolveDatasetElementOptions(t); this.options.showLine || (l.borderWidth = 0), l.segment = this.options.segment, this.updateElement(i, void 0, { animated: !o, options: l }, t), this.updateElements(s, a, r, t) } updateElements(t, e, s, n) { const o = "reset" === n, { iScale: a, vScale: r, _stacked: l, _dataset: h } = this._cachedMeta, { sharedOptions: c, includeOptions: d } = this._getSharedOptions(e, n), u = a.axis, f = r.axis, { spanGaps: g, segment: p } = this.options, m = B(g) ? g : Number.POSITIVE_INFINITY, b = this.chart._animationsDisabled || o || "none" === n; let x = e > 0 && this.getParsed(e - 1); for (let g = e; g < e + s; ++g) { const e = t[g], s = this.getParsed(g), _ = b ? e : {}, y = i(s[f]), v = _[u] = a.getPixelForValue(s[u], g), w = _[f] = o || y ? r.getBasePixel() : r.getPixelForValue(l ? this.applyStack(r, s, l) : s[f], g); _.skip = isNaN(v) || isNaN(w) || y, _.stop = g > 0 && Math.abs(s[u] - x[u]) > m, p && (_.parsed = s, _.raw = h.data[g]), d && (_.options = c || this.resolveDataElementOptions(g, e.active ? "active" : n)), b || this.updateElement(e, g, _, n), x = s } } getMaxOverflow() { const t = this._cachedMeta, e = t.dataset, i = e.options && e.options.borderWidth || 0, s = t.data || []; if (!s.length) return i; const n = s[0].size(this.resolveDataElementOptions(0)), o = s[s.length - 1].size(this.resolveDataElementOptions(s.length - 1)); return Math.max(i, n, o) / 2 } draw() { const t = this._cachedMeta; t.dataset.updateControlPoints(this.chart.chartArea, t.iScale.axis), super.draw() } } Rn.id = "line", Rn.defaults = { datasetElementType: "line", dataElementType: "point", showLine: !0, spanGaps: !1 }, Rn.overrides = { scales: { _index_: { type: "category" }, _value_: { type: "linear" } } }; class In extends Ls { constructor(t, e) { super(t, e), this.innerRadius = void 0, this.outerRadius = void 0 } getLabelAndValue(t) { const e = this._cachedMeta, i = this.chart, s = i.data.labels || [], n = li(e._parsed[t].r, i.options.locale); return { label: s[t] || "", value: n } } parseObjectData(t, e, i, s) { return Ue.bind(this)(t, e, i, s) } update(t) { const e = this._cachedMeta.data; this._updateRadius(), this.updateElements(e, 0, e.length, t) } getMinMax() { const t = this._cachedMeta, e = { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }; return t.data.forEach(((t, i) => { const s = this.getParsed(i).r; !isNaN(s) && this.chart.getDataVisibility(i) && (s < e.min && (e.min = s), s > e.max && (e.max = s)) })), e } _updateRadius() { const t = this.chart, e = t.chartArea, i = t.options, s = Math.min(e.right - e.left, e.bottom - e.top), n = Math.max(s / 2, 0), o = (n - Math.max(i.cutoutPercentage ? n / 100 * i.cutoutPercentage : 1, 0)) / t.getVisibleDatasetCount(); this.outerRadius = n - o * this.index, this.innerRadius = this.outerRadius - o } updateElements(t, e, i, s) { const n = "reset" === s, o = this.chart, a = o.options.animation, r = this._cachedMeta.rScale, l = r.xCenter, h = r.yCenter, c = r.getIndexAngle(0) - .5 * D; let d, u = c; const f = 360 / this.countVisibleElements(); for (d = 0; d < e; ++d)u += this._computeAngle(d, s, f); for (d = e; d < e + i; d++) { const e = t[d]; let i = u, g = u + this._computeAngle(d, s, f), p = o.getDataVisibility(d) ? r.getDistanceFromCenterForValue(this.getParsed(d).r) : 0; u = g, n && (a.animateScale && (p = 0), a.animateRotate && (i = g = c)); const m = { x: l, y: h, innerRadius: 0, outerRadius: p, startAngle: i, endAngle: g, options: this.resolveDataElementOptions(d, e.active ? "active" : s) }; this.updateElement(e, d, m, s) } } countVisibleElements() { const t = this._cachedMeta; let e = 0; return t.data.forEach(((t, i) => { !isNaN(this.getParsed(i).r) && this.chart.getDataVisibility(i) && e++ })), e } _computeAngle(t, e, i) { return this.chart.getDataVisibility(t) ? H(this.resolveDataElementOptions(t, e).angle || i) : 0 } } In.id = "polarArea", In.defaults = { dataElementType: "arc", animation: { animateRotate: !0, animateScale: !0 }, animations: { numbers: { type: "number", properties: ["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"] } }, indexAxis: "r", startAngle: 0 }, In.overrides = { aspectRatio: 1, plugins: { legend: { labels: { generateLabels(t) { const e = t.data; if (e.labels.length && e.datasets.length) { const { labels: { pointStyle: i } } = t.legend.options; return e.labels.map(((e, s) => { const n = t.getDatasetMeta(0).controller.getStyle(s); return { text: e, fillStyle: n.backgroundColor, strokeStyle: n.borderColor, lineWidth: n.borderWidth, pointStyle: i, hidden: !t.getDataVisibility(s), index: s } })) } return [] } }, onClick(t, e, i) { i.chart.toggleDataVisibility(e.index), i.chart.update() } }, tooltip: { callbacks: { title: () => "", label: t => t.chart.data.labels[t.dataIndex] + ": " + t.formattedValue } } }, scales: { r: { type: "radialLinear", angleLines: { display: !1 }, beginAtZero: !0, grid: { circular: !0 }, pointLabels: { display: !1 }, startAngle: 0 } } }; class zn extends En { } zn.id = "pie", zn.defaults = { cutout: 0, rotation: 0, circumference: 360, radius: "100%" }; class Fn extends Ls { getLabelAndValue(t) { const e = this._cachedMeta.vScale, i = this.getParsed(t); return { label: e.getLabels()[t], value: "" + e.getLabelForValue(i[e.axis]) } } parseObjectData(t, e, i, s) { return Ue.bind(this)(t, e, i, s) } update(t) { const e = this._cachedMeta, i = e.dataset, s = e.data || [], n = e.iScale.getLabels(); if (i.points = s, "resize" !== t) { const e = this.resolveDatasetElementOptions(t); this.options.showLine || (e.borderWidth = 0); const o = { _loop: !0, _fullLoop: n.length === s.length, options: e }; this.updateElement(i, void 0, o, t) } this.updateElements(s, 0, s.length, t) } updateElements(t, e, i, s) { const n = this._cachedMeta.rScale, o = "reset" === s; for (let a = e; a < e + i; a++) { const e = t[a], i = this.resolveDataElementOptions(a, e.active ? "active" : s), r = n.getPointPositionForValue(a, this.getParsed(a).r), l = o ? n.xCenter : r.x, h = o ? n.yCenter : r.y, c = { x: l, y: h, angle: r.angle, skip: isNaN(l) || isNaN(h), options: i }; this.updateElement(e, a, c, s) } } } Fn.id = "radar", Fn.defaults = { datasetElementType: "line", dataElementType: "point", indexAxis: "r", showLine: !0, elements: { line: { fill: "start" } } }, Fn.overrides = { aspectRatio: 1, scales: { r: { type: "radialLinear" } } }; class Vn extends Ls { update(t) { const e = this._cachedMeta, { data: i = [] } = e, s = this.chart._animationsDisabled; let { start: n, count: o } = gt(e, i, s); if (this._drawStart = n, this._drawCount = o, pt(e) && (n = 0, o = i.length), this.options.showLine) { const { dataset: n, _dataset: o } = e; n._chart = this.chart, n._datasetIndex = this.index, n._decimated = !!o._decimated, n.points = i; const a = this.resolveDatasetElementOptions(t); a.segment = this.options.segment, this.updateElement(n, void 0, { animated: !s, options: a }, t) } this.updateElements(i, n, o, t) } addElements() { const { showLine: t } = this.options; !this.datasetElementType && t && (this.datasetElementType = Us.getElement("line")), super.addElements() } updateElements(t, e, s, n) { const o = "reset" === n, { iScale: a, vScale: r, _stacked: l, _dataset: h } = this._cachedMeta, c = this.resolveDataElementOptions(e, n), d = this.getSharedOptions(c), u = this.includeOptions(n, d), f = a.axis, g = r.axis, { spanGaps: p, segment: m } = this.options, b = B(p) ? p : Number.POSITIVE_INFINITY, x = this.chart._animationsDisabled || o || "none" === n; let _ = e > 0 && this.getParsed(e - 1); for (let c = e; c < e + s; ++c) { const e = t[c], s = this.getParsed(c), p = x ? e : {}, y = i(s[g]), v = p[f] = a.getPixelForValue(s[f], c), w = p[g] = o || y ? r.getBasePixel() : r.getPixelForValue(l ? this.applyStack(r, s, l) : s[g], c); p.skip = isNaN(v) || isNaN(w) || y, p.stop = c > 0 && Math.abs(s[f] - _[f]) > b, m && (p.parsed = s, p.raw = h.data[c]), u && (p.options = d || this.resolveDataElementOptions(c, e.active ? "active" : n)), x || this.updateElement(e, c, p, n), _ = s } this.updateSharedOptions(d, n, c) } getMaxOverflow() { const t = this._cachedMeta, e = t.data || []; if (!this.options.showLine) { let t = 0; for (let i = e.length - 1; i >= 0; --i)t = Math.max(t, e[i].size(this.resolveDataElementOptions(i)) / 2); return t > 0 && t } const i = t.dataset, s = i.options && i.options.borderWidth || 0; if (!e.length) return s; const n = e[0].size(this.resolveDataElementOptions(0)), o = e[e.length - 1].size(this.resolveDataElementOptions(e.length - 1)); return Math.max(s, n, o) / 2 } } Vn.id = "scatter", Vn.defaults = { datasetElementType: !1, dataElementType: "point", showLine: !1, fill: !1 }, Vn.overrides = { interaction: { mode: "point" }, plugins: { tooltip: { callbacks: { title: () => "", label: t => "(" + t.label + ", " + t.formattedValue + ")" } } }, scales: { x: { type: "linear" }, y: { type: "linear" } } }; var Bn = Object.freeze({ __proto__: null, BarController: Tn, BubbleController: Ln, DoughnutController: En, LineController: Rn, PolarAreaController: In, PieController: zn, RadarController: Fn, ScatterController: Vn }); function Nn(t, e, i) { const { startAngle: s, pixelMargin: n, x: o, y: a, outerRadius: r, innerRadius: l } = e; let h = n / r; t.beginPath(), t.arc(o, a, r, s - h, i + h), l > n ? (h = n / l, t.arc(o, a, l, i + h, s - h, !0)) : t.arc(o, a, n, i + L, s - L), t.closePath(), t.clip() } function Wn(t, e, i, s) { const n = ui(t.options.borderRadius, ["outerStart", "outerEnd", "innerStart", "innerEnd"]); const o = (i - e) / 2, a = Math.min(o, s * e / 2), r = t => { const e = (i - Math.min(o, t)) * s / 2; return Z(t, 0, Math.min(o, e)) }; return { outerStart: r(n.outerStart), outerEnd: r(n.outerEnd), innerStart: Z(n.innerStart, 0, a), innerEnd: Z(n.innerEnd, 0, a) } } function jn(t, e, i, s) { return { x: i + t * Math.cos(e), y: s + t * Math.sin(e) } } function Hn(t, e, i, s, n, o) { const { x: a, y: r, startAngle: l, pixelMargin: h, innerRadius: c } = e, d = Math.max(e.outerRadius + s + i - h, 0), u = c > 0 ? c + s + i + h : 0; let f = 0; const g = n - l; if (s) { const t = ((c > 0 ? c - s : 0) + (d > 0 ? d - s : 0)) / 2; f = (g - (0 !== t ? g * t / (t + s) : g)) / 2 } const p = (g - Math.max(.001, g * d - i / D) / d) / 2, m = l + p + f, b = n - p - f, { outerStart: x, outerEnd: _, innerStart: y, innerEnd: v } = Wn(e, u, d, b - m), w = d - x, M = d - _, k = m + x / w, S = b - _ / M, P = u + y, O = u + v, C = m + y / P, A = b - v / O; if (t.beginPath(), o) { if (t.arc(a, r, d, k, S), _ > 0) { const e = jn(M, S, a, r); t.arc(e.x, e.y, _, S, b + L) } const e = jn(O, b, a, r); if (t.lineTo(e.x, e.y), v > 0) { const e = jn(O, A, a, r); t.arc(e.x, e.y, v, b + L, A + Math.PI) } if (t.arc(a, r, u, b - v / u, m + y / u, !0), y > 0) { const e = jn(P, C, a, r); t.arc(e.x, e.y, y, C + Math.PI, m - L) } const i = jn(w, m, a, r); if (t.lineTo(i.x, i.y), x > 0) { const e = jn(w, k, a, r); t.arc(e.x, e.y, x, m - L, k) } } else { t.moveTo(a, r); const e = Math.cos(k) * d + a, i = Math.sin(k) * d + r; t.lineTo(e, i); const s = Math.cos(S) * d + a, n = Math.sin(S) * d + r; t.lineTo(s, n) } t.closePath() } function ${"$"}n(t, e, i, s, n, o) { const { options: a } = e, { borderWidth: r, borderJoinStyle: l } = a, h = "inner" === a.borderAlign; r && (h ? (t.lineWidth = 2 * r, t.lineJoin = l || "round") : (t.lineWidth = r, t.lineJoin = l || "bevel"), e.fullCircles && function (t, e, i) { const { x: s, y: n, startAngle: o, pixelMargin: a, fullCircles: r } = e, l = Math.max(e.outerRadius - a, 0), h = e.innerRadius + a; let c; for (i && Nn(t, e, o + O), t.beginPath(), t.arc(s, n, h, o + O, o, !0), c = 0; c < r; ++c)t.stroke(); for (t.beginPath(), t.arc(s, n, l, o, o + O), c = 0; c < r; ++c)t.stroke() }(t, e, h), h && Nn(t, e, n), Hn(t, e, i, s, n, o), t.stroke()) } class Yn extends Es { constructor(t) { super(), this.options = void 0, this.circumference = void 0, this.startAngle = void 0, this.endAngle = void 0, this.innerRadius = void 0, this.outerRadius = void 0, this.pixelMargin = 0, this.fullCircles = 0, t && Object.assign(this, t) } inRange(t, e, i) { const s = this.getProps(["x", "y"], i), { angle: n, distance: o } = U(s, { x: t, y: e }), { startAngle: a, endAngle: l, innerRadius: h, outerRadius: c, circumference: d } = this.getProps(["startAngle", "endAngle", "innerRadius", "outerRadius", "circumference"], i), u = this.options.spacing / 2, f = r(d, l - a) >= O || G(n, a, l), g = Q(o, h + u, c + u); return f && g } getCenterPoint(t) { const { x: e, y: i, startAngle: s, endAngle: n, innerRadius: o, outerRadius: a } = this.getProps(["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius", "circumference"], t), { offset: r, spacing: l } = this.options, h = (s + n) / 2, c = (o + a + l + r) / 2; return { x: e + Math.cos(h) * c, y: i + Math.sin(h) * c } } tooltipPosition(t) { return this.getCenterPoint(t) } draw(t) { const { options: e, circumference: i } = this, s = (e.offset || 0) / 2, n = (e.spacing || 0) / 2, o = e.circular; if (this.pixelMargin = "inner" === e.borderAlign ? .33 : 0, this.fullCircles = i > O ? Math.floor(i / O) : 0, 0 === i || this.innerRadius < 0 || this.outerRadius < 0) return; t.save(); let a = 0; if (s) { a = s / 2; const e = (this.startAngle + this.endAngle) / 2; t.translate(Math.cos(e) * a, Math.sin(e) * a), this.circumference >= D && (a = s) } t.fillStyle = e.backgroundColor, t.strokeStyle = e.borderColor; const r = function (t, e, i, s, n) { const { fullCircles: o, startAngle: a, circumference: r } = e; let l = e.endAngle; if (o) { Hn(t, e, i, s, a + O, n); for (let e = 0; e < o; ++e)t.fill(); isNaN(r) || (l = a + r % O, r % O == 0 && (l += O)) } return Hn(t, e, i, s, l, n), t.fill(), l }(t, this, a, n, o); ${"$"}n(t, this, a, n, r, o), t.restore() } } function Un(t, e, i = e) { t.lineCap = r(i.borderCapStyle, e.borderCapStyle), t.setLineDash(r(i.borderDash, e.borderDash)), t.lineDashOffset = r(i.borderDashOffset, e.borderDashOffset), t.lineJoin = r(i.borderJoinStyle, e.borderJoinStyle), t.lineWidth = r(i.borderWidth, e.borderWidth), t.strokeStyle = r(i.borderColor, e.borderColor) } function Xn(t, e, i) { t.lineTo(i.x, i.y) } function qn(t, e, i = {}) { const s = t.length, { start: n = 0, end: o = s - 1 } = i, { start: a, end: r } = e, l = Math.max(n, a), h = Math.min(o, r), c = n < a && o < a || n > r && o > r; return { count: s, start: l, loop: e.loop, ilen: h < l && !c ? s + h - l : h - l } } function Kn(t, e, i, s) { const { points: n, options: o } = e, { count: a, start: r, loop: l, ilen: h } = qn(n, i, s), c = function (t) { return t.stepped ? Oe : t.tension || "monotone" === t.cubicInterpolationMode ? Ce : Xn }(o); let d, u, f, { move: g = !0, reverse: p } = s || {}; for (d = 0; d <= h; ++d)u = n[(r + (p ? h - d : d)) % a], u.skip || (g ? (t.moveTo(u.x, u.y), g = !1) : c(t, f, u, p, o.stepped), f = u); return l && (u = n[(r + (p ? h : 0)) % a], c(t, f, u, p, o.stepped)), !!l } function Gn(t, e, i, s) { const n = e.points, { count: o, start: a, ilen: r } = qn(n, i, s), { move: l = !0, reverse: h } = s || {}; let c, d, u, f, g, p, m = 0, b = 0; const x = t => (a + (h ? r - t : t)) % o, _ = () => { f !== g && (t.lineTo(m, g), t.lineTo(m, f), t.lineTo(m, p)) }; for (l && (d = n[x(0)], t.moveTo(d.x, d.y)), c = 0; c <= r; ++c) { if (d = n[x(c)], d.skip) continue; const e = d.x, i = d.y, s = 0 | e; s === u ? (i < f ? f = i : i > g && (g = i), m = (b * m + e) / ++b) : (_(), t.lineTo(e, i), u = s, b = 0, f = g = i), p = i } _() } function Zn(t) { const e = t.options, i = e.borderDash && e.borderDash.length; return !(t._decimated || t._loop || e.tension || "monotone" === e.cubicInterpolationMode || e.stepped || i) ? Gn : Kn } Yn.id = "arc", Yn.defaults = { borderAlign: "center", borderColor: "#fff", borderJoinStyle: void 0, borderRadius: 0, borderWidth: 2, offset: 0, spacing: 0, angle: void 0, circular: !0 }, Yn.defaultRoutes = { backgroundColor: "backgroundColor" }; const Jn = "function" == typeof Path2D; function Qn(t, e, i, s) { Jn && !e.options.segment ? function (t, e, i, s) { let n = e._path; n || (n = e._path = new Path2D, e.path(n, i, s) && n.closePath()), Un(t, e.options), t.stroke(n) }(t, e, i, s) : function (t, e, i, s) { const { segments: n, options: o } = e, a = Zn(e); for (const r of n) Un(t, o, r.style), t.beginPath(), a(t, e, r, { start: i, end: i + s - 1 }) && t.closePath(), t.stroke() }(t, e, i, s) } class to extends Es { constructor(t) { super(), this.animated = !0, this.options = void 0, this._chart = void 0, this._loop = void 0, this._fullLoop = void 0, this._path = void 0, this._points = void 0, this._segments = void 0, this._decimated = !1, this._pointsUpdated = !1, this._datasetIndex = void 0, t && Object.assign(this, t) } updateControlPoints(t, e) { const i = this.options; if ((i.tension || "monotone" === i.cubicInterpolationMode) && !i.stepped && !this._pointsUpdated) { const s = i.spanGaps ? this._loop : this._fullLoop; Qe(this._points, i, t, s, e), this._pointsUpdated = !0 } } set points(t) { this._points = t, delete this._segments, delete this._path, this._pointsUpdated = !1 } get points() { return this._points } get segments() { return this._segments || (this._segments = Di(this, this.options.segment)) } first() { const t = this.segments, e = this.points; return t.length && e[t[0].start] } last() { const t = this.segments, e = this.points, i = t.length; return i && e[t[i - 1].end] } interpolate(t, e) { const i = this.options, s = t[e], n = this.points, o = Pi(this, { property: e, start: s, end: s }); if (!o.length) return; const a = [], r = function (t) { return t.stepped ? oi : t.tension || "monotone" === t.cubicInterpolationMode ? ai : ni }(i); let l, h; for (l = 0, h = o.length; l < h; ++l) { const { start: h, end: c } = o[l], d = n[h], u = n[c]; if (d === u) { a.push(d); continue } const f = r(d, u, Math.abs((s - d[e]) / (u[e] - d[e])), i.stepped); f[e] = t[e], a.push(f) } return 1 === a.length ? a[0] : a } pathSegment(t, e, i) { return Zn(this)(t, this, e, i) } path(t, e, i) { const s = this.segments, n = Zn(this); let o = this._loop; e = e || 0, i = i || this.points.length - e; for (const a of s) o &= n(t, this, a, { start: e, end: e + i - 1 }); return !!o } draw(t, e, i, s) { const n = this.options || {}; (this.points || []).length && n.borderWidth && (t.save(), Qn(t, this, i, s), t.restore()), this.animated && (this._pointsUpdated = !1, this._path = void 0) } } function eo(t, e, i, s) { const n = t.options, { [i]: o } = t.getProps([i], s); return Math.abs(e - o) < n.radius + n.hitRadius } to.id = "line", to.defaults = { borderCapStyle: "butt", borderDash: [], borderDashOffset: 0, borderJoinStyle: "miter", borderWidth: 3, capBezierPoints: !0, cubicInterpolationMode: "default", fill: !1, spanGaps: !1, stepped: !1, tension: 0 }, to.defaultRoutes = { backgroundColor: "backgroundColor", borderColor: "borderColor" }, to.descriptors = { _scriptable: !0, _indexable: t => "borderDash" !== t && "fill" !== t }; class io extends Es { constructor(t) { super(), this.options = void 0, this.parsed = void 0, this.skip = void 0, this.stop = void 0, t && Object.assign(this, t) } inRange(t, e, i) { const s = this.options, { x: n, y: o } = this.getProps(["x", "y"], i); return Math.pow(t - n, 2) + Math.pow(e - o, 2) < Math.pow(s.hitRadius + s.radius, 2) } inXRange(t, e) { return eo(this, t, "x", e) } inYRange(t, e) { return eo(this, t, "y", e) } getCenterPoint(t) { const { x: e, y: i } = this.getProps(["x", "y"], t); return { x: e, y: i } } size(t) { let e = (t = t || this.options || {}).radius || 0; e = Math.max(e, e && t.hoverRadius || 0); return 2 * (e + (e && t.borderWidth || 0)) } draw(t, e) { const i = this.options; this.skip || i.radius < .1 || !Se(this, e, this.size(i) / 2) || (t.strokeStyle = i.borderColor, t.lineWidth = i.borderWidth, t.fillStyle = i.backgroundColor, Me(t, i, this.x, this.y)) } getRange() { const t = this.options || {}; return t.radius + t.hitRadius } } function so(t, e) { const { x: i, y: s, base: n, width: o, height: a } = t.getProps(["x", "y", "base", "width", "height"], e); let r, l, h, c, d; return t.horizontal ? (d = a / 2, r = Math.min(i, n), l = Math.max(i, n), h = s - d, c = s + d) : (d = o / 2, r = i - d, l = i + d, h = Math.min(s, n), c = Math.max(s, n)), { left: r, top: h, right: l, bottom: c } } function no(t, e, i, s) { return t ? 0 : Z(e, i, s) } function oo(t) { const e = so(t), i = e.right - e.left, s = e.bottom - e.top, o = function (t, e, i) { const s = t.options.borderWidth, n = t.borderSkipped, o = fi(s); return { t: no(n.top, o.top, 0, i), r: no(n.right, o.right, 0, e), b: no(n.bottom, o.bottom, 0, i), l: no(n.left, o.left, 0, e) } }(t, i / 2, s / 2), a = function (t, e, i) { const { enableBorderRadius: s } = t.getProps(["enableBorderRadius"]), o = t.options.borderRadius, a = gi(o), r = Math.min(e, i), l = t.borderSkipped, h = s || n(o); return { topLeft: no(!h || l.top || l.left, a.topLeft, 0, r), topRight: no(!h || l.top || l.right, a.topRight, 0, r), bottomLeft: no(!h || l.bottom || l.left, a.bottomLeft, 0, r), bottomRight: no(!h || l.bottom || l.right, a.bottomRight, 0, r) } }(t, i / 2, s / 2); return { outer: { x: e.left, y: e.top, w: i, h: s, radius: a }, inner: { x: e.left + o.l, y: e.top + o.t, w: i - o.l - o.r, h: s - o.t - o.b, radius: { topLeft: Math.max(0, a.topLeft - Math.max(o.t, o.l)), topRight: Math.max(0, a.topRight - Math.max(o.t, o.r)), bottomLeft: Math.max(0, a.bottomLeft - Math.max(o.b, o.l)), bottomRight: Math.max(0, a.bottomRight - Math.max(o.b, o.r)) } } } } function ao(t, e, i, s) { const n = null === e, o = null === i, a = t && !(n && o) && so(t, s); return a && (n || Q(e, a.left, a.right)) && (o || Q(i, a.top, a.bottom)) } function ro(t, e) { t.rect(e.x, e.y, e.w, e.h) } function lo(t, e, i = {}) { const s = t.x !== i.x ? -e : 0, n = t.y !== i.y ? -e : 0, o = (t.x + t.w !== i.x + i.w ? e : 0) - s, a = (t.y + t.h !== i.y + i.h ? e : 0) - n; return { x: t.x + s, y: t.y + n, w: t.w + o, h: t.h + a, radius: t.radius } } io.id = "point", io.defaults = { borderWidth: 1, hitRadius: 1, hoverBorderWidth: 1, hoverRadius: 4, pointStyle: "circle", radius: 3, rotation: 0 }, io.defaultRoutes = { backgroundColor: "backgroundColor", borderColor: "borderColor" }; class ho extends Es { constructor(t) { super(), this.options = void 0, this.horizontal = void 0, this.base = void 0, this.width = void 0, this.height = void 0, this.inflateAmount = void 0, t && Object.assign(this, t) } draw(t) { const { inflateAmount: e, options: { borderColor: i, backgroundColor: s } } = this, { inner: n, outer: o } = oo(this), a = (r = o.radius).topLeft || r.topRight || r.bottomLeft || r.bottomRight ? Le : ro; var r; t.save(), o.w === n.w && o.h === n.h || (t.beginPath(), a(t, lo(o, e, n)), t.clip(), a(t, lo(n, -e, o)), t.fillStyle = i, t.fill("evenodd")), t.beginPath(), a(t, lo(n, e)), t.fillStyle = s, t.fill(), t.restore() } inRange(t, e, i) { return ao(this, t, e, i) } inXRange(t, e) { return ao(this, t, null, e) } inYRange(t, e) { return ao(this, null, t, e) } getCenterPoint(t) { const { x: e, y: i, base: s, horizontal: n } = this.getProps(["x", "y", "base", "horizontal"], t); return { x: n ? (e + s) / 2 : e, y: n ? i : (i + s) / 2 } } getRange(t) { return "x" === t ? this.width / 2 : this.height / 2 } } ho.id = "bar", ho.defaults = { borderSkipped: "start", borderWidth: 0, borderRadius: 0, inflateAmount: "auto", pointStyle: void 0 }, ho.defaultRoutes = { backgroundColor: "backgroundColor", borderColor: "borderColor" }; var co = Object.freeze({ __proto__: null, ArcElement: Yn, LineElement: to, PointElement: io, BarElement: ho }); function uo(t) { if (t._decimated) { const e = t._data; delete t._decimated, delete t._data, Object.defineProperty(t, "data", { value: e }) } } function fo(t) { t.data.datasets.forEach((t => { uo(t) })) } var go = { id: "decimation", defaults: { algorithm: "min-max", enabled: !1 }, beforeElementsUpdate: (t, e, s) => { if (!s.enabled) return void fo(t); const n = t.width; t.data.datasets.forEach(((e, o) => { const { _data: a, indexAxis: r } = e, l = t.getDatasetMeta(o), h = a || e.data; if ("y" === bi([r, t.options.indexAxis])) return; if (!l.controller.supportsDecimation) return; const c = t.scales[l.xAxisID]; if ("linear" !== c.type && "time" !== c.type) return; if (t.options.parsing) return; let { start: d, count: u } = function (t, e) { const i = e.length; let s, n = 0; const { iScale: o } = t, { min: a, max: r, minDefined: l, maxDefined: h } = o.getUserBounds(); return l && (n = Z(et(e, o.axis, a).lo, 0, i - 1)), s = h ? Z(et(e, o.axis, r).hi + 1, n, i) - n : i - n, { start: n, count: s } }(l, h); if (u <= (s.threshold || 4 * n)) return void uo(e); let f; switch (i(a) && (e._data = h, delete e.data, Object.defineProperty(e, "data", { configurable: !0, enumerable: !0, get: function () { return this._decimated }, set: function (t) { this._data = t } })), s.algorithm) { case "lttb": f = function (t, e, i, s, n) { const o = n.samples || s; if (o >= i) return t.slice(e, e + i); const a = [], r = (i - 2) / (o - 2); let l = 0; const h = e + i - 1; let c, d, u, f, g, p = e; for (a[l++] = t[p], c = 0; c < o - 2; c++) { let s, n = 0, o = 0; const h = Math.floor((c + 1) * r) + 1 + e, m = Math.min(Math.floor((c + 2) * r) + 1, i) + e, b = m - h; for (s = h; s < m; s++)n += t[s].x, o += t[s].y; n /= b, o /= b; const x = Math.floor(c * r) + 1 + e, _ = Math.min(Math.floor((c + 1) * r) + 1, i) + e, { x: y, y: v } = t[p]; for (u = f = -1, s = x; s < _; s++)f = .5 * Math.abs((y - n) * (t[s].y - v) - (y - t[s].x) * (o - v)), f > u && (u = f, d = t[s], g = s); a[l++] = d, p = g } return a[l++] = t[h], a }(h, d, u, n, s); break; case "min-max": f = function (t, e, s, n) { let o, a, r, l, h, c, d, u, f, g, p = 0, m = 0; const b = [], x = e + s - 1, _ = t[e].x, y = t[x].x - _; for (o = e; o < e + s; ++o) { a = t[o], r = (a.x - _) / y * n, l = a.y; const e = 0 | r; if (e === h) l < f ? (f = l, c = o) : l > g && (g = l, d = o), p = (m * p + a.x) / ++m; else { const s = o - 1; if (!i(c) && !i(d)) { const e = Math.min(c, d), i = Math.max(c, d); e !== u && e !== s && b.push({ ...t[e], x: p }), i !== u && i !== s && b.push({ ...t[i], x: p }) } o > 0 && s !== u && b.push(t[s]), b.push(a), h = e, m = 0, f = g = l, c = d = u = o } } return b }(h, d, u, n); break; default: throw new Error(`Unsupported decimation algorithm '${"$"}{s.algorithm}'`) }e._decimated = f })) }, destroy(t) { fo(t) } }; function po(t, e, i, s) { if (s) return; let n = e[t], o = i[t]; return "angle" === t && (n = K(n), o = K(o)), { property: t, start: n, end: o } } function mo(t, e, i) { for (; e > t; e--) { const t = i[e]; if (!isNaN(t.x) && !isNaN(t.y)) break } return e } function bo(t, e, i, s) { return t && e ? s(t[i], e[i]) : t ? t[i] : e ? e[i] : 0 } function xo(t, e) { let i = [], n = !1; return s(t) ? (n = !0, i = t) : i = function (t, e) { const { x: i = null, y: s = null } = t || {}, n = e.points, o = []; return e.segments.forEach((({ start: t, end: e }) => { e = mo(t, e, n); const a = n[t], r = n[e]; null !== s ? (o.push({ x: a.x, y: s }), o.push({ x: r.x, y: s })) : null !== i && (o.push({ x: i, y: a.y }), o.push({ x: i, y: r.y })) })), o }(t, e), i.length ? new to({ points: i, options: { tension: 0 }, _loop: n, _fullLoop: n }) : null } function _o(t) { return t && !1 !== t.fill } function yo(t, e, i) { let s = t[e].fill; const n = [e]; let a; if (!i) return s; for (; !1 !== s && -1 === n.indexOf(s);) { if (!o(s)) return s; if (a = t[s], !a) return !1; if (a.visible) return s; n.push(s), s = a.fill } return !1 } function vo(t, e, i) { const s = function (t) { const e = t.options, i = e.fill; let s = r(i && i.target, i); void 0 === s && (s = !!e.backgroundColor); if (!1 === s || null === s) return !1; if (!0 === s) return "origin"; return s }(t); if (n(s)) return !isNaN(s.value) && s; let a = parseFloat(s); return o(a) && Math.floor(a) === a ? function (t, e, i, s) { "-" !== t && "+" !== t || (i = e + i); if (i === e || i < 0 || i >= s) return !1; return i }(s[0], e, a, i) : ["origin", "start", "end", "stack", "shape"].indexOf(s) >= 0 && s } function wo(t, e, i) { const s = []; for (let n = 0; n < i.length; n++) { const o = i[n], { first: a, last: r, point: l } = Mo(o, e, "x"); if (!(!l || a && r)) if (a) s.unshift(l); else if (t.push(l), !r) break } t.push(...s) } function Mo(t, e, i) { const s = t.interpolate(e, i); if (!s) return {}; const n = s[i], o = t.segments, a = t.points; let r = !1, l = !1; for (let t = 0; t < o.length; t++) { const e = o[t], s = a[e.start][i], h = a[e.end][i]; if (Q(n, s, h)) { r = n === s, l = n === h; break } } return { first: r, last: l, point: s } } class ko { constructor(t) { this.x = t.x, this.y = t.y, this.radius = t.radius } pathSegment(t, e, i) { const { x: s, y: n, radius: o } = this; return e = e || { start: 0, end: O }, t.arc(s, n, o, e.end, e.start, !0), !i.bounds } interpolate(t) { const { x: e, y: i, radius: s } = this, n = t.angle; return { x: e + Math.cos(n) * s, y: i + Math.sin(n) * s, angle: n } } } function So(t) { const { chart: e, fill: i, line: s } = t; if (o(i)) return function (t, e) { const i = t.getDatasetMeta(e); return i && t.isDatasetVisible(e) ? i.dataset : null }(e, i); if ("stack" === i) return function (t) { const { scale: e, index: i, line: s } = t, n = [], o = s.segments, a = s.points, r = function (t, e) { const i = [], s = t.getMatchingVisibleMetas("line"); for (let t = 0; t < s.length; t++) { const n = s[t]; if (n.index === e) break; n.hidden || i.unshift(n.dataset) } return i }(e, i); r.push(xo({ x: null, y: e.bottom }, s)); for (let t = 0; t < o.length; t++) { const e = o[t]; for (let t = e.start; t <= e.end; t++)wo(n, a[t], r) } return new to({ points: n, options: {} }) }(t); if ("shape" === i) return !0; const a = function (t) { if ((t.scale || {}).getPointPositionForValue) return function (t) { const { scale: e, fill: i } = t, s = e.options, o = e.getLabels().length, a = s.reverse ? e.max : e.min, r = function (t, e, i) { let s; return s = "start" === t ? i : "end" === t ? e.options.reverse ? e.min : e.max : n(t) ? t.value : e.getBaseValue(), s }(i, e, a), l = []; if (s.grid.circular) { const t = e.getPointPositionForValue(0, a); return new ko({ x: t.x, y: t.y, radius: e.getDistanceFromCenterForValue(r) }) } for (let t = 0; t < o; ++t)l.push(e.getPointPositionForValue(t, r)); return l }(t); return function (t) { const { scale: e = {}, fill: i } = t, s = function (t, e) { let i = null; return "start" === t ? i = e.bottom : "end" === t ? i = e.top : n(t) ? i = e.getPixelForValue(t.value) : e.getBasePixel && (i = e.getBasePixel()), i }(i, e); if (o(s)) { const t = e.isHorizontal(); return { x: t ? s : null, y: t ? null : s } } return null }(t) }(t); return a instanceof ko ? a : xo(a, s) } function Po(t, e, i) { const s = So(e), { line: n, scale: o, axis: a } = e, r = n.options, l = r.fill, h = r.backgroundColor, { above: c = h, below: d = h } = l || {}; s && n.points.length && (Pe(t, i), function (t, e) { const { line: i, target: s, above: n, below: o, area: a, scale: r } = e, l = i._loop ? "angle" : e.axis; t.save(), "x" === l && o !== n && (Do(t, s, a.top), Oo(t, { line: i, target: s, color: n, scale: r, property: l }), t.restore(), t.save(), Do(t, s, a.bottom)); Oo(t, { line: i, target: s, color: o, scale: r, property: l }), t.restore() }(t, { line: n, target: s, above: c, below: d, area: i, scale: o, axis: a }), De(t)) } function Do(t, e, i) { const { segments: s, points: n } = e; let o = !0, a = !1; t.beginPath(); for (const r of s) { const { start: s, end: l } = r, h = n[s], c = n[mo(s, l, n)]; o ? (t.moveTo(h.x, h.y), o = !1) : (t.lineTo(h.x, i), t.lineTo(h.x, h.y)), a = !!e.pathSegment(t, r, { move: a }), a ? t.closePath() : t.lineTo(c.x, i) } t.lineTo(e.first().x, i), t.closePath(), t.clip() } function Oo(t, e) { const { line: i, target: s, property: n, color: o, scale: a } = e, r = function (t, e, i) { const s = t.segments, n = t.points, o = e.points, a = []; for (const t of s) { let { start: s, end: r } = t; r = mo(s, r, n); const l = po(i, n[s], n[r], t.loop); if (!e.segments) { a.push({ source: t, target: l, start: n[s], end: n[r] }); continue } const h = Pi(e, l); for (const e of h) { const s = po(i, o[e.start], o[e.end], e.loop), r = Si(t, n, s); for (const t of r) a.push({ source: t, target: e, start: { [i]: bo(l, s, "start", Math.max) }, end: { [i]: bo(l, s, "end", Math.min) } }) } } return a }(i, s, n); for (const { source: e, target: l, start: h, end: c } of r) { const { style: { backgroundColor: r = o } = {} } = e, d = !0 !== s; t.save(), t.fillStyle = r, Co(t, a, d && po(n, h, c)), t.beginPath(); const u = !!i.pathSegment(t, e); let f; if (d) { u ? t.closePath() : Ao(t, s, c, n); const e = !!s.pathSegment(t, l, { move: u, reverse: !0 }); f = u && e, f || Ao(t, s, h, n) } t.closePath(), t.fill(f ? "evenodd" : "nonzero"), t.restore() } } function Co(t, e, i) { const { top: s, bottom: n } = e.chart.chartArea, { property: o, start: a, end: r } = i || {}; "x" === o && (t.beginPath(), t.rect(a, s, r - a, n - s), t.clip()) } function Ao(t, e, i, s) { const n = e.interpolate(i, s); n && t.lineTo(n.x, n.y) } var To = { id: "filler", afterDatasetsUpdate(t, e, i) { const s = (t.data.datasets || []).length, n = []; let o, a, r, l; for (a = 0; a < s; ++a)o = t.getDatasetMeta(a), r = o.dataset, l = null, r && r.options && r instanceof to && (l = { visible: t.isDatasetVisible(a), index: a, fill: vo(r, a, s), chart: t, axis: o.controller.options.indexAxis, scale: o.vScale, line: r }), o.${"$"}filler = l, n.push(l); for (a = 0; a < s; ++a)l = n[a], l && !1 !== l.fill && (l.fill = yo(n, a, i.propagate)) }, beforeDraw(t, e, i) { const s = "beforeDraw" === i.drawTime, n = t.getSortedVisibleDatasetMetas(), o = t.chartArea; for (let e = n.length - 1; e >= 0; --e) { const i = n[e].${"$"}filler; i && (i.line.updateControlPoints(o, i.axis), s && i.fill && Po(t.ctx, i, o)) } }, beforeDatasetsDraw(t, e, i) { if ("beforeDatasetsDraw" !== i.drawTime) return; const s = t.getSortedVisibleDatasetMetas(); for (let e = s.length - 1; e >= 0; --e) { const i = s[e].${"$"}filler; _o(i) && Po(t.ctx, i, t.chartArea) } }, beforeDatasetDraw(t, e, i) { const s = e.meta.${"$"}filler; _o(s) && "beforeDatasetDraw" === i.drawTime && Po(t.ctx, s, t.chartArea) }, defaults: { propagate: !0, drawTime: "beforeDatasetDraw" } }; const Lo = (t, e) => { let { boxHeight: i = e, boxWidth: s = e } = t; return t.usePointStyle && (i = Math.min(i, e), s = t.pointStyleWidth || Math.min(s, e)), { boxWidth: s, boxHeight: i, itemHeight: Math.max(e, i) } }; class Eo extends Es { constructor(t) { super(), this._added = !1, this.legendHitBoxes = [], this._hoveredItem = null, this.doughnutMode = !1, this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this.legendItems = void 0, this.columnSizes = void 0, this.lineWidths = void 0, this.maxHeight = void 0, this.maxWidth = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.height = void 0, this.width = void 0, this._margins = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0 } update(t, e, i) { this.maxWidth = t, this.maxHeight = e, this._margins = i, this.setDimensions(), this.buildLabels(), this.fit() } setDimensions() { this.isHorizontal() ? (this.width = this.maxWidth, this.left = this._margins.left, this.right = this.width) : (this.height = this.maxHeight, this.top = this._margins.top, this.bottom = this.height) } buildLabels() { const t = this.options.labels || {}; let e = c(t.generateLabels, [this.chart], this) || []; t.filter && (e = e.filter((e => t.filter(e, this.chart.data)))), t.sort && (e = e.sort(((e, i) => t.sort(e, i, this.chart.data)))), this.options.reverse && e.reverse(), this.legendItems = e } fit() { const { options: t, ctx: e } = this; if (!t.display) return void (this.width = this.height = 0); const i = t.labels, s = mi(i.font), n = s.size, o = this._computeTitleHeight(), { boxWidth: a, itemHeight: r } = Lo(i, n); let l, h; e.font = s.string, this.isHorizontal() ? (l = this.maxWidth, h = this._fitRows(o, n, a, r) + 10) : (h = this.maxHeight, l = this._fitCols(o, n, a, r) + 10), this.width = Math.min(l, t.maxWidth || this.maxWidth), this.height = Math.min(h, t.maxHeight || this.maxHeight) } _fitRows(t, e, i, s) { const { ctx: n, maxWidth: o, options: { labels: { padding: a } } } = this, r = this.legendHitBoxes = [], l = this.lineWidths = [0], h = s + a; let c = t; n.textAlign = "left", n.textBaseline = "middle"; let d = -1, u = -h; return this.legendItems.forEach(((t, f) => { const g = i + e / 2 + n.measureText(t.text).width; (0 === f || l[l.length - 1] + g + 2 * a > o) && (c += h, l[l.length - (f > 0 ? 0 : 1)] = 0, u += h, d++), r[f] = { left: 0, top: u, row: d, width: g, height: s }, l[l.length - 1] += g + a })), c } _fitCols(t, e, i, s) { const { ctx: n, maxHeight: o, options: { labels: { padding: a } } } = this, r = this.legendHitBoxes = [], l = this.columnSizes = [], h = o - t; let c = a, d = 0, u = 0, f = 0, g = 0; return this.legendItems.forEach(((t, o) => { const p = i + e / 2 + n.measureText(t.text).width; o > 0 && u + s + 2 * a > h && (c += d + a, l.push({ width: d, height: u }), f += d + a, g++, d = u = 0), r[o] = { left: f, top: u, col: g, width: p, height: s }, d = Math.max(d, p), u += s + a })), c += d, l.push({ width: d, height: u }), c } adjustHitBoxes() { if (!this.options.display) return; const t = this._computeTitleHeight(), { legendHitBoxes: e, options: { align: i, labels: { padding: s }, rtl: n } } = this, o = yi(n, this.left, this.width); if (this.isHorizontal()) { let n = 0, a = ut(i, this.left + s, this.right - this.lineWidths[n]); for (const r of e) n !== r.row && (n = r.row, a = ut(i, this.left + s, this.right - this.lineWidths[n])), r.top += this.top + t + s, r.left = o.leftForLtr(o.x(a), r.width), a += r.width + s } else { let n = 0, a = ut(i, this.top + t + s, this.bottom - this.columnSizes[n].height); for (const r of e) r.col !== n && (n = r.col, a = ut(i, this.top + t + s, this.bottom - this.columnSizes[n].height)), r.top = a, r.left += this.left + s, r.left = o.leftForLtr(o.x(r.left), r.width), a += r.height + s } } isHorizontal() { return "top" === this.options.position || "bottom" === this.options.position } draw() { if (this.options.display) { const t = this.ctx; Pe(t, this), this._draw(), De(t) } } _draw() { const { options: t, columnSizes: e, lineWidths: i, ctx: s } = this, { align: n, labels: o } = t, a = ne.color, l = yi(t.rtl, this.left, this.width), h = mi(o.font), { color: c, padding: d } = o, u = h.size, f = u / 2; let g; this.drawTitle(), s.textAlign = l.textAlign("left"), s.textBaseline = "middle", s.lineWidth = .5, s.font = h.string; const { boxWidth: p, boxHeight: m, itemHeight: b } = Lo(o, u), x = this.isHorizontal(), _ = this._computeTitleHeight(); g = x ? { x: ut(n, this.left + d, this.right - i[0]), y: this.top + d + _, line: 0 } : { x: this.left + d, y: ut(n, this.top + _ + d, this.bottom - e[0].height), line: 0 }, vi(this.ctx, t.textDirection); const y = b + d; this.legendItems.forEach(((v, w) => { s.strokeStyle = v.fontColor || c, s.fillStyle = v.fontColor || c; const M = s.measureText(v.text).width, k = l.textAlign(v.textAlign || (v.textAlign = o.textAlign)), S = p + f + M; let P = g.x, D = g.y; l.setWidth(this.width), x ? w > 0 && P + S + d > this.right && (D = g.y += y, g.line++, P = g.x = ut(n, this.left + d, this.right - i[g.line])) : w > 0 && D + y > this.bottom && (P = g.x = P + e[g.line].width + d, g.line++, D = g.y = ut(n, this.top + _ + d, this.bottom - e[g.line].height)); !function (t, e, i) { if (isNaN(p) || p <= 0 || isNaN(m) || m < 0) return; s.save(); const n = r(i.lineWidth, 1); if (s.fillStyle = r(i.fillStyle, a), s.lineCap = r(i.lineCap, "butt"), s.lineDashOffset = r(i.lineDashOffset, 0), s.lineJoin = r(i.lineJoin, "miter"), s.lineWidth = n, s.strokeStyle = r(i.strokeStyle, a), s.setLineDash(r(i.lineDash, [])), o.usePointStyle) { const a = { radius: m * Math.SQRT2 / 2, pointStyle: i.pointStyle, rotation: i.rotation, borderWidth: n }, r = l.xPlus(t, p / 2); ke(s, a, r, e + f, o.pointStyleWidth && p) } else { const o = e + Math.max((u - m) / 2, 0), a = l.leftForLtr(t, p), r = gi(i.borderRadius); s.beginPath(), Object.values(r).some((t => 0 !== t)) ? Le(s, { x: a, y: o, w: p, h: m, radius: r }) : s.rect(a, o, p, m), s.fill(), 0 !== n && s.stroke() } s.restore() }(l.x(P), D, v), P = ft(k, P + p + f, x ? P + S : this.right, t.rtl), function (t, e, i) { Ae(s, i.text, t, e + b / 2, h, { strikethrough: i.hidden, textAlign: l.textAlign(i.textAlign) }) }(l.x(P), D, v), x ? g.x += S + d : g.y += y })), wi(this.ctx, t.textDirection) } drawTitle() { const t = this.options, e = t.title, i = mi(e.font), s = pi(e.padding); if (!e.display) return; const n = yi(t.rtl, this.left, this.width), o = this.ctx, a = e.position, r = i.size / 2, l = s.top + r; let h, c = this.left, d = this.width; if (this.isHorizontal()) d = Math.max(...this.lineWidths), h = this.top + l, c = ut(t.align, c, this.right - d); else { const e = this.columnSizes.reduce(((t, e) => Math.max(t, e.height)), 0); h = l + ut(t.align, this.top, this.bottom - e - t.labels.padding - this._computeTitleHeight()) } const u = ut(a, c, c + d); o.textAlign = n.textAlign(dt(a)), o.textBaseline = "middle", o.strokeStyle = e.color, o.fillStyle = e.color, o.font = i.string, Ae(o, e.text, u, h, i) } _computeTitleHeight() { const t = this.options.title, e = mi(t.font), i = pi(t.padding); return t.display ? e.lineHeight + i.height : 0 } _getLegendItemAt(t, e) { let i, s, n; if (Q(t, this.left, this.right) && Q(e, this.top, this.bottom)) for (n = this.legendHitBoxes, i = 0; i < n.length; ++i)if (s = n[i], Q(t, s.left, s.left + s.width) && Q(e, s.top, s.top + s.height)) return this.legendItems[i]; return null } handleEvent(t) { const e = this.options; if (!function (t, e) { if (("mousemove" === t || "mouseout" === t) && (e.onHover || e.onLeave)) return !0; if (e.onClick && ("click" === t || "mouseup" === t)) return !0; return !1 }(t.type, e)) return; const i = this._getLegendItemAt(t.x, t.y); if ("mousemove" === t.type || "mouseout" === t.type) { const o = this._hoveredItem, a = (n = i, null !== (s = o) && null !== n && s.datasetIndex === n.datasetIndex && s.index === n.index); o && !a && c(e.onLeave, [t, o, this], this), this._hoveredItem = i, i && !a && c(e.onHover, [t, i, this], this) } else i && c(e.onClick, [t, i, this], this); var s, n } } var Ro = { id: "legend", _element: Eo, start(t, e, i) { const s = t.legend = new Eo({ ctx: t.ctx, options: i, chart: t }); Zi.configure(t, s, i), Zi.addBox(t, s) }, stop(t) { Zi.removeBox(t, t.legend), delete t.legend }, beforeUpdate(t, e, i) { const s = t.legend; Zi.configure(t, s, i), s.options = i }, afterUpdate(t) { const e = t.legend; e.buildLabels(), e.adjustHitBoxes() }, afterEvent(t, e) { e.replay || t.legend.handleEvent(e.event) }, defaults: { display: !0, position: "top", align: "center", fullSize: !0, reverse: !1, weight: 1e3, onClick(t, e, i) { const s = e.datasetIndex, n = i.chart; n.isDatasetVisible(s) ? (n.hide(s), e.hidden = !0) : (n.show(s), e.hidden = !1) }, onHover: null, onLeave: null, labels: { color: t => t.chart.options.color, boxWidth: 40, padding: 10, generateLabels(t) { const e = t.data.datasets, { labels: { usePointStyle: i, pointStyle: s, textAlign: n, color: o } } = t.legend.options; return t._getSortedDatasetMetas().map((t => { const a = t.controller.getStyle(i ? 0 : void 0), r = pi(a.borderWidth); return { text: e[t.index].label, fillStyle: a.backgroundColor, fontColor: o, hidden: !t.visible, lineCap: a.borderCapStyle, lineDash: a.borderDash, lineDashOffset: a.borderDashOffset, lineJoin: a.borderJoinStyle, lineWidth: (r.width + r.height) / 4, strokeStyle: a.borderColor, pointStyle: s || a.pointStyle, rotation: a.rotation, textAlign: n || a.textAlign, borderRadius: 0, datasetIndex: t.index } }), this) } }, title: { color: t => t.chart.options.color, display: !1, position: "center", text: "" } }, descriptors: { _scriptable: t => !t.startsWith("on"), labels: { _scriptable: t => !["generateLabels", "filter", "sort"].includes(t) } } }; class Io extends Es { constructor(t) { super(), this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this._padding = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0 } update(t, e) { const i = this.options; if (this.left = 0, this.top = 0, !i.display) return void (this.width = this.height = this.right = this.bottom = 0); this.width = this.right = t, this.height = this.bottom = e; const n = s(i.text) ? i.text.length : 1; this._padding = pi(i.padding); const o = n * mi(i.font).lineHeight + this._padding.height; this.isHorizontal() ? this.height = o : this.width = o } isHorizontal() { const t = this.options.position; return "top" === t || "bottom" === t } _drawArgs(t) { const { top: e, left: i, bottom: s, right: n, options: o } = this, a = o.align; let r, l, h, c = 0; return this.isHorizontal() ? (l = ut(a, i, n), h = e + t, r = n - i) : ("left" === o.position ? (l = i + t, h = ut(a, s, e), c = -.5 * D) : (l = n - t, h = ut(a, e, s), c = .5 * D), r = s - e), { titleX: l, titleY: h, maxWidth: r, rotation: c } } draw() { const t = this.ctx, e = this.options; if (!e.display) return; const i = mi(e.font), s = i.lineHeight / 2 + this._padding.top, { titleX: n, titleY: o, maxWidth: a, rotation: r } = this._drawArgs(s); Ae(t, e.text, 0, 0, i, { color: e.color, maxWidth: a, rotation: r, textAlign: dt(e.align), textBaseline: "middle", translation: [n, o] }) } } var zo = { id: "title", _element: Io, start(t, e, i) { !function (t, e) { const i = new Io({ ctx: t.ctx, options: e, chart: t }); Zi.configure(t, i, e), Zi.addBox(t, i), t.titleBlock = i }(t, i) }, stop(t) { const e = t.titleBlock; Zi.removeBox(t, e), delete t.titleBlock }, beforeUpdate(t, e, i) { const s = t.titleBlock; Zi.configure(t, s, i), s.options = i }, defaults: { align: "center", display: !1, font: { weight: "bold" }, fullSize: !0, padding: 10, position: "top", text: "", weight: 2e3 }, defaultRoutes: { color: "color" }, descriptors: { _scriptable: !0, _indexable: !1 } }; const Fo = new WeakMap; var Vo = { id: "subtitle", start(t, e, i) { const s = new Io({ ctx: t.ctx, options: i, chart: t }); Zi.configure(t, s, i), Zi.addBox(t, s), Fo.set(t, s) }, stop(t) { Zi.removeBox(t, Fo.get(t)), Fo.delete(t) }, beforeUpdate(t, e, i) { const s = Fo.get(t); Zi.configure(t, s, i), s.options = i }, defaults: { align: "center", display: !1, font: { weight: "normal" }, fullSize: !0, padding: 0, position: "top", text: "", weight: 1500 }, defaultRoutes: { color: "color" }, descriptors: { _scriptable: !0, _indexable: !1 } }; const Bo = { average(t) { if (!t.length) return !1; let e, i, s = 0, n = 0, o = 0; for (e = 0, i = t.length; e < i; ++e) { const i = t[e].element; if (i && i.hasValue()) { const t = i.tooltipPosition(); s += t.x, n += t.y, ++o } } return { x: s / o, y: n / o } }, nearest(t, e) { if (!t.length) return !1; let i, s, n, o = e.x, a = e.y, r = Number.POSITIVE_INFINITY; for (i = 0, s = t.length; i < s; ++i) { const s = t[i].element; if (s && s.hasValue()) { const t = X(e, s.getCenterPoint()); t < r && (r = t, n = s) } } if (n) { const t = n.tooltipPosition(); o = t.x, a = t.y } return { x: o, y: a } } }; function No(t, e) { return e && (s(e) ? Array.prototype.push.apply(t, e) : t.push(e)), t } function Wo(t) { return ("string" == typeof t || t instanceof String) && t.indexOf("\n") > -1 ? t.split("\n") : t } function jo(t, e) { const { element: i, datasetIndex: s, index: n } = e, o = t.getDatasetMeta(s).controller, { label: a, value: r } = o.getLabelAndValue(n); return { chart: t, label: a, parsed: o.getParsed(n), raw: t.data.datasets[s].data[n], formattedValue: r, dataset: o.getDataset(), dataIndex: n, datasetIndex: s, element: i } } function Ho(t, e) { const i = t.chart.ctx, { body: s, footer: n, title: o } = t, { boxWidth: a, boxHeight: r } = e, l = mi(e.bodyFont), h = mi(e.titleFont), c = mi(e.footerFont), u = o.length, f = n.length, g = s.length, p = pi(e.padding); let m = p.height, b = 0, x = s.reduce(((t, e) => t + e.before.length + e.lines.length + e.after.length), 0); if (x += t.beforeBody.length + t.afterBody.length, u && (m += u * h.lineHeight + (u - 1) * e.titleSpacing + e.titleMarginBottom), x) { m += g * (e.displayColors ? Math.max(r, l.lineHeight) : l.lineHeight) + (x - g) * l.lineHeight + (x - 1) * e.bodySpacing } f && (m += e.footerMarginTop + f * c.lineHeight + (f - 1) * e.footerSpacing); let _ = 0; const y = function (t) { b = Math.max(b, i.measureText(t).width + _) }; return i.save(), i.font = h.string, d(t.title, y), i.font = l.string, d(t.beforeBody.concat(t.afterBody), y), _ = e.displayColors ? a + 2 + e.boxPadding : 0, d(s, (t => { d(t.before, y), d(t.lines, y), d(t.after, y) })), _ = 0, i.font = c.string, d(t.footer, y), i.restore(), b += p.width, { width: b, height: m } } function ${"$"}o(t, e, i, s) { const { x: n, width: o } = i, { width: a, chartArea: { left: r, right: l } } = t; let h = "center"; return "center" === s ? h = n <= (r + l) / 2 ? "left" : "right" : n <= o / 2 ? h = "left" : n >= a - o / 2 && (h = "right"), function (t, e, i, s) { const { x: n, width: o } = s, a = i.caretSize + i.caretPadding; return "left" === t && n + o + a > e.width || "right" === t && n - o - a < 0 || void 0 }(h, t, e, i) && (h = "center"), h } function Yo(t, e, i) { const s = i.yAlign || e.yAlign || function (t, e) { const { y: i, height: s } = e; return i < s / 2 ? "top" : i > t.height - s / 2 ? "bottom" : "center" }(t, i); return { xAlign: i.xAlign || e.xAlign || ${"$"}o(t, e, i, s), yAlign: s } } function Uo(t, e, i, s) { const { caretSize: n, caretPadding: o, cornerRadius: a } = t, { xAlign: r, yAlign: l } = i, h = n + o, { topLeft: c, topRight: d, bottomLeft: u, bottomRight: f } = gi(a); let g = function (t, e) { let { x: i, width: s } = t; return "right" === e ? i -= s : "center" === e && (i -= s / 2), i }(e, r); const p = function (t, e, i) { let { y: s, height: n } = t; return "top" === e ? s += i : s -= "bottom" === e ? n + i : n / 2, s }(e, l, h); return "center" === l ? "left" === r ? g += h : "right" === r && (g -= h) : "left" === r ? g -= Math.max(c, u) + n : "right" === r && (g += Math.max(d, f) + n), { x: Z(g, 0, s.width - e.width), y: Z(p, 0, s.height - e.height) } } function Xo(t, e, i) { const s = pi(i.padding); return "center" === e ? t.x + t.width / 2 : "right" === e ? t.x + t.width - s.right : t.x + s.left } function qo(t) { return No([], Wo(t)) } function Ko(t, e) { const i = e && e.dataset && e.dataset.tooltip && e.dataset.tooltip.callbacks; return i ? t.override(i) : t } class Go extends Es { constructor(t) { super(), this.opacity = 0, this._active = [], this._eventPosition = void 0, this._size = void 0, this._cachedAnimations = void 0, this._tooltipItems = [], this.${"$"}animations = void 0, this.${"$"}context = void 0, this.chart = t.chart || t._chart, this._chart = this.chart, this.options = t.options, this.dataPoints = void 0, this.title = void 0, this.beforeBody = void 0, this.body = void 0, this.afterBody = void 0, this.footer = void 0, this.xAlign = void 0, this.yAlign = void 0, this.x = void 0, this.y = void 0, this.height = void 0, this.width = void 0, this.caretX = void 0, this.caretY = void 0, this.labelColors = void 0, this.labelPointStyles = void 0, this.labelTextColors = void 0 } initialize(t) { this.options = t, this._cachedAnimations = void 0, this.${"$"}context = void 0 } _resolveAnimations() { const t = this._cachedAnimations; if (t) return t; const e = this.chart, i = this.options.setContext(this.getContext()), s = i.enabled && e.options.animation && i.animations, n = new ys(this.chart, s); return s._cacheable && (this._cachedAnimations = Object.freeze(n)), n } getContext() { return this.${"$"}context || (this.${"$"}context = (t = this.chart.getContext(), e = this, i = this._tooltipItems, _i(t, { tooltip: e, tooltipItems: i, type: "tooltip" }))); var t, e, i } getTitle(t, e) { const { callbacks: i } = e, s = i.beforeTitle.apply(this, [t]), n = i.title.apply(this, [t]), o = i.afterTitle.apply(this, [t]); let a = []; return a = No(a, Wo(s)), a = No(a, Wo(n)), a = No(a, Wo(o)), a } getBeforeBody(t, e) { return qo(e.callbacks.beforeBody.apply(this, [t])) } getBody(t, e) { const { callbacks: i } = e, s = []; return d(t, (t => { const e = { before: [], lines: [], after: [] }, n = Ko(i, t); No(e.before, Wo(n.beforeLabel.call(this, t))), No(e.lines, n.label.call(this, t)), No(e.after, Wo(n.afterLabel.call(this, t))), s.push(e) })), s } getAfterBody(t, e) { return qo(e.callbacks.afterBody.apply(this, [t])) } getFooter(t, e) { const { callbacks: i } = e, s = i.beforeFooter.apply(this, [t]), n = i.footer.apply(this, [t]), o = i.afterFooter.apply(this, [t]); let a = []; return a = No(a, Wo(s)), a = No(a, Wo(n)), a = No(a, Wo(o)), a } _createItems(t) { const e = this._active, i = this.chart.data, s = [], n = [], o = []; let a, r, l = []; for (a = 0, r = e.length; a < r; ++a)l.push(jo(this.chart, e[a])); return t.filter && (l = l.filter(((e, s, n) => t.filter(e, s, n, i)))), t.itemSort && (l = l.sort(((e, s) => t.itemSort(e, s, i)))), d(l, (e => { const i = Ko(t.callbacks, e); s.push(i.labelColor.call(this, e)), n.push(i.labelPointStyle.call(this, e)), o.push(i.labelTextColor.call(this, e)) })), this.labelColors = s, this.labelPointStyles = n, this.labelTextColors = o, this.dataPoints = l, l } update(t, e) { const i = this.options.setContext(this.getContext()), s = this._active; let n, o = []; if (s.length) { const t = Bo[i.position].call(this, s, this._eventPosition); o = this._createItems(i), this.title = this.getTitle(o, i), this.beforeBody = this.getBeforeBody(o, i), this.body = this.getBody(o, i), this.afterBody = this.getAfterBody(o, i), this.footer = this.getFooter(o, i); const e = this._size = Ho(this, i), a = Object.assign({}, t, e), r = Yo(this.chart, i, a), l = Uo(i, a, r, this.chart); this.xAlign = r.xAlign, this.yAlign = r.yAlign, n = { opacity: 1, x: l.x, y: l.y, width: e.width, height: e.height, caretX: t.x, caretY: t.y } } else 0 !== this.opacity && (n = { opacity: 0 }); this._tooltipItems = o, this.${"$"}context = void 0, n && this._resolveAnimations().update(this, n), t && i.external && i.external.call(this, { chart: this.chart, tooltip: this, replay: e }) } drawCaret(t, e, i, s) { const n = this.getCaretPosition(t, i, s); e.lineTo(n.x1, n.y1), e.lineTo(n.x2, n.y2), e.lineTo(n.x3, n.y3) } getCaretPosition(t, e, i) { const { xAlign: s, yAlign: n } = this, { caretSize: o, cornerRadius: a } = i, { topLeft: r, topRight: l, bottomLeft: h, bottomRight: c } = gi(a), { x: d, y: u } = t, { width: f, height: g } = e; let p, m, b, x, _, y; return "center" === n ? (_ = u + g / 2, "left" === s ? (p = d, m = p - o, x = _ + o, y = _ - o) : (p = d + f, m = p + o, x = _ - o, y = _ + o), b = p) : (m = "left" === s ? d + Math.max(r, h) + o : "right" === s ? d + f - Math.max(l, c) - o : this.caretX, "top" === n ? (x = u, _ = x - o, p = m - o, b = m + o) : (x = u + g, _ = x + o, p = m + o, b = m - o), y = x), { x1: p, x2: m, x3: b, y1: x, y2: _, y3: y } } drawTitle(t, e, i) { const s = this.title, n = s.length; let o, a, r; if (n) { const l = yi(i.rtl, this.x, this.width); for (t.x = Xo(this, i.titleAlign, i), e.textAlign = l.textAlign(i.titleAlign), e.textBaseline = "middle", o = mi(i.titleFont), a = i.titleSpacing, e.fillStyle = i.titleColor, e.font = o.string, r = 0; r < n; ++r)e.fillText(s[r], l.x(t.x), t.y + o.lineHeight / 2), t.y += o.lineHeight + a, r + 1 === n && (t.y += i.titleMarginBottom - a) } } _drawColorBox(t, e, i, s, o) { const a = this.labelColors[i], r = this.labelPointStyles[i], { boxHeight: l, boxWidth: h, boxPadding: c } = o, d = mi(o.bodyFont), u = Xo(this, "left", o), f = s.x(u), g = l < d.lineHeight ? (d.lineHeight - l) / 2 : 0, p = e.y + g; if (o.usePointStyle) { const e = { radius: Math.min(h, l) / 2, pointStyle: r.pointStyle, rotation: r.rotation, borderWidth: 1 }, i = s.leftForLtr(f, h) + h / 2, n = p + l / 2; t.strokeStyle = o.multiKeyBackground, t.fillStyle = o.multiKeyBackground, Me(t, e, i, n), t.strokeStyle = a.borderColor, t.fillStyle = a.backgroundColor, Me(t, e, i, n) } else { t.lineWidth = n(a.borderWidth) ? Math.max(...Object.values(a.borderWidth)) : a.borderWidth || 1, t.strokeStyle = a.borderColor, t.setLineDash(a.borderDash || []), t.lineDashOffset = a.borderDashOffset || 0; const e = s.leftForLtr(f, h - c), i = s.leftForLtr(s.xPlus(f, 1), h - c - 2), r = gi(a.borderRadius); Object.values(r).some((t => 0 !== t)) ? (t.beginPath(), t.fillStyle = o.multiKeyBackground, Le(t, { x: e, y: p, w: h, h: l, radius: r }), t.fill(), t.stroke(), t.fillStyle = a.backgroundColor, t.beginPath(), Le(t, { x: i, y: p + 1, w: h - 2, h: l - 2, radius: r }), t.fill()) : (t.fillStyle = o.multiKeyBackground, t.fillRect(e, p, h, l), t.strokeRect(e, p, h, l), t.fillStyle = a.backgroundColor, t.fillRect(i, p + 1, h - 2, l - 2)) } t.fillStyle = this.labelTextColors[i] } drawBody(t, e, i) { const { body: s } = this, { bodySpacing: n, bodyAlign: o, displayColors: a, boxHeight: r, boxWidth: l, boxPadding: h } = i, c = mi(i.bodyFont); let u = c.lineHeight, f = 0; const g = yi(i.rtl, this.x, this.width), p = function (i) { e.fillText(i, g.x(t.x + f), t.y + u / 2), t.y += u + n }, m = g.textAlign(o); let b, x, _, y, v, w, M; for (e.textAlign = o, e.textBaseline = "middle", e.font = c.string, t.x = Xo(this, m, i), e.fillStyle = i.bodyColor, d(this.beforeBody, p), f = a && "right" !== m ? "center" === o ? l / 2 + h : l + 2 + h : 0, y = 0, w = s.length; y < w; ++y) { for (b = s[y], x = this.labelTextColors[y], e.fillStyle = x, d(b.before, p), _ = b.lines, a && _.length && (this._drawColorBox(e, t, y, g, i), u = Math.max(c.lineHeight, r)), v = 0, M = _.length; v < M; ++v)p(_[v]), u = c.lineHeight; d(b.after, p) } f = 0, u = c.lineHeight, d(this.afterBody, p), t.y -= n } drawFooter(t, e, i) { const s = this.footer, n = s.length; let o, a; if (n) { const r = yi(i.rtl, this.x, this.width); for (t.x = Xo(this, i.footerAlign, i), t.y += i.footerMarginTop, e.textAlign = r.textAlign(i.footerAlign), e.textBaseline = "middle", o = mi(i.footerFont), e.fillStyle = i.footerColor, e.font = o.string, a = 0; a < n; ++a)e.fillText(s[a], r.x(t.x), t.y + o.lineHeight / 2), t.y += o.lineHeight + i.footerSpacing } } drawBackground(t, e, i, s) { const { xAlign: n, yAlign: o } = this, { x: a, y: r } = t, { width: l, height: h } = i, { topLeft: c, topRight: d, bottomLeft: u, bottomRight: f } = gi(s.cornerRadius); e.fillStyle = s.backgroundColor, e.strokeStyle = s.borderColor, e.lineWidth = s.borderWidth, e.beginPath(), e.moveTo(a + c, r), "top" === o && this.drawCaret(t, e, i, s), e.lineTo(a + l - d, r), e.quadraticCurveTo(a + l, r, a + l, r + d), "center" === o && "right" === n && this.drawCaret(t, e, i, s), e.lineTo(a + l, r + h - f), e.quadraticCurveTo(a + l, r + h, a + l - f, r + h), "bottom" === o && this.drawCaret(t, e, i, s), e.lineTo(a + u, r + h), e.quadraticCurveTo(a, r + h, a, r + h - u), "center" === o && "left" === n && this.drawCaret(t, e, i, s), e.lineTo(a, r + c), e.quadraticCurveTo(a, r, a + c, r), e.closePath(), e.fill(), s.borderWidth > 0 && e.stroke() } _updateAnimationTarget(t) { const e = this.chart, i = this.${"$"}animations, s = i && i.x, n = i && i.y; if (s || n) { const i = Bo[t.position].call(this, this._active, this._eventPosition); if (!i) return; const o = this._size = Ho(this, t), a = Object.assign({}, i, this._size), r = Yo(e, t, a), l = Uo(t, a, r, e); s._to === l.x && n._to === l.y || (this.xAlign = r.xAlign, this.yAlign = r.yAlign, this.width = o.width, this.height = o.height, this.caretX = i.x, this.caretY = i.y, this._resolveAnimations().update(this, l)) } } _willRender() { return !!this.opacity } draw(t) { const e = this.options.setContext(this.getContext()); let i = this.opacity; if (!i) return; this._updateAnimationTarget(e); const s = { width: this.width, height: this.height }, n = { x: this.x, y: this.y }; i = Math.abs(i) < .001 ? 0 : i; const o = pi(e.padding), a = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length; e.enabled && a && (t.save(), t.globalAlpha = i, this.drawBackground(n, t, s, e), vi(t, e.textDirection), n.y += o.top, this.drawTitle(n, t, e), this.drawBody(n, t, e), this.drawFooter(n, t, e), wi(t, e.textDirection), t.restore()) } getActiveElements() { return this._active || [] } setActiveElements(t, e) { const i = this._active, s = t.map((({ datasetIndex: t, index: e }) => { const i = this.chart.getDatasetMeta(t); if (!i) throw new Error("Cannot find a dataset at index " + t); return { datasetIndex: t, element: i.data[e], index: e } })), n = !u(i, s), o = this._positionChanged(s, e); (n || o) && (this._active = s, this._eventPosition = e, this._ignoreReplayEvents = !0, this.update(!0)) } handleEvent(t, e, i = !0) { if (e && this._ignoreReplayEvents) return !1; this._ignoreReplayEvents = !1; const s = this.options, n = this._active || [], o = this._getActiveElements(t, n, e, i), a = this._positionChanged(o, t), r = e || !u(o, n) || a; return r && (this._active = o, (s.enabled || s.external) && (this._eventPosition = { x: t.x, y: t.y }, this.update(!0, e))), r } _getActiveElements(t, e, i, s) { const n = this.options; if ("mouseout" === t.type) return []; if (!s) return e; const o = this.chart.getElementsAtEventForMode(t, n.mode, n, i); return n.reverse && o.reverse(), o } _positionChanged(t, e) { const { caretX: i, caretY: s, options: n } = this, o = Bo[n.position].call(this, t, e); return !1 !== o && (i !== o.x || s !== o.y) } } Go.positioners = Bo; var Zo = { id: "tooltip", _element: Go, positioners: Bo, afterInit(t, e, i) { i && (t.tooltip = new Go({ chart: t, options: i })) }, beforeUpdate(t, e, i) { t.tooltip && t.tooltip.initialize(i) }, reset(t, e, i) { t.tooltip && t.tooltip.initialize(i) }, afterDraw(t) { const e = t.tooltip; if (e && e._willRender()) { const i = { tooltip: e }; if (!1 === t.notifyPlugins("beforeTooltipDraw", i)) return; e.draw(t.ctx), t.notifyPlugins("afterTooltipDraw", i) } }, afterEvent(t, e) { if (t.tooltip) { const i = e.replay; t.tooltip.handleEvent(e.event, i, e.inChartArea) && (e.changed = !0) } }, defaults: { enabled: !0, external: null, position: "average", backgroundColor: "rgba(0,0,0,0.8)", titleColor: "#fff", titleFont: { weight: "bold" }, titleSpacing: 2, titleMarginBottom: 6, titleAlign: "left", bodyColor: "#fff", bodySpacing: 2, bodyFont: {}, bodyAlign: "left", footerColor: "#fff", footerSpacing: 2, footerMarginTop: 6, footerFont: { weight: "bold" }, footerAlign: "left", padding: 6, caretPadding: 2, caretSize: 5, cornerRadius: 6, boxHeight: (t, e) => e.bodyFont.size, boxWidth: (t, e) => e.bodyFont.size, multiKeyBackground: "#fff", displayColors: !0, boxPadding: 0, borderColor: "rgba(0,0,0,0)", borderWidth: 0, animation: { duration: 400, easing: "easeOutQuart" }, animations: { numbers: { type: "number", properties: ["x", "y", "width", "height", "caretX", "caretY"] }, opacity: { easing: "linear", duration: 200 } }, callbacks: { beforeTitle: t, title(t) { if (t.length > 0) { const e = t[0], i = e.chart.data.labels, s = i ? i.length : 0; if (this && this.options && "dataset" === this.options.mode) return e.dataset.label || ""; if (e.label) return e.label; if (s > 0 && e.dataIndex < s) return i[e.dataIndex] } return "" }, afterTitle: t, beforeBody: t, beforeLabel: t, label(t) { if (this && this.options && "dataset" === this.options.mode) return t.label + ": " + t.formattedValue || t.formattedValue; let e = t.dataset.label || ""; e && (e += ": "); const s = t.formattedValue; return i(s) || (e += s), e }, labelColor(t) { const e = t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex); return { borderColor: e.borderColor, backgroundColor: e.backgroundColor, borderWidth: e.borderWidth, borderDash: e.borderDash, borderDashOffset: e.borderDashOffset, borderRadius: 0 } }, labelTextColor() { return this.options.bodyColor }, labelPointStyle(t) { const e = t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex); return { pointStyle: e.pointStyle, rotation: e.rotation } }, afterLabel: t, afterBody: t, beforeFooter: t, footer: t, afterFooter: t } }, defaultRoutes: { bodyFont: "font", footerFont: "font", titleFont: "font" }, descriptors: { _scriptable: t => "filter" !== t && "itemSort" !== t && "external" !== t, _indexable: !1, callbacks: { _scriptable: !1, _indexable: !1 }, animation: { _fallback: !1 }, animations: { _fallback: "animation" } }, additionalOptionScopes: ["interaction"] }, Jo = Object.freeze({ __proto__: null, Decimation: go, Filler: To, Legend: Ro, SubTitle: Vo, Title: zo, Tooltip: Zo }); function Qo(t, e, i, s) { const n = t.indexOf(e); if (-1 === n) return ((t, e, i, s) => ("string" == typeof e ? (i = t.push(e) - 1, s.unshift({ index: i, label: e })) : isNaN(e) && (i = null), i))(t, e, i, s); return n !== t.lastIndexOf(e) ? i : n } class ta extends ${"$"}s { constructor(t) { super(t), this._startValue = void 0, this._valueRange = 0, this._addedLabels = [] } init(t) { const e = this._addedLabels; if (e.length) { const t = this.getLabels(); for (const { index: i, label: s } of e) t[i] === s && t.splice(i, 1); this._addedLabels = [] } super.init(t) } parse(t, e) { if (i(t)) return null; const s = this.getLabels(); return ((t, e) => null === t ? null : Z(Math.round(t), 0, e))(e = isFinite(e) && s[e] === t ? e : Qo(s, t, r(e, t), this._addedLabels), s.length - 1) } determineDataLimits() { const { minDefined: t, maxDefined: e } = this.getUserBounds(); let { min: i, max: s } = this.getMinMax(!0); "ticks" === this.options.bounds && (t || (i = 0), e || (s = this.getLabels().length - 1)), this.min = i, this.max = s } buildTicks() { const t = this.min, e = this.max, i = this.options.offset, s = []; let n = this.getLabels(); n = 0 === t && e === n.length - 1 ? n : n.slice(t, e + 1), this._valueRange = Math.max(n.length - (i ? 0 : 1), 1), this._startValue = this.min - (i ? .5 : 0); for (let i = t; i <= e; i++)s.push({ value: i }); return s } getLabelForValue(t) { const e = this.getLabels(); return t >= 0 && t < e.length ? e[t] : t } configure() { super.configure(), this.isHorizontal() || (this._reversePixels = !this._reversePixels) } getPixelForValue(t) { return "number" != typeof t && (t = this.parse(t)), null === t ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange) } getPixelForTick(t) { const e = this.ticks; return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value) } getValueForPixel(t) { return Math.round(this._startValue + this.getDecimalForPixel(t) * this._valueRange) } getBasePixel() { return this.bottom } } function ea(t, e, { horizontal: i, minRotation: s }) { const n = H(s), o = (i ? Math.sin(n) : Math.cos(n)) || .001, a = .75 * e * ("" + t).length; return Math.min(e / o, a) } ta.id = "category", ta.defaults = { ticks: { callback: ta.prototype.getLabelForValue } }; class ia extends ${"$"}s { constructor(t) { super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._endValue = void 0, this._valueRange = 0 } parse(t, e) { return i(t) || ("number" == typeof t || t instanceof Number) && !isFinite(+t) ? null : +t } handleTickRangeOptions() { const { beginAtZero: t } = this.options, { minDefined: e, maxDefined: i } = this.getUserBounds(); let { min: s, max: n } = this; const o = t => s = e ? s : t, a = t => n = i ? n : t; if (t) { const t = z(s), e = z(n); t < 0 && e < 0 ? a(0) : t > 0 && e > 0 && o(0) } if (s === n) { let e = 1; (n >= Number.MAX_SAFE_INTEGER || s <= Number.MIN_SAFE_INTEGER) && (e = Math.abs(.05 * n)), a(n + e), t || o(s - e) } this.min = s, this.max = n } getTickLimit() { const t = this.options.ticks; let e, { maxTicksLimit: i, stepSize: s } = t; return s ? (e = Math.ceil(this.max / s) - Math.floor(this.min / s) + 1, e > 1e3 && (console.warn(`scales.${"$"}{this.id}.ticks.stepSize: ${"$"}{s} would result generating up to ${"$"}{e} ticks. Limiting to 1000.`), e = 1e3)) : (e = this.computeTickLimit(), i = i || 11), i && (e = Math.min(i, e)), e } computeTickLimit() { return Number.POSITIVE_INFINITY } buildTicks() { const t = this.options, e = t.ticks; let s = this.getTickLimit(); s = Math.max(2, s); const n = function (t, e) { const s = [], { bounds: n, step: o, min: a, max: r, precision: l, count: h, maxTicks: c, maxDigits: d, includeBounds: u } = t, f = o || 1, g = c - 1, { min: p, max: m } = e, b = !i(a), x = !i(r), _ = !i(h), y = (m - p) / (d + 1); let v, w, M, k, S = F((m - p) / g / f) * f; if (S < 1e-14 && !b && !x) return [{ value: p }, { value: m }]; k = Math.ceil(m / S) - Math.floor(p / S), k > g && (S = F(k * S / g / f) * f), i(l) || (v = Math.pow(10, l), S = Math.ceil(S * v) / v), "ticks" === n ? (w = Math.floor(p / S) * S, M = Math.ceil(m / S) * S) : (w = p, M = m), b && x && o && W((r - a) / o, S / 1e3) ? (k = Math.round(Math.min((r - a) / S, c)), S = (r - a) / k, w = a, M = r) : _ ? (w = b ? a : w, M = x ? r : M, k = h - 1, S = (M - w) / k) : (k = (M - w) / S, k = N(k, Math.round(k), S / 1e3) ? Math.round(k) : Math.ceil(k)); const P = Math.max(Y(S), Y(w)); v = Math.pow(10, i(l) ? P : l), w = Math.round(w * v) / v, M = Math.round(M * v) / v; let D = 0; for (b && (u && w !== a ? (s.push({ value: a }), w < a && D++, N(Math.round((w + D * S) * v) / v, a, ea(a, y, t)) && D++) : w < a && D++); D < k; ++D)s.push({ value: Math.round((w + D * S) * v) / v }); return x && u && M !== r ? s.length && N(s[s.length - 1].value, r, ea(r, y, t)) ? s[s.length - 1].value = r : s.push({ value: r }) : x && M !== r || s.push({ value: M }), s }({ maxTicks: s, bounds: t.bounds, min: t.min, max: t.max, precision: e.precision, step: e.stepSize, count: e.count, maxDigits: this._maxDigits(), horizontal: this.isHorizontal(), minRotation: e.minRotation || 0, includeBounds: !1 !== e.includeBounds }, this._range || this); return "ticks" === t.bounds && j(n, this, "value"), t.reverse ? (n.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), n } configure() { const t = this.ticks; let e = this.min, i = this.max; if (super.configure(), this.options.offset && t.length) { const s = (i - e) / Math.max(t.length - 1, 1) / 2; e -= s, i += s } this._startValue = e, this._endValue = i, this._valueRange = i - e } getLabelForValue(t) { return li(t, this.chart.options.locale, this.options.ticks.format) } } class sa extends ia { determineDataLimits() { const { min: t, max: e } = this.getMinMax(!0); this.min = o(t) ? t : 0, this.max = o(e) ? e : 1, this.handleTickRangeOptions() } computeTickLimit() { const t = this.isHorizontal(), e = t ? this.width : this.height, i = H(this.options.ticks.minRotation), s = (t ? Math.sin(i) : Math.cos(i)) || .001, n = this._resolveTickFontOptions(0); return Math.ceil(e / Math.min(40, n.lineHeight / s)) } getPixelForValue(t) { return null === t ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange) } getValueForPixel(t) { return this._startValue + this.getDecimalForPixel(t) * this._valueRange } } function na(t) { return 1 === t / Math.pow(10, Math.floor(I(t))) } sa.id = "linear", sa.defaults = { ticks: { callback: Is.formatters.numeric } }; class oa extends ${"$"}s { constructor(t) { super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._valueRange = 0 } parse(t, e) { const i = ia.prototype.parse.apply(this, [t, e]); if (0 !== i) return o(i) && i > 0 ? i : null; this._zero = !0 } determineDataLimits() { const { min: t, max: e } = this.getMinMax(!0); this.min = o(t) ? Math.max(0, t) : null, this.max = o(e) ? Math.max(0, e) : null, this.options.beginAtZero && (this._zero = !0), this.handleTickRangeOptions() } handleTickRangeOptions() { const { minDefined: t, maxDefined: e } = this.getUserBounds(); let i = this.min, s = this.max; const n = e => i = t ? i : e, o = t => s = e ? s : t, a = (t, e) => Math.pow(10, Math.floor(I(t)) + e); i === s && (i <= 0 ? (n(1), o(10)) : (n(a(i, -1)), o(a(s, 1)))), i <= 0 && n(a(s, -1)), s <= 0 && o(a(i, 1)), this._zero && this.min !== this._suggestedMin && i === a(this.min, 0) && n(a(i, -1)), this.min = i, this.max = s } buildTicks() { const t = this.options, e = function (t, e) { const i = Math.floor(I(e.max)), s = Math.ceil(e.max / Math.pow(10, i)), n = []; let o = a(t.min, Math.pow(10, Math.floor(I(e.min)))), r = Math.floor(I(o)), l = Math.floor(o / Math.pow(10, r)), h = r < 0 ? Math.pow(10, Math.abs(r)) : 1; do { n.push({ value: o, major: na(o) }), ++l, 10 === l && (l = 1, ++r, h = r >= 0 ? 1 : h), o = Math.round(l * Math.pow(10, r) * h) / h } while (r < i || r === i && l < s); const c = a(t.max, o); return n.push({ value: c, major: na(o) }), n }({ min: this._userMin, max: this._userMax }, this); return "ticks" === t.bounds && j(e, this, "value"), t.reverse ? (e.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), e } getLabelForValue(t) { return void 0 === t ? "0" : li(t, this.chart.options.locale, this.options.ticks.format) } configure() { const t = this.min; super.configure(), this._startValue = I(t), this._valueRange = I(this.max) - I(t) } getPixelForValue(t) { return void 0 !== t && 0 !== t || (t = this.min), null === t || isNaN(t) ? NaN : this.getPixelForDecimal(t === this.min ? 0 : (I(t) - this._startValue) / this._valueRange) } getValueForPixel(t) { const e = this.getDecimalForPixel(t); return Math.pow(10, this._startValue + e * this._valueRange) } } function aa(t) { const e = t.ticks; if (e.display && t.display) { const t = pi(e.backdropPadding); return r(e.font && e.font.size, ne.font.size) + t.height } return 0 } function ra(t, e, i, s, n) { return t === s || t === n ? { start: e - i / 2, end: e + i / 2 } : t < s || t > n ? { start: e - i, end: e } : { start: e, end: e + i } } function la(t) { const e = { l: t.left + t._padding.left, r: t.right - t._padding.right, t: t.top + t._padding.top, b: t.bottom - t._padding.bottom }, i = Object.assign({}, e), n = [], o = [], a = t._pointLabels.length, r = t.options.pointLabels, l = r.centerPointLabels ? D / a : 0; for (let u = 0; u < a; u++) { const a = r.setContext(t.getPointLabelContext(u)); o[u] = a.padding; const f = t.getPointPosition(u, t.drawingArea + o[u], l), g = mi(a.font), p = (h = t.ctx, c = g, d = s(d = t._pointLabels[u]) ? d : [d], { w: ye(h, c.string, d), h: d.length * c.lineHeight }); n[u] = p; const m = K(t.getIndexAngle(u) + l), b = Math.round(${"$"}(m)); ha(i, e, m, ra(b, f.x, p.w, 0, 180), ra(b, f.y, p.h, 90, 270)) } var h, c, d; t.setCenterPoint(e.l - i.l, i.r - e.r, e.t - i.t, i.b - e.b), t._pointLabelItems = function (t, e, i) { const s = [], n = t._pointLabels.length, o = t.options, a = aa(o) / 2, r = t.drawingArea, l = o.pointLabels.centerPointLabels ? D / n : 0; for (let o = 0; o < n; o++) { const n = t.getPointPosition(o, r + a + i[o], l), h = Math.round(${"$"}(K(n.angle + L))), c = e[o], d = ua(n.y, c.h, h), u = ca(h), f = da(n.x, c.w, u); s.push({ x: n.x, y: d, textAlign: u, left: f, top: d, right: f + c.w, bottom: d + c.h }) } return s }(t, n, o) } function ha(t, e, i, s, n) { const o = Math.abs(Math.sin(i)), a = Math.abs(Math.cos(i)); let r = 0, l = 0; s.start < e.l ? (r = (e.l - s.start) / o, t.l = Math.min(t.l, e.l - r)) : s.end > e.r && (r = (s.end - e.r) / o, t.r = Math.max(t.r, e.r + r)), n.start < e.t ? (l = (e.t - n.start) / a, t.t = Math.min(t.t, e.t - l)) : n.end > e.b && (l = (n.end - e.b) / a, t.b = Math.max(t.b, e.b + l)) } function ca(t) { return 0 === t || 180 === t ? "center" : t < 180 ? "left" : "right" } function da(t, e, i) { return "right" === i ? t -= e : "center" === i && (t -= e / 2), t } function ua(t, e, i) { return 90 === i || 270 === i ? t -= e / 2 : (i > 270 || i < 90) && (t -= e), t } function fa(t, e, i, s) { const { ctx: n } = t; if (i) n.arc(t.xCenter, t.yCenter, e, 0, O); else { let i = t.getPointPosition(0, e); n.moveTo(i.x, i.y); for (let o = 1; o < s; o++)i = t.getPointPosition(o, e), n.lineTo(i.x, i.y) } } oa.id = "logarithmic", oa.defaults = { ticks: { callback: Is.formatters.logarithmic, major: { enabled: !0 } } }; class ga extends ia { constructor(t) { super(t), this.xCenter = void 0, this.yCenter = void 0, this.drawingArea = void 0, this._pointLabels = [], this._pointLabelItems = [] } setDimensions() { const t = this._padding = pi(aa(this.options) / 2), e = this.width = this.maxWidth - t.width, i = this.height = this.maxHeight - t.height; this.xCenter = Math.floor(this.left + e / 2 + t.left), this.yCenter = Math.floor(this.top + i / 2 + t.top), this.drawingArea = Math.floor(Math.min(e, i) / 2) } determineDataLimits() { const { min: t, max: e } = this.getMinMax(!1); this.min = o(t) && !isNaN(t) ? t : 0, this.max = o(e) && !isNaN(e) ? e : 0, this.handleTickRangeOptions() } computeTickLimit() { return Math.ceil(this.drawingArea / aa(this.options)) } generateTickLabels(t) { ia.prototype.generateTickLabels.call(this, t), this._pointLabels = this.getLabels().map(((t, e) => { const i = c(this.options.pointLabels.callback, [t, e], this); return i || 0 === i ? i : "" })).filter(((t, e) => this.chart.getDataVisibility(e))) } fit() { const t = this.options; t.display && t.pointLabels.display ? la(this) : this.setCenterPoint(0, 0, 0, 0) } setCenterPoint(t, e, i, s) { this.xCenter += Math.floor((t - e) / 2), this.yCenter += Math.floor((i - s) / 2), this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(t, e, i, s)) } getIndexAngle(t) { return K(t * (O / (this._pointLabels.length || 1)) + H(this.options.startAngle || 0)) } getDistanceFromCenterForValue(t) { if (i(t)) return NaN; const e = this.drawingArea / (this.max - this.min); return this.options.reverse ? (this.max - t) * e : (t - this.min) * e } getValueForDistanceFromCenter(t) { if (i(t)) return NaN; const e = t / (this.drawingArea / (this.max - this.min)); return this.options.reverse ? this.max - e : this.min + e } getPointLabelContext(t) { const e = this._pointLabels || []; if (t >= 0 && t < e.length) { const i = e[t]; return function (t, e, i) { return _i(t, { label: i, index: e, type: "pointLabel" }) }(this.getContext(), t, i) } } getPointPosition(t, e, i = 0) { const s = this.getIndexAngle(t) - L + i; return { x: Math.cos(s) * e + this.xCenter, y: Math.sin(s) * e + this.yCenter, angle: s } } getPointPositionForValue(t, e) { return this.getPointPosition(t, this.getDistanceFromCenterForValue(e)) } getBasePosition(t) { return this.getPointPositionForValue(t || 0, this.getBaseValue()) } getPointLabelPosition(t) { const { left: e, top: i, right: s, bottom: n } = this._pointLabelItems[t]; return { left: e, top: i, right: s, bottom: n } } drawBackground() { const { backgroundColor: t, grid: { circular: e } } = this.options; if (t) { const i = this.ctx; i.save(), i.beginPath(), fa(this, this.getDistanceFromCenterForValue(this._endValue), e, this._pointLabels.length), i.closePath(), i.fillStyle = t, i.fill(), i.restore() } } drawGrid() { const t = this.ctx, e = this.options, { angleLines: s, grid: n } = e, o = this._pointLabels.length; let a, r, l; if (e.pointLabels.display && function (t, e) { const { ctx: s, options: { pointLabels: n } } = t; for (let o = e - 1; o >= 0; o--) { const e = n.setContext(t.getPointLabelContext(o)), a = mi(e.font), { x: r, y: l, textAlign: h, left: c, top: d, right: u, bottom: f } = t._pointLabelItems[o], { backdropColor: g } = e; if (!i(g)) { const t = gi(e.borderRadius), i = pi(e.backdropPadding); s.fillStyle = g; const n = c - i.left, o = d - i.top, a = u - c + i.width, r = f - d + i.height; Object.values(t).some((t => 0 !== t)) ? (s.beginPath(), Le(s, { x: n, y: o, w: a, h: r, radius: t }), s.fill()) : s.fillRect(n, o, a, r) } Ae(s, t._pointLabels[o], r, l + a.lineHeight / 2, a, { color: e.color, textAlign: h, textBaseline: "middle" }) } }(this, o), n.display && this.ticks.forEach(((t, e) => { if (0 !== e) { r = this.getDistanceFromCenterForValue(t.value); !function (t, e, i, s) { const n = t.ctx, o = e.circular, { color: a, lineWidth: r } = e; !o && !s || !a || !r || i < 0 || (n.save(), n.strokeStyle = a, n.lineWidth = r, n.setLineDash(e.borderDash), n.lineDashOffset = e.borderDashOffset, n.beginPath(), fa(t, i, o, s), n.closePath(), n.stroke(), n.restore()) }(this, n.setContext(this.getContext(e - 1)), r, o) } })), s.display) { for (t.save(), a = o - 1; a >= 0; a--) { const i = s.setContext(this.getPointLabelContext(a)), { color: n, lineWidth: o } = i; o && n && (t.lineWidth = o, t.strokeStyle = n, t.setLineDash(i.borderDash), t.lineDashOffset = i.borderDashOffset, r = this.getDistanceFromCenterForValue(e.ticks.reverse ? this.min : this.max), l = this.getPointPosition(a, r), t.beginPath(), t.moveTo(this.xCenter, this.yCenter), t.lineTo(l.x, l.y), t.stroke()) } t.restore() } } drawBorder() { } drawLabels() { const t = this.ctx, e = this.options, i = e.ticks; if (!i.display) return; const s = this.getIndexAngle(0); let n, o; t.save(), t.translate(this.xCenter, this.yCenter), t.rotate(s), t.textAlign = "center", t.textBaseline = "middle", this.ticks.forEach(((s, a) => { if (0 === a && !e.reverse) return; const r = i.setContext(this.getContext(a)), l = mi(r.font); if (n = this.getDistanceFromCenterForValue(this.ticks[a].value), r.showLabelBackdrop) { t.font = l.string, o = t.measureText(s.label).width, t.fillStyle = r.backdropColor; const e = pi(r.backdropPadding); t.fillRect(-o / 2 - e.left, -n - l.size / 2 - e.top, o + e.width, l.size + e.height) } Ae(t, s.label, 0, -n, l, { color: r.color }) })), t.restore() } drawTitle() { } } ga.id = "radialLinear", ga.defaults = { display: !0, animate: !0, position: "chartArea", angleLines: { display: !0, lineWidth: 1, borderDash: [], borderDashOffset: 0 }, grid: { circular: !1 }, startAngle: 0, ticks: { showLabelBackdrop: !0, callback: Is.formatters.numeric }, pointLabels: { backdropColor: void 0, backdropPadding: 2, display: !0, font: { size: 10 }, callback: t => t, padding: 5, centerPointLabels: !1 } }, ga.defaultRoutes = { "angleLines.color": "borderColor", "pointLabels.color": "color", "ticks.color": "color" }, ga.descriptors = { angleLines: { _fallback: "grid" } }; const pa = { millisecond: { common: !0, size: 1, steps: 1e3 }, second: { common: !0, size: 1e3, steps: 60 }, minute: { common: !0, size: 6e4, steps: 60 }, hour: { common: !0, size: 36e5, steps: 24 }, day: { common: !0, size: 864e5, steps: 30 }, week: { common: !1, size: 6048e5, steps: 4 }, month: { common: !0, size: 2628e6, steps: 12 }, quarter: { common: !1, size: 7884e6, steps: 4 }, year: { common: !0, size: 3154e7 } }, ma = Object.keys(pa); function ba(t, e) { return t - e } function xa(t, e) { if (i(e)) return null; const s = t._adapter, { parser: n, round: a, isoWeekday: r } = t._parseOpts; let l = e; return "function" == typeof n && (l = n(l)), o(l) || (l = "string" == typeof n ? s.parse(l, n) : s.parse(l)), null === l ? null : (a && (l = "week" !== a || !B(r) && !0 !== r ? s.startOf(l, a) : s.startOf(l, "isoWeek", r)), +l) } function _a(t, e, i, s) { const n = ma.length; for (let o = ma.indexOf(t); o < n - 1; ++o) { const t = pa[ma[o]], n = t.steps ? t.steps : Number.MAX_SAFE_INTEGER; if (t.common && Math.ceil((i - e) / (n * t.size)) <= s) return ma[o] } return ma[n - 1] } function ya(t, e, i) { if (i) { if (i.length) { const { lo: s, hi: n } = tt(i, e); t[i[s] >= e ? i[s] : i[n]] = !0 } } else t[e] = !0 } function va(t, e, i) { const s = [], n = {}, o = e.length; let a, r; for (a = 0; a < o; ++a)r = e[a], n[r] = a, s.push({ value: r, major: !1 }); return 0 !== o && i ? function (t, e, i, s) { const n = t._adapter, o = +n.startOf(e[0].value, s), a = e[e.length - 1].value; let r, l; for (r = o; r <= a; r = +n.add(r, 1, s))l = i[r], l >= 0 && (e[l].major = !0); return e }(t, s, n, i) : s } class wa extends ${"$"}s { constructor(t) { super(t), this._cache = { data: [], labels: [], all: [] }, this._unit = "day", this._majorUnit = void 0, this._offsets = {}, this._normalized = !1, this._parseOpts = void 0 } init(t, e) { const i = t.time || (t.time = {}), s = this._adapter = new wn._date(t.adapters.date); s.init(e), b(i.displayFormats, s.formats()), this._parseOpts = { parser: i.parser, round: i.round, isoWeekday: i.isoWeekday }, super.init(t), this._normalized = e.normalized } parse(t, e) { return void 0 === t ? null : xa(this, t) } beforeLayout() { super.beforeLayout(), this._cache = { data: [], labels: [], all: [] } } determineDataLimits() { const t = this.options, e = this._adapter, i = t.time.unit || "day"; let { min: s, max: n, minDefined: a, maxDefined: r } = this.getUserBounds(); function l(t) { a || isNaN(t.min) || (s = Math.min(s, t.min)), r || isNaN(t.max) || (n = Math.max(n, t.max)) } a && r || (l(this._getLabelBounds()), "ticks" === t.bounds && "labels" === t.ticks.source || l(this.getMinMax(!1))), s = o(s) && !isNaN(s) ? s : +e.startOf(Date.now(), i), n = o(n) && !isNaN(n) ? n : +e.endOf(Date.now(), i) + 1, this.min = Math.min(s, n - 1), this.max = Math.max(s + 1, n) } _getLabelBounds() { const t = this.getLabelTimestamps(); let e = Number.POSITIVE_INFINITY, i = Number.NEGATIVE_INFINITY; return t.length && (e = t[0], i = t[t.length - 1]), { min: e, max: i } } buildTicks() { const t = this.options, e = t.time, i = t.ticks, s = "labels" === i.source ? this.getLabelTimestamps() : this._generate(); "ticks" === t.bounds && s.length && (this.min = this._userMin || s[0], this.max = this._userMax || s[s.length - 1]); const n = this.min, o = st(s, n, this.max); return this._unit = e.unit || (i.autoSkip ? _a(e.minUnit, this.min, this.max, this._getLabelCapacity(n)) : function (t, e, i, s, n) { for (let o = ma.length - 1; o >= ma.indexOf(i); o--) { const i = ma[o]; if (pa[i].common && t._adapter.diff(n, s, i) >= e - 1) return i } return ma[i ? ma.indexOf(i) : 0] }(this, o.length, e.minUnit, this.min, this.max)), this._majorUnit = i.major.enabled && "year" !== this._unit ? function (t) { for (let e = ma.indexOf(t) + 1, i = ma.length; e < i; ++e)if (pa[ma[e]].common) return ma[e] }(this._unit) : void 0, this.initOffsets(s), t.reverse && o.reverse(), va(this, o, this._majorUnit) } afterAutoSkip() { this.options.offsetAfterAutoskip && this.initOffsets(this.ticks.map((t => +t.value))) } initOffsets(t) { let e, i, s = 0, n = 0; this.options.offset && t.length && (e = this.getDecimalForValue(t[0]), s = 1 === t.length ? 1 - e : (this.getDecimalForValue(t[1]) - e) / 2, i = this.getDecimalForValue(t[t.length - 1]), n = 1 === t.length ? i : (i - this.getDecimalForValue(t[t.length - 2])) / 2); const o = t.length < 3 ? .5 : .25; s = Z(s, 0, o), n = Z(n, 0, o), this._offsets = { start: s, end: n, factor: 1 / (s + 1 + n) } } _generate() { const t = this._adapter, e = this.min, i = this.max, s = this.options, n = s.time, o = n.unit || _a(n.minUnit, e, i, this._getLabelCapacity(e)), a = r(n.stepSize, 1), l = "week" === o && n.isoWeekday, h = B(l) || !0 === l, c = {}; let d, u, f = e; if (h && (f = +t.startOf(f, "isoWeek", l)), f = +t.startOf(f, h ? "day" : o), t.diff(i, e, o) > 1e5 * a) throw new Error(e + " and " + i + " are too far apart with stepSize of " + a + " " + o); const g = "data" === s.ticks.source && this.getDataTimestamps(); for (d = f, u = 0; d < i; d = +t.add(d, a, o), u++)ya(c, d, g); return d !== i && "ticks" !== s.bounds && 1 !== u || ya(c, d, g), Object.keys(c).sort(((t, e) => t - e)).map((t => +t)) } getLabelForValue(t) { const e = this._adapter, i = this.options.time; return i.tooltipFormat ? e.format(t, i.tooltipFormat) : e.format(t, i.displayFormats.datetime) } _tickFormatFunction(t, e, i, s) { const n = this.options, o = n.time.displayFormats, a = this._unit, r = this._majorUnit, l = a && o[a], h = r && o[r], d = i[e], u = r && h && d && d.major, f = this._adapter.format(t, s || (u ? h : l)), g = n.ticks.callback; return g ? c(g, [f, e, i], this) : f } generateTickLabels(t) { let e, i, s; for (e = 0, i = t.length; e < i; ++e)s = t[e], s.label = this._tickFormatFunction(s.value, e, t) } getDecimalForValue(t) { return null === t ? NaN : (t - this.min) / (this.max - this.min) } getPixelForValue(t) { const e = this._offsets, i = this.getDecimalForValue(t); return this.getPixelForDecimal((e.start + i) * e.factor) } getValueForPixel(t) { const e = this._offsets, i = this.getDecimalForPixel(t) / e.factor - e.end; return this.min + i * (this.max - this.min) } _getLabelSize(t) { const e = this.options.ticks, i = this.ctx.measureText(t).width, s = H(this.isHorizontal() ? e.maxRotation : e.minRotation), n = Math.cos(s), o = Math.sin(s), a = this._resolveTickFontOptions(0).size; return { w: i * n + a * o, h: i * o + a * n } } _getLabelCapacity(t) { const e = this.options.time, i = e.displayFormats, s = i[e.unit] || i.millisecond, n = this._tickFormatFunction(t, 0, va(this, [t], this._majorUnit), s), o = this._getLabelSize(n), a = Math.floor(this.isHorizontal() ? this.width / o.w : this.height / o.h) - 1; return a > 0 ? a : 1 } getDataTimestamps() { let t, e, i = this._cache.data || []; if (i.length) return i; const s = this.getMatchingVisibleMetas(); if (this._normalized && s.length) return this._cache.data = s[0].controller.getAllParsedValues(this); for (t = 0, e = s.length; t < e; ++t)i = i.concat(s[t].controller.getAllParsedValues(this)); return this._cache.data = this.normalize(i) } getLabelTimestamps() { const t = this._cache.labels || []; let e, i; if (t.length) return t; const s = this.getLabels(); for (e = 0, i = s.length; e < i; ++e)t.push(xa(this, s[e])); return this._cache.labels = this._normalized ? t : this.normalize(t) } normalize(t) { return rt(t.sort(ba)) } } function Ma(t, e, i) { let s, n, o, a, r = 0, l = t.length - 1; i ? (e >= t[r].pos && e <= t[l].pos && ({ lo: r, hi: l } = et(t, "pos", e)), ({ pos: s, time: o } = t[r]), ({ pos: n, time: a } = t[l])) : (e >= t[r].time && e <= t[l].time && ({ lo: r, hi: l } = et(t, "time", e)), ({ time: s, pos: o } = t[r]), ({ time: n, pos: a } = t[l])); const h = n - s; return h ? o + (a - o) * (e - s) / h : o } wa.id = "time", wa.defaults = { bounds: "data", adapters: {}, time: { parser: !1, unit: !1, round: !1, isoWeekday: !1, minUnit: "millisecond", displayFormats: {} }, ticks: { source: "auto", major: { enabled: !1 } } }; class ka extends wa { constructor(t) { super(t), this._table = [], this._minPos = void 0, this._tableRange = void 0 } initOffsets() { const t = this._getTimestampsForTable(), e = this._table = this.buildLookupTable(t); this._minPos = Ma(e, this.min), this._tableRange = Ma(e, this.max) - this._minPos, super.initOffsets(t) } buildLookupTable(t) { const { min: e, max: i } = this, s = [], n = []; let o, a, r, l, h; for (o = 0, a = t.length; o < a; ++o)l = t[o], l >= e && l <= i && s.push(l); if (s.length < 2) return [{ time: e, pos: 0 }, { time: i, pos: 1 }]; for (o = 0, a = s.length; o < a; ++o)h = s[o + 1], r = s[o - 1], l = s[o], Math.round((h + r) / 2) !== l && n.push({ time: l, pos: o / (a - 1) }); return n } _getTimestampsForTable() { let t = this._cache.all || []; if (t.length) return t; const e = this.getDataTimestamps(), i = this.getLabelTimestamps(); return t = e.length && i.length ? this.normalize(e.concat(i)) : e.length ? e : i, t = this._cache.all = t, t } getDecimalForValue(t) { return (Ma(this._table, t) - this._minPos) / this._tableRange } getValueForPixel(t) { const e = this._offsets, i = this.getDecimalForPixel(t) / e.factor - e.end; return Ma(this._table, i * this._tableRange + this._minPos, !0) } } ka.id = "timeseries", ka.defaults = wa.defaults; var Sa = Object.freeze({ __proto__: null, CategoryScale: ta, LinearScale: sa, LogarithmicScale: oa, RadialLinearScale: ga, TimeScale: wa, TimeSeriesScale: ka }); return bn.register(Bn, Sa, co, Jo), bn.helpers = { ...Ti }, bn._adapters = wn, bn.Animation = xs, bn.Animations = ys, bn.animator = mt, bn.controllers = Us.controllers.items, bn.DatasetController = Ls, bn.Element = Es, bn.elements = co, bn.Interaction = Vi, bn.layouts = Zi, bn.platforms = ps, bn.Scale = ${"$"}s, bn.Ticks = Is, Object.assign(bn, Bn, Sa, co, Jo, ps), bn.Chart = bn, "undefined" != typeof window && (window.Chart = bn), bn }));

       function gradeGraphs(recapData) {
        if (!n(recapData)) {
            Chart.defaults.color = '#fff';
            var recapCanvas = document.getElementById('recap-chart');
            var recapCtx = recapCanvas.getContext('2d');
            var recapGradient = recapCtx.createLinearGradient(0, 0, 0, 300);
            recapGradient.addColorStop(0, '#fff');
            recapGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            var recapPoints = [];
            var recapDates = [];
            for (const grade of recapData.grades) {
                if (!isNaN(grade.cijfer)) {
                    recapPoints.unshift(grade.cijfer);
                    recapDates.push('Mysterieus vak');
                }
            }
            var recapChartData = {
                labels: recapDates,
                datasets: [{
                    label: 'Mysterieus vak',
                    fill: false,
                    lineTension: 0,
                    backgroundColor: recapGradient,
                    fill: true,
                    borderColor: '#fff',
                    data: recapPoints.reverse(),
                    pointStyle: 'circle',
                    pointRadius: 3,
                    pointHoverRadius: 7,
                    hitRadius: 500,
                }],
            };
            var recapChart = new Chart(recapCtx, {
                type: 'line',
                data: recapChartData,
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
                        x: {
                            ticks: {
                                display: false,
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
            return;
        }
        if (n(document.getElementById('mod-chart-1')) || n(document.getElementById('mod-chart-2'))) {
            return;
        }
        Chart.defaults.color = darkmode ? '#fff' : '#000';
        let canvas = document.getElementById('mod-chart-1');
        let ctx = canvas.getContext('2d');
        let points = [];
        let weight = [];
        let dates = [];
        let dateObjects = [];
        const color = toBrightnessValue(get('primarycolor'), 150);
        const endcolor = hexToRgb(color);
        var gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(' + endcolor[0] + ',' + endcolor[1] + ',' + endcolor[2] + ',0)');
        for (const element of tn('sl-resultaat-item')) {
            if (!n(element.getElementsByClassName('cijfer')[0]) && !n(element.getElementsByClassName('cijfer')[0].children[0])) {
                if (element.getElementsByClassName('weging')[0].innerHTML.replace(',', '.').match(/[0-9]+(\.[0-9]+)?/) == null) {
                    continue;
                }
                const weging = parseFloat(element.getElementsByClassName('weging')[0].innerHTML.replace(',', '.').match(/[0-9]+(\.[0-9]+)?/)[0]);
                let grade = parseFloat(element.getElementsByClassName('cijfer')[0].children[0].innerHTML.replace(',', '.'));

                let dateObject;
                const dateString = n(element.getElementsByClassName('subtitel')[0]) ? '' : element.getElementsByClassName('subtitel')[0].innerHTML;
                if (dateString.indexOf('Vandaag') != -1) {
                    dateObject = Date.now();
                }
                else if (dateString.indexOf('Gisteren') != -1) {
                    dateObject = new Date(Date.now() - 86400000);
                }
                else {
                                                          let englishDateString = dateString.replace('mrt', 'mar').replace('mei', 'may').replace('mei', 'may').replace('okt', 'oct');
                                       if (englishDateString.match(".*?[0-9]{4}") == null) {
                        englishDateString += ' ' + year;
                    }
                    dateObject = Date.parse(englishDateString);
                }

                if (isNaN(grade) && weging != 0) {
                    let letterbeoordelingen = parseJSON(get('letterbeoordelingen'));
                    const letter = element.getElementsByClassName('cijfer')[0].children[0].innerHTML.replace(',', '.');
                    if (letterbeoordelingen == null || letterbeoordelingen[letter] == null) {
                                               showLetterbeoordelingenMessage(letter);
                    }
                    else if (isNaN(letterbeoordelingen[letter])) {
                                               continue;
                    }
                    else {
                                               grade = letterbeoordelingen[letter];
                    }
                }

                if (!isNaN(grade)) {
                    if (dateObjects.length == 0) {
                        points.push(grade);
                        dates.push(dateString);
                        dateObjects.push(dateObject);
                        weight.push(weging);
                    }
                    else {
                                               for (let i = 0; i < dateObjects.length; i++) {
                            if (dateObject <= dateObjects[i]) {
                                points.splice(i, 0, grade);
                                dates.splice(i, 0, dateString);
                                dateObjects.splice(i, 0, dateObject);
                                weight.splice(i, 0, weging);
                                break;
                            }
                            else if (i >= dateObjects.length - 1) {
                                points.push(grade);
                                dates.push(dateString);
                                dateObjects.push(dateObject);
                                weight.push(weging);
                                break;
                            }
                        }
                    }
                }
            }
        }
               let totalWeight = 0;
        let weightedSum = 0;
        for (let i = 0; i < points.length; i++) {
            let w = weight[i];
            if (w > 50) w = 1;
            totalWeight += w;
            weightedSum += points[i] * w;
        }
        let suggestionText = "Er zijn nog niet genoeg cijfers om een analyse te maken.";
        if (totalWeight > 0) {
            const average = weightedSum / totalWeight;
            const roundedAverage = (Math.round(average * 10) / 10).toString().replace('.', ',');
                       let trend = "stabiel";
            if (points.length >= 2) {
                let recentSum = 0;
                let recentWeight = 0;
                let count = 0;
                for (let i = points.length - 1; i >= 0 && count < 3; i--) {
                    let wRecent = weight[i];
                    if (wRecent > 50) wRecent = 1;
                    recentSum += points[i] * wRecent;
                    recentWeight += wRecent;
                    count++;
                }
                if (recentWeight > 0) {
                    const recentAverage = recentSum / recentWeight;
                    if (recentAverage > average + 0.3) trend = "stijgend";
                    else if (recentAverage < average - 0.3) trend = "dalend";
                }
            }
            let advice = "";
            if (average < 5.5) {
                const needed = ((5.5 * (totalWeight + 1)) - weightedSum);
                advice = `Je staat helaas onvoldoende (${"$"}{roundedAverage}). Probeer een <b>${"$"}{Math.ceil(needed * 10) / 10}</b> of hoger te halen voor je volgende toets (1x wegend) om weer voldoende te staan. Zet 'm op!`;
            } else if (average < 6.5) {
                advice = `Je staat een voldoende (${"$"}{roundedAverage}), maar het kan altijd beter! Blijf goed opletten in de les.`;
            } else if (average < 7.5) {
                advice = `Lekker bezig! Je staat een mooie ${"$"}{roundedAverage}. Ga zo door!`;
            } else {
                advice = `Wauw! Je staat een ${"$"}{roundedAverage}! Jij bent echt goed bezig!`;
            }
            let trendText = "";
            if (trend == "stijgend") trendText = " <br>🚀 Je laatste cijfers zitten in de lift!";
            else if (trend == "dalend") trendText = " <br>📉 Pas op, je laatste cijfers zijn wat lager dan gemiddeld.";
            suggestionText = advice + trendText;
        }
        if (!n(id('mod-grade-suggestions'))) {
            id('mod-grade-suggestions').innerHTML = suggestionText;
        }
        if (points.length < 2) {
            hide(id('mod-grades-graphs'));
            return;
        }
        var chartdata = {
            labels: dates,
            datasets: [{
                label: (n(cn('vaknaam', 0)) || n(cn('vaknaam', 0).getElementsByTagName('span')[0])) ? '' : cn('vaknaam', 0).getElementsByTagName('span')[0].innerHTML,
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
            data: chartdata,
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
        canvas = document.getElementById('mod-chart-2');
        ctx = canvas.getContext('2d');
        let values = [];
        var totalGrades = 0;
        var rollingTotalWeight = 0;
        for (let i = 0; i < points.length; i++) {
            const grade = points[i];
            let wRolling = weight[i];
            if (wRolling > 50) wRolling = 1;
            totalGrades += points[i] * wRolling;
            rollingTotalWeight += wRolling;
            values.push(Math.floor((totalGrades / rollingTotalWeight) * 100) / 100);
        }
        chartdata = {
            labels: dates,
            datasets: [{
                label: (n(cn('vaknaam', 0)) || n(cn('vaknaam', 0).getElementsByTagName('span')[0])) ? '' : cn('vaknaam', 0).getElementsByTagName('span')[0].innerHTML,
                fill: false,
                lineTension: 0,
                backgroundColor: gradient,
                fill: true,
                borderColor: color,
                data: values,
                pointStyle: 'circle',
                pointRadius: 3,
                pointHoverRadius: 7,
                hitRadius: 500
            }]
        };
        chart = new Chart(ctx, {
            type: 'line',
            data: chartdata,
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

    function showLetterbeoordelingenMessage(letter) {
        let list = {
            'U': ['Uitstekend', 10],
            'ZG': ['Zeer goed', 9],
            'G': ['Goed', 8],
            'RV': ['Ruim voldoende', 7],
            'V': ['Voldoende', 6],
            'T': ['Twijfel', 5],
            'M': ['Matig', 5],
            'O': ['Onvoldoende', 4],
            'RO': ['Ruim onvoldoende', 3],
            'S': ['Slecht', 2],
            'ZS': ['Zeer slecht', 1],
            'A': ['Af', 10],
            'B': ['Bijna', 5.5],
            'N': ['Niet af', 1],
            'L': ['Lopend', 1],
        };
        let letterbeoordelingen = parseJSON(get('letterbeoordelingen'));
        if (letter != null && !n(letterbeoordelingen) && letterbeoordelingen[letter] == '-') {
            return;
        }
        if (letterbeoordelingen) {
            for (const [key, value] of Object.entries(letterbeoordelingen)) {
                list[key] = [list[key] ? list[key][0] : key, value];
            }
        }
        if (letter != null && list[letter] == null) {
            list[letter] = [];
        }
        let listHTML = '';
        for (const [key, value] of Object.entries(list)) {
            listHTML += '<div><label>' + key + (value[0] ? ' (' + value[0] + ')' : '') + '</label><input class="mod-letterbeoordelingen-letter" value="' + value[1] + '" data-mod-letter="' + key + '" type="number" placeholder="' + (value[0] ? value[0] : key) + '"></div>';
        }
        modMessage('Letterbeoordelingen', 'Bij sommige scholen tellen letterbeoordelingen (O, V, G, etc) mee voor je gemiddelde. Helaas verschilt het per school hoeveel een letter als cijfer waard is. Vul hieronder in hoeveel elke letter waard is.</p><div id="mod-letterbeoordelingen">' + listHTML + '</div><p>', 'Opslaan', 'Sluiten');
        id('mod-message-action1').addEventListener('click', function () {
            if (letterbeoordelingen == null) {
                letterbeoordelingen = {};
            }
                       for (const element of cn('mod-letterbeoordelingen-letter')) {
                if (!isNaN(parseFloat(element.value))) {
                    letterbeoordelingen[element.dataset.modLetter] = element.value;
                }
                else {
                                       letterbeoordelingen[element.dataset.modLetter] = '-';
                }
            }
            console.log(letterbeoordelingen);
            set('letterbeoordelingen', JSON.stringify(letterbeoordelingen));
            closeModMessage();
        });
        id('mod-message-action2').addEventListener('click', function () {
                       if (letterbeoordelingen == null) {
                letterbeoordelingen = {};
            }
            for (const element of cn('mod-letterbeoordelingen-letter')) {
                               letterbeoordelingen[element.dataset.modLetter] = '-';
            }
            set('letterbeoordelingen', JSON.stringify(letterbeoordelingen));
            closeModMessage();
        });
    }

    function calculateAverage() {
        let total = 0;
        let weight = 0;
        for (const element of document.getElementsByTagName('sl-resultaat-item')) {
                       if (!n(element.getElementsByClassName('cijfer')[0]) && !n(element.getElementsByClassName('cijfer')[0].children[0]) && !n(element.getElementsByClassName('weging')[0])) {

                                              if (element.getElementsByClassName('weging')[0].innerHTML.replace(',', '.').match(/[0-9]+(\.[0-9]+)?/) == null) {
                    continue;
                }
                const tempWeight = parseFloat(element.getElementsByClassName('weging')[0].innerHTML.replace(',', '.').match(/[0-9]+(\.[0-9]+)?/)[0]);
                const tempGrade = parseFloat(element.getElementsByClassName('cijfer')[0].children[0].innerHTML.replace(',', '.'));

                               if (isNaN(tempGrade)) {
                                       if (tempWeight != 0) {
                        let letterbeoordelingen = parseJSON(get('letterbeoordelingen'));
                        const letter = element.getElementsByClassName('cijfer')[0].children[0].innerHTML.replace(',', '.');
                        if (letterbeoordelingen == null || letterbeoordelingen[letter] == null) {
                                                       if (element.getElementsByClassName('cijfer')[0].classList.contains('neutraal')) {
                                continue;
                            }
                                                       showLetterbeoordelingenMessage(letter);
                        }
                        else if (isNaN(letterbeoordelingen[letter])) {
                                                       continue;
                        }
                        else {
                                                       total += letterbeoordelingen[letter] * tempWeight;
                            weight += tempWeight;
                        }
                    }
                }
                else {
                    total += tempGrade * tempWeight;
                    weight += tempWeight;
                }
            }
        }
        return {
            'total': total,
            'weight': weight,
        };
    }

    function subjectGradesPageContainsNumberGrades() {
        for (const element of tn('sl-resultaat-item')) {
            if (element.getElementsByClassName('cijfer')[0]) {
                if (!isNaN(parseFloat(element.getElementsByClassName('cijfer')[0].innerText.replace(',', '.')))) {
                    return true;
                }
            }
        }
        return false;
    }

       function insertCalculationTool() {
        if (n(id('mod-grade-calculate')) && !n(tn('sl-resultaat-item', 0)) && get('bools').charAt(BOOL_INDEX.CALCULATION_TOOL) == '1') {
            if (!subjectGradesPageContainsNumberGrades()) {
                return;
            }
            tn('sl-vakresultaten', 0).insertAdjacentHTML('beforeend', '<div id="mod-grade-calculate"><h3>Gemiddelde berekenen</h3><p>Wat moet ik halen?</p><input id="mod-grade-one-one" type="number" placeholder="Ik wil staan"><input id="mod-grade-one-two" type="number" placeholder="Weging aankomend cijfer"><input id="mod-grade-one-three" type="submit" value="Berekenen"><br><p>Wat ga ik staan?</p><input id="mod-grade-two-one" type="number" placeholder="Ik haal een"><input id="mod-grade-two-two" type="number" placeholder="Met de weging"/><input id="mod-grade-two-three" type="submit" value="Berekenen"/></div>');
            id('mod-grade-one-three').addEventListener('click', function () {
                let averageData = calculateAverage();
                               let chosenAverage = parseFloat(id('mod-grade-one-one').value);
                let chosenWeight = parseFloat(id('mod-grade-one-two').value);
                if (isNaN(chosenAverage) || isNaN(chosenWeight)) {
                    id('mod-grade-one-three').value = 'Berekenen';
                }
                else {
                    id('mod-grade-one-three').value = (Math.ceil(((chosenAverage * (chosenWeight + averageData['weight']) - averageData['total']) / chosenWeight) * 100) / 100).toFixed(2).toString().replace('.', ',');
                }
            });
            id('mod-grade-two-three').addEventListener('click', function () {
                let averageData = calculateAverage();
                               let chosenGrade = parseFloat(id('mod-grade-two-one').value);
                let chosenWeight = parseFloat(id('mod-grade-two-two').value);
                if (isNaN(chosenGrade) || isNaN(chosenWeight)) {
                    id('mod-grade-two-three').value = 'Berekenen';
                }
                else {
                    averageData['total'] += chosenGrade * chosenWeight;
                    averageData['weight'] += chosenWeight;
                    id('mod-grade-two-three').value = (Math.floor((averageData['total'] / averageData['weight']) * 100) / 100).toFixed(2).toString().replace('.', ',');
                }
            });
        }
    }

       function insertGradeDownloadButton() {
               if (platform == 'Android') {
            return;
        }
        if (!n(tn('sl-cijfer-overzicht', 0))) {
            tryRemove(id('mod-grades-download-computer'));
            tryRemove(id('mod-grades-download-mobile'));
        }
        else if ((!n(tn('sl-resultaat-item', 0)) || !n(tn('sl-vakgemiddelde-item', 0))) && n(tn('sl-vakresultaten', 0)) && get('bools').charAt(BOOL_INDEX.GRADE_DOWNLOAD_BTN) == "1") {
            if (n(id('mod-grades-download-computer')) && !n(tn('hmy-switch-group', 0))) {
                tn('hmy-switch-group', 0).insertAdjacentHTML('beforeend', '<a id="mod-grades-download-computer" class="mod-grades-download">' + getIcon('download', null, 'var(--fg-primary-normal)') + '</a>');
                id('mod-grades-download-computer').addEventListener('click', downloadGrades);
            }
            if (n(id('mod-grades-download-mobile')) && !n(cn('tabs ng-star-inserted', 0))) {
                if (document.documentElement.clientWidth > 767) {
                    cn('tabs ng-star-inserted', 0).getElementsByClassName('filler')[0].insertAdjacentHTML('beforeend', '<a id="mod-grades-download-mobile" class="mod-grades-download">' + getIcon('download', null, 'var(--fg-primary-normal)') + '</a>');
                    id('mod-grades-download-mobile').addEventListener('click', downloadGrades);
                }
                else {
                    tn('sl-scrollable-title', 0).insertAdjacentHTML('beforeend', '<a id="mod-grades-download-mobile" class="mod-grades-download">' + getIcon('download', null, 'var(--fg-primary-normal)') + '</a>');
                    id('mod-grades-download-mobile').addEventListener('click', downloadGrades);
                }
            }
        }
    }

       function gradeDefenderGame() {
               if (id('grade-defender-canvas')) id('grade-defender-canvas').remove();
        if (id('grade-defender-ui')) id('grade-defender-ui').remove();
        if (id('grade-defender-close')) id('grade-defender-close').remove();
        if (id('grade-defender-gameover')) id('grade-defender-gameover').remove();

        tn('body', 0).insertAdjacentHTML('beforeend', `
            <canvas id="grade-defender-canvas" class="active"></canvas>
            <div id="grade-defender-ui" class="active">Score: <span id="gd-score">0</span> | Levens: <span id="gd-lives">3</span></div>
            <div id="grade-defender-close" class="active">&times;</div>
            <div id="grade-defender-gameover">
                <h1>GAME OVER</h1>
                <h3>Je score: <span id="gd-final-score"></span></h3>
                <div id="grade-defender-restart">Opnieuw</div>
            </div>
        `);

        const canvas = id('grade-defender-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let score = 0;
        let lives = 3;
        let gameRunning = true;
        let enemies = [];
        let projectiles = [];
        let playerX = canvas.width / 2;
        let lastTime = 0;
        let spawnTimer = 0;

              
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);

               canvas.addEventListener('mousemove', (e) => {
            playerX = e.clientX;
        });
        canvas.addEventListener('touchmove', (e) => {
            playerX = e.touches[0].clientX;
        });
        canvas.addEventListener('click', () => {
            if (gameRunning) {
                projectiles.push({ x: playerX, y: canvas.height - 60, speed: 10 });
            }
        });

               id('grade-defender-close').addEventListener('click', () => {
            gameRunning = false;
            canvas.remove();
            id('grade-defender-ui').remove();
            id('grade-defender-close').remove();
            id('grade-defender-gameover').remove();
            tn('html', 0).style.overflowY = 'auto';
        });

               id('grade-defender-restart').addEventListener('click', () => {
            score = 0;
            lives = 3;
            enemies = [];
            projectiles = [];
            gameRunning = true;
            id('grade-defender-gameover').classList.remove('active');
            requestAnimationFrame(gameLoop);
        });

        tn('html', 0).style.overflowY = 'hidden';

        function gameLoop(timestamp) {
            if (!gameRunning) return;
            const dt = timestamp - lastTime;
            lastTime = timestamp;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

                       spawnTimer += dt;
            if (spawnTimer > 1000) {                const type = Math.random();
                let text = (Math.floor(Math.random() * 40) + 10) / 10;                let isBad = true;
                if (type > 0.8) {
                    text = (Math.floor(Math.random() * 45) + 55) / 10;                    isBad = false;
                }
                enemies.push({
                    x: Math.random() * (canvas.width - 50) + 25,
                    y: -50,
                    text: text.toFixed(1),
                    isBad: isBad,
                    speed: Math.random() * 2 + 1 + (score / 50)                });
                spawnTimer = 0;
            }

                       ctx.fillStyle = '#0099ff';
            for (let i = 0; i < projectiles.length; i++) {
                let p = projectiles[i];
                p.y -= p.speed;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                ctx.fill();
                if (p.y < 0) {
                    projectiles.splice(i, 1);
                    i--;
                }
            }

                       ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            for (let i = 0; i < enemies.length; i++) {
                let e = enemies[i];
                e.y += e.speed;

                ctx.fillStyle = e.isBad ? '#ff4444' : '#44ff44';
                ctx.fillText(e.text, e.x, e.y);

                               if (e.y > canvas.height) {
                    enemies.splice(i, 1);
                    i--;
                    if (e.isBad) {
                        lives--;
                        id('gd-lives').innerText = lives;
                        if (lives <= 0) {
                            gameRunning = false;
                            id('grade-defender-gameover').classList.add('active');
                            id('gd-final-score').innerText = score;
                        }
                    }
                }

                               for (let j = 0; j < projectiles.length; j++) {
                    let p = projectiles[j];
                    let dist = Math.hypot(p.x - e.x, p.y - e.y);
                    if (dist < 30) {
                                               projectiles.splice(j, 1);
                        enemies.splice(i, 1);
                        i--;
                        if (e.isBad) {
                            score += 10;
                        } else {
                            score -= 20;                        }
                        id('gd-score').innerText = score;
                        break;
                    }
                }
            }

                       ctx.fillStyle = '#fff';
            ctx.fillRect(playerX - 25, canvas.height - 50, 50, 20);
            ctx.fillRect(playerX - 5, canvas.height - 70, 10, 20);

            requestAnimationFrame(gameLoop);
        }
        requestAnimationFrame(gameLoop);
    }

       function subjectGradesPage() {
        if (!n(tn('sl-vakresultaten', 0))) {
            execute([insertCalculationTool]);
            const examPage = !n(tn('sl-examenresultaten', 0));
                       const firstCondition = n(id('mod-grades-graphs')) && get('bools').charAt(BOOL_INDEX.SUBJECT_GRAPHS) == '1';
            const secondCondition = !n(id('mod-grades-graphs')) && ((examPage && id('mod-grades-graphs').dataset.exams == 'false') || (!examPage && id('mod-grades-graphs').dataset.exams == 'true'));
            if (firstCondition || secondCondition) {
                if (secondCondition) {
                    tryRemove(id('mod-grades-graphs'));
                }
                if (!subjectGradesPageContainsNumberGrades()) {
                    return;
                }

                tn('sl-vakresultaten', 0).insertAdjacentHTML(
                    'beforeend',
                    (get('bools').charAt(BOOL_INDEX.GRADE_ANALYSIS) == '1' ? '<h3 style="margin-top: 40px;">Cijferanalyse</h3>' +
                        '<div id="mod-grade-suggestions" style="padding: 15px; margin: 15px 0; background: var(--bg-neutral-none); border-radius: 8px; border: 1px solid var(--border-neutral-weak);">Even geduld, je cijfers worden geanalyseerd...</div>' : '') +
                    '<div id="mod-grades-graphs" data-exams="' + (examPage ? 'true' : 'false') + '">' +
                    '<h3>Mijn ' + (examPage ? 'examen' : '') + 'cijfers</h3><div><canvas id="mod-chart-1"></canvas></div>' +
                    '<h3>Mijn ' + (examPage ? 'examen' : '') + 'gemiddelde</h3><div><canvas id="mod-chart-2"></canvas></div>' +
                    '</div>'
                );
                setTimeout(function () { execute([gradeGraphs]); }, 500);
            }
        }
    }

       let gradedata;
    let gradingSystems;
    let totalAverage;
    let totalGrades = 0;
    let totalWeight = 0;
    let availablePages = [];
    let music;
    function getAudioUrl(file) {
                      if (isExtension) {
            return chrome.runtime.getURL('sounds/' + file + '.mp3');
        }
        else {
            return 'https://geweldige-geluidseffecten.netlify.app/' + file + '.mp3';
        }
    }
    function somtodayRecap() {
        if (!ignoreRecapConditions) {
            if (get('bools').charAt(BOOL_INDEX.RECAP) == "0") {
                return;
            }
            if (!((month == 5 && dayInt > 25) || month == 6)) {
                return;
            }
        }
               let pages = 0;
               let closing = false;
        if (!n(id('somtoday-recap')) && n(id('somtoday-recap-wrapper')) && (!n(tn('sl-vakresultaten', 0)) || id('somtoday-recap').nextElementSibling.tagName == 'HMY-SWITCH-GROUP')) {
            tryRemove(id('somtoday-recap'));
        }
        if (id('mod-recap-year')) {
            id('mod-recap-year').innerText = (tn('sl-dropdown', 0) && tn('sl-dropdown', 0).ariaLabel) ? tn('sl-dropdown', 0).ariaLabel.replace(/^[^/]+\/(\d+)/, '${"$"}1') : year;
        }
        if ((!n(tn('sl-resultaat-item', 0)) || !n(tn('sl-vakgemiddelde-item', 0)) || !n(tn('sl-cijfer-overzicht', 0))) && n(tn('sl-vakresultaten', 0)) && n(id('somtoday-recap'))) {
            try {
                music = new Audio(getAudioUrl('background'));
            }
            catch (e) {
                console.warn(e);
            }
            music.loop = true;
            const recapYear = (tn('sl-dropdown', 0) && tn('sl-dropdown', 0).ariaLabel) ? tn('sl-dropdown', 0).ariaLabel.replace(/^[^/]+\/(\d+)/, '${"$"}1') : year;
            tn('hmy-switch-group', 0).insertAdjacentHTML('afterend', '<div id="somtoday-recap"><h3>Somtoday Recap</h3><p>Bekijk hier jouw jaaroverzicht van <span id="mod-recap-year">' + recapYear + '</span>.</p><div id="somtoday-recap-arrows">' + getIcon('chevron-right', null, '#fff', 'id="recap-arrow-1"') + getIcon('chevron-right', null, '#fff', 'id="recap-arrow-2"') + getIcon('chevron-right', null, '#fff', 'id="recap-arrow-3"') + '</div></div>');
                       id('somtoday-recap').addEventListener('click', async function () {
                music.currentTime = 0;
                music.play();
                music.volume = 1;
                isRecapping = true;
                               if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                }
                               tn('html', 0).style.overflowY = 'hidden';
                const currentYear = year || new Date().getFullYear();
                const prevYear = currentYear - 1;

                const recapYears = (tn('sl-dropdown', 0) && tn('sl-dropdown', 0).ariaLabel)
                    ? tn('sl-dropdown', 0).ariaLabel.replace(/^[^/]+(\d\d)\/\d+(\d\d)${"$"}/, '${"$"}1/${"$"}2')
                    : prevYear.toString().slice(-2) + '/' + currentYear.toString().slice(-2);

                const wrapper = id('somtoday-mod');
                if (wrapper) {
                    wrapper.insertAdjacentHTML('beforeend', `
                        <div id="somtoday-recap-wrapper">
                            <div id="recap-progress"></div>
                            <div id="recap-close">&times;</div>
                            <center class="recap-page">
                                <h1>Somtoday Recap ${"$"}{recapYears}</h1>
                                <h2>Het schooljaar zit er al weer bijna op! Hoog tijd voor de Somtoday Recap!</h2>
                                <a id="recap-nextpage">Laden...</a>
                            </center>
                            <ul class="circles">
                                <li></li><li></li><li></li><li></li><li></li>
                                <li></li><li></li><li></li><li></li><li></li>
                            </ul>
                        </div>
                    `);
                }

                const recapClose = id('recap-close');
                if (recapClose) {
                    recapClose.addEventListener('click', function () {
                        if (document.documentElement.clientWidth < 1280) {
                            window.location.href = 'https://leerling.somtoday.nl/cijfers';
                            return;
                        }
                        closing = true;
                        const wrapper = id('somtoday-recap-wrapper');
                        if (wrapper) wrapper.remove();
                        stopConfetti();
                        tn('html', 0).style.overflowX = 'hidden';
                        tn('html', 0).style.overflowY = 'scroll';
                        isRecapping = false;
                        if (document.fullscreenElement) {
                            document.exitFullscreen();
                        }
                        setTimeout(() => { closing = false; }, 200);
                        endMusic();
                    });
                }


                               if (!n(cn('recap-page', 0))) {
                    cn('recap-page', 0).style.marginTop = ((document.documentElement.clientHeight - cn('recap-page', 0).clientHeight) / 2) + 'px';
                }

                await new Promise(resolve => setTimeout(resolve, 1000));

                               if (!n(cn('recap-page', 0))) {
                    cn('recap-page', 0).style.marginTop = ((document.documentElement.clientHeight - cn('recap-page', 0).clientHeight) / 2) + 'px';
                }

                               let i;

                               busy = true;

                if (closing) { return; }

                gradedata = [];
                totalGrades = 0;
                totalWeight = 0;
                                              gradingSystems = {
                    cijfers: false,                    plusmin: false,                    voortgang: false,                    letters: false,                };

                               if (n(tn('sl-cijfer-overzicht', 0))) {
                    while (!window.navigator.onLine) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    tn('hmy-switch')[2].click();
                }

                while (true) {
                    if (closing) { return; }
                                       if (tn('sl-cijfer-overzicht', 0) && cn('vak-row', 0)) {
                        break;
                    }
                                       if (i > 750) {
                        i = 0;
                        if (n(tn('sl-cijfer-overzicht', 0))) {
                            tn('hmy-switch')[2].click();
                        }
                    }
                    await new Promise(resolve => setTimeout(resolve, 10));
                    i++;
                }

                let totalAverageGrades = 0, totalAverageWeight = 0;

                for (const period of cn('periode-header')) {
                    if (!period.classList.contains('open')) {
                        period.click();
                    }
                }

                for (i = 0; true; i++) {
                    if (closing) { return; }
                                       let allPeriodsExpanded = true;
                    for (const period of cn('periode-header')) {
                        if (!period.classList.contains('open')) {
                            allPeriodsExpanded = false;
                        }
                    }
                    if (allPeriodsExpanded) {
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 10));
                }

                i = 0;
                for (const element of cn('vak-row')) {
                    if (closing) { return; }

                    let subject = {};
                    let subjectTotalGrades = 0;
                    let subjectTotalWeight = 0;
                    let subjectGradingSystems = {
                        cijfers: false,
                        plusmin: false,
                        voortgang: false,
                        letters: false,
                    };

                    if (element.getElementsByClassName('naam')[0]) {
                        subject.name = element.getElementsByClassName('naam')[0].innerText;
                    }
                    if (element.getElementsByTagName('hmy-vak-icon')[0] && element.getElementsByTagName('hmy-vak-icon')[0].getElementsByTagName('svg')[0]) {
                        subject.icon = element.getElementsByTagName('hmy-vak-icon')[0].getElementsByTagName('svg')[0].outerHTML;
                    }
                    let averageElements = element.getElementsByClassName('cijfer gemiddelde');
                    if (averageElements.length >= 1) {
                        let average;
                                                                      for (const gemiddelde of averageElements) {
                            if (gemiddelde.innerText.indexOf(',') != -1 || gemiddelde.innerText.indexOf('.') != -1) {
                                average = gemiddelde.innerText.replace(',', '.');
                            }
                        }
                                               if (!average) {
                            average = averageElements[averageElements.length - 1].innerText;
                        }

                        subject.average = isNaN(parseFloat(average)) ? average : parseFloat(average);
                        if (!isNaN(parseFloat(subject.average))) {
                            totalAverageGrades += Math.round(parseFloat(subject.average));
                            totalAverageWeight++;
                        }
                    }

                    subject.grades = [];

                                       for (const cijfer of element.getElementsByClassName('cijfer')) {
                        if (cijfer.innerText == '') {
                            continue;
                        }
                        const grade = parseFloat(cijfer.innerText.replace(',', '.'));
                        const weging = cijfer.ariaLabel ? parseFloat(cijfer.ariaLabel.replace(/^^[\s\S]*•? ?weging ([\d.,]+)[\s\S]*?${"$"}/, '${"$"}1')) : null;
                        if (cijfer.ariaLabel && !isNaN(weging) && !cijfer.classList.contains('gemiddelde')) {
                            subject.grades.push({
                                cijfer: isNaN(grade) ? cijfer.innerText : grade,
                                weging: weging,
                            });
                            if (isNaN(grade)) {
                                if (cijfer.innerText.indexOf('+') != -1 || cijfer.innerText.indexOf('-') != -1) {
                                    subjectGradingSystems.plusmin = true;
                                }
                                else if (cijfer.innerText.indexOf('A') != -1 || cijfer.innerText.indexOf('B') != -1 || cijfer.innerText.indexOf('N') != -1 || cijfer.innerText.indexOf('L') != -1) {
                                    subjectGradingSystems.voortgang = true;
                                }
                                else {
                                    subjectGradingSystems.letters = true;
                                }
                            }
                            else {
                                subjectGradingSystems.cijfers = true;
                            }
                            subjectTotalGrades++;
                            subjectTotalWeight += weging;
                        }
                    }

                    subject.gradeCount = subjectTotalGrades;
                    subject.weightCount = subjectTotalWeight;

                    let isUnique = true;
                    for (const loopSubject of gradedata) {
                        if (loopSubject.name == subject.name) {
                            isUnique = false;
                        }
                    }
                    if (subjectTotalGrades > 0 && isUnique) {
                        totalGrades += subjectTotalGrades;
                        totalWeight += subjectTotalWeight;
                        subject.systems = subjectGradingSystems;
                        gradedata.push(subject);

                        if (subjectGradingSystems.cijfers) {
                            gradingSystems.cijfers = true;
                        }
                        if (subjectGradingSystems.plusmin) {
                            gradingSystems.plusmin = true;
                        }
                        if (subjectGradingSystems.voortgang) {
                            gradingSystems.voortgang = true;
                        }
                        if (subjectGradingSystems.letters) {
                            gradingSystems.letters = true;
                        }
                    }

                    i++;
                }
                if (totalAverageWeight != 0) {
                    totalAverage = (totalAverageGrades / totalAverageWeight).toFixed(2);
                }
                console.log(gradedata);

                if (gradedata.length == 0) {
                    modMessage('Geen data', 'Het lijkt erop dat je nog geen cijfers hebt gekregen dit jaar. Probeer het later nog eens.', 'Doorgaan');
                    id('mod-message-action1').addEventListener('click', function () {
                        window.location.href = 'https://leerling.somtoday.nl/cijfers';
                        closeModMessage();
                    });
                    return;
                }

                availablePages = [busyYear, twoTrueOneFalse, twoTrueOneFalse];
                if (gradingSystems.cijfers) {
                    availablePages.push(subjectsLow);
                    availablePages.push(subjectsHigh);
                    availablePages.push(guessTheGraph);
                    availablePages.push(onvoldoendeGraph);
                    i = 0;
                    for (const subject of gradedata) {
                        if (!isNaN(subject.average)) {
                            i++;
                        }
                    }
                    if (i > 5 && totalGrades > 10) {
                        availablePages.push(overgangsCheck);
                    }
                    for (const subject of gradedata) {
                        if (!isNaN(subject.average)) {
                            availablePages.push(orderSubjects);
                            break;
                        }
                    }
                }
                if (gradingSystems.plusmin) {
                    availablePages.push(plusMinGraph);
                    availablePages.push(twoTrueOneFalse);
                    availablePages.push(twoTrueOneFalse);
                }
                if (gradingSystems.voortgang) {
                    availablePages.push(completedGraph);
                    availablePages.push(twoTrueOneFalse);
                    availablePages.push(twoTrueOneFalse);
                }

                               id('recap-nextpage').innerHTML = 'Start Somtoday Recap';
                pages = 0;
                id('recap-nextpage').addEventListener('click', closeRecapPage);
                busy = false;
            });
        }

        function orderSubjects() {
            let usedSubjects = [];
            let subjects = [];
            let html = '';
            for (var i = 0; i < 5 && i < gradedata.length; i++) {
                let randomSubject = gradedata[Math.floor(Math.random() * gradedata.length)];
                if (usedSubjects.includes(randomSubject.name) || !randomSubject.systems.cijfers) {
                    for (const subject of gradedata) {
                        if (!usedSubjects.includes(subject.name) && subject.systems.cijfers) {
                            randomSubject = subject;
                            break;
                        }
                    }
                    if (usedSubjects.includes(randomSubject.name) || !randomSubject.systems.cijfers) {
                        break;
                    }
                }
                usedSubjects.push(randomSubject.name);
                subjects.push(randomSubject);
                html += '<div class="mod-item"><div>' + randomSubject.icon + '</div><p>' + randomSubject.name + '</p>' + getIcon('grip-vertical', null, 'var(--text-weak)') + '</div>';
            }
            cn('recap-page', 0).innerHTML = '<h1>Wat zijn je beste vakken?</h1><h2>Sorteer je vakken op basis van je gemiddelde</h2><div id="mod-grade-average-sort-list">' + html + '</div><a id="recap-nextpage">Volgende</a>';

            const list = document.getElementById('mod-grade-average-sort-list');
            let draggingEle;
            let placeholder;
            let isDraggingStarted = false;
            let x = 0;
            let y = 0;
            const swap = function (nodeA, nodeB) {
                const parentA = nodeA.parentNode;
                const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;
                nodeB.parentNode.insertBefore(nodeA, nodeB);
                parentA.insertBefore(nodeB, siblingA);
            };
            const isAbove = function (nodeA, nodeB) {
                const rectA = nodeA.getBoundingClientRect();
                const rectB = nodeB.getBoundingClientRect();
                return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
            };
            const mouseDownHandler = function (e) {
                if (e.target.classList.contains('mod-item')) {
                    draggingEle = e.target;
                } else if (e.target.parentElement.classList.contains('mod-item')) {
                    draggingEle = e.target.parentElement;
                } else if (e.target.parentElement.parentElement.classList.contains('mod-item')) {
                    draggingEle = e.target.parentElement.parentElement;
                }
                const rect = draggingEle.getBoundingClientRect();
                if (e.touches == null || e.touches[0] == null) {
                    x = e.pageX - rect.left;
                    y = e.pageY - rect.top;
                }
                else {
                    x = e.touches[0].pageX - rect.left;
                    y = e.touches[0].pageY - rect.top;
                }
                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('touchmove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
                document.addEventListener('touchend', mouseUpHandler);
            };
            const mouseMoveHandler = function (e) {
                const draggingRect = draggingEle.getBoundingClientRect();
                if (!isDraggingStarted) {
                    isDraggingStarted = true;
                    placeholder = document.createElement('div');
                    placeholder.classList.add('placeholder');
                    draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
                    placeholder.style.height = '23px';
                }
                draggingEle.style.position = 'absolute';
                if (e.touches == null || e.touches[0] == null) {
                    draggingEle.style.top = (e.pageY - y) + 'px';
                    draggingEle.style.left = (e.pageX - x) + 'px';
                }
                else {
                    draggingEle.style.top = (e.touches[0].pageY - y) + 'px';
                    draggingEle.style.left = (e.touches[0].pageX - x) + 'px';
                }
                const prevEle = draggingEle.previousElementSibling;
                const nextEle = placeholder.nextElementSibling;
                if (prevEle && isAbove(draggingEle, prevEle)) {
                    swap(placeholder, draggingEle);
                    swap(placeholder, prevEle);
                    return;
                }
                if (nextEle && isAbove(nextEle, draggingEle)) {
                    swap(nextEle, placeholder);
                    swap(nextEle, draggingEle);
                }
            };
            const mouseUpHandler = function () {
                placeholder && placeholder.parentNode && placeholder.parentNode.removeChild(placeholder);
                draggingEle.style.removeProperty('top');
                draggingEle.style.removeProperty('left');
                draggingEle.style.removeProperty('position');
                x = null;
                y = null;
                draggingEle = null;
                isDraggingStarted = false;
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('touchmove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
                document.removeEventListener('touchend', mouseUpHandler);
            };
            [].slice.call(list.querySelectorAll('.mod-item')).forEach(function (item) {
                item.addEventListener('mousedown', mouseDownHandler);
                item.addEventListener('touchstart', mouseDownHandler);
            });

            let clicked = false;
            let answerInterval;
            let audioHasFired = false;
            id('recap-nextpage').addEventListener('click', function () {
                if (clicked) {
                    if (answerInterval != null) {
                        clearInterval(answerInterval);
                    }
                    closeRecapPage();
                    return;
                }
                function checkAnswers(first = false) {
                    if (n(id('mod-grade-average-sort-list'))) {
                        clearInterval(answerInterval);
                        return;
                    }
                    let orderedSubjects = subjects.slice();
                    const loopCount = orderedSubjects.length;
                    let correct = true;
                    for (var i = 0; i < loopCount; i++) {
                        let maxGrade = 0;
                        let maxGradeIndex = 0;
                        for (var j = 0; j < orderedSubjects.length; j++) {
                            if (orderedSubjects[j].average > maxGrade) {
                                maxGrade = orderedSubjects[j].average;
                                maxGradeIndex = j;
                            }
                        }
                                               const pElement = id('mod-grade-average-sort-list').getElementsByClassName('mod-item')[i].getElementsByTagName('p')[0];
                        if (pElement.innerText == orderedSubjects[maxGradeIndex].name) {
                            pElement.classList.remove('wrong');
                            pElement.classList.add('right');
                            if (first) {
                                pElement.insertAdjacentHTML('afterend', '<p>' + orderedSubjects[maxGradeIndex].average.toString().replace('.', ',') + '</p>');
                            }
                        }
                                               else {
                            correct = false;
                            let subjectAverage = '';
                            for (const subject of subjects) {
                                if (subject.name == pElement.innerText) {
                                    subjectAverage = subject.average.toString().replace('.', ',');
                                    break;
                                }
                            }
                            pElement.classList.remove('right');
                            pElement.classList.add('wrong');
                            if (first) {
                                pElement.insertAdjacentHTML('afterend', '<p>' + subjectAverage + '</p>');
                            }
                        }
                        if (!audioHasFired) {
                            audioHasFired = true;
                            if (correct) {
                                try {
                                    new Audio(getAudioUrl('correct')).play();
                                }
                                catch (e) {
                                    console.warn(e);
                                }
                                startConfetti();
                                setTimeout(stopConfetti, 750);
                            }
                            else {
                                try {
                                    new Audio(getAudioUrl('error')).play();
                                }
                                catch (e) {
                                    console.warn(e);
                                }
                            }
                        }
                        orderedSubjects.splice(maxGradeIndex, 1);
                    }
                }
                checkAnswers(true);
                answerInterval = setInterval(checkAnswers, 50);
                setTimeout(function () {
                    clicked = true;
                }, 100);
            });
        }
        function closeRecapPage() {
            id('recap-progress').insertAdjacentHTML('beforeend', '<div></div>');
            cn('recap-page', 0).classList.add('recap-closing');
            setTimeout(function () {
                cn('recap-page', 0).classList.remove('recap-closing');
            }, 350);
            pages++;
            let i;
            if (pages > 8) {
                pages = 8;
            }
            switch (pages) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    music.volume = 1;
                    if (availablePages.length > 0) {
                        i = Math.round(Math.random() * (availablePages.length - 1));
                        availablePages[i]();
                        availablePages.splice(i, 1);
                        break;
                    }
                    else {
                        pages = 7;
                    }
                case 7:
                    award();
                    break;
                case 8:
                    finish();
                    break;
            }
                       cn('recap-page', 0).style.marginTop = ((document.documentElement.clientHeight - cn('recap-page', 0).clientHeight) / 2) + 'px';
        }
        function finish() {
            setTimeout(startConfetti, 100);
            cn('recap-page', 0).innerHTML = '<h1>Gefeliciteerd!</h1><h2>Het jaar zit erop en de vakantie is al in zicht.</h2><h3>Veel plezier in de vakantie en hopelijk tot volgend jaar!</h3><a id="recap-nextpage">Sluiten</a>';
            id('recap-nextpage').addEventListener('click', function () {
                               if (document.documentElement.clientWidth < 1280) {
                    window.location.href = 'https://leerling.somtoday.nl/cijfers';
                    return;
                }
                setTimeout(function () {
                    tryRemove(id('somtoday-recap-wrapper'));
                    stopConfetti();
                    tn('html', 0).style.overflowX = 'hidden';
                    tn('html', 0).style.overflowY = 'scroll';
                    endMusic();
                }, 550);
                isRecapping = false;
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            });
            return;
        }
        async function endMusic() {
            let prev = music.volume;
            while (true) {
                if (music.volume > prev) {
                    break;
                }
                prev = music.volume;
                let newVolume = music.volume - 0.05;
                if (newVolume >= 0) {
                    music.volume = newVolume;
                }
                else {
                    music.pause();
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        function award() {
            let award = 'none';
            let description;
            let icon;
            let times = 0;
            while (award == 'none' && times < 50) {
                let min, max, i, subject, gradeVar;
                const randomAwardTry = Math.round(Math.random() * (13 - 1) + 1);
                switch (randomAwardTry) {
                    case 1:
                                               if (totalAverage && totalAverage > 8) {
                            award = 'meesterbrein';
                            description = 'je gemiddelde hoger is dan een 8';
                            icon = 'brain';
                        }
                        break;
                    case 2:
                        if (gradingSystems.cijfers) {
                                                       min = 10;
                            max = 0;
                            for (const subject of gradedata) {
                                for (const grade of subject.grades) {
                                    if (!isNaN(grade.cijfer)) {
                                        if (grade.cijfer > max) {
                                            max = grade.cijfer;
                                        }
                                        if (grade.cijfer < min) {
                                            min = grade.cijfer;
                                        }
                                    }
                                }
                            }
                            if ((max - min) < 2 && (max - min) > 0) {
                                award = 'steady';
                                description = 'het verschil tussen je hoogste en laagste punt minder dan 2 is';
                                icon = 'arrows-left-right';
                            }
                        }
                        break;
                    case 3:
                                               for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('wis') != -1 || subject.name.toLowerCase().indexOf('math') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'algebra';
                                    description = 'je een voldoende staat voor wiskunde';
                                    icon = 'calculator';
                                }
                                break;
                            }
                        }
                        break;
                    case 4:
                                               for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('sch') != -1 || subject.name.toLowerCase().indexOf('chem') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'chemicus';
                                    description = 'je een voldoende staat voor scheikunde';
                                    icon = 'flask';
                                }
                                break;
                            }
                        }
                        break;
                    case 5:
                                               for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('fra') != -1 || subject.name.toLowerCase().indexOf('eng') != -1 || subject.name.toLowerCase().indexOf('dui') != -1 || subject.name.toLowerCase().indexOf('spa') != -1 || subject.name.toLowerCase().indexOf('eng') != -1 || subject.name.toLowerCase().indexOf('chi') != -1 || subject.name.toLowerCase().indexOf('taal') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'taalgenie';
                                    description = 'je een voldoende staat voor een taal';
                                    icon = 'earth-europe';
                                }
                                break;
                            }
                        }
                        break;
                    case 6:
                                               for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('gri') != -1 || subject.name.toLowerCase().indexOf('gre') != -1 || subject.name.toLowerCase().indexOf('lat') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'oudheid';
                                    description = 'je een voldoende staat voor een klassieke taal';
                                    icon = 'landmark';
                                }
                                break;
                            }
                        }
                        break;
                    case 7:
                                               for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('nat') != -1 || subject.name.toLowerCase().indexOf('phy') != -1 || subject.name.toLowerCase().indexOf('bio') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'wetenschapper';
                                    description = 'je een voldoende staat voor natuurkunde of biologie';
                                    icon = 'microscope';
                                }
                                break;
                            }
                        }
                        break;
                    case 8:
                                               for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('aard') != -1 || subject.name.toLowerCase().indexOf('geo') != -1 || subject.name.toLowerCase().indexOf('ges') != -1 || subject.name.toLowerCase().indexOf('his') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'ontdekker';
                                    description = 'je een voldoende staat voor aardrijkskunde of geschiedenis';
                                    icon = 'map-location-dot';
                                }
                                break;
                            }
                        }
                        break;
                    case 9:
                                               max = false;
                        i = 2;
                        for (const subject of gradedata) {
                            if (!isNaN(parseFloat(subject.average)) && parseFloat(subject[0]) >= 8.5) {
                                max = true;
                            }
                        }
                        if (max) {
                            award = 'gefocust';
                            description = 'je afgeronde gemiddelde van minstens &eacute;&eacute;n vak een 9 of hoger is';
                            icon = 'bullseye';
                        }
                        break;
                    case 10:
                        if (gradedata.length >= 15) {
                            award = 'drukte';
                            description = 'je 15 of meer vakken had';
                            icon = 'book';
                        }
                        break;
                    case 11:
                                               for (const subject of gradedata) {
                            if (subject.name.toLowerCase().indexOf('beeldend') != -1 || subject.name.toLowerCase().indexOf('kunst') != -1 || subject.name.toLowerCase().indexOf('art') != -1 || subject.name.toLowerCase().indexOf('vorming') != -1 || subject.name.toLowerCase().indexOf('ckv') != -1 || subject.name.toLowerCase().indexOf('kcv') != -1 || subject.name.toLowerCase().indexOf('cultuur') != -1 || subject.name.toLowerCase().indexOf('culturele') != -1) {
                                if (subject.average >= 5.5) {
                                    award = 'artiest';
                                    description = 'je een voldoende staat voor ' + subject.name;
                                    icon = 'palette';
                                }
                                break;
                            }
                        }
                        break;
                    case 12:
                                               let tens = 0;
                        if (gradingSystems.cijfers) {
                            for (const subject of gradedata) {
                                for (const grade of subject.grades) {
                                    if (!isNaN(grade) && grade == 10) {
                                        tens++;
                                    }
                                }
                            }
                            if (tens >= 3) {
                                award = 'smart';
                                description = 'je 3 keer een tien hebt gehaald dit jaar';
                                icon = 'brain';
                            }
                        }
                        break;
                    case 13:
                        award = 'vakantie';
                        description = 'het nu alweer bijna zomervakantie is';
                        icon = 'sun';
                        break;
                }
                times++;
            }
            if (award == 'none') {
                award = 'vakantie';
                description = "het nu alweer bijna zomervakantie is";
                icon = 'sun';
            }
            cn('recap-page', 0).innerHTML = '<div id="award-wrapper">' + getIcon(icon, null, '#1f86f6') + '</div><h1>AWARD!</h1><h2>Je hebt het dit jaar weer geweldig gedaan.</h2><h3>Omdat ' + description + ' krijg je de ' + award + '-award.</h3><a id="recap-nextpage">Volgende</a>';
            id('recap-nextpage').addEventListener('click', closeRecapPage);
            setTimeout(function () {
                try {
                    new Audio(getAudioUrl('tada')).play();
                }
                catch (e) {
                    console.warn(e);
                }
            }, 1000);
        }
        function busyYear() {
            if (totalGrades > 15) {
                cn('recap-page', 0).innerHTML = '<h1>' + (pages > 1 ? 'En w' : 'W') + 'at was het toch een druk jaar 😅</h1><h2>Je hebt in totaal <i>' + totalGrades + '</i> ' + (totalGrades == 1 ? 'cijfer' : 'cijfers') + ' gekregen met een totale weging van maar liefst <i>' + totalWeight + '</i>!</h2><h3>Dat is wel een applausje waard!</h3><a id="recap-nextpage">Volgende</a>';
            }
            else {
                cn('recap-page', 0).innerHTML = '<h1>Lekker rustig jaartje 😎</h1><h2>Je hebt in totaal <i>' + totalGrades + '</i> ' + (totalGrades == 1 ? 'cijfer' : 'cijfers') + ' gekregen met een totale weging van <i>' + totalWeight + '</i>!</h2><h3>Dat is relaxed door het jaar heen gaan!</h3><a id="recap-nextpage">Volgende</a>';
            }
            id('recap-nextpage').addEventListener('click', closeRecapPage);
        }
        function subjectsHigh() {
            let highest = Number.MIN_SAFE_INTEGER, highestName, secondHighest, secondHighestName;
            for (const subject of gradedata) {
                if (subject.systems.cijfers) {
                    for (const grade of subject.grades) {
                        if (!isNaN(grade.cijfer) && grade.cijfer >= highest) {
                            if (highestName) {
                                secondHighest = highest;
                                secondHighestName = highestName;
                            }
                            highest = grade.cijfer;
                            highestName = subject.name;
                        }
                    }
                }
            }
            if (highest >= 5.5 && (secondHighest == null || secondHighest >= 5.5)) {
                cn('recap-page', 0).innerHTML = '<h1>' + (pages > 1 ? 'En w' : 'W') + 'at heb je toch goede cijfers gehaald </h1><h2>Toen je een <i>' + highest + '</i> haalde voor ' + highestName + ' was je echt de uitblinker van de klas ✨</h2>' + (secondHighest ? '<h3>En vergeet ook niet de <i>' + secondHighest + '</i> die je voor ' + secondHighestName + ' haalde!</h3>' : '') + '<a id="recap-nextpage">Volgende</a>';
            }
            else {
                cn('recap-page', 0).innerHTML = '<h1>Laten we naar je cijfers kijken</h1><h2>Daar is wel wat ruimte voor verbetering 😅. Je hoogste cijfer is een <i>' + highest + '</i> voor ' + highestName + '.</h2>' + (secondHighest ? '<h3>En je op een na hoogste een <i>' + secondHighest + '</i> die je voor ' + secondHighestName + ' kreeg.</h3>' : '') + '<a id="recap-nextpage">Volgende</a>';
            }
            id('recap-nextpage').addEventListener('click', closeRecapPage);
        }
        function subjectsLow() {
            let lowest = Number.MAX_SAFE_INTEGER, lowestName, lowestAverage;
            for (const subject of gradedata) {
                if (subject.systems.cijfers) {
                    for (const grade of subject.grades) {
                        if (!isNaN(grade.cijfer) && grade.cijfer < lowest) {
                            lowest = grade.cijfer;
                            lowestName = subject.name;
                            lowestAverage = subject.average;
                        }
                    }
                }
            }
            if (lowest < 5.5) {
                cn('recap-page', 0).innerHTML = '<h1>Soms was een toets vervelend 😓</h1><h2>Sommige toetsen zijn veel te moeilijk. Zoals de toets waarbij je een <i>' + lowest + '</i> haalde voor ' + lowestName + '.</h2><h3>' + (lowestAverage < 5.5 ? 'Toch heb je dit nog wel wat omhoog weten te halen naar een <i>' + lowestAverage + '</i>.' : 'Gelukkig bleef je doorzetten en sta je nu toch voldoende met een gemiddelde van <i>' + lowestAverage + '</i>!') + '</h3><a id="recap-nextpage">Volgende</a>';
            }
            else {
                cn('recap-page', 0).innerHTML = '<h1>Wow, alleen maar voldoendes!</h1><h2>Je hebt geen enkele onvoldoende gekregen dit jaar 🥳! Je laagste cijfer was een <i>' + lowest + '</i> voor ' + lowestName + '.</h2><h3>Ondanks dat ' + lowestName + ' soms lastig is, is je gemiddelde voor dit vak een <i>' + lowestAverage + '</i>!</h3><a id="recap-nextpage">Volgende</a>';
            }
            id('recap-nextpage').addEventListener('click', closeRecapPage);
        }
        function twoTrueOneFalse() {
                       let i = 0;
                       let averageSubject = gradedata[Math.round(Math.random() * (gradedata.length - 1))];
            let average = averageSubject.average;
            let replacementSubject, replacement = 0;
            if (n(average)) {
                replacementSubject = averageSubject;
                for (const cijfer of replacementSubject.grades) {
                    replacement += cijfer.weging;
                }
            }
                       let gradeSubject = gradedata[Math.round(Math.random() * (gradedata.length - 1))];
            let grade = gradeSubject.grades[Math.round(Math.random() * (gradeSubject.grades.length - 1))].cijfer;
                       let amountSubject = gradedata[Math.round(Math.random() * (gradedata.length - 1))];
            let amount = amountSubject.gradeCount;
            let real;
            let random = Math.round(Math.random() * (3 - 1) + 1);
            switch (random) {
                case 1:
                    if (replacementSubject) {
                        real = replacement;
                        const randomNumber = Math.floor(Math.random() * (3 - -3 + 1) + -3);
                        replacement += randomNumber == 0 ? 1 : randomNumber;
                        break;
                    }
                    real = average;
                    if (isNaN(parseFloat(average))) {
                        let choices;
                        if (average.indexOf('+') != -1 || average.indexOf('-') != -1) {
                            choices = ['+', '-', '-/+'];
                        }
                        else if (average.indexOf('A') != -1 || average.indexOf('B') != -1 || average.indexOf('N') != -1 || average.indexOf('L') != -1) {
                            choices = ['A', 'B', 'N', 'L'];
                        }
                        else {
                            choices = ['O', 'V', 'G'];
                        }
                        choices = choices.filter(item => item !== average);
                        average = choices[Math.round(Math.random() * (choices.length - 1))];
                    }
                    else {
                        const add = Math.round(Math.random() * (2 - 0.5) + 0.5 * 100) / 100;
                        average += add == 0 ? 0.1 : add;
                        average = average.toFixed(2);
                    }
                    break;
                case 2:
                    real = grade;
                    if (gradeSubject.systems.cijfers) {
                        if (isNaN(grade)) {
                            for (const gradeInList of gradeSubject.grades) {
                                if (gradeInList && !isNaN(gradeInList)) {
                                    grade = gradeInList;
                                    break;
                                }
                            }
                        }
                        real = grade;
                        i = 0;
                        while (true) {
                            grade += Math.round(Math.random() * (1 + 1) - 1 * 10) / 10;

                            let gradeInGradeList = false;
                            for (const gradeInList of gradeSubject.grades) {
                                if (gradeInList.cijfer == grade) {
                                    gradeInGradeList = true;
                                    break;
                                }
                            }
                            if (!gradeInGradeList && real != grade) {
                                break;
                            }

                                                       if (i > 100) {
                                grade = Math.PI.toFixed(5);
                                break;
                            }

                            i++;
                        }
                        grade = grade.toFixed(1);
                    }
                    else {
                        let choices;
                        if (gradeSubject.systems.plusmin) {
                            choices = ['+', '-', '-/+'];
                        }
                        else if (gradeSubject.systems.voortgang) {
                            choices = ['A', 'B', 'N', 'L'];
                        }
                        else if (gradeSubject.systems.letters) {
                            choices = ['O', 'V', 'G'];
                        }
                        for (const gradeInList of gradeSubject.grades) {
                            choices = choices.filter(item => item !== gradeInList.cijfer);
                        }
                        if (choices.length == 0) {
                            grade = Math.PI.toFixed(5);
                        }
                        else {
                            grade = choices[Math.round(Math.random() * (choices.length - 1))];
                        }
                    }
                    break;
                case 3:
                    real = amount;
                    i = 0;
                    while (real == amount) {
                        if (i > 100) {
                            if (isNaN(amount)) {
                                amount = 0;
                            }
                            else {
                                amount += 1;
                            }
                            break;
                        }
                        amount += Math.round(Math.random() * (2 + 2) - 2);
                        i++;
                    }
                    break;
            }
            cn('recap-page', 0).innerHTML = '<h1>Kies een van de opties.</h1><h2>Welke van de volgende opties klopt niet? 🤔</h2><label><input type="checkbox" id="recap-option-1"/><p>' + (replacementSubject ? 'Je cijfers voor ' + replacementSubject.name + ' hebben een totale weging van <span class="number">' + replacement + '</span><span class="correction"></span>' : 'Je staat een <span class="number">' + average + '</span><span class="correction"></span> voor ' + averageSubject.name) + '</p></label><label><input type="checkbox" id="recap-option-2"/><p>Je hebt een <span class="number">' + grade + '</span><span class="correction"></span> voor ' + gradeSubject.name + ' gehaald</p></label><label><input type="checkbox" id="recap-option-3"/><p>Je hebt <span class="number">' + amount + '</span><span class="correction"></span> ' + (amount == 1 ? 'cijfer' : 'cijfers') + ' voor ' + amountSubject.name + ' gehaald</p></label><a id="recap-nextpage">Controleren</a>';
            let clicked = false;
            id('recap-nextpage').addEventListener('click', function () {
                if (clicked) {
                    closeRecapPage();
                    return;
                }
                if (!id('recap-option-1').checked && !id('recap-option-2').checked && !id('recap-option-3').checked) {
                    return;
                }
                id('recap-option-1').parentElement.style.pointerEvents = 'none';
                id('recap-option-2').parentElement.style.pointerEvents = 'none';
                id('recap-option-3').parentElement.style.pointerEvents = 'none';
                if (id('recap-option-' + random).checked) {
                    clicked = true;
                    id('recap-option-' + random).parentElement.classList.add('right');
                    id('recap-option-' + random).parentElement.getElementsByClassName('correction')[0].innerHTML = ' ' + real;
                    this.innerHTML = 'Volgende';
                    try {
                        new Audio(getAudioUrl('correct')).play();
                    }
                    catch (e) {
                        console.warn(e);
                    }
                    startConfetti();
                    setTimeout(stopConfetti, 750);
                }
                else {
                    try {
                        new Audio(getAudioUrl('error')).play();
                    }
                    catch (e) {
                        console.warn(e);
                    }
                    clicked = true;
                    if (id('recap-option-1').checked) {
                        id('recap-option-1').parentElement.classList.add('wrong');
                    }
                    if (id('recap-option-2').checked) {
                        id('recap-option-2').parentElement.classList.add('wrong');
                    }
                    if (id('recap-option-3').checked) {
                        id('recap-option-3').parentElement.classList.add('wrong');
                    }
                    id('recap-option-' + random).parentElement.classList.add('right');
                    id('recap-option-' + random).parentElement.getElementsByClassName('correction')[0].innerHTML = ' ' + real;
                    this.innerHTML = 'Volgende';
                }
            });
            id('recap-option-1').addEventListener('change', function () { id('recap-option-2').checked = false; id('recap-option-3').checked = false; });
            id('recap-option-2').addEventListener('change', function () { id('recap-option-1').checked = false; id('recap-option-3').checked = false; });
            id('recap-option-3').addEventListener('change', function () { id('recap-option-1').checked = false; id('recap-option-2').checked = false; });
        }
        function overgangsCheck() {
            let distribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let tekorten = 0, compensatie = 0;
            let kernvakken_onvoldoende = [];
            let kernvakken_5_of_hoger = [];
            let alle_vakken_4_of_hoger = [];
            let onvoldoendes = [];
            let overgang = 100;
            for (const subject of gradedata) {
                if (!isNaN(parseFloat(subject.average))) {
                    const average = Math.round(subject.average);
                    const kernvak = subject.name.toLowerCase().indexOf('wiskunde') != -1 && subject.name.toLowerCase().indexOf('nederlands') != -1 && subject.name.toLowerCase().indexOf('engels') != -1;
                    tekorten += Math.max(6 - average, 0);
                    compensatie += Math.max(average - 6, 0);
                    if (average < 6 && kernvak) {
                        kernvakken_onvoldoende.push(subject);
                        if (kernvakken_onvoldoende.length > 1) {
                            overgang -= 25;
                        }
                    }
                    if (average < 5 && kernvak) {
                        kernvakken_5_of_hoger.push(subject);
                        overgang -= 25;
                    }
                    if (average < 4) {
                        alle_vakken_4_of_hoger.push(subject);
                        overgang -= (tekorten - 2) * 25;
                    }
                    if (average <= 5) {
                        onvoldoendes.push(subject);
                    }
                }
                for (const grade of subject.grades) {
                    if (!isNaN(parseFloat(grade.cijfer))) {
                        distribution[Math.round(grade.cijfer) - 1]++;
                    }
                }
            }
            if (tekorten > 3) {
                overgang -= 50 * (tekorten - 3);
            }
            else {
                overgang -= 2 * tekorten;
            }
            if (tekorten > 1 && tekorten > compensatie) {
                overgang -= 25 * (tekorten - compensatie);
            }
            if (overgang > 0 && overgang < 95) {
                overgang += Math.floor(Math.random() * (5 + 1))
            }
            overgang = Math.max(overgang, 5);            overgang = Math.min(overgang, 99);            cn('recap-page', 0).innerHTML = '<h1>' + overgang + '% kans om over te gaan</h1><h2>' + (overgang == 100 ? 'Met deze flawless cijferlijst ga je natuurlijk zeker weten over! ✅' : (overgang > 75 ? 'Prima gedaan! Af en toe een onvoldoende staan kan gebeuren, maar dat zit jou nooit in de weg! 🙃' : (overgang > 50 ? 'Redelijke cijferlijst, al voldoe je niet aan alle overgangsnormen.' : (overgang >= 25 ? 'Hmm, dat gaat een taai overgangsgesprek worden. Maar jij kan dit! Veel succes!' : 'Hmm, dat gaat een taai overgangsgesprek worden. Hopelijk komt het goed voor je.')))) + '</h3><br><br><div id="recap-chart-wrapper"><canvas id="recap-chart" width="350" height="350"></canvas></div><a id="recap-nextpage">Doorgaan</a>';
            id('recap-nextpage').addEventListener('click', closeRecapPage);
            if (distribution[9] + distribution[8] + distribution[7] + distribution[6] + distribution[5] + distribution[4] + distribution[3] + distribution[2] + distribution[1] + distribution[0] == 0) {
                id('recap-chart').remove();
                return;
            }
            Chart.defaults.color = '#fff';
            var recapCanvas = document.getElementById('recap-chart');
            var recapCtx = recapCanvas.getContext('2d');
            var recapChart = new Chart(recapCtx, {
                type: 'doughnut',
                data: {
                    labels: ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'],
                    datasets: [{
                        data: [distribution[9], distribution[8], distribution[7], distribution[6], distribution[5], distribution[4], distribution[3], distribution[2], distribution[1], distribution[0]],
                        backgroundColor: [
                            '#317256',
                            '#419873',
                            '#52BF90',
                            '#82C96D',
                            '#CBE07E',
                            '#EBDE7C',
                            '#FAB061',
                            '#EB6963',
                            '#CC4533',
                            '#AB4141',
                        ],
                        borderWidth: 0,
                    }],
                },
                options: {
                    responsive: false,
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                },
            });
        }
        function onvoldoendeGraph() {
            let voldoende = 0, onvoldoende = 0;
            for (const subject of gradedata) {
                if (subject.systems.cijfers) {
                    for (const grade of subject.grades) {
                        if (!isNaN(parseFloat(grade.cijfer))) {
                            if (grade.cijfer >= 5.5) {
                                voldoende++;
                            }
                            else {
                                onvoldoende++;
                            }
                        }
                    }
                }
            }
            let percentage = Math.max(voldoende, 1) / Math.max(onvoldoende, 1) * 100;
            cn('recap-page', 0).innerHTML = '<h1>' + (percentage > 85 ? 'Voldoende?!? JA!' : (percentage > 50 ? 'Voldoendes?' : 'Hmmm...')) + '</h1><h2>' + (percentage > 85 ? 'Natuurlijk heb je dit jaar weer veel voldoendes gehaald!' : (percentage > 50 ? 'Jazeker! Je hebt meer dan de helft voldoende!' : 'Dat is niet zo best. Volgend jaar beter?')) + '</h3><br><br><div id="recap-chart-wrapper"><canvas id="recap-chart" width="300" height="300"></canvas></div><a id="recap-nextpage">Doorgaan</a>';
            Chart.defaults.color = '#fff';
            var recapCanvas = document.getElementById('recap-chart');
            var recapCtx = recapCanvas.getContext('2d');
            var recapChart = new Chart(recapCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Voldoende', 'Onvoldoende'],
                    datasets: [{
                        data: [voldoende, onvoldoende],
                        backgroundColor: [
                            'rgb(144, 255, 194)',
                            'rgb(255, 163, 171)',
                        ],
                        borderWidth: 0,
                    }],
                },
                options: {
                    responsive: false,
                },
            });
            id('recap-nextpage').addEventListener('click', closeRecapPage);
        }
        function completedGraph() {
            let a = 0, b = 0, n = 0, l = 0;
            for (const subject of gradedata) {
                if (subject.systems.voortgang) {
                    for (const grade of subject.grades) {
                        if (grade.cijfer.toString().indexOf('A') != -1) {
                            a++;
                        }
                        if (grade.cijfer.toString().indexOf('B') != -1) {
                            b++;
                        }
                        if (grade.cijfer.toString().indexOf('N') != -1) {
                            n++;
                        }
                        if (grade.cijfer.toString().indexOf('L') != -1) {
                            l++;
                        }
                    }
                }
            }
            cn('recap-page', 0).innerHTML = '<h1>Doel gehaald! 🎯</h1><h2>Goed gedaan! Ook dit jaar is weer voorbij!</h2><h3>Hoeveel proefwerken en opdrachten heb je wel niet gemaakt? Veel.</h3><br><br><div id="recap-chart-wrapper"><canvas id="recap-chart" width="300" height="300"></canvas></div><a id="recap-nextpage">Doorgaan</a>';
            Chart.defaults.color = '#fff';
            var recapCanvas = document.getElementById('recap-chart');
            var recapCtx = recapCanvas.getContext('2d');
            var recapChart = new Chart(recapCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Afgerond', 'Bijna', 'Niet afgerond', 'Lopend'],
                    datasets: [{
                        data: [a, b, n, l],
                        backgroundColor: [
                            'rgb(144, 255, 194)',
                            'rgb(255, 235, 171)',
                            'rgb(255, 163, 171)',
                            'rgb(100, 171, 255)',
                        ],
                        borderWidth: 0,
                    }],
                },
                options: {
                    responsive: false,
                },
            });
            id('recap-nextpage').addEventListener('click', closeRecapPage);
        }
        function plusMinGraph() {
            let plus = 0, min = 0, plusmin = 0;
            for (const subject of gradedata) {
                if (subject.systems.plusmin) {
                    for (const grade of subject.grades) {
                        const containsPlus = grade.cijfer.toString().indexOf('+') != -1;
                        const containsMin = grade.cijfer.toString().indexOf('-') != -1;
                        if (containsPlus && containsMin) {
                            plusmin++;
                        }
                        else if (containsPlus) {
                            plus++;
                        }
                        else if (containsMin) {
                            min++;
                        }
                    }
                }
            }
            cn('recap-page', 0).innerHTML = '<h1>Je krijgt een dikke plus!</h1><h2>' + (plus > min ? 'Ook dit jaar zijn er weer flink wat plussen uitgedeeld!' : (plus < min ? 'De minnen overtroffen dit jaar helaas de plussen... Maar niet getreurd, want je hebt toch nog ' + plus + ' plussen bij elkaar weten te verzamelen! Goed gedaan!' : 'Het is een gelijkspel! Je hebt precies evenveel plussen als minnen!')) + '</h2><br><br><div id="recap-chart-wrapper"><canvas id="recap-chart"></canvas></div><a id="recap-nextpage">Doorgaan</a>';
            Chart.defaults.color = '#fff';
            var recapCanvas = document.getElementById('recap-chart');
            var recapCtx = recapCanvas.getContext('2d');
            var recapChart = new Chart(recapCtx, {
                type: 'bar',
                data: {
                    labels: ['+', '-', '-/+'],
                    datasets: [{
                        data: [plus, min, plusmin],
                        backgroundColor: [
                            'rgb(144, 255, 194)',
                            'rgb(255, 163, 171)',
                            'rgb(255, 235, 171)',
                        ],
                        borderRadius: 8,
                    }],
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                },
            });
            id('recap-nextpage').addEventListener('click', closeRecapPage);
        }
        function guessTheGraph() {
            cn('recap-page', 0).innerHTML = '<h1>Van welk vak is deze grafiek?</h1><h2>Van welk vak denk je dat de onderstaande grafiek is?</h2><div id="recap-chart-wrapper"><canvas id="recap-chart"></canvas></div><label><input type="checkbox" id="recap-option-1"/><p id="recap-text-1"></p></label><label><input type="checkbox" id="recap-option-2"/><p id="recap-text-2"></p></label><label><input type="checkbox" id="recap-option-3"/><p id="recap-text-3"></p></label><a id="recap-nextpage">Controleren</a>';
            let chosenSubject = gradedata[Math.round(Math.random() * (gradedata.length - 1))];
            while (!chosenSubject.systems.cijfers) {
                chosenSubject = gradedata[Math.round(Math.random() * (gradedata.length - 1))];
            }
            gradeGraphs(chosenSubject);
            const random = Math.round(Math.random() * (3 - 1) + 1);
            id('recap-option-' + random).innerHTML = chosenSubject.name;
            let fakeOptionOne = gradedata[Math.round(Math.random() * (gradedata.length - 1))].name;
            let i = 0;
            const subjectArray = ['Aardrijkskunde', 'Geschiedenis', 'Nederlands', 'Engels', 'Frans', 'Natuurkunde', 'Wiskunde', 'Biologie', 'Scheikunde'];
            while (fakeOptionOne == chosenSubject.name) {
                if (i > 100) {
                    fakeOptionOne = subjectArray[Math.floor(Math.random() * subjectArray.length)];
                    break;
                }
                fakeOptionOne = gradedata[Math.round(Math.random() * (gradedata.length - 1))].name;
                i++;
            }
            i = 0;
            let fakeOptionTwo = gradedata[Math.round(Math.random() * (gradedata.length - 1))].name;
            while (fakeOptionTwo == chosenSubject.name || fakeOptionTwo == fakeOptionOne) {
                if (i > 100) {
                    fakeOptionTwo = subjectArray[Math.floor(Math.random() * subjectArray.length)];
                    break;
                }
                fakeOptionTwo = gradedata[Math.round(Math.random() * (gradedata.length - 1))].name;
                i++;
            }
            id('recap-text-' + random).innerHTML = chosenSubject.name;
            switch (random) {
                case 1:
                    id('recap-text-2').innerHTML = fakeOptionOne;
                    id('recap-text-3').innerHTML = fakeOptionTwo;
                    break;
                case 2:
                    id('recap-text-1').innerHTML = fakeOptionOne;
                    id('recap-text-3').innerHTML = fakeOptionTwo;
                    break;
                case 3:
                    id('recap-text-1').innerHTML = fakeOptionOne;
                    id('recap-text-2').innerHTML = fakeOptionTwo;
                    break;
            }
            let clicked = false;
            id('recap-nextpage').addEventListener('click', function () {
                if (clicked) {
                    closeRecapPage();
                    return;
                }
                if (!id('recap-option-1').checked && !id('recap-option-2').checked && !id('recap-option-3').checked) {
                    return;
                }
                if (id('recap-option-' + random).checked) {
                    clicked = true;
                    id('recap-option-' + random).parentElement.classList.add('right');
                    this.innerHTML = 'Volgende';
                    try {
                        new Audio(getAudioUrl('correct')).play();
                    }
                    catch (e) {
                        console.warn(e);
                    }
                    startConfetti();
                    setTimeout(stopConfetti, 750);
                }
                else {
                    try {
                        new Audio(getAudioUrl('error')).play();
                    }
                    catch (e) {
                        console.warn(e);
                    }
                    clicked = true;
                    if (id('recap-option-1').checked) {
                        id('recap-option-1').parentElement.classList.add('wrong');
                    }
                    if (id('recap-option-2').checked) {
                        id('recap-option-2').parentElement.classList.add('wrong');
                    }
                    if (id('recap-option-3').checked) {
                        id('recap-option-3').parentElement.classList.add('wrong');
                    }
                    id('recap-option-' + random).parentElement.classList.add('right');
                    this.innerHTML = 'Volgende';
                }
            });
            id('recap-option-1').addEventListener('change', function () { id('recap-option-2').checked = false; id('recap-option-3').checked = false; });
            id('recap-option-2').addEventListener('change', function () { id('recap-option-1').checked = false; id('recap-option-3').checked = false; });
            id('recap-option-3').addEventListener('change', function () { id('recap-option-1').checked = false; id('recap-option-2').checked = false; });
        }
    }

   
       function openSettings() {
        tryRemove(id('mod-setting-panel'));
               if (!n(tn('sl-account-modal', 0))) {
            setTimeout(function () {
                               if (!n(tn('sl-account-modal-header', 1)) && !n(tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0])) {
                    tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0].dataset.originalText = tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0].innerHTML;
                    setHTML(tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0], 'Mod-instellingen');
                }
                               if (document.documentElement.clientWidth <= 767 && !n(tn('sl-account-modal', 0).getElementsByClassName('container')[0])) {
                    if (!tn('sl-account-modal', 0).getElementsByClassName('container')[0].classList.contains('show-details')) {
                        if (tn('sl-account-modal-tab', 0).classList.contains('active')) {
                            tn('sl-account-modal-tab', 1).click();
                        }
                        else {
                            tn('sl-account-modal-tab', 0).click();
                        }
                        openSettings();
                    }
                }
            }, 10);
            if (!n(tn('sl-account-modal', 0).getElementsByClassName('content')[0]) && !n(tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0]) && !n(tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].children[0])) {
                tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].children[0].inert = true;
            }
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
            if (id('mod-setting-button')) {
                id('mod-setting-button').classList.add('active');
            }
            else {
                execute([insertModSettingLink]);
            }
            let nicknames = '<h3>Nicknames</h3><p>Verander de naam van docenten in Somtoday. HTML is ondersteund.</p><p>Vul de docentnaam precies in als op de berichtenpagina ("Dhr. E.X. Ample"). Vul bij de afkorting de docentafkorting in die in het rooster staat als je op een les klikt (optioneel). Vul tenslotte in welke nickname je deze docent wil geven.</p><div id="nickname-wrapper">';
            let nicknameArray = parseJSON(get('nicknames'));
            if (nicknameArray == null) {
                set('nicknames', '[]');
                nicknameArray = [];
            }
            for (const nickname of nicknameArray) {
                if (nickname.length == 2 || nickname.length == 3) {
                    nicknames += '<div><input type="text" placeholder="Docentnaam" value="' + nickname[0].replaceAll('&', '&amp;').replaceAll('>', '&gt;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') + '"><input type="text" placeholder="Afkorting" value="' + (nickname[2] ? nickname[2].replaceAll('&', '&amp;').replaceAll('>', '&gt;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') : '') + '"><input type="text" placeholder="Nickname" value="' + nickname[1].replaceAll('&', '&amp;').replaceAll('>', '&gt;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') + '"></div>';
                }
            }
            let backgroundHTML = '';
            let numberOfBackgrounds = 0;
            while (!n(get('background' + numberOfBackgrounds))) {
                backgroundHTML += '<img tabindex="0" onclick="document.getElementById(\'mod-background-wrapper\').classList.add(\'mod-modified\');this.remove();" src="' + get('background' + numberOfBackgrounds) + '">';
                numberOfBackgrounds++;
            }
            nicknames += '<div><input type="text" placeholder="Docentnaam"><input type="text" placeholder="Afkorting"><input type="text" placeholder="Nickname"></div></div><div class="br"></div><div tabindex="0" class="mod-button" onclick="document.getElementById(\'nickname-wrapper\').insertAdjacentHTML(\'beforeend\', \'<div><input type=\\\'text\\\' placeholder=\\\'Docentnaam\\\'><input type=\\\'text\\\' placeholder=\\\'Afkorting\\\'><input type=\\\'text\\\' placeholder=\\\'Nickname\\\'></div>\');">Nickname toevoegen</div><div tabindex="0" class="mod-button" onclick="document.getElementById(\'nickname-wrapper\').innerHTML = \'<div><input type=\\\'text\\\' placeholder=\\\'Docentnaam\\\'><input type=\\\'text\\\' placeholder=\\\'Afkorting\\\'><input type=\\\'text\\\' placeholder=\\\'Nickname\\\'></div>\';">Reset</div>';
            const updatechecker = (!isExtension) ? '<a id="mod-update-checker" class="mod-setting-button" tabindex="0"><span>' + getIcon('globe', 'mod-update-rotate', 'var(--text-moderate)') + 'Check updates</span></a>' : '';
            const updateinfo = (!isExtension) ? '' : 'Je browser controleert automatisch op updates.';

            let settingsContent = getSettingsFile(get('settings_type'));
            let contributorContent = '';
            for (const key of Object.keys(contributors)) {
                contributorContent += '<a href="https://github.com/' + sanitizeString(key) + '/" target="_blank"><img src="' + sanitizeString(contributors[key]) + '"><p>' + sanitizeString(key) + '</p></a>';
            }

            const replacements = {
                '{{icon_floppy_disk}}': getIcon('floppy-disk', 'mod-save-shake', 'var(--text-moderate)'),
                '{{icon_rotate_left}}': getIcon('rotate-left', 'mod-reset-rotate', 'var(--text-moderate)'),
                '{{icon_circle_info}}': getIcon('circle-info', 'mod-info-wobble', 'var(--text-moderate)'),
                '{{icon_circle_exclamation}}': getIcon('circle-exclamation', 'mod-bug-scale', 'var(--text-moderate)'),
                '{{icon_upload}}': getIcon('upload', null, 'var(--fg-on-primary-weak)'),
                '{{updatechecker}}': updatechecker,
                '{{addSetting_primarycolor}}': addSetting('Primaire kleur', null, 'primarycolor', 'color', '#0067c2'),
                '{{addSetting_secondarycolor}}': addSetting('Secundaire kleur', null, 'secondarycolor', 'color', '#0067c2'),
                '{{backgroundtype_image_active}}': (n(get('backgroundtype')) || get('backgroundtype') == 'image') ? 'active' : '',
                '{{backgroundtype_slideshow_active}}': get('backgroundtype') == 'slideshow' ? 'active' : '',
                '{{backgroundtype_color_active}}': get('backgroundtype') == 'color' ? 'active' : '',
                '{{backgroundtype_live_active}}': get('backgroundtype') == 'live' ? 'active' : '',
                '{{display_bg_image}}': (n(get('backgroundtype')) || get('backgroundtype') == 'image') ? 'block' : 'none',
                '{{display_mod_filters}}': n(get('background')) ? 'display:none;' : '',
                '{{video_style}}': n(id('mod-background')) ? '' : 'filter:' + id('mod-background').style.filter + ';',
                '{{video_src}}': (get('isbackgroundvideo') && get('isbackgroundvideo') != 'false') ? get('background') : '',
                '{{image_style}}': (n(id('mod-background')) ? '' : 'filter:' + id('mod-background').style.filter + ';') + ((get('isbackgroundvideo') && get('isbackgroundvideo') != 'false') ? 'display:none;' : ''),
                '{{image_src}}': (n(get('background')) ? 'data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=' : get('background')),
                '{{addSlider_brightness}}': addSlider('Helderheid', 'brightness', 0, 200, '%', 100),
                '{{addSlider_contrast}}': addSlider('Contrast', 'contrast', 0, 200, '%', 100),
                '{{addSlider_saturate}}': addSlider('Verzadiging', 'saturate', 0, 200, '%', 100),
                '{{addSlider_opacity}}': addSlider('Opacity', 'opacity', 0, 100, '%', 100),
                '{{addSlider_huerotate}}': addSlider('Kleurrotatie', 'huerotate', 0, 360, 'deg', 0),
                '{{addSlider_grayscale}}': addSlider('Grayscale', 'grayscale', 0, 100, '%', 0),
                '{{addSlider_sepia}}': addSlider('Sepia', 'sepia', 0, 100, '%', 0),
                '{{addSlider_invert}}': addSlider('Invert', 'invert', 0, 100, '%', 0),
                '{{addSlider_blur}}': addSlider('Blur', 'blur', 0, 200, 'px', 0),
                '{{addSetting_background}}': addSetting('Achtergrondafbeelding', 'Stel een afbeelding in voor op de achtergrond. Video\'s worden ook ondersteund.', 'background', 'file', null, 'image/*, video/*'),
                '{{display_bg_slideshow}}': get('backgroundtype') == 'slideshow' ? 'block' : 'none',
                '{{backgroundHTML}}': backgroundHTML,
                '{{display_bg_color}}': get('backgroundtype') == 'color' ? 'block' : 'none',
                '{{display_bg_live}}': get('backgroundtype') == 'live' ? 'block' : 'none',
                '{{addSetting_backgroundcolor}}': addSetting('Achtergrondkleur', null, 'backgroundcolor', 'color', darkmode ? '#20262d' : '#ffffff'),
                '{{addSetting_ui_transparency}}': addSetting('UI-transparantie', 'Verander de transparantie van de UI.', 'ui', 'range', get('ui'), 0, 100, 1, true, 'image', 'opacity'),
                '{{addSetting_ui_blur}}': addSetting('UI-blur', 'Verander de blur van de UI.', 'uiblur', 'range', get('uiblur'), 0, 100, 1, true, 'image', 'blur'),
                '{{theme_wrapper}}': '',
                '{{layout_1}}': '<div tabindex="0" class="layout-container' + (get('layout') == 1 ? ' layout-selected' : '') + '" id="layout-1"><div style="width:94%;height:19%;top:4%;left: 4%;"></div><div style="width:94%;height:68%;top:27%;left:3%;"></div><h3>Standaard</h3></div>',
                '{{layout_2}}': '<div tabindex="0" class="layout-container' + (get('layout') == 2 ? ' layout-selected' : '') + '" id="layout-2"><div style="width: 16%; height: 92%; top: 4%; left: 3%;"></div><div style="width: 75%; height: 92%; right: 3%; top: 4%;"></div><h3>Sidebar links</h3></div>',
                '{{layout_3}}': '<div tabindex="0" class="layout-container' + (get('layout') == 3 ? ' layout-selected' : '') + '" id="layout-3"><div style="width:75%;height:92%;left:3%;top:4%;"></div><div style="width:16%;height:92%;right:3%;top:4%;"></div><h3>Sidebar rechts</h3></div>',
                '{{layout_4}}': '<div tabindex="0" class="layout-container' + (get('layout') == 4 ? ' layout-selected' : '') + '" id="layout-4"><div style="width:68%;height:19%;top:4%;left:16%;"></div><div style="width: 68%;height:68%;top:27%;left: 16%;"></div><h3>Gecentreerd</h3></div>',
                '{{layout_5}}': '<div tabindex="0" class="layout-container' + (get('layout') == 5 ? ' layout-selected' : '') + '" id="layout-5"><div style="width:16%;height:92%;top:4%;left:3%;"></div><div style="width:75%;height:19%;right:3%;top:4%;"></div><div style="width:75%;height:69%;right:3%;top:27%;"></div><h3>Menu & sidebar</h3></div>',
                '{{menu_settings}}': addSetting('Laat menu altijd zien', 'Toon de bovenste menubalk altijd. Als dit uitstaat, verdwijnt deze als je naar beneden scrolt.', 'bools00', 'checkbox', true) + addSetting('Paginanaam in menu', 'Laat een tekst met de paginanaam zien in het menu.', 'bools01', 'checkbox', true) + addSetting('Verberg bericht teller', 'Verberg het tellertje dat het aantal ongelezen berichten aangeeft.', 'bools02', 'checkbox', false),
                '{{nicknames}}': nicknames,
                '{{username_wrapper}}': '<h3>Gebruikersnaam</h3><p>Verander je gebruikersnaam.</p><div id="username-wrapper"><div><input title="Echte naam" class="mod-custom-setting" id="realname" type="text" placeholder="Echte naam" value="' + (n(get('realname')) ? '' : get('realname')) + '"><input title="Nieuwe gebruikersnaam" class="mod-custom-setting" id="username" type="text" placeholder="Nieuwe gebruikersnaam" value="' + (n(get('username')) ? '' : sanitizeString(get('username'))) + '"></div></div>',
                '{{font_settings}}': `
                    <h3>Lettertype</h3>` +
                    (window.getComputedStyle(tn('span', 0)).getPropertyValue('font-family').indexOf('OpenDyslexic') == -1 ? '' : '<div class="br"></div><div class="mod-info-notice">' + getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'De instelling <b><i style="background-color:var(--bg-primary-weak);fill:var(--fg-on-primary-weak);display:inline-block;vertical-align:middle;margin:0 5px;padding:5px;border-radius:4px;"><svg width="16px" height="16px" viewBox="0 0 24 24" display="block"><path d="m10.37 19.785-1.018-3.742H4.229L3.21 19.785H0L4.96 4h3.642l4.98 15.785zm-1.73-6.538L7.623 9.591q-.096-.365-.26-.935a114 114 0 0 0-.317-1.172q-.153-.603-.25-1.043-.095.441-.269 1.097a117 117 0 0 1-.538 2.053l-1.01 3.656h3.663Zm10.89-5.731q2.163 0 3.317 1.054Q23.999 9.623 24 11.774v8.01h-2.047l-.567-1.633h-.077q-.462.644-.942 1.053t-1.105.602q-.625.194-1.52.194a3.55 3.55 0 0 1-1.71-.409q-.75-.408-1.182-1.247-.432-.85-.433-2.15 0-1.914 1.202-2.818 1.2-.914 3.604-1.01l1.865-.065v-.527q0-.946-.442-1.387-.442-.44-1.23-.44a4.9 4.9 0 0 0-1.529.247q-.75.246-1.5.623l-.97-2.215a7.8 7.8 0 0 1 1.913-.796 8.3 8.3 0 0 1 2.2-.29m1.558 6.7-1.135.042q-1.422.043-1.98.57-.547.527-.547 1.387 0 .753.394 1.075.393.312 1.028.312.942 0 1.586-.623.654-.624.654-1.775v-.989Z"></path></svg></i>Weergave > Optimaliseer voor dyslexie</b> moet uitstaan om dit te laten werken.</div><div class="br"></div><div class="br"></div>') + `
                    <div class="mod-custom-select notranslate">
                        <select id="mod-font-select" title="Selecteer een lettertype">
                            <option selected disabled hidden>
                                ${"$"}{n(get('customfontname')) ? get("fontname") : get('customfontname').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')}
                            </option>
                            <option>${"$"}{fonts.join('</option><option>')}</option>
                        </select>
                    </div>
                    <label tabindex="0" class="mod-file-label" for="mod-font-file" style="display:inline-block;">
                        ${"$"}{getIcon('upload', null, 'var(--fg-on-primary-weak)')}
                        <p>Of upload lettertype</p>
                    </label>
                    <input id="mod-font-file" type="file" style="display:none;" accept=".otf,.ttf,.fnt">
                    <div class="example-box-wrapper">
                        <div id="font-box">
                            <h3 style="letter-spacing:normal;">Lettertype</h3>
                            <p style="letter-spacing:normal;margin-bottom:0;">Kies een lettertype voor Somtoday.</p>
                        </div>
                    </div>
                    <div class="br"></div><div class="br"></div><div class="br"></div>`,
                '{{profilepic_setting}}': addSetting('Profielafbeelding', 'Upload je eigen profielafbeelding in plaats van je schoolfoto.' + ((!n(cn('avatar', 0)) && !n(cn('avatar', 0).getElementsByClassName('foto')[0]) && cn('avatar', 0).getElementsByClassName('foto')[0].classList.contains('hidden')) ? '<div class="mod-info-notice">' + getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'De instelling <b><i style="background-color:var(--bg-primary-weak);fill:var(--fg-on-primary-weak);display:inline-block;vertical-align:middle;margin:0 5px;padding:5px;border-radius:4px;"><svg width="16px" height="16px" viewBox="0 0 24 24" display="block"><path d="m10.37 19.785-1.018-3.742H4.229L3.21 19.785H0L4.96 4h3.642l4.98 15.785zm-1.73-6.538L7.623 9.591q-.096-.365-.26-.935a114 114 0 0 0-.317-1.172q-.153-.603-.25-1.043-.095.441-.269 1.097a117 117 0 0 1-.538 2.053l-1.01 3.656h3.663Zm10.89-5.731q2.163 0 3.317 1.054Q23.999 9.623 24 11.774v8.01h-2.047l-.567-1.633h-.077q-.462.644-.942 1.053t-1.105.602q-.625.194-1.52.194a3.55 3.55 0 0 1-1.71-.409q-.75-.408-1.182-1.247-.432-.85-.433-2.15 0-1.914 1.202-2.818 1.2-.914 3.604-1.01l1.865-.065v-.527q0-.946-.442-1.387-.442-.44-1.23-.44a4.9 4.9 0 0 0-1.529.247q-.75.246-1.5.623l-.97-2.215a7.8 7.8 0 0 1 1.913-.796 8.3 8.3 0 0 1 2.2-.29m1.558 6.7-1.135.042q-1.422.043-1.98.57-.547.527-.547 1.387 0 .753.394 1.075.393.312 1.028.312.942 0 1.586-.623.654-.624.654-1.775v-.989Z"></path></svg></i>Weergave > Verberg profielfoto</b> moet uitstaan om dit te laten werken.</div>' : ''), 'profilepic', 'file', null, 'image/*', '120'),
                '{{grade_reveal_setting}}': '<div><h3>Cijfer-reveal</h3><p style="margin-right:15px;">Toon bij je cijfers een optel-animatie.</p><div id="grade-reveal-select" class="mod-multi-choice"><span' + (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) == '1' ? ' class="active"' : '') + ' tabindex="0">Alleen bij nieuwe cijfers</span><span' + (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) == '2' ? ' class="active"' : '') + ' tabindex="0">Altijd</span><span' + (get('bools').charAt(BOOL_INDEX.GRADE_REVEAL) == '0' ? ' class="active"' : '') + ' tabindex="0">Nooit</span></div></div>',
                '{{letterbeoordelingen_setting}}': '<div><h3>Letterbeoordelingen</h3><p style="margin-right:15px;">Stel in hoeveel lettercijfers (O, V, G, etc) waard zijn voor jouw school.</p><div id="mod-change-letterbeoordelingen" tabindex="0" class="mod-button">Instellen</div></div>',
                '{{extra_settings}}': addSetting('Analyse op cijferpagina', 'Laat een korte analyse zien op de cijfer-pagina van een vak.', 'bools18', 'checkbox', true) +
                    (platform == 'Android' ? '' : addSetting('Compact rooster', 'Maak je rooster compacter door lesuren in een grid te zetten. Werkt niet voor alle scholen.', 'bools03', 'checkbox', false)) +
                    addSetting('Deel debug-data', 'Verstuur bij een error anonieme informatie naar de developer om Somtoday Mod te verbeteren.', 'bools04', 'checkbox', false) +
                    (platform == 'Android' ? '' : addSetting('Downloadknop voor cijfers', 'Laat een downloadknop zien op de laatste cijfers en vakgemiddelden-pagina.', 'bools05', 'checkbox', true)) +
                    addSetting('Feestdagen', 'Laat bij feestdagen soms iets zien, zoals een kerstmuts op het Somtoday-logo.', 'bools17', 'checkbox', true) +
                    addSetting('Felicitatieberichten', 'Laat een felicitatiebericht zien als je jarig bent, of als je al een aantal jaar van Somtoday Mod gebruik maakt.', 'bools06', 'checkbox', true) +
                    addSetting('Grafieken op cijferpagina', 'Laat een cijfer- en gemiddeldegrafiek zien op de cijfer-pagina van een vak.', 'bools07', 'checkbox', true) +
                    ((get('layout') == 2 || get('layout') == 3 || get('layout') == 5) ? addSetting('Logo van mod in menu', 'Laat in plaats van het logo van Somtoday het logo van Somtoday Mod zien.', 'bools08', 'checkbox', true) : '') +
                    addSetting('Raster bij rooster', 'Laat een raster zien achter je rooster.', 'bools15', 'checkbox', true) +
                    (platform == 'Android' ? '' : addSetting('Redirect naar ELO', 'Redirect je automatisch van https://som.today naar https://inloggen.somtoday.nl.', 'bools09', 'checkbox', true)) +
                    addSetting('Rekentool op cijferpagina', 'Voeg een rekentool toe op de cijferpagina om snel te berekenen welk cijfer je moet halen.', 'bools10', 'checkbox', true) +
                    addSetting('Scrollbar', 'Laat de scrollbar van een pagina zien.', 'bools11', 'checkbox', true) +
                    addSetting('Selecteren', 'Maak alle tekst selecteerbaar.', 'bools13', 'checkbox', false) +
                    addSetting('Somtoday Recap', 'Laat aan het einde van het schooljaar een recap-knop zien (vanaf 26 juni).', 'bools12', 'checkbox', true) +
                    addSetting('Taken toevoegen', 'Laat een knop zien om taken toe te voegen aan de studiewijzer.', 'bools16', 'checkbox', true),
                '{{browser_settings}}': (platform == 'Android' ? '' : '<h3 class="category" data-category="browser" tabindex="0">Browser</h3><div id="category-browser">' + addSetting('Titel', 'Verander de titel van Somtoday in de tabbladen van de browser.', 'title', 'text', '', 'Somtoday') + '<div class="br"></div><div class="br"></div><div class="br"></div>' + addSetting('Icoon', 'Verander het icoontje van Somtoday in de menubalk van de browser. Accepteert png, jpg/jpeg, gif, svg, ico en meer.</p>' + (platform == 'Firefox' ? '' : '<div class="mod-info-notice">' + getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'Bewegende GIF-bestanden werken alleen in Firefox.</div>') + '<p>', 'icon', 'file', null, 'image/*', '300') + '</div>'),
                '{{autologin_warning}}': get('logincredentialsincorrect') == '1' ? '<div class="mod-info-notice">' + getIcon('circle-info', null, 'var(--fg-on-primary-weak)', 'style="height: 20px;"') + 'Autologin is tijdelijk uitgeschakeld.</div><div class="br"></div><div class="br"></div><div class="br"></div>' : '',
                '{{autologin_school}}': addSetting('School', 'Voer je schoolnaam in.', 'loginschool', 'text', '', ''),
                '{{autologin_name}}': addSetting('Gebruikersnaam', 'Voer je gebruikersnaam in.', 'loginname', 'text', '', ''),
                '{{autologin_pass}}': addSetting('Wachtwoord', 'Voer je wachtwoord in.', 'loginpass', 'password', '', ''),
                '{{somtoday_version}}': (n(somtodayversion) ? 'Onbekende versie' : 'Versie ' + somtodayversion) + ' van Somtoday | Versie ' + version_name + ' van Somtoday Mod',
                '{{platform}}': 'Somtoday ' + platform,
                '{{contributors_list}}': contributorContent,
                '{{updateinfo}}': updateinfo,
                '{{export_import_buttons}}': (platform == 'Android' ? '' : '<div id="export-settings" class="mod-button">Exporteer Mod-instellingen</div><div id="import-settings" class="mod-button">Importeer Mod-instellingen</div><input type="file" id="import-settings-json" class="hidden" accept="application/json">')
            };


            for (const key in replacements) {
                settingsContent = settingsContent.replaceAll(key, replacements[key]);
            }

            tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].insertAdjacentHTML('beforeend', settingsContent);
            if (platform != 'Android') {
                id('export-settings').addEventListener('click', exportSettings);
                id('import-settings').addEventListener('click', function () {
                    modMessage('Instellingen importeren?', 'Wanneer je Mod-instellingen importeert worden je huidige instellingen overschreven. Importeer alleen instellingsbestanden die je vertrouwt of zelf hebt ge&euml;xporteerd.', 'Ja', 'Nee');
                    id('mod-message-action1').addEventListener('click', function () {
                        id('import-settings-json').click();
                        closeModMessage();
                    });
                    id('mod-message-action2').addEventListener('click', closeModMessage);
                });
                id('import-settings-json').addEventListener('input', importSettings);
            }
            if (!n(id('mod-font-file'))) {
                id('mod-font-file').addEventListener('input', function () {
                    if (this.files.length != 0) {
                        tryRemove(id('mod-font-preview'));
                        this.parentElement.getElementsByTagName('label')[0].children[1].innerText = this.files[0].name.toLowerCase();
                        this.parentElement.getElementsByTagName('label')[0].classList.add('mod-active');
                        let reader = new FileReader();
                        reader.readAsDataURL(id('mod-font-file').files[0]);
                        reader.onload = function () {
                            setTimeout(function () {
                                tn('head', 0).insertAdjacentHTML('beforeend', '<style id="mod-font-preview">@font-face{font-family:modCustomFontPreview;src:url("' + reader.result + '");}</style>');
                                document.getElementById('font-box').children[0].style.setProperty('font-family', 'modCustomFontPreview, sans-serif', 'important');
                                document.getElementById('font-box').children[1].style.setProperty('font-family', 'modCustomFontPreview, sans-serif', 'important');
                            }, 100);
                        };
                    } else {
                        this.parentElement.getElementsByTagName('label')[0].children[1].innerText = 'Of upload lettertype';
                        this.parentElement.getElementsByTagName('label')[0].classList.remove('mod-active');
                        this.value = null;
                    }
                });
            }
                                  addTheme('Standaard', '', '0067c2', 'e69b22', 20, false);
            addTheme('Bergen', '618833', '3b4117', '3b4117', 40, false);
            addTheme('Eiland', '994605', '2a83b1', '2a83b1', 25, false);
            addTheme('Zee', '756856', '173559', '173559', 25, false);
            addTheme('Bergmeer', '1284296', '4a6a2f', '4a6a2f', 30, false);
            addTheme('Rivieruitzicht', '822528', '526949', '526949', 40, false);
            addTheme('Ruimte', '110854', '0d0047', '0d0047', 50, true);
            addTheme('Bergen en ruimte', '1624504', '6489a0', '6489a0', 50, true);
            addTheme('Stad', '2246476', '18202d', '18202d', 25, true);
            addTheme('Weg', '1820563', 'de3c22', 'de3c22', 65, true);
            const isbackgroundvideo = get('isbackgroundvideo') && get('isbackgroundvideo') != 'false';
            id('mod-background-preview-image').style.setProperty('filter', getBackgroundFilters(false));
            id('mod-background-preview-video').style.setProperty('filter', getBackgroundFilters(false));
            id('mod-background-preview-image').style.display = !isbackgroundvideo ? 'block' : 'none';
            id('mod-background-preview-video').style.display = isbackgroundvideo ? 'block' : 'none';
            id('addbackground').addEventListener('input', function () {
                const files = this.files;
                for (var i = 0; i < files.length; i++) {
                    if (this.accept != 'image/*' || files[i]['type'].indexOf('image') != -1) {
                        let reader = new FileReader();
                        reader.readAsDataURL(this.files[i]);
                        reader.onload = function () {
                            id('mod-background-wrapper').classList.add('mod-modified');
                            id('mod-background-wrapper').insertAdjacentHTML('afterbegin', '<img tabindex="0" onclick="document.getElementById(\'mod-background-wrapper\').classList.add(\'mod-modified\');this.remove();" src="' + reader.result + '" />');
                        };
                    }
                }
            });
            for (const element of cn('mod-multi-choice')) {
                for (const child of element.children) {
                    child.addEventListener('click', function () {
                        this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                        this.classList.add('active');
                    });
                }
            }
            for (const element of cn('mod-slider')) {
                element.getElementsByTagName('input')[0].addEventListener('input', function () {
                    this.classList.add('mod-modified');
                    this.parentElement.children[2].innerHTML = this.value + this.dataset.unit;
                    id('mod-background-preview-image').style.setProperty('filter', getBackgroundFilters(false));
                    id('mod-background-preview-video').style.setProperty('filter', getBackgroundFilters(false));
                });
            }
            id('background').addEventListener('input', function () {
                if (this.files[0] != null) {
                    const isVideo = this.files[0].type.indexOf('video') != -1;
                    let reader = new FileReader();
                    reader.readAsDataURL(this.files[0]);
                    id('mod-background-preview-image').style.display = !isVideo ? 'block' : 'none';
                    id('mod-background-preview-video').style.display = isVideo ? 'block' : 'none';
                    id('mod-filters').style.display = 'block';
                    reader.onload = function () {
                        if (isVideo) {
                            id('mod-background-preview-video').src = reader.result;
                        }
                        else {
                            id('mod-background-preview-image').src = reader.result;
                        }
                    };
                }
                else {
                    id('mod-filters').style.display = 'none';
                }
            });
            id('mod-reset-filters').addEventListener('click', function () {
                id('brightness').value = 100;
                id('brightness').dispatchEvent(new Event('input'));
                id('contrast').value = 100;
                id('contrast').dispatchEvent(new Event('input'));
                id('saturate').value = 100;
                id('saturate').dispatchEvent(new Event('input'));
                id('opacity').value = 100;
                id('opacity').dispatchEvent(new Event('input'));
                id('huerotate').value = 0;
                id('huerotate').dispatchEvent(new Event('input'));
                id('grayscale').value = 0;
                id('grayscale').dispatchEvent(new Event('input'));
                id('sepia').value = 0;
                id('sepia').dispatchEvent(new Event('input'));
                id('invert').value = 0;
                id('invert').dispatchEvent(new Event('input'));
                id('blur').value = 0;
                id('blur').dispatchEvent(new Event('input'));
                id('mod-background-preview-image').style.setProperty('filter', getBackgroundFilters(false));
                id('mod-background-preview-video').style.setProperty('filter', getBackgroundFilters(false));
            });
            id('type-image').addEventListener('click', function () {
                this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                this.classList.add('active');
                show(id('mod-bg-image'));
                hide(id('mod-bg-slideshow'));
                hide(id('mod-bg-color'));
                hide(id('mod-bg-live'));
            });
            id('type-live').addEventListener('click', function () {
                this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                this.classList.add('active');
                hide(id('mod-bg-image'));
                hide(id('mod-bg-slideshow'));
                hide(id('mod-bg-color'));
                show(id('mod-bg-live'));
            });
            id('type-slideshow').addEventListener('click', function () {
                this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                this.classList.add('active');
                hide(id('mod-bg-image'));
                show(id('mod-bg-slideshow'));
                hide(id('mod-bg-color'));
                hide(id('mod-bg-live'));
            });
            id('type-color').addEventListener('click', function () {
                this.parentElement.getElementsByClassName('active')[0].classList.remove('active');
                this.classList.add('active');
                hide(id('mod-bg-image'));
                hide(id('mod-bg-slideshow'));
                show(id('mod-bg-color'));
                hide(id('mod-bg-live'));
            });
                       let number = 0;
            if (n(get('category'))) {
                set('category', '111111111');
            }
            const categories = get('category');
            for (const element of cn('mod-setting-button')) {
                element.addEventListener('keyup', (event) => { if (event.keyCode === 13) { element.click(); } }, { once: true });
            }
            for (const element of id('mod-setting-panel').getElementsByClassName('category')) {
                const index = number;
                id('category-' + element.dataset.category).style.display = categories.charAt(index) == '1' ? 'block' : 'none';
                if (categories.charAt(index) == '1') {
                    element.classList.remove('collapsed');
                }
                else {
                    element.classList.add('collapsed');
                }
                element.addEventListener('click', function () {
                                                          const collapsed = id('category-' + element.dataset.category).style.display == 'none';
                    set('category', get('category').replaceAt(index, collapsed ? '1' : '0'));
                    if (collapsed) {
                        element.classList.remove('collapsed');
                    }
                    else {
                        element.classList.add('collapsed');
                    }
                    id('category-' + element.dataset.category).style.display = collapsed ? 'block' : 'none';
                });
                element.addEventListener('keyup', (event) => { if (event.keyCode === 13) { element.click(); } }, { once: true });
                number++;
            }
                       for (const element of cn('mod-file-label')) {
                element.addEventListener('drop', function (event) {
                                       event.preventDefault();

                    let done = false;
                    if (event.dataTransfer.items) {
                        [...event.dataTransfer.items].forEach((item, i) => {
                            if (!done && item.kind === "file") {
                                done = true;
                                element.classList.remove('mod-drag-and-drop');
                                const file = item.getAsFile();
                                const dataTransfer = new DataTransfer();
                                dataTransfer.items.add(file);
                                const fileList = dataTransfer.files;
                                element.nextElementSibling.files = fileList;
                            }
                        });
                    } else {
                        [...event.dataTransfer.files].forEach((file, i) => {
                            if (!done) {
                                done = true;
                                element.classList.remove('mod-drag-and-drop');
                                const dataTransfer = new DataTransfer();
                                dataTransfer.items.add(file);
                                const fileList = dataTransfer.files;
                                element.nextElementSibling.files = fileList;
                            }
                        });
                    }
                    let inputEvent = new Event('input', {
                        bubbles: false,
                    });
                    element.nextElementSibling.dispatchEvent(inputEvent);
                });
                element.addEventListener('dragover', function (event) {
                    event.preventDefault();
                    element.classList.add('mod-drag-and-drop');
                    element.children[1].innerHTML = 'Drop een afbeelding';
                });
                element.addEventListener('dragleave', function () {
                    element.classList.remove('mod-drag-and-drop');
                    element.children[1].innerHTML = 'Kies een bestand';
                });
            }
                       for (const element of cn('layout-container')) {
                element.addEventListener('click', function () {
                    for (const element of cn('layout-selected')) {
                        element.classList.remove('layout-selected');
                    }
                    element.classList.add('layout-selected');
                });
            }
                       id('save').addEventListener('click', function () {
                execute([save]);
            });
            id('reset').addEventListener('click', function () {
                modMessage('Alles resetten?', 'Al je instellingen zullen worden gereset. Weet je zeker dat je door wil gaan?', 'Ja', 'Nee');
                id('mod-message-action1').addEventListener('click', function () {
                    execute([reset, setBackground, style, pageUpdate]);
                    if (!n(id('mod-grades-graphs')) && get('bools').charAt(BOOL_INDEX.SUBJECT_GRAPHS) == '1' && !n(tn('sl-vakresultaten', 0))) {
                        tryRemove(id('mod-grades-graphs'));
                        tn('sl-vakresultaten', 0).insertAdjacentHTML('beforeend', '<div id="mod-grades-graphs"><h3>Mijn cijfers</h3><div><canvas id="mod-chart-1"></canvas></div><h3>Mijn gemiddelde</h3><div><canvas id="mod-chart-2"></canvas></div></div>');
                        setTimeout(gradeGraphs, 500);
                    }
                    closeModMessage();
                });
                id('mod-message-action2').addEventListener('click', closeModMessage);
            });
            if (!isExtension) {
                id('mod-update-checker').addEventListener('click', function () { execute([checkUpdate]) });
            }
            id('mod-play-defender').addEventListener('click', function () {
                tn('sl-root', 0).inert = false;
                setTimeout(gradeDefenderGame, 200);
            });
                                  id('mod-random-background').addEventListener('click', function () {
                id('mod-random-background').classList.toggle('mod-active');
                if (!n(id('mod-random-background').previousElementSibling)) {
                    if (id('mod-random-background').previousElementSibling.classList.contains('mod-active')) {
                        id('mod-random-background').previousElementSibling.classList.remove('mod-active');
                    }
                    if ((((!n(id('mod-random-background').previousElementSibling)) && !n(id('mod-random-background').previousElementSibling.previousElementSibling)) && !n(id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('label')[0])) && id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].classList.contains('mod-active')) {
                        id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].classList.remove('mod-active');
                        setHTML(id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('label')[0].children[1], 'Kies een bestand');
                        id('mod-random-background').previousElementSibling.previousElementSibling.getElementsByTagName('input')[0].value = null;
                    }
                }
            });
                       id('mod-live-randomize').addEventListener('click', function () {
                set('live_seed', Math.random() * 100);
                startLiveWallpaper();
            });
                       if (!n(id('mod-font-select-script'))) {
                tryRemove(id('mod-font-select-script'));
            }
            if (id('mod-change-letterbeoordelingen')) {
                id('mod-change-letterbeoordelingen').addEventListener('click', function () {
                    showLetterbeoordelingenMessage();
                });
            }
            id('somtoday-mod').insertAdjacentHTML('beforeend', '<style id="mod-font-select-script" onload=\'let x, i, j, l, ll, selElmnt, a, b, c; x = document.getElementsByClassName("mod-custom-select"); l = x.length; for (i = 0; i < l; i++) { selElmnt = x[i].getElementsByTagName("select")[0]; ll = selElmnt.length; a = document.createElement("DIV"); a.setAttribute("class", "select-selected"); a.setAttribute("tabindex", "0"); a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML; x[i].appendChild(a); b = document.createElement("DIV"); b.setAttribute("class", "select-items select-hide"); for (j = 1; j < ll; j++) { c = document.createElement("DIV"); c.innerHTML = selElmnt.options[j].innerHTML; c.setAttribute("tabindex", "0"); c.style.setProperty("font-family", "\\"" + selElmnt.options[j].innerHTML + "\\", sans-serif", "important"); c.addEventListener("click", function(e) { let y, i, k, s, h, sl, yl; s = this.parentNode.parentNode.getElementsByTagName("select")[0]; sl = s.length; h = this.parentNode.previousSibling; for (i = 0; i < sl; i++) { if (this.style.fontFamily.indexOf(s.options[i].innerHTML + ",") != -1 || this.style.fontFamily.indexOf(s.options[i].innerHTML + "\\",") != -1) { s.selectedIndex = i; h.innerHTML = this.innerHTML; y = this.parentNode.getElementsByClassName("same-as-selected"); yl = y.length; for (k = 0; k < yl; k++) { y[k].removeAttribute("class"); } this.setAttribute("class", "same-as-selected"); break; } } h.click(); document.getElementById("mod-font-select").classList.add("mod-modified"); if (document.getElementById("mod-font-preview")) { document.getElementById("mod-font-preview").remove(); } document.getElementById("mod-font-file").value = ""; let event = new Event("input", { bubbles: false }); document.getElementById("mod-font-file").dispatchEvent(event); document.getElementById("font-box").children[0].style.setProperty("font-family", "\\"" + document.getElementById("mod-font-select").value + "\\", sans-serif", "important"); document.getElementById("font-box").children[1].style.setProperty("font-family", "\\"" + document.getElementById("mod-font-select").value + "\\", sans-serif", "important"); document.getElementsByClassName("select-selected")[0].style.setProperty("font-family", "\\"" + document.getElementById("mod-font-select").value + "\\", sans-serif", "important"); }); b.appendChild(c); } x[i].appendChild(b); a.addEventListener("click", function(e) { e.stopPropagation(); closeAllSelect(this); this.nextSibling.classList.toggle("select-hide"); this.classList.toggle("select-arrow-active"); }); } function closeAllSelect(elmnt) { let x, y, i, xl, yl, arrNo = []; x = document.getElementsByClassName("select-items"); y = document.getElementsByClassName("select-selected"); xl = x.length; yl = y.length; for (i = 0; i < yl; i++) { if (elmnt == y[i]) { arrNo.push(i) } else { y[i].classList.remove("select-arrow-active"); } } for (i = 0; i < xl; i++) { if (arrNo.indexOf(i)) { x[i].classList.add("select-hide"); } } } document.addEventListener("click", closeAllSelect, {passive: true});\'></style>');
                       for (const element of cn('mod-file-reset')) {
                element.addEventListener('click', function () {
                    element.classList.toggle('mod-active');
                    if (element.dataset.key == 'background') {
                        if (!n(id('mod-random-background'))) {
                            if (id('mod-random-background').classList.contains('mod-active')) {
                                id('mod-random-background').classList.remove('mod-active');
                            }
                        }
                    }
                    if (!n(element.previousElementSibling)) {
                        if (!n(element.previousElementSibling.getElementsByTagName('label')[0])) {
                            if (element.previousElementSibling.getElementsByTagName('label')[0].classList.contains('mod-active')) {
                                element.previousElementSibling.getElementsByTagName('label')[0].classList.remove('mod-active');
                                setHTML(element.previousElementSibling.getElementsByTagName('label')[0].children[1], 'Kies een bestand');
                                element.previousElementSibling.getElementsByTagName('input')[0].value = null;
                            }
                        }
                    }
                });
            }
        }
    }

    const settingFileCache = {};
    function getSettingsFile(type) {
               if (n(type)) {
            type = 'familiar';
        }

                             if (isExtension) {
                                  if (settingFileCache[type]) {
                return settingFileCache[type];
            }

            let url = chrome.runtime.getURL('settings_content/' + type + '.html');

            let xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send(null);

            if (xhr.status === 200) {
                settingFileCache[type] = xhr.responseText;
                return xhr.responseText;
            } else {
                return '';
            }
        }
        else {
            

return `<div id="mod-setting-panel" class="mod-setting-panel">
    <div id="mod-actions">
        <a id="save" class="mod-setting-button" tabindex="0">
            <span>{{icon_floppy_disk}}Instellingen opslaan</span>
        </a>
        <a id="reset" class="mod-setting-button" tabindex="0">
            <span>{{icon_rotate_left}}Reset instellingen</span>
        </a>
        {{updatechecker}}
        <a class="mod-setting-button" tabindex="0" href="https://jonazwetsloot.nl/projecten/somtoday-mod" target="_blank">
            <span>{{icon_circle_info}}Informatie over mod</span>
        </a>
        <a class="mod-setting-button" tabindex="0" href="https://github.com/Jona-Zwetsloot/Somtoday-Mod/issues" target="_blank" id="mod-bug-report">
            <span>{{icon_circle_exclamation}}Bug melden</span>
        </a>
    </div>

    <h3 class="category" data-category="color" tabindex="0">Kleuren</h3>
    <div id="category-color">
        {{addSetting_primarycolor}}
        <div class="br"></div>
        <div class="br"></div>
        {{addSetting_secondarycolor}}
    </div>

    <h3 class="category" data-category="background" tabindex="0">Achtergrond</h3>
    <div id="category-background">
        <div id="mod-background-type">
            <a tabindex="0" id="type-image" class="{{backgroundtype_image_active}}">Afbeelding</a>
            <a tabindex="0" id="type-slideshow" class="{{backgroundtype_slideshow_active}}">Diavoorstelling</a>
            <a tabindex="0" id="type-color" class="{{backgroundtype_color_active}}">Effen kleur</a>
            <a tabindex="0" id="type-live" class="{{backgroundtype_live_active}}">Live</a>
        </div>

        <div id="mod-bg-image" style="display:{{display_bg_image}}" class="mod-background-type-content">
            {{addSetting_background}}
            <div tabindex="0" class="mod-button" id="mod-random-background">Random</div>
            <div class="br"></div>
            <div class="br"></div>
            <div id="mod-filters" style="{{display_mod_filters}}">
                <h3>Filters</h3>
                <p>Gebruik filters om de afbeelding aan te passen.</p>
                <video id="mod-background-preview-video" class="mod-background-preview" autoplay muted loop style="{{video_style}}" src="{{video_src}}"></video>
                <img id="mod-background-preview-image" class="mod-background-preview" style="{{image_style}}" src="{{image_src}}" />
                <div class="br"></div>
                {{addSlider_brightness}}
                {{addSlider_contrast}}
                {{addSlider_saturate}}
                {{addSlider_opacity}}
                {{addSlider_huerotate}}
                {{addSlider_grayscale}}
                {{addSlider_sepia}}
                {{addSlider_invert}}
                {{addSlider_blur}}
                <a tabindex="0" id="mod-reset-filters" style="display:inline-block;padding:5px 0;" class="dodgerblue">Reset filters</a>
            </div>
        </div>

        <div id="mod-bg-slideshow" style="display:{{display_bg_slideshow}}" class="mod-background-type-content">
            <h3>Achtergrondafbeeldingen</h3>
            <p>Stel afbeeldingen in voor op de achtergrond, waar elke keer één random afbeelding uit geselecteerd zal worden.</p>
            <div id="mod-background-wrapper">{{backgroundHTML}}<label tabindex="0" for="addbackground"><svg height="1em" viewBox="0 0 512 512">
                        <path fill="var(--fg-on-primary-weak)" d="M288 109.3V352c0 17.7-14.3 32-32 32s-32-14.3-32-32V109.3l-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352H192c0 35.3 28.7 64 64 64s64-28.7 64-64H448c35.3 0 64 28.7 64 64v32c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V416c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"></path>
                    </svg></label><input class="mod-file-input" type="file" accept="image/*" multiple id="addbackground"></div>
        </div>

        <div id="mod-bg-color" style="display:{{display_bg_color}}" class="mod-background-type-content">
            {{addSetting_backgroundcolor}}
        </div>

        <div id="mod-bg-live" style="display:{{display_bg_live}}" class="mod-background-type-content">
            <p>Een live, bewegende achtergrond die willekeurige kleuren genereert.</p>
            <div class="br"></div>
            <div tabindex="0" class="mod-button" id="mod-live-randomize">Kies een willekeurig effect</div>
        </div>

        <div class="br"></div>
        <div class="br"></div>
        {{addSetting_ui_transparency}}
        {{addSetting_ui_blur}}
    </div>

    <h3 class="category" data-category="themes" tabindex="0">Thema's</h3>
    <div id="category-themes">
        <div class="br"></div>
        <div id="theme-wrapper">{{theme_wrapper}}</div>
        <div class="br"></div>
    </div>

    <h3 class="category" data-category="layout" tabindex="0">Layout</h3>
    <div id="category-layout">
        <div id="layout-wrapper">
            {{layout_1}}
            {{layout_2}}
            {{layout_3}}
            {{layout_4}}
            {{layout_5}}
        </div>
    </div>

    <h3 class="category" data-category="menu" tabindex="0">Menu</h3>
    <div id="category-menu">
        {{menu_settings}}
    </div>

    <h3 class="category" data-category="general" tabindex="0">Algemeen</h3>
    <div id="category-general">
        {{nicknames}}
        <div class="br"></div>
        <div class="br"></div>
        <div class="br"></div>
        {{username_wrapper}}
        <div class="br"></div>
        <div class="br"></div>
        <div class="br"></div>
        {{font_settings}}
        <div class="br"></div>
        <div class="br"></div>
        {{profilepic_setting}}
        <div class="br"></div>
        <div class="br"></div>
        <div class="br"></div>
        {{grade_reveal_setting}}
        <div class="br"></div>
        <div class="br"></div>
        {{letterbeoordelingen_setting}}
    </div>

    <h3 class="category" data-category="extra" tabindex="0">Aanvullende opties</h3>
    <div id="category-extra">
        {{extra_settings}}
    </div>

    <h3 class="category" data-category="games" tabindex="0">Spellen</h3>
    <div id="category-games">
        <p>Speel minispellen om de stress van school even te vergeten.</p>
        <div tabindex="0" class="mod-button" id="mod-play-defender">Speel Grade Defender</div>
        <a href="/error#mod-play" class="mod-button" target="_blank">Speel Somtoday Platformer</a>
        <div class="br"></div>
    </div>

    {{browser_settings}}

    <h3 class="category" data-category="autologin" tabindex="0">Autologin</h3>
    <div id="category-autologin">
        <p>Vul de onderstaande tekstvelden in om automatisch in te loggen.</p>
        {{autologin_warning}}
        {{autologin_school}}
        <div class="br"></div>
        <div class="br"></div>
        {{autologin_name}}
        <div class="br"></div>
        <div class="br"></div>
        {{autologin_pass}}
    </div>

    <div class="br"></div>
    <p>{{somtoday_version}}</p>
    <p style="user-select:none;">Bedankt voor het gebruiken van <span id="somtoday-mod-version-easter-egg">{{platform}}</span>! {{updateinfo}}</p>
    {{export_import_buttons}}
    <p style="margin-top:-15px;"><b>Gemaakt door</b></p>
    <div id="mod-contributors">{{contributors_list}}</div>
</div>`;


        }
    }

       function closeSettings(element) {
        id('mod-setting-button').classList.remove('active');
        tryRemove(id('mod-setting-panel'));
        if (!n(tn('sl-account-modal', 0))) {
            if (!n(tn('sl-account-modal-header', 1)) && !n(tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0])) {
                tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0].dataset.originalText;
            }
            tn('sl-account-modal-header', 1).getElementsByClassName('title ng-star-inserted')[0].innerHTML = element.getElementsByTagName('span')[0].innerHTML;
            if (!n(tn('sl-account-modal', 0).getElementsByClassName('content')[0])) {
                if (!n(tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0])) {
                    if (!n(tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].children[0])) {
                        tn('sl-account-modal', 0).getElementsByClassName('content')[0].children[0].children[0].removeAttribute('inert');
                    }
                }
            }
        }
    }

       function removeSlideshowBackgrounds() {
        let i = 0;
        while (!n(get('background' + i))) {
            set('background' + i, '');
            i++;
        }
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }

       function saveSlideshowBackground(element, i) {
        set('background' + i, element.src);
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }

       async function save() {
        let reload = true;
        let nicknames = [];
               if (id('loginname').value != get('loginname') || id('loginpass').value != get('loginpass') || id('loginschool').value != get('loginschool')) {
            set('logincredentialsincorrect', '0');
        }
        for (const element of id('nickname-wrapper').children) {
            if (!n(element.getElementsByTagName('input')[1])) {
                               if (!n(element.getElementsByTagName('input')[0].value)) {
                    nicknames.push([element.getElementsByTagName('input')[0].value, element.getElementsByTagName('input')[2].value, element.getElementsByTagName('input')[1].value]);
                }
            }
        }
        set('nicknames', JSON.stringify(nicknames));
               filesProcessed = 0;
        for (const element of cn('mod-slider')) {
            set(element.getElementsByTagName('input')[0].dataset.property, element.getElementsByTagName('input')[0].value + element.getElementsByTagName('input')[0].dataset.unit);
        }
        if (!n(id('mod-font-file')) && id('mod-font-file').files[0]) {
            set('customfontname', id('mod-font-file').files[0].name);
            let reader = new FileReader();
            reader.readAsDataURL(id('mod-font-file').files[0]);
            reader.onload = function () {
                set('customfont', reader.result);
                setTimeout(function () {
                    execute([style]);
                }, 100);
            };
        }
        else if (!n(id('mod-font-select')) && id('mod-font-select').classList.contains('mod-modified')) {
            set('customfont', '');
            set('customfontname', '');
            set('fontname', id('mod-font-select').value);
        }
        for (const element of cn('mod-custom-setting')) {
            if (element.type == 'checkbox' && element.id.indexOf('bools') != -1) {
                set('bools', get('bools').replaceAt(parseInt(element.id.charAt(5) + element.id.charAt(6)), element.checked ? '1' : '0'));
            } else if (element.type == 'checkbox' || element.type == 'range' || element.type == 'text' || element.type == 'password' || element.type == 'number' || element.type == 'color') {
                set(element.id, element.value);
            } else if (element.type == 'file') {
                if (element.files.length != 0) {
                                       let size = element.dataset.size;
                    if (!n(size) && (element.files[0].type == 'image/png' || element.files[0].type == 'image/jpeg' || element.files[0].type == 'image/webp')) {
                        size = parseInt(size);
                        const canvas = document.createElement('canvas');
                        let ctx = canvas.getContext('2d');
                        let img = new Image;
                        canvas.height = size;
                        canvas.width = size;
                        img.onload = function () {
                            canvas.height = canvas.width * (img.height / img.width);
                            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                            const result = canvas.toDataURL('image/webp');
                            if (result.length > 100) {
                                set(element.id, result);
                                filesProcessed++;
                            }
                                                       else {
                                let reader = new FileReader();
                                reader.readAsDataURL(element.files[0]);
                                reader.onload = function () {
                                    set(element.id, reader.result);
                                    filesProcessed++;
                                };
                            }
                        };
                        img.src = URL.createObjectURL(element.files[0]);
                    }
                                       else {
                        let reader = new FileReader();
                        reader.readAsDataURL(element.files[0]);
                        reader.onload = function () {
                            if (element.id == 'background') {
                                set('isbackgroundvideo', element.files[0]['type'].indexOf('video') != -1);
                            }
                            set(element.id, reader.result);
                            filesProcessed++;
                        };
                    }
                }
                               else {
                    filesProcessed++;
                }
            }
        }
        if (id('mod-bg-image').style.display == 'block') {
            set('backgroundtype', 'image');
        }
        else if (id('mod-bg-slideshow').style.display == 'block') {
            modMessage('Bezig met opslaan', 'Je achtergrondafbeeldingen worden nu opgeslagen. Dit kan even duren.', null, null, null, null, true);
            set('backgroundtype', 'slideshow');
            if (id('mod-background-wrapper').classList.contains('mod-modified')) {
                await removeSlideshowBackgrounds();
                let i = 0;
                for (const element of id('mod-background-wrapper').getElementsByTagName('img')) {
                    await saveSlideshowBackground(element, i);
                    i++;
                }
                set('slides', i);
            }
        }
        else if (id('mod-bg-color').style.display == 'block') {
            set('backgroundtype', 'color');
        }
        else if (id('mod-bg-live').style.display == 'block') {
            set('backgroundtype', 'live');
        }
        const selectedtheme = cn('theme-selected', 0);
        if (!n(selectedtheme)) {
            if (id('primarycolor').classList.contains('mod-modified') == false) {
                set('primarycolor', '#' + selectedtheme.dataset.color);
            }
            if (id('secondarycolor').classList.contains('mod-modified') == false) {
                set('secondarycolor', '#' + selectedtheme.dataset.secondaryColor);
            }
            set('theme', selectedtheme.dataset.name);
            if (selectedtheme.id != 'Standaard') {
                toDataURL(selectedtheme.dataset.url, function (dataUrl) {
                    set('background', dataUrl);
                    set('backgroundtype', 'image');
                    filesProcessed++;
                });
            }
            else {
                set('background', '');
                set('backgroundtype', 'image');
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
                    set('background', dataUrl);
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
        for (const element of cn('mod-file-reset')) {
            if (element.classList.contains('mod-active')) {
                set(element.dataset.key, '');
            }
        }
        if (!n(id('grade-reveal-select'))) {
            const showOnlyForNewGrades = id('grade-reveal-select').children[0].classList.contains('active');
            const showAlways = id('grade-reveal-select').children[1].classList.contains('active');
            set('bools', get('bools').replaceAt(14, showOnlyForNewGrades ? '1' : (showAlways ? '2' : '0')));
        }
                      if (reload) {
            execute([saveReload]);
        }
        modMessage('Opgeslagen!', 'Al je instellingen zijn opgeslagen.', 'Doorgaan');
        id('mod-message-action1').addEventListener('click', closeModMessage);
    }

       function saveReload(loadAnyway = false) {
        if (loadAnyway || filesProcessed >= (cn('mod-file-input').length + 1)) {
                       execute([setBackground, style, pageUpdate, openSettings, browserSettings, profilePicture]);
                       tryRemove(id('mod-grades-graphs'));
            if (get('bools').charAt(BOOL_INDEX.SUBJECT_GRAPHS) == '1' && !n(tn('sl-vakresultaten', 0))) {
                tn('sl-vakresultaten', 0).insertAdjacentHTML('beforeend', '<div id="mod-grades-graphs"><h3>Mijn cijfers</h3><div><canvas id="mod-chart-1"></canvas></div><h3>Mijn gemiddelde</h3><div><canvas id="mod-chart-2"></canvas></div></div>');
                setTimeout(gradeGraphs, 500);
            }
            if (!n(tn('sl-modal', 0))) {
                tn('sl-modal', 0).style.zIndex = '100000';
            }
            if (get('layout') == 3) {
                tn('body', 0).style.cssText = '--safe-area-inset-right: ' + menuWidth + 'px !important';
            }
            else if (get('layout') == 2 || get('layout') == 5) {
                tn('body', 0).style.cssText = '--safe-area-inset-left: ' + menuWidth + 'px !important';
            }
        }
        else {
            setTimeout(saveReload, 100);
        }
    }

       function reset() {
        set('primarycolor', '#0067c2');
        set('secondarycolor', '#e69b22');
        set('nicknames', '[]');
        set('bools', '110001110111101111100000000000');
        set('title', '');
        set('icon', '');
        set('background', '');
        set('backgroundtype', 'image');
        set('backgroundcolor', darkmode ? '#20262d' : '#ffffff');
        set('ui', 0);
        set('uiblur', 0);
        set('fontname', 'Open Sans');
        set('theme', 'Standaard');
        set('layout', 1);
        set('profilepic', '');
        set('username', '');
        set('loginschool', '');
        set('loginname', '');
        set('loginpass', '');
        set('letterbeoordelingen', '');
        set('brightness', '100%');
        set('contrast', '100%');
        set('saturate', '100%');
        set('opacity', '100%');
        set('huerotate', '0deg');
        set('grayscale', '0%');
        set('sepia', '0%');
        set('invert', '0%');
        set('blur', '0px');
        set('menuwidth', 110);
        set('customfont', '');
        set('customfontname', '');
        menuWidth = 110;
        set('isbackgroundvideo', false);
        let i = 0;
        while (!n(get('background' + i))) {
            set('background' + i, '');
            i++;
        }
        if (!n(tn('sl-account-modal', 0))) {
            execute([openSettings, profilePicture]);
        }
    }

       function checkNewUser() {
        if (n(get('firstused'))) {
            set('birthday', '00-00-0000');
            set('lastjubileum', 0);
            execute([reset]);
            tn('head', 0).insertAdjacentHTML('afterbegin', '<style>#mod-welcome{background:#0005;position:fixed;top:0;left:0;width:100%;height:100%;z-index:1000;transition:opacity 0.3s ease;}#mod-welcome > div{width:355px;transform:translate(-50%, -50%);top:50%;position:absolute;left:50%;background: var(--bg-elevated-none);border-radius:16px;overflow:hidden;overflow-y:scroll;max-width:calc(100% - 30px);max-height:calc(100% - 30px);}#mod-welcome > div > div:first-child{background:#09f;height:130px;display:flex;justify-content:center;align-items:center}#mod-welcome svg{width:70px;height:35%;transition:transform .3s ease;cursor:pointer;}#mod-welcome > div > div:last-child{padding:15px 20px;}#mod-welcome h2{font-weight:400;}#mod-welcome input[type=checkbox]{width:20px;display:inline-block;height:20px;}#mod-welcome label{user-select:none;vertical-align:top;display:inline-block;padding-left:10px;margin-bottom:25px;font-size:14px;max-width:calc(100% - 35px);}div:hover > svg .glasses{animation:1s glasses linear forwards;}@keyframes glasses{0%{transform:translateY(-60px);opacity:0;}50%{transform:translateY(-30px);opacity:1;}100%{transform:translateY(0px);opacity:1;}}@media (min-width: 370px) and (min-height:700px){#mod-welcome > div{overflow-y:hidden;}#mod-welcome > div > div:first-child{height:200px;}#mod-welcome > div > div:last-child{padding:30px;}}</style>');
            const welcomecontent = platform == 'Android' ? '<h2>Welkom!</h2><p>Je hebt net de Somtoday Mod Android APK geïnstalleerd. Met deze app kun je alles wat je ook in de normale Somtoday app kan, plus nog veel meer doordat Somtoday Mod erbij zit.</p><p>Voordat je doorgaat, deze app is niet geaffilieerd met Somtoday. Gebruik is op eigen risico. Zorg ervoor dat je regelmatig op updates checkt om de app up to date te houden.</p>' : '<h2>Somtoday Mod is ge&iuml;nstalleerd!</h2><p>Stel achtergronden in, krijg inzicht in je cijfers en meer met Somtoday Mod!</p><p>' + (hasSettingsHash ? 'Laten we meteen beginnen!' : 'Meteen naar de instellingen gaan?') + '</p>';
            id('somtoday-mod').insertAdjacentHTML('afterbegin', '<div id="mod-welcome"><div><div>' + window.logo('mod-welcome-logo', null, '#fff') + '</div><div>' + welcomecontent + '<br><input type="checkbox" id="errordata"><label for="errordata">Verstuur error-data om bugs te fixen</label>' + (hasSettingsHash ? '' : '<div tabindex="0" class="mod-button" id="mod-welcome-open-settings">Instellingen</div>') + '<div tabindex="0" class="mod-button" id="mod-welcome-close">Sluiten</div></div></div></div>');
            function closeWelcomeDialog() {
                set('firstused', year + '-' + (month + 1) + '-' + dayInt);
                id('mod-welcome').style.opacity = '0';
                if (id('errordata').checked) {
                                       set('bools', get('bools').replaceAt(4, '1'));
                }
                setTimeout(function () {
                    tryRemove(id('mod-welcome'));
                }, 400);
            }
            if (!hasSettingsHash) {
                id('mod-welcome-open-settings').addEventListener('click', function () {
                    closeWelcomeDialog();
                    openModSettingsDirectly(true);
                });
            }
            id('mod-welcome-close').addEventListener('click', function () {
                closeWelcomeDialog();
                if (hasSettingsHash) {
                    execute([openSettings]);
                }
            });
            id('mod-welcome-logo').addEventListener('click', function () {
                this.style.transform = 'scale(1.3)';
                setTimeout(function () {
                    id('mod-welcome-logo').style.transform = 'scale(1)';
                }, 300);
            });
        }
    }

    function addSlider(name, property, min, max, unit, defaultValue) {
        let value = get(property);
        if (get(property) == null || get(property) == '' || isNaN(parseInt(get(property)))) {
            value = (defaultValue + unit);
        }
        return '<div class="mod-slider"><p>' + name + '</p><input id="' + property + '" title="' + name + '" data-property="' + property + '" data-unit="' + unit + '" type="range" min="' + min + '" max="' + max + '" step="' + (property == 'blur' ? 0.25 : 1) + '" value="' + value.match(/\d+(\.\d+)?/)[0] + '" /><p>' + value + '</p></div>';
    }

       function addSetting(name, description, key, type, value, param1, param2, param3, param4, param5, param6) {
        if (get(key) == null && !key.startsWith('bools')) {
            set(key, value);
        }
        let code = '<div><h3>' + name + '</h3>' + ((n(description) || type == 'checkbox') ? '' : '<p>' + description + '</p>');
        if (type == 'checkbox') {
            if (key.startsWith('bools')) {
                code += '<label tabindex="0" class="switch" for="' + key + '"><input title="' + name + '" class="mod-custom-setting" type="checkbox" ' + (get('bools').charAt(parseInt(key.charAt(5) + key.charAt(6))) == '1' ? 'checked' : '') + ' oninput="this.classList.add(\'mod-modified\');" id="' + key + '"/><div class="slider round"></div></label>';
            } else {
                code += '<label tabindex="0" class="switch" for="' + key + '"><input title="' + name + '" class="mod-custom-setting" type="checkbox" ' + (get(key) ? 'checked' : '') + ' oninput="this.classList.add(\'mod-modified\');" id="' + key + '"/><div class="slider round"></div></label>';
            }
            code += (n(description) ? '' : '<p>' + description + '</p>') + '</div>';
        } else if (type == 'range') {
            code += '<div class="mod-range-preview">' + getIcon(param5, null, 'var(--fg-on-primary-weak)', 'style="' + (param6 == 'opacity' ? 'opacity:' + parseFloat((100 - (param4 != null ? value : get(key))) / 100).toString() : 'filter:' + param6 + '(' + parseFloat((param4 != null ? value : get(key)) / 4).toString() + 'px)') + '"') + '</div><input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="range" value="' + (param4 != null ? value : get(key)) + '" min="' + param1 + '" max="' + param2 + '" step="' + param3 + '" oninput="this.classList.add(\'mod-modified\');this.parentElement.children[4].innerHTML=this.value;this.parentElement.getElementsByClassName(\'mod-range-preview\')[0].children[0].setAttribute(\'style\', \'' + (param6 == 'opacity' ? 'opacity:\'+parseFloat((100 - this.value) / 100).toString()+\'' : 'filter:' + param6 + '(\'+parseFloat(this.value / 4).toString()+\'px)') + '\');"/><p>' + (param4 != null ? value : get(key)) + '</p><p>%</p></div>';
        } else if (type == 'text' || type == 'password') {
            code += '<input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="' + type + '" placeholder="' + param1 + '" value="' + get(key).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') + '"/></div>';
        } else if (type == 'number') {
            code += '<div class="br"></div><input title="' + name + '" class="mod-custom-setting" id="' + key + '" type="number" placeholder="' + param1 + '" value="' + get(key) + '"/></div>';
        } else if (type == 'color') {
            code += '<div class="br"></div><div class="br"></div><label tabindex="0" class="mod-color" for="' + key + '" style="background: ' + (n(get(key)) ? value : get(key)) + '"><p>Kies een kleur</p></label><input class="mod-color-textinput" title="Voer een hex kleurencode in" value="' + get(key) + '" oninput="if (/^#?([a-fA-F0-9]{6})${"$"}/.test(this.value)) { this.parentElement.children[5].value = this.value; this.style.color = \'var(--fg-on-primary-weak)\'; this.parentElement.children[3].style.background = this.value; } else if (/^#?([a-fA-F0-9]{3})${"$"}/.test(this.value)) { const sixDigitCode = \'#\' + this.value.charAt(1) + this.value.charAt(1) + this.value.charAt(2) + this.value.charAt(2) + this.value.charAt(3) + this.value.charAt(3); this.parentElement.children[5].value = sixDigitCode; this.style.color = \'var(--fg-on-primary-weak)\'; this.parentElement.children[3].style.background = sixDigitCode; } else { this.style.color = \'darkred\'; }"/><input title="' + name + '" class="mod-custom-setting" value="' + get(key) + '" id="' + key + '" oninput="this.classList.add(\'mod-modified\');this.parentElement.children[3].style.background = this.value; this.parentElement.children[4].value = this.value; this.parentElement.children[4].style.color = \'var(--fg-on-primary-weak)\';" type="color"/></div>';
        } else if (type == 'file') {
            code += '<label tabindex="0" class="mod-file-label" for="' + key + '">' + getIcon('upload', null, 'var(--fg-on-primary-weak)') + '<p>Kies een bestand</p></label><input' + (n(param2) ? '' : ' title="' + name + '" data-size="' + param2 + '"') + ' oninput="this.parentElement.getElementsByTagName(\'label\')[0].classList.remove(\'mod-active\'); if (this.files.length != 0) { const name = this.files[0].name.toLowerCase(); if ((this.accept == \'image/*\' && this.files[0][\'type\'].indexOf(\'image\') != -1) || (this.accept == \'image/*, video/*\' && (this.files[0][\'type\'].indexOf(\'image\') != -1 || this.files[0][\'type\'].indexOf(\'video\') != -1)) || (this.accept != \'image/*, video/*\') && this.accept != \'image/*\') { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = name; this.parentElement.getElementsByTagName(\'label\')[0].classList.add(\'mod-active\'); this.parentElement.nextElementSibling.classList.remove(\'mod-active\'); this.parentElement.nextElementSibling.nextElementSibling.classList.remove(\'mod-active\'); } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; this.value = null; } } else { this.parentElement.getElementsByTagName(\'label\')[0].children[1].innerText = \'Kies een bestand\'; }" class="mod-file-input mod-custom-setting" type="file" accept="' + param1 + '" id="' + key + '"/></div><div tabindex="0" class="mod-button mod-file-reset" data-key="' + key + '">Reset</div>';
        }
        return code;
    }

       function addTheme(name, url, primaryColor, secondaryColor, transparency) {
               let smallimg = url;
        let bigimg = url;
        if (!isNaN(parseInt(url))) {
            smallimg = 'https://images.pexels.com/photos/' + url + '/pexels-photo-' + url + '.jpeg?auto=compress&cs=tinysrgb&w=250';
            bigimg = 'https://images.pexels.com/photos/' + url + '/pexels-photo-' + url + '.jpeg?auto=compress&cs=tinysrgb&w=1600';
        }
        let themeclass = '';
        if (get('theme') == name) {
            if (get('primarycolor') == '#' + primaryColor) {
                themeclass = ' theme-selected-set';
            } else {
                set('theme', '');
            }
        }
               if (url == '') {
            smallimg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        }
        id('theme-wrapper').insertAdjacentHTML('beforeend', '<div tabindex="0" class="theme' + themeclass + '" id="' + name + '" data-name="' + name + '" data-url="' + bigimg + '" data-color="' + primaryColor + '" data-secondary-color="' + secondaryColor + '" data-transparency="' + transparency + '"><img src="' + smallimg + '" alt="Achtergrondafbeelding: ' + name + '" loading="lazy"/><h3><div style="background:#' + primaryColor + ';" title="#' + primaryColor + '"></div>' + name + '</h3></div>');
        id(name).addEventListener('click', function () {
            for (const element of cn('theme')) {
                element.classList.remove('theme-selected-set');
                element.classList.remove('theme-selected');
            }
            id(name).classList.add('theme-selected');
        });
    }

       async function openModSettingsDirectly(forceOpen = false) {
        if (window.location.hash == '#mod-settings' || get('opensettingsIntention') == '1' || forceOpen) {
            if (tn('sl-modal', 0)) {
                return;
            }

            if (!forceOpen) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            tn('sl-header', 0).getElementsByTagName('div')[0].click();

            let i = 0, j = 0;
            while (n(cn('selector-option instellingen', 0))) {
                await new Promise(resolve => setTimeout(resolve, 100));
                               if (i > 20) {
                    i = 0;
                    j++;
                                       if (j > 3) {
                        set('opensettingsIntention', '0');
                        return;
                    }
                    tn('sl-header', 0).getElementsByTagName('div')[0].click();
                }
                i++;
            }

            cn('selector-option instellingen', 0).click();

            i = 0;
            while (n(id('mod-setting-button'))) {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (i > 20) {
                    set('opensettingsIntention', '0');
                    return;
                }
                i++;
            }

            id('mod-setting-button').click();
            set('opensettingsIntention', '0');
            history.replaceState('', document.title, window.location.pathname + window.location.search);
        }
    }

       function insertModSettingLink() {
        if (!n(tn('sl-account-modal', 0)) && !n(tn('sl-account-modal', 0).getElementsByTagName('sl-account-modal-tab')[0]) && n(id('mod-setting-button'))) {
            let modbtn = tn('sl-account-modal', 0).getElementsByTagName('sl-account-modal-tab')[tn('sl-account-modal', 0).getElementsByTagName('sl-account-modal-tab').length - 1].cloneNode(true);
            modbtn.id = 'mod-setting-button';
            modbtn.addEventListener('click', openSettings);
            modbtn.getElementsByTagName('span')[0].innerHTML = 'Mod-instellingen';
            modbtn.getElementsByTagName('i')[0].style.background = darkmode ? '#603d20' : '#ffefe3';
            modbtn.getElementsByTagName('i')[0].style.paddingBottom = '2px';
            modbtn.getElementsByTagName('i')[0].innerHTML = getIcon('gear', null, '#ea9418', 'style="width:16px;height:16px;"');
            tn('sl-account-modal', 0).getElementsByTagName('nav')[0].appendChild(modbtn);
            for (const element of tn('sl-account-modal-tab')) {
                if (element.id != 'mod-setting-button') {
                    element.addEventListener('click', function () { closeSettings(element) });
                }
            }
            setTimeout(function () {
                               if (!n(cn('data-container', 1)) && !n(cn('data-container', 1).getElementsByClassName('ng-star-inserted')[0]) && n(get('realname'))) {
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
               else if (!n(id('mod-setting-button'))) {
            id('mod-setting-button').getElementsByTagName('i')[0].style.background = darkmode ? '#603d20' : '#ffefe3';
        }
    }



       function pageUpdate(updateStyle = true, updateLogo = true) {
        if (busy || isRecapping) {
            return;
        }
        darkmode = tn('html', 0).classList.contains('dark') || tn('html', 0).classList.contains('night');
        busy = true;
        execute([gradeReveal, userName, teacherNicknames, insertModSettingLink, insertGradeDownloadButton, subjectGradesPage, somtodayRecap, rosterSimplify, newYearCountdown, topMenu, easterEggs, editGrades, browserSettings, initTheme]);
        if (updateStyle) {
            execute([updateCssVariables]);
        }
        if (updateLogo) {
            execute([modLogo]);
        }
               setTimeout(function () {
            busy = false;
        }, 1);
    }

       function addMutationObserver() {
               const pageobserver = new MutationObserver(() => {
            if (!busy) {
                setTimeout(function () { execute([pageUpdate]); }, 5);
            }
        });
        pageobserver.observe(tn('html', 0), {
            attributes: false,
            subtree: true,
            childList: true
        });
        const darkModeObserver = new MutationObserver(() => {
            setTimeout(function () { execute([updateCssVariables]); }, 5);
        });
        darkModeObserver.observe(tn('html', 0), {
            attributes: true,
            subtree: false,
            childList: false
        });
        window.addEventListener('click', function () { pageUpdate(false, true) });
    }





   
       function checkUpdate() {
        fetch('https://jonazwetsloot.nl/somtoday-mod-update-checker?v=' + version).then(function (response) {
            if (response.ok) {
                return response.text();
            }
            return Promise.reject(response);
        }).then(text => {
            if (text == 'Newest') {
                modMessage('Geen updates gevonden', 'Helaas, er zijn geen updates gevonden.', 'Oke');
                id('mod-message-action1').addEventListener('click', closeModMessage);
            } else if (text == 'Optional') {
                modMessage('Kleine update gevonden', 'Er is een kleine update gevonden. Wil je de update installeren?', 'Ja', 'Nee');
                if (platform == 'Userscript') {
                    id('mod-message-action1').addEventListener('click', function () { window.open('https://jonazwetsloot.nl/userscripts/SomtodayMod' + (minified ? '' : 'Unminified') + '.user.js'); });
                }
                else {
                    id('mod-message-action1').addEventListener('click', function () { window.open('https://jonazwetsloot.nl/versions/somtoday-mod'); });
                }
                id('mod-message-action2').addEventListener('click', closeModMessage);
            } else if (text == 'Update') {
                modMessage('Update gevonden', 'Er is een update gevonden. Wil je de update installeren?', 'Ja', 'Nee');
                if (platform == 'Userscript') {
                    id('mod-message-action1').addEventListener('click', function () { window.open('https://jonazwetsloot.nl/userscripts/SomtodayMod' + (minified ? '' : 'Unminified') + '.user.js'); });
                }
                else {
                    id('mod-message-action1').addEventListener('click', function () { window.open('https://jonazwetsloot.nl/versions/somtoday-mod'); });
                }
                id('mod-message-action2').addEventListener('click', closeModMessage);
            }
            else {
                modMessage('Fout', 'Somtoday Mod kan de reactie van de server niet begrijpen.', 'Oke');
                id('mod-message-action1').addEventListener('click', closeModMessage);
            }
        }).catch((response) => {
            modMessage('Fout', 'Er kon niet op updates worden gechecked. Het kan zijn dat de server van Somtoday Mod down is of dat je wifi uitstaat.', 'Oke');
            id('mod-message-action1').addEventListener('click', closeModMessage);
        });
    }

       function toDataURL(url, callback) {
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {
            let reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

       execute([updateCheck, checkNewUser, setBackground, updateCssVariables, style, addMutationObserver, browserSettings, congratulations, openModSettingsDirectly, profilePicture, initTheme, consoleMessage]);

       setTimeout(function () {
        tryRemove(id('transitions-disabled'));
    }, 400);
}
})()""")
        }

        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
            isPageError = false
        }

        override fun onReceivedError(view: WebView?, errorCode: Int, description: String?, failingUrl: String?) {
            isPageError = true
            tryLoadAgain(view, 500)
        }

        fun tryLoadAgain(view: WebView?, delay: Long) {
            Thread.sleep(delay)
            view?.loadUrl("https://leerling.somtoday.nl/")
        }

        override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
            if (url == null || view == null) {
                return false
            }
            if (view.url?.startsWith("https://leerling.somtoday.nl") == true && !url.startsWith("https://leerling.somtoday.nl") && !url.startsWith("https://inloggen.somtoday.nl")) {
                // If user is at leerling website and clicks on an external link, open browser
                val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                browserIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                ContextCompat.startActivity(appContext, browserIntent, null)
                return true
            }
            // Stay in webview
            return false
        }
    }

    companion object {
        lateinit  var appContext: Context
    }
}