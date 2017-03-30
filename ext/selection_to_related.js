var args = get_interstitial_args();
var encoded_uri		= args.encoded_uri;
var unencoded_uri	= args.unencoded_uri;
var doctitle		= args.doctitle;
var host			= args.host;
var img				= args.img;

populate_elements();

var start = decodeURIComponent(gup('start'));
var end = decodeURIComponent(gup('end'));
var prefix = decodeURIComponent(gup('prefix'));
var quote = decodeURIComponent(gup('quote'));


document.querySelector('#selection').innerHTML = quote;


add_listeners();