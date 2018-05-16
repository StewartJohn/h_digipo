chrome.runtime.onInstalled.addListener(function() {
});

chrome.contextMenus.create({
 title: "Are the terms easy to read?",
 contexts:["selection"],
 onclick: function(info) {
   chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
     var tab = tabs[0];
     var url = tab.url;
     var text = info.selectionText;
     var new_tab_url ='http://adamcroom.com/termsofservice/submit/'+
     '?highlight=' + text +
     '&url=' + url +
     '&question=Are the terms easy to read?';
     chrome.tabs.create({ url: new_tab_url});
 });
}
});

chrome.contextMenus.create({
 title: "Can you terminate your account?",
 contexts:["selection"],
 onclick: function(info) {
   chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
     var tab = tabs[0];
     var url = tab.url;
     var text = info.selectionText;
     var new_tab_url ='http://adamcroom.com/termsofservice/submit/'+
     '?highlight=' + text +
     '&url=' + url +
     '&question=Can you terminate your account';
     chrome.tabs.create({ url: new_tab_url});
 });
}
});

chrome.contextMenus.create({
 title: "Does the service track you on other websites?",
 contexts:["selection"],
 onclick: function(info) {
   chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
     var tab = tabs[0];
     var url = tab.url;
     var text = info.selectionText;
     var new_tab_url ='http://adamcroom.com/termsofservice/submit/'+
     '?highlight=' + text +
     '&url=' + url +
     '&question=3';
     chrome.tabs.create({ url: new_tab_url});
 });
}
});
