﻿function AnkiBox(options) {
    var self = this;
    this.$elem = options.$elem;
    this.$page = options.$page;
    parsePage();
    render();

    function parsePage() {
        var $page = self.$page;
        var phonetics = $page.find('.top-g > .pron-gs .phon').toArray().map(function (item) { return $(item).text().split('//').join('/'); }).join(' ');
        var defSelector = $page.find('.sn-gs li').length > 0 ? '.sn-gs li' : '.sn-gs';
        var meanings = $page.find(defSelector).has('.def').toArray().map(function (item) {
            return {
                definition: $(item).find('.def').text(),
                examples: $(item).find('.x-g').toArray().map(function (item) { return $(item).text(); })
            };
        });
        var question = $page.find('.webtop-g > .h').text();
        self.data = {
            phonetics: phonetics,
            meanings: meanings,
            question: question
        };
    }

    function render() {
        var answerTemplate =
            '<b><span class="ankiBox-phonetics"><%-phonetics%></span></b>\
				<% meanings.forEach(function(meaning) { %>\
					<p>\
						<u><span class="my-definition"><%-meaning.definition%></span></u>\
						<ul class="my-examples">\
						<% meaning.examples.forEach(function(example) { %>\
							<li><i class="my-example"><%-example%></i></li>\
						<% }); %>\
						</ul>\
					</p>\
				<% }); %>';
        var ankiTemplate =
            '<button class="btn ankiBox-hide-btn">v</button>\
                    <div class="ankiBox">\
					Question:&nbsp;\
                    <button class="btn copyAnkiQuestion">&nbsp;Copy&nbsp;</button>\
                    <button class="btn sendToAnki" >&nbsp;Send to Anki&nbsp;</button>\
					<div class="ankiBox-question">\
					<%-question%>\
					</div>\
					<br>\
					Answer:&nbsp;\
					<button class="btn copyAnkiAnswer">&nbsp;Copy HTML&nbsp;</button>\
					<div class="ankiBox-answer">\
					<%=answer%>\
					</div>\
				</div>';
        self.answerHTML = _.template(answerTemplate)({
            phonetics: self.data.phonetics,
            meanings: self.data.meanings
        });
        self.ankiHTML = _.template(ankiTemplate)({
            question: self.data.question,
            answer: self.answerHTML
        });
        self.$elem.html(self.ankiHTML);
        initEventListeners();
    }

    function initEventListeners() {
        self.$elem.find('.copyAnkiAnswer').click(function (event) {
            copyTextToClipboard(self.answerHTML);
        });
        self.$elem.find('.copyAnkiQuestion').click(function (event) {
            copyTextToClipboard(self.data.question);
        });
        self.$elem.find('.ankiBox-hide-btn').click(function (event) {
            $('.ankiBox').toggleClass('ankiBox-hidden');
        });
        self.$elem.find('.sendToAnki').click(function (event) {
            sendToAnki(self.data.question, self.answerHTML);
        });
    }
    function sendToAnki(question, answer) {
        function ankiConnectInvoke(action, version, params={}) {
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
            xhr.send(JSON.stringify({action, version, params}));
        }
        
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
    }
}