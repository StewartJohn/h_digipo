var user = null;
var token = null;
var digipo_page = null;
var selection = {}
var current_tab = null;

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
	  case 'get_digipo_tags':
		var tags;
		try { tags = get_digipo_tags(); }
		catch (e) { alert(e); }
		callback(tags);
		break;
	  case 'get_digipo_claims':
		var claims;
		try { claims = get_digipo_claims(request.url); }
		catch (e) { alert(e); }
		callback(claims);
		break;
	  case 'receive_selection':
		var start = request.position_selector.start;
		var end = request.position_selector.end;
		var prefix = request.quote_selector.prefix;
		var quote = request.quote_selector.exact;
		var tab_url = request.tab_url;
		var doctitle = request.doctitle;
		selection = [quote, prefix, tab_url, doctitle];
		callback(selection);
		var new_tab_url = 
			chrome.extension.getURL('annotate.html')			+	 
				'?uri='			+ encodeURIComponent(tab_url)	+ 
				'&doctitle='	+ encodeURIComponent(doctitle)	+
				'&prefix='		+ encodeURIComponent(prefix)	+
				'&quote='		+ encodeURIComponent(quote)		+
				'&start='		+ encodeURIComponent(start)		+
				'&end='			+ encodeURIComponent(end)
				;
		chrome.tabs.create({ url: new_tab_url}, function(tab){
			// nothing to do here?
		});

		
		break;
	  default:
		alert('unknown action', request.action);
	}
  });

// selection

chrome.contextMenus.create({
	title: "Tag this Selection", 
	contexts:["selection"],
	onclick: function() {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			var params =
				"var params = {tab_url:'TAB_URL',doctitle:'DOCTITLE'};"
						.replace('TAB_URL',tab.url)
						.replace('DOCTITLE',tab.title)
			chrome.tabs.executeScript(tab.id, {file:'anchoring.js'}, function() {						
				chrome.tabs.executeScript(tab.id, {code:params}, function() {
					chrome.tabs.executeScript(tab.id, {file:'get_selection.js'});
				});
			});
		});
     }
 });


chrome.contextMenus.create({
	title: "Assign Publication Date", 
	contexts:["selection"],
	onclick: function(info) {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			var url = tab.url;
			chrome.tabs.executeScript(tab.id, {file:'lib.js'}, function() {
				var params =
					"var params = {user:'USER',token:'TOKEN',url:'URL',doctitle:'DOCTITLE',selection:'SELECTION'};"
						.replace('USER',user)
						.replace('TOKEN',token)
						.replace('URL',url)
						.replace('DOCTITLE',tab.title)
						.replace('SELECTION', info.selectionText)
						;
				chrome.tabs.executeScript(tab.id, {code:params}, function() {
					chrome.tabs.executeScript(tab.id, {file: "assign_pubdate.js"});
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
			chrome.tabs.executeScript(tab.id, {file:'get_selection.js'}, function() {
				chrome.tabs.executeScript(tab.id, {file:'lib.js'}, function() {
					chrome.tabs.executeScript(tab.id, {file: "selection_search.js"});
				});				
			});				
			
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
			var a = document.createElement('a');
			a.href=tab.url;
			chrome.tabs.update(tab.id,
				{url:'https://www.google.com/search?q=' + a.hostname + ' -site:' + a.hostname});
		});
	}
});




chrome.contextMenus.create({
	title: "Tag this Page", 
	contexts:["page"],
	onclick: function() {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			var new_tab_url = chrome.extension.getURL('tagpage.html') + '?uri=' + encodeURIComponent(tab.url) + '&doctitle=' + encodeURIComponent(tab.title);
			chrome.tabs.create({ url: new_tab_url}, function(tab){
				// nothing to do here?
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

/*
chrome.contextMenus.create({
	title: "Summarize Quotes", 
	contexts:["page"],
	onclick: function() {
		chrome.tabs.query({active:true}, function(tabs) {
			var tab = tabs[0];
			chrome.tabs.executeScript(tab.id, {file:'lib.js'}, function() {
				var lib = heredoc(lib_for_heredoc);
				var params =
					"var params = {user:'USER',token:'TOKEN',url:'URL',lib:'LIB'};"
						.replace('USER',user)
						.replace('TOKEN',token)
						.replace('URL',tab.url)
						.replace('LIB',btoa(lib));
				chrome.tabs.executeScript(tab.id, {code:params}, function() {
					chrome.tabs.executeScript(tab.id, {file: "summarize_quotes.js"});
				});
			});				
		});
	 }
});
*/

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


function get_digipo_tags() {

  var data = sync_xhr_text('http://digipo.io/doku.php?id=digipo:analysis:latest_news_analysis');

  var re = new RegExp(/a href=\"\/doku.php\?id=digipo:analysis:([^\"\?\&]+)/g);
  var tags = [];
  var tag = re.exec(data);
  while (tag != null) {
	  tags.push(tag[1]);
	  tag = re.exec(data);
  }

  tags = tags.filter(function(x) {
	  if ( x != 'latest_news_analysis' &&
		   x != 'start' &&
		   x != 'source_shortname' &&
		   x != 'open_claims'
		  ) 
		  return x;
	  });

  tags = unique(tags).sort();

  return tags;

}

function get_digipo_claims(url) {

	var rows = sync_xhr_rows('https://hypothes.is/api/search?limit=200&uri=' +
				   encodeURIComponent(url)	);

	var html = '';

	for ( var i=0; i<rows.length; i++ ) {

		var row = parse_annotation(rows[i]);

		if ( row.quote == '' )
			continue;

		var html = process_row(row, html);
	}

	return html;
}

function process_row(row, html) {
	var lines = row.text.split('\n');

	for (var j=0; j<lines.length; j++ ) {
		html = process_line(row, lines[j], html);
	}

	return html;
}

function process_line(row, line, html) {
			html += '<div id"' + row.id + '">';

			var direct_link = line.match(/https:\/\/hyp.is\/([^\/]+)/);

			if ( line.match(/http/) != null ) {
				line = line.replace(/\((http[^\)]+)\)/, '<a href="$1">$1</a>');
			}

			if ( line.startsWith('#') ) {
				line = line.replace(/^#+/, '');

				html += '<h3>Claim: '
						+ line
						+ '</h3>'
						+ '<p><b>Quoted in this page</b>: '
						+ '<i>'
						+ row.quote
						+ '</i> '
						+ '<a style="font-size:smaller" color:black" target="_blank" href="https://hyp.is/' + row.id
						+ '">'
						+ 'link'
						+ '</a>'
						+ '</p>'
						;
			}
			else {
				html += '<p>' + line + '</p>';
			}

			if (direct_link) {
				var id = direct_link[1];
				var url = 'https://hypothes.is/api/annotations/' + id;
				var row = parse_annotation(sync_xhr_annotation(id));
				html += '<div style="margin-top:20px;margin-left:40px" class="direct_link">'
						+ '<p><b>Quoted in the linked page</b>: '
						+ '<i>'
						+ row.quote
						+ '</i> '
						+ '<a style="font-size:smaller" color:black" target="_blank" href="https://hyp.is/' + row.id
						+ '">'
						+ 'link'
						+ '</a>'
						+ '</p>'
						+ '</div>';
			}

			html += '</div>';
			return html;
}

function heredoc(fn) {
 var a = fn.toString();
 var b = a.slice(14, -3);
 return b;
}


function parse_annotation(row) {
    var id = row.id;
    var url = row.uri;
    var updated = row.updated.slice(0, 19);
    var group = row.group;
    var title = url;
    var refs = row.hasOwnProperty('references') ? row['references'] : [];
    var user = row.user.replace('acct:', '').replace('@hypothes.is', '');
    var quote = '';
    if ( // sigh...
            row.hasOwnProperty('target') &&
            row.target.length
            ) {
        var selectors = row.target[0]['selector'];
        if (selectors) {
            for (var i = 0; i < selectors.length; i++) {
                selector = selectors[i];
                if (selector.type == 'TextQuoteSelector')
                    quote = selector.exact;
            }
        }
    }
    var text = row.hasOwnProperty('text') ? row.text : '';
    var tags = [];
    try {
        title = row.document.title;
        if ( typeof(title) == 'object' )
            title = title[0];
        refs[id] = refs;
        tags = row.tags;
    }
    catch (e) {
        console.log(e);
    }
    var permissions = row.permissions;
    return {
        id: id,
        url: url,
        updated: updated,
        title: title,
        refs: refs,
        user: user,
        text: text,
        quote: quote,
        tags: tags,
        group: group,
        permissions: permissions
    }
}


