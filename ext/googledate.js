if (params) {
	var user = params.user;
	var token = params.token;
	var doctitle = params.doctitle;
}
else {
	var params = {};
}

function googledate() {

  var dom_date = document.querySelector('span.f');
  if (! dom_date )
	return;
  else 
    dom_date = dom_date.innerText;
  dom_date = dom_date.replace(' - ','')
  var js_date = new Date(Date.parse(dom_date));
  var formatted_date =  js_date.toISOString().substr(0,10)
  var target_url = document.querySelector('h3 a[href]').attributes['href'].value;
  target_url = target_url.replace(/\/$/, ''); // remove trailing slash
  target_url = target_url.replace(/twitter.com\/([^\/]+)/, function(a,b) { return 'twitter.com/' + b.toLowerCase();}) // if twitter, use canonical lowercase url

  console.log (formatted_date);

  var options = {
	method: 'POST',
	url: 'https://h.jonudell.info/create?token=' + token + '&url=' + target_url,
	params: null,
	headers: {"Content-type":"application/json" },
	params: make_annotation_payload_with_only_tags(
		target_url, 
		doctitle, 
		user, 
		['googledate:' + formatted_date],
		'__world__')
  };

  makeRequest(options)
   .then(function (data) {
	var row = JSON.parse(data);
	window.close()
  })
   .catch(function (err) {
	  console.error('googledate: there was an error!', err);
   });
}


googledate();