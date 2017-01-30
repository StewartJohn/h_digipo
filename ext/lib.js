function make_annotation_payload_with_only_tags(url, title, user, tags) {
        payload = {
			"document": {
				"title": title
				},
            "uri": url,
            "tags": tags,
			"text": Date().toString(),
			"permissions":
					{
					"read": ["group:__world__"],
					"admin": ["acct:" + user + "@hypothes.is"],
					"update": ["acct:" + user + "@hypothes.is"],
					"delete": ["acct:" + user + "@hypothes.is"]
					}
		};
        return JSON.stringify(payload);
}

function make_annotation_payload_from_selection(url, title, user, start, end, prefix, quote, tags) {
        payload = {
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
					"read": ["group:__world__"],
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

function list_digipo_pages(tags) {
  var picklist = document.createElement('select');
  picklist.setAttribute('id', 'digipo_pages');
  var option = document.createElement('option');
  option.text = option.value = '--- CHOSE DIGIPO PAGE ---';
  picklist.add(option)
  for ( var i=0; i<tags.length; i++ ) {
	var tag = tags[i];
	option = document.createElement('option');
	option.text = option.value = tag;
	picklist.add(option)
  }

  picklist.selectedIndex = digipo_page;

  var div = document.querySelector('#digipo_page_container');

  div.appendChild(picklist);

  document.getElementById('go').onclick = function(e) { go() };

}


function have_credentials(user, token) {
	if ( user == ''  || token == '' ) {
		alert ( 'Please right-click the Digipo icon and use Options to set your Hypothesis username and token' );
		return false;
	}
	else {
		return true;
	}
}