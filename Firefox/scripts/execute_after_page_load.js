// EXECUTE MOD AFTER PAGE LOAD
// This script is executed after the page is loaded
async function autoLogin() {
    if (n(get('loginschool')) || get('logincredentialsincorrect') == '1') {
        return;
    }

    // Wait until school input field is loaded
    const schoolField = await waitForElement('#organisatieSearchField, #organisatieInput');

    if (!n(cn('feedbackPanelERROR', 0))) {
        set('logincredentialsincorrect', '1');
        return;
    } else if (!schoolField) {
        return;
    }

    // Fill in the school name
    if (!n(id('organisatieSearchField'))) {
        id('organisatieSearchField').value = get('loginschool');
        // Always use this school
        if (!n(cn('form--checkbox checkbox-label', 0)) && cn('form--checkbox checkbox-label', 0).ariaChecked == 'false') {
            cn('form--checkbox checkbox-label', 0).click();
        }
    }

    if (n(get('loginname'))) {
        return;
    }

    // Wait for event to be added to next button
    await new Promise(resolve => setTimeout(resolve, 100));

    // Proceed to next step
    if (cn('button--stpanel primary-button', 0)) {
        cn('button--stpanel primary-button', 0).click();
    }

    // Wait until username input field is loaded
    const usernameField = await waitForElement('#usernameField');

    if (cn('feedbackPanelERROR', 0)) {
        set('logincredentialsincorrect', '1');
        return;
    } else if (!usernameField) {
        return;
    }

    // Fill in the username (and password if set)
    id('usernameField').value = get('loginname');

    if (id('password-field')) {
        // If password is not set but password field is present, DO NOT click the login button!
        if (n(get('loginpass'))) {
            console.log('pass is null');
            return;
        }
        id('password-field').value = get('loginpass');
    }
    // Remember username
    if (cn('form--checkbox checkbox-label', 0) && cn('form--checkbox checkbox-label', 0).ariaChecked == 'false') {
        cn('form--checkbox checkbox-label', 0).click();
    }

    // Wait until submit button event is added
    const submitButton = await waitForElement('.button--stpanel.primary-button');
    if (!submitButton) {
        return;
    }
    await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for event listeners

    // Login
    cn('button--stpanel primary-button', 0).click();

    // Check if credentials were correct
    // We can't really wait for this easily without blocking, so we'll check once after a delay or let the page reload handle it.
    // The original code looped to check.
    setTimeout(() => {
        if (cn('feedbackPanelERROR', 0)) {
            set('logincredentialsincorrect', '1');
        }
    }, 1000);
}

async function waitForPageLoad() {
    while ((storageMethod == 'extension' || storageMethod == 'indexedDB') && data == null) {
        await new Promise(resolve => setTimeout(resolve, 25));
    }

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
        if (get('bools') == null || get('bools').charAt(BOOL_INDEX.REDIRECT_ELO) == '1') {
            window.location.replace('https://inloggen.somtoday.nl');
        }
        return;
    }

    // Wait for Somtoday to load
    const loadedElement = await waitForElement('sl-home > *:nth-child(2), sl-error, .errorTekst, iframe[src="https://som.today/updaten/"]');

    if (loadedElement) {
        if (loadedElement.tagName === 'IFRAME') {
            return;
        }
        execute([onload]);
    }
}

execute([waitForPageLoad]);