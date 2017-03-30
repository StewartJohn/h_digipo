debugger;

var user = params.user;
var token = params.token;
var tab_url = params.tab_url;
var doctitle = params.doctitle;
var selection = params.selection;

var date_form = function(){/*
<a name="date_form"/>
year <input style="width:6em" type="text" size="4" id="digipo_year"></input>
month <input style="width:3em" type="text" size="2" id="digipo_month"></input>
day <input style="width:3em" type="text" size="2" id="digipo_day"></input> 
<input id="send_date_from_form" type="button" value="go">
*/}

function send_date_from_form() {
	var year = document.getElementById('digipo_year').value;
	var month = document.getElementById('digipo_month').value;
	var day = document.getElementById('digipo_day').value;
	var date = new Date (Date.parse(year + '/' + month + '/' + day));
	if ( date == 'Invalid Date') {
		alert ('not a valid date, please retry');
	}
	else {
	var formatted_date = date.toISOString().substr(0,10);
	send_date(formatted_date);
	}
}

function make_date_form() {
	var div = document.createElement('div');
	div.style['background-color'] ='white';
	div.style['z-index'] = '2147483647';
	div.style['position'] = 'absolute';
	div.innerHTML = heredoc(date_form);
	document.body.insertBefore(div, document.body.firstChild);
	document.getElementById('send_date_from_form').onclick = function(e) { send_date_from_form() };	
	location.href = '#date_form';
}

function send_date(formatted_date) {
	chrome.runtime.sendMessage(
		{
			action:'receive_pubdate',
			tab_url: tab_url,
			doctitle: doctitle,
			formatted_date: formatted_date
		},
		function(data) {
	//		console.log(data);
		});
}

if ( selection == 'undefined' ) {
	make_date_form();
}
else {
	var date = new Date (Date.parse(selection));
	if ( date == 'Invalid Date' ) {
		alert('Cannot interpret "' + selection + '" as a date');
		make_date_form();
		}
	else {
		var formatted_date = date.toISOString().substr(0,10);
		send_date(formatted_date);
	}

}


function heredoc(fn) {
 var a = fn.toString();
 var b = a.slice(14, -3);
 return b;
}
