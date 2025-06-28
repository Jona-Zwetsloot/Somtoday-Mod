# Somtoday Mod
Somtoday Mod is a free browser-extension which adjusts the student website of Somtoday. With Somtoday Mod you can customise your Somtoday by setting your own backgrounds, colors, fonts, layouts and more. It also improves the functionality of Somtoday, by adding graphs to the grades pages and offering an auto-login function. At the end of the year you can view a recap of your grades with a fun quiz. And do you want to change the names of your teacher? This is also possible with Somtoday Mod, alongside many other options. Somtoday Mod is available in the Chrome Webstore, Edge Addons and Firefox Add-ons as extension. It is also available as userscript. Somtoday Mod is not affiliated with Somtoday/Topicus.

[![Button Chrome]][ChromeLink]
[![Button Edge]][EdgeLink]
[![Button Firefox]][FirefoxLink]

<br>

# Install

You can install the official release of Somtoday Mod in the extension stores (see links above). You can also modify Somtoday Mod and install it by using one of the methods below.

<details>
<summary>Userscript</summary>
<br>

Userscript:
1. Install an userscriptmanager (<a href="https://tampermonkey.net/">Tampermonkey</a> - all browsers, <a href="https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/">Greasemonkey</a> - Firefox, <a href="https://apps.apple.com/us/app/userscripts/id1463298887">Userscripts</a> - Safari)
2. Add <a href="https://github.com/Jona-Zwetsloot/Somtoday-Mod/blob/main/Userscript/SomtodayMod.user.js">this userscript</a> to the userscript manager
<br>

</details>



<details>
<summary>Chromium extension</summary>
<br>

Chromium extension:
1. Go to the <a href="https://github.com/Jona-Zwetsloot/Somtoday-Mod/releases">releases page</a> and download chromium.zip
2. Unpack chromium.zip
3. Go to the extension page and enable developer mode
4. Click 'Load unpacked extension' and select the unpacked zip
<br>

</details>



<details>
<summary>Firefox extension</summary>
<br>

Firefox extension - <b>temporary and unsigned</b>, but easy:
1. Go to the <a href="https://github.com/Jona-Zwetsloot/Somtoday-Mod/releases">releases page</a> and download firefox.zip
2. Go to <b>about:debugging#/runtime/this-firefox</b>, click 'Install temporary addon' and select firefox.zip
<br>

Firefox Developer, Firefox Nightly or Firefox ESR extension - <b>unsigned</b>, but easy:
1. Go to the <a href="https://github.com/Jona-Zwetsloot/Somtoday-Mod/releases">releases page</a> and download firefox.zip
2. Go to <b>about:config</b> and disable the flag <b>xpinstall.signatures.required</b>
3. Go to <b>about:addons</b>, click on the top right cog, click 'Install addon via file' and select firefox.zip
<br>

Firefox extension - <b>signed</b>, but difficult:
1. Go to the <a href="https://github.com/Jona-Zwetsloot/Somtoday-Mod/releases">releases page</a> and download firefox.zip
2. Go to <a href="https://addons.mozilla.org/developers/">the Mozilla addon developer page</a>, click 'Submit or manage extension', and sign in with your Mozilla account
3. Click 'Create a new addon'. Follow the process to get your extension signed. Consider hosting the addon yourself to prevent too much Somtoday Mod clones in the Firefox Add-ons store.
<br>

</details>



<details>
<summary>Android</summary>
<br>

Android app:
1. Create a new **Android Studio Project** (choose the *Empty activity* template)
2. Drop the contents of the Android folder of this repo in the **/app/src/main** folder of your Android Studio Project
3. Things will probably crash, so **you may need to modify some things** to make it work
<br>

</details>

<br>

# Contributing
You can always edit the code for yourself. If you fixed a bug (or added some kind of functionality) you can submit a pull request. Please be clear about what your code changes/adds.

<!---------------------------------------------------------------------------->
[Button Chrome]: https://jonazwetsloot.nl/images/chrome-webstore.svg
[ChromeLink]: https://chromewebstore.google.com/detail/somtoday-mod/gehilkhfalphnhpidceocgmdijplpkbn 'Install in the Chrome Webstore.'
[Button Edge]: https://jonazwetsloot.nl/images/edge-addons.svg
[EdgeLink]: https://microsoftedge.microsoft.com/addons/detail/somtoday-mod/ldhlddmnhkkjnocncckkencgcmgmffme 'Install in the Edge Addons Store.'
[Button Firefox]: https://jonazwetsloot.nl/images/firefox-addons.svg
[FirefoxLink]: https://addons.mozilla.org/nl/firefox/addon/somtoday-mod/ 'Install in the Firefox Addons Store.'
