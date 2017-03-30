var text = document.getSelection().toString();
var q = text + ' site:sourcewatch.com site:factcheck.org site:hoax-slayer.com site:truthorfiction.com site:opensecrets.org site:politifact.com site:snopes.com site:www.washingtonpost.com/news/fact-checker/ site:digipo.io' ;
location.href = 'https://duckduckgo.com/?q=' + q;

