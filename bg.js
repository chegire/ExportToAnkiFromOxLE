chrome.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.
  var context = "selection"
  var title = "Find in oxle";
  var id = chrome.contextMenus.create({
    "id": "sendToOxle",
    "title": title,
    "contexts": [context],
  });
  chrome.contextMenus.onClicked.addListener(function(info, tab) { debugger;
    if (info.menuItemId != 'sendToOxle')
      return;
    
    window.open("popup.html?" + info.selectionText, "extension_popup", "width=570,height=480,scrollbars=yes,resizable=no");
  })
});


