// MANAGE ENABLE CHECKBOX IN POPUP
let somtodayEnabled;
chrome.storage.local.get(["enabled"]).then((result) => {
    somtodayEnabled = result['enabled'];
    updateCheckbox();
});
document.getElementById('reset-all').addEventListener('click', function() { if (confirm("Wil je echt alle opslagdata wissen?")) { chrome.storage.local.clear(); chrome.storage.local.set({ enabled: true }); somtodayEnabled = true; updateCheckbox(); } });
document.getElementById('enable-disable').addEventListener('click', function() { somtodayEnabled = !somtodayEnabled; updateCheckbox(); });
function updateCheckbox() {
    document.getElementById('icon-checked').style.display = somtodayEnabled ? 'inline-block' : 'none';
    document.getElementById('icon-unchecked').style.display = somtodayEnabled ? 'none' : 'inline-block';
    chrome.storage.local.set({enabled:somtodayEnabled})
}
document.getElementById('txt-enable-disable').innerHTML = chrome.i18n.getMessage("enableDisable");
document.getElementById('txt-to-somtoday').innerHTML = chrome.i18n.getMessage("toSomtoday");
document.getElementById('txt-reset-all').innerHTML = chrome.i18n.getMessage("resetAll");