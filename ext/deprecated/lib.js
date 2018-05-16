function make_annotation_payload_with_only_tags(url, title, user, tags, group) {
        payload = {
			"document": {
				"title": title
				},
            "uri": url,
            "tags": tags,
//			"text": Date().toString(),
			"group": group,
			"permissions":
					{
					"read": ["group:" + group],
					"admin": ["acct:" + user + "@hypothes.is"],
					"update": ["acct:" + user + "@hypothes.is"],
					"delete": ["acct:" + user + "@hypothes.is"]
					}
		};
        return JSON.stringify(payload);
}

function make_annotation_payload_from_selection(url, title, user, start, end, prefix, quote, tags, group) {
    payload = {
			"group": group,
			"document": {
				"title": title
				},
		   "target": [{
			   "selector": [{
								"prefix": prefix,
								"exact": quote,
								"type": "TextQuoteSelector",
								"suffix": ''
								},
							{
								"start": start,
								"end": end,
								"type": "TextPositionSelector"
							}]
            }],
            "uri": url,
            "tags": tags,
            "text": '',
			"permissions":
					{
					"read": ["group:" + group],
					"admin": ["acct:" + user + "@hypothes.is"],
					"update": ["acct:" + user + "@hypothes.is"],
					"delete": ["acct:" + user + "@hypothes.is"]
					}
		};
    return JSON.stringify(payload);
}


// promisified xhr

function makeRequest (opts) {
//  alert('makeRequest: ' + opts.url);
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(opts.method, opts.url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
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

function unique(list) {
  var seen = {};
  return list.filter(function(x) {
    if (seen[x]) 
      return;
    seen[x] = true;
    return x;
  })
}

function heredoc(fn) {
 var a = fn.toString();
 var b = a.slice(14, -3);
 return b;
}


function gup(name, str) {
    if (! str) 
        str = window.location.href;
    else
        str = '?' + str;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(str);
    if (results == null)
        return "";
    else
        return results[1];
}


function have_credentials(user, token) {
	if ( (! user) || (! token ) ) {
		alert ( 'Please right-click the extension\'s icon and use Options to set your Hypothesis username and token' );
		return false;
	}
	else {
		return true;
	}
}

function make_picklist(tags, default_tag, picker_id, initial_pick, target_element) {
  var picklist = document.createElement('select');
  picklist.setAttribute('id', picker_id);
  if ( initial_pick != '' ) {
	var option = document.createElement('option');
	option.text = option.value = initial_pick;
	picklist.add(option);
	}
  for ( var i=0; i<tags.length; i++ ) {
	var tag = tags[i];
	option = document.createElement('option');
	option.text = option.value = tag;
	if ( tag == default_tag )
		option.selected = true;
	picklist.add(option)
	}
  var div = document.querySelector(target_element);
  div.appendChild(picklist);
  document.getElementById('go').onclick = function(e) { go() };
}

function make_tag_picklist(tags) {
	chrome.storage.sync.get(null,
		function(items) {
			var default_tag = items.tags_from_list_default;
			make_picklist(tags,
				  default_tag,
				  'tag_picker',
				  '--- choose a personal tag from your (options-specified) list ---',
				  '#tag_container');
	});
}

function make_gdoc_picklist(tags)  {
	chrome.storage.sync.get(null,
		function(items) {
			var default_tag = items.tags_from_gdoc_default;
			make_picklist(tags,
						  default_tag,
						  'gdoc_tag_picker',
						  '--- choose a shared tag from your (options-specified) doc ---',
						  '#gdoc_container');
	});
}

function make_host_picklist(tags) {
	chrome.storage.sync.get(null,
		function(items) {
			var default_tag = items.tags_from_host_default;
			make_picklist(tags,
						  default_tag,
						  'host_tag_picker',
						  '--- choose an investigation page from the host ---',
						  '#host_container');
	});
}


function make_group_picklist(groups) {
  var picklist = document.createElement('select');
  picklist.setAttribute('id', 'group_picker');
  for ( var i=0; i<groups.length; i++ ) {
	var group = groups[i];
	var option = document.createElement('option');
	option.text = group.name;
	option.value = group.id;
	picklist.add(option)
  }
  var div = document.querySelector('#group_container');
  div.appendChild(picklist);
  document.getElementById('go').onclick = function(e) { go() };
}


function go() {

	var user = null;
	var token = null;

	chrome.storage.sync.get({
		user:'',
		token:''
	  }, function(items) {
		user = items.user;
		token = items.token;
		_go(user, token);
	  });
}

function _go(user, token) {			 

	if ( ! have_credentials(user, token) ) {
		return;
	}

//	var tag_picker = document.getElementById('tag_picker');
//	var gdoc_picker = document.getElementById('gdoc_tag_picker');
	var host_picker = document.getElementById('host_tag_picker');
//	var group_picker = document.getElementById('group_picker');

	var tags = [];

	if ( typeof formatted_date != 'undefined' ) {
		tags.push('digipo:date:' + formatted_date);
	}

	var pick;
	var i;

	i = host_picker.selectedIndex;
	if (i > 0 ) {
		pick = host_picker.options[i].value;
		chrome.storage.sync.set( {'tags_from_host_default': pick});
		tags.push(pick);
	}
	else {
		chrome.storage.sync.set( {'tags_from_host_default': ''});
	}

/*	
	i = tag_picker.selectedIndex;
	if (i > 0 ) {
		pick = tag_picker.options[i].value;
		chrome.storage.sync.set( {'tags_from_list_default': pick});
		tags.push(pick);
	}
	else {
		chrome.storage.sync.set( {'tags_from_list_default': ''});
	}

	i = gdoc_tag_picker.selectedIndex;
	if (i > 0 ) {
		pick = gdoc_tag_picker.options[i].value;
		chrome.storage.sync.set( {'tags_from_gdoc_default': pick});
		tags.push(pick);
	}
	else {
		chrome.storage.sync.set( {'tags_from_gdoc_default': ''});
	}

	var k = group_picker.selectedIndex;
	var group = group_picker.options[k].value;
*/

	var group = '__world__';

	var params;

	if ( ( typeof start != 'undefined') && (typeof end != 'undefined' ) ) {
		params = make_annotation_payload_from_selection(
			unencoded_uri, 
			doctitle, 
			user, 
			start,
			end,
			prefix, 
			quote, 
			tags,
			group
			);
	}
	else {
		params = make_annotation_payload_with_only_tags(
			unencoded_uri,
			doctitle,
			user,
			tags,
			group
			);
	}
		
	var options = {
		method: 'POST',
		url: 'https://h.jonudell.info/create?token=' + token + '&url=' + encoded_uri,
		headers: {"Content-type":"application/json" },
		params: params
	};

	makeRequest(options)
		.then(function(data) {
			data = JSON.parse(data);
			return (data);
		})
       .then(function(data) {
			var wayback = document.getElementById('wayback');
			if (wayback && wayback.checked) {
				chrome.runtime.sendMessage(
				{
					'action':'wayback',
					'url' : unencoded_uri
				});
			}
			return (data);
		}) 
	   .then(function(data) {
		chrome.tabs.getCurrent(function(tab) {
			chrome.tabs.remove(tab.id, function() { });
			});
		})
		.catch(function (err) {
			console.error('error: ', err);
		});
}


function defined(x) {
	return (typeof x != 'undefined');
}

var list_containers = function(){/*
<p>
<div id="host_container"></div>

<div style="display:none">
<p>
Optionally:

<p>
<div id="tag_container"></div>

<p>
And/or:

<p>
<div id="gdoc_container"></div>

<p>
Post to group:
<div id="group_container"></div>
</div>
*/}

var interstitial_style = function(){/*
<style>
body { font-family:verdana; margin:.5in }
img { margin-bottom:40px }
.host { display:none}
</style>
*/}


function add_listeners() {
document.addEventListener('DOMContentLoaded', function () {

	chrome.runtime.sendMessage(
	{'action':'get_tags_from_host'},
	   function(tags) {
			make_host_picklist(tags);
	});

/*
	chrome.runtime.sendMessage(
	{'action':'get_tags_from_list'},
	   function(tags) {
			make_tag_picklist(tags);
	});

	chrome.runtime.sendMessage(
	{'action':'get_tags_from_gdoc'},
	   function(tags) {
			make_gdoc_picklist(tags);
	});

	chrome.runtime.sendMessage(
	{'action':'get_groups'},
	   function(groups) {
			make_group_picklist(groups);
	});
*/

});


}

function populate_elements() {
	document.querySelector('#page a').href = unencoded_uri;
	document.querySelector('#page a').text = doctitle;
	document.querySelector('#host').innerHTML = host;
	document.querySelector('#logo').src = img;
	document.querySelector('#list_containers').innerHTML = heredoc(list_containers);
	document.head.innerHTML += heredoc(interstitial_style);
}


function get_interstitial_args() {
	var encoded_uri = gup('uri');
	var unencoded_uri = decodeURIComponent(encoded_uri);
	var doctitle = decodeURIComponent(gup('doctitle'));
	var host = decodeURIComponent(gup('host'));
	var img = decodeURIComponent(gup('img'));
	var claim = decodeURIComponent(gup('claim'));
	return {
		encoded_uri		: encoded_uri,
		unencoded_uri	: unencoded_uri,
		doctitle		: doctitle,
		host			: host,
		img				: img,
		claim			: claim
	}
}