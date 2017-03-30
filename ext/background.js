var host = 'http://digipo.io/doku.php?id=';
var host_namespace = 'digipo:';
var investigation_namespace = 'digipo:analysis';
var control_namespace = 'control:investigations';

var investigation_page_re = 'id=(' + investigation_namespace + ':[^\\"]+)\\"';
var img = 'http://digipo.io/lib/exe/fetch.php?media=wiki:logo.png';
var tags_from_host_url = host + control_namespace;

chrome.storage.sync.get({
    user:'',
    token:'',
    digipo_page:''
  }, function(items) {
    user = items.user;
    token = items.token;
	digipo_page = items.digipo_page;
  });

chrome.runtime.onMessage.addListener(
  function(request, sender, callback) {
//alert('request.action: ' + request.action);
	switch (request.action) {

	  case 'wayback':
		  post_to_wayback(request.url);
		break;

	  case 'get_tags_from_host':
		var tags_from_host = get_tags_from_host(tags_from_host_url);
		callback(tags_from_host);
		break;

	  case 'receive_selection':
		var start = request.position_selector.start;
		var end = request.position_selector.end;
		var prefix = request.quote_selector.prefix;
		var quote = request.quote_selector.exact;
		var tab_url = request.tab_url;
		var doctitle = safe_doc_title(request.doctitle);
		selection = [quote, prefix, tab_url, doctitle];
		callback(selection);
		var new_tab_url = 
			chrome.extension.getURL('selection_to_related.html')+	 
				'?uri='			+ encodeURIComponent(tab_url)	+ 
				'&doctitle='	+ encodeURIComponent(doctitle)	+
				'&prefix='		+ encodeURIComponent(prefix)	+
				'&quote='		+ encodeURIComponent(quote)		+
				'&start='		+ encodeURIComponent(start)		+
				'&end='			+ encodeURIComponent(end)       +
				'&host='		+ encodeURIComponent(host)		+
				'&img='			+ encodeURIComponent(img)       
				;
		chrome.tabs.create({ url: new_tab_url}, function(tab){
		});
		break;

	  case 'receive_pubdate':
		var formatted_date = request.formatted_date
		var tab_url = request.tab_url;
		var doctitle = safe_doc_title(request.doctitle);
		callback(formatted_date);
		var new_tab_url = 
			chrome.extension.getURL('date_to_timeline.html')		+	 
				'?uri='			+ encodeURIComponent(tab_url)		+ 
				'&doctitle='	+ encodeURIComponent(doctitle)		+
				'&date='		+ encodeURIComponent(formatted_date) +
				'&host='		+ encodeURIComponent(host)			+
				'&img='			+ encodeURIComponent(img)
				;
		chrome.tabs.create({ url: new_tab_url}, function(tab){
		});
		break;

	  default:
		alert('unknown action', request.action);
	}
});


// selection

chrome.contextMenus.create({
	title: "Add this Selection to Related Annotations", 
	contexts:["selection"],
	onclick: function() {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			var params =
				"var params = {tab_url:'TAB_URL',doctitle:'DOCTITLE'};"
						.replace('TAB_URL',tab.url)
						.replace('DOCTITLE',safe_doc_title(tab.title))
			chrome.tabs.executeScript(tab.id, {file:'anchoring.js'}, function() {						
				chrome.tabs.executeScript(tab.id, {code:params}, function() {
					chrome.tabs.executeScript(tab.id, {file:'get_selection.js'});
				});
			});
		});
     }
 });

chrome.contextMenus.create({
	title: "Add Selected Date to Timeline", 
	contexts:["selection"],
	onclick: function(info) {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			var tab_url = tab.url;
			chrome.tabs.executeScript(tab.id, {file:'lib.js'}, function() {
				var params =
					"var params = {tab_url:'TAB_URL',doctitle:'DOCTITLE',selection:'SELECTION'};"
						.replace('TAB_URL',tab_url)
						.replace('DOCTITLE', safe_doc_title(tab.title))
						.replace('SELECTION', info.selectionText)
						;
				chrome.tabs.executeScript(tab.id, {code:params}, function() {
					chrome.tabs.executeScript(tab.id, {file: "get_pubdate.js"});
				});
			});				
		});
	 }
});


chrome.contextMenus.create({
	title: "Search Debunking Sites for this Selection", 
	contexts:["selection"],
	onclick: function() {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			chrome.tabs.executeScript(tab.id, {file: "selection_search.js"});
		});
	 }
});

chrome.contextMenus.create({
	title: "Find Selection in Google Scholar", 
	contexts:["selection"],
	onclick: function(info) {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			chrome.tabs.update(tab.id,
				{url:'https://scholar.google.com/scholar?q=' + info.selectionText});
		});
	}
});

chrome.contextMenus.create({
	title: "Find Book in Library", 
	contexts:["selection"],
	onclick: function(info) {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			chrome.tabs.update(tab.id,
				{url:'https://www.worldcat.org/search?q=ti%3A' + info.selectionText});
		});
	}
});

chrome.contextMenus.create({
	title: "Find Book in Google Books", 
	contexts:["selection"],
	onclick: function(info) {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			chrome.tabs.update(tab.id,
				{url:'https://www.google.com/search?tbm=bks&q=ti%3A' + info.selectionText});
		});
	}
});



// page

chrome.contextMenus.create({
	title: "Google this Site", 
	contexts:["page"],
	onclick: function() {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			chrome.tabs.executeScript(tab.id, {file:'parse_domain.js'}, function() {
				var parsed_domain = parse_domain.parse_domain(tab.url);
				var domain = parsed_domain.domain;
				var tld = parsed_domain.tld;
				var site = domain + '.' + tld;
				chrome.tabs.update(tab.id,
					{url:'https://www.google.com/search?q=' + site + ' -site:' + site });
			});
		});				
	}
});

chrome.contextMenus.create({
	title: "Add this Page to Related Annotations", 
	contexts:["page"],
	onclick: function() {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			var new_tab_url = chrome.extension.getURL('page_to_related.html')	+ 
							'?uri=' + encodeURIComponent(tab.url)				+ 
							'&doctitle=' + encodeURIComponent(tab.title)		+
							'&host=' + host										+
							'&img=' + img
							;
			chrome.tabs.create({ url: new_tab_url}, function(tab){
				// nothing to do here?
			});
		});
	}
});


chrome.contextMenus.create({
	title: "Add this Page to Timeline", 
	contexts:["page"],
	onclick: function(info) {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			var tab_url = tab.url;
			chrome.tabs.executeScript(tab.id, {file:'lib.js'}, function() {
				var params =
					"var params = {tab_url:'TAB_URL',doctitle:'DOCTITLE',selection:'SELECTION'};"
						.replace('TAB_URL',tab_url)
						.replace('DOCTITLE', safe_doc_title(tab.title))
						.replace('SELECTION', info.selectionText)
						;
				chrome.tabs.executeScript(tab.id, {code:params}, function() {
					chrome.tabs.executeScript(tab.id, {file: "get_pubdate.js"});
				});
			});				
		});
	 }
});

chrome.contextMenus.create({
	title: "Convert PDF to HTML (then Add Selection to Related Annotations)", 
	documentUrlPatterns: ["chrome-extension://*/index.html"],
	contexts:["page"],
	onclick: function() {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			var new_tab_url = chrome.extension.getURL('/web/viewer.html') + '?file=' +  encodeURIComponent(tab.url);
			chrome.tabs.update({ url: new_tab_url}, function(tab){
				 // nothing to do here
			});
		});
	}
});


chrome.contextMenus.create({
	title: "Find Publication Date", 
	contexts:["page"],
	onclick: function() {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			chrome.tabs.update(tab.id,
				{url:"https://www.google.com/search?tbs=cdr:1,cd_min:1/1/2000&q=site:" +
							   encodeURIComponent(tab.url)});
		});
	}
});


chrome.contextMenus.create({
	title: "Save Publication Date", 
	contexts:["page"],
	onclick: function() {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			chrome.tabs.executeScript(tab.id, {file:'lib.js'}, function() {
				var params = "var params = {user:'USER',token:'TOKEN'};"
							 .replace('USER',user)
							 .replace('TOKEN',token);
				chrome.tabs.executeScript(tab.id, {code:params }, function() {
					chrome.tabs.executeScript(tab.id, {file: "googledate.js"});
				});
			});				
		});
	}
});


chrome.contextMenus.create({
	title: "Save Facebook Share Count", 
	contexts:["page"],
	onclick: function() {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			chrome.tabs.executeScript(tab.id, {file:'lib.js'}, function() {
				var params = "var params = {user:'USER',token:'TOKEN',url:'URL',doctitle:'DOCTITLE'};"
						 .replace('USER',user)
						 .replace('TOKEN',token)
						 .replace('URL',tab.url)
						 .replace('DOCTITLE', tab.title);
				chrome.tabs.executeScript(tab.id, {code:params}, function() {
					chrome.tabs.executeScript(tab.id, {file: "fbshare.js"});
				});
			});				
		});
	 }
});

function sync_xhr_rows(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send(null);
  var data = JSON.parse(xhr.responseText);
  return data.rows;
}

function sync_xhr_text(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send(null);
  return xhr.responseText;
}

function sync_xhr_annotation(id) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://hypothes.is/api/annotations/' + id, false);
  xhr.send(null);
  return JSON.parse(xhr.responseText);
}

function get_tags_from_host(url) {
  var data = sync_xhr_text(url);
  var tags = [];
  var re = new RegExp(investigation_page_re, 'g');
  var tag = re.exec(data);
  while (tag != null) {
	  tags.push(tag[1]);
	  tag = re.exec(data);
  }

  tags = tags.filter(function(x) {
	  if ( x != 'latest_news_analysis' &&
		   x != 'start' &&
		   x != 'source_shortname' &&
		   x != 'source_shortname' &&
		   x != 'open_claims'
		  ) 
		  return x;
	  });

  tags = unique(tags).sort();
  
  return tags;
}


function post_to_wayback(url) {

	var options = {
		method: 'GET',
		url: 'https://web.archive.org/save/' + url
		};

	makeRequest(options)
		.then( function(data) {});
}

function safe_doc_title(title) {
	return title.split("'").join('\\\'');
}
