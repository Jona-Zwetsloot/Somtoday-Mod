// SERVICE WORKER
chrome.runtime.onInstalled.addListener(({reason:e})=>{e==chrome.runtime.OnInstalledReason.INSTALL?(chrome.runtime.openOptionsPage(),chrome.storage.local.set({enabled:!0})):e==chrome.runtime.OnInstalledReason.UPDATE&&chrome.runtime.openOptionsPage()}),chrome.action.onClicked.addListener(()=>{chrome.runtime.openOptionsPage()}),chrome.runtime.setUninstallURL("https://jonazwetsloot.nl/somtoday-mod-bye");