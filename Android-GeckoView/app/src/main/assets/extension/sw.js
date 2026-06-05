// SERVICE WORKER
chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason == chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.runtime.openOptionsPage();
        chrome.storage.local.set({ enabled: true });
    }
});
chrome.runtime.setUninstallURL("https://jonazwetsloot.nl/somtoday-mod-bye");