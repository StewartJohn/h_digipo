var user = params.user;
var token = params.token;
var url = params.url;
var doctitle = params.doctitle;
var selection = params.selection;

function assign_pubdate() {

	if ( ! have_credentials(user, token) ) { return; }

	var date = new Date (Date.parse(selection));
	if ( date == 'Invalid Date' ) {
		alert('Cannot interpret "' + selection + '" as a date');
	}

  var formatted_date = date.toISOString().substr(0,10);

  var options = {
	method: 'POST',
	url: 'https://h.jonudell.info/create?token=' + token + '&url=' + url,
	params: null,
	headers: {"Content-type":"application/json" },
	params: make_annotation_payload_with_only_tags(url, doctitle, user, ['digipo:date:' + formatted_date])
  };

  makeRequest(options)
   .then(function (data) {
	var row = JSON.parse(data);
	var id = row.id;
	location.href = 'https://hyp.is/' + id;
	})
   .catch(function (err) {
	  console.error('assign_pubdate: there was an error!', err);
   });
}

assign_pubdate();