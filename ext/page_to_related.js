debugger;
var args = get_interstitial_args();
var encoded_uri		= args.encoded_uri;
var unencoded_uri	= args.unencoded_uri;
var doctitle		= args.doctitle;
var host			= args.host;
var img				= args.img;

populate_elements();

add_listeners();

