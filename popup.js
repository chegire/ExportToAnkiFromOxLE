$(document).ready(function () {
    function getOxfordPage(query) {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('error', () => reject('failed to connect'));
        xhr.addEventListener('load', () => {
            try {
                const response = xhr.responseText;
                renderPage(response);
            } catch (e) {
                console.log(e);
            }
        });

        xhr.open('GET', 'https://www.oxfordlearnersdictionaries.com/search/english/?q=' + query);
        xhr.send();
    }


    settings = chrome.storage.sync.get({
        definitionsCheckbox: 0,
        examplesCheckbox: 0,
        windowWidth: 1024,
        windowHeight: 768
    }, function (items) {
        window.extSettings = items;
        var query = window.location.search.substr(1);
        getOxfordPage(query);
    });
        

    function renderPage(oxfordPage) {
        $(document.body).html(oxfordPage);
        $(window.document.body).append('<div id="ankiOuterBox"></div>');
        window.ankiBox = new AnkiBox({ $elem: $('#ankiOuterBox'), $page: $(oxfordPage) });
    }
});