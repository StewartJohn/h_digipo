chrome.runtime.onInstalled.addListener(function() {
});

var parent1 = chrome.contextMenus.create({"title": "Category 1", "contexts": ["selection"]});
var parent2 = chrome.contextMenus.create({"title": "Category 2", "contexts": ["selection"]});

chrome.contextMenus.create({
 title: "Are the terms easy to read?",
 parentId: parent1,
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
 parentId: parent2,
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
 parentId: parent2,
 contexts:["selection"],
 onclick: function(info) {
   chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
     var tab = tabs[0];
     var url = tab.url;
     var text = info.selectionText;
     var new_tab_url ='http://adamcroom.com/termsofservice/submit/'+
     '?highlight=' + text +
     '&url=' + url +
     '&question=Does the service track you on other websites?';
     chrome.tabs.create({ url: new_tab_url});
 });
}
});
