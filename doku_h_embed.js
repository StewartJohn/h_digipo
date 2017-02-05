var timeline_dates = {};
var timeline_titles = {};
var reverse_timeline_dates = {};
var footnotes_links = [];
var footnotes = {}
var footnotes_count = 0;
var footnotes_flag = false;
var editing = location.href.indexOf('do=edit') != -1;

var excludes = [
	'digipo:analysis:start',
	'digipo:analysis:open_claims',
	'digipo:analysis:latest_news_analysis',
	'digipo:analysis:status_definitions',
	'do=recent',
	'do=revisions',
	'do=backlink',
//	'do=edit',
	'do=media',
	'do=admin',
	'do=profile'
	];
	
function unique(list) {
  var seen = {};
  return list.filter(function(x) {
    if (seen[x]) 
      return;
    seen[x] = true;
    return x;
  })
}

function is_date_tag(tag) {
	return ( tag.startsWith('googledate:') || tag.startsWith('digipo:date')	);
}

function has_date(row) {
  if ( ! row.hasOwnProperty('tags') )
	  return false;
  for (var i=0; i<row.tags.length; i++) {
    var tag = row.tags[i];	  
	if (is_date_tag(tag))
		return true;
    }
  return false;
 }

function get_row_uri(row) {
	return row.uri;
}

function get_date(tags) {
  for (var i=0; i<tags.length; i++) {
	var tag = tags[i];
	if (is_date_tag(tag))
		return tag;
    }
}

function h_embed() {

  footnotes_links = gather_footnotes();

  for (var i=0; i<footnotes_links.length; i++) {
	  var url = footnotes_links[i];
//      console.log(url);						
  }

  for ( var i=0; i<excludes.length; i++)
	  if ( location.href.indexOf(excludes[i]) != -1 )
		  return;

  var id = location.href.match(/id=(.+$)/)[1]
  id = id.replace(/([#&].+$)/, '');
  if ( ! id.startsWith('digipo:analysis') )
	  return;

  if (! editing )
	  embed_footnotes_container();

  console.log(id);

	  var options = {
		  method: 'GET',
		  url: 'https://hypothes.is/api/search?limit=200&tag=' + id
		};

//	  console.log('makeRequest', options.url);

	  makeRequest(options)
	  .then(function (data) {
		  var tag_search_promises = make_tag_search_promises(data);
		  return tag_search_promises;

	  })
	  .then(function (tag_search_promises) {
		  Promise.all(tag_search_promises)
			.then(function(){
			    var footnotes_promises = make_footnotes_promises(footnotes_links);
				Promise.all(footnotes_promises).then(function() {
					var dls = Object.keys(footnotes);
					for (var i=0; i<dls.length; i++) {
						var dl = dls[i];
						var obj = footnotes[dl];
						make_footnote(obj);
					}
				})
				.then(function(){
					if ( ! editing )
						show_footnotes();
				})
				.then(function(){
					if ( ! editing )
						make_timeline();
				})
				.then(function(){
					embed_viewer(id);
				})
				.catch(function(err){
					console.log(err);
				});
			})
	  });

}

function make_timeline() {
//           console.log('timeline entries', Object.keys(timeline_dates).length);

		   for (key in timeline_dates) {
			 if ( timeline_dates.hasOwnProperty(key) )
				 var date = timeline_dates[key]
							 .replace('googledate:','')
							 .replace('digipo:date:','')
							 ;
//				 console.log(key, date);
				 if ( reverse_timeline_dates[date] ) {
					 reverse_timeline_dates[date].push(key);
				 }
				 else {
					 reverse_timeline_dates[date] = [key];
				 }
			 }
		   var dates = []
		   for (key in reverse_timeline_dates) {
			   dates.push(key);
		   }

		   dates = dates.sort().reverse();

		   var timeline_header = document.createElement('h2');
		   timeline_header.id= 'timeline_header';
		   timeline_header.innerHTML = 'Timeline '  +
				toggle_control('timeline_header', 'timeline_container');

		   document.querySelector('.page').appendChild(timeline_header);

		   var timeline_container = document.createElement('div');
		   timeline_container.setAttribute('id','timeline_container');
		   document.querySelector('.page').appendChild(timeline_container);


		   if ( dates.length == 0 ) {
			   var timeline_help = document.createElement('p');
			   timeline_help.innerHTML = '<p>No annotations related to this investigation have been tagged with dates. <p>Please use the <a target="_blank" href="https://chrome.google.com/webstore/detail/digipo/dllkpndfjcodlhlfiiogdedeipjphkgk">Digipo Chrome Extension</a>\'s <i>Assign Publication Date</i> helper to organize key documents here in chronological order.';

			   timeline_container.appendChild(timeline_help);				   										
		   }
	

		   for (var i=0; i<dates.length; i++) {
			   var date = dates[i];
			   var urls = reverse_timeline_dates[date];
			   for (var j=0; j<urls.length; j++) {
				   var url = urls[j];
				   var title = timeline_titles[url];
				   if (! title ) title = '';
//				   console.log(date, url, title);
				   var dom_entry = document.createElement('p');
				   dom_entry.innerHTML = '<span style="font-size:smaller"><b>' + date + '</b></span><br> ' + '<span style="font-size:smaller"><a href="' + url +'">' + url + '</a> </span><br>' + title;
				   timeline_container.appendChild(dom_entry);				   
			   }
		   }
	
}

function make_tag_search_promises(data) {
	  var h_data = JSON.parse(data);
  var rows = h_data.rows;
//      console.log('makeRequest', rows.length, rows);
	  var uris = rows.map(get_row_uri);
	  var uniques = unique(uris);
//	  console.log('unique uris', uniques.length);
	  var promises = [];
	  for (var i=0; i<uniques.length; i++) {
		  var url = uniques[i];
//		  console.log(url);
		  var options = {
			method: 'GET',
			url: 'https://hypothes.is/api/search?limit=200&uri=' + encodeURIComponent(url)
		  };
		  promises.push(
			makeRequest(options)
			  .then(function(data) {
				  var rows = JSON.parse(data).rows;
				  for (var i=0; i<rows.length; i++) {
					  var row = rows[i];
					  var anno = parse_annotation(row);
					  var uri = anno.url;
					  var title = anno.title;
					  var has_timeline_date = has_date(row);
					  if ( has_timeline_date ) {
						var date = get_date(row.tags);
						timeline_dates[uri] = date;
						timeline_titles[uri] = title;
					  }
				  }
			  })
		   );
	  }
	  return promises;
	
}

function make_footnotes_promises(footnotes_links) {
  var promises = [];
  for (var i=0; i<footnotes_links.length; i++) {
	  var url = footnotes_links[i];
	  var id = url.match(/hyp.is\/([^\/]+)/)[1];
	  var options = {
		method: 'GET',
		url: 'https://hypothes.is/api/annotations/' + id
	  };
	  promises.push(
		makeRequest(options)
		   .then(function(data) {
		    var row = parse_annotation(JSON.parse(data));
//			console.log(row.id);
			url = row.url
			var dl = 'https://hyp.is/' + row.id + '/' + url.replace('https://','').replace('http://','');
			footnotes[dl] = { id: row.id, quote: row.quote, url: row.url, dl:dl };
			footnotes_count += 1;
			})
	   );
  }
  return promises;
}




function embed_viewer(id) {
	var options = {
		  method: 'GET',
		  url: 'https://hypothes.is/api/search?tag=' + id
		};

	makeRequest(options)
	   .then(function (data) {
		  var obj = JSON.parse(data);
		  var related_header = document.createElement('h2');
		  related_header.setAttribute('id', 'related_header');
		  related_header.innerHTML = 'Related Annotations' +
				toggle_control('related_header', 'related_container');
		  document.querySelector('.page').appendChild(related_header);

		  var related_container = document.createElement('div')
		  related_container.setAttribute('id', 'related_container');
		  document.querySelector('.page').appendChild(related_container);

		  var help = document.createElement('p');
		  if (obj.total>0) {
			  help = document.createElement('p');
			  help.innerHTML = 'Here are annotations for the Hypothesis tag <a href="https://hypothes.is/search?q=tag:' + id + '">' + id + '</a>';
			  related_container.appendChild(help);
			  var iframe = document.createElement('iframe');
			  iframe.src = 'https://hypothes.is/search?q=tag:' + id;
			  iframe.style.width = '100%';
			  iframe.style.height = '600px';
			  iframe.style.margin = '20px';
			  related_container.appendChild(iframe);
			  }
		  else {
			  help.innerHTML = '<p>There are no annotations yet for the Hypothesis tag <b><i>' + id + '</i></b>. <p>Please use the <a target="_blank" href="https://chrome.google.com/webstore/detail/digipo/dllkpndfjcodlhlfiiogdedeipjphkgk">Digipo Chrome Extension</a>\'s <i>Tag this Selection</i> or <i>Tag this Page</i> helpers to gather annotations related to this investigation.'
				  related_container.appendChild(help);
			  }

		})
		.then(function(){
			if (! is_logged_in() ) {
				hide('timeline_header', 'timeline_container');
				hide('related_header', 'related_container');
			}
		})
	   .catch(function (err) {
			console.error('error!', err);
		});
}
  

// promisified xhr
// http://stackoverflow.com/questions/30008114/how-do-i-promisify-native-xhr

function makeRequest (opts) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(opts.method, opts.url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
//		console.log('makeRequest', opts.url, this.status);
        resolve(xhr.response);
      } else {
		console.log('makeRequest',opts.url, this.status);
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
	  console.log('makeRequest',opts.url, this.status);
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    if (opts.headers) {
      Object.keys(opts.headers).forEach(function (key) {
        xhr.setRequestHeader(key, opts.headers[key]);
      });
    }
    var params = opts.params;
    if (params && typeof params === 'object') {
      params = Object.keys(params).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }).join('&');
    }
    xhr.send(params);
  });
}

function parse_annotation(row) {
    var id = row['id'];
    var url = row['uri'];
    var updated = row['updated'].slice(0, 19);
    var group = row['group'];
    var title = url;
    var refs = row.hasOwnProperty('references') ? row['references'] : [];
    var user = row['user'].replace('acct:', '').replace('@hypothes.is', '');
    var quote = '';
    if ( // sigh...
            row.hasOwnProperty('target') &&
            row['target'].length
            ) {
        var selectors = row['target'][0]['selector'];
        if (selectors) {
            for (var i = 0; i < selectors.length; i++) {
                selector = selectors[i];
                if (selector['type'] == 'TextQuoteSelector')
                    quote = selector['exact'];
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
        group: group
    }
}

function gather_footnotes() {
	var footnotes_links = [];
	var dls = document.querySelectorAll('a[href^="https://hyp.is"]');
	for (i=0; i<dls.length; i++) {
		var dl = dls[i];
		footnotes_links.push(dl.href);
		var id = dl.href.match(/hyp.is\/([^\/]+)/)[1];		
		var num = i+1;
		dl.outerHTML += '<sup>(<a href="#fn_' + id + '">' + num + '</a>)</sup>';
	}
	return footnotes_links;
}

function make_footnote(obj) {
	var url = obj.url.replace('https://','').replace('http://','');
	var num = footnotes_links.indexOf(obj.dl);
	num += 1;
	var div = document.createElement('div');
	div.id = 'fn_' + obj.id;
	div.innerHTML = '<a name="fn_' + obj.id + '">'
				+ '<p class="footnote" style="font-size:smaller">'
				+ num
				+ ' '
				+ url
				+ '\n</p>'
				+ '<blockquote style="font-family:italic">'
				+ obj.quote
				+ '</blockquote>'
				;
	footnotes[obj.dl].note = div;
//	console.log( num, Object.keys(footnotes).length, obj.id, url );
}

function embed_footnotes_container() {
//	console.log('embed_footnotes_container');
	var footnotes_header = document.createElement('h2');
	footnotes_header.innerHTML = 'Footnotes'
	document.querySelector('.page').appendChild(footnotes_header);
	var footnotes_container = document.createElement('div');
	footnotes_container.id = 'footnotes_container';
	document.querySelector('.page').appendChild(footnotes_container);
}

function show_footnotes() {
    var dls = footnotes_links;
	for ( var i=0; i<dls.length; i++ ) {
		var dl = dls[i];
		var footnote = footnotes[dl];
		document.querySelector('#footnotes_container').appendChild(footnote.note);					
	}
}

function check_footnotes() {
	if ( Object.keys(footnotes).length != footnotes_links.length ) {
		window.setTimeout(check_footnotes, 500);
	}
	else {
		show_footnotes();
	}
}

function is_logged_in() {
  return (document.querySelector('.user') != undefined);
}

function show(header_id,container_id) {
  document.getElementById(header_id).querySelector('span a').innerHTML = '-';
  document.getElementById(container_id).style.display = 'block';
}

function hide(header_id,container_id) {
  document.getElementById(header_id).querySelector('span a').innerHTML = '+';
  document.getElementById(container_id).style.display = 'none';
}

function toggle(header_id, container_id) {
  var header = document.getElementById(header_id);
  var container = document.getElementById(container_id);
  if ( container.style.display == 'none' ) {
	show(header_id, container_id);
  }
  else {
	hide(header_id, container_id);
  }

}


function toggle_control(header_id, container_id) {
	return 	' <span style="font-size:smaller;">' +
				'<a style="text-decoration:none" ' +
				' href="javascript:toggle(' +
				'\'' + 
				header_id +
				'\'' +
				',' +
				'\'' +
				container_id +
				'\'' +
				')">' +
				'-' +
				'</a>' +
				'</span>'
				;
}





h_embed();


