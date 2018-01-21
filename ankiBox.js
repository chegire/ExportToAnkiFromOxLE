function AnkiBox(options) {
    var self = this;
    this.$elem = options.$elem;
    this.$page = options.$page;
    parsePage();
    initTemplates();
    render();

    function parsePage() {
        var $page = self.$page;
        var phonetics = $page.find('.top-g > .pron-gs .phon').toArray().map(function (item) { return $(item).text().split('//').join('/'); }).join(' ');
        var defSelector = $page.find('.sn-gs li').length > 0 ? '.sn-gs li' : '.sn-gs';
        var meanings = $page.find(defSelector).has('.def').toArray().map(function (item) {
            return {
                definition: $(item).find('.def').text(),
                examples: $(item).find('.x').toArray().map(function (item) { 
                    return {
                        text: $(item).text(),
                        checked: window.extSettings.examplesCheckbox
                    }
                }),
                checked: window.extSettings.definitionsCheckbox
            };
        });
        var question = $page.find('.webtop-g > .h').text();
        self.data = {
            phonetics: phonetics,
            meanings: meanings,
            question: question
        };
    }

    function initTemplates() {
        self.templates = {
            answerRenderTemplate: 
                '<span class="ankiBox-phonetics"><%-phonetics%></span>\
                <ul>\
                <% meanings.forEach(function(meaning, index) { %>\
                    <li>\
                        <input class="ankiBox-parentCheckBox" type="checkbox" <% if (meaning.checked) { %>checked<% } %> data-index="<%-index%>">\
                        <span class="ankiBox-definition"><%-meaning.definition%></span>\
                        <ul class="my-examples <% if (!meaning.checked) { %>ankiBox-hidden<% } %>">\
                        <% meaning.examples.forEach(function(example, index) { %>\
                            <li><i class="my-example"><input type="checkbox" <% if (example.checked) { %>checked<% } %> data-index="<%-index%>"><%-example.text%></i></li>\
                        <% }); %>\
                        </ul>\
                    </li>\
                <% }); %>\
                </ul>',
            answerSaveTemplate:
                '<b><%-phonetics%></b><br>\
				<% meanings.forEach(function(meaning) { %>\
                    <u><%-meaning.definition%></u><br>\
                    <% meaning.examples.forEach(function(example) { %>\
                        <i class="my-example"><%-example.text%></i><br>\
                    <% }); %>\
                    <br>\
				<% }); %>',
            ankiTemplate:
                '<button class="btn ankiBox-hide-btn">v</button>\
                <div class="ankiBox">\
                    Question:&nbsp;\
                    <button class="btn ankiBox-copyAnkiQuestion">&nbsp;Copy&nbsp;</button>\
                    <button class="btn ankiBox-sendToAnki" >&nbsp;Send to Anki&nbsp;</button>\
                    <div>\
                        <input class="ankiBox-question" type="text"\
                            value="<%-question%>">\
                        </input>\
                        <button class="btn ankiBox-search">&nbsp;Search&nbsp;</button>\
                    </div>\
                    <br>\
                    Answer:&nbsp;\
                    <button class="btn ankiBox-copyAnkiAnswer">&nbsp;Copy HTML&nbsp;</button>\
                    <button class="btn ankiBox-selectAll">&nbsp;Select all&nbsp;</button>\
                    <button class="btn ankiBox-deselectAll">&nbsp;Deselect all&nbsp;</button>\
                    <div class="ankiBox-answer">\
                        <%=answer%>\
                    </div>\
                </div>'
        }
    }

    function render() {
        self.answerHTML = _.template(self.templates.answerRenderTemplate)({
            phonetics: self.data.phonetics,
            meanings: self.data.meanings
        });
        self.ankiHTML = _.template(self.templates.ankiTemplate)({
            question: self.data.question,
            answer: self.answerHTML
        });
        self.$elem.html(self.ankiHTML);
        initEventListeners();
    }  

    function initEventListeners() {
        self.$elem.find('.ankiBox-copyAnkiAnswer').click(function (event) {
            copyTextToClipboard(self.getAnswerHTML());
        });
        self.$elem.find('.ankiBox-copyAnkiQuestion').click(function (event) {
            copyTextToClipboard(self.data.question);
        });
        self.$elem.find('.ankiBox-hide-btn').click(function (event) {
            $('.ankiBox').toggleClass('ankiBox-hidden');
        });
        self.$elem.find('.ankiBox-sendToAnki').click(function (event) {
            sendToAnki(self.data.question, self.getAnswerHTML());
        });
        self.$elem.find('.ankiBox-search').click(function (event) {
            searchNewWord(self.$elem.find('.ankiBox-question').val());
        });
        self.$elem.find('[type=checkbox]').click(function(event) {
            isChecked = $(this).prop('checked');
            toggleCheckboxes(this, isChecked);
        });
        self.$elem.find('.ankiBox-selectAll').click(function() {
            $('.ankiBox-parentCheckBox').prop('checked', true);
            $('.ankiBox-parentCheckBox').each(function() { toggleCheckboxes(this, true) });
            
        });
        self.$elem.find('.ankiBox-deselectAll').click(function() {
            $('.ankiBox-parentCheckBox').prop('checked', false);
            $('.ankiBox-parentCheckBox').each(function() { toggleCheckboxes(this, false) });
        });
    }
    this.getAnswerHTML = function() {
        var data = {
            phonetics: self.data.phonetics,
            meanings: self.data.meanings.filter(meaning => meaning.checked).map(meaning => {
                var examples = meaning.examples.filter(example => example.checked);
                return {
                    definition: meaning.definition,
                    examples: examples
                }
            })
        }
        var answerHTML = _.template(self.templates.answerSaveTemplate)({
            phonetics: data.phonetics,
            meanings: data.meanings
        });
        return answerHTML;
    }
    function sendToAnki(question, answer) {
        try {
            ankiConnectInvoke('addNote', 5, {
                note: {
                    deckName: 'English',
                    modelName: 'Основная',
                    fields: {
                        "Вопрос": question,
                        "Ответ": answer
                    }
                }
            });
        } catch (e) {
            console.log(`error getting decks: ${e}`);
        }

        function ankiConnectInvoke(action, version, params = {}) {
            const xhr = new XMLHttpRequest();
            xhr.addEventListener('error', () => console.log('failed to connect to AnkiConnect'));
            xhr.addEventListener('load', () => {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.error) {
                        throw response.error;
                    } else {
                        if (response.hasOwnProperty('result')) {
                            console.log(response.result);
                        } else {
                            console.log('failed to get results from AnkiConnect');
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            });

            xhr.open('POST', 'http://127.0.0.1:8765');
            xhr.send(JSON.stringify({ action, version, params }));
        }
    }
    function searchNewWord(word) {
        window.open("popup.html?" + word, "extension_popup", "width=1024,height=768,scrollbars=yes,resizable=no");
    }
    function toggleCheckboxes(checkbox, isChecked) {
        if ($(checkbox).hasClass('ankiBox-parentCheckBox')) { 
            if (isChecked)
                $(checkbox).siblings('ul').removeClass('ankiBox-hidden');
            else
                $(checkbox).siblings('ul').addClass('ankiBox-hidden');  
            self.data.meanings[checkbox.dataset.index].checked = isChecked;          
        } 
        else {
            self.data.meanings[$(checkbox).closest('ul').siblings('[type=checkbox]')[0].dataset.index].examples[checkbox.dataset.index].checked = isChecked;
        }
    }
}