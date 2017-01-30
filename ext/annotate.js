var user = null;
var token = null;
var digipo_page = 0;
var tags = [];

var encoded_uri = gup('uri');
var unencoded_uri = decodeURIComponent(encoded_uri);
var doctitle = decodeURIComponent(gup('doctitle'));
var start = decodeURIComponent(gup('start'));
var end = decodeURIComponent(gup('end'));
var prefix = decodeURIComponent(gup('prefix'));
var quote = decodeURIComponent(gup('quote'));
document.querySelector('#selection').innerHTML = quote;
document.querySelector('#page a').href = unencoded_uri;
document.querySelector('#page a').text = doctitle;


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
	if ( digipo_pages.selectedIndex == 0 )

		{
		alert('You must choose a Digipo page');
		return;
		}

	save_selection(digipo_pages.selectedIndex);
	
	var i = digipo_pages.selectedIndex;

	if ( i > 0 ) {
		var page = digipo_pages.options[i].value;
		tags.push('digipo:analysis:' + page);
	}

	var options = {
		method: 'POST',
		url: 'https://h.jonudell.info/create?token=' + token + '&url=' + encoded_uri,
		params: null,
		headers: {"Content-type":"application/json" },
		params: make_annotation_payload_from_selection(
			unencoded_uri, 
			doctitle, 
			user, 
			start,
			end,
			prefix, 
			quote, 
			tags
			)
	  };

    makeRequest(options)
   .then(function (data) {
		var row = JSON.parse(data);
		var id = row.id;
		location.href = 'https://hyp.is/' + id;
	})
   .catch(function (err) {
	  console.error('annotate: there was an error!', err);
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


