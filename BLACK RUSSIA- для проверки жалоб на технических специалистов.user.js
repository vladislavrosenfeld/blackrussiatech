// ==UserScript==
// @name         BLACK RUSSIA: для проверки жалоб на технических специалистов
// @namespace    https://forum.blackrussia.online
// @version      1.1.1
// @description  Для борьбы с техническими шоколадками
// @author       Carrizo
// @match        https://forum.blackrussia.online/index.php?threads/*
// @include      https://forum.blackrussia.online/index.php?threads/
// @grant        none
// @license 	 MIT
// @collaborator modified by rosenfeld
// @icon https://icons.iconarchive.com/icons/thesquid.ink/free-flat-sample/128/support-icon.png
// @copyright 2021, Carrizo (https://openuserjs.org/users/Carrizo)
// ==/UserScript==

(function () {
  'use strict';
const UNACCEPT_PREFIX = 4; // Prefix that will be set when thread closes
const ACCEPT_PREFIX = 8; // Prefix that will be set when thread accepted
const PIN_PREFIX = 2; // Prefix that will be set when thread pins
const COMMAND_PREFIX = 10; // Prefix that will be set when thread send to project team
const WATCHED_PREFIX = 9;
const CLOSE_PREFIX = 7;
const buttons = [
	{
	  title: 'Приветствие',
	  content:
		'[FONT=Verdana][CENTER]{{ greeting }}, уважаемый(-ая) {{ user.mention }}.[/CENTER]<br>' + '[CENTER][/CENTER][/FONT]',
	},
	{
	  title: 'Правила раздела',
	  content:
		'[FONT=Verdana][CENTER]{{ greeting }}, уважаемый(-ая) {{ user.mention }}.[/CENTER]<br>' +
		"[CENTER]Вынужден отказать Вам в рассмотрении этой темы по следующей причине:" +
        '[CENTER]Ваше обращение не соответствует данному разделу, так как он предназначен для жалоб на технических специалистов/обжалований, но никак не для решения подобных проблем.<br>' +
		'[CENTER]Отказано, закрыто.[/CENTER][/FONT]',
        prefix: UNACCEPT_PREFIX,
        status: false,
	},
	{
	  title: 'Какие жалобы не проверяются',
	  content:
		'[FONT=Verdana][CENTER]{{ greeting }}, уважаемый(-ая) {{ user.mention }}.[/CENTER]<br>' +
		"[CENTER]Вынужден отказать в рассмотрении Вашей жалобы, так как в ней имеются нарушения правил подачи.[/CENTER]<br>" +
        "[CENTER][QUOTE]Какие жалобы не рассматриваются?[/CENTER]<br>" +
		"[CENTER]— Если в содержании темы присутствует оффтоп/оскорбления.<br>" +
        "[CENTER]— С момента выдачи наказания прошло более 7 дней.[/QUOTE][/CENTER]<br>" +
		'[CENTER]Отказано, закрыто.[/CENTER][/FONT]',
        prefix: UNACCEPT_PREFIX,
        status: false,
	},
	{
	  title: 'Запросил доказательства',
	  content:
		'[FONT=Verdana][CENTER]{{ greeting }}, уважаемый(-ая) {{ user.mention }}.[/CENTER]<br>' +
		"[CENTER]Запросил доказательства у технического специалиста, ожидайте ответа.<br>" +
		'[CENTER]На рассмотрении.[/CENTER][/FONT]',
         prefix: PIN_PREFIX,
         status: true,
	},
	{
	  title: 'Форма темы',
	  content:
		'[FONT=Verdana][CENTER]{{ greeting }}, уважаемый(-ая) {{ user.mention }}.[/CENTER]<br>' +
		"[CENTER]Вынужден отказать Вам в рассмотрении этой темы по следующей причине:<br><br>" +
        "[CENTER]Жалоба составлена не по форме, с которой Вы в свою очередь сможете ознакомиться по данной ссылке - https://clck.ru/TYubb[/CENTER]<br>" +
		'[CENTER]Отказано, закрыто.[/CENTER][/FONT]',
        prefix: UNACCEPT_PREFIX,
        status: false,
	},
    {
	  title: 'Дублирование темы',
	  content:
		'[FONT=Verdana][CENTER]{{ greeting }}, уважаемый(-ая) {{ user.mention }}.[/CENTER]<br>' +
		"[CENTER]Вынужден отказать Вам в рассмотрении этой темы по следующей причине:<br><br>[/CENTER]" +
        "[CENTER]Вам уже был дан ответ в подобной теме. Это дублирование темы. Напоминаем, при 3 дублированиях – форумный аккаунт будет заблокирован.<br>[/CENTER]" +
		'[CENTER]Отказано, закрыто.[/CENTER][/FONT]',
        prefix: UNACCEPT_PREFIX,
        status: false,
	},
	{
	  title: 'Передано Льву',
	  content:
		'[FONT=Verdana][CENTER]{{ greeting }}, уважаемый(-ая) {{ user.mention }}.[/CENTER]<br>' +
		"[CENTER]Передал Вашу жалобу на рассмотрение главному техническому специалисту, ожидайте ответа.<br><br>" +
		'[CENTER]На рассмотрении.[/CENTER][/FONT]',
        prefix: COMMAND_PREFIX,
        status: true,
	},
    {
	  title: 'В обжаловании отказано',
	  content:
		'[FONT=Verdana][CENTER]{{ greeting }}, уважаемый(-ая) {{ user.mention }}.[/CENTER]<br>' +
		"[CENTER]Посоветовавшись с техническим специалистом, пришли к выводу: в обжаловании отказано.<br>" +
        '[CENTER]Отказано, закрыто.[/CENTER][/FONT]',
       prefix: UNACCEPT_PREFIX,
       status: false,
	},
     {
	  title: 'Обжалование одобрено',
	  content:
		'[FONT=Verdana][CENTER]{{ greeting }}, уважаемый(-ая) {{ user.mention }}.[/CENTER]<br>' +
		"[CENTER]Посоветовавшись с техническим специалистом, пришли к выводу: наказание будет снято или снижено. Перед входом на сервера обязательно перечитайте правила поведения на проекте.<br>" +
        '[CENTER]Одобрено, закрыто.[/CENTER][/FONT]',
       prefix: ACCEPT_PREFIX,
       status: false,
	},
	{
	  title: 'Наказание выдано верно',
	  content:
		'[FONT=Verdana][CENTER]{{ greeting }}, уважаемый(-ая) {{ user.mention }}.[/CENTER]<br>' +
		"[CENTER]Технический специалист предоставил доказательства, выдано верно.<br>" +
		'[CENTER]Вы совершили действия, которые противоречат регламенту проекта.<br>[/CENTER]' +
        '[CENTER]Отказано, закрыто.[/CENTER][/FONT]',
       prefix: UNACCEPT_PREFIX,
       status: false,
	},
     {
	  title: 'Наказание будет снято',
	  content:
		'[FONT=Verdana][CENTER]{{ greeting }}, уважаемый(-ая) {{ user.mention }}.[/CENTER]<br>' +
		"[CENTER]Ваше наказание будет снято. Извините за предоставленные неудобства. Приятной игры на проекте Black Russia!<br>" +
        '[CENTER]Одобрено.[/CENTER][/FONT]',
        prefix: ACCEPT_PREFIX,
        status: false,
	},
	{
	  title: 'Жалобы сервера',
	  content:
		'[FONT=Verdana][CENTER]{{ greeting }}, уважаемый(-ая) {{ user.mention }}.[/CENTER]<br>' +
		"[CENTER]Обратитесь в раздел «Жалобы» Вашего сервера:<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.54/'][B]Сервер №1 | Red[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.98/'][B]Сервер №2 | Green[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.138/']Сервер №3 | Blue → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.174/'][B]Сервер №4 | Yellow[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.251/'][B]Сервер №5 | Orange[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.291/'][B]Сервер №6 | Purple[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.331/'][B]Сервер №7 | Lime[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.373/'][B]Сервер №8 | Pink[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.414/'][B]Сервер №9 | Cherry[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.467/'][B]Сервер №10 | Black[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.498/'][B]Сервер №11 | Indigo[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.654/'][B]Сервер №12 | White[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.655/'][B]Сервер №13 | Magenta[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?forums/Жалобы.619/'][B]Сервер №14 | Crimson[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.700/'][B]Сервер №15 | Gold[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.720/'][B]Сервер №16 | Azure[/B] → нажмите сюда[/URL]<br>[URL='https://forum.blackrussia.online/index.php?categories/Жалобы.763/'][B]Сервер №17 | Platinum[/B] → нажмите сюда[/URL]<br><br>" +
        '[CENTER]Отказано, закрыто.[/CENTER][/FONT]',
        prefix: UNACCEPT_PREFIX,
        status: false,
	},
];

$(document).ready(() => {
	// Загрузка скрипта для обработки шаблонов
	$('body').append('<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js"></script>');

	// Добавление кнопок при загрузке страницы
	addButton('На рассмотрении', 'pin');
    addButton('КП', 'teamProject');
	addButton('Одобрено', 'accepted');
    addButton('Рассмотрено', 'watched');
	addButton('Отказано', 'unaccept');
	addButton('Ответы', 'selectAnswer');

	// Поиск информации о теме
	const threadData = getThreadData();

	$('button#pin').click(() => editThreadData(PIN_PREFIX, true));
	$('button#accepted').click(() => editThreadData(ACCEPT_PREFIX, false));
	$('button#unaccept').click(() => editThreadData(UNACCEPT_PREFIX, false));
    $('button#teamProject').click(() => editThreadData(COMMAND_PREFIX, true));
    $('button#watched').click(() => editThreadData(WATCHED_PREFIX, false));
	$(`button#selectAnswer`).click(() => {
		XF.alert(buttonsMarkup(buttons), null, 'Выберите ответ:');
		buttons.forEach((btn, id) => {
			if(id > 0) {
				$(`button#answers-${id}`).click(() => pasteContent(id, threadData, true));
			} else {
				$(`button#answers-${id}`).click(() => pasteContent(id, threadData, false));
			}
		});
	});
});

function addButton(name, id) {
$('.button--icon--reply').before(
  `<button type="button" class="button rippleButton" id="${id}" style="margin: 3px;">${name}</button>`,
);
}

function buttonsMarkup(buttons) {
return `<div class="select_answer">${buttons
  .map(
	(btn, i) =>
	  `<button id="answers-${i}" class="button--primary button ` +
	  `rippleButton" style="margin:5px"><span class="button-text">${btn.title}</span></button>`,
  )
  .join('')}</div>`;
}

function pasteContent(id, data = {}, send = false) {
	const template = Handlebars.compile(buttons[id].content);
	if ($('.fr-element.fr-view p').text() === '') $('.fr-element.fr-view p').empty();

	$('span.fr-placeholder').empty();
	$('div.fr-element.fr-view p').append(template(data));
	$('a.overlay-titleCloser').trigger('click');

	if(send == true){
		editThreadData(buttons[id].prefix, buttons[id].status);
		$('.button--icon.button--icon--reply.rippleButton').trigger('click');
	}
}

function getThreadData() {
const authorID = $('a.username')[0].attributes['data-user-id'].nodeValue;
const authorName = $('a.username').html();
const hours = new Date().getHours();
return {
  user: {
	id: authorID,
	name: authorName,
	mention: `[USER=${authorID}]${authorName}[/USER]`,
  },
  greeting: () =>
	4 < hours && hours <= 11
	  ? 'Доброе утро'
	  : 11 < hours && hours <= 16
	  ? 'Добрый день'
	  : 16 < hours && hours <= 21
	  ? 'Добрый вечер'
	  : 'Доброй ночи',
};
}

function editThreadData(prefix, pin = false) {
// Получаем заголовок темы, так как он необходим при запросе
	const threadTitle = $('.p-title-value')[0].lastChild.textContent;

	if(pin == false){
		fetch(`${document.URL}edit`, {
		  method: 'POST',
		  body: getFormData({
			prefix_id: prefix,
			title: threadTitle,
			_xfToken: XF.config.csrf,
			_xfRequestUri: document.URL.split(XF.config.url.fullBase)[1],
			_xfWithData: 1,
			_xfResponseType: 'json',
		  }),
		}).then(() => location.reload());
	}
	if(pin == true){
		fetch(`${document.URL}edit`, {
		  method: 'POST',
		  body: getFormData({
			prefix_id: prefix,
			title: threadTitle,
            discussion_open: 0,
			sticky: 1,
			_xfToken: XF.config.csrf,
			_xfRequestUri: document.URL.split(XF.config.url.fullBase)[1],
			_xfWithData: 1,
			_xfResponseType: 'json',
		  }),
		}).then(() => location.reload());
	}
	if(prefix == UNACCEPT_PREFIX || prefix == ACCEPT_PREFIX || prefix == CLOSE_PREFIX || prefix == WATCHED_PREFIX) {
		moveThread(prefix, 230);
	}
}

function moveThread(prefix, type) {
// Перемещение темы в раздел окончательных ответов
const threadTitle = $('.p-title-value')[0].lastChild.textContent;

fetch(`${document.URL}move`, {
  method: 'POST',
  body: getFormData({
	prefix_id: prefix,
	title: threadTitle,
	target_node_id: type,
	redirect_type: 'none',
	notify_watchers: 1,
	starter_alert: 1,
	starter_alert_reason: "",
	_xfToken: XF.config.csrf,
	_xfRequestUri: document.URL.split(XF.config.url.fullBase)[1],
	_xfWithData: 1,
	_xfResponseType: 'json',
  }),
}).then(() => location.reload());
}

function getFormData(data) {
	const formData = new FormData();
	Object.entries(data).forEach(i => formData.append(i[0], i[1]));
	return formData;
  }
})();

