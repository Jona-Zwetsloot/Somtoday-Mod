package com.jonazwetsloot.somtodaymod

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.ViewGroup
import android.widget.FrameLayout
import android.webkit.WebView
import androidx.activity.addCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import org.mozilla.geckoview.*
import androidx.core.net.toUri
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File

class MainActivity : AppCompatActivity() {
    private lateinit var geckoView: GeckoView
    private lateinit var geckoSession: GeckoSession
    private lateinit var overlayWebView: WebView
    private var canGoBackState: Boolean = false

    companion object {
        lateinit var appContext: Context
        private var sRuntime: GeckoRuntime? = null
    }

    private val themeFile = "theme.txt"

    private var pendingFilePrompt: GeckoSession.PromptDelegate.FilePrompt? = null
    private var pendingFileResult: GeckoResult<GeckoSession.PromptDelegate.PromptResponse>? = null
    private val fileChooserRequestCode = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        appContext = applicationContext
        WindowCompat.setDecorFitsSystemWindows(window, false)

        val root = FrameLayout(this)
        setContentView(root)

        geckoView = GeckoView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }
        root.addView(geckoView)

        overlayWebView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }
        root.addView(overlayWebView)

        val isDarkMode = (resources.configuration.uiMode and
                android.content.res.Configuration.UI_MODE_NIGHT_MASK) ==
                android.content.res.Configuration.UI_MODE_NIGHT_YES
        var skeletonFile = if (isDarkMode) "dark" else "light"

        val cacheFile = File(filesDir, themeFile)
        if (cacheFile.exists()) {
            skeletonFile = cacheFile.readText()
        }
        overlayWebView.loadUrl("file:///android_asset/somtoday-skeleton/skeleton-$skeletonFile.html")


        if (sRuntime == null) {
            sRuntime = GeckoRuntime.create(this)
        }
        geckoSession = GeckoSession()

        var currentUrl: String? = null

        geckoSession.navigationDelegate = object : GeckoSession.NavigationDelegate {
            override fun onCanGoBack(session: GeckoSession, canGoBack: Boolean) {
                canGoBackState = canGoBack
            }

            override fun onLocationChange(
                session: GeckoSession,
                url: String?,
                permissions: MutableList<GeckoSession.PermissionDelegate.ContentPermission>,
                hasUserGesture: Boolean
            ) {
                currentUrl = url
            }

            override fun onLoadRequest(session: GeckoSession, request: GeckoSession.NavigationDelegate.LoadRequest): GeckoResult<AllowOrDeny> {
                val url = request.uri

                if (currentUrl?.startsWith("https://leerling.somtoday.nl") ?: false) {
                    if (!url.startsWith("https://leerling.somtoday.nl") &&
                        !url.startsWith("https://inloggen.somtoday.nl")) {

                        val browserIntent = Intent(Intent.ACTION_VIEW, url.toUri())
                        browserIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        appContext.startActivity(browserIntent)

                        return GeckoResult.fromValue(AllowOrDeny.DENY)
                    }
                }
                return GeckoResult.fromValue(AllowOrDeny.ALLOW)
            }
        }

        fun removeWebview() {
            lifecycleScope.launch {
                delay(500L) // 2 seconds
                root.removeView(overlayWebView)
                overlayWebView.destroy()
            }
        }

        geckoSession.progressDelegate = object : GeckoSession.ProgressDelegate {
            override fun onPageStop(session: GeckoSession, success: Boolean) {
                val url = currentUrl ?: ""

                if (url.contains("somtoday", true) ||
                    url.contains("som.today", true)) {

                    removeWebview()
                }
            }
        }

        geckoSession.promptDelegate = promptDelegate
        geckoSession.open(sRuntime!!)
        geckoView.setSession(geckoSession)

        val extId = "somtodaymod@jonazwetsloot.nl"
        val webExtController = sRuntime!!.webExtensionController

        val messageDelegate = object : WebExtension.MessageDelegate {
            override fun onMessage(nativeApp: String, message: Any, sender: WebExtension.MessageSender): GeckoResult<Any>? {
                if (message is org.json.JSONObject) {
                    val type = message.optString("type")
                    if (type == "SAVE_THEME") {
                        val theme = message.optString("theme")
                        saveTheme(theme)
                    }
                }
                return null
            }
        }

        webExtController.ensureBuiltIn("resource://android/assets/extension/", extId)
            .accept { extension ->
                runOnUiThread {
                    if (extension != null) {
                        extension.setMessageDelegate(messageDelegate, "somtodaymod")
                        geckoSession.webExtensionController.setMessageDelegate(extension, messageDelegate, "somtodaymod")

                        geckoSession.loadUri("https://leerling.somtoday.nl/")
                    }
                }
            }

        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }
        root.requestApplyInsets()

        onBackPressedDispatcher.addCallback(this) {
            if (canGoBackState) geckoSession.goBack()
            else {
                isEnabled = false
                onBackPressedDispatcher.onBackPressed()
                isEnabled = true
            }
        }
    }

    private fun saveTheme(theme: String) {
        try {
            File(filesDir, themeFile).writeText(theme)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private val promptDelegate = object : GeckoSession.PromptDelegate {
        override fun onFilePrompt(
            session: GeckoSession,
            prompt: GeckoSession.PromptDelegate.FilePrompt
        ): GeckoResult<GeckoSession.PromptDelegate.PromptResponse>? {

            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "*/*"
                if (prompt.mimeTypes?.isNotEmpty() == true) {
                    putExtra(Intent.EXTRA_MIME_TYPES, prompt.mimeTypes)
                }
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, prompt.type == GeckoSession.PromptDelegate.FilePrompt.Type.MULTIPLE)
            }

            startActivityForResult(Intent.createChooser(intent, "Select file"), fileChooserRequestCode)

            pendingFilePrompt = prompt
            val result = GeckoResult<GeckoSession.PromptDelegate.PromptResponse>()
            pendingFileResult = result

            return result
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == fileChooserRequestCode) {
            val prompt = pendingFilePrompt ?: return
            val resultFuture = pendingFileResult ?: return

            pendingFilePrompt = null
            pendingFileResult = null

            if (resultCode == Activity.RESULT_OK && data != null) {
                val uris = mutableListOf<Uri>()
                data.data?.let { uris.add(it) }
                data.clipData?.let { clip ->
                    for (i in 0 until clip.itemCount) {
                        uris.add(clip.getItemAt(i).uri)
                    }
                }

                val response = prompt.confirm(this, uris.toTypedArray())
                resultFuture.complete(response)
            } else {
                val response = prompt.dismiss()
                resultFuture.complete(response)
            }
        }
    }
}