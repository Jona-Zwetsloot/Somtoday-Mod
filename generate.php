<?php

// Generate builds
// This a small script to generate the builds efficiently, while also updating the source code

// Composer autoloading, used for JS minification later
require __DIR__ . '/vendor/autoload.php';

// Apply some very basic styling
echo '<style>
    * {
        font-family: sans-serif;
    }
    div {
        padding: 10px 20px;
    }
    a {
        display: inline-block;
        padding: 10px 20px;
        margin-right: 10px;
        background: #eee;
        color: #333;
        text-decoration: none;
    }
    a:hover {
        background: #bbb;
    }
</style>';

// Prompt user with choice to generate builds from either Chromium or Firefox
if (empty($_GET['source']) || !is_string($_GET['source']) || ($_GET['source'] != 'Chromium' && $_GET['source'] != 'Firefox')) {
    echo '<div>';
    echo '<h3>Which folder should be used for generating source?</h3>';
    echo '<p>Warning: this will overwrite all files except those in the chosen folder.</p>';
    echo '<a href="generate?source=Chromium">Chromium</a>';
    echo '<a href="generate?source=Firefox">Firefox</a>';
    echo '</div>';
    exit;
}

// Generate Android/userscript versions
// For these platforms, everything must be in one file because of some limitations
// Also, we don't have the chrome.runtime.getURL function, so we need to hardcode the contents of some URLs
$res = '';
$res_android = '';
$userscript = '';
$userscript_min = '';
$android = '';

$version_info = json_decode(file_get_contents("{$_GET['source']}/version_info.json", true), true);

$save_management = file_get_contents("{$_GET['source']}/scripts/save_version_management.js", true);
$res .= preg_replace("/\/\/ \[GENERATION\] START_IGNORE[\s\S]+?\/\/ \[GENERATION\] END_IGNORE\n?\n?/", "", $save_management);

$shorthand_functions = file_get_contents("{$_GET['source']}/scripts/shorthand_functions.js", true);
$res .= "\n\n\n" . $shorthand_functions;

$colors = file_get_contents("{$_GET['source']}/scripts/colors.js", true);
$image = file_get_contents("{$_GET['source']}/images/dark-mode.svg", true);
$image = preg_replace("/\s{2,}/", ' ', preg_replace("/\n+/", '', $image));
$image = preg_replace("/\"/", "%22", preg_replace("/'/", "%27", rawurlencode($image)));
$image = "data:image/svg+xml,$image";
$res .= "\n\n\n" . str_replace("// [GENERATION] SET_DARK_IMAGE", "darkImage.src = '$image';", $colors);

$minigame = file_get_contents("{$_GET['source']}/scripts/minigame.js", true);
$res .= "\n\n\n" . $minigame;

$execute_after_page_load = file_get_contents("{$_GET['source']}/scripts/execute_after_page_load.js", true);
$res .= "\n\n\n" . $execute_after_page_load;

$familiar = file_get_contents("{$_GET['source']}/settings_content/familiar.html", true);
$chart = file_get_contents("{$_GET['source']}/scripts/chart.js", true);
$fireworks = file_get_contents("{$_GET['source']}/scripts/fireworks.js", true);

$styles = file_get_contents("{$_GET['source']}/css/styles.css", true);
$styles .= file_get_contents("{$_GET['source']}/css/night.css", true);
$styles = str_replace("'", "\\'", str_replace("\n", "", $styles));

while (str_contains($styles, "  ")) {
    $styles = str_replace("  ", " ", $styles);
}

$main_functions = file_get_contents("{$_GET['source']}/scripts/main_functions.js", true);
$main_functions = str_replace("// [GENERATION] HARDCODED_SETTINGS", "

return `$familiar`;

", $main_functions);
$main_functions = str_replace("// [GENERATION] INSERT_CHARTJS", $chart, $main_functions);
$main_functions = str_replace("// [GENERATION] INSERT_FIREWORKSJS", $fireworks, $main_functions);
$main_functions = str_replace("// [GENERATION] APPLY_STYLES", "tn('head', 0).insertAdjacentHTML('beforeend', '<style class=\"mod-style\">$styles</style>');", $main_functions);

$res .= "\n\n\n" . $main_functions;

$userscript .= "// ==UserScript==
// @name         Somtoday Mod
// @namespace    https://jonazwetsloot.nl/projecten/somtoday-mod
// @version      {$version_info['version']}
// @description  Give Somtoday a new look with this script.
// @author       Jona Zwetsloot
// @match        https://*.somtoday.nl/*
// @match        https://som.today/*
// @icon         https://jonazwetsloot.nl/images/SomtodayModIcon.png
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==

// SOMTODAY MOD
// Somtoday Mod (c) 2023-2024 by Jona Zwetsloot is licensed under CC BY-NC-SA 4.0
// This means you are free to edit and share this code if you attribute the creator.
// You also have to use the same license and you are not allowed to use this software for commercial purposes.

// NOTICE: THIS FILE IS GENERATED. Any changes you make will be overwritten when you update the userscript.
// If you want to contribute, download the browser extension as .zip from the following Github repository.
// https://github.com/Jona-Zwetsloot/Somtoday-Mod


const version = {$version_info['version']};
const platform = 'Userscript';
const minified = false;
const version_name = '{$version_info['version']}-release';

" . $res;

$min = \JShrink\Minifier::minify("const version = {$version_info['version']}; const platform = 'Userscript'; const minified = true; const version_name = '{$version_info['version']}-release'; $res");
$userscript_min .= "// ==UserScript==
// @name         Somtoday Mod
// @namespace    https://jonazwetsloot.nl/projecten/somtoday-mod
// @version      {$version_info['version']}
// @description  Give Somtoday a new look with this script.
// @author       Jona Zwetsloot
// @match        https://*.somtoday.nl/*
// @match        https://som.today/*
// @icon         https://jonazwetsloot.nl/images/SomtodayModIcon.png
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==

// SOMTODAY MOD MINIFIED
// Somtoday Mod (c) 2023-2024 by Jona Zwetsloot is licensed under CC BY-NC-SA 4.0
// This means you are free to edit and share this code if you attribute the creator.
// You also have to use the same license and you are not allowed to use this software for commercial purposes.

// NOTICE: THIS FILE IS GENERATED. Any changes you make will be overwritten when you update the userscript.
// If you want to contribute, download the browser extension as .zip from the following Github repository.
// https://github.com/Jona-Zwetsloot/Somtoday-Mod


" . $min;

// For Android, we're loading everything with a Javascript URI into a WebView
// This means that the source must be perfect regarding semicolons and must not contain any comments
$res_android = preg_replace("/\/\/ \[GENERATION\] ANDROID_START_IGNORE[\s\S]+?\/\/ \[GENERATION\] ANDROID_END_IGNORE\n?\n?/", "", $res);

// Repeat comment deletion a few times, since otherwise a few will slip through because of the terrible regex I wrote
for ($i = 0; $i < 4; $i++) {
    $res_android = preg_replace("/ \/\/(.*)\n/", "", $res_android);
    $res_android = preg_replace("/\n\/\/(.*)\n/", "", $res_android);
    $res_android = preg_replace("/ ?\/\*[\s\S]+?\*\//", "", $res_android);
    $res_android = preg_replace("/\A\/\/(.*)\n/", "", $res_android);
}

// Replace $, since it is a special character in Kotlin used for variables, just like in PHP but worse
$res_android = str_replace('$', '${"$"}', $res_android);
$android .= "package com.jonazwetsloot.somtodaymod

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
        window.statusBarColor = resources.getColor(R.color.black)
        val nightModeFlags: Int = this.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
        if (nightModeFlags == Configuration.UI_MODE_NIGHT_YES) {
            myWebView!!.setBackgroundColor(resources.getColor(R.color.black))
        }
        myWebView!!.settings.javaScriptEnabled = true
        myWebView!!.webViewClient = MyWebViewClient()
        myWebView!!.getSettings().setDomStorageEnabled(true)
        myWebView!!.getSettings().setLoadWithOverviewMode(true)
        myWebView!!.getSettings().setAllowFileAccess(true)
        setContentView(myWebView)
        myWebView!!.loadUrl(\"https://leerling.somtoday.nl/\")
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
                openFileChooser(uploadMsg, \"\")
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
                        \"FolderName\"
                    )
                    if (!imageStorageDir.exists()) {
                        imageStorageDir.mkdirs()
                    }
                    val file = File(
                        imageStorageDir.toString() + File.separator + \"IMG_\" + System.currentTimeMillis()
                            .toString() + \".jpg\"
                    )
                    mCapturedImageURI = Uri.fromFile(file)

                    val captureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                    captureIntent.putExtra(MediaStore.EXTRA_OUTPUT, mCapturedImageURI)

                    val i = Intent(Intent.ACTION_GET_CONTENT)
                    i.addCategory(Intent.CATEGORY_OPENABLE)
                    i.setType(\"image/*\")
                    i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                    val chooserIntent = Intent.createChooser(i, \"Kies een bestand\")
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
            view.loadUrl(\"\"\"javascript:(function loadEverything() {
const version = {$version_info['version']};
const platform = 'Android';
const minified = false;
const version_name = '{$version_info['version']}-release';

$res_android
})()\"\"\")
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
            view?.loadUrl(\"https://leerling.somtoday.nl/\")
        }

        override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
            if (url == null || view == null) {
                return false
            }
            if (view.url?.startsWith(\"https://leerling.somtoday.nl\") == true && !url.startsWith(\"https://leerling.somtoday.nl\") && !url.startsWith(\"https://inloggen.somtoday.nl\")) {
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
}";

// Save Android/userscript versions
file_put_contents('Userscript/SomtodayMod.user.js', $userscript);
file_put_contents('Userscript/SomtodayMod-min.user.js', $userscript_min);
file_put_contents('Android/app/src/main/java/com/jonazwetsloot/somtodaymod/MainActivity.kt', $android);

// Generate manifests
$manifest_chromium = file_get_contents("Chromium/manifest.json", true);
$manifest_chromium = preg_replace("/\"version\": \"(\d+\.\d+)\",/", "\"version\": \"{$version_info['version']}\",", $manifest_chromium);
$manifest_firefox = file_get_contents("Firefox/manifest.json", true);
$manifest_firefox = preg_replace("/\"version\": \"(\d+\.\d+)\",/", "\"version\": \"{$version_info['version']}\",", $manifest_firefox);

function deleteDirectoryContents(string $dir): void
{
    if (!is_dir($dir)) {
        return;
    }

    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }
        $path = $dir . DIRECTORY_SEPARATOR . $item;
        if (is_dir($path)) {
            deleteDirectoryContents($path);
            rmdir($path);
        } else {
            unlink($path);
        }
    }
}

function copyDirectory(string $src, string $dst): void
{
    if (!is_dir($src)) {
        throw new InvalidArgumentException("Source directory does not exist: $src");
    }

    if (!is_dir($dst)) {
        mkdir($dst, 0777, true);
    }

    $items = scandir($src);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }
        $srcPath = $src . DIRECTORY_SEPARATOR . $item;
        $dstPath = $dst . DIRECTORY_SEPARATOR . $item;

        if (is_dir($srcPath)) {
            copyDirectory($srcPath, $dstPath);
        } else {
            if (!copy($srcPath, $dstPath)) {
                throw new RuntimeException("Failed to copy file: $srcPath");
            }
        }
    }
}

$source = __DIR__ . "/{$_GET['source']}";
$target = __DIR__ . "/" . ($_GET['source'] == 'Firefox' ? 'Chromium' : 'Firefox');
deleteDirectoryContents($target);
copyDirectory($source, $target);

if ($_GET['source']) {
    $version_info['platform'] = ($_GET['source'] == 'Firefox' ? 'Chromium' : 'Firefox');
    file_put_contents($target . "/version_info.json", json_encode($version_info, JSON_PRETTY_PRINT));
}

// Save manifests
file_put_contents('Chromium/manifest.json', $manifest_chromium);
file_put_contents('Firefox/manifest.json', $manifest_firefox);

// Increment Android version number
$build_gradle_kts = file_get_contents("Android/app/build.gradle.kts", true);
preg_match("/versionCode = (\d+)/", $build_gradle_kts, $match);
$num = ((int)$match[1]) + 1;
$build_gradle_kts = preg_replace("/versionCode = \d+/", "versionCode = $num", $build_gradle_kts);
$build_gradle_kts = preg_replace("/versionName = \"[^\"]+\"/", "versionName = \"{$version_info['version']}\"", $build_gradle_kts);
file_put_contents("Android/app/build.gradle.kts", $build_gradle_kts);

function zipFolder($source, $destination)
{
    if (!extension_loaded('zip')) {
        throw new Exception("PHP Zip extension is not enabled.");
    }

    if (!file_exists($source) || !is_dir($source)) {
        throw new Exception("Source folder does not exist or is not a directory.");
    }

    $zip = new ZipArchive();
    if ($zip->open($destination, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        throw new Exception("Cannot create zip file at: $destination");
    }

    $source = realpath($source);

    // Recursive directory iterator
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($source, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($files as $file) {
        $filePath = realpath($file);
        $relativePath = substr($filePath, strlen($source) + 1);

        if (is_dir($filePath)) {
            $zip->addEmptyDir($relativePath);
        } elseif (is_file($filePath)) {
            $zip->addFile($filePath, $relativePath);
        }
    }

    return $zip->close();
}

zipFolder(__DIR__ . '/chromium', __DIR__ . '/chromium.zip');
zipFolder(__DIR__ . '/firefox', __DIR__ . '/firefox.zip');

// Output success message;
echo '<div>';
echo '<h3>Done.</h3>';
echo '<p>Source code across versions is updated and builds have been generated.</p>';
echo '<a href="generate">Back</a>';
echo '</div>';
exit;
