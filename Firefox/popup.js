// MANAGE ENABLE CHECKBOX IN POPUP
document.getElementById('tag').innerHTML=chrome.i18n.getMessage("checkboxTag");
chrome.storage.local.get(["enabled"]).then(e=>{
    document.getElementById("checkbox").checked=e.enabled
}),
document.getElementById("checkbox").addEventListener("input",function(){
    var e=document.getElementById("checkbox").checked;
    chrome.storage.local.set({enabled:e})
});