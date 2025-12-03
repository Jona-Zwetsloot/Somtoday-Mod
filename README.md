# Somtoday Mod (Beta)

**⚠️ Warning: This is a beta version and is still buggy! Use with caution.**  

Somtoday Mod is a free browser extension that adjusts the student website of Somtoday. With this beta version, you can **customize your Somtoday** by setting your own backgrounds, colors, fonts, layouts, and more. It also adds extra functionality, like graphs on the grades pages and an auto-login function. At the end of the year, you can view a recap of your grades with a fun quiz. Want to change your teachers' names? That's possible too, alongside many other options.  

This beta is currently available for **Chromium browsers** only, but Firefox and userscript versions are coming soon. Somtoday Mod is **not affiliated with Somtoday/Topicus**.  

[![Button Chrome]][ChromeLink]
[![Button Edge]][EdgeLink]
[![Button Firefox]][FirefoxLink]

<br>

# Install

You can install the beta version of Somtoday Mod in the extension stores (see links above) or on Android by installing the APK file found on the [releases tab](https://github.com/Jona-Zwetsloot/Somtoday-Mod/releases). You can also modify the beta and install it manually using the methods below.

<details>
<summary>Userscript</summary>
<br>

Userscript:
1. Install a userscript manager (<a href="https://tampermonkey.net/">Tampermonkey</a> - all browsers, <a href="https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/">Greasemonkey</a> - Firefox, <a href="https://apps.apple.com/us/app/userscripts/id1463298887">Userscripts</a> - Safari)
2. Add <a href="https://github.com/Jona-Zwetsloot/Somtoday-Mod/blob/main/Userscript/SomtodayMod.user.js">this userscript</a> to the userscript manager
<br>

</details>

<details>
<summary>Chromium extension</summary>
<br>

Chromium extension (beta):
1. Go to the <a href="https://github.com/Jona-Zwetsloot/Somtoday-Mod/releases">releases page</a> and download `chromium.zip`
2. Unpack `chromium.zip`
3. Go to the extension page and enable developer mode
4. Click 'Load unpacked extension' and select the unpacked folder
<br>

</details>

<details>
<summary>Firefox extension</summary>
<br>

Firefox extension - <b>temporary and unsigned</b>:
1. Go to the <a href="https://github.com/Jona-Zwetsloot/Somtoday-Mod/releases">releases page</a> and download `firefox.zip`
2. Go to <b>about:debugging#/runtime/this-firefox</b>, click 'Install temporary addon' and select `firefox.zip`
<br>

Firefox Developer/Nightly/ESR - <b>unsigned</b>:
1. Download `firefox.zip` from the <a href="https://github.com/Jona-Zwetsloot/Somtoday-Mod/releases">releases page</a>
2. Disable <b>xpinstall.signatures.required</b> in <b>about:config</b>
3. Go to <b>about:addons</b>, click the cog, then 'Install addon via file' and select `firefox.zip`
<br>

Firefox extension - <b>signed</b>:
1. Download `firefox.zip` from the <a href="https://github.com/Jona-Zwetsloot/Somtoday-Mod/releases">releases page</a>
2. Submit it via <a href="https://addons.mozilla.org/developers/">Mozilla addon developer page</a>
<br>

</details>

<details>
<summary>Android</summary>
<br>

Android app (beta):
1. Create a new **Android Studio Project** (choose *Empty Activity* template)
2. Drop the contents of the Android folder of this repo into **/app/src/main**
3. Things may crash, so **you may need to modify some things** to make it work
<br>

</details>

<br>

# Contributing

You can always edit the code for yourself. If you fix a bug or add functionality, please submit a pull request and **be clear about what your changes do**.

<!---------------------------------------------------------------------------->
[Button Chrome]: https://jonazwetsloot.nl/images/chrome-webstore.svg
[ChromeLink]: https://chromewebstore.google.com/detail/somtoday-mod/gehilkhfalphnhpidceocgmdijplpkbn 'Install in the Chrome Webstore.'
[Button Edge]: https://jonazwetsloot.nl/images/edge-addons.svg
[EdgeLink]: https://microsoftedge.microsoft.com/addons/detail/somtoday-mod/ldhlddmnhkkjnocncckkencgcmgmffme 'Install in the Edge Addons Store.'
[Button Firefox]: https://jonazwetsloot.nl/images/firefox-addons.svg
[FirefoxLink]: https://addons.mozilla.org/nl/firefox/addon/somtoday-mod/ 'Install in the Firefox Addons Store.'
