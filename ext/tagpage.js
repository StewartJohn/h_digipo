var user = null;
var token = null;
var digipo_page = 0;
var tags = [];

var encoded_uri = gup('uri');
var unencoded_uri = decodeURIComponent(encoded_uri);
var doctitle = decodeURIComponent(gup('doctitle'));

var doc = document.getElementById('doc');
doc.innerHTML = doc.innerHTML.replace('__PAGE__', '<a href="' + unencoded_uri + '">' + doctitle + '</a>');

chrome.storage.sync.get({
    user:'',
    token:'',
    digipo_page:0
  }, function(items) {
		user = items.user;
		token = items.token;
		digipo_page = items.digipo_page;
	});

function save_selection(digipo_page_index) {
	chrome.storage.sync.set( {digipo_page: digipo_page_index }, function() { });
}

function go() {

	if ( ! have_credentials(user, token) ) { return; }
	
	var digipo_pages = document.getElementById('digipo_pages');
	var digipo_categories = document.getElementById('digipo_categories');
	if ( digipo_pages.selectedIndex == 0 && 
		   digipo_categories.selectedIndex == 0 
		   )
		{
		alert('You must choose a Digipo page, or a category, or both');
		return;
		}

	save_selection(digipo_pages.selectedIndex);
	
	var i = digipo_pages.selectedIndex;

	if ( i > 0 ) {
		var page = digipo_pages.options[i].value;
		tags.push('digipo:analysis:' + page);
	}

	if ( digipo_categories.selectedIndex > 0 ) {
		var j = digipo_categories.selectedIndex;
		var category = digipo_categories.options[j].value;
		tags.push(category);
	}


	var options = {
		method: 'POST',
		url: 'https://h.jonudell.info/create?token=' + token + '&url=' + encoded_uri,
		headers: {"Content-type":"application/json" },
		params: make_annotation_payload_with_only_tags(unencoded_uri, doctitle, user, tags)
	};

	var direct_link;

	makeRequest(options)
	   .then(function(data) {
			var row = JSON.parse(data);
//			location.href = 'https://hyp.is/' + row.id;
			direct_link = location.href = 'https://hyp.is/' + row.id;
		})
		.then(function(){
			if ( document.getElementById('wayback').checked ) {
				var wayback_options = {
					method: 'GET',
					url: 'https://web.archive.org/save/' + unencoded_uri,
				};
				makeRequest(wayback_options)
					.then(function(data, extra) {
						location.href = direct_link;
					});
			}
		})
		.catch(function (err) {
			console.error('tagpage: there was an error!', err);
		});
}


document.addEventListener('DOMContentLoaded', function () {
	chrome.runtime.sendMessage(
	{'action':'get_digipo_tags'},
	function(tags) {
		console.log(tags);
		list_digipo_pages(tags);
	});
});

