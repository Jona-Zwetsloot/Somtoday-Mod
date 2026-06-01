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

class Generate
{
    public static string $result = '';
    public static function build()
    {
        Generate::appendScripts();
        Generate::insertCSS();
        Generate::saveSingleScriptPlatforms();
        Generate::createExtensionBuilds();
        Generate::incrementAndroidVersion();
    }

    // Get extension manifest
    private static array $manifest;
    public static function getManifest(): array
    {
        if (empty(Generate::$manifest)) {
            $content = file_get_contents("{$_GET['source']}/manifest.json", true);
            Generate::$manifest = json_decode($content, true);
        }
        return Generate::$manifest;
    }

    // Get version info
    private static array $versionInfo;
    public static function getVersionInfo(): array
    {
        if (empty(Generate::$versionInfo)) {
            $content = file_get_contents("{$_GET['source']}/version_info.json", true);
            Generate::$versionInfo = json_decode($content, true);
        }
        return Generate::$versionInfo;
    }


    // Append all Javascript content scripts to the result
    public static function appendScripts(): void
    {
        $scripts = Generate::getManifest()['content_scripts']['js'];
        foreach ($scripts as $script) {
            Generate::$result .= file_get_contents("{$_GET['source']}/$script", true);
        }
    }

    // Prepare CSS for insertion in single quoted JS literal, like 'p { font-family: \'Kanit\'; }'
    public static function prepareCSS(string $input): string
    {
        $output = preg_replace('/\R/u', '', $input);
        $output = str_replace("'", "\\'", $output);
        while (str_contains($output, "  ")) {
            $output = str_replace("  ", " ", $output);
        }
        return $output;
    }

    // Insert the CSS inside the JS
    public static function insertCSS(): void
    {
        $css = '';
        $styles = Generate::getManifest()['content_scripts']['css'];
        foreach ($styles as $style) {
            $css .= file_get_contents("{$_GET['source']}/$style", true);
        }
        $css = Generate::prepareCSS($css);
        Generate::$result = str_replace("// [GENERATION] APPLY_STYLES", "tn('head', 0).insertAdjacentHTML('beforeend', '<style class=\"mod-style\">$css</style>');", Generate::$result);
    }

    // Get base64 data URI of a resource (image/font)
    public static function getBase64DataUri(string $file): string
    {
        if (!file_exists($file)) {
            throw new RuntimeException("File not found: $file");
        }

        $mimeType = mime_content_type($file);
        $data = base64_encode(file_get_contents($file, true));

        return "data:{$mimeType};base64,{$data}";
    }

    // Get all files inside a directory as base64 URI
    public static function recursiveGetFiles(string $path): array
    {
        if (!file_exists($path)) return [];

        if (is_dir($path)) {
            $result = [];
            $files = scandir(__DIR__ . "/{$_GET['source']}/$path");
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;

                $result = array_merge($result, Generate::recursiveGetFiles("$path/$file"));
            }
        } else {
            $result[$path] = Generate::getBase64DataUri(__DIR__ . "{$_GET['source']}/$path");
        }
        return $result;
    }

    private static array $files;
    public static function getFiles(): array
    {
        if (empty(Generate::$files)) {
            Generate::$files = [];
            $resources = Generate::getManifest()['resources'];
            foreach ($resources as $resource) {
                Generate::$files = array_merge(Generate::$files, Generate::recursiveGetFiles(str_replace('/*', '', $resource)));
            }
        }
        return Generate::$files;
    }

    public static function getUserscriptMetaData(bool $minified): string
    {
        $title = $minified ? 'SOMTODAY MOD MINIFIED' : 'SOMTODAY MOD';
        $version = Generate::getVersionInfo()['version'];

        $hosts = Generate::getManifest()['host_permissions'];
        $matches = '';
        foreach ($hosts as $host) {
            $matches .= "
// @match        $host";
        }

        return "// ==UserScript==
// @name         Somtoday Mod
// @namespace    https://jonazwetsloot.nl/projecten/somtoday-mod
// @version      $version
// @description  Give Somtoday a new look with this script.
// @author       Jona Zwetsloot
$matches
// @icon         https://jonazwetsloot.nl/images/SomtodayModIcon.png
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==

// $title
// Somtoday Mod (c) 2023-" . date("Y") . " by Jona Zwetsloot is licensed under CC BY-NC-SA 4.0
// This means you are free to edit and share this code if you attribute the creator.
// You also have to use the same license and you are not allowed to use this software for commercial purposes.

// NOTICE: THIS FILE IS GENERATED. Any changes you make will be overwritten when you update the userscript.
// If you want to contribute, download the browser extension as .zip from the following Github repository.
// https://github.com/Jona-Zwetsloot/Somtoday-Mod



";
    }

    public static function getAndroidWebviewKotlin(string $minified): string
    {
        $minified = str_replace('$', '${"$"}', $minified);
        return "package com.jonazwetsloot.somtodaymod

import android.content.Context
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.os.Parcelable
import android.provider.MediaStore
import android.view.View
import android.view.ViewGroup
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.RelativeLayout
import androidx.activity.ComponentActivity
import androidx.activity.addCallback
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import java.io.File


class MainActivity : ComponentActivity() {
    private val fileChooserResultCode = 1
    private var mUploadMessage: ValueCallback<Uri>? = null
    private var mUploadMessages: ValueCallback<Array<Uri>>? = null
    private var mCapturedImageURI: Uri? = null
    private lateinit var webView: WebView
    private lateinit var errorLayout: View
    var progressBar : ProgressBar? = null
    var isProgressBarShown : Boolean = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        WindowCompat.setDecorFitsSystemWindows(window, false)
        webView = WebView(this)
        val root = FrameLayout(this)
        appContext = applicationContext

        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            settings.userAgentString = \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36\"
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.loadWithOverviewMode = true
            settings.allowFileAccess = true
            setBackgroundColor(Color.TRANSPARENT)
            webViewClient = MyWebViewClient()
            webChromeClient = object : WebChromeClient() {
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

        if (webView.parent != null) {
            (webView.parent as ViewGroup).removeView(webView)
        }
        root.addView(webView)

        errorLayout = createErrorLayout()
        errorLayout.visibility = View.GONE
        root.addView(errorLayout)

        setContentView(root)

        onBackPressedDispatcher.addCallback(this, true) {
            if (webView.canGoBack()) {
                webView.goBack()
            } else {
                isEnabled = false
                onBackPressedDispatcher.onBackPressed()
            }
        }

        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())

            v.setPadding(
                bars.left,
                bars.top,
                bars.right,
                bars.bottom
            )

            WindowInsetsCompat.CONSUMED
        }

        root.requestApplyInsets()

        webView.loadUrl(\"https://leerling.somtoday.nl/\")
    }

    private fun createErrorLayout(): View {
        val layout = RelativeLayout(appContext)
        val progressBar =
            ProgressBar(appContext, null, android.R.attr.progressBarStyleLarge)
        progressBar.isIndeterminate = true
        progressBar.visibility = View.VISIBLE
        progressBar.setProgressTintList(ColorStateList.valueOf(Color.RED))
        val params = RelativeLayout.LayoutParams(100, 100)
        params.addRule(RelativeLayout.CENTER_IN_PARENT)
        layout.addView(progressBar, params)
        return layout
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

    public override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    public override fun onRestoreInstanceState(savedBundle: Bundle) {
        super.onRestoreInstanceState(savedBundle)
        webView.restoreState(savedBundle)
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
                webView.visibility = View.GONE
                errorLayout.visibility = View.VISIBLE
            } else {
                errorLayout.visibility = View.GONE
                webView.visibility = View.VISIBLE
            }
            view.loadUrl(\"\"\"javascript:(function loadEverything() {
$minified
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
}
";
    }

    public static function insertFileMap(string $platform, bool $minified): string
    {
        $files = Generate::getFiles();

        $versionInfo = Generate::getVersionInfo();
        $versionInfo['platform'] = $platform;
        $versionInfo['minified'] = $minified;

        $files['version_info.json'] = json_encode($versionInfo);
        $result = str_replace("// [GENERATION] DEFINE_FILEMAP", 'fileMap = ' . json_encode($files) . ';', Generate::$result);

        if ($minified) {
            return \JShrink\Minifier::minify($result);
        } else {
            return $result;
        }
    }

    // Generate Android/Userscript builds
    public static function saveSingleScriptPlatforms()
    {
        // For these platforms, everything must be in one file because of some limitations

        $userscript = Generate::getUserscriptMetaData(minified: false) . Generate::insertFileMap(
            platform: 'Userscript',
            minified: false,
        );
        file_put_contents('Userscript/SomtodayMod.user.js', $userscript);

        $userscriptMinified = Generate::getUserscriptMetaData(minified: true) . Generate::insertFileMap(
            platform: 'Userscript',
            minified: true,
        );
        file_put_contents('Userscript/SomtodayMod-min.user.js', $userscriptMinified);

        $android = Generate::getAndroidWebviewKotlin(Generate::insertFileMap(
            platform: 'Android',
            minified: true,
        ));
        file_put_contents('Android/app/src/main/java/com/jonazwetsloot/somtodaymod/MainActivity.kt', $android);
    }

    public static function deleteDirectoryContents(string $dir): void
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
                Generate::deleteDirectoryContents($path);
                rmdir($path);
            } else {
                unlink($path);
            }
        }
    }

    public static function copyDirectory(string $src, string $dst): void
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
                Generate::copyDirectory($srcPath, $dstPath);
            } else {
                if (!copy($srcPath, $dstPath)) {
                    throw new RuntimeException("Failed to copy file: $srcPath");
                }
            }
        }
    }

    public static function zipFolder(string $source, string $destination): bool
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

    public static function createExtensionBuilds()
    {
        $source = __DIR__ . "/{$_GET['source']}";
        $target = __DIR__ . "/" . ($_GET['source'] == 'Firefox' ? 'Chromium' : 'Firefox');
        Generate::deleteDirectoryContents($target);
        Generate::copyDirectory($source, $target);

        Generate::getVersionInfo()['platform'] = ($_GET['source'] == 'Firefox' ? 'Chromium' : 'Firefox');
        file_put_contents($target . "/version_info.json", json_encode(Generate::getVersionInfo(), JSON_PRETTY_PRINT));

        $manifest = Generate::getManifest();
        $manifest['version'] = (string)Generate::getVersionInfo()['version'];
        unset($manifest['background']);
        unset($manifest['minimum_chrome_version']);
        unset($manifest['browser_specific_settings']);

        $firefox = $manifest;
        $firefox['background'] = [
            "scripts" => [
                "sw.js",
            ],
            "type" => "module",
        ];
        $firefox['browser_specific_settings'] = [
            "gecko" => [
                "id" => "somtodaymod@jonazwetsloot.nl",
                "strict_min_version" => "109.0",
            ]
        ];
        file_put_contents('Firefox/manifest.json', json_encode($firefox));

        $chromium = $manifest;
        $chromium['background'] = [
            "service_worker" => "sw.js",
        ];
        $chromium['minimum_chrome_version'] = 120;
        file_put_contents('Chromium/manifest.json', json_encode($chromium));

        Generate::zipFolder(__DIR__ . '/chromium', __DIR__ . '/chromium.zip');
        Generate::zipFolder(__DIR__ . '/firefox', __DIR__ . '/firefox.zip');
    }

    // Increment app version number on Android
    public static function incrementAndroidVersion()
    {
        $build_gradle_kts = file_get_contents("Android/app/build.gradle.kts", true);
        $build_gradle_kts = preg_replace("/versionCode = \d+/", "versionCode = " . (str_replace('.', '', Generate::getVersionInfo()['version'])), $build_gradle_kts);
        $build_gradle_kts = preg_replace("/versionName = \"[^\"]+\"/", "versionName = \"{Generate::getVersionInfo()['version']}\"", $build_gradle_kts);
        file_put_contents("Android/app/build.gradle.kts", $build_gradle_kts);
    }
}

Generate::build();

// Output success message
echo '<div>';
echo '<h3>Done.</h3>';
echo '<p>Source code across versions is updated and builds have been generated.</p>';
echo '<p>Please remember to manually update ' . ($_GET['source'] == 'Firefox' ? 'Chromium' : 'Firefox') . '/manifest.json if you changed ' . $_GET['source'] . '/manifest.json</p>';
echo '<a href="generate">Back</a>';
echo '</div>';
exit;
