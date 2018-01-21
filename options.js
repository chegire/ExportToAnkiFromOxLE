// Saves options to chrome.storage.sync.
function save_options() {
    var definitionsCheckbox = document.getElementById('definitionsCheckbox').checked;
    var examplesCheckbox = document.getElementById('examplesCheckbox').checked;
    var windowWidth = document.getElementById('windowWidth').value;
    var windowHeight = document.getElementById('windowHeight').value;
    chrome.storage.sync.set({
        definitionsCheckbox: definitionsCheckbox,
        examplesCheckbox: examplesCheckbox,
        windowWidth: windowWidth,
        windowHeight: windowHeight
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get({
        definitionsCheckbox: 0,
        examplesCheckbox: 0,
        windowWidth: 1024,
        windowHeight: 768
    }, function (items) {
        document.getElementById('definitionsCheckbox').checked = items.definitionsCheckbox;
        document.getElementById('examplesCheckbox').checked = items.examplesCheckbox;
        document.getElementById('windowWidth').value = items.windowWidth;
        document.getElementById('windowHeight').value = items.windowHeight;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);


