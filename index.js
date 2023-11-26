// v. 2021-09-01; en.wikipedia.org/wiki/User:V111P/js/WebRef
window.webRef = window.webRef || {}; // object used to communicate with webRefSetup
window.webRef.getRef = (function () {
	'use strict';

	function prt(txt) {
		if (window.console && console.log)
			console.log(txt);
	}

	window.webRef.webRefVer = 1;

	var webRefSetupJsUrl = '//en.wikipedia.org/w/index.php?title='
			+ 'User:V111P/js/webRefSetup.js&action=raw&ctype=text/javascript&smaxage=0&maxage=0';
	webRefSetupJsUrl = 'https://raw.githubusercontent.com/mqudsi/webref/master/index.js';
	var helpUrl = '//en.wikipedia.org/wiki/User:V111P/js/WebRef';  // LOCALIZE

	// Names/abbriviations of the months in the languages of the
	//  used websites. The names must be in lower case.
	// January is number 0, December is number 11.
	var monthNameToNum = { // LOCALIZE by adding local-language abbrevs
		jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
		jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
	};

	// Names of the months to be used in the output
	var monthNumToName = [ // LOCALIZE by translating the month names
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	// these words are used when spliting names in the case of multipe article authors
	var andWords = ['and'];  // LOCALIZE by adding the word(s) for "and" in the local lang

	// Use %D% or %DD%, %M% or %MM% or %MMM%, %YY% or %YYYY%.
	// %M% -> Feb is 2; %MM% -> Feb is 02; %MMM% -> Feb is monthNumToName[1]
	var dateFormatMDY = '%MMM% %D%, %YYYY%';
	var dateFormatDMY = '%D% %MMM% %YYYY%';
	var dateFormatYMD = '%YYYY%-%MM%-%DD%';
	var dateFormatDefault = dateFormatDMY;
	var dateFormatRetrieved = '';  // Leave empty to use dateFormatDefault

	var templateParams = { // LOCALIZE
		templateName: 'Cite web',
		title: 'title',
		transTitle: 'trans-title', // the title translated to English
		work: 'work',
		date: 'date',
		accessDate: 'access-date',
		url: 'url',
		publisher: 'publisher',
		lang: 'language',
		quote: 'quote',
		author: 'author',
		last: 'last',
		first: 'first',
		coauthors: 'coauthors', // not used
		authorWikiArticle: 'authorlink',
		barV: '| ',  // bar and spaces around it (but no newlines) for Vertical format
		barVsameLine: ' | ', // (e.g. first name is on the same line as last name even in vertical mode)
		barH: ' |',  // ... for Horizontal format
		eqV: ' = ',   // equal sign and spaces around it (but no newline) for Vertical format
		eqH: '=',    // ... for Horizontal format
		urlEqH: '= ' // a space before the URL helps with line wrapping
	};
	var tp = templateParams;
	var barV = tp.barV, barH = tp.barH, eqV = tp.eqV, eqH = tp.eqH;

	var msgs = webRef.idToText = webRef.msgs = webRef.msgs || webRef.idToText || {};
	var msgs_default = {  // LOCALIZE
		programName: 'WebRef',
		monthWarning: 'Check month!',
		monthWarningTitle: 'Was the date in the MM/DD/YY(YY) or DD/MM/YY(YY) format?',
		quoteUsedWarning: 'Quotation!',
		quoteUsedWarningTitle: 'The selected text on the page was used for the value of the Quote parameter',
		setupButton: 'Site setup',
		hideButton: 'Close',
		selectButton: 'Select',
		copyButton: 'Copy',
		compactCopyButton: 'Compact & Copy',
		compactSelectButton : 'Compact & Select',
		copyFailed: ' Copying failed!',
		reloadButton: 'Reload',
		formatNamesPromptButton: 'Authors',
		formatNamesPrompt: 'Enter the author names (separated by commas if more than one author) to be formatted and inserted into the template:',
		dmy: 'DMY',
		mdy: 'MDY',
		ymd: 'YMD',
		refName: 'RefName',
		singleMultiLineButton: 'Horiz./Vertical',
		couldntParse: 'Sorry, I couldn\'t parse that.',

		searchSectionH: 'Introduction:',
		searchSectionIntro: 'In order to configure WebRef for this site, first open a web page with only one article (e.g. not the main page). It is preferable that the article lists the article\'s author(s) so that you can configure the authors too. In the fields below, enter the title of the article, the date of the article, and/or the author(s) names, but exactly as they appear in the page below (you can copy and paste them). However, if one of these is detected even without configuring it, then don\'t enter anything for it here - see the next section. Next, click the Search button.',
		searchButton: 'Search',

		resultsH: 'Results',
		resultsSectionIntro: 'After performing the searching as described above, select the appropriate web-page elements from the results below. Some elements are prefilled even without searching and therefore you may not need to search for them above. (You may select a wrong element here if the text you searched for appears in more than one place on the page, but you will notice the error after testing WebRef on other pages.)',
		titleResults: 'Title:',
		dateResults: 'Date:',
		authorResults: 'Author(s):',
		'default': 'default',

		aboutSiteH: 'About the site',
		aboutSiteSectionIntro: 'You can fill this information, but data that is automatically filled doesn\'t need saving in the configuration. Using en as the language code for sites in English will hide the language parameter in the Cite web template. Use en-US if the date is in the MM/DD/YY(YY) format, with the month number instead of its name used in the date.',
		siteName_L: 'Site name (can be a wikilink):',
		lang_L: 'Language code for the site:',
		publisher_L: 'Publisher (can be a wikilink):',
		authorName_L: 'For personal websites, formatted author name (e.g. Smith, John):',
		authorWikiArticle_L: 'For personal websites, wiki article about the author:',
		notAnAuthor_L: 'This is not an author\'s name (this at the place where the author\'s name usually is, means the article is anonymous):',

		buttonsIntro: 'First click the first button. The code corresponding to the information from the form above will appear in the text box below. Now you can press the button "Use the code..." to see if the result is good. After that you can come back here with the button "Site setup". Then you can save the code in the "local storage" (see Web storage in Wikipedia), where you can use it on every page on this domain/subdomain. It is recommended that you also save it elsewhere so that you can restore it easily if it gets deleted from the local storage.',
		toCode: 'Create the code! Convert the information in the form above into code in the text box',
		saveToStorage: 'Save the code from the text box - into the local storage',
		loadFromVar: 'Show in the text box the currently-active settings for this site',
		loadFromStorage: 'From the local storage - into the text box',
		deleteFromStorage: 'Delete this site\'s settings from the local storage',
		useOnceFromTA: 'Use the code from the text box once (without saving it)',
		resetForm: 'Clear the form',
		closeSetup: 'Close',

		codeTaH: 'Code for the site',

		delStorageConfirm: 'Delete the settings for this site from the local storage?',
		overwriteStorageConfirm: 'Saving the new settings into the local storage will overwrite the old settings for this site.',
		invalidCode: 'The code in the text box is not valid.',
		noStorage: 'Your browser does not support Web Storage and/or JSON or for some reason they don\'t work on this site.',
		resetFormConfirm: 'Clear the form?'
	};

	for (var prop in msgs_default) {
		if (msgs_default.hasOwnProperty(prop) && !msgs[prop])
			msgs[prop] = msgs_default[prop];
	}

	var langToIgnore = 'en'; // default lang of the wiki - won't be specified in the cite template  // LOCALIZE
	var selectionJoiner = ' [...] '; // used to join two or more selections (used for quotations)  // LOCALIZE

	var frameBodyStyleObj = {
		margin: '0 auto',
		color: '#ffffff', backgroundColor: '#000077',
		border: '5px solid gray', borderWidth: '5px 0',
		padding: '1px', font: 'normal normal normal medium serif',
		textAlign: 'left'
	};

	var domain = window.webRef.domain = location.href.replace(/[^\/]+\/\/(www\.)?/, '').replace(/\/.*/, '') || '?';
	var metaContent;
	var siteObj; // = window.webRefSiteData && webRefSiteData[domain] || get_from_local_storage
	var refFrame = {
		frame: null,
		win: null,
		doc: null,
		body: null
	};

	var codeTextArea;
	var siteLang; // used for date formatting if equals en-US and month is represented as a number
	var monthWarningNeeded; // set in dateFormatter if not clear if date is in U.S. format or not
	var siteDateIsUS = false;

	var refDocData = window.webRef.refDocData = {
		things: {
			title: {
				autoSearchIn: ['meta-p og:title', 'meta title', 'title', 'h1']
			},
			date: {
				formatter: dateFormatter,
				autoSearchIn: ['meta-i datePublished', 'meta date', 'meta Date']
			},
			author: {
				formatter: nameFormatter,
				autoSearchIn: ['meta-p og:author', 'meta author', 'meta Author']
			},
			siteName: { // the site domain is also used
				autoSearchIn: ['meta-p og:site_name', 'meta application-name']
			},
			lang: {
				formatter: function (langCode) { // remove language variant
					return langCode.replace(/([^-]{2,3})-.+/, '$1');
				},
				autoSearchIn: ['meta-i inLanguage', 'misc html-lang']
			},
			publisher: {
				autoSearchIn: ['meta-i publisher']
			},
			authorName: {},
			authorWikiArticle: {},
			notAnAuthor: {}
		} // things end
	};


	var dom = window.webRef.dom = {
		getText: function (node) {
			function getText(node) {
				if (node.nodeType == 3) {
					return node.nodeValue;
				}

				var nn, txt = '';

				if (node = node.firstChild) do {
					nn = node.nodeName.toLowerCase();
					if (nn == 'br')
						txt += ' ';
					else if (nn != 'script' && nn != 'style')
						txt += getText(node);
				} while (node = node.nextSibling);

				// textContent does not replace <br> with a space
				// var str = el.textContent || el.innerText || '';
				return txt;
			};
			return aux.collapseWhitespace(getText(node));
		},

		textNode: function (str) {
			return document.createTextNode(str);
		},

		setStyle: function (el, styleObj) {
			var s;
			for (s in styleObj) {
				el.style[s] = styleObj[s];
			}
		},

		byTagName: function (name) {
			return document.getElementsByTagName(name);
		},

		byId: function (id, context) {
			context = context || document;
			return context.getElementById(id);
		},

		newEl: function (tagName, attrs) {
			var el = document.createElement(tagName);
			if (attrs)
				for (var a in attrs) {
					if (a == 'css')
						dom.setStyle(el, attrs[a]);
					else if (a == 'text') {
						if (document.all)
							el.innerText = attrs[a];
						else
							el.textContent = attrs[a];
					}
					else
						try{
							el[a] = attrs[a];
						}
						catch(e) {aux.fatalError('newEl: el='+el+", a="+a+", err="+e);}
				}
			return el;
		},

		br: function (context) {
			context = context || refFrame.body ;
			context.appendChild(dom.newEl('br'));
		},

		text: function (str, context) {
			context = context || refFrame.body;
			var node = dom.textNode(str);
			context.appendChild(node);
			return node;
		}
	}; // dom object


	var aux = window.webRef.aux = {  // auxilliary functions
		trimStr: function (str) {
			return str.replace(/^\s+/, '').replace(/\s+$/, '');
		},

		collapseWhitespace: function (str) {
			return aux.trimStr(str).replace(/\s+/g, ' ');
		},

		error: function (str) {
			if (window.console && console.error)
				console.error('WebRef error: ' + str);
		},

		fatalError: function (str) {
			str = "WebRef error: " + str;
			throw new Error(str);
		}
	};


	function cleanParam(str) {
		return str.replace(/\|/g, '{{!}}').replace(/</, '&lt;').replace(/>/, '&gt;');
	}


	function getMetaContent() {
		var metaEls = dom.byTagName('meta');
		var metaContent = {};
		for (var i = 0, el, prop; i < metaEls.length; i++) {
			el = metaEls[i];

			if (!el.content)
				continue;
			prop = el.getAttribute('itemprop'); // schema.org microformat
			if (prop)
				metaContent['meta-i ' + prop] = el.content;

			if (el.name)
				metaContent['meta ' + el.name] = el.content;
			else {
				prop = el.getAttribute('property');
				if (prop)
					metaContent['meta-p ' + prop] = el.content;
			}
		}
		var htmlEl = dom.byTagName('html');
		if (htmlEl.length > 0) {
			var lang = htmlEl[0]['lang'] || htmlEl[0]['xml:lang'];
			if (lang) metaContent['misc html-lang'] = lang;
		}
		metaContent['title'] = document.title;
		return metaContent;
	} // getMetaContent


	function dateFormatter(dateStr, format, useUSFormatIfUnclear) { // format is optional
		var formattedDate = '';
		var monthStr = '';
		var month;
		format = format || dateFormatDefault;

		for (var m in monthNameToNum) {
			if (monthNameToNum.hasOwnProperty(m))
				monthStr += m + '|';
		}
		monthStr = monthStr.slice(0, -1);

		dateStr = aux.collapseWhitespace(dateStr).toLowerCase();
		month = dateStr.match(monthStr);
		if (month) {
			var regEx = new RegExp('(?:\\b|\\D)(?:(?:(\\d?\\d).{0,5}' + month + ')|(?:'
				+ month + '.*?(\\d?\\d))).*?'
				+ '((19|20)\\d\\d)');
			var result = regEx.exec(dateStr);
			if (result) {
				formattedDate = dateToString((result[1] || result[2]), monthNameToNum[month], result[3], format);
			}
			else prt('WebRef debug info: Can\'t parse date: ' + dateStr);
		}
		if (!formattedDate) {
			var dateParts = dateStr.match(
			 /(?:\b|\D)((?:(?:\d\d)?\d\d)|\d)[-. \/](\d?\d)[-. \/]((?:(?:\d\d)?\d\d)|\d)(?:\b|\D)/
			);
			var year, day;
			if (dateParts) {
				if (dateParts[1].length == 4) { // assume Year-Month-Day format
					day = ('0' + dateParts[3]).slice(-2);
					month = dateParts[2];
					year = dateParts[1];
				}
				else {
					var thisYearMod100 = (new Date()).getFullYear() % 100;
					year = dateParts[3];
					if (year.length == 1)
						year = '0' + year;
					if (year < thisYearMod100 + 1)
						year = '20' + year; // 2000+ if last 2 digits < last 2 of curr yr
					else if (year < 100)
						year = '19' + year; // 1900+ otherwise :)

					if (siteLang == 'en-US' || dateParts[2] > 12) { // American style date
						month = dateParts[1];
						day = dateParts[2];
					}
					else {
						if (!siteLang || siteLang == 'en')
							monthWarningNeeded = true;
						if (useUSFormatIfUnclear) {
							month = dateParts[1];
							day = dateParts[2];
						}
						else {
							day = dateParts[1];
							month = dateParts[2];
						}
					}
					day = ('0' + day).slice(-2);
				}
				if (+month <= 12 && +day <= 31)
					formattedDate = dateToString(day, month - 1, year, format);
			}
		}

		return formattedDate;
	} // dateFormatter


	function formatDateParams(format, useUSFormatIfUnclear) {
		var trimCollapse = aux.collapseWhitespace;
		var strt = '\\|\\s*';
		var end = '\\s*=\\s*([^|}]*)';
		var oldVal = codeTextArea.value;
		var val = formatDateParam(oldVal, format, tp.date);

		if (tp.accessDate && dateFormatRetrieved == '')
			val = formatDateParam(val, format, tp.accessDate);
		if (val != oldVal) {
			codeTextArea.value = val;
			singleMultiLine(true);
		}

		function formatDateParam(templStr, format, paramName) {
			var dateParamRe = new RegExp(strt + paramName + end);
			var dateInTemplate = trimCollapse((templStr.match(dateParamRe) || ['', ''])[1]);

			if (dateInTemplate) {
				monthWarningNeeded = false;
				var formattedDate = dateFormatter(dateInTemplate, format, useUSFormatIfUnclear);
				if (formattedDate) {
					var pos = templStr.search(dateParamRe);
					if (pos < 0) pos = templStr.indexOf('|');
					if (pos < 0) pos = 0;
					templStr = templStr.replace(dateParamRe, '');
					templStr = templStr.slice(0, pos) + '\n'
						+ barV + paramName + eqV + formattedDate + templStr.slice(pos);
					if (monthWarningNeeded)
						addWarning(msgs.monthWarning, msgs.monthWarningTitle);
				}
				else
					alert(msgs.programName + ':\n' + msgs.couldntParse + '\n' + dateInTemplate);
			}
			return templStr;
		} // formatDateParam

	} // formatDateParams


	function formatNamesPrompt() {
		var val = codeTextArea.value;
		var names = '';
		var authorParamNames = [tp.author, tp.coauthors, tp.first, tp.last];
		for (var n = 1; n <= 9; n++) {
			authorParamNames.push(tp.first + n)
			authorParamNames.push(tp.last + n);
		}

		var strt = '\\|\\s*';
		var end = '\\s*=\\s*([^|}]+)';
		names = (val.match(strt + tp.author + end) || ['', ''])[1] + ',';
		for (var n = 0; n <= 9; n++)
			names += (val.match(strt + tp.first + (n == 0 ? '' : n) + end) || ['', ''])[1] + ' '
			       + aux.collapseWhitespace((val.match(strt + tp.last + (n == 0 ? '' : n) + end) || ['', ''])[1])
			         .replace(/ /g, '_') + ',';
		if (tp.coauthors)
			names += (val.match(strt + tp.coauthors + end) || ['', ''])[1];
		names = names.replace(/\s+/g, ' ').replace(/\s?,\s?/g, ',')
			.replace(/,,+/g, ',').replace(/^,|,$/g, '').replace(/,/g, ', ');
		var userAuthors = prompt(msgs.formatNamesPrompt, names);
		if (userAuthors) {
			var namesNewParams = authorParams(nameFormatter(userAuthors));
			if (namesNewParams) {
				var pos = val.search(new RegExp('\\|\\s*(' + tp.last + '1?|' + tp.author + ')\\s*='));
				if (pos < 0) pos = val.indexOf('|');
				if (pos < 0) pos = 0;
				for (var n = 0; n < authorParamNames.length; n++)
					val = val.replace(new RegExp(strt + authorParamNames[n] + end), '');

				val = val.slice(0, pos) + namesNewParams + val.slice(pos);
				codeTextArea.value = val;
				singleMultiLine(true);
			}
		}
	}


	function nameFormatter(nameStr) {
		var result = [['']];
		// replace all "and"s with commas, so people's names can be split
		//  For example "G. D., B. R., and A. S."
		//  will be split into the array: [ ['D.', 'G.'], ['R.', 'B.'], ['S.', 'A.'] ]
		nameStr = nameStr.replace(new RegExp('(,?\\s+)(' + andWords.join('|') + ')\\s', 'gi'), ',')
		.replace(/\s+/g, ' ').replace(/ ?, ?/g, ',').replace(/,,+/g, ',');
		var peopleArr = aux.collapseWhitespace(nameStr).split(',');
		for (var i = 0; i < peopleArr.length; i++) {
			var person = aux.trimStr(cleanParam(peopleArr[i]));
			var lastSpacePos = person.lastIndexOf(' ');
			result[i] = [];
			result[i][0] = person.slice(lastSpacePos + 1).replace(/_/g, ' ');
			if (lastSpacePos > 0)
				result[i][1] = person.slice(0, lastSpacePos);
		}
		return result;
	} // nameFormatter


	function authorParams(authorsArr, additionalNotAnAuthor) {
		var str = '';
		var nl = '\n' + barV;
		if (!authorsArr && siteObj.authorName) {
			str = nl + tp.author + eqV + siteObj.authorName;
			if (siteObj.authorWikiArticle)
				str += nl + tp.authorWikiArticle + eqV + siteObj.authorWikiArticle;
		}
		else if ((authorsArr = authorsArr || searchFor('author', siteObj.notAnAuthor)) !== null) {
			if (additionalNotAnAuthor) { // to remove e.g. "CNN" from "James Smith, CNN"
                var i = authorsArr.length;
				while (i--) {
					if (authorsArr[i][0] === additionalNotAnAuthor && !authorsArr[i][1])
						authorsArr.splice(i, 1);
 				}
			}
			if ( authorsArr.length == 1 && !authorsArr[0][1] ) // only 1 author without a first name
				str = nl + tp.author + eqV + authorsArr[0][0];  // use the 'author' param
			else { // use the 'last' and 'first' params
				for (var i = 0; i < authorsArr.length; i++) {
					var num = (i > 0 || authorsArr.length > 1 ? String(i + 1) : ''); // omit number if only 1 author
					if (authorsArr[i][0]) {
						str += nl + tp.last + num + eqV + authorsArr[i][0];
						if (authorsArr[i][1])
							str += tp.barVsameLine + tp.first + num + eqV + authorsArr[i][1];
					}
			    }
			}


		}
		return str;
	} // authorParams


	function singleMultiLine(toMulti) {
		var val = aux.trimStr(codeTextArea.value);
		var nowMulti = (val.indexOf('\n') > -1) && !toMulti;
		if ( toMulti === false || (!toMulti && nowMulti) ) {
			val = val.replace(/\n/g, ' ')
			         .replace(/\s*\|\s*([^|= ]+)\s*=\s*/g, barH + '$1' + eqH)
			         // a space after |url= helps with line wrapping :
			         .replace(new RegExp('(\\|\\s*' + tp.url + ')\\s*=\\s*'), '$1' + tp.urlEqH);
		} else {
			val = val.replace(/\s*\|\s*([^|= ]+)\s*=\s*/g, '\n' + barV + '$1' + eqV ).replace(/\s*}}/, '\n}}')
			.replace( // move the "last" and "first" parameters on one line
				new RegExp('(\\|\\s*' + tp.last + '\\d?\\s*=[^\\n|}]*)\n(\\| ' + tp.first + '\\d?\\s*=)', 'g'),
				'$1 $2'
			);
		}

		codeTextArea.value = val + '\n';
	}


	function setup() {
		if (webRef.webRefSetup)
			webRef.webRefSetup();
		else {
			webRef.webRefSetupStartOnLoad = true;
			document.body.appendChild(dom.newEl('script', {
				src: webRefSetupJsUrl
			}));
		}
	}


	var displayWebRefFrame = window.webRef.displayWebRefFrame = function (show) {
		dom.byId('ref00ref').style.display = (show ? 'block' : 'none');
		dom.byId('ref00refDiv').style.display = (show ? 'block' : 'none');
	}


	function createUI() {
		var copyButtonSupported;
		try {
			copyButtonSupported = document.queryCommandSupported && document.queryCommandSupported('copy');
		} catch (e) {
			copyButtonSupported = false;
		}
		var buttons = [
			{
				id: copyButtonSupported ? 'compactCopyButton' : 'compactSelectButton',
				onclick: function () {
					var val = codeTextArea.value;
					val = val.replace(new RegExp('\\s*\\|\\s*' + tp.quote + '\\s*=\\s*(\\||})'), '$1') // rm empty quote
					         .replace(new RegExp('\\s*\\|\\s*' + tp.lang + '\\s*=\\s*(\\||})'), '$1') // rm empty lang
					         .replace(/\s+}}\s*$/, '}}'); // remove spaces before and after final }}
					codeTextArea.value = val;
					singleMultiLine(false);
					codeTextArea.focus();
					codeTextArea.select();
					if (copyButtonSupported) {
						var copyFailed = !refFrame.doc.queryCommandEnabled('copy');
						if (!copyFailed) try {
							copyFailed = !refFrame.doc.execCommand('copy');
						} catch (e) { copyFailed = true; }
						if (copyFailed) this.parentNode.insertBefore(dom.textNode(msgs['copyFailed']), this.nextSibling);
					}
				}
			},
			{
				id: 'formatNamesPromptButton',
				onclick: formatNamesPrompt
			},
			{
				id: 'dmy',
				onclick: function () { formatDateParams(dateFormatDMY); }
			},
			{
				id: 'mdy',
				onclick: function () { formatDateParams(dateFormatMDY); }
			},
			{
				id: 'ymd',
				onclick: function () { formatDateParams(dateFormatYMD); }
			},
			{
				id: 'refName',
				onclick: function () {
					var val, oldVal = codeTextArea.value;
					val = oldVal.replace(/^<ref name="[^"]*"/, '<ref');
					if (val == oldVal)
						val = val.replace(/^<ref/, '<ref name=""');
					codeTextArea.value = val;
				}
			},
			{
				id: 'singleMultiLineButton',
				onclick: function () { singleMultiLine(); }
			},
			{
				id: 'reloadButton',
				onclick: function () { webRef.getRef(); }
			},
			{
				id: 'hideButton',
				onclick: function () { displayWebRefFrame(false); }
			},
			{
				id: 'setupButton',
				onclick: setup
			}
		];

		if (!document.body || !document.body.firstChild) {
			aux.fatalError('Web page is empty!');
		}
		var docFrag = document.createDocumentFragment();
		var subDiv;

		function br() {
			docFrag.appendChild(dom.newEl('br'));
		}

		codeTextArea = dom.newEl('textarea', {
			id: 'codeTA',
			cols: 100,
			rows: 10
		});
		docFrag.appendChild(codeTextArea);
		br();

		var btn;
		for (var i = 0; i < buttons.length; i++) {
			btn = buttons[i];
			if (!btn.id)
				continue;

			docFrag.appendChild(dom.newEl('button', {
				text: msgs[btn.id],
				onclick: btn.onclick
			}));

			dom.text(' ', docFrag);
		}
		dom.text('| ', docFrag);
		docFrag.appendChild(dom.newEl('a', {
			text: 'WebRef',
			target: '_blank',
			href: helpUrl,
			css: {color: 'white'}
		}));
		docFrag.appendChild(dom.newEl('span', {
			text: ' | ',
			id: 'warningsSeparator',
			css: {display: 'none'}
		}));
		docFrag.appendChild(dom.newEl('span', {id: 'warnings'}));

		refFrame.frame = dom.byId('ref00ref');
		if (refFrame.frame)
			document.body.removeChild(refFrame.frame);
		subDiv = dom.byId('ref00refDiv');
		if (subDiv)
			document.body.removeChild(subDiv);

		refFrame.frame = dom.newEl('iframe', {
			id: 'ref00ref',
			resizable: 'resizable',
			css: {width: '100%', position: 'absolute', zIndex: '2147483647', top: 0, left: 0}
		});
		document.body.insertBefore(refFrame.frame, document.body.firstChild);
		refFrame.win = (refFrame.frame.contentWindow || refFrame.frame);
		refFrame.doc = (refFrame.win.document || refFrame.win.contentDocument);
		refFrame.doc.open();
		refFrame.doc.write('<!DOCTYPE html>\n<html>\n<head>\n<title>Ref</title>\n</head>'
			+ '<body>\n</body>\n</html>');
		refFrame.doc.close();
		refFrame.body = refFrame.doc.body;
		dom.setStyle(refFrame.body, frameBodyStyleObj);
		refFrame.body.appendChild(docFrag);

		var frameHeight = getDocHeight(refFrame.body, refFrame.doc) + 'px';
		refFrame.frame.style.height = frameHeight;
		subDiv = dom.newEl('div', {
			id: 'ref00refDiv',
			css: {height: frameHeight}
		});
		document.body.insertBefore(subDiv, document.body.firstChild);

		function getDocHeight(b,D) {
			return Math.max(
				Math.max(b.scrollHeight, D.documentElement.scrollHeight),
				Math.max(b.offsetHeight, D.documentElement.offsetHeight)
			);
		}
	} // createUI


	function elFromStr(selector) {
		if (!selector)
			return null;
		var elSelParts = selector.split(' ');

		function findSubEl(parent, i) {
			if (i >= elSelParts.length)
				return parent;
			var s = elSelParts[i];
			var el = null;
			if (s.charAt(0) == '#') {
				el = dom.byId(s.slice(1));
				if (el === null) {
					prt('WebRef debug info: No element with id ' + s.slice(1) + ' found in document.');
					return null;
				}
				else
					return findSubEl(el, i + 1);
			}
			else {
				var n = parseInt(s, 10) || 0;
				if (n)
					s = s.slice((n+'').length);
				var classes = s.split('.');
				var tagName = classes[0];
				classes = classes.slice(1);
				var els = parent.getElementsByTagName(tagName.toUpperCase());
				el = null;
				if (classes.length > 0)
					el = parent.querySelector(s);
				else
					el = els[n];
				if (el === null) {
					prt('WebRef debug info: No element with id ' + s.slice(1) + ' found in document.');
					return null;
				}
				return findSubEl(el, i + 1);
			}
		}
		return findSubEl(document, 0);
	} // elFromStr()


	// Returns the text from the specified element, but also
	// if pre- and post-position strings are specified in the
	// address of the element, returns only the string between them.
	// All white space between other characters is converted to single space.
	// The elements' bg color is set to yellow if highlight is not false.
	var textFromAddr = window.webRef.textFromAddr = function (elAddr, highlight) {
		if (!elAddr)
			return '';
		var text = '';
		var parts = elAddr.split('^^');
		var selector = parts[0];

		//var elSelParts = selector.split(' ');
		if (selector.slice(0, 4) == 'meta' || selector.slice(0, 4) == 'misc' || selector == 'title') {
			text = metaContent[selector] || '';
		}
		else {
			var el = elFromStr(selector);
			if (el) {
				text = dom.getText(el);
				if (highlight !== false)
					el.style.backgroundColor = 'yellow';
			}
		}

		if (text && parts.length > 1) {
			var ending = (parts[2] || '');
			var matched = text.match(parts[1] + '\\s*(.+' + (!ending ? ')' : '?)\\s*' + ending));
			if (matched && matched[1])
				text = matched[1];
		}

		return aux.collapseWhitespace(text);
	}; // textFromAddr


	// searches for and returns the text from the document in the places specified in the
	//  refDocData.things[thingName].autoSearchIn array for the specified thingName.
	function autoSearchFor(thingName) {
		var searchList = refDocData.things[thingName].autoSearchIn;
		var result = '';
		for (var i = 0; i < searchList.length; i++) {
			result = textFromAddr(searchList[i]);
			if (result) break;
		}
		return result;
	} // autoSearchFor


	function dateToString(day, month, year, format) { // month is 0..11
		day = +day; month = +month; year = +year;
		return format
		.replace(/%DD%/, (day > 9 ? '' : '0') + day)
		.replace(/%D%/, day)
		.replace(/%MMM%/, monthNumToName[month])
		.replace(/%MM%/, (month > 8 ? '' : '0') + (month + 1))
		.replace(/%M%/, (month + 1))
		.replace(/%YYYY%/, year)
		.replace(/%YY%/, year % 100);
	}


	function getTodaysDateStr() {
		var today = new Date();
		return dateToString(
			today.getDate(),
			today.getMonth(),
			today.getFullYear(),
			(dateFormatRetrieved || dateFormatDefault)
		);
	}


	function getSiteName() {
		var siteName;
		if (siteObj.siteName) {
			siteName = siteObj.siteName;
		}
		else {
			siteName = autoSearchFor('siteName');
			if (!siteName)
				siteName = domain;
		}
		return siteName;
	}


	function getSelectedText() {
		var text = '';
		if (window.getSelection) {
			var sel = window.getSelection();
			for (var i = 0; i < sel.rangeCount; i++)
				text += (i > 0 ? selectionJoiner : '') + sel.getRangeAt(i).toString();
		}
		else if (document.getSelection)
			text = document.getSelection();
		else if (document.selection)
			text = document.selection.createRange().text;
		text = aux.collapseWhitespace(text);
		return text;
	}


	// Checks at the address specified at siteObj[thingName], if any.
	// If nothing is found there, searches at the places specified in the
	//  refDocData.things[thingName].autoSearchIn array for the specified thingName.
	// In both cases, the discovered text is tested against the "exception" parameter
	// If the two strings match, null is returned.
	// Otherwise, text is then formatted, using the formatting function specified in
	// refDocData.things[thingName].formatter, if any.
	function searchFor(thingName, exception) {
		var text = textFromAddr(siteObj[thingName]) || autoSearchFor(thingName);
		if (text == exception)
			return null;
		//text = filter(text, exception);
		var formatter = refDocData.things[thingName].formatter;
		if (formatter)
			text = formatter(text);
		return text;
	}


	function addWarning(label, title) {
		var warnSpan = dom.byId('warnings', refFrame.doc);
		var warnSepar = dom.byId('warningsSeparator', refFrame.doc);
		warnSepar.style.display = 'inline';
		warnSpan.appendChild(dom.textNode(' '));
		warnSpan.appendChild(dom.newEl('span', {
			text: label,
			title: title,
			css: {backgroundColor: 'green'}
		}));
	}


	function clearWarnings() {
		var warnSpan = dom.byId('warnings', refFrame.doc);
		var warnSepar = dom.byId('warningsSeparator', refFrame.doc);
		warnSpan.innerHTML = '';
		warnSepar.style.display = 'none';
	}



	function go() {
		var title, date, lang, langParam, quote, selection, work, publisher;

		metaContent = window.webRef.metaContent = getMetaContent();

		siteObj = window.webRefSiteData && webRefSiteData[domain] || (function () {
			var str, sO;
			if (window.localStorage && window.JSON) {
				str = localStorage.getItem('webRef-1');
				if (str) sO = JSON.parse(str);
			}
			return sO || {};
		})();
		siteLang = siteObj.lang || '';

		clearWarnings();
		var warnings = [];

		title = cleanParam(searchFor('title'));

		monthWarningNeeded = false;
		date = searchFor('date');
		if (monthWarningNeeded) { // set in dateFormatter() if not clear whether the date is MM/DD/YYYY or DD/MM/YYYY
			warnings.push([msgs.monthWarning, msgs.monthWarningTitle]);
		}

		langParam = '';
		if (siteLang.search(/^en-US/i) == 0) siteLang = 'en-US';
		lang = (siteLang == 'en-US' ? 'en' : siteLang);
		if (!lang) {
			lang = autoSearchFor('lang') || '';
			var langFormatter = refDocData.things.lang.formatter;
			if (lang && langFormatter)
				lang = langFormatter(lang);
		}
		if (!lang || lang != langToIgnore) // add the param only if lang is not langToIgnore
			langParam = barV + tp.lang + eqV + lang + ' \n';

		quote = barV + tp.quote + eqV;
		selection = getSelectedText();
		if (selection) {
			quote += cleanParam(selection);
			warnings.push([msgs.quoteUsedWarning, msgs.quoteUsedWarningTitle]);
		}

		for (var i = 0; i < warnings.length; i++) {
			addWarning(warnings[i][0], warnings[i][1]);
		}

		work = cleanParam(getSiteName());
		publisher = siteObj.publisher || '';

		codeTextArea.value = '<ref>{{'
			+ tp.templateName
			+ '\n' + barV + tp.title + eqV + title
			+ (!lang || lang == langToIgnore ? '' : '\n' + barV + tp.transTitle + eqV) // translated title
			+ authorParams(null, work)
			+ '\n' + barV + tp.work + eqV + work
			+ '\n' + barV + tp.date + eqV + date
			+ '\n' + barV + tp.accessDate + eqV + getTodaysDateStr()
			+ '\n' + barV + tp.url + eqV + location.href + '\n'
			+ (publisher ? barV + tp.publisher + eqV + publisher + '\n' : '')
			+ langParam
			+ quote
			+ '\n}}</ref>\n';

		document.body.scrollTop = document.documentElement.scrollTop = 0;
	}

	createUI();

	return go;

})();

webRef.getRef();
