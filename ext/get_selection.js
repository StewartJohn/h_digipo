var tab_url = params.tab_url;
var doctitle = params.doctitle;

var selected_range = document.getSelection().getRangeAt(0);
var position_selector = anchoring.TextPositionAnchor.fromRange(document.body, selected_range).toSelector();
var quote_selector = anchoring.TextQuoteAnchor.fromRange(document.body, selected_range).toSelector();

chrome.runtime.sendMessage(
	{
		action:'receive_selection',
		tab_url: tab_url,
		doctitle: doctitle,
		position_selector: position_selector,
		quote_selector: quote_selector,
	},
	function(data) {
//		console.log(data);
	});



