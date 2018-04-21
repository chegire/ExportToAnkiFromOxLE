chrome.runtime.onInstalled.addListener(function () {
    // Create one test item for each context type.
    var context = "selection"
    var title = "Find in oxle";
    var id = chrome.contextMenus.create({
        "id": "sendToOxle",
        "title": title,
        "contexts": [context],
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId != 'sendToOxle')
        return;

    openPopup(info.selectionText);
});

function openPopup(query) {
    chrome.storage.sync.get({
        definitionsCheckbox: 0,
        examplesCheckbox: 0,
        windowWidth: 1024,
        windowHeight: 768
    }, function (items) {
        window.open(
            "popup.html?" + query, "extension_popup", "width=" + items.windowWidth +
            ",height=" + items.windowHeight + ",scrollbars=yes,resizable=no"
        );
    });
}

chrome.browserAction.onClicked.addListener(() => openPopup(''));