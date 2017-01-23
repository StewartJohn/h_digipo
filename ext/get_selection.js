var tab_url = params.tab_url;
var doctitle = params.doctitle;

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


var selected_text = getSelectionText();
var prefix = getSelectionPrefix(selected_text);

chrome.runtime.sendMessage(
	{
		action:'receive_selection',
		selected_text: selected_text,
		prefix: prefix,
		tab_url: tab_url,
		doctitle: doctitle
	},
	function(data) {
		console.log(data);
	});
