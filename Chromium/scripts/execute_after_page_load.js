// EXECUTE MOD AFTER PAGE LOAD
// This script is executed after the page is loaded
async function autoLogin() {
    if (n(get('loginschool')) || get('logincredentialsincorrect') == '1') {
        return;
    }

    // Wait until school input field is loaded
    for (let i = 0; true; i++) {
        if (!n(cn('feedbackPanelERROR', 0))) {
            set('logincredentialsincorrect', '1');
            return;
        }
        else if (!n(id('organisatieSearchField')) || !n(id('organisatieInput'))) {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Fill in the school name
    if (!n(id('organisatieSearchField'))) {
        id('organisatieSearchField').value = get('loginschool');
        // Always use this school
        if (!n(cn('form--checkbox checkbox-label', 0))) {
            cn('form--checkbox checkbox-label', 0).click();
        }
    }

    if (n(get('loginname'))) {
        return;
    }

    // Wait for event to be added to next button
    await new Promise(resolve => setTimeout(resolve, 100));

    // Proceed to next step
    if (!n(cn('button--stpanel primary-button', 0))) {
        cn('button--stpanel primary-button', 0).click();
    }

    // Wait until username input field is loaded
    for (let i = 0; true; i++) {
        if (!n(cn('feedbackPanelERROR', 0))) {
            set('logincredentialsincorrect', '1');
            return;
        }
        else if (!n(id('usernameField'))) {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Fill in the username (and password if set)
    id('usernameField').value = get('loginname');

    if (!n(id('passwordField'))) {
        // If password is not set but password field is present, DO NOT click the login button!
        if (n(get('loginpass'))) {
            return;
        }
        id('passwordField').value = get('loginpass');
    }
    // Remember username
    if (!n(cn('form--checkbox checkbox-label', 0))) {
        cn('form--checkbox checkbox-label', 0).click();
    }

    // Wait until submit button event is added
    for (let i = 0; true; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        if (!n(cn('button--stpanel primary-button', 0))) {
            break;
        }
    }

    // Login
    cn('button--stpanel primary-button', 0).click();

    // Check if credentials were correct
    for (let i = 0; true; i++) {
        if (!n(cn('feedbackPanelERROR', 0))) {
            set('logincredentialsincorrect', '1');
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

const isExtension = window.platform != 'Userscript' && window.platform != 'Android';
async function waitForPageLoad() {
    while (true) {
        const saveDataLoaded = !isExtension || data != null;
        const somtodayLoaded = !n(tn('sl-home', 0)) && !n(tn('sl-home', 0).children[1]);
        const errorPageLoaded = !n(tn('sl-error', 0)) || !n(cn('errorTekst', 0));

        if (saveDataLoaded) {
            // Remember to open settings if settings hash is present
            if (hasSettingsHash) {
                set('opensettingsIntention', '1');
            }
            // If user has disabled Somtoday Mod, return
            if (isExtension && !data.enabled) {
                return;
            }
            // Autologin user if enabled
            else if (window.location.origin.indexOf('inloggen') != -1) {
                execute([autoLogin]);
                return;
            }
            // Redirect user to login page if enabled
            else if (window.location.origin.indexOf('som.today') != -1) {
                if (get('bools') == null || get('bools').charAt(9) == '1') {
                    window.location.replace('https://inloggen.somtoday.nl');
                }
                return;
            }
            // Load Somtoday Mod main script
            else if (somtodayLoaded || errorPageLoaded) {
                execute([onload]);
                return;
            }
            // If Somtoday is updating and therefore unavailable, return
            else if (!n(tn('iframe', 0)) && tn('iframe', 0).src == 'https://som.today/updaten/') {
                return;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 25));
    }
}

execute([waitForPageLoad]);