// MANAGE ENABLE CHECKBOX IN POPUP
let somtodayEnabled;

// Initialize state
document.getElementById('icon-checked').style.display = 'none';
document.getElementById('confirmation').style.display = 'none';
chrome.storage.local.get(['enabled']).then((result) => {
    somtodayEnabled = result['enabled'];
    updateCheckbox();
});

// Initialize text
document.getElementById('txt-enable-disable').innerHTML = chrome.i18n.getMessage('enableDisable');
document.getElementById('txt-to-somtoday').innerHTML = chrome.i18n.getMessage('toSomtoday');
document.getElementById('txt-reset-all').innerHTML = chrome.i18n.getMessage('resetAll');
document.getElementById('txt-confirm').innerHTML = chrome.i18n.getMessage('confirmReset');
document.getElementById('yes').innerHTML = '<p>' + chrome.i18n.getMessage('yes') + '</p>';
document.getElementById('no').innerHTML = '<p>' + chrome.i18n.getMessage('no') + '</p>';

// Show reset save data confirmation
document.getElementById('reset-all').addEventListener('click', function() {
    document.getElementById('settings').style.display = 'none';
    document.getElementById('confirmation').removeAttribute('style');
});

// Confirm save data reset
document.getElementById('yes').addEventListener('click', function() {
    chrome.storage.local.clear();
    chrome.storage.local.set({ enabled: true });
    somtodayEnabled = true;
    updateCheckbox();
    document.getElementById('settings').removeAttribute('style');
    document.getElementById('confirmation').style.display = 'none';
});

// Cancel save data reset
document.getElementById('no').addEventListener('click', function() {
    document.getElementById('settings').removeAttribute('style');
    document.getElementById('confirmation').style.display = 'none';
});

// Toggle extension disabled/enabled
document.getElementById('enable-disable').addEventListener('click', function() {
    somtodayEnabled = !somtodayEnabled;
    updateCheckbox();
    chrome.storage.local.set({enabled:somtodayEnabled});
});

// Update checkbox state
function updateCheckbox() {
    chrome.action.setBadgeText({text: somtodayEnabled ? 'on' : 'off'});
    document.getElementById('icon-checked').style.display = somtodayEnabled ? 'inline-block' : 'none';
    document.getElementById('icon-unchecked').style.display = somtodayEnabled ? 'none' : 'inline-block';
}