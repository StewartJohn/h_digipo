var user = params.user;
var token = params.token;
var url = params.url;
var doctitle = params.doctitle;

function create(user, token, url) {

	if ( ! have_credentials(user, token) ) { return; }

	url = url.replace(/\?.+$/,'');

	var options = {
	  method: 'GET',
	  url: 'https://graph.facebook.com/?id='+encodeURIComponent(url)
	};

	makeRequest(options)
	   .then(function (data) {
		  var obj = JSON.parse(data);
		  if ( ! obj.hasOwnProperty('share') ) {
			alert ('no facebook shares for this page');
			return;
			}

		  var sharecount = obj.share.share_count;
		  console.log('create: ' + url);	
		  var options = {
				method: 'POST',
				url: 'https://h.jonudell.info/create?token=' + token + '&url=' + url,
				params: null,
				headers: {"Content-type":"application/json" },
				params: make_annotation_payload_with_only_tags(url, doctitle, user, ['fbshare:' + sharecount])
		  };
		  makeRequest(options)
		   .then(function(data) {
				var row = JSON.parse(data);
				var id = row.id;
				location.href = 'https://hyp.is/' + id;
		   })
		   .catch(function (err) {
			  console.error('fbshare: there was an error!', err);
		  });
	  });
}

create(user, token, url);




