var tab_url = params.tab_url;
var doctitle = params.doctitle;

var selected_range = document.getSelection().getRangeAt(0);
var position_selector = anchoring.TextPositionAnchor.fromRange(document.body, selected_range);
var quote_selector = anchoring.TextQuoteAnchor.fromRange(document.body, selected_range);

chrome.runtime.sendMessage(
	{
		action:'receive_selection',
		tab_url: tab_url,
		doctitle: doctitle,
		position_selector: position_selector,
		quote_selector: quote_selector,
	},
	function(data) {
		console.log(data);
	});

/* use TextQuoteAnchor instead
function getSelectionText() {
	var selected_text = 'none';
    if (window.getSelection) {
        selected_text = window.getSelection().toString();
	}
	return selected_text;
}

function getSelectionPrefix(selection) {
	var prefix = 'none';
    var base = window.getSelection().baseNode.textContent;
	var selection_starts_at = base.indexOf(selection);
	if (  (base.length - selection_starts_at) >= 30 )
		prefix = base.substring(selection_starts_at - 30, selection_starts_at);
	return prefix;
}
*/


